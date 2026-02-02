// src/lib/pricing/products.ts
// Single source of truth for display pricing, labels, descriptions, and wizard hrefs

/**
 * SEO_PRICES - Canonical pricing for landing pages and SEO content
 *
 * IMPORTANT: This is the single source of truth for all SEO-visible pricing.
 * Update ONLY here when prices change. All landing pages reference these values.
 */
export const SEO_PRICES = {
  evictionNotice: { amount: 49.99, display: '£49.99' },
  evictionBundle: { amount: 199.99, display: '£199.99' },
  moneyClaim: { amount: 99.99, display: '£99.99' },
  tenancyStandard: { amount: 14.99, display: '£14.99' },
  tenancyPremium: { amount: 24.99, display: '£24.99' },
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
]);

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
} as const;

export type ProductSku =
  | 'notice_only'
  | 'complete_pack'
  | 'money_claim'
  | 'sc_money_claim'
  | 'ast_standard'
  | 'ast_premium';

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
  /** Numeric price in GBP (e.g., 49.99) */
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
    shortLabel: 'Standard AST',
    description: 'Government-compliant AST or PRT for your letting',
    price: SEO_PRICES.tenancyStandard.amount,
    displayPrice: SEO_PRICES.tenancyStandard.display,
    wizardHref: '/wizard?product=ast_standard',
    productPageHref: SEO_LANDING_ROUTES.ast_standard,
  },
  ast_premium: {
    sku: 'ast_premium',
    label: 'Premium Tenancy Agreement',
    shortLabel: 'Premium AST',
    description: 'Enhanced AST with additional clauses and protections',
    price: SEO_PRICES.tenancyPremium.amount,
    displayPrice: SEO_PRICES.tenancyPremium.display,
    wizardHref: '/wizard?product=ast_premium',
    productPageHref: SEO_LANDING_ROUTES.ast_premium,
  },
};

/**
 * Maps Ask Heaven AI recommendation codes to actual product SKUs
 * The AI uses simplified categories; this maps to our real products
 */
export const ASK_HEAVEN_RECOMMENDATION_MAP: Record<
  AskHeavenRecommendation,
  {
    primarySku: ProductSku;
    label: string;
    description: string;
    displayPrice: string;
    priceNote?: string;
    wizardHref: string;
  }
> = {
  notice_only: {
    primarySku: 'notice_only',
    label: 'Generate Eviction Notice',
    description: 'Create a compliant Section 21, Section 8, or Notice to Leave',
    displayPrice: SEO_PRICES.evictionNotice.display,
    wizardHref: '/wizard?product=notice_only',
  },
  complete_pack: {
    primarySku: 'complete_pack',
    label: 'Get Complete Eviction Pack',
    description: 'Full bundle with notice, court forms, and guidance',
    displayPrice: SEO_PRICES.evictionBundle.display,
    priceNote: 'England only',
    wizardHref: '/wizard?product=complete_pack',
  },
  money_claim: {
    primarySku: 'money_claim',
    label: 'Start Money Claim',
    description: 'Recover unpaid rent, damage, cleaning and other tenant debts',
    displayPrice: SEO_PRICES.moneyClaim.display,
    priceNote: 'England only',
    wizardHref: '/wizard?product=money_claim',
  },
  tenancy_agreement: {
    primarySku: 'ast_standard',
    label: 'Create Tenancy Agreement',
    description: 'Generate a compliant AST or PRT',
    displayPrice: `from ${SEO_PRICES.tenancyStandard.display}`,
    priceNote: `Standard ${SEO_PRICES.tenancyStandard.display} · Premium ${SEO_PRICES.tenancyPremium.display}`,
    wizardHref: '/wizard?product=tenancy_agreement',
  },
};

/**
 * Get product config by SKU
 */
export function getProduct(sku: ProductSku): ProductConfig {
  return PRODUCTS[sku];
}

/**
 * Get Ask Heaven CTA config for a recommendation code
 */
export function getAskHeavenCTA(recommendation: AskHeavenRecommendation) {
  return ASK_HEAVEN_RECOMMENDATION_MAP[recommendation];
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
  return value in ASK_HEAVEN_RECOMMENDATION_MAP;
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

/**
 * Check if a href is a wizard entry link (should be migrated to clean landing route)
 */
export function isWizardEntryLink(href: string): boolean {
  return href.startsWith('/wizard?product=');
}

/**
 * Map of product SKUs that have dedicated SEO landing pages
 */
export const PRODUCTS_WITH_SEO_LANDING_PAGES = new Set<ProductSku>([
  'notice_only',
  'complete_pack',
  'money_claim',
  'ast_standard',
  'ast_premium',
]);
