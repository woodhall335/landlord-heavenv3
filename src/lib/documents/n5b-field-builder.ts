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
 * N5B Questions covered (expanded to match newer N5B layouts):
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
 *
 * NOTE: We keep this interface focused on fields that are either:
 * - Directly mapped into N5B PDF answers, OR
 * - Required by court acceptance rules (depending on the form version)
 *
 * If the official PDF changes, update BOTH:
 * - this builder (facts → CaseData keys)
 * - official-forms-filler.ts (CaseData keys → PDF field names)
 */
export interface N5BFields {
  // ---------------------------------------------------------------------------
  // Q9a-Q9g: AST Verification (MANDATORY)
  // ---------------------------------------------------------------------------
  n5b_q9a_after_feb_1997?: boolean;
  n5b_q9b_has_notice_not_ast?: boolean;
  n5b_q9c_has_exclusion_clause?: boolean;
  n5b_q9d_is_agricultural_worker?: boolean;
  n5b_q9e_is_succession_tenancy?: boolean;
  n5b_q9f_was_secure_tenancy?: boolean;
  n5b_q9g_is_schedule_10?: boolean;

  // ---------------------------------------------------------------------------
  // Q10a: Notice service method (MANDATORY)
  // ---------------------------------------------------------------------------
  notice_service_method?: string;

  // ---------------------------------------------------------------------------
  // Licensing (newer N5B versions: often around Q11)
  // ---------------------------------------------------------------------------
  n5b_property_requires_licence?: boolean; // Is property required to be licensed?
  n5b_has_valid_licence?: boolean;         // If yes, is there a valid licence?
  n5b_licensing_decision_outstanding?: boolean; // Is a decision outstanding / TEN?

  // ---------------------------------------------------------------------------
  // Property condition / retaliatory eviction section (often Q15a–k in newer PDFs)
  // "Has claimant been served with a relevant notice...?"
  // ---------------------------------------------------------------------------
  n5b_property_condition_notice_served?: boolean;
  n5b_property_condition_notice_date?: string; // date notice served (YYYY-MM-DD)
  n5b_property_condition_notice_suspended?: boolean;
  n5b_property_condition_suspension_ended?: boolean;
  n5b_property_condition_suspension_end_date?: string;
  n5b_property_condition_notice_revoked?: boolean;
  n5b_property_condition_notice_quashed?: boolean;
  n5b_property_condition_non_revoke_reversed?: boolean;
  n5b_property_condition_action_reversed?: boolean;
  n5b_property_condition_defendant_complained_before_notice?: boolean;
  n5b_property_condition_due_to_defendant_breach?: boolean;
  n5b_property_condition_on_market_for_sale?: boolean;
  n5b_claimant_is_social_housing_provider?: boolean;
  n5b_claimant_is_mortgagee_pre_tenancy?: boolean;

  // ---------------------------------------------------------------------------
  // Compliance (EPC / Gas / HTR) - your existing mapping
  // ---------------------------------------------------------------------------
  epc_provided?: boolean;
  epc_provided_date?: string;

  has_gas_at_property?: boolean;
  gas_safety_before_occupation?: boolean;
  gas_safety_before_occupation_date?: string;
  gas_safety_check_date?: string;
  gas_safety_served_date?: string;
  gas_safety_service_dates?: string[];
  gas_safety_provided?: boolean;

  how_to_rent_provided?: boolean;
  how_to_rent_date?: string;
  how_to_rent_method?: 'hardcopy' | 'email';

  // ---------------------------------------------------------------------------
  // Tenant Fees Act 2019
  // ---------------------------------------------------------------------------
  n5b_q19_has_unreturned_prohibited_payment?: boolean;
  n5b_q19b_holding_deposit?: boolean;

  // ---------------------------------------------------------------------------
  // Paper Determination
  // ---------------------------------------------------------------------------
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

  // Licensing
  n5b_property_requires_licence: [
    'n5b_property_requires_licence',
    'property_requires_licence',
    'requires_licence',
    'licensing.required',
    'licensing.is_required',
    'section21.licensing_required',
    'hmo.requires_licence',
    'selective_licensing.requires_licence',
  ],
  n5b_has_valid_licence: [
    'n5b_has_valid_licence',
    'has_valid_licence',
    'valid_licence',
    'licensing.has_valid_licence',
    'licensing.valid_licence',
    'section21.has_valid_licence',
  ],
  n5b_licensing_decision_outstanding: [
    'n5b_licensing_decision_outstanding',
    'licensing_decision_outstanding',
    'licensing.pending_decision',
    'licensing.ten_outstanding',
    'temporary_exemption_notice_outstanding',
    'section21.licensing_decision_outstanding',
  ],

  // Property condition / retaliation section (Q15a-k style)
  n5b_property_condition_notice_served: [
    'n5b_property_condition_notice_served',
    'property_condition.notice_served',
    'retaliation.notice_served',
    'housing_act_2004.notice_served',
    'section21.property_condition_notice_served',
  ],
  n5b_property_condition_notice_date: [
    'n5b_property_condition_notice_date',
    'property_condition.notice_date',
    'retaliation.notice_date',
    'housing_act_2004.notice_date',
    'section21.property_condition_notice_date',
  ],
  n5b_property_condition_notice_suspended: [
    'n5b_property_condition_notice_suspended',
    'property_condition.notice_suspended',
    'retaliation.notice_suspended',
    'housing_act_2004.notice_suspended',
  ],
  n5b_property_condition_suspension_ended: [
    'n5b_property_condition_suspension_ended',
    'property_condition.suspension_ended',
    'retaliation.suspension_ended',
  ],
  n5b_property_condition_suspension_end_date: [
    'n5b_property_condition_suspension_end_date',
    'property_condition.suspension_end_date',
    'retaliation.suspension_end_date',
  ],
  n5b_property_condition_notice_revoked: [
    'n5b_property_condition_notice_revoked',
    'property_condition.notice_revoked',
    'retaliation.notice_revoked',
  ],
  n5b_property_condition_notice_quashed: [
    'n5b_property_condition_notice_quashed',
    'property_condition.notice_quashed',
    'retaliation.notice_quashed',
  ],
  n5b_property_condition_non_revoke_reversed: [
    'n5b_property_condition_non_revoke_reversed',
    'property_condition.non_revoke_reversed',
    'retaliation.non_revoke_reversed',
  ],
  n5b_property_condition_action_reversed: [
    'n5b_property_condition_action_reversed',
    'property_condition.action_reversed',
    'retaliation.action_reversed',
  ],
  n5b_property_condition_defendant_complained_before_notice: [
    'n5b_property_condition_defendant_complained_before_notice',
    'property_condition.defendant_complained_before_notice',
    'retaliation.defendant_complained_before_notice',
  ],
  n5b_property_condition_due_to_defendant_breach: [
    'n5b_property_condition_due_to_defendant_breach',
    'property_condition.due_to_defendant_breach',
    'retaliation.due_to_defendant_breach',
  ],
  n5b_property_condition_on_market_for_sale: [
    'n5b_property_condition_on_market_for_sale',
    'property_condition.on_market_for_sale',
    'retaliation.on_market_for_sale',
  ],
  n5b_claimant_is_social_housing_provider: [
    'n5b_claimant_is_social_housing_provider',
    'claimant_is_social_housing_provider',
    'social_housing.is_provider',
    'claimant.social_housing_provider',
  ],
  n5b_claimant_is_mortgagee_pre_tenancy: [
    'n5b_claimant_is_mortgagee_pre_tenancy',
    'claimant_is_mortgagee_pre_tenancy',
    'mortgagee.pre_tenancy',
    'claimant.mortgagee_pre_tenancy',
  ],

  // EPC
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

  // Gas
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
    'gas_safety_provided_date',
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
    'gas_cert_served',                   // Actual wizard MQS field ID
    'section21.gas_safety_cert_served',  // Wizard maps_to alias
  ],

  // HTR
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
  // Mandatory block (classic)
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

  // Newer-form sections (shown in your paste)
  n5b_property_requires_licence: 'Licensing: Is the property required to be licensed?',
  n5b_has_valid_licence: 'Licensing: Is there a valid licence?',
  n5b_licensing_decision_outstanding: 'Licensing: Is a decision outstanding / TEN?',

  n5b_property_condition_notice_served: 'Property condition: Has a relevant notice been served?',
  n5b_property_condition_notice_date: 'Property condition: On what date was the notice served?',
};

// =============================================================================
// BOOLEAN + VALUE UNWRAPPING
// =============================================================================

/**
 * If a wizard answer is stored as { value: ... } (or similar),
 * unwrap it. If not an object, returns the input unchanged.
 */
function unwrapWizardAnswer(value: unknown): unknown {
  if (!value || typeof value !== 'object') return value;

  const rec = value as Record<string, unknown>;

  // Common patterns
  if ('value' in rec) return rec.value;
  if ('answer' in rec) return rec.answer;
  if ('selected' in rec) return rec.selected;

  return value;
}

/**
 * Parses a value to boolean, handling multiple formats.
 * Returns undefined if the value cannot be parsed or is genuinely undefined/null/empty-string.
 */
export function parseN5BBoolean(value: unknown): boolean | undefined {
  if (value === undefined || value === null) return undefined;

  const unwrapped = unwrapWizardAnswer(value);

  if (unwrapped === undefined || unwrapped === null) return undefined;

  if (typeof unwrapped === 'boolean') return unwrapped;

  if (typeof unwrapped === 'number') {
    if (unwrapped === 1) return true;
    if (unwrapped === 0) return false;
    return undefined;
  }

  if (typeof unwrapped === 'string') {
    const normalized = unwrapped.toLowerCase().trim();
    if (normalized === '') return undefined;

    if (['true', 'yes', 'y', '1'].includes(normalized)) return true;
    if (['false', 'no', 'n', '0'].includes(normalized)) return false;
  }

  return undefined;
}

/**
 * Normalizes a date-ish string. We keep this intentionally conservative:
 * - If it's a string and non-empty, return trimmed string.
 * - No parsing/formatting here; the PDF filler should format/split as needed.
 */
function parseDateString(value: unknown): string | undefined {
  const unwrapped = unwrapWizardAnswer(value);

  if (typeof unwrapped !== 'string') return undefined;
  const trimmed = unwrapped.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

/**
 * Normalizes a non-empty string (for service method etc).
 */
function parseNonEmptyString(value: unknown): string | undefined {
  const unwrapped = unwrapWizardAnswer(value);

  if (typeof unwrapped !== 'string') return undefined;
  const trimmed = unwrapped.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

// =============================================================================
// WIZARD VALUE RESOLUTION
// =============================================================================

/**
 * Gets a value from wizard facts, checking multiple possible paths.
 * Returns the first non-null/undefined value found (empty strings are treated as missing).
 */
function getWizardValueFromPaths(wizard: Record<string, unknown>, paths: string[]): unknown {
  for (const path of paths) {
    // Direct
    const directValue = wizard[path];
    if (directValue !== undefined && directValue !== null) {
      const unwrapped = unwrapWizardAnswer(directValue);
      if (unwrapped !== '' && unwrapped !== undefined && unwrapped !== null) return directValue;
    }

    // Nested "a.b.c"
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
        const unwrapped = unwrapWizardAnswer(current);
        if (unwrapped !== '' && unwrapped !== undefined && unwrapped !== null) return current;
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
 */
export function buildN5BFields(wizardFacts: Record<string, unknown>): N5BFields {
  const fields: N5BFields = {};

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
    fields.gas_safety_service_dates = gasServiceDates
      .map(unwrapWizardAnswer)
      .filter((d): d is string => typeof d === 'string' && d.trim().length > 0)
      .map(d => d.trim());
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

  return fields;
}

// =============================================================================
// N5B VALIDATION
// =============================================================================

/**
 * Mandatory fields for N5B generation (classic set).
 *
 * NOTE:
 * - This reflects the “courts reject missing answers” rule for Q9/Q10/Q19/Q20.
 * - Newer N5B PDFs may also require licensing/retaliation sections depending on answers.
 *   Those rules should live in the PDF-filler validator (contextual validation).
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

export function mergeN5BFieldsIntoCaseData(
  caseData: Partial<CaseData>,
  n5bFields: N5BFields,
): Partial<CaseData> {
  const merged = { ...caseData };

  for (const [key, value] of Object.entries(n5bFields)) {
    if (value !== undefined) {
      (merged as Record<string, unknown>)[key] = value;
    }
  }

  return merged;
}

// =============================================================================
// CONVENIENCE
// =============================================================================

export function buildAndValidateN5BFields(
  wizardFacts: Record<string, unknown>,
  options: { skipValidation?: boolean } = {},
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

export function logN5BFieldStatus(fields: N5BFields, context?: string): void {
  if (process.env.NODE_ENV !== 'development') return;

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
