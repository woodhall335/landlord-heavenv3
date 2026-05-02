import { PRODUCTS, TENANCY_AGREEMENT_FROM_PRICE } from '@/lib/pricing/products';
import type {
  PublicCardAccent,
  PublicHeroPreset,
  PublicThemeKey,
} from '@/lib/public-brand';

export const PUBLIC_JURISDICTIONS = ['england'] as const;

export type PublicJurisdiction = (typeof PUBLIC_JURISDICTIONS)[number];

export type PublicProductKey =
  | 'notice_only'
  | 'complete_pack'
  | 'money_claim'
  | 'section13_standard'
  | 'section13_defensive'
  | 'ast'
  | 'england_standard_tenancy_agreement'
  | 'england_premium_tenancy_agreement'
  | 'england_student_tenancy_agreement'
  | 'england_hmo_shared_house_tenancy_agreement'
  | 'england_lodger_agreement';

type PublicProductCategory = 'eviction' | 'money_claim' | 'rent_increase' | 'tenancy';

export interface PublicProductDescriptor {
  key: PublicProductKey;
  productType: string;
  public: true;
  jurisdiction: PublicJurisdiction;
  category: PublicProductCategory;
  heroPreset: PublicHeroPreset;
  themeKey: PublicThemeKey;
  displayName: string;
  shortName: string;
  seoTitle: string;
  metaDescription: string;
  eyebrow: string;
  heroBadge: string;
  proofLabel: string;
  cardAccent: PublicCardAccent;
  ctaLabel: string;
  primaryCtaLabel: string;
  secondaryCtaLabel?: string;
  priceLabel: string;
  landingHref: string;
  wizardHref: string;
  defaultGuideLinks: { label: string; href: string }[];
}

function buildFlowHref(
  type: 'eviction' | 'money_claim' | 'rent_increase' | 'tenancy_agreement',
  product: string,
  extras: Record<string, string> = {}
): string {
  const params = new URLSearchParams({
    type,
    product,
    ...extras,
  });

  return `/wizard/flow?${params.toString()}`;
}

export const PUBLIC_PRODUCT_DESCRIPTORS: Record<PublicProductKey, PublicProductDescriptor> = {
  notice_only: {
    key: 'notice_only',
    productType: 'notice_only',
    public: true,
    jurisdiction: 'england',
    category: 'eviction',
    heroPreset: 'product_owner',
    themeKey: 'eviction',
    displayName: 'Stage 1: Section 8 Notice & Service Pack',
    shortName: 'Stage 1 Notice & Service',
    seoTitle: 'Stage 1: Section 8 Notice & Service Pack',
    metaDescription:
      'Start the eviction process correctly with a Section 8 notice pack for England that aligns the notice, service record, and evidence before you serve anything.',
    eyebrow: 'Stage 1: notice & service',
    heroBadge: 'For landlords in England',
    proofLabel: 'Start correctly before court',
    cardAccent: 'amethyst',
    ctaLabel: 'Start Stage 1 Notice Pack',
    primaryCtaLabel: 'Start Stage 1 Notice Pack',
    secondaryCtaLabel: 'See the Section 8 guide',
    priceLabel: PRODUCTS.notice_only.displayPrice,
    landingHref: '/products/notice-only',
    wizardHref: buildFlowHref('eviction', 'notice_only', {
      src: 'product_page',
      topic: 'eviction',
    }),
    defaultGuideLinks: [
      { label: 'Section 8 Notice', href: '/section-8-notice' },
      { label: 'Form 3A', href: '/form-3-section-8' },
      { label: 'How to evict a tenant in England', href: '/how-to-evict-a-tenant-england' },
    ],
  },
  complete_pack: {
    key: 'complete_pack',
    productType: 'complete_pack',
    public: true,
    jurisdiction: 'england',
    category: 'eviction',
    heroPreset: 'product_owner',
    themeKey: 'court',
    displayName: 'Stage 2: Section 8 Court & Possession Pack',
    shortName: 'Stage 2 Court & Possession',
    seoTitle: 'Stage 2: Section 8 Court & Possession Pack',
    metaDescription:
      'Complete England Section 8 pack covering both the Stage 1 notice/service file and the Stage 2 court claim file, with the notice, service record, N5, N119, and evidence aligned in one possession case.',
    eyebrow: 'Stage 2: court & possession',
    heroBadge: 'For landlords in England',
    proofLabel: 'Includes the full Stage 1 notice file plus the Stage 2 court claim pack',
    cardAccent: 'plum',
    ctaLabel: 'Start Stage 2 Court Pack',
    primaryCtaLabel: 'Start Stage 2 Court Pack',
    secondaryCtaLabel: 'See the court guide',
    priceLabel: PRODUCTS.complete_pack.displayPrice,
    landingHref: '/products/complete-pack',
    wizardHref: buildFlowHref('eviction', 'complete_pack', {
      src: 'product_page',
      topic: 'eviction',
    }),
    defaultGuideLinks: [
      { label: 'Eviction Process in England', href: '/eviction-process-england' },
      { label: 'How to evict a tenant in England', href: '/how-to-evict-a-tenant-england' },
      { label: 'Current England eviction rules', href: '/renters-rights-act-eviction-rules' },
    ],
  },
  money_claim: {
    key: 'money_claim',
    productType: 'money_claim',
    public: true,
    jurisdiction: 'england',
    category: 'money_claim',
    heroPreset: 'product_owner',
    themeKey: 'debt',
    displayName: 'Money Claim Pack',
    shortName: 'Money Claim Pack',
    seoTitle: 'Money Claim Pack (England)',
    metaDescription:
      'Recover unpaid rent, damage, bills, guarantor debt, and former-tenant claims with paperwork built for an England money claim.',
    eyebrow: 'Money claim',
    heroBadge: 'For landlords in England',
    proofLabel: 'Recover rent, bills, damage, and guarantor debt',
    cardAccent: 'emerald',
    ctaLabel: 'Start Money Claim Pack',
    primaryCtaLabel: 'Start Money Claim Pack',
    secondaryCtaLabel: 'See the money claim guide',
    priceLabel: PRODUCTS.money_claim.displayPrice,
    landingHref: '/products/money-claim',
    wizardHref: buildFlowHref('money_claim', 'money_claim', {
      src: 'product_page',
      topic: 'debt',
    }),
    defaultGuideLinks: [
      { label: 'Money claim guide', href: '/money-claim' },
      { label: 'Unpaid rent claim', href: '/money-claim-unpaid-rent' },
      { label: 'Letter before action', href: '/money-claim-letter-before-action' },
    ],
  },
  section13_standard: {
    key: 'section13_standard',
    productType: 'section13_standard',
    public: true,
    jurisdiction: 'england',
    category: 'rent_increase',
    heroPreset: 'product_owner',
    themeKey: 'rent',
    displayName: 'Standard Section 13 Rent Increase Pack',
    shortName: 'Standard Section 13 Rent Increase Pack',
    seoTitle: 'Standard Section 13 Rent Increase Pack (England)',
    metaDescription:
      'Propose a rent increase in England with Form 4A, market evidence, timing checks, and a complete service-ready rent increase file.',
    eyebrow: 'Rent increase',
    heroBadge: 'Built for properties in England',
    proofLabel: 'Notice, market evidence, and service record kept together',
    cardAccent: 'amber',
    ctaLabel: 'Start Standard Rent Increase Pack',
    primaryCtaLabel: 'Start Standard Rent Increase Pack',
    secondaryCtaLabel: 'Read the rent increase guide',
    priceLabel: PRODUCTS.section13_standard.displayPrice,
    landingHref: '/products/section-13-standard',
    wizardHref: buildFlowHref('rent_increase', 'section13_standard', {
      src: 'product_page',
      topic: 'general',
    }),
    defaultGuideLinks: [
      { label: 'Rent increase guide', href: '/products/rent-increase' },
      { label: 'Section 13 notice', href: '/rent-increase/section-13-notice' },
      { label: 'Form 4A guide', href: '/rent-increase/form-4a-guide' },
    ],
  },
  section13_defensive: {
    key: 'section13_defensive',
    productType: 'section13_defensive',
    public: true,
    jurisdiction: 'england',
    category: 'rent_increase',
    heroPreset: 'product_owner',
    themeKey: 'rent',
    displayName: 'Challenge-Ready Section 13 Defence Pack',
    shortName: 'Challenge-Ready Section 13 Defence Pack',
    seoTitle: 'Challenge-Ready Section 13 Defence Pack (England)',
    metaDescription:
      'Prepare an England Section 13 rent increase file for tenant challenge or tribunal scrutiny with stronger evidence, reply tools, and bundle support.',
    eyebrow: 'Rent increase',
    heroBadge: 'Built for properties in England',
    proofLabel: 'Prepare the rent increase file for tenant challenge or tribunal scrutiny',
    cardAccent: 'amber',
    ctaLabel: 'Start Challenge-Ready Defence Pack',
    primaryCtaLabel: 'Start Challenge-Ready Defence Pack',
    secondaryCtaLabel: 'Read the rent increase guide',
    priceLabel: PRODUCTS.section13_defensive.displayPrice,
    landingHref: '/products/section-13-defence',
    wizardHref: buildFlowHref('rent_increase', 'section13_defensive', {
      src: 'product_page',
      topic: 'general',
    }),
    defaultGuideLinks: [
      { label: 'Rent increase guide', href: '/products/rent-increase' },
      { label: 'Section 13 tribunal guide', href: '/rent-increase/section-13-tribunal' },
      { label: 'Rent challenge guide', href: '/rent-increase/rent-increase-challenge' },
    ],
  },
  ast: {
    key: 'ast',
    productType: 'tenancy_agreement',
    public: true,
    jurisdiction: 'england',
    category: 'tenancy',
    heroPreset: 'product_owner',
    themeKey: 'tenancy',
    displayName: 'England Tenancy Agreements',
    shortName: 'England Tenancy Agreements',
    seoTitle: 'England Tenancy Agreements',
    metaDescription:
      'Choose the right England tenancy agreement for Standard, Premium, Student, HMO / Shared House, and Lodger arrangements, with support for landlords searching periodic tenancy agreement wording too.',
    eyebrow: 'England tenancy agreements',
    heroBadge: 'For landlords in England',
    proofLabel: 'Five agreement options for England lets',
    cardAccent: 'lavender',
    ctaLabel: 'Choose England Tenancy Agreement',
    primaryCtaLabel: 'Choose the right tenancy agreement',
    secondaryCtaLabel: 'See all agreement options',
    priceLabel: TENANCY_AGREEMENT_FROM_PRICE,
    landingHref: '/products/ast',
    wizardHref: buildFlowHref('tenancy_agreement', 'tenancy_agreement', {
      src: 'product_page',
      topic: 'tenancy',
    }),
    defaultGuideLinks: [
      { label: 'Standard agreement', href: '/standard-tenancy-agreement' },
      { label: 'Premium agreement', href: '/premium-tenancy-agreement' },
      { label: 'Student agreement', href: '/student-tenancy-agreement' },
      { label: 'Periodic tenancy agreement guide', href: '/periodic-tenancy-agreement' },
    ],
  },
  england_standard_tenancy_agreement: {
    key: 'england_standard_tenancy_agreement',
    productType: 'england_standard_tenancy_agreement',
    public: true,
    jurisdiction: 'england',
    category: 'tenancy',
    heroPreset: 'product_owner',
    themeKey: 'tenancy',
    displayName: 'Standard Tenancy Agreement & Setup Pack',
    shortName: 'Standard Tenancy & Setup Pack',
    seoTitle: 'Standard Periodic Tenancy Agreement Pack (England)',
    metaDescription:
      'Create a clean England periodic tenancy setup pack for a straightforward whole-property let, with the agreement and supporting file kept together.',
    eyebrow: 'England agreement',
    heroBadge: 'For landlords in England',
    proofLabel: 'Clean legal setup for a straightforward whole-property let',
    cardAccent: 'lavender',
    ctaLabel: 'Start Standard Setup Pack',
    primaryCtaLabel: 'Start Standard Setup Pack',
    secondaryCtaLabel: 'Compare agreements',
    priceLabel: PRODUCTS.england_standard_tenancy_agreement.displayPrice,
    landingHref: '/standard-tenancy-agreement',
    wizardHref: buildFlowHref('tenancy_agreement', 'england_standard_tenancy_agreement', {
      src: 'product_page',
      topic: 'tenancy',
    }),
    defaultGuideLinks: [
      { label: 'England tenancy agreements', href: '/products/ast' },
      { label: 'Premium agreement', href: '/premium-tenancy-agreement' },
      { label: 'Periodic tenancy agreement guide', href: '/periodic-tenancy-agreement' },
    ],
  },
  england_premium_tenancy_agreement: {
    key: 'england_premium_tenancy_agreement',
    productType: 'england_premium_tenancy_agreement',
    public: true,
    jurisdiction: 'england',
    category: 'tenancy',
    heroPreset: 'product_owner',
    themeKey: 'tenancy',
    displayName: 'Premium Tenancy Agreement & Management Pack',
    shortName: 'Premium Tenancy & Management Pack',
    seoTitle: 'Premium Periodic Tenancy Agreement Pack (England)',
    metaDescription:
      'Create an England periodic tenancy management pack with fuller drafting, stronger operational controls, and management support schedules kept in one file.',
    eyebrow: 'England agreement',
    heroBadge: 'For landlords in England',
    proofLabel: 'Control and management clarity beyond the standard route',
    cardAccent: 'lavender',
    ctaLabel: 'Start Premium Management Pack',
    primaryCtaLabel: 'Start Premium Management Pack',
    secondaryCtaLabel: 'Compare agreements',
    priceLabel: PRODUCTS.england_premium_tenancy_agreement.displayPrice,
    landingHref: '/premium-tenancy-agreement',
    wizardHref: buildFlowHref('tenancy_agreement', 'england_premium_tenancy_agreement', {
      src: 'product_page',
      topic: 'tenancy',
    }),
    defaultGuideLinks: [
      { label: 'England tenancy agreements', href: '/products/ast' },
      { label: 'Standard agreement', href: '/standard-tenancy-agreement' },
      { label: 'Assured periodic tenancy guide', href: '/assured-periodic-tenancy-agreement' },
    ],
  },
  england_student_tenancy_agreement: {
    key: 'england_student_tenancy_agreement',
    productType: 'england_student_tenancy_agreement',
    public: true,
    jurisdiction: 'england',
    category: 'tenancy',
    heroPreset: 'product_owner',
    themeKey: 'tenancy',
    displayName: 'Student Tenancy Agreement',
    shortName: 'Student Tenancy Agreement',
    seoTitle: 'Student Tenancy Agreement (England)',
    metaDescription:
      'Create a Student Tenancy Agreement for England with sharer, guarantor, and end-of-term wording built for student lets.',
    eyebrow: 'England agreement',
    heroBadge: 'For landlords in England',
    proofLabel: 'Built for student lets',
    cardAccent: 'lavender',
    ctaLabel: 'Start Student Tenancy Agreement',
    primaryCtaLabel: 'Start Student Tenancy Agreement',
    secondaryCtaLabel: 'Compare agreements',
    priceLabel: PRODUCTS.england_student_tenancy_agreement.displayPrice,
    landingHref: '/student-tenancy-agreement',
    wizardHref: buildFlowHref('tenancy_agreement', 'england_student_tenancy_agreement', {
      src: 'product_page',
      topic: 'tenancy',
    }),
    defaultGuideLinks: [
      { label: 'England tenancy agreements', href: '/products/ast' },
      { label: 'HMO / Shared House agreement', href: '/hmo-shared-house-tenancy-agreement' },
    ],
  },
  england_hmo_shared_house_tenancy_agreement: {
    key: 'england_hmo_shared_house_tenancy_agreement',
    productType: 'england_hmo_shared_house_tenancy_agreement',
    public: true,
    jurisdiction: 'england',
    category: 'tenancy',
    heroPreset: 'product_owner',
    themeKey: 'tenancy',
    displayName: 'HMO / Shared House Tenancy Agreement & House Management Pack',
    shortName: 'HMO / Shared House Management Pack',
    seoTitle: 'HMO / Shared House Tenancy Management Pack (England)',
    metaDescription:
      'Create an England HMO or shared-house landlord file with the agreement, house rules, and communal management record kept together.',
    eyebrow: 'England agreement',
    heroBadge: 'For landlords in England',
    proofLabel: 'Shared house control, communal rules, and clearer sharer management',
    cardAccent: 'lavender',
    ctaLabel: 'Start HMO Management Pack',
    primaryCtaLabel: 'Start HMO Management Pack',
    secondaryCtaLabel: 'Compare agreements',
    priceLabel: PRODUCTS.england_hmo_shared_house_tenancy_agreement.displayPrice,
    landingHref: '/hmo-shared-house-tenancy-agreement',
    wizardHref: buildFlowHref('tenancy_agreement', 'england_hmo_shared_house_tenancy_agreement', {
      src: 'product_page',
      topic: 'tenancy',
    }),
    defaultGuideLinks: [
      { label: 'England tenancy agreements', href: '/products/ast' },
      { label: 'Student agreement', href: '/student-tenancy-agreement' },
    ],
  },
  england_lodger_agreement: {
    key: 'england_lodger_agreement',
    productType: 'england_lodger_agreement',
    public: true,
    jurisdiction: 'england',
    category: 'tenancy',
    heroPreset: 'product_owner',
    themeKey: 'tenancy',
    displayName: 'Room Let / Lodger Agreement & Shared Home Pack',
    shortName: 'Room Let / Shared Home Pack',
    seoTitle: 'Room Let / Lodger Agreement & Shared Home Pack (England)',
    metaDescription:
      'Create a resident-landlord room-let file for England that helps protect your home while keeping the lodger arrangement clear and well recorded.',
    eyebrow: 'England agreement',
    heroBadge: 'For landlords in England',
    proofLabel: 'Protect your home while taking in a lodger',
    cardAccent: 'lavender',
    ctaLabel: 'Start Room Let Pack',
    primaryCtaLabel: 'Start Room Let Pack',
    secondaryCtaLabel: 'Compare agreements',
    priceLabel: PRODUCTS.england_lodger_agreement.displayPrice,
    landingHref: '/lodger-agreement',
    wizardHref: buildFlowHref('tenancy_agreement', 'england_lodger_agreement', {
      src: 'product_page',
      topic: 'tenancy',
    }),
    defaultGuideLinks: [
      { label: 'England tenancy agreements', href: '/products/ast' },
      { label: 'HMO / Shared House agreement', href: '/hmo-shared-house-tenancy-agreement' },
    ],
  },
};

export const PUBLIC_PRODUCT_ORDER: PublicProductKey[] = [
  'notice_only',
  'complete_pack',
  'money_claim',
  'section13_standard',
  'section13_defensive',
  'ast',
];

export const PUBLIC_TENANCY_PRODUCT_ORDER: PublicProductKey[] = [
  'england_standard_tenancy_agreement',
  'england_premium_tenancy_agreement',
  'england_student_tenancy_agreement',
  'england_hmo_shared_house_tenancy_agreement',
  'england_lodger_agreement',
];

export function isPublicJurisdiction(value: string | null | undefined): value is PublicJurisdiction {
  return Boolean(value && PUBLIC_JURISDICTIONS.includes(value as PublicJurisdiction));
}

export function isPublicEnglandProduct(value: string | null | undefined): value is PublicProductKey {
  return Boolean(value && value in PUBLIC_PRODUCT_DESCRIPTORS);
}

export function getPublicProductDescriptor(
  value: PublicProductKey | string | null | undefined
): PublicProductDescriptor | null {
  if (!value || !(value in PUBLIC_PRODUCT_DESCRIPTORS)) {
    return null;
  }

  return PUBLIC_PRODUCT_DESCRIPTORS[value as PublicProductKey];
}

export function getPublicCatalogProducts(): PublicProductDescriptor[] {
  return PUBLIC_PRODUCT_ORDER.map((key) => PUBLIC_PRODUCT_DESCRIPTORS[key]);
}

export function getPublicTenancyProducts(): PublicProductDescriptor[] {
  return PUBLIC_TENANCY_PRODUCT_ORDER.map((key) => PUBLIC_PRODUCT_DESCRIPTORS[key]);
}

export function getPublicProductOwnerHref(
  product: string | null | undefined,
  caseType?: string | null
): string {
  const descriptor = getPublicProductDescriptor(product);
  if (descriptor) {
    return descriptor.landingHref;
  }

  switch (caseType) {
    case 'eviction':
      return PUBLIC_PRODUCT_DESCRIPTORS.notice_only.landingHref;
    case 'money_claim':
      return PUBLIC_PRODUCT_DESCRIPTORS.money_claim.landingHref;
    case 'rent_increase':
      return PUBLIC_PRODUCT_DESCRIPTORS.section13_standard.landingHref;
    case 'tenancy_agreement':
      return PUBLIC_PRODUCT_DESCRIPTORS.ast.landingHref;
    default:
      return '/wizard';
  }
}

export function isPubliclyStartableProduct(product: string | null | undefined): boolean {
  return Boolean(
    product &&
      [
        'notice_only',
        'complete_pack',
        'money_claim',
        'section13_standard',
        'section13_defensive',
        'tenancy_agreement',
        ...PUBLIC_TENANCY_PRODUCT_ORDER,
      ].includes(product as PublicProductKey | 'tenancy_agreement')
  );
}
