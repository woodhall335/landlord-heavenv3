import type { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { AssistedPrepChecklist } from '@/components/assisted-prep/AssistedPrepChecklist';
import { AssistedPrepServiceDetails } from '@/components/assisted-prep/AssistedPrepServiceDetails';
import { getAssistedPrepConfig, ASSISTED_PREP_PROMISE } from '@/lib/assisted-prep';
import { UniversalHero } from '@/components/landing/UniversalHero';

const service = getAssistedPrepConfig('section8');

export const metadata: Metadata = {
  title: 'Assisted Eviction Notice Preparation | Free Consultation',
  description:
    'Book a free consultation for assisted eviction notice preparation in England. We confirm whether we can help before sending any payment link.',
  keywords: [
    'assisted eviction notice preparation',
    'assisted eviction service',
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
      <main className="bg-slate-50">
        <UniversalHero
          preTitleLabel="Assisted eviction notice preparation"
          title="Get the notice route checked before you pay"
          subtitle={`${ASSISTED_PREP_PROMISE} Book a free consultation for Form 3A, grounds, dates, service evidence, and the notice pack before you serve it. This is document preparation, not legal representation.`}
          primaryCta={{ label: 'Book free consultation', href: service.startHref }}
          secondaryCta={{ label: 'See service details', href: '#service-details' }}
          trustText="Pay only if we confirm the preparation service is suitable"
        />
        <div id="service-details" className="mx-auto max-w-5xl scroll-mt-28 space-y-8 px-4 py-12 md:py-16">
          <AssistedPrepServiceDetails service="section8" />
          <AssistedPrepChecklist service="section8" />
        </div>
      </main>
    </>
  );
}
