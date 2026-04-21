'use client';

import React from 'react';
import { AskHeavenInlineEnhancer } from '@/components/wizard/AskHeavenInlineEnhancer';
import {
  getMoneyClaimChoiceCardClass,
  MONEY_CLAIM_HINT_CLASS,
  MONEY_CLAIM_INLINE_NOTE_CLASS,
  MONEY_CLAIM_LABEL_CLASS,
  MONEY_CLAIM_TEXTAREA_CLASS,
  MONEY_CLAIM_TINTED_CARD_CLASS,
  MONEY_CLAIM_INPUT_CLASS,
} from '@/components/wizard/money-claim/ui';

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
        <label className={MONEY_CLAIM_LABEL_CLASS}>
          Briefly describe what this claim is about
        </label>
        <textarea
          className={`${MONEY_CLAIM_TEXTAREA_CLASS} min-h-[160px]`}
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

        <p className={MONEY_CLAIM_HINT_CLASS}>
          Focus on the big picture: what the tenancy is, how the arrears arose,
          and what you are asking the court to do. Ask Heaven will turn this into
          a solicitor-style narrative later.
        </p>
      </div>

      {/* Interest Opt-In - Explicit Confirmation Required */}
      {isEnglandWales && (
        <div className={`${MONEY_CLAIM_TINTED_CARD_CLASS} space-y-4 border-[#d9ccff] bg-[#f8f4ff]`}>
          <div className="flex items-start gap-3">
            <div className="text-2xl">💷</div>
            <div>
              <h3 className="text-sm font-semibold text-[#27134a]">
                Do you want to claim statutory interest?
                <span className="text-red-500 ml-1">*</span>
              </h3>
              <p className={`${MONEY_CLAIM_HINT_CLASS} mt-1`}>
                Under Section 69 of the County Courts Act 1984, you can claim simple
                interest on debts at 8% per year from the date the money became due.
              </p>
            </div>
          </div>

          {/* Explicit Yes/No Radio Buttons */}
          <div className="space-y-2 ml-9">
            <label
              className={getMoneyClaimChoiceCardClass(chargeInterest === true)}
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
                <p className={`${MONEY_CLAIM_HINT_CLASS} mt-0.5`}>
                  Interest calculation will be included in your claim documents
                </p>
              </div>
            </label>

            <label
              className={getMoneyClaimChoiceCardClass(chargeInterest === false)}
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
                <p className={`${MONEY_CLAIM_HINT_CLASS} mt-0.5`}>
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
            <div className="ml-9 mt-3 rounded-2xl border border-[#ddd2ff] bg-white px-4 py-4 shadow-sm">
              <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Interest Details
              </h4>

              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <label className={MONEY_CLAIM_LABEL_CLASS}>
                    Interest start date
                  </label>
                  <input
                    type="date"
                    className={MONEY_CLAIM_INPUT_CLASS}
                    value={interestStartDate}
                    onChange={(e) =>
                      updateMoneyClaim('interest_start_date', e.target.value)
                    }
                  />
                  <p className={MONEY_CLAIM_HINT_CLASS}>
                    Usually the date of the first missed rent payment
                  </p>
                </div>

                <div className="space-y-1">
                  <label className={MONEY_CLAIM_LABEL_CLASS}>
                    Interest rate (% per year)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={20}
                    step="0.1"
                    className={MONEY_CLAIM_INPUT_CLASS}
                    value={interestRate}
                    onChange={(e) =>
                      updateMoneyClaim(
                        'interest_rate',
                        e.target.value ? Number(e.target.value) : 8
                      )
                    }
                    placeholder="8"
                  />
                  <p className={MONEY_CLAIM_HINT_CLASS}>
                    Statutory rate is 8% (recommended)
                  </p>
                </div>
              </div>

              <div className={`${MONEY_CLAIM_INLINE_NOTE_CLASS} mt-3 text-purple-900`}>
                <strong>How it works:</strong> Interest is calculated as simple interest
                from the start date to the date of claim. The daily rate will be shown
                on your claim form so you can continue to accrue interest until judgment.
              </div>
            </div>
          )}
        </div>
      )}

      {/* Deposit Deductions Question */}
      <div className={`${MONEY_CLAIM_TINTED_CARD_CLASS} space-y-3 border-amber-200 bg-amber-50`}>
        <div className="flex items-start gap-3">
          <div className="text-xl">💰</div>
          <div>
            <h3 className="text-sm font-semibold text-[#27134a]">
              Have you already made deposit deductions for any of these amounts?
            </h3>
            <p className={`${MONEY_CLAIM_HINT_CLASS} mt-1`}>
              If you&apos;ve deducted amounts from the tenant&apos;s deposit (e.g., for cleaning
              or damage), you can only claim the difference through the court. This avoids
              &quot;double recovery&quot; which courts will penalise.
            </p>
          </div>
        </div>

        <div className="space-y-2 ml-9">
          <label
              className={getMoneyClaimChoiceCardClass(moneyClaim.deposit_deductions_confirmed === true, 'amber')}
            >
            <input
              type="radio"
              name="deposit_deductions"
              checked={moneyClaim.deposit_deductions_confirmed === true}
              onChange={() => updateMoneyClaim('deposit_deductions_confirmed', true)}
              className="mr-3"
            />
            <div>
              <span className="font-medium text-gray-900">
                Yes, I&apos;ve made deposit deductions
              </span>
                <p className={`${MONEY_CLAIM_HINT_CLASS} mt-0.5`}>
                  The amounts I&apos;m claiming are only for costs NOT covered by the deposit
                </p>
              </div>
          </label>

          <label
              className={getMoneyClaimChoiceCardClass(moneyClaim.deposit_deductions_confirmed === false, 'amber')}
            >
            <input
              type="radio"
              name="deposit_deductions"
              checked={moneyClaim.deposit_deductions_confirmed === false}
              onChange={() => updateMoneyClaim('deposit_deductions_confirmed', false)}
              className="mr-3"
            />
            <div>
              <span className="font-medium text-gray-900">
                No deposit deductions have been made
              </span>
                <p className={`${MONEY_CLAIM_HINT_CLASS} mt-0.5`}>
                  I&apos;m claiming the full amounts (or there was no deposit)
                </p>
              </div>
          </label>
        </div>
      </div>

      {/* Other amounts and narrative */}
      <div className="space-y-2">
        <label className={MONEY_CLAIM_LABEL_CLASS}>
          Anything else you&apos;re claiming (damages, costs, other sums)
        </label>
        <textarea
          className={`${MONEY_CLAIM_TEXTAREA_CLASS} min-h-[140px]`}
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

        <p className={MONEY_CLAIM_HINT_CLASS}>
          You&apos;ll break down the exact figures in the arrears and damages
          sections. This text gives Ask Heaven context for the Particulars of
          Claim and Schedule of Loss.
        </p>
      </div>
    </div>
  );
};
