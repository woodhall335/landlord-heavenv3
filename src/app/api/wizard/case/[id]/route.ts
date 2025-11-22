/**
 * Wizard API - Get Case
 *
 * GET /api/wizard/case/[id]
 * Retrieves a specific case by ID
 */

import { createServerSupabaseClient, requireServerAuth } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireServerAuth();
    const { id } = await params;
    const supabase = await createServerSupabaseClient();

    // Fetch case
    const { data: caseData, error } = await supabase
      .from('cases')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error || !caseData) {
      console.error('Case not found:', error);
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        case: caseData,
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

    console.error('Get case error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
