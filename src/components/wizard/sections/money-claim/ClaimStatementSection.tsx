// src/components/wizard/sections/money-claim/ClaimStatementSection.tsx
// New section that appears after Arrears/Damages fact-gathering
// Contains: basis_of_claim, tenant_still_in_property, charge_interest, interest_start_date

'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { RiMagicLine, RiRefreshLine, RiInformationLine } from 'react-icons/ri';
import { AskHeavenInlineEnhancer } from '@/components/wizard/AskHeavenInlineEnhancer';
import {
  generateBasisOfClaimStatement,
  getMissingStatementInfo,
  generateClaimSummary,
  getClaimReasonsFromFacts,
} from '@/lib/money-claim/statement-generator';

type Jurisdiction = 'england' | 'wales' | 'scotland';

interface SectionProps {
  facts: any;
  jurisdiction: Jurisdiction;
  onUpdate: (updates: Record<string, any>) => void | Promise<void>;
  /**
   * Optional: Callback to set the current question ID for Ask Heaven context.
   */
  onSetCurrentQuestionId?: (questionId: string | undefined) => void;
}

export const ClaimStatementSection: React.FC<SectionProps> = ({
  facts,
  jurisdiction,
  onUpdate,
  onSetCurrentQuestionId,
}) => {
  const moneyClaim = useMemo(() => facts.money_claim || {}, [facts.money_claim]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showMissingInfo, setShowMissingInfo] = useState(false);

  // Derive selected claim reasons from facts
  const selectedReasons = useMemo(() => getClaimReasonsFromFacts(facts), [facts]);

  const updateMoneyClaim = useCallback((field: string, value: any) => {
    onUpdate({
      money_claim: {
        ...moneyClaim,
        [field]: value,
      },
    });
  }, [moneyClaim, onUpdate]);

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
        Now that you&apos;ve provided the facts for your claim, let&apos;s compile the
        claim statement and finalise the details for your court documents.
      </p>

      {/* Basis of claim (core field used elsewhere) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <label className="text-sm font-medium text-charcoal">
            Briefly explain what this claim is about
            <span className="text-red-500 ml-1">*</span>
          </label>
          <span className="text-xs text-gray-500">
            This wording is used in the particulars of claim.
          </span>
        </div>

        {/* Auto-generate button */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setIsGenerating(true);
              const generated = generateBasisOfClaimStatement(facts, selectedReasons);
              updateMoneyClaim('basis_of_claim', generated);
              setTimeout(() => setIsGenerating(false), 300);
            }}
            disabled={isGenerating}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors disabled:opacity-50"
          >
            {isGenerating ? (
              <RiRefreshLine className="w-4 h-4 animate-spin" />
            ) : (
              <RiMagicLine className="w-4 h-4" />
            )}
            {basisOfClaim ? 'Regenerate from selections' : 'Auto-generate statement'}
          </button>

          <button
            type="button"
            onClick={() => setShowMissingInfo(!showMissingInfo)}
            className="inline-flex items-center gap-1 px-2 py-1.5 text-xs text-gray-600 hover:text-gray-800 transition-colors"
          >
            <RiInformationLine className="w-4 h-4" />
            {showMissingInfo ? 'Hide tips' : 'What info is used?'}
          </button>
        </div>

        {/* Missing info helper */}
        {showMissingInfo && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
            <p className="text-xs font-medium text-blue-800 mb-2">
              The auto-generated statement uses data from your wizard answers:
            </p>
            {(() => {
              const missing = getMissingStatementInfo(facts, selectedReasons);
              if (missing.length === 0) {
                return (
                  <p className="text-xs text-green-700">
                    All relevant information is available for a complete statement.
                  </p>
                );
              }
              return (
                <>
                  <p className="text-xs text-blue-700 mb-1">
                    To improve the statement, complete these sections:
                  </p>
                  <ul className="list-disc list-inside text-xs text-blue-700 space-y-0.5">
                    {missing.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </>
              );
            })()}
          </div>
        )}

        <textarea
          className={`w-full rounded-md border px-3 py-2 text-sm min-h-[150px] focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] ${
            !basisOfClaim
              ? 'border-amber-300 bg-amber-50'
              : 'border-gray-300'
          }`}
          value={basisOfClaim}
          onChange={(e) => updateMoneyClaim('basis_of_claim', e.target.value)}
          onFocus={() => onSetCurrentQuestionId?.('basis_of_claim')}
          onBlur={() => onSetCurrentQuestionId?.(undefined)}
          placeholder="Click 'Auto-generate statement' above to create a draft based on your selections, or write your own summary here..."
        />

        {/* Inline validation */}
        {!basisOfClaim && (
          <p className="text-xs text-amber-600 flex items-center gap-1">
            <RiInformationLine className="w-3.5 h-3.5" />
            Please provide a basis of claim statement (use auto-generate or write your own)
          </p>
        )}

        {/* Ask Heaven Inline Enhancer - with improved context */}
        <AskHeavenInlineEnhancer
          questionId="basis_of_claim"
          questionText="Basis of claim for money claim"
          answer={basisOfClaim}
          onApply={(newText) => updateMoneyClaim('basis_of_claim', newText)}
          context={{
            ...enhanceContext,
            claim_summary: generateClaimSummary(facts, selectedReasons),
            total_arrears: facts.total_arrears || facts.issues?.rent_arrears?.total_arrears,
            property_address: facts.property_address_line1,
            tenant_name: facts.tenant_full_name,
            tenancy_start: facts.tenancy_start_date,
            tenancy_end: facts.tenancy_end_date,
          }}
          apiMode="generic"
          minChars={10}
        />

        <p className="text-xs text-gray-500">
          Write in plain English. We&apos;ll help you turn this into a court-ready legal summary.
          The auto-generate feature creates a draft based on your selected claim types and the
          information you&apos;ve provided.
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

      {/* Interest Opt-In - Explicit Confirmation Required (England only) */}
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
    </div>
  );
};

export default ClaimStatementSection;
