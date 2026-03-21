import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  FileText,
  Landmark,
  Info,
  Scale,
  Shield,
  Clock3,
  Gavel,
  Mail,
  CalendarClock,
} from 'lucide-react';
import { StructuredData, breadcrumbSchema, articleSchema, faqPageSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';
import { PRODUCTS } from '@/lib/pricing/products';
import { Section21Countdown } from '@/components/ui/Section21Countdown';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { productLinks, toolLinks, blogLinks } from '@/lib/seo/internal-links';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { FAQSection } from '@/components/seo/FAQSection';
import { IntentProductCTA } from '@/components/seo/IntentProductCTA';
import { evictionNoticeTemplateFAQs } from '@/data/faqs';
import { EvictionNoticeBundlePreviewSection } from '@/components/seo/EvictionNoticeBundlePreviewSection';
import { getNoticeOnlyPreviewData } from '@/lib/previews/noticeOnlyPreviews';
import { Section21ComplianceTimingPanel } from '@/components/products/Section21ComplianceTimingPanel';
import { SeoLandingWrapper } from '@/components/seo/SeoLandingWrapper';
import { SeoPageContextPanel } from '@/components/seo/SeoPageContextPanel';

const canonicalUrl = getCanonicalUrl('/eviction-notice-template');

const noticeOnlyPrice = PRODUCTS.notice_only?.displayPrice ?? '£29.99';
const completePackPrice = PRODUCTS.complete_pack?.displayPrice ?? '£79.99';

const noticeOnlyProductHref = '/products/notice-only';
const completePackProductHref = '/products/complete-pack';

export const metadata: Metadata = {
  title: 'Eviction Notice Template UK | Jurisdiction-Specific Landlord Notice Builder',
  description:
    'Generate the correct eviction notice template for England, Wales, or Scotland. Learn what a valid notice should include, how service works, and build jurisdiction-specific possession notices with compliance checks.',
  keywords: [
    'eviction notice template uk',
    'eviction notice template',
    'possession notice template',
    'landlord eviction notice',
    'section 21 notice template',
    'section 8 notice template',
    'section 173 notice wales',
    'notice to leave scotland',
    'tenant eviction notice',
    'uk possession notice builder',
    'eviction letter template',
    'what should an eviction notice include',
    'how to serve eviction notice landlord',
  ],
  alternates: {
    canonical: canonicalUrl,
  },
  openGraph: {
    title: 'Eviction Notice Template UK | Jurisdiction-Specific Landlord Notice Builder',
    description:
      'Choose your jurisdiction and generate the correct eviction notice route for England, Wales, or Scotland with compliance-first document logic.',
    type: 'article',
    url: canonicalUrl,
    siteName: 'Landlord Heaven',
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Eviction Notice Template UK | Jurisdiction-Specific Landlord Notice Builder',
    description:
      'Generate England, Wales, or Scotland eviction notices with cleaner jurisdiction-specific logic.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

const pageFaqs = [
  {
    question: 'What should an eviction notice include?',
    answer:
      'A valid eviction notice usually needs the correct landlord and tenant details, the property address, the correct statutory route, the correct ground where relevant, the correct notice period, the correct service date, and the wording or prescribed form required for that jurisdiction. The exact requirements differ between England, Wales, and Scotland.',
  },
  {
    question: 'Is a generic eviction notice template enough?',
    answer:
      'Usually not. The risk with generic templates is that they often blur jurisdictions or route requirements. England, Wales, and Scotland use different notice systems, and an otherwise well-written notice can still fail if it uses the wrong route, wording, notice period, or service logic.',
  },
  {
    question: 'Does serving a notice mean the tenant has been evicted?',
    answer:
      'No. Serving the notice is the start of the possession route, not the end. If the tenant does not leave after the notice expires, landlords usually still need to take the next legal step through the relevant court or tribunal route.',
  },
  {
    question: 'Why would a landlord use Notice Only instead of the full court bundle?',
    answer:
      'Notice Only is usually the better fit where the landlord mainly needs the correct notice, route checks, and a cleaner service-stage workflow. The full court bundle is usually more suitable where the matter is already more advanced or likely to move quickly into the court or tribunal stage.',
  },
  {
    question: 'Can the wrong notice reset the whole possession timeline?',
    answer:
      'Yes. If the wrong notice is used, or if the notice contains serious route, date, wording, or service errors, the landlord may need to start again. That is why using a jurisdiction-specific notice workflow is usually safer than relying on a recycled template.',
  },
];

export default async function EvictionNoticeTemplatePage() {
  const previews = await getNoticeOnlyPreviewData();

  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Eviction Notice Template UK',
    description:
      'Jurisdiction-specific eviction notice template bundles for landlords in England, Wales, and Scotland.',
    url: canonicalUrl,
    mainEntity: {
      '@type': 'Product',
      name: 'UK Eviction Notice Templates',
      description:
        'Jurisdiction-specific landlord eviction notice bundles with compliance checks and preview-first workflow.',
      offers: {
        '@type': 'AggregateOffer',
        lowPrice: '29.99',
        highPrice: '29.99',
        priceCurrency: 'GBP',
        offerCount: '1',
      },
    },
  };

  return (
    <div className="min-h-screen bg-[#fcfaff]">
      <SeoLandingWrapper
        pagePath="/eviction-notice-template"
        pageTitle={metadata.title as string}
        pageType="notice"
        jurisdiction="uk"
      />

      <StructuredData data={pageSchema} />
      <StructuredData
        data={articleSchema({
          headline: 'Eviction Notice Template UK',
          description: metadata.description as string,
          url: canonicalUrl,
          datePublished: '2026-03-01',
          dateModified: '2026-03-20',
        })}
      />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: getCanonicalUrl('/') },
          { name: 'Eviction Notice Template', url: canonicalUrl },
        ])}
      />
      <StructuredData data={faqPageSchema(pageFaqs)} />

      <HeaderConfig mode="autoOnScroll" />

      <main>
        <UniversalHero
          badge="Jurisdiction-Specific Notice Builder"
          title="Eviction Notice Template UK"
          subtitle="Generate the correct possession notice route for England, Wales, or Scotland with solicitor-grade, jurisdiction-specific workflow checks before service."
          primaryCta={{ label: `Start Notice Only — ${noticeOnlyPrice}`, href: noticeOnlyProductHref }}
          secondaryCta={{ label: `Need the full court bundle? — ${completePackPrice}`, href: completePackProductHref }}
          showTrustPositioningBar
          hideMedia
          variant="pastel"
        >
          <p className="mt-6 text-sm text-white/90 md:text-base">
            This page is built for landlords who need the right notice for the right jurisdiction.
            It helps prevent the most common failure in this area: using the wrong legal route,
            the wrong wording, or the wrong notice logic before service.
          </p>
        </UniversalHero>

        <section className="border-b border-[#E6DBFF] bg-white py-8">
          <div className="container mx-auto px-4">
            <div className="mx-auto mb-6 max-w-5xl">
              <SeoPageContextPanel pathname="/eviction-notice-template" />
            </div>
            <nav
              aria-labelledby="notice-guide-links-heading"
              className="mx-auto max-w-5xl rounded-2xl border border-[#E6DBFF] bg-white p-6"
            >
              <h2 id="notice-guide-links-heading" className="text-2xl font-semibold text-[#2a2161]">
                On This Page
              </h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <a href="#quick-answer" className="rounded-lg border border-[#E6DBFF] px-4 py-3 text-primary hover:bg-[#F8F4FF]">
                  Quick answer
                </a>
                <a href="#what-is-an-eviction-notice" className="rounded-lg border border-[#E6DBFF] px-4 py-3 text-primary hover:bg-[#F8F4FF]">
                  What an eviction notice is
                </a>
                <a href="#what-a-valid-notice-should-include" className="rounded-lg border border-[#E6DBFF] px-4 py-3 text-primary hover:bg-[#F8F4FF]">
                  What a valid notice should include
                </a>
                <a href="#how-service-works" className="rounded-lg border border-[#E6DBFF] px-4 py-3 text-primary hover:bg-[#F8F4FF]">
                  How service works
                </a>
                <a href="#jurisdiction-types" className="rounded-lg border border-[#E6DBFF] px-4 py-3 text-primary hover:bg-[#F8F4FF]">
                  Notice types by jurisdiction
                </a>
                <a href="#why-correct-notice-matters" className="rounded-lg border border-[#E6DBFF] px-4 py-3 text-primary hover:bg-[#F8F4FF]">
                  Why the correct notice matters
                </a>
                <a href="#preview-workflow" className="rounded-lg border border-[#E6DBFF] px-4 py-3 text-primary hover:bg-[#F8F4FF]">
                  Preview and bundle workflow
                </a>
                <a href="#notice-only-vs-complete-pack" className="rounded-lg border border-[#E6DBFF] px-4 py-3 text-primary hover:bg-[#F8F4FF]">
                  Notice Only vs Complete Pack
                </a>
                <a href="#section-21-transition" className="rounded-lg border border-[#E6DBFF] px-4 py-3 text-primary hover:bg-[#F8F4FF]">
                  Section 21 transition
                </a>
                <a href="#final-cta" className="rounded-lg border border-[#E6DBFF] px-4 py-3 text-primary hover:bg-[#F8F4FF]">
                  Next steps
                </a>
              </div>
            </nav>
          </div>
        </section>

        <section id="quick-answer" className="bg-white py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-5xl rounded-2xl border border-[#E6DBFF] bg-[#FCFAFF] p-6 md:p-8">
              <h2 className="text-3xl font-bold text-gray-900">Quick answer</h2>
              <div className="mt-6 space-y-5 text-gray-700">
                <p className="leading-7">
                  An eviction notice template only works if it matches the jurisdiction,
                  the tenancy framework, and the possession route you are actually using.
                  England, Wales, and Scotland do not share one interchangeable notice system.
                  They use different legal routes, different terminology, and different
                  statutory logic.
                </p>
                <p className="leading-7">
                  That is why a strong page in this category should not just offer a generic
                  eviction letter template. It should guide the landlord into the correct
                  route first, then build the notice around that route. In England that may
                  mean Section 21 or Section 8 logic. In Wales it means a Welsh occupation
                  contract pathway, not England carry-over wording. In Scotland it means
                  Notice to Leave and Scottish ground-specific timing, not Section 21 or
                  Section 8 assumptions.
                </p>
                <p className="leading-7">
                  The commercial value of this page is simple: it helps landlords avoid
                  invalid or weak notices by starting with jurisdiction control. That is much
                  stronger than a template page that makes the user choose a form name first
                  and discover the legal mismatch later.
                </p>
              </div>

              <div className="mt-8 rounded-2xl border border-[#E6DBFF] bg-white p-5">
                <h3 className="text-lg font-semibold text-[#2a2161]">Best next step for most landlords</h3>
                <p className="mt-2 text-gray-700 leading-7">
                  Most landlords do not need a generic notice template. They need the
                  <strong> correct notice for the correct jurisdiction</strong>, with the
                  right wording, timing, and route logic. That is what our{' '}
                  <Link href="/products/notice-only" className="font-semibold text-primary hover:underline">
                    Notice Only
                  </Link>{' '}
                  workflow is built for.
                </p>
                <div className="mt-4">
                  <Link
                    href="/products/notice-only"
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-white hover:opacity-95"
                  >
                    Use Notice Only — {noticeOnlyPrice}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="what-is-an-eviction-notice" className="py-12 md:py-14">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-5xl rounded-2xl border border-[#E6DBFF] bg-white p-6 md:p-8">
              <h2 className="text-3xl font-bold text-gray-900">What an eviction notice actually is</h2>
              <div className="mt-6 space-y-5 text-gray-700">
                <p className="leading-7">
                  An eviction notice is the formal document that starts the possession route.
                  It tells the tenant, contract-holder, or occupier that the landlord is
                  relying on a specific statutory pathway and that a defined notice period
                  is now running. It is not the same thing as actually obtaining possession.
                </p>
                <p className="leading-7">
                  That distinction matters because many landlords still think that serving
                  the notice ends the matter. It does not. The notice is usually the first
                  stage. If the occupier does not leave after the notice expires, the
                  landlord normally still needs to take the next legal step through the
                  court or tribunal route that applies in that jurisdiction.
                </p>
                <p className="leading-7">
                  A stronger educational page should therefore explain that the notice sits
                  inside a wider possession process. The notice is the foundation document.
                  If the foundation is wrong, the rest of the case may become slower,
                  weaker, or more expensive.
                </p>
              </div>

              <div className="mt-8 rounded-xl border border-[#E6DBFF] bg-[#F8F4FF] p-5">
                <div className="flex items-start gap-3">
                  <Gavel className="w-5 h-5 text-[#692ed4] flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900">What this means commercially</h3>
                    <p className="mt-2 text-gray-700 leading-7">
                      If you mainly need the correct notice and service-stage workflow,
                      <Link href="/products/notice-only" className="ml-1 font-semibold text-primary hover:underline">
                        Notice Only
                      </Link>{' '}
                      is usually the right starting point. It is designed for landlords who
                      need the notice done properly before they worry about the later court bundle.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="what-a-valid-notice-should-include" className="py-12 md:py-14 bg-[#F3EEFF]">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-5xl rounded-2xl border border-[#E6DBFF] bg-white p-6 md:p-8">
              <h2 className="text-3xl font-bold text-gray-900">What a valid notice should usually include</h2>
              <p className="mt-6 text-gray-700 leading-7">
                This is the missing educational core on many competitor pages. Landlords do not
                just want to know the name of the notice. They want to know what a valid notice
                normally needs to contain. The exact requirements depend on England, Wales, or
                Scotland, but the core structure usually includes the following.
              </p>

              <div className="mt-8 grid gap-6 md:grid-cols-2">
                <div className="rounded-xl border border-[#E6DBFF] bg-[#FCFAFF] p-5">
                  <h3 className="text-lg font-semibold text-[#2a2161]">Core notice content</h3>
                  <ul className="mt-4 space-y-3 text-gray-700 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-0.5 text-[#692ed4]" />
                      Correct landlord and tenant or contract-holder names
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-0.5 text-[#692ed4]" />
                      Full property address
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-0.5 text-[#692ed4]" />
                      Correct statutory notice route for the jurisdiction
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-0.5 text-[#692ed4]" />
                      Correct ground where the route depends on grounds
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-0.5 text-[#692ed4]" />
                      Correct notice period and leave or expiry date logic
                    </li>
                  </ul>
                </div>

                <div className="rounded-xl border border-[#E6DBFF] bg-[#FCFAFF] p-5">
                  <h3 className="text-lg font-semibold text-[#2a2161]">Validity and service detail</h3>
                  <ul className="mt-4 space-y-3 text-gray-700 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-0.5 text-[#692ed4]" />
                      Correct prescribed wording or form where required
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-0.5 text-[#692ed4]" />
                      Service date handled properly
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-0.5 text-[#692ed4]" />
                      Method of service that fits the tenancy and route
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-0.5 text-[#692ed4]" />
                      Supporting compliance position where relevant
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-0.5 text-[#692ed4]" />
                      Proof of service retained from the start
                    </li>
                  </ul>
                </div>
              </div>

              <p className="mt-8 text-gray-700 leading-7">
                This is exactly why a generic Word or PDF template is often not enough. The
                landlord usually does not just need a document shell. They need the correct
                notice structure built from the correct route. That is why{' '}
                <Link href="/products/notice-only" className="font-semibold text-primary hover:underline">
                  Notice Only
                </Link>{' '}
                is usually the better fit for landlords who want the notice built properly before service.
              </p>

              <div className="mt-6">
                <Link
                  href="/products/notice-only"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-white hover:opacity-95"
                >
                  Start with Notice Only — {noticeOnlyPrice}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section id="how-service-works" className="py-12 md:py-14">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-5xl rounded-2xl border border-[#E6DBFF] bg-white p-6 md:p-8">
              <h2 className="text-3xl font-bold text-gray-900">Serving the notice correctly</h2>
              <div className="mt-6 space-y-5 text-gray-700">
                <p className="leading-7">
                  Even a well-drafted notice can become risky if service is handled badly.
                  A strong page should explain that notice content and notice service are
                  different problems. Landlords need both. Date mistakes, poor proof of service,
                  or using a weak delivery method can make later possession steps harder.
                </p>
                <p className="leading-7">
                  The exact service rules depend on the tenancy documents and the jurisdiction,
                  but as a practical matter landlords should always think about how they will
                  prove when the notice was sent, how it was sent, and why the service date
                  used in the notice is reliable.
                </p>
              </div>

              <div className="mt-8 grid gap-6 md:grid-cols-3">
                <div className="rounded-xl border border-[#E6DBFF] bg-[#FCFAFF] p-5">
                  <Mail className="w-6 h-6 text-[#692ed4] mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Method matters</h3>
                  <p className="text-sm text-gray-600">
                    The way a notice is delivered can matter almost as much as the wording.
                  </p>
                </div>
                <div className="rounded-xl border border-[#E6DBFF] bg-[#FCFAFF] p-5">
                  <CalendarClock className="w-6 h-6 text-[#692ed4] mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Dates matter</h3>
                  <p className="text-sm text-gray-600">
                    Wrong service dates or expiry logic can weaken the notice immediately.
                  </p>
                </div>
                <div className="rounded-xl border border-[#E6DBFF] bg-[#FCFAFF] p-5">
                  <Shield className="w-6 h-6 text-[#692ed4] mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Proof matters</h3>
                  <p className="text-sm text-gray-600">
                    Keep evidence of service from day one rather than trying to reconstruct it later.
                  </p>
                </div>
              </div>

              <div className="mt-8 rounded-xl border border-green-200 bg-green-50 p-5">
                <p className="text-green-900 leading-7">
                  This is another reason landlords use{' '}
                  <Link href="/products/notice-only" className="font-semibold text-primary hover:underline">
                    /products/notice-only
                  </Link>{' '}
                  instead of copying a template manually. The value is not just the document.
                  It is the cleaner service-stage workflow that sits around the document.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-10 md:py-14">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-6xl">
              <Section21ComplianceTimingPanel />
            </div>
          </div>
        </section>

        <section id="preview-workflow" className="py-10 md:py-14">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl border border-[#E6DBFF] bg-white shadow-[0_14px_36px_rgba(15,23,42,0.06)]">
              <EvictionNoticeBundlePreviewSection previews={previews} />
            </div>
          </div>
        </section>

        <section id="jurisdiction-types" className="bg-[#F3EEFF] py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="mb-10 flex justify-center">
                <Image
                  src="/images/why_this_bundle.webp"
                  alt="Why this bundle illustration"
                  width={340}
                  height={340}
                  className="h-auto w-full max-w-[340px] object-contain"
                />
              </div>

              <h2 className="mb-4 text-center text-3xl font-bold text-gray-900 lg:text-5xl">
                Types of eviction notices by jurisdiction
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                The wizard should identify jurisdiction first, then map the facts to the
                correct statutory notice route. That is what makes the bundle more useful
                than a generic notice template page.
              </p>

              <div className="grid gap-6 lg:grid-cols-3">
                <article className="rounded-2xl border border-[#E6DBFF] bg-white p-6 shadow-[0_12px_30px_rgba(105,46,212,0.1)]">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F3EEFF] border border-[#E6DBFF]">
                      <Landmark className="w-6 h-6 text-[#692ed4]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">England</h3>
                      <span className="text-sm text-gray-500">Housing route / possession notices</span>
                    </div>
                  </div>
                  <ul className="space-y-3 mb-6 text-gray-700 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-0.5 text-[#692ed4]" />
                      Section 21-style route where available and valid
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-0.5 text-[#692ed4]" />
                      Section 8-style grounds-based route where appropriate
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-0.5 text-[#692ed4]" />
                      Reform and compliance timing awareness built in
                    </li>
                  </ul>
                  <Link href="/products/notice-only" className="inline-flex items-center gap-2 text-[#692ed4] font-medium hover:underline">
                    Use Notice Only <ArrowRight className="w-4 h-4" />
                  </Link>
                </article>

                <article className="rounded-2xl border border-[#E6DBFF] bg-white p-6 shadow-[0_12px_30px_rgba(105,46,212,0.1)]">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F3EEFF] border border-[#E6DBFF]">
                      <Scale className="w-6 h-6 text-[#692ed4]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Wales</h3>
                      <span className="text-sm text-gray-500">Occupation contracts / Welsh routes</span>
                    </div>
                  </div>
                  <ul className="space-y-3 mb-6 text-gray-700 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-0.5 text-[#692ed4]" />
                      Occupation contract pathway checks
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-0.5 text-[#692ed4]" />
                      Section 173 and related Welsh possession workflow logic
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-0.5 text-[#692ed4]" />
                      Notice-period and service validation for Wales
                    </li>
                  </ul>
                  <Link href="/products/notice-only" className="inline-flex items-center gap-2 text-[#692ed4] font-medium hover:underline">
                    Use Notice Only <ArrowRight className="w-4 h-4" />
                  </Link>
                </article>

                <article className="rounded-2xl border border-[#E6DBFF] bg-white p-6 shadow-[0_12px_30px_rgba(105,46,212,0.1)]">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F3EEFF] border border-[#E6DBFF]">
                      <FileText className="w-6 h-6 text-[#692ed4]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Scotland</h3>
                      <span className="text-sm text-gray-500">PRT / Notice to Leave</span>
                    </div>
                  </div>
                  <ul className="space-y-3 mb-6 text-gray-700 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-0.5 text-[#692ed4]" />
                      Notice to Leave for Scottish private residential tenancy routes
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-0.5 text-[#692ed4]" />
                      Ground-specific timing checks
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-0.5 text-[#692ed4]" />
                      Service and statutory wording validation
                    </li>
                  </ul>
                  <Link href="/products/notice-only" className="inline-flex items-center gap-2 text-[#692ed4] font-medium hover:underline">
                    Use Notice Only <ArrowRight className="w-4 h-4" />
                  </Link>
                </article>
              </div>

              <div className="mt-8 rounded-2xl border border-[#E6DBFF] bg-white p-6 shadow-[0_10px_28px_rgba(105,46,212,0.08)]">
                <div className="flex items-start gap-4">
                  <Info className="w-5 h-5 text-[#692ed4] flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Not sure which notice to use?</h3>
                    <p className="text-gray-600 text-sm">
                      The wizard should identify jurisdiction first, then map your facts to
                      the correct statutory route before document generation. That is what
                      reduces the risk of invalid or misdirected notice service.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 rounded-2xl border border-[#E6DBFF] bg-white p-6 text-center shadow-[0_10px_28px_rgba(105,46,212,0.08)]">
                <h3 className="text-xl font-semibold text-gray-900">Need the correct notice, not a generic template?</h3>
                <p className="mt-3 text-gray-700 leading-7">
                  Start with{' '}
                  <Link href="/products/notice-only" className="font-semibold text-primary hover:underline">
                    Notice Only
                  </Link>{' '}
                  and let the route be identified first. That is usually safer than downloading
                  a template and trying to work backward into compliance.
                </p>
                <div className="mt-5">
                  <Link
                    href="/products/notice-only"
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-white hover:opacity-95"
                  >
                    Go to Notice Only — {noticeOnlyPrice}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              <p className="mt-8 text-center text-gray-700">
                Need the full court bundle?{' '}
                <Link href="/products/complete-pack" className="font-semibold text-[#692ed4] hover:underline">
                  View Complete Pack
                </Link>
              </p>
            </div>
          </div>
        </section>

        <section id="why-correct-notice-matters" className="py-16 lg:py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
                <div className="rounded-2xl border border-[#E6DBFF] bg-[#F3EEFF] p-8 shadow-[0_12px_30px_rgba(105,46,212,0.08)]">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Why the correct notice matters</h2>
                  <p className="mb-6 text-gray-700 leading-7">
                    A possession case can be weakened long before court if the wrong notice
                    is served, the wrong route is chosen, or the jurisdiction is handled
                    lazily. This is why high-intent landlords need more than a blank form.
                    They need route control, compliance discipline, and a better starting
                    point than generic downloadable templates.
                  </p>
                  <ul className="space-y-4">
                    <li className="flex gap-3 text-gray-700">
                      <AlertTriangle className="w-5 h-5 mt-0.5 text-[#692ed4]" />
                      Incorrect wording can undermine the possession route
                    </li>
                    <li className="flex gap-3 text-gray-700">
                      <AlertTriangle className="w-5 h-5 mt-0.5 text-[#692ed4]" />
                      Notice periods differ by jurisdiction and by ground
                    </li>
                    <li className="flex gap-3 text-gray-700">
                      <AlertTriangle className="w-5 h-5 mt-0.5 text-[#692ed4]" />
                      Reform changes can affect route choice and timing
                    </li>
                    <li className="flex gap-3 text-gray-700">
                      <AlertTriangle className="w-5 h-5 mt-0.5 text-[#692ed4]" />
                      Errors at notice stage can reset the wider eviction timeline
                    </li>
                  </ul>
                  <p className="mt-6 text-gray-800 font-medium">
                    Serving the correct notice, in the correct format, for the correct
                    jurisdiction is the foundation of a stronger possession file.
                  </p>
                </div>

                <div className="flex items-center justify-center rounded-2xl border border-[#E6DBFF] bg-[#F3EEFF] p-8 shadow-[0_12px_30px_rgba(105,46,212,0.08)]">
                  <Image
                    src="/images/why_accuracy_matters.webp"
                    alt="Why accuracy matters illustration"
                    width={640}
                    height={640}
                    className="h-auto w-full max-w-[640px] object-contain"
                  />
                </div>
              </div>

              <div className="mt-8 rounded-2xl border border-green-200 bg-green-50 p-6">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-green-700 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-green-900">What stronger pages do better</h3>
                    <p className="mt-2 text-green-900/90 leading-7">
                      Better-performing landlord pages do not just say “download your notice.”
                      They explain why route accuracy matters, why jurisdiction discipline is
                      commercially important, and why clean notice generation is often the first
                      thing that separates a smoother possession path from a delayed one.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 rounded-2xl border border-[#E6DBFF] bg-[#F8F4FF] p-6">
                <h3 className="text-xl font-semibold text-[#2a2161]">This is exactly what Notice Only is for</h3>
                <p className="mt-3 text-gray-700 leading-7">
                  If your main goal is to get the right notice generated before service,
                  <Link href="/products/notice-only" className="ml-1 font-semibold text-primary hover:underline">
                    Notice Only
                  </Link>{' '}
                  is usually the better fit than a generic template. It is built to push the
                  landlord into the correct route first and then produce the notice around that route.
                </p>
                <div className="mt-5">
                  <Link
                    href="/products/notice-only"
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-white hover:opacity-95"
                  >
                    Use Notice Only — {noticeOnlyPrice}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="notice-only-vs-complete-pack" className="py-16 lg:py-20 bg-[#F3EEFF]">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto rounded-2xl border border-[#E6DBFF] bg-white p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Notice Only vs Complete Pack</h2>
              <p className="text-gray-700 leading-7 mb-8">
                This is one of the most useful commercial distinctions on the page. Landlords
                often do not know whether they just need the correct notice or whether they
                already need the wider court bundle. A strong page helps them self-select correctly.
              </p>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-xl border border-[#E6DBFF] bg-[#FCFAFF] p-6">
                  <h3 className="text-xl font-semibold text-[#2a2161]">Notice Only</h3>
                  <ul className="mt-4 space-y-3 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-0.5 text-[#692ed4]" />
                      Best where the main need is the correct notice and route checks
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-0.5 text-[#692ed4]" />
                      Better for landlords who are still at the notice and service stage
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-0.5 text-[#692ed4]" />
                      Strong fit for jurisdiction-specific notice generation
                    </li>
                  </ul>
                  <div className="mt-5">
                    <Link
                      href="/products/notice-only"
                      className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-white hover:opacity-95"
                    >
                      Notice Only — {noticeOnlyPrice}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                <div className="rounded-xl border border-[#E6DBFF] bg-[#FCFAFF] p-6">
                  <h3 className="text-xl font-semibold text-[#2a2161]">Complete Pack</h3>
                  <ul className="mt-4 space-y-3 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-0.5 text-[#692ed4]" />
                      Better where the matter is already more advanced
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-0.5 text-[#692ed4]" />
                      Stronger fit where the user expects the court stage to follow quickly
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-0.5 text-[#692ed4]" />
                      Better for broader eviction workflow needs beyond the notice itself
                    </li>
                  </ul>
                  <div className="mt-5">
                    <Link
                      href="/products/complete-pack"
                      className="inline-flex items-center gap-2 rounded-lg border border-[#E6DBFF] bg-white px-5 py-3 text-primary hover:bg-[#FCFAFF]"
                    >
                      Complete Pack — {completePackPrice}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>

              <p className="mt-8 text-gray-700 leading-7">
                For most users landing on an “eviction notice template” page, the most natural
                product push is still{' '}
                <Link href="/products/notice-only" className="font-semibold text-primary hover:underline">
                  /products/notice-only
                </Link>
                , because they are usually still trying to get the notice stage right.
              </p>
            </div>
          </div>
        </section>

        <section id="section-21-transition" className="py-12 bg-gradient-to-r from-[#692ED4] via-[#7A3BE5] to-[#5a21be] text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-2xl lg:text-3xl font-bold mb-4">Section 21 transition in England</h2>
              <p className="text-white/90 mb-6 max-w-2xl mx-auto">
                The England route is transition-sensitive. If your case still fits the cleaner
                Section 21 path, timing and validity matter. If not, a broader possession route
                may already be the better fit.
              </p>
              <Section21Countdown variant="large" className="mb-8 [&_*]:text-white" />
              <IntentProductCTA
                intent={{ product: 'notice_only', src: 'seo_eviction_notice_template', topic: 'eviction' }}
                label={`Generate Court-Ready Notice — ${noticeOnlyPrice}`}
                className="hero-btn-secondary inline-flex items-center gap-2"
              />
            </div>
          </div>
        </section>

        <section className="bg-white py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto rounded-2xl border border-[#E6DBFF] bg-[#FCFAFF] p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">What this page should help the landlord decide</h2>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="rounded-xl border border-[#E6DBFF] bg-white p-5">
                  <Clock3 className="w-6 h-6 text-[#692ed4] mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Which route applies now</h3>
                  <p className="text-sm text-gray-600">
                    The landlord should understand whether the immediate problem is a simpler
                    notice-only route or a broader possession file.
                  </p>
                </div>
                <div className="rounded-xl border border-[#E6DBFF] bg-white p-5">
                  <Scale className="w-6 h-6 text-[#692ed4] mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Which jurisdiction controls the wording</h3>
                  <p className="text-sm text-gray-600">
                    England, Wales, and Scotland are not interchangeable. The page should make
                    that unmistakably clear.
                  </p>
                </div>
                <div className="rounded-xl border border-[#E6DBFF] bg-white p-5">
                  <Gavel className="w-6 h-6 text-[#692ed4] mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">What happens after service</h3>
                  <p className="text-sm text-gray-600">
                    A good notice page should also help the user understand how the notice fits
                    into the wider court or tribunal pathway.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <FAQSection
          faqs={evictionNoticeTemplateFAQs}
          title="Eviction Notice Template FAQ"
          showContactCTA={false}
          variant="gray"
        />

        <section id="final-cta" className="bg-[#F3EEFF] py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto bg-gradient-to-br from-primary to-primary/90 rounded-3xl p-8 lg:p-12 text-white text-center">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Generate your jurisdiction-specific notice bundle
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Preview every watermarked document before you pay, then complete your bundle
                with a one-time payment and cleaner jurisdiction-first notice logic.
              </p>
              <IntentProductCTA
                intent={{ product: 'notice_only', src: 'seo_eviction_notice_template', topic: 'eviction' }}
                label={`Generate Court-Ready Notice — ${noticeOnlyPrice}`}
                className="hero-btn-secondary inline-flex items-center justify-center gap-2"
              />
              <p className="mt-8 text-white/70 text-sm">
                Preview before paying (watermarked) • Compliance checks • Jurisdiction-specific formatting
              </p>
            </div>
          </div>
        </section>

        <section className="bg-[#F3EEFF] py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <RelatedLinks
                title="Related Resources"
                links={[
                  productLinks.noticeOnly,
                  productLinks.completePack,
                  toolLinks.section21Generator,
                  toolLinks.section8Generator,
                  blogLinks.section21VsSection8,
                  blogLinks.evictionTimeline,
                ]}
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
