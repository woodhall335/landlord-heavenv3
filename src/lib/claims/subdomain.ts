const STATIC_PREFIXES = ['/_next', '/api', '/favicon.ico', '/icon.png', '/apple-icon.png'];

export function shouldRewriteClaimsSubdomain(hostname: string, pathname: string): boolean {
  const host = hostname.toLowerCase().split(':')[0];

  if (host !== 'claims.landlordheaven.co.uk') {
    return false;
  }

  if (pathname === '/claims' || pathname.startsWith('/claims/')) {
    return false;
  }

  return !STATIC_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function getClaimsRewritePath(pathname: string): string {
  if (pathname === '/' || pathname === '/file-claim') {
    return '/claims';
  }

  return `/claims${pathname}`;
}
