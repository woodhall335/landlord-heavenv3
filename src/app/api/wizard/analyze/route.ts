/**
 * Wizard API - Analyze
 *
 * POST /api/wizard/analyze
 * Analyzes the case using the decision engine and returns recommendations
 * ALLOWS ANONYMOUS ACCESS
 */

import { createServerSupabaseClient, getServerUser } from '@/lib/supabase/server';
import { analyzeCase } from '@/lib/decision-engine/engine';
import { detectHMO, shouldShowHMOUpsell } from '@/lib/utils/hmo-detection';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schema
const analyzeSchema = z.object({
  case_id: z.string().uuid(),
  collected_facts: z.record(z.any()).optional(), // Optional facts to save
});

export async function POST(request: Request) {
  try {
    // Allow anonymous access - user is optional
    const user = await getServerUser();
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

    const { case_id, collected_facts } = validationResult.data;
    const supabase = await createServerSupabaseClient();

    // Fetch case (allow both logged-in users and anonymous)
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

    const { data: caseData, error: caseError } = await query.single();

    if (caseError || !caseData) {
      console.error('Case not found:', caseError);
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      );
    }

    // Merge collected_facts if provided
    const mergedFacts = collected_facts
      ? { ...(caseData.collected_facts as object || {}), ...collected_facts }
      : (caseData.collected_facts as object || {});

    // Prepare facts for decision engine
    const facts = {
      jurisdiction: caseData.jurisdiction,
      case_type: caseData.case_type,
      ...mergedFacts,
    };

    // Run decision engine analysis
    const analysis = await analyzeCase(facts);

    // Detect if property is likely an HMO
    const hmoDetection = detectHMO(caseData.collected_facts as Record<string, any>);
    const showHMOUpsell = shouldShowHMOUpsell(hmoDetection);

    // Convert success_probability string to number for database
    const convertSuccessProbability = (prob: string | number | undefined): number | null => {
      if (typeof prob === 'number') return prob;
      if (!prob) return null;

      const mapping: Record<string, number> = {
        'very_high': 90,
        'high': 75,
        'medium': 50,
        'low': 25,
        'none': 0,
      };

      return mapping[prob] || null;
    };

    // Update case with analysis results and collected_facts
    const updateData: any = {
      recommended_route: analysis.recommended_route,
      recommended_grounds: analysis.primary_grounds?.map((g) => String(g.ground_number)) || [],
      success_probability: convertSuccessProbability(analysis.primary_grounds?.[0]?.success_probability),
      red_flags: analysis.red_flags as any,
      compliance_issues: analysis.compliance_check as any,
      wizard_completed_at: new Date().toISOString(),
      wizard_progress: 100,
      updated_at: new Date().toISOString(),
    };

    // Update collected_facts if provided
    if (collected_facts) {
      updateData.collected_facts = mergedFacts;
    }

    const { data: updatedCase, error: updateError} = await supabase
      .from('cases')
      .update(updateData)
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
        hmo_detection: hmoDetection,
        show_hmo_upsell: showHMOUpsell,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Analyze case error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
