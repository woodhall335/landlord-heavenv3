'use client';

import React from 'react';
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
        ...(facts.money_claim || {}),
        [field]: value,
      },
    });
  };

  const basisOfClaim = moneyClaim.basis_of_claim || '';
  const otherAmountsSummary = moneyClaim.other_amounts_summary || '';
  const chargeInterest = moneyClaim.charge_interest ?? null;
  const interestStartDate = moneyClaim.interest_start_date || '';
  const interestRate =
    moneyClaim.interest_rate !== undefined && moneyClaim.interest_rate !== null
      ? String(moneyClaim.interest_rate)
      : '';

  const isEnglandWales = (jurisdiction === 'england' || jurisdiction === 'wales');

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-600">
        This section captures the high-level story of your claim. Ask Heaven will
        use this, together with your arrears and tenancy details, to draft the
        Letter Before Action and Particulars of Claim.
      </p>

      {/* Core claim narrative */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-charcoal">
          Briefly describe what this claim is about
        </label>
        <textarea
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm min-h-[140px] focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
          value={basisOfClaim}
          onChange={(e) => updateMoneyClaim('basis_of_claim', e.target.value)}
          placeholder="For example: This claim is for rent arrears and related charges under an assured shorthold tenancy of 10 High Street, Manchester..."
        />

        {/* Ask Heaven Inline Enhancer */}
        <AskHeavenInlineEnhancer
          questionId="basis_of_claim"
          questionText="Basis of claim for money claim"
          answer={basisOfClaim}
          onApply={(newText) => updateMoneyClaim('basis_of_claim', newText)}
          context={{ jurisdiction, product: 'money_claim' }}
          apiMode="generic"
        />

        <p className="text-xs text-gray-500">
          Focus on the big picture: what the tenancy is, how the arrears arose,
          and what you are asking the court to do. Ask Heaven will turn this into
          a solicitor-style narrative later.
        </p>
      </div>

      {/* Interest Opt-In - Explicit Confirmation Required */}
      {isEnglandWales && (
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
                ${chargeInterest === true
                  ? 'border-purple-500 bg-white ring-2 ring-purple-200'
                  : 'border-gray-200 bg-white hover:border-gray-300'}
              `}
            >
              <input
                type="radio"
                name="charge_interest"
                checked={chargeInterest === true}
                onChange={() => {
                  updateMoneyClaim('charge_interest', true);
                  // Set default 8% rate if not already set
                  if (!moneyClaim.interest_rate) {
                    updateMoneyClaim('interest_rate', 8);
                  }
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
                ${chargeInterest === false
                  ? 'border-purple-500 bg-white ring-2 ring-purple-200'
                  : 'border-gray-200 bg-white hover:border-gray-300'}
              `}
            >
              <input
                type="radio"
                name="charge_interest"
                checked={chargeInterest === false}
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

            {chargeInterest === null && (
              <p className="text-xs text-amber-600 italic">
                Please select an option to continue
              </p>
            )}
          </div>

          {/* Interest Details - Only shown when opted in */}
          {chargeInterest === true && (
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
                    value={interestStartDate}
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
                    value={interestRate}
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

      {/* Other amounts and narrative */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-charcoal">
          Anything else you&apos;re claiming (damages, costs, other sums)
        </label>
        <textarea
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm min-h-[120px] focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
          value={otherAmountsSummary}
          onChange={(e) =>
            updateMoneyClaim('other_amounts_summary', e.target.value)
          }
          placeholder="For example: £450 to replace damaged flooring, £120 cleaning, £80 unpaid water bill..."
        />

        {/* Ask Heaven Inline Enhancer */}
        <AskHeavenInlineEnhancer
          questionId="other_amounts_summary"
          questionText="Additional amounts claimed (damages, costs, other sums)"
          answer={otherAmountsSummary}
          onApply={(newText) => updateMoneyClaim('other_amounts_summary', newText)}
          context={{ jurisdiction, product: 'money_claim' }}
          apiMode="generic"
        />

        <p className="text-xs text-gray-500">
          You&apos;ll break down the exact figures in the arrears and damages
          sections. This text gives Ask Heaven context for the Particulars of
          Claim and Schedule of Loss.
        </p>
      </div>
    </div>
  );
};
