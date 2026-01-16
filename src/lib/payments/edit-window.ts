/**
 * Edit Window - 30-Day Edit/Regenerate Policy
 *
 * Paid users can edit answers and regenerate documents unlimited times
 * for 30 days after payment. After that, the case is locked but downloads
 * remain available forever.
 *
 * IMPORTANT: Server-side enforcement is required. UI messaging is only
 * for display - never trust client clock for enforcement.
 */

/**
 * Number of days after payment during which edits and regeneration are allowed.
 */
export const EDIT_WINDOW_DAYS = 30;

/**
 * Reason codes for why the edit window is closed.
 */
export type EditWindowClosedReason = 'NOT_PAID' | 'EXPIRED';

/**
 * Status of the edit window for a case.
 */
export interface EditWindowStatus {
  /** Whether the case has a paid order */
  isPaid: boolean;
  /** Whether the edit window is currently open (can edit/regenerate) */
  isOpen: boolean;
  /** ISO string of when the edit window ends (null if not paid) */
  endsAt: string | null;
  /** Reason why editing is not allowed (null if allowed) */
  reason: EditWindowClosedReason | null;
}

/**
 * Calculate when the edit window ends for a given payment date.
 *
 * @param paidAt - The date/time when payment was made
 * @returns Date when the edit window ends (30 days after payment)
 */
export function getEditWindowEndsAt(paidAt: string | Date): Date {
  const paymentDate = typeof paidAt === 'string' ? new Date(paidAt) : paidAt;
  const endsAt = new Date(paymentDate);
  endsAt.setDate(endsAt.getDate() + EDIT_WINDOW_DAYS);
  return endsAt;
}

/**
 * Check if the edit window is currently open (within 30 days of payment).
 *
 * @param paidAt - The date/time when payment was made
 * @param now - Current date/time (for testing, defaults to now)
 * @returns true if the edit window is still open
 */
export function isEditWindowOpen(paidAt: string | Date, now: Date = new Date()): boolean {
  const endsAt = getEditWindowEndsAt(paidAt);
  return now < endsAt;
}

/**
 * Get the full edit window status for a case.
 *
 * @param paidAt - The date/time when payment was made, or null if not paid
 * @param now - Current date/time (for testing, defaults to now)
 * @returns EditWindowStatus with all relevant information
 */
export function getEditWindowStatus(
  paidAt: string | Date | null,
  now: Date = new Date()
): EditWindowStatus {
  // Not paid - editing allowed (wizard flow), but not because of edit window
  if (!paidAt) {
    return {
      isPaid: false,
      isOpen: false,
      endsAt: null,
      reason: 'NOT_PAID',
    };
  }

  const endsAt = getEditWindowEndsAt(paidAt);
  const isOpen = now < endsAt;

  return {
    isPaid: true,
    isOpen,
    endsAt: endsAt.toISOString(),
    reason: isOpen ? null : 'EXPIRED',
  };
}

/**
 * Format the edit window end date for display.
 *
 * @param endsAt - ISO string or Date of when the window ends
 * @returns Human-readable date string
 */
export function formatEditWindowEndDate(endsAt: string | Date): string {
  const date = typeof endsAt === 'string' ? new Date(endsAt) : endsAt;
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
