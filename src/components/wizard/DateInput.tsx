/**
 * Date Input
 *
 * Date picker with quick options and approximate toggle
 */

import React, { useState } from 'react';
import { clsx } from 'clsx';

export interface DateInputProps {
  value?: string; // DD/MM/YYYY format
  onChange: (value: string) => void;
  allowApproximate?: boolean;
  allowFuture?: boolean;
  allowPast?: boolean;
  helperText?: string;
  disabled?: boolean;
}

export const DateInput: React.FC<DateInputProps> = ({
  value,
  onChange,
  allowApproximate = false,
  allowFuture = false,
  allowPast = true,
  helperText,
  disabled = false,
}) => {
  const [isApproximate, setIsApproximate] = useState(false);

  const formatDate = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleQuickDate = (monthsAgo: number) => {
    const date = new Date();
    date.setMonth(date.getMonth() - monthsAgo);
    onChange(formatDate(date));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // HTML input type="date" gives YYYY-MM-DD, convert to DD/MM/YYYY
    const [year, month, day] = e.target.value.split('-');
    onChange(`${day}/${month}/${year}`);
  };

  const convertToHTMLDate = (ddmmyyyy: string): string => {
    if (!ddmmyyyy) return '';
    const [day, month, year] = ddmmyyyy.split('/');
    return `${year}-${month}-${day}`;
  };

  const quickOptions = [
    { label: 'This month', months: 0 },
    { label: '3 months ago', months: 3 },
    { label: '6 months ago', months: 6 },
    { label: '1 year ago', months: 12 },
  ];

  return (
    <div className="space-y-4">
      <div>
        <input
          type="date"
          value={convertToHTMLDate(value || '')}
          onChange={handleInputChange}
          disabled={disabled || isApproximate}
          className={clsx(
            'w-full px-4 py-3 rounded-lg border-2 text-lg',
            'min-h-touch',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:border-primary',
            'transition-all duration-200',
            disabled || isApproximate
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-charcoal'
          )}
        />
      </div>

      {allowPast && !isApproximate && (
        <div>
          <p className="text-sm text-gray-700 mb-2">Quick options:</p>
          <div className="flex flex-wrap gap-2">
            {quickOptions.map((option) => (
              <button
                key={option.label}
                type="button"
                onClick={() => handleQuickDate(option.months)}
                disabled={disabled}
                className={clsx(
                  'px-3 py-2 rounded-md border text-sm font-medium',
                  'transition-all duration-200',
                  'hover:bg-primary-subtle hover:border-primary',
                  disabled && 'opacity-50 cursor-not-allowed'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {allowApproximate && (
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isApproximate}
            onChange={() => setIsApproximate(!isApproximate)}
            className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <span className="text-sm text-gray-700">
            I don't know the exact date (approximate is OK)
          </span>
        </label>
      )}

      {helperText && !isApproximate && (
        <p className="text-sm text-gray-600">{helperText}</p>
      )}
    </div>
  );
};
