'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  RiCheckboxCircleLine,
  RiErrorWarningLine,
  RiAlertLine,
  RiLightbulbLine,
  RiArrowRightLine,
} from 'react-icons/ri';
import {
  validateMoneyClaimClient,
  groupBySection,
  getSectionLabel,
  type ValidationIssue,
  type ClientValidationResult,
} from '@/lib/validation/money-claim-client-validator';

interface SectionProps {
  facts?: any;
  caseId: string;
  jurisdiction?: string; // Always England for money claims
}

/**
 * Get selected claim types from facts
 */
function getSelectedClaimTypes(facts: any): { id: string; label: string }[] {
  const types: { id: string; label: string }[] = [];

  if (facts?.claiming_rent_arrears === true) {
    types.push({ id: 'rent_arrears', label: 'Rent arrears' });
  }

  const otherTypes: string[] = facts?.money_claim?.other_amounts_types || [];

  if (otherTypes.includes('property_damage') || facts?.claiming_damages === true) {
    types.push({ id: 'property_damage', label: 'Property damage' });
  }
  if (otherTypes.includes('cleaning')) {
    types.push({ id: 'cleaning', label: 'Cleaning costs' });
  }
  if (otherTypes.includes('unpaid_utilities')) {
    types.push({ id: 'unpaid_utilities', label: 'Unpaid utilities' });
  }
  if (otherTypes.includes('unpaid_council_tax')) {
    types.push({ id: 'unpaid_council_tax', label: 'Unpaid council tax' });
  }
  if (facts?.claiming_other === true || otherTypes.includes('other_charges')) {
    types.push({ id: 'other_tenant_debt', label: 'Other debt' });
  }

  return types;
}

/**
 * Format currency for display
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Validation Issue Item Component
 */
function ValidationItem({
  issue,
  severity,
}: {
  issue: ValidationIssue;
  severity: 'blocker' | 'warning' | 'suggestion';
}) {
  const config = {
    blocker: {
      icon: RiErrorWarningLine,
      bg: 'bg-red-50',
      border: 'border-red-200',
      iconColor: 'text-red-600',
      textColor: 'text-red-800',
    },
    warning: {
      icon: RiAlertLine,
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      iconColor: 'text-amber-600',
      textColor: 'text-amber-800',
    },
    suggestion: {
      icon: RiLightbulbLine,
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      iconColor: 'text-blue-600',
      textColor: 'text-blue-800',
    },
  }[severity];

  const Icon = config.icon;

  return (
    <div className={`flex items-start gap-2 p-2 rounded-md ${config.bg} ${config.border} border`}>
      <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${config.iconColor}`} />
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${config.textColor}`}>{issue.message}</p>
        {issue.evidenceHint && (
          <p className="text-xs text-gray-500 mt-1 italic">{issue.evidenceHint}</p>
        )}
      </div>
    </div>
  );
}

/**
 * Validation Panel Component
 */
function ValidationPanel({ validation }: { validation: ClientValidationResult }) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const sections = useMemo(() => groupBySection(validation), [validation]);

  const hasBlockers = validation.blockers.length > 0;
  const hasWarnings = validation.warnings.length > 0;
  const hasSuggestions = validation.suggestions.length > 0;

  // Get sections with issues
  const sectionsWithIssues = Object.entries(sections).filter(
    ([, s]) => s.blockers.length > 0 || s.warnings.length > 0 || (showSuggestions && s.suggestions.length > 0)
  );

  if (!hasBlockers && !hasWarnings && !hasSuggestions) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
        <div className="flex items-center gap-2">
          <RiCheckboxCircleLine className="w-5 h-5 text-green-600" />
          <p className="font-medium text-green-800">All validation checks passed</p>
        </div>
        <p className="text-sm text-green-700 mt-1">Your case is ready for document generation.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="flex flex-wrap gap-3 text-sm">
        {hasBlockers && (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded-full font-medium">
            <RiErrorWarningLine className="w-3.5 h-3.5" />
            {validation.blockers.length} {validation.blockers.length === 1 ? 'blocker' : 'blockers'}
          </span>
        )}
        {hasWarnings && (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-800 rounded-full font-medium">
            <RiAlertLine className="w-3.5 h-3.5" />
            {validation.warnings.length} {validation.warnings.length === 1 ? 'warning' : 'warnings'}
          </span>
        )}
        {hasSuggestions && (
          <button
            onClick={() => setShowSuggestions(!showSuggestions)}
            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full font-medium hover:bg-blue-200 transition-colors"
          >
            <RiLightbulbLine className="w-3.5 h-3.5" />
            {validation.suggestions.length} {validation.suggestions.length === 1 ? 'tip' : 'tips'}
            <span className="text-xs ml-1">({showSuggestions ? 'hide' : 'show'})</span>
          </button>
        )}
      </div>

      {/* Blockers alert */}
      {hasBlockers && (
        <div className="rounded-lg border-2 border-red-300 bg-red-50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <RiErrorWarningLine className="w-5 h-5 text-red-600" />
            <p className="font-semibold text-red-800">Required information missing</p>
          </div>
          <p className="text-sm text-red-700">
            Please complete the following before you can generate your pack:
          </p>
        </div>
      )}

      {/* Issues grouped by section */}
      {sectionsWithIssues.map(([sectionId, sectionIssues]) => (
        <div key={sectionId} className="rounded-lg border border-gray-200 bg-white overflow-hidden">
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
            <h4 className="font-medium text-gray-900 text-sm">{getSectionLabel(sectionId)}</h4>
          </div>
          <div className="p-3 space-y-2">
            {sectionIssues.blockers.map((issue) => (
              <ValidationItem key={issue.id} issue={issue} severity="blocker" />
            ))}
            {sectionIssues.warnings.map((issue) => (
              <ValidationItem key={issue.id} issue={issue} severity="warning" />
            ))}
            {showSuggestions &&
              sectionIssues.suggestions.map((issue) => (
                <ValidationItem key={issue.id} issue={issue} severity="suggestion" />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export const ReviewSection: React.FC<SectionProps> = ({
  facts,
  caseId,
}) => {
  // Get interest status from facts
  const moneyClaim = facts?.money_claim || {};
  const chargeInterest = moneyClaim.charge_interest === true;
  const interestRate = moneyClaim.interest_rate || 8;
  const router = useRouter();
  const [previewing, setPreviewing] = useState(false);

  // Run validation
  const validation = useMemo(() => validateMoneyClaimClient(facts || {}), [facts]);

  // Calculate claim types for display
  const claimTypes = useMemo(() => getSelectedClaimTypes(facts), [facts]);

  const handlePreview = async () => {
    try {
      setPreviewing(true);
      // Open the HTML preview in a new tab/window
      window.open(
        `/api/money-claim/preview/${encodeURIComponent(caseId)}`,
        '_blank'
      );
    } finally {
      setPreviewing(false);
    }
  };

  const handleProceedToReview = () => {
    // Navigate to the full review page with analysis
    router.push(`/wizard/review?case_id=${caseId}&product=money_claim`);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Review your case information below. We&apos;ve checked your data against the Pre-Action
        Protocol for Debt Claims (PAP-DEBT) requirements.
      </p>

      {/* Claim Summary Card */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-4">
        {/* Claim types */}
        {claimTypes.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Claiming for
            </p>
            <div className="flex flex-wrap gap-2">
              {claimTypes.map((type) => (
                <span
                  key={type.id}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full"
                >
                  <RiCheckboxCircleLine className="w-3 h-3" />
                  {type.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Claim totals */}
        {validation.totalClaimAmount > 0 && (
          <div className="bg-purple-50 rounded-md p-3 border border-purple-200">
            <p className="text-xs text-purple-700 font-medium">Total claim amount</p>
            <p className="text-xl font-bold text-purple-900">{formatCurrency(validation.totalClaimAmount)}</p>
          </div>
        )}

        {/* Meta info */}
        <div className="flex flex-wrap gap-4 text-sm pt-2 border-t border-gray-200">
          <p>
            <span className="font-medium text-gray-600">Case ID:</span>{' '}
            <span className="text-charcoal">{caseId}</span>
          </p>
          <p>
            <span className="font-medium text-gray-600">Jurisdiction:</span>{' '}
            <span className="text-charcoal">England</span>
          </p>
          <p>
            <span className="font-medium text-gray-600">Interest:</span>{' '}
            {chargeInterest ? (
              <span className="text-green-700">{interestRate}% statutory</span>
            ) : (
              <span className="text-gray-500">Not claimed</span>
            )}
          </p>
        </div>
      </div>

      {/* Validation Panel */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Case Validation</h3>
        <ValidationPanel validation={validation} />
      </div>

      {/* Ask Heaven Features Banner */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="text-3xl mr-3">☁️</div>
          <div>
            <h4 className="font-semibold text-charcoal mb-1">
              Ask Heaven Legal Drafting Included
            </h4>
            <p className="text-sm text-gray-600">
              Your Particulars of Claim and Letter Before Action will be professionally
              drafted by Ask Heaven, saving you £300-600 in solicitor fees.
            </p>
          </div>
        </div>
      </div>

      {/* What's included summary */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-2">Your pack will include:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Form N1 - Money Claim Form (official PDF)</li>
          <li>• Particulars of Claim (AI-drafted)</li>
          <li>• Schedule of Arrears / Debt</li>
          {chargeInterest && <li>• Interest Calculation</li>}
          <li>• Letter Before Claim (PAP-DEBT compliant)</li>
          <li>• Information Sheet for Defendants</li>
          <li>• Reply Form & Financial Statement Form</li>
          <li>• Court Filing Guide</li>
          <li>• Enforcement Guide</li>
        </ul>
        {!chargeInterest && (
          <p className="text-xs text-gray-500 mt-2 italic">
            Interest calculation not included (you chose not to claim interest)
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handlePreview}
          disabled={previewing}
          className="inline-flex items-center rounded-md border border-indigo-600 px-4 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 disabled:opacity-60"
        >
          {previewing ? 'Preparing preview…' : 'Preview draft documents'}
        </button>

        <button
          type="button"
          onClick={handleProceedToReview}
          disabled={validation.blockers.length > 0}
          className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          Continue to Full Analysis
          <RiArrowRightLine className="w-4 h-4" />
        </button>
      </div>

      {validation.blockers.length > 0 ? (
        <p className="text-xs text-red-600 mt-2">
          Please resolve the blockers above before proceeding to the full analysis.
        </p>
      ) : validation.warnings.length > 0 ? (
        <p className="text-xs text-amber-600 mt-2">
          You can proceed with warnings, but addressing them will strengthen your case.
        </p>
      ) : (
        <p className="text-xs text-gray-500 mt-2">
          The full analysis will provide AI-powered review and final checks before payment.
        </p>
      )}
    </div>
  );
};
