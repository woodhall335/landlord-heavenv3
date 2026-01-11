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

export interface RegenerateOrderRequest {
  case_id: string;
}

export interface RegenerateOrderResponse {
  ok: boolean;
  regenerated_count?: number;
  document_ids?: string[];
  error?: string;
  message?: string;
}

export async function POST(request: Request) {
  try {
    const user = await requireServerAuth();
    const body: RegenerateOrderRequest = await request.json();

    const { case_id } = body;

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

    // Find the paid order for this case
    const { data: order, error: orderError } = await adminClient
      .from('orders')
      .select('id, payment_status, product_type, user_id')
      .eq('case_id', case_id)
      .eq('payment_status', 'paid')
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
      return NextResponse.json(
        { ok: false, error: 'No paid order found for this case. Please complete your purchase first.' },
        { status: 402 }
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
      // Store error in order metadata
      const errorMessage = fulfillmentError?.message || 'Document regeneration failed';
      const truncatedError = errorMessage.substring(0, 500);

      // Get current metadata to merge
      const { data: orderForError } = await adminClient
        .from('orders')
        .select('metadata')
        .eq('id', order.id)
        .single();

      const metadataForError = (orderForError?.metadata as Record<string, unknown>) || {};

      await adminClient
        .from('orders')
        .update({
          fulfillment_status: 'failed',
          metadata: {
            ...metadataForError,
            fulfillment_error: truncatedError,
            last_regeneration_attempt: new Date().toISOString(),
          },
        })
        .eq('id', order.id);

      console.error('Regeneration failed:', fulfillmentError);

      return NextResponse.json(
        {
          ok: false,
          error: 'Document regeneration failed',
          message: truncatedError,
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
