'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import EmailCaptureModal from '@/components/leads/EmailCaptureModal';
import { isLeadCaptured } from '@/lib/leads/local';
import {
  evaluateSection21Precheck,
  formatDateUK,
  getSection21PrecheckCompleteness,
  SECTION21_PRECHECK_DEFAULT_INPUT,
  type Section21PrecheckInput,
  type Section21PrecheckResult,
  type YesNoUnsure,
} from '@/lib/section21Precheck';

const triState: YesNoUnsure[] = ['yes', 'no', 'unsure'];
const PAGE_GATE_FALLBACK_KEY = 'lh_gate_s21_notice_only';
const STEP_TITLES = ['Tenancy & service', 'Deposit', 'Prescribed documents', 'Licensing & restrictions + results'] as const;

/**
 * ✅ IMPORTANT: gate steps by missing_keys, not labels (labels can drift / be renamed)
 */
const STEP_KEYS: Record<number, Array<keyof Section21PrecheckInput>> = {
  1: [
    'tenancy_start_date',
    'is_replacement_tenancy',
    'original_tenancy_start_date',
    'tenancy_type',
    'fixed_term_end_date',
    'has_break_clause',
    'break_clause_earliest_end_date',
    'rent_period',
    'planned_service_date',
    'service_method',
    'service_before_430pm',
    'tenant_consented_email_service',
  ],
  2: [
    'deposit_taken',
    'deposit_received_date',
    'deposit_protected_date',
    'deposit_prescribed_info_served_tenant_date',
    'deposit_paid_by_relevant_person',
    'deposit_prescribed_info_served_relevant_person_date',
    'deposit_returned_in_full_or_agreed',
    'deposit_returned_date',
    'deposit_claim_resolved_by_court',
  ],
  3: [
    'epc_required',
    'epc_served_date',
    'gas_installed',
    'gas_safety_record_issue_date',
    'gas_safety_record_served_date',
    'landlord_type',
    'how_to_rent_served_date',
    'how_to_rent_served_method',
    'how_to_rent_was_current_version_at_tenancy_start',
    'tenant_consented_email_service',
  ],
  4: [
    'property_requires_hmo_licence',
    'hmo_licence_in_place',
    'property_requires_selective_licence',
    'selective_licence_in_place',
    'improvement_notice_served',
    'improvement_notice_date',
    'emergency_remedial_action_served',
    'emergency_remedial_action_date',
    'prohibited_payment_outstanding',
    'has_proof_of_service_plan',
  ],
};

type Section21PrecheckPanelProps = {
  ctaHref: string;
  emailGate?: {
    enabled?: boolean;
    source?: string;
    tags?: string[];
    gateStorageKey?: string;
    includeEmailReport?: boolean;
    reportCaseId?: string;
  };
  ui?: {
    accentHex?: string;
    heading?: string;
    subtitle?: string;
    variant?: 'full' | 'compact';
  };
};

type CtaConfig = {
  label: string;
  enabled: boolean;
  tone: 'neutral' | 'warning' | 'success';
  message: string;
};

export function getStatusCtaConfig(status: Section21PrecheckResult['status'] | null): CtaConfig {
  if (status === 'risky')
    return {
      label: 'Use Section 8 Instead – Start Workflow',
      enabled: true,
      tone: 'warning',
      message: 'Section 21 may be invalid based on your answers. Section 8 may be safer in this case.',
    };
  if (status === 'valid')
    return {
      label: 'Section 21 is Valid – Continue',
      enabled: true,
      tone: 'success',
      message: 'Section 21 appears valid based on your answers.',
    };
  return {
    label: 'Complete the check to continue',
    enabled: false,
    tone: 'neutral',
    message: 'Incomplete — answer the questions to check eligibility.',
  };
}

function Segmented({
  label,
  value,
  onChange,
  accentHex,
  options = triState,
}: {
  label: string;
  value: YesNoUnsure;
  onChange: (v: YesNoUnsure) => void;
  accentHex: string;
  options?: YesNoUnsure[];
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-800">{label}</p>
      <div className="inline-flex rounded-full border bg-white p-1 text-sm" style={{ borderColor: `${accentHex}4d` }}>
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className="rounded-full px-3 py-1.5 font-medium capitalize"
            style={value === option ? { backgroundColor: accentHex, color: '#fff' } : { color: accentHex }}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-gray-700">{label}</span>
      <input
        type="date"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value || null)}
        className="rounded-lg border border-gray-300 px-3 py-2"
      />
    </label>
  );
}

export default function Section21PrecheckPanel({ ctaHref, emailGate, ui }: Section21PrecheckPanelProps) {
  const accentHex = ui?.accentHex ?? '#7c3aed';
  const heading = ui?.heading ?? '⚠️ Quick compliance & timing check';
  const subtitle = ui?.subtitle ?? 'One mistake can invalidate a Section 21 notice. Check in 60 seconds.';
  const panelVariant = ui?.variant ?? 'full';

  const gateEnabled = emailGate?.enabled ?? true;
  const gateStorageKey = emailGate?.gateStorageKey ?? PAGE_GATE_FALLBACK_KEY;
  const gateSource = emailGate?.source ?? 's21_precheck_results_gate';
  const gateTags = emailGate?.tags ?? ['s21_precheck', 'product_notice_only', 'england'];
  const includeEmailReport = emailGate?.includeEmailReport ?? false;

  const [input, setInput] = useState<Section21PrecheckInput>(SECTION21_PRECHECK_DEFAULT_INPUT);
  const [result, setResult] = useState<Section21PrecheckResult | null>(null);
  const [step, setStep] = useState(1);
  const [openModal, setOpenModal] = useState(false);
  const [gateOpen, setGateOpen] = useState(
    typeof window !== 'undefined' &&
      (!gateEnabled ||
        isLeadCaptured() ||
        localStorage.getItem(gateStorageKey) === '1' ||
        localStorage.getItem(PAGE_GATE_FALLBACK_KEY) === '1')
  );

  const update = <K extends keyof Section21PrecheckInput>(key: K, value: Section21PrecheckInput[K]) => {
    setInput((prev) => {
      const next: Section21PrecheckInput = { ...prev, [key]: value };

      if (key === 'is_replacement_tenancy' && value !== 'yes') next.original_tenancy_start_date = null;

      if (key === 'tenancy_type' && value !== 'fixed_term') {
        next.fixed_term_end_date = null;
        next.has_break_clause = 'unsure';
        next.break_clause_earliest_end_date = null;
      }
      if (key === 'has_break_clause' && value !== 'yes') next.break_clause_earliest_end_date = null;

      if (key === 'service_method' && value !== 'email') next.tenant_consented_email_service = null;

      if (key === 'deposit_taken' && value !== 'yes') {
        next.deposit_received_date = null;
        next.deposit_protected_date = null;
        next.deposit_prescribed_info_served_tenant_date = null;
        next.deposit_paid_by_relevant_person = null;
        next.deposit_prescribed_info_served_relevant_person_date = null;
        next.deposit_returned_in_full_or_agreed = null;
        next.deposit_returned_date = null;
        next.deposit_claim_resolved_by_court = null;
      }
      if (key === 'deposit_paid_by_relevant_person' && value !== 'yes') next.deposit_prescribed_info_served_relevant_person_date = null;
      if (key === 'deposit_returned_in_full_or_agreed' && value !== 'yes') next.deposit_returned_date = null;

      if (key === 'gas_installed' && value !== 'yes') {
        next.gas_safety_record_issue_date = null;
        next.gas_safety_record_served_date = null;
      }

      if (key === 'epc_required' && value !== 'yes') next.epc_served_date = null;

      if (key === 'landlord_type' && value !== 'private_landlord') {
        next.how_to_rent_served_date = null;
        next.how_to_rent_served_method = null;
        next.how_to_rent_was_current_version_at_tenancy_start = 'unsure';
      }

      if (key === 'property_requires_hmo_licence' && value !== 'yes') next.hmo_licence_in_place = null;
      if (key === 'property_requires_selective_licence' && value !== 'yes') next.selective_licence_in_place = null;
      if (key === 'improvement_notice_served' && value !== 'yes') next.improvement_notice_date = null;
      if (key === 'emergency_remedial_action_served' && value !== 'yes') next.emergency_remedial_action_date = null;

      return next;
    });
  };

  useEffect(() => {
    let active = true;
    evaluateSection21Precheck(input).then((next) => active && setResult(next));
    return () => {
      active = false;
    };
  }, [input]);

  const completeness = useMemo(() => getSection21PrecheckCompleteness(input), [input]);

  // ✅ Step gating based on missing_keys (stable)
  const stepMissingKeys = useMemo(() => {
    const allowed = new Set(STEP_KEYS[step]);
    return completeness.missing_keys.filter((k) => allowed.has(k));
  }, [completeness.missing_keys, step]);

  const ctaConfig = getStatusCtaConfig(result?.status ?? null);

  return (
    <div
      className={`mx-auto mb-8 w-full max-w-[800px] rounded-2xl border-l-4 bg-white shadow-sm ${
        panelVariant === 'compact' ? 'p-4 md:p-5' : 'p-5 md:p-6'
      }`}
      style={{ borderLeftColor: accentHex }}
    >
      <h3 className="text-2xl font-bold text-gray-900">{heading}</h3>
      <p className="mt-2 text-gray-600">{subtitle}</p>

      <div className="mt-5 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700">
        Step {step} of 4 — {STEP_TITLES[step - 1]}
      </div>

      <div className="mt-4 space-y-4">
        {step === 1 ? (
          <>
            <DateField label="Tenancy start date" value={input.tenancy_start_date || null} onChange={(v) => update('tenancy_start_date', v ?? '')} />
            <Segmented label="Replacement tenancy?" value={input.is_replacement_tenancy} onChange={(v) => update('is_replacement_tenancy', v)} accentHex={accentHex} />
            {input.is_replacement_tenancy === 'yes' ? (
              <DateField label="Original tenancy start date" value={input.original_tenancy_start_date} onChange={(v) => update('original_tenancy_start_date', v)} />
            ) : null}

            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-gray-700">Tenancy type</span>
              <select className="rounded-lg border border-gray-300 px-3 py-2" value={input.tenancy_type} onChange={(e) => update('tenancy_type', e.target.value as Section21PrecheckInput['tenancy_type'])}>
                <option value="unsure">Unsure</option>
                <option value="fixed_term">Fixed term</option>
                <option value="periodic">Periodic</option>
              </select>
            </label>

            {input.tenancy_type === 'fixed_term' ? (
              <>
                <DateField label="Fixed term end date" value={input.fixed_term_end_date} onChange={(v) => update('fixed_term_end_date', v)} />
                <Segmented label="Break clause?" value={input.has_break_clause} onChange={(v) => update('has_break_clause', v)} accentHex={accentHex} />
                {input.has_break_clause === 'yes' ? (
                  <DateField label="Earliest break end date" value={input.break_clause_earliest_end_date} onChange={(v) => update('break_clause_earliest_end_date', v)} />
                ) : null}
              </>
            ) : null}

            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-gray-700">Rent period</span>
              <select className="rounded-lg border border-gray-300 px-3 py-2" value={input.rent_period} onChange={(e) => update('rent_period', e.target.value as Section21PrecheckInput['rent_period'])}>
                <option value="unsure">Unsure</option>
                <option value="weekly">Weekly</option>
                <option value="fortnightly">Fortnightly</option>
                <option value="four_weekly">Four-weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
                <option value="other">Other</option>
              </select>
            </label>

            <DateField label="Planned service date" value={input.planned_service_date || null} onChange={(v) => update('planned_service_date', v ?? '')} />

            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-gray-700">Service method</span>
              <select className="rounded-lg border border-gray-300 px-3 py-2" value={input.service_method} onChange={(e) => update('service_method', e.target.value as Section21PrecheckInput['service_method'])}>
                <option value="unsure">Unsure</option>
                <option value="hand">Hand delivery</option>
                <option value="first_class_post">First class post</option>
                <option value="document_exchange">Document exchange</option>
                <option value="email">Email</option>
                <option value="other">Other</option>
              </select>
            </label>

            <Segmented label="Service before 4:30pm?" value={input.service_before_430pm} onChange={(v) => update('service_before_430pm', v)} accentHex={accentHex} />

            {input.service_method === 'email' ? (
              <Segmented label="Tenant consent to email service?" value={input.tenant_consented_email_service ?? 'unsure'} onChange={(v) => update('tenant_consented_email_service', v)} accentHex={accentHex} />
            ) : null}
          </>
        ) : null}

        {step === 2 ? (
          <>
            <Segmented label="Deposit taken?" value={input.deposit_taken} onChange={(v) => update('deposit_taken', v)} accentHex={accentHex} />
            {input.deposit_taken === 'no' ? <p className="text-sm text-gray-700">No deposit taken — deposit rules don’t apply.</p> : null}
            {input.deposit_taken === 'yes' ? (
              <div className="space-y-4 rounded-xl border border-gray-200 p-4">
                <p className="text-sm text-gray-700">
                  Prescribed information (deposit scheme information required by law) must be served correctly.
                </p>
                <DateField label="Deposit received date" value={input.deposit_received_date} onChange={(v) => update('deposit_received_date', v)} />
                <DateField label="Deposit protected date" value={input.deposit_protected_date} onChange={(v) => update('deposit_protected_date', v)} />
                <DateField label="Prescribed information given to tenant — date" value={input.deposit_prescribed_info_served_tenant_date} onChange={(v) => update('deposit_prescribed_info_served_tenant_date', v)} />
                <Segmented label="Deposit paid by someone else (relevant person)?" value={input.deposit_paid_by_relevant_person ?? 'unsure'} onChange={(v) => update('deposit_paid_by_relevant_person', v)} accentHex={accentHex} />
                {input.deposit_paid_by_relevant_person === 'yes' ? (
                  <DateField label="Prescribed information given to deposit payer (relevant person) — date" value={input.deposit_prescribed_info_served_relevant_person_date} onChange={(v) => update('deposit_prescribed_info_served_relevant_person_date', v)} />
                ) : null}
                <Segmented label="Deposit returned in full / by agreement?" value={input.deposit_returned_in_full_or_agreed ?? 'unsure'} onChange={(v) => update('deposit_returned_in_full_or_agreed', v)} accentHex={accentHex} />
                {input.deposit_returned_in_full_or_agreed === 'yes' ? <DateField label="Deposit returned date" value={input.deposit_returned_date} onChange={(v) => update('deposit_returned_date', v)} /> : null}
                <Segmented label="Deposit claim resolved by court?" value={input.deposit_claim_resolved_by_court ?? 'unsure'} onChange={(v) => update('deposit_claim_resolved_by_court', v)} accentHex={accentHex} />
              </div>
            ) : null}
          </>
        ) : null}

        {step === 3 ? (
          <>
            <Segmented label="EPC required?" value={input.epc_required} onChange={(v) => update('epc_required', v)} accentHex={accentHex} />
            {input.epc_required === 'yes' ? <DateField label="EPC served date" value={input.epc_served_date} onChange={(v) => update('epc_served_date', v)} /> : null}

            <Segmented label="Gas installed?" value={input.gas_installed} onChange={(v) => update('gas_installed', v)} accentHex={accentHex} />
            {input.gas_installed === 'yes' ? (
              <>
                <DateField label="Gas safety record issue date" value={input.gas_safety_record_issue_date} onChange={(v) => update('gas_safety_record_issue_date', v)} />
                <DateField label="Gas safety record served date" value={input.gas_safety_record_served_date} onChange={(v) => update('gas_safety_record_served_date', v)} />
              </>
            ) : null}

            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-gray-700">Landlord type</span>
              <select className="rounded-lg border border-gray-300 px-3 py-2" value={input.landlord_type} onChange={(e) => update('landlord_type', e.target.value as Section21PrecheckInput['landlord_type'])}>
                <option value="unsure">Unsure</option>
                <option value="private_landlord">Private landlord</option>
                <option value="social_provider">Social provider</option>
              </select>
            </label>

            {input.landlord_type === 'private_landlord' ? (
              <>
                <DateField label="How to Rent served date" value={input.how_to_rent_served_date} onChange={(v) => update('how_to_rent_served_date', v)} />
                <label className="flex flex-col gap-1 text-sm">
                  <span className="font-medium text-gray-700">How to Rent served method</span>
                  <select className="rounded-lg border border-gray-300 px-3 py-2" value={input.how_to_rent_served_method ?? 'unsure'} onChange={(e) => update('how_to_rent_served_method', e.target.value as Section21PrecheckInput['how_to_rent_served_method'])}>
                    <option value="unsure">Unsure</option>
                    <option value="hardcopy">Hardcopy</option>
                    <option value="email">Email</option>
                  </select>
                </label>
                <Segmented label="How to Rent was current at tenancy start?" value={input.how_to_rent_was_current_version_at_tenancy_start} onChange={(v) => update('how_to_rent_was_current_version_at_tenancy_start', v)} accentHex={accentHex} />
                {input.how_to_rent_served_method === 'email' ? (
                  <Segmented label="Tenant consent to email service?" value={input.tenant_consented_email_service ?? 'unsure'} onChange={(v) => update('tenant_consented_email_service', v)} accentHex={accentHex} />
                ) : null}
              </>
            ) : null}
          </>
        ) : null}

        {step === 4 ? (
          <>
            <Segmented label="Property requires HMO licence?" value={input.property_requires_hmo_licence} onChange={(v) => update('property_requires_hmo_licence', v)} accentHex={accentHex} />
            {input.property_requires_hmo_licence === 'yes' ? <Segmented label="Licence in place?" value={input.hmo_licence_in_place ?? 'unsure'} onChange={(v) => update('hmo_licence_in_place', v)} accentHex={accentHex} /> : null}

            <Segmented label="Property requires selective licence?" value={input.property_requires_selective_licence} onChange={(v) => update('property_requires_selective_licence', v)} accentHex={accentHex} />
            {input.property_requires_selective_licence === 'yes' ? <Segmented label="Licence in place?" value={input.selective_licence_in_place ?? 'unsure'} onChange={(v) => update('selective_licence_in_place', v)} accentHex={accentHex} /> : null}

            <Segmented label="Improvement notice served?" value={input.improvement_notice_served} onChange={(v) => update('improvement_notice_served', v)} accentHex={accentHex} />
            {input.improvement_notice_served === 'yes' ? <DateField label="Date served" value={input.improvement_notice_date} onChange={(v) => update('improvement_notice_date', v)} /> : null}

            <Segmented label="Emergency remedial action served?" value={input.emergency_remedial_action_served} onChange={(v) => update('emergency_remedial_action_served', v)} accentHex={accentHex} />
            {input.emergency_remedial_action_served === 'yes' ? <DateField label="Date served" value={input.emergency_remedial_action_date} onChange={(v) => update('emergency_remedial_action_date', v)} /> : null}

            <Segmented label="Prohibited payment outstanding?" value={input.prohibited_payment_outstanding} onChange={(v) => update('prohibited_payment_outstanding', v)} accentHex={accentHex} />
            <Segmented label="Proof of service evidence plan in place?" value={input.has_proof_of_service_plan} onChange={(v) => update('has_proof_of_service_plan', v)} accentHex={accentHex} />

            <div className="rounded-xl border border-gray-200 p-4" style={{ backgroundColor: '#faf7ff' }}>
              <p className="text-sm font-semibold">Result preview</p>
              <p className={`mt-2 text-sm ${ctaConfig.tone === 'warning' ? 'text-amber-800' : ctaConfig.tone === 'success' ? 'text-emerald-700' : 'text-gray-700'}`}>
                {ctaConfig.message}
              </p>

              {result?.status === 'incomplete' ? (
                <div className="mt-3 rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-700">
                  <p className="font-medium">You still need:</p>
                  <ul className="mt-1 list-disc pl-5">
                    {(result.missing_labels ?? completeness.missing_labels).slice(0, 10).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {result && result.status !== 'incomplete' && gateEnabled && !gateOpen ? (
                <button type="button" onClick={() => setOpenModal(true)} className="mt-3 rounded-lg px-4 py-2 text-sm font-semibold text-white" style={{ backgroundColor: accentHex }}>
                  Reveal full results
                </button>
              ) : null}

              {result && result.status !== 'incomplete' && gateOpen ? (
                <div className="mt-4 space-y-2 text-sm text-gray-700">
                  <p className="font-semibold">{result.display.headline}</p>
                  <ul className="list-disc pl-5">
                    {result.blockers.map((item) => (
                      <li key={item.code + item.message}>{item.message}</li>
                    ))}
                    {result.warnings.map((item) => (
                      <li key={item.code + item.message}>{item.message}</li>
                    ))}
                  </ul>
                  <div className="grid gap-1 pt-2">
                    <p>Deemed service date: {formatDateUK(result.deemed_service_date)}</p>
                    <p>Earliest leave-after date: {formatDateUK(result.earliest_after_date)}</p>
                    <p>Latest court start date: {formatDateUK(result.latest_court_start_date)}</p>
                  </div>
                </div>
              ) : null}

              {ctaConfig.enabled ? (
                <Link href={ctaHref} className="mt-4 block w-full rounded-lg px-4 py-3 text-center font-semibold text-white" style={{ background: `linear-gradient(to right, #692ed4, ${accentHex})` }}>
                  {ctaConfig.label}
                </Link>
              ) : (
                <button type="button" disabled className="mt-4 block w-full rounded-lg bg-gray-200 px-4 py-3 text-center font-semibold text-gray-500">
                  {ctaConfig.label}
                </button>
              )}
            </div>
          </>
        ) : null}
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setStep((prev) => Math.max(1, prev - 1))}
          disabled={step === 1}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Back
        </button>
        <button
          type="button"
          onClick={() => setStep((prev) => Math.min(4, prev + 1))}
          disabled={step === 4 || stepMissingKeys.length > 0}
          className="rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-300"
          style={{ backgroundColor: stepMissingKeys.length ? undefined : accentHex }}
        >
          Next
        </button>
      </div>

      {stepMissingKeys.length > 0 && step < 4 ? <p className="mt-3 text-sm text-amber-700">Complete this step to continue.</p> : null}

      {gateEnabled ? (
        <EmailCaptureModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          source={gateSource}
          tags={gateTags}
          includeEmailReport={includeEmailReport}
          reportCaseId={emailGate?.reportCaseId}
          title="Reveal your full Section 21 pre-check results"
          description="Enter your email to unlock detailed reasons, date calculations, and next-step guidance."
          primaryLabel="Reveal results"
          onSuccess={() => {
            setGateOpen(true);
            if (typeof window !== 'undefined') {
              localStorage.setItem(gateStorageKey, '1');
              localStorage.setItem(PAGE_GATE_FALLBACK_KEY, '1');
            }
          }}
        />
      ) : null}
    </div>
  );
}