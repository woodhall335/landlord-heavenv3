//  src/components/wizard/MultipleSelection.tsx

'use client';

import React, { useMemo } from 'react';
import { Button } from '@/components/ui/Button';

export interface MultipleSelectionOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface MultipleSelectionProps {
  /** Currently selected option values */
  value: string[] | null | undefined;
  /** All options to render */
  options: MultipleSelectionOption[];
  /** Called whenever the selection changes */
  onChange: (next: string[]) => void;
  /** Disable all interaction */
  disabled?: boolean;
  /** Optional ARIA label / test id support */
  'aria-label'?: string;
  'data-testid'?: string;
}

/**
 * MultipleSelection
 *
 * Generic multi-select input used by the wizard.
 * Renders options as toggleable "chips" using the shared Button component.
 */
export function MultipleSelection({
  value,
  options,
  onChange,
  disabled,
  ...rest
}: MultipleSelectionProps) {
  const selectedValues = useMemo(
    () => (Array.isArray(value) ? value : []),
    [value]
  );

  const toggleValue = (val: string) => {
    if (disabled) return;

    const isSelected = selectedValues.includes(val);
    const next = isSelected
      ? selectedValues.filter((v) => v !== val)
      : [...selectedValues, val];

    onChange(next);
  };

  if (!options || options.length === 0) {
    return null;
  }

  return (
    <div
      className="flex flex-wrap gap-2"
      {...rest}
    >
      {options.map((option) => {
        const isSelected = selectedValues.includes(option.value);

        return (
          <Button
            key={option.value}
            type="button"
            // Use valid variants from Button.tsx:
            // 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
            variant={isSelected ? 'primary' : 'outline'}
            onClick={() => toggleValue(option.value)}
            disabled={disabled || option.disabled}
            className="flex items-center gap-1 px-3 py-1 text-sm"
          >
            <span>{option.label}</span>
            {option.description && (
              <span className="text-xs text-muted-foreground">
                {option.description}
              </span>
            )}
          </Button>
        );
      })}
    </div>
  );
}

// Provide default export as well, in case any legacy imports rely on it
export default MultipleSelection;
