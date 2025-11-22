/**
 * Scale Slider
 *
 * Visual scale/slider for severity, frequency, or rating inputs
 * Shows contextual examples at each level
 */

import React from 'react';
import { clsx } from 'clsx';

export interface ScaleLevel {
  value: number;
  label: string;
  examples?: string[];
}

export interface ScaleSliderProps {
  value?: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  levels?: ScaleLevel[]; // Pre-defined levels with labels/examples
  showValue?: boolean;
  helperText?: string;
  disabled?: boolean;
}

export const ScaleSlider: React.FC<ScaleSliderProps> = ({
  value,
  onChange,
  min,
  max,
  step = 1,
  levels,
  showValue = true,
  helperText,
  disabled = false,
}) => {
  // Find the current level based on value
  const currentLevel = levels?.find((level) => level.value === value);

  // Default labels if levels not provided
  const getDefaultLabel = (val: number): string => {
    const percentage = ((val - min) / (max - min)) * 100;
    if (percentage <= 33) return 'Low';
    if (percentage <= 66) return 'Medium';
    return 'High';
  };

  return (
    <div className="space-y-4">
      {/* Slider */}
      <div className="px-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value ?? min}
          onChange={(e) => onChange(Number(e.target.value))}
          disabled={disabled}
          className={clsx(
            'w-full h-2 rounded-lg appearance-none cursor-pointer',
            'bg-gray-200',
            '[&::-webkit-slider-thumb]:appearance-none',
            '[&::-webkit-slider-thumb]:w-6',
            '[&::-webkit-slider-thumb]:h-6',
            '[&::-webkit-slider-thumb]:rounded-full',
            '[&::-webkit-slider-thumb]:bg-primary',
            '[&::-webkit-slider-thumb]:cursor-pointer',
            '[&::-webkit-slider-thumb]:shadow-md',
            '[&::-webkit-slider-thumb]:transition-all',
            '[&::-webkit-slider-thumb]:hover:scale-110',
            '[&::-moz-range-thumb]:w-6',
            '[&::-moz-range-thumb]:h-6',
            '[&::-moz-range-thumb]:rounded-full',
            '[&::-moz-range-thumb]:bg-primary',
            '[&::-moz-range-thumb]:cursor-pointer',
            '[&::-moz-range-thumb]:border-0',
            '[&::-moz-range-thumb]:shadow-md',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          style={{
            background: `linear-gradient(to right, #10b981 0%, #10b981 ${((value ?? min) - min) / (max - min) * 100}%, #e5e7eb ${((value ?? min) - min) / (max - min) * 100}%, #e5e7eb 100%)`,
          }}
        />

        {/* Level labels */}
        {levels && levels.length > 0 && (
          <div className="flex justify-between mt-2">
            {levels.map((level) => (
              <div
                key={level.value}
                className={clsx(
                  'text-xs font-medium transition-colors',
                  value === level.value
                    ? 'text-primary'
                    : 'text-gray-500'
                )}
              >
                {level.label}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Current value display */}
      {showValue && (
        <div className="text-center">
          <div className="inline-block px-4 py-2 bg-primary-subtle rounded-lg">
            <span className="text-sm font-medium text-primary-dark">
              Selected: {currentLevel?.label || getDefaultLabel(value ?? min)}
            </span>
          </div>
        </div>
      )}

      {/* Examples for current level */}
      {currentLevel?.examples && currentLevel.examples.length > 0 && (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm font-medium text-charcoal mb-2">
            Examples at this level:
          </p>
          <ul className="space-y-1">
            {currentLevel.examples.map((example, index) => (
              <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>{example}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {helperText && (
        <p className="text-sm text-gray-600">{helperText}</p>
      )}
    </div>
  );
};
