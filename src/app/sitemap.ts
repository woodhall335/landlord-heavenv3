/**
 * Dynamic Sitemap
 *
 * Generates sitemap.xml with main marketing pages and product pages.
 * Private routes (dashboard, wizard, auth) are excluded.
 *
 * Note on lastModified:
 * - Blog posts use their actual updatedDate/date (real content changes)
 * - Static/legal pages omit lastModified (rarely change)
 * - Product/tool pages use a stable quarterly date (not "now")
 *
 * Using "now" for everything creates noise in search console and suggests
 * false freshness signals to Google.
 */

import { MetadataRoute } from 'next';
import { blogPosts } from '@/lib/blog/posts';
import { SITE_ORIGIN } from '@/lib/seo';
import { freeTools, validatorToolRoutes } from '@/lib/tools/tools';
import { getQuestionRepository } from '@/lib/ask-heaven/questions';
import { getPostRegion } from '@/lib/blog/categories';
import { getBlogSeoConfig } from '@/lib/blog/seo';
import { discoverStaticPageRoutes } from '@/lib/seo/static-route-inventory';
import sitemapAllowlist from '../../scripts/seo-sitemap-allowlist.json';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Use a stable date for pages that don't change frequently
  // Update this quarterly when making significant site-wide changes
  const STABLE_PRODUCT_DATE = new Date('2026-01-01');

  // Explicit legacy routes that have been retired and should never reappear in sitemap.
  // These have previously generated 404 coverage issues in Google Search Console.
  const retiredPaths = new Set([
    '/tools/validators/money-claim',
    '/tools/validators/scotland-notice-to-leave',
    '/tools/validators/tenancy-agreement',
    '/tenancy-agreements/premium',
    '/$',
  ]);

  // Core marketing pages - dynamic pages get stable date, legal pages omit lastModified
  const marketingPages = [
    { path: '/', priority: 1.0, changeFrequency: 'weekly' as const, hasDate: true },
    { path: '/pricing', priority: 0.9, changeFrequency: 'weekly' as const, hasDate: true },
    { path: '/about', priority: 0.7, changeFrequency: 'monthly' as const, hasDate: true },
    { path: '/contact', priority: 0.6, changeFrequency: 'monthly' as const, hasDate: false },
    { path: '/help', priority: 0.7, changeFrequency: 'monthly' as const, hasDate: true },
    // Legal pages rarely change - omit lastModified to avoid false freshness signals
    { path: '/terms', priority: 0.3, changeFrequency: 'yearly' as const, hasDate: false },
    { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' as const, hasDate: false },
    { path: '/cookies', priority: 0.3, changeFrequency: 'yearly' as const, hasDate: false },
  ];

  // Product pages
  const productPages = [
    { path: '/products/notice-only', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/products/complete-pack', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/products/money-claim', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/products/ast', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/ask-heaven', priority: 0.8, changeFrequency: 'weekly' as const },
  ];

  // SEO Landing Pages - Clean URLs for wizard entry points
  // These are comprehensive, indexable landing pages with full SEO content
  const wizardLandingPages = [
    { path: '/eviction-notice', priority: 0.95, changeFrequency: 'weekly' as const },
    { path: '/eviction-pack-england', priority: 0.95, changeFrequency: 'weekly' as const },
    { path: '/money-claim', priority: 0.95, changeFrequency: 'weekly' as const },
  ];

  // Tenancy agreement pages - individual jurisdiction pages
  const tenancyPages: { path: string; priority: number; changeFrequency: 'weekly' }[] = [];

  // Long-tail landing pages - SEO targeted
  const landingPages = [
    { path: '/section-21-notice-template', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/eviction-notice-template', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/section-8-notice-template', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/rent-arrears-letter-template', priority: 0.8, changeFrequency: 'weekly' as const },
    // Jurisdiction-specific template pages
    { path: '/wales-eviction-notice-template', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/scotland-notice-to-leave-template', priority: 0.8, changeFrequency: 'weekly' as const },
    // Q1 2026 SEO pages
    { path: '/tenant-wont-leave', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/tenant-not-paying-rent', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/possession-claim-guide', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/eviction-cost-uk', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/how-to-evict-tenant', priority: 0.85, changeFrequency: 'weekly' as const },
    { path: '/wales-eviction-notices', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/scotland-eviction-notices', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/section-21-ban', priority: 0.85, changeFrequency: 'weekly' as const },
    // Q2 2026 SEO pages
    { path: '/n5b-form-guide', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/warrant-of-possession', priority: 0.8, changeFrequency: 'weekly' as const },
    // Money Claim SEO Expansion (Q1 2026) - Damage focused
    { path: '/money-claim-cleaning-costs', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/money-claim-property-damage', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/money-claim-unpaid-utilities', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/money-claim-garden-damage', priority: 0.75, changeFrequency: 'weekly' as const },
    { path: '/money-claim-carpet-damage', priority: 0.75, changeFrequency: 'weekly' as const },
    { path: '/money-claim-appliance-damage', priority: 0.75, changeFrequency: 'weekly' as const },
    { path: '/money-claim-wall-damage', priority: 0.75, changeFrequency: 'weekly' as const },
    { path: '/money-claim-bathroom-damage', priority: 0.75, changeFrequency: 'weekly' as const },
    { path: '/money-claim-abandoned-goods', priority: 0.75, changeFrequency: 'weekly' as const },
    // Money Claim SEO Expansion (Q1 2026) - Debt focused
    { path: '/money-claim-council-tax', priority: 0.75, changeFrequency: 'weekly' as const },
    { path: '/money-claim-early-termination', priority: 0.75, changeFrequency: 'weekly' as const },
    { path: '/money-claim-unpaid-bills', priority: 0.75, changeFrequency: 'weekly' as const },
    { path: '/money-claim-guarantor', priority: 0.75, changeFrequency: 'weekly' as const },
    { path: '/money-claim-former-tenant', priority: 0.75, changeFrequency: 'weekly' as const },
    { path: '/money-claim-deposit-shortfall', priority: 0.75, changeFrequency: 'weekly' as const },
    // Money Claim SEO Expansion (Q1 2026) - High-intent rent arrears keywords
    { path: '/money-claim-unpaid-rent', priority: 0.85, changeFrequency: 'weekly' as const },
    // Money Claim SEO Expansion (Q1 2026) - Process focused
    { path: '/money-claim-online-mcol', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/money-claim-ccj-enforcement', priority: 0.75, changeFrequency: 'weekly' as const },
    { path: '/money-claim-small-claims-landlord', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/money-claim-tenant-defends', priority: 0.75, changeFrequency: 'weekly' as const },
    // Money Claim Form/Template Pages
    { path: '/money-claim-n1-claim-form', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/money-claim-letter-before-action', priority: 0.75, changeFrequency: 'monthly' as const },
    { path: '/money-claim-schedule-of-debt', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/money-claim-pap-financial-statement', priority: 0.7, changeFrequency: 'monthly' as const },
    // Tenancy Agreement SEO Pages - England (Q1 2026)
    { path: '/assured-shorthold-tenancy-agreement-template', priority: 0.85, changeFrequency: 'weekly' as const },
    { path: '/tenancy-agreement-template-free', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/joint-tenancy-agreement-template', priority: 0.8, changeFrequency: 'weekly' as const },
    // Tenancy Agreement SEO Pages - Wales (Q1 2026)
    { path: '/wales-tenancy-agreement-template', priority: 0.8, changeFrequency: 'weekly' as const },
    // Tenancy Agreement SEO Pages - Scotland (Q1 2026)
    { path: '/private-residential-tenancy-agreement-template', priority: 0.85, changeFrequency: 'weekly' as const },
    // Tenancy Agreement SEO Pages - Northern Ireland (Q1 2026)
    { path: '/northern-ireland-tenancy-agreement-template', priority: 0.85, changeFrequency: 'weekly' as const },
    { path: '/notice-to-quit-northern-ireland-guide', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/ni-tenancy-agreement-template-free', priority: 0.8, changeFrequency: 'weekly' as const },
    // Tenancy Agreement SEO Landing Pages - England (Jan 2026)
    { path: '/fixed-term-periodic-tenancy-england', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/joint-tenancy-agreement-england', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/renew-tenancy-agreement-england', priority: 0.8, changeFrequency: 'weekly' as const },
    // Tenancy Agreement SEO Landing Pages - Scotland (Jan 2026)
    // Tenancy Agreement SEO Landing Pages - Wales (Jan 2026)
    // Tenancy Agreement SEO Landing Pages - Northern Ireland (Jan 2026)
    // High-Intent SEO Landing Pages (Jan 2026)
    { path: '/form-6a-section-21', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/eviction-notice-uk', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/no-fault-eviction', priority: 0.85, changeFrequency: 'weekly' as const },
    { path: '/form-3-section-8', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/lodger-agreement-template', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/money-claim-online-mcol', priority: 0.85, changeFrequency: 'weekly' as const },
    { path: '/rolling-tenancy-agreement', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/how-to-rent-guide', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/pre-action-protocol-debt', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/tenant-damaging-property', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/eicr-landlord-requirements', priority: 0.8, changeFrequency: 'weekly' as const },
    // AI Overview Keyword Pages (Jan 2026)
    { path: '/county-court-claim-form-guide', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/6-month-tenancy-agreement-template', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/fixed-term-tenancy-agreement-template', priority: 0.8, changeFrequency: 'weekly' as const },
  ];

  const extraIndexablePages = [
    { path: '/apply-possession-order-landlord', priority: 0.8, changeFrequency: 'weekly' as const },
  ];

  const pillarPages = [
    { path: '/eviction-process-england', priority: 0.85, changeFrequency: 'weekly' as const },
    { path: '/eviction-process-scotland', priority: 0.85, changeFrequency: 'weekly' as const },
    { path: '/eviction-process-wales', priority: 0.85, changeFrequency: 'weekly' as const },
    { path: '/section-21-expired-what-next', priority: 0.85, changeFrequency: 'weekly' as const },
    { path: '/section-8-rent-arrears-eviction', priority: 0.85, changeFrequency: 'weekly' as const },
    { path: '/section-8-vs-section-21', priority: 0.85, changeFrequency: 'weekly' as const },
    { path: '/periodic-tenancy-agreement', priority: 0.85, changeFrequency: 'weekly' as const },
  ];

  // Tool pages - Free tools for SEO traffic
  // Use a Set to prevent duplicate URLs
  const toolPaths = new Set<string>();
  const toolPagesList: { path: string; priority: number; changeFrequency: 'weekly' | 'monthly' }[] = [];

  // Add main tools page
  toolPagesList.push({ path: '/tools', priority: 0.7, changeFrequency: 'monthly' as const });
  toolPaths.add('/tools');

  // Add validators hub page (high priority)
  toolPagesList.push({ path: '/tools/validators', priority: 0.85, changeFrequency: 'weekly' as const });
  toolPaths.add('/tools/validators');

  // Add individual free tools (excluding duplicates)
  freeTools
    .filter((tool) => tool.href.startsWith('/tools') && !toolPaths.has(tool.href))
    .forEach((tool) => {
      toolPagesList.push({
        path: tool.href,
        priority: 0.8,
        changeFrequency: 'weekly' as const,
      });
      toolPaths.add(tool.href);
    });

  // Add validator pages with higher priority (0.9) for SEO ranking
  validatorToolRoutes
    .filter((path) => !toolPaths.has(path))
    .forEach((path) => {
      toolPagesList.push({
        path,
        priority: 0.9,
        changeFrequency: 'weekly' as const,
      });
      toolPaths.add(path);
    });

  const toolPages = toolPagesList;

  // Auth entry points excluded - these pages are noindex
  // /auth/login and /auth/signup are not in sitemap

  // Blog pages with explicit lastModified dates
  const blogPostPages: MetadataRoute.Sitemap = blogPosts.flatMap((post) => {
    const seoConfig = getBlogSeoConfig(post, getPostRegion(post.slug));
    if (!seoConfig.isIndexable) {
      return [];
    }
    return [
      {
        url: `${SITE_ORIGIN}/blog/${post.slug}`,
        lastModified: new Date(post.updatedDate || post.date),
        changeFrequency: 'monthly' as const,
        priority: 0.8,
      },
    ];
  });

  // ==========================================================================
  // Ask Heaven Q&A Pages
  // ==========================================================================
  // Include all canonical approved questions.
  // See /docs/ask-heaven-seo.md for the review workflow.
  //
  // Future scaling: When question count exceeds 1000, consider splitting
  // into a sitemap index with separate files per topic/jurisdiction.
  // ==========================================================================
  let askHeavenPages: MetadataRoute.Sitemap = [];
  try {
    const questionRepository = getQuestionRepository();
    const sitemapQuestions = await questionRepository.getForSitemap();

    askHeavenPages = sitemapQuestions
      .filter((q) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(q.slug))
      .map((q) => ({
        url: `${SITE_ORIGIN}/ask-heaven/${q.slug}`,
        lastModified: new Date(q.updated_at),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      }));
  } catch (error) {
    // Log but don't fail sitemap generation if question repo is unavailable
    console.warn('[Sitemap] Failed to load Ask Heaven questions:', error);
  }

  // Pages that always get stable dates (products, tools, etc.)
  const datedPages = [
    ...productPages,
    ...wizardLandingPages,
    ...tenancyPages,
    ...landingPages,
    ...extraIndexablePages,
    ...pillarPages,
    ...toolPages,
    { path: '/blog', priority: 0.9, changeFrequency: 'weekly' as const },
  ];

  const excludedPrefixes = ['/admin', '/api', '/auth', '/checkout', '/dashboard', '/wizard', '/success'];
  const noindexPaths = ['/tenancy-agreements/england-wales', '/refunds'];

  // Sitemap policy: curated + auto-discovered static routes.
  // Keep intentional static exclusions here for any indexable route we explicitly want omitted.
  const intentionalStaticRouteExclusions = new Set<string>(sitemapAllowlist.intentionallyExcludedRoutes);

  const isIndexablePath = (path: string) =>
    !excludedPrefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`)) &&
    !noindexPaths.includes(path) &&
    !retiredPaths.has(path) &&
    !intentionalStaticRouteExclusions.has(path);

  // Build sitemap entries
  const marketingEntries = marketingPages.map((page) => {
    const entry: {
      url: string;
      changeFrequency: typeof page.changeFrequency;
      priority: number;
      lastModified?: Date;
      images?: string[];
    } = {
      url: `${SITE_ORIGIN}${page.path}`,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    };
    // Only add lastModified for pages that should have it
    if (page.hasDate) {
      entry.lastModified = STABLE_PRODUCT_DATE;
    }
    if (page.path === '/') {
      entry.images = [`${SITE_ORIGIN}/images/mascots/landlord-heaven-owl-tenancy-tools.png`];
    }
    return entry;
  });

  const datedEntries = datedPages.map((page) => ({
    url: `${SITE_ORIGIN}${page.path}`,
    lastModified: STABLE_PRODUCT_DATE,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  let staticPageRoutes: string[] = [];
  try {
    staticPageRoutes = await discoverStaticPageRoutes();
  } catch (error) {
    // Do not fail sitemap generation if route discovery cannot read filesystem
    // in constrained runtime environments (e.g. standalone production builds).
    console.warn('[Sitemap] Failed to auto-discover static routes:', error);
  }
  const coveredPaths = new Set([...marketingPages, ...datedPages].map((page) => page.path));

  const autoDiscoveredStaticEntries: MetadataRoute.Sitemap = staticPageRoutes
    .filter((path) => !coveredPaths.has(path) && isIndexablePath(path))
    .map((path) => ({
      url: `${SITE_ORIGIN}${path}`,
      lastModified: STABLE_PRODUCT_DATE,
      changeFrequency: path === '/' || path.startsWith('/products') || path.startsWith('/tools') ? 'weekly' : 'monthly',
      priority: path === '/' ? 1.0 : path.startsWith('/products') ? 0.9 : path.startsWith('/tools') ? 0.8 : 0.7,
    }));

  const dedupedByPath = new Map<string, MetadataRoute.Sitemap[number]>();

  for (const entry of [
    ...marketingEntries,
    ...datedEntries,
    ...autoDiscoveredStaticEntries,
    ...blogPostPages,
    ...askHeavenPages,
  ]) {
    const pathname = new URL(entry.url).pathname;
    if (!isIndexablePath(pathname) || dedupedByPath.has(pathname)) {
      continue;
    }
    dedupedByPath.set(pathname, entry);
  }

  return [...dedupedByPath.values()];
}
