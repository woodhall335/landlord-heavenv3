/**
 * Compliance Timing Facts Builder
 *
 * This module provides a SINGLE canonical way to build ComplianceTimingData
 * from wizard facts. All endpoints and generators MUST use this builder
 * to ensure consistent compliance timing validation.
 *
 * CRITICAL: Different parts of the codebase have historically used inconsistent
 * field names for the same data. This module resolves all known aliases to
 * the canonical ComplianceTimingData interface keys.
 *
 * @module compliance-timing-facts
 */

import type { ComplianceTimingData } from './court-ready-validator';

// =============================================================================
// FIELD ALIAS DEFINITIONS
// =============================================================================
// These define the precedence order for resolving each ComplianceTimingData field.
// The first non-undefined value in each list wins.
// =============================================================================

/**
 * Alias resolution maps: key = canonical field, value = list of aliases in priority order
 *
 * PRECEDENCE RULES (documented for audit):
 * - First alias in list is preferred/canonical
 * - Subsequent aliases are legacy forms that may appear in older collected_facts
 * - If multiple aliases have values, the first one wins
 */
const FIELD_ALIASES: Record<keyof ComplianceTimingData, string[]> = {
  // Tenancy start date
  // May appear as: tenancy_start_date, tenancy_start, tenancy_starting_date, start_date
  tenancy_start_date: [
    'tenancy_start_date', // preferred
    'tenancy_start', // legacy short form
    'tenancy_starting_date', // legacy verbose form
    'start_date', // ambiguous legacy
    'tenancy.start_date', // nested form from CaseFacts
  ],

  // Occupation date (when tenant actually moved in, may differ from tenancy start)
  // May appear as: occupation_date, move_in_date
  occupation_date: [
    'occupation_date', // preferred
    'move_in_date', // legacy alias
    'tenant_move_in_date', // verbose legacy
  ],

  // EPC provided date
  // Usually consistent, but check for typos
  epc_provided_date: [
    'epc_provided_date', // preferred
    'epc_served_date', // legacy alias
    'epc_date', // short legacy
  ],

  // EPC valid until (expiry)
  epc_valid_until: [
    'epc_valid_until', // preferred
    'epc_expiry_date', // legacy alias
    'epc_expires', // short legacy
  ],

  // Gas safety check date (date the CP12 inspection was carried out)
  // CRITICAL: This is the CHECK date, not the served date
  gas_safety_check_date: [
    'gas_safety_check_date', // preferred
    'most_recent_gas_safety_check_date', // verbose legacy
    'cp12_check_date', // technical alias
    'gas_check_date', // short legacy
  ],

  // Gas safety provided/served date (date CP12 was given to tenant)
  // CRITICAL: This is often confused with check date. This is when SERVED.
  // Major inconsistency source: wizard uses gas_safety_served_date, validator uses gas_safety_provided_date
  gas_safety_provided_date: [
    'gas_safety_provided_date', // preferred (validator canonical key)
    'gas_safety_served_date', // wizard uses this
    'gas_safety_certificate_given_date', // verbose legacy
    'cp12_served_date', // technical alias
    'gas_cert_served_date', // short legacy
  ],

  // Has gas at property (boolean)
  // CRITICAL: Wizard uses has_gas_appliances, validator interface uses has_gas_at_property
  has_gas_at_property: [
    'has_gas_at_property', // preferred (validator canonical key)
    'has_gas_appliances', // wizard uses this
    'property_has_gas', // legacy alternative
  ],

  // Pre-occupation gas safety confirmation (boolean)
  gas_safety_before_occupation: [
    'gas_safety_before_occupation', // preferred
    'gas_cert_before_move_in', // legacy alias
  ],

  // Pre-occupation gas safety check date
  gas_safety_before_occupation_date: [
    'gas_safety_before_occupation_date', // preferred
    'pre_occupation_gas_check_date', // legacy alias
  ],

  // Pre-occupation gas safety record served date (CRITICAL for Section 21)
  // This is the date the pre-occupation CP12 was PROVIDED to tenant, not checked
  gas_safety_record_served_pre_occupation_date: [
    'gas_safety_record_served_pre_occupation_date', // preferred
    'pre_occupation_gas_served_date', // legacy alias
  ],

  // How to Rent provided date
  // CRITICAL: Wizard uses how_to_rent_date, validator uses how_to_rent_provided_date
  how_to_rent_provided_date: [
    'how_to_rent_provided_date', // preferred (validator canonical key)
    'how_to_rent_date', // wizard uses this
    'how_to_rent_served_date', // legacy alias
    'htr_provided_date', // short legacy
  ],

  // Deposit received date
  deposit_received_date: [
    'deposit_received_date', // preferred
    'deposit_date', // short legacy
    'tenancy.deposit_received_date', // nested form
  ],

  // Prescribed info served date
  prescribed_info_served_date: [
    'prescribed_info_served_date', // preferred
    'prescribed_info_date', // short legacy
    'pi_served_date', // abbreviation legacy
  ],
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Safely get a nested value from an object using dot notation.
 * E.g., getValue(obj, 'tenancy.start_date') returns obj.tenancy?.start_date
 */
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split('.');
  let current: unknown = obj;

  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }

  return current;
}

/**
 * Convert a Date to YYYY-MM-DD using LOCAL date components.
 * This avoids off-by-one day issues that can happen with toISOString() in some timezones.
 */
function formatDateLocal(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Attempt to convert an epoch (seconds or milliseconds) into YYYY-MM-DD (local).
 * Returns undefined if the number doesn't look like a plausible epoch timestamp.
 */
function tryFormatEpochToLocalYmd(epoch: number): string | undefined {
  if (!Number.isFinite(epoch)) return undefined;

  // Heuristics:
  // - seconds epoch is typically 10 digits (~1e9..1e10)
  // - ms epoch is typically 13 digits (~1e12..1e13)
  // Accept a reasonable range: years 1990..2100
  const toDateIfValid = (ms: number): string | undefined => {
    const d = new Date(ms);
    const year = d.getFullYear();
    if (year < 1990 || year > 2100 || Number.isNaN(d.getTime())) return undefined;
    return formatDateLocal(d);
  };

  // If it's likely seconds, convert to ms
  const asSeconds = toDateIfValid(epoch * 1000);
  if (asSeconds) return asSeconds;

  // If it's likely ms, use as-is
  const asMs = toDateIfValid(epoch);
  if (asMs) return asMs;

  return undefined;
}

/**
 * Resolve a string field from facts using alias list.
 * Returns the first non-undefined, non-null, non-empty-string value.
 */
function resolveStringField(
  facts: Record<string, unknown>,
  aliases: string[]
): string | undefined {
  for (const alias of aliases) {
    const value = getNestedValue(facts, alias);

    // Skip undefined, null, and empty strings
    if (value === undefined || value === null || value === '') {
      continue;
    }

    // If it's a string, return it
    if (typeof value === 'string') {
      return value;
    }

    // If it's a Date, convert to YYYY-MM-DD using local date parts (timezone safe)
    if (value instanceof Date) {
      return formatDateLocal(value);
    }

    // If it's a number, try to interpret as epoch seconds/ms; otherwise stringify
    if (typeof value === 'number') {
      const epoch = tryFormatEpochToLocalYmd(value);
      return epoch ?? String(value);
    }
  }

  return undefined;
}

/**
 * Resolve a boolean field from facts using alias list.
 * Returns the first non-undefined value.
 *
 * IMPORTANT: We intentionally preserve undefined rather than defaulting to false.
 * This allows the validator to decide how to handle missing values.
 */
function resolveBooleanField(
  facts: Record<string, unknown>,
  aliases: string[]
): boolean | undefined {
  for (const alias of aliases) {
    const value = getNestedValue(facts, alias);

    // Skip undefined and null
    if (value === undefined || value === null) {
      continue;
    }

    // If it's already a boolean, return it
    if (typeof value === 'boolean') {
      return value;
    }

    // Handle string representations of booleans
    if (typeof value === 'string') {
      const lower = value.toLowerCase().trim();
      if (lower === 'true' || lower === 'yes' || lower === '1') {
        return true;
      }
      if (lower === 'false' || lower === 'no' || lower === '0') {
        return false;
      }
    }

    // Handle numeric representations
    if (typeof value === 'number') {
      return value !== 0;
    }
  }

  return undefined;
}

// =============================================================================
// MAIN BUILDER FUNCTION
// =============================================================================

/**
 * Build ComplianceTimingData from wizard/collected facts.
 *
 * This function resolves all known field aliases to produce a canonical
 * ComplianceTimingData object that can be passed to validateComplianceTiming().
 *
 * USAGE: All endpoints and generators that need to validate compliance timing
 * MUST use this function instead of manually mapping fields.
 *
 * @param facts - The collected_facts object from a case (or wizard facts)
 * @returns ComplianceTimingData with all fields resolved from aliases
 */
export function buildComplianceTimingDataFromFacts(
  facts: Record<string, unknown> | null | undefined
): ComplianceTimingData {
  // Handle null/undefined facts gracefully
  if (!facts || typeof facts !== 'object') {
    return {};
  }

  // Build the canonical ComplianceTimingData by resolving all aliases
  const timingData: ComplianceTimingData = {
    tenancy_start_date: resolveStringField(facts, FIELD_ALIASES.tenancy_start_date),
    occupation_date: resolveStringField(facts, FIELD_ALIASES.occupation_date),
    epc_provided_date: resolveStringField(facts, FIELD_ALIASES.epc_provided_date),
    epc_valid_until: resolveStringField(facts, FIELD_ALIASES.epc_valid_until),
    gas_safety_check_date: resolveStringField(facts, FIELD_ALIASES.gas_safety_check_date),
    gas_safety_provided_date: resolveStringField(facts, FIELD_ALIASES.gas_safety_provided_date),
    has_gas_at_property: resolveBooleanField(facts, FIELD_ALIASES.has_gas_at_property),
    gas_safety_before_occupation: resolveBooleanField(
      facts,
      FIELD_ALIASES.gas_safety_before_occupation
    ),
    gas_safety_before_occupation_date: resolveStringField(
      facts,
      FIELD_ALIASES.gas_safety_before_occupation_date
    ),
    gas_safety_record_served_pre_occupation_date: resolveStringField(
      facts,
      FIELD_ALIASES.gas_safety_record_served_pre_occupation_date
    ),
    how_to_rent_provided_date: resolveStringField(
      facts,
      FIELD_ALIASES.how_to_rent_provided_date
    ),
    deposit_received_date: resolveStringField(facts, FIELD_ALIASES.deposit_received_date),
    prescribed_info_served_date: resolveStringField(
      facts,
      FIELD_ALIASES.prescribed_info_served_date
    ),
  };

  // Remove undefined fields to keep the object clean
  for (const key of Object.keys(timingData) as Array<keyof ComplianceTimingData>) {
    if (timingData[key] === undefined) {
      delete timingData[key];
    }
  }

  return timingData;
}

/**
 * Build ComplianceTimingData with an optional evictionCase fallback.
 *
 * Some fields (like tenancy_start_date) may be available on the eviction case
 * object rather than in collected_facts. This variant allows falling back to
 * those values.
 *
 * @param facts - The collected_facts object
 * @param evictionCase - Optional eviction case object with fallback values
 * @returns ComplianceTimingData with fields resolved from facts, then evictionCase
 */
export function buildComplianceTimingDataWithFallback(
  facts: Record<string, unknown> | null | undefined,
  evictionCase?: {
    tenancy_start_date?: string;
    occupation_date?: string;
    [key: string]: unknown;
  }
): ComplianceTimingData {
  // First, build from facts
  const timingData = buildComplianceTimingDataFromFacts(facts);

  // Then apply evictionCase fallbacks for key fields
  if (evictionCase) {
    if (!timingData.tenancy_start_date && evictionCase.tenancy_start_date) {
      timingData.tenancy_start_date = evictionCase.tenancy_start_date;
    }
    if (!timingData.occupation_date && evictionCase.occupation_date) {
      timingData.occupation_date = evictionCase.occupation_date;
    }
  }

  return timingData;
}

// =============================================================================
// EXPORT ALIAS DEFINITIONS FOR TESTING
// =============================================================================

/**
 * Exported for testing purposes only.
 * These define the canonical alias precedence rules.
 */
export const _FIELD_ALIASES_FOR_TESTING = FIELD_ALIASES;
