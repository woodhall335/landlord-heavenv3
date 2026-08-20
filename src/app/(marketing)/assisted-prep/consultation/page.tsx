import Link from 'next/link';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { AssistedPrepChecklist } from '@/components/assisted-prep/AssistedPrepChecklist';
import { CalendlyBookingButton } from '@/components/assisted-prep/CalendlyBookingButton';
import {
  getAssistedPrepConfig,
  isPublicAssistedPrepService,
} from '@/lib/assisted-prep';

export const metadata: Metadata = {
  title: 'Book Your Free Consultation | Landlord Heaven',
  description: 'Book a free assisted eviction consultation.',
  robots: { index: false, follow: true },
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function readParam(params: Record<string, string | string[] | undefined>, key: string): string | undefined {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

export default async function AssistedPrepConsultationPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const service = readParam(params, 'service');
  if (!isPublicAssistedPrepService(service)) redirect('/assisted-prep');

  const config = getAssistedPrepConfig(service);
  const caseId = readParam(params, 'case_id');
  const bookingUrl = process.env.NEXT_PUBLIC_CALENDLY_ASSISTED_PREP_URL || 'https://calendly.com/';
  const dashboardHref = caseId ? `/dashboard/cases/${caseId}` : '/dashboard';

  return (
    <>
      <HeaderConfig mode="solid" />
      <main className="bg-slate-50 px-4 py-12 md:py-16">
        <div className="mx-auto max-w-5xl space-y-8">
          <section className="rounded-2xl border border-violet-200 bg-white p-6 shadow-sm md:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-700">Free consultation request saved</p>
            <h1 className="mt-3 text-3xl font-bold text-slate-950">Book your {config.shortLabel.toLowerCase()} consultation</h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-700">
              There is no payment at this stage. We will discuss the facts and documents with you first. If the service is suitable, we will confirm the scope and send a Stripe payment link afterwards. This is document preparation, not legal representation.
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
            <p className="mt-4 text-sm text-slate-600">If you cannot find a suitable appointment, reply to the consultation email and we will help.</p>
          </section>

          <AssistedPrepChecklist service={service} />
        </div>
      </main>
    </>
  );
}
