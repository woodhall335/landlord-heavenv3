/**
 * Currency Input
 *
 * GBP currency input with auto-formatting and validation
 */

import React, { useState } from 'react';
import { clsx } from 'clsx';

export interface CurrencyInputProps {
  value?: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  placeholder?: string;
  helperText?: string;
  allowUnsure?: boolean;
  disabled?: boolean;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  value,
  onChange,
  min = 0,
  max,
  placeholder = '0.00',
  helperText,
  allowUnsure = false,
  disabled = false,
}) => {
  const [isUnsure, setIsUnsure] = useState(false);
  const [inputValue, setInputValue] = useState(value?.toFixed(2) || '');

  const formatCurrency = (val: string): string => {
    // Remove non-numeric characters except decimal point
    const cleaned = val.replace(/[^\d.]/g, '');

    // Ensure only one decimal point
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }

    // Limit to 2 decimal places
    if (parts[1] && parts[1].length > 2) {
      return parts[0] + '.' + parts[1].substring(0, 2);
    }

    return cleaned;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrency(e.target.value);
    setInputValue(formatted);

    const numValue = parseFloat(formatted);
    if (!isNaN(numValue)) {
      onChange(numValue);
    }
  };

  const handleUnsureToggle = () => {
    const newUnsure = !isUnsure;
    setIsUnsure(newUnsure);

    if (newUnsure) {
      setInputValue('');
      onChange(0);
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-medium text-gray-600">
          £
        </span>
        <input
          type="text"
          inputMode="decimal"
          value={inputValue}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled || isUnsure}
          className={clsx(
            'w-full pl-10 pr-4 py-3 rounded-lg border-2 text-lg',
            'min-h-touch',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:border-primary',
            'transition-all duration-200',
            disabled || isUnsure
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-charcoal',
            'placeholder-gray-400'
          )}
        />
      </div>

      {allowUnsure && (
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isUnsure}
            onChange={handleUnsureToggle}
            className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <span className="text-sm text-gray-700">
            I'm not sure of the exact amount (we'll estimate)
          </span>
        </label>
      )}

      {helperText && !isUnsure && (
        <p className="text-sm text-gray-600">{helperText}</p>
      )}

      {(min !== undefined || max !== undefined) && !isUnsure && (
        <p className="text-xs text-gray-500">
          {min !== undefined && max !== undefined
            ? `Amount should be between £${min.toFixed(2)} and £${max.toFixed(2)}`
            : min !== undefined
            ? `Minimum amount: £${min.toFixed(2)}`
            : `Maximum amount: £${max?.toFixed(2)}`}
        </p>
      )}
    </div>
  );
};
