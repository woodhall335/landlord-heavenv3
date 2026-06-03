import Link from 'next/link';
import type { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { AssistedPrepChecklist } from '@/components/assisted-prep/AssistedPrepChecklist';
import { AssistedPrepServiceDetails } from '@/components/assisted-prep/AssistedPrepServiceDetails';
import { getAssistedPrepConfig, ASSISTED_PREP_PROMISE } from '@/lib/assisted-prep';

const service = getAssistedPrepConfig('possession');

export const metadata: Metadata = {
  title: 'Possession Claim Assisted Prep | Landlord Heaven',
  description:
    'Book possession claim assisted prep for England landlords. We help prepare or check the N5, N119, notice evidence, bundle steps, and filing pack.',
  keywords: [
    'possession claim assisted prep',
    'n5 n119 assisted prep',
    'possession claim pack help',
    'landlord court pack preparation',
    'section 8 court papers help',
    'n5 possession claim help',
    'n119 particulars support',
    'notice service evidence review',
    'possession bundle checklist',
    'eviction court filing support',
    'complete eviction pack help',
    'england possession claim preparation',
  ],
  alternates: {
    canonical: '/possession-claim-assisted-prep',
  },
};

export default function PossessionClaimAssistedPrepPage() {
  return (
    <>
      <HeaderConfig mode="solid" />
      <main className="bg-slate-50 px-4 py-12 md:py-16">
        <div className="mx-auto max-w-5xl space-y-8">
          <section className="rounded-2xl bg-white p-8 shadow-sm">
            <p className="text-sm font-semibold text-violet-700">{service.priceLabel} assisted prep</p>
            <h1 className="mt-3 text-4xl font-bold text-slate-950">{service.label}</h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-700">
              {ASSISTED_PREP_PROMISE} Use this when you want help preparing or checking N5, N119, notice evidence, and the filing pack.
            </p>
            <Link href={service.startHref} className="mt-6 inline-flex rounded-lg bg-violet-700 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-800">
              Start assisted prep
            </Link>
          </section>
          <AssistedPrepServiceDetails service="possession" />
          <AssistedPrepChecklist service="possession" />
        </div>
      </main>
    </>
  );
}
