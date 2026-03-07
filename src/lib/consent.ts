const ANALYTICS_DISABLED_FLAG = 'NEXT_PUBLIC_DISABLE_JOURNEY_ANALYTICS';

/**
 * TODO: Integrate this helper with the product's consent banner/cookie manager once available.
 * For now analytics is enabled by default unless explicitly disabled via env flag.
 */
export function hasAnalyticsConsent(): boolean {
  if (process.env[ANALYTICS_DISABLED_FLAG] === 'true') {
    return false;
  }

  if (typeof window === 'undefined') {
    return false;
  }

  return true;
}
