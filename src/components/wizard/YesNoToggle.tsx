/**
 * Yes/No/Unsure Toggle
 *
 * Radio button group for binary or ternary choices
 * Supports conditional follow-up questions
 */

import React from 'react';
import { clsx } from 'clsx';

export type YesNoValue = 'yes' | 'no' | 'unsure';

export interface YesNoToggleProps {
  value?: YesNoValue;
  onChange: (value: YesNoValue) => void;
  showUnsure?: boolean;
  helperText?: string;
  warningText?: string; // Shown when specific value selected
  warningValue?: YesNoValue; // Which value triggers warning
  disabled?: boolean;
}

export const YesNoToggle: React.FC<YesNoToggleProps> = ({
  value,
  onChange,
  showUnsure = true,
  helperText,
  warningText,
  warningValue,
  disabled = false,
}) => {
  const options: { value: YesNoValue; label: string }[] = [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' },
  ];

  if (showUnsure) {
    options.push({ value: 'unsure', label: 'Not sure' });
  }

  const showWarning = warningText && warningValue && value === warningValue;

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        {options.map((option) => {
          const isSelected = value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => !disabled && onChange(option.value)}
              disabled={disabled}
              className={clsx(
                'flex-1 px-6 py-3 rounded-lg border-2 font-medium text-base',
                'min-h-touch',
                'transition-all duration-200',
                isSelected
                  ? 'border-primary bg-primary text-white shadow-md'
                  : 'border-gray-300 bg-white text-charcoal hover:border-primary hover:shadow-sm',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {helperText && (
        <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex-shrink-0 mt-0.5">
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-sm text-blue-900">{helperText}</p>
        </div>
      )}

      {showWarning && (
        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex-shrink-0 mt-0.5">
            <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-sm text-amber-900">{warningText}</p>
        </div>
      )}
    </div>
  );
};
