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
    title: 'Eviction Guides Hub | Section 21, Section 8 & Possession',
    name: 'Eviction Guides',
    description: 'Core eviction process content mapped to notice, court, and possession next steps.',
    metaDescription:
      'Explore eviction guides for UK landlords covering Section 21, Section 8, court hearings, possession timelines, and enforcement next steps.',
    intro:
      'Start with the upgraded core guides first, then move into notice drafting, court pack preparation, or possession claim execution using the linked pillar routes.',
    pillarLinks: [
      { href: '/how-to-evict-tenant', label: 'How to evict a tenant in the UK' },
      { href: '/section-21-ban-uk', label: 'Section 21 ban guide for landlords' },
      { href: '/section-8-notice', label: 'Section 8 notice guide' },
    ],
    matcher: (post) => includesAny(postText(post), ['evict', 'possession', 'bailiff', 'court', 'section 21', 'section 8']),
  },
  'rent-arrears': {
    slug: 'rent-arrears',
    title: 'Rent Arrears Guides | Section 8, Claims & Recovery',
    name: 'Rent Arrears',
    description: 'Arrears recovery content for notice strategy, debt claim, and possession sequencing.',
    metaDescription:
      'Explore rent arrears guides for landlords covering Section 8 grounds, money claims, recovery strategy, evidence, and post-judgment enforcement.',
    intro:
      'This cluster prioritises upgraded arrears posts first so landlords can move from missed rent triage to Section 8 and money-claim recovery in the right sequence.',
    pillarLinks: [
      { href: '/tenant-not-paying-rent', label: 'Tenant not paying rent in the UK' },
      { href: '/section-8-notice', label: 'Section 8 notice for rent arrears' },
      { href: '/money-claim-unpaid-rent', label: 'Money claim for unpaid rent guide' },
    ],
    matcher: (post) => includesAny(postText(post), ['arrears', 'unpaid rent', 'money claim', 'rent debt', 'tenant stopped paying']),
  },
  'section-21': {
    slug: 'section-21',
    title: 'Section 21 Guides | Notice, Validity & Possession',
    name: 'Section 21',
    description: 'No-fault possession guides covering validity, Form 6A, service, and court follow-on.',
    metaDescription:
      'Explore Section 21 guides for landlords covering Form 6A validity, notice periods, service proof, accelerated possession, and common mistakes.',
    intro:
      'Section 21 transition content is consolidated here so landlords can understand what changed on 1 May 2026 in England, what replaces Section 21, and which route matters now.',
    pillarLinks: [
      { href: '/section-21-ban-uk', label: 'Section 21 ban UK guide' },
      { href: '/section-21-notice', label: 'Section 21 notice transition guide' },
      { href: '/section-21-validity-checklist', label: 'Section 21 validity checklist' },
    ],
    matcher: (post) => includesAny(postText(post), ['section 21', 'form 6a', 'accelerated possession', 'no-fault']),
  },
  'section-8': {
    slug: 'section-8',
    title: 'Section 8 Guides | Grounds, Form 3 & Arrears',
    name: 'Section 8',
    description: 'Grounds-based possession content including arrears, anti-social behaviour, and court preparation.',
    metaDescription:
      'Explore Section 8 guides for landlords covering Form 3, rent arrears grounds, service, evidence, hearings, and possession strategy.',
    intro:
      'Section 8 is evidence-led. This hub now surfaces upgraded grounds and process guides first, then routes landlords into service, court prep, and arrears recovery.',
    pillarLinks: [
      { href: '/section-8-notice', label: 'Section 8 notice guide' },
      { href: '/section-8-grounds-explained', label: 'Section 8 grounds explained' },
      { href: '/serve-section-8-notice', label: 'How to serve a Section 8 notice' },
    ],
    matcher: (post) => includesAny(postText(post), ['section 8', 'form 3', 'ground 8', 'ground 10', 'ground 11']),
  },
  'landlord-compliance': {
    slug: 'landlord-compliance',
    title: 'Landlord Compliance Guides | Deposits, EPC & Safety',
    name: 'Landlord Compliance',
    description: 'Safety, documentation, and legal compliance explainers that support valid possession routes.',
    metaDescription:
      'Explore landlord compliance guides covering gas safety, deposits, EPC, EICR, right to rent checks, and tenancy paperwork requirements.',
    intro:
      'Compliance gaps are a major reason eviction routes fail. Use these guides to close prerequisites before issuing notice or filing in court.',
    pillarLinks: [
      { href: '/how-to-evict-tenant', label: 'Eviction process overview' },
      { href: '/section-21-ban-uk', label: 'Section 21 transition and compliance dependencies' },
      { href: '/section-8-notice', label: 'Section 8 process requirements' },
    ],
    matcher: (post) => includesAny(postText(post), ['compliance', 'gas safety', 'epc', 'eicr', 'deposit', 'right to rent', 'licensing']),
  },
  'wales-landlord-guides': {
    slug: 'wales-landlord-guides',
    title: 'Wales Landlord Guides | Possession & Occupation Contracts',
    name: 'Wales Landlord Guides',
    description: 'Renting Homes (Wales) focused posts for possession, contracts, and compliance.',
    metaDescription:
      'Explore Wales landlord guides covering occupation contracts, the Renting Homes Act, possession process, and Rent Smart Wales compliance.',
    intro:
      'Browse Wales-specific landlord content built around the Renting Homes Act, Welsh notice routes, and tribunal-aware compliance steps.',
    pillarLinks: [
      { href: '/wales-eviction-notices', label: 'Wales eviction notices guide' },
      { href: '/wales-tenancy-agreement-template', label: 'Wales tenancy agreement template' },
      { href: '/how-to-evict-tenant', label: 'UK eviction overview (compare jurisdictions)' },
    ],
    matcher: (post) => post.slug.startsWith('wales-'),
  },
  'scotland-landlord-guides': {
    slug: 'scotland-landlord-guides',
    title: 'Scotland Landlord Guides | PRT, Notice to Leave & Tribunal',
    name: 'Scotland Landlord Guides',
    description: 'Scottish landlord guidance for PRT, Notice to Leave, and tribunal process.',
    metaDescription:
      'Explore Scotland landlord guides covering PRT rules, Notice to Leave, tribunal timelines, evidence, and landlord compliance steps.',
    intro:
      'Find Scotland-specific guidance for PRT tenancies, Notice to Leave drafting, and First-tier Tribunal possession preparation.',
    pillarLinks: [
      { href: '/scotland-eviction-notices', label: 'Scotland eviction notice guide' },
      { href: '/private-residential-tenancy-agreement-template', label: 'PRT agreement template' },
      { href: '/how-to-evict-tenant', label: 'UK eviction overview (compare jurisdictions)' },
    ],
    matcher: (post) => post.slug.startsWith('scotland-'),
  },
  'northern-ireland-landlord-guides': {
    slug: 'northern-ireland-landlord-guides',
    title: 'Northern Ireland Landlord Guides | Tenancy & Possession',
    name: 'Northern Ireland Landlord Guides',
    description: 'Northern Ireland tenancy and possession guides for compliant landlord workflows.',
    metaDescription:
      'Explore Northern Ireland landlord guides covering private tenancy notices, deposit compliance, possession procedure, and landlord obligations.',
    intro:
      'This hub gathers Northern Ireland landlord guidance for notice handling, tenancy compliance, and jurisdiction-specific possession steps.',
    pillarLinks: [
      { href: '/northern-ireland-eviction-notice', label: 'Northern Ireland eviction notice guide' },
      { href: '/northern-ireland-tenancy-agreement-template', label: 'NI tenancy agreement template' },
      { href: '/how-to-evict-tenant', label: 'UK eviction overview (compare jurisdictions)' },
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
