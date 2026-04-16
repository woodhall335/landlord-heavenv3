import { PRODUCTS, TENANCY_AGREEMENT_FROM_PRICE } from '@/lib/pricing/products';

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
  displayName: string;
  shortName: string;
  seoTitle: string;
  metaDescription: string;
  ctaLabel: string;
  priceLabel: string;
  landingHref: string;
  wizardHref: string;
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
    displayName: 'Eviction Notice Generator (Section 8, May 2026)',
    shortName: 'Eviction Notice Generator',
    seoTitle: 'Eviction Notice Generator (Section 8, May 2026)',
    metaDescription:
      'Generate a Section 8 notice for England under the post-May 2026 rules, with landlord checks on grounds, dates, service, and compliance before you serve.',
    ctaLabel: 'Start Eviction Notice Generator',
    priceLabel: PRODUCTS.notice_only.displayPrice,
    landingHref: '/products/notice-only',
    wizardHref: buildFlowHref('eviction', 'notice_only', {
      src: 'product_page',
      topic: 'eviction',
    }),
  },
  complete_pack: {
    key: 'complete_pack',
    productType: 'complete_pack',
    public: true,
    jurisdiction: 'england',
    category: 'eviction',
    displayName: 'Complete Eviction Pack',
    shortName: 'Complete Eviction Pack',
    seoTitle: 'Complete Eviction Pack (Court Possession - England)',
    metaDescription:
      'Prepare the England court-possession route with a Section 8 notice, N5, N119, possession claim drafting, and filing guidance in one workflow.',
    ctaLabel: 'Start Complete Eviction Pack',
    priceLabel: PRODUCTS.complete_pack.displayPrice,
    landingHref: '/products/complete-pack',
    wizardHref: buildFlowHref('eviction', 'complete_pack', {
      src: 'product_page',
      topic: 'eviction',
    }),
  },
  money_claim: {
    key: 'money_claim',
    productType: 'money_claim',
    public: true,
    jurisdiction: 'england',
    category: 'money_claim',
    displayName: 'Money Claim Pack',
    shortName: 'Money Claim Pack',
    seoTitle: 'Money Claim Pack (England)',
    metaDescription:
      'Recover unpaid rent, damage, bills, guarantor debt, and former-tenant claims with the England landlord money claim route.',
    ctaLabel: 'Start Money Claim Pack',
    priceLabel: PRODUCTS.money_claim.displayPrice,
    landingHref: '/products/money-claim',
    wizardHref: buildFlowHref('money_claim', 'money_claim', {
      src: 'product_page',
      topic: 'debt',
    }),
  },
  section13_standard: {
    key: 'section13_standard',
    productType: 'section13_standard',
    public: true,
    jurisdiction: 'england',
    category: 'rent_increase',
    displayName: 'Section 13 Rent Increase Pack',
    shortName: 'Section 13 Rent Increase Pack',
    seoTitle: 'Section 13 Rent Increase Pack (England)',
    metaDescription:
      'Increase rent in England using the Section 13 route with Form 4A, timing checks, support notes, and landlord-first guidance.',
    ctaLabel: 'Start Section 13 Rent Increase Pack',
    priceLabel: PRODUCTS.section13_standard.displayPrice,
    landingHref: '/products/section-13-standard',
    wizardHref: buildFlowHref('rent_increase', 'section13_standard', {
      src: 'product_page',
      topic: 'general',
    }),
  },
  section13_defensive: {
    key: 'section13_defensive',
    productType: 'section13_defensive',
    public: true,
    jurisdiction: 'england',
    category: 'rent_increase',
    displayName: 'Section 13 Defence Pack',
    shortName: 'Section 13 Defence Pack',
    seoTitle: 'Section 13 Defence Pack (England)',
    metaDescription:
      'Prepare an England Section 13 defence-ready file with fuller challenge support, evidence tools, and cleaner tribunal preparation.',
    ctaLabel: 'Start Section 13 Defence Pack',
    priceLabel: PRODUCTS.section13_defensive.displayPrice,
    landingHref: '/products/section-13-defence',
    wizardHref: buildFlowHref('rent_increase', 'section13_defensive', {
      src: 'product_page',
      topic: 'general',
    }),
  },
  ast: {
    key: 'ast',
    productType: 'tenancy_agreement',
    public: true,
    jurisdiction: 'england',
    category: 'tenancy',
    displayName: 'England Tenancy Agreements',
    shortName: 'England Tenancy Agreements',
    seoTitle: 'England Tenancy Agreements',
    metaDescription:
      'Choose the right England tenancy agreement route for Standard, Premium, Student, HMO / Shared House, and Lodger arrangements.',
    ctaLabel: 'Choose England Tenancy Agreement',
    priceLabel: TENANCY_AGREEMENT_FROM_PRICE,
    landingHref: '/products/ast',
    wizardHref: buildFlowHref('tenancy_agreement', 'tenancy_agreement', {
      src: 'product_page',
      topic: 'tenancy',
    }),
  },
  england_standard_tenancy_agreement: {
    key: 'england_standard_tenancy_agreement',
    productType: 'england_standard_tenancy_agreement',
    public: true,
    jurisdiction: 'england',
    category: 'tenancy',
    displayName: 'Standard Tenancy Agreement',
    shortName: 'Standard Tenancy Agreement',
    seoTitle: 'Standard Tenancy Agreement (England)',
    metaDescription:
      'Create a Standard Tenancy Agreement for a straightforward England whole-property let under the current framework.',
    ctaLabel: 'Start Standard Tenancy Agreement',
    priceLabel: PRODUCTS.england_standard_tenancy_agreement.displayPrice,
    landingHref: '/standard-tenancy-agreement',
    wizardHref: buildFlowHref('tenancy_agreement', 'england_standard_tenancy_agreement', {
      src: 'product_page',
      topic: 'tenancy',
    }),
  },
  england_premium_tenancy_agreement: {
    key: 'england_premium_tenancy_agreement',
    productType: 'england_premium_tenancy_agreement',
    public: true,
    jurisdiction: 'england',
    category: 'tenancy',
    displayName: 'Premium Tenancy Agreement',
    shortName: 'Premium Tenancy Agreement',
    seoTitle: 'Premium Tenancy Agreement (England)',
    metaDescription:
      'Create a Premium Tenancy Agreement for England with fuller drafting, broader management wording, and stronger support schedules.',
    ctaLabel: 'Start Premium Tenancy Agreement',
    priceLabel: PRODUCTS.england_premium_tenancy_agreement.displayPrice,
    landingHref: '/premium-tenancy-agreement',
    wizardHref: buildFlowHref('tenancy_agreement', 'england_premium_tenancy_agreement', {
      src: 'product_page',
      topic: 'tenancy',
    }),
  },
  england_student_tenancy_agreement: {
    key: 'england_student_tenancy_agreement',
    productType: 'england_student_tenancy_agreement',
    public: true,
    jurisdiction: 'england',
    category: 'tenancy',
    displayName: 'Student Tenancy Agreement',
    shortName: 'Student Tenancy Agreement',
    seoTitle: 'Student Tenancy Agreement (England)',
    metaDescription:
      'Create a Student Tenancy Agreement for England with sharer, guarantor, and end-of-term wording built for student lets.',
    ctaLabel: 'Start Student Tenancy Agreement',
    priceLabel: PRODUCTS.england_student_tenancy_agreement.displayPrice,
    landingHref: '/student-tenancy-agreement',
    wizardHref: buildFlowHref('tenancy_agreement', 'england_student_tenancy_agreement', {
      src: 'product_page',
      topic: 'tenancy',
    }),
  },
  england_hmo_shared_house_tenancy_agreement: {
    key: 'england_hmo_shared_house_tenancy_agreement',
    productType: 'england_hmo_shared_house_tenancy_agreement',
    public: true,
    jurisdiction: 'england',
    category: 'tenancy',
    displayName: 'HMO / Shared House Tenancy Agreement',
    shortName: 'HMO / Shared House Tenancy Agreement',
    seoTitle: 'HMO / Shared House Tenancy Agreement (England)',
    metaDescription:
      'Create an England HMO or shared-house tenancy agreement with communal-area, sharer, and management wording built for shared occupation.',
    ctaLabel: 'Start HMO / Shared House Agreement',
    priceLabel: PRODUCTS.england_hmo_shared_house_tenancy_agreement.displayPrice,
    landingHref: '/hmo-shared-house-tenancy-agreement',
    wizardHref: buildFlowHref('tenancy_agreement', 'england_hmo_shared_house_tenancy_agreement', {
      src: 'product_page',
      topic: 'tenancy',
    }),
  },
  england_lodger_agreement: {
    key: 'england_lodger_agreement',
    productType: 'england_lodger_agreement',
    public: true,
    jurisdiction: 'england',
    category: 'tenancy',
    displayName: 'Lodger Agreement',
    shortName: 'Lodger Agreement',
    seoTitle: 'Lodger Agreement (England)',
    metaDescription:
      'Create an England lodger agreement for a resident-landlord room let without forcing the arrangement into a whole-property tenancy route.',
    ctaLabel: 'Start Lodger Agreement',
    priceLabel: PRODUCTS.england_lodger_agreement.displayPrice,
    landingHref: '/lodger-agreement',
    wizardHref: buildFlowHref('tenancy_agreement', 'england_lodger_agreement', {
      src: 'product_page',
      topic: 'tenancy',
    }),
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
