'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSessionTokenHeaders } from '@/lib/session-token';
import {
  ASSISTED_PREP_PROMISE,
  buildAssistedPrepSuccessHref,
  getAssistedPrepConfig,
  normalizeAssistedPrepService,
  type AssistedPrepService,
} from '@/lib/assisted-prep';

type FormState = {
  name: string;
  email: string;
  phone: string;
  property_address: string;
  tenant_names: string;
  urgency: string;
  overview: string;
  authority_confirmed: boolean;
  responsibility_confirmed: boolean;
  section8_reason: string;
  section8_notice_already_served: 'yes' | 'no' | 'not_sure';
  money_claim_amount: string;
  money_claim_lba_sent: 'yes' | 'no' | 'not_sure';
  possession_notice_served: 'yes' | 'no' | 'not_sure';
  possession_notice_date: string;
};

const initialForm: FormState = {
  name: '',
  email: '',
  phone: '',
  property_address: '',
  tenant_names: '',
  urgency: 'As soon as possible',
  overview: '',
  authority_confirmed: false,
  responsibility_confirmed: false,
  section8_reason: '',
  section8_notice_already_served: 'not_sure',
  money_claim_amount: '',
  money_claim_lba_sent: 'not_sure',
  possession_notice_served: 'not_sure',
  possession_notice_date: '',
};

function serviceSpecificFields(service: AssistedPrepService, form: FormState, setForm: (next: Partial<FormState>) => void) {
  if (service === 'money_claim') {
    return (
      <>
        <label className="block">
          <span className="text-sm font-semibold text-slate-800">Amount claimed</span>
          <input
            value={form.money_claim_amount}
            onChange={(event) => setForm({ money_claim_amount: event.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="e.g. GBP 2,400"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-800">Letter before claim sent?</span>
          <select
            value={form.money_claim_lba_sent}
            onChange={(event) => setForm({ money_claim_lba_sent: event.target.value as FormState['money_claim_lba_sent'] })}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="not_sure">Not sure</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </label>
      </>
    );
  }

  if (service === 'possession') {
    return (
      <>
        <label className="block">
          <span className="text-sm font-semibold text-slate-800">Has a notice already been served?</span>
          <select
            value={form.possession_notice_served}
            onChange={(event) => setForm({ possession_notice_served: event.target.value as FormState['possession_notice_served'] })}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="not_sure">Not sure</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-800">Date served, if known</span>
          <input
            type="date"
            value={form.possession_notice_date}
            onChange={(event) => setForm({ possession_notice_date: event.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
      </>
    );
  }

  return (
    <>
      <label className="block">
        <span className="text-sm font-semibold text-slate-800">Ground or reason for the notice</span>
        <input
          value={form.section8_reason}
          onChange={(event) => setForm({ section8_reason: event.target.value })}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          placeholder="e.g. rent arrears, breach, sale, antisocial behaviour"
        />
      </label>
      <label className="block">
        <span className="text-sm font-semibold text-slate-800">Has any notice already been served?</span>
        <select
          value={form.section8_notice_already_served}
          onChange={(event) => setForm({ section8_notice_already_served: event.target.value as FormState['section8_notice_already_served'] })}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="not_sure">Not sure</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </label>
    </>
  );
}

export function AssistedPrepIntakeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const service = normalizeAssistedPrepService(searchParams.get('service'));
  const config = getAssistedPrepConfig(service);
  const [form, setFormState] = useState<FormState>(initialForm);
  const [files, setFiles] = useState<File[]>([]);
  const [showOptionalNote, setShowOptionalNote] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sourceCaseId = searchParams.get('case_id');

  const commonFieldCount = 6;
  const totalFieldCount = useMemo(() => commonFieldCount + 2, []);

  function setForm(next: Partial<FormState>) {
    setFormState((prev) => ({ ...prev, ...next }));
  }

  async function uploadFiles(caseId: string) {
    for (const file of files) {
      const formData = new FormData();
      formData.append('caseId', caseId);
      formData.append('questionId', 'assisted_prep_upload');
      formData.append('category', 'other');
      formData.append('file', file);
      const response = await fetch('/api/wizard/upload-evidence', {
        method: 'POST',
        headers: getSessionTokenHeaders(),
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Your intake was saved, but one upload failed. You can upload it later from the case page.');
      }
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch('/api/assisted-prep/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service,
          source_case_id: searchParams.get('case_id'),
          src: searchParams.get('src'),
          product: searchParams.get('product'),
          step: searchParams.get('step'),
          ...form,
        }),
      });

      const intake = await response.json();
      if (response.status === 401) {
        const redirect = encodeURIComponent(`/assisted-prep/start?${searchParams.toString()}`);
        router.push(`/auth/login?redirect=${redirect}`);
        return;
      }
      if (!response.ok) {
        throw new Error(intake.error || 'Unable to save your assisted prep request.');
      }

      if (files.length > 0) {
        await uploadFiles(intake.case_id);
      }

      const baseUrl = window.location.origin;
      const checkoutResponse = await fetch('/api/checkout/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_type: intake.product_type,
          case_id: intake.case_id,
          landing_path: window.location.pathname,
          referrer: document.referrer || null,
          success_url: `${baseUrl}${buildAssistedPrepSuccessHref({ service, caseId: intake.case_id })}`,
          cancel_url: `${baseUrl}/assisted-prep/start?service=${service}&case_id=${intake.case_id}&payment=cancelled`,
        }),
      });

      const checkout = await checkoutResponse.json();
      if (!checkoutResponse.ok) {
        throw new Error(checkout.error || 'Unable to start checkout.');
      }

      const url = checkout.checkout_url || checkout.session_url;
      if (url) {
        window.location.href = url;
        return;
      }

      throw new Error('Checkout did not return a payment link.');
    } catch (err: any) {
      setError(err?.message || 'Unable to continue. Please try again.');
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-violet-700">
          {config.priceLabel} assisted prep
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">{config.label}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-700">
          {ASSISTED_PREP_PROMISE} This short form has {totalFieldCount} essentials so we can match your payment and callback to the right case.
        </p>
        {sourceCaseId ? (
          <p className="mt-3 rounded-lg bg-violet-50 px-3 py-2 text-sm font-medium text-violet-800">
            We'll use the answers you already entered in your wizard case and link them to this assisted prep request.
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-semibold text-slate-800">Your name</span>
          <input required value={form.name} onChange={(event) => setForm({ name: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-800">Email</span>
          <input required type="email" value={form.email} onChange={(event) => setForm({ email: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-800">Phone</span>
          <input required value={form.phone} onChange={(event) => setForm({ phone: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-800">Urgency</span>
          <select value={form.urgency} onChange={(event) => setForm({ urgency: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
            <option>As soon as possible</option>
            <option>This week</option>
            <option>No rush</option>
          </select>
        </label>
        <label className="block md:col-span-2">
          <span className="text-sm font-semibold text-slate-800">Rental property address</span>
          <input required value={form.property_address} onChange={(event) => setForm({ property_address: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </label>
        <label className="block md:col-span-2">
          <span className="text-sm font-semibold text-slate-800">Tenant name(s), if known</span>
          <input value={form.tenant_names} onChange={(event) => setForm({ tenant_names: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </label>
        {serviceSpecificFields(service, form, setForm)}
        <div className="md:col-span-2">
          <button
            type="button"
            onClick={() => setShowOptionalNote((value) => !value)}
            className="text-sm font-semibold text-violet-700 hover:text-violet-900"
          >
            {showOptionalNote ? 'Hide optional note' : 'Add a short note'}
          </button>
          {showOptionalNote ? (
            <label className="mt-2 block">
              <span className="text-sm font-semibold text-slate-800">Short case overview</span>
              <textarea value={form.overview} onChange={(event) => setForm({ overview: event.target.value })} rows={3} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="One or two lines is enough." />
            </label>
          ) : null}
        </div>
        <label className="block md:col-span-2">
          <span className="text-sm font-semibold text-slate-800">Optional documents</span>
          <input
            type="file"
            multiple
            onChange={(event) => setFiles(Array.from(event.target.files || []))}
            className="mt-1 w-full rounded-lg border border-dashed border-slate-300 px-3 py-3 text-sm"
          />
          <span className="mt-1 block text-xs text-slate-500">Tenancy agreement, notice, rent ledger, correspondence, photos, or proof of service if you have them.</span>
        </label>
      </div>

      <div className="mt-6 space-y-3 rounded-xl bg-slate-50 p-4">
        <label className="flex gap-3 text-sm text-slate-700">
          <input type="checkbox" checked={form.authority_confirmed} onChange={(event) => setForm({ authority_confirmed: event.target.checked })} required className="mt-1" />
          <span>I confirm I am the landlord, agent, or authorised person for this matter.</span>
        </label>
        <label className="flex gap-3 text-sm text-slate-700">
          <input type="checkbox" checked={form.responsibility_confirmed} onChange={(event) => setForm({ responsibility_confirmed: event.target.checked })} required className="mt-1" />
          <span>I understand Landlord Heaven prepares documents from the information provided, and I remain responsible for checking, approving, serving or filing them.</span>
        </label>
      </div>

      {error ? <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

      <button
        type="submit"
        disabled={submitting}
        className="mt-6 w-full rounded-lg bg-violet-700 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-800 disabled:cursor-wait disabled:bg-violet-400"
      >
        {submitting ? 'Saving and opening checkout...' : `Continue to secure checkout - ${config.priceLabel}`}
      </button>
    </form>
  );
}
