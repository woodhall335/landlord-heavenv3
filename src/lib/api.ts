export function apiUrl(path: string): string {
  const isNode = typeof process !== 'undefined' && !!process.versions?.node;

  // Use relative paths in the browser to preserve Next.js routing behaviour
  if (!isNode && typeof window !== 'undefined') {
    return path;
  }

  // In Node/SSR, build an absolute URL so fetch has a valid base
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return new URL(path, base).toString();
}
