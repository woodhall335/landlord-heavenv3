/**
 * Link Case to User API
 *
 * POST /api/cases/[id]/link
 * Links an anonymous case to authenticated user
 */

import { createServerSupabaseClient, getServerUser } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getServerUser();
    const { id } = await params;

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // Get the case
    const { data: caseData, error: fetchError } = await supabase
      .from('cases')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !caseData) {
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      );
    }

    // Link case to user (update user_id, clear anonymous_user_id)
    const { data: linkedCase, error: updateError } = await supabase
      .from('cases')
      .update({
        user_id: user.id,
        anonymous_user_id: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Failed to link case:', updateError);
      return NextResponse.json(
        { error: 'Failed to link case to user' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        case: linkedCase,
        message: 'Case successfully linked to your account',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Link case error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
