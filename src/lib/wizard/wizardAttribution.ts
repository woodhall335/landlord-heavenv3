/**
 * Wizard Attribution Tracking
 *
 * Manages attribution data across the wizard funnel using sessionStorage.
 * Captures UTM params, source, topic, and persists across page navigations.
 */

export interface WizardAttributionPayload {
  src: string;
  topic: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  product?: string;
  jurisdiction?: string;
  landing_url: string;
  first_seen_at: string;
}

const ATTRIBUTION_KEY = 'wizard_attribution';
const COMPLETED_STEPS_KEY = 'wizard_completed_steps';
const WIZARD_STARTED_KEY = 'wizard_started';
const ABANDON_SENT_KEY = 'wizard_abandon_sent';
const PURCHASE_COMPLETE_KEY = 'wizard_purchase_complete';

/**
 * Default attribution values when none are present
 */
const DEFAULT_ATTRIBUTION: Pick<WizardAttributionPayload, 'src' | 'topic'> = {
  src: 'direct',
  topic: 'general',
};

/**
 * Check if sessionStorage is available
 */
function isSessionStorageAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const test = '__test__';
    window.sessionStorage.setItem(test, test);
    window.sessionStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get current wizard attribution from sessionStorage
 * Falls back to defaults if not set
 */
export function getWizardAttribution(): WizardAttributionPayload {
  if (!isSessionStorageAvailable()) {
    return {
      ...DEFAULT_ATTRIBUTION,
      landing_url: typeof window !== 'undefined' ? window.location.href : '',
      first_seen_at: new Date().toISOString(),
    };
  }

  try {
    const stored = window.sessionStorage.getItem(ATTRIBUTION_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as WizardAttributionPayload;
      return {
        ...DEFAULT_ATTRIBUTION,
        ...parsed,
      };
    }
  } catch {
    // Ignore parse errors
  }

  return {
    ...DEFAULT_ATTRIBUTION,
    landing_url: window.location.href,
    first_seen_at: new Date().toISOString(),
  };
}

/**
 * Set/update wizard attribution
 * Merges with existing data, keeping first_seen_at and landing_url stable
 */
export function setWizardAttribution(
  payload: Partial<WizardAttributionPayload>
): WizardAttributionPayload {
  if (!isSessionStorageAvailable()) {
    return {
      ...DEFAULT_ATTRIBUTION,
      landing_url: typeof window !== 'undefined' ? window.location.href : '',
      first_seen_at: new Date().toISOString(),
      ...payload,
    };
  }

  const existing = getWizardAttribution();

  // Keep original first_seen_at and landing_url
  const updated: WizardAttributionPayload = {
    ...existing,
    ...payload,
    // Never overwrite these once set
    first_seen_at: existing.first_seen_at,
    landing_url: existing.landing_url,
  };

  try {
    window.sessionStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage errors
  }

  return updated;
}

/**
 * Clear wizard attribution (e.g., after purchase)
 */
export function clearWizardAttribution(): void {
  if (!isSessionStorageAvailable()) return;

  try {
    window.sessionStorage.removeItem(ATTRIBUTION_KEY);
    window.sessionStorage.removeItem(COMPLETED_STEPS_KEY);
    window.sessionStorage.removeItem(WIZARD_STARTED_KEY);
    window.sessionStorage.removeItem(ABANDON_SENT_KEY);
  } catch {
    // Ignore storage errors
  }
}

// =============================================================================
// WIZARD START TRACKING
// =============================================================================

/**
 * Check if wizard_start has already been fired this session
 */
export function hasWizardStarted(): boolean {
  if (!isSessionStorageAvailable()) return false;

  try {
    return window.sessionStorage.getItem(WIZARD_STARTED_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * Mark wizard as started (prevents duplicate wizard_start events)
 */
export function markWizardStarted(): void {
  if (!isSessionStorageAvailable()) return;

  try {
    window.sessionStorage.setItem(WIZARD_STARTED_KEY, 'true');
  } catch {
    // Ignore storage errors
  }
}

// =============================================================================
// STEP COMPLETION TRACKING
// =============================================================================

/**
 * Get list of completed step IDs
 */
export function getCompletedSteps(): string[] {
  if (!isSessionStorageAvailable()) return [];

  try {
    const stored = window.sessionStorage.getItem(COMPLETED_STEPS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {
    // Ignore parse errors
  }

  return [];
}

/**
 * Check if a step has already been completed (for dedupe)
 */
export function isStepCompleted(stepId: string): boolean {
  const completed = getCompletedSteps();
  return completed.includes(stepId);
}

/**
 * Mark a step as completed
 * Returns true if this is the first completion (should fire event)
 * Returns false if already completed (should skip event)
 */
export function markStepCompleted(stepId: string): boolean {
  if (isStepCompleted(stepId)) {
    return false; // Already completed, don't fire event
  }

  if (!isSessionStorageAvailable()) return true;

  try {
    const completed = getCompletedSteps();
    completed.push(stepId);
    window.sessionStorage.setItem(COMPLETED_STEPS_KEY, JSON.stringify(completed));
    return true; // First completion, fire event
  } catch {
    return true; // On error, assume first completion
  }
}

/**
 * Reset completed steps (e.g., when starting a new wizard)
 */
export function resetCompletedSteps(): void {
  if (!isSessionStorageAvailable()) return;

  try {
    window.sessionStorage.removeItem(COMPLETED_STEPS_KEY);
  } catch {
    // Ignore storage errors
  }
}

// =============================================================================
// ABANDON TRACKING
// =============================================================================

/**
 * Check if abandon event has been sent this session
 */
export function hasAbandonBeenSent(): boolean {
  if (!isSessionStorageAvailable()) return false;

  try {
    return window.sessionStorage.getItem(ABANDON_SENT_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * Mark abandon event as sent
 */
export function markAbandonSent(): void {
  if (!isSessionStorageAvailable()) return;

  try {
    window.sessionStorage.setItem(ABANDON_SENT_KEY, 'true');
  } catch {
    // Ignore storage errors
  }
}

/**
 * Check if purchase has been completed (prevents abandon tracking)
 */
export function hasPurchaseCompleted(): boolean {
  if (!isSessionStorageAvailable()) return false;

  try {
    return window.sessionStorage.getItem(PURCHASE_COMPLETE_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * Mark purchase as completed
 */
export function markPurchaseComplete(): void {
  if (!isSessionStorageAvailable()) return;

  try {
    window.sessionStorage.setItem(PURCHASE_COMPLETE_KEY, 'true');
  } catch {
    // Ignore storage errors
  }
}

/**
 * Check if we should fire abandon event
 * Conditions:
 * - wizard has started
 * - purchase has not completed
 * - abandon has not already been sent
 */
export function shouldFireAbandon(): boolean {
  return hasWizardStarted() && !hasPurchaseCompleted() && !hasAbandonBeenSent();
}

// =============================================================================
// ATTRIBUTION EXTRACTION FROM URL
// =============================================================================

/**
 * Extract attribution params from URL search params
 */
export function extractAttributionFromUrl(searchParams: URLSearchParams): Partial<WizardAttributionPayload> {
  const attribution: Partial<WizardAttributionPayload> = {};

  const src = searchParams.get('src');
  const topic = searchParams.get('topic');
  const utm_source = searchParams.get('utm_source');
  const utm_medium = searchParams.get('utm_medium');
  const utm_campaign = searchParams.get('utm_campaign');
  const product = searchParams.get('product');
  const jurisdiction = searchParams.get('jurisdiction');

  if (src) attribution.src = src;
  if (topic) attribution.topic = topic;
  if (utm_source) attribution.utm_source = utm_source;
  if (utm_medium) attribution.utm_medium = utm_medium;
  if (utm_campaign) attribution.utm_campaign = utm_campaign;
  if (product) attribution.product = product;
  if (jurisdiction) attribution.jurisdiction = jurisdiction;

  return attribution;
}

/**
 * Initialize attribution from current URL
 * Should be called on wizard entry page load
 */
export function initializeAttribution(): WizardAttributionPayload {
  if (typeof window === 'undefined') {
    return {
      ...DEFAULT_ATTRIBUTION,
      landing_url: '',
      first_seen_at: new Date().toISOString(),
    };
  }

  const searchParams = new URLSearchParams(window.location.search);
  const urlAttribution = extractAttributionFromUrl(searchParams);

  // Set landing URL and first_seen_at if this is first visit
  const existing = getWizardAttribution();
  const isFirstVisit = existing.landing_url === window.location.href;

  const payload: Partial<WizardAttributionPayload> = {
    ...urlAttribution,
  };

  // Only set landing_url if not already set
  if (!existing.landing_url || existing.landing_url === '') {
    payload.landing_url = window.location.href;
  }

  return setWizardAttribution(payload);
}

/**
 * Get attribution payload for analytics events
 * Returns a flat object suitable for event tracking
 */
export function getAttributionForAnalytics(): Record<string, string | undefined> {
  const attribution = getWizardAttribution();

  return {
    source: attribution.src,
    topic: attribution.topic,
    utm_source: attribution.utm_source,
    utm_medium: attribution.utm_medium,
    utm_campaign: attribution.utm_campaign,
    product: attribution.product,
    jurisdiction: attribution.jurisdiction,
    landing_url: attribution.landing_url,
    first_seen_at: attribution.first_seen_at,
  };
}
