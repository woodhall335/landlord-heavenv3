/**
 * Scotland Notice Section - Eviction Wizard
 *
 * Handles Notice to Leave details for Scotland, including:
 * - 6-MONTH RULE VALIDATION: Notice cannot be served within first 6 months of tenancy
 * - Notice period calculation based on selected ground (from config)
 * - Service methods
 * - ARREARS SCHEDULE: Conditional arrears collection for Ground 18 (rent arrears)
 *
 * CRITICAL: Enforces the 6-month rule which is unique to Scotland.
 */

'use client';

import React, { useMemo, useEffect } from 'react';
import type { WizardFacts } from '@/lib/case-facts/schema';
import {
  validateSixMonthRule,
  getScotlandGroundByNumber,
  calculateEarliestEvictionDate,
  getScotlandConfig,
} from '@/lib/scotland/grounds';
import { ArrearsScheduleStep } from '../../ArrearsScheduleStep';

// Scotland Ground 18 is the rent arrears ground (3 consecutive months)
const SCOTLAND_RENT_ARREARS_GROUND = 18;

interface ScotlandNoticeSectionProps {
  facts: WizardFacts;
  onUpdate: (updates: Record<string, any>) => void | Promise<void>;
  /** Optional callback to set the current question ID for Ask Heaven context */
  onSetCurrentQuestionId?: (fieldId: string | undefined) => void;
}

export const ScotlandNoticeSection: React.FC<ScotlandNoticeSectionProps> = ({
  facts,
  onUpdate,
  onSetCurrentQuestionId,
}) => {
  const config = getScotlandConfig();

  // Check if Ground 18 (rent arrears) is selected
  const isRentArrearsGround = facts.scotland_eviction_ground === SCOTLAND_RENT_ARREARS_GROUND;

  // Set current question ID for Ask Heaven context when section renders
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
  const tenancyStartDate = facts.tenancy_start_date as string | undefined;
  const selectedGround = facts.scotland_eviction_ground as number | undefined;
  const groundData = selectedGround ? getScotlandGroundByNumber(selectedGround) : undefined;

  const noticeServedDate = facts.notice_served_date as string | undefined;
  const noticeServiceMethod = facts.notice_service_method as string | undefined;
  const noticeAlreadyServed = facts.notice_already_served as boolean | undefined;

  // Validate 6-month rule
  const sixMonthValidation = useMemo(() => {
    if (!tenancyStartDate) return { valid: true, message: undefined };
    return validateSixMonthRule(tenancyStartDate);
  }, [tenancyStartDate]);

  // Calculate earliest eviction date if notice served
  const earliestEvictionDate = useMemo(() => {
    if (!noticeServedDate || !selectedGround) return null;
    const date = calculateEarliestEvictionDate(selectedGround, noticeServedDate);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }, [noticeServedDate, selectedGround]);

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

      {/* Scotland Arrears Schedule - Only for Ground 18 (Rent Arrears) */}
      {isRentArrearsGround && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-semibold text-amber-800 flex items-center gap-2">
              <span className="text-lg">📋</span>
              Ground 18 - Rent Arrears Schedule Required
            </h4>
            <p className="text-amber-700 text-sm mt-2">
              Ground 18 requires evidence of rent arrears for 3 or more consecutive months.
              Complete the schedule below to document each rent period.
            </p>
          </div>

          <div
            className="bg-white border border-gray-200 rounded-lg p-4"
            onFocus={() => onSetCurrentQuestionId?.('arrears_items')}
          >
            <ArrearsScheduleStep
              facts={facts}
              onUpdate={onUpdate}
              jurisdiction="scotland"
            />
          </div>

          {/* Scotland 3-month threshold info */}
          {(() => {
            const arrearsItems = facts.issues?.rent_arrears?.arrears_items || facts.arrears_items || [];
            if (!Array.isArray(arrearsItems) || arrearsItems.length === 0) return null;

            const periodsWithArrears = arrearsItems.filter(
              (item: any) => (item.amount_owed ?? (item.rent_due - item.rent_paid)) > 0
            ).length;

            return (
              <div className={`rounded-lg border p-4 ${
                periodsWithArrears >= 3
                  ? 'bg-green-50 border-green-200'
                  : 'bg-amber-50 border-amber-200'
              }`}>
                <p className={`text-sm font-medium ${
                  periodsWithArrears >= 3 ? 'text-green-800' : 'text-amber-800'
                }`}>
                  {periodsWithArrears >= 3
                    ? '✓ Ground 18 Threshold Met'
                    : '⚠ Ground 18 Threshold Not Yet Met'}
                </p>
                <p className={`text-sm mt-1 ${
                  periodsWithArrears >= 3 ? 'text-green-700' : 'text-amber-700'
                }`}>
                  {periodsWithArrears} period{periodsWithArrears !== 1 ? 's' : ''} with arrears.
                  {periodsWithArrears < 3
                    ? ` Ground 18 requires 3 or more consecutive months of arrears.`
                    : ` The Tribunal will consider whether eviction is reasonable.`}
                </p>
              </div>
            );
          })()}
        </div>
      )}

      {/* Notice Status */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Have you already served a Notice to Leave?
          <span className="text-red-500 ml-1">*</span>
        </label>

        <div className="space-y-2">
          <label
            className={`
              flex items-start p-4 border rounded-lg cursor-pointer transition-all
              ${noticeAlreadyServed === true
                ? 'border-[#7C3AED] bg-purple-50 ring-2 ring-purple-200'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}
            `}
          >
            <input
              type="radio"
              name="notice_already_served"
              checked={noticeAlreadyServed === true}
              onChange={() => onUpdate({ notice_already_served: true })}
              className="mt-1 mr-3"
            />
            <div>
              <span className="font-medium text-gray-900">Yes, I have already served notice</span>
              <p className="text-sm text-gray-600 mt-1">
                Enter the details of the notice you have already served.
              </p>
            </div>
          </label>

          <label
            className={`
              flex items-start p-4 border rounded-lg cursor-pointer transition-all
              ${noticeAlreadyServed === false
                ? 'border-[#7C3AED] bg-purple-50 ring-2 ring-purple-200'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}
            `}
          >
            <input
              type="radio"
              name="notice_already_served"
              checked={noticeAlreadyServed === false}
              onChange={() => onUpdate({ notice_already_served: false })}
              className="mt-1 mr-3"
            />
            <div>
              <span className="font-medium text-gray-900">No, I need to generate a Notice to Leave</span>
              <p className="text-sm text-gray-600 mt-1">
                We will generate a Notice to Leave for you based on your selected ground.
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Notice Details (if already served) */}
      {noticeAlreadyServed === true && (
        <div className="space-y-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="font-medium text-gray-900">Notice Details</h4>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Date Notice Served
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="date"
              value={noticeServedDate || ''}
              onChange={(e) => onUpdate({ notice_served_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-200 focus:border-purple-500"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Service Method
              <span className="text-red-500 ml-1">*</span>
            </label>
            <select
              value={noticeServiceMethod || ''}
              onChange={(e) => onUpdate({ notice_service_method: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-200 focus:border-purple-500"
            >
              <option value="">Select service method...</option>
              {config.noticeRequirements.serviceMethods.map((method, i) => (
                <option key={i} value={method.toLowerCase().replace(/\s+/g, '_')}>
                  {method}
                </option>
              ))}
            </select>
          </div>

          {/* Earliest Eviction Date */}
          {earliestEvictionDate && (
            <div className="mt-4 p-3 bg-white border border-gray-200 rounded">
              <p className="text-sm text-gray-600">
                <strong>Earliest eviction date:</strong>{' '}
                <span className="text-gray-900">{earliestEvictionDate}</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                You can apply to the Tribunal after this date if the tenant has not vacated.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Notice Generation (if not served yet) */}
      {noticeAlreadyServed === false && (
        <div className="space-y-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <h4 className="font-medium text-purple-900">Notice to Leave Will Be Generated</h4>
          <p className="text-purple-700 text-sm">
            We will generate a Notice to Leave for you using{' '}
            {groundData ? `${groundData.code} (${groundData.name})` : 'your selected ground'}.
          </p>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-purple-800">
              Planned Service Method
            </label>
            <select
              value={noticeServiceMethod || ''}
              onChange={(e) => onUpdate({ notice_service_method: e.target.value })}
              className="w-full px-3 py-2 border border-purple-300 rounded-md focus:ring-2 focus:ring-purple-200 focus:border-purple-500 bg-white"
            >
              <option value="">Select how you plan to serve notice...</option>
              {config.noticeRequirements.serviceMethods.map((method, i) => (
                <option key={i} value={method.toLowerCase().replace(/\s+/g, '_')}>
                  {method}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

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
