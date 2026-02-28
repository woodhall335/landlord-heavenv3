/**
 * Centralized Cross-Sell Configuration
 *
 * Single source of truth for all cross-sell recommendations across the site.
 * Ensures consistent messaging and prevents drift between pages.
 *
 * Usage:
 * - Import relevant cross-sell config for your page type
 * - Pass to CrossSellBanner or RelatedLinks components
 *
 * @see /src/components/cross-sell/CrossSellBanner.tsx for rendering
 */

import { buildWizardLink, type WizardProduct, type WizardJurisdiction } from '@/lib/wizard/buildWizardLink';
import { PRODUCTS } from '@/lib/pricing/products';

// =============================================================================
// TYPES
// =============================================================================

export type CrossSellSource =
  | 'seo_eviction'
  | 'seo_money_claim'
  | 'seo_tenancy'
  | 'product_notice_only'
  | 'product_complete_pack'
  | 'product_money_claim'
  | 'product_tenancy'
  | 'tool_s21_generator'
  | 'tool_s8_generator'
  | 'tool_rent_calculator'
  | 'tool_rent_demand'
  | 'validator_section21'
  | 'validator_section8'
  | 'blog'
  | 'dashboard';

export interface CrossSellRecommendation {
  /** Target product */
  product: WizardProduct;
  /** Display title */
  title: string;
  /** Short description explaining the cross-sell angle */
  description: string;
  /** Price display */
  price: string;
  /** CTA button text */
  ctaText: string;
  /** Why this cross-sell is relevant */
  angle: string;
  /** Priority for display order (lower = higher priority) */
  priority: number;
}

export interface CrossSellConfig {
  /** Primary recommendation */
  primary: CrossSellRecommendation;
  /** Secondary recommendation (optional) */
  secondary?: CrossSellRecommendation;
  /** Source tracking value */
  src: CrossSellSource;
}

// =============================================================================
// CROSS-SELL DEFINITIONS
// =============================================================================

/**
 * Money Claim recommendation for eviction pages (arrears angle)
 */
const MONEY_CLAIM_FOR_EVICTION: CrossSellRecommendation = {
  product: 'money_claim',
  title: 'Recover Unpaid Rent',
  description: 'Already served your notice? Claim back the rent arrears through MCOL.',
  price: PRODUCTS.money_claim.displayPrice,
  ctaText: 'Start Money Claim',
  angle: 'arrears',
  priority: 1,
};

/**
 * Notice Only recommendation for money claim pages (tenant still there)
 */
const NOTICE_ONLY_FOR_MONEY_CLAIM: CrossSellRecommendation = {
  product: 'notice_only',
  title: 'Eviction Notice',
  description: 'Tenant still in the property? Serve a Section 8 notice alongside your money claim.',
  price: PRODUCTS.notice_only.displayPrice,
  ctaText: 'Get Eviction Notice',
  angle: 'tenant_still_in_property',
  priority: 1,
};

/**
 * Complete Pack for money claim pages (full eviction option)
 */
const COMPLETE_PACK_FOR_MONEY_CLAIM: CrossSellRecommendation = {
  product: 'complete_pack',
  title: 'Complete Eviction Pack',
  description: 'Need to go to court? Get all forms including possession claim.',
  price: PRODUCTS.complete_pack.displayPrice,
  ctaText: 'View Complete Pack',
  angle: 'court_proceedings',
  priority: 2,
};

/**
 * Notice Only for tenancy pages (future-proofing)
 */
const NOTICE_ONLY_FOR_TENANCY: CrossSellRecommendation = {
  product: 'notice_only',
  title: 'Eviction Notices',
  description: 'Problems with your tenant? Get court-ready Section 21 & Section 8 notices.',
  price: PRODUCTS.notice_only.displayPrice,
  ctaText: 'View Eviction Notices',
  angle: 'future_proofing',
  priority: 1,
};

/**
 * Complete Pack for tenancy pages (full eviction)
 */
const COMPLETE_PACK_FOR_TENANCY: CrossSellRecommendation = {
  product: 'complete_pack',
  title: 'Complete Eviction Pack',
  description: 'Get everything you need to regain possession, including court forms.',
  price: PRODUCTS.complete_pack.displayPrice,
  ctaText: 'View Complete Pack',
  angle: 'full_eviction',
  priority: 2,
};

/**
 * Tenancy Agreement for eviction pages (new tenant)
 */
const TENANCY_FOR_EVICTION: CrossSellRecommendation = {
  product: 'ast_standard',
  title: 'Tenancy Agreement',
  description: 'Getting a new tenant? Create a compliant AST with all required clauses.',
  price: `From ${PRODUCTS.ast_standard.displayPrice}`,
  ctaText: 'Create Agreement',
  angle: 'new_tenant',
  priority: 2,
};

// =============================================================================
// PAGE-SPECIFIC CROSS-SELL CONFIGS
// =============================================================================

/**
 * Cross-sell config for Eviction pages (Section 21, Section 8, Notice Only product)
 * Primary: Money Claim (arrears angle)
 * Secondary: Tenancy Agreement (new tenant angle)
 */
export const EVICTION_PAGE_CROSS_SELLS: CrossSellConfig = {
  primary: MONEY_CLAIM_FOR_EVICTION,
  secondary: TENANCY_FOR_EVICTION,
  src: 'seo_eviction',
};

/**
 * Cross-sell config for Money Claim pages
 * Primary: Notice Only (tenant still in property)
 * Secondary: Complete Pack (court proceedings)
 */
export const MONEY_CLAIM_PAGE_CROSS_SELLS: CrossSellConfig = {
  primary: NOTICE_ONLY_FOR_MONEY_CLAIM,
  secondary: COMPLETE_PACK_FOR_MONEY_CLAIM,
  src: 'seo_money_claim',
};

/**
 * Cross-sell config for Tenancy Agreement pages
 * Primary: Notice Only (future-proofing)
 * Secondary: Complete Pack (full eviction)
 */
export const TENANCY_PAGE_CROSS_SELLS: CrossSellConfig = {
  primary: NOTICE_ONLY_FOR_TENANCY,
  secondary: COMPLETE_PACK_FOR_TENANCY,
  src: 'seo_tenancy',
};

// =============================================================================
// TOOL-SPECIFIC CROSS-SELL CONFIGS
// =============================================================================

/**
 * Cross-sell config for Section 21 Generator/Validator
 * Primary: Notice Only Pack (main product)
 * Secondary: Money Claim (arrears angle)
 */
export const SECTION21_TOOL_CROSS_SELLS: CrossSellConfig = {
  primary: {
    product: 'notice_only',
    title: 'Court-Ready Notice Pack',
    description: 'Get a valid, court-ready Section 21 with serving instructions.',
    price: PRODUCTS.notice_only.displayPrice,
    ctaText: 'Get Notice Pack',
    angle: 'upgrade_from_free',
    priority: 1,
  },
  secondary: MONEY_CLAIM_FOR_EVICTION,
  src: 'validator_section21',
};

/**
 * Cross-sell config for Section 8 Generator/Validator
 * Primary: Notice Only Pack (main product)
 * Secondary: Complete Pack (for court proceedings)
 */
export const SECTION8_TOOL_CROSS_SELLS: CrossSellConfig = {
  primary: {
    product: 'notice_only',
    title: 'Court-Ready Notice Pack',
    description: 'Get Section 8 + Section 21 notices with full legal grounds.',
    price: PRODUCTS.notice_only.displayPrice,
    ctaText: 'Get Notice Pack',
    angle: 'upgrade_from_free',
    priority: 1,
  },
  secondary: {
    product: 'complete_pack',
    title: 'Complete Eviction Pack',
    description: 'For court proceedings: N5B, witness statements, and more.',
    price: PRODUCTS.complete_pack.displayPrice,
    ctaText: 'View Complete Pack',
    angle: 'court_proceedings',
    priority: 2,
  },
  src: 'validator_section8',
};

/**
 * Cross-sell config for Rent Arrears Calculator
 * Primary: Money Claim Pack
 * Secondary: Notice Only (Section 8 for arrears)
 */
export const RENT_CALCULATOR_CROSS_SELLS: CrossSellConfig = {
  primary: {
    product: 'money_claim',
    title: 'Recover Your Rent',
    description: 'File a money claim through MCOL to recover these arrears.',
    price: PRODUCTS.money_claim.displayPrice,
    ctaText: 'Start Money Claim',
    angle: 'calculated_arrears',
    priority: 1,
  },
  secondary: {
    product: 'notice_only',
    title: 'Eviction for Arrears',
    description: 'Serve Section 8 notice using Ground 8/10/11 for rent arrears.',
    price: PRODUCTS.notice_only.displayPrice,
    ctaText: 'Get Eviction Notice',
    angle: 'arrears_eviction',
    priority: 2,
  },
  src: 'tool_rent_calculator',
};

/**
 * Cross-sell config for Rent Demand Letter Generator
 * Primary: Money Claim Pack (next step after demand)
 * Secondary: Notice Only (eviction option)
 */
export const RENT_DEMAND_CROSS_SELLS: CrossSellConfig = {
  primary: {
    product: 'money_claim',
    title: 'File a Money Claim',
    description: 'If tenant still hasn\'t paid, recover through MCOL.',
    price: PRODUCTS.money_claim.displayPrice,
    ctaText: 'Start Money Claim',
    angle: 'demand_escalation',
    priority: 1,
  },
  secondary: NOTICE_ONLY_FOR_MONEY_CLAIM,
  src: 'tool_rent_demand',
};

// =============================================================================
// PRODUCT PAGE CROSS-SELL CONFIGS
// =============================================================================

/**
 * Cross-sell config for Notice Only product page
 * Upsell to Complete Pack, cross-sell to Money Claim
 */
export const NOTICE_ONLY_PRODUCT_CROSS_SELLS: CrossSellConfig = {
  primary: {
    product: 'complete_pack',
    title: 'Need Court Forms Too?',
    description: 'The Complete Pack includes everything for court proceedings.',
    price: PRODUCTS.complete_pack.displayPrice,
    ctaText: 'View Complete Pack',
    angle: 'upsell',
    priority: 1,
  },
  secondary: MONEY_CLAIM_FOR_EVICTION,
  src: 'product_notice_only',
};

/**
 * Cross-sell config for Complete Pack product page
 * Cross-sell to Money Claim
 */
export const COMPLETE_PACK_PRODUCT_CROSS_SELLS: CrossSellConfig = {
  primary: MONEY_CLAIM_FOR_EVICTION,
  secondary: TENANCY_FOR_EVICTION,
  src: 'product_complete_pack',
};

/**
 * Cross-sell config for Money Claim product page
 * Cross-sell to eviction products
 */
export const MONEY_CLAIM_PRODUCT_CROSS_SELLS: CrossSellConfig = {
  primary: NOTICE_ONLY_FOR_MONEY_CLAIM,
  secondary: COMPLETE_PACK_FOR_MONEY_CLAIM,
  src: 'product_money_claim',
};

/**
 * Cross-sell config for Tenancy Agreement product page
 * Cross-sell to eviction products (future-proofing)
 */
export const TENANCY_PRODUCT_CROSS_SELLS: CrossSellConfig = {
  primary: NOTICE_ONLY_FOR_TENANCY,
  secondary: COMPLETE_PACK_FOR_TENANCY,
  src: 'product_tenancy',
};

// =============================================================================
// DASHBOARD CROSS-SELL CONFIGS (NEXT BEST ACTIONS)
// =============================================================================

/**
 * Dashboard cross-sell for users who purchased eviction (notice_only/complete_pack)
 * Suggest Money Claim if tenant owes rent
 */
export const DASHBOARD_POST_EVICTION_CROSS_SELLS: CrossSellConfig = {
  primary: {
    product: 'money_claim',
    title: 'Recover Unpaid Rent',
    description: 'Tenant left owing rent? Claim it back through MCOL.',
    price: PRODUCTS.money_claim.displayPrice,
    ctaText: 'Start Money Claim',
    angle: 'post_eviction_arrears',
    priority: 1,
  },
  secondary: {
    product: 'ast_standard',
    title: 'New Tenancy Agreement',
    description: 'Got a new tenant? Create a compliant agreement.',
    price: `From ${PRODUCTS.ast_standard.displayPrice}`,
    ctaText: 'Create Agreement',
    angle: 'new_tenant_post_eviction',
    priority: 2,
  },
  src: 'dashboard',
};

/**
 * Dashboard cross-sell for users who purchased tenancy agreement
 * Suggest eviction products if needed
 */
export const DASHBOARD_POST_TENANCY_CROSS_SELLS: CrossSellConfig = {
  primary: NOTICE_ONLY_FOR_TENANCY,
  secondary: MONEY_CLAIM_FOR_EVICTION,
  src: 'dashboard',
};

/**
 * Dashboard cross-sell for users who purchased money claim
 * Suggest eviction if tenant still there
 */
export const DASHBOARD_POST_MONEY_CLAIM_CROSS_SELLS: CrossSellConfig = {
  primary: NOTICE_ONLY_FOR_MONEY_CLAIM,
  secondary: COMPLETE_PACK_FOR_MONEY_CLAIM,
  src: 'dashboard',
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Build wizard link with cross-sell tracking
 */
export function buildCrossSellLink(
  recommendation: CrossSellRecommendation,
  src: CrossSellSource,
  jurisdiction?: WizardJurisdiction
): string {
  return buildWizardLink({
    product: recommendation.product,
    jurisdiction,
    src: src as any, // Type will be extended in buildWizardLink
    topic: recommendation.product === 'money_claim' ? 'money_claim' :
           recommendation.product.startsWith('ast') ? 'tenancy' : 'eviction',
  });
}

/**
 * Get cross-sell config by page type
 */
export function getCrossSellConfigByPageType(
  pageType: 'eviction' | 'money_claim' | 'tenancy' | 'tool_section21' | 'tool_section8' | 'tool_rent_calculator' | 'tool_rent_demand'
): CrossSellConfig {
  switch (pageType) {
    case 'eviction':
      return EVICTION_PAGE_CROSS_SELLS;
    case 'money_claim':
      return MONEY_CLAIM_PAGE_CROSS_SELLS;
    case 'tenancy':
      return TENANCY_PAGE_CROSS_SELLS;
    case 'tool_section21':
      return SECTION21_TOOL_CROSS_SELLS;
    case 'tool_section8':
      return SECTION8_TOOL_CROSS_SELLS;
    case 'tool_rent_calculator':
      return RENT_CALCULATOR_CROSS_SELLS;
    case 'tool_rent_demand':
      return RENT_DEMAND_CROSS_SELLS;
    default:
      return EVICTION_PAGE_CROSS_SELLS;
  }
}

/**
 * Get dashboard cross-sell config based on previous purchase type
 */
export function getDashboardCrossSellConfig(
  lastPurchaseType: 'eviction' | 'money_claim' | 'tenancy'
): CrossSellConfig {
  switch (lastPurchaseType) {
    case 'eviction':
      return DASHBOARD_POST_EVICTION_CROSS_SELLS;
    case 'money_claim':
      return DASHBOARD_POST_MONEY_CLAIM_CROSS_SELLS;
    case 'tenancy':
      return DASHBOARD_POST_TENANCY_CROSS_SELLS;
    default:
      return DASHBOARD_POST_EVICTION_CROSS_SELLS;
  }
}

/**
 * Export all cross-sell configs for testing/validation
 */
export const ALL_CROSS_SELL_CONFIGS = {
  eviction: EVICTION_PAGE_CROSS_SELLS,
  money_claim: MONEY_CLAIM_PAGE_CROSS_SELLS,
  tenancy: TENANCY_PAGE_CROSS_SELLS,
  section21_tool: SECTION21_TOOL_CROSS_SELLS,
  section8_tool: SECTION8_TOOL_CROSS_SELLS,
  rent_calculator: RENT_CALCULATOR_CROSS_SELLS,
  rent_demand: RENT_DEMAND_CROSS_SELLS,
  notice_only_product: NOTICE_ONLY_PRODUCT_CROSS_SELLS,
  complete_pack_product: COMPLETE_PACK_PRODUCT_CROSS_SELLS,
  money_claim_product: MONEY_CLAIM_PRODUCT_CROSS_SELLS,
  tenancy_product: TENANCY_PRODUCT_CROSS_SELLS,
  dashboard_post_eviction: DASHBOARD_POST_EVICTION_CROSS_SELLS,
  dashboard_post_tenancy: DASHBOARD_POST_TENANCY_CROSS_SELLS,
  dashboard_post_money_claim: DASHBOARD_POST_MONEY_CLAIM_CROSS_SELLS,
};
