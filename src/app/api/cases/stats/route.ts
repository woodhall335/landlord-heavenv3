/**
 * Cases API - Statistics
 *
 * GET /api/cases/stats
 * Returns aggregate statistics for user's cases
 */

import { createServerSupabaseClient, requireServerAuth } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
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
    const inProgress = cases?.filter((c) => (c as any).status === 'in_progress').length || 0;
    const completed = cases?.filter((c) => (c as any).status === 'completed').length || 0;
    const archived = cases?.filter((c) => (c as any).status === 'archived').length || 0;

    // Case type breakdown
    const caseTypeBreakdown = {
      eviction: cases?.filter((c) => (c as any).case_type === 'eviction').length || 0,
      money_claim: cases?.filter((c) => (c as any).case_type === 'money_claim').length || 0,
      tenancy_agreement: cases?.filter((c) => (c as any).case_type === 'tenancy_agreement').length || 0,
    };

    // Jurisdiction breakdown
    const jurisdictionBreakdown = {
      england: cases?.filter((c) => (c as any).jurisdiction === 'england').length || 0,
      wales: cases?.filter((c) => (c as any).jurisdiction === 'wales').length || 0,
      scotland: cases?.filter((c) => (c as any).jurisdiction === 'scotland').length || 0,
      'northern-ireland': cases?.filter((c) => (c as any).jurisdiction === 'northern-ireland').length || 0,
      legacy_england_wales: cases?.filter((c) => (c as any).jurisdiction === 'england-wales').length || 0,
    };

    // Recommended routes (for eviction cases)
    const evictionCases = cases?.filter((c) => (c as any).case_type === 'eviction' && (c as any).recommended_route) || [];
    const recommendedRoutes = {
      section8: evictionCases.filter((c) => (c as any).recommended_route === 'section8').length,
      section21: evictionCases.filter((c) => (c as any).recommended_route === 'section21').length,
      notice_to_leave: evictionCases.filter((c) => (c as any).recommended_route === 'notice_to_leave').length,
    };

    // Average success probability (for cases that have been analyzed)
    const casesWithProbability = cases?.filter((c) => (c as any).success_probability !== null) || [];
    const avgSuccessProbability = casesWithProbability.length > 0
      ? casesWithProbability.reduce((sum, c) => sum + ((c as any).success_probability || 0), 0) / casesWithProbability.length
      : null;

    // Recent activity
    const recentCases = cases
      ?.sort((a, b) => new Date((b as any).updated_at).getTime() - new Date((a as any).updated_at).getTime())
      .slice(0, 5)
      .map((c) => ({
        id: (c as any).id,
        case_type: (c as any).case_type,
        jurisdiction: (c as any).jurisdiction,
        status: (c as any).status,
        wizard_progress: (c as any).wizard_progress,
        updated_at: (c as any).updated_at,
      }));

    // Red flags count
    const totalRedFlags = cases?.reduce((sum, c) => {
      const redFlags = (c as any).red_flags as any;
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
