'use client';

import React, { useMemo, useState } from 'react';
import {
  RiMoneyPoundCircleLine,
  RiInformationLine,
  RiExpandUpDownLine,
  RiCheckLine,
  RiComputerLine,
  RiFileTextLine,
} from 'react-icons/ri';
import {
  calculateCourtFee,
  formatFee,
  getFeeSummary,
  isWithinMCOLLimit,
  getAdditionalFeesInfo,
  type CourtFeeEstimate,
} from '@/lib/money-claim/court-fee-estimator';

interface CourtFeeEstimatorProps {
  /** Total claim amount in pounds */
  claimAmount: number;
  /** Show detailed breakdown */
  showDetails?: boolean;
  /** Compact mode for inline display */
  compact?: boolean;
}

/**
 * Court Fee Estimator Component
 *
 * Displays estimated County Court fees based on claim amount.
 * Uses official HMCTS fee bands and recommends online vs paper filing.
 */
export function CourtFeeEstimator({
  claimAmount,
  showDetails = false,
  compact = false,
}: CourtFeeEstimatorProps) {
  const [showAdditionalFees, setShowAdditionalFees] = useState(false);

  const summary = useMemo(() => getFeeSummary(claimAmount), [claimAmount]);
  const withinMCOL = useMemo(() => isWithinMCOLLimit(claimAmount), [claimAmount]);
  const additionalFees = useMemo(() => getAdditionalFeesInfo(), []);

  if (claimAmount <= 0) {
    return null;
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <RiMoneyPoundCircleLine className="w-4 h-4 text-gray-500" />
        <span className="text-gray-600">Estimated court fee:</span>
        <span className="font-semibold text-gray-900">
          {formatFee(summary.estimate.onlineFee)}
        </span>
        {summary.savings > 0 && (
          <span className="text-green-600 text-xs">(online)</span>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <RiMoneyPoundCircleLine className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Estimated Court Fees</h3>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Main fee display */}
        <div className="grid gap-3 sm:grid-cols-2">
          {/* Online Fee */}
          <div
            className={`rounded-lg p-4 border-2 ${
              summary.recommended === 'online'
                ? 'border-green-300 bg-green-50'
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <RiComputerLine className="w-4 h-4 text-green-600" />
              <span className="font-medium text-gray-900">Online (MCOL)</span>
              {summary.recommended === 'online' && (
                <span className="ml-auto text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <RiCheckLine className="w-3 h-3" />
                  Recommended
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatFee(summary.estimate.onlineFee)}
            </p>
            {summary.savings > 0 && (
              <p className="text-xs text-green-600 mt-1">
                Save {formatFee(summary.savings)} vs paper filing
              </p>
            )}
          </div>

          {/* Paper Fee */}
          <div
            className={`rounded-lg p-4 border-2 ${
              summary.recommended === 'paper'
                ? 'border-amber-300 bg-amber-50'
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <RiFileTextLine className="w-4 h-4 text-gray-600" />
              <span className="font-medium text-gray-900">Paper Filing</span>
              {summary.recommended === 'paper' && (
                <span className="ml-auto text-xs font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                  Required
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatFee(summary.estimate.paperFee)}
            </p>
            {!withinMCOL && (
              <p className="text-xs text-amber-600 mt-1">
                Claims over £100,000 require paper filing
              </p>
            )}
          </div>
        </div>

        {/* Fee band info */}
        <div className="text-sm text-gray-600">
          <span className="font-medium">Fee band:</span> {summary.estimate.band}
        </div>

        {/* Total with fee */}
        <div className="rounded-md bg-purple-50 border border-purple-200 p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-purple-800">Total claim + court fee:</span>
            <span className="text-lg font-bold text-purple-900">
              {formatFee(summary.totalWithFee)}
            </span>
          </div>
        </div>

        {/* Additional fees dropdown */}
        {showDetails && (
          <div className="border-t border-gray-200 pt-3">
            <button
              type="button"
              onClick={() => setShowAdditionalFees(!showAdditionalFees)}
              className="flex items-center justify-between w-full text-sm text-gray-600 hover:text-gray-900"
            >
              <span className="font-medium">Other potential fees</span>
              <RiExpandUpDownLine
                className={`w-4 h-4 transition-transform ${showAdditionalFees ? 'rotate-180' : ''}`}
              />
            </button>

            {showAdditionalFees && (
              <div className="mt-3 space-y-2">
                {additionalFees.map((fee, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-xs text-gray-600 py-1 border-b border-gray-100 last:border-0"
                  >
                    <span>{fee.description}</span>
                    <span className="font-medium">{fee.fee}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Disclaimer */}
        <div className="flex items-start gap-2 text-xs text-gray-500 bg-gray-50 rounded p-2">
          <RiInformationLine className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p>{summary.estimate.disclaimer}</p>
        </div>
      </div>
    </div>
  );
}

export default CourtFeeEstimator;
