import type { Metadata } from 'next';
import { Suspense } from 'react';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { AssistedPrepIntakeForm } from '@/components/assisted-prep/AssistedPrepIntakeForm';
import { AssistedPrepServiceDetails } from '@/components/assisted-prep/AssistedPrepServiceDetails';
import {
  ASSISTED_PREP_PROMISE,
  type AssistedPrepService,
  getAssistedPrepConfig,
} from '@/lib/assisted-prep';

type StartPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const startSeo: Record<AssistedPrepService, { title: string; description: string; keywords: string[] }> = {
  section8: {
    title: 'Start Section 8 Assisted Prep | Landlord Heaven',
    description:
      'Start Section 8 assisted prep for an England Form 3A notice. Short intake, secure payment, callback, and notice file preparation support.',
    keywords: [
      'start section 8 assisted prep',
      'section 8 notice callback',
      'form 3a assisted intake',
      'section 8 notice preparation',
      'eviction notice help england',
      'section 8 grounds support',
      'notice expiry date help',
      'n215 service evidence',
      'rent arrears notice help',
      'landlord eviction callback',
      'form 3a service file',
      'england section 8 help',
    ],
  },
  money_claim: {
    title: 'Start Money Claim Assisted Prep | Landlord Heaven',
    description:
      'Start money claim assisted prep for rent, damage, bills, or tenancy debt. Short intake, secure payment, callback, and claim pack preparation support.',
    keywords: [
      'start money claim assisted prep',
      'money claim callback',
      'landlord money claim help',
      'rent arrears claim help',
      'tenant debt claim support',
      'letter before claim help',
      'particulars of claim support',
      'mcol preparation help',
      'claim unpaid rent help',
      'damage claim landlord',
      'debt evidence checklist',
      'england landlord claim prep',
    ],
  },
  possession: {
    title: 'Start Possession Claim Assisted Prep | Landlord Heaven',
    description:
      'Start possession claim assisted prep for N5, N119, notice evidence, bundle steps, and the court filing pack. Short intake and callback support.',
    keywords: [
      'start possession claim assisted prep',
      'possession claim callback',
      'n5 n119 help',
      'complete eviction pack help',
      'section 8 court pack support',
      'notice evidence review',
      'possession bundle checklist',
      'landlord court papers help',
      'eviction filing pack support',
      'n119 particulars help',
      'n5 possession claim preparation',
      'england possession claim help',
    ],
  },
};

function normaliseService(value: string | string[] | undefined): AssistedPrepService {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === 'money_claim' || raw === 'possession' || raw === 'section8') return raw;
  return 'section8';
}

export async function generateMetadata({ searchParams }: StartPageProps): Promise<Metadata> {
  const params = await searchParams;
  const service = normaliseService(params?.service);
  const seo = startSeo[service];

  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    alternates: {
      canonical: `/assisted-prep/start?service=${service}`,
    },
  };
}

export default async function AssistedPrepStartPage({ searchParams }: StartPageProps) {
  const params = await searchParams;
  const service = normaliseService(params?.service);
  const config = getAssistedPrepConfig(service);

  return (
    <>
      <HeaderConfig mode="solid" />
      <main className="bg-slate-50 px-4 py-12 md:py-16">
        <section className="mx-auto mb-8 max-w-5xl rounded-[2rem] bg-white p-6 shadow-sm md:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-700">
            {config.priceLabel} assisted prep
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
            {config.label}
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-700">
            {ASSISTED_PREP_PROMISE} Complete the short intake below so we can match your payment and callback to the right case.
          </p>
        </section>
        <div className="mx-auto mb-8 max-w-5xl">
          <AssistedPrepServiceDetails service={service} showCta={false} />
        </div>
        <Suspense fallback={<div className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow-sm">Loading assisted prep...</div>}>
          <AssistedPrepIntakeForm />
        </Suspense>
      </main>
    </>
  );
}
