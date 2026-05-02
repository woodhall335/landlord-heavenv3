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
import { isAdmin } from '@/lib/auth';
import { fulfillOrder } from '@/lib/payments/fulfillment';
import { resolveFulfillmentProductForCase } from '@/lib/payments/fulfillment-routing';
import {
  extractOrderMetadata,
  isMetadataColumnMissingError,
  setMetadataColumnExists,
} from '@/lib/payments/safe-order-metadata';
import { selectActiveCaseOrder } from '@/lib/payments/active-order';
import {
  sanitizeComplianceIssues,
  type ComplianceTimingBlockResponse,
  type FulfillOrderResponse,
} from '@/lib/documents/compliance-timing-types';

type PaidOrderRow = {
  id: string;
  payment_status: 'paid';
  fulfillment_status:
    | 'pending'
    | 'ready_to_generate'
    | 'processing'
    | 'fulfilled'
    | 'failed'
    | 'requires_action'
    | null;
  product_type: string;
  user_id: string | null;
  paid_at: string | null;
  created_at: string | null;
  metadata?: unknown;
};

export interface FulfillOrderRequest {
  case_id: string;
  product?: string;
}

export async function POST(request: Request) {
  try {
    const user = await requireServerAuth();
    const userIsAdmin = isAdmin(user.id);
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
    const caseClient = userIsAdmin ? adminClient : supabase;
    let caseQuery = caseClient
      .from('cases')
      .select('id, user_id, jurisdiction, case_type')
      .eq('id', case_id);

    if (!userIsAdmin) {
      caseQuery = caseQuery.eq('user_id', user.id);
    }

    const { data: caseData, error: caseError } = await caseQuery.single();

    if (caseError || !caseData) {
      return NextResponse.json(
        { success: false, error: 'Case not found' },
        { status: 404 }
      );
    }

    if (!userIsAdmin && caseData.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'You do not have permission to access this case' },
        { status: 403 }
      );
    }

    // Find the order for this case
    const ORDER_SELECT_WITH_METADATA =
      'id, payment_status, fulfillment_status, product_type, user_id, paid_at, created_at, metadata';
    const ORDER_SELECT_WITHOUT_METADATA =
      'id, payment_status, fulfillment_status, product_type, user_id, paid_at, created_at';

    let orderQueryWithMetadata = adminClient
      .from('orders')
      .select(ORDER_SELECT_WITH_METADATA)
      .eq('case_id', case_id)
      .eq('payment_status', 'paid')
      .order('created_at', { ascending: false });

    if (product) {
      orderQueryWithMetadata = orderQueryWithMetadata.eq('product_type', product);
    }

    const metadataResult = await orderQueryWithMetadata.limit(20);
    let orders: PaidOrderRow[] | null = (metadataResult.data as PaidOrderRow[] | null) ?? null;
    let orderError = metadataResult.error;

    if (orderError && isMetadataColumnMissingError(orderError)) {
      setMetadataColumnExists(false);

      let orderQueryWithoutMetadata = adminClient
        .from('orders')
        .select(ORDER_SELECT_WITHOUT_METADATA)
        .eq('case_id', case_id)
        .eq('payment_status', 'paid')
        .order('created_at', { ascending: false });

      if (product) {
        orderQueryWithoutMetadata = orderQueryWithoutMetadata.eq('product_type', product);
      }

      const fallbackResult = await orderQueryWithoutMetadata.limit(20);
      orders = fallbackResult.data as PaidOrderRow[] | null;
      orderError = fallbackResult.error;
    }

    if (orderError) {
      console.error('Failed to fetch order:', orderError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch order' },
        { status: 500 }
      );
    }

    const order = selectActiveCaseOrder<PaidOrderRow>(orders as PaidOrderRow[] | null | undefined);

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
    let documentsQuery = (userIsAdmin ? adminClient : supabase)
      .from('documents')
      .select('id, metadata')
      .eq('case_id', case_id)
      .eq('is_preview', false);

    if (!userIsAdmin) {
      documentsQuery = documentsQuery.eq('user_id', user.id);
    }

    const { data: existingDocs } = await documentsQuery;
    const existingDocCount = (existingDocs || []).filter((doc: any) => {
      const docOrderId = doc.metadata?.order_id;
      const docPackType = doc.metadata?.pack_type;

      if (docOrderId) {
        return docOrderId === order.id;
      }

      return docPackType === order.product_type;
    }).length;

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
      const fulfillmentProduct =
        resolveFulfillmentProductForCase({
          productType: product || order.product_type,
          order: {
            product_type: order.product_type,
            metadata: extractOrderMetadata(order),
          },
          jurisdiction: caseData.jurisdiction,
          caseType: caseData.case_type,
        }) || order.product_type;

      const result = await fulfillOrder({
        orderId: order.id,
        caseId: case_id,
        productType: fulfillmentProduct,
        userId: resolvedUserId,
      });

      if (result.status === 'already_fulfilled' || result.status === 'fulfilled' || result.status === 'processing') {
        const response: FulfillOrderResponse = {
          success: true,
          status: result.status,
          documents: result.documents,
        };

        return NextResponse.json(response, { status: 200 });
      }

      if (result.status === 'requires_action') {
        return NextResponse.json(
          {
            success: false,
            error: result.error || 'Document generation needs more information before it can continue.',
            message: result.error || 'Document generation needs more information before it can continue.',
          } satisfies FulfillOrderResponse,
          { status: 409 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: 'Document generation did not complete',
          message: result.error || 'Document generation did not complete. Please try again.',
        } satisfies FulfillOrderResponse,
        { status: 409 }
      );
    } catch (fulfillmentError: any) {
      // Mark order as failed
      await adminClient
        .from('orders')
        .update({
          fulfillment_status: 'failed',
        })
        .eq('id', order.id);

      // Handle compliance timing block errors with structured response
      if (fulfillmentError?.code === 'COMPLIANCE_TIMING_BLOCK') {
        // Log raw issues server-side (includes internal field codes)
        console.error('Fulfillment blocked - compliance timing violations:', fulfillmentError.issues);

        // Sanitize issues for UI - adds documentLabel and category, keeps field for internal use
        const sanitizedIssues = sanitizeComplianceIssues(fulfillmentError.issues || []);

        const response: ComplianceTimingBlockResponse = {
          ok: false,
          error: 'compliance_timing_block',
          code: 'COMPLIANCE_TIMING_BLOCK',
          issues: sanitizedIssues,
          tenancy_start_date: fulfillmentError.tenancy_start_date,
          message: "We can't generate your Section 21 pack yet because some compliance requirements haven't been met.",
        };

        return NextResponse.json(response, { status: 422 });
      }

      const errorMessage = fulfillmentError?.message || 'Document generation failed';
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
