/**
 * Notice-Only Wizard UX Issues Helper
 *
 * This module provides a focused issue extraction for the wizard UX layer.
 * It does NOT compute new legal logic - it ONLY uses existing outputs from:
 * - Decision engine (runDecisionEngine)
 * - Compliance evaluator (evaluateNoticeCompliance)
 *
 * Key principles:
 * 1. Issues are filtered to only those affected by the step just saved
 * 2. Route-invalidating issues block Next and trigger modal
 * 3. Inline warnings are shown under the triggering question
 * 4. Preview/Generate remains the ultimate hard stop
 *
 * @see docs/notice-only-wizard-ux.md for full design documentation
 */

import { runDecisionEngine, type DecisionOutput, type DecisionInput } from '../decision-engine';
import { evaluateNoticeCompliance, type ComplianceResult } from '../notices/evaluate-notice-compliance';
import { normalizeFactKeys } from '../wizard/normalizeFacts';
import type { CanonicalJurisdiction } from '../types/jurisdiction';

// ============================================================================
// TYPES
// ============================================================================

export interface RouteInvalidatingIssue {
  code: string;
  route: string;
  description: string;
  legalBasis?: string;
  affectedQuestionId?: string;
  userFixHint: string;
}

export interface InlineWarning {
  code: string;
  message: string;
  severity: 'info' | 'warn';
  legalBasis?: string;
  affectedQuestionId?: string;
  computedValues?: Record<string, number | string>;
}

export interface WizardUxIssuesResult {
  /** Issues that make the CURRENT route unavailable (blocking at preview/generate) */
  routeInvalidatingIssues: RouteInvalidatingIssue[];
  /** Warnings applicable to the current step (non-blocking) */
  inlineWarnings: InlineWarning[];
  /** Alternative routes that are still available */
  alternativeRoutes: string[];
}

export interface WizardUxIssuesInput {
  jurisdiction: CanonicalJurisdiction;
  route: string;
  savedFacts: Record<string, any>;
  lastSavedQuestionIds: string[];
}

// ============================================================================
// ROUTE-INVALIDATING ISSUE CODES BY ROUTE (ENGLAND)
// These are issues that make the selected route legally unavailable
// ============================================================================

const ENGLAND_ROUTE_INVALIDATING_CODES: Record<string, string[]> = {
  section_21: [
    'S21-DEPOSIT-NONCOMPLIANT',
    'S21-PRESCRIBED-INFO-REQUIRED',
    'S21-LICENSING',
    'S21-GAS-CERT',
    'S21-EPC',
    'S21-H2R',
    'S21-DEPOSIT-CAP-EXCEEDED',
    'S21-FOUR-MONTH-BAR',
    // Decision engine codes (lowercase with underscores)
    'deposit_not_protected',
    'prescribed_info_not_given',
    'gas_safety_not_provided',
    'epc_not_provided',
    'how_to_rent_not_provided',
    'licensing_issue',
    'hmo_not_licensed',
  ],
  section_8: [
    'S8-GROUNDS-REQUIRED',
    'grounds_required',
  ],
};

// ============================================================================
// ISSUE CODE TO QUESTION ID MAPPING
// Maps compliance/decision engine codes to the question where they can be fixed
// ============================================================================

const ISSUE_CODE_TO_QUESTION_ID: Record<string, string> = {
  // Section 21 issues
  'S21-DEPOSIT-NONCOMPLIANT': 'deposit_protected_scheme',
  'S21-PRESCRIBED-INFO-REQUIRED': 'prescribed_info_given',
  'S21-LICENSING': 'property_licensing',
  'S21-GAS-CERT': 'gas_safety_certificate',
  'S21-EPC': 'epc_provided',
  'S21-H2R': 'how_to_rent_provided',
  'S21-DEPOSIT-CAP-EXCEEDED': 'deposit_reduced_to_legal_cap_confirmed',
  'S21-FOUR-MONTH-BAR': 'tenancy_start_date',
  'deposit_not_protected': 'deposit_protected_scheme',
  'prescribed_info_not_given': 'prescribed_info_given',
  'gas_safety_not_provided': 'gas_safety_certificate',
  'epc_not_provided': 'epc_provided',
  'how_to_rent_not_provided': 'how_to_rent_provided',
  'licensing_issue': 'property_licensing',
  'hmo_not_licensed': 'property_licensing',
  // Section 8 issues
  'S8-GROUNDS-REQUIRED': 'section8_grounds_selection',
  'grounds_required': 'section8_grounds_selection',
  // Deposit cap
  'DEPOSIT_EXCEEDS_CAP': 'deposit_amount',
  'deposit_exceeds_cap': 'deposit_amount',
};

// ============================================================================
// QUESTION ID TO CONTROLLING QUESTION IDS MAPPING
// Maps question IDs to the questions that control their visibility
// ============================================================================

const QUESTION_ID_TO_CONTROLLING_IDS: Record<string, string[]> = {
  // Deposit protection depends on deposit_taken
  deposit_protected_scheme: ['deposit_taken'],
  // Prescribed info depends on deposit_taken AND deposit_protected_scheme
  prescribed_info_given: ['deposit_taken', 'deposit_protected_scheme'],
  // Gas certificate depends on has_gas_appliances
  gas_safety_certificate: ['has_gas_appliances'],
  // Deposit cap confirmation depends on deposit_taken and deposit_amount
  deposit_reduced_to_legal_cap_confirmed: ['deposit_taken', 'deposit_amount'],
};

// ============================================================================
// ALTERNATIVE ROUTES BY ROUTE
// ============================================================================

const ALTERNATIVE_ROUTES: Record<string, string[]> = {
  section_21: ['section_8'],
  section_8: [], // No alternatives - Section 8 is the fallback
};

// ============================================================================
// DEPOSIT CAP CALCULATION HELPER
// ============================================================================

interface DepositCapInfo {
  maxDeposit: number;
  maxWeeks: 5 | 6;
  weeklyRent: number;
  actualDeposit: number;
  exceeds: boolean;
}

function calculateDepositCapInfo(facts: Record<string, any>): DepositCapInfo | null {
  const rentAmount = facts.rent_amount ?? facts.tenancy?.rent_amount;
  const depositAmount = facts.deposit_amount ?? facts.tenancy?.deposit_amount;
  const rentFrequency = facts.rent_frequency ?? facts.tenancy?.rent_frequency ?? 'monthly';

  if (!rentAmount || !depositAmount) return null;

  const numericRent = typeof rentAmount === 'string' ? parseFloat(rentAmount) : rentAmount;
  const numericDeposit = typeof depositAmount === 'string' ? parseFloat(depositAmount) : depositAmount;

  if (isNaN(numericRent) || isNaN(numericDeposit) || numericRent <= 0) return null;

  let annualRent = numericRent * 12; // default monthly
  if (rentFrequency === 'weekly') annualRent = numericRent * 52;
  else if (rentFrequency === 'fortnightly') annualRent = numericRent * 26;
  else if (rentFrequency === 'quarterly') annualRent = numericRent * 4;
  else if (rentFrequency === 'yearly' || rentFrequency === 'annually') annualRent = numericRent;

  const weeklyRent = annualRent / 52;
  const maxWeeks: 5 | 6 = annualRent > 50000 ? 6 : 5;
  const maxDeposit = weeklyRent * maxWeeks;

  return {
    maxDeposit,
    maxWeeks,
    weeklyRent,
    actualDeposit: numericDeposit,
    exceeds: numericDeposit > maxDeposit,
  };
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

/**
 * Extract wizard UX issues from decision engine and compliance evaluator outputs.
 *
 * This function:
 * 1. Runs the decision engine and compliance evaluator
 * 2. Filters issues to only those triggered by the last saved questions
 * 3. Separates route-invalidating issues from inline warnings
 * 4. Computes deposit cap values for inline display
 */
export function extractWizardUxIssues(input: WizardUxIssuesInput): WizardUxIssuesResult {
  const { jurisdiction, route, savedFacts, lastSavedQuestionIds } = input;

  // Normalize facts to ensure consistent field names
  const normalizedFacts = normalizeFactKeys(savedFacts);

  const result: WizardUxIssuesResult = {
    routeInvalidatingIssues: [],
    inlineWarnings: [],
    alternativeRoutes: ALTERNATIVE_ROUTES[route] || [],
  };

  // Only process England for now (extensible to Wales/Scotland later)
  if (jurisdiction !== 'england') {
    return result;
  }

  // -------------------------------------------------------------------------
  // 1. Run Decision Engine
  // -------------------------------------------------------------------------
  let decisionOutput: DecisionOutput;
  try {
    const decisionInput: DecisionInput = {
      jurisdiction,
      product: 'notice_only',
      case_type: 'eviction',
      facts: normalizedFacts,
      stage: 'wizard',
    };
    decisionOutput = runDecisionEngine(decisionInput);
  } catch (error) {
    console.error('[extractWizardUxIssues] Decision engine error:', error);
    return result;
  }

  // -------------------------------------------------------------------------
  // 2. Run Compliance Evaluator
  // -------------------------------------------------------------------------
  let complianceResult: ComplianceResult;
  try {
    complianceResult = evaluateNoticeCompliance({
      jurisdiction,
      product: 'notice_only',
      selected_route: route,
      wizardFacts: normalizedFacts,
      stage: 'wizard',
    });
  } catch (error) {
    console.error('[extractWizardUxIssues] Compliance evaluator error:', error);
    return result;
  }

  // -------------------------------------------------------------------------
  // 3. Collect all issues from both sources
  // -------------------------------------------------------------------------
  const allIssues: Array<{
    code: string;
    description: string;
    legalBasis?: string;
    affectedQuestionId?: string;
    userFixHint: string;
    source: 'decision' | 'compliance';
  }> = [];

  // From decision engine blocking_issues
  for (const issue of decisionOutput.blocking_issues) {
    const affectedQuestionId = ISSUE_CODE_TO_QUESTION_ID[issue.issue] ||
                               ISSUE_CODE_TO_QUESTION_ID[issue.issue.toUpperCase()];
    allIssues.push({
      code: issue.issue,
      description: issue.description,
      legalBasis: issue.legal_basis,
      affectedQuestionId,
      userFixHint: issue.action_required || issue.description,
      source: 'decision',
    });
  }

  // From compliance evaluator hardFailures
  for (const failure of complianceResult.hardFailures) {
    allIssues.push({
      code: failure.code,
      description: failure.legal_reason,
      legalBasis: failure.legal_reason,
      affectedQuestionId: failure.affected_question_id,
      userFixHint: failure.user_fix_hint,
      source: 'compliance',
    });
  }

  // From compliance evaluator warnings
  for (const warning of complianceResult.warnings) {
    allIssues.push({
      code: warning.code,
      description: warning.legal_reason,
      legalBasis: warning.legal_reason,
      affectedQuestionId: warning.affected_question_id,
      userFixHint: warning.user_fix_hint,
      source: 'compliance',
    });
  }

  // -------------------------------------------------------------------------
  // 4. Filter issues to only those triggered by lastSavedQuestionIds
  // -------------------------------------------------------------------------
  const routeInvalidatingCodes = ENGLAND_ROUTE_INVALIDATING_CODES[route] || [];

  for (const issue of allIssues) {
    // Check if this issue was triggered by the last saved questions
    const isTriggeredByLastSave = isIssueTriggeredByQuestions(
      issue.affectedQuestionId,
      lastSavedQuestionIds
    );

    if (!isTriggeredByLastSave) {
      continue; // Skip issues not triggered by the current step
    }

    // Check if this is a route-invalidating issue
    const isRouteInvalidating = routeInvalidatingCodes.includes(issue.code) ||
                                routeInvalidatingCodes.includes(issue.code.toUpperCase());

    if (isRouteInvalidating) {
      result.routeInvalidatingIssues.push({
        code: issue.code,
        route,
        description: issue.description,
        legalBasis: issue.legalBasis,
        affectedQuestionId: issue.affectedQuestionId,
        userFixHint: issue.userFixHint,
      });
    } else {
      // Add as inline warning
      result.inlineWarnings.push({
        code: issue.code,
        message: issue.userFixHint || issue.description,
        severity: 'warn',
        legalBasis: issue.legalBasis,
        affectedQuestionId: issue.affectedQuestionId,
      });
    }
  }

  // -------------------------------------------------------------------------
  // 5. Add deposit cap warning with computed values (always inline, never blocking)
  // -------------------------------------------------------------------------
  if (lastSavedQuestionIds.includes('deposit_amount') ||
      lastSavedQuestionIds.includes('rent_terms') ||
      lastSavedQuestionIds.includes('deposit_taken')) {

    const depositCapInfo = calculateDepositCapInfo(normalizedFacts);

    if (depositCapInfo?.exceeds && normalizedFacts.deposit_taken === true) {
      const isSection21 = route === 'section_21';
      const confirmationValue = normalizedFacts.deposit_reduced_to_legal_cap_confirmed;
      const isConfirmed = confirmationValue === 'yes' || confirmationValue === true;

      // For Section 21, if not confirmed, this is route-invalidating
      // For Section 8, it's just an informational warning
      if (isSection21 && !isConfirmed) {
        // Check if we already have a deposit cap issue
        const hasDepositCapIssue = result.routeInvalidatingIssues.some(
          i => i.code.includes('DEPOSIT-CAP') || i.code.includes('deposit_cap')
        );

        if (!hasDepositCapIssue) {
          result.routeInvalidatingIssues.push({
            code: 'S21-DEPOSIT-CAP-EXCEEDED',
            route,
            description: `Deposit exceeds legal cap. Entered: £${depositCapInfo.actualDeposit.toFixed(2)}. Maximum allowed: £${depositCapInfo.maxDeposit.toFixed(2)} (${depositCapInfo.maxWeeks} weeks' rent).`,
            legalBasis: 'Tenant Fees Act 2019 s3 - deposit capped at 5 weeks rent (6 weeks if annual rent > £50,000)',
            affectedQuestionId: 'deposit_reduced_to_legal_cap_confirmed',
            userFixHint: 'Confirm you have refunded/reduced the deposit to within the legal cap, or use Section 8 instead.',
          });
        }
      }

      // Always add inline warning with computed values for visibility
      result.inlineWarnings.push({
        code: 'DEPOSIT_EXCEEDS_CAP',
        message: `Deposit entered: £${depositCapInfo.actualDeposit.toFixed(2)}. Maximum allowed: £${depositCapInfo.maxDeposit.toFixed(2)} (${depositCapInfo.maxWeeks} weeks' rent at £${depositCapInfo.weeklyRent.toFixed(2)}/week).`,
        severity: isSection21 && !isConfirmed ? 'warn' : 'info',
        legalBasis: 'Tenant Fees Act 2019 s3',
        affectedQuestionId: 'deposit_amount',
        computedValues: {
          maxDeposit: depositCapInfo.maxDeposit,
          maxWeeks: depositCapInfo.maxWeeks,
          weeklyRent: depositCapInfo.weeklyRent,
          actualDeposit: depositCapInfo.actualDeposit,
        },
      });
    }
  }

  return result;
}

/**
 * Check if an issue was triggered by the given question IDs.
 *
 * An issue is considered triggered if:
 * 1. Its affected_question_id is in the lastSavedQuestionIds, OR
 * 2. One of its controlling question IDs was in lastSavedQuestionIds
 */
function isIssueTriggeredByQuestions(
  affectedQuestionId: string | undefined,
  lastSavedQuestionIds: string[]
): boolean {
  if (!affectedQuestionId) return false;

  // Direct match
  if (lastSavedQuestionIds.includes(affectedQuestionId)) {
    return true;
  }

  // Check controlling questions
  const controllingIds = QUESTION_ID_TO_CONTROLLING_IDS[affectedQuestionId];
  if (controllingIds) {
    for (const controlId of controllingIds) {
      if (lastSavedQuestionIds.includes(controlId)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Get user-friendly route label
 */
export function getRouteLabel(route: string): string {
  const labels: Record<string, string> = {
    section_8: 'Section 8',
    section_21: 'Section 21',
    notice_to_leave: 'Notice to Leave',
    wales_section_173: 'Section 173',
    wales_fault_based: 'fault-based',
  };
  return labels[route] || route;
}

/**
 * Get a description of why a route is blocked
 */
export function getRouteBlockedReason(issues: RouteInvalidatingIssue[], route: string): string {
  if (issues.length === 0) return '';

  const routeLabel = getRouteLabel(route);
  const firstIssue = issues[0];

  return `${routeLabel} is not available: ${firstIssue.userFixHint}`;
}
