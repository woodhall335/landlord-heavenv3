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
 * 2. Route-invalidating issues block Next and trigger modal ONLY when:
 *    - The disqualifying fact is EXPLICITLY set to a route-invalidating value
 *    - NOT when the fact is merely undefined/missing
 * 3. Missing/unanswered facts produce "guidance only" messages (no modal)
 * 4. Inline warnings are shown under the triggering question
 * 5. Preview/Generate remains the ultimate hard stop
 *
 * @see docs/notice-only-wizard-ux.md for full design documentation
 */

import { runDecisionEngine, type DecisionOutput, type DecisionInput } from '../decision-engine';
import { evaluateNoticeCompliance, type ComplianceResult } from '../notices/evaluate-notice-compliance';
import { normalizeFactKeys } from '../wizard/normalizeFacts';
import type { CanonicalJurisdiction } from '../types/jurisdiction';

// ====================================================================================
// PHASE 1: DEBUG LOGGING HELPER (behind NOTICE_ONLY_DEBUG env flag)
// ====================================================================================
const NOTICE_ONLY_DEBUG = typeof process !== 'undefined' &&
  process.env?.NEXT_PUBLIC_NOTICE_ONLY_DEBUG === '1';

function debugLog(context: string, ...args: any[]) {
  if (NOTICE_ONLY_DEBUG) {
    console.log(`[NOTICE-ONLY-DEBUG] [${context}]`, ...args);
  }
}

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

export interface MissingRequiredFact {
  code: string;
  questionId: string;
  message: string;
}

export interface WizardUxIssuesResult {
  /** Issues that make the CURRENT route unavailable - ONLY when explicit disqualifying answer given */
  routeInvalidatingIssues: RouteInvalidatingIssue[];
  /** Missing/unanswered facts that will be needed (guidance only, NO modal) */
  missingRequiredForCurrentRoute: MissingRequiredFact[];
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
    // NOTE: S21-DEPOSIT-CAP-EXCEEDED is NOT route-invalidating in wizard
    // It is shown as inline warning only; blocking happens at preview/generate
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
  'S21-DEPOSIT-CAP-EXCEEDED': 'deposit_amount', // Points to deposit_amount (no separate confirmation step)
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
  // Deposit cap - inline warning only
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
  // Note: deposit_reduced_to_legal_cap_confirmed removed - deposit cap is inline warning only
};

// ============================================================================
// EXPLICIT DISQUALIFYING CONDITIONS
// Defines when an issue is actually route-invalidating (vs just missing/unanswered)
// Modal should ONLY appear when these explicit conditions are met
// ============================================================================

interface ExplicitDisqualifyingCondition {
  /** The fact key that must be checked */
  factKey: string;
  /** The explicit disqualifying value(s) - if fact === any of these, it's disqualifying */
  disqualifyingValues: any[];
  /** Optional: prerequisite fact that must be true for this to apply */
  prerequisiteFact?: { key: string; value: any };
  /** The question ID that the user needs to edit to fix this */
  affectedQuestionId: string;
}

/**
 * Maps issue codes to explicit disqualifying conditions.
 * An issue should ONLY trigger modal if:
 * 1. The prerequisite fact (if any) matches the expected value
 * 2. The factKey is explicitly set to one of the disqualifyingValues
 *
 * If the fact is undefined/null, it means "not yet answered" -> NO modal
 */
const EXPLICIT_DISQUALIFYING_CONDITIONS: Record<string, ExplicitDisqualifyingCondition> = {
  // Section 21 - Deposit Protection
  'S21-DEPOSIT-NONCOMPLIANT': {
    factKey: 'deposit_protected',
    disqualifyingValues: [false],
    prerequisiteFact: { key: 'deposit_taken', value: true },
    affectedQuestionId: 'deposit_protected_scheme',
  },
  'deposit_not_protected': {
    factKey: 'deposit_protected',
    disqualifyingValues: [false],
    prerequisiteFact: { key: 'deposit_taken', value: true },
    affectedQuestionId: 'deposit_protected_scheme',
  },

  // Section 21 - Prescribed Info
  'S21-PRESCRIBED-INFO-REQUIRED': {
    factKey: 'prescribed_info_given',
    disqualifyingValues: [false],
    prerequisiteFact: { key: 'deposit_protected', value: true },
    affectedQuestionId: 'prescribed_info_given',
  },
  'prescribed_info_not_given': {
    factKey: 'prescribed_info_given',
    disqualifyingValues: [false],
    prerequisiteFact: { key: 'deposit_protected', value: true },
    affectedQuestionId: 'prescribed_info_given',
  },

  // Section 21 - Gas Safety
  'S21-GAS-CERT': {
    factKey: 'gas_certificate_provided',
    disqualifyingValues: [false],
    prerequisiteFact: { key: 'has_gas_appliances', value: true },
    affectedQuestionId: 'gas_safety_certificate',
  },
  'gas_safety_not_provided': {
    factKey: 'gas_certificate_provided',
    disqualifyingValues: [false],
    prerequisiteFact: { key: 'has_gas_appliances', value: true },
    affectedQuestionId: 'gas_safety_certificate',
  },

  // Section 21 - EPC
  'S21-EPC': {
    factKey: 'epc_provided',
    disqualifyingValues: [false],
    affectedQuestionId: 'epc_provided',
  },
  'epc_not_provided': {
    factKey: 'epc_provided',
    disqualifyingValues: [false],
    affectedQuestionId: 'epc_provided',
  },

  // Section 21 - How to Rent
  'S21-H2R': {
    factKey: 'how_to_rent_provided',
    disqualifyingValues: [false],
    affectedQuestionId: 'how_to_rent_provided',
  },
  'how_to_rent_not_provided': {
    factKey: 'how_to_rent_provided',
    disqualifyingValues: [false],
    affectedQuestionId: 'how_to_rent_provided',
  },

  // Section 21 - Licensing
  'S21-LICENSING': {
    factKey: 'property_licensing_status',
    disqualifyingValues: ['unlicensed'],
    affectedQuestionId: 'property_licensing',
  },
  'licensing_issue': {
    factKey: 'property_licensing_status',
    disqualifyingValues: ['unlicensed'],
    affectedQuestionId: 'property_licensing',
  },
  'hmo_not_licensed': {
    factKey: 'property_licensing_status',
    disqualifyingValues: ['unlicensed'],
    affectedQuestionId: 'property_licensing',
  },

  // Section 8 - Grounds Required (empty array is explicit disqualification)
  'S8-GROUNDS-REQUIRED': {
    factKey: 'section8_grounds',
    disqualifyingValues: [[], null, undefined, ''],
    affectedQuestionId: 'section8_grounds_selection',
  },
  'grounds_required': {
    factKey: 'section8_grounds',
    disqualifyingValues: [[], null, undefined, ''],
    affectedQuestionId: 'section8_grounds_selection',
  },
};

/**
 * Check if an issue has an explicit disqualifying value set in facts.
 * Returns:
 * - 'explicit': The fact is explicitly set to a disqualifying value -> MODAL
 * - 'missing': The fact is undefined/missing -> NO MODAL (guidance only)
 * - 'passing': The fact is set but not disqualifying -> NO MODAL
 * - 'not-applicable': No condition defined for this issue code
 */
function getIssueDisqualificationStatus(
  issueCode: string,
  facts: Record<string, any>
): 'explicit' | 'missing' | 'passing' | 'not-applicable' {
  const condition = EXPLICIT_DISQUALIFYING_CONDITIONS[issueCode];

  if (!condition) {
    return 'not-applicable';
  }

  // Check prerequisite if defined
  if (condition.prerequisiteFact) {
    const prereqValue = facts[condition.prerequisiteFact.key];
    if (prereqValue !== condition.prerequisiteFact.value) {
      // Prerequisite not met, so this issue doesn't apply
      return 'passing';
    }
  }

  // Get the fact value
  const factValue = facts[condition.factKey];

  // Check if fact is missing/undefined
  if (factValue === undefined || factValue === null) {
    // Special case: for Section 8 grounds, undefined/null means "not selected yet"
    // which is treated as "explicit" because they need to select grounds
    if (issueCode === 'S8-GROUNDS-REQUIRED' || issueCode === 'grounds_required') {
      return 'explicit';
    }
    return 'missing';
  }

  // Check if the fact value matches any disqualifying value
  for (const disqualifyingValue of condition.disqualifyingValues) {
    // Handle array comparison (for section8_grounds)
    if (Array.isArray(disqualifyingValue) && Array.isArray(factValue)) {
      if (disqualifyingValue.length === 0 && factValue.length === 0) {
        return 'explicit';
      }
    } else if (factValue === disqualifyingValue) {
      return 'explicit';
    }
  }

  return 'passing';
}

/**
 * Check if saving the given question IDs could have explicitly set the disqualifying value.
 * This is used to determine if the modal should be shown for the current save.
 */
function wasDisqualifyingAnswerJustSaved(
  issueCode: string,
  lastSavedQuestionIds: string[],
  facts: Record<string, any>
): boolean {
  const condition = EXPLICIT_DISQUALIFYING_CONDITIONS[issueCode];

  if (!condition) {
    return false;
  }

  // Check if the affected question was directly saved
  if (lastSavedQuestionIds.includes(condition.affectedQuestionId)) {
    return true;
  }

  // For issues with prerequisites, also check if the prerequisite AND disqualifying fact
  // were both just saved or the disqualifying fact was already set and prerequisite just saved
  if (condition.prerequisiteFact) {
    const prereqQuestionId = FACT_KEY_TO_QUESTION_ID[condition.prerequisiteFact.key];
    const factQuestionId = FACT_KEY_TO_QUESTION_ID[condition.factKey];

    // If prerequisite was just saved AND the disqualifying fact is already explicitly false
    if (prereqQuestionId && lastSavedQuestionIds.includes(prereqQuestionId)) {
      const factValue = facts[condition.factKey];
      const isExplicitlyDisqualifying = condition.disqualifyingValues.some(dv => {
        if (Array.isArray(dv) && Array.isArray(factValue)) {
          return dv.length === 0 && factValue.length === 0;
        }
        return factValue === dv;
      });
      if (isExplicitlyDisqualifying) {
        return true;
      }
    }

    // If the disqualifying fact question was just saved
    if (factQuestionId && lastSavedQuestionIds.includes(factQuestionId)) {
      return true;
    }
  }

  return false;
}

/**
 * Maps fact keys to question IDs (reverse of some ISSUE_CODE_TO_QUESTION_ID mappings)
 */
const FACT_KEY_TO_QUESTION_ID: Record<string, string> = {
  deposit_taken: 'deposit_taken',
  deposit_protected: 'deposit_protected_scheme',
  prescribed_info_given: 'prescribed_info_given',
  has_gas_appliances: 'has_gas_appliances',
  gas_certificate_provided: 'gas_safety_certificate',
  epc_provided: 'epc_provided',
  how_to_rent_provided: 'how_to_rent_provided',
  property_licensing_status: 'property_licensing',
  section8_grounds: 'section8_grounds_selection',
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
// PHASE 5: SECTION 8 GROUNDS NORMALIZATION
// ============================================================================

/**
 * Normalizes section8_grounds to always be an array.
 * Handles various input formats:
 * - Already an array: ['ground_8', 'ground_11'] -> ['ground_8', 'ground_11']
 * - Comma-joined string: 'ground_8,ground_11' -> ['ground_8', 'ground_11']
 * - Single value: 'ground_8' -> ['ground_8']
 * - Null/undefined: -> []
 */
function normalizeSection8Grounds(grounds: any): string[] {
  if (!grounds) return [];

  if (Array.isArray(grounds)) {
    // Already an array - filter out empty values
    return grounds.filter((g): g is string => typeof g === 'string' && g.length > 0);
  }

  if (typeof grounds === 'string') {
    // Check if it's a comma-separated string
    if (grounds.includes(',')) {
      return grounds.split(',').map(g => g.trim()).filter(g => g.length > 0);
    }
    // Single value
    return grounds.trim() ? [grounds.trim()] : [];
  }

  // Unexpected type - log and return empty
  console.warn('[normalizeSection8Grounds] Unexpected grounds type:', typeof grounds, grounds);
  return [];
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

  // PHASE 5: Normalize section8_grounds to ensure it's always an array
  if (normalizedFacts.section8_grounds !== undefined) {
    normalizedFacts.section8_grounds = normalizeSection8Grounds(normalizedFacts.section8_grounds);
  }

  // PHASE 1: Debug logging
  debugLog('extractWizardUxIssues input', {
    jurisdiction,
    route,
    lastSavedQuestionIds,
    section8_grounds: normalizedFacts.section8_grounds,
    deposit_protected: normalizedFacts.deposit_protected,
    deposit_taken: normalizedFacts.deposit_taken,
  });

  const result: WizardUxIssuesResult = {
    routeInvalidatingIssues: [],
    missingRequiredForCurrentRoute: [],
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
  // 4. Filter and classify issues using explicit disqualifying conditions
  // -------------------------------------------------------------------------
  // KEY PRINCIPLE: Modal should ONLY appear when a disqualifying ANSWER is given,
  // NOT when a fact is merely missing/unanswered.
  // -------------------------------------------------------------------------
  const routeInvalidatingCodes = ENGLAND_ROUTE_INVALIDATING_CODES[route] || [];

  for (const issue of allIssues) {
    // Check if this is a route-invalidating issue code
    const isRouteInvalidatingCode = routeInvalidatingCodes.includes(issue.code) ||
                                    routeInvalidatingCodes.includes(issue.code.toUpperCase());

    if (!isRouteInvalidatingCode) {
      // Not a route-invalidating code - add as inline warning if triggered
      const isTriggeredByLastSave = isIssueTriggeredByQuestions(
        issue.affectedQuestionId,
        lastSavedQuestionIds
      );
      if (isTriggeredByLastSave) {
        result.inlineWarnings.push({
          code: issue.code,
          message: issue.userFixHint || issue.description,
          severity: 'warn',
          legalBasis: issue.legalBasis,
          affectedQuestionId: issue.affectedQuestionId,
        });
      }
      continue;
    }

    // This is a route-invalidating code - check if it's explicit vs missing
    const disqualificationStatus = getIssueDisqualificationStatus(issue.code, normalizedFacts);

    debugLog('Issue classification', {
      code: issue.code,
      affectedQuestionId: issue.affectedQuestionId,
      disqualificationStatus,
      lastSavedQuestionIds,
    });

    // Filter out "Answer X to continue" style messages - these are guidance, not blocking
    const isGuidanceMessage = issue.userFixHint?.toLowerCase().includes('answer') &&
                              issue.userFixHint?.toLowerCase().includes('to continue');

    if (disqualificationStatus === 'explicit' && !isGuidanceMessage) {
      // Check if the disqualifying answer was just saved (scoped to current save)
      const justSaved = wasDisqualifyingAnswerJustSaved(issue.code, lastSavedQuestionIds, normalizedFacts);

      if (justSaved) {
        // Explicit disqualifying answer was just saved -> MODAL
        result.routeInvalidatingIssues.push({
          code: issue.code,
          route,
          description: issue.description,
          legalBasis: issue.legalBasis,
          affectedQuestionId: issue.affectedQuestionId,
          userFixHint: issue.userFixHint,
        });
      }
    } else if (disqualificationStatus === 'missing') {
      // Fact is missing/unanswered - add as guidance ONLY (no modal)
      // Only add if triggered by the current save (controlling question was saved)
      const isTriggeredByLastSave = isIssueTriggeredByQuestions(
        issue.affectedQuestionId,
        lastSavedQuestionIds
      );
      if (isTriggeredByLastSave && issue.affectedQuestionId) {
        result.missingRequiredForCurrentRoute.push({
          code: issue.code,
          questionId: issue.affectedQuestionId,
          message: issue.userFixHint || issue.description,
        });
      }
    }
    // 'passing' or 'not-applicable' status = no issue to report
  }

  // -------------------------------------------------------------------------
  // 5. Add deposit cap warning with computed values (INLINE ONLY, NEVER BLOCKING)
  // -------------------------------------------------------------------------
  // Per task requirements: "Never make it a step; never block Next"
  // Deposit cap is ONLY shown as inline warning on deposit_amount step.
  // Blocking enforcement happens at preview/generate stage via evaluate-notice-compliance.
  if (lastSavedQuestionIds.includes('deposit_amount') ||
      lastSavedQuestionIds.includes('rent_terms') ||
      lastSavedQuestionIds.includes('deposit_taken')) {

    const depositCapInfo = calculateDepositCapInfo(normalizedFacts);

    if (depositCapInfo?.exceeds && normalizedFacts.deposit_taken === true) {
      const isSection21 = route === 'section_21';

      // Add inline warning with computed values for visibility
      // Severity is 'warn' for Section 21 (will block at preview), 'info' for Section 8
      result.inlineWarnings.push({
        code: 'DEPOSIT_EXCEEDS_CAP',
        message: `Deposit entered: £${depositCapInfo.actualDeposit.toFixed(2)}. Maximum allowed: £${depositCapInfo.maxDeposit.toFixed(2)} (${depositCapInfo.maxWeeks} weeks' rent at £${depositCapInfo.weeklyRent.toFixed(2)}/week).` +
          (isSection21 ? ' This may block Section 21 at preview stage if not resolved.' : ''),
        severity: isSection21 ? 'warn' : 'info',
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

  // PHASE 1: Debug logging for output
  debugLog('extractWizardUxIssues output', {
    routeInvalidatingIssuesCount: result.routeInvalidatingIssues.length,
    routeInvalidatingIssues: result.routeInvalidatingIssues.map(i => ({
      code: i.code,
      affectedQuestionId: i.affectedQuestionId,
    })),
    missingRequiredCount: result.missingRequiredForCurrentRoute.length,
    missingRequired: result.missingRequiredForCurrentRoute.map(m => ({
      code: m.code,
      questionId: m.questionId,
    })),
    inlineWarningsCount: result.inlineWarnings.length,
    inlineWarnings: result.inlineWarnings.map(w => ({
      code: w.code,
      affectedQuestionId: w.affectedQuestionId,
    })),
    alternativeRoutes: result.alternativeRoutes,
  });

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
