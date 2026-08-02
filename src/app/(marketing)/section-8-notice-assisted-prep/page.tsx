import type { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { AssistedPrepChecklist } from '@/components/assisted-prep/AssistedPrepChecklist';
import { AssistedPrepServiceDetails } from '@/components/assisted-prep/AssistedPrepServiceDetails';
import { getAssistedPrepConfig, ASSISTED_PREP_PROMISE } from '@/lib/assisted-prep';
import { UniversalHero } from '@/components/landing/UniversalHero';

const service = getAssistedPrepConfig('section8');

export const metadata: Metadata = {
  title: 'Section 8 Notice Assisted Prep | Landlord Heaven',
  description:
    'Book Section 8 assisted prep for England landlords. We help prepare or check the Form 3A notice, grounds, dates, service file, and evidence prompts.',
  keywords: [
    'section 8 assisted prep',
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
          preTitleLabel={`${service.priceLabel} assisted prep`}
          title={service.label}
          subtitle={`${ASSISTED_PREP_PROMISE} Use this when you want help preparing or checking the Form 3A notice and service pack before you serve it.`}
          primaryCta={{ label: 'Start assisted prep', href: service.startHref }}
          secondaryCta={{ label: 'See service details', href: '#service-details' }}
          trustText="Focused Section 8 document preparation for England landlords"
        />
        <div id="service-details" className="mx-auto max-w-5xl scroll-mt-28 space-y-8 px-4 py-12 md:py-16">
          <AssistedPrepServiceDetails service="section8" />
          <AssistedPrepChecklist service="section8" />
        </div>
      </main>
    </>
  );
}
