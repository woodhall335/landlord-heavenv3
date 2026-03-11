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
  | 'possession-enforcement';

export interface ClusterDefinition {
  key: EvictionCluster;
  label: string;
  description: string;
  parent: string;
  tool: string;
  product: string;
  pages: string[];
}

export const EVICTION_CLUSTERS: ClusterDefinition[] = [
  {
    key: 'tenant-problems',
    label: 'Tenant problems',
    description: 'Landlord scenario pages covering behaviour, access, abandonment, and non-payment issues.',
    parent: '/evict-tenant-not-paying-rent',
    tool: '/tools/validators/section-8',
    product: '/products/notice-only',
    pages: [
      '/tenant-stopped-paying-rent',
      '/tenant-abandoned-property',
      '/tenant-refusing-access',
      '/tenant-refusing-inspection',
      '/tenant-breach-of-tenancy',
      '/tenant-subletting-without-permission',
      '/tenant-anti-social-behaviour',
      '/tenant-left-without-paying-rent',
      '/tenant-refuses-to-leave-after-notice',
      '/evict-tenant-for-damage',
      '/evict-tenant-anti-social-behaviour',
    ],
  },
  {
    key: 'eviction-notices',
    label: 'Eviction notices',
    description: 'Notice drafting, validity, and route-selection guidance across Section 21 and Section 8.',
    parent: '/eviction-notice-england',
    tool: '/tools/validators/section-21',
    product: '/products/notice-only',
    pages: [
      '/section-21-notice-generator',
      '/section-8-notice-generator',
      '/section-21-vs-section-8',
      '/section-21-checklist',
      '/section-21-notice-period',
      '/section-21-validity-checklist',
      '/serve-section-21-notice',
      '/serve-section-8-notice',
      '/notice-to-quit-guide',
    ],
  },
  {
    key: 'court-process',
    label: 'Court process',
    description: 'Possession claim, court forms, and hearing progression pages.',
    parent: '/eviction-court-forms-england',
    tool: '/tools/validators/section-8',
    product: '/products/complete-pack',
    pages: [
      '/n5b-possession-claim-form',
      '/n5-n119-possession-claim',
      '/n5b-possession-claim-guide',
      '/eviction-court-hearing-guide',
      '/possession-order-process',
      '/possession-order-timeline',
      '/court-possession-order-guide',
      '/section-21-court-pack',
      '/section-8-court-pack',
      '/complete-eviction-pack-england',
    ],
  },
  {
    key: 'rent-arrears',
    label: 'Rent arrears',
    description: 'Arrears-first eviction strategy and debt recovery pages.',
    parent: '/rent-arrears-eviction-guide',
    tool: '/tools/rent-arrears-calculator',
    product: '/products/money-claim',
    pages: [
      '/section-8-rent-arrears-eviction',
      '/evict-tenant-not-paying-rent',
      '/rent-arrears-eviction-guide',
      '/recover-rent-arrears-after-eviction',
    ],
  },
  {
    key: 'possession-enforcement',
    label: 'Possession enforcement',
    description: 'Timeline, accelerated possession, warrant, and bailiff execution pages.',
    parent: '/eviction-timeline-england',
    tool: '/tools/validators/section-21',
    product: '/products/complete-pack',
    pages: [
      '/how-to-evict-a-tenant-england',
      '/how-long-does-eviction-take',
      '/eviction-timeline-england',
      '/eviction-timeline-uk',
      '/accelerated-possession-guide',
      '/warrant-of-possession-guide',
      '/bailiff-eviction-process',
      '/court-bailiff-eviction-guide',
      '/section-8-eviction-process',
      '/section-8-grounds-explained',
      '/landlord-eviction-checklist',
    ],
  },
];

export function getClusterForSlug(slug: string): ClusterDefinition | null {
  const route = `/${slug}`;
  return EVICTION_CLUSTERS.find((cluster) => cluster.pages.includes(route) || cluster.parent === route) ?? null;
}

export function getAuthorityLinks(slug: string) {
  const cluster = getClusterForSlug(slug);
  if (!cluster) {
    return null;
  }

  const route = `/${slug}`;
  const siblings = cluster.pages.filter((page) => page !== route).slice(0, 2);

  return {
    parent: cluster.parent,
    supporting: siblings,
    tool: cluster.tool,
    product: cluster.product,
    clusterLabel: cluster.label,
  };
}
