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
import { evaluateNoticeCompliance, type NoticeComplianceResult } from '../notices/evaluate-notice-compliance';
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
  complianceResults: NoticeComplianceResult | null
): InlineGuidance[] {
  const guidance: InlineGuidance[] = [];

  // Only generate guidance for current step's relevant rules
  const relevantIssues = getRelevantIssuesForStep(
    stepId,
    answers,
    allFacts,
    decisionResults,
    complianceResults
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

  // Deposit cap warning (non-blocking)
  if (isDepositStep(stepId) && (jurisdiction === 'england' || jurisdiction === 'wales')) {
    const depositTaken = allFacts.deposit_taken ?? answers.deposit_taken;
    if (depositTaken === true) {
      const rentAmount = allFacts.rent_amount || allFacts.tenancy?.rent_amount;
      const rentFrequency = allFacts.rent_frequency || allFacts.tenancy?.rent_frequency || 'monthly';
      const depositAmount = parseFloat(answers.deposit_amount || allFacts.deposit_amount);

      if (rentAmount && !isNaN(depositAmount)) {
        const cap = calculateDepositCap(rentAmount, rentFrequency, depositAmount);
        if (cap?.exceeds) {
          guidance.push({
            message: `Deposit exceeds legal cap of ${cap.maxWeeks} weeks' rent (max \u00A3${cap.maxDeposit.toFixed(2)}). Consider refunding the excess to the tenant.`,
            severity: 'warn',
            code: 'DEPOSIT_EXCEEDS_CAP',
            legalBasis: 'Tenant Fees Act 2019 s3',
          });
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
  complianceResults: NoticeComplianceResult | null
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

  // Check compliance results
  if (complianceResults) {
    for (const failure of complianceResults.hardFailures) {
      if (!isComplianceIssueRelevantToStep(stepId, failure.code, answers, allFacts)) {
        continue;
      }

      issues.push({
        code: failure.code,
        severity: 'blocking',
        legalBasis: failure.legal_reason,
        affectedQuestionId: failure.affected_question_id,
        description: failure.user_fix_hint,
      });
    }

    for (const warning of complianceResults.warnings) {
      if (!isComplianceIssueRelevantToStep(stepId, warning.code, answers, allFacts)) {
        continue;
      }

      issues.push({
        code: warning.code,
        severity: 'warning',
        legalBasis: warning.legal_reason,
        affectedQuestionId: warning.affected_question_id,
        description: warning.user_fix_hint,
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
 */
const ISSUE_TO_STEP_MAP: Record<string, string[]> = {
  // Deposit issues
  deposit_not_protected: ['deposit_details', 'deposit_protected_scheme', 'deposit_compliance'],
  prescribed_info_not_given: ['deposit_details', 'deposit_protected_scheme', 'deposit_compliance'],
  deposit_exceeds_cap: ['deposit_details', 'tenancy_details'],

  // Gas/EPC/H2R issues
  gas_safety_not_provided: ['safety_compliance', 'gas_safety_certificate'],
  epc_not_provided: ['safety_compliance', 'epc_provided'],
  how_to_rent_not_provided: ['safety_compliance', 'how_to_rent_provided'],

  // Licensing issues
  hmo_not_licensed: ['property_details', 'property_licensing'],
  licensing_issue: ['property_details', 'property_licensing'],

  // Wales-specific
  rent_smart_not_registered: ['landlord_details', 'rent_smart_wales_registered'],
  contract_type_incompatible: ['tenancy_details', 'wales_contract_category'],

  // Scotland-specific
  pre_action_not_met: ['pre_action_contact', 'pre_action_requirements'],

  // Ground/route issues
  grounds_required: ['section8_grounds_selection', 'eviction_grounds', 'grounds_selection'],
  ground_particulars_incomplete: ['ground_particulars'],
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
  const codeToStepMap: Record<string, string[]> = {
    'S21-DEPOSIT-NONCOMPLIANT': ['deposit_details', 'deposit_protected_scheme'],
    'S21-PRESCRIBED-INFO-REQUIRED': ['deposit_details', 'deposit_protected_scheme'],
    'S21-GAS-CERT': ['safety_compliance', 'gas_safety_certificate'],
    'S21-EPC': ['safety_compliance', 'epc_provided'],
    'S21-H2R': ['safety_compliance', 'how_to_rent_provided'],
    'S21-LICENSING': ['property_details', 'property_licensing'],
    'S21-FOUR-MONTH-BAR': ['tenancy_details', 'notice_service'],
    'S8-GROUNDS-REQUIRED': ['section8_grounds_selection', 'grounds_selection'],
    'S8-NOTICE-PERIOD': ['notice_service', 'notice_expiry'],
    'S173-PERIOD-BAR': ['notice_service', 'contract_start_date'],
    'S173-LICENSING': ['landlord_details', 'rent_smart_wales_registered'],
    'NTL-GROUND-REQUIRED': ['eviction_grounds', 'grounds_selection'],
    'NTL-PRE-ACTION': ['pre_action_contact', 'pre_action_requirements'],
    'NTL-NOTICE-PERIOD': ['notice_service', 'notice_expiry'],
  };

  const relevantSteps = codeToStepMap[code] || [];
  if (!relevantSteps.includes(stepId)) {
    return false;
  }

  return checkConditionalDependencies(code, answers, allFacts);
}

/**
 * Check if conditional dependencies are met for an issue to be displayed
 */
function checkConditionalDependencies(
  issueCode: string,
  answers: Record<string, any>,
  allFacts: Record<string, any>
): boolean {
  const normalizedCode = issueCode.toLowerCase().replace(/-/g, '_').replace(/^s21_|^s8_|^s173_|^ntl_/, '');

  // Deposit-related issues only apply if deposit was taken
  if (['deposit_not_protected', 'prescribed_info_not_given', 'deposit_exceeds_cap', 'deposit_noncompliant', 'prescribed_info_required'].includes(normalizedCode)) {
    const depositTaken = allFacts.deposit_taken ?? answers.deposit_taken;
    if (depositTaken !== true) {
      return false;
    }
  }

  // Gas safety only applies if there are gas appliances
  if (['gas_safety_not_provided', 'gas_cert'].includes(normalizedCode)) {
    const hasGas = allFacts.has_gas_appliances ?? answers.has_gas_appliances;
    if (hasGas === false) {
      return false;
    }
  }

  // Pre-action only applies if ground 1 (rent arrears) is selected in Scotland
  if (['pre_action', 'pre_action_not_met'].includes(normalizedCode)) {
    const grounds = allFacts.scotland_ground_codes ?? allFacts.eviction_grounds ?? [];
    if (!Array.isArray(grounds) || !grounds.includes('ground_1') && !grounds.includes('1')) {
      return false;
    }
  }

  return true;
}

function getAffectedQuestionId(issueCode: string): string | undefined {
  const codeToQuestion: Record<string, string> = {
    deposit_not_protected: 'deposit_protected_scheme',
    prescribed_info_not_given: 'deposit_protected_scheme',
    gas_safety_not_provided: 'gas_safety_certificate',
    epc_not_provided: 'epc_provided',
    how_to_rent_not_provided: 'how_to_rent_provided',
    hmo_not_licensed: 'property_licensing',
    rent_smart_not_registered: 'rent_smart_wales_registered',
    contract_type_incompatible: 'wales_contract_category',
    grounds_required: 'section8_grounds_selection',
    pre_action_not_met: 'pre_action_contact',
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

  // 3. Run compliance evaluation
  let complianceResults: NoticeComplianceResult | null = null;
  try {
    complianceResults = evaluateNoticeCompliance({
      jurisdiction,
      route,
      facts: allFacts,
      stage: 'wizard',
    });
  } catch (error) {
    console.error('[noticeOnlyInlineValidator] Compliance evaluation error:', error);
  }

  // 4. Generate legal guidance (non-blocking)
  const guidance = generateLegalGuidance(
    jurisdiction,
    route,
    stepId,
    answers,
    allFacts,
    decisionResults,
    complianceResults
  );

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
