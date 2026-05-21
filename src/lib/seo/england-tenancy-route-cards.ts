import { PRODUCTS } from '@/lib/pricing/products';

export const englandTenancyRouteComparisonCards = [
  {
    title: 'Standard Periodic Tenancy Agreement',
    description: 'The validated England setup pack for a straightforward whole-property let, with the agreement, setup records, key clauses, and practical landlord wording built from the landlord facts.',
    href: '/standard-tenancy-agreement',
    ctaLabel: 'Build my validated Standard pack',
    imageSrc: '/images/wizard-standard-tenancy-agreement.webp',
    imageAlt: 'Standard tenancy agreement preview',
    price: PRODUCTS.england_standard_tenancy_agreement.displayPrice,
    details: [
      {
        label: 'Best when',
        body: 'The current England agreement workflow for a straightforward whole-property let, with setup records, key clauses, and practical landlord wording.',
      },
      {
        label: 'What it helps with',
        body:
          'Gives landlords a clean validated starting point when the let is ordinary and does not need student, shared-house, or resident-landlord wording.',
      },
      {
        label: 'Common problem if you choose wrong',
        body:
          'If you use an older wording-only form, the core terms may be too light and the setup records can be missing.',
      },
      {
        label: 'How it helps you',
        body:
          'Gets the tenancy in place with a clear England agreement and practical setup paperwork.',
      },
    ],
  },
  {
    title: 'Premium Periodic Tenancy Agreement',
    description:
      'The fuller current England option for ordinary residential lets that need stronger management wording.',
    href: '/premium-tenancy-agreement',
    ctaLabel: 'Build my validated Premium pack',
    imageSrc: '/images/wizard-premium-tenancy-agreement.webp',
    imageAlt: 'Premium tenancy agreement preview',
    price: PRODUCTS.england_premium_tenancy_agreement.displayPrice,
    details: [
      {
        label: 'Best when',
        body:
          'The fuller current England option for ordinary residential lets that need stronger management wording.',
      },
      {
        label: 'What it helps with',
        body:
          'Helps when the landlord wants more detail around access, reporting, inspections, keys, repairs, and hand-back.',
      },
      {
        label: 'Common problem if you choose wrong',
        body:
          'If a more involved let uses a lighter template, avoidable management arguments can start because expectations were not clear enough.',
      },
      {
        label: 'How it helps you',
        body:
          'Gives the landlord a stronger written framework for day-to-day tenancy management.',
      },
    ],
  },
  {
    title: 'Student Tenancy Agreement',
    description: 'The dedicated agreement for student households in England.',
    href: '/student-tenancy-agreement',
    ctaLabel: 'Build my validated Student pack',
    imageSrc: '/images/wizard-student-tenancy-agreement.webp',
    imageAlt: 'Student tenancy agreement preview',
    price: PRODUCTS.england_student_tenancy_agreement.displayPrice,
    details: [
      {
        label: 'Best when',
        body: 'The dedicated agreement for student households in England.',
      },
      {
        label: 'What it helps with',
        body:
          'Deals with guarantors, sharers, replacement requests, and end-of-term move-out more directly than a generic agreement.',
      },
      {
        label: 'Common problem if you choose wrong',
        body:
          'If a student household uses a static wording-only form, key pressure points can be under-explained until something goes wrong.',
      },
      {
        label: 'How it helps you',
        body:
          'Gives the landlord an agreement that matches how the student property is occupied and managed.',
      },
    ],
  },
  {
    title: 'HMO / Shared House Tenancy Agreement',
    description: 'The shared-house agreement for occupiers living together and using communal areas.',
    href: '/hmo-shared-house-tenancy-agreement',
    ctaLabel: 'Build my validated HMO pack',
    imageSrc: '/images/wizard-hmo-agreement.webp',
    imageAlt: 'HMO shared house tenancy agreement preview',
    price: PRODUCTS.england_hmo_shared_house_tenancy_agreement.displayPrice,
    details: [
      {
        label: 'Best when',
        body:
          'The shared-house agreement for occupiers living together and using communal areas.',
      },
      {
        label: 'What it helps with',
        body:
          'Deals with house rules, communal spaces, sharer expectations, and shared living arrangements.',
      },
      {
        label: 'Common problem if you choose wrong',
        body:
          'If a shared house is treated like a straightforward whole-property template, the paperwork can miss important shared-living rules.',
      },
      {
        label: 'How it helps you',
        body: 'Helps the landlord run a shared property with paperwork that fits the setup.',
      },
    ],
  },
  {
    title: 'Lodger Agreement',
    description: 'The room-let agreement for a landlord who lives in the property.',
    href: '/lodger-agreement',
    ctaLabel: 'Build my validated Lodger pack',
    imageSrc: '/images/wizard-lodger-agreement.webp',
    imageAlt: 'Lodger agreement preview',
    price: PRODUCTS.england_lodger_agreement.displayPrice,
    details: [
      {
        label: 'Best when',
        body: 'The room-let agreement for a landlord who lives in the property.',
      },
      {
        label: 'What it helps with',
        body:
          'Keeps the resident-landlord arrangement separate from a standard tenancy, with shared-home rules and notice expectations set out.',
      },
      {
        label: 'Common problem if you choose wrong',
        body:
          "If a lodger setup is treated like a normal tenancy template, the paperwork may not match shared occupation inside the landlord's home.",
      },
      {
        label: 'How it helps you',
        body:
          'Gives the landlord a clearer room-let agreement for a shared-home arrangement.',
      },
    ],
  },
];
