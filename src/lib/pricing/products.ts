// src/lib/pricing/products.ts
// Single source of truth for display pricing, labels, descriptions, and wizard hrefs

import {
  ENGLAND_PREMIUM_ASSURED_PERIODIC_TIER_LABEL,
  ENGLAND_STANDARD_ASSURED_PERIODIC_TIER_LABEL,
} from '@/lib/tenancy/england-agreement-constants';

/**
 * SEO_PRICES - Canonical pricing for landing pages and SEO content
 *
 * IMPORTANT: This is the single source of truth for all SEO-visible pricing.
 * Update ONLY here when prices change. All landing pages reference these values.
 */
export const SEO_PRICES = {
  evictionNotice: { amount: 29.99, display: '£29.99' },
  evictionBundle: { amount: 79.99, display: '£79.99' },
  moneyClaim: { amount: 59.99, display: '£59.99' },
  tenancyStandard: { amount: 14.99, display: '£14.99' },
  tenancyPremium: { amount: 24.99, display: '£24.99' },
  residentialLettingStandard: { amount: 9.99, display: '£9.99' },
  residentialLettingPremium: { amount: 12.99, display: '£12.99' },
} as const;

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
  SEO_PRICES.residentialLettingStandard.display,
  SEO_PRICES.residentialLettingPremium.display,
]);

export const TENANCY_AGREEMENT_PRICE_RANGE = `${SEO_PRICES.tenancyStandard.display} - ${SEO_PRICES.tenancyPremium.display}`;
export const TENANCY_AGREEMENT_FROM_PRICE = `From ${SEO_PRICES.tenancyStandard.display}`;

/**
 * SEO_LANDING_ROUTES - Clean canonical landing routes for products
 *
 * These are the SEO entry points. Internal links should point HERE,
 * not to /wizard?product=X. The landing pages then CTA into the wizard.
 */
export const SEO_LANDING_ROUTES = {
  notice_only: '/eviction-notice',
  complete_pack: '/eviction-pack-england',
  money_claim: '/money-claim',
  ast_standard: '/tenancy-agreement',
  ast_premium: '/premium-tenancy-agreement',
  residential_tenancy_application: '/tenancy-agreement',
} as const;

export type ProductSku =
  | 'notice_only'
  | 'complete_pack'
  | 'money_claim'
  | 'sc_money_claim'
  | 'ast_standard'
  | 'ast_premium'
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
    label: ENGLAND_STANDARD_ASSURED_PERIODIC_TIER_LABEL,
    shortLabel: 'Periodic Agreement',
    description: 'Renters’ Rights compliant England assured periodic tenancy agreement, with jurisdiction-aware variants for the rest of the UK',
    price: SEO_PRICES.tenancyStandard.amount,
    displayPrice: SEO_PRICES.tenancyStandard.display,
    wizardHref: '/wizard?product=ast_standard&src=product_page&topic=tenancy',
    productPageHref: SEO_LANDING_ROUTES.ast_standard,
  },
  ast_premium: {
    sku: 'ast_premium',
    label: ENGLAND_PREMIUM_ASSURED_PERIODIC_TIER_LABEL,
    shortLabel: 'Premium Periodic',
    description: 'Renters’ Rights compliant England premium assured periodic tenancy agreement with HMO, shared-living, and student-ready clauses',
    price: SEO_PRICES.tenancyPremium.amount,
    displayPrice: SEO_PRICES.tenancyPremium.display,
    wizardHref: '/wizard?product=ast_premium&src=product_page&topic=tenancy',
    productPageHref: SEO_LANDING_ROUTES.ast_premium,
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
 * @returns Clean SEO landing route (e.g., '/eviction-notice')
 *
 * @example
 * getProductLandingHref('notice_only') // '/eviction-notice'
 * getProductLandingHref('notice_only', { src: 'blog' }) // '/eviction-notice?src=blog'
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

