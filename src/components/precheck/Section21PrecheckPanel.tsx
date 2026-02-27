'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import EmailCaptureModal from '@/components/leads/EmailCaptureModal';
import { isLeadCaptured } from '@/lib/leads/local';
import {
  evaluateSection21Precheck,
  formatDateUK,
  SECTION21_PRECHECK_DEFAULT_INPUT,
  type Section21PrecheckInput,
  type Section21PrecheckResult,
  type YesNoUnsure,
} from '@/lib/section21Precheck';

const triState: YesNoUnsure[] = ['yes', 'no', 'unsure'];


type Section21PrecheckPanelProps = {
  ctaHref: string;
  ctaLabels?: {
    valid?: string;
    risky?: string;
  };
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

const DEFAULT_CTA_LABELS = {
  valid: 'Section 21 is Valid – Continue',
  risky: 'Use Section 8 Instead – Start Workflow',
};

function Segmented({ value, onChange, accentHex }: { value: YesNoUnsure; onChange: (v: YesNoUnsure) => void; accentHex: string }) {
  return <div className="inline-flex rounded-full border bg-white p-1 text-sm" style={{ borderColor: `${accentHex}4d` }}>{triState.map((option) => <button key={option} type="button" onClick={() => onChange(option)} className="rounded-full px-3 py-1.5 font-medium capitalize" style={value === option ? { backgroundColor: accentHex, color: '#fff' } : { color: accentHex }}>{option}</button>)}</div>;
}

function DateField({ label, value, onChange }: { label: string; value: string | null; onChange: (v: string | null) => void }) {
  return <label className="flex flex-col gap-1 text-sm"><span className="font-medium text-gray-700">{label}</span><input type="date" value={value ?? ''} onChange={(e) => onChange(e.target.value || null)} className="rounded-lg border border-gray-300 px-3 py-2" /></label>;
}

export default function Section21PrecheckPanel({ ctaHref, ctaLabels, emailGate, ui }: Section21PrecheckPanelProps) {
  const accentHex = ui?.accentHex ?? '#7c3aed';
  const heading = ui?.heading ?? '⚠️ Quick compliance & timing check';
  const subtitle = ui?.subtitle ?? 'One mistake can invalidate a Section 21 notice. Check in 60 seconds.';
  const panelVariant = ui?.variant ?? 'full';
  const gateEnabled = emailGate?.enabled ?? true;
  const gateStorageKey = emailGate?.gateStorageKey ?? 'lh_s21_precheck_gate';
  const gateSource = emailGate?.source ?? 's21_precheck_results_gate';
  const gateTags = emailGate?.tags ?? ['s21_precheck', 'product_notice_only', 'england'];
  const includeEmailReport = emailGate?.includeEmailReport ?? false;
  const mergedCtaLabels = { ...DEFAULT_CTA_LABELS, ...ctaLabels };
  const [input, setInput] = useState<Section21PrecheckInput>(SECTION21_PRECHECK_DEFAULT_INPUT);
  const [result, setResult] = useState<Section21PrecheckResult | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [gateOpen, setGateOpen] = useState(
    typeof window !== 'undefined' && (!gateEnabled || isLeadCaptured() || localStorage.getItem(gateStorageKey) === '1')
  );

  useEffect(() => {
    let active = true;
    evaluateSection21Precheck(input).then((next) => active && setResult(next));
    return () => { active = false; };
  }, [input]);

  const statusBadge = useMemo(() => !result || result.status === 'incomplete' ? 'Incomplete' : result.status === 'risky' ? 'Risky' : 'Appears valid', [result]);
  const update = <K extends keyof Section21PrecheckInput>(key: K, value: Section21PrecheckInput[K]) => setInput((prev) => ({ ...prev, [key]: value }));

  return (
    <div className={`mx-auto mb-8 w-full max-w-[800px] rounded-2xl border-l-4 bg-white shadow-sm ${panelVariant === 'compact' ? 'p-4 md:p-5' : 'p-5 md:p-6'}`} style={{ borderLeftColor: accentHex }}>
      <h3 className="text-2xl font-bold text-gray-900">{heading}</h3>
      <p className="mt-2 text-gray-600">{subtitle}</p>
      <div className="mt-5 space-y-5">
        <div><p className="mb-2 font-semibold">A) Compliance / prerequisites</p><div className="grid gap-3 md:grid-cols-2">{[['deposit_taken', 'Deposit taken?'], ['epc_required', 'EPC required?'], ['gas_installed', 'Gas installed?'], ['property_requires_hmo_licence', 'HMO licence required?'], ['property_requires_selective_licence', 'Selective licence required?'], ['improvement_notice_served', 'Improvement notice served?'], ['emergency_remedial_action_served', 'Emergency remedial action served?'], ['prohibited_payment_outstanding', 'Prohibited payment outstanding?'], ['has_proof_of_service_plan', 'Proof-of-service plan in place?'], ['is_replacement_tenancy', 'Replacement tenancy?']].map(([key, label]) => <div key={key} className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 p-2"><span className="text-sm">{label}</span><Segmented value={input[key as keyof Section21PrecheckInput] as YesNoUnsure} onChange={(v) => update(key as keyof Section21PrecheckInput, v as never)} accentHex={accentHex} /></div>)}</div></div>

        <div>
          <p className="mb-2 font-semibold">B) Timing inputs</p>
          <div className="grid gap-3 md:grid-cols-2">
            <DateField label="Tenancy start date" value={input.tenancy_start_date || null} onChange={(v) => update('tenancy_start_date', v ?? '')} /><DateField label="Original tenancy start date" value={input.original_tenancy_start_date} onChange={(v) => update('original_tenancy_start_date', v)} /><DateField label="Planned service date" value={input.planned_service_date || null} onChange={(v) => update('planned_service_date', v ?? '')} /><DateField label="Fixed term end date" value={input.fixed_term_end_date} onChange={(v) => update('fixed_term_end_date', v)} /><DateField label="Break clause earliest end date" value={input.break_clause_earliest_end_date} onChange={(v) => update('break_clause_earliest_end_date', v)} /><DateField label="Deposit received date" value={input.deposit_received_date} onChange={(v) => update('deposit_received_date', v)} /><DateField label="Deposit protected date" value={input.deposit_protected_date} onChange={(v) => update('deposit_protected_date', v)} /><DateField label="PI served (tenant)" value={input.deposit_prescribed_info_served_tenant_date} onChange={(v) => update('deposit_prescribed_info_served_tenant_date', v)} /><DateField label="Deposit returned date" value={input.deposit_returned_date} onChange={(v) => update('deposit_returned_date', v)} /><DateField label="PI served (relevant person)" value={input.deposit_prescribed_info_served_relevant_person_date} onChange={(v) => update('deposit_prescribed_info_served_relevant_person_date', v)} /><DateField label="EPC served date" value={input.epc_served_date} onChange={(v) => update('epc_served_date', v)} /><DateField label="Gas safety issue date" value={input.gas_safety_record_issue_date} onChange={(v) => update('gas_safety_record_issue_date', v)} /><DateField label="Gas safety served date" value={input.gas_safety_record_served_date} onChange={(v) => update('gas_safety_record_served_date', v)} /><DateField label="How to Rent served date" value={input.how_to_rent_served_date} onChange={(v) => update('how_to_rent_served_date', v)} /><DateField label="Improvement notice date" value={input.improvement_notice_date} onChange={(v) => update('improvement_notice_date', v)} /><DateField label="Emergency remedial action date" value={input.emergency_remedial_action_date} onChange={(v) => update('emergency_remedial_action_date', v)} />
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <select className="rounded-lg border border-gray-300 px-3 py-2 text-sm" value={input.tenancy_type} onChange={(e) => update('tenancy_type', e.target.value as Section21PrecheckInput['tenancy_type'])}><option value="unsure">Tenancy type</option><option value="fixed_term">Fixed term</option><option value="periodic">Periodic</option></select><select className="rounded-lg border border-gray-300 px-3 py-2 text-sm" value={input.rent_period} onChange={(e) => update('rent_period', e.target.value as Section21PrecheckInput['rent_period'])}><option value="unsure">Rent period</option><option value="weekly">Weekly</option><option value="fortnightly">Fortnightly</option><option value="four_weekly">Four-weekly</option><option value="monthly">Monthly</option><option value="quarterly">Quarterly</option><option value="yearly">Yearly</option><option value="other">Other</option></select><select className="rounded-lg border border-gray-300 px-3 py-2 text-sm" value={input.service_method} onChange={(e) => update('service_method', e.target.value as Section21PrecheckInput['service_method'])}><option value="unsure">Service method</option><option value="hand">Hand</option><option value="first_class_post">First class post</option><option value="document_exchange">Document exchange</option><option value="email">Email</option><option value="other">Other</option></select><select className="rounded-lg border border-gray-300 px-3 py-2 text-sm" value={input.landlord_type} onChange={(e) => update('landlord_type', e.target.value as Section21PrecheckInput['landlord_type'])}><option value="unsure">Landlord type</option><option value="private_landlord">Private landlord</option><option value="social_provider">Social provider</option></select><select className="rounded-lg border border-gray-300 px-3 py-2 text-sm" value={input.how_to_rent_served_method ?? 'unsure'} onChange={(e) => update('how_to_rent_served_method', e.target.value as Section21PrecheckInput['how_to_rent_served_method'])}><option value="unsure">How to Rent served method</option><option value="hardcopy">Hardcopy</option><option value="email">Email</option></select><select className="rounded-lg border border-gray-300 px-3 py-2 text-sm" value={input.service_before_430pm} onChange={(e) => update('service_before_430pm', e.target.value as YesNoUnsure)}><option value="unsure">Before 4:30pm?</option><option value="yes">Yes</option><option value="no">No</option></select><select className="rounded-lg border border-gray-300 px-3 py-2 text-sm" value={input.tenant_consented_email_service ?? 'unsure'} onChange={(e) => update('tenant_consented_email_service', e.target.value as YesNoUnsure)}><option value="unsure">Email service consent</option><option value="yes">Yes</option><option value="no">No</option></select><select className="rounded-lg border border-gray-300 px-3 py-2 text-sm" value={input.has_break_clause} onChange={(e) => update('has_break_clause', e.target.value as YesNoUnsure)}><option value="unsure">Break clause?</option><option value="yes">Yes</option><option value="no">No</option></select><select className="rounded-lg border border-gray-300 px-3 py-2 text-sm" value={input.deposit_returned_in_full_or_agreed ?? 'unsure'} onChange={(e) => update('deposit_returned_in_full_or_agreed', e.target.value as YesNoUnsure)}><option value="unsure">Deposit returned in full?</option><option value="yes">Yes</option><option value="no">No</option></select><select className="rounded-lg border border-gray-300 px-3 py-2 text-sm" value={input.deposit_claim_resolved_by_court ?? 'unsure'} onChange={(e) => update('deposit_claim_resolved_by_court', e.target.value as YesNoUnsure)}><option value="unsure">Deposit claim resolved by court?</option><option value="yes">Yes</option><option value="no">No</option></select><select className="rounded-lg border border-gray-300 px-3 py-2 text-sm" value={input.hmo_licence_in_place ?? 'unsure'} onChange={(e) => update('hmo_licence_in_place', e.target.value as YesNoUnsure)}><option value="unsure">HMO licence in place?</option><option value="yes">Yes</option><option value="no">No</option></select><select className="rounded-lg border border-gray-300 px-3 py-2 text-sm" value={input.selective_licence_in_place ?? 'unsure'} onChange={(e) => update('selective_licence_in_place', e.target.value as YesNoUnsure)}><option value="unsure">Selective licence in place?</option><option value="yes">Yes</option><option value="no">No</option></select><select className="rounded-lg border border-gray-300 px-3 py-2 text-sm" value={input.how_to_rent_was_current_version_at_tenancy_start} onChange={(e) => update('how_to_rent_was_current_version_at_tenancy_start', e.target.value as YesNoUnsure)}><option value="unsure">How to Rent current at start?</option><option value="yes">Yes</option><option value="no">No</option></select><select className="rounded-lg border border-gray-300 px-3 py-2 text-sm" value={input.deposit_paid_by_relevant_person ?? 'unsure'} onChange={(e) => update('deposit_paid_by_relevant_person', e.target.value as YesNoUnsure)}><option value="unsure">Deposit paid by relevant person?</option><option value="yes">Yes</option><option value="no">No</option></select>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 p-4" style={{ backgroundColor: '#faf7ff' }}><p className="text-sm font-semibold">Status preview</p><div className="mt-2 flex items-center gap-3"><span className="rounded-full bg-white px-3 py-1 text-xs font-semibold border" style={{ color: accentHex, borderColor: `${accentHex}4d` }}>{statusBadge}</span><span className="text-sm text-gray-700">{result?.display.gatedSummary ?? 'Loading...'}</span></div>
          {result && result.status !== 'incomplete' && gateEnabled && !gateOpen && <button type="button" onClick={() => setOpenModal(true)} className="mt-3 rounded-lg px-4 py-2 text-sm font-semibold text-white" style={{ backgroundColor: accentHex }}>Reveal full results</button>}
          {result && result.status !== 'incomplete' && gateOpen && <div className="mt-4 space-y-2 text-sm text-gray-700"><p className="font-semibold">{result.display.headline}</p><ul className="list-disc pl-5">{result.blockers.map((item) => <li key={item.code + item.message}>{item.message}</li>)}{result.warnings.map((item) => <li key={item.code + item.message}>{item.message}</li>)}</ul><div className="grid gap-1 pt-2"><p>Deemed service date: {formatDateUK(result.deemed_service_date)}</p><p>Earliest leave-after date: {formatDateUK(result.earliest_after_date)}</p><p>Latest court start date: {formatDateUK(result.latest_court_start_date)}</p></div></div>}
          <Link href={ctaHref} className="mt-4 block w-full rounded-lg px-4 py-3 text-center font-semibold text-white" style={{ background: `linear-gradient(to right, #692ed4, ${accentHex})` }}>{result?.status === 'risky' ? mergedCtaLabels.risky : mergedCtaLabels.valid}</Link>
        </div>
      </div>

      {gateEnabled ? <EmailCaptureModal open={openModal} onClose={() => setOpenModal(false)} source={gateSource} tags={gateTags} includeEmailReport={includeEmailReport} reportCaseId={emailGate?.reportCaseId} title="Reveal your full Section 21 pre-check results" description="Enter your email to unlock detailed reasons, date calculations, and next-step guidance." primaryLabel="Reveal results" onSuccess={() => { setGateOpen(true); if (typeof window !== 'undefined') localStorage.setItem(gateStorageKey, '1'); }} /> : null}
    </div>
  );
}
