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
import {
  ValidatedInput,
  ValidatedSelect,
  ValidatedCurrencyInput,
  ValidatedYesNoToggle,
} from '@/components/wizard/ValidatedField';

interface TenancySectionProps {
  facts: WizardFacts;
  jurisdiction: 'england' | 'wales' | 'scotland';
  onUpdate: (updates: Record<string, any>) => void | Promise<void>;
}

const SECTION_ID = 'tenancy';

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
 */
function getTenancyTypesForJurisdiction(jurisdiction: 'england' | 'wales' | 'scotland') {
  switch (jurisdiction) {
    case 'scotland':
      return SCOTLAND_TENANCY_TYPES;
    case 'wales':
      // Wales should use OccupationContractSection, but provide fallback
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

const BREAK_CLAUSE_OPTIONS = [
  { value: '', label: 'Not sure' },
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
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

  // N5B-specific questions only apply to England Section 21 complete pack
  const isSection21 = facts.eviction_route === 'section_21' || facts.selected_notice_route === 'section_21';
  const showN5BQuestions = jurisdiction === 'england' && isSection21;

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
      <ValidatedInput
        id="tenancy_start_date"
        label="Tenancy start date"
        type="date"
        value={facts.tenancy_start_date as string}
        onChange={(v) => onUpdate({ tenancy_start_date: v })}
        validation={{ required: true }}
        required
        helperText={isScotland
          ? 'The date the current tenancy began. This affects notice period calculations and the 6-month rule.'
          : "The date the current tenancy began. This affects notice period calculations and the 'How to Rent' requirement."
        }
        sectionId={SECTION_ID}
        className="max-w-xs"
      />

      {/* Tenancy type */}
      <ValidatedSelect
        id="tenancy_type"
        label="Tenancy type"
        value={tenancyType}
        onChange={(v) => onUpdate({ tenancy_type: v })}
        options={tenancyTypes}
        validation={{ required: true }}
        required
        helperText={isScotland
          ? 'The tenancy type affects which grounds apply. Most modern tenancies are PRTs.'
          : 'The tenancy type affects which notices can be used and notice periods.'
        }
        sectionId={SECTION_ID}
        className="max-w-md"
      />

      {/* N5B Q7: Tenancy Agreement Date (England Section 21 only) */}
      {showN5BQuestions && (
        <ValidatedInput
          id="tenancy_agreement_date"
          label="Tenancy agreement date"
          type="date"
          value={(facts.tenancy_agreement_date || facts.tenancy_start_date) as string}
          onChange={(v) => onUpdate({ tenancy_agreement_date: v })}
          helperText="The date shown on your written tenancy agreement. Usually the same as the start date, but may be earlier if you signed before the tenancy began."
          sectionId={SECTION_ID}
          className="max-w-xs"
        />
      )}

      {/* N5B Q8: Subsequent Tenancy (England Section 21 only) */}
      {showN5BQuestions && (
        <ValidatedYesNoToggle
          id="subsequent_tenancy"
          label="Has any subsequent written tenancy agreement been entered into since the original?"
          value={facts.subsequent_tenancy}
          onChange={(v) => onUpdate({ subsequent_tenancy: v })}
          helperText="For example, a renewal or new fixed-term agreement with the same tenant."
          sectionId={SECTION_ID}
        />
      )}

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
          <ValidatedInput
            id="fixed_term_end_date"
            label="Fixed term end date"
            type="date"
            value={facts.fixed_term_end_date as string}
            onChange={(v) => onUpdate({ fixed_term_end_date: v })}
            validation={{ required: true }}
            required
            helperText="Section 21 notices cannot expire before the fixed term ends (unless there is a break clause)."
            sectionId={SECTION_ID}
            className="max-w-xs"
          />

          {/* Break clause question */}
          <ValidatedSelect
            id="has_break_clause"
            label="Does the tenancy agreement contain a break clause?"
            value={facts.has_break_clause === true ? 'yes' : facts.has_break_clause === false ? 'no' : ''}
            onChange={(v) => {
              const val = v as string;
              onUpdate({
                has_break_clause: val === 'yes' ? true : val === 'no' ? false : null,
                // Clear break clause date if no break clause
                ...(val !== 'yes' ? { break_clause_date: null } : {}),
              });
            }}
            options={BREAK_CLAUSE_OPTIONS}
            helperText="A break clause allows either party to end the tenancy early. Check your tenancy agreement."
            sectionId={SECTION_ID}
            className="max-w-xs"
          />

          {/* Break clause date (if has break clause) */}
          {facts.has_break_clause === true && (
            <div className="pl-4 border-l-2 border-blue-200">
              <ValidatedInput
                id="break_clause_date"
                label="Earliest break clause date"
                type="date"
                value={facts.break_clause_date as string}
                onChange={(v) => onUpdate({ break_clause_date: v })}
                validation={{ required: true }}
                required
                helperText="The earliest date the break clause can be exercised. This is often 6 months after tenancy start. Section 21 notices can expire on or after this date (subject to 2-month notice period)."
                sectionId={SECTION_ID}
                className="max-w-xs"
              />
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
          <ValidatedCurrencyInput
            id="rent_amount"
            label="Rent amount"
            value={facts.rent_amount}
            onChange={(v) => onUpdate({ rent_amount: parseFloat(String(v)) || 0 })}
            validation={{ required: true, min: 0 }}
            required
            min={0}
            placeholder="0.00"
            sectionId={SECTION_ID}
          />

          {/* Rent frequency */}
          <ValidatedSelect
            id="rent_frequency"
            label="Frequency"
            value={rentFrequency}
            onChange={(v) => onUpdate({ rent_frequency: v })}
            options={RENT_FREQUENCIES}
            validation={{ required: true }}
            required
            sectionId={SECTION_ID}
          />

          {/* Rent due day */}
          <ValidatedInput
            id="rent_due_day"
            label="Day rent is due"
            type="number"
            value={facts.rent_due_day}
            onChange={(v) => onUpdate({ rent_due_day: parseInt(String(v)) || 1 })}
            validation={{
              required: true,
              min: 1,
              max: rentFrequency === 'weekly' || rentFrequency === 'fortnightly' ? 7 : 31,
            }}
            required
            min={1}
            max={rentFrequency === 'weekly' || rentFrequency === 'fortnightly' ? 7 : 31}
            placeholder={rentFrequency === 'weekly' || rentFrequency === 'fortnightly' ? '1-7' : '1-31'}
            helperText={getRentDueDayHelper()}
            sectionId={SECTION_ID}
          />
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
