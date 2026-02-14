/**
 * EmptyState Component
 *
 * Professional empty state with icon, message, and optional CTA
 */

import React from 'react';
import Link from 'next/link';
import { Button } from './Button';
import {
  RiFileTextLine,
  RiFolder2Line,
  RiFolderOpenLine,
  RiSearchLine,
  RiInboxLine,
  RiFileList3Line,
} from 'react-icons/ri';

type EmptyStateVariant = 'cases' | 'documents' | 'search' | 'inbox' | 'default';

interface EmptyStateProps {
  variant?: EmptyStateVariant;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

const variantDefaults: Record<EmptyStateVariant, { icon: React.ReactNode; title: string; description: string }> = {
  cases: {
    icon: <RiFileTextLine className="w-16 h-16" />,
    title: "No cases yet",
    description: "Create your first case to get started with generating court-ready case bundles.",
  },
  documents: {
    icon: <RiFolderOpenLine className="w-16 h-16" />,
    title: "No documents",
    description: "Your generated documents will appear here once you complete a case.",
  },
  search: {
    icon: <RiSearchLine className="w-16 h-16" />,
    title: "No results found",
    description: "Try adjusting your search or filters to find what you're looking for.",
  },
  inbox: {
    icon: <RiInboxLine className="w-16 h-16" />,
    title: "All caught up!",
    description: "You have no new notifications or messages.",
  },
  default: {
    icon: <RiFileList3Line className="w-16 h-16" />,
    title: "Nothing here yet",
    description: "This section is empty. Get started by taking an action.",
  },
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  variant = 'default',
  title,
  description,
  icon,
  actionLabel,
  actionHref,
  onAction,
  className = '',
}) => {
  const defaults = variantDefaults[variant];
  const displayTitle = title || defaults.title;
  const displayDescription = description || defaults.description;
  const displayIcon = icon || defaults.icon;

  return (
    <div className={`text-center py-12 px-4 ${className}`}>
      {/* Icon with subtle animation on hover */}
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 text-primary mb-6 transition-transform duration-300 hover:scale-110">
        {displayIcon}
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {displayTitle}
      </h3>

      {/* Description */}
      <p className="text-gray-600 max-w-sm mx-auto mb-6">
        {displayDescription}
      </p>

      {/* Action Button */}
      {(actionLabel && actionHref) && (
        <Link href={actionHref}>
          <Button variant="primary" size="medium">
            {actionLabel}
          </Button>
        </Link>
      )}
      {(actionLabel && onAction && !actionHref) && (
        <Button variant="primary" size="medium" onClick={onAction}>
          {actionLabel}
        </Button>
      )}

      {/* Helpful tips */}
      {variant === 'cases' && (
        <div className="mt-8 pt-6 border-t border-gray-200 max-w-md mx-auto">
          <p className="text-sm text-gray-500 mb-3">Quick tips to get started:</p>
          <ul className="text-sm text-gray-600 text-left space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">1.</span>
              Click "Create Your First Case" to begin
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">2.</span>
              Answer questions about your property and situation
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">3.</span>
              Download your court-ready documents instantly
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};
