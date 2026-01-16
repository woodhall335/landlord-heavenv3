/**
 * Wales Notice Section - Wales Eviction Notice Wizard
 *
 * Handles fault-based notices under the Renting Homes (Wales) Act 2016.
 * Mirrors England's Section 8 ground-driven behavior with conditional panels.
 *
 * Fault-based grounds:
 * - Section 157: Serious rent arrears (at least 2 months) - 14 days notice
 * - Section 159: Some rent arrears (less than 2 months) - 30 days notice
 * - Section 161: Anti-social behaviour (serious) - 14 days notice
 * - Section 162: Breach of occupation contract - 30 days notice
 *
 * Features:
 * - Conditional "ground details" panels BEFORE breach_description
 * - ArrearsScheduleStep for arrears grounds (reused from England)
 * - "Use details as starting point" buttons to prepopulate breach_description
 * - AskHeavenInlineEnhancer for breach_description enhancement
 */

'use client';

import React, { useMemo, useState, useCallback, useEffect } from 'react';
import type { WizardFacts, ArrearsItem } from '@/lib/case-facts/schema';
import { ArrearsScheduleStep } from '../../ArrearsScheduleStep';
import { AskHeavenInlineEnhancer } from '../../AskHeavenInlineEnhancer';
import { computeArrears } from '@/lib/arrears-engine';

interface WalesNoticeSectionProps {
  facts: WizardFacts;
  jurisdiction: 'england' | 'wales';
  onUpdate: (updates: Record<string, any>) => void | Promise<void>;
  mode?: 'complete_pack' | 'notice_only';
}

// Wales fault-based grounds under Renting Homes (Wales) Act 2016
const WALES_FAULT_GROUNDS = [
  {
    value: 'rent_arrears_serious',
    label: 'Serious rent arrears (8+ weeks)',
    description: 'At least 2 months of rent unpaid',
    section: 157,
    period: 14,
    requiresArrearsSchedule: true,
  },
  {
    value: 'rent_arrears_other',
    label: 'Some rent arrears',
    description: 'Less than 2 months of rent unpaid',
    section: 159,
    period: 30,
    requiresArrearsSchedule: true,
  },
  {
    value: 'antisocial_behaviour',
    label: 'Anti-social behaviour',
    description: 'Serious anti-social behaviour or nuisance',
    section: 161,
    period: 14,
    requiresArrearsSchedule: false,
  },
  {
    value: 'breach_of_contract',
    label: 'Breach of occupation contract',
    description: 'Breach of terms in the occupation contract',
    section: 162,
    period: 30,
    requiresArrearsSchedule: false,
  },
  {
    value: 'false_statement',
    label: 'False statement',
    description: 'False statement made to obtain the contract',
    section: 162,
    period: 30,
    requiresArrearsSchedule: false,
  },
];

const SERVICE_METHODS = [
  { value: 'first_class_post', label: 'First class post' },
  { value: 'recorded_delivery', label: 'Recorded delivery / signed for' },
  { value: 'hand_delivered', label: 'Hand delivered to contract-holder' },
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

  // Generate summary text from arrears data
  const generateArrearsSummary = useCallback(() => {
    if (!arrearsSummary || arrearsSummary.total_arrears === 0) return '';

    const isSerious = selectedGrounds.includes('rent_arrears_serious');
    const sectionRef = isSerious ? 'Section 157' : 'Section 159';

    let summary = `RENT ARREARS (${sectionRef}):\n`;
    summary += `The contract-holder owes £${arrearsSummary.total_arrears.toFixed(2)} in rent arrears, `;
    summary += `representing ${arrearsSummary.arrears_in_months.toFixed(1)} months of unpaid rent. `;

    if (arrearsSummary.periods_fully_unpaid > 0) {
      summary += `There are ${arrearsSummary.periods_fully_unpaid} rental period(s) that are fully unpaid. `;
    }

    if (isSerious && arrearsSummary.arrears_in_months >= 2) {
      summary += `This meets the threshold for serious arrears under Section 157 of the Renting Homes (Wales) Act 2016.`;
    } else if (!isSerious) {
      summary += `This constitutes rent arrears under Section 159 of the Renting Homes (Wales) Act 2016.`;
    }

    return summary;
  }, [arrearsSummary, selectedGrounds]);

  const handleUseSummary = () => {
    const summary = generateArrearsSummary();
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
              </div>

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
    const parts: string[] = ['BREACH OF OCCUPATION CONTRACT (Section 162):'];

    if (facts.wales_breach_clause) {
      parts.push(`The contract-holder has breached clause/term: ${facts.wales_breach_clause}.`);
    }

    if (facts.wales_breach_dates) {
      parts.push(`The breach occurred on/during: ${facts.wales_breach_dates}.`);
    }

    if (facts.wales_breach_evidence) {
      parts.push(`Evidence: ${facts.wales_breach_evidence}`);
    }

    parts.push('This constitutes a breach of the occupation contract under Section 162 of the Renting Homes (Wales) Act 2016.');

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
          Section 162 - Breach of Occupation Contract Details
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
    const parts: string[] = ['FALSE STATEMENT (Section 162):'];

    if (facts.wales_false_statement_summary) {
      parts.push(`The contract-holder made the following false statement to obtain the contract: ${facts.wales_false_statement_summary}`);
    }

    if (facts.wales_false_statement_discovered_date) {
      parts.push(`This was discovered on ${facts.wales_false_statement_discovered_date}.`);
    }

    if (facts.wales_false_statement_evidence) {
      parts.push(`Evidence: ${facts.wales_false_statement_evidence}`);
    }

    parts.push('This false statement was made to induce the landlord to enter into the occupation contract under Section 162 of the Renting Homes (Wales) Act 2016.');

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
          Section 162 - False Statement Details
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
// MAIN WALES NOTICE SECTION COMPONENT
// ============================================================================
export const WalesNoticeSection: React.FC<WalesNoticeSectionProps> = ({
  facts,
  onUpdate,
  mode = 'notice_only',
}) => {
  const selectedGrounds = (facts.wales_fault_grounds as string[]) || [];

  // Calculate minimum notice period based on selected grounds
  const minNoticePeriod = useMemo(() => {
    if (selectedGrounds.length === 0) return 14;
    // Find the maximum notice period among selected grounds
    let maxPeriod = 14;
    selectedGrounds.forEach((groundValue) => {
      const ground = WALES_FAULT_GROUNDS.find((g) => g.value === groundValue);
      if (ground && ground.period > maxPeriod) {
        maxPeriod = ground.period;
      }
    });
    return maxPeriod;
  }, [selectedGrounds]);

  // Calculate suggested expiry date
  const today = new Date().toISOString().split('T')[0];
  const suggestedExpiryDate = useMemo(() => {
    const serviceDate = facts.notice_service_date || facts.notice_served_date || today;
    const date = new Date(serviceDate);
    date.setDate(date.getDate() + minNoticePeriod);
    return date.toISOString().split('T')[0];
  }, [facts.notice_service_date, facts.notice_served_date, minNoticePeriod, today]);

  // Handle ground toggle
  const handleGroundToggle = (groundValue: string) => {
    const newGrounds = selectedGrounds.includes(groundValue)
      ? selectedGrounds.filter((g) => g !== groundValue)
      : [...selectedGrounds, groundValue];
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
    notice_type: 'fault_based',
    legal_framework: 'Renting Homes (Wales) Act 2016',
  }), [selectedGrounds, arrearsSummary, facts, showASBPanel, showBreachPanel]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
        <h4 className="text-sm font-medium text-purple-900">
          Wales Fault-Based Notice
        </h4>
        <p className="text-sm text-purple-700 mt-1">
          Generate a fault-based eviction notice under the Renting Homes (Wales) Act 2016.
          Select the grounds that apply to your case.
        </p>
      </div>

      {/* Grounds Selection */}
      <div className="space-y-3">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Select Grounds for Possession
            <span className="text-red-500 ml-1">*</span>
          </label>
          <p className="text-xs text-gray-500">
            Select all grounds that apply. The notice period will be determined by the selected grounds.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {WALES_FAULT_GROUNDS.map((ground) => (
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
                WALES_FAULT_GROUNDS.find((wg) => wg.value === g)?.label
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
      {/* SERVICE DETAILS */}
      {/* ================================================================== */}
      {selectedGrounds.length > 0 && (
        <div className="pt-6 border-t border-gray-200 space-y-4">
          <h4 className="text-base font-medium text-gray-900">
            Notice Service Details
          </h4>

          {/* Service date */}
          <div className="space-y-2">
            <label htmlFor="notice_service_date" className="block text-sm font-medium text-gray-700">
              Date notice will be served
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              id="notice_service_date"
              type="date"
              className="w-full max-w-xs rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
              value={facts.notice_service_date || facts.notice_served_date || today}
              onChange={(e) => onUpdate({
                notice_service_date: e.target.value,
                notice_served_date: e.target.value,
              })}
            />
          </div>

          {/* Service method */}
          <div className="space-y-2">
            <label htmlFor="notice_service_method" className="block text-sm font-medium text-gray-700">
              How will the notice be served?
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

          {/* Expiry date */}
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
  );
};

export default WalesNoticeSection;
