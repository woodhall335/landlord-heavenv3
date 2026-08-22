import type { Metadata } from 'next';
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { AssistedPrepIntakeForm } from '@/components/assisted-prep/AssistedPrepIntakeForm';
import { AssistedPrepServiceDetails } from '@/components/assisted-prep/AssistedPrepServiceDetails';
import { UniversalHero } from '@/components/landing/UniversalHero';
import {
  getAssistedPrepConfig,
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
  imageSrc: string;
  imageAlt: string;
}> = {
  section8: {
    preTitleLabel: 'Landlord Section 8 notice assistance',
    title: 'Get your Section 8 notice prepared with confidence',
    subtitle:
      'Tell us what has happened, then book a free consultation. We check the grounds, tenant details, notice dates and service evidence before agreeing any paid preparation.',
    imageSrc: '/images/heroes/library/hero-assisted-section8-v2.webp',
    imageAlt: 'Watercolour illustration of Section 8 notice documents, a calendar and property keys',
  },
  possession: {
    preTitleLabel: 'Landlord eviction assistance service',
    title: 'Prepare your possession claim with the right documents',
    subtitle:
      'Tell us what has happened, then book a free consultation. We check your served notice, expiry date, service evidence and court paperwork before agreeing any paid preparation.',
    imageSrc: '/images/heroes/library/hero-assisted-possession-v2.webp',
    imageAlt: 'Watercolour illustration of possession claim papers, court documents and property keys',
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
  const config = getAssistedPrepConfig(service);

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
          feature={`Assisted preparation: ${config.priceLabel} — payable only if we confirm we can help.`}
          trustText="Free consultation first — pay only if we confirm we can help"
          showTrustPositioningBar
          verticalAlign="top"
          contentWidth="wide"
          backgroundImageSrc={hero.imageSrc}
          backgroundImageAlt={hero.imageAlt}
        />
        <section className="mx-auto max-w-[112rem] px-5 py-16 sm:px-8 md:py-20 lg:px-10 2xl:px-12">
          <div id="whats-included" className="scroll-mt-28">
            <AssistedPrepServiceDetails service={service} showCta={false} />
          </div>
          <div id="consultation-form" className="mt-10 scroll-mt-28">
            <Suspense fallback={<div className="rounded-[2rem] bg-white p-6 shadow-sm md:p-8">Loading assisted prep...</div>}>
              <AssistedPrepIntakeForm className="mx-auto max-w-[88rem]" />
            </Suspense>
          </div>
        </section>
      </main>
    </>
  );
}
