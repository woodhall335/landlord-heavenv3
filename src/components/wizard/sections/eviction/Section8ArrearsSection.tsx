/**
 * Section 8 Arrears Section - Eviction Wizard
 *
 * Step 7 (Section 8 only): Collects detailed arrears schedule.
 *
 * CRITICAL: This section MUST use the existing ArrearsScheduleStep component
 * and the canonical arrears engine. DO NOT create a new arrears UI.
 *
 * Ground 8 Requirements:
 * - Minimum 2 months' rent arrears at BOTH notice date AND hearing date
 * - Period-by-period breakdown required for court
 * - validateGround8Eligibility() MUST pass before proceeding
 *
 * Data Flow:
 * 1. User enters tenancy details in Tenancy section
 * 2. ArrearsScheduleStep generates rent periods from tenancy_start_date
 * 3. User marks each period as paid/partial/unpaid
 * 4. computeArrears() calculates totals from arrears_items
 * 5. validateGround8Eligibility() checks threshold
 * 6. arrears_items stored in facts (canonical source)
 */

'use client';

import React, { useMemo } from 'react';
import type { WizardFacts, ArrearsItem } from '@/lib/case-facts/schema';
import { ArrearsScheduleStep } from '../../ArrearsScheduleStep';
import { validateGround8Eligibility, computeArrears } from '@/lib/arrears-engine';

interface Section8ArrearsSectionProps {
  facts: WizardFacts;
  jurisdiction: 'england' | 'wales';
  onUpdate: (updates: Record<string, any>) => void | Promise<void>;
}

export const Section8ArrearsSection: React.FC<Section8ArrearsSectionProps> = ({
  facts,
  onUpdate,
}) => {
  const selectedGrounds = (facts.section8_grounds as string[]) || [];

  // Check which arrears grounds are selected
  const hasGround8 = selectedGrounds.some((g) => g.includes('Ground 8'));
  const hasGround10 = selectedGrounds.some((g) => g.includes('Ground 10'));
  const hasGround11 = selectedGrounds.some((g) => g.includes('Ground 11'));
  const hasAnyArrearsGround = hasGround8 || hasGround10 || hasGround11;

  // Get arrears items from facts
  const arrearsItems: ArrearsItem[] = useMemo(() => {
    // Check nested structure first, then flat
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

  // Validate Ground 8 eligibility
  const ground8Validation = useMemo(() => {
    if (!hasGround8 || !arrearsItems || arrearsItems.length === 0) {
      return null;
    }

    return validateGround8Eligibility({
      arrears_items: arrearsItems,
      rent_amount: facts.rent_amount || 0,
      rent_frequency: facts.rent_frequency || 'monthly',
      jurisdiction: 'england',
    });
  }, [hasGround8, arrearsItems, facts.rent_amount, facts.rent_frequency]);

  // Convert facts to the format expected by ArrearsScheduleStep
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
  const handleArrearsUpdate = async (updates: Record<string, any>) => {
    // ArrearsScheduleStep updates issues.rent_arrears
    // We need to flatten this to the top level and also store canonical path
    if (updates.issues?.rent_arrears) {
      const arrearsData = updates.issues.rent_arrears;
      await onUpdate({
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
  };

  // If no arrears grounds selected, show info message
  if (!hasAnyArrearsGround) {
    return (
      <div className="space-y-6">
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            No Arrears Grounds Selected
          </h4>
          <p className="text-sm text-gray-600">
            The arrears schedule is only required when using Grounds 8, 10, or 11.
            You have selected: {selectedGrounds.length > 0 ? selectedGrounds.join(', ') : 'none'}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            If you need to claim for rent arrears, go back to the Notice section
            and select the appropriate grounds.
          </p>
        </div>
      </div>
    );
  }

  // Check prerequisites
  const missingPrerequisites: string[] = [];
  if (!facts.tenancy_start_date) missingPrerequisites.push('Tenancy start date');
  if (!facts.rent_amount) missingPrerequisites.push('Rent amount');
  if (!facts.rent_frequency) missingPrerequisites.push('Rent frequency');

  if (missingPrerequisites.length > 0) {
    return (
      <div className="space-y-6">
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <h4 className="text-sm font-medium text-amber-900 mb-2">
            Missing Required Information
          </h4>
          <p className="text-sm text-amber-800 mb-3">
            Before you can complete the arrears schedule, please go back and fill in:
          </p>
          <ul className="list-disc list-inside text-sm text-amber-700">
            {missingPrerequisites.map((prereq) => (
              <li key={prereq}>{prereq}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Ground info */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">
          {hasGround8 ? 'Ground 8 Arrears Schedule (Required)' : 'Arrears Schedule'}
        </h4>
        {hasGround8 && (
          <p className="text-sm text-blue-800">
            Ground 8 is a <strong>mandatory ground</strong> requiring at least 2 months&apos; rent
            arrears at both the date of service and the date of the hearing.
            The court requires a detailed period-by-period breakdown.
          </p>
        )}
        {!hasGround8 && (hasGround10 || hasGround11) && (
          <p className="text-sm text-blue-800">
            Grounds 10 and 11 are <strong>discretionary grounds</strong>. A detailed arrears
            schedule strengthens your case but the court will decide if possession is reasonable.
          </p>
        )}
      </div>

      {/* Arrears Schedule Component */}
      <ArrearsScheduleStep
        facts={scheduleStepFacts}
        onUpdate={handleArrearsUpdate}
      />

      {/* Ground 8 Validation */}
      {hasGround8 && ground8Validation && (
        <div className={`p-4 rounded-lg border ${
          ground8Validation.is_eligible
            ? 'bg-green-50 border-green-200'
            : 'bg-red-50 border-red-200'
        }`}>
          <h4 className={`text-sm font-medium mb-2 ${
            ground8Validation.is_eligible ? 'text-green-900' : 'text-red-900'
          }`}>
            Ground 8 Eligibility: {ground8Validation.is_eligible ? 'THRESHOLD MET' : 'THRESHOLD NOT MET'}
          </h4>
          <div className={`text-sm ${ground8Validation.is_eligible ? 'text-green-800' : 'text-red-800'}`}>
            <p>
              Arrears: {ground8Validation.arrears_in_months?.toFixed(2) || 0} months
              ({ground8Validation.is_eligible ? '≥' : '<'} 2 months required)
            </p>
            {!ground8Validation.is_eligible && (
              <p className="mt-2 font-medium">
                You cannot proceed with Ground 8 until the arrears threshold is met.
                Consider using Grounds 10 or 11 instead.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Summary display */}
      {arrearsSummary && arrearsSummary.total_arrears > 0 && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            Arrears Summary
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Total arrears:</span>
              <span className="ml-2 font-semibold text-red-600">
                £{arrearsSummary.total_arrears.toFixed(2)}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Arrears in months:</span>
              <span className="ml-2 font-semibold">
                {arrearsSummary.arrears_in_months.toFixed(2)}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Periods with arrears:</span>
              <span className="ml-2 font-semibold">
                {arrearsSummary.periods_with_arrears}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Fully unpaid periods:</span>
              <span className="ml-2 font-semibold">
                {arrearsSummary.periods_fully_unpaid}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Section8ArrearsSection;
