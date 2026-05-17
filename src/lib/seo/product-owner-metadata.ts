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
      'Create a Standard Periodic Tenancy Agreement for a straightforward England let, with current wording and setup documents in one pack.',
  },
  premiumTenancy: {
    path: '/premium-tenancy-agreement',
    title: 'Buy Premium Tenancy Agreement | Stronger Wording | £24.99',
    description:
      'Create a Premium Periodic Tenancy Agreement with stronger management wording for access, repairs, keys, handover, and day-to-day control.',
  },
  studentTenancy: {
    path: '/student-tenancy-agreement',
    title: 'Buy Student Tenancy Agreement | Guarantor Forms | £24.99',
    description:
      'Create a Student Tenancy Agreement for England with guarantor, sharer, replacement occupier, and end-of-term wording in one pack.',
  },
  hmoTenancy: {
    path: '/hmo-shared-house-tenancy-agreement',
    title: 'Buy HMO Tenancy Agreement | Shared House Rules | £34.99',
    description:
      'Create an HMO or shared-house tenancy agreement with house rules, communal-area wording, and shared occupation records kept together.',
  },
  lodgerAgreement: {
    path: '/lodger-agreement',
    title: 'Buy Lodger Agreement | Resident Landlord | £14.99',
    description:
      'Create a Lodger Agreement for resident landlords with room-let terms, shared-home rules, notice wording, and house records in one pack.',
  },
} as const;

export const PRODUCT_OWNER_METADATA_LIST = Object.values(PRODUCT_OWNER_METADATA);
