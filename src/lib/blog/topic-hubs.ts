import { BlogPost } from './types';

export type BlogTopicHubSlug =
  | 'eviction-guides'
  | 'rent-arrears'
  | 'section-21'
  | 'section-8'
  | 'landlord-compliance'
  | 'wales-landlord-guides'
  | 'scotland-landlord-guides'
  | 'northern-ireland-landlord-guides';

export interface BlogTopicHubConfig {
  slug: BlogTopicHubSlug;
  title: string;
  name: string;
  description: string;
  metaDescription: string;
  intro: string;
  pillarLinks: { href: string; label: string }[];
  matcher: (post: BlogPost) => boolean;
}

const includesAny = (text: string, terms: string[]): boolean => terms.some((term) => text.includes(term));

const postText = (post: BlogPost): string =>
  [post.title, post.description, post.targetKeyword, post.category, ...post.tags, ...post.secondaryKeywords]
    .join(' ')
    .toLowerCase();

export const BLOG_TOPIC_HUBS: Record<BlogTopicHubSlug, BlogTopicHubConfig> = {
  'eviction-guides': {
    slug: 'eviction-guides',
    title: 'Eviction Guides Hub for UK Landlords',
    name: 'Eviction Guides',
    description: 'Core eviction process content mapped to notice, court, and possession next steps.',
    metaDescription: 'UK eviction guides hub: Section 21, Section 8, court hearings, timelines, and possession process for landlords.',
    intro:
      'Use this hub to move from general eviction guidance to the exact next step: notice drafting, court pack preparation, or possession claim execution.',
    pillarLinks: [
      { href: '/how-to-evict-a-tenant-uk', label: 'How to evict a tenant in the UK' },
      { href: '/section-21-notice-guide', label: 'Section 21 notice guide' },
      { href: '/section-8-notice-guide', label: 'Section 8 notice guide' },
    ],
    matcher: (post) => includesAny(postText(post), ['evict', 'possession', 'bailiff', 'court', 'section 21', 'section 8']),
  },
  'rent-arrears': {
    slug: 'rent-arrears',
    title: 'Rent Arrears Guides for Landlords',
    name: 'Rent Arrears',
    description: 'Arrears recovery content for notice strategy, debt claim, and possession sequencing.',
    metaDescription: 'Rent arrears landlord hub: Section 8 arrears grounds, money claims, tenant stopped paying rent workflows, and recovery timelines.',
    intro:
      'This cluster focuses on unpaid rent scenarios, from early arrears action and Section 8 route planning to money claim recovery after possession.',
    pillarLinks: [
      { href: '/evict-tenant-not-paying-rent', label: 'Evict tenant not paying rent' },
      { href: '/tenant-stopped-paying-rent', label: 'Tenant stopped paying rent playbook' },
      { href: '/money-claim-unpaid-rent', label: 'Money claim for unpaid rent guide' },
    ],
    matcher: (post) => includesAny(postText(post), ['arrears', 'unpaid rent', 'money claim', 'rent debt', 'tenant stopped paying']),
  },
  'section-21': {
    slug: 'section-21',
    title: 'Section 21 Guides and Process Hub',
    name: 'Section 21',
    description: 'No-fault possession guides covering validity, Form 6A, service, and court follow-on.',
    metaDescription: 'Section 21 landlord hub: Form 6A validity, notice periods, service proof, and accelerated possession guidance.',
    intro:
      'Section 21 content is consolidated here so landlords can validate paperwork, timelines, and follow-on possession steps without missing compliance prerequisites.',
    pillarLinks: [
      { href: '/section-21-notice-guide', label: 'Section 21 notice guide' },
      { href: '/section-21-validity-checklist', label: 'Section 21 validity checklist' },
      { href: '/serve-section-21-notice', label: 'How to serve a Section 21 notice' },
    ],
    matcher: (post) => includesAny(postText(post), ['section 21', 'form 6a', 'accelerated possession', 'no-fault']),
  },
  'section-8': {
    slug: 'section-8',
    title: 'Section 8 Guides and Grounds Hub',
    name: 'Section 8',
    description: 'Grounds-based possession content including arrears, anti-social behaviour, and court preparation.',
    metaDescription: 'Section 8 landlord hub: grounds, Form 3, notice service, arrears possession, and contested hearing preparation.',
    intro:
      'Section 8 is evidence-led. This hub groups grounds strategy, service mechanics, and court prep to help landlords run fewer-risk possession claims.',
    pillarLinks: [
      { href: '/section-8-notice-guide', label: 'Section 8 notice guide' },
      { href: '/section-8-grounds-explained', label: 'Section 8 grounds explained' },
      { href: '/serve-section-8-notice', label: 'How to serve a Section 8 notice' },
    ],
    matcher: (post) => includesAny(postText(post), ['section 8', 'form 3', 'ground 8', 'ground 10', 'ground 11']),
  },
  'landlord-compliance': {
    slug: 'landlord-compliance',
    title: 'Landlord Compliance Guides Hub',
    name: 'Landlord Compliance',
    description: 'Safety, documentation, and legal compliance explainers that support valid possession routes.',
    metaDescription: 'Landlord compliance hub for gas safety, deposits, EPC, EICR, right to rent, and tenancy paperwork prerequisites.',
    intro:
      'Compliance gaps are a major reason eviction routes fail. Use these guides to close prerequisites before issuing notice or filing in court.',
    pillarLinks: [
      { href: '/how-to-evict-a-tenant-uk', label: 'Eviction process overview' },
      { href: '/section-21-notice-guide', label: 'Section 21 compliance dependencies' },
      { href: '/section-8-notice-guide', label: 'Section 8 process requirements' },
    ],
    matcher: (post) => includesAny(postText(post), ['compliance', 'gas safety', 'epc', 'eicr', 'deposit', 'right to rent', 'licensing']),
  },
  'wales-landlord-guides': {
    slug: 'wales-landlord-guides',
    title: 'Wales Landlord Guides Hub',
    name: 'Wales Landlord Guides',
    description: 'Renting Homes (Wales) focused posts for possession, contracts, and compliance.',
    metaDescription: 'Wales landlord guides hub: Renting Homes Act possession process, occupation contracts, and Rent Smart Wales compliance.',
    intro:
      'Browse Wales-specific landlord content built around the Renting Homes Act, Welsh notice routes, and tribunal-aware compliance steps.',
    pillarLinks: [
      { href: '/wales-eviction-notices', label: 'Wales eviction notices guide' },
      { href: '/wales-tenancy-agreement-template', label: 'Wales tenancy agreement template' },
      { href: '/how-to-evict-a-tenant-uk', label: 'UK eviction overview (compare jurisdictions)' },
    ],
    matcher: (post) => post.slug.startsWith('wales-'),
  },
  'scotland-landlord-guides': {
    slug: 'scotland-landlord-guides',
    title: 'Scotland Landlord Guides Hub',
    name: 'Scotland Landlord Guides',
    description: 'Scottish landlord guidance for PRT, Notice to Leave, and tribunal process.',
    metaDescription: 'Scotland landlord guides hub: PRT tenancy rules, Notice to Leave, First-tier Tribunal timelines, and evidence preparation.',
    intro:
      'Find Scotland-specific guidance for PRT tenancies, Notice to Leave drafting, and First-tier Tribunal possession preparation.',
    pillarLinks: [
      { href: '/scotland-eviction-notices', label: 'Scotland eviction notice guide' },
      { href: '/private-residential-tenancy-agreement-template', label: 'PRT agreement template' },
      { href: '/how-to-evict-a-tenant-uk', label: 'UK eviction overview (compare jurisdictions)' },
    ],
    matcher: (post) => post.slug.startsWith('scotland-'),
  },
  'northern-ireland-landlord-guides': {
    slug: 'northern-ireland-landlord-guides',
    title: 'Northern Ireland Landlord Guides Hub',
    name: 'Northern Ireland Landlord Guides',
    description: 'Northern Ireland tenancy and possession guides for compliant landlord workflows.',
    metaDescription: 'Northern Ireland landlord guides hub: private tenancy notices, deposit compliance, and possession process resources.',
    intro:
      'This hub gathers Northern Ireland landlord guidance for notice handling, tenancy compliance, and jurisdiction-specific possession steps.',
    pillarLinks: [
      { href: '/northern-ireland-eviction-notice', label: 'Northern Ireland eviction notice guide' },
      { href: '/northern-ireland-tenancy-agreement-template', label: 'NI tenancy agreement template' },
      { href: '/how-to-evict-a-tenant-uk', label: 'UK eviction overview (compare jurisdictions)' },
    ],
    matcher: (post) => post.slug.startsWith('northern-ireland-'),
  },
};

export function getValidTopicHubs(): BlogTopicHubSlug[] {
  return Object.keys(BLOG_TOPIC_HUBS) as BlogTopicHubSlug[];
}

export function getTopicHubConfig(slug: string): BlogTopicHubConfig | null {
  if (slug in BLOG_TOPIC_HUBS) {
    return BLOG_TOPIC_HUBS[slug as BlogTopicHubSlug];
  }
  return null;
}

export function getPostsForTopicHub(posts: BlogPost[], slug: BlogTopicHubSlug): BlogPost[] {
  const hub = BLOG_TOPIC_HUBS[slug];
  if (!hub) return [];
  return posts.filter(hub.matcher);
}
