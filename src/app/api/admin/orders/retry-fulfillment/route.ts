/**
 * Admin API - Retry Order Fulfillment
 *
 * POST /api/admin/orders/retry-fulfillment
 *
 * Allows support/admin users to manually retry paid order fulfillment without
 * requiring the customer to log in and press retry from their dashboard.
 *
 * Body: { orderId: string }
 */

import { createAdminClient, requireServerAuth } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { logger } from '@/lib/logger';
import { fulfillOrder } from '@/lib/payments/fulfillment';
import { resolveFulfillmentProductForCase } from '@/lib/payments/fulfillment-routing';
import {
  extractOrderMetadata,
  isMetadataColumnMissingError,
  safeUpdateOrderWithMetadata,
  setMetadataColumnExists,
} from '@/lib/payments/safe-order-metadata';

const retryFulfillmentSchema = z.object({
  orderId: z
    .string()
    .uuid('Invalid order ID format')
    .min(36, 'Order ID must be a valid UUID')
    .max(36, 'Order ID must be a valid UUID'),
});

async function logRetryAttempt(
  adminClient: ReturnType<typeof createAdminClient>,
  params: {
    orderId: string;
    adminUserId: string;
    status: 'processing' | 'completed' | 'failed';
    result: Record<string, unknown>;
  }
) {
  const { orderId, adminUserId, status, result } = params;

  await adminClient.from('webhook_logs').insert({
    event_type: 'admin.order.retry_fulfillment',
    stripe_event_id: `admin-retry-${orderId}-${Date.now()}`,
    payload: {
      order_id: orderId,
      admin_user_id: adminUserId,
    },
    status,
    received_at: new Date().toISOString(),
    processed_at: status === 'processing' ? null : new Date().toISOString(),
    processing_result: result,
  });
}

export async function POST(request: NextRequest) {
  const adminClient = createAdminClient();
  let adminUserId: string | null = null;
  let orderId: string | null = null;

  try {
    const user = await requireServerAuth();
    adminUserId = user.id;

    if (!isAdmin(user.id)) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    const validationResult = retryFulfillmentSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    orderId = validationResult.data.orderId;

    const ORDER_SELECT_WITH_METADATA =
      'id, case_id, user_id, product_type, payment_status, fulfillment_status, metadata';
    const ORDER_SELECT_WITHOUT_METADATA =
      'id, case_id, user_id, product_type, payment_status, fulfillment_status';

    let { data: order, error: orderError } = await adminClient
      .from('orders')
      .select(ORDER_SELECT_WITH_METADATA)
      .eq('id', orderId)
      .maybeSingle();

    if (orderError && isMetadataColumnMissingError(orderError)) {
      setMetadataColumnExists(false);
      const fallbackResult = await adminClient
        .from('orders')
        .select(ORDER_SELECT_WITHOUT_METADATA)
        .eq('id', orderId)
        .maybeSingle();

      order = fallbackResult.data as any;
      orderError = fallbackResult.error;
    }

    if (orderError) {
      logger.error('Admin retry fulfillment failed to fetch order', {
        orderId,
        adminUserId,
        error: orderError.message,
      });
      return NextResponse.json(
        { error: 'Failed to fetch order' },
        { status: 500 }
      );
    }

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    if (order.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Can only retry fulfillment for paid orders' },
        { status: 400 }
      );
    }

    if (!order.case_id) {
      return NextResponse.json(
        { error: 'Order is not linked to a case' },
        { status: 422 }
      );
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

    const { data: caseData, error: caseError } = await adminClient
      .from('cases')
      .select('id, user_id, jurisdiction, case_type')
      .eq('id', order.case_id)
      .single();

    if (caseError || !caseData) {
      return NextResponse.json(
        { error: 'Case not found for order' },
        { status: 404 }
      );
    }

    const { count: existingDocCount, error: existingDocsError } = await adminClient
      .from('documents')
      .select('id', { count: 'exact', head: true })
      .eq('case_id', order.case_id)
      .eq('is_preview', false);

    if (existingDocsError) {
      logger.error('Admin retry fulfillment failed to check documents', {
        orderId,
        caseId: order.case_id,
        adminUserId,
        error: existingDocsError.message,
      });
      return NextResponse.json(
        { error: 'Failed to inspect existing documents' },
        { status: 500 }
      );
    }

    if (existingDocCount && existingDocCount > 0) {
      if (order.fulfillment_status !== 'fulfilled') {
        await safeUpdateOrderWithMetadata(
          adminClient,
          order.id,
          {
            fulfillment_status: 'fulfilled',
            fulfilled_at: new Date().toISOString(),
          },
          extractOrderMetadata(order)
        );
      }

      await logRetryAttempt(adminClient, {
        orderId: order.id,
        adminUserId,
        status: 'completed',
        result: {
          status: 'already_fulfilled',
          documents: existingDocCount,
        },
      });

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

    const resolvedUserId = order.user_id || caseData.user_id;
    if (!resolvedUserId) {
      return NextResponse.json(
        {
          error: 'Unable to resolve user for fulfillment. Please contact engineering.',
        },
        { status: 422 }
      );
    }

    const updatedMetadata = {
      ...(extractOrderMetadata(order) || {}),
      admin_retry_attempt: new Date().toISOString(),
      admin_retry_user_id: adminUserId,
    };

    await safeUpdateOrderWithMetadata(
      adminClient,
      order.id,
      { fulfillment_status: 'processing' },
      updatedMetadata
    );

    await logRetryAttempt(adminClient, {
      orderId: order.id,
      adminUserId,
      status: 'processing',
      result: {
        case_id: order.case_id,
        product_type: order.product_type,
      },
    });

    const fulfillmentProduct =
      resolveFulfillmentProductForCase({
        productType: order.product_type,
        order: {
          product_type: order.product_type,
          metadata: extractOrderMetadata(order),
        },
        jurisdiction: caseData.jurisdiction,
        caseType: caseData.case_type,
      }) || order.product_type;

    const result = await fulfillOrder({
      orderId: order.id,
      caseId: order.case_id,
      productType: fulfillmentProduct,
      userId: resolvedUserId,
    });

    const success =
      result.status === 'fulfilled' ||
      result.status === 'already_fulfilled' ||
      result.status === 'processing';

    await logRetryAttempt(adminClient, {
      orderId: order.id,
      adminUserId,
      status: success ? 'completed' : 'failed',
      result: {
        status: result.status,
        documents: result.documents,
        error: result.error || null,
      },
    });

    if (success) {
      return NextResponse.json(
        {
          success: true,
          status: result.status,
          documents: result.documents,
          message:
            result.status === 'already_fulfilled'
              ? 'Documents already exist'
              : 'Fulfillment retry started successfully',
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        status: result.status,
        error: result.error || 'Document generation did not complete',
        documents: result.documents,
      },
      { status: 409 }
    );
  } catch (error: any) {
    logger.error('Admin retry fulfillment error', {
      orderId,
      adminUserId,
      error: error?.message || String(error),
    });

    if (orderId) {
      await adminClient
        .from('orders')
        .update({
          fulfillment_status: 'failed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (adminUserId) {
        await logRetryAttempt(adminClient, {
          orderId,
          adminUserId,
          status: 'failed',
          result: {
            error: error?.message || String(error),
          },
        });
      }
    }

    if (error?.message === 'Unauthorized - Please log in') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
