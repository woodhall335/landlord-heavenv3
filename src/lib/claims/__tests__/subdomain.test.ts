import { describe, expect, it } from 'vitest';

import {
  getClaimsRewritePath,
  isClaimsSubdomainHost,
  shouldRewriteClaimsSubdomain,
  shouldRewriteClaimsSubdomainFromHosts,
} from '../subdomain';

describe('claims subdomain routing', () => {
  it('rewrites the claims subdomain root to the claims app', () => {
    expect(shouldRewriteClaimsSubdomain('claims.landlordheaven.co.uk', '/')).toBe(true);
    expect(getClaimsRewritePath('/')).toBe('/claims');
  });

  it('supports a file-claim alias for ads and direct campaigns', () => {
    expect(shouldRewriteClaimsSubdomain('claims.landlordheaven.co.uk', '/file-claim')).toBe(true);
    expect(getClaimsRewritePath('/file-claim')).toBe('/claims');
  });

  it('recognises forwarded host header values from Vercel', () => {
    expect(isClaimsSubdomainHost('claims.landlordheaven.co.uk:443')).toBe(true);
    expect(isClaimsSubdomainHost('claims.landlordheaven.co.uk, landlord-heavenv3.vercel.app')).toBe(true);
    expect(
      shouldRewriteClaimsSubdomainFromHosts(
        ['landlord-heavenv3.vercel.app', 'claims.landlordheaven.co.uk'],
        '/',
      ),
    ).toBe(true);
  });

  it('does not rewrite app assets, APIs, or already rewritten claims paths', () => {
    expect(shouldRewriteClaimsSubdomain('claims.landlordheaven.co.uk', '/_next/static/app.js')).toBe(false);
    expect(shouldRewriteClaimsSubdomain('claims.landlordheaven.co.uk', '/api/checkout')).toBe(false);
    expect(shouldRewriteClaimsSubdomain('claims.landlordheaven.co.uk', '/claims')).toBe(false);
    expect(shouldRewriteClaimsSubdomain('claims.landlordheaven.co.uk', '/claims/unpaid-invoice')).toBe(false);
  });

  it('leaves the main domain alone', () => {
    expect(shouldRewriteClaimsSubdomain('landlordheaven.co.uk', '/')).toBe(false);
    expect(shouldRewriteClaimsSubdomain('www.landlordheaven.co.uk', '/file-claim')).toBe(false);
  });
});
