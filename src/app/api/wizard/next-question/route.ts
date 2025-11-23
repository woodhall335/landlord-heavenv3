/**
 * Wizard API - Get Next Question (AI-Powered)
 *
 * POST /api/wizard/next-question
 * Uses AI fact-finder to determine the next question to ask
 * ALLOWS ANONYMOUS ACCESS
 */

import { getServerUser, createServerSupabaseClient } from '@/lib/supabase/server';
import { getNextQuestion, trackTokenUsage } from '@/lib/ai';
import { NextResponse } from 'next/server';

// Disable caching to prevent HMR issues
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: Request) {
  try {
    // Allow anonymous access - user is optional
    const user = await getServerUser();
    const body = await request.json();

    // Manual validation (avoiding Zod due to Webpack HMR corruption issues)
    const { case_id, case_type, jurisdiction, collected_facts } = body;

    if (!case_id || typeof case_id !== 'string') {
      return NextResponse.json(
        { error: 'Invalid case_id' },
        { status: 400 }
      );
    }

    if (!case_type || !['eviction', 'money_claim', 'tenancy_agreement'].includes(case_type)) {
      return NextResponse.json(
        { error: 'Invalid case_type' },
        { status: 400 }
      );
    }

    if (!jurisdiction || !['england-wales', 'scotland', 'northern-ireland'].includes(jurisdiction)) {
      return NextResponse.json(
        { error: 'Invalid jurisdiction' },
        { status: 400 }
      );
    }

    if (jurisdiction === 'northern-ireland' && case_type !== 'tenancy_agreement') {
      return NextResponse.json(
        { error: 'Eviction and money claim flows are not available in Northern Ireland' },
        { status: 400 }
      );
    }

    if (!collected_facts || typeof collected_facts !== 'object') {
      return NextResponse.json(
        { error: 'Invalid collected_facts' },
        { status: 400 }
      );
    }
    const supabase = await createServerSupabaseClient();

    // Verify case ownership (allow both logged-in users and anonymous)
    // Note: Must use .is() for null checks, not .eq()
    let query = supabase
      .from('cases')
      .select('id, user_id')
      .eq('id', case_id);

    if (user) {
      query = query.eq('user_id', user.id);
    } else {
      query = query.is('user_id', null);
    }

    const { data: caseData, error: caseError } = await query.single();

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

    // Track AI token usage (only if user is logged in)
    if (user) {
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
    }

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
