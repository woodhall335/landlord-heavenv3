import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { describe, expect, it } from 'vitest';

import sitemap from '@/app/sitemap';
import { SEO_PILLAR_ROUTES, getSeoPageTaxonomy } from '@/lib/seo/page-taxonomy';

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
  it('registers the Phase 1 redirect map for retired owners and aliases', async () => {
    const redirects = await getRedirects();

    expect(redirects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source: '/eviction-notice',
          destination: '/eviction-notice-template',
          permanent: true,
        }),
        expect.objectContaining({
          source: '/eviction-notice-england',
          destination: '/eviction-notice-template',
          permanent: true,
        }),
        expect.objectContaining({
          source: '/eviction-notice-uk',
          destination: '/eviction-notice-template',
          permanent: true,
        }),
        expect.objectContaining({
          source: '/complete-eviction-pack-england',
          destination: '/products/complete-pack',
          permanent: true,
        }),
        expect.objectContaining({
          source: '/eviction-pack-england',
          destination: '/products/complete-pack',
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
        expect.objectContaining({
          source: '/products/money-claim-pack',
          destination: '/products/money-claim',
          permanent: true,
        }),
        expect.objectContaining({
          source: '/mcol-money-claim-online',
          destination: '/money-claim-online-mcol',
          permanent: true,
        }),
        expect.objectContaining({
          source: '/tenancy-agreements',
          destination: '/tenancy-agreement-template-uk',
          permanent: true,
        }),
        expect.objectContaining({
          source: '/tenancy-agreements/england-wales',
          destination: '/tenancy-agreement-template-uk',
          permanent: true,
        }),
        expect.objectContaining({
          source: '/products/tenancy-agreement',
          destination: '/tenancy-agreement-template-uk',
          permanent: true,
        }),
        expect.objectContaining({
          source: '/tenancy-agreements/standard',
          destination: '/tenancy-agreement-template-uk',
          permanent: true,
        }),
        expect.objectContaining({
          source: '/wales-eviction-notice-template',
          destination: '/wales-eviction-notices',
          permanent: true,
        }),
        expect.objectContaining({
          source: '/scotland-notice-to-leave-template',
          destination: '/scotland-eviction-notices',
          permanent: true,
        }),
      ])
    );
  });

  it('removes pure redirect page files once config redirects exist', () => {
    const retiredPageFiles = [
      'src/app/eviction-notice/page.tsx',
      'src/app/eviction-notice-england/page.tsx',
      'src/app/eviction-notice-uk/page.tsx',
      'src/app/complete-eviction-pack-england/page.tsx',
      'src/app/eviction-pack-england/page.tsx',
      'src/app/section-21-court-pack/page.tsx',
      'src/app/section-8-court-pack/page.tsx',
      'src/app/section-21-notice-generator/page.tsx',
      'src/app/section-8-notice-generator/page.tsx',
      'src/app/mcol-money-claim-online/page.tsx',
      'src/app/(marketing)/products/money-claim-pack/page.tsx',
      'src/app/tenancy-agreements/page.tsx',
      'src/app/tenancy-agreements/england-wales/page.tsx',
      'src/app/wales-eviction-notice-template/page.tsx',
      'src/app/scotland-notice-to-leave-template/page.tsx',
    ];

    retiredPageFiles.forEach((relativePath) => {
      expect(existsSync(path.join(process.cwd(), relativePath)), relativePath).toBe(false);
    });
  });

  it('keeps only live self-canonical routes in the sitemap output', async () => {
    const paths = await getSitemapPathnames();

    expect(paths).toEqual(
      expect.arrayContaining([
        '/tenancy-agreement-template',
        '/tenancy-agreements/england',
        '/products/ast',
        '/eviction-notice-template',
        '/section-8-notice',
        '/section-21-notice',
        '/section-21-vs-section-8',
        '/products/notice-only',
        '/products/complete-pack',
        '/eviction-court-forms-england',
        '/money-claim',
        '/money-claim-unpaid-rent',
        '/money-claim-online-mcol',
        '/products/money-claim',
      ])
    );

    [
      '/tenancy-agreement-template-uk',
      '/tenancy-agreements',
      '/tenancy-agreements/england-wales',
      '/eviction-notice',
      '/eviction-notice-england',
      '/eviction-notice-uk',
      '/complete-eviction-pack-england',
      '/eviction-pack-england',
      '/section-21-court-pack',
      '/section-8-court-pack',
      '/mcol-money-claim-online',
      '/products/money-claim-pack',
      '/wales-eviction-notices',
      '/scotland-eviction-notices',
      '/wales-eviction-notice-template',
      '/scotland-notice-to-leave-template',
    ].forEach((pathname) => {
      expect(paths, `${pathname} should be absent from the sitemap`).not.toContain(pathname);
    });
  });

  it('keeps the Phase 1 owner map aligned in taxonomy and product conversion entries', () => {
    expect(SEO_PILLAR_ROUTES.tenancyAgreementsEngland).toBe('/tenancy-agreement-template');
    expect(SEO_PILLAR_ROUTES.moneyClaim).toBe('/money-claim');

    expect(getSeoPageTaxonomy('/tenancy-agreement-template')).toEqual(
      expect.objectContaining({
        primaryPillar: '/tenancy-agreement-template',
        canonicalTarget: '/tenancy-agreement-template',
        consolidationStatus: 'canonical',
      })
    );
    expect(getSeoPageTaxonomy('/tenancy-agreements/england')).toEqual(
      expect.objectContaining({
        primaryPillar: '/tenancy-agreement-template',
        consolidationStatus: 'supporting_live',
      })
    );
    expect(getSeoPageTaxonomy('/products/ast')).toEqual(
      expect.objectContaining({
        primaryPillar: '/tenancy-agreement-template',
        canonicalTarget: '/products/ast',
      })
    );

    expect(getSeoPageTaxonomy('/eviction-notice-template')).toEqual(
      expect.objectContaining({
        primaryPillar: '/eviction-notice-template',
        canonicalTarget: '/eviction-notice-template',
      })
    );
    expect(getSeoPageTaxonomy('/products/notice-only')).toEqual(
      expect.objectContaining({
        primaryPillar: '/eviction-notice-template',
        canonicalTarget: '/products/notice-only',
      })
    );
    expect(getSeoPageTaxonomy('/eviction-notice')).toEqual(
      expect.objectContaining({
        canonicalTarget: '/eviction-notice-template',
        consolidationStatus: 'candidate_redirect',
      })
    );

    expect(getSeoPageTaxonomy('/products/complete-pack')).toEqual(
      expect.objectContaining({
        primaryPillar: '/products/complete-pack',
        canonicalTarget: '/products/complete-pack',
        consolidationStatus: 'canonical',
      })
    );
    expect(getSeoPageTaxonomy('/section-21-court-pack')).toEqual(
      expect.objectContaining({
        canonicalTarget: '/products/complete-pack',
        consolidationStatus: 'candidate_redirect',
      })
    );
    expect(getSeoPageTaxonomy('/section-8-court-pack')).toEqual(
      expect.objectContaining({
        canonicalTarget: '/products/complete-pack',
        consolidationStatus: 'candidate_redirect',
      })
    );

    expect(getSeoPageTaxonomy('/money-claim')).toEqual(
      expect.objectContaining({
        primaryPillar: '/money-claim',
        canonicalTarget: '/money-claim',
        consolidationStatus: 'canonical',
      })
    );
    expect(getSeoPageTaxonomy('/products/money-claim')).toEqual(
      expect.objectContaining({
        primaryPillar: '/money-claim',
        canonicalTarget: '/products/money-claim',
      })
    );
    expect(getSeoPageTaxonomy('/mcol-money-claim-online')).toEqual(
      expect.objectContaining({
        canonicalTarget: '/money-claim-online-mcol',
        consolidationStatus: 'candidate_redirect',
      })
    );
    expect(getSeoPageTaxonomy('/wales-eviction-notice-template')).toEqual(
      expect.objectContaining({
        canonicalTarget: '/wales-eviction-notices',
        consolidationStatus: 'candidate_redirect',
      })
    );
    expect(getSeoPageTaxonomy('/scotland-notice-to-leave-template')).toEqual(
      expect.objectContaining({
        canonicalTarget: '/scotland-eviction-notices',
        consolidationStatus: 'candidate_redirect',
      })
    );
  });

  it('marks the retained routing pages as noindex,follow in page metadata', () => {
    const ukRouterSource = readSource('src/app/tenancy-agreement-template-uk/page.tsx');
    const walesNoticesSource = readSource('src/app/wales-eviction-notices/page.tsx');
    const scotlandNoticesSource = readSource('src/app/scotland-eviction-notices/page.tsx');

    [ukRouterSource, walesNoticesSource, scotlandNoticesSource].forEach((source) => {
      expect(source).toMatch(/index:\s*false/);
      expect(source).toMatch(/follow:\s*true/);
    });
  });

  it('removes retired alias routes from core helper and authority surfaces', () => {
    const helperSources = [
      readSource('src/components/seo/EvictionIntentLandingPage.tsx'),
      readSource('src/lib/seo/eviction-intent-pages.ts'),
      readSource('src/lib/seo/eviction-authority.ts'),
      readSource('src/lib/seo/pillar-pages-content.ts'),
      readSource('src/lib/seo/phase5-pages.ts'),
    ];
    const moneyClaimSource = readSource('src/app/money-claim/page.tsx');

    helperSources.forEach((source) => {
      [
        '/eviction-notice-england',
        '/section-21-court-pack',
        '/section-8-court-pack',
        '/complete-eviction-pack-england',
        '/section-21-notice-generator',
        '/section-8-notice-generator',
      ].forEach((pathname) => {
        expect(source, `${pathname} should be removed from helper surfaces`).not.toContain(
          pathname
        );
      });
    });

    helperSources.forEach((source) => {
      expect(source).not.toContain("'/eviction-notice'");
    });

    expect(moneyClaimSource).not.toContain('/mcol-money-claim-online');
  });
});
