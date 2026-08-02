import type { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { AssistedPrepAllServiceDetails } from '@/components/assisted-prep/AssistedPrepServiceDetails';
import { AssistedPrepServicesShowcase } from '@/components/assisted-prep/AssistedPrepServicesShowcase';
import { ASSISTED_PREP_PROMISE } from '@/lib/assisted-prep';
import { UniversalHero } from '@/components/landing/UniversalHero';

export const metadata: Metadata = {
  title: 'Assisted Landlord Document Prep | Landlord Heaven',
  description:
    'Book assisted preparation for Section 8 notices, money claims, and possession claim packs. Prepared for you, checked with you, approved and sent by you.',
  keywords: [
    'assisted landlord document prep',
    'section 8 assisted prep',
    'form 3a assisted preparation',
    'possession claim assisted prep',
    'n5 n119 assisted prep',
    'money claim assisted prep',
    'landlord callback document service',
    'eviction notice preparation help',
    'rent arrears claim preparation',
    'landlord possession pack help',
    'landlord document callback',
    'england landlord document prep',
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
          preTitleLabel="Assisted landlord document preparation"
          title={ASSISTED_PREP_PROMISE}
          subtitle="Choose this when you do not want to work through the document pack alone. We collect the essentials, you pay securely, then prepare the pack with you on a focused callback."
          primaryCta={{ label: 'Choose an assisted service', href: '#assisted-prep-services' }}
          secondaryCta={{ label: 'See what is included', href: '#assisted-prep-details' }}
          trustText="England landlord document preparation with a clear scope and secure checkout"
          showTrustPositioningBar
        />
        <section id="assisted-prep-services" className="mx-auto max-w-6xl scroll-mt-28 px-4 py-16 md:py-24">
          <AssistedPrepServicesShowcase
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
