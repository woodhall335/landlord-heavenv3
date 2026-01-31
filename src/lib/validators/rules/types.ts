/**
 * Rules Engine Type Definitions
 *
 * This module defines the core types for the deterministic legal validation
 * rules engine. All compliance decisions must be made by rules using facts,
 * NOT by LLM inference.
 */

export type RuleSeverity = 'blocker' | 'warning' | 'info';
export type RuleOutcome = 'pass' | 'fail' | 'needs_info';

export type ValidatorStatus =
  | 'pass'
  | 'warning'
  | 'invalid'
  | 'needs_info'
  | 'unsupported';

export type FactKey = string;

export type FactProvenance =
  | 'user_confirmed'      // User explicitly confirmed/overrode this value
  | 'evidence_verified'   // Value verified from uploaded evidence document
  | 'extracted'           // Value extracted via LLM/regex (needs confirmation for critical facts)
  | 'missing';            // Value is unknown and needs to be provided

export interface FactValue {
  value: unknown;
  provenance: FactProvenance;
  confidence?: number;       // 0-1 score for extracted values
  sourceLabel?: string;      // e.g. "Form 6A text match", "Uploaded EPC PDF", "User confirmed"
}

export interface RuleContext {
  jurisdiction: string;
  validatorKey: 'section_21' | 'section_8';
  facts: Record<FactKey, FactValue | undefined>;
}

export interface RuleResult {
  id: string;
  title: string;
  severity: RuleSeverity;
  outcome: RuleOutcome;
  message: string;
  missingFacts?: FactKey[];
  evidence?: string[];          // Evidence sources that support this result
  legalBasis?: string;          // Short legal reference
}

export interface Rule {
  id: string;
  title: string;
  severity: RuleSeverity;
  requiredFacts?: FactKey[];
  /** Check if this rule applies to the given context */
  applies: (ctx: RuleContext) => boolean;
  /** Evaluate the rule and return the result */
  evaluate: (ctx: RuleContext) => RuleResult;
}

export interface RulesEngineResult {
  results: RuleResult[];
  blockers: RuleResult[];
  warnings: RuleResult[];
  info: RuleResult[];
  status: ValidatorStatus;
  rulesetVersion: string;
}

/**
 * Question definition for Q&A follow-up when facts are missing
 */
export interface FollowUpQuestion {
  factKey: FactKey;
  question: string;
  helpText?: string;
  type: 'yes_no' | 'date' | 'currency' | 'select' | 'text' | 'multi_select';
  options?: Array<{ value: string; label: string }>;
  section: 'dates' | 'deposit' | 'compliance_docs' | 'service' | 'tenancy' | 'grounds' | 'arrears' | 'risk';
  required?: boolean;
  extractedValue?: unknown;       // Value extracted from document (for confirm/edit UI)
  extractedConfidence?: number;   // Confidence of extracted value
}

/**
 * Report section for structured output
 */
export interface ReportSection {
  title: string;
  rules: RuleResult[];
}

/**
 * Evidence checklist item for report
 */
export interface EvidenceChecklistItem {
  label: string;
  status: 'uploaded' | 'user_confirmed' | 'missing';
  sourceLabel?: string;
  recommendation?: string;
}
