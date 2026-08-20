import type { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { AssistedPrepChecklist } from '@/components/assisted-prep/AssistedPrepChecklist';
import { AssistedPrepServiceDetails } from '@/components/assisted-prep/AssistedPrepServiceDetails';
import { getAssistedPrepConfig, ASSISTED_PREP_PROMISE } from '@/lib/assisted-prep';
import { UniversalHero } from '@/components/landing/UniversalHero';

const service = getAssistedPrepConfig('possession');

export const metadata: Metadata = {
  title: 'Assisted Eviction Service | Possession Claim Preparation',
  description:
    'Book a free consultation for assisted possession-claim preparation in England. We confirm whether we can help before sending any payment link.',
  keywords: [
    'assisted eviction service',
    'assisted possession claim preparation',
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
          preTitleLabel="Assisted eviction service"
          title="Check the possession claim file before you pay"
          subtitle={`${ASSISTED_PREP_PROMISE} Book a free consultation for N5, N119, notice evidence, bundle steps, and the filing pack. This is document preparation, not legal representation.`}
          primaryCta={{ label: 'Book free consultation', href: service.startHref }}
          secondaryCta={{ label: 'See service details', href: '#service-details' }}
          trustText="Pay only if we confirm the preparation service is suitable"
        />
        <div id="service-details" className="mx-auto max-w-5xl scroll-mt-28 space-y-8 px-4 py-12 md:py-16">
          <AssistedPrepServiceDetails service="possession" />
          <AssistedPrepChecklist service="possession" />
        </div>
      </main>
    </>
  );
}
