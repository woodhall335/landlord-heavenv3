import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient, requireServerAuth } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth';
import { sendAssistedPrepPackReady } from '@/lib/email/resend';
import { isAssistedPrepSku } from '@/lib/assisted-prep';
import { logger } from '@/lib/logger';

const schema = z.object({
  orderId: z.string().uuid(),
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

    const adminClient = createAdminClient();
    const { data: order, error: orderError } = await adminClient
      .from('orders')
      .select('id, user_id, case_id, product_type, product_name, payment_status')
      .eq('id', parsed.data.orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (!isAssistedPrepSku((order as any).product_type)) {
      return NextResponse.json({ error: 'This endpoint is only for assisted prep orders.' }, { status: 400 });
    }

    if ((order as any).payment_status !== 'paid') {
      return NextResponse.json({ error: 'Cannot send a ready email for an unpaid order.' }, { status: 400 });
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
    const caseUrl = (order as any).case_id
      ? `${appUrl}/dashboard/cases/${(order as any).case_id}`
      : `${appUrl}/dashboard`;

    const emailResult = await sendAssistedPrepPackReady({
      to: customer.email,
      customerName: customer.full_name || 'there',
      productName: (order as any).product_name || 'Assisted Prep',
      caseUrl,
    });

    if (!emailResult.success) {
      return NextResponse.json({ error: emailResult.error || 'Email failed' }, { status: 500 });
    }

    await adminClient
      .from('orders')
      .update({ fulfillment_status: 'sent_to_customer' })
      .eq('id', (order as any).id);

    if ((order as any).case_id) {
      await adminClient
        .from('cases')
        .update({
          workflow_status: 'sent_to_customer',
          workflow_status_updated_at: new Date().toISOString(),
        })
        .eq('id', (order as any).case_id);
    }

    await adminClient.from('email_events').insert({
      email: customer.email,
      event_type: 'assisted_pack_ready_sent',
      event_data: {
        order_id: (order as any).id,
        case_id: (order as any).case_id,
        product_type: (order as any).product_type,
        admin_user_id: user.id,
      },
      created_at: new Date().toISOString(),
    });

    await adminClient.from('webhook_logs').insert({
      event_type: 'admin.assisted_pack_ready_sent',
      stripe_event_id: `assisted-ready-${(order as any).id}-${Date.now()}`,
      status: 'completed',
      payload: {
        order_id: (order as any).id,
        case_id: (order as any).case_id,
        admin_user_id: user.id,
      },
      received_at: new Date().toISOString(),
      processed_at: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true, sent_to: customer.email });
  } catch (error: any) {
    if (error.message === 'Unauthorized - Please log in') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    logger.error('Failed to send assisted pack ready email', { error: error?.message });
    return NextResponse.json(
      { error: error?.message || 'Unable to send assisted pack ready email.' },
      { status: 500 }
    );
  }
}
