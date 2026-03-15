import {
  PUBLIC_RESIDENTIAL_LETTING_PRODUCT_SKUS,
  RESIDENTIAL_LETTING_PRODUCTS,
  RESIDENTIAL_WIZARD_UPSELLS,
  type ResidentialLettingProductSku,
  getResidentialLandingHref,
  getResidentialWizardHref,
} from '@/lib/residential-letting/products';

type PublicResidentialLettingProductSku =
  (typeof PUBLIC_RESIDENTIAL_LETTING_PRODUCT_SKUS)[number];

export interface ResidentialLandingContent {
  slug: string;
  product: PublicResidentialLettingProductSku;
  title: string;
  description: string;
  h1: string;
  subheading: string;
  overview: string;
  whatYouGet: string[];
  wizardHighlights: string[];
  bestFor: string[];
  faqs: Array<{ question: string; answer: string }>;
}

function buildCommonFaqs(productLabel: string): Array<{ question: string; answer: string }> {
  return [
    {
      question: `Is this ${productLabel} England only?`,
      answer:
        'Yes. This product is currently scoped to England residential lettings and the wizard is configured accordingly.',
    },
    {
      question: 'Can I preview before paying?',
      answer:
        'Yes. The flow takes you into the guided wizard, then into a locked preview before checkout.',
    },
    {
      question: 'Can I add related landlord documents in the same flow?',
      answer:
        'Yes. The wizard can recommend related documents such as guarantor paperwork, tenancy agreements, inspection reports, or arrears recovery documents where relevant.',
    },
  ];
}

export const RESIDENTIAL_LANDING_CONTENT: Record<
  PublicResidentialLettingProductSku,
  ResidentialLandingContent
> = {
  guarantor_agreement: {
    slug: RESIDENTIAL_LETTING_PRODUCTS.guarantor_agreement.slug,
    product: 'guarantor_agreement',
    title: 'Guarantor Agreement England | Residential Tenancy Guarantor Form',
    description:
      'Create an England residential guarantor agreement using a guided wizard built for landlords.',
    h1: 'Guarantor Agreement for England Landlords',
    subheading:
      'Build a standalone guarantor agreement tied to the tenancy, the tenant, and the property details you already collect in the wizard.',
    overview:
      'Use this when you need a third party to guarantee a tenant’s obligations under an England residential tenancy. The wizard captures the guarantor, the tenancy context, and the key commercial details in one flow.',
    whatYouGet: [
      'Standalone guarantor agreement PDF',
      'Landlord, tenant, guarantor, and property details pulled into one document',
      'Checkout and storage inside the existing Landlord Heaven flow',
    ],
    wizardHighlights: [
      'Captures guarantor contact details and relationship to the tenant',
      'Links the guarantee to the tenancy, property, rent, and deposit facts already in the case',
      'Can be added as an upsell from the tenancy agreement or tenancy application flow',
    ],
    bestFor: [
      'Student lets and first-time renters',
      'Tenancies where affordability or referencing risk is borderline',
      'Landlords who already have the main tenancy facts and need the guarantee quickly',
    ],
    faqs: buildCommonFaqs('Guarantor Agreement'),
  },
  residential_sublet_agreement: {
    slug: RESIDENTIAL_LETTING_PRODUCTS.residential_sublet_agreement.slug,
    product: 'residential_sublet_agreement',
    title: 'Residential Sublet Agreement England | Subletting Form for Landlords',
    description:
      'Create an England residential sublet agreement with a guided wizard for landlords and tenants.',
    h1: 'Residential Sublet Agreement',
    subheading:
      'Record the head tenancy, subtenant details, landlord consent position, and subletting term in one England-only workflow.',
    overview:
      'Use this when an existing tenant is subletting all or part of the property. The wizard keeps the facts structured so the subletting arrangement is recorded cleanly.',
    whatYouGet: [
      'Standalone residential sublet agreement PDF',
      'Structured capture of head tenant, subtenant, dates, and rent',
      'Optional upsell to a flatmate agreement where the occupation is shared rather than a true sublet',
    ],
    wizardHighlights: [
      'Captures the original tenancy context and sublet dates',
      'Records landlord consent and who remains responsible under the head tenancy',
      'Works inside the same residential wizard shell as the tenancy products',
    ],
    bestFor: [
      'Tenants subletting with landlord consent',
      'Short fixed-term arrangements where the original tenant remains on the main tenancy',
      'Landlords who want the subletting facts recorded cleanly',
    ],
    faqs: buildCommonFaqs('Residential Sublet Agreement'),
  },
  lease_amendment: {
    slug: RESIDENTIAL_LETTING_PRODUCTS.lease_amendment.slug,
    product: 'lease_amendment',
    title: 'Lease Amendment England | Tenancy Amendment Form for Landlords',
    description:
      'Create an England lease amendment to vary an existing tenancy agreement using the guided wizard.',
    h1: 'Lease Amendment',
    subheading:
      'Use the wizard when the tenancy stays in place but some terms need to change, such as rent, clauses, or practical arrangements.',
    overview:
      'This is for changes to an existing tenancy where you want the original agreement to continue and only the amended terms to be recorded.',
    whatYouGet: [
      'Standalone lease amendment PDF',
      'Structured amendment summary with original agreement reference and effective date',
      'Upsell path to a renewal agreement where the main change is a new term',
    ],
    wizardHighlights: [
      'Captures which clauses or terms are changing',
      'Separates amendment use cases from renewals and assignments',
      'Uses the same property and party facts as the tenancy flow',
    ],
    bestFor: [
      'Mid-tenancy changes to rent or practical arrangements',
      'Adding or clarifying terms without replacing the full agreement',
      'Landlords who want a formal written variation',
    ],
    faqs: buildCommonFaqs('Lease Amendment'),
  },
  lease_assignment_agreement: {
    slug: RESIDENTIAL_LETTING_PRODUCTS.lease_assignment_agreement.slug,
    product: 'lease_assignment_agreement',
    title: 'Lease Assignment Agreement England | Tenancy Transfer Form',
    description:
      'Create an England lease assignment agreement to transfer a tenancy from one tenant to another.',
    h1: 'Lease Assignment Agreement',
    subheading:
      'Record the outgoing tenant, incoming tenant, landlord consent, and assignment date in a guided England residential workflow.',
    overview:
      'This is the right product where the tenancy interest is being assigned to a replacement tenant rather than amended or sublet.',
    whatYouGet: [
      'Standalone assignment agreement PDF',
      'Capture of outgoing and incoming tenant details',
      'Landlord consent and transfer-date details inside the wizard',
    ],
    wizardHighlights: [
      'Separates assignment from subletting and renewal cases',
      'Collects the transfer facts once and turns them into a clear assignment document',
      'Can sit alongside the existing tenancy case facts for the property',
    ],
    bestFor: [
      'Tenant replacement scenarios',
      'Shared houses where one occupier exits and another takes over formally',
      'Landlords documenting a clean transfer of tenancy obligations',
    ],
    faqs: buildCommonFaqs('Lease Assignment Agreement'),
  },
  rent_arrears_letter: {
    slug: RESIDENTIAL_LETTING_PRODUCTS.rent_arrears_letter.slug,
    product: 'rent_arrears_letter',
    title: 'Rent Arrears Letter England | Formal Arrears Demand for Landlords',
    description:
      'Create a formal rent arrears escalation letter for an England residential tenancy using the guided wizard.',
    h1: 'Rent Arrears Letter',
    subheading:
      'Use the wizard to pull together the landlord, tenant, property, arrears amount, and deadlines in a formal arrears demand without overstating protocol status.',
    overview:
      'This is the strongest fit where the landlord wants a structured written arrears demand before moving further into repayment or court recovery. A full Pre-Action Protocol debt letter should be handled as a more structured product with annexes and reply forms.',
    whatYouGet: [
      'Formal arrears demand PDF',
      'Arrears, deadline, and property context structured through the wizard',
      'Upsell path to a repayment plan or existing money-claim product where the facts justify it',
    ],
    wizardHighlights: [
      'Captures amount owed and response deadline',
      'Feeds naturally into repayment-plan and money-claim recommendations',
      'Keeps debt recovery inside the same landlord account and case trail',
    ],
    bestFor: [
      'Landlords chasing unpaid rent from current or former tenants',
      'Cases that need a written demand before escalation',
      'Users likely to convert into repayment-plan or money-claim follow-on products',
    ],
    faqs: buildCommonFaqs('Rent Arrears Letter'),
  },
  repayment_plan_agreement: {
    slug: RESIDENTIAL_LETTING_PRODUCTS.repayment_plan_agreement.slug,
    product: 'repayment_plan_agreement',
    title: 'Repayment Plan Agreement England | Rent Arrears Instalment Agreement',
    description:
      'Create an England repayment plan agreement for rent arrears with the guided landlord wizard.',
    h1: 'Repayment Plan Agreement',
    subheading:
      'Record instalments, frequency, start date, and consequences of default in a structured arrears-recovery workflow.',
    overview:
      'Use this when the tenant has agreed, or may agree, to clear arrears over time and you want that plan recorded cleanly.',
    whatYouGet: [
      'Repayment plan agreement PDF',
      'Arrears total plus instalment structure captured in the wizard',
      'Upsell path back to the arrears letter or onward to money claim when needed',
    ],
    wizardHighlights: [
      'Captures instalment amount, frequency, and final repayment date',
      'Works as a natural follow-on from the rent arrears letter flow',
      'Lets the landlord keep debt recovery documents inside one case',
    ],
    bestFor: [
      'Arrears cases where the tenant is engaging',
      'Landlords who want a formal written repayment schedule',
      'Users who may later need to escalate if the plan is broken',
    ],
    faqs: buildCommonFaqs('Repayment Plan Agreement'),
  },
  rental_inspection_report: {
    slug: RESIDENTIAL_LETTING_PRODUCTS.rental_inspection_report.slug,
    product: 'rental_inspection_report',
    title: 'Rental Inspection Report England | Move-In and Move-Out Report',
    description:
      'Create an England rental inspection report for move-in or move-out using the guided landlord wizard.',
    h1: 'Rental Inspection Report',
    subheading:
      'Capture room-by-room condition, layout notes, meter readings, keys, and defects in a standalone England move-in or move-out report.',
    overview:
      'Use this at move-in, move-out, or for structured interim inspections where you want a dated room-by-room report generated from the wizard.',
    whatYouGet: [
      'Standalone inspection report PDF',
      'Property layout, room-by-room condition, key handover, and meter readings captured in one flow',
      'Strong pairing with inventory and tenancy agreement products',
    ],
    wizardHighlights: [
      'Collects inspection type, date, layout, and room-by-room observations',
      'Captures readings, keys, safety checks, and condition summaries',
      'Natural add-on from tenancy agreement and inventory flows',
    ],
    bestFor: [
      'Move-in evidence packs',
      'Move-out comparison records',
      'Landlords who want a cleaner evidence trail for deductions or disputes',
    ],
    faqs: buildCommonFaqs('Rental Inspection Report'),
  },
  inventory_schedule_condition: {
    slug: RESIDENTIAL_LETTING_PRODUCTS.inventory_schedule_condition.slug,
    product: 'inventory_schedule_condition',
    title: 'Inventory and Schedule of Condition England | Landlord Check-In Record',
    description:
      'Create an England inventory and schedule of condition with the guided landlord wizard.',
    h1: 'Inventory & Schedule of Condition',
    subheading:
      'Generate a standalone inventory and condition record for check-in evidence inside the England residential wizard.',
    overview:
      'This is the strongest operational add-on for move-in evidence. It complements the tenancy agreement by giving the landlord a dedicated inventory record.',
    whatYouGet: [
      'Standalone inventory and schedule of condition PDF',
      'Wizard-fed property, keys, and condition details where available',
      'Works as a dedicated evidence document alongside the main tenancy agreement',
    ],
    wizardHighlights: [
      'Collects room notes, keys, and general property condition',
      'Pairs naturally with inspection reports and tenancy agreements',
      'Supports cleaner check-in evidence inside the same case',
    ],
    bestFor: [
      'Move-in evidence packs',
      'Deposit protection workflows',
      'Landlords who want a dedicated standalone inventory document',
    ],
    faqs: buildCommonFaqs('Inventory & Schedule of Condition'),
  },
  flatmate_agreement: {
    slug: RESIDENTIAL_LETTING_PRODUCTS.flatmate_agreement.slug,
    product: 'flatmate_agreement',
    title: 'Flatmate Agreement England | Shared Living Agreement for Occupiers',
    description:
      'Create an England flatmate agreement covering bills, room allocation, and house rules.',
    h1: 'Flatmate Agreement',
    subheading:
      'Use the wizard to record how occupiers are sharing the property, splitting bills, and managing day-to-day house rules.',
    overview:
      'This is a practical shared-living document for occupiers sharing a home, especially where the arrangement is not a full sublet or assignment.',
    whatYouGet: [
      'Standalone flatmate agreement PDF',
      'Room allocation, bill split, and house rules recorded in one place',
      'Can be recommended from sublet flows where the facts point to shared occupation instead',
    ],
    wizardHighlights: [
      'Captures occupiers, room allocation, bills split, and practical rules',
      'Distinguishes shared living arrangements from formal tenancy transfer documents',
      'Low-friction operational add-on for shared households',
    ],
    bestFor: [
      'Shared homes with multiple occupiers',
      'Situations where practical rules need recording',
      'Sublet-adjacent cases that are really flat-sharing arrangements',
    ],
    faqs: buildCommonFaqs('Flatmate Agreement'),
  },
  renewal_tenancy_agreement: {
    slug: RESIDENTIAL_LETTING_PRODUCTS.renewal_tenancy_agreement.slug,
    product: 'renewal_tenancy_agreement',
    title: 'Renewal Tenancy Agreement England | Legacy Fixed-Term Renewal for Landlords',
    description:
      'Create an England renewal tenancy agreement for legacy or specialist renewal situations with the guided landlord wizard.',
    h1: 'Renewal Tenancy Agreement',
    subheading:
      'Use the wizard when the tenancy is continuing and you want a legacy-style fixed term or refreshed tenancy document rather than a simple amendment.',
    overview:
      'This is for renewal situations where the existing tenancy is being rolled forward on new dates, and possibly with an updated rent or refreshed terms. England landlords should check whether a renewal document remains appropriate for the tenancy date in light of the post-1 May 2026 tenancy reforms.',
    whatYouGet: [
      'Standalone renewal tenancy agreement PDF',
      'Current and renewed term dates captured in one flow',
      'Upsell path to a lease amendment where the change is narrower than a full renewal',
    ],
    wizardHighlights: [
      'Captures current term, new term, and updated commercial details',
      'Lets the wizard distinguish renewal from amendment logic',
      'Natural feeder from your existing tenancy and renewal-intent landing pages',
    ],
    bestFor: [
      'Landlords issuing a new fixed term to an existing tenant in a legacy or specialist scenario',
      'Renewals with date and rent changes',
      'Existing tenancy pages targeting renewal intent where a simple amendment is not enough',
    ],
    faqs: buildCommonFaqs('Renewal Tenancy Agreement'),
  },
};

export function getResidentialLandingContentBySlug(slug: string): ResidentialLandingContent | undefined {
  return Object.values(RESIDENTIAL_LANDING_CONTENT).find((content) => content.slug === slug);
}

export function getResidentialLandingSlugs(): string[] {
  return Object.values(RESIDENTIAL_LANDING_CONTENT).map((content) => content.slug);
}

export function getResidentialRelatedLinks(product: ResidentialLettingProductSku): Array<{
  label: string;
  href: string;
  description: string;
}> {
  const wizardUpsells = RESIDENTIAL_WIZARD_UPSELLS[product] || [];
  const related: Array<{ label: string; href: string; description: string }> = wizardUpsells
    .map((sku) => ({
      label: RESIDENTIAL_LETTING_PRODUCTS[sku].label,
      href: getResidentialLandingHref(sku),
      description: RESIDENTIAL_LETTING_PRODUCTS[sku].description,
    }))
    .slice(0, 3);

  if (product === 'guarantor_agreement') {
    related.unshift({
      label: 'Premium Tenancy Agreement',
      href: '/premium-tenancy-agreement',
      description: 'Use the premium tenancy flow for more complex shared lets and guarantor-heavy cases.',
    });
  }

  return related.slice(0, 3);
}

export function getResidentialWizardEntry(product: ResidentialLettingProductSku): string {
  return getResidentialWizardHref(product).replace('src=product_page', 'src=seo_landing');
}
