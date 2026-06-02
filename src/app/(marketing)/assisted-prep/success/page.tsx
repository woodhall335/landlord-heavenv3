import Link from 'next/link';
import type { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { AssistedPrepChecklist } from '@/components/assisted-prep/AssistedPrepChecklist';
import { AssistedEvidenceUploadPanel } from '@/components/assisted-prep/AssistedEvidenceUploadPanel';
import { CalendlyBookingButton } from '@/components/assisted-prep/CalendlyBookingButton';
import {
  ASSISTED_PREP_PROMISE,
  getAssistedPrepConfig,
  normalizeAssistedPrepService,
} from '@/lib/assisted-prep';

export const metadata: Metadata = {
  title: 'Assisted Prep Payment Received | Landlord Heaven',
  description: 'Book your assisted prep callback and see what to have ready.',
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function readParam(params: Record<string, string | string[] | undefined>, key: string): string | undefined {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

export default async function AssistedPrepSuccessPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const service = normalizeAssistedPrepService(readParam(params, 'service'));
  const config = getAssistedPrepConfig(service);
  const caseId = readParam(params, 'case_id');
  const bookingUrl = process.env.NEXT_PUBLIC_CALENDLY_ASSISTED_PREP_URL || 'https://calendly.com/';
  const dashboardHref = caseId ? `/dashboard/cases/${caseId}` : '/dashboard';

  return (
    <>
      <HeaderConfig mode="autoOnScroll" />
      <main className="bg-slate-50 px-4 py-12 md:py-16">
        <div className="mx-auto max-w-5xl space-y-8">
          <section className="rounded-2xl border border-violet-200 bg-white p-6 shadow-sm md:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-700">
              Payment received
            </p>
            <h1 className="mt-3 text-3xl font-bold text-slate-950">{config.label}</h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-700">
              {ASSISTED_PREP_PROMISE} Book your callback below. Calendly will send the reminder emails for the appointment.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <CalendlyBookingButton url={bookingUrl} />
              <Link
                href={dashboardHref}
                className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100"
              >
                Open case file and upload documents
              </Link>
            </div>
            <p className="mt-4 text-sm text-slate-600">
              If the upload area gives you trouble, reply to your order email and we will help.
            </p>
          </section>

          {caseId ? (
            <AssistedEvidenceUploadPanel caseId={caseId} service={service} />
          ) : (
            <AssistedPrepChecklist service={service} />
          )}
        </div>
      </main>
    </>
  );
}
