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
  | 'upsell_clicked';

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
