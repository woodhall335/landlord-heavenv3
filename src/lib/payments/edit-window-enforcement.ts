/**
 * Edit Window Server-Side Enforcement
 *
 * Helper functions for enforcing the 30-day edit/regenerate window on server-side
 * mutation endpoints. This is the authoritative enforcement layer - UI messaging
 * is only for display.
 *
 * Rules:
 * - If order is paid AND edit window expired: Block with 403
 * - If order is unpaid: Allow (wizard can proceed)
 * - Downloads are never blocked
 */

import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { getEditWindowStatus, type EditWindowStatus } from './edit-window';

/**
 * Error response returned when the edit window has expired.
 */
export interface EditWindowExpiredError {
  error: 'EDIT_WINDOW_EXPIRED';
  message: string;
  ends_at: string;
}

/**
 * Result of checking if a case mutation is allowed.
 */
export interface MutationCheckResult {
  /** Whether the mutation is allowed */
  allowed: boolean;
  /** Whether the case has a paid order */
  hasPaidOrder: boolean;
  /** Edit window status details */
  editWindow: EditWindowStatus | null;
  /** Error response if mutation is blocked (only when allowed=false) */
  errorResponse?: NextResponse;
}

/**
 * Check if a mutation (edit/regenerate) is allowed for a case.
 *
 * Call this at the start of any endpoint that modifies case data or regenerates documents.
 * If allowed=false, return the errorResponse immediately.
 *
 * @param caseId - The case ID to check
 * @returns MutationCheckResult with allowed status and error response if blocked
 *
 * @example
 * ```ts
 * const check = await checkMutationAllowed(caseId);
 * if (!check.allowed) {
 *   return check.errorResponse;
 * }
 * // Proceed with mutation
 * ```
 */
export async function checkMutationAllowed(caseId: string): Promise<MutationCheckResult> {
  const adminClient = createSupabaseAdminClient();

  // Find the most recent paid order for this case
  const { data: order, error: orderError } = await adminClient
    .from('orders')
    .select('id, paid_at, payment_status')
    .eq('case_id', caseId)
    .eq('payment_status', 'paid')
    .order('paid_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (orderError) {
    console.error('[EDIT-WINDOW] Failed to fetch order:', orderError);
    // On error, allow the mutation (fail open for better UX)
    return {
      allowed: true,
      hasPaidOrder: false,
      editWindow: null,
    };
  }

  // No paid order - allow mutation (wizard flow, pre-payment)
  if (!order || !order.paid_at) {
    return {
      allowed: true,
      hasPaidOrder: false,
      editWindow: null,
    };
  }

  // Has paid order - check edit window
  const editWindow = getEditWindowStatus(order.paid_at);

  if (!editWindow.isOpen) {
    // Edit window expired - block mutation
    console.log('[EDIT-WINDOW] Mutation blocked - window expired', {
      caseId,
      paidAt: order.paid_at,
      endsAt: editWindow.endsAt,
    });

    const errorPayload: EditWindowExpiredError = {
      error: 'EDIT_WINDOW_EXPIRED',
      message: 'The 30-day editing period for this case has ended. Downloads remain available.',
      ends_at: editWindow.endsAt!,
    };

    return {
      allowed: false,
      hasPaidOrder: true,
      editWindow,
      errorResponse: NextResponse.json(errorPayload, { status: 403 }),
    };
  }

  // Edit window still open - allow mutation
  return {
    allowed: true,
    hasPaidOrder: true,
    editWindow,
  };
}

/**
 * Quick check if case has an active (paid, open window) order.
 * Use this when you need to know if the case is in the editable paid state.
 */
export async function hasActiveEditWindow(caseId: string): Promise<boolean> {
  const result = await checkMutationAllowed(caseId);
  return result.hasPaidOrder && result.allowed;
}
