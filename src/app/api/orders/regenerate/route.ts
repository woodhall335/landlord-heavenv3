/**
 * Order Document Regeneration API
 *
 * POST /api/orders/regenerate
 *
 * Regenerates ALL final documents for a paid order's product pack.
 * This respects the 30-day edit window and deletes old documents before regenerating.
 *
 * Input: { case_id: string }
 * Auth: Required + case ownership check
 */

import { createServerSupabaseClient, requireServerAuth } from '@/lib/supabase/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { checkMutationAllowed } from '@/lib/payments/edit-window-enforcement';
import { fulfillOrder } from '@/lib/payments/fulfillment';
import { resolveFulfillmentProductForCase } from '@/lib/payments/fulfillment-routing';
import {
  extractOrderMetadata,
  isMetadataColumnMissingError,
  setMetadataColumnExists,
} from '@/lib/payments/safe-order-metadata';
import {
  sanitizeComplianceIssues,
  type ComplianceTimingBlockResponse,
  type RegenerateOrderResponse,
} from '@/lib/documents/compliance-timing-types';
import { validateComplianceTiming } from '@/lib/documents/court-ready-validator';
import { buildComplianceTimingDataFromFacts } from '@/lib/documents/compliance-timing-facts';
import { selectActiveCaseOrder } from '@/lib/payments/active-order';
import {
  getTenancyOutputSnapshotByOrderId,
  isTenancyOutputProductSku,
  prepareTenancyOutputSnapshotForRegeneration,
  toTenancyOutputSnapshotJurisdiction,
} from '@/lib/tenancy/output-snapshot.server';
import { deleteFinalDocumentsForOrder } from '@/lib/payments/order-document-cleanup';

type PaidOrderRow = {
  id: string;
  payment_status: 'paid';
  product_type: string;
  user_id: string | null;
  paid_at: string | null;
  created_at: string | null;
  metadata?: unknown;
};

export interface RegenerateOrderRequest {
  case_id: string;
  product?: string; // Optional product type for validation
}

export async function POST(request: Request) {
  try {
    const user = await requireServerAuth();
    const userIsAdmin = isAdmin(user.id);
    const body: RegenerateOrderRequest = await request.json();

    const { case_id, product } = body;

    if (!case_id) {
      return NextResponse.json(
        { ok: false, error: 'case_id is required' },
        { status: 400 }
      );
    }

    const adminClient = createSupabaseAdminClient();
    const supabase = await createServerSupabaseClient();

    // Verify case access
    const caseClient = userIsAdmin ? adminClient : supabase;
    let caseQuery = caseClient
      .from('cases')
      .select('id, user_id, jurisdiction, case_type, collected_facts')
      .eq('id', case_id);

    if (!userIsAdmin) {
      caseQuery = caseQuery.eq('user_id', user.id);
    }

    const { data: caseData, error: caseError } = await caseQuery.single();

    if (caseError || !caseData) {
      return NextResponse.json(
        { ok: false, error: 'Case not found' },
        { status: 404 }
      );
    }

    if (!userIsAdmin && caseData.user_id !== user.id) {
      return NextResponse.json(
        { ok: false, error: 'You do not have permission to access this case' },
        { status: 403 }
      );
    }

    // Check edit window - must be within 30 days of purchase
    const mutationCheck = await checkMutationAllowed(case_id);
    if (!mutationCheck.allowed) {
      return mutationCheck.errorResponse;
    }

    // Build order query - find the paid order for this case
    const ORDER_SELECT_WITH_METADATA =
      'id, payment_status, product_type, user_id, paid_at, created_at, metadata';
    const ORDER_SELECT_WITHOUT_METADATA =
      'id, payment_status, product_type, user_id, paid_at, created_at';

    let orderQueryWithMetadata = adminClient
      .from('orders')
      .select(ORDER_SELECT_WITH_METADATA)
      .eq('case_id', case_id)
      .eq('payment_status', 'paid');

    if (!userIsAdmin) {
      orderQueryWithMetadata = orderQueryWithMetadata.eq('user_id', user.id);
    }

    // If product is specified, validate it matches the order
    if (product) {
      orderQueryWithMetadata = orderQueryWithMetadata.eq('product_type', product);
    }

    const metadataResult = await orderQueryWithMetadata
      .order('paid_at', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(20);

    let orders: PaidOrderRow[] | null = (metadataResult.data as PaidOrderRow[] | null) ?? null;
    let orderError = metadataResult.error;

    if (orderError && isMetadataColumnMissingError(orderError)) {
      setMetadataColumnExists(false);

      let orderQueryWithoutMetadata = adminClient
        .from('orders')
        .select(ORDER_SELECT_WITHOUT_METADATA)
        .eq('case_id', case_id)
        .eq('payment_status', 'paid');

      if (!userIsAdmin) {
        orderQueryWithoutMetadata = orderQueryWithoutMetadata.eq('user_id', user.id);
      }

      if (product) {
        orderQueryWithoutMetadata = orderQueryWithoutMetadata.eq('product_type', product);
      }

      const fallbackResult = await orderQueryWithoutMetadata
        .order('paid_at', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(20);

      orders = fallbackResult.data as PaidOrderRow[] | null;
      orderError = fallbackResult.error;
    }

    if (orderError) {
      console.error('Failed to fetch order:', orderError);
      return NextResponse.json(
        { ok: false, error: 'Failed to fetch order' },
        { status: 500 }
      );
    }

    const order = selectActiveCaseOrder<PaidOrderRow>(orders);

    if (!order) {
      const productMsg = product ? ` for product "${product}"` : '';
      return NextResponse.json(
        { ok: false, error: `No paid order found${productMsg}. Please complete your purchase first.` },
        { status: 402 }
      );
    }

    // Defense in depth: verify order belongs to this user
    if (!userIsAdmin && order.user_id && order.user_id !== user.id) {
      console.error('[Order Regenerate] User ID mismatch - access denied');
      return NextResponse.json(
        { ok: false, error: 'You do not have permission to regenerate this order' },
        { status: 403 }
      );
    }

    // Resolve user ID
    const resolvedUserId = order.user_id || caseData.user_id;
    if (!resolvedUserId) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Unable to resolve user for regeneration. Please contact support.',
        },
        { status: 422 }
      );
    }

    // =========================================================================
    // P0 FIX: PREFLIGHT COMPLIANCE TIMING VALIDATION (Jan 2026)
    // CRITICAL: Validate compliance timing BEFORE deleting any documents.
    // This prevents data loss if compliance validation would fail during regeneration.
    //
    // CANONICAL BUILDER (Jan 2026 consistency fix):
    // Uses buildComplianceTimingDataFromFacts() to ensure all endpoints use the
    // same field alias resolution. This prevents inconsistent behavior between
    // wizard generate, fulfill, and regenerate flows.
    // =========================================================================
    const wizardFacts = caseData.collected_facts as Record<string, unknown> | null;
    const timingData = buildComplianceTimingDataFromFacts(wizardFacts);

    const preflightTimingResult = validateComplianceTiming(timingData);
    if (!preflightTimingResult.isValid) {
      // BLOCK REGENERATION: Compliance timing violations detected
      // Return structured 422 response WITHOUT deleting any documents
      console.error('🚨 PREFLIGHT: Regeneration blocked - compliance timing violations:', preflightTimingResult.issues);

      const blockingIssues = preflightTimingResult.issues.filter(i => i.severity === 'error');
      const sanitizedIssues = sanitizeComplianceIssues(blockingIssues);

      const response: ComplianceTimingBlockResponse = {
        ok: false,
        error: 'compliance_timing_block',
        code: 'COMPLIANCE_TIMING_BLOCK',
        issues: sanitizedIssues,
        tenancy_start_date: timingData.tenancy_start_date,
        message: "We can't regenerate your Section 21 pack because some compliance requirements haven't been met. Please update your case details and try again.",
      };

      return NextResponse.json(response, { status: 422 });
    }

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

    const { data: processingOrder, error: processingError } = await adminClient
      .from('orders')
      .update({ fulfillment_status: 'processing' })
      .eq('id', order.id)
      .neq('fulfillment_status', 'processing')
      .select('id')
      .maybeSingle();

    if (processingError) {
      return NextResponse.json(
        { ok: false, error: 'Unable to start document regeneration. Please try again.' },
        { status: 500 }
      );
    }
    if (!processingOrder) {
      return NextResponse.json(
        { ok: false, error: 'Document regeneration is already in progress.' },
        { status: 409 }
      );
    }

    let tenancyOutputSnapshotId: string | null = null;
    let shouldRemoveFailedRevision = false;

    try {
      if (isTenancyOutputProductSku(fulfillmentProduct)) {
        const previousSnapshot = await getTenancyOutputSnapshotByOrderId(adminClient, order.id);
        const tenancySnapshot = await prepareTenancyOutputSnapshotForRegeneration(adminClient, {
          orderId: order.id,
          caseId: case_id,
          userId: resolvedUserId,
          productType: fulfillmentProduct,
          jurisdiction: toTenancyOutputSnapshotJurisdiction(caseData.jurisdiction),
          wizardAnswers: wizardFacts || {},
          caseType: caseData.case_type,
        });
        tenancyOutputSnapshotId = tenancySnapshot.id;
        shouldRemoveFailedRevision = previousSnapshot?.id !== tenancySnapshot.id;
      }

      const result = await fulfillOrder({
        orderId: order.id,
        caseId: case_id,
        productType: fulfillmentProduct,
        userId: resolvedUserId,
        tenancyOutputSnapshotId,
      });

      if (result.status === 'incomplete' || result.status === 'requires_action') {
        if (tenancyOutputSnapshotId && shouldRemoveFailedRevision) {
          await deleteFinalDocumentsForOrder(adminClient, {
            caseId: case_id,
            orderId: order.id,
            tenancyOutputSnapshotId,
          });
        }
        const response: RegenerateOrderResponse = {
          ok: false,
          error:
            result.status === 'requires_action'
              ? 'Document regeneration needs more information before it can continue.'
              : 'Document regeneration did not complete.',
          message: result.error || undefined,
        };

        return NextResponse.json(response, { status: 409 });
      }

      if (tenancyOutputSnapshotId) {
        try {
          await deleteFinalDocumentsForOrder(adminClient, {
            caseId: case_id,
            orderId: order.id,
            exceptTenancyOutputSnapshotId: tenancyOutputSnapshotId,
          });
        } catch (cleanupError) {
          console.error('Failed to remove superseded tenancy documents:', cleanupError);
        }
      }

      let newDocumentsQuery = adminClient
        .from('documents')
        .select('id')
        .eq('case_id', case_id)
        .eq('order_id', order.id)
        .eq('is_preview', false);
      if (tenancyOutputSnapshotId) {
        newDocumentsQuery = newDocumentsQuery.eq(
          'tenancy_output_snapshot_id',
          tenancyOutputSnapshotId
        );
      }
      const { data: newDocs } = await newDocumentsQuery;

      return NextResponse.json(
        {
          ok: true,
          regenerated_count: result.documents,
          document_ids: newDocs?.map((d) => d.id) || [],
        },
        { status: 200 }
      );
    } catch (fulfillmentError: any) {
      if (tenancyOutputSnapshotId && shouldRemoveFailedRevision) {
        try {
          await deleteFinalDocumentsForOrder(adminClient, {
            caseId: case_id,
            orderId: order.id,
            tenancyOutputSnapshotId,
          });
        } catch (cleanupError) {
          console.error('Failed to remove incomplete tenancy revision:', cleanupError);
        }
      }
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
        console.error('Regeneration blocked - compliance timing violations:', fulfillmentError.issues);

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

      const errorMessage = fulfillmentError?.message || 'Document regeneration failed';
      console.error('Regeneration failed:', errorMessage, fulfillmentError);

      return NextResponse.json(
        {
          ok: false,
          error: 'Document regeneration failed',
          message: errorMessage.substring(0, 500),
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    if (error.message === 'Unauthorized - Please log in') {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.error('Regenerate endpoint error:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
