/**
 * Notice-Only Inline Validator
 *
 * NEW validation path for notice-only products, built from first principles.
 * Gated by product=notice_only.
 *
 * Key principles:
 * 1. Decision rules MUST be invoked, not re-implemented
 * 2. Inline validation only (no right panel)
 * 3. Preview is the ONLY hard stop
 * 4. Return structured results (no exceptions)
 * 5. Conditional rules respect question dependencies
 * 6. Jurisdiction-scoped - no cross-jurisdiction leakage
 *
 * @see docs/notice-only-rules-audit.md for complete rule documentation
 */

import { runDecisionEngine, type DecisionOutput, type DecisionInput } from '../decision-engine';
import {
  runYamlOnlyNoticeValidation,
  deriveJurisdictionFromFacts,
  type YamlValidationResult,
} from './shadow-mode-adapter';
import type { ExtendedWizardQuestion, WizardField } from '../wizard/types';
import type { CanonicalJurisdiction } from '../types/jurisdiction';

// ============================================================================
// TYPES
// ============================================================================

export interface InlineFieldError {
  message: string;
}

export interface InlineGuidance {
  message: string;
  severity: 'info' | 'warn';
  code?: string;
  legalBasis?: string;
  affectedQuestionId?: string;
}

export interface RouteSuggestion {
  toRoute: string;
  reason: string;
}

export interface InlineValidationResult {
  /** Field-level errors that block the Next button */
  fieldErrors: Record<string, InlineFieldError>;
  /** Non-blocking legal guidance messages */
  guidance: InlineGuidance[];
  /** Optional route suggestion (e.g., S21 -> S8) */
  routeSuggestion?: RouteSuggestion;
}

export interface ValidateStepInlineParams {
  jurisdiction: CanonicalJurisdiction;
  route: string;
  msq: ExtendedWizardQuestion;
  stepId: string;
  answers: Record<string, any>;
  allFacts: Record<string, any>;
  product: 'notice_only';
}

// ============================================================================
// DEPOSIT CAP CALCULATION
// ============================================================================

interface DepositCapResult {
  maxDeposit: number;
  maxWeeks: 5 | 6;
  weeklyRent: number;
  exceeds: boolean;
}

function calculateDepositCap(
  rentAmount: number | undefined,
  rentFrequency: string | undefined,
  depositAmount: number | undefined
): DepositCapResult | null {
  if (!rentAmount || !depositAmount) return null;

  const freq = rentFrequency || 'monthly';
  let annualRent = rentAmount;

  switch (freq) {
    case 'weekly':
      annualRent = rentAmount * 52;
      break;
    case 'fortnightly':
      annualRent = rentAmount * 26;
      break;
    case 'monthly':
      annualRent = rentAmount * 12;
      break;
    case 'quarterly':
      annualRent = rentAmount * 4;
      break;
    case 'annually':
    case 'yearly':
      annualRent = rentAmount;
      break;
  }

  const weeklyRent = annualRent / 52;
  const maxWeeks: 5 | 6 = annualRent > 50000 ? 6 : 5;
  const maxDeposit = weeklyRent * maxWeeks;

  return {
    maxDeposit,
    maxWeeks,
    weeklyRent,
    exceeds: depositAmount > maxDeposit,
  };
}

// ============================================================================
// FIELD VALIDATION (BLOCKS NEXT)
// ============================================================================

function validateRequiredFields(
  msq: ExtendedWizardQuestion,
  answers: Record<string, any>
): Record<string, InlineFieldError> {
  const errors: Record<string, InlineFieldError> = {};

  // For grouped inputs
  if (msq.inputType === 'group' && msq.fields) {
    for (const field of msq.fields) {
      if (!field.validation?.required) continue;

      // Check if field should be skipped due to dependsOn
      if (field.dependsOn) {
        const depValue = answers[field.dependsOn.questionId];
        const expectedValue = field.dependsOn.value;

        // Skip validation if dependency not met
        if (Array.isArray(expectedValue)) {
          if (Array.isArray(depValue)) {
            if (!depValue.some((v: any) => expectedValue.includes(v))) continue;
          } else if (!expectedValue.includes(depValue)) {
            continue;
          }
        } else {
          if (Array.isArray(depValue)) {
            if (!depValue.includes(expectedValue)) continue;
          } else if (depValue !== expectedValue) {
            continue;
          }
        }
      }

      const value = answers[field.id];
      if (value === null || value === undefined || value === '') {
        errors[field.id] = {
          message: `${field.label || 'This field'} is required`,
        };
      }
    }
  }

  // For single inputs
  if (msq.validation?.required || msq.required) {
    const value = answers[msq.id];
    if (value === null || value === undefined || value === '') {
      errors[msq.id] = {
        message: 'This field is required',
      };
    }
  }

  return errors;
}

function validateNumericLimits(
  msq: ExtendedWizardQuestion,
  answers: Record<string, any>,
  jurisdiction: CanonicalJurisdiction,
  allFacts: Record<string, any>
): Record<string, InlineFieldError> {
  const errors: Record<string, InlineFieldError> = {};

  // For grouped inputs with currency/number fields
  if (msq.inputType === 'group' && msq.fields) {
    for (const field of msq.fields) {
      if (field.inputType !== 'currency' && field.inputType !== 'number') continue;

      const value = parseFloat(answers[field.id]);
      if (isNaN(value)) continue;

      // Standard min/max validation
      if (field.validation?.min !== undefined && value < field.validation.min) {
        errors[field.id] = {
          message: `${field.label || 'Value'} must be at least ${field.validation.min}`,
        };
      }
      if (field.validation?.max !== undefined && value > field.validation.max) {
        errors[field.id] = {
          message: `${field.label || 'Value'} must be at most ${field.validation.max}`,
        };
      }

      // Special: deposit_amount cap validation (England & Wales only)
      if (field.id === 'deposit_amount' && (jurisdiction === 'england' || jurisdiction === 'wales')) {
        const rentAmount = allFacts.rent_amount || allFacts.tenancy?.rent_amount;
        const rentFrequency = allFacts.rent_frequency || allFacts.tenancy?.rent_frequency || 'monthly';
        const depositAmount = parseFloat(answers.deposit_amount);

        if (rentAmount && !isNaN(depositAmount)) {
          const cap = calculateDepositCap(rentAmount, rentFrequency, depositAmount);
          if (cap?.exceeds) {
            // This is a WARNING, not an error - move to guidance
            // (deposit cap violation doesn't block navigation)
          }
        }
      }
    }
  }

  // For single currency/number inputs
  if (msq.inputType === 'currency' || msq.inputType === 'number') {
    const value = parseFloat(answers[msq.id]);
    if (!isNaN(value)) {
      if (msq.validation?.min !== undefined && value < msq.validation.min) {
        errors[msq.id] = {
          message: `Value must be at least ${msq.validation.min}`,
        };
      }
      if (msq.validation?.max !== undefined && value > msq.validation.max) {
        errors[msq.id] = {
          message: `Value must be at most ${msq.validation.max}`,
        };
      }
    }
  }

  return errors;
}

function validateDateFields(
  msq: ExtendedWizardQuestion,
  answers: Record<string, any>
): Record<string, InlineFieldError> {
  const errors: Record<string, InlineFieldError> = {};

  const dateFields = msq.fields?.filter(f => f.inputType === 'date') || [];
  if (msq.inputType === 'date') {
    dateFields.push({ id: msq.id, label: msq.question, inputType: 'date' } as WizardField);
  }

  for (const field of dateFields) {
    const value = answers[field.id];
    if (!value) continue;

    // Validate date format
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      errors[field.id] = {
        message: 'Please enter a valid date',
      };
    }
  }

  return errors;
}

// ============================================================================
// GUIDANCE GENERATION (NON-BLOCKING)
// ============================================================================

function generateLegalGuidance(
  jurisdiction: CanonicalJurisdiction,
  route: string,
  stepId: string,
  answers: Record<string, any>,
  allFacts: Record<string, any>,
  decisionResults: DecisionOutput,
  yamlResults: YamlValidationResult | null
): InlineGuidance[] {
  const guidance: InlineGuidance[] = [];

  // Only generate guidance for current step's relevant rules
  const relevantIssues = getRelevantIssuesForStep(
    stepId,
    answers,
    allFacts,
    decisionResults,
    yamlResults
  );

  for (const issue of relevantIssues) {
    guidance.push({
      message: formatGuidanceMessage(route, issue),
      severity: issue.severity === 'blocking' ? 'warn' : 'info',
      code: issue.code,
      legalBasis: issue.legalBasis,
      affectedQuestionId: issue.affectedQuestionId,
    });
  }

  // Deposit cap guidance (route-aware)
  // - Section 21: BLOCKING unless confirmed
  // - Section 8: Non-blocking (deposit cap doesn't affect S8 validity)
  if (isDepositStep(stepId) && jurisdiction === 'england') {
    const depositTaken = allFacts.deposit_taken ?? answers.deposit_taken;
    if (depositTaken === true) {
      const rentAmount = allFacts.rent_amount || allFacts.tenancy?.rent_amount;
      const rentFrequency = allFacts.rent_frequency || allFacts.tenancy?.rent_frequency || 'monthly';
      const depositAmount = parseFloat(answers.deposit_amount || allFacts.deposit_amount);

      if (rentAmount && !isNaN(depositAmount)) {
        const cap = calculateDepositCap(rentAmount, rentFrequency, depositAmount);
        if (cap?.exceeds) {
          const isSection21 = route === 'section_21' || allFacts.selected_notice_route === 'section_21';
          const confirmationValue = allFacts.deposit_reduced_to_legal_cap_confirmed;
          const isConfirmed = confirmationValue === 'yes' || confirmationValue === true;

          if (isSection21 && !isConfirmed) {
            // Section 21: Blocking unless confirmed
            guidance.push({
              message: `Deposit exceeds legal cap of ${cap.maxWeeks} weeks' rent (max £${cap.maxDeposit.toFixed(2)}). ` +
                `To generate a valid Section 21 notice, you must confirm the deposit has been reduced/refunded to within the cap. ` +
                `Alternatively, consider using Section 8 (deposit cap does not affect Section 8 validity).`,
              severity: 'warn',
              code: 'S21-DEPOSIT-CAP-EXCEEDED',
              legalBasis: 'Tenant Fees Act 2019 s3 - deposit capped at 5 weeks rent (6 weeks if annual rent > £50,000)',
              affectedQuestionId: 'deposit_reduced_to_legal_cap_confirmed',
            });
          } else if (!isSection21) {
            // Section 8: Non-blocking informational
            guidance.push({
              message: `Deposit exceeds legal cap of ${cap.maxWeeks} weeks' rent (max £${cap.maxDeposit.toFixed(2)}). ` +
                `This does not affect Section 8 validity, but you may want to refund the excess.`,
              severity: 'info',
              code: 'DEPOSIT_EXCEEDS_CAP',
              legalBasis: 'Tenant Fees Act 2019 s3',
            });
          }
          // If isSection21 && isConfirmed, no guidance needed - issue is resolved
        }
      }
    }
  }

  return guidance;
}

interface RelevantIssue {
  code: string;
  severity: 'blocking' | 'warning';
  legalBasis?: string;
  affectedQuestionId?: string;
  description: string;
}

function getRelevantIssuesForStep(
  stepId: string,
  answers: Record<string, any>,
  allFacts: Record<string, any>,
  decisionResults: DecisionOutput,
  yamlResults: YamlValidationResult | null
): RelevantIssue[] {
  const issues: RelevantIssue[] = [];

  // Check blocking issues from decision engine
  for (const blockingIssue of decisionResults.blocking_issues) {
    // Only include issues that are relevant to this step
    if (!isIssueRelevantToStep(stepId, blockingIssue.issue, answers, allFacts)) {
      continue;
    }

    issues.push({
      code: blockingIssue.issue.toUpperCase().replace(/_/g, '_'),
      severity: blockingIssue.severity,
      legalBasis: blockingIssue.legal_basis,
      affectedQuestionId: getAffectedQuestionId(blockingIssue.issue),
      description: blockingIssue.description,
    });
  }

  // Check YAML validation results (Phase 12: YAML-only)
  if (yamlResults) {
    for (const blocker of yamlResults.blockers) {
      if (!isComplianceIssueRelevantToStep(stepId, blocker.id, answers, allFacts)) {
        continue;
      }

      issues.push({
        code: blocker.id,
        severity: 'blocking',
        legalBasis: blocker.message,
        affectedQuestionId: getAffectedQuestionId(blocker.id),
        description: blocker.rationale || blocker.message,
      });
    }

    for (const warning of yamlResults.warnings) {
      if (!isComplianceIssueRelevantToStep(stepId, warning.id, answers, allFacts)) {
        continue;
      }

      issues.push({
        code: warning.id,
        severity: 'warning',
        legalBasis: warning.message,
        affectedQuestionId: getAffectedQuestionId(warning.id),
        description: warning.rationale || warning.message,
      });
    }
  }

  return issues;
}

// ============================================================================
// STEP-ISSUE RELEVANCE HELPERS
// ============================================================================

/**
 * Maps issue codes to the step IDs where they should be displayed
 *
 * JURISDICTION COVERAGE:
 * - England: Section 21 + Section 8 rules
 * - Wales: Section 173 + Fault-based rules (RHW forms)
 * - Scotland: Notice to Leave + Pre-action requirements
 */
const ISSUE_TO_STEP_MAP: Record<string, string[]> = {
  // ==========================================================================
  // ENGLAND RULES
  // ==========================================================================
  // Deposit issues
  deposit_not_protected: ['deposit_details', 'deposit_protected_scheme', 'deposit_compliance'],
  prescribed_info_not_given: ['deposit_details', 'deposit_protected_scheme', 'deposit_compliance'],
  deposit_exceeds_cap: ['deposit_details', 'tenancy_details'],

  // Gas/EPC/H2R issues (England-specific for S21)
  gas_safety_not_provided: ['safety_compliance', 'gas_safety_certificate'],
  epc_not_provided: ['safety_compliance', 'epc_provided'],
  how_to_rent_not_provided: ['safety_compliance', 'how_to_rent_provided'],

  // Licensing issues
  hmo_not_licensed: ['property_details', 'property_licensing'],
  licensing_issue: ['property_details', 'property_licensing'],

  // Section 8 grounds
  grounds_required: ['section8_grounds_selection', 'eviction_grounds', 'grounds_selection'],
  ground_particulars_incomplete: ['ground_particulars'],
  ground_8_threshold_not_met: ['arrears_details', 'rent_arrears'],

  // Deposit cap exceeded (Section 21 only - blocking unless confirmed)
  deposit_cap_exceeded: ['deposit_details', 'deposit_amount', 'deposit_reduced_to_legal_cap_confirmed'],
  s21_deposit_cap_exceeded: ['deposit_details', 'deposit_amount', 'deposit_reduced_to_legal_cap_confirmed'],

  // ==========================================================================
  // WALES RULES (Renting Homes (Wales) Act 2016)
  // ==========================================================================
  // Rent Smart Wales registration - BLOCKS Section 173
  rent_smart_not_registered: ['landlord_details', 'rent_smart_wales_registered', 'landlord_registration'],
  rsw_registration_required: ['landlord_details', 'rent_smart_wales_registered'],

  // Contract type - determines available routes
  contract_type_incompatible: ['tenancy_details', 'wales_contract_category', 'contract_type'],
  supported_contract_s173_blocked: ['tenancy_details', 'wales_contract_category'],
  secure_contract_s173_blocked: ['tenancy_details', 'wales_contract_category'],

  // Wales deposit protection
  wales_deposit_not_protected: ['deposit_details', 'deposit_protected_scheme'],

  // Wales notice periods
  wales_6_month_bar: ['tenancy_details', 'notice_service', 'contract_start_date'],
  wales_notice_period_insufficient: ['notice_service', 'notice_expiry'],

  // Wales fault-based sections (s157, s159, s161, s162)
  wales_fault_section_required: ['eviction_grounds', 'wales_fault_section'],
  wales_breach_notice_required: ['breach_notice', 'previous_notice'],

  // ==========================================================================
  // SCOTLAND RULES (Private Housing (Tenancies) (Scotland) Act 2016)
  // ==========================================================================
  // Ground selection
  scotland_ground_required: ['eviction_grounds', 'grounds_selection', 'scotland_grounds'],
  ntl_ground_required: ['eviction_grounds', 'grounds_selection'],

  // Pre-action requirements (Ground 1 - rent arrears)
  pre_action_not_met: ['pre_action_contact', 'pre_action_requirements', 'pre_action_protocol'],
  pre_action_letter_not_sent: ['pre_action_contact', 'pre_action_letter'],
  pre_action_signposting_not_done: ['pre_action_contact', 'pre_action_signposting'],

  // Notice periods (28 or 84 days depending on ground)
  scotland_notice_period_28: ['notice_service', 'notice_expiry'],
  scotland_notice_period_84: ['notice_service', 'notice_expiry'],
  scotland_notice_period_insufficient: ['notice_service', 'notice_expiry'],

  // Ground-specific issues
  scotland_ground_1_threshold: ['arrears_details', 'rent_arrears'],
  scotland_ground_3_asb_evidence: ['antisocial_behaviour', 'asb_evidence'],
};

function isIssueRelevantToStep(
  stepId: string,
  issueCode: string,
  answers: Record<string, any>,
  allFacts: Record<string, any>
): boolean {
  const normalizedCode = issueCode.toLowerCase().replace(/-/g, '_');
  const relevantSteps = ISSUE_TO_STEP_MAP[normalizedCode] || [];

  if (relevantSteps.includes(stepId)) {
    // Check conditional dependencies
    return checkConditionalDependencies(issueCode, answers, allFacts);
  }

  return false;
}

function isComplianceIssueRelevantToStep(
  stepId: string,
  code: string,
  answers: Record<string, any>,
  allFacts: Record<string, any>
): boolean {
  // Map compliance codes to step IDs
  // Comprehensive coverage for all jurisdictions:
  // - England: S21-* and S8-* codes
  // - Wales: S173-*, RHW-*, WALES-* codes
  // - Scotland: NTL-*, SCOTLAND-* codes
  const codeToStepMap: Record<string, string[]> = {
    // ==========================================================================
    // ENGLAND - Section 21
    // ==========================================================================
    'S21-DEPOSIT-NONCOMPLIANT': ['deposit_details', 'deposit_protected_scheme'],
    'S21-PRESCRIBED-INFO-REQUIRED': ['deposit_details', 'deposit_protected_scheme'],
    'S21-GAS-CERT': ['safety_compliance', 'gas_safety_certificate'],
    'S21-EPC': ['safety_compliance', 'epc_provided'],
    'S21-H2R': ['safety_compliance', 'how_to_rent_provided'],
    'S21-LICENSING': ['property_details', 'property_licensing'],
    'S21-FOUR-MONTH-BAR': ['tenancy_details', 'notice_service'],
    'S21-RETALIATORY': ['recent_complaints', 'repair_requests'],
    'S21-DEPOSIT-CAP': ['deposit_details', 'tenancy_details'],
    'S21-DEPOSIT-CAP-EXCEEDED': ['deposit_details', 'deposit_amount', 'deposit_reduced_to_legal_cap_confirmed'],

    // ==========================================================================
    // ENGLAND - Section 8
    // ==========================================================================
    'S8-GROUNDS-REQUIRED': ['section8_grounds_selection', 'grounds_selection'],
    'S8-NOTICE-PERIOD': ['notice_service', 'notice_expiry'],
    'S8-GROUND8-THRESHOLD': ['arrears_details', 'rent_arrears'],
    'S8-PARTICULARS-INCOMPLETE': ['ground_particulars'],

    // ==========================================================================
    // WALES - Section 173 (No-fault, Renting Homes Act)
    // ==========================================================================
    'S173-PERIOD-BAR': ['notice_service', 'contract_start_date', 'tenancy_details'],
    'S173-LICENSING': ['landlord_details', 'rent_smart_wales_registered'],
    'S173-CONTRACT-TYPE': ['tenancy_details', 'wales_contract_category'],
    'S173-DEPOSIT': ['deposit_details', 'deposit_protected_scheme'],
    'S173-NOTICE-PERIOD': ['notice_service', 'notice_expiry'],

    // ==========================================================================
    // WALES - Fault-based (RHW forms)
    // ==========================================================================
    'RHW23-GROUND-REQUIRED': ['eviction_grounds', 'wales_fault_section'],
    'WALES-SECTION-157': ['eviction_grounds', 'rent_arrears'],
    'WALES-SECTION-159': ['eviction_grounds', 'rent_arrears'],
    'WALES-SECTION-161': ['eviction_grounds', 'antisocial_behaviour'],
    'WALES-SECTION-162': ['eviction_grounds', 'breach_of_contract'],
    'WALES-BREACH-NOTICE': ['breach_notice', 'previous_notice'],

    // ==========================================================================
    // SCOTLAND - Notice to Leave (PRT Act 2016)
    // ==========================================================================
    'NTL-GROUND-REQUIRED': ['eviction_grounds', 'grounds_selection', 'scotland_grounds'],
    'NTL-PRE-ACTION': ['pre_action_contact', 'pre_action_requirements'],
    'NTL-NOTICE-PERIOD': ['notice_service', 'notice_expiry'],
    'NTL-GROUND-1-THRESHOLD': ['arrears_details', 'rent_arrears'],
    'NTL-28-DAY-PERIOD': ['notice_service', 'notice_expiry'],
    'NTL-84-DAY-PERIOD': ['notice_service', 'notice_expiry'],

    // ==========================================================================
    // SCOTLAND - Pre-action Protocol
    // ==========================================================================
    'SCOTLAND-PRE-ACTION-LETTER': ['pre_action_contact', 'pre_action_letter'],
    'SCOTLAND-PRE-ACTION-SIGNPOST': ['pre_action_contact', 'pre_action_signposting'],
    'SCOTLAND-PRE-ACTION-INCOMPLETE': ['pre_action_contact', 'pre_action_requirements'],
  };

  const relevantSteps = codeToStepMap[code] || [];
  if (!relevantSteps.includes(stepId)) {
    return false;
  }

  return checkConditionalDependencies(code, answers, allFacts);
}

/**
 * Check if conditional dependencies are met for an issue to be displayed
 *
 * IMPORTANT: These conditions determine when an issue should NOT be shown.
 * Returning false = issue is hidden (dependency not met)
 * Returning true = issue is visible (all conditions met)
 *
 * JURISDICTION-SPECIFIC RULES:
 * - England: Deposit, gas, EPC, H2R, licensing
 * - Wales: RSW registration, contract type, 6-month bar
 * - Scotland: Pre-action requirements for rent arrears grounds
 */
function checkConditionalDependencies(
  issueCode: string,
  answers: Record<string, any>,
  allFacts: Record<string, any>
): boolean {
  const normalizedCode = issueCode.toLowerCase().replace(/-/g, '_').replace(/^s21_|^s8_|^s173_|^ntl_|^rhw23_|^wales_|^scotland_/, '');

  // ==========================================================================
  // DEPOSIT RULES (England, Wales)
  // Only apply if deposit was taken
  // ==========================================================================
  const depositRelatedCodes = [
    'deposit_not_protected', 'prescribed_info_not_given', 'deposit_exceeds_cap',
    'deposit_noncompliant', 'prescribed_info_required', 'deposit', 'deposit_cap'
  ];
  if (depositRelatedCodes.includes(normalizedCode)) {
    const depositTaken = allFacts.deposit_taken ?? answers.deposit_taken;
    if (depositTaken !== true) {
      return false;
    }
  }

  // ==========================================================================
  // GAS SAFETY RULES (England)
  // Only apply if there are gas appliances
  // ==========================================================================
  if (['gas_safety_not_provided', 'gas_cert'].includes(normalizedCode)) {
    const hasGas = allFacts.has_gas_appliances ?? answers.has_gas_appliances;
    if (hasGas === false) {
      return false;
    }
  }

  // ==========================================================================
  // SCOTLAND PRE-ACTION REQUIREMENTS
  // Only apply if Ground 1 (rent arrears) is selected
  // ==========================================================================
  const preActionCodes = [
    'pre_action', 'pre_action_not_met', 'pre_action_letter', 'pre_action_signpost',
    'pre_action_letter_not_sent', 'pre_action_signposting_not_done', 'pre_action_incomplete'
  ];
  if (preActionCodes.includes(normalizedCode)) {
    const grounds = allFacts.scotland_ground_codes ?? allFacts.eviction_grounds ?? [];
    // Ground 1 can be represented as 'ground_1', '1', 'ground1', or 'rent_arrears'
    const hasRentArrearsGround = Array.isArray(grounds) && (
      grounds.includes('ground_1') ||
      grounds.includes('1') ||
      grounds.includes('ground1') ||
      grounds.includes('rent_arrears')
    );
    if (!hasRentArrearsGround) {
      return false;
    }
  }

  // ==========================================================================
  // WALES SECTION 173 RULES
  // Only apply if contract type is 'standard' occupation contract
  // ==========================================================================
  const s173SpecificCodes = ['period_bar', '6_month_bar', 'six_month_bar'];
  if (s173SpecificCodes.includes(normalizedCode)) {
    const contractType = allFacts.wales_contract_category ?? answers.wales_contract_category;
    // Section 173 only available for standard occupation contracts
    if (contractType === 'supported_standard' || contractType === 'secure') {
      // These contract types can't use S173 at all, so don't show the period bar issue
      return false;
    }
  }

  // ==========================================================================
  // WALES CONTRACT TYPE ISSUES
  // Only show if contract type IS supported/secure (blocking S173)
  // ==========================================================================
  const contractBlockingCodes = ['supported_contract_s173_blocked', 'secure_contract_s173_blocked', 'contract_type_incompatible', 'contract_type'];
  if (contractBlockingCodes.includes(normalizedCode)) {
    const contractType = allFacts.wales_contract_category ?? answers.wales_contract_category;
    // Only show these issues if contract type actually blocks S173
    if (contractType !== 'supported_standard' && contractType !== 'secure') {
      return false;
    }
  }

  // ==========================================================================
  // SCOTLAND GROUND-SPECIFIC ISSUES
  // ==========================================================================
  // Ground 1 threshold only applies if Ground 1 is selected
  if (normalizedCode === 'ground_1_threshold' || normalizedCode === 'ground1_threshold') {
    const grounds = allFacts.scotland_ground_codes ?? allFacts.eviction_grounds ?? [];
    const hasGround1 = Array.isArray(grounds) && (
      grounds.includes('ground_1') || grounds.includes('1')
    );
    if (!hasGround1) {
      return false;
    }
  }

  // Ground 3 ASB evidence only applies if Ground 3 is selected
  if (normalizedCode === 'ground_3_asb_evidence' || normalizedCode === 'ground3_asb') {
    const grounds = allFacts.scotland_ground_codes ?? allFacts.eviction_grounds ?? [];
    const hasGround3 = Array.isArray(grounds) && (
      grounds.includes('ground_3') || grounds.includes('3') || grounds.includes('antisocial_behaviour')
    );
    if (!hasGround3) {
      return false;
    }
  }

  // ==========================================================================
  // ENGLAND GROUND 8 THRESHOLD
  // Only applies if Ground 8 is selected
  // ==========================================================================
  if (normalizedCode === 'ground8_threshold' || normalizedCode === 'ground_8_threshold') {
    const grounds = allFacts.section8_grounds ?? allFacts.eviction_grounds ?? [];
    const hasGround8 = Array.isArray(grounds) && (
      grounds.includes('ground_8') || grounds.includes('8')
    );
    if (!hasGround8) {
      return false;
    }
  }

  return true;
}

function getAffectedQuestionId(issueCode: string): string | undefined {
  // Comprehensive mapping of issue codes to the question ID where they can be fixed
  // Covers all jurisdictions: England, Wales, Scotland
  const codeToQuestion: Record<string, string> = {
    // ==========================================================================
    // ENGLAND - Section 21
    // ==========================================================================
    deposit_not_protected: 'deposit_protected_scheme',
    deposit_noncompliant: 'deposit_protected_scheme',
    prescribed_info_not_given: 'deposit_protected_scheme',
    prescribed_info_required: 'deposit_protected_scheme',
    gas_safety_not_provided: 'gas_safety_certificate',
    gas_cert: 'gas_safety_certificate',
    epc_not_provided: 'epc_provided',
    epc: 'epc_provided',
    how_to_rent_not_provided: 'how_to_rent_provided',
    h2r: 'how_to_rent_provided',
    hmo_not_licensed: 'property_licensing',
    licensing_issue: 'property_licensing',
    licensing: 'property_licensing',
    four_month_bar: 'notice_service',
    deposit_exceeds_cap: 'deposit_details',
    deposit_cap: 'deposit_details',
    deposit_cap_exceeded: 'deposit_reduced_to_legal_cap_confirmed',
    s21_deposit_cap_exceeded: 'deposit_reduced_to_legal_cap_confirmed',

    // ==========================================================================
    // ENGLAND - Section 8
    // ==========================================================================
    grounds_required: 'section8_grounds_selection',
    ground_particulars_incomplete: 'ground_particulars',
    ground_8_threshold_not_met: 'arrears_details',
    ground8_threshold: 'arrears_details',

    // ==========================================================================
    // WALES - Section 173
    // ==========================================================================
    rent_smart_not_registered: 'rent_smart_wales_registered',
    rsw_registration_required: 'rent_smart_wales_registered',
    wales_licensing: 'rent_smart_wales_registered',
    contract_type_incompatible: 'wales_contract_category',
    supported_contract_s173_blocked: 'wales_contract_category',
    secure_contract_s173_blocked: 'wales_contract_category',
    contract_type: 'wales_contract_category',
    wales_deposit_not_protected: 'deposit_protected_scheme',
    deposit: 'deposit_protected_scheme',
    period_bar: 'notice_service',
    six_month_bar: 'contract_start_date',
    wales_6_month_bar: 'contract_start_date',
    notice_period_insufficient: 'notice_expiry',

    // ==========================================================================
    // WALES - Fault-based
    // ==========================================================================
    wales_fault_section_required: 'wales_fault_section',
    ground_required: 'wales_fault_section',
    breach_notice_required: 'breach_notice',
    section_157: 'rent_arrears',
    section_159: 'rent_arrears',
    section_161: 'antisocial_behaviour',
    section_162: 'breach_of_contract',

    // ==========================================================================
    // SCOTLAND - Notice to Leave
    // ==========================================================================
    pre_action_not_met: 'pre_action_contact',
    pre_action: 'pre_action_contact',
    pre_action_letter_not_sent: 'pre_action_letter',
    pre_action_signposting_not_done: 'pre_action_signposting',
    pre_action_incomplete: 'pre_action_requirements',
    scotland_ground_required: 'eviction_grounds',
    ntl_ground_required: 'eviction_grounds',
    ground_1_threshold: 'rent_arrears',
    ground_3_asb_evidence: 'asb_evidence',
    notice_period_28: 'notice_expiry',
    notice_period_84: 'notice_expiry',
    scotland_notice_period_insufficient: 'notice_expiry',
  };

  return codeToQuestion[issueCode.toLowerCase().replace(/-/g, '_')];
}

function isDepositStep(stepId: string): boolean {
  return ['deposit_details', 'deposit_protected_scheme', 'deposit_compliance', 'tenancy_details'].includes(stepId);
}

// ============================================================================
// MESSAGE FORMATTING
// ============================================================================

function formatGuidanceMessage(route: string, issue: RelevantIssue): string {
  const routeLabel = getRouteLabel(route);

  // Use description if available, otherwise build from code
  if (issue.description) {
    return `To generate a legally compliant ${routeLabel} notice, you must: ${issue.description}`;
  }

  return `To generate a legally compliant ${routeLabel} notice: Please address the ${issue.code.replace(/_/g, ' ').toLowerCase()} requirement.`;
}

function getRouteLabel(route: string): string {
  const labels: Record<string, string> = {
    section_8: 'Section 8',
    section_21: 'Section 21',
    notice_to_leave: 'Notice to Leave',
    wales_section_173: 'Section 173',
    wales_fault_based: 'fault-based',
  };

  return labels[route] || route;
}

// ============================================================================
// ROUTE SUGGESTIONS
// ============================================================================

function generateRouteSuggestion(
  currentRoute: string,
  jurisdiction: CanonicalJurisdiction,
  decisionResults: DecisionOutput
): RouteSuggestion | undefined {
  // Only suggest route changes if current route is blocked
  if (!decisionResults.blocked_routes.includes(currentRoute)) {
    return undefined;
  }

  // Find an allowed alternative route
  const alternatives = decisionResults.allowed_routes.filter(r => r !== currentRoute);

  if (alternatives.length === 0) {
    return undefined;
  }

  // Prefer recommended routes
  const recommended = alternatives.find(r => decisionResults.recommended_routes.includes(r));
  const suggestedRoute = recommended || alternatives[0];

  // Get the blocking reason for current route
  const blockingIssue = decisionResults.blocking_issues.find(i => i.route === currentRoute);
  const reason = blockingIssue
    ? `${currentRoute.replace('_', ' ')} is blocked due to: ${blockingIssue.description}`
    : `${currentRoute.replace('_', ' ')} is not available`;

  return {
    toRoute: suggestedRoute,
    reason,
  };
}

// ============================================================================
// MAIN VALIDATION FUNCTION
// ============================================================================

/**
 * Validates a wizard step inline for notice-only products.
 *
 * @param params Validation parameters
 * @returns Structured validation result with fieldErrors, guidance, and routeSuggestion
 */
export async function validateStepInline(
  params: ValidateStepInlineParams
): Promise<InlineValidationResult> {
  const { jurisdiction, route, msq, stepId, answers, allFacts, product } = params;

  // Guard: only for notice_only
  if (product !== 'notice_only') {
    return { fieldErrors: {}, guidance: [] };
  }

  // 1. Field-level validation (blocks Next)
  const requiredErrors = validateRequiredFields(msq, answers);
  const numericErrors = validateNumericLimits(msq, answers, jurisdiction, allFacts);
  const dateErrors = validateDateFields(msq, answers);

  const fieldErrors: Record<string, InlineFieldError> = {
    ...requiredErrors,
    ...numericErrors,
    ...dateErrors,
  };

  // 2. Run decision engine for legal guidance
  const decisionInput: DecisionInput = {
    jurisdiction,
    product: 'notice_only',
    case_type: 'eviction',
    facts: allFacts,
    stage: 'wizard', // Wizard stage = non-blocking issues are warnings
  };

  let decisionResults: DecisionOutput;
  try {
    decisionResults = runDecisionEngine(decisionInput);
  } catch (error) {
    console.error('[noticeOnlyInlineValidator] Decision engine error:', error);
    decisionResults = {
      recommended_routes: [],
      allowed_routes: [],
      blocked_routes: [],
      recommended_grounds: [],
      notice_period_suggestions: {},
      pre_action_requirements: { required: false, met: null, details: [] },
      blocking_issues: [],
      warnings: [],
      analysis_summary: '',
      route_explanations: {},
    };
  }

  // 3. Run YAML validation (Phase 12: YAML-only)
  let yamlResults: YamlValidationResult | null = null;
  try {
    yamlResults = await runYamlOnlyNoticeValidation({
      jurisdiction: deriveJurisdictionFromFacts(allFacts ?? {}),
      route,
      facts: allFacts ?? {},
    });
  } catch (error) {
    console.error('[noticeOnlyInlineValidator] YAML validation error:', error);
  }

  // 4. Generate legal guidance (non-blocking)
  // Per UX requirements: inline guidance is disabled by default
  // Guidance is shown at preview stage via ValidationErrors component
  const inlineGuidanceEnabled = process.env.NOTICE_ONLY_INLINE_GUIDANCE === '1';

  let guidance: InlineGuidance[] = [];
  if (inlineGuidanceEnabled) {
    guidance = generateLegalGuidance(
      jurisdiction,
      route,
      stepId,
      answers,
      allFacts,
      decisionResults,
      yamlResults
    );
  }

  // 5. Generate route suggestion if applicable
  const routeSuggestion = generateRouteSuggestion(route, jurisdiction, decisionResults);

  return {
    fieldErrors,
    guidance,
    routeSuggestion,
  };
}

/**
 * Synchronous version for simple field validation only.
 * Use validateStepInline for full legal guidance.
 */
export function validateFieldsOnly(
  msq: ExtendedWizardQuestion,
  answers: Record<string, any>,
  jurisdiction: CanonicalJurisdiction,
  allFacts: Record<string, any>
): Record<string, InlineFieldError> {
  const requiredErrors = validateRequiredFields(msq, answers);
  const numericErrors = validateNumericLimits(msq, answers, jurisdiction, allFacts);
  const dateErrors = validateDateFields(msq, answers);

  return {
    ...requiredErrors,
    ...numericErrors,
    ...dateErrors,
  };
}
