/**
 * MQS Field Validator
 *
 * Generic field-level validation for MQS (Master Question Set) questions.
 * Provides real-time validation as users type, with inline error messages.
 *
 * Key principles:
 * 1. Boolean `false` is a VALID answer (not treated as empty)
 * 2. Conditional fields respect their `dependsOn` conditions
 * 3. Pattern validation uses regex from MQS config
 * 4. Number fields validate min/max bounds
 * 5. Date fields validate format (dd/mm/yyyy or yyyy-mm-dd)
 * 6. AssertValue validation for Section 21 compliance booleans
 */

// ============================================================================
// TYPES
// ============================================================================

export interface FieldValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface FieldValidationResult {
  isValid: boolean;
  errors: FieldValidationError[];
}

export interface ValidationRule {
  required?: boolean;
  pattern?: string;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  assertValue?: boolean | string;
  assertMessage?: string;
}

export interface DependsOnCondition {
  questionId?: string;
  fieldId?: string;
  value?: any;
  valueNotEqual?: any;
  contains?: string;
}

export interface MQSField {
  id: string;
  label?: string;
  inputType?: string;
  validation?: ValidationRule;
  dependsOn?: DependsOnCondition;
}

export interface MQSQuestion {
  id: string;
  inputType: string;
  validation?: ValidationRule;
  fields?: MQSField[];
  dependsOn?: DependsOnCondition;
}

// ============================================================================
// VALIDATION PATTERNS
// ============================================================================

/**
 * Common UK-specific validation patterns
 */
export const UK_PATTERNS = {
  // UK postcode: covers all formats (e.g., LS28 7PW, SW1A 1AA, M1 1AA)
  POSTCODE: /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i,

  // Email: standard email format
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

  // UK phone: starts with 0 or +44, 10-11 digits
  PHONE: /^(?:\+44\s?|0)(?:\d\s?){9,10}$/,

  // Date: dd/mm/yyyy format
  DATE_UK: /^(\d{2})\/(\d{2})\/(\d{4})$/,

  // Date: yyyy-mm-dd format (ISO)
  DATE_ISO: /^(\d{4})-(\d{2})-(\d{2})$/,
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if a value is empty.
 * IMPORTANT: Boolean `false` is NOT empty - it's a valid answer.
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (value === '') return true;
  if (Array.isArray(value) && value.length === 0) return true;
  // CRITICAL: false is a valid answer (e.g., "No" to a yes/no question)
  if (typeof value === 'boolean') return false;
  // 0 is a valid number
  if (typeof value === 'number') return false;
  return false;
}

/**
 * Check if a dependsOn condition is met.
 */
export function isDependencyMet(
  condition: DependsOnCondition | undefined,
  facts: Record<string, unknown>
): boolean {
  if (!condition) return true;

  const targetId = condition.questionId || condition.fieldId;
  if (!targetId) return true;

  const actualValue = facts[targetId];

  // Check valueNotEqual
  if (condition.valueNotEqual !== undefined) {
    return actualValue !== condition.valueNotEqual;
  }

  // Check contains (for multiselect)
  if (condition.contains !== undefined) {
    if (Array.isArray(actualValue)) {
      return actualValue.some(v =>
        typeof v === 'string' && v.includes(condition.contains!)
      );
    }
    if (typeof actualValue === 'string') {
      return actualValue.includes(condition.contains);
    }
    return false;
  }

  // Check exact value match
  if (condition.value !== undefined) {
    // Handle array expected values
    if (Array.isArray(condition.value)) {
      if (Array.isArray(actualValue)) {
        return actualValue.some(v => condition.value.includes(v));
      }
      return condition.value.includes(actualValue);
    }
    // Handle array actual values
    if (Array.isArray(actualValue)) {
      return actualValue.includes(condition.value);
    }
    return actualValue === condition.value;
  }

  return true;
}

/**
 * Parse a date string to components.
 */
function parseDate(dateStr: string): { day: number; month: number; year: number } | null {
  // Try ISO format first (yyyy-mm-dd)
  const isoMatch = dateStr.match(UK_PATTERNS.DATE_ISO);
  if (isoMatch) {
    return {
      year: parseInt(isoMatch[1], 10),
      month: parseInt(isoMatch[2], 10),
      day: parseInt(isoMatch[3], 10),
    };
  }

  // Try UK format (dd/mm/yyyy)
  const ukMatch = dateStr.match(UK_PATTERNS.DATE_UK);
  if (ukMatch) {
    return {
      day: parseInt(ukMatch[1], 10),
      month: parseInt(ukMatch[2], 10),
      year: parseInt(ukMatch[3], 10),
    };
  }

  return null;
}

/**
 * Validate a date string.
 */
function isValidDate(dateStr: string): boolean {
  const parsed = parseDate(dateStr);
  if (!parsed) return false;

  const { day, month, year } = parsed;

  // Basic bounds check
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  if (year < 1900 || year > 2100) return false;

  // Create date and check if it's valid
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

// ============================================================================
// FIELD VALIDATION
// ============================================================================

/**
 * Validate a single field value against its rules.
 */
export function validateField(
  fieldId: string,
  value: unknown,
  validation: ValidationRule | undefined,
  fieldLabel?: string,
  inputType?: string
): FieldValidationError[] {
  const errors: FieldValidationError[] = [];
  const label = fieldLabel || fieldId;

  // Required check
  if (validation?.required && isEmpty(value)) {
    errors.push({
      field: fieldId,
      message: `${label} is required`,
      severity: 'error',
    });
    // Don't validate further if empty
    return errors;
  }

  // Skip further validation if empty (and not required)
  if (isEmpty(value)) return errors;

  const stringValue = String(value);

  // Pattern validation
  if (validation?.pattern) {
    try {
      const regex = new RegExp(validation.pattern);
      if (!regex.test(stringValue)) {
        errors.push({
          field: fieldId,
          message: `${label} is not in the correct format`,
          severity: 'error',
        });
      }
    } catch (e) {
      console.warn(`Invalid regex pattern for field ${fieldId}:`, validation.pattern);
    }
  }

  // Known input type patterns (built-in validation)
  if (inputType === 'email' && value) {
    if (!UK_PATTERNS.EMAIL.test(stringValue)) {
      errors.push({
        field: fieldId,
        message: 'Please enter a valid email address',
        severity: 'error',
      });
    }
  }

  // Postcode validation for address fields
  if (fieldId.toLowerCase().includes('postcode') && value) {
    if (!UK_PATTERNS.POSTCODE.test(stringValue.replace(/\s+/g, ''))) {
      errors.push({
        field: fieldId,
        message: 'Please enter a valid UK postcode (e.g., LS28 7PW)',
        severity: 'error',
      });
    }
  }

  // Date validation
  if (inputType === 'date' && stringValue) {
    if (!isValidDate(stringValue)) {
      errors.push({
        field: fieldId,
        message: 'Please enter a valid date',
        severity: 'error',
      });
    }
  }

  // Number/currency validation
  if ((inputType === 'number' || inputType === 'currency') && value !== '') {
    const numValue = typeof value === 'number' ? value : parseFloat(stringValue);

    if (isNaN(numValue)) {
      errors.push({
        field: fieldId,
        message: `${label} must be a number`,
        severity: 'error',
      });
    } else {
      // Min check
      if (validation?.min !== undefined && numValue < validation.min) {
        errors.push({
          field: fieldId,
          message: `${label} must be at least ${validation.min}`,
          severity: 'error',
        });
      }
      // Max check
      if (validation?.max !== undefined && numValue > validation.max) {
        errors.push({
          field: fieldId,
          message: `${label} must be at most ${validation.max}`,
          severity: 'error',
        });
      }
    }
  }

  // String length validation
  if (typeof value === 'string') {
    if (validation?.minLength !== undefined && value.length < validation.minLength) {
      errors.push({
        field: fieldId,
        message: `${label} must be at least ${validation.minLength} characters`,
        severity: 'error',
      });
    }
    if (validation?.maxLength !== undefined && value.length > validation.maxLength) {
      errors.push({
        field: fieldId,
        message: `${label} must be at most ${validation.maxLength} characters`,
        severity: 'error',
      });
    }
  }

  // AssertValue validation (for Section 21 compliance)
  if (validation?.assertValue !== undefined) {
    const expectedValue = validation.assertValue === 'true'
      ? true
      : validation.assertValue === 'false'
        ? false
        : validation.assertValue;

    if (value !== expectedValue) {
      errors.push({
        field: fieldId,
        message: validation.assertMessage || `${label} must be ${expectedValue}`,
        severity: 'error',
      });
    }
  }

  return errors;
}

/**
 * Validate a group of fields.
 */
export function validateGroupFields(
  fields: MQSField[],
  values: Record<string, unknown>,
  allFacts: Record<string, unknown>
): FieldValidationError[] {
  const errors: FieldValidationError[] = [];

  for (const field of fields) {
    // Check if field's dependency is met
    if (!isDependencyMet(field.dependsOn, allFacts)) {
      continue;
    }

    const fieldErrors = validateField(
      field.id,
      values[field.id],
      field.validation,
      field.label,
      field.inputType
    );
    errors.push(...fieldErrors);
  }

  return errors;
}

/**
 * Validate an entire MQS question (including group fields).
 */
export function validateQuestion(
  question: MQSQuestion,
  values: Record<string, unknown>,
  allFacts: Record<string, unknown>
): FieldValidationResult {
  // Check if question's dependency is met
  if (!isDependencyMet(question.dependsOn, allFacts)) {
    return { isValid: true, errors: [] };
  }

  const errors: FieldValidationError[] = [];

  // For grouped inputs, validate each field
  if (question.inputType === 'group' && question.fields) {
    errors.push(...validateGroupFields(question.fields, values, allFacts));
  } else {
    // For single inputs, validate the question value
    const fieldErrors = validateField(
      question.id,
      values[question.id],
      question.validation,
      undefined,
      question.inputType
    );
    errors.push(...fieldErrors);
  }

  return {
    isValid: errors.filter(e => e.severity === 'error').length === 0,
    errors,
  };
}

// ============================================================================
// DEPOSIT CAP VALIDATION (Tenant Fees Act 2019)
// ============================================================================

export interface DepositCapResult {
  maxDeposit: number;
  maxWeeks: 5 | 6;
  weeklyRent: number;
  exceeds: boolean;
  excessAmount?: number;
}

/**
 * Calculate deposit cap based on Tenant Fees Act 2019.
 * Max: 5 weeks rent (<£50k annual) or 6 weeks (>=£50k annual)
 */
export function calculateDepositCap(
  rentAmount: number | undefined,
  rentFrequency: string | undefined,
  depositAmount: number | undefined
): DepositCapResult | null {
  if (!rentAmount || depositAmount === undefined) return null;

  const freq = rentFrequency || 'monthly';
  let annualRent = rentAmount;

  switch (freq) {
    case 'weekly':
      annualRent = rentAmount * 52;
      break;
    case 'fortnightly':
      annualRent = rentAmount * 26;
      break;
    case 'monthly':
      annualRent = rentAmount * 12;
      break;
    case 'quarterly':
      annualRent = rentAmount * 4;
      break;
    case 'annually':
    case 'yearly':
      annualRent = rentAmount;
      break;
  }

  const weeklyRent = annualRent / 52;
  const maxWeeks: 5 | 6 = annualRent >= 50000 ? 6 : 5;
  const maxDeposit = weeklyRent * maxWeeks;
  const exceeds = depositAmount > maxDeposit;

  return {
    maxDeposit,
    maxWeeks,
    weeklyRent,
    exceeds,
    excessAmount: exceeds ? depositAmount - maxDeposit : undefined,
  };
}

/**
 * Validate deposit amount against cap.
 */
export function validateDepositCap(
  depositAmount: number | undefined,
  rentAmount: number | undefined,
  rentFrequency: string | undefined
): FieldValidationError | null {
  const cap = calculateDepositCap(rentAmount, rentFrequency, depositAmount);

  if (cap?.exceeds) {
    return {
      field: 'deposit_amount',
      message: `Deposit exceeds the legal cap of £${cap.maxDeposit.toFixed(2)} (${cap.maxWeeks} weeks rent). ` +
               `Excess: £${cap.excessAmount?.toFixed(2)}. ` +
               `Section 21 may be invalid until excess is refunded.`,
      severity: 'error',
    };
  }

  return null;
}

// ============================================================================
// SECTION 21 SPECIFIC VALIDATORS
// ============================================================================

/**
 * Validate Section 21 compliance fields as a group.
 */
export function validateSection21Compliance(
  facts: Record<string, unknown>
): FieldValidationError[] {
  const errors: FieldValidationError[] = [];

  // If deposit taken, check compliance
  if (facts.deposit_taken === true) {
    if (facts.deposit_protected === false) {
      errors.push({
        field: 'deposit_protected',
        message: 'Section 21 cannot be used if deposit is not protected.',
        severity: 'error',
      });
    }

    if (facts.prescribed_info_served === false) {
      errors.push({
        field: 'prescribed_info_served',
        message: 'Section 21 cannot be used if prescribed information was not served within 30 days.',
        severity: 'error',
      });
    }

    // Deposit cap validation
    const depositCap = validateDepositCap(
      facts.deposit_amount as number,
      facts.rent_amount as number,
      facts.rent_frequency as string
    );
    if (depositCap) {
      errors.push(depositCap);
    }
  }

  // EPC compliance
  if (facts.epc_served === false) {
    errors.push({
      field: 'epc_served',
      message: 'Section 21 cannot be used if EPC was not provided.',
      severity: 'error',
    });
  }

  // How to Rent compliance
  if (facts.how_to_rent_served === false) {
    errors.push({
      field: 'how_to_rent_served',
      message: "Section 21 cannot be used if 'How to Rent' guide was not provided.",
      severity: 'error',
    });
  }

  // Gas safety (conditional on gas appliances)
  if (facts.has_gas_appliances === true && facts.gas_safety_cert_served === false) {
    errors.push({
      field: 'gas_safety_cert_served',
      message: 'Section 21 cannot be used if gas safety certificate was not provided.',
      severity: 'error',
    });
  }

  // Licensing compliance
  if (facts.licensing_required && facts.licensing_required !== 'not_required') {
    if (facts.has_valid_licence === false) {
      errors.push({
        field: 'has_valid_licence',
        message: 'Section 21 cannot be used if property requires a licence but is unlicensed.',
        severity: 'error',
      });
    }
  }

  return errors;
}

// ============================================================================
// HOOK FOR REACT COMPONENTS
// ============================================================================

/**
 * Create a validation state manager for a form.
 * Returns functions to validate on change/blur and check overall validity.
 */
export function createFieldValidator(
  fields: MQSField[],
  allFacts: Record<string, unknown>
) {
  const errors = new Map<string, FieldValidationError[]>();

  return {
    /**
     * Validate a single field and update error state.
     */
    validateFieldOnChange(fieldId: string, value: unknown): FieldValidationError[] {
      const field = fields.find(f => f.id === fieldId);
      if (!field) return [];

      // Check dependency
      if (!isDependencyMet(field.dependsOn, allFacts)) {
        errors.delete(fieldId);
        return [];
      }

      const fieldErrors = validateField(
        field.id,
        value,
        field.validation,
        field.label,
        field.inputType
      );

      if (fieldErrors.length > 0) {
        errors.set(fieldId, fieldErrors);
      } else {
        errors.delete(fieldId);
      }

      return fieldErrors;
    },

    /**
     * Validate all fields.
     */
    validateAll(values: Record<string, unknown>): FieldValidationError[] {
      const allErrors: FieldValidationError[] = [];

      for (const field of fields) {
        if (!isDependencyMet(field.dependsOn, allFacts)) continue;

        const fieldErrors = validateField(
          field.id,
          values[field.id],
          field.validation,
          field.label,
          field.inputType
        );

        if (fieldErrors.length > 0) {
          errors.set(field.id, fieldErrors);
          allErrors.push(...fieldErrors);
        } else {
          errors.delete(field.id);
        }
      }

      return allErrors;
    },

    /**
     * Get errors for a specific field.
     */
    getFieldErrors(fieldId: string): FieldValidationError[] {
      return errors.get(fieldId) || [];
    },

    /**
     * Check if any field has errors.
     */
    hasErrors(): boolean {
      return errors.size > 0;
    },

    /**
     * Get all current errors.
     */
    getAllErrors(): FieldValidationError[] {
      return Array.from(errors.values()).flat();
    },

    /**
     * Clear errors for a field.
     */
    clearFieldErrors(fieldId: string): void {
      errors.delete(fieldId);
    },

    /**
     * Clear all errors.
     */
    clearAll(): void {
      errors.clear();
    },
  };
}
