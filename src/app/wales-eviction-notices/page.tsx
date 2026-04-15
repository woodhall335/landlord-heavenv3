import type { Metadata } from 'next';
import Link from 'next/link';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { FAQSection } from '@/components/seo/FAQSection';
import { NextLegalSteps } from '@/components/seo/NextLegalSteps';
import { SeoPageContextPanel } from '@/components/seo/SeoPageContextPanel';
import { AskHeavenWidget } from '@/components/ask-heaven/AskHeavenWidget';
import { getCanonicalUrl } from '@/lib/seo/urls';
import {
  StructuredData,
  breadcrumbSchema,
  articleSchema,
} from '@/lib/seo/structured-data';
import { productLinks, askHeavenLink } from '@/lib/seo/internal-links';
import { PRODUCTS } from '@/lib/pricing/products';
import { walesEvictionFAQs } from '@/data/faqs';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Home,
  Scale,
  Shield,
  Clock,
  FileText,
  XCircle,
} from 'lucide-react';

const canonicalUrl = getCanonicalUrl('/wales-eviction-notices');

const noticeOnlyHref = '/products/notice-only';
const noticeOnlyPrice = PRODUCTS.notice_only.displayPrice;
const completePackPrice = PRODUCTS.complete_pack.displayPrice;

export { UNIVERSAL_HERO_VIEWPORT as viewport } from '@/lib/seo/hero-theme';

export const metadata: Metadata = {
  title: 'Wales Eviction Notices | Landlord Guide to Possession Routes',
  description:
    'Plain-English landlord guide to Wales eviction notices under the Renting Homes (Wales) Act, including notice routes, terminology, and next legal steps.',
  keywords: [
    'wales eviction notice',
    'eviction notice wales landlord',
    'renting homes wales act possession',
    'wales landlord eviction',
    'occupation contract eviction wales',
    'contract holder eviction wales',
    'wales possession notice',
    'section 173 notice wales',
    'evict tenant wales',
    'wales notice possession landlord',
  ],
  openGraph: {
    title: 'Wales Eviction Notices | Landlord Guide to Possession Routes',
    description:
      'Compare Wales possession routes, notice logic, occupation contract terminology, and the steps landlords usually need before court action.',
    type: 'article',
    url: canonicalUrl,
    siteName: 'Landlord Heaven',
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wales Eviction Notices | Landlord Guide to Possession Routes',
    description:
      'Plain-English landlord guide to Welsh possession notices and the next legal steps.',
  },
  alternates: {
    canonical: canonicalUrl,
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function WalesEvictionNoticesPage() {
  return (
    <>
      <StructuredData
        data={articleSchema({
          headline: 'Wales Eviction Notices | Landlord Guide to Possession Routes',
          description:
            'Landlord guide to Welsh eviction notices, occupation contracts, possession routes, and the main next steps under the Renting Homes (Wales) Act.',
          url: canonicalUrl,
        })}
      />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: getCanonicalUrl('/') },
          { name: 'How to Evict a Tenant', url: getCanonicalUrl('/how-to-evict-tenant') },
          { name: 'Wales Eviction Notices', url: canonicalUrl },
        ])}
      />
      <main className="min-h-screen bg-gray-50">
        <HeaderConfig mode="autoOnScroll" />

        <UniversalHero
          title="Wales Eviction Notices"
          subtitle="If your property is in Wales, start with the Welsh possession framework rather than England assumptions. This guide helps you choose the right notice route and prepare the next step properly."
          primaryCta={{ label: 'Start Wales notice', href: noticeOnlyHref }}
          secondaryCta={{
            label: 'Wales occupation contracts',
            href: '/wales-tenancy-agreement-template',
          }}
          showTrustPositioningBar
          hideMedia
        >
          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-700">
            <span className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-red-600" />
              Wales-specific wording
            </span>
            <span className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-red-600" />
              Renting Homes Act framing
            </span>
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-red-600" />
              Notice-first landlord workflow
            </span>
          </div>
        </UniversalHero>

        <section className="border-b bg-white py-8">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-5xl rounded-2xl border border-red-100 bg-red-50 p-6">
              <h2 className="text-2xl font-semibold text-gray-900">Quick answer</h2>
              <div className="mt-4 space-y-4 text-gray-700">
                <p className="leading-7">
                  If your property is in Wales, do not start from England Section 21 or Section 8
                  assumptions. Wales uses its own possession framework under the
                  <strong> Renting Homes (Wales) Act</strong>, and a strong landlord page needs
                  to use Welsh terminology properly: <strong>occupation contract</strong>,
                  <strong> contract-holder</strong>, and the relevant Welsh notice route rather
                  than lazy England carry-over language.
                </p>
                <p className="leading-7">
                  This page is designed as a commercial decision guide for landlords who need to
                  understand the Welsh route before they serve notice. It is not just a thin
                  template page. It explains the key Wales-versus-England differences, what an
                  occupation contract means for possession, how notice and court stages usually
                  fit together, and the mistakes that most often undermine a Wales possession case.
                </p>
                <p className="leading-7">
                  The practical point is simple: if the property is in Wales, you should start
                  with Welsh possession logic, not retrofit an England process later.
                </p>
                <p className="leading-7">
                  Use{' '}
                  <Link href="/how-to-evict-tenant" className="font-medium text-primary hover:underline">
                    how to evict a tenant
                  </Link>{' '}
                  for the main UK landlord workflow, compare stages in the{' '}
                  <Link href="/eviction-process-uk" className="font-medium text-primary hover:underline">
                    eviction process UK guide
                  </Link>, and move into{' '}
                  <Link href="/products/notice-only" className="font-medium text-primary hover:underline">
                    Notice Only
                  </Link>{' '}
                  when you need the Welsh notice drafted correctly before court strategy is set.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-8">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-5xl">
              <SeoPageContextPanel pathname="/wales-eviction-notices" />
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-br from-red-900 to-red-800 py-16 text-white lg:py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-4xl text-center">
              <div className="mb-6 flex items-center justify-center gap-2">
                <span className="text-sm font-semibold uppercase tracking-[0.24em] text-red-100">
                  Wales
                </span>
              </div>

              <h2 className="mb-6 text-4xl font-bold lg:text-5xl">
                Wales Eviction Notices (Landlord Guide)
              </h2>

              <p className="mx-auto mb-8 max-w-2xl text-xl text-red-100">
                Understand the Renting Homes (Wales) framework, use the correct Wales notice
                route, and avoid the common errors that happen when landlords rely on England
                possession wording for Welsh properties.
              </p>

              <div className="mx-auto mb-8 max-w-2xl rounded-lg border border-red-700 bg-red-950/50 p-4 text-left">
                <p className="flex items-start gap-2 text-sm text-red-100">
                  <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-400" />
                  <span>
                    <strong>Important:</strong> Section 21 and Section 8 are not the right public
                    framing for a Wales possession page. This page is built around Welsh
                    occupation contract terminology and Wales-specific possession logic.
                  </span>
                </p>
              </div>

              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Link
                  href={noticeOnlyHref}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 font-semibold text-red-800 transition-colors hover:bg-red-50"
                >
                  Get Wales Notice - {noticeOnlyPrice}
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/wales-tenancy-agreement-template"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-8 py-4 font-semibold text-white transition-colors hover:bg-white/20"
                >
                  Wales Occupation Contracts
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-5xl">
              <h2 className="mb-6 text-3xl font-bold text-gray-900">
                Why Wales possession pages need their own language
              </h2>
              <div className="space-y-5 text-gray-700">
                <p className="leading-7">
                  A lot of weak landlord content treats Wales as a lightly edited England page.
                  That is one of the biggest quality failures in this category. The possession
                  page might change a heading or two, but the body copy still talks like an AST
                  article. That creates confusion for landlords and weakens trust immediately.
                </p>
                <p className="leading-7">
                  A stronger Wales page needs to do three things properly. First, it should make
                  clear that the agreement framework is based on <strong>occupation contracts</strong>,
                  not ASTs. Second, it should talk about <strong>contract-holders</strong> where
                  that is the proper Welsh term, while still capturing the search intent of users
                  who type “evict tenant Wales” into Google. Third, it should explain that Wales
                  possession routes and notice logic sit inside the Renting Homes framework rather
                  than being treated as England notices with a Welsh flag added on top.
                </p>
                <p className="leading-7">
                  That matters for both SEO and conversion. SEO improves because the page serves
                  the actual Welsh search intent more precisely. Conversion improves because the
                  user lands on a page that sounds like it belongs to the jurisdiction they are
                  dealing with, rather than a generic UK article with a few cosmetic edits.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-5xl">
              <h2 className="mb-8 text-3xl font-bold text-gray-900">
                Wales vs England: key differences
              </h2>

              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <table className="w-full">
                  <thead className="border-b bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold text-gray-900">Aspect</th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-900">Wales</th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-900">England</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 font-medium text-gray-900">Main framework</td>
                      <td className="px-6 py-4 text-gray-600">
                        Renting Homes (Wales) framework
                      </td>
                      <td className="px-6 py-4 text-gray-600">England possession framework</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">Agreement language</td>
                      <td className="px-6 py-4 text-gray-600">Occupation contract</td>
                      <td className="px-6 py-4 text-gray-600">
                        Assured shorthold tenancy / residential tenancy language
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-medium text-gray-900">Occupier term</td>
                      <td className="px-6 py-4 text-gray-600">Contract-holder</td>
                      <td className="px-6 py-4 text-gray-600">Tenant</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">Possession route wording</td>
                      <td className="px-6 py-4 text-gray-600">
                        Wales notice and possession route terminology
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        Section 21 / Section 8 search language still common
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-medium text-gray-900">Common content mistake</td>
                      <td className="px-6 py-4 text-red-600 font-medium">
                        Importing England notice language by mistake
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        Treating reform-sensitive language too casually
                      </td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">Court stage</td>
                      <td className="px-6 py-4 text-gray-600">
                        County court possession route after valid notice if needed
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        England possession route after valid notice if needed
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-6">
                <p className="leading-7 text-amber-900">
                  <strong>Commercial takeaway:</strong> a Wales possession page should feel
                  unmistakably Welsh in both terminology and route logic. That is what helps
                  it compete against weaker “UK eviction” pages that blur the jurisdictions.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-gray-50 py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-5xl">
              <h2 className="mb-6 text-3xl font-bold text-gray-900">
                Understanding occupation contracts before you start possession
              </h2>

              <div className="mb-8 space-y-5 text-gray-700">
                <p className="leading-7">
                  Under the Renting Homes framework, the contractual starting point matters. A
                  possession page is stronger when it explains not just that Wales uses different
                  wording, but why that wording affects the landlord’s next step. If the landlord
                  starts with the wrong mental model, the possession process is more likely to go
                  wrong before the notice is even served.
                </p>
                <p className="leading-7">
                  That is why this page should not sound like a general “how to evict a tenant”
                  blog post. It should sound like a Wales possession route guide. The user needs
                  to understand what kind of occupation arrangement they are dealing with, what
                  notice logic may apply, and whether the case is really about standard
                  possession, breach, arrears, or another Wales-specific route.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-xl border border-red-200 bg-red-50 p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-600">
                      <Home className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Standard contract</h3>
                  </div>
                  <p className="mb-4 text-gray-600">
                    Common for private landlords and the main Wales route most private-sector
                    users on this page will be dealing with.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
                      Most common private landlord contract type
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
                      Possession route depends on the Welsh contract position and notice logic
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
                      Better understood through Wales-specific guidance, not England templates
                    </li>
                  </ul>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-600">
                      <Scale className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Secure contract</h3>
                  </div>
                  <p className="mb-4 text-gray-600">
                    More commonly associated with local authority or social housing contexts and
                    usually not the main private landlord route.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
                      Greater security features for the occupier
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
                      Different practical context from many private landlord cases
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
                      Still reinforces why Wales pages cannot be written like England AST pages
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-5xl">
              <h2 className="mb-8 text-3xl font-bold text-gray-900">
                Wales possession process overview
              </h2>

              <div className="mb-8 space-y-5 text-gray-700">
                <p className="leading-7">
                  The goal of this section is not to pretend every Wales possession case is
                  identical. It is to give landlords a clearer route map. In most cases, the
                  landlord first identifies the correct Welsh possession basis, then prepares
                  and serves the right notice, waits for the notice period to expire, and only
                  then moves to court if possession is still needed.
                </p>
                <p className="leading-7">
                  That may sound obvious, but it is exactly where weaker pages fail. They jump
                  from “serve notice” to “go to court” without helping the landlord understand
                  what the notice is supposed to do, what evidence may matter, or how Wales
                  terminology changes the analysis.
                </p>
              </div>

              <div className="space-y-6">
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
                      <span className="font-bold text-red-600">1</span>
                    </div>
                    <div>
                      <h3 className="mb-2 text-lg font-bold text-gray-900">Identify the correct Wales route</h3>
                      <p className="text-gray-600">
                        Start with the right Welsh possession logic. Work out whether the case is
                        based on the main contract position, breach, arrears, or another route
                        under the Wales framework rather than starting with an England mindset.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
                      <span className="font-bold text-red-600">2</span>
                    </div>
                    <div>
                      <h3 className="mb-2 text-lg font-bold text-gray-900">Prepare and serve the correct notice</h3>
                      <p className="text-gray-600">
                        Use the correct Wales notice route and make sure service, dates, and
                        wording are handled properly. This is where many possession cases are
                        weakened before they ever reach court.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
                      <span className="font-bold text-red-600">3</span>
                    </div>
                    <div>
                      <h3 className="mb-2 text-lg font-bold text-gray-900">Allow the full notice period</h3>
                      <p className="text-gray-600">
                        Let the notice period run fully. Keep evidence of service and relevant
                        communications in case the matter proceeds further.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
                      <span className="font-bold text-red-600">4</span>
                    </div>
                    <div>
                      <h3 className="mb-2 text-lg font-bold text-gray-900">Move to county court if needed</h3>
                      <p className="text-gray-600">
                        If the contract-holder does not leave, court action may be required.
                        Landlords should expect to support the case with the correct documents,
                        evidence, and a properly handled notice history.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
                      <span className="font-bold text-red-600">5</span>
                    </div>
                    <div>
                      <h3 className="mb-2 text-lg font-bold text-gray-900">Use enforcement properly</h3>
                      <p className="text-gray-600">
                        If possession is granted but the occupier still remains, only the lawful
                        enforcement route should be used. Never attempt informal removal.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6">
                <div className="flex items-start gap-3">
                  <XCircle className="mt-0.5 h-5 w-5 text-red-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-red-900">
                      What this page should not encourage
                    </h3>
                    <p className="mt-2 leading-7 text-red-900/90">
                      It should never sound like a landlord can just “tell the tenant to go” and
                      treat the matter as finished. Wales possession is still a legal process, and
                      landlords should not change locks, intimidate occupiers, or attempt
                      self-help removal.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-gray-50 py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-5xl">
              <h2 className="mb-6 text-3xl font-bold text-gray-900">Notice periods in Wales</h2>

              <div className="mb-8 rounded-r-lg border-l-4 border-amber-500 bg-amber-50 p-4">
                <p className="text-sm text-amber-900">
                  <strong>Important:</strong> Wales notice timing and route detail should be
                  checked carefully against the current Welsh position. This page should guide
                  route choice, but landlords should not rely on a simplistic “one notice period
                  fits all” assumption.
                </p>
              </div>

              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <table className="w-full">
                  <thead className="border-b bg-red-50">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold text-gray-900">
                        Route or situation
                      </th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-900">
                        Practical point
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        Main possession route
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        Often treated as longer-notice territory than familiar England no-fault
                        assumptions.
                      </td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        Serious arrears or breach scenarios
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        Different timing and route logic may apply depending on the Welsh ground
                        or breach position.
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        Anti-social behaviour or serious misconduct
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        Landlords should assess whether a faster or different breach-led route
                        is available under Welsh law.
                      </td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        Court stage after notice
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        The court still expects a valid notice foundation and proper evidence.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="mt-6 text-sm leading-6 text-gray-600">
                Better commercial wording on a Wales page focuses on the route and the logic, not
                on pretending every Welsh possession case can be reduced to one fixed timeline.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-5xl">
              <h2 className="mb-6 text-3xl font-bold text-gray-900">
                Wales eviction checklist and common mistakes
              </h2>
              <p className="mb-10 max-w-4xl text-gray-600">
                The most common reason landlords lose time is not that they chose to seek
                possession. It is that they started the process with the wrong notice logic,
                weak service evidence, or an England-based assumption that does not belong on a
                Welsh file.
              </p>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 shadow-sm">
                  <h3 className="mb-3 text-lg font-bold text-gray-900">Validity checklist</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>Correct occupation contract context identified.</li>
                    <li>Correct Wales notice route chosen.</li>
                    <li>Deposit and document history checked where relevant.</li>
                    <li>Accurate dates and service evidence retained.</li>
                    <li>Landlord records and supporting documents in order.</li>
                  </ul>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 shadow-sm">
                  <h3 className="mb-3 text-lg font-bold text-gray-900">Common mistakes</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>Using England Section 21 or Section 8 language for Wales.</li>
                    <li>Serving the wrong notice route for the actual Welsh scenario.</li>
                    <li>Missing proof of service or poor date handling.</li>
                    <li>Assuming a notice alone finishes the possession process.</li>
                    <li>Failing to distinguish contract-holder terminology from England tenant wording.</li>
                  </ul>
                  <Link
                    href="/how-to-evict-tenant"
                    className="mt-3 inline-flex text-sm font-medium text-primary hover:underline"
                  >
                    See UK eviction guide →
                  </Link>
                </div>
              </div>

              <div className="mt-8 rounded-2xl border border-green-200 bg-green-50 p-6">
                <h3 className="text-lg font-semibold text-green-900">What this means for conversion</h3>
                <p className="mt-2 leading-7 text-green-900/90">
                  A high-performing Wales page should help landlords self-identify the right route
                  early. That improves user trust and reduces the risk of wrong-door purchases by
                  users who really needed Welsh possession guidance rather than a generic UK notice page.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-br from-red-700 to-red-600 py-16 text-white">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="mb-6 text-3xl font-bold">Need help with a Wales possession route?</h2>
              <p className="mb-8 text-xl text-red-100">
                Start with a Wales-specific notice workflow and move forward with clearer Renting
                Homes Act positioning.
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Link
                  href={productLinks.noticeOnly.href}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 font-semibold text-red-700 transition-colors hover:bg-red-50"
                >
                  Get Wales Notice — {noticeOnlyPrice}
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
                jurisdiction="wales"
                title="Not sure which Wales route applies?"
                description="Ask Heaven can help you understand occupation contracts, notice logic, and the Renting Homes possession process."
                utm_campaign="wales-eviction-notices"
              />
            </div>
          </div>
        </section>

        <section className="bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-5xl">
              <NextLegalSteps
                jurisdictionLabel="Wales eviction notices"
                scenarioLabel="Renting Homes Act possession"
                primaryCTA={{
                  label: `Generate Wales notice — ${noticeOnlyPrice}`,
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
                    href: '/wales-tenancy-agreement-template',
                    title: 'Wales occupation contracts',
                    description: 'Create compliant occupation contracts for Welsh properties.',
                  },
                  {
                    href: '/blog/wales-eviction-process',
                    title: 'Wales eviction process',
                    description: 'Wales possession route guide and next steps.',
                  },
                  {
                    href: '/money-claim-unpaid-rent',
                    title: 'Unpaid rent claim guide',
                    description: 'Recover arrears through the courts where appropriate.',
                  },
                ]}
              />
            </div>
          </div>
        </section>

        <FAQSection
          title="Wales Eviction FAQ"
          faqs={walesEvictionFAQs}
          showContactCTA={false}
          variant="white"
        />
      </main>
    </>
  );
}
