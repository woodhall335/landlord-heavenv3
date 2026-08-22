import type { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { AssistedPrepAllServiceDetails } from '@/components/assisted-prep/AssistedPrepServiceDetails';
import { AssistedPrepServicesShowcase } from '@/components/assisted-prep/AssistedPrepServicesShowcase';
import { AssistedPrepVisualExplainer } from '@/components/assisted-prep/AssistedPrepVisualExplainer';
import { UniversalHero } from '@/components/landing/UniversalHero';

export const metadata: Metadata = {
  title: 'Assisted Eviction Service | Free Landlord Consultation',
  description:
    'Book a free consultation for assisted eviction notice preparation or an assisted possession-claim service in England. Pay only if we confirm we can help.',
  keywords: [
    'assisted eviction service',
    'assisted eviction notice preparation',
    'section 8 notice preparation service',
    'form 3a preparation help',
    'possession claim preparation service',
    'n5 n119 preparation help',
    'free landlord eviction consultation',
    'england landlord document preparation',
  ],
  alternates: {
    canonical: '/assisted-prep',
  },
};

export default function AssistedPrepHubPage() {
  return (
    <>
      <HeaderConfig mode="solid" />
      <main className="bg-slate-50">
        <UniversalHero
          preset="product_owner"
          preTitleLabel="Assisted eviction service for England landlords"
          title="Book a free consultation before you pay"
          subtitle="We review the essentials first. If we can help with your eviction notice or possession-claim paperwork, we will confirm the scope and send a secure Stripe payment link afterwards. This is document preparation, not legal representation."
          primaryCta={{ label: 'Book a free consultation', href: '#assisted-prep-services' }}
          secondaryCta={{ label: 'See what is included', href: '#assisted-prep-details' }}
          trustText="Clear document-preparation scope before any paid work begins"
          showTrustPositioningBar
          verticalAlign="top"
          contentWidth="wide"
          backgroundImageSrc="/images/heroes/library/hero-assisted-prep-overview-v2.webp"
          backgroundImageAlt="Watercolour illustration of landlord document preparation and property keys"
        />
        <section id="assisted-prep-services" className="mx-auto max-w-[112rem] scroll-mt-28 px-5 py-16 sm:px-8 md:py-20 lg:px-10 2xl:px-12">
          <div className="mb-10">
            <AssistedPrepVisualExplainer service="overview" />
          </div>
          <AssistedPrepServicesShowcase
            className="!mt-0"
            pagePath="/assisted-prep"
            pageType="entry_page"
            src="assisted_prep_hub"
          />
          <div id="assisted-prep-details" className="scroll-mt-28">
            <AssistedPrepAllServiceDetails className="mt-10" />
          </div>
        </section>
      </main>
    </>
  );
}
