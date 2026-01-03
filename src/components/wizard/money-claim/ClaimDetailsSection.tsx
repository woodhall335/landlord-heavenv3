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

      {/* Interest (statutory) */}
      {isEnglandWales && (
        <div className="space-y-3 rounded-md border border-gray-200 bg-gray-50 p-3">
          <h3 className="text-sm font-medium text-charcoal">
            Statutory interest (section 69 County Courts Act 1984)
          </h3>
          <p className="text-xs text-gray-600">
            Most money claims include simple interest at 8% per year on the
            outstanding balance. If you&apos;re unsure, you can select yes and Ask
            Heaven will draft the interest wording for you.
          </p>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-charcoal">
                Add statutory interest?
              </label>
              <select
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                value={
                  chargeInterest === true
                    ? 'yes'
                    : chargeInterest === false
                    ? 'no'
                    : ''
                }
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === 'yes') {
                    updateMoneyClaim('charge_interest', true);
                  } else if (v === 'no') {
                    updateMoneyClaim('charge_interest', false);
                  } else {
                    updateMoneyClaim('charge_interest', null);
                  }
                }}
              >
                <option value="">Select</option>
                <option value="yes">Yes, add statutory interest</option>
                <option value="no">No, I don&apos;t want to claim interest</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-charcoal">
                Interest start date
              </label>
              <input
                type="date"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                value={interestStartDate}
                onChange={(e) =>
                  updateMoneyClaim('interest_start_date', e.target.value)
                }
                disabled={chargeInterest !== true}
              />
              <p className="text-[11px] text-gray-500">
                Usually the date of the first missed rent instalment.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-charcoal">
                Interest rate (% per year)
              </label>
              <input
                type="number"
                min={0}
                step="0.1"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                value={interestRate}
                onChange={(e) =>
                  updateMoneyClaim(
                    'interest_rate',
                    e.target.value ? Number(e.target.value) : null
                  )
                }
                disabled={chargeInterest !== true}
              />
              <p className="text-[11px] text-gray-500">
                Default statutory rate is 8% simple interest.
              </p>
            </div>
          </div>
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
