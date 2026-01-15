/**
 * Wales Notice Section - Notice Only Wizard (Fault-Based)
 *
 * Wales-specific notice section for fault-based evictions under the
 * Renting Homes (Wales) Act 2016.
 *
 * Features:
 * - Wales grounds selection (serious_rent_arrears, some_rent_arrears, antisocial_behaviour, etc.)
 * - Conditional "Ground Details" panels BEFORE breach_description:
 *   - Arrears: ArrearsScheduleStep (reused from England)
 *   - ASB: Incident details form
 *   - Breach of Contract: Contract breach details
 *   - False Statement: Misrepresentation details
 * - "Use details as starting point" buttons to prepopulate breach_description
 * - AskHeavenInlineEnhancer for breach_description
 *
 * CRITICAL: Does NOT show Section 21, AST, or How to Rent (England-only concepts).
 * Wales uses "occupation contracts" and "contract holders" terminology.
 */

'use client';

import React, { useMemo, useCallback } from 'react';
import type { WizardFacts, ArrearsItem } from '@/lib/case-facts/schema';
import { ArrearsScheduleStep } from '../../ArrearsScheduleStep';
import { computeArrears } from '@/lib/arrears-engine';
import { AskHeavenInlineEnhancer } from '../../AskHeavenInlineEnhancer';

interface WalesNoticeSectionProps {
  facts: WizardFacts;
  onUpdate: (updates: Record<string, any>) => void | Promise<void>;
}

// Wales fault-based grounds with notice periods (from eviction_grounds.json)
const WALES_GROUNDS = [
  {
    value: 'rent_arrears_serious',
    label: 'Serious Rent Arrears (2+ months)',
    code: 'Section 157',
    period: 14,
    mandatory: true,
    description: 'At least 2 months\' rent unpaid at both notice and hearing dates.',
  },
  {
    value: 'rent_arrears_persistent',
    label: 'Persistent Rent Arrears',
    code: 'Section 157 (Ground 8A)',
    period: 14,
    mandatory: true,
    description: 'Arrears threshold reached at least 3 times in past 3 years.',
  },
  {
    value: 'rent_arrears_other',
    label: 'Some Rent Arrears',
    code: 'Section 159',
    period: 56,
    mandatory: false,
    description: 'Some rent unpaid, but less than serious arrears threshold.',
  },
  {
    value: 'antisocial_behaviour',
    label: 'Anti-Social Behaviour',
    code: 'Section 159',
    period: 56,
    mandatory: false,
    description: 'Nuisance, annoyance, or criminal activity by contract holder or visitors.',
  },
  {
    value: 'breach_of_contract',
    label: 'Breach of Occupation Contract',
    code: 'Section 159',
    period: 56,
    mandatory: false,
    description: 'Contract holder has broken a term of the occupation contract.',
  },
  {
    value: 'property_deterioration',
    label: 'Property Deterioration',
    code: 'Section 159',
    period: 56,
    mandatory: false,
    description: 'Property condition deteriorated due to waste or neglect.',
  },
  {
    value: 'false_statement',
    label: 'False Statement',
    code: 'Section 159',
    period: 56,
    mandatory: false,
    description: 'Contract granted based on knowingly false information.',
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

export const WalesNoticeSection: React.FC<WalesNoticeSectionProps> = ({
  facts,
  onUpdate,
}) => {
  // Selected grounds - memoized to prevent unnecessary re-renders
  const selectedGrounds = useMemo(() => {
    return (facts.wales_grounds as string[]) || [];
  }, [facts.wales_grounds]);

  // Check which ground types are selected
  const hasArrearsGround = useMemo(() => {
    return selectedGrounds.some(
      (g) => g === 'rent_arrears_serious' || g === 'rent_arrears_other' || g === 'rent_arrears_persistent'
    );
  }, [selectedGrounds]);
  const hasASBGround = selectedGrounds.includes('antisocial_behaviour');
  const hasBreachGround = selectedGrounds.includes('breach_of_contract');
  const hasFalseStatementGround = selectedGrounds.includes('false_statement');

  // Get arrears items from facts (same canonical keys as England)
  const arrearsItems: ArrearsItem[] = useMemo(() => {
    return facts.issues?.rent_arrears?.arrears_items || facts.arrears_items || [];
  }, [facts.issues?.rent_arrears?.arrears_items, facts.arrears_items]);

  // Calculate arrears summary
  const arrearsSummary = useMemo(() => {
    if (!arrearsItems || arrearsItems.length === 0) return null;
    const rentAmount = facts.rent_amount || 0;
    const rentFrequency = facts.rent_frequency || 'monthly';
    return computeArrears(arrearsItems, rentFrequency, rentAmount);
  }, [arrearsItems, facts.rent_amount, facts.rent_frequency]);

  // Calculate minimum notice period based on selected grounds
  const minNoticePeriod = useMemo(() => {
    if (selectedGrounds.length === 0) return 14;
    let maxPeriod = 14;
    selectedGrounds.forEach((ground) => {
      const groundInfo = WALES_GROUNDS.find((g) => g.value === ground);
      if (groundInfo && groundInfo.period > maxPeriod) {
        maxPeriod = groundInfo.period;
      }
    });
    return maxPeriod;
  }, [selectedGrounds]);

  // Handle ground selection
  const handleGroundToggle = (ground: string) => {
    const newGrounds = selectedGrounds.includes(ground)
      ? selectedGrounds.filter((g) => g !== ground)
      : [...selectedGrounds, ground];
    onUpdate({ wales_grounds: newGrounds });
  };

  // Convert facts to the format expected by ArrearsScheduleStep
  const scheduleStepFacts = useMemo(
    () => ({
      tenancy: {
        start_date: facts.tenancy_start_date,
        rent_amount: facts.rent_amount,
        rent_frequency: facts.rent_frequency,
      },
      tenancy_start_date: facts.tenancy_start_date,
      rent_amount: facts.rent_amount,
      rent_frequency: facts.rent_frequency,
      notice: {
        notice_date: facts.notice_service_date,
      },
      notice_date: facts.notice_service_date,
      issues: {
        rent_arrears: {
          arrears_items: arrearsItems,
          has_arrears: arrearsItems.length > 0,
        },
      },
    }),
    [facts, arrearsItems]
  );

  // Handle updates from ArrearsScheduleStep
  const handleArrearsUpdate = async (updates: Record<string, any>) => {
    if (updates.issues?.rent_arrears) {
      const arrearsData = updates.issues.rent_arrears;
      await onUpdate({
        // Canonical flat keys
        arrears_items: arrearsData.arrears_items,
        total_arrears: arrearsData.total_arrears,
        arrears_at_notice_date: arrearsData.arrears_at_notice_date,
        // Nested structure for compatibility
        issues: {
          ...facts.issues,
          rent_arrears: arrearsData,
        },
      });
    } else {
      await onUpdate(updates);
    }
  };

  // Calculate suggested expiry date
  const suggestedExpiryDate = useMemo(() => {
    if (!facts.notice_service_date) return null;
    const serviceDate = new Date(facts.notice_service_date);
    serviceDate.setDate(serviceDate.getDate() + minNoticePeriod);
    return serviceDate.toISOString().split('T')[0];
  }, [facts.notice_service_date, minNoticePeriod]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
        <h4 className="text-sm font-medium text-purple-900">
          Wales Fault-Based Notice (Renting Homes Act 2016)
        </h4>
        <p className="text-sm text-purple-700 mt-1">
          Select the grounds for possession and provide supporting details below.
        </p>
      </div>

      {/* Ground Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Select Grounds for Possession
          <span className="text-red-500 ml-1">*</span>
        </label>
        <p className="text-xs text-gray-500">
          Select all grounds that apply. Different grounds have different notice periods.
        </p>

        <div className="grid grid-cols-1 gap-2">
          {WALES_GROUNDS.map((ground) => (
            <label
              key={ground.value}
              className={`
                flex items-start p-3 border rounded-lg cursor-pointer transition-all
                ${
                  selectedGrounds.includes(ground.value)
                    ? 'border-[#7C3AED] bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }
              `}
            >
              <input
                type="checkbox"
                checked={selectedGrounds.includes(ground.value)}
                onChange={() => handleGroundToggle(ground.value)}
                className="mt-0.5 mr-2"
              />
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-900">{ground.label}</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500">{ground.code}</span>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded ${
                      ground.mandatory ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {ground.mandatory ? 'Mandatory' : 'Discretionary'}
                  </span>
                  <span className="text-xs text-gray-500">{ground.period} days</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{ground.description}</p>
              </div>
            </label>
          ))}
        </div>

        {selectedGrounds.length > 0 && (
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <p className="text-sm text-purple-800">
              <strong>Selected grounds:</strong>{' '}
              {selectedGrounds
                .map((g) => WALES_GROUNDS.find((wg) => wg.value === g)?.label)
                .join(', ')}
            </p>
            <p className="text-xs text-purple-700 mt-1">
              Minimum notice period: {minNoticePeriod} days
            </p>
          </div>
        )}
      </div>

      {/* Conditional Ground Details Panels */}
      {selectedGrounds.length > 0 && (
        <div className="space-y-6 pt-4 border-t border-gray-200">
          <h4 className="text-base font-medium text-gray-900">Ground Details</h4>

          {/* Arrears Panel - shown first */}
          {hasArrearsGround && (
            <ArrearsPanel
              facts={facts}
              scheduleStepFacts={scheduleStepFacts}
              arrearsSummary={arrearsSummary}
              onArrearsUpdate={handleArrearsUpdate}
              onUpdate={onUpdate}
            />
          )}

          {/* ASB Panel */}
          {hasASBGround && <ASBPanel facts={facts} onUpdate={onUpdate} />}

          {/* Breach of Contract Panel */}
          {hasBreachGround && <BreachOfContractPanel facts={facts} onUpdate={onUpdate} />}

          {/* False Statement Panel */}
          {hasFalseStatementGround && <FalseStatementPanel facts={facts} onUpdate={onUpdate} />}
        </div>
      )}

      {/* Breach Description with Ask Heaven */}
      {selectedGrounds.length > 0 && (
        <BreachDescriptionWithAskHeaven
          facts={facts}
          selectedGrounds={selectedGrounds}
          arrearsSummary={arrearsSummary}
          onUpdate={onUpdate}
        />
      )}

      {/* Service Details */}
      {selectedGrounds.length > 0 && (
        <ServiceDetailsPanel
          facts={facts}
          minNoticePeriod={minNoticePeriod}
          suggestedExpiryDate={suggestedExpiryDate}
          onUpdate={onUpdate}
        />
      )}
    </div>
  );
};

// =============================================================================
// ARREARS PANEL
// =============================================================================

interface ArrearsPanelProps {
  facts: WizardFacts;
  scheduleStepFacts: any;
  arrearsSummary: ReturnType<typeof computeArrears> | null;
  onArrearsUpdate: (updates: Record<string, any>) => void | Promise<void>;
  onUpdate: (updates: Record<string, any>) => void | Promise<void>;
}

const ArrearsPanel: React.FC<ArrearsPanelProps> = ({
  facts,
  scheduleStepFacts,
  arrearsSummary,
  onArrearsUpdate,
  onUpdate,
}) => {
  // Generate arrears summary text
  const generateArrearsSummaryText = useCallback(() => {
    if (!arrearsSummary || arrearsSummary.total_arrears === 0) return '';

    let text = `The contract holder owes £${arrearsSummary.total_arrears.toFixed(2)} in rent arrears, `;
    text += `representing ${arrearsSummary.arrears_in_months.toFixed(1)} months of unpaid rent. `;

    if (arrearsSummary.periods_fully_unpaid > 0) {
      text += `There are ${arrearsSummary.periods_fully_unpaid} rental period(s) that are fully unpaid. `;
    }

    if (arrearsSummary.arrears_in_months >= 2) {
      text += `This exceeds the 2-month threshold for serious rent arrears under the Renting Homes (Wales) Act 2016.`;
    }

    return text;
  }, [arrearsSummary]);

  const handleUseArrearsSummary = () => {
    const summary = generateArrearsSummaryText();
    if (summary) {
      const existingText = facts.breach_description || '';
      const newText = existingText
        ? `${existingText}\n\n--- Rent Arrears Details ---\n${summary}`
        : summary;
      onUpdate({ breach_description: newText });
    }
  };

  // Check prerequisites
  const missingPrereqs: string[] = [];
  if (!facts.tenancy_start_date) missingPrereqs.push('Contract start date');
  if (!facts.rent_amount) missingPrereqs.push('Rent amount');
  if (!facts.rent_frequency) missingPrereqs.push('Rent frequency');

  return (
    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg space-y-4">
      <div>
        <h5 className="text-sm font-semibold text-amber-900">Rent Arrears Schedule</h5>
        <p className="text-xs text-amber-800 mt-1">
          Document the rent periods and payments to support your arrears claim.
        </p>
      </div>

      {missingPrereqs.length > 0 ? (
        <div className="p-3 bg-amber-100 border border-amber-300 rounded">
          <p className="text-sm text-amber-800">
            <strong>Missing information:</strong> Please complete the Tenancy section first:
          </p>
          <ul className="mt-1 text-sm text-amber-700 list-disc list-inside">
            {missingPrereqs.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      ) : (
        <>
          <ArrearsScheduleStep facts={scheduleStepFacts} onUpdate={onArrearsUpdate} />

          {/* Summary and "Use details" button */}
          {arrearsSummary && arrearsSummary.total_arrears > 0 && (
            <div className="p-3 bg-white border border-amber-200 rounded space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">Total arrears:</span>
                  <span className="ml-2 font-semibold text-red-600">
                    £{arrearsSummary.total_arrears.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Months owed:</span>
                  <span className="ml-2 font-semibold">
                    {arrearsSummary.arrears_in_months.toFixed(2)}
                  </span>
                </div>
              </div>

              {arrearsSummary.arrears_in_months >= 2 ? (
                <p className="text-xs text-green-700 font-medium">
                  ✓ Meets serious rent arrears threshold (2+ months)
                </p>
              ) : (
                <p className="text-xs text-amber-700">
                  ⚠ Below serious arrears threshold. May still qualify under "some rent arrears"
                  ground.
                </p>
              )}

              <button
                type="button"
                onClick={handleUseArrearsSummary}
                className="px-3 py-1.5 text-sm font-medium text-amber-700 bg-amber-100 border border-amber-300 rounded-md hover:bg-amber-200"
              >
                Use arrears summary as starting point
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// =============================================================================
// ASB PANEL
// =============================================================================

interface ASBPanelProps {
  facts: WizardFacts;
  onUpdate: (updates: Record<string, any>) => void | Promise<void>;
}

const ASBPanel: React.FC<ASBPanelProps> = ({ facts, onUpdate }) => {
  const generateASBSummaryText = useCallback(() => {
    const parts: string[] = [];

    if (facts.wales_asb_incident_date) {
      parts.push(`On ${facts.wales_asb_incident_date}`);
      if (facts.wales_asb_incident_time) {
        parts.push(`at approximately ${facts.wales_asb_incident_time}`);
      }
    }

    if (facts.wales_asb_location) {
      parts.push(`at ${facts.wales_asb_location}`);
    }

    if (facts.wales_asb_description) {
      parts.push(`, the following incident occurred: ${facts.wales_asb_description}`);
    }

    if (facts.wales_asb_police_involved === 'yes') {
      parts.push(
        `. Police were involved${facts.wales_asb_police_ref ? ` (ref: ${facts.wales_asb_police_ref})` : ''}`
      );
    }

    if (facts.wales_asb_witness_details) {
      parts.push(`. Witness details: ${facts.wales_asb_witness_details}`);
    }

    return parts.join('');
  }, [facts]);

  const handleUseASBDetails = () => {
    const summary = generateASBSummaryText();
    if (summary) {
      const existingText = facts.breach_description || '';
      const newText = existingText
        ? `${existingText}\n\n--- Anti-Social Behaviour Incident ---\n${summary}`
        : summary;
      onUpdate({ breach_description: newText });
    }
  };

  const hasDetails =
    facts.wales_asb_incident_date ||
    facts.wales_asb_description ||
    facts.wales_asb_location;

  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg space-y-4">
      <div>
        <h5 className="text-sm font-semibold text-red-900">Anti-Social Behaviour Incident</h5>
        <p className="text-xs text-red-800 mt-1">
          Document the ASB incident(s) to support your possession claim.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Incident Date */}
        <div className="space-y-1">
          <label
            htmlFor="wales_asb_incident_date"
            className="block text-sm font-medium text-gray-700"
          >
            Incident Date
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

        {/* Incident Time */}
        <div className="space-y-1">
          <label
            htmlFor="wales_asb_incident_time"
            className="block text-sm font-medium text-gray-700"
          >
            Approximate Time
          </label>
          <input
            id="wales_asb_incident_time"
            type="time"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
            value={facts.wales_asb_incident_time || ''}
            onChange={(e) => onUpdate({ wales_asb_incident_time: e.target.value })}
          />
        </div>

        {/* Location */}
        <div className="space-y-1 md:col-span-2">
          <label htmlFor="wales_asb_location" className="block text-sm font-medium text-gray-700">
            Location
          </label>
          <input
            id="wales_asb_location"
            type="text"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
            value={facts.wales_asb_location || ''}
            onChange={(e) => onUpdate({ wales_asb_location: e.target.value })}
            placeholder="e.g., At the property, communal areas, etc."
          />
        </div>

        {/* Description */}
        <div className="space-y-1 md:col-span-2">
          <label
            htmlFor="wales_asb_description"
            className="block text-sm font-medium text-gray-700"
          >
            Description of Incident
            <span className="text-red-500 ml-1">*</span>
          </label>
          <textarea
            id="wales_asb_description"
            rows={3}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
            value={facts.wales_asb_description || ''}
            onChange={(e) => onUpdate({ wales_asb_description: e.target.value })}
            placeholder="Describe what happened, who was involved, impact on neighbours..."
          />
        </div>

        {/* Police Involved */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Police Involved?</label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="wales_asb_police_involved"
                checked={facts.wales_asb_police_involved === 'yes'}
                onChange={() => onUpdate({ wales_asb_police_involved: 'yes' })}
                className="mr-2"
              />
              Yes
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="wales_asb_police_involved"
                checked={facts.wales_asb_police_involved === 'no'}
                onChange={() => onUpdate({ wales_asb_police_involved: 'no' })}
                className="mr-2"
              />
              No
            </label>
          </div>
        </div>

        {/* Police Reference */}
        {facts.wales_asb_police_involved === 'yes' && (
          <div className="space-y-1">
            <label
              htmlFor="wales_asb_police_ref"
              className="block text-sm font-medium text-gray-700"
            >
              Police Reference Number
            </label>
            <input
              id="wales_asb_police_ref"
              type="text"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
              value={facts.wales_asb_police_ref || ''}
              onChange={(e) => onUpdate({ wales_asb_police_ref: e.target.value })}
              placeholder="Crime reference number"
            />
          </div>
        )}

        {/* Witness Details */}
        <div className="space-y-1 md:col-span-2">
          <label
            htmlFor="wales_asb_witness_details"
            className="block text-sm font-medium text-gray-700"
          >
            Witness Details (optional)
          </label>
          <textarea
            id="wales_asb_witness_details"
            rows={2}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
            value={facts.wales_asb_witness_details || ''}
            onChange={(e) => onUpdate({ wales_asb_witness_details: e.target.value })}
            placeholder="Names and contact details of witnesses who can provide statements"
          />
        </div>
      </div>

      {/* Use details button */}
      {hasDetails && (
        <button
          type="button"
          onClick={handleUseASBDetails}
          className="px-3 py-1.5 text-sm font-medium text-red-700 bg-red-100 border border-red-300 rounded-md hover:bg-red-200"
        >
          Use these details as starting point
        </button>
      )}
    </div>
  );
};

// =============================================================================
// BREACH OF CONTRACT PANEL
// =============================================================================

interface BreachOfContractPanelProps {
  facts: WizardFacts;
  onUpdate: (updates: Record<string, any>) => void | Promise<void>;
}

const BreachOfContractPanel: React.FC<BreachOfContractPanelProps> = ({ facts, onUpdate }) => {
  const generateBreachSummaryText = useCallback(() => {
    const parts: string[] = [];

    if (facts.wales_breach_clause) {
      parts.push(`The contract holder has breached clause ${facts.wales_breach_clause} of the occupation contract`);
    }

    if (facts.wales_breach_dates) {
      parts.push(`. The breach occurred on/during ${facts.wales_breach_dates}`);
    }

    if (facts.wales_breach_evidence) {
      parts.push(`. Evidence of breach: ${facts.wales_breach_evidence}`);
    }

    return parts.join('');
  }, [facts]);

  const handleUseBreachDetails = () => {
    const summary = generateBreachSummaryText();
    if (summary) {
      const existingText = facts.breach_description || '';
      const newText = existingText
        ? `${existingText}\n\n--- Breach of Contract Details ---\n${summary}`
        : summary;
      onUpdate({ breach_description: newText });
    }
  };

  const hasDetails = facts.wales_breach_clause || facts.wales_breach_dates || facts.wales_breach_evidence;

  return (
    <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg space-y-4">
      <div>
        <h5 className="text-sm font-semibold text-orange-900">Breach of Occupation Contract</h5>
        <p className="text-xs text-orange-800 mt-1">
          Document which contract term was breached and provide evidence.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Clause Breached */}
        <div className="space-y-1">
          <label
            htmlFor="wales_breach_clause"
            className="block text-sm font-medium text-gray-700"
          >
            Clause/Term Breached
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            id="wales_breach_clause"
            type="text"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
            value={facts.wales_breach_clause || ''}
            onChange={(e) => onUpdate({ wales_breach_clause: e.target.value })}
            placeholder="e.g., Clause 4.2 - No pets without written consent"
          />
        </div>

        {/* Breach Dates */}
        <div className="space-y-1">
          <label
            htmlFor="wales_breach_dates"
            className="block text-sm font-medium text-gray-700"
          >
            When did the breach occur?
          </label>
          <input
            id="wales_breach_dates"
            type="text"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
            value={facts.wales_breach_dates || ''}
            onChange={(e) => onUpdate({ wales_breach_dates: e.target.value })}
            placeholder="e.g., Ongoing since 15 March 2024"
          />
        </div>

        {/* Evidence Summary */}
        <div className="space-y-1">
          <label
            htmlFor="wales_breach_evidence"
            className="block text-sm font-medium text-gray-700"
          >
            Evidence of Breach
          </label>
          <textarea
            id="wales_breach_evidence"
            rows={3}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
            value={facts.wales_breach_evidence || ''}
            onChange={(e) => onUpdate({ wales_breach_evidence: e.target.value })}
            placeholder="Describe the evidence you have: photos, correspondence, inspection reports..."
          />
        </div>
      </div>

      {/* Use details button */}
      {hasDetails && (
        <button
          type="button"
          onClick={handleUseBreachDetails}
          className="px-3 py-1.5 text-sm font-medium text-orange-700 bg-orange-100 border border-orange-300 rounded-md hover:bg-orange-200"
        >
          Use these details as starting point
        </button>
      )}
    </div>
  );
};

// =============================================================================
// FALSE STATEMENT PANEL
// =============================================================================

interface FalseStatementPanelProps {
  facts: WizardFacts;
  onUpdate: (updates: Record<string, any>) => void | Promise<void>;
}

const FalseStatementPanel: React.FC<FalseStatementPanelProps> = ({ facts, onUpdate }) => {
  const generateFalseStatementText = useCallback(() => {
    const parts: string[] = [];

    if (facts.wales_false_statement_summary) {
      parts.push(`The contract was granted on the basis of the following false statement: ${facts.wales_false_statement_summary}`);
    }

    if (facts.wales_false_statement_discovered_date) {
      parts.push(`. This was discovered on ${facts.wales_false_statement_discovered_date}`);
    }

    if (facts.wales_false_statement_evidence) {
      parts.push(`. Evidence: ${facts.wales_false_statement_evidence}`);
    }

    return parts.join('');
  }, [facts]);

  const handleUseFalseStatementDetails = () => {
    const summary = generateFalseStatementText();
    if (summary) {
      const existingText = facts.breach_description || '';
      const newText = existingText
        ? `${existingText}\n\n--- False Statement Details ---\n${summary}`
        : summary;
      onUpdate({ breach_description: newText });
    }
  };

  const hasDetails =
    facts.wales_false_statement_summary ||
    facts.wales_false_statement_discovered_date ||
    facts.wales_false_statement_evidence;

  return (
    <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg space-y-4">
      <div>
        <h5 className="text-sm font-semibold text-indigo-900">False Statement</h5>
        <p className="text-xs text-indigo-800 mt-1">
          Document the false information that led to granting the occupation contract.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* False Statement Summary */}
        <div className="space-y-1">
          <label
            htmlFor="wales_false_statement_summary"
            className="block text-sm font-medium text-gray-700"
          >
            What false statement was made?
            <span className="text-red-500 ml-1">*</span>
          </label>
          <textarea
            id="wales_false_statement_summary"
            rows={3}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
            value={facts.wales_false_statement_summary || ''}
            onChange={(e) => onUpdate({ wales_false_statement_summary: e.target.value })}
            placeholder="e.g., Applicant stated they had no pets, but moved in with two dogs..."
          />
        </div>

        {/* Discovery Date */}
        <div className="space-y-1">
          <label
            htmlFor="wales_false_statement_discovered_date"
            className="block text-sm font-medium text-gray-700"
          >
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

        {/* Evidence */}
        <div className="space-y-1">
          <label
            htmlFor="wales_false_statement_evidence"
            className="block text-sm font-medium text-gray-700"
          >
            Evidence
          </label>
          <textarea
            id="wales_false_statement_evidence"
            rows={2}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
            value={facts.wales_false_statement_evidence || ''}
            onChange={(e) => onUpdate({ wales_false_statement_evidence: e.target.value })}
            placeholder="Application form, references, documents proving the true facts..."
          />
        </div>
      </div>

      {/* Use details button */}
      {hasDetails && (
        <button
          type="button"
          onClick={handleUseFalseStatementDetails}
          className="px-3 py-1.5 text-sm font-medium text-indigo-700 bg-indigo-100 border border-indigo-300 rounded-md hover:bg-indigo-200"
        >
          Use these details as starting point
        </button>
      )}
    </div>
  );
};

// =============================================================================
// BREACH DESCRIPTION WITH ASK HEAVEN
// =============================================================================

interface BreachDescriptionProps {
  facts: WizardFacts;
  selectedGrounds: string[];
  arrearsSummary: ReturnType<typeof computeArrears> | null;
  onUpdate: (updates: Record<string, any>) => void | Promise<void>;
}

const BreachDescriptionWithAskHeaven: React.FC<BreachDescriptionProps> = ({
  facts,
  selectedGrounds,
  arrearsSummary,
  onUpdate,
}) => {
  const breachDescription = facts.breach_description || '';

  // Build context for Ask Heaven enhancement
  const enhanceContext = useMemo(
    () => ({
      jurisdiction: 'wales',
      statute: 'Renting Homes (Wales) Act 2016',
      selected_grounds: selectedGrounds.map((g) => WALES_GROUNDS.find((wg) => wg.value === g)?.label),
      total_arrears: arrearsSummary?.total_arrears,
      arrears_in_months: arrearsSummary?.arrears_in_months,
      rent_amount: facts.rent_amount,
      rent_frequency: facts.rent_frequency,
      // Include structured details if present
      asb_incident: facts.wales_asb_description,
      breach_clause: facts.wales_breach_clause,
      false_statement: facts.wales_false_statement_summary,
    }),
    [selectedGrounds, arrearsSummary, facts]
  );

  return (
    <div className="pt-6 border-t border-gray-200 space-y-4">
      <div>
        <h4 className="text-base font-medium text-gray-900">Describe the breach or grounds</h4>
        <p className="text-sm text-gray-600">
          Provide a complete description of the grounds for possession. This will appear in your
          court documents.
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="breach_description" className="block text-sm font-medium text-gray-700">
          Breach/Grounds Description
          <span className="text-red-500 ml-1">*</span>
        </label>
        <textarea
          id="breach_description"
          rows={8}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
          value={breachDescription}
          onChange={(e) => onUpdate({ breach_description: e.target.value })}
          placeholder="Describe the grounds for possession in detail. Include dates, amounts, and specific circumstances. Use the 'Use details' buttons above to auto-populate from your structured entries."
        />
        <p className="text-xs text-gray-500">
          Be specific and factual. Include dates, amounts, and reference any supporting evidence.
          Selected grounds: {selectedGrounds.map((g) => WALES_GROUNDS.find((wg) => wg.value === g)?.label).join(', ')}
        </p>
      </div>

      {/* Ask Heaven Inline Enhancer */}
      <AskHeavenInlineEnhancer
        questionId="breach_description"
        questionText="Grounds for possession (Wales fault-based notice)"
        answer={breachDescription}
        onApply={(newText) => onUpdate({ breach_description: newText })}
        context={enhanceContext}
        apiMode="generic"
        helperText="AI will strengthen your narrative for court"
      />
    </div>
  );
};

// =============================================================================
// SERVICE DETAILS PANEL
// =============================================================================

interface ServiceDetailsPanelProps {
  facts: WizardFacts;
  minNoticePeriod: number;
  suggestedExpiryDate: string | null;
  onUpdate: (updates: Record<string, any>) => void | Promise<void>;
}

const ServiceDetailsPanel: React.FC<ServiceDetailsPanelProps> = ({
  facts,
  minNoticePeriod,
  suggestedExpiryDate,
  onUpdate,
}) => {
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="pt-6 border-t border-gray-200 space-y-4">
      <h4 className="text-base font-medium text-gray-900">Notice Service Details</h4>

      {/* Service Date */}
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

      {/* Service Method */}
      <div className="space-y-2">
        <label
          htmlFor="notice_service_method"
          className="block text-sm font-medium text-gray-700"
        >
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

      {/* Expiry Date */}
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
          Minimum {minNoticePeriod} days from service date for your selected grounds.
        </p>
      </div>
    </div>
  );
};

export default WalesNoticeSection;
