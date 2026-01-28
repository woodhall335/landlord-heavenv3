/**
 * useFieldValidation Hook
 *
 * React hook for live field validation in wizard forms.
 * Validates on change/blur and provides inline error state.
 *
 * Usage:
 * ```tsx
 * const { errors, validateField, validateAll, hasErrors, getFieldError } = useFieldValidation(facts);
 *
 * <input
 *   value={value}
 *   onChange={(e) => {
 *     onUpdate({ fieldId: e.target.value });
 *     validateField('fieldId', e.target.value, validation, 'Field Label', 'text');
 *   }}
 *   onBlur={() => validateField('fieldId', value, validation, 'Field Label', 'text')}
 * />
 * {getFieldError('fieldId') && <span className="error">{getFieldError('fieldId')}</span>}
 * ```
 */

import { useState, useCallback, useMemo } from 'react';
import {
  validateField,
  validateDepositCap,
  isDependencyMet,
  type ValidationRule,
  type DependsOnCondition,
  type FieldValidationError,
} from '@/lib/validation/mqs-field-validator';

export interface UseFieldValidationOptions {
  /** Enable immediate validation on first render */
  validateOnMount?: boolean;
  /** Debounce validation by this many ms */
  debounceMs?: number;
}

export interface UseFieldValidationReturn {
  /** Map of field ID to error messages */
  errors: Map<string, FieldValidationError[]>;
  /** Validate a single field */
  validateField: (
    fieldId: string,
    value: unknown,
    validation?: ValidationRule,
    label?: string,
    inputType?: string,
    dependsOn?: DependsOnCondition
  ) => FieldValidationError[];
  /** Validate all provided fields */
  validateAll: (
    fields: Array<{
      id: string;
      value: unknown;
      validation?: ValidationRule;
      label?: string;
      inputType?: string;
      dependsOn?: DependsOnCondition;
    }>
  ) => FieldValidationError[];
  /** Check if any field has errors */
  hasErrors: boolean;
  /** Get first error message for a field (convenience) */
  getFieldError: (fieldId: string) => string | undefined;
  /** Get all errors for a field */
  getFieldErrors: (fieldId: string) => FieldValidationError[];
  /** Clear errors for a specific field */
  clearFieldError: (fieldId: string) => void;
  /** Clear all errors */
  clearAllErrors: () => void;
  /** Validate deposit cap specifically */
  validateDepositAmount: (
    depositAmount: number | undefined,
    rentAmount: number | undefined,
    rentFrequency: string | undefined
  ) => FieldValidationError | null;
}

/**
 * Hook for managing field validation state in wizard forms.
 */
export function useFieldValidation(
  facts: Record<string, unknown>,
  _options?: UseFieldValidationOptions
): UseFieldValidationReturn {
  const [errors, setErrors] = useState<Map<string, FieldValidationError[]>>(new Map());

  /**
   * Validate a single field and update error state.
   */
  const validateFieldCallback = useCallback(
    (
      fieldId: string,
      value: unknown,
      validation?: ValidationRule,
      label?: string,
      inputType?: string,
      dependsOn?: DependsOnCondition
    ): FieldValidationError[] => {
      // Skip validation if dependency not met
      if (dependsOn && !isDependencyMet(dependsOn, facts)) {
        setErrors(prev => {
          const next = new Map(prev);
          next.delete(fieldId);
          return next;
        });
        return [];
      }

      const fieldErrors = validateField(
        fieldId,
        value,
        validation,
        label,
        inputType
      );

      setErrors(prev => {
        const next = new Map(prev);
        if (fieldErrors.length > 0) {
          next.set(fieldId, fieldErrors);
        } else {
          next.delete(fieldId);
        }
        return next;
      });

      return fieldErrors;
    },
    [facts]
  );

  /**
   * Validate multiple fields at once.
   */
  const validateAllCallback = useCallback(
    (
      fields: Array<{
        id: string;
        value: unknown;
        validation?: ValidationRule;
        label?: string;
        inputType?: string;
        dependsOn?: DependsOnCondition;
      }>
    ): FieldValidationError[] => {
      const allErrors: FieldValidationError[] = [];
      const newErrorMap = new Map<string, FieldValidationError[]>();

      for (const field of fields) {
        // Skip if dependency not met
        if (field.dependsOn && !isDependencyMet(field.dependsOn, facts)) {
          continue;
        }

        const fieldErrors = validateField(
          field.id,
          field.value,
          field.validation,
          field.label,
          field.inputType
        );

        if (fieldErrors.length > 0) {
          newErrorMap.set(field.id, fieldErrors);
          allErrors.push(...fieldErrors);
        }
      }

      setErrors(newErrorMap);
      return allErrors;
    },
    [facts]
  );

  /**
   * Get first error message for a field.
   */
  const getFieldError = useCallback(
    (fieldId: string): string | undefined => {
      const fieldErrors = errors.get(fieldId);
      return fieldErrors?.[0]?.message;
    },
    [errors]
  );

  /**
   * Get all errors for a field.
   */
  const getFieldErrors = useCallback(
    (fieldId: string): FieldValidationError[] => {
      return errors.get(fieldId) || [];
    },
    [errors]
  );

  /**
   * Clear errors for a specific field.
   */
  const clearFieldError = useCallback((fieldId: string) => {
    setErrors(prev => {
      const next = new Map(prev);
      next.delete(fieldId);
      return next;
    });
  }, []);

  /**
   * Clear all errors.
   */
  const clearAllErrors = useCallback(() => {
    setErrors(new Map());
  }, []);

  /**
   * Validate deposit amount against cap.
   */
  const validateDepositAmountCallback = useCallback(
    (
      depositAmount: number | undefined,
      rentAmount: number | undefined,
      rentFrequency: string | undefined
    ): FieldValidationError | null => {
      const error = validateDepositCap(depositAmount, rentAmount, rentFrequency);

      if (error) {
        setErrors(prev => {
          const next = new Map(prev);
          next.set('deposit_amount', [error]);
          return next;
        });
      } else {
        setErrors(prev => {
          const next = new Map(prev);
          // Only delete deposit cap error, not other deposit_amount errors
          const existing = next.get('deposit_amount');
          if (existing?.some(e => e.message.includes('legal cap'))) {
            next.delete('deposit_amount');
          }
          return next;
        });
      }

      return error;
    },
    []
  );

  /**
   * Computed: whether there are any errors.
   */
  const hasErrors = useMemo(() => errors.size > 0, [errors]);

  return {
    errors,
    validateField: validateFieldCallback,
    validateAll: validateAllCallback,
    hasErrors,
    getFieldError,
    getFieldErrors,
    clearFieldError,
    clearAllErrors,
    validateDepositAmount: validateDepositAmountCallback,
  };
}

export default useFieldValidation;
