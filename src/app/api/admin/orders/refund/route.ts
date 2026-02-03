/**
 * Admin API - Order Refund
 *
 * POST /api/admin/orders/refund
 * Processes a refund for an order via Stripe
 *
 * Required: Admin authentication
 * Body: { orderId: string, reason?: string, amount?: number (optional partial refund in pence) }
 */

import { createServerSupabaseClient, createAdminClient, requireServerAuth } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { logger } from '@/lib/logger';
import Stripe from 'stripe';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

// Order type for proper TypeScript inference
interface Order {
  id: string;
  user_id: string;
  stripe_payment_intent_id: string | null;
  payment_status: string;
  total_amount: number | null;
  [key: string]: unknown;
}

// Validation schema
const refundSchema = z.object({
  orderId: z.string().uuid('Invalid order ID'),
  reason: z.string().optional(),
  amount: z.number().positive().optional(), // Amount in pence for partial refund
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireServerAuth();
    const supabase = await createServerSupabaseClient();
    const adminClient = createAdminClient();

    // Check if user is admin (with proper trimming of env var)
    if (!isAdmin(user.id)) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate input
    const validationResult = refundSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { orderId, reason, amount } = validationResult.data;

    // Fetch order from database
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !orderData) {
      logger.warn('Refund failed - order not found', { orderId });
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Cast to Order type for TypeScript
    const order = orderData as unknown as Order;

    // Check if order has a payment intent
    if (!order.stripe_payment_intent_id) {
      return NextResponse.json(
        { error: 'Order has no associated payment to refund' },
        { status: 400 }
      );
    }

    // Check if already refunded
    if (order.payment_status === 'refunded') {
      return NextResponse.json(
        { error: 'Order has already been refunded' },
        { status: 400 }
      );
    }

    // Check if payment was successful
    if (order.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Can only refund orders with status "paid"' },
        { status: 400 }
      );
    }

    // Create Stripe refund
    const refundParams: Stripe.RefundCreateParams = {
      payment_intent: order.stripe_payment_intent_id,
      reason: 'requested_by_customer',
    };

    // Add amount for partial refund
    if (amount) {
      // Validate amount doesn't exceed order total
      const orderAmountInPence = Math.round((order.total_amount || 0) * 100);
      if (amount > orderAmountInPence) {
        return NextResponse.json(
          { error: 'Refund amount exceeds order total' },
          { status: 400 }
        );
      }
      refundParams.amount = amount;
    }

    let refund: Stripe.Refund;
    try {
      refund = await stripe.refunds.create(refundParams);
    } catch (stripeError: any) {
      logger.error('Stripe refund failed', {
        orderId,
        error: stripeError.message,
      });
      return NextResponse.json(
        { error: `Stripe refund failed: ${stripeError.message}` },
        { status: 500 }
      );
    }

    // Determine new payment status
    const isFullRefund = !amount || amount >= Math.round((order.total_amount || 0) * 100);
    const newPaymentStatus = isFullRefund ? 'refunded' : 'partially_refunded';

    // Update order status in database
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        payment_status: newPaymentStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (updateError) {
      logger.error('Failed to update order after refund', {
        orderId,
        error: updateError.message,
      });
      // Continue anyway - refund was processed
    }

    // Log admin action to webhook_logs table
    const { error: logError } = await adminClient
      .from('webhook_logs')
      .insert({
        event_type: 'admin.order.refund',
        stripe_event_id: refund.id,
        payload: {
          order_id: orderId,
          admin_user_id: user.id,
          refund_id: refund.id,
          amount_refunded: refund.amount,
          currency: refund.currency,
          reason: reason || 'No reason provided',
          is_full_refund: isFullRefund,
          original_payment_intent: order.stripe_payment_intent_id,
        },
        status: 'completed',
        received_at: new Date().toISOString(),
        processed_at: new Date().toISOString(),
        processing_result: {
          success: true,
          new_order_status: newPaymentStatus,
        },
      });

    if (logError) {
      logger.warn('Failed to log refund action', { error: logError.message });
      // Continue anyway - refund was processed
    }

    logger.info('Order refunded successfully', {
      orderId,
      refundId: refund.id,
      amount: refund.amount,
      adminUserId: user.id,
    });

    return NextResponse.json(
      {
        success: true,
        message: isFullRefund ? 'Order fully refunded' : 'Partial refund processed',
        refund: {
          id: refund.id,
          amount: refund.amount,
          currency: refund.currency,
          status: refund.status,
        },
        order: {
          id: orderId,
          payment_status: newPaymentStatus,
        },
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

    logger.error('Admin refund error', { error: error?.message });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
