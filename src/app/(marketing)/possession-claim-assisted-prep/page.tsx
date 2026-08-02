import type { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { AssistedPrepChecklist } from '@/components/assisted-prep/AssistedPrepChecklist';
import { AssistedPrepServiceDetails } from '@/components/assisted-prep/AssistedPrepServiceDetails';
import { getAssistedPrepConfig, ASSISTED_PREP_PROMISE } from '@/lib/assisted-prep';
import { UniversalHero } from '@/components/landing/UniversalHero';

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
      <main className="bg-slate-50">
        <UniversalHero
          preTitleLabel={`${service.priceLabel} assisted prep`}
          title={service.label}
          subtitle={`${ASSISTED_PREP_PROMISE} Use this when you want help preparing or checking N5, N119, notice evidence, and the filing pack.`}
          primaryCta={{ label: 'Start assisted prep', href: service.startHref }}
          secondaryCta={{ label: 'See service details', href: '#service-details' }}
          trustText="Focused possession-claim preparation for England landlords"
        />
        <div id="service-details" className="mx-auto max-w-5xl scroll-mt-28 space-y-8 px-4 py-12 md:py-16">
          <AssistedPrepServiceDetails service="possession" />
          <AssistedPrepChecklist service="possession" />
        </div>
      </main>
    </>
  );
}
