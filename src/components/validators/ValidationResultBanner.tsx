/**
 * Validation Result Banner Component
 *
 * Displays a prominent, sticky banner at the top of validation results
 * showing the overall status (valid/high_risk/invalid/wrong_doc_type)
 * with a short summary sentence.
 */

'use client';

import React from 'react';
import {
  RiCheckboxCircleFill,
  RiAlertFill,
  RiCloseCircleFill,
  RiQuestionFill,
  RiShieldCheckLine,
  RiErrorWarningFill,
} from 'react-icons/ri';

interface ValidationResultBannerProps {
  status: string;
  blockersCount: number;
  warningsCount: number;
  /** Whether this is a terminal blocker (wrong document type) */
  isTerminalBlocker?: boolean;
  /** Custom summary message (optional) */
  summaryMessage?: string;
  /** Whether to make the banner sticky */
  sticky?: boolean;
  className?: string;
}

type BannerStatus = 'valid' | 'warning' | 'high_risk' | 'invalid' | 'wrong_doc_type' | 'needs_info' | 'unknown';

const STATUS_CONFIG: Record<BannerStatus, {
  label: string;
  summary: string;
  icon: React.ReactNode;
  bgGradient: string;
  textColor: string;
  borderColor: string;
  iconBg: string;
}> = {
  valid: {
    label: 'Valid',
    summary: 'Your notice appears to meet legal requirements.',
    icon: <RiCheckboxCircleFill className="h-8 w-8" />,
    bgGradient: 'bg-gradient-to-r from-green-50 to-green-100',
    textColor: 'text-green-800',
    borderColor: 'border-green-300',
    iconBg: 'bg-green-200 text-green-700',
  },
  warning: {
    label: 'Valid with Warnings',
    summary: 'Your notice appears valid but has potential risks to review.',
    icon: <RiAlertFill className="h-8 w-8" />,
    bgGradient: 'bg-gradient-to-r from-amber-50 to-amber-100',
    textColor: 'text-amber-800',
    borderColor: 'border-amber-300',
    iconBg: 'bg-amber-200 text-amber-700',
  },
  high_risk: {
    label: 'High Risk',
    summary: 'Multiple issues found that may affect your case.',
    icon: <RiErrorWarningFill className="h-8 w-8" />,
    bgGradient: 'bg-gradient-to-r from-orange-50 to-orange-100',
    textColor: 'text-orange-800',
    borderColor: 'border-orange-300',
    iconBg: 'bg-orange-200 text-orange-700',
  },
  invalid: {
    label: 'Invalid',
    summary: 'Critical issues found that will likely invalidate your notice.',
    icon: <RiCloseCircleFill className="h-8 w-8" />,
    bgGradient: 'bg-gradient-to-r from-red-50 to-red-100',
    textColor: 'text-red-800',
    borderColor: 'border-red-300',
    iconBg: 'bg-red-200 text-red-700',
  },
  wrong_doc_type: {
    label: 'Wrong Document',
    summary: 'The uploaded document does not match the expected type.',
    icon: <RiCloseCircleFill className="h-8 w-8" />,
    bgGradient: 'bg-gradient-to-r from-red-50 to-red-100',
    textColor: 'text-red-800',
    borderColor: 'border-red-300',
    iconBg: 'bg-red-200 text-red-700',
  },
  needs_info: {
    label: 'More Info Needed',
    summary: 'Answer some questions to complete the validation.',
    icon: <RiQuestionFill className="h-8 w-8" />,
    bgGradient: 'bg-gradient-to-r from-blue-50 to-blue-100',
    textColor: 'text-blue-800',
    borderColor: 'border-blue-300',
    iconBg: 'bg-blue-200 text-blue-700',
  },
  unknown: {
    label: 'Analyzing',
    summary: 'Validation in progress.',
    icon: <RiShieldCheckLine className="h-8 w-8" />,
    bgGradient: 'bg-gradient-to-r from-gray-50 to-gray-100',
    textColor: 'text-gray-700',
    borderColor: 'border-gray-300',
    iconBg: 'bg-gray-200 text-gray-600',
  },
};

function normalizeStatus(
  status: string,
  blockersCount: number,
  warningsCount: number,
  isTerminalBlocker: boolean
): BannerStatus {
  if (isTerminalBlocker) return 'wrong_doc_type';

  // Map common status strings to our banner statuses
  const statusLower = status.toLowerCase();

  if (statusLower === 'pass' || statusLower === 'valid') {
    if (warningsCount > 0) return 'warning';
    return 'valid';
  }

  if (statusLower === 'warning' || statusLower === 'valid_with_warnings') {
    return 'warning';
  }

  if (statusLower === 'high_risk' || statusLower === 'discretionary_only') {
    return 'high_risk';
  }

  if (statusLower === 'invalid' || statusLower === 'fail') {
    return 'invalid';
  }

  if (statusLower === 'needs_info' || statusLower === 'incomplete') {
    return 'needs_info';
  }

  // Ground 8 specific statuses
  if (statusLower === 'ground_8_satisfied') {
    if (warningsCount > 0) return 'warning';
    return 'valid';
  }

  // Derive from counts if status is ambiguous
  if (blockersCount > 0) return 'invalid';
  if (warningsCount > 2) return 'high_risk';
  if (warningsCount > 0) return 'warning';

  return 'unknown';
}

export function ValidationResultBanner({
  status,
  blockersCount,
  warningsCount,
  isTerminalBlocker = false,
  summaryMessage,
  sticky = true,
  className = '',
}: ValidationResultBannerProps) {
  const normalizedStatus = normalizeStatus(status, blockersCount, warningsCount, isTerminalBlocker);
  const config = STATUS_CONFIG[normalizedStatus];

  const stickyClass = sticky ? 'sticky top-0 z-10' : '';

  return (
    <div
      className={`
        ${config.bgGradient} ${config.borderColor}
        border-2 rounded-xl p-4 md:p-5 shadow-sm
        ${stickyClass}
        ${className}
      `}
    >
      <div className="flex items-center gap-4">
        {/* Icon */}
        <div className={`flex-shrink-0 p-3 rounded-full ${config.iconBg}`}>
          {config.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className={`text-xl md:text-2xl font-bold ${config.textColor}`}>
            {config.label}
          </h3>
          <p className={`mt-1 text-sm md:text-base ${config.textColor} opacity-80`}>
            {summaryMessage || config.summary}
          </p>
        </div>

        {/* Stats badges */}
        <div className="hidden sm:flex flex-col gap-2 text-right">
          {blockersCount > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-medium">
              <RiCloseCircleFill className="h-4 w-4" />
              {blockersCount} blocker{blockersCount !== 1 ? 's' : ''}
            </span>
          )}
          {warningsCount > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-sm font-medium">
              <RiAlertFill className="h-4 w-4" />
              {warningsCount} warning{warningsCount !== 1 ? 's' : ''}
            </span>
          )}
          {blockersCount === 0 && warningsCount === 0 && normalizedStatus === 'valid' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
              <RiCheckboxCircleFill className="h-4 w-4" />
              All checks passed
            </span>
          )}
        </div>
      </div>

      {/* Mobile stats */}
      <div className="flex sm:hidden gap-2 mt-3 pt-3 border-t border-black/10">
        {blockersCount > 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium">
            <RiCloseCircleFill className="h-3 w-3" />
            {blockersCount} blocker{blockersCount !== 1 ? 's' : ''}
          </span>
        )}
        {warningsCount > 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
            <RiAlertFill className="h-3 w-3" />
            {warningsCount} warning{warningsCount !== 1 ? 's' : ''}
          </span>
        )}
        {blockersCount === 0 && warningsCount === 0 && normalizedStatus === 'valid' && (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
            <RiCheckboxCircleFill className="h-3 w-3" />
            All checks passed
          </span>
        )}
      </div>
    </div>
  );
}
