import { readFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { describe, expect, it } from 'vitest';

import retiredPublicRoutes from '@/config/retired-public-routes.json';
import sitemap from '@/app/sitemap';
import { getSeoPageTaxonomy } from '@/lib/seo/page-taxonomy';

function readSource(relativePath: string) {
  return readFileSync(path.join(process.cwd(), relativePath), 'utf8');
}

async function getRedirects() {
  const configModule = await import(
    pathToFileURL(path.join(process.cwd(), 'next.config.mjs')).href
  );
  return configModule.default.redirects();
}

async function getSitemapPathnames() {
  const entries = await sitemap();
  return entries.map((entry) => new URL(entry.url).pathname);
}

describe('Phase 1 cluster governance', () => {
  it('registers the current duplicate and alias redirect map', async () => {
    const redirects = await getRedirects();

    expect(redirects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source: '/eviction-notice',
          destination: '/eviction-notice-template',
          permanent: true,
        }),
        expect.objectContaining({
          source: '/eviction-notice-uk',
          destination: '/eviction-notice-template',
          permanent: true,
        }),
        expect.objectContaining({
          source: '/section-8-notice-guide',
          destination: '/section-8-notice',
          permanent: true,
        }),
        expect.objectContaining({
          source: '/lodger-agreement-template',
          destination: '/lodger-agreement',
          permanent: true,
        }),
        expect.objectContaining({
          source: '/hmo-tenancy-agreement-template',
          destination: '/hmo-shared-house-tenancy-agreement',
          permanent: true,
        }),
        expect.objectContaining({
          source: '/rent-increase/rent-increase-rules-uk',
          destination: '/rent-increase',
          permanent: true,
        }),
        expect.objectContaining({
          source: '/section-21-court-pack',
          destination: '/products/complete-pack',
          permanent: true,
        }),
        expect.objectContaining({
          source: '/section-8-court-pack',
          destination: '/products/complete-pack',
          permanent: true,
        }),
      ])
    );
  });

  it('does not shadow retained live support pages behind retirement redirects', async () => {
    const activeSweepRoutes = [
      '/section-21-notice-period',
      '/serve-section-21-notice',
      '/section-21-notice-template',
      '/form-6a-section-21',
      '/section-21-validity-checklist',
      '/section-21-expired-what-next',
      '/tenant-ignores-section-21',
      '/what-happens-after-section-21',
      '/section-8-vs-section-21',
      '/accelerated-possession-guide',
      '/n5b-possession-claim-guide',
      '/no-fault-eviction',
      '/section-8-rent-arrears-eviction',
    ];

    const redirects = await getRedirects();
    const redirectSources = new Set(
      redirects
        .filter((item: { source?: string }) => typeof item.source === 'string')
        .map((item: { source?: string }) => item.source as string)
    );
    const retiredSources = new Set(Object.keys(retiredPublicRoutes.routeRedirects));

    for (const pathname of activeSweepRoutes) {
      expect(redirectSources.has(pathname), `${pathname} should stay live, not redirect`).toBe(false);
      expect(
        retiredSources.has(pathname),
        `${pathname} should not remain in retired-public-routes.json`
      ).toBe(false);
    }
  });

  it('keeps live self-canonical routes in the sitemap and leaves redirect-only aliases out', async () => {
    const paths = await getSitemapPathnames();

    expect(paths).toEqual(
      expect.arrayContaining([
        '/products/ast',
        '/products/notice-only',
        '/products/complete-pack',
        '/products/money-claim',
        '/rent-increase',
        '/standard-tenancy-agreement',
        '/premium-tenancy-agreement',
        '/student-tenancy-agreement',
        '/hmo-shared-house-tenancy-agreement',
        '/lodger-agreement',
        '/form-6a-section-21',
        '/section-21-notice-template',
        '/section-21-validity-checklist',
        '/section-21-expired-what-next',
        '/section-21-notice-period',
        '/serve-section-21-notice',
        '/tenant-ignores-section-21',
        '/what-happens-after-section-21',
        '/section-8-vs-section-21',
        '/accelerated-possession-guide',
        '/n5b-possession-claim-guide',
        '/no-fault-eviction',
        '/section-8-rent-arrears-eviction',
      ])
    );

    expect(paths).not.toEqual(
      expect.arrayContaining([
        '/tenancy-agreement-template-uk',
        '/tenancy-agreements',
        '/eviction-notice',
        '/eviction-notice-uk',
        '/complete-eviction-pack-england',
        '/eviction-pack-england',
        '/section-21-court-pack',
        '/section-8-court-pack',
        '/lodger-agreement-template',
        '/hmo-tenancy-agreement-template',
        '/rent-increase/rent-increase-rules-uk',
      ])
    );
  });

  it('keeps taxonomy ownership aligned with the live commercial model', () => {
    expect(getSeoPageTaxonomy('/tenancy-agreement-template')).toEqual(
      expect.objectContaining({
        primaryPillar: '/tenancy-agreement-template',
        canonicalTarget: '/tenancy-agreement-template',
        consolidationStatus: 'canonical',
      })
    );

    expect(getSeoPageTaxonomy('/products/ast')).toEqual(
      expect.objectContaining({
        primaryPillar: '/tenancy-agreement-template',
        canonicalTarget: '/products/ast',
      })
    );

    expect(getSeoPageTaxonomy('/products/notice-only')).toEqual(
      expect.objectContaining({
        primaryPillar: '/eviction-notice-template',
        canonicalTarget: '/products/notice-only',
      })
    );

    expect(getSeoPageTaxonomy('/products/complete-pack')).toEqual(
      expect.objectContaining({
        primaryPillar: '/products/complete-pack',
        canonicalTarget: '/products/complete-pack',
        consolidationStatus: 'canonical',
      })
    );

    expect(getSeoPageTaxonomy('/products/money-claim')).toEqual(
      expect.objectContaining({
        primaryPillar: '/money-claim',
        canonicalTarget: '/products/money-claim',
      })
    );

    expect(getSeoPageTaxonomy('/form-6a-section-21')).toEqual(
      expect.objectContaining({
        canonicalTarget: '/form-6a-section-21',
        consolidationStatus: 'bridge_live',
      })
    );

    expect(getSeoPageTaxonomy('/no-fault-eviction')).toEqual(
      expect.objectContaining({
        canonicalTarget: '/no-fault-eviction',
        consolidationStatus: 'bridge_live',
      })
    );

    expect(getSeoPageTaxonomy('/section-8-rent-arrears-eviction')).toEqual(
      expect.objectContaining({
        canonicalTarget: '/section-8-rent-arrears-eviction',
        consolidationStatus: 'supporting_live',
      })
    );
  });

  it('marks retained routing pages as noindex,follow in page metadata', () => {
    const retainedRouterSources = [
      readSource('src/app/tenancy-agreement-template-uk/page.tsx'),
      readSource('src/app/wales-eviction-notices/page.tsx'),
      readSource('src/app/scotland-eviction-notices/page.tsx'),
    ];

    for (const source of retainedRouterSources) {
      expect(source).toMatch(/index:\s*false/);
      expect(source).toMatch(/follow:\s*true/);
    }
  });

  it('keeps retired alias routes out of helper and authority surfaces', () => {
    const helperSources = [
      readSource('src/components/seo/EvictionIntentLandingPage.tsx'),
      readSource('src/lib/seo/eviction-intent-pages.ts'),
      readSource('src/lib/seo/eviction-authority.ts'),
      readSource('src/lib/seo/pillar-pages-content.ts'),
      readSource('src/lib/seo/phase5-pages.ts'),
    ];

    for (const source of helperSources) {
      for (const pathname of [
        '/eviction-notice-england',
        '/section-21-court-pack',
        '/section-8-court-pack',
        '/complete-eviction-pack-england',
        '/section-21-notice-generator',
        '/section-8-notice-generator',
      ]) {
        expect(source, `${pathname} should be removed from helper surfaces`).not.toContain(
          pathname
        );
      }
    }
  });
});
