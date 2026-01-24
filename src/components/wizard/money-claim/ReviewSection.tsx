'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { RiCheckboxCircleLine } from 'react-icons/ri';

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
 * Calculate total arrears from items
 */
function calculateTotalArrears(facts: any): number {
  const items = facts?.arrears_items || facts?.issues?.rent_arrears?.arrears_items || [];

  if (items.length === 0) {
    return facts?.total_arrears || facts?.issues?.rent_arrears?.total_arrears || 0;
  }

  return items.reduce((total: number, item: any) => {
    const due = item.rent_due || 0;
    const paid = item.rent_paid || 0;
    return total + (due - paid);
  }, 0);
}

/**
 * Calculate total damages from items
 */
function calculateTotalDamages(facts: any): number {
  const items = facts?.money_claim?.damage_items || [];
  return items.reduce((total: number, item: any) => total + (item.amount || 0), 0);
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

  // Calculate claim types and totals
  const claimTypes = useMemo(() => getSelectedClaimTypes(facts), [facts]);
  const totalArrears = useMemo(() =>
    facts?.claiming_rent_arrears ? calculateTotalArrears(facts) : 0,
    [facts]
  );
  const totalDamages = useMemo(() => calculateTotalDamages(facts), [facts]);
  const grandTotal = totalArrears + totalDamages;

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
        You've completed all the required sections. Before you purchase your pack,
        we'll analyse your case against the Pre-Action Protocol for Debt Claims
        and show you any issues that need attention.
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
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {totalArrears > 0 && (
            <div className="bg-white rounded-md p-3 border border-gray-200">
              <p className="text-xs text-gray-500">Rent arrears</p>
              <p className="text-lg font-semibold text-charcoal">{formatCurrency(totalArrears)}</p>
            </div>
          )}
          {totalDamages > 0 && (
            <div className="bg-white rounded-md p-3 border border-gray-200">
              <p className="text-xs text-gray-500">Other amounts</p>
              <p className="text-lg font-semibold text-charcoal">{formatCurrency(totalDamages)}</p>
            </div>
          )}
          {grandTotal > 0 && (
            <div className="bg-purple-50 rounded-md p-3 border border-purple-200">
              <p className="text-xs text-purple-700 font-medium">Total claim</p>
              <p className="text-lg font-bold text-purple-900">{formatCurrency(grandTotal)}</p>
            </div>
          )}
        </div>

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
          className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Continue to Full Analysis
        </button>
      </div>

      <p className="text-xs text-gray-500 mt-2">
        The full analysis will check your case against PAP-DEBT requirements and
        highlight any issues before you proceed to payment.
      </p>
    </div>
  );
};
