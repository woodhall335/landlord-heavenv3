/**
 * Resume Fulfillment API
 *
 * POST /api/orders/resume-fulfillment
 *
 * Allows users to resume fulfillment after providing missing Section 21 confirmations.
 * This endpoint:
 * 1. Updates case facts with the new confirmations
 * 2. Re-validates Section 21 preconditions
 * 3. If valid, triggers fulfillment retry
 *
 * This endpoint is backward-compatible with databases that don't have the
 * orders.metadata column yet (handles Postgres error 42703 gracefully).
 *
 * Request body:
 * {
 *   case_id: string;
 *   confirmations: {
 *     prescribed_info_served?: boolean;
 *     epc_served?: boolean;
 *     how_to_rent_served?: boolean;
 *     gas_safety_cert_served?: boolean;
 *     deposit_protected?: boolean;
 *     has_valid_licence?: boolean;
 *   }
 * }
 */

import { createAdminClient, requireServerAuth } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { logger } from '@/lib/logger';
import { fulfillOrder } from '@/lib/payments/fulfillment';
import { validateSection21ForCheckout } from '@/lib/validation/section21-checkout-validator';
import {
  isMetadataColumnMissingError,
  setMetadataColumnExists,
  safeUpdateOrderWithMetadata,
  extractOrderMetadata,
} from '@/lib/payments/safe-order-metadata';

// =============================================================================
// VALIDATION SCHEMA
// =============================================================================

const resumeFulfillmentSchema = z.object({
  case_id: z.string().uuid(),
  confirmations: z.object({
    prescribed_info_served: z.boolean().optional(),
    epc_served: z.boolean().optional(),
    how_to_rent_served: z.boolean().optional(),
    gas_safety_cert_served: z.boolean().optional(),
    deposit_protected: z.boolean().optional(),
    has_valid_licence: z.boolean().optional(),
    has_gas_appliances: z.boolean().optional(),
    licensing_required: z.string().optional(),
  }),
});

// Fields to select - with and without metadata
const ORDER_SELECT_WITH_METADATA = 'id, product_type, payment_status, fulfillment_status, metadata';
const ORDER_SELECT_WITHOUT_METADATA = 'id, product_type, payment_status, fulfillment_status';

// =============================================================================
// HANDLER
// =============================================================================

export async function POST(request: Request) {
  try {
    const user = await requireServerAuth();
    const body = await request.json();

    // Validate input
    const validationResult = resumeFulfillmentSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { case_id, confirmations } = validationResult.data;

    const adminSupabase = createAdminClient();

    // 1. Verify case ownership and get current data
    const { data: caseData, error: caseError } = await adminSupabase
      .from('cases')
      .select('id, user_id, jurisdiction, collected_facts, status')
      .eq('id', case_id)
      .single();

    if (caseError || !caseData) {
      logger.warn('Case not found for resume fulfillment', { caseId: case_id, userId: user.id });
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (caseData.user_id !== user.id) {
      logger.warn('User attempted resume fulfillment for unowned case', {
        caseId: case_id,
        userId: user.id,
        caseOwnerId: caseData.user_id,
      });
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      );
    }

    // 2. Get the order that needs resume - try with metadata first
    let { data: order, error: orderError } = await adminSupabase
      .from('orders')
      .select(ORDER_SELECT_WITH_METADATA)
      .eq('case_id', case_id)
      .eq('payment_status', 'paid')
      .in('fulfillment_status', ['requires_action', 'processing', 'failed'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Handle metadata column missing error (42703)
    if (orderError && isMetadataColumnMissingError(orderError)) {
      console.warn('[orders] metadata column missing - falling back', {
        orderId: null,
        route: '/api/orders/resume-fulfillment',
        action: 'select',
      });
      setMetadataColumnExists(false);

      // Retry without metadata
      const fallbackResult = await adminSupabase
        .from('orders')
        .select(ORDER_SELECT_WITHOUT_METADATA)
        .eq('case_id', case_id)
        .eq('payment_status', 'paid')
        .in('fulfillment_status', ['requires_action', 'processing', 'failed'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      order = fallbackResult.data as any;
      orderError = fallbackResult.error;
    }

    if (orderError || !order) {
      // Check if it's a "no rows" error vs actual error
      if (orderError?.code === 'PGRST116') {
        // No rows found - this is expected when there's no order requiring action
        logger.warn('No order found that requires action', {
          caseId: case_id,
          userId: user.id,
        });
        return NextResponse.json(
          { error: 'No order found that requires action' },
          { status: 404 }
        );
      }

      logger.warn('No order found that requires action', {
        caseId: case_id,
        userId: user.id,
        error: orderError?.message,
      });
      return NextResponse.json(
        { error: 'No order found that requires action' },
        { status: 404 }
      );
    }

    // 3. Update case facts with new confirmations
    const currentFacts = (caseData as any).collected_facts || {};
    const updatedFacts = {
      ...currentFacts,
      ...confirmations,
      // Also set the 'given'/'provided' variants for compatibility
      prescribed_info_given: confirmations.prescribed_info_served ?? currentFacts.prescribed_info_given,
      epc_provided: confirmations.epc_served ?? currentFacts.epc_provided,
      how_to_rent_provided: confirmations.how_to_rent_served ?? currentFacts.how_to_rent_provided,
      gas_certificate_provided: confirmations.gas_safety_cert_served ?? currentFacts.gas_certificate_provided,
    };

    // 4. Re-validate Section 21 preconditions with new facts
    const section21Validation = validateSection21ForCheckout(
      updatedFacts,
      caseData.jurisdiction,
      order.product_type
    );

    if (!section21Validation.canCheckout && section21Validation.isSection21Case) {
      logger.warn('Section 21 preconditions still not met after update', {
        caseId: case_id,
        userId: user.id,
        missingConfirmations: section21Validation.missingConfirmations.map(c => c.errorCode),
      });

      return NextResponse.json(
        {
          error: section21Validation.message,
          code: 'SECTION21_PRECONDITIONS_STILL_MISSING',
          details: {
            isSection21Case: section21Validation.isSection21Case,
            section21Validation: section21Validation.section21Validation,
            missingConfirmations: section21Validation.missingConfirmations,
          },
        },
        { status: 422 }
      );
    }

    // 5. Save updated facts to case
    const { error: updateError } = await adminSupabase
      .from('cases')
      .update({
        collected_facts: updatedFacts,
        status: 'processing',
        updated_at: new Date().toISOString(),
      })
      .eq('id', case_id);

    if (updateError) {
      logger.error('Failed to update case facts', {
        caseId: case_id,
        error: updateError.message,
      });
      return NextResponse.json(
        { error: 'Failed to update case' },
        { status: 500 }
      );
    }

    // 6. Mark order as processing for retry using safe helper
    const existingMetadata = extractOrderMetadata(order) || {};
    await safeUpdateOrderWithMetadata(
      adminSupabase,
      order.id,
      { fulfillment_status: 'processing' },
      {
        ...existingMetadata,
        resume_attempt: new Date().toISOString(),
        confirmations_added: Object.keys(confirmations),
      }
    );

    // 7. Trigger fulfillment retry
    logger.info('Resuming fulfillment after confirmations added', {
      caseId: case_id,
      orderId: order.id,
      userId: user.id,
      confirmationsAdded: Object.keys(confirmations),
    });

    try {
      const fulfillmentResult = await fulfillOrder({
        orderId: order.id,
        caseId: case_id,
        productType: order.product_type,
        userId: user.id,
      });

      return NextResponse.json({
        success: true,
        status: fulfillmentResult.status,
        documents: fulfillmentResult.documents,
        message:
          fulfillmentResult.status === 'fulfilled'
            ? 'All documents have been generated successfully.'
            : fulfillmentResult.status === 'requires_action'
            ? 'Some documents still require action.'
            : 'Fulfillment is being processed.',
        validation: fulfillmentResult.validation,
        blockedDocuments: fulfillmentResult.blockedDocuments,
        requiredActions: fulfillmentResult.requiredActions,
      });
    } catch (fulfillError: any) {
      logger.error('Fulfillment retry failed', {
        caseId: case_id,
        orderId: order.id,
        error: fulfillError.message,
      });

      // Check if this is still a Section 21 validation error
      if (fulfillError.section21Validation) {
        return NextResponse.json(
          {
            error: fulfillError.section21Validation?.summary || fulfillError.message,
            code: 'SECTION21_VALIDATION_FAILED',
            details: {
              section21Validation: fulfillError.section21Validation,
            },
          },
          { status: 422 }
        );
      }

      return NextResponse.json(
        { error: 'Fulfillment failed. Please try again or contact support.' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    if (error.message === 'Unauthorized - Please log in') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    logger.error('Resume fulfillment error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
