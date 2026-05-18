import {
  getProductLandingHref,
  type ProductSku,
  PRODUCTS,
} from '@/lib/pricing/products';

export type PricingPackageCard = {
  name: string;
  productSku: ProductSku;
  price: string;
  coverage: string;
  bestFor: string;
  points: string[];
  href: string;
  cta: string;
  featured?: boolean;
};

export const PRICING_PACKAGE_CARDS: PricingPackageCard[] = [
  {
    name: 'Stage 1: Section 8 Notice & Service Pack',
    productSku: 'notice_only',
    price: PRODUCTS.notice_only.displayPrice,
    coverage: 'For landlords in England',
    bestFor: 'You need a solicitor-approved Section 8 notice and service file before anything goes to the tenant.',
    points: [
      'Prepare the notice file properly before anything goes to the tenant',
      'Includes Form 3A, N215, rent arrears schedule, service instructions, and validity checks',
      'Best when Stage 1 is the job: serve correctly now and decide about court later',
    ],
    href: getProductLandingHref('notice_only'),
    cta: 'Create my Section 8 notice',
  },
  {
    name: 'Stage 2: Section 8 Court & Possession Pack',
    productSku: 'complete_pack',
    price: PRODUCTS.complete_pack.displayPrice,
    coverage: 'For landlords in England',
    bestFor: 'You want a solicitor-approved Section 8 court and possession file prepared together.',
    points: [
      'Prepare the full possession file, not just the court forms',
      'Includes Stage 1 plus N5, N119, witness statement, evidence checklist, court bundle index, and hearing support',
      'Best when Stage 2 is the job: serve, issue, evidence, and prepare for hearing',
    ],
    href: getProductLandingHref('complete_pack'),
    cta: 'Prepare my court pack',
    featured: true,
  },
  {
    name: 'Money Claim Pack',
    productSku: 'money_claim',
    price: PRODUCTS.money_claim.displayPrice,
    coverage: 'For landlords in England',
    bestFor: 'You need to claim unpaid rent, damage, bills, or other tenancy debt.',
    points: [
      'Covers rent arrears, bills, damage, and guarantor-related claims',
      'Keeps the demand letter, claim details, and debt schedules together',
      'Best when the money claim is separate from any possession action',
    ],
    href: getProductLandingHref('money_claim'),
    cta: 'Prepare my money claim',
  },
  {
    name: 'Supported Rent Increase Pack',
    productSku: 'section13_standard',
    price: PRODUCTS.section13_standard.displayPrice,
    coverage: 'For landlords in England',
    bestFor: 'You need to propose a rent increase with Form 4A, current local comparables, and a clear evidence file.',
    points: [
      'Checks timing and current market evidence before the notice is served',
      'Includes Form 4A, rent increase summary, cover letter, and proof of service',
      'Best when the proposed rent appears supportable and challenge risk is not high',
    ],
    href: getProductLandingHref('section13_standard'),
    cta: 'Build my supported rent increase',
  },
  {
    name: 'Tribunal-Ready Rent Increase Pack',
    productSku: 'section13_defensive',
    price: PRODUCTS.section13_defensive.displayPrice,
    coverage: 'For landlords in England',
    bestFor: 'You expect pushback and want current market evidence, response materials, legal briefing, and an indexed bundle ready.',
    points: [
      'Built for rent increases where challenge or tribunal risk is already visible',
      'Adds response support, argument summary, legal briefing, and tribunal-facing preparation materials',
      'Best when the increase needs a fuller evidence file from the start',
    ],
    href: getProductLandingHref('section13_defensive'),
    cta: 'Prepare for a rent challenge',
  },
  {
    name: 'Standard Tenancy Agreement',
    productSku: 'ast_standard',
    price: PRODUCTS.ast_standard.displayPrice,
    coverage: 'For landlords in England',
    bestFor: 'You need a straightforward England residential tenancy agreement.',
    points: [
      'Built for ordinary whole-property lets in England',
      'Updated for the England rules from 1 May 2026',
      'Best when you want the standard setup without fuller management drafting',
    ],
    href: getProductLandingHref('ast_standard'),
    cta: 'Choose agreement',
  },
  {
    name: 'Premium Tenancy Agreement',
    productSku: 'ast_premium',
    price: PRODUCTS.ast_premium.displayPrice,
    coverage: 'For landlords in England',
    bestFor: 'You need fuller wording and more management detail for an England let.',
    points: [
      'For residential lets that need more detail than the Standard pack',
      'Adds broader drafting and extra setup documents',
      'Student, HMO / Shared House, and Lodger agreements have their own pages',
    ],
    href: getProductLandingHref('ast_premium'),
    cta: 'Choose agreement',
  },
];

export const PRICING_SCHEMA_ITEMS = [
  { sku: 'notice_only', name: 'Stage 1: Section 8 Notice & Service Pack', url: '/products/notice-only' },
  { sku: 'complete_pack', name: 'Stage 2: Section 8 Court & Possession Pack', url: '/products/complete-pack' },
  { sku: 'money_claim', name: 'Money Claim Pack', url: '/products/money-claim' },
  { sku: 'section13_standard', name: 'Supported Rent Increase Pack', url: '/products/section-13-standard' },
  { sku: 'section13_defensive', name: 'Tribunal-Ready Rent Increase Pack', url: '/products/section-13-defence' },
  { sku: 'ast_standard', name: 'England Tenancy Agreements', url: '/products/ast' },
  { sku: 'ast_premium', name: 'England Tenancy Agreements', url: '/products/ast' },
  { sku: 'england_standard_tenancy_agreement', name: 'England Standard Tenancy Agreement', url: '/standard-tenancy-agreement' },
  { sku: 'england_premium_tenancy_agreement', name: 'England Premium Tenancy Agreement', url: '/premium-tenancy-agreement' },
  { sku: 'england_student_tenancy_agreement', name: 'England Student Tenancy Agreement', url: '/student-tenancy-agreement' },
  { sku: 'england_hmo_shared_house_tenancy_agreement', name: 'England HMO / Shared House Tenancy Agreement', url: '/hmo-shared-house-tenancy-agreement' },
  { sku: 'england_lodger_agreement', name: 'England Lodger Agreement', url: '/lodger-agreement' },
] as const;
