import { NextRequest, NextResponse } from 'next/server';

import { isAdmin } from '@/lib/auth';
import {
  CASE_PREVIEW_RECOVERY_ATTEMPT_EVENT_TYPES,
  CASE_PREVIEW_RECOVERY_FAILED_EVENT_TYPES,
  CASE_PREVIEW_RECOVERY_SENT_EVENT_TYPES,
  deriveCaseRecoveryContact,
  isPreviewAbandonedCase,
} from '@/lib/cases/recovery';
import { createCaseRecoveryLink } from '@/lib/cases/recovery-server';
import { sendCasePreviewRecoveryEmail } from '@/lib/email/resend';
import { createAdminClient, requireServerAuth } from '@/lib/supabase/server';

export const runtime = 'nodejs';

type RouteContext = {
  params: Promise<{ id: string }>;
};

function pickBestOrder(current: any | null, candidate: any): any {
  if (!current) return candidate;
  if (candidate.payment_status === 'paid' && current.payment_status !== 'paid') return candidate;
  if (current.payment_status === 'paid' && candidate.payment_status !== 'paid') return current;
  return new Date(candidate.created_at).getTime() > new Date(current.created_at).getTime()
    ? candidate
    : current;
}

export async function POST(_request: NextRequest, context: RouteContext) {
  try {
    const user = await requireServerAuth();
    if (!isAdmin(user.id)) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
    }

    const { id: caseId } = await context.params;
    const supabase = createAdminClient();
    const { data: caseRow, error: caseError } = await supabase
      .from('cases')
      .select(
        'id, user_id, case_type, jurisdiction, status, workflow_status, wizard_progress, wizard_completed_at, collected_facts, created_at, updated_at'
      )
      .eq('id', caseId)
      .single();

    if (caseError || !caseRow) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    const [{ data: orderRows, error: ordersError }, { data: documentRows, error: documentsError }] =
      await Promise.all([
        supabase
          .from('orders')
          .select('id, case_id, user_id, product_type, payment_status, created_at')
          .eq('case_id', caseId)
          .order('created_at', { ascending: false }),
        supabase.from('documents').select('id, is_preview').eq('case_id', caseId),
      ]);

    if (ordersError) {
      return NextResponse.json({ error: 'Failed to fetch case orders' }, { status: 500 });
    }
    if (documentsError) {
      return NextResponse.json({ error: 'Failed to fetch case documents' }, { status: 500 });
    }

    const relatedOrder = (orderRows || []).reduce<any | null>(pickBestOrder, null);
    const hasFinalDocuments = (documentRows || []).some((document: any) => !document.is_preview);
    const hasPreviewDocuments = (documentRows || []).some((document: any) => Boolean(document.is_preview));

    if (
      !isPreviewAbandonedCase({
        caseItem: caseRow as any,
        order: relatedOrder,
        hasFinalDocuments,
        hasPreviewDocuments,
      })
    ) {
      return NextResponse.json(
        { error: 'Restart links can only be sent for unpaid preview-abandoned cases' },
        { status: 400 }
      );
    }

    const { data: caseUser } = (caseRow as any).user_id
      ? await supabase
          .from('users')
          .select('email, full_name')
          .eq('id', (caseRow as any).user_id)
          .maybeSingle()
      : { data: null };
    const contact = deriveCaseRecoveryContact(caseRow as any, caseUser as any);

    if (!contact.email) {
      return NextResponse.json({ error: 'This case does not have a usable email address' }, { status: 400 });
    }

    const recovery = await createCaseRecoveryLink({
      supabase: supabase as any,
      caseRow: caseRow as any,
      email: contact.email,
      orderRow: relatedOrder,
      stage: 'manual',
      source: 'admin:cases',
    });

    const attemptEvent = await supabase.from('email_events').insert({
      email: contact.email,
      event_type: CASE_PREVIEW_RECOVERY_ATTEMPT_EVENT_TYPES.manual,
      event_data: {
        case_id: caseId,
        product_type: recovery.productType,
        resume_url: recovery.resumeUrl,
        sent_at: null,
        source: 'admin:cases',
        stage: 'manual',
        status: 'attempted',
      },
    });

    if (attemptEvent.error) {
      return NextResponse.json(
        { error: 'Failed to record restart email attempt' },
        { status: 500 }
      );
    }

    const emailResult = await sendCasePreviewRecoveryEmail({
      to: contact.email,
      customerName: contact.name || contact.email.split('@')[0] || 'there',
      productName: recovery.productName,
      resumeUrl: recovery.resumeUrl,
      stage: 'manual',
    });

    const finalEvent = await supabase.from('email_events').insert({
      email: contact.email,
      event_type: emailResult.success
        ? CASE_PREVIEW_RECOVERY_SENT_EVENT_TYPES.manual
        : CASE_PREVIEW_RECOVERY_FAILED_EVENT_TYPES.manual,
      event_data: {
        case_id: caseId,
        product_type: recovery.productType,
        resume_url: recovery.resumeUrl,
        error: emailResult.success ? null : emailResult.error || 'Unknown email error',
        sent_at: new Date().toISOString(),
        source: 'admin:cases',
        stage: 'manual',
        status: emailResult.success ? 'sent' : 'failed',
      },
    });

    if (finalEvent.error) {
      return NextResponse.json(
        { error: 'Failed to record restart email result' },
        { status: 500 }
      );
    }

    if (!emailResult.success) {
      return NextResponse.json(
        { error: emailResult.error || 'Failed to send restart link' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      emailSent: true,
      resumeUrl: recovery.resumeUrl,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized - Please log in') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.error('[admin/cases/send-restart-link] error', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to send restart link' },
      { status: 500 }
    );
  }
}
