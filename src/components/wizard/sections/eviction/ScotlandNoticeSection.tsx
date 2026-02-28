/**
 * Scotland Notice Section - Notice Only (GENERATE ONLY)
 *
 * For Scotland notice_only product, this section is GENERATE ONLY:
 * - We do NOT ask "Have you already served a Notice to Leave?"
 * - We ALWAYS generate a new Notice to Leave for the user
 *
 * Handles Notice to Leave generation for Scotland, including:
 * - 6-MONTH RULE VALIDATION: Notice cannot be served within first 6 months of tenancy
 * - Notice period calculation based on selected ground (from config)
 * - Service methods (planned, for the notice we will generate)
 * - ARREARS SCHEDULE: Conditional arrears collection for Ground 18 (rent arrears)
 * - CONSECUTIVE ARREARS STREAK: Ground 18 requires 3+ consecutive months
 * - GROUND PARTICULARS: Textarea with Ask Heaven enhancement
 *
 * CRITICAL: Enforces the 6-month rule which is unique to Scotland.
 */

'use client';

import React, { useMemo, useEffect, useCallback } from 'react';
import type { WizardFacts } from '@/lib/case-facts/schema';
import {
  validateSixMonthRule,
  getScotlandGroundByNumber,
  getScotlandConfig,
} from '@/lib/scotland/grounds';
import {
  calculateConsecutiveArrearsStreak,
  mapScotlandServiceMethodToKey,
} from '@/lib/scotland/notice-utils';
import { buildScotlandParticularsStatement } from '@/lib/scotland/noticeNarrativeBuilder';
import { ArrearsScheduleStep } from '../../ArrearsScheduleStep';
import { AskHeavenInlineEnhancer } from '@/components/wizard/AskHeavenInlineEnhancer';

// Scotland Ground 18 is the rent arrears ground (3 consecutive months)
const SCOTLAND_RENT_ARREARS_GROUND = 18;

interface ScotlandNoticeSectionProps {
  facts: WizardFacts;
  onUpdate: (updates: Record<string, any>) => void | Promise<void>;
  /** Optional callback to set the current question ID for Ask Heaven context */
  onSetCurrentQuestionId?: (fieldId: string | undefined) => void;
  /** Case ID for Ask Heaven API calls */
  caseId?: string;
}

export const ScotlandNoticeSection: React.FC<ScotlandNoticeSectionProps> = ({
  facts,
  onUpdate,
  onSetCurrentQuestionId,
  caseId,
}) => {
  const config = getScotlandConfig();

  // Check if Ground 18 (rent arrears) is selected
  const isRentArrearsGround = facts.scotland_eviction_ground === SCOTLAND_RENT_ARREARS_GROUND;
  const selectedGround = facts.scotland_eviction_ground as number | undefined;
  const groundParticulars = (facts.scotland_ground_particulars as string) || '';

  // Set current question ID for Ask Heaven context when section renders
  // Default to notice_service_method, but switch to arrears_items when user interacts with arrears
  useEffect(() => {
    if (onSetCurrentQuestionId) {
      onSetCurrentQuestionId('notice_service_method');
    }
    return () => {
      if (onSetCurrentQuestionId) {
        onSetCurrentQuestionId(undefined);
      }
    };
  }, [onSetCurrentQuestionId]);

  // Handler for when user focuses on arrears schedule
  const handleArrearsContainerFocus = useCallback(() => {
    onSetCurrentQuestionId?.('arrears_items');
  }, [onSetCurrentQuestionId]);

  // Handler for when user focuses on service method
  const handleServiceMethodFocus = useCallback(() => {
    onSetCurrentQuestionId?.('notice_service_method');
  }, [onSetCurrentQuestionId]);

  // Handler for when user focuses on ground particulars
  const handleParticularsFocus = useCallback(() => {
    onSetCurrentQuestionId?.('scotland_ground_particulars');
  }, [onSetCurrentQuestionId]);

  // "Use gathered details as starting point" handler for particulars
  const handleUseGatheredDetails = useCallback(() => {
    const { suggestedText } = buildScotlandParticularsStatement(facts as any);
    onUpdate({ scotland_ground_particulars: suggestedText });
  }, [facts, onUpdate]);

  const tenancyStartDate = facts.tenancy_start_date as string | undefined;
  const groundData = selectedGround ? getScotlandGroundByNumber(selectedGround) : undefined;

  const noticeServiceMethod = facts.notice_service_method as string | undefined;

  // Validate 6-month rule
  const sixMonthValidation = useMemo(() => {
    if (!tenancyStartDate) return { valid: true, message: undefined };
    return validateSixMonthRule(tenancyStartDate);
  }, [tenancyStartDate]);

  return (
    <div className="space-y-6">
      {/* 6-Month Rule Warning */}
      {!sixMonthValidation.valid && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-semibold text-red-800 flex items-center gap-2">
            <span className="text-lg">🚫</span>
            Cannot Serve Notice Yet - 6-Month Rule
          </h4>
          <p className="text-red-700 text-sm mt-2">
            {sixMonthValidation.message}
          </p>
          <p className="text-red-600 text-sm mt-2 font-medium">
            Earliest notice date: {sixMonthValidation.earliestNoticeDate}
          </p>
        </div>
      )}

      {/* 6-Month Rule Info (when valid) */}
      {sixMonthValidation.valid && tenancyStartDate && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-green-800 flex items-center gap-2">
            <span className="text-lg">✓</span>
            6-Month Rule Passed
          </h4>
          <p className="text-green-700 text-sm mt-2">
            The tenancy started on{' '}
            {new Date(tenancyStartDate).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
            . You are now eligible to serve a Notice to Leave.
          </p>
        </div>
      )}

      {/* Notice Period Display */}
      {groundData && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800">Notice Period</h4>
          <p className="text-blue-700 mt-2">
            For <strong>{groundData.code} ({groundData.name})</strong>, you must give{' '}
            <strong>{groundData.noticePeriodDays} days</strong> notice.
          </p>
        </div>
      )}

      {/* Scotland Arrears Schedule - FIRST for Ground 18 (Rent Arrears) */}
      {/* REORDERED: Arrears schedule now comes BEFORE particulars per task requirements */}
      {isRentArrearsGround && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-semibold text-amber-800 flex items-center gap-2">
              <span className="text-lg">📋</span>
              Ground 18 - Rent Arrears Schedule Required
            </h4>
            <p className="text-amber-700 text-sm mt-2">
              Ground 18 requires evidence of rent arrears for 3 or more consecutive rent periods.
              Complete the schedule below to document each rent period.
            </p>
          </div>

          <div
            className="bg-white border border-gray-200 rounded-lg p-4"
            onFocusCapture={handleArrearsContainerFocus}
          >
            <ArrearsScheduleStep
              facts={facts}
              onUpdate={onUpdate}
              jurisdiction="scotland"
            />
          </div>

          {/* Scotland 3-month consecutive threshold info */}
          {(() => {
            const arrearsItems = facts.issues?.rent_arrears?.arrears_items || facts.arrears_items || [];
            if (!Array.isArray(arrearsItems) || arrearsItems.length === 0) return null;

            // Use consecutive streak calculation for Ground 18
            const streakResult = calculateConsecutiveArrearsStreak(arrearsItems);
            const { maxConsecutiveStreak, periodsWithArrears } = streakResult;
            const thresholdMet = maxConsecutiveStreak >= 3;

            return (
              <div className={`rounded-lg border p-4 ${
                thresholdMet
                  ? 'bg-green-50 border-green-200'
                  : 'bg-amber-50 border-amber-200'
              }`}>
                <p className={`text-sm font-medium ${
                  thresholdMet ? 'text-green-800' : 'text-amber-800'
                }`}>
                  {thresholdMet
                    ? '✓ Ground 18 Threshold Met'
                    : '⚠ Ground 18 Threshold Not Yet Met'}
                </p>
                <p className={`text-sm mt-1 ${
                  thresholdMet ? 'text-green-700' : 'text-amber-700'
                }`}>
                  {thresholdMet ? (
                    <>
                      {maxConsecutiveStreak} consecutive rent period{maxConsecutiveStreak !== 1 ? 's' : ''} with arrears
                      ({periodsWithArrears} total period{periodsWithArrears !== 1 ? 's' : ''} with arrears).
                      The Tribunal will consider whether eviction is reasonable.
                    </>
                  ) : (
                    <>
                      {maxConsecutiveStreak} consecutive rent period{maxConsecutiveStreak !== 1 ? 's' : ''} with arrears
                      ({periodsWithArrears} total period{periodsWithArrears !== 1 ? 's' : ''} with arrears).
                      Ground 18 requires 3 or more consecutive rent periods of arrears.
                    </>
                  )}
                </p>
                {!thresholdMet && periodsWithArrears >= 3 && maxConsecutiveStreak < 3 && (
                  <p className="text-sm mt-2 text-amber-600 italic">
                    Note: You have {periodsWithArrears} periods with arrears, but they are not all consecutive.
                    Ground 18 requires arrears in 3 consecutive rent periods.
                  </p>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* Ground details & supporting statement - CONSOLIDATED (replaces duplicate evidence/particulars fields) */}
      {/* UPDATED per task requirements: Single field combining evidence description + statement of particulars */}
      {groundData && (
        <div
          className="space-y-3 p-4 bg-gray-50 border border-gray-200 rounded-lg"
          onFocusCapture={handleParticularsFocus}
        >
          <label htmlFor="ground_particulars" className="block text-sm font-medium text-gray-800">
            Ground details &amp; supporting statement
          </label>
          <p className="text-xs text-gray-600">
            {isRentArrearsGround ? (
              <>Summarise the rent arrears and supporting details. This will be included in your Notice to Leave.</>
            ) : (
              <>Provide details supporting your eviction ground. This will be included in your Notice to Leave.</>
            )}
          </p>

          {/* "Use gathered details" button - auto-populates from arrears schedule for Ground 18 */}
          <div className="mt-2">
            <button
              type="button"
              onClick={handleUseGatheredDetails}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-md hover:bg-purple-100 transition-colors"
            >
              <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {isRentArrearsGround
                ? 'Auto-generate from arrears schedule'
                : 'Use gathered details as starting point'}
            </button>
          </div>

          <textarea
            id="ground_particulars"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] bg-white"
            rows={8}
            value={groundParticulars}
            onChange={(e) => onUpdate({ scotland_ground_particulars: e.target.value })}
            placeholder={isRentArrearsGround
              ? `Click "Auto-generate from arrears schedule" above to populate this with your arrears details (rent amount, unpaid periods, total arrears). You can then edit as needed.`
              : `Describe the specific circumstances supporting ${groundData.code}. Include relevant dates, amounts, and any correspondence.`}
          />

          {/* Ask Heaven inline enhancer */}
          <div className="mt-2">
            <AskHeavenInlineEnhancer
              caseId={caseId}
              questionId="scotland_ground_particulars"
              answer={groundParticulars}
              onApply={(newText) => onUpdate({ scotland_ground_particulars: newText })}
              questionText="Provide details supporting your eviction ground for the Notice to Leave"
              context={{
                jurisdiction: 'scotland',
                ground_number: selectedGround,
                ground_name: groundData?.name,
                field_type: 'ground_particulars',
              }}
              apiMode="generic"
              minChars={20}
              buttonLabel="Enhance with Ask Heaven"
              helperText="AI will improve clarity and tribunal-readiness"
              compact
            />
          </div>
        </div>
      )}

      {/* Notice Generation - GENERATE ONLY (Scotland notice_only) */}
      <div
        className="space-y-4 p-4 bg-purple-50 border border-purple-200 rounded-lg"
        onFocusCapture={handleServiceMethodFocus}
      >
        <h4 className="font-medium text-purple-900">Notice to Leave Will Be Generated</h4>
        <p className="text-purple-700 text-sm">
          We will generate a Notice to Leave for you using{' '}
          {groundData ? `${groundData.code} (${groundData.name})` : 'your selected ground'}.
        </p>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-purple-800">
            Planned Service Method
            <span className="text-red-500 ml-1">*</span>
          </label>
          <select
            value={noticeServiceMethod || ''}
            onChange={(e) => onUpdate({ notice_service_method: e.target.value })}
            className="w-full px-3 py-2 border border-purple-300 rounded-md focus:ring-2 focus:ring-purple-200 focus:border-purple-500 bg-white"
          >
            <option value="">Select how you plan to serve notice...</option>
            {config.noticeRequirements.serviceMethods.map((method, i) => (
              <option key={i} value={mapScotlandServiceMethodToKey(method)}>
                {method}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Service Methods Info */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700">Valid Service Methods (Scotland)</h4>
        <ul className="bg-gray-50 rounded-lg p-4 space-y-2">
          {config.noticeRequirements.serviceMethods.map((method, i) => (
            <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
              <span>•</span>
              <span>{method}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
