import type { Metadata } from 'next';
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { AssistedPrepIntakeForm } from '@/components/assisted-prep/AssistedPrepIntakeForm';
import { AssistedPrepServiceDetails } from '@/components/assisted-prep/AssistedPrepServiceDetails';
import {
  ASSISTED_PREP_PROMISE,
  getAssistedPrepConfig,
  isPublicAssistedPrepService,
  type PublicAssistedPrepService,
} from '@/lib/assisted-prep';

type StartPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const startSeo: Record<PublicAssistedPrepService, { title: string; description: string; keywords: string[] }> = {
  section8: {
    title: 'Book Free Assisted Eviction Notice Consultation | Landlord Heaven',
    description:
      'Book a free consultation for assisted eviction notice preparation in England. Pay only if we confirm we can help.',
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
  possession: {
    title: 'Book Free Assisted Eviction Consultation | Landlord Heaven',
    description:
      'Book a free consultation for assisted possession-claim preparation in England. Pay only if we confirm we can help.',
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

function normaliseService(value: string | string[] | undefined): PublicAssistedPrepService | null {
  const raw = Array.isArray(value) ? value[0] : value;
  return isPublicAssistedPrepService(raw) ? raw : null;
}

export async function generateMetadata({ searchParams }: StartPageProps): Promise<Metadata> {
  const params = await searchParams;
  const service = normaliseService(params?.service) || 'section8';
  const seo = startSeo[service];

  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    robots: {
      index: false,
      follow: true,
    },
    alternates: {
      canonical: `/assisted-prep`,
    },
  };
}

export default async function AssistedPrepStartPage({ searchParams }: StartPageProps) {
  const params = await searchParams;
  const service = normaliseService(params?.service);
  if (!service) redirect('/assisted-prep');
  const config = getAssistedPrepConfig(service);

  return (
    <>
      <HeaderConfig mode="solid" />
      <main className="bg-slate-50 px-4 py-12 md:py-16">
        <section className="mx-auto mb-8 max-w-5xl rounded-[2rem] bg-white p-6 shadow-sm md:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-700">
            Free consultation
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
            {config.label}
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-700">
            {ASSISTED_PREP_PROMISE} Complete the short intake below, then book a free consultation. We only send a Stripe payment link if we confirm we can help.
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
