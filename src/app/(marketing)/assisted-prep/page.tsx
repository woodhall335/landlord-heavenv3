import type { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { AssistedPrepAllServiceDetails } from '@/components/assisted-prep/AssistedPrepServiceDetails';
import { AssistedPrepServicesShowcase } from '@/components/assisted-prep/AssistedPrepServicesShowcase';
import { ASSISTED_PREP_PROMISE } from '@/lib/assisted-prep';

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
        <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-700">
              Assisted prep
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
              {ASSISTED_PREP_PROMISE}
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-700">
              Choose this when you do not want to work through the document pack alone. We collect the essentials, you pay securely, then we prepare the pack with you on a callback.
            </p>
          </div>

          <AssistedPrepServicesShowcase
            pagePath="/assisted-prep"
            pageType="entry_page"
            src="assisted_prep_hub"
          />
          <AssistedPrepAllServiceDetails className="mt-10" />
        </section>
      </main>
    </>
  );
}
