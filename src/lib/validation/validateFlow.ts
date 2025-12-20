/**
 * Flow Validation Orchestrator
 *
 * Unified validation pipeline used by all API endpoints.
 * Coordinates capability matrix, facts schema, requirements engine, and issue generation.
 */

import { assertFlowSupported, type FlowCapability, type Jurisdiction, type Product } from '../jurisdictions/capabilities/matrix';
import { getRequirements, type ValidationStage } from '../jurisdictions/requirements';
import { validateRequirements, type ValidationIssue, type ValidationOutput } from '../jurisdictions/requirementsValidator';
import { collectSchemaKeys } from '../jurisdictions/facts/referenceScanner';
import * as fs from 'fs';
import * as path from 'path';

export interface FlowValidationInput {
  jurisdiction: Jurisdiction;
  product: Product;
  route: string;
  stage: ValidationStage;
  facts: Record<string, unknown>;
  caseId?: string;
}

export interface FlowValidationResult {
  ok: boolean;
  status: 'ok' | 'invalid' | 'unsupported' | 'misconfigured';
  blocking_issues: ValidationIssue[];
  warnings: ValidationIssue[];
  code?: string;
  error?: string;
  user_message?: string;
}

/**
 * Deduplicate issues by (code + field + affected_question_id)
 */
function dedupeIssues(issues: ValidationIssue[]): ValidationIssue[] {
  const seen = new Set<string>();
  const deduped: ValidationIssue[] = [];

  for (const issue of issues) {
    const key = `${issue.code}:${issue.fields.join(',')}:${issue.affected_question_id || ''}`;
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(issue);
    }
  }

  return deduped;
}

/**
 * Validate facts against schema for a jurisdiction
 */
function validateFactsSchema(
  jurisdiction: Jurisdiction,
  facts: Record<string, unknown>
): { valid: boolean; issues: ValidationIssue[] } {
  const issues: ValidationIssue[] = [];

  try {
    const schemaPath = path.join(process.cwd(), 'config', 'jurisdictions', 'uk', jurisdiction, 'facts_schema.json');

    if (!fs.existsSync(schemaPath)) {
      return { valid: true, issues: [] }; // Schema not found, skip validation
    }

    const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
    const schemaKeys = collectSchemaKeys(schema);

    // Check for unknown fact keys (facts not in schema)
    for (const factKey of Object.keys(facts)) {
      if (!schemaKeys.has(factKey)) {
        // This is informational, not blocking
        issues.push({
          code: 'UNKNOWN_FACT_KEY',
          severity: 'warning',
          fields: [factKey],
          user_fix_hint: `Fact key '${factKey}' is not defined in the schema for ${jurisdiction}`,
          internal_reason: `Unknown fact key: ${factKey}`,
        });
      }
    }
  } catch (error) {
    console.error('Facts schema validation error:', error);
    // Don't block on schema validation errors
  }

  return { valid: true, issues };
}

/**
 * Unified flow validation orchestrator
 *
 * Steps:
 * 1. Assert flow is supported via capability matrix
 * 2. Validate facts against schema
 * 3. Get requirements for stage
 * 4. Validate requirements and generate issues
 * 5. Dedupe issues
 * 6. Return standardized result
 */
export function validateFlow(input: FlowValidationInput): FlowValidationResult {
  const { jurisdiction, product, route, stage, facts } = input;

  // Step 1: Assert flow is supported
  let flow: FlowCapability;
  try {
    flow = assertFlowSupported(jurisdiction, product, route);
  } catch (error: any) {
    // Flow is unsupported or misconfigured
    if (error.statusCode === 422 && error.payload) {
      return {
        ok: false,
        status: 'unsupported',
        blocking_issues: error.payload.blocking_issues || [],
        warnings: error.payload.warnings || [],
        code: error.payload.code,
        error: error.payload.error,
        user_message: error.payload.user_message,
      };
    }

    // Unexpected error
    return {
      ok: false,
      status: 'unsupported',
      blocking_issues: [{
        code: 'FLOW_VALIDATION_ERROR',
        severity: 'blocking',
        fields: [],
        user_fix_hint: error.message || 'Flow validation failed',
      }],
      warnings: [],
      error: error.message,
    };
  }

  // Step 2: Validate facts against schema
  const schemaValidation = validateFactsSchema(jurisdiction, facts);

  // Step 3: Get requirements for this stage
  const ctx = { jurisdiction, product, route, stage, facts };
  const requirements = getRequirements(ctx);

  // Step 4: Validate requirements and generate issues
  const validation = validateRequirements(ctx);

  // Step 5: Merge and dedupe issues
  let allBlockingIssues = [
    ...validation.blocking_issues,
  ];

  let allWarnings = [
    ...validation.warnings,
    ...schemaValidation.issues,
  ];

  allBlockingIssues = dedupeIssues(allBlockingIssues);
  allWarnings = dedupeIssues(allWarnings);

  // Step 6: Return standardized result
  const hasBlockingIssues = allBlockingIssues.length > 0;

  if (hasBlockingIssues) {
    return {
      ok: false,
      status: 'invalid',
      blocking_issues: allBlockingIssues,
      warnings: allWarnings,
      code: 'LEGAL_BLOCK',
      error: 'LEGAL_BLOCK',
      user_message: 'Cannot proceed: required information is missing or invalid',
    };
  }

  return {
    ok: true,
    status: 'ok',
    blocking_issues: [],
    warnings: allWarnings,
  };
}

/**
 * Create standardized 422 payload from validation result
 */
export function create422Response(result: FlowValidationResult) {
  return {
    code: result.code || 'VALIDATION_FAILED',
    error: result.error || result.code || 'Validation failed',
    user_message: result.user_message || result.blocking_issues.map(i => i.user_fix_hint).join('; ') || 'Validation failed',
    blocking_issues: result.blocking_issues.map(issue => ({
      code: issue.code,
      fields: issue.fields,
      affected_question_id: issue.affected_question_id,
      alternate_question_ids: issue.alternate_question_ids,
      user_fix_hint: issue.user_fix_hint,
    })),
    warnings: result.warnings.map(issue => ({
      code: issue.code,
      fields: issue.fields,
      affected_question_id: issue.affected_question_id,
      user_fix_hint: issue.user_fix_hint,
    })),
  };
}
