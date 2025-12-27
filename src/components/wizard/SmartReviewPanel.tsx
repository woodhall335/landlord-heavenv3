/**
 * Smart Review Panel Component
 *
 * Displays AI-extracted document analysis warnings in the wizard UI.
 * Uses safe language only - "possible mismatch", "could not verify", etc.
 * NEVER uses "invalid", "guarantee", "court will", or legal advice language.
 *
 * @module src/components/wizard/SmartReviewPanel
 */

'use client';

import React, { useState, useMemo } from 'react';
import { RiAlertLine, RiErrorWarningLine, RiInformationLine, RiCheckboxCircleLine, RiArrowDownSLine } from 'react-icons/ri';

// =============================================================================
// Types
// =============================================================================

export interface SmartReviewWarningItem {
  code: string;
  severity: 'info' | 'warning' | 'blocker';
  title: string;
  message: string;
  fields: string[];
  relatedUploads: string[];
  suggestedUserAction: string;
  confidence?: number;
  comparison?: {
    wizardValue: any;
    extractedValue: any;
    source?: string;
  };
}

export interface SmartReviewSummary {
  documentsProcessed: number;
  warningsTotal: number;
  warningsBlocker: number;
  warningsWarning: number;
  warningsInfo: number;
  ranAt: string | null;
}

interface SmartReviewPanelProps {
  warnings: SmartReviewWarningItem[];
  summary: SmartReviewSummary | null;
  /** Whether to start collapsed (default: false for complete_pack) */
  defaultCollapsed?: boolean;
}

// =============================================================================
// Severity Config
// =============================================================================

const SEVERITY_CONFIG = {
  blocker: {
    label: 'Attention Required',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-300',
    textColor: 'text-amber-900',
    iconColor: 'text-amber-600',
    icon: <RiAlertLine className="w-5 h-5 text-[#7C3AED]" />,
  },
  warning: {
    label: 'Possible Issue',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    textColor: 'text-yellow-900',
    iconColor: 'text-yellow-600',
    icon: <RiErrorWarningLine className="w-5 h-5 text-[#7C3AED]" />,
  },
  info: {
    label: 'Note',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-900',
    iconColor: 'text-blue-600',
    icon: <RiInformationLine className="w-5 h-5 text-[#7C3AED]" />,
  },
};

// =============================================================================
// Filter Options
// =============================================================================

type FilterOption = 'all' | 'blocker' | 'warning' | 'info';

// =============================================================================
// Component
// =============================================================================

export function SmartReviewPanel({
  warnings,
  summary,
  defaultCollapsed = false,
}: SmartReviewPanelProps) {
  const [isExpanded, setIsExpanded] = useState(!defaultCollapsed);
  const [filter, setFilter] = useState<FilterOption>('all');

  // Group and filter warnings
  const filteredWarnings = useMemo(() => {
    if (filter === 'all') return warnings;
    return warnings.filter((w) => w.severity === filter);
  }, [warnings, filter]);

  const groupedBySeverity = useMemo(() => {
    const groups: Record<'blocker' | 'warning' | 'info', SmartReviewWarningItem[]> = {
      blocker: [],
      warning: [],
      info: [],
    };

    for (const w of filteredWarnings) {
      groups[w.severity].push(w);
    }

    return groups;
  }, [filteredWarnings]);

  // Format relative time
  const formatLastChecked = (isoDate: string | null): string => {
    if (!isoDate) return 'Not yet checked';

    const date = new Date(isoDate);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  // Don't render if no warnings and no summary
  if (warnings.length === 0 && !summary) {
    return null;
  }

  // If no warnings but has summary, show "all clear" message
  const hasWarnings = warnings.length > 0;
  const headerBgColor = hasWarnings
    ? (groupedBySeverity.blocker.length > 0 ? 'bg-amber-50' : 'bg-yellow-50')
    : 'bg-green-50';
  const headerBorderColor = hasWarnings
    ? (groupedBySeverity.blocker.length > 0 ? 'border-amber-200' : 'border-yellow-200')
    : 'border-green-200';

  return (
    <div className={`mt-4 mb-6 rounded-lg border overflow-hidden ${headerBorderColor}`}>
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full px-4 py-3 flex items-center justify-between hover:opacity-90 transition-opacity ${headerBgColor}`}
      >
        <div className="flex items-center gap-3">
          {/* Icon */}
          {hasWarnings ? (
            <RiCheckboxCircleLine className="w-5 h-5 text-[#7C3AED]" />
          ) : (
            <RiCheckboxCircleLine className="w-5 h-5 text-[#7C3AED]" />
          )}

          {/* Title */}
          <div className="text-left">
            <span className="font-medium text-gray-900">
              Document Review
              {hasWarnings && (
                <span className="ml-2 text-sm font-normal text-gray-600">
                  ({warnings.length} item{warnings.length !== 1 ? 's' : ''} to review)
                </span>
              )}
            </span>
            {summary && (
              <span className="block text-xs text-gray-500">
                Last checked: {formatLastChecked(summary.ranAt)}
                {summary.documentsProcessed > 0 && ` (${summary.documentsProcessed} document${summary.documentsProcessed !== 1 ? 's' : ''})`}
              </span>
            )}
          </div>
        </div>

        {/* Chevron */}
        <RiArrowDownSLine className={`w-5 h-5 text-[#7C3AED] transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>

      {/* Expandable content */}
      {isExpanded && (
        <div className="px-4 py-4 bg-white">
          {/* No warnings - all clear */}
          {!hasWarnings && summary && (
            <div className="text-center py-4">
              <RiCheckboxCircleLine className="w-12 h-12 mx-auto text-[#7C3AED] mb-2" />
              <p className="text-green-800 font-medium">No issues found</p>
              <p className="text-sm text-gray-500 mt-1">
                Your documents appear to match the information you provided.
              </p>
            </div>
          )}

          {/* Has warnings */}
          {hasWarnings && (
            <>
              {/* Filter buttons */}
              <div className="flex flex-wrap gap-2 mb-4">
                <FilterButton
                  label="All"
                  count={warnings.length}
                  active={filter === 'all'}
                  onClick={() => setFilter('all')}
                />
                {groupedBySeverity.blocker.length > 0 && (
                  <FilterButton
                    label="Attention"
                    count={groupedBySeverity.blocker.length}
                    active={filter === 'blocker'}
                    onClick={() => setFilter('blocker')}
                    variant="blocker"
                  />
                )}
                {groupedBySeverity.warning.length > 0 && (
                  <FilterButton
                    label="Possible Issues"
                    count={groupedBySeverity.warning.length}
                    active={filter === 'warning'}
                    onClick={() => setFilter('warning')}
                    variant="warning"
                  />
                )}
                {groupedBySeverity.info.length > 0 && (
                  <FilterButton
                    label="Notes"
                    count={groupedBySeverity.info.length}
                    active={filter === 'info'}
                    onClick={() => setFilter('info')}
                    variant="info"
                  />
                )}
              </div>

              {/* Warnings list */}
              <div className="space-y-3">
                {filteredWarnings.map((warning, index) => (
                  <WarningCard key={`${warning.code}-${index}`} warning={warning} />
                ))}
              </div>

              {/* Disclaimer */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 italic">
                  These are automated checks to help spot possible inconsistencies between your uploaded documents and the information you provided. They may miss details and may not be accurate. They are informational only and do not predict outcomes.
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Sub-components
// =============================================================================

interface FilterButtonProps {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  variant?: 'blocker' | 'warning' | 'info';
}

function FilterButton({ label, count, active, onClick, variant }: FilterButtonProps) {
  const baseClasses = 'px-3 py-1.5 text-sm font-medium rounded-full border transition-colors';

  const variantClasses = {
    blocker: active
      ? 'bg-amber-100 border-amber-300 text-amber-800'
      : 'bg-white border-gray-200 text-gray-600 hover:bg-amber-50',
    warning: active
      ? 'bg-yellow-100 border-yellow-300 text-yellow-800'
      : 'bg-white border-gray-200 text-gray-600 hover:bg-yellow-50',
    info: active
      ? 'bg-blue-100 border-blue-300 text-blue-800'
      : 'bg-white border-gray-200 text-gray-600 hover:bg-blue-50',
    default: active
      ? 'bg-gray-100 border-gray-300 text-gray-800'
      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50',
  };

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant || 'default']}`}
    >
      {label}
      <span className="ml-1.5 opacity-75">({count})</span>
    </button>
  );
}

interface WarningCardProps {
  warning: SmartReviewWarningItem;
}

function WarningCard({ warning }: WarningCardProps) {
  const [expanded, setExpanded] = useState(false);
  const config = SEVERITY_CONFIG[warning.severity];

  return (
    <div className={`rounded-lg border overflow-hidden ${config.borderColor} ${config.bgColor}`}>
      {/* Warning header */}
      <div
        className="px-4 py-3 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 ${config.iconColor}`}>
            {config.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-medium ${config.textColor} opacity-75`}>
                {config.label}
              </span>
            </div>
            <h4 className={`font-medium ${config.textColor} mt-0.5`}>
              {warning.title}
            </h4>
            <p className="text-sm text-gray-700 mt-1 line-clamp-2">
              {warning.message}
            </p>
          </div>
          <RiArrowDownSLine className={`w-5 h-5 text-[#7C3AED] transition-transform flex-shrink-0 ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-opacity-50" style={{ borderColor: 'inherit' }}>
          {/* Comparison if available */}
          {warning.comparison && (
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="bg-white bg-opacity-50 rounded p-3">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Your Answer</p>
                <p className="text-sm text-gray-900 font-medium">
                  {formatComparisonValue(warning.comparison.wizardValue)}
                </p>
              </div>
              <div className="bg-white bg-opacity-50 rounded p-3">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Found in Document</p>
                <p className="text-sm text-gray-900 font-medium">
                  {formatComparisonValue(warning.comparison.extractedValue)}
                </p>
                {warning.comparison.source && (
                  <p className="text-xs text-gray-500 mt-1">
                    Source: {warning.comparison.source}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Suggested action */}
          {warning.suggestedUserAction && (
            <div className="mt-3 bg-white bg-opacity-50 rounded p-3">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Suggested Action</p>
              <p className="text-sm text-gray-700">
                {warning.suggestedUserAction}
              </p>
            </div>
          )}

          {/* Confidence indicator */}
          {warning.confidence !== undefined && warning.confidence < 0.8 && (
            <p className="mt-3 text-xs text-gray-500 italic">
              Confidence: {Math.round(warning.confidence * 100)}% - This is an automated check and may need verification.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Helpers
// =============================================================================

function formatComparisonValue(value: any): string {
  if (value === null || value === undefined) {
    return 'Not provided';
  }
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  if (typeof value === 'number') {
    // Format as currency if looks like money
    if (value >= 100 && value < 100000) {
      return `£${value.toLocaleString()}`;
    }
    return value.toString();
  }
  if (typeof value === 'string') {
    return value || 'Not provided';
  }
  if (Array.isArray(value)) {
    return value.join(', ') || 'None';
  }
  return JSON.stringify(value);
}
