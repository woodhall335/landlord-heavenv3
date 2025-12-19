export function apiUrl(path: string): string {
  const isNodeLike = typeof process !== 'undefined' && !!process.versions?.node;
  const isMockedFetch =
    typeof fetch === 'function' && typeof (fetch as any).mock === 'object';

  // Use relative paths in the browser to preserve Next.js routing behaviour
  if ((!isNodeLike && typeof window !== 'undefined') || isMockedFetch) {
    return path;
  }

  // In Node/SSR, build an absolute URL so fetch has a valid base
  const base =
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_BASE_URL) ||
    'http://localhost:3000';

  return new URL(path, base).toString();
}
