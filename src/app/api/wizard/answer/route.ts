/**
 * Wizard API - Submit Answer
 *
 * POST /api/wizard/answer
 * Saves user's answer to the wizard and updates case facts
 * ALLOWS ANONYMOUS ACCESS
 */

import { createServerSupabaseClient, getServerUser } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { loadMQS, findQuestionById } from '@/lib/wizard/mqs-loader';
import { enhanceAnswer } from '@/lib/ai/ask-heaven';
import type { ProductType } from '@/lib/wizard/types';

// Validation schema
const answerSchema = z.object({
  case_id: z.string().uuid(),
  question_id: z.string(),
  answer: z.any(), // Can be any type (string, number, boolean, array, object)
  progress: z.number().min(0).max(100).optional(),
});

export async function POST(request: Request) {
  try {
    // Allow anonymous access - user is optional
    const user = await getServerUser();
    const body = await request.json();

    // Validate input
    const validationResult = answerSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { case_id, question_id, answer, progress } = validationResult.data;
    const supabase = await createServerSupabaseClient();

    // Fetch current case (allow both logged-in users and anonymous)
    // Note: Must use .is() for null checks, not .eq()
    let query = supabase
      .from('cases')
      .select('*')
      .eq('id', case_id);

    if (user) {
      query = query.eq('user_id', user.id);
    } else {
      query = query.is('user_id', null);
    }

    const { data: currentCase, error: fetchError } = await query.single();

    if (fetchError || !currentCase) {
      console.error('Case not found:', fetchError);
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      );
    }

    // Get current facts
    const currentFacts = (currentCase.collected_facts as any) || {};

    // Check if we should use Ask Heaven (MQS-based flow)
    const product = currentFacts?.__meta?.product as ProductType | null;
    const shouldUseMQS =
      currentCase.jurisdiction === 'england-wales' &&
      currentCase.case_type === 'eviction' &&
      (product === 'notice_only' || product === 'complete_pack');

    let enhancedAnswer = null;
    let answerValue = answer;

    // Try Ask Heaven enhancement for MQS flows
    if (shouldUseMQS && product) {
      const mqs = loadMQS(product, currentCase.jurisdiction);

      if (mqs) {
        const question = findQuestionById(mqs, question_id);

        if (question && question.suggestion_prompt) {
          console.log(`[Answer] Calling Ask Heaven for question: ${question_id}`);

          try {
            enhancedAnswer = await enhanceAnswer({
              question,
              rawAnswer: typeof answer === 'string' ? answer : JSON.stringify(answer),
              jurisdiction: currentCase.jurisdiction,
              product,
              caseType: currentCase.case_type,
              collectedFacts: currentFacts,
            });

            if (enhancedAnswer) {
              // Store as structured object with raw + suggested
              answerValue = {
                raw: answer,
                suggested: enhancedAnswer.suggested_wording,
                missing_information: enhancedAnswer.missing_information,
                evidence_suggestions: enhancedAnswer.evidence_suggestions,
              };
              console.log(`[Answer] Ask Heaven enhanced answer for ${question_id}`);
            }
          } catch (error) {
            console.error('[Answer] Ask Heaven failed:', error);
            // Continue with raw answer if enhancement fails
          }
        }
      }
    }

    // Merge new answer with existing facts
    const updatedFacts = {
      ...currentFacts,
      [question_id]: answerValue,
    };

    // Update case with new facts
    const { data: updatedCase, error: updateError } = await supabase
      .from('cases')
      .update({
        collected_facts: updatedFacts as any,
        wizard_progress: progress !== undefined ? progress : currentCase.wizard_progress,
        updated_at: new Date().toISOString(),
      })
      .eq('id', case_id)
      .select()
      .single();

    if (updateError) {
      console.error('Failed to update case:', updateError);
      return NextResponse.json(
        { error: 'Failed to save answer' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        case: updatedCase,
        message: 'Answer saved successfully',
        enhanced_answer: enhancedAnswer ? updatedFacts[question_id] : null,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Save answer error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
