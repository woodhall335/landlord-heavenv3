/**
 * Skeleton Component
 *
 * Loading placeholder with shimmer animation
 */

import React from 'react';
import { clsx } from 'clsx';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'text',
  width,
  height,
  animation = 'pulse',
}) => {
  const baseStyles = 'bg-gray-200';

  const variantStyles = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-lg',
  };

  const animationStyles = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]',
    none: '',
  };

  const style: React.CSSProperties = {
    width: width,
    height: height,
  };

  return (
    <div
      className={clsx(baseStyles, variantStyles[variant], animationStyles[animation], className)}
      style={style}
      aria-hidden="true"
    />
  );
};

/**
 * Card Skeleton - Loading placeholder for cards
 */
export const CardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={clsx('bg-white rounded-2xl shadow-sm border border-gray-200 p-6', className)}>
    <div className="flex items-start justify-between mb-4">
      <div className="space-y-2">
        <Skeleton variant="text" className="h-5 w-32" />
        <Skeleton variant="text" className="h-4 w-24" />
      </div>
      <Skeleton variant="rounded" className="h-6 w-20" />
    </div>
    <div className="space-y-3">
      <Skeleton variant="text" className="h-4 w-full" />
      <Skeleton variant="text" className="h-4 w-3/4" />
    </div>
    <div className="mt-4 pt-4 border-t border-gray-100">
      <Skeleton variant="text" className="h-3 w-40" />
    </div>
  </div>
);

/**
 * Table Row Skeleton - Loading placeholder for table rows
 */
export const TableRowSkeleton: React.FC<{ columns?: number; className?: string }> = ({
  columns = 4,
  className,
}) => (
  <tr className={clsx('border-b border-gray-100', className)}>
    {Array.from({ length: columns }).map((_, i) => (
      <td key={i} className="py-4 px-4">
        <Skeleton variant="text" className="h-4" />
      </td>
    ))}
  </tr>
);

/**
 * Stats Card Skeleton - Loading placeholder for dashboard stats
 */
export const StatsCardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={clsx('bg-white rounded-2xl shadow-sm border border-gray-200 p-6', className)}>
    <div className="flex items-center justify-between mb-3">
      <Skeleton variant="circular" className="w-10 h-10" />
      <Skeleton variant="rounded" className="h-5 w-16" />
    </div>
    <Skeleton variant="text" className="h-8 w-20 mb-1" />
    <Skeleton variant="text" className="h-4 w-28" />
  </div>
);

/**
 * List Item Skeleton - Loading placeholder for list items
 */
export const ListItemSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={clsx('flex items-center gap-4 py-4', className)}>
    <Skeleton variant="circular" className="w-12 h-12 shrink-0" />
    <div className="flex-1 space-y-2">
      <Skeleton variant="text" className="h-4 w-3/4" />
      <Skeleton variant="text" className="h-3 w-1/2" />
    </div>
  </div>
);

/**
 * Page Header Skeleton - Loading placeholder for page headers
 */
export const PageHeaderSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={clsx('space-y-3', className)}>
    <Skeleton variant="text" className="h-8 w-64" />
    <Skeleton variant="text" className="h-4 w-96" />
  </div>
);
