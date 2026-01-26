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
