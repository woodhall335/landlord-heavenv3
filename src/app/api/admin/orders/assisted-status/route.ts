import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient, requireServerAuth } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth';
import {
  isAssistedPrepSku,
  isAssistedPrepStatus,
  ASSISTED_PREP_STATUSES,
} from '@/lib/assisted-prep';
import {
  extractOrderMetadata,
  safeUpdateOrderWithMetadata,
} from '@/lib/payments/safe-order-metadata';
import { logger } from '@/lib/logger';

const schema = z.object({
  orderId: z.string().uuid(),
  status: z.enum(ASSISTED_PREP_STATUSES as [string, ...string[]]),
  note: z.string().max(1000).nullable().optional(),
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

    const { orderId, status, note } = parsed.data;
    if (!isAssistedPrepStatus(status)) {
      return NextResponse.json({ error: 'Invalid assisted prep status' }, { status: 400 });
    }

    const adminClient = createAdminClient();
    const { data: order, error: orderError } = await adminClient
      .from('orders')
      .select('id, user_id, case_id, product_type, payment_status, fulfillment_status, metadata')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (!isAssistedPrepSku((order as any).product_type)) {
      return NextResponse.json({ error: 'This action is only available for assisted prep orders.' }, { status: 400 });
    }

    if ((order as any).payment_status !== 'paid' && status !== 'completed') {
      return NextResponse.json({ error: 'Assisted status can only be updated on paid orders.' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const existingMetadata = extractOrderMetadata(order) || {};
    const history = Array.isArray(existingMetadata.assisted_status_history)
      ? existingMetadata.assisted_status_history
      : [];

    const { error: updateError } = await safeUpdateOrderWithMetadata(
      adminClient,
      orderId,
      { fulfillment_status: status },
      {
        ...existingMetadata,
        assisted_status: status,
        assisted_status_note: note || null,
        assisted_status_updated_at: now,
        assisted_status_updated_by: user.id,
        assisted_status_history: [
          ...history,
          {
            status,
            note: note || null,
            admin_user_id: user.id,
            created_at: now,
          },
        ],
      }
    );

    if (updateError) {
      logger.error('Failed to update assisted prep status', {
        orderId,
        status,
        error: updateError.message,
      });
      return NextResponse.json({ error: 'Failed to update assisted status' }, { status: 500 });
    }

    if ((order as any).case_id) {
      await adminClient
        .from('cases')
        .update({
          workflow_status: status,
          workflow_status_updated_at: now,
        })
        .eq('id', (order as any).case_id);
    }

    await adminClient.from('webhook_logs').insert({
      event_type: 'admin.assisted_status_updated',
      stripe_event_id: `assisted-status-${orderId}-${Date.now()}`,
      status: 'completed',
      payload: {
        order_id: orderId,
        case_id: (order as any).case_id,
        assisted_status: status,
        note: note || null,
        admin_user_id: user.id,
      },
      received_at: now,
      processed_at: now,
    });

    return NextResponse.json({ ok: true, status });
  } catch (error: any) {
    if (error.message === 'Unauthorized - Please log in') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    logger.error('Assisted prep status update failed', { error: error?.message });
    return NextResponse.json(
      { error: error?.message || 'Unable to update assisted prep status.' },
      { status: 500 }
    );
  }
}
