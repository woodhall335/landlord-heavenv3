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
 */
export function normalizeFactKeys(facts: Record<string, any>): Record<string, any> {
  const normalized: Record<string, any> = { ...facts };

  for (const [legacyKey, canonicalKey] of Object.entries(CANONICAL_FACT_KEYS)) {
    // If the legacy key exists and the canonical key doesn't, copy the value
    if (facts[legacyKey] !== undefined && facts[canonicalKey] === undefined) {
      normalized[canonicalKey] = facts[legacyKey];
    }
  }

  // Handle nested objects (like notice_service.notice_date -> notice_service_date)
  if (facts.notice_service) {
    if (facts.notice_service.notice_date && !normalized.notice_service_date) {
      normalized.notice_service_date = facts.notice_service.notice_date;
    }
    if (facts.notice_service.notice_expiry_date && !normalized.notice_expiry_date) {
      normalized.notice_expiry_date = facts.notice_service.notice_expiry_date;
    }
  }

  // Handle notice object variants
  if (facts.notice) {
    if (facts.notice.service_date && !normalized.notice_service_date) {
      normalized.notice_service_date = facts.notice.service_date;
    }
    if (facts.notice.notice_date && !normalized.notice_service_date) {
      normalized.notice_service_date = facts.notice.notice_date;
    }
    if (facts.notice.expiry_date && !normalized.notice_expiry_date) {
      normalized.notice_expiry_date = facts.notice.expiry_date;
    }
  }

  // Handle tenancy nested object
  if (facts.tenancy) {
    if (facts.tenancy.prescribed_info_given !== undefined && normalized.prescribed_info_given === undefined) {
      normalized.prescribed_info_given = facts.tenancy.prescribed_info_given;
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
 */
export function getFactValue(facts: Record<string, any>, ...keys: string[]): any {
  const normalizedFacts = normalizeFactKeys(facts);

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
