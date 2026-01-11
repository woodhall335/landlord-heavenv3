/**
 * Order Status API
 *
 * GET /api/orders/status?case_id=...&product=...
 *
 * Returns authoritative payment and fulfillment status from the orders table.
 * This is the source of truth for payment status - NOT the ?payment=success query param.
 */

import { createServerSupabaseClient, requireServerAuth } from '@/lib/supabase/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';
import { getEditWindowStatus } from '@/lib/payments/edit-window';

export interface OrderStatusResponse {
  paid: boolean;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
  fulfillment_status: 'pending' | 'ready_to_generate' | 'processing' | 'fulfilled' | 'failed' | null;
  /** Human-readable error message if fulfillment failed */
  fulfillment_error: string | null;
  paid_at: string | null;
  order_id: string | null;
  stripe_session_id: string | null;
  total_amount: number | null;
  currency: string | null;
  has_final_documents: boolean;
  final_document_count: number;
  /** ISO string of when the most recent final document was created */
  last_final_document_created_at: string | null;
  /** Whether the 30-day edit/regenerate window is currently open */
  edit_window_open: boolean;
  /** ISO string of when the edit window ends (null if not paid) */
  edit_window_ends_at: string | null;
}

export async function GET(request: Request) {
  try {
    const user = await requireServerAuth();
    const { searchParams } = new URL(request.url);
    const supabase = await createServerSupabaseClient();
    const adminClient = createSupabaseAdminClient();

    const caseId = searchParams.get('case_id');
    const product = searchParams.get('product');

    if (!caseId) {
      return NextResponse.json(
        { error: 'case_id is required' },
        { status: 400 }
      );
    }

    // Build order query (include metadata for fulfillment_error)
    let orderQuery = adminClient
      .from('orders')
      .select('id, payment_status, fulfillment_status, paid_at, stripe_session_id, total_amount, currency, metadata')
      .eq('case_id', caseId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    // Optionally filter by product type
    if (product) {
      orderQuery = orderQuery.eq('product_type', product);
    }

    const { data: orders, error: orderError } = await orderQuery.limit(1);

    if (orderError) {
      console.error('Failed to fetch order:', orderError);
      return NextResponse.json(
        { error: 'Failed to fetch order status' },
        { status: 500 }
      );
    }

    // Get final documents (is_preview=false) for this case - need count and latest created_at
    const { data: finalDocs, count: finalDocCount, error: docError } = await supabase
      .from('documents')
      .select('id, created_at', { count: 'exact' })
      .eq('case_id', caseId)
      .eq('user_id', user.id)
      .eq('is_preview', false)
      .order('created_at', { ascending: false })
      .limit(1);

    if (docError) {
      console.error('Failed to count documents:', docError);
      // Don't fail the whole request, just report 0
    }

    const order = orders?.[0] || null;
    const documentCount = finalDocCount || 0;
    const lastFinalDocCreatedAt = finalDocs?.[0]?.created_at || null;

    // Extract fulfillment error from order metadata if present
    const orderMetadata = (order as any)?.metadata as Record<string, unknown> | null;
    const fulfillmentError = (orderMetadata?.fulfillment_error as string) || null;

    // Calculate edit window status
    const editWindow = getEditWindowStatus(order?.paid_at || null);

    // Build response
    const response: OrderStatusResponse = {
      paid: order?.payment_status === 'paid',
      payment_status: order?.payment_status || 'pending',
      fulfillment_status: order?.fulfillment_status || null,
      fulfillment_error: fulfillmentError,
      paid_at: order?.paid_at || null,
      order_id: order?.id || null,
      stripe_session_id: order?.stripe_session_id || null,
      total_amount: order?.total_amount ? Number(order.total_amount) : null,
      currency: order?.currency || null,
      has_final_documents: documentCount > 0,
      final_document_count: documentCount,
      last_final_document_created_at: lastFinalDocCreatedAt,
      edit_window_open: editWindow.isPaid && editWindow.isOpen,
      edit_window_ends_at: editWindow.endsAt,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    if (error.message === 'Unauthorized - Please log in') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.error('Order status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
