/**
 * Centralized internal link definitions for consistent linking across the site
 *
 * Use these with the RelatedLinks component for SEO-optimized internal linking
 */

export const productLinks = {
  noticeOnly: {
    href: '/products/notice-only',
    title: 'Notice Only Pack',
    description: 'Court-ready eviction notice — £29.99',
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
    description: 'Recover unpaid rent through court — £179.99',
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
};

// Pre-built link groups for common use cases
export const evictionRelatedLinks = [
  guideLinks.howToEvictTenant,
  productLinks.noticeOnly,
  productLinks.completePack,
  guideLinks.walesEviction,
  guideLinks.scotlandEviction,
];

export const section21RelatedLinks = [
  guideLinks.howToEvictTenant,
  productLinks.noticeOnly,
  toolLinks.section21Generator,
  blogLinks.whatIsSection21,
  guideLinks.walesEviction,
  guideLinks.scotlandEviction,
];

export const section8RelatedLinks = [
  guideLinks.howToEvictTenant,
  productLinks.noticeOnly,
  productLinks.completePack,
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

// Jurisdiction-specific link groups
export const walesRelatedLinks = [
  guideLinks.walesEviction,
  guideLinks.howToEvictTenant,
  productLinks.noticeOnly,
  productLinks.completePack,
];

export const scotlandRelatedLinks = [
  guideLinks.scotlandEviction,
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
