/**
 * Order Fulfillment Retry API
 *
 * POST /api/orders/fulfill
 *
 * Allows users to retry document generation for paid orders that failed.
 * This endpoint is idempotent - if documents already exist, it returns success without regenerating.
 *
 * Input: { case_id: string, product?: string }
 * Auth: Required + case ownership check
 */

import { createServerSupabaseClient, requireServerAuth } from '@/lib/supabase/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';
import { fulfillOrder } from '@/lib/payments/fulfillment';

export interface FulfillOrderRequest {
  case_id: string;
  product?: string;
}

export interface FulfillOrderResponse {
  success: boolean;
  status: 'fulfilled' | 'already_fulfilled' | 'processing';
  documents?: number;
  message?: string;
}

export async function POST(request: Request) {
  try {
    const user = await requireServerAuth();
    const body: FulfillOrderRequest = await request.json();

    const { case_id, product } = body;

    if (!case_id) {
      return NextResponse.json(
        { success: false, error: 'case_id is required' },
        { status: 400 }
      );
    }

    const adminClient = createSupabaseAdminClient();
    const supabase = await createServerSupabaseClient();

    // Verify case ownership
    const { data: caseData, error: caseError } = await supabase
      .from('cases')
      .select('id, user_id')
      .eq('id', case_id)
      .single();

    if (caseError || !caseData) {
      return NextResponse.json(
        { success: false, error: 'Case not found' },
        { status: 404 }
      );
    }

    if (caseData.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'You do not have permission to access this case' },
        { status: 403 }
      );
    }

    // Find the order for this case
    let orderQuery = adminClient
      .from('orders')
      .select('id, payment_status, fulfillment_status, product_type, user_id')
      .eq('case_id', case_id)
      .order('created_at', { ascending: false });

    if (product) {
      orderQuery = orderQuery.eq('product_type', product);
    }

    const { data: orders, error: orderError } = await orderQuery.limit(1);

    if (orderError) {
      console.error('Failed to fetch order:', orderError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch order' },
        { status: 500 }
      );
    }

    const order = orders?.[0];

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'No order found for this case' },
        { status: 404 }
      );
    }

    // Verify order is paid
    if (order.payment_status !== 'paid') {
      return NextResponse.json(
        { success: false, error: 'Order is not paid' },
        { status: 402 }
      );
    }

    // Check if already processing (prevent concurrent retries)
    if (order.fulfillment_status === 'processing') {
      return NextResponse.json(
        {
          success: true,
          status: 'processing',
          message: 'Document generation is already in progress',
        },
        { status: 200 }
      );
    }

    // Check if final documents already exist (idempotency)
    const { count: existingDocCount } = await supabase
      .from('documents')
      .select('id', { count: 'exact', head: true })
      .eq('case_id', case_id)
      .eq('user_id', user.id)
      .eq('is_preview', false);

    if (existingDocCount && existingDocCount > 0) {
      // Documents exist, mark as fulfilled if not already
      if (order.fulfillment_status !== 'fulfilled') {
        await adminClient
          .from('orders')
          .update({
            fulfillment_status: 'fulfilled',
            fulfilled_at: new Date().toISOString(),
          })
          .eq('id', order.id);
      }

      return NextResponse.json(
        {
          success: true,
          status: 'already_fulfilled',
          documents: existingDocCount,
          message: 'Documents already exist',
        },
        { status: 200 }
      );
    }

    // Resolve userId - priority: order.user_id, then case.user_id
    const resolvedUserId = order.user_id || caseData.user_id;

    if (!resolvedUserId) {
      // This is a critical error - cannot proceed without user
      return NextResponse.json(
        {
          success: false,
          error: 'Unable to resolve user for fulfillment. Please contact support.',
          user_message: 'We cannot generate your documents because user information is missing. Please contact support with your Case ID for assistance.',
        },
        { status: 422 }
      );
    }

    // Set status to processing before starting
    await adminClient
      .from('orders')
      .update({
        fulfillment_status: 'processing',
      })
      .eq('id', order.id);

    try {
      // Call fulfillOrder
      const result = await fulfillOrder({
        orderId: order.id,
        caseId: case_id,
        productType: order.product_type,
        userId: resolvedUserId,
      });

      return NextResponse.json(
        {
          success: true,
          status: result.status === 'already_fulfilled' ? 'already_fulfilled' : 'fulfilled',
          documents: result.documents,
        },
        { status: 200 }
      );
    } catch (fulfillmentError: any) {
      // Mark order as failed
      const errorMessage = fulfillmentError?.message || 'Document generation failed';

      await adminClient
        .from('orders')
        .update({
          fulfillment_status: 'failed',
        })
        .eq('id', order.id);

      console.error('Fulfillment retry failed:', errorMessage, fulfillmentError);

      return NextResponse.json(
        {
          success: false,
          error: 'Document generation failed',
          message: errorMessage.substring(0, 500),
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    if (error.message === 'Unauthorized - Please log in') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.error('Fulfill endpoint error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
