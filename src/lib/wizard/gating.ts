/**
 * Wizard Gating Module
 *
 * Enforces consistent UI gating (blocking + warnings + required follow-ups) across ALL wizard products/forms.
 * Provides deterministic, rule-based validation that does NOT rely on LLM output.
 *
 * Core principle: Return machine-readable blocking/warning structures that API routes can enforce.
 */

import type { ProductType } from './mqs-loader';
import { resolveFactValue, validateJurisdictionCompliance, type ValidationStage } from '@/lib/jurisdictions/validators';
import type { JurisdictionKey } from '@/lib/jurisdictions/rulesLoader';
import { deriveCanonicalJurisdiction } from '@/lib/types/jurisdiction';
import {
  validateGround8Eligibility,
  hasAuthoritativeArrearsData,
  getAuthoritativeArrears,
} from '@/lib/arrears-engine';
import type { ArrearsItem } from '@/lib/case-facts/schema';

// ============================================================================
// TYPES
// ============================================================================

export interface GateBlockingIssue {
  code: string;
  message: string;
  fields?: string[];
  legal_basis?: string;
  user_fix_hint?: string;
  user_message?: string;
  internal_reason?: string;
  affected_question_id?: string;
}

export interface GateWarning {
  code: string;
  message: string;
  fields?: string[];
  affected_question_id?: string;
  user_fix_hint?: string;
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
  stage?: ValidationStage;
}

// ============================================================================
// HELPERS
// ============================================================================

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
  const structuredPath1 = resolveFactValue(facts, `ground_particulars.ground_${groundCode}.summary`);
  const structuredPath2 = resolveFactValue(facts, `section_8_particulars.ground_${groundCode}`);

  if (structuredPath1 && typeof structuredPath1 === 'string' && structuredPath1.trim().length > 0) {
    return true;
  }

  if (structuredPath2 && typeof structuredPath2 === 'string' && structuredPath2.trim().length > 0) {
    return true;
  }

  // Check legacy flat field: ground_particulars (contains all grounds in one text blob)
  const flatParticulars = resolveFactValue(facts, 'ground_particulars');
  if (flatParticulars && typeof flatParticulars === 'string' && flatParticulars.trim().length > 0) {
    // If it mentions "Ground {code}" assume it has particulars for that ground
    const regex = new RegExp(`Ground\\s+${groundCode}\\b`, 'i');
    return regex.test(flatParticulars);
  }

  return false;
}

// ============================================================================
// EVICTION GATING RULES (multi-jurisdiction: England, Wales, Scotland, Northern Ireland)
// ============================================================================

function evaluateEvictionGating(input: WizardGateInput): WizardGateResult {
  const { facts, jurisdiction, stage = 'wizard' } = input;
  const blocking: GateBlockingIssue[] = [];
  const warnings: GateWarning[] = [];

  const normalizedInput = typeof jurisdiction === 'string' ? jurisdiction.trim().toLowerCase() : '';

  if (!normalizedInput) {
    blocking.push({
      code: 'JURISDICTION_REQUIRED',
      message: 'Jurisdiction is required for legal gating',
      fields: ['jurisdiction'],
      user_fix_hint: 'Select the correct jurisdiction to run legal validation',
    });

    return { blocking, warnings };
  }

  const canonicalJurisdiction = deriveCanonicalJurisdiction(normalizedInput, facts);

  if (!canonicalJurisdiction) {
    blocking.push({
      code: 'JURISDICTION_INVALID',
      message: 'Jurisdiction is invalid or unsupported for eviction',
      fields: ['jurisdiction'],
      user_fix_hint:
        'Choose a supported jurisdiction (England, Wales, or Scotland) or provide property_location to migrate legacy cases.',
    });

    return { blocking, warnings };
  }

  if (canonicalJurisdiction === 'northern-ireland') {
    blocking.push({
      code: 'JURISDICTION_EVICTION_UNSUPPORTED',
      message: 'Eviction notices are not supported in Northern Ireland',
      user_message: 'Eviction notices for Northern Ireland are not yet supported.',
      fields: ['jurisdiction'],
    });

    return { blocking, warnings };
  }

  const jurisdictionKey: JurisdictionKey | undefined = canonicalJurisdiction as JurisdictionKey;

  // ============================================================================
  // GATE 1: Section 8 Ground 8 Threshold
  // ============================================================================

  const selectedRoute = resolveFactValue(facts, 'selected_notice_route') ||
                       resolveFactValue(facts, 'eviction_route') ||
                       resolveFactValue(facts, 'notice_type');

  const section8Grounds = resolveFactValue(facts, 'section8_grounds') || [];
  const groundCodes = extractGroundCodes(section8Grounds);

  // ============================================================================
  // CONFIG-DRIVEN VALIDATION (all jurisdictions)
  // ============================================================================
  const jurisdictionValidation = validateJurisdictionCompliance({
    jurisdiction: jurisdictionKey,
    facts,
    selectedGroundCodes: groundCodes,
    product: input.product || 'unknown',
    route: selectedRoute,
    stage,
  });

  if (jurisdictionValidation.blocking.length > 0) {
    blocking.push(
      ...jurisdictionValidation.blocking.map((issue) => ({
        code: issue.code,
        message: issue.user_message || issue.code,
        user_message: issue.user_message,
        internal_reason: issue.internal_reason,
        fields: issue.fields,
      }))
    );
  }

  if (jurisdictionValidation.warnings.length > 0) {
    warnings.push(
      ...jurisdictionValidation.warnings.map((issue) => ({
        code: issue.code,
        message: issue.user_message || issue.code,
        fields: issue.fields,
      }))
    );
  }

  if (groundCodes.indexOf(8) !== -1) {
    // User has selected Ground 8 - check threshold using canonical arrears engine
    const rentAmount = resolveFactValue(facts, 'rent_amount') ||
                      resolveFactValue(facts, 'tenancy.rent_amount') || 0;
    const rentFrequency = resolveFactValue(facts, 'rent_frequency') ||
                         resolveFactValue(facts, 'tenancy.rent_frequency') || 'monthly';

    // Get arrears_items from canonical locations
    const arrearsItems: ArrearsItem[] = resolveFactValue(facts, 'issues.rent_arrears.arrears_items') ||
                                         resolveFactValue(facts, 'arrears_items') || [];

    // Legacy flat total for backwards compatibility
    const legacyArrearsTotal = resolveFactValue(facts, 'arrears_amount') ||
                               resolveFactValue(facts, 'arrears_total') ||
                               resolveFactValue(facts, 'issues.rent_arrears.total_arrears') || 0;

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

    // Check if we have authoritative arrears data (schedule) or only legacy flat total
    const hasScheduleData = hasAuthoritativeArrearsData(arrearsItems, legacyArrearsTotal);

    if (!hasScheduleData && legacyArrearsTotal <= 0) {
      blocking.push({
        code: 'GROUND_8_MISSING_ARREARS',
        message: 'Ground 8 requires arrears data. Please complete the arrears schedule.',
        fields: ['arrears_items', 'arrears_amount', 'arrears_total'],
        user_fix_hint: 'Complete the arrears schedule to specify rent due and paid for each period',
      });
    }

    // If we have data, validate Ground 8 using canonical engine
    if (rentAmount > 0 && rentFrequency && (arrearsItems.length > 0 || legacyArrearsTotal > 0)) {
      const ground8Result = validateGround8Eligibility({
        arrears_items: arrearsItems,
        rent_amount: rentAmount,
        rent_frequency: rentFrequency,
        jurisdiction: canonicalJurisdiction as 'england' | 'wales' | 'scotland' | 'northern-ireland',
        legacy_total_arrears: legacyArrearsTotal,
      });

      if (!ground8Result.is_eligible) {
        blocking.push({
          code: 'GROUND_8_THRESHOLD_NOT_MET',
          message: ground8Result.explanation,
          fields: ['arrears_items', 'section8_grounds'],
          legal_basis: 'Housing Act 1988, Schedule 2, Ground 8: "at least two months\' rent is unpaid" at both notice date and hearing date',
          user_fix_hint: 'Remove Ground 8 from your selection, or use discretionary grounds (Ground 10, 11) instead. Ground 8 can only be used when arrears are 2+ months.',
        });
      } else if (ground8Result.arrears_in_months < 3) {
        warnings.push({
          code: 'GROUND_8_BORDERLINE',
          message: `Ground 8 arrears (${ground8Result.arrears_in_months.toFixed(2)} months) are close to the threshold. Ensure arrears still meet 2+ months at both notice service AND hearing date.`,
          fields: ['arrears_items'],
        });
      }

      // Warn if using legacy data (no schedule)
      if (!ground8Result.is_authoritative && ground8Result.legacy_warning) {
        warnings.push({
          code: 'GROUND_8_LEGACY_DATA_WARNING',
          message: ground8Result.legacy_warning,
          fields: ['arrears_items'],
          user_fix_hint: 'Complete the arrears schedule for stronger court evidence.',
        });
      }
    }
  }

  // ============================================================================
  // GATE 2: Deposit Questions - Consistency
  // ============================================================================
  // NOTE: Deposit protection is ONLY a blocking requirement for Section 21 notices
  // in England. For other routes (Section 8, Wales fault-based, Scotland),
  // deposit questions are informational only and should not block document generation.

  const depositTaken = resolveFactValue(facts, 'deposit_taken');
  const depositAmount = resolveFactValue(facts, 'deposit_amount') ??
                       resolveFactValue(facts, 'tenancy.deposit_amount');
  const depositProtected = resolveFactValue(facts, 'deposit_protected') ??
                          resolveFactValue(facts, 'tenancy.deposit_protected');
  // Check canonical location first, then legacy/alternative field names
  const prescribedInfoGiven = resolveFactValue(facts, 'tenancy.prescribed_info_given') ??
                              resolveFactValue(facts, 'prescribed_info_given') ??
                              resolveFactValue(facts, 'prescribed_info_provided') ??
                              resolveFactValue(facts, 'prescribed_info_served');

  // Determine if this is a Section 21 route (only route where deposit is a blocking requirement)
  const isSection21Route = selectedRoute === 'section_21' ||
                           selectedRoute === 'section-21' ||
                           selectedRoute?.toLowerCase().includes('section 21') ||
                           selectedRoute?.toLowerCase().includes('section_21');

  // If deposit taken, must have deposit_amount - but only block for Section 21
  if (depositTaken === true) {
    if (depositAmount === undefined || depositAmount === null) {
      if (isSection21Route) {
        // Section 21 requires deposit compliance - this is a blocking issue
        blocking.push({
          code: 'DEPOSIT_AMOUNT_REQUIRED',
          message: 'Deposit amount must be specified when deposit was taken',
          fields: ['deposit_amount'],
          user_fix_hint: 'Please provide the deposit amount that was collected from the tenant',
          affected_question_id: 'deposit_amount',
        });
      }
      // For non-Section 21 routes, don't block - deposit is informational only
    }

    // If deposit amount > 0, must specify if protected - only for Section 21
    if (isSection21Route && depositAmount > 0 && depositProtected === undefined) {
      blocking.push({
        code: 'DEPOSIT_PROTECTION_STATUS_REQUIRED',
        message: 'You must specify whether the deposit is protected in an approved scheme',
        fields: ['deposit_protected'],
        user_fix_hint: 'Indicate whether the deposit is protected in DPS, MyDeposits, or TDS',
        affected_question_id: 'deposit_protected_scheme',
      });
    }

    if (isSection21Route && depositAmount > 0 && depositProtected === true) {
      // Check for deposit scheme name - look for 'deposit_scheme' (new MQS field)
      // with fallback to legacy 'deposit_protected_scheme' for backward compatibility
      const depositScheme =
        resolveFactValue(facts, 'deposit_scheme') ??
        resolveFactValue(facts, 'deposit_scheme_name') ??
        resolveFactValue(facts, 'deposit_protected_scheme');
      if (depositScheme === undefined || depositScheme === null || String(depositScheme).trim().length === 0) {
        blocking.push({
          code: 'DEPOSIT_FIELD_REQUIRED',
          message: 'Deposit protection scheme details are required when a deposit is protected',
          fields: ['deposit_scheme', 'deposit_scheme_name'],
          user_fix_hint: 'Select the deposit protection scheme (DPS, MyDeposits, or TDS).',
          affected_question_id: 'deposit_scheme_name',
        });
      }

      if (prescribedInfoGiven === undefined || prescribedInfoGiven === null) {
        blocking.push({
          code: 'PRESCRIBED_INFO_MISSING',
          message: 'Prescribed information must be confirmed when a deposit is protected',
          fields: ['prescribed_info_given'],
          user_fix_hint: 'Answer whether prescribed information was served within 30 days of taking the deposit.',
          affected_question_id: 'prescribed_info_given',
        });
      }
    }

    // If deposit protected, must specify if prescribed info given
    if (depositAmount > 0 && depositProtected === true && prescribedInfoGiven === undefined) {
      warnings.push({
        code: 'PRESCRIBED_INFO_STATUS_UNCLEAR',
        message: 'For Section 21 notices, prescribed information must have been given within 30 days of taking the deposit',
        fields: ['prescribed_info_given'],
        affected_question_id: 'prescribed_info_given',
        user_fix_hint: 'Confirm whether prescribed information has been served to avoid Section 21 risk.',
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
    // Check multiple possible field names from wizard and legacy systems
    const hasGasAppliances = resolveFactValue(facts, 'has_gas_appliances') ??
                            resolveFactValue(facts, 'has_gas_at_property') ??
                            resolveFactValue(facts, 'property_has_gas');
    const gasCertProvided = resolveFactValue(facts, 'gas_certificate_provided') ??
                           resolveFactValue(facts, 'gas_safety_cert_provided') ??
                           resolveFactValue(facts, 'gas_safety_cert_served') ??  // Wizard MQS field
                           resolveFactValue(facts, 'gas_safety_provided');

    if (hasGasAppliances === true && gasCertProvided === false) {
      blocking.push({
        code: 'SECTION_21_GAS_CERT_MISSING',
        message: 'Section 21 notice is invalid if gas safety certificate was not provided',
        fields: ['gas_safety_cert_served', 'gas_certificate_provided', 'selected_notice_route'],
        legal_basis: 'Gas Safety (Installation and Use) Regulations 1998 and Deregulation Act 2015',
        user_fix_hint: 'Provide valid gas safety certificate to tenant before serving Section 21, OR use Section 8 instead',
      });
    }

    // EPC - check multiple possible field names
    const epcProvided = resolveFactValue(facts, 'epc_provided') ??
                       resolveFactValue(facts, 'epc_served');  // Wizard MQS field
    if (epcProvided === false) {
      blocking.push({
        code: 'SECTION_21_EPC_MISSING',
        message: 'Section 21 notice is invalid if Energy Performance Certificate was not provided',
        fields: ['epc_served', 'epc_provided', 'selected_notice_route'],
        legal_basis: 'Energy Performance of Buildings Regulations 2012 and Deregulation Act 2015',
        user_fix_hint: 'Provide EPC to tenant before serving Section 21, OR use Section 8 instead',
      });
    }

    // Property licensing - check wizard field names
    // Wizard uses: licensing_required (select: none/mandatory_hmo/additional_hmo/selective)
    //              has_valid_licence (boolean, shown if licensing_required != none)
    const licensingRequired = resolveFactValue(facts, 'licensing_required');
    const hasValidLicence = resolveFactValue(facts, 'has_valid_licence');
    const propertyLicensingStatus = resolveFactValue(facts, 'property_licensing_status');

    // Block if: licensing is required AND no valid licence
    const needsLicence = licensingRequired && licensingRequired !== 'none' && licensingRequired !== 'no_licensing_required';
    const isUnlicensed = propertyLicensingStatus === 'unlicensed' || (needsLicence && hasValidLicence === false);

    if (isUnlicensed) {
      blocking.push({
        code: 'SECTION_21_UNLICENSED_PROPERTY',
        message: 'Section 21 notice cannot be served for unlicensed HMO or selectively licensed property',
        fields: ['licensing_required', 'has_valid_licence', 'property_licensing_status', 'selected_notice_route'],
        legal_basis: 'Housing Act 2004, Section 75 and Housing and Planning Act 2016, Section 41',
        user_fix_hint: 'Obtain required property license before serving Section 21, OR use Section 8 instead',
      });
    }

    // How to Rent guide - required for Section 21 in England
    // Wizard uses: how_to_rent_served (boolean)
    const howToRentProvided = resolveFactValue(facts, 'how_to_rent_served') ??
                              resolveFactValue(facts, 'how_to_rent_provided');
    if (howToRentProvided === false) {
      blocking.push({
        code: 'SECTION_21_HOW_TO_RENT_MISSING',
        message: 'Section 21 notice is invalid if the "How to Rent" guide was not provided to the tenant',
        fields: ['how_to_rent_served', 'how_to_rent_provided', 'selected_notice_route'],
        legal_basis: 'Deregulation Act 2015, Section 21A(1) and Assured Shorthold Tenancy Notices and Prescribed Requirements (England) Regulations 2015',
        user_fix_hint: 'Provide the current "How to Rent: the checklist for renting in England" guide to the tenant before serving Section 21',
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

  // ============================================================================
  // GATE 5: Court Details for Complete Pack Generation (England/Wales only)
  // ============================================================================
  // Court details are REQUIRED for complete pack generation (N5, N5B, N119)
  // Court details are NOT required for notice-only generation

  const isCompletePack = resolveFactValue(facts, 'product_tier') === 'complete_pack' ||
                         resolveFactValue(facts, 'pack_type') === 'complete';
  const isEnglandWales = canonicalJurisdiction === 'england' || canonicalJurisdiction === 'wales';

  // Only enforce court details at generation stage for complete packs
  if (stage === 'generation' && isCompletePack && isEnglandWales) {
    const courtName = resolveFactValue(facts, 'court_name') ||
                      resolveFactValue(facts, 'case_facts.court.court_name');

    if (!courtName || (typeof courtName === 'string' && courtName.trim().length === 0)) {
      blocking.push({
        code: 'COURT_DETAILS_REQUIRED',
        message: 'Court name is required for generating court forms (N5, N5B, N119)',
        fields: ['court_name'],
        user_fix_hint: 'Use the HMCTS Court Finder to find your local County Court and enter the court name and address.',
        user_message: 'Please provide court details before generating court forms.',
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
  const claimAmount = resolveFactValue(facts, 'claim_amount') ||
                     resolveFactValue(facts, 'total_claim_amount');

  if (claimAmount === undefined || claimAmount === null || claimAmount <= 0) {
    blocking.push({
      code: 'CLAIM_AMOUNT_REQUIRED',
      message: 'Money claim requires a claim amount greater than zero',
      fields: ['claim_amount'],
      user_fix_hint: 'Specify the total amount you are claiming',
    });
  }

  // Must have defendant details
  const defendantName = resolveFactValue(facts, 'defendant_name') ||
                       resolveFactValue(facts, 'tenant_full_name');

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
  const depositTaken = resolveFactValue(facts, 'deposit_taken');
  const depositAmount = resolveFactValue(facts, 'deposit_amount');

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
