/**
 * Wizard Validation Context
 *
 * Provides a shared validation state across wizard sections.
 * Each section can register its validation errors, and the flow
 * can check overall validity to control navigation.
 *
 * Usage:
 * ```tsx
 * // In EvictionSectionFlow:
 * <ValidationProvider>
 *   <SectionComponent />
 *   <NextButton disabled={!isValid} />
 * </ValidationProvider>
 *
 * // In section components:
 * const { setFieldError, clearFieldError, hasErrors } = useValidationContext();
 * ```
 */

'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';

// ============================================================================
// TYPES
// ============================================================================

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
  section?: string;
}

interface ValidationContextValue {
  /** All current validation errors */
  errors: Map<string, ValidationError>;

  /** Set an error for a field */
  setFieldError: (fieldId: string, error: ValidationError) => void;

  /** Clear error for a field */
  clearFieldError: (fieldId: string) => void;

  /** Clear all errors for a section */
  clearSectionErrors: (sectionId: string) => void;

  /** Clear all errors */
  clearAllErrors: () => void;

  /** Check if there are any blocking errors */
  hasErrors: boolean;

  /** Check if a specific field has an error */
  hasFieldError: (fieldId: string) => boolean;

  /** Get error message for a field */
  getFieldError: (fieldId: string) => string | undefined;

  /** Get all errors for a section */
  getSectionErrors: (sectionId: string) => ValidationError[];

  /** Whether uploads are in progress (blocks Next) */
  uploadsInProgress: boolean;

  /** Set uploads in progress state */
  setUploadsInProgress: (inProgress: boolean) => void;
}

// ============================================================================
// CONTEXT
// ============================================================================

const ValidationContext = createContext<ValidationContextValue | null>(null);

// ============================================================================
// PROVIDER
// ============================================================================

interface ValidationProviderProps {
  children: ReactNode;
}

export const ValidationProvider: React.FC<ValidationProviderProps> = ({ children }) => {
  const [errors, setErrors] = useState<Map<string, ValidationError>>(new Map());
  const [uploadsInProgress, setUploadsInProgress] = useState(false);

  const setFieldError = useCallback((fieldId: string, error: ValidationError) => {
    setErrors((prev) => {
      const next = new Map(prev);
      next.set(fieldId, error);
      return next;
    });
  }, []);

  const clearFieldError = useCallback((fieldId: string) => {
    setErrors((prev) => {
      const next = new Map(prev);
      next.delete(fieldId);
      return next;
    });
  }, []);

  const clearSectionErrors = useCallback((sectionId: string) => {
    setErrors((prev) => {
      const next = new Map(prev);
      for (const [key, error] of next) {
        if (error.section === sectionId) {
          next.delete(key);
        }
      }
      return next;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors(new Map());
  }, []);

  const hasErrors = useMemo(
    () => Array.from(errors.values()).some((e) => e.severity === 'error'),
    [errors]
  );

  const hasFieldError = useCallback(
    (fieldId: string) => errors.has(fieldId) && errors.get(fieldId)?.severity === 'error',
    [errors]
  );

  const getFieldError = useCallback(
    (fieldId: string) => errors.get(fieldId)?.message,
    [errors]
  );

  const getSectionErrors = useCallback(
    (sectionId: string) =>
      Array.from(errors.values()).filter((e) => e.section === sectionId),
    [errors]
  );

  const value: ValidationContextValue = {
    errors,
    setFieldError,
    clearFieldError,
    clearSectionErrors,
    clearAllErrors,
    hasErrors,
    hasFieldError,
    getFieldError,
    getSectionErrors,
    uploadsInProgress,
    setUploadsInProgress,
  };

  return (
    <ValidationContext.Provider value={value}>
      {children}
    </ValidationContext.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

export function useValidationContext(): ValidationContextValue {
  const context = useContext(ValidationContext);
  if (!context) {
    throw new Error('useValidationContext must be used within a ValidationProvider');
  }
  return context;
}

/**
 * Safe version of useValidationContext that returns null if not in provider.
 * Useful for components that may be used outside the validation context.
 */
export function useValidationContextSafe(): ValidationContextValue | null {
  return useContext(ValidationContext);
}

// ============================================================================
// UTILITY: FIELD VALIDATION WRAPPER
// ============================================================================

/**
 * Higher-order component that wraps a field with validation state.
 * Automatically registers/clears errors with the validation context.
 */
export interface WithValidationProps {
  fieldId: string;
  sectionId: string;
  validateFn: (value: unknown) => string | undefined;
}

/**
 * Hook for integrating a field with the validation context.
 */
export function useFieldValidation(
  fieldId: string,
  sectionId: string
) {
  const ctx = useValidationContextSafe();

  const reportError = useCallback(
    (message: string) => {
      ctx?.setFieldError(fieldId, {
        field: fieldId,
        message,
        severity: 'error',
        section: sectionId,
      });
    },
    [ctx, fieldId, sectionId]
  );

  const clearError = useCallback(() => {
    ctx?.clearFieldError(fieldId);
  }, [ctx, fieldId]);

  const error = ctx?.getFieldError(fieldId);

  return {
    error,
    reportError,
    clearError,
  };
}

export default ValidationContext;
