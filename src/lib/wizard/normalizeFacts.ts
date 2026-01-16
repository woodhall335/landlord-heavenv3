/**
 * Canonical Fact Keys Normalization Layer
 *
 * This module provides a centralized mapping between legacy/variant field keys
 * and canonical field keys used throughout the system. This ensures consistent
 * validation and template rendering regardless of how data was originally collected.
 *
 * IMPORTANT: When adding new field mappings, update BOTH the mapping and the
 * affected_question_id references in evaluate-notice-compliance.ts to maintain
 * consistency between validation errors and the wizard UI.
 */

/**
 * Canonical key mappings for compliance-related fields
 * Maps legacy/variant keys to their canonical counterparts
 */
export const CANONICAL_FACT_KEYS: Record<string, string> = {
  // Deposit Protection Fields
  deposit_protected_scheme: 'deposit_protected',
  deposit_is_protected: 'deposit_protected',
  deposit_protected_in_scheme: 'deposit_protected',

  // Prescribed Information
  prescribed_info_provided: 'prescribed_info_given',
  prescribed_info_served: 'prescribed_info_given',
  prescribed_information_given: 'prescribed_info_given',

  // How to Rent Guide
  how_to_rent_given: 'how_to_rent_provided',
  h2r_provided: 'how_to_rent_provided',
  how_to_rent_served: 'how_to_rent_provided',

  // Gas Safety Certificate
  gas_safety_cert_provided: 'gas_certificate_provided',
  gas_safety_certificate_provided: 'gas_certificate_provided',
  gas_safety_record_provided: 'gas_certificate_provided',
  gas_cert_provided: 'gas_certificate_provided',

  // EPC (Energy Performance Certificate)
  epc_certificate_provided: 'epc_provided',
  energy_certificate_provided: 'epc_provided',

  // Property Licensing
  licensing_status: 'property_licensing_status',
  hmo_license_status: 'property_licensing_status',

  // Notice Service
  notice_served_date: 'notice_service_date',
  service_date: 'notice_service_date',
  notice_date: 'notice_service_date',

  // Notice Expiry
  notice_expires_date: 'notice_expiry_date',
  expiry_date: 'notice_expiry_date',

  // Rent Smart Wales
  rent_smart_registered: 'rent_smart_wales_registered',
  rsw_registered: 'rent_smart_wales_registered',

  // Tenancy Details
  tenancy_commenced: 'tenancy_start_date',
  tenancy_began: 'tenancy_start_date',
  lease_start_date: 'tenancy_start_date',

  // Contract Start (Wales)
  occupation_contract_start: 'contract_start_date',
  contract_commenced: 'contract_start_date',

  // Grounds Selection
  section8_grounds_selection: 'section8_grounds',
  s8_grounds: 'section8_grounds',
  selected_grounds: 'section8_grounds',
  eviction_grounds_selection: 'eviction_grounds',

  // Repair Complaints
  repair_complaints: 'recent_repair_complaints',
  outstanding_repairs: 'recent_repair_complaints',
  tenant_repair_complaints: 'recent_repair_complaints',
};

/**
 * Reverse mapping from canonical keys to affected_question_ids for validation
 * These map to the actual question IDs in MQS wizard definitions
 */
export const CANONICAL_TO_QUESTION_ID: Record<string, string> = {
  deposit_protected: 'deposit_protected_scheme',
  prescribed_info_given: 'prescribed_info_given',
  how_to_rent_provided: 'how_to_rent_provided',
  gas_certificate_provided: 'gas_safety_certificate',
  epc_provided: 'epc_provided',
  property_licensing_status: 'property_licensing',
  notice_service_date: 'notice_service',
  notice_expiry_date: 'notice_service',
  rent_smart_wales_registered: 'rent_smart_wales_registered',
  tenancy_start_date: 'tenancy_start_date',
  contract_start_date: 'contract_start_date',
  section8_grounds: 'section8_grounds_selection',
  eviction_grounds: 'eviction_grounds',
  recent_repair_complaints: 'recent_repair_complaints_s21',
};

/**
 * Normalize fact keys in a wizard facts object to use canonical keys
 * This ensures validation and templates see consistent field names
 *
 * @param facts - Optional facts object. If undefined/null, returns empty object.
 */
export function normalizeFactKeys(facts?: Record<string, any>): Record<string, any> {
  // Handle undefined/null facts - return empty object to prevent crashes on initial load
  const safeFacts = facts ?? {};
  const normalized: Record<string, any> = { ...safeFacts };

  for (const [legacyKey, canonicalKey] of Object.entries(CANONICAL_FACT_KEYS)) {
    // If the legacy key exists and the canonical key doesn't, copy the value
    if (safeFacts[legacyKey] !== undefined && safeFacts[canonicalKey] === undefined) {
      normalized[canonicalKey] = safeFacts[legacyKey];
    }
  }

  if (safeFacts.no_retaliatory_notice !== undefined && normalized.recent_repair_complaints === undefined) {
    if (isTruthy(safeFacts.no_retaliatory_notice)) {
      normalized.recent_repair_complaints = false;
    } else if (isFalsy(safeFacts.no_retaliatory_notice)) {
      normalized.recent_repair_complaints = true;
    }
  }

  // Handle nested objects (like notice_service.notice_date -> notice_service_date)
  if (safeFacts.notice_service) {
    if (safeFacts.notice_service.notice_date && !normalized.notice_service_date) {
      normalized.notice_service_date = safeFacts.notice_service.notice_date;
    }
    if (safeFacts.notice_service.notice_expiry_date && !normalized.notice_expiry_date) {
      normalized.notice_expiry_date = safeFacts.notice_service.notice_expiry_date;
    }
  }

  // Handle notice object variants
  if (safeFacts.notice) {
    if (safeFacts.notice.service_date && !normalized.notice_service_date) {
      normalized.notice_service_date = safeFacts.notice.service_date;
    }
    if (safeFacts.notice.notice_date && !normalized.notice_service_date) {
      normalized.notice_service_date = safeFacts.notice.notice_date;
    }
    if (safeFacts.notice.expiry_date && !normalized.notice_expiry_date) {
      normalized.notice_expiry_date = safeFacts.notice.expiry_date;
    }
  }

  // Handle tenancy nested object
  if (safeFacts.tenancy) {
    if (safeFacts.tenancy.prescribed_info_given !== undefined && normalized.prescribed_info_given === undefined) {
      normalized.prescribed_info_given = safeFacts.tenancy.prescribed_info_given;
    }
  }

  return normalized;
}

/**
 * Get the canonical affected_question_id for a given field key
 * Used by validation to ensure jump links work correctly
 */
export function getAffectedQuestionId(fieldKey: string): string {
  // First check if it's already a canonical key with a known question ID
  if (CANONICAL_TO_QUESTION_ID[fieldKey]) {
    return CANONICAL_TO_QUESTION_ID[fieldKey];
  }

  // Check if it's a legacy key, map to canonical, then to question ID
  const canonicalKey = CANONICAL_FACT_KEYS[fieldKey];
  if (canonicalKey && CANONICAL_TO_QUESTION_ID[canonicalKey]) {
    return CANONICAL_TO_QUESTION_ID[canonicalKey];
  }

  // Fall back to using the field key as-is (might be a valid question ID)
  return fieldKey;
}

/**
 * Type-safe helper to check if a fact value is truthy (handles string 'true'/'yes'/etc.)
 */
export function isTruthy(value: unknown): boolean {
  if (value === true) return true;
  if (typeof value === 'string') {
    const normalized = value.toLowerCase().trim();
    return ['true', 'yes', 'y', '1'].includes(normalized);
  }
  return false;
}

/**
 * Type-safe helper to check if a fact value is explicitly false
 */
export function isFalsy(value: unknown): boolean {
  if (value === false) return true;
  if (typeof value === 'string') {
    const normalized = value.toLowerCase().trim();
    return ['false', 'no', 'n', '0'].includes(normalized);
  }
  return false;
}

/**
 * Get a fact value with normalization, checking multiple possible keys
 * @param facts - Optional facts object. If undefined/null, returns undefined.
 */
export function getFactValue(facts?: Record<string, any>, ...keys: string[]): any {
  const normalizedFacts = normalizeFactKeys(facts ?? {});

  for (const key of keys) {
    // Check direct key
    if (normalizedFacts[key] !== undefined && normalizedFacts[key] !== null) {
      return normalizedFacts[key];
    }

    // Check canonical mapping
    const canonicalKey = CANONICAL_FACT_KEYS[key];
    if (canonicalKey && normalizedFacts[canonicalKey] !== undefined && normalizedFacts[canonicalKey] !== null) {
      return normalizedFacts[canonicalKey];
    }
  }

  return undefined;
}

/**
 * Dependent Fact Clearing Configuration
 *
 * When a controlling fact changes to a value that makes dependent facts irrelevant,
 * those dependent facts should be cleared to avoid stale/orphan data.
 *
 * Format: { controllingFact: { clearWhenValue: [dependentFacts] } }
 */
const DEPENDENT_FACTS_TO_CLEAR: Record<string, Record<string, string[]>> = {
  // When deposit_taken=false, clear all deposit-related facts
  deposit_taken: {
    false: [
      'deposit_amount',
      'deposit_protected',
      'deposit_protected_scheme',
      'prescribed_info_given',
      'prescribed_info_provided',
      'deposit_reduced_to_legal_cap_confirmed',
      'deposit_scheme',
    ],
  },
  // When has_gas_appliances=false, clear gas certificate facts
  has_gas_appliances: {
    false: [
      'gas_certificate_provided',
      'gas_safety_cert_provided',
      'gas_safety_certificate_provided',
    ],
  },
  // When is_fixed_term=false, clear fixed term end date
  is_fixed_term: {
    false: ['fixed_term_end_date'],
  },
  // When has_rent_arrears=false, clear arrears details
  has_rent_arrears: {
    false: ['arrears_total', 'arrears_from_date', 'rent_arrears_amount'],
  },
  // Wales: When deposit_taken_wales=false, clear Wales deposit facts
  deposit_taken_wales: {
    false: ['deposit_protected', 'deposit_protected_wales', 'deposit_scheme', 'deposit_scheme_wales_s173'],
  },
  // Wales: When deposit_taken_fault=false, clear Wales fault deposit facts
  deposit_taken_fault: {
    false: ['deposit_protected', 'deposit_protected_fault', 'deposit_scheme', 'deposit_scheme_fault'],
  },
  // When deposit_protected_scheme=false, clear prescribed info (can't give prescribed info without protection)
  deposit_protected_scheme: {
    false: ['prescribed_info_given', 'prescribed_info_provided'],
  },
  // When deposit_protected=false (the canonical fact), also clear prescribed info
  // This handles cases where the question maps to the canonical fact name
  deposit_protected: {
    false: ['prescribed_info_given', 'prescribed_info_provided'],
  },
};

/**
 * Clear dependent facts when a controlling fact changes to a value that makes them irrelevant.
 *
 * This maintains data integrity in the caseFacts by removing orphaned data.
 * For example, if deposit_taken=false, we don't want to keep deposit_amount in the facts.
 *
 * @param facts - The current facts object
 * @param changedFactId - The fact that just changed
 * @param newValue - The new value of the changed fact
 * @returns A new facts object with dependent facts cleared (or the original if no changes)
 */
export function clearDependentFacts(
  facts: Record<string, any>,
  changedFactId: string,
  newValue: any
): Record<string, any> {
  if (!facts) return {};

  const clearConfig = DEPENDENT_FACTS_TO_CLEAR[changedFactId];
  if (!clearConfig) {
    // No dependent facts defined for this controlling fact
    return facts;
  }

  // Normalize the new value to a string for comparison
  const normalizedValue = String(newValue).toLowerCase();

  // Check if this value triggers clearing
  const factsToClear = clearConfig[normalizedValue];
  if (!factsToClear || factsToClear.length === 0) {
    return facts;
  }

  // Create a copy and remove the dependent facts
  const clearedFacts = { ...facts };
  let didClear = false;

  for (const factKey of factsToClear) {
    if (clearedFacts[factKey] !== undefined) {
      delete clearedFacts[factKey];
      didClear = true;
    }
  }

  if (didClear) {
    console.log(`[clearDependentFacts] Cleared orphan facts for ${changedFactId}=${newValue}:`, factsToClear);
  }

  return clearedFacts;
}

/**
 * Batch clear dependent facts for multiple changes at once.
 * Useful when processing a complete step save.
 *
 * @param facts - The current facts object
 * @param changes - Map of changed fact IDs to their new values
 * @returns A new facts object with dependent facts cleared
 */
export function batchClearDependentFacts(
  facts: Record<string, any>,
  changes: Record<string, any>
): Record<string, any> {
  let currentFacts = { ...facts };

  for (const [factId, newValue] of Object.entries(changes)) {
    currentFacts = clearDependentFacts(currentFacts, factId, newValue);
  }

  return currentFacts;
}
