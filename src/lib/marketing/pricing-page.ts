import {
  getProductLandingHref,
  type ProductSku,
  PRODUCTS,
} from '@/lib/pricing/products';
import {
  SECTION13_DEFENCE_SUMMARY,
  SECTION13_STANDARD_SUMMARY,
} from '@/lib/marketing/landlord-messaging';

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
    name: 'Eviction Notice Generator (Section 8, May 2026)',
    productSku: 'notice_only',
    price: PRODUCTS.notice_only.displayPrice,
    coverage: 'For landlords in England',
    bestFor: 'You need to generate the right Section 8 notice before you serve.',
    points: [
      'Section 8 route with checks on grounds, dates, service, and compliance',
      'Built for the current England route after 1 May 2026',
      'Preview before you pay',
      'Best when you want to start with the notice before paying for court paperwork',
    ],
    href: getProductLandingHref('notice_only'),
    cta: 'View the eviction notice generator ->',
  },
  {
    name: 'Complete Eviction Pack',
    productSku: 'complete_pack',
    price: PRODUCTS.complete_pack.displayPrice,
    coverage: 'For landlords in England',
    bestFor: 'You need the notice, court forms, and filing guidance together.',
    points: [
      'Built for landlords already thinking about court',
      'Includes the Section 8 notice route, core court forms, and filing guidance',
      'Helps you avoid piecing the case together across multiple documents',
    ],
    href: getProductLandingHref('complete_pack'),
    cta: 'View the complete eviction pack ->',
    featured: true,
  },
  {
    name: 'Money Claim Pack',
    productSku: 'money_claim',
    price: PRODUCTS.money_claim.displayPrice,
    coverage: 'For landlords in England',
    bestFor: 'You need to recover unpaid rent or other tenancy debt.',
    points: [
      'Built for unpaid rent, bills, damage, and guarantor claims',
      'Includes claim paperwork and arrears support documents',
      'Useful when the property issue and the money issue need separate action',
    ],
    href: getProductLandingHref('money_claim'),
    cta: 'View the money claim pack ->',
  },
  {
    name: 'Section 13 Rent Increase Pack',
    productSku: 'section13_standard',
    price: PRODUCTS.section13_standard.displayPrice,
    coverage: 'For landlords in England',
    bestFor: 'You want to propose a new rent properly and keep the file clear before you serve.',
    points: [
      SECTION13_STANDARD_SUMMARY,
      'Includes Form 4A, a clearer support report, and proof of service',
      'Best when you want to explain the figure naturally and keep the paperwork joined up',
    ],
    href: getProductLandingHref('section13_standard'),
    cta: 'View the Standard Section 13 pack ->',
  },
  {
    name: 'Section 13 Defence Pack',
    productSku: 'section13_defensive',
    price: PRODUCTS.section13_defensive.displayPrice,
    coverage: 'For landlords in England',
    bestFor: 'You think the tenant may challenge the increase and you want a stronger landlord file ready.',
    points: [
      SECTION13_DEFENCE_SUMMARY,
      'Builds on the standard rent increase documents with fuller challenge support',
      'Best when tribunal readiness and a more complete evidence story matter',
    ],
    href: getProductLandingHref('section13_defensive'),
    cta: 'View the Defence Pack ->',
  },
  {
    name: 'Standard Tenancy Agreement',
    productSku: 'ast_standard',
    price: PRODUCTS.ast_standard.displayPrice,
    coverage: 'For landlords in England',
    bestFor: 'You need the baseline agreement for a straightforward England whole-property let.',
    points: [
      'Built for landlords letting property in England',
      'England wording updated for the law from 1 May 2026',
      'Best for most ordinary residential lets',
    ],
    href: getProductLandingHref('ast_standard'),
    cta: 'View England tenancy agreements ->',
  },
  {
    name: 'Premium Tenancy Agreement',
    productSku: 'ast_premium',
    price: PRODUCTS.ast_premium.displayPrice,
    coverage: 'For landlords in England',
    bestFor: 'You need fuller drafting and extra management detail for an England residential let.',
    points: [
      'Designed for England residential lets that need more detail than Standard',
      'Adds broader drafting and extra support documents',
      'Student, HMO / Shared House, and Lodger routes now sit on separate England product pages',
    ],
    href: getProductLandingHref('ast_premium'),
    cta: 'View England tenancy agreements ->',
  },
];

export const PRICING_SCHEMA_ITEMS = [
  { sku: 'notice_only', name: 'Eviction Notice Generator (Section 8, May 2026)', url: '/products/notice-only' },
  { sku: 'complete_pack', name: 'Complete Eviction Pack', url: '/products/complete-pack' },
  { sku: 'money_claim', name: 'Money Claim Pack', url: '/products/money-claim' },
  { sku: 'section13_standard', name: 'Section 13 Rent Increase Pack', url: '/products/section-13-standard' },
  { sku: 'section13_defensive', name: 'Section 13 Defence Pack', url: '/products/section-13-defence' },
  { sku: 'ast_standard', name: 'England Tenancy Agreements', url: '/products/ast' },
  { sku: 'ast_premium', name: 'England Tenancy Agreements', url: '/products/ast' },
  { sku: 'england_standard_tenancy_agreement', name: 'England Standard Tenancy Agreement', url: '/standard-tenancy-agreement' },
  { sku: 'england_premium_tenancy_agreement', name: 'England Premium Tenancy Agreement', url: '/premium-tenancy-agreement' },
  { sku: 'england_student_tenancy_agreement', name: 'England Student Tenancy Agreement', url: '/student-tenancy-agreement' },
  { sku: 'england_hmo_shared_house_tenancy_agreement', name: 'England HMO / Shared House Tenancy Agreement', url: '/hmo-shared-house-tenancy-agreement' },
  { sku: 'england_lodger_agreement', name: 'England Lodger Agreement', url: '/lodger-agreement' },
] as const;
