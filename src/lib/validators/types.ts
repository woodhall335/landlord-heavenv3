/**
 * Validation Types for Section 21 Court Pack
 *
 * These types define the structure for inline validation results throughout
 * the Section 21 wizard. All validators should return results conforming
 * to these interfaces for consistent UI handling.
 *
 * @module validators/types
 */

// =============================================================================
// VALIDATION RESULT TYPES
// =============================================================================

/**
 * Result of a single validation check.
 *
 * Used by inline validators to communicate validation status to the UI.
 */
export interface ValidationResult {
  /** Whether the value passes validation */
  valid: boolean;

  /** Severity of the validation issue */
  severity: 'error' | 'warning' | 'info';

  /** The field being validated (for error aggregation) */
  field: string;

  /** User-facing validation message */
  message: string;

  /** Additional context or guidance for the user */
  helpText?: string;

  /**
   * If true, prevents form progression until resolved.
   * Errors with blocking=true prevent the "Next" button.
   * Warnings with blocking=false require acknowledgement but allow progression.
   */
  blocking: boolean;
}

/**
 * Aggregated validation state for a wizard step.
 *
 * Used by the form stepper to determine if the user can progress.
 */
export interface StepValidation {
  /** Step identifier */
  stepId: string;

  /** All blocking errors for this step */
  errors: ValidationResult[];

  /** Non-blocking warnings for this step */
  warnings: ValidationResult[];

  /** True if there are no blocking errors */
  isValid: boolean;

  /**
   * True if the user can progress to the next step.
   * This is isValid AND (no warnings OR warnings acknowledged).
   */
  canProgress: boolean;
}

// =============================================================================
// DATE VALIDATION HELPERS
// =============================================================================

/**
 * Options for date comparison validation.
 */
export interface DateComparisonOptions {
  /** Format dates for display in error messages */
  formatDate?: (date: Date) => string;

  /** Custom field name for error reporting */
  fieldName?: string;
}

/**
 * Result of a filing window calculation.
 *
 * Used to warn users about tight court filing deadlines.
 */
export interface FilingWindowResult {
  /** Days available to file at court after possession date */
  windowDays: number;

  /** Date when the Section 21 notice expires (service date + 6 months) */
  expiryDate: Date;

  /** Warning or error if filing window is too tight */
  warning: ValidationResult | null;
}

// =============================================================================
// GAS CERTIFICATE VALIDATION
// =============================================================================

/**
 * Result of gas certificate date validation.
 *
 * Gas certificates require multiple date checks:
 * 1. Issue date is required for N5B form
 * 2. Issue date must be before served date
 * 3. Certificate must be valid (within 12 months) at tenancy start
 * 4. Certificate should be served before occupation
 */
export interface GasCertificateValidationResult {
  /** All validation errors/warnings for gas certificate dates */
  errors: ValidationResult[];

  /** Whether all gas certificate validations pass */
  isValid: boolean;
}

// =============================================================================
// PRESCRIBED INFO VALIDATION
// =============================================================================

/**
 * Result of prescribed information date validation.
 *
 * Prescribed info must be:
 * 1. On or after deposit protection date (cannot serve before deposit protected)
 * 2. Within 30 days of deposit protection (legal requirement)
 */
export interface PrescribedInfoValidationResult extends ValidationResult {
  /** Days between deposit protection and prescribed info service */
  daysDifference?: number;
}

// =============================================================================
// INLINE VALIDATION PROPS (UI Components)
// =============================================================================

/**
 * Props for the InlineValidationMessage component.
 */
export interface InlineValidationMessageProps {
  /** Severity determines styling (error=red, warning=amber, info=blue) */
  severity: 'error' | 'warning' | 'info';

  /** Main validation message */
  message: string;

  /** Optional additional context/help text */
  helpText?: string;

  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Props for validation state passed to form fields.
 */
export interface FieldValidationState {
  /** Current validation error for this field (if any) */
  error?: ValidationResult | null;

  /** Whether the field has been touched/blurred */
  touched: boolean;

  /** Whether validation is currently running */
  validating: boolean;
}

// =============================================================================
// VALIDATION CONTEXT TYPES
// =============================================================================

/**
 * Acknowledged warnings state.
 *
 * When a step has non-blocking warnings, users must acknowledge them
 * before progressing. This tracks which steps have been acknowledged.
 */
export interface AcknowledgedWarnings {
  /** Map of stepId -> true if warnings acknowledged */
  [stepId: string]: boolean;
}

/**
 * Complete validation state for the wizard.
 */
export interface WizardValidationState {
  /** Validation results by step */
  stepValidations: Record<string, StepValidation>;

  /** Acknowledged warnings by step */
  acknowledgedWarnings: AcknowledgedWarnings;

  /** Global validation errors (not step-specific) */
  globalErrors: ValidationResult[];
}
