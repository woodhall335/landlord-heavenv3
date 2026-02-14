/**
 * Notice Compliance Evaluation
 *
 * This module provides a unified interface for evaluating notice compliance
 * across all jurisdictions and products. It wraps the YAML rules engine and
 * provides a consistent output format for the wizard UX and preview pages.
 *
 * @see config/legal-requirements/ for YAML rule definitions
 */

import { evaluateEvictionRules, buildRuleFactsView } from '../validation/eviction-rules-engine';
import type { Jurisdiction, Product, EvictionRoute } from '../validation/eviction-rules-engine';
import { normalizeRoute, type CanonicalRoute } from '../wizard/route-normalizer';

// =============================================================================
// TYPES
// =============================================================================

export interface EvaluateNoticeComplianceParams {
  jurisdiction: 'england' | 'wales' | 'scotland';
  product: 'notice_only' | 'complete_pack' | 'money_claim';
  selected_route: string;
  wizardFacts: Record<string, unknown>;
  stage?: 'wizard' | 'preview' | 'generate';
}

export interface ComplianceFailure {
  code: string;
  description: string;
  legal_reason?: string;
  affected_question_id: string;
  user_fix_hint: string;
}

export interface ComplianceWarning {
  code: string;
  message: string;
  affected_question_id?: string;
  user_fix_hint?: string;
}

export interface NoticeComplianceResult {
  ok: boolean;
  hardFailures: ComplianceFailure[];
  warnings: ComplianceWarning[];
}

// =============================================================================
// ISSUE CODE MAPPINGS
// =============================================================================

/**
 * Maps YAML rule IDs to user-facing issue codes.
 * Some rules use different naming conventions.
 */
const YAML_ID_TO_ISSUE_CODE: Record<string, string> = {
  // Section 21 (England)
  's21_deposit_noncompliant': 'S21-DEPOSIT-NONCOMPLIANT',
  's21_deposit_not_protected': 'S21-DEPOSIT-NONCOMPLIANT',
  's21_prescribed_info_not_given': 'S21-PRESCRIBED-INFO-REQUIRED',
  's21_deposit_taken_not_protected': 'S21-DEPOSIT-NONCOMPLIANT',
  's21_prescribed_info_unconfirmed': 'S21-PRESCRIBED-INFO-REQUIRED',
  's21_deposit_unconfirmed': 'S21-DEPOSIT-NONCOMPLIANT',
  's21_epc_not_provided': 'S21-EPC',
  's21_how_to_rent_not_provided': 'S21-H2R',
  's21_gas_cert_not_provided': 'S21-GAS-CERT',
  's21_gas_safety_not_provided': 'S21-GAS-CERT',
  's21_licensing_required_not_licensed': 'S21-LICENSING',
  's21_hmo_not_licensed': 'S21-LICENSING',
  's21_deposit_cap_exceeded': 'S21-DEPOSIT-CAP-EXCEEDED',
  's21_notice_period_short': 'S21-DATE-TOO-SOON',
  's21_four_month_bar': 'S21-FOUR-MONTH-BAR',
  // Section 8 (England)
  's8_no_grounds': 'S8-GROUNDS-REQUIRED',
  's8_grounds_required': 'S8-GROUNDS-REQUIRED',
  's8_notice_period_short': 'S8-DATE-TOO-SOON',
  // Wales Section 173
  's173_rent_smart_not_registered': 'S173-LICENSING',
  's173_notice_period_undetermined': 'S173-NOTICE-PERIOD-UNDETERMINED',
  's173_deposit_not_protected': 'S173-DEPOSIT-NONCOMPLIANT',
  's173_written_statement_missing': 'S173-WRITTEN-STATEMENT',
  // Scotland Notice to Leave
  'ntl_pre_action_not_confirmed': 'NTL-PRE-ACTION',
  'ntl_pre_action_letter_not_sent': 'NTL-PRE-ACTION',
  'ntl_deposit_not_protected': 'NTL-DEPOSIT-NONCOMPLIANT',
  'ntl_landlord_not_registered': 'NTL-LANDLORD-REGISTRATION',
};

/**
 * Maps issue codes to question IDs for deep-linking.
 */
const ISSUE_CODE_TO_QUESTION_ID: Record<string, string> = {
  // Section 21 issues
  'S21-DEPOSIT-NONCOMPLIANT': 'deposit_protected_scheme',
  'S21-PRESCRIBED-INFO-REQUIRED': 'prescribed_info_given',
  'S21-LICENSING': 'property_licensing',
  'S21-GAS-CERT': 'gas_safety_certificate',
  'S21-EPC': 'epc_provided',
  'S21-H2R': 'how_to_rent_provided',
  'S21-DEPOSIT-CAP-EXCEEDED': 'deposit_amount',
  'S21-FOUR-MONTH-BAR': 'tenancy_start_date',
  'S21-DATE-TOO-SOON': 'notice_expiry_date',
  // Section 8 issues
  'S8-GROUNDS-REQUIRED': 'section8_grounds_selection',
  'S8-DATE-TOO-SOON': 'notice_expiry_date',
  // Wales issues
  'S173-LICENSING': 'rent_smart_wales',
  'S173-NOTICE-PERIOD-UNDETERMINED': 'tenancy_details',
  'S173-DEPOSIT-NONCOMPLIANT': 'deposit_protected_scheme',
  'S173-WRITTEN-STATEMENT': 'written_statement',
  // Scotland issues
  'NTL-PRE-ACTION': 'pre_action_protocol',
  'NTL-DEPOSIT-NONCOMPLIANT': 'deposit_protected_scheme',
  'NTL-LANDLORD-REGISTRATION': 'landlord_registration',
};

/**
 * Maps issue codes to user-friendly fix hints.
 */
const ISSUE_CODE_TO_FIX_HINT: Record<string, string> = {
  'S21-DEPOSIT-NONCOMPLIANT': 'The deposit must be protected in a government-approved scheme.',
  'S21-PRESCRIBED-INFO-REQUIRED': 'You must serve the prescribed information about the deposit protection.',
  'S21-LICENSING': 'The property must be properly licensed (HMO or selective licensing if applicable).',
  'S21-GAS-CERT': 'A valid gas safety certificate must be provided to the tenant.',
  'S21-EPC': 'A valid Energy Performance Certificate (EPC) must be provided to the tenant.',
  'S21-H2R': 'The government\'s "How to Rent" guide must be provided to the tenant.',
  'S21-DEPOSIT-CAP-EXCEEDED': 'The deposit exceeds the legal cap under the Tenant Fees Act 2019.',
  'S21-FOUR-MONTH-BAR': 'Section 21 notice cannot be served within the first 4 months of the tenancy.',
  'S21-DATE-TOO-SOON': 'The notice expiry date must give at least 2 months\' notice.',
  'S8-GROUNDS-REQUIRED': 'At least one ground for possession must be selected.',
  'S8-DATE-TOO-SOON': 'The notice expiry date does not meet the minimum notice period for the selected grounds.',
  'S173-LICENSING': 'The landlord must be registered with Rent Smart Wales.',
  'S173-NOTICE-PERIOD-UNDETERMINED': 'Cannot determine the required notice period. Please check tenancy details.',
  'S173-DEPOSIT-NONCOMPLIANT': 'The deposit must be protected in a government-approved scheme.',
  'S173-WRITTEN-STATEMENT': 'A written statement of terms must be provided to the contract holder.',
  'NTL-PRE-ACTION': 'Pre-action protocol steps must be completed before serving notice for rent arrears.',
  'NTL-DEPOSIT-NONCOMPLIANT': 'The deposit must be protected in a government-approved scheme.',
  'NTL-LANDLORD-REGISTRATION': 'The landlord must be registered with the Scottish Landlord Register.',
};

const NOTICE_ONLY_IGNORED_RULE_IDS = new Set([
  'landlord_name_required',
  'tenant_name_required',
  'property_address_required',
]);

const NOTICE_ONLY_ALWAYS_HARD = new Set([
  's21_deposit_cap_exceeded',
]);

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Normalize route for YAML engine compatibility.
 */
function normalizeRouteForYaml(route: string): EvictionRoute {
  // Handle Wales prefixed routes
  if (route === 'wales_section_173') return 'section_173' as EvictionRoute;
  if (route === 'wales_fault_based') return 'fault_based' as EvictionRoute;

  // Use the route normalizer for standard routes
  const normalized = normalizeRoute(route);
  return (normalized || 'section_8') as EvictionRoute;
}

/**
 * Convert YAML rule ID to user-facing issue code.
 */
function toIssueCode(yamlId: string): string {
  // Check direct mapping first
  if (YAML_ID_TO_ISSUE_CODE[yamlId]) {
    return YAML_ID_TO_ISSUE_CODE[yamlId];
  }

  // Convert snake_case to SCREAMING-KEBAB-CASE
  return yamlId.toUpperCase().replace(/_/g, '-');
}

/**
 * Get question ID for an issue code.
 */
function getAffectedQuestionId(issueCode: string): string {
  return ISSUE_CODE_TO_QUESTION_ID[issueCode] || 'general';
}

/**
 * Get user fix hint for an issue code.
 */
function getUserFixHint(issueCode: string, message: string): string {
  return ISSUE_CODE_TO_FIX_HINT[issueCode] || message;
}

function shouldDowngradeNoticeOnlyBlocker(blockerId: string, facts: Record<string, unknown>): boolean {
  switch (blockerId) {
    case 's21_prescribed_info_unconfirmed':
    case 's21_deposit_unconfirmed':
      return true;
    case 's21_epc':
      return facts.epc_provided === undefined;
    case 's21_h2r':
      return facts.how_to_rent_provided === undefined;
    case 's21_gas_cert':
      return facts.gas_certificate_provided === undefined;
    case 's21_licensing':
      return facts.property_licensing_status === undefined && !facts.licensing_required;
    case 's21_notice_period_calculation_failed':
      return facts.notice_expiry_date === undefined;
    default:
      return false;
  }
}

function buildDepositCapReason(facts: Record<string, unknown>, fallback: string): string {
  const depositAmount = Number.parseFloat(String(facts.deposit_amount ?? ''));
  const rentAmount = Number.parseFloat(String(facts.rent_amount ?? ''));

  if (!Number.isFinite(depositAmount) || !Number.isFinite(rentAmount) || rentAmount <= 0) {
    return fallback;
  }

  const frequency = (facts.rent_frequency ?? 'monthly') as string;
  let annualRent = rentAmount * 12;

  switch (frequency) {
    case 'weekly':
      annualRent = rentAmount * 52;
      break;
    case 'fortnightly':
      annualRent = rentAmount * 26;
      break;
    case 'quarterly':
      annualRent = rentAmount * 4;
      break;
    case 'yearly':
      annualRent = rentAmount;
      break;
  }

  const weeklyRent = annualRent / 52;
  const maxWeeks = annualRent > 50000 ? 6 : 5;
  const maxDeposit = weeklyRent * maxWeeks;

  return `Entered deposit £${depositAmount.toFixed(2)}. Maximum allowed (${maxWeeks} weeks) £${maxDeposit.toFixed(2)}. ${fallback}`;
}

// =============================================================================
// MAIN FUNCTION
// =============================================================================

/**
 * Evaluate notice compliance using the YAML rules engine.
 *
 * This function:
 * 1. Normalizes input parameters for the YAML engine
 * 2. Evaluates rules based on jurisdiction, product, and route
 * 3. Converts YAML rule results to the standard compliance output format
 * 4. Maps rule IDs to question IDs for deep-linking
 *
 * @param params - Evaluation parameters
 * @returns Compliance result with ok status, hard failures, and warnings
 */
export function evaluateNoticeCompliance(params: EvaluateNoticeComplianceParams): NoticeComplianceResult {
  const { jurisdiction, product, selected_route, wizardFacts, stage = 'preview' } = params;

  // Normalize route for YAML engine
  const route = normalizeRouteForYaml(selected_route);

  // Run YAML validation
  const yamlResult = evaluateEvictionRules(
    wizardFacts,
    jurisdiction as Jurisdiction,
    product as Product,
    route
  );

  if (!yamlResult) {
    console.warn(`[evaluateNoticeCompliance] No YAML result for ${jurisdiction}/${product}/${route}`);
    return {
      ok: true,
      hardFailures: [],
      warnings: [],
    };
  }

  // Convert blockers to hard failures
  // At wizard stage, blockers become warnings (non-blocking)
  // At preview/generate stage, blockers are hard failures
  const hardFailures: ComplianceFailure[] = [];
  const warnings: ComplianceWarning[] = [];
  const normalizedFacts = buildRuleFactsView(wizardFacts);

  for (const blocker of yamlResult.blockers) {
    if (product === 'notice_only' && NOTICE_ONLY_IGNORED_RULE_IDS.has(blocker.id)) {
      continue;
    }

    const issueCode = toIssueCode(blocker.id);
    const affectedQuestionId = getAffectedQuestionId(issueCode);
    const userFixHint = getUserFixHint(issueCode, blocker.message);

    if (product === 'notice_only' && shouldDowngradeNoticeOnlyBlocker(blocker.id, normalizedFacts)) {
      warnings.push({
        code: issueCode,
        message: blocker.message,
        affected_question_id: affectedQuestionId,
        user_fix_hint: userFixHint,
      });
      continue;
    }

    if (stage === 'wizard' && !(product === 'notice_only' && NOTICE_ONLY_ALWAYS_HARD.has(blocker.id))) {
      // At wizard stage, show as warning (non-blocking)
      warnings.push({
        code: issueCode,
        message: blocker.message,
        affected_question_id: affectedQuestionId,
        user_fix_hint: userFixHint,
      });
    } else {
      // At preview/generate stage, show as hard failure
      const legalReason = issueCode === 'S21-DEPOSIT-CAP-EXCEEDED'
        ? buildDepositCapReason(normalizedFacts, blocker.rationale || blocker.message)
        : (blocker.rationale || blocker.message);
      hardFailures.push({
        code: issueCode,
        description: blocker.message,
        legal_reason: legalReason,
        affected_question_id: affectedQuestionId,
        user_fix_hint: userFixHint,
      });
    }
  }

  // Warnings are always warnings
  for (const warning of yamlResult.warnings) {
    if (product === 'notice_only' && NOTICE_ONLY_IGNORED_RULE_IDS.has(warning.id)) {
      continue;
    }

    const issueCode = toIssueCode(warning.id);
    const affectedQuestionId = getAffectedQuestionId(issueCode);
    const userFixHint = getUserFixHint(issueCode, warning.message);

    warnings.push({
      code: issueCode,
      message: warning.message,
      affected_question_id: affectedQuestionId,
      user_fix_hint: userFixHint,
    });
  }

  return {
    ok: hardFailures.length === 0,
    hardFailures,
    warnings,
  };
}
