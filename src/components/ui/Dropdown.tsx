/**
 * Dropdown Component
 *
 * Accessible dropdown menu with keyboard navigation
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';

interface DropdownOption {
  label: string;
  value: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface DropdownProps {
  options: DropdownOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  label?: string;
  error?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  disabled = false,
  label,
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen(!isOpen);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-charcoal mb-2">
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`w-full px-4 py-2 text-left bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/40 focus:border-primary transition-colors ${
          error
            ? 'border-error'
            : isOpen
            ? 'border-primary'
            : 'border-gray-300 hover:border-gray-400'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {selectedOption?.icon}
            <span className={selectedOption ? 'text-charcoal' : 'text-gray-500'}>
              {selectedOption?.label || placeholder}
            </span>
          </div>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${
              isOpen ? 'transform rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
          <ul role="listbox">
            {options.map((option) => (
              <li
                key={option.value}
                role="option"
                aria-selected={value === option.value}
                onClick={() => !option.disabled && handleSelect(option.value)}
                className={`px-4 py-2 flex items-center gap-2 ${
                  option.disabled
                    ? 'opacity-50 cursor-not-allowed'
                    : 'cursor-pointer hover:bg-gray-50'
                } ${value === option.value ? 'bg-primary-subtle text-primary font-medium' : ''}`}
              >
                {option.icon}
                {option.label}
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && <p className="mt-1 text-sm text-error">{error}</p>}
    </div>
  );
};
