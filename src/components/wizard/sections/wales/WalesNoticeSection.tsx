/**
 * Wales Notice Section - Notice Only Wizard
 *
 * Wales-specific replacement for NoticeSection.
 * Handles Section 173 (no-fault) and fault-based notices under RH(W)A 2016.
 *
 * Key differences from England NoticeSection:
 * - NO Section 21, Form 6A, or Housing Act 1988 references
 * - NO "How to Rent" guide compliance
 * - NO EPC compliance checks (handled differently in Wales)
 * - Uses RHW terminology and notice periods
 *
 * Notice periods (Wales):
 * - Section 173: 6 months minimum
 * - Fault-based (serious breach): 1 month minimum
 * - Fault-based (8+ weeks arrears): absolute ground
 */

'use client';

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import type { WizardFacts } from '@/lib/case-facts/schema';
import { RiCheckboxCircleLine } from 'react-icons/ri';

interface WalesNoticeSectionProps {
  facts: WizardFacts;
  jurisdiction: 'england' | 'wales';
  onUpdate: (updates: Record<string, any>) => void | Promise<void>;
  mode?: 'complete_pack' | 'notice_only';
}

const SERVICE_METHODS = [
  { value: 'first_class_post', label: 'First class post' },
  { value: 'recorded_delivery', label: 'Recorded delivery / signed for' },
  { value: 'hand_delivered', label: 'Hand delivered to contract holder' },
  { value: 'left_at_property', label: 'Left at the property' },
  { value: 'email', label: 'Email (if permitted by contract)' },
  { value: 'other', label: 'Other method' },
];

// Wales fault-based grounds under RH(W)A 2016
const WALES_FAULT_GROUNDS = [
  { value: 'rent_arrears_serious', label: 'Serious rent arrears (8+ weeks)', period: 14, mandatory: true },
  { value: 'rent_arrears_other', label: 'Other rent arrears', period: 30, mandatory: false },
  { value: 'breach_of_contract', label: 'Breach of occupation contract', period: 30, mandatory: false },
  { value: 'antisocial_behaviour', label: 'Antisocial behaviour', period: 14, mandatory: true },
  { value: 'false_statement', label: 'False statement to obtain contract', period: 30, mandatory: true },
  { value: 'domestic_abuse', label: 'Domestic abuse (perpetrator)', period: 14, mandatory: true },
  { value: 'estate_management', label: 'Estate management grounds', period: 60, mandatory: false },
];

export const WalesNoticeSection: React.FC<WalesNoticeSectionProps> = ({
  facts,
  onUpdate,
  mode = 'notice_only',
}) => {
  const evictionRoute = facts.eviction_route as 'section_173' | 'fault_based' | undefined;
  const isSection173 = evictionRoute === 'section_173';
  const isFaultBased = evictionRoute === 'fault_based';

  // Selected fault grounds
  const selectedGrounds = (facts.wales_fault_grounds as string[]) || [];

  // Track subflow completion for notice_only mode
  const [subflowComplete, setSubflowComplete] = useState(false);

  // Calculate minimum notice period based on route and grounds
  const minNoticePeriod = useMemo(() => {
    if (isSection173) return 180; // 6 months for Section 173

    if (isFaultBased && selectedGrounds.length > 0) {
      // Find shortest notice period among selected grounds
      let minPeriod = 60;
      selectedGrounds.forEach((ground) => {
        const groundInfo = WALES_FAULT_GROUNDS.find((g) => g.value === ground);
        if (groundInfo && groundInfo.period < minPeriod) {
          minPeriod = groundInfo.period;
        }
      });
      return minPeriod;
    }

    return 30; // Default for fault-based
  }, [isSection173, isFaultBased, selectedGrounds]);

  // Calculate suggested expiry date
  const today = new Date().toISOString().split('T')[0];
  const suggestedExpiryDate = useMemo(() => {
    const serviceDate = facts.notice_date || facts.notice_service_date || today;
    const date = new Date(serviceDate);
    date.setDate(date.getDate() + minNoticePeriod);
    return date.toISOString().split('T')[0];
  }, [facts.notice_date, facts.notice_service_date, minNoticePeriod, today]);

  // Initialize notice_date when entering this section
  useEffect(() => {
    if (!facts.notice_date && !facts.notice_service_date) {
      onUpdate({
        notice_date: today,
        notice_service_date: today,
      });
    }
  }, [facts.notice_date, facts.notice_service_date, today, onUpdate]);

  // Handle ground toggle for fault-based
  const handleGroundToggle = (ground: string) => {
    const newGrounds = selectedGrounds.includes(ground)
      ? selectedGrounds.filter((g) => g !== ground)
      : [...selectedGrounds, ground];
    onUpdate({ wales_fault_grounds: newGrounds });
  };

  // Check if section is complete
  const isComplete = useCallback(() => {
    if (!facts.notice_service_method) return false;
    if (!facts.notice_date && !facts.notice_service_date) return false;
    if (isFaultBased && selectedGrounds.length === 0) return false;
    return true;
  }, [facts.notice_service_method, facts.notice_date, facts.notice_service_date, isFaultBased, selectedGrounds]);

  // Handle completion
  const handleComplete = () => {
    const serviceDate = facts.notice_date || facts.notice_service_date || today;
    const updates: Record<string, any> = {
      notice_served_date: serviceDate,
      notice_date: serviceDate,
      notice_service_date: serviceDate,
      notice_expiry_date: facts.notice_expiry_date || suggestedExpiryDate,
    };
    onUpdate(updates);
    setSubflowComplete(true);
  };

  return (
    <div className="space-y-6">
      {/* Wales-specific header */}
      <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
        <h4 className="text-sm font-medium text-purple-900">
          {isSection173
            ? 'Generate Your Section 173 Notice'
            : 'Generate Your Fault-Based Notice'}
        </h4>
        <p className="text-sm text-purple-700 mt-1">
          {isSection173
            ? 'Section 173 of the Renting Homes (Wales) Act 2016 allows landlords to recover possession without giving a reason, subject to a 6-month notice period.'
            : 'Fault-based eviction under the Renting Homes (Wales) Act 2016 requires specific grounds such as rent arrears, breach of contract, or antisocial behaviour.'}
        </p>
      </div>

      {/* Section 173 flow */}
      {isSection173 && !subflowComplete && (
        <div className="space-y-6">
          {/* Section 173 compliance checks */}
          <div className="space-y-4">
            <h5 className="text-sm font-medium text-gray-700">Section 173 Requirements</h5>
            <p className="text-xs text-gray-500">
              Before serving a Section 173 notice, ensure these requirements are met.
            </p>

            {/* Rent Smart Wales registration */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Are you registered with Rent Smart Wales?
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="rent_smart_wales_registered"
                    checked={facts.rent_smart_wales_registered === true}
                    onChange={() => onUpdate({ rent_smart_wales_registered: true })}
                    className="mr-2"
                  />
                  Yes
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="rent_smart_wales_registered"
                    checked={facts.rent_smart_wales_registered === false}
                    onChange={() => onUpdate({ rent_smart_wales_registered: false })}
                    className="mr-2"
                  />
                  No
                </label>
              </div>
              {facts.rent_smart_wales_registered === false && (
                <p className="text-xs text-red-600 mt-1">
                  Section 173 cannot be used if you are not registered with Rent Smart Wales.
                </p>
              )}
            </div>

            {/* Written statement provided */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Was a written statement of the occupation contract provided?
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="written_statement_provided"
                    checked={facts.written_statement_provided === true}
                    onChange={() => onUpdate({ written_statement_provided: true })}
                    className="mr-2"
                  />
                  Yes
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="written_statement_provided"
                    checked={facts.written_statement_provided === false}
                    onChange={() => onUpdate({ written_statement_provided: false })}
                    className="mr-2"
                  />
                  No
                </label>
              </div>
              {facts.written_statement_provided === false && (
                <p className="text-xs text-red-600 mt-1">
                  Section 173 cannot be used if the written statement was not provided.
                </p>
              )}
            </div>

            {/* Deposit protection (if applicable) */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Did you take a deposit from the contract holder?
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="deposit_taken_wales"
                    checked={facts.deposit_taken === true}
                    onChange={() => onUpdate({ deposit_taken: true })}
                    className="mr-2"
                  />
                  Yes
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="deposit_taken_wales"
                    checked={facts.deposit_taken === false}
                    onChange={() => onUpdate({ deposit_taken: false })}
                    className="mr-2"
                  />
                  No
                </label>
              </div>
            </div>

            {/* Deposit protection - conditional */}
            {facts.deposit_taken === true && (
              <div className="space-y-2 pl-4 border-l-2 border-purple-200">
                <label className="block text-sm font-medium text-gray-700">
                  Is the deposit protected in an approved scheme?
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="deposit_protected_wales"
                      checked={facts.deposit_protected === true}
                      onChange={() => onUpdate({ deposit_protected: true })}
                      className="mr-2"
                    />
                    Yes
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="deposit_protected_wales"
                      checked={facts.deposit_protected === false}
                      onChange={() => onUpdate({ deposit_protected: false })}
                      className="mr-2"
                    />
                    No
                  </label>
                </div>
                {facts.deposit_protected === false && (
                  <p className="text-xs text-red-600 mt-1">
                    Section 173 cannot be used if the deposit is not protected.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Service details */}
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <h5 className="text-sm font-medium text-gray-700">Notice Service Details</h5>

            {/* Service date */}
            <div className="space-y-2">
              <label htmlFor="notice_date" className="block text-sm font-medium text-gray-700">
                Date you will serve the notice
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                id="notice_date"
                type="date"
                className="w-full max-w-xs rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
                value={facts.notice_date || facts.notice_service_date || today}
                onChange={(e) => onUpdate({
                  notice_date: e.target.value,
                  notice_service_date: e.target.value,
                })}
              />
            </div>

            {/* Service method */}
            <div className="space-y-2">
              <label htmlFor="notice_service_method" className="block text-sm font-medium text-gray-700">
                How will you serve the notice?
                <span className="text-red-500 ml-1">*</span>
              </label>
              <select
                id="notice_service_method"
                className="w-full max-w-md rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
                value={facts.notice_service_method || ''}
                onChange={(e) => onUpdate({ notice_service_method: e.target.value })}
              >
                <option value="">Select service method...</option>
                {SERVICE_METHODS.map((method) => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Expiry info */}
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-sm text-purple-800">
                <strong>Notice period:</strong> Section 173 requires a minimum of 6 months notice.
                Your notice will expire on or after <strong>{suggestedExpiryDate}</strong>.
              </p>
            </div>
          </div>

          {/* Complete button */}
          <button
            type="button"
            onClick={handleComplete}
            disabled={!isComplete()}
            className={`
              w-full py-3 px-6 text-sm font-medium rounded-lg transition-colors
              ${isComplete()
                ? 'bg-[#7C3AED] text-white hover:bg-[#6D28D9]'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'}
            `}
          >
            Complete Notice Setup
          </button>
        </div>
      )}

      {/* Fault-based flow */}
      {isFaultBased && !subflowComplete && (
        <div className="space-y-6">
          {/* Grounds selection */}
          <div className="space-y-4">
            <h5 className="text-sm font-medium text-gray-700">Select Grounds for Possession</h5>
            <p className="text-xs text-gray-500">
              Select all grounds that apply to your case. This determines the minimum notice period.
            </p>

            <div className="grid grid-cols-1 gap-2">
              {WALES_FAULT_GROUNDS.map((ground) => (
                <label
                  key={ground.value}
                  className={`
                    flex items-start p-3 border rounded-lg cursor-pointer transition-all
                    ${selectedGrounds.includes(ground.value)
                      ? 'border-[#7C3AED] bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}
                  `}
                >
                  <input
                    type="checkbox"
                    checked={selectedGrounds.includes(ground.value)}
                    onChange={() => handleGroundToggle(ground.value)}
                    className="mt-0.5 mr-2"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-900">
                      {ground.label}
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        ground.mandatory
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {ground.mandatory ? 'Absolute' : 'Discretionary'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {ground.period} days notice
                      </span>
                    </div>
                  </div>
                </label>
              ))}
            </div>

            {selectedGrounds.length > 0 && (
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-sm text-purple-800">
                  <strong>Selected:</strong> {selectedGrounds.length} ground(s)
                </p>
                <p className="text-xs text-purple-700 mt-1">
                  Minimum notice period: {minNoticePeriod} days
                </p>
              </div>
            )}
          </div>

          {/* Breach description for fault-based */}
          {selectedGrounds.length > 0 && (
            <div className="space-y-2">
              <label htmlFor="breach_description" className="block text-sm font-medium text-gray-700">
                Describe the breach or grounds
                <span className="text-red-500 ml-1">*</span>
              </label>
              <textarea
                id="breach_description"
                rows={4}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
                value={facts.breach_description || ''}
                onChange={(e) => onUpdate({ breach_description: e.target.value })}
                placeholder="Describe the specific breach or conduct that forms the basis of your claim..."
              />
              <p className="text-xs text-gray-500">
                Provide details of the breach. This will be included in your notice.
              </p>
            </div>
          )}

          {/* Service details */}
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <h5 className="text-sm font-medium text-gray-700">Notice Service Details</h5>

            {/* Service date */}
            <div className="space-y-2">
              <label htmlFor="notice_date_fault" className="block text-sm font-medium text-gray-700">
                Date you will serve the notice
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                id="notice_date_fault"
                type="date"
                className="w-full max-w-xs rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
                value={facts.notice_date || facts.notice_service_date || today}
                onChange={(e) => onUpdate({
                  notice_date: e.target.value,
                  notice_service_date: e.target.value,
                })}
              />
            </div>

            {/* Service method */}
            <div className="space-y-2">
              <label htmlFor="notice_service_method_fault" className="block text-sm font-medium text-gray-700">
                How will you serve the notice?
                <span className="text-red-500 ml-1">*</span>
              </label>
              <select
                id="notice_service_method_fault"
                className="w-full max-w-md rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
                value={facts.notice_service_method || ''}
                onChange={(e) => onUpdate({ notice_service_method: e.target.value })}
              >
                <option value="">Select service method...</option>
                {SERVICE_METHODS.map((method) => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Expiry date */}
            <div className="space-y-2">
              <label htmlFor="notice_expiry_date_fault" className="block text-sm font-medium text-gray-700">
                Notice expiry date
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="notice_expiry_date_fault"
                  type="date"
                  className="w-full max-w-xs rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
                  value={facts.notice_expiry_date || ''}
                  onChange={(e) => onUpdate({ notice_expiry_date: e.target.value })}
                />
                {!facts.notice_expiry_date && (
                  <button
                    type="button"
                    onClick={() => onUpdate({ notice_expiry_date: suggestedExpiryDate })}
                    className="text-sm text-[#7C3AED] hover:text-purple-700 underline"
                  >
                    Use suggested: {suggestedExpiryDate}
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Minimum {minNoticePeriod} days from service date.
              </p>
            </div>
          </div>

          {/* Complete button */}
          <button
            type="button"
            onClick={handleComplete}
            disabled={!isComplete() || !facts.breach_description}
            className={`
              w-full py-3 px-6 text-sm font-medium rounded-lg transition-colors
              ${isComplete() && facts.breach_description
                ? 'bg-[#7C3AED] text-white hover:bg-[#6D28D9]'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'}
            `}
          >
            Complete Notice Setup
          </button>
        </div>
      )}

      {/* Completion state */}
      {subflowComplete && (
        <div className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="text-sm font-medium text-green-800 flex items-center gap-2">
              <RiCheckboxCircleLine className="w-5 h-5" />
              Notice Setup Complete
            </h4>
            <p className="text-sm text-green-700 mt-1">
              Your {isSection173 ? 'Section 173' : 'fault-based'} notice will be generated
              when you complete the wizard.
            </p>
          </div>

          {/* Summary */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-2">
            <h5 className="text-sm font-medium text-gray-700">Notice Details Summary</h5>
            <dl className="text-sm">
              <div className="flex gap-2">
                <dt className="text-gray-500">Notice Type:</dt>
                <dd className="text-gray-900">
                  {isSection173 ? 'Section 173 (No-fault)' : 'Fault-based'}
                </dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-gray-500">Service Date:</dt>
                <dd className="text-gray-900">{facts.notice_date || facts.notice_service_date || '-'}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-gray-500">Service Method:</dt>
                <dd className="text-gray-900">
                  {SERVICE_METHODS.find((m) => m.value === facts.notice_service_method)?.label || '-'}
                </dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-gray-500">Expiry Date:</dt>
                <dd className="text-gray-900">{facts.notice_expiry_date || suggestedExpiryDate}</dd>
              </div>
              {isFaultBased && selectedGrounds.length > 0 && (
                <div className="flex gap-2">
                  <dt className="text-gray-500">Grounds:</dt>
                  <dd className="text-gray-900">
                    {selectedGrounds.map(g =>
                      WALES_FAULT_GROUNDS.find(wg => wg.value === g)?.label || g
                    ).join(', ')}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Edit button */}
          <button
            type="button"
            onClick={() => setSubflowComplete(false)}
            className="text-sm text-[#7C3AED] hover:text-purple-700 underline"
          >
            Edit notice details
          </button>
        </div>
      )}

      {/* Notice generation info */}
      {!subflowComplete && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg mt-6">
          <h5 className="text-sm font-medium text-green-800 flex items-center gap-2">
            <RiCheckboxCircleLine className="w-5 h-5 text-[#7C3AED]" />
            Notice Will Be Generated
          </h5>
          <p className="text-sm text-green-700 mt-1">
            Your {isSection173 ? 'Section 173' : 'fault-based'} notice will be generated
            using the Renting Homes (Wales) Act 2016 prescribed form.
          </p>
        </div>
      )}
    </div>
  );
};

export default WalesNoticeSection;
