import { SEO_PRICES } from '@/lib/pricing/products';

export const PRODUCT_OWNER_METADATA = {
  noticeOnly: {
    path: '/products/notice-only',
    title: `Create Section 8 Form 3A Notice | ${SEO_PRICES.evictionNotice.display}`,
    description:
      'Create a Section 8 Form 3A notice with service steps, N215 support, and checks before you pay. Built for England landlords serving notice.',
  },
  completePack: {
    path: '/products/complete-pack',
    title: `Prepare Section 8 Court Papers | Form N5 + N119 | ${SEO_PRICES.evictionBundle.display}`,
    description:
      'Prepare Section 8 court papers with Form 3A, N5, N119, witness statement, arrears record, and filing support in one place before court.',
  },
  moneyClaim: {
    path: '/products/money-claim',
    title: `Prepare a Landlord Money Claim | ${SEO_PRICES.moneyClaim.display}`,
    description:
      'Prepare a landlord money claim for unpaid rent, damage, bills, or tenancy debt, with a demand letter and claim papers you can check.',
  },
  section13Standard: {
    path: '/products/section-13-standard',
    title: `Create Section 13 Form 4A Rent Increase Notice | ${SEO_PRICES.section13Standard.display}`,
    description:
      'Create a Section 13 Form 4A rent increase notice with market evidence, service record, and a tenant-facing explanation before you serve.',
  },
  section13Defence: {
    path: '/products/section-13-defence',
    title: `Prepare for a Section 13 Rent Challenge | ${SEO_PRICES.section13Defensive.display}`,
    description:
      'Prepare for a challenged rent increase with Form 4A, market evidence, response wording, and tribunal bundle support kept together.',
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
