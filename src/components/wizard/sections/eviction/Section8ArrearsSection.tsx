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

import React, { useMemo, useCallback, useEffect } from 'react';
import type { WizardFacts, ArrearsItem } from '@/lib/case-facts/schema';
import { ArrearsScheduleStep } from '../../ArrearsScheduleStep';
import { validateGround8Eligibility, computeArrears } from '@/lib/arrears-engine';
import { AskHeavenInlineEnhancer } from '../../AskHeavenInlineEnhancer';
import { useValidationContextSafe } from '@/components/wizard/ValidationContext';
import { RiErrorWarningLine } from 'react-icons/ri';

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

  // P0-4 FIX: Validate arrears date ranges
  // Check for: start > end, negative durations, overlapping periods
  const dateRangeErrors = useMemo(() => {
    if (!arrearsItems || arrearsItems.length === 0) {
      return [];
    }

    const errors: Array<{ index: number; message: string }> = [];
    // Track indices with invalid date ranges to exclude from overlap detection
    const invalidRangeIndices = new Set<number>();

    arrearsItems.forEach((item, index) => {
      // Normalize numeric values to avoid crashes if values are strings
      const rentPaid = Number(item.rent_paid ?? 0);
      const rentDue = Number(item.rent_due ?? 0);

      // Check start <= end
      if (item.period_start && item.period_end && item.period_start > item.period_end) {
        errors.push({
          index,
          message: `Period ${index + 1}: Start date (${item.period_start}) is after end date (${item.period_end})`,
        });
        invalidRangeIndices.add(index);
      }

      // Check for negative rent due (shouldn't happen but validate)
      if (rentDue < 0) {
        errors.push({
          index,
          message: `Period ${index + 1}: Rent due cannot be negative`,
        });
      }

      // Check rent_paid is not greater than rent_due
      if (rentPaid > rentDue) {
        errors.push({
          index,
          message: `Period ${index + 1}: Amount paid (£${rentPaid.toFixed(2)}) exceeds rent due (£${rentDue.toFixed(2)})`,
        });
      }
    });

    // Check for overlapping periods using sorted order
    // Only include items with valid date ranges (both dates present, start <= end)
    const validItemsWithIndex = arrearsItems
      .map((item, originalIndex) => ({ item, originalIndex }))
      .filter(({ item, originalIndex }) =>
        item.period_start &&
        item.period_end &&
        !invalidRangeIndices.has(originalIndex)
      );

    if (validItemsWithIndex.length > 1) {
      // Sort by period_start, then by period_end (ISO date strings sort correctly)
      const sorted = [...validItemsWithIndex].sort((a, b) => {
        const startCmp = a.item.period_start.localeCompare(b.item.period_start);
        if (startCmp !== 0) return startCmp;
        return a.item.period_end.localeCompare(b.item.period_end);
      });

      for (let i = 0; i < sorted.length - 1; i++) {
        const current = sorted[i];
        const next = sorted[i + 1];
        // Overlap exists if current.period_end > next.period_start
        // Note: end == start (boundary touch) is NOT an overlap
        if (current.item.period_end > next.item.period_start) {
          errors.push({
            index: current.originalIndex,
            message: `Period ${current.originalIndex + 1} overlaps with period ${next.originalIndex + 1}`,
          });
        }
      }
    }

    return errors;
  }, [arrearsItems]);

  // P0-4 FIX: Register date range errors with ValidationContext
  const validationCtx = useValidationContextSafe();
  const DATE_RANGE_FIELD_ID = 'section8_arrears_date_ranges';

  useEffect(() => {
    if (dateRangeErrors.length > 0) {
      // Register error with ValidationContext so Next button is blocked
      validationCtx?.setFieldError(DATE_RANGE_FIELD_ID, {
        field: DATE_RANGE_FIELD_ID,
        message: dateRangeErrors.map(e => e.message).join('; '),
        severity: 'error',
        section: 'section8_arrears',
      });
    } else {
      validationCtx?.clearFieldError(DATE_RANGE_FIELD_ID);
    }
  }, [dateRangeErrors, validationCtx]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      validationCtx?.clearFieldError(DATE_RANGE_FIELD_ID);
    };
  }, [validationCtx]);

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
      <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
        <h4 className="text-sm font-medium text-purple-900 mb-2">
          {hasGround8 ? 'Ground 8 Arrears Schedule (Required)' : 'Arrears Schedule'}
        </h4>
        {hasGround8 && (
          <p className="text-sm text-purple-800">
            Ground 8 is a <strong>mandatory ground</strong> requiring at least 2 months&apos; rent
            arrears at both the date of service and the date of the hearing.
            The court requires a detailed period-by-period breakdown.
          </p>
        )}
        {!hasGround8 && (hasGround10 || hasGround11) && (
          <p className="text-sm text-purple-800">
            Grounds 10 and 11 are <strong>discretionary grounds</strong>. A detailed arrears
            schedule strengthens your case but the court will decide if possession is reasonable.
          </p>
        )}
      </div>

      {/* P0-4 FIX: Date range validation errors */}
      {dateRangeErrors.length > 0 && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2">
            <RiErrorWarningLine className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-red-900 mb-2">
                Arrears Schedule Errors - Must Fix to Continue
              </h4>
              <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                {dateRangeErrors.map((error, i) => (
                  <li key={i}>{error.message}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

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

      {/* Particulars Section - with Ask Heaven */}
      <ParticularsWithAskHeaven
        facts={facts}
        selectedGrounds={selectedGrounds}
        arrearsSummary={arrearsSummary}
        onUpdate={onUpdate}
      />
    </div>
  );
};

// ============================================================================
// PARTICULARS WITH ASK HEAVEN
// ============================================================================
// Allows users to write particulars after seeing the arrears data,
// with AI assistance from Ask Heaven using the shared inline enhancer.
// ============================================================================

interface ParticularsProps {
  facts: WizardFacts;
  selectedGrounds: string[];
  arrearsSummary: ReturnType<typeof computeArrears> | null;
  onUpdate: (updates: Record<string, any>) => void | Promise<void>;
}

const ParticularsWithAskHeaven: React.FC<ParticularsProps> = ({
  facts,
  selectedGrounds,
  arrearsSummary,
  onUpdate,
}) => {
  const particularsText = facts.section8_details || '';

  // Generate a suggested starting point based on arrears data
  const generateSuggestion = useCallback(() => {
    if (!arrearsSummary || arrearsSummary.total_arrears === 0) return '';

    let suggestion = `The tenant owes £${arrearsSummary.total_arrears.toFixed(2)} in rent arrears, `;
    suggestion += `representing ${arrearsSummary.arrears_in_months.toFixed(1)} months of unpaid rent. `;

    if (arrearsSummary.periods_fully_unpaid > 0) {
      suggestion += `There are ${arrearsSummary.periods_fully_unpaid} rental period(s) that are fully unpaid. `;
    }

    if (arrearsSummary.arrears_in_months >= 2) {
      suggestion += `This exceeds the Ground 8 threshold of 2 months' arrears.`;
    }

    return suggestion;
  }, [arrearsSummary]);

  const handleUseSuggestion = () => {
    const suggestion = generateSuggestion();
    if (suggestion) {
      onUpdate({ section8_details: suggestion });
    }
  };

  // Build context for Ask Heaven enhancement
  const enhanceContext = useMemo(() => ({
    selected_grounds: selectedGrounds,
    total_arrears: arrearsSummary?.total_arrears,
    arrears_in_months: arrearsSummary?.arrears_in_months,
    rent_amount: facts.rent_amount,
    rent_frequency: facts.rent_frequency,
    jurisdiction: 'england',
  }), [selectedGrounds, arrearsSummary, facts.rent_amount, facts.rent_frequency]);

  return (
    <div className="pt-6 border-t border-gray-200 space-y-4">
      <div>
        <h4 className="text-base font-medium text-gray-900 mb-1">
          Particulars of Claim
        </h4>
        <p className="text-sm text-gray-600">
          Describe the grounds for possession based on the arrears schedule above.
          This will appear in your court documents.
        </p>
      </div>

      {/* Quick start from arrears data */}
      {arrearsSummary && arrearsSummary.total_arrears > 0 && !particularsText && (
        <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <p className="text-sm text-purple-800 mb-2">
            <strong>Quick start:</strong> Generate a summary based on your arrears schedule.
          </p>
          <button
            type="button"
            onClick={handleUseSuggestion}
            className="px-3 py-1.5 text-sm font-medium text-purple-700 bg-white border border-purple-300 rounded-md hover:bg-purple-50"
          >
            Use arrears summary as starting point
          </button>
        </div>
      )}

      {/* Particulars textarea */}
      <div className="space-y-2">
        <label htmlFor="section8_details" className="block text-sm font-medium text-gray-700">
          Particulars for selected grounds
          <span className="text-red-500 ml-1">*</span>
        </label>
        <textarea
          id="section8_details"
          rows={6}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
          value={particularsText}
          onChange={(e) => onUpdate({ section8_details: e.target.value })}
          placeholder="Describe the rent arrears: total amount owed, how many months behind, when arrears began, any partial payments made..."
        />
        <p className="text-xs text-gray-500">
          Be specific and factual. Include dates, amounts, and reference the arrears schedule.
          Selected grounds: {selectedGrounds.join(', ') || 'None selected'}
        </p>
      </div>

      {/* Ask Heaven Inline Enhancer */}
      <AskHeavenInlineEnhancer
        questionId="section8_details"
        questionText="Particulars for Section 8 grounds (rent arrears)"
        answer={particularsText}
        onApply={(newText) => onUpdate({ section8_details: newText })}
        context={enhanceContext}
        apiMode="generic"
      />
    </div>
  );
};

export default Section8ArrearsSection;
