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

    const { data: existingDocs, error: docsError } = await adminClient
      .from('documents')
      .select('id, pdf_url')
      .eq('case_id', caseId)
      .eq('is_preview', false);

    if (docsError) {
      return NextResponse.json(
        { ok: false, error: 'Failed to fetch existing documents' },
        { status: 500 }
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

    try {
      if (existingDocs && existingDocs.length > 0) {
        const storagePaths: string[] = [];
        for (const doc of existingDocs) {
          if (doc.pdf_url) {
            const match = doc.pdf_url.match(/\/documents\/(.+)$/);
            if (match && match[1]) {
              storagePaths.push(match[1]);
            }
          }
        }

        if (storagePaths.length > 0) {
          const { error: storageError } = await adminClient.storage
            .from('documents')
            .remove(storagePaths);

          if (storageError) {
            console.warn('Failed to delete some storage files during admin regeneration:', storageError);
          }
        }

        const docIds = existingDocs.map((doc) => doc.id);
        const { error: deleteError } = await adminClient
          .from('documents')
          .delete()
          .in('id', docIds);

        if (deleteError) {
          throw new Error('Failed to delete existing documents before regeneration');
        }
      }

      const fulfillmentProduct =
        resolveFulfillmentProductForCase({
          productType: order.product_type,
          order: {
            product_type: order.product_type,
            metadata: getOrderMetadata(order),
          },
          jurisdiction: (caseData as any).jurisdiction,
          caseType: (caseData as any).case_type,
        }) || order.product_type;

      const result = await fulfillOrder({
        orderId: order.id,
        caseId,
        productType: fulfillmentProduct || '',
        userId: order.user_id || (caseData as any).user_id,
      });

      if (result.status === 'incomplete' || result.status === 'requires_action') {
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

      const { data: newDocs } = await adminClient
        .from('documents')
        .select('id')
        .eq('case_id', caseId)
        .eq('is_preview', false);

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
