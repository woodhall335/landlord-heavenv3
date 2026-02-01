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
 *
 * LEGAL SAFETY: Claims are accurate to what the product actually does:
 * - "Legally validated" means: jurisdiction selection, correct form mapping,
 *   required fields present, date/notice period logic checks, formatting completeness
 * - NOT "lawyer approved" unless evidence exists
 */

import { PRODUCTS } from '@/lib/pricing/products';

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
  slug: 'eviction-notice',
  title: `Eviction Notice Generator 2026 | England, Wales & Scotland | ${PRODUCTS.notice_only.displayPrice}`,
  description:
    'Generate legally validated and procedurally correct eviction notices for England (Section 21, Section 8), Wales (possession notice under Renting Homes Wales Act 2016), and Scotland (Notice to Leave). Official forms, service instructions, and validity checklist included.',
  h1: 'Eviction Notice Generator',
  subheading:
    'Legally validated and procedurally correct notices for England, Wales & Scotland',

  product: 'notice_only',
  wizardUrl: '/wizard?product=notice_only&src=product_page&topic=eviction',
  price: PRODUCTS.notice_only.displayPrice,

  jurisdictions: ['England', 'Wales', 'Scotland'],

  noticeTypes: [
    {
      name: 'Section 21 Notice',
      jurisdiction: 'England',
      description:
        'No-fault eviction notice requiring 2 months notice. Uses official Form 6A. Tenant must receive valid notice after deposit protection, gas safety, EPC, and How to Rent requirements are met.',
      legalBasis: 'Housing Act 1988, s.21',
    },
    {
      name: 'Section 8 Notice',
      jurisdiction: 'England',
      description:
        'Fault-based eviction notice citing specific grounds (e.g., rent arrears, antisocial behaviour). Uses official Form 3. Notice periods vary by ground (14 days to 2 months).',
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
    'Official government forms: Form 6A (Section 21), Form 3 (Section 8), RHW forms (Wales), Notice to Leave (Scotland)',
    'Service Instructions explaining how to legally serve the notice',
    'Service & Validity Checklist to verify compliance before serving',
    'Unlimited regenerations - edit and regenerate instantly',
    'Portal storage for 12+ months',
  ],

  howValidationWorks: [
    'Jurisdiction selection: System identifies correct notice type based on property location',
    'Compliance pre-checks: Flags common blockers (deposit protection, gas safety, EPC, How to Rent for England)',
    'Date logic: Calculates correct notice periods and earliest valid dates',
    'Required fields: Ensures all mandatory information is captured',
    'Form mapping: Generates the correct official form for your jurisdiction and grounds',
    'Formatting completeness: Verifies all sections are properly completed',
  ],

  whoThisIsFor: [
    'Landlords who need a valid eviction notice quickly',
    'Property managers handling tenant departures',
    'Landlords who want compliance checks before serving',
    'Anyone who needs to understand their eviction options by jurisdiction',
  ],

  faqs: [
    {
      question: 'What eviction notices do you generate?',
      answer:
        'We generate legally validated notices for three jurisdictions: England (Section 21 no-fault using Form 6A, Section 8 fault-based using Form 3), Wales (Section 173 no-fault and Section 181 fault-based under Renting Homes Wales Act 2016), and Scotland (Notice to Leave under the Private Housing (Tenancies) (Scotland) Act 2016).',
    },
    {
      question: 'What does "legally validated" mean?',
      answer:
        'Our system validates: (1) Jurisdiction - correct notice type for your property location, (2) Compliance checks - flags blockers like missing deposit protection, (3) Date logic - calculates correct notice periods, (4) Required fields - ensures mandatory information is captured, (5) Form mapping - generates the correct official form. This is systematic validation, not legal advice.',
    },
    {
      question: 'Are these official government forms?',
      answer:
        'Yes. We use official forms: Form 6A for Section 21 (England), Form 3 for Section 8 (England), official RHW forms for Wales, and the prescribed Notice to Leave format for Scotland.',
    },
    {
      question: 'What compliance checks are performed?',
      answer:
        'For England, we check: deposit protection status, gas safety certificate, Energy Performance Certificate, How to Rent guide provision. For Wales: Rent Smart Wales registration. For Scotland: landlord registration, First-tier Tribunal jurisdiction. Issues are flagged before generation.',
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
      question: 'How long are documents stored?',
      answer:
        'Documents are stored in your portal for at least 12 months. Download and save them any time.',
    },
    {
      question: 'Do you provide legal advice?',
      answer:
        'No. We provide document generation and validation, not legal advice. Our AI assistant helps you understand the process but is not a solicitor. Consult a qualified solicitor for complex cases.',
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
  slug: 'eviction-pack-england',
  title: `Complete Eviction Bundle 2026 – England Only | N5, N5B, N119 Forms | ${PRODUCTS.complete_pack.displayPrice}`,
  description:
    'Complete eviction bundle for England landlords: Section 21 notice + N5B accelerated possession, or Section 8 notice + N5 claim + N119 particulars. All court forms generated and validated. England only.',
  h1: 'Complete Eviction Bundle – England Only',
  subheading:
    'Section 21/Section 8 notices plus all court forms, witness statement, and filing guide',

  product: 'complete_pack',
  wizardUrl: '/wizard?product=complete_pack&src=product_page&topic=eviction',
  price: PRODUCTS.complete_pack.displayPrice,

  jurisdictions: ['England'],

  courtForms: [
    {
      name: 'Section 21 Notice',
      formNumber: 'Form 6A',
      description: 'No-fault eviction notice using official prescribed form',
      route: 'section21',
    },
    {
      name: 'N5B Accelerated Possession',
      formNumber: 'N5B',
      description:
        'Accelerated possession claim form for undefended Section 21 cases. Paper-only procedure, no hearing required if undefended.',
      route: 'section21',
    },
    {
      name: 'Section 8 Notice',
      formNumber: 'Form 3',
      description: 'Fault-based eviction notice citing grounds from Schedule 2',
      route: 'section8',
    },
    {
      name: 'N5 Claim for Possession',
      formNumber: 'N5',
      description:
        'Standard possession claim form for Section 8 cases or defended Section 21 cases',
      route: 'section8',
    },
    {
      name: 'N119 Particulars of Claim',
      formNumber: 'N119',
      description:
        'Particulars of claim for possession of property - details grounds, arrears, and history',
      route: 'section8',
    },
  ],

  whatYouGet: [
    'Eviction notice (Section 21 Form 6A or Section 8 Form 3)',
    'Court claim forms: N5B for accelerated possession OR N5 + N119 for standard possession',
    'AI-drafted witness statement with your case details',
    'Service instructions and validity checklist',
    'Court filing guide with step-by-step instructions',
    'Evidence checklist for court preparation',
    'Proof of service certificate template',
    'Unlimited regenerations and 12+ months portal storage',
  ],

  howValidationWorks: [
    'Route mapping: Section 21 → N5B accelerated route; Section 8 → N5 + N119 standard route',
    'Form generation: Official HMCTS forms pre-filled with your case details',
    'Compliance validation: Checks deposit, gas safety, EPC, How to Rent before generating',
    'Date calculations: Notice periods, court deadlines, and timeline guidance',
    'Required fields: All mandatory court form fields validated',
    'Grounds matching: Section 8 grounds mapped to correct particulars',
  ],

  whoThisIsFor: [
    'England landlords who need the complete eviction journey from notice to possession order',
    'Landlords with rent arrears seeking Section 8 possession',
    'Landlords seeking no-fault Section 21 possession',
    'Property managers handling court filings',
  ],

  faqs: [
    {
      question: 'What is the difference between Section 21 and Section 8 routes?',
      answer:
        'Section 21 (no-fault): 2 months notice, then N5B accelerated possession (no hearing if undefended). Section 8 (fault-based): Notice period varies by ground (14 days for rent arrears), then N5 + N119 for standard possession (hearing required).',
    },
    {
      question: 'What court forms are included?',
      answer:
        'For Section 21: Form 6A notice + N5B accelerated possession claim. For Section 8: Form 3 notice + N5 claim for possession + N119 particulars of claim. All are official HMCTS forms.',
    },
    {
      question: 'Is this available for Wales or Scotland?',
      answer:
        'No. This bundle is England only. Wales uses different forms under Renting Homes (Wales) Act 2016. Scotland uses First-tier Tribunal forms. For Wales/Scotland, use our Notice Only pack.',
    },
    {
      question: 'How are the forms validated?',
      answer:
        'Each form is validated for: (1) Correct form selection based on route, (2) All mandatory fields completed, (3) Date logic and deadlines, (4) Grounds properly cited, (5) Compliance requirements met.',
    },
    {
      question: 'What is N5B accelerated possession?',
      answer:
        'N5B is the accelerated possession claim form for Section 21 cases. It is a paper-only procedure - if the tenant does not defend, possession is granted without a hearing. Faster than standard N5 route.',
    },
    {
      question: 'What is N119?',
      answer:
        'N119 is the Particulars of Claim for Possession of Property. It accompanies the N5 form and details your grounds, rent arrears history, and case specifics. Required for Section 8 claims.',
    },
    {
      question: 'Can I preview before paying?',
      answer:
        'Yes. Preview all documents with watermark before paying. Edit and regenerate unlimited times.',
    },
    {
      question: 'Do you provide legal advice?',
      answer:
        'No. We provide document generation and guidance. For complex cases or if you need representation, consult a solicitor.',
    },
  ],

  relatedProducts: ['notice_only', 'money_claim'],
  relatedTools: ['section-21-generator', 'section-8-generator'],
  relatedBlogPosts: ['n5b-form-guide', 'possession-claim-guide', 'eviction-cost-uk'],
};

/**
 * MONEY CLAIM - N1 Form and Debt Recovery (England)
 */
export const moneyClaimContent: WizardLandingContent = {
  slug: 'money-claim',
  title: `Money Claim Pack 2026 | N1 Form Generator | Interest Calculator | ${PRODUCTS.money_claim.displayPrice}`,
  description:
    'Generate N1 claim form for rent arrears, property damage, cleaning costs, and other tenant debts. Automatic interest calculation with daily rate. PAP-DEBT compliant Letter Before Claim. England courts.',
  h1: 'Money Claim Pack',
  subheading:
    'N1 claim form, interest calculator, and Letter Before Claim for tenant debts',

  product: 'money_claim',
  wizardUrl: '/wizard?product=money_claim&src=product_page',
  price: PRODUCTS.money_claim.displayPrice,

  jurisdictions: ['England'],

  courtForms: [
    {
      name: 'N1 Claim Form',
      formNumber: 'N1',
      description:
        'Official county court claim form for money claims. Used for rent arrears, property damage, and other tenant debts.',
    },
    {
      name: 'Particulars of Claim',
      formNumber: 'POC',
      description:
        'Detailed statement of your claim including amounts, dates, and legal basis.',
    },
    {
      name: 'Schedule of Debt',
      formNumber: 'Schedule',
      description:
        'Itemised breakdown of all amounts claimed with supporting dates.',
    },
    {
      name: 'Interest Calculation',
      formNumber: 'Interest',
      description:
        'Automatic calculation of statutory interest at 8% per annum with daily rate.',
    },
  ],

  whatYouGet: [
    'N1 Claim Form - official county court money claim form',
    'Particulars of Claim with legal basis for your claim',
    'Schedule of Debt itemising all amounts',
    'Automatic interest calculation at 8% statutory rate with daily accrual',
    'Letter Before Claim (PAP-DEBT compliant)',
    'Defendant Information Sheet',
    'Court filing guide - where and how to file (online via MCOL or paper)',
    'Enforcement guide - bailiffs, attachment of earnings, charging orders',
    'Reply Form and Financial Statement templates',
    'Unlimited regenerations and 12+ months portal storage',
  ],

  howValidationWorks: [
    'Claim types: Validates rent arrears, property damage, cleaning costs, unpaid utilities, and other contractual sums',
    'Amount validation: Checks totals match itemised amounts',
    'Interest calculation: Automatic 8% statutory interest with daily rate breakdown',
    'Date validation: Ensures dates are consistent and within limitation period (6 years)',
    'Required fields: All mandatory N1 fields validated',
    'PAP compliance: Letter Before Claim follows Pre-Action Protocol for Debt Claims',
  ],

  whoThisIsFor: [
    'Landlords owed rent arrears by current or former tenants',
    'Landlords claiming for property damage after tenancy ends',
    'Landlords recovering cleaning costs, unpaid utilities, or other expenses',
    'Anyone needing to file a county court money claim against a tenant',
  ],

  faqs: [
    {
      question: 'What is the N1 form?',
      answer:
        'N1 is the official county court claim form for money claims in England and Wales. It is used to start legal proceedings to recover debts including rent arrears, property damage costs, and other sums owed by tenants.',
    },
    {
      question: 'What can I claim for?',
      answer:
        'You can claim for: rent arrears, property damage (carpets, walls, appliances, garden), professional cleaning costs, unpaid utilities, rubbish removal, abandoned goods disposal, council tax, early termination costs, and other contractual sums owed under the tenancy agreement.',
    },
    {
      question: 'How is interest calculated?',
      answer:
        'Statutory interest is 8% per annum. Our calculator works this out automatically, showing total interest and daily rate. For rent arrears, interest runs from each payment due date. For damage claims, interest runs from when you notified the tenant of the amount owed.',
    },
    {
      question: 'What is the daily rate?',
      answer:
        'The daily rate is the amount of interest accruing each day. Calculated as: (Principal × 8%) ÷ 365. For example, £5,000 debt accrues £1.10 per day. This continues until payment or judgment.',
    },
    {
      question: 'Where do I file the claim?',
      answer:
        'File online via Money Claim Online (MCOL) at gov.uk for claims up to £100,000, or submit paper forms to County Court Money Claims Centre (CCMCC). Our guide explains both options with step-by-step instructions.',
    },
    {
      question: 'What is PAP-DEBT?',
      answer:
        'PAP-DEBT is the Pre-Action Protocol for Debt Claims. Before issuing court proceedings, you must send a compliant Letter Before Claim giving the debtor 30 days to respond. Our Letter Before Claim follows this protocol.',
    },
    {
      question: 'Can I claim against a tenant who has left?',
      answer:
        'Yes. You have 6 years from when the debt arose to make a claim. You will need the tenant\'s current address for court service.',
    },
    {
      question: 'What happens after I win?',
      answer:
        'If the tenant does not pay voluntarily after judgment, enforcement options include: County Court Bailiffs, High Court Enforcement Officers (for debts over £600), Attachment of Earnings, and Charging Orders. Our enforcement guide covers all options.',
    },
  ],

  relatedProducts: ['notice_only', 'complete_pack'],
  relatedTools: ['rent-arrears-calculator', 'interest-calculator'],
  relatedBlogPosts: [
    'money-claim-unpaid-rent',
    'how-to-sue-tenant-for-unpaid-rent',
    'mcol-money-claim-online',
  ],
};

/**
 * AST STANDARD - Tenancy Agreements (All 4 Jurisdictions)
 */
export const astStandardContent: WizardLandingContent = {
  slug: 'tenancy-agreement',
  title: `Tenancy Agreement Generator 2026 | All UK Regions | ${PRODUCTS.ast_standard.displayPrice}`,
  description:
    'Jurisdiction-specific tenancy agreements for all UK: Assured Shorthold Tenancy (England), Occupation Contract (Wales), Private Residential Tenancy (Scotland), Private Tenancy Agreement (Northern Ireland). Legally compliant and safe.',
  h1: 'Tenancy Agreement Generator',
  subheading:
    'Jurisdiction-specific, legally compliant agreements for England, Wales, Scotland & Northern Ireland',

  product: 'ast_standard',
  wizardUrl: '/wizard?product=ast_standard&src=product_page&topic=tenancy',
  price: PRODUCTS.ast_standard.displayPrice,

  jurisdictions: ['England', 'Wales', 'Scotland', 'Northern Ireland'],

  jurisdictionCoverage: [
    {
      name: 'England',
      flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      agreementType: 'Assured Shorthold Tenancy (AST)',
      legalBasis: 'Housing Act 1988',
      keyFeatures: [
        'Fixed term or periodic tenancy',
        'Deposit protection requirements (30 days)',
        'How to Rent Guide acknowledgement',
        'Section 21/Section 8 termination provisions',
        'Minimum 6-month initial term typical',
      ],
      notes: 'Most common tenancy type in England since 1997.',
    },
    {
      name: 'Wales',
      flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
      agreementType: 'Standard Occupation Contract',
      legalBasis: 'Renting Homes (Wales) Act 2016',
      keyFeatures: [
        'Uses "Contract Holder" not "Tenant" terminology',
        'Written statement required within 14 days',
        'Rent Smart Wales registration required',
        'Section 173 (6 months) notice for no-fault possession',
        'Different deposit rules and fitness for habitation standards',
      ],
      notes: 'Wales has separate housing law since December 2022.',
    },
    {
      name: 'Scotland',
      flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
      agreementType: 'Private Residential Tenancy (PRT)',
      legalBasis: 'Private Housing (Tenancies) (Scotland) Act 2016',
      keyFeatures: [
        'Open-ended tenancy (no fixed end date)',
        'Tenant can give 28 days notice at any time',
        'Landlord needs valid eviction ground',
        'First-tier Tribunal jurisdiction',
        'Rent Pressure Zone restrictions may apply',
      ],
      notes: 'PRTs replaced Assured and Short Assured Tenancies in Scotland.',
    },
    {
      name: 'Northern Ireland',
      flag: '🇬🇧',
      agreementType: 'Private Tenancy Agreement',
      legalBasis: 'Private Tenancies Act (Northern Ireland) 2022',
      keyFeatures: [
        'Written agreement required within 28 days',
        'Rent increase restrictions (12-month gap)',
        'Notice to Quit requirements',
        'County Court Northern Ireland jurisdiction',
        'Electrical safety mandatory from April 2025',
      ],
      notes: 'Significant reforms under 2022 Act.',
    },
  ],

  whatYouGet: [
    'Tenancy agreement in correct legal format for your jurisdiction',
    'Core tenancy clauses: rent, deposit, duration, obligations',
    'Property schedules: address, inventory reference, utilities',
    'Rent and deposit schedule with payment terms',
    'House rules and property care requirements',
    'Pre-tenancy compliance checklist (jurisdiction-specific)',
    'Signature blocks for landlord and tenant',
    'Blank inventory template',
    'Unlimited regenerations and 12+ months portal storage',
  ],

  howValidationWorks: [
    'Jurisdiction detection: Generates correct agreement type based on property location',
    'Legal compliance: Uses terminology and clauses required by jurisdiction-specific legislation',
    'Cross-jurisdiction safety: Prevents England terms appearing in Wales agreements (and vice versa)',
    'Required fields: Ensures all mandatory information is captured',
    'Deposit rules: Applies correct deposit protection requirements per jurisdiction',
    'Notice provisions: References correct statutory notice periods',
  ],

  whoThisIsFor: [
    'Landlords letting residential property in any UK jurisdiction',
    'Property managers needing compliant agreements for multiple regions',
    'First-time landlords who want a professionally structured agreement',
    'Anyone renewing or creating a new tenancy agreement',
  ],

  faqs: [
    {
      question: 'What agreement type do I get for each region?',
      answer:
        'England: Assured Shorthold Tenancy (AST) under Housing Act 1988. Wales: Standard Occupation Contract under Renting Homes (Wales) Act 2016. Scotland: Private Residential Tenancy (PRT) under Private Housing (Tenancies) (Scotland) Act 2016. Northern Ireland: Private Tenancy Agreement under Private Tenancies Act (NI) 2022.',
    },
    {
      question: 'Why does jurisdiction matter?',
      answer:
        'Each UK nation has different housing legislation. Using an England AST in Wales is legally incorrect - Wales requires an Occupation Contract. Our system prevents cross-jurisdiction errors that could invalidate your agreement.',
    },
    {
      question: 'Is this agreement legally compliant?',
      answer:
        'Yes. Agreements are drafted to comply with current legislation for each jurisdiction. However, for unusual situations (commercial mixed-use, licence agreements), consult a solicitor.',
    },
    {
      question: 'What is included in the Standard agreement?',
      answer:
        'Core tenancy clauses, property schedules, rent/deposit terms, house rules, compliance checklist, signature blocks, and blank inventory template. Suitable for single household residential lets.',
    },
    {
      question: 'Do I need Premium instead?',
      answer:
        'Premium adds HMO clauses, guarantor provisions, and enhanced terms. Recommended for: HMOs (3+ unrelated tenants), student lets, properties requiring guarantors, or multi-tenant situations.',
    },
    {
      question: 'Can I preview before paying?',
      answer:
        'Yes. Preview your complete agreement with watermark before paying. Edit and regenerate unlimited times.',
    },
    {
      question: 'What about deposit protection?',
      answer:
        'The agreement references deposit protection requirements for your jurisdiction: 30 days in England, SafeDeposits Scotland/MyDeposits Scotland in Scotland, Wales deposit schemes, NI requirements.',
    },
    {
      question: 'Can I add custom clauses?',
      answer:
        'Yes. The wizard allows additional terms. However, unfair terms under consumer protection legislation are unenforceable - stick to reasonable, clear provisions.',
    },
  ],

  relatedProducts: ['ast_premium', 'notice_only'],
  relatedTools: ['hmo-checker', 'deposit-calculator'],
  relatedBlogPosts: [
    'assured-shorthold-tenancy-agreement',
    'occupation-contract-wales',
    'prt-scotland',
  ],
};

/**
 * AST PREMIUM - Enhanced Tenancy Agreements with HMO/Guarantor (All 4 Jurisdictions)
 */
export const astPremiumContent: WizardLandingContent = {
  slug: 'premium-tenancy-agreement',
  title: `Premium Tenancy Agreement 2026 | HMO & Guarantor Clauses | All UK | ${PRODUCTS.ast_premium.displayPrice}`,
  description:
    'Premium tenancy agreements with HMO clauses, guarantor provisions, and enhanced terms for England (AST), Wales (Occupation Contract), Scotland (PRT), and Northern Ireland. Jurisdiction-specific drafting with detailed schedules.',
  h1: 'Premium Tenancy Agreement',
  subheading:
    'HMO clauses, guarantor provisions, and enhanced terms for all UK jurisdictions',

  product: 'ast_premium',
  wizardUrl: '/wizard?product=ast_premium&src=product_page&topic=tenancy',
  price: PRODUCTS.ast_premium.displayPrice,

  jurisdictions: ['England', 'Wales', 'Scotland', 'Northern Ireland'],

  jurisdictionCoverage: [
    {
      name: 'England',
      flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      agreementType: 'Assured Shorthold Tenancy (AST) - Premium',
      legalBasis: 'Housing Act 1988 + Housing Act 2004 (HMO provisions)',
      keyFeatures: [
        'All Standard AST clauses plus HMO provisions',
        'Joint and several liability for multi-tenant',
        'Shared facilities rules and responsibilities',
        'Guarantor clauses with clear liability terms',
        'Rent review mechanisms (CPI/RPI-linked)',
        'Anti-subletting and Airbnb prohibition',
      ],
    },
    {
      name: 'Wales',
      flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
      agreementType: 'Standard Occupation Contract - Premium',
      legalBasis: 'Renting Homes (Wales) Act 2016 + Housing Act 2004',
      keyFeatures: [
        'All Standard Occupation Contract clauses',
        'Joint contract-holder provisions',
        'Shared accommodation rules',
        'Guarantor provisions (Wales-specific)',
        'Enhanced repair and maintenance schedules',
      ],
    },
    {
      name: 'Scotland',
      flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
      agreementType: 'Private Residential Tenancy (PRT) - Premium',
      legalBasis: 'Private Housing (Tenancies) (Scotland) Act 2016',
      keyFeatures: [
        'All Standard PRT clauses',
        'HMO licensing compliance (Civic Government Act 1982)',
        'Joint tenant provisions',
        'Guarantor clauses (Scotland-specific)',
        'Fire safety and shared facilities rules',
      ],
    },
    {
      name: 'Northern Ireland',
      flag: '🇬🇧',
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
    'Premium tenancy agreement with all Standard clauses plus HMO provisions',
    'HMO clauses: joint and several liability, shared facilities rules, tenant replacement procedure',
    'Guarantor clauses with clear liability terms and extent of guarantee',
    'Rent review mechanisms: CPI/RPI-linked increases, annual review process',
    'Anti-subletting clause: Airbnb and short-let prohibition',
    'Late payment provisions with reasonable charges',
    'Wizard-completed inventory (rooms, items, conditions)',
    'Pre-tenancy compliance checklist (jurisdiction-specific)',
    'Enhanced house rules for multi-tenant properties',
    'Unlimited regenerations and 12+ months portal storage',
  ],

  howValidationWorks: [
    'Jurisdiction-specific drafting: HMO clauses adapted to each nation\'s legislation',
    'Housing Act 2004 compliance: England HMO licensing requirements referenced',
    'Cross-jurisdiction safety: Wales Occupation Contract uses correct terminology',
    'Scotland PRT: Civic Government (Scotland) Act 1982 HMO provisions',
    'NI: Houses in Multiple Occupation Act (Northern Ireland) 2016 references',
    'Guarantor validation: Ensures guarantor details and liability scope captured',
  ],

  whoThisIsFor: [
    'HMO landlords (3+ unrelated tenants sharing facilities)',
    'Student accommodation landlords',
    'Landlords requiring guarantors (students, first-time renters)',
    'Professional landlords wanting comprehensive protection',
    'Properties with 5+ occupants requiring mandatory HMO licensing (England)',
  ],

  faqs: [
    {
      question: 'What HMO clauses are included?',
      answer:
        'Joint and several liability (each tenant liable for full rent), shared facilities rules (kitchen, bathroom, common areas), tenant replacement procedure when a sharer leaves, fire safety compliance, and quiet enjoyment provisions for multi-tenant living.',
    },
    {
      question: 'What are guarantor clauses?',
      answer:
        'Guarantor clauses provide third-party guarantee for tenant obligations. Includes: guarantor identification, extent of liability, duration of guarantee, and recovery provisions. Common for student lets and tenants without UK credit history.',
    },
    {
      question: 'Is Premium required for HMOs?',
      answer:
        'Recommended, not strictly required. However, standard agreements lack clauses commonly needed under Housing Act 2004 HMO licensing conditions. Premium includes provisions that HMO licence conditions may require.',
    },
    {
      question: 'What is joint and several liability?',
      answer:
        'Each tenant is individually liable for the entire rent amount, not just their share. If one tenant fails to pay, others are responsible. Essential for HMOs to prevent disputes over individual shares.',
    },
    {
      question: 'What bundle inclusions are there?',
      answer:
        'Premium includes: wizard-completed inventory (Standard has blank template), pre-tenancy compliance checklist, enhanced house rules for multi-tenant, guarantor provisions, and rent review mechanisms.',
    },
    {
      question: 'Which laws apply to each jurisdiction?',
      answer:
        'England: Housing Act 1988 + Housing Act 2004 (HMO). Wales: Renting Homes (Wales) Act 2016. Scotland: Private Housing (Tenancies) (Scotland) Act 2016 + Civic Government (Scotland) Act 1982. NI: Private Tenancies Act (NI) 2022 + HMO Act (NI) 2016.',
    },
    {
      question: 'Can I downgrade to Standard?',
      answer:
        'Yes. If you don\'t need HMO or guarantor clauses, Standard is sufficient and costs less. The wizard helps you decide based on your property and tenant situation.',
    },
    {
      question: 'Do Premium agreements work for single tenants?',
      answer:
        'Yes. Premium includes all Standard clauses. The HMO clauses simply won\'t apply for a single-tenant property. Useful if you want guarantor provisions without full HMO terms.',
    },
  ],

  relatedProducts: ['ast_standard', 'notice_only', 'complete_pack'],
  relatedTools: ['hmo-checker', 'deposit-calculator', 'rent-calculator'],
  relatedBlogPosts: ['hmo-licensing-guide', 'guarantor-agreements', 'student-tenancy-tips'],
};

/**
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
