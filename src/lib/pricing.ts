/**
 * PRICING CONFIGURATION
 *
 * Single source of truth for all product pricing
 * Based on LANDLORD_HEAVEN_BLUEPRINT_v6.0.md
 *
 * DO NOT modify these without updating the blueprint
 */

export const PRICING = {
  // Eviction Products (One-Time)
  // NOTE: These prices must match src/lib/pricing/products.ts (source of truth for UI)
  NOTICE_ONLY: 39.99,
  COMPLETE_EVICTION_PACK: 199.99,
  MONEY_CLAIM_PACK: 199.99,

  // Tenancy Products (One-Time)
  STANDARD_AST: 9.99,
  PREMIUM_AST: 14.99,

  // HMO Pro Membership (TIERED SUBSCRIPTION)
  HMO_PRO: {
    TIER_1: { properties: '1-5', price: 19.99, label: '1-5 HMOs' },
    TIER_2: { properties: '6-10', price: 24.99, label: '6-10 HMOs' },
    TIER_3: { properties: '11-15', price: 29.99, label: '11-15 HMOs' },
    TIER_4: { properties: '16-20', price: 34.99, label: '16-20 HMOs' },
    // Formula: +£5 per 5 HMOs after tier 4
    BASE_PRICE: 19.99,
    INCREMENT_PER_5_PROPERTIES: 5.00,
  },
} as const;

/**
 * Calculate HMO Pro price based on number of properties
 */
export function calculateHMOProPrice(propertyCount: number): number {
  if (propertyCount <= 5) return PRICING.HMO_PRO.TIER_1.price;
  if (propertyCount <= 10) return PRICING.HMO_PRO.TIER_2.price;
  if (propertyCount <= 15) return PRICING.HMO_PRO.TIER_3.price;
  if (propertyCount <= 20) return PRICING.HMO_PRO.TIER_4.price;

  // Calculate for 21+ properties: £34.99 + (extra tiers * £5)
  const extraProperties = propertyCount - 20;
  const extraTiers = Math.ceil(extraProperties / 5);
  return PRICING.HMO_PRO.TIER_4.price + (extraTiers * PRICING.HMO_PRO.INCREMENT_PER_5_PROPERTIES);
}

/**
 * Get HMO Pro tier label based on property count
 */
export function getHMOProTier(propertyCount: number): string {
  if (propertyCount <= 5) return PRICING.HMO_PRO.TIER_1.label;
  if (propertyCount <= 10) return PRICING.HMO_PRO.TIER_2.label;
  if (propertyCount <= 15) return PRICING.HMO_PRO.TIER_3.label;
  if (propertyCount <= 20) return PRICING.HMO_PRO.TIER_4.label;
  return `${propertyCount} HMOs`;
}

/**
 * Format price for display (£XX.XX)
 */
export function formatPrice(price: number): string {
  return `£${price.toFixed(2)}`;
}

/**
 * Product IDs for Stripe integration
 */
export const PRODUCT_IDS = {
  NOTICE_ONLY: 'notice_only',
  COMPLETE_PACK: 'complete_pack',
  MONEY_CLAIM: 'money_claim',
  AST_STANDARD: 'ast_standard',
  AST_PREMIUM: 'ast_premium',
  HMO_PRO: 'hmo_pro',
} as const;

/**
 * Product names for display
 */
export const PRODUCT_NAMES = {
  [PRODUCT_IDS.NOTICE_ONLY]: 'Notice Only',
  [PRODUCT_IDS.COMPLETE_PACK]: 'Complete Eviction Pack',
  [PRODUCT_IDS.MONEY_CLAIM]: 'Money Claim Pack',
  [PRODUCT_IDS.AST_STANDARD]: 'Standard AST',
  [PRODUCT_IDS.AST_PREMIUM]: 'Premium AST',
  [PRODUCT_IDS.HMO_PRO]: 'HMO Pro',
} as const;
