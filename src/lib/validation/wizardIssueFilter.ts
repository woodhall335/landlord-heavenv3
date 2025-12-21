/**
 * Wizard Issue Filter
 *
 * Filters validation issues to only show relevant ones during the wizard flow.
 * Implements the "validation context" concept:
 *
 * - WIZARD_SAVE context: Only show issues caused by user's actual answers, not future missing facts
 * - PREVIEW context: Full validation with all missing required facts
 *
 * Key UX rules:
 * 1. Never show "tenant_full_name missing" before the user reaches that step
 * 2. DO show "deposit not protected" if user answered deposit_protected=false
 * 3. Never block wizard navigation - all issues are warnings until preview
 */

import type { ValidationIssue as BaseValidationIssue } from '../jurisdictions/requirementsValidator';

// Extend ValidationIssue with optional user_fix_hint for test flexibility
export type ValidationIssue = Omit<BaseValidationIssue, 'user_fix_hint'> & {
  user_fix_hint?: string;
};
import {
  transformUserFixHint,
  getQuestionLabel,
  getDecisionIssueAction,
  getDecisionIssueLegalReason,
} from './friendlyLabels';
import { getFlowMapping } from '../mqs/mapping.generated';
import type { Jurisdiction, Product } from '../jurisdictions/capabilities/matrix';

export interface WizardIssueFilterContext {
  /** Jurisdiction for MQS mapping lookup */
  jurisdiction: Jurisdiction;
  /** Product type */
  product: Product;
  /** Route for MQS mapping lookup */
  route: string;
  /** Current wizard facts (all saved answers) */
  facts: Record<string, unknown>;
  /** Set of question IDs that have been answered/saved */
  answeredQuestionIds?: Set<string>;
}

export interface FilteredValidationIssue extends ValidationIssue {
  /** User-friendly action phrase */
  friendlyAction: string;
  /** User-friendly question label for navigation */
  friendlyQuestionLabel?: string;
  /** Legal reason (if available) */
  legalReason?: string;
  /** Whether this issue is from a future unanswered step */
  isFutureStep?: boolean;
}

/**
 * Determine which fact keys have been "touched" by looking at facts
 * A fact is touched if it has any value (including false, 0, empty string)
 */
function getTouchedFactKeys(facts: Record<string, unknown>): Set<string> {
  const touched = new Set<string>();

  for (const [key, value] of Object.entries(facts)) {
    // Skip internal keys
    if (key.startsWith('__') || key === 'route_recommendation' || key === 'ground_recommendations') {
      continue;
    }

    // A fact is "touched" if it has been explicitly set
    // undefined means never answered, everything else means answered
    if (value !== undefined) {
      touched.add(key);

      // For group answers (objects), also mark nested keys as touched
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        for (const nestedKey of Object.keys(value)) {
          touched.add(nestedKey);
          touched.add(`${key}.${nestedKey}`);
        }
      }
    }
  }

  return touched;
}

/**
 * Determine if an issue is caused by a problematic answer (not just a missing fact)
 * Examples:
 * - deposit_protected=false -> this IS a problematic answer (show it)
 * - tenant_full_name=undefined -> this is just missing (hide if not yet asked)
 */
function isProblematicAnswer(
  issue: ValidationIssue,
  facts: Record<string, unknown>,
  touchedFacts: Set<string>
): boolean {
  // Decision engine issues (like DEPOSIT_NOT_PROTECTED) are usually from problematic answers
  const decisionIssueCodes = [
    'DEPOSIT_NOT_PROTECTED',
    'PRESCRIBED_INFO_NOT_GIVEN',
    'GAS_SAFETY_NOT_PROVIDED',
    'HOW_TO_RENT_NOT_PROVIDED',
    'EPC_NOT_PROVIDED',
    'DEPOSIT_EXCEEDS_CAP',
    'RENT_SMART_NOT_REGISTERED',
    'CONTRACT_TYPE_INCOMPATIBLE',
    'HMO_NOT_LICENSED',
    'PRE_ACTION_NOT_MET',
  ];

  if (decisionIssueCodes.includes(issue.code)) {
    // Check if any of the related facts have been touched
    for (const field of issue.fields) {
      if (touchedFacts.has(field)) {
        // The user has answered this - it's a problematic answer
        return true;
      }
    }
    // Not yet touched - might be a conditional that hasn't been reached
    return false;
  }

  // For REQUIRED_FACT_MISSING, check if the fact has been explicitly set to empty/null
  // vs never touched at all
  if (issue.code === 'REQUIRED_FACT_MISSING') {
    for (const field of issue.fields) {
      const value = facts[field];
      // If value is undefined, it was never answered - this is a future step
      if (value === undefined) {
        return false;
      }
      // If value is null or empty string, user explicitly cleared it - show the issue
      if (value === null || value === '') {
        return true;
      }
    }
  }

  return false;
}

/**
 * Check if an issue relates to a question that has been answered
 */
function isAnsweredQuestion(
  issue: ValidationIssue,
  answeredQuestionIds: Set<string> | undefined,
  mapping: ReturnType<typeof getFlowMapping> | undefined,
  touchedFacts: Set<string>
): boolean {
  // If we have explicit answered question IDs, use them
  if (answeredQuestionIds && answeredQuestionIds.size > 0) {
    if (issue.affected_question_id && answeredQuestionIds.has(issue.affected_question_id)) {
      return true;
    }
    if (issue.alternate_question_ids?.some(id => answeredQuestionIds.has(id))) {
      return true;
    }
  }

  // Fall back to checking if any of the issue's fields are in touched facts
  for (const field of issue.fields) {
    if (touchedFacts.has(field)) {
      return true;
    }
  }

  // Also check if the question ID corresponds to any touched facts
  if (issue.affected_question_id && mapping) {
    const questionFactKeys = mapping.questionIdToFactKeys[issue.affected_question_id] || [];
    if (questionFactKeys.some(key => touchedFacts.has(key))) {
      return true;
    }
  }

  return false;
}

/**
 * Filter validation issues for the wizard context
 *
 * Rules:
 * 1. Keep all issues that are caused by problematic answers (user explicitly answered wrong)
 * 2. Keep issues for questions that have been answered
 * 3. Hide REQUIRED_FACT_MISSING issues for unanswered future steps
 * 4. Transform all issues to use friendly labels
 *
 * @param issues The raw validation issues from validateFlow
 * @param context The wizard context with facts and answered questions
 * @returns Filtered and enhanced issues
 */
export function filterWizardIssues(
  issues: ValidationIssue[],
  context: WizardIssueFilterContext
): FilteredValidationIssue[] {
  const { jurisdiction, product, route, facts, answeredQuestionIds } = context;

  // Get MQS mapping for this flow
  const mapping = getFlowMapping(jurisdiction, product, route);

  // Determine which facts have been touched
  const touchedFacts = getTouchedFactKeys(facts);

  const filtered: FilteredValidationIssue[] = [];

  for (const issue of issues) {
    // Check if this is a problematic answer (should always show)
    const problematic = isProblematicAnswer(issue, facts, touchedFacts);

    // Check if this relates to an answered question
    const answered = isAnsweredQuestion(issue, answeredQuestionIds, mapping, touchedFacts);

    // For REQUIRED_FACT_MISSING, only show if:
    // 1. The question has been answered (but fact still missing somehow)
    // 2. OR the fact was touched (explicitly set to empty/null)
    if (issue.code === 'REQUIRED_FACT_MISSING') {
      if (!answered && !problematic) {
        // This is a future step - skip it
        continue;
      }
    }

    // For decision engine issues, show if problematic OR if related facts were touched
    if (issue.code !== 'REQUIRED_FACT_MISSING' && !problematic && !answered) {
      // This issue is not relevant yet - skip it
      continue;
    }

    // Transform the issue with friendly labels
    const friendlyAction = transformUserFixHint(issue.user_fix_hint, issue.fields);
    const friendlyQuestionLabel = issue.affected_question_id
      ? getQuestionLabel(issue.fields[0] || issue.affected_question_id)
      : undefined;

    // Get legal reason for decision engine issues
    let legalReason = issue.legal_basis;
    if (!legalReason && issue.code !== 'REQUIRED_FACT_MISSING') {
      legalReason = getDecisionIssueLegalReason(issue.code);
    }

    filtered.push({
      ...issue,
      friendlyAction,
      friendlyQuestionLabel,
      legalReason,
      isFutureStep: false,
    });
  }

  return filtered;
}

/**
 * Separate issues into blocking and warning categories for UI display
 */
export function categorizeIssues(issues: FilteredValidationIssue[]): {
  blocking: FilteredValidationIssue[];
  warnings: FilteredValidationIssue[];
} {
  const blocking: FilteredValidationIssue[] = [];
  const warnings: FilteredValidationIssue[] = [];

  for (const issue of issues) {
    if (issue.severity === 'blocking') {
      blocking.push(issue);
    } else {
      warnings.push(issue);
    }
  }

  return { blocking, warnings };
}

/**
 * Transform raw validation issues with friendly labels (for preview context)
 * Unlike filterWizardIssues, this doesn't filter - it shows ALL issues
 */
export function transformIssuesWithFriendlyLabels(
  issues: ValidationIssue[]
): FilteredValidationIssue[] {
  return issues.map(issue => {
    const friendlyAction = transformUserFixHint(issue.user_fix_hint, issue.fields);
    const friendlyQuestionLabel = issue.affected_question_id
      ? getQuestionLabel(issue.fields[0] || issue.affected_question_id)
      : undefined;

    // Get legal reason for decision engine issues
    let legalReason = issue.legal_basis;
    if (!legalReason && issue.code !== 'REQUIRED_FACT_MISSING') {
      legalReason = getDecisionIssueLegalReason(issue.code);
    }

    return {
      ...issue,
      friendlyAction,
      friendlyQuestionLabel,
      legalReason,
    };
  });
}

/**
 * Get count summary for UI display
 */
export function getIssueCounts(issues: FilteredValidationIssue[]): {
  blocking: number;
  warnings: number;
  total: number;
} {
  const blocking = issues.filter(i => i.severity === 'blocking').length;
  const warnings = issues.filter(i => i.severity === 'warning').length;
  return {
    blocking,
    warnings,
    total: blocking + warnings,
  };
}
