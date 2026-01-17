/**
 * Rules Engine Runner
 *
 * Executes a set of rules against a context and produces a deterministic result.
 * Status computation follows strict precedence:
 * 1. If any blocker fails => 'invalid'
 * 2. Else if any rule needs_info => 'needs_info'
 * 3. Else if any warning fails => 'warning'
 * 4. Else => 'pass'
 */

import type {
  Rule,
  RuleContext,
  RuleResult,
  RulesEngineResult,
  ValidatorStatus,
  FactValue,
  FactKey,
} from './types';
import { VALIDATOR_RULESET_VERSION } from './version';

/**
 * Run a set of rules against a context and return the aggregated result.
 */
export function runRules(rules: Rule[], ctx: RuleContext): RulesEngineResult {
  const results: RuleResult[] = [];
  const blockers: RuleResult[] = [];
  const warnings: RuleResult[] = [];
  const info: RuleResult[] = [];

  for (const rule of rules) {
    // Check if rule applies to this context
    if (!rule.applies(ctx)) {
      continue;
    }

    // Evaluate the rule
    const result = rule.evaluate(ctx);
    results.push(result);

    // Categorize by severity
    switch (result.severity) {
      case 'blocker':
        blockers.push(result);
        break;
      case 'warning':
        warnings.push(result);
        break;
      case 'info':
        info.push(result);
        break;
    }
  }

  // Compute overall status deterministically
  const status = computeStatus(blockers, warnings, info);

  return {
    results,
    blockers,
    warnings,
    info,
    status,
    rulesetVersion: VALIDATOR_RULESET_VERSION,
  };
}

/**
 * Compute the overall validation status from rule results.
 *
 * Precedence:
 * 1. If any blocker has outcome 'fail' => 'invalid'
 * 2. Else if any rule has outcome 'needs_info' => 'needs_info'
 * 3. Else if any warning has outcome 'fail' => 'warning'
 * 4. Else => 'pass'
 */
function computeStatus(
  blockers: RuleResult[],
  warnings: RuleResult[],
  info: RuleResult[]
): ValidatorStatus {
  // Check for any blocker failures
  const hasBlockerFail = blockers.some((r) => r.outcome === 'fail');
  if (hasBlockerFail) {
    return 'invalid';
  }

  // Check for any needs_info across all results
  const allResults = [...blockers, ...warnings, ...info];
  const hasNeedsInfo = allResults.some((r) => r.outcome === 'needs_info');
  if (hasNeedsInfo) {
    return 'needs_info';
  }

  // Check for any warning failures
  const hasWarningFail = warnings.some((r) => r.outcome === 'fail');
  if (hasWarningFail) {
    return 'warning';
  }

  return 'pass';
}

/**
 * Helper to get a fact value from context.
 * Returns the raw value if present, undefined otherwise.
 */
export function getFact<T = unknown>(
  ctx: RuleContext,
  key: FactKey
): T | undefined {
  const factValue = ctx.facts[key];
  if (!factValue || factValue.provenance === 'missing') {
    return undefined;
  }
  return factValue.value as T;
}

/**
 * Helper to get a fact with its full metadata.
 */
export function getFactWithMeta(
  ctx: RuleContext,
  key: FactKey
): FactValue | undefined {
  return ctx.facts[key];
}

/**
 * Check if a fact is present and has a known value (not missing).
 */
export function hasFact(ctx: RuleContext, key: FactKey): boolean {
  const factValue = ctx.facts[key];
  return factValue !== undefined && factValue.provenance !== 'missing';
}

/**
 * Check if a fact has high confidence (user_confirmed or evidence_verified).
 */
export function hasHighConfidenceFact(ctx: RuleContext, key: FactKey): boolean {
  const factValue = ctx.facts[key];
  if (!factValue) return false;
  return (
    factValue.provenance === 'user_confirmed' ||
    factValue.provenance === 'evidence_verified'
  );
}

/**
 * Check if any of the specified facts are missing.
 * Returns the list of missing fact keys.
 */
export function getMissingFacts(
  ctx: RuleContext,
  requiredFacts: FactKey[]
): FactKey[] {
  return requiredFacts.filter((key) => !hasFact(ctx, key));
}

/**
 * Get a yes/no fact value normalized to boolean.
 * Returns undefined if fact is missing or not a boolean-like value.
 */
export function getYesNoFact(ctx: RuleContext, key: FactKey): boolean | undefined {
  const value = getFact<unknown>(ctx, key);
  if (value === undefined) return undefined;

  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const lower = value.toLowerCase();
    if (lower === 'yes' || lower === 'true' || lower === '1') return true;
    if (lower === 'no' || lower === 'false' || lower === '0') return false;
  }
  return undefined;
}

/**
 * Get a numeric fact value.
 */
export function getNumericFact(ctx: RuleContext, key: FactKey): number | undefined {
  const value = getFact<unknown>(ctx, key);
  if (value === undefined) return undefined;

  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value.replace(/[£,]/g, ''));
    if (!isNaN(parsed)) return parsed;
  }
  return undefined;
}

/**
 * Get a string fact value.
 */
export function getStringFact(ctx: RuleContext, key: FactKey): string | undefined {
  const value = getFact<unknown>(ctx, key);
  if (value === undefined) return undefined;
  return String(value);
}

/**
 * Get an array fact value.
 */
export function getArrayFact<T = unknown>(
  ctx: RuleContext,
  key: FactKey
): T[] | undefined {
  const value = getFact<unknown>(ctx, key);
  if (value === undefined) return undefined;
  if (Array.isArray(value)) return value as T[];
  return [value] as T[];
}

/**
 * Create a rule result helper for common patterns.
 */
export function createRuleResult(
  rule: Pick<Rule, 'id' | 'title' | 'severity'>,
  outcome: RuleResult['outcome'],
  message: string,
  options?: {
    missingFacts?: FactKey[];
    evidence?: string[];
    legalBasis?: string;
  }
): RuleResult {
  return {
    id: rule.id,
    title: rule.title,
    severity: rule.severity,
    outcome,
    message,
    ...options,
  };
}
