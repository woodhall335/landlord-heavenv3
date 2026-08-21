import type { Metadata } from 'next';
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { AssistedPrepIntakeForm } from '@/components/assisted-prep/AssistedPrepIntakeForm';
import { AssistedPrepServiceDetails } from '@/components/assisted-prep/AssistedPrepServiceDetails';
import { UniversalHero } from '@/components/landing/UniversalHero';
import {
  isPublicAssistedPrepService,
  type PublicAssistedPrepService,
} from '@/lib/assisted-prep';

type StartPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const startSeo: Record<PublicAssistedPrepService, { title: string; description: string; keywords: string[] }> = {
  section8: {
    title: 'Landlord Section 8 Notice Assistance | Free Consultation',
    description:
      'Book a free consultation for landlord Section 8 notice assistance in England. Pay only if we confirm we can help.',
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
    title: 'Landlord Eviction Assistance Service | Free Consultation',
    description:
      'Book a free consultation for landlord eviction assistance and possession-claim preparation in England. Pay only if we confirm we can help.',
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

const heroContent: Record<PublicAssistedPrepService, {
  preTitleLabel: string;
  title: string;
  subtitle: string;
}> = {
  section8: {
    preTitleLabel: 'Landlord Section 8 notice assistance',
    title: 'Get your Section 8 notice prepared with confidence',
    subtitle:
      'Start with a free consultation. We review the grounds, tenant details, notice dates, and service evidence before any paid document preparation is agreed.',
  },
  possession: {
    preTitleLabel: 'Landlord eviction assistance service',
    title: 'Prepare your possession claim with the right documents',
    subtitle:
      'Start with a free consultation. We review your served notice, expiry date, service evidence, and court paperwork before any paid document preparation is agreed.',
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
  const hero = heroContent[service];

  return (
    <>
      <HeaderConfig mode="solid" />
      <main className="bg-slate-50">
        <UniversalHero
          preset="product_owner"
          preTitleLabel={hero.preTitleLabel}
          title={hero.title}
          subtitle={hero.subtitle}
          primaryCta={{ label: 'Start free consultation', href: '#consultation-form' }}
          secondaryCta={{ label: "See what's included", href: '#whats-included' }}
          trustText="Free consultation first — pay only if we confirm we can help"
          showTrustPositioningBar
        />
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-20 lg:px-8">
          <div id="whats-included" className="scroll-mt-28">
            <AssistedPrepServiceDetails service={service} className="mx-auto max-w-5xl" showCta={false} />
          </div>
          <div id="consultation-form" className="mt-10 scroll-mt-28">
            <Suspense fallback={<div className="mx-auto max-w-3xl rounded-[2rem] bg-white p-6 shadow-sm md:p-8">Loading assisted prep...</div>}>
              <AssistedPrepIntakeForm />
            </Suspense>
          </div>
        </section>
      </main>
    </>
  );
}
