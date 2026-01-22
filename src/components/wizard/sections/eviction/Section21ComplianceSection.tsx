/**
 * Section 21 Compliance Section - Eviction Wizard
 *
 * Step 6 (Section 21 only): Collects compliance requirements for no-fault eviction.
 *
 * CRITICAL: All of these are BLOCKERS for Section 21. If any are not met,
 * Section 21 cannot be used.
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
 * - gas_safety_cert_served: Was gas safety cert provided? (if gas appliances)
 * - has_gas_appliances: Does property have gas?
 * - epc_served: Was EPC provided?
 * - how_to_rent_served: Was How to Rent guide provided?
 * - licensing_required: Does property need licensing?
 * - has_valid_licence: Is it licensed (if required)?
 */

'use client';

import React from 'react';
import type { WizardFacts } from '@/lib/case-facts/schema';
import {
  ValidatedInput,
  ValidatedSelect,
  ValidatedCurrencyInput,
  ValidatedYesNoToggle,
} from '@/components/wizard/ValidatedField';

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

  return (
    <div className="space-y-8">
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <h4 className="text-sm font-medium text-amber-900 mb-1">
          Section 21 Validity Requirements
        </h4>
        <p className="text-sm text-amber-800">
          Section 21 notices can only be served if ALL compliance requirements are met.
          Failure to comply with any requirement makes the notice INVALID.
        </p>
      </div>

      {/* Deposit Questions */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
          Deposit Protection
        </h3>

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
            {/* Deposit amount */}
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
              helperText="Must be protected within 30 days of receipt."
              blockingMessage="Section 21 cannot be used if deposit is not protected."
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
              helperText="You must provide the tenant with prescribed information about the deposit protection."
              blockingMessage="Section 21 cannot be used if prescribed information was not served."
              sectionId={SECTION_ID}
            />

            {/* N5B Q13: Deposit Returned */}
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
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
          Gas Safety
        </h3>

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
              helperText="A copy of the current CP12 must be provided annually."
              blockingMessage="Section 21 cannot be used if gas safety certificate was not provided."
              sectionId={SECTION_ID}
            />

            {facts.gas_safety_cert_served === true && (
              <div className="space-y-4">
                <ValidatedYesNoToggle
                  id="gas_safety_before_occupation"
                  label="Was the gas safety check done before the tenant moved in?"
                  value={facts.gas_safety_before_occupation}
                  onChange={(v) => onUpdate({ gas_safety_before_occupation: v })}
                  helperText="N5B Q16(a): Select 'Yes' if the check was done before occupation began."
                  sectionId={SECTION_ID}
                />

                {facts.gas_safety_before_occupation === true && (
                  <ValidatedInput
                    id="gas_safety_before_occupation_date"
                    label="Date of gas safety check before occupation"
                    type="date"
                    value={facts.gas_safety_before_occupation_date as string}
                    onChange={(v) => onUpdate({ gas_safety_before_occupation_date: v })}
                    helperText="N5B Q16(a): Date the gas safety check was carried out before tenant moved in."
                    sectionId={SECTION_ID}
                    className="max-w-xs"
                  />
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
                    helperText="N5B Q17(a): Date on the CP12 certificate."
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
                    helperText="N5B Q17(b): Date you provided the certificate to the tenant."
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
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
          Energy Performance Certificate
        </h3>

        <ValidatedYesNoToggle
          id="epc_served"
          label="Was an EPC provided to the tenant before the tenancy started?"
          value={facts.epc_served}
          onChange={(v) => onUpdate({ epc_served: v })}
          required
          helperText="The property must have a valid EPC with a rating of E or above."
          blockingMessage="Section 21 cannot be used if EPC was not provided."
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
              helperText="The date you gave the tenant a copy of the EPC (N5B Q15)."
              sectionId={SECTION_ID}
              className="max-w-xs"
            />
          </div>
        )}
      </div>

      {/* How to Rent */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
          How to Rent Guide
        </h3>

        <ValidatedYesNoToggle
          id="how_to_rent_served"
          label="Was the 'How to Rent' guide provided?"
          value={facts.how_to_rent_served}
          onChange={(v) => onUpdate({ how_to_rent_served: v })}
          required
          helperText="Required for tenancies starting on or after 1 October 2015."
          blockingMessage="Section 21 cannot be used if 'How to Rent' guide was not provided."
          sectionId={SECTION_ID}
        />

        {facts.how_to_rent_served === true && (
          <div className="pl-4 border-l-2 border-purple-200 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ValidatedInput
                id="how_to_rent_date"
                label="Date 'How to Rent' was provided"
                type="date"
                value={facts.how_to_rent_date as string}
                onChange={(v) => onUpdate({ how_to_rent_date: v })}
                validation={{ required: true }}
                required
                helperText="N5B Q18(c): The date you provided the guide to the tenant."
                sectionId={SECTION_ID}
              />

              <ValidatedSelect
                id="how_to_rent_method"
                label="How was it provided?"
                value={facts.how_to_rent_method as string}
                onChange={(v) => onUpdate({ how_to_rent_method: v })}
                options={HOW_TO_RENT_METHOD_OPTIONS}
                validation={{ required: true }}
                required
                helperText="N5B Q18(d): Method used to provide the guide."
                sectionId={SECTION_ID}
              />
            </div>
          </div>
        )}
      </div>

      {/* Licensing */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
          Property Licensing
        </h3>

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
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
          Retaliatory Eviction
        </h3>

        <ValidatedYesNoToggle
          id="no_retaliatory_notice"
          label="Is this notice being served more than 6 months after any repair complaint?"
          value={facts.no_retaliatory_notice}
          onChange={(v) => onUpdate({ no_retaliatory_notice: v })}
          required
          helperText="Section 21 notices served within 6 months of a repair complaint may be deemed retaliatory and invalid."
          blockingMessage="This may be considered a retaliatory eviction. Consider waiting or using Section 8."
          sectionId={SECTION_ID}
        />
      </div>

      {/* N5B Accelerated Possession - AST Verification (Q9a-Q9g) */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
          N5B Accelerated Possession - AST Verification
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          These questions verify the tenancy qualifies as an Assured Shorthold Tenancy (AST) for accelerated possession proceedings.
          For Q9(a), &apos;Yes&apos; is required. For Q9(b)–Q9(g), &apos;No&apos; is the compliant answer.
        </p>

        <div className="space-y-3">
          <ValidatedYesNoToggle
            id="n5b_q9a_after_feb_1997"
            label="Q9(a): Was the tenancy created on or after 28 February 1997?"
            value={facts.n5b_q9a_after_feb_1997}
            onChange={(v) => onUpdate({ n5b_q9a_after_feb_1997: v })}
            required
            helperText="Tenancies created on or after this date are automatically ASTs unless excluded."
            blockingMessage="Section 21 accelerated possession requires a tenancy created on or after 28 February 1997."
            sectionId={SECTION_ID}
          />

          <ValidatedYesNoToggle
            id="n5b_q9b_notice_not_ast"
            label="Q9(b): Has the landlord served notice that the tenancy is not an AST?"
            value={facts.n5b_q9b_notice_not_ast}
            onChange={(v) => onUpdate({ n5b_q9b_notice_not_ast: v })}
            required
            helperText="If the landlord gave written notice before the tenancy started that it would not be an AST, select 'Yes'."
            blockingMessage="Section 21 cannot be used if notice was given that the tenancy is not an AST."
            blockOnTrue
            sectionId={SECTION_ID}
          />

          <ValidatedYesNoToggle
            id="n5b_q9c_excludes_ast"
            label="Q9(c): Does the tenancy agreement state that it is not an AST?"
            value={facts.n5b_q9c_excludes_ast}
            onChange={(v) => onUpdate({ n5b_q9c_excludes_ast: v })}
            required
            helperText="Check if the tenancy agreement contains a clause stating it is not an assured shorthold tenancy."
            blockingMessage="Section 21 cannot be used if the agreement excludes AST provisions."
            blockOnTrue
            sectionId={SECTION_ID}
          />

          <ValidatedYesNoToggle
            id="n5b_q9d_is_agricultural_worker"
            label="Q9(d): Is the tenant an agricultural worker?"
            value={facts.n5b_q9d_is_agricultural_worker}
            onChange={(v) => onUpdate({ n5b_q9d_is_agricultural_worker: v })}
            required
            helperText="Agricultural workers have special housing protections and their tenancies may not be ASTs."
            blockingMessage="Section 21 cannot be used for agricultural worker tenancies."
            blockOnTrue
            sectionId={SECTION_ID}
          />

          <ValidatedYesNoToggle
            id="n5b_q9e_is_succession"
            label="Q9(e): Did the tenancy arise by succession (on death of previous tenant)?"
            value={facts.n5b_q9e_is_succession}
            onChange={(v) => onUpdate({ n5b_q9e_is_succession: v })}
            required
            helperText="Succession tenancies inherited from a deceased tenant may have protected status."
            blockingMessage="Section 21 cannot be used for succession tenancies."
            blockOnTrue
            sectionId={SECTION_ID}
          />

          <ValidatedYesNoToggle
            id="n5b_q9f_was_secure"
            label="Q9(f): Was the tenancy previously a secure tenancy?"
            value={facts.n5b_q9f_was_secure}
            onChange={(v) => onUpdate({ n5b_q9f_was_secure: v })}
            required
            helperText="Tenancies transferred from local authority or housing association secure tenancies may retain their status."
            blockingMessage="Section 21 cannot be used for former secure tenancies."
            blockOnTrue
            sectionId={SECTION_ID}
          />

          <ValidatedYesNoToggle
            id="n5b_q9g_schedule_10_applies"
            label="Q9(g): Was the tenancy granted under Schedule 10 LGHA 1989?"
            value={facts.n5b_q9g_schedule_10_applies}
            onChange={(v) => onUpdate({ n5b_q9g_schedule_10_applies: v })}
            required
            helperText="Schedule 10 of the Local Government and Housing Act 1989 relates to certain long residential tenancies."
            blockingMessage="Section 21 cannot be used for tenancies granted under Schedule 10."
            blockOnTrue
            sectionId={SECTION_ID}
          />
        </div>
      </div>

      {/* Tenant Fees Act 2019 (Q19) */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
          Tenant Fees Act 2019
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          The Tenant Fees Act 2019 prohibits landlords from charging certain fees or requiring prohibited payments.
        </p>

        <ValidatedYesNoToggle
          id="n5b_q19_prohibited_payment"
          label="Q19: Has the landlord taken any prohibited payment under the Tenant Fees Act 2019 that has NOT been repaid?"
          value={facts.n5b_q19_prohibited_payment}
          onChange={(v) => onUpdate({ n5b_q19_prohibited_payment: v })}
          required
          helperText="Prohibited payments include admin fees, viewing fees, checkout fees, etc. collected on or after 1 June 2019. If such a payment was taken but has been fully repaid, select 'No'."
          blockingMessage="Section 21 cannot be used if a prohibited payment has been taken and not repaid."
          blockOnTrue
          sectionId={SECTION_ID}
        />

        <ValidatedYesNoToggle
          id="n5b_q19b_holding_deposit"
          label="Q19(b): Was a holding deposit taken?"
          value={facts.n5b_q19b_holding_deposit === 'yes' || facts.n5b_q19b_holding_deposit === true}
          onChange={(v) => onUpdate({ n5b_q19b_holding_deposit: v })}
          helperText="A holding deposit (max one week's rent) to reserve the property. This is allowed and does not block Section 21."
          sectionId={SECTION_ID}
        />
      </div>

      {/* Paper Determination Consent (Q20) */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
          Paper Determination Consent
        </h3>

        <ValidatedYesNoToggle
          id="n5b_q20_paper_determination"
          label="Q20: Do you consent to the court making a possession order without a hearing?"
          value={facts.n5b_q20_paper_determination}
          onChange={(v) => onUpdate({ n5b_q20_paper_determination: v })}
          required
          helperText="If you select 'Yes', the court may decide the case on the papers without requiring you to attend a hearing. This can speed up the process if the case is straightforward."
          sectionId={SECTION_ID}
        />
      </div>
    </div>
  );
};

export default Section21ComplianceSection;
