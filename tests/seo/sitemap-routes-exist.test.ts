import { beforeAll, describe, expect, it } from 'vitest';

import robots from '@/app/robots';
import sitemap from '@/app/sitemap';
import { getPostRegion } from '@/lib/blog/categories';
import { blogPosts } from '@/lib/blog/posts';
import { getBlogSeoConfig } from '@/lib/blog/seo';
import { getValidTopicHubs } from '@/lib/blog/topic-hubs';
import { discoverStaticPageRoutes } from '@/lib/seo/static-route-inventory';

describe('Sitemap Route Existence', () => {
  let sitemapEntries: Awaited<ReturnType<typeof sitemap>> = [];
  let sitemapPaths: string[] = [];
  let knownPublicRoutes = new Set<string>();

  beforeAll(async () => {
    sitemapEntries = await sitemap();
    sitemapPaths = sitemapEntries.map((entry) => new URL(entry.url).pathname);

    const staticRoutes = await discoverStaticPageRoutes();
    const indexableBlogPosts = blogPosts
      .filter((post) => getBlogSeoConfig(post, getPostRegion(post.slug)).isIndexable)
      .map((post) => `/blog/${post.slug}`);
    const topicHubRoutes = getValidTopicHubs().map((slug) => `/blog/${slug}`);
    const manualConfigRoutes = [
      '/rent-increase/section-13-notice',
      '/rent-increase/how-to-increase-rent',
      '/rent-increase/form-4a-guide',
      '/rent-increase/section-13-tribunal',
      '/rent-increase/market-rent-calculation',
      '/rent-increase/rent-increase-challenge',
    ];

    knownPublicRoutes = new Set([
      ...staticRoutes,
      ...indexableBlogPosts,
      ...topicHubRoutes,
      ...manualConfigRoutes,
    ]);
  });

  it('has sitemap entries', () => {
    expect(sitemapPaths.length).toBeGreaterThan(0);
  });

  it('only includes known static or dynamic public routes', () => {
    const unknownRoutes = sitemapPaths.filter((pathname) => !knownPublicRoutes.has(pathname));

    expect(
      unknownRoutes,
      `Unexpected sitemap route(s):\n${unknownRoutes.map((pathname) => `  - ${pathname}`).join('\n')}`
    ).toEqual([]);
  });

  it('includes the sitewide commercial owner pages', () => {
    expect(sitemapPaths).toEqual(
      expect.arrayContaining([
        '/products/ast',
        '/products/notice-only',
        '/products/complete-pack',
        '/products/money-claim',
        '/rent-increase',
      ])
    );
  });

  it('includes the exact tenancy sales pages', () => {
    expect(sitemapPaths).toEqual(
      expect.arrayContaining([
        '/standard-tenancy-agreement',
        '/premium-tenancy-agreement',
        '/student-tenancy-agreement',
        '/hmo-shared-house-tenancy-agreement',
        '/lodger-agreement',
      ])
    );
  });

  it('includes the high-intent live support pages we want indexed', () => {
    expect(sitemapPaths).toEqual(
      expect.arrayContaining([
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
        '/periodic-tenancy-agreement',
      ])
    );
  });

  it('includes blog topic hubs and indexed landlord posts', () => {
    expect(sitemapPaths).toEqual(
      expect.arrayContaining([
        '/blog',
        '/blog/eviction-guides',
        '/blog/rent-arrears',
        '/blog/section-8',
        '/blog/landlord-compliance',
        '/blog/how-to-serve-eviction-notice',
        '/blog/england-section-8-process',
        '/blog/england-money-claim-online',
        '/blog/wales-renting-homes-act',
        '/blog/scotland-private-residential-tenancy',
        '/blog/northern-ireland-eviction-process',
      ])
    );
  });

  it('excludes retired and redirected URLs from the sitemap', () => {
    expect(sitemapPaths).not.toEqual(
      expect.arrayContaining([
        '/tenancy-agreement-template-uk',
        '/tenancy-agreements',
        '/eviction-notice',
        '/eviction-notice-uk',
        '/section-8-notice-guide',
        '/lodger-agreement-template',
        '/hmo-tenancy-agreement-template',
        '/rent-increase/rent-increase-rules-uk',
        '/complete-eviction-pack-england',
        '/eviction-pack-england',
        '/section-21-court-pack',
        '/section-8-court-pack',
      ])
    );
  });

  it('keeps the commercial owners at the expected priority', () => {
    const priorities = new Map(
      sitemapEntries.map((entry) => [new URL(entry.url).pathname, entry.priority])
    );

    expect(priorities.get('/products/ast')).toBe(0.95);
    expect(priorities.get('/products/notice-only')).toBe(0.95);
    expect(priorities.get('/products/complete-pack')).toBe(0.95);
    expect(priorities.get('/products/money-claim')).toBe(0.95);
    expect(priorities.get('/rent-increase')).toBe(0.92);
  });

  it('never includes private app routes', () => {
    const blockedPrefixes = ['/wizard', '/dashboard', '/auth', '/api'];

    for (const prefix of blockedPrefixes) {
      const matchingRoutes = sitemapPaths.filter(
        (pathname) => pathname === prefix || pathname.startsWith(`${prefix}/`)
      );
      expect(matchingRoutes, `${prefix} routes should not be in the sitemap`).toEqual([]);
    }
  });
});

describe('Robots.txt Configuration', () => {
  it('disallows private app areas in production', () => {
    const originalVercelEnv = process.env.VERCEL_ENV;
    process.env.VERCEL_ENV = 'production';

    const robotsConfig = robots();

    process.env.VERCEL_ENV = originalVercelEnv;

    const rules = Array.isArray(robotsConfig.rules) ? robotsConfig.rules : [robotsConfig.rules];
    const disallowedPaths = rules.flatMap((rule) =>
      Array.isArray(rule.disallow) ? rule.disallow : [rule.disallow]
    );

    expect(disallowedPaths).toEqual(
      expect.arrayContaining(['/wizard/', '/dashboard/', '/auth/', '/api/'])
    );
  });

  it('does not block the live commercial entry pages', () => {
    const originalVercelEnv = process.env.VERCEL_ENV;
    process.env.VERCEL_ENV = 'production';

    const robotsConfig = robots();

    process.env.VERCEL_ENV = originalVercelEnv;

    const rules = Array.isArray(robotsConfig.rules) ? robotsConfig.rules : [robotsConfig.rules];
    const disallowedPaths = rules.flatMap((rule) =>
      Array.isArray(rule.disallow) ? rule.disallow : [rule.disallow]
    );

    const liveEntryPages = [
      '/products/ast',
      '/products/notice-only',
      '/products/complete-pack',
      '/products/money-claim',
      '/rent-increase',
      '/standard-tenancy-agreement',
      '/premium-tenancy-agreement',
    ];

    for (const route of liveEntryPages) {
      const isBlocked = disallowedPaths.some((pattern) => {
        if (typeof pattern !== 'string') {
          return false;
        }

        return route === pattern || route.startsWith(pattern);
      });

      expect(isBlocked, `Live entry route ${route} should not be blocked by robots.txt`).toBe(
        false
      );
    }
  });

  it('includes the sitemap URL in production', () => {
    const originalVercelEnv = process.env.VERCEL_ENV;
    process.env.VERCEL_ENV = 'production';

    const robotsConfig = robots();

    process.env.VERCEL_ENV = originalVercelEnv;

    expect(robotsConfig.sitemap).toContain('/sitemap.xml');
  });
});
