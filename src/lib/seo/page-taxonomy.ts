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
  | 'money-claim'
  | 'how-to-evict'
  | 'eviction-process'
  | 'section-8'
  | 'section-21-transition'
  | 'section-21-legacy'
  | 'tenancy-england'
  | 'tenancy-wales'
  | 'tenancy-scotland'
  | 'tenancy-northern-ireland'
  | 'notice-templates'
  | 'legal-updates'
  | 'court-process'
  | 'tenant-problems'
  | 'regional-eviction'
  | 'eviction-hub'
  | 'product-adjacent';

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
  moneyClaim: '/money-claim',
  howToEvictTenant: '/how-to-evict-tenant',
  evictionProcessUk: '/eviction-process-uk',
  section8Notice: '/section-8-notice',
  section21Notice: '/section-21-notice',
  section21BanUk: '/section-21-ban-uk',
  evictionGuides: '/eviction-guides',
  tenancyAgreementsEngland: '/tenancy-agreements/england',
  tenancyAgreementsWales: '/wales-tenancy-agreement-template',
  tenancyAgreementsScotland: '/private-residential-tenancy-agreement-template',
  tenancyAgreementsNorthernIreland: '/northern-ireland-tenancy-agreement-template',
} as const;

export const EXPLICIT_TAXONOMY_EXEMPTIONS = [
  '/cookies',
  '/landlord-documents-england',
  '/lodger-agreement-template',
  '/privacy',
  '/refunds',
  '/tenancy-agreements/england-wales',
  '/terms',
] as const;

const EXPLICIT_TAXONOMY_EXEMPTION_SET = new Set<string>(EXPLICIT_TAXONOMY_EXEMPTIONS);

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
  moneyClaimPillar: [
    'landlord money claim guide',
    'money claim process for landlords',
    'how landlords recover tenant debt',
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
  tenancyPillar: [
    'England tenancy agreements for landlords',
    'Residential Tenancy Agreement route for England',
    'England tenancy agreement hub',
  ],
  tenancySupporting: [
    'updated England tenancy agreement route',
    'Residential Tenancy Agreement for England',
    'Renters Rights compliant agreement guide',
  ],
  tenancyTransitionSupporting: [
    'Section 21 ending in 2026',
    'what the Renters Rights Act means for landlords',
    'England tenancy law changes for 2026',
  ],
  tenancyProduct: [
    'England tenancy agreement generator',
    'Residential Tenancy Agreement builder',
    'tenancy agreement workflow for landlords',
  ],
} as const;

const regionalTenancyAnchors = {
  wales: {
    pillar: [
      'Wales occupation contract guide',
      'Wales tenancy agreement guide',
      'Renting Homes Wales agreement route',
    ],
    supporting: [
      'Wales written statement requirements',
      'standard occupation contract wording',
      'how Wales occupation contracts are framed',
    ],
    product: [
      'Wales tenancy agreement generator',
      'Wales occupation contract workflow',
      'Renting Homes Wales contract builder',
    ],
  },
  scotland: {
    pillar: [
      'Scotland PRT agreement guide',
      'Private Residential Tenancy guide',
      'Scotland tenancy agreement route',
    ],
    supporting: [
      'Scottish PRT model agreement guide',
      'PRT rules for landlords in Scotland',
      'how Scotland tenancy wording works',
    ],
    product: [
      'Scotland tenancy agreement generator',
      'PRT agreement workflow',
      'Scotland tenancy builder for landlords',
    ],
  },
  'northern-ireland': {
    pillar: [
      'Northern Ireland tenancy agreement guide',
      'NI private tenancy agreement route',
      'Northern Ireland landlord agreement guide',
    ],
    supporting: [
      'Northern Ireland tenancy agreement wording',
      'NI private tenancy rules for landlords',
      'Northern Ireland tenancy template guidance',
    ],
    product: [
      'Northern Ireland tenancy agreement generator',
      'NI tenancy workflow for landlords',
      'Northern Ireland agreement builder',
    ],
  },
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
  config: Partial<Omit<SeoPageTaxonomyEntry, 'pathname' | 'cluster' | 'primaryPillar' | 'supportingPage' | 'primaryProduct' | 'pageType' | 'pageRole' | 'jurisdiction' | 'section21TransitionEligible' | 'freshnessRequired' | 'consolidationStatus'>> &
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

function moneyClaimEntry(
  pathname: string,
  supportingPage: string,
  config: Partial<Omit<SeoPageTaxonomyEntry, 'pathname' | 'cluster' | 'primaryPillar' | 'supportingPage' | 'primaryProduct' | 'pageType' | 'pageRole' | 'jurisdiction' | 'section21TransitionEligible' | 'freshnessRequired' | 'consolidationStatus'>> &
    Pick<SeoPageTaxonomyEntry, 'canonicalTarget'>
): SeoPageTaxonomyEntry {
  return makeEntry(pathname, {
    pageType: 'money',
    pageRole: 'supporting',
    jurisdiction: 'england',
    cluster: 'money-claim',
    primaryPillar: SEO_PILLAR_ROUTES.moneyClaim,
    supportingPage,
    primaryProduct: SEO_PRODUCT_ROUTES.moneyClaim,
    secondaryProduct: SEO_PRODUCT_ROUTES.completePack,
    primaryProductByScenario: {
      arrears: SEO_PRODUCT_ROUTES.moneyClaim,
      court: SEO_PRODUCT_ROUTES.completePack,
      ...config.primaryProductByScenario,
    },
    canonicalTarget: config.canonicalTarget,
    anchorVariants: {
      pillar: [...anchorSets.moneyClaimPillar],
      supporting: [
        'tenant not paying rent in the UK',
        'rent arrears landlord guide',
        'what landlords should do when rent is unpaid',
      ],
      product: [...anchorSets.moneyClaimProduct],
    },
    section21TransitionEligible: false,
    freshnessRequired: false,
    consolidationStatus: 'supporting_live',
    ...config,
  });
}

function tenancyEntry(
  pathname: string,
  supportingPage: string,
  config: Partial<Omit<SeoPageTaxonomyEntry, 'pathname' | 'cluster' | 'primaryPillar' | 'supportingPage' | 'primaryProduct' | 'pageType' | 'pageRole' | 'jurisdiction' | 'section21TransitionEligible' | 'freshnessRequired' | 'consolidationStatus'>> &
    Pick<SeoPageTaxonomyEntry, 'canonicalTarget'>
): SeoPageTaxonomyEntry {
  return makeEntry(pathname, {
    pageType: 'tenancy',
    pageRole: 'supporting',
    jurisdiction: 'england',
    cluster: 'tenancy-england',
    primaryPillar: SEO_PILLAR_ROUTES.tenancyAgreementsEngland,
    supportingPage,
    primaryProduct: SEO_PRODUCT_ROUTES.ast,
    primaryProductByScenario: {
      tenancy: SEO_PRODUCT_ROUTES.ast,
      ...config.primaryProductByScenario,
    },
    canonicalTarget: config.canonicalTarget,
    anchorVariants: {
      pillar: [...anchorSets.tenancyPillar],
      supporting: [...anchorSets.tenancySupporting],
      product: [...anchorSets.tenancyProduct],
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
  config: Partial<Omit<SeoPageTaxonomyEntry, 'pathname' | 'cluster' | 'primaryPillar' | 'supportingPage' | 'primaryProduct' | 'pageType' | 'pageRole' | 'jurisdiction' | 'section21TransitionEligible' | 'freshnessRequired' | 'consolidationStatus'>> &
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
  config: Partial<Omit<SeoPageTaxonomyEntry, 'pathname' | 'cluster' | 'primaryPillar' | 'supportingPage' | 'primaryProduct' | 'pageType' | 'pageRole' | 'jurisdiction' | 'section21TransitionEligible' | 'freshnessRequired' | 'consolidationStatus'>> &
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
  config: Partial<Omit<SeoPageTaxonomyEntry, 'pathname' | 'cluster' | 'primaryPillar' | 'supportingPage' | 'primaryProduct' | 'pageType' | 'pageRole' | 'jurisdiction' | 'section21TransitionEligible' | 'freshnessRequired' | 'consolidationStatus'>> &
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

function regionalTenancyEntry(
  pathname: string,
  jurisdiction: Extract<SeoJurisdiction, 'wales' | 'scotland' | 'northern-ireland'>,
  cluster: Extract<SeoCluster, 'tenancy-wales' | 'tenancy-scotland' | 'tenancy-northern-ireland'>,
  primaryPillar: string,
  supportingPage: string,
  config: Partial<Omit<SeoPageTaxonomyEntry, 'pathname' | 'cluster' | 'primaryPillar' | 'supportingPage' | 'primaryProduct' | 'pageType' | 'pageRole' | 'jurisdiction' | 'section21TransitionEligible' | 'freshnessRequired' | 'consolidationStatus'>> &
    Pick<SeoPageTaxonomyEntry, 'canonicalTarget'>
): SeoPageTaxonomyEntry {
  const anchors = regionalTenancyAnchors[jurisdiction];

  return makeEntry(pathname, {
    pageType: 'tenancy',
    pageRole: 'supporting',
    jurisdiction,
    cluster,
    primaryPillar,
    supportingPage,
    primaryProduct: SEO_PRODUCT_ROUTES.ast,
    primaryProductByScenario: {
      tenancy: SEO_PRODUCT_ROUTES.ast,
      ...config.primaryProductByScenario,
    },
    canonicalTarget: config.canonicalTarget,
    anchorVariants: {
      pillar: [...anchors.pillar],
      supporting: [...anchors.supporting],
      product: [...anchors.product],
    },
    section21TransitionEligible: false,
    freshnessRequired: false,
    consolidationStatus: 'supporting_live',
    ...config,
  });
}

function section21TemplateEntry(
  pathname: string,
  supportingPage: string,
  config: Partial<Omit<SeoPageTaxonomyEntry, 'pathname' | 'cluster' | 'primaryPillar' | 'supportingPage' | 'primaryProduct' | 'pageType' | 'pageRole' | 'jurisdiction' | 'section21TransitionEligible' | 'freshnessRequired' | 'consolidationStatus'>> &
    Pick<SeoPageTaxonomyEntry, 'canonicalTarget'>
): SeoPageTaxonomyEntry {
  return makeEntry(pathname, {
    pageType: 'notice',
    pageRole: 'supporting',
    jurisdiction: 'england',
    cluster: 'notice-templates',
    primaryPillar: SEO_PILLAR_ROUTES.section21BanUk,
    supportingPage,
    primaryProduct: SEO_PRODUCT_ROUTES.noticeOnly,
    secondaryProduct: SEO_PRODUCT_ROUTES.completePack,
    primaryProductByScenario: {
      court: SEO_PRODUCT_ROUTES.completePack,
      transition: SEO_PRODUCT_ROUTES.completePack,
      ...config.primaryProductByScenario,
    },
    canonicalTarget: config.canonicalTarget,
    anchorVariants: {
      pillar: [...anchorSets.section21TransitionPillar],
      supporting: [
        'Section 21 validity checklist',
        'what to do when a Section 21 expires',
        'post-ban possession route for landlords',
      ],
      product: [...anchorSets.noticeOnlyProduct],
    },
    section21TransitionEligible: true,
    freshnessRequired: false,
    consolidationStatus: 'supporting_live',
    ...config,
  });
}

function section8TemplateEntry(
  pathname: string,
  supportingPage: string,
  config: Partial<Omit<SeoPageTaxonomyEntry, 'pathname' | 'cluster' | 'primaryPillar' | 'supportingPage' | 'primaryProduct' | 'pageType' | 'pageRole' | 'jurisdiction' | 'section21TransitionEligible' | 'freshnessRequired' | 'consolidationStatus'>> &
    Pick<SeoPageTaxonomyEntry, 'canonicalTarget'>
): SeoPageTaxonomyEntry {
  return makeEntry(pathname, {
    pageType: 'notice',
    pageRole: 'supporting',
    jurisdiction: 'england',
    cluster: 'notice-templates',
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
        'Section 8 eviction process',
        'grounds and hearing prep for Section 8',
        'what happens after serving Section 8',
      ],
      product: [...anchorSets.section8NoticeProduct],
    },
    section21TransitionEligible: false,
    freshnessRequired: false,
    consolidationStatus: 'supporting_live',
    ...config,
  });
}

function genericNoticeEntry(
  pathname: string,
  supportingPage: string,
  config: Partial<Omit<SeoPageTaxonomyEntry, 'pathname' | 'cluster' | 'primaryPillar' | 'supportingPage' | 'primaryProduct' | 'pageType' | 'pageRole' | 'jurisdiction' | 'section21TransitionEligible' | 'freshnessRequired' | 'consolidationStatus'>> &
    Pick<SeoPageTaxonomyEntry, 'canonicalTarget'>
): SeoPageTaxonomyEntry {
  return makeEntry(pathname, {
    pageType: 'notice',
    pageRole: 'supporting',
    jurisdiction: 'uk',
    cluster: 'notice-templates',
    primaryPillar: SEO_PILLAR_ROUTES.evictionProcessUk,
    supportingPage,
    primaryProduct: SEO_PRODUCT_ROUTES.noticeOnly,
    secondaryProduct: SEO_PRODUCT_ROUTES.completePack,
    primaryProductByScenario: {
      notice: SEO_PRODUCT_ROUTES.noticeOnly,
      court: SEO_PRODUCT_ROUTES.completePack,
      ...config.primaryProductByScenario,
    },
    canonicalTarget: config.canonicalTarget,
    anchorVariants: {
      pillar: [...anchorSets.evictionProcessPillar],
      supporting: [
        'how to evict a tenant legally',
        'eviction notice template guide',
        'landlord notice route overview',
      ],
      product: [...anchorSets.noticeOnlyProduct],
    },
    section21TransitionEligible: false,
    freshnessRequired: false,
    consolidationStatus: 'supporting_live',
    ...config,
  });
}

function productAdjacentRedirectEntry(
  pathname: string,
  primaryPillar: string,
  supportingPage: string,
  primaryProduct: SeoProductRoute,
  canonicalTarget: string,
  config: Partial<
    Omit<
      SeoPageTaxonomyEntry,
      | 'pathname'
      | 'cluster'
      | 'primaryPillar'
      | 'supportingPage'
      | 'primaryProduct'
      | 'canonicalTarget'
      | 'pageRole'
      | 'jurisdiction'
      | 'freshnessRequired'
      | 'consolidationStatus'
    >
  > = {}
): SeoPageTaxonomyEntry {
  const productAnchors =
    primaryProduct === SEO_PRODUCT_ROUTES.moneyClaim
      ? anchorSets.moneyClaimProduct
      : primaryProduct === SEO_PRODUCT_ROUTES.ast
        ? anchorSets.tenancyProduct
        : primaryProduct === SEO_PRODUCT_ROUTES.completePack
          ? anchorSets.completePackProduct
          : anchorSets.noticeOnlyProduct;

  return makeEntry(pathname, {
    pageType: 'guide',
    pageRole: 'product-adjacent',
    jurisdiction: 'england',
    cluster: 'product-adjacent',
    primaryPillar,
    supportingPage,
    primaryProduct,
    canonicalTarget,
    anchorVariants: {
      pillar: [...anchorSets.howToEvictPillar],
      supporting: [...anchorSets.evictionProcessPillar],
      product: [...productAnchors],
    },
    section21TransitionEligible: false,
    freshnessRequired: false,
    consolidationStatus: 'candidate_redirect',
    ...config,
  });
}

const LONGTAIL_LIVE_TAXONOMY: Record<string, SeoPageTaxonomyEntry> = {
  [SEO_PILLAR_ROUTES.tenancyAgreementsWales]: makeEntry(SEO_PILLAR_ROUTES.tenancyAgreementsWales, {
    pageType: 'tenancy',
    pageRole: 'pillar',
    jurisdiction: 'wales',
    cluster: 'tenancy-wales',
    primaryPillar: SEO_PILLAR_ROUTES.tenancyAgreementsWales,
    supportingPage: '/occupation-contract-template-wales',
    primaryProduct: SEO_PRODUCT_ROUTES.ast,
    canonicalTarget: SEO_PILLAR_ROUTES.tenancyAgreementsWales,
    anchorVariants: {
      pillar: [...regionalTenancyAnchors.wales.pillar],
      supporting: [...regionalTenancyAnchors.wales.supporting],
      product: [...regionalTenancyAnchors.wales.product],
    },
    section21TransitionEligible: false,
    freshnessRequired: true,
    consolidationStatus: 'canonical',
  }),
  [SEO_PILLAR_ROUTES.tenancyAgreementsScotland]: makeEntry(SEO_PILLAR_ROUTES.tenancyAgreementsScotland, {
    pageType: 'tenancy',
    pageRole: 'pillar',
    jurisdiction: 'scotland',
    cluster: 'tenancy-scotland',
    primaryPillar: SEO_PILLAR_ROUTES.tenancyAgreementsScotland,
    supportingPage: '/private-residential-tenancy-agreement-scotland',
    primaryProduct: SEO_PRODUCT_ROUTES.ast,
    canonicalTarget: SEO_PILLAR_ROUTES.tenancyAgreementsScotland,
    anchorVariants: {
      pillar: [...regionalTenancyAnchors.scotland.pillar],
      supporting: [...regionalTenancyAnchors.scotland.supporting],
      product: [...regionalTenancyAnchors.scotland.product],
    },
    section21TransitionEligible: false,
    freshnessRequired: true,
    consolidationStatus: 'canonical',
  }),
  [SEO_PILLAR_ROUTES.tenancyAgreementsNorthernIreland]: makeEntry(SEO_PILLAR_ROUTES.tenancyAgreementsNorthernIreland, {
    pageType: 'tenancy',
    pageRole: 'pillar',
    jurisdiction: 'northern-ireland',
    cluster: 'tenancy-northern-ireland',
    primaryPillar: SEO_PILLAR_ROUTES.tenancyAgreementsNorthernIreland,
    supportingPage: '/tenancy-agreement-northern-ireland',
    primaryProduct: SEO_PRODUCT_ROUTES.ast,
    canonicalTarget: SEO_PILLAR_ROUTES.tenancyAgreementsNorthernIreland,
    anchorVariants: {
      pillar: [...regionalTenancyAnchors['northern-ireland'].pillar],
      supporting: [...regionalTenancyAnchors['northern-ireland'].supporting],
      product: [...regionalTenancyAnchors['northern-ireland'].product],
    },
    section21TransitionEligible: false,
    freshnessRequired: true,
    consolidationStatus: 'canonical',
  }),
  '/evict-tenant-not-paying-rent': makeEntry('/evict-tenant-not-paying-rent', {
    ...rentArrearsEntry('/evict-tenant-not-paying-rent', '/section-8-eviction-process', {
      canonicalTarget: '/evict-tenant-not-paying-rent',
    }),
    pageType: 'problem',
    primaryProduct: SEO_PRODUCT_ROUTES.noticeOnly,
    secondaryProduct: SEO_PRODUCT_ROUTES.completePack,
    anchorVariants: {
      pillar: [...anchorSets.rentArrearsPillar],
      supporting: [
        'Section 8 eviction process',
        'rent arrears possession route',
        'what to do after missed rent escalates',
      ],
      product: [...anchorSets.noticeOnlyProduct],
    },
  }),
  '/tenant-left-without-paying-rent': makeEntry('/tenant-left-without-paying-rent', {
    ...rentArrearsEntry('/tenant-left-without-paying-rent', '/recover-rent-arrears-after-eviction', {
      canonicalTarget: '/tenant-left-without-paying-rent',
    }),
    pageType: 'problem',
    primaryProduct: SEO_PRODUCT_ROUTES.moneyClaim,
    secondaryProduct: SEO_PRODUCT_ROUTES.completePack,
    anchorVariants: {
      pillar: [...anchorSets.rentArrearsPillar],
      supporting: [
        'recover rent arrears after eviction',
        'post-eviction arrears recovery guide',
        'claim unpaid rent after the tenant has gone',
      ],
      product: [...anchorSets.moneyClaimProduct],
    },
  }),
  '/recover-rent-arrears-after-eviction': makeEntry('/recover-rent-arrears-after-eviction', {
    ...rentArrearsEntry('/recover-rent-arrears-after-eviction', '/money-claim-unpaid-rent', {
      canonicalTarget: '/recover-rent-arrears-after-eviction',
    }),
    primaryProduct: SEO_PRODUCT_ROUTES.moneyClaim,
    secondaryProduct: SEO_PRODUCT_ROUTES.completePack,
    anchorVariants: {
      pillar: [...anchorSets.rentArrearsPillar],
      supporting: [
        'money claim for unpaid rent',
        'landlord debt recovery after eviction',
        'county court rent recovery guide',
      ],
      product: [...anchorSets.moneyClaimProduct],
    },
  }),
  '/pre-action-protocol-debt': makeEntry('/pre-action-protocol-debt', {
    pageType: 'money',
    pageRole: 'bridge',
    jurisdiction: 'england',
    cluster: 'money-claim',
    primaryPillar: SEO_PILLAR_ROUTES.tenantNotPayingRent,
    supportingPage: '/money-claim-letter-before-action',
    primaryProduct: SEO_PRODUCT_ROUTES.moneyClaim,
    secondaryProduct: SEO_PRODUCT_ROUTES.completePack,
    primaryProductByScenario: {
      arrears: SEO_PRODUCT_ROUTES.moneyClaim,
      court: SEO_PRODUCT_ROUTES.completePack,
    },
    canonicalTarget: '/pre-action-protocol-debt',
    anchorVariants: {
      pillar: [...anchorSets.rentArrearsPillar],
      supporting: [
        'letter before action for rent arrears',
        'money claim pre-action steps',
        'pre-action debt letter for landlords',
      ],
      product: [...anchorSets.moneyClaimProduct],
    },
    section21TransitionEligible: false,
    freshnessRequired: true,
    consolidationStatus: 'bridge_live',
  }),
  '/section-21-notice-template': makeEntry('/section-21-notice-template', {
    ...section21TemplateEntry('/section-21-notice-template', '/section-21-validity-checklist', {
      canonicalTarget: '/section-21-notice-template',
    }),
    pageRole: 'bridge',
    freshnessRequired: true,
    consolidationStatus: 'bridge_live',
  }),
  '/section-8-notice-template': makeEntry('/section-8-notice-template', {
    ...section8TemplateEntry('/section-8-notice-template', '/section-8-eviction-process', {
      canonicalTarget: '/section-8-notice-template',
    }),
    pageRole: 'bridge',
    freshnessRequired: true,
    consolidationStatus: 'bridge_live',
  }),
  '/section-21-expired-what-next': makeEntry('/section-21-expired-what-next', {
    pageType: 'court',
    pageRole: 'bridge',
    jurisdiction: 'england',
    cluster: 'section-21-transition',
    primaryPillar: SEO_PILLAR_ROUTES.section21BanUk,
    supportingPage: '/section-21-notice-template',
    primaryProduct: SEO_PRODUCT_ROUTES.completePack,
    secondaryProduct: SEO_PRODUCT_ROUTES.noticeOnly,
    primaryProductByScenario: {
      notice: SEO_PRODUCT_ROUTES.noticeOnly,
      transition: SEO_PRODUCT_ROUTES.completePack,
    },
    canonicalTarget: '/section-21-expired-what-next',
    anchorVariants: {
      pillar: [...anchorSets.section21TransitionPillar],
      supporting: [
        'Section 21 notice template',
        'Section 21 validity checklist',
        'next steps after a Section 21 expires',
      ],
      product: [...anchorSets.completePackProduct],
    },
    section21TransitionEligible: true,
    freshnessRequired: true,
    consolidationStatus: 'bridge_live',
  }),
  '/possession-claim-guide': makeEntry('/possession-claim-guide', {
    pageType: 'court',
    pageRole: 'bridge',
    jurisdiction: 'england',
    cluster: 'court-process',
    primaryPillar: SEO_PILLAR_ROUTES.evictionProcessUk,
    supportingPage: '/n5b-possession-claim-guide',
    primaryProduct: SEO_PRODUCT_ROUTES.completePack,
    secondaryProduct: SEO_PRODUCT_ROUTES.noticeOnly,
    primaryProductByScenario: {
      notice: SEO_PRODUCT_ROUTES.noticeOnly,
    },
    canonicalTarget: '/possession-claim-guide',
    anchorVariants: {
      pillar: [...anchorSets.evictionProcessPillar],
      supporting: [
        'N5B possession claim guide',
        'court possession order guide',
        'possession claim paperwork guide',
      ],
      product: [...anchorSets.completePackProduct],
    },
    section21TransitionEligible: false,
    freshnessRequired: true,
    consolidationStatus: 'bridge_live',
  }),
  '/n5b-possession-claim-guide': makeEntry('/n5b-possession-claim-guide', {
    pageType: 'court',
    pageRole: 'bridge',
    jurisdiction: 'england',
    cluster: 'section-21-transition',
    primaryPillar: SEO_PILLAR_ROUTES.section21BanUk,
    supportingPage: '/section-21-expired-what-next',
    primaryProduct: SEO_PRODUCT_ROUTES.completePack,
    secondaryProduct: SEO_PRODUCT_ROUTES.noticeOnly,
    primaryProductByScenario: {
      notice: SEO_PRODUCT_ROUTES.noticeOnly,
      transition: SEO_PRODUCT_ROUTES.completePack,
    },
    canonicalTarget: '/n5b-possession-claim-guide',
    anchorVariants: {
      pillar: [...anchorSets.section21TransitionPillar],
      supporting: [
        'what to do when a Section 21 expires',
        'accelerated possession legacy route',
        'Section 21 possession claim next steps',
      ],
      product: [...anchorSets.completePackProduct],
    },
    section21TransitionEligible: true,
    freshnessRequired: true,
    consolidationStatus: 'bridge_live',
  }),
  '/renting-homes-wales-written-statement': makeEntry('/renting-homes-wales-written-statement', {
    ...regionalTenancyEntry('/renting-homes-wales-written-statement', 'wales', 'tenancy-wales', SEO_PILLAR_ROUTES.tenancyAgreementsWales, '/update-occupation-contract-wales', {
      canonicalTarget: '/renting-homes-wales-written-statement',
    }),
    pageType: 'guide',
    freshnessRequired: true,
    anchorVariants: {
      pillar: ['Wales tenancy agreement template', ...regionalTenancyAnchors.wales.pillar.slice(1)],
      supporting: [
        'updating a Wales occupation contract',
        'how to change terms in a Wales occupation contract',
        'occupation contract update guide for landlords',
      ],
      product: [
        'Wales tenancy agreement packs',
        ...regionalTenancyAnchors.wales.product.slice(1),
      ],
    },
  }),
  '/update-occupation-contract-wales': makeEntry('/update-occupation-contract-wales', {
    ...regionalTenancyEntry('/update-occupation-contract-wales', 'wales', 'tenancy-wales', SEO_PILLAR_ROUTES.tenancyAgreementsWales, '/renting-homes-wales-written-statement', {
      canonicalTarget: '/update-occupation-contract-wales',
    }),
    freshnessRequired: true,
    anchorVariants: {
      pillar: ['Wales occupation contract template', ...regionalTenancyAnchors.wales.pillar.slice(1)],
      supporting: [
        'Wales written statement requirements',
        'what landlords must give contract-holders in Wales',
        'written statement rules under Renting Homes Wales',
      ],
      product: [
        'update your Wales tenancy agreement pack',
        ...regionalTenancyAnchors.wales.product.slice(1),
      ],
    },
  }),
  '/joint-occupation-contract-wales': makeEntry('/joint-occupation-contract-wales', {
    ...regionalTenancyEntry('/joint-occupation-contract-wales', 'wales', 'tenancy-wales', SEO_PILLAR_ROUTES.tenancyAgreementsWales, '/update-occupation-contract-wales', {
      canonicalTarget: '/joint-occupation-contract-wales',
    }),
    freshnessRequired: true,
    anchorVariants: {
      pillar: ['Wales contract-holder agreement guide', ...regionalTenancyAnchors.wales.pillar.slice(1)],
      supporting: [
        'changing a Wales occupation contract',
        'updating contract-holder terms in Wales',
        'Wales occupation contract update guide',
      ],
      product: [
        'joint Wales tenancy agreement packs',
        ...regionalTenancyAnchors.wales.product.slice(1),
      ],
    },
  }),
  '/fixed-term-periodic-occupation-contract-wales': makeEntry('/fixed-term-periodic-occupation-contract-wales', {
    ...regionalTenancyEntry('/fixed-term-periodic-occupation-contract-wales', 'wales', 'tenancy-wales', SEO_PILLAR_ROUTES.tenancyAgreementsWales, '/update-occupation-contract-wales', {
      canonicalTarget: '/fixed-term-periodic-occupation-contract-wales',
    }),
    freshnessRequired: true,
    anchorVariants: {
      pillar: ['Wales tenancy agreement options', ...regionalTenancyAnchors.wales.pillar.slice(1)],
      supporting: [
        'updating a Wales occupation contract',
        'how Wales fixed-term contracts change over time',
        'occupation contract update route in Wales',
      ],
      product: [
        'Wales occupation contract packs',
        ...regionalTenancyAnchors.wales.product.slice(1),
      ],
    },
  }),
  '/scotland-prt-model-agreement-guide': makeEntry('/scotland-prt-model-agreement-guide', {
    ...regionalTenancyEntry('/scotland-prt-model-agreement-guide', 'scotland', 'tenancy-scotland', SEO_PILLAR_ROUTES.tenancyAgreementsScotland, '/update-prt-tenancy-agreement-scotland', {
      canonicalTarget: '/scotland-prt-model-agreement-guide',
    }),
    pageType: 'guide',
    freshnessRequired: true,
    anchorVariants: {
      pillar: ['Scotland PRT agreement template', ...regionalTenancyAnchors.scotland.pillar.slice(1)],
      supporting: [
        'updating a Scotland PRT agreement',
        'how to refresh PRT wording in Scotland',
        'PRT update guidance for Scottish landlords',
      ],
      product: [
        'Scotland PRT agreement packs',
        ...regionalTenancyAnchors.scotland.product.slice(1),
      ],
    },
  }),
  '/update-prt-tenancy-agreement-scotland': makeEntry('/update-prt-tenancy-agreement-scotland', {
    ...regionalTenancyEntry('/update-prt-tenancy-agreement-scotland', 'scotland', 'tenancy-scotland', SEO_PILLAR_ROUTES.tenancyAgreementsScotland, '/scotland-prt-model-agreement-guide', {
      canonicalTarget: '/update-prt-tenancy-agreement-scotland',
    }),
    freshnessRequired: true,
    anchorVariants: {
      pillar: ['Scotland PRT agreement guide', ...regionalTenancyAnchors.scotland.pillar.slice(1)],
      supporting: [
        'Scottish PRT model agreement guide',
        'government model agreement comparison',
        'Scotland model tenancy wording guide',
      ],
      product: [
        'update your Scotland PRT pack',
        ...regionalTenancyAnchors.scotland.product.slice(1),
      ],
    },
  }),
  '/joint-prt-tenancy-agreement-scotland': makeEntry('/joint-prt-tenancy-agreement-scotland', {
    ...regionalTenancyEntry('/joint-prt-tenancy-agreement-scotland', 'scotland', 'tenancy-scotland', SEO_PILLAR_ROUTES.tenancyAgreementsScotland, '/common-prt-tenancy-mistakes-scotland', {
      canonicalTarget: '/joint-prt-tenancy-agreement-scotland',
    }),
    freshnessRequired: true,
    anchorVariants: {
      pillar: ['Scotland PRT agreement route', ...regionalTenancyAnchors.scotland.pillar.slice(1)],
      supporting: [
        'common PRT compliance mistakes in Scotland',
        'Scottish landlord errors to avoid',
        'PRT compliance pitfalls for joint lets',
      ],
      product: [
        'joint Scotland tenancy agreement packs',
        ...regionalTenancyAnchors.scotland.product.slice(1),
      ],
    },
  }),
  '/common-prt-tenancy-mistakes-scotland': makeEntry('/common-prt-tenancy-mistakes-scotland', {
    ...regionalTenancyEntry('/common-prt-tenancy-mistakes-scotland', 'scotland', 'tenancy-scotland', SEO_PILLAR_ROUTES.tenancyAgreementsScotland, '/scotland-prt-model-agreement-guide', {
      canonicalTarget: '/common-prt-tenancy-mistakes-scotland',
    }),
    pageType: 'guide',
    freshnessRequired: true,
    anchorVariants: {
      pillar: ['Scotland tenancy agreement guide', ...regionalTenancyAnchors.scotland.pillar.slice(1)],
      supporting: [
        'Scottish PRT model agreement guide',
        'PRT wording gaps landlords should fix',
        'model agreement comparison for Scotland',
      ],
      product: [
        'compliant Scotland tenancy agreement packs',
        ...regionalTenancyAnchors.scotland.product.slice(1),
      ],
    },
  }),
  '/update-tenancy-agreement-northern-ireland': makeEntry('/update-tenancy-agreement-northern-ireland', {
    ...regionalTenancyEntry('/update-tenancy-agreement-northern-ireland', 'northern-ireland', 'tenancy-northern-ireland', SEO_PILLAR_ROUTES.tenancyAgreementsNorthernIreland, '/fixed-term-tenancy-agreement-northern-ireland', {
      canonicalTarget: '/update-tenancy-agreement-northern-ireland',
    }),
    freshnessRequired: true,
    anchorVariants: {
      pillar: ['Northern Ireland tenancy agreement guide', ...regionalTenancyAnchors['northern-ireland'].pillar.slice(1)],
      supporting: [
        'fixed-term tenancy agreements in Northern Ireland',
        'when NI tenancy terms need updating',
        'renewing or replacing an NI tenancy agreement',
      ],
      product: [
        'Northern Ireland tenancy agreement packs',
        ...regionalTenancyAnchors['northern-ireland'].product.slice(1),
      ],
    },
  }),
  '/joint-tenancy-agreement-northern-ireland': makeEntry('/joint-tenancy-agreement-northern-ireland', {
    ...regionalTenancyEntry('/joint-tenancy-agreement-northern-ireland', 'northern-ireland', 'tenancy-northern-ireland', SEO_PILLAR_ROUTES.tenancyAgreementsNorthernIreland, '/update-tenancy-agreement-northern-ireland', {
      canonicalTarget: '/joint-tenancy-agreement-northern-ireland',
    }),
    freshnessRequired: true,
    anchorVariants: {
      pillar: ['Northern Ireland private tenancy guide', ...regionalTenancyAnchors['northern-ireland'].pillar.slice(1)],
      supporting: [
        'updating a Northern Ireland tenancy agreement',
        'changing named tenants in Northern Ireland',
        'NI tenancy renewal and update guide',
      ],
      product: [
        'joint Northern Ireland tenancy packs',
        ...regionalTenancyAnchors['northern-ireland'].product.slice(1),
      ],
    },
  }),
  '/fixed-term-tenancy-agreement-northern-ireland': makeEntry('/fixed-term-tenancy-agreement-northern-ireland', {
    ...regionalTenancyEntry('/fixed-term-tenancy-agreement-northern-ireland', 'northern-ireland', 'tenancy-northern-ireland', SEO_PILLAR_ROUTES.tenancyAgreementsNorthernIreland, '/update-tenancy-agreement-northern-ireland', {
      canonicalTarget: '/fixed-term-tenancy-agreement-northern-ireland',
    }),
    freshnessRequired: true,
    anchorVariants: {
      pillar: ['Northern Ireland tenancy agreement options', ...regionalTenancyAnchors['northern-ireland'].pillar.slice(1)],
      supporting: [
        'updating a Northern Ireland tenancy agreement',
        'how NI fixed terms roll into periodic tenancies',
        'Northern Ireland tenancy update guide',
      ],
      product: [
        'fixed-term Northern Ireland tenancy packs',
        ...regionalTenancyAnchors['northern-ireland'].product.slice(1),
      ],
    },
  }),
  '/eviction-notice': makeEntry('/eviction-notice', {
    ...genericNoticeEntry('/eviction-notice', SEO_PILLAR_ROUTES.howToEvictTenant, {
      canonicalTarget: '/eviction-notice',
    }),
    pageRole: 'bridge',
    supportingPage: SEO_PILLAR_ROUTES.howToEvictTenant,
    freshnessRequired: true,
    consolidationStatus: 'canonical',
    anchorVariants: {
      pillar: [...anchorSets.evictionProcessPillar],
      supporting: [...anchorSets.howToEvictPillar],
      product: [...anchorSets.noticeOnlyProduct],
    },
  }),
  '/eviction-notice-template': makeEntry('/eviction-notice-template', {
    ...genericNoticeEntry('/eviction-notice-template', SEO_PILLAR_ROUTES.howToEvictTenant, {
      canonicalTarget: '/eviction-notice-template',
    }),
    pageRole: 'bridge',
    freshnessRequired: true,
    consolidationStatus: 'bridge_live',
    anchorVariants: {
      pillar: [...anchorSets.evictionProcessPillar],
      supporting: [...anchorSets.howToEvictPillar],
      product: [
        'jurisdiction-specific eviction notice workflow',
        ...anchorSets.noticeOnlyProduct.slice(1),
      ],
    },
  }),
  '/eviction-notice-england': makeEntry('/eviction-notice-england', {
    pageType: 'notice',
    pageRole: 'bridge',
    jurisdiction: 'england',
    cluster: 'section-21-transition',
    primaryPillar: SEO_PILLAR_ROUTES.section21BanUk,
    supportingPage: SEO_PILLAR_ROUTES.section21Notice,
    primaryProduct: SEO_PRODUCT_ROUTES.noticeOnly,
    secondaryProduct: SEO_PRODUCT_ROUTES.completePack,
    primaryProductByScenario: {
      notice: SEO_PRODUCT_ROUTES.noticeOnly,
      court: SEO_PRODUCT_ROUTES.completePack,
      transition: SEO_PRODUCT_ROUTES.completePack,
    },
    canonicalTarget: '/eviction-notice-england',
    anchorVariants: {
      pillar: [...anchorSets.section21TransitionPillar],
      supporting: [
        'Section 21 notice guide',
        'England notice route explainer',
        'when landlords still need legacy Section 21 context',
      ],
      product: [...anchorSets.noticeOnlyProduct],
    },
    section21TransitionEligible: true,
    freshnessRequired: true,
    consolidationStatus: 'bridge_live',
  }),
  '/section-21-notice-period': makeEntry('/section-21-notice-period', {
    pageType: 'notice',
    pageRole: 'bridge',
    jurisdiction: 'england',
    cluster: 'section-21-transition',
    primaryPillar: SEO_PILLAR_ROUTES.section21BanUk,
    supportingPage: SEO_PILLAR_ROUTES.section21Notice,
    primaryProduct: SEO_PRODUCT_ROUTES.noticeOnly,
    secondaryProduct: SEO_PRODUCT_ROUTES.completePack,
    primaryProductByScenario: {
      notice: SEO_PRODUCT_ROUTES.noticeOnly,
      court: SEO_PRODUCT_ROUTES.completePack,
      transition: SEO_PRODUCT_ROUTES.completePack,
    },
    canonicalTarget: '/section-21-notice-period',
    anchorVariants: {
      pillar: [...anchorSets.section21TransitionPillar],
      supporting: [
        'Section 21 notice guide',
        'legacy Section 21 timing rules',
        'when a Section 21 notice expires',
      ],
      product: [...anchorSets.noticeOnlyProduct],
    },
    section21TransitionEligible: true,
    freshnessRequired: true,
    consolidationStatus: 'bridge_live',
  }),
  '/section-8-vs-section-21': makeEntry('/section-8-vs-section-21', {
    pageType: 'problem',
    pageRole: 'bridge',
    jurisdiction: 'england',
    cluster: 'section-8',
    primaryPillar: SEO_PILLAR_ROUTES.section8Notice,
    supportingPage: SEO_PILLAR_ROUTES.section21BanUk,
    primaryProduct: SEO_PRODUCT_ROUTES.noticeOnly,
    secondaryProduct: SEO_PRODUCT_ROUTES.completePack,
    primaryProductByScenario: {
      notice: SEO_PRODUCT_ROUTES.noticeOnly,
      court: SEO_PRODUCT_ROUTES.completePack,
      transition: SEO_PRODUCT_ROUTES.completePack,
    },
    canonicalTarget: '/section-8-vs-section-21',
    anchorVariants: {
      pillar: [...anchorSets.section8Pillar],
      supporting: [...anchorSets.section21TransitionPillar],
      product: [...anchorSets.noticeOnlyProduct],
    },
    section21TransitionEligible: true,
    freshnessRequired: true,
    consolidationStatus: 'bridge_live',
  }),
  '/wales-eviction-notice-template': makeEntry('/wales-eviction-notice-template', {
    pageType: 'notice',
    pageRole: 'supporting',
    jurisdiction: 'wales',
    cluster: 'regional-eviction',
    primaryPillar: SEO_PILLAR_ROUTES.evictionProcessUk,
    supportingPage: SEO_PILLAR_ROUTES.howToEvictTenant,
    primaryProduct: SEO_PRODUCT_ROUTES.noticeOnly,
    secondaryProduct: SEO_PRODUCT_ROUTES.ast,
    primaryProductByScenario: {
      notice: SEO_PRODUCT_ROUTES.noticeOnly,
      tenancy: SEO_PRODUCT_ROUTES.ast,
    },
    canonicalTarget: '/wales-eviction-notice-template',
    anchorVariants: {
      pillar: [...anchorSets.evictionProcessPillar],
      supporting: [...anchorSets.howToEvictPillar],
      product: [
        'Wales possession notice workflow',
        'Renting Homes notice drafting workflow',
        'Wales notice route for landlords',
      ],
    },
    section21TransitionEligible: false,
    freshnessRequired: true,
    consolidationStatus: 'supporting_live',
  }),
  '/notice-to-quit-northern-ireland-guide': makeEntry('/notice-to-quit-northern-ireland-guide', {
    pageType: 'guide',
    pageRole: 'supporting',
    jurisdiction: 'northern-ireland',
    cluster: 'regional-eviction',
    primaryPillar: SEO_PILLAR_ROUTES.evictionProcessUk,
    supportingPage: SEO_PILLAR_ROUTES.howToEvictTenant,
    primaryProduct: SEO_PRODUCT_ROUTES.noticeOnly,
    secondaryProduct: SEO_PRODUCT_ROUTES.ast,
    primaryProductByScenario: {
      notice: SEO_PRODUCT_ROUTES.noticeOnly,
      tenancy: SEO_PRODUCT_ROUTES.ast,
    },
    canonicalTarget: '/notice-to-quit-northern-ireland-guide',
    anchorVariants: {
      pillar: [...anchorSets.evictionProcessPillar],
      supporting: [...anchorSets.howToEvictPillar],
      product: [
        'Northern Ireland notice to quit workflow',
        'NI notice drafting workflow for landlords',
        'Northern Ireland notice route',
      ],
    },
    section21TransitionEligible: false,
    freshnessRequired: true,
    consolidationStatus: 'supporting_live',
  }),
};

const LONGTAIL_REDIRECT_TAXONOMY: Record<string, SeoPageTaxonomyEntry> = {
  '/eviction-notice-uk': makeEntry('/eviction-notice-uk', {
    ...genericNoticeEntry('/eviction-notice-uk', '/eviction-notice-template', {
      canonicalTarget: '/eviction-notice-template',
    }),
    pageType: 'guide',
    freshnessRequired: true,
    anchorVariants: {
      pillar: [...anchorSets.evictionProcessPillar],
      supporting: [
        'eviction notice template UK',
        'jurisdiction-specific notice template guide',
        'UK notice route comparison',
      ],
      product: [...anchorSets.noticeOnlyProduct],
    },
    consolidationStatus: 'candidate_redirect',
  }),
  '/assured-shorthold-tenancy-agreement': makeEntry('/assured-shorthold-tenancy-agreement', {
    ...tenancyEntry('/assured-shorthold-tenancy-agreement', '/assured-shorthold-tenancy-agreement-template', {
      canonicalTarget: '/assured-shorthold-tenancy-agreement-template',
    }),
    consolidationStatus: 'candidate_redirect',
  }),
  '/ast-template-england': makeEntry('/ast-template-england', {
    ...tenancyEntry('/ast-template-england', '/assured-shorthold-tenancy-agreement-template', {
      canonicalTarget: '/assured-shorthold-tenancy-agreement-template',
    }),
    consolidationStatus: 'candidate_redirect',
  }),
  '/ast-tenancy-agreement-template': makeEntry('/ast-tenancy-agreement-template', {
    ...tenancyEntry('/ast-tenancy-agreement-template', '/assured-shorthold-tenancy-agreement-template', {
      canonicalTarget: '/assured-shorthold-tenancy-agreement-template',
    }),
    consolidationStatus: 'candidate_redirect',
  }),
  '/periodic-tenancy-agreement': makeEntry('/periodic-tenancy-agreement', {
    ...tenancyEntry('/periodic-tenancy-agreement', '/rolling-tenancy-agreement', {
      canonicalTarget: '/periodic-tenancy-agreement',
    }),
    consolidationStatus: 'bridge_live',
  }),
  '/tenancy-agreements/wales': makeEntry('/tenancy-agreements/wales', {
    ...regionalTenancyEntry('/tenancy-agreements/wales', 'wales', 'tenancy-wales', SEO_PILLAR_ROUTES.tenancyAgreementsWales, '/occupation-contract-template-wales', {
      canonicalTarget: SEO_PILLAR_ROUTES.tenancyAgreementsWales,
    }),
    consolidationStatus: 'candidate_redirect',
  }),
  '/standard-occupation-contract-wales': makeEntry('/standard-occupation-contract-wales', {
    ...regionalTenancyEntry('/standard-occupation-contract-wales', 'wales', 'tenancy-wales', SEO_PILLAR_ROUTES.tenancyAgreementsWales, '/occupation-contract-template-wales', {
      canonicalTarget: SEO_PILLAR_ROUTES.tenancyAgreementsWales,
    }),
    consolidationStatus: 'candidate_redirect',
  }),
  '/occupation-contract-template-wales': makeEntry('/occupation-contract-template-wales', {
    ...regionalTenancyEntry('/occupation-contract-template-wales', 'wales', 'tenancy-wales', SEO_PILLAR_ROUTES.tenancyAgreementsWales, '/renting-homes-wales-written-statement', {
      canonicalTarget: SEO_PILLAR_ROUTES.tenancyAgreementsWales,
    }),
    consolidationStatus: 'candidate_redirect',
  }),
  '/private-residential-tenancy-agreement-scotland': makeEntry('/private-residential-tenancy-agreement-scotland', {
    ...regionalTenancyEntry('/private-residential-tenancy-agreement-scotland', 'scotland', 'tenancy-scotland', SEO_PILLAR_ROUTES.tenancyAgreementsScotland, '/scotland-prt-model-agreement-guide', {
      canonicalTarget: SEO_PILLAR_ROUTES.tenancyAgreementsScotland,
    }),
    consolidationStatus: 'candidate_redirect',
  }),
  '/scottish-tenancy-agreement-template': makeEntry('/scottish-tenancy-agreement-template', {
    ...regionalTenancyEntry('/scottish-tenancy-agreement-template', 'scotland', 'tenancy-scotland', SEO_PILLAR_ROUTES.tenancyAgreementsScotland, '/scotland-prt-model-agreement-guide', {
      canonicalTarget: SEO_PILLAR_ROUTES.tenancyAgreementsScotland,
    }),
    consolidationStatus: 'candidate_redirect',
  }),
  '/prt-template-scotland': makeEntry('/prt-template-scotland', {
    ...regionalTenancyEntry('/prt-template-scotland', 'scotland', 'tenancy-scotland', SEO_PILLAR_ROUTES.tenancyAgreementsScotland, '/scotland-prt-model-agreement-guide', {
      canonicalTarget: SEO_PILLAR_ROUTES.tenancyAgreementsScotland,
    }),
    consolidationStatus: 'candidate_redirect',
  }),
  '/prt-tenancy-agreement-template-scotland': makeEntry('/prt-tenancy-agreement-template-scotland', {
    ...regionalTenancyEntry('/prt-tenancy-agreement-template-scotland', 'scotland', 'tenancy-scotland', SEO_PILLAR_ROUTES.tenancyAgreementsScotland, '/scotland-prt-model-agreement-guide', {
      canonicalTarget: SEO_PILLAR_ROUTES.tenancyAgreementsScotland,
    }),
    consolidationStatus: 'candidate_redirect',
  }),
  '/tenancy-agreements/scotland': makeEntry('/tenancy-agreements/scotland', {
    ...regionalTenancyEntry('/tenancy-agreements/scotland', 'scotland', 'tenancy-scotland', SEO_PILLAR_ROUTES.tenancyAgreementsScotland, '/scotland-prt-model-agreement-guide', {
      canonicalTarget: SEO_PILLAR_ROUTES.tenancyAgreementsScotland,
    }),
    consolidationStatus: 'candidate_redirect',
  }),
  '/tenancy-agreement-northern-ireland': makeEntry('/tenancy-agreement-northern-ireland', {
    ...regionalTenancyEntry('/tenancy-agreement-northern-ireland', 'northern-ireland', 'tenancy-northern-ireland', SEO_PILLAR_ROUTES.tenancyAgreementsNorthernIreland, '/tenancy-agreement-template-northern-ireland', {
      canonicalTarget: SEO_PILLAR_ROUTES.tenancyAgreementsNorthernIreland,
    }),
    consolidationStatus: 'candidate_redirect',
  }),
  '/tenancy-agreement-template-northern-ireland': makeEntry('/tenancy-agreement-template-northern-ireland', {
    ...regionalTenancyEntry('/tenancy-agreement-template-northern-ireland', 'northern-ireland', 'tenancy-northern-ireland', SEO_PILLAR_ROUTES.tenancyAgreementsNorthernIreland, '/tenancy-agreement-northern-ireland', {
      canonicalTarget: SEO_PILLAR_ROUTES.tenancyAgreementsNorthernIreland,
    }),
    consolidationStatus: 'candidate_redirect',
  }),
  '/tenancy-agreements/northern-ireland': makeEntry('/tenancy-agreements/northern-ireland', {
    ...regionalTenancyEntry('/tenancy-agreements/northern-ireland', 'northern-ireland', 'tenancy-northern-ireland', SEO_PILLAR_ROUTES.tenancyAgreementsNorthernIreland, '/tenancy-agreement-template-northern-ireland', {
      canonicalTarget: SEO_PILLAR_ROUTES.tenancyAgreementsNorthernIreland,
    }),
    consolidationStatus: 'candidate_redirect',
  }),
  '/ni-private-tenancy-agreement': makeEntry('/ni-private-tenancy-agreement', {
    ...regionalTenancyEntry('/ni-private-tenancy-agreement', 'northern-ireland', 'tenancy-northern-ireland', SEO_PILLAR_ROUTES.tenancyAgreementsNorthernIreland, '/tenancy-agreement-template-northern-ireland', {
      canonicalTarget: SEO_PILLAR_ROUTES.tenancyAgreementsNorthernIreland,
    }),
    consolidationStatus: 'candidate_redirect',
  }),
  '/ni-tenancy-agreement-template-free': makeEntry('/ni-tenancy-agreement-template-free', {
    ...regionalTenancyEntry('/ni-tenancy-agreement-template-free', 'northern-ireland', 'tenancy-northern-ireland', SEO_PILLAR_ROUTES.tenancyAgreementsNorthernIreland, '/tenancy-agreement-template-northern-ireland', {
      canonicalTarget: SEO_PILLAR_ROUTES.tenancyAgreementsNorthernIreland,
    }),
    consolidationStatus: 'candidate_redirect',
  }),
  '/warrant-of-possession': makeEntry('/warrant-of-possession', {
    ...processEntry('/warrant-of-possession', '/warrant-of-possession-guide', {
      canonicalTarget: '/warrant-of-possession-guide',
    }),
    cluster: 'court-process',
    consolidationStatus: 'candidate_redirect',
  }),
  '/n5b-form-guide': makeEntry('/n5b-form-guide', {
    ...section21TemplateEntry('/n5b-form-guide', '/section-21-expired-what-next', {
      canonicalTarget: '/n5b-possession-claim-guide',
    }),
    pageType: 'court',
    pageRole: 'product-adjacent',
    primaryProduct: SEO_PRODUCT_ROUTES.completePack,
    secondaryProduct: SEO_PRODUCT_ROUTES.noticeOnly,
    primaryProductByScenario: {
      court: SEO_PRODUCT_ROUTES.completePack,
      notice: SEO_PRODUCT_ROUTES.noticeOnly,
      transition: SEO_PRODUCT_ROUTES.completePack,
    },
    anchorVariants: {
      pillar: [...anchorSets.section21TransitionPillar],
      supporting: [
        'what to do after a Section 21 notice expires',
        'accelerated possession claim guide',
        'N5B possession claim guidance',
      ],
      product: [...anchorSets.completePackProduct],
    },
    consolidationStatus: 'candidate_redirect',
  }),
  '/n5b-possession-claim-form': makeEntry('/n5b-possession-claim-form', {
    ...section21TemplateEntry('/n5b-possession-claim-form', '/section-21-expired-what-next', {
      canonicalTarget: '/n5b-possession-claim-guide',
    }),
    pageType: 'court',
    pageRole: 'product-adjacent',
    consolidationStatus: 'candidate_redirect',
  }),
  '/section-21-checklist': makeEntry('/section-21-checklist', {
    ...section21TemplateEntry('/section-21-checklist', '/section-21-validity-checklist', {
      canonicalTarget: '/section-21-validity-checklist',
    }),
    pageType: 'guide',
    pageRole: 'product-adjacent',
    consolidationStatus: 'candidate_redirect',
  }),
  '/form-6a-section-21': makeEntry('/form-6a-section-21', {
    ...section21TemplateEntry('/form-6a-section-21', '/section-21-validity-checklist', {
      canonicalTarget: '/section-21-notice-template',
    }),
    pageRole: 'product-adjacent',
    consolidationStatus: 'candidate_redirect',
  }),
  '/form-3-section-8': makeEntry('/form-3-section-8', {
    ...section8TemplateEntry('/form-3-section-8', '/section-8-eviction-process', {
      canonicalTarget: '/section-8-notice-template',
    }),
    pageRole: 'product-adjacent',
    consolidationStatus: 'candidate_redirect',
  }),
  '/section-21-court-pack': productAdjacentRedirectEntry(
    '/section-21-court-pack',
    SEO_PILLAR_ROUTES.section21BanUk,
    '/section-21-expired-what-next',
    SEO_PRODUCT_ROUTES.completePack,
    SEO_PRODUCT_ROUTES.completePack,
    {
      pageType: 'court',
      section21TransitionEligible: true,
      anchorVariants: {
        pillar: [...anchorSets.section21TransitionPillar],
        supporting: [
          'what to do when a Section 21 expires',
          'Section 21 notice template',
          'Section 21 possession next steps',
        ],
        product: [...anchorSets.completePackProduct],
      },
    }
  ),
  '/section-8-court-pack': productAdjacentRedirectEntry(
    '/section-8-court-pack',
    SEO_PILLAR_ROUTES.section8Notice,
    '/section-8-eviction-process',
    SEO_PRODUCT_ROUTES.completePack,
    SEO_PRODUCT_ROUTES.completePack,
    {
      pageType: 'court',
      anchorVariants: {
        pillar: [...anchorSets.section8Pillar],
        supporting: [
          'Section 8 eviction process',
          'Section 8 notice template',
          'court route after serving Section 8',
        ],
        product: [...anchorSets.completePackProduct],
      },
    }
  ),
  '/section-8-rent-arrears-eviction': makeEntry('/section-8-rent-arrears-eviction', {
    ...section8Entry('/section-8-rent-arrears-eviction', '/section-8-eviction-process', {
      canonicalTarget: '/section-8-eviction-process',
    }),
    pageType: 'court',
    primaryProduct: SEO_PRODUCT_ROUTES.completePack,
    consolidationStatus: 'candidate_redirect',
  }),
  '/complete-eviction-pack-england': productAdjacentRedirectEntry(
    '/complete-eviction-pack-england',
    SEO_PILLAR_ROUTES.evictionProcessUk,
    '/possession-claim-guide',
    SEO_PRODUCT_ROUTES.completePack,
    SEO_PRODUCT_ROUTES.completePack
  ),
  '/eviction-pack-england': productAdjacentRedirectEntry(
    '/eviction-pack-england',
    SEO_PILLAR_ROUTES.evictionProcessUk,
    '/possession-claim-guide',
    SEO_PRODUCT_ROUTES.completePack,
    SEO_PRODUCT_ROUTES.completePack
  ),
  '/section-21-notice-generator': makeEntry('/section-21-notice-generator', {
    ...section21TemplateEntry('/section-21-notice-generator', '/section-21-validity-checklist', {
      canonicalTarget: '/section-21-notice-template',
    }),
    pageRole: 'product-adjacent',
    consolidationStatus: 'candidate_redirect',
  }),
  '/section-8-notice-generator': makeEntry('/section-8-notice-generator', {
    ...section8TemplateEntry('/section-8-notice-generator', '/section-8-eviction-process', {
      canonicalTarget: '/section-8-notice-template',
    }),
    pageRole: 'product-adjacent',
    consolidationStatus: 'candidate_redirect',
  }),
  '/no-fault-eviction': makeEntry('/no-fault-eviction', {
    ...section21TemplateEntry('/no-fault-eviction', '/section-21-notice-template', {
      canonicalTarget: SEO_PILLAR_ROUTES.section21BanUk,
    }),
    pageType: 'guide',
    pageRole: 'product-adjacent',
    consolidationStatus: 'candidate_redirect',
  }),
};

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
  [SEO_PILLAR_ROUTES.moneyClaim]: makeEntry(SEO_PILLAR_ROUTES.moneyClaim, {
    pageType: 'money',
    pageRole: 'pillar',
    jurisdiction: 'england',
    cluster: 'money-claim',
    primaryPillar: SEO_PILLAR_ROUTES.moneyClaim,
    supportingPage: '/money-claim-unpaid-rent',
    primaryProduct: SEO_PRODUCT_ROUTES.moneyClaim,
    secondaryProduct: SEO_PRODUCT_ROUTES.completePack,
    primaryProductByScenario: {
      arrears: SEO_PRODUCT_ROUTES.moneyClaim,
      court: SEO_PRODUCT_ROUTES.completePack,
    },
    canonicalTarget: SEO_PILLAR_ROUTES.moneyClaim,
    anchorVariants: {
      pillar: [...anchorSets.moneyClaimPillar],
      supporting: [
        'money claim for unpaid rent',
        'rent arrears debt recovery guide',
        'county court debt route for landlords',
      ],
      product: [...anchorSets.moneyClaimProduct],
    },
    section21TransitionEligible: false,
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
  [SEO_PILLAR_ROUTES.tenancyAgreementsEngland]: makeEntry(SEO_PILLAR_ROUTES.tenancyAgreementsEngland, {
    pageType: 'tenancy',
    pageRole: 'pillar',
    jurisdiction: 'england',
    cluster: 'tenancy-england',
    primaryPillar: SEO_PILLAR_ROUTES.tenancyAgreementsEngland,
    supportingPage: '/assured-periodic-tenancy-agreement',
    primaryProduct: SEO_PRODUCT_ROUTES.ast,
    canonicalTarget: SEO_PILLAR_ROUTES.tenancyAgreementsEngland,
    anchorVariants: {
      pillar: [...anchorSets.tenancyPillar],
      supporting: [...anchorSets.tenancySupporting],
      product: [...anchorSets.tenancyProduct],
    },
    section21TransitionEligible: true,
    freshnessRequired: true,
    consolidationStatus: 'canonical',
  }),
  '/tenancy-agreements': makeEntry('/tenancy-agreements', {
    pageType: 'tenancy',
    pageRole: 'hub',
    jurisdiction: 'uk',
    cluster: 'product-adjacent',
    primaryPillar: SEO_PILLAR_ROUTES.tenancyAgreementsEngland,
    supportingPage: SEO_PILLAR_ROUTES.tenancyAgreementsScotland,
    primaryProduct: SEO_PRODUCT_ROUTES.ast,
    canonicalTarget: '/tenancy-agreements',
    anchorVariants: {
      pillar: [...anchorSets.tenancyPillar],
      supporting: [...regionalTenancyAnchors.scotland.pillar],
      product: [...anchorSets.tenancyProduct],
    },
    section21TransitionEligible: false,
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
  '/how-to-evict-a-tenant-england': makeEntry('/how-to-evict-a-tenant-england', {
    pageType: 'guide',
    pageRole: 'bridge',
    jurisdiction: 'england',
    cluster: 'how-to-evict',
    primaryPillar: SEO_PILLAR_ROUTES.howToEvictTenant,
    supportingPage: SEO_PILLAR_ROUTES.evictionProcessUk,
    primaryProduct: SEO_PRODUCT_ROUTES.noticeOnly,
    secondaryProduct: SEO_PRODUCT_ROUTES.completePack,
    primaryProductByScenario: {
      notice: SEO_PRODUCT_ROUTES.noticeOnly,
      court: SEO_PRODUCT_ROUTES.completePack,
    },
    canonicalTarget: '/how-to-evict-a-tenant-england',
    anchorVariants: {
      pillar: [...anchorSets.howToEvictPillar],
      supporting: [...anchorSets.evictionProcessPillar],
      product: [...anchorSets.noticeOnlyProduct],
    },
    section21TransitionEligible: true,
    freshnessRequired: true,
    consolidationStatus: 'bridge_live',
  }),
  '/how-to-rent-guide': makeEntry('/how-to-rent-guide', {
    pageType: 'guide',
    pageRole: 'supporting',
    jurisdiction: 'england',
    cluster: 'section-21-transition',
    primaryPillar: SEO_PILLAR_ROUTES.section21BanUk,
    supportingPage: '/section-21-validity-checklist',
    primaryProduct: SEO_PRODUCT_ROUTES.noticeOnly,
    secondaryProduct: SEO_PRODUCT_ROUTES.ast,
    primaryProductByScenario: {
      notice: SEO_PRODUCT_ROUTES.noticeOnly,
      tenancy: SEO_PRODUCT_ROUTES.ast,
      transition: SEO_PRODUCT_ROUTES.completePack,
    },
    canonicalTarget: '/how-to-rent-guide',
    anchorVariants: {
      pillar: [...anchorSets.section21TransitionPillar],
      supporting: [
        'Section 21 validity checklist',
        'How to Rent compliance checklist',
        'Section 21 file review guide',
      ],
      product: [...anchorSets.noticeOnlyProduct],
    },
    section21TransitionEligible: true,
    freshnessRequired: true,
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
  '/rent-arrears-letter-template': makeEntry('/rent-arrears-letter-template', {
    pageType: 'money',
    pageRole: 'bridge',
    jurisdiction: 'uk',
    cluster: 'rent-arrears',
    primaryPillar: SEO_PILLAR_ROUTES.tenantNotPayingRent,
    supportingPage: '/money-claim-unpaid-rent',
    primaryProduct: SEO_PRODUCT_ROUTES.moneyClaim,
    secondaryProduct: SEO_PRODUCT_ROUTES.noticeOnly,
    primaryProductByScenario: {
      arrears: SEO_PRODUCT_ROUTES.moneyClaim,
      notice: SEO_PRODUCT_ROUTES.noticeOnly,
      court: SEO_PRODUCT_ROUTES.completePack,
    },
    canonicalTarget: '/rent-arrears-letter-template',
    anchorVariants: {
      pillar: [...anchorSets.rentArrearsPillar],
      supporting: [
        'money claim for unpaid rent',
        'letter before action for rent arrears',
        'court route for overdue rent',
      ],
      product: [...anchorSets.moneyClaimProduct],
    },
    section21TransitionEligible: false,
    freshnessRequired: true,
    consolidationStatus: 'bridge_live',
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
    ...moneyClaimEntry('/money-claim-unpaid-rent', SEO_PILLAR_ROUTES.tenantNotPayingRent, {
      canonicalTarget: '/money-claim-unpaid-rent',
    }),
    pageRole: 'bridge',
    supportingPage: SEO_PILLAR_ROUTES.tenantNotPayingRent,
    anchorVariants: {
      pillar: [...anchorSets.moneyClaimPillar],
      supporting: [...anchorSets.rentArrearsPillar],
      product: [...anchorSets.moneyClaimProduct],
    },
    freshnessRequired: true,
    consolidationStatus: 'bridge_live',
  }),
  '/money-claim-rent-arrears': makeEntry('/money-claim-rent-arrears', {
    ...moneyClaimEntry('/money-claim-rent-arrears', SEO_PILLAR_ROUTES.tenantNotPayingRent, {
      canonicalTarget: '/money-claim-unpaid-rent',
    }),
    consolidationStatus: 'candidate_redirect',
  }),
  '/claim-rent-arrears-tenant': makeEntry('/claim-rent-arrears-tenant', {
    ...moneyClaimEntry('/claim-rent-arrears-tenant', SEO_PILLAR_ROUTES.tenantNotPayingRent, {
      canonicalTarget: '/money-claim-unpaid-rent',
    }),
    consolidationStatus: 'candidate_redirect',
  }),
  '/how-to-sue-tenant-for-unpaid-rent': moneyClaimEntry('/how-to-sue-tenant-for-unpaid-rent', SEO_PILLAR_ROUTES.tenantNotPayingRent, {
    canonicalTarget: '/how-to-sue-tenant-for-unpaid-rent',
  }),
  '/money-claim-online-mcol': moneyClaimEntry('/money-claim-online-mcol', '/money-claim-letter-before-action', {
    canonicalTarget: '/money-claim-online-mcol',
    anchorVariants: {
      pillar: [...anchorSets.moneyClaimPillar],
      supporting: [
        'letter before action for rent arrears',
        'pre-action debt letter for landlords',
        'money claim pre-action steps',
      ],
      product: [...anchorSets.moneyClaimProduct],
    },
  }),
  '/mcol-money-claim-online': makeEntry('/mcol-money-claim-online', {
    ...moneyClaimEntry('/mcol-money-claim-online', '/money-claim-letter-before-action', {
      canonicalTarget: '/money-claim-online-mcol',
    }),
    consolidationStatus: 'candidate_redirect',
  }),
  '/money-claim-letter-before-action': moneyClaimEntry('/money-claim-letter-before-action', '/money-claim-schedule-of-debt', {
    canonicalTarget: '/money-claim-letter-before-action',
    anchorVariants: {
      pillar: [...anchorSets.moneyClaimPillar],
      supporting: [
        'schedule of debt for rent arrears',
        'rent arrears debt schedule',
        'court-ready arrears schedule',
      ],
      product: [...anchorSets.moneyClaimProduct],
    },
  }),
  '/money-claim-n1-claim-form': moneyClaimEntry('/money-claim-n1-claim-form', '/money-claim-online-mcol', {
    canonicalTarget: '/money-claim-n1-claim-form',
  }),
  '/money-claim-schedule-of-debt': moneyClaimEntry('/money-claim-schedule-of-debt', '/money-claim-letter-before-action', {
    canonicalTarget: '/money-claim-schedule-of-debt',
  }),
  '/money-claim-pap-financial-statement': moneyClaimEntry('/money-claim-pap-financial-statement', '/money-claim-letter-before-action', {
    canonicalTarget: '/money-claim-pap-financial-statement',
  }),
  '/money-claim-property-damage': moneyClaimEntry('/money-claim-property-damage', '/can-you-evict-a-tenant-for-property-damage', {
    canonicalTarget: '/money-claim-property-damage',
    anchorVariants: {
      pillar: [...anchorSets.moneyClaimPillar],
      supporting: [
        'evict a tenant for property damage',
        'property damage possession guide',
        'tenant damage evidence guide',
      ],
      product: [...anchorSets.moneyClaimProduct],
    },
  }),
  '/money-claim-cleaning-costs': moneyClaimEntry('/money-claim-cleaning-costs', '/money-claim-property-damage', {
    canonicalTarget: '/money-claim-cleaning-costs',
  }),
  '/money-claim-unpaid-utilities': moneyClaimEntry('/money-claim-unpaid-utilities', SEO_PILLAR_ROUTES.tenantNotPayingRent, {
    canonicalTarget: '/money-claim-unpaid-utilities',
  }),
  '/money-claim-unpaid-bills': moneyClaimEntry('/money-claim-unpaid-bills', '/money-claim-unpaid-utilities', {
    canonicalTarget: '/money-claim-unpaid-bills',
  }),
  '/money-claim-council-tax': moneyClaimEntry('/money-claim-council-tax', '/money-claim-unpaid-utilities', {
    canonicalTarget: '/money-claim-council-tax',
  }),
  '/money-claim-guarantor': moneyClaimEntry('/money-claim-guarantor', SEO_PILLAR_ROUTES.tenantNotPayingRent, {
    canonicalTarget: '/money-claim-guarantor',
  }),
  '/money-claim-former-tenant': moneyClaimEntry('/money-claim-former-tenant', SEO_PILLAR_ROUTES.tenantNotPayingRent, {
    canonicalTarget: '/money-claim-former-tenant',
  }),
  '/money-claim-deposit-shortfall': moneyClaimEntry('/money-claim-deposit-shortfall', '/money-claim-property-damage', {
    canonicalTarget: '/money-claim-deposit-shortfall',
  }),
  '/money-claim-early-termination': moneyClaimEntry('/money-claim-early-termination', SEO_PILLAR_ROUTES.tenantNotPayingRent, {
    canonicalTarget: '/money-claim-early-termination',
  }),
  '/money-claim-abandoned-goods': moneyClaimEntry('/money-claim-abandoned-goods', '/money-claim-cleaning-costs', {
    canonicalTarget: '/money-claim-abandoned-goods',
  }),
  '/money-claim-carpet-damage': moneyClaimEntry('/money-claim-carpet-damage', '/money-claim-property-damage', {
    canonicalTarget: '/money-claim-carpet-damage',
  }),
  '/money-claim-appliance-damage': moneyClaimEntry('/money-claim-appliance-damage', '/money-claim-property-damage', {
    canonicalTarget: '/money-claim-appliance-damage',
  }),
  '/money-claim-wall-damage': moneyClaimEntry('/money-claim-wall-damage', '/money-claim-property-damage', {
    canonicalTarget: '/money-claim-wall-damage',
  }),
  '/money-claim-bathroom-damage': moneyClaimEntry('/money-claim-bathroom-damage', '/money-claim-property-damage', {
    canonicalTarget: '/money-claim-bathroom-damage',
  }),
  '/money-claim-garden-damage': moneyClaimEntry('/money-claim-garden-damage', '/money-claim-property-damage', {
    canonicalTarget: '/money-claim-garden-damage',
  }),
  '/money-claim-ccj-enforcement': moneyClaimEntry('/money-claim-ccj-enforcement', '/money-claim-online-mcol', {
    canonicalTarget: '/money-claim-ccj-enforcement',
  }),
  '/money-claim-small-claims-landlord': moneyClaimEntry('/money-claim-small-claims-landlord', '/money-claim-online-mcol', {
    canonicalTarget: '/money-claim-small-claims-landlord',
  }),
  '/money-claim-tenant-defends': moneyClaimEntry('/money-claim-tenant-defends', '/money-claim-online-mcol', {
    canonicalTarget: '/money-claim-tenant-defends',
  }),
  '/section-21-validity-checklist': makeEntry('/section-21-validity-checklist', {
    ...section21Entry('/section-21-validity-checklist', SEO_PILLAR_ROUTES.section21Notice, {
      canonicalTarget: '/section-21-validity-checklist',
    }),
    pageRole: 'bridge',
    freshnessRequired: true,
    consolidationStatus: 'bridge_live',
  }),
  '/serve-section-21-notice': makeEntry('/serve-section-21-notice', {
    ...section21Entry('/serve-section-21-notice', SEO_PILLAR_ROUTES.section21Notice, {
      canonicalTarget: '/serve-section-21-notice',
    }),
    pageType: 'notice',
    pageRole: 'bridge',
    freshnessRequired: true,
    consolidationStatus: 'bridge_live',
  }),
  '/eicr-landlord-requirements': makeEntry('/eicr-landlord-requirements', {
    ...section21Entry('/eicr-landlord-requirements', SEO_PILLAR_ROUTES.section21Notice, {
      canonicalTarget: '/eicr-landlord-requirements',
      primaryProductByScenario: {
        notice: SEO_PRODUCT_ROUTES.noticeOnly,
        transition: SEO_PRODUCT_ROUTES.completePack,
      },
      anchorVariants: {
        pillar: [...anchorSets.section21TransitionPillar],
        supporting: [
          'Section 21 notice guide',
          'Section 21 validity requirements',
          'post-ban possession route for landlords',
        ],
        product: [...anchorSets.noticeOnlyProduct],
      },
    }),
    primaryProduct: SEO_PRODUCT_ROUTES.noticeOnly,
    secondaryProduct: SEO_PRODUCT_ROUTES.completePack,
    freshnessRequired: true,
  }),
  '/section-21-vs-section-8': makeEntry('/section-21-vs-section-8', {
    ...section21Entry('/section-21-vs-section-8', SEO_PILLAR_ROUTES.section8Notice, {
      canonicalTarget: '/section-21-vs-section-8',
    }),
    freshnessRequired: true,
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
  '/tenant-refusing-inspection': makeEntry('/tenant-refusing-inspection', {
    ...processEntry('/tenant-refusing-inspection', '/tenant-refusing-access', {
      canonicalTarget: '/tenant-refusing-access',
      primaryProductByScenario: {
        notice: SEO_PRODUCT_ROUTES.noticeOnly,
        court: SEO_PRODUCT_ROUTES.completePack,
      },
    }),
    pageType: 'problem',
    pageRole: 'bridge',
    cluster: 'tenant-problems',
    primaryPillar: SEO_PILLAR_ROUTES.howToEvictTenant,
    supportingPage: '/tenant-refusing-access',
    primaryProduct: SEO_PRODUCT_ROUTES.noticeOnly,
    secondaryProduct: SEO_PRODUCT_ROUTES.completePack,
    anchorVariants: {
      pillar: [...anchorSets.howToEvictPillar],
      supporting: [
        'tenant refusing access guide',
        'landlord access rights explained',
        'inspection access evidence steps',
      ],
      product: [...anchorSets.noticeOnlyProduct],
    },
    freshnessRequired: true,
    consolidationStatus: 'candidate_redirect',
  }),
  '/tenant-refuses-to-leave-after-notice': makeEntry('/tenant-refuses-to-leave-after-notice', {
    ...processEntry('/tenant-refuses-to-leave-after-notice', SEO_PILLAR_ROUTES.howToEvictTenant, {
      canonicalTarget: '/tenant-refuses-to-leave-after-notice',
      primaryProductByScenario: {
        notice: SEO_PRODUCT_ROUTES.noticeOnly,
        court: SEO_PRODUCT_ROUTES.completePack,
      },
    }),
    pageType: 'problem',
    pageRole: 'bridge',
    cluster: 'tenant-problems',
    primaryPillar: SEO_PILLAR_ROUTES.evictionProcessUk,
    supportingPage: SEO_PILLAR_ROUTES.howToEvictTenant,
    primaryProduct: SEO_PRODUCT_ROUTES.completePack,
    secondaryProduct: SEO_PRODUCT_ROUTES.noticeOnly,
    anchorVariants: {
      pillar: [...anchorSets.evictionProcessPillar],
      supporting: [...anchorSets.howToEvictPillar],
      product: [...anchorSets.completePackProduct],
    },
    freshnessRequired: true,
    consolidationStatus: 'bridge_live',
  }),
  '/tenant-wont-leave': makeEntry('/tenant-wont-leave', {
    ...processEntry('/tenant-wont-leave', '/tenant-refuses-to-leave-after-notice', {
      canonicalTarget: '/tenant-refuses-to-leave-after-notice',
      primaryProductByScenario: {
        notice: SEO_PRODUCT_ROUTES.noticeOnly,
        court: SEO_PRODUCT_ROUTES.completePack,
      },
    }),
    pageType: 'problem',
    pageRole: 'bridge',
    cluster: 'tenant-problems',
    primaryPillar: SEO_PILLAR_ROUTES.evictionProcessUk,
    supportingPage: '/tenant-refuses-to-leave-after-notice',
    primaryProduct: SEO_PRODUCT_ROUTES.completePack,
    secondaryProduct: SEO_PRODUCT_ROUTES.noticeOnly,
    anchorVariants: {
      pillar: [...anchorSets.evictionProcessPillar],
      supporting: [
        'tenant refuses to leave after notice',
        'post-notice possession guide',
        'what landlords do when notice expires',
      ],
      product: [...anchorSets.completePackProduct],
    },
    freshnessRequired: true,
    consolidationStatus: 'candidate_redirect',
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
  '/scotland-notice-to-leave-template': makeEntry('/scotland-notice-to-leave-template', {
    pageType: 'notice',
    pageRole: 'supporting',
    jurisdiction: 'scotland',
    cluster: 'regional-eviction',
    primaryPillar: SEO_PILLAR_ROUTES.evictionProcessUk,
    supportingPage: '/scotland-eviction-notices',
    primaryProduct: SEO_PRODUCT_ROUTES.noticeOnly,
    secondaryProduct: SEO_PRODUCT_ROUTES.ast,
    primaryProductByScenario: {
      notice: SEO_PRODUCT_ROUTES.noticeOnly,
      tenancy: SEO_PRODUCT_ROUTES.ast,
    },
    canonicalTarget: '/scotland-notice-to-leave-template',
    anchorVariants: {
      pillar: [...anchorSets.evictionProcessPillar],
      supporting: [
        'Scotland eviction notices',
        'Notice to Leave process in Scotland',
        'Scottish possession notice guide',
      ],
      product: [...anchorSets.noticeOnlyProduct],
    },
    section21TransitionEligible: false,
    freshnessRequired: true,
    consolidationStatus: 'supporting_live',
  }),
  '/tenant-breach-of-tenancy': makeEntry('/tenant-breach-of-tenancy', {
    ...section8Entry('/tenant-breach-of-tenancy', SEO_PILLAR_ROUTES.howToEvictTenant, {
      canonicalTarget: '/tenant-breach-of-tenancy',
    }),
    pageType: 'problem',
    pageRole: 'bridge',
    cluster: 'tenant-problems',
    supportingPage: SEO_PILLAR_ROUTES.howToEvictTenant,
    anchorVariants: {
      pillar: [...anchorSets.section8Pillar],
      supporting: [...anchorSets.howToEvictPillar],
      product: [...anchorSets.section8NoticeProduct],
    },
    freshnessRequired: true,
    consolidationStatus: 'bridge_live',
  }),
  '/tenant-subletting-without-permission': makeEntry('/tenant-subletting-without-permission', {
    ...section8Entry('/tenant-subletting-without-permission', SEO_PILLAR_ROUTES.howToEvictTenant, {
      canonicalTarget: '/tenant-subletting-without-permission',
    }),
    pageType: 'problem',
    pageRole: 'bridge',
    cluster: 'tenant-problems',
    supportingPage: SEO_PILLAR_ROUTES.howToEvictTenant,
    anchorVariants: {
      pillar: [...anchorSets.section8Pillar],
      supporting: [
        'how to evict a tenant legally',
        'unauthorised subletting landlord guide',
        'tenancy breach evidence steps',
      ],
      product: [...anchorSets.section8NoticeProduct],
    },
    freshnessRequired: true,
    consolidationStatus: 'bridge_live',
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
  '/apply-possession-order-landlord': makeEntry('/apply-possession-order-landlord', {
    ...processEntry('/apply-possession-order-landlord', '/possession-claim-guide', {
      canonicalTarget: '/apply-possession-order-landlord',
    }),
    cluster: 'court-process',
    supportingPage: '/possession-claim-guide',
    anchorVariants: {
      pillar: [...anchorSets.evictionProcessPillar],
      supporting: [
        'possession claim guide',
        'how landlords apply for a possession order',
        'court possession paperwork guide',
      ],
      product: [...anchorSets.completePackProduct],
    },
  }),
  '/county-court-claim-form-guide': makeEntry('/county-court-claim-form-guide', {
    ...processEntry('/county-court-claim-form-guide', '/possession-order-process', {
      canonicalTarget: '/county-court-claim-form-guide',
    }),
    pageType: 'guide',
    pageRole: 'bridge',
    jurisdiction: 'uk',
    cluster: 'court-process',
    supportingPage: '/possession-order-process',
    secondaryProduct: SEO_PRODUCT_ROUTES.moneyClaim,
    primaryProductByScenario: {
      court: SEO_PRODUCT_ROUTES.completePack,
      notice: SEO_PRODUCT_ROUTES.noticeOnly,
      arrears: SEO_PRODUCT_ROUTES.moneyClaim,
    },
    anchorVariants: {
      pillar: [...anchorSets.evictionProcessPillar],
      supporting: [
        'possession order process',
        'court-stage possession workflow',
        'what happens after notice in court',
      ],
      product: [...anchorSets.completePackProduct],
    },
    freshnessRequired: true,
    consolidationStatus: 'bridge_live',
  }),
  '/eviction-cost-uk': makeEntry('/eviction-cost-uk', {
    ...processEntry('/eviction-cost-uk', SEO_PILLAR_ROUTES.tenantNotPayingRent, {
      canonicalTarget: '/eviction-cost-uk',
    }),
    pageType: 'guide',
    pageRole: 'bridge',
    jurisdiction: 'uk',
    cluster: 'court-process',
    supportingPage: SEO_PILLAR_ROUTES.tenantNotPayingRent,
    secondaryProduct: SEO_PRODUCT_ROUTES.moneyClaim,
    primaryProductByScenario: {
      court: SEO_PRODUCT_ROUTES.completePack,
      notice: SEO_PRODUCT_ROUTES.noticeOnly,
      arrears: SEO_PRODUCT_ROUTES.moneyClaim,
    },
    anchorVariants: {
      pillar: [...anchorSets.evictionProcessPillar],
      supporting: [...anchorSets.rentArrearsPillar],
      product: [...anchorSets.completePackProduct],
    },
    freshnessRequired: true,
    consolidationStatus: 'bridge_live',
  }),
  '/eviction-court-forms-england': makeEntry('/eviction-court-forms-england', {
    ...processEntry('/eviction-court-forms-england', '/n5-n119-possession-claim', {
      canonicalTarget: '/eviction-court-forms-england',
    }),
    pageRole: 'bridge',
    cluster: 'court-process',
    supportingPage: '/n5-n119-possession-claim',
    primaryProductByScenario: {
      court: SEO_PRODUCT_ROUTES.completePack,
      notice: SEO_PRODUCT_ROUTES.noticeOnly,
    },
    anchorVariants: {
      pillar: [...anchorSets.evictionProcessPillar],
      supporting: [
        'N5 and N119 possession claim guide',
        'standard possession claim route',
        'landlord court paperwork guide',
      ],
      product: [...anchorSets.completePackProduct],
    },
    freshnessRequired: true,
    consolidationStatus: 'bridge_live',
  }),
  '/eviction-timeline-england': makeEntry('/eviction-timeline-england', {
    ...processEntry('/eviction-timeline-england', SEO_PILLAR_ROUTES.howToEvictTenant, {
      canonicalTarget: '/eviction-timeline-england',
    }),
    pageType: 'guide',
    pageRole: 'bridge',
    cluster: 'court-process',
    primaryProduct: SEO_PRODUCT_ROUTES.completePack,
    secondaryProduct: SEO_PRODUCT_ROUTES.noticeOnly,
    supportingPage: SEO_PILLAR_ROUTES.howToEvictTenant,
    primaryProductByScenario: {
      court: SEO_PRODUCT_ROUTES.completePack,
      notice: SEO_PRODUCT_ROUTES.noticeOnly,
    },
    anchorVariants: {
      pillar: [...anchorSets.evictionProcessPillar],
      supporting: [...anchorSets.howToEvictPillar],
      product: [...anchorSets.completePackProduct],
    },
    freshnessRequired: true,
    consolidationStatus: 'bridge_live',
  }),
  '/n5-n119-possession-claim': makeEntry('/n5-n119-possession-claim', {
    ...processEntry('/n5-n119-possession-claim', SEO_PILLAR_ROUTES.section8Notice, {
      canonicalTarget: '/n5-n119-possession-claim',
    }),
    pageRole: 'bridge',
    cluster: 'court-process',
    supportingPage: SEO_PILLAR_ROUTES.section8Notice,
    primaryProductByScenario: {
      court: SEO_PRODUCT_ROUTES.completePack,
      notice: SEO_PRODUCT_ROUTES.noticeOnly,
    },
    anchorVariants: {
      pillar: [...anchorSets.evictionProcessPillar],
      supporting: [...anchorSets.section8Pillar],
      product: [...anchorSets.completePackProduct],
    },
    freshnessRequired: true,
    consolidationStatus: 'bridge_live',
  }),
  '/possession-order-process': makeEntry('/possession-order-process', {
    ...processEntry('/possession-order-process', '/eviction-court-forms-england', {
      canonicalTarget: '/possession-order-process',
    }),
    pageRole: 'bridge',
    cluster: 'court-process',
    supportingPage: '/eviction-court-forms-england',
    primaryProductByScenario: {
      court: SEO_PRODUCT_ROUTES.completePack,
      notice: SEO_PRODUCT_ROUTES.noticeOnly,
    },
    anchorVariants: {
      pillar: [...anchorSets.evictionProcessPillar],
      supporting: [
        'eviction court forms explained',
        'court form route for landlords',
        'possession claim paperwork guide',
      ],
      product: [...anchorSets.completePackProduct],
    },
    freshnessRequired: true,
    consolidationStatus: 'bridge_live',
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
  '/court-bailiff-eviction-guide': makeEntry('/court-bailiff-eviction-guide', {
    ...processEntry('/court-bailiff-eviction-guide', '/bailiff-eviction-process', {
      canonicalTarget: '/bailiff-eviction-process',
    }),
    pageType: 'guide',
    cluster: 'court-process',
    supportingPage: '/bailiff-eviction-process',
    anchorVariants: {
      pillar: [...anchorSets.evictionProcessPillar],
      supporting: [
        'bailiff eviction process',
        'county court enforcement stage',
        'what happens after a possession order',
      ],
      product: [...anchorSets.completePackProduct],
    },
    freshnessRequired: true,
    consolidationStatus: 'candidate_redirect',
  }),
  '/eviction-timeline-uk': makeEntry('/eviction-timeline-uk', {
    ...processEntry('/eviction-timeline-uk', '/how-long-does-eviction-take', {
      canonicalTarget: '/how-long-does-eviction-take',
    }),
    pageType: 'guide',
    jurisdiction: 'uk',
    cluster: 'court-process',
    primaryProduct: SEO_PRODUCT_ROUTES.completePack,
    secondaryProduct: SEO_PRODUCT_ROUTES.noticeOnly,
    supportingPage: '/how-long-does-eviction-take',
    primaryProductByScenario: {
      court: SEO_PRODUCT_ROUTES.completePack,
      notice: SEO_PRODUCT_ROUTES.noticeOnly,
    },
    anchorVariants: {
      pillar: [...anchorSets.evictionProcessPillar],
      supporting: [
        'how long eviction takes',
        'UK eviction timescale guide',
        'landlord eviction timeline guide',
      ],
      product: [...anchorSets.completePackProduct],
    },
    freshnessRequired: true,
    consolidationStatus: 'candidate_redirect',
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
  '/tenancy-agreement': makeEntry('/tenancy-agreement', {
    ...tenancyEntry('/tenancy-agreement', '/products/ast', {
      canonicalTarget: '/products/ast',
    }),
    pageRole: 'bridge',
    freshnessRequired: true,
    consolidationStatus: 'candidate_redirect',
  }),
  '/premium-tenancy-agreement': makeEntry('/premium-tenancy-agreement', {
    ...tenancyEntry('/premium-tenancy-agreement', '/products/ast', {
      canonicalTarget: '/premium-tenancy-agreement',
    }),
    pageRole: 'bridge',
    freshnessRequired: true,
    consolidationStatus: 'bridge_live',
  }),
  '/tenancy-agreement-template': makeEntry('/tenancy-agreement-template', {
    ...tenancyEntry('/tenancy-agreement-template', SEO_PILLAR_ROUTES.section21BanUk, {
      canonicalTarget: '/tenancy-agreement-template',
    }),
    anchorVariants: {
      pillar: [...anchorSets.tenancyPillar],
      supporting: [...anchorSets.tenancyTransitionSupporting],
      product: [...anchorSets.tenancyProduct],
    },
  }),
  '/tenancy-agreement-template-free': makeEntry('/tenancy-agreement-template-free', {
    ...tenancyEntry('/tenancy-agreement-template-free', '/tenancy-agreement-template', {
      canonicalTarget: '/tenancy-agreement-template-free',
    }),
    anchorVariants: {
      pillar: [...anchorSets.tenancyPillar],
      supporting: [
        'paid tenancy agreement template for landlords',
        'guided tenancy agreement template',
        'updated England agreement template route',
      ],
      product: [...anchorSets.tenancyProduct],
    },
  }),
  '/assured-shorthold-tenancy-agreement-template': makeEntry('/assured-shorthold-tenancy-agreement-template', {
    ...tenancyEntry('/assured-shorthold-tenancy-agreement-template', SEO_PILLAR_ROUTES.section21BanUk, {
      canonicalTarget: '/assured-shorthold-tenancy-agreement-template',
    }),
    anchorVariants: {
      pillar: [...anchorSets.tenancyPillar],
      supporting: [...anchorSets.tenancyTransitionSupporting],
      product: [...anchorSets.tenancyProduct],
    },
  }),
  '/6-month-tenancy-agreement-template': tenancyEntry('/6-month-tenancy-agreement-template', '/tenancy-agreement-template', {
    canonicalTarget: '/6-month-tenancy-agreement-template',
  }),
  '/fixed-term-tenancy-agreement-template': tenancyEntry('/fixed-term-tenancy-agreement-template', '/tenancy-agreement-template', {
    canonicalTarget: '/fixed-term-tenancy-agreement-template',
  }),
  '/fixed-term-periodic-tenancy-england': tenancyEntry('/fixed-term-periodic-tenancy-england', '/periodic-tenancy-agreement', {
    canonicalTarget: '/fixed-term-periodic-tenancy-england',
  }),
  '/joint-tenancy-agreement-england': tenancyEntry('/joint-tenancy-agreement-england', '/premium-tenancy-agreement', {
    canonicalTarget: '/joint-tenancy-agreement-england',
  }),
  '/joint-tenancy-agreement-template': tenancyEntry('/joint-tenancy-agreement-template', '/premium-tenancy-agreement', {
    canonicalTarget: '/joint-tenancy-agreement-template',
  }),
  '/renew-tenancy-agreement-england': tenancyEntry('/renew-tenancy-agreement-england', '/tenancy-agreement', {
    canonicalTarget: '/renew-tenancy-agreement-england',
  }),
  '/rolling-tenancy-agreement': tenancyEntry('/rolling-tenancy-agreement', '/periodic-tenancy-agreement', {
    canonicalTarget: '/rolling-tenancy-agreement',
  }),
  '/renters-rights-bill-tenancy-agreement': makeEntry('/renters-rights-bill-tenancy-agreement', {
    ...tenancyEntry('/renters-rights-bill-tenancy-agreement', SEO_PILLAR_ROUTES.section21BanUk, {
      canonicalTarget: '/renters-rights-bill-tenancy-agreement',
    }),
    anchorVariants: {
      pillar: [...anchorSets.tenancyPillar],
      supporting: [...anchorSets.tenancyTransitionSupporting],
      product: [...anchorSets.tenancyProduct],
    },
  }),
  '/wales-eviction-notices': regionalEntry('/wales-eviction-notices', 'wales', SEO_PILLAR_ROUTES.evictionProcessUk),
  '/scotland-eviction-notices': regionalEntry('/scotland-eviction-notices', 'scotland', SEO_PILLAR_ROUTES.evictionProcessUk),
  '/eviction-process-wales': regionalEntry('/eviction-process-wales', 'wales', SEO_PILLAR_ROUTES.evictionProcessUk),
  '/eviction-process-scotland': regionalEntry('/eviction-process-scotland', 'scotland', SEO_PILLAR_ROUTES.evictionProcessUk),
  ...LONGTAIL_LIVE_TAXONOMY,
  ...LONGTAIL_REDIRECT_TAXONOMY,
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

export function getRetainedSeoPageTaxonomyEntries(): SeoPageTaxonomyEntry[] {
  return getAllSeoPageTaxonomyEntries().filter(
    (entry) => entry.consolidationStatus !== 'candidate_redirect'
  );
}

export function getFreshnessPolicy(entry: SeoPageTaxonomyEntry): FreshnessPolicy | null {
  if (!entry.freshnessRequired) {
    return null;
  }

  const defaultPolicy = defaultFreshnessPolicyByJurisdiction[entry.jurisdiction];
  let legalContextNote: string;

  if (entry.cluster === 'tenancy-england') {
    legalContextNote =
      'England tenancy pages should reflect the post-Renters Rights Act 2025 wording used for new agreements, the current Residential Tenancy Agreement positioning, and the wider shift away from older Section 21-led AST sales language.';
  } else if (entry.cluster === 'tenancy-wales') {
    legalContextNote =
      'Wales tenancy pages should reflect the Renting Homes (Wales) Act 2016, occupation contract terminology, the written statement deadline, and the distinct Welsh possession notice framework.';
  } else if (entry.cluster === 'tenancy-scotland') {
    legalContextNote =
      'Scotland tenancy pages should reflect the Private Housing (Tenancies) (Scotland) Act 2016, open-ended PRT rules, tribunal-led possession, and the current Scottish compliance framework.';
  } else if (entry.cluster === 'tenancy-northern-ireland') {
    legalContextNote =
      'Northern Ireland tenancy pages should reflect the Private Tenancies Act (Northern Ireland) 2022, written statement requirements, deposit and notice rules, and the current NI compliance timetable.';
  } else if (entry.cluster === 'money-claim') {
    legalContextNote =
      'Debt recovery is separate from possession. Landlords should review the current pre-action protocol, keep a reconciled debt schedule, and make sure any county court claim matches the evidence file and the amount being claimed.';
  } else if (entry.cluster === 'notice-templates') {
    legalContextNote =
      'Template-led notice pages should be read with the current statutory form version, route-specific validity checks, and the wider landlord workflow needed if the case moves into court.';
  } else if (entry.section21TransitionEligible) {
    legalContextNote =
      'Section 21 ended in England on 1 May 2026, and court proceedings on qualifying older Section 21 notices had to begin by 31 July 2026. Landlords now need a Section 8-led possession plan unless a transitional legacy route is clearly available.';
  } else if (entry.jurisdiction === 'uk') {
    legalContextNote =
      'This page targets UK search intent, but possession rules differ across England, Wales, Scotland, and Northern Ireland.';
  } else {
    legalContextNote = `This guide is written for ${defaultPolicy.jurisdictionScope.toLowerCase()} and should be read alongside the current possession route for that jurisdiction.`;
  }

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

export function getRetainedSupportingPages(): string[] {
  return getRetainedSeoPageTaxonomyEntries()
    .filter((entry) => entry.pageRole === 'supporting' || entry.pageRole === 'bridge')
    .map((entry) => entry.pathname)
    .sort((left, right) => left.localeCompare(right));
}

export function getTopInternalLinkRecipients(
  limit = 20
): Array<{ pathname: string; inboundCount: number }> {
  const counts = new Map<string, number>();

  for (const entry of getRetainedSeoPageTaxonomyEntries()) {
    const destinations = [entry.primaryPillar, entry.supportingPage].filter(
      (destination) => destination && destination !== entry.pathname
    );

    for (const destination of destinations) {
      counts.set(destination, (counts.get(destination) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .map(([pathname, inboundCount]) => ({ pathname, inboundCount }))
    .sort((left, right) => {
      if (right.inboundCount !== left.inboundCount) {
        return right.inboundCount - left.inboundCount;
      }

      return left.pathname.localeCompare(right.pathname);
    })
    .slice(0, limit);
}

export function getPhase3SitemapExclusions(): string[] {
  return getCandidateRedirects().map((item) => item.source);
}

export function getExplicitTaxonomyExemptions(): string[] {
  return [...EXPLICIT_TAXONOMY_EXEMPTIONS];
}

export function isExplicitTaxonomyExemption(pathname: string): boolean {
  return EXPLICIT_TAXONOMY_EXEMPTION_SET.has(pathname);
}

export function isMappedPublicContentPath(pathname: string): boolean {
  return pathname in SEO_PAGE_TAXONOMY;
}
