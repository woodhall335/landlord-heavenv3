import { SEO_PRICES } from '@/lib/pricing/products';

export const PRODUCT_OWNER_METADATA = {
  noticeOnly: {
    path: '/products/notice-only',
    title: `Landlord Section 8 Notice & Service File | ${SEO_PRICES.evictionNotice.display}`,
    description:
      'Prepare a solicitor-approved landlord Section 8 notice and service file with Form 3A, N215, arrears schedule, service instructions, and checks.',
  },
  completePack: {
    path: '/products/complete-pack',
    title: `Evict a Tenant Through Court | ${SEO_PRICES.evictionBundle.display}`,
    description:
      'Prepare a solicitor-approved eviction pack with court forms, Form 3A, N5, N119, witness statement, evidence, and hearing support.',
  },
  moneyClaim: {
    path: '/products/money-claim',
    title: `Landlord Money Claim Pack | ${SEO_PRICES.moneyClaim.display}`,
    description:
      'Prepare a landlord money claim for unpaid rent, property damage, bills, or tenancy debt, with a demand letter and claim papers you can check.',
  },
  section13Standard: {
    path: '/products/section-13-standard',
    title: `Supported Rent Increase Pack | Section 13 Form 4A | ${SEO_PRICES.section13Standard.display}`,
    description:
      'Prepare a market-supported Section 13 Form 4A rent increase file with current local comparables, summary, cover letter, and service record before you serve.',
  },
  section13Defence: {
    path: '/products/section-13-defence',
    title: `Tribunal-Ready Rent Increase Pack | Section 13 | ${SEO_PRICES.section13Defensive.display}`,
    description:
      'Prepare for a challenged Section 13 rent increase with Form 4A, current market comparables, response wording, legal briefing, and indexed tribunal bundle support.',
  },
  standardTenancy: {
    path: '/standard-tenancy-agreement',
    title: 'Buy Standard Tenancy Agreement | England AST | £14.99',
    description:
      'Create a Standard Periodic Tenancy Agreement for a straightforward England let, with current wording and setup documents in one pack.',
  },
  premiumTenancy: {
    path: '/premium-tenancy-agreement',
    title: 'Premium Tenancy Agreement | Stronger Wording | £24.99',
    description:
      'Create a Premium Periodic Tenancy Agreement with stronger management wording for access, repairs, keys, handover, and day-to-day control.',
  },
  studentTenancy: {
    path: '/student-tenancy-agreement',
    title: 'Student Tenancy Agreement | Guarantor Forms | £24.99',
    description:
      'Create a Student Tenancy Agreement for England with guarantor, sharer, replacement occupier, and end-of-term wording in one pack.',
  },
  hmoTenancy: {
    path: '/hmo-shared-house-tenancy-agreement',
    title: 'HMO Tenancy Agreement | Shared House Rules | £34.99',
    description:
      'Create an HMO or shared-house tenancy agreement with house rules, communal-area wording, and shared occupation records kept together.',
  },
  lodgerAgreement: {
    path: '/lodger-agreement',
    title: 'Lodger Agreement | Resident Landlord | £14.99',
    description:
      'Create a Lodger Agreement for resident landlords with room-let terms, shared-home rules, notice wording, and house records in one pack.',
  },
} as const;

export const PRODUCT_OWNER_METADATA_LIST = Object.values(PRODUCT_OWNER_METADATA);
