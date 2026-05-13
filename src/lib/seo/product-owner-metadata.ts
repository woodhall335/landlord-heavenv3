export const PRODUCT_OWNER_METADATA = {
  noticeOnly: {
    path: '/products/notice-only',
    title: 'Buy Section 8 Notice Form 3A | Eviction Pack | £24.99',
    description:
      'Start your solicitor-approved Section 8 eviction pack. Download Form 3A, service record, N215 certificate, and arrears statement. 4.8/5.',
  },
  completePack: {
    path: '/products/complete-pack',
    title: 'Section 8 Court Pack | Form N5 + N119 | £59.99',
    description:
      'File a solicitor-approved possession claim pack. Includes Section 8 notice, N5, N119, witness statement, and hearing guide. 4.8/5.',
  },
  moneyClaim: {
    path: '/products/money-claim',
    title: 'Money Claim Online Pack | Recover Rent Arrears | £49.99',
    description:
      'Recover unpaid rent with a solicitor-approved Money Claim pack. Includes letter before claim, arrears schedule, and Particulars of Claim. 4.8/5.',
  },
  section13Standard: {
    path: '/products/section-13-standard',
    title: 'Section 13 Notice Form 4A | Rent Increase Pack | £29.99',
    description:
      'Serve a solicitor-approved Section 13 rent increase. Includes official Form 4A, market evidence, service record, and guidance. 4.8/5.',
  },
  section13Defence: {
    path: '/products/section-13-defence',
    title: 'Section 13 Tribunal Defence Pack | Rent Challenge | £49.99',
    description:
      'Defend a Section 13 challenge with a solicitor-approved pack. Includes evidence templates, response letters, and bundle checklist. 4.8/5.',
  },
  standardTenancy: {
    path: '/standard-tenancy-agreement',
    title: 'Buy Standard Tenancy Agreement | England AST | £14.99',
    description:
      'Download a solicitor-approved Standard Tenancy Agreement for England. Includes prescribed information and service guidance. 4.8/5.',
  },
  premiumTenancy: {
    path: '/premium-tenancy-agreement',
    title: 'Buy Premium Tenancy Agreement | Stronger Wording | £24.99',
    description:
      'Get a solicitor-approved Premium Tenancy Agreement with fuller wording for access, reporting, repairs, and hand-back. 4.8/5.',
  },
  studentTenancy: {
    path: '/student-tenancy-agreement',
    title: 'Buy Student Tenancy Agreement | Guarantor Forms | £24.99',
    description:
      'Buy a solicitor-approved Student Tenancy Agreement for England. Handles guarantors, sharers, replacements, and move-out. 4.8/5.',
  },
  hmoTenancy: {
    path: '/hmo-shared-house-tenancy-agreement',
    title: 'Buy HMO Tenancy Agreement | Shared House Rules | £34.99',
    description:
      'Download a solicitor-approved HMO / Shared House Tenancy Agreement with house rules, communal areas, and sharer expectations. 4.8/5.',
  },
  lodgerAgreement: {
    path: '/lodger-agreement',
    title: 'Buy Lodger Agreement | Resident Landlord | £14.99',
    description:
      'Get a solicitor-approved Lodger Agreement for resident-landlord room lets. Covers shared-home rules, notice, and occupation. 4.8/5.',
  },
} as const;

export const PRODUCT_OWNER_METADATA_LIST = Object.values(PRODUCT_OWNER_METADATA);
