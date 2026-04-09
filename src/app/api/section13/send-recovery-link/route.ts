import { NextResponse } from 'next/server';
import { z } from 'zod';

import { assertCaseWriteAccess } from '@/lib/auth/case-access';
import { sendSection13RecoveryLinkEmail } from '@/lib/email/resend';
import { createSection13RecoveryToken } from '@/lib/section13/server';
import { createSupabaseAdminClient, logSupabaseAdminDiagnostics } from '@/lib/supabase/admin';
import { getServerUser } from '@/lib/supabase/server';

export const runtime = 'nodejs';

const payloadSchema = z.object({
  caseId: z.string().uuid(),
  email: z.string().email(),
});

export async function POST(request: Request) {
  try {
    logSupabaseAdminDiagnostics({ route: '/api/section13/send-recovery-link', writesUsingAdmin: true });
    const user = await getServerUser().catch(() => null);
    const body = await request.json();
    const parsed = payloadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { caseId, email } = parsed.data;
    const supabase = createSupabaseAdminClient();
    const { data: caseRow, error: caseError } = await supabase
      .from('cases')
      .select('*')
      .eq('id', caseId)
      .single();

    if (caseError || !caseRow) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    const accessError = assertCaseWriteAccess({
      request,
      user,
      caseRow: caseRow as { user_id: string | null; session_token?: string | null },
    });
    if (accessError) return accessError;

    if ((caseRow as any).case_type !== 'rent_increase') {
      return NextResponse.json({ error: 'Case is not a Section 13 case' }, { status: 400 });
    }

    const { token, tokenHash } = createSection13RecoveryToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    await supabase
      .from('case_recovery_tokens')
      .insert({
        case_id: caseId,
        email,
        token_hash: tokenHash,
        expires_at: expiresAt,
        metadata: {
          kind: 'section13_recovery',
        },
      } as any);

    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.NODE_ENV === 'production'
        ? 'https://landlordheaven.co.uk'
        : 'http://localhost:5000');
    const resumeUrl = `${baseUrl}/wizard/flow?type=rent_increase&jurisdiction=england&case_id=${caseId}&recovery_token=${token}`;
    const propertyAddress =
      (caseRow as any).collected_facts?.section13?.tenancy?.propertyAddressLine1 ||
      (caseRow as any).collected_facts?.property_address ||
      null;

    const emailResult = await sendSection13RecoveryLinkEmail({
      to: email,
      resumeUrl,
      propertyAddress,
    });

    return NextResponse.json({
      success: emailResult.success,
      resumeUrl,
      emailSent: emailResult.success,
      warning: emailResult.success ? null : emailResult.error || 'Recovery email could not be sent.',
    });
  } catch (error: any) {
    console.error('[section13/send-recovery-link] error', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to send recovery link' },
      { status: 500 }
    );
  }
}
