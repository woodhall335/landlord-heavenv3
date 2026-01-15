/**
 * Wales Notice Section - Notice Only Wizard
 *
 * Handles Wales fault-based eviction notice flow under the
 * Renting Homes (Wales) Act 2016.
 *
 * Key Features:
 * - Ground selection for fault-based notices
 * - Conditional panels based on selected grounds:
 *   - Rent arrears (Section 157/159): ArrearsScheduleStep + "Use summary" button
 *   - Antisocial behaviour (Section 161): ASB details panel
 *   - Breach of contract (Section 162): Breach details panel
 * - Ask Heaven enhancement for breach_description
 *
 * Wales-Specific Terminology:
 * - "Contract holder" instead of "tenant"
 * - "Occupation contract" instead of "tenancy"
 * - Different sections (157, 159, 161, 162) instead of England's grounds
 *
 * Data Storage:
 * - Arrears use canonical keys: arrears_items, total_arrears, arrears_at_notice_date
 * - Wales-specific fields use namespaced keys: wales_asb_*, wales_breach_*
 */

'use client';

import React, { useMemo, useState, useCallback } from 'react';
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

// Wales fault-based grounds with notice periods (Renting Homes (Wales) Act 2016)
const WALES_FAULT_GROUNDS = [
  {
    value: 'rent_arrears_serious',
    label: 'Section 157 - Serious rent arrears (8+ weeks)',
    period: 14,
    section: '157',
    description: 'Contract holder owes at least 8 weeks rent at both notice and hearing date',
    hasArrearsSchedule: true,
  },
  {
    value: 'rent_arrears_other',
    label: 'Section 159 - Some rent arrears (less than 8 weeks)',
    period: 30,
    section: '159',
    description: 'Contract holder has fallen into arrears with rent payments',
    hasArrearsSchedule: true,
  },
  {
    value: 'antisocial_behaviour',
    label: 'Section 161 - Antisocial behaviour',
    period: 14,
    section: '161',
    description: 'Serious antisocial behaviour by contract holder or their visitors',
    hasAsbPanel: true,
  },
  {
    value: 'breach_of_contract',
    label: 'Section 162 - Breach of occupation contract',
    period: 30,
    section: '162',
    description: 'Contract holder has broken terms of the occupation contract',
    hasBreachPanel: true,
  },
];

const SERVICE_METHODS = [
  { value: 'first_class_post', label: 'First class post' },
  { value: 'recorded_delivery', label: 'Recorded delivery / signed for' },
  { value: 'hand_delivered', label: 'Hand delivered to contract holder' },
  { value: 'left_at_property', label: 'Left at the property' },
  { value: 'email', label: 'Email (if permitted by contract)' },
  { value: 'other', label: 'Other method' },
];

// =============================================================================
// ARREARS PANEL COMPONENT
// =============================================================================

interface ArrearsPanelProps {
  facts: WizardFacts;
  onUpdate: (updates: Record<string, any>) => void | Promise<void>;
  selectedGrounds: string[];
  onGenerateSummary: (summary: string) => void;
}

const ArrearsPanel: React.FC<ArrearsPanelProps> = ({
  facts,
  onUpdate,
  selectedGrounds,
  onGenerateSummary,
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

  // Convert facts to the format expected by ArrearsScheduleStep
  const scheduleStepFacts = useMemo(() => ({
    tenancy: {
      start_date: facts.contract_start_date || facts.tenancy_start_date,
      rent_amount: facts.rent_amount,
      rent_frequency: facts.rent_frequency,
    },
    tenancy_start_date: facts.contract_start_date || facts.tenancy_start_date,
    rent_amount: facts.rent_amount,
    rent_frequency: facts.rent_frequency,
    notice: {
      notice_date: facts.notice_service_date || facts.notice_served_date,
    },
    notice_date: facts.notice_service_date || facts.notice_served_date,
    issues: {
      rent_arrears: {
        arrears_items: arrearsItems,
        has_arrears: arrearsItems.length > 0,
      },
    },
  }), [facts, arrearsItems]);

  // Handle updates from ArrearsScheduleStep
  const handleArrearsUpdate = async (updates: Record<string, any>) => {
    if (updates.issues?.rent_arrears) {
      const arrearsData = updates.issues.rent_arrears;
      await onUpdate({
        arrears_items: arrearsData.arrears_items,
        total_arrears: arrearsData.total_arrears,
        arrears_at_notice_date: arrearsData.arrears_at_notice_date,
        // Keep nested structure for compatibility
        issues: {
          ...facts.issues,
          rent_arrears: arrearsData,
        },
      });
    } else {
      await onUpdate(updates);
    }
  };

  // Generate summary text from arrears data
  const handleUseSummary = useCallback(() => {
    if (!arrearsSummary || arrearsSummary.total_arrears === 0) return;

    const hasSerious = selectedGrounds.includes('rent_arrears_serious');
    const weeksInArrears = (arrearsSummary.arrears_in_months * 4.33).toFixed(1);

    let summary = `The contract holder owes £${arrearsSummary.total_arrears.toFixed(2)} in rent arrears, `;
    summary += `representing approximately ${weeksInArrears} weeks of unpaid rent. `;

    if (arrearsSummary.periods_fully_unpaid > 0) {
      summary += `There are ${arrearsSummary.periods_fully_unpaid} rental period(s) that are fully unpaid. `;
    }

    if (hasSerious && arrearsSummary.arrears_in_months >= 2) {
      summary += `This exceeds the Section 157 threshold of 8 weeks' arrears.`;
    } else if (!hasSerious) {
      summary += `This is within the Section 159 threshold for some rent arrears.`;
    }

    onGenerateSummary(summary);
  }, [arrearsSummary, selectedGrounds, onGenerateSummary]);

  // Check if 8+ weeks threshold is met (for Section 157)
  const weeksInArrears = arrearsSummary ? arrearsSummary.arrears_in_months * 4.33 : 0;
  const hasSerious = selectedGrounds.includes('rent_arrears_serious');

  return (
    <div className="space-y-4">
      <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
        <h4 className="text-sm font-medium text-purple-900 mb-2">
          Rent Arrears Schedule
        </h4>
        <p className="text-sm text-purple-800">
          {hasSerious
            ? 'Section 157 requires at least 8 weeks rent arrears at both the notice date and the possession hearing date.'
            : 'Section 159 covers rent arrears of less than 8 weeks. Document all unpaid rent periods below.'
          }
        </p>
      </div>

      {/* ArrearsScheduleStep */}
      <ArrearsScheduleStep
        facts={scheduleStepFacts}
        onUpdate={handleArrearsUpdate}
      />

      {/* Wales-specific threshold check */}
      {hasSerious && arrearsSummary && (
        <div className={`p-4 rounded-lg border ${
          weeksInArrears >= 8
            ? 'bg-green-50 border-green-200'
            : 'bg-red-50 border-red-200'
        }`}>
          <h4 className={`text-sm font-medium mb-2 ${
            weeksInArrears >= 8 ? 'text-green-900' : 'text-red-900'
          }`}>
            Section 157 Eligibility: {weeksInArrears >= 8 ? 'THRESHOLD MET' : 'THRESHOLD NOT MET'}
          </h4>
          <div className={`text-sm ${weeksInArrears >= 8 ? 'text-green-800' : 'text-red-800'}`}>
            <p>
              Arrears: {weeksInArrears.toFixed(1)} weeks
              ({weeksInArrears >= 8 ? '≥' : '<'} 8 weeks required)
            </p>
            {weeksInArrears < 8 && (
              <p className="mt-2 font-medium">
                Consider using Section 159 instead for arrears below the 8-week threshold.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Use summary button */}
      {arrearsSummary && arrearsSummary.total_arrears > 0 && (
        <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <p className="text-sm text-purple-800 mb-2">
            <strong>Quick start:</strong> Generate a summary of the arrears schedule for your breach description.
          </p>
          <button
            type="button"
            onClick={handleUseSummary}
            className="px-3 py-1.5 text-sm font-medium text-purple-700 bg-white border border-purple-300 rounded-md hover:bg-purple-50"
          >
            Use arrears summary as starting point
          </button>
        </div>
      )}
    </div>
  );
};

// =============================================================================
// ANTISOCIAL BEHAVIOUR PANEL
// =============================================================================

interface AsbPanelProps {
  facts: WizardFacts;
  onUpdate: (updates: Record<string, any>) => void | Promise<void>;
  onGenerateSummary: (summary: string) => void;
}

const AsbPanel: React.FC<AsbPanelProps> = ({
  facts,
  onUpdate,
  onGenerateSummary,
}) => {
  const handleUseSummary = useCallback(() => {
    const parts: string[] = [];

    if (facts.wales_asb_incident_date) {
      const dateStr = new Date(facts.wales_asb_incident_date).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      let timeStr = '';
      if (facts.wales_asb_incident_time) {
        timeStr = ` at approximately ${facts.wales_asb_incident_time}`;
      }
      parts.push(`On ${dateStr}${timeStr}, an incident of antisocial behaviour occurred.`);
    }

    if (facts.wales_asb_location) {
      parts.push(`The incident took place at ${facts.wales_asb_location}.`);
    }

    if (facts.wales_asb_description) {
      parts.push(facts.wales_asb_description);
    }

    if (facts.wales_asb_police_involved === true) {
      let policeStr = 'The police were involved in this matter';
      if (facts.wales_asb_police_reference) {
        policeStr += ` (reference: ${facts.wales_asb_police_reference})`;
      }
      parts.push(policeStr + '.');
    }

    if (facts.wales_asb_witness_details) {
      parts.push(`Witness details: ${facts.wales_asb_witness_details}`);
    }

    if (parts.length > 0) {
      onGenerateSummary(parts.join(' '));
    }
  }, [facts, onGenerateSummary]);

  const hasDetails = facts.wales_asb_incident_date || facts.wales_asb_description;

  return (
    <div className="space-y-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
      <h4 className="text-sm font-medium text-amber-900">
        Section 161 - Antisocial Behaviour Details
      </h4>
      <p className="text-sm text-amber-800">
        Provide details of the antisocial behaviour. This information will help strengthen your case.
      </p>

      {/* Incident date and time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="wales_asb_incident_date" className="block text-sm font-medium text-gray-700">
            Incident date
          </label>
          <input
            id="wales_asb_incident_date"
            type="date"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
            value={facts.wales_asb_incident_date || ''}
            onChange={(e) => onUpdate({ wales_asb_incident_date: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="wales_asb_incident_time" className="block text-sm font-medium text-gray-700">
            Approximate time
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
      <div className="space-y-2">
        <label htmlFor="wales_asb_location" className="block text-sm font-medium text-gray-700">
          Location of incident
        </label>
        <input
          id="wales_asb_location"
          type="text"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
          value={facts.wales_asb_location || ''}
          onChange={(e) => onUpdate({ wales_asb_location: e.target.value })}
          placeholder="e.g., Common hallway, Front garden, Neighbour's property"
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label htmlFor="wales_asb_description" className="block text-sm font-medium text-gray-700">
          Description of incident
        </label>
        <textarea
          id="wales_asb_description"
          rows={3}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
          value={facts.wales_asb_description || ''}
          onChange={(e) => onUpdate({ wales_asb_description: e.target.value })}
          placeholder="Describe what happened, who was involved, and the impact on others..."
        />
      </div>

      {/* Police involvement */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Were the police involved?
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

      {/* Police reference */}
      {facts.wales_asb_police_involved === true && (
        <div className="space-y-2">
          <label htmlFor="wales_asb_police_reference" className="block text-sm font-medium text-gray-700">
            Police reference number (if known)
          </label>
          <input
            id="wales_asb_police_reference"
            type="text"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
            value={facts.wales_asb_police_reference || ''}
            onChange={(e) => onUpdate({ wales_asb_police_reference: e.target.value })}
            placeholder="e.g., CAD-123456"
          />
        </div>
      )}

      {/* Witness details */}
      <div className="space-y-2">
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
      {hasDetails && (
        <div className="pt-2">
          <button
            type="button"
            onClick={handleUseSummary}
            className="px-3 py-1.5 text-sm font-medium text-amber-700 bg-white border border-amber-300 rounded-md hover:bg-amber-50"
          >
            Use these details as starting point
          </button>
        </div>
      )}
    </div>
  );
};

// =============================================================================
// BREACH OF CONTRACT PANEL
// =============================================================================

interface BreachPanelProps {
  facts: WizardFacts;
  onUpdate: (updates: Record<string, any>) => void | Promise<void>;
  onGenerateSummary: (summary: string) => void;
}

const BreachPanel: React.FC<BreachPanelProps> = ({
  facts,
  onUpdate,
  onGenerateSummary,
}) => {
  const handleUseSummary = useCallback(() => {
    const parts: string[] = [];

    if (facts.wales_breach_clause) {
      parts.push(`The contract holder has breached clause ${facts.wales_breach_clause} of the occupation contract.`);
    }

    if (facts.wales_breach_dates) {
      parts.push(`The breach occurred ${facts.wales_breach_dates}.`);
    }

    if (facts.wales_breach_evidence_summary) {
      parts.push(facts.wales_breach_evidence_summary);
    }

    if (parts.length > 0) {
      onGenerateSummary(parts.join(' '));
    }
  }, [facts, onGenerateSummary]);

  const hasDetails = facts.wales_breach_clause || facts.wales_breach_evidence_summary;

  return (
    <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h4 className="text-sm font-medium text-blue-900">
        Section 162 - Breach of Contract Details
      </h4>
      <p className="text-sm text-blue-800">
        Provide details of the contract term breached. Include specific clauses and evidence.
      </p>

      {/* Clause breached */}
      <div className="space-y-2">
        <label htmlFor="wales_breach_clause" className="block text-sm font-medium text-gray-700">
          Which clause was breached?
        </label>
        <input
          id="wales_breach_clause"
          type="text"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
          value={facts.wales_breach_clause || ''}
          onChange={(e) => onUpdate({ wales_breach_clause: e.target.value })}
          placeholder="e.g., Clause 5 - No pets, Clause 12 - Use of property"
        />
      </div>

      {/* Breach dates/period */}
      <div className="space-y-2">
        <label htmlFor="wales_breach_dates" className="block text-sm font-medium text-gray-700">
          When did the breach occur?
        </label>
        <input
          id="wales_breach_dates"
          type="text"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
          value={facts.wales_breach_dates || ''}
          onChange={(e) => onUpdate({ wales_breach_dates: e.target.value })}
          placeholder="e.g., On 15 January 2024, Between March and June 2024"
        />
      </div>

      {/* Evidence summary */}
      <div className="space-y-2">
        <label htmlFor="wales_breach_evidence_summary" className="block text-sm font-medium text-gray-700">
          Evidence summary
        </label>
        <textarea
          id="wales_breach_evidence_summary"
          rows={3}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
          value={facts.wales_breach_evidence_summary || ''}
          onChange={(e) => onUpdate({ wales_breach_evidence_summary: e.target.value })}
          placeholder="Describe the evidence you have: photos, correspondence, inspection reports..."
        />
      </div>

      {/* Use details button */}
      {hasDetails && (
        <div className="pt-2">
          <button
            type="button"
            onClick={handleUseSummary}
            className="px-3 py-1.5 text-sm font-medium text-blue-700 bg-white border border-blue-300 rounded-md hover:bg-blue-50"
          >
            Use these details as starting point
          </button>
        </div>
      )}
    </div>
  );
};

// =============================================================================
// MAIN WALES NOTICE SECTION COMPONENT
// =============================================================================

export const WalesNoticeSection: React.FC<WalesNoticeSectionProps> = ({
  facts,
  onUpdate,
  mode = 'notice_only',
}) => {
  // Selected grounds from facts
  const selectedGrounds = useMemo(() => {
    return (facts.wales_fault_grounds as string[]) || [];
  }, [facts.wales_fault_grounds]);

  // Check which ground types are selected
  const hasArrearsGround = selectedGrounds.some((g) =>
    g === 'rent_arrears_serious' || g === 'rent_arrears_other'
  );
  const hasAsbGround = selectedGrounds.includes('antisocial_behaviour');
  const hasBreachGround = selectedGrounds.includes('breach_of_contract');

  // Calculate minimum notice period based on selected grounds
  const minNoticePeriod = useMemo(() => {
    if (selectedGrounds.length === 0) return 14;

    let minPeriod = 30;
    selectedGrounds.forEach((ground) => {
      const groundInfo = WALES_FAULT_GROUNDS.find((g) => g.value === ground);
      if (groundInfo && groundInfo.period < minPeriod) {
        minPeriod = groundInfo.period;
      }
    });
    return minPeriod;
  }, [selectedGrounds]);

  // Handle ground toggle
  const handleGroundToggle = (ground: string) => {
    const newGrounds = selectedGrounds.includes(ground)
      ? selectedGrounds.filter((g) => g !== ground)
      : [...selectedGrounds, ground];
    onUpdate({ wales_fault_grounds: newGrounds });
  };

  // Handle prepopulating breach description from panels
  const handleAppendToDescription = useCallback((summary: string) => {
    const currentDescription = facts.breach_description || '';
    let newDescription: string;

    if (currentDescription.trim()) {
      // Append with delimiter
      newDescription = currentDescription + '\n\n---\n\n' + summary;
    } else {
      newDescription = summary;
    }

    onUpdate({ breach_description: newDescription });
  }, [facts.breach_description, onUpdate]);

  // Calculate suggested expiry date
  const suggestedExpiryDate = useMemo(() => {
    if (!facts.notice_service_date) return null;
    const servedDate = new Date(facts.notice_service_date);
    const expiryDate = new Date(servedDate);
    expiryDate.setDate(expiryDate.getDate() + minNoticePeriod);
    return expiryDate.toISOString().split('T')[0];
  }, [facts.notice_service_date, minNoticePeriod]);

  // Get arrears summary for Ask Heaven context
  const arrearsItems: ArrearsItem[] = useMemo(() => {
    return facts.issues?.rent_arrears?.arrears_items ||
           facts.arrears_items ||
           [];
  }, [facts.issues?.rent_arrears?.arrears_items, facts.arrears_items]);

  const arrearsSummary = useMemo(() => {
    if (!arrearsItems || arrearsItems.length === 0) return null;
    return computeArrears(
      arrearsItems,
      facts.rent_frequency || 'monthly',
      facts.rent_amount || 0
    );
  }, [arrearsItems, facts.rent_frequency, facts.rent_amount]);

  // Build context for Ask Heaven
  const enhanceContext = useMemo(() => ({
    jurisdiction: 'wales',
    legal_framework: 'Renting Homes (Wales) Act 2016',
    selected_grounds: selectedGrounds,
    total_arrears: arrearsSummary?.total_arrears,
    arrears_in_weeks: arrearsSummary ? (arrearsSummary.arrears_in_months * 4.33).toFixed(1) : null,
    rent_amount: facts.rent_amount,
    rent_frequency: facts.rent_frequency,
    asb_description: facts.wales_asb_description,
    breach_clause: facts.wales_breach_clause,
  }), [selectedGrounds, arrearsSummary, facts]);

  const breachDescriptionText = facts.breach_description || '';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
        <h4 className="text-sm font-medium text-purple-900">
          Wales Fault-Based Notice
        </h4>
        <p className="text-sm text-purple-700 mt-1">
          Under the Renting Homes (Wales) Act 2016. Select the grounds that apply to your case.
        </p>
      </div>

      {/* ================================================================== */}
      {/* GROUNDS SELECTION */}
      {/* ================================================================== */}
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Select Grounds for Possession
            <span className="text-red-500 ml-1">*</span>
          </label>
          <p className="text-xs text-gray-500">
            Select all grounds that apply. Different grounds have different notice periods and requirements.
          </p>
        </div>

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
                className="mt-0.5 mr-3"
              />
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-900">
                  {ground.label}
                </span>
                <p className="text-xs text-gray-500 mt-0.5">
                  {ground.description}
                </p>
                <span className="inline-block mt-1 text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                  {ground.period} days notice
                </span>
              </div>
            </label>
          ))}
        </div>

        {selectedGrounds.length > 0 && (
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <p className="text-sm text-purple-800">
              <strong>Selected:</strong> {selectedGrounds.map((g) => {
                const ground = WALES_FAULT_GROUNDS.find((wg) => wg.value === g);
                return ground?.section ? `Section ${ground.section}` : g;
              }).join(', ')}
            </p>
            <p className="text-xs text-purple-700 mt-1">
              Minimum notice period: {minNoticePeriod} days
            </p>
          </div>
        )}
      </div>

      {/* ================================================================== */}
      {/* CONDITIONAL PANELS - BEFORE breach_description */}
      {/* ================================================================== */}

      {/* Arrears Panel - for rent_arrears_serious or rent_arrears_other */}
      {hasArrearsGround && (
        <ArrearsPanel
          facts={facts}
          onUpdate={onUpdate}
          selectedGrounds={selectedGrounds}
          onGenerateSummary={handleAppendToDescription}
        />
      )}

      {/* ASB Panel - for antisocial_behaviour */}
      {hasAsbGround && (
        <AsbPanel
          facts={facts}
          onUpdate={onUpdate}
          onGenerateSummary={handleAppendToDescription}
        />
      )}

      {/* Breach Panel - for breach_of_contract */}
      {hasBreachGround && (
        <BreachPanel
          facts={facts}
          onUpdate={onUpdate}
          onGenerateSummary={handleAppendToDescription}
        />
      )}

      {/* ================================================================== */}
      {/* BREACH DESCRIPTION (for all grounds) */}
      {/* ================================================================== */}
      {selectedGrounds.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-gray-200">
          <div>
            <label htmlFor="breach_description" className="block text-sm font-medium text-gray-700">
              Describe the breach or grounds
              <span className="text-red-500 ml-1">*</span>
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Provide a full description of the circumstances. This will appear in your notice.
            </p>
          </div>

          <textarea
            id="breach_description"
            rows={6}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
            value={breachDescriptionText}
            onChange={(e) => onUpdate({ breach_description: e.target.value })}
            placeholder="Describe the circumstances: what happened, when, the impact, and any evidence you have..."
          />

          {/* Ask Heaven Inline Enhancer */}
          <AskHeavenInlineEnhancer
            questionId="breach_description"
            questionText="Particulars for Wales fault-based eviction grounds"
            answer={breachDescriptionText}
            onApply={(newText) => onUpdate({ breach_description: newText })}
            context={enhanceContext}
            apiMode="generic"
            buttonLabel="Enhance with Ask Heaven"
            helperText="AI will improve clarity and legal strength"
          />
        </div>
      )}

      {/* ================================================================== */}
      {/* NOTICE SERVICE DETAILS */}
      {/* ================================================================== */}
      {selectedGrounds.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900">
            Notice Service Details
          </h4>

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
              value={facts.notice_service_date || ''}
              onChange={(e) => onUpdate({ notice_service_date: e.target.value })}
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
              Minimum {minNoticePeriod} days from service date.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalesNoticeSection;
