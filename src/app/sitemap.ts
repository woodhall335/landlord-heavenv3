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

export default function sitemap(): MetadataRoute.Sitemap {
  // Use a stable date for pages that don't change frequently
  // Update this quarterly when making significant site-wide changes
  const STABLE_PRODUCT_DATE = new Date('2026-01-01');

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
    // HMO Pro removed - parked for later review
    // { path: '/hmo-pro', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/ask-heaven', priority: 0.8, changeFrequency: 'weekly' as const },
  ];

  // Tenancy agreement pages - individual jurisdiction pages
  const tenancyPages = [
    { path: '/tenancy-agreements/england', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/tenancy-agreements/wales', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/tenancy-agreements/scotland', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/tenancy-agreements/northern-ireland', priority: 0.8, changeFrequency: 'weekly' as const },
    // england-wales is a selector hub page (noindex) - not included in sitemap
  ];

  // Long-tail landing pages - SEO targeted
  const landingPages = [
    { path: '/section-21-notice-template', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/eviction-notice-template', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/section-8-notice-template', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/rent-arrears-letter-template', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/tenancy-agreement-template', priority: 0.8, changeFrequency: 'weekly' as const },
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
    { path: '/money-claim-unpaid-rent', priority: 0.8, changeFrequency: 'weekly' as const },
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
    { path: '/money-claim-rent-arrears', priority: 0.85, changeFrequency: 'weekly' as const },
    { path: '/how-to-sue-tenant-for-unpaid-rent', priority: 0.85, changeFrequency: 'weekly' as const },
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
    { path: '/ast-template-england', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/tenancy-agreement-template-free', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/joint-tenancy-agreement-template', priority: 0.8, changeFrequency: 'weekly' as const },
    // Tenancy Agreement SEO Pages - Wales (Q1 2026)
    { path: '/occupation-contract-template-wales', priority: 0.85, changeFrequency: 'weekly' as const },
    { path: '/renting-homes-wales-written-statement', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/standard-occupation-contract-wales', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/wales-tenancy-agreement-template', priority: 0.8, changeFrequency: 'weekly' as const },
    // Tenancy Agreement SEO Pages - Scotland (Q1 2026)
    { path: '/private-residential-tenancy-agreement-template', priority: 0.85, changeFrequency: 'weekly' as const },
    { path: '/prt-template-scotland', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/scottish-tenancy-agreement-template', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/scotland-prt-model-agreement-guide', priority: 0.8, changeFrequency: 'weekly' as const },
    // Tenancy Agreement SEO Pages - Northern Ireland (Q1 2026)
    { path: '/northern-ireland-tenancy-agreement-template', priority: 0.85, changeFrequency: 'weekly' as const },
    { path: '/ni-private-tenancy-agreement', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/notice-to-quit-northern-ireland-guide', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/ni-tenancy-agreement-template-free', priority: 0.8, changeFrequency: 'weekly' as const },
    // Tenancy Agreement SEO Landing Pages - England (Jan 2026)
    { path: '/assured-shorthold-tenancy-agreement', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/ast-tenancy-agreement-template', priority: 0.85, changeFrequency: 'weekly' as const },
    { path: '/fixed-term-periodic-tenancy-england', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/joint-tenancy-agreement-england', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/renew-tenancy-agreement-england', priority: 0.8, changeFrequency: 'weekly' as const },
    // Tenancy Agreement SEO Landing Pages - Scotland (Jan 2026)
    { path: '/private-residential-tenancy-agreement-scotland', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/prt-tenancy-agreement-template-scotland', priority: 0.85, changeFrequency: 'weekly' as const },
    { path: '/joint-prt-tenancy-agreement-scotland', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/update-prt-tenancy-agreement-scotland', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/common-prt-tenancy-mistakes-scotland', priority: 0.8, changeFrequency: 'weekly' as const },
    // Tenancy Agreement SEO Landing Pages - Wales (Jan 2026)
    { path: '/standard-occupation-contract-wales', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/occupation-contract-template-wales', priority: 0.85, changeFrequency: 'weekly' as const },
    { path: '/fixed-term-periodic-occupation-contract-wales', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/joint-occupation-contract-wales', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/update-occupation-contract-wales', priority: 0.8, changeFrequency: 'weekly' as const },
    // Tenancy Agreement SEO Landing Pages - Northern Ireland (Jan 2026)
    { path: '/tenancy-agreement-northern-ireland', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/tenancy-agreement-template-northern-ireland', priority: 0.85, changeFrequency: 'weekly' as const },
    { path: '/fixed-term-tenancy-agreement-northern-ireland', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/joint-tenancy-agreement-northern-ireland', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/update-tenancy-agreement-northern-ireland', priority: 0.8, changeFrequency: 'weekly' as const },
    // High-Intent SEO Landing Pages (Jan 2026)
    { path: '/form-6a-section-21', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/eviction-notice-uk', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/no-fault-eviction', priority: 0.85, changeFrequency: 'weekly' as const },
    { path: '/form-3-section-8', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/lodger-agreement-template', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/mcol-money-claim-online', priority: 0.85, changeFrequency: 'weekly' as const },
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

  // Blog category pages for improved crawl paths
  const blogCategoryPages = [
    { path: '/blog/england', priority: 0.85, changeFrequency: 'weekly' as const },
    { path: '/blog/scotland', priority: 0.85, changeFrequency: 'weekly' as const },
    { path: '/blog/wales', priority: 0.85, changeFrequency: 'weekly' as const },
    { path: '/blog/northern-ireland', priority: 0.85, changeFrequency: 'weekly' as const },
    { path: '/blog/uk', priority: 0.85, changeFrequency: 'weekly' as const },
  ];

  // Blog pages with explicit lastModified dates
  const blogPostPages = blogPosts.map((post) => ({
    url: `${SITE_ORIGIN}/blog/${post.slug}`,
    lastModified: new Date(post.updatedDate || post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  // Pages that always get stable dates (products, tools, etc.)
  const datedPages = [
    ...productPages,
    ...tenancyPages,
    ...landingPages,
    ...toolPages,
    { path: '/blog', priority: 0.9, changeFrequency: 'weekly' as const },
    ...blogCategoryPages,
  ];

  // Build sitemap entries
  const marketingEntries = marketingPages.map((page) => {
    const entry: {
      url: string;
      changeFrequency: typeof page.changeFrequency;
      priority: number;
      lastModified?: Date;
    } = {
      url: `${SITE_ORIGIN}${page.path}`,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    };
    // Only add lastModified for pages that should have it
    if (page.hasDate) {
      entry.lastModified = STABLE_PRODUCT_DATE;
    }
    return entry;
  });

  const datedEntries = datedPages.map((page) => ({
    url: `${SITE_ORIGIN}${page.path}`,
    lastModified: STABLE_PRODUCT_DATE,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  return [
    ...marketingEntries,
    ...datedEntries,
    ...blogPostPages,
  ];
}
