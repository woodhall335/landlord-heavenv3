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

    const updatedMetadata = {
      ...(getOrderMetadata(order) || {}),
      admin_retry_attempt: new Date().toISOString(),
      admin_retry_user_id: user.id,
    };

    const { data: processingOrder, error: processingError } = await adminClient
      .from('orders')
      .update({ fulfillment_status: 'processing' })
      .eq('id', order.id)
      .neq('fulfillment_status', 'processing')
      .select('id')
      .maybeSingle();

    if (processingError) {
      return NextResponse.json(
        { error: 'Unable to start fulfillment retry. Please try again.' },
        { status: 500 }
      );
    }
    if (!processingOrder) {
      return NextResponse.json(
        {
          success: true,
          status: 'processing',
          message: 'Document generation is already in progress',
        },
        { status: 200 }
      );
    }

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
