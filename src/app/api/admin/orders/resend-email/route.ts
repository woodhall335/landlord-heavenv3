/**
 * Admin API - Resend Order Confirmation Email
 *
 * POST /api/admin/orders/resend-email
 * Resends the purchase confirmation email for a paid order
 *
 * Required: Admin authentication
 * Body: { orderId: string }
 *
 * Security features:
 * - Admin-only access via isAdmin() check
 * - Rate limiting: Max 3 resends per order per 24 hours
 * - Audit logging: All resend attempts logged to webhook_logs
 * - Input validation: UUID format required
 */

import { createServerSupabaseClient, createAdminClient, requireServerAuth } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { logger } from '@/lib/logger';
import { sendPurchaseConfirmation } from '@/lib/email/resend';

// Order type for proper TypeScript inference
interface Order {
  id: string;
  user_id: string;
  product_type: string;
  product_name: string;
  total_amount: number;
  payment_status: string;
  case_id: string | null;
}

interface User {
  id: string;
  email: string;
  full_name: string | null;
}

// Validation schema with strict UUID check
const resendEmailSchema = z.object({
  orderId: z
    .string()
    .uuid('Invalid order ID format')
    .min(36, 'Order ID must be a valid UUID')
    .max(36, 'Order ID must be a valid UUID'),
});

// Rate limit constants
const RATE_LIMIT_MAX_RESENDS = 3;
const RATE_LIMIT_WINDOW_HOURS = 24;

export async function POST(request: NextRequest) {
  const adminClient = createAdminClient();
  let adminUserId: string | null = null;
  let orderId: string | null = null;

  try {
    const user = await requireServerAuth();
    adminUserId = user.id;
    const supabase = await createServerSupabaseClient();

    // Check if user is admin (with proper trimming of env var)
    if (!isAdmin(user.id)) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    // Validate input
    const validationResult = resendEmailSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    orderId = validationResult.data.orderId;

    // Check rate limit - count resends in last 24 hours for this order
    const twentyFourHoursAgo = new Date(Date.now() - RATE_LIMIT_WINDOW_HOURS * 60 * 60 * 1000).toISOString();
    const { count: recentResendCount, error: countError } = await adminClient
      .from('webhook_logs')
      .select('*', { count: 'exact', head: true })
      .eq('event_type', 'admin.order.resend_email')
      .eq('stripe_event_id', `resend-${orderId}`)
      .gte('received_at', twentyFourHoursAgo);

    if (countError) {
      logger.warn('Failed to check rate limit', { orderId, error: countError.message });
      // Continue anyway - don't block on rate limit check failure
    } else if ((recentResendCount ?? 0) >= RATE_LIMIT_MAX_RESENDS) {
      logger.warn('Rate limit exceeded for order email resend', {
        orderId,
        recentResendCount,
        adminUserId: user.id,
      });

      // Log the rate-limited attempt
      await logResendAttempt(adminClient, orderId, user.id, 'rate_limited', {
        reason: 'Rate limit exceeded',
        recentResendCount,
      });

      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: `Maximum ${RATE_LIMIT_MAX_RESENDS} email resends per order per ${RATE_LIMIT_WINDOW_HOURS} hours`,
        },
        { status: 429 }
      );
    }

    // Fetch order from database
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('id, user_id, product_type, product_name, total_amount, payment_status, case_id')
      .eq('id', orderId)
      .single();

    if (orderError || !orderData) {
      logger.warn('Resend email failed - order not found', { orderId });

      await logResendAttempt(adminClient, orderId, user.id, 'failed', {
        reason: 'Order not found',
      });

      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const order = orderData as Order;

    // Check if order is paid
    if (order.payment_status !== 'paid') {
      await logResendAttempt(adminClient, orderId, user.id, 'failed', {
        reason: 'Order not paid',
        payment_status: order.payment_status,
      });

      return NextResponse.json(
        { error: 'Can only resend emails for paid orders' },
        { status: 400 }
      );
    }

    // Fetch user info
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, full_name')
      .eq('id', order.user_id)
      .single();

    if (userError || !userData) {
      logger.warn('Resend email failed - user not found', { orderId, userId: order.user_id });

      await logResendAttempt(adminClient, orderId, user.id, 'failed', {
        reason: 'User not found',
        order_user_id: order.user_id,
      });

      return NextResponse.json(
        { error: 'User not found for this order' },
        { status: 404 }
      );
    }

    const orderUser = userData as User;

    if (!orderUser.email) {
      await logResendAttempt(adminClient, orderId, user.id, 'failed', {
        reason: 'User has no email',
        order_user_id: order.user_id,
      });

      return NextResponse.json(
        { error: 'User has no email address' },
        { status: 400 }
      );
    }

    // Build download URL - same logic as webhook
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://landlordheaven.co.uk';
    const downloadUrl = order.case_id
      ? `${appUrl}/dashboard/cases/${order.case_id}`
      : `${appUrl}/dashboard`;

    // Send the confirmation email
    const emailResult = await sendPurchaseConfirmation({
      to: orderUser.email,
      customerName: orderUser.full_name || 'there',
      productName: order.product_name || order.product_type,
      amount: Math.round(order.total_amount * 100), // Convert to pence
      orderNumber: order.id.substring(0, 8).toUpperCase(),
      downloadUrl,
    });

    if (!emailResult.success) {
      logger.error('Failed to resend confirmation email', {
        orderId,
        email: orderUser.email,
        error: emailResult.error,
      });

      await logResendAttempt(adminClient, orderId, user.id, 'failed', {
        reason: 'Email send failed',
        email_error: emailResult.error,
        recipient_email: orderUser.email,
      });

      return NextResponse.json(
        { error: `Failed to send email: ${emailResult.error}` },
        { status: 500 }
      );
    }

    // Log successful resend
    await logResendAttempt(adminClient, orderId, user.id, 'completed', {
      recipient_email: orderUser.email,
      product_name: order.product_name,
    });

    logger.info('Confirmation email resent successfully', {
      orderId,
      email: orderUser.email,
      adminUserId: user.id,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Confirmation email sent successfully',
        email: orderUser.email,
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

    // Log unexpected errors
    if (orderId && adminUserId) {
      await logResendAttempt(adminClient, orderId, adminUserId, 'failed', {
        reason: 'Unexpected error',
        error_message: error?.message,
      });
    }

    logger.error('Admin resend email error', { error: error?.message });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Log a resend attempt to webhook_logs for audit purposes
 */
async function logResendAttempt(
  adminClient: ReturnType<typeof createAdminClient>,
  orderId: string,
  adminUserId: string,
  status: 'completed' | 'failed' | 'rate_limited',
  details: Record<string, unknown>
): Promise<void> {
  try {
    await adminClient.from('webhook_logs').insert({
      event_type: 'admin.order.resend_email',
      // Use a predictable ID format for rate limiting queries
      stripe_event_id: `resend-${orderId}`,
      payload: {
        order_id: orderId,
        admin_user_id: adminUserId,
        action: 'resend_confirmation_email',
        ...details,
      },
      status,
      received_at: new Date().toISOString(),
      processed_at: new Date().toISOString(),
      processing_result: {
        status,
        details,
      },
    });
  } catch (error) {
    // Log but don't fail the request if audit logging fails
    logger.warn('Failed to log resend attempt', {
      orderId,
      adminUserId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
