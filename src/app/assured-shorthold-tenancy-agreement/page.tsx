import type { Metadata } from 'next';
import Link from 'next/link';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { FAQSection } from '@/components/seo/FAQSection';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/assured-shorthold-tenancy-agreement');
const wizardHref = '/wizard?product=ast_standard&src=assured_shorthold_tenancy_agreement&topic=tenancy';
const premiumWizardHref = '/wizard?product=ast_premium&src=assured_shorthold_tenancy_agreement&topic=tenancy';

export const metadata: Metadata = {
  title: 'Assured Shorthold Tenancy Agreement 2026 | England Agreement Updated',
  description:
    'Create the updated 2026 England tenancy agreement online. Built for landlords searching for an assured shorthold tenancy agreement.',
  keywords: [
    'assured shorthold tenancy agreement',
    'ast agreement england',
    'assured shorthold tenancy agreement england',
    'england tenancy agreement 2026',
    'new tenancy agreement england',
    'residential tenancy agreement england',
    'renters rights compliant tenancy agreement',
    'england landlord agreement',
    'updated ast agreement england',
    'england tenancy contract template',
  ],
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'Assured Shorthold Tenancy Agreement 2026 | England Agreement Updated',
    description:
      'Use the updated 2026 England tenancy agreement flow for assured shorthold tenancy agreement searches, with wording designed for the assured periodic framework from 1 May 2026.',
    url: canonicalUrl,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Assured Shorthold Tenancy Agreement 2026 | England Agreement Updated',
    description:
      "Use the updated 2026 England tenancy agreement flow for assured shorthold tenancy agreement searches.",
  },
};

const faqs = [
  {
    question: 'Is this still an assured shorthold tenancy agreement?',
    answer:
      'This page captures assured shorthold tenancy agreement search intent, but the live Landlord Heaven route is now positioned as the updated England Tenancy Agreement 2026 rather than using older AST-first product language.',
  },
  {
    question: 'Why keep assured shorthold tenancy agreement wording on the page?',
    answer:
      'Because many landlords in England still search using assured shorthold tenancy agreement terminology. This page keeps that search demand while moving users into the newer England agreement flow with more modern wording and stronger product positioning.',
  },
  {
    question: 'How does this relate to the 1 May 2026 England changes?',
    answer:
      'The page is positioned around a newer England agreement route designed for the assured periodic framework from 1 May 2026. It should not be sold as a new fixed-term AST product in the old sense.',
  },
  {
    question: 'What should an England tenancy agreement include?',
    answer:
      'A strong England tenancy agreement should cover the parties, property, rent, deposit terms, tenancy structure, repair responsibilities, tenant obligations, property use clauses and practical landlord protections in clear written wording.',
  },
  {
    question: 'Who is this page for?',
    answer:
      'It is for landlords in England who still search for assured shorthold tenancy agreement wording but need a more modern 2026 tenancy agreement route rather than relying on thin legacy AST-only landing pages.',
  },
  {
    question: 'What is the difference between standard and premium?',
    answer:
      'The standard option suits many straightforward England lets. The premium option is better where a landlord wants extra clauses, broader wording, or more detailed drafting for more complex real-world situations.',
  },
  {
    question: 'Can I still rank for AST terms without selling the product as an AST?',
    answer:
      'Yes. That is the purpose of this page. It captures assured shorthold tenancy agreement demand while moving users into the updated England agreement flow with newer public-facing product language.',
  },
  {
    question: 'Can I use an old AST template for a new England tenancy?',
    answer:
      'You may want a stronger and more current route than an old thin AST template. This page is designed to move landlords into a modern 2026 England agreement flow with better commercial and SEO positioning.',
  },
];

export default function AssuredShortholdTenancyAgreementPage() {
  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Assured Shorthold Tenancy Agreement 2026',
    description:
      'Create the updated 2026 England tenancy agreement online for landlords searching for an assured shorthold tenancy agreement.',
    url: canonicalUrl,
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <HeaderConfig mode="autoOnScroll" />

      <StructuredData data={pageSchema} />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: getCanonicalUrl('/') },
          { name: 'Assured Shorthold Tenancy Agreement 2026', url: canonicalUrl },
        ])}
      />

      <main>
        <section className="bg-gradient-to-br from-red-50 via-white to-red-50 pt-24 pb-16">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto text-center">
              <div className="inline-flex items-center rounded-full bg-red-100 px-4 py-2 text-sm font-semibold text-red-800 mb-5">
                Updated England route for assured shorthold tenancy agreement searches
              </div>

              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Assured Shorthold Tenancy Agreement 2026
              </h1>

              <p className="text-xl text-gray-700 max-w-4xl mx-auto mb-4">
                If you are searching for an <strong>assured shorthold tenancy agreement</strong>,
                this is the updated England route. Landlord Heaven now positions the live product as
                the <strong>England Tenancy Agreement 2026</strong> with{' '}
                <strong>Renters&apos; Rights compliant</strong> wording.
              </p>

              <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
                This page keeps legacy AST search demand while moving landlords into the newer England
                agreement flow with stronger positioning, broader copy and a more competitive 2026
                landing page structure.
              </p>

              <div className="flex gap-4 justify-center flex-wrap">
                <Link
                  href={wizardHref}
                  className="inline-flex items-center justify-center rounded-lg bg-red-600 px-6 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-red-700"
                >
                  Start updated England agreement
                </Link>
                <Link
                  href={premiumWizardHref}
                  className="inline-flex items-center justify-center rounded-lg border-2 border-red-600 bg-white px-6 py-3 font-semibold text-red-600 shadow-sm transition-colors hover:bg-red-50"
                >
                  Use premium agreement
                </Link>
              </div>

              <p className="mt-4 text-sm text-gray-600">
                Legacy AST query capture • Updated England wording • Modern landlord flow
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto rounded-2xl border border-gray-100 bg-white p-8 md:p-10 shadow-sm">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                What is the new 2026 England Tenancy Agreement?
              </h2>
              <p className="text-gray-600 text-center mb-10 max-w-3xl mx-auto">
                This is the updated Landlord Heaven route for England landlords who still search for
                assured shorthold tenancy agreement wording but now need a more modern tenancy
                agreement journey.
              </p>

              <div className="space-y-5 text-gray-700 leading-relaxed">
                <p>
                  The <strong>England Tenancy Agreement 2026</strong> is the updated Landlord Heaven
                  positioning for England landlords creating a residential tenancy agreement. It
                  replaces older AST-first public language with broader England tenancy agreement
                  wording that better reflects current product positioning.
                </p>

                <p>
                  That change matters because many landlords still search for{' '}
                  <strong>assured shorthold tenancy agreement</strong>,{' '}
                  <strong>AST agreement England</strong>, or similar phrases, even when the stronger
                  landing-page experience is no longer a thin AST-only route.
                </p>

                <p>
                  This page is designed to bridge that gap. It preserves legacy search relevance while
                  guiding landlords into a stronger and more future-facing England agreement flow.
                </p>

                <p>
                  In practical terms, the page is now a real standalone landing page rather than only
                  a legacy explainer. It captures the old query but sells the updated England route.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Why this replaces old AST-first wording
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-3xl mx-auto">
                Assured shorthold tenancy agreement remains a powerful search term, but it is no
                longer the strongest way to frame the whole public product journey.
              </p>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Search demand still exists</h3>
                  <p className="text-gray-700">
                    Landlords continue to search for assured shorthold tenancy agreement wording, so
                    removing these pages entirely would leave real commercial traffic behind.
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">The product route is newer</h3>
                  <p className="text-gray-700">
                    The live England route is stronger when presented as an updated tenancy agreement
                    rather than staying tied to narrow legacy AST language.
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">2026 needs better framing</h3>
                  <p className="text-gray-700">
                    Newer wording gives cleaner conversion copy, stronger SEO coverage, and better
                    future-facing positioning for landlords.
                  </p>
                </div>
              </div>

              <div className="mt-10 max-w-4xl mx-auto space-y-5 text-gray-700 leading-relaxed">
                <p>
                  Older AST-first pages often rank because they match the legacy query, but they do
                  not always convert well because they feel thin, historic or too tied to outdated
                  public product language.
                </p>

                <p>
                  Stronger competitor pages usually do more. They answer the historic query, add
                  practical guidance, explain the current route, and then convert the visitor into
                  the live product journey. That is the model this page now follows.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto rounded-2xl border border-red-200 bg-red-50 p-8 md:p-10">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                How it relates to the Renters&apos; Rights Bill
              </h2>
              <p className="text-gray-700 text-center mb-10 max-w-3xl mx-auto">
                The updated England route is positioned around <strong>Renters&apos; Rights compliant</strong>{' '}
                wording rather than older assured shorthold tenancy agreement product language.
              </p>

              <div className="space-y-5 text-gray-700 leading-relaxed">
                <p>
                  This is one of the main reasons the page should not stay as a basic legacy bridge.
                  England landlords searching in 2026 want a tenancy agreement route that feels
                  current, commercially usable and aligned with the direction of tenancy reform.
                </p>

                <p>
                  By positioning the page around the <strong>updated England Tenancy Agreement</strong>,
                  Landlord Heaven can keep historic AST search intent while moving the product language
                  into a broader England tenancy agreement framework that references{' '}
                  <strong>Renters&apos; Rights</strong> expectations.
                </p>

                <p>
                  That makes the page stronger commercially and stronger for organic search. It means
                  the page can compete not only for AST terms but also for broader tenancy agreement
                  and landlord agreement searches in England.
                </p>

                <p>
                  Before publishing, your legal or compliance owner should approve the exact wording of
                  any compliance claim. If they prefer a softer formulation, replace “compliant” with a
                  phrase like “bill-ready” or “updated for Renters’ Rights changes.”
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Who this agreement is for
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-3xl mx-auto">
                The updated England route is for landlords who want something more useful than a thin
                legacy AST landing page.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">First-time England landlords</h3>
                  <p className="text-gray-700">
                    Useful if you want a clearer and more current route than copying wording from an
                    old assured shorthold tenancy agreement page.
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Landlords replacing older workflows</h3>
                  <p className="text-gray-700">
                    Ideal if your previous process relied on outdated AST-only landing pages and you
                    want a stronger 2026 agreement route.
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Straightforward private lets</h3>
                  <p className="text-gray-700">
                    The standard option is suitable for many standard England tenancy scenarios where
                    you need a modern written agreement route.
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Landlords wanting more detail</h3>
                  <p className="text-gray-700">
                    Premium is better where the landlord wants broader drafting, extra clauses and
                    stronger wording for more complex situations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                What landlords should include
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-3xl mx-auto">
                A strong England tenancy agreement should do more than reuse historic wording. It
                should set out the tenancy clearly and reduce avoidable disputes later.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Core agreement details</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>Landlord and tenant details</li>
                    <li>Property address and occupier details</li>
                    <li>Start date and tenancy structure</li>
                    <li>Rent amount and payment terms</li>
                    <li>Deposit wording</li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Practical landlord clauses</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>Repair responsibilities</li>
                    <li>Tenant obligations</li>
                    <li>Property use wording</li>
                    <li>Additional landlord protections</li>
                    <li>Clear written drafting for real-world use</li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Useful extra drafting</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>Guarantor wording where needed</li>
                    <li>Pet clauses where relevant</li>
                    <li>Utility and bill responsibility wording</li>
                    <li>Garden or shared-space clauses</li>
                    <li>Additional occupancy restrictions if needed</li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Commercial clarity</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>Clear fee and payment language</li>
                    <li>Practical default wording</li>
                    <li>Rent review wording where appropriate</li>
                    <li>End-of-tenancy expectations</li>
                    <li>Simple written structure for easier use later</li>
                  </ul>
                </div>
              </div>

              <p className="mt-8 text-gray-700 text-center max-w-3xl mx-auto">
                The aim is not just to generate a document. It is to create a cleaner, stronger and
                more competitive England landlord agreement route than a basic legacy AST page.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Common mistakes with old assured shorthold tenancy agreement pages
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-3xl mx-auto">
                One reason to modernise the page is that many landlords still rely on weak legacy
                template workflows.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
                  <h3 className="text-xl font-semibold text-red-900 mb-3">
                    Using thin legacy pages
                  </h3>
                  <p className="text-gray-700">
                    Old assured shorthold tenancy agreement pages often match the query but do little
                    to support the landlord with broader product guidance or stronger drafting context.
                  </p>
                </div>

                <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
                  <h3 className="text-xl font-semibold text-red-900 mb-3">
                    Treating AST as the whole product story
                  </h3>
                  <p className="text-gray-700">
                    The query may still be assured shorthold tenancy agreement, but the commercial
                    route can be stronger when framed as an updated England tenancy agreement.
                  </p>
                </div>

                <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
                  <h3 className="text-xl font-semibold text-red-900 mb-3">
                    Missing practical clauses
                  </h3>
                  <p className="text-gray-700">
                    Minimal agreements often do not give enough clarity around deposits, repairs,
                    property use, pets, guarantors or other everyday landlord issues.
                  </p>
                </div>

                <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
                  <h3 className="text-xl font-semibold text-red-900 mb-3">
                    Weak 2026 positioning
                  </h3>
                  <p className="text-gray-700">
                    Pages that never move beyond legacy AST language can look dated compared with
                    stronger competitors using broader and more current landlord wording.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                England Tenancy Agreement vs old AST terminology
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-3xl mx-auto">
                This page keeps assured shorthold tenancy agreement search coverage while using clearer
                2026 language and stronger commercial framing.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full rounded-xl border border-gray-200 bg-white">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">Topic</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">
                        Old AST-first framing
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">
                        Updated 2026 framing
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr>
                      <td className="px-4 py-3 text-gray-700">Search capture</td>
                      <td className="px-4 py-3 text-gray-700">Assured shorthold tenancy agreement</td>
                      <td className="px-4 py-3 text-gray-700">AST search retained</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-gray-700">Commercial route</td>
                      <td className="px-4 py-3 text-gray-700">Legacy AST wording</td>
                      <td className="px-4 py-3 text-gray-700">England Tenancy Agreement 2026</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-gray-700">Positioning</td>
                      <td className="px-4 py-3 text-gray-700">Historic template language</td>
                      <td className="px-4 py-3 text-gray-700">Modern landlord wording</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-gray-700">Compliance narrative</td>
                      <td className="px-4 py-3 text-gray-700">Older AST-only framing</td>
                      <td className="px-4 py-3 text-gray-700">Renters’ Rights positioning</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-gray-700">User expectation</td>
                      <td className="px-4 py-3 text-gray-700">Basic template page</td>
                      <td className="px-4 py-3 text-gray-700">Modern England agreement journey</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-gray-700">Competitive strength</td>
                      <td className="px-4 py-3 text-gray-700">Thin legacy SEO page</td>
                      <td className="px-4 py-3 text-gray-700">Full search-first landing page</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-10 max-w-4xl mx-auto space-y-5 text-gray-700 leading-relaxed">
                <p>
                  This comparison is not about pretending assured shorthold tenancy agreement demand
                  has disappeared. It is about making sure the page that captures that demand is also
                  commercially stronger and more useful than a basic legacy page.
                </p>

                <p>
                  That is how stronger competitors usually win. They answer the historic search term,
                  but they present the page around the current product reality rather than stopping at
                  the old label.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Standard vs premium
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-3xl mx-auto">
                Choose the England agreement route that fits your letting situation and the level of
                detail you need.
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="rounded-2xl border-2 border-gray-200 bg-white p-6 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Standard agreement</h3>
                  <p className="text-gray-700 mb-6">
                    Suitable for many straightforward England lets using the updated 2026 agreement flow.
                  </p>
                  <ul className="space-y-3 text-gray-700 mb-6">
                    <li>✓ Updated England agreement route</li>
                    <li>✓ AST search capture with modern product language</li>
                    <li>✓ Core landlord wording for many standard lets</li>
                    <li>✓ Stronger than a thin legacy AST landing page</li>
                  </ul>
                  <Link
                    href={wizardHref}
                    className="block w-full rounded-lg bg-red-600 py-3 text-center font-medium text-white transition-colors hover:bg-red-700"
                  >
                    Start updated England agreement
                  </Link>
                </div>

                <div className="relative rounded-2xl border-2 border-red-200 bg-white p-6 shadow-lg">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-red-600 px-3 py-1 text-sm text-white">
                    Recommended
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Premium agreement</h3>
                  <p className="text-gray-700 mb-6">
                    Better for landlords who want broader wording, extra clauses and more detailed
                    drafting for real-world scenarios.
                  </p>
                  <ul className="space-y-3 text-gray-700 mb-6">
                    <li>✓ Everything in the standard route</li>
                    <li>✓ More detailed commercial coverage</li>
                    <li>✓ Broader drafting for practical landlord situations</li>
                    <li>✓ Stronger premium positioning for 2026</li>
                  </ul>
                  <Link
                    href={premiumWizardHref}
                    className="block w-full rounded-lg bg-red-700 py-3 text-center font-medium text-white transition-colors hover:bg-red-800"
                  >
                    Use premium agreement
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <FAQSection
          faqs={faqs}
          title="Assured Shorthold Tenancy Agreement FAQ"
          showContactCTA={false}
          variant="gray"
        />

        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto rounded-2xl bg-red-600 p-10 md:p-12 text-center text-white shadow-2xl">
              <h2 className="text-4xl font-bold mb-4">
                Ready to use the updated England agreement route?
              </h2>
              <p className="text-xl text-red-50 mb-8 max-w-3xl mx-auto">
                Keep assured shorthold tenancy agreement search visibility, use stronger 2026 wording,
                and move landlords into a more competitive modern England agreement flow.
              </p>

              <div className="flex gap-4 justify-center flex-wrap">
                <Link
                  href={wizardHref}
                  className="rounded-lg bg-white px-8 py-4 text-lg font-semibold text-red-600 shadow-lg transition-colors hover:bg-red-50"
                >
                  Start updated England agreement
                </Link>
                <Link
                  href={premiumWizardHref}
                  className="rounded-lg bg-yellow-400 px-8 py-4 text-lg font-semibold text-gray-900 shadow-lg transition-colors hover:bg-yellow-300"
                >
                  Use premium agreement
                </Link>
              </div>

              <p className="mt-6 text-sm text-red-100">
                Updated 2026 wording • AST search coverage • England landlord flow
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
