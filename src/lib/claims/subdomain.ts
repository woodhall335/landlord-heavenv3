const STATIC_PREFIXES = ['/_next', '/api', '/favicon.ico', '/icon.png', '/apple-icon.png'];

function normalizeHostname(hostname: string | null | undefined): string {
  return (hostname ?? '')
    .split(',')[0]
    .trim()
    .toLowerCase()
    .split(':')[0];
}

export function isClaimsSubdomainHost(hostname: string | null | undefined): boolean {
  return normalizeHostname(hostname) === 'claims.landlordheaven.co.uk';
}

export function shouldRewriteClaimsSubdomain(
  hostname: string | null | undefined,
  pathname: string,
): boolean {
  if (!isClaimsSubdomainHost(hostname)) {
    return false;
  }

  if (pathname === '/claims' || pathname.startsWith('/claims/')) {
    return false;
  }

  return !STATIC_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function shouldRewriteClaimsSubdomainFromHosts(
  hostnames: Array<string | null | undefined>,
  pathname: string,
): boolean {
  return hostnames.some((hostname) => shouldRewriteClaimsSubdomain(hostname, pathname));
}

export function getClaimsRewritePath(pathname: string): string {
  if (pathname === '/' || pathname === '/file-claim') {
    return '/claims';
  }

  return `/claims${pathname}`;
}
