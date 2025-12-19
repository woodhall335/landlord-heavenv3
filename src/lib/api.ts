export function apiUrl(path: string): string {
  const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

  // Use relative paths in the browser to preserve Next.js routing behaviour
  if (isBrowser) {
    return path;
  }

  // In Node/SSR/tests, build an absolute URL so fetch has a valid base
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return new URL(path, base).toString();
}
