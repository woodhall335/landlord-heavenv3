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
    displayPrice: '£29.99',
    wizardHref: '/wizard?product=notice_only',
    productPageHref: '/notice-only',
  },
  complete_pack: {
    sku: 'complete_pack',
    label: 'Complete Eviction Pack',
    shortLabel: 'Complete Pack',
    description: 'Full bundle with notice, court forms, and guidance',
    displayPrice: '£149.99',
    wizardHref: '/wizard?product=complete_pack',
    productPageHref: '/complete-pack',
  },
  money_claim: {
    sku: 'money_claim',
    label: 'Money Claim Pack',
    shortLabel: 'Money Claim',
    description: 'Recover rent arrears through the courts',
    displayPrice: '£179.99',
    wizardHref: '/wizard?product=money_claim',
    productPageHref: '/money-claim-pack',
  },
  sc_money_claim: {
    sku: 'sc_money_claim',
    label: 'Scotland Money Claim Pack',
    shortLabel: 'Scotland Money Claim',
    description: 'Recover rent arrears through Simple Procedure',
    displayPrice: '£179.99',
    wizardHref: '/wizard?product=sc_money_claim',
    productPageHref: '/money-claim-pack',
  },
  ast_standard: {
    sku: 'ast_standard',
    label: 'Standard Tenancy Agreement',
    shortLabel: 'Standard AST',
    description: 'Government-compliant AST or PRT for your letting',
    displayPrice: '£9.99',
    wizardHref: '/wizard?product=ast_standard',
    productPageHref: '/ast',
  },
  ast_premium: {
    sku: 'ast_premium',
    label: 'Premium Tenancy Agreement',
    shortLabel: 'Premium AST',
    description: 'Enhanced AST with additional clauses and protections',
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
    displayPrice: '£29.99',
    wizardHref: '/wizard?product=notice_only',
  },
  complete_pack: {
    primarySku: 'complete_pack',
    label: 'Get Complete Eviction Pack',
    description: 'Full bundle with notice, court forms, and guidance',
    displayPrice: '£149.99',
    wizardHref: '/wizard?product=complete_pack',
  },
  money_claim: {
    primarySku: 'money_claim',
    label: 'Start Money Claim',
    description: 'Recover rent arrears through the courts',
    displayPrice: '£179.99',
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
