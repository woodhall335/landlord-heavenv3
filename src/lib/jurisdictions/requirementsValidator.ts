/**
 * Requirements Validator
 *
 * Converts requirements from the requirements engine into UI-safe structured issues.
 * Ensures all required facts are either collected via MQS or derived.
 */

import { getRequirements, ValidationContext, RequirementsResult, ValidationStage } from './requirements';
import { getFlowMapping } from '../mqs/mapping.generated';
import type { Jurisdiction, Product } from './capabilities/matrix';

export interface ValidationIssue {
  code: string;
  severity: 'blocking' | 'warning';
  fields: string[];
  affected_question_id?: string;
  alternate_question_ids?: string[];
  user_fix_hint: string;
  internal_reason?: string;
  description?: string;
  legal_basis?: string;
}

export interface ValidationOutput {
  blocking_issues: ValidationIssue[];
  warnings: ValidationIssue[];
  missing_required_facts: string[];
  status: 'ok' | 'unsupported' | 'misconfigured' | 'invalid';
}

export function validateRequirements(ctx: ValidationContext): ValidationOutput {
  const requirements = getRequirements(ctx);

  // Handle fail-closed states
  if (requirements.status === 'unsupported') {
    return {
      status: 'unsupported',
      blocking_issues: [{
        code: 'FLOW_NOT_SUPPORTED',
        severity: 'blocking',
        fields: [],
        user_fix_hint: requirements.statusReason || `This flow is not supported: ${ctx.jurisdiction}/${ctx.product}`,
      }],
      warnings: [],
      missing_required_facts: [],
    };
  }

  if (requirements.status === 'misconfigured') {
    return {
      status: 'misconfigured',
      blocking_issues: [{
        code: 'FLOW_MISCONFIGURED',
        severity: 'blocking',
        fields: [],
        user_fix_hint: requirements.statusReason || `This flow is misconfigured and unavailable`,
      }],
      warnings: [],
      missing_required_facts: [],
    };
  }

  // Get MQS mapping for this flow
  const mapping = getFlowMapping(
    ctx.jurisdiction as Jurisdiction,
    ctx.product as Product,
    ctx.route
  );

  const blocking_issues: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];
  const missing_required_facts: string[] = [];

  // Check required facts
  for (const factKey of requirements.requiredNow) {
    const factValue = ctx.facts[factKey];

    // Skip if fact is provided
    if (factValue !== undefined && factValue !== null && factValue !== '') {
      continue;
    }

    // Skip if fact is derived (computed/optional)
    if (requirements.derived.has(factKey)) {
      continue;
    }

    missing_required_facts.push(factKey);

    // Try to find MQS question ID for this fact
    const questionIds = mapping?.factKeyToQuestionIds[factKey] || [];
    const affectedQuestionId = questionIds[0];
    const alternateQuestionIds = questionIds.length > 1 ? questionIds.slice(1) : undefined;

    // Create blocking issue
    blocking_issues.push({
      code: 'REQUIRED_FACT_MISSING',
      severity: 'blocking',
      fields: [factKey],
      affected_question_id: affectedQuestionId,
      alternate_question_ids: alternateQuestionIds,
      user_fix_hint: affectedQuestionId
        ? `Please answer the question "${affectedQuestionId}" to provide ${factKey}`
        : `Required information missing: ${factKey}`,
      internal_reason: `Missing required fact: ${factKey} at stage ${ctx.stage}`,
    });
  }

  // Check warned facts
  for (const factKey of requirements.warnNow) {
    const factValue = ctx.facts[factKey];

    // Skip if fact is provided
    if (factValue !== undefined && factValue !== null && factValue !== '') {
      continue;
    }

    // Skip if fact is derived
    if (requirements.derived.has(factKey)) {
      continue;
    }

    // Try to find MQS question ID for this fact
    const questionIds = mapping?.factKeyToQuestionIds[factKey] || [];
    const affectedQuestionId = questionIds[0];
    const alternateQuestionIds = questionIds.length > 1 ? questionIds.slice(1) : undefined;

    // Create warning issue
    warnings.push({
      code: 'RECOMMENDED_FACT_MISSING',
      severity: 'warning',
      fields: [factKey],
      affected_question_id: affectedQuestionId,
      alternate_question_ids: alternateQuestionIds,
      user_fix_hint: affectedQuestionId
        ? `Consider answering "${affectedQuestionId}" to provide ${factKey}`
        : `Recommended information: ${factKey}`,
      internal_reason: `Warned fact: ${factKey} at stage ${ctx.stage}`,
    });
  }

  return {
    status: blocking_issues.length > 0 ? 'invalid' : 'ok',
    blocking_issues,
    warnings,
    missing_required_facts,
  };
}

/**
 * Helper: Create standardized 422 error payload from validation output
 */
export function create422Payload(validation: ValidationOutput) {
  return {
    code: validation.status === 'unsupported' ? 'FLOW_NOT_SUPPORTED' :
          validation.status === 'misconfigured' ? 'FLOW_MISCONFIGURED' :
          'VALIDATION_FAILED',
    error: validation.blocking_issues[0]?.user_fix_hint || 'Validation failed',
    user_message: validation.blocking_issues.map(i => i.user_fix_hint).join('; '),
    blocking_issues: validation.blocking_issues.map(issue => ({
      code: issue.code,
      fields: issue.fields,
      affected_question_id: issue.affected_question_id,
      alternate_question_ids: issue.alternate_question_ids,
      user_fix_hint: issue.user_fix_hint,
    })),
    warnings: validation.warnings.map(issue => ({
      code: issue.code,
      fields: issue.fields,
      affected_question_id: issue.affected_question_id,
      user_fix_hint: issue.user_fix_hint,
    })),
  };
}
