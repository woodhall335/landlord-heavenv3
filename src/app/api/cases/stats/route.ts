/**
 * Cases API - Statistics
 *
 * GET /api/cases/stats
 * Returns aggregate statistics for user's cases
 */

import { createServerSupabaseClient, requireServerAuth } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const user = await requireServerAuth();
    const supabase = await createServerSupabaseClient();

    // Fetch all cases for the user
    const { data: cases, error } = await supabase
      .from('cases')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error('Failed to fetch cases:', error);
      return NextResponse.json(
        { error: 'Failed to fetch case statistics' },
        { status: 500 }
      );
    }

    // Calculate statistics
    const totalCases = cases?.length || 0;
    const inProgress = cases?.filter((c) => c.status === 'in_progress').length || 0;
    const completed = cases?.filter((c) => c.status === 'completed').length || 0;
    const archived = cases?.filter((c) => c.status === 'archived').length || 0;

    // Case type breakdown
    const caseTypeBreakdown = {
      eviction: cases?.filter((c) => c.case_type === 'eviction').length || 0,
      money_claim: cases?.filter((c) => c.case_type === 'money_claim').length || 0,
      tenancy_agreement: cases?.filter((c) => c.case_type === 'tenancy_agreement').length || 0,
    };

    // Jurisdiction breakdown
    const jurisdictionBreakdown = {
      'england-wales': cases?.filter((c) => c.jurisdiction === 'england-wales').length || 0,
      scotland: cases?.filter((c) => c.jurisdiction === 'scotland').length || 0,
      'northern-ireland': cases?.filter((c) => c.jurisdiction === 'northern-ireland').length || 0,
    };

    // Recommended routes (for eviction cases)
    const evictionCases = cases?.filter((c) => c.case_type === 'eviction' && c.recommended_route) || [];
    const recommendedRoutes = {
      section8: evictionCases.filter((c) => c.recommended_route === 'section8').length,
      section21: evictionCases.filter((c) => c.recommended_route === 'section21').length,
      notice_to_leave: evictionCases.filter((c) => c.recommended_route === 'notice_to_leave').length,
    };

    // Average success probability (for cases that have been analyzed)
    const casesWithProbability = cases?.filter((c) => c.success_probability !== null) || [];
    const avgSuccessProbability = casesWithProbability.length > 0
      ? casesWithProbability.reduce((sum, c) => sum + (c.success_probability || 0), 0) / casesWithProbability.length
      : null;

    // Recent activity
    const recentCases = cases
      ?.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 5)
      .map((c) => ({
        id: c.id,
        case_type: c.case_type,
        jurisdiction: c.jurisdiction,
        status: c.status,
        wizard_progress: c.wizard_progress,
        updated_at: c.updated_at,
      }));

    // Red flags count
    const totalRedFlags = cases?.reduce((sum, c) => {
      const redFlags = c.red_flags as any;
      return sum + (Array.isArray(redFlags) ? redFlags.length : 0);
    }, 0) || 0;

    return NextResponse.json(
      {
        success: true,
        stats: {
          overview: {
            total: totalCases,
            in_progress: inProgress,
            completed: completed,
            archived: archived,
          },
          by_type: caseTypeBreakdown,
          by_jurisdiction: jurisdictionBreakdown,
          recommended_routes: recommendedRoutes,
          avg_success_probability: avgSuccessProbability,
          total_red_flags: totalRedFlags,
        },
        recent_cases: recentCases,
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

    console.error('Get case stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
