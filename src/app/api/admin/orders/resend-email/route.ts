/**
 * Admin API - Resend Order Confirmation Email
 *
 * POST /api/admin/orders/resend-email
 * Resends the purchase confirmation email for a paid order
 *
 * Required: Admin authentication
 * Body: { orderId: string }
 */

import { createServerSupabaseClient, requireServerAuth } from '@/lib/supabase/server';
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

// Validation schema
const resendEmailSchema = z.object({
  orderId: z.string().uuid('Invalid order ID'),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireServerAuth();
    const supabase = await createServerSupabaseClient();

    // Check if user is admin (with proper trimming of env var)
    if (!isAdmin(user.id)) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();

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

    const { orderId } = validationResult.data;

    // Fetch order from database
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('id, user_id, product_type, product_name, total_amount, payment_status, case_id')
      .eq('id', orderId)
      .single();

    if (orderError || !orderData) {
      logger.warn('Resend email failed - order not found', { orderId });
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const order = orderData as Order;

    // Check if order is paid
    if (order.payment_status !== 'paid') {
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
      return NextResponse.json(
        { error: 'User not found for this order' },
        { status: 404 }
      );
    }

    const orderUser = userData as User;

    if (!orderUser.email) {
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
      return NextResponse.json(
        { error: `Failed to send email: ${emailResult.error}` },
        { status: 500 }
      );
    }

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

    logger.error('Admin resend email error', { error: error?.message });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
