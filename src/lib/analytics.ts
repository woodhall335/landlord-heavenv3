/**
 * Analytics Tracking Utilities
 *
 * Provides helper functions for tracking events in:
 * - Google Analytics 4 (GA4)
 * - Google Ads conversion tracking
 * - Facebook Pixel
 *
 * Type definitions are in src/types/gtag.d.ts
 */

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
 * Track a purchase/transaction in Google Analytics and Facebook Pixel
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
  }>
): void {
  // Google Analytics / Google Ads
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: transactionId,
      value,
      currency,
      items,
    });
  }

  // Facebook Pixel
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Purchase', {
      value,
      currency,
      content_ids: items?.map(i => i.item_id) || [],
      content_name: items?.map(i => i.item_name).join(', ') || '',
      content_type: 'product',
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
