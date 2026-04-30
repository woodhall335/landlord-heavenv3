/**
 * Pack Contents - Single Source of Truth
 *
 * Returns the list of documents included in a product purchase
 * based on product type, jurisdiction, and route.
 */

import {
  ENGLAND_PREMIUM_ASSURED_PERIODIC_TIER_LABEL,
  ENGLAND_STANDARD_ASSURED_PERIODIC_TIER_LABEL,
} from '@/lib/tenancy/england-agreement-constants';
import {
  ENGLAND_SECTION8_NOTICE_NAME,
  ENGLAND_SECTION8_NOTICE_TITLE,
} from '@/lib/england-possession/section8-terminology';
import { getEnglandTenancyPurpose } from '@/lib/tenancy/england-reform';

export type PackItemCategory =
  | 'Notice'
  | 'Court forms'
  | 'Checklists'
  | 'Guidance'
  | 'Evidence'
  | 'Tenancy agreement'
  | 'Other';

function getEnglandSection13Contents(product: string): PackItem[] {
  const baseItems: PackItem[] = [
    {
      key: 'section13_form_4a',
      title: 'Form 4A rent increase notice',
      description: 'Official England Form 4A completed from your Section 13 wizard answers.',
      category: 'Notice',
      required: true,
    },
    {
      key: 'section13_justification_report',
      title: 'Rent increase justification report',
      description: 'Comparable-rent summary, adjustment reasoning, and median market-rent analysis.',
      category: 'Evidence',
      required: true,
    },
    {
      key: 'section13_proof_of_service_record',
      title: 'Proof of service record',
      description: 'Service-method record and signed delivery evidence note for the Section 13 notice.',
      category: 'Evidence',
      required: true,
    },
    {
      key: 'section13_cover_letter',
      title: 'Rent increase cover letter',
      description: 'Plain-English cover letter to accompany the notice and explain the proposed increase.',
      category: 'Guidance',
      required: true,
    },
  ];

  if (product !== 'section13_defensive') {
    return baseItems;
  }

  return [
    ...baseItems,
    {
      key: 'section13_tribunal_argument_summary',
      title: 'Tribunal Argument Summary',
      description: 'One-page landlord argument brief tying the proposed rent to the comparable evidence and banding.',
      category: 'Guidance',
      required: true,
    },
    {
      key: 'section13_tribunal_defence_guide',
      title: 'Tribunal defence guide',
      description: 'Step-by-step tribunal preparation guide for a challenged rent increase.',
      category: 'Guidance',
      required: true,
    },
    {
      key: 'section13_landlord_response_template',
      title: 'Landlord response template',
      description: 'Pre-filled landlord response template aligned to the live rent-determination process.',
      category: 'Court forms',
      required: true,
    },
    {
      key: 'section13_legal_briefing',
      title: 'Tribunal legal briefing',
      description: 'Three-page hearing briefing covering evidence themes and preparation points.',
      category: 'Guidance',
      required: true,
    },
    {
      key: 'section13_evidence_checklist',
      title: 'Evidence checklist',
      description: 'Checklist of the evidence to print or upload for a tribunal-ready bundle.',
      category: 'Checklists',
      required: true,
    },
    {
      key: 'section13_negotiation_email_template',
      title: 'Negotiation email template',
      description: 'Template wording to open discussions before a tribunal challenge.',
      category: 'Guidance',
      required: true,
    },
    {
      key: 'section13_tribunal_bundle',
      title: 'Merged tribunal bundle PDF',
      description: 'Indexed hearing bundle with exhibits, page numbers, and supporting documents.',
      category: 'Evidence',
      required: true,
    },
    {
      key: 'section13_tribunal_bundle_zip',
      title: 'Tribunal bundle ZIP',
      description: 'ZIP export containing the merged bundle and all supporting files individually.',
      category: 'Evidence',
      required: true,
    },
  ];
}

export interface PackItem {
  /** Stable identifier e.g. 'notice_form', 'service_instructions' */
  key: string;
  /** User-facing display name */
  title: string;
  /** Optional description */
  description?: string;
  /** Document category */
  category: PackItemCategory;
  /** Whether this document is always included (vs conditional) */
  required?: boolean;
}

export interface GetPackContentsArgs {
  /** Product SKU for the purchased product or legacy tenancy alias */
  product: string;
  /** Jurisdiction: england | wales | scotland | northern-ireland */
  jurisdiction: string;
  /** Route if applicable: section_8 | section_21 | section_173 | fault_based | notice_to_leave */
  route?: string | null;
  /** Ground codes if applicable */
  grounds?: string[] | null;
  /** Whether case has rent arrears */
  has_arrears?: boolean;
  /** Whether arrears schedule is included */
  include_arrears_schedule?: boolean;
  /** Whether inventory data was completed via wizard (for tenancy agreements) */
  hasInventoryData?: boolean;
  /** England tenancy purpose for the modern 2026 agreement flows */
  englandTenancyPurpose?: string | null;
  /** Whether a deposit is actually being taken in the relevant flow */
  depositTaken?: boolean | null;
  /** Whether an optional guarantor deed should be included */
  includeGuarantorDeed?: boolean | null;
}
function getEnglandResidentialLettingContents(args: GetPackContentsArgs): PackItem[] {
  const { product, englandTenancyPurpose, depositTaken, includeGuarantorDeed } = args;
  const purpose = getEnglandTenancyPurpose(englandTenancyPurpose);
  const isExistingWrittenTransition = purpose === 'existing_written_tenancy';
  const isExistingVerbalTenancy = purpose === 'existing_verbal_tenancy';
  const takesDeposit = depositTaken === true;

  const assuredAgreementTitles: Record<string, string> = {
    england_standard_tenancy_agreement: 'Standard Tenancy Agreement',
    england_premium_tenancy_agreement: 'Premium Tenancy Agreement',
    england_student_tenancy_agreement: 'Student Tenancy Agreement',
    england_hmo_shared_house_tenancy_agreement: 'HMO / Shared House Tenancy Agreement',
  };

  if (product in assuredAgreementTitles) {
    if (isExistingWrittenTransition) {
      return [
        {
          key: 'england_tenancy_transition_guidance',
          title: 'England Tenancy Transition Guidance',
          description: 'Transition note for an existing written England assured tenancy moving into the post-1 May 2026 regime.',
          category: 'Guidance',
          required: true,
        },
        {
          key: 'renters_rights_information_sheet_2026',
          title: 'Renters\' Rights Act Information Sheet 2026',
          description: 'Exact government PDF for existing written England assured tenancies that need the 2026 information sheet.',
          category: 'Guidance',
          required: true,
        },
      ];
    }

    const items: PackItem[] = [
      {
        key: isExistingVerbalTenancy ? 'england_written_statement_of_terms' : product,
        title: isExistingVerbalTenancy
          ? 'England Written Statement of Terms'
          : assuredAgreementTitles[product],
        description: isExistingVerbalTenancy
          ? 'Written statement of terms for an existing verbal England assured tenancy.'
          : `${assuredAgreementTitles[product]} for the modern England assured-tenancy regime.`,
        category: 'Tenancy agreement',
        required: true,
      },
      {
        key: 'pre_tenancy_checklist_england',
        title: 'Pre-Tenancy Checklist (England)',
        description: 'England compliance checklist covering the main pre-tenancy and written-information actions for the tenancy file.',
        category: 'Checklists',
        required: true,
      },
      {
        key: 'england_keys_handover_record',
        title: 'Keys & Handover Record',
        description: 'Practical handover record for keys, access devices, and move-in confirmations.',
        category: 'Checklists',
        required: true,
      },
      {
        key: 'england_utilities_handover_sheet',
        title: 'Utilities & Meter Handover Sheet',
        description: 'Record for utilities responsibility, opening readings, and account handover notes.',
        category: 'Checklists',
        required: true,
      },
      {
        key: 'england_pet_request_addendum',
        title: 'Pet Request / Consent Addendum',
        description: 'Optional addendum for recording a pet request, decision, and any consent conditions.',
        category: 'Other',
        required: true,
      },
      {
        key: 'england_tenancy_variation_record',
        title: 'Tenancy Variation Record',
        description: 'Simple record for agreed changes or management updates after the agreement is issued.',
        category: 'Other',
        required: true,
      },
    ];

    if (takesDeposit) {
      items.push(
        {
          key: 'deposit_protection_certificate',
          title: 'Deposit Protection Certificate',
          description: 'Standalone certificate confirming the deposit protection scheme details for England.',
          category: 'Guidance',
          required: true,
        },
        {
          key: 'tenancy_deposit_information',
          title: 'Prescribed Information Pack',
          description: 'Standalone tenancy deposit prescribed information pack for England.',
          category: 'Guidance',
          required: true,
        }
      );
    }

    if (includeGuarantorDeed === true) {
      items.push({
        key: 'guarantor_agreement',
        title: 'Guarantor Agreement',
        description: 'Optional deed of guarantee generated because the tenancy answers indicate a guarantor will be used.',
        category: 'Other',
        required: true,
      });
    }

    if (product === 'england_premium_tenancy_agreement') {
      items.push({
        key: 'england_premium_management_schedule',
        title: 'Premium Management Schedule',
        description: 'Premium-only schedule for inspections, repairs reporting, keys, contractor access, and hand-back expectations.',
        category: 'Other',
        required: true,
      });
    }

    if (product === 'england_student_tenancy_agreement') {
      items.push({
        key: 'england_student_move_out_schedule',
        title: 'Student Move-Out & Guarantor Schedule',
        description: 'Student-only schedule for guarantor scope, replacement procedure, keys, cleaning, and end-of-term return expectations.',
        category: 'Other',
        required: true,
      });
    }

    if (product === 'england_hmo_shared_house_tenancy_agreement') {
      items.push({
        key: 'england_hmo_house_rules_appendix',
        title: 'HMO / Shared House Rules Appendix',
        description: 'Shared-house appendix covering communal areas, cleaning, waste, visitors, quiet hours, and fire-safety notes.',
        category: 'Other',
        required: true,
      });
    }

    return items;
  }

  switch (product) {
    case 'england_lodger_agreement':
      return [
        {
          key: 'england_lodger_agreement',
          title: 'Room Let / Lodger Agreement',
          description: 'England resident-landlord lodger agreement for a room let or licence arrangement',
          category: 'Tenancy agreement',
          required: true,
        },
        {
          key: 'england_lodger_checklist',
          title: 'Room Let / Lodger Checklist',
          description: 'Resident-landlord room-let checklist covering handover, house rules, and key practical compliance points.',
          category: 'Checklists',
          required: true,
        },
        {
          key: 'england_keys_handover_record',
          title: 'Keys & Handover Record',
          description: 'Practical handover record for keys, room access, and move-in confirmations.',
          category: 'Checklists',
          required: true,
        },
        {
          key: 'england_lodger_house_rules_appendix',
          title: 'Lodger House Rules Appendix',
          description: 'Resident-landlord appendix for guests, quiet hours, shared-space cleaning, and room hand-back expectations.',
          category: 'Other',
          required: true,
        },
      ];
    case 'guarantor_agreement':
      return [
        {
          key: 'guarantor_agreement',
          title: 'Guarantor Agreement',
          description: 'Standalone deed of guarantee for a residential tenancy',
          category: 'Other',
          required: true,
        },
      ];
    case 'residential_sublet_agreement':
      return [
        {
          key: 'residential_sublet_agreement',
          title: 'Residential Sublet Agreement',
          description: 'Agreement between the tenant and subtenant',
          category: 'Other',
          required: true,
        },
      ];
    case 'lease_amendment':
      return [
        {
          key: 'lease_amendment',
          title: 'Lease Amendment',
          description: 'Written amendment to an existing tenancy agreement',
          category: 'Other',
          required: true,
        },
      ];
    case 'lease_assignment_agreement':
      return [
        {
          key: 'lease_assignment_agreement',
          title: 'Lease Assignment Agreement',
          description: 'Transfer of the tenancy from the outgoing tenant to the incoming tenant',
          category: 'Other',
          required: true,
        },
      ];
    case 'rent_arrears_letter':
      return [
        {
          key: 'rent_arrears_letter',
          title: 'Rent Arrears Letter',
          description: 'Formal rent arrears letter / letter before action',
          category: 'Guidance',
          required: true,
        },
      ];
    case 'repayment_plan_agreement':
      return [
        {
          key: 'repayment_plan_agreement',
          title: 'Repayment Plan Agreement',
          description: 'Agreement for repayment of rent arrears by instalments',
          category: 'Other',
          required: true,
        },
      ];
    case 'residential_tenancy_application':
      return [
        {
          key: 'residential_tenancy_application',
          title: 'Residential Tenancy Application',
          description: 'Applicant screening and tenancy application form',
          category: 'Other',
          required: true,
        },
      ];
    case 'rental_inspection_report':
      return [
        {
          key: 'rental_inspection_report',
          title: 'Rental Inspection Report',
          description: 'Property move-in or move-out inspection report',
          category: 'Evidence',
          required: true,
        },
      ];
    case 'inventory_schedule_condition':
      return [
        {
          key: 'inventory_schedule_condition',
          title: 'Inventory & Schedule of Condition',
          description: 'Standalone inventory and condition record',
          category: 'Evidence',
          required: true,
        },
      ];
    case 'flatmate_agreement':
      return [
        {
          key: 'flatmate_agreement',
          title: 'Flatmate Agreement',
          description: 'Shared living and bills agreement for occupiers',
          category: 'Other',
          required: true,
        },
      ];
    case 'renewal_tenancy_agreement':
      return [
        {
          key: 'renewal_tenancy_agreement',
          title: 'Renewal Tenancy Agreement',
          description: 'Renewal agreement for a continuing tenancy',
          category: 'Other',
          required: true,
        },
      ];
    default:
      return [];
  }
}

function getPremiumSupportPackItems(jurisdictionLabel: string): PackItem[] {
  return [
    {
      key: 'key_schedule',
      title: 'Key Receipt & Handover Schedule',
      description: `Practical record of keys, access devices, and handover details for the ${jurisdictionLabel} tenancy pack`,
      category: 'Guidance',
      required: true,
    },
    {
      key: 'property_maintenance_guide',
      title: 'Property Maintenance Guide',
      description: `Practical maintenance and reporting guidance for the ${jurisdictionLabel} tenancy pack`,
      category: 'Guidance',
      required: true,
    },
    {
      key: 'checkout_procedure',
      title: 'Checkout Procedure',
      description: `End-of-tenancy checkout steps and handback guidance for the ${jurisdictionLabel} tenancy pack`,
      category: 'Guidance',
      required: true,
    },
  ];
}

// =============================================================================
// ENGLAND PACK CONTENTS
// =============================================================================

function getEnglandNoticeOnlyContents(args: GetPackContentsArgs): PackItem[] {
  const items: PackItem[] = [];
  const { has_arrears, include_arrears_schedule } = args;

  items.push({
    key: 'case_summary',
    title: 'Case Summary — Stage 1 Notice & Service',
    description: 'Front-page case summary showing status, key risks, and the next step before service.',
    category: 'Guidance',
    required: true,
  });

  items.push({
    key: 'section8_notice',
    title: ENGLAND_SECTION8_NOTICE_TITLE,
    description: 'Official England possession notice for the current Section 8 route',
    category: 'Notice',
    required: true,
  });

  // Common items
  items.push({
    key: 'service_instructions',
    title: 'Service Instructions',
    description: 'How to legally serve your notice',
    category: 'Guidance',
    required: true,
  });

  items.push({
    key: 'validity_checklist',
    title: 'Service & Validity Checklist',
    description: `Pre-service checks for dates, grounds, and service on your ${ENGLAND_SECTION8_NOTICE_NAME}`,
    category: 'Checklists',
    required: true,
  });

  items.push({
    key: 'compliance_declaration',
    title: 'Pre-Service Compliance Declaration',
    description: 'Landlord-facing compliance confirmation to support the notice file.',
    category: 'Guidance',
    required: true,
  });

  items.push({
    key: 'proof_of_service',
    title: 'Certificate of Service (Form N215)',
    description: `Official editable Form N215 certificate of service for how and when the ${ENGLAND_SECTION8_NOTICE_NAME} was served.`,
    category: 'Evidence',
    required: true,
  });

  if (has_arrears || include_arrears_schedule) {
    items.push({
      key: 'arrears_schedule',
      title: 'Rent Schedule / Arrears Statement',
      description: 'Period-by-period breakdown of arrears',
      category: 'Evidence',
      required: false,
    });
  }

  items.push({
    key: 'what_happens_next',
    title: 'What Happens Next',
    description: 'Next-step guide covering service, notice expiry, and the Stage 2 court handoff.',
    category: 'Guidance',
    required: true,
  });

  return items;
}

function getEnglandCompletePackContents(args: GetPackContentsArgs): PackItem[] {
  void args;
  return [
    {
      key: 'case_summary',
      title: 'Case Summary — Stage 2 Court & Possession',
      description: 'Front-page summary for the complete pack, showing court readiness, key risks, and the next step across notice and issue.',
      category: 'Guidance',
      required: true,
    },
    {
      key: 'court_readiness_status',
      title: 'Court Readiness Status',
      description: 'Decision-engine status page showing whether the file is ready for issue, carries risk, or should not yet be issued.',
      category: 'Checklists',
      required: true,
    },
    {
      key: 'court_forms_guide',
      title: 'Court Forms',
      description: 'Alignment note for the court forms so the claim papers stay consistent with the notice and service record.',
      category: 'Guidance',
      required: true,
    },
    {
      key: 'n5_claim',
      title: 'Form N5 - Claim for Possession',
      description: 'Standard possession claim form for the county court paper route.',
      category: 'Court forms',
      required: true,
    },
    {
      key: 'n119_particulars',
      title: 'Form N119 - Particulars of Claim',
      description: 'Particulars of claim to accompany the possession claim.',
      category: 'Court forms',
      required: true,
    },
    {
      key: 'arrears_schedule',
      title: 'Schedule of Arrears',
      description: 'Updated arrears position at claim date, with period-by-period figures and running balance for court.',
      category: 'Evidence',
      required: true,
    },
    {
      key: 'section8_notice',
      title: ENGLAND_SECTION8_NOTICE_TITLE,
      description: `The served ${ENGLAND_SECTION8_NOTICE_NAME} carried forward as the Stage 1 foundation of the court file.`,
      category: 'Notice',
      required: true,
    },
    {
      key: 'service_record_notes',
      title: 'Service Continuity Notes',
      description: `Continuity note tying the served ${ENGLAND_SECTION8_NOTICE_NAME} to Form N215 and the claim file.`,
      category: 'Guidance',
      required: true,
    },
    {
      key: 'proof_of_service',
      title: 'Certificate of Service (Form N215)',
      description: `Official editable Form N215 certificate of service for how and when the ${ENGLAND_SECTION8_NOTICE_NAME} was served.`,
      category: 'Evidence',
      required: true,
    },
    {
      key: 'evidence_checklist',
      title: 'Evidence Required for Hearing',
      description: 'Court-facing checklist of the documents and proof needed for the possession hearing.',
      category: 'Checklists',
      required: true,
    },
    {
      key: 'hearing_checklist',
      title: 'Hearing Preparation Guide',
      description: 'Practical hearing guide covering the main questions, failure points, and documents to bring.',
      category: 'Guidance',
      required: true,
    },
    {
      key: 'what_happens_next',
      title: 'What Happens Next',
      description: 'Next-step guide covering issue, hearing, possession, and enforcement continuity.',
      category: 'Guidance',
      required: true,
    },
  ];
}

function getEnglandMoneyClaimContents(): PackItem[] {
  return [
    {
      key: 'n1_claim',
      title: 'Form N1 - Money Claim Form',
      description: 'Official claim form for County Court',
      category: 'Court forms',
      required: true,
    },
    {
      key: 'particulars_of_claim',
      title: 'Particulars of Claim',
      description: 'Detailed claim narrative and breakdown',
      category: 'Court forms',
      required: true,
    },
    {
      key: 'arrears_schedule',
      title: 'Schedule of Arrears',
      description: 'Period-by-period rent arrears breakdown',
      category: 'Evidence',
      required: true,
    },
    {
      key: 'interest_calculation',
      title: 'Interest Calculation',
      description: 'Statutory interest workings',
      category: 'Evidence',
      required: false,
    },
    {
      key: 'letter_before_claim',
      title: 'Letter Before Claim',
      description: 'Pre-Action Protocol compliant demand letter',
      category: 'Guidance',
      required: true,
    },
    {
      key: 'defendant_info_sheet',
      title: 'Defendant Information Sheet',
      description: 'Required information for the defendant',
      category: 'Guidance',
      required: true,
    },
    {
      key: 'reply_form',
      title: 'Reply Form',
      description: 'PAP-DEBT reply form for defendant response',
      category: 'Guidance',
      required: true,
    },
    {
      key: 'financial_statement_form',
      title: 'Financial Statement Form',
      description: 'PAP-DEBT financial statement for defendant',
      category: 'Guidance',
      required: true,
    },
    {
      key: 'court_filing_guide',
      title: 'Court Filing Guide',
      description: 'MCOL online or paper submission instructions',
      category: 'Guidance',
      required: true,
    },
    {
      key: 'enforcement_guide',
      title: 'Enforcement Guide',
      description: 'Options for enforcing judgment',
      category: 'Guidance',
      required: true,
    },
  ];
}

/**
 * ENGLAND LEGACY AST CONTENTS
 *
 * These entries remain the source of truth for historical ast_standard and
 * ast_premium orders. New England sales use the modern standalone England
 * product SKUs above and should not be collapsed back into this 2-tier model.
 */
function getEnglandASTContents(tier: 'standard' | 'premium', hasInventoryData?: boolean): PackItem[] {
  const items: PackItem[] = [];

  // Main Agreement
  if (tier === 'standard') {
    items.push({
      key: 'ast_agreement',
      title: ENGLAND_STANDARD_ASSURED_PERIODIC_TIER_LABEL,
      description: 'Solicitor-grade England assured periodic tenancy agreement with all embedded schedules. Updated for the Renters\' Rights Act 2025 flow.',
      category: 'Tenancy agreement',
      required: true,
    });
  } else {
    items.push({
      key: 'ast_agreement_hmo',
      title: ENGLAND_PREMIUM_ASSURED_PERIODIC_TIER_LABEL,
      description: 'Broader drafting for shared households, HMOs, guarantor-backed lets, and other more complex England tenancy arrangements.',
      category: 'Tenancy agreement',
      required: true,
    });
  }

  // Inventory Schedule - tier and context-specific behaviour
  // Standard: always blank template
  // Premium + hasInventoryData: wizard-completed
  // Premium + no data: ready to complete
  const inventoryTitle = tier === 'standard'
    ? 'Inventory & Schedule of Condition (Blank Template)'
    : hasInventoryData
      ? 'Inventory & Schedule of Condition (Wizard-Completed)'
      : 'Inventory & Schedule of Condition (Ready to Complete)';

  const inventoryDescription = tier === 'standard'
    ? 'Included as Schedule 4 inside the tenancy agreement (blank template)'
    : hasInventoryData
      ? 'Included as Schedule 4 inside the tenancy agreement (wizard-completed)'
      : 'Included as Schedule 4 inside the tenancy agreement (ready to complete)';

  items.push({
    key: 'inventory_schedule',
    title: inventoryTitle,
    description: inventoryDescription,
    category: 'Tenancy agreement',
    required: true,
  });

  // Pre-Tenancy Compliance Checklist - always included, non-contractual guidance
  items.push({
    key: 'pre_tenancy_checklist_england',
    title: 'Pre-Tenancy Compliance Checklist (England)',
    description: 'Non-contractual guidance covering deposit protection, gas safety, EPC, EICR, How to Rent Guide, and Right to Rent requirements',
    category: 'Checklists',
    required: true,
  });

  items.push({
    key: 'deposit_protection_certificate',
    title: 'Deposit Protection Certificate',
    description: 'Standalone certificate confirming the tenancy deposit protection scheme details for the England tenancy pack',
    category: 'Guidance',
    required: true,
  });

  items.push({
    key: 'tenancy_deposit_information',
    title: 'Prescribed Information Pack',
    description: 'Standalone tenancy deposit prescribed information pack for England deposit compliance',
    category: 'Guidance',
    required: true,
  });

  if (tier === 'premium') {
    items.push(...getPremiumSupportPackItems('England'));
  }

  return items;
}

// =============================================================================
// WALES PACK CONTENTS
// =============================================================================

function getWalesNoticeOnlyContents(args: GetPackContentsArgs): PackItem[] {
  const { route, has_arrears, include_arrears_schedule } = args;

  // =========================================================================
  // JURISDICTION GUARD: Section 8 and Section 21 are NOT valid for Wales
  // Housing Act 1988 (Section 8/21) applies to ENGLAND ONLY.
  // Wales uses Renting Homes (Wales) Act 2016.
  // =========================================================================
  const INVALID_WALES_ROUTES = ['section_8', 'section_21', 'accelerated_possession', 'accelerated_section21'];
  if (route && INVALID_WALES_ROUTES.includes(route)) {
    console.warn(
      `[pack-contents] JURISDICTION ERROR: Route "${route}" is not valid for Wales. ` +
      `Section 8 and Section 21 (Housing Act 1988) apply to England only. ` +
      `Wales uses Section 173 (no-fault) or fault_based routes under Renting Homes (Wales) Act 2016.`
    );
    return []; // Return empty - invalid route for this jurisdiction
  }

  const items: PackItem[] = [];

  // Section 173 (No-Fault - 6 month notice) - Renting Homes (Wales) Act 2016
  if (route === 'section_173') {
    items.push({
      key: 'section173_notice',
      title: "Landlord's Notice (Section 173)",
      description: '6-month no-fault notice under Renting Homes (Wales) Act 2016',
      category: 'Notice',
      required: true,
    });
  }

  // Fault-based notice - Renting Homes (Wales) Act 2016
  if (route === 'fault_based') {
    items.push({
      key: 'fault_notice',
      title: 'Fault-Based Notice (RHW23)',
      description: 'Breach notice under Renting Homes (Wales) Act 2016',
      category: 'Notice',
      required: true,
    });
  }

  // Only add guidance documents if a valid Wales route was specified
  // (section_8/section_21 already blocked above with early return)
  if (!route || !['section_173', 'fault_based'].includes(route)) {
    // No valid notice route specified - return empty
    return [];
  }

  items.push({
    key: 'service_instructions',
    title: 'Service Instructions (Wales)',
    description: 'How to legally serve your notice in Wales',
    category: 'Guidance',
    required: true,
  });

  items.push({
    key: 'service_checklist',
    title: 'Service & Validity Checklist (Wales)',
    description: 'Renting Homes Act compliance check',
    category: 'Checklists',
    required: true,
  });

  // Arrears schedule for fault-based cases with rent arrears
  // Handle both 'fault_based' and 'wales_fault_based' route values
  const isFaultBased = route === 'fault_based' || route === 'wales_fault_based' || route === 'fault-based';
  if (isFaultBased && (has_arrears || include_arrears_schedule)) {
    items.push({
      key: 'arrears_schedule',
      title: 'Rent Arrears Schedule',
      description: 'Period-by-period breakdown of arrears',
      category: 'Evidence',
      required: false,
    });
  }

  return items;
}

function getWalesCompletePackContents(args: GetPackContentsArgs): PackItem[] {
  const items = getWalesNoticeOnlyContents(args);

  // If notice contents returned empty (invalid route), don't add court forms
  if (items.length === 0) {
    return [];
  }

  items.push({
    key: 'n5_claim',
    title: 'Form N5 - Claim for Possession',
    description: 'Possession claim form for County Court',
    category: 'Court forms',
    required: true,
  });

  items.push({
    key: 'n119_particulars',
    title: 'Form N119 - Particulars of Claim',
    description: 'Detailed grounds and evidence summary',
    category: 'Court forms',
    required: true,
  });

  items.push({
    key: 'court_filing_guide',
    title: 'Court Filing Guide (Wales)',
    description: 'County Court filing instructions',
    category: 'Guidance',
    required: true,
  });

  items.push({
    key: 'evidence_checklist',
    title: 'Evidence Collection Checklist',
    description: 'Required documents for your case',
    category: 'Checklists',
    required: true,
  });

  items.push({
    key: 'proof_of_service',
    title: 'Proof of Service Template',
    description: 'Certificate confirming notice delivery',
    category: 'Evidence',
    required: true,
  });

  return items;
}

/**
 * WALES OCCUPATION CONTRACT CONTENTS
 *
 * Product tiers:
 * - 'standard': Occupation contract with blank inventory template and compliance checklist
 * - 'premium': HMO-specific occupation contract with wizard-completed inventory and compliance checklist
 *
 * Legal Framework: Renting Homes (Wales) Act 2016, Housing Act 2004 (HMO)
 *
 * Terminology: Wales uses "Contract Holder" (not Tenant), "Occupation Contract" (not Tenancy)
 *
 * INTEGRATION LAYER REQUIREMENTS:
 * - Inventory: Always included (blank for standard, wizard-completed for premium)
 * - Compliance Checklist: Always included (Wales-specific, non-contractual guidance)
 * - Embedded Schedules: Property, Rent, Utilities, Inventory, House Rules
 */
function getWalesSOCContents(tier: 'standard' | 'premium', hasInventoryData?: boolean): PackItem[] {
  const items: PackItem[] = [];

  // Main Agreement
  if (tier === 'standard') {
    items.push({
      key: 'soc_agreement',
      title: 'Standard Occupation Contract',
      description: 'Solicitor-grade occupation contract with all embedded schedules. Compliant with Renting Homes (Wales) Act 2016.',
      category: 'Tenancy agreement',
      required: true,
    });
  } else {
    items.push({
      key: 'soc_agreement_hmo',
      title: 'Premium Occupation Contract',
      description: 'Broader drafting for shared households, HMOs, guarantor-backed lets, students, and other more complex Welsh occupation arrangements.',
      category: 'Tenancy agreement',
      required: true,
    });
  }

  // Inventory Schedule - tier and context-specific behaviour
  const inventoryTitle = tier === 'standard'
    ? 'Inventory & Schedule of Condition (Blank Template)'
    : hasInventoryData
      ? 'Inventory & Schedule of Condition (Wizard-Completed)'
      : 'Inventory & Schedule of Condition (Ready to Complete)';

  const inventoryDescription = tier === 'standard'
    ? 'Included as Schedule 4 inside the occupation contract (blank template)'
    : hasInventoryData
      ? 'Included as Schedule 4 inside the occupation contract (wizard-completed)'
      : 'Included as Schedule 4 inside the occupation contract (ready to complete)';

  items.push({
    key: 'inventory_schedule',
    title: inventoryTitle,
    description: inventoryDescription,
    category: 'Tenancy agreement',
    required: true,
  });

  // Pre-Tenancy Compliance Checklist - always included, non-contractual guidance
  items.push({
    key: 'pre_tenancy_checklist_wales',
    title: 'Pre-Tenancy Compliance Checklist (Wales)',
    description: 'Non-contractual guidance covering Rent Smart Wales registration, deposit protection, gas safety, EPC, and EICR requirements',
    category: 'Checklists',
    required: true,
  });

  if (tier === 'premium') {
    items.push(...getPremiumSupportPackItems('Wales'));
  }

  return items;
}

// =============================================================================
// SCOTLAND PACK CONTENTS
// =============================================================================

function getScotlandNoticeOnlyContents(args: GetPackContentsArgs): PackItem[] {
  const items: PackItem[] = [];
  const { has_arrears, include_arrears_schedule } = args;

  items.push({
    key: 'notice_to_leave',
    title: 'Notice to Leave',
    description: 'PRT notice under Private Housing Act 2016',
    category: 'Notice',
    required: true,
  });

  items.push({
    key: 'service_instructions',
    title: 'Service Instructions (Scotland)',
    description: 'How to legally serve your Notice to Leave',
    category: 'Guidance',
    required: true,
  });

  items.push({
    key: 'service_checklist',
    title: 'Service & Validity Checklist (Scotland)',
    description: 'PRT compliance verification',
    category: 'Checklists',
    required: true,
  });

  if (has_arrears || include_arrears_schedule) {
    items.push({
      key: 'arrears_schedule',
      title: 'Rent Arrears Schedule',
      description: 'Period-by-period breakdown of arrears',
      category: 'Evidence',
      required: false,
    });
  }

  return items;
}

function getScotlandCompletePackContents(args: GetPackContentsArgs): PackItem[] {
  const items = getScotlandNoticeOnlyContents(args);

  items.push({
    key: 'form_e_tribunal',
    title: 'Form E - Tribunal Application',
    description: 'First-tier Tribunal for Scotland application',
    category: 'Court forms',
    required: true,
  });

  items.push({
    key: 'tribunal_lodging_guide',
    title: 'Tribunal Lodging Guide',
    description: 'First-tier Tribunal filing instructions',
    category: 'Guidance',
    required: true,
  });

  items.push({
    key: 'evidence_checklist',
    title: 'Evidence Collection Checklist',
    description: 'Required documents for tribunal',
    category: 'Checklists',
    required: true,
  });

  items.push({
    key: 'proof_of_service',
    title: 'Proof of Service Template',
    description: 'Certificate confirming notice delivery',
    category: 'Evidence',
    required: true,
  });

  return items;
}

function getScotlandMoneyClaimContents(): PackItem[] {
  return [
    {
      key: 'form_3a',
      title: 'Form 3A - Simple Procedure Claim',
      description: 'Official Sheriff Court claim form',
      category: 'Court forms',
      required: true,
    },
    {
      key: 'statement_of_claim',
      title: 'Statement of Claim',
      description: 'Detailed claim narrative',
      category: 'Court forms',
      required: true,
    },
    {
      key: 'arrears_schedule',
      title: 'Schedule of Arrears',
      description: 'Period-by-period rent arrears breakdown',
      category: 'Evidence',
      required: true,
    },
    {
      key: 'interest_calculation',
      title: 'Interest Calculation',
      description: 'Statutory interest workings (8% default)',
      category: 'Evidence',
      required: false,
    },
    {
      key: 'pre_action_letter',
      title: 'Pre-Action Letter',
      description: 'Rule 3.1 compliant demand letter',
      category: 'Guidance',
      required: true,
    },
    {
      key: 'filing_guide',
      title: 'Simple Procedure Filing Guide',
      description: 'Sheriff Court lodging instructions',
      category: 'Guidance',
      required: true,
    },
    {
      key: 'enforcement_guide',
      title: 'Enforcement Guide - Diligence',
      description: 'Post-decree enforcement options',
      category: 'Guidance',
      required: true,
    },
  ];
}

/**
 * SCOTLAND PRIVATE RESIDENTIAL TENANCY CONTENTS
 *
 * Product tiers:
 * - 'standard': PRT agreement with blank inventory template and compliance checklist
 * - 'premium': HMO-specific PRT with wizard-completed inventory and compliance checklist
 *
 * Legal Framework: Private Housing (Tenancies) (Scotland) Act 2016
 *
 * Key differences from England:
 * - Open-ended tenancy (no fixed end date)
 * - Rent Pressure Zone compatibility required
 * - First-tier Tribunal for Scotland (not County Court)
 *
 * INTEGRATION LAYER REQUIREMENTS:
 * - Inventory: Always included (blank for standard, wizard-completed for premium)
 * - Compliance Checklist: Always included (Scotland-specific, non-contractual guidance)
 * - Embedded Schedules: Property, Rent, Utilities, Inventory, House Rules
 */
function getScotlandPRTContents(tier: 'standard' | 'premium', hasInventoryData?: boolean): PackItem[] {
  const items: PackItem[] = [];

  // Main Agreement
  if (tier === 'standard') {
    items.push({
      key: 'prt_agreement',
      title: 'Private Residential Tenancy Agreement',
      description: 'Solicitor-grade PRT agreement with all embedded schedules. Compliant with Private Housing (Tenancies) (Scotland) Act 2016.',
      category: 'Tenancy agreement',
      required: true,
    });
  } else {
    items.push({
      key: 'prt_agreement_hmo',
      title: 'Premium Private Residential Tenancy Agreement',
      description: 'Broader drafting for shared households, HMOs, guarantor-backed lets, students, and other more complex Scottish tenancy arrangements.',
      category: 'Tenancy agreement',
      required: true,
    });
  }

  // Inventory Schedule - tier and context-specific behaviour
  const inventoryTitle = tier === 'standard'
    ? 'Inventory & Schedule of Condition (Blank Template)'
    : hasInventoryData
      ? 'Inventory & Schedule of Condition (Wizard-Completed)'
      : 'Inventory & Schedule of Condition (Ready to Complete)';

  const inventoryDescription = tier === 'standard'
    ? 'Included as Schedule 4 inside the tenancy agreement (blank template)'
    : hasInventoryData
      ? 'Included as Schedule 4 inside the tenancy agreement (wizard-completed)'
      : 'Included as Schedule 4 inside the tenancy agreement (ready to complete)';

  items.push({
    key: 'inventory_schedule',
    title: inventoryTitle,
    description: inventoryDescription,
    category: 'Tenancy agreement',
    required: true,
  });

  // Pre-Tenancy Compliance Checklist - always included, non-contractual guidance
  items.push({
    key: 'pre_tenancy_checklist_scotland',
    title: 'Pre-Tenancy Compliance Checklist (Scotland)',
    description: 'Non-contractual guidance covering landlord registration, deposit protection, Repairing Standard, gas safety, and fire alarm requirements',
    category: 'Checklists',
    required: true,
  });

  // Easy Read Notes - Scotland-specific plain-language guide for tenants
  // Required under PRT as part of prescribed information
  items.push({
    key: 'easy_read_notes_scotland',
    title: 'Easy Read Notes (Scotland)',
    description: 'Plain-language guide explaining tenant rights and responsibilities under the Private Housing (Tenancies) (Scotland) Act 2016',
    category: 'Guidance',
    required: true,
  });

  if (tier === 'premium') {
    items.push(...getPremiumSupportPackItems('Scotland'));
  }

  return items;
}

// =============================================================================
// NORTHERN IRELAND PACK CONTENTS
// =============================================================================

/**
 * NORTHERN IRELAND PRIVATE TENANCY CONTENTS
 *
 * Product tiers:
 * - 'standard': Tenancy agreement with blank inventory template and compliance checklist
 * - 'premium': HMO-specific tenancy agreement with wizard-completed inventory and compliance checklist
 *
 * Legal Framework: Private Tenancies Act (Northern Ireland) 2022
 * (Updates the Private Tenancies (Northern Ireland) Order 2006)
 *
 * Key NI-specific requirements:
 * - Electrical safety mandatory from 1 April 2025
 * - Rent increase restrictions: 12-month gap, 3-month notice
 * - County Court Northern Ireland jurisdiction
 *
 * INTEGRATION LAYER REQUIREMENTS:
 * - Inventory: Always included (blank for standard, wizard-completed for premium)
 * - Compliance Checklist: Always included (NI-specific, non-contractual guidance)
 * - Embedded Schedules: Property, Rent, Utilities, Inventory, House Rules
 */
function getNorthernIrelandTenancyContents(tier: 'standard' | 'premium', hasInventoryData?: boolean): PackItem[] {
  const items: PackItem[] = [];

  // Main Agreement
  if (tier === 'standard') {
    items.push({
      key: 'private_tenancy_agreement',
      title: 'Private Tenancy Agreement',
      description: 'Solicitor-grade tenancy agreement with all embedded schedules. Compliant with Private Tenancies Act (NI) 2022.',
      category: 'Tenancy agreement',
      required: true,
    });
  } else {
    items.push({
      key: 'private_tenancy_agreement_hmo',
      title: 'Premium Private Tenancy Agreement',
      description: 'Broader drafting for shared households, HMOs, guarantor-backed lets, and other more complex Northern Ireland tenancy arrangements.',
      category: 'Tenancy agreement',
      required: true,
    });
  }

  // Inventory Schedule - tier and context-specific behaviour
  const inventoryTitle = tier === 'standard'
    ? 'Inventory & Schedule of Condition (Blank Template)'
    : hasInventoryData
      ? 'Inventory & Schedule of Condition (Wizard-Completed)'
      : 'Inventory & Schedule of Condition (Ready to Complete)';

  const inventoryDescription = tier === 'standard'
    ? 'Included as Schedule 4 inside the tenancy agreement (blank template)'
    : hasInventoryData
      ? 'Included as Schedule 4 inside the tenancy agreement (wizard-completed)'
      : 'Included as Schedule 4 inside the tenancy agreement (ready to complete)';

  items.push({
    key: 'inventory_schedule',
    title: inventoryTitle,
    description: inventoryDescription,
    category: 'Tenancy agreement',
    required: true,
  });

  // Pre-Tenancy Compliance Checklist - always included, non-contractual guidance
  items.push({
    key: 'pre_tenancy_checklist_northern_ireland',
    title: 'Pre-Tenancy Compliance Checklist (Northern Ireland)',
    description: 'Non-contractual guidance covering landlord registration, deposit protection, gas safety, EPC, and electrical safety (from April 2025)',
    category: 'Checklists',
    required: true,
  });

  if (tier === 'premium') {
    items.push(...getPremiumSupportPackItems('Northern Ireland'));
  }

  return items;
}

// =============================================================================
// MAIN EXPORT FUNCTION
// =============================================================================

/**
 * Get the list of documents included in a product purchase.
 *
 * @param args - Product, jurisdiction, and case-specific parameters
 * @returns Array of PackItem objects describing included documents
 */
export function getPackContents(args: GetPackContentsArgs): PackItem[] {
  const { product, jurisdiction, hasInventoryData } = args;

  // Normalize jurisdiction
  const jur = jurisdiction.toLowerCase();

  // ENGLAND
  if (jur === 'england') {
    switch (product) {
      case 'notice_only':
        return getEnglandNoticeOnlyContents(args);
      case 'complete_pack':
        return getEnglandCompletePackContents(args);
      case 'money_claim':
        return getEnglandMoneyClaimContents();
      case 'section13_standard':
      case 'section13_defensive':
        return getEnglandSection13Contents(product);
      case 'ast_standard':
        return getEnglandASTContents('standard', hasInventoryData);
      case 'ast_premium':
        return getEnglandASTContents('premium', hasInventoryData);
      default:
        return getEnglandResidentialLettingContents(args);
    }
  }

  // WALES
  if (jur === 'wales') {
    switch (product) {
      case 'notice_only':
        return getWalesNoticeOnlyContents(args);
      case 'complete_pack':
        return getWalesCompletePackContents(args);
      case 'ast_standard':
        return getWalesSOCContents('standard', hasInventoryData);
      case 'ast_premium':
        return getWalesSOCContents('premium', hasInventoryData);
      default:
        return [];
    }
  }

  // SCOTLAND
  if (jur === 'scotland') {
    switch (product) {
      case 'notice_only':
        return getScotlandNoticeOnlyContents(args);
      case 'complete_pack':
        return getScotlandCompletePackContents(args);
      case 'sc_money_claim':
        return getScotlandMoneyClaimContents();
      case 'ast_standard':
        return getScotlandPRTContents('standard', hasInventoryData);
      case 'ast_premium':
        return getScotlandPRTContents('premium', hasInventoryData);
      default:
        return [];
    }
  }

  // NORTHERN IRELAND
  if (jur === 'northern-ireland') {
    switch (product) {
      case 'ast_standard':
        return getNorthernIrelandTenancyContents('standard', hasInventoryData);
      case 'ast_premium':
        return getNorthernIrelandTenancyContents('premium', hasInventoryData);
      // Eviction and money claim not supported in NI yet
      case 'notice_only':
      case 'complete_pack':
      case 'money_claim':
      case 'section13_standard':
      case 'section13_defensive':
        return [];
      default:
        return [];
    }
  }

  return [];
}

/**
 * Check if a product is supported in a given jurisdiction.
 */
export function isProductSupported(product: string, jurisdiction: string): boolean {
  const jur = jurisdiction.toLowerCase();

  // Legacy tenancy aliases remain supported everywhere because non-England
  // jurisdictions still use the shared tiered tenancy abstraction.
  if (product === 'ast_standard' || product === 'ast_premium') {
    return true;
  }

  // Eviction products
  if (product === 'notice_only') {
    return jur !== 'northern-ireland';
  }

  if (product === 'complete_pack') {
    return jur === 'england';
  }

  // Money claim
  if (product === 'money_claim') {
    return jur === 'england';
  }

  if (product === 'sc_money_claim') {
    return false;
  }

  if (getEnglandResidentialLettingContents({ product, jurisdiction: jur }).length > 0) {
    return jur === 'england';
  }

  return false;
}
