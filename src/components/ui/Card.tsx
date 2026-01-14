/**
 * Card Component
 * Based on /docs/STYLE_GUIDE.md
 *
 * Features:
 * - Clean, spacious design
 * - Optional hover effects
 * - Proper shadow hierarchy
 * - Flexible padding options
 */

import React from "react";
import { clsx } from "clsx";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "bordered" | "elevated";
  padding?: "none" | "small" | "medium" | "large";
  hoverable?: boolean;
  children: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = "default",
      padding = "medium",
      hoverable = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = clsx(
      "bg-white rounded-2xl",
      "transition-all duration-200 ease-out"
    );

    const variantStyles = {
      default: "shadow-sm border border-gray-200",
      bordered: "shadow-sm border-2 border-gray-300",
      elevated: "shadow-lg border border-gray-100",
    };

    const paddingStyles = {
      none: "",
      small: "p-4",
      medium: "p-6",
      large: "p-8",
    };

    const hoverStyles = hoverable
      ? "hover:shadow-xl hover:border-primary/30 hover:-translate-y-1 active:scale-[0.99] cursor-pointer"
      : "";

    return (
      <div
        ref={ref}
        className={clsx(
          baseStyles,
          variantStyles[variant],
          paddingStyles[padding],
          hoverStyles,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

/**
 * Card Header Component
 */
export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={clsx("flex flex-col gap-1.5 mb-4", className)}
    {...props}
  >
    {children}
  </div>
));

CardHeader.displayName = "CardHeader";

/**
 * Card Title Component
 */
export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => (
  <h3
    ref={ref}
    className={clsx("text-2xl font-semibold text-charcoal leading-tight", className)}
    {...props}
  >
    {children}
  </h3>
));

CardTitle.displayName = "CardTitle";

/**
 * Card Description Component
 */
export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => (
  <p
    ref={ref}
    className={clsx("text-base text-gray-700 leading-relaxed", className)}
    {...props}
  >
    {children}
  </p>
));

CardDescription.displayName = "CardDescription";

/**
 * Card Content Component
 */
export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div ref={ref} className={clsx(className)} {...props}>
    {children}
  </div>
));

CardContent.displayName = "CardContent";

/**
 * Card Footer Component
 */
export const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={clsx("flex items-center gap-2 mt-4 pt-4 border-t border-gray-200", className)}
    {...props}
  >
    {children}
  </div>
));

CardFooter.displayName = "CardFooter";
