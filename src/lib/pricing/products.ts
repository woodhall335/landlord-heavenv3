// src/lib/pricing/products.ts
// Single source of truth for display pricing, labels, descriptions, and wizard hrefs

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
  /** Numeric price in GBP (e.g., 39.99) */
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
    price: 39.99,
    displayPrice: '£39.99',
    wizardHref: '/wizard?product=notice_only',
    productPageHref: '/notice-only',
  },
  complete_pack: {
    sku: 'complete_pack',
    label: 'Complete Eviction Pack',
    shortLabel: 'Complete Pack',
    description: 'Full bundle with notice, court forms, and guidance',
    price: 149.99,
    displayPrice: '£149.99',
    priceNote: 'England only',
    wizardHref: '/wizard?product=complete_pack',
    productPageHref: '/complete-pack',
  },
  money_claim: {
    sku: 'money_claim',
    label: 'Money Claim Pack',
    shortLabel: 'Money Claim',
    description: 'Recover rent arrears through the courts',
    price: 99.99,
    displayPrice: '£99.99',
    priceNote: 'England only',
    wizardHref: '/wizard?product=money_claim',
    productPageHref: '/money-claim-pack',
  },
  sc_money_claim: {
    sku: 'sc_money_claim',
    label: 'Scotland Money Claim Pack',
    shortLabel: 'Scotland Money Claim',
    description: 'Recover rent arrears through Simple Procedure',
    price: 99.99,
    displayPrice: '£99.99',
    priceNote: 'Service discontinued - use Notice Only',
    wizardHref: '/wizard?product=notice_only&jurisdiction=scotland',
    productPageHref: '/notice-only',
  },
  ast_standard: {
    sku: 'ast_standard',
    label: 'Standard Tenancy Agreement',
    shortLabel: 'Standard AST',
    description: 'Government-compliant AST or PRT for your letting',
    price: 9.99,
    displayPrice: '£9.99',
    wizardHref: '/wizard?product=ast_standard',
    productPageHref: '/ast',
  },
  ast_premium: {
    sku: 'ast_premium',
    label: 'Premium Tenancy Agreement',
    shortLabel: 'Premium AST',
    description: 'Enhanced AST with additional clauses and protections',
    price: 14.99,
    displayPrice: '£14.99',
    wizardHref: '/wizard?product=ast_premium',
    productPageHref: '/ast',
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
    displayPrice: '£39.99',
    wizardHref: '/wizard?product=notice_only',
  },
  complete_pack: {
    primarySku: 'complete_pack',
    label: 'Get Complete Eviction Pack',
    description: 'Full bundle with notice, court forms, and guidance',
    displayPrice: '£149.99',
    priceNote: 'England only',
    wizardHref: '/wizard?product=complete_pack',
  },
  money_claim: {
    primarySku: 'money_claim',
    label: 'Start Money Claim',
    description: 'Recover rent arrears through the courts',
    displayPrice: '£99.99',
    priceNote: 'England only',
    wizardHref: '/wizard?product=money_claim',
  },
  tenancy_agreement: {
    primarySku: 'ast_standard',
    label: 'Create Tenancy Agreement',
    description: 'Generate a compliant AST or PRT',
    displayPrice: 'from £9.99',
    priceNote: 'Standard £9.99 · Premium £14.99',
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
