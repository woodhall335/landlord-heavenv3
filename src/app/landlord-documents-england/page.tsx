import type { Metadata } from 'next';
import Link from 'next/link';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { Container } from '@/components/ui/Container';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';
import { buildWizardLink } from '@/lib/wizard/buildWizardLink';

const canonicalUrl = getCanonicalUrl('/landlord-documents-england');

const GROUPS = [
  {
    title: 'Current tenancy agreement routes',
    description:
      'The retired England document landings now consolidate into the live tenancy agreement paths.',
    links: [
      {
        href: '/products/ast',
        label: 'England tenancy agreement hub',
        description:
          'Compare Standard, Premium, Student, HMO / Shared House, and Lodger routes from the current England hub.',
      },
      {
        href: '/premium-tenancy-agreement',
        label: 'Premium England tenancy agreement',
        description:
          'Use the premium route for fuller ordinary-residential drafting. Student, HMO / Shared House, and Lodger now have their own England routes.',
      },
      {
        href: buildWizardLink({
          product: 'ast_standard',
          jurisdiction: 'england',
          src: 'seo_landing',
          topic: 'tenancy',
        }),
        label: 'Start the tenancy wizard',
        description: 'Go straight into the current guided England tenancy flow.',
      },
    ],
  },
  {
    title: 'Arrears and debt recovery',
    description:
      'Arrears-focused retired pages now roll into the current claim and demand-letter paths.',
    links: [
      {
        href: '/money-claim',
        label: 'Money claim pack',
        description: 'Recover unpaid rent and other tenancy debts through the live commercial arrears route.',
      },
      {
        href: '/rent-arrears-letter-template',
        label: 'Rent arrears letter template',
        description: 'Use the retained guide if you need template-level arrears communication first.',
      },
      {
        href: '/tools/free-rent-demand-letter',
        label: 'Free rent demand letter tool',
        description: 'Generate a basic rent demand letter without relying on a retired product page.',
      },
    ],
  },
  {
    title: 'Supporting landlord resources',
    description:
      'Use the live hubs and guides below instead of the retired standalone England document landings.',
    links: [
      {
        href: '/tenancy-agreements',
        label: 'Tenancy agreements hub',
        description: 'Compare the live UK agreement routes from one place.',
      },
      {
        href: '/products/ast',
        label: 'Compare tenancy products',
        description: 'See the current commercial tenancy options without the retired England document pages.',
      },
      {
        href: '/money-claim-unpaid-rent',
        label: 'Unpaid rent guide',
        description: 'Read the retained arrears guide for evidence, pre-action steps, and claim preparation.',
      },
    ],
  },
] as const;

export const metadata: Metadata = {
  title: 'England Landlord Documents | Live Tenancy and Arrears Routes',
  description:
    'Bridge page for retired England landlord document intent, routing landlords into the current tenancy, arrears, and product pages that remain live.',
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'England Landlord Documents | Live Tenancy and Arrears Routes',
    description:
      'Use the current England tenancy agreement chooser, dedicated England tenancy products, and money-claim destinations instead of the retired England document pages.',
    url: canonicalUrl,
    type: 'website',
  },
};

export default function LandlordDocumentsEnglandPage() {
  return (
    <div className="min-h-screen bg-[#f8f5ee]">
      <HeaderConfig mode="autoOnScroll" />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: getCanonicalUrl('/') },
          { name: 'England landlord documents', url: canonicalUrl },
        ])}
      />

      <main>
        <UniversalHero
          title="England landlord documents"
          subtitle="This bridge page now routes older England document intent into the smaller set of live tenancy and arrears destinations that remain part of the public site."
          primaryCta={{ label: 'Browse live routes', href: '#documents' }}
          secondaryCta={{ label: 'View England tenancy hub', href: '/products/ast' }}
          align="center"
        />

        <Container className="py-10">
          <div className="mx-auto max-w-5xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Bridge page</p>
            <p className="mt-3 text-lg leading-8 text-slate-700">
              The older standalone England document pages have been retired. Use the live routes below to reach the current public entry points without dead ends.
            </p>
          </div>
        </Container>

        <Container className="pb-16" id="documents">
          <div className="space-y-12">
            {GROUPS.map((group) => (
              <section key={group.title}>
                <div className="mx-auto max-w-5xl">
                  <h2 className="text-3xl font-bold text-slate-950">{group.title}</h2>
                  <p className="mt-3 max-w-3xl text-lg leading-8 text-slate-700">{group.description}</p>
                </div>
                <div className="mx-auto mt-8 grid max-w-6xl gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {group.links.map((link) => (
                    <article
                      key={link.href}
                      className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"
                    >
                      <h3 className="text-xl font-bold text-slate-950">{link.label}</h3>
                      <p className="mt-4 text-sm leading-7 text-slate-700">{link.description}</p>
                      <div className="mt-6">
                        <Link
                          href={link.href}
                          className="rounded-xl bg-slate-950 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-slate-800 inline-flex"
                        >
                          Open route
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </Container>
      </main>
    </div>
  );
}
