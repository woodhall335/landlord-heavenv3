/**
 * Compliance Timing Blocker Component
 *
 * User-friendly error panel displayed when Section 21 pack generation is blocked
 * due to compliance requirement violations. Shows clear, actionable information
 * WITHOUT exposing internal error codes.
 *
 * SECURITY REQUIREMENTS:
 * - NEVER display raw internal `issue.field` values to users
 * - ALWAYS use `documentLabel` from server or a known mapping; fall back to generic label
 * - Technical codes are for server-side logging only
 *
 * @module ComplianceTimingBlocker
 */

'use client';

import React from 'react';
import { RiErrorWarningLine, RiEdit2Line } from 'react-icons/ri';
import { Card } from './Card';

/**
 * Sanitized compliance issue for UI display.
 * The API should provide `documentLabel` for UI use.
 * The `field` property is for internal/logging purposes ONLY and must NEVER be rendered.
 */
export interface ComplianceTimingIssue {
  /** Internal field code - FOR LOGGING ONLY, never display to user */
  field: string;
  /** User-facing document label (e.g., "Gas Safety Certificate (CP12)") */
  documentLabel?: string;
  /** Issue category: 'timing' | 'expiry' | 'deposit' | 'other' */
  category?: 'timing' | 'expiry' | 'deposit' | 'other';
  /** User-friendly explanation of the requirement */
  message: string;
  /** What was expected (e.g., "Before 15 January 2024") */
  expected?: string;
  /** What was actually recorded */
  actual?: string;
  /** Issue severity */
  severity: 'error' | 'warning';
}

export interface ComplianceTimingBlockerProps {
  /** List of compliance issues that are blocking generation */
  issues: ComplianceTimingIssue[];
  /** Tenancy start date (YYYY-MM-DD format) */
  tenancyStartDate?: string;
  /** Callback when user clicks "Edit compliance details" */
  onEditCompliance: () => void;
}

/**
 * FALLBACK ONLY: Maps internal field codes to user-friendly document names.
 * Prefer using `documentLabel` from server response when available.
 * If field is unknown, we use a GENERIC fallback - never expose the raw field name.
 */
const FIELD_TO_DOCUMENT_NAME: Record<string, string> = {
  'epc_timing': 'Energy Performance Certificate (EPC)',
  'gas_safety_timing': 'Gas Safety Certificate (CP12)',
  'gas_safety_expiry': 'Gas Safety Certificate (CP12)',
  'how_to_rent_timing': 'How to Rent Guide',
  'prescribed_info_timing': 'Deposit Prescribed Information',
};

/**
 * FALLBACK ONLY: Gets user-friendly explanation for each document type.
 * Prefer using `message` from server response when it's user-friendly.
 */
const DOCUMENT_EXPLANATIONS: Record<string, string> = {
  'epc_timing': 'The EPC must be provided to the tenant before the tenancy starts.',
  'gas_safety_timing': 'A gas safety record must be given to the tenant before they move in.',
  'gas_safety_expiry': 'The current gas safety certificate must be less than 12 months old.',
  'how_to_rent_timing': 'The How to Rent guide must be provided before the tenancy starts.',
  'prescribed_info_timing': 'Deposit prescribed information must be served within 30 days of receiving the deposit.',
};

/** Generic fallback label when field is unknown - NEVER expose raw field names */
const GENERIC_DOCUMENT_LABEL = 'Compliance requirement';

/** Generic fallback explanation */
const GENERIC_EXPLANATION = 'A required compliance document was not provided at the correct time.';

/**
 * Parses a YYYY-MM-DD date string as a local date to avoid timezone off-by-one issues.
 * Using `new Date('YYYY-MM-DD')` interprets as UTC, which can shift the date.
 */
function parseLocalDate(dateStr: string): Date | null {
  if (!dateStr) return null;

  // Handle YYYY-MM-DD format explicitly as local time
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    const [, year, month, day] = match;
    return new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
  }

  // Fallback for other formats
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Formats a date string to a user-friendly format (e.g., "15 January 2024").
 * Handles YYYY-MM-DD format correctly to avoid timezone issues.
 */
function formatDate(dateStr?: string): string | null {
  if (!dateStr) return null;

  const date = parseLocalDate(dateStr);
  if (!date) return dateStr; // Return original if unparseable

  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Gets a safe document label for display.
 * Priority: documentLabel from server > known mapping > generic fallback
 * NEVER returns the raw field name.
 */
function getSafeDocumentLabel(issue: ComplianceTimingIssue): string {
  // Prefer server-provided documentLabel
  if (issue.documentLabel) {
    return issue.documentLabel;
  }

  // Fall back to known mapping
  if (issue.field && FIELD_TO_DOCUMENT_NAME[issue.field]) {
    return FIELD_TO_DOCUMENT_NAME[issue.field];
  }

  // Generic fallback - NEVER expose raw field name
  return GENERIC_DOCUMENT_LABEL;
}

/**
 * Gets a safe explanation for display.
 * Priority: known explanation > issue.message (if user-friendly) > generic fallback
 */
function getSafeExplanation(issue: ComplianceTimingIssue): string {
  // Prefer known explanation for the field
  if (issue.field && DOCUMENT_EXPLANATIONS[issue.field]) {
    return DOCUMENT_EXPLANATIONS[issue.field];
  }

  // Use message if it exists and doesn't look like an internal error
  if (issue.message && !issue.message.includes('_') && issue.message.length > 10) {
    return issue.message;
  }

  return GENERIC_EXPLANATION;
}

/**
 * Determines if any issue is an expiry-type issue (not timing).
 * Used to adjust the intro paragraph text.
 */
function hasExpiryIssue(issues: ComplianceTimingIssue[]): boolean {
  return issues.some(
    (issue) =>
      issue.category === 'expiry' ||
      issue.field?.includes('expiry') ||
      issue.message?.toLowerCase().includes('expired') ||
      issue.message?.toLowerCase().includes('months old')
  );
}

export const ComplianceTimingBlocker: React.FC<ComplianceTimingBlockerProps> = ({
  issues,
  tenancyStartDate,
  onEditCompliance,
}) => {
  // Filter to only show error-severity issues (not warnings)
  const blockingIssues = issues.filter((issue) => issue.severity === 'error');

  if (blockingIssues.length === 0) {
    return null;
  }

  // Determine if we have expiry issues to adjust the intro text
  const includesExpiryIssue = hasExpiryIssue(blockingIssues);

  // Build appropriate intro text based on issue types
  const introText = includesExpiryIssue
    ? 'Section 21 notices require certain compliance documents to be valid and provided at the right time. The following requirements have not been met:'
    : 'Section 21 notices are only valid if certain documents were provided to the tenant at the right time. The following requirements have not been met:';

  return (
    <Card
      id="compliance-timing-blocker"
      className="p-6 border-red-300 bg-red-50"
      padding="none"
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <RiErrorWarningLine className="h-5 w-5 text-red-600" aria-hidden="true" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          {/* Title */}
          <h2 className="text-lg font-semibold text-red-900 mb-2">
            We can&apos;t generate your Section 21 pack yet
          </h2>

          {/* Explanation - adjusted based on issue types */}
          <p className="text-sm text-red-800 mb-4">{introText}</p>

          {/* List of issues */}
          <ul className="space-y-3 mb-5" aria-label="Compliance issues">
            {blockingIssues.map((issue, index) => {
              // Get safe display values - NEVER expose raw field names
              const documentLabel = getSafeDocumentLabel(issue);
              const explanation = getSafeExplanation(issue);
              const formattedActual = formatDate(issue.actual);
              const formattedTenancyStart = formatDate(tenancyStartDate);

              // Determine if this is an expiry issue (certificate date) vs timing issue (provided date)
              const isExpiryIssue =
                issue.category === 'expiry' ||
                issue.field?.includes('expiry');

              // Use appropriate label based on issue type
              const actualDateLabel = isExpiryIssue
                ? 'Certificate date:'
                : 'Date recorded as provided:';

              return (
                <li
                  key={`issue-${index}`}
                  className="bg-white rounded-lg p-3 border border-red-200"
                >
                  <div className="font-medium text-red-900 mb-1">{documentLabel}</div>
                  <p className="text-sm text-red-700 mb-2">{explanation}</p>
                  <div className="text-xs text-red-600 space-y-0.5">
                    {/* Show expected value if present */}
                    {issue.expected && (
                      <div>
                        <span className="font-medium">Required:</span> {issue.expected}
                      </div>
                    )}
                    {/* Show tenancy start date for context - but not for expiry issues where it's irrelevant */}
                    {formattedTenancyStart && !isExpiryIssue && (
                      <div>
                        <span className="font-medium">Tenancy start date:</span>{' '}
                        {formattedTenancyStart}
                      </div>
                    )}
                    {/* Only show actual date if recorded */}
                    {formattedActual && (
                      <div>
                        <span className="font-medium">{actualDateLabel}</span>{' '}
                        {formattedActual}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Single CTA - No bypass option */}
          <button
            type="button"
            onClick={onEditCompliance}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            <RiEdit2Line className="h-4 w-4" aria-hidden="true" />
            Edit compliance details
          </button>

          {/* Softened legal note - no specific statute citation */}
          <p className="mt-4 text-xs text-red-600">
            These are legal requirements for a valid Section 21 notice in England. Courts may
            dismiss claims where these requirements are not met.
          </p>
        </div>
      </div>
    </Card>
  );
};

export default ComplianceTimingBlocker;
