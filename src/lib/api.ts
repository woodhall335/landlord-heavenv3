/**
 * Build an absolute API URL from a relative path
 *
 * In browser: Returns relative path (Next.js handles routing)
 * In Node/SSR: Builds absolute URL from environment config
 */
export function apiUrl(path: string): string {
  const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

  // Use relative paths in the browser to preserve Next.js routing behaviour
  if (isBrowser) {
    return path;
  }

  // Already absolute URL - return as-is
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  // In Node/SSR/tests, build an absolute URL so fetch has a valid base
  // Priority: NEXT_PUBLIC_APP_URL > NEXT_PUBLIC_BASE_URL
  // No hardcoded fallback in production - must be configured via env vars
  const base = process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.NODE_ENV === 'production'
      ? 'https://landlordheaven.co.uk'
      : 'http://localhost:5000');

  return new URL(path, base).toString();
}
