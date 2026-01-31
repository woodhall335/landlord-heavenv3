// src/components/wizard/sections/money-claim/ClaimDetailsSection.tsx
// Simplified version - only captures court name and claim reasons
// Basis of claim, occupancy status, and interest moved to ClaimStatementSection

'use client';

import React, { useMemo, useEffect, useRef, useCallback } from 'react';
import { RiInformationLine, RiArrowRightLine } from 'react-icons/ri';
import { CourtFinderLink } from '@/components/wizard/shared/CourtFinderLink';
import { trackMoneyClaimReasonsSelected } from '@/lib/analytics';

type Jurisdiction = 'england' | 'wales' | 'scotland';

/**
 * Claim reason types for the checkbox selector.
 * Maps to facts structure for the money claim wizard.
 */
export type ClaimReasonType =
  | 'rent_arrears'
  | 'property_damage'
  | 'cleaning'
  | 'unpaid_utilities'
  | 'unpaid_council_tax'
  | 'other_tenant_debt';

interface SectionProps {
  facts: any;
  jurisdiction: Jurisdiction;
  onUpdate: (updates: Record<string, any>) => void | Promise<void>;
  /**
   * Optional: Pre-select claim reasons on mount (e.g. from topic=arrears URL param)
   * Only applied once on mount if no claim reasons are already selected.
   */
  initialClaimReasons?: ClaimReasonType[];
}

// Claim reason checkbox options
const CLAIM_REASONS: { value: ClaimReasonType; label: string; description?: string }[] = [
  { value: 'rent_arrears', label: 'Rent arrears', description: 'Unpaid rent during or after the tenancy' },
  { value: 'property_damage', label: 'Property damage', description: 'Repairs or replacements needed due to tenant damage' },
  { value: 'cleaning', label: 'Cleaning / rubbish removal', description: 'Professional cleaning or waste removal costs' },
  { value: 'unpaid_utilities', label: 'Unpaid utilities', description: 'Utilities in your name left unpaid by tenant' },
  { value: 'unpaid_council_tax', label: 'Unpaid council tax', description: 'Council tax in your name unpaid by tenant' },
  { value: 'other_tenant_debt', label: 'Other tenant debt', description: 'Any other money owed by the tenant' },
];

/**
 * Derives selected claim reasons from the current facts state.
 * Used to populate checkboxes from existing data.
 */
function getSelectedReasonsFromFacts(facts: any): Set<ClaimReasonType> {
  const selected = new Set<ClaimReasonType>();

  // Check rent arrears flag
  if (facts.claiming_rent_arrears === true) {
    selected.add('rent_arrears');
  }

  // Check other_amounts_types array for specific categories
  const otherTypes: string[] = Array.isArray(facts.money_claim?.other_amounts_types)
    ? facts.money_claim.other_amounts_types
    : [];

  if (otherTypes.includes('property_damage')) selected.add('property_damage');
  if (otherTypes.includes('cleaning')) selected.add('cleaning');
  if (otherTypes.includes('unpaid_utilities')) selected.add('unpaid_utilities');
  if (otherTypes.includes('unpaid_council_tax')) selected.add('unpaid_council_tax');

  // Check claiming_other flag for "other tenant debt"
  if (facts.claiming_other === true) {
    selected.add('other_tenant_debt');
  }

  // Also check for other_charges in other_amounts_types (legacy mapping)
  if (otherTypes.includes('other_charges') || otherTypes.includes('legal_costs')) {
    selected.add('other_tenant_debt');
  }

  return selected;
}

/**
 * Derives the primary_issue value from selected claim reasons.
 * Maintains backwards compatibility with existing flows.
 */
function derivePrimaryIssue(selectedReasons: Set<ClaimReasonType>): string {
  const hasRentArrears = selectedReasons.has('rent_arrears');
  const hasNonRent = selectedReasons.has('property_damage') ||
    selectedReasons.has('cleaning') ||
    selectedReasons.has('unpaid_utilities') ||
    selectedReasons.has('unpaid_council_tax') ||
    selectedReasons.has('other_tenant_debt');

  if (hasRentArrears && hasNonRent) return 'unpaid_rent_and_damage';
  if (hasRentArrears && !hasNonRent) return 'unpaid_rent_only';
  if (!hasRentArrears && hasNonRent) return 'damage_only';
  return '';
}

export const ClaimDetailsSection: React.FC<SectionProps> = ({
  facts,
  jurisdiction,
  onUpdate,
  initialClaimReasons,
}) => {
  const moneyClaim = useMemo(() => facts.money_claim || {}, [facts.money_claim]);
  const hasInitializedRef = useRef(false);

  // Derive currently selected reasons from facts
  const selectedReasons = useMemo(() => getSelectedReasonsFromFacts(facts), [facts]);

  /**
   * Updates all claim-related facts based on selected reasons.
   * Defined before useEffect to avoid hoisting issues.
   */
  const applyClaimReasons = useCallback((reasons: Set<ClaimReasonType>, trackEvent: boolean = true) => {
    const hasRentArrears = reasons.has('rent_arrears');
    const hasPropertyDamage = reasons.has('property_damage');
    const hasCleaning = reasons.has('cleaning');
    const hasUnpaidUtilities = reasons.has('unpaid_utilities');
    const hasUnpaidCouncilTax = reasons.has('unpaid_council_tax');
    const hasOtherDebt = reasons.has('other_tenant_debt');

    // Build other_amounts_types array (for DamagesSection categories)
    const otherAmountsTypes: string[] = [];
    if (hasPropertyDamage) otherAmountsTypes.push('property_damage');
    if (hasCleaning) otherAmountsTypes.push('cleaning');
    if (hasUnpaidUtilities) otherAmountsTypes.push('unpaid_utilities');
    if (hasUnpaidCouncilTax) otherAmountsTypes.push('unpaid_council_tax');
    if (hasOtherDebt) otherAmountsTypes.push('other_charges');

    // Determine claiming flags
    const claiming_rent_arrears = hasRentArrears;
    const claiming_damages = hasPropertyDamage || hasCleaning || hasUnpaidUtilities || hasUnpaidCouncilTax;
    const claiming_other = hasOtherDebt;

    // Derive primary_issue for backwards compatibility
    const primary_issue = derivePrimaryIssue(reasons);

    // Track analytics event when user changes selections
    if (trackEvent && reasons.size > 0) {
      trackMoneyClaimReasonsSelected({
        reasons: Array.from(reasons),
        jurisdiction,
        source: 'wizard',
      });
    }

    onUpdate({
      claiming_rent_arrears,
      claiming_damages,
      claiming_other,
      money_claim: {
        ...moneyClaim,
        primary_issue: primary_issue || null,
        other_amounts_types: otherAmountsTypes,
      },
    });
  }, [jurisdiction, moneyClaim, onUpdate]);

  // Apply initial claim reasons on mount (only once, and only if no reasons already selected)
  useEffect(() => {
    if (hasInitializedRef.current) return;
    if (!initialClaimReasons || initialClaimReasons.length === 0) return;

    // Only apply if no claim reasons are currently selected
    const currentReasons = getSelectedReasonsFromFacts(facts);
    if (currentReasons.size > 0) {
      hasInitializedRef.current = true;
      return;
    }

    // Apply initial selections (don't track - this is URL param initialization)
    hasInitializedRef.current = true;

    const newReasons = new Set<ClaimReasonType>(initialClaimReasons);
    applyClaimReasons(newReasons, false);
  }, [initialClaimReasons, applyClaimReasons, facts]);

  /**
   * Toggle a claim reason checkbox.
   */
  const toggleClaimReason = (reason: ClaimReasonType) => {
    const newReasons = new Set(selectedReasons);
    if (newReasons.has(reason)) {
      newReasons.delete(reason);
    } else {
      newReasons.add(reason);
    }
    applyClaimReasons(newReasons);
  };

  // Determine which conditional sections will be revealed
  const willShowArrears = selectedReasons.has('rent_arrears');
  const willShowDamages =
    selectedReasons.has('property_damage') ||
    selectedReasons.has('cleaning') ||
    selectedReasons.has('unpaid_utilities') ||
    selectedReasons.has('unpaid_council_tax') ||
    selectedReasons.has('other_tenant_debt');

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-600">
        This section gives the court a clear overview of what your money claim is about
        and why the tenant owes you money. We&apos;ll use this to draft the legal
        summary and particulars of claim for England.
      </p>

      {/* Court Finder Link */}
      <CourtFinderLink jurisdiction="england" context="money_claim" />

      {/* Court Name Input - required for N1 form */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-charcoal">
          County Court name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          className={`w-full rounded-md border px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] ${
            !moneyClaim.court_name && !facts.court_name
              ? 'border-amber-300 bg-amber-50'
              : 'border-gray-300'
          }`}
          value={moneyClaim.court_name || facts.court_name || ''}
          onChange={(e) => {
            // Store in both money_claim.court_name and top-level court_name
            onUpdate({
              court_name: e.target.value,
              money_claim: {
                ...moneyClaim,
                court_name: e.target.value,
              },
            });
          }}
          placeholder="e.g. Manchester County Court"
        />
        <p className="text-xs text-gray-500">
          Enter the County Court you found using the HMCTS Court Finder above.
          This will appear on your N1 claim form.
        </p>
        {!moneyClaim.court_name && !facts.court_name && (
          <p className="text-xs text-amber-600 flex items-center gap-1">
            <RiInformationLine className="w-3.5 h-3.5" />
            Please enter the court name to continue
          </p>
        )}
      </div>

      {/* MAIN CHANGE: Checkbox-based claim reasons selector */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-charcoal">
          What are you claiming for?
          <span className="text-red-500 ml-1">*</span>
        </label>
        <p className="text-xs text-gray-500">
          Select all that apply. We&apos;ll guide you through the relevant sections based on your selection.
        </p>

        <div className="grid gap-2">
          {CLAIM_REASONS.map((reason) => {
            const isSelected = selectedReasons.has(reason.value);
            return (
              <label
                key={reason.value}
                className={`
                  flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-all
                  ${isSelected
                    ? 'border-[#7C3AED] bg-purple-50 ring-1 ring-[#7C3AED]'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'}
                `}
              >
                <input
                  type="checkbox"
                  className="mt-0.5 h-5 w-5 rounded border-gray-300 text-[#7C3AED] focus:ring-[#7C3AED]"
                  checked={isSelected}
                  onChange={() => toggleClaimReason(reason.value)}
                />
                <div className="flex-1">
                  <span className="font-medium text-gray-900">{reason.label}</span>
                  {reason.description && (
                    <p className="text-xs text-gray-500 mt-0.5">{reason.description}</p>
                  )}
                </div>
              </label>
            );
          })}
        </div>

        {selectedReasons.size === 0 && (
          <p className="text-xs text-amber-600 italic">
            Please select at least one reason for your claim
          </p>
        )}
      </div>

      {/* UX Guardrail: Unpaid council tax note */}
      {selectedReasons.has('unpaid_council_tax') && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <span className="text-lg">⚠️</span>
            <div>
              <p className="text-sm font-medium text-amber-800">Council Tax Claims</p>
              <p className="text-xs text-amber-700 mt-1">
                Only claim council tax if your tenancy agreement makes the tenant liable and you have
                evidence (e.g. a clause in the agreement and council tax bills in your name showing
                arrears during the tenant&apos;s occupation).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* UX Guardrail: Other tenant debt note */}
      {selectedReasons.has('other_tenant_debt') && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-start gap-3">
            <span className="text-lg">📝</span>
            <div>
              <p className="text-sm font-medium text-blue-800">Other Tenant Debt</p>
              <p className="text-xs text-blue-700 mt-1">
                You&apos;ll need to itemise each amount with a description and provide supporting
                evidence. The court requires a clear breakdown of what is owed and why.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Next Steps Guidance - shown when claim reasons are selected */}
      {selectedReasons.size > 0 && (
        <div className="rounded-lg border-2 border-purple-200 bg-purple-50 p-4">
          <div className="flex items-start gap-3">
            <RiArrowRightLine className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <p className="text-sm font-medium text-purple-900">
                Next: Complete the fact-gathering sections
              </p>
              <p className="text-sm text-purple-700">
                {willShowArrears && willShowDamages && (
                  <>
                    Based on your selections, you&apos;ll complete the{' '}
                    <strong>Arrears</strong> and <strong>Damages</strong> sections next
                    to provide detailed schedules.
                  </>
                )}
                {willShowArrears && !willShowDamages && (
                  <>
                    You&apos;ll complete the <strong>Arrears</strong> section next
                    to provide a detailed rent arrears schedule.
                  </>
                )}
                {!willShowArrears && willShowDamages && (
                  <>
                    You&apos;ll complete the <strong>Damages</strong> section next
                    to itemise your costs with amounts and descriptions.
                  </>
                )}
              </p>
              <p className="text-xs text-purple-600">
                Once we gather the facts, we can compile your claim statement and other details.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
