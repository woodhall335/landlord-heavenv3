'use client';

import React, { useMemo } from 'react';
import type { WizardFacts } from '@/lib/case-facts/schema';
import { RiCheckboxCircleLine, RiFileTextLine, RiInformationLine } from 'react-icons/ri';
import { buildEnglandEvictionChronology } from '@/lib/england-possession/chronology';

interface EvidenceSectionProps {
  facts: WizardFacts;
  jurisdiction: 'england' | 'wales';
  caseId: string;
  onUpdate: (updates: Record<string, any>) => void | Promise<void>;
}

const RESPONSIVENESS_OPTIONS = [
  { value: 'not_responding', label: 'The tenant is not responding' },
  { value: 'intermittent', label: 'The tenant replies intermittently' },
  { value: 'engaging_but_not_paying', label: 'The tenant is engaging but not paying' },
  { value: 'disputing', label: 'The tenant is disputing the arrears or the notice' },
];

interface BooleanQuestionProps {
  label: string;
  help: string;
  value: boolean | undefined;
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

export const EvidenceSection: React.FC<EvidenceSectionProps> = ({
  facts,
  onUpdate,
}) => {
  const evidence = facts.evidence || {};
  const communicationTimeline = facts.communication_timeline || {};
  const epcProvided = facts.epc_served ?? facts.epc_provided;
  const howToRentProvided = facts.how_to_rent_served ?? facts.how_to_rent_provided;
  const hasGasAppliances = facts.has_gas_appliances;
  const gasSafetyProvided = facts.gas_safety_cert_served ?? facts.gas_safety_cert_provided;
  const generatedChronology = useMemo(
    () => buildEnglandEvictionChronology(facts as Record<string, any>),
    [facts],
  );

  const mergeEvidence = async (patch: Record<string, any>) => {
    await onUpdate({
      evidence: {
        ...evidence,
        ...patch,
      },
    });
  };

  const mergeTimeline = async (patch: Record<string, any>) => {
    await onUpdate({
      communication_timeline: {
        ...communicationTimeline,
        ...patch,
      },
    });
  };

  const availabilityChecks = [
    {
      key: 'tenancy_agreement_uploaded',
      label: 'Tenancy agreement or written tenancy terms available',
      help: 'Confirm you have the tenancy agreement or other written terms available if the court asks for them.',
    },
    {
      key: 'rent_schedule_uploaded',
      label: 'Rent record or arrears schedule available',
      help: 'Confirm you can produce a clear arrears schedule or payment record outside the generated pack.',
    },
    {
      key: 'bank_statements_uploaded',
      label: 'Bank statement support available if needed',
      help: 'Helpful where the payment history may need bank evidence behind it.',
    },
    {
      key: 'correspondence_uploaded',
      label: 'Email, text, or letter history available',
      help: 'Useful if the court needs to see payment requests, replies, or notice-related messages.',
    },
    {
      key: 'other_evidence_uploaded',
      label: 'Any other supporting records are noted',
      help: 'Use this if you hold photos, reports, inspection records, or other supporting material outside the pack.',
    },
  ] as const;

  const coreQuestionsComplete =
    Boolean(evidence.notice_service_description) &&
    communicationTimeline.total_attempts !== undefined &&
    communicationTimeline.total_attempts !== null &&
    Boolean(communicationTimeline.tenant_responsiveness);
  const depositTaken = facts.deposit_taken === true;
  const depositQuestionsComplete =
    facts.deposit_taken !== undefined &&
    (!depositTaken ||
      (facts.deposit_protected !== undefined &&
        facts.deposit_protected_within_30_days !== undefined &&
        facts.prescribed_info_served !== undefined &&
        facts.deposit_returned !== undefined));
  const propertyComplianceQuestionsComplete =
    epcProvided !== undefined &&
    howToRentProvided !== undefined &&
    hasGasAppliances !== undefined &&
    (hasGasAppliances !== true || gasSafetyProvided !== undefined);
  const complianceQuestionsComplete =
    facts.section_16e_duties_checked !== undefined &&
    facts.breathing_space_checked !== undefined &&
    (facts.breathing_space_checked !== true || facts.tenant_in_breathing_space !== undefined) &&
    facts.evidence_bundle_ready !== undefined;

  return (
    <div className="space-y-6">
      <section className="rounded-[1.6rem] border border-[#e7dbff] bg-white px-5 py-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-[#f4ecff] p-2 text-[#7C3AED]">
            <RiFileTextLine className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-[#20103f]">
              Court file readiness
            </h3>
            <p className="mt-2 text-sm leading-6 text-[#62597c]">
              We generate the landlord-authored notice, court forms, and filing paperwork from
              your answers. This step records the key facts and confirms what landlord-held records
              exist, without asking you to upload documents into the product.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[1.6rem] border border-[#e7dbff] bg-white px-5 py-5 shadow-sm">
        <h4 className="text-base font-semibold text-[#20103f]">Service and chronology details</h4>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-[#27134a]">
              How can you prove service of the notice?
            </span>
            <textarea
              value={evidence.notice_service_description || ''}
              onChange={(e) => void mergeEvidence({ notice_service_description: e.target.value })}
              rows={4}
              className="mt-2 w-full rounded-2xl border border-[#dccbff] bg-[#fcfbff] px-4 py-3 text-sm text-[#221342] outline-none transition focus:border-[#7C3AED]"
              placeholder="For example: first-class post with certificate of posting, hand delivery witness, email service clause, process server, or a mix of service methods."
            />
          </label>

          <div className="space-y-4">
            {generatedChronology.paragraphs.length > 0 && (
              <div className="rounded-2xl border border-[#e4d8ff] bg-[#faf7ff] px-4 py-4">
                <p className="text-sm font-semibold text-[#27134a]">Generated chronology preview</p>
                <div className="mt-2 space-y-2 text-sm leading-6 text-[#62597c]">
                  {generatedChronology.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </div>
            )}

            <label className="block">
              <span className="text-sm font-medium text-[#27134a]">
                Additional chronology or breach detail
              </span>
              <textarea
                value={communicationTimeline.log || ''}
                onChange={(e) => void mergeTimeline({ log: e.target.value })}
                rows={4}
                className="mt-2 w-full rounded-2xl border border-[#dccbff] bg-[#fcfbff] px-4 py-3 text-sm text-[#221342] outline-none transition focus:border-[#7C3AED]"
                placeholder="Add anything the generated chronology should not miss, such as a disputed breach, a promise to pay, a refused inspection, or another key incident."
              />
              <p className="mt-2 text-xs leading-5 text-[#7a7195]">
                We build the main chronology from your arrears schedule, notice dates, and contact history. Use this box only for extra incident detail or anything unusual the court file should explain.
              </p>
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-medium text-[#27134a]">How many payment-chase or contact attempts have you made?</span>
            <input
              type="number"
              min={0}
              value={communicationTimeline.total_attempts ?? ''}
              onChange={(e) =>
                void mergeTimeline({
                  total_attempts: e.target.value === '' ? null : Number(e.target.value),
                })
              }
              className="mt-2 w-full rounded-2xl border border-[#dccbff] bg-[#fcfbff] px-4 py-3 text-sm text-[#221342] outline-none transition focus:border-[#7C3AED]"
              placeholder="0"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-[#27134a]">How would you describe the tenant's response?</span>
            <select
              value={communicationTimeline.tenant_responsiveness || ''}
              onChange={(e) => void mergeTimeline({ tenant_responsiveness: e.target.value || null })}
              className="mt-2 w-full rounded-2xl border border-[#dccbff] bg-[#fcfbff] px-4 py-3 text-sm text-[#221342] outline-none transition focus:border-[#7C3AED]"
            >
              <option value="">Select one</option>
              {RESPONSIVENESS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="rounded-[1.6rem] border border-[#e7dbff] bg-white px-5 py-5 shadow-sm">
        <div className="flex items-start gap-3">
          <RiInformationLine className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#7C3AED]" />
          <div>
            <h4 className="text-base font-semibold text-[#20103f]">Property compliance record</h4>
            <p className="mt-1 text-sm leading-6 text-[#62597c]">
              These questions capture the wider tenancy-compliance position for the court file. For a Form 3A route they are not all statutory blockers in the same way they are for Section 21, but they still matter for risk, court credibility, and the evidence story.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3">
          <BooleanQuestion
            label="Was an EPC given for the tenancy?"
            help="Record whether the landlord can confirm an Energy Performance Certificate was provided for the let."
            value={epcProvided}
            onChange={(value) => onUpdate({ epc_served: value, epc_provided: value })}
          />

          <BooleanQuestion
            label="Was the How to Rent guide given?"
            help="Record whether the tenant received the How to Rent guide. This is especially important context if the wider compliance history may be questioned later."
            value={howToRentProvided}
            onChange={(value) => onUpdate({ how_to_rent_served: value, how_to_rent_provided: value })}
          />

          <BooleanQuestion
            label="Does the property have gas appliances that trigger gas safety requirements?"
            help="Answer this first so the pack knows whether a gas-safety confirmation is relevant to the file."
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
        <div className="flex items-start gap-3">
          <RiInformationLine className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#7C3AED]" />
          <div>
            <h4 className="text-base font-semibold text-[#20103f]">Landlord-held records confirmation</h4>
            <p className="mt-1 text-sm leading-6 text-[#62597c]">
              These confirmations do not upload or generate third-party records. They simply tell the pack what
              evidence exists outside the platform, so the generated checklists and court guidance stay accurate.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3">
          {availabilityChecks.map((item) => {
            const checked = Boolean((evidence as any)[item.key]);

            return (
              <label
                key={item.key}
                className="flex items-start gap-3 rounded-2xl border border-[#ece4ff] bg-[#faf7ff] px-4 py-4"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) =>
                    void mergeEvidence({
                      [item.key]: e.target.checked,
                    })
                  }
                  className="mt-1 h-4 w-4 rounded border-[#cbb5ff] text-[#7C3AED] focus:ring-[#7C3AED]"
                />
                <div>
                  <p className="text-sm font-semibold text-[#27134a]">{item.label}</p>
                  <p className="mt-1 text-sm leading-6 text-[#62597c]">{item.help}</p>
                </div>
              </label>
            );
          })}
        </div>

        <label className="mt-5 flex items-start gap-3 rounded-2xl border border-[#ece4ff] bg-white px-4 py-4">
          <input
            type="checkbox"
            checked={Boolean(facts.evidence_reviewed)}
            onChange={(e) => void onUpdate({ evidence_reviewed: e.target.checked })}
            className="mt-1 h-4 w-4 rounded border-[#cbb5ff] text-[#7C3AED] focus:ring-[#7C3AED]"
          />
          <div>
            <p className="text-sm font-semibold text-[#27134a]">
              I have reviewed which landlord-held records are available for this claim.
            </p>
            <p className="mt-1 text-sm leading-6 text-[#62597c]">
              This confirms the generated checklist can refer to what exists outside the platform,
              even where some records will need to be gathered separately later.
            </p>
          </div>
        </label>
      </section>

      <section className="rounded-[1.6rem] border border-[#e7dbff] bg-white px-5 py-5 shadow-sm">
        <div className="flex items-start gap-3">
          <RiInformationLine className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#7C3AED]" />
          <div>
            <h4 className="text-base font-semibold text-[#20103f]">England compliance confirmations</h4>
            <p className="mt-1 text-sm leading-6 text-[#62597c]">
              These confirmations cover the checks that can stop a Form 3A route or possession file from being court-ready.
              Answer them now so the pack can warn you early instead of leaving the issue until generation.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3">
          <BooleanQuestion
            label="Did this tenancy involve a deposit?"
            help="We use this to decide whether deposit-protection compliance needs to be checked for the selected grounds."
            value={facts.deposit_taken}
            onChange={(value) => onUpdate({ deposit_taken: value })}
          />

          {depositTaken && (
            <>
              <BooleanQuestion
                label="Is the deposit protected in an approved scheme?"
                help="If the deposit issue has not been cured, some Form 3A grounds should not be treated as ready for possession proceedings."
                value={facts.deposit_protected}
                onChange={(value) => onUpdate({ deposit_protected: value })}
              />
              <BooleanQuestion
                label="Was the deposit protected within 30 days of receipt?"
                help="This helps the pack flag whether late protection still needs to be cured before you rely on the selected grounds."
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
                help="Use this if the deposit issue has already been cured outside the tenancy so the court file can explain that position clearly."
                value={facts.deposit_returned}
                onChange={(value) => onUpdate({ deposit_returned: value })}
              />
            </>
          )}

          <BooleanQuestion
            label="Have you checked the section 16E landlord duties before serving or filing?"
            help="This confirms you have reviewed the current England landlord-duty checks that must be satisfied before the possession route is relied on."
            value={facts.section_16e_duties_checked}
            onChange={(value) => onUpdate({ section_16e_duties_checked: value })}
            yesLabel="Yes, checked"
            noLabel="No, not yet"
          />

          <BooleanQuestion
            label="Have you checked whether the tenant is in a Debt Respite Scheme breathing space?"
            help="You should not treat the pack as ready until this check has been done."
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
              help="If the answer is yes, the possession route should be paused until that restriction has been dealt with."
              value={facts.tenant_in_breathing_space}
              onChange={(value) => onUpdate({ tenant_in_breathing_space: value })}
              yesLabel="Yes, active"
              noLabel="No, not active"
            />
          )}

          <BooleanQuestion
            label="Is the landlord-held evidence bundle ready to support the selected grounds?"
            help="This should be yes only if the records you would need outside the generated pack are identified and available."
            value={facts.evidence_bundle_ready}
            onChange={(value) => onUpdate({ evidence_bundle_ready: value })}
            yesLabel="Yes, ready"
            noLabel="No, still incomplete"
          />
        </div>
      </section>

      <section
        className={`rounded-[1.6rem] border px-5 py-5 shadow-sm ${
          coreQuestionsComplete &&
          facts.evidence_reviewed &&
          depositQuestionsComplete &&
          propertyComplianceQuestionsComplete &&
          complianceQuestionsComplete
            ? 'border-emerald-200 bg-emerald-50'
            : 'border-amber-200 bg-amber-50'
        }`}
      >
        <div className="flex items-start gap-3">
          <RiCheckboxCircleLine
            className={`mt-0.5 h-5 w-5 flex-shrink-0 ${
              coreQuestionsComplete && facts.evidence_reviewed
                ? 'text-emerald-600'
                : 'text-amber-600'
            }`}
          />
          <div>
            <h4 className="text-base font-semibold text-[#20103f]">What happens next</h4>
            <p className="mt-1 text-sm leading-6 text-[#62597c]">
              Landlord Heaven will generate the landlord-authored eviction pack from your answers. If the court later
              needs EPCs, gas safety records, tenancy agreements, or other external records, the generated checklist and
              filing guidance will prompt you to supply those separately.
            </p>
            {(!depositQuestionsComplete || !propertyComplianceQuestionsComplete || !complianceQuestionsComplete) && (
              <p className="mt-3 text-sm leading-6 text-[#8a5a00]">
                Finish the deposit, property-compliance, and court-readiness confirmations above so the pack can show whether the claim is genuinely court-ready.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
