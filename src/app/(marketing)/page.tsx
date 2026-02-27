import Link from 'next/link';
import { Metadata } from 'next';
import { StructuredData, websiteSchema } from '@/lib/seo/structured-data';

export const metadata: Metadata = {
  title: {
    absolute:
      'Solicitor-Grade Landlord Documents | Eviction Notices, Tenancy Agreements & Money Claims',
  },
  description:
    'Create legally validated landlord documents including eviction notices, tenancy agreements, and court-ready money claims. Start the correct legal route in minutes.',
  openGraph: {
    title:
      'Solicitor-Grade Landlord Documents | Eviction Notices, Tenancy Agreements & Money Claims',
    description:
      'Create legally validated landlord documents including eviction notices, tenancy agreements, and court-ready money claims. Start the correct legal route in minutes.',
    type: 'website',
    url: 'https://landlordheaven.co.uk',
  },
  alternates: {
    canonical: 'https://landlordheaven.co.uk',
  },
};

const primaryPaths = [
  {
    label: 'Start Eviction',
    href: '/wizard?product=notice_only&topic=eviction&src=seo_homepage',
  },
  {
    label: 'Recover Unpaid Rent',
    href: '/wizard?product=money_claim&topic=debt&src=seo_homepage',
  },
  {
    label: 'Create Tenancy Agreement',
    href: '/wizard?product=tenancy_agreement&topic=tenancy&src=seo_homepage',
  },
];

export default function HomePage() {
  return (
    <>
      <StructuredData data={websiteSchema()} />

      <main className="mx-auto max-w-7xl px-4 pb-20 pt-12 sm:px-6 lg:px-8">
        <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-600">Legal decision gateway</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Solicitor-Grade Landlord Documents. Ready for Court.
          </h1>
          <p className="mt-4 max-w-3xl text-lg text-slate-700">
            Create legally validated eviction notices, tenancy agreements, and rent recovery claims in
            minutes.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {primaryPaths.map((path) => (
              <Link
                key={path.label}
                href={path.href}
                className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-5 py-3 text-center text-sm font-semibold text-slate-900 transition hover:border-slate-900 hover:bg-slate-50"
              >
                {path.label}
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">What Do You Need To Do?</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <article className="rounded-xl border border-slate-200 bg-white p-6">
              <h3 className="text-lg font-semibold text-slate-900">Evict a Tenant</h3>
              <p className="mt-2 text-slate-700">
                When a tenant breaches the agreement or won’t leave, start the correct legal notice.
              </p>
              <ul className="mt-4 space-y-2 text-sm font-medium text-slate-900">
                <li>
                  <Link href="/form-3-section-8" className="underline-offset-2 hover:underline">
                    Section 8 Notice
                  </Link>
                </li>
                <li>
                  <Link href="/section-21-notice-template" className="underline-offset-2 hover:underline">
                    Section 21 Notice
                  </Link>
                </li>
                <li>
                  <Link href="/possession-claim-guide" className="underline-offset-2 hover:underline">
                    Possession Claim
                  </Link>
                </li>
              </ul>
            </article>

            <article className="rounded-xl border border-slate-200 bg-white p-6">
              <h3 className="text-lg font-semibold text-slate-900">Recover Rent or Costs</h3>
              <p className="mt-2 text-slate-700">
                If rent is unpaid or property is damaged, issue a legally compliant money claim.
              </p>
              <ul className="mt-4 space-y-2 text-sm font-medium text-slate-900">
                <li>
                  <Link href="/money-claim-n1-claim-form" className="underline-offset-2 hover:underline">
                    Money Claim Online (MCOL)
                  </Link>
                </li>
                <li>
                  <Link href="/money-claim-unpaid-rent" className="underline-offset-2 hover:underline">
                    Rent Arrears Claim
                  </Link>
                </li>
                <li>
                  <Link href="/money-claim-property-damage" className="underline-offset-2 hover:underline">
                    Claim for Property Damage
                  </Link>
                </li>
              </ul>
            </article>

            <article className="rounded-xl border border-slate-200 bg-white p-6">
              <h3 className="text-lg font-semibold text-slate-900">Create or Update an Agreement</h3>
              <p className="mt-2 text-slate-700">
                Draft or update legally compliant tenancy agreements for England, Wales, Scotland, or NI.
              </p>
              <ul className="mt-4 space-y-2 text-sm font-medium text-slate-900">
                <li>
                  <Link href="/assured-shorthold-tenancy-agreement" className="underline-offset-2 hover:underline">
                    AST (England)
                  </Link>
                </li>
                <li>
                  <Link
                    href="/prt-tenancy-agreement-template-scotland"
                    className="underline-offset-2 hover:underline"
                  >
                    PRT (Scotland)
                  </Link>
                </li>
                <li>
                  <Link
                    href="/renting-homes-wales-written-statement"
                    className="underline-offset-2 hover:underline"
                  >
                    Occupation Contract (Wales)
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tenancy-agreement-template-northern-ireland"
                    className="underline-offset-2 hover:underline"
                  >
                    NI Tenancy Agreement
                  </Link>
                </li>
              </ul>
            </article>
          </div>
        </section>

        <section className="mt-14 rounded-2xl border border-slate-200 bg-slate-50 p-8">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Not Sure Which Route Applies?</h2>
          <div className="mt-4 space-y-3 text-slate-700">
            <p>
              Compare <Link href="/section-8-vs-section-21" className="font-semibold text-slate-900 underline-offset-2 hover:underline">Section 8 vs Section 21</Link> to choose the right notice based on grounds, timing, and possession strategy.
            </p>
            <p>
              Understand <Link href="/how-to-evict-tenant" className="font-semibold text-slate-900 underline-offset-2 hover:underline">eviction routes</Link> versus <Link href="/money-claim" className="font-semibold text-slate-900 underline-offset-2 hover:underline">money claim routes</Link> when you need possession, debt recovery, or both.
            </p>
            <p>
              Check <Link href="/fixed-term-periodic-tenancy-england" className="font-semibold text-slate-900 underline-offset-2 hover:underline">fixed-term vs periodic tenancy rules</Link> before serving notice or changing agreement terms.
            </p>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">The Landlord Legal Lifecycle</h2>
          <p className="mt-3 text-slate-700">
            <Link href="/tenancy-agreement" className="font-semibold text-slate-900 underline-offset-2 hover:underline">Agreement</Link> →{' '}
            <Link href="/tenant-damaging-property" className="font-semibold text-slate-900 underline-offset-2 hover:underline">Breach</Link> →{' '}
            <Link href="/eviction-notice" className="font-semibold text-slate-900 underline-offset-2 hover:underline">Notice</Link> →{' '}
            <Link href="/apply-possession-order-landlord" className="font-semibold text-slate-900 underline-offset-2 hover:underline">Possession</Link> →{' '}
            <Link href="/money-claim" className="font-semibold text-slate-900 underline-offset-2 hover:underline">Money Claim</Link>
          </p>
        </section>

        <section className="mt-14 rounded-2xl border border-slate-200 bg-white p-8">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Start the Correct Legal Route</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {primaryPaths.map((path) => (
              <Link
                key={`final-${path.label}`}
                href={path.href}
                className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-5 py-3 text-center text-sm font-semibold text-slate-900 transition hover:border-slate-900 hover:bg-slate-50"
              >
                {path.label.replace('Unpaid ', '').replace('Tenancy ', '')}
              </Link>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
