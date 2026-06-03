import Link from 'next/link';
import type { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { AssistedPrepChecklist } from '@/components/assisted-prep/AssistedPrepChecklist';
import { AssistedPrepServiceDetails } from '@/components/assisted-prep/AssistedPrepServiceDetails';
import { getAssistedPrepConfig, ASSISTED_PREP_PROMISE } from '@/lib/assisted-prep';

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
      <main className="bg-slate-50 px-4 py-12 md:py-16">
        <div className="mx-auto max-w-5xl space-y-8">
          <section className="rounded-2xl bg-white p-8 shadow-sm">
            <p className="text-sm font-semibold text-violet-700">{service.priceLabel} assisted prep</p>
            <h1 className="mt-3 text-4xl font-bold text-slate-950">{service.label}</h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-700">
              {ASSISTED_PREP_PROMISE} Use this when you want help turning rent, damage, bills, or other tenant debt into a clearer claim pack.
            </p>
            <Link href={service.startHref} className="mt-6 inline-flex rounded-lg bg-violet-700 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-800">
              Start assisted prep
            </Link>
          </section>
          <AssistedPrepServiceDetails service="money_claim" />
          <AssistedPrepChecklist service="money_claim" />
        </div>
      </main>
    </>
  );
}
