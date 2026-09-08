import { PRODUCTS } from '@/lib/pricing/products';

export type ConversionProduct =
  | 'notice_only'
  | 'complete_pack'
  | 'money_claim'
  | 'tenancy_agreement'
  | 'hmo_shared_house'
  | 'section13_standard'
  | 'section13_defence';

export interface SeoConversionInput {
  sourceRoute: string;
  jurisdiction: 'england' | 'wales' | 'scotland' | 'northern-ireland' | 'uk';
  cluster: string;
  pageType: string;
  primaryProduct:
    | '/products/notice-only'
    | '/products/complete-pack'
    | '/products/money-claim'
    | '/products/section-13-standard'
    | '/products/section-13-defence'
    | '/products/ast';
}

export interface ConversionMapping {
  sourceRoute: string;
  sourceCategory: string;
  visitorProblem: string;
  primaryProduct: ConversionProduct;
  secondaryProduct?: ConversionProduct;
  headline: string;
  supportingCopy: string;
  ctaLabel: string;
  destinationRoute: string;
  builderPreselection?: Record<string, string>;
  benefits: [string, string, string];
  price: string;
  previewAvailable: boolean;
  trackingId: string;
}

const moneyClaim = (sourceRoute: string, problem: string, trackingId: string): ConversionMapping => ({
  sourceRoute, sourceCategory: 'rent_arrears', visitorProblem: problem,
  primaryProduct: 'money_claim', secondaryProduct: 'notice_only',
  headline: 'Ready to turn the arrears into a clear claim file?',
  supportingCopy: 'When the debt is quantified, prepare the arrears record, pre-action letter and county court claim documents without starting the legal process from scratch.',
  ctaLabel: 'Prepare my money claim', destinationRoute: '/products/money-claim',
  builderPreselection: { type: 'money_claim', product: 'money_claim', topic: 'debt' },
  benefits: ['Organise the debt and payment history clearly.', 'Prepare the claim narrative and supporting documents.', 'Preview the available output before payment.'],
  price: PRODUCTS.money_claim.displayPrice, previewAvailable: true, trackingId,
});

const notice = (sourceRoute: string, problem: string, trackingId: string, ground?: string): ConversionMapping => ({
  sourceRoute, sourceCategory: 'eviction_notice', visitorProblem: problem,
  primaryProduct: 'notice_only', secondaryProduct: 'complete_pack',
  headline: 'Need to serve a notice for this tenancy problem?',
  supportingCopy: 'Use the guided Form 3A builder to keep the grounds, dates, service steps and evidence checks aligned. Preview the paperwork before paying.',
  ctaLabel: `Create and preview my Form 3A — ${PRODUCTS.notice_only.displayPrice}`, destinationRoute: '/products/notice-only',
  builderPreselection: { type: 'eviction', product: 'notice_only', topic: 'eviction', ...(ground ? { ground } : {}) },
  benefits: ['Use the current notice route for the facts entered.', 'Check dates and service requirements before serving.', 'Preview the available paperwork before payment.'],
  price: PRODUCTS.notice_only.displayPrice, previewAvailable: true, trackingId,
});

const courtPack = (sourceRoute: string, problem: string, trackingId: string): ConversionMapping => ({
  sourceRoute, sourceCategory: 'possession_court', visitorProblem: problem,
  primaryProduct: 'complete_pack', secondaryProduct: 'notice_only',
  headline: 'Heading toward court? Prepare the possession file',
  supportingCopy: 'When the case moves toward court, keep the notice, possession forms, arrears schedule and filing checks consistent through enforcement.',
  ctaLabel: 'Prepare my court pack', destinationRoute: '/products/complete-pack',
  builderPreselection: { type: 'eviction', product: 'complete_pack', topic: 'eviction' },
  benefits: ['Keep notice and claim details consistent.', 'Prepare the possession forms and filing checks.', 'See what the pack includes before starting.'],
  price: PRODUCTS.complete_pack.displayPrice, previewAvailable: true, trackingId,
});

const tenancyAgreement = (
  sourceRoute: string,
  problem: string,
  trackingId: string,
): ConversionMapping => ({
  sourceRoute,
  sourceCategory: 'tenancy_setup',
  visitorProblem: problem,
  primaryProduct: 'tenancy_agreement',
  headline: 'Ready to create the agreement for your property?',
  supportingCopy:
    'Choose the property jurisdiction and type of let first. The agreement route then asks for the rent, deposit, occupiers, guarantor and management details needed for the selected tenancy.',
  ctaLabel: `Choose my tenancy agreement — from ${PRODUCTS.ast_standard.displayPrice}`,
  destinationRoute: '/products/ast',
  builderPreselection: { type: 'tenancy_agreement', topic: 'tenancy' },
  benefits: [
    'Choose by jurisdiction and property setup.',
    'Answer guided questions instead of editing a blank form.',
    'Preview the supported agreement before payment.',
  ],
  price: PRODUCTS.ast_standard.displayPrice,
  previewAvailable: true,
  trackingId,
});

const rentIncrease = (
  sourceRoute: string,
  problem: string,
  trackingId: string,
  defensive: boolean,
): ConversionMapping => {
  const product = defensive ? PRODUCTS.section13_defensive : PRODUCTS.section13_standard;
  return {
    sourceRoute,
    sourceCategory: 'rent_increase',
    visitorProblem: problem,
    primaryProduct: defensive ? 'section13_defence' : 'section13_standard',
    secondaryProduct: defensive ? 'section13_standard' : 'section13_defence',
    headline: defensive
      ? 'Has the tenant challenged the increase? Prepare the evidence file'
      : 'Ready to propose the new rent? Prepare Form 4A and the evidence',
    supportingCopy: defensive
      ? 'Bring the notice, comparable rents, chronology and tribunal response materials into one consistent file before the challenge progresses.'
      : 'Create the notice and keep the proposed rent, comparable evidence, dates and service record aligned before anything is served.',
    ctaLabel: defensive
      ? `Prepare my challenge pack — ${product.displayPrice}`
      : `Prepare my rent increase pack — ${product.displayPrice}`,
    destinationRoute: defensive
      ? '/products/section-13-defence'
      : '/products/section-13-standard',
    builderPreselection: {
      type: 'rent_increase',
      product: defensive ? 'section13_defensive' : 'section13_standard',
      topic: 'general',
    },
    benefits: defensive
      ? [
          'Organise the notice and challenge chronology.',
          'Bring comparable-rent evidence into one file.',
          'Preview the available tribunal materials before payment.',
        ]
      : [
          'Prepare the current Form 4A route for England.',
          'Record comparable-rent evidence and service details.',
          'Preview the available paperwork before payment.',
        ],
    price: product.displayPrice,
    previewAvailable: true,
    trackingId,
  };
};

export const CONVERSION_REGISTRY: readonly ConversionMapping[] = [
  {
    sourceRoute: '/tools/hmo-license-checker', sourceCategory: 'hmo_compliance',
    visitorProblem: 'Work out whether a property may need HMO licensing and what to do next.',
    primaryProduct: 'hmo_shared_house', secondaryProduct: 'tenancy_agreement',
    headline: 'Set up the shared-house paperwork after checking the licence position',
    supportingCopy: 'Once the council confirms the licensing position, create shared-house paperwork covering rooms, common areas, house rules and occupier responsibilities.',
    ctaLabel: 'Build my HMO / Shared House pack', destinationRoute: '/hmo-shared-house-tenancy-agreement',
    benefits: ['Designed for shared occupation.', 'Records room and common-area responsibilities.', 'Preview the agreement pack before payment.'],
    price: PRODUCTS.england_hmo_shared_house_tenancy_agreement.displayPrice,
    previewAvailable: true, trackingId: 'hmo_checker_result_hmo_pack',
  },
  {
    sourceRoute: '/how-to-rent-guide', sourceCategory: 'tenancy_compliance',
    visitorProblem: 'Provide the current How to Rent information and set up a compliant tenancy.',
    primaryProduct: 'tenancy_agreement',
    headline: 'Setting up the tenancy after checking the guidance?',
    supportingCopy: 'When the next task is recording the tenancy terms, choose the current England agreement route that matches the property and occupiers.',
    ctaLabel: 'Create my tenancy agreement', destinationRoute: '/products/ast',
    benefits: ['Choose the appropriate agreement route.', 'Record the tenancy terms clearly.', 'Preview the supported agreement before payment.'],
    price: PRODUCTS.ast_standard.displayPrice, previewAvailable: true, trackingId: 'how_to_rent_tenancy',
  },
  moneyClaim('/blog/how-to-write-letter-before-action-unpaid-rent', 'Send compliant pre-action correspondence and recover unpaid rent.', 'lba_unpaid_rent_money_claim'),
  courtPack('/blog/bailiff-eviction-day-what-to-expect', 'Move from a possession order to lawful enforcement.', 'bailiff_guide_complete_pack'),
  notice('/blog/england-section-8-ground-1', 'Use Ground 1 correctly and evidence the landlord occupation case.', 'ground_1_notice', '1'),
  courtPack('/blog/england-county-court-forms', 'Choose and prepare the correct possession court forms.', 'court_forms_complete_pack'),
  moneyClaim('/tools/rent-arrears-calculator', 'Use the calculated arrears in pre-action and claim documents.', 'arrears_calculator_money_claim'),
  courtPack('/blog/how-long-does-eviction-take-uk', 'Plan and prepare the notice-to-enforcement route.', 'eviction_timeline_complete_pack'),
  notice('/blog/england-section-8-ground-10-11', 'Serve a notice for rent arrears using discretionary grounds.', 'grounds_10_11_notice', '10,11'),
  moneyClaim('/blog/england-money-claim-online', 'Recover a quantified landlord debt through a money claim.', 'mcol_money_claim'),
  notice('/blog/england-section-8-ground-14', 'Serve a notice for nuisance or anti-social behaviour.', 'ground_14_notice', '14'),
  notice('/form-3-section-8', 'Prepare the current Form 3A Section 8 notice.', 'form_3_notice'),
  notice('/section-8-grounds-explained', 'Choose the Section 8 ground that matches the facts and evidence before serving Form 3A.', 'section_8_grounds_notice'),
  notice('/blog/england-section-8-ground-12', 'Serve a notice for a tenancy obligation breach.', 'ground_12_notice', '12'),
  courtPack('/eviction-cost-uk', 'Understand and prepare for the full possession process.', 'eviction_cost_complete_pack'),
  {
    sourceRoute: '/blog/uk-guarantor-agreements-guide', sourceCategory: 'tenancy_setup',
    visitorProblem: 'Put a guarantor-backed tenancy arrangement in writing.',
    primaryProduct: 'tenancy_agreement',
    headline: 'Setting up a guarantor-backed let?',
    supportingCopy: 'Choose the agreement route that matches the property and record the tenancy details clearly before occupation.',
    ctaLabel: 'Create my tenancy agreement', destinationRoute: '/products/ast',
    benefits: ['Choose the right agreement route.', 'Record the tenancy terms clearly.', 'Preview before payment.'],
    price: PRODUCTS.ast_standard.displayPrice, previewAvailable: true, trackingId: 'guarantor_guide_tenancy',
  },
  courtPack('/n5-n119-possession-claim', 'Prepare N5 and N119 possession claim paperwork.', 'n5_n119_complete_pack'),
  moneyClaim('/money-claim-carpet-damage', 'Recover evidenced carpet damage costs from a former tenant.', 'carpet_damage_money_claim'),
  notice('/section-8-grounds/how-to-evict-a-tenant-using-ground-1a', 'Use Ground 1A correctly for sale-related possession.', 'ground_1a_notice', '1A'),
  notice('/blog/how-to-serve-eviction-notice', 'Serve a valid notice and retain evidence of service.', 'serve_notice_notice_only'),
] as const;

export function getConversionMapping(sourceRoute: string): ConversionMapping | undefined {
  const normalized = sourceRoute.split('?')[0].replace(/\/$/, '') || '/';
  return CONVERSION_REGISTRY.find((mapping) => mapping.sourceRoute === normalized);
}

/**
 * Builds a relevant offer for retained SEO pages that already have a taxonomy
 * owner, while preserving hand-written mappings for the highest-value routes.
 * Non-England regional guidance never falls through to an England product.
 */
export function getConversionMappingForSeoPage(
  input: SeoConversionInput,
): ConversionMapping | undefined {
  const sourceRoute = input.sourceRoute.split('?')[0].replace(/\/$/, '') || '/';
  const explicit = getConversionMapping(sourceRoute);
  if (explicit) return explicit;
  if (sourceRoute.startsWith('/products/') || !['england', 'uk'].includes(input.jurisdiction)) {
    return undefined;
  }

  const routeId = sourceRoute.replace(/^\//, '').replace(/[^a-z0-9]+/gi, '_') || 'home';
  const problem = `Move from ${input.cluster.replace(/-/g, ' ')} guidance to the appropriate practical document route.`;
  let mapping: ConversionMapping;

  switch (input.primaryProduct) {
    case '/products/money-claim':
      mapping = moneyClaim(sourceRoute, problem, `${routeId}_money_claim`);
      break;
    case '/products/complete-pack':
      mapping = courtPack(sourceRoute, problem, `${routeId}_complete_pack`);
      break;
    case '/products/ast':
      mapping = tenancyAgreement(sourceRoute, problem, `${routeId}_tenancy_agreement`);
      break;
    case '/products/section-13-standard':
      mapping = rentIncrease(sourceRoute, problem, `${routeId}_section13_standard`, false);
      break;
    case '/products/section-13-defence':
      mapping = rentIncrease(sourceRoute, problem, `${routeId}_section13_defence`, true);
      break;
    default:
      mapping = notice(sourceRoute, problem, `${routeId}_notice_only`);
  }

  if (input.jurisdiction === 'uk' && input.primaryProduct !== '/products/ast') {
    return {
      ...mapping,
      headline: `Property in England? ${mapping.headline}`,
      supportingCopy: `The paid route below is for properties in England. ${mapping.supportingCopy}`,
      ctaLabel: `${mapping.ctaLabel} (England)`,
    };
  }

  return mapping;
}
