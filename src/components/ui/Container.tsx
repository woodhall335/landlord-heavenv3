/**
 * Container Component
 * Based on /docs/STYLE_GUIDE.md
 *
 * Features:
 * - Responsive max-width
 * - Proper padding for mobile
 * - Centered content
 * - Different size variants
 */

import React from "react";
import { clsx } from "clsx";

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "small" | "medium" | "large" | "full";
  children: React.ReactNode;
}

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ size = "large", className, children, ...props }, ref) => {
    const sizeStyles = {
      small: "max-w-3xl", // ~768px
      medium: "max-w-5xl", // ~1024px
      large: "max-w-7xl", // ~1280px
      full: "max-w-none",
    };

    return (
      <div
        ref={ref}
        className={clsx(
          "mx-auto px-4 sm:px-6 lg:px-8",
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Container.displayName = "Container";
