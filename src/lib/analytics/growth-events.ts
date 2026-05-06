export const MARKETING_SESSION_STORAGE_KEY = 'lh_marketing_session_id';

export const MARKETING_GROWTH_EVENT_NAMES = [
  'commercial_bridge_viewed',
  'commercial_bridge_clicked',
  'tool_started',
  'tool_completed',
  'result_viewed',
  'product_cta_clicked',
  'checkout_started',
  'purchase_completed',
  'product_page_viewed',
] as const;

export type MarketingGrowthEventName = (typeof MARKETING_GROWTH_EVENT_NAMES)[number];

export type GrowthCtaPosition =
  | 'hero'
  | 'selector'
  | 'route_card'
  | 'quick_answer'
  | 'section'
  | 'final'
  | 'support'
  | 'top'
  | 'mid'
  | 'bottom'
  | 'faq';

export interface MarketingGrowthEventPayload {
  sourcePage?: string | null;
  pagePath?: string | null;
  pageType?: string | null;
  intent?: string | null;
  ctaPosition?: GrowthCtaPosition | string | null;
  destination?: string | null;
  recommendedProduct?: string | null;
  productClicked?: string | null;
  clickedProduct?: string | null;
  product?: string | null;
  userType?: string | null;
  toolName?: string | null;
  resultState?: string | null;
  challengeRisk?: string | number | null;
  evidenceStrength?: string | null;
}

export interface NormalizedMarketingGrowthEvent {
  eventName: MarketingGrowthEventName;
  marketingSessionId: string;
  sourcePage: string | null;
  pagePath: string | null;
  pageType: string | null;
  intent: string | null;
  ctaPosition: string | null;
  destination: string | null;
  recommendedProduct: string | null;
  productClicked: string | null;
  userType: string | null;
  toolName: string | null;
  eventPayload: Record<string, string | number | boolean | null>;
}

const PAYLOAD_KEYS = [
  'sourcePage',
  'pagePath',
  'pageType',
  'intent',
  'ctaPosition',
  'destination',
  'recommendedProduct',
  'productClicked',
  'clickedProduct',
  'product',
  'userType',
  'toolName',
  'resultState',
  'challengeRisk',
  'evidenceStrength',
] as const;

const MAX_STRING_LENGTH = 500;

export function isMarketingGrowthEventName(value: unknown): value is MarketingGrowthEventName {
  return (
    typeof value === 'string' &&
    (MARKETING_GROWTH_EVENT_NAMES as readonly string[]).includes(value)
  );
}

function createId(prefix: string) {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID()}`;
  }

  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function isStorageAvailable(storage: Storage | undefined): storage is Storage {
  if (!storage) return false;

  try {
    const key = '__lh_growth_storage__';
    storage.setItem(key, key);
    storage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

export function getMarketingSessionId(): string | null {
  if (typeof window === 'undefined') return null;

  const localStorageAvailable = isStorageAvailable(window.localStorage);
  const sessionStorageAvailable = isStorageAvailable(window.sessionStorage);
  const existing =
    (localStorageAvailable ? window.localStorage.getItem(MARKETING_SESSION_STORAGE_KEY) : null) ||
    (sessionStorageAvailable ? window.sessionStorage.getItem(MARKETING_SESSION_STORAGE_KEY) : null);

  if (existing) return existing;

  const nextId = createId('mkt');

  try {
    if (localStorageAvailable) window.localStorage.setItem(MARKETING_SESSION_STORAGE_KEY, nextId);
    if (sessionStorageAvailable) window.sessionStorage.setItem(MARKETING_SESSION_STORAGE_KEY, nextId);
  } catch {
    // Ignore storage failures and still return the in-memory ID for this call.
  }

  return nextId;
}

function normalizeScalar(value: unknown): string | number | boolean | null {
  if (typeof value === 'string') {
    const trimmed = value.trim().slice(0, MAX_STRING_LENGTH);
    return trimmed || null;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  return null;
}

function normalizeString(value: unknown): string | null {
  const normalized = normalizeScalar(value);
  return typeof normalized === 'string' ? normalized : null;
}

function normalizeEventPayload(payload: Record<string, unknown>) {
  return PAYLOAD_KEYS.reduce<Record<string, string | number | boolean | null>>((acc, key) => {
    const value = normalizeScalar(payload[key]);
    if (value !== null) acc[key] = value;
    return acc;
  }, {});
}

export function normalizeMarketingGrowthEvent(input: {
  eventName: unknown;
  marketingSessionId: unknown;
  payload?: Record<string, unknown> | null;
}): NormalizedMarketingGrowthEvent | null {
  if (!isMarketingGrowthEventName(input.eventName)) return null;

  const marketingSessionId = normalizeString(input.marketingSessionId);
  if (!marketingSessionId) return null;

  const payload = input.payload || {};
  const productClicked =
    normalizeString(payload.productClicked) ||
    normalizeString(payload.clickedProduct) ||
    normalizeString(payload.product);

  return {
    eventName: input.eventName,
    marketingSessionId,
    sourcePage: normalizeString(payload.sourcePage) || normalizeString(payload.pagePath),
    pagePath: normalizeString(payload.pagePath) || normalizeString(payload.sourcePage),
    pageType: normalizeString(payload.pageType),
    intent: normalizeString(payload.intent),
    ctaPosition: normalizeString(payload.ctaPosition),
    destination: normalizeString(payload.destination),
    recommendedProduct: normalizeString(payload.recommendedProduct),
    productClicked,
    userType: normalizeString(payload.userType),
    toolName: normalizeString(payload.toolName),
    eventPayload: normalizeEventPayload(payload),
  };
}

export function recordMarketingGrowthEvent(
  eventName: MarketingGrowthEventName,
  payload: MarketingGrowthEventPayload = {}
): void {
  if (typeof window === 'undefined') return;

  const marketingSessionId = getMarketingSessionId();
  if (!marketingSessionId) return;

  const body = JSON.stringify({
    eventName,
    marketingSessionId,
    payload,
  });

  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: 'application/json' });
      if (navigator.sendBeacon('/api/analytics/events', blob)) {
        return;
      }
    }

    void fetch('/api/analytics/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
      credentials: 'same-origin',
    });
  } catch {
    // Analytics must never block the user's path through the funnel.
  }
}
