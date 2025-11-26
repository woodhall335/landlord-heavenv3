/**
 * Wizard API - Get Next MQS Question
 *
 * POST /api/wizard/next-question
 * Uses deterministic MQS flows (no AI) to find the next unanswered question
 * ALLOWS ANONYMOUS ACCESS
 */

import { NextResponse } from 'next/server';
import { createServerSupabaseClient, getServerUser } from '@/lib/supabase/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getNextMQSQuestion, loadMQS, type MasterQuestionSet, type ProductType } from '@/lib/wizard/mqs-loader';
import { getOrCreateCaseFacts } from '@/lib/case-facts/store';
import type { ExtendedWizardQuestion } from '@/lib/wizard/types';
import type { Database } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

function deriveProduct(caseType: string, collectedFacts: Record<string, any>): ProductType {
  const metaProduct = collectedFacts?.__meta?.product as ProductType | undefined;
  if (metaProduct) return metaProduct;
  if (caseType === 'money_claim') return 'money_claim';
  if (caseType === 'tenancy_agreement') return 'tenancy_agreement';
  return 'complete_pack';
}

function computeProgress(mqs: MasterQuestionSet, facts: Record<string, any>): number {
  if (!mqs.questions.length) return 100;
  const answeredCount = mqs.questions.filter((q) => isQuestionAnswered(q, facts)).length;
  return Math.round((answeredCount / mqs.questions.length) * 100);
}

export async function POST(request: Request) {
  try {
    const user = await getServerUser().catch(() => null);
    const { case_id } = await request.json();

    if (!case_id || typeof case_id !== 'string') {
      return NextResponse.json({ error: 'Invalid case_id' }, { status: 400 });
    }

    const supabase: SupabaseClient<Database> = await createServerSupabaseClient();

    let query = supabase.from('cases').select('*').eq('id', case_id);
    if (user) {
      query = query.eq('user_id', user.id);
    } else {
      query = query.is('user_id', null);
    }

    const { data: caseData, error: caseError } = await query.single();

    if (caseError || !caseData) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    const caseRow = caseData;

    const product = deriveProduct(
      caseRow.case_type as string,
      (caseRow.collected_facts as Record<string, any>) || {}
    );
    const mqs = loadMQS(product, caseRow.jurisdiction as string);

    if (!mqs) {
      return NextResponse.json(
        { error: 'MQS not implemented for this jurisdiction yet' },
        { status: 400 }
      );
    }

    const facts = await getOrCreateCaseFacts(supabase, case_id);
    const nextQuestion = getNextMQSQuestion(mqs, facts as any);

    if (!nextQuestion) {
      await supabase
        .from('cases')
        .update({ wizard_progress: 100, wizard_completed_at: new Date().toISOString() })
        .eq('id', case_id);

      return NextResponse.json({
        next_question: null,
        is_complete: true,
        progress: 100,
      });
    }

    const progress = computeProgress(mqs, facts as any);

    await supabase
      .from('cases')
      .update({ wizard_progress: progress })
      .eq('id', case_id);

    return NextResponse.json({
      next_question: nextQuestion,
      is_complete: false,
      progress,
    });
  } catch (error: any) {
    if (error?.message === 'Unauthorized - Please log in') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.error('Next question error:', error);
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 });
  }
}
