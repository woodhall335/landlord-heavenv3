import { getPostRegion } from '@/lib/blog/categories';
import { blogPosts } from '@/lib/blog/posts';
import { getBlogSeoConfig } from '@/lib/blog/seo';
import {
  getExplicitTaxonomyExemptions,
  getSeoPageTaxonomy,
} from '@/lib/seo/page-taxonomy';
import { OWNER_PAGE_CONTRACTS } from '@/lib/seo/owner-page-contracts';
import { discoverStaticPageRoutes } from '@/lib/seo/static-route-inventory.shared.mjs';

export const SITEWIDE_SWEEP_STATIC_PREFIX_EXCLUSIONS = [
  '/api',
  '/ask-heaven',
  '/auth',
  '/checkout',
  '/dashboard',
  '/success',
  '/tools',
  '/wizard',
] as const;

export const SITEWIDE_SWEEP_STATIC_ROUTE_EXCLUSIONS = new Set([
  '/',
  '/about',
  '/blog',
  '/contact',
  '/cookies',
  '/help',
  '/pricing',
  '/privacy',
  '/refunds',
  '/terms',
]);

export const SUPPLEMENTAL_SWEEP_CLASSIFIED_ROUTES = [
  '/ast-agreement-template',
  '/products/section-13-standard',
  '/products/section-13-defence',
  '/renters-rights-act-information-sheet-2026',
  '/tenancy-agreement-england-2026',
  '/tenancy-agreement-template-uk',
] as const;

const EXPLICIT_TAXONOMY_EXEMPTION_SET = new Set<string>(getExplicitTaxonomyExemptions());
const OWNER_PAGE_CONTRACT_SET = new Set<string>(
  OWNER_PAGE_CONTRACTS.map((contract) => contract.pathname)
);
const SUPPLEMENTAL_SWEEP_ROUTE_SET = new Set<string>(SUPPLEMENTAL_SWEEP_CLASSIFIED_ROUTES);

export function isSweepableStaticSeoRoute(pathname: string): boolean {
  if (SITEWIDE_SWEEP_STATIC_ROUTE_EXCLUSIONS.has(pathname)) {
    return false;
  }

  return !SITEWIDE_SWEEP_STATIC_PREFIX_EXCLUSIONS.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export async function discoverSweepableStaticSeoRoutes(): Promise<string[]> {
  const routes = await discoverStaticPageRoutes();
  return routes.filter(isSweepableStaticSeoRoute).sort();
}

export async function getUnclassifiedSweepableStaticSeoRoutes(): Promise<string[]> {
  const routes = await discoverSweepableStaticSeoRoutes();
  return routes
    .filter((pathname) => !EXPLICIT_TAXONOMY_EXEMPTION_SET.has(pathname))
    .filter((pathname) => !OWNER_PAGE_CONTRACT_SET.has(pathname))
    .filter((pathname) => !SUPPLEMENTAL_SWEEP_ROUTE_SET.has(pathname))
    .filter((pathname) => !getSeoPageTaxonomy(pathname))
    .sort();
}

export interface SweepableBlogSeoEntry {
  slug: string;
  canonicalPath: string;
  primaryCommercialHref: string;
  pillarHref: string;
  supportingHrefs: string[];
  isIndexable: boolean;
  region: ReturnType<typeof getPostRegion>;
}

export function getSweepableBlogSeoEntries(): SweepableBlogSeoEntry[] {
  return blogPosts.map((post) => {
    const region = getPostRegion(post.slug);
    const seoConfig = getBlogSeoConfig(post, region);

    return {
      slug: post.slug,
      canonicalPath: seoConfig.canonicalPath,
      primaryCommercialHref: seoConfig.primaryCommercialLink.href,
      pillarHref: seoConfig.pillarLink.href,
      supportingHrefs: seoConfig.supportingLinks.map((link) => link.href),
      isIndexable: seoConfig.isIndexable,
      region,
    };
  });
}
