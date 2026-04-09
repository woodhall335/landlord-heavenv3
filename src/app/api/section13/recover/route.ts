import crypto from 'crypto';

import { NextResponse } from 'next/server';
import { z } from 'zod';

import { getSessionTokenFromRequest } from '@/lib/auth/case-access';
import { createSupabaseAdminClient, logSupabaseAdminDiagnostics } from '@/lib/supabase/admin';
import { getServerUser } from '@/lib/supabase/server';

export const runtime = 'nodejs';

const payloadSchema = z.object({
  caseId: z.string().uuid(),
  recoveryToken: z.string().min(20),
});

export async function POST(request: Request) {
  try {
    logSupabaseAdminDiagnostics({ route: '/api/section13/recover', writesUsingAdmin: true });
    const requestSessionToken = getSessionTokenFromRequest(request);
    const user = await getServerUser().catch(() => null);
    const body = await request.json();
    const parsed = payloadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      );
    }

    if (!requestSessionToken) {
      return NextResponse.json(
        { error: 'A browser session token is required before the recovery link can be used.' },
        { status: 400 }
      );
    }

    const { caseId, recoveryToken } = parsed.data;
    const supabase = createSupabaseAdminClient();
    const { data: caseRow, error: caseError } = await supabase
      .from('cases')
      .select('id, user_id, session_token, case_type')
      .eq('id', caseId)
      .single();

    if (caseError || !caseRow) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    if ((caseRow as any).case_type !== 'rent_increase') {
      return NextResponse.json({ error: 'Case is not a Section 13 case' }, { status: 400 });
    }

    if ((caseRow as any).user_id) {
      if (!user || (caseRow as any).user_id !== user.id) {
        return NextResponse.json({ error: 'Case not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true, recovered: true, alreadyAccessible: true });
    }

    const tokenHash = crypto.createHash('sha256').update(recoveryToken).digest('hex');
    const { data: tokenRow, error: tokenError } = await supabase
      .from('case_recovery_tokens')
      .select('id, expires_at, used_at')
      .eq('case_id', caseId)
      .eq('token_hash', tokenHash)
      .maybeSingle();

    if (tokenError || !tokenRow) {
      return NextResponse.json({ error: 'Recovery link is invalid or has expired.' }, { status: 400 });
    }

    if ((tokenRow as any).used_at) {
      return NextResponse.json({ error: 'This recovery link has already been used.' }, { status: 400 });
    }

    if (new Date((tokenRow as any).expires_at).getTime() < Date.now()) {
      return NextResponse.json({ error: 'This recovery link has expired.' }, { status: 400 });
    }

    await supabase
      .from('cases')
      .update({
        session_token: requestSessionToken,
        updated_at: new Date().toISOString(),
      } as any)
      .eq('id', caseId);

    await supabase
      .from('case_recovery_tokens')
      .update({
        used_at: new Date().toISOString(),
      } as any)
      .eq('id', (tokenRow as any).id);

    return NextResponse.json({
      success: true,
      recovered: true,
      alreadyAccessible: false,
    });
  } catch (error: any) {
    console.error('[section13/recover] error', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to recover draft' },
      { status: 500 }
    );
  }
}
