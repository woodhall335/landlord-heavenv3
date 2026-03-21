export type SeoJurisdiction =
  | 'england'
  | 'wales'
  | 'scotland'
  | 'northern-ireland'
  | 'uk';

export type SeoPageType =
  | 'problem'
  | 'court'
  | 'money'
  | 'general'
  | 'tenancy'
  | 'guide'
  | 'notice';

export type SeoPageRole =
  | 'pillar'
  | 'bridge'
  | 'supporting'
  | 'hub'
  | 'product-adjacent';

export type SeoCluster =
  | 'rent-arrears'
  | 'how-to-evict'
  | 'eviction-process'
  | 'section-8'
  | 'section-21-transition'
  | 'section-21-legacy'
  | 'court-process'
  | 'tenant-problems'
  | 'regional-eviction'
  | 'eviction-hub';

export type SeoScenario =
  | 'default'
  | 'arrears'
  | 'notice'
  | 'court'
  | 'tenancy'
  | 'transition';

export type SeoProductRoute =
  | '/products/notice-only'
  | '/products/complete-pack'
  | '/products/money-claim'
  | '/products/ast';

export type ConsolidationStatus =
  | 'canonical'
  | 'candidate_redirect'
  | 'supporting_live'
  | 'bridge_live';

export interface FreshnessPolicy {
  reviewedDate: string;
  jurisdictionScope: string;
  legalContextNote: string;
}

export interface AnchorVariants {
  pillar: string[];
  supporting: string[];
  product: string[];
}

export interface SeoPageTaxonomyEntry {
  pathname: string;
  pageType: SeoPageType;
  pageRole: SeoPageRole;
  jurisdiction: SeoJurisdiction;
  cluster: SeoCluster;
  primaryPillar: string;
  supportingPage: string;
  primaryProduct: SeoProductRoute;
  secondaryProduct?: SeoProductRoute;
  primaryProductByScenario: Partial<Record<SeoScenario, SeoProductRoute>>;
  canonicalTarget?: string;
  anchorVariants: AnchorVariants;
  section21TransitionEligible: boolean;
  freshnessRequired: boolean;
  consolidationStatus: ConsolidationStatus;
}

export const SEO_PRODUCT_ROUTES = {
  noticeOnly: '/products/notice-only',
  completePack: '/products/complete-pack',
  moneyClaim: '/products/money-claim',
  ast: '/products/ast',
} as const satisfies Record<string, SeoProductRoute>;

export const SEO_PILLAR_ROUTES = {
  tenantNotPayingRent: '/tenant-not-paying-rent',
  howToEvictTenant: '/how-to-evict-tenant',
  evictionProcessUk: '/eviction-process-uk',
  section8Notice: '/section-8-notice',
  section21Notice: '/section-21-notice',
  section21BanUk: '/section-21-ban-uk',
  evictionGuides: '/eviction-guides',
} as const;

const REVIEWED_DATE = '21 March 2026';

const defaultFreshnessPolicyByJurisdiction: Record<SeoJurisdiction, Omit<FreshnessPolicy, 'legalContextNote'>> = {
  england: { reviewedDate: REVIEWED_DATE, jurisdictionScope: 'England only' },
  wales: { reviewedDate: REVIEWED_DATE, jurisdictionScope: 'Wales only' },
  scotland: { reviewedDate: REVIEWED_DATE, jurisdictionScope: 'Scotland only' },
  'northern-ireland': { reviewedDate: REVIEWED_DATE, jurisdictionScope: 'Northern Ireland only' },
  uk: { reviewedDate: REVIEWED_DATE, jurisdictionScope: 'UK-wide comparison guide' },
};

const anchorSets = {
  rentArrearsPillar: [
    'tenant not paying rent in the UK',
    'rent arrears landlord guide',
    'what landlords should do when rent is unpaid',
  ],
  howToEvictPillar: [
    'how to evict a tenant legally',
    'UK landlord eviction guide',
    'steps for evicting a tenant',
  ],
  evictionProcessPillar: [
    'eviction process in the UK',
    'UK eviction process guide',
    'step-by-step eviction process',
  ],
  section8Pillar: [
    'Section 8 notice guide',
    'Section 8 notice for rent arrears',
    'grounds-based possession notice',
  ],
  section21TransitionPillar: [
    'Section 21 ending in 2026',
    'what replaces Section 21',
    'Section 21 ban guide for landlords',
  ],
  noticeOnlyProduct: [
    'court-ready eviction notice',
    'Notice Only eviction workflow',
    'notice drafting workflow for landlords',
  ],
  section8NoticeProduct: [
    'court-ready Section 8 notice',
    'Notice Only workflow for Section 8',
    'eviction notice for breach-based possession',
  ],
  completePackProduct: [
    'complete eviction pack for England',
    'court-ready possession support',
    'end-to-end eviction pack',
  ],
  moneyClaimProduct: [
    'money claim pack for unpaid rent',
    'recover unpaid rent through the county court',
    'rent arrears recovery pack',
  ],
} as const;

function makeEntry(
  pathname: string,
  config: Omit<SeoPageTaxonomyEntry, 'pathname' | 'primaryProductByScenario'> & {
    primaryProductByScenario?: Partial<Record<SeoScenario, SeoProductRoute>>;
  }
): SeoPageTaxonomyEntry {
  return {
    pathname,
    ...config,
    primaryProductByScenario: {
      default: config.primaryProduct,
      ...config.primaryProductByScenario,
    },
  };
}

function rentArrearsEntry(
  pathname: string,
  supportingPage: string,
  config: Partial<Omit<SeoPageTaxonomyEntry, 'pathname' | 'cluster' | 'primaryPillar' | 'supportingPage' | 'primaryProduct' | 'anchorVariants' | 'pageType' | 'pageRole' | 'jurisdiction' | 'section21TransitionEligible' | 'freshnessRequired' | 'consolidationStatus'>> &
    Pick<SeoPageTaxonomyEntry, 'canonicalTarget'>
): SeoPageTaxonomyEntry {
  return makeEntry(pathname, {
    pageType: 'money',
    pageRole: 'supporting',
    jurisdiction: 'england',
    cluster: 'rent-arrears',
    primaryPillar: SEO_PILLAR_ROUTES.tenantNotPayingRent,
    supportingPage,
    primaryProduct: SEO_PRODUCT_ROUTES.moneyClaim,
    secondaryProduct: SEO_PRODUCT_ROUTES.completePack,
    primaryProductByScenario: {
      notice: SEO_PRODUCT_ROUTES.noticeOnly,
      ...config.primaryProductByScenario,
    },
    canonicalTarget: config.canonicalTarget,
    anchorVariants: {
      pillar: [...anchorSets.rentArrearsPillar],
      supporting: [
        'money claim for unpaid rent',
        'county court rent recovery guide',
        'recover unpaid rent through MCOL',
      ],
      product: [...anchorSets.moneyClaimProduct],
    },
    section21TransitionEligible: true,
    freshnessRequired: false,
    consolidationStatus: 'supporting_live',
    ...config,
  });
}

function processEntry(
  pathname: string,
  supportingPage: string,
  config: Partial<Omit<SeoPageTaxonomyEntry, 'pathname' | 'cluster' | 'primaryPillar' | 'supportingPage' | 'primaryProduct' | 'anchorVariants' | 'pageType' | 'pageRole' | 'jurisdiction' | 'section21TransitionEligible' | 'freshnessRequired' | 'consolidationStatus'>> &
    Pick<SeoPageTaxonomyEntry, 'canonicalTarget'>
): SeoPageTaxonomyEntry {
  return makeEntry(pathname, {
    pageType: 'court',
    pageRole: 'supporting',
    jurisdiction: 'england',
    cluster: 'eviction-process',
    primaryPillar: SEO_PILLAR_ROUTES.evictionProcessUk,
    supportingPage,
    primaryProduct: SEO_PRODUCT_ROUTES.completePack,
    secondaryProduct: SEO_PRODUCT_ROUTES.noticeOnly,
    canonicalTarget: config.canonicalTarget,
    anchorVariants: {
      pillar: [...anchorSets.evictionProcessPillar],
      supporting: [
        'how to evict a tenant legally',
        'UK landlord eviction guide',
        'landlord eviction steps',
      ],
      product: [...anchorSets.completePackProduct],
    },
    section21TransitionEligible: false,
    freshnessRequired: false,
    consolidationStatus: 'supporting_live',
    ...config,
  });
}

function section8Entry(
  pathname: string,
  supportingPage: string,
  config: Partial<Omit<SeoPageTaxonomyEntry, 'pathname' | 'cluster' | 'primaryPillar' | 'supportingPage' | 'primaryProduct' | 'anchorVariants' | 'pageType' | 'pageRole' | 'jurisdiction' | 'section21TransitionEligible' | 'freshnessRequired' | 'consolidationStatus'>> &
    Pick<SeoPageTaxonomyEntry, 'canonicalTarget'>
): SeoPageTaxonomyEntry {
  return makeEntry(pathname, {
    pageType: 'notice',
    pageRole: 'supporting',
    jurisdiction: 'england',
    cluster: 'section-8',
    primaryPillar: SEO_PILLAR_ROUTES.section8Notice,
    supportingPage,
    primaryProduct: SEO_PRODUCT_ROUTES.noticeOnly,
    secondaryProduct: SEO_PRODUCT_ROUTES.completePack,
    primaryProductByScenario: {
      court: SEO_PRODUCT_ROUTES.completePack,
      ...config.primaryProductByScenario,
    },
    canonicalTarget: config.canonicalTarget,
    anchorVariants: {
      pillar: [...anchorSets.section8Pillar],
      supporting: [
        'Section 8 grounds explained',
        'grounds for possession under Section 8',
        'mandatory and discretionary grounds',
      ],
      product: [...anchorSets.section8NoticeProduct],
    },
    section21TransitionEligible: true,
    freshnessRequired: false,
    consolidationStatus: 'supporting_live',
    ...config,
  });
}

function section21Entry(
  pathname: string,
  supportingPage: string,
  config: Partial<Omit<SeoPageTaxonomyEntry, 'pathname' | 'cluster' | 'primaryPillar' | 'supportingPage' | 'primaryProduct' | 'anchorVariants' | 'pageType' | 'pageRole' | 'jurisdiction' | 'section21TransitionEligible' | 'freshnessRequired' | 'consolidationStatus'>> &
    Pick<SeoPageTaxonomyEntry, 'canonicalTarget'>
): SeoPageTaxonomyEntry {
  return makeEntry(pathname, {
    pageType: 'guide',
    pageRole: 'supporting',
    jurisdiction: 'england',
    cluster: 'section-21-transition',
    primaryPillar: SEO_PILLAR_ROUTES.section21BanUk,
    supportingPage,
    primaryProduct: SEO_PRODUCT_ROUTES.completePack,
    secondaryProduct: SEO_PRODUCT_ROUTES.noticeOnly,
    primaryProductByScenario: {
      notice: SEO_PRODUCT_ROUTES.noticeOnly,
      transition: SEO_PRODUCT_ROUTES.completePack,
      ...config.primaryProductByScenario,
    },
    canonicalTarget: config.canonicalTarget,
    anchorVariants: {
      pillar: [...anchorSets.section21TransitionPillar],
      supporting: [
        'Section 21 notice transition guide',
        'legacy Section 21 notice route',
        'Section 21 notice guidance',
      ],
      product: [
        'complete pack for post-ban possession',
        'broader possession support after Section 21',
        'evidence-led eviction support after Section 21',
      ],
    },
    section21TransitionEligible: true,
    freshnessRequired: false,
    consolidationStatus: 'supporting_live',
    ...config,
  });
}

function regionalEntry(
  pathname: string,
  jurisdiction: SeoJurisdiction,
  supportingPage: string
): SeoPageTaxonomyEntry {
  return makeEntry(pathname, {
    pageType: 'guide',
    pageRole: 'supporting',
    jurisdiction,
    cluster: 'regional-eviction',
    primaryPillar: SEO_PILLAR_ROUTES.howToEvictTenant,
    supportingPage,
    primaryProduct: SEO_PRODUCT_ROUTES.noticeOnly,
    secondaryProduct: SEO_PRODUCT_ROUTES.ast,
    canonicalTarget: pathname,
    anchorVariants: {
      pillar: [...anchorSets.howToEvictPillar],
      supporting: [...anchorSets.evictionProcessPillar],
      product: [...anchorSets.noticeOnlyProduct],
    },
    section21TransitionEligible: false,
    freshnessRequired: false,
    consolidationStatus: 'supporting_live',
  });
}

export const SEO_PAGE_TAXONOMY: Record<string, SeoPageTaxonomyEntry> = {
  [SEO_PILLAR_ROUTES.tenantNotPayingRent]: makeEntry(SEO_PILLAR_ROUTES.tenantNotPayingRent, {
    pageType: 'money',
    pageRole: 'pillar',
    jurisdiction: 'uk',
    cluster: 'rent-arrears',
    primaryPillar: SEO_PILLAR_ROUTES.tenantNotPayingRent,
    supportingPage: '/money-claim-unpaid-rent',
    primaryProduct: SEO_PRODUCT_ROUTES.moneyClaim,
    secondaryProduct: SEO_PRODUCT_ROUTES.noticeOnly,
    primaryProductByScenario: {
      notice: SEO_PRODUCT_ROUTES.noticeOnly,
      court: SEO_PRODUCT_ROUTES.completePack,
    },
    canonicalTarget: SEO_PILLAR_ROUTES.tenantNotPayingRent,
    anchorVariants: {
      pillar: [...anchorSets.section8Pillar],
      supporting: [
        'money claim for unpaid rent',
        'county court rent recovery guide',
        'recover unpaid rent through MCOL',
      ],
      product: [...anchorSets.moneyClaimProduct],
    },
    section21TransitionEligible: true,
    freshnessRequired: true,
    consolidationStatus: 'canonical',
  }),
  [SEO_PILLAR_ROUTES.howToEvictTenant]: makeEntry(SEO_PILLAR_ROUTES.howToEvictTenant, {
    pageType: 'guide',
    pageRole: 'pillar',
    jurisdiction: 'uk',
    cluster: 'how-to-evict',
    primaryPillar: SEO_PILLAR_ROUTES.howToEvictTenant,
    supportingPage: SEO_PILLAR_ROUTES.evictionGuides,
    primaryProduct: SEO_PRODUCT_ROUTES.completePack,
    secondaryProduct: SEO_PRODUCT_ROUTES.noticeOnly,
    canonicalTarget: SEO_PILLAR_ROUTES.howToEvictTenant,
    anchorVariants: {
      pillar: [...anchorSets.evictionProcessPillar],
      supporting: [
        'browse the eviction guides hub',
        'linked eviction guides for landlords',
        'authority hub for eviction notices and court steps',
      ],
      product: [...anchorSets.completePackProduct],
    },
    section21TransitionEligible: false,
    freshnessRequired: true,
    consolidationStatus: 'canonical',
  }),
  [SEO_PILLAR_ROUTES.evictionProcessUk]: makeEntry(SEO_PILLAR_ROUTES.evictionProcessUk, {
    pageType: 'court',
    pageRole: 'pillar',
    jurisdiction: 'uk',
    cluster: 'eviction-process',
    primaryPillar: SEO_PILLAR_ROUTES.evictionProcessUk,
    supportingPage: '/eviction-process-england',
    primaryProduct: SEO_PRODUCT_ROUTES.completePack,
    secondaryProduct: SEO_PRODUCT_ROUTES.noticeOnly,
    canonicalTarget: SEO_PILLAR_ROUTES.evictionProcessUk,
    anchorVariants: {
      pillar: [...anchorSets.howToEvictPillar],
      supporting: [
        'England eviction process guide',
        'England notice-to-bailiff timeline',
        'England possession process',
      ],
      product: [...anchorSets.completePackProduct],
    },
    section21TransitionEligible: false,
    freshnessRequired: true,
    consolidationStatus: 'canonical',
  }),
  [SEO_PILLAR_ROUTES.section8Notice]: makeEntry(SEO_PILLAR_ROUTES.section8Notice, {
    pageType: 'notice',
    pageRole: 'pillar',
    jurisdiction: 'england',
    cluster: 'section-8',
    primaryPillar: SEO_PILLAR_ROUTES.section8Notice,
    supportingPage: '/section-8-grounds-explained',
    primaryProduct: SEO_PRODUCT_ROUTES.noticeOnly,
    secondaryProduct: SEO_PRODUCT_ROUTES.completePack,
    primaryProductByScenario: {
      court: SEO_PRODUCT_ROUTES.completePack,
    },
    canonicalTarget: SEO_PILLAR_ROUTES.section8Notice,
    anchorVariants: {
      pillar: [...anchorSets.rentArrearsPillar],
      supporting: [
        'Section 8 grounds explained',
        'grounds for possession under Section 8',
        'mandatory and discretionary grounds',
      ],
      product: [...anchorSets.section8NoticeProduct],
    },
    section21TransitionEligible: true,
    freshnessRequired: true,
    consolidationStatus: 'canonical',
  }),
  [SEO_PILLAR_ROUTES.section21BanUk]: makeEntry(SEO_PILLAR_ROUTES.section21BanUk, {
    pageType: 'guide',
    pageRole: 'pillar',
    jurisdiction: 'england',
    cluster: 'section-21-transition',
    primaryPillar: SEO_PILLAR_ROUTES.section21BanUk,
    supportingPage: SEO_PILLAR_ROUTES.section21Notice,
    primaryProduct: SEO_PRODUCT_ROUTES.completePack,
    secondaryProduct: SEO_PRODUCT_ROUTES.noticeOnly,
    primaryProductByScenario: {
      notice: SEO_PRODUCT_ROUTES.noticeOnly,
      transition: SEO_PRODUCT_ROUTES.completePack,
    },
    canonicalTarget: SEO_PILLAR_ROUTES.section21BanUk,
    anchorVariants: {
      pillar: [...anchorSets.section8Pillar],
      supporting: [
        'Section 21 notice legacy route guide',
        'when older Section 21 notices still mattered',
        'Section 21 notice transition guide',
      ],
      product: [
        'complete eviction pack for post-ban possession',
        'evidence-led possession support after Section 21',
        'complete pack for Section 8-led possession',
      ],
    },
    section21TransitionEligible: true,
    freshnessRequired: true,
    consolidationStatus: 'canonical',
  }),
  [SEO_PILLAR_ROUTES.section21Notice]: makeEntry(SEO_PILLAR_ROUTES.section21Notice, {
    pageType: 'notice',
    pageRole: 'bridge',
    jurisdiction: 'england',
    cluster: 'section-21-legacy',
    primaryPillar: SEO_PILLAR_ROUTES.section21BanUk,
    supportingPage: SEO_PILLAR_ROUTES.section8Notice,
    primaryProduct: SEO_PRODUCT_ROUTES.completePack,
    secondaryProduct: SEO_PRODUCT_ROUTES.noticeOnly,
    primaryProductByScenario: {
      notice: SEO_PRODUCT_ROUTES.noticeOnly,
      transition: SEO_PRODUCT_ROUTES.completePack,
    },
    canonicalTarget: SEO_PILLAR_ROUTES.section21Notice,
    anchorVariants: {
      pillar: [...anchorSets.section21TransitionPillar],
      supporting: [
        'Section 8 notice after Section 21',
        'grounds-based possession notice',
        'Section 8 notice guide for landlords',
      ],
      product: [
        'complete pack for post-ban possession',
        'eviction pack for Section 8-led cases',
        'broader possession support after Section 21',
      ],
    },
    section21TransitionEligible: true,
    freshnessRequired: true,
    consolidationStatus: 'canonical',
  }),
  [SEO_PILLAR_ROUTES.evictionGuides]: makeEntry(SEO_PILLAR_ROUTES.evictionGuides, {
    pageType: 'guide',
    pageRole: 'hub',
    jurisdiction: 'england',
    cluster: 'eviction-hub',
    primaryPillar: SEO_PILLAR_ROUTES.howToEvictTenant,
    supportingPage: SEO_PILLAR_ROUTES.section21BanUk,
    primaryProduct: SEO_PRODUCT_ROUTES.completePack,
    secondaryProduct: SEO_PRODUCT_ROUTES.noticeOnly,
    canonicalTarget: SEO_PILLAR_ROUTES.evictionGuides,
    anchorVariants: {
      pillar: [...anchorSets.howToEvictPillar],
      supporting: [...anchorSets.section21TransitionPillar],
      product: [...anchorSets.completePackProduct],
    },
    section21TransitionEligible: true,
    freshnessRequired: false,
    consolidationStatus: 'canonical',
  }),
  '/section-8-notice-guide': makeEntry('/section-8-notice-guide', {
    ...section8Entry('/section-8-notice-guide', '/section-8-grounds-explained', {
      canonicalTarget: SEO_PILLAR_ROUTES.section8Notice,
    }),
    pageRole: 'supporting',
    consolidationStatus: 'candidate_redirect',
  }),
  '/section-21-notice-guide': makeEntry('/section-21-notice-guide', {
    ...section21Entry('/section-21-notice-guide', SEO_PILLAR_ROUTES.section8Notice, {
      canonicalTarget: SEO_PILLAR_ROUTES.section21Notice,
    }),
    pageRole: 'supporting',
    cluster: 'section-21-legacy',
    consolidationStatus: 'candidate_redirect',
  }),
  '/section-21-ban': makeEntry('/section-21-ban', {
    ...section21Entry('/section-21-ban', SEO_PILLAR_ROUTES.section21Notice, {
      canonicalTarget: SEO_PILLAR_ROUTES.section21BanUk,
    }),
    consolidationStatus: 'candidate_redirect',
  }),
  '/how-to-evict-a-tenant-uk': makeEntry('/how-to-evict-a-tenant-uk', {
    pageType: 'guide',
    pageRole: 'supporting',
    jurisdiction: 'uk',
    cluster: 'how-to-evict',
    primaryPillar: SEO_PILLAR_ROUTES.howToEvictTenant,
    supportingPage: SEO_PILLAR_ROUTES.evictionProcessUk,
    primaryProduct: SEO_PRODUCT_ROUTES.completePack,
    secondaryProduct: SEO_PRODUCT_ROUTES.noticeOnly,
    canonicalTarget: '/how-to-evict-a-tenant-uk',
    anchorVariants: {
      pillar: [...anchorSets.howToEvictPillar],
      supporting: [...anchorSets.evictionProcessPillar],
      product: [...anchorSets.completePackProduct],
    },
    section21TransitionEligible: false,
    freshnessRequired: false,
    consolidationStatus: 'supporting_live',
  }),
  '/rent-arrears-landlord-guide': rentArrearsEntry('/rent-arrears-landlord-guide', SEO_PILLAR_ROUTES.section8Notice, {
    canonicalTarget: '/rent-arrears-landlord-guide',
  }),
  '/eviction-process-england': makeEntry('/eviction-process-england', {
    pageType: 'court',
    pageRole: 'supporting',
    jurisdiction: 'england',
    cluster: 'eviction-process',
    primaryPillar: SEO_PILLAR_ROUTES.evictionProcessUk,
    supportingPage: SEO_PILLAR_ROUTES.section8Notice,
    primaryProduct: SEO_PRODUCT_ROUTES.completePack,
    secondaryProduct: SEO_PRODUCT_ROUTES.noticeOnly,
    canonicalTarget: '/eviction-process-england',
    anchorVariants: {
      pillar: [...anchorSets.evictionProcessPillar],
      supporting: [...anchorSets.section8Pillar],
      product: [...anchorSets.completePackProduct],
    },
    section21TransitionEligible: true,
    freshnessRequired: false,
    consolidationStatus: 'supporting_live',
  }),
  '/section-8-grounds-explained': section8Entry('/section-8-grounds-explained', SEO_PILLAR_ROUTES.tenantNotPayingRent, {
    canonicalTarget: '/section-8-grounds-explained',
    anchorVariants: {
      pillar: [...anchorSets.section8Pillar],
      supporting: [...anchorSets.rentArrearsPillar],
      product: [...anchorSets.section8NoticeProduct],
    },
  }),
  '/section-8-eviction-process': makeEntry('/section-8-eviction-process', {
    ...section8Entry('/section-8-eviction-process', SEO_PILLAR_ROUTES.evictionProcessUk, {
      canonicalTarget: '/section-8-eviction-process',
    }),
    pageType: 'court',
    primaryProduct: SEO_PRODUCT_ROUTES.completePack,
  }),
  '/rent-arrears-eviction-guide': rentArrearsEntry('/rent-arrears-eviction-guide', '/money-claim-unpaid-rent', {
    canonicalTarget: '/rent-arrears-eviction-guide',
  }),
  '/tenant-stopped-paying-rent': makeEntry('/tenant-stopped-paying-rent', {
    ...rentArrearsEntry('/tenant-stopped-paying-rent', SEO_PILLAR_ROUTES.section8Notice, {
      canonicalTarget: '/tenant-stopped-paying-rent',
    }),
    pageType: 'problem',
    primaryProduct: SEO_PRODUCT_ROUTES.noticeOnly,
    secondaryProduct: SEO_PRODUCT_ROUTES.moneyClaim,
  }),
  '/money-claim-unpaid-rent': makeEntry('/money-claim-unpaid-rent', {
    ...rentArrearsEntry('/money-claim-unpaid-rent', '/rent-arrears-landlord-guide', {
      canonicalTarget: '/money-claim-unpaid-rent',
    }),
    pageRole: 'product-adjacent',
  }),
  '/section-21-validity-checklist': section21Entry('/section-21-validity-checklist', SEO_PILLAR_ROUTES.section21Notice, {
    canonicalTarget: '/section-21-validity-checklist',
  }),
  '/serve-section-21-notice': makeEntry('/serve-section-21-notice', {
    ...section21Entry('/serve-section-21-notice', SEO_PILLAR_ROUTES.section21Notice, {
      canonicalTarget: '/serve-section-21-notice',
    }),
    pageType: 'notice',
    primaryProduct: SEO_PRODUCT_ROUTES.noticeOnly,
  }),
  '/serve-section-8-notice': section8Entry('/serve-section-8-notice', '/section-8-grounds-explained', {
    canonicalTarget: '/serve-section-8-notice',
  }),
  '/tenant-anti-social-behaviour': makeEntry('/tenant-anti-social-behaviour', {
    ...section8Entry('/tenant-anti-social-behaviour', '/section-8-grounds-explained', {
      canonicalTarget: '/tenant-anti-social-behaviour',
    }),
    pageType: 'problem',
    primaryProduct: SEO_PRODUCT_ROUTES.completePack,
  }),
  '/tenant-damaging-property': makeEntry('/tenant-damaging-property', {
    ...section8Entry('/tenant-damaging-property', '/can-you-evict-a-tenant-for-property-damage', {
      canonicalTarget: '/tenant-damaging-property',
    }),
    pageType: 'problem',
    primaryProduct: SEO_PRODUCT_ROUTES.completePack,
    secondaryProduct: SEO_PRODUCT_ROUTES.moneyClaim,
    anchorVariants: {
      pillar: [...anchorSets.section8Pillar],
      supporting: [
        'evict a tenant for property damage',
        'property damage eviction guide',
        'damage-based possession strategy',
      ],
      product: [...anchorSets.completePackProduct],
    },
  }),
  '/tenant-refusing-access': makeEntry('/tenant-refusing-access', {
    ...processEntry('/tenant-refusing-access', SEO_PILLAR_ROUTES.howToEvictTenant, {
      canonicalTarget: '/tenant-refusing-access',
    }),
    pageType: 'problem',
    supportingPage: SEO_PILLAR_ROUTES.evictionProcessUk,
    anchorVariants: {
      pillar: [...anchorSets.evictionProcessPillar],
      supporting: [...anchorSets.howToEvictPillar],
      product: [...anchorSets.completePackProduct],
    },
  }),
  '/tenant-abandoned-property': makeEntry('/tenant-abandoned-property', {
    ...processEntry('/tenant-abandoned-property', '/tenant-left-without-paying-rent', {
      canonicalTarget: '/tenant-abandoned-property',
    }),
    pageType: 'problem',
    anchorVariants: {
      pillar: [...anchorSets.howToEvictPillar],
      supporting: [
        'tenant left without paying rent',
        'former tenant arrears recovery guide',
        'after-abandonment rent recovery',
      ],
      product: [...anchorSets.completePackProduct],
    },
  }),
  '/evict-tenant-for-damage': makeEntry('/evict-tenant-for-damage', {
    ...section8Entry('/evict-tenant-for-damage', '/can-you-evict-a-tenant-for-property-damage', {
      canonicalTarget: '/evict-tenant-for-damage',
    }),
    pageType: 'problem',
    primaryProduct: SEO_PRODUCT_ROUTES.completePack,
    secondaryProduct: SEO_PRODUCT_ROUTES.moneyClaim,
    anchorVariants: {
      pillar: [...anchorSets.section8Pillar],
      supporting: [
        'evict a tenant for property damage',
        'property damage eviction guide',
        'damage-based possession strategy',
      ],
      product: [...anchorSets.completePackProduct],
    },
  }),
  '/evict-tenant-anti-social-behaviour': makeEntry('/evict-tenant-anti-social-behaviour', {
    ...section8Entry('/evict-tenant-anti-social-behaviour', '/tenant-anti-social-behaviour', {
      canonicalTarget: '/evict-tenant-anti-social-behaviour',
    }),
    pageType: 'problem',
    primaryProduct: SEO_PRODUCT_ROUTES.completePack,
    anchorVariants: {
      pillar: [...anchorSets.section8Pillar],
      supporting: [
        'tenant anti-social behaviour guide',
        'noise complaint evidence guide',
        'anti-social behaviour possession strategy',
      ],
      product: [...anchorSets.completePackProduct],
    },
  }),
  '/notice-to-quit-guide': makeEntry('/notice-to-quit-guide', {
    pageType: 'guide',
    pageRole: 'supporting',
    jurisdiction: 'uk',
    cluster: 'regional-eviction',
    primaryPillar: SEO_PILLAR_ROUTES.howToEvictTenant,
    supportingPage: SEO_PILLAR_ROUTES.evictionProcessUk,
    primaryProduct: SEO_PRODUCT_ROUTES.noticeOnly,
    secondaryProduct: SEO_PRODUCT_ROUTES.completePack,
    canonicalTarget: '/notice-to-quit-guide',
    anchorVariants: {
      pillar: [...anchorSets.howToEvictPillar],
      supporting: [...anchorSets.evictionProcessPillar],
      product: [...anchorSets.noticeOnlyProduct],
    },
    section21TransitionEligible: false,
    freshnessRequired: false,
    consolidationStatus: 'supporting_live',
  }),
  '/tenant-ignores-section-21': section21Entry('/tenant-ignores-section-21', SEO_PILLAR_ROUTES.section21Notice, {
    canonicalTarget: '/tenant-ignores-section-21',
  }),
  '/tenant-ignores-section-8': makeEntry('/tenant-ignores-section-8', {
    ...section8Entry('/tenant-ignores-section-8', '/section-8-eviction-process', {
      canonicalTarget: '/tenant-ignores-section-8',
    }),
    pageType: 'court',
    primaryProduct: SEO_PRODUCT_ROUTES.completePack,
  }),
  '/what-happens-after-section-21': section21Entry('/what-happens-after-section-21', SEO_PILLAR_ROUTES.section21Notice, {
    canonicalTarget: '/what-happens-after-section-21',
  }),
  '/what-happens-after-section-8': makeEntry('/what-happens-after-section-8', {
    ...section8Entry('/what-happens-after-section-8', '/section-8-eviction-process', {
      canonicalTarget: '/what-happens-after-section-8',
    }),
    pageType: 'court',
    primaryProduct: SEO_PRODUCT_ROUTES.completePack,
  }),
  '/how-long-does-eviction-take': makeEntry('/how-long-does-eviction-take', {
    ...processEntry('/how-long-does-eviction-take', '/possession-order-timeline', {
      canonicalTarget: '/how-long-does-eviction-take',
    }),
    jurisdiction: 'uk',
    supportingPage: '/possession-order-timeline',
    anchorVariants: {
      pillar: [...anchorSets.evictionProcessPillar],
      supporting: [
        'possession order timeline',
        'eviction timeline for landlords',
        'notice-to-order timeline',
      ],
      product: [...anchorSets.completePackProduct],
    },
  }),
  '/possession-order-timeline': makeEntry('/possession-order-timeline', {
    ...processEntry('/possession-order-timeline', '/how-long-does-eviction-take', {
      canonicalTarget: '/possession-order-timeline',
    }),
    cluster: 'court-process',
    supportingPage: '/how-long-does-eviction-take',
    anchorVariants: {
      pillar: [...anchorSets.evictionProcessPillar],
      supporting: [
        'how long eviction takes',
        'eviction timeline for landlords',
        'UK eviction timescale guide',
      ],
      product: [...anchorSets.completePackProduct],
    },
  }),
  '/landlord-eviction-checklist': makeEntry('/landlord-eviction-checklist', {
    ...processEntry('/landlord-eviction-checklist', SEO_PILLAR_ROUTES.howToEvictTenant, {
      canonicalTarget: '/landlord-eviction-checklist',
    }),
    pageType: 'guide',
    section21TransitionEligible: true,
  }),
  '/eviction-court-hearing-guide': makeEntry('/eviction-court-hearing-guide', {
    ...processEntry('/eviction-court-hearing-guide', '/court-possession-order-guide', {
      canonicalTarget: '/eviction-court-hearing-guide',
    }),
    cluster: 'court-process',
    supportingPage: '/court-possession-order-guide',
    anchorVariants: {
      pillar: [...anchorSets.evictionProcessPillar],
      supporting: [
        'court possession order guide',
        'possession order hearing guide',
        'court order workflow for landlords',
      ],
      product: [...anchorSets.completePackProduct],
    },
  }),
  '/court-possession-order-guide': makeEntry('/court-possession-order-guide', {
    ...processEntry('/court-possession-order-guide', '/eviction-court-hearing-guide', {
      canonicalTarget: '/court-possession-order-guide',
    }),
    cluster: 'court-process',
    supportingPage: '/eviction-court-hearing-guide',
    anchorVariants: {
      pillar: [...anchorSets.evictionProcessPillar],
      supporting: [
        'eviction court hearing guide',
        'hearing preparation for landlords',
        'court stage possession guide',
      ],
      product: [...anchorSets.completePackProduct],
    },
  }),
  '/accelerated-possession-guide': makeEntry('/accelerated-possession-guide', {
    ...section21Entry('/accelerated-possession-guide', SEO_PILLAR_ROUTES.section21Notice, {
      canonicalTarget: '/accelerated-possession-guide',
    }),
    pageType: 'court',
  }),
  '/warrant-of-possession-guide': makeEntry('/warrant-of-possession-guide', {
    ...processEntry('/warrant-of-possession-guide', '/bailiff-eviction-process', {
      canonicalTarget: '/warrant-of-possession-guide',
    }),
    cluster: 'court-process',
    supportingPage: '/bailiff-eviction-process',
    anchorVariants: {
      pillar: [...anchorSets.evictionProcessPillar],
      supporting: [
        'bailiff eviction process',
        'enforcement after a possession order',
        'bailiff stage for landlords',
      ],
      product: [...anchorSets.completePackProduct],
    },
  }),
  '/bailiff-eviction-process': makeEntry('/bailiff-eviction-process', {
    ...processEntry('/bailiff-eviction-process', '/warrant-of-possession-guide', {
      canonicalTarget: '/bailiff-eviction-process',
    }),
    cluster: 'court-process',
    supportingPage: '/warrant-of-possession-guide',
    anchorVariants: {
      pillar: [...anchorSets.evictionProcessPillar],
      supporting: [
        'warrant of possession guide',
        'warrant application after a possession order',
        'court warrant guidance for landlords',
      ],
      product: [...anchorSets.completePackProduct],
    },
  }),
  '/how-long-does-bailiff-eviction-take': makeEntry('/how-long-does-bailiff-eviction-take', {
    ...processEntry('/how-long-does-bailiff-eviction-take', '/bailiff-eviction-process', {
      canonicalTarget: '/how-long-does-bailiff-eviction-take',
    }),
    cluster: 'court-process',
    jurisdiction: 'uk',
    supportingPage: '/bailiff-eviction-process',
    anchorVariants: {
      pillar: [...anchorSets.evictionProcessPillar],
      supporting: [
        'bailiff eviction process',
        'bailiff stage for landlords',
        'enforcement after a possession order',
      ],
      product: [...anchorSets.completePackProduct],
    },
  }),
  '/how-long-after-court-order-do-bailiffs-evict': makeEntry('/how-long-after-court-order-do-bailiffs-evict', {
    ...processEntry('/how-long-after-court-order-do-bailiffs-evict', '/warrant-of-possession-guide', {
      canonicalTarget: '/how-long-after-court-order-do-bailiffs-evict',
    }),
    cluster: 'court-process',
    jurisdiction: 'uk',
    supportingPage: '/warrant-of-possession-guide',
    anchorVariants: {
      pillar: [...anchorSets.evictionProcessPillar],
      supporting: [
        'warrant of possession guide',
        'warrant application after a possession order',
        'court warrant guidance for landlords',
      ],
      product: [...anchorSets.completePackProduct],
    },
  }),
  '/how-to-speed-up-eviction-uk': makeEntry('/how-to-speed-up-eviction-uk', {
    ...processEntry('/how-to-speed-up-eviction-uk', SEO_PILLAR_ROUTES.howToEvictTenant, {
      canonicalTarget: '/how-to-speed-up-eviction-uk',
    }),
    jurisdiction: 'uk',
    pageType: 'guide',
  }),
  '/can-a-landlord-evict-for-noise-complaints': makeEntry('/can-a-landlord-evict-for-noise-complaints', {
    ...section8Entry('/can-a-landlord-evict-for-noise-complaints', '/tenant-anti-social-behaviour', {
      canonicalTarget: '/can-a-landlord-evict-for-noise-complaints',
    }),
    pageType: 'problem',
    primaryProduct: SEO_PRODUCT_ROUTES.completePack,
    anchorVariants: {
      pillar: [...anchorSets.section8Pillar],
      supporting: [
        'tenant anti-social behaviour guide',
        'noise complaint evidence guide',
        'anti-social behaviour possession strategy',
      ],
      product: [...anchorSets.completePackProduct],
    },
  }),
  '/can-a-landlord-evict-for-pets': makeEntry('/can-a-landlord-evict-for-pets', {
    ...processEntry('/can-a-landlord-evict-for-pets', '/tenant-damaging-property', {
      canonicalTarget: '/can-a-landlord-evict-for-pets',
    }),
    jurisdiction: 'uk',
    pageType: 'problem',
    primaryProduct: SEO_PRODUCT_ROUTES.noticeOnly,
    anchorVariants: {
      pillar: [...anchorSets.howToEvictPillar],
      supporting: [
        'tenant damaging property guide',
        'property damage possession guide',
        'serious tenancy breach evidence guide',
      ],
      product: [...anchorSets.noticeOnlyProduct],
    },
  }),
  '/can-you-evict-a-tenant-for-property-damage': makeEntry('/can-you-evict-a-tenant-for-property-damage', {
    ...section8Entry('/can-you-evict-a-tenant-for-property-damage', '/tenant-damaging-property', {
      canonicalTarget: '/can-you-evict-a-tenant-for-property-damage',
    }),
    pageType: 'problem',
    primaryProduct: SEO_PRODUCT_ROUTES.completePack,
    secondaryProduct: SEO_PRODUCT_ROUTES.moneyClaim,
    anchorVariants: {
      pillar: [...anchorSets.section8Pillar],
      supporting: [
        'tenant damaging property guide',
        'property damage evidence guide',
        'damage-based possession strategy',
      ],
      product: [...anchorSets.completePackProduct],
    },
  }),
  '/wales-eviction-notices': regionalEntry('/wales-eviction-notices', 'wales', SEO_PILLAR_ROUTES.evictionProcessUk),
  '/scotland-eviction-notices': regionalEntry('/scotland-eviction-notices', 'scotland', SEO_PILLAR_ROUTES.evictionProcessUk),
  '/eviction-process-wales': regionalEntry('/eviction-process-wales', 'wales', SEO_PILLAR_ROUTES.evictionProcessUk),
  '/eviction-process-scotland': regionalEntry('/eviction-process-scotland', 'scotland', SEO_PILLAR_ROUTES.evictionProcessUk),
};

export function getSeoPageTaxonomy(pathname: string): SeoPageTaxonomyEntry | null {
  return SEO_PAGE_TAXONOMY[pathname] ?? null;
}

export function getSeoPageTaxonomyBySlug(slug: string): SeoPageTaxonomyEntry | null {
  return getSeoPageTaxonomy(`/${slug}`);
}

export function getAllSeoPageTaxonomyEntries(): SeoPageTaxonomyEntry[] {
  return Object.values(SEO_PAGE_TAXONOMY);
}

export function getFreshnessPolicy(entry: SeoPageTaxonomyEntry): FreshnessPolicy | null {
  if (!entry.freshnessRequired) {
    return null;
  }

  const defaultPolicy = defaultFreshnessPolicyByJurisdiction[entry.jurisdiction];
  const legalContextNote = entry.section21TransitionEligible
    ? 'Section 21 ended in England on 1 May 2026, and court proceedings on qualifying older Section 21 notices had to begin by 31 July 2026. Landlords now need a Section 8-led possession plan unless a transitional legacy route is clearly available.'
    : entry.jurisdiction === 'uk'
      ? 'This page targets UK search intent, but possession rules differ across England, Wales, Scotland, and Northern Ireland.'
      : `This guide is written for ${defaultPolicy.jurisdictionScope.toLowerCase()} and should be read alongside the current possession route for that jurisdiction.`;

  return {
    ...defaultPolicy,
    legalContextNote,
  };
}

export function getPrimaryProductForScenario(
  entry: SeoPageTaxonomyEntry,
  scenario: SeoScenario = 'default'
): SeoProductRoute {
  return entry.primaryProductByScenario[scenario] ?? entry.primaryProduct;
}

export function getPrimaryDestinationAboveFold(entry: SeoPageTaxonomyEntry): SeoProductRoute {
  return getPrimaryProductForScenario(entry);
}

export function getStickyPrimaryDestination(entry: SeoPageTaxonomyEntry): SeoProductRoute {
  return getPrimaryProductForScenario(entry);
}

export function getAboveFoldCommercialDestinations(entry: SeoPageTaxonomyEntry): SeoProductRoute[] {
  if (entry.pageRole === 'bridge' && entry.secondaryProduct) {
    return [entry.primaryProduct, entry.secondaryProduct];
  }

  return [entry.primaryProduct];
}

export function getAnchorText(
  entry: SeoPageTaxonomyEntry,
  type: keyof AnchorVariants,
  index = 0
): string {
  const anchors = entry.anchorVariants[type];
  return anchors[index] ?? anchors[0] ?? '';
}

export function getCandidateRedirects(): Array<{ source: string; destination: string }> {
  return getAllSeoPageTaxonomyEntries()
    .filter(
      (entry) =>
        entry.consolidationStatus === 'candidate_redirect' &&
        entry.canonicalTarget &&
        entry.canonicalTarget !== entry.pathname
    )
    .map((entry) => ({
      source: entry.pathname,
      destination: entry.canonicalTarget as string,
    }));
}

export function getPhase3SitemapExclusions(): string[] {
  return getCandidateRedirects().map((item) => item.source);
}

export function isMappedPublicContentPath(pathname: string): boolean {
  return pathname in SEO_PAGE_TAXONOMY;
}
