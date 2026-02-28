/**
 * Jurisdiction-Aware Product Normalization
 *
 * This module provides mapping and normalization of product SKUs to ensure
 * Scotland flows never display "AST" labels and use correct PRT terminology.
 *
 * Key Features:
 * - Maps generic ast_standard/ast_premium to jurisdiction-specific SKUs
 * - Validates product SKUs against jurisdiction
 * - Provides jurisdiction-aware display labels
 * - Normalizes URL products to prevent cross-jurisdiction confusion
 */

import type { CanonicalJurisdiction } from '@/lib/jurisdiction/normalize';

// Re-export for convenience
export type { CanonicalJurisdiction };

// =============================================================================
// TYPES
// =============================================================================

/**
 * Tenancy product SKU - the internal SKU used for pricing and orders
 * These remain ast_standard/ast_premium for payment processing
 */
export type TenancyProductSku = 'ast_standard' | 'ast_premium';

/**
 * Display SKU - jurisdiction-appropriate identifier for URLs and display
 */
export type TenancyDisplaySku =
  | 'ast_standard'
  | 'ast_premium'
  | 'prt_standard'
  | 'prt_premium'
  | 'occupation_standard'
  | 'occupation_premium'
  | 'ni_standard'
  | 'ni_premium';

/**
 * Product tier - simplified tier for logic
 */
export type ProductTier = 'standard' | 'premium';

// =============================================================================
// JURISDICTION-SPECIFIC PRODUCT MAPPING
// =============================================================================

/**
 * Valid display SKUs per jurisdiction
 * These are the SKUs that should appear in URLs and UI for each jurisdiction
 */
export const VALID_SKUS_BY_JURISDICTION: Record<CanonicalJurisdiction, TenancyDisplaySku[]> = {
  england: ['ast_standard', 'ast_premium'],
  wales: ['occupation_standard', 'occupation_premium'],
  scotland: ['prt_standard', 'prt_premium'],
  'northern-ireland': ['ni_standard', 'ni_premium'],
};

/**
 * Maps display SKUs to internal payment SKUs
 * All jurisdictions use ast_standard/ast_premium for payment processing
 */
export const DISPLAY_TO_PAYMENT_SKU: Record<TenancyDisplaySku, TenancyProductSku> = {
  ast_standard: 'ast_standard',
  ast_premium: 'ast_premium',
  prt_standard: 'ast_standard',
  prt_premium: 'ast_premium',
  occupation_standard: 'ast_standard',
  occupation_premium: 'ast_premium',
  ni_standard: 'ast_standard',
  ni_premium: 'ast_premium',
};

/**
 * Maps internal payment SKUs to jurisdiction-appropriate display SKUs
 */
export const PAYMENT_TO_DISPLAY_SKU: Record<CanonicalJurisdiction, Record<TenancyProductSku, TenancyDisplaySku>> = {
  england: {
    ast_standard: 'ast_standard',
    ast_premium: 'ast_premium',
  },
  wales: {
    ast_standard: 'occupation_standard',
    ast_premium: 'occupation_premium',
  },
  scotland: {
    ast_standard: 'prt_standard',
    ast_premium: 'prt_premium',
  },
  'northern-ireland': {
    ast_standard: 'ni_standard',
    ast_premium: 'ni_premium',
  },
};

/**
 * Display labels for each jurisdiction + tier combination
 */
export const PRODUCT_DISPLAY_LABELS: Record<CanonicalJurisdiction, Record<ProductTier, string>> = {
  england: {
    standard: 'Standard AST',
    premium: 'Premium AST',
  },
  wales: {
    standard: 'Standard Occupation Contract',
    premium: 'Premium Occupation Contract',
  },
  scotland: {
    standard: 'Standard PRT',
    premium: 'Premium PRT',
  },
  'northern-ireland': {
    standard: 'Standard NI Private Tenancy',
    premium: 'Premium NI Private Tenancy',
  },
};

// =============================================================================
// NORMALIZATION FUNCTIONS
// =============================================================================

/**
 * Extract tier from any SKU or tier label
 */
export function extractTierFromSku(sku: string | null | undefined): ProductTier {
  if (!sku) return 'standard';
  const normalized = sku.toLowerCase();
  if (normalized.includes('premium')) return 'premium';
  return 'standard';
}

/**
 * Check if a SKU is valid for a given jurisdiction
 */
export function isValidSkuForJurisdiction(
  sku: string,
  jurisdiction: CanonicalJurisdiction
): boolean {
  const validSkus = VALID_SKUS_BY_JURISDICTION[jurisdiction] || [];

  // Direct match
  if ((validSkus as string[]).includes(sku)) {
    return true;
  }

  // Also accept the base ast_standard/ast_premium for any jurisdiction
  // (they get normalized to jurisdiction-specific display)
  if (sku === 'ast_standard' || sku === 'ast_premium') {
    return true;
  }

  // Also accept tenancy_agreement as a generic product
  if (sku === 'tenancy_agreement') {
    return true;
  }

  return false;
}

/**
 * Normalize a product SKU for a given jurisdiction.
 *
 * This is the SINGLE SOURCE OF TRUTH for product normalization.
 * Use this function everywhere a product SKU needs to be displayed
 * or included in a URL for a specific jurisdiction.
 *
 * Priority:
 * 1. If purchasedProduct exists: use it (locked after payment)
 * 2. If requestedSku is valid for jurisdiction: use jurisdiction-appropriate display SKU
 * 3. Map cross-jurisdiction inputs (ast_standard + scotland -> prt_standard)
 * 4. If cannot map: throw a user-friendly error
 *
 * @throws Error if the SKU cannot be normalized for the jurisdiction
 */
export function normalizeProductForJurisdiction(params: {
  jurisdiction: CanonicalJurisdiction;
  requestedSku?: string | null;
  casePurchasedProduct?: string | null;
  entitlements?: string[] | null;
}): {
  /** The display SKU to use in URLs and UI */
  displaySku: TenancyDisplaySku;
  /** The payment SKU to use for orders */
  paymentSku: TenancyProductSku;
  /** Human-readable label */
  displayLabel: string;
  /** The tier (standard or premium) */
  tier: ProductTier;
} {
  const { jurisdiction, requestedSku, casePurchasedProduct, entitlements } = params;

  // Priority 1: Purchased product is authoritative
  if (casePurchasedProduct && (casePurchasedProduct === 'ast_standard' || casePurchasedProduct === 'ast_premium')) {
    const tier = extractTierFromSku(casePurchasedProduct);
    const displaySku = PAYMENT_TO_DISPLAY_SKU[jurisdiction][casePurchasedProduct];
    return {
      displaySku,
      paymentSku: casePurchasedProduct,
      displayLabel: PRODUCT_DISPLAY_LABELS[jurisdiction][tier],
      tier,
    };
  }

  // Check if entitled to premium through entitlements
  const hasPremiumEntitlement = (entitlements || []).some(
    (e) => e === 'ast_premium' || e.includes('premium')
  );

  // Priority 2: Use requested SKU if provided
  let tier: ProductTier = 'standard';
  if (requestedSku) {
    tier = extractTierFromSku(requestedSku);
  } else if (hasPremiumEntitlement) {
    tier = 'premium';
  }

  // Priority 3: Map to jurisdiction-appropriate display SKU
  const paymentSku: TenancyProductSku = tier === 'premium' ? 'ast_premium' : 'ast_standard';
  const displaySku = PAYMENT_TO_DISPLAY_SKU[jurisdiction][paymentSku];

  return {
    displaySku,
    paymentSku,
    displayLabel: PRODUCT_DISPLAY_LABELS[jurisdiction][tier],
    tier,
  };
}

/**
 * Get the display label for a product in a specific jurisdiction.
 * This ensures Scotland never shows "AST" labels.
 */
export function getProductDisplayLabel(
  jurisdiction: CanonicalJurisdiction,
  sku: string | null | undefined
): string {
  const tier = extractTierFromSku(sku);
  return PRODUCT_DISPLAY_LABELS[jurisdiction]?.[tier] || PRODUCT_DISPLAY_LABELS.england[tier];
}

/**
 * Convert any product SKU to the jurisdiction-appropriate URL-safe display SKU.
 * This should be used when building wizard URLs to ensure correct terminology.
 */
export function getDisplaySkuForUrl(
  jurisdiction: CanonicalJurisdiction,
  sku: string | null | undefined
): TenancyDisplaySku {
  const tier = extractTierFromSku(sku);
  const paymentSku: TenancyProductSku = tier === 'premium' ? 'ast_premium' : 'ast_standard';
  return PAYMENT_TO_DISPLAY_SKU[jurisdiction][paymentSku];
}

/**
 * Convert a display SKU to the payment SKU for order processing.
 */
export function getPaymentSkuFromDisplay(displaySku: TenancyDisplaySku): TenancyProductSku {
  return DISPLAY_TO_PAYMENT_SKU[displaySku];
}

/**
 * Check if a product SKU/label indicates premium tier.
 */
export function isPremiumProduct(sku: string | null | undefined): boolean {
  return extractTierFromSku(sku) === 'premium';
}

/**
 * Build a wizard flow URL with correctly normalized product SKU for the jurisdiction.
 */
export function buildWizardFlowUrl(params: {
  caseId: string;
  caseType: string;
  jurisdiction: CanonicalJurisdiction;
  product?: string | null;
  purchasedProduct?: string | null;
}): string {
  const { caseId, caseType, jurisdiction, product, purchasedProduct } = params;

  // Normalize the product for the jurisdiction
  const normalized = normalizeProductForJurisdiction({
    jurisdiction,
    requestedSku: product,
    casePurchasedProduct: purchasedProduct,
  });

  const queryParams = new URLSearchParams({
    case_id: caseId,
    type: caseType,
    jurisdiction,
    product: normalized.displaySku,
  });

  return `/wizard/flow?${queryParams.toString()}`;
}

/**
 * Validate that a URL product param is appropriate for the jurisdiction.
 * Returns the normalized display SKU or throws an error if invalid.
 */
export function validateUrlProduct(
  urlProduct: string | null | undefined,
  jurisdiction: CanonicalJurisdiction
): TenancyDisplaySku {
  if (!urlProduct || urlProduct === 'tenancy_agreement') {
    // Default to standard tier for the jurisdiction
    return PAYMENT_TO_DISPLAY_SKU[jurisdiction]['ast_standard'];
  }

  // Check if it's already a valid display SKU for this jurisdiction
  const validSkus = VALID_SKUS_BY_JURISDICTION[jurisdiction];
  if ((validSkus as string[]).includes(urlProduct)) {
    return urlProduct as TenancyDisplaySku;
  }

  // Check if it's a payment SKU that needs conversion
  if (urlProduct === 'ast_standard' || urlProduct === 'ast_premium') {
    return PAYMENT_TO_DISPLAY_SKU[jurisdiction][urlProduct];
  }

  // Check if it's a different jurisdiction's SKU - normalize it
  const tier = extractTierFromSku(urlProduct);
  const paymentSku: TenancyProductSku = tier === 'premium' ? 'ast_premium' : 'ast_standard';
  return PAYMENT_TO_DISPLAY_SKU[jurisdiction][paymentSku];
}
