import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient, requireServerAuth } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth';
import { isAssistedPrepSku } from '@/lib/assisted-prep';
import {
  sendAssistedPrepLifecycleEmail,
  type AssistedPrepLifecycleEmailType,
} from '@/lib/email/resend';
import { logger } from '@/lib/logger';

const emailTypes = [
  'missing_information',
  'blockers_action_summary',
  'no_show_reschedule',
  'no_response_refund_offer',
  'refund_processed',
] as const;

const schema = z.object({
  orderId: z.string().uuid(),
  emailType: z.enum(emailTypes),
  note: z.string().max(1500).nullable().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireServerAuth();
    if (!isAdmin(user.id)) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
    }

    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.format() }, { status: 400 });
    }

    const { orderId, emailType, note } = parsed.data;
    const adminClient = createAdminClient();
    const { data: order, error: orderError } = await adminClient
      .from('orders')
      .select('id, user_id, case_id, product_type, product_name, payment_status, total_amount')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (!isAssistedPrepSku((order as any).product_type)) {
      return NextResponse.json({ error: 'This action is only available for assisted prep orders.' }, { status: 400 });
    }

    const paymentStatus = (order as any).payment_status;
    if (paymentStatus !== 'paid' && !(emailType === 'refund_processed' && paymentStatus === 'refunded')) {
      return NextResponse.json(
        { error: 'Assisted lifecycle emails can only be sent for paid assisted orders, except refund confirmations.' },
        { status: 400 }
      );
    }

    const { data: customer } = await adminClient
      .from('users')
      .select('email, full_name')
      .eq('id', (order as any).user_id)
      .single();

    if (!customer?.email) {
      return NextResponse.json({ error: 'Customer email not found' }, { status: 404 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://landlordheaven.co.uk';
    const bookingUrl = process.env.NEXT_PUBLIC_CALENDLY_ASSISTED_PREP_URL || `${appUrl}/assisted-prep`;
    const caseUrl = (order as any).case_id
      ? `${appUrl}/dashboard/cases/${(order as any).case_id}`
      : `${appUrl}/dashboard`;

    const emailResult = await sendAssistedPrepLifecycleEmail({
      to: customer.email,
      customerName: customer.full_name || 'there',
      productName: (order as any).product_name || 'Assisted Prep',
      emailType: emailType as AssistedPrepLifecycleEmailType,
      caseUrl,
      bookingUrl,
      note: note || null,
    });

    if (!emailResult.success) {
      return NextResponse.json({ error: emailResult.error || 'Email failed' }, { status: 500 });
    }

    const now = new Date().toISOString();
    await adminClient.from('email_events').insert({
      email: customer.email,
      event_type: `assisted_${emailType}_sent`,
      event_data: {
        order_id: (order as any).id,
        case_id: (order as any).case_id,
        product_type: (order as any).product_type,
        admin_user_id: user.id,
        note: note || null,
      },
      created_at: now,
    });

    await adminClient.from('webhook_logs').insert({
      event_type: `admin.assisted_${emailType}_sent`,
      stripe_event_id: `assisted-email-${emailType}-${(order as any).id}-${Date.now()}`,
      status: 'completed',
      payload: {
        order_id: (order as any).id,
        case_id: (order as any).case_id,
        email_type: emailType,
        admin_user_id: user.id,
      },
      received_at: now,
      processed_at: now,
    });

    return NextResponse.json({ ok: true, sent_to: customer.email, email_type: emailType });
  } catch (error: any) {
    if (error.message === 'Unauthorized - Please log in') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    logger.error('Failed to send assisted lifecycle email', { error: error?.message });
    return NextResponse.json(
      { error: error?.message || 'Unable to send assisted lifecycle email.' },
      { status: 500 }
    );
  }
}
