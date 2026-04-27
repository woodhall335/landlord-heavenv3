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
 * - notice_service_method: How the notice was delivered
 * - notice_expiry_date: Optional - auto-calculated if not provided
 * - section8_grounds: For Section 8, which grounds are being relied upon
 * - section8_details: Particulars for each ground
 *
 * Notice periods (England):
 * - Ground 8: 4 weeks with the higher 3 months / 13 weeks threshold
 * - Notice periods vary by the selected ground
 * - Form 3A is the live private rented route after 1 May 2026
 */

'use client';

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import type { WizardFacts } from '@/lib/case-facts/schema';
import { RiCheckboxCircleLine } from 'react-icons/ri';
import {
  listEnglandGroundDefinitions,
  normalizeEnglandGroundCode,
  type EnglandGroundCode,
} from '@/lib/england-possession/ground-catalog';
import {
  EVICTION_HINT_CLASS,
  EVICTION_LABEL_CLASS,
} from '@/components/wizard/sections/eviction/ui';
import { hasSelectedGroundDetailPanels } from './ground-detail-config';

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

const N215_RECIPIENT_CAPACITY_OPTIONS = [
  { value: 'defendant', label: 'The tenant / defendant' },
  { value: 'solicitor', label: "The tenant's solicitor" },
  { value: 'litigation_friend', label: 'A litigation friend' },
] as const;

const N215_SERVICE_LOCATION_OPTIONS = [
  { value: 'usual_residence', label: "The tenant's usual residence" },
  { value: 'last_known_residence', label: "The tenant's last known residence" },
  { value: 'place_of_business', label: "The tenant's place of business" },
  { value: 'principal_place_of_business', label: "The tenant's principal place of business" },
  { value: 'within_jurisdiction_connection', label: 'Another place with a clear jurisdictional connection' },
  { value: 'other', label: 'Other location' },
] as const;

const ENGLAND_GROUND_DEFINITIONS = listEnglandGroundDefinitions();
const ENGLAND_GROUND_MAP = new Map(
  ENGLAND_GROUND_DEFINITIONS.map((ground) => [ground.code, ground] as const)
);

// Section 8 grounds with notice periods
const SECTION_8_GROUNDS = ENGLAND_GROUND_DEFINITIONS.map((ground) => ({
  value: `Ground ${ground.code}`,
  label: `Ground ${ground.code} - ${ground.title}`,
  period: ground.noticePeriodDays,
  periodLabel: ground.noticePeriodLabel,
  periodMonths: ground.noticePeriodMonths,
  mandatory: ground.mandatory,
}));

const ARREARS_LED_GROUND_LABELS = new Set(['Ground 8', 'Ground 10', 'Ground 11']);

function getGroundSelectionHelperText(selectedGrounds: string[], noticeAlreadyServed = false): string {
  if (selectedGrounds.length === 0) {
    return '';
  }

  const arrearsOnly = selectedGrounds.every((ground) => ARREARS_LED_GROUND_LABELS.has(ground));

  if (arrearsOnly) {
    return noticeAlreadyServed
      ? 'This is an arrears-led notice, so the rent schedule, chronology, and court papers should all keep using the same arrears story from here.'
      : 'This is an arrears-led notice, so the rent schedule, chronology, and support documents will keep using the same arrears story from here.';
  }

  return noticeAlreadyServed
    ? 'If this includes any specialist ground, add the factual basis here so the court forms and support documents stay aligned with the notice already served.'
    : 'Arrears-led particulars can still be refined later, but any specialist ground should be factually anchored here so the pack reads coherently throughout.';
}

interface N215QuestionFieldsProps {
  facts: WizardFacts;
  onUpdate: (updates: Record<string, any>) => void | Promise<void>;
  mode: 'served' | 'planned';
}

function NoticeStatusCard({
  label,
  value,
  tone = 'neutral',
}: {
  label: string;
  value: string;
  tone?: 'neutral' | 'success' | 'warning';
}) {
  const toneClasses =
    tone === 'success'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
      : tone === 'warning'
        ? 'border-amber-200 bg-amber-50 text-amber-900'
        : 'border-[#ece4ff] bg-[#faf7ff] text-[#20103f]';

  return (
    <div className={`rounded-2xl border px-4 py-3 shadow-sm ${toneClasses}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] opacity-80">{label}</p>
      <p className="mt-2 text-sm font-semibold">{value}</p>
    </div>
  );
}

const N215QuestionFields: React.FC<N215QuestionFieldsProps> = ({ facts, onUpdate, mode }) => {
  const serviceMethod = String(facts.notice_service_method || '').trim();
  const recipientCapacity = String(facts.notice_service_recipient_capacity || 'defendant').trim();
  const serviceLocation = String(facts.notice_service_location || 'usual_residence').trim();
  const showTime = ['hand_delivered', 'email', 'other'].includes(serviceMethod);
  const showRecipientEmail = serviceMethod === 'email';
  const showOtherElectronicId = serviceMethod === 'other';
  const showLocationOther = serviceLocation === 'other';
  const showSignatoryPosition = Boolean(facts.solicitor_firm);

  return (
    <div className="rounded-[1.5rem] border border-[#ede4ff] bg-[#fbf9ff] p-5">
      <div className="max-w-3xl">
        <h4 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#6f54c8]">
          Certificate Of Service Facts
        </h4>
        <p className="mt-2 text-sm leading-6 text-[#5d5672]">
          These extra service facts let us prefill more of the official Form N215 instead of leaving the landlord to complete routine court-service details manually later.
        </p>
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor={`notice_service_recipient_capacity_${mode}`} className="block text-sm font-medium text-gray-700">
            Who received or will receive the notice?
          </label>
          <select
            id={`notice_service_recipient_capacity_${mode}`}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
            value={recipientCapacity}
            onChange={(e) => void onUpdate({ notice_service_recipient_capacity: e.target.value })}
          >
            {N215_RECIPIENT_CAPACITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500">
            Default is the tenant / defendant. Change this only if service was through a solicitor or litigation friend.
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor={`notice_service_location_${mode}`} className="block text-sm font-medium text-gray-700">
            Where was or will it be served?
          </label>
          <select
            id={`notice_service_location_${mode}`}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
            value={serviceLocation}
            onChange={(e) =>
              void onUpdate({
                notice_service_location: e.target.value,
                ...(e.target.value === 'other' ? {} : { notice_service_location_other: '' }),
              })
            }
          >
            {N215_SERVICE_LOCATION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500">
            Default is the tenant&apos;s usual residence. Override it if the notice went somewhere different.
          </p>
        </div>

        {showLocationOther && (
          <div className="space-y-2 md:col-span-2">
            <label htmlFor={`notice_service_location_other_${mode}`} className="block text-sm font-medium text-gray-700">
              Other service location
              <span className="ml-1 text-red-500">*</span>
            </label>
            <input
              id={`notice_service_location_other_${mode}`}
              type="text"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
              value={facts.notice_service_location_other || ''}
              onChange={(e) => void onUpdate({ notice_service_location_other: e.target.value })}
              placeholder="For example: tenant's instructed solicitor's office"
            />
          </div>
        )}

        {showTime && (
          <div className="space-y-2">
            <label htmlFor={`notice_service_time_${mode}`} className="block text-sm font-medium text-gray-700">
              {mode === 'served' ? 'Time of service' : 'Expected time of service'}
            </label>
            <input
              id={`notice_service_time_${mode}`}
              type="time"
              className="w-full max-w-xs rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
              value={facts.notice_service_time || facts.service_time || ''}
              onChange={(e) => void onUpdate({ notice_service_time: e.target.value, service_time: e.target.value })}
            />
            <p className="text-xs text-gray-500">
              Helpful for hand delivery and electronic service, but can be left blank if you genuinely do not know it.
            </p>
          </div>
        )}

        {showRecipientEmail && (
          <div className="space-y-2">
            <label htmlFor={`notice_service_recipient_email_${mode}`} className="block text-sm font-medium text-gray-700">
              Email address used for service
              <span className="ml-1 text-red-500">*</span>
            </label>
            <input
              id={`notice_service_recipient_email_${mode}`}
              type="email"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
              value={facts.notice_service_recipient_email || facts.tenant_email || ''}
              onChange={(e) => void onUpdate({ notice_service_recipient_email: e.target.value })}
              placeholder="tenant@example.com"
            />
            <p className="text-xs text-gray-500">
              This is the actual address used to send the notice, not your own contact address.
            </p>
          </div>
        )}

        {showOtherElectronicId && (
          <div className="space-y-2">
            <label htmlFor={`other_electronic_identification_${mode}`} className="block text-sm font-medium text-gray-700">
              Other electronic identifier
            </label>
            <input
              id={`other_electronic_identification_${mode}`}
              type="text"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
              value={facts.other_electronic_identification || ''}
              onChange={(e) => void onUpdate({ other_electronic_identification: e.target.value })}
              placeholder="For example: portal username, app ID, or reference"
            />
          </div>
        )}

        {showSignatoryPosition && (
          <div className="space-y-2">
            <label htmlFor={`signatory_position_${mode}`} className="block text-sm font-medium text-gray-700">
              Position or office held by the signer
            </label>
            <input
              id={`signatory_position_${mode}`}
              type="text"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
              value={facts.signatory_position || ''}
              onChange={(e) => void onUpdate({ signatory_position: e.target.value })}
              placeholder="For example: Solicitor, Director, Litigation Executive"
            />
            <p className="text-xs text-gray-500">
              We only ask this where a legal representative or firm is named, so the statement-of-truth block can be completed more cleanly.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

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
  noticeProductLabel: string;
  onUpdate: (updates: Record<string, any>) => void | Promise<void>;
  onComplete: () => void;
}

/**
 * Inline notice-only subflow for generating notices within the eviction wizard.
 *
 * For the England public flow this collects Form 3A grounds, service details,
 * and the supporting facts used across the notice and court-stage documents.
 *
 * This component uses the SAME field keys as config/mqs/notice_only/england.yaml
 * to ensure data compatibility and avoid duplication.
 */
const InlineNoticeSubflow: React.FC<InlineNoticeSubflowProps> = ({
  facts,
  isSection8,
  noticeProductLabel,
  onUpdate,
  onComplete,
}) => {
  // =============================================================================
  // INITIAL STEP DETERMINATION
  // For legacy non-Section 8 routes, check if compliance questions are already answered
  // (e.g. from an older dedicated compliance step) to avoid asking twice.
  // =============================================================================
  const getInitialStep = (): 'compliance' | 'grounds' | 'service' => {
    if (isSection8) return 'grounds';

    // For legacy non-Section 8 routes: check if compliance questions are already answered.
    // These may have been answered in an older dedicated compliance step.
    const complianceAlreadyComplete = (() => {
      // Check deposit compliance
      if (facts.deposit_taken === undefined) return false;
      if (facts.deposit_taken === true) {
        // deposit_protected can be stored with different keys
        const depositProtected = facts.deposit_protected ?? facts.deposit_protected_scheme;
        if (depositProtected === undefined) return false;
        // prescribed_info can be stored with different keys
        const prescribedInfo = facts.prescribed_info_served ?? facts.prescribed_info_given;
        if (prescribedInfo === undefined) return false;
      }

      // Check gas compliance
      if (facts.has_gas_appliances === undefined) return false;
      if (facts.has_gas_appliances === true) {
        const gasCert = facts.gas_safety_cert_served ?? facts.gas_certificate_provided;
        if (gasCert === undefined) return false;
      }

      // Check EPC and How to Rent
      const epcProvided = facts.epc_served ?? facts.epc_provided;
      if (epcProvided === undefined) return false;

      const howToRent = facts.how_to_rent_served ?? facts.how_to_rent_provided;
      if (howToRent === undefined) return false;

      return true;
    })();

    // Skip compliance step if already completed
    return complianceAlreadyComplete ? 'service' : 'compliance';
  };

  const [currentStep, setCurrentStep] = useState<'compliance' | 'grounds' | 'service' | 'complete'>(
    getInitialStep()
  );

  // Section 8 grounds selection (reuses same keys as notice-only schema)
  const selectedGrounds = useMemo(
    () => (Array.isArray(facts.section8_grounds) ? (facts.section8_grounds as string[]) : []),
    [facts.section8_grounds]
  );
  const hasArrearsGround = selectedGrounds.some((ground) => ARREARS_LED_GROUND_LABELS.has(ground));
  const hasSpecialistGroundDetails = hasSelectedGroundDetailPanels(selectedGrounds);

  // Calculate minimum notice period based on selected grounds
  const minNoticePeriod = useMemo(() => {
    if (!isSection8) return 60;
    if (selectedGrounds.length === 0) return 28;
    let maxPeriod = 28;
    selectedGrounds.forEach((ground) => {
      const groundInfo = SECTION_8_GROUNDS.find((g) => g.value === ground);
      if (groundInfo && groundInfo.period > maxPeriod) {
        maxPeriod = groundInfo.period;
      }
    });
    return maxPeriod;
  }, [isSection8, selectedGrounds]);

  const minNoticePeriodLabel = useMemo(() => {
    if (!isSection8) return '2 months';
    if (selectedGrounds.length === 0) return 'depends on the ground you choose';

    const matchingGrounds = SECTION_8_GROUNDS.filter((ground) => selectedGrounds.includes(ground.value));
    if (matchingGrounds.length === 0) return `${minNoticePeriod} days`;

    const drivingLabels = Array.from(
      new Set(
        matchingGrounds
          .filter((ground) => ground.period === minNoticePeriod)
          .map((ground) => ground.periodLabel || `${ground.period} days`)
      )
    );

    return drivingLabels.join(' / ');
  }, [isSection8, selectedGrounds, minNoticePeriod]);

  // Calculate suggested service and expiry dates
  const today = new Date().toISOString().split('T')[0];
  const suggestedExpiryDate = useMemo(() => {
    // FIXED (Jan 2026): Check both notice_date (new) and notice_service_date (old)
    const serviceDate = facts.notice_date || facts.notice_service_date || today;
    const date = new Date(serviceDate);
    const matchingGrounds = SECTION_8_GROUNDS.filter((ground) =>
      selectedGrounds.includes(ground.value) && ground.period === minNoticePeriod
    );
    const noticePeriodMonths = Math.max(...matchingGrounds.map((ground) => ground.periodMonths || 0), 0);

    if (noticePeriodMonths > 0) {
      date.setMonth(date.getMonth() + noticePeriodMonths);
    } else {
      date.setDate(date.getDate() + minNoticePeriod);
    }
    return date.toISOString().split('T')[0];
  }, [facts.notice_date, facts.notice_service_date, minNoticePeriod, selectedGrounds, today]);

  // Initialize notice_date (and notice_service_date for backwards compat) when entering service step
  // This ensures the displayed default value is also saved to facts
  // FIXED (Jan 2026): Use notice_date to match MSQ field ID
  useEffect(() => {
    if (currentStep === 'service' && !facts.notice_date && !facts.notice_service_date) {
      onUpdate({
        notice_date: today,
        notice_service_date: today  // Backwards compat
      });
    }
  }, [currentStep, facts.notice_date, facts.notice_service_date, today, onUpdate]);

  // Handle ground toggle
  const handleGroundToggle = (ground: string) => {
    const newGrounds = selectedGrounds.includes(ground)
      ? selectedGrounds.filter((g) => g !== ground)
      : [...selectedGrounds, ground];
    onUpdate({
      section8_grounds: newGrounds,
      section8_grounds_touched: true,
      section8_grounds_seeded_from_selector: false,
    });
  };

  // Check if current step is complete
  // NOTE: Check all possible key variants since different sections use different keys
  const isStepComplete = useCallback(() => {
    switch (currentStep) {
      case 'compliance':
        // For S21: deposit checks must be answered
        // Check both key variants: *_served (from this flow) and *_provided/*_given (from Compliance tab)
        if (facts.deposit_taken === undefined) return false;
        if (facts.deposit_taken === true) {
          const depositProtected = facts.deposit_protected ?? facts.deposit_protected_scheme;
          if (depositProtected === undefined) return false;
          const prescribedInfo = facts.prescribed_info_served ?? facts.prescribed_info_given;
          if (prescribedInfo === undefined) return false;
        }
        if (facts.has_gas_appliances === undefined) return false;
        if (facts.has_gas_appliances === true) {
          const gasCert = facts.gas_safety_cert_served ?? facts.gas_certificate_provided;
          if (gasCert === undefined) return false;
        }
        const epcProvided = facts.epc_served ?? facts.epc_provided;
        if (epcProvided === undefined) return false;
        const howToRent = facts.how_to_rent_served ?? facts.how_to_rent_provided;
        if (howToRent === undefined) return false;
        return true;
      case 'grounds':
        // For S8: at least one ground must be selected
        // Particulars are now collected in the Arrears section (after arrears data is known)
        return selectedGrounds.length > 0;
      case 'service':
        // Service details must be complete
        // FIXED (Jan 2026): Check both notice_date (new) and notice_service_date (old) for compatibility
        return Boolean(facts.notice_date || facts.notice_service_date) && Boolean(facts.notice_service_method);
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
      // FIXED (Jan 2026): Use notice_date as primary, with fallback to notice_service_date
      const serviceDate = facts.notice_date || facts.notice_service_date || today;
      const updates: Record<string, any> = {
        notice_served_date: serviceDate,
        notice_date: serviceDate,  // Ensure new field is set
        notice_service_date: serviceDate,  // Backwards compat
        // For S8, use user-provided or suggested expiry; for S21, leave it for server to compute
        notice_expiry_date: isSection8 ? (facts.notice_expiry_date || suggestedExpiryDate) : undefined,
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
            Complete these questions to prepare your {noticeProductLabel}.
          </p>
        </div>
      </div>

      {/* Legacy non-Section 8 compliance step */}
      {!isSection8 && currentStep === 'compliance' && (
        <div className="space-y-4">
          <h5 className="text-sm font-medium text-gray-700">Deposit & Compliance Checks</h5>
          <p className="text-xs text-gray-500">
            This legacy notice route has compliance requirements we still need to check before generating the notice.
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
                    Deposit protection still needs to be resolved before this notice route can be relied on.
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
          <h5 className="text-sm font-medium text-gray-700">Form 3A Grounds</h5>
          <p className="text-xs text-gray-500">
            Select all grounds that apply to your case. This determines the minimum Form 3A notice period.
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
                      {ground.periodLabel || `${ground.period} days`}
                    </span>
                  </div>
                </div>
              </label>
            ))}
          </div>

          {selectedGrounds.length > 0 && (
            <div className="space-y-4">
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-sm text-purple-800">
                  <strong>Selected:</strong> {selectedGrounds.join(', ')}
                </p>
                <p className="text-xs text-purple-700 mt-1">
                  Minimum notice period: {minNoticePeriodLabel}
                </p>
                {getGroundSelectionHelperText(selectedGrounds) && (
                  <p className="text-xs text-[#7C3AED] mt-2">
                    {getGroundSelectionHelperText(selectedGrounds)}
                  </p>
                )}
                <p className="mt-2 text-xs font-medium text-[#5b36b3]">
                  Next step:{' '}
                  {hasSpecialistGroundDetails
                    ? 'continue to Ground details so we can capture the facts behind the specialist grounds.'
                    : hasArrearsGround
                      ? 'continue to About the arrears so we can build the rent schedule and particulars.'
                      : 'continue to the next step to review the pack.'}
                </p>
              </div>
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

          {/* Service date - FIXED: Use notice_date to match MSQ field ID (Jan 2026 fix) */}
          <div className="space-y-2">
            <label htmlFor="notice_date" className="block text-sm font-medium text-gray-700">
              Date you will serve the notice*
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              id="notice_date"
              type="date"
              className="w-full max-w-xs rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
              value={facts.notice_date || facts.notice_service_date || today}
              onChange={(e) => onUpdate({
                notice_date: e.target.value,
                notice_service_date: e.target.value  // Backwards compat
              })}
            />
            <p className="text-xs text-gray-500">
              This is the date you will actually serve (hand deliver or post) the notice.
            </p>
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

          <N215QuestionFields facts={facts} onUpdate={onUpdate} mode="planned" />

          {/* Expiry date - SECTION 8 ONLY: User-editable */}
          {isSection8 && (
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
                Minimum {minNoticePeriod} days from service date. You can override if needed.
              </p>
            </div>
          )}

          {/* Expiry date - legacy non-Section 8 route: auto-calculated (read-only) */}
          {!isSection8 && (
            <div className="space-y-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <label className="block text-sm font-medium text-purple-800">
                Notice expiry date (auto-calculated)
              </label>
              <p className="text-sm text-purple-700">
                The expiry date for this notice will be <strong>automatically calculated</strong> when the notice is generated.
                The system will determine the earliest legal date based on:
              </p>
              <ul className="text-xs text-purple-600 list-disc list-inside mt-1 space-y-0.5">
                <li>Minimum 2 calendar months from service date</li>
                <li>Fixed term end date (if applicable)</li>
                <li>Break clause date (if applicable)</li>
                <li>4-month restriction from tenancy start</li>
              </ul>
              <p className="text-xs text-purple-700 mt-2 font-medium">
                This keeps the generated notice aligned to the date rules for this route.
              </p>
            </div>
          )}

          {/* Notice generation info */}
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h5 className="text-sm font-medium text-green-800 flex items-center gap-2">
              <RiCheckboxCircleLine className="w-5 h-5 text-[#7C3AED]" />
              Notice Will Be Generated
            </h5>
            <p className="text-sm text-green-700 mt-1">
              Your {noticeProductLabel} will be
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
  jurisdiction,
  onUpdate,
  mode = 'complete_pack',
}) => {
  const isEngland = jurisdiction === 'england';
  const isSection8 = isEngland || facts.eviction_route === 'section_8';
  const noticeProductLabel = isEngland
    ? 'Form 3A notice'
    : facts.eviction_route === 'section_173'
    ? 'Section 173 notice'
    : isSection8
    ? 'Form 3A notice'
    : 'fault-based notice';
  const selectedGrounds = useMemo(
    () => (Array.isArray(facts.section8_grounds) ? (facts.section8_grounds as string[]) : []),
    [facts.section8_grounds]
  );
  const hasArrearsGround = selectedGrounds.some((ground) => ARREARS_LED_GROUND_LABELS.has(ground));
  const hasSpecialistGroundDetails = hasSelectedGroundDetailPanels(selectedGrounds);
  const groundsRequiringPriorNotice = useMemo(() => {
    const definitions = new Map<EnglandGroundCode, (typeof ENGLAND_GROUND_DEFINITIONS)[number]>();

    selectedGrounds.forEach((ground) => {
      const code = normalizeEnglandGroundCode(ground);
      if (!code) return;
      const definition = ENGLAND_GROUND_MAP.get(code);
      if (definition?.requiresPriorNotice) {
        definitions.set(code, definition);
      }
    });

    return Array.from(definitions.values());
  }, [selectedGrounds]);

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
    if (!isSection8) return 60;
    if (selectedGrounds.length === 0) return isEngland ? 28 : 14;

    // Find the maximum notice period among selected grounds
    // (when multiple grounds, the longest period applies)
    let maxPeriod = isEngland ? 28 : 14;
    selectedGrounds.forEach((ground) => {
      const groundInfo = SECTION_8_GROUNDS.find((g) => g.value === ground);
      if (groundInfo && groundInfo.period > maxPeriod) {
        maxPeriod = groundInfo.period;
      }
    });
    return maxPeriod;
  }, [isEngland, isSection8, selectedGrounds]);

  const minNoticePeriodLabel = useMemo(() => {
    if (!isSection8) return '2 months';
    if (selectedGrounds.length === 0) {
      return isEngland ? 'depends on the ground you choose' : '2 weeks';
    }

    const matchingGrounds = SECTION_8_GROUNDS.filter((ground) => selectedGrounds.includes(ground.value));
    if (matchingGrounds.length === 0) return `${minNoticePeriod} days`;

    const drivingLabels = Array.from(
      new Set(
        matchingGrounds
          .filter((ground) => ground.period === minNoticePeriod)
          .map((ground) => ground.periodLabel || `${ground.period} days`)
      )
    );

    return drivingLabels.join(' / ');
  }, [isEngland, isSection8, selectedGrounds, minNoticePeriod]);

  // Calculate suggested expiry date
  const suggestedExpiryDate = useMemo(() => {
    if (!facts.notice_served_date) return null;
    const servedDate = new Date(facts.notice_served_date);
    const expiryDate = new Date(servedDate);
    const matchingGrounds = SECTION_8_GROUNDS.filter((ground) =>
      selectedGrounds.includes(ground.value) && ground.period === minNoticePeriod
    );
    const noticePeriodMonths = Math.max(...matchingGrounds.map((ground) => ground.periodMonths || 0), 0);

    if (noticePeriodMonths > 0) {
      expiryDate.setMonth(expiryDate.getMonth() + noticePeriodMonths);
    } else {
      expiryDate.setDate(expiryDate.getDate() + minNoticePeriod);
    }
    return expiryDate.toISOString().split('T')[0];
  }, [facts.notice_served_date, minNoticePeriod, selectedGrounds]);

  // Handle ground selection
  const handleGroundToggle = (ground: string) => {
    const newGrounds = selectedGrounds.includes(ground)
      ? selectedGrounds.filter((g) => g !== ground)
      : [...selectedGrounds, ground];
    onUpdate({
      section8_grounds: newGrounds,
      section8_grounds_touched: true,
      section8_grounds_seeded_from_selector: false,
    });
  };

  // Handle subflow completion
  const handleSubflowComplete = useCallback(() => {
    setSubflowComplete(true);
  }, []);
  const hasServedCoreFacts = Boolean(facts.notice_served_date) && Boolean(facts.notice_service_method);


  return (
    <div className="space-y-6">
      {/* ================================================================== */}
      {/* GATING QUESTION: Have you already served a notice? */}
      {/* Only shown in complete_pack mode - notice_only skips this */}
      {/* ================================================================== */}
      {!isNoticeOnlyMode && (
        <div className="space-y-4 rounded-[1.5rem] border border-[#e6dcff] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,243,255,0.94))] p-5 shadow-[0_14px_34px_rgba(76,29,149,0.06)]">
          <div className="flex flex-wrap gap-2">
            {(isEngland
              ? ['Form 3A notice', 'Service details', 'Grounds and dates']
              : [noticeProductLabel, 'Service details', 'Route checks']
            ).map((item) => (
              <span
                key={item}
                className="rounded-full border border-[#ddd0ff] bg-white px-3 py-1.5 text-xs font-semibold text-[#5b36b3] shadow-sm"
              >
                {item}
              </span>
            ))}
          </div>
          <label className="block text-sm font-medium text-gray-900">
            Have you already served a valid notice on the tenant?
            <span className="text-red-500 ml-1">*</span>
          </label>
          <p className="text-sm leading-6 text-[#60597a]">
            Choose whether this pack should build a fresh notice for you or work from one you have already served.
          </p>

          <div className="flex flex-col gap-3">
            <label className={`
              flex items-start rounded-2xl border p-4 cursor-pointer transition-all
              ${facts.notice_already_served === true
                ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-100'
                : 'border-gray-200 bg-white hover:border-gray-300'}
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
              flex items-start rounded-2xl border p-4 cursor-pointer transition-all
              ${facts.notice_already_served === false
                ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-100'
                : 'border-gray-200 bg-white hover:border-gray-300'}
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
                  {isEngland
                    ? 'We will help you prepare the current England Form 3A notice as part of your complete eviction pack.'
                    : `We'll help you prepare the correct ${noticeProductLabel} as part of your eviction pack.`}
                </p>
              </div>
            </label>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* PATH A: Already served - show existing notice details */}
      {/* ================================================================== */}
      {noticeAlreadyServed === true && (
        <>
          <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <NoticeStatusCard
              label="Notice path"
              value="Using an already served notice"
              tone="success"
            />
            <NoticeStatusCard
              label="Service basics"
              value={hasServedCoreFacts ? 'Recorded' : 'Still needs date and method'}
              tone={hasServedCoreFacts ? 'success' : 'warning'}
            />
            <NoticeStatusCard
              label="Grounds"
              value={isSection8 ? (selectedGrounds.length > 0 ? `${selectedGrounds.length} selected` : 'Still need selection') : 'Not a Section 8 route'}
              tone={isSection8 ? (selectedGrounds.length > 0 ? 'success' : 'warning') : 'neutral'}
            />
            <NoticeStatusCard
              label="Minimum notice"
              value={minNoticePeriodLabel}
              tone="neutral"
            />
          </section>

          <div className="rounded-[1.5rem] border border-[#e6dcff] bg-white p-5 shadow-[0_14px_34px_rgba(76,29,149,0.06)]">
            <div className="flex flex-wrap gap-2">
              {['Notice service date', 'Service method', 'Expiry date'].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-[#ddd0ff] bg-[#faf7ff] px-3 py-1.5 text-xs font-semibold text-[#5b36b3]"
                >
                  {item}
                </span>
              ))}
            </div>
            <p className="mt-4 text-sm leading-6 text-[#60597a]">
              Enter the served notice details first so the court-facing documents stay aligned with what the tenant actually received.
            </p>
          </div>

          {/* Notice service date */}
          <div className="grid gap-5 md:grid-cols-2">
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
          </div>

          {hasServedCoreFacts ? (
            <N215QuestionFields facts={facts} onUpdate={onUpdate} mode="served" />
          ) : (
            <div className="rounded-[1.5rem] border border-[#ece4ff] bg-[#faf7ff] p-5 shadow-sm">
              <p className="text-sm font-semibold text-[#27134a]">Next: certificate of service details</p>
              <p className="mt-2 text-sm leading-6 text-[#62597c]">
                Once the served date and service method are recorded, we will unlock the extra N215 questions so the official certificate of service can be completed more cleanly.
              </p>
            </div>
          )}

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
              Leave blank to auto-calculate. Minimum {minNoticePeriodLabel}{isEngland ? ' for your selected England grounds.' : ' for your selected route/grounds.'}
            </p>
          </div>

          {/* Section 8 Grounds Selection */}
          {isSection8 && (
            <div className="space-y-4 rounded-[1.5rem] border border-[#e6dcff] bg-white p-5 shadow-[0_14px_34px_rgba(76,29,149,0.06)]">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Form 3A Grounds
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <p className="text-xs text-gray-500">
                  Select all grounds that apply. Grounds are divided into mandatory (court must grant
                  if proven) and discretionary (court decides if reasonable).
                </p>
                <p className="text-xs font-medium text-[#6f54c8]">
                  All current England post-May 2026 Form 3A grounds remain available here, including the specialist grounds that need extra factual detail.
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
                <div className="space-y-4">
                  <div className="rounded-[1.4rem] border border-purple-200 bg-purple-50 p-4">
                    <p className="text-sm text-purple-800">
                      <strong>Selected grounds:</strong> {selectedGrounds.join(', ')}
                    </p>
                    <p className="text-xs text-purple-700 mt-1">
                      Minimum notice period: {minNoticePeriodLabel}
                    </p>
                    {getGroundSelectionHelperText(selectedGrounds, true) && (
                      <p className="text-xs text-[#7C3AED] mt-2">
                        {getGroundSelectionHelperText(selectedGrounds, true)}
                      </p>
                    )}
                    <p className="mt-2 text-xs font-medium text-[#5b36b3]">
                      Next step:{' '}
                      {hasSpecialistGroundDetails
                        ? 'continue to Ground details so we can anchor the selected specialist grounds properly.'
                        : hasArrearsGround
                          ? 'continue to About the arrears so the arrears schedule and particulars stay aligned.'
                          : 'continue to the next step to keep the notice pack moving.'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Section 8 particulars note - moved to Arrears section */}
          {isSection8 && selectedGrounds.length > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>Next step:</strong>{' '}
                {hasSpecialistGroundDetails
                  ? 'the Ground details step will capture the specialist facts behind the selected grounds.'
                  : hasArrearsGround
                    ? 'the About the arrears step will build the rent schedule and the possession particulars.'
                    : 'the next step will help you finish the notice pack without adding unnecessary detail here.'}
              </p>
            </div>
          )}

          {/* Legacy non-Section 8 notice info */}
          {!isSection8 && (
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <h4 className="text-sm font-medium text-purple-900 mb-1">
                Notice Period
              </h4>
              <p className="text-sm text-purple-800">
                This route normally requires a minimum of 2 months (60 days) notice.
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
          noticeProductLabel={noticeProductLabel}
          onUpdate={onUpdate}
          onComplete={handleSubflowComplete}
        />
      )}

      {/* ================================================================== */}
      {/* PATH B COMPLETE: Show confirmation after inline subflow */}
      {/* ================================================================== */}
      {noticeAlreadyServed === false && subflowComplete && (
        <div className="space-y-4">
          <div className="rounded-[1.5rem] border border-green-200 bg-green-50 p-5">
            <h4 className="text-sm font-medium text-green-800 flex items-center gap-2">
              <RiCheckboxCircleLine className="w-5 h-5 text-[#7C3AED]" />
              Notice Setup Complete
            </h4>
            <p className="text-sm text-green-700 mt-1">
              Your {noticeProductLabel} will be generated
              when you complete the eviction pack wizard.
            </p>
          </div>

          {/* Summary of collected data */}
          <div className="rounded-[1.5rem] border border-gray-200 bg-gray-50 p-5 space-y-2">
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

      {isSection8 && groundsRequiringPriorNotice.length > 0 && (
        <section className="rounded-[1.5rem] border border-[#e6dcff] bg-white p-5 shadow-[0_14px_34px_rgba(76,29,149,0.06)]">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-[#20103f]">
              Prior notice or tenancy-start wording check
            </h4>
            <p className="text-sm leading-6 text-[#60597a]">
              The selected ground{groundsRequiringPriorNotice.length > 1 ? 's' : ''}{' '}
              {groundsRequiringPriorNotice.map((ground) => `Ground ${ground.code}`).join(', ')} rely on
              prior written notice or tenancy-start wording. Confirm that prerequisite before the pack
              treats these grounds as court-ready.
            </p>
          </div>

          <div className="mt-4 flex flex-col gap-3">
            <label
              className={`flex items-start rounded-2xl border p-4 transition-all ${
                facts.ground_prerequisite_notice_served === true
                  ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-100'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="ground_prerequisite_notice_served"
                checked={facts.ground_prerequisite_notice_served === true}
                onChange={() => onUpdate({ ground_prerequisite_notice_served: true })}
                className="mt-0.5 mr-3"
              />
              <div>
                <span className="text-sm font-medium text-gray-900">
                  Yes, the required prior notice or tenancy wording is already in place
                </span>
                <p className="mt-0.5 text-xs text-gray-500">
                  Use this if the tenancy paperwork or earlier written notice already supports these grounds.
                </p>
              </div>
            </label>

            <label
              className={`flex items-start rounded-2xl border p-4 transition-all ${
                facts.ground_prerequisite_notice_served === false
                  ? 'border-red-300 bg-red-50 ring-2 ring-red-100'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="ground_prerequisite_notice_served"
                checked={facts.ground_prerequisite_notice_served === false}
                onChange={() => onUpdate({ ground_prerequisite_notice_served: false })}
                className="mt-0.5 mr-3"
              />
              <div>
                <span className="text-sm font-medium text-gray-900">
                  No, that prerequisite is not in place yet
                </span>
                <p className="mt-0.5 text-xs text-gray-500">
                  The wizard will flag this as a blocker so the notice and court pack are not treated as compliant for that ground.
                </p>
              </div>
            </label>
          </div>
        </section>
      )}
    </div>
  );
};

export default NoticeSection;
