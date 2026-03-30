/**
 * Centralized internal link definitions for consistent linking across the site
 *
 * Use these with the RelatedLinks component for SEO-optimized internal linking
 *
 * IMPORTANT: Generic informational links should point to the chosen SEO owner for
 * each cluster. Product links stay transactional.
 */


export const productLinks = {
  noticeOnly: {
    href: '/products/notice-only',
    title: 'Notice Only Pack',
    description: 'Create and check the notice pack for the route you are serving.',
    icon: 'document' as const,
    type: 'product' as const,
  },
  completePack: {
    href: '/products/complete-pack',
    title: 'Complete Eviction Bundle',
    description: 'Full eviction package with court forms and guidance.',
    icon: 'legal' as const,
    type: 'product' as const,
  },
  moneyClaim: {
    href: '/products/money-claim',
    title: 'Money Claim Pack',
    description: 'Start a landlord money claim pack for rent, damage, and tenant debts.',
    icon: 'document' as const,
    type: 'product' as const,
  },
  tenancyAgreement: {
    href: '/products/ast',
    title: 'England Agreement Type Comparison',
    description: 'Compare Standard, Premium, Student, HMO / Shared House, and Lodger routes.',
    icon: 'document' as const,
    type: 'product' as const,
  },
  premiumTenancyAgreement: {
    href: '/premium-tenancy-agreement',
    title: 'Premium Tenancy Agreement',
    description: 'Fuller ordinary-residential drafting with broader management schedules and support documents.',
    icon: 'document' as const,
    type: 'product' as const,
  },
};

export const toolLinks = {
  section21Generator: {
    href: '/section-21-notice-template',
    title: 'Section 21 Notice Pack',
    description: 'Start the paid notice route for Section 21 possession.',
    icon: 'document' as const,
    type: 'tool' as const,
  },
  section8Generator: {
    href: '/section-8-notice-template',
    title: 'Section 8 Notice Pack',
    description: 'Start the paid notice route for Section 8 possession.',
    icon: 'document' as const,
    type: 'tool' as const,
  },
  section21Validator: {
    href: '/section-21-notice',
    title: 'Section 21 Notice Guide',
    description: 'Read the current Section 21 transition and next steps.',
    icon: 'legal' as const,
    type: 'tool' as const,
  },
  section8Validator: {
    href: '/section-8-notice',
    title: 'Section 8 Notice Guide',
    description: 'Read the Section 8 grounds, notice periods, and possession workflow.',
    icon: 'legal' as const,
    type: 'tool' as const,
  },
  rentDemandLetter: {
    href: '/tools/free-rent-demand-letter',
    title: 'Free Rent Demand Letter',
    description: 'Generate rent arrears letter',
    icon: 'document' as const,
    type: 'tool' as const,
  },
  rentArrearsCalculator: {
    href: '/tools/rent-arrears-calculator',
    title: 'Rent Arrears Calculator',
    description: 'Calculate total owed with interest',
    icon: 'calculator' as const,
    type: 'tool' as const,
  },
  hmoChecker: {
    href: '/tools/hmo-license-checker',
    title: 'HMO License Checker',
    description: 'Check if you need an HMO license',
    icon: 'home' as const,
    type: 'tool' as const,
  },
};

export const blogLinks = {
  whatIsSection21: {
    href: '/blog/what-is-section-21-notice',
    title: 'What Is a Section 21 Notice?',
    description: 'Complete guide to no-fault evictions',
    icon: 'legal' as const,
    type: 'guide' as const,
  },
  section21VsSection8: {
    href: '/blog/section-21-vs-section-8',
    title: 'Section 21 vs Section 8',
    description: 'Which eviction notice to use',
    icon: 'legal' as const,
    type: 'guide' as const,
  },
  howToServeNotice: {
    href: '/blog/how-to-serve-eviction-notice',
    title: 'How to Serve an Eviction Notice',
    description: 'Step-by-step serving guide',
    icon: 'document' as const,
    type: 'guide' as const,
  },
  evictionTimeline: {
    href: '/blog/how-long-does-eviction-take-uk',
    title: 'How Long Does Eviction Take?',
    description: 'UK eviction timeline explained',
    icon: 'legal' as const,
    type: 'guide' as const,
  },
  rentArrearsEviction: {
    href: '/blog/rent-arrears-eviction-guide',
    title: 'Rent Arrears Eviction Guide',
    description: 'Evicting for unpaid rent',
    icon: 'legal' as const,
    type: 'guide' as const,
  },
};

export const landingPageLinks = {
  section21Template: {
    href: '/section-21-notice-template',
    title: 'Section 21 Notice Template',
    description: 'Free template download (England)',
    icon: 'document' as const,
    type: 'page' as const,
  },
  evictionTemplate: {
    href: '/eviction-notice-template',
    title: 'Eviction Notice Template',
    description: 'England notice owner with the broad route and next steps',
    icon: 'document' as const,
    type: 'page' as const,
  },
  section8Template: {
    href: '/section-8-notice-template',
    title: 'Section 8 Notice Template',
    description: 'Grounds-based eviction (England)',
    icon: 'document' as const,
    type: 'page' as const,
  },
  rentArrearsTemplate: {
    href: '/rent-arrears-letter-template',
    title: 'Rent Arrears Letter Template',
    description: 'Demand letter template',
    icon: 'document' as const,
    type: 'page' as const,
  },
  tenancyTemplate: {
    href: '/tenancy-agreement-template',
    title: 'Tenancy Agreement Template for England',
    description: 'Real England tenancy agreement example with a route into Standard and Premium',
    icon: 'document' as const,
    type: 'page' as const,
  },
  walesEvictionTemplate: {
    href: '/wales-eviction-notices',
    title: 'Wales Eviction Notices',
    description: 'Renting Homes Act notices',
    icon: 'document' as const,
    type: 'page' as const,
  },
  scotlandNoticeToLeaveTemplate: {
    href: '/scotland-eviction-notices',
    title: 'Scotland Eviction Notices',
    description: 'PRT eviction notices',
    icon: 'document' as const,
    type: 'page' as const,
  },
};

export const residentialDocumentLinks = {
  documentsHub: {
    href: '/landlord-documents-england',
    title: 'England landlord documents',
    description: 'Bridge page linking only to surviving tenancy and arrears routes.',
    icon: 'document' as const,
    type: 'page' as const,
  },
};

// New guide pages for SEO authority
export const guideLinks = {
  howToEvictTenant: {
    href: '/how-to-evict-tenant',
    title: 'How to Evict a Tenant UK',
    description: 'Complete UK eviction guide',
    icon: 'legal' as const,
    type: 'guide' as const,
  },
  evictionProcessUk: {
    href: '/eviction-process-uk',
    title: 'Eviction Process UK',
    description: 'Step-by-step eviction process guide',
    icon: 'legal' as const,
    type: 'guide' as const,
  },
  section8Notice: {
    href: '/section-8-notice',
    title: 'Section 8 Notice Guide',
    description: 'Grounds-based possession notice guide',
    icon: 'legal' as const,
    type: 'guide' as const,
  },
  section21Notice: {
    href: '/section-21-notice',
    title: 'Section 21 Notice Transition Guide',
    description: 'Legacy Section 21 intent and next steps',
    icon: 'legal' as const,
    type: 'guide' as const,
  },
  section21BanUk: {
    href: '/section-21-ban-uk',
    title: 'Section 21 Ban UK Guide',
    description: 'What landlords do after Section 21 ends',
    icon: 'legal' as const,
    type: 'guide' as const,
  },
  walesEviction: {
    href: '/wales-eviction-notices',
    title: 'Wales Eviction Guide',
    description: 'Renting Homes Act notices',
    icon: 'legal' as const,
    type: 'guide' as const,
  },
  scotlandEviction: {
    href: '/scotland-eviction-notices',
    title: 'Scotland Eviction Guide',
    description: 'Notice to Leave & PRT',
    icon: 'legal' as const,
    type: 'guide' as const,
  },
  moneyClaimGuide: {
    href: '/money-claim',
    title: 'Money Claim Guide',
    description: 'England landlord guide to starting a money claim',
    icon: 'legal' as const,
    type: 'guide' as const,
  },
  tenantWontLeave: {
    href: '/tenant-wont-leave',
    title: 'Tenant Won\'t Leave Guide',
    description: 'What to do when tenant refuses',
    icon: 'legal' as const,
    type: 'guide' as const,
  },
  tenantNotPayingRent: {
    href: '/tenant-not-paying-rent',
    title: 'Tenant Not Paying Rent',
    description: 'Rent arrears solutions',
    icon: 'legal' as const,
    type: 'guide' as const,
  },
  possessionClaimGuide: {
    href: '/possession-claim-guide',
    title: 'Possession Claim Guide',
    description: 'Court possession process',
    icon: 'legal' as const,
    type: 'guide' as const,
  },
  evictionCostUk: {
    href: '/eviction-cost-uk',
    title: 'Eviction Costs UK',
    description: 'Full cost breakdown',
    icon: 'calculator' as const,
    type: 'guide' as const,
  },
  n5bFormGuide: {
    href: '/n5b-form-guide',
    title: 'N5B Form Guide',
    description: 'Accelerated possession',
    icon: 'document' as const,
    type: 'guide' as const,
  },
  warrantOfPossession: {
    href: '/warrant-of-possession',
    title: 'Warrant of Possession',
    description: 'Bailiff enforcement guide',
    icon: 'legal' as const,
    type: 'guide' as const,
  },
};

// Money Claim SEO Landing Pages (Q1 2026 Expansion)
export const moneyClaimGuides = {
  // Core hub pages (6 existing)
  unpaidRent: {
    href: '/money-claim-unpaid-rent',
    title: 'Claim Unpaid Rent Guide',
    description: 'MCOL process for rent arrears',
    icon: 'legal' as const,
    type: 'guide' as const,
  },
  rentArrearsFromTenant: {
    href: '/money-claim-unpaid-rent',
    title: 'Claim Rent Arrears from Tenant',
    description: 'Step-by-step rent recovery guide',
    icon: 'legal' as const,
    type: 'guide' as const,
  },
  sueTenantUnpaidRent: {
    href: '/money-claim-unpaid-rent',
    title: 'How to Sue Tenant for Unpaid Rent',
    description: 'Court action for rent recovery',
    icon: 'legal' as const,
    type: 'guide' as const,
  },
  propertyDamage: {
    href: '/money-claim-property-damage',
    title: 'Property Damage Claims',
    description: 'Recover tenant damage costs',
    icon: 'legal' as const,
    type: 'guide' as const,
  },
  cleaningCosts: {
    href: '/money-claim-cleaning-costs',
    title: 'Cleaning Cost Claims',
    description: 'End-of-tenancy cleaning recovery',
    icon: 'legal' as const,
    type: 'guide' as const,
  },
  unpaidUtilities: {
    href: '/money-claim-unpaid-utilities',
    title: 'Unpaid Utilities Claims',
    description: 'Recover utility bills from tenant',
    icon: 'legal' as const,
    type: 'guide' as const,
  },
  // Damage-focused pages (6)
  gardenDamage: {
    href: '/money-claim-garden-damage',
    title: 'Garden Damage Claims',
    description: 'Claim for garden neglect & damage',
    icon: 'legal' as const,
    type: 'guide' as const,
  },
  carpetDamage: {
    href: '/money-claim-carpet-damage',
    title: 'Carpet Damage Claims',
    description: 'Stains, burns & carpet replacement',
    icon: 'legal' as const,
    type: 'guide' as const,
  },
  applianceDamage: {
    href: '/money-claim-appliance-damage',
    title: 'Appliance Damage Claims',
    description: 'Damaged kitchen appliances',
    icon: 'legal' as const,
    type: 'guide' as const,
  },
  wallDamage: {
    href: '/money-claim-wall-damage',
    title: 'Wall & Door Damage Claims',
    description: 'Holes, dents & fixture damage',
    icon: 'legal' as const,
    type: 'guide' as const,
  },
  bathroomDamage: {
    href: '/money-claim-bathroom-damage',
    title: 'Bathroom Damage Claims',
    description: 'Limescale, mould & fitting damage',
    icon: 'legal' as const,
    type: 'guide' as const,
  },
  abandonedGoods: {
    href: '/money-claim-abandoned-goods',
    title: 'Abandoned Goods Removal',
    description: 'Dispose of tenant belongings legally',
    icon: 'legal' as const,
    type: 'guide' as const,
  },
  // Debt-focused pages (6)
  councilTax: {
    href: '/money-claim-council-tax',
    title: 'Council Tax Claims',
    description: 'Recover unpaid council tax',
    icon: 'legal' as const,
    type: 'guide' as const,
  },
  breakClause: {
    href: '/money-claim-early-termination',
    title: 'Early Termination Claims',
    description: 'Tenant left before end of term',
    icon: 'legal' as const,
    type: 'guide' as const,
  },
  unpaidBills: {
    href: '/money-claim-unpaid-bills',
    title: 'Unpaid Bills Recovery',
    description: 'Gas, electric & water arrears',
    icon: 'legal' as const,
    type: 'guide' as const,
  },
  guarantorClaims: {
    href: '/money-claim-guarantor',
    title: 'Claims Against Guarantor',
    description: 'Sue guarantor for tenant debt',
    icon: 'legal' as const,
    type: 'guide' as const,
  },
  formerTenant: {
    href: '/money-claim-former-tenant',
    title: 'Claims Against Former Tenant',
    description: 'Trace & claim from ex-tenant',
    icon: 'legal' as const,
    type: 'guide' as const,
  },
  depositShortfall: {
    href: '/money-claim-deposit-shortfall',
    title: 'Deposit Shortfall Claims',
    description: 'When deposit doesn\'t cover damage',
    icon: 'legal' as const,
    type: 'guide' as const,
  },
  // Process pages (4)
  mcolProcess: {
    href: '/money-claim-online-mcol',
    title: 'MCOL Step-by-Step Guide',
    description: 'Money Claim Online walkthrough',
    icon: 'legal' as const,
    type: 'guide' as const,
  },
  ccjEnforcement: {
    href: '/money-claim-ccj-enforcement',
    title: 'CCJ Enforcement Options',
    description: 'Bailiffs, wages & charging orders',
    icon: 'legal' as const,
    type: 'guide' as const,
  },
  smallClaimsCourt: {
    href: '/money-claim-small-claims-landlord',
    title: 'Small Claims for Landlords',
    description: 'Claims under £10,000 explained',
    icon: 'legal' as const,
    type: 'guide' as const,
  },
  defendedClaims: {
    href: '/money-claim-tenant-defends',
    title: 'When Tenant Defends Claim',
    description: 'Prepare for disputed claims',
    icon: 'legal' as const,
    type: 'guide' as const,
  },
};

// Money Claim Form/Template Pages
export const moneyClaimForms = {
  n1Form: {
    href: '/money-claim-n1-claim-form',
    title: 'N1 Claim Form Template',
    description: 'Blank court claim form (England)',
    icon: 'document' as const,
    type: 'page' as const,
  },
  letterBeforeAction: {
    href: '/money-claim-letter-before-action',
    title: 'Letter Before Action Template',
    description: 'Pre-action protocol letter',
    icon: 'document' as const,
    type: 'page' as const,
  },
  scheduleOfDebt: {
    href: '/money-claim-schedule-of-debt',
    title: 'Schedule of Debt Template',
    description: 'Itemised rent arrears schedule',
    icon: 'document' as const,
    type: 'page' as const,
  },
  financialStatement: {
    href: '/money-claim-pap-financial-statement',
    title: 'PAP Financial Statement',
    description: 'Pre-action protocol reply form',
    icon: 'document' as const,
    type: 'page' as const,
  },
};

// Money Claim Blog Posts (Informational)
// Note: Some blog posts are planned but not yet created - commented out to prevent 404s
export const moneyClaimBlogs = {
  // evidenceGuide: {
  //   href: '/blog/money-claim-evidence-guide',
  //   title: 'What Evidence You Need for a Money Claim',
  //   description: 'Essential documents & photos',
  //   icon: 'legal' as const,
  //   type: 'guide' as const,
  // },
  fairWearAndTear: {
    href: '/blog/fair-wear-tear-vs-tenant-damage',
    title: 'Fair Wear and Tear Explained',
    description: 'What you can and cannot claim',
    icon: 'legal' as const,
    type: 'guide' as const,
  },
  letterBeforeActionGuide: {
    href: '/blog/how-to-write-letter-before-action-unpaid-rent',
    title: 'Letter Before Action Guide',
    description: 'How to write a proper LBA',
    icon: 'legal' as const,
    type: 'guide' as const,
  },
  // mcolVsSolicitor: {
  //   href: '/blog/mcol-vs-solicitor-comparison',
  //   title: 'MCOL vs Solicitor: Which is Better?',
  //   description: 'Cost & time comparison',
  //   icon: 'legal' as const,
  //   type: 'guide' as const,
  // },
  ccjConsequences: {
    href: '/blog/what-is-county-court-judgment-landlords',
    title: 'What Happens When Tenant Gets CCJ',
    description: 'Credit impact & enforcement',
    icon: 'legal' as const,
    type: 'guide' as const,
  },
  interestCalculation: {
    href: '/blog/calculating-interest-tenant-debt',
    title: 'Calculating Interest on Rent Arrears',
    description: 'Statutory 8% interest explained',
    icon: 'calculator' as const,
    type: 'guide' as const,
  },
  // depositVsCourt: {
  //   href: '/blog/deposit-dispute-vs-court-claim',
  //   title: 'Deposit Dispute vs Court Claim',
  //   description: 'Which route to take',
  //   icon: 'legal' as const,
  //   type: 'guide' as const,
  // },
  // enforcingJudgment: {
  //   href: '/blog/enforcing-money-judgment',
  //   title: 'Enforcing a Money Judgment',
  //   description: 'Post-CCJ collection options',
  //   icon: 'legal' as const,
  //   type: 'guide' as const,
  // },
  // tenantTracingGuide: {
  //   href: '/blog/tracing-former-tenant',
  //   title: 'How to Trace a Former Tenant',
  //   description: 'Find tenants who left owing money',
  //   icon: 'legal' as const,
  //   type: 'guide' as const,
  // },
  courtHearingPrep: {
    href: '/blog/small-claims-court-tips-landlords',
    title: 'Preparing for Small Claims Hearing',
    description: 'What to expect on the day',
    icon: 'legal' as const,
    type: 'guide' as const,
  },
};

// Pre-built link groups for common use cases
export const evictionRelatedLinks = [
  landingPageLinks.evictionTemplate,
  guideLinks.section8Notice,
  guideLinks.section21Notice,
  guideLinks.howToEvictTenant,
  productLinks.noticeOnly,
  productLinks.completePack,
  guideLinks.walesEviction,
  guideLinks.scotlandEviction,
];

export const section21RelatedLinks = [
  landingPageLinks.evictionTemplate,
  guideLinks.section8Notice,
  guideLinks.section21Notice,
  guideLinks.section21BanUk,
  productLinks.noticeOnly,
  blogLinks.whatIsSection21,
  productLinks.completePack,
];

export const section8RelatedLinks = [
  landingPageLinks.evictionTemplate,
  guideLinks.section8Notice,
  guideLinks.section21Notice,
  productLinks.noticeOnly,
  productLinks.completePack,
  toolLinks.section8Validator,
  toolLinks.section8Generator,
  blogLinks.rentArrearsEviction,
];

export const rentArrearsRelatedLinks = [
  guideLinks.moneyClaimGuide,
  moneyClaimGuides.unpaidRent,
  productLinks.moneyClaim,
  toolLinks.rentDemandLetter,
  toolLinks.rentArrearsCalculator,
  landingPageLinks.rentArrearsTemplate,
];

export const tenancyRelatedLinks = [
  landingPageLinks.tenancyTemplate,
  productLinks.tenancyAgreement,
];

// Ask Heaven - Free Q&A tool (defined early so it can be used in jurisdiction link groups)
export const askHeavenLink = {
  href: '/ask-heaven',
  title: 'Ask Heaven',
  description: 'Free UK landlord Q&A tool',
  icon: 'legal' as const,
  type: 'tool' as const,
};

// Jurisdiction-specific link groups (with Ask Heaven for uncertainty resolution)
export const walesRelatedLinks = [
  askHeavenLink,
  guideLinks.walesEviction,
  landingPageLinks.walesEvictionTemplate,
  guideLinks.howToEvictTenant,
  productLinks.noticeOnly,
];

export const scotlandRelatedLinks = [
  askHeavenLink,
  guideLinks.scotlandEviction,
  landingPageLinks.scotlandNoticeToLeaveTemplate,
  guideLinks.howToEvictTenant,
  productLinks.noticeOnly,
];

export const moneyClaimRelatedLinks = [
  guideLinks.moneyClaimGuide,
  moneyClaimGuides.unpaidRent,
  moneyClaimForms.letterBeforeAction,
  moneyClaimGuides.mcolProcess,
  productLinks.moneyClaim,
  toolLinks.rentArrearsCalculator,
  toolLinks.rentDemandLetter,
];

// Ask Heaven related links group
export const askHeavenRelatedLinks = [
  askHeavenLink,
  guideLinks.howToEvictTenant,
  guideLinks.moneyClaimGuide,
  guideLinks.walesEviction,
  guideLinks.scotlandEviction,
  toolLinks.rentArrearsCalculator,
  toolLinks.section21Validator,
  toolLinks.section8Validator,
  toolLinks.section21Generator,
  toolLinks.section8Generator,
];

// Updated eviction links to include Ask Heaven
export const evictionWithAdviceLinks = [
  askHeavenLink,
  guideLinks.howToEvictTenant,
  productLinks.noticeOnly,
  productLinks.completePack,
  guideLinks.walesEviction,
  guideLinks.scotlandEviction,
];

// Updated rent arrears links to include Ask Heaven
export const rentArrearsWithAdviceLinks = [
  askHeavenLink,
  guideLinks.moneyClaimGuide,
  productLinks.moneyClaim,
  toolLinks.rentDemandLetter,
  toolLinks.rentArrearsCalculator,
  landingPageLinks.rentArrearsTemplate,
];

// SEO page related link groups (Q1/Q2 2026)
export const tenantWontLeaveRelatedLinks = [
  guideLinks.howToEvictTenant,
  guideLinks.evictionProcessUk,
  productLinks.completePack,
  guideLinks.section21BanUk,
  guideLinks.section8Notice,
  toolLinks.section21Generator,
  toolLinks.section8Generator,
  guideLinks.possessionClaimGuide,
];

export const tenantNotPayingRentRelatedLinks = [
  guideLinks.tenantNotPayingRent,
  guideLinks.section8Notice,
  guideLinks.section21BanUk,
  productLinks.moneyClaim,
  productLinks.completePack,
  landingPageLinks.section8Template,
  toolLinks.section8Generator,
  toolLinks.rentDemandLetter,
  toolLinks.rentArrearsCalculator,
];

export const possessionClaimRelatedLinks = [
  productLinks.completePack,
  productLinks.noticeOnly,
  guideLinks.n5bFormGuide,
  guideLinks.warrantOfPossession,
  landingPageLinks.section21Template,
  landingPageLinks.section8Template,
];

export const evictionCostRelatedLinks = [
  guideLinks.howToEvictTenant,
  guideLinks.evictionProcessUk,
  guideLinks.section8Notice,
  guideLinks.section21BanUk,
  productLinks.moneyClaim,
  guideLinks.possessionClaimGuide,
  guideLinks.moneyClaimGuide,
  toolLinks.rentArrearsCalculator,
];

export const n5bFormRelatedLinks = [
  productLinks.completePack,
  guideLinks.possessionClaimGuide,
  guideLinks.warrantOfPossession,
  landingPageLinks.section21Template,
  toolLinks.section21Validator,
];

export const warrantOfPossessionRelatedLinks = [
  productLinks.completePack,
  guideLinks.possessionClaimGuide,
  guideLinks.n5bFormGuide,
  guideLinks.evictionCostUk,
  guideLinks.howToEvictTenant,
];

// ============================================
// MONEY CLAIM SEO LINK GROUPS (Q1 2026)
// ============================================

// General money claim links (for hub pages)
export const moneyClaimHubLinks = [
  guideLinks.moneyClaimGuide,
  moneyClaimGuides.unpaidRent,
  moneyClaimGuides.unpaidBills,
  moneyClaimGuides.propertyDamage,
  moneyClaimGuides.cleaningCosts,
  moneyClaimGuides.mcolProcess,
  productLinks.moneyClaim,
  moneyClaimGuides.unpaidUtilities,
  toolLinks.rentArrearsCalculator,
  toolLinks.rentDemandLetter,
];

// Property damage focused links
export const moneyClaimDamageLinks = [
  guideLinks.moneyClaimGuide,
  moneyClaimGuides.propertyDamage,
  moneyClaimGuides.carpetDamage,
  moneyClaimGuides.wallDamage,
  moneyClaimGuides.bathroomDamage,
  moneyClaimGuides.applianceDamage,
  moneyClaimGuides.gardenDamage,
  moneyClaimGuides.depositShortfall,
  productLinks.moneyClaim,
  moneyClaimBlogs.fairWearAndTear,
];

// Cleaning focused links
export const moneyClaimCleaningLinks = [
  guideLinks.moneyClaimGuide,
  moneyClaimGuides.cleaningCosts,
  moneyClaimGuides.abandonedGoods,
  moneyClaimGuides.gardenDamage,
  moneyClaimGuides.depositShortfall,
  productLinks.moneyClaim,
  moneyClaimBlogs.fairWearAndTear,
  // moneyClaimBlogs.evidenceGuide, // Blog post not yet published
];

// Utilities and bills focused links
export const moneyClaimUtilitiesLinks = [
  guideLinks.moneyClaimGuide,
  moneyClaimGuides.unpaidBills,
  moneyClaimGuides.unpaidUtilities,
  moneyClaimGuides.formerTenant,
  productLinks.moneyClaim,
  moneyClaimGuides.councilTax,
  // moneyClaimBlogs.evidenceGuide, // Blog post not yet published
];

// Rent arrears focused links
export const moneyClaimRentLinks = [
  guideLinks.moneyClaimGuide,
  moneyClaimGuides.unpaidRent,
  moneyClaimGuides.formerTenant,
  moneyClaimGuides.guarantorClaims,
  toolLinks.rentArrearsCalculator,
  productLinks.moneyClaim,
  moneyClaimGuides.rentArrearsFromTenant,
  moneyClaimGuides.sueTenantUnpaidRent,
  moneyClaimGuides.breakClause,
  toolLinks.rentDemandLetter,
  moneyClaimBlogs.interestCalculation,
];

// Court process focused links
export const moneyClaimProcessLinks = [
  guideLinks.moneyClaimGuide,
  moneyClaimGuides.mcolProcess,
  moneyClaimForms.n1Form,
  moneyClaimForms.letterBeforeAction,
  moneyClaimGuides.ccjEnforcement,
  productLinks.moneyClaim,
  moneyClaimGuides.smallClaimsCourt,
  moneyClaimGuides.defendedClaims,
  moneyClaimBlogs.courtHearingPrep,
];

// Enforcement focused links
export const moneyClaimEnforcementLinks = [
  guideLinks.moneyClaimGuide,
  moneyClaimGuides.ccjEnforcement,
  moneyClaimGuides.formerTenant,
  productLinks.moneyClaim,
  // moneyClaimBlogs.enforcingJudgment, // Blog post not yet published
  moneyClaimBlogs.ccjConsequences,
  // moneyClaimBlogs.tenantTracingGuide, // Blog post not yet published
];

// Form page focused links
export const moneyClaimFormLinks = [
  guideLinks.moneyClaimGuide,
  moneyClaimForms.letterBeforeAction,
  moneyClaimForms.scheduleOfDebt,
  moneyClaimForms.n1Form,
  moneyClaimGuides.mcolProcess,
  productLinks.moneyClaim,
  moneyClaimForms.financialStatement,
  moneyClaimBlogs.letterBeforeActionGuide,
];

// Blog post sidebar links
export const moneyClaimBlogSidebarLinks = [
  guideLinks.moneyClaimGuide,
  moneyClaimGuides.unpaidRent,
  moneyClaimGuides.propertyDamage,
  moneyClaimGuides.cleaningCosts,
  moneyClaimGuides.mcolProcess,
  productLinks.moneyClaim,
  toolLinks.rentArrearsCalculator,
  moneyClaimForms.letterBeforeAction,
];

// ============================================
// TENANCY AGREEMENT SEO LINK GROUPS (Q1 2026)
// ============================================

// Individual tenancy agreement page links
export const tenancyAgreementPageLinks = {
  // England
  astTemplate: {
    href: '/assured-shorthold-tenancy-agreement-template',
    title: 'AST Template 2026',
    description: 'Assured Shorthold Tenancy agreement',
    icon: 'document' as const,
    type: 'page' as const,
  },
  astTemplateEngland: {
    href: '/assured-shorthold-tenancy-agreement-template',
    title: 'AST Legacy Guide',
    description: 'Legacy AST terminology explained for England landlords',
    icon: 'document' as const,
    type: 'page' as const,
  },
  tenancyAgreementFree: {
    href: '/tenancy-agreement-template',
    title: 'England Template Hub',
    description: 'Real example and guide for the main England tenancy route',
    icon: 'legal' as const,
    type: 'guide' as const,
  },
  jointTenancy: {
    href: '/joint-tenancy-agreement-template',
    title: 'Joint Tenancy Template',
    description: 'Multiple tenant agreements',
    icon: 'document' as const,
    type: 'page' as const,
  },
  // Wales
  occupationContractWales: {
    href: '/occupation-contract-template-wales',
    title: 'Wales Occupation Contract',
    description: 'Renting Homes Act 2016 compliant',
    icon: 'document' as const,
    type: 'page' as const,
  },
  rentingHomesWrittenStatement: {
    href: '/renting-homes-wales-written-statement',
    title: 'Written Statement Wales',
    description: 'Required landlord documentation',
    icon: 'document' as const,
    type: 'page' as const,
  },
  standardOccupationContract: {
    href: '/standard-occupation-contract-wales',
    title: 'Standard Occupation Contract',
    description: 'Wales SOC template',
    icon: 'document' as const,
    type: 'page' as const,
  },
  walesTenancyTemplate: {
    href: '/wales-tenancy-agreement-template',
    title: 'Wales Tenancy Template',
    description: 'Occupation contract guide',
    icon: 'document' as const,
    type: 'page' as const,
  },
  // Scotland
  prtTemplate: {
    href: '/private-residential-tenancy-agreement-template',
    title: 'PRT Template 2026',
    description: 'Scotland Private Residential Tenancy',
    icon: 'document' as const,
    type: 'page' as const,
  },
  prtTemplateScotland: {
    href: '/prt-template-scotland',
    title: 'Scotland PRT Template',
    description: 'Private Housing Act 2016 compliant',
    icon: 'document' as const,
    type: 'page' as const,
  },
  scottishTenancyTemplate: {
    href: '/scottish-tenancy-agreement-template',
    title: 'Scottish Tenancy Template',
    description: 'PRT agreement guide',
    icon: 'document' as const,
    type: 'page' as const,
  },
  scotlandModelAgreement: {
    href: '/scotland-prt-model-agreement-guide',
    title: 'Model PRT Agreement Guide',
    description: 'Scottish Government model vs custom',
    icon: 'legal' as const,
    type: 'guide' as const,
  },
  // Northern Ireland
  niTenancyTemplate: {
    href: '/northern-ireland-tenancy-agreement-template',
    title: 'NI Tenancy Template',
    description: 'Private Tenancies Act 2022 compliant',
    icon: 'document' as const,
    type: 'page' as const,
  },
  niPrivateTenancy: {
    href: '/ni-private-tenancy-agreement',
    title: 'Private Tenancy Agreement NI',
    description: 'Complete NI tenancy guide',
    icon: 'legal' as const,
    type: 'guide' as const,
  },
  niNoticeToQuit: {
    href: '/notice-to-quit-northern-ireland-guide',
    title: 'Notice to Quit NI Guide',
    description: 'NI eviction notice process',
    icon: 'legal' as const,
    type: 'guide' as const,
  },
  niTenancyFree: {
    href: '/ni-tenancy-agreement-template-free',
    title: 'Free NI Templates Comparison',
    description: 'Risks of free templates',
    icon: 'legal' as const,
    type: 'guide' as const,
  },
};

// England tenancy agreement links
export const tenancyAgreementEnglandLinks = [
  landingPageLinks.tenancyTemplate,
  {
    href: '/standard-tenancy-agreement',
    title: 'Standard Tenancy Agreement',
    description: 'Baseline England residential route for straightforward whole-property lets.',
    icon: 'document' as const,
    type: 'page' as const,
  },
  {
    href: '/premium-tenancy-agreement',
    title: 'Premium Tenancy Agreement',
    description:
      'Ordinary-residential premium route with fuller management and operational detail.',
    icon: 'document' as const,
    type: 'page' as const,
  },
  {
    href: '/student-tenancy-agreement',
    title: 'Student Tenancy Agreement',
    description: 'England student-focused route with guarantor and end-of-term detail.',
    icon: 'document' as const,
    type: 'page' as const,
  },
  {
    href: '/hmo-shared-house-tenancy-agreement',
    title: 'HMO / Shared House Tenancy Agreement',
    description: 'England shared-house route with communal-area controls and sharer drafting.',
    icon: 'home' as const,
    type: 'page' as const,
  },
  {
    href: '/lodger-agreement',
    title: 'Room Let / Lodger Agreement',
    description:
      'Resident-landlord room-let route kept separate from the assured-tenancy products.',
    icon: 'home' as const,
    type: 'page' as const,
  },
  tenancyAgreementPageLinks.astTemplate,
  {
    href: '/assured-periodic-tenancy-agreement',
    title: 'Assured Periodic Guide',
    description: 'Support page explaining newer England terminology',
    icon: 'document' as const,
    type: 'page' as const,
  },
  productLinks.tenancyAgreement,
  askHeavenLink,
];

// Wales tenancy agreement links
export const tenancyAgreementWalesLinks = [
  productLinks.tenancyAgreement,
  tenancyAgreementPageLinks.occupationContractWales,
  tenancyAgreementPageLinks.rentingHomesWrittenStatement,
  tenancyAgreementPageLinks.standardOccupationContract,
  tenancyAgreementPageLinks.walesTenancyTemplate,
  guideLinks.walesEviction,
  askHeavenLink,
];

// Scotland tenancy agreement links
export const tenancyAgreementScotlandLinks = [
  productLinks.tenancyAgreement,
  tenancyAgreementPageLinks.prtTemplate,
  tenancyAgreementPageLinks.prtTemplateScotland,
  tenancyAgreementPageLinks.scottishTenancyTemplate,
  tenancyAgreementPageLinks.scotlandModelAgreement,
  guideLinks.scotlandEviction,
  askHeavenLink,
];

// Northern Ireland tenancy agreement links
export const tenancyAgreementNILinks = [
  productLinks.tenancyAgreement,
  tenancyAgreementPageLinks.niTenancyTemplate,
  tenancyAgreementPageLinks.niPrivateTenancy,
  tenancyAgreementPageLinks.niNoticeToQuit,
  tenancyAgreementPageLinks.niTenancyFree,
  askHeavenLink,
];

// ============================================
// TENANCY AGREEMENT SEO LANDING PAGE LINKS (Q1 2026)
// ============================================

// England AST SEO Pages
export const tenancySeoEnglandPages = {
  astMain: {
    href: '/assured-shorthold-tenancy-agreement-template',
    title: 'AST Legacy Guide',
    description: 'Legacy AST terminology routed into the main England template hub',
    icon: 'document' as const,
    type: 'page' as const,
  },
  astTemplate: {
    href: '/assured-shorthold-tenancy-agreement-template',
    title: 'AST Tenancy Agreement Template',
    description: 'Legacy AST template search intent explained for England',
    icon: 'document' as const,
    type: 'page' as const,
  },
  fixedTermPeriodic: {
    href: '/fixed-term-periodic-tenancy-england',
    title: 'Fixed Term vs Periodic Tenancy',
    description: 'Which tenancy type to use (England)',
    icon: 'legal' as const,
    type: 'guide' as const,
  },
  jointTenancy: {
    href: '/joint-tenancy-agreement-england',
    title: 'Joint Tenancy Agreement England',
    description: 'Agreements for multiple tenants',
    icon: 'document' as const,
    type: 'page' as const,
  },
  renewUpdate: {
    href: '/renew-tenancy-agreement-england',
    title: 'Renewing a Tenancy Agreement',
    description: 'How to renew or update an AST',
    icon: 'legal' as const,
    type: 'guide' as const,
  },
};

export const tenancyFunnelPages = {
  englandHub: {
    href: '/tenancy-agreement-template',
    title: 'England Tenancy Agreement Template',
    description: 'Main England template hub with the sample agreement preview and Standard / Premium journey.',
    icon: 'document' as const,
    type: 'page' as const,
  },
  standardTenancyAgreement: {
    href: '/standard-tenancy-agreement',
    title: 'Standard Tenancy Agreement',
    description: 'Baseline England residential route for straightforward whole-property lets.',
    icon: 'document' as const,
    type: 'page' as const,
  },
  premiumTenancyAgreement: {
    href: '/premium-tenancy-agreement',
    title: 'Premium Tenancy Agreement',
    description: 'Ordinary-residential premium route with fuller management and operational detail.',
    icon: 'document' as const,
    type: 'page' as const,
  },
  studentTenancyAgreement: {
    href: '/student-tenancy-agreement',
    title: 'Student Tenancy Agreement',
    description: 'England student-focused route with guarantor and end-of-term detail.',
    icon: 'document' as const,
    type: 'page' as const,
  },
  hmoSharedHouseTenancyAgreement: {
    href: '/hmo-shared-house-tenancy-agreement',
    title: 'HMO / Shared House Tenancy Agreement',
    description: 'England shared-house route with communal-area controls and sharer drafting.',
    icon: 'home' as const,
    type: 'page' as const,
  },
  lodgerAgreement: {
    href: '/lodger-agreement',
    title: 'Room Let / Lodger Agreement',
    description: 'Resident-landlord room-let route kept separate from the assured-tenancy products.',
    icon: 'home' as const,
    type: 'page' as const,
  },
  astAgreementTemplate: {
    href: '/assured-shorthold-tenancy-agreement-template',
    title: 'AST Legacy Guide',
    description: 'Legacy AST search intent routed into the main England template hub.',
    icon: 'document' as const,
    type: 'page' as const,
  },
  tenancyAgreementTemplateUk: {
    href: '/tenancy-agreement-template-uk',
    title: 'Tenancy Agreement Template UK',
    description: 'Thin jurisdiction router for England, Wales, Scotland, and Northern Ireland.',
    icon: 'document' as const,
    type: 'page' as const,
  },
  tenancyAgreementEngland2026: {
    href: '/tenancy-agreement-england-2026',
    title: 'England Tenancy Agreement 2026',
    description: 'Transition guide for landlords after 1 May 2026.',
    icon: 'legal' as const,
    type: 'page' as const,
  },
  assuredPeriodicTenancyAgreement: {
    href: '/assured-periodic-tenancy-agreement',
    title: 'Assured Periodic Tenancy Agreement',
    description: 'Plain-English explainer for the current England route.',
    icon: 'document' as const,
    type: 'page' as const,
  },
  hmoTenancyAgreementTemplate: {
    href: '/hmo-tenancy-agreement-template',
    title: 'HMO Tenancy Agreement Template',
    description: 'Dedicated England HMO / Shared House entry page for sharers and communal-house lets.',
    icon: 'home' as const,
    type: 'page' as const,
  },
  rentersRightsInformationSheet2026: {
    href: '/renters-rights-act-information-sheet-2026',
    title: "Renters' Rights Act Information Sheet 2026",
    description: 'Free PDF download page for the official England tenant information sheet.',
    icon: 'document' as const,
    type: 'page' as const,
  },
};

// Scotland PRT SEO Pages
export const tenancySeoScotlandPages = {
  prtMain: {
    href: '/private-residential-tenancy-agreement-scotland',
    title: 'Private Residential Tenancy Agreement',
    description: 'Create a legally valid PRT for Scotland',
    icon: 'document' as const,
    type: 'page' as const,
  },
  prtTemplate: {
    href: '/prt-tenancy-agreement-template-scotland',
    title: 'PRT Template Scotland',
    description: 'Court-ready PRT template',
    icon: 'document' as const,
    type: 'page' as const,
  },
  jointPrt: {
    href: '/joint-prt-tenancy-agreement-scotland',
    title: 'Joint PRT Agreement Scotland',
    description: 'Multiple tenant PRT agreements',
    icon: 'document' as const,
    type: 'page' as const,
  },
  updatePrt: {
    href: '/update-prt-tenancy-agreement-scotland',
    title: 'Updating a PRT Agreement',
    description: 'How to update PRT terms',
    icon: 'legal' as const,
    type: 'guide' as const,
  },
  prtMistakes: {
    href: '/common-prt-tenancy-mistakes-scotland',
    title: 'Common PRT Mistakes',
    description: 'Avoid costly landlord errors',
    icon: 'legal' as const,
    type: 'guide' as const,
  },
};

// Wales Occupation Contract SEO Pages
export const tenancySeoWalesPages = {
  occupationContractMain: {
    href: '/standard-occupation-contract-wales',
    title: 'Standard Occupation Contract Wales',
    description: 'Create a valid occupation contract',
    icon: 'document' as const,
    type: 'page' as const,
  },
  occupationContractTemplate: {
    href: '/occupation-contract-template-wales',
    title: 'Occupation Contract Template Wales',
    description: 'Renting Homes Act compliant template',
    icon: 'document' as const,
    type: 'page' as const,
  },
  fixedTermPeriodicWales: {
    href: '/fixed-term-periodic-occupation-contract-wales',
    title: 'Fixed Term vs Periodic Wales',
    description: 'Occupation contract types explained',
    icon: 'legal' as const,
    type: 'guide' as const,
  },
  jointOccupationContract: {
    href: '/joint-occupation-contract-wales',
    title: 'Joint Occupation Contract Wales',
    description: 'Contracts for multiple holders',
    icon: 'document' as const,
    type: 'page' as const,
  },
  updateOccupationContract: {
    href: '/update-occupation-contract-wales',
    title: 'Updating an Occupation Contract',
    description: 'How to update contract terms',
    icon: 'legal' as const,
    type: 'guide' as const,
  },
};

// Northern Ireland Tenancy SEO Pages
export const tenancySeoNIPages = {
  niTenancyMain: {
    href: '/tenancy-agreement-northern-ireland',
    title: 'Tenancy Agreement Northern Ireland',
    description: 'Create a legally valid NI tenancy',
    icon: 'document' as const,
    type: 'page' as const,
  },
  niTenancyTemplate: {
    href: '/northern-ireland-tenancy-agreement-template',
    title: 'NI Tenancy Agreement Template',
    description: 'Private Tenancies Act compliant',
    icon: 'document' as const,
    type: 'page' as const,
  },
  niFixedTerm: {
    href: '/fixed-term-tenancy-agreement-northern-ireland',
    title: 'Fixed Term Tenancy NI',
    description: 'Fixed term agreements in NI',
    icon: 'document' as const,
    type: 'page' as const,
  },
  niJointTenancy: {
    href: '/joint-tenancy-agreement-northern-ireland',
    title: 'Joint Tenancy Agreement NI',
    description: 'Multiple tenant agreements NI',
    icon: 'document' as const,
    type: 'page' as const,
  },
  niUpdateTenancy: {
    href: '/update-tenancy-agreement-northern-ireland',
    title: 'Updating a Tenancy Agreement NI',
    description: 'How to renew or update NI tenancy',
    icon: 'legal' as const,
    type: 'guide' as const,
  },
};

// Related link groups for each jurisdiction's tenancy pages

// England AST Related Links
export const astMainRelatedLinks = [
  tenancyFunnelPages.englandHub,
  tenancySeoEnglandPages.astTemplate,
  tenancySeoEnglandPages.fixedTermPeriodic,
  tenancySeoEnglandPages.jointTenancy,
  landingPageLinks.section21Template,
  guideLinks.howToEvictTenant,
  askHeavenLink,
];

export const astTemplateRelatedLinks = [
  tenancyFunnelPages.englandHub,
  tenancySeoEnglandPages.astMain,
  tenancySeoEnglandPages.fixedTermPeriodic,
  tenancySeoEnglandPages.renewUpdate,
  landingPageLinks.section21Template,
  guideLinks.section21Notice,
  askHeavenLink,
];

export const fixedTermPeriodicEnglandRelatedLinks = [
  tenancyFunnelPages.englandHub,
  tenancySeoEnglandPages.astMain,
  tenancySeoEnglandPages.astTemplate,
  tenancySeoEnglandPages.renewUpdate,
  landingPageLinks.section21Template,
  blogLinks.evictionTimeline,
  askHeavenLink,
];

export const jointTenancyEnglandRelatedLinks = [
  tenancyFunnelPages.englandHub,
  tenancySeoEnglandPages.astMain,
  tenancySeoEnglandPages.astTemplate,
  toolLinks.hmoChecker,
  landingPageLinks.section21Template,
  guideLinks.moneyClaimGuide,
  askHeavenLink,
];

export const renewUpdateEnglandRelatedLinks = [
  tenancyFunnelPages.englandHub,
  tenancySeoEnglandPages.astMain,
  tenancySeoEnglandPages.astTemplate,
  tenancySeoEnglandPages.fixedTermPeriodic,
  productLinks.premiumTenancyAgreement,
  residentialDocumentLinks.documentsHub,
  landingPageLinks.section21Template,
  guideLinks.howToEvictTenant,
  askHeavenLink,
];

export const tenancyProductMoneyPageLinks = [
  tenancyFunnelPages.englandHub,
  tenancyFunnelPages.standardTenancyAgreement,
  tenancyFunnelPages.premiumTenancyAgreement,
  tenancyFunnelPages.studentTenancyAgreement,
  tenancyFunnelPages.hmoSharedHouseTenancyAgreement,
  tenancyFunnelPages.lodgerAgreement,
  tenancyFunnelPages.astAgreementTemplate,
  tenancyFunnelPages.assuredPeriodicTenancyAgreement,
];

export const astAgreementTemplateRelatedLinks = [
  tenancyFunnelPages.englandHub,
  tenancyFunnelPages.assuredPeriodicTenancyAgreement,
  productLinks.tenancyAgreement,
  askHeavenLink,
];

export const tenancyAgreementTemplateUkRelatedLinks = [
  tenancyFunnelPages.englandHub,
  tenancyFunnelPages.assuredPeriodicTenancyAgreement,
  productLinks.tenancyAgreement,
  askHeavenLink,
];

export const tenancyAgreementEngland2026RelatedLinks = [
  tenancyFunnelPages.englandHub,
  tenancyFunnelPages.astAgreementTemplate,
  tenancyFunnelPages.assuredPeriodicTenancyAgreement,
  askHeavenLink,
];

export const assuredPeriodicTenancyAgreementRelatedLinks = [
  tenancyFunnelPages.englandHub,
  tenancyFunnelPages.astAgreementTemplate,
  productLinks.tenancyAgreement,
  askHeavenLink,
];

export const hmoTenancyAgreementTemplateRelatedLinks = [
  tenancyFunnelPages.englandHub,
  tenancyFunnelPages.astAgreementTemplate,
  toolLinks.hmoChecker,
  askHeavenLink,
];

export const rentersRightsInformationSheet2026RelatedLinks = [
  tenancyFunnelPages.englandHub,
  tenancyFunnelPages.standardTenancyAgreement,
  tenancyFunnelPages.studentTenancyAgreement,
  tenancyFunnelPages.hmoSharedHouseTenancyAgreement,
  tenancyFunnelPages.lodgerAgreement,
  tenancyFunnelPages.assuredPeriodicTenancyAgreement,
  residentialDocumentLinks.documentsHub,
];

// Scotland PRT Related Links
export const prtMainRelatedLinks = [
  productLinks.tenancyAgreement,
  tenancySeoScotlandPages.prtTemplate,
  tenancySeoScotlandPages.jointPrt,
  tenancySeoScotlandPages.prtMistakes,
  guideLinks.scotlandEviction,
  landingPageLinks.scotlandNoticeToLeaveTemplate,
  askHeavenLink,
];

export const prtTemplateRelatedLinks = [
  productLinks.tenancyAgreement,
  tenancySeoScotlandPages.prtMain,
  tenancySeoScotlandPages.updatePrt,
  tenancySeoScotlandPages.prtMistakes,
  guideLinks.scotlandEviction,
  landingPageLinks.scotlandNoticeToLeaveTemplate,
  askHeavenLink,
];

export const jointPrtRelatedLinks = [
  productLinks.tenancyAgreement,
  tenancySeoScotlandPages.prtMain,
  tenancySeoScotlandPages.prtTemplate,
  tenancySeoScotlandPages.prtMistakes,
  guideLinks.scotlandEviction,
  guideLinks.moneyClaimGuide,
  askHeavenLink,
];

export const updatePrtRelatedLinks = [
  productLinks.tenancyAgreement,
  tenancySeoScotlandPages.prtMain,
  tenancySeoScotlandPages.prtTemplate,
  tenancySeoScotlandPages.prtMistakes,
  guideLinks.scotlandEviction,
  landingPageLinks.scotlandNoticeToLeaveTemplate,
  askHeavenLink,
];

export const prtMistakesRelatedLinks = [
  productLinks.tenancyAgreement,
  tenancySeoScotlandPages.prtMain,
  tenancySeoScotlandPages.prtTemplate,
  tenancySeoScotlandPages.updatePrt,
  guideLinks.scotlandEviction,
  landingPageLinks.scotlandNoticeToLeaveTemplate,
  askHeavenLink,
];

// Wales Occupation Contract Related Links
export const occupationContractMainRelatedLinks = [
  productLinks.tenancyAgreement,
  tenancySeoWalesPages.occupationContractTemplate,
  tenancySeoWalesPages.fixedTermPeriodicWales,
  tenancySeoWalesPages.jointOccupationContract,
  guideLinks.walesEviction,
  landingPageLinks.walesEvictionTemplate,
  askHeavenLink,
];

export const occupationContractTemplateRelatedLinks = [
  productLinks.tenancyAgreement,
  tenancySeoWalesPages.occupationContractMain,
  tenancySeoWalesPages.updateOccupationContract,
  tenancySeoWalesPages.fixedTermPeriodicWales,
  guideLinks.walesEviction,
  landingPageLinks.walesEvictionTemplate,
  askHeavenLink,
];

export const fixedTermPeriodicWalesRelatedLinks = [
  productLinks.tenancyAgreement,
  tenancySeoWalesPages.occupationContractMain,
  tenancySeoWalesPages.occupationContractTemplate,
  tenancySeoWalesPages.updateOccupationContract,
  guideLinks.walesEviction,
  landingPageLinks.walesEvictionTemplate,
  askHeavenLink,
];

export const jointOccupationContractRelatedLinks = [
  productLinks.tenancyAgreement,
  tenancySeoWalesPages.occupationContractMain,
  tenancySeoWalesPages.occupationContractTemplate,
  guideLinks.walesEviction,
  guideLinks.moneyClaimGuide,
  askHeavenLink,
];

export const updateOccupationContractRelatedLinks = [
  productLinks.tenancyAgreement,
  tenancySeoWalesPages.occupationContractMain,
  tenancySeoWalesPages.occupationContractTemplate,
  tenancySeoWalesPages.fixedTermPeriodicWales,
  guideLinks.walesEviction,
  landingPageLinks.walesEvictionTemplate,
  askHeavenLink,
];

// Northern Ireland Tenancy Related Links
export const niTenancyMainRelatedLinks = [
  productLinks.tenancyAgreement,
  tenancySeoNIPages.niTenancyTemplate,
  tenancySeoNIPages.niFixedTerm,
  tenancySeoNIPages.niJointTenancy,
  guideLinks.moneyClaimGuide,
  askHeavenLink,
];

export const niTenancyTemplateRelatedLinks = [
  productLinks.tenancyAgreement,
  tenancySeoNIPages.niTenancyMain,
  tenancySeoNIPages.niUpdateTenancy,
  tenancySeoNIPages.niFixedTerm,
  guideLinks.moneyClaimGuide,
  askHeavenLink,
];

export const niFixedTermRelatedLinks = [
  productLinks.tenancyAgreement,
  tenancySeoNIPages.niTenancyMain,
  tenancySeoNIPages.niTenancyTemplate,
  tenancySeoNIPages.niUpdateTenancy,
  guideLinks.moneyClaimGuide,
  askHeavenLink,
];

export const niJointTenancyRelatedLinks = [
  productLinks.tenancyAgreement,
  tenancySeoNIPages.niTenancyMain,
  tenancySeoNIPages.niTenancyTemplate,
  guideLinks.moneyClaimGuide,
  askHeavenLink,
];

export const niUpdateTenancyRelatedLinks = [
  productLinks.tenancyAgreement,
  tenancySeoNIPages.niTenancyMain,
  tenancySeoNIPages.niTenancyTemplate,
  tenancySeoNIPages.niFixedTerm,
  guideLinks.moneyClaimGuide,
  askHeavenLink,
];
