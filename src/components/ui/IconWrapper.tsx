/**
 * IconWrapper Component
 *
 * Provides consistent styling for feature/card icons across the application.
 * Matches the reference style from the Products section on the landing page:
 * - Circular/rounded background in light purple
 * - Icon in accent purple color
 * - Optional hover effects
 *
 * @example
 * ```tsx
 * <IconWrapper size="md">
 *   <RiFileTextLine className="w-7 h-7" />
 * </IconWrapper>
 * ```
 */

import React from 'react';
import { clsx } from 'clsx';

export type IconWrapperSize = 'sm' | 'md' | 'lg' | 'xl';

export interface IconWrapperProps {
  children: React.ReactNode;
  size?: IconWrapperSize;
  /** Use rounded-full instead of rounded-xl */
  rounded?: boolean;
  /** Enable hover effects (requires parent group class) */
  hover?: boolean;
  /** Additional className */
  className?: string;
}

const sizeClasses: Record<IconWrapperSize, string> = {
  sm: 'w-10 h-10',
  md: 'w-12 h-12',
  lg: 'w-14 h-14',
  xl: 'w-16 h-16',
};

/**
 * IconWrapper - Consistent icon container styling
 *
 * Sizes:
 * - sm: 40x40px - for inline/small icons
 * - md: 48x48px - for standard card icons
 * - lg: 56x56px - for feature cards (default, matches Products section)
 * - xl: 64x64px - for hero/large icons
 */
export function IconWrapper({
  children,
  size = 'lg',
  rounded = false,
  hover = true,
  className,
}: IconWrapperProps) {
  return (
    <div
      className={clsx(
        // Base styles
        sizeClasses[size],
        'flex items-center justify-center',
        rounded ? 'rounded-full' : 'rounded-xl',
        // Colors - light purple background, accent purple icon
        'bg-purple-100 text-primary',
        // Hover effects (when parent has 'group' class)
        hover && 'transition-all duration-300 group-hover:bg-primary group-hover:text-white group-hover:scale-110',
        className
      )}
    >
      {children}
    </div>
  );
}

export default IconWrapper;
