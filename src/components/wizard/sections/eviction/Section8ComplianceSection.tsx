'use client';

import React from 'react';
import type { WizardFacts } from '@/lib/case-facts/schema';
import { RiInformationLine } from 'react-icons/ri';

interface Section8ComplianceSectionProps {
  facts: WizardFacts;
  onUpdate: (updates: Record<string, any>) => void | Promise<void>;
}

interface BooleanQuestionProps {
  label: string;
  help: string;
  value: boolean | undefined | null;
  onChange: (value: boolean) => void | Promise<void>;
  yesLabel?: string;
  noLabel?: string;
}

const BooleanQuestion: React.FC<BooleanQuestionProps> = ({
  label,
  help,
  value,
  onChange,
  yesLabel = 'Yes',
  noLabel = 'No',
}) => (
  <div className="space-y-2 rounded-2xl border border-[#ece4ff] bg-[#faf7ff] px-4 py-4">
    <p className="text-sm font-semibold text-[#27134a]">{label}</p>
    <p className="text-sm leading-6 text-[#62597c]">{help}</p>
    <div className="flex flex-wrap gap-4 pt-1">
      <label className="flex items-center gap-2 text-sm text-[#27134a]">
        <input
          type="radio"
          checked={value === true}
          onChange={() => void onChange(true)}
          className="h-4 w-4 border-[#cbb5ff] text-[#7C3AED] focus:ring-[#7C3AED]"
        />
        {yesLabel}
      </label>
      <label className="flex items-center gap-2 text-sm text-[#27134a]">
        <input
          type="radio"
          checked={value === false}
          onChange={() => void onChange(false)}
          className="h-4 w-4 border-[#cbb5ff] text-[#7C3AED] focus:ring-[#7C3AED]"
        />
        {noLabel}
      </label>
    </div>
  </div>
);

export const Section8ComplianceSection: React.FC<Section8ComplianceSectionProps> = ({
  facts,
  onUpdate,
}) => {
  const depositTaken = facts.deposit_taken === true;
  const epcProvided = facts.epc_served ?? facts.epc_provided;
  const howToRentProvided = facts.how_to_rent_served ?? facts.how_to_rent_provided;
  const hasGasAppliances = facts.has_gas_appliances;
  const gasSafetyProvided = facts.gas_safety_cert_served ?? facts.gas_safety_cert_provided;

  return (
    <div className="space-y-6">
      <section className="rounded-[1.6rem] border border-[#e7dbff] bg-white px-5 py-5 shadow-sm">
        <div className="flex items-start gap-3">
          <RiInformationLine className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#7C3AED]" />
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-[#20103f]">Section 8 compliance record</h3>
            <p className="mt-2 text-sm leading-6 text-[#62597c]">
              This records the wider compliance position behind the Form 3A notice. Not every answer here blocks a Section 8 route in the same way it would a Section 21 route, but it does affect risk, evidence, and how defensible the file looks if the tenant pushes back.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[1.6rem] border border-[#e7dbff] bg-white px-5 py-5 shadow-sm">
        <h4 className="text-base font-semibold text-[#20103f]">Deposit and core landlord duties</h4>
        <div className="mt-4 grid gap-3">
          <BooleanQuestion
            label="Did this tenancy involve a deposit?"
            help="We use this to decide whether deposit-compliance questions need to be recorded for the selected grounds."
            value={facts.deposit_taken}
            onChange={(value) => onUpdate({ deposit_taken: value })}
          />

          {depositTaken && (
            <>
              <BooleanQuestion
                label="Is the deposit protected in an approved scheme?"
                help="If deposit compliance has not been cured, some grounds should not be treated as safely ready."
                value={facts.deposit_protected}
                onChange={(value) => onUpdate({ deposit_protected: value })}
              />
              <BooleanQuestion
                label="Was the deposit protected within 30 days of receipt?"
                help="This helps the notice route flag where late protection still needs to be cured or explained."
                value={facts.deposit_protected_within_30_days}
                onChange={(value) => onUpdate({ deposit_protected_within_30_days: value })}
              />
              <BooleanQuestion
                label="Was the prescribed information served?"
                help="Confirm whether the tenant received the required deposit prescribed information."
                value={facts.prescribed_info_served}
                onChange={(value) => onUpdate({ prescribed_info_served: value })}
              />
              <BooleanQuestion
                label="Has the deposit already been returned or otherwise fully resolved?"
                help="Use this if the deposit issue has already been cured outside the tenancy."
                value={facts.deposit_returned}
                onChange={(value) => onUpdate({ deposit_returned: value })}
              />
            </>
          )}

          <BooleanQuestion
            label="Have you checked the section 16E landlord duties?"
            help="Record whether the current England landlord-duty checks have been reviewed before relying on this Form 3A route."
            value={facts.section_16e_duties_checked}
            onChange={(value) => onUpdate({ section_16e_duties_checked: value })}
            yesLabel="Yes, checked"
            noLabel="No, not yet"
          />

          <BooleanQuestion
            label="Have you checked whether the tenant is in a Debt Respite Scheme breathing space?"
            help="The notice route should not be treated as safe until this check has been done."
            value={facts.breathing_space_checked}
            onChange={(value) =>
              onUpdate(
                value
                  ? { breathing_space_checked: true }
                  : { breathing_space_checked: false, tenant_in_breathing_space: undefined }
              )
            }
            yesLabel="Yes, checked"
            noLabel="No, not yet"
          />

          {facts.breathing_space_checked === true && (
            <BooleanQuestion
              label="Is the tenant currently in an active breathing space?"
              help="If the answer is yes, the notice route should be paused until that issue has been dealt with."
              value={facts.tenant_in_breathing_space}
              onChange={(value) => onUpdate({ tenant_in_breathing_space: value })}
              yesLabel="Yes, active"
              noLabel="No, not active"
            />
          )}
        </div>
      </section>

      <section className="rounded-[1.6rem] border border-[#e7dbff] bg-white px-5 py-5 shadow-sm">
        <h4 className="text-base font-semibold text-[#20103f]">Property compliance record</h4>
        <div className="mt-4 grid gap-3">
          <BooleanQuestion
            label="Was an EPC given for the tenancy?"
            help="Record whether the landlord can confirm an Energy Performance Certificate was provided for the let."
            value={epcProvided}
            onChange={(value) => onUpdate({ epc_served: value, epc_provided: value })}
          />

          <BooleanQuestion
            label="Was the How to Rent guide given?"
            help="Record whether the tenant received the How to Rent guide."
            value={howToRentProvided}
            onChange={(value) => onUpdate({ how_to_rent_served: value, how_to_rent_provided: value })}
          />

          <BooleanQuestion
            label="Does the property have gas appliances that trigger gas safety requirements?"
            help="Answer this first so the notice file knows whether a gas-safety confirmation is relevant."
            value={hasGasAppliances}
            onChange={(value) =>
              onUpdate(
                value
                  ? { has_gas_appliances: true }
                  : { has_gas_appliances: false, gas_safety_cert_served: undefined, gas_safety_cert_provided: undefined }
              )
            }
            yesLabel="Yes, has gas"
            noLabel="No gas appliances"
          />

          {hasGasAppliances === true && (
            <BooleanQuestion
              label="Was a valid gas safety certificate provided?"
              help="Record whether the landlord can confirm a valid gas safety certificate was given where the property has gas appliances."
              value={gasSafetyProvided}
              onChange={(value) => onUpdate({ gas_safety_cert_served: value, gas_safety_cert_provided: value })}
            />
          )}
        </div>
      </section>
    </div>
  );
};

export default Section8ComplianceSection;
