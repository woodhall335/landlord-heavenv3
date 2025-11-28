/**
 * Wizard API - Submit Answer
 *
 * POST /api/wizard/answer
 * Saves user's answer to the wizard and updates case facts
 * ALLOWS ANONYMOUS ACCESS
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient, getServerUser } from '@/lib/supabase/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { loadMQS, getNextMQSQuestion, type ProductType, type MasterQuestionSet } from '@/lib/wizard/mqs-loader';
import { applyMappedAnswers, setFactPath } from '@/lib/case-facts/mapping';
import { updateCaseFacts, getOrCreateCaseFacts } from '@/lib/case-facts/store';
import { enhanceAnswer } from '@/lib/ai/ask-heaven';
import type { ExtendedWizardQuestion } from '@/lib/wizard/types';
import type { Database } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const answerSchema = z.object({
  case_id: z.string().uuid(),
  question_id: z.string(),
  answer: z.any(),
});

function deriveProduct(caseType: string, collectedFacts: Record<string, any>): ProductType {
  const metaProduct = collectedFacts?.__meta?.product as ProductType | undefined;
  if (metaProduct) return metaProduct;
  if (caseType === 'money_claim') return 'money_claim';
  if (caseType === 'tenancy_agreement') return 'tenancy_agreement';
  return 'complete_pack';
}

function getValueAtPath(facts: Record<string, any>, path: string): unknown {
  return path
    .split('.')
    .filter(Boolean)
    .reduce((acc: any, key) => {
      if (acc === undefined || acc === null) return undefined;
      const resolvedKey = Number.isInteger(Number(key)) ? Number(key) : key;
      return acc[resolvedKey as keyof typeof acc];
    }, facts);
}

function isQuestionAnswered(question: ExtendedWizardQuestion, facts: Record<string, any>): boolean {
  if (question.maps_to && question.maps_to.length > 0) {
    return question.maps_to.every((path) => {
      const value = getValueAtPath(facts, path);
      if (value === null || value === undefined) return false;
      if (typeof value === 'string') return value.trim().length > 0;
      return true;
    });
  }

  // For questions without maps_to, check if answered directly by question ID
  const fallbackValue = facts[question.id];
  if (fallbackValue === null || fallbackValue === undefined) return false;
  if (typeof fallbackValue === 'string') return fallbackValue.trim().length > 0;
  return true;
}

function computeProgress(mqs: MasterQuestionSet, facts: Record<string, any>): number {
  if (!mqs.questions.length) return 100;
  const answeredCount = mqs.questions.filter((q) => isQuestionAnswered(q, facts)).length;
  return Math.round((answeredCount / mqs.questions.length) * 100);
}

function normalizeAnswer(question: ExtendedWizardQuestion, answer: any) {
  if (question.inputType === 'yes_no') {
    if (typeof answer === 'string') {
      return answer.toLowerCase().startsWith('y');
    }
    return Boolean(answer);
  }

  return answer;
}

function validateAnswer(question: ExtendedWizardQuestion, answer: any): boolean {
  if (question.validation?.required) {
    if (answer === null || answer === undefined || answer === '') return false;
  }

  if (question.inputType === 'group' && question.fields) {
    return question.fields.every((field) => {
      if (!field.validation?.required) return true;
      const value = (answer || {})[field.id];
      return value !== null && value !== undefined && value !== '';
    });
  }

  return true;
}

function updateDerivedFacts(
  questionId: string,
  jurisdiction: string,
  facts: Record<string, any>,
  value: any
): Record<string, any> {
  let updatedFacts = { ...facts };

  if (questionId === 'tenancy_type') {
    if (typeof value === 'string' && value.toLowerCase().includes('prt')) {
      updatedFacts = setFactPath(updatedFacts as any, 'tenancy.tenancy_type', 'prt');
    }
  }

  if (questionId === 'property_details' && jurisdiction) {
    updatedFacts = setFactPath(updatedFacts as any, 'property.country', jurisdiction);
  }

  if (questionId === 'arrears_total' || questionId === 'arrears_amount') {
    const numericValue = typeof value === 'number' ? value : Number(value);
    if (!Number.isNaN(numericValue)) {
      updatedFacts = setFactPath(
        updatedFacts as any,
        'issues.rent_arrears.has_arrears',
        numericValue > 0
      );
    }
  }

  if (questionId === 'rent_arrears') {
    updatedFacts = setFactPath(
      updatedFacts as any,
      'issues.rent_arrears.has_arrears',
      Boolean(value)
    );
  }

  return updatedFacts;
}

export async function POST(request: Request) {
  try {
    const user = await getServerUser().catch(() => null);
    const body = await request.json();
    const validationResult = answerSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { case_id, question_id, answer } = validationResult.data;

    const supabase: SupabaseClient<Database> = await createServerSupabaseClient();

    // ---------------------------------------
    // 1. Load case with RLS-respecting query
    // ---------------------------------------
    let query = supabase.from('cases').select('*').eq('id', case_id);
    if (user) {
      query = query.eq('user_id', user.id);
    } else {
      query = query.is('user_id', null);
    }

    const { data: caseData, error: fetchError } = await query.single<
      Database['public']['Tables']['cases']['Row']
    >();

    if (fetchError || !caseData) {
      console.error('Case not found:', fetchError);
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    const caseRow = caseData;

    const collectedFacts = (caseRow.collected_facts as Record<string, any>) || {};
    const product = deriveProduct(caseRow.case_type as string, collectedFacts);
    const mqs = loadMQS(product, caseRow.jurisdiction as string);

    if (!mqs) {
      return NextResponse.json(
        { error: 'MQS not implemented for this jurisdiction yet' },
        { status: 400 }
      );
    }

    const question = mqs.questions.find((q) => q.id === question_id);

    if (!question) {
      return NextResponse.json({ error: 'Unknown question_id' }, { status: 400 });
    }

    const normalizedAnswer = normalizeAnswer(question, answer);

    if (!validateAnswer(question, normalizedAnswer)) {
      return NextResponse.json({ error: 'Answer failed validation' }, { status: 400 });
    }

    // ---------------------------------------
    // 2. Merge into CaseFacts
    // ---------------------------------------
    const currentFacts = await getOrCreateCaseFacts(supabase, case_id);
    let mergedFacts = applyMappedAnswers(
      currentFacts as any,
      question.maps_to,
      normalizedAnswer
    );

    if (!question.maps_to || question.maps_to.length === 0) {
      mergedFacts = setFactPath(mergedFacts as any, question_id, normalizedAnswer);
    }

    mergedFacts = updateDerivedFacts(
      question_id,
      caseRow.jurisdiction as string,
      mergedFacts as any,
      normalizedAnswer
    ) as any;

    const newFacts = await updateCaseFacts(
      supabase,
      case_id,
      () => mergedFacts as any,
      { meta: collectedFacts.__meta }
    );

        // ---------------------------------------
    // 3. Log conversation (user + assistant)
    // ---------------------------------------
    const rawAnswerText =
      typeof normalizedAnswer === 'string'
        ? normalizedAnswer
        : JSON.stringify(normalizedAnswer);

    // Log the user message – DO NOT let failures here break the flow
    try {
      await supabase.from('conversations').insert({
        case_id,
        role: 'user',
        content: rawAnswerText,
        question_id,
        input_type: question.inputType ?? null,
        user_input: normalizedAnswer,
      });
    } catch (convErr) {
      console.error('Failed to insert user conversation row:', convErr);
    }

    // Call Ask Heaven, but treat all errors as non-fatal
    let enhanced: Awaited<ReturnType<typeof enhanceAnswer>> | null = null;
    try {
      enhanced = await enhanceAnswer({
        question,
        rawAnswer: rawAnswerText,
        jurisdiction: caseRow.jurisdiction as string,
        product,
        caseType: caseRow.case_type as string,
      });
    } catch (enhErr) {
      console.error('enhanceAnswer failed, proceeding without suggestions:', enhErr);
      enhanced = null;
    }

    if (enhanced) {
      try {
        await supabase
          .from('conversations')
          .insert({
            case_id,
            role: 'assistant',
            content: enhanced.suggested_wording,
            question_id,
            model: 'ask-heaven',
            user_input: normalizedAnswer,
          });
      } catch (convErr) {
        console.error('Failed to insert assistant conversation row:', convErr);
      }
    }


    // ---------------------------------------
    // 4. Determine next question + progress
    // ---------------------------------------
    const nextQuestion = getNextMQSQuestion(mqs, newFacts as any);
    const progress = computeProgress(mqs, newFacts as any);
    const isComplete = !nextQuestion;

    await supabase
      .from('cases')
      .update({
        wizard_progress: isComplete ? 100 : progress,
        wizard_completed_at: isComplete ? new Date().toISOString() : null,
      })
      .eq('id', case_id);

    return NextResponse.json({
      case_id,
      question_id,
      answer_saved: true,
      suggested_wording: enhanced?.suggested_wording ?? null,
      missing_information: enhanced?.missing_information ?? [],
      evidence_suggestions: enhanced?.evidence_suggestions ?? [],
      next_question: nextQuestion ?? null,
      is_complete: isComplete,
      progress: isComplete ? 100 : progress,
    });
  } catch (error: any) {
    console.error('Save answer error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
