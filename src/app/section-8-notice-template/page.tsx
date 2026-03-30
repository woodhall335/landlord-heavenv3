import type { Metadata } from 'next';
import Link from 'next/link';
import {
  CheckCircle,
  FileText,
  Shield,
  Clock,
  ArrowRight,
  Download,
  AlertTriangle,
  X,
  Gavel,
  Scale,
  PoundSterling,
  Home,
  Ban,
  Mail,
  CalendarClock,
  ListChecks,
} from 'lucide-react';
import {
  StructuredData,
  breadcrumbSchema,
  articleSchema,
  faqPageSchema,
} from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';
import { PRODUCT_PRICE_AMOUNT_STRINGS, PRODUCTS } from '@/lib/pricing/products';
import { SocialProofCounter } from '@/components/ui/SocialProofCounter';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import {
  productLinks,
  toolLinks,
  blogLinks,
  landingPageLinks,
} from '@/lib/seo/internal-links';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { FAQSection } from '@/components/seo/FAQSection';
import { section8NoticeTemplateFAQs } from '@/data/faqs';
import { FunnelCta, CrossSellBar } from '@/components/funnels';
import { SeoLandingWrapper } from '@/components/seo/SeoLandingWrapper';
import { SeoPageContextPanel } from '@/components/seo/SeoPageContextPanel';

const canonicalUrl = getCanonicalUrl('/section-8-notice-template');

const completePackPrice = PRODUCTS.complete_pack.displayPrice;
const noticeOnlyPrice = PRODUCTS.notice_only.displayPrice;

const completePackProductHref = '/products/complete-pack';
const noticeOnlyProductHref = '/products/notice-only';

export { UNIVERSAL_HERO_VIEWPORT as viewport } from '@/lib/seo/hero-theme';

export const metadata: Metadata = {
  title: 'Section 8 Notice Template | Form 3 Guide for Landlords in England',
  description:
    'Section 8 notice template and Form 3 landlord guide for England.',
  keywords: [
    'section 8 notice',
    'section 8 notice template',
    'form 3',
    'section 8 eviction notice',
    'section 8 notice form',
    'ground 8',
    'ground 10',
    'ground 11',
    'grounds for possession',
    'notice seeking possession',
    'rent arrears eviction',
    'housing act 1988',
    'eviction for antisocial behaviour',
    'landlord eviction grounds',
    'what should a section 8 notice include',
    'how to serve section 8 notice',
  ],
  alternates: {
    canonical: canonicalUrl,
  },
  openGraph: {
    title: 'Section 8 Notice Template | Form 3 Guide for Landlords in England',
    description:
      'Learn how Section 8 Form 3 works, what a valid notice should include, and when to use a court-ready Notice Only workflow.',
    type: 'article',
    url: canonicalUrl,
    siteName: 'Landlord Heaven',
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Section 8 Notice Template | Form 3 Guide for Landlords in England',
    description:
      'Form 3 guidance, common grounds, notice content, service rules, and court-ready Section 8 workflow.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function Section8NoticeTemplatePage() {
  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Section 8 Notice Template',
    description:
      'Section 8 notice template and Form 3 guidance for England grounds-based possession.',
    url: canonicalUrl,
    mainEntity: {
      '@type': 'Product',
      name: 'Section 8 Notice Template',
      description:
        'Court-ready Section 8 Form 3 workflow for England landlords.',
      offers: {
        '@type': 'AggregateOffer',
        lowPrice: '0',
        highPrice: PRODUCT_PRICE_AMOUNT_STRINGS.complete_pack,
        priceCurrency: 'GBP',
        offerCount: '2',
      },
    },
  };

  const enhancedFaqs = [
    ...section8NoticeTemplateFAQs,
    {
      question: 'What is the biggest reason landlords get delayed?',
      answer:
        'One of the biggest delay drivers is poor evidence and date inconsistency. Landlords often know why they want possession, but the court still expects clean grounds, a clear chronology, and proper proof of service.',
    },
    {
      question: 'Should I keep copies of every letter and attachment?',
      answer:
        'Yes. Keep every version sent, all enclosures, and proof of service. Documentary quality matters in Section 8 cases because the route is grounds-based and evidence-heavy.',
    },
    {
      question: 'When should I move from template stage to a paid workflow?',
      answer:
        'Usually as soon as the matter may escalate to court, involve disputed arrears, or depend on multiple grounds. A guided workflow reduces the risk of incorrect dates, weak ground selection, and duplicated costs later.',
    },
    {
      question: 'What should a Section 8 notice include?',
      answer:
        'A Section 8 notice usually needs correct party names, property address, the correct Form 3 route, the grounds relied on, the factual basis for those grounds, the correct notice period, correct dates, and a reliable service method. Errors in grounds or dates can weaken the case.',
    },
    {
      question: 'Is a free Section 8 template enough?',
      answer:
        'A free template may help a landlord understand the form, but it is not always enough for a live case. The stronger need is usually not just the form itself, but selecting the right grounds, getting the dates right, and serving it properly.',
    },
  ];

  return (
    <>
      <SeoLandingWrapper
        pagePath="/section-8-notice-template"
        pageTitle={metadata.title as string}
        pageType="notice"
        jurisdiction="england"
      />

      <StructuredData data={pageSchema} />
      <StructuredData
        data={articleSchema({
          headline: 'Section 8 Notice Template',
          description: metadata.description as string,
          url: canonicalUrl,
          datePublished: '2026-03-01',
          dateModified: '2026-03-20',
        })}
      />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: getCanonicalUrl('/') },
          { name: 'Templates', url: getCanonicalUrl('/eviction-notice-template') },
          { name: 'Section 8 Notice Template', url: canonicalUrl },
        ])}
      />

      <HeaderConfig mode="autoOnScroll" />

      <main className="min-h-screen bg-[#fcfaff]">
        <UniversalHero
          title="Section 8 Notice Template"
          subtitle="Learn how Section 8 Form 3 works, what a valid grounds-based notice should include, and when to use a court-ready Notice Only workflow instead of relying on a generic template."
          primaryCta={{ label: `Start Notice Only â€” ${noticeOnlyPrice}`, href: noticeOnlyProductHref }}
          secondaryCta={{ label: `Complete eviction path â€” ${completePackPrice}`, href: completePackProductHref }}
          showTrustPositioningBar
          hideMedia
          variant="pastel"
        />

        <section className="border-b border-[#E6DBFF] bg-white py-8">
          <div className="container mx-auto px-4">
            <div className="mx-auto mb-6 max-w-5xl">
              <SeoPageContextPanel pathname="/section-8-notice-template" />
            </div>
            <nav
              aria-labelledby="section-8-links-heading"
              className="mx-auto max-w-5xl rounded-2xl border border-[#E6DBFF] bg-white p-6"
            >
              <h2 id="section-8-links-heading" className="text-2xl font-semibold text-[#2a2161]">
                On This Page
              </h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <a href="#quick-answer" className="rounded-lg border border-[#E6DBFF] px-4 py-3 text-primary hover:bg-[#F8F4FF]">Quick answer</a>
                <a href="#what-is-section-8" className="rounded-lg border border-[#E6DBFF] px-4 py-3 text-primary hover:bg-[#F8F4FF]">What Section 8 is</a>
                <a href="#what-a-valid-section-8-should-include" className="rounded-lg border border-[#E6DBFF] px-4 py-3 text-primary hover:bg-[#F8F4FF]">What a valid notice should include</a>
                <a href="#common-grounds" className="rounded-lg border border-[#E6DBFF] px-4 py-3 text-primary hover:bg-[#F8F4FF]">Common grounds</a>
                <a href="#how-service-works" className="rounded-lg border border-[#E6DBFF] px-4 py-3 text-primary hover:bg-[#F8F4FF]">How service works</a>
                <a href="#section-8-vs-section-21" className="rounded-lg border border-[#E6DBFF] px-4 py-3 text-primary hover:bg-[#F8F4FF]">Section 8 vs Section 21</a>
                <a href="#timeline-costs-evidence" className="rounded-lg border border-[#E6DBFF] px-4 py-3 text-primary hover:bg-[#F8F4FF]">Timeline, costs, evidence</a>
                <a href="#notice-only-vs-complete-pack" className="rounded-lg border border-[#E6DBFF] px-4 py-3 text-primary hover:bg-[#F8F4FF]">Notice Only vs Complete Pack</a>
                <a href="#final-cta" className="rounded-lg border border-[#E6DBFF] px-4 py-3 text-primary hover:bg-[#F8F4FF]">Next steps</a>
              </div>
            </nav>
          </div>
        </section>

        <section id="quick-answer" className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto rounded-2xl border border-[#E6DBFF] bg-[#FCFAFF] p-6 md:p-8">
              <h2 className="text-3xl font-bold text-gray-900">Quick answer</h2>
              <div className="mt-6 space-y-5 text-gray-700">
                <p className="leading-7">
                  A Section 8 notice is the England grounds-based possession route used where
                  the landlord relies on a specific legal reason for possession, such as rent
                  arrears, breach of tenancy, or antisocial behaviour. It is not a generic
                  eviction letter. It is a statutory notice process built around Form 3 and
                  specific grounds under the Housing Act 1988.
                </p>
                <p className="leading-7">
                  That means a Section 8 notice is only as strong as the route logic behind it.
                  The landlord needs the right grounds, the right factual basis, the right dates,
                  and the right evidence. A template by itself may show the form layout, but it
                  does not solve the harder problem of selecting and structuring the notice
                  properly for a live case.
                </p>
                <p className="leading-7">
                  For that reason, the strongest commercial push on this page should not be
                  â€œdownload a free form and hope for the best.â€ It should be â€œuse the Notice Only
                  workflow if you want the correct Section 8 notice built around your facts before
                  service.â€
                </p>
              </div>

              <div className="mt-8 rounded-xl border border-[#E6DBFF] bg-white p-5">
                <h3 className="text-lg font-semibold text-[#2a2161]">Best fit for most live cases</h3>
                <p className="mt-2 text-gray-700 leading-7">
                  If your Section 8 notice is for a real possession case rather than background
                  reading, the safer route is usually{' '}
                  <Link href="/products/notice-only" className="font-semibold text-primary hover:underline">
                    /products/notice-only
                  </Link>
                  . It helps you build the correct notice and route logic before service.
                </p>
                <div className="mt-4">
                  <Link
                    href="/products/notice-only"
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-white hover:opacity-95"
                  >
                    Start Notice Only â€” {noticeOnlyPrice}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-8 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <FunnelCta
                title="Prepare your Section 8 notice bundle"
                subtitle="Use Notice Only for compliant Form 3 drafting, or choose a full case bundle for court paperwork guidance."
                primaryHref="/products/notice-only"
                primaryText={`Start Notice Only â€” ${noticeOnlyPrice}`}
                primaryDataCta="notice-only"
                location="above-fold"
                secondaryLinks={[
                  {
                    href: '/products/complete-pack',
                    text: `Need the full case bundle? â€” ${completePackPrice}`,
                    dataCta: 'complete-pack',
                  },
                ]}
              />
            </div>
          </div>
        </section>

        <section className="py-6 bg-gray-50 border-y border-gray-100">
          <div className="container mx-auto px-4">
            <SocialProofCounter variant="total" className="justify-center" />
          </div>
        </section>

        <section className="py-6 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <CrossSellBar context="eviction" location="mid" />
            </div>
          </div>
        </section>

        <section id="what-is-section-8" className="py-16 lg:py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto rounded-2xl border border-[#E6DBFF] bg-[#FCFAFF] p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">What Section 8 actually is</h2>
              <div className="space-y-5 text-gray-700">
                <p className="leading-7">
                  Section 8 is the possession route landlords in England use when they rely on
                  one or more statutory grounds. Unlike a no-fault route, Section 8 is built
                  around allegations or facts the landlord must be able to explain and usually
                  prove. That is why it is more evidence-sensitive than a generic notice page
                  might suggest.
                </p>
                <p className="leading-7">
                  In practical terms, landlords use Section 8 where the case turns on something
                  concrete: rent arrears, repeated late payment, tenancy breaches, nuisance, or
                  other conduct that maps onto a recognised ground. The notice is served on Form 3
                  and must state which grounds are being used and why.
                </p>
                <p className="leading-7">
                  This is also why many weak template pages underperform. They talk about Form 3
                  as though the form is the whole job. It is not. The form is the output. The
                  harder work is choosing the correct grounds, linking those grounds to facts,
                  checking the dates, and preparing for the court route that may follow.
                </p>
              </div>

              <div className="mt-8 rounded-xl border border-green-200 bg-green-50 p-5">
                <p className="text-green-900 leading-7">
                  If your main need is to get the Section 8 notice itself right before service,
                  <Link href="/products/notice-only" className="ml-1 font-semibold text-primary hover:underline">
                    Notice Only
                  </Link>{' '}
                  is usually the most natural product fit on this page.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="what-a-valid-section-8-should-include" className="py-16 lg:py-20 bg-[#F3EEFF]">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto rounded-2xl border border-[#E6DBFF] bg-white p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">What a valid Section 8 notice should usually include</h2>
              <p className="text-gray-700 leading-7 mb-8">
                This is the educational core many landlords actually need. A Section 8 notice is
                not just â€œForm 3 filled in.â€ A stronger notice usually includes the correct party
                details, the correct property details, the correct grounds, the correct dates, and
                the correct service logic. If any of those are wrong, the case can become weaker
                before court even starts.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="rounded-xl border border-[#E6DBFF] bg-[#FCFAFF] p-6">
                  <h3 className="font-semibold text-[#2a2161] text-lg">Core content</h3>
                  <ul className="mt-4 space-y-3 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-0.5 text-primary" />
                      Correct landlord and tenant names
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-0.5 text-primary" />
                      Full property address
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-0.5 text-primary" />
                      Correct Form 3 route
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-0.5 text-primary" />
                      All relevant grounds clearly listed
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-0.5 text-primary" />
                      Ground facts linked to the tenantâ€™s conduct or arrears position
                    </li>
                  </ul>
                </div>

                <div className="rounded-xl border border-[#E6DBFF] bg-[#FCFAFF] p-6">
                  <h3 className="font-semibold text-[#2a2161] text-lg">Dates and service</h3>
                  <ul className="mt-4 space-y-3 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-0.5 text-primary" />
                      Correct notice period for the ground or grounds used
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-0.5 text-primary" />
                      Correct service date
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-0.5 text-primary" />
                      Correct expiry logic
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-0.5 text-primary" />
                      Reliable service method
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-0.5 text-primary" />
                      Proof of service kept from the start
                    </li>
                  </ul>
                </div>
              </div>

              <p className="mt-8 text-gray-700 leading-7">
                This is exactly where a generic free form stops being enough. The stronger need
                is not just the form shell. It is the route logic around the form. That is why
                landlords with live cases usually move from template-reading into{' '}
                <Link href="/products/notice-only" className="font-semibold text-primary hover:underline">
                  Notice Only
                </Link>{' '}
                once they need a court-ready Section 8 notice rather than an educational sample.
              </p>

              <div className="mt-6">
                <Link
                  href="/products/notice-only"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-white hover:opacity-95"
                >
                  Build Section 8 with Notice Only â€” {noticeOnlyPrice}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section id="common-grounds" className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Common Section 8 eviction grounds
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Section 8 contains multiple grounds for possession. In live landlord work, the
                challenge is usually not finding a list, but choosing the right grounds and using
                them coherently.
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <Gavel className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Mandatory grounds</h3>
                      <span className="text-sm text-gray-500">Court must grant possession if the ground is proved</span>
                    </div>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <PoundSterling className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium text-gray-900">Ground 8</span>
                        <p className="text-sm text-gray-600">2+ months rent arrears threshold route</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <Home className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium text-gray-900">Ground 1</span>
                        <p className="text-sm text-gray-600">Landlord occupation circumstances route</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <Ban className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium text-gray-900">Ground 7A</span>
                        <p className="text-sm text-gray-600">Serious antisocial behaviour route</p>
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                      <Scale className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Discretionary grounds</h3>
                      <span className="text-sm text-gray-500">Court may grant possession if reasonable</span>
                    </div>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <PoundSterling className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium text-gray-900">Ground 10 &amp; 11</span>
                        <p className="text-sm text-gray-600">Arrears and repeated late payment</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <FileText className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium text-gray-900">Ground 12</span>
                        <p className="text-sm text-gray-600">Breach of tenancy agreement</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium text-gray-900">Ground 14</span>
                        <p className="text-sm text-gray-600">Nuisance or antisocial behaviour</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-8 bg-primary/5 rounded-xl p-6 border border-primary/20">
                <div className="flex items-start gap-4">
                  <Shield className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Why landlords often combine grounds</h4>
                    <p className="text-gray-600 text-sm">
                      Ground selection is strategic, not just technical. In arrears cases, landlords
                      often use both mandatory and discretionary arrears grounds together so the case
                      has more resilience if the numbers change before hearing. This is another reason
                      live cases often belong on{' '}
                      <Link href="/products/notice-only" className="font-semibold text-primary hover:underline">
                        Notice Only
                      </Link>{' '}
                      rather than a self-edited template.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="how-service-works" className="py-16 lg:py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto rounded-2xl border border-[#E6DBFF] bg-[#FCFAFF] p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">How service works in practice</h2>
              <p className="text-gray-700 leading-7 mb-8">
                Serving the Section 8 notice properly matters almost as much as drafting it properly.
                Many landlords focus on the grounds and forget that service mistakes can cause
                exactly the same kind of delay as drafting mistakes.
              </p>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="rounded-xl border border-[#E6DBFF] bg-white p-5">
                  <Mail className="w-6 h-6 text-primary mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Use a reliable method</h3>
                  <p className="text-sm text-gray-600">
                    The service method should fit the tenancy documents and the route being used.
                  </p>
                </div>
                <div className="rounded-xl border border-[#E6DBFF] bg-white p-5">
                  <CalendarClock className="w-6 h-6 text-primary mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Get the dates right</h3>
                  <p className="text-sm text-gray-600">
                    Service date and notice period errors are common and can undermine the route.
                  </p>
                </div>
                <div className="rounded-xl border border-[#E6DBFF] bg-white p-5">
                  <ListChecks className="w-6 h-6 text-primary mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Keep proof from day one</h3>
                  <p className="text-sm text-gray-600">
                    Retain proof of service rather than trying to rebuild it later for court.
                  </p>
                </div>
              </div>

              <div className="mt-8 rounded-xl border border-green-200 bg-green-50 p-5">
                <p className="text-green-900 leading-7">
                  This is another strong reason to use{' '}
                  <Link href="/products/notice-only" className="font-semibold text-primary hover:underline">
                    Notice Only
                  </Link>
                  . The value is not just the completed Form 3. It is the cleaner notice-and-service
                  workflow around it.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="timeline-costs-evidence" className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Section 8 timeline, costs &amp; evidence checklist
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Section 8 is grounds-based, so evidence quality and route discipline matter as much
                as the notice itself.
              </p>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Notice period</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>Shorter notice periods can apply for some arrears or conduct-based cases.</li>
                    <li>Other grounds can run longer depending on the route used.</li>
                    <li>Dates must match the actual grounds selected.</li>
                    <li>Typical possession timelines often extend well beyond notice expiry.</li>
                  </ul>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Evidence to prepare</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>Rent schedule and arrears calculation.</li>
                    <li>Tenancy agreement and any breach evidence.</li>
                    <li>Communication history with the tenant.</li>
                    <li>Photos, reports, statements, or logs where relevant.</li>
                  </ul>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Common mistakes</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>Choosing weak or mismatched grounds.</li>
                    <li>Missing evidence at hearing stage.</li>
                    <li>Incorrect service method or dates.</li>
                    <li>Failing to link grounds to specific facts.</li>
                  </ul>
                  <Link
                    href="/how-to-evict-tenant"
                    className="text-primary text-sm font-medium hover:underline inline-flex mt-3"
                  >
                    See the full eviction process â†’
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="section-8-vs-section-21" className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Section 8 vs Section 21: which should you use?
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                The key difference is that Section 8 is grounds-based. That usually makes it more
                evidence-heavy, but also more flexible in certain live possession and arrears cases.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full bg-white rounded-xl border border-gray-200 shadow-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left p-4 font-semibold text-gray-900">Feature</th>
                      <th className="text-center p-4 font-semibold text-gray-900">Section 8</th>
                      <th className="text-center p-4 font-semibold text-gray-900">Section 21</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="p-4 text-gray-700">Reason required?</td>
                      <td className="p-4 text-center text-gray-700">Yes â€” grounds must be stated</td>
                      <td className="p-4 text-center text-gray-700">No-fault logic where available</td>
                    </tr>
                    <tr>
                      <td className="p-4 text-gray-700">Evidence focus</td>
                      <td className="p-4 text-center text-gray-700">Ground facts and proof</td>
                      <td className="p-4 text-center text-gray-700">Compliance and procedure</td>
                    </tr>
                    <tr>
                      <td className="p-4 text-gray-700">Works after May 2026?</td>
                      <td className="p-4 text-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                      </td>
                      <td className="p-4 text-center">
                        <X className="w-5 h-5 text-red-500 mx-auto" />
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 text-gray-700">Court hearing required?</td>
                      <td className="p-4 text-center text-gray-700">Usually yes</td>
                      <td className="p-4 text-center text-gray-700">Often cleaner route where valid</td>
                    </tr>
                    <tr>
                      <td className="p-4 text-gray-700">Best for</td>
                      <td className="p-4 text-center text-gray-700">Arrears, breach, conduct cases</td>
                      <td className="p-4 text-center text-gray-700">No-fault possession logic</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-8 text-center">
                <p className="text-gray-600 mb-4">
                  If your case is clearly grounds-based, the strongest commercial route on this page
                  is usually{' '}
                  <Link href="/products/notice-only" className="font-semibold text-primary hover:underline">
                    Notice Only
                  </Link>
                  , not a bare template.
                </p>
                <Link
                  href={noticeOnlyProductHref}
                  className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
                >
                  Build your Section 8 notice now
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section id="notice-only-vs-complete-pack" className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Notice Only vs Complete Pack
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Most users landing on a Section 8 template page are still trying to get the notice
                stage right. That usually makes Notice Only the better first fit.
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-primary/5 rounded-2xl p-8 border-2 border-primary relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
                      Best fit for this page
                    </span>
                  </div>
                  <div className="text-center mb-6">
                    <span className="text-sm font-medium text-primary uppercase tracking-wide">Notice Only</span>
                    <div className="text-4xl font-bold text-gray-900 mt-2">{noticeOnlyPrice}</div>
                  </div>
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 font-medium">Best when you mainly need the correct Section 8 notice</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 font-medium">Stronger fit for service-stage workflow</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 font-medium">Better for landlords still finalising grounds and dates</span>
                    </li>
                  </ul>
                  <Link
                    href={noticeOnlyProductHref}
                    className="hero-btn-primary block w-full text-center"
                  >
                    Start Notice Only
                  </Link>
                </div>

                <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
                  <div className="text-center mb-6">
                    <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Complete Pack</span>
                    <div className="text-4xl font-bold text-gray-900 mt-2">{completePackPrice}</div>
                  </div>
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">Better where the case is already moving toward court</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">Useful where the wider case bundle matters now</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">Stronger fit for broader possession-stage paperwork</span>
                    </li>
                  </ul>
                  <Link
                    href={completePackProductHref}
                    className="hero-btn-secondary block w-full text-center"
                  >
                    Get Complete Pack
                  </Link>
                </div>
              </div>

              <div className="mt-8 text-center text-gray-600">
                Free starter reading still has value, but most live landlord cases belong on{' '}
                <Link href="/products/notice-only" className="text-primary font-medium hover:underline">
                  Notice Only
                </Link>
                .
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                How to get your Section 8 notice
              </h2>
              <p className="text-gray-600 text-center mb-12">
                Generate your notice in a cleaner sequence rather than editing Form 3 manually.
              </p>

              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl font-bold text-primary">1</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Describe situation</h3>
                  <p className="text-gray-600 text-sm">
                    Explain the arrears, breach, or conduct problem.
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl font-bold text-primary">2</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Select the right grounds</h3>
                  <p className="text-gray-600 text-sm">
                    Build the notice around the strongest ground logic.
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl font-bold text-primary">3</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Check dates and evidence</h3>
                  <p className="text-gray-600 text-sm">
                    Make sure the notice period and case file line up.
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl font-bold text-primary">4</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Download and serve</h3>
                  <p className="text-gray-600 text-sm">
                    Use the notice with cleaner service-stage workflow.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 bg-green-600 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-2xl lg:text-3xl font-bold mb-4">
                Section 8 remains the key grounds-based route
              </h2>
              <p className="text-white/90 mb-6 max-w-2xl mx-auto">
                As no-fault possession falls away, Section 8 understanding becomes even more
                important for England landlords. That makes getting the notice stage right even more valuable.
              </p>
              <Link
                href={noticeOnlyProductHref}
                className="hero-btn-secondary inline-flex items-center gap-2"
              >
                Build your Section 8 notice now
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        <section className="py-10 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <FunnelCta
                title="Ready to move this forward?"
                subtitle="Serve the right Section 8 notice now and keep your court options open."
                primaryHref="/products/notice-only"
                primaryText={`Create Section 8 notice â€” ${noticeOnlyPrice}`}
                primaryDataCta="notice-only"
                location="bottom"
                secondaryLinks={[
                  {
                    href: '/products/complete-pack',
                    text: `Need the full case bundle? â€” ${completePackPrice}`,
                    dataCta: 'complete-pack',
                  },
                ]}
              />
            </div>
          </div>
        </section>

        <section className="py-10 bg-white" id="snippet-opportunities">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto prose prose-slate max-w-none">
              <h2>What Is a Section 8 Notice?</h2>
              <p>
                A Section 8 notice is a possession notice used in England when a landlord relies on
                specific legal grounds, such as rent arrears or breach of tenancy terms. It is
                served on Form 3 and must state the grounds and notice period clearly to support
                later court action.
              </p>

              <h2>Section 8 Notice Rent Arrears</h2>
              <p>
                For rent arrears, landlords commonly use Grounds 8, 10, and 11 on a Section 8
                notice. Ground 8 is usually the most commercially important arrears ground because
                it is treated as mandatory if the threshold is met, while Grounds 10 and 11 can
                support the case where the court still needs to decide reasonableness.
              </p>

              <h2>Section 8 Form 3 Template</h2>
              <p>
                A Section 8 Form 3 template should include accurate party details, the property
                address, selected grounds, supporting facts, and the correct notice period. Errors
                in ground selection, dates, or service logic can undermine possession claims.
              </p>

              <h2>Grounds for Eviction</h2>
              <p>
                Grounds for eviction under Section 8 are legal reasons listed in Schedule 2 of the
                Housing Act 1988. Some grounds are mandatory and some discretionary. The landlord
                must usually support the ground relied upon with tenancy documents, arrears
                schedules, communication history, and service evidence.
              </p>

              <h2>Section 8 vs Section 21</h2>
              <p>
                Section 8 is grounds-based and depends on proving specific statutory grounds, while
                Section 21 has been used as a no-fault route where available. Section 8 usually
                involves more evidence work, which is why many live landlord cases are better
                handled through a guided notice workflow rather than a template alone.
              </p>

              <h3>How to Serve a Section 8 Notice</h3>
              <ol>
                <li>Confirm the tenancy type and current facts.</li>
                <li>Select the correct statutory grounds on Form 3.</li>
                <li>Set the notice period required for the grounds used.</li>
                <li>Serve the notice by a permitted method.</li>
                <li>Retain proof of service and supporting evidence notes.</li>
              </ol>

              <h3>Section 8 vs Section 21 Comparison</h3>
              <table>
                <thead>
                  <tr><th>Point</th><th>Section 8</th><th>Section 21</th></tr>
                </thead>
                <tbody>
                  <tr><td>Basis</td><td>Grounds-based</td><td>No-fault route</td></tr>
                  <tr><td>Form</td><td>Form 3</td><td>Form 6A</td></tr>
                  <tr><td>Evidence focus</td><td>Proof of ground</td><td>Compliance and service validity</td></tr>
                  <tr><td>Best fit</td><td>Arrears, breach, conduct</td><td>No-fault possession logic</td></tr>
                </tbody>
              </table>

              <h3>Definition: Ground 8</h3>
              <p>
                Ground 8 is a mandatory rent arrears ground under Section 8. The arrears threshold
                usually needs to be met at both service and hearing, which is why landlords often
                combine it with discretionary arrears grounds in the same notice.
              </p>

              <h3>Definition: Form 3</h3>
              <p>
                Form 3 is the prescribed notice form used for Section 8 possession proceedings in
                England. Accurate completion matters because unclear grounds, weak facts, or
                incorrect dates can weaken the court claim.
              </p>
            </div>
          </div>
        </section>

        <section className="py-6 bg-gray-50" id="legal-framework">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto prose prose-slate max-w-none">
              <h2>Legal framework explained for landlords</h2>
              <p>
                Landlords get better outcomes when they treat Section 8 document generation as one
                part of a full legal workflow. Courts do not just look at whether the correct form
                title was used. They also look at whether the correct grounds were chosen, whether
                the facts support those grounds, whether the notice period was right, and whether
                service can be proved.
              </p>
              <p>
                That is why a guided workflow is often commercially stronger than a template-only
                approach. The landlord usually needs more than a form. They need a cleaner link
                between facts, grounds, dates, evidence, and later court position.
              </p>
            </div>
          </div>
        </section>

        <section className="py-6 bg-white" id="step-by-step">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto prose prose-slate max-w-none">
              <h2>Step-by-step landlord process</h2>
              <ol>
                <li>Identify whether the case is really grounds-based and suitable for Section 8.</li>
                <li>Check the tenancy facts, rent position, and relevant evidence.</li>
                <li>Select the strongest ground or grounds.</li>
                <li>Prepare the notice with matching dates and supporting facts.</li>
                <li>Serve correctly and preserve proof of service.</li>
                <li>Track notice expiry and prepare for the court stage if needed.</li>
              </ol>
              <p>
                For most live cases on this page, this is where{' '}
                <Link href="/products/notice-only" className="text-primary underline">
                  Notice Only
                </Link>{' '}
                becomes the better option than a self-edited template.
              </p>
            </div>
          </div>
        </section>

        <section className="py-6 bg-gray-50" id="mistakes">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto prose prose-slate max-w-none">
              <h2>Common mistakes that cause rejection or delay</h2>
              <ul>
                <li>Using a generic draft without checking the actual grounds fit the facts.</li>
                <li>Choosing weak or inconsistent grounds.</li>
                <li>Date errors or incorrect notice period logic.</li>
                <li>Weak service evidence or unclear service method.</li>
                <li>Assuming the form alone is enough without a proper evidence file.</li>
                <li>Failing to reconcile arrears figures to actual records.</li>
              </ul>
              <p>
                Most of these errors are exactly why landlords move from reading about Section 8
                into a guided notice product.
              </p>
            </div>
          </div>
        </section>

        <section className="py-6 bg-white" id="evidence-checklist">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto prose prose-slate max-w-none">
              <h2>Evidence checklist before you escalate</h2>
              <ul>
                <li>Signed tenancy agreement and any renewals or variations.</li>
                <li>Rent schedule or ledger showing due dates, payments, and balance.</li>
                <li>Copies of reminder letters and tenant responses.</li>
                <li>Proof of service for formal documents.</li>
                <li>Photos, reports, statements, or logs where relevant to the grounds.</li>
                <li>Chronology document mapping each event to supporting evidence.</li>
              </ul>
              <p className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                Need a faster route from guidance to action? Use our{' '}
                <Link href="/products/notice-only" className="text-primary underline">
                  Notice Only workflow
                </Link>{' '}
                to generate a compliance-checked Section 8 notice and keep the service-stage file aligned.
              </p>
            </div>
          </div>
        </section>

        <section className="py-6 bg-gray-50" id="timeline-breakdown">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto prose prose-slate max-w-none">
              <h2>Timeline breakdown</h2>
              <p>
                The Section 8 route usually has three practical stages: diagnosis, notice, and
                court progression. The notice stage is not usually where landlords want to save
                time by cutting corners, because mistakes here often create longer delays later.
              </p>
              <p>
                If your case is live, a one-day pause to correct grounds, dates, or service
                assumptions is usually better than weeks of delay caused by a weak notice.
              </p>
            </div>
          </div>
        </section>

        <section className="py-6 bg-white" id="comparison-table">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Strategy comparison table</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-200 p-3 text-left">Route</th>
                      <th className="border border-gray-200 p-3 text-left">Best for</th>
                      <th className="border border-gray-200 p-3 text-left">Main risk</th>
                      <th className="border border-gray-200 p-3 text-left">Evidence priority</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-200 p-3">Template-only self service</td>
                      <td className="border border-gray-200 p-3">Low-risk learning and early research</td>
                      <td className="border border-gray-200 p-3">Ground/date/service mistakes</td>
                      <td className="border border-gray-200 p-3">Proof of ground + service</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-200 p-3">Notice Only workflow</td>
                      <td className="border border-gray-200 p-3">Most live Section 8 notice cases</td>
                      <td className="border border-gray-200 p-3">Incomplete source facts</td>
                      <td className="border border-gray-200 p-3">Validation + service-stage file</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 p-3">Complete Pack</td>
                      <td className="border border-gray-200 p-3">Cases already moving toward court</td>
                      <td className="border border-gray-200 p-3">Weak wider bundle preparation</td>
                      <td className="border border-gray-200 p-3">Full court-ready documentary bundle</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        <section className="py-6 bg-gray-50" id="practical-scenarios">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto prose prose-slate max-w-none">
              <h2>Practical landlord scenarios and decision rules</h2>
              <p>
                Section 8 cases are rarely perfect. Rent may have been paid in part, behaviour
                evidence may be incomplete, or the landlord may need possession and arrears
                recovery at the same time. That is why the strongest decision is usually the one
                that preserves options instead of forcing a weak single-ground strategy too early.
              </p>
              <p>
                In rent arrears cases, the commercial question is often not â€œCan I use Section 8?â€
                but â€œWhich grounds make the notice more resilient if the arrears move before hearing?â€
                In breach cases, the question is often whether the breach is clear enough to justify
                the route and whether the evidence file is strong enough to support it.
              </p>
              <p>
                In those scenarios, the safer move is usually to stop editing templates manually and
                use{' '}
                <Link href="/products/notice-only" className="text-primary underline">
                  Notice Only
                </Link>{' '}
                once the matter becomes real.
              </p>
            </div>
          </div>
        </section>

        <section className="py-6 bg-white" id="advanced-checklist">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto prose prose-slate max-w-none">
              <h2>Advanced pre-court checklist for landlords</h2>
              <ul>
                <li>Identity and party details checked against the signed tenancy.</li>
                <li>Property address used consistently across all documents.</li>
                <li>Grounds selected and matched to clear supporting facts.</li>
                <li>Arrears schedule reconciled line by line where relevant.</li>
                <li>Notice period and service dates checked carefully.</li>
                <li>Proof of service retained in usable form.</li>
                <li>Communication record preserved.</li>
                <li>Escalation note prepared for why court action is justified.</li>
              </ul>
              <p>
                If several items on this list are incomplete, that is usually a sign the case now
                belongs on a guided workflow rather than a template-only path.
              </p>
            </div>
          </div>
        </section>

        <FAQSection
          faqs={enhancedFaqs}
          title="Section 8 Notice Template FAQ"
          showContactCTA={false}
          variant="white"
        />

        <section id="final-cta" className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto bg-gradient-to-br from-primary to-primary/90 rounded-3xl p-8 lg:p-12 text-white text-center">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Build your Section 8 notice properly
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                If your case is live, the strongest next step is usually not a bare template.
                It is a cleaner Notice Only workflow built around grounds, dates, and service.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href={noticeOnlyProductHref}
                  className="hero-btn-secondary inline-flex items-center justify-center gap-2"
                >
                  <FileText className="w-5 h-5" />
                  Notice Only â€” {noticeOnlyPrice}
                </Link>
                <Link
                  href={completePackProductHref}
                  className="hero-btn-secondary inline-flex items-center justify-center gap-2"
                >
                  Complete Pack â€” {completePackPrice}
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
              <p className="mt-8 text-white/70 text-sm">
                Grounds-based route â€¢ Cleaner service workflow â€¢ Better fit than a generic template for live cases
              </p>
            </div>
          </div>
        </section>

        <section className="py-8 bg-blue-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-4">
                <span className="text-4xl">âœ…</span>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">
                    Already have a Section 8 notice?
                  </p>
                  <p className="text-gray-600">
                    Use our{' '}
                    <Link href="/eviction-notice-template" className="text-primary font-medium hover:underline">
                      eviction notice pack
                    </Link>{' '}
                    to review your ground selection and notice logic before service or court escalation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-8 bg-purple-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-4">
                <span className="text-4xl">â˜ï¸</span>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">
                    Not sure which eviction ground applies?
                  </p>
                  <p className="text-gray-600">
                    Our free{' '}
                    <Link href="/ask-heaven" className="text-primary font-medium hover:underline">
                      Ask Heaven landlord Q&amp;A tool
                    </Link>{' '}
                    can help you understand rent arrears, antisocial behaviour, breach, and other
                    Section 8 scenarios before you choose your route.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <RelatedLinks
                title="Related Resources"
                links={[
                  productLinks.noticeOnly,
                  productLinks.completePack,
                  landingPageLinks.section21Template,
                  toolLinks.section8Validator,
                  toolLinks.section8Generator,
                  blogLinks.section21VsSection8,
                  blogLinks.rentArrearsEviction,
                  landingPageLinks.evictionTemplate,
                ]}
              />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

