import type { Metadata } from 'next';
import Link from 'next/link';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { FAQSection } from '@/components/seo/FAQSection';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/ast-template-england');
const wizardHref = '/products/ast';
const premiumWizardHref = '/products/ast';

export const metadata: Metadata = {
  title: 'England Tenancy Agreement 2026 | AST Template England Updated',
  description:
    'Create the new 2026 England Tenancy Agreement online. Built for landlords searching for an AST template in England, with updated wording and Renters Rights Bill compliant positioning.',
  keywords: [
    'ast template england',
    'assured shorthold tenancy template england',
    'england tenancy agreement 2026',
    'new tenancy agreement england',
    'residential tenancy agreement england',
    'england landlord agreement',
    'renters rights bill compliant tenancy agreement',
    'england tenancy contract template',
    'updated ast england',
    'england tenancy template',
    'landlord agreement england 2026',
    'tenancy agreement for landlords england',
  ],
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'England Tenancy Agreement 2026 | AST Template England Updated',
    description:
      'Use the new 2026 England Tenancy Agreement flow for AST template England searches, with updated landlord wording and Renters Rights Bill compliant positioning.',
    type: 'website',
    url: canonicalUrl,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'England Tenancy Agreement 2026 | AST Template England Updated',
    description:
      'Use the new 2026 England Tenancy Agreement flow for AST template England searches.',
  },
};

const faqs = [
  {
    question: 'Is this still an AST template for England?',
    answer:
      'This page captures AST template England search intent, but the live Landlord Heaven route is now positioned as the England Tenancy Agreement 2026. The product is framed using updated England tenancy agreement wording rather than older AST-first commercial language.',
  },
  {
    question: 'Why has the wording changed from AST template to England Tenancy Agreement?',
    answer:
      'Landlord Heaven now uses broader, more modern England tenancy agreement language so the page better reflects current landlord search intent, updated product positioning, and expected legal change rather than relying only on legacy AST terminology.',
  },
  {
    question: 'How does this relate to the Renters Rights Bill?',
    answer:
      'This page is positioned around Renters Rights Bill compliant wording and the updated England agreement flow. Before publishing any legal compliance claim, your compliance owner should confirm the exact approved wording for your product and current legislative status.',
  },
  {
    question: 'What should an England tenancy agreement include?',
    answer:
      'A strong England tenancy agreement should clearly cover the parties, property, rent, deposit terms, start date, tenancy structure, repair responsibilities, tenant obligations, notice wording, and key landlord protections in clear written wording.',
  },
  {
    question: 'Can I still target AST template England searches in 2026?',
    answer:
      'Yes. AST template England remains a high-intent search term, but the user journey can move those visitors into a newer England tenancy agreement flow with updated product language and clearer current-market positioning.',
  },
  {
    question: 'What is the difference between standard and premium?',
    answer:
      'The standard option is suitable for many straightforward England lets. The premium option is better where a landlord wants broader wording, extra clauses, stronger commercial protection, or more detailed drafting for more complex real-world situations.',
  },
  {
    question: 'Who is this England tenancy agreement suitable for?',
    answer:
      'It is suitable for many private landlords in England creating a new tenancy, replacing an old AST template workflow, or wanting a clearer modern agreement route rather than relying on historic AST-first product language.',
  },
  {
    question: 'Can I use an old AST template for a new tenancy?',
    answer:
      'That may not be the best commercial route. This page is designed to move landlords away from thin legacy AST-first positioning and into a stronger 2026 England tenancy agreement flow with updated wording and clearer product framing.',
  },
];

export default function ASTTemplateEnglandPage() {
  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'England Tenancy Agreement 2026',
    description:
      'Create the new 2026 England Tenancy Agreement online for landlords searching for an AST template in England.',
    url: canonicalUrl,
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <HeaderConfig mode="autoOnScroll" />

      <StructuredData data={pageSchema} />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: getCanonicalUrl('/') },
          { name: 'England Tenancy Agreement 2026', url: canonicalUrl },
        ])}
      />

      <main>
        {/* Hero */}
        <section className="bg-gradient-to-br from-red-50 via-white to-red-50 pt-24 pb-16">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto text-center">
              <div className="inline-flex items-center rounded-full bg-red-100 px-4 py-2 text-sm font-semibold text-red-800 mb-5">
                Updated England route for AST template searches
              </div>

              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                England Tenancy Agreement 2026
              </h1>

              <p className="text-xl text-gray-700 max-w-4xl mx-auto mb-4">
                If you are searching for an <strong>AST template in England</strong>, this is the
                updated route. Landlord Heaven now positions the live product as the{' '}
                <strong>new 2026 England Tenancy Agreement</strong> with{' '}
                <strong>Renters Rights Bill compliant</strong> wording.
              </p>

              <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
                This page keeps the legacy AST search demand while moving landlords into the modern
                England agreement flow with stronger product language, broader coverage, and a more
                future-facing landlord journey.
              </p>

              <div className="flex gap-4 justify-center flex-wrap">
                <Link
                  href={wizardHref}
                  className="inline-flex items-center justify-center rounded-lg bg-red-600 px-6 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-red-700"
                >
                  Create 2026 England agreement
                </Link>
                <Link
                  href={premiumWizardHref}
                  className="inline-flex items-center justify-center rounded-lg border-2 border-red-600 bg-white px-6 py-3 font-semibold text-red-600 shadow-sm transition-colors hover:bg-red-50"
                >
                  Use premium England agreement
                </Link>
              </div>

              <p className="mt-4 text-sm text-gray-600">
                Legacy AST search capture • Updated England wording • Modern landlord flow
              </p>
            </div>
          </div>
        </section>

        {/* What is the new 2026 England Tenancy Agreement */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto bg-white rounded-2xl border border-gray-100 shadow-sm p-8 md:p-10">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                What is the new 2026 England Tenancy Agreement?
              </h2>
              <p className="text-gray-600 text-center mb-10 max-w-3xl mx-auto">
                This page is the updated England commercial route for landlords who still search using
                older AST language but now need a stronger 2026 agreement journey.
              </p>

              <div className="space-y-5 text-gray-700 leading-relaxed">
                <p>
                  The <strong>England Tenancy Agreement 2026</strong> is the updated Landlord Heaven
                  positioning for landlords creating a residential tenancy agreement in England. It
                  replaces older AST-first commercial wording with a broader and more modern England
                  tenancy agreement route.
                </p>

                <p>
                  This matters because the search market and the product market are not always the same.
                  Many landlords still type <strong>AST template England</strong>,{' '}
                  <strong>assured shorthold tenancy template England</strong>, or similar terms into
                  Google, even when the stronger commercial destination is no longer best described as
                  a legacy AST-only template page.
                </p>

                <p>
                  The purpose of this landing page is to bridge those two realities. It preserves
                  high-intent AST search visibility, while moving landlords into the newer England
                  agreement flow with wording that feels current, more commercially usable, and more
                  aligned with how the product should now be positioned.
                </p>

                <p>
                  In practical terms, this means the page is not here just to “catch” a search term.
                  It is here to convert legacy AST demand into the modern 2026 England tenancy
                  agreement route.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Why this replaces AST-first wording */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Why this replaces old AST-first wording
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-3xl mx-auto">
                AST remains a powerful search term, but it is no longer the best way to frame the whole
                landlord journey.
              </p>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Legacy demand still exists</h3>
                  <p className="text-gray-700">
                    Landlords still search using AST terminology, so ignoring those searches would lose
                    valuable commercial traffic.
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Product language has moved on</h3>
                  <p className="text-gray-700">
                    The live commercial route is stronger when framed as an England tenancy agreement,
                    not just as a thin “download an AST template” page.
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">2026 needs clearer positioning</h3>
                  <p className="text-gray-700">
                    Updated wording gives a cleaner route for modern England landlord demand, stronger
                    conversion messaging, and future-facing compliance positioning.
                  </p>
                </div>
              </div>

              <div className="mt-10 max-w-4xl mx-auto space-y-5 text-gray-700 leading-relaxed">
                <p>
                  Older AST-first pages often underperform because they are too thin, too historic,
                  or too focused on terminology alone. Stronger competitors usually win by combining
                  search capture with practical guidance, clearer product framing, and richer
                  informational depth.
                </p>

                <p>
                  That is why this page should not act as a simple redirect bridge. It needs to be a
                  proper landing page in its own right: one that can rank for AST searches while still
                  selling the updated England agreement product.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Renters’ Rights Bill */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto bg-red-50 border border-red-200 rounded-2xl p-8 md:p-10">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                How it relates to the Renters’ Rights Bill
              </h2>
              <p className="text-gray-700 text-center mb-10 max-w-3xl mx-auto">
                The updated England route is positioned around <strong>Renters Rights Bill compliant</strong>{' '}
                wording rather than older AST-only product framing.
              </p>

              <div className="space-y-5 text-gray-700 leading-relaxed">
                <p>
                  This is one of the most important reasons to upgrade the page properly. Landlords
                  searching in 2026 do not just want a historic label — they want an agreement route
                  that feels current, commercially usable and aligned with the direction of England
                  tenancy reform.
                </p>

                <p>
                  Positioning the page around the <strong>new 2026 England Tenancy Agreement</strong>{' '}
                  lets Landlord Heaven keep historic AST search relevance while moving the product
                  language into a more modern framework that references{' '}
                  <strong>Renters Rights Bill</strong> expectations.
                </p>

                <p>
                  That makes the page stronger commercially and stronger from a search perspective. It
                  allows the page to compete not only for narrow “AST template” keywords, but also for
                  broader England tenancy agreement and landlord contract searches.
                </p>

                <p>
                  For publication, make sure your compliance owner is happy with the exact phrase
                  “Renters Rights Bill compliant.” If they prefer softer language, replace it with
                  “bill-ready” or “updated for Renters’ Rights Bill changes.”
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Who this agreement is for */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Who this agreement is for
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-3xl mx-auto">
                The updated England tenancy agreement route is designed for landlords who want something
                stronger than a basic legacy template page.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">First-time landlords</h3>
                  <p className="text-gray-700">
                    Useful if you want a clearer England landlord agreement route instead of trying to
                    piece together an old AST template from outdated search results.
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Landlords replacing old templates</h3>
                  <p className="text-gray-700">
                    Ideal if your previous workflow relied on thin AST forms and you now want a stronger,
                    more commercially up-to-date agreement route.
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Straightforward England lets</h3>
                  <p className="text-gray-700">
                    The standard route is suitable for many standard England tenancy scenarios where the
                    landlord needs a modern written agreement without overcomplication.
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Landlords wanting more protection</h3>
                  <p className="text-gray-700">
                    Premium is better where the landlord wants broader drafting, more detailed clauses,
                    and stronger wording for more complex real-world situations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What landlords should include */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                What landlords should include
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-3xl mx-auto">
                A strong England tenancy agreement should do more than fill in names and rent. It should
                set out the letting clearly and reduce avoidable disputes later.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Core agreement details</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>Landlord and tenant details</li>
                    <li>Property address and occupier details</li>
                    <li>Start date and tenancy structure</li>
                    <li>Rent amount and payment terms</li>
                    <li>Deposit wording and related terms</li>
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
                    <li>Guarantor-related wording where needed</li>
                    <li>Pet clauses if relevant</li>
                    <li>Utility and bill responsibility wording</li>
                    <li>Garden, exterior or shared-space terms</li>
                    <li>Additional occupancy restrictions where needed</li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Commercial clarity</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>Clear fee and payment language</li>
                    <li>Practical default wording</li>
                    <li>Rent review or change wording where appropriate</li>
                    <li>End-of-tenancy expectations</li>
                    <li>Simple written structure for easier enforcement later</li>
                  </ul>
                </div>
              </div>

              <p className="mt-8 text-gray-700 text-center max-w-3xl mx-auto">
                The goal is not just to generate a document. It is to create a cleaner, more modern
                England landlord agreement that works better than a thin legacy template.
              </p>
            </div>
          </div>
        </section>

        {/* Common mistakes */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Common mistakes with old AST templates
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-3xl mx-auto">
                One reason to update this page properly is that many landlords still rely on weak
                template workflows.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
                  <h3 className="text-xl font-semibold text-red-900 mb-3">
                    Using thin legacy forms
                  </h3>
                  <p className="text-gray-700">
                    Older AST template pages often capture search intent but do very little to guide
                    the landlord toward a stronger, more modern agreement route.
                  </p>
                </div>

                <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
                  <h3 className="text-xl font-semibold text-red-900 mb-3">
                    Focusing only on the label
                  </h3>
                  <p className="text-gray-700">
                    “AST” may still be the search term, but the product journey should not be trapped
                    in historic wording if a broader England agreement route converts better.
                  </p>
                </div>

                <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
                  <h3 className="text-xl font-semibold text-red-900 mb-3">
                    Missing practical landlord clauses
                  </h3>
                  <p className="text-gray-700">
                    A minimal agreement may not give enough clarity around deposits, property use,
                    repairs, pets, guarantors or commercial controls.
                  </p>
                </div>

                <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
                  <h3 className="text-xl font-semibold text-red-900 mb-3">
                    Weak 2026 positioning
                  </h3>
                  <p className="text-gray-700">
                    Pages that never evolve beyond legacy AST wording can look outdated compared with
                    stronger competitor pages built around newer landlord search intent.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* England vs AST terminology */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                England Tenancy Agreement vs old AST terminology
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-3xl mx-auto">
                This page keeps AST search coverage while using clearer 2026 language and stronger
                commercial framing.
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
                      <td className="px-4 py-3 text-gray-700">AST template England</td>
                      <td className="px-4 py-3 text-gray-700">AST search retained</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-gray-700">Commercial route</td>
                      <td className="px-4 py-3 text-gray-700">Legacy AST language</td>
                      <td className="px-4 py-3 text-gray-700">England Tenancy Agreement 2026</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-gray-700">Positioning</td>
                      <td className="px-4 py-3 text-gray-700">Historic terminology</td>
                      <td className="px-4 py-3 text-gray-700">Modern landlord wording</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-gray-700">Compliance narrative</td>
                      <td className="px-4 py-3 text-gray-700">Older AST-only framing</td>
                      <td className="px-4 py-3 text-gray-700">Renters’ Rights Bill positioning</td>
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
                  This comparison is not about pretending AST demand has disappeared. It has not. The
                  better move is to keep that demand and modernise the route that follows it.
                </p>

                <p>
                  That is what stronger competitors often do well: they answer the historic query, but
                  they frame the page around the current commercial reality rather than stopping at the
                  old label.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Standard vs premium */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Standard vs premium
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-3xl mx-auto">
                Choose the England agreement route that fits your letting situation and the level of
                drafting detail you need.
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
                    <li>✓ Clearer and stronger than a thin legacy AST page</li>
                  </ul>
                  <Link
                    href={wizardHref}
                    className="block w-full rounded-lg bg-red-600 py-3 text-center font-medium text-white transition-colors hover:bg-red-700"
                  >
                    Create standard agreement
                  </Link>
                </div>

                <div className="relative rounded-2xl border-2 border-red-200 bg-white p-6 shadow-lg">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-red-600 px-3 py-1 text-sm text-white">
                    Recommended
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Premium agreement</h3>
                  <p className="text-gray-700 mb-6">
                    Better for landlords who want broader wording, extra clauses and more detailed
                    protection for more complex scenarios.
                  </p>
                  <ul className="space-y-3 text-gray-700 mb-6">
                    <li>✓ Everything in the standard route</li>
                    <li>✓ More detailed commercial coverage</li>
                    <li>✓ Broader drafting for real-world landlord situations</li>
                    <li>✓ Stronger premium product positioning for 2026</li>
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

        {/* FAQ */}
        <FAQSection
          faqs={faqs}
          title="England Tenancy Agreement FAQ"
          showContactCTA={false}
          variant="gray"
        />

        {/* Final CTA */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto rounded-2xl bg-red-600 p-10 md:p-12 text-center text-white shadow-2xl">
              <h2 className="text-4xl font-bold mb-4">
                Ready to create your 2026 England Tenancy Agreement?
              </h2>
              <p className="text-xl text-red-50 mb-8 max-w-3xl mx-auto">
                Capture AST search intent, use updated England wording, and move landlords into a
                stronger modern agreement flow built for 2026.
              </p>

              <div className="flex gap-4 justify-center flex-wrap">
                <Link
                  href={wizardHref}
                  className="rounded-lg bg-white px-8 py-4 text-lg font-semibold text-red-600 shadow-lg transition-colors hover:bg-red-50"
                >
                  Create 2026 England agreement
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
