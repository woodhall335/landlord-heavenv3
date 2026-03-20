import type { Metadata } from 'next';
import Link from 'next/link';
import { getCanonicalUrl } from '@/lib/seo/urls';
import {
  StructuredData,
  breadcrumbSchema,
  articleSchema,
} from '@/lib/seo/structured-data';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { FAQSection } from '@/components/seo/FAQSection';
import { NextLegalSteps } from '@/components/seo/NextLegalSteps';
import { AskHeavenWidget } from '@/components/ask-heaven/AskHeavenWidget';
import { productLinks, askHeavenLink } from '@/lib/seo/internal-links';
import { scotlandEvictionFAQs } from '@/data/faqs';
import { buildWizardLink } from '@/lib/wizard/buildWizardLink';
import { PRODUCTS } from '@/lib/pricing/products';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Clock,
  FileText,
  Gavel,
  Home,
  Scale,
  Shield,
  XCircle,
} from 'lucide-react';

const canonicalUrl = getCanonicalUrl('/scotland-eviction-notices');

const wizardHref = buildWizardLink({
  product: 'notice_only',
  topic: 'eviction',
  jurisdiction: 'scotland',
  src: 'seo_scotland_eviction_notices',
});

const noticeOnlyPrice = PRODUCTS.notice_only?.displayPrice ?? '£29.99';
const completePackPrice = PRODUCTS.complete_pack?.displayPrice ?? '£79.99';

const evictionGrounds = [
  { ground: '1', description: 'Landlord intends to sell', notice: 'Usually 84 days', type: 'Mandatory' },
  { ground: '2', description: 'Property to be sold by lender', notice: 'Usually 84 days', type: 'Mandatory' },
  { ground: '3', description: 'Landlord intends to refurbish', notice: 'Usually 84 days', type: 'Discretionary' },
  { ground: '4', description: 'Landlord or family moving in', notice: 'Usually 84 days', type: 'Mandatory' },
  { ground: '5', description: 'Landlord intends non-residential use', notice: 'Usually 84 days', type: 'Discretionary' },
  { ground: '6', description: 'Landlord intends religious use', notice: 'Usually 84 days', type: 'Discretionary' },
  { ground: '7', description: 'Property required for employee', notice: 'Usually 84 days', type: 'Discretionary' },
  { ground: '8', description: 'Supported accommodation no longer required', notice: 'Usually 84 days', type: 'Discretionary' },
  { ground: '9', description: 'Property not tenant’s only or principal home', notice: 'Usually 28 days', type: 'Discretionary' },
  { ground: '10', description: 'Purpose-built student accommodation required', notice: 'Usually 28 days', type: 'Mandatory' },
  { ground: '11', description: 'Breach of tenancy agreement', notice: 'Usually 28 days', type: 'Discretionary' },
  { ground: '12', description: 'Three or more consecutive months of rent arrears', notice: 'Usually 28 days', type: 'Mandatory' },
  { ground: '12A', description: 'Substantial cumulative rent arrears', notice: 'Usually 28 days', type: 'Discretionary' },
  { ground: '13', description: 'Relevant criminal conviction', notice: 'Usually 28 days', type: 'Discretionary' },
  { ground: '14', description: 'Antisocial behaviour', notice: 'Usually 28 days', type: 'Mandatory' },
  { ground: '15', description: 'Association with person removed for antisocial behaviour', notice: 'Usually 28 days', type: 'Discretionary' },
  { ground: '16', description: 'Landlord registration has ceased', notice: 'Usually 84 days', type: 'Mandatory' },
  { ground: '17', description: 'HMO licence revoked', notice: 'Usually 84 days', type: 'Mandatory' },
  { ground: '18', description: 'Overcrowding statutory notice', notice: 'Usually 28 days', type: 'Mandatory' },
];

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: scotlandEvictionFAQs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
};

export const metadata: Metadata = {
  title: 'Scotland Eviction Notices | Notice to Leave & PRT Landlord Guide',
  description:
    'Landlord guide to Scotland eviction notices, Notice to Leave requirements, PRT grounds, tribunal steps, notice logic, and common mistakes under the Scottish private rented framework.',
  keywords: [
    'notice to leave scotland',
    'scotland eviction notice',
    'scotland landlord eviction',
    'PRT eviction scotland',
    'private residential tenancy eviction',
    'first tier tribunal scotland landlord',
    'scotland eviction grounds',
    'evict tenant scotland',
    'notice to leave landlord guide',
    'scotland possession process',
  ],
  openGraph: {
    title: 'Scotland Eviction Notices | Notice to Leave & PRT Landlord Guide',
    description:
      'Use the correct Scotland Notice to Leave route, understand PRT eviction grounds, and prepare for the First-tier Tribunal process.',
    type: 'article',
    url: canonicalUrl,
    siteName: 'Landlord Heaven',
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Scotland Eviction Notices | Notice to Leave & PRT Landlord Guide',
    description:
      'Landlord guide to Scottish Notice to Leave rules, eviction grounds, and tribunal steps.',
  },
  alternates: {
    canonical: canonicalUrl,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ScotlandEvictionNoticesPage() {
  return (
    <>
      <StructuredData
        data={articleSchema({
          headline: 'Scotland Eviction Notices | Notice to Leave & PRT Landlord Guide',
          description:
            'Landlord guide to Notice to Leave, PRT eviction grounds, and the First-tier Tribunal process in Scotland.',
          url: canonicalUrl,
        })}
      />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: getCanonicalUrl('/') },
          { name: 'How to Evict a Tenant', url: getCanonicalUrl('/how-to-evict-tenant') },
          { name: 'Scotland Eviction Notices', url: canonicalUrl },
        ])}
      />
      <StructuredData data={faqSchema} />

      <main className="min-h-screen bg-gray-50">
        <HeaderConfig mode="autoOnScroll" />

        <UniversalHero
          title="Scotland Eviction Notices"
          subtitle="Use this Scotland landlord guide to understand Notice to Leave rules, Private Residential Tenancy possession grounds, tribunal routing, and the mistakes that most often delay or weaken a Scottish eviction."
          primaryCta={{ label: 'Start Scotland Notice', href: wizardHref }}
          secondaryCta={{
            label: 'Scotland PRT Agreements',
            href: '/private-residential-tenancy-agreement-template',
          }}
          showTrustPositioningBar
          hideMedia
        >
          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-700">
            <span className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-blue-600" />
              Scotland-specific route
            </span>
            <span className="flex items-center gap-2">
              <Gavel className="h-4 w-4 text-blue-600" />
              Tribunal-focused process
            </span>
            <span className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-600" />
              Notice to Leave guidance
            </span>
          </div>
        </UniversalHero>

        <section className="border-b bg-white py-8">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-5xl rounded-2xl border border-blue-100 bg-blue-50 p-6">
              <h2 className="text-2xl font-semibold text-gray-900">Quick answer</h2>
              <div className="mt-4 space-y-4 text-gray-700">
                <p className="leading-7">
                  If the property is in Scotland, the first rule is simple: do not use
                  England Section 21 or Section 8 language. Scottish private landlords usually
                  need to think in terms of <strong>Private Residential Tenancy</strong>,
                  <strong> Notice to Leave</strong>, and the <strong>First-tier Tribunal</strong>,
                  not AST possession routes or county court assumptions.
                </p>
                <p className="leading-7">
                  This page is designed as the main Scotland landlord decision page for
                  possession notices. It explains how the Scottish route works, what a Notice
                  to Leave is for, how the 18 eviction grounds fit into the process, when a
                  landlord is dealing with a mandatory ground versus a discretionary one, and
                  why the Scottish tribunal stage changes the structure of the case.
                </p>
                <p className="leading-7">
                  The commercial goal is not just to define Notice to Leave. It is to help
                  landlords choose the right Scottish route early, avoid England carry-over
                  mistakes, and move into the correct document workflow before time is lost.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-br from-blue-900 to-blue-800 py-16 text-white lg:py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-4xl text-center">
              <div className="mb-6 flex items-center justify-center gap-2">
                <span className="text-5xl">🏴</span>
              </div>

              <h2 className="mb-6 text-4xl font-bold lg:text-5xl">
                Scotland Eviction Notices (Landlord Guide)
              </h2>

              <p className="mx-auto mb-8 max-w-2xl text-xl text-blue-100">
                Understand <strong>Notice to Leave</strong>, the <strong>18 Scottish
                eviction grounds</strong>, and how private landlords move from notice to
                <strong> First-tier Tribunal</strong> when possession is still required.
              </p>

              <div className="mx-auto mb-8 max-w-2xl rounded-lg border border-blue-700 bg-blue-950/50 p-4 text-left">
                <p className="flex items-start gap-2 text-sm text-blue-100">
                  <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-400" />
                  <span>
                    <strong>Important:</strong> Scotland is not an England-style possession
                    jurisdiction. Section 21 and Section 8 are not the right route here.
                    Scottish private landlords usually need a Notice to Leave under the
                    Scottish private rented framework.
                  </span>
                </p>
              </div>

              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Link
                  href={wizardHref}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 font-semibold text-blue-800 transition-colors hover:bg-blue-50"
                >
                  Get Scotland Notice — {noticeOnlyPrice}
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/private-residential-tenancy-agreement-template"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-8 py-4 font-semibold text-white transition-colors hover:bg-white/20"
                >
                  Scotland PRT Agreements
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-5xl">
              <h2 className="mb-6 text-3xl font-bold text-gray-900">
                Why Scotland eviction pages need their own route logic
              </h2>
              <div className="space-y-5 text-gray-700">
                <p className="leading-7">
                  One of the biggest weaknesses in landlord SEO content is treating Scotland
                  as though it is basically England with different branding. It is not. The
                  structure of the tenancy, the notice language, the possession grounds, and
                  the forum for resolving the dispute all point landlords into a different
                  route. A stronger Scotland page therefore has to do more than list the 18
                  grounds. It has to explain why the Scottish framework needs to be treated
                  as its own commercial and legal process.
                </p>
                <p className="leading-7">
                  That matters because high-intent landlords are usually not browsing for
                  theory. They are asking a practical question: how do I get possession of my
                  Scottish property lawfully and efficiently? If the page answers that
                  question with England vocabulary, it immediately sounds less trustworthy.
                  If it answers it with the right Scottish vocabulary, a clearer tribunal
                  route, and more precise guidance on Notice to Leave, it becomes much more
                  useful and much more competitive.
                </p>
                <p className="leading-7">
                  It also improves conversion quality. Users who reach this page after
                  searching for Scottish eviction notices are often close to action. They want
                  the right notice route, the right language, and a clearer understanding of
                  what happens after the notice expires. That is exactly what this page should
                  deliver.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-5xl">
              <h2 className="mb-8 text-3xl font-bold text-gray-900">
                Scotland vs England: key differences
              </h2>

              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <table className="w-full">
                  <thead className="border-b bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold text-gray-900">Aspect</th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-900">🏴 Scotland</th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-900">🏴 England</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 font-medium text-gray-900">Main tenancy structure</td>
                      <td className="px-6 py-4 text-gray-600">
                        Private Residential Tenancy (PRT)
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        England tenancy / AST-led legacy search language
                      </td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">Possession notice</td>
                      <td className="px-6 py-4 text-gray-600">Notice to Leave</td>
                      <td className="px-6 py-4 text-gray-600">Section 21 / Section 8 search language common</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-medium text-gray-900">No-fault mindset</td>
                      <td className="px-6 py-4 text-blue-700 font-medium">
                        Scotland possession sits inside the PRT ground-based framework
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        England reform and no-fault transition language more central
                      </td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">Main decision-maker</td>
                      <td className="px-6 py-4 text-gray-600">
                        First-tier Tribunal for Scotland
                      </td>
                      <td className="px-6 py-4 text-gray-600">County court route</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-medium text-gray-900">Landlord registration</td>
                      <td className="px-6 py-4 text-gray-600">
                        A core Scottish compliance point
                      </td>
                      <td className="px-6 py-4 text-gray-600">Different compliance context</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">Common content failure</td>
                      <td className="px-6 py-4 text-red-600 font-medium">
                        Importing England notice logic into Scottish content
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        Oversimplifying the route or relying on old reform assumptions
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-6">
                <p className="leading-7 text-amber-900">
                  <strong>Commercial takeaway:</strong> the stronger Scotland page is the one
                  that sounds properly Scottish from the start. It should not read like an
                  England eviction page with “Notice to Leave” pasted into the headings.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-gray-50 py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-5xl">
              <h2 className="mb-6 text-3xl font-bold text-gray-900">
                Notice to Leave requirements
              </h2>

              <div className="mb-8 space-y-5 text-gray-700">
                <p className="leading-7">
                  A Notice to Leave is the formal Scottish possession notice used in the
                  private residential tenancy context. A strong landlord page should explain
                  that the notice is not just a letter telling the tenant to go. It is the
                  foundation document for the Scottish possession route and will often be
                  examined closely if the matter reaches the tribunal.
                </p>
                <p className="leading-7">
                  That means landlords should think carefully about what ground is being used,
                  why it applies, whether the timing is correct, how the notice is served, and
                  whether the surrounding compliance record and evidence are strong enough to
                  support the case later. Many delays happen because the landlord gets that
                  early stage wrong and only discovers the problem once the tribunal process is
                  underway.
                </p>
              </div>

              <div className="rounded-xl border border-blue-200 bg-blue-50 p-6 mb-8">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
                  <FileText className="h-5 w-5 text-blue-600" />
                  A Scotland Notice to Leave should be built around
                </h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-1 h-4 w-4 text-green-500" />
                    Clear identification of the tenant and property
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-1 h-4 w-4 text-green-500" />
                    The correct Scottish eviction ground or grounds
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-1 h-4 w-4 text-green-500" />
                    The correct notice timing for the route being used
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-1 h-4 w-4 text-green-500" />
                    A practical explanation of why the ground is being relied on
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-1 h-4 w-4 text-green-500" />
                    Supporting landlord and compliance details where relevant
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-1 h-4 w-4 text-green-500" />
                    Proper service evidence kept from the outset
                  </li>
                </ul>
              </div>

              <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 text-red-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-red-900">
                      Common notice-stage failure
                    </h3>
                    <p className="mt-2 leading-7 text-red-900/90">
                      Many Scottish cases are weakened because the landlord starts from an
                      England-style mindset and only later realises the tribunal expects a
                      clearer Scottish route and evidence base. The point of this page is to
                      stop that happening earlier in the funnel.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-6xl">
              <h2 className="mb-6 text-3xl font-bold text-gray-900">
                All 18 Scottish eviction grounds
              </h2>
              <p className="mb-8 max-w-5xl text-gray-700 leading-7">
                One of the strongest commercial and SEO assets on a Scotland page is a clear,
                readable explanation of the 18 grounds. The user does not just want a list.
                They want to understand which types of reason point toward quicker notice
                logic, which are mandatory, which are discretionary, and why the evidence
                behind the chosen ground matters if the case reaches tribunal.
              </p>

              <div className="mb-8 rounded-r-lg border-l-4 border-amber-500 bg-amber-50 p-4">
                <p className="text-sm text-amber-900">
                  <strong>Mandatory vs discretionary:</strong> mandatory grounds are stronger
                  where proved, while discretionary grounds usually invite a reasonableness
                  analysis. That difference matters commercially because landlords want a page
                  that helps them understand the likely strength of their route, not just one
                  that prints out a table with no explanation.
                </p>
              </div>

              <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
                <table className="w-full min-w-[700px]">
                  <thead className="border-b bg-blue-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900 w-24">Ground</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">Description</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900 w-36">Typical notice</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900 w-36">Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-sm">
                    {evictionGrounds.map((ground, index) => (
                      <tr key={ground.ground} className={index % 2 === 1 ? 'bg-gray-50' : ''}>
                        <td className="px-4 py-3 font-medium text-gray-900">{ground.ground}</td>
                        <td className="px-4 py-3 text-gray-600">{ground.description}</td>
                        <td className="px-4 py-3 text-gray-600">{ground.notice}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded px-2 py-1 text-xs font-medium ${
                              ground.type === 'Mandatory'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {ground.type}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-8 grid gap-6 md:grid-cols-3">
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
                  <h3 className="text-lg font-semibold text-gray-900">Grounds often linked to landlord plans</h3>
                  <p className="mt-3 text-gray-700 leading-7">
                    Selling, moving in, or using the property differently are common examples
                    where the landlord’s future intention matters and evidence should support it.
                  </p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
                  <h3 className="text-lg font-semibold text-gray-900">Grounds linked to tenant conduct</h3>
                  <p className="mt-3 text-gray-700 leading-7">
                    Arrears, breach, criminality, or antisocial behaviour often raise stronger
                    evidence issues and need a more disciplined paper trail.
                  </p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
                  <h3 className="text-lg font-semibold text-gray-900">Grounds linked to regulatory context</h3>
                  <p className="mt-3 text-gray-700 leading-7">
                    Registration, HMO licensing, and overcrowding issues reinforce why
                    Scotland-specific compliance context belongs on this page.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-gray-50 py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-5xl">
              <h2 className="mb-8 text-3xl font-bold text-gray-900">
                Scotland eviction process
              </h2>

              <div className="mb-8 space-y-5 text-gray-700">
                <p className="leading-7">
                  A good Scotland possession page should make the overall journey feel clear.
                  In practice, many landlords need a simple sequence: identify the ground,
                  prepare the notice, serve it properly, wait for the notice period, apply to
                  the tribunal if the tenant remains, and then move to enforcement only if it
                  becomes necessary. That sounds basic, but clarity is exactly what many
                  competing pages lack.
                </p>
              </div>

              <div className="space-y-6">
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                      <span className="font-bold text-blue-600">1</span>
                    </div>
                    <div>
                      <h3 className="mb-2 text-lg font-bold text-gray-900">Identify the correct Scottish ground</h3>
                      <p className="text-gray-600">
                        Start with the correct PRT possession ground and build the case around
                        that. This is where the route begins, not with a generic notice template.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                      <span className="font-bold text-blue-600">2</span>
                    </div>
                    <div>
                      <h3 className="mb-2 text-lg font-bold text-gray-900">Complete pre-action steps where relevant</h3>
                      <p className="text-gray-600">
                        Arrears and other evidence-heavy scenarios may require more than a bare
                        assertion. Build the paper trail early.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                      <span className="font-bold text-blue-600">3</span>
                    </div>
                    <div>
                      <h3 className="mb-2 text-lg font-bold text-gray-900">Serve the Notice to Leave correctly</h3>
                      <p className="text-gray-600">
                        Make sure the correct ground, timing, and service method are handled
                        properly. Keep proof of service.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                      <span className="font-bold text-blue-600">4</span>
                    </div>
                    <div>
                      <h3 className="mb-2 text-lg font-bold text-gray-900">Allow the notice period to expire</h3>
                      <p className="text-gray-600">
                        The tenant may leave voluntarily. If not, the case moves toward the
                        Scottish tribunal stage rather than an England county court route.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                      <span className="font-bold text-blue-600">5</span>
                    </div>
                    <div>
                      <h3 className="mb-2 text-lg font-bold text-gray-900">Apply to the First-tier Tribunal</h3>
                      <p className="text-gray-600">
                        If possession is still needed, the matter is usually routed through the
                        Scottish tribunal rather than treated like an ordinary English claim.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                      <span className="font-bold text-blue-600">6</span>
                    </div>
                    <div>
                      <h3 className="mb-2 text-lg font-bold text-gray-900">Use enforcement only through the lawful route</h3>
                      <p className="text-gray-600">
                        If an order is granted and the tenant remains, only the proper Scottish
                        enforcement route should be used.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 rounded-2xl border border-purple-200 bg-purple-50 p-6">
                <div className="flex items-start gap-3">
                  <Gavel className="mt-0.5 h-5 w-5 text-purple-700" />
                  <div>
                    <h3 className="text-lg font-semibold text-purple-900">
                      A key difference that improves trust
                    </h3>
                    <p className="mt-2 leading-7 text-purple-900/90">
                      This page explicitly routes Scottish landlords toward the First-tier
                      Tribunal. That sounds simple, but it is one of the clearest signals that
                      the page has been written for Scotland properly rather than copied from
                      England content.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-blue-50 py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-5xl">
              <h2 className="mb-8 text-3xl font-bold text-gray-900">
                Common eviction scenarios in Scotland
              </h2>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                      <span className="text-lg font-bold text-red-600">£</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Rent arrears</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li><strong>Typical focus:</strong> arrears route and evidence quality</li>
                    <li><strong>Commercial issue:</strong> landlords often underestimate the paper trail needed</li>
                    <li><strong>Risk point:</strong> weak records or poor pre-action handling</li>
                  </ul>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                      <Home className="h-5 w-5 text-amber-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Selling the property</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li><strong>Typical focus:</strong> intention to sell and supporting evidence</li>
                    <li><strong>Commercial issue:</strong> landlords want certainty that they are on the right ground</li>
                    <li><strong>Risk point:</strong> relying on intention without a strong evidential basis</li>
                  </ul>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                      <Home className="h-5 w-5 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Moving back in</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li><strong>Typical focus:</strong> landlord or family occupation plan</li>
                    <li><strong>Commercial issue:</strong> route selection and evidence timing</li>
                    <li><strong>Risk point:</strong> underexplaining the factual basis for the ground</li>
                  </ul>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Antisocial behaviour or serious breach</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li><strong>Typical focus:</strong> evidence strength and notice accuracy</li>
                    <li><strong>Commercial issue:</strong> landlords often need speed but cannot skip proof</li>
                    <li><strong>Risk point:</strong> weak evidence or poorly prepared supporting statements</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-5xl">
              <h2 className="mb-6 text-3xl font-bold text-gray-900">
                Notice to Leave checklist and common mistakes
              </h2>
              <p className="mb-10 max-w-4xl text-gray-600">
                Scottish cases are often delayed not because the landlord lacked a route, but
                because the route was documented poorly. The page should therefore help users
                avoid the errors that most often weaken a tribunal application.
              </p>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
                  <h3 className="mb-3 font-semibold text-gray-900">Validity checklist</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>Correct Scottish ground identified.</li>
                    <li>Correct notice timing applied.</li>
                    <li>Landlord details and registration context checked.</li>
                    <li>Evidence compiled for the chosen route.</li>
                    <li>Proof of service retained.</li>
                    <li>Tribunal-facing paper trail prepared early.</li>
                  </ul>
                </div>

                <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
                  <h3 className="mb-3 font-semibold text-gray-900">Common mistakes</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>Using England Section 21 or Section 8 framing.</li>
                    <li>Choosing the wrong Scottish ground.</li>
                    <li>Serving the wrong notice length.</li>
                    <li>Weak evidence for arrears, behaviour, or intention-based grounds.</li>
                    <li>Applying the wrong forum logic instead of the Scottish tribunal route.</li>
                  </ul>
                  <Link
                    href="/private-residential-tenancy-agreement-template"
                    className="mt-3 inline-flex text-sm font-medium text-primary hover:underline"
                  >
                    Review Scotland PRT rules →
                  </Link>
                </div>
              </div>

              <div className="mt-8 rounded-2xl border border-green-200 bg-green-50 p-6">
                <h3 className="text-lg font-semibold text-green-900">Why this matters commercially</h3>
                <p className="mt-2 leading-7 text-green-900/90">
                  A stronger Scotland eviction page gives landlords enough detail to feel they
                  are on the correct route without drowning them in noise. That balance is
                  exactly what lets the page outrank weaker template pages while still converting
                  users who are ready to act now.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-br from-blue-700 to-blue-600 py-16 text-white">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="mb-6 text-3xl font-bold">Need help with a Scotland eviction route?</h2>
              <p className="mb-8 text-xl text-blue-100">
                Start with a Scotland-specific Notice to Leave workflow and move forward with
                clearer tribunal-ready positioning.
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Link
                  href={productLinks.noticeOnly.href}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 font-semibold text-blue-700 transition-colors hover:bg-blue-50"
                >
                  Get Scotland Notice — {noticeOnlyPrice}
                </Link>
                <Link
                  href={productLinks.completePack.href}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-8 py-4 font-semibold text-white transition-colors hover:bg-white/20"
                >
                  Complete Pack — {completePackPrice}
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-12">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl">
              <AskHeavenWidget
                variant="banner"
                source="page_cta"
                topic="eviction"
                jurisdiction="scotland"
                title="Not sure which Scottish eviction ground applies?"
                description="Ask Heaven can help you understand Notice to Leave routes, the 18 Scottish grounds, and the First-tier Tribunal process."
                utm_campaign="scotland-eviction-notices"
              />
            </div>
          </div>
        </section>

        <section className="bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-5xl">
              <NextLegalSteps
                jurisdictionLabel="Scotland eviction notices"
                scenarioLabel="Notice to Leave + Tribunal process"
                primaryCTA={{
                  label: `Generate Notice to Leave — ${noticeOnlyPrice}`,
                  href: productLinks.noticeOnly.href,
                }}
                secondaryCTA={{
                  label: `Complete eviction pack — ${completePackPrice}`,
                  href: productLinks.completePack.href,
                }}
                relatedLinks={[
                  {
                    href: askHeavenLink.href,
                    title: 'Ask Heaven',
                    description: 'Free Q&A for landlord questions.',
                  },
                  {
                    href: '/private-residential-tenancy-agreement-template',
                    title: 'Scotland PRT agreements',
                    description: 'Create compliant private residential tenancy agreements.',
                  },
                  {
                    href: '/blog/scotland-eviction-process',
                    title: 'Scotland eviction process',
                    description: 'Tribunal route from Notice to Leave through enforcement.',
                  },
                  {
                    href: '/money-claim-unpaid-rent',
                    title: 'Unpaid rent claim guide',
                    description: 'Recover arrears where a separate money claim route is appropriate.',
                  },
                ]}
              />
            </div>
          </div>
        </section>

        <FAQSection
          showTrustPositioningBar
          title="Scottish Eviction FAQ"
          faqs={scotlandEvictionFAQs}
          showContactCTA={false}
          variant="white"
        />
      </main>
    </>
  );
}