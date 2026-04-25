import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, requireServerAuth } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth';
import { fulfillOrder } from '@/lib/payments/fulfillment';
import { safeUpdateOrderWithMetadata } from '@/lib/payments/safe-order-metadata';
import { validateSection21ForCheckout } from '@/lib/validation/section21-checkout-validator';
import { getLatestPaidOrderForCase, getOrderMetadata, logAdminCaseAction } from '@/lib/admin/case-actions';

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
      .select('id, user_id, jurisdiction, collected_facts')
      .eq('id', caseId)
      .single();

    if (caseError || !caseData) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    const currentFacts = ((caseData as any).collected_facts || {}) as Record<string, unknown>;
    const validation = validateSection21ForCheckout(
      currentFacts,
      (caseData as any).jurisdiction,
      order.product_type || ''
    );

    if (!validation.canCheckout && validation.isSection21Case) {
      return NextResponse.json(
        {
          error: validation.message,
          code: 'SECTION21_PRECONDITIONS_STILL_MISSING',
          details: {
            isSection21Case: validation.isSection21Case,
            section21Validation: validation.section21Validation,
            missingConfirmations: validation.missingConfirmations,
          },
        },
        { status: 422 }
      );
    }

    const { error: updateCaseError } = await adminClient
      .from('cases')
      .update({
        status: 'processing',
        updated_at: new Date().toISOString(),
      })
      .eq('id', caseId);

    if (updateCaseError) {
      return NextResponse.json({ error: 'Failed to update case' }, { status: 500 });
    }

    await safeUpdateOrderWithMetadata(
      adminClient,
      order.id,
      { fulfillment_status: 'processing' },
      {
        ...(getOrderMetadata(order) || {}),
        admin_resume_attempt: new Date().toISOString(),
        admin_resume_user_id: user.id,
      }
    );

    const resolvedUserId = order.user_id || (caseData as any).user_id;
    if (!resolvedUserId) {
      return NextResponse.json(
        { error: 'Unable to resolve user for fulfillment' },
        { status: 422 }
      );
    }

    const result = await fulfillOrder({
      orderId: order.id,
      caseId,
      productType: order.product_type || '',
      userId: resolvedUserId,
    });

    await logAdminCaseAction({
      caseId,
      adminUserId: user.id,
      action: 'admin_resume_fulfillment',
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
        result_status: result.status,
        documents: result.documents,
      },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.message === 'Unauthorized - Please log in') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.error('Admin resume fulfillment error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
