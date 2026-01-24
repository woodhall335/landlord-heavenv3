// src/components/wizard/sections/money-claim/ClaimDetailsSection.tsx

'use client';

import React, { useMemo, useEffect, useRef } from 'react';
import { CourtFinderLink } from '@/components/wizard/shared/CourtFinderLink';
import { AskHeavenInlineEnhancer } from '@/components/wizard/AskHeavenInlineEnhancer';

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
  const moneyClaim = facts.money_claim || {};
  const hasInitializedRef = useRef(false);

  // Derive currently selected reasons from facts
  const selectedReasons = useMemo(() => getSelectedReasonsFromFacts(facts), [facts]);

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

    // Apply initial selections
    hasInitializedRef.current = true;

    const newReasons = new Set<ClaimReasonType>(initialClaimReasons);
    applyClaimReasons(newReasons);
  }, [initialClaimReasons]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Updates all claim-related facts based on selected reasons.
   */
  const applyClaimReasons = (reasons: Set<ClaimReasonType>) => {
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
  };

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

  const updateMoneyClaim = (field: string, value: any) => {
    onUpdate({
      money_claim: {
        ...moneyClaim,
        [field]: value,
      },
    });
  };

  const basisOfClaim = moneyClaim.basis_of_claim || '';
  const tenantStillInProperty =
    typeof moneyClaim.tenant_still_in_property === 'boolean'
      ? moneyClaim.tenant_still_in_property
      : null;

  // Build context for Ask Heaven enhancement
  const enhanceContext = useMemo(() => ({
    jurisdiction,
    product: 'money_claim',
    selected_claim_reasons: Array.from(selectedReasons),
  }), [jurisdiction, selectedReasons]);

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-600">
        This section gives the court a clear overview of what your money claim is about
        and why the tenant owes you money. We&apos;ll use this to draft the legal
        summary and particulars of claim for{' '}
        {jurisdiction === 'scotland' ? 'Scotland' : jurisdiction === 'wales' ? 'Wales' : 'England'}.
      </p>

      {/* Court Finder Link - Jurisdiction-specific */}
      <CourtFinderLink jurisdiction={jurisdiction} context="money_claim" />

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

      {/* Info about Arrears section - shown when rent arrears is selected */}
      {selectedReasons.has('rent_arrears') && (
        <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
          <p className="text-sm text-purple-800">
            <strong>Next:</strong> You&apos;ll complete a detailed rent arrears schedule in the{' '}
            <strong>Arrears</strong> section, showing each period with rent due and amounts paid.
          </p>
        </div>
      )}

      {/* Info about Damages section - shown when any non-rent reason is selected */}
      {(selectedReasons.has('property_damage') ||
        selectedReasons.has('cleaning') ||
        selectedReasons.has('unpaid_utilities') ||
        selectedReasons.has('unpaid_council_tax') ||
        selectedReasons.has('other_tenant_debt')) && (
        <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
          <p className="text-sm text-purple-800">
            <strong>Next:</strong> You&apos;ll itemise these costs in the{' '}
            <strong>Damages</strong> section with specific amounts and descriptions.
            The court needs a structured schedule showing each item you are claiming.
          </p>
        </div>
      )}

      {/* Basis of claim (core field used elsewhere) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <label className="text-sm font-medium text-charcoal">
            Briefly explain what this claim is about
          </label>
          <span className="text-xs text-gray-500">
            This wording is used in the particulars of claim.
          </span>
        </div>
        <textarea
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm min-h-[120px] focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
          value={basisOfClaim}
          onChange={(e) => updateMoneyClaim('basis_of_claim', e.target.value)}
          placeholder="For example: The defendant is my former tenant at [property address]. They have failed to pay rent since [month/year] and left the property owing £[amount] in rent and causing damage to the carpets and doors…"
        />

        {/* Ask Heaven Inline Enhancer */}
        <AskHeavenInlineEnhancer
          questionId="basis_of_claim"
          questionText="Basis of claim for money claim"
          answer={basisOfClaim}
          onApply={(newText) => updateMoneyClaim('basis_of_claim', newText)}
          context={enhanceContext}
          apiMode="generic"
        />

        <p className="text-xs text-gray-500">
          You can keep this in plain English. Later we&apos;ll help you turn this into
          a court-ready legal summary.
        </p>
      </div>

      {/* Occupancy status */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-charcoal">
          Is the tenant still living in the property?
        </label>
        <p className="text-xs text-gray-500">
          This affects how we describe the claim and how we explain your losses.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => updateMoneyClaim('tenant_still_in_property', true)}
            className={`rounded-md border px-3 py-1.5 text-sm ${
              tenantStillInProperty === true
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-gray-300 text-gray-700'
            }`}
          >
            Yes, they are still living there
          </button>
          <button
            type="button"
            onClick={() => updateMoneyClaim('tenant_still_in_property', false)}
            className={`rounded-md border px-3 py-1.5 text-sm ${
              tenantStillInProperty === false
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-gray-300 text-gray-700'
            }`}
          >
            No, they have left the property
          </button>
        </div>
      </div>

      {/* Interest Opt-In - Explicit Confirmation Required (England/Wales only) */}
      {(jurisdiction === 'england' || jurisdiction === 'wales') && (
        <div className="space-y-4 rounded-lg border-2 border-purple-200 bg-purple-50 p-4">
          <div className="flex items-start gap-3">
            <div className="text-2xl">💷</div>
            <div>
              <h3 className="text-sm font-semibold text-charcoal">
                Do you want to claim statutory interest?
                <span className="text-red-500 ml-1">*</span>
              </h3>
              <p className="text-xs text-gray-600 mt-1">
                Under Section 69 of the County Courts Act 1984, you can claim simple
                interest on debts at 8% per year from the date the money became due.
              </p>
            </div>
          </div>

          {/* Explicit Yes/No Radio Buttons */}
          <div className="space-y-2 ml-9">
            <label
              className={`
                flex items-center p-3 border rounded-lg cursor-pointer transition-all
                ${moneyClaim.charge_interest === true
                  ? 'border-purple-500 bg-white ring-2 ring-purple-200'
                  : 'border-gray-200 bg-white hover:border-gray-300'}
              `}
            >
              <input
                type="radio"
                name="charge_interest"
                checked={moneyClaim.charge_interest === true}
                onChange={() => {
                  onUpdate({
                    money_claim: {
                      ...moneyClaim,
                      charge_interest: true,
                      interest_rate: moneyClaim.interest_rate || 8,
                    },
                  });
                }}
                className="mr-3"
              />
              <div>
                <span className="font-medium text-gray-900">
                  Yes, claim statutory interest at 8%
                </span>
                <p className="text-xs text-gray-500 mt-0.5">
                  Interest calculation will be included in your claim documents
                </p>
              </div>
            </label>

            <label
              className={`
                flex items-center p-3 border rounded-lg cursor-pointer transition-all
                ${moneyClaim.charge_interest === false
                  ? 'border-purple-500 bg-white ring-2 ring-purple-200'
                  : 'border-gray-200 bg-white hover:border-gray-300'}
              `}
            >
              <input
                type="radio"
                name="charge_interest"
                checked={moneyClaim.charge_interest === false}
                onChange={() => updateMoneyClaim('charge_interest', false)}
                className="mr-3"
              />
              <div>
                <span className="font-medium text-gray-900">
                  No, I don&apos;t want to claim interest
                </span>
                <p className="text-xs text-gray-500 mt-0.5">
                  Your claim will be for the principal debt amount only
                </p>
              </div>
            </label>

            {(moneyClaim.charge_interest === null || moneyClaim.charge_interest === undefined) && (
              <p className="text-xs text-amber-600 italic">
                Please select an option to continue
              </p>
            )}
          </div>

          {/* Interest Details - Only shown when opted in */}
          {moneyClaim.charge_interest === true && (
            <div className="ml-9 mt-3 p-3 bg-white border border-purple-100 rounded-lg space-y-3">
              <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Interest Details
              </h4>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-charcoal">
                    Interest start date
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    value={moneyClaim.interest_start_date || ''}
                    onChange={(e) =>
                      updateMoneyClaim('interest_start_date', e.target.value)
                    }
                  />
                  <p className="text-[11px] text-gray-500">
                    Usually the date of the first missed rent payment
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-charcoal">
                    Interest rate (% per year)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={20}
                    step="0.1"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    value={moneyClaim.interest_rate ?? ''}
                    onChange={(e) =>
                      updateMoneyClaim(
                        'interest_rate',
                        e.target.value ? Number(e.target.value) : 8
                      )
                    }
                    placeholder="8"
                  />
                  <p className="text-[11px] text-gray-500">
                    Statutory rate is 8% (recommended)
                  </p>
                </div>
              </div>

              <div className="p-2 bg-purple-50 rounded text-xs text-purple-800">
                <strong>How it works:</strong> Interest is calculated as simple interest
                from the start date to the date of claim. The daily rate will be shown
                on your claim form so you can continue to accrue interest until judgment.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
