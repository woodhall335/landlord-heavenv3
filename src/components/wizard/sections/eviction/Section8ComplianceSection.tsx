'use client';

import React from 'react';
import type { WizardFacts } from '@/lib/case-facts/schema';
import { RiInformationLine } from 'react-icons/ri';
import {
  getDefenceRiskValue,
  mergeDefenceRiskUpdate,
  normalizeDefenceRiskList,
  stringifyDefenceRiskList,
} from '@/lib/england-possession/defence-risk';

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
  const riskFacts = (((facts as any).risk || {}) as Record<string, any>);
  const depositTaken = facts.deposit_taken === true;
  const epcProvided = facts.epc_served ?? facts.epc_provided;
  const howToRentProvided = facts.how_to_rent_served ?? facts.how_to_rent_provided;
  const hasGasAppliances = facts.has_gas_appliances;
  const gasSafetyProvided = facts.gas_safety_cert_served ?? facts.gas_safety_cert_provided;
  const selectedGrounds = (facts.section8_grounds as string[]) || [];
  const hasArrearsGround = selectedGrounds.some((ground) =>
    ['Ground 8', 'Ground 10', 'Ground 11'].some((arrearsGround) => ground.includes(arrearsGround))
  );
  const tenantDisputesClaim = getDefenceRiskValue<boolean | null>(facts as any, 'tenant_disputes_claim');
  const knownTenantDefences = String(getDefenceRiskValue(facts as any, 'known_tenant_defences') || '');
  const disrepairComplaints = getDefenceRiskValue<boolean | null>(facts as any, 'disrepair_complaints');
  const disrepairComplaintDate = String(getDefenceRiskValue(facts as any, 'disrepair_complaint_date') || '');
  const disrepairIssuesList = String(getDefenceRiskValue(facts as any, 'disrepair_issues_list') || '');
  const previousCourtProceedings = getDefenceRiskValue<boolean | null>(facts as any, 'previous_court_proceedings');
  const previousProceedingsDetails = String(getDefenceRiskValue(facts as any, 'previous_proceedings_details') || '');
  const tenantVulnerability = getDefenceRiskValue<boolean | null>(facts as any, 'tenant_vulnerability');
  const tenantVulnerabilityDetails = String(getDefenceRiskValue(facts as any, 'tenant_vulnerability_details') || '');
  const tenantCounterclaimLikely = getDefenceRiskValue<boolean | null>(facts as any, 'tenant_counterclaim_likely');
  const counterclaimGrounds = stringifyDefenceRiskList(getDefenceRiskValue(facts as any, 'counterclaim_grounds'));
  const paymentPlanOffered = getDefenceRiskValue<boolean | null>(facts as any, 'payment_plan_offered');
  const paymentPlanResponse = String(getDefenceRiskValue(facts as any, 'payment_plan_response') || '');
  const benefitType = String((facts as any).benefit_type || '');
  const tenantBenefitsDetails = String((facts as any).tenant_benefits_details || '');

  const updateRisk = async (patch: Record<string, any>) => {
    await onUpdate(mergeDefenceRiskUpdate({ ...facts, risk: riskFacts }, patch));
  };

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

      <section className="rounded-[1.6rem] border border-[#e7dbff] bg-white px-5 py-5 shadow-sm">
        <h4 className="text-base font-semibold text-[#20103f]">Tenant response and defence risks</h4>
        <p className="mt-2 text-sm leading-6 text-[#62597c]">
          Record anything the pack should answer proactively if the tenant disputes the notice, raises disrepair, points to benefit delays, or threatens a counterclaim.
        </p>
        <div className="mt-4 grid gap-3">
          <BooleanQuestion
            label="Has the tenant already disputed the arrears, the notice, or the possession route?"
            help="Answer yes if the tenant has already raised a reason why they say possession should not proceed."
            value={tenantDisputesClaim}
            onChange={(value) => updateRisk({ tenant_disputes_claim: value })}
            yesLabel="Yes, disputed"
            noLabel="No dispute raised"
          />

          {tenantDisputesClaim === true && (
            <label className="block rounded-2xl border border-[#ece4ff] bg-[#faf7ff] px-4 py-4">
              <span className="text-sm font-medium text-[#27134a]">Known tenant defence or dispute points</span>
              <textarea
                value={knownTenantDefences}
                onChange={(e) => void updateRisk({ known_tenant_defences: e.target.value })}
                rows={4}
                className="mt-2 w-full rounded-2xl border border-[#dccbff] bg-[#fcfbff] px-4 py-3 text-sm text-[#221342] outline-none transition focus:border-[#7C3AED]"
                placeholder="For example: says arrears are caused by UC delay, says the notice date is wrong, disputes the rent figure, says the landlord ignored repair complaints."
              />
            </label>
          )}

          <BooleanQuestion
            label="Has the tenant made any disrepair complaint that could be raised against the claim?"
            help="Record repair complaints that may turn into set-off, disrepair, or counterclaim arguments."
            value={disrepairComplaints}
            onChange={(value) => updateRisk({ disrepair_complaints: value })}
            yesLabel="Yes, complaints made"
            noLabel="No disrepair issue known"
          />

          {disrepairComplaints === true && (
            <div className="grid gap-3 rounded-2xl border border-[#ece4ff] bg-[#faf7ff] px-4 py-4">
              <label className="block">
                <span className="text-sm font-medium text-[#27134a]">When was the complaint raised?</span>
                <input
                  type="date"
                  value={disrepairComplaintDate}
                  onChange={(e) => void updateRisk({ disrepair_complaint_date: e.target.value })}
                  className="mt-2 w-full rounded-2xl border border-[#dccbff] bg-[#fcfbff] px-4 py-3 text-sm text-[#221342] outline-none transition focus:border-[#7C3AED]"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-[#27134a]">What issues are being raised?</span>
                <textarea
                  value={disrepairIssuesList}
                  onChange={(e) => void updateRisk({ disrepair_issues_list: e.target.value })}
                  rows={4}
                  className="mt-2 w-full rounded-2xl border border-[#dccbff] bg-[#fcfbff] px-4 py-3 text-sm text-[#221342] outline-none transition focus:border-[#7C3AED]"
                  placeholder="For example: mould in bedroom, boiler failures, leaking roof, unsafe electrics."
                />
              </label>
            </div>
          )}

          <BooleanQuestion
            label="Have there been previous court or tribunal proceedings relating to this tenancy?"
            help="Use this where there has already been litigation, a withdrawn claim, or another possession or money case tied to the same tenancy."
            value={previousCourtProceedings}
            onChange={(value) => updateRisk({ previous_court_proceedings: value })}
            yesLabel="Yes, previous proceedings"
            noLabel="No previous proceedings"
          />

          {previousCourtProceedings === true && (
            <label className="block rounded-2xl border border-[#ece4ff] bg-[#faf7ff] px-4 py-4">
              <span className="text-sm font-medium text-[#27134a]">Previous proceedings details</span>
              <textarea
                value={previousProceedingsDetails}
                onChange={(e) => void updateRisk({ previous_proceedings_details: e.target.value })}
                rows={4}
                className="mt-2 w-full rounded-2xl border border-[#dccbff] bg-[#fcfbff] px-4 py-3 text-sm text-[#221342] outline-none transition focus:border-[#7C3AED]"
                placeholder="For example: previous possession claim dismissed, money judgment already obtained, application stayed, or prior settlement terms."
              />
            </label>
          )}

          <BooleanQuestion
            label="Is there any vulnerability or personal circumstance the court is likely to hear about?"
            help="Record this where the landlord already knows the tenant is likely to rely on health, disability, safeguarding, or other significant personal circumstances."
            value={tenantVulnerability}
            onChange={(value) => updateRisk({ tenant_vulnerability: value })}
            yesLabel="Yes, known issue"
            noLabel="No known issue"
          />

          {tenantVulnerability === true && (
            <label className="block rounded-2xl border border-[#ece4ff] bg-[#faf7ff] px-4 py-4">
              <span className="text-sm font-medium text-[#27134a]">Vulnerability details</span>
              <textarea
                value={tenantVulnerabilityDetails}
                onChange={(e) => void updateRisk({ tenant_vulnerability_details: e.target.value })}
                rows={4}
                className="mt-2 w-full rounded-2xl border border-[#dccbff] bg-[#fcfbff] px-4 py-3 text-sm text-[#221342] outline-none transition focus:border-[#7C3AED]"
                placeholder="Record only what is already known and relevant to proportionality, timing, support needs, or likely hearing-stage arguments."
              />
            </label>
          )}

          <BooleanQuestion
            label="Is a tenant counterclaim or set-off likely?"
            help="Use this when the tenant is likely to plead disrepair, deposit issues, unlawful fees, or another monetary counterclaim."
            value={tenantCounterclaimLikely}
            onChange={(value) => updateRisk({ tenant_counterclaim_likely: value })}
            yesLabel="Yes, likely"
            noLabel="No counterclaim expected"
          />

          {tenantCounterclaimLikely === true && (
            <label className="block rounded-2xl border border-[#ece4ff] bg-[#faf7ff] px-4 py-4">
              <span className="text-sm font-medium text-[#27134a]">Counterclaim or set-off grounds</span>
              <textarea
                value={counterclaimGrounds}
                onChange={(e) =>
                  void updateRisk({
                    counterclaim_grounds: normalizeDefenceRiskList(e.target.value),
                  })
                }
                rows={4}
                className="mt-2 w-full rounded-2xl border border-[#dccbff] bg-[#fcfbff] px-4 py-3 text-sm text-[#221342] outline-none transition focus:border-[#7C3AED]"
                placeholder="Use one line per point, for example: disrepair set-off, deposit penalty, unlawful fee dispute."
              />
            </label>
          )}

          {hasArrearsGround && (
            <>
              <label className="block rounded-2xl border border-[#ece4ff] bg-[#faf7ff] px-4 py-4">
                <span className="text-sm font-medium text-[#27134a]">Benefit or Universal Credit arrears context</span>
                <input
                  type="text"
                  value={benefitType}
                  onChange={(e) => void onUpdate({ benefit_type: e.target.value })}
                  className="mt-2 w-full rounded-2xl border border-[#dccbff] bg-[#fcfbff] px-4 py-3 text-sm text-[#221342] outline-none transition focus:border-[#7C3AED]"
                  placeholder="For example: UC housing costs delay, Housing Benefit suspension, direct payment change."
                />
                <p className="mt-2 text-xs leading-5 text-[#7a7195]">
                  Use this only where the arrears story includes benefit delay, direct payment problems, or another benefits explanation the tenant may rely on.
                </p>
              </label>

              <label className="block rounded-2xl border border-[#ece4ff] bg-[#faf7ff] px-4 py-4">
                <span className="text-sm font-medium text-[#27134a]">Extra arrears context to answer likely defence points</span>
                <textarea
                  value={tenantBenefitsDetails}
                  onChange={(e) => void onUpdate({ tenant_benefits_details: e.target.value })}
                  rows={3}
                  className="mt-2 w-full rounded-2xl border border-[#dccbff] bg-[#fcfbff] px-4 py-3 text-sm text-[#221342] outline-none transition focus:border-[#7C3AED]"
                  placeholder="For example: landlord chased the tenant for payment while the UC issue was unresolved, payment plan was offered, or the tenant acknowledged the arrears despite the benefits issue."
                />
              </label>

              <BooleanQuestion
                label="Was a payment plan or arrears arrangement offered?"
                help="This helps the pack explain what the landlord did before moving to possession."
                value={paymentPlanOffered}
                onChange={(value) => updateRisk({ payment_plan_offered: value })}
                yesLabel="Yes, offered"
                noLabel="No plan offered"
              />

              {paymentPlanOffered === true && (
                <label className="block rounded-2xl border border-[#ece4ff] bg-[#faf7ff] px-4 py-4">
                  <span className="text-sm font-medium text-[#27134a]">What happened with that payment plan?</span>
                  <textarea
                    value={paymentPlanResponse}
                    onChange={(e) => void updateRisk({ payment_plan_response: e.target.value })}
                    rows={3}
                    className="mt-2 w-full rounded-2xl border border-[#dccbff] bg-[#fcfbff] px-4 py-3 text-sm text-[#221342] outline-none transition focus:border-[#7C3AED]"
                    placeholder="For example: plan ignored, plan agreed then broken, tenant refused, landlord allowed extra time, or partial compliance only."
                  />
                </label>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default Section8ComplianceSection;
