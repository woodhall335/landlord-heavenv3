/**
 * Pack Contents - Single Source of Truth
 *
 * Returns the list of documents included in a product purchase
 * based on product type, jurisdiction, and route.
 */

export type PackItemCategory =
  | 'Notice'
  | 'Court forms'
  | 'Checklists'
  | 'Guidance'
  | 'Evidence'
  | 'Tenancy agreement'
  | 'Other';

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
  /** Product SKU: notice_only | complete_pack | money_claim | sc_money_claim | ast_standard | ast_premium */
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
}

// =============================================================================
// ENGLAND PACK CONTENTS
// =============================================================================

function getEnglandNoticeOnlyContents(args: GetPackContentsArgs): PackItem[] {
  const items: PackItem[] = [];
  const { route, has_arrears, include_arrears_schedule } = args;

  // Section 21 (No-Fault)
  if (route === 'section_21') {
    items.push({
      key: 'section21_notice',
      title: 'Section 21 Notice (Form 6A)',
      description: 'Official no-fault possession notice',
      category: 'Notice',
      required: true,
    });
  }

  // Section 8 (Grounds-Based)
  if (route === 'section_8') {
    items.push({
      key: 'section8_notice',
      title: 'Section 8 Notice (Form 3)',
      description: 'Grounds-based possession notice',
      category: 'Notice',
      required: true,
    });
  }

  // Common items
  items.push({
    key: 'service_instructions',
    title: 'Service Instructions',
    description: 'How to legally serve your notice',
    category: 'Guidance',
    required: true,
  });

  items.push({
    key: 'service_checklist',
    title: 'Service & Validity Checklist',
    description: 'Ensure your notice is legally compliant',
    category: 'Checklists',
    required: true,
  });

  // Arrears schedule for Section 8 rent arrears cases
  if (route === 'section_8' && (has_arrears || include_arrears_schedule)) {
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

function getEnglandCompletePackContents(args: GetPackContentsArgs): PackItem[] {
  const items = getEnglandNoticeOnlyContents(args);
  const { route } = args;

  // Section 21 uses accelerated procedure
  if (route === 'section_21') {
    items.push({
      key: 'n5b_claim',
      title: 'Form N5B - Accelerated Possession Claim',
      description: 'Fast-track court claim form',
      category: 'Court forms',
      required: true,
    });
  }

  // Section 8 uses standard procedure
  if (route === 'section_8') {
    items.push({
      key: 'n5_claim',
      title: 'Form N5 - Claim for Possession',
      description: 'Standard possession claim form',
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
  }

  // Common complete pack items
  items.push({
    key: 'witness_statement',
    title: 'Witness Statement',
    description: 'AI-drafted statement for court',
    category: 'Evidence',
    required: true,
  });

  items.push({
    key: 'court_filing_guide',
    title: 'Court Filing Guide',
    description: 'Step-by-step County Court filing instructions',
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

function getEnglandASTContents(tier: 'standard' | 'premium'): PackItem[] {
  const items: PackItem[] = [
    {
      key: 'ast_agreement',
      title: 'Assured Shorthold Tenancy Agreement',
      description: 'Government-compliant tenancy contract',
      category: 'Tenancy agreement',
      required: true,
    },
    {
      key: 'terms_schedule',
      title: 'Terms & Conditions Schedule',
      description: 'Detailed tenancy terms',
      category: 'Tenancy agreement',
      required: true,
    },
    {
      key: 'model_clauses',
      title: 'Government Model Clauses',
      description: 'Prescribed statutory clauses',
      category: 'Tenancy agreement',
      required: true,
    },
    {
      key: 'inventory_template',
      title: 'Inventory Template',
      description: 'Property contents checklist',
      category: 'Checklists',
      required: true,
    },
  ];

  if (tier === 'premium') {
    items.push({
      key: 'key_schedule',
      title: 'Key Schedule',
      description: 'Record of keys provided',
      category: 'Checklists',
      required: true,
    });
    items.push({
      key: 'maintenance_guide',
      title: 'Property Maintenance Guide',
      description: 'Maintenance responsibilities and procedures',
      category: 'Guidance',
      required: true,
    });
    items.push({
      key: 'checkout_procedure',
      title: 'Checkout Procedure',
      description: 'End of tenancy process guide',
      category: 'Guidance',
      required: true,
    });
  }

  return items;
}

// =============================================================================
// WALES PACK CONTENTS
// =============================================================================

function getWalesNoticeOnlyContents(args: GetPackContentsArgs): PackItem[] {
  const items: PackItem[] = [];
  const { route, has_arrears, include_arrears_schedule } = args;

  // Section 173 (No-Fault - 6 month notice)
  if (route === 'section_173') {
    items.push({
      key: 'section173_notice',
      title: "Landlord's Notice (Section 173)",
      description: '6-month no-fault notice under Renting Homes Act',
      category: 'Notice',
      required: true,
    });
  }

  // Fault-based notice
  if (route === 'fault_based') {
    items.push({
      key: 'fault_notice',
      title: 'Fault-Based Notice (RHW23)',
      description: 'Breach notice under Renting Homes Act',
      category: 'Notice',
      required: true,
    });
  }

  // Section 8 equivalent in Wales
  if (route === 'section_8') {
    items.push({
      key: 'section8_notice',
      title: 'Possession Notice (Form 3)',
      description: 'Grounds-based possession notice',
      category: 'Notice',
      required: true,
    });
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

  if ((route === 'section_8' || route === 'fault_based') && (has_arrears || include_arrears_schedule)) {
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

function getWalesSOCContents(tier: 'standard' | 'premium'): PackItem[] {
  const items: PackItem[] = [
    {
      key: 'soc_agreement',
      title: 'Standard Occupation Contract',
      description: 'Renting Homes (Wales) Act compliant contract',
      category: 'Tenancy agreement',
      required: true,
    },
    {
      key: 'terms_schedule',
      title: 'Terms & Conditions Schedule',
      description: 'Detailed occupation terms',
      category: 'Tenancy agreement',
      required: true,
    },
    {
      key: 'model_clauses',
      title: 'Government Model Clauses',
      description: 'Prescribed statutory clauses (Wales)',
      category: 'Tenancy agreement',
      required: true,
    },
    {
      key: 'inventory_template',
      title: 'Inventory Template',
      description: 'Property contents checklist',
      category: 'Checklists',
      required: true,
    },
  ];

  if (tier === 'premium') {
    items.push({
      key: 'key_schedule',
      title: 'Key Schedule',
      description: 'Record of keys provided',
      category: 'Checklists',
      required: true,
    });
    items.push({
      key: 'maintenance_guide',
      title: 'Property Maintenance Guide',
      description: 'Maintenance responsibilities and procedures',
      category: 'Guidance',
      required: true,
    });
    items.push({
      key: 'checkout_procedure',
      title: 'Checkout Procedure',
      description: 'End of tenancy process guide',
      category: 'Guidance',
      required: true,
    });
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

function getScotlandPRTContents(tier: 'standard' | 'premium'): PackItem[] {
  const items: PackItem[] = [
    {
      key: 'prt_agreement',
      title: 'Private Residential Tenancy Agreement',
      description: 'PRT compliant under Scottish law',
      category: 'Tenancy agreement',
      required: true,
    },
    {
      key: 'terms_schedule',
      title: 'Terms & Conditions Schedule',
      description: 'Detailed tenancy terms',
      category: 'Tenancy agreement',
      required: true,
    },
    {
      key: 'model_clauses',
      title: 'Model Clauses (Scotland)',
      description: 'Scottish Government prescribed terms',
      category: 'Tenancy agreement',
      required: true,
    },
    {
      key: 'inventory_template',
      title: 'Inventory Template',
      description: 'Property contents checklist',
      category: 'Checklists',
      required: true,
    },
  ];

  if (tier === 'premium') {
    items.push({
      key: 'key_schedule',
      title: 'Key Schedule',
      description: 'Record of keys provided',
      category: 'Checklists',
      required: true,
    });
    items.push({
      key: 'maintenance_guide',
      title: 'Property Maintenance Guide',
      description: 'Maintenance responsibilities and procedures',
      category: 'Guidance',
      required: true,
    });
    items.push({
      key: 'checkout_procedure',
      title: 'Checkout Procedure',
      description: 'End of tenancy process guide',
      category: 'Guidance',
      required: true,
    });
  }

  return items;
}

// =============================================================================
// NORTHERN IRELAND PACK CONTENTS
// =============================================================================

function getNorthernIrelandTenancyContents(tier: 'standard' | 'premium'): PackItem[] {
  const items: PackItem[] = [
    {
      key: 'private_tenancy_agreement',
      title: 'Private Tenancy Agreement',
      description: 'Private Tenancies (NI) Order 2006 compliant',
      category: 'Tenancy agreement',
      required: true,
    },
    {
      key: 'terms_schedule',
      title: 'Terms & Conditions Schedule',
      description: 'Detailed tenancy terms',
      category: 'Tenancy agreement',
      required: true,
    },
    {
      key: 'model_clauses',
      title: 'Model Clauses (Northern Ireland)',
      description: 'NI prescribed statutory terms',
      category: 'Tenancy agreement',
      required: true,
    },
    {
      key: 'inventory_template',
      title: 'Inventory Template',
      description: 'Property contents checklist',
      category: 'Checklists',
      required: true,
    },
  ];

  if (tier === 'premium') {
    items.push({
      key: 'key_schedule',
      title: 'Key Schedule',
      description: 'Record of keys provided',
      category: 'Checklists',
      required: true,
    });
    items.push({
      key: 'maintenance_guide',
      title: 'Property Maintenance Guide',
      description: 'Maintenance responsibilities and procedures',
      category: 'Guidance',
      required: true,
    });
    items.push({
      key: 'checkout_procedure',
      title: 'Checkout Procedure',
      description: 'End of tenancy process guide',
      category: 'Guidance',
      required: true,
    });
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
  const { product, jurisdiction, route } = args;

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
      case 'ast_standard':
        return getEnglandASTContents('standard');
      case 'ast_premium':
        return getEnglandASTContents('premium');
      default:
        return [];
    }
  }

  // WALES
  if (jur === 'wales') {
    switch (product) {
      case 'notice_only':
        return getWalesNoticeOnlyContents(args);
      case 'complete_pack':
        return getWalesCompletePackContents(args);
      case 'money_claim':
        // Wales uses same forms as England
        return getEnglandMoneyClaimContents();
      case 'ast_standard':
        return getWalesSOCContents('standard');
      case 'ast_premium':
        return getWalesSOCContents('premium');
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
      case 'money_claim': // Fallback for generic money_claim in Scotland
        return getScotlandMoneyClaimContents();
      case 'ast_standard':
        return getScotlandPRTContents('standard');
      case 'ast_premium':
        return getScotlandPRTContents('premium');
      default:
        return [];
    }
  }

  // NORTHERN IRELAND
  if (jur === 'northern-ireland') {
    switch (product) {
      case 'ast_standard':
        return getNorthernIrelandTenancyContents('standard');
      case 'ast_premium':
        return getNorthernIrelandTenancyContents('premium');
      // Eviction and money claim not supported in NI yet
      case 'notice_only':
      case 'complete_pack':
      case 'money_claim':
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

  // Tenancy agreements supported everywhere
  if (product === 'ast_standard' || product === 'ast_premium') {
    return true;
  }

  // Eviction products
  if (product === 'notice_only' || product === 'complete_pack') {
    return jur !== 'northern-ireland';
  }

  // Money claim
  if (product === 'money_claim') {
    return jur === 'england' || jur === 'wales';
  }

  if (product === 'sc_money_claim') {
    return jur === 'scotland';
  }

  return false;
}
