/**
 * Notice Section - Eviction Wizard
 *
 * Step 5: Collects notice service details.
 *
 * CRITICAL: This section REUSES the same schema keys as notice-only flows,
 * so data from a previous notice-only flow can be pre-populated.
 *
 * NEW: Supports inline "No Notice Yet" flow:
 * - Gating question: "Have you already served a valid notice?"
 * - If YES: show current notice service inputs
 * - If NO: embed notice-only questions inline (reuses config/mqs/notice_only/england.yaml)
 *
 * Fields:
 * - notice_already_served: Boolean gating question
 * - notice_served_date: Date the notice was served on tenant(s)
 * - notice_service_method: How the notice was delivered (required for N5B)
 * - notice_expiry_date: Optional - auto-calculated if not provided
 * - section8_grounds: For Section 8, which grounds are being relied upon
 * - section8_details: Particulars for each ground
 *
 * Notice periods (England):
 * - Section 21: 2 months minimum
 * - Section 8 Ground 8: 14 days minimum
 * - Section 8 Grounds 10/11: 2 months minimum
 * - Section 8 Ground 14 (serious): 14 days minimum
 */

'use client';

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import type { WizardFacts } from '@/lib/case-facts/schema';
import { RiCheckboxCircleLine } from 'react-icons/ri';

interface NoticeSectionProps {
  facts: WizardFacts;
  jurisdiction: 'england' | 'wales';
  onUpdate: (updates: Record<string, any>) => void | Promise<void>;
  /** Mode: 'complete_pack' shows gating question, 'notice_only' skips it */
  mode?: 'complete_pack' | 'notice_only';
}

const SERVICE_METHODS = [
  { value: 'first_class_post', label: 'First class post' },
  { value: 'recorded_delivery', label: 'Recorded delivery / signed for' },
  { value: 'hand_delivered', label: 'Hand delivered to tenant' },
  { value: 'left_at_property', label: 'Left at the property' },
  { value: 'email', label: 'Email (if permitted by tenancy)' },
  { value: 'other', label: 'Other method' },
];

// Section 8 grounds with notice periods
const SECTION_8_GROUNDS = [
  { value: 'Ground 1', label: 'Ground 1 - Landlord occupation', period: 60, mandatory: true },
  { value: 'Ground 2', label: 'Ground 2 - Mortgage lender', period: 60, mandatory: true },
  { value: 'Ground 7', label: 'Ground 7 - Tenant death', period: 60, mandatory: false },
  { value: 'Ground 7A', label: 'Ground 7A - Serious offence', period: 14, mandatory: true },
  { value: 'Ground 8', label: 'Ground 8 - 2+ months rent arrears', period: 14, mandatory: true },
  { value: 'Ground 10', label: 'Ground 10 - Rent arrears', period: 60, mandatory: false },
  { value: 'Ground 11', label: 'Ground 11 - Persistent delay', period: 60, mandatory: false },
  { value: 'Ground 12', label: 'Ground 12 - Breach of tenancy', period: 60, mandatory: false },
  { value: 'Ground 13', label: 'Ground 13 - Waste or neglect', period: 60, mandatory: false },
  { value: 'Ground 14', label: 'Ground 14 - Nuisance or annoyance', period: 14, mandatory: false },
  { value: 'Ground 14A', label: 'Ground 14A - Domestic violence', period: 14, mandatory: true },
  { value: 'Ground 15', label: 'Ground 15 - Damaged furniture', period: 60, mandatory: false },
  { value: 'Ground 17', label: 'Ground 17 - False statement', period: 60, mandatory: false },
];

// =============================================================================
// INLINE NOTICE-ONLY SUBFLOW
// =============================================================================
// This component renders the notice-only questions inline for users who have
// not yet served a notice. It reuses the schema from config/mqs/notice_only/england.yaml
// by rendering the relevant questions based on the eviction route.
// =============================================================================

interface InlineNoticeSubflowProps {
  facts: WizardFacts;
  isSection8: boolean;
  onUpdate: (updates: Record<string, any>) => void | Promise<void>;
  onComplete: () => void;
}

/**
 * Inline notice-only subflow for generating notices within the eviction wizard.
 *
 * For Section 21: Collects deposit & compliance checks required for Form 6A.
 * For Section 8: Collects grounds and particulars required for Form 3.
 *
 * This component uses the SAME field keys as config/mqs/notice_only/england.yaml
 * to ensure data compatibility and avoid duplication.
 */
const InlineNoticeSubflow: React.FC<InlineNoticeSubflowProps> = ({
  facts,
  isSection8,
  onUpdate,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState<'compliance' | 'grounds' | 'service' | 'complete'>(
    isSection8 ? 'grounds' : 'compliance'
  );

  // Section 8 grounds selection (reuses same keys as notice-only schema)
  const selectedGrounds = (facts.section8_grounds as string[]) || [];

  // Calculate minimum notice period based on selected grounds
  const minNoticePeriod = useMemo(() => {
    if (!isSection8) return 60; // Section 21 = 2 months
    if (selectedGrounds.length === 0) return 14;
    let maxPeriod = 14;
    selectedGrounds.forEach((ground) => {
      const groundInfo = SECTION_8_GROUNDS.find((g) => g.value === ground);
      if (groundInfo && groundInfo.period > maxPeriod) {
        maxPeriod = groundInfo.period;
      }
    });
    return maxPeriod;
  }, [isSection8, selectedGrounds]);

  // Calculate suggested service and expiry dates
  const today = new Date().toISOString().split('T')[0];
  const suggestedExpiryDate = useMemo(() => {
    const serviceDate = facts.notice_service_date || today;
    const date = new Date(serviceDate);
    date.setDate(date.getDate() + minNoticePeriod);
    return date.toISOString().split('T')[0];
  }, [facts.notice_service_date, minNoticePeriod, today]);

  // Initialize notice_service_date with today when entering service step
  // This ensures the displayed default value is also saved to facts
  useEffect(() => {
    if (currentStep === 'service' && !facts.notice_service_date) {
      onUpdate({ notice_service_date: today });
    }
  }, [currentStep, facts.notice_service_date, today, onUpdate]);

  // Handle ground toggle
  const handleGroundToggle = (ground: string) => {
    const newGrounds = selectedGrounds.includes(ground)
      ? selectedGrounds.filter((g) => g !== ground)
      : [...selectedGrounds, ground];
    onUpdate({ section8_grounds: newGrounds });
  };

  // Check if current step is complete
  const isStepComplete = useCallback(() => {
    switch (currentStep) {
      case 'compliance':
        // For S21: deposit checks must be answered
        if (facts.deposit_taken === undefined) return false;
        if (facts.deposit_taken === true) {
          if (facts.deposit_protected === undefined) return false;
          if (facts.prescribed_info_served === undefined) return false;
        }
        if (facts.has_gas_appliances === undefined) return false;
        if (facts.has_gas_appliances === true && facts.gas_safety_cert_served === undefined) return false;
        if (facts.epc_served === undefined) return false;
        if (facts.how_to_rent_served === undefined) return false;
        return true;
      case 'grounds':
        // For S8: at least one ground must be selected
        // Particulars are now collected in the Arrears section (after arrears data is known)
        return selectedGrounds.length > 0;
      case 'service':
        // Service details must be complete
        return Boolean(facts.notice_service_date) && Boolean(facts.notice_service_method);
      default:
        return true;
    }
  }, [currentStep, facts, selectedGrounds]);

  // Handle step navigation
  const handleNext = () => {
    if (currentStep === 'compliance') {
      setCurrentStep('service');
    } else if (currentStep === 'grounds') {
      setCurrentStep('service');
    } else if (currentStep === 'service') {
      // Auto-populate eviction wizard notice fields from subflow data
      const updates: Record<string, any> = {
        notice_served_date: facts.notice_service_date || today,
        notice_expiry_date: facts.notice_expiry_date || suggestedExpiryDate,
        // Map service_method to notice_service_method (canonical key)
        notice_service_method: facts.notice_service_method || facts.service_method,
      };
      onUpdate(updates);
      setCurrentStep('complete');
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep === 'service') {
      setCurrentStep(isSection8 ? 'grounds' : 'compliance');
    }
  };

  // Get step number and total
  const totalSteps = isSection8 ? 2 : 2; // grounds/compliance + service
  const currentStepNum = currentStep === 'service' ? 2 : 1;

  return (
    <div className="space-y-6 border-l-4 border-[#7C3AED] pl-4 bg-purple-50/30 py-4 rounded-r-lg">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-purple-800">
            Generate Notice - Step {currentStepNum} of {totalSteps}
          </h4>
          <p className="text-xs text-[#7C3AED] mt-1">
            Complete these questions to generate your {isSection8 ? 'Section 8' : 'Section 21'} notice
          </p>
        </div>
      </div>

      {/* Section 21 Compliance Step */}
      {!isSection8 && currentStep === 'compliance' && (
        <div className="space-y-4">
          <h5 className="text-sm font-medium text-gray-700">Deposit & Compliance Checks</h5>
          <p className="text-xs text-gray-500">
            Section 21 notices have strict compliance requirements. We need to check these before generating your notice.
          </p>

          {/* Deposit taken */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Did you take a deposit from the tenant?
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="deposit_taken"
                  checked={facts.deposit_taken === true}
                  onChange={() => onUpdate({ deposit_taken: true })}
                  className="mr-2"
                />
                Yes
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="deposit_taken"
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
            <>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Is the deposit protected in an approved scheme?
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="deposit_protected"
                      checked={facts.deposit_protected === true}
                      onChange={() => onUpdate({ deposit_protected: true })}
                      className="mr-2"
                    />
                    Yes
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="deposit_protected"
                      checked={facts.deposit_protected === false}
                      onChange={() => onUpdate({ deposit_protected: false })}
                      className="mr-2"
                    />
                    No
                  </label>
                </div>
                {facts.deposit_protected === false && (
                  <p className="text-xs text-red-600 mt-1">
                    ⚠️ Section 21 cannot be used if the deposit is not protected.
                  </p>
                )}
              </div>

              {facts.deposit_protected === true && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Was prescribed information given within 30 days?
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="prescribed_info_served"
                        checked={facts.prescribed_info_served === true}
                        onChange={() => onUpdate({ prescribed_info_served: true })}
                        className="mr-2"
                      />
                      Yes
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="prescribed_info_served"
                        checked={facts.prescribed_info_served === false}
                        onChange={() => onUpdate({ prescribed_info_served: false })}
                        className="mr-2"
                      />
                      No
                    </label>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Gas appliances */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Does the property have gas appliances?
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="has_gas_appliances"
                  checked={facts.has_gas_appliances === true}
                  onChange={() => onUpdate({ has_gas_appliances: true })}
                  className="mr-2"
                />
                Yes
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="has_gas_appliances"
                  checked={facts.has_gas_appliances === false}
                  onChange={() => onUpdate({ has_gas_appliances: false })}
                  className="mr-2"
                />
                No
              </label>
            </div>
          </div>

          {/* Gas safety cert - conditional */}
          {facts.has_gas_appliances === true && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Was a valid gas safety certificate provided?
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="gas_safety_cert_served"
                    checked={facts.gas_safety_cert_served === true}
                    onChange={() => onUpdate({ gas_safety_cert_served: true })}
                    className="mr-2"
                  />
                  Yes
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="gas_safety_cert_served"
                    checked={facts.gas_safety_cert_served === false}
                    onChange={() => onUpdate({ gas_safety_cert_served: false })}
                    className="mr-2"
                  />
                  No
                </label>
              </div>
            </div>
          )}

          {/* EPC */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Was an EPC provided before tenancy started?
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="epc_served"
                  checked={facts.epc_served === true}
                  onChange={() => onUpdate({ epc_served: true })}
                  className="mr-2"
                />
                Yes
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="epc_served"
                  checked={facts.epc_served === false}
                  onChange={() => onUpdate({ epc_served: false })}
                  className="mr-2"
                />
                No
              </label>
            </div>
          </div>

          {/* How to Rent */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Was the 'How to Rent' guide provided?
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="how_to_rent_served"
                  checked={facts.how_to_rent_served === true}
                  onChange={() => onUpdate({ how_to_rent_served: true })}
                  className="mr-2"
                />
                Yes
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="how_to_rent_served"
                  checked={facts.how_to_rent_served === false}
                  onChange={() => onUpdate({ how_to_rent_served: false })}
                  className="mr-2"
                />
                No
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Section 8 Grounds Step */}
      {isSection8 && currentStep === 'grounds' && (
        <div className="space-y-4">
          <h5 className="text-sm font-medium text-gray-700">Section 8 Grounds</h5>
          <p className="text-xs text-gray-500">
            Select all grounds that apply to your case. This determines the minimum notice period.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {SECTION_8_GROUNDS.map((ground) => (
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
                      {ground.mandatory ? 'Mandatory' : 'Discretionary'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {ground.period} days
                    </span>
                  </div>
                </div>
              </label>
            ))}
          </div>

          {selectedGrounds.length > 0 && (
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-sm text-purple-800">
                <strong>Selected:</strong> {selectedGrounds.join(', ')}
              </p>
              <p className="text-xs text-purple-700 mt-1">
                Minimum notice period: {minNoticePeriod} days
              </p>
              <p className="text-xs text-[#7C3AED] mt-2">
                You&apos;ll provide the particulars for these grounds after completing the arrears schedule.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Service Details Step */}
      {currentStep === 'service' && (
        <div className="space-y-4">
          <h5 className="text-sm font-medium text-gray-700">Notice Service Details</h5>
          <p className="text-xs text-gray-500">
            When and how will you serve this notice?
          </p>

          {/* Service date */}
          <div className="space-y-2">
            <label htmlFor="notice_service_date" className="block text-sm font-medium text-gray-700">
              Date you will serve the notice
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              id="notice_service_date"
              type="date"
              className="w-full max-w-xs rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
              value={facts.notice_service_date || today}
              onChange={(e) => onUpdate({ notice_service_date: e.target.value })}
            />
          </div>

          {/* Service method */}
          <div className="space-y-2">
            <label htmlFor="notice_service_method_inline" className="block text-sm font-medium text-gray-700">
              How will you serve the notice?
              <span className="text-red-500 ml-1">*</span>
            </label>
            <select
              id="notice_service_method_inline"
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
            <label htmlFor="notice_expiry_date_inline" className="block text-sm font-medium text-gray-700">
              Notice expiry date
            </label>
            <div className="flex items-center gap-3">
              <input
                id="notice_expiry_date_inline"
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

          {/* Notice generation info */}
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h5 className="text-sm font-medium text-green-800 flex items-center gap-2">
              <RiCheckboxCircleLine className="w-5 h-5 text-[#7C3AED]" />
              Notice Will Be Generated
            </h5>
            <p className="text-sm text-green-700 mt-1">
              Your {isSection8 ? 'Form 3 (Section 8)' : 'Form 6A (Section 21)'} notice will be
              generated and included in your eviction pack when you complete the wizard.
            </p>
          </div>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-purple-200">
        {currentStep === 'service' ? (
          <button
            type="button"
            onClick={handleBack}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            ← Back
          </button>
        ) : (
          <div />
        )}

        <button
          type="button"
          onClick={handleNext}
          disabled={!isStepComplete()}
          className={`
            px-4 py-2 text-sm font-medium rounded-md transition-colors
            ${isStepComplete()
              ? 'bg-[#7C3AED] text-white hover:bg-[#6D28D9]'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'}
          `}
        >
          {currentStep === 'service' ? 'Complete Notice Setup →' : 'Next →'}
        </button>
      </div>
    </div>
  );
};

export const NoticeSection: React.FC<NoticeSectionProps> = ({
  facts,
  onUpdate,
  mode = 'complete_pack',
}) => {
  const isSection8 = facts.eviction_route === 'section_8';
  const selectedGrounds = (facts.section8_grounds as string[]) || [];

  // Track whether the inline subflow is complete
  const [subflowComplete, setSubflowComplete] = useState(false);

  // For notice_only mode, skip the gating question - user is here to generate a notice
  // For complete_pack mode, show gating question to check if they already have a notice
  const isNoticeOnlyMode = mode === 'notice_only';

  // Derive the notice status from facts
  // notice_already_served: true = already served, false = need to generate
  // In notice_only mode, we always treat it as "need to generate"
  const noticeAlreadyServed = isNoticeOnlyMode ? false : facts.notice_already_served;

  // Calculate minimum notice period based on selected grounds
  const minNoticePeriod = useMemo(() => {
    if (!isSection8) return 60; // Section 21 = 2 months

    if (selectedGrounds.length === 0) return 14; // Default minimum

    // Find the maximum notice period among selected grounds
    // (when multiple grounds, the longest period applies)
    let maxPeriod = 14;
    selectedGrounds.forEach((ground) => {
      const groundInfo = SECTION_8_GROUNDS.find((g) => g.value === ground);
      if (groundInfo && groundInfo.period > maxPeriod) {
        maxPeriod = groundInfo.period;
      }
    });
    return maxPeriod;
  }, [isSection8, selectedGrounds]);

  // Calculate suggested expiry date
  const suggestedExpiryDate = useMemo(() => {
    if (!facts.notice_served_date) return null;
    const servedDate = new Date(facts.notice_served_date);
    const expiryDate = new Date(servedDate);
    expiryDate.setDate(expiryDate.getDate() + minNoticePeriod);
    return expiryDate.toISOString().split('T')[0];
  }, [facts.notice_served_date, minNoticePeriod]);

  // Handle ground selection
  const handleGroundToggle = (ground: string) => {
    const newGrounds = selectedGrounds.includes(ground)
      ? selectedGrounds.filter((g) => g !== ground)
      : [...selectedGrounds, ground];
    onUpdate({ section8_grounds: newGrounds });
  };

  // Handle subflow completion
  const handleSubflowComplete = useCallback(() => {
    setSubflowComplete(true);
  }, []);

  // Reset subflow state when switching back to "no"
  useEffect(() => {
    if (noticeAlreadyServed === false && subflowComplete) {
      // Keep subflow complete state if user hasn't changed their answer
    } else if (noticeAlreadyServed === true) {
      setSubflowComplete(false);
    }
  }, [noticeAlreadyServed, subflowComplete]);

  return (
    <div className="space-y-6">
      {/* ================================================================== */}
      {/* GATING QUESTION: Have you already served a notice? */}
      {/* Only shown in complete_pack mode - notice_only skips this */}
      {/* ================================================================== */}
      {!isNoticeOnlyMode && (
        <div className="space-y-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <label className="block text-sm font-medium text-gray-900">
            Have you already served a valid notice on the tenant?
            <span className="text-red-500 ml-1">*</span>
          </label>
          <p className="text-xs text-gray-500">
            This determines whether we need to generate a notice for you or use your existing notice.
          </p>

          <div className="flex flex-col gap-2 mt-2">
            <label className={`
              flex items-start p-3 border rounded-lg cursor-pointer transition-all
              ${facts.notice_already_served === true
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 hover:border-gray-300'}
            `}>
              <input
                type="radio"
                name="notice_already_served"
                checked={facts.notice_already_served === true}
                onChange={() => onUpdate({ notice_already_served: true })}
                className="mt-0.5 mr-3"
              />
              <div>
                <span className="text-sm font-medium text-gray-900">
                  Yes, I have already served a notice
                </span>
                <p className="text-xs text-gray-500 mt-0.5">
                  I will provide details of the notice I have already served on the tenant.
                </p>
              </div>
            </label>

            <label className={`
              flex items-start p-3 border rounded-lg cursor-pointer transition-all
              ${facts.notice_already_served === false
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 hover:border-gray-300'}
            `}>
              <input
                type="radio"
                name="notice_already_served"
                checked={facts.notice_already_served === false}
                onChange={() => onUpdate({ notice_already_served: false })}
                className="mt-0.5 mr-3"
              />
              <div>
                <span className="text-sm font-medium text-gray-900">
                  No, I need to generate a notice
                </span>
                <p className="text-xs text-gray-500 mt-0.5">
                  We'll help you create the correct notice ({isSection8 ? 'Form 3 - Section 8' : 'Form 6A - Section 21'}) as part of your eviction pack.
                </p>
              </div>
            </label>
          </div>
        </div>
      )}

      {/* Notice-only mode header */}
      {isNoticeOnlyMode && (
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <h4 className="text-sm font-medium text-purple-900">
            Generate Your {isSection8 ? 'Section 8' : 'Section 21'} Notice
          </h4>
          <p className="text-sm text-purple-700 mt-1">
            Complete the details below to generate your court-ready eviction notice.
          </p>
        </div>
      )}

      {/* ================================================================== */}
      {/* PATH A: Already served - show existing notice details */}
      {/* ================================================================== */}
      {noticeAlreadyServed === true && (
        <>
          {/* Notice service date */}
          <div className="space-y-2">
            <label htmlFor="notice_served_date" className="block text-sm font-medium text-gray-700">
              Date notice was served
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              id="notice_served_date"
              type="date"
              className="w-full max-w-xs rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
              value={facts.notice_served_date || ''}
              onChange={(e) => onUpdate({ notice_served_date: e.target.value })}
            />
            <p className="text-xs text-gray-500">
              The date you served the eviction notice on the tenant(s).
            </p>
          </div>

          {/* Service method */}
          <div className="space-y-2">
            <label htmlFor="notice_service_method" className="block text-sm font-medium text-gray-700">
              How was the notice served?
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
            <p className="text-xs text-gray-500">
              Required for court forms. The method of service affects when the notice is deemed served.
            </p>
          </div>

          {/* Notice expiry date */}
          <div className="space-y-2">
            <label htmlFor="notice_expiry_date" className="block text-sm font-medium text-gray-700">
              Notice expiry date
            </label>
            <div className="flex items-center gap-3">
              <input
                id="notice_expiry_date"
                type="date"
                className="w-full max-w-xs rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
                value={facts.notice_expiry_date || ''}
                onChange={(e) => onUpdate({ notice_expiry_date: e.target.value })}
              />
              {suggestedExpiryDate && !facts.notice_expiry_date && (
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
              Leave blank to auto-calculate. Minimum {minNoticePeriod} days for your selected route/grounds.
            </p>
          </div>

          {/* Section 8 Grounds Selection */}
          {isSection8 && (
            <div className="pt-4 border-t border-gray-200 space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Section 8 Grounds
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <p className="text-xs text-gray-500">
                  Select all grounds that apply. Grounds are divided into mandatory (court must grant
                  if proven) and discretionary (court decides if reasonable).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {SECTION_8_GROUNDS.map((ground) => (
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
                          {ground.mandatory ? 'Mandatory' : 'Discretionary'}
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
                    <strong>Selected grounds:</strong> {selectedGrounds.join(', ')}
                  </p>
                  <p className="text-xs text-purple-700 mt-1">
                    Minimum notice period: {minNoticePeriod} days
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Section 8 particulars note - moved to Arrears section */}
          {isSection8 && selectedGrounds.length > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>Next step:</strong> After completing the arrears schedule, you&apos;ll write the
                particulars for these grounds with help from Ask Heaven, our AI writing assistant.
              </p>
            </div>
          )}

          {/* Section 21 info */}
          {!isSection8 && (
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <h4 className="text-sm font-medium text-purple-900 mb-1">
                Section 21 Notice Period
              </h4>
              <p className="text-sm text-purple-800">
                Section 21 notices require a minimum of 2 months (60 days) notice.
                The notice cannot expire before the end of any fixed term.
              </p>
            </div>
          )}
        </>
      )}

      {/* ================================================================== */}
      {/* PATH B: Need to generate - show inline notice-only subflow */}
      {/* ================================================================== */}
      {noticeAlreadyServed === false && !subflowComplete && (
        <InlineNoticeSubflow
          facts={facts}
          isSection8={isSection8}
          onUpdate={onUpdate}
          onComplete={handleSubflowComplete}
        />
      )}

      {/* ================================================================== */}
      {/* PATH B COMPLETE: Show confirmation after inline subflow */}
      {/* ================================================================== */}
      {noticeAlreadyServed === false && subflowComplete && (
        <div className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="text-sm font-medium text-green-800 flex items-center gap-2">
              <RiCheckboxCircleLine className="w-5 h-5 text-[#7C3AED]" />
              Notice Setup Complete
            </h4>
            <p className="text-sm text-green-700 mt-1">
              Your {isSection8 ? 'Section 8 (Form 3)' : 'Section 21 (Form 6A)'} notice will be generated
              when you complete the eviction pack wizard.
            </p>
          </div>

          {/* Summary of collected data */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-2">
            <h5 className="text-sm font-medium text-gray-700">Notice Details Summary</h5>
            <dl className="text-sm">
              <div className="flex gap-2">
                <dt className="text-gray-500">Service Date:</dt>
                <dd className="text-gray-900">{facts.notice_served_date || facts.notice_service_date || '-'}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-gray-500">Service Method:</dt>
                <dd className="text-gray-900">
                  {SERVICE_METHODS.find((m) => m.value === facts.notice_service_method)?.label || facts.notice_service_method || '-'}
                </dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-gray-500">Expiry Date:</dt>
                <dd className="text-gray-900">{facts.notice_expiry_date || '-'}</dd>
              </div>
              {isSection8 && (
                <div className="flex gap-2">
                  <dt className="text-gray-500">Grounds:</dt>
                  <dd className="text-gray-900">{selectedGrounds.join(', ') || '-'}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Button to edit notice setup */}
          <button
            type="button"
            onClick={() => setSubflowComplete(false)}
            className="text-sm text-[#7C3AED] hover:text-purple-700 underline"
          >
            Edit notice details
          </button>
        </div>
      )}
    </div>
  );
};

export default NoticeSection;
