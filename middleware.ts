import { NextResponse, type NextRequest } from 'next/server';

import { getClaimsRewritePath, shouldRewriteClaimsSubdomainFromHosts } from '@/lib/claims/subdomain';

export function middleware(request: NextRequest) {
  const { hostname, pathname } = request.nextUrl;
  const forwardedHost = request.headers.get('x-forwarded-host');
  const host = request.headers.get('host');

  if (!shouldRewriteClaimsSubdomainFromHosts([forwardedHost, host, hostname], pathname)) {
    return NextResponse.next();
  }

  const rewriteUrl = request.nextUrl.clone();
  rewriteUrl.pathname = getClaimsRewritePath(pathname);

  return NextResponse.rewrite(rewriteUrl);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png).*)'],
};
