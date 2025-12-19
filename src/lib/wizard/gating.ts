/**
 * Wizard Gating Module
 *
 * Enforces consistent UI gating (blocking + warnings + required follow-ups) across ALL wizard products/forms.
 * Provides deterministic, rule-based validation that does NOT rely on LLM output.
 *
 * Core principle: Return machine-readable blocking/warning structures that API routes can enforce.
 */

import type { ProductType } from './mqs-loader';

// ============================================================================
// TYPES
// ============================================================================

export interface GateBlockingIssue {
  code: string;
  message: string;
  fields?: string[];
  legal_basis?: string;
  user_fix_hint?: string;
}

export interface GateWarning {
  code: string;
  message: string;
  fields?: string[];
}

export interface WizardGateResult {
  blocking: GateBlockingIssue[];
  warnings: GateWarning[];
}

export interface WizardGateInput {
  case_type: string;
  product: ProductType;
  jurisdiction: string;
  facts: Record<string, any>;
  current_question_id?: string;
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Get value from facts, handling both flat and nested paths
 */
function getFactValue(facts: Record<string, any>, path: string): any {
  if (Object.prototype.hasOwnProperty.call(facts, path)) {
    return facts[path];
  }

  return path
    .split('.')
    .filter(Boolean)
    .reduce((acc: any, key) => {
      if (acc === undefined || acc === null) return undefined;
      return acc[key];
    }, facts);
}

/**
 * Calculate arrears in months from arrears amount and rent
 */
function calculateArrearsInMonths(
  arrearsAmount: number,
  rentAmount: number,
  rentFrequency: string
): number {
  if (rentAmount <= 0) return 0;

  switch (rentFrequency?.toLowerCase()) {
    case 'weekly':
      // 4.33 weeks per month (365.25 days / 12 months / 7 days)
      return (arrearsAmount / rentAmount) / 4.33;
    case 'fortnightly':
      return (arrearsAmount / rentAmount) / 2.165;
    case 'monthly':
      return arrearsAmount / rentAmount;
    case 'quarterly':
      return (arrearsAmount / rentAmount) * 3;
    case 'yearly':
      return (arrearsAmount / rentAmount) * 12;
    default:
      // Assume monthly if unknown
      return arrearsAmount / rentAmount;
  }
}

/**
 * Extract ground codes from section8_grounds array
 * Handles formats like "Ground 8 - Serious rent arrears" or "ground_8"
 */
function extractGroundCodes(section8Grounds: any[]): number[] {
  if (!Array.isArray(section8Grounds)) return [];

  return section8Grounds
    .map((g: any) => {
      if (typeof g === 'number') return g;
      if (typeof g !== 'string') return null;

      // Try "Ground 8" format
      const match = g.match(/Ground\s+(\d+)/i);
      if (match) return parseInt(match[1], 10);

      // Try "ground_8" format
      const underscoreMatch = g.match(/ground[_\s](\d+)/i);
      if (underscoreMatch) return parseInt(underscoreMatch[1], 10);

      return null;
    })
    .filter((code): code is number => code !== null && !isNaN(code));
}

/**
 * Check if particulars exist for a given ground
 */
function hasParticularsForGround(facts: Record<string, any>, groundCode: number): boolean {
  // Check structured particulars: ground_particulars.ground_8.summary or section_8_particulars.ground_8
  const structuredPath1 = getFactValue(facts, `ground_particulars.ground_${groundCode}.summary`);
  const structuredPath2 = getFactValue(facts, `section_8_particulars.ground_${groundCode}`);

  if (structuredPath1 && typeof structuredPath1 === 'string' && structuredPath1.trim().length > 0) {
    return true;
  }

  if (structuredPath2 && typeof structuredPath2 === 'string' && structuredPath2.trim().length > 0) {
    return true;
  }

  // Check legacy flat field: ground_particulars (contains all grounds in one text blob)
  const flatParticulars = getFactValue(facts, 'ground_particulars');
  if (flatParticulars && typeof flatParticulars === 'string' && flatParticulars.trim().length > 0) {
    // If it mentions "Ground {code}" assume it has particulars for that ground
    const regex = new RegExp(`Ground\\s+${groundCode}\\b`, 'i');
    return regex.test(flatParticulars);
  }

  return false;
}

// ============================================================================
// EVICTION GATING RULES (England & Wales)
// ============================================================================

function evaluateEvictionGating(input: WizardGateInput): WizardGateResult {
  const { facts, jurisdiction } = input;
  const blocking: GateBlockingIssue[] = [];
  const warnings: GateWarning[] = [];

  if (jurisdiction !== 'england' && jurisdiction !== 'england-wales' && jurisdiction !== 'wales') {
    // Scotland/NI have different rules - skip for now
    return { blocking, warnings };
  }

  // ============================================================================
  // GATE 1: Section 8 Ground 8 Threshold
  // ============================================================================

  const selectedRoute = getFactValue(facts, 'selected_notice_route') ||
                       getFactValue(facts, 'eviction_route') ||
                       getFactValue(facts, 'notice_type');

  const section8Grounds = getFactValue(facts, 'section8_grounds') || [];
  const groundCodes = extractGroundCodes(section8Grounds);

  if (groundCodes.indexOf(8) !== -1) {
    // User has selected Ground 8 - check threshold
    const rentAmount = getFactValue(facts, 'rent_amount') ||
                      getFactValue(facts, 'tenancy.rent_amount') || 0;
    const rentFrequency = getFactValue(facts, 'rent_frequency') ||
                         getFactValue(facts, 'tenancy.rent_frequency') || 'monthly';

    // Check multiple possible arrears fields
    const arrearsAmount = getFactValue(facts, 'arrears_amount') ||
                         getFactValue(facts, 'arrears_total') ||
                         getFactValue(facts, 'issues.rent_arrears.total_arrears') || 0;

    // Validate we have the data to evaluate threshold
    if (rentAmount <= 0) {
      blocking.push({
        code: 'GROUND_8_MISSING_RENT_AMOUNT',
        message: 'Ground 8 requires rent amount to be specified',
        fields: ['rent_amount'],
        user_fix_hint: 'Please provide the monthly or weekly rent amount',
      });
    }

    if (!rentFrequency) {
      blocking.push({
        code: 'GROUND_8_MISSING_RENT_FREQUENCY',
        message: 'Ground 8 requires rent frequency to be specified',
        fields: ['rent_frequency'],
        user_fix_hint: 'Please specify whether rent is paid weekly, monthly, etc.',
      });
    }

    if (arrearsAmount <= 0) {
      blocking.push({
        code: 'GROUND_8_MISSING_ARREARS',
        message: 'Ground 8 requires arrears amount to be specified',
        fields: ['arrears_amount', 'arrears_total'],
        user_fix_hint: 'Please provide the total arrears amount owed',
      });
    }

    // If we have all data, check the threshold
    if (rentAmount > 0 && rentFrequency && arrearsAmount > 0) {
      const arrearsInMonths = calculateArrearsInMonths(arrearsAmount, rentAmount, rentFrequency);

      if (arrearsInMonths < 2) {
        blocking.push({
          code: 'GROUND_8_THRESHOLD_NOT_MET',
          message: `Ground 8 requires at least 2 months' rent in arrears. Current arrears: ${arrearsInMonths.toFixed(2)} months.`,
          fields: ['arrears_amount', 'section8_grounds'],
          legal_basis: 'Housing Act 1988, Schedule 2, Ground 8: "at least two months\' rent is unpaid" at both notice date and hearing date',
          user_fix_hint: 'Remove Ground 8 from your selection, or use discretionary grounds (Ground 10, 11) instead. Ground 8 can only be used when arrears are 2+ months.',
        });
      } else if (arrearsInMonths < 3) {
        warnings.push({
          code: 'GROUND_8_BORDERLINE',
          message: `Ground 8 arrears (${arrearsInMonths.toFixed(2)} months) are close to the threshold. Ensure arrears still meet 2+ months at both notice service AND hearing date.`,
          fields: ['arrears_amount'],
        });
      }
    }
  }

  // ============================================================================
  // GATE 2: Deposit Questions - Consistency
  // ============================================================================

  const depositTaken = getFactValue(facts, 'deposit_taken');
  const depositAmount = getFactValue(facts, 'deposit_amount') ||
                       getFactValue(facts, 'tenancy.deposit_amount');
  const depositProtected = getFactValue(facts, 'deposit_protected') ||
                          getFactValue(facts, 'tenancy.deposit_protected');
  const prescribedInfoGiven = getFactValue(facts, 'prescribed_info_given');

  // If deposit taken, must have deposit_amount
  if (depositTaken === true) {
    if (depositAmount === undefined || depositAmount === null) {
      blocking.push({
        code: 'DEPOSIT_AMOUNT_REQUIRED',
        message: 'Deposit amount must be specified when deposit was taken',
        fields: ['deposit_amount'],
        user_fix_hint: 'Please provide the deposit amount that was collected from the tenant',
      });
    }

    // If deposit amount > 0, must specify if protected
    if (depositAmount > 0 && depositProtected === undefined) {
      blocking.push({
        code: 'DEPOSIT_PROTECTION_STATUS_REQUIRED',
        message: 'You must specify whether the deposit is protected in an approved scheme',
        fields: ['deposit_protected'],
        user_fix_hint: 'Indicate whether the deposit is protected in DPS, MyDeposits, or TDS',
      });
    }

    // If deposit protected, must specify if prescribed info given
    if (depositAmount > 0 && depositProtected === true && prescribedInfoGiven === undefined) {
      warnings.push({
        code: 'PRESCRIBED_INFO_STATUS_UNCLEAR',
        message: 'For Section 21 notices, prescribed information must have been given within 30 days of taking the deposit',
        fields: ['prescribed_info_given'],
      });
    }
  }

  // Inconsistency: deposit not taken but amount > 0
  if (depositTaken === false && depositAmount > 0) {
    warnings.push({
      code: 'DEPOSIT_INCONSISTENCY',
      message: 'You indicated no deposit was taken, but deposit amount is greater than zero. Please verify.',
      fields: ['deposit_taken', 'deposit_amount'],
    });
  }

  // ============================================================================
  // GATE 3: Route Selection - Section 21 Blockers
  // ============================================================================

  if (selectedRoute === 'section_21' || selectedRoute?.toLowerCase().includes('section 21')) {
    // Only enforce Section 21 blockers if deposit was actually taken
    if (depositTaken === true && depositAmount > 0) {
      if (depositProtected === false) {
        blocking.push({
          code: 'SECTION_21_DEPOSIT_NOT_PROTECTED',
          message: 'Section 21 notice is invalid if deposit is not protected in an approved scheme',
          fields: ['deposit_protected', 'selected_notice_route'],
          legal_basis: 'Housing Act 1988, Section 21(1A) and Deregulation Act 2015',
          user_fix_hint: 'Protect the deposit in DPS, MyDeposits, or TDS before serving Section 21, OR use Section 8 instead',
        });
      }

      if (depositProtected === true && prescribedInfoGiven === false) {
        blocking.push({
          code: 'SECTION_21_PRESCRIBED_INFO_NOT_GIVEN',
          message: 'Section 21 notice is invalid if prescribed information was not given within 30 days',
          fields: ['prescribed_info_given', 'selected_notice_route'],
          legal_basis: 'Housing Act 2004, Section 213',
          user_fix_hint: 'Provide prescribed information to the tenant before serving Section 21, OR use Section 8 instead',
        });
      }
    }

    // Gas safety certificate (if property has gas appliances)
    const hasGasAppliances = getFactValue(facts, 'has_gas_appliances');
    const gasCertProvided = getFactValue(facts, 'gas_certificate_provided') ||
                           getFactValue(facts, 'gas_safety_cert_provided');

    if (hasGasAppliances === true && gasCertProvided === false) {
      blocking.push({
        code: 'SECTION_21_GAS_CERT_MISSING',
        message: 'Section 21 notice is invalid if gas safety certificate was not provided',
        fields: ['gas_certificate_provided', 'selected_notice_route'],
        legal_basis: 'Gas Safety (Installation and Use) Regulations 1998 and Deregulation Act 2015',
        user_fix_hint: 'Provide valid gas safety certificate to tenant before serving Section 21, OR use Section 8 instead',
      });
    }

    // EPC
    const epcProvided = getFactValue(facts, 'epc_provided');
    if (epcProvided === false) {
      blocking.push({
        code: 'SECTION_21_EPC_MISSING',
        message: 'Section 21 notice is invalid if Energy Performance Certificate was not provided',
        fields: ['epc_provided', 'selected_notice_route'],
        legal_basis: 'Energy Performance of Buildings Regulations 2012 and Deregulation Act 2015',
        user_fix_hint: 'Provide EPC to tenant before serving Section 21, OR use Section 8 instead',
      });
    }

    // Property licensing
    const propertyLicensingStatus = getFactValue(facts, 'property_licensing_status');
    if (propertyLicensingStatus === 'unlicensed') {
      blocking.push({
        code: 'SECTION_21_UNLICENSED_PROPERTY',
        message: 'Section 21 notice cannot be served for unlicensed HMO or selectively licensed property',
        fields: ['property_licensing_status', 'selected_notice_route'],
        legal_basis: 'Housing Act 2004, Section 75 and Housing and Planning Act 2016, Section 41',
        user_fix_hint: 'Obtain required property license before serving Section 21, OR use Section 8 instead',
      });
    }
  }

  // ============================================================================
  // GATE 4: Ground Particulars Completeness
  // ============================================================================

  if (selectedRoute === 'section_8' || selectedRoute?.toLowerCase().includes('section 8')) {
    if (groundCodes.length > 0) {
      const missingParticulars: number[] = [];

      for (const groundCode of groundCodes) {
        if (!hasParticularsForGround(facts, groundCode)) {
          missingParticulars.push(groundCode);
        }
      }

      if (missingParticulars.length > 0) {
        blocking.push({
          code: 'GROUND_PARTICULARS_INCOMPLETE',
          message: `Ground particulars are required for Ground(s): ${missingParticulars.join(', ')}`,
          fields: ['ground_particulars', 'section_8_particulars'],
          legal_basis: 'Housing Act 1988, Section 8(3): notice must specify grounds and give particulars',
          user_fix_hint: `Provide specific details (dates, amounts, incidents) for each ground selected. Missing: Ground ${missingParticulars.join(', Ground ')}`,
        });
      }
    }

    // Warn if only discretionary grounds selected
    const mandatoryGrounds = groundCodes.filter(code => code >= 1 && code <= 8);
    if (groundCodes.length > 0 && mandatoryGrounds.length === 0) {
      warnings.push({
        code: 'SECTION_8_ONLY_DISCRETIONARY',
        message: 'You have selected only discretionary grounds (9-17). The court has discretion to refuse possession even if grounds are proven. Consider adding a mandatory ground (1-8) if applicable.',
        fields: ['section8_grounds'],
      });
    }
  }

  return { blocking, warnings };
}

// ============================================================================
// MONEY CLAIM GATING RULES
// ============================================================================

function evaluateMoneyClaimGating(input: WizardGateInput): WizardGateResult {
  const { facts } = input;
  const blocking: GateBlockingIssue[] = [];
  const warnings: GateWarning[] = [];

  // Basic validation: must have claim amount
  const claimAmount = getFactValue(facts, 'claim_amount') ||
                     getFactValue(facts, 'total_claim_amount');

  if (claimAmount === undefined || claimAmount === null || claimAmount <= 0) {
    blocking.push({
      code: 'CLAIM_AMOUNT_REQUIRED',
      message: 'Money claim requires a claim amount greater than zero',
      fields: ['claim_amount'],
      user_fix_hint: 'Specify the total amount you are claiming',
    });
  }

  // Must have defendant details
  const defendantName = getFactValue(facts, 'defendant_name') ||
                       getFactValue(facts, 'tenant_full_name');

  if (!defendantName || (typeof defendantName === 'string' && defendantName.trim().length === 0)) {
    blocking.push({
      code: 'DEFENDANT_NAME_REQUIRED',
      message: 'Defendant name is required for money claim',
      fields: ['defendant_name', 'tenant_full_name'],
      user_fix_hint: 'Provide the full name of the defendant (tenant)',
    });
  }

  return { blocking, warnings };
}

// ============================================================================
// TENANCY AGREEMENT GATING RULES
// ============================================================================

function evaluateTenancyAgreementGating(input: WizardGateInput): WizardGateResult {
  const { facts } = input;
  const blocking: GateBlockingIssue[] = [];
  const warnings: GateWarning[] = [];

  // Validate deposit consistency for tenancy agreements too
  const depositTaken = getFactValue(facts, 'deposit_taken');
  const depositAmount = getFactValue(facts, 'deposit_amount');

  if (depositTaken === true) {
    if (depositAmount === undefined || depositAmount === null) {
      blocking.push({
        code: 'DEPOSIT_AMOUNT_REQUIRED',
        message: 'Deposit amount must be specified when deposit is being taken',
        fields: ['deposit_amount'],
        user_fix_hint: 'Specify the deposit amount you will collect',
      });
    }
  }

  return { blocking, warnings };
}

// ============================================================================
// MAIN GATING FUNCTION
// ============================================================================

/**
 * Evaluate wizard gating rules for any product/case type.
 * Returns blocking issues and warnings.
 *
 * This is the single source of truth for UI gating across all wizard products.
 */
export function evaluateWizardGate(input: WizardGateInput): WizardGateResult {
  // Route to appropriate gating function based on case_type
  switch (input.case_type) {
    case 'eviction':
      return evaluateEvictionGating(input);
    case 'money_claim':
      return evaluateMoneyClaimGating(input);
    case 'tenancy_agreement':
      return evaluateTenancyAgreementGating(input);
    default:
      // Unknown case type - no gating
      return { blocking: [], warnings: [] };
  }
}
