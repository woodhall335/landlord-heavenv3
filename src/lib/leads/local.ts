/**
 * Local Storage Helpers for Lead Capture
 *
 * Tracks whether user has provided their email across the session.
 * Used for email gates on free tools and Ask Heaven.
 */

const LEAD_EMAIL_KEY = 'lh_lead_email';
const LEAD_CAPTURED_KEY = 'lh_lead_captured';

/**
 * Get the captured lead email from localStorage.
 * Returns null if not set or if running on server.
 */
export function getLeadEmail(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(LEAD_EMAIL_KEY);
  } catch {
    return null;
  }
}

/**
 * Set the lead email in localStorage.
 * Also sets the captured flag.
 */
export function setLeadEmail(email: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LEAD_EMAIL_KEY, email);
    localStorage.setItem(LEAD_CAPTURED_KEY, '1');
  } catch {
    // Silently fail if localStorage is not available
  }
}

/**
 * Check if a lead has been captured in this browser session.
 */
export function isLeadCaptured(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(LEAD_CAPTURED_KEY) === '1';
  } catch {
    return false;
  }
}

/**
 * Clear lead data from localStorage.
 * Useful for testing or if user requests data deletion.
 */
export function clearLeadData(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(LEAD_EMAIL_KEY);
    localStorage.removeItem(LEAD_CAPTURED_KEY);
  } catch {
    // Silently fail
  }
}
