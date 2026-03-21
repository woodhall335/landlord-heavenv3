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
  | 'tenant-problems'
  | 'eviction-notices'
  | 'court-process'
  | 'rent-arrears'
  | 'possession-enforcement'
  | 'section-21-transition';

export interface ClusterDefinition {
  key: EvictionCluster;
  label: string;
  description: string;
  parent: string;
  tool: string;
  product: string;
  pages: string[];
}

function mapSeoClusterToAuthorityCluster(cluster: SeoCluster): EvictionCluster {
  switch (cluster) {
    case 'rent-arrears':
      return 'rent-arrears';
    case 'section-8':
    case 'section-21-legacy':
      return 'eviction-notices';
    case 'section-21-transition':
      return 'section-21-transition';
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
  'tenant-problems': {
    key: 'tenant-problems',
    label: 'Tenant problems',
    description: 'Scenario pages for non-payment, anti-social behaviour, damage, access disputes, and route choice.',
    parent: SEO_PILLAR_ROUTES.howToEvictTenant,
    tool: '/tools/validators/section-8',
    product: SEO_PRODUCT_ROUTES.completePack,
  },
  'eviction-notices': {
    key: 'eviction-notices',
    label: 'Eviction notices',
    description: 'Notice drafting, validity, service, and route-selection guidance for Section 8 and legacy Section 21 intent.',
    parent: SEO_PILLAR_ROUTES.section8Notice,
    tool: '/tools/validators/section-8',
    product: SEO_PRODUCT_ROUTES.noticeOnly,
  },
  'court-process': {
    key: 'court-process',
    label: 'Court process',
    description: 'Possession claim, hearing, order, timeline, and enforcement workflow pages.',
    parent: SEO_PILLAR_ROUTES.evictionProcessUk,
    tool: '/tools/validators/section-8',
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
    tool: '/tools/validators/section-21',
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
    const pages = getAllSeoPageTaxonomyEntries()
      .filter((entry) => mapSeoClusterToAuthorityCluster(entry.cluster) === config.key)
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

  const clusterKey = mapSeoClusterToAuthorityCluster(entry.cluster);
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
