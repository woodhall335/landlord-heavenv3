/**
 * Analytics Tracking Utilities
 *
 * Provides helper functions for tracking events in:
 * - Google Analytics 4 (GA4)
 * - Google Ads conversion tracking
 * - Facebook Pixel
 * - Vercel Analytics (via @vercel/analytics)
 *
 * Type definitions are in src/types/gtag.d.ts
 */

// Re-export Vercel Analytics tracking functions
export {
  trackWizardPreviewViewed,
  trackCheckoutStarted,
  trackPaymentSuccessLanded,
  trackDocumentDownloadClicked,
  trackCaseArchived,
  trackFreeToolViewed,
  trackValidatorCompleted,
  trackUpsellClicked,
  trackEvent as trackVercelEvent,
} from './analytics/track';

/**
 * Track a custom event in both Google Analytics and Facebook Pixel
 */
export function trackEvent(
  eventName: string,
  eventParams?: Record<string, any>
): void {
  // Google Analytics / Google Ads
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, eventParams);
  }

  // Facebook Pixel - map common events
  if (typeof window !== 'undefined' && window.fbq) {
    const fbEventName = mapToFacebookEvent(eventName);
    if (fbEventName) {
      window.fbq('track', fbEventName, eventParams);
    }
  }
}

/**
 * Map GA4 event names to Facebook standard events
 */
function mapToFacebookEvent(gaEventName: string): string | null {
  const eventMap: Record<string, string> = {
    page_view: 'PageView',
    view_item: 'ViewContent',
    add_to_cart: 'AddToCart',
    begin_checkout: 'InitiateCheckout',
    purchase: 'Purchase',
    lead: 'Lead',
    sign_up: 'CompleteRegistration',
    search: 'Search',
  };
  return eventMap[gaEventName.toLowerCase()] || null;
}

/**
 * Track a page view in Google Analytics
 */
export function trackPageView(url: string): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'page_view', {
      page_path: url,
    });
  }
}

/**
 * Attribution data for purchase tracking
 */
export interface PurchaseAttribution {
  landing_path?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  referrer?: string;
  jurisdiction?: string;
  product_type?: string;
}

/**
 * Track a purchase/transaction in Google Analytics and Facebook Pixel
 *
 * @param transactionId - Unique transaction/order ID
 * @param value - Transaction value
 * @param currency - Currency code (default: GBP)
 * @param items - Array of purchased items
 * @param attribution - Optional attribution data for campaign tracking
 */
export function trackPurchase(
  transactionId: string,
  value: number,
  currency: string = 'GBP',
  items?: Array<{
    item_id: string;
    item_name: string;
    item_category?: string;
    price: number;
    quantity?: number;
  }>,
  attribution?: PurchaseAttribution
): void {
  // Google Analytics / Google Ads - include attribution in event
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: transactionId,
      value,
      currency,
      items,
      // Attribution data for GA4 custom dimensions
      landing_path: attribution?.landing_path,
      utm_source: attribution?.utm_source,
      utm_medium: attribution?.utm_medium,
      utm_campaign: attribution?.utm_campaign,
      utm_term: attribution?.utm_term,
      utm_content: attribution?.utm_content,
      referrer: attribution?.referrer,
      jurisdiction: attribution?.jurisdiction,
      product_type: attribution?.product_type,
    });
  }

  // Facebook Pixel - include attribution in custom data
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Purchase', {
      value,
      currency,
      content_ids: items?.map(i => i.item_id) || [],
      content_name: items?.map(i => i.item_name).join(', ') || '',
      content_type: 'product',
      // Attribution for Facebook custom data
      ...(attribution && {
        landing_path: attribution.landing_path,
        utm_source: attribution.utm_source,
        utm_campaign: attribution.utm_campaign,
      }),
    });
  }
}

/**
 * Track product view
 */
export function trackProductView(
  productId: string,
  productName: string,
  category?: string,
  price?: number
): void {
  trackEvent('view_item', {
    currency: 'GBP',
    value: price || 0,
    items: [
      {
        item_id: productId,
        item_name: productName,
        item_category: category,
        price: price || 0,
      },
    ],
  });
}

/**
 * Track wizard/checkout start
 */
export function trackBeginCheckout(
  productId: string,
  productName: string,
  value: number
): void {
  // Google Analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'begin_checkout', {
      currency: 'GBP',
      value,
      items: [
        {
          item_id: productId,
          item_name: productName,
          price: value,
        },
      ],
    });
  }

  // Facebook Pixel
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'InitiateCheckout', {
      value,
      currency: 'GBP',
      content_ids: [productId],
      content_name: productName,
      content_type: 'product',
    });
  }
}

/**
 * Track lead capture (email signups from free tools)
 */
export function trackLead(source: string, email?: string): void {
  // Google Analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'generate_lead', {
      event_category: 'engagement',
      event_label: source,
      value: 1,
    });
  }

  // Facebook Pixel
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Lead', {
      content_name: source,
      content_category: 'free_tool',
    });
  }
}

/**
 * Track add to cart (wizard start)
 */
export function trackAddToCart(
  productId: string,
  productName: string,
  value: number
): void {
  // Google Analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'add_to_cart', {
      currency: 'GBP',
      value,
      items: [
        {
          item_id: productId,
          item_name: productName,
          price: value,
        },
      ],
    });
  }

  // Facebook Pixel
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'AddToCart', {
      value,
      currency: 'GBP',
      content_ids: [productId],
      content_name: productName,
      content_type: 'product',
    });
  }
}

/**
 * Track document download
 */
export function trackDownload(
  documentId: string,
  documentName: string,
  documentType: string
): void {
  trackEvent('file_download', {
    file_name: documentName,
    file_extension: 'pdf',
    file_type: documentType,
    item_id: documentId,
  });
}

// =============================================================================
// VALIDATOR TRACKING
// =============================================================================

/**
 * Validator event types for tracking
 */
export type ValidatorEventType =
  | 'validator_view'
  | 'validator_upload'
  | 'validator_result'
  | 'validator_question_answered'
  | 'validator_cta_click'
  | 'validator_report_requested';

/**
 * Track when a validator page is viewed
 */
export function trackValidatorView(
  validatorKey: string,
  jurisdiction?: string
): void {
  trackEvent('validator_view', {
    event_category: 'validators',
    validator_type: validatorKey,
    jurisdiction: jurisdiction || 'unknown',
  });

  // Track as Facebook ViewContent for validator pages
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'ViewContent', {
      content_name: `${validatorKey}_validator`,
      content_category: 'free_tool',
      content_type: 'validator',
    });
  }
}

/**
 * Track when a document is uploaded to a validator
 */
export function trackValidatorUpload(
  validatorKey: string,
  documentType?: string,
  jurisdiction?: string
): void {
  trackEvent('validator_upload', {
    event_category: 'validators',
    validator_type: validatorKey,
    document_type: documentType || 'unknown',
    jurisdiction: jurisdiction || 'unknown',
  });
}

/**
 * Track validation result
 */
export function trackValidatorResult(
  validatorKey: string,
  status: string,
  blockerCount: number,
  warningCount: number,
  rulesetVersion?: string
): void {
  trackEvent('validator_result', {
    event_category: 'validators',
    validator_type: validatorKey,
    validation_status: status,
    blocker_count: blockerCount,
    warning_count: warningCount,
    ruleset_version: rulesetVersion || 'unknown',
  });

  // Track as lead if validation completed (user engaged with tool)
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Lead', {
      content_name: `${validatorKey}_validation`,
      content_category: 'free_tool',
      lead_type: 'validator_completion',
    });
  }
}

/**
 * Track when a user answers a Q&A question
 */
export function trackValidatorQuestionAnswered(
  validatorKey: string,
  factKey: string,
  questionIndex: number,
  totalQuestions: number
): void {
  trackEvent('validator_question_answered', {
    event_category: 'validators',
    validator_type: validatorKey,
    fact_key: factKey,
    question_index: questionIndex,
    total_questions: totalQuestions,
  });
}

/**
 * Track when a user clicks a CTA from the validator
 */
export function trackValidatorCtaClick(
  validatorKey: string,
  ctaType: 'primary' | 'secondary',
  productSlug: string,
  validationStatus?: string
): void {
  trackEvent('validator_cta_click', {
    event_category: 'validators',
    validator_type: validatorKey,
    cta_type: ctaType,
    product_slug: productSlug,
    validation_status: validationStatus || 'unknown',
  });

  // Track as AddToCart intent
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'AddToCart', {
      content_name: productSlug,
      content_category: 'eviction_pack',
      content_type: 'product',
    });
  }
}

/**
 * Track when a user requests their validation report by email
 */
export function trackValidatorReportRequested(
  validatorKey: string,
  validationStatus?: string
): void {
  trackEvent('validator_report_requested', {
    event_category: 'validators',
    validator_type: validatorKey,
    validation_status: validationStatus || 'unknown',
  });

  // Track as Lead
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Lead', {
      content_name: `${validatorKey}_report`,
      content_category: 'free_tool',
      lead_type: 'email_capture',
    });
  }
}

// =============================================================================
// WIZARD FUNNEL TRACKING
// =============================================================================

/**
 * Wizard tracking event parameters
 */
export interface WizardTrackingParams {
  product: string;
  jurisdiction?: string;
  src?: string;
  topic?: string;
}

/**
 * Track when a user views the wizard entry/selection page
 */
export function trackWizardEntryView(params: WizardTrackingParams): void {
  trackEvent('wizard_entry_view', {
    event_category: 'wizard',
    product: params.product,
    jurisdiction: params.jurisdiction || 'not_selected',
    source: params.src || 'direct',
    topic: params.topic || 'general',
  });

  // Track as Facebook ViewContent
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'ViewContent', {
      content_name: `wizard_entry_${params.product}`,
      content_category: 'wizard',
      content_type: 'product_selection',
    });
  }
}

/**
 * Track when a user actually starts the wizard flow (after selecting product + jurisdiction)
 */
export function trackWizardStart(params: WizardTrackingParams): void {
  trackEvent('wizard_start', {
    event_category: 'wizard',
    product: params.product,
    jurisdiction: params.jurisdiction || 'unknown',
    source: params.src || 'direct',
    topic: params.topic || 'general',
  });

  // Track as Facebook AddToCart (intent signal)
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'AddToCart', {
      content_name: params.product,
      content_category: 'wizard',
      content_type: 'product',
    });
  }
}

/**
 * Track when a user completes a wizard step/section
 */
export function trackWizardStepComplete(params: {
  product: string;
  jurisdiction: string;
  step: string;
  stepIndex?: number;
  totalSteps?: number;
}): void {
  trackEvent('wizard_step_complete', {
    event_category: 'wizard',
    product: params.product,
    jurisdiction: params.jurisdiction,
    step_name: params.step,
    step_index: params.stepIndex ?? 0,
    total_steps: params.totalSteps ?? 0,
  });
}

/**
 * Track when a user reaches the review page
 */
export function trackWizardReviewView(params: {
  product: string;
  jurisdiction: string;
  hasBlockers?: boolean;
  hasWarnings?: boolean;
}): void {
  trackEvent('wizard_review_view', {
    event_category: 'wizard',
    product: params.product,
    jurisdiction: params.jurisdiction,
    has_blockers: params.hasBlockers ?? false,
    has_warnings: params.hasWarnings ?? false,
  });

  // Track as Facebook InitiateCheckout (high intent signal)
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'InitiateCheckout', {
      content_name: params.product,
      content_category: 'wizard',
      content_type: 'product',
    });
  }
}

/**
 * Track when a user abandons the wizard (best effort using beforeunload)
 * Call this to set up the abandon tracking - it will fire on page unload
 */
export function trackWizardAbandon(params: {
  product: string;
  jurisdiction: string;
  lastStep: string;
}): void {
  trackEvent('wizard_abandon', {
    event_category: 'wizard',
    product: params.product,
    jurisdiction: params.jurisdiction,
    last_step: params.lastStep,
  });
}

/**
 * Set up wizard abandon tracking using visibilitychange and beforeunload
 * Returns a cleanup function to remove the listeners
 */
export function setupWizardAbandonTracking(params: {
  product: string;
  jurisdiction: string;
  getCurrentStep: () => string;
}): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  let hasTrackedAbandon = false;

  const handleAbandon = () => {
    if (hasTrackedAbandon) return;
    hasTrackedAbandon = true;

    trackWizardAbandon({
      product: params.product,
      jurisdiction: params.jurisdiction,
      lastStep: params.getCurrentStep(),
    });
  };

  // Track on visibility change (tab switch/close)
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      handleAbandon();
    }
  };

  // Track on page unload
  const handleBeforeUnload = () => {
    handleAbandon();
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('beforeunload', handleBeforeUnload);

  // Return cleanup function
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('beforeunload', handleBeforeUnload);
  };
}

/**
 * Mark wizard as completed (call this to prevent abandon tracking from firing)
 */
let wizardCompleted = false;

export function markWizardCompleted(): void {
  wizardCompleted = true;
}

export function isWizardCompleted(): boolean {
  return wizardCompleted;
}

export function resetWizardCompletedState(): void {
  wizardCompleted = false;
}

// =============================================================================
// ENHANCED WIZARD TRACKING WITH FULL ATTRIBUTION
// =============================================================================

/**
 * Full attribution payload for wizard events
 */
export interface WizardFullAttributionParams {
  product: string;
  jurisdiction: string;
  src: string;
  topic: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  landing_url?: string;
  first_seen_at?: string;
}

/**
 * Track wizard entry view with full attribution
 */
export function trackWizardEntryViewWithAttribution(params: WizardFullAttributionParams): void {
  trackEvent('wizard_entry_view', {
    event_category: 'wizard',
    product: params.product,
    jurisdiction: params.jurisdiction || 'not_selected',
    source: params.src || 'direct',
    topic: params.topic || 'general',
    utm_source: params.utm_source,
    utm_medium: params.utm_medium,
    utm_campaign: params.utm_campaign,
    landing_url: params.landing_url,
    first_seen_at: params.first_seen_at,
  });

  // Track as Facebook ViewContent
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'ViewContent', {
      content_name: `wizard_entry_${params.product}`,
      content_category: 'wizard',
      content_type: 'product_selection',
    });
  }
}

/**
 * Track wizard start with full attribution (fires on /wizard/flow mount)
 */
export function trackWizardStartWithAttribution(params: WizardFullAttributionParams): void {
  trackEvent('wizard_start', {
    event_category: 'wizard',
    product: params.product,
    jurisdiction: params.jurisdiction || 'unknown',
    source: params.src || 'direct',
    topic: params.topic || 'general',
    utm_source: params.utm_source,
    utm_medium: params.utm_medium,
    utm_campaign: params.utm_campaign,
    landing_url: params.landing_url,
    first_seen_at: params.first_seen_at,
  });

  // Track as Facebook AddToCart (intent signal)
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'AddToCart', {
      content_name: params.product,
      content_category: 'wizard',
      content_type: 'product',
    });
  }
}

/**
 * Track wizard step completion with full attribution
 */
export function trackWizardStepCompleteWithAttribution(params: {
  product: string;
  jurisdiction: string;
  step: string;
  stepIndex?: number;
  totalSteps?: number;
  src: string;
  topic: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  landing_url?: string;
  first_seen_at?: string;
}): void {
  trackEvent('wizard_step_complete', {
    event_category: 'wizard',
    product: params.product,
    jurisdiction: params.jurisdiction,
    step_name: params.step,
    step_index: params.stepIndex ?? 0,
    total_steps: params.totalSteps ?? 0,
    source: params.src || 'direct',
    topic: params.topic || 'general',
    utm_source: params.utm_source,
    utm_medium: params.utm_medium,
    utm_campaign: params.utm_campaign,
    landing_url: params.landing_url,
    first_seen_at: params.first_seen_at,
  });
}

/**
 * Track wizard review view with full attribution
 */
export function trackWizardReviewViewWithAttribution(params: {
  product: string;
  jurisdiction: string;
  hasBlockers?: boolean;
  hasWarnings?: boolean;
  src: string;
  topic: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  landing_url?: string;
  first_seen_at?: string;
}): void {
  trackEvent('wizard_review_view', {
    event_category: 'wizard',
    product: params.product,
    jurisdiction: params.jurisdiction,
    has_blockers: params.hasBlockers ?? false,
    has_warnings: params.hasWarnings ?? false,
    source: params.src || 'direct',
    topic: params.topic || 'general',
    utm_source: params.utm_source,
    utm_medium: params.utm_medium,
    utm_campaign: params.utm_campaign,
    landing_url: params.landing_url,
    first_seen_at: params.first_seen_at,
  });

  // Track as Facebook InitiateCheckout (high intent signal)
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'InitiateCheckout', {
      content_name: params.product,
      content_category: 'wizard',
      content_type: 'product',
    });
  }
}

/**
 * Track wizard abandon with full attribution
 */
export function trackWizardAbandonWithAttribution(params: {
  product: string;
  jurisdiction: string;
  lastStep: string;
  src: string;
  topic: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  landing_url?: string;
  first_seen_at?: string;
}): void {
  trackEvent('wizard_abandon', {
    event_category: 'wizard',
    product: params.product,
    jurisdiction: params.jurisdiction,
    last_step: params.lastStep,
    source: params.src || 'direct',
    topic: params.topic || 'general',
    utm_source: params.utm_source,
    utm_medium: params.utm_medium,
    utm_campaign: params.utm_campaign,
    landing_url: params.landing_url,
    first_seen_at: params.first_seen_at,
  });
}

/**
 * Track when a user selects an incompatible product/jurisdiction combination
 * (e.g., eviction in Northern Ireland)
 */
export function trackWizardIncompatibleChoice(params: {
  attemptedProduct: string;
  jurisdiction: string;
  resolvedProduct: string;
  action: 'auto_switch' | 'redirect' | 'blocked';
  src?: string;
  topic?: string;
}): void {
  trackEvent('wizard_incompatible_choice', {
    event_category: 'wizard',
    attempted_product: params.attemptedProduct,
    jurisdiction: params.jurisdiction,
    resolved_product: params.resolvedProduct,
    action: params.action,
    source: params.src || 'direct',
    topic: params.topic || 'general',
  });
}

// =============================================================================
// ASK HEAVEN TRACKING
// =============================================================================

/**
 * Full attribution payload for Ask Heaven events
 */
export interface AskHeavenTrackingParams {
  jurisdiction?: string;
  src: string;
  topic: string;
  landing_topic?: string;
  current_topic?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  landing_url?: string;
  first_seen_at?: string;
  question_count: number;
  suggested_product?: string | null;
  suggested_next_step?: 'wizard' | 'checklist' | 'guide' | 'none' | string | null;
  suggested_topic?: string | null;
  reason?: 'compliance_checklist' | 'threshold_gate' | 'manual' | string;
  email_captured?: boolean;
}

/**
 * Track Ask Heaven page view
 */
export function trackAskHeavenView(params: AskHeavenTrackingParams): void {
  trackEvent('ask_heaven_view', {
    event_category: 'ask_heaven',
    jurisdiction: params.jurisdiction || 'not_selected',
    source: params.src || 'direct',
    topic: params.topic || 'general',
    utm_source: params.utm_source,
    utm_medium: params.utm_medium,
    utm_campaign: params.utm_campaign,
    landing_url: params.landing_url,
    first_seen_at: params.first_seen_at,
    question_count: params.question_count,
  });

  // Track as Facebook ViewContent
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'ViewContent', {
      content_name: 'ask_heaven',
      content_category: 'free_tool',
      content_type: 'ask_heaven',
    });
  }
}

/**
 * Track when a question is submitted in Ask Heaven
 */
export function trackAskHeavenQuestionSubmitted(params: AskHeavenTrackingParams): void {
  trackEvent('ask_heaven_question_submitted', {
    event_category: 'ask_heaven',
    jurisdiction: params.jurisdiction || 'not_selected',
    source: params.src || 'direct',
    topic: params.topic || 'general',
    utm_source: params.utm_source,
    utm_medium: params.utm_medium,
    utm_campaign: params.utm_campaign,
    landing_url: params.landing_url,
    first_seen_at: params.first_seen_at,
    question_count: params.question_count,
  });
}

/**
 * Track when an answer is received in Ask Heaven
 */
export function trackAskHeavenAnswerReceived(params: AskHeavenTrackingParams): void {
  trackEvent('ask_heaven_answer_received', {
    event_category: 'ask_heaven',
    jurisdiction: params.jurisdiction || 'not_selected',
    source: params.src || 'direct',
    topic: params.topic || 'general',
    landing_topic: params.landing_topic,
    current_topic: params.current_topic,
    utm_source: params.utm_source,
    utm_medium: params.utm_medium,
    utm_campaign: params.utm_campaign,
    landing_url: params.landing_url,
    first_seen_at: params.first_seen_at,
    question_count: params.question_count,
    suggested_product: params.suggested_product || 'none',
    suggested_next_step: params.suggested_next_step || 'none',
    suggested_topic: params.suggested_topic || 'general',
  });
}

/**
 * Track when a CTA is clicked in Ask Heaven (e.g., Start Wizard, Buy Pack)
 */
export function trackAskHeavenCtaClick(params: AskHeavenTrackingParams & {
  cta_type: 'wizard' | 'product' | 'validator' | 'template' | 'next_best_action';
  cta_label?: string;
  target_url?: string;
}): void {
  trackEvent('ask_heaven_cta_click', {
    event_category: 'ask_heaven',
    jurisdiction: params.jurisdiction || 'not_selected',
    source: params.src || 'direct',
    topic: params.topic || 'general',
    utm_source: params.utm_source,
    utm_medium: params.utm_medium,
    utm_campaign: params.utm_campaign,
    landing_url: params.landing_url,
    first_seen_at: params.first_seen_at,
    question_count: params.question_count,
    suggested_product: params.suggested_product || 'none',
    cta_type: params.cta_type,
    cta_label: params.cta_label,
    target_url: params.target_url,
  });

  // Track as AddToCart intent for wizard/product CTAs
  if (typeof window !== 'undefined' && window.fbq && (params.cta_type === 'wizard' || params.cta_type === 'product')) {
    window.fbq('track', 'AddToCart', {
      content_name: params.suggested_product || 'ask_heaven_cta',
      content_category: 'ask_heaven',
      content_type: 'product',
    });
  }
}

/**
 * Track when a follow-up question is clicked
 */
export function trackAskHeavenFollowupClick(params: AskHeavenTrackingParams): void {
  trackEvent('ask_heaven_followup_click', {
    event_category: 'ask_heaven',
    jurisdiction: params.jurisdiction || 'not_selected',
    source: params.src || 'direct',
    topic: params.topic || 'general',
    utm_source: params.utm_source,
    utm_medium: params.utm_medium,
    utm_campaign: params.utm_campaign,
    landing_url: params.landing_url,
    first_seen_at: params.first_seen_at,
    question_count: params.question_count,
  });
}

/**
 * Track when email is captured in Ask Heaven
 */
export function trackAskHeavenEmailCapture(params: AskHeavenTrackingParams): void {
  trackEvent('ask_heaven_email_capture', {
    event_category: 'ask_heaven',
    jurisdiction: params.jurisdiction || 'not_selected',
    source: params.src || 'direct',
    topic: params.topic || 'general',
    utm_source: params.utm_source,
    utm_medium: params.utm_medium,
    utm_campaign: params.utm_campaign,
    landing_url: params.landing_url,
    first_seen_at: params.first_seen_at,
    question_count: params.question_count,
  });

  // Track as Lead
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Lead', {
      content_name: 'ask_heaven_email',
      content_category: 'ask_heaven',
      lead_type: 'email_capture',
    });
  }
}

/**
 * Track when email gate is shown
 */
export function trackAskHeavenEmailGateShown(params: AskHeavenTrackingParams): void {
  trackEvent('ask_heaven_email_gate_shown', {
    event_category: 'ask_heaven',
    jurisdiction: params.jurisdiction || 'not_selected',
    source: params.src || 'direct',
    topic: params.topic || 'general',
    landing_topic: params.landing_topic,
    current_topic: params.current_topic,
    utm_source: params.utm_source,
    utm_medium: params.utm_medium,
    utm_campaign: params.utm_campaign,
    landing_url: params.landing_url,
    first_seen_at: params.first_seen_at,
    question_count: params.question_count,
    reason: params.reason || 'threshold_gate',
  });
}

// =============================================================================
// MONEY CLAIM TRACKING
// =============================================================================

/**
 * Claim reason type for analytics (mirrors ClaimReasonType)
 */
export type MoneyClaimReason =
  | 'rent_arrears'
  | 'property_damage'
  | 'cleaning'
  | 'unpaid_utilities'
  | 'unpaid_council_tax'
  | 'other_tenant_debt';

/**
 * Track when user selects/changes claim reasons in Money Claim wizard
 * Fired when checkboxes are toggled in ClaimDetailsSection
 */
export function trackMoneyClaimReasonsSelected(params: {
  reasons: MoneyClaimReason[];
  jurisdiction: string;
  source?: string;
}): void {
  trackEvent('money_claim_reasons_selected', {
    event_category: 'money_claim',
    reasons: params.reasons.join(','),
    reason_count: params.reasons.length,
    has_rent_arrears: params.reasons.includes('rent_arrears'),
    has_property_damage: params.reasons.includes('property_damage'),
    has_cleaning: params.reasons.includes('cleaning'),
    has_utilities: params.reasons.includes('unpaid_utilities'),
    has_council_tax: params.reasons.includes('unpaid_council_tax'),
    has_other_debt: params.reasons.includes('other_tenant_debt'),
    jurisdiction: params.jurisdiction,
    source: params.source || 'wizard',
  });
}

/**
 * Track when a wizard section is skipped due to claim reasons
 * e.g., arrears section skipped when user only claims damage
 */
export function trackMoneyClaimSectionSkipped(params: {
  section: 'arrears' | 'damages';
  reasons: MoneyClaimReason[];
  jurisdiction: string;
}): void {
  trackEvent('money_claim_section_skipped', {
    event_category: 'money_claim',
    section: params.section,
    reasons: params.reasons.join(','),
    jurisdiction: params.jurisdiction,
  });
}

/**
 * Track when user adds a line item in the Damages section
 */
export function trackMoneyClaimLineItemAdded(params: {
  category: string;
  reasons: MoneyClaimReason[];
  jurisdiction: string;
  item_count: number;
}): void {
  trackEvent('money_claim_line_item_added', {
    event_category: 'money_claim',
    category: params.category,
    reasons: params.reasons.join(','),
    jurisdiction: params.jurisdiction,
    item_count: params.item_count,
  });
}

/**
 * Track money claim purchase completion with claim reasons
 * Call alongside the standard purchase tracking
 */
export function trackMoneyClaimPurchaseCompleted(params: {
  reasons: MoneyClaimReason[];
  jurisdiction: string;
  order_id?: string;
  revenue: number;
  arrears_amount?: number;
  damages_amount?: number;
  total_claim_amount?: number;
}): void {
  trackEvent('money_claim_purchase_completed', {
    event_category: 'money_claim',
    reasons: params.reasons.join(','),
    reason_count: params.reasons.length,
    has_rent_arrears: params.reasons.includes('rent_arrears'),
    has_property_damage: params.reasons.includes('property_damage'),
    has_cleaning: params.reasons.includes('cleaning'),
    has_utilities: params.reasons.includes('unpaid_utilities'),
    has_council_tax: params.reasons.includes('unpaid_council_tax'),
    has_other_debt: params.reasons.includes('other_tenant_debt'),
    jurisdiction: params.jurisdiction,
    order_id: params.order_id || 'unknown',
    revenue: params.revenue,
    arrears_amount: params.arrears_amount ?? 0,
    damages_amount: params.damages_amount ?? 0,
    total_claim_amount: params.total_claim_amount ?? 0,
  });
}

// =============================================================================
// MONEY CLAIM INTELLIGENCE TRACKING
// =============================================================================

/**
 * Track when outcome confidence indicator is shown to user
 * Note: We do NOT track the confidence level or score to avoid any legal liability
 */
export function trackOutcomeConfidenceShown(params: {
  claimTypes: string[];
}): void {
  trackEvent('outcome_confidence_shown', {
    event_category: 'money_claim_intelligence',
    claim_type_count: params.claimTypes.length,
    // Only track count, not PII or specific claim details that could identify the user
  });
}

/**
 * Track when court fee estimator is viewed
 */
export function trackCourtFeeEstimatorViewed(params: {
  amountBand: string;
}): void {
  trackEvent('court_fee_estimator_viewed', {
    event_category: 'money_claim_intelligence',
    amount_band: params.amountBand,
    // Band is anonymized (e.g., 'under_300', '300_500') - no exact amounts
  });
}

/**
 * Track when evidence gallery is viewed
 */
export function trackEvidenceGalleryViewed(params: {
  claimTypes: string[];
}): void {
  trackEvent('evidence_gallery_viewed', {
    event_category: 'money_claim_intelligence',
    claim_type_count: params.claimTypes.length,
    // Only track count for analytics, not specific claim types to avoid PII
  });
}

/**
 * Track when a specific evidence warning is resolved by the user
 * This helps us understand which warnings are most actionable
 */
export function trackEvidenceWarningResolved(params: {
  ruleId: string;
}): void {
  trackEvent('evidence_warning_resolved', {
    event_category: 'money_claim_intelligence',
    rule_id: params.ruleId,
    // Rule ID is a generic identifier (e.g., 'property_damage_missing_photo_evidence')
    // and contains no PII
  });
}

// =============================================================================
// TENANCY PREMIUM UPSELL TRACKING
// =============================================================================

/**
 * Premium recommendation reason flags (no PII)
 * These flags indicate WHY Premium was recommended without identifying the user
 */
export type TenancyPremiumRecommendationReason =
  | 'multiple_tenants'
  | 'unrelated_tenants'
  | 'separate_rent_payments'
  | 'room_by_room_let'
  | 'shared_facilities'
  | 'hmo_property'
  | 'hmo_licensed'
  | 'student_let'
  | 'guarantor_needed'
  | 'rent_review_needed'
  | 'high_value_property';

/**
 * Track when Premium tier is recommended to the user in the tenancy wizard
 *
 * IMPORTANT: Only tracks reason flags, no PII or free text
 *
 * @param params.reasons - Array of reason flags explaining why Premium was recommended
 * @param params.strength - Recommendation strength ('strong' | 'moderate')
 * @param params.jurisdiction - Jurisdiction (england | wales | scotland | northern-ireland)
 */
export function trackTenancyPremiumRecommended(params: {
  reasons: TenancyPremiumRecommendationReason[];
  strength: 'strong' | 'moderate';
  jurisdiction: string;
}): void {
  trackEvent('tenancy_premium_recommended', {
    event_category: 'tenancy_upsell',
    // Reason flags only - no PII
    reason_flags: params.reasons.join(','),
    reason_count: params.reasons.length,
    strength: params.strength,
    jurisdiction: params.jurisdiction,
    // Boolean flags for easier analysis
    has_hmo_indicator: params.reasons.some(r =>
      ['hmo_property', 'hmo_licensed', 'multiple_tenants', 'unrelated_tenants', 'room_by_room_let'].includes(r)
    ),
    has_student_let: params.reasons.includes('student_let'),
    has_guarantor_need: params.reasons.includes('guarantor_needed'),
  });

  // Track as Facebook ViewContent for retargeting
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'ViewContent', {
      content_name: 'tenancy_premium_recommendation',
      content_category: 'tenancy_upsell',
      content_type: 'recommendation',
    });
  }
}

/**
 * Track when user selects Premium AFTER seeing a recommendation
 *
 * This indicates the recommendation was effective
 */
export function trackTenancyPremiumSelectedAfterRecommendation(params: {
  reasons: TenancyPremiumRecommendationReason[];
  strength: 'strong' | 'moderate';
  jurisdiction: string;
}): void {
  trackEvent('tenancy_premium_selected_after_recommendation', {
    event_category: 'tenancy_upsell',
    reason_flags: params.reasons.join(','),
    reason_count: params.reasons.length,
    strength: params.strength,
    jurisdiction: params.jurisdiction,
  });

  // Track as AddToCart for conversion tracking
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'AddToCart', {
      content_name: 'ast_premium',
      content_category: 'tenancy_agreement',
      content_type: 'product',
    });
  }
}

/**
 * Track when user selects Standard DESPITE seeing a Premium recommendation
 *
 * This helps understand when recommendations are not compelling enough
 */
export function trackTenancyStandardSelectedDespiteRecommendation(params: {
  reasons: TenancyPremiumRecommendationReason[];
  strength: 'strong' | 'moderate';
  jurisdiction: string;
}): void {
  trackEvent('tenancy_standard_selected_despite_recommendation', {
    event_category: 'tenancy_upsell',
    reason_flags: params.reasons.join(','),
    reason_count: params.reasons.length,
    strength: params.strength,
    jurisdiction: params.jurisdiction,
    // This event indicates the recommendation was shown but rejected
    recommendation_rejected: true,
  });
}

/**
 * Track when the comparison table rationale is expanded
 * Helps understand which legal explanations users find valuable
 */
export function trackTenancyRationaleExpanded(params: {
  feature: string;
  jurisdiction: string;
}): void {
  trackEvent('tenancy_rationale_expanded', {
    event_category: 'tenancy_upsell',
    feature: params.feature,
    jurisdiction: params.jurisdiction,
  });
}

// =============================================================================
// CLAUSE DIFF PREVIEW TRACKING
// =============================================================================

/**
 * Track when clause diff preview is viewed
 */
export function trackClauseDiffViewed(params: {
  jurisdiction: string;
  variant: 'full' | 'compact';
  clauseCount: number;
}): void {
  trackEvent('clause_diff_viewed', {
    event_category: 'tenancy_upsell',
    jurisdiction: params.jurisdiction,
    variant: params.variant,
    clause_count: params.clauseCount,
  });

  // Track as ViewContent for retargeting
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'ViewContent', {
      content_name: 'clause_diff_preview',
      content_category: 'tenancy_upsell',
      content_type: 'comparison',
    });
  }
}

/**
 * Track when user clicks upgrade from clause diff preview
 */
export function trackClauseDiffUpgradeClicked(params: {
  jurisdiction: string;
  source: 'wizard' | 'product_page';
}): void {
  trackEvent('clause_diff_upgrade_clicked', {
    event_category: 'tenancy_upsell',
    jurisdiction: params.jurisdiction,
    source: params.source,
  });

  // Track as AddToCart for conversion
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'AddToCart', {
      content_name: 'ast_premium',
      content_category: 'tenancy_agreement',
      content_type: 'product',
    });
  }
}

/**
 * Track when user hovers over "Why this matters" explanation
 * Helps understand which clauses users care about most
 */
export function trackClauseHoverExplanation(params: {
  clauseId: string;
  jurisdiction: string;
}): void {
  trackEvent('clause_hover_explanation', {
    event_category: 'tenancy_upsell',
    clause_id: params.clauseId,
    jurisdiction: params.jurisdiction,
  });
}
