/**
 * Ask Heaven Attribution Tracking
 *
 * Manages attribution data for Ask Heaven sessions using sessionStorage.
 * Captures UTM params, source, topic, and persists across page navigations.
 * Similar to wizardAttribution.ts but specific to Ask Heaven flow.
 */

export interface AskHeavenAttributionPayload {
  src: string;
  topic: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  jurisdiction?: string;
  landing_url: string;
  first_seen_at: string;
  question_count: number;
  email_captured: boolean;
}

const ATTRIBUTION_KEY = 'ask_heaven_attribution';

/**
 * Default attribution values when none are present
 */
const DEFAULT_ATTRIBUTION: Pick<AskHeavenAttributionPayload, 'src' | 'topic'> = {
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
 * Get current Ask Heaven attribution from sessionStorage
 * Falls back to defaults if not set
 */
export function getAskHeavenAttribution(): AskHeavenAttributionPayload {
  if (!isSessionStorageAvailable()) {
    return {
      ...DEFAULT_ATTRIBUTION,
      landing_url: typeof window !== 'undefined' ? window.location.href : '',
      first_seen_at: new Date().toISOString(),
      question_count: 0,
      email_captured: false,
    };
  }

  try {
    const stored = window.sessionStorage.getItem(ATTRIBUTION_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as AskHeavenAttributionPayload;
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
    question_count: 0,
    email_captured: false,
  };
}

/**
 * Set/update Ask Heaven attribution
 * Merges with existing data, keeping first_seen_at and landing_url stable
 */
export function setAskHeavenAttribution(
  payload: Partial<AskHeavenAttributionPayload>
): AskHeavenAttributionPayload {
  if (!isSessionStorageAvailable()) {
    return {
      ...DEFAULT_ATTRIBUTION,
      landing_url: typeof window !== 'undefined' ? window.location.href : '',
      first_seen_at: new Date().toISOString(),
      question_count: 0,
      email_captured: false,
      ...payload,
    };
  }

  const existing = getAskHeavenAttribution();

  // Keep original first_seen_at and landing_url
  const updated: AskHeavenAttributionPayload = {
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
 * Increment question count
 */
export function incrementQuestionCount(): number {
  const current = getAskHeavenAttribution();
  const newCount = (current.question_count || 0) + 1;
  setAskHeavenAttribution({ question_count: newCount });
  return newCount;
}

/**
 * Mark email as captured
 */
export function markEmailCaptured(): void {
  setAskHeavenAttribution({ email_captured: true });
}

/**
 * Check if email has been captured
 */
export function hasEmailBeenCaptured(): boolean {
  return getAskHeavenAttribution().email_captured;
}

/**
 * Get current question count
 */
export function getQuestionCount(): number {
  return getAskHeavenAttribution().question_count || 0;
}

/**
 * Clear Ask Heaven attribution (e.g., after conversion)
 */
export function clearAskHeavenAttribution(): void {
  if (!isSessionStorageAvailable()) return;

  try {
    window.sessionStorage.removeItem(ATTRIBUTION_KEY);
  } catch {
    // Ignore storage errors
  }
}

/**
 * Extract attribution params from URL search params
 */
export function extractAskHeavenAttributionFromUrl(
  searchParams: URLSearchParams
): Partial<AskHeavenAttributionPayload> {
  const attribution: Partial<AskHeavenAttributionPayload> = {};

  const src = searchParams.get('src');
  const topic = searchParams.get('topic');
  const utm_source = searchParams.get('utm_source');
  const utm_medium = searchParams.get('utm_medium');
  const utm_campaign = searchParams.get('utm_campaign');
  const jurisdiction = searchParams.get('jurisdiction');

  if (src) attribution.src = src;
  if (topic) attribution.topic = topic;
  if (utm_source) attribution.utm_source = utm_source;
  if (utm_medium) attribution.utm_medium = utm_medium;
  if (utm_campaign) attribution.utm_campaign = utm_campaign;
  if (jurisdiction) attribution.jurisdiction = jurisdiction;

  return attribution;
}

/**
 * Initialize attribution from current URL
 * Should be called on Ask Heaven page load
 */
export function initializeAskHeavenAttribution(): AskHeavenAttributionPayload {
  if (typeof window === 'undefined') {
    return {
      ...DEFAULT_ATTRIBUTION,
      landing_url: '',
      first_seen_at: new Date().toISOString(),
      question_count: 0,
      email_captured: false,
    };
  }

  const searchParams = new URLSearchParams(window.location.search);
  const urlAttribution = extractAskHeavenAttributionFromUrl(searchParams);

  // Set landing URL and first_seen_at if this is first visit
  const existing = getAskHeavenAttribution();

  const payload: Partial<AskHeavenAttributionPayload> = {
    ...urlAttribution,
  };

  // Only set landing_url if not already set
  if (!existing.landing_url || existing.landing_url === '') {
    payload.landing_url = window.location.href;
  }

  return setAskHeavenAttribution(payload);
}

/**
 * Get attribution payload for analytics events
 * Returns a flat object suitable for event tracking
 */
export function getAskHeavenAttributionForAnalytics(): Record<string, string | number | boolean | undefined> {
  const attribution = getAskHeavenAttribution();

  return {
    source: attribution.src,
    topic: attribution.topic,
    utm_source: attribution.utm_source,
    utm_medium: attribution.utm_medium,
    utm_campaign: attribution.utm_campaign,
    jurisdiction: attribution.jurisdiction,
    landing_url: attribution.landing_url,
    first_seen_at: attribution.first_seen_at,
    question_count: attribution.question_count,
    email_captured: attribution.email_captured,
  };
}
