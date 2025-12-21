/**
 * Decision Engine Issue Mapper
 *
 * Converts decision engine BlockingIssue objects to ValidationIssue format
 * with affected_question_id from MQS mapping.
 *
 * This ensures decision engine issues are consistent with requirements engine issues.
 */

import type { BlockingIssue } from './index';
import type { ValidationIssue } from '../jurisdictions/requirementsValidator';
import { getFlowMapping, type FlowMapping } from '../mqs/mapping.generated';
import type { Jurisdiction, Product } from '../jurisdictions/capabilities/matrix';

/**
 * Maps decision engine issue codes to the fact keys they validate
 */
const ISSUE_CODE_TO_FACT_KEYS: Record<string, string[]> = {
  // England/Wales Section 21
  deposit_not_protected: ['deposit_protected'],
  prescribed_info_not_given: ['prescribed_info_given'],
  gas_safety_not_provided: ['gas_safety_cert_provided'],
  how_to_rent_not_provided: ['how_to_rent_given', 'how_to_rent_guide_provided'],
  epc_not_provided: ['epc_provided'],
  hmo_not_licensed: ['hmo_license_valid'],

  // Deposit cap (Tenant Fees Act 2019 - England & Wales)
  deposit_exceeds_cap: ['deposit_amount', 'rent_amount'],

  // Wales Section 173
  contract_type_incompatible: ['wales_contract_category', 'contract_category'],
  rent_smart_not_registered: ['rent_smart_wales_registered'],

  // Scotland Notice to Leave
  pre_action_not_met: ['pre_action_confirmed'],

  // General/unknown
  ni_not_supported: [],
};

export interface DecisionIssueMapperContext {
  jurisdiction: Jurisdiction;
  product: Product;
  route: string;
}

/**
 * Convert decision engine BlockingIssue to ValidationIssue with affected_question_id
 */
export function mapDecisionIssueToValidationIssue(
  issue: BlockingIssue,
  context: DecisionIssueMapperContext
): ValidationIssue {
  const { jurisdiction, product, route } = context;

  // Get fact keys for this issue code
  const factKeys = ISSUE_CODE_TO_FACT_KEYS[issue.issue] || [];

  // Get MQS mapping for this flow
  const mapping = getFlowMapping(jurisdiction, product, route);

  // Find affected_question_id from first fact key
  let affectedQuestionId: string | undefined;
  const alternateQuestionIds: string[] = [];

  for (const factKey of factKeys) {
    const questionIds = mapping?.factKeyToQuestionIds[factKey] || [];
    if (questionIds.length > 0) {
      if (!affectedQuestionId) {
        affectedQuestionId = questionIds[0];
      }
      alternateQuestionIds.push(...questionIds.slice(1));
    }
  }

  // Convert to ValidationIssue format
  return {
    code: issue.issue.toUpperCase(), // DEPOSIT_NOT_PROTECTED
    severity: issue.severity === 'blocking' ? 'blocking' : 'warning',
    fields: factKeys,
    affected_question_id: affectedQuestionId,
    alternate_question_ids: alternateQuestionIds.length > 0 ? alternateQuestionIds : undefined,
    user_fix_hint: issue.action_required || issue.description,
    description: issue.description,
    legal_basis: issue.legal_basis,
  };
}

/**
 * Convert all decision engine blocking issues to ValidationIssue format
 */
export function mapDecisionIssuesToValidationIssues(
  blockingIssues: BlockingIssue[],
  context: DecisionIssueMapperContext
): ValidationIssue[] {
  return blockingIssues.map(issue => mapDecisionIssueToValidationIssue(issue, context));
}
