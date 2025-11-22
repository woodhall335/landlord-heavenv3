/**
 * Badge Component
 * Based on /docs/STYLE_GUIDE.md
 *
 * Features:
 * - Multiple variants (success, warning, error, info, primary)
 * - Sizes (small, medium, large)
 * - Optional icon support
 * - HMO Pro special variant
 */

import React from "react";
import { clsx } from "clsx";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "success" | "warning" | "error" | "info" | "neutral" | "hmo-pro";
  size?: "small" | "medium" | "large";
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      variant = "neutral",
      size = "medium",
      icon,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = clsx(
      "inline-flex items-center gap-1.5",
      "font-medium rounded-full",
      "whitespace-nowrap"
    );

    const variantStyles = {
      primary: "bg-primary-subtle text-primary-dark",
      success: "bg-success-bg text-success",
      warning: "bg-warning-bg text-orange-800",
      error: "bg-error-bg text-error",
      info: "bg-info-bg text-info",
      neutral: "bg-gray-100 text-gray-700",
      "hmo-pro": "bg-gradient-to-r from-secondary to-primary text-white font-semibold shadow-md",
    };

    const sizeStyles = {
      small: "px-2 py-0.5 text-xs",
      medium: "px-3 py-1 text-sm",
      large: "px-4 py-1.5 text-base",
    };

    return (
      <span
        ref={ref}
        className={clsx(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {icon && <span className="flex-shrink-0">{icon}</span>}
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";

/**
 * Status Badge - Specialized for case/document statuses
 */
export interface StatusBadgeProps {
  status:
    | "draft"
    | "in_progress"
    | "completed"
    | "paid"
    | "pending"
    | "failed"
    | "active"
    | "cancelled";
  size?: "small" | "medium" | "large";
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = "medium" }) => {
  const statusConfig = {
    draft: {
      variant: "neutral" as const,
      label: "Draft",
    },
    in_progress: {
      variant: "info" as const,
      label: "In Progress",
    },
    completed: {
      variant: "success" as const,
      label: "Completed",
    },
    paid: {
      variant: "success" as const,
      label: "Paid",
    },
    pending: {
      variant: "warning" as const,
      label: "Pending",
    },
    failed: {
      variant: "error" as const,
      label: "Failed",
    },
    active: {
      variant: "success" as const,
      label: "Active",
    },
    cancelled: {
      variant: "error" as const,
      label: "Cancelled",
    },
  };

  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} size={size}>
      {config.label}
    </Badge>
  );
};

/**
 * Price Badge - For displaying prices
 */
export interface PriceBadgeProps {
  price: number;
  currency?: string;
  size?: "small" | "medium" | "large";
}

export const PriceBadge: React.FC<PriceBadgeProps> = ({
  price,
  currency = "£",
  size = "medium",
}) => {
  const formattedPrice = `${currency}${price.toFixed(2)}`;

  return (
    <Badge variant="primary" size={size}>
      {formattedPrice}
    </Badge>
  );
};
