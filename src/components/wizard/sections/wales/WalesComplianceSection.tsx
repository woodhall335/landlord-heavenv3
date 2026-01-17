/**
 * Wales Compliance Section - Notice Only Wizard
 *
 * Schema-driven compliance section for Wales eviction notices.
 * Uses the Wales compliance schema module as the single source of truth.
 *
 * Supports both Wales routes:
 * - section_173 (no-fault): Shows pre-service compliance only
 * - fault_based: Shows pre-service compliance + breach evidence/ground selection
 *
 * Key features:
 * - Schema-driven field rendering based on input_type
 * - Conditional field visibility via applies_if evaluation
 * - HARD_BLOCK errors displayed inline at top
 * - SOFT_BLOCK warnings displayed as amber alerts
 * - No file uploads required (Notice Only = confirmations + guidance)
 */

'use client';

import React, { useMemo, useCallback } from 'react';
import { RiErrorWarningLine, RiAlertLine, RiInformationLine } from 'react-icons/ri';

import type { WizardFacts, ArrearsItem } from '@/lib/case-facts/schema';
import {
  WALES_COMPLIANCE_FIELDS,
  type ComplianceField,
  type ComplianceCategory,
  shouldFieldApply,
  getBlockingViolations,
  getSoftBlockWarnings,
  normalizeWalesFaultGrounds,
  hasArrearsGroundSelected,
} from '@/lib/wales/compliance-schema';
import { ArrearsScheduleStep } from '../../ArrearsScheduleStep';
import { computeArrears } from '@/lib/arrears-engine';
import { isWalesSection157ThresholdMet, calculateWalesArrearsInWeeks } from '@/lib/wales/seriousArrearsThreshold';

interface WalesComplianceSectionProps {
  facts: WizardFacts;
  jurisdiction: 'england' | 'wales';
  onUpdate: (updates: Record<string, unknown>) => void | Promise<void>;
  /** Optional callback to set the current question ID for Ask Heaven context */
  onSetCurrentQuestionId?: (fieldId: string | undefined) => void;
}

/**
 * Categories that apply to both fault-based and no-fault (section_173) routes.
 * These are the "general pre-service compliance" categories.
 */
const GENERAL_COMPLIANCE_CATEGORIES: ComplianceCategory[] = [
  'landlord_registration',
  'occupation_contract',
  'deposit',
  'property_safety',
  'eviction_safeguards',
];

/**
 * Categories that only apply to fault-based routes.
 */
const FAULT_BASED_ONLY_CATEGORIES: ComplianceCategory[] = [
  'fault_based_grounds',
  'breach_evidence',
];

/**
 * Human-readable category titles
 */
const CATEGORY_TITLES: Record<ComplianceCategory, string> = {
  landlord_registration: 'Landlord Registration',
  occupation_contract: 'Occupation Contract',
  deposit: 'Deposit Protection',
  property_safety: 'Property Safety & Certificates',
  eviction_safeguards: 'Eviction Safeguards',
  fault_based_grounds: 'Breach Ground Selection',
  breach_evidence: 'Breach Evidence',
};

/**
 * Category descriptions
 */
const CATEGORY_DESCRIPTIONS: Record<ComplianceCategory, string> = {
  landlord_registration: 'Verify your Rent Smart Wales registration status',
  occupation_contract: 'Confirm written statement of occupation contract was provided',
  deposit: 'Confirm deposit protection requirements (if applicable)',
  property_safety: 'Verify safety certificates and alarms are in place',
  eviction_safeguards: 'Check for retaliatory eviction and local authority safeguards',
  fault_based_grounds: 'Select the statutory ground for your breach notice',
  breach_evidence: 'Confirm you have evidence to support the breach',
};

/**
 * Deposit scheme options for Wales
 */
const WALES_DEPOSIT_SCHEMES = [
  { value: 'deposit_protection_service_wales', label: 'Deposit Protection Service (Wales)' },
  { value: 'mydeposits_wales', label: 'MyDeposits (Wales)' },
  { value: 'tenancy_deposit_scheme_wales', label: 'Tenancy Deposit Scheme (Wales)' },
  { value: 'other', label: 'Other approved scheme' },
];

/**
 * Fault ground labels for Wales
 */
const WALES_FAULT_GROUND_LABELS: Record<string, string> = {
  rent_arrears_serious: 'Serious rent arrears (Section 157) - 8+ weeks unpaid',
  rent_arrears_other: 'Other rent arrears (Section 159) - less than 8 weeks',
  antisocial_behaviour: 'Anti-social behaviour (Section 161)',
  breach_of_contract: 'Breach of contract (Section 162)',
  false_statement: 'False statement to obtain contract (Section 162)',
};

/**
 * YesNoToggle - Reusable yes/no input with blocking message support
 */
const YesNoToggle: React.FC<{
  id: string;
  value: boolean | undefined;
  onChange: (value: boolean) => void;
  label: string;
  required?: boolean;
  helperText?: string;
  blockingMessage?: string;
  isBlocker?: boolean;
  expectedValue?: boolean;
  onFocus?: () => void;
}> = ({ id, value, onChange, label, required, helperText, blockingMessage, isBlocker, expectedValue = true, onFocus }) => {
  // Determine if current value triggers a block
  const showBlockMessage = value !== undefined && value !== expectedValue && blockingMessage;

  return (
    <div className="space-y-2" onFocus={onFocus}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="flex items-center gap-4">
        <label className={`
          flex items-center px-4 py-2 border rounded-md cursor-pointer transition-all
          ${value === true
            ? (expectedValue === true ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50')
            : 'border-gray-200 hover:border-gray-300'}
        `}>
          <input
            type="radio"
            name={id}
            checked={value === true}
            onChange={() => onChange(true)}
            onFocus={onFocus}
            className="mr-2"
          />
          <span className="text-sm">Yes</span>
        </label>
        <label className={`
          flex items-center px-4 py-2 border rounded-md cursor-pointer transition-all
          ${value === false
            ? (expectedValue === false ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50')
            : 'border-gray-200 hover:border-gray-300'}
        `}>
          <input
            type="radio"
            name={id}
            checked={value === false}
            onChange={() => onChange(false)}
            onFocus={onFocus}
            className="mr-2"
          />
          <span className="text-sm">No</span>
        </label>
      </div>
      {helperText && <p className="text-xs text-gray-500">{helperText}</p>}
      {showBlockMessage && (
        <p className={`text-sm font-medium ${isBlocker ? 'text-red-600' : 'text-amber-600'}`}>
          {blockingMessage}
        </p>
      )}
    </div>
  );
};

/**
 * Render a single compliance field based on its input_type
 */
const ComplianceFieldInput: React.FC<{
  field: ComplianceField;
  value: unknown;
  onChange: (value: unknown) => void;
  onFocus?: () => void;
}> = ({ field, value, onChange, onFocus }) => {
  const isBlocker = field.blocking_level === 'HARD_BLOCK';

  switch (field.input_type) {
    case 'boolean':
      return (
        <YesNoToggle
          id={field.field_id}
          value={value as boolean | undefined}
          onChange={onChange}
          label={field.question_text}
          required={isBlocker}
          helperText={field.legal_basis}
          blockingMessage={field.block_message}
          isBlocker={isBlocker}
          expectedValue={field.expected_boolean_value ?? true}
          onFocus={onFocus}
        />
      );

    case 'enum_multi':
      // Multi-select checkboxes for wales_fault_grounds
      if (field.field_id === 'wales_fault_grounds') {
        const selectedGrounds = normalizeWalesFaultGrounds(value);

        const handleGroundToggle = (ground: string) => {
          const newGrounds = selectedGrounds.includes(ground)
            ? selectedGrounds.filter((g) => g !== ground)
            : [...selectedGrounds, ground];
          onChange(newGrounds);
        };

        return (
          <div className="space-y-3" onFocus={onFocus}>
            <label className="block text-sm font-medium text-gray-700">
              {field.question_text}
              {isBlocker && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="grid grid-cols-1 gap-2">
              {field.enum_values?.map((enumVal) => (
                <label
                  key={enumVal}
                  className={`
                    flex items-start p-3 border rounded-lg cursor-pointer transition-all
                    ${selectedGrounds.includes(enumVal)
                      ? 'border-[#7C3AED] bg-purple-50 ring-2 ring-purple-200'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}
                  `}
                >
                  <input
                    type="checkbox"
                    checked={selectedGrounds.includes(enumVal)}
                    onChange={() => handleGroundToggle(enumVal)}
                    onFocus={onFocus}
                    className="mt-0.5 mr-3"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-900">
                      {WALES_FAULT_GROUND_LABELS[enumVal] || enumVal}
                    </span>
                  </div>
                </label>
              ))}
            </div>
            {selectedGrounds.length > 0 && (
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-sm text-purple-800">
                  <strong>Selected:</strong> {selectedGrounds.map((g) =>
                    WALES_FAULT_GROUND_LABELS[g] || g
                  ).join(', ')}
                </p>
              </div>
            )}
            <p className="text-xs text-gray-500">{field.legal_basis}</p>
          </div>
        );
      }
      // Generic enum_multi (if any other fields use it)
      return null;

    case 'enum':
      // Single-select dropdown (not used for wales_fault_grounds anymore)

      // Special handling for deposit scheme
      if (field.field_id === 'deposit_scheme') {
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.question_text}
            </label>
            <select
              id={field.field_id}
              className="w-full max-w-md rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
              value={(value as string) || ''}
              onChange={(e) => onChange(e.target.value || undefined)}
              onFocus={onFocus}
            >
              <option value="">Select scheme...</option>
              {WALES_DEPOSIT_SCHEMES.map((scheme) => (
                <option key={scheme.value} value={scheme.value}>
                  {scheme.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500">{field.legal_basis}</p>
          </div>
        );
      }

      // Generic enum
      return (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {field.question_text}
            {isBlocker && <span className="text-red-500 ml-1">*</span>}
          </label>
          <select
            id={field.field_id}
            className="w-full max-w-md rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value || undefined)}
            onFocus={onFocus}
          >
            <option value="">Select...</option>
            {field.enum_values?.map((enumVal) => (
              <option key={enumVal} value={enumVal}>
                {enumVal.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500">{field.legal_basis}</p>
        </div>
      );

    case 'number':
      return (
        <div className="space-y-2">
          <label htmlFor={field.field_id} className="block text-sm font-medium text-gray-700">
            {field.question_text}
            {isBlocker && <span className="text-red-500 ml-1">*</span>}
          </label>
          <input
            id={field.field_id}
            type="number"
            min="0"
            step={field.field_id.includes('amount') ? '0.01' : '1'}
            className="w-full max-w-xs rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
            value={(value as number) ?? ''}
            onChange={(e) => {
              const val = e.target.value;
              onChange(val === '' ? undefined : parseFloat(val));
            }}
            onFocus={onFocus}
            placeholder={field.field_id.includes('amount') ? '0.00' : '0'}
          />
          <p className="text-xs text-gray-500">{field.legal_basis}</p>
        </div>
      );

    case 'date':
      return (
        <div className="space-y-2">
          <label htmlFor={field.field_id} className="block text-sm font-medium text-gray-700">
            {field.question_text}
            {isBlocker && <span className="text-red-500 ml-1">*</span>}
          </label>
          <input
            id={field.field_id}
            type="date"
            className="w-full max-w-xs rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value || undefined)}
            onFocus={onFocus}
          />
          <p className="text-xs text-gray-500">{field.legal_basis}</p>
        </div>
      );

    case 'text':
      // For evidence_guidance, show as read-only guidance
      if (field.field_id === 'evidence_guidance') {
        return (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg" onFocus={onFocus} tabIndex={0}>
            <div className="flex items-start gap-2">
              <RiInformationLine className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="text-sm font-medium text-blue-900 mb-2">Evidence Guidance</h5>
                <p className="text-sm text-blue-800 mb-2">
                  Keep records that support your breach claim. For Notice Only, you do not need to upload evidence now,
                  but you should retain it for future reference.
                </p>
                <ul className="text-xs text-blue-700 list-disc list-inside space-y-1">
                  <li>Rent statements and payment records</li>
                  <li>Correspondence with the contract holder</li>
                  <li>Photographs or dated evidence</li>
                  <li>Witness statements (if applicable)</li>
                  <li>Police reports or local authority communications</li>
                </ul>
              </div>
            </div>
          </div>
        );
      }

      // Regular text area
      return (
        <div className="space-y-2">
          <label htmlFor={field.field_id} className="block text-sm font-medium text-gray-700">
            {field.question_text}
            {isBlocker && <span className="text-red-500 ml-1">*</span>}
          </label>
          <textarea
            id={field.field_id}
            rows={4}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value || undefined)}
            onFocus={onFocus}
            placeholder="Enter details..."
          />
          <p className="text-xs text-gray-500">{field.legal_basis}</p>
        </div>
      );

    default:
      return null;
  }
};

/**
 * Arrears Schedule Guidance Panel
 * Shown when an arrears ground is selected in Wales fault-based notice
 */
const ArrearsScheduleGuidancePanel: React.FC<{
  onFocus?: () => void;
}> = ({ onFocus }) => {
  return (
    <div
      className="p-4 bg-blue-50 border border-blue-200 rounded-lg"
      onFocus={onFocus}
      tabIndex={0}
    >
      <div className="flex items-start gap-2">
        <RiInformationLine className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <h5 className="text-sm font-medium text-blue-900 mb-2">Rent Schedule Guidance</h5>
          <p className="text-sm text-blue-800 mb-2">
            For rent arrears grounds, you should prepare a rent schedule or payment history. This is essential
            if you need to proceed with possession proceedings later.
          </p>
          <ul className="text-xs text-blue-700 list-disc list-inside space-y-1">
            <li>Include all dates rent was due and amounts charged</li>
            <li>Record all payments received with dates and amounts</li>
            <li>Show running balance after each transaction</li>
            <li>Calculate total arrears as at the date of notice</li>
          </ul>
          <p className="text-xs text-blue-600 mt-2 italic">
            For Notice Only, you confirm you have this documentation but do not need to upload it now.
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * Fields that are rendered in dedicated UI blocks (not via schema-driven rendering).
 * These are excluded from the generic category rendering to prevent duplication.
 *
 * FIX FOR ISSUE A: user_declaration is rendered in a dedicated "Declaration" block
 * at the bottom of the section, so we exclude it from schema-driven rendering.
 */
const FIELDS_WITH_DEDICATED_UI: string[] = ['user_declaration'];

/**
 * Render a category of compliance fields
 */
const ComplianceCategorySection: React.FC<{
  category: ComplianceCategory;
  fields: ComplianceField[];
  facts: WizardFacts;
  onUpdate: (updates: Record<string, unknown>) => void;
  onSetCurrentQuestionId?: (fieldId: string | undefined) => void;
}> = ({ category, fields, facts, onUpdate, onSetCurrentQuestionId }) => {
  // Filter fields to those that apply based on current facts
  // Also exclude fields that have dedicated UI blocks to prevent duplication (Issue A fix)
  const applicableFields = fields.filter((field) =>
    shouldFieldApply(field.field_id, facts) && !FIELDS_WITH_DEDICATED_UI.includes(field.field_id)
  );

  // Check if arrears guidance should show (for breach_evidence category with arrears grounds)
  const showArrearsGuidance = category === 'breach_evidence' && hasArrearsGroundSelected(facts.wales_fault_grounds);

  if (applicableFields.length === 0 && !showArrearsGuidance) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="border-b border-gray-200 pb-2">
        <h3 className="text-lg font-medium text-gray-900">{CATEGORY_TITLES[category]}</h3>
        <p className="text-sm text-gray-500">{CATEGORY_DESCRIPTIONS[category]}</p>
      </div>

      <div className="space-y-6 pl-0 md:pl-2">
        {/* Show arrears schedule guidance at the top of breach_evidence when arrears grounds selected */}
        {showArrearsGuidance && (
          <ArrearsScheduleGuidancePanel
            onFocus={() => onSetCurrentQuestionId?.('arrears_schedule_guidance')}
          />
        )}

        {applicableFields.map((field) => (
          <ComplianceFieldInput
            key={field.field_id}
            field={field}
            value={facts[field.field_id as keyof WizardFacts]}
            onChange={(value) => onUpdate({ [field.field_id]: value })}
            onFocus={() => onSetCurrentQuestionId?.(field.field_id)}
          />
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// ARREARS SCHEDULE SECTION
// ============================================================================
interface ArrearsScheduleSectionProps {
  facts: WizardFacts;
  onUpdate: (updates: Record<string, unknown>) => void | Promise<void>;
}

/**
 * Renders the ArrearsScheduleStep for Wales arrears grounds.
 * Shows a period-by-period rent schedule table editor.
 */
const ArrearsScheduleSection: React.FC<ArrearsScheduleSectionProps> = ({
  facts,
  onUpdate,
}) => {
  // Get arrears items from facts (check both locations)
  const arrearsItems: ArrearsItem[] = useMemo(() => {
    return facts.issues?.rent_arrears?.arrears_items ||
           facts.arrears_items ||
           [];
  }, [facts.issues?.rent_arrears?.arrears_items, facts.arrears_items]);

  // Calculate arrears summary
  const arrearsSummary = useMemo(() => {
    if (!arrearsItems || arrearsItems.length === 0) return null;
    const rentAmount = facts.rent_amount || 0;
    const rentFrequency = facts.rent_frequency || 'monthly';
    return computeArrears(arrearsItems, rentFrequency, rentAmount);
  }, [arrearsItems, facts.rent_amount, facts.rent_frequency]);

  // Calculate Wales Section 157 threshold status
  const thresholdResult = useMemo(() => {
    if (!arrearsSummary || arrearsSummary.total_arrears === 0) return null;
    const rentAmount = facts.rent_amount || 0;
    const rentFrequency = facts.rent_frequency || 'monthly';
    return isWalesSection157ThresholdMet(
      arrearsSummary.total_arrears,
      rentFrequency,
      rentAmount
    );
  }, [arrearsSummary, facts.rent_amount, facts.rent_frequency]);

  // Convert facts to format expected by ArrearsScheduleStep
  const scheduleStepFacts = useMemo(() => ({
    tenancy: {
      start_date: facts.tenancy_start_date,
      rent_amount: facts.rent_amount,
      rent_frequency: facts.rent_frequency,
    },
    tenancy_start_date: facts.tenancy_start_date,
    rent_amount: facts.rent_amount,
    rent_frequency: facts.rent_frequency,
    notice: {
      notice_date: facts.notice_served_date,
    },
    notice_date: facts.notice_served_date,
    issues: {
      rent_arrears: {
        arrears_items: arrearsItems,
        has_arrears: arrearsItems.length > 0,
      },
    },
  }), [facts, arrearsItems]);

  // Handle updates from ArrearsScheduleStep
  // Auto-derives arrears_amount, arrears_weeks_unpaid, and arrears_schedule_confirmed
  const handleArrearsUpdate = useCallback(async (updates: Record<string, any>) => {
    if (updates.issues?.rent_arrears) {
      const arrearsData = updates.issues.rent_arrears;
      const totalArrears = arrearsData.total_arrears || 0;
      const arrearsItems = arrearsData.arrears_items || [];
      const rentAmount = facts.rent_amount || 0;
      const rentFrequency = facts.rent_frequency || 'monthly';

      // Calculate weeks of rent unpaid from the schedule data
      const weeksUnpaid = rentAmount > 0 && totalArrears > 0
        ? calculateWalesArrearsInWeeks(totalArrears, rentAmount, rentFrequency)
        : 0;

      await onUpdate({
        // Canonical flat keys (same as England)
        arrears_items: arrearsItems,
        total_arrears: totalArrears,
        arrears_at_notice_date: arrearsData.arrears_at_notice_date,
        // Auto-derived compliance fields (no longer asked as questions)
        arrears_amount: totalArrears,
        arrears_weeks_unpaid: weeksUnpaid,
        arrears_schedule_confirmed: arrearsItems.length > 0,
        // Also keep nested structure for compatibility
        issues: {
          ...facts.issues,
          rent_arrears: arrearsData,
        },
      });
    } else {
      await onUpdate(updates);
    }
  }, [facts.issues, facts.rent_amount, facts.rent_frequency, onUpdate]);

  // Check prerequisites
  const missingPrerequisites: string[] = [];
  if (!facts.tenancy_start_date) missingPrerequisites.push('Tenancy start date');
  if (!facts.rent_amount) missingPrerequisites.push('Rent amount');
  if (!facts.rent_frequency) missingPrerequisites.push('Rent frequency');

  // Determine if serious arrears ground is selected
  const selectedGrounds = normalizeWalesFaultGrounds(facts.wales_fault_grounds);
  const isSerious = selectedGrounds.includes('rent_arrears_serious');

  return (
    <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div>
        <h4 className="text-sm font-semibold text-blue-900">
          {isSerious ? 'Section 157 - Serious Rent Arrears Schedule' : 'Section 159 - Rent Arrears Schedule'}
        </h4>
        <p className="text-xs text-blue-700 mt-1">
          {isSerious
            ? 'Complete the arrears schedule below. At least 2 months arrears required for Section 157.'
            : 'Complete the arrears schedule below to document the rent arrears.'}
        </p>
      </div>

      {missingPrerequisites.length > 0 ? (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800 font-medium">Missing Information</p>
          <p className="text-xs text-amber-700 mt-1">
            Please complete the Tenancy section first: {missingPrerequisites.join(', ')}
          </p>
        </div>
      ) : (
        <>
          <ArrearsScheduleStep
            facts={scheduleStepFacts}
            onUpdate={handleArrearsUpdate}
            jurisdiction="wales"
          />

          {/* Summary display */}
          {arrearsSummary && arrearsSummary.total_arrears > 0 && (
            <div className="p-3 bg-white border border-blue-200 rounded-lg">
              <h5 className="text-sm font-medium text-blue-900 mb-2">Arrears Summary</h5>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Total arrears:</span>
                  <span className="ml-2 font-semibold text-red-600">
                    £{arrearsSummary.total_arrears.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">In months:</span>
                  <span className="ml-2 font-semibold">
                    {arrearsSummary.arrears_in_months.toFixed(2)}
                  </span>
                </div>
                {/* Wales Section 157 threshold display */}
                {isSerious && thresholdResult && (
                  <>
                    <div>
                      <span className="text-gray-600">Threshold required:</span>
                      <span className="ml-2 font-semibold">
                        {thresholdResult.thresholdLabel} (£{thresholdResult.thresholdAmount.toFixed(2)})
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <span className={`ml-2 font-semibold ${thresholdResult.met ? 'text-green-600' : 'text-amber-600'}`}>
                        {thresholdResult.met ? 'Threshold Met' : 'Below Threshold'}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Wales Section 157 threshold status indicator */}
              {isSerious && thresholdResult && (
                <div className={`mt-3 p-2 rounded-lg ${
                  thresholdResult.met
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-amber-50 border border-amber-200'
                }`}>
                  <p className={`text-sm font-medium ${
                    thresholdResult.met ? 'text-green-800' : 'text-amber-800'
                  }`}>
                    {thresholdResult.met
                      ? '✓ Section 157 Threshold Met'
                      : '⚠ Section 157 Threshold Not Met'}
                  </p>
                  <p className={`text-xs mt-1 ${
                    thresholdResult.met ? 'text-green-700' : 'text-amber-700'
                  }`}>
                    {thresholdResult.met
                      ? `Arrears of £${arrearsSummary.total_arrears.toFixed(2)} meet the statutory threshold for serious rent arrears under the Renting Homes (Wales) Act 2016.`
                      : `Arrears of £${arrearsSummary.total_arrears.toFixed(2)} are below the Section 157 threshold. You may use Section 159 (some rent arrears) instead.`}
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

/**
 * Main Wales Compliance Section component
 */
export const WalesComplianceSection: React.FC<WalesComplianceSectionProps> = ({
  facts,
  onUpdate,
  onSetCurrentQuestionId,
}) => {
  const route = facts.eviction_route as string | undefined;
  const isFaultBased = route === 'fault_based';
  const isSection173 = route === 'section_173';

  // Determine which categories to show based on route
  const visibleCategories = useMemo(() => {
    if (isFaultBased) {
      // Fault-based: show all categories
      return [...GENERAL_COMPLIANCE_CATEGORIES, ...FAULT_BASED_ONLY_CATEGORIES];
    }
    // Section 173 (no-fault): only show general compliance categories
    return GENERAL_COMPLIANCE_CATEGORIES;
  }, [isFaultBased]);

  // Group fields by category
  const fieldsByCategory = useMemo(() => {
    const grouped = new Map<ComplianceCategory, ComplianceField[]>();

    for (const category of visibleCategories) {
      const categoryFields = WALES_COMPLIANCE_FIELDS.filter((f) => f.category === category);
      if (categoryFields.length > 0) {
        grouped.set(category, categoryFields);
      }
    }

    return grouped;
  }, [visibleCategories]);

  // Get blocking violations and soft warnings
  const blockingViolations = useMemo(() => {
    // For section_173, filter out fault-based-only violations
    const allViolations = getBlockingViolations(facts);
    if (isSection173) {
      return allViolations.filter(
        (v) => !FAULT_BASED_ONLY_CATEGORIES.includes(v.field.category)
      );
    }
    return allViolations;
  }, [facts, isSection173]);

  const softWarnings = useMemo(() => {
    const allWarnings = getSoftBlockWarnings(facts);
    if (isSection173) {
      return allWarnings.filter(
        (w) => !FAULT_BASED_ONLY_CATEGORIES.includes(w.field.category)
      );
    }
    return allWarnings;
  }, [facts, isSection173]);

  // Handle updates
  const handleUpdate = useCallback(
    (updates: Record<string, unknown>) => {
      onUpdate(updates);
    },
    [onUpdate]
  );

  return (
    <div className="space-y-8">
      {/* Wales compliance info banner */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-1">
          Wales Pre-Service Compliance
        </h4>
        <p className="text-sm text-blue-800">
          {isFaultBased ? (
            <>
              Before serving a fault-based breach notice in Wales, you must verify compliance
              with Rent Smart Wales registration, occupation contract requirements, deposit
              protection (if applicable), and safety certificates. You must also confirm you
              have evidence to support the breach.
            </>
          ) : (
            <>
              Before serving a Section 173 notice in Wales, you must verify compliance with
              Rent Smart Wales registration, occupation contract requirements, deposit
              protection (if applicable), safety certificates, and safeguard requirements.
            </>
          )}
        </p>
      </div>

      {/* HARD_BLOCK violations at top */}
      {blockingViolations.length > 0 && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2">
            <RiErrorWarningLine className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-red-800 mb-2">
                Compliance Issues - Cannot Proceed
              </h4>
              <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                {blockingViolations.map((v, i) => (
                  <li key={i}>{v.message}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* SOFT_BLOCK warnings */}
      {softWarnings.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-2">
            <RiAlertLine className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-amber-800 mb-2">
                Warnings - Proceeding is High Risk
              </h4>
              <ul className="list-disc list-inside text-sm text-amber-700 space-y-1">
                {softWarnings.map((w, i) => (
                  <li key={i}>{w.message}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Render each category */}
      {visibleCategories.map((category) => {
        const categoryFields = fieldsByCategory.get(category);
        if (!categoryFields || categoryFields.length === 0) return null;

        return (
          <ComplianceCategorySection
            key={category}
            category={category}
            fields={categoryFields}
            facts={facts}
            onUpdate={handleUpdate}
            onSetCurrentQuestionId={onSetCurrentQuestionId}
          />
        );
      })}

      {/* =================================================================== */}
      {/* ARREARS SCHEDULE EDITOR - shown when arrears grounds are selected */}
      {/* =================================================================== */}
      {isFaultBased && hasArrearsGroundSelected(facts.wales_fault_grounds) && (
        <ArrearsScheduleSection
          facts={facts}
          onUpdate={handleUpdate}
        />
      )}

      {/* User declaration - always shown at the end */}
      {fieldsByCategory.has('breach_evidence') && isFaultBased && (
        <div className="pt-4 border-t border-gray-200">
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Declaration</h4>
            <YesNoToggle
              id="user_declaration"
              value={facts.user_declaration as boolean | undefined}
              onChange={(value) => handleUpdate({ user_declaration: value })}
              label="I confirm the information provided is true to the best of my knowledge, and I understand that serving a notice without proper grounds or compliance may lead to legal consequences."
              required
              expectedValue={true}
              blockingMessage="You must confirm the declaration to proceed."
              isBlocker={true}
              onFocus={() => onSetCurrentQuestionId?.('user_declaration')}
            />
          </div>
        </div>
      )}

      {/* Declaration for section_173 (no-fault) */}
      {isSection173 && (
        <div className="pt-4 border-t border-gray-200">
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Declaration</h4>
            <YesNoToggle
              id="user_declaration"
              value={facts.user_declaration as boolean | undefined}
              onChange={(value) => handleUpdate({ user_declaration: value })}
              label="I confirm the information provided is true to the best of my knowledge, and I understand that serving a Section 173 notice without meeting compliance requirements may affect its validity."
              required
              expectedValue={true}
              blockingMessage="You must confirm the declaration to proceed."
              isBlocker={true}
              onFocus={() => onSetCurrentQuestionId?.('user_declaration')}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default WalesComplianceSection;
