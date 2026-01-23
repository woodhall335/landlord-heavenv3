/**
 * Vercel Analytics Event Tracking
 *
 * Client-side helper for tracking funnel events with Vercel Analytics.
 * All events are tracked without PII (no names, addresses, emails).
 */

import { track as vercelTrack } from '@vercel/analytics';

/**
 * Type-safe event names for funnel tracking
 */
export type FunnelEvent =
  | 'wizard_preview_viewed'
  | 'checkout_started'
  | 'payment_success_landed'
  | 'document_download_clicked'
  | 'case_archived'
  | 'free_tool_viewed'
  | 'validator_completed'
  | 'upsell_clicked'
  // New product conversion tracking events
  | 'product_selected'
  | 'purchase_completed'
  | 'product_region_blocked';

export type ToolType = 'validator' | 'generator' | 'calculator' | 'checker';

/**
 * Event properties for each funnel event (no PII)
 */
export interface WizardPreviewViewedProps {
  product?: string;
  route?: string;
  jurisdiction?: string;
}

export interface CheckoutStartedProps {
  product: string;
}

export interface PaymentSuccessLandedProps {
  product?: string;
  caseId_present: boolean;
}

export interface DocumentDownloadClickedProps {
  document_type: string;
  product?: string;
}

export interface CaseArchivedProps {
  had_paid_order: boolean;
}

export interface FreeToolViewedProps {
  tool_name: string;
  tool_type: ToolType;
  jurisdiction?: string;
}

export interface ValidatorCompletedProps {
  validator_key: string;
  status: string;
  blockers: number;
  warnings: number;
  jurisdiction?: string;
}

export interface UpsellClickedProps {
  tool_name: string;
  tool_type: ToolType;
  product: string;
  destination: string;
  jurisdiction?: string;
}

// =============================================================================
// Product Conversion Tracking Event Props
// =============================================================================

/**
 * Props for product selection event
 * Fired when user selects a product in the wizard
 */
export interface ProductSelectedProps {
  productId: string;
  price: number;
  region: string;
  wizardStep: string;
  source?: string; // 'wizard' | 'upsell' | 'direct'
}

/**
 * Enhanced props for checkout started event
 * Includes region and cart value for conversion analysis
 */
export interface CheckoutStartedEnhancedProps {
  productId: string;
  price: number;
  region: string;
  cartValue: number;
  route?: string;
}

/**
 * Props for purchase completed event
 * Fired when payment is confirmed
 */
export interface PurchaseCompletedProps {
  productId: string;
  price: number;
  region: string;
  revenue: number;
  orderId?: string;
  route?: string;
}

/**
 * Props for product region blocked event
 * Fired when user tries to access a region-restricted product
 */
export interface ProductRegionBlockedProps {
  productId: string;
  region: string;
  blockedReason: string;
  suggestedAlternative?: string;
}

/**
 * Check if we're in a browser environment
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Track a wizard preview viewed event
 * Fired when user views a preview of documents
 */
export function trackWizardPreviewViewed(props: WizardPreviewViewedProps): void {
  if (!isBrowser()) return;

  try {
    vercelTrack('wizard_preview_viewed', {
      product: props.product || 'unknown',
      route: props.route || 'unknown',
      jurisdiction: props.jurisdiction || 'unknown',
    });
  } catch (error) {
    console.warn('[analytics] Failed to track wizard_preview_viewed:', error);
  }
}

/**
 * Track when checkout is started
 * Fired when user clicks "Buy" or proceeds to payment
 */
export function trackCheckoutStarted(props: CheckoutStartedProps): void {
  if (!isBrowser()) return;

  try {
    vercelTrack('checkout_started', {
      product: props.product,
    });
  } catch (error) {
    console.warn('[analytics] Failed to track checkout_started:', error);
  }
}

/**
 * Track when user lands on payment success page
 * Fired when user returns from Stripe with payment=success
 */
export function trackPaymentSuccessLanded(props: PaymentSuccessLandedProps): void {
  if (!isBrowser()) return;

  try {
    vercelTrack('payment_success_landed', {
      product: props.product || 'unknown',
      caseId_present: props.caseId_present,
    });
  } catch (error) {
    console.warn('[analytics] Failed to track payment_success_landed:', error);
  }
}

/**
 * Track when user clicks to download a document
 * Fired on document download button click
 */
export function trackDocumentDownloadClicked(props: DocumentDownloadClickedProps): void {
  if (!isBrowser()) return;

  try {
    vercelTrack('document_download_clicked', {
      document_type: props.document_type,
      product: props.product || 'unknown',
    });
  } catch (error) {
    console.warn('[analytics] Failed to track document_download_clicked:', error);
  }
}

/**
 * Track when user archives/deletes a case
 * Fired after successful case archival
 */
export function trackCaseArchived(props: CaseArchivedProps): void {
  if (!isBrowser()) return;

  try {
    vercelTrack('case_archived', {
      had_paid_order: props.had_paid_order,
    });
  } catch (error) {
    console.warn('[analytics] Failed to track case_archived:', error);
  }
}

/**
 * Track when a free tool is viewed
 */
export function trackFreeToolViewed(props: FreeToolViewedProps): void {
  if (!isBrowser()) return;

  try {
    vercelTrack('free_tool_viewed', {
      tool_name: props.tool_name,
      tool_type: props.tool_type,
      jurisdiction: props.jurisdiction || 'unknown',
    });
  } catch (error) {
    console.warn('[analytics] Failed to track free_tool_viewed:', error);
  }
}

/**
 * Track when a validator completes and returns a result
 */
export function trackValidatorCompleted(props: ValidatorCompletedProps): void {
  if (!isBrowser()) return;

  try {
    vercelTrack('validator_completed', {
      validator_key: props.validator_key,
      status: props.status,
      blockers: props.blockers,
      warnings: props.warnings,
      jurisdiction: props.jurisdiction || 'unknown',
    });
  } catch (error) {
    console.warn('[analytics] Failed to track validator_completed:', error);
  }
}

/**
 * Track when a user clicks an upsell CTA
 */
export function trackUpsellClicked(props: UpsellClickedProps): void {
  if (!isBrowser()) return;

  try {
    vercelTrack('upsell_clicked', {
      tool_name: props.tool_name,
      tool_type: props.tool_type,
      product: props.product,
      destination: props.destination,
      jurisdiction: props.jurisdiction || 'unknown',
    });
  } catch (error) {
    console.warn('[analytics] Failed to track upsell_clicked:', error);
  }
}

/**
 * Generic track function for custom events
 * Use sparingly - prefer typed functions above
 */
export function trackEvent(
  event: FunnelEvent,
  properties?: Record<string, string | number | boolean>
): void {
  if (!isBrowser()) return;

  try {
    vercelTrack(event, properties || {});
  } catch (error) {
    console.warn(`[analytics] Failed to track ${event}:`, error);
  }
}

// =============================================================================
// Product Conversion Tracking Functions
// =============================================================================

/**
 * Track when a product is selected in the wizard
 * Fired when user chooses a product (Notice Only, Eviction Pack, etc.)
 */
export function trackProductSelected(props: ProductSelectedProps): void {
  if (!isBrowser()) return;

  try {
    vercelTrack('product_selected', {
      product_id: props.productId,
      price: props.price,
      region: props.region,
      wizard_step: props.wizardStep,
      source: props.source || 'wizard',
    });
  } catch (error) {
    console.warn('[analytics] Failed to track product_selected:', error);
  }
}

/**
 * Track when checkout starts with enhanced product/region data
 * Includes price and region for conversion funnel analysis
 */
export function trackCheckoutStartedEnhanced(props: CheckoutStartedEnhancedProps): void {
  if (!isBrowser()) return;

  try {
    vercelTrack('checkout_started', {
      product_id: props.productId,
      price: props.price,
      region: props.region,
      cart_value: props.cartValue,
      route: props.route || 'unknown',
    });
  } catch (error) {
    console.warn('[analytics] Failed to track checkout_started:', error);
  }
}

/**
 * Track when a purchase is completed
 * Fired after successful payment confirmation
 */
export function trackPurchaseCompleted(props: PurchaseCompletedProps): void {
  if (!isBrowser()) return;

  try {
    vercelTrack('purchase_completed', {
      product_id: props.productId,
      price: props.price,
      region: props.region,
      revenue: props.revenue,
      order_id: props.orderId || 'unknown',
      route: props.route || 'unknown',
    });
  } catch (error) {
    console.warn('[analytics] Failed to track purchase_completed:', error);
  }
}

/**
 * Track when a product is blocked due to regional restrictions
 * Helps measure demand for unavailable products by region
 */
export function trackProductRegionBlocked(props: ProductRegionBlockedProps): void {
  if (!isBrowser()) return;

  try {
    vercelTrack('product_region_blocked', {
      product_id: props.productId,
      region: props.region,
      blocked_reason: props.blockedReason,
      suggested_alternative: props.suggestedAlternative || 'none',
    });
  } catch (error) {
    console.warn('[analytics] Failed to track product_region_blocked:', error);
  }
}
