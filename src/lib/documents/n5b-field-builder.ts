/**
 * N5B Field Builder - Canonical mapping layer for N5B form fields
 *
 * This module provides a single source of truth for mapping wizard facts
 * to N5B-specific CaseData fields. It handles:
 * - Alias resolution (multiple wizard keys → single CaseData field)
 * - Robust boolean parsing ("true/false", "yes/no", 1/0, undefined)
 * - NEGATIVE→POSITIVE framing inversion for Q9b-Q9g
 * - Validation of mandatory fields for court acceptance
 *
 * N5B Questions covered:
 * - Q9a-Q9g: AST verification (Statement of Truth - MANDATORY)
 * - Q10a: Notice service method (MANDATORY)
 * - Q15-Q18: Compliance dates (EPC, Gas Safety, How to Rent)
 * - Q19: Tenant Fees Act 2019 compliance
 * - Q20: Paper determination consent
 *
 * CRITICAL FRAMING NOTE:
 * The wizard asks Q9b-Q9g in NEGATIVE framing ("Confirm NO notice was served...")
 * to make it easy for landlords (they answer YES to confirm compliance).
 * But the PDF form uses POSITIVE framing ("HAS notice been given?").
 *
 * So when wizard has n5b_q9b_no_notice_not_ast = true (YES, confirmed NO notice),
 * we need n5b_q9b_has_notice_not_ast = false (NO, notice was NOT given).
 */

import type { CaseData } from './official-forms-filler';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * N5B-specific fields extracted from wizard facts
 */
export interface N5BFields {
  // Q9a-Q9g: AST Verification (MANDATORY)
  n5b_q9a_after_feb_1997?: boolean;
  n5b_q9b_has_notice_not_ast?: boolean;
  n5b_q9c_has_exclusion_clause?: boolean;
  n5b_q9d_is_agricultural_worker?: boolean;
  n5b_q9e_is_succession_tenancy?: boolean;
  n5b_q9f_was_secure_tenancy?: boolean;
  n5b_q9g_is_schedule_10?: boolean;

  // Q10a: Notice service method (MANDATORY)
  notice_service_method?: string;

  // Q15: EPC
  epc_provided?: boolean;
  epc_provided_date?: string;

  // Q16-Q17: Gas Safety
  has_gas_at_property?: boolean;
  gas_safety_before_occupation?: boolean;
  gas_safety_before_occupation_date?: string;
  gas_safety_check_date?: string;
  gas_safety_served_date?: string;
  gas_safety_service_dates?: string[];
  gas_safety_provided?: boolean;

  // Q18: How to Rent
  how_to_rent_provided?: boolean;
  how_to_rent_date?: string;
  how_to_rent_method?: 'hardcopy' | 'email';

  // Q19: Tenant Fees Act 2019
  n5b_q19_has_unreturned_prohibited_payment?: boolean;
  n5b_q19b_holding_deposit?: boolean;

  // Q20: Paper Determination
  n5b_q20_paper_determination?: boolean;
}

/**
 * Validation error for missing mandatory N5B fields
 */
export class N5BMissingFieldError extends Error {
  public readonly missingFields: string[];
  public readonly fieldLabels: Record<string, string>;

  constructor(missingFields: string[], fieldLabels: Record<string, string>) {
    const labels = missingFields.map(f => fieldLabels[f] || f);
    super(`N5B generation blocked: Missing mandatory answers for ${labels.join(', ')}`);
    this.name = 'N5BMissingFieldError';
    this.missingFields = missingFields;
    this.fieldLabels = fieldLabels;
  }
}

// =============================================================================
// WIZARD FIELD ALIASES - POSITIVE FRAMING (direct mapping)
// =============================================================================

/**
 * Fields that use POSITIVE framing in both wizard and CaseData.
 * These map directly without inversion.
 */
const POSITIVE_FRAMING_ALIASES: Record<string, string[]> = {
  // Q9a: Was tenancy created on or after 28 February 1997? (POSITIVE - YES is good)
  n5b_q9a_after_feb_1997: [
    'n5b_q9a_after_feb_1997',
    'ast_q9a_after_feb_1997',
    'q9a_after_feb_1997',
    'tenancy_after_feb_1997',
    'tenancy_post_1997',
    'is_post_feb_1997_tenancy',
    'ast_verification.after_feb_1997',
    'section21.q9a_after_feb_1997',
  ],

  // Q10a: Notice service method
  notice_service_method: [
    'notice_service_method',
    'section21_service_method',
    'service_method',
    'notice_service.service_method',
    'notice_service.method',
    'section21.notice_service_method',
    'section21.service_method',
    'delivery_method',
    'method_of_service',
  ],

  // Q15: EPC provided
  epc_provided: [
    'epc_provided',
    'has_epc_provided',
    'epc_given_to_tenant',
    'compliance.epc_provided',
    'section21.epc_provided',
    'epc_served',                // Actual wizard MQS field ID
    'section21.epc_served',      // Wizard maps_to alias
  ],

  epc_provided_date: [
    'epc_provided_date',
    'epc_date',
    'epc_given_date',
    'date_epc_provided',
    'compliance.epc_date',
    'section21.epc_date',
    'epc_certificate_date',           // Actual wizard MQS field ID
    'section21.epc_certificate_date', // Wizard maps_to alias
  ],

  // Q16-Q17: Gas Safety
  has_gas_at_property: [
    'has_gas_at_property',
    'property_has_gas',
    'gas_at_property',
    'gas_supply',
    'compliance.has_gas',
    'section21.has_gas',
    'has_gas_appliances',        // Actual wizard MQS field ID
  ],

  gas_safety_before_occupation: [
    'gas_safety_before_occupation',
    'gas_record_before_occupation',
    'gas_cert_before_move_in',
    'compliance.gas_before_occupation',
    'section21.gas_before_occupation',
  ],

  gas_safety_before_occupation_date: [
    'gas_safety_before_occupation_date',
    'gas_record_before_occupation_date',
    'gas_cert_before_move_in_date',
    'compliance.gas_before_occupation_date',
    'section21.gas_before_occupation_date',
  ],

  gas_safety_check_date: [
    'gas_safety_check_date',
    'gas_check_date',
    'gas_inspection_date',
    'gas_safety_cert_date',
    'compliance.gas_check_date',
    'compliance.gas_safety_cert_date',
    'section21.gas_check_date',
    'gas_cert_date',              // Actual wizard MQS field ID
    'section21.gas_cert_date',    // Wizard maps_to alias
  ],

  gas_safety_served_date: [
    'gas_safety_served_date',
    'gas_cert_served_date',
    'gas_record_served_date',
    'date_gas_cert_served',
    'compliance.gas_served_date',
    'section21.gas_served_date',
  ],

  gas_safety_service_dates: [
    'gas_safety_service_dates',
    'gas_cert_service_dates',
    'gas_record_service_dates',
    'compliance.gas_service_dates',
    'section21.gas_service_dates',
  ],

  gas_safety_provided: [
    'gas_safety_provided',
    'gas_certificate_provided',
    'gas_cert_provided',
    'has_gas_cert_provided',
    'compliance.gas_safety_cert_provided',
    'section21.gas_provided',
    'gas_cert_served',                   // MQS YAML field ID
    'gas_safety_cert_served',            // React component field ID
    'section21.gas_safety_cert_served',  // Wizard maps_to alias
  ],

  // Q18: How to Rent
  how_to_rent_provided: [
    'how_to_rent_provided',
    'htr_provided',
    'has_how_to_rent_provided',
    'compliance.how_to_rent_provided',
    'section21.how_to_rent_provided',
    'how_to_rent_served',             // Actual wizard MQS field ID
    'section21.how_to_rent_served',   // Wizard maps_to alias
  ],

  how_to_rent_date: [
    'how_to_rent_date',
    'htr_date',
    'date_how_to_rent_provided',
    'how_to_rent_provided_date',
    'compliance.how_to_rent_date',
    'section21.how_to_rent_date',
  ],

  how_to_rent_method: [
    'how_to_rent_method',
    'htr_method',
    'how_to_rent_delivery_method',
    'compliance.how_to_rent_method',
    'section21.how_to_rent_method',
  ],

  // Q20: Paper Determination (POSITIVE - direct mapping)
  n5b_q20_paper_determination: [
    'n5b_q20_paper_determination',
    'q20_paper_determination',
    'paper_determination_consent',
    'consent_to_paper_determination',
    'agree_paper_determination',
    'section21.q20_paper_determination',
  ],
};

// =============================================================================
// WIZARD FIELD ALIASES - NEGATIVE FRAMING (requires inversion)
// =============================================================================

/**
 * Fields where the wizard uses NEGATIVE framing but CaseData uses POSITIVE framing.
 *
 * Wizard asks: "Confirm NO notice was served stating this is NOT an AST?"
 * - User answers YES → they're confirming NO notice was served → has_notice_not_ast = false
 * - User answers NO → notice WAS served → has_notice_not_ast = true
 *
 * So we INVERT the wizard value: CaseData = !wizardValue
 */
const NEGATIVE_TO_POSITIVE_MAPPINGS: Record<string, {
  caseDataField: keyof N5BFields;
  wizardAliases: string[];
}> = {
  // Q9b: Wizard asks "Confirm NO notice was served..." → CaseData "HAS notice been given?"
  n5b_q9b: {
    caseDataField: 'n5b_q9b_has_notice_not_ast',
    wizardAliases: [
      'n5b_q9b_no_notice_not_ast',  // Actual wizard field ID from MQS
      'ast_q9b_no_notice_not_ast',
      'q9b_no_notice_not_ast',
      'no_notice_not_ast',
      'confirmed_no_notice_not_ast',
    ],
  },

  // Q9c: Wizard asks "Confirm agreement does NOT contain clause..." → CaseData "DOES contain clause?"
  n5b_q9c: {
    caseDataField: 'n5b_q9c_has_exclusion_clause',
    wizardAliases: [
      'n5b_q9c_no_exclusion_clause',  // Actual wizard field ID from MQS
      'ast_q9c_no_exclusion_clause',
      'q9c_no_exclusion_clause',
      'no_exclusion_clause',
      'confirmed_no_exclusion_clause',
    ],
  },

  // Q9d: Wizard asks "Confirm tenant is NOT agricultural worker..." → CaseData "IS agricultural worker?"
  n5b_q9d: {
    caseDataField: 'n5b_q9d_is_agricultural_worker',
    wizardAliases: [
      'n5b_q9d_not_agricultural_worker',  // Actual wizard field ID from MQS
      'ast_q9d_not_agricultural_worker',
      'q9d_not_agricultural_worker',
      'not_agricultural_worker',
      'confirmed_not_agricultural_worker',
    ],
  },

  // Q9e: Wizard asks "Confirm NOT succession tenancy..." → CaseData "IS succession tenancy?"
  n5b_q9e: {
    caseDataField: 'n5b_q9e_is_succession_tenancy',
    wizardAliases: [
      'n5b_q9e_not_succession_tenancy',  // Actual wizard field ID from MQS
      'ast_q9e_not_succession_tenancy',
      'q9e_not_succession_tenancy',
      'not_succession_tenancy',
      'confirmed_not_succession_tenancy',
    ],
  },

  // Q9f: Wizard asks "Confirm NOT formerly secure tenancy..." → CaseData "WAS secure tenancy?"
  n5b_q9f: {
    caseDataField: 'n5b_q9f_was_secure_tenancy',
    wizardAliases: [
      'n5b_q9f_not_former_secure',  // Actual wizard field ID from MQS
      'ast_q9f_not_former_secure',
      'q9f_not_former_secure',
      'not_former_secure',
      'confirmed_not_former_secure',
      'n5b_q9f_not_secure_tenancy',
    ],
  },

  // Q9g: Wizard asks "Confirm NOT Schedule 10 tenancy..." → CaseData "IS Schedule 10?"
  n5b_q9g: {
    caseDataField: 'n5b_q9g_is_schedule_10',
    wizardAliases: [
      'n5b_q9g_not_schedule_10',  // Actual wizard field ID from MQS
      'ast_q9g_not_schedule_10',
      'q9g_not_schedule_10',
      'not_schedule_10',
      'confirmed_not_schedule_10',
    ],
  },
};

/**
 * POSITIVE framing aliases for Q9b-Q9g (for cases where someone uses positive framing directly)
 */
const POSITIVE_Q9_ALIASES: Record<string, string[]> = {
  n5b_q9b_has_notice_not_ast: [
    'n5b_q9b_has_notice_not_ast',
    'ast_q9b_notice_not_ast',
    'q9b_has_notice_not_ast',
    'notice_not_ast_given',
    'has_notice_not_ast',
    'ast_verification.notice_not_ast',  // Nested path alias
    'section21.q9b_notice_not_ast',     // Nested path alias
  ],

  n5b_q9c_has_exclusion_clause: [
    'n5b_q9c_has_exclusion_clause',
    'ast_q9c_exclusion_clause',
    'q9c_has_exclusion_clause',
    'has_exclusion_clause',
    'ast_verification.exclusion_clause',  // Nested path alias
    'section21.q9c_exclusion_clause',     // Nested path alias
  ],

  n5b_q9d_is_agricultural_worker: [
    'n5b_q9d_is_agricultural_worker',
    'ast_q9d_agricultural_worker',
    'q9d_is_agricultural_worker',
    'is_agricultural_worker',
    'ast_verification.agricultural_worker',  // Nested path alias
    'section21.q9d_agricultural_worker',     // Nested path alias
  ],

  n5b_q9e_is_succession_tenancy: [
    'n5b_q9e_is_succession_tenancy',
    'ast_q9e_succession_tenancy',
    'q9e_is_succession_tenancy',
    'is_succession_tenancy',
    'ast_verification.succession_tenancy',  // Nested path alias
    'section21.q9e_succession_tenancy',     // Nested path alias
  ],

  n5b_q9f_was_secure_tenancy: [
    'n5b_q9f_was_secure_tenancy',
    'ast_q9f_secure_tenancy',
    'q9f_was_secure_tenancy',
    'was_secure_tenancy',
    'ast_verification.secure_tenancy',  // Nested path alias
    'section21.q9f_secure_tenancy',     // Nested path alias
  ],

  n5b_q9g_is_schedule_10: [
    'n5b_q9g_is_schedule_10',
    'ast_q9g_schedule_10',
    'q9g_is_schedule_10',
    'is_schedule_10',
    'ast_verification.schedule_10',  // Nested path alias
    'section21.q9g_schedule_10',     // Nested path alias
  ],
};

// =============================================================================
// Q19 SPECIAL HANDLING
// =============================================================================

/**
 * Q19 field aliases - note the wizard uses "prohibited_payment" not "unreturned_prohibited_payment"
 */
const Q19_ALIASES = {
  n5b_q19_has_unreturned_prohibited_payment: [
    'n5b_q19_has_unreturned_prohibited_payment',
    'n5b_q19_prohibited_payment',  // Actual wizard field ID from MQS
    'q19_prohibited_payment',
    'has_unreturned_prohibited_payment',
    'prohibited_payment_unreturned',
    'tenant_fees_act.unreturned_payment',
    'section21.q19_prohibited_payment',
  ],

  n5b_q19b_holding_deposit: [
    'n5b_q19b_holding_deposit',
    'q19b_holding_deposit',
    'holding_deposit_taken',
    'has_holding_deposit',
    'tenant_fees_act.holding_deposit',
    'section21.q19b_holding_deposit',
  ],
};

// =============================================================================
// UI-FRIENDLY FIELD LABELS
// =============================================================================

/**
 * Human-readable labels for N5B fields, suitable for error messages
 */
export const N5B_FIELD_LABELS: Record<string, string> = {
  n5b_q9a_after_feb_1997: 'Q9a: Was tenancy created on or after 28 February 1997?',
  n5b_q9b_has_notice_not_ast: 'Q9b: Has notice been given that this is not an AST?',
  n5b_q9c_has_exclusion_clause: 'Q9c: Does the agreement contain an AST exclusion clause?',
  n5b_q9d_is_agricultural_worker: 'Q9d: Is the tenant an agricultural worker?',
  n5b_q9e_is_succession_tenancy: 'Q9e: Did the tenancy arise by succession?',
  n5b_q9f_was_secure_tenancy: 'Q9f: Was this formerly a secure tenancy?',
  n5b_q9g_is_schedule_10: 'Q9g: Was the tenancy granted under Schedule 10 LGHA 1989?',
  notice_service_method: 'Q10a: How was the Section 21 notice served?',
  n5b_q19_has_unreturned_prohibited_payment: 'Q19: Has any unreturned prohibited payment been taken?',
  n5b_q20_paper_determination: 'Q20: Do you consent to paper determination?',
};

// =============================================================================
// BOOLEAN PARSING
// =============================================================================

/**
 * Parses a value to boolean, handling multiple formats.
 * Returns undefined if the value cannot be parsed or is genuinely undefined/null.
 *
 * Supported formats:
 * - Boolean: true/false
 * - String: "true"/"false", "yes"/"no", "y"/"n", "1"/"0"
 * - Number: 1/0
 *
 * @param value - The value to parse
 * @returns Parsed boolean or undefined
 */
export function parseN5BBoolean(value: unknown): boolean | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    if (value === 1) return true;
    if (value === 0) return false;
    return undefined;
  }

  if (typeof value === 'string') {
    const normalized = value.toLowerCase().trim();

    if (['true', 'yes', 'y', '1'].includes(normalized)) {
      return true;
    }

    if (['false', 'no', 'n', '0'].includes(normalized)) {
      return false;
    }
  }

  // Return undefined for unparseable values (preserves "not answered" state)
  return undefined;
}

// =============================================================================
// WIZARD VALUE RESOLUTION
// =============================================================================

/**
 * Gets a value from wizard facts, checking multiple possible paths.
 *
 * @param wizard - The wizard facts object
 * @param paths - Array of possible paths to check
 * @returns The first non-null/undefined value found, or undefined
 */
function getWizardValueFromPaths(wizard: Record<string, unknown>, paths: string[]): unknown {
  for (const path of paths) {
    // Try direct key lookup
    const directValue = wizard[path];
    if (directValue !== undefined && directValue !== null) {
      return directValue;
    }

    // Try nested path navigation (e.g., "notice_service.method")
    const parts = path.split('.');
    if (parts.length > 1) {
      let current: unknown = wizard;
      for (const part of parts) {
        if (current && typeof current === 'object' && part in (current as Record<string, unknown>)) {
          current = (current as Record<string, unknown>)[part];
        } else {
          current = undefined;
          break;
        }
      }
      if (current !== undefined && current !== null) {
        return current;
      }
    }
  }

  return undefined;
}

// =============================================================================
// N5B FIELD BUILDER
// =============================================================================

/**
 * Builds N5B-specific fields from wizard facts by resolving aliases.
 *
 * This is the canonical mapping layer - all N5B field resolution should
 * go through this function to ensure consistent handling of aliases
 * and boolean parsing.
 *
 * @param wizardFacts - Raw wizard facts object
 * @returns N5B-specific fields with resolved values
 */
export function buildN5BFields(wizardFacts: Record<string, unknown>): N5BFields {
  const fields: N5BFields = {};

  // ==========================================================================
  // DEBUG LOGGING - Log input wizard facts for N5B field resolution
  // ==========================================================================
  console.log('🔍 [N5B-BUILDER] buildN5BFields called with wizardFacts keys:', Object.keys(wizardFacts || {}));

  // Log specific N5B-relevant fields to help debug
  const n5bRelevantKeys = [
    'n5b_q9a_after_feb_1997', 'n5b_q9b_has_notice_not_ast', 'n5b_q9b_no_notice_not_ast',
    'n5b_q9c_has_exclusion_clause', 'n5b_q9c_no_exclusion_clause',
    'n5b_q9d_is_agricultural_worker', 'n5b_q9d_not_agricultural_worker',
    'n5b_q9e_is_succession_tenancy', 'n5b_q9e_not_succession_tenancy',
    'n5b_q9f_was_secure_tenancy', 'n5b_q9f_not_former_secure',
    'n5b_q9g_is_schedule_10', 'n5b_q9g_not_schedule_10',
    'epc_served', 'epc_provided', 'epc_provided_date', 'epc_certificate_date',
    'has_gas_appliances', 'has_gas_at_property', 'gas_safety_cert_served', 'gas_cert_served', 'gas_safety_provided',
    'how_to_rent_served', 'how_to_rent_provided', 'how_to_rent_date',
    'n5b_q19_has_unreturned_prohibited_payment', 'n5b_q19_prohibited_payment',
    'n5b_q19b_holding_deposit', 'n5b_q20_paper_determination',
    'notice_service_method',
  ];

  const foundN5BFields: Record<string, unknown> = {};
  for (const key of n5bRelevantKeys) {
    if (wizardFacts && wizardFacts[key] !== undefined) {
      foundN5BFields[key] = wizardFacts[key];
    }
  }
  // Also check section21.* nested paths
  if (wizardFacts && typeof wizardFacts.section21 === 'object' && wizardFacts.section21 !== null) {
    foundN5BFields['section21'] = wizardFacts.section21;
  }
  console.log('🔍 [N5B-BUILDER] Found N5B-relevant fields:', JSON.stringify(foundN5BFields, null, 2));

  // =========================================================================
  // Q9a: Tenancy after 28 Feb 1997 (POSITIVE framing - direct mapping)
  // =========================================================================
  fields.n5b_q9a_after_feb_1997 = parseN5BBoolean(
    getWizardValueFromPaths(wizardFacts, POSITIVE_FRAMING_ALIASES.n5b_q9a_after_feb_1997)
  );

  // =========================================================================
  // Q9b-Q9g: NEGATIVE→POSITIVE INVERSION
  // =========================================================================
  // The wizard asks these questions in NEGATIVE framing (easier for landlords).
  // We need to INVERT the values to get POSITIVE framing for the PDF.
  //
  // Example for Q9b:
  // - Wizard: "Confirm NO notice was served stating NOT an AST?" → YES
  // - Means: No notice was served
  // - CaseData: n5b_q9b_has_notice_not_ast = false (notice was NOT given)
  //
  // INVERSION LOGIC:
  // 1. First check for NEGATIVE framed wizard fields (the actual MQS field IDs)
  // 2. If found, INVERT the boolean value
  // 3. If not found, check for POSITIVE framed aliases (direct mapping)
  // =========================================================================

  // Q9b: Has notice been given that this is NOT an AST?
  const q9bNegative = parseN5BBoolean(
    getWizardValueFromPaths(wizardFacts, NEGATIVE_TO_POSITIVE_MAPPINGS.n5b_q9b.wizardAliases)
  );
  if (q9bNegative !== undefined) {
    // INVERT: wizard YES (confirmed no notice) → CaseData false (no notice given)
    fields.n5b_q9b_has_notice_not_ast = !q9bNegative;
  } else {
    // Try positive framing aliases (direct mapping)
    fields.n5b_q9b_has_notice_not_ast = parseN5BBoolean(
      getWizardValueFromPaths(wizardFacts, POSITIVE_Q9_ALIASES.n5b_q9b_has_notice_not_ast)
    );
  }

  // Q9c: Does tenancy agreement contain an exclusion clause?
  const q9cNegative = parseN5BBoolean(
    getWizardValueFromPaths(wizardFacts, NEGATIVE_TO_POSITIVE_MAPPINGS.n5b_q9c.wizardAliases)
  );
  if (q9cNegative !== undefined) {
    // INVERT: wizard YES (confirmed no clause) → CaseData false (no clause exists)
    fields.n5b_q9c_has_exclusion_clause = !q9cNegative;
  } else {
    fields.n5b_q9c_has_exclusion_clause = parseN5BBoolean(
      getWizardValueFromPaths(wizardFacts, POSITIVE_Q9_ALIASES.n5b_q9c_has_exclusion_clause)
    );
  }

  // Q9d: Is the defendant an agricultural worker?
  const q9dNegative = parseN5BBoolean(
    getWizardValueFromPaths(wizardFacts, NEGATIVE_TO_POSITIVE_MAPPINGS.n5b_q9d.wizardAliases)
  );
  if (q9dNegative !== undefined) {
    // INVERT: wizard YES (confirmed NOT agricultural) → CaseData false (is NOT agricultural)
    fields.n5b_q9d_is_agricultural_worker = !q9dNegative;
  } else {
    fields.n5b_q9d_is_agricultural_worker = parseN5BBoolean(
      getWizardValueFromPaths(wizardFacts, POSITIVE_Q9_ALIASES.n5b_q9d_is_agricultural_worker)
    );
  }

  // Q9e: Did tenancy arise by succession?
  const q9eNegative = parseN5BBoolean(
    getWizardValueFromPaths(wizardFacts, NEGATIVE_TO_POSITIVE_MAPPINGS.n5b_q9e.wizardAliases)
  );
  if (q9eNegative !== undefined) {
    // INVERT: wizard YES (confirmed NOT succession) → CaseData false (is NOT succession)
    fields.n5b_q9e_is_succession_tenancy = !q9eNegative;
  } else {
    fields.n5b_q9e_is_succession_tenancy = parseN5BBoolean(
      getWizardValueFromPaths(wizardFacts, POSITIVE_Q9_ALIASES.n5b_q9e_is_succession_tenancy)
    );
  }

  // Q9f: Was the tenancy formerly a secure tenancy?
  const q9fNegative = parseN5BBoolean(
    getWizardValueFromPaths(wizardFacts, NEGATIVE_TO_POSITIVE_MAPPINGS.n5b_q9f.wizardAliases)
  );
  if (q9fNegative !== undefined) {
    // INVERT: wizard YES (confirmed NOT former secure) → CaseData false (was NOT secure)
    fields.n5b_q9f_was_secure_tenancy = !q9fNegative;
  } else {
    fields.n5b_q9f_was_secure_tenancy = parseN5BBoolean(
      getWizardValueFromPaths(wizardFacts, POSITIVE_Q9_ALIASES.n5b_q9f_was_secure_tenancy)
    );
  }

  // Q9g: Was tenancy granted under Schedule 10 of LGHA 1989?
  const q9gNegative = parseN5BBoolean(
    getWizardValueFromPaths(wizardFacts, NEGATIVE_TO_POSITIVE_MAPPINGS.n5b_q9g.wizardAliases)
  );
  if (q9gNegative !== undefined) {
    // INVERT: wizard YES (confirmed NOT schedule 10) → CaseData false (is NOT schedule 10)
    fields.n5b_q9g_is_schedule_10 = !q9gNegative;
  } else {
    fields.n5b_q9g_is_schedule_10 = parseN5BBoolean(
      getWizardValueFromPaths(wizardFacts, POSITIVE_Q9_ALIASES.n5b_q9g_is_schedule_10)
    );
  }

  // =========================================================================
  // Q10a: Notice service method (string - direct mapping)
  // =========================================================================
  const serviceMethod = getWizardValueFromPaths(
    wizardFacts,
    POSITIVE_FRAMING_ALIASES.notice_service_method
  );
  if (typeof serviceMethod === 'string' && serviceMethod.trim()) {
    fields.notice_service_method = serviceMethod.trim();
  }

  // =========================================================================
  // Q15: EPC (direct mapping)
  // =========================================================================
  fields.epc_provided = parseN5BBoolean(
    getWizardValueFromPaths(wizardFacts, POSITIVE_FRAMING_ALIASES.epc_provided)
  );
  const epcDate = getWizardValueFromPaths(wizardFacts, POSITIVE_FRAMING_ALIASES.epc_provided_date);
  if (typeof epcDate === 'string' && epcDate.trim()) {
    fields.epc_provided_date = epcDate.trim();
  }

  // =========================================================================
  // Q16-Q17: Gas Safety (direct mapping)
  // =========================================================================
  fields.has_gas_at_property = parseN5BBoolean(
    getWizardValueFromPaths(wizardFacts, POSITIVE_FRAMING_ALIASES.has_gas_at_property)
  );
  fields.gas_safety_before_occupation = parseN5BBoolean(
    getWizardValueFromPaths(wizardFacts, POSITIVE_FRAMING_ALIASES.gas_safety_before_occupation)
  );

  const gasBeforeDate = getWizardValueFromPaths(
    wizardFacts,
    POSITIVE_FRAMING_ALIASES.gas_safety_before_occupation_date
  );
  if (typeof gasBeforeDate === 'string' && gasBeforeDate.trim()) {
    fields.gas_safety_before_occupation_date = gasBeforeDate.trim();
  }

  const gasCheckDate = getWizardValueFromPaths(
    wizardFacts,
    POSITIVE_FRAMING_ALIASES.gas_safety_check_date
  );
  if (typeof gasCheckDate === 'string' && gasCheckDate.trim()) {
    fields.gas_safety_check_date = gasCheckDate.trim();
  }

  const gasServedDate = getWizardValueFromPaths(
    wizardFacts,
    POSITIVE_FRAMING_ALIASES.gas_safety_served_date
  );
  if (typeof gasServedDate === 'string' && gasServedDate.trim()) {
    fields.gas_safety_served_date = gasServedDate.trim();
  }

  const gasServiceDates = getWizardValueFromPaths(
    wizardFacts,
    POSITIVE_FRAMING_ALIASES.gas_safety_service_dates
  );
  if (Array.isArray(gasServiceDates)) {
    fields.gas_safety_service_dates = gasServiceDates.filter(
      (d): d is string => typeof d === 'string' && d.trim().length > 0
    );
  }

  fields.gas_safety_provided = parseN5BBoolean(
    getWizardValueFromPaths(wizardFacts, POSITIVE_FRAMING_ALIASES.gas_safety_provided)
  );

  // =========================================================================
  // Q18: How to Rent (direct mapping)
  // =========================================================================
  fields.how_to_rent_provided = parseN5BBoolean(
    getWizardValueFromPaths(wizardFacts, POSITIVE_FRAMING_ALIASES.how_to_rent_provided)
  );

  const htrDate = getWizardValueFromPaths(wizardFacts, POSITIVE_FRAMING_ALIASES.how_to_rent_date);
  if (typeof htrDate === 'string' && htrDate.trim()) {
    fields.how_to_rent_date = htrDate.trim();
  }

  const htrMethod = getWizardValueFromPaths(wizardFacts, POSITIVE_FRAMING_ALIASES.how_to_rent_method);
  if (typeof htrMethod === 'string') {
    const normalizedMethod = htrMethod.toLowerCase().trim();
    if (normalizedMethod === 'hardcopy' || normalizedMethod === 'hard copy' || normalizedMethod === 'hard_copy') {
      fields.how_to_rent_method = 'hardcopy';
    } else if (normalizedMethod === 'email' || normalizedMethod === 'e-mail') {
      fields.how_to_rent_method = 'email';
    }
  }

  // =========================================================================
  // Q19: Tenant Fees Act 2019 (direct mapping with special field name)
  // =========================================================================
  fields.n5b_q19_has_unreturned_prohibited_payment = parseN5BBoolean(
    getWizardValueFromPaths(wizardFacts, Q19_ALIASES.n5b_q19_has_unreturned_prohibited_payment)
  );

  // Q19b: Holding deposit - handle select values
  const q19bValue = getWizardValueFromPaths(wizardFacts, Q19_ALIASES.n5b_q19b_holding_deposit);
  if (typeof q19bValue === 'string') {
    // Handle select options: "no", "yes_compliant", "yes_breach"
    const normalized = q19bValue.toLowerCase().trim();
    if (normalized === 'no') {
      fields.n5b_q19b_holding_deposit = false;
    } else if (normalized === 'yes_compliant' || normalized === 'yes_breach' || normalized === 'yes') {
      fields.n5b_q19b_holding_deposit = true;
    }
  } else {
    fields.n5b_q19b_holding_deposit = parseN5BBoolean(q19bValue);
  }

  // =========================================================================
  // Q20: Paper Determination (direct mapping)
  // =========================================================================
  fields.n5b_q20_paper_determination = parseN5BBoolean(
    getWizardValueFromPaths(wizardFacts, POSITIVE_FRAMING_ALIASES.n5b_q20_paper_determination)
  );

  // ==========================================================================
  // DEBUG LOGGING - Log output N5B fields
  // ==========================================================================
  console.log('🔍 [N5B-BUILDER] buildN5BFields output:', JSON.stringify({
    n5b_q9a_after_feb_1997: fields.n5b_q9a_after_feb_1997,
    n5b_q9b_has_notice_not_ast: fields.n5b_q9b_has_notice_not_ast,
    n5b_q9c_has_exclusion_clause: fields.n5b_q9c_has_exclusion_clause,
    n5b_q9d_is_agricultural_worker: fields.n5b_q9d_is_agricultural_worker,
    n5b_q9e_is_succession_tenancy: fields.n5b_q9e_is_succession_tenancy,
    n5b_q9f_was_secure_tenancy: fields.n5b_q9f_was_secure_tenancy,
    n5b_q9g_is_schedule_10: fields.n5b_q9g_is_schedule_10,
    notice_service_method: fields.notice_service_method,
    epc_provided: fields.epc_provided,
    epc_provided_date: fields.epc_provided_date,
    has_gas_at_property: fields.has_gas_at_property,
    gas_safety_provided: fields.gas_safety_provided,
    gas_safety_check_date: fields.gas_safety_check_date,
    how_to_rent_provided: fields.how_to_rent_provided,
    how_to_rent_date: fields.how_to_rent_date,
    n5b_q19_has_unreturned_prohibited_payment: fields.n5b_q19_has_unreturned_prohibited_payment,
    n5b_q19b_holding_deposit: fields.n5b_q19b_holding_deposit,
    n5b_q20_paper_determination: fields.n5b_q20_paper_determination,
  }, null, 2));

  return fields;
}

// =============================================================================
// N5B VALIDATION
// =============================================================================

/**
 * Mandatory fields for N5B generation.
 * Courts WILL reject N5B claims with missing Q9a-Q9g, Q10a, Q19, Q20 answers.
 */
const N5B_MANDATORY_FIELDS: (keyof N5BFields)[] = [
  'n5b_q9a_after_feb_1997',
  'n5b_q9b_has_notice_not_ast',
  'n5b_q9c_has_exclusion_clause',
  'n5b_q9d_is_agricultural_worker',
  'n5b_q9e_is_succession_tenancy',
  'n5b_q9f_was_secure_tenancy',
  'n5b_q9g_is_schedule_10',
  'notice_service_method',
  'n5b_q19_has_unreturned_prohibited_payment',
  'n5b_q20_paper_determination',
];

/**
 * Validates that all mandatory N5B fields are present.
 * Throws N5BMissingFieldError if any mandatory fields are missing.
 *
 * @param fields - The N5B fields to validate
 * @throws N5BMissingFieldError if mandatory fields are missing
 */
export function validateN5BMandatoryFields(fields: N5BFields): void {
  const missing: string[] = [];

  for (const field of N5B_MANDATORY_FIELDS) {
    const value = fields[field];
    if (value === undefined || value === null || value === '') {
      missing.push(field);
    }
  }

  if (missing.length > 0) {
    throw new N5BMissingFieldError(missing, N5B_FIELD_LABELS);
  }
}

/**
 * Checks if all mandatory N5B fields are present without throwing.
 *
 * @param fields - The N5B fields to check
 * @returns Object with isValid flag and list of missing fields
 */
export function checkN5BMandatoryFields(fields: N5BFields): {
  isValid: boolean;
  missingFields: string[];
  missingLabels: string[];
} {
  const missingFields: string[] = [];
  const missingLabels: string[] = [];

  for (const field of N5B_MANDATORY_FIELDS) {
    const value = fields[field];
    if (value === undefined || value === null || value === '') {
      missingFields.push(field);
      missingLabels.push(N5B_FIELD_LABELS[field] || field);
    }
  }

  return {
    isValid: missingFields.length === 0,
    missingFields,
    missingLabels,
  };
}

// =============================================================================
// MERGE INTO CASE DATA
// =============================================================================

/**
 * Merges N5B fields into CaseData, only setting fields that have values.
 * Does not overwrite existing CaseData values with undefined.
 *
 * @param caseData - Existing CaseData object
 * @param n5bFields - N5B fields to merge
 * @returns CaseData with N5B fields merged
 */
export function mergeN5BFieldsIntoCaseData(
  caseData: Partial<CaseData>,
  n5bFields: N5BFields
): Partial<CaseData> {
  const merged = { ...caseData };

  // Only merge fields that have defined values
  for (const [key, value] of Object.entries(n5bFields)) {
    if (value !== undefined) {
      (merged as Record<string, unknown>)[key] = value;
    }
  }

  return merged;
}

// =============================================================================
// CONVENIENCE FUNCTION
// =============================================================================

/**
 * Builds and validates N5B fields from wizard facts in one call.
 * This is the recommended entry point for N5B field building.
 *
 * @param wizardFacts - Raw wizard facts object
 * @param options - Options for validation
 * @param options.skipValidation - If true, skip mandatory field validation
 * @returns Built N5B fields
 * @throws N5BMissingFieldError if validation fails and skipValidation is false
 */
export function buildAndValidateN5BFields(
  wizardFacts: Record<string, unknown>,
  options: { skipValidation?: boolean } = {}
): N5BFields {
  const fields = buildN5BFields(wizardFacts);

  if (!options.skipValidation) {
    validateN5BMandatoryFields(fields);
  }

  return fields;
}

// =============================================================================
// DEV INSTRUMENTATION
// =============================================================================

/**
 * Logs which N5B fields are defined vs undefined for debugging.
 * Only logs in development mode.
 *
 * @param fields - The N5B fields to log
 * @param context - Optional context string for the log
 */
export function logN5BFieldStatus(fields: N5BFields, context?: string): void {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  const defined: string[] = [];
  const undefinedFields: string[] = [];

  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined && value !== null && value !== '') {
      defined.push(`${key}=${JSON.stringify(value)}`);
    } else {
      undefinedFields.push(key);
    }
  }

  console.log(`[N5B Fields${context ? ` - ${context}` : ''}]`);
  console.log(`  Defined (${defined.length}): ${defined.join(', ') || '(none)'}`);
  console.log(`  Undefined (${undefinedFields.length}): ${undefinedFields.join(', ') || '(none)'}`);
}
