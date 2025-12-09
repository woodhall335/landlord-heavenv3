/**
 * Wizard API - Get Case
 *
 * GET /api/wizard/case/[caseId]
 * Retrieves a specific case by ID
 */

import { createServerSupabaseClient, requireServerAuth } from '@/lib/supabase/server';
import { NextResponse, NextRequest } from 'next/server';

type RouteParams = { id: string };

export async function GET(
  _request: NextRequest,
  context: { params: Promise<RouteParams> }
) {
  try {
    const { id: caseId } = await context.params;
    const supabase = await createServerSupabaseClient();

    // Try to get a user, but don't fail if unauthenticated
    let user: { id: string } | null = null;
    try {
      user = await requireServerAuth();
    } catch {
      user = null;
    }

    // Base query: case by id
    let query = supabase.from('cases').select('*').eq('id', caseId);

    // If logged in, enforce ownership OR allow anonymous cases (user_id IS NULL)
    if (user) {
      query = query.or(`user_id.eq.${user.id},user_id.is.null`);
    } else {
      // If not logged in, only show anonymous cases
      query = query.is('user_id', null);
    }

    const { data: caseData, error } = await query.single();

    if (error || !caseData) {
      console.error('Case not found or not accessible:', { error, caseId, userId: user?.id });
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
