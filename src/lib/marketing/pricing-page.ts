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
    bestFor: 'You need to serve a Section 8 notice and want the service record and evidence in order first.',
    points: [
      'Prepares the notice, service steps, and key checks before anything is sent',
      'Built for England after 1 May 2026, with a case summary and risk snapshot',
      'Best when you need the notice stage now and may decide about court later',
    ],
    href: getProductLandingHref('notice_only'),
    cta: 'See notice details',
  },
  {
    name: 'Stage 2: Section 8 Court & Possession Pack',
    productSku: 'complete_pack',
    price: PRODUCTS.complete_pack.displayPrice,
    coverage: 'For landlords in England',
    bestFor: 'You want the Section 8 notice and court possession paperwork prepared together.',
    points: [
      'Keeps the notice, claim forms, service record, and evidence in one file',
      'Includes the Section 8 notice, N5, N119, and filing guidance',
      'Best when you expect the case may need to go from notice into court',
    ],
    href: getProductLandingHref('complete_pack'),
    cta: 'See pack details',
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
    cta: 'See pack details',
  },
  {
    name: 'Standard Section 13 Rent Increase Pack',
    productSku: 'section13_standard',
    price: PRODUCTS.section13_standard.displayPrice,
    coverage: 'For landlords in England',
    bestFor: 'You need to propose a rent increase with Form 4A and clear evidence.',
    points: [
      'Checks timing and market evidence before the notice is served',
      'Includes Form 4A, a short support report, and proof of service',
      'Best when you do not yet expect a formal tenant challenge',
    ],
    href: getProductLandingHref('section13_standard'),
    cta: 'See pack details',
  },
  {
    name: 'Challenge-Ready Section 13 Defence Pack',
    productSku: 'section13_defensive',
    price: PRODUCTS.section13_defensive.displayPrice,
    coverage: 'For landlords in England',
    bestFor: 'You expect pushback and want stronger evidence and response materials ready.',
    points: [
      'Built for rent increases where challenge or tribunal risk is already visible',
      'Adds response support and tribunal-facing preparation materials',
      'Best when the increase needs a fuller evidence file from the start',
    ],
    href: getProductLandingHref('section13_defensive'),
    cta: 'See pack details',
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
    cta: 'See agreement options',
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
    cta: 'See agreement options',
  },
];

export const PRICING_SCHEMA_ITEMS = [
  { sku: 'notice_only', name: 'Stage 1: Section 8 Notice & Service Pack', url: '/products/notice-only' },
  { sku: 'complete_pack', name: 'Stage 2: Section 8 Court & Possession Pack', url: '/products/complete-pack' },
  { sku: 'money_claim', name: 'Money Claim Pack', url: '/products/money-claim' },
  { sku: 'section13_standard', name: 'Standard Section 13 Rent Increase Pack', url: '/products/section-13-standard' },
  { sku: 'section13_defensive', name: 'Challenge-Ready Section 13 Defence Pack', url: '/products/section-13-defence' },
  { sku: 'ast_standard', name: 'England Tenancy Agreements', url: '/products/ast' },
  { sku: 'ast_premium', name: 'England Tenancy Agreements', url: '/products/ast' },
  { sku: 'england_standard_tenancy_agreement', name: 'England Standard Tenancy Agreement', url: '/standard-tenancy-agreement' },
  { sku: 'england_premium_tenancy_agreement', name: 'England Premium Tenancy Agreement', url: '/premium-tenancy-agreement' },
  { sku: 'england_student_tenancy_agreement', name: 'England Student Tenancy Agreement', url: '/student-tenancy-agreement' },
  { sku: 'england_hmo_shared_house_tenancy_agreement', name: 'England HMO / Shared House Tenancy Agreement', url: '/hmo-shared-house-tenancy-agreement' },
  { sku: 'england_lodger_agreement', name: 'England Lodger Agreement', url: '/lodger-agreement' },
] as const;
