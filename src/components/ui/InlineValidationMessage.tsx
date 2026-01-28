/**
 * Inline Validation Message Component
 *
 * A reusable component for displaying inline validation errors, warnings,
 * and informational messages directly below form fields.
 *
 * Features:
 * - Three severity levels with distinct styling (error, warning, info)
 * - Optional help text for additional context
 * - Accessible with appropriate ARIA attributes
 * - Consistent styling with the rest of the wizard UI
 *
 * @module InlineValidationMessage
 */

'use client';

import React from 'react';
import { RiErrorWarningLine, RiAlertLine, RiInformationLine } from 'react-icons/ri';
import { cn } from '@/lib/utils';

export interface InlineValidationMessageProps {
  /** Severity determines styling and icon */
  severity: 'error' | 'warning' | 'info';

  /** Main validation message */
  message: string;

  /** Optional additional context or guidance */
  helpText?: string;

  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Style configuration for each severity level
 */
const SEVERITY_STYLES = {
  error: {
    container: 'bg-red-50 border-red-200 text-red-800',
    icon: RiErrorWarningLine,
    iconColor: 'text-red-500',
  },
  warning: {
    container: 'bg-amber-50 border-amber-200 text-amber-800',
    icon: RiAlertLine,
    iconColor: 'text-amber-500',
  },
  info: {
    container: 'bg-blue-50 border-blue-200 text-blue-800',
    icon: RiInformationLine,
    iconColor: 'text-blue-500',
  },
};

/**
 * InlineValidationMessage - Display validation feedback directly below form fields
 *
 * Usage:
 * ```tsx
 * <ValidatedInput ... />
 * {error && (
 *   <InlineValidationMessage
 *     severity={error.severity}
 *     message={error.message}
 *     helpText={error.helpText}
 *   />
 * )}
 * ```
 */
export const InlineValidationMessage: React.FC<InlineValidationMessageProps> = ({
  severity,
  message,
  helpText,
  className,
}) => {
  const style = SEVERITY_STYLES[severity];
  const Icon = style.icon;

  return (
    <div
      className={cn(
        'mt-2 p-3 rounded-md border flex gap-3',
        style.container,
        className
      )}
      role={severity === 'error' ? 'alert' : 'status'}
      aria-live={severity === 'error' ? 'assertive' : 'polite'}
    >
      <Icon
        className={cn('h-5 w-5 mt-0.5 shrink-0', style.iconColor)}
        aria-hidden="true"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{message}</p>
        {helpText && (
          <p className="text-sm mt-1 opacity-80">{helpText}</p>
        )}
      </div>
    </div>
  );
};

/**
 * Compact variant of InlineValidationMessage
 *
 * Use this for tighter spacing in forms where multiple fields
 * are displayed close together.
 */
export const InlineValidationMessageCompact: React.FC<InlineValidationMessageProps> = ({
  severity,
  message,
  helpText,
  className,
}) => {
  const style = SEVERITY_STYLES[severity];
  const Icon = style.icon;

  return (
    <div
      className={cn(
        'mt-1.5 p-2 rounded border flex gap-2 text-xs',
        style.container,
        className
      )}
      role={severity === 'error' ? 'alert' : 'status'}
      aria-live={severity === 'error' ? 'assertive' : 'polite'}
    >
      <Icon
        className={cn('h-4 w-4 shrink-0', style.iconColor)}
        aria-hidden="true"
      />
      <div className="flex-1 min-w-0">
        <span className="font-medium">{message}</span>
        {helpText && (
          <span className="block mt-0.5 opacity-80">{helpText}</span>
        )}
      </div>
    </div>
  );
};

/**
 * Helper component that conditionally renders an InlineValidationMessage
 * only when there is an error/validation result to display.
 *
 * @param error - Validation result object (or null/undefined if valid)
 */
export interface ConditionalValidationProps {
  error?: {
    severity: 'error' | 'warning' | 'info';
    message: string;
    helpText?: string;
  } | null;
  className?: string;
}

export const ConditionalInlineValidation: React.FC<ConditionalValidationProps> = ({
  error,
  className,
}) => {
  if (!error) return null;

  return (
    <InlineValidationMessage
      severity={error.severity}
      message={error.message}
      helpText={error.helpText}
      className={className}
    />
  );
};

export default InlineValidationMessage;
