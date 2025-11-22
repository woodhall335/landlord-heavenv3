/**
 * Cases API - List
 *
 * GET /api/cases
 * Lists all cases for the authenticated user with optional filtering
 */

import { createServerSupabaseClient, requireServerAuth } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const user = await requireServerAuth();
    const { searchParams } = new URL(request.url);
    const supabase = await createServerSupabaseClient();

    // Optional filters
    const caseType = searchParams.get('case_type');
    const jurisdiction = searchParams.get('jurisdiction');
    const status = searchParams.get('status');
    const councilCode = searchParams.get('council_code');

    // Build query
    let query = supabase
      .from('cases')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    // Apply filters
    if (caseType) {
      query = query.eq('case_type', caseType);
    }

    if (jurisdiction) {
      query = query.eq('jurisdiction', jurisdiction);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (councilCode) {
      query = query.eq('council_code', councilCode);
    }

    const { data: cases, error } = await query;

    if (error) {
      console.error('Failed to fetch cases:', error);
      return NextResponse.json(
        { error: 'Failed to fetch cases' },
        { status: 500 }
      );
    }

    // Calculate statistics
    const stats = {
      total: cases?.length || 0,
      in_progress: cases?.filter((c) => c.status === 'in_progress').length || 0,
      completed: cases?.filter((c) => c.status === 'completed').length || 0,
      archived: cases?.filter((c) => c.status === 'archived').length || 0,
    };

    return NextResponse.json(
      {
        success: true,
        cases: cases || [],
        stats,
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

    console.error('List cases error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
