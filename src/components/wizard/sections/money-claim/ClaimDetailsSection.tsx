// src/components/wizard/sections/money-claim/ClaimDetailsSection.tsx

'use client';

import React, { useState, useCallback } from 'react';
import { RiSparklingLine, RiLoader4Line, RiCheckboxCircleLine } from 'react-icons/ri';

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

  // Ask Heaven enhancement state
  const [enhancingField, setEnhancingField] = useState<string | null>(null);
  const [enhancedText, setEnhancedText] = useState<{ field: string; text: string } | null>(null);
  const [enhanceError, setEnhanceError] = useState<string | null>(null);

  const updateMoneyClaim = (field: string, value: any) => {
    onUpdate({
      money_claim: {
        ...moneyClaim,
        [field]: value,
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
  const otherAmountsSummary = moneyClaim.other_amounts_summary || '';

  const toggleOtherAmountType = (value: string) => {
    const set = new Set(otherAmountsTypes);
    if (set.has(value)) {
      set.delete(value);
    } else {
      set.add(value);
    }
    updateMoneyClaim('other_amounts_types', Array.from(set));
  };

  // Enhance with Ask Heaven
  const handleEnhance = useCallback(async (fieldName: string, currentText: string, questionText: string) => {
    if (!currentText.trim() || currentText.trim().length < 20) return;

    setEnhancingField(fieldName);
    setEnhanceError(null);

    try {
      const response = await fetch('/api/ask-heaven/enhance-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_id: fieldName,
          question_text: questionText,
          answer: currentText,
          context: {
            jurisdiction,
            product: 'money_claim',
            primary_issue: primaryIssue,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to enhance text');
      }

      const suggested =
        data.suggested_wording ||
        data.enhanced_answer?.suggested ||
        data.ask_heaven?.suggested_wording;

      if (suggested) {
        setEnhancedText({ field: fieldName, text: suggested });
      } else {
        throw new Error('No suggestion returned from Ask Heaven');
      }
    } catch (err: any) {
      console.error('Ask Heaven enhance error:', err);
      setEnhanceError(err.message || 'Failed to enhance. Please try again.');
    } finally {
      setEnhancingField(null);
    }
  }, [jurisdiction, primaryIssue]);

  const handleApplyEnhanced = () => {
    if (enhancedText) {
      updateMoneyClaim(enhancedText.field, enhancedText.text);
      setEnhancedText(null);
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-600">
        This section gives the court a clear overview of what your money claim is about
        and why the tenant owes you money. We&apos;ll use this to draft the legal
        summary and particulars of claim for{' '}
        {(jurisdiction === 'england' || jurisdiction === 'wales') ? 'England & Wales' : 'Scotland'}.
      </p>

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
          onChange={(e) => updateMoneyClaim('primary_issue', e.target.value || null)}
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

        {/* Enhance with Ask Heaven button */}
        {basisOfClaim.trim().length > 20 && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleEnhance('basis_of_claim', basisOfClaim, 'Basis of claim for money claim')}
              disabled={enhancingField === 'basis_of_claim'}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-md hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {enhancingField === 'basis_of_claim' ? (
                <>
                  <RiLoader4Line className="w-4 h-4 mr-2 animate-spin" />
                  Enhancing...
                </>
              ) : (
                <>
                  <RiSparklingLine className="w-4 h-4 mr-2" />
                  Enhance with Ask Heaven
                </>
              )}
            </button>
            <span className="text-xs text-gray-500">
              AI will improve clarity and court-readiness
            </span>
          </div>
        )}

        {/* Enhanced text suggestion for basis_of_claim */}
        {enhancedText?.field === 'basis_of_claim' && (
          <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg space-y-3">
            <div className="flex items-center gap-2">
              <RiCheckboxCircleLine className="w-5 h-5 text-[#7C3AED]" />
              <span className="text-sm font-semibold text-indigo-900">
                Ask Heaven Suggestion
              </span>
            </div>
            <p className="text-sm text-indigo-900 whitespace-pre-wrap">
              {enhancedText.text}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleApplyEnhanced}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
              >
                Use this wording
              </button>
              <button
                type="button"
                onClick={() => setEnhancedText(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

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
                onChange={() => toggleOtherAmountType(item.value)}
              />
              <span className="text-gray-800">{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Free-text explanation for other amounts */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <label className="text-sm font-medium text-charcoal">
            Any damage, costs or other amounts you are also claiming
          </label>
          <span className="text-xs text-gray-500">
            We&apos;ll convert this into a structured schedule later.
          </span>
        </div>
        <textarea
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm min-h-[120px] focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
          value={otherAmountsSummary}
          onChange={(e) => updateMoneyClaim('other_amounts_summary', e.target.value)}
          placeholder="For example: £450 to replace damaged bedroom carpet, £120 for deep cleaning, £80 unpaid water bill, £60 locksmith fee…"
        />

        {/* Enhance with Ask Heaven button */}
        {otherAmountsSummary.trim().length > 20 && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleEnhance('other_amounts_summary', otherAmountsSummary, 'Other amounts summary for money claim')}
              disabled={enhancingField === 'other_amounts_summary'}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-md hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {enhancingField === 'other_amounts_summary' ? (
                <>
                  <RiLoader4Line className="w-4 h-4 mr-2 animate-spin" />
                  Enhancing...
                </>
              ) : (
                <>
                  <RiSparklingLine className="w-4 h-4 mr-2" />
                  Enhance with Ask Heaven
                </>
              )}
            </button>
            <span className="text-xs text-gray-500">
              AI will improve clarity and court-readiness
            </span>
          </div>
        )}

        {/* Enhanced text suggestion for other_amounts_summary */}
        {enhancedText?.field === 'other_amounts_summary' && (
          <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg space-y-3">
            <div className="flex items-center gap-2">
              <RiCheckboxCircleLine className="w-5 h-5 text-[#7C3AED]" />
              <span className="text-sm font-semibold text-indigo-900">
                Ask Heaven Suggestion
              </span>
            </div>
            <p className="text-sm text-indigo-900 whitespace-pre-wrap">
              {enhancedText.text}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleApplyEnhanced}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
              >
                Use this wording
              </button>
              <button
                type="button"
                onClick={() => setEnhancedText(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        <p className="text-xs text-gray-500">
          Ask Heaven can help enhance your text with court-ready wording.
        </p>
      </div>

      {/* Error display */}
      {enhanceError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{enhanceError}</p>
        </div>
      )}
    </div>
  );
};
