/**
 * Build Wizard Link Utility
 *
 * Generates consistent, trackable URLs for wizard entry points.
 * Supports product, jurisdiction, source tracking, and UTM parameters.
 */

export type WizardProduct =
  | 'notice_only'
  | 'complete_pack'
  | 'money_claim'
  | 'ast_standard'
  | 'ast_premium'
  | 'tenancy_agreement';

export type WizardJurisdiction = 'england' | 'wales' | 'scotland' | 'northern-ireland';

export type WizardSource =
  | 'product_page'
  | 'template'
  | 'validator'
  | 'tool'
  | 'blog'
  | 'ask_heaven'
  | 'nav'
  | 'footer'
  | 'pricing'
  | 'guide'
  | 'homepage';

export type WizardTopic =
  | 'eviction'
  | 'arrears'
  | 'tenancy'
  | 'deposit'
  | 'compliance'
  | 'money_claim'
  | 'general';

export interface BuildWizardLinkParams {
  product: WizardProduct;
  jurisdiction?: WizardJurisdiction;
  src?: WizardSource;
  topic?: WizardTopic;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  /** Optional case ID for resuming */
  case_id?: string;
}

/**
 * Build a wizard URL with tracking parameters.
 *
 * @example
 * buildWizardLink({ product: 'notice_only', jurisdiction: 'england', src: 'template', topic: 'eviction' })
 * // => '/wizard?product=notice_only&jurisdiction=england&src=template&topic=eviction'
 */
export function buildWizardLink(params: BuildWizardLinkParams): string {
  const { product, jurisdiction, src, topic, utm_source, utm_medium, utm_campaign, case_id } =
    params;

  const searchParams = new URLSearchParams();

  // Required
  searchParams.set('product', product);

  // Optional params - only add if defined
  if (jurisdiction) {
    searchParams.set('jurisdiction', jurisdiction);
  }
  if (src) {
    searchParams.set('src', src);
  }
  if (topic) {
    searchParams.set('topic', topic);
  }
  if (utm_source) {
    searchParams.set('utm_source', utm_source);
  }
  if (utm_medium) {
    searchParams.set('utm_medium', utm_medium);
  }
  if (utm_campaign) {
    searchParams.set('utm_campaign', utm_campaign);
  }
  if (case_id) {
    searchParams.set('case_id', case_id);
  }

  return `/wizard?${searchParams.toString()}`;
}

/**
 * Check if a product is supported in a jurisdiction.
 * Northern Ireland only supports tenancy agreements.
 */
export function isProductSupportedInJurisdiction(
  product: WizardProduct,
  jurisdiction: WizardJurisdiction
): boolean {
  if (jurisdiction === 'northern-ireland') {
    return product === 'tenancy_agreement' || product === 'ast_standard' || product === 'ast_premium';
  }
  return true;
}

/**
 * Get the fallback product for a jurisdiction if the requested product is not supported.
 */
export function getFallbackProduct(
  product: WizardProduct,
  jurisdiction: WizardJurisdiction
): WizardProduct {
  if (!isProductSupportedInJurisdiction(product, jurisdiction)) {
    // Northern Ireland only supports tenancy agreements
    if (jurisdiction === 'northern-ireland') {
      return 'tenancy_agreement';
    }
  }
  return product;
}

/**
 * Get a human-readable message explaining why a product is not available in a jurisdiction.
 */
export function getUnsupportedProductMessage(
  product: WizardProduct,
  jurisdiction: WizardJurisdiction
): string | null {
  if (isProductSupportedInJurisdiction(product, jurisdiction)) {
    return null;
  }

  if (jurisdiction === 'northern-ireland') {
    const productNames: Record<WizardProduct, string> = {
      notice_only: 'Eviction notices',
      complete_pack: 'Complete eviction packs',
      money_claim: 'Money claims',
      ast_standard: 'Tenancy agreements',
      ast_premium: 'Premium tenancy agreements',
      tenancy_agreement: 'Tenancy agreements',
    };
    return `${productNames[product]} are not currently available for Northern Ireland. We support tenancy agreements for Northern Ireland properties.`;
  }

  return null;
}

// Pre-built links for common use cases
export const WIZARD_LINKS = {
  // Notice Only
  noticeOnlyEngland: buildWizardLink({
    product: 'notice_only',
    jurisdiction: 'england',
    src: 'nav',
    topic: 'eviction',
  }),
  noticeOnlyWales: buildWizardLink({
    product: 'notice_only',
    jurisdiction: 'wales',
    src: 'nav',
    topic: 'eviction',
  }),
  noticeOnlyScotland: buildWizardLink({
    product: 'notice_only',
    jurisdiction: 'scotland',
    src: 'nav',
    topic: 'eviction',
  }),

  // Complete Pack
  completePackEngland: buildWizardLink({
    product: 'complete_pack',
    jurisdiction: 'england',
    src: 'nav',
    topic: 'eviction',
  }),
  completePackWales: buildWizardLink({
    product: 'complete_pack',
    jurisdiction: 'wales',
    src: 'nav',
    topic: 'eviction',
  }),
  completePackScotland: buildWizardLink({
    product: 'complete_pack',
    jurisdiction: 'scotland',
    src: 'nav',
    topic: 'eviction',
  }),

  // Money Claim
  moneyClaimEngland: buildWizardLink({
    product: 'money_claim',
    jurisdiction: 'england',
    src: 'nav',
    topic: 'money_claim',
  }),
  moneyClaimScotland: buildWizardLink({
    product: 'money_claim',
    jurisdiction: 'scotland',
    src: 'nav',
    topic: 'money_claim',
  }),

  // Tenancy Agreements
  tenancyEngland: buildWizardLink({
    product: 'ast_standard',
    jurisdiction: 'england',
    src: 'nav',
    topic: 'tenancy',
  }),
  tenancyWales: buildWizardLink({
    product: 'ast_standard',
    jurisdiction: 'wales',
    src: 'nav',
    topic: 'tenancy',
  }),
  tenancyScotland: buildWizardLink({
    product: 'ast_standard',
    jurisdiction: 'scotland',
    src: 'nav',
    topic: 'tenancy',
  }),
  tenancyNI: buildWizardLink({
    product: 'tenancy_agreement',
    jurisdiction: 'northern-ireland',
    src: 'nav',
    topic: 'tenancy',
  }),
} as const;
