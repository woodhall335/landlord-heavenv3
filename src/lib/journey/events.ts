import { trackEvent } from '@/lib/analytics';
import { getJourneyState, type JourneyState } from '@/lib/journey/state';

const ALLOWED_JOURNEY_KEYS = new Set<keyof JourneyState>([
  'stage_estimate',
  'jurisdiction_estimate',
  'arrears_band',
  'months_in_arrears_band',
  'last_touch',
  'last_cta',
  'first_seen_ts',
  'last_seen_ts',
]);

const ALLOWED_CONTEXT_KEYS = new Set([
  'page_path',
  'referrer',
  'device_type',
  'journey_state',
]);

type DeviceType = 'mobile' | 'desktop';

interface JourneyEventContext {
  page_path: string;
  referrer: string;
  device_type: DeviceType;
  journey_state: Partial<JourneyState>;
}

function getDeviceType(): DeviceType {
  if (typeof window === 'undefined') return 'desktop';
  return window.matchMedia('(max-width: 767px)').matches ? 'mobile' : 'desktop';
}

function sanitizeJourneyStateSnapshot(state: JourneyState): Partial<JourneyState> {
  const sanitized: Partial<JourneyState> = {};

  for (const [key, value] of Object.entries(state) as Array<[keyof JourneyState, JourneyState[keyof JourneyState]]>) {
    if (ALLOWED_JOURNEY_KEYS.has(key)) {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

function buildContext(override?: Partial<JourneyEventContext>): JourneyEventContext {
  const baseContext: JourneyEventContext = {
    page_path: typeof window !== 'undefined' ? window.location.pathname : '',
    referrer: typeof document !== 'undefined' ? document.referrer || '' : '',
    device_type: getDeviceType(),
    journey_state: sanitizeJourneyStateSnapshot(getJourneyState()),
  };

  return {
    ...baseContext,
    ...override,
    journey_state: {
      ...baseContext.journey_state,
      ...(override?.journey_state ?? {}),
    },
  };
}

function sanitizeContext(context: JourneyEventContext): JourneyEventContext {
  const sanitized: Partial<JourneyEventContext> = {};

  for (const [key, value] of Object.entries(context) as Array<[
    keyof JourneyEventContext,
    JourneyEventContext[keyof JourneyEventContext],
  ]>) {
    if (ALLOWED_CONTEXT_KEYS.has(key)) {
      sanitized[key] = value;
    }
  }

  return sanitized as JourneyEventContext;
}

export function trackCtaImpression({
  cta_id,
  location,
  context,
}: {
  cta_id: string;
  location: string;
  context?: Partial<JourneyEventContext>;
}): void {
  trackEvent('journey_cta_impression', {
    cta_id,
    location,
    context: sanitizeContext(buildContext(context)),
  });
}

export function trackCtaClick({
  cta_id,
  location,
  context,
}: {
  cta_id: string;
  location: string;
  context?: Partial<JourneyEventContext>;
}): void {
  trackEvent('journey_cta_click', {
    cta_id,
    location,
    context: sanitizeContext(buildContext(context)),
  });
}

export function trackToolComplete({
  tool_name,
  context,
}: {
  tool_name: string;
  context?: Partial<JourneyEventContext>;
}): void {
  trackEvent('journey_tool_complete', {
    tool_name,
    context: sanitizeContext(buildContext(context)),
  });
}

export function trackScrollDepth({
  depth,
  context,
}: {
  depth: 25 | 50 | 75 | 90;
  context?: Partial<JourneyEventContext>;
}): void {
  trackEvent('journey_scroll_depth', {
    depth,
    context: sanitizeContext(buildContext(context)),
  });
}
