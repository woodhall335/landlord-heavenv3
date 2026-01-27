/**
 * Section 21 Checkout Validator
 *
 * CRITICAL: Validates Section 21 preconditions BEFORE allowing payment.
 * This prevents the "paid dead end" where users pay but can't get their documents
 * because statutory preconditions are unknown/failed.
 *
 * This validator is a HARD GATE at checkout time for Section 21 complete_pack orders.
 */

import {
  validateSection21Preconditions,
  type Section21ValidationResult,
  type Section21ValidationInput,
} from '@/lib/validators/section21-preconditions';
import { normalizeJurisdiction } from '@/lib/jurisdiction/normalize';

// =============================================================================
// FACTS FLATTENING
// =============================================================================

/**
 * Flatten nested facts into a single object for uniform key lookup.
 *
 * Problem: Wizard flows may store compliance facts in nested objects like:
 *   facts.compliance.epc_served = true
 *   facts.section21.how_to_rent_served = true
 *   facts.tenancy.tenancy_start_date = '2024-01-01'
 *
 * But extractSection21ValidationInput expects flat keys:
 *   facts.epc_served = true
 *
 * This function creates a merged view where nested values are accessible at
 * the top level, while preserving any top-level values (which take precedence).
 */
function flattenFacts(facts: Record<string, any>): Record<string, any> {
  // Common nested object keys where compliance/tenancy data may be stored
  const nestedKeys = [
    'compliance',
    'section21',
    'section_21',
    'tenancy',
    'property',
    'meta',
    '__meta',
  ];

  // Start with empty object, then spread nested objects in order
  // (later spreads override earlier ones if keys collide)
  const flattened: Record<string, any> = {};

  // First, spread all nested objects (lower priority)
  for (const nestedKey of nestedKeys) {
    const nested = facts[nestedKey];
    if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
      Object.assign(flattened, nested);
    }
  }

  // Then, spread top-level facts (higher priority - override nested values)
  for (const [key, value] of Object.entries(facts)) {
    // Skip the nested container keys themselves and objects
    if (nestedKeys.includes(key)) continue;
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) continue;
    flattened[key] = value;
  }

  return flattened;
}

// =============================================================================
// TYPES
// =============================================================================

export interface Section21CheckoutValidation {
  /** True if checkout can proceed for Section 21 */
  canCheckout: boolean;
  /** Section 21 specific validation result */
  section21Validation: Section21ValidationResult | null;
  /** Human-readable message for UI */
  message: string;
  /** List of missing fields that must be confirmed before checkout */
  missingConfirmations: Section21MissingConfirmation[];
  /** Is this a Section 21 case that requires validation? */
  isSection21Case: boolean;
}

export interface Section21MissingConfirmation {
  /** Field key in wizard facts */
  fieldKey: string;
  /** Human-readable label */
  label: string;
  /** Error code from validator */
  errorCode: string;
  /** Detailed help text */
  helpText: string;
}

// =============================================================================
// VALIDATION LOGIC
// =============================================================================

/**
 * Check if this is a Section 21 case (England only, no-fault route).
 */
export function isSection21Case(
  jurisdiction: string | null | undefined,
  route: string | null | undefined,
  caseType: string | null | undefined
): boolean {
  const normalizedJurisdiction = normalizeJurisdiction(jurisdiction || '');

  // Section 21 is England-only
  if (normalizedJurisdiction !== 'england') {
    return false;
  }

  // Check route
  const normalizedRoute = (route || '').toLowerCase().replace(/[^a-z0-9_]/g, '_');
  const isSection21Route =
    normalizedRoute === 'section_21' ||
    normalizedRoute === 'section21' ||
    normalizedRoute === 'no_fault' ||
    normalizedRoute === 'accelerated_possession' ||
    normalizedRoute === 'accelerated_section21';

  // Check case type
  const isNoFaultCase = (caseType || '').toLowerCase() === 'no_fault';

  return isSection21Route || isNoFaultCase;
}

/**
 * Extract Section 21 validation input from wizard/collected facts.
 * Maps various field naming conventions to the canonical validator input.
 *
 * NOTE: This function flattens nested facts (compliance, section21, tenancy, etc.)
 * so that values stored under facts.compliance.epc_served are found when looking
 * up facts.epc_served. This fixes the "EPC UNKNOWN" / "HOW TO RENT UNKNOWN"
 * issue where users answered these questions but the validator couldn't find them.
 */
export function extractSection21ValidationInput(
  rawFacts: Record<string, any>
): Section21ValidationInput {
  // Flatten nested facts for uniform lookup
  const facts = flattenFacts(rawFacts);

  // Helper to check boolean from multiple possible field names
  const getBoolean = (...keys: string[]): boolean | undefined => {
    for (const key of keys) {
      const value = facts[key];
      if (value === true || value === 'yes') return true;
      if (value === false || value === 'no') return false;
    }
    return undefined;
  };

  // Deposit
  const depositTaken =
    getBoolean('deposit_taken') ??
    (facts.deposit_amount != null && facts.deposit_amount > 0);

  return {
    // Deposit protection
    deposit_taken: depositTaken,
    deposit_amount: facts.deposit_amount ?? facts.deposit,
    deposit_protected: getBoolean('deposit_protected'),
    deposit_scheme:
      facts.deposit_scheme ||
      facts.deposit_scheme_name ||
      facts.deposit_protection_scheme,
    deposit_scheme_name: facts.deposit_scheme_name || facts.deposit_scheme,
    deposit_protection_date: facts.deposit_protection_date,
    prescribed_info_served: getBoolean(
      'prescribed_info_served',
      'prescribed_info_given',
      'prescribed_information_served'
    ),
    prescribed_info_given: getBoolean(
      'prescribed_info_given',
      'prescribed_info_served'
    ),

    // Gas safety
    has_gas_appliances: getBoolean('has_gas_appliances', 'property_has_gas'),
    gas_safety_cert_served: getBoolean(
      'gas_safety_cert_served',
      'gas_certificate_provided',
      'gas_safety_certificate_provided'
    ),
    gas_certificate_provided: getBoolean(
      'gas_certificate_provided',
      'gas_safety_cert_served'
    ),

    // EPC
    epc_served: getBoolean('epc_served', 'epc_provided'),
    epc_provided: getBoolean('epc_provided', 'epc_served'),
    epc_rating: facts.epc_rating,

    // How to Rent
    how_to_rent_served: getBoolean(
      'how_to_rent_served',
      'how_to_rent_provided',
      'how_to_rent_given'
    ),
    how_to_rent_provided: getBoolean(
      'how_to_rent_provided',
      'how_to_rent_served'
    ),

    // Licensing
    licensing_required: facts.licensing_required,
    has_valid_licence: getBoolean('has_valid_licence', 'has_license'),

    // Retaliatory eviction
    no_retaliatory_notice: getBoolean('no_retaliatory_notice'),
    tenant_complaint_made: getBoolean('tenant_complaint_made'),
    council_involvement: getBoolean('council_involvement'),
    improvement_notice_served: getBoolean('improvement_notice_served'),

    // Dates
    tenancy_start_date: facts.tenancy_start_date,
    service_date:
      facts.service_date ||
      facts.notice_date ||
      facts.notice_service_date ||
      facts.intended_service_date,
  };
}

/**
 * Map validation errors to user-friendly missing confirmations.
 */
function mapBlockersToConfirmations(
  blockers: Array<{ code: string; message: string; evidenceFields: string[] }>
): Section21MissingConfirmation[] {
  const confirmations: Section21MissingConfirmation[] = [];

  for (const blocker of blockers) {
    switch (blocker.code) {
      case 'S21_PRESCRIBED_INFO_UNKNOWN':
        confirmations.push({
          fieldKey: 'prescribed_info_served',
          label: 'Prescribed information served within 30 days',
          errorCode: blocker.code,
          helpText:
            'Confirm whether the prescribed information about the deposit protection ' +
            'was provided to the tenant within 30 days of protecting the deposit.',
        });
        break;

      case 'S21_EPC_UNKNOWN':
        confirmations.push({
          fieldKey: 'epc_served',
          label: 'Energy Performance Certificate (EPC) provided',
          errorCode: blocker.code,
          helpText:
            'Confirm whether a valid EPC was provided to the tenant before the tenancy started.',
        });
        break;

      case 'S21_HOW_TO_RENT_UNKNOWN':
        confirmations.push({
          fieldKey: 'how_to_rent_served',
          label: "'How to Rent' guide provided",
          errorCode: blocker.code,
          helpText:
            "Confirm whether the government 'How to Rent' guide was provided to the tenant " +
            '(required for tenancies starting on or after 1 October 2015).',
        });
        break;

      case 'S21_GAS_CERT_UNKNOWN':
        confirmations.push({
          fieldKey: 'gas_safety_cert_served',
          label: 'Gas Safety Certificate provided',
          errorCode: blocker.code,
          helpText:
            'Confirm whether a valid Gas Safety Certificate (CP12) was provided to the tenant.',
        });
        break;

      case 'S21_DEPOSIT_PROTECTION_UNKNOWN':
        confirmations.push({
          fieldKey: 'deposit_protected',
          label: 'Deposit protected in approved scheme',
          errorCode: blocker.code,
          helpText:
            'Confirm whether the deposit is protected in an approved scheme (DPS, MyDeposits, or TDS).',
        });
        break;

      case 'S21_LICENCE_STATUS_UNKNOWN':
        confirmations.push({
          fieldKey: 'has_valid_licence',
          label: 'Valid property licence held',
          errorCode: blocker.code,
          helpText:
            'The property requires licensing. Confirm whether you hold a valid licence.',
        });
        break;

      // Failed blockers (not just unknown) - user explicitly said "No"
      case 'S21_DEPOSIT_NOT_PROTECTED':
      case 'S21_PRESCRIBED_INFO_NOT_SERVED':
      case 'S21_EPC_NOT_PROVIDED':
      case 'S21_HOW_TO_RENT_NOT_PROVIDED':
      case 'S21_GAS_CERT_NOT_PROVIDED':
      case 'S21_LICENCE_NOT_HELD':
      case 'S21_RETALIATORY_EVICTION_BAR':
      case 'S21_FOUR_MONTH_RULE':
        // These are actual failures, not just unknown - include with full message
        confirmations.push({
          fieldKey: blocker.evidenceFields[0] || blocker.code,
          label: blocker.code.replace('S21_', '').replace(/_/g, ' '),
          errorCode: blocker.code,
          helpText: blocker.message,
        });
        break;

      default:
        // Unknown blocker code - include anyway
        confirmations.push({
          fieldKey: blocker.evidenceFields[0] || blocker.code,
          label: blocker.code,
          errorCode: blocker.code,
          helpText: blocker.message,
        });
    }
  }

  return confirmations;
}

/**
 * Validate Section 21 case for checkout.
 *
 * This is the main entry point for checkout validation.
 * Returns a structured result indicating whether checkout can proceed.
 */
export function validateSection21ForCheckout(
  collectedFacts: Record<string, any>,
  jurisdiction: string | null | undefined,
  productType: string
): Section21CheckoutValidation {
  // Extract route and case type from collected facts
  const route =
    collectedFacts.selected_notice_route ||
    collectedFacts.eviction_route ||
    collectedFacts.notice_type;
  const caseType = collectedFacts.case_type;

  // Check if this is a Section 21 case
  const isS21 = isSection21Case(jurisdiction, route, caseType);

  // Non-Section 21 cases can always checkout (for eviction products)
  if (!isS21) {
    return {
      canCheckout: true,
      section21Validation: null,
      message: 'Case is not Section 21 - no precondition validation required.',
      missingConfirmations: [],
      isSection21Case: false,
    };
  }

  // Only validate complete_pack and notice_only for Section 21
  // Other products (money_claim, AST) don't need Section 21 validation
  if (productType !== 'complete_pack' && productType !== 'notice_only') {
    return {
      canCheckout: true,
      section21Validation: null,
      message: `Product type ${productType} does not require Section 21 precondition validation.`,
      missingConfirmations: [],
      isSection21Case: true,
    };
  }

  // Extract validation input and run validation
  const validationInput = extractSection21ValidationInput(collectedFacts);
  const validation = validateSection21Preconditions(validationInput);

  // Filter for UNKNOWN blockers only at checkout time
  // We want to let users fix "unknown" status, but "failed" status
  // (where they explicitly said "No") should still block
  const unknownBlockers = validation.blockers.filter((b) =>
    b.code.endsWith('_UNKNOWN')
  );
  const failedBlockers = validation.blockers.filter(
    (b) => !b.code.endsWith('_UNKNOWN')
  );

  // If there are failed blockers (explicit "No" answers), block checkout with clear message
  if (failedBlockers.length > 0) {
    const failedCodes = failedBlockers.map((b) => b.code).join(', ');
    return {
      canCheckout: false,
      section21Validation: validation,
      message:
        `Section 21 notice cannot be generated because statutory requirements are not met. ` +
        `Blocking issues: ${failedCodes}. You may need to use Section 8 instead.`,
      missingConfirmations: mapBlockersToConfirmations(failedBlockers),
      isSection21Case: true,
    };
  }

  // If there are unknown blockers, block checkout until they're confirmed
  if (unknownBlockers.length > 0) {
    const unknownCodes = unknownBlockers.map((b) => b.code).join(', ');
    return {
      canCheckout: false,
      section21Validation: validation,
      message:
        `Section 21 notice cannot be generated until statutory requirements are confirmed. ` +
        `Please confirm: ${unknownCodes.replace(/S21_/g, '').replace(/_UNKNOWN/g, '')}`,
      missingConfirmations: mapBlockersToConfirmations(unknownBlockers),
      isSection21Case: true,
    };
  }

  // All preconditions satisfied
  return {
    canCheckout: true,
    section21Validation: validation,
    message: 'All Section 21 statutory preconditions are confirmed.',
    missingConfirmations: [],
    isSection21Case: true,
  };
}

/**
 * Quick check if Section 21 checkout is blocked.
 * Returns just the boolean result for simple gating.
 */
export function isSection21CheckoutBlocked(
  collectedFacts: Record<string, any>,
  jurisdiction: string | null | undefined,
  productType: string
): boolean {
  const validation = validateSection21ForCheckout(
    collectedFacts,
    jurisdiction,
    productType
  );
  return !validation.canCheckout && validation.isSection21Case;
}
