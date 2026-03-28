import type { DocumentInfo } from '@/components/preview/DocumentCard';
import { getPackContents } from '@/lib/products/pack-contents';
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

interface ResidentialDocumentListOptions {
  englandTenancyPurpose?: string | null;
  depositTaken?: boolean | null;
  includeGuarantorDeed?: boolean | null;
}

function mapPackItemToDocumentInfo(item: ReturnType<typeof getPackContents>[number]): DocumentInfo {
  const categoryMap: Record<string, DocumentInfo['category']> = {
    'Tenancy agreement': 'Agreement',
    Checklists: 'Checklist',
    Guidance: 'Guidance',
    Evidence: 'Report',
    Other: 'Agreement',
  };

  const iconMap: Record<string, DocumentInfo['icon']> = {
    'Tenancy agreement': 'agreement',
    Checklists: 'checklist',
    Guidance: 'guidance',
    Evidence: 'evidence',
    Other: 'agreement',
  };

  const pagesMap: Record<string, string> = {
    england_standard_tenancy_agreement: '12-18 pages',
    england_premium_tenancy_agreement: '16-24 pages',
    england_student_tenancy_agreement: '14-22 pages',
    england_hmo_shared_house_tenancy_agreement: '15-24 pages',
    england_lodger_agreement: '8-13 pages',
    england_written_statement_of_terms: '10-16 pages',
    england_tenancy_transition_guidance: '4-7 pages',
    renters_rights_information_sheet_2026: 'Official PDF',
    pre_tenancy_checklist_england: '5-8 pages',
    england_lodger_checklist: '3-5 pages',
    deposit_protection_certificate: '4-7 pages',
    tenancy_deposit_information: '6-10 pages',
    guarantor_agreement: '5-9 pages',
    england_keys_handover_record: '3-5 pages',
    england_utilities_handover_sheet: '3-5 pages',
    england_pet_request_addendum: '3-5 pages',
    england_tenancy_variation_record: '3-5 pages',
    england_premium_management_schedule: '5-8 pages',
    england_student_move_out_schedule: '4-7 pages',
    england_hmo_house_rules_appendix: '4-7 pages',
    england_lodger_house_rules_appendix: '3-5 pages',
  };

  return {
    id: item.key,
    title: item.title,
    description: item.description || item.title,
    icon: iconMap[item.category] || 'agreement',
    pages: pagesMap[item.key] || '4-8 pages',
    category: categoryMap[item.category] || 'Document',
  };
}

export function getResidentialDocumentList(
  product: ResidentialLettingProductSku,
  options: ResidentialDocumentListOptions = {}
): DocumentInfo[] {
  if (
    product === 'england_standard_tenancy_agreement' ||
    product === 'england_premium_tenancy_agreement' ||
    product === 'england_student_tenancy_agreement' ||
    product === 'england_hmo_shared_house_tenancy_agreement' ||
    product === 'england_lodger_agreement'
  ) {
    return getPackContents({
      product,
      jurisdiction: 'england',
      englandTenancyPurpose: options.englandTenancyPurpose,
      depositTaken: options.depositTaken,
      includeGuarantorDeed: options.includeGuarantorDeed,
    }).map(mapPackItemToDocumentInfo);
  }

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
  const productSpecificFeatures: Partial<Record<ResidentialLettingProductSku, string[]>> = {
    england_standard_tenancy_agreement: [
      'England-only baseline residential tenancy agreement',
      'Whole-property ordinary let workflow',
      'England 2026 written-information drafting built into the main document',
      'Pre-tenancy checklist, handover, utilities, pet, and variation support docs included',
      'Instant PDF delivery after payment',
    ],
    england_premium_tenancy_agreement: [
      'England-only premium residential tenancy agreement',
      'Fuller operational drafting with management, reporting, inspection, and handover detail',
      'England 2026 written-information drafting built into the main document',
      'Premium management schedule plus handover, utilities, pet, and variation support docs included',
      'Instant PDF delivery after payment',
    ],
    england_student_tenancy_agreement: [
      'England student-focused tenancy agreement',
      'Guarantor, sharer, and end-of-term detail',
      'England 2026 written-information drafting built into the main document',
      'Student move-out schedule and guarantor support docs included',
      'Instant PDF delivery after payment',
    ],
    england_hmo_shared_house_tenancy_agreement: [
      'England HMO/shared-house tenancy agreement',
      'Communal-area and sharer-specific drafting',
      'England 2026 written-information drafting built into the main document',
      'HMO/shared house rules appendix and operational support docs included',
      'Instant PDF delivery after payment',
    ],
    england_lodger_agreement: [
      'England resident-landlord lodger agreement',
      'Room-let and house-rules workflow',
      'Lodger checklist, handover record, and house-rules appendix included',
      'Guided agreement summary before checkout',
      'Instant PDF delivery after payment',
    ],
  };

  return {
    name: config.label,
    price: config.displayPrice,
    originalPrice: '\u00A375+',
    savings: 'Save time versus drafting from scratch',
    features:
      productSpecificFeatures[product] || [
        'England residential landlord document',
        'Generated from your guided wizard answers',
        'Instant PDF delivery after payment',
        '30-day edit and regenerate window',
      ],
  };
}
