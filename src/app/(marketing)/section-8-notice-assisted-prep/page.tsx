import Link from 'next/link';
import type { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { AssistedPrepChecklist } from '@/components/assisted-prep/AssistedPrepChecklist';
import { AssistedPrepServiceDetails } from '@/components/assisted-prep/AssistedPrepServiceDetails';
import { getAssistedPrepConfig, ASSISTED_PREP_PROMISE } from '@/lib/assisted-prep';

const service = getAssistedPrepConfig('section8');

export const metadata: Metadata = {
  title: 'Section 8 Notice Assisted Prep | Landlord Heaven',
  description:
    'Book Section 8 assisted prep for England landlords. We help prepare or check the Form 3A notice, grounds, dates, service file, and evidence prompts.',
  keywords: [
    'section 8 assisted prep',
    'section 8 notice help',
    'form 3a assisted preparation',
    'form 3a notice check',
    'section 8 notice preparation',
    'eviction notice preparation help',
    'landlord section 8 callback',
    'section 8 grounds check',
    'notice service evidence',
    'n215 service support',
    'rent arrears notice help',
    'england landlord eviction notice',
  ],
  alternates: {
    canonical: '/section-8-notice-assisted-prep',
  },
};

export default function Section8AssistedPrepPage() {
  return (
    <>
      <HeaderConfig mode="solid" />
      <main className="bg-slate-50 px-4 py-12 md:py-16">
        <div className="mx-auto max-w-5xl space-y-8">
          <section className="rounded-2xl bg-white p-8 shadow-sm">
            <p className="text-sm font-semibold text-violet-700">{service.priceLabel} assisted prep</p>
            <h1 className="mt-3 text-4xl font-bold text-slate-950">{service.label}</h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-700">
              {ASSISTED_PREP_PROMISE} Use this when you want help preparing or checking the Form 3A notice and service pack before you serve it.
            </p>
            <Link href={service.startHref} className="mt-6 inline-flex rounded-lg bg-violet-700 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-800">
              Start assisted prep
            </Link>
          </section>
          <AssistedPrepServiceDetails service="section8" />
          <AssistedPrepChecklist service="section8" />
        </div>
      </main>
    </>
  );
}
