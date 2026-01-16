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
 * Features:
 * - Conditional "ground details" panels BEFORE breach_description
 * - ArrearsScheduleStep for arrears grounds (reused from England)
 * - "Use details as starting point" buttons to prepopulate breach_description
 * - AskHeavenInlineEnhancer for breach_description enhancement
 *
 * Notice periods (Wales):
 * - Section 173: 6 months minimum
 * - Fault-based (serious breach): 1 month minimum
 * - Fault-based (8+ weeks arrears): absolute ground
 */

'use client';

import React, { useMemo, useState, useCallback, useEffect } from 'react';
import type { WizardFacts, ArrearsItem } from '@/lib/case-facts/schema';
import { ArrearsScheduleStep } from '../../ArrearsScheduleStep';
import { AskHeavenInlineEnhancer } from '../../AskHeavenInlineEnhancer';
import { computeArrears } from '@/lib/arrears-engine';
import {
  generateWalesArrearsSummary,
  isWalesSection157ThresholdMet,
  getWalesFaultGroundDefinitions,
  getWalesFaultGroundByValue,
  type WalesFaultGroundDef,
} from '@/lib/wales';
import { normalizeWalesFaultGrounds } from '@/lib/wales/compliance-schema';
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

// ============================================================================
// ARREARS DETAILS PANEL
// ============================================================================
interface ArrearsDetailsPanelProps {
  facts: WizardFacts;
  onUpdate: (updates: Record<string, any>) => void | Promise<void>;
  selectedGrounds: string[];
  onUseAsSummary: (summary: string) => void;
}

const ArrearsDetailsPanel: React.FC<ArrearsDetailsPanelProps> = ({
  facts,
  onUpdate,
  selectedGrounds,
  onUseAsSummary,
}) => {
  // Get arrears items from facts
  const arrearsItems: ArrearsItem[] = useMemo(() => {
    return facts.issues?.rent_arrears?.arrears_items ||
           facts.arrears_items ||
           [];
  }, [facts.issues?.rent_arrears?.arrears_items, facts.arrears_items]);

  // Calculate arrears summary
  const arrearsSummary = useMemo(() => {
    if (!arrearsItems || arrearsItems.length === 0) {
      return null;
    }
    const rentAmount = facts.rent_amount || 0;
    const rentFrequency = facts.rent_frequency || 'monthly';
    return computeArrears(arrearsItems, rentFrequency, rentAmount);
  }, [arrearsItems, facts.rent_amount, facts.rent_frequency]);

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
  const handleArrearsUpdate = useCallback(async (updates: Record<string, any>) => {
    if (updates.issues?.rent_arrears) {
      const arrearsData = updates.issues.rent_arrears;
      await onUpdate({
        // Canonical flat keys (same as England)
        arrears_items: arrearsData.arrears_items,
        total_arrears: arrearsData.total_arrears,
        arrears_at_notice_date: arrearsData.arrears_at_notice_date,
        // Also keep nested structure for compatibility
        issues: {
          ...facts.issues,
          rent_arrears: arrearsData,
        },
      });
    } else {
      await onUpdate(updates);
    }
  }, [facts.issues, onUpdate]);

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

  // Generate summary text from arrears data using Wales-specific function
  const generateArrearsSummaryText = useCallback(() => {
    if (!arrearsSummary || arrearsSummary.total_arrears === 0) return '';

    const isSerious = selectedGrounds.includes('rent_arrears_serious');

    // Use the Wales-specific narrative generator with proper threshold checking
    return generateWalesArrearsSummary(
      arrearsSummary.total_arrears,
      arrearsSummary.arrears_in_months,
      arrearsSummary.periods_fully_unpaid,
      isSerious,
      thresholdResult?.met
    );
  }, [arrearsSummary, selectedGrounds, thresholdResult]);

  const handleUseSummary = () => {
    const summary = generateArrearsSummaryText();
    if (summary) {
      onUseAsSummary(summary);
    }
  };

  // Check prerequisites
  const missingPrerequisites: string[] = [];
  if (!facts.tenancy_start_date) missingPrerequisites.push('Tenancy start date');
  if (!facts.rent_amount) missingPrerequisites.push('Rent amount');
  if (!facts.rent_frequency) missingPrerequisites.push('Rent frequency');

  const isSerious = selectedGrounds.includes('rent_arrears_serious');

  return (
    <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div>
        <h4 className="text-sm font-semibold text-blue-900">
          {isSerious ? 'Section 157 - Serious Rent Arrears' : 'Section 159 - Rent Arrears'}
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

              {/* Use summary button */}
              <div className="mt-3 pt-3 border-t border-blue-200">
                <button
                  type="button"
                  onClick={handleUseSummary}
                  className="px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-300 rounded-md hover:bg-blue-200 transition-colors"
                >
                  Use arrears summary as starting point
                </button>
                <p className="text-xs text-blue-600 mt-1">
                  This will add the arrears details to your breach description below.
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ============================================================================
// ASB DETAILS PANEL
// ============================================================================
interface ASBDetailsPanelProps {
  facts: WizardFacts;
  onUpdate: (updates: Record<string, any>) => void | Promise<void>;
  onUseAsSummary: (summary: string) => void;
}

const ASBDetailsPanel: React.FC<ASBDetailsPanelProps> = ({
  facts,
  onUpdate,
  onUseAsSummary,
}) => {
  const generateASBSummary = useCallback(() => {
    const parts: string[] = ['ANTI-SOCIAL BEHAVIOUR (Section 161):'];

    if (facts.wales_asb_incident_date) {
      parts.push(`On ${facts.wales_asb_incident_date}${facts.wales_asb_incident_time ? ` at ${facts.wales_asb_incident_time}` : ''}`);
    }

    if (facts.wales_asb_location) {
      parts.push(`at ${facts.wales_asb_location}`);
    }

    if (facts.wales_asb_description) {
      parts.push(`the following incident occurred: ${facts.wales_asb_description}`);
    }

    if (facts.wales_asb_police_involved === true) {
      parts.push(`Police were involved${facts.wales_asb_police_ref ? ` (Ref: ${facts.wales_asb_police_ref})` : ''}.`);
    }

    if (facts.wales_asb_witness_details) {
      parts.push(`Witness details: ${facts.wales_asb_witness_details}`);
    }

    parts.push('This constitutes serious anti-social behaviour under Section 161 of the Renting Homes (Wales) Act 2016.');

    return parts.join(' ');
  }, [facts]);

  const handleUseSummary = () => {
    const summary = generateASBSummary();
    onUseAsSummary(summary);
  };

  return (
    <div className="space-y-4 p-4 bg-red-50 border border-red-200 rounded-lg">
      <div>
        <h4 className="text-sm font-semibold text-red-900">
          Section 161 - Anti-Social Behaviour Details
        </h4>
        <p className="text-xs text-red-700 mt-1">
          Provide details of the anti-social behaviour incident(s).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Incident date */}
        <div className="space-y-1">
          <label htmlFor="wales_asb_incident_date" className="block text-sm font-medium text-gray-700">
            Incident date
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            id="wales_asb_incident_date"
            type="date"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
            value={facts.wales_asb_incident_date || ''}
            onChange={(e) => onUpdate({ wales_asb_incident_date: e.target.value })}
          />
        </div>

        {/* Incident time */}
        <div className="space-y-1">
          <label htmlFor="wales_asb_incident_time" className="block text-sm font-medium text-gray-700">
            Incident time (optional)
          </label>
          <input
            id="wales_asb_incident_time"
            type="time"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
            value={facts.wales_asb_incident_time || ''}
            onChange={(e) => onUpdate({ wales_asb_incident_time: e.target.value })}
          />
        </div>
      </div>

      {/* Location */}
      <div className="space-y-1">
        <label htmlFor="wales_asb_location" className="block text-sm font-medium text-gray-700">
          Location of incident
        </label>
        <input
          id="wales_asb_location"
          type="text"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
          value={facts.wales_asb_location || ''}
          onChange={(e) => onUpdate({ wales_asb_location: e.target.value })}
          placeholder="e.g., Common hallway, garden area, property address"
        />
      </div>

      {/* Description */}
      <div className="space-y-1">
        <label htmlFor="wales_asb_description" className="block text-sm font-medium text-gray-700">
          Description of behaviour
          <span className="text-red-500 ml-1">*</span>
        </label>
        <textarea
          id="wales_asb_description"
          rows={3}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
          value={facts.wales_asb_description || ''}
          onChange={(e) => onUpdate({ wales_asb_description: e.target.value })}
          placeholder="Describe the anti-social behaviour in detail..."
        />
      </div>

      {/* Police involvement */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Were police involved?
        </label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="wales_asb_police_involved"
              checked={facts.wales_asb_police_involved === true}
              onChange={() => onUpdate({ wales_asb_police_involved: true })}
              className="mr-2"
            />
            Yes
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="wales_asb_police_involved"
              checked={facts.wales_asb_police_involved === false}
              onChange={() => onUpdate({ wales_asb_police_involved: false })}
              className="mr-2"
            />
            No
          </label>
        </div>
      </div>

      {/* Police reference - conditional */}
      {facts.wales_asb_police_involved === true && (
        <div className="space-y-1">
          <label htmlFor="wales_asb_police_ref" className="block text-sm font-medium text-gray-700">
            Police reference number
          </label>
          <input
            id="wales_asb_police_ref"
            type="text"
            className="w-full max-w-xs rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
            value={facts.wales_asb_police_ref || ''}
            onChange={(e) => onUpdate({ wales_asb_police_ref: e.target.value })}
            placeholder="e.g., CR/2024/123456"
          />
        </div>
      )}

      {/* Witness details */}
      <div className="space-y-1">
        <label htmlFor="wales_asb_witness_details" className="block text-sm font-medium text-gray-700">
          Witness details (optional)
        </label>
        <textarea
          id="wales_asb_witness_details"
          rows={2}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
          value={facts.wales_asb_witness_details || ''}
          onChange={(e) => onUpdate({ wales_asb_witness_details: e.target.value })}
          placeholder="Names and contact details of any witnesses..."
        />
      </div>

      {/* Use details button */}
      <div className="pt-3 border-t border-red-200">
        <button
          type="button"
          onClick={handleUseSummary}
          className="px-3 py-1.5 text-sm font-medium text-red-700 bg-red-100 border border-red-300 rounded-md hover:bg-red-200 transition-colors"
        >
          Use these details as starting point
        </button>
        <p className="text-xs text-red-600 mt-1">
          This will add the ASB details to your breach description below.
        </p>
      </div>
    </div>
  );
};

// ============================================================================
// BREACH OF CONTRACT DETAILS PANEL
// ============================================================================
interface BreachOfContractPanelProps {
  facts: WizardFacts;
  onUpdate: (updates: Record<string, any>) => void | Promise<void>;
  onUseAsSummary: (summary: string) => void;
}

const BreachOfContractPanel: React.FC<BreachOfContractPanelProps> = ({
  facts,
  onUpdate,
  onUseAsSummary,
}) => {
  const generateBreachSummary = useCallback(() => {
    const parts: string[] = ['BREACH OF OCCUPATION CONTRACT (Section 159):'];

    if (facts.wales_breach_clause) {
      parts.push(`The contract-holder has breached clause/term: ${facts.wales_breach_clause}.`);
    }

    if (facts.wales_breach_dates) {
      parts.push(`The breach occurred on/during: ${facts.wales_breach_dates}.`);
    }

    if (facts.wales_breach_evidence) {
      parts.push(`Evidence: ${facts.wales_breach_evidence}`);
    }

    parts.push('This constitutes a breach of the occupation contract under Section 159 of the Renting Homes (Wales) Act 2016.');

    return parts.join(' ');
  }, [facts]);

  const handleUseSummary = () => {
    const summary = generateBreachSummary();
    onUseAsSummary(summary);
  };

  return (
    <div className="space-y-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
      <div>
        <h4 className="text-sm font-semibold text-amber-900">
          Section 159 - Breach of Occupation Contract Details
        </h4>
        <p className="text-xs text-amber-700 mt-1">
          Provide details of the contract term(s) that have been breached.
        </p>
      </div>

      {/* Clause breached */}
      <div className="space-y-1">
        <label htmlFor="wales_breach_clause" className="block text-sm font-medium text-gray-700">
          Clause/term breached
          <span className="text-red-500 ml-1">*</span>
        </label>
        <input
          id="wales_breach_clause"
          type="text"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
          value={facts.wales_breach_clause || ''}
          onChange={(e) => onUpdate({ wales_breach_clause: e.target.value })}
          placeholder="e.g., Clause 5.2 - No pets allowed, Clause 8.1 - Noise restrictions"
        />
      </div>

      {/* Breach dates/period */}
      <div className="space-y-1">
        <label htmlFor="wales_breach_dates" className="block text-sm font-medium text-gray-700">
          Date(s) or period of breach
          <span className="text-red-500 ml-1">*</span>
        </label>
        <input
          id="wales_breach_dates"
          type="text"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
          value={facts.wales_breach_dates || ''}
          onChange={(e) => onUpdate({ wales_breach_dates: e.target.value })}
          placeholder="e.g., 15 January 2024, or ongoing since March 2024"
        />
      </div>

      {/* Evidence summary */}
      <div className="space-y-1">
        <label htmlFor="wales_breach_evidence" className="block text-sm font-medium text-gray-700">
          Evidence summary
        </label>
        <textarea
          id="wales_breach_evidence"
          rows={3}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
          value={facts.wales_breach_evidence || ''}
          onChange={(e) => onUpdate({ wales_breach_evidence: e.target.value })}
          placeholder="Describe the evidence you have of the breach..."
        />
      </div>

      {/* Use details button */}
      <div className="pt-3 border-t border-amber-200">
        <button
          type="button"
          onClick={handleUseSummary}
          className="px-3 py-1.5 text-sm font-medium text-amber-700 bg-amber-100 border border-amber-300 rounded-md hover:bg-amber-200 transition-colors"
        >
          Use these details as starting point
        </button>
        <p className="text-xs text-amber-600 mt-1">
          This will add the breach details to your description below.
        </p>
      </div>
    </div>
  );
};

// ============================================================================
// FALSE STATEMENT DETAILS PANEL
// ============================================================================
interface FalseStatementPanelProps {
  facts: WizardFacts;
  onUpdate: (updates: Record<string, any>) => void | Promise<void>;
  onUseAsSummary: (summary: string) => void;
}

const FalseStatementPanel: React.FC<FalseStatementPanelProps> = ({
  facts,
  onUpdate,
  onUseAsSummary,
}) => {
  const generateFalseStatementSummary = useCallback(() => {
    const parts: string[] = ['FALSE STATEMENT (Section 159):'];

    if (facts.wales_false_statement_summary) {
      parts.push(`The contract-holder made the following false statement to obtain the contract: ${facts.wales_false_statement_summary}`);
    }

    if (facts.wales_false_statement_discovered_date) {
      parts.push(`This was discovered on ${facts.wales_false_statement_discovered_date}.`);
    }

    if (facts.wales_false_statement_evidence) {
      parts.push(`Evidence: ${facts.wales_false_statement_evidence}`);
    }

    parts.push('This false statement was made to induce the landlord to enter into the occupation contract under Section 159 of the Renting Homes (Wales) Act 2016.');

    return parts.join(' ');
  }, [facts]);

  const handleUseSummary = () => {
    const summary = generateFalseStatementSummary();
    onUseAsSummary(summary);
  };

  return (
    <div className="space-y-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
      <div>
        <h4 className="text-sm font-semibold text-purple-900">
          Section 159 - False Statement Details
        </h4>
        <p className="text-xs text-purple-700 mt-1">
          Provide details of the false statement made to obtain the occupation contract.
        </p>
      </div>

      {/* False statement summary */}
      <div className="space-y-1">
        <label htmlFor="wales_false_statement_summary" className="block text-sm font-medium text-gray-700">
          What false statement was made?
          <span className="text-red-500 ml-1">*</span>
        </label>
        <textarea
          id="wales_false_statement_summary"
          rows={3}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
          value={facts.wales_false_statement_summary || ''}
          onChange={(e) => onUpdate({ wales_false_statement_summary: e.target.value })}
          placeholder="Describe the false statement that was made..."
        />
      </div>

      {/* Discovered date */}
      <div className="space-y-1">
        <label htmlFor="wales_false_statement_discovered_date" className="block text-sm font-medium text-gray-700">
          When was this discovered?
        </label>
        <input
          id="wales_false_statement_discovered_date"
          type="date"
          className="w-full max-w-xs rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
          value={facts.wales_false_statement_discovered_date || ''}
          onChange={(e) => onUpdate({ wales_false_statement_discovered_date: e.target.value })}
        />
      </div>

      {/* Evidence summary */}
      <div className="space-y-1">
        <label htmlFor="wales_false_statement_evidence" className="block text-sm font-medium text-gray-700">
          Evidence summary
        </label>
        <textarea
          id="wales_false_statement_evidence"
          rows={2}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
          value={facts.wales_false_statement_evidence || ''}
          onChange={(e) => onUpdate({ wales_false_statement_evidence: e.target.value })}
          placeholder="Describe the evidence you have..."
        />
      </div>

      {/* Use details button */}
      <div className="pt-3 border-t border-purple-200">
        <button
          type="button"
          onClick={handleUseSummary}
          className="px-3 py-1.5 text-sm font-medium text-purple-700 bg-purple-100 border border-purple-300 rounded-md hover:bg-purple-200 transition-colors"
        >
          Use these details as starting point
        </button>
        <p className="text-xs text-purple-600 mt-1">
          This will add the false statement details to your description below.
        </p>
      </div>
    </div>
  );
};

// ============================================================================
// WALES PART D PARTICULARS WITH ASK HEAVEN
// ============================================================================
// Court-ready particulars for Wales fault-based notices.
// Provides inline AI enhancement using AskHeavenInlineEnhancer.
// ============================================================================

interface WalesPartDParticularsProps {
  facts: WizardFacts;
  selectedGrounds: string[];
  arrearsSummary: ReturnType<typeof computeArrears> | null;
  onUpdate: (updates: Record<string, any>) => void | Promise<void>;
}

const WalesPartDParticulars: React.FC<WalesPartDParticularsProps> = ({
  facts,
  selectedGrounds,
  arrearsSummary,
  onUpdate,
}) => {
  const particularsText = facts.wales_part_d_particulars || '';

  // Check which grounds are selected
  const hasArrearsGround = selectedGrounds.includes('rent_arrears_serious') ||
                           selectedGrounds.includes('rent_arrears_other');
  const hasASBGround = selectedGrounds.includes('antisocial_behaviour');
  const hasBreachGround = selectedGrounds.includes('breach_of_contract');
  const hasFalseStatementGround = selectedGrounds.includes('false_statement');

  // Generate a suggested starting point based on breach description and arrears data
  const generateSuggestion = useCallback(() => {
    const parts: string[] = [];

    // Start with breach description if present
    if (facts.breach_description) {
      parts.push(facts.breach_description);
    }

    // Add arrears details if relevant
    if (hasArrearsGround && arrearsSummary && arrearsSummary.total_arrears > 0) {
      const isSerious = selectedGrounds.includes('rent_arrears_serious');
      const section = isSerious ? 'Section 157' : 'Section 159';
      parts.push(`\n\nARREARS PARTICULARS (${section}):`);
      parts.push(`Total arrears outstanding: £${arrearsSummary.total_arrears.toFixed(2)}`);
      parts.push(`Arrears equivalent to ${arrearsSummary.arrears_in_months.toFixed(1)} months of rent.`);
      if (arrearsSummary.periods_fully_unpaid > 0) {
        parts.push(`${arrearsSummary.periods_fully_unpaid} rental period(s) are fully unpaid.`);
      }
      if (isSerious) {
        parts.push('This meets the threshold for serious rent arrears under Section 157 of the Renting Homes (Wales) Act 2016.');
      }
    }

    // Add ASB details if relevant
    if (hasASBGround && facts.wales_asb_description) {
      parts.push('\n\nANTI-SOCIAL BEHAVIOUR PARTICULARS (Section 161):');
      if (facts.wales_asb_incident_date) {
        parts.push(`Incident date: ${facts.wales_asb_incident_date}`);
      }
      parts.push(facts.wales_asb_description);
      if (facts.wales_asb_police_involved === true) {
        parts.push(`Police were involved${facts.wales_asb_police_ref ? ` (Reference: ${facts.wales_asb_police_ref})` : ''}.`);
      }
    }

    // Add breach of contract details if relevant
    if (hasBreachGround && facts.wales_breach_clause) {
      parts.push('\n\nBREACH OF CONTRACT PARTICULARS (Section 162):');
      parts.push(`Contract term breached: ${facts.wales_breach_clause}`);
      if (facts.wales_breach_dates) {
        parts.push(`Date(s) of breach: ${facts.wales_breach_dates}`);
      }
      if (facts.wales_breach_evidence) {
        parts.push(`Evidence: ${facts.wales_breach_evidence}`);
      }
    }

    // Add false statement details if relevant
    if (hasFalseStatementGround && facts.wales_false_statement_summary) {
      parts.push('\n\nFALSE STATEMENT PARTICULARS (Section 162):');
      parts.push(`False statement: ${facts.wales_false_statement_summary}`);
      if (facts.wales_false_statement_discovered_date) {
        parts.push(`Discovered on: ${facts.wales_false_statement_discovered_date}`);
      }
    }

    return parts.join('\n');
  }, [
    facts.breach_description,
    facts.wales_asb_description,
    facts.wales_asb_incident_date,
    facts.wales_asb_police_involved,
    facts.wales_asb_police_ref,
    facts.wales_breach_clause,
    facts.wales_breach_dates,
    facts.wales_breach_evidence,
    facts.wales_false_statement_summary,
    facts.wales_false_statement_discovered_date,
    hasArrearsGround,
    hasASBGround,
    hasBreachGround,
    hasFalseStatementGround,
    arrearsSummary,
    selectedGrounds,
  ]);

  const handleUseSuggestion = () => {
    const suggestion = generateSuggestion();
    if (suggestion) {
      onUpdate({ wales_part_d_particulars: suggestion });
    }
  };

  // Build context for Ask Heaven enhancement
  const partDEnhanceContext = useMemo(() => ({
    jurisdiction: 'wales',
    product: 'notice_only',
    selected_grounds: selectedGrounds,
    total_arrears: arrearsSummary?.total_arrears,
    arrears_in_months: arrearsSummary?.arrears_in_months,
    periods_fully_unpaid: arrearsSummary?.periods_fully_unpaid,
    rent_amount: facts.rent_amount,
    rent_frequency: facts.rent_frequency,
    rent_due_day: facts.rent_due_day,
    breach_description: facts.breach_description,
    asb_description: facts.wales_asb_description,
    asb_incident_date: facts.wales_asb_incident_date,
    breach_clause: facts.wales_breach_clause,
    breach_dates: facts.wales_breach_dates,
    false_statement_summary: facts.wales_false_statement_summary,
    legal_framework: 'Renting Homes (Wales) Act 2016',
    notice_type: 'fault_based_breach_notice',
    enhancement_goal: 'Improve clarity and court-readiness without inventing facts',
  }), [
    selectedGrounds,
    arrearsSummary,
    facts.rent_amount,
    facts.rent_frequency,
    facts.rent_due_day,
    facts.breach_description,
    facts.wales_asb_description,
    facts.wales_asb_incident_date,
    facts.wales_breach_clause,
    facts.wales_breach_dates,
    facts.wales_false_statement_summary,
  ]);

  // Check if we have enough data to suggest starting point
  const canGenerateSuggestion = facts.breach_description ||
    (hasArrearsGround && arrearsSummary && arrearsSummary.total_arrears > 0) ||
    (hasASBGround && facts.wales_asb_description) ||
    (hasBreachGround && facts.wales_breach_clause) ||
    (hasFalseStatementGround && facts.wales_false_statement_summary);

  return (
    <div className="pt-6 border-t border-gray-200 space-y-4">
      <div>
        <h4 className="text-base font-medium text-gray-900 mb-1">
          Part D - Particulars of Claim
        </h4>
        <p className="text-sm text-gray-600">
          This is the court-ready statement of your claim. It should clearly set out the grounds
          for possession and the facts supporting each ground. Use Ask Heaven to improve clarity.
        </p>
      </div>

      {/* Quick start from breach description and other data */}
      {canGenerateSuggestion && !particularsText && (
        <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <p className="text-sm text-purple-800 mb-2">
            <strong>Quick start:</strong> Generate particulars from the details you have entered above.
          </p>
          <button
            type="button"
            onClick={handleUseSuggestion}
            className="px-3 py-1.5 text-sm font-medium text-purple-700 bg-white border border-purple-300 rounded-md hover:bg-purple-50"
          >
            Use details as starting point
          </button>
        </div>
      )}

      {/* Part D particulars textarea */}
      <div className="space-y-2">
        <label htmlFor="wales_part_d_particulars" className="block text-sm font-medium text-gray-700">
          Particulars of Claim
          <span className="text-red-500 ml-1">*</span>
        </label>
        <textarea
          id="wales_part_d_particulars"
          rows={8}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
          value={particularsText}
          onChange={(e) => onUpdate({ wales_part_d_particulars: e.target.value })}
          placeholder="Enter the full particulars of your claim. Include:&#10;- The ground(s) being relied upon&#10;- Specific facts supporting each ground&#10;- Dates, amounts, and incidents&#10;- Reference to the Renting Homes (Wales) Act 2016 sections"
        />
        <p className="text-xs text-gray-500">
          Be specific, factual, and clear. Do not invent or exaggerate facts.
          Selected grounds: {selectedGrounds.join(', ') || 'None selected'}
        </p>
      </div>

      {/* Ask Heaven Inline Enhancer for Part D */}
      <AskHeavenInlineEnhancer
        questionId="wales_part_d_particulars"
        questionText="Part D - Particulars of Claim for Wales fault-based breach notice"
        answer={particularsText}
        onApply={(newText) => onUpdate({ wales_part_d_particulars: newText })}
        context={partDEnhanceContext}
        apiMode="generic"
      />

      {/* Guidance panel */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> Click &quot;Enhance with Ask Heaven&quot; above to improve the clarity
          and court-readiness of your particulars. The AI will refine your text without inventing
          facts or changing the substance of your claim.
        </p>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN WALES NOTICE SECTION COMPONENT
// ============================================================================
export const WalesNoticeSection: React.FC<WalesNoticeSectionProps> = ({
  facts,
  onUpdate,
  mode = 'notice_only',
}) => {
  const evictionRoute = facts.eviction_route as 'section_173' | 'fault_based' | undefined;
  const isSection173 = evictionRoute === 'section_173';
  const isFaultBased = evictionRoute === 'fault_based';

  // Selected fault grounds - use normalizer for backward compatibility
  const selectedGrounds = normalizeWalesFaultGrounds(facts.wales_fault_grounds);

  // Track subflow completion for notice_only mode
  const [subflowComplete, setSubflowComplete] = useState(false);

  // Get filtered grounds list (excludes community-landlord-only grounds for private landlords)
  // By default, private landlord is assumed (isCommunityLandlord: false)
  const isCommunityLandlord = facts.is_community_landlord === true || facts.landlord_type === 'community';
  const availableGrounds = useMemo(() => {
    return getWalesFaultGroundDefinitions({ isCommunityLandlord });
  }, [isCommunityLandlord]);

  // Calculate minimum notice period based on route and grounds
  const minNoticePeriod = useMemo(() => {
    if (isSection173) return 180; // 6 months for Section 173

    if (isFaultBased && selectedGrounds.length > 0) {
      // Find shortest notice period among selected grounds
      let minPeriod = 60;
      selectedGrounds.forEach((ground) => {
        const groundInfo = getWalesFaultGroundByValue(ground);
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
    const serviceDate = facts.notice_date || facts.notice_service_date || facts.notice_served_date || today;
    const date = new Date(serviceDate);
    date.setDate(date.getDate() + minNoticePeriod);
    return date.toISOString().split('T')[0];
  }, [facts.notice_date, facts.notice_service_date, facts.notice_served_date, minNoticePeriod, today]);

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

  // Handle adding summary text to breach_description
  const handleUseAsSummary = useCallback((summary: string) => {
    const currentDescription = facts.breach_description || '';
    if (currentDescription.trim()) {
      // Append with delimiter if there's existing content
      onUpdate({
        breach_description: `${currentDescription}\n\n---\n\n${summary}`,
      });
    } else {
      onUpdate({ breach_description: summary });
    }
  }, [facts.breach_description, onUpdate]);

  // Check which conditional panels to show
  const showArrearsPanel = selectedGrounds.includes('rent_arrears_serious') ||
                           selectedGrounds.includes('rent_arrears_other');
  const showASBPanel = selectedGrounds.includes('antisocial_behaviour');
  const showBreachPanel = selectedGrounds.includes('breach_of_contract');
  const showFalseStatementPanel = selectedGrounds.includes('false_statement');

  // Get arrears summary for context
  const arrearsItems: ArrearsItem[] = useMemo(() => {
    return facts.issues?.rent_arrears?.arrears_items || facts.arrears_items || [];
  }, [facts.issues?.rent_arrears?.arrears_items, facts.arrears_items]);

  const arrearsSummary = useMemo(() => {
    if (!arrearsItems || arrearsItems.length === 0) return null;
    const rentAmount = facts.rent_amount || 0;
    const rentFrequency = facts.rent_frequency || 'monthly';
    return computeArrears(arrearsItems, rentFrequency, rentAmount);
  }, [arrearsItems, facts.rent_amount, facts.rent_frequency]);

  // Build context for Ask Heaven enhancement
  const enhanceContext = useMemo(() => ({
    jurisdiction: 'wales',
    selected_grounds: selectedGrounds,
    total_arrears: arrearsSummary?.total_arrears,
    arrears_in_months: arrearsSummary?.arrears_in_months,
    rent_amount: facts.rent_amount,
    rent_frequency: facts.rent_frequency,
    asb_details: showASBPanel ? {
      incident_date: facts.wales_asb_incident_date,
      description: facts.wales_asb_description,
      police_involved: facts.wales_asb_police_involved,
    } : undefined,
    breach_details: showBreachPanel ? {
      clause: facts.wales_breach_clause,
      dates: facts.wales_breach_dates,
    } : undefined,
    notice_type: isFaultBased ? 'fault_based' : 'section_173',
    legal_framework: 'Renting Homes (Wales) Act 2016',
  }), [selectedGrounds, arrearsSummary, facts, showASBPanel, showBreachPanel, isFaultBased]);

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
              {availableGrounds.map((ground) => (
                <label
                  key={ground.value}
                  className={`
                    flex items-start p-3 border rounded-lg cursor-pointer transition-all
                    ${selectedGrounds.includes(ground.value)
                      ? 'border-[#7C3AED] bg-purple-50 ring-2 ring-purple-200'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}
                  `}
                >
                  <input
                    type="checkbox"
                    checked={selectedGrounds.includes(ground.value)}
                    onChange={() => handleGroundToggle(ground.value)}
                    className="mt-0.5 mr-3"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-900">
                      {ground.label}
                    </span>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {ground.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        ground.mandatory
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {ground.mandatory ? 'Absolute' : 'Discretionary'}
                      </span>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                        Section {ground.section}
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
                  <strong>Selected:</strong> {selectedGrounds.map((g) =>
                    getWalesFaultGroundByValue(g)?.label
                  ).join(', ')}
                </p>
                <p className="text-xs text-purple-700 mt-1">
                  Minimum notice period: {minNoticePeriod} days
                </p>
              </div>
            )}
          </div>

          {/* ================================================================== */}
          {/* CONDITIONAL GROUND DETAILS PANELS */}
          {/* Rendered BEFORE breach_description in deterministic order */}
          {/* ================================================================== */}
          {selectedGrounds.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700 border-b pb-2">
                Ground Details
              </h4>

              {/* Arrears panels first */}
              {showArrearsPanel && (
                <ArrearsDetailsPanel
                  facts={facts}
                  onUpdate={onUpdate}
                  selectedGrounds={selectedGrounds}
                  onUseAsSummary={handleUseAsSummary}
                />
              )}

              {/* Then ASB panel */}
              {showASBPanel && (
                <ASBDetailsPanel
                  facts={facts}
                  onUpdate={onUpdate}
                  onUseAsSummary={handleUseAsSummary}
                />
              )}

              {/* Then breach of contract panel */}
              {showBreachPanel && (
                <BreachOfContractPanel
                  facts={facts}
                  onUpdate={onUpdate}
                  onUseAsSummary={handleUseAsSummary}
                />
              )}

              {/* Then false statement panel */}
              {showFalseStatementPanel && (
                <FalseStatementPanel
                  facts={facts}
                  onUpdate={onUpdate}
                  onUseAsSummary={handleUseAsSummary}
                />
              )}
            </div>
          )}

          {/* ================================================================== */}
          {/* BREACH DESCRIPTION TEXTAREA */}
          {/* Always visible when grounds are selected */}
          {/* ================================================================== */}
          {selectedGrounds.length > 0 && (
            <div className="pt-6 border-t border-gray-200 space-y-4">
              <div>
                <h4 className="text-base font-medium text-gray-900 mb-1">
                  Describe the breach or grounds
                </h4>
                <p className="text-sm text-gray-600">
                  Provide a detailed description of the grounds for possession.
                  This will appear in your notice documents.
                </p>
              </div>

              {/* Breach description textarea */}
              <div className="space-y-2">
                <label htmlFor="breach_description" className="block text-sm font-medium text-gray-700">
                  Describe the breach or grounds
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <textarea
                  id="breach_description"
                  rows={6}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
                  value={facts.breach_description || ''}
                  onChange={(e) => onUpdate({ breach_description: e.target.value })}
                  placeholder="Describe the grounds for possession in detail. Include dates, amounts, and specific incidents where applicable..."
                />
                <p className="text-xs text-gray-500">
                  Be specific and factual. Reference the conditional panels above to help draft this description.
                </p>
              </div>

              {/* Ask Heaven Inline Enhancer */}
              <AskHeavenInlineEnhancer
                questionId="breach_description"
                questionText="Describe the breach or grounds for possession (Wales fault-based notice)"
                answer={facts.breach_description || ''}
                onApply={(newText) => onUpdate({ breach_description: newText })}
                context={enhanceContext}
                apiMode="generic"
              />
            </div>
          )}

          {/* ================================================================== */}
          {/* PART D - PARTICULARS OF CLAIM (with Ask Heaven) */}
          {/* Court-ready particulars for fault-based notices */}
          {/* ================================================================== */}
          {selectedGrounds.length > 0 && (
            <WalesPartDParticulars
              facts={facts}
              selectedGrounds={selectedGrounds}
              arrearsSummary={arrearsSummary}
              onUpdate={onUpdate}
            />
          )}

          {/* ================================================================== */}
          {/* SERVICE DETAILS */}
          {/* ================================================================== */}
          {selectedGrounds.length > 0 && (
            <div className="pt-6 border-t border-gray-200 space-y-4">
              <h4 className="text-base font-medium text-gray-900">
                Notice Service Details
              </h4>

              {/* Service date */}
              <div className="space-y-2">
                <label htmlFor="notice_service_date_fault" className="block text-sm font-medium text-gray-700">
                  Date notice will be served
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  id="notice_service_date_fault"
                  type="date"
                  className="w-full max-w-xs rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
                  value={facts.notice_date || facts.notice_service_date || today}
                  onChange={(e) => onUpdate({
                    notice_date: e.target.value,
                    notice_service_date: e.target.value,
                    notice_served_date: e.target.value,
                  })}
                />
              </div>

              {/* Service method */}
              <div className="space-y-2">
                <label htmlFor="notice_service_method_fault" className="block text-sm font-medium text-gray-700">
                  How will the notice be served?
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
                  Minimum {minNoticePeriod} days from service date based on selected grounds.
                </p>
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

          {/* No grounds selected message */}
          {selectedGrounds.length === 0 && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-600">
                Please select at least one ground for possession to continue.
              </p>
            </div>
          )}
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
                      getWalesFaultGroundByValue(g)?.label || g
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
      {!subflowComplete && (isSection173 || (isFaultBased && selectedGrounds.length > 0)) && (
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
