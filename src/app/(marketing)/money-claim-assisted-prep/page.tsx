import type { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { AssistedPrepChecklist } from '@/components/assisted-prep/AssistedPrepChecklist';
import { AssistedPrepServiceDetails } from '@/components/assisted-prep/AssistedPrepServiceDetails';
import { getAssistedPrepConfig, ASSISTED_PREP_PROMISE } from '@/lib/assisted-prep';
import { UniversalHero } from '@/components/landing/UniversalHero';

const service = getAssistedPrepConfig('money_claim');

export const metadata: Metadata = {
  title: 'Money Claim Assisted Prep | Landlord Heaven',
  description:
    'Book money claim assisted prep for landlords. We help organise the debt, evidence, pre-action position, claim wording, and claim-ready pack.',
  keywords: [
    'money claim assisted prep',
    'landlord money claim help',
    'rent arrears claim preparation',
    'tenant debt claim help',
    'letter before claim support',
    'particulars of claim preparation',
    'money claim callback service',
    'claim unpaid rent help',
    'tenant damage claim preparation',
    'landlord debt recovery documents',
    'mcol preparation help',
    'england landlord money claim',
  ],
  alternates: {
    canonical: '/money-claim-assisted-prep',
  },
};

export default function MoneyClaimAssistedPrepPage() {
  return (
    <>
      <HeaderConfig mode="solid" />
      <main className="bg-slate-50">
        <UniversalHero
          preTitleLabel={`${service.priceLabel} assisted prep`}
          title={service.label}
          subtitle={`${ASSISTED_PREP_PROMISE} Use this when you want help turning rent, damage, bills, or other tenant debt into a clearer claim pack.`}
          primaryCta={{ label: 'Start assisted prep', href: service.startHref }}
          secondaryCta={{ label: 'See service details', href: '#service-details' }}
          trustText="Focused landlord money-claim preparation for England"
        />
        <div id="service-details" className="mx-auto max-w-5xl scroll-mt-28 space-y-8 px-4 py-12 md:py-16">
          <AssistedPrepServiceDetails service="money_claim" />
          <AssistedPrepChecklist service="money_claim" />
        </div>
      </main>
    </>
  );
}
