/**
 * Pre-Generation Validation Types
 *
 * Phase 12: This file contains only type definitions.
 * All validation logic has been migrated to the YAML rules engine.
 *
 * HISTORICAL NOTE:
 * This file previously contained TypeScript-based rule validation functions
 * (runRuleBasedChecks, runPreGenerationCheck). Those have been removed
 * as part of Phase 12 (TS Code Removal) following successful completion
 * of the 14-day stability window.
 *
 * For validation, use:
 * - runYamlOnlyCompletePackValidation() from shadow-mode-adapter.ts
 * - runYamlOnlyNoticeValidation() from shadow-mode-adapter.ts
 */

import {
  runYamlOnlyCompletePackValidation,
  runYamlOnlyNoticeValidation,
  deriveJurisdictionFromFacts,
  deriveRouteFromFacts,
} from './shadow-mode-adapter';
import {
  evaluateEvictionRules,
  type Jurisdiction,
  type Product,
  type EvictionRoute,
} from './eviction-rules-engine';
import { normalizeRoute as normalizeRouteImpl, type CanonicalRoute } from '../wizard/route-normalizer';

// =============================================================================
// Backward-Compatible normalizeRoute (Phase 12)
// =============================================================================

/**
 * Normalize route value to canonical format.
 *
 * This is a backward-compatible wrapper that matches the old API:
 * - Returns undefined for undefined input (old behavior)
 * - Preserves certain values like 'wales_section_173' (old behavior)
 *
 * @param value - Route value to normalize
 * @returns Normalized route or undefined
 */
export function normalizeRoute(value: string | undefined | null): string | undefined {
  if (value === undefined) return undefined;
  if (value === null) return undefined;

  // Preserve these values as-is (legacy behavior)
  const preserveAsIs = ['wales_section_173', 'notice_to_leave'];
  if (preserveAsIs.includes(value)) {
    return value;
  }

  // Use the actual normalizer
  const normalized = normalizeRouteImpl(value);
  return normalized ?? undefined;
}

// =============================================================================
// Types (kept for backward compatibility with other modules)
// =============================================================================

export type IssueSeverity = 'blocker' | 'warning';

export interface ConsistencyIssue {
  code: string;
  severity: IssueSeverity;
  message: string;
  fields: string[];
  suggestion?: string;
}

export interface PreGenerationCheckResult {
  passed: boolean;
  blockers: ConsistencyIssue[];
  warnings: ConsistencyIssue[];
  llm_check_ran: boolean;
}

// Flat wizard facts format (from getCaseFacts)
export type WizardFactsFlat = Record<string, unknown>;

// =============================================================================
// Validation Functions (wrap YAML rules engine for backward compatibility)
// =============================================================================

/**
 * Run rule-based consistency checks on wizard facts.
 *
 * Phase 12: This wraps the YAML rules engine for backward compatibility.
 *
 * @param facts - Flattened wizard facts
 * @param product - Product type ('complete_pack' or 'notice_only')
 * @returns Array of consistency issues
 */
export function runRuleBasedChecks(
  facts: WizardFactsFlat,
  product: 'complete_pack' | 'notice_only' | 'money_claim'
): ConsistencyIssue[] {
  // Products other than complete_pack don't use this validation
  if (product !== 'complete_pack') {
    return [];
  }

  const jurisdiction = deriveJurisdictionFromFacts(facts) as Jurisdiction;
  const routeRaw = deriveRouteFromFacts(facts);
  const route = (normalizeRouteImpl(routeRaw) || 'section_8') as EvictionRoute;

  // Run YAML validation
  const result = evaluateEvictionRules(facts, jurisdiction, product as Product, route);

  if (!result) {
    return [];
  }

  // Convert YAML result to ConsistencyIssue format
  const issues: ConsistencyIssue[] = [];

  for (const blocker of result.blockers) {
    issues.push({
      code: blocker.id,
      severity: 'blocker',
      message: blocker.message,
      fields: [],
      suggestion: blocker.rationale,
    });
  }

  for (const warning of result.warnings) {
    issues.push({
      code: warning.id,
      severity: 'warning',
      message: warning.message,
      fields: [],
      suggestion: warning.rationale,
    });
  }

  return issues;
}

/**
 * Run pre-generation consistency check with optional LLM validation.
 *
 * Phase 12: This wraps the YAML rules engine for backward compatibility.
 * LLM check is disabled by default.
 *
 * @param facts - Flattened wizard facts
 * @param product - Product type ('complete_pack' or 'notice_only')
 * @returns PreGenerationCheckResult
 */
export async function runPreGenerationCheck(
  facts: WizardFactsFlat,
  product: 'complete_pack' | 'notice_only' | 'money_claim'
): Promise<PreGenerationCheckResult> {
  const issues = runRuleBasedChecks(facts, product);

  const blockers = issues.filter((i) => i.severity === 'blocker');
  const warnings = issues.filter((i) => i.severity === 'warning');

  return {
    passed: blockers.length === 0,
    blockers,
    warnings,
    llm_check_ran: false,
  };
}
