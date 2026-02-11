/**
 * Input Component
 * Based on /docs/STYLE_GUIDE.md
 *
 * Features:
 * - Label, helper text, error states
 * - 44px minimum touch target
 * - Proper focus states
 * - Icon support
 * - WCAG AA accessible
 */

import React from "react";
import { clsx } from "clsx";
import { isWizardThemeV2 } from '@/components/wizard/shared/theme';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const inputId = id ?? `input-${generatedId}`;
    const hasError = Boolean(error);

    const containerStyles = fullWidth ? "w-full" : "";

    const inputBaseStyles = clsx(
      // Base styles
      isWizardThemeV2 ? "rounded-xl border px-4 py-3" : "rounded-lg border-2 px-4 py-3",
      "font-normal text-base text-charcoal",
      "placeholder:text-gray-400",
      "transition-all duration-200",
      // Min height for touch target
      "min-h-touch",
      // Focus states
      "focus:outline-none focus:ring-2 focus:ring-offset-2",
      // Disabled styles
      "disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
    );

    const inputVariantStyles = hasError
      ? clsx(
          "border-error",
          "focus:border-error focus:ring-error/40"
        )
      : clsx(
          isWizardThemeV2 ? "border-violet-200" : "border-gray-300",
          isWizardThemeV2 ? "focus:border-violet-500 focus:ring-violet-500/30" : "focus:border-primary focus:ring-primary/40",
          isWizardThemeV2 ? "hover:border-violet-300" : "hover:border-gray-400"
        );

    const inputPaddingStyles = clsx(
      leftIcon && "pl-12",
      rightIcon && "pr-12"
    );

    return (
      <div className={clsx("flex flex-col gap-1.5", containerStyles)}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-charcoal"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={clsx(
              inputBaseStyles,
              inputVariantStyles,
              inputPaddingStyles,
              fullWidth && "w-full",
              className
            )}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
              {rightIcon}
            </div>
          )}
        </div>

        {helperText && !hasError && (
          <p className="text-sm text-gray-600">{helperText}</p>
        )}

        {hasError && (
          <p className="text-sm text-error font-medium">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

/**
 * Textarea Component
 */
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      helperText,
      error,
      fullWidth = false,
      className,
      id,
      rows = 4,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const inputId = id ?? `textarea-${generatedId}`;
    const hasError = Boolean(error);

    const containerStyles = fullWidth ? "w-full" : "";

    const textareaBaseStyles = clsx(
      // Base styles
      isWizardThemeV2 ? "rounded-xl border px-4 py-3" : "rounded-lg border-2 px-4 py-3",
      "font-normal text-base text-charcoal",
      "placeholder:text-gray-400",
      "transition-all duration-200",
      "resize-vertical",
      // Focus states
      "focus:outline-none focus:ring-2 focus:ring-offset-2",
      // Disabled styles
      "disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
    );

    const textareaVariantStyles = hasError
      ? clsx(
          "border-error",
          "focus:border-error focus:ring-error/40"
        )
      : clsx(
          isWizardThemeV2 ? "border-violet-200" : "border-gray-300",
          isWizardThemeV2 ? "focus:border-violet-500 focus:ring-violet-500/30" : "focus:border-primary focus:ring-primary/40",
          isWizardThemeV2 ? "hover:border-violet-300" : "hover:border-gray-400"
        );

    return (
      <div className={clsx("flex flex-col gap-1.5", containerStyles)}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-charcoal"
          >
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          id={inputId}
          rows={rows}
          className={clsx(
            textareaBaseStyles,
            textareaVariantStyles,
            fullWidth && "w-full",
            className
          )}
          {...props}
        />

        {helperText && !hasError && (
          <p className="text-sm text-gray-600">{helperText}</p>
        )}

        {hasError && (
          <p className="text-sm text-error font-medium">{error}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
