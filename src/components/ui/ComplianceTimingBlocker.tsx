/**
 * Compliance Timing Blocker Component
 *
 * User-friendly error panel displayed when Section 21 pack generation is blocked
 * due to compliance timing violations. Shows clear, actionable information without
 * exposing internal error codes.
 *
 * Requirements:
 * - No internal error codes visible to users (gas_safety_timing, how_to_rent_timing, etc.)
 * - Clear title: "We can't generate your Section 21 pack yet"
 * - Short explanation about document timing requirements
 * - Bullet list of failed items with document name, tenancy start date, and date provided
 * - Single CTA: "Edit compliance details" (no bypass option)
 *
 * @module ComplianceTimingBlocker
 */

'use client';

import React from 'react';
import { RiErrorWarningLine, RiEdit2Line } from 'react-icons/ri';
import { Card } from './Card';

/**
 * Individual compliance timing issue from the validation result.
 * Internal field names are mapped to user-friendly document names.
 */
export interface ComplianceTimingIssue {
  field: string;
  message: string;
  expected?: string;
  actual?: string;
  severity: 'error' | 'warning';
}

export interface ComplianceTimingBlockerProps {
  /** List of compliance timing issues that are blocking generation */
  issues: ComplianceTimingIssue[];
  /** Tenancy start date (YYYY-MM-DD format) */
  tenancyStartDate?: string;
  /** Callback when user clicks "Edit compliance details" */
  onEditCompliance: () => void;
}

/**
 * Maps internal field codes to user-friendly document names.
 * Technical codes should never be shown to users.
 */
const FIELD_TO_DOCUMENT_NAME: Record<string, string> = {
  'epc_timing': 'Energy Performance Certificate (EPC)',
  'gas_safety_timing': 'Gas Safety Certificate (CP12)',
  'gas_safety_expiry': 'Gas Safety Certificate (CP12)',
  'how_to_rent_timing': 'How to Rent Guide',
  'prescribed_info_timing': 'Deposit Prescribed Information',
};

/**
 * Gets user-friendly explanation for each document type.
 */
const DOCUMENT_EXPLANATIONS: Record<string, string> = {
  'epc_timing': 'The EPC must be provided to the tenant before the tenancy starts.',
  'gas_safety_timing': 'A gas safety record must be given to the tenant before they move in.',
  'gas_safety_expiry': 'The current gas safety certificate must be less than 12 months old.',
  'how_to_rent_timing': 'The How to Rent guide must be provided before the tenancy starts.',
  'prescribed_info_timing': 'Deposit prescribed information must be served within 30 days of receiving the deposit.',
};

/**
 * Formats a date string to a user-friendly format (e.g., "15 January 2024").
 */
function formatDate(dateStr?: string): string {
  if (!dateStr) return 'Not recorded';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
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

  return (
    <Card
      id="compliance-timing-blocker"
      className="p-6 border-red-300 bg-red-50"
      padding="none"
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <RiErrorWarningLine className="h-5 w-5 text-red-600" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          {/* Title */}
          <h2 className="text-lg font-semibold text-red-900 mb-2">
            We can&apos;t generate your Section 21 pack yet
          </h2>

          {/* Explanation */}
          <p className="text-sm text-red-800 mb-4">
            Section 21 notices are only valid if certain documents were provided to the tenant
            at the right time. The following timing requirements have not been met:
          </p>

          {/* List of issues */}
          <ul className="space-y-3 mb-5">
            {blockingIssues.map((issue, index) => {
              const documentName = FIELD_TO_DOCUMENT_NAME[issue.field] || issue.field;
              const explanation = DOCUMENT_EXPLANATIONS[issue.field] || issue.message;

              return (
                <li
                  key={`${issue.field}-${index}`}
                  className="bg-white rounded-lg p-3 border border-red-200"
                >
                  <div className="font-medium text-red-900 mb-1">{documentName}</div>
                  <p className="text-sm text-red-700 mb-2">{explanation}</p>
                  <div className="text-xs text-red-600 space-y-0.5">
                    {tenancyStartDate && (
                      <div>
                        <span className="font-medium">Tenancy start date:</span>{' '}
                        {formatDate(tenancyStartDate)}
                      </div>
                    )}
                    {issue.actual && (
                      <div>
                        <span className="font-medium">Date recorded as provided:</span>{' '}
                        {formatDate(issue.actual)}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Single CTA - No bypass option */}
          <button
            onClick={onEditCompliance}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            <RiEdit2Line className="h-4 w-4" />
            Edit compliance details
          </button>

          {/* Legal note */}
          <p className="mt-4 text-xs text-red-600">
            These are statutory requirements under the Deregulation Act 2015 and related housing
            regulations. Courts will dismiss Section 21 claims if these requirements are not met.
          </p>
        </div>
      </div>
    </Card>
  );
};

export default ComplianceTimingBlocker;
