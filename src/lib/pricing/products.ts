// src/lib/pricing/products.ts
// Single source of truth for display pricing, labels, descriptions, and wizard hrefs

import type { EnglandModernTenancyProductSku } from '@/lib/tenancy/england-product-model';

export interface PriceDefinition {
  amount: number;
  display: string;
}

export function formatPriceLabel(amount: number): string {
  return `\u00A3${amount.toFixed(2)}`;
}

export function formatPriceAmount(amount: number): string {
  return amount.toFixed(2);
}

export function formatFromPriceLabel(amount: number): string {
  return `From ${formatPriceLabel(amount)}`;
}

export function formatPriceRangeLabel(amounts: readonly number[]): string {
  const [lowest, highest] = [...amounts].sort((a, b) => a - b);
  return `${formatPriceLabel(lowest)} - ${formatPriceLabel(highest)}`;
}

/**
 * SEO_PRICES - Canonical pricing for landing pages and SEO content
 *
 * IMPORTANT: This is the single source of truth for all SEO-visible pricing.
 * Update ONLY here when prices change. All landing pages reference these values.
 */
export const SEO_PRICES = {
  evictionNotice: { amount: 39.99, display: formatPriceLabel(39.99) },
  evictionBundle: { amount: 89.99, display: formatPriceLabel(89.99) },
  moneyClaim: { amount: 29.99, display: formatPriceLabel(29.99) },
  tenancyStandard: { amount: 14.99, display: formatPriceLabel(14.99) },
  tenancyPremium: { amount: 24.99, display: formatPriceLabel(24.99) },
  tenancyStudent: { amount: 24.99, display: formatPriceLabel(24.99) },
  tenancyHmoShared: { amount: 34.99, display: formatPriceLabel(34.99) },
  tenancyLodger: { amount: 14.99, display: formatPriceLabel(14.99) },
  residentialLettingStandard: { amount: 9.99, display: formatPriceLabel(9.99) },
  residentialLettingPremium: { amount: 12.99, display: formatPriceLabel(12.99) },
} as const satisfies Record<string, PriceDefinition>;

/**
 * ALLOWED_SEO_PRICES - Set of valid price strings for regression testing
 * Any price displayed on SEO landing pages must be in this set
 */
export const ALLOWED_SEO_PRICES = new Set([
  SEO_PRICES.evictionNotice.display,
  SEO_PRICES.evictionBundle.display,
  SEO_PRICES.moneyClaim.display,
  SEO_PRICES.tenancyStandard.display,
  SEO_PRICES.tenancyPremium.display,
  SEO_PRICES.tenancyStudent.display,
  SEO_PRICES.tenancyHmoShared.display,
  SEO_PRICES.tenancyLodger.display,
  SEO_PRICES.residentialLettingStandard.display,
  SEO_PRICES.residentialLettingPremium.display,
]);

/**
 * SEO_LANDING_ROUTES - Clean canonical landing routes for products
 *
 * These are the SEO entry points. Internal links should point HERE,
 * not to /wizard?product=X. The landing pages then CTA into the wizard.
 */
export const SEO_LANDING_ROUTES = {
  notice_only: '/eviction-notice-template',
  complete_pack: '/products/complete-pack',
  money_claim: '/money-claim',
  ast_standard: '/tenancy-agreement-template',
  ast_premium: '/premium-tenancy-agreement',
  england_standard_tenancy_agreement: '/standard-tenancy-agreement',
  england_premium_tenancy_agreement: '/premium-tenancy-agreement',
  england_student_tenancy_agreement: '/student-tenancy-agreement',
  england_hmo_shared_house_tenancy_agreement: '/hmo-shared-house-tenancy-agreement',
  england_lodger_agreement: '/lodger-agreement',
  residential_tenancy_application: '/tenancy-agreement-template',
} as const;

export type ProductSku =
  | 'notice_only'
  | 'complete_pack'
  | 'money_claim'
  | 'sc_money_claim'
  | 'ast_standard'
  | 'ast_premium'
  | EnglandModernTenancyProductSku
  | 'residential_tenancy_application'
  ;

export type AskHeavenRecommendation =
  | 'notice_only'
  | 'complete_pack'
  | 'money_claim'
  | 'tenancy_agreement';

export interface ProductConfig {
  sku: ProductSku;
  label: string;
  shortLabel: string;
  description: string;
  /** Numeric price in GBP (e.g., 19.99) */
  price: number;
  displayPrice: string;
  priceNote?: string;
  wizardHref: string;
  productPageHref?: string;
}

export const PRODUCTS: Record<ProductSku, ProductConfig> = {
  notice_only: {
    sku: 'notice_only',
    label: 'Eviction Notice Pack',
    shortLabel: 'Notice Only',
    description: 'Create a compliant Section 21, Section 8, or Notice to Leave',
    price: SEO_PRICES.evictionNotice.amount,
    displayPrice: SEO_PRICES.evictionNotice.display,
    wizardHref: '/wizard?product=notice_only',
    productPageHref: SEO_LANDING_ROUTES.notice_only,
  },
  complete_pack: {
    sku: 'complete_pack',
    label: 'Complete Eviction Pack',
    shortLabel: 'Complete Pack',
    description: 'Full bundle with notice, court forms, and guidance',
    price: SEO_PRICES.evictionBundle.amount,
    displayPrice: SEO_PRICES.evictionBundle.display,
    priceNote: 'England only',
    wizardHref: '/wizard?product=complete_pack',
    productPageHref: SEO_LANDING_ROUTES.complete_pack,
  },
  money_claim: {
    sku: 'money_claim',
    label: 'Money Claim Pack',
    shortLabel: 'Money Claim',
    description: 'Recover unpaid rent, damage, cleaning and other tenant debts',
    price: SEO_PRICES.moneyClaim.amount,
    displayPrice: SEO_PRICES.moneyClaim.display,
    priceNote: 'England only',
    wizardHref: '/wizard?product=money_claim',
    productPageHref: SEO_LANDING_ROUTES.money_claim,
  },
  sc_money_claim: {
    sku: 'sc_money_claim',
    label: 'Scotland Money Claim Pack',
    shortLabel: 'Scotland Money Claim',
    description: 'Recover unpaid rent and tenant debts through Simple Procedure',
    price: SEO_PRICES.moneyClaim.amount,
    displayPrice: SEO_PRICES.moneyClaim.display,
    priceNote: 'Service discontinued - use Notice Only',
    wizardHref: '/wizard?product=notice_only&jurisdiction=scotland',
    productPageHref: SEO_LANDING_ROUTES.notice_only,
  },
  ast_standard: {
    sku: 'ast_standard',
    label: 'Standard Tenancy Agreement',
    shortLabel: 'Standard',
    description:
      'Migration-safe standard tenancy agreement entry route for England, Wales, Scotland, and Northern Ireland',
    price: SEO_PRICES.tenancyStandard.amount,
    displayPrice: SEO_PRICES.tenancyStandard.display,
    wizardHref: '/wizard?product=ast_standard&src=product_page&topic=tenancy',
    productPageHref: SEO_LANDING_ROUTES.ast_standard,
  },
  ast_premium: {
    sku: 'ast_premium',
    label: 'Premium Tenancy Agreement',
    shortLabel: 'Premium',
    description:
      'Migration-safe premium tenancy agreement entry route for England and premium-tier tenancy flows in the rest of the UK',
    price: SEO_PRICES.tenancyPremium.amount,
    displayPrice: SEO_PRICES.tenancyPremium.display,
    wizardHref: '/wizard?product=ast_premium&src=product_page&topic=tenancy',
    productPageHref: SEO_LANDING_ROUTES.ast_premium,
  },
  england_standard_tenancy_agreement: {
    sku: 'england_standard_tenancy_agreement',
    label: 'Standard Tenancy Agreement',
    shortLabel: 'Standard',
    description:
      'Ordinary England residential tenancy agreement for a straightforward whole-property let',
    price: SEO_PRICES.tenancyStandard.amount,
    displayPrice: SEO_PRICES.tenancyStandard.display,
    wizardHref:
      '/wizard?product=england_standard_tenancy_agreement&jurisdiction=england&src=product_page&topic=tenancy',
    productPageHref: SEO_LANDING_ROUTES.england_standard_tenancy_agreement,
  },
  england_premium_tenancy_agreement: {
    sku: 'england_premium_tenancy_agreement',
    label: 'Premium Tenancy Agreement',
    shortLabel: 'Premium',
    description:
      'Ordinary England residential premium tenancy agreement with fuller drafting and management options',
    price: SEO_PRICES.tenancyPremium.amount,
    displayPrice: SEO_PRICES.tenancyPremium.display,
    wizardHref:
      '/wizard?product=england_premium_tenancy_agreement&jurisdiction=england&src=product_page&topic=tenancy',
    productPageHref: SEO_LANDING_ROUTES.england_premium_tenancy_agreement,
  },
  england_student_tenancy_agreement: {
    sku: 'england_student_tenancy_agreement',
    label: 'Student Tenancy Agreement',
    shortLabel: 'Student',
    description:
      'England student-focused tenancy agreement for sharers, guarantors, and end-of-term expectations',
    price: SEO_PRICES.tenancyStudent.amount,
    displayPrice: SEO_PRICES.tenancyStudent.display,
    wizardHref:
      '/wizard?product=england_student_tenancy_agreement&jurisdiction=england&src=product_page&topic=tenancy',
    productPageHref: SEO_LANDING_ROUTES.england_student_tenancy_agreement,
  },
  england_hmo_shared_house_tenancy_agreement: {
    sku: 'england_hmo_shared_house_tenancy_agreement',
    label: 'HMO / Shared House Tenancy Agreement',
    shortLabel: 'HMO / Shared',
    description:
      'England shared-house and HMO tenancy agreement with sharer, communal-area, and licensing detail',
    price: SEO_PRICES.tenancyHmoShared.amount,
    displayPrice: SEO_PRICES.tenancyHmoShared.display,
    wizardHref:
      '/wizard?product=england_hmo_shared_house_tenancy_agreement&jurisdiction=england&src=product_page&topic=tenancy',
    productPageHref: SEO_LANDING_ROUTES.england_hmo_shared_house_tenancy_agreement,
  },
  england_lodger_agreement: {
    sku: 'england_lodger_agreement',
    label: 'Room Let / Lodger Agreement',
    shortLabel: 'Lodger',
    description:
      'England resident-landlord lodger agreement for a room let or licence-style arrangement',
    price: SEO_PRICES.tenancyLodger.amount,
    displayPrice: SEO_PRICES.tenancyLodger.display,
    wizardHref:
      '/wizard?product=england_lodger_agreement&jurisdiction=england&src=product_page&topic=tenancy',
    productPageHref: SEO_LANDING_ROUTES.england_lodger_agreement,
  },
  residential_tenancy_application: {
    sku: 'residential_tenancy_application',
    label: 'Residential Tenancy Application',
    shortLabel: 'Application',
    description: 'Legacy residential tenancy application form',
    price: SEO_PRICES.residentialLettingStandard.amount,
    displayPrice: SEO_PRICES.residentialLettingStandard.display,
    priceNote: 'Legacy product',
    wizardHref: '/wizard?product=residential_tenancy_application&jurisdiction=england',
    productPageHref: SEO_LANDING_ROUTES.residential_tenancy_application,
  },
};

export const PRODUCT_PRICE_LABELS = {
  notice_only: PRODUCTS.notice_only.displayPrice,
  complete_pack: PRODUCTS.complete_pack.displayPrice,
  money_claim: PRODUCTS.money_claim.displayPrice,
  sc_money_claim: PRODUCTS.sc_money_claim.displayPrice,
  ast_standard: PRODUCTS.ast_standard.displayPrice,
  ast_premium: PRODUCTS.ast_premium.displayPrice,
  england_standard_tenancy_agreement:
    PRODUCTS.england_standard_tenancy_agreement.displayPrice,
  england_premium_tenancy_agreement:
    PRODUCTS.england_premium_tenancy_agreement.displayPrice,
  england_student_tenancy_agreement:
    PRODUCTS.england_student_tenancy_agreement.displayPrice,
  england_hmo_shared_house_tenancy_agreement:
    PRODUCTS.england_hmo_shared_house_tenancy_agreement.displayPrice,
  england_lodger_agreement: PRODUCTS.england_lodger_agreement.displayPrice,
  residential_tenancy_application: PRODUCTS.residential_tenancy_application.displayPrice,
} as const;

export const PRODUCT_PRICE_AMOUNT_STRINGS = {
  notice_only: formatPriceAmount(PRODUCTS.notice_only.price),
  complete_pack: formatPriceAmount(PRODUCTS.complete_pack.price),
  money_claim: formatPriceAmount(PRODUCTS.money_claim.price),
  sc_money_claim: formatPriceAmount(PRODUCTS.sc_money_claim.price),
  ast_standard: formatPriceAmount(PRODUCTS.ast_standard.price),
  ast_premium: formatPriceAmount(PRODUCTS.ast_premium.price),
  england_standard_tenancy_agreement: formatPriceAmount(
    PRODUCTS.england_standard_tenancy_agreement.price
  ),
  england_premium_tenancy_agreement: formatPriceAmount(
    PRODUCTS.england_premium_tenancy_agreement.price
  ),
  england_student_tenancy_agreement: formatPriceAmount(
    PRODUCTS.england_student_tenancy_agreement.price
  ),
  england_hmo_shared_house_tenancy_agreement: formatPriceAmount(
    PRODUCTS.england_hmo_shared_house_tenancy_agreement.price
  ),
  england_lodger_agreement: formatPriceAmount(
    PRODUCTS.england_lodger_agreement.price
  ),
  residential_tenancy_application: formatPriceAmount(
    PRODUCTS.residential_tenancy_application.price
  ),
} as const;

export const TENANCY_AGREEMENT_PRICE_RANGE = formatPriceRangeLabel([
  PRODUCTS.england_standard_tenancy_agreement.price,
  PRODUCTS.england_hmo_shared_house_tenancy_agreement.price,
]);

export const TENANCY_AGREEMENT_FROM_PRICE = formatFromPriceLabel(
  PRODUCTS.england_standard_tenancy_agreement.price
);

export const LANDLORD_DOCUMENT_PRICE_RANGE = formatPriceRangeLabel([
  PRODUCTS.ast_standard.price,
  PRODUCTS.complete_pack.price,
]);

/**
 * Maps Ask Heaven AI recommendation codes to actual product SKUs
 * The AI uses simplified categories; this maps to our real products
 */
export const ASK_HEAVEN_RECOMMENDATIONS: AskHeavenRecommendation[] = [
  'notice_only',
  'complete_pack',
  'money_claim',
  'tenancy_agreement',
];

export const ASK_HEAVEN_RECOMMENDATION_MAP = {
  notice_only: PRODUCTS.notice_only,
  complete_pack: PRODUCTS.complete_pack,
  money_claim: PRODUCTS.money_claim,
  tenancy_agreement: PRODUCTS.ast_standard,
} as const;

/**
 * Get product config by SKU
 */
export function getProduct(sku: ProductSku): ProductConfig {
  return PRODUCTS[sku];
}

/**
 * Check if a string is a valid product SKU
 */
export function isValidProductSku(value: string): value is ProductSku {
  return value in PRODUCTS;
}

/**
 * Check if a string is a valid Ask Heaven recommendation
 */
export function isValidAskHeavenRecommendation(
  value: string
): value is AskHeavenRecommendation {
  return (ASK_HEAVEN_RECOMMENDATIONS as string[]).includes(value);
}

/**
 * Regional product availability matrix
 * Defines which products are available in which jurisdictions
 */
export const REGIONAL_PRODUCT_AVAILABILITY: Record<
  ProductSku,
  { available: string[]; badge?: string }
> = {
  notice_only: {
    available: ['england', 'wales', 'scotland'],
    // Not available in Northern Ireland
  },
  complete_pack: {
    available: ['england'],
    badge: 'England only',
  },
  money_claim: {
    available: ['england'],
    badge: 'England only',
  },
  sc_money_claim: {
    available: [], // Discontinued
    badge: 'Service discontinued',
  },
  ast_standard: {
    available: ['england', 'wales', 'scotland', 'northern-ireland'],
  },
  ast_premium: {
    available: ['england', 'wales', 'scotland', 'northern-ireland'],
  },
  england_standard_tenancy_agreement: {
    available: ['england'],
    badge: 'England only',
  },
  england_premium_tenancy_agreement: {
    available: ['england'],
    badge: 'England only',
  },
  england_student_tenancy_agreement: {
    available: ['england'],
    badge: 'England only',
  },
  england_hmo_shared_house_tenancy_agreement: {
    available: ['england'],
    badge: 'England only',
  },
  england_lodger_agreement: {
    available: ['england'],
    badge: 'England only',
  },
  residential_tenancy_application: {
    available: [],
    badge: 'Legacy only',
  },
};

/**
 * Check if a product is available in a given jurisdiction
 */
export function isProductAvailableInRegion(
  sku: ProductSku,
  jurisdiction: string
): boolean {
  const availability = REGIONAL_PRODUCT_AVAILABILITY[sku];
  if (!availability) return false;
  return availability.available.includes(jurisdiction);
}

/**
 * Get all products available in a given jurisdiction
 */
export function getProductsForRegion(jurisdiction: string): ProductConfig[] {
  return Object.values(PRODUCTS).filter((product) =>
    isProductAvailableInRegion(product.sku, jurisdiction)
  );
}

/**
 * Get the regional badge for a product (e.g., "England only")
 */
export function getRegionalBadge(sku: ProductSku): string | undefined {
  return REGIONAL_PRODUCT_AVAILABILITY[sku]?.badge;
}

/**
 * Get the SEO landing page href for a product
 *
 * IMPORTANT: Use this for internal links instead of wizard URLs.
 * The landing page CTAs into the wizard - external links should land on the
 * clean SEO route first, not directly into the wizard.
 *
 * @param sku - Product SKU
 * @param params - Optional URL search params to append (for analytics tracking)
 * @returns Clean SEO landing route (e.g., '/eviction-notice-template')
 *
 * @example
 * getProductLandingHref('notice_only') // '/eviction-notice-template'
 * getProductLandingHref('notice_only', { src: 'blog' }) // '/eviction-notice-template?src=blog'
 */
export function getProductLandingHref(
  sku: ProductSku,
  params?: Record<string, string>
): string {
  const landingRoute =
    SEO_LANDING_ROUTES[sku as keyof typeof SEO_LANDING_ROUTES] ||
    PRODUCTS[sku]?.productPageHref ||
    '/';

  if (params && Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams(params).toString();
    return `${landingRoute}?${searchParams}`;
  }

  return landingRoute;
}


