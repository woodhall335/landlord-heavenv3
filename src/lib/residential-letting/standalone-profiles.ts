import { getWizardIconPathByFilename } from '@/components/wizard/shared/wizardIconManifest';
import {
  PUBLIC_RESIDENTIAL_LETTING_PRODUCT_SKUS,
  type ResidentialLettingProductSku,
} from '@/lib/residential-letting/products';

type PublicResidentialLettingProductSku =
  (typeof PUBLIC_RESIDENTIAL_LETTING_PRODUCT_SKUS)[number];

export interface ResidentialLandingLink {
  label: string;
  href: string;
  description: string;
}

export interface ResidentialFaq {
  question: string;
  answer: string;
}

export interface ResidentialCautionBanner {
  title: string;
  body: string;
  tone: 'warning' | 'info';
}

export interface ResidentialStandaloneVisualTheme {
  page: string;
  pageGlow: string;
  surface: string;
  soft: string;
  border: string;
  accent: string;
  accentStrong: string;
  heroStart: string;
  heroMid: string;
  heroEnd: string;
}

export interface ResidentialStandaloneTrustModule {
  title: string;
  icon: string;
  items: string[];
}

export interface ResidentialStandaloneProfile {
  product: ResidentialLettingProductSku;
  icon: string;
  reviewIcon: string;
  eyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  heroBullets: string[];
  reviewHighlights: string[];
  reviewSummaryLabels: string[];
  outputSections: string[];
  cautionBanner?: ResidentialCautionBanner;
  stepIcons: Record<string, string>;
  theme: ResidentialStandaloneVisualTheme;
  trustModules: ResidentialStandaloneTrustModule[];
  landing: {
    title: string;
    description: string;
    h1: string;
    subheading: string;
    overview: string;
    whyUseThis: string[];
    howWizardWorks: string[];
    whoThisIsFor: string[];
    notFor: string[];
    legalExplainer: string;
    includedHighlights: string[];
    documentPreviewAnatomy: string[];
    internalLinks: ResidentialLandingLink[];
    faqs: ResidentialFaq[];
  };
}

type ResidentialStandaloneProfileSeed = Omit<
  ResidentialStandaloneProfile,
  'theme' | 'trustModules'
> & {
  theme?: ResidentialStandaloneVisualTheme;
  trustModules?: ResidentialStandaloneTrustModule[];
};

const icon = (filename: string) => getWizardIconPathByFilename(filename) || `/images/wizard-icons/${filename}`;

function buildCommonFaqs(productLabel: string): ResidentialFaq[] {
  return [
    {
      question: `Is this ${productLabel} for England only?`,
      answer:
        'Yes. These standalone residential products are currently drafted and wizard-scoped for England residential lettings.',
    },
    {
      question: 'Can I review before paying?',
      answer:
        'Yes. The wizard takes you through a guided review step with a locked summary before checkout.',
    },
    {
      question: 'Will this feel more complete than a blank template?',
      answer:
        'Yes. The wizard is designed to collect deal-specific facts, schedules, evidence references, and practical wording that a blank form usually leaves to the user.',
    },
  ];
}

const profiles: Record<ResidentialLettingProductSku, ResidentialStandaloneProfileSeed> = {
  guarantor_agreement: {
    product: 'guarantor_agreement',
    icon: icon('46-premium.png'),
    reviewIcon: icon('12-summary-cards.png'),
    eyebrow: 'Guarantor Agreement',
    heroTitle: 'Create a guarantor agreement that clearly shows who is covered and what they are promising.',
    heroSubtitle:
      'Use the wizard to set out the tenancy details, what the guarantor is backing, any cap on liability, and the signing details in plain English.',
    heroBullets: [
      'Clear summary of the landlord, tenant, and guarantor',
      'Simple options for liability scope and any cap',
      'Signing details laid out for witness-ready completion',
    ],
    reviewHighlights: [
      'World-class cover summary with liability scope',
      'Deed-style execution wording',
      'Continuing guarantee and release language',
    ],
    reviewSummaryLabels: ['Landlord', 'Tenant', 'Guarantor', 'Scope', 'Cap'],
    outputSections: [
      'Definitions and tenancy background',
      'Guarantor covenant',
      'Nature of liability',
      'Continuing guarantee and release',
      'Execution as deed',
    ],
    stepIcons: {
      suitability: icon('49-warning.png'),
      property_details: icon('03-property.png'),
      landlord: icon('39-landlord.png'),
      tenant: icon('40-tenants.png'),
      guarantor: icon('02-parties.png'),
      tenancy_reference: icon('04-tenancy.png'),
      scope: icon('44-terms.png'),
      execution: icon('10-signing.png'),
    },
    landing: {
      title: 'Guarantor Agreement England | Premium Residential Tenancy Guarantor Deed',
      description:
        'Create a premium England residential guarantor agreement with deed execution wording, liability scope options, and guided landlord drafting.',
      h1: 'Premium Guarantor Agreement for England Landlords',
      subheading:
        'A guided guarantor deed with stronger liability framing, cleaner execution wording, and a proper summary of the tenancy it supports.',
      overview:
        'Use this when you need a third party to stand behind a tenant on an England residential tenancy. The wizard structures the tenancy, liability scope, cap, and execution details so the finished document feels deliberate and premium.',
      whyUseThis: [
        'Adds a guarantor risk summary before the legal wording',
        'Captures deed-style execution details instead of leaving them vague',
        'Separates rent-only guarantees from wider obligation guarantees cleanly',
      ],
      howWizardWorks: [
        'Collect the property, landlord, tenant, and guarantor details',
        'Choose liability scope, costs, cap, and continuation settings',
        'Review a polished deed-style document summary before checkout',
      ],
      whoThisIsFor: [
        'Student lets, first-time renters, and affordability-edge cases',
        'Landlords who want a guarantor instrument that looks considered, not generic',
        'Cases where execution and witness detail matters',
      ],
      notFor: [
        'Scotland, Wales, or Northern Ireland',
        'Cases where no guarantor is actually required',
        'Situations needing bespoke corporate security or more specialist drafting',
      ],
      legalExplainer:
        'This product is positioned as an England residential guarantor deed, not a casual promise note. The wizard is designed to keep scope, cap, and renewal or variation survival transparent.',
      includedHighlights: [
        'Premium summary page',
        'Defined tenancy reference details',
        'Liability cap and continuing guarantee wording',
        'Execution and witness guidance',
      ],
      documentPreviewAnatomy: [
        'Cover summary with tenancy and liability snapshot',
        'Operative clauses for covenant, liability, and release',
        'Execution page designed for deed-style signing',
      ],
      internalLinks: [
        {
          label: 'Premium tenancy agreement',
          href: '/premium-tenancy-agreement',
          description: 'Pair the guarantor deed with a fuller tenancy pack.',
        },
      ],
      faqs: [
        ...buildCommonFaqs('Guarantor Agreement'),
        {
          question: 'Can I cap the guarantor liability?',
          answer:
            'Yes. The wizard includes a cap option so the finished document can show whether liability is limited or uncapped.',
        },
        {
          question: 'Does this cover renewals automatically?',
          answer:
            'Only if you choose wording that makes continuation after renewal or variation clear. The flow is designed to make that choice explicit.',
        },
      ],
    },
  },
  residential_sublet_agreement: {
    product: 'residential_sublet_agreement',
    icon: icon('44-terms.png'),
    reviewIcon: icon('12-summary-cards.png'),
    eyebrow: 'Sublet Agreement',
    heroTitle: 'Create a sublet agreement that makes the main tenancy and consent position easy to follow.',
    heroSubtitle:
      'Show who holds the original tenancy, what part of the property is being sublet, how rent and bills work, and what happens if the head tenancy ends.',
    heroBullets: [
      'A clear summary of the head tenancy and consent status',
      'Shared spaces, keys, and use rules written out properly',
      'Straightforward wording for what happens if the main tenancy ends',
    ],
    reviewHighlights: [
      'Head-tenancy summary page',
      'Rent and use schedule',
      'Termination wording tied to the superior tenancy',
    ],
    reviewSummaryLabels: ['Head tenant', 'Subtenant', 'Consent', 'Sublet rent'],
    outputSections: [
      'Head tenancy and consent',
      'Grant of subtenancy',
      'Rent, deposit, and utilities',
      'Subtenant obligations and house rules',
      'Consequences of head tenancy ending',
    ],
    stepIcons: {
      suitability: icon('49-warning.png'),
      property_details: icon('03-property.png'),
      parties: icon('02-parties.png'),
      head_tenancy: icon('04-tenancy.png'),
      sublet_term: icon('44-terms.png'),
    },
    landing: {
      title: 'Residential Sublet Agreement England | Premium Subletting Agreement',
      description:
        'Create a premium England residential sublet agreement with landlord consent context, occupation scope, and guided schedule drafting.',
      h1: 'Premium Residential Sublet Agreement',
      subheading:
        'A cleaner sublet workflow for England cases where the head tenancy, consent position, and practical occupation rules all need recording properly.',
      overview:
        'This product is for sublets, not assignments. The wizard turns the superior tenancy context, landlord consent position, and subletting terms into a more controlled finished document.',
      whyUseThis: [
        'Surfaces the superior tenancy and consent position early',
        'Captures the practical occupation deal, not just names and dates',
        'Gives the finished document cleaner rent, use, and termination structure',
      ],
      howWizardWorks: [
        'Confirm that the case is a sublet rather than an assignment',
        'Capture the head tenancy, landlord consent, and parties',
        'Set rent, deposit, utilities, and occupation rules before review',
      ],
      whoThisIsFor: [
        'Head tenants subletting all or part of the property',
        'Landlords or agents who want the sublet recorded cleanly',
        'Shared occupation cases where the superior tenancy still matters',
      ],
      notFor: [
        'True assignment or replacement-tenant cases',
        'Cases with no right or consent to sublet where specialist advice is needed',
        'Jurisdictions outside England',
      ],
      legalExplainer:
        'The flow is designed to keep the head tenancy visible. It does not pretend subletting transfers the head tenant liability to the landlord.',
      includedHighlights: [
        'Superior tenancy summary table',
        'Rent and use schedule',
        'House-rules and shared-space wording',
        'Termination wording tied to head tenancy risk',
      ],
      documentPreviewAnatomy: [
        'Front summary showing head tenancy and consent status',
        'Commercial terms for the sublet',
        'Controlled occupation and termination clauses',
      ],
      internalLinks: [
        {
          label: 'Flatmate agreement',
          href: '/flatmate-agreement-england',
          description: 'Use this when the facts are really shared living, not a true sublet.',
        },
      ],
      faqs: [
        ...buildCommonFaqs('Residential Sublet Agreement'),
        {
          question: 'Does this solve landlord consent by itself?',
          answer:
            'No. The wizard can record the consent position and any reference details, but it does not manufacture consent where it is still missing.',
        },
        {
          question: 'Can I show which rooms are exclusive or shared?',
          answer:
            'Yes. The premium flow is designed to record what is sublet, what remains shared, and how the arrangement works in practice.',
        },
      ],
    },
  },
  lease_amendment: {
    product: 'lease_amendment',
    icon: icon('44-terms.png'),
    reviewIcon: icon('12-summary-cards.png'),
    eyebrow: 'Tenancy Update',
    heroTitle: 'Update specific tenancy terms without rewriting the whole agreement.',
    heroSubtitle:
      'Use the wizard to reference the existing tenancy, list the clauses you are changing, add the new wording, and set the date the changes take effect.',
    heroBullets: [
      'A structured list of changes instead of one long notes box',
      'Clear wording for what changes and what stays the same',
      'A front-page summary linked back to the original tenancy',
    ],
    reviewHighlights: [
      'Clause-by-clause amendment table',
      'Original tenancy summary page',
      'All-other-terms-remain wording',
    ],
    reviewSummaryLabels: ['Landlord', 'Tenant', 'Original date', 'Effective date'],
    outputSections: [
      'Existing tenancy summary',
      'Amendment matrix',
      'Effect of the variation',
      'All other terms remain unchanged',
      'Execution',
    ],
    stepIcons: {
      suitability: icon('49-warning.png'),
      property_details: icon('03-property.png'),
      parties: icon('02-parties.png'),
      reference: icon('04-tenancy.png'),
      categories: icon('44-terms.png'),
      effective: icon('10-signing.png'),
    },
    landing: {
      title: 'Lease Amendment England | Premium Tenancy Variation Agreement',
      description:
        'Create a premium England lease amendment with clause-by-clause change capture, effective date control, and formal variation drafting.',
      h1: 'Premium Lease Amendment',
      subheading:
        'For focused tenancy changes where the original agreement stays in place but the wording needs to be updated properly.',
      overview:
        'This is built for targeted variations rather than whole new terms. The wizard is designed to make each amendment legible and to keep the original tenancy visible.',
      whyUseThis: [
        'Uses a structured amendment matrix rather than a vague summary note',
        'Protects clarity around what remains unchanged',
        'Produces a more formal variation-style output',
      ],
      howWizardWorks: [
        'Identify the original tenancy and parties',
        'List the clauses or subjects being changed',
        'Review the replacement wording and effective date before checkout',
      ],
      whoThisIsFor: [
        'Mid-tenancy rent, pet, or practical rule changes',
        'Landlords who want a clear written variation record',
        'Cases where a full renewal is unnecessary',
      ],
      notFor: [
        'Brand new tenancy terms for a fresh period',
        'Cases where assignment or subletting is the true issue',
        'Loose informal arrangements with no original document to reference',
      ],
      legalExplainer:
        'The product is framed as a targeted variation, not a replacement tenancy. That distinction is preserved through the summary page and operative wording.',
      includedHighlights: [
        'Original agreement reference summary',
        'Amendment matrix',
        'Continuation wording for non-varied terms',
        'Formal signature page',
      ],
      documentPreviewAnatomy: [
        'Front page identifying the agreement being varied',
        'Clause-by-clause schedule of changes',
        'Execution page to keep with the original tenancy file',
      ],
      internalLinks: [
        {
          label: 'Renewal tenancy agreement',
          href: '/renewal-tenancy-agreement-england',
          description: 'Use renewal instead where a new term is actually intended.',
        },
      ],
      faqs: [
        ...buildCommonFaqs('Lease Amendment'),
        {
          question: 'Can I amend more than one issue at once?',
          answer:
            'Yes. The premium amendment flow is designed to record multiple changes in a structured way so the output remains readable.',
        },
        {
          question: 'When should I use a renewal instead?',
          answer:
            'Use renewal where you are issuing a fresh term rather than changing selected clauses within the existing tenancy.',
        },
      ],
    },
  },
  lease_assignment_agreement: {
    product: 'lease_assignment_agreement',
    icon: icon('02-parties.png'),
    reviewIcon: icon('12-summary-cards.png'),
    eyebrow: 'Tenant Transfer',
    heroTitle: 'Record a tenant change clearly, from consent to deposit handover.',
    heroSubtitle:
      'Set out who is leaving, who is coming in, whether the landlord consents, how the deposit is dealt with, and what gets handed over on the change date.',
    heroBullets: [
      'A simple summary of the outgoing and incoming tenant positions',
      'Clear wording for release, deposit handling, and key handover',
      'Built to keep assignment separate from subletting',
    ],
    reviewHighlights: [
      'Assignment summary page',
      'Incoming covenant and release wording',
      'Deposit and handover schedule',
    ],
    reviewSummaryLabels: ['Landlord', 'Outgoing tenant', 'Incoming tenant', 'Assignment date'],
    outputSections: [
      'Original tenancy and consent',
      'Assignment',
      'Incoming tenant covenant',
      'Release of outgoing tenant',
      'Deposit and handover schedule',
    ],
    stepIcons: {
      suitability: icon('49-warning.png'),
      property_details: icon('03-property.png'),
      landlord: icon('39-landlord.png'),
      tenants: icon('40-tenants.png'),
      reference: icon('04-tenancy.png'),
      assignment: icon('44-terms.png'),
    },
    landing: {
      title: 'Lease Assignment Agreement England | Premium Tenancy Transfer Agreement',
      description:
        'Create a premium England lease assignment agreement with structured consent, release, deposit, and handover capture.',
      h1: 'Premium Lease Assignment Agreement',
      subheading:
        'A cleaner transfer workflow for tenant replacement cases where consent, release, and handover details all need recording properly.',
      overview:
        'This product is built for assignment, not subletting. The wizard creates a clearer transfer record with outgoing and incoming tenant details, consent position, and handover mechanics.',
      whyUseThis: [
        'Produces a transfer summary page before the legal clauses',
        'Captures practical mechanics like keys, deposit treatment, and apportionments',
        'Makes the outgoing release position much clearer than a generic form',
      ],
      howWizardWorks: [
        'Confirm the case is an assignment and record landlord consent status',
        'Capture outgoing and incoming tenant details',
        'Set the assignment date, release logic, and handover details before review',
      ],
      whoThisIsFor: [
        'Tenant replacement scenarios',
        'Shared homes where one occupier exits and another enters formally',
        'Landlords who want a more complete transfer record',
      ],
      notFor: [
        'Subletting cases where the original tenant remains in place',
        'Simple clause changes that should be handled by amendment',
        'Jurisdictions outside England',
      ],
      legalExplainer:
        'The wizard is designed to keep assignment separate from subletting and to preserve the landlord consent and release questions that matter in practice.',
      includedHighlights: [
        'Assignment summary page',
        'Consent and release details',
        'Deposit and handover schedule',
        'Formal execution block',
      ],
      documentPreviewAnatomy: [
        'Front page identifying the transfer',
        'Operative clauses for assignment and covenant',
        'Practical schedule for deposit, keys, and apportionments',
      ],
      internalLinks: [
        {
          label: 'Residential sublet agreement',
          href: '/residential-sublet-agreement-england',
          description: 'Use this instead where the tenancy is not actually being assigned.',
        },
      ],
      faqs: [
        ...buildCommonFaqs('Lease Assignment Agreement'),
        {
          question: 'Can the wizard show whether the outgoing tenant is released?',
          answer:
            'Yes. The review and final output can surface whether release is intended and the extent of that release.',
        },
        {
          question: 'Does this handle deposit treatment too?',
          answer:
            'Yes. The premium flow captures deposit treatment notes and handover context so the finished document reads more completely.',
        },
      ],
    },
  },
  rent_arrears_letter: {
    product: 'rent_arrears_letter',
    icon: icon('15-rent-arrears.png'),
    reviewIcon: icon('30-arrears-ledger.png'),
    eyebrow: 'Rent Arrears Letter',
    heroTitle: 'Send a clear rent arrears letter with the right figures, deadline, and payment details.',
    heroSubtitle:
      'Use the wizard to explain what is owed, how the arrears built up, when payment is due, and what the tenant needs to do next.',
    heroBullets: [
      'A clean arrears summary with room for the payment history',
      'Straightforward payment instructions and response wording',
      'Firm language without pretending it is a full debt-protocol pack',
    ],
    reviewHighlights: [
      'Professional cover-letter format',
      'Chronology-aware arrears summary',
      'Commercially useful next-step wording',
    ],
    reviewSummaryLabels: ['Sender', 'Tenant', 'Arrears mode', 'Deadline'],
    outputSections: [
      'Cover letter',
      'Arrears summary table',
      'Payment instructions',
      'Deadline panel',
      'Protocol note and next steps',
    ],
    cautionBanner: {
      title: 'Positioning guardrail',
      body:
        'This product is positioned as a professional arrears demand or final warning, not as a full Pre-Action Protocol Letter of Claim with reply forms and annexes.',
      tone: 'warning',
    },
    stepIcons: {
      suitability: icon('49-warning.png'),
      property_details: icon('03-property.png'),
      sender: icon('39-landlord.png'),
      tenant: icon('40-tenants.png'),
      tenancy: icon('04-tenancy.png'),
      mode: icon('30-arrears-ledger.png'),
      history: icon('11-calendar-timeline.png'),
      demand: icon('15-rent-arrears.png'),
    },
    landing: {
      title: 'Rent Arrears Letter England | Premium Formal Arrears Demand',
      description:
        'Create a premium England rent arrears letter with arrears chronology, payment instructions, and controlled final-warning wording.',
      h1: 'Premium Rent Arrears Letter',
      subheading:
        'A guided arrears demand flow for England landlords who want a more professional letter pack with better chronology, clearer payment instructions, and stronger review.',
      overview:
        'Use this for a formal arrears demand or final warning. The wizard is designed to keep the figures, chronology, and payment route organised without over-positioning the product as a full PAP debt letter.',
      whyUseThis: [
        'Builds a cleaner arrears summary and payment route',
        'Lets you switch between simple total and detailed schedule modes',
        'Produces a more disciplined landlord debt letter',
      ],
      howWizardWorks: [
        'Set the letter type and tenancy context',
        'Capture the arrears figures and communication history',
        'Review the demand, deadline, and next-step wording before checkout',
      ],
      whoThisIsFor: [
        'Landlords chasing unpaid rent from current or former tenants',
        'Cases needing a professional written demand before escalation',
        'Users who may later move into repayment-plan or money-claim flows',
      ],
      notFor: [
        'A full PAP debt letter with annexes and reply forms',
        'Cases where the figures are not yet stable or documented',
        'Jurisdictions outside England',
      ],
      legalExplainer:
        'The product is deliberately positioned as a formal arrears demand or final warning. It does not promise full debt-protocol compliance by itself.',
      includedHighlights: [
        'Professional cover letter structure',
        'Arrears summary table',
        'Payment instruction block',
        'Deadline and next-step language',
      ],
      documentPreviewAnatomy: [
        'Front letter panel with reference and letter type',
        'Arrears and payment tables',
        'Deadline block and protocol-safe note',
      ],
      internalLinks: [
        {
          label: 'Repayment plan agreement',
          href: '/repayment-plan-agreement-england',
          description: 'Use this when the tenant is engaging and a signed plan becomes realistic.',
        },
      ],
      faqs: [
        ...buildCommonFaqs('Rent Arrears Letter'),
        {
          question: 'Can I include a detailed arrears schedule?',
          answer:
            'Yes. The premium flow supports a detailed arrears schedule mode so the finished letter can show the missed periods more clearly.',
        },
        {
          question: 'Is this the same as a PAP Letter of Claim?',
          answer:
            'No. The product is deliberately positioned as an arrears demand or final warning and does not claim to replace a full protocol-compliant debt letter.',
        },
      ],
    },
  },
  repayment_plan_agreement: {
    product: 'repayment_plan_agreement',
    icon: icon('37-payment-plan.png'),
    reviewIcon: icon('12-summary-cards.png'),
    eyebrow: 'Payment Plan',
    heroTitle: 'Turn an arrears conversation into a clear payment plan everyone can follow.',
    heroSubtitle:
      'Set the instalments, payment dates, ongoing rent treatment, and what happens if payments are missed, all in one guided agreement.',
    heroBullets: [
      'A simple repayment schedule built into the document',
      'Clear wording for missed payments and next steps',
      'Easy to use alongside your arrears records and later follow-up',
    ],
    reviewHighlights: [
      'Running repayment schedule',
      'Default and grace period wording',
      'Signature-ready acknowledgment section',
    ],
    reviewSummaryLabels: ['Landlord', 'Tenant', 'Arrears total', 'Instalment', 'Frequency'],
    outputSections: [
      'Arrears acknowledgement',
      'Repayment schedule',
      'Ongoing rent and allocation logic',
      'Default and reservation of rights',
      'Execution',
    ],
    stepIcons: {
      suitability: icon('49-warning.png'),
      property_details: icon('03-property.png'),
      parties: icon('02-parties.png'),
      background: icon('15-rent-arrears.png'),
      structure: icon('37-payment-plan.png'),
      default: icon('49-warning.png'),
    },
    landing: {
      title: 'Repayment Plan Agreement England | Premium Rent Arrears Repayment Plan',
      description:
        'Create a premium England repayment plan agreement with instalment scheduling, default logic, and signature-ready arrears wording.',
      h1: 'Premium Repayment Plan Agreement',
      subheading:
        'A guided arrears-recovery workflow for recording instalments, payment channels, ongoing rent treatment, and what happens if the plan is missed.',
      overview:
        'Use this where arrears are being addressed by agreement rather than immediate escalation. The wizard creates a more disciplined repayment document with schedule and default logic built in.',
      whyUseThis: [
        'Turns instalment promises into a structured schedule',
        'Clarifies the relationship between ongoing rent and arrears repayments',
        'Produces a cleaner signed record if the plan later breaks down',
      ],
      howWizardWorks: [
        'Capture the arrears background and parties',
        'Set instalment structure, start date, and payment route',
        'Review the default wording and schedule before checkout',
      ],
      whoThisIsFor: [
        'Arrears cases where the tenant is engaging',
        'Landlords who want a signed repayment record',
        'Cases that may later need escalation if the plan is broken',
      ],
      notFor: [
        'Situations where no repayment plan is actually agreed',
        'Jurisdictions outside England',
        'Cases needing immediate PAP debt escalation instead of agreement drafting',
      ],
      legalExplainer:
        'The product is framed as a practical repayment agreement with reservation-of-rights wording. It is not a waiver of the landlord rights unless the document expressly says so.',
      includedHighlights: [
        'Arrears acknowledgement summary',
        'Repayment schedule table',
        'Default and grace-period wording',
        'Signature-ready finish',
      ],
      documentPreviewAnatomy: [
        'Cover summary with arrears and instalment snapshot',
        'Repayment table with dates and amounts',
        'Default and rights wording',
      ],
      internalLinks: [
        {
          label: 'Rent arrears letter',
          href: '/rent-arrears-letter-england',
          description: 'Use this first when the matter is still at formal demand stage.',
        },
      ],
      faqs: [
        ...buildCommonFaqs('Repayment Plan Agreement'),
        {
          question: 'Can I show what happens if an instalment is missed?',
          answer:
            'Yes. The premium flow is designed to capture grace period and default consequences so the document reads more completely.',
        },
        {
          question: 'Can I show that normal rent still continues?',
          answer:
            'Yes. The wizard includes that distinction so the agreement can show whether ongoing rent is separate from the arrears instalments.',
        },
      ],
    },
  },
  residential_tenancy_application: {
    product: 'residential_tenancy_application',
    icon: icon('01-case-basics.png'),
    reviewIcon: icon('12-summary-cards.png'),
    eyebrow: 'Application Intake',
    heroTitle: 'Collect a fuller applicant record before the tenancy is offered.',
    heroSubtitle:
      'Capture applicant identity, accommodation history, income, occupancy, and referencing permissions in a more premium pre-tenancy application format.',
    heroBullets: [
      'Applicant summary before declarations',
      'Referencing and disclosure fields captured in one place',
      'Better pre-tenancy intake than a thin lead form',
    ],
    reviewHighlights: [
      'Applicant summary table',
      'Affordability and references section',
      'Signed declaration block',
    ],
    reviewSummaryLabels: ['Applicant', 'Move-in date', 'Proposed rent', 'Employment'],
    outputSections: [
      'Applicant identity',
      'Employment and income',
      'Current accommodation and references',
      'Occupancy and disclosures',
      'Declaration',
    ],
    stepIcons: {
      consent: icon('49-warning.png'),
      property_details: icon('03-property.png'),
      applicant: icon('27-claimant.png'),
      employment: icon('41-rent.png'),
      occupancy: icon('40-tenants.png'),
    },
    landing: {
      title: 'Residential Tenancy Application England | Premium Tenant Application Form',
      description:
        'Create a premium England residential tenancy application with applicant, income, occupancy, and referencing capture.',
      h1: 'Premium Residential Tenancy Application',
      subheading:
        'A cleaner pre-tenancy intake form that feels closer to a real landlord application pack than a basic enquiry form.',
      overview:
        'Use this to gather a fuller applicant record before you issue the tenancy. The wizard keeps identity, affordability, occupancy, and declarations in one structured application file.',
      whyUseThis: [
        'Captures more than a simple lead form',
        'Produces a cleaner record for referencing and decision-making',
        'Packages declarations and checks consent professionally',
      ],
      howWizardWorks: [
        'Confirm consent for checks',
        'Capture applicant, employment, and occupancy details',
        'Review the application summary before checkout',
      ],
      whoThisIsFor: [
        'Landlords collecting pre-tenancy information',
        'Cases needing a more complete applicant record',
        'Users who may later pair the result with a guarantor agreement',
      ],
      notFor: [
        'A tenancy agreement itself',
        'Cases where the applicant is already accepted and no intake is needed',
        'Jurisdictions outside England',
      ],
      legalExplainer:
        'This product is positioned as a referencing and application intake document, not as a tenancy or holding-deposit agreement.',
      includedHighlights: [
        'Applicant summary page',
        'Income and accommodation sections',
        'Declaration and checks authority',
      ],
      documentPreviewAnatomy: [
        'Front summary',
        'Affordability and history sections',
        'Declaration page',
      ],
      internalLinks: [
        {
          label: 'Guarantor agreement',
          href: '/guarantor-agreement-england',
          description: 'Add this if the application points toward a guarantor requirement.',
        },
      ],
      faqs: buildCommonFaqs('Residential Tenancy Application'),
    },
  },
  rental_inspection_report: {
    product: 'rental_inspection_report',
    icon: icon('08-evidence.png'),
    reviewIcon: icon('38-evidence-pack.png'),
    eyebrow: 'Inspection Report',
    heroTitle: 'Create a clear inspection report with rooms, issues, photos, and sign-off.',
    heroSubtitle:
      'Walk through the property room by room, record issues, keys, meters, safety notes, comments, and evidence references, then finish with a clean signed report.',
    heroBullets: [
      'Room-by-room sections with issue tracking',
      'Space for photos and evidence references',
      'A polished report with sign-off and follow-up notes',
    ],
    reviewHighlights: [
      'Inspection cover summary',
      'Room-by-room findings with action log',
      'Numbered evidence appendix',
    ],
    reviewSummaryLabels: ['Inspection type', 'Date', 'Inspector', 'Rooms', 'Uploads'],
    outputSections: [
      'Inspection cover page',
      'Inspection particulars',
      'Utilities, keys, and safety',
      'Room-by-room findings',
      'Issues and follow-up',
      'Evidence appendix',
      'Certification and acknowledgment',
    ],
    stepIcons: {
      inspection_type: icon('11-calendar-timeline.png'),
      property_details: icon('03-property.png'),
      inspection: icon('39-landlord.png'),
      rooms: icon('45-inventory.png'),
      utilities: icon('05-compliance.png'),
      evidence: icon('08-evidence.png'),
      signoff: icon('10-signing.png'),
    },
    landing: {
      title: 'Rental Inspection Report England | Premium Move-In, Interim, and Move-Out Report',
      description:
        'Create a premium England rental inspection report with room builder, uploads, issues log, meter readings, and sign-off-ready output.',
      h1: 'Premium Rental Inspection Report',
      subheading:
        'A flagship evidence-grade inspection flow for England landlords who want custom rooms, issue tracking, uploads, and a more professional final report.',
      overview:
        'This is built to be the premium inspection product in the residential standalone range. The wizard collects the facts that make inspection reports useful later: rooms, issues, keys, meters, safety notes, comments, and supporting evidence references.',
      whyUseThis: [
        'Lets you build the report room by room',
        'Supports evidence uploads and structured follow-up items',
        'Produces a far more polished inspection output than a basic checklist',
      ],
      howWizardWorks: [
        'Choose the inspection type and capture who attended',
        'Build the room list, issues, utilities, and evidence set',
        'Review the inspection pack summary before checkout',
      ],
      whoThisIsFor: [
        'Move-in, interim, and move-out inspections',
        'Landlords wanting a better evidence trail for condition issues',
        'Cases that may later feed into inventory or dispute work',
      ],
      notFor: [
        'Informal quick notes with no need for a structured report',
        'Jurisdictions outside England',
        'Users expecting full embedded photo galleries or live e-signing in this version',
      ],
      legalExplainer:
        'The report is positioned as a dated evidence-grade tenancy-management record. It is designed to sit alongside photographs, inventories, and later comparison evidence.',
      includedHighlights: [
        'Inspection cover page',
        'Structured room builder output',
        'Keys, utilities, and safety tables',
        'Follow-up log and evidence appendix',
      ],
      documentPreviewAnatomy: [
        'Front cover with property, purpose, and attendees',
        'Detailed room sections with issues and comments',
        'Evidence appendix and sign-off page',
      ],
      internalLinks: [
        {
          label: 'Inventory & schedule of condition',
          href: '/inventory-schedule-of-condition-england',
          description: 'Pair the inspection report with a stronger check-in inventory baseline.',
        },
      ],
      faqs: [
        ...buildCommonFaqs('Rental Inspection Report'),
        {
          question: 'Can I create custom rooms?',
          answer:
            'Yes. The upgraded inspection flow is designed to let you select standard rooms and add custom ones where the property needs them.',
        },
        {
          question: 'Can I attach evidence references?',
          answer:
            'Yes. The premium inspection flow supports evidence uploads and references so the final report can list supporting files in an appendix.',
        },
      ],
    },
  },
  inventory_schedule_condition: {
    product: 'inventory_schedule_condition',
    icon: icon('45-inventory.png'),
    reviewIcon: icon('38-evidence-pack.png'),
    eyebrow: 'Inventory',
    heroTitle: 'Build a detailed inventory and schedule of condition you can rely on later.',
    heroSubtitle:
      'Capture each room, key items, keys, meter readings, handover notes, and supporting evidence in one guided check-in document.',
    heroBullets: [
      'Room-by-room item lists instead of one big notes box',
      'Clear sections for keys, manuals, meters, and handover details',
      'An evidence appendix and acknowledgment section built in',
    ],
    reviewHighlights: [
      'Premium summary page',
      'Structured room inventory tables',
      'Evidence appendix and acknowledgment area',
    ],
    reviewSummaryLabels: ['Inventory date', 'Landlord', 'Tenant', 'Rooms', 'Uploads'],
    outputSections: [
      'Inventory summary page',
      'Meters and utilities',
      'Room-by-room inventory',
      'Keys and access devices',
      'Notes, comments, and amendments',
      'Evidence appendix',
      'Acknowledgment',
    ],
    stepIcons: {
      suitability: icon('49-warning.png'),
      property_details: icon('03-property.png'),
      parties: icon('02-parties.png'),
      overview: icon('45-inventory.png'),
      rooms: icon('45-inventory.png'),
      utilities: icon('05-compliance.png'),
      evidence: icon('08-evidence.png'),
      signoff: icon('10-signing.png'),
    },
    landing: {
      title: 'Inventory and Schedule of Condition England | Premium Landlord Inventory',
      description:
        'Create a premium England inventory and schedule of condition with room builder, item rows, uploads, key schedules, and tenant acknowledgment.',
      h1: 'Premium Inventory & Schedule of Condition',
      subheading:
        'A flagship check-in baseline for England landlords who want room-by-room item capture, handover detail, uploads, and stronger final evidence.',
      overview:
        'This is built to be the premium baseline inventory product in the residential standalone range. The wizard is designed to collect the room, item, handover, and evidence detail that makes later comparison more credible.',
      whyUseThis: [
        'Supports structured room and item capture',
        'Captures keys, manuals, readings, and handover notes in one workflow',
        'Produces a more polished inventory pack than a blank template can',
      ],
      howWizardWorks: [
        'Capture the property, parties, and inventory context',
        'Build the room and item schedule with utilities and evidence',
        'Review the inventory pack summary before checkout',
      ],
      whoThisIsFor: [
        'Move-in baseline inventories',
        'Landlords wanting a stronger deposit-dispute evidence trail',
        'Cases where keys, handover, and condition all need recording together',
      ],
      notFor: [
        'Users who only need a blank checklist',
        'Jurisdictions outside England',
        'Full side-by-side check-in vs check-out comparison mode in this version',
      ],
      legalExplainer:
        'The product is framed as a structured schedule of condition and handover record. The wizard is designed to strengthen the baseline evidence without overreaching into unfair deemed-acceptance wording.',
      includedHighlights: [
        'Inventory summary page',
        'Room-by-room item tables',
        'Keys, documents, and meter schedules',
        'Evidence appendix and acknowledgment area',
      ],
      documentPreviewAnatomy: [
        'Front page with property, parties, and inventory date',
        'Detailed room inventory tables',
        'Appendix and acknowledgment finish',
      ],
      internalLinks: [
        {
          label: 'Rental inspection report',
          href: '/rental-inspection-report-england',
          description: 'Pair it with an inspection report for an even stronger evidence file.',
        },
      ],
      faqs: [
        ...buildCommonFaqs('Inventory & Schedule of Condition'),
        {
          question: 'Can I itemise rooms properly now?',
          answer:
            'Yes. The premium inventory flow is designed around room and item capture so the final document can read as a fuller inventory rather than a broad note sheet.',
        },
        {
          question: 'Can I include keys, manuals, and photos?',
          answer:
            'Yes. The premium flow is designed to capture keys, handover notes, and evidence references so the final document feels more complete.',
        },
      ],
    },
  },
  flatmate_agreement: {
    product: 'flatmate_agreement',
    icon: icon('43-bills.png'),
    reviewIcon: icon('12-summary-cards.png'),
    eyebrow: 'Flatmate Agreement',
    heroTitle: 'Set out the rent, bills, rooms, and house rules for a shared home in plain English.',
    heroSubtitle:
      'Use the wizard to record who lives where, how costs are split, what the house rules are, and how notice, move-out, and replacement flatmates should work.',
    heroBullets: [
      'A simple household summary before the detailed rules',
      'Clear schedules for rent, bills, chores, and guests',
      'Move-out and replacement flatmate rules included',
    ],
    reviewHighlights: [
      'Household structure summary',
      'Rent and bills schedules',
      'House-rules appendix and exit section',
    ],
    reviewSummaryLabels: ['Occupiers', 'Room allocation', 'Rent split', 'Notice'],
    outputSections: [
      'Status of arrangement',
      'Household structure and contributions',
      'House-rules appendix',
      'Dispute and communication process',
      'Exit and replacement arrangements',
    ],
    stepIcons: {
      suitability: icon('49-warning.png'),
      property_details: icon('03-property.png'),
      flatmates: icon('40-tenants.png'),
      allocation: icon('45-inventory.png'),
      split: icon('43-bills.png'),
      rules: icon('44-terms.png'),
    },
    landing: {
      title: 'Flatmate Agreement England | Premium Shared Living Agreement',
      description:
        'Create a premium England flatmate agreement with room allocation, rent and bills schedules, chores, guest rules, and exit arrangements.',
      h1: 'Premium Flatmate Agreement',
      subheading:
        'A more practical shared-household document for occupiers who need room allocation, payment expectations, rules, and move-out process recorded clearly.',
      overview:
        'This product is for internal shared-living arrangements, not landlord-facing tenancy transfer. The wizard creates a more useful household agreement with structured rules and contribution schedules.',
      whyUseThis: [
        'Captures the practical shared-living deal in more detail',
        'Separates room, bills, rules, and exit questions clearly',
        'Produces a more premium internal agreement than a generic note',
      ],
      howWizardWorks: [
        'Confirm the arrangement is shared occupation',
        'Capture occupiers, rooms, costs, and house rules',
        'Review the household summary and exit mechanics before checkout',
      ],
      whoThisIsFor: [
        'Shared homes with multiple occupiers',
        'Sublet-adjacent cases that are really flat-sharing arrangements',
        'Households wanting a cleaner practical agreement',
      ],
      notFor: [
        'A substitute for landlord consent or tenancy assignment',
        'Full sublet or assignment cases',
        'Jurisdictions outside England',
      ],
      legalExplainer:
        'The product is positioned as an internal occupier-sharing agreement. It does not pretend to create a new landlord-facing tenancy by itself.',
      includedHighlights: [
        'Household structure summary',
        'Rent and bills schedules',
        'House-rules appendix',
        'Exit and replacement wording',
      ],
      documentPreviewAnatomy: [
        'Front summary of the household arrangement',
        'Contribution and rule sections',
        'Exit and replacement appendix',
      ],
      internalLinks: [
        {
          label: 'Residential sublet agreement',
          href: '/residential-sublet-agreement-england',
          description: 'Use this instead where the facts point to a true sublet.',
        },
      ],
      faqs: [
        ...buildCommonFaqs('Flatmate Agreement'),
        {
          question: 'Can I show chores, guests, and quiet hours?',
          answer:
            'Yes. The premium flatmate flow is designed to capture day-to-day household rules alongside payment and notice arrangements.',
        },
        {
          question: 'Does this replace the landlord tenancy agreement?',
          answer:
            'No. It is positioned as an internal occupier-sharing agreement, not a landlord-facing tenancy contract.',
        },
      ],
    },
  },
  renewal_tenancy_agreement: {
    product: 'renewal_tenancy_agreement',
    icon: icon('11-calendar-timeline.png'),
    reviewIcon: icon('12-summary-cards.png'),
    eyebrow: 'Renewal Agreement',
    heroTitle: 'Use a renewal agreement only when a fresh term really is the right next step.',
    heroSubtitle:
      'Reference the earlier tenancy, set the new start date, record any changed terms, and keep the renewal warning visible where the case needs extra care.',
    heroBullets: [
      'A renewal summary with a clear changed-terms schedule',
      'Visible warning language where the case is more sensitive',
      'Built to separate true renewals from simple amendments',
    ],
    reviewHighlights: [
      'Renewal summary page',
      'Changed-terms schedule',
      'Suitability warning and compliance notes',
    ],
    reviewSummaryLabels: ['Landlord', 'Tenant', 'Renewal start', 'Renewed rent'],
    outputSections: [
      'Existing tenancy summary',
      'Renewed term',
      'Terms continuing and terms changed',
      'Compliance and deposit notes',
      'Suitability warning',
    ],
    cautionBanner: {
      title: 'Renewal suitability warning',
      body:
        'For England assured tenancies, a fixed-term renewal starting on or after 1 May 2026 may be inappropriate or legally sensitive. The current warning behavior remains in place in the flow and final output.',
      tone: 'warning',
    },
    stepIcons: {
      suitability: icon('49-warning.png'),
      property_details: icon('03-property.png'),
      parties: icon('02-parties.png'),
      existing: icon('04-tenancy.png'),
      renewal: icon('11-calendar-timeline.png'),
    },
    landing: {
      title: 'Renewal Tenancy Agreement England | Premium Legacy Renewal Agreement',
      description:
        'Create a premium England renewal tenancy agreement for legacy or specialist renewal cases with changed-term scheduling and visible suitability warnings.',
      h1: 'Premium Renewal Tenancy Agreement',
      subheading:
        'A guided renewal workflow for legacy or specialist England cases where a new term is still intended and the changed terms need recording cleanly.',
      overview:
        'This product is legally sensitive after 1 May 2026 for many England assured tenancies. The wizard keeps that warning visible while helping the user document earlier tenancy details, renewed dates, rent, and changed terms more clearly.',
      whyUseThis: [
        'Makes the changed terms visible on a separate summary page',
        'Keeps suitability warnings front and center',
        'Creates a more disciplined renewal record than a basic reissue',
      ],
      howWizardWorks: [
        'Confirm the case is a renewal rather than an amendment',
        'Capture the earlier tenancy and renewed term',
        'Review changed terms and warning copy before checkout',
      ],
      whoThisIsFor: [
        'Legacy or specialist England renewal situations',
        'Landlords needing a clearer changed-terms schedule',
        'Cases where a new term is genuinely intended',
      ],
      notFor: [
        'Straightforward clause changes that should use amendment',
        'Users ignoring the post-1 May 2026 warning position',
        'Jurisdictions outside England',
      ],
      legalExplainer:
        'The wizard keeps the current renewal warning aligned with the live product behavior. It does not suppress the post-1 May 2026 suitability concern.',
      includedHighlights: [
        'Existing tenancy summary page',
        'Renewal term and rent schedule',
        'Changed terms table',
        'Compliance and warning notes',
      ],
      documentPreviewAnatomy: [
        'Front page identifying the earlier tenancy and renewed term',
        'Changed-terms schedule',
        'Warning and compliance notes',
      ],
      internalLinks: [
        {
          label: 'Lease amendment',
          href: '/lease-amendment-england',
          description: 'Use this instead where you are only changing selected terms.',
        },
      ],
      faqs: [
        ...buildCommonFaqs('Renewal Tenancy Agreement'),
        {
          question: 'Will the warning about post-1 May 2026 use still appear?',
          answer:
            'Yes. The current renewal warning behavior remains aligned with the live product position and is not being removed.',
        },
        {
          question: 'When should I use amendment instead?',
          answer:
            'Use amendment where you are changing selected terms within the existing tenancy rather than issuing a fresh term.',
        },
      ],
    },
  },
};

type StandaloneProfileFamily = 'agreement' | 'evidence' | 'arrears';

const EVIDENCE_PRODUCTS = new Set<ResidentialLettingProductSku>([
  'rental_inspection_report',
  'inventory_schedule_condition',
]);

const ARREARS_PRODUCTS = new Set<ResidentialLettingProductSku>([
  'rent_arrears_letter',
  'repayment_plan_agreement',
]);

const FAMILY_THEMES: Record<StandaloneProfileFamily, ResidentialStandaloneVisualTheme> = {
  agreement: {
    page: '#f8f7fc',
    pageGlow: '#ede9fe',
    surface: '#ffffff',
    soft: '#f5f3ff',
    border: '#ddd6fe',
    accent: '#7c3aed',
    accentStrong: '#4c1d95',
    heroStart: '#150733',
    heroMid: '#24104d',
    heroEnd: '#5b21b6',
  },
  evidence: {
    page: '#f8f7fc',
    pageGlow: '#ede9fe',
    surface: '#ffffff',
    soft: '#f5f3ff',
    border: '#ddd6fe',
    accent: '#7c3aed',
    accentStrong: '#4c1d95',
    heroStart: '#150733',
    heroMid: '#24104d',
    heroEnd: '#6d28d9',
  },
  arrears: {
    page: '#f8f7fc',
    pageGlow: '#ede9fe',
    surface: '#ffffff',
    soft: '#f5f3ff',
    border: '#ddd6fe',
    accent: '#7c3aed',
    accentStrong: '#4c1d95',
    heroStart: '#150733',
    heroMid: '#24104d',
    heroEnd: '#7c3aed',
  },
};

function getProfileFamily(product: ResidentialLettingProductSku): StandaloneProfileFamily {
  if (EVIDENCE_PRODUCTS.has(product)) return 'evidence';
  if (ARREARS_PRODUCTS.has(product)) return 'arrears';
  return 'agreement';
}

function buildDefaultTrustModules(
  profile: ResidentialStandaloneProfileSeed
): ResidentialStandaloneTrustModule[] {
  const isEvidenceHeavy = EVIDENCE_PRODUCTS.has(profile.product);
  const draftingTitle = isEvidenceHeavy ? 'What gets recorded' : 'What gets drafted';
  const secondTitle = isEvidenceHeavy
    ? 'What evidence is captured'
    : 'Why landlords use this';

  const beforePaymentItems = [
    'Check names, dates, addresses, and reference details before payment.',
    isEvidenceHeavy
      ? 'Make sure uploads and room labels are clear enough to reference in the appendix.'
      : 'Review schedules, clause wording, and commercial terms for accuracy.',
    profile.cautionBanner
      ? profile.cautionBanner.title
      : 'Make sure execution details match how the final document will be signed or used.',
  ];

  return [
    {
      title: draftingTitle,
      icon: isEvidenceHeavy ? icon('45-inventory.png') : icon('18-forms-bundle.png'),
      items: profile.outputSections.slice(0, 4),
    },
    {
      title: secondTitle,
      icon: isEvidenceHeavy ? icon('38-evidence-pack.png') : icon('46-premium.png'),
      items: (isEvidenceHeavy ? profile.reviewHighlights : profile.heroBullets).slice(0, 3),
    },
    {
      title: 'Preview anatomy',
      icon: icon('12-summary-cards.png'),
      items: profile.landing.documentPreviewAnatomy.slice(0, 3),
    },
    {
      title: 'What to double-check before payment',
      icon: icon('49-warning.png'),
      items: beforePaymentItems,
    },
  ];
}

const COPY_EXEMPT_KEYS = new Set(['product', 'icon', 'reviewIcon', 'stepIcons', 'theme', 'href']);

const COPY_REPLACEMENTS: Array<[RegExp, string]> = [
  [/\|\s*Premium\s+/g, '| '],
  [/^Premium\s+/g, ''],
  [/\bCreate a premium\b/gi, 'Create a guided'],
  [/\bWorld-class\b/gi, 'Clear'],
  [/\bflagship\b/gi, 'detailed'],
  [/\bpremium summary page\b/gi, 'Summary page'],
  [/\bpremium cover summary\b/gi, 'Summary page'],
  [/\bpremium document summary\b/gi, 'document summary'],
  [/\bpremium document\b/gi, 'document'],
  [/\bpremium wizard\b/gi, 'guided wizard'],
  [/\bpremium flow\b/gi, 'wizard'],
  [/\bpremium inspection flow\b/gi, 'inspection wizard'],
  [/\bpremium inventory flow\b/gi, 'inventory wizard'],
  [/\bpremium amendment flow\b/gi, 'wizard'],
  [/\bpremium flatmate flow\b/gi, 'wizard'],
  [/\bpremium baseline inventory\b/gi, 'detailed baseline inventory'],
  [/\bpremium inspection product\b/gi, 'detailed inspection product'],
  [/\bpremium baseline inventory product\b/gi, 'detailed baseline inventory product'],
  [/\bpremium tenancy agreement\b/gi, 'tenancy agreement'],
  [/\bmore premium\b/gi, 'clearer'],
  [/\bfeels deliberate and premium\b/gi, 'reads clearly and covers the key details'],
  [/\bfeels premium\b/gi, 'reads clearly'],
  [/\bA guided England\b/g, 'An England'],
  [/\bReview a polished\b/gi, 'Review a clear'],
  [/\bguided England rent arrears letter\b/gi, 'England rent arrears letter'],
  [/\bguided England repayment plan agreement\b/gi, 'England repayment plan agreement'],
  [/\bguided England rental inspection report\b/gi, 'England rental inspection report'],
  [/\bguided England inventory and schedule of condition\b/gi, 'England inventory and schedule of condition'],
  [/\bguided England flatmate agreement\b/gi, 'England flatmate agreement'],
  [/\bguided England renewal tenancy agreement\b/gi, 'England renewal tenancy agreement'],
  [/\bguided England lease assignment agreement\b/gi, 'England lease assignment agreement'],
  [/\bguided England lease amendment\b/gi, 'England lease amendment'],
  [/\bguided England residential sublet agreement\b/gi, 'England residential sublet agreement'],
  [/\bguided England residential tenancy application\b/gi, 'England residential tenancy application'],
  [/\bguided England residential guarantor agreement\b/gi, 'England residential guarantor agreement'],
  [/\bCreate a England\b/g, 'Create an England'],
  [/\bThe wizard wizard\b/gi, 'The wizard'],
];

function cleanStandaloneCopy(text: string) {
  return COPY_REPLACEMENTS.reduce(
    (current, [pattern, replacement]) => current.replace(pattern, replacement),
    text
  )
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([.,])/g, '$1')
    .trim();
}

function rewriteStandaloneCopy<T>(value: T, key?: string): T {
  if (key && COPY_EXEMPT_KEYS.has(key)) {
    return value;
  }

  if (typeof value === 'string') {
    return cleanStandaloneCopy(value) as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => rewriteStandaloneCopy(item)) as T;
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([childKey, childValue]) => [
        childKey,
        rewriteStandaloneCopy(childValue, childKey),
      ])
    ) as T;
  }

  return value;
}

function materializeProfile(
  profile: ResidentialStandaloneProfileSeed
): ResidentialStandaloneProfile {
  return rewriteStandaloneCopy({
    ...profile,
    theme: profile.theme ?? FAMILY_THEMES[getProfileFamily(profile.product)],
    trustModules: profile.trustModules ?? buildDefaultTrustModules(profile),
  });
}

export const RESIDENTIAL_STANDALONE_PROFILES = Object.fromEntries(
  Object.entries(profiles).map(([sku, profile]) => [
    sku,
    materializeProfile(profile as ResidentialStandaloneProfileSeed),
  ])
) as Record<ResidentialLettingProductSku, ResidentialStandaloneProfile>;

export function getResidentialStandaloneProfile(product: ResidentialLettingProductSku) {
  return RESIDENTIAL_STANDALONE_PROFILES[product];
}

export function getPublicResidentialStandaloneProfiles() {
  return PUBLIC_RESIDENTIAL_LETTING_PRODUCT_SKUS.map(
    (sku) => RESIDENTIAL_STANDALONE_PROFILES[sku as PublicResidentialLettingProductSku]
  );
}
