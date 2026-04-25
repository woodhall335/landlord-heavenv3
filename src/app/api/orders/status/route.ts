/**
 * Order Status API
 *
 * GET /api/orders/status?case_id=...&product=...
 *
 * Returns authoritative payment and fulfillment status from the orders table.
 * This is the source of truth for payment status - NOT the ?payment=success query param.
 *
 * This endpoint is backward-compatible with databases that don't have the
 * orders.metadata column yet (handles Postgres error 42703 gracefully).
 */

import { createServerSupabaseClient, requireServerAuth } from '@/lib/supabase/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';
import { getEditWindowStatusWithOverride } from '@/lib/payments/edit-window';
import { deriveVisibleFulfillmentState } from '@/lib/payments/fulfillment-routing';
import {
  isMetadataColumnMissingError,
  setMetadataColumnExists,
  extractOrderMetadata,
} from '@/lib/payments/safe-order-metadata';
import { isAdmin } from '@/lib/auth';
import { isGeneratedPackDocument } from '@/lib/documents/document-origin';

export interface OrderStatusResponse {
  paid: boolean;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
  fulfillment_status: 'pending' | 'ready_to_generate' | 'processing' | 'fulfilled' | 'failed' | 'requires_action' | null;
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
  /** Product type from the order (e.g., 'notice_only', 'complete_pack') */
  product_type: string | null;
  /** Order metadata including required_actions for Section 21 cases */
  metadata?: {
    required_actions?: Array<{
      fieldKey: string;
      label: string;
      errorCode: string;
      helpText: string;
    }>;
    section21_blockers?: string[];
    blocked_documents?: Array<{
      documentType: string;
      documentTitle: string;
      blockingCodes: string[];
      reason: string;
    }>;
    [key: string]: any;
  } | null;
}

// Fields to select - with and without metadata
const ORDER_SELECT_WITH_METADATA = 'id, payment_status, fulfillment_status, paid_at, stripe_session_id, total_amount, currency, product_type, metadata';
const ORDER_SELECT_WITHOUT_METADATA = 'id, payment_status, fulfillment_status, paid_at, stripe_session_id, total_amount, currency, product_type';

export async function GET(request: Request) {
  try {
    const user = await requireServerAuth();
    const { searchParams } = new URL(request.url);
    const supabase = await createServerSupabaseClient();
    const adminClient = createSupabaseAdminClient();
    const userIsAdmin = isAdmin(user.id);

    const caseId = searchParams.get('case_id');
    const product = searchParams.get('product');

    if (!caseId) {
      return NextResponse.json(
        { error: 'case_id is required' },
        { status: 400 }
      );
    }

    // Build order query - try with metadata first
    let orderQueryWithMetadata = adminClient
      .from('orders')
      .select(ORDER_SELECT_WITH_METADATA)
      .eq('case_id', caseId)
      .order('created_at', { ascending: false });

    if (!userIsAdmin) {
      orderQueryWithMetadata = orderQueryWithMetadata.eq('user_id', user.id);
    }

    // Optionally filter by product type
    if (product) {
      orderQueryWithMetadata = orderQueryWithMetadata.eq('product_type', product);
    }

    let { data: orders, error: orderError } = await orderQueryWithMetadata.limit(1);

    // Handle metadata column missing error (42703)
    if (orderError && isMetadataColumnMissingError(orderError)) {
      console.warn('[orders] metadata column missing - falling back', {
        orderId: null,
        route: '/api/orders/status',
        action: 'select',
      });
      setMetadataColumnExists(false);

      // Retry without metadata using a separate query
      let orderQueryWithoutMetadata = adminClient
        .from('orders')
        .select(ORDER_SELECT_WITHOUT_METADATA)
        .eq('case_id', caseId)
        .order('created_at', { ascending: false });

      if (!userIsAdmin) {
        orderQueryWithoutMetadata = orderQueryWithoutMetadata.eq('user_id', user.id);
      }

      if (product) {
        orderQueryWithoutMetadata = orderQueryWithoutMetadata.eq('product_type', product);
      }

      const fallbackResult = await orderQueryWithoutMetadata.limit(1);
      orders = fallbackResult.data as any;
      orderError = fallbackResult.error;
    }

    if (orderError) {
      console.error('Failed to fetch order:', orderError);
      return NextResponse.json(
        { error: 'Failed to fetch order status' },
        { status: 500 }
      );
    }

    // Get final generated pack documents for this case.
    const docsClient = userIsAdmin ? adminClient : supabase;
    let docsQuery = docsClient
      .from('documents')
      .select('id, created_at, document_type, is_preview, metadata')
      .eq('case_id', caseId)
      .eq('is_preview', false)
      .order('created_at', { ascending: false });

    if (!userIsAdmin) {
      docsQuery = docsQuery.eq('user_id', user.id);
    }

    const { data: finalDocs, error: docError } = await docsQuery;

    if (docError) {
      console.error('Failed to count documents:', docError);
      // Don't fail the whole request, just report 0
    }

    const generatedDocs = ((finalDocs as any[]) || []).filter((doc) => isGeneratedPackDocument(doc));
    const order = orders?.[0] || null;
    const documentCount = generatedDocs.length;
    const lastFinalDocCreatedAt = generatedDocs[0]?.created_at || null;

    // Extract metadata using safe helper (handles missing metadata gracefully)
    const orderMetadata = extractOrderMetadata(order);
    const visibleFulfillmentState = deriveVisibleFulfillmentState({
      fulfillmentStatus: order?.fulfillment_status || null,
      hasFinalDocuments: documentCount > 0,
      metadata: orderMetadata || null,
      productType: order?.product_type || null,
    });

    // Calculate edit window status
    const editWindow = getEditWindowStatusWithOverride(
      order?.paid_at || null,
      orderMetadata?.edit_window_override_ends_at ?? null
    );

    // Build response
    const response: OrderStatusResponse = {
      paid: order?.payment_status === 'paid',
      payment_status: order?.payment_status || 'pending',
      fulfillment_status: visibleFulfillmentState.fulfillmentStatus,
      fulfillment_error: visibleFulfillmentState.fulfillmentError,
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
      product_type: order?.product_type || null,
      metadata: orderMetadata || null,
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
