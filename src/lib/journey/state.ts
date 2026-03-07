export type StageEstimate = 'early_arrears' | 'demand_sent' | 'notice_ready' | 'court_ready' | 'unknown';
export type JurisdictionEstimate = 'england' | 'wales' | 'scotland' | 'ni' | 'unknown';
export type ArrearsBand = '0-499' | '500-999' | '1000-1999' | '2000-3999' | '4000+';
export type MonthsInArrearsBand = '<1' | '1-1.9' | '2-2.9' | '3+';

export type JourneyTouchType = 'blog' | 'tool' | 'ask_heaven' | 'product';

export interface JourneyTouch {
  type: JourneyTouchType;
  id: string;
  ts: number;
}

export interface JourneyCta {
  id: string;
  location: string;
  ts: number;
}

export interface JourneyState {
  stage_estimate: StageEstimate;
  jurisdiction_estimate: JurisdictionEstimate;
  arrears_band: ArrearsBand;
  months_in_arrears_band: MonthsInArrearsBand;
  last_touch: JourneyTouch | null;
  last_cta: JourneyCta | null;
  first_seen_ts: number;
  last_seen_ts: number;
}

const STORAGE_KEY = 'lh_journey_state_v1';

const DEFAULT_JOURNEY_STATE: JourneyState = {
  stage_estimate: 'unknown',
  jurisdiction_estimate: 'unknown',
  arrears_band: '0-499',
  months_in_arrears_band: '<1',
  last_touch: null,
  last_cta: null,
  first_seen_ts: 0,
  last_seen_ts: 0,
};

const STAGES = new Set<StageEstimate>(['early_arrears', 'demand_sent', 'notice_ready', 'court_ready', 'unknown']);
const JURISDICTIONS = new Set<JurisdictionEstimate>(['england', 'wales', 'scotland', 'ni', 'unknown']);
const ARREARS_BANDS = new Set<ArrearsBand>(['0-499', '500-999', '1000-1999', '2000-3999', '4000+']);
const MONTH_BANDS = new Set<MonthsInArrearsBand>(['<1', '1-1.9', '2-2.9', '3+']);

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function normalizeJourneyState(value: unknown): JourneyState {
  const now = Date.now();
  if (!value || typeof value !== 'object') {
    return { ...DEFAULT_JOURNEY_STATE, first_seen_ts: now, last_seen_ts: now };
  }

  const candidate = value as Partial<JourneyState>;
  const firstSeen = Number.isFinite(candidate.first_seen_ts) && (candidate.first_seen_ts ?? 0) > 0
    ? (candidate.first_seen_ts as number)
    : now;

  return {
    stage_estimate: STAGES.has(candidate.stage_estimate as StageEstimate)
      ? (candidate.stage_estimate as StageEstimate)
      : 'unknown',
    jurisdiction_estimate: JURISDICTIONS.has(candidate.jurisdiction_estimate as JurisdictionEstimate)
      ? (candidate.jurisdiction_estimate as JurisdictionEstimate)
      : 'unknown',
    arrears_band: ARREARS_BANDS.has(candidate.arrears_band as ArrearsBand)
      ? (candidate.arrears_band as ArrearsBand)
      : '0-499',
    months_in_arrears_band: MONTH_BANDS.has(candidate.months_in_arrears_band as MonthsInArrearsBand)
      ? (candidate.months_in_arrears_band as MonthsInArrearsBand)
      : '<1',
    last_touch:
      candidate.last_touch &&
      typeof candidate.last_touch.id === 'string' &&
      typeof candidate.last_touch.type === 'string' &&
      Number.isFinite(candidate.last_touch.ts)
        ? {
            type: candidate.last_touch.type as JourneyTouchType,
            id: candidate.last_touch.id,
            ts: candidate.last_touch.ts,
          }
        : null,
    last_cta:
      candidate.last_cta &&
      typeof candidate.last_cta.id === 'string' &&
      typeof candidate.last_cta.location === 'string' &&
      Number.isFinite(candidate.last_cta.ts)
        ? {
            id: candidate.last_cta.id,
            location: candidate.last_cta.location,
            ts: candidate.last_cta.ts,
          }
        : null,
    first_seen_ts: firstSeen,
    last_seen_ts:
      Number.isFinite(candidate.last_seen_ts) && (candidate.last_seen_ts ?? 0) > 0
        ? (candidate.last_seen_ts as number)
        : firstSeen,
  };
}

function readStateFromStorage(): JourneyState {
  if (!isBrowser()) {
    return { ...DEFAULT_JOURNEY_STATE };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const fresh = normalizeJourneyState(null);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
      return fresh;
    }

    const parsed = JSON.parse(raw);
    const normalized = normalizeJourneyState(parsed);
    if (JSON.stringify(parsed) !== JSON.stringify(normalized)) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    }
    return normalized;
  } catch {
    return normalizeJourneyState(null);
  }
}

function writeStateToStorage(state: JourneyState): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // no-op: storage can fail in private/restricted contexts
  }
}

export function getJourneyState(): JourneyState {
  return readStateFromStorage();
}

export function setJourneyState(patch: Partial<JourneyState>, source: string): void {
  if (!isBrowser()) return;

  const now = Date.now();
  const current = readStateFromStorage();
  const next = normalizeJourneyState({
    ...current,
    ...patch,
    first_seen_ts: current.first_seen_ts || now,
    last_seen_ts: now,
  });

  writeStateToStorage(next);

  if (process.env.NODE_ENV === 'development') {
    console.debug('[journey] state updated', { source, patch, next });
  }
}

export function clearJourneyState(): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // no-op
  }
}
