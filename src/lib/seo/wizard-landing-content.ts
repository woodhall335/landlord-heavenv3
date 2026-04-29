/**
 * SEO Landing Page Content for Wizard Entry Points
 *
 * This module provides comprehensive, SEO-optimized content for dedicated
 * landing pages that serve as wizard entry points. Each product has:
 * - Unique title, description, and H1
 * - Jurisdiction-specific coverage details
 * - Notice/form type listings
 * - Validation claim explanations
 * - FAQ content with JSON-LD schema support
 * - Internal link suggestions
 * - Value proposition sections explaining procedural benefits
 *
 * LEGAL SAFETY: Claims are accurate to what the product actually does:
 * - "Legally validated" means: jurisdiction selection, correct form mapping,
 *   required fields present, date/notice period logic checks, formatting completeness
 * - NOT "lawyer approved" unless evidence exists
 */

import { PRODUCTS, SEO_PRICES } from '@/lib/pricing/products';

export interface FAQItem {
  question: string;
  answer: string;
}

export interface NoticeType {
  name: string;
  jurisdiction: string;
  description: string;
  legalBasis?: string;
}

export interface CourtForm {
  name: string;
  formNumber: string;
  description: string;
  route?: string;
}

export interface JurisdictionCoverage {
  name: string;
  flag: string;
  agreementType: string;
  legalBasis: string;
  keyFeatures: string[];
  notes?: string;
}

/**
 * Explains what "legally validated" means and provides disclaimer
 */
export interface LegalValidationExplainer {
  /** What validation actually does */
  whatItMeans: string[];
  /** Clear disclaimer that this is not legal advice */
  disclaimer: string;
}

/**
 * "Why use this" section explaining procedural benefits
 */
export interface WhyUseThisSection {
  /** Section heading */
  heading: string;
  /** Introduction paragraph */
  intro: string;
  /** List of procedural benefits */
  benefits: string[];
}

export interface WizardLandingContent {
  // SEO metadata
  slug: string;
  title: string;
  description: string;
  h1: string;
  subheading: string;

  // Product info
  product: string;
  wizardUrl: string;
  price: string;

  // Coverage
  jurisdictions: string[];
  jurisdictionCoverage?: JurisdictionCoverage[];
  noticeTypes?: NoticeType[];
  courtForms?: CourtForm[];

  // Content sections
  whatYouGet: string[];
  howValidationWorks: string[];
  whoThisIsFor: string[];

  // Value proposition sections (NEW)
  whyUseThis: WhyUseThisSection;
  proceduralBenefits: string[];
  legalValidationExplainer: LegalValidationExplainer;

  // FAQs
  faqs: FAQItem[];

  // Internal links
  relatedProducts: string[];
  relatedTools: string[];
  relatedBlogPosts: string[];
}

/**
 * NOTICE ONLY - Eviction Notices for England, Wales, Scotland
 */
export const noticeOnlyContent: WizardLandingContent = {
  slug: 'eviction-notice-template',
  title: `Eviction Notice Generator 2026 | Form 3A, Wales Notices & Scotland Notice to Leave | ${SEO_PRICES.evictionNotice.display}`,
  description:
    'Generate the right eviction notice for England (Form 3A), Wales (Section 173 or 181), or Scotland (Notice to Leave), with the correct wording, notice period, and official form for your jurisdiction.',
  h1: 'Need a Form 3A, Wales Notice, or Notice to Leave?',
  subheading:
    'Jurisdiction-specific eviction notices for England, Wales, and Scotland, with checks before you serve and a watermarked preview before you pay.',

  product: 'notice_only',
  wizardUrl: '/wizard?product=notice_only&src=product_page&topic=eviction',
  price: SEO_PRICES.evictionNotice.display,

  jurisdictions: ['England', 'Wales', 'Scotland'],

  noticeTypes: [
    {
      name: 'England Form 3A Possession Notice',
      jurisdiction: 'England',
      description:
        'Current England possession notice on Form 3A using Schedule 2 grounds. Notice periods vary by ground under the post-1 May 2026 framework.',
      legalBasis: 'Housing Act 1988, s.8, Schedule 2',
    },
    {
      name: 'Section 173 Possession Notice',
      jurisdiction: 'Wales',
      description:
        'No-fault possession notice under Renting Homes (Wales) Act 2016. Requires 6 months notice (from 1 December 2022). Cannot be served in first 6 months of occupation.',
      legalBasis: 'Renting Homes (Wales) Act 2016, s.173',
    },
    {
      name: 'Section 181 Possession Notice',
      jurisdiction: 'Wales',
      description:
        'Fault-based possession notice under Renting Homes (Wales) Act 2016 citing breach grounds. Notice periods vary by ground.',
      legalBasis: 'Renting Homes (Wales) Act 2016, s.181',
    },
    {
      name: 'Notice to Leave',
      jurisdiction: 'Scotland',
      description:
        'Eviction notice under Private Residential Tenancy citing eviction grounds. Notice periods: 28 days (first 6 months) to 84 days (after 6 months). Must cite valid grounds from Schedule 3.',
      legalBasis: 'Private Housing (Tenancies) (Scotland) Act 2016',
    },
  ],

  whatYouGet: [
    'Eviction notice in the correct legal format for your jurisdiction',
    'Official government forms: Form 3A (England possession notice), RHW forms (Wales), Notice to Leave (Scotland)',
    'Correct statutory wording required by each jurisdiction\'s legislation',
    'Service Instructions explaining how to legally serve the notice',
    'Service & Validity Checklist to verify compliance before serving',
    'Unlimited regenerations - edit and regenerate instantly',
    'Portal storage for 12+ months',
  ],

  // NEW: Why landlords use this instead of templates
  whyUseThis: {
    heading: 'Why Landlords Use This Instead of a Template',
    intro:
      'Incorrect eviction notices are a leading cause of failed or delayed possession claims. A single error in notice type, wording, grounds, or notice period can result in your case being struck out. Our generator reduces this risk by ensuring your notice is procedurally correct from the start.',
    benefits: [
      'The right notice for your jurisdiction: Form 3A in England, Section 173 or 181 in Wales, or Notice to Leave in Scotland',
      'Current statutory wording rather than old template wording copied from elsewhere',
      'Notice periods worked out from your answers, including tenancy dates and grounds where relevant',
      'Ground-specific wording where the law requires it',
      'Checks for common blockers before you serve, such as deposit protection, gas safety, EPC, and How to Rent in England',
      'A notice prepared in the right format for service, which reduces the risk of avoidable rejection later',
    ],
  },

  // NEW: Concrete procedural benefits
  proceduralBenefits: [
    'Ensures the correct notice type is selected for your property location and tenancy type',
    'Applies the correct notice period based on tenancy length and chosen grounds',
    'Uses statutory wording required by Housing Act 1988, Renting Homes (Wales) Act 2016, or Private Housing (Tenancies) (Scotland) Act 2016',
    'Generates official prescribed forms: Form 3A, RHW forms, or Notice to Leave',
    'Flags compliance issues (deposit, gas, EPC, How to Rent) that could invalidate your notice',
    'Creates documents in the correct format for filing or service',
  ],

  // NEW: Legal validation explainer with disclaimer
  legalValidationExplainer: {
    whatItMeans: [
      'Maps your property location to the correct notice type and form',
      'Ensures all required fields are completed',
      'Calculates notice periods based on tenancy length and grounds',
      'Applies statutory wording required by current legislation',
      'Checks compliance pre-requisites (deposit, gas safety, EPC, How to Rent)',
      'Generates documents in the correct format for service or filing',
    ],
    disclaimer:
      'This is systematic procedural validation, not legal advice. Our system checks that your notice is procedurally correct based on the information you provide. For complex situations — such as disputes about tenancy type, unusual lease terms, or potential defences — consult a qualified solicitor before serving.',
  },

  howValidationWorks: [
    'Jurisdiction selection: System identifies correct notice type based on property location',
    'Compliance pre-checks: Flags common blockers (deposit protection, gas safety, EPC, How to Rent for England)',
    'Date logic: Calculates correct notice periods and earliest valid dates',
    'Required fields: Ensures all mandatory information is captured',
    'Form mapping: Generates the correct official form for your jurisdiction and grounds',
    'Formatting completeness: Verifies all sections are properly completed',
  ],

  whoThisIsFor: [
    'Landlords who need a procedurally correct eviction notice quickly',
    'Property managers handling tenant departures across multiple jurisdictions',
    'Landlords who want compliance checks before serving to reduce rejection risk',
    'Anyone who needs to understand their eviction options by jurisdiction',
  ],

  faqs: [
    {
      question: 'What eviction notices do you generate?',
      answer:
        'We generate notices for three jurisdictions: England (Form 3A), Wales (Section 173 no-fault and Section 181 fault-based notices), and Scotland (Notice to Leave).',
    },
    {
      question: 'What does "procedurally correct" mean?',
      answer:
        'It means your notice uses the correct notice type, statutory wording, notice period, and prescribed form for your jurisdiction. We check: (1) Jurisdiction — correct notice type for your property location, (2) Grounds — required wording for each ground cited, (3) Notice period — calculated based on tenancy length, (4) Compliance — flags blockers like missing deposit protection. This is procedural validation, not legal advice.',
    },
    {
      question: 'Are these official government forms?',
      answer:
        'Yes. We use the official prescribed forms: Form 3A for England, the RHW forms for Wales, and the prescribed Notice to Leave format for Scotland.',
    },
    {
      question: 'What compliance checks are performed?',
      answer:
        'For England: deposit protection status, gas safety certificate, Energy Performance Certificate, How to Rent guide provision. For Wales: Rent Smart Wales registration. For Scotland: landlord registration, First-tier Tribunal jurisdiction. Issues are flagged before generation so you can address them first.',
    },
    {
      question: 'Why do incorrect notices fail?',
      answer:
        'Common reasons: wrong notice type for the tenancy, incorrect notice period, outdated form version, missing statutory wording, grounds not properly cited, or serving before compliance requirements are met. Our system prevents these errors by validating each element before generation.',
    },
    {
      question: 'Can I preview before paying?',
      answer:
        'Yes. You can preview all documents with a watermark before paying. Edit your answers and regenerate until satisfied.',
    },
    {
      question: 'What if my notice is rejected by the court?',
      answer:
        'If your notice is rejected due to an error in our document generation, we will regenerate it free. Court acceptance ultimately depends on your specific circumstances and evidence.',
    },
    {
      question: 'Do you provide legal advice?',
      answer:
        'No. We provide document generation and procedural validation, not legal advice. Our AI assistant helps you understand the process but is not a solicitor. Consult a qualified solicitor for complex cases or if you anticipate a defence.',
    },
  ],

  relatedProducts: ['complete_pack', 'money_claim'],
  relatedTools: ['section-21-generator', 'section-8-generator', 'hmo-checker'],
  relatedBlogPosts: ['what-is-section-21', 'section-21-vs-section-8', 'wales-eviction-notices'],
};

/**
 * COMPLETE PACK - Full Eviction Bundle (England ONLY)
 */
export const completePackContent: WizardLandingContent = {
  slug: 'products/complete-pack',
  title: `Complete Eviction Bundle 2026 – England | Form 3A, N5 & N119 Possession Pack | ${SEO_PRICES.evictionBundle.display}`,
  description:
    'End-to-end England eviction paperwork: Form 3A notice, N5 claim form, N119 particulars of claim, and filing guidance. This is the full possession pack, not just the notice.',
  h1: 'Taking Your Tenant to Court? Complete England Form 3A Eviction Pack',
  subheading:
    'Form 3A notice, N5, N119, a witness statement, and a filing guide prepared together so your possession paperwork is consistent from the start.',

  product: 'complete_pack',
  wizardUrl: '/wizard?product=complete_pack&src=product_page&topic=eviction',
  price: SEO_PRICES.evictionBundle.display,

  jurisdictions: ['England'],

  courtForms: [
    {
      name: 'England Form 3A Possession Notice',
      formNumber: 'Form 3A',
      description: 'England possession notice citing grounds from Schedule 2. Grounds are mapped to your specific situation (rent arrears, breach, antisocial behaviour, sale, etc.).',
      route: 'current_england_route',
    },
    {
      name: 'N5 Claim for Possession',
      formNumber: 'N5',
      description:
        'Standard possession claim form for the current England process. Filed at county court with N119.',
      route: 'current_england_route',
    },
    {
      name: 'N119 Particulars of Claim',
      formNumber: 'N119',
      description:
        'Particulars of Claim for possession of property — the detailed statement of your case. Includes: grounds cited, rent arrears history with dates and amounts, tenancy details, and breach specifics. This document sets out the legal basis of your claim, including grounds and arrears schedule.',
      route: 'current_england_route',
    },
  ],

  whatYouGet: [
    'England Form 3A possession notice with correct statutory wording',
    'Court claim forms: N5 and N119 for the standard possession process',
    'Particulars of Claim (N119) setting out your case clearly in the right legal format',
    'AI-drafted witness statement with your case details',
    'Service instructions and validity checklist',
    'Court filing guide with step-by-step instructions — where to file, court fees, timelines',
    'Evidence checklist for court preparation',
      'Certificate of service (Form N215)',
    'Unlimited regenerations with 12+ months portal storage',
  ],

  // NEW: Why landlords use this - emphasising full court route
  whyUseThis: {
    heading: 'Why This Pack — Not Just a Notice',
    intro:
      'A lot of possession cases go wrong after the notice has been served because the court paperwork is incomplete, inconsistent, or hard to follow. This pack prepares the notice and the court claim together, so the documents work as one set.',
    benefits: [
      'Form 3A, N5, and N119 are prepared as one joined-up possession file for the county court',
      'The Particulars of Claim are drafted in the right format so the grounds, dates, and figures are easy to follow',
      'For rent arrears, the pack lays out the amounts, dates, and running totals clearly',
      'For breach cases, it sets out the relevant ground and the supporting facts in a structured way',
      'The notice, claim form, and particulars are checked against each other so they do not contradict one another',
      'Validation catches missing fields, date issues, and common compliance problems before the documents are generated',
    ],
  },

  // NEW: Procedural benefits with Particulars of Claim emphasis
  proceduralBenefits: [
    'Generates the Particulars of Claim (N119), which is where the grounds, arrears history, and supporting facts are set out in detail',
    'Builds the current England possession file: Form 3A, N5, and N119',
    'Checks that the notice, claim form, and particulars all line up properly',
    'Pre-fills official HMCTS forms with your case details — court-ready format',
    'Calculates notice periods, court deadlines, and earliest filing dates',
    'Flags compliance blockers (deposit, gas, EPC, How to Rent) before you file',
    'Creates documents in the correct format for court filing',
  ],

  // NEW: Legal validation explainer
  legalValidationExplainer: {
    whatItMeans: [
      'Maps your answers to the current England possession process',
      'Generates the right court forms for that process: Form 3A, N5, and N119',
      'Pre-fills all mandatory court form fields',
      'Creates Particulars of Claim with grounds, arrears history, and case details',
      'Validates internal consistency between notice, claim form, and particulars',
      'Checks compliance requirements before generation',
    ],
    disclaimer:
      'This is systematic procedural validation, not legal advice. We ensure your forms are complete, consistent, and in the correct format. For complex cases — such as disputes over tenancy type, potential defences, or enforcement — consult a qualified solicitor.',
  },

  howValidationWorks: [
    'Maps the case to the current England possession process: Form 3A, N5, and N119',
    'Form generation: Official HMCTS forms pre-filled with your case details',
    'Particulars of Claim: Grounds, arrears history, dates, and amounts drafted in legal format',
    'Compliance validation: Checks deposit, gas safety, EPC, How to Rent before generating',
    'Date calculations: Notice periods, court deadlines, and timeline guidance',
    'Internal consistency: All documents cross-reference correctly — grounds match, dates align, amounts reconcile',
  ],

  whoThisIsFor: [
    'England landlords who need the complete eviction journey from notice to possession order',
    'Landlords with rent arrears who want the current England possession paperwork and properly drafted particulars',
    'Landlords who want Form 3A, N5, and N119 prepared as one consistent court pack',
    'Property managers handling court filings who need consistent, court-ready documents',
  ],

  faqs: [
    {
      question: 'What court route does this bundle cover?',
      answer:
      'This bundle covers the current England possession process using Form 3A, N5, and N119. It is built for the post-1 May 2026 framework and does not generate the old accelerated possession route in the public England flow.',
    },
    {
      question: 'What is the N119 Particulars of Claim?',
      answer:
        'N119 is the statement of your case filed with the N5 claim form. It details: your grounds for possession, rent arrears history with dates and amounts, tenancy details, and breach specifics. This is where your case is actually made — a weak or missing N119 can sink an otherwise valid claim. We draft this for you.',
    },
    {
      question: 'Why do you emphasise the Particulars of Claim?',
      answer:
        'Many landlords serve a valid notice but then file an incomplete or poorly drafted court claim. The N119 Particulars of Claim is where you set out the facts that support your grounds. Courts expect itemised arrears, specific breach dates, and correct legal references. We create this document with your case details.',
    },
    {
      question: 'What court forms are included?',
      answer:
        'This pack includes the England Form 3A possession notice, Form N5 claim for possession, and Form N119 particulars of claim. All are official HMCTS forms, pre-filled with your case details.',
    },
    {
      question: 'Is this available for Wales or Scotland?',
      answer:
        'No. This bundle is England only. Wales uses different forms under Renting Homes (Wales) Act 2016. Scotland uses First-tier Tribunal forms. For Wales/Scotland, use our Notice Only pack.',
    },
    {
      question: 'How does this reduce rejected claims?',
      answer:
        'Rejected claims usually fail due to: incomplete forms, inconsistent information between documents, incorrect dates, or missing particulars. Our system validates all fields, ensures consistency between notice and claim, and generates Particulars of Claim in the correct legal format.',
    },
    {
      question: 'Can I preview before paying?',
      answer:
        'Yes. Preview all documents with watermark before paying. Edit and regenerate unlimited times until you are satisfied.',
    },
    {
      question: 'Do you provide legal advice?',
      answer:
        'No. We provide document generation and procedural validation. For contested cases, potential defences, or enforcement strategy, consult a solicitor.',
    },
  ],

  relatedProducts: ['notice_only', 'money_claim'],
  relatedTools: ['section-8-generator'],
  relatedBlogPosts: ['possession-claim-guide', 'eviction-cost-uk'],
};

/**
 * MONEY CLAIM - N1 Form and Debt Recovery (England ONLY)
 *
 * SCOPE: This product is for England county courts only.
 * Do NOT mention MCOL/Money Claim Online (which covers England & Wales).
 * Always say "England only" explicitly.
 */
export const moneyClaimContent: WizardLandingContent = {
  slug: 'money-claim',
  title: `Money Claim Pack 2026 | Form N1 Generator | Daily Interest Rate | England Only | ${SEO_PRICES.moneyClaim.display}`,
  description:
    'Generate Form N1 for rent arrears, property damage, cleaning costs, and other contractual sums in England, with automatic interest calculation and a county court filing guide.',
  h1: 'Money Claim Pack — England Only',
  subheading:
    'Form N1 claim paperwork with automatic interest calculation, a daily rate breakdown, and a Letter Before Claim for England county court cases.',

  product: 'money_claim',
  wizardUrl: '/wizard?product=money_claim&src=product_page',
  price: SEO_PRICES.moneyClaim.display,

  jurisdictions: ['England'],

  courtForms: [
    {
      name: 'Form N1 Claim Form',
      formNumber: 'N1',
      description:
        'Official county court claim form for money claims. This is the form you file to start proceedings to recover tenant debts — rent arrears, damage, cleaning, and other contractual sums.',
    },
    {
      name: 'Particulars of Claim',
      formNumber: 'POC',
      description:
        'Detailed statement of your claim. Sets out: what is owed, when it arose, the legal basis (contract/tenancy agreement), and why you are entitled to the amount claimed.',
    },
    {
      name: 'Schedule of Debt',
      formNumber: 'Schedule',
      description:
        'Itemised breakdown of all amounts claimed with dates. Courts expect a clear schedule — especially for rent arrears spanning multiple months.',
    },
    {
      name: 'Interest Calculation',
      formNumber: 'Interest',
      description:
        'Automatic calculation of statutory interest at 8% per annum. Shows: total interest accrued, daily rate (continuing), and dates interest runs from. This is included in your claim total.',
    },
  ],

  whatYouGet: [
    'Form N1 Claim Form — the official county court money claim form, pre-filled with your case details',
    'Particulars of Claim with legal basis and factual summary',
    'Schedule of Debt itemising all amounts with dates',
    'Automatic interest calculation at 8% statutory rate with daily rate shown (e.g., "£1.37 per day")',
    'Letter Before Claim (PAP-DEBT compliant) — required before issuing proceedings',
    'Defendant Information Sheet',
    'Court filing guide — England county court filing, court fees, and timelines',
    'Enforcement guide — bailiffs, attachment of earnings, charging orders',
    'Reply Form and Financial Statement templates',
    'Unlimited regenerations with 12+ months portal storage',
  ],

  // NEW: Why landlords use this
  whyUseThis: {
    heading: 'Why This Pack — Not Just a Blank N1',
    intro:
      'Money claims often fall apart because the figures do not add up, the interest is wrong, or the documents do not match each other. This pack keeps the N1, the debt schedule, and the particulars consistent, and it works out the interest for you.',
    benefits: [
      'Form N1 pre-filled in the official court format',
      'Automatic 8% statutory interest calculation using the right start dates for each debt item',
      'The daily rate is shown clearly because the court expects to see it',
      'The debt schedule, N1, and particulars are checked so the totals match',
      'A Letter Before Claim that follows the debt protocol before proceedings are issued',
      'Clear filing guidance for the County Court Money Claims Centre or the local county court where appropriate',
    ],
  },

  // NEW: Procedural benefits
  proceduralBenefits: [
    'Generates Form N1 (Claim Form) — the official county court form to start money claim proceedings in England',
    'Calculates interest automatically at 8% statutory rate with daily rate breakdown',
    'Shows daily rate explicitly (e.g., "£1.37 per day") — required for judgment and enforcement',
    'Ensures figures are consistent across N1, Schedule of Debt, and Particulars of Claim',
    'Creates PAP-DEBT compliant Letter Before Claim with 30-day response period',
    'England only: explains where to file based on the defendant address and the claim type',
    'Validates dates are within 6-year limitation period',
  ],

  // NEW: Legal validation explainer
  legalValidationExplainer: {
    whatItMeans: [
      'Pre-fills Form N1 with your claim details in official court format',
      'Calculates 8% statutory interest with correct start date for each debt item',
      'Shows daily rate breakdown for continuing interest post-judgment',
      'Ensures all figures reconcile across documents (no arithmetic errors)',
      'Creates Schedule of Debt with itemised amounts and dates',
      'Generates PAP-compliant Letter Before Claim',
    ],
    disclaimer:
      'This is systematic procedural validation, not legal advice. We ensure your claim is correctly calculated and formatted. For disputed debts, counterclaims, or enforcement strategy, consult a qualified solicitor.',
  },

  howValidationWorks: [
    'Claim types: Validates rent arrears, property damage, cleaning costs, unpaid utilities, and other contractual sums',
    'Amount validation: Ensures totals match itemised amounts across all documents',
    'Interest calculation: Automatic 8% statutory interest from correct start dates, with daily rate calculation',
    'Date validation: Confirms dates are consistent and within 6-year limitation period',
    'Required fields: All mandatory N1 fields validated',
    'PAP compliance: Letter Before Claim follows Pre-Action Protocol for Debt Claims',
  ],

  whoThisIsFor: [
    'Landlords in England owed rent arrears by current or former tenants',
    'Landlords claiming for property damage after tenancy ends (England properties)',
    'Landlords recovering cleaning costs, unpaid utilities, or other contractual expenses through English county courts',
    'Anyone in England who needs to file a county court money claim with correctly calculated interest',
  ],

  faqs: [
    {
      question: 'What is Form N1?',
      answer:
        'Form N1 is the official county court claim form for money claims in England. It is the form you file to start legal proceedings to recover debts — including rent arrears, property damage costs, cleaning costs, and other sums owed by tenants under the tenancy agreement.',
    },
    {
      question: 'What can I claim for?',
      answer:
        'You can claim for: rent arrears (itemised by month), property damage (carpets, walls, appliances, garden), professional cleaning costs, unpaid utilities, rubbish removal, abandoned goods disposal, council tax, early termination costs, and any other contractual sums owed under the tenancy agreement.',
    },
    {
      question: 'How is interest calculated?',
      answer:
        'Statutory interest is 8% per annum under the Late Payment of Commercial Debts (Interest) Act 1998 or county court rules. Our calculator works this out automatically from the correct start date for each item. For rent arrears: interest runs from each payment due date. For damage claims: from when you notified the tenant.',
    },
    {
      question: 'What is the daily rate and why does it matter?',
      answer:
        'The daily rate is the interest accruing each day after filing. Calculated as: (Principal × 8%) ÷ 365. For example: £5,000 debt accrues £1.10 per day. Courts expect the daily rate stated in your claim so they can calculate the final judgment amount. We include this in your N1.',
    },
    {
      question: 'Where do I file the claim?',
      answer:
        'This pack is for England only. File paper forms at the County Court Money Claims Centre (CCMCC) in Salford, or submit electronically through the court portal. Our guide explains the filing process, court fees, and timelines for England county courts.',
    },
    {
      question: 'What is PAP-DEBT?',
      answer:
        'PAP-DEBT is the Pre-Action Protocol for Debt Claims. Before issuing court proceedings, you must send a compliant Letter Before Claim giving the debtor 30 days to respond. If you skip this step, the court may refuse costs even if you win. Our Letter Before Claim follows this protocol exactly.',
    },
    {
      question: 'Can I claim against a tenant who has left?',
      answer:
        'Yes. You have 6 years from when the debt arose to make a claim under the Limitation Act 1980. You will need the tenant\'s current address for court service. If you don\'t have it, tracing services can help.',
    },
    {
      question: 'What happens after I win?',
      answer:
        'If the tenant does not pay voluntarily after judgment, enforcement options include: County Court Bailiffs (warrant of control), High Court Enforcement Officers (for judgments over £600), Attachment of Earnings (deducted from wages), and Charging Orders (secured against property). Our enforcement guide covers all options.',
    },
  ],

  relatedProducts: ['notice_only', 'complete_pack'],
  relatedTools: ['rent-arrears-calculator', 'interest-calculator'],
  relatedBlogPosts: [
    'money-claim-unpaid-rent',
    'how-to-sue-tenant-for-unpaid-rent',
    'small-claims-court-tips-landlords',
  ],
};

/**
 * AST STANDARD - Tenancy Agreements (All 4 Jurisdictions)
 */
export const astStandardContent: WizardLandingContent = {
  slug: 'tenancy-agreement',
  title: `Tenancy Agreement Generator 2026 | England Tenancy Agreement, Occupation Contract, PRT | ${SEO_PRICES.tenancyStandard.display}`,
  description:
    'Jurisdiction-specific tenancy agreements for England, Wales, Scotland, and Northern Ireland, using the right agreement type and current wording for each nation.',
  h1: 'Tenancy Agreement Generator',
  subheading:
    'Jurisdiction-specific agreements with current England wording and the correct terminology for Wales, Scotland, and Northern Ireland.',

  product: 'ast_standard',
  wizardUrl: '/wizard?product=ast_standard&src=product_page&topic=tenancy',
  price: SEO_PRICES.tenancyStandard.display,

  jurisdictions: ['England', 'Wales', 'Scotland', 'Northern Ireland'],

  jurisdictionCoverage: [
    {
      name: 'England',
      flag: 'England',
      agreementType: 'England tenancy agreement',
      legalBasis: 'Current England agreement wording aligned to the assured periodic framework from 1 May 2026',
      keyFeatures: [
        'Current England tenancy agreement wording for new England agreements',
        'Deposit protection and written-information guidance captured in the wizard',
        'Tenant notice and landlord possession wording updated for the current England product position',
        'No old AST-first or Section 21-led wording in the public England product',
        'Existing written and verbal tenancies are handled through separate England guidance pages',
      ],
      notes: 'Public England product now uses current England tenancy agreement wording.',
    },
    {
      name: 'Wales',
      flag: 'Wales',
      agreementType: 'Standard Occupation Contract',
      legalBasis: 'Renting Homes (Wales) Act 2016',
      keyFeatures: [
        'Uses "Contract Holder" not "Tenant" terminology',
        'Written statement required within 14 days',
        'Rent Smart Wales registration required',
        'Section 173 notice for no-fault possession',
        'Different deposit rules and fitness for habitation standards',
      ],
      notes: 'Wales has separate housing law since December 2022.',
    },
    {
      name: 'Scotland',
      flag: 'Scotland',
      agreementType: 'Private Residential Tenancy (PRT)',
      legalBasis: 'Private Housing (Tenancies) (Scotland) Act 2016',
      keyFeatures: [
        'Open-ended tenancy with no fixed end date',
        'Tenant can give 28 days notice at any time',
        'Landlord needs valid eviction ground',
        'First-tier Tribunal jurisdiction',
        'Rent Pressure Zone restrictions may apply',
      ],
      notes: 'PRTs replaced Assured and Short Assured Tenancies in Scotland.',
    },
    {
      name: 'Northern Ireland',
      flag: 'Northern Ireland',
      agreementType: 'Private Tenancy Agreement',
      legalBasis: 'Private Tenancies Act (Northern Ireland) 2022',
      keyFeatures: [
        'Written agreement required within 28 days',
        'Rent increase restrictions (12-month gap)',
        'Notice to Quit requirements',
        'County Court Northern Ireland jurisdiction',
        'Electrical safety mandatory from April 2025',
      ],
      notes: 'Significant reforms under the 2022 Act.',
    },
  ],

  whatYouGet: [
    'Tenancy agreement in the correct legal format for your jurisdiction',
    'Correct agreement type: England tenancy agreement, Occupation Contract (Wales), PRT (Scotland), Private Tenancy (NI)',
    "Core statutory terms required by each jurisdiction's legislation",
    'Property schedules: address, inventory reference, and utilities',
    'Rent and deposit schedule with payment terms',
    'House rules and property care requirements',
    'Pre-tenancy compliance checklist for the selected jurisdiction',
    'Signature blocks for landlord and tenant',
    'Blank inventory template',
    'Ready-to-sign format for immediate use',
  ],

  whyUseThis: {
    heading: 'Why Use a Jurisdiction-Specific Agreement Instead of a Generic Template',
    intro:
    'Using the wrong law or the wrong terminology for the property location creates avoidable disputes and compliance problems. Older agreements can also be harder to rely on if the wording is out of date. England now needs current England tenancy agreement wording, while Wales needs an Occupation Contract, Scotland needs a PRT, and Northern Ireland needs its own private tenancy wording.',
    benefits: [
      'Correct agreement type: England tenancy agreement, Standard Occupation Contract (Wales), PRT (Scotland), Private Tenancy (NI)',
      'Correct terminology for each nation instead of generic UK wording',
      'Correct legislation referenced for each jurisdiction',
      'Core statutory terms included: rent, deposit, duration, repair obligations, and termination information',
      'Deposit protection rules applied correctly per jurisdiction',
      'Ready-to-sign format prepared for printing and signing',
    ],
  },

  proceduralBenefits: [
    'Generates the correct agreement type for your property location',
    "Uses correct legal terminology required by each jurisdiction's legislation",
    'Includes core statutory terms such as rent, deposit, duration, and obligations',
    'Applies correct deposit protection rules: 30 days (England), 30 days (Wales), immediate (Scotland), scheme rules (NI)',
    'References the correct possession or termination framework for each jurisdiction',
    'Creates documents in ready-to-sign format',
  ],

  legalValidationExplainer: {
    whatItMeans: [
      'Detects jurisdiction from property location and generates the correct agreement type',
      "Uses terminology required by each nation's legislation",
      'Includes all core statutory terms required by law',
      'Applies correct deposit protection requirements per jurisdiction',
      'References current notice and possession information for the selected jurisdiction',
      'Prevents cross-jurisdiction errors',
    ],
    disclaimer:
      'This is systematic procedural validation, not legal advice. Agreements are drafted for standard residential tenancies. For unusual situations such as commercial mixed-use, licence agreements, or non-standard arrangements, consult a qualified solicitor.',
  },

  howValidationWorks: [
    'Jurisdiction detection: Generates the correct agreement type based on property location',
    'Legal compliance: Uses terminology and clauses required by jurisdiction-specific legislation',
    'Cross-jurisdiction safety: Prevents England terms appearing in Wales agreements and vice versa',
    'Required fields: Ensures all mandatory information is captured',
    'Deposit rules: Applies correct deposit protection requirements per jurisdiction',
    'Notice provisions: References the correct jurisdiction-specific termination information',
  ],

  whoThisIsFor: [
    'Landlords letting residential property in any UK jurisdiction',
    'Property managers needing compliant agreements for multiple regions',
    'First-time landlords who want a correctly structured agreement for their jurisdiction',
    'Anyone creating a new tenancy agreement or updating their current paperwork',
  ],

  faqs: [
    {
      question: 'What agreement type do I get for each region?',
      answer:
        'England: current England tenancy agreement wording in the updated Landlord Heaven public flow. Wales: Standard Occupation Contract. Scotland: Private Residential Tenancy. Northern Ireland: Private Tenancy Agreement.',
    },
    {
      question: 'Why does using the correct agreement type matter?',
      answer:
        'Each UK nation has different housing legislation with different terminology, rights, and procedures. Using the wrong wording for the property location creates avoidable compliance and dispute risk.',
    },
    {
      question: 'What is included in the Standard agreement?',
      answer:
        'The agreement document includes core statutory terms, property schedules, rent and deposit payment terms, house rules, a jurisdiction-specific compliance checklist, signature blocks, and a blank inventory template.',
    },
    {
      question: 'Do I need Premium instead?',
      answer:
        'For England, Premium is now the fuller ordinary-residential route, while Student, HMO / Shared House, and Lodger have their own dedicated products. In other jurisdictions, Premium still represents the broader tiered product.',
    },
    {
      question: 'Is this agreement legally compliant?',
      answer:
        'Agreements are drafted for the supported residential use cases in each jurisdiction and include the required core statutory terms. For unusual situations such as commercial mixed-use, licence agreements, or company lets, consult a solicitor.',
    },
    {
      question: 'Can I preview before paying?',
      answer:
        'Yes. Preview your complete agreement with a watermark before paying, then edit and regenerate as needed.',
    },
    {
      question: 'What about deposit protection?',
      answer:
        'The agreement references deposit protection requirements for the selected jurisdiction, including England, Wales, Scotland, and Northern Ireland scheme expectations.',
    },
    {
      question: 'Can I add custom clauses?',
      answer:
        'Yes. The wizard allows additional terms, but unfair or unclear terms can be unenforceable, so keep custom wording reasonable and specific.',
    },
  ],

  relatedProducts: ['ast_premium', 'notice_only'],
  relatedTools: ['hmo-checker', 'deposit-calculator'],
  relatedBlogPosts: ['assured-shorthold-tenancy-agreement', 'occupation-contract-wales', 'prt-scotland'],
};

/**
* AST PREMIUM - Enhanced tenancy agreements across the shared UK offering.
 * England Premium is now the fuller ordinary-residential route, while the
 * England Student, HMO / Shared House, and Lodger products sit separately.
 */
export const astPremiumContent: WizardLandingContent = {
  slug: 'premium-tenancy-agreement',
  title: `Premium Tenancy Agreement 2026 | Fuller Residential Drafting | ${SEO_PRICES.tenancyPremium.display}`,
  description:
    'Premium tenancy agreements with fuller drafting, inventory support, and compliance guidance. In England, Premium is the fuller ordinary residential option, while Student, HMO / Shared House, and Lodger have their own separate products.',
  h1: 'Premium Tenancy Agreement',
  subheading:
    'Fuller drafting, inventory support, and more day-to-day detail for landlords who want more than a basic agreement.',

  product: 'ast_premium',
  wizardUrl: '/wizard?product=ast_premium&src=product_page&topic=tenancy',
  price: SEO_PRICES.tenancyPremium.display,

  jurisdictions: ['England', 'Wales', 'Scotland', 'Northern Ireland'],

  jurisdictionCoverage: [
    {
      name: 'England',
      flag: 'England',
      agreementType: 'Premium England tenancy agreement',
      legalBasis: 'Current England agreement wording for the fuller ordinary residential premium agreement',
      keyFeatures: [
        'All Standard England agreement clauses plus fuller operational drafting',
        'More detailed property management and practical wording',
        'Optional detail for notices, inspections, and day-to-day operation',
        'Guarantor-friendly drafting where selected in the ordinary residential flow',
        'Current England rent increase and review wording',
        'Anti-subletting and short-let prohibition',
      ],
    },
    {
      name: 'Wales',
      flag: 'Wales',
      agreementType: 'Standard Occupation Contract - Premium',
      legalBasis: 'Renting Homes (Wales) Act 2016 + Housing Act 2004',
      keyFeatures: [
        'All Standard Occupation Contract clauses',
        'Joint contract-holder provisions',
        'Shared accommodation rules',
        'Guarantor provisions for Wales',
        'Enhanced repair and maintenance schedules',
      ],
    },
    {
      name: 'Scotland',
      flag: 'Scotland',
      agreementType: 'Private Residential Tenancy (PRT) - Premium',
      legalBasis: 'Private Housing (Tenancies) (Scotland) Act 2016',
      keyFeatures: [
        'All Standard PRT clauses',
        'HMO licensing compliance (Civic Government Act 1982)',
        'Joint tenant provisions',
        'Guarantor clauses for Scotland',
        'Fire safety and shared facilities rules',
      ],
    },
    {
      name: 'Northern Ireland',
      flag: 'Northern Ireland',
      agreementType: 'Private Tenancy Agreement - Premium',
      legalBasis: 'Private Tenancies Act (Northern Ireland) 2022',
      keyFeatures: [
        'All Standard NI clauses',
        'HMO provisions (HMO Act NI 2016)',
        'Joint tenant liability',
        'Guarantor provisions',
        'Enhanced compliance schedules',
      ],
    },
  ],

  whatYouGet: [
    'Premium tenancy agreement with fuller drafting than the Standard version',
    'Enhanced operational wording for ordinary residential lets',
    'Guarantor-friendly drafting where selected in the supported flow',
    'Inventory and schedule of condition completed through the wizard where supported',
    'Compliance checklist for jurisdiction-specific pre-tenancy requirements',
    'Tenant notes and guidance explaining obligations clearly',
    'Rent review and operational wording suited to the selected jurisdiction',
    'Anti-subletting clause and short-let prohibition',
    'Late payment provisions with reasonable charges',
    'Enhanced house rules and property-management detail',
    'Unlimited regenerations with 12+ months portal storage',
  ],

  whyUseThis: {
    heading: 'Why Choose Premium Instead of Standard',
    intro:
      'Premium is for landlords who want fuller drafting, clearer day-to-day detail, and a more tailored agreement than the Standard version. In England, HMO / shared-house, student, and lodger cases now have their own dedicated products instead of being folded into Premium.',
    benefits: [
      'Fuller drafting for inspections, property use, and day-to-day management',
      'Guarantor-friendly wording where the supported flow captures that detail',
      'Inventory and schedule of condition completed through the wizard to support deposit disputes',
      'Compliance checklist so you do not miss pre-tenancy requirements',
      'Tenant guidance notes that reduce disputes by setting expectations clearly',
      'More detailed obligations such as rent review, anti-subletting, and late payment provisions',
    ],
  },

  proceduralBenefits: [
    'Includes fuller drafting rather than only the baseline standard wording',
    'Includes guarantor-friendly wording where selected in the supported flow',
    'Generates inventory and schedule of condition with the wizard instead of leaving it blank',
    'Creates jurisdiction-specific compliance checklist for pre-tenancy requirements',
    'Includes tenant guidance notes explaining obligations',
    'Adds rent review mechanisms, anti-subletting provisions, and late payment clauses',
    'All in the correct agreement type for your jurisdiction',
  ],

  legalValidationExplainer: {
    whatItMeans: [
      'Generates the correct agreement type for your jurisdiction with Premium additions',
      'Keeps premium drafting aligned with the jurisdiction-specific agreement type',
      'Structures guarantor provisions with clear liability scope',
      'Creates the inventory and schedule of condition through the wizard',
      'Builds a compliance checklist specific to the selected jurisdiction',
      'Applies all Standard validation plus Premium-specific provisions',
    ],
    disclaimer:
      'This is systematic procedural validation, not legal advice. Premium agreements are drafted for the supported residential use cases in each jurisdiction. For complex arrangements such as commercial HMOs, licence agreements, or unusual guarantee structures, consult a qualified solicitor.',
  },

  howValidationWorks: [
    'Jurisdiction-specific drafting: premium wording stays aligned with the selected nation',
    'Cross-jurisdiction safety: the selected jurisdiction keeps the right terminology and compliance framing',
    'Guarantor validation: ensures guarantor details and liability scope are captured',
    'Inventory support: converts guided answers into a usable schedule of condition',
    'Compliance checklist: highlights the main pre-tenancy requirements for the chosen jurisdiction',
    'Premium terms: keeps enhanced clauses aligned with the core agreement details',
  ],

  whoThisIsFor: [
    'Landlords wanting fuller drafting than the baseline standard agreement',
    'Ordinary residential lets needing more operational detail',
    'Landlords requiring guarantor-friendly wording in the supported flow',
    'Professional landlords wanting more detailed protection in disputes',
    'Landlords who want a more detailed agreement without moving into a separate England HMO, Student, or Lodger product',
  ],

  faqs: [
    {
      question: 'Does Premium still include HMO clauses in England?',
      answer:
        'No. England now routes HMO / Shared House cases to their own dedicated product. Premium remains the fuller ordinary-residential route.',
    },
    {
      question: 'What are guarantor clauses?',
      answer:
        'Guarantor clauses provide a structured third-party guarantee for tenant obligations, including guarantor identity, liability scope, and related recovery wording.',
    },
    {
      question: 'What supporting documents are included?',
      answer:
        'Premium includes a wizard-completed inventory and schedule of condition, a jurisdiction-specific compliance checklist, and tenant guidance notes.',
    },
    {
      question: 'Is Premium required for HMOs?',
      answer:
        'For England, no. HMOs now have their own dedicated HMO / Shared House product. In other jurisdictions the premium tier may still be the broader enhanced route.',
    },
    {
      question: 'What is joint and several liability?',
      answer:
        'Each tenant is individually liable for the full rent amount, not just their share. This is especially important in shared households and HMOs.',
    },
    {
      question: 'How does this help in disputes?',
      answer:
        'The inventory and schedule of condition help with evidence, while clearer tenant obligations, guarantor wording, and shared-house rules reduce ambiguity when problems arise.',
    },
    {
      question: 'Which laws apply to each jurisdiction?',
      answer:
        'England uses current England tenancy agreement wording in the current public flow. Wales follows the Renting Homes (Wales) Act 2016. Scotland follows the Private Housing (Tenancies) (Scotland) Act 2016. Northern Ireland follows the Private Tenancies Act (NI) 2022 and related HMO rules where relevant.',
    },
    {
      question: 'Do Premium agreements work for single tenants?',
      answer:
        'Yes. Premium remains suitable for ordinary residential lets where you mainly want fuller drafting, stronger operational detail, or the broader premium package.',
    },
  ],

  relatedProducts: ['ast_standard', 'notice_only', 'complete_pack'],
  relatedTools: ['hmo-checker', 'deposit-calculator', 'rent-calculator'],
  relatedBlogPosts: ['hmo-licensing-guide', 'guarantor-agreements', 'student-tenancy-tips'],
};/**
 * Export all content for easy access
 */
export const WIZARD_LANDING_CONTENT: Record<string, WizardLandingContent> = {
  notice_only: noticeOnlyContent,
  complete_pack: completePackContent,
  money_claim: moneyClaimContent,
  ast_standard: astStandardContent,
  ast_premium: astPremiumContent,
};

/**
 * Get content by product key
 */
export function getWizardLandingContent(product: string): WizardLandingContent | undefined {
  return WIZARD_LANDING_CONTENT[product];
}

/**
 * Get all landing page slugs for sitemap
 */
export function getAllLandingPageSlugs(): string[] {
  return Object.values(WIZARD_LANDING_CONTENT).map((content) => content.slug);
}

