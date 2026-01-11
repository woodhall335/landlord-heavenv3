/**
 * Checkout Redirect URL Generation
 *
 * Centralized helper for generating success/cancel URLs for Stripe checkout.
 *
 * Product Routing:
 * ALL products now redirect to /dashboard/cases/[caseId]?payment=success
 *
 * The dashboard has robust polling, retry logic, and error handling that works
 * better than the dedicated success page for all products. This prevents issues
 * where:
 * - Webhook delays cause orderStatus.paid to be false
 * - API failures cause orderStatus to be null
 * - Either case would cause the success page to show "Preparing..." forever
 *
 * Fallback (no caseId) => /dashboard?session_id={CHECKOUT_SESSION_ID}
 */

export type CheckoutProduct =
  | 'notice_only'
  | 'complete_pack'
  | 'money_claim'
  | 'sc_money_claim'
  | 'ast_standard'
  | 'ast_premium';

export interface CheckoutRedirectInput {
  product: CheckoutProduct;
  caseId?: string;
  baseUrl?: string;
}

export interface CheckoutRedirectResult {
  successUrl: string;
  cancelUrl: string;
}

/**
 * Get the base URL for redirects.
 * Uses NEXT_PUBLIC_APP_URL in production, localhost in development.
 */
function getBaseUrl(providedBaseUrl?: string): string {
  if (providedBaseUrl) {
    return providedBaseUrl;
  }

  // Client-side: use window.location.origin
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  // Server-side: use environment variables
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.NODE_ENV === 'production'
      ? 'https://landlordheaven.co.uk'
      : 'http://localhost:5000')
  );
}

/**
 * Generate the success URL for a checkout session.
 *
 * ALL products redirect to /dashboard/cases/[caseId]?payment=success
 * The dashboard has robust polling, retry logic, and error handling.
 *
 * @param product - The product being purchased (unused, kept for API compat)
 * @param caseId - Optional case ID
 * @param baseUrl - Optional base URL override
 * @returns The success URL to redirect to after payment
 */
export function getSuccessUrl(input: CheckoutRedirectInput): string {
  const { caseId, baseUrl } = input;
  const base = getBaseUrl(baseUrl);

  // All products go to case dashboard with payment flag
  if (caseId) {
    return `${base}/dashboard/cases/${caseId}?payment=success`;
  }

  // Fallback: dashboard with session ID for Stripe to inject
  return `${base}/dashboard?session_id={CHECKOUT_SESSION_ID}`;
}

/**
 * Generate the cancel URL for a checkout session.
 *
 * @param product - The product being purchased
 * @param caseId - Optional case ID
 * @param baseUrl - Optional base URL override
 * @returns The cancel URL to redirect to if payment is cancelled
 */
export function getCancelUrl(input: CheckoutRedirectInput): string {
  const { product, caseId, baseUrl } = input;
  const base = getBaseUrl(baseUrl);

  // If we have a case, return to the preview page
  if (caseId) {
    return `${base}/wizard/preview/${caseId}?payment=cancelled`;
  }

  // Fallback: dashboard
  return `${base}/dashboard`;
}

/**
 * Get both success and cancel URLs for a checkout session.
 *
 * @param input - Product, caseId, and optional baseUrl
 * @returns Object with successUrl and cancelUrl
 */
export function getCheckoutRedirectUrls(input: CheckoutRedirectInput): CheckoutRedirectResult {
  return {
    successUrl: getSuccessUrl(input),
    cancelUrl: getCancelUrl(input),
  };
}
