import { NextResponse, type NextRequest } from 'next/server';

import { getClaimsRewritePath, shouldRewriteClaimsSubdomain } from '@/lib/claims/subdomain';

export function middleware(request: NextRequest) {
  const { hostname, pathname } = request.nextUrl;

  if (!shouldRewriteClaimsSubdomain(hostname, pathname)) {
    return NextResponse.next();
  }

  const rewriteUrl = request.nextUrl.clone();
  rewriteUrl.pathname = getClaimsRewritePath(pathname);

  return NextResponse.rewrite(rewriteUrl);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png).*)'],
};
