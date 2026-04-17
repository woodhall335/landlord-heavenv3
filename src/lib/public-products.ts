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
    displayName: 'Eviction Notice Generator (Section 8, May 2026)',
    shortName: 'Eviction Notice Generator',
    seoTitle: 'Eviction Notice Generator (Section 8, May 2026)',
    metaDescription:
      'Generate a Section 8 notice for England under the post-May 2026 rules, with landlord checks on grounds, dates, service, and compliance before you serve.',
    eyebrow: 'Section 8 notice route',
    heroBadge: 'For landlords in England',
    proofLabel: 'Checks before you serve',
    cardAccent: 'amethyst',
    ctaLabel: 'Start Eviction Notice Generator',
    primaryCtaLabel: 'Start Eviction Notice Generator',
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
    displayName: 'Complete Eviction Pack',
    shortName: 'Complete Eviction Pack',
    seoTitle: 'Complete Eviction Pack (Court Possession - England)',
    metaDescription:
      'Prepare the England court-possession route with a Section 8 notice, N5, N119, possession claim drafting, and filing guidance in one workflow.',
    eyebrow: 'Court possession route',
    heroBadge: 'For landlords in England',
    proofLabel: 'Notice, court, and possession in one workflow',
    cardAccent: 'plum',
    ctaLabel: 'Start Complete Eviction Pack',
    primaryCtaLabel: 'Start Complete Eviction Pack',
    secondaryCtaLabel: 'See the court route',
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
      'Recover unpaid rent, damage, bills, guarantor debt, and former-tenant claims with the England landlord money claim route.',
    eyebrow: 'Debt recovery route',
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
    displayName: 'Section 13 Rent Increase Pack',
    shortName: 'Section 13 Rent Increase Pack',
    seoTitle: 'Section 13 Rent Increase Pack (England)',
    metaDescription:
      'Increase rent in England using the Section 13 route with Form 4A, timing checks, support notes, and landlord-first guidance.',
    eyebrow: 'Rent increase route',
    heroBadge: 'Built for properties in England',
    proofLabel: 'Section 13 and Form 4A support',
    cardAccent: 'amber',
    ctaLabel: 'Start Section 13 Rent Increase Pack',
    primaryCtaLabel: 'Start Section 13 Rent Increase Pack',
    secondaryCtaLabel: 'Read the rent increase guide',
    priceLabel: PRODUCTS.section13_standard.displayPrice,
    landingHref: '/products/section-13-standard',
    wizardHref: buildFlowHref('rent_increase', 'section13_standard', {
      src: 'product_page',
      topic: 'general',
    }),
    defaultGuideLinks: [
      { label: 'Rent Increase', href: '/rent-increase' },
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
    displayName: 'Section 13 Defence Pack',
    shortName: 'Section 13 Defence Pack',
    seoTitle: 'Section 13 Defence Pack (England)',
    metaDescription:
      'Prepare an England Section 13 defence-ready file with fuller challenge support, evidence tools, and cleaner tribunal preparation.',
    eyebrow: 'Rent challenge route',
    heroBadge: 'Built for properties in England',
    proofLabel: 'Landlord file support when the increase may be challenged',
    cardAccent: 'amber',
    ctaLabel: 'Start Section 13 Defence Pack',
    primaryCtaLabel: 'Start Section 13 Defence Pack',
    secondaryCtaLabel: 'Read the rent increase guide',
    priceLabel: PRODUCTS.section13_defensive.displayPrice,
    landingHref: '/products/section-13-defence',
    wizardHref: buildFlowHref('rent_increase', 'section13_defensive', {
      src: 'product_page',
      topic: 'general',
    }),
    defaultGuideLinks: [
      { label: 'Rent Increase', href: '/rent-increase' },
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
      'Choose the right England tenancy agreement route for Standard, Premium, Student, HMO / Shared House, and Lodger arrangements.',
    eyebrow: 'England tenancy hub',
    heroBadge: 'For landlords in England',
    proofLabel: 'Five live agreement routes for England lets',
    cardAccent: 'lavender',
    ctaLabel: 'Choose England Tenancy Agreement',
    primaryCtaLabel: 'Choose the right tenancy agreement',
    secondaryCtaLabel: 'See all agreement routes',
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
    displayName: 'Standard Tenancy Agreement',
    shortName: 'Standard Tenancy Agreement',
    seoTitle: 'Standard Tenancy Agreement (England)',
    metaDescription:
      'Create a Standard Tenancy Agreement for a straightforward England whole-property let under the current framework.',
    eyebrow: 'England agreement',
    heroBadge: 'For landlords in England',
    proofLabel: 'Straightforward whole-property let',
    cardAccent: 'lavender',
    ctaLabel: 'Start Standard Tenancy Agreement',
    primaryCtaLabel: 'Start Standard Tenancy Agreement',
    secondaryCtaLabel: 'Compare England routes',
    priceLabel: PRODUCTS.england_standard_tenancy_agreement.displayPrice,
    landingHref: '/standard-tenancy-agreement',
    wizardHref: buildFlowHref('tenancy_agreement', 'england_standard_tenancy_agreement', {
      src: 'product_page',
      topic: 'tenancy',
    }),
    defaultGuideLinks: [
      { label: 'England tenancy hub', href: '/products/ast' },
      { label: 'Premium agreement', href: '/premium-tenancy-agreement' },
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
    displayName: 'Premium Tenancy Agreement',
    shortName: 'Premium Tenancy Agreement',
    seoTitle: 'Premium Tenancy Agreement (England)',
    metaDescription:
      'Create a Premium Tenancy Agreement for England with fuller drafting, broader management wording, and stronger support schedules.',
    eyebrow: 'England agreement',
    heroBadge: 'For landlords in England',
    proofLabel: 'Broader drafting and support schedules',
    cardAccent: 'lavender',
    ctaLabel: 'Start Premium Tenancy Agreement',
    primaryCtaLabel: 'Start Premium Tenancy Agreement',
    secondaryCtaLabel: 'Compare England routes',
    priceLabel: PRODUCTS.england_premium_tenancy_agreement.displayPrice,
    landingHref: '/premium-tenancy-agreement',
    wizardHref: buildFlowHref('tenancy_agreement', 'england_premium_tenancy_agreement', {
      src: 'product_page',
      topic: 'tenancy',
    }),
    defaultGuideLinks: [
      { label: 'England tenancy hub', href: '/products/ast' },
      { label: 'Standard agreement', href: '/standard-tenancy-agreement' },
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
    secondaryCtaLabel: 'Compare England routes',
    priceLabel: PRODUCTS.england_student_tenancy_agreement.displayPrice,
    landingHref: '/student-tenancy-agreement',
    wizardHref: buildFlowHref('tenancy_agreement', 'england_student_tenancy_agreement', {
      src: 'product_page',
      topic: 'tenancy',
    }),
    defaultGuideLinks: [
      { label: 'England tenancy hub', href: '/products/ast' },
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
    displayName: 'HMO / Shared House Tenancy Agreement',
    shortName: 'HMO / Shared House Tenancy Agreement',
    seoTitle: 'HMO / Shared House Tenancy Agreement (England)',
    metaDescription:
      'Create an England HMO or shared-house tenancy agreement with communal-area, sharer, and management wording built for shared occupation.',
    eyebrow: 'England agreement',
    heroBadge: 'For landlords in England',
    proofLabel: 'Built for shared occupation',
    cardAccent: 'lavender',
    ctaLabel: 'Start HMO / Shared House Agreement',
    primaryCtaLabel: 'Start HMO / Shared House Agreement',
    secondaryCtaLabel: 'Compare England routes',
    priceLabel: PRODUCTS.england_hmo_shared_house_tenancy_agreement.displayPrice,
    landingHref: '/hmo-shared-house-tenancy-agreement',
    wizardHref: buildFlowHref('tenancy_agreement', 'england_hmo_shared_house_tenancy_agreement', {
      src: 'product_page',
      topic: 'tenancy',
    }),
    defaultGuideLinks: [
      { label: 'England tenancy hub', href: '/products/ast' },
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
    displayName: 'Lodger Agreement',
    shortName: 'Lodger Agreement',
    seoTitle: 'Lodger Agreement (England)',
    metaDescription:
      'Create an England lodger agreement for a resident-landlord room let without forcing the arrangement into a whole-property tenancy route.',
    eyebrow: 'England agreement',
    heroBadge: 'For landlords in England',
    proofLabel: 'Resident-landlord room let',
    cardAccent: 'lavender',
    ctaLabel: 'Start Lodger Agreement',
    primaryCtaLabel: 'Start Lodger Agreement',
    secondaryCtaLabel: 'Compare England routes',
    priceLabel: PRODUCTS.england_lodger_agreement.displayPrice,
    landingHref: '/lodger-agreement',
    wizardHref: buildFlowHref('tenancy_agreement', 'england_lodger_agreement', {
      src: 'product_page',
      topic: 'tenancy',
    }),
    defaultGuideLinks: [
      { label: 'England tenancy hub', href: '/products/ast' },
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
