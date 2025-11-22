/**
 * Wizard API - Get Next Question (AI-Powered)
 *
 * POST /api/wizard/next-question
 * Uses AI fact-finder to determine the next question to ask
 */

import { requireServerAuth, createServerSupabaseClient } from '@/lib/supabase/server';
import { getNextQuestion, trackTokenUsage } from '@/lib/ai';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const nextQuestionSchema = z.object({
  case_id: z.string().uuid(),
  case_type: z.enum(['eviction', 'money_claim', 'tenancy_agreement']),
  jurisdiction: z.enum(['england-wales', 'scotland', 'northern-ireland']),
  collected_facts: z.record(z.any()),
});

export async function POST(request: Request) {
  try {
    const user = await requireServerAuth();
    const body = await request.json();

    // Validate input
    const validationResult = nextQuestionSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { case_id, case_type, jurisdiction, collected_facts } = validationResult.data;
    const supabase = await createServerSupabaseClient();

    // Verify case ownership
    const { data: caseData, error: caseError } = await supabase
      .from('cases')
      .select('id, user_id')
      .eq('id', case_id)
      .eq('user_id', user.id)
      .single();

    if (caseError || !caseData) {
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      );
    }

    // Call AI fact-finder to get next question
    const aiResponse = await getNextQuestion({
      case_type,
      jurisdiction,
      collected_facts,
    });

    // Track AI token usage
    await trackTokenUsage({
      user_id: user.id,
      model: 'gpt-4o-mini',
      operation: 'fact_finding',
      prompt_tokens: aiResponse.usage.prompt_tokens,
      completion_tokens: aiResponse.usage.completion_tokens,
      total_tokens: aiResponse.usage.total_tokens,
      cost_usd: aiResponse.usage.cost_usd,
      case_id,
    });

    // Return next question or completion status
    return NextResponse.json({
      success: true,
      next_question: aiResponse.next_question,
      is_complete: aiResponse.is_complete,
      missing_critical_facts: aiResponse.missing_critical_facts,
      ai_cost: aiResponse.usage.cost_usd,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized - Please log in') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.error('Next question error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
