/**
 * Section 21 Precondition Validator
 *
 * ENGLAND-ONLY: Validates all statutory preconditions before allowing Section 21 notice generation.
 *
 * This is the HARD GATE - if any precondition fails or is unknown, Section 21 generation
 * is BLOCKED with explicit errors. No placeholders, no partial compliance assertions.
 *
 * Legal Requirements (Housing Act 1988, as amended):
 * - Deposit protection within 30 days + prescribed info served
 * - Gas Safety Certificate provided before occupation (if gas appliances)
 * - EPC provided before occupation
 * - How to Rent guide provided (tenancies starting on/after 1 Oct 2015)
 * - Property licensing (if required)
 * - No retaliatory eviction bar (improvement notice in effect)
 * - 4-month restriction from tenancy start
 *
 * @module section21-preconditions
 */

// =============================================================================
// TYPES
// =============================================================================

export interface Section21PreconditionError {
  code: string;
  message: string;
  /** Fields in the data model that are relevant to this error */
  evidenceFields: string[];
  /** Legal basis for this requirement */
  legalBasis?: string;
  /** Severity: 'blocker' means generation MUST fail, 'warning' is informational */
  severity: 'blocker' | 'warning';
}

export interface Section21ValidationResult {
  /** True if all preconditions pass and generation can proceed */
  ok: boolean;
  /** List of all validation errors (blockers + warnings) */
  errors: Section21PreconditionError[];
  /** Convenience: just the blockers */
  blockers: Section21PreconditionError[];
  /** Convenience: just the warnings */
  warnings: Section21PreconditionError[];
  /** Summary message for UI */
  summary: string;
}

export interface Section21ValidationInput {
  // Deposit protection
  deposit_taken?: boolean;
  deposit_amount?: number;
  deposit_protected?: boolean;
  deposit_scheme?: string;
  deposit_scheme_name?: string;
  deposit_protection_date?: string;
  prescribed_info_served?: boolean;
  prescribed_info_given?: boolean;

  // Gas safety
  has_gas_appliances?: boolean;
  gas_safety_cert_served?: boolean;
  gas_certificate_provided?: boolean;

  // EPC
  epc_served?: boolean;
  epc_provided?: boolean;
  epc_rating?: string;

  // How to Rent
  how_to_rent_served?: boolean;
  how_to_rent_provided?: boolean;

  // Licensing
  licensing_required?: string;
  has_valid_licence?: boolean;

  // Retaliatory eviction
  no_retaliatory_notice?: boolean;
  tenant_complaint_made?: boolean;
  council_involvement?: boolean;
  improvement_notice_served?: boolean;

  // Tenancy dates (for 4-month rule)
  tenancy_start_date?: string;
  service_date?: string;

  // Allow additional fields
  [key: string]: any;
}

// =============================================================================
// FACTS TO VALIDATION INPUT ADAPTER
// =============================================================================

/**
 * Flatten nested facts into a single object for uniform key lookup.
 *
 * Problem: Wizard flows may store compliance facts in nested objects like:
 *   facts.compliance.epc_served = true
 *   facts.section21.how_to_rent_served = true
 *   facts.tenancy.tenancy_start_date = '2024-01-01'
 *
 * But validateSection21Preconditions expects flat keys:
 *   input.epc_served = true
 *
 * This function creates a merged view where nested values are accessible at
 * the top level, while preserving any top-level values (which take precedence).
 */
function flattenFactsForValidation(facts: Record<string, any>): Record<string, any> {
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

/**
 * Build Section 21 validation input from raw wizard/case facts.
 *
 * This is the SINGLE SOURCE OF TRUTH for converting raw facts into
 * Section21ValidationInput. EVERY place that calls validateSection21Preconditions()
 * should use this function to prepare the input.
 *
 * Features:
 * 1. Flattens nested containers (compliance, section21, section_21, tenancy, property)
 * 2. Maps variant key names to canonical validator fields:
 *    - epc_served / epc_provided → both epc_served and epc_provided
 *    - how_to_rent_served / how_to_rent_given / how_to_rent_provided → how_to_rent_*
 *    - gas_safety_cert_served / gas_certificate_provided → gas_*
 *    - prescribed_info_served / prescribed_info_given → prescribed_info_*
 * 3. Preserves explicit false values (user said "No" - don't overwrite with true)
 * 4. Handles 'yes'/'no' string values as boolean equivalents
 *
 * @param rawFacts - Raw facts from wizard, database, or API
 * @returns Section21ValidationInput ready for validateSection21Preconditions()
 */
export function buildSection21ValidationInputFromFacts(
  rawFacts: Record<string, any>
): Section21ValidationInput {
  // Flatten nested facts for uniform lookup
  const facts = flattenFactsForValidation(rawFacts);

  // Helper to get boolean from multiple possible field names
  // Returns the first defined boolean value found, or undefined
  // Handles 'yes'/'no' strings as boolean equivalents
  const getBoolean = (...keys: string[]): boolean | undefined => {
    for (const key of keys) {
      const value = facts[key];
      if (value === true || value === 'yes') return true;
      if (value === false || value === 'no') return false;
    }
    return undefined;
  };

  // Helper to get string from multiple possible field names
  const getString = (...keys: string[]): string | undefined => {
    for (const key of keys) {
      const value = facts[key];
      if (typeof value === 'string' && value.length > 0) return value;
    }
    return undefined;
  };

  // Deposit detection
  const depositTaken =
    getBoolean('deposit_taken') ??
    (facts.deposit_amount != null && facts.deposit_amount > 0);

  return {
    // Deposit protection
    deposit_taken: depositTaken,
    deposit_amount: facts.deposit_amount ?? facts.deposit,
    deposit_protected: getBoolean('deposit_protected'),
    deposit_scheme: getString(
      'deposit_scheme',
      'deposit_scheme_name',
      'deposit_protection_scheme'
    ),
    deposit_scheme_name: getString('deposit_scheme_name', 'deposit_scheme'),
    deposit_protection_date: getString('deposit_protection_date'),
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

    // EPC - map epc_served and epc_provided to BOTH fields
    // The validator checks: input.epc_served === true || input.epc_provided === true
    epc_served: getBoolean('epc_served', 'epc_provided'),
    epc_provided: getBoolean('epc_provided', 'epc_served'),
    epc_rating: getString('epc_rating'),

    // How to Rent - map all variants to BOTH fields
    // The validator checks: input.how_to_rent_served === true || input.how_to_rent_provided === true
    how_to_rent_served: getBoolean(
      'how_to_rent_served',
      'how_to_rent_provided',
      'how_to_rent_given'
    ),
    how_to_rent_provided: getBoolean(
      'how_to_rent_provided',
      'how_to_rent_served',
      'how_to_rent_given'
    ),

    // Licensing
    licensing_required: getString('licensing_required'),
    has_valid_licence: getBoolean('has_valid_licence', 'has_license'),

    // Retaliatory eviction
    no_retaliatory_notice: getBoolean('no_retaliatory_notice'),
    tenant_complaint_made: getBoolean('tenant_complaint_made'),
    council_involvement: getBoolean('council_involvement'),
    improvement_notice_served: getBoolean('improvement_notice_served'),

    // Dates - check multiple possible key names
    tenancy_start_date: getString('tenancy_start_date'),
    service_date: getString(
      'service_date',
      'notice_date',
      'notice_service_date',
      'notice_served_date',
      'intended_service_date'
    ),
  };
}

// =============================================================================
// VALIDATION LOGIC
// =============================================================================

/**
 * Validate all Section 21 statutory preconditions.
 *
 * This function is the HARD GATE for Section 21 generation.
 * If any blocker is returned, document generation MUST fail.
 *
 * @param input - Case facts / wizard facts to validate
 * @returns ValidationResult with ok=false if any blockers exist
 */
export function validateSection21Preconditions(
  input: Section21ValidationInput
): Section21ValidationResult {
  const errors: Section21PreconditionError[] = [];

  // =========================================================================
  // 1. DEPOSIT PROTECTION (if deposit taken)
  // Housing Act 1988 s.21(3), Housing Act 2004 s.213-215
  // =========================================================================
  const depositTaken = input.deposit_taken === true || (input.deposit_amount && input.deposit_amount > 0);

  if (depositTaken) {
    // 1a. Deposit must be protected in approved scheme
    const depositProtected = input.deposit_protected === true;

    if (!depositProtected) {
      if (input.deposit_protected === false) {
        errors.push({
          code: 'S21_DEPOSIT_NOT_PROTECTED',
          message:
            'Section 21 cannot be served because the deposit is not protected in an approved scheme. ' +
            'You must protect the deposit in DPS, MyDeposits, or TDS within 30 days of receipt.',
          evidenceFields: ['deposit_protected', 'deposit_scheme', 'deposit_scheme_name'],
          legalBasis: 'Housing Act 2004 s.213-215, Localism Act 2011',
          severity: 'blocker',
        });
      } else {
        // Unknown status - still a blocker
        errors.push({
          code: 'S21_DEPOSIT_PROTECTION_UNKNOWN',
          message:
            'Cannot verify deposit protection status. You must confirm the deposit is protected in an approved scheme ' +
            'before serving a Section 21 notice.',
          evidenceFields: ['deposit_protected', 'deposit_scheme'],
          legalBasis: 'Housing Act 2004 s.213-215',
          severity: 'blocker',
        });
      }
    }

    // 1b. Prescribed information must be served within 30 days
    const prescribedInfoServed =
      input.prescribed_info_served === true || input.prescribed_info_given === true;

    if (!prescribedInfoServed) {
      if (input.prescribed_info_served === false || input.prescribed_info_given === false) {
        errors.push({
          code: 'S21_PRESCRIBED_INFO_NOT_SERVED',
          message:
            'Section 21 cannot be served because the prescribed information about the deposit was not provided to the tenant. ' +
            'Prescribed information must be given within 30 days of protecting the deposit.',
          evidenceFields: ['prescribed_info_served', 'prescribed_info_given'],
          legalBasis: 'Housing (Tenancy Deposits) (Prescribed Information) Order 2007',
          severity: 'blocker',
        });
      } else {
        errors.push({
          code: 'S21_PRESCRIBED_INFO_UNKNOWN',
          message:
            'Cannot verify if prescribed information was served. You must confirm the prescribed information ' +
            'was provided to the tenant within 30 days of protecting the deposit.',
          evidenceFields: ['prescribed_info_served', 'prescribed_info_given'],
          legalBasis: 'Housing (Tenancy Deposits) (Prescribed Information) Order 2007',
          severity: 'blocker',
        });
      }
    }
  }

  // =========================================================================
  // 2. GAS SAFETY CERTIFICATE (if gas appliances present)
  // Gas Safety (Installation and Use) Regulations 1998
  // =========================================================================
  const hasGasAppliances = input.has_gas_appliances === true;

  if (hasGasAppliances) {
    const gasCertServed =
      input.gas_safety_cert_served === true || input.gas_certificate_provided === true;

    if (!gasCertServed) {
      if (input.gas_safety_cert_served === false || input.gas_certificate_provided === false) {
        errors.push({
          code: 'S21_GAS_CERT_NOT_PROVIDED',
          message:
            'Section 21 cannot be served because a valid Gas Safety Certificate was not provided to the tenant. ' +
            'A copy of the current CP12 must be given to the tenant before they move in and annually thereafter.',
          evidenceFields: ['gas_safety_cert_served', 'gas_certificate_provided'],
          legalBasis: 'Gas Safety (Installation and Use) Regulations 1998, Deregulation Act 2015 s.37',
          severity: 'blocker',
        });
      } else if (hasGasAppliances && input.gas_safety_cert_served === undefined) {
        errors.push({
          code: 'S21_GAS_CERT_UNKNOWN',
          message:
            'Cannot verify if Gas Safety Certificate was provided. You must confirm a valid CP12 ' +
            'was given to the tenant before serving a Section 21 notice.',
          evidenceFields: ['gas_safety_cert_served', 'gas_certificate_provided'],
          legalBasis: 'Gas Safety (Installation and Use) Regulations 1998',
          severity: 'blocker',
        });
      }
    }
  }

  // =========================================================================
  // 3. EPC (Energy Performance Certificate)
  // Energy Performance of Buildings Regulations 2012
  // =========================================================================
  const epcServed = input.epc_served === true || input.epc_provided === true;

  if (!epcServed) {
    if (input.epc_served === false || input.epc_provided === false) {
      errors.push({
        code: 'S21_EPC_NOT_PROVIDED',
        message:
          'Section 21 cannot be served because a valid Energy Performance Certificate (EPC) was not provided. ' +
          'An EPC must be given to the tenant free of charge before the tenancy begins.',
        evidenceFields: ['epc_served', 'epc_provided'],
        legalBasis: 'Energy Performance of Buildings Regulations 2012, Deregulation Act 2015 s.37',
        severity: 'blocker',
      });
    } else {
      errors.push({
        code: 'S21_EPC_UNKNOWN',
        message:
          'Cannot verify if EPC was provided. You must confirm a valid Energy Performance Certificate ' +
          'was given to the tenant before serving a Section 21 notice.',
        evidenceFields: ['epc_served', 'epc_provided'],
        legalBasis: 'Energy Performance of Buildings Regulations 2012',
        severity: 'blocker',
      });
    }
  }

  // EPC rating below E is a warning (MEES regulations)
  if (input.epc_rating) {
    const rating = input.epc_rating.toUpperCase();
    if (rating === 'F' || rating === 'G') {
      errors.push({
        code: 'S21_EPC_BELOW_MEES',
        message:
          'The property has an EPC rating of F or G, which is below the Minimum Energy Efficiency Standard. ' +
          'Section 21 may be invalid for tenancies started on or after 1 April 2020 if the property does not meet MEES requirements.',
        evidenceFields: ['epc_rating'],
        legalBasis: 'Energy Efficiency (Private Rented Property) Regulations 2015',
        severity: 'warning',
      });
    }
  }

  // =========================================================================
  // 4. HOW TO RENT GUIDE (for tenancies starting on/after 1 Oct 2015)
  // Deregulation Act 2015 s.37
  // =========================================================================
  // We check the date threshold in the generator, but if the user says they didn't serve it,
  // that's a blocker regardless of start date (they may have started after Oct 2015)
  const howToRentServed = input.how_to_rent_served === true || input.how_to_rent_provided === true;

  if (!howToRentServed) {
    if (input.how_to_rent_served === false || input.how_to_rent_provided === false) {
      errors.push({
        code: 'S21_HOW_TO_RENT_NOT_PROVIDED',
        message:
          "Section 21 cannot be served because the 'How to Rent' guide was not provided to the tenant. " +
          "For tenancies starting on or after 1 October 2015, the guide must be given at the start of the tenancy.",
        evidenceFields: ['how_to_rent_served', 'how_to_rent_provided'],
        legalBasis: 'Deregulation Act 2015 s.37, Assured Shorthold Tenancy Notices Regulations 2015',
        severity: 'blocker',
      });
    } else {
      errors.push({
        code: 'S21_HOW_TO_RENT_UNKNOWN',
        message:
          "Cannot verify if 'How to Rent' guide was provided. You must confirm the guide was given " +
          "to the tenant before serving a Section 21 notice (required for tenancies starting on/after 1 Oct 2015).",
        evidenceFields: ['how_to_rent_served', 'how_to_rent_provided'],
        legalBasis: 'Deregulation Act 2015 s.37',
        severity: 'blocker',
      });
    }
  }

  // =========================================================================
  // 5. PROPERTY LICENSING (if required)
  // Housing Act 2004 Part 2 (HMO) and Part 3 (Selective Licensing)
  // =========================================================================
  const licensingRequired =
    input.licensing_required &&
    input.licensing_required !== 'not_required' &&
    input.licensing_required !== '';

  if (licensingRequired) {
    const hasValidLicence = input.has_valid_licence === true;

    if (!hasValidLicence) {
      if (input.has_valid_licence === false) {
        errors.push({
          code: 'S21_LICENCE_NOT_HELD',
          message:
            'Section 21 cannot be served because the property requires a licence but does not have one. ' +
            `Licensing type required: ${input.licensing_required}. You must obtain the required licence before serving notice.`,
          evidenceFields: ['licensing_required', 'has_valid_licence'],
          legalBasis: 'Housing Act 2004 s.75 (HMO), s.98 (Selective)',
          severity: 'blocker',
        });
      } else {
        errors.push({
          code: 'S21_LICENCE_STATUS_UNKNOWN',
          message:
            `Property licensing is required (${input.licensing_required}) but licence status is not confirmed. ` +
            'You must verify you hold a valid licence before serving a Section 21 notice.',
          evidenceFields: ['licensing_required', 'has_valid_licence'],
          legalBasis: 'Housing Act 2004 s.75 (HMO), s.98 (Selective)',
          severity: 'blocker',
        });
      }
    }
  }

  // =========================================================================
  // 6. RETALIATORY EVICTION BAR
  // Deregulation Act 2015 s.33
  // =========================================================================
  // If tenant complained to council AND improvement notice was served, S21 is barred for 6 months
  const improvementNoticeServed = input.improvement_notice_served === true;

  if (improvementNoticeServed) {
    errors.push({
      code: 'S21_RETALIATORY_EVICTION_BAR',
      message:
        'Section 21 cannot be served because an improvement notice has been served on the property. ' +
        'Section 21 notices are barred for 6 months following the service of an improvement notice. ' +
        'Consider using Section 8 if valid grounds exist.',
      evidenceFields: ['improvement_notice_served', 'tenant_complaint_made', 'council_involvement'],
      legalBasis: 'Deregulation Act 2015 s.33',
      severity: 'blocker',
    });
  }

  // If user explicitly says retaliatory eviction bar applies
  if (input.no_retaliatory_notice === false) {
    errors.push({
      code: 'S21_RETALIATORY_EVICTION_WARNING',
      message:
        'This notice may be served within 6 months of a tenant repair complaint. ' +
        'If the council has been involved or an improvement notice has been served, the notice may be invalid. ' +
        'Seek legal advice before proceeding.',
      evidenceFields: ['no_retaliatory_notice'],
      legalBasis: 'Deregulation Act 2015 s.33',
      severity: 'warning',
    });
  }

  // =========================================================================
  // 7. FOUR-MONTH RULE
  // Housing Act 1988 s.21(4B)
  // =========================================================================
  if (input.tenancy_start_date && input.service_date) {
    const tenancyStart = new Date(input.tenancy_start_date + 'T00:00:00.000Z');
    const serviceDate = new Date(input.service_date + 'T00:00:00.000Z');
    const fourMonthsAfter = new Date(tenancyStart);
    fourMonthsAfter.setUTCMonth(fourMonthsAfter.getUTCMonth() + 4);

    if (serviceDate < fourMonthsAfter) {
      const earliestServiceStr = fourMonthsAfter.toISOString().split('T')[0];
      errors.push({
        code: 'S21_FOUR_MONTH_RULE',
        message:
          `Section 21 cannot be served within the first 4 months of the tenancy. ` +
          `Tenancy started: ${input.tenancy_start_date}. ` +
          `Earliest service date: ${earliestServiceStr}.`,
        evidenceFields: ['tenancy_start_date', 'service_date'],
        legalBasis: 'Housing Act 1988 s.21(4B)',
        severity: 'blocker',
      });
    }
  }

  // =========================================================================
  // BUILD RESULT
  // =========================================================================
  const blockers = errors.filter((e) => e.severity === 'blocker');
  const warnings = errors.filter((e) => e.severity === 'warning');
  const ok = blockers.length === 0;

  let summary: string;
  if (ok && warnings.length === 0) {
    summary = 'All Section 21 statutory preconditions are satisfied.';
  } else if (ok) {
    summary = `Section 21 can proceed with ${warnings.length} warning(s) to review.`;
  } else {
    summary = `Section 21 is BLOCKED by ${blockers.length} issue(s). You must resolve these before the notice can be generated.`;
  }

  return {
    ok,
    errors,
    blockers,
    warnings,
    summary,
  };
}

/**
 * Assert that Section 21 preconditions are met, throwing if not.
 *
 * Use this at generation entry points to enforce the hard gate.
 *
 * @param input - Case facts to validate
 * @throws Error with detailed message if any blockers exist
 */
export function assertSection21Preconditions(input: Section21ValidationInput): void {
  const result = validateSection21Preconditions(input);

  if (!result.ok) {
    const blockerMessages = result.blockers.map((b) => `• ${b.code}: ${b.message}`).join('\n');
    const error = new Error(
      `Section 21 notice generation blocked due to missing/failed statutory preconditions:\n\n${blockerMessages}`
    );
    (error as any).statusCode = 422;
    (error as any).validationErrors = result.blockers.map((b) => ({
      code: b.code,
      message: b.message,
      fields: b.evidenceFields,
    }));
    (error as any).section21Validation = result;
    throw error;
  }
}
