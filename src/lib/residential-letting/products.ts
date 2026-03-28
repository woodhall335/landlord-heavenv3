import { buildWizardLink } from '@/lib/wizard/buildWizardLink';
import { isRetiredPublicSku } from '@/lib/public-retirements';
import {
  formatFromPriceLabel,
  formatPriceLabel,
  formatPriceRangeLabel,
} from '@/lib/pricing/products';

export const RESIDENTIAL_LETTING_STANDARD_PRICE = 9.99;
export const RESIDENTIAL_LETTING_PREMIUM_PRICE = 12.99;
export const ENGLAND_STANDARD_TENANCY_PRICE = 14.99;
export const ENGLAND_PREMIUM_TENANCY_PRICE = 24.99;
export const ENGLAND_STUDENT_TENANCY_PRICE = 24.99;
export const ENGLAND_HMO_SHARED_TENANCY_PRICE = 34.99;
export const ENGLAND_LODGER_AGREEMENT_PRICE = 14.99;

export const RESIDENTIAL_LETTING_STANDARD_DISPLAY = formatPriceLabel(
  RESIDENTIAL_LETTING_STANDARD_PRICE
);
export const RESIDENTIAL_LETTING_PREMIUM_DISPLAY = formatPriceLabel(
  RESIDENTIAL_LETTING_PREMIUM_PRICE
);
export const ENGLAND_STANDARD_TENANCY_DISPLAY = formatPriceLabel(
  ENGLAND_STANDARD_TENANCY_PRICE
);
export const ENGLAND_PREMIUM_TENANCY_DISPLAY = formatPriceLabel(
  ENGLAND_PREMIUM_TENANCY_PRICE
);
export const ENGLAND_STUDENT_TENANCY_DISPLAY = formatPriceLabel(
  ENGLAND_STUDENT_TENANCY_PRICE
);
export const ENGLAND_HMO_SHARED_TENANCY_DISPLAY = formatPriceLabel(
  ENGLAND_HMO_SHARED_TENANCY_PRICE
);
export const ENGLAND_LODGER_AGREEMENT_DISPLAY = formatPriceLabel(
  ENGLAND_LODGER_AGREEMENT_PRICE
);
export const RESIDENTIAL_LETTING_FROM_PRICE = formatFromPriceLabel(
  RESIDENTIAL_LETTING_STANDARD_PRICE
);
export const RESIDENTIAL_LETTING_PRICE_RANGE = formatPriceRangeLabel([
  RESIDENTIAL_LETTING_STANDARD_PRICE,
  RESIDENTIAL_LETTING_PREMIUM_PRICE,
]);

export const RESIDENTIAL_LETTING_PRODUCTS = {
  england_standard_tenancy_agreement: {
    sku: 'england_standard_tenancy_agreement',
    label: 'Standard Tenancy Agreement',
    shortLabel: 'Standard',
    description:
      'Ordinary England residential tenancy agreement for a straightforward whole-property let',
    price: ENGLAND_STANDARD_TENANCY_PRICE,
    displayPrice: ENGLAND_STANDARD_TENANCY_DISPLAY,
    topic: 'tenancy',
    slug: 'tenancy-agreement',
  },
  england_premium_tenancy_agreement: {
    sku: 'england_premium_tenancy_agreement',
    label: 'Premium Tenancy Agreement',
    shortLabel: 'Premium',
    description:
      'Ordinary England residential premium tenancy agreement with fuller drafting and management options',
    price: ENGLAND_PREMIUM_TENANCY_PRICE,
    displayPrice: ENGLAND_PREMIUM_TENANCY_DISPLAY,
    topic: 'tenancy',
    slug: 'premium-tenancy-agreement',
  },
  england_student_tenancy_agreement: {
    sku: 'england_student_tenancy_agreement',
    label: 'Student Tenancy Agreement',
    shortLabel: 'Student',
    description:
      'Student-focused England tenancy agreement with sharer, guarantor, and end-of-term detail',
    price: ENGLAND_STUDENT_TENANCY_PRICE,
    displayPrice: ENGLAND_STUDENT_TENANCY_DISPLAY,
    topic: 'tenancy',
    slug: 'student-tenancy-agreement',
  },
  england_hmo_shared_house_tenancy_agreement: {
    sku: 'england_hmo_shared_house_tenancy_agreement',
    label: 'HMO / Shared House Tenancy Agreement',
    shortLabel: 'HMO / Shared',
    description:
      'England shared-house and HMO tenancy agreement with communal-area and sharer drafting',
    price: ENGLAND_HMO_SHARED_TENANCY_PRICE,
    displayPrice: ENGLAND_HMO_SHARED_TENANCY_DISPLAY,
    topic: 'tenancy',
    slug: 'hmo-shared-house-tenancy-agreement',
  },
  england_lodger_agreement: {
    sku: 'england_lodger_agreement',
    label: 'Room Let / Lodger Agreement',
    shortLabel: 'Lodger',
    description:
      'England resident-landlord lodger agreement for a room let or licence-style arrangement',
    price: ENGLAND_LODGER_AGREEMENT_PRICE,
    displayPrice: ENGLAND_LODGER_AGREEMENT_DISPLAY,
    topic: 'tenancy',
    slug: 'lodger-agreement',
  },
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
    description: 'Formal England rent arrears escalation letter for professional debt recovery',
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
    description: 'England tenancy renewal agreement for legacy or specialist continuing-let situations',
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
  (sku) => sku !== 'residential_tenancy_application' && !isRetiredPublicSku(sku)
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
  england_standard_tenancy_agreement: [
    'inventory_schedule_condition',
    'rental_inspection_report',
    'guarantor_agreement',
  ],
  england_premium_tenancy_agreement: [
    'inventory_schedule_condition',
    'rental_inspection_report',
    'guarantor_agreement',
    'lease_amendment',
  ],
  england_student_tenancy_agreement: [
    'guarantor_agreement',
    'inventory_schedule_condition',
    'flatmate_agreement',
  ],
  england_hmo_shared_house_tenancy_agreement: [
    'inventory_schedule_condition',
    'rental_inspection_report',
    'flatmate_agreement',
  ],
  england_lodger_agreement: [
    'inventory_schedule_condition',
    'rental_inspection_report',
  ],
};
