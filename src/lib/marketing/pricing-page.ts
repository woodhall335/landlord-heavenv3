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
    bestFor: 'You need the Section 8 notice, service, and evidence lined up before you serve anything.',
    points: [
      'Built to hold up if challenged with the key notice, service, and compliance checks up front',
      'Built for England after 1 May 2026 with a front-page case summary and risk snapshot',
      'Best when you want to start with notice and service before moving into court paperwork',
    ],
    href: getProductLandingHref('notice_only'),
    cta: 'See notice details',
  },
  {
    name: 'Stage 2: Section 8 Court & Possession Pack',
    productSku: 'complete_pack',
    price: PRODUCTS.complete_pack.displayPrice,
    coverage: 'For landlords in England',
    bestFor: 'You need the notice, court forms, service record, and evidence kept together as one case file.',
    points: [
      'Carries the case into court without breaking the file',
      'Includes the Section 8 notice, service playbook, core court forms, and filing guidance together',
      'Helps you avoid piecing the claim together across separate documents and timelines',
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
    bestFor: 'You need to recover unpaid rent, damage, bills, or other tenancy debt.',
    points: [
      'Built for unpaid rent, bills, damage, and guarantor-related tenancy claims',
      'Includes claim paperwork and arrears support documents in one joined-up file',
      'Useful when the property issue and the money issue need separate action',
    ],
    href: getProductLandingHref('money_claim'),
    cta: 'See pack details',
  },
  {
    name: 'Standard Section 13 Rent Increase Pack',
    productSku: 'section13_standard',
    price: PRODUCTS.section13_standard.displayPrice,
    coverage: 'For landlords in England',
    bestFor: 'You need the standard Section 13 route for a normal rent increase.',
    points: [
      'Built for proposing a new rent properly with timing and market checks first',
      'Includes Form 4A, a support report, and proof of service in one file',
      'Best when you want the standard rent increase route before challenge risk grows',
    ],
    href: getProductLandingHref('section13_standard'),
    cta: 'See pack details',
  },
  {
    name: 'Challenge-Ready Section 13 Defence Pack',
    productSku: 'section13_defensive',
    price: PRODUCTS.section13_defensive.displayPrice,
    coverage: 'For landlords in England',
    bestFor: 'You expect a tenant challenge and want a stronger Section 13 file ready.',
    points: [
      'Built for rent increase cases where challenge or tribunal risk is already visible',
      'Adds fuller response support and stronger tribunal-facing preparation materials',
      'Best when you want a more complete evidence story from the very start',
    ],
    href: getProductLandingHref('section13_defensive'),
    cta: 'See pack details',
  },
  {
    name: 'Standard Tenancy Agreement',
    productSku: 'ast_standard',
    price: PRODUCTS.ast_standard.displayPrice,
    coverage: 'For landlords in England',
    bestFor: 'You need the baseline agreement for a straightforward England residential let.',
    points: [
      'Built for landlords letting residential property in England on the standard route',
      'England wording updated for the law from 1 May 2026 and ready to use',
      'Best for most ordinary residential lets without the extra premium drafting',
    ],
    href: getProductLandingHref('ast_standard'),
    cta: 'See agreement options',
  },
  {
    name: 'Premium Tenancy Agreement',
    productSku: 'ast_premium',
    price: PRODUCTS.ast_premium.displayPrice,
    coverage: 'For landlords in England',
    bestFor: 'You need fuller drafting and extra management detail for an England residential let.',
    points: [
      'Designed for England residential lets that need more detail than Standard',
      'Adds broader drafting and extra support documents for a fuller agreement file',
      'Student, HMO / Shared House, and Lodger routes now sit on separate England product pages',
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
