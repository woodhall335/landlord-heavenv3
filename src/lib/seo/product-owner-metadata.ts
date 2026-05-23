import { SEO_PRICES } from '@/lib/pricing/products';

export const PRODUCT_OWNER_METADATA = {
  noticeOnly: {
    path: '/products/notice-only',
    title: `Section 8 Eviction Notice & Service File | ${SEO_PRICES.evictionNotice.display}`,
    description:
      'Create an England Section 8 eviction notice file with Form 3A, N215, arrears schedule, service instructions, and pre-service checks.',
  },
  completePack: {
    path: '/products/complete-pack',
    title: `Section 8 Possession Claim Pack | N5 & N119 | ${SEO_PRICES.evictionBundle.display}`,
    description:
      'Prepare an England Section 8 possession claim pack with Form 3A, N5, N119, witness statement, evidence, and hearing support included.',
  },
  moneyClaim: {
    path: '/products/money-claim',
    title: `Rent Arrears Money Claim Pack | MCOL & N1 | ${SEO_PRICES.moneyClaim.display}`,
    description:
      'Recover unpaid rent or tenant debt with a landlord money claim pack: letter before claim, particulars, debt schedule, MCOL/N1 guidance.',
  },
  section13Standard: {
    path: '/products/section-13-standard',
    title: `Form 4A Rent Increase Pack | Market Evidence | ${SEO_PRICES.section13Standard.display}`,
    description:
      'Create an England Section 13 Form 4A rent increase pack with market evidence, service record, cover letter, and supportable-rent summary.',
  },
  section13Defence: {
    path: '/products/section-13-defence',
    title: `Section 13 Rent Challenge Pack | Tribunal-Ready | ${SEO_PRICES.section13Defensive.display}`,
    description:
      'Prepare for a Section 13 rent challenge with Form 4A, market evidence, response wording, legal briefing, and tribunal bundle support.',
  },
  standardTenancy: {
    path: '/standard-tenancy-agreement',
    title: 'England Tenancy Agreement Pack | Standard Periodic | £14.99',
    description:
      'Create an England standard periodic tenancy agreement pack with current wording, setup records, validation checks, and preview before payment.',
  },
  premiumTenancy: {
    path: '/premium-tenancy-agreement',
    title: 'Premium Tenancy Agreement Pack | Stronger Wording | £24.99',
    description:
      'Create a premium England periodic tenancy agreement pack with stronger wording for access, repairs, keys, handover, and management control.',
  },
  studentTenancy: {
    path: '/student-tenancy-agreement',
    title: 'Student Tenancy Agreement Pack | Guarantor Forms | £24.99',
    description:
      'Create an England student tenancy agreement pack with guarantor wording, sharer rules, replacement controls, and end-of-term handover records.',
  },
  hmoTenancy: {
    path: '/hmo-shared-house-tenancy-agreement',
    title: 'HMO Tenancy Agreement Pack | Shared House Rules | £34.99',
    description:
      'Create an England HMO or shared-house tenancy agreement pack with house rules, communal-area wording, and shared occupation records.',
  },
  lodgerAgreement: {
    path: '/lodger-agreement',
    title: 'Lodger Agreement Pack | Resident Landlord | £14.99',
    description:
      'Create a lodger agreement for resident landlords with room-let terms, shared-home rules, notice wording, and move-in records.',
  },
} as const;

export const PRODUCT_OWNER_METADATA_LIST = Object.values(PRODUCT_OWNER_METADATA);
