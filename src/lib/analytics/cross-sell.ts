/**
 * Cross-Sell Analytics Tracking
 *
 * Provides observability for cross-sell performance:
 * - cross_sell_impression: When a cross-sell is shown
 * - cross_sell_click: When a cross-sell CTA is clicked
 * - wizard_attribution_missing_detected: When wizard entry lacks src param
 *
 * All events are anonymized (no PII).
 */

import { trackEvent } from '@/lib/analytics';
import type { WizardProduct } from '@/lib/wizard/buildWizardLink';
import type { CrossSellSource } from '@/lib/cross-sell/recommendations';

// =============================================================================
// CROSS-SELL TRACKING
// =============================================================================

/**
 * Track when a cross-sell recommendation is shown to the user.
 * Called on component mount when cross-sell becomes visible.
 *
 * @param page - Current page path (e.g., '/how-to-evict-tenant')
 * @param targetProduct - The product being recommended
 */
export function trackCrossSellImpression(
  page: string,
  targetProduct: WizardProduct
): void {
  trackEvent('cross_sell_impression', {
    event_category: 'cross_sell',
    page,
    target_product: targetProduct,
    timestamp: new Date().toISOString(),
  });

  // Also track to FB for retargeting
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'ViewContent', {
      content_name: `cross_sell_${targetProduct}`,
      content_category: 'cross_sell',
      content_type: 'recommendation',
    });
  }
}

/**
 * Track when a user clicks a cross-sell CTA.
 *
 * @param page - Current page path where cross-sell was shown
 * @param targetProduct - The product being recommended
 * @param src - Cross-sell source identifier for attribution
 */
export function trackCrossSellClick(
  page: string,
  targetProduct: WizardProduct,
  src: CrossSellSource
): void {
  trackEvent('cross_sell_click', {
    event_category: 'cross_sell',
    page,
    target_product: targetProduct,
    src,
    timestamp: new Date().toISOString(),
  });

  // Track as AddToCart intent for FB
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'AddToCart', {
      content_name: targetProduct,
      content_category: 'cross_sell',
      content_type: 'product',
    });
  }
}

/**
 * Track conversion rate by logging when cross-sell leads to purchase.
 * Call this from the checkout success handler when attributable to cross-sell.
 *
 * @param targetProduct - The product that was purchased
 * @param originalSrc - The cross-sell source that led to purchase
 * @param revenue - Purchase value
 */
export function trackCrossSellConversion(
  targetProduct: WizardProduct,
  originalSrc: CrossSellSource,
  revenue: number
): void {
  trackEvent('cross_sell_conversion', {
    event_category: 'cross_sell',
    target_product: targetProduct,
    src: originalSrc,
    revenue,
    timestamp: new Date().toISOString(),
  });
}

// =============================================================================
// ATTRIBUTION OBSERVABILITY
// =============================================================================

/**
 * Track when a wizard entry is detected without src parameter.
 * This should approach zero as we fix attribution gaps.
 *
 * @param entryPath - The wizard entry URL
 * @param referrer - Document referrer if available
 */
export function trackWizardAttributionMissing(
  entryPath: string,
  referrer?: string
): void {
  trackEvent('wizard_attribution_missing_detected', {
    event_category: 'attribution',
    entry_path: entryPath,
    referrer: referrer || 'direct',
    timestamp: new Date().toISOString(),
  });
}

/**
 * Check if a wizard URL has proper attribution.
 * Returns false if src parameter is missing or empty.
 */
export function hasValidAttribution(url: string): boolean {
  try {
    const urlObj = new URL(url, 'https://landlordheaven.co.uk');
    const src = urlObj.searchParams.get('src');
    return !!src && src.length > 0;
  } catch {
    return false;
  }
}

/**
 * Validate and track wizard entry attribution.
 * Call this when wizard page loads.
 *
 * @param searchParams - URL search params from wizard entry
 * @returns true if attribution is valid, false if missing
 */
export function validateWizardAttribution(
  searchParams: URLSearchParams | string
): boolean {
  const params = typeof searchParams === 'string'
    ? new URLSearchParams(searchParams)
    : searchParams;

  const src = params.get('src');
  const hasAttribution = !!src && src.length > 0;

  if (!hasAttribution) {
    // Only track on client side
    if (typeof window !== 'undefined') {
      trackWizardAttributionMissing(
        window.location.href,
        document.referrer
      );
    }
  }

  return hasAttribution;
}

// =============================================================================
// OBSERVABILITY METRICS HELPERS
// =============================================================================

/**
 * Get cross-sell performance summary for a time period.
 * This is a client-side helper - actual metrics come from analytics dashboard.
 */
export interface CrossSellMetrics {
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number; // Click-through rate
  conversionRate: number;
}

/**
 * Metric names for setting up analytics dashboards.
 */
export const CROSS_SELL_METRICS = {
  IMPRESSION: 'cross_sell_impression',
  CLICK: 'cross_sell_click',
  CONVERSION: 'cross_sell_conversion',
  ATTRIBUTION_MISSING: 'wizard_attribution_missing_detected',
} as const;

/**
 * Recommended GA4 custom dimensions for cross-sell tracking.
 * Configure these in Google Analytics admin panel.
 */
export const CROSS_SELL_DIMENSIONS = {
  page: 'The page where cross-sell was displayed',
  target_product: 'The product being recommended',
  src: 'Attribution source for the cross-sell',
  angle: 'The cross-sell angle (arrears, future_proofing, etc.)',
} as const;

/**
 * Debug helper to log cross-sell events in development.
 */
export function debugCrossSellEvent(
  eventName: string,
  params: Record<string, unknown>
): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[CrossSell] ${eventName}:`, params);
  }
}
