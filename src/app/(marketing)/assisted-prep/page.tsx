import Link from 'next/link';
import type { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { ASSISTED_PREP_PROMISE, ASSISTED_PREP_SERVICES } from '@/lib/assisted-prep';

export const metadata: Metadata = {
  title: 'Assisted Landlord Document Prep | Landlord Heaven',
  description:
    'Book assisted preparation for Section 8 notices, money claims, and possession claim packs. Prepared for you, checked with you, approved and sent by you.',
};

export default function AssistedPrepHubPage() {
  return (
    <>
      <HeaderConfig mode="autoOnScroll" />
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

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {ASSISTED_PREP_SERVICES.map((service) => (
              <article key={service.sku} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold text-violet-700">{service.priceLabel}</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-950">{service.label}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-700">{service.duration}. You approve and send, serve, or file the documents.</p>
                <Link
                  href={service.startHref}
                  className="mt-5 inline-flex rounded-lg bg-violet-700 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-800"
                >
                  Start assisted prep
                </Link>
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
