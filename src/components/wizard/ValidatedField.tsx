/**
 * ValidatedField - Input components with live validation
 *
 * These components provide real-time validation as users type,
 * with inline error messages displayed below the field.
 *
 * Usage:
 * ```tsx
 * <ValidatedInput
 *   id="postcode"
 *   label="Postcode"
 *   value={facts.postcode}
 *   onChange={(value) => onUpdate({ postcode: value })}
 *   validation={{ required: true }}
 *   error={getFieldError('postcode')}
 * />
 * ```
 */

'use client';

import React, { useCallback, useState, useEffect, useRef } from 'react';
import { validateField, type ValidationRule } from '@/lib/validation/mqs-field-validator';

// ============================================================================
// TYPES
// ============================================================================

interface BaseFieldProps {
  id: string;
  label: string;
  value: string | number | undefined;
  onChange: (value: string | number) => void;
  validation?: ValidationRule;
  helperText?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  /** External error message (overrides internal validation) */
  error?: string;
  /** Show validation on blur only (not while typing) */
  validateOnBlur?: boolean;
}

interface ValidatedInputProps extends BaseFieldProps {
  type?: 'text' | 'email' | 'tel' | 'number' | 'date';
  min?: number;
  max?: number;
  step?: string | number;
}

interface ValidatedSelectProps extends BaseFieldProps {
  options: Array<{ value: string; label: string }>;
}

interface ValidatedTextareaProps extends BaseFieldProps {
  rows?: number;
}

// ============================================================================
// COMMON STYLES
// ============================================================================

const INPUT_BASE_STYLES = `
  w-full rounded-md px-3 py-2 text-sm transition-colors
  focus:outline-none focus:ring-2
`;

const INPUT_NORMAL_STYLES = `
  border border-gray-300
  focus:border-[#7C3AED] focus:ring-[#7C3AED]/20
`;

const INPUT_ERROR_STYLES = `
  border border-red-500
  focus:border-red-500 focus:ring-red-500/20
`;

// ============================================================================
// VALIDATED INPUT
// ============================================================================

export const ValidatedInput: React.FC<ValidatedInputProps> = ({
  id,
  label,
  value,
  onChange,
  validation,
  helperText,
  placeholder,
  disabled = false,
  required = false,
  className = '',
  error: externalError,
  validateOnBlur = false,
  type = 'text',
  min,
  max,
  step,
}) => {
  const [internalError, setInternalError] = useState<string | undefined>();
  const [touched, setTouched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const error = externalError || (touched ? internalError : undefined);
  const isRequired = required || validation?.required;

  // Validate on change
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = type === 'number' ? parseFloat(e.target.value) || '' : e.target.value;
      onChange(newValue as string | number);

      if (!validateOnBlur) {
        const errors = validateField(id, newValue, validation, label, type);
        setInternalError(errors[0]?.message);
      }
    },
    [id, onChange, validation, label, type, validateOnBlur]
  );

  // Validate on blur
  const handleBlur = useCallback(() => {
    setTouched(true);
    const errors = validateField(id, value, validation, label, type);
    setInternalError(errors[0]?.message);
  }, [id, value, validation, label, type]);

  // Clear error when value becomes valid
  useEffect(() => {
    if (!touched) return;
    const errors = validateField(id, value, validation, label, type);
    setInternalError(errors[0]?.message);
  }, [value, id, validation, label, type, touched]);

  return (
    <div className={`space-y-1 ${className}`}>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
        {isRequired && <span className="text-red-500 ml-1">*</span>}
      </label>

      <input
        ref={inputRef}
        id={id}
        name={id}
        type={type}
        value={value ?? ''}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        className={`
          ${INPUT_BASE_STYLES}
          ${error ? INPUT_ERROR_STYLES : INPUT_NORMAL_STYLES}
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
        `}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : helperText ? `${id}-help` : undefined}
      />

      {error && (
        <p id={`${id}-error`} className="text-sm text-red-600 flex items-start gap-1">
          <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}

      {!error && helperText && (
        <p id={`${id}-help`} className="text-xs text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
};

// ============================================================================
// VALIDATED SELECT
// ============================================================================

export const ValidatedSelect: React.FC<ValidatedSelectProps> = ({
  id,
  label,
  value,
  onChange,
  validation,
  helperText,
  disabled = false,
  required = false,
  className = '',
  error: externalError,
  options,
}) => {
  const [internalError, setInternalError] = useState<string | undefined>();
  const [touched, setTouched] = useState(false);

  const error = externalError || (touched ? internalError : undefined);
  const isRequired = required || validation?.required;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newValue = e.target.value;
      onChange(newValue);

      const errors = validateField(id, newValue, validation, label, 'select');
      setInternalError(errors[0]?.message);
    },
    [id, onChange, validation, label]
  );

  const handleBlur = useCallback(() => {
    setTouched(true);
    const errors = validateField(id, value, validation, label, 'select');
    setInternalError(errors[0]?.message);
  }, [id, value, validation, label]);

  return (
    <div className={`space-y-1 ${className}`}>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
        {isRequired && <span className="text-red-500 ml-1">*</span>}
      </label>

      <select
        id={id}
        name={id}
        value={value ?? ''}
        onChange={handleChange}
        onBlur={handleBlur}
        disabled={disabled}
        className={`
          ${INPUT_BASE_STYLES}
          ${error ? INPUT_ERROR_STYLES : INPUT_NORMAL_STYLES}
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
        `}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : helperText ? `${id}-help` : undefined}
      >
        <option value="">Select...</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {error && (
        <p id={`${id}-error`} className="text-sm text-red-600 flex items-start gap-1">
          <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}

      {!error && helperText && (
        <p id={`${id}-help`} className="text-xs text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
};

// ============================================================================
// VALIDATED TEXTAREA
// ============================================================================

export const ValidatedTextarea: React.FC<ValidatedTextareaProps> = ({
  id,
  label,
  value,
  onChange,
  validation,
  helperText,
  placeholder,
  disabled = false,
  required = false,
  className = '',
  error: externalError,
  validateOnBlur = false,
  rows = 4,
}) => {
  const [internalError, setInternalError] = useState<string | undefined>();
  const [touched, setTouched] = useState(false);

  const error = externalError || (touched ? internalError : undefined);
  const isRequired = required || validation?.required;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      onChange(newValue);

      if (!validateOnBlur) {
        const errors = validateField(id, newValue, validation, label, 'textarea');
        setInternalError(errors[0]?.message);
      }
    },
    [id, onChange, validation, label, validateOnBlur]
  );

  const handleBlur = useCallback(() => {
    setTouched(true);
    const errors = validateField(id, value, validation, label, 'textarea');
    setInternalError(errors[0]?.message);
  }, [id, value, validation, label]);

  return (
    <div className={`space-y-1 ${className}`}>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
        {isRequired && <span className="text-red-500 ml-1">*</span>}
      </label>

      <textarea
        id={id}
        name={id}
        value={value ?? ''}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        className={`
          ${INPUT_BASE_STYLES}
          ${error ? INPUT_ERROR_STYLES : INPUT_NORMAL_STYLES}
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
        `}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : helperText ? `${id}-help` : undefined}
      />

      {error && (
        <p id={`${id}-error`} className="text-sm text-red-600 flex items-start gap-1">
          <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}

      {!error && helperText && (
        <p id={`${id}-help`} className="text-xs text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
};

// ============================================================================
// VALIDATED CURRENCY INPUT
// ============================================================================

interface ValidatedCurrencyInputProps extends BaseFieldProps {
  min?: number;
  max?: number;
  /** Callback when value changes - provides the numeric value */
  onValueChange?: (value: number | undefined) => void;
}

export const ValidatedCurrencyInput: React.FC<ValidatedCurrencyInputProps> = ({
  id,
  label,
  value,
  onChange,
  onValueChange,
  validation,
  helperText,
  placeholder,
  disabled = false,
  required = false,
  className = '',
  error: externalError,
  min,
  max,
}) => {
  const [internalError, setInternalError] = useState<string | undefined>();
  const [touched, setTouched] = useState(false);

  const error = externalError || (touched ? internalError : undefined);
  const isRequired = required || validation?.required;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      const numValue = rawValue === '' ? undefined : parseFloat(rawValue);

      onChange(rawValue);
      if (onValueChange) {
        onValueChange(numValue);
      }

      const errors = validateField(id, numValue, validation, label, 'currency');
      setInternalError(errors[0]?.message);
    },
    [id, onChange, onValueChange, validation, label]
  );

  const handleBlur = useCallback(() => {
    setTouched(true);
    const numValue = value === '' || value === undefined ? undefined : typeof value === 'number' ? value : parseFloat(String(value));
    const errors = validateField(id, numValue, validation, label, 'currency');
    setInternalError(errors[0]?.message);
  }, [id, value, validation, label]);

  return (
    <div className={`space-y-1 ${className}`}>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
        {isRequired && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
          £
        </span>
        <input
          id={id}
          name={id}
          type="number"
          value={value ?? ''}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          min={min}
          max={max}
          step="0.01"
          className={`
            ${INPUT_BASE_STYLES}
            pl-7
            ${error ? INPUT_ERROR_STYLES : INPUT_NORMAL_STYLES}
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
          `}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : helperText ? `${id}-help` : undefined}
        />
      </div>

      {error && (
        <p id={`${id}-error`} className="text-sm text-red-600 flex items-start gap-1">
          <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}

      {!error && helperText && (
        <p id={`${id}-help`} className="text-xs text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
};

// ============================================================================
// VALIDATED YES/NO TOGGLE
// ============================================================================

interface ValidatedYesNoToggleProps {
  id: string;
  label: string;
  value: boolean | undefined;
  onChange: (value: boolean) => void;
  required?: boolean;
  helperText?: string;
  /** Error message to show when value is false (for Section 21 blockers) */
  blockingMessage?: string;
  disabled?: boolean;
  className?: string;
}

export const ValidatedYesNoToggle: React.FC<ValidatedYesNoToggleProps> = ({
  id,
  label,
  value,
  onChange,
  required = false,
  helperText,
  blockingMessage,
  disabled = false,
  className = '',
}) => {
  const [touched, setTouched] = useState(false);
  const showBlockingMessage = touched && value === false && blockingMessage;

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="flex items-center gap-4">
        <label
          className={`
            flex items-center px-4 py-2 border rounded-md cursor-pointer transition-all
            ${value === true ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input
            type="radio"
            name={id}
            checked={value === true}
            onChange={() => {
              setTouched(true);
              onChange(true);
            }}
            disabled={disabled}
            className="mr-2"
          />
          <span className="text-sm">Yes</span>
        </label>

        <label
          className={`
            flex items-center px-4 py-2 border rounded-md cursor-pointer transition-all
            ${value === false ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input
            type="radio"
            name={id}
            checked={value === false}
            onChange={() => {
              setTouched(true);
              onChange(false);
            }}
            disabled={disabled}
            className="mr-2"
          />
          <span className="text-sm">No</span>
        </label>
      </div>

      {helperText && !showBlockingMessage && (
        <p className="text-xs text-gray-500">{helperText}</p>
      )}

      {showBlockingMessage && (
        <p className="text-sm text-red-600 font-medium flex items-start gap-1">
          <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {blockingMessage}
        </p>
      )}
    </div>
  );
};

// ============================================================================
// INLINE ERROR DISPLAY
// ============================================================================

interface InlineErrorProps {
  error?: string;
  className?: string;
}

export const InlineError: React.FC<InlineErrorProps> = ({ error, className = '' }) => {
  if (!error) return null;

  return (
    <p className={`text-sm text-red-600 flex items-start gap-1 ${className}`}>
      <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
      {error}
    </p>
  );
};

export default ValidatedInput;
