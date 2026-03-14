import type { DocumentInfo } from '@/components/preview/DocumentCard';
import {
  RESIDENTIAL_LETTING_PRODUCTS,
  type ResidentialLettingProductSku,
} from '@/lib/residential-letting/products';

export interface ResidentialProductMeta {
  name: string;
  price: string;
  originalPrice?: string;
  savings?: string;
  features: string[];
}

export function getResidentialDocumentList(product: ResidentialLettingProductSku): DocumentInfo[] {
  const single = (
    title: string,
    description: string,
    category = 'Document',
    pages = '4-8 pages'
  ): DocumentInfo[] => [
    {
      id: product,
      title,
      description,
      icon: 'agreement',
      pages,
      category,
    },
  ];

  switch (product) {
    case 'guarantor_agreement':
      return single('Guarantor Agreement', 'Standalone deed of guarantee linked to the tenancy', 'Agreement', '5-9 pages');
    case 'residential_sublet_agreement':
      return single('Residential Sublet Agreement', 'Agreement between the existing tenant and subtenant', 'Agreement', '5-9 pages');
    case 'lease_amendment':
      return single('Lease Amendment', 'Signed amendment that varies the existing tenancy terms', 'Agreement', '4-7 pages');
    case 'lease_assignment_agreement':
      return single('Lease Assignment Agreement', 'Transfer agreement for the outgoing and incoming tenant', 'Agreement', '5-9 pages');
    case 'rent_arrears_letter':
      return single('Rent Arrears Letter', 'Formal arrears demand / letter before action', 'Letter', '4-7 pages');
    case 'repayment_plan_agreement':
      return single('Repayment Plan Agreement', 'Signed repayment schedule for rent arrears', 'Agreement', '5-8 pages');
    case 'residential_tenancy_application':
      return single('Residential Tenancy Application', 'Legacy applicant information form', 'Form', '3-5 pages');
    case 'rental_inspection_report':
      return single(
        'Rental Inspection Report',
        'Detailed room-by-room inspection report with layout, keys, meters, safety checks, and condition evidence',
        'Report',
        '6-12 pages'
      );
    case 'inventory_schedule_condition':
      return single('Inventory & Schedule of Condition', 'Inventory and condition record for check-in evidence', 'Schedule', '8-15 pages');
    case 'flatmate_agreement':
      return single('Flatmate Agreement', 'Agreement on bills, house rules, and shared living arrangements', 'Agreement', '4-7 pages');
    case 'renewal_tenancy_agreement':
      return single('Renewal Tenancy Agreement', 'Renewal agreement for a continuing fixed-term tenancy', 'Agreement', '5-8 pages');
    default:
      return single('Residential Letting Document', 'England residential landlord document');
  }
}

export function getResidentialProductMeta(product: ResidentialLettingProductSku): ResidentialProductMeta {
  const config = RESIDENTIAL_LETTING_PRODUCTS[product];
  return {
    name: config.label,
    price: config.displayPrice,
    originalPrice: '\u00A375+',
    savings: 'Save time versus drafting from scratch',
    features: [
      'England residential landlord document',
      'Generated from your guided wizard answers',
      'Instant PDF delivery after payment',
      '30-day edit and regenerate window',
    ],
  };
}
