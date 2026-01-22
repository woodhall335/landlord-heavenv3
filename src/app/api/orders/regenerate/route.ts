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
import { checkMutationAllowed } from '@/lib/payments/edit-window-enforcement';
import { fulfillOrder } from '@/lib/payments/fulfillment';
import {
  sanitizeComplianceIssues,
  type ComplianceTimingBlockResponse,
  type RegenerateOrderResponse,
} from '@/lib/documents/compliance-timing-types';
import {
  validateComplianceTiming,
  type ComplianceTimingData,
} from '@/lib/documents/court-ready-validator';

export interface RegenerateOrderRequest {
  case_id: string;
  product?: string; // Optional product type for validation
}

export async function POST(request: Request) {
  try {
    const user = await requireServerAuth();
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

    // Verify case ownership
    const { data: caseData, error: caseError } = await supabase
      .from('cases')
      .select('id, user_id, jurisdiction, case_type, collected_facts')
      .eq('id', case_id)
      .single();

    if (caseError || !caseData) {
      return NextResponse.json(
        { ok: false, error: 'Case not found' },
        { status: 404 }
      );
    }

    if (caseData.user_id !== user.id) {
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
    let orderQuery = adminClient
      .from('orders')
      .select('id, payment_status, product_type, user_id, paid_at')
      .eq('case_id', case_id)
      .eq('payment_status', 'paid');

    // If product is specified, validate it matches the order
    if (product) {
      orderQuery = orderQuery.eq('product_type', product);
    }

    const { data: order, error: orderError } = await orderQuery
      .order('paid_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (orderError) {
      console.error('Failed to fetch order:', orderError);
      return NextResponse.json(
        { ok: false, error: 'Failed to fetch order' },
        { status: 500 }
      );
    }

    if (!order) {
      const productMsg = product ? ` for product "${product}"` : '';
      return NextResponse.json(
        { ok: false, error: `No paid order found${productMsg}. Please complete your purchase first.` },
        { status: 402 }
      );
    }

    // Defense in depth: verify order belongs to this user
    if (order.user_id && order.user_id !== user.id) {
      console.error(`Order user_id mismatch: order=${order.user_id}, user=${user.id}`);
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
    // =========================================================================
    const wizardFacts = caseData.collected_facts as Record<string, unknown> | null;
    const timingData: ComplianceTimingData = {
      tenancy_start_date: (caseData as any).tenancy_start_date || wizardFacts?.tenancy_start_date as string,
      occupation_date: wizardFacts?.occupation_date as string,
      epc_provided_date: wizardFacts?.epc_provided_date as string,
      gas_safety_check_date: wizardFacts?.gas_safety_check_date as string,
      gas_safety_provided_date: wizardFacts?.gas_safety_served_date as string,
      has_gas_at_property: wizardFacts?.has_gas_appliances as boolean,
      gas_safety_before_occupation: wizardFacts?.gas_safety_before_occupation as boolean,
      gas_safety_before_occupation_date: wizardFacts?.gas_safety_before_occupation_date as string,
      gas_safety_record_served_pre_occupation_date: wizardFacts?.gas_safety_record_served_pre_occupation_date as string,
      how_to_rent_provided_date: wizardFacts?.how_to_rent_date as string,
      deposit_received_date: wizardFacts?.deposit_received_date as string,
      prescribed_info_served_date: wizardFacts?.prescribed_info_served_date as string,
    };

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

    // Get existing FINAL documents to delete (NOT previews)
    const { data: existingDocs, error: docsError } = await adminClient
      .from('documents')
      .select('id, pdf_url')
      .eq('case_id', case_id)
      .eq('is_preview', false);

    if (docsError) {
      console.error('Failed to fetch existing documents:', docsError);
      return NextResponse.json(
        { ok: false, error: 'Failed to fetch existing documents' },
        { status: 500 }
      );
    }

    // Set order status to processing
    await adminClient
      .from('orders')
      .update({ fulfillment_status: 'processing' })
      .eq('id', order.id);

    try {
      // Delete existing final documents from storage and database
      if (existingDocs && existingDocs.length > 0) {
        // Extract storage paths from URLs and delete from storage
        const storagePaths: string[] = [];
        for (const doc of existingDocs) {
          if (doc.pdf_url) {
            // URL format: https://xxx.supabase.co/storage/v1/object/public/documents/userId/caseId/filename.pdf
            const match = doc.pdf_url.match(/\/documents\/(.+)$/);
            if (match && match[1]) {
              storagePaths.push(match[1]);
            }
          }
        }

        // Delete from storage (batch delete)
        if (storagePaths.length > 0) {
          const { error: storageError } = await adminClient.storage
            .from('documents')
            .remove(storagePaths);

          if (storageError) {
            console.warn('Failed to delete some storage files:', storageError);
            // Continue anyway - orphaned files are better than blocking regeneration
          }
        }

        // Delete document records from database
        const docIds = existingDocs.map((d) => d.id);
        const { error: deleteError } = await adminClient
          .from('documents')
          .delete()
          .in('id', docIds);

        if (deleteError) {
          console.error('Failed to delete document records:', deleteError);
          // Throw to trigger error handling
          throw new Error('Failed to delete existing documents before regeneration');
        }
      }

      // Now regenerate using the fulfillment logic
      const result = await fulfillOrder({
        orderId: order.id,
        caseId: case_id,
        productType: order.product_type,
        userId: resolvedUserId,
      });

      // Get the newly created document IDs
      const { data: newDocs } = await adminClient
        .from('documents')
        .select('id')
        .eq('case_id', case_id)
        .eq('is_preview', false);

      return NextResponse.json(
        {
          ok: true,
          regenerated_count: result.documents,
          document_ids: newDocs?.map((d) => d.id) || [],
        },
        { status: 200 }
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
