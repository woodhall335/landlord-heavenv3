import { buildWizardLink } from '@/lib/wizard/buildWizardLink';

export const RESIDENTIAL_LETTING_STANDARD_PRICE = 9.99;
export const RESIDENTIAL_LETTING_PREMIUM_PRICE = 12.99;

export const RESIDENTIAL_LETTING_STANDARD_DISPLAY = '\u00A39.99';
export const RESIDENTIAL_LETTING_PREMIUM_DISPLAY = '\u00A312.99';

export const RESIDENTIAL_LETTING_PRODUCTS = {
  guarantor_agreement: {
    sku: 'guarantor_agreement',
    label: 'Guarantor Agreement',
    shortLabel: 'Guarantor',
    description: 'Standalone England guarantor agreement for a residential tenancy',
    price: RESIDENTIAL_LETTING_PREMIUM_PRICE,
    displayPrice: RESIDENTIAL_LETTING_PREMIUM_DISPLAY,
    topic: 'tenancy',
    slug: 'guarantor-agreement-england',
  },
  residential_sublet_agreement: {
    sku: 'residential_sublet_agreement',
    label: 'Residential Sublet Agreement',
    shortLabel: 'Sublet',
    description: 'England residential sublet agreement for a tenant and subtenant',
    price: RESIDENTIAL_LETTING_PREMIUM_PRICE,
    displayPrice: RESIDENTIAL_LETTING_PREMIUM_DISPLAY,
    topic: 'tenancy',
    slug: 'residential-sublet-agreement-england',
  },
  lease_amendment: {
    sku: 'lease_amendment',
    label: 'Lease Amendment',
    shortLabel: 'Amendment',
    description: 'England amendment agreement for changes to an existing tenancy',
    price: RESIDENTIAL_LETTING_PREMIUM_PRICE,
    displayPrice: RESIDENTIAL_LETTING_PREMIUM_DISPLAY,
    topic: 'tenancy',
    slug: 'lease-amendment-england',
  },
  lease_assignment_agreement: {
    sku: 'lease_assignment_agreement',
    label: 'Lease Assignment Agreement',
    shortLabel: 'Assignment',
    description: 'England assignment agreement for transfer of a tenancy',
    price: RESIDENTIAL_LETTING_PREMIUM_PRICE,
    displayPrice: RESIDENTIAL_LETTING_PREMIUM_DISPLAY,
    topic: 'tenancy',
    slug: 'lease-assignment-agreement-england',
  },
  rent_arrears_letter: {
    sku: 'rent_arrears_letter',
    label: 'Rent Arrears Letter',
    shortLabel: 'Arrears Letter',
    description: 'Formal England rent arrears letter / letter before action',
    price: RESIDENTIAL_LETTING_PREMIUM_PRICE,
    displayPrice: RESIDENTIAL_LETTING_PREMIUM_DISPLAY,
    topic: 'arrears',
    slug: 'rent-arrears-letter-england',
  },
  repayment_plan_agreement: {
    sku: 'repayment_plan_agreement',
    label: 'Repayment Plan Agreement',
    shortLabel: 'Repayment Plan',
    description: 'England repayment plan agreement for rent arrears',
    price: RESIDENTIAL_LETTING_PREMIUM_PRICE,
    displayPrice: RESIDENTIAL_LETTING_PREMIUM_DISPLAY,
    topic: 'arrears',
    slug: 'repayment-plan-agreement-england',
  },
  residential_tenancy_application: {
    sku: 'residential_tenancy_application',
    label: 'Residential Tenancy Application',
    shortLabel: 'Application',
    description: 'Legacy residential tenancy application form',
    price: RESIDENTIAL_LETTING_STANDARD_PRICE,
    displayPrice: RESIDENTIAL_LETTING_STANDARD_DISPLAY,
    topic: 'tenancy',
    slug: 'residential-tenancy-application-england',
  },
  rental_inspection_report: {
    sku: 'rental_inspection_report',
    label: 'Rental Inspection Report',
    shortLabel: 'Inspection',
    description: 'England move-in or move-out rental inspection report',
    price: RESIDENTIAL_LETTING_STANDARD_PRICE,
    displayPrice: RESIDENTIAL_LETTING_STANDARD_DISPLAY,
    topic: 'compliance',
    slug: 'rental-inspection-report-england',
  },
  inventory_schedule_condition: {
    sku: 'inventory_schedule_condition',
    label: 'Inventory & Schedule of Condition',
    shortLabel: 'Inventory',
    description: 'England inventory and schedule of condition for check-in evidence',
    price: RESIDENTIAL_LETTING_STANDARD_PRICE,
    displayPrice: RESIDENTIAL_LETTING_STANDARD_DISPLAY,
    topic: 'compliance',
    slug: 'inventory-schedule-of-condition-england',
  },
  flatmate_agreement: {
    sku: 'flatmate_agreement',
    label: 'Flatmate Agreement',
    shortLabel: 'Flatmate',
    description: 'England flatmate agreement for occupiers sharing a home',
    price: RESIDENTIAL_LETTING_STANDARD_PRICE,
    displayPrice: RESIDENTIAL_LETTING_STANDARD_DISPLAY,
    topic: 'tenancy',
    slug: 'flatmate-agreement-england',
  },
  renewal_tenancy_agreement: {
    sku: 'renewal_tenancy_agreement',
    label: 'Renewal Tenancy Agreement',
    shortLabel: 'Renewal',
    description: 'England tenancy renewal agreement for a continuing let',
    price: RESIDENTIAL_LETTING_STANDARD_PRICE,
    displayPrice: RESIDENTIAL_LETTING_STANDARD_DISPLAY,
    topic: 'tenancy',
    slug: 'renewal-tenancy-agreement-england',
  },
} as const;

export type ResidentialLettingProductSku = keyof typeof RESIDENTIAL_LETTING_PRODUCTS;

export const RESIDENTIAL_LETTING_PRODUCT_SKUS = Object.keys(
  RESIDENTIAL_LETTING_PRODUCTS
) as ResidentialLettingProductSku[];

export const PUBLIC_RESIDENTIAL_LETTING_PRODUCT_SKUS = RESIDENTIAL_LETTING_PRODUCT_SKUS.filter(
  (sku) => sku !== 'residential_tenancy_application'
);

export function isResidentialLettingProductSku(
  value: string | null | undefined
): value is ResidentialLettingProductSku {
  return Boolean(value && value in RESIDENTIAL_LETTING_PRODUCTS);
}

export function isPublicResidentialLettingProductSku(
  value: string | null | undefined
): value is (typeof PUBLIC_RESIDENTIAL_LETTING_PRODUCT_SKUS)[number] {
  return Boolean(
    value &&
      PUBLIC_RESIDENTIAL_LETTING_PRODUCT_SKUS.includes(
        value as (typeof PUBLIC_RESIDENTIAL_LETTING_PRODUCT_SKUS)[number]
      )
  );
}

export function getResidentialWizardHref(product: ResidentialLettingProductSku): string {
  return buildWizardLink({
    product,
    jurisdiction: 'england',
    src: 'product_page',
    topic: RESIDENTIAL_LETTING_PRODUCTS[product].topic,
  });
}

export function getResidentialLandingHref(product: ResidentialLettingProductSku): string {
  return `/${RESIDENTIAL_LETTING_PRODUCTS[product].slug}`;
}

export const RESIDENTIAL_WIZARD_UPSELLS: Record<
  string,
  ResidentialLettingProductSku[]
> = {
  ast_standard: [
    'guarantor_agreement',
    'inventory_schedule_condition',
    'rental_inspection_report',
  ],
  ast_premium: ['inventory_schedule_condition', 'rental_inspection_report'],
  renewal_tenancy_agreement: ['lease_amendment'],
  lease_amendment: ['renewal_tenancy_agreement'],
  residential_sublet_agreement: ['flatmate_agreement'],
  rent_arrears_letter: ['repayment_plan_agreement'],
  repayment_plan_agreement: ['rent_arrears_letter'],
};
