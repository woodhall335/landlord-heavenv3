/**
 * Checkout Redirect URL Generation
 *
 * Centralized helper for generating success/cancel URLs for Stripe checkout.
 *
 * Product Routing:
 * - Single-transaction products (notice_only, ast_standard, ast_premium) => /success/[product]/[caseId]
 * - Complex products (complete_pack, money_claim, sc_money_claim) => /dashboard/cases/[caseId]?payment=success
 * - Fallback (no caseId) => /dashboard?session_id={CHECKOUT_SESSION_ID}
 */

export type CheckoutProduct =
  | 'notice_only'
  | 'complete_pack'
  | 'money_claim'
  | 'sc_money_claim'
  | 'ast_standard'
  | 'ast_premium';

/**
 * Products that should route to the dedicated success page.
 * These are single-transaction products with a simple download flow.
 */
const SINGLE_TRANSACTION_PRODUCTS: ReadonlySet<CheckoutProduct> = new Set([
  'notice_only',
  'ast_standard',
  'ast_premium',
]);

/**
 * Products that should route to the case dashboard.
 * These are complex products requiring document generation/polling.
 */
const DASHBOARD_PRODUCTS: ReadonlySet<CheckoutProduct> = new Set([
  'complete_pack',
  'money_claim',
  'sc_money_claim',
]);

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
 * Determines if a product should route to the dedicated success page.
 */
export function isSingleTransactionProduct(product: CheckoutProduct): boolean {
  return SINGLE_TRANSACTION_PRODUCTS.has(product);
}

/**
 * Determines if a product should route to the dashboard.
 */
export function isDashboardProduct(product: CheckoutProduct): boolean {
  return DASHBOARD_PRODUCTS.has(product);
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
 * @param product - The product being purchased
 * @param caseId - Optional case ID (required for case-based products)
 * @param baseUrl - Optional base URL override
 * @returns The success URL to redirect to after payment
 *
 * Routing:
 * - notice_only, ast_standard, ast_premium => /success/{product}/{caseId}
 * - complete_pack, money_claim, sc_money_claim => /dashboard/cases/{caseId}?payment=success
 * - Fallback (no caseId) => /dashboard?session_id={CHECKOUT_SESSION_ID}
 */
export function getSuccessUrl(input: CheckoutRedirectInput): string {
  const { product, caseId, baseUrl } = input;
  const base = getBaseUrl(baseUrl);

  // Single-transaction products go to dedicated success page
  if (caseId && isSingleTransactionProduct(product)) {
    return `${base}/success/${product}/${caseId}`;
  }

  // Dashboard products go to case page with payment flag
  if (caseId && isDashboardProduct(product)) {
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
