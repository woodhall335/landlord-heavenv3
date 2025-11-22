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
      // Base styles
      "inline-flex items-center justify-center gap-2",
      "font-medium rounded-lg transition-all duration-200",
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
        "hover:bg-primary-dark",
        "focus:ring-primary",
        "shadow-sm hover:shadow-md"
      ),
      secondary: clsx(
        "bg-secondary text-white",
        "hover:bg-secondary-dark",
        "focus:ring-secondary",
        "shadow-sm hover:shadow-md"
      ),
      outline: clsx(
        "bg-white text-charcoal border-2 border-gray-300",
        "hover:border-primary hover:text-primary",
        "focus:ring-primary"
      ),
      ghost: clsx(
        "bg-transparent text-charcoal",
        "hover:bg-gray-100",
        "focus:ring-gray-300"
      ),
      danger: clsx(
        "bg-error text-white",
        "hover:bg-red-600",
        "focus:ring-error",
        "shadow-sm hover:shadow-md"
      ),
    };

    const sizeStyles = {
      small: "px-4 py-2 text-sm",
      medium: "px-6 py-3 text-base",
      large: "px-8 py-4 text-lg font-semibold",
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
