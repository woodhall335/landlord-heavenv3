/**
 * Button Component
 * Based on /docs/STYLE_GUIDE.md
 *
 * Features:
 * - 44px minimum touch target (mobile-friendly)
 * - Primary, secondary, large variants
 * - Disabled states
 * - Loading states
 * - WCAG AA accessible
 */

import React from "react";
import { clsx } from "clsx";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "small" | "medium" | "large";
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "medium",
      loading = false,
      fullWidth = false,
      icon,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = clsx(
      // Base styles (PandaDoc-inspired)
      "inline-flex items-center justify-center gap-2",
      "font-semibold rounded-md transition-all duration-200",
      "focus:outline-none focus:ring-2 focus:ring-offset-2",
      "disabled:opacity-50 disabled:cursor-not-allowed",
      // Touch target minimum 44px
      "min-h-touch",
      // Prevent text selection
      "select-none"
    );

    const variantStyles = {
      primary: clsx(
        "bg-primary text-white",
        "hover:bg-primary-dark hover:shadow-lg",
        "active:scale-[0.98]",
        "focus:ring-primary/50"
      ),
      secondary: clsx(
        "bg-secondary text-white",
        "hover:bg-secondary-dark hover:shadow-lg",
        "active:scale-[0.98]",
        "focus:ring-secondary/50"
      ),
      outline: clsx(
        "bg-white text-charcoal border-2 border-gray-300",
        "hover:border-primary hover:text-primary hover:bg-primary/5",
        "active:scale-[0.98]",
        "focus:ring-primary/50"
      ),
      ghost: clsx(
        "bg-transparent text-charcoal",
        "hover:bg-gray-100",
        "active:scale-[0.98]",
        "focus:ring-gray-300/50"
      ),
      danger: clsx(
        "bg-error text-white",
        "hover:bg-red-600 hover:shadow-lg",
        "active:scale-[0.98]",
        "focus:ring-error/50"
      ),
    };

    const sizeStyles = {
      small: "px-5 py-2.5 text-sm min-h-button",
      medium: "px-7 py-3 text-base min-h-button",
      large: "px-9 py-4 text-lg font-bold min-h-button-lg",
    };

    const widthStyles = fullWidth ? "w-full" : "";

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={clsx(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          widthStyles,
          className
        )}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {icon && !loading && icon}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
