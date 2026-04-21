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

type GroundDetailFieldType = 'text' | 'textarea' | 'date';

interface GroundDetailFieldConfig {
  field: string;
  label: string;
  helpText: string;
  type?: GroundDetailFieldType;
  placeholder?: string;
}

interface GroundDetailPanelConfig {
  code: EnglandGroundCode;
  title: string;
  intro: string;
  fields: GroundDetailFieldConfig[];
}

const OCCUPATION_STYLE_GROUND_CODES = new Set<EnglandGroundCode>([
  '2', '2ZA', '2ZB', '2ZC', '2ZD', '4', '4A', '5', '5A', '5B', '5C', '5E', '5F', '5G', '5H', '7', '18',
]);

function groundFactPath(code: EnglandGroundCode, field: string): string {
  return `ground_${code.toLowerCase()}.${field}`;
}

function buildGroundDetailPanelConfig(code: EnglandGroundCode): GroundDetailPanelConfig | null {
  const definition = ENGLAND_GROUND_MAP.get(code);
  if (!definition) return null;

  if (code === '1') {
    return {
      code,
      title: definition.title,
      intro:
        'Tell us who is expected to occupy the property after possession and why the landlord is now relying on this route.',
      fields: [
        {
          field: groundFactPath(code, 'intended_occupier'),
          label: 'Who is expected to occupy the property?',
          helpText: 'Name the landlord or family member, or describe them clearly if you do not want to use a full name.',
        },
        {
          field: groundFactPath(code, 'occupier_relationship'),
          label: 'What is their relationship to the landlord?',
          helpText: 'For example: landlord, spouse, adult son, parent, or other qualifying family member.',
        },
        {
          field: groundFactPath(code, 'occupation_reason'),
          label: 'Why is possession needed for this occupation?',
          helpText: 'Summarise the factual reason calmly and specifically.',
          type: 'textarea',
          placeholder: 'For example: the landlord is returning from working abroad and intends to live in the property as their main home.',
        },
        {
          field: groundFactPath(code, 'decision_date'),
          label: 'When was the decision made?',
          helpText: 'Use the date the landlord decided to recover possession for this purpose, if known.',
          type: 'date',
        },
        {
          field: groundFactPath(code, 'intended_start_date'),
          label: 'When is occupation expected to begin?',
          helpText: 'This helps us explain timing without over-committing.',
          type: 'date',
        },
        {
          field: groundFactPath(code, 'supporting_evidence'),
          label: 'What evidence supports this ground?',
          helpText: 'List the documents or records you already have or expect to rely on.',
          type: 'textarea',
        },
      ],
    };
  }

  if (code === '1A') {
    return {
      code,
      title: definition.title,
      intro:
        'Tell us why the property is to be sold and what practical steps have already been taken toward the sale.',
      fields: [
        {
          field: groundFactPath(code, 'sale_reason'),
          label: 'Why is the property being sold?',
          helpText: 'Give the practical reason for the proposed sale.',
          type: 'textarea',
        },
        {
          field: groundFactPath(code, 'sale_steps_taken'),
          label: 'What sale steps have already been taken?',
          helpText: 'For example: valuation, discussions with agents, marketing preparation, or lender discussions.',
          type: 'textarea',
        },
        {
          field: groundFactPath(code, 'decision_date'),
          label: 'When was the decision to sell made?',
          helpText: 'Use the best date available.',
          type: 'date',
        },
        {
          field: groundFactPath(code, 'intended_sale_timing'),
          label: 'What is the expected sale timetable?',
          helpText: 'A short practical summary is enough.',
        },
        {
          field: groundFactPath(code, 'supporting_evidence'),
          label: 'What evidence supports the sale intention?',
          helpText: 'List the key supporting documents or records.',
          type: 'textarea',
        },
      ],
    };
  }

  if (code === '7B') {
    return {
      code,
      title: definition.title,
      intro:
        'Tell us the immigration-status basis relied on, who it affects, and the official material that supports the ground.',
      fields: [
        {
          field: groundFactPath(code, 'affected_occupiers'),
          label: 'Which occupiers are affected?',
          helpText: 'Name or describe the occupiers whose status is relied on for this ground.',
        },
        {
          field: groundFactPath(code, 'status_basis'),
          label: 'What is the current status position?',
          helpText: 'Summarise the right-to-rent or immigration issue in neutral, factual terms.',
          type: 'textarea',
        },
        {
          field: groundFactPath(code, 'notice_source'),
          label: 'What official notice or source material is relied on?',
          helpText: 'For example: Home Office notice, right-to-rent disqualification letter, or follow-up confirmation.',
          type: 'textarea',
        },
        {
          field: groundFactPath(code, 'status_check_date'),
          label: 'When was the relevant notice or check received?',
          helpText: 'Use the date of the official material or status check, if known.',
          type: 'date',
        },
        {
          field: groundFactPath(code, 'decision_or_reference'),
          label: 'Reference or decision identifier',
          helpText: 'Include any reference number, decision date, or official identifier if available.',
        },
        {
          field: groundFactPath(code, 'supporting_evidence'),
          label: 'What supporting evidence is available?',
          helpText: 'List the documents you can produce in support.',
          type: 'textarea',
        },
      ],
    };
  }

  if (code === '9') {
    return {
      code,
      title: definition.title,
      intro:
        'Tell us where the alternative accommodation is, when it is available, and why it is said to be suitable.',
      fields: [
        {
          field: groundFactPath(code, 'alternative_address'),
          label: 'Address or description of the alternative accommodation',
          helpText: 'Use the full address if known, or enough detail to identify it.',
          type: 'textarea',
        },
        {
          field: groundFactPath(code, 'availability_date'),
          label: 'When will it be available?',
          helpText: 'Use the date the tenant could realistically move in, if known.',
          type: 'date',
        },
        {
          field: groundFactPath(code, 'suitability_summary'),
          label: 'Why is it said to be suitable?',
          helpText: 'Address size, location, condition, or household fit in a practical way.',
          type: 'textarea',
        },
        {
          field: groundFactPath(code, 'affordability_summary'),
          label: 'What is the affordability or availability position?',
          helpText: 'Summarise rent level, funding, or any other practical point.',
          type: 'textarea',
        },
        {
          field: groundFactPath(code, 'supporting_evidence'),
          label: 'What evidence supports this alternative accommodation?',
          helpText: 'List the documents or confirmations available.',
          type: 'textarea',
        },
      ],
    };
  }

  if (code === '6' || code === '6B') {
    return {
      code,
      title: definition.title,
      intro:
        'Tell us what works are proposed, why possession is needed to carry them out, and what project material already exists.',
      fields: [
        {
          field: groundFactPath(code, 'works_description'),
          label: 'Describe the proposed works',
          helpText: 'Summarise the redevelopment, demolition, or substantial works in practical terms.',
          type: 'textarea',
        },
        {
          field: groundFactPath(code, 'possession_requirement_reason'),
          label: 'Why is possession needed for the works?',
          helpText: 'Explain why the works cannot reasonably proceed with the tenant in occupation.',
          type: 'textarea',
        },
        {
          field: groundFactPath(code, 'intended_start_date'),
          label: 'When are the works expected to start?',
          helpText: 'Use the best available date.',
          type: 'date',
        },
        {
          field: groundFactPath(code, 'planning_or_contractor_status'),
          label: 'Planning, contractor, or project status',
          helpText: 'For example: planning obtained, contractor instructed, funding approved, or quotations pending.',
          type: 'textarea',
        },
        {
          field: groundFactPath(code, 'supporting_evidence'),
          label: 'What evidence supports the works?',
          helpText: 'List the key plans, approvals, quotations, contracts, or other project records.',
          type: 'textarea',
        },
      ],
    };
  }

  if (OCCUPATION_STYLE_GROUND_CODES.has(code)) {
    return {
      code,
      title: definition.title,
      intro:
        'Tell us the current factual basis for this specialist route, who or what qualifying occupier/category is relied on, and what documents support it.',
      fields: [
        {
          field: groundFactPath(code, 'factual_basis'),
          label: `Why is Ground ${code} said to apply?`,
          helpText: 'Summarise the statutory facts in careful, neutral prose.',
          type: 'textarea',
        },
        {
          field: groundFactPath(code, 'qualifying_occupier'),
          label: 'Who or what qualifying occupier/category is relied on?',
          helpText: 'For example: former employee, student cohort, minister, seasonal worker, or other qualifying category.',
        },
        {
          field: groundFactPath(code, 'occupier_relationship'),
          label: 'Relationship or status details',
          helpText: 'Explain the relationship to the landlord or the qualifying status relied on.',
        },
        {
          field: groundFactPath(code, 'trigger_date'),
          label: 'Relevant trigger or status date',
          helpText: 'Use the key date connected to the status relied on, if known.',
          type: 'date',
        },
        {
          field: groundFactPath(code, 'notice_or_status_details'),
          label: 'Notice, status, or context details',
          helpText: 'Add any prior notice, licence terms, employment/education link, or other relevant factual detail.',
          type: 'textarea',
        },
        {
          field: groundFactPath(code, 'supporting_evidence'),
          label: 'What evidence supports this ground?',
          helpText: 'List the key documents or records available.',
          type: 'textarea',
        },
      ],
    };
  }

  return null;
}

interface Section8SpecialistGroundDetailsProps {
  facts: WizardFacts;
  selectedGrounds: string[];
  onUpdate: (updates: Record<string, any>) => void | Promise<void>;
}

const Section8SpecialistGroundDetails: React.FC<Section8SpecialistGroundDetailsProps> = ({
  facts,
  selectedGrounds,
  onUpdate,
}) => {
  const selectedGroundConfigs = useMemo(() => {
    return Array.from(
      new Set(
        selectedGrounds
          .map((ground) => normalizeEnglandGroundCode(ground))
          .filter((ground): ground is EnglandGroundCode => Boolean(ground))
      )
    )
      .map((code) => buildGroundDetailPanelConfig(code))
      .filter((panel): panel is GroundDetailPanelConfig => Boolean(panel));
  }, [selectedGrounds]);

  if (selectedGroundConfigs.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 rounded-lg border border-slate-200 bg-white/90 p-4">
      <div className="space-y-1">
        <h5 className="text-sm font-medium text-slate-900">Specialist Ground Details</h5>
        <p className="text-xs text-slate-600">
          These answers feed the notice particulars, witness statement, case summary, and court-facing support text.
          Keep them factual and specific rather than argumentative.
        </p>
      </div>

      {selectedGroundConfigs.map((panel) => (
        <section key={panel.code} className="space-y-3 rounded-lg border border-slate-200 p-4">
          <div className="space-y-1">
            <h6 className="text-sm font-semibold text-slate-900">
              Ground {panel.code} - {panel.title}
            </h6>
            <p className="text-xs text-slate-600">{panel.intro}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {panel.fields.map((field) => {
              const value = (facts as Record<string, any>)[field.field] || '';
              const isTextArea = field.type === 'textarea';
              const fieldId = `${panel.code}-${field.field.replace(/[^a-z0-9]+/gi, '-')}`;

              return (
                <div key={field.field} className={isTextArea ? 'md:col-span-2 space-y-1' : 'space-y-1'}>
                  <label htmlFor={fieldId} className="block text-sm font-medium text-gray-700">
                    {field.label}
                  </label>
                  {isTextArea ? (
                    <textarea
                      id={fieldId}
                      rows={4}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
                      value={value}
                      placeholder={field.placeholder}
                      onChange={(e) => onUpdate({ [field.field]: e.target.value })}
                    />
                  ) : (
                    <input
                      id={fieldId}
                      type={field.type || 'text'}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
                      value={value}
                      placeholder={field.placeholder}
                      onChange={(e) => onUpdate({ [field.field]: e.target.value })}
                    />
                  )}
                  <p className="text-xs text-gray-500">{field.helpText}</p>
                </div>
              );
            })}
          </div>
        </section>
      ))}
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
    onUpdate({ section8_grounds: newGrounds });
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
                <p className="text-xs text-[#7C3AED] mt-2">
                  Arrears-led particulars can still be refined later, but specialist grounds should be factually anchored here so the pack reads coherently throughout.
                </p>
              </div>

              <Section8SpecialistGroundDetails
                facts={facts}
                selectedGrounds={selectedGrounds}
                onUpdate={onUpdate}
              />
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
    onUpdate({ section8_grounds: newGrounds });
  };

  // Handle subflow completion
  const handleSubflowComplete = useCallback(() => {
    setSubflowComplete(true);
  }, []);


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

      {/* Notice-only mode header */}
      {isNoticeOnlyMode && (
        <div className="rounded-[1.5rem] border border-purple-200 bg-purple-50 p-5">
          <div className="flex flex-wrap gap-2">
            {['Form 3A notice', 'Service details', 'Grounds and dates'].map((item) => (
              <span
                key={item}
                className="rounded-full border border-purple-200 bg-white/80 px-3 py-1.5 text-xs font-semibold text-purple-900 shadow-sm"
              >
                {item}
              </span>
            ))}
          </div>
          <h4 className="mt-4 text-sm font-medium text-purple-900">
            Generate Your {isEngland ? 'Form 3A' : noticeProductLabel}
          </h4>
          <p className="mt-1 text-sm leading-6 text-purple-700">
            Complete the details below to prepare your court-ready eviction notice.
          </p>
        </div>
      )}

      {/* ================================================================== */}
      {/* PATH A: Already served - show existing notice details */}
      {/* ================================================================== */}
      {noticeAlreadyServed === true && (
        <>
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
            <div className="pt-4 border-t border-gray-200 space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Form 3A Grounds
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
                <div className="space-y-4">
                  <div className="rounded-[1.4rem] border border-purple-200 bg-purple-50 p-4">
                    <p className="text-sm text-purple-800">
                      <strong>Selected grounds:</strong> {selectedGrounds.join(', ')}
                    </p>
                    <p className="text-xs text-purple-700 mt-1">
                      Minimum notice period: {minNoticePeriodLabel}
                    </p>
                    <p className="text-xs text-[#7C3AED] mt-2">
                      If this is a specialist ground, add the factual basis here so the court forms and support documents stay aligned with the notice already served.
                    </p>
                  </div>

                  <Section8SpecialistGroundDetails
                    facts={facts}
                    selectedGrounds={selectedGrounds}
                    onUpdate={onUpdate}
                  />
                </div>
              )}
            </div>
          )}

          {/* Section 8 particulars note - moved to Arrears section */}
          {isSection8 && selectedGrounds.length > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>Next step:</strong> Arrears-led and general narrative drafting can still be refined later,
                but these structured answers will now carry through into the notice support text, witness statement,
                and case summary.
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
    </div>
  );
};

export default NoticeSection;
