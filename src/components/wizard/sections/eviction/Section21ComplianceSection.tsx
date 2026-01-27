/**
 * Section 21 Compliance Section - Eviction Wizard
 *
 * Step 6 (Section 21 only): Collects compliance requirements for no-fault eviction.
 *
 * CRITICAL: Many of these are BLOCKERS for Section 21. If any are not met,
 * Section 21 may be invalid or unavailable.
 *
 * IMPORTANT SEPARATION:
 * - "Compliance truth" = Was the requirement met? (e.g., "Was deposit protected?")
 * - "Evidence uploaded" = Is the document attached? (handled in Evidence section)
 *
 * Fields:
 * - deposit_taken: Was a deposit collected?
 * - deposit_amount: How much (if deposit taken)
 * - deposit_protected: Is deposit in approved scheme?
 * - deposit_scheme_name: Which scheme (DPS, MyDeposits, TDS)
 * - deposit_protection_date: When was it protected?
 * - deposit_reference: Scheme reference number
 * - prescribed_info_served: Was prescribed info given within 30 days?
 * - has_gas_appliances: Does property have gas?
 * - gas_safety_cert_served: Was gas safety cert provided? (if gas appliances)
 * - gas_safety_before_occupation: Was gas safety record provided before occupation?
 * - gas_safety_before_occupation_date: Date of pre-occupation gas safety check (if applicable)
 * - gas_safety_record_served_pre_occupation_date: Date the pre-occupation CP12 was given to tenant (CRITICAL for Section 21 compliance)
 * - gas_safety_check_date: Date of most recent CP12 check
 * - gas_safety_served_date: Date most recent CP12 was served on tenant (may be annual renewal)
 * - epc_served: Was EPC provided?
 * - epc_provided_date: Date EPC was provided (if epc served)
 * - how_to_rent_served: Was How to Rent guide provided?
 * - how_to_rent_date: Date How to Rent guide was provided (if served)
 * - how_to_rent_method: How provided (email/hard copy)
 * - licensing_required: Does property need licensing?
 * - has_valid_licence: Is it licensed (if required)?
 * - no_retaliatory_notice: Is notice being served more than 6 months after repair complaint?
 *
 * N5B-specific notes:
 * Some stored facts are "disqualifier flags" where TRUE means "bad / disqualifying".
 * To match existing Yes/No toggle behaviour (Yes=green, No=red + blocking),
 * we present the UI as a positive/compliance statement and INVERT the stored boolean:
 *   UI value   = !facts.disqualifierFlag
 *   onChange(v) => set disqualifierFlag = !v
 *
 * This keeps UI consistent: good answer shows green, bad answer shows red + message.
 */

'use client';

import React, { useMemo } from 'react';
import type { WizardFacts } from '@/lib/case-facts/schema';
import {
  ValidatedInput,
  ValidatedSelect,
  ValidatedCurrencyInput,
  ValidatedYesNoToggle,
} from '@/components/wizard/ValidatedField';

// ============================================================================
// INLINE DATE WARNING COMPONENT
// ============================================================================

interface DateWarningProps {
  message: string;
  show: boolean;
}

/**
 * DateWarning - Inline warning component for date validation issues
 *
 * These are WARNINGS, not hard blocks. Hard blocks remain on the Review page.
 * Warnings appear immediately below the date field and disappear when corrected.
 */
const DateWarning: React.FC<DateWarningProps> = ({ message, show }) => {
  if (!show) return null;

  return (
    <div className="mt-2 p-3 bg-amber-50 border border-amber-300 rounded-md">
      <p className="text-sm text-amber-800 whitespace-pre-line">
        {message}
      </p>
    </div>
  );
};

// ============================================================================
// DATE COMPARISON HELPERS
// ============================================================================

/**
 * Compares two dates at day-level precision.
 * Returns true if date1 is AFTER date2.
 */
function isDateAfter(date1: string | undefined, date2: string | undefined): boolean {
  if (!date1 || !date2) return false;
  // Compare date strings directly (ISO format: YYYY-MM-DD)
  return date1 > date2;
}

/**
 * Checks if a date is in the future (after today).
 */
function isDateInFuture(date: string | undefined): boolean {
  if (!date) return false;
  const today = new Date().toISOString().split('T')[0];
  return date > today;
}

interface Section21ComplianceSectionProps {
  facts: WizardFacts;
  jurisdiction: 'england' | 'wales';
  onUpdate: (updates: Record<string, any>) => void | Promise<void>;
}

const SECTION_ID = 'section21_compliance';

const DEPOSIT_SCHEMES = [
  { value: 'DPS', label: 'Deposit Protection Service (DPS)' },
  { value: 'MyDeposits', label: 'MyDeposits' },
  { value: 'TDS', label: 'Tenancy Deposit Scheme (TDS)' },
];

const LICENSING_OPTIONS = [
  { value: 'not_required', label: 'No licensing required' },
  { value: 'hmo_mandatory', label: 'Mandatory HMO licence required' },
  { value: 'hmo_additional', label: 'Additional HMO licence required' },
  { value: 'selective', label: 'Selective licence required' },
];

const HOW_TO_RENT_METHOD_OPTIONS = [
  { value: 'email', label: 'Email' },
  { value: 'hard_copy', label: 'Hard copy (printed/posted)' },
];

export const Section21ComplianceSection: React.FC<Section21ComplianceSectionProps> = ({
  facts,
  onUpdate,
}) => {
  const depositTaken = facts.deposit_taken === true;
  const hasGasAppliances = facts.has_gas_appliances === true;
  const licensingRequired = facts.licensing_required && facts.licensing_required !== 'not_required';

  // N5B disqualifier flags (TRUE = disqualifying/bad) are inverted for UI display:
  const q9b_ok_no_notice_not_ast = facts.n5b_q9b_has_notice_not_ast === undefined ? undefined : !facts.n5b_q9b_has_notice_not_ast;
  const q9c_ok_no_exclusion_clause = facts.n5b_q9c_has_exclusion_clause === undefined ? undefined : !facts.n5b_q9c_has_exclusion_clause;
  const q9d_ok_not_agricultural_worker = facts.n5b_q9d_is_agricultural_worker === undefined ? undefined : !facts.n5b_q9d_is_agricultural_worker;
  const q9e_ok_not_succession = facts.n5b_q9e_is_succession_tenancy === undefined ? undefined : !facts.n5b_q9e_is_succession_tenancy;
  const q9f_ok_not_former_secure = facts.n5b_q9f_was_secure_tenancy === undefined ? undefined : !facts.n5b_q9f_was_secure_tenancy;
  const q9g_ok_not_schedule_10 = facts.n5b_q9g_is_schedule_10 === undefined ? undefined : !facts.n5b_q9g_is_schedule_10;

  const q19_ok_no_unreturned_prohibited_payment =
    facts.n5b_q19_has_unreturned_prohibited_payment === undefined
      ? undefined
      : !facts.n5b_q19_has_unreturned_prohibited_payment;

  // ============================================================================
  // INLINE DATE VALIDATION WARNINGS (Part B)
  // ============================================================================
  // These are WARNINGS, not hard blocks. Hard blocks remain on the Review page.

  const tenancyStartDate = facts.tenancy_start_date as string | undefined;

  // EPC date warning: Show if EPC was provided AFTER tenancy started
  const showEpcDateWarning = useMemo(() => {
    if (facts.epc_served !== true) return false;
    const epcDate = facts.epc_provided_date as string | undefined;
    return isDateAfter(epcDate, tenancyStartDate);
  }, [facts.epc_served, facts.epc_provided_date, tenancyStartDate]);

  // How to Rent date warning: Show if guide was provided AFTER tenancy started
  const showHowToRentDateWarning = useMemo(() => {
    if (facts.how_to_rent_served !== true) return false;
    const howToRentDate = facts.how_to_rent_date as string | undefined;
    return isDateAfter(howToRentDate, tenancyStartDate);
  }, [facts.how_to_rent_served, facts.how_to_rent_date, tenancyStartDate]);

  // Gas Safety pre-occupation date warning: Show if date is AFTER tenancy started OR in the future
  const showGasSafetyPreOccupationWarning = useMemo(() => {
    if (facts.has_gas_appliances !== true) return false;
    if (facts.gas_safety_before_occupation !== true) return false;
    const gasDate = facts.gas_safety_record_served_pre_occupation_date as string | undefined;
    // Show warning if date is after tenancy start OR in the future
    return isDateAfter(gasDate, tenancyStartDate) || isDateInFuture(gasDate);
  }, [
    facts.has_gas_appliances,
    facts.gas_safety_before_occupation,
    facts.gas_safety_record_served_pre_occupation_date,
    tenancyStartDate,
  ]);

  // Warning message constants
  const EPC_DATE_WARNING = `⚠️ The Energy Performance Certificate should be given to the tenant BEFORE the tenancy starts.
If the EPC was provided after the start of the tenancy, a Section 21 notice may be invalid.`;

  const HOW_TO_RENT_DATE_WARNING = `⚠️ The 'How to Rent' guide should normally be given to the tenant at the start of the tenancy.
Providing it later can invalidate a Section 21 notice.`;

  const GAS_SAFETY_DATE_WARNING = `⚠️ A Gas Safety Certificate must be given to the tenant BEFORE they move in.
If it was not provided before occupation, a Section 21 notice is likely to be invalid.`;

  return (
    <div className="space-y-8">
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <h4 className="text-sm font-medium text-amber-900 mb-1">Section 21 Validity Requirements</h4>
        <p className="text-sm text-amber-800">
          Section 21 notices can only be served if key compliance requirements are met. Courts
          routinely reject Section 21 claims where these requirements are not met — we check
          each one so you can proceed with confidence.
        </p>
        <p className="text-xs text-amber-700 mt-2">
          Legal basis: Housing Act 1988, s.21(4B) and Deregulation Act 2015
        </p>
      </div>

      {/* Deposit Questions */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Deposit Protection</h3>

        <ValidatedYesNoToggle
          id="deposit_taken"
          label="Did you take a deposit from the tenant?"
          value={facts.deposit_taken}
          onChange={(v) => onUpdate({ deposit_taken: v })}
          required
          sectionId={SECTION_ID}
        />

        {depositTaken && (
          <div className="pl-4 border-l-2 border-purple-200 space-y-4">
            <ValidatedCurrencyInput
              id="deposit_amount"
              label="Deposit amount"
              value={facts.deposit_amount}
              onChange={(v) => onUpdate({ deposit_amount: parseFloat(String(v)) || 0 })}
              validation={{ required: true, min: 0 }}
              required
              min={0}
              sectionId={SECTION_ID}
            />

            <ValidatedYesNoToggle
              id="deposit_protected"
              label="Is the deposit protected in an approved scheme?"
              value={facts.deposit_protected}
              onChange={(v) => onUpdate({ deposit_protected: v })}
              required
              helperText="Why this matters: Unprotected deposits are one of the most common reasons courts reject Section 21 claims. The deposit must be protected within 30 days of receipt in a government-approved scheme (DPS, MyDeposits, or TDS). Legal reference: Housing Act 2004, s.213-214."
              blockingMessage="Section 21 cannot be used if the deposit is not protected. Courts may also award the tenant 1-3x the deposit as compensation."
              sectionId={SECTION_ID}
            />

            {facts.deposit_protected === true && (
              <>
                <ValidatedSelect
                  id="deposit_scheme_name"
                  label="Deposit protection scheme"
                  value={facts.deposit_scheme_name as string}
                  onChange={(v) => onUpdate({ deposit_scheme_name: v })}
                  options={DEPOSIT_SCHEMES}
                  validation={{ required: true }}
                  required
                  sectionId={SECTION_ID}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ValidatedInput
                    id="deposit_protection_date"
                    label="Date deposit was protected"
                    type="date"
                    value={facts.deposit_protection_date as string}
                    onChange={(v) => onUpdate({ deposit_protection_date: v })}
                    validation={{ required: true }}
                    required
                    sectionId={SECTION_ID}
                  />

                  <ValidatedInput
                    id="deposit_reference"
                    label="Deposit reference number"
                    value={facts.deposit_reference as string}
                    onChange={(v) => onUpdate({ deposit_reference: v })}
                    placeholder="Optional - scheme reference"
                    sectionId={SECTION_ID}
                  />
                </div>
              </>
            )}

            <ValidatedYesNoToggle
              id="prescribed_info_served"
              label="Was prescribed information served within 30 days?"
              value={facts.prescribed_info_served}
              onChange={(v) => onUpdate({ prescribed_info_served: v })}
              required
              helperText="Why this matters: Even if the deposit is protected, you must also give the tenant 'prescribed information' within 30 days. This includes details about the scheme, how to apply for release, and what happens at the end of the tenancy. Missing this step invalidates Section 21. Legal reference: Housing Act 2004, s.213(5)."
              blockingMessage="Section 21 cannot be used if prescribed information was not served within 30 days of receiving the deposit."
              sectionId={SECTION_ID}
            />

            <ValidatedYesNoToggle
              id="deposit_returned"
              label="Has the deposit been returned to the tenant?"
              value={facts.deposit_returned}
              onChange={(v) => onUpdate({ deposit_returned: v })}
              helperText="Select 'Yes' if you have already returned the deposit to the tenant (e.g., at the end of a fixed term)."
              sectionId={SECTION_ID}
            />
          </div>
        )}
      </div>

      {/* Gas Safety */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Gas Safety</h3>

        <ValidatedYesNoToggle
          id="has_gas_appliances"
          label="Does the property have gas appliances?"
          value={facts.has_gas_appliances}
          onChange={(v) => onUpdate({ has_gas_appliances: v })}
          required
          helperText="Gas boiler, gas hob, gas fire, etc."
          sectionId={SECTION_ID}
        />

        {hasGasAppliances && (
          <div className="pl-4 border-l-2 border-purple-200 space-y-4">
            <ValidatedYesNoToggle
              id="gas_safety_cert_served"
              label="Was the Gas Safety Certificate provided to the tenant?"
              value={facts.gas_safety_cert_served}
              onChange={(v) => onUpdate({ gas_safety_cert_served: v })}
              required
              helperText="Why this matters: Courts often dismiss Section 21 claims where gas safety certificates (CP12) were not provided. A valid certificate must be given to the tenant before they move in and within 28 days of each annual check. Legal reference: Gas Safety (Installation and Use) Regulations 1998."
              blockingMessage="Section 21 cannot be used if the gas safety certificate was not provided. This is a strict requirement."
              sectionId={SECTION_ID}
            />

            {facts.gas_safety_cert_served === true && (
              <div className="space-y-4">
                <ValidatedYesNoToggle
                  id="gas_safety_before_occupation"
                  label="Was a gas safety record provided before the tenant moved in?"
                  value={facts.gas_safety_before_occupation}
                  onChange={(v) => onUpdate({ gas_safety_before_occupation: v })}
                  helperText="Answer based on whether the tenant received a valid gas safety record before occupation began."
                  sectionId={SECTION_ID}
                />

                {facts.gas_safety_before_occupation === true && (
                  <div className="space-y-4">
                    <ValidatedInput
                      id="gas_safety_before_occupation_date"
                      label="Date of gas safety check before occupation"
                      type="date"
                      value={facts.gas_safety_before_occupation_date as string}
                      onChange={(v) => onUpdate({ gas_safety_before_occupation_date: v })}
                      validation={{ required: true }}
                      required
                      helperText="Date the pre-occupation CP12 check was carried out."
                      sectionId={SECTION_ID}
                      className="max-w-xs"
                    />

                    <div>
                      <ValidatedInput
                        id="gas_safety_record_served_pre_occupation_date"
                        label="Date the pre-occupation gas safety record was given to the tenant"
                        type="date"
                        value={facts.gas_safety_record_served_pre_occupation_date as string}
                        onChange={(v) => onUpdate({ gas_safety_record_served_pre_occupation_date: v })}
                        validation={{ required: true }}
                        required
                        helperText="The date you provided the CP12 to the tenant before they moved in. This is the critical date for Section 21 compliance."
                        sectionId={SECTION_ID}
                        className="max-w-xs"
                      />
                      <DateWarning show={showGasSafetyPreOccupationWarning} message={GAS_SAFETY_DATE_WARNING} />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ValidatedInput
                    id="gas_safety_check_date"
                    label="Date of most recent gas safety check"
                    type="date"
                    value={facts.gas_safety_check_date as string}
                    onChange={(v) => onUpdate({ gas_safety_check_date: v })}
                    validation={{ required: true }}
                    required
                    helperText="Date on the current CP12 certificate."
                    sectionId={SECTION_ID}
                  />

                  <ValidatedInput
                    id="gas_safety_served_date"
                    label="Date certificate was given to tenant"
                    type="date"
                    value={facts.gas_safety_served_date as string}
                    onChange={(v) => onUpdate({ gas_safety_served_date: v })}
                    validation={{ required: true }}
                    required
                    helperText="Date you provided the CP12 to the tenant."
                    sectionId={SECTION_ID}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* EPC */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Energy Performance Certificate</h3>

        <ValidatedYesNoToggle
          id="epc_served"
          label="Was an EPC provided to the tenant before the tenancy started?"
          value={facts.epc_served}
          onChange={(v) => onUpdate({ epc_served: v })}
          required
          helperText="Why this matters: An Energy Performance Certificate must be provided to the tenant before the tenancy begins. Properties must also have a minimum rating of E (with some exemptions). Missing EPCs are a common defence against Section 21 claims. Legal reference: Energy Performance of Buildings Regulations 2012, The Energy Efficiency (Private Rented Property) Regulations 2015."
          blockingMessage="Section 21 cannot be used if the EPC was not provided before the tenancy started."
          sectionId={SECTION_ID}
        />

        {facts.epc_served === true && (
          <div className="pl-4 border-l-2 border-purple-200">
            <ValidatedInput
              id="epc_provided_date"
              label="Date EPC was provided to tenant"
              type="date"
              value={facts.epc_provided_date as string}
              onChange={(v) => onUpdate({ epc_provided_date: v })}
              validation={{ required: true }}
              required
              helperText="The date you gave the tenant a copy of the EPC."
              sectionId={SECTION_ID}
              className="max-w-xs"
            />
            <DateWarning show={showEpcDateWarning} message={EPC_DATE_WARNING} />
          </div>
        )}
      </div>

      {/* How to Rent */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">How to Rent Guide</h3>

        <ValidatedYesNoToggle
          id="how_to_rent_served"
          label="Was the 'How to Rent' guide provided?"
          value={facts.how_to_rent_served}
          onChange={(v) => onUpdate({ how_to_rent_served: v })}
          required
          helperText="Why this matters: The government's 'How to Rent' guide must be provided to tenants (for tenancies starting from 1 October 2015). Courts can refuse possession if this wasn't done. The correct version for when the tenancy started must be used. Legal reference: Deregulation Act 2015, s.41."
          blockingMessage="Section 21 cannot be used if the 'How to Rent' guide was not provided to the tenant."
          sectionId={SECTION_ID}
        />

        {facts.how_to_rent_served === true && (
          <div className="pl-4 border-l-2 border-purple-200 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <ValidatedInput
                  id="how_to_rent_date"
                  label="Date 'How to Rent' was provided"
                  type="date"
                  value={facts.how_to_rent_date as string}
                  onChange={(v) => onUpdate({ how_to_rent_date: v })}
                  validation={{ required: true }}
                  required
                  helperText="The date you provided the guide to the tenant."
                  sectionId={SECTION_ID}
                />
                <DateWarning show={showHowToRentDateWarning} message={HOW_TO_RENT_DATE_WARNING} />
              </div>

              <ValidatedSelect
                id="how_to_rent_method"
                label="How was it provided?"
                value={facts.how_to_rent_method as string}
                onChange={(v) => onUpdate({ how_to_rent_method: v })}
                options={HOW_TO_RENT_METHOD_OPTIONS}
                validation={{ required: true }}
                required
                helperText="Email only if the tenant agreed to receive documents by email (keep proof)."
                sectionId={SECTION_ID}
              />
            </div>
          </div>
        )}
      </div>

      {/* Licensing */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Property Licensing</h3>

        <ValidatedSelect
          id="licensing_required"
          label="Is the property required to be licensed?"
          value={facts.licensing_required as string}
          onChange={(v) => onUpdate({ licensing_required: v })}
          options={LICENSING_OPTIONS}
          validation={{ required: true }}
          required
          helperText="Check with your local council if unsure. HMOs and some areas require licensing."
          sectionId={SECTION_ID}
        />

        {licensingRequired && (
          <div className="pl-4 border-l-2 border-purple-200">
            <ValidatedYesNoToggle
              id="has_valid_licence"
              label="Do you have a valid licence for this property?"
              value={facts.has_valid_licence}
              onChange={(v) => onUpdate({ has_valid_licence: v })}
              required
              blockingMessage="Section 21 cannot be used if the property requires a licence but does not have one."
              sectionId={SECTION_ID}
            />
          </div>
        )}
      </div>

      {/* Retaliatory eviction */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Retaliatory Eviction</h3>

        <ValidatedYesNoToggle
          id="no_retaliatory_notice"
          label="Is this notice being served more than 6 months after any repair complaint?"
          value={facts.no_retaliatory_notice}
          onChange={(v) => onUpdate({ no_retaliatory_notice: v })}
          required
          helperText="Section 21 notices served within 6 months of certain repair complaints may be deemed retaliatory and invalid."
          blockingMessage="This may be considered a retaliatory eviction. Consider waiting or using Section 8."
          sectionId={SECTION_ID}
        />
      </div>

      {/* N5B Accelerated Possession - AST Verification (Q9a-Q9g) */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
          N5B Accelerated Possession - AST Eligibility
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          These questions determine eligibility for accelerated possession (N5B). Answer each question
          truthfully. If any answer disqualifies the tenancy as an AST, accelerated possession may not
          be available.
        </p>

        <div className="space-y-3">
          {/* Q9(a) - stored as "good" boolean already (Yes = good) */}
          <ValidatedYesNoToggle
            id="n5b_q9a_after_feb_1997"
            label="Q9(a): Was the tenancy created on or after 28 February 1997?"
            value={facts.n5b_q9a_after_feb_1997}
            onChange={(v) => onUpdate({ n5b_q9a_after_feb_1997: v })}
            required
            helperText="Most ASTs are created after this date. Answer 'No' only if the tenancy predates 28 February 1997."
            blockingMessage="If the tenancy predates 28 February 1997, accelerated possession may not be available."
            sectionId={SECTION_ID}
          />

          {/* Q9(b) - disqualifier stored as TRUE=bad -> invert for UI */}
          <ValidatedYesNoToggle
            id="n5b_q9b_has_notice_not_ast"
            label="Q9(b): Was NO notice served stating the tenancy is not an AST?"
            value={q9b_ok_no_notice_not_ast}
            onChange={(v) => onUpdate({ n5b_q9b_has_notice_not_ast: !v })}
            required
            helperText="Most landlords answer 'Yes'. Answer 'No' only if you served a notice saying it is not an AST."
            blockingMessage="If notice was served stating this is not an AST, accelerated possession may not be available."
            sectionId={SECTION_ID}
          />

          {/* Q9(c) - disqualifier stored as TRUE=bad -> invert for UI */}
          <ValidatedYesNoToggle
            id="n5b_q9c_has_exclusion_clause"
            label="Q9(c): Does the tenancy agreement NOT state that it is not an AST?"
            value={q9c_ok_no_exclusion_clause}
            onChange={(v) => onUpdate({ n5b_q9c_has_exclusion_clause: !v })}
            required
            helperText="Most AST agreements answer 'Yes'. Answer 'No' only if the agreement says it is not an AST."
            blockingMessage="If the agreement excludes AST status, accelerated possession may not be available."
            sectionId={SECTION_ID}
          />

          {/* Q9(d) - disqualifier stored as TRUE=bad -> invert for UI */}
          <ValidatedYesNoToggle
            id="n5b_q9d_is_agricultural_worker"
            label="Q9(d): Is the tenant NOT an agricultural worker?"
            value={q9d_ok_not_agricultural_worker}
            onChange={(v) => onUpdate({ n5b_q9d_is_agricultural_worker: !v })}
            required
            helperText="Answer 'No' only if this is an agricultural worker tenancy (e.g., tied farm worker accommodation)."
            blockingMessage="Agricultural worker tenancies are not ASTs. Consider the standard possession route."
            sectionId={SECTION_ID}
          />

          {/* Q9(e) - disqualifier stored as TRUE=bad -> invert for UI */}
          <ValidatedYesNoToggle
            id="n5b_q9e_is_succession_tenancy"
            label="Q9(e): Did the tenancy NOT arise by succession (on death of a previous tenant)?"
            value={q9e_ok_not_succession}
            onChange={(v) => onUpdate({ n5b_q9e_is_succession_tenancy: !v })}
            required
            helperText="Most landlords answer 'Yes'. Answer 'No' only if the tenancy arose by succession."
            blockingMessage="Succession tenancies are not eligible for accelerated possession."
            sectionId={SECTION_ID}
          />

          {/* Q9(f) - disqualifier stored as TRUE=bad -> invert for UI */}
          <ValidatedYesNoToggle
            id="n5b_q9f_was_secure_tenancy"
            label="Q9(f): Was this NOT previously a secure tenancy?"
            value={q9f_ok_not_former_secure}
            onChange={(v) => onUpdate({ n5b_q9f_was_secure_tenancy: !v })}
            required
            helperText="Most landlords answer 'Yes'. Answer 'No' only if it was previously a secure tenancy."
            blockingMessage="Former secure tenancies are not eligible for accelerated possession."
            sectionId={SECTION_ID}
          />

          {/* Q9(g) - disqualifier stored as TRUE=bad -> invert for UI */}
          <ValidatedYesNoToggle
            id="n5b_q9g_is_schedule_10"
            label="Q9(g): Was the tenancy NOT granted under Schedule 10 of the LGHA 1989?"
            value={q9g_ok_not_schedule_10}
            onChange={(v) => onUpdate({ n5b_q9g_is_schedule_10: !v })}
            required
            helperText="Most landlords answer 'Yes'. Answer 'No' only if it was granted under Schedule 10."
            blockingMessage="Schedule 10 tenancies are not eligible for accelerated possession."
            sectionId={SECTION_ID}
          />
        </div>
      </div>

      {/* Tenant Fees Act 2019 (Q19) */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Tenant Fees Act 2019</h3>
        <p className="text-sm text-gray-600 mb-4">
          The Tenant Fees Act 2019 prohibits landlords from charging certain fees. Section 21 cannot be
          used if prohibited payments have been taken and not repaid.
        </p>

        {/* Q19 - disqualifier stored as TRUE=bad -> invert for UI */}
        <ValidatedYesNoToggle
          id="n5b_q19_has_unreturned_prohibited_payment"
          label="Q19: Have all prohibited payments (if any) been repaid to the tenant?"
          value={q19_ok_no_unreturned_prohibited_payment}
          onChange={(v) => onUpdate({ n5b_q19_has_unreturned_prohibited_payment: !v })}
          required
          helperText="Answer 'Yes' if no prohibited payments were taken, or if any were taken and have been fully repaid."
          blockingMessage="Section 21 cannot be used while an unreturned prohibited payment remains outstanding. The payment must be repaid before serving notice."
          sectionId={SECTION_ID}
        />

        {/* Q19(b) informational only - no blockingMessage */}
        <ValidatedYesNoToggle
          id="n5b_q19b_holding_deposit"
          label="Q19(b): Was a holding deposit taken?"
          value={facts.n5b_q19b_holding_deposit}
          onChange={(v) => onUpdate({ n5b_q19b_holding_deposit: v })}
          helperText="A holding deposit (maximum one week's rent) to reserve the property before the tenancy starts. Either answer is acceptable - this is for record-keeping only."
          sectionId={SECTION_ID}
        />
      </div>

      {/* Paper Determination Consent (Q20) */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Paper Determination Consent</h3>

        <ValidatedYesNoToggle
          id="n5b_q20_paper_determination"
          label="Q20: Do you consent to the court making a possession order without a hearing?"
          value={facts.n5b_q20_paper_determination}
          onChange={(v) => onUpdate({ n5b_q20_paper_determination: v })}
          required
          helperText="If you select 'Yes', the court may decide the case on the papers without requiring you to attend a hearing (this can be faster)."
          sectionId={SECTION_ID}
        />
      </div>
    </div>
  );
};

export default Section21ComplianceSection;
