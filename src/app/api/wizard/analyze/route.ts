/**
 * Wizard API - Analyze
 *
 * POST /api/wizard/analyze
 * Analyzes the case using the decision engine and returns recommendations
 */

import { createServerSupabaseClient, requireServerAuth } from '@/lib/supabase/server';
import { analyzeCase } from '@/lib/decision-engine/engine';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schema
const analyzeSchema = z.object({
  case_id: z.string().uuid(),
});

export async function POST(request: Request) {
  try {
    const user = await requireServerAuth();
    const body = await request.json();

    // Validate input
    const validationResult = analyzeSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { case_id } = validationResult.data;
    const supabase = await createServerSupabaseClient();

    // Fetch case
    const { data: caseData, error: caseError } = await supabase
      .from('cases')
      .select('*')
      .eq('id', case_id)
      .eq('user_id', user.id)
      .single();

    if (caseError || !caseData) {
      console.error('Case not found:', caseError);
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      );
    }

    // Prepare facts for decision engine
    const facts = {
      jurisdiction: caseData.jurisdiction,
      case_type: caseData.case_type,
      ...(caseData.collected_facts as object),
    };

    // Run decision engine analysis
    const analysis = await analyzeCase(facts);

    // Update case with analysis results
    const { data: updatedCase, error: updateError } = await supabase
      .from('cases')
      .update({
        recommended_route: analysis.recommended_route,
        recommended_grounds: analysis.primary_grounds?.map((g) => String(g.ground_number)) || [],
        success_probability: analysis.primary_grounds?.[0]?.success_probability || null,
        red_flags: analysis.red_flags as any,
        compliance_issues: analysis.compliance_check as any,
        wizard_completed_at: new Date().toISOString(),
        wizard_progress: 100,
        updated_at: new Date().toISOString(),
      })
      .eq('id', case_id)
      .select()
      .single();

    if (updateError) {
      console.error('Failed to update case:', updateError);
      return NextResponse.json(
        { error: 'Failed to save analysis' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        case: updatedCase,
        analysis: {
          recommended_route: analysis.recommended_route,
          primary_grounds: analysis.primary_grounds,
          backup_grounds: analysis.backup_grounds,
          success_probability: analysis.overall_success_probability,
          timeline: analysis.timeline,
          cost_estimate: analysis.cost_estimate,
          red_flags: analysis.red_flags,
          compliance_check: analysis.compliance_check,
          overall_risk_level: analysis.overall_risk_level,
          recommended_actions: analysis.recommended_actions,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.message === 'Unauthorized - Please log in') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.error('Analyze case error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
