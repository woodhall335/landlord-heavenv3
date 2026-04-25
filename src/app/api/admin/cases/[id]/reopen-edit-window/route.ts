import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, requireServerAuth } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth';
import { getLatestPaidOrderForCase, getOrderMetadata, logAdminCaseAction } from '@/lib/admin/case-actions';
import { safeUpdateOrderWithMetadata } from '@/lib/payments/safe-order-metadata';
import { getEditWindowEndsAt, getEditWindowStatusWithOverride } from '@/lib/payments/edit-window';

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

    if (!order || !order.id || !order.paid_at) {
      return NextResponse.json(
        { error: 'No paid order found for this case' },
        { status: 404 }
      );
    }

    const previousMetadata = getOrderMetadata(order) || {};
    const previousWindow = getEditWindowStatusWithOverride(
      order.paid_at,
      previousMetadata.edit_window_override_ends_at ?? null
    );
    const reopenedUntil = getEditWindowEndsAt(new Date()).toISOString();

    const { error } = await safeUpdateOrderWithMetadata(
      adminClient,
      order.id,
      {},
      {
        ...previousMetadata,
        edit_window_override_ends_at: reopenedUntil,
        edit_window_reopened_at: new Date().toISOString(),
        edit_window_reopened_by: user.id,
      }
    );

    if (error) {
      console.error('Failed to reopen admin edit window:', error);
      return NextResponse.json(
        { error: 'Failed to reopen edit window' },
        { status: 500 }
      );
    }

    await logAdminCaseAction({
      caseId,
      adminUserId: user.id,
      action: 'admin_reopen_edit_window',
      changedKeys: ['edit_window_override_ends_at'],
      metadata: {
        order_id: order.id,
        previous_ends_at: previousWindow.endsAt,
        reopened_until: reopenedUntil,
      },
    });

    return NextResponse.json(
      {
        success: true,
        case_id: caseId,
        order_id: order.id,
        edit_window_ends_at: reopenedUntil,
      },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.message === 'Unauthorized - Please log in') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.error('Admin reopen edit window error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
