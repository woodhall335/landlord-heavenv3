/**
 * Cases API - List
 *
 * GET /api/cases
 * Lists all cases for the authenticated user with optional filtering
 * Includes order status information for derived display status
 */

import { createServerSupabaseClient, requireServerAuth } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { deriveDisplayStatus } from '@/lib/case-status';

export async function GET(request: Request) {
  try {
    const user = await requireServerAuth();
    const { searchParams } = new URL(request.url);
    const supabase = await createServerSupabaseClient();

    // Optional filters
    const caseType = searchParams.get('case_type');
    const jurisdiction = searchParams.get('jurisdiction');
    const status = searchParams.get('status');
    const councilCode = searchParams.get('council_code');
    const includeArchived = searchParams.get('include_archived') === 'true';

    // Build query
    let query = supabase
      .from('cases')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    // Exclude archived by default unless explicitly requested
    if (!includeArchived && !status) {
      query = query.neq('status', 'archived');
    }

    // Apply filters
    if (caseType) {
      query = query.eq('case_type', caseType);
    }

    if (jurisdiction) {
      query = query.eq('jurisdiction', jurisdiction);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (councilCode) {
      query = query.eq('council_code', councilCode);
    }

    const { data: cases, error } = await query;

    if (error) {
      console.error('Failed to fetch cases:', error);
      return NextResponse.json(
        { error: 'Failed to fetch cases' },
        { status: 500 }
      );
    }

    // Fetch orders for all cases to include payment/fulfillment status
    const caseIds = (cases || []).map((c: any) => c.id);
    const { data: orders } = caseIds.length > 0
      ? await supabase
          .from('orders')
          .select('case_id, payment_status, fulfillment_status')
          .in('case_id', caseIds)
      : { data: [] };

    // Create a map of case_id to order info (use most recent paid order if multiple)
    const orderMap = new Map<string, { payment_status: string; fulfillment_status: string }>();
    for (const order of orders || []) {
      const existing = orderMap.get(order.case_id);
      // Prefer paid orders over unpaid
      if (!existing || order.payment_status === 'paid') {
        orderMap.set(order.case_id, {
          payment_status: order.payment_status,
          fulfillment_status: order.fulfillment_status,
        });
      }
    }

    // Fetch document counts for fulfilled cases
    const fulfilledCaseIds = Array.from(orderMap.entries())
      .filter(([_, o]) => o.payment_status === 'paid')
      .map(([caseId]) => caseId);

    const { data: docCounts } = fulfilledCaseIds.length > 0
      ? await supabase
          .from('documents')
          .select('case_id')
          .in('case_id', fulfilledCaseIds)
          .eq('is_preview', false)
      : { data: [] };

    // Count documents per case
    const docCountMap = new Map<string, number>();
    for (const doc of docCounts || []) {
      docCountMap.set(doc.case_id, (docCountMap.get(doc.case_id) || 0) + 1);
    }

    // Enhance cases with order info and derived status
    const enhancedCases = (cases || []).map((c: any) => {
      const orderInfo = orderMap.get(c.id);
      const hasFinalDocuments = (docCountMap.get(c.id) || 0) > 0;
      const isPaid = orderInfo?.payment_status === 'paid';

      // Calculate effective wizard progress:
      // - 100% if wizard is complete (wizard_completed_at is set)
      // - 100% if case is paid (payment implies wizard was completed)
      // - Otherwise use the stored wizard_progress
      const isWizardComplete = c.wizard_completed_at != null && c.wizard_completed_at !== '';
      const effectiveWizardProgress = (isWizardComplete || isPaid) ? 100 : (c.wizard_progress || 0);

      const displayStatusInfo = deriveDisplayStatus({
        caseStatus: c.status,
        wizardProgress: effectiveWizardProgress,
        wizardCompletedAt: c.wizard_completed_at,
        paymentStatus: orderInfo?.payment_status || null,
        fulfillmentStatus: orderInfo?.fulfillment_status || null,
        hasFinalDocuments,
      });

      return {
        ...c,
        // Override wizard_progress with effective value
        wizard_progress: effectiveWizardProgress,
        // Order status flags for UI
        has_paid_order: isPaid,
        has_fulfilled_order: orderInfo?.fulfillment_status === 'fulfilled',
        payment_status: orderInfo?.payment_status || null,
        fulfillment_status: orderInfo?.fulfillment_status || null,
        has_final_documents: hasFinalDocuments,
        // Derived display status
        display_status: displayStatusInfo.status,
        display_label: displayStatusInfo.label,
        display_badge_variant: displayStatusInfo.badgeVariant,
      };
    });

    // Calculate statistics (exclude archived from totals unless included)
    const activeCases = includeArchived
      ? enhancedCases
      : enhancedCases.filter((c: any) => c.status !== 'archived');

    const stats = {
      total: activeCases.length,
      in_progress: activeCases.filter((c: any) =>
        c.display_status === 'in_progress' ||
        c.display_status === 'paid_in_progress' ||
        c.display_status === 'ready_to_purchase'
      ).length,
      completed: activeCases.filter((c: any) =>
        c.display_status === 'documents_ready' || c.display_status === 'completed'
      ).length,
      archived: enhancedCases.filter((c: any) => c.status === 'archived').length,
    };

    return NextResponse.json(
      {
        success: true,
        cases: enhancedCases,
        stats,
      },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.message === 'Unauthorized - Please log in') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.error('List cases error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
