/**
 * Multiple Choice Input
 *
 * Big button selection for categorical choices
 * Auto-advances on selection (no "Next" button needed)
 */

import React from 'react';
import { clsx } from 'clsx';
import { RiCheckLine } from 'react-icons/ri';

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
              <span className="text-3xl shrink-0">{option.icon}</span>
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
              <div className="shrink-0">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <RiCheckLine className="w-4 h-4 text-white" />
                </div>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};
