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
  | 'section13_standard'
  | 'section13_defensive'
  | 'ast_standard'
  | 'ast_premium'
  | 'tenancy_agreement'
  | 'england_standard_tenancy_agreement'
  | 'england_premium_tenancy_agreement'
  | 'england_student_tenancy_agreement'
  | 'england_hmo_shared_house_tenancy_agreement'
  | 'england_lodger_agreement'
  | 'guarantor_agreement'
  | 'residential_sublet_agreement'
  | 'lease_amendment'
  | 'lease_assignment_agreement'
  | 'rent_arrears_letter'
  | 'repayment_plan_agreement'
  | 'residential_tenancy_application'
  | 'rental_inspection_report'
  | 'inventory_schedule_condition'
  | 'flatmate_agreement'
  | 'renewal_tenancy_agreement';

export type WizardJurisdiction = 'england' | 'wales' | 'scotland' | 'northern-ireland';

export type WizardSource =
  | 'product_page'
  | 'template'
  | 'seo_landing'
  | 'validator'
  | 'tool'
  | 'blog'
  | 'ask_heaven'
  | 'nav'
  | 'footer'
  | 'pricing'
  | 'guide'
  | 'homepage'
  | 'dashboard'
  | 'about'
  | 'seo_eviction'
  | 'seo_money_claim'
  | 'seo_tenancy'
  | 'seo_section_8_notice_template'
  | 'seo_rent_arrears_letter_template'
  | 'seo_section_8_rent_arrears_eviction'
  | `seo_${string}`;

export type WizardTopic =
  | 'eviction'
  | 'arrears'
  | 'tenancy'
  | 'deposit'
  | 'compliance'
  | 'money_claim'
  | 'debt'
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
 * Northern Ireland only supports tenancy agreement flows.
 */
export function isProductSupportedInJurisdiction(
  product: WizardProduct,
  jurisdiction: WizardJurisdiction
): boolean {
  const englandOnlyProducts: WizardProduct[] = [
    'complete_pack',
    'money_claim',
    'section13_standard',
    'section13_defensive',
  ];
  const englandOnlyResidentialProducts: WizardProduct[] = [
    'guarantor_agreement',
    'england_standard_tenancy_agreement',
    'england_premium_tenancy_agreement',
    'england_student_tenancy_agreement',
    'england_hmo_shared_house_tenancy_agreement',
    'england_lodger_agreement',
    'residential_sublet_agreement',
    'lease_amendment',
    'lease_assignment_agreement',
    'rent_arrears_letter',
    'repayment_plan_agreement',
    'residential_tenancy_application',
    'rental_inspection_report',
    'inventory_schedule_condition',
    'flatmate_agreement',
    'renewal_tenancy_agreement',
  ];

  if (englandOnlyProducts.includes(product)) {
    return jurisdiction === 'england';
  }

  if (englandOnlyResidentialProducts.includes(product)) {
    return jurisdiction === 'england';
  }

  if (jurisdiction === 'northern-ireland') {
    return product === 'tenancy_agreement' || product === 'ast_standard' || product === 'ast_premium';
  }

  if (jurisdiction === 'wales' || jurisdiction === 'scotland') {
    return (
      product === 'notice_only' ||
      product === 'tenancy_agreement' ||
      product === 'ast_standard' ||
      product === 'ast_premium'
    );
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
    // Northern Ireland only supports tenancy agreement flows
    if (jurisdiction === 'northern-ireland') {
      return 'ast_standard';
    }

    if (
      (jurisdiction === 'wales' || jurisdiction === 'scotland') &&
      (product === 'complete_pack' || product === 'money_claim')
    ) {
      return 'notice_only';
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
      section13_standard: 'Section 13 rent increase packs',
      section13_defensive: 'Section 13 tribunal-ready packs',
      ast_standard: 'Tenancy agreements',
      ast_premium: 'Premium tenancy agreements',
      tenancy_agreement: 'Tenancy agreements',
      england_standard_tenancy_agreement: 'Standard England tenancy agreements',
      england_premium_tenancy_agreement: 'Premium England tenancy agreements',
      england_student_tenancy_agreement: 'Student tenancy agreements',
      england_hmo_shared_house_tenancy_agreement: 'HMO/shared-house tenancy agreements',
      england_lodger_agreement: 'Lodger agreements',
      guarantor_agreement: 'Guarantor agreements',
      residential_sublet_agreement: 'Residential sublet agreements',
      lease_amendment: 'Lease amendments',
      lease_assignment_agreement: 'Lease assignment agreements',
      rent_arrears_letter: 'Rent arrears letters',
      repayment_plan_agreement: 'Repayment plan agreements',
      residential_tenancy_application: 'Residential tenancy applications',
      rental_inspection_report: 'Rental inspection reports',
      inventory_schedule_condition: 'Inventory schedules',
      flatmate_agreement: 'Flatmate agreements',
      renewal_tenancy_agreement: 'Renewal tenancy agreements',
    };
      return `${productNames[product]} are not currently available for Northern Ireland. We support standard and premium tenancy agreement flows for Northern Ireland properties.`;
  }

  if (jurisdiction === 'wales' || jurisdiction === 'scotland') {
    if (product === 'complete_pack') {
      return `The Complete Eviction Pack is currently available for England only. For ${jurisdiction === 'wales' ? 'Wales' : 'Scotland'}, use the Notice Only pack for the live notice route.`;
    }

    if (product === 'money_claim') {
      return `The Money Claim Pack is currently available for England only. For ${jurisdiction === 'wales' ? 'Wales' : 'Scotland'}, this product is not currently sold.`;
    }

    return 'This residential landlord document is currently available for England properties only.';
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
  // Legacy convenience aliases route unsupported jurisdictions into the live notice flow.
  completePackWales: buildWizardLink({
    product: 'notice_only',
    jurisdiction: 'wales',
    src: 'nav',
    topic: 'eviction',
  }),
  completePackScotland: buildWizardLink({
    product: 'notice_only',
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
    product: 'notice_only',
    jurisdiction: 'scotland',
    src: 'nav',
    topic: 'eviction',
  }),
  section13Standard: buildWizardLink({
    product: 'section13_standard',
    jurisdiction: 'england',
    src: 'nav',
    topic: 'general',
  }),
  section13Defensive: buildWizardLink({
    product: 'section13_defensive',
    jurisdiction: 'england',
    src: 'nav',
    topic: 'general',
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
