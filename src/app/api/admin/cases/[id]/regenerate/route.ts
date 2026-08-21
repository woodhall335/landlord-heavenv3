import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, requireServerAuth } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth';
import { checkMutationAllowed } from '@/lib/payments/edit-window-enforcement';
import { fulfillOrder } from '@/lib/payments/fulfillment';
import { resolveFulfillmentProductForCase } from '@/lib/payments/fulfillment-routing';
import { getLatestPaidOrderForCase, getOrderMetadata, logAdminCaseAction } from '@/lib/admin/case-actions';
import { safeUpdateOrderWithMetadata } from '@/lib/payments/safe-order-metadata';
import {
  sanitizeComplianceIssues,
  type ComplianceTimingBlockResponse,
  type RegenerateOrderResponse,
} from '@/lib/documents/compliance-timing-types';
import { validateComplianceTiming } from '@/lib/documents/court-ready-validator';
import { buildComplianceTimingDataFromFacts } from '@/lib/documents/compliance-timing-facts';
import {
  getTenancyOutputSnapshotByOrderId,
  isTenancyOutputProductSku,
  prepareTenancyOutputSnapshotForRegeneration,
  toTenancyOutputSnapshotJurisdiction,
} from '@/lib/tenancy/output-snapshot.server';
import { deleteFinalDocumentsForOrder } from '@/lib/payments/order-document-cleanup';

type RouteParams = { id: string };

export async function POST(
  _request: NextRequest,
  context: { params: Promise<RouteParams> }
) {
  try {
    const user = await requireServerAuth();

    if (!isAdmin(user.id)) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const { id: caseId } = await context.params;
    const adminClient = createAdminClient();

    const mutationCheck = await checkMutationAllowed(caseId);
    if (!mutationCheck.allowed) {
      return mutationCheck.errorResponse;
    }

    const { data: caseData, error: caseError } = await adminClient
      .from('cases')
      .select('id, user_id, jurisdiction, case_type, collected_facts')
      .eq('id', caseId)
      .single();

    if (caseError || !caseData) {
      return NextResponse.json({ ok: false, error: 'Case not found' }, { status: 404 });
    }

    const order = await getLatestPaidOrderForCase(adminClient, caseId);
    if (!order) {
      return NextResponse.json(
        { ok: false, error: 'No paid order found. Please complete payment first.' },
        { status: 402 }
      );
    }

    const orderProductType = order.product_type;
    if (!orderProductType) {
      return NextResponse.json(
        { ok: false, error: 'The paid order has no product type. Please contact support.' },
        { status: 422 }
      );
    }

    const wizardFacts = ((caseData as any).collected_facts || {}) as Record<string, unknown>;
    const timingData = buildComplianceTimingDataFromFacts(wizardFacts);
    const preflightTimingResult = validateComplianceTiming(timingData);

    if (!preflightTimingResult.isValid) {
      const blockingIssues = preflightTimingResult.issues.filter((issue) => issue.severity === 'error');
      const sanitizedIssues = sanitizeComplianceIssues(blockingIssues);

      const response: ComplianceTimingBlockResponse = {
        ok: false,
        error: 'compliance_timing_block',
        code: 'COMPLIANCE_TIMING_BLOCK',
        issues: sanitizedIssues,
        tenancy_start_date: timingData.tenancy_start_date,
        message:
          "We can't regenerate this pack because some compliance requirements haven't been met. Update the case details and try again.",
      };

      return NextResponse.json(response, { status: 422 });
    }

    const fulfillmentProduct =
      resolveFulfillmentProductForCase({
        productType: orderProductType,
        order: {
          product_type: orderProductType,
          metadata: getOrderMetadata(order),
        },
        jurisdiction: (caseData as any).jurisdiction,
        caseType: (caseData as any).case_type,
      }) || orderProductType;

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

    await safeUpdateOrderWithMetadata(
      adminClient,
      order.id,
      { fulfillment_status: 'processing' },
      {
        ...(getOrderMetadata(order) || {}),
        admin_regenerate_attempt: new Date().toISOString(),
        admin_regenerate_user_id: user.id,
      }
    );

    let tenancyOutputSnapshotId: string | null = null;
    let shouldRemoveFailedRevision = false;

    try {
      if (isTenancyOutputProductSku(fulfillmentProduct)) {
        const orderUserId = order.user_id || (caseData as any).user_id;
        if (!orderUserId) {
          throw new Error('Unable to resolve user for regeneration. Please contact support.');
        }

        const previousSnapshot = await getTenancyOutputSnapshotByOrderId(adminClient, order.id);
        const tenancySnapshot = await prepareTenancyOutputSnapshotForRegeneration(adminClient, {
          orderId: order.id,
          caseId,
          userId: orderUserId,
          productType: fulfillmentProduct,
          jurisdiction: toTenancyOutputSnapshotJurisdiction((caseData as any).jurisdiction),
          wizardAnswers: wizardFacts,
          caseType: (caseData as any).case_type,
        });
        tenancyOutputSnapshotId = tenancySnapshot.id;
        shouldRemoveFailedRevision = previousSnapshot?.id !== tenancySnapshot.id;
      }

      const result = await fulfillOrder({
        orderId: order.id,
        caseId,
        productType: fulfillmentProduct || '',
        userId: order.user_id || (caseData as any).user_id,
        tenancyOutputSnapshotId,
      });

      if (result.status === 'incomplete' || result.status === 'requires_action') {
        if (tenancyOutputSnapshotId && shouldRemoveFailedRevision) {
          await deleteFinalDocumentsForOrder(adminClient, {
            caseId,
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
            caseId,
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
      .eq('case_id', caseId)
      .eq('order_id', order.id)
      .eq('is_preview', false);
      if (tenancyOutputSnapshotId) {
        newDocumentsQuery = newDocumentsQuery.eq(
          'tenancy_output_snapshot_id',
          tenancyOutputSnapshotId
        );
      }
      const { data: newDocs } = await newDocumentsQuery;

      await logAdminCaseAction({
        caseId,
        adminUserId: user.id,
        action: 'admin_document_regenerate',
        changedKeys: ['documents', 'fulfillment_status'],
        metadata: {
          order_id: order.id,
          regenerated_count: result.documents,
        },
      });

      return NextResponse.json(
        {
          ok: true,
          regenerated_count: result.documents,
          document_ids: newDocs?.map((doc) => doc.id) || [],
        },
        { status: 200 }
      );
    } catch (fulfillmentError: any) {
      if (tenancyOutputSnapshotId && shouldRemoveFailedRevision) {
        try {
          await deleteFinalDocumentsForOrder(adminClient, {
            caseId,
            orderId: order.id,
            tenancyOutputSnapshotId,
          });
        } catch (cleanupError) {
          console.error('Failed to remove incomplete tenancy revision:', cleanupError);
        }
      }
      await safeUpdateOrderWithMetadata(
        adminClient,
        order.id,
        { fulfillment_status: 'failed' },
        {
          ...(getOrderMetadata(order) || {}),
          error: fulfillmentError?.message || 'Document regeneration failed',
        }
      );

      if (fulfillmentError?.code === 'COMPLIANCE_TIMING_BLOCK') {
        const sanitizedIssues = sanitizeComplianceIssues(fulfillmentError.issues || []);

        const response: ComplianceTimingBlockResponse = {
          ok: false,
          error: 'compliance_timing_block',
          code: 'COMPLIANCE_TIMING_BLOCK',
          issues: sanitizedIssues,
          tenancy_start_date: fulfillmentError.tenancy_start_date,
          message: "We can't generate this pack yet because some compliance requirements haven't been met.",
        };

        return NextResponse.json(response, { status: 422 });
      }

      return NextResponse.json(
        {
          ok: false,
          error: 'Document regeneration failed',
          message: fulfillmentError?.message || 'Document regeneration failed',
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    if (error.message === 'Unauthorized - Please log in') {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    console.error('Admin regenerate error:', error);
    return NextResponse.json(
      { ok: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
