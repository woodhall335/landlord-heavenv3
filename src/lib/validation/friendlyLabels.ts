/**
 * Friendly Labels for Validation Issues
 *
 * Maps fact keys to user-friendly labels and action phrases.
 * Used to display clear, non-technical messages in the compliance panel.
 */

export interface FriendlyLabel {
  /** Short action phrase: "Add the tenant's full name" */
  action: string;
  /** Question label for "Go to: X" links */
  questionLabel: string;
  /** Category for grouping */
  category: 'tenant' | 'landlord' | 'property' | 'tenancy' | 'deposit' | 'compliance' | 'notice' | 'other';
}

/**
 * Mapping from fact keys to friendly labels
 */
export const FACT_KEY_LABELS: Record<string, FriendlyLabel> = {
  // Tenant details
  tenant_full_name: {
    action: "Add the tenant's full name",
    questionLabel: "Tenant's full name",
    category: 'tenant',
  },

  // Landlord details
  landlord_full_name: {
    action: "Add your full name",
    questionLabel: "Your name",
    category: 'landlord',
  },
  landlord_address_line1: {
    action: "Add your address",
    questionLabel: "Your address",
    category: 'landlord',
  },
  landlord_city: {
    action: "Add your town or city",
    questionLabel: "Your address",
    category: 'landlord',
  },
  landlord_postcode: {
    action: "Add your postcode",
    questionLabel: "Your address",
    category: 'landlord',
  },

  // Property details
  property_address_line1: {
    action: "Add the property address",
    questionLabel: "Property address",
    category: 'property',
  },
  property_city: {
    action: "Add the property town or city",
    questionLabel: "Property address",
    category: 'property',
  },
  property_postcode: {
    action: "Add the property postcode",
    questionLabel: "Property address",
    category: 'property',
  },

  // Tenancy details
  tenancy_start_date: {
    action: "Add when the tenancy started",
    questionLabel: "Tenancy start date",
    category: 'tenancy',
  },
  rent_amount: {
    action: "Add the rent amount",
    questionLabel: "Rent details",
    category: 'tenancy',
  },
  rent_frequency: {
    action: "Add how often rent is paid",
    questionLabel: "Rent details",
    category: 'tenancy',
  },
  is_fixed_term: {
    action: "Confirm if this is a fixed term tenancy",
    questionLabel: "Tenancy type",
    category: 'tenancy',
  },
  fixed_term_end_date: {
    action: "Add the fixed term end date",
    questionLabel: "Fixed term end date",
    category: 'tenancy',
  },

  // Deposit & compliance (S21-critical)
  deposit_taken: {
    action: "Confirm if a deposit was taken",
    questionLabel: "Deposit details",
    category: 'deposit',
  },
  deposit_amount: {
    action: "Add the deposit amount",
    questionLabel: "Deposit details",
    category: 'deposit',
  },
  deposit_protected: {
    action: "Confirm the deposit is protected in a government scheme",
    questionLabel: "Deposit protection",
    category: 'deposit',
  },
  prescribed_info_given: {
    action: "Confirm prescribed information was given to the tenant",
    questionLabel: "Deposit compliance",
    category: 'deposit',
  },

  // Gas safety
  has_gas_appliances: {
    action: "Confirm if the property has gas appliances",
    questionLabel: "Gas safety",
    category: 'compliance',
  },
  gas_safety_cert_date: {
    action: "Add the gas safety certificate date",
    questionLabel: "Gas safety certificate",
    category: 'compliance',
  },
  gas_safety_cert_provided: {
    action: "Confirm the gas safety certificate was provided",
    questionLabel: "Gas safety compliance",
    category: 'compliance',
  },

  // EPC
  epc_provided: {
    action: "Confirm the EPC was provided to the tenant",
    questionLabel: "EPC compliance",
    category: 'compliance',
  },

  // How to Rent
  how_to_rent_given: {
    action: "Confirm the 'How to Rent' guide was provided",
    questionLabel: "How to Rent guide",
    category: 'compliance',
  },
  how_to_rent_guide_provided: {
    action: "Confirm the 'How to Rent' guide was provided",
    questionLabel: "How to Rent guide",
    category: 'compliance',
  },

  // Notice details
  notice_expiry_date: {
    action: "Set the notice expiry date",
    questionLabel: "Notice service",
    category: 'notice',
  },
  notice_service_date: {
    action: "Set when the notice will be served",
    questionLabel: "Notice service",
    category: 'notice',
  },

  // Grounds (S8/Scotland)
  ground_codes: {
    action: "Select the grounds for eviction",
    questionLabel: "Eviction grounds",
    category: 'notice',
  },
  section8_grounds: {
    action: "Select the Section 8 grounds",
    questionLabel: "Section 8 grounds",
    category: 'notice',
  },

  // Wales-specific
  rent_smart_wales_registered: {
    action: "Confirm you are registered with Rent Smart Wales",
    questionLabel: "Rent Smart Wales",
    category: 'compliance',
  },
  wales_contract_category: {
    action: "Select the contract category",
    questionLabel: "Contract type",
    category: 'tenancy',
  },

  // Route selection
  selected_notice_route: {
    action: "Select the type of notice",
    questionLabel: "Notice type",
    category: 'notice',
  },
};

/**
 * Get a friendly action phrase for a fact key
 * @param factKey The raw fact key (e.g., "tenant_full_name")
 * @returns A user-friendly action phrase
 */
export function getFriendlyAction(factKey: string): string {
  const label = FACT_KEY_LABELS[factKey];
  if (label) {
    return label.action;
  }
  // Fallback: Convert snake_case to readable text
  return `Provide ${factKey.replace(/_/g, ' ')}`;
}

/**
 * Get a friendly question label for navigation
 * @param factKey The raw fact key (e.g., "tenant_full_name")
 * @returns A user-friendly question label
 */
export function getQuestionLabel(factKey: string): string {
  const label = FACT_KEY_LABELS[factKey];
  if (label) {
    return label.questionLabel;
  }
  // Fallback: Convert snake_case to readable text
  return factKey.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Get the category for a fact key
 * @param factKey The raw fact key
 * @returns The category for grouping
 */
export function getFactCategory(factKey: string): FriendlyLabel['category'] {
  return FACT_KEY_LABELS[factKey]?.category || 'other';
}

/**
 * Transform a validation issue's user_fix_hint to use friendly labels
 * @param userFixHint The original hint (e.g., "Please answer the question \"tenant_details\" to provide tenant_full_name")
 * @param fields The fields array from the issue
 * @returns A user-friendly hint
 */
export function transformUserFixHint(userFixHint: string | undefined, fields: string[]): string {
  // If no hint, use the first field to generate one
  if (!userFixHint && fields.length > 0) {
    return getFriendlyAction(fields[0]);
  }

  if (!userFixHint) {
    return 'Complete the required information';
  }

  // Check if this is the standard pattern: "Please answer the question X to provide Y"
  const standardPattern = /Please answer the question "([^"]+)" to provide (.+)/;
  const match = userFixHint.match(standardPattern);

  if (match) {
    const factKey = match[2].trim();
    return getFriendlyAction(factKey);
  }

  // Check for "Required information missing: X" pattern
  const missingPattern = /Required information missing: (.+)/;
  const missingMatch = userFixHint.match(missingPattern);

  if (missingMatch) {
    const factKey = missingMatch[1].trim();
    return getFriendlyAction(factKey);
  }

  // Check for "Missing required fact: X" pattern (internal)
  const internalPattern = /Missing required fact: (.+)/;
  const internalMatch = userFixHint.match(internalPattern);

  if (internalMatch) {
    const factKey = internalMatch[1].split(' ')[0].trim();
    return getFriendlyAction(factKey);
  }

  // If no pattern matched, try to find any known fact key in the hint
  for (const factKey of Object.keys(FACT_KEY_LABELS)) {
    if (userFixHint.includes(factKey)) {
      return getFriendlyAction(factKey);
    }
  }

  // Return original hint if no transformation possible
  return userFixHint;
}

/**
 * Decision engine issue code to friendly action mapping
 */
export const DECISION_ISSUE_LABELS: Record<string, { action: string; legalReason: string }> = {
  DEPOSIT_NOT_PROTECTED: {
    action: "Confirm the deposit is protected in a government scheme",
    legalReason: "Section 21 notices are invalid if the deposit is not protected under the Housing Act 2004.",
  },
  PRESCRIBED_INFO_NOT_GIVEN: {
    action: "Confirm prescribed information was provided to the tenant",
    legalReason: "Landlords must provide prescribed information about the deposit protection within 30 days.",
  },
  GAS_SAFETY_NOT_PROVIDED: {
    action: "Confirm the gas safety certificate was provided",
    legalReason: "A valid gas safety certificate must be provided before serving a Section 21 notice.",
  },
  HOW_TO_RENT_NOT_PROVIDED: {
    action: "Confirm the 'How to Rent' guide was provided",
    legalReason: "The 'How to Rent' guide must be provided to tenants in England.",
  },
  EPC_NOT_PROVIDED: {
    action: "Confirm the EPC was provided to the tenant",
    legalReason: "A valid Energy Performance Certificate must be provided before serving a Section 21 notice.",
  },
  DEPOSIT_EXCEEDS_CAP: {
    action: "Check the deposit amount against the legal cap",
    legalReason: "Under the Tenant Fees Act 2019, deposits are capped at 5 weeks' rent (6 weeks for rent over £50k/year).",
  },
  'S21-DEPOSIT-CAP-EXCEEDED': {
    action: "Confirm you have refunded/reduced the deposit to within the legal cap, or use Section 8 instead",
    legalReason: "Under the Tenant Fees Act 2019, deposits are capped at 5 weeks' rent (6 weeks for rent over £50k/year). For Section 21 to be valid, the deposit must be within this limit.",
  },
  SECTION21_DEPOSIT_CAP_EXCEEDED: {
    action: "Confirm you have refunded/reduced the deposit to within the legal cap",
    legalReason: "Under the Tenant Fees Act 2019, deposits are capped at 5 weeks' rent (6 weeks for rent over £50k/year). Section 21 is invalid if the tenant is holding a deposit above the cap.",
  },
  RENT_SMART_NOT_REGISTERED: {
    action: "Confirm you are registered with Rent Smart Wales",
    legalReason: "Landlords in Wales must be registered with Rent Smart Wales to serve valid notices.",
  },
  CONTRACT_TYPE_INCOMPATIBLE: {
    action: "Check the contract type is compatible with this notice",
    legalReason: "Different contract types in Wales have different notice requirements under the Renting Homes Act.",
  },
};

/**
 * Get a friendly action for a decision engine issue code
 */
export function getDecisionIssueAction(code: string): string {
  const label = DECISION_ISSUE_LABELS[code];
  if (label) {
    return label.action;
  }
  // Fallback: Convert code to readable text
  return code.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Get the legal reason for a decision engine issue code
 */
export function getDecisionIssueLegalReason(code: string): string | undefined {
  return DECISION_ISSUE_LABELS[code]?.legalReason;
}
