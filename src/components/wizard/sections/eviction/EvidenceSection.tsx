'use client';

import React, { useMemo } from 'react';
import type { WizardFacts } from '@/lib/case-facts/schema';
import { RiCheckboxCircleLine, RiFileTextLine } from 'react-icons/ri';
import { buildEnglandEvictionChronology } from '@/lib/england-possession/chronology';
import AskHeavenStepAutofill, { type AskHeavenStepDraftTarget } from '@/components/wizard/AskHeavenStepAutofill';
import {
  getDefenceRiskValue,
  mergeDefenceRiskUpdate,
  normalizeDefenceRiskList,
  stringifyDefenceRiskList,
} from '@/lib/england-possession/defence-risk';

interface EvidenceSectionProps {
  facts: WizardFacts;
  jurisdiction: 'england' | 'wales';
  caseId: string;
  onUpdate: (updates: Record<string, any>) => void | Promise<void>;
}

function EvidenceCheckpointCard({
  title,
  description,
  outputs,
}: {
  title: string;
  description: string;
  outputs: string[];
}) {
  return (
    <section className="rounded-[1.5rem] border border-[#e6dcff] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,243,255,0.94))] p-5 shadow-[0_14px_34px_rgba(76,29,149,0.06)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6f54c8]">Evidence checkpoint</p>
      <h3 className="mt-2 text-lg font-semibold tracking-tight text-[#20103f]">{title}</h3>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-[#60597a]">{description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {outputs.map((output) => (
          <span
            key={output}
            className="rounded-full border border-[#ddd0ff] bg-white px-3 py-1.5 text-xs font-semibold text-[#5b36b3] shadow-sm"
          >
            {output}
          </span>
        ))}
      </div>
    </section>
  );
}

function EvidenceStatusCard({
  label,
  value,
  tone = 'neutral',
}: {
  label: string;
  value: string;
  tone?: 'neutral' | 'success' | 'warning';
}) {
  const toneClasses =
    tone === 'success'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
      : tone === 'warning'
        ? 'border-amber-200 bg-amber-50 text-amber-900'
        : 'border-[#ece4ff] bg-[#faf7ff] text-[#20103f]';

  return (
    <div className={`rounded-2xl border px-4 py-3 shadow-sm ${toneClasses}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] opacity-80">{label}</p>
      <p className="mt-2 text-sm font-semibold">{value}</p>
    </div>
  );
}

function CollapsibleStepCard({
  stepLabel,
  title,
  description,
  defaultOpen = false,
  children,
}: {
  stepLabel: string;
  title: string;
  description: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details
      open={defaultOpen}
      className="group rounded-[1.6rem] border border-[#e7dbff] bg-white px-5 py-5 shadow-sm"
    >
      <summary className="list-none cursor-pointer">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6f54c8]">{stepLabel}</p>
            <h4 className="mt-2 text-base font-semibold text-[#20103f]">{title}</h4>
            <p className="mt-1 text-sm leading-6 text-[#62597c]">{description}</p>
          </div>
          <span className="mt-1 text-sm font-medium text-[#7650cd] transition group-open:rotate-180">⌄</span>
        </div>
      </summary>
      <div className="mt-4">{children}</div>
    </details>
  );
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

export const EvidenceSection: React.FC<EvidenceSectionProps> = ({
  facts,
  caseId,
  onUpdate,
}) => {
  const riskFacts = (((facts as any).risk || {}) as Record<string, any>);
  const evidence = facts.evidence || {};
  const communicationTimeline = facts.communication_timeline || {};
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

  const mergeRisk = async (patch: Record<string, any>) => {
    await onUpdate(mergeDefenceRiskUpdate({ ...facts, risk: riskFacts }, patch));
  };

  const evidenceDraftTargets = useMemo<AskHeavenStepDraftTarget[]>(() => {
    const propertyAddress = [
      facts.property_address_line1,
      facts.property_address_town,
      facts.property_address_postcode,
    ]
      .filter(Boolean)
      .join(', ');
    const chronologySummary = generatedChronology.timelineItems
      .slice(0, 6)
      .join('\n');

    return [
      {
        id: 'evidence.notice_service_description',
        currentValue: String(evidence.notice_service_description || ''),
        questionText: 'Describe how the notice was served and what proof exists',
        seedAnswer: [
          `Selected grounds: ${selectedGrounds.join(', ') || 'Section 8'}.`,
          facts.notice_served_date ? `Notice served date: ${facts.notice_served_date}.` : '',
          facts.notice_service_method ? `Service method: ${facts.notice_service_method}.` : '',
          propertyAddress ? `Property: ${propertyAddress}.` : '',
          'Draft a short factual description of how the notice was served and what proof of service exists.',
        ]
          .filter(Boolean)
          .join('\n'),
        apply: (text: string) => mergeEvidence({ notice_service_description: text }),
      },
      {
        id: 'communication_timeline.log',
        currentValue: String(communicationTimeline.log || ''),
        questionText: 'Add extra chronology details that should carry into the landlord pack',
        seedAnswer: [
          `Selected grounds: ${selectedGrounds.join(', ') || 'Section 8'}.`,
          chronologySummary ? `Generated chronology so far:\n${chronologySummary}` : '',
          'Draft a short chronology note that fills any obvious gaps without inventing new facts.',
        ]
          .filter(Boolean)
          .join('\n'),
        apply: (text: string) => mergeTimeline({ log: text }),
      },
      {
        id: 'risk.known_tenant_defences',
        currentValue: knownTenantDefences,
        questionText: "Record the tenant's known defence or dispute points",
        seedAnswer: [
          `Selected grounds: ${selectedGrounds.join(', ') || 'Section 8'}.`,
          tenantDisputesClaim === true ? 'The tenant is already disputing the claim.' : '',
          hasArrearsGround && tenantBenefitsDetails ? `Existing arrears context: ${tenantBenefitsDetails}` : '',
          'Draft a factual note of the defence or dispute points the landlord already knows about.',
        ]
          .filter(Boolean)
          .join('\n'),
        apply: (text: string) => mergeRisk({ known_tenant_defences: text }),
      },
      {
        id: 'risk.disrepair_issues_list',
        currentValue: disrepairIssuesList,
        questionText: 'Describe the disrepair complaints being raised',
        seedAnswer: [
          disrepairComplaints === true ? 'The tenant has raised disrepair complaints.' : '',
          disrepairComplaintDate ? `Complaint date: ${disrepairComplaintDate}.` : '',
          'Draft a factual summary of the repair issues being raised and keep it neutral.',
        ]
          .filter(Boolean)
          .join('\n'),
        apply: (text: string) => mergeRisk({ disrepair_issues_list: text }),
      },
      {
        id: 'risk.previous_proceedings_details',
        currentValue: previousProceedingsDetails,
        questionText: 'Describe any previous court proceedings linked to this tenancy',
        seedAnswer: [
          previousCourtProceedings === true ? 'There have been previous proceedings linked to this tenancy.' : '',
          'Draft a short factual summary of the earlier proceedings and their outcome, if known.',
        ]
          .filter(Boolean)
          .join('\n'),
        apply: (text: string) => mergeRisk({ previous_proceedings_details: text }),
      },
      {
        id: 'risk.tenant_vulnerability_details',
        currentValue: tenantVulnerabilityDetails,
        questionText: "Describe the tenant's known vulnerability context",
        seedAnswer: [
          tenantVulnerability === true ? 'The tenant has known vulnerability factors.' : '',
          'Draft a neutral note of the vulnerability context the landlord already knows about and why it may affect the case narrative.',
        ]
          .filter(Boolean)
          .join('\n'),
        apply: (text: string) => mergeRisk({ tenant_vulnerability_details: text }),
      },
      {
        id: 'risk.counterclaim_grounds',
        currentValue: counterclaimGrounds,
        questionText: 'Describe the likely counterclaim or set-off points',
        seedAnswer: [
          tenantCounterclaimLikely === true ? 'A counterclaim or set-off is thought to be likely.' : '',
          'Draft a short factual note of the likely counterclaim or set-off points the landlord expects the tenant to raise.',
        ]
          .filter(Boolean)
          .join('\n'),
        apply: (text: string) =>
          mergeRisk({
            counterclaim_grounds: normalizeDefenceRiskList(text),
          }),
      },
      {
        id: 'tenant_benefits_details',
        currentValue: tenantBenefitsDetails,
        questionText: 'Describe the benefit or Universal Credit context affecting the arrears story',
        seedAnswer: [
          benefitType ? `Benefit or UC context already noted: ${benefitType}.` : '',
          'Draft a factual arrears-context note explaining any benefits delay, UC issue, or similar point the landlord needs to answer.',
        ]
          .filter(Boolean)
          .join('\n'),
        apply: (text: string) => onUpdate({ tenant_benefits_details: text }),
      },
      {
        id: 'risk.payment_plan_response',
        currentValue: paymentPlanResponse,
        questionText: 'Describe what happened with the payment plan',
        seedAnswer: [
          paymentPlanOffered === true ? 'A payment plan was offered.' : '',
          'Draft a factual note of how the tenant responded to the payment plan and what happened next.',
        ]
          .filter(Boolean)
          .join('\n'),
        apply: (text: string) => mergeRisk({ payment_plan_response: text }),
      },
    ];
  }, [
    benefitType,
    communicationTimeline.log,
    counterclaimGrounds,
    disrepairComplaintDate,
    disrepairComplaints,
    disrepairIssuesList,
    evidence.notice_service_description,
    facts.notice_served_date,
    facts.notice_service_method,
    facts.property_address_line1,
    facts.property_address_postcode,
    facts.property_address_town,
    generatedChronology.timelineItems,
    hasArrearsGround,
    knownTenantDefences,
    onUpdate,
    paymentPlanOffered,
    paymentPlanResponse,
    previousCourtProceedings,
    previousProceedingsDetails,
    selectedGrounds,
    tenantBenefitsDetails,
    tenantCounterclaimLikely,
    tenantDisputesClaim,
    tenantVulnerability,
    tenantVulnerabilityDetails,
  ]);

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
  const readinessStatus = coreQuestionsComplete && facts.evidence_reviewed && depositQuestionsComplete && propertyComplianceQuestionsComplete && complianceQuestionsComplete;
  const propertyComplianceTouched =
    epcProvided !== undefined ||
    howToRentProvided !== undefined ||
    hasGasAppliances !== undefined ||
    gasSafetyProvided !== undefined;
  const recordsTouched =
    availabilityChecks.some((item) => Boolean((evidence as any)[item.key])) ||
    Boolean(facts.evidence_reviewed);
  const englandComplianceTouched =
    facts.deposit_taken !== undefined ||
    facts.deposit_protected !== undefined ||
    facts.deposit_protected_within_30_days !== undefined ||
    facts.prescribed_info_served !== undefined ||
    facts.deposit_returned !== undefined ||
    facts.section_16e_duties_checked !== undefined ||
    facts.breathing_space_checked !== undefined ||
    facts.tenant_in_breathing_space !== undefined ||
    facts.evidence_bundle_ready !== undefined;
  const defenceRiskTouched =
    tenantDisputesClaim !== undefined ||
    Boolean(knownTenantDefences.trim()) ||
    disrepairComplaints !== undefined ||
    previousCourtProceedings !== undefined ||
    tenantVulnerability !== undefined ||
    tenantCounterclaimLikely !== undefined ||
    paymentPlanOffered !== undefined ||
    Boolean(benefitType.trim()) ||
    Boolean(tenantBenefitsDetails.trim());

  return (
    <div className="space-y-6">
      <EvidenceCheckpointCard
        title="Pull together the evidence and chronology"
        description="Use this step to confirm service proof, the key chronology, and the supporting records you already have."
        outputs={['Evidence checklist', 'Witness statement', 'Case summary', 'Readiness warnings']}
      />

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <EvidenceStatusCard
          label="Chronology"
          value={generatedChronology.paragraphs.length > 0 ? 'Generated from case facts' : 'Waiting for more facts'}
          tone={generatedChronology.paragraphs.length > 0 ? 'success' : 'warning'}
        />
        <EvidenceStatusCard
          label="Core evidence step"
          value={coreQuestionsComplete ? 'Answered' : 'Still needs answers'}
          tone={coreQuestionsComplete ? 'success' : 'warning'}
        />
        <EvidenceStatusCard
          label="Compliance record"
          value={depositQuestionsComplete && propertyComplianceQuestionsComplete && complianceQuestionsComplete ? 'Recorded' : 'Still incomplete'}
          tone={depositQuestionsComplete && propertyComplianceQuestionsComplete && complianceQuestionsComplete ? 'success' : 'warning'}
        />
        <EvidenceStatusCard
          label="Pack readiness"
          value={readinessStatus ? 'Ready to review' : 'Needs more confirmations'}
          tone={readinessStatus ? 'success' : 'warning'}
        />
      </section>

      <section className="rounded-[1.6rem] border border-[#e7dbff] bg-white px-5 py-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-[#f4ecff] p-2 text-[#7C3AED]">
            <RiFileTextLine className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-[#20103f]">
              Pack readiness
            </h3>
            <p className="mt-2 text-sm leading-6 text-[#62597c]">
              We generate the notice, court forms, and supporting documents from
              your answers. This step confirms the key facts and the records you already hold,
              without asking you to upload anything here.
            </p>
          </div>
        </div>
      </section>

      <AskHeavenStepAutofill
        caseId={caseId}
        jurisdiction="england"
        product="complete_pack"
        buttonLabel="Draft my written sections"
        helperText="Ask Heaven will fill the blank writing boxes in this step using the chronology, service details, and defence-risk facts already in your case."
        emptyStateText="The writing boxes in this step already have content. You can still edit them manually if needed."
        targets={evidenceDraftTargets}
      />

      <section className="rounded-[1.6rem] border border-[#e7dbff] bg-white px-5 py-5 shadow-sm">
        <h4 className="text-base font-semibold text-[#20103f]">Service and chronology details</h4>
        <p className="mt-2 text-sm leading-6 text-[#62597c]">
          Record how the notice was served, review the generated chronology, and add only the extra detail the pack still needs.
        </p>
        <div className="mt-4 space-y-4">
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
              We build the main chronology from your arrears schedule, notice dates, and contact history. Use this box only for extra detail the pack still needs explained.
            </p>
          </label>

          <div className="grid gap-4 md:grid-cols-2">
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
        </div>
      </section>

      <CollapsibleStepCard
        stepLabel="Step 2 of 4"
        title="Record the wider property compliance story"
        description="These answers help the pack explain the wider tenancy compliance picture without turning the step into a full legal memo."
        defaultOpen={propertyComplianceTouched}
      >
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
      </CollapsibleStepCard>

      <CollapsibleStepCard
        stepLabel="Step 3 of 4"
        title="Confirm what records exist outside the platform"
        description="These confirmations do not upload anything. They simply keep the checklist and filing guidance honest about what the landlord already holds."
        defaultOpen={recordsTouched}
      >
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
              I have reviewed which supporting records are available for this claim.
            </p>
            <p className="mt-1 text-sm leading-6 text-[#62597c]">
              This confirms the generated checklist can refer to what exists outside the platform,
              even where some records will need to be gathered separately later.
            </p>
          </div>
        </label>
      </CollapsibleStepCard>

      <CollapsibleStepCard
        stepLabel="Step 4 of 5"
        title="Anticipate the tenant's likely defence points"
        description="Use this to record the issues the landlord pack should answer proactively, especially where the tenant may rely on disrepair, benefits delay, vulnerability, or a counterclaim."
        defaultOpen={defenceRiskTouched}
      >
        <div className="mt-4 grid gap-3">
          <BooleanQuestion
            label="Has the tenant already disputed the arrears, the notice, or the possession route?"
            help="Answer yes if the tenant has already raised a reason why possession should not proceed or why the notice is said to be wrong."
            value={tenantDisputesClaim}
            onChange={(value) => mergeRisk({ tenant_disputes_claim: value })}
            yesLabel="Yes, disputed"
            noLabel="No dispute raised"
          />

          {tenantDisputesClaim === true && (
            <label className="block rounded-2xl border border-[#ece4ff] bg-[#faf7ff] px-4 py-4">
              <span className="text-sm font-medium text-[#27134a]">Known tenant defence or dispute points</span>
              <textarea
                value={knownTenantDefences}
                onChange={(e) => void mergeRisk({ known_tenant_defences: e.target.value })}
                rows={4}
                className="mt-2 w-full rounded-2xl border border-[#dccbff] bg-[#fcfbff] px-4 py-3 text-sm text-[#221342] outline-none transition focus:border-[#7C3AED]"
                placeholder="For example: disputes the arrears figure, says the delay is a UC issue, says repairs were ignored, or says the notice was not validly served."
              />
            </label>
          )}

          <BooleanQuestion
            label="Has the tenant made any disrepair complaint that could be raised against the claim?"
            help="Record repair complaints that may turn into a set-off, disrepair defence, or counterclaim at hearing."
            value={disrepairComplaints}
            onChange={(value) => mergeRisk({ disrepair_complaints: value })}
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
                  onChange={(e) => void mergeRisk({ disrepair_complaint_date: e.target.value })}
                  className="mt-2 w-full rounded-2xl border border-[#dccbff] bg-[#fcfbff] px-4 py-3 text-sm text-[#221342] outline-none transition focus:border-[#7C3AED]"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-[#27134a]">What issues are being raised?</span>
                <textarea
                  value={disrepairIssuesList}
                  onChange={(e) => void mergeRisk({ disrepair_issues_list: e.target.value })}
                  rows={4}
                  className="mt-2 w-full rounded-2xl border border-[#dccbff] bg-[#fcfbff] px-4 py-3 text-sm text-[#221342] outline-none transition focus:border-[#7C3AED]"
                  placeholder="For example: boiler failures, mould, leaking roof, unsafe electrics, broken windows."
                />
              </label>
            </div>
          )}

          <BooleanQuestion
            label="Have there been previous court or tribunal proceedings relating to this tenancy?"
            help="Use this where there has already been litigation, a withdrawn claim, a prior money case, or another possession attempt tied to the same tenancy."
            value={previousCourtProceedings}
            onChange={(value) => mergeRisk({ previous_court_proceedings: value })}
            yesLabel="Yes, previous proceedings"
            noLabel="No previous proceedings"
          />

          {previousCourtProceedings === true && (
            <label className="block rounded-2xl border border-[#ece4ff] bg-[#faf7ff] px-4 py-4">
              <span className="text-sm font-medium text-[#27134a]">Previous proceedings details</span>
              <textarea
                value={previousProceedingsDetails}
                onChange={(e) => void mergeRisk({ previous_proceedings_details: e.target.value })}
                rows={4}
                className="mt-2 w-full rounded-2xl border border-[#dccbff] bg-[#fcfbff] px-4 py-3 text-sm text-[#221342] outline-none transition focus:border-[#7C3AED]"
                placeholder="For example: prior possession claim dismissed, money judgment already obtained, consent order, or earlier proceedings stayed."
              />
            </label>
          )}

          <BooleanQuestion
            label="Is there any vulnerability or personal circumstance the court is likely to hear about?"
            help="Record only what is already known and relevant to timing, proportionality, support needs, or likely hearing-stage arguments."
            value={tenantVulnerability}
            onChange={(value) => mergeRisk({ tenant_vulnerability: value })}
            yesLabel="Yes, known issue"
            noLabel="No known issue"
          />

          {tenantVulnerability === true && (
            <label className="block rounded-2xl border border-[#ece4ff] bg-[#faf7ff] px-4 py-4">
              <span className="text-sm font-medium text-[#27134a]">Vulnerability details</span>
              <textarea
                value={tenantVulnerabilityDetails}
                onChange={(e) => void mergeRisk({ tenant_vulnerability_details: e.target.value })}
                rows={4}
                className="mt-2 w-full rounded-2xl border border-[#dccbff] bg-[#fcfbff] px-4 py-3 text-sm text-[#221342] outline-none transition focus:border-[#7C3AED]"
                placeholder="For example: medical vulnerability, safeguarding concerns, mental health issues, or support involvement the landlord already knows about."
              />
            </label>
          )}

          <BooleanQuestion
            label="Is a tenant counterclaim or set-off likely?"
            help="Use this when the tenant is likely to plead disrepair, a deposit penalty, unlawful fees, or another monetary counterclaim."
            value={tenantCounterclaimLikely}
            onChange={(value) => mergeRisk({ tenant_counterclaim_likely: value })}
            yesLabel="Yes, likely"
            noLabel="No counterclaim expected"
          />

          {tenantCounterclaimLikely === true && (
            <label className="block rounded-2xl border border-[#ece4ff] bg-[#faf7ff] px-4 py-4">
              <span className="text-sm font-medium text-[#27134a]">Counterclaim or set-off grounds</span>
              <textarea
                value={counterclaimGrounds}
                onChange={(e) =>
                  void mergeRisk({
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
                  placeholder="For example: UC housing costs delay, Housing Benefit suspension, direct payment issue."
                />
              </label>

              <label className="block rounded-2xl border border-[#ece4ff] bg-[#faf7ff] px-4 py-4">
                <span className="text-sm font-medium text-[#27134a]">Extra arrears context to answer likely defence points</span>
                <textarea
                  value={tenantBenefitsDetails}
                  onChange={(e) => void onUpdate({ tenant_benefits_details: e.target.value })}
                  rows={3}
                  className="mt-2 w-full rounded-2xl border border-[#dccbff] bg-[#fcfbff] px-4 py-3 text-sm text-[#221342] outline-none transition focus:border-[#7C3AED]"
                  placeholder="For example: landlord allowed time for benefit issues, payment plan was offered, or tenant acknowledged the debt despite the benefits issue."
                />
              </label>

              <BooleanQuestion
                label="Was a payment plan or arrears arrangement offered?"
                help="This helps the pack explain what the landlord did before moving to possession proceedings."
                value={paymentPlanOffered}
                onChange={(value) => mergeRisk({ payment_plan_offered: value })}
                yesLabel="Yes, offered"
                noLabel="No plan offered"
              />

              {paymentPlanOffered === true && (
                <label className="block rounded-2xl border border-[#ece4ff] bg-[#faf7ff] px-4 py-4">
                  <span className="text-sm font-medium text-[#27134a]">What happened with that payment plan?</span>
                  <textarea
                    value={paymentPlanResponse}
                    onChange={(e) => void mergeRisk({ payment_plan_response: e.target.value })}
                    rows={3}
                    className="mt-2 w-full rounded-2xl border border-[#dccbff] bg-[#fcfbff] px-4 py-3 text-sm text-[#221342] outline-none transition focus:border-[#7C3AED]"
                    placeholder="For example: ignored, accepted then broken, refused, or partly complied with."
                  />
                </label>
              )}
            </>
          )}
        </div>
      </CollapsibleStepCard>

      <CollapsibleStepCard
        stepLabel="Step 5 of 5"
        title="Confirm the England checks that affect court-readiness"
        description="These are the questions that can stop a Form 3A route or a possession file from being treated as ready. Keep them focused and factual."
        defaultOpen={englandComplianceTouched}
      >
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
                help="Use this if the deposit issue has already been cured outside the tenancy so the pack can explain that position clearly."
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
            label="Are the supporting records ready to support the selected grounds?"
            help="This should be yes only if the records you would need outside the generated pack are identified and available."
            value={facts.evidence_bundle_ready}
            onChange={(value) => onUpdate({ evidence_bundle_ready: value })}
            yesLabel="Yes, ready"
            noLabel="No, still incomplete"
          />
        </div>
      </CollapsibleStepCard>

      <section
        className={`rounded-[1.6rem] border px-5 py-5 shadow-sm ${
          readinessStatus
            ? 'border-emerald-200 bg-emerald-50'
            : 'border-amber-200 bg-amber-50'
        }`}
      >
        <div className="flex items-start gap-3">
          <RiCheckboxCircleLine
            className={`mt-0.5 h-5 w-5 flex-shrink-0 ${
              readinessStatus
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

