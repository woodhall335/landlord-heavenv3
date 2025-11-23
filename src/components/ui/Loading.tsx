/**
 * Loading Component
 *
 * Loading spinners and skeletons for async states
 */

import React from 'react';

interface LoadingProps {
  variant?: 'spinner' | 'dots' | 'skeleton';
  size?: 'small' | 'medium' | 'large';
  fullScreen?: boolean;
  text?: string;
}

const sizeClasses: Record<NonNullable<LoadingProps['size']>, string> = {
  small: 'w-4 h-4',
  medium: 'w-8 h-8',
  large: 'w-12 h-12',
};

const Spinner: React.FC<{ size: LoadingProps['size']; text?: string }> = ({ size = 'medium', text }) => (
  <div className="flex flex-col items-center justify-center gap-4">
    <div className={`${sizeClasses[size]} border-4 border-primary border-t-transparent rounded-full animate-spin`} />
    {text && <p className="text-sm text-gray-600">{text}</p>}
  </div>
);

const Dots: React.FC<{ size: LoadingProps['size'] }> = ({ size = 'medium' }) => (
  <div className="flex items-center justify-center gap-2">
    <div className={`${sizeClasses[size]} bg-primary rounded-full animate-bounce`} style={{ animationDelay: '0ms' }} />
    <div className={`${sizeClasses[size]} bg-primary rounded-full animate-bounce`} style={{ animationDelay: '150ms' }} />
    <div className={`${sizeClasses[size]} bg-primary rounded-full animate-bounce`} style={{ animationDelay: '300ms' }} />
  </div>
);

const Skeleton: React.FC = () => (
  <div className="space-y-4 animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-3/4" />
    <div className="h-4 bg-gray-200 rounded" />
    <div className="h-4 bg-gray-200 rounded w-5/6" />
  </div>
);

export const Loading: React.FC<LoadingProps> = ({
  variant = 'spinner',
  size = 'medium',
  fullScreen = false,
  text,
}) => {
  const content = (() => {
    switch (variant) {
      case 'dots':
        return <Dots size={size} />;
      case 'skeleton':
        return <Skeleton />;
      default:
        return <Spinner size={size} text={text} />;
    }
  })();

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return content;
};
