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
  utm_term?: string;
  utm_content?: string;
  product?: string;
  jurisdiction?: string;
  landing_url: string;
  landing_path: string; // Just the pathname (e.g., /how-to-evict-tenant)
  referrer?: string;
  first_seen_at: string;
  ga_client_id?: string;
}

/**
 * Attribution data formatted for checkout API
 * This is the shape expected by /api/checkout/create
 */
export interface CheckoutAttributionPayload {
  landing_path: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  referrer: string | null;
  first_touch_at: string | null;
  ga_client_id: string | null;
}

const ATTRIBUTION_KEY = 'wizard_attribution';
const ATTRIBUTION_KEY_LOCAL = 'lh_attribution'; // localStorage for cross-session persistence
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
 * Get the current path from URL
 */
function getCurrentPath(): string {
  if (typeof window === 'undefined') return '';
  return window.location.pathname;
}

/**
 * Get the referrer, truncated to domain for privacy
 */
function getReferrer(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  const referrer = document.referrer;
  if (!referrer) return undefined;

  try {
    const url = new URL(referrer);
    // Only capture external referrers
    if (url.hostname === window.location.hostname) return undefined;
    // Return just the hostname for privacy
    return url.hostname;
  } catch {
    return undefined;
  }
}

/**
 * Get Google Analytics client ID from _ga cookie
 * Format: GA1.1.XXXXXXXXX.YYYYYYYYYY
 */
function getGAClientId(): string | undefined {
  if (typeof document === 'undefined') return undefined;

  try {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === '_ga' && value) {
        // Extract client ID from GA cookie (skip GA1.1. prefix)
        const parts = value.split('.');
        if (parts.length >= 4) {
          return `${parts[2]}.${parts[3]}`;
        }
      }
    }
  } catch {
    // Ignore cookie errors
  }
  return undefined;
}

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
 * Check if localStorage is available
 */
function isLocalStorageAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const test = '__test__';
    window.localStorage.setItem(test, test);
    window.localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get current wizard attribution from sessionStorage (with localStorage fallback)
 * Falls back to defaults if not set
 *
 * Priority: sessionStorage > localStorage > defaults
 * This allows attribution to persist across sessions if user returns
 */
export function getWizardAttribution(): WizardAttributionPayload {
  const defaults: WizardAttributionPayload = {
    ...DEFAULT_ATTRIBUTION,
    landing_url: typeof window !== 'undefined' ? window.location.href : '',
    landing_path: getCurrentPath(),
    first_seen_at: new Date().toISOString(),
  };

  // Try sessionStorage first
  if (isSessionStorageAvailable()) {
    try {
      const stored = window.sessionStorage.getItem(ATTRIBUTION_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as WizardAttributionPayload;
        // Ensure landing_path exists (migration from old data)
        if (!parsed.landing_path && parsed.landing_url) {
          try {
            parsed.landing_path = new URL(parsed.landing_url).pathname;
          } catch {
            parsed.landing_path = getCurrentPath();
          }
        }
        return {
          ...defaults,
          ...parsed,
        };
      }
    } catch {
      // Ignore parse errors
    }
  }

  // Try localStorage as fallback (cross-session persistence)
  if (isLocalStorageAvailable()) {
    try {
      const stored = window.localStorage.getItem(ATTRIBUTION_KEY_LOCAL);
      if (stored) {
        const parsed = JSON.parse(stored) as WizardAttributionPayload;
        // Ensure landing_path exists (migration from old data)
        if (!parsed.landing_path && parsed.landing_url) {
          try {
            parsed.landing_path = new URL(parsed.landing_url).pathname;
          } catch {
            parsed.landing_path = getCurrentPath();
          }
        }
        return {
          ...defaults,
          ...parsed,
        };
      }
    } catch {
      // Ignore parse errors
    }
  }

  return defaults;
}

/**
 * Set/update wizard attribution
 * Merges with existing data, keeping first_seen_at, landing_url, landing_path stable
 *
 * Strategy: FIRST-TOUCH attribution
 * - landing_url, landing_path, first_seen_at never overwritten
 * - UTMs can be updated (allows for multi-touch analysis if needed)
 * - GA client ID captured/refreshed on each call
 */
export function setWizardAttribution(
  payload: Partial<WizardAttributionPayload>
): WizardAttributionPayload {
  const defaults: WizardAttributionPayload = {
    ...DEFAULT_ATTRIBUTION,
    landing_url: typeof window !== 'undefined' ? window.location.href : '',
    landing_path: getCurrentPath(),
    first_seen_at: new Date().toISOString(),
  };

  if (!isSessionStorageAvailable()) {
    return {
      ...defaults,
      ...payload,
    };
  }

  const existing = getWizardAttribution();

  // Capture GA client ID if available
  const gaClientId = getGAClientId();

  // Keep original first_seen_at, landing_url, landing_path (FIRST-TOUCH)
  const updated: WizardAttributionPayload = {
    ...existing,
    ...payload,
    // Never overwrite these once set - FIRST-TOUCH attribution
    first_seen_at: existing.first_seen_at || defaults.first_seen_at,
    landing_url: existing.landing_url || defaults.landing_url,
    landing_path: existing.landing_path || defaults.landing_path,
    // Keep first referrer only
    referrer: existing.referrer || payload.referrer,
    // Update GA client ID if available (may change with consent)
    ga_client_id: gaClientId || existing.ga_client_id,
  };

  // Store in both sessionStorage and localStorage
  try {
    window.sessionStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage errors
  }

  // Also persist to localStorage for cross-session attribution
  if (isLocalStorageAvailable()) {
    try {
      window.localStorage.setItem(ATTRIBUTION_KEY_LOCAL, JSON.stringify(updated));
    } catch {
      // Ignore storage errors
    }
  }

  return updated;
}

/**
 * Clear wizard attribution (e.g., after purchase)
 * Note: Does NOT clear localStorage to allow future attribution analysis
 */
export function clearWizardAttribution(): void {
  if (isSessionStorageAvailable()) {
    try {
      window.sessionStorage.removeItem(ATTRIBUTION_KEY);
      window.sessionStorage.removeItem(COMPLETED_STEPS_KEY);
      window.sessionStorage.removeItem(WIZARD_STARTED_KEY);
      window.sessionStorage.removeItem(ABANDON_SENT_KEY);
    } catch {
      // Ignore storage errors
    }
  }

  // Note: We intentionally keep localStorage attribution for cross-session analysis
  // To fully clear, use clearAllAttribution()
}

/**
 * Clear all attribution including localStorage
 * Use sparingly - typically only for user-requested data deletion
 */
export function clearAllAttribution(): void {
  clearWizardAttribution();

  if (isLocalStorageAvailable()) {
    try {
      window.localStorage.removeItem(ATTRIBUTION_KEY_LOCAL);
    } catch {
      // Ignore storage errors
    }
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
  const utm_term = searchParams.get('utm_term');
  const utm_content = searchParams.get('utm_content');
  const product = searchParams.get('product');
  const jurisdiction = searchParams.get('jurisdiction');

  if (src) attribution.src = src;
  if (topic) attribution.topic = topic;
  if (utm_source) attribution.utm_source = utm_source;
  if (utm_medium) attribution.utm_medium = utm_medium;
  if (utm_campaign) attribution.utm_campaign = utm_campaign;
  if (utm_term) attribution.utm_term = utm_term;
  if (utm_content) attribution.utm_content = utm_content;
  if (product) attribution.product = product;
  if (jurisdiction) attribution.jurisdiction = jurisdiction;

  return attribution;
}

/**
 * Initialize attribution from current URL
 * Should be called on ANY page load where attribution tracking is needed
 * (wizard entry, SEO landing pages, etc.)
 */
export function initializeAttribution(): WizardAttributionPayload {
  if (typeof window === 'undefined') {
    return {
      ...DEFAULT_ATTRIBUTION,
      landing_url: '',
      landing_path: '',
      first_seen_at: new Date().toISOString(),
    };
  }

  const searchParams = new URLSearchParams(window.location.search);
  const urlAttribution = extractAttributionFromUrl(searchParams);

  // Capture referrer on first visit
  const referrer = getReferrer();

  const payload: Partial<WizardAttributionPayload> = {
    ...urlAttribution,
    // Set referrer (will only be stored if not already set - first-touch)
    referrer,
    // Set landing_path
    landing_path: window.location.pathname,
    // Set landing_url
    landing_url: window.location.href,
  };

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
    utm_term: attribution.utm_term,
    utm_content: attribution.utm_content,
    product: attribution.product,
    jurisdiction: attribution.jurisdiction,
    landing_url: attribution.landing_url,
    landing_path: attribution.landing_path,
    referrer: attribution.referrer,
    first_seen_at: attribution.first_seen_at,
    ga_client_id: attribution.ga_client_id,
  };
}

/**
 * Get attribution payload formatted for checkout API
 * This returns the exact shape expected by /api/checkout/create
 *
 * @returns CheckoutAttributionPayload with null for missing values
 */
export function getCheckoutAttribution(): CheckoutAttributionPayload {
  const attribution = getWizardAttribution();

  return {
    landing_path: attribution.landing_path || null,
    utm_source: attribution.utm_source || null,
    utm_medium: attribution.utm_medium || null,
    utm_campaign: attribution.utm_campaign || null,
    utm_term: attribution.utm_term || null,
    utm_content: attribution.utm_content || null,
    referrer: attribution.referrer || null,
    first_touch_at: attribution.first_seen_at || null,
    ga_client_id: attribution.ga_client_id || null,
  };
}
