/**
 * Multiple Choice Input
 *
 * Big button selection for categorical choices
 * Auto-advances on selection (no "Next" button needed)
 */

import React from 'react';
import { clsx } from 'clsx';

export interface MultipleChoiceOption {
  value: string;
  label: string;
  icon?: string; // Emoji or icon
  description?: string;
}

export interface MultipleChoiceProps {
  options: MultipleChoiceOption[];
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const MultipleChoice: React.FC<MultipleChoiceProps> = ({
  options,
  value,
  onChange,
  disabled = false,
}) => {
  return (
    <div className="space-y-3">
      {options.map((option) => {
        const isSelected = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => !disabled && onChange(option.value)}
            disabled={disabled}
            className={clsx(
              'w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-all duration-200',
              'min-h-touch text-left',
              isSelected
                ? 'border-primary bg-primary-subtle shadow-md'
                : 'border-gray-300 bg-white hover:border-primary hover:shadow-sm',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {option.icon && (
              <span className="text-3xl flex-shrink-0">{option.icon}</span>
            )}
            <div className="flex-1">
              <div className={clsx(
                'font-medium text-base',
                isSelected ? 'text-primary-dark' : 'text-charcoal'
              )}>
                {option.label}
              </div>
              {option.description && (
                <div className="text-sm text-gray-600 mt-1">
                  {option.description}
                </div>
              )}
            </div>
            {isSelected && (
              <div className="flex-shrink-0">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};
