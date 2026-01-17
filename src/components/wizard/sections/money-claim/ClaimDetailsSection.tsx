// src/components/wizard/sections/money-claim/ClaimDetailsSection.tsx

'use client';

import React, { useMemo } from 'react';
import { CourtFinderLink } from '@/components/wizard/shared/CourtFinderLink';
import { AskHeavenInlineEnhancer } from '@/components/wizard/AskHeavenInlineEnhancer';

type Jurisdiction = 'england' | 'wales' | 'scotland';

interface SectionProps {
  facts: any;
  jurisdiction: Jurisdiction;
  onUpdate: (updates: Record<string, any>) => void | Promise<void>;
}

export const ClaimDetailsSection: React.FC<SectionProps> = ({
  facts,
  jurisdiction,
  onUpdate,
}) => {
  const moneyClaim = facts.money_claim || {};

  const updateMoneyClaim = (field: string, value: any) => {
    onUpdate({
      money_claim: {
        ...moneyClaim,
        [field]: value,
      },
    });
  };

  // Derive claiming flags from primary_issue and update them in facts root
  const updatePrimaryIssue = (value: string) => {
    // Set claiming_rent_arrears, claiming_damages, claiming_other based on primary_issue
    const claiming_rent_arrears = value === 'unpaid_rent_only' || value === 'unpaid_rent_and_damage';
    const claiming_damages = value === 'unpaid_rent_and_damage' || value === 'damage_only';
    const claiming_other = value === 'other_debt';

    // Update both money_claim.primary_issue AND root-level claiming flags
    onUpdate({
      claiming_rent_arrears,
      claiming_damages,
      claiming_other,
      money_claim: {
        ...moneyClaim,
        primary_issue: value || null,
      },
    });
  };

  // Toggle damage type and update claiming_damages flag
  const toggleOtherAmountTypeWithFlag = (value: string) => {
    const set = new Set(otherAmountsTypes);
    if (set.has(value)) {
      set.delete(value);
    } else {
      set.add(value);
    }
    const newTypes = Array.from(set);

    // If any damage-related checkbox is checked, set claiming_damages = true
    const hasDamageTypes = newTypes.length > 0;

    onUpdate({
      claiming_damages: hasDamageTypes || primaryIssue === 'unpaid_rent_and_damage' || primaryIssue === 'damage_only',
      money_claim: {
        ...moneyClaim,
        other_amounts_types: newTypes,
      },
    });
  };

  const primaryIssue = moneyClaim.primary_issue || '';
  const basisOfClaim = moneyClaim.basis_of_claim || '';
  const tenantStillInProperty =
    typeof moneyClaim.tenant_still_in_property === 'boolean'
      ? moneyClaim.tenant_still_in_property
      : null;
  const otherAmountsTypes: string[] = Array.isArray(moneyClaim.other_amounts_types)
    ? moneyClaim.other_amounts_types
    : [];

  // Build context for Ask Heaven enhancement
  const enhanceContext = useMemo(() => ({
    jurisdiction,
    product: 'money_claim',
    primary_issue: primaryIssue,
  }), [jurisdiction, primaryIssue]);

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

      {/* Primary issue */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-charcoal">
          What is this claim mainly about?
        </label>
        <p className="text-xs text-gray-500">
          This helps us frame your claim correctly on the court forms and in the
          particulars of claim.
        </p>
        <select
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          value={primaryIssue}
          onChange={(e) => updatePrimaryIssue(e.target.value)}
        >
          <option value="">Select one option</option>
          <option value="unpaid_rent_only">Unpaid rent only</option>
          <option value="unpaid_rent_and_damage">
            Unpaid rent and damage / other costs
          </option>
          <option value="damage_only">Damage / other costs only (no rent arrears)</option>
          <option value="other_debt">Other debt owed by the tenant</option>
        </select>
      </div>

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

      {/* Other amounts claimed */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-charcoal">
          Are you also claiming for any of the following?
        </label>
        <p className="text-xs text-gray-500">
          Tick all that apply. We&apos;ll use this to build a detailed schedule of
          damages and costs.
        </p>

        <div className="grid gap-2 md:grid-cols-2">
          {[
            { value: 'property_damage', label: 'Property damage (repairs / replacements)' },
            { value: 'cleaning', label: 'Cleaning or rubbish removal' },
            { value: 'unpaid_utilities', label: 'Unpaid utilities in your name' },
            { value: 'unpaid_council_tax', label: 'Unpaid council tax in your name' },
            { value: 'legal_costs', label: 'Legal or tracing costs' },
            { value: 'other_charges', label: 'Other charges or losses' },
          ].map((item) => (
            <label
              key={item.value}
              className="flex cursor-pointer items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
            >
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300"
                checked={otherAmountsTypes.includes(item.value)}
                onChange={() => toggleOtherAmountTypeWithFlag(item.value)}
              />
              <span className="text-gray-800">{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Info about Damages section */}
      {otherAmountsTypes.length > 0 && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm text-blue-800">
            <strong>Next step:</strong> You&apos;ll itemise these costs in the{' '}
            <strong>Damages</strong> section with specific amounts and descriptions.
            The court needs a structured schedule showing each item you are claiming.
          </p>
        </div>
      )}

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
