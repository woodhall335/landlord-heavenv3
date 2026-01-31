/**
 * Yes/No/Unsure Toggle
 *
 * Radio button group for binary or ternary choices
 * Supports conditional follow-up questions
 */

import React from 'react';
import { clsx } from 'clsx';
import { RiInformationLine, RiAlertLine } from 'react-icons/ri';

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
          <div className="shrink-0 mt-0.5">
            <RiInformationLine className="w-5 h-5 text-[#7C3AED]" />
          </div>
          <p className="text-sm text-blue-900">{helperText}</p>
        </div>
      )}

      {showWarning && (
        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="shrink-0 mt-0.5">
            <RiAlertLine className="w-5 h-5 text-[#7C3AED]" />
          </div>
          <p className="text-sm text-amber-900">{warningText}</p>
        </div>
      )}
    </div>
  );
};
