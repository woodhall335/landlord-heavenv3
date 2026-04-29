import {
  SEO_PILLAR_ROUTES,
  SEO_PRODUCT_ROUTES,
  getAllSeoPageTaxonomyEntries,
  getSeoPageTaxonomyBySlug,
  type SeoCluster,
} from '@/lib/seo/page-taxonomy';

export const EVICTION_ENTITIES = [
  'Section 21 Notice',
  'Section 8 Notice',
  'Possession Claim',
  'Accelerated Possession',
  'Rent Arrears',
  'Eviction Process',
  'Possession Order',
  'Warrant of Possession',
  'Bailiff Eviction',
] as const;

export type EvictionCluster =
  | 'current-england-framework'
  | 'tenant-problems'
  | 'eviction-notices'
  | 'court-process'
  | 'rent-arrears'
  | 'possession-enforcement'
  | 'section-21-transition';

const CURRENT_ENGLAND_FRAMEWORK_ROUTE_ORDER = [
  '/renters-rights-act-eviction-rules',
  '/section-8-notice',
  '/form-3-section-8',
  '/how-to-evict-a-tenant-england',
  '/eviction-process-england',
] as const;

function isCurrentEnglandFrameworkPath(pathname: string): boolean {
  return CURRENT_ENGLAND_FRAMEWORK_ROUTE_ORDER.includes(
    pathname as (typeof CURRENT_ENGLAND_FRAMEWORK_ROUTE_ORDER)[number]
  );
}

export interface ClusterDefinition {
  key: EvictionCluster;
  label: string;
  description: string;
  parent: string;
  tool: string;
  product: string;
  pages: string[];
}

function mapSeoClusterToAuthorityCluster(
  cluster: SeoCluster,
  pathname?: string
): EvictionCluster {
  if (pathname && isCurrentEnglandFrameworkPath(pathname)) {
    return 'current-england-framework';
  }

  switch (cluster) {
    case 'rent-arrears':
    case 'money-claim':
      return 'rent-arrears';
    case 'section-8':
    case 'section-21-legacy':
      return 'eviction-notices';
    case 'section-21-transition':
      return 'section-21-transition';
    case 'tenancy-england':
      return 'possession-enforcement';
    case 'court-process':
    case 'eviction-process':
      return 'court-process';
    case 'regional-eviction':
    case 'eviction-hub':
      return 'possession-enforcement';
    case 'how-to-evict':
    case 'tenant-problems':
    default:
      return 'tenant-problems';
  }
}

const CLUSTER_CONFIG: Record<
  EvictionCluster,
  Omit<ClusterDefinition, 'pages'>
> = {
  'current-england-framework': {
    key: 'current-england-framework',
    label: 'Current England eviction framework',
    description:
      'Authority bundle for England landlords covering the post-1 May 2026 rules, Section 8 route, Form 3A, landlord action guide, and possession process.',
    parent: SEO_PILLAR_ROUTES.rentersRightsActEvictionRules,
    tool: SEO_PILLAR_ROUTES.section8Notice,
    product: SEO_PRODUCT_ROUTES.noticeOnly,
  },
  'tenant-problems': {
    key: 'tenant-problems',
    label: 'Tenant problems',
    description: 'Scenario pages for non-payment, anti-social behaviour, damage, access disputes, and route choice.',
    parent: SEO_PILLAR_ROUTES.howToEvictTenant,
      tool: '/eviction-notice-template',
    product: SEO_PRODUCT_ROUTES.completePack,
  },
  'eviction-notices': {
    key: 'eviction-notices',
    label: 'Eviction notices',
    description: 'Notice drafting, validity, service, and route-selection guidance for Section 8 and legacy Section 21 intent.',
    parent: SEO_PILLAR_ROUTES.section8Notice,
      tool: '/eviction-notice-template',
    product: SEO_PRODUCT_ROUTES.noticeOnly,
  },
  'court-process': {
    key: 'court-process',
    label: 'Court process',
    description: 'Possession claim, hearing, order, timeline, and enforcement workflow pages.',
    parent: SEO_PILLAR_ROUTES.evictionProcessUk,
      tool: '/eviction-notice-template',
    product: SEO_PRODUCT_ROUTES.completePack,
  },
  'rent-arrears': {
    key: 'rent-arrears',
    label: 'Rent arrears',
    description: 'Arrears-first landlord guides covering Section 8, recovery sequencing, and money claims.',
    parent: SEO_PILLAR_ROUTES.tenantNotPayingRent,
    tool: '/tools/rent-arrears-calculator',
    product: SEO_PRODUCT_ROUTES.moneyClaim,
  },
  'possession-enforcement': {
    key: 'possession-enforcement',
    label: 'Possession and jurisdiction guides',
    description: 'Regional eviction guidance, hub pages, and possession follow-on resources.',
    parent: SEO_PILLAR_ROUTES.evictionGuides,
      tool: '/eviction-notice-template',
    product: SEO_PRODUCT_ROUTES.completePack,
  },
  'section-21-transition': {
    key: 'section-21-transition',
    label: 'Section 21 transition',
    description: 'Post-ban guidance explaining what replaces Section 21 and how landlords pivot to Section 8-led possession.',
    parent: SEO_PILLAR_ROUTES.section21BanUk,
    tool: SEO_PILLAR_ROUTES.section21Notice,
    product: SEO_PRODUCT_ROUTES.completePack,
  },
};

export const EVICTION_CLUSTERS: ClusterDefinition[] = Object.values(CLUSTER_CONFIG).map(
  (config) => {
    const pages =
      config.key === 'current-england-framework'
        ? CURRENT_ENGLAND_FRAMEWORK_ROUTE_ORDER.filter((pathname) => pathname !== config.parent)
        : getAllSeoPageTaxonomyEntries()
            .filter(
              (entry) =>
                mapSeoClusterToAuthorityCluster(entry.cluster, entry.pathname) === config.key
            )
            .map((entry) => entry.pathname)
            .filter((pathname) => pathname !== config.parent);

    return {
      ...config,
      pages,
    };
  }
);

export function getClusterForSlug(slug: string): ClusterDefinition | null {
  const entry = getSeoPageTaxonomyBySlug(slug);
  if (!entry) {
    return null;
  }

  const clusterKey = mapSeoClusterToAuthorityCluster(entry.cluster, entry.pathname);
  return EVICTION_CLUSTERS.find((cluster) => cluster.key === clusterKey) ?? null;
}

export function getAuthorityLinks(slug: string) {
  const entry = getSeoPageTaxonomyBySlug(slug);
  const cluster = getClusterForSlug(slug);
  if (!entry || !cluster) {
    return null;
  }

  const supporting = [entry.supportingPage, ...cluster.pages]
    .filter((page, index, pages) => page !== entry.pathname && pages.indexOf(page) === index)
    .slice(0, 2);

  return {
    parent: cluster.parent,
    supporting,
    tool: cluster.tool,
    product: entry.primaryProduct,
    clusterLabel: cluster.label,
  };
}

const AUTHORITY_LINK_LABELS: Record<string, string> = {
  '/eviction-notice-template': 'Eviction notice guide',
  '/products/notice-only': 'Notice Only',
  '/products/complete-pack': 'Complete Eviction Pack',
  '/products/money-claim': 'Money Claim Pack',
  '/products/ast': 'England tenancy agreements',
  '/tools/rent-arrears-calculator': 'Rent arrears calculator',
  '/renters-rights-act-eviction-rules': "Renters' Rights Act eviction rules",
  '/section-8-notice': 'Section 8 notice guide',
  '/section-21-notice': 'Section 21 transition guide',
  '/eviction-process-england': 'England eviction process guide',
  '/eviction-court-forms-england': 'Eviction court forms guide',
};

export function formatAuthorityLinkLabel(pathname: string): string {
  if (AUTHORITY_LINK_LABELS[pathname]) {
    return AUTHORITY_LINK_LABELS[pathname];
  }

  const lastSegment = pathname.replace(/^\/+/, '').split('/').filter(Boolean).pop();
  if (!lastSegment) {
    return pathname;
  }

  return lastSegment
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
