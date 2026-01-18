/**
 * Tenancy Section - Eviction Wizard
 *
 * Step 4: Collects tenancy details required for notices and court forms.
 *
 * Fields:
 * - tenancy_start_date: When the tenancy began
 * - tenancy_type: Jurisdiction-specific tenancy type
 * - fixed_term_end_date: If fixed term (England only - affects notice timing)
 * - rent_amount: Monthly/weekly rent amount
 * - rent_frequency: weekly/fortnightly/monthly
 * - rent_due_day: Day rent is due (critical for Section 8 wording)
 *
 * Legal context:
 * - rent_due_day is REQUIRED for Section 8 notices to describe the rental period
 * - fixed_term_end_date affects when notices can expire (England only)
 *
 * JURISDICTION-SPECIFIC TENANCY TYPES:
 * - England: AST (Fixed/Periodic), Assured Tenancy, Regulated Tenancy
 * - Scotland: PRT (2017+), SAT (1989-2017), AT (legacy), Regulated (pre-1989)
 * - Wales: Uses separate OccupationContractSection component
 *
 * CROSS-JURISDICTION TERMINOLOGY GUARDRAILS:
 * - Scotland MUST NOT show: "Section 21", "Assured Shorthold Tenancy", "How to Rent",
 *   "fixed term end date", "break clause", "2 months notice"
 * - Scotland MUST show: "First-tier Tribunal", "Notice to Leave", discretionary grounds
 */

'use client';

import React, { useEffect, useMemo } from 'react';
import type { WizardFacts } from '@/lib/case-facts/schema';

interface TenancySectionProps {
  facts: WizardFacts;
  jurisdiction: 'england' | 'wales' | 'scotland';
  onUpdate: (updates: Record<string, any>) => void | Promise<void>;
}

// =============================================================================
// JURISDICTION-SPECIFIC TENANCY TYPES
// =============================================================================
// CRITICAL: These mappings ensure correct legal terminology per jurisdiction.
// Do NOT mix England terminology (AST, Section 21) into Scotland or vice versa.

/**
 * England tenancy types (Housing Act 1988)
 * Internal codes: ast_fixed, ast_periodic, assured, regulated
 */
const ENGLAND_TENANCY_TYPES = [
  { value: 'ast_fixed', label: 'Assured Shorthold Tenancy (Fixed term)' },
  { value: 'ast_periodic', label: 'Assured Shorthold Tenancy (Periodic/Rolling)' },
  { value: 'assured', label: 'Assured Tenancy (pre-1997)' },
  { value: 'regulated', label: 'Regulated Tenancy (pre-1989)' },
];

/**
 * Scotland tenancy types (Private Housing (Tenancies) (Scotland) Act 2016)
 * Internal codes: prt, sat, assured_scotland, regulated_scotland
 *
 * NOTE: Scotland does NOT use AST. The PRT replaced the old SAT/AT system in 2017.
 * We use distinct internal codes to avoid confusion with England types.
 *
 * TODO(LEGAL): Scotland legacy tenancy types (SAT, AT, Regulated) may require
 * different eviction procedures than PRT. Currently we show them as options but
 * the notice_only flow is optimized for PRT. Product/legal review needed to:
 * 1. Determine if we should support legacy tenancy evictions or redirect users
 * 2. If supporting, verify correct grounds/forms/procedures for each type
 * 3. Consider adding "not supported" messaging for legacy types if appropriate
 */
const SCOTLAND_TENANCY_TYPES = [
  { value: 'prt', label: 'Private Residential Tenancy (PRT) (2017–present)' },
  { value: 'sat', label: 'Short Assured Tenancy (SAT) (1989–2017) [legacy]' },
  { value: 'assured_scotland', label: 'Assured Tenancy (AT) (1989–present) [legacy]' },
  { value: 'regulated_scotland', label: 'Regulated Tenancy (pre-1989) [legacy/rare]' },
];

/**
 * Get tenancy types for the given jurisdiction.
 * Wales uses a separate OccupationContractSection, but we include a fallback.
 *
 * TODO(LEGAL): Wales fallback types below should NOT be reached in normal flow.
 * If this code path is triggered, it indicates a routing bug - Wales eviction
 * should use OccupationContractSection, not TenancySection. Monitor for usage
 * and consider adding error logging if this fallback is ever invoked.
 */
function getTenancyTypesForJurisdiction(jurisdiction: 'england' | 'wales' | 'scotland') {
  switch (jurisdiction) {
    case 'scotland':
      return SCOTLAND_TENANCY_TYPES;
    case 'wales':
      // Wales should use OccupationContractSection, but provide fallback
      // TODO(LEGAL): Wales fallback - should not be reached in normal flow
      console.warn('[TenancySection] Wales fallback triggered - should use OccupationContractSection');
      return [
        { value: 'standard_periodic', label: 'Standard Contract (Periodic)' },
        { value: 'standard_fixed', label: 'Standard Contract (Fixed term)' },
        { value: 'secure', label: 'Secure Contract (social landlord)' },
      ];
    case 'england':
    default:
      return ENGLAND_TENANCY_TYPES;
  }
}

const RENT_FREQUENCIES = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'fortnightly', label: 'Fortnightly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
];

export const TenancySection: React.FC<TenancySectionProps> = ({
  facts,
  jurisdiction,
  onUpdate,
}) => {
  // Get jurisdiction-specific tenancy types
  const tenancyTypes = useMemo(() => getTenancyTypesForJurisdiction(jurisdiction), [jurisdiction]);

  const tenancyType = facts.tenancy_type || '';
  const rentFrequency = facts.rent_frequency || 'monthly';

  // Fixed term logic differs by jurisdiction:
  // - England: ast_fixed is fixed term
  // - Wales: standard_fixed is fixed term (handled by OccupationContractSection)
  // - Scotland: PRT has NO fixed term concept - all PRTs are open-ended
  const isScotland = jurisdiction === 'scotland';
  const isFixedTerm = !isScotland && (tenancyType === 'ast_fixed' || tenancyType === 'standard_fixed');

  // Initialize default values for rent_frequency and rent_due_day
  // This ensures displayed defaults are saved to facts for isComplete checks
  useEffect(() => {
    const updates: Record<string, any> = {};
    if (!facts.rent_frequency) {
      updates.rent_frequency = 'monthly';
    }
    if (!facts.rent_due_day) {
      updates.rent_due_day = 1;
    }
    if (Object.keys(updates).length > 0) {
      onUpdate(updates);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount - intentionally empty deps

  // Helper text for rent due day based on frequency
  const getRentDueDayHelper = () => {
    switch (rentFrequency) {
      case 'weekly':
        return 'Enter the day of the week (1=Monday, 7=Sunday)';
      case 'fortnightly':
        return 'Enter the day of the week (1=Monday, 7=Sunday) when the two-week period starts';
      case 'monthly':
        return 'Enter the day of the month (1-31) when rent is due';
      case 'quarterly':
        return 'Enter the day of the month (1-31) when quarterly rent is due';
      default:
        return 'Enter the day (1-31) when rent is due';
    }
  };

  return (
    <div className="space-y-6">
      {/* Tenancy start date */}
      <div className="space-y-2">
        <label htmlFor="tenancy_start_date" className="block text-sm font-medium text-gray-700">
          Tenancy start date
          <span className="text-red-500 ml-1">*</span>
        </label>
        <input
          id="tenancy_start_date"
          type="date"
          className="w-full max-w-xs rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
          value={facts.tenancy_start_date || ''}
          onChange={(e) => onUpdate({ tenancy_start_date: e.target.value })}
        />
        <p className="text-xs text-gray-500">
          {isScotland ? (
            // Scotland: No "How to Rent" requirement - reference 6-month rule instead
            <>The date the current tenancy began. This affects notice period calculations and the 6-month rule.</>
          ) : (
            // England: "How to Rent" guide is an England-specific requirement
            <>The date the current tenancy began. This affects notice period calculations and the &apos;How to Rent&apos; requirement.</>
          )}
        </p>
      </div>

      {/* Tenancy type */}
      <div className="space-y-2">
        <label htmlFor="tenancy_type" className="block text-sm font-medium text-gray-700">
          {isScotland ? 'Tenancy type' : 'Tenancy type'}
          <span className="text-red-500 ml-1">*</span>
        </label>
        <select
          id="tenancy_type"
          className="w-full max-w-md rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
          value={tenancyType}
          onChange={(e) => onUpdate({ tenancy_type: e.target.value })}
        >
          <option value="">{isScotland ? 'Select tenancy type...' : 'Select tenancy type...'}</option>
          {tenancyTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500">
          {isScotland ? (
            // Scotland: reference tribunal and discretionary grounds
            <>The tenancy type affects which grounds apply. Most modern tenancies are PRTs.</>
          ) : (
            // England: reference notices and periods
            <>The tenancy type affects which notices can be used and notice periods.</>
          )}
        </p>
      </div>

      {/* Scotland PRT info banner - show when PRT is selected */}
      {isScotland && tenancyType === 'prt' && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-1">
            Private Residential Tenancy (PRT)
          </h4>
          <p className="text-sm text-blue-800">
            PRTs are open-ended tenancies with no fixed term. To end a PRT, landlords must
            serve a Notice to Leave and apply to the First-tier Tribunal (Housing and Property Chamber).
            All eviction grounds are discretionary — the Tribunal considers reasonableness.
          </p>
        </div>
      )}

      {/* Scotland legacy tenancy warning */}
      {isScotland && (tenancyType === 'sat' || tenancyType === 'assured_scotland' || tenancyType === 'regulated_scotland') && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <h4 className="text-sm font-medium text-amber-900 mb-1">
            Legacy Tenancy Type
          </h4>
          <p className="text-sm text-amber-800">
            {tenancyType === 'sat' && (
              <>Short Assured Tenancies (SATs) could not be created after 1 December 2017. If this tenancy started after that date, it is likely a PRT.</>
            )}
            {tenancyType === 'assured_scotland' && (
              <>Assured Tenancies are rare for private lets created after 1989. Most private tenancies are now PRTs.</>
            )}
            {tenancyType === 'regulated_scotland' && (
              <>Regulated Tenancies are very rare and provide strong tenant protections. Seek specialist legal advice.</>
            )}
          </p>
        </div>
      )}

      {/* Fixed term end date (conditional) */}
      {isFixedTerm && (
        <div className="space-y-4 pl-4 border-l-2 border-purple-200">
          <div className="space-y-2">
            <label htmlFor="fixed_term_end_date" className="block text-sm font-medium text-gray-700">
              Fixed term end date
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              id="fixed_term_end_date"
              type="date"
              className="w-full max-w-xs rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
              value={facts.fixed_term_end_date || ''}
              onChange={(e) => onUpdate({ fixed_term_end_date: e.target.value })}
            />
            <p className="text-xs text-gray-500">
              Section 21 notices cannot expire before the fixed term ends (unless there is a break clause).
            </p>
          </div>

          {/* Break clause question */}
          <div className="space-y-2">
            <label htmlFor="has_break_clause" className="block text-sm font-medium text-gray-700">
              Does the tenancy agreement contain a break clause?
            </label>
            <select
              id="has_break_clause"
              className="w-full max-w-xs rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
              value={facts.has_break_clause === true ? 'yes' : facts.has_break_clause === false ? 'no' : ''}
              onChange={(e) => {
                const val = e.target.value;
                onUpdate({
                  has_break_clause: val === 'yes' ? true : val === 'no' ? false : null,
                  // Clear break clause date if no break clause
                  ...(val !== 'yes' ? { break_clause_date: null } : {}),
                });
              }}
            >
              <option value="">Not sure</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
            <p className="text-xs text-gray-500">
              A break clause allows either party to end the tenancy early. Check your tenancy agreement.
            </p>
          </div>

          {/* Break clause date (if has break clause) */}
          {facts.has_break_clause === true && (
            <div className="space-y-2 pl-4 border-l-2 border-blue-200">
              <label htmlFor="break_clause_date" className="block text-sm font-medium text-gray-700">
                Earliest break clause date
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                id="break_clause_date"
                type="date"
                className="w-full max-w-xs rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
                value={facts.break_clause_date || ''}
                onChange={(e) => onUpdate({ break_clause_date: e.target.value })}
              />
              <p className="text-xs text-gray-500">
                The earliest date the break clause can be exercised. This is often 6 months after tenancy start.
                Section 21 notices can expire on or after this date (subject to 2-month notice period).
              </p>
            </div>
          )}

          {/* Info box for fixed term and Section 21 */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h5 className="text-sm font-medium text-blue-900 mb-1">Fixed Term & Section 21</h5>
            <p className="text-xs text-blue-800">
              {facts.has_break_clause === true ? (
                <>If you have a break clause, you can serve a Section 21 notice that expires on or after the break clause date (subject to minimum 2-month notice).</>
              ) : facts.has_break_clause === false ? (
                <>Without a break clause, a Section 21 notice cannot expire before the fixed term end date. You can still serve the notice during the fixed term, but it will expire on the fixed term end date (or 2 months from service, whichever is later).</>
              ) : (
                <>If the tenancy has a break clause, you may be able to serve a Section 21 notice that expires before the fixed term end date. Check your tenancy agreement.</>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Rent details */}
      <div className="pt-4 border-t border-gray-200 space-y-4">
        <h4 className="text-sm font-medium text-gray-900">Rent Details</h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Rent amount */}
          <div className="space-y-2">
            <label htmlFor="rent_amount" className="block text-sm font-medium text-gray-700">
              Rent amount (£)
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">£</span>
              <input
                id="rent_amount"
                type="number"
                min="0"
                step="0.01"
                className="w-full rounded-md border border-gray-300 pl-7 pr-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
                value={facts.rent_amount || ''}
                onChange={(e) => onUpdate({ rent_amount: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Rent frequency */}
          <div className="space-y-2">
            <label htmlFor="rent_frequency" className="block text-sm font-medium text-gray-700">
              Frequency
              <span className="text-red-500 ml-1">*</span>
            </label>
            <select
              id="rent_frequency"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
              value={rentFrequency}
              onChange={(e) => onUpdate({ rent_frequency: e.target.value })}
            >
              {RENT_FREQUENCIES.map((freq) => (
                <option key={freq.value} value={freq.value}>
                  {freq.label}
                </option>
              ))}
            </select>
          </div>

          {/* Rent due day */}
          <div className="space-y-2">
            <label htmlFor="rent_due_day" className="block text-sm font-medium text-gray-700">
              Day rent is due
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              id="rent_due_day"
              type="number"
              min="1"
              max={rentFrequency === 'weekly' || rentFrequency === 'fortnightly' ? 7 : 31}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
              value={facts.rent_due_day || ''}
              onChange={(e) => onUpdate({ rent_due_day: parseInt(e.target.value) || 1 })}
              placeholder={rentFrequency === 'weekly' || rentFrequency === 'fortnightly' ? '1-7' : '1-31'}
            />
            <p className="text-xs text-gray-500">
              {getRentDueDayHelper()}
            </p>
          </div>
        </div>

        {/* Rent calculation preview */}
        {facts.rent_amount && facts.rent_frequency && (
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Rent summary:</strong>{' '}
              £{Number(facts.rent_amount).toFixed(2)} {facts.rent_frequency}
              {facts.rent_due_day && (
                <span className="text-gray-500">
                  {' '}
                  (due on day {facts.rent_due_day})
                </span>
              )}
            </p>
            {facts.rent_frequency === 'monthly' && facts.rent_amount && (
              <p className="text-xs text-gray-500 mt-1">
                Annual rent: £{(Number(facts.rent_amount) * 12).toLocaleString('en-GB', { minimumFractionDigits: 2 })}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Legal info for Section 8 (England only) */}
      {!isScotland && facts.eviction_route === 'section_8' && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <h4 className="text-sm font-medium text-amber-900 mb-1">
            Section 8 Rent Details
          </h4>
          <p className="text-sm text-amber-800">
            The rent amount and due day are critical for Section 8 notices, especially Ground 8
            (rent arrears). The notice must accurately describe the rental period and calculate
            whether arrears meet the 2-month threshold.
          </p>
        </div>
      )}

      {/* Legal info for Scotland rent arrears (Ground 18) */}
      {isScotland && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-1">
            Scotland Rent Details
          </h4>
          <p className="text-sm text-blue-800">
            Accurate rent details are essential if you plan to use Ground 18 (rent arrears) for
            eviction. The First-tier Tribunal requires evidence of 3 or more consecutive rent
            periods of arrears.
          </p>
        </div>
      )}
    </div>
  );
};

export default TenancySection;
