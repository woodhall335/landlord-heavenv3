/**
 * Wales Arrears Section - Notice Only Wizard
 *
 * Dedicated arrears schedule section for Wales fault_based notices with arrears grounds.
 * Mirrors the England Section 8 arrears flow but uses Wales terminology and thresholds.
 *
 * Features:
 * - Period-by-period rent schedule table (ArrearsScheduleStep)
 * - Wales Section 157 threshold validation (8+ weeks for serious arrears)
 * - Part D particulars with Ask Heaven inline enhancer
 * - Auto-generates arrears narrative for Part D
 *
 * Note: This section only appears when:
 * - Route is fault_based
 * - Arrears ground is selected (rent_arrears_serious or rent_arrears_other)
 */

'use client';

import React, { useMemo, useCallback } from 'react';
import type { WizardFacts, ArrearsItem } from '@/lib/case-facts/schema';
import { ArrearsScheduleStep } from '../../ArrearsScheduleStep';
import { AskHeavenInlineEnhancer } from '../../AskHeavenInlineEnhancer';
import { computeArrears } from '@/lib/arrears-engine';
import { isWalesSection157ThresholdMet } from '@/lib/wales/seriousArrearsThreshold';
import { buildWalesPartDFromWizardFacts } from '@/lib/wales/partDBuilder';
import { normalizeWalesFaultGrounds, hasArrearsGroundSelected } from '@/lib/wales/compliance-schema';

interface WalesArrearsSectionProps {
  facts: WizardFacts;
  jurisdiction: 'england' | 'wales';
  onUpdate: (updates: Record<string, any>) => void | Promise<void>;
}

export const WalesArrearsSection: React.FC<WalesArrearsSectionProps> = ({
  facts,
  onUpdate,
}) => {
  // Get selected grounds
  const selectedGrounds = normalizeWalesFaultGrounds(facts.wales_fault_grounds);
  const hasArrearsGround = hasArrearsGroundSelected(facts.wales_fault_grounds);
  const isSerious = selectedGrounds.includes('rent_arrears_serious');
  const isOtherArrears = selectedGrounds.includes('rent_arrears_other');

  // Get arrears items from facts
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

  // Wales Section 157 threshold validation
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
      notice_date: facts.notice_served_date || facts.notice_date,
    },
    notice_date: facts.notice_served_date || facts.notice_date,
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
        // Canonical flat keys
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

  // If no arrears grounds selected, show info message
  if (!hasArrearsGround) {
    return (
      <div className="space-y-6">
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            No Arrears Grounds Selected
          </h4>
          <p className="text-sm text-gray-600">
            The arrears schedule is only required when using Section 157 (serious arrears) or
            Section 159 (other arrears) grounds.
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Selected grounds: {selectedGrounds.length > 0 ? selectedGrounds.join(', ') : 'none'}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            If you need to claim for rent arrears, go back to the Compliance section
            and select the appropriate ground.
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
          {isSerious ? 'Section 157 - Serious Rent Arrears Schedule (Required)' : 'Section 159 - Rent Arrears Schedule'}
        </h4>
        {isSerious && (
          <p className="text-sm text-purple-800">
            Section 157 of the Renting Homes (Wales) Act 2016 requires at least <strong>8 weeks&apos;</strong> rent
            arrears. The court requires a detailed period-by-period breakdown to verify the threshold is met.
          </p>
        )}
        {isOtherArrears && !isSerious && (
          <p className="text-sm text-purple-800">
            Section 159 (rent arrears) is a <strong>discretionary ground</strong>. A detailed arrears
            schedule strengthens your case but the court will decide if possession is reasonable.
          </p>
        )}
      </div>

      {/* Arrears Schedule Component */}
      <ArrearsScheduleStep
        facts={scheduleStepFacts}
        onUpdate={handleArrearsUpdate}
        jurisdiction="wales"
      />

      {/* Section 157 Threshold Validation */}
      {isSerious && thresholdResult && (
        <div className={`p-4 rounded-lg border ${
          thresholdResult.met
            ? 'bg-green-50 border-green-200'
            : 'bg-red-50 border-red-200'
        }`}>
          <h4 className={`text-sm font-medium mb-2 ${
            thresholdResult.met ? 'text-green-900' : 'text-red-900'
          }`}>
            Section 157 Eligibility: {thresholdResult.met ? 'THRESHOLD MET' : 'THRESHOLD NOT MET'}
          </h4>
          <div className={`text-sm ${thresholdResult.met ? 'text-green-800' : 'text-red-800'}`}>
            <p>
              Arrears: £{arrearsSummary?.total_arrears.toFixed(2) || '0.00'} ({thresholdResult.met ? '≥' : '<'} {thresholdResult.thresholdLabel} required)
            </p>
            {arrearsSummary && (
              <p>
                This represents approximately {arrearsSummary.arrears_in_months.toFixed(1)} months of rent.
              </p>
            )}
            {!thresholdResult.met && (
              <p className="mt-2 font-medium">
                You cannot proceed with Section 157 (serious arrears) until the threshold is met.
                Consider using Section 159 (other rent arrears) instead.
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

      {/* Part D Particulars Section - with Ask Heaven */}
      <PartDParticularsWithAskHeaven
        facts={facts}
        selectedGrounds={selectedGrounds}
        arrearsSummary={arrearsSummary}
        onUpdate={onUpdate}
      />
    </div>
  );
};

// ============================================================================
// PART D PARTICULARS WITH ASK HEAVEN
// ============================================================================
// Wales-specific particulars section with AI assistance.
// Generates Part D text for RHW23 notice form.
// ============================================================================

interface PartDParticularsProps {
  facts: WizardFacts;
  selectedGrounds: string[];
  arrearsSummary: ReturnType<typeof computeArrears> | null;
  onUpdate: (updates: Record<string, any>) => void | Promise<void>;
}

const PartDParticularsWithAskHeaven: React.FC<PartDParticularsProps> = ({
  facts,
  selectedGrounds,
  arrearsSummary,
  onUpdate,
}) => {
  const particularsText = facts.wales_part_d_particulars || '';

  // Generate Part D text using the builder
  const generatePartD = useCallback(() => {
    const result = buildWalesPartDFromWizardFacts({
      ...facts,
      wales_fault_grounds: selectedGrounds,
      total_arrears: arrearsSummary?.total_arrears,
      arrears_items: facts.arrears_items || facts.issues?.rent_arrears?.arrears_items,
    });
    return result.text;
  }, [facts, selectedGrounds, arrearsSummary]);

  const handleGeneratePartD = () => {
    const generated = generatePartD();
    if (generated) {
      onUpdate({ wales_part_d_particulars: generated });
    }
  };

  // Build context for Ask Heaven enhancement - with strict Wales guardrails
  const enhanceContext = useMemo(() => ({
    // Jurisdiction and legal framework
    jurisdiction: 'wales',
    product: 'notice_only',
    legal_framework: 'Renting Homes (Wales) Act 2016',
    notice_type: 'fault_based_breach_notice',

    // Selected grounds
    selected_grounds: selectedGrounds,

    // Arrears data
    total_arrears: arrearsSummary?.total_arrears,
    arrears_in_months: arrearsSummary?.arrears_in_months,
    periods_fully_unpaid: arrearsSummary?.periods_fully_unpaid,
    rent_amount: facts.rent_amount,
    rent_frequency: facts.rent_frequency,

    // STRICT GUARDRAILS for Ask Heaven
    enhancement_instructions: [
      'Rewrite for court-readiness and clarity under the Renting Homes (Wales) Act 2016.',
      'Use ONLY Wales terminology: Section 157, 159, 160, 161 of RH(W)A 2016.',
      'Do NOT invent or fabricate any facts not present in the input.',
      'Do NOT mention: Housing Act 1988, Section 8, Section 21, Ground 8, Form 6A, AST, assured shorthold tenancy.',
      'If information is missing, note it as "Missing: [item]" at the end.',
      'Preserve all factual claims from the original text.',
    ],
    forbidden_terms: [
      'Housing Act 1988',
      'Section 8',
      'Section 21',
      'Ground 8',
      'Form 6A',
      'assured shorthold tenancy',
      'AST',
    ],
    wales_only_terminology: true,
  }), [selectedGrounds, arrearsSummary, facts.rent_amount, facts.rent_frequency]);

  return (
    <div className="pt-6 border-t border-gray-200 space-y-4">
      <div>
        <h4 className="text-base font-medium text-gray-900 mb-1">
          Part D - Particulars of Claim
        </h4>
        <p className="text-sm text-gray-600">
          Describe the grounds for possession. This will appear in your RHW23 notice form (Part D).
          Use Wales terminology only (Renting Homes (Wales) Act 2016).
        </p>
      </div>

      {/* Quick start - generate Part D from arrears data */}
      {arrearsSummary && arrearsSummary.total_arrears > 0 && !particularsText && (
        <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <p className="text-sm text-purple-800 mb-2">
            <strong>Quick start:</strong> Generate Part D text based on your arrears schedule and selected grounds.
          </p>
          <button
            type="button"
            onClick={handleGeneratePartD}
            className="px-3 py-1.5 text-sm font-medium text-purple-700 bg-white border border-purple-300 rounded-md hover:bg-purple-50"
          >
            Generate Part D from arrears schedule
          </button>
        </div>
      )}

      {/* Regenerate button if text already exists */}
      {particularsText && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleGeneratePartD}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Regenerate Part D
          </button>
        </div>
      )}

      {/* Part D textarea */}
      <div className="space-y-2">
        <label htmlFor="wales_part_d_particulars" className="block text-sm font-medium text-gray-700">
          Part D Particulars
          <span className="text-red-500 ml-1">*</span>
        </label>
        <textarea
          id="wales_part_d_particulars"
          rows={8}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
          value={particularsText}
          onChange={(e) => onUpdate({ wales_part_d_particulars: e.target.value })}
          placeholder="Describe the rent arrears: total amount owed, how the threshold is met (Section 157 requires 8+ weeks), reference to the arrears schedule..."
        />
        <p className="text-xs text-gray-500">
          Be specific and factual. Reference the arrears schedule attached to the notice.
          Selected grounds: {selectedGrounds.join(', ') || 'None selected'}
        </p>
      </div>

      {/* Ask Heaven Inline Enhancer */}
      <AskHeavenInlineEnhancer
        questionId="wales_part_d_particulars"
        questionText="Rewrite these Wales Renting Homes (Wales) Act 2016 particulars for court-readiness. Do NOT invent facts. Do NOT mention Housing Act 1988, Section 8, Section 21, Ground 8, Form 6A, or AST. Use only Wales terminology (Sections 157, 159, 160, 161). If information is missing, list it at the end as 'Missing information you should add:'"
        answer={particularsText}
        onApply={(newText) => onUpdate({ wales_part_d_particulars: newText })}
        context={enhanceContext}
        apiMode="generic"
      />

      {/* Guidance panel */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> Click &quot;Enhance with Ask Heaven&quot; above to improve the clarity
          and court-readiness of your particulars. The AI will refine your text without inventing
          facts, and will flag any missing information you should add.
        </p>
        <p className="text-xs text-blue-600 mt-1">
          Wales notices use the Renting Homes (Wales) Act 2016 only. England terminology will not appear.
        </p>
      </div>
    </div>
  );
};

export default WalesArrearsSection;
