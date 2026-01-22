/**
 * N5B Field Builder - Canonical mapping layer for N5B form fields
 *
 * This module provides a single source of truth for mapping wizard facts
 * to N5B-specific CaseData fields. It handles:
 * - Alias resolution (multiple wizard keys → single CaseData field)
 * - Robust boolean parsing ("true/false", "yes/no", 1/0, undefined)
 * - Unwrapping common wizard answer shapes (e.g. { value: "yes" })
 * - Validation of mandatory fields for court acceptance (where required)
 *
 * N5B Questions covered (expanded to match newer N5B layouts):
 * - Q9a-Q9g: AST verification (Statement of Truth - MANDATORY)
 * - Q10a: Notice service method (MANDATORY)
 * - Licensing: HMO/Selective, valid licence, pending decision/TEN (if asked in wizard)
 * - Property condition / retaliation notices: Q15a–k (if asked in wizard)
 * - Compliance dates (EPC, Gas Safety, How to Rent)
 * - Tenant Fees Act 2019 compliance
 * - Paper determination consent
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
// WIZARD FIELD ALIASES
// =============================================================================

/**
 * Mapping of wizard field aliases to canonical N5BFields keys.
 * Each canonical field may have multiple wizard aliases.
 *
 * Notes:
 * - Include both flat keys and dotted paths for nested wizard structures
 * - Keep the canonical key FIRST if the wizard already uses it
 */
const N5B_WIZARD_ALIASES: Record<keyof N5BFields, string[]> = {
  // Q9a
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

  // Q9b
  n5b_q9b_has_notice_not_ast: [
    'n5b_q9b_has_notice_not_ast',
    'ast_q9b_notice_not_ast',
    'q9b_has_notice_not_ast',
    'notice_not_ast_given',
    'has_notice_not_ast',
    'ast_verification.notice_not_ast',
    'section21.q9b_notice_not_ast',
  ],

  // Q9c
  n5b_q9c_has_exclusion_clause: [
    'n5b_q9c_has_exclusion_clause',
    'ast_q9c_exclusion_clause',
    'q9c_has_exclusion_clause',
    'has_exclusion_clause',
    'tenancy_exclusion_clause',
    'ast_verification.exclusion_clause',
    'section21.q9c_exclusion_clause',
  ],

  // Q9d
  n5b_q9d_is_agricultural_worker: [
    'n5b_q9d_is_agricultural_worker',
    'ast_q9d_agricultural_worker',
    'q9d_is_agricultural_worker',
    'is_agricultural_worker',
    'tenant_is_agricultural_worker',
    'ast_verification.agricultural_worker',
    'section21.q9d_agricultural_worker',
  ],

  // Q9e
  n5b_q9e_is_succession_tenancy: [
    'n5b_q9e_is_succession_tenancy',
    'ast_q9e_succession_tenancy',
    'q9e_is_succession_tenancy',
    'is_succession_tenancy',
    'tenancy_by_succession',
    'ast_verification.succession_tenancy',
    'section21.q9e_succession_tenancy',
  ],

  // Q9f
  n5b_q9f_was_secure_tenancy: [
    'n5b_q9f_was_secure_tenancy',
    'ast_q9f_secure_tenancy',
    'q9f_was_secure_tenancy',
    'was_secure_tenancy',
    'former_secure_tenancy',
    'ast_verification.secure_tenancy',
    'section21.q9f_secure_tenancy',
  ],

  // Q9g
  n5b_q9g_is_schedule_10: [
    'n5b_q9g_is_schedule_10',
    'ast_q9g_schedule_10',
    'q9g_is_schedule_10',
    'is_schedule_10',
    'schedule_10_tenancy',
    'ast_verification.schedule_10',
    'section21.q9g_schedule_10',
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
  ],
  epc_provided_date: [
    'epc_provided_date',
    'epc_date',
    'epc_given_date',
    'date_epc_provided',
    'compliance.epc_date',
    'section21.epc_date',
  ],

  // Gas
  has_gas_at_property: [
    'has_gas_at_property',
    'property_has_gas',
    'gas_at_property',
    'gas_supply',
    'compliance.has_gas',
    'section21.has_gas',
    'has_gas_appliances',
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
    'most_recent_gas_safety_check_date',
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
  ],

  // HTR
  how_to_rent_provided: [
    'how_to_rent_provided',
    'htr_provided',
    'has_how_to_rent_provided',
    'compliance.how_to_rent_provided',
    'section21.how_to_rent_provided',
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

  // Tenant Fees Act
  n5b_q19_has_unreturned_prohibited_payment: [
    'n5b_q19_has_unreturned_prohibited_payment',
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

  // Paper determination
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

  // Q9a-Q9g
  fields.n5b_q9a_after_feb_1997 = parseN5BBoolean(
    getWizardValueFromPaths(wizardFacts, N5B_WIZARD_ALIASES.n5b_q9a_after_feb_1997),
  );
  fields.n5b_q9b_has_notice_not_ast = parseN5BBoolean(
    getWizardValueFromPaths(wizardFacts, N5B_WIZARD_ALIASES.n5b_q9b_has_notice_not_ast),
  );
  fields.n5b_q9c_has_exclusion_clause = parseN5BBoolean(
    getWizardValueFromPaths(wizardFacts, N5B_WIZARD_ALIASES.n5b_q9c_has_exclusion_clause),
  );
  fields.n5b_q9d_is_agricultural_worker = parseN5BBoolean(
    getWizardValueFromPaths(wizardFacts, N5B_WIZARD_ALIASES.n5b_q9d_is_agricultural_worker),
  );
  fields.n5b_q9e_is_succession_tenancy = parseN5BBoolean(
    getWizardValueFromPaths(wizardFacts, N5B_WIZARD_ALIASES.n5b_q9e_is_succession_tenancy),
  );
  fields.n5b_q9f_was_secure_tenancy = parseN5BBoolean(
    getWizardValueFromPaths(wizardFacts, N5B_WIZARD_ALIASES.n5b_q9f_was_secure_tenancy),
  );
  fields.n5b_q9g_is_schedule_10 = parseN5BBoolean(
    getWizardValueFromPaths(wizardFacts, N5B_WIZARD_ALIASES.n5b_q9g_is_schedule_10),
  );

  // Q10a
  fields.notice_service_method = parseNonEmptyString(
    getWizardValueFromPaths(wizardFacts, N5B_WIZARD_ALIASES.notice_service_method),
  );

  // Licensing
  fields.n5b_property_requires_licence = parseN5BBoolean(
    getWizardValueFromPaths(wizardFacts, N5B_WIZARD_ALIASES.n5b_property_requires_licence),
  );
  fields.n5b_has_valid_licence = parseN5BBoolean(
    getWizardValueFromPaths(wizardFacts, N5B_WIZARD_ALIASES.n5b_has_valid_licence),
  );
  fields.n5b_licensing_decision_outstanding = parseN5BBoolean(
    getWizardValueFromPaths(wizardFacts, N5B_WIZARD_ALIASES.n5b_licensing_decision_outstanding),
  );

  // Property condition / retaliation
  fields.n5b_property_condition_notice_served = parseN5BBoolean(
    getWizardValueFromPaths(wizardFacts, N5B_WIZARD_ALIASES.n5b_property_condition_notice_served),
  );
  fields.n5b_property_condition_notice_date = parseDateString(
    getWizardValueFromPaths(wizardFacts, N5B_WIZARD_ALIASES.n5b_property_condition_notice_date),
  );
  fields.n5b_property_condition_notice_suspended = parseN5BBoolean(
    getWizardValueFromPaths(wizardFacts, N5B_WIZARD_ALIASES.n5b_property_condition_notice_suspended),
  );
  fields.n5b_property_condition_suspension_ended = parseN5BBoolean(
    getWizardValueFromPaths(wizardFacts, N5B_WIZARD_ALIASES.n5b_property_condition_suspension_ended),
  );
  fields.n5b_property_condition_suspension_end_date = parseDateString(
    getWizardValueFromPaths(wizardFacts, N5B_WIZARD_ALIASES.n5b_property_condition_suspension_end_date),
  );
  fields.n5b_property_condition_notice_revoked = parseN5BBoolean(
    getWizardValueFromPaths(wizardFacts, N5B_WIZARD_ALIASES.n5b_property_condition_notice_revoked),
  );
  fields.n5b_property_condition_notice_quashed = parseN5BBoolean(
    getWizardValueFromPaths(wizardFacts, N5B_WIZARD_ALIASES.n5b_property_condition_notice_quashed),
  );
  fields.n5b_property_condition_non_revoke_reversed = parseN5BBoolean(
    getWizardValueFromPaths(wizardFacts, N5B_WIZARD_ALIASES.n5b_property_condition_non_revoke_reversed),
  );
  fields.n5b_property_condition_action_reversed = parseN5BBoolean(
    getWizardValueFromPaths(wizardFacts, N5B_WIZARD_ALIASES.n5b_property_condition_action_reversed),
  );
  fields.n5b_property_condition_defendant_complained_before_notice = parseN5BBoolean(
    getWizardValueFromPaths(wizardFacts, N5B_WIZARD_ALIASES.n5b_property_condition_defendant_complained_before_notice),
  );
  fields.n5b_property_condition_due_to_defendant_breach = parseN5BBoolean(
    getWizardValueFromPaths(wizardFacts, N5B_WIZARD_ALIASES.n5b_property_condition_due_to_defendant_breach),
  );
  fields.n5b_property_condition_on_market_for_sale = parseN5BBoolean(
    getWizardValueFromPaths(wizardFacts, N5B_WIZARD_ALIASES.n5b_property_condition_on_market_for_sale),
  );
  fields.n5b_claimant_is_social_housing_provider = parseN5BBoolean(
    getWizardValueFromPaths(wizardFacts, N5B_WIZARD_ALIASES.n5b_claimant_is_social_housing_provider),
  );
  fields.n5b_claimant_is_mortgagee_pre_tenancy = parseN5BBoolean(
    getWizardValueFromPaths(wizardFacts, N5B_WIZARD_ALIASES.n5b_claimant_is_mortgagee_pre_tenancy),
  );

  // Q15-18 Compliance (as already used by your filler)
  fields.epc_provided = parseN5BBoolean(
    getWizardValueFromPaths(wizardFacts, N5B_WIZARD_ALIASES.epc_provided),
  );
  fields.epc_provided_date = parseDateString(
    getWizardValueFromPaths(wizardFacts, N5B_WIZARD_ALIASES.epc_provided_date),
  );

  fields.has_gas_at_property = parseN5BBoolean(
    getWizardValueFromPaths(wizardFacts, N5B_WIZARD_ALIASES.has_gas_at_property),
  );
  fields.gas_safety_before_occupation = parseN5BBoolean(
    getWizardValueFromPaths(wizardFacts, N5B_WIZARD_ALIASES.gas_safety_before_occupation),
  );
  fields.gas_safety_before_occupation_date = parseDateString(
    getWizardValueFromPaths(wizardFacts, N5B_WIZARD_ALIASES.gas_safety_before_occupation_date),
  );
  fields.gas_safety_check_date = parseDateString(
    getWizardValueFromPaths(wizardFacts, N5B_WIZARD_ALIASES.gas_safety_check_date),
  );
  fields.gas_safety_served_date = parseDateString(
    getWizardValueFromPaths(wizardFacts, N5B_WIZARD_ALIASES.gas_safety_served_date),
  );

  const gasServiceDates = getWizardValueFromPaths(wizardFacts, N5B_WIZARD_ALIASES.gas_safety_service_dates);
  if (Array.isArray(gasServiceDates)) {
    fields.gas_safety_service_dates = gasServiceDates
      .map(unwrapWizardAnswer)
      .filter((d): d is string => typeof d === 'string' && d.trim().length > 0)
      .map(d => d.trim());
  }

  fields.gas_safety_provided = parseN5BBoolean(
    getWizardValueFromPaths(wizardFacts, N5B_WIZARD_ALIASES.gas_safety_provided),
  );

  fields.how_to_rent_provided = parseN5BBoolean(
    getWizardValueFromPaths(wizardFacts, N5B_WIZARD_ALIASES.how_to_rent_provided),
  );
  fields.how_to_rent_date = parseDateString(
    getWizardValueFromPaths(wizardFacts, N5B_WIZARD_ALIASES.how_to_rent_date),
  );

  const htrMethodRaw = getWizardValueFromPaths(wizardFacts, N5B_WIZARD_ALIASES.how_to_rent_method);
  if (typeof unwrapWizardAnswer(htrMethodRaw) === 'string') {
    const normalized = String(unwrapWizardAnswer(htrMethodRaw)).toLowerCase().trim();
    if (['hardcopy', 'hard copy', 'hard_copy'].includes(normalized)) fields.how_to_rent_method = 'hardcopy';
    if (['email', 'e-mail'].includes(normalized)) fields.how_to_rent_method = 'email';
  }

  // Q19
  fields.n5b_q19_has_unreturned_prohibited_payment = parseN5BBoolean(
    getWizardValueFromPaths(wizardFacts, N5B_WIZARD_ALIASES.n5b_q19_has_unreturned_prohibited_payment),
  );
  fields.n5b_q19b_holding_deposit = parseN5BBoolean(
    getWizardValueFromPaths(wizardFacts, N5B_WIZARD_ALIASES.n5b_q19b_holding_deposit),
  );

  // Q20
  fields.n5b_q20_paper_determination = parseN5BBoolean(
    getWizardValueFromPaths(wizardFacts, N5B_WIZARD_ALIASES.n5b_q20_paper_determination),
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
