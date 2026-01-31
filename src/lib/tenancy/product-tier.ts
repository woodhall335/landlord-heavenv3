export type TenancyJurisdiction = 'england' | 'wales' | 'scotland' | 'northern-ireland';

export type TenancyProductSku = 'ast_standard' | 'ast_premium';

const TENANCY_TIER_QUESTION_ID: Record<TenancyJurisdiction, string> = {
  england: 'ast_tier',
  wales: 'occupation_contract_tier',
  scotland: 'prt_tier',
  'northern-ireland': 'ni_tier',
};

export function getTenancyTierQuestionId(jurisdiction: TenancyJurisdiction): string {
  return TENANCY_TIER_QUESTION_ID[jurisdiction];
}

export function getTenancyTierLabelForSku(
  sku: TenancyProductSku,
  jurisdiction: TenancyJurisdiction
): string {
  if (jurisdiction === 'wales') {
    return sku === 'ast_premium' ? 'Premium Occupation Contract' : 'Standard Occupation Contract';
  }
  if (jurisdiction === 'scotland') {
    return sku === 'ast_premium' ? 'Premium PRT' : 'Standard PRT';
  }
  if (jurisdiction === 'northern-ireland') {
    return sku === 'ast_premium' ? 'Premium NI Private Tenancy' : 'Standard NI Private Tenancy';
  }
  return sku === 'ast_premium' ? 'Premium AST' : 'Standard AST';
}

export function inferTenancySkuFromTierLabel(
  tierLabel?: string | null
): TenancyProductSku | null {
  if (!tierLabel) return null;
  const normalized = tierLabel.toLowerCase();
  if (normalized.includes('premium')) return 'ast_premium';
  if (normalized.includes('standard')) return 'ast_standard';
  return null;
}

export function getTenancyTierLabelFromFacts(facts: Record<string, any>): string | null {
  return (
    facts.product_tier ||
    facts.ast_tier ||
    facts.occupation_contract_tier ||
    facts.prt_tier ||
    facts.ni_tier ||
    null
  );
}

export function inferTenancySkuFromFacts(
  facts: Record<string, any>
): TenancyProductSku | null {
  return inferTenancySkuFromTierLabel(getTenancyTierLabelFromFacts(facts));
}

export function isPremiumTierLabel(tierLabel?: string | null): boolean {
  return inferTenancySkuFromTierLabel(tierLabel) === 'ast_premium';
}

/**
 * Pricing constants for tenancy products
 * Single source of truth for all pricing displays
 */
export const TENANCY_PRICING = {
  ast_standard: {
    price: 14.99,
    displayPrice: '£14.99',
    originalPrice: '£100+',
    savings: 'Save £85+ vs solicitors',
  },
  ast_premium: {
    price: 24.99,
    displayPrice: '£24.99',
    originalPrice: '£200+',
    savings: 'Save £175+ vs solicitors',
  },
} as const;

/**
 * Resolve the effective product SKU using a consistent priority order.
 * This is the SINGLE SOURCE OF TRUTH for determining which product tier
 * applies to a case. All UI components should use this function.
 *
 * Priority order:
 * 1. purchased_product - if the user has already paid, this is authoritative
 * 2. urlProduct - the product param from the wizard URL
 * 3. inferred from facts - detect tier from case_facts.product_tier or jurisdiction-specific tier fields
 *
 * @param params.purchasedProduct - Product SKU from a completed purchase
 * @param params.urlProduct - Product param from URL query string
 * @param params.facts - Case facts that may contain tier information
 * @returns The effective product SKU (defaults to 'ast_standard' if nothing else matches)
 */
export function resolveEffectiveProduct(params: {
  purchasedProduct?: string | null;
  urlProduct?: string | null;
  facts?: Record<string, any> | null;
}): TenancyProductSku {
  const { purchasedProduct, urlProduct, facts } = params;

  // Priority 1: Purchased product is authoritative
  if (purchasedProduct === 'ast_premium' || purchasedProduct === 'ast_standard') {
    return purchasedProduct;
  }

  // Priority 2: URL product param
  if (urlProduct === 'ast_premium' || urlProduct === 'ast_standard') {
    return urlProduct;
  }

  // Priority 3: Infer from facts
  if (facts) {
    const inferred = inferTenancySkuFromFacts(facts);
    if (inferred) {
      return inferred;
    }
  }

  // Default to standard
  return 'ast_standard';
}

/**
 * Get pricing information for a tenancy product SKU
 * @param sku - The product SKU ('ast_standard' or 'ast_premium')
 * @returns Pricing object with price, displayPrice, originalPrice, and savings
 */
export function getTenancyPricing(sku: TenancyProductSku): {
  price: number;
  displayPrice: string;
  originalPrice: string;
  savings: string;
} {
  return TENANCY_PRICING[sku];
}

/**
 * Check if a product SKU is a premium tier
 * @param sku - The product SKU to check
 * @returns true if the SKU is 'ast_premium'
 */
export function isPremiumSku(sku: TenancyProductSku | string | null | undefined): boolean {
  return sku === 'ast_premium';
}

/**
 * Detect if inventory data has been provided via the wizard.
 * This is the SINGLE SOURCE OF TRUTH for determining if inventory is wizard-completed.
 * Use this function in review pages, preview pages, and document generation.
 *
 * @param facts - Case facts object that may contain inventory data
 * @returns true if inventory data was provided via the wizard
 */
export function detectInventoryData(facts: Record<string, any> | null | undefined): boolean {
  if (!facts) return false;

  const inventoryData = facts.inventory || {};
  return Boolean(
    // Check if rooms array has items (wizard-completed inventory)
    (Array.isArray(inventoryData.rooms) && inventoryData.rooms.length > 0) ||
    // Check legacy flags that indicate inventory was attached
    facts.inventory_attached ||
    facts.inventory_provided
  );
}
