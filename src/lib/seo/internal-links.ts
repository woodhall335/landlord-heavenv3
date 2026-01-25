/**
 * Centralized internal link definitions for consistent linking across the site
 *
 * Use these with the RelatedLinks component for SEO-optimized internal linking
 */

export const productLinks = {
  noticeOnly: {
    href: '/products/notice-only',
    title: 'Notice Only Pack',
    description: 'Court-ready eviction notice — £39.99',
    icon: 'document' as const,
    type: 'product' as const,
  },
  completePack: {
    href: '/products/complete-pack',
    title: 'Complete Eviction Pack',
    description: 'Full eviction package with court forms — £149.99',
    icon: 'legal' as const,
    type: 'product' as const,
  },
  moneyClaim: {
    href: '/products/money-claim',
    title: 'Money Claim Pack',
    description: 'Recover rent, damage, and other tenant debts — £99.99',
    icon: 'document' as const,
    type: 'product' as const,
  },
  tenancyAgreement: {
    href: '/products/ast',
    title: 'Tenancy Agreement',
    description: 'AST templates for all UK regions — from £9.99',
    icon: 'document' as const,
    type: 'product' as const,
  },
};

export const toolLinks = {
  section21Generator: {
    href: '/tools/free-section-21-notice-generator',
    title: 'Free Section 21 Generator',
    description: 'Preview Section 21 notice format',
    icon: 'document' as const,
    type: 'tool' as const,
  },
  section8Generator: {
    href: '/tools/free-section-8-notice-generator',
    title: 'Free Section 8 Generator',
    description: 'Preview Section 8 notice format',
    icon: 'document' as const,
    type: 'tool' as const,
  },
  section21Validator: {
    href: '/tools/validators/section-21',
    title: 'Section 21 Validity Checker',
    description: 'Check if your Section 21 notice is valid (England)',
    icon: 'legal' as const,
    type: 'tool' as const,
  },
  section8Validator: {
    href: '/tools/validators/section-8',
    title: 'Section 8 Grounds Checker',
    description: 'Check your Section 8 notice grounds (England)',
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
    title: 'Eviction Notice Template UK',
    description: 'All eviction notice types',
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
    title: 'Tenancy Agreement Template',
    description: 'AST template download',
    icon: 'document' as const,
    type: 'page' as const,
  },
  walesEvictionTemplate: {
    href: '/wales-eviction-notice-template',
    title: 'Wales Eviction Notice Template',
    description: 'Renting Homes Act notices',
    icon: 'document' as const,
    type: 'page' as const,
  },
  scotlandNoticeToLeaveTemplate: {
    href: '/scotland-notice-to-leave-template',
    title: 'Scotland Notice to Leave Template',
    description: 'PRT eviction notices',
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
    href: '/money-claim-unpaid-rent',
    title: 'Claim Unpaid Rent Guide',
    description: 'MCOL & Simple Procedure',
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
  // Core hub pages (4 existing)
  unpaidRent: {
    href: '/money-claim-unpaid-rent',
    title: 'Claim Unpaid Rent Guide',
    description: 'MCOL process for rent arrears',
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
  guideLinks.howToEvictTenant,
  productLinks.noticeOnly,
  productLinks.completePack,
  toolLinks.section21Validator,
  toolLinks.section8Validator,
  guideLinks.walesEviction,
  guideLinks.scotlandEviction,
];

export const section21RelatedLinks = [
  guideLinks.howToEvictTenant,
  productLinks.noticeOnly,
  toolLinks.section21Validator,
  toolLinks.section21Generator,
  blogLinks.whatIsSection21,
  guideLinks.walesEviction,
  guideLinks.scotlandEviction,
];

export const section8RelatedLinks = [
  guideLinks.howToEvictTenant,
  productLinks.noticeOnly,
  productLinks.completePack,
  toolLinks.section8Validator,
  toolLinks.section8Generator,
  blogLinks.rentArrearsEviction,
  guideLinks.walesEviction,
];

export const rentArrearsRelatedLinks = [
  guideLinks.moneyClaimGuide,
  productLinks.moneyClaim,
  toolLinks.rentDemandLetter,
  toolLinks.rentArrearsCalculator,
  landingPageLinks.rentArrearsTemplate,
];

export const tenancyRelatedLinks = [
  productLinks.tenancyAgreement,
  landingPageLinks.tenancyTemplate,
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
  productLinks.completePack,
];

export const scotlandRelatedLinks = [
  askHeavenLink,
  guideLinks.scotlandEviction,
  landingPageLinks.scotlandNoticeToLeaveTemplate,
  guideLinks.howToEvictTenant,
  productLinks.noticeOnly,
  productLinks.completePack,
];

export const moneyClaimRelatedLinks = [
  guideLinks.moneyClaimGuide,
  productLinks.moneyClaim,
  toolLinks.rentArrearsCalculator,
  toolLinks.rentDemandLetter,
  landingPageLinks.rentArrearsTemplate,
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
  productLinks.noticeOnly,
  productLinks.completePack,
  landingPageLinks.section21Template,
  landingPageLinks.section8Template,
  toolLinks.section21Generator,
  toolLinks.section8Generator,
  guideLinks.possessionClaimGuide,
];

export const tenantNotPayingRentRelatedLinks = [
  productLinks.noticeOnly,
  productLinks.completePack,
  productLinks.moneyClaim,
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
  productLinks.noticeOnly,
  productLinks.completePack,
  productLinks.moneyClaim,
  guideLinks.howToEvictTenant,
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
  productLinks.moneyClaim,
  moneyClaimGuides.unpaidRent,
  moneyClaimGuides.propertyDamage,
  moneyClaimGuides.cleaningCosts,
  moneyClaimGuides.unpaidUtilities,
  moneyClaimGuides.mcolProcess,
  toolLinks.rentArrearsCalculator,
  toolLinks.rentDemandLetter,
];

// Property damage focused links
export const moneyClaimDamageLinks = [
  productLinks.moneyClaim,
  moneyClaimGuides.propertyDamage,
  moneyClaimGuides.carpetDamage,
  moneyClaimGuides.wallDamage,
  moneyClaimGuides.bathroomDamage,
  moneyClaimGuides.applianceDamage,
  moneyClaimGuides.gardenDamage,
  moneyClaimGuides.depositShortfall,
  moneyClaimBlogs.fairWearAndTear,
];

// Cleaning focused links
export const moneyClaimCleaningLinks = [
  productLinks.moneyClaim,
  moneyClaimGuides.cleaningCosts,
  moneyClaimGuides.abandonedGoods,
  moneyClaimGuides.gardenDamage,
  moneyClaimGuides.depositShortfall,
  moneyClaimBlogs.fairWearAndTear,
  // moneyClaimBlogs.evidenceGuide, // Blog post not yet published
];

// Utilities and bills focused links
export const moneyClaimUtilitiesLinks = [
  productLinks.moneyClaim,
  moneyClaimGuides.unpaidUtilities,
  moneyClaimGuides.unpaidBills,
  moneyClaimGuides.councilTax,
  moneyClaimGuides.formerTenant,
  // moneyClaimBlogs.evidenceGuide, // Blog post not yet published
];

// Rent arrears focused links
export const moneyClaimRentLinks = [
  productLinks.moneyClaim,
  moneyClaimGuides.unpaidRent,
  moneyClaimGuides.formerTenant,
  moneyClaimGuides.guarantorClaims,
  moneyClaimGuides.breakClause,
  toolLinks.rentArrearsCalculator,
  toolLinks.rentDemandLetter,
  moneyClaimBlogs.interestCalculation,
];

// Court process focused links
export const moneyClaimProcessLinks = [
  productLinks.moneyClaim,
  moneyClaimGuides.mcolProcess,
  moneyClaimGuides.smallClaimsCourt,
  moneyClaimGuides.defendedClaims,
  moneyClaimGuides.ccjEnforcement,
  moneyClaimForms.n1Form,
  moneyClaimForms.letterBeforeAction,
  moneyClaimBlogs.courtHearingPrep,
];

// Enforcement focused links
export const moneyClaimEnforcementLinks = [
  productLinks.moneyClaim,
  moneyClaimGuides.ccjEnforcement,
  moneyClaimGuides.formerTenant,
  // moneyClaimBlogs.enforcingJudgment, // Blog post not yet published
  moneyClaimBlogs.ccjConsequences,
  // moneyClaimBlogs.tenantTracingGuide, // Blog post not yet published
];

// Form page focused links
export const moneyClaimFormLinks = [
  productLinks.moneyClaim,
  moneyClaimForms.n1Form,
  moneyClaimForms.letterBeforeAction,
  moneyClaimForms.scheduleOfDebt,
  moneyClaimForms.financialStatement,
  moneyClaimGuides.mcolProcess,
  moneyClaimBlogs.letterBeforeActionGuide,
];

// Blog post sidebar links
export const moneyClaimBlogSidebarLinks = [
  productLinks.moneyClaim,
  moneyClaimGuides.unpaidRent,
  moneyClaimGuides.propertyDamage,
  moneyClaimGuides.cleaningCosts,
  moneyClaimGuides.mcolProcess,
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
    href: '/ast-template-england',
    title: 'England AST Template',
    description: 'Housing Act 1988 compliant',
    icon: 'document' as const,
    type: 'page' as const,
  },
  tenancyAgreementFree: {
    href: '/tenancy-agreement-template-free',
    title: 'Free vs Paid Templates',
    description: 'Template comparison guide',
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
  productLinks.tenancyAgreement,
  tenancyAgreementPageLinks.astTemplate,
  tenancyAgreementPageLinks.astTemplateEngland,
  tenancyAgreementPageLinks.jointTenancy,
  tenancyAgreementPageLinks.tenancyAgreementFree,
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
