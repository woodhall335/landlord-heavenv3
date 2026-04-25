import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, requireServerAuth } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth';
import { fulfillOrder } from '@/lib/payments/fulfillment';
import { resolveFulfillmentProductForCase } from '@/lib/payments/fulfillment-routing';
import { getLatestPaidOrderForCase, getOrderMetadata, logAdminCaseAction } from '@/lib/admin/case-actions';
import { safeUpdateOrderWithMetadata } from '@/lib/payments/safe-order-metadata';

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
    const order = await getLatestPaidOrderForCase(adminClient, caseId);

    if (!order) {
      return NextResponse.json({ error: 'No paid order found for this case' }, { status: 404 });
    }

    const { data: caseData, error: caseError } = await adminClient
      .from('cases')
      .select('id, user_id, jurisdiction, case_type')
      .eq('id', caseId)
      .single();

    if (caseError || !caseData) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    const { count: existingDocCount, error: existingDocsError } = await adminClient
      .from('documents')
      .select('id', { count: 'exact', head: true })
      .eq('case_id', caseId)
      .eq('is_preview', false);

    if (existingDocsError) {
      console.error('Failed to check existing documents:', existingDocsError);
      return NextResponse.json({ error: 'Failed to inspect documents' }, { status: 500 });
    }

    if (existingDocCount && existingDocCount > 0) {
      await safeUpdateOrderWithMetadata(
        adminClient,
        order.id,
        {
          fulfillment_status: 'fulfilled',
          fulfilled_at: new Date().toISOString(),
        },
        getOrderMetadata(order)
      );

      await logAdminCaseAction({
        caseId,
        adminUserId: user.id,
        action: 'admin_retry_fulfillment',
        changedKeys: ['fulfillment_status'],
        metadata: {
          order_id: order.id,
          result: 'already_fulfilled',
          final_document_count: existingDocCount,
        },
      });

      return NextResponse.json(
        {
          success: true,
          status: 'already_fulfilled',
          documents: existingDocCount,
        },
        { status: 200 }
      );
    }

    const updatedMetadata = {
      ...(getOrderMetadata(order) || {}),
      admin_retry_attempt: new Date().toISOString(),
      admin_retry_user_id: user.id,
    };

    await safeUpdateOrderWithMetadata(
      adminClient,
      order.id,
      { fulfillment_status: 'processing' },
      updatedMetadata
    );

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

    const status =
      result.status === 'fulfilled'
        ? 'fulfilled'
        : result.status === 'incomplete' || result.status === 'requires_action'
        ? 'requires_action'
        : 'processing';

    await logAdminCaseAction({
      caseId,
      adminUserId: user.id,
      action: 'admin_retry_fulfillment',
      changedKeys: ['fulfillment_status'],
      metadata: {
        order_id: order.id,
        result_status: result.status,
        documents: result.documents,
      },
    });

    return NextResponse.json(
      {
        success: true,
        status,
        result_status: result.status,
        documents: result.documents,
      },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.message === 'Unauthorized - Please log in') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.error('Admin retry fulfillment error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
