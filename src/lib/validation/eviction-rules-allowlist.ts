/**
 * Eviction Rules Allowlist
 *
 * Defines the allowed tokens for condition strings in eviction YAML rules.
 * This provides defense-in-depth against injection attacks via YAML configs.
 *
 * Security model:
 * - Only whitelisted identifiers are allowed in condition expressions
 * - Dangerous patterns (eval, require, etc.) are explicitly blocked
 * - All conditions are validated before evaluation
 *
 * @see money-claim-rules-engine.ts for the pattern this follows
 */

// ============================================================================
// ALLOWED IDENTIFIERS
// ============================================================================

/**
 * Allowed tokens that may appear in condition strings.
 *
 * Categories:
 * - Context variables: facts, computed, route
 * - Property access: . (dot)
 * - Comparison operators: ===, !==, <, >, <=, >=, ==, !=
 * - Logical operators: &&, ||, !
 * - Literals: true, false, null, undefined, numbers, strings
 * - Array/object methods: includes, length, filter, some, every
 * - Date handling: new, Date
 * - Safe built-ins: Math.floor, String, Number, Array.isArray
 */
export const EVICTION_ALLOWED_IDENTIFIERS = new Set([
  // ==========================================================================
  // Core context variables
  // ==========================================================================
  'facts',
  'computed',
  'route',

  // ==========================================================================
  // Boolean literals
  // ==========================================================================
  'true',
  'false',
  'null',
  'undefined',

  // ==========================================================================
  // Safe constructors for date comparison
  // ==========================================================================
  'new',
  'Date',
  'getTime',

  // ==========================================================================
  // Safe array/object methods
  // ==========================================================================
  'includes',
  'length',
  'filter',
  'some',
  'every',
  'map',
  'reduce',
  'indexOf',
  'find',
  'join',

  // ==========================================================================
  // Safe built-ins
  // ==========================================================================
  'Math',
  'floor',
  'ceil',
  'round',
  'abs',
  'min',
  'max',
  'String',
  'Number',
  'Array',
  'isArray',
  'Object',
  'keys',
  'values',
  'entries',
  'Boolean',
  'parseInt',
  'parseFloat',
  'isNaN',
  'isFinite',

  // ==========================================================================
  // Arrow function parameter names (commonly used)
  // ==========================================================================
  'item',
  'i',
  'x',
  'el',
  'e',
  'entry',
  'g',
  'ground',
  'code',

  // ==========================================================================
  // Common facts property paths - England Section 21
  // ==========================================================================
  'deposit_taken',
  'deposit_protected',
  'deposit_protected_scheme',
  'deposit_amount',
  'deposit_protection_date',
  'deposit_scheme_name',
  'deposit_reduced_to_legal_cap_confirmed',
  'prescribed_info_given',
  'prescribed_info_provided',
  'prescribed_info_served',
  'has_gas_appliances',
  'gas_certificate_provided',
  'gas_safety_cert_provided',
  'epc_provided',
  'epc_gas_cert_served',
  'how_to_rent_provided',
  'how_to_rent_served',
  'licensing_required',
  'has_valid_licence',
  'property_licensing_status',
  'improvement_notice_served',
  'local_authority_improvement_notice',
  'emergency_remedial_action',
  'local_authority_emergency_action',
  'recent_repair_complaints',
  'no_retaliatory_notice',
  'prohibited_fees_charged',
  'no_prohibited_fees_confirmed',

  // ==========================================================================
  // Common facts property paths - England Section 8
  // ==========================================================================
  'section8_grounds',
  'section8_grounds_selection',
  'section8_details',
  'ground_particulars',
  'ground14_severity',
  'has_rent_arrears',
  'has_arrears',
  'total_arrears',
  'arrears_total',
  'arrears_at_notice_date',
  'arrears_items',
  'has_asb',
  'has_breaches',
  'rent_amount',
  'rent_frequency',

  // ==========================================================================
  // Common facts property paths - Party information
  // ==========================================================================
  'landlord_full_name',
  'landlord_name',
  'tenant_full_name',
  'tenant_name',
  'contract_holder_name',
  'property_address_line1',
  'property_address_postcode',

  // ==========================================================================
  // Common facts property paths - Tenancy/Contract dates
  // ==========================================================================
  'tenancy_start_date',
  'tenancy_end_date',
  'contract_start_date',
  'fixed_term_end_date',
  'is_fixed_term',

  // ==========================================================================
  // Common facts property paths - Notice service
  // ==========================================================================
  'notice_service_date',
  'notice_served_date',
  'notice_date',
  'notice_expiry_date',
  'notice_expiry',
  'selected_notice_route',
  'eviction_route',

  // ==========================================================================
  // Common facts property paths - Wales specific
  // ==========================================================================
  'rent_smart_wales_registered',
  'written_statement_provided',
  'wales_breach_type',
  'wales_fault_grounds',
  'wales_contract_category',
  'deposit_protected_wales',

  // ==========================================================================
  // Common facts property paths - Scotland specific
  // ==========================================================================
  'scotland_ground_codes',
  'scotland_grounds',
  'notice_to_leave_grounds',
  'prt_grounds',
  'eviction_grounds',
  'landlord_registration_number',
  'landlord_reg_number',
  'pre_action_completed',
  'pre_action_protocol_followed',
  'pre_action_contact',
  'pre_action_letter_sent',
  'pre_action_signposting',

  // ==========================================================================
  // Computed context variables
  // ==========================================================================
  'within_four_month_bar',
  'within_six_month_bar',
  'deposit_exceeds_cap',
  'notice_period_too_short',
  's8_notice_period_too_short',
  's173_notice_period_too_short',
  'wales_fault_notice_period_too_short',
  'ntl_notice_period_too_short',
  'notice_period_calculation_error',
  's8_notice_period_calculation_error',
  'ntl_notice_period_calculation_error',
  'tenancy_start_in_future',
  'contract_start_in_future',
  'notice_before_tenancy_start',
  'notice_before_contract_start',
  'expiry_before_service',
  'has_ground_8',
  'has_ground_12',
  'has_ground_14',
  'has_arrears_ground',
  'has_ground_1',
  'ground_8_eligible',
  'arrears_months',
  'mixed_grounds_allowed',
  'service_date',
  'expiry_date',

  // ==========================================================================
  // Nested object access
  // ==========================================================================
  'issues',
  'rent_arrears',
  'pre_action_confirmed',
  'debt_advice_signposted',
  'tenancy',

  // ==========================================================================
  // Jurisdiction
  // ==========================================================================
  'jurisdiction',
]);

// ============================================================================
// DANGEROUS PATTERNS
// ============================================================================

/**
 * Patterns that should NEVER appear in condition strings.
 * These could be used for code injection or unauthorized access.
 */
export const DANGEROUS_PATTERNS: RegExp[] = [
  /\beval\b/,
  /\bFunction\b/,
  /\bwindow\b/,
  /\bglobal\b/,
  /\bglobalThis\b/,
  /\bprocess\b/,
  /\brequire\b/,
  /\bimport\b/,
  /\bexport\b/,
  /\b__proto__\b/,
  /\bconstructor\b(?!\s*[=!<>])/,  // Allow "constructor" in comparisons but not as property access
  /\bprototype\b/,
  /\bthis\b/,
  /\bself\b/,
  /\bfetch\b/,
  /\bXMLHttpRequest\b/,
  /\bsetTimeout\b/,
  /\bsetInterval\b/,
  /\bsetImmediate\b/,
  /\bdocument\b/,
  /\blocalStorage\b/,
  /\bsessionStorage\b/,
  /\bcookie\b/,
  /\bnavigator\b/,
  /\blocation\b/,
  /\bhistory\b/,
  /\bAtob\b/i,
  /\bBtoa\b/i,
  /\bBuffer\b/,
  /\bchild_process\b/,
  /\bfs\b(?!\.)/, // fs but not facts
  /\bexec\b/,
  /\bspawn\b/,
  /\bfork\b/,
  /\b__dirname\b/,
  /\b__filename\b/,
  /\bmodule\b/,
  /\bexports\b/,
];

// ============================================================================
// VALIDATION FUNCTION
// ============================================================================

export interface ConditionValidationResult {
  valid: boolean;
  reason?: string;
  invalidIdentifier?: string;
}

/**
 * Validates a condition string against the allowlist.
 * Returns true if the condition is safe to evaluate, false otherwise.
 *
 * @param condition - The condition string from YAML
 * @returns Validation result with reason if invalid
 */
export function validateEvictionCondition(condition: string): ConditionValidationResult {
  // 1. Check for dangerous patterns first
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(condition)) {
      return {
        valid: false,
        reason: `Potentially dangerous pattern detected in condition`,
      };
    }
  }

  // 2. Remove string literals before checking identifiers
  // This allows any string values in quotes (single or double)
  const conditionWithoutStrings = condition
    .replace(/'[^']*'/g, '')  // Remove single-quoted strings
    .replace(/"[^"]*"/g, ''); // Remove double-quoted strings

  // 3. Extract all identifiers from the condition
  // This regex matches word characters that could be identifiers
  const identifierPattern = /[a-zA-Z_$][a-zA-Z0-9_$]*/g;
  const identifiers = conditionWithoutStrings.match(identifierPattern) || [];

  // 4. Check each identifier against the allowlist
  for (const identifier of identifiers) {
    if (!EVICTION_ALLOWED_IDENTIFIERS.has(identifier)) {
      // Check if it's a number (which is allowed)
      if (/^\d+$/.test(identifier)) {
        continue;
      }
      return {
        valid: false,
        reason: `Disallowed identifier in condition: "${identifier}"`,
        invalidIdentifier: identifier,
      };
    }
  }

  return { valid: true };
}

/**
 * Batch validate multiple conditions.
 *
 * @param conditions - Array of condition strings
 * @returns Array of validation results with index
 */
export function validateEvictionConditions(
  conditions: string[]
): Array<{ index: number; condition: string; result: ConditionValidationResult }> {
  return conditions.map((condition, index) => ({
    index,
    condition,
    result: validateEvictionCondition(condition),
  }));
}

/**
 * Check if all conditions in an array are valid.
 *
 * @param conditions - Array of condition strings
 * @returns True if all valid, false otherwise
 */
export function areAllConditionsValid(conditions: string[]): boolean {
  return conditions.every((c) => validateEvictionCondition(c).valid);
}

/**
 * Get all identifiers used in a condition.
 * Useful for auditing and testing.
 *
 * @param condition - The condition string
 * @returns Set of identifiers found
 */
export function extractIdentifiers(condition: string): Set<string> {
  const conditionWithoutStrings = condition
    .replace(/'[^']*'/g, '')
    .replace(/"[^"]*"/g, '');

  const identifierPattern = /[a-zA-Z_$][a-zA-Z0-9_$]*/g;
  const identifiers = conditionWithoutStrings.match(identifierPattern) || [];

  return new Set(identifiers.filter((id) => !/^\d+$/.test(id)));
}

/**
 * Add a temporary identifier to the allowlist.
 * Use with caution - only for testing purposes.
 *
 * @param identifier - The identifier to add
 */
export function addToAllowlist(identifier: string): void {
  EVICTION_ALLOWED_IDENTIFIERS.add(identifier);
}

/**
 * Remove an identifier from the allowlist.
 * Use with caution - only for testing purposes.
 *
 * @param identifier - The identifier to remove
 */
export function removeFromAllowlist(identifier: string): void {
  EVICTION_ALLOWED_IDENTIFIERS.delete(identifier);
}

/**
 * Check if an identifier is in the allowlist.
 *
 * @param identifier - The identifier to check
 * @returns True if allowed
 */
export function isIdentifierAllowed(identifier: string): boolean {
  return EVICTION_ALLOWED_IDENTIFIERS.has(identifier);
}

/**
 * Get the full allowlist as an array.
 * Useful for documentation and testing.
 *
 * @returns Array of allowed identifiers
 */
export function getAllowedIdentifiers(): string[] {
  return Array.from(EVICTION_ALLOWED_IDENTIFIERS).sort();
}
