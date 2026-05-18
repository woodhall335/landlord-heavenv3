/**
 * Admin API - Send abandoned checkout recovery email.
 *
 * POST /api/admin/orders/send-checkout-recovery
 * Body: { orderId: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { isAdmin } from '@/lib/auth';
import { sendAbandonedCheckoutRecoveryEmail } from '@/lib/email/resend';
import { logger } from '@/lib/logger';
import { PRODUCTS, isValidProductSku, type ProductSku } from '@/lib/pricing/products';
import { createAdminClient, requireServerAuth } from '@/lib/supabase/server';

const payloadSchema = z.object({
  orderId: z.string().uuid('Invalid order ID format'),
});

interface OrderRow {
  id: string;
  user_id: string | null;
  case_id: string | null;
  product_type: string;
  product_name: string | null;
  total_amount: number | string | null;
  payment_status: string;
  stripe_checkout_url: string | null;
  stripe_session_id: string | null;
}

interface UserRow {
  id: string;
  email: string | null;
  full_name: string | null;
}

const RECOVERY_EVENT_TYPE = 'checkout_recovery_sent';
const RECOVERY_FAILED_EVENT_TYPE = 'checkout_recovery_failed';
const DEDUPE_WINDOW_HOURS = 24;

function normalizeGbpAmount(value: number | string | null): number {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) return 0;
  return amount > 999 ? Number((amount / 100).toFixed(2)) : amount;
}

function getCustomerName(user: UserRow): string {
  const fullName = user.full_name?.trim();
  if (fullName) return fullName;
  return user.email?.split('@')[0]?.trim() || 'there';
}

function getProductName(order: OrderRow): string {
  if (isValidProductSku(order.product_type)) {
    return PRODUCTS[order.product_type as ProductSku].label;
  }

  return order.product_name || 'Landlord Heaven document pack';
}

export async function POST(request: NextRequest) {
  const adminClient = createAdminClient();
  let orderId: string | null = null;

  try {
    const adminUser = await requireServerAuth();
    if (!isAdmin(adminUser.id)) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => null);
    const parsed = payloadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      );
    }

    orderId = parsed.data.orderId;

    const { data: orderData, error: orderError } = await adminClient
      .from('orders')
      .select(
        'id, user_id, case_id, product_type, product_name, total_amount, payment_status, stripe_checkout_url, stripe_session_id'
      )
      .eq('id', orderId)
      .single();

    if (orderError || !orderData) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const order = orderData as OrderRow;
    if (order.payment_status !== 'pending') {
      return NextResponse.json(
        { error: 'Recovery email can only be sent for pending checkout orders' },
        { status: 400 }
      );
    }

    if (!order.stripe_checkout_url) {
      return NextResponse.json(
        { error: 'This order does not have a saved Stripe checkout URL' },
        { status: 400 }
      );
    }

    if (!order.user_id) {
      return NextResponse.json(
        { error: 'This order is not linked to a known user' },
        { status: 400 }
      );
    }

    const { data: userData, error: userError } = await adminClient
      .from('users')
      .select('id, email, full_name')
      .eq('id', order.user_id)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found for this order' }, { status: 404 });
    }

    const orderUser = userData as UserRow;
    if (!orderUser.email) {
      return NextResponse.json({ error: 'User has no email address' }, { status: 400 });
    }

    const dedupeCutoff = new Date(Date.now() - DEDUPE_WINDOW_HOURS * 60 * 60 * 1000).toISOString();
    const { data: recentEvents, error: recentEventsError } = await adminClient
      .from('email_events')
      .select('id, event_data, created_at')
      .eq('email', orderUser.email)
      .eq('event_type', RECOVERY_EVENT_TYPE)
      .gte('created_at', dedupeCutoff);

    if (recentEventsError) {
      logger.warn('Failed to check checkout recovery email dedupe', {
        orderId,
        error: recentEventsError.message,
      });
    }

    const alreadySent = ((recentEvents || []) as Array<{ event_data?: Record<string, unknown> | null }>).some(
      (event) => event.event_data?.order_id === order.id
    );

    if (alreadySent) {
      return NextResponse.json({
        success: true,
        status: 'already_sent',
        message: 'Recovery email was already sent for this order in the last 24 hours.',
        email: orderUser.email,
      });
    }

    const emailResult = await sendAbandonedCheckoutRecoveryEmail({
      to: orderUser.email,
      customerName: getCustomerName(orderUser),
      productName: getProductName(order),
      amount: normalizeGbpAmount(order.total_amount),
      checkoutUrl: order.stripe_checkout_url,
    });

    const eventType = emailResult.success ? RECOVERY_EVENT_TYPE : RECOVERY_FAILED_EVENT_TYPE;
    await adminClient.from('email_events').insert({
      email: orderUser.email,
      event_type: eventType,
      event_data: {
        order_id: order.id,
        case_id: order.case_id,
        product_type: order.product_type,
        checkout_url: order.stripe_checkout_url,
        stripe_session_id: order.stripe_session_id,
        admin_user_id: adminUser.id,
        error: emailResult.success ? null : emailResult.error || 'Unknown email error',
        sent_at: new Date().toISOString(),
        source: 'admin:failed-payments',
      },
    });

    if (!emailResult.success) {
      return NextResponse.json(
        { error: `Failed to send recovery email: ${emailResult.error}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      status: 'sent',
      message: 'Recovery email sent.',
      email: orderUser.email,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized - Please log in') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    logger.error('Admin checkout recovery email error', {
      orderId,
      error: error?.message,
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
