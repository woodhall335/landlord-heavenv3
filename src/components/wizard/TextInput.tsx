/**
 * Text Input
 *
 * Simple text input with validation and optional multi-field support
 */

import React from 'react';
import { clsx } from 'clsx';
import { RiErrorWarningLine } from 'react-icons/ri';

export interface TextInputProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  maxLength?: number;
  autoCapitalize?: boolean;
  disabled?: boolean;
  multiline?: boolean;
  rows?: number;
}

export const TextInput: React.FC<TextInputProps> = ({
  value = '',
  onChange,
  placeholder,
  helperText,
  error,
  required = false,
  maxLength,
  autoCapitalize = true,
  disabled = false,
  multiline = false,
  rows = 3,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    let newValue = e.target.value;

    // Auto-capitalize first letter of each word
    if (autoCapitalize && !multiline) {
      newValue = newValue
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }

    onChange(newValue);
  };

  const baseClasses = clsx(
    'w-full px-4 py-3 rounded-lg border-2 text-base',
    'min-h-touch',
    'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1',
    'transition-all duration-200',
    error
      ? 'border-error focus:border-error focus:ring-error'
      : 'border-gray-300 focus:border-primary',
    disabled
      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
      : 'bg-white text-charcoal',
    'placeholder-gray-400'
  );

  return (
    <div className="space-y-2">
      {multiline ? (
        <textarea
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          maxLength={maxLength}
          disabled={disabled}
          rows={rows}
          className={baseClasses}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          maxLength={maxLength}
          disabled={disabled}
          className={baseClasses}
        />
      )}

      {error && (
        <p className="text-sm text-error flex items-center gap-1">
          <RiErrorWarningLine className="w-4 h-4 text-[#7C3AED]" />
          {error}
        </p>
      )}

      {helperText && !error && (
        <p className="text-sm text-gray-600">{helperText}</p>
      )}

      {maxLength && (
        <p className="text-xs text-gray-500 text-right">
          {value.length} / {maxLength} characters
        </p>
      )}
    </div>
  );
};
