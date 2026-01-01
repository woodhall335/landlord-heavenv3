/**
 * Wizard API - Get Case
 *
 * GET /api/wizard/case/[caseId]
 * Retrieves a specific case by ID
 * ALLOWS ANONYMOUS ACCESS - Users can access their anonymous cases
 */

import { createAdminClient, getServerUser } from '@/lib/supabase/server';
import { NextResponse, NextRequest } from 'next/server';

type RouteParams = { id: string };

export async function GET(
  _request: NextRequest,
  context: { params: Promise<RouteParams> }
) {
  try {
    const { id: caseId } = await context.params;

    // Use admin client to bypass RLS - we do our own access control below
    const adminSupabase = createAdminClient();

    // Try to get a user, but don't fail if unauthenticated
    const user = await getServerUser();

    // Fetch the case using admin client (bypasses RLS)
    const { data: caseData, error } = await adminSupabase
      .from('cases')
      .select('*')
      .eq('id', caseId)
      .single();

    if (error || !caseData) {
      console.error('Case not found:', { error, caseId });
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    // Manual access control: user can access if:
    // 1. They own the case (user_id matches)
    // 2. The case is anonymous (user_id is null) - anyone can access
    const isOwner = user && caseData.user_id === user.id;
    const isAnonymousCase = caseData.user_id === null;

    if (!isOwner && !isAnonymousCase) {
      console.error('Access denied to case:', { caseId, userId: user?.id, caseUserId: caseData.user_id });
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    return NextResponse.json(
      {
        success: true,
        case: caseData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get case error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
