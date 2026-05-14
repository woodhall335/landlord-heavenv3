import { SEO_PRICES } from '@/lib/pricing/products';

export const PRODUCT_OWNER_METADATA = {
  noticeOnly: {
    path: '/products/notice-only',
    title: `Buy Section 8 Notice Form 3A | Eviction Pack | ${SEO_PRICES.evictionNotice.display}`,
    description:
      'Generate a solicitor-approved Section 8 notice builder for Form 3A. Validated service record and N215 included. 4.8/5. Start correctly today.',
  },
  completePack: {
    path: '/products/complete-pack',
    title: `Complete Eviction Pack | Form N5 + N119 | ${SEO_PRICES.evictionBundle.display}`,
    description:
      'Download a court-ready Section 8 possession pack with N5, N119, witness statement. Solicitor-approved, validated before filing. 4.8/5. Instant download.',
  },
  moneyClaim: {
    path: '/products/money-claim',
    title: `Money Claim Online Pack | Recover Rent Arrears | ${SEO_PRICES.moneyClaim.display}`,
    description:
      'Recover rent arrears with our solicitor-approved Money Claim pack. Includes letter before claim and particulars of claim. 4.8/5. Download now.',
  },
  section13Standard: {
    path: '/products/section-13-standard',
    title: `Section 13 Notice Form 4A | Rent Increase Pack | ${SEO_PRICES.section13Standard.display}`,
    description:
      'Use our Form 4A generator for a Section 13 rent increase. Solicitor-approved, validated notice with market evidence. 4.8/5. Instant PDF download.',
  },
  section13Defence: {
    path: '/products/section-13-defence',
    title: `Section 13 Tribunal Defence Pack | Rent Challenge | ${SEO_PRICES.section13Defensive.display}`,
    description:
      'Defend a challenged rent increase with our tribunal-ready Section 13 Defence pack. Solicitor-approved evidence templates and checklist. 4.8/5.',
  },
  standardTenancy: {
    path: '/standard-tenancy-agreement',
    title: 'Buy Standard Tenancy Agreement | England AST | £14.99',
    description:
      'Create a solicitor-approved Standard Periodic Tenancy Agreement. AST generator for post-May 2026 rules. Validated wording. 4.8/5. Download now.',
  },
  premiumTenancy: {
    path: '/premium-tenancy-agreement',
    title: 'Buy Premium Tenancy Agreement | Stronger Wording | £24.99',
    description:
      'Generate a solicitor-approved Premium Periodic Tenancy Agreement with stronger management wording. Post-May 2026 compliant. 4.8/5. Download.',
  },
  studentTenancy: {
    path: '/student-tenancy-agreement',
    title: 'Buy Student Tenancy Agreement | Guarantor Forms | £24.99',
    description:
      "Solicitor-approved Student Tenancy Agreement builder. Handles guarantors, sharers, and move-out. Renters' Rights Act compliant. 4.8/5. Download.",
  },
  hmoTenancy: {
    path: '/hmo-shared-house-tenancy-agreement',
    title: 'Buy HMO Tenancy Agreement | Shared House Rules | £34.99',
    description:
      'Solicitor-approved HMO Tenancy Agreement template with validated house rules for shared houses. Post-May 2026 compliant. 4.8/5. Instant download.',
  },
  lodgerAgreement: {
    path: '/lodger-agreement',
    title: 'Buy Lodger Agreement | Resident Landlord | £14.99',
    description:
      'Solicitor-approved Lodger Agreement for resident landlords. Room let contract with validated notice rules and house rules. 4.8/5. Instant PDF.',
  },
} as const;

export const PRODUCT_OWNER_METADATA_LIST = Object.values(PRODUCT_OWNER_METADATA);
