export interface WizardField {
  id: string;
  label?: string;
  inputType: string;
  input_type?: string;
  placeholder?: string;
  options?: string[];
  dependsOn?: { questionId: string; value: any };
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
  };
  width?: 'full' | 'half' | 'third';
  defaultValue?: any;
  maps_to?: string[];
}

export interface ExtendedWizardQuestion {
  id: string;
  section?: string;
  question: string;
  inputType: string;
  type?: string;
  required?: boolean;
  helperText?: string;
  suggestion_prompt?: string;
  placeholder?: string;
  options?: string[];
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
  };
  dependsOn?: {
    questionId: string;
    value: any;
  };
  routes?: string[];
  skip_if_evidence?: string[];
  fields?: WizardField[];
  evidence_types?: string[];
  maps_to?: string[];
}

export interface StepFlags {
  missing_critical: string[];
  inconsistencies: string[];
  recommended_uploads: Array<{ type: string; reason: string }>;
  route_hint?: {
    recommended: 'section_8' | 'section_21' | 'both' | 'unknown' | 'notice_to_leave' | string;
    reason: string;
  };
  compliance_hints: string[];
}

export type { WizardField as WizardFieldType };

// ============================================================================
// CANONICAL VALIDATION ISSUE TYPES
// ============================================================================
// These types define the unified validation output from /api/wizard/answer
// for inline per-step validation warnings across all notice-only wizards.

/**
 * Canonical validation issue returned by wizard answer endpoint.
 * Used for both blocking issues and warnings.
 */
export interface WizardValidationIssue {
  /** Issue code (e.g., 'DEPOSIT_NOT_PROTECTED', 'EPC_NOT_PROVIDED') */
  code: string;
  /** Severity: 'blocking' will prevent preview generation, 'warning' is recommended */
  severity: 'blocking' | 'warning';
  /** Affected fact keys */
  fields: string[];
  /** Primary MQS question ID to navigate to for fixing */
  affected_question_id?: string;
  /** Alternate question IDs if the primary is not in the current flow */
  alternate_question_ids?: string[];
  /** User-friendly hint on how to fix this issue */
  user_fix_hint?: string;
  /** User-facing message */
  user_message?: string;
  /** Legal basis/reason for this requirement */
  legal_reason?: string;
}

/**
 * Canonical validation response shape from /api/wizard/answer
 */
export interface WizardValidationResponse {
  /** Non-blocking guidance issues from wizard stage */
  wizard_warnings: WizardValidationIssue[];
  /** Blocking issues that will prevent document generation */
  preview_blocking_issues: WizardValidationIssue[];
  /** Warnings from preview stage (recommended for compliance) */
  preview_warnings: WizardValidationIssue[];
  /** Quick boolean check: are there any blocking issues? */
  has_blocking_issues: boolean;
  /** Summary counts for persistent panel display */
  issue_counts: {
    blocking: number;
    warnings: number;
  };
}
