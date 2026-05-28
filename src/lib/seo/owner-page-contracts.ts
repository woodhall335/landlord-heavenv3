export interface OwnerPageContract {
  pathname: string;
  primaryTheme: string;
  secondaryThemes: string[];
  userProblem: string;
  productPromise: string;
  primaryCtaLabel: string;
  mustMention: string[];
  forbiddenHeroPhrases?: string[];
}

export const OWNER_PAGE_CONTRACTS: OwnerPageContract[] = [
  {
    pathname: '/products/ast',
    primaryTheme: 'England tenancy agreement',
    secondaryThemes: [
      'standard tenancy agreement',
      'premium tenancy agreement',
      'assured periodic tenancy agreement',
      'periodic tenancy agreement',
      "Renters' Rights Act compliant tenancy agreement",
      'student tenancy agreement',
      'HMO tenancy agreement',
      'lodger agreement',
    ],
    userProblem: 'A landlord needs to choose the right England tenancy agreement for the let.',
    productPromise:
      "Compare and choose the right Renters' Rights Act compliant England tenancy agreement route.",
    primaryCtaLabel: 'Choose my tenancy agreement',
    mustMention: [
      'England',
      'tenancy agreement',
      'Standard',
      'Premium',
      "Renters' Rights Act",
      'assured periodic tenancy agreement',
      'periodic tenancy agreement',
    ],
    forbiddenHeroPhrases: ['route-selection page', 'cluster', 'hub'],
  },
  {
    pathname: '/products/notice-only',
    primaryTheme: 'Evict a tenant legally',
    secondaryThemes: ['eviction notice', 'Section 8 notice', 'notice pack for landlords'],
    userProblem: 'A landlord needs to serve the right notice before court.',
    productPromise: 'Create the right eviction notice pack for the route being served.',
    primaryCtaLabel: 'Create my Section 8 notice',
    mustMention: ['evict a tenant legally', 'eviction notice', 'landlord'],
    forbiddenHeroPhrases: ['cluster', 'hub'],
  },
  {
    pathname: '/products/complete-pack',
    primaryTheme: 'Evict a tenant through court',
    secondaryThemes: ['complete eviction pack', 'possession claim pack', 'court forms for eviction'],
    userProblem: 'A landlord needs the court-stage possession paperwork and guidance.',
    productPromise: 'Prepare the complete England eviction pack from notice to court.',
    primaryCtaLabel: 'Prepare my court pack',
    mustMention: ['evict a tenant through court', 'eviction pack', 'court forms'],
    forbiddenHeroPhrases: ['bundle', 'cluster', 'hub'],
  },
  {
    pathname: '/products/money-claim',
    primaryTheme: 'Landlord money claim pack',
    secondaryThemes: ['recover unpaid rent', 'tenant debt', 'property damage claim'],
    userProblem: 'A landlord needs to recover unpaid rent, damage, or other tenant debt.',
    productPromise: 'Prepare the money claim pack for unpaid rent, damage, bills, and related debt.',
    primaryCtaLabel: 'Prepare my money claim',
    mustMention: ['money claim', 'unpaid rent', 'property damage'],
    forbiddenHeroPhrases: ['evict a tenant legally', 'cluster', 'hub'],
  },
  {
    pathname: '/rent-increase',
    primaryTheme: 'Increase rent in England',
    secondaryThemes: [
      'Section 13 notice',
      'Form 4A',
      'rent increase rules',
      'market rent',
      'tenant challenge',
    ],
    userProblem: 'A landlord needs to increase rent lawfully in England.',
    productPromise: 'Create the Section 13 / Form 4A rent increase pack with the right checks.',
    primaryCtaLabel: 'Create my rent increase notice',
    mustMention: [
      'increase rent',
      'England',
      'Section 13',
      'Form 4A',
      'market rent',
      'tenant challenge',
    ],
    forbiddenHeroPhrases: ['cluster', 'hub / cluster overview', 'rules-overview'],
  },
  {
    pathname: '/standard-tenancy-agreement',
    primaryTheme: 'Standard tenancy agreement England',
    secondaryThemes: ['basic tenancy agreement', 'whole-property let'],
    userProblem: 'A landlord needs the standard England tenancy agreement route.',
    productPromise:
      'Build the validated Standard tenancy setup pack for a straightforward England let.',
    primaryCtaLabel: 'Build my validated Standard pack',
    mustMention: ['standard tenancy agreement', 'England'],
  },
  {
    pathname: '/premium-tenancy-agreement',
    primaryTheme: 'Premium tenancy agreement England',
    secondaryThemes: ['detailed tenancy agreement', 'fuller residential drafting'],
    userProblem: 'A landlord needs broader drafting for an England residential let.',
    productPromise:
      'Build the validated Premium tenancy setup pack with fuller management wording.',
    primaryCtaLabel: 'Build my validated Premium pack',
    mustMention: ['premium tenancy agreement', 'England'],
  },
  {
    pathname: '/student-tenancy-agreement',
    primaryTheme: 'Student tenancy agreement England',
    secondaryThemes: ['student tenancy agreement with guarantor', 'student house agreement'],
    userProblem: 'A landlord needs a student-focused agreement with guarantor and sharer wording.',
    productPromise: 'Build the validated England Student tenancy setup pack.',
    primaryCtaLabel: 'Build my validated Student pack',
    mustMention: ['student tenancy agreement', 'England'],
  },
  {
    pathname: '/hmo-shared-house-tenancy-agreement',
    primaryTheme: 'HMO tenancy agreement England',
    secondaryThemes: ['shared house tenancy agreement', 'room by room tenancy agreement'],
    userProblem: 'A landlord needs shared-house or HMO wording for an England let.',
    productPromise: 'Build the validated HMO / Shared House tenancy setup pack.',
    primaryCtaLabel: 'Build my validated HMO / Shared House pack',
    mustMention: ['HMO tenancy agreement', 'shared house tenancy agreement'],
  },
  {
    pathname: '/lodger-agreement',
    primaryTheme: 'Lodger agreement England',
    secondaryThemes: ['room let agreement', 'resident landlord agreement'],
    userProblem: 'A resident landlord needs the right lodger agreement.',
    productPromise: 'Build the validated England Lodger setup pack.',
    primaryCtaLabel: 'Build my validated Lodger pack',
    mustMention: ['lodger agreement', 'room let agreement'],
  },
] as const;

export const SEO_SWEEP_REDIRECTS = [
  { source: '/lodger-agreement-template', destination: '/lodger-agreement' },
  {
    source: '/hmo-tenancy-agreement-template',
    destination: '/hmo-shared-house-tenancy-agreement',
  },
  { source: '/rent-increase/rent-increase-rules-uk', destination: '/rent-increase' },
] as const;
