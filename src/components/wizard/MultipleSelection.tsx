/**
 * Multiple Selection
 *
 * Checkbox group for selecting multiple options
 * Supports "None" option that disables all others
 */

import React from 'react';
import { clsx } from 'clsx';

export interface MultipleSelectionOption {
  value: string;
  label: string;
  description?: string;
}

export interface MultipleSelectionProps {
  options: MultipleSelectionOption[];
  value?: string[];
  onChange: (value: string[]) => void;
  noneOption?: string; // Value for "None" option
  minSelections?: number;
  maxSelections?: number;
  helperText?: string;
  disabled?: boolean;
}

export const MultipleSelection: React.FC<MultipleSelectionProps> = ({
  options,
  value = [],
  onChange,
  noneOption,
  minSelections,
  maxSelections,
  helperText,
  disabled = false,
}) => {
  const handleToggle = (optionValue: string) => {
    if (disabled) return;

    // If toggling "None" option
    if (noneOption && optionValue === noneOption) {
      onChange(value.includes(noneOption) ? [] : [noneOption]);
      return;
    }

    // If "None" is selected, clear it when selecting anything else
    const newValue = value.includes(noneOption) ? [] : [...value];

    // Toggle the option
    const index = newValue.indexOf(optionValue);
    if (index > -1) {
      newValue.splice(index, 1);
    } else {
      // Check max selections
      if (maxSelections && newValue.length >= maxSelections) {
        return; // Don't add if at max
      }
      newValue.push(optionValue);
    }

    onChange(newValue);
  };

  const isNoneSelected = noneOption && value.includes(noneOption);

  return (
    <div className="space-y-3">
      {options.map((option) => {
        const isChecked = value.includes(option.value);
        const isNone = noneOption === option.value;
        const isDisabledByNone = isNoneSelected && !isNone;

        return (
          <label
            key={option.value}
            className={clsx(
              'flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200',
              'min-h-touch',
              isChecked
                ? 'border-primary bg-primary-subtle'
                : 'border-gray-300 bg-white hover:border-primary hover:shadow-sm',
              (disabled || isDisabledByNone) && 'opacity-50 cursor-not-allowed'
            )}
          >
            <input
              type="checkbox"
              checked={isChecked}
              onChange={() => handleToggle(option.value)}
              disabled={disabled || isDisabledByNone}
              className="w-5 h-5 mt-0.5 rounded border-gray-300 text-primary focus:ring-primary flex-shrink-0"
            />
            <div className="flex-1">
              <div className={clsx(
                'font-medium text-base',
                isChecked ? 'text-primary-dark' : 'text-charcoal'
              )}>
                {option.label}
              </div>
              {option.description && (
                <div className="text-sm text-gray-600 mt-1">
                  {option.description}
                </div>
              )}
            </div>
          </label>
        );
      })}

      <div className="flex items-center justify-between text-sm text-gray-600">
        <div>
          {value.length > 0 && !isNoneSelected && (
            <span>{value.length} selected</span>
          )}
        </div>
        {helperText && <span>{helperText}</span>}
      </div>

      {minSelections !== undefined && value.length < minSelections && (
        <p className="text-sm text-amber-700">
          Please select at least {minSelections} option{minSelections !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
};
