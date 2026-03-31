import {
  getAnalyticsEventDefinition,
  type AnalyticsDedupeScope,
  type AnalyticsEventVariant,
} from './event-registry';

export interface AnalyticsDispatchOptions {
  family?: string;
  variant?: AnalyticsEventVariant;
  dedupeScope?: AnalyticsDedupeScope;
  dedupeKey?: string;
}

const ANALYTICS_TRACKED_EVENTS_KEY = 'lh_ga4_tracked_events';
const IGNORED_DEDUPE_KEYS = new Set(['timestamp']);
const memoryTrackedEvents = new Set<string>();

function isSessionStorageAvailable(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const testKey = '__lh_ga4_dispatch__';
    window.sessionStorage.setItem(testKey, testKey);
    window.sessionStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

function readTrackedEvents(): string[] {
  if (!isSessionStorageAvailable()) {
    return [];
  }

  try {
    const raw = window.sessionStorage.getItem(ANALYTICS_TRACKED_EVENTS_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((value) => typeof value === 'string') : [];
  } catch {
    return [];
  }
}

function writeTrackedEvents(keys: string[]): void {
  if (!isSessionStorageAvailable()) {
    return;
  }

  try {
    window.sessionStorage.setItem(ANALYTICS_TRACKED_EVENTS_KEY, JSON.stringify(keys));
  } catch {
    // Ignore storage errors
  }
}

function stableSerialize(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableSerialize(item)).join(',')}]`;
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([key, childValue]) => !IGNORED_DEDUPE_KEYS.has(key) && childValue !== undefined)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, childValue]) => `${key}:${stableSerialize(childValue)}`);

    return `{${entries.join(',')}}`;
  }

  return JSON.stringify(value);
}

function buildDefaultDedupeKey(
  eventName: string,
  eventParams: Record<string, any> | undefined,
  dedupeScope: AnalyticsDedupeScope
): string {
  const parts = [dedupeScope, eventName];

  if (dedupeScope === 'page' && typeof window !== 'undefined') {
    parts.push(window.location.pathname || 'unknown_page');
  }

  if (dedupeScope === 'case') {
    const caseId = eventParams?.case_id ?? eventParams?.caseId ?? eventParams?.caseID;
    if (caseId) {
      parts.push(String(caseId));
    }
  }

  const serializedParams = stableSerialize(eventParams);
  if (serializedParams) {
    parts.push(serializedParams);
  }

  return parts.join('::');
}

export function getResolvedAnalyticsDispatchOptions(
  eventName: string,
  eventParams?: Record<string, any>,
  dispatchOptions?: AnalyticsDispatchOptions
): {
  eventParams: Record<string, any> | undefined;
  dedupeKey?: string;
  dedupeScope: AnalyticsDedupeScope;
} {
  const definition = getAnalyticsEventDefinition(eventName);
  const family = dispatchOptions?.family ?? definition?.family;
  const variant = dispatchOptions?.variant ?? definition?.variant;
  const dedupeScope = dispatchOptions?.dedupeScope ?? definition?.dedupeScope ?? 'none';

  const params =
    family || variant
      ? {
          ...(eventParams || {}),
          ...(family ? { event_family: family } : {}),
          ...(variant ? { event_variant: variant } : {}),
        }
      : eventParams;

  const dedupeKey =
    dedupeScope === 'none'
      ? undefined
      : dispatchOptions?.dedupeKey
        ? [dedupeScope, eventName, dispatchOptions.dedupeKey].join('::')
        : buildDefaultDedupeKey(eventName, params, dedupeScope);

  return {
    eventParams: params,
    dedupeKey,
    dedupeScope,
  };
}

export function hasTrackedAnalyticsEvent(dedupeKey: string): boolean {
  if (memoryTrackedEvents.has(dedupeKey)) {
    return true;
  }

  return readTrackedEvents().includes(dedupeKey);
}

export function markTrackedAnalyticsEvent(dedupeKey: string): void {
  memoryTrackedEvents.add(dedupeKey);

  const trackedEvents = readTrackedEvents();
  if (trackedEvents.includes(dedupeKey)) {
    return;
  }

  trackedEvents.push(dedupeKey);
  writeTrackedEvents(trackedEvents);
}

export function resetTrackedAnalyticsEvents(): void {
  memoryTrackedEvents.clear();

  if (!isSessionStorageAvailable()) {
    return;
  }

  try {
    window.sessionStorage.removeItem(ANALYTICS_TRACKED_EVENTS_KEY);
  } catch {
    // Ignore storage errors
  }
}
