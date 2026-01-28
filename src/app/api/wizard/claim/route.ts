/**
 * Wizard API - Claim Case Ownership
 *
 * POST /api/wizard/claim
 * Attaches an anonymous case to the authenticated user.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireServerAuth } from '@/lib/supabase/server';
import { createSupabaseAdminClient, logSupabaseAdminDiagnostics } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

const claimSchema = z.object({
  caseId: z.string().uuid(),
});

export async function POST(request: Request) {
  try {
    logSupabaseAdminDiagnostics({ route: '/api/wizard/claim', writesUsingAdmin: true });
    const user = await requireServerAuth();
    const body = await request.json();
    const validation = claimSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'caseId is required and must be a valid UUID' },
        { status: 400 },
      );
    }

    const { caseId } = validation.data;
    const adminSupabase = createSupabaseAdminClient();

    const { data: caseRow, error: caseError } = await adminSupabase
      .from('cases')
      .select('id, user_id')
      .eq('id', caseId)
      .single();

    if (caseError || !caseRow) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    if (caseRow.user_id && caseRow.user_id !== user.id) {
      return NextResponse.json({ error: 'Case already claimed' }, { status: 403 });
    }

    if (caseRow.user_id === user.id) {
      return NextResponse.json({ success: true, caseId, claimed: true }, { status: 200 });
    }

    const { error: updateError } = await adminSupabase
      .from('cases')
      .update({ user_id: user.id })
      .eq('id', caseId)
      .is('user_id', null);

    if (updateError) {
      console.error('Failed to claim case', updateError);
      return NextResponse.json({ error: 'Failed to claim case' }, { status: 500 });
    }

    return NextResponse.json({ success: true, caseId, claimed: true }, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Claim case error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
