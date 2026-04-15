import type { Metadata } from 'next';
import Link from 'next/link';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { FAQSection } from '@/components/seo/FAQSection';
import { NextLegalSteps } from '@/components/seo/NextLegalSteps';
import { SeoPageContextPanel } from '@/components/seo/SeoPageContextPanel';
import { getCanonicalUrl } from '@/lib/seo/urls';
import {
  StructuredData,
  breadcrumbSchema,
  articleSchema,
} from '@/lib/seo/structured-data';
import { buildAskHeavenLink } from '@/lib/ask-heaven/buildAskHeavenLink';
import { productLinks, guideLinks } from '@/lib/seo/internal-links';
import { howToEvictTenantFAQs } from '@/data/faqs';
import { PRODUCTS } from '@/lib/pricing/products';
import {
  AlertTriangle,
  Clock,
  FileText,
  MapPin,
  Scale,
  Shield,
  XCircle,
} from 'lucide-react';

const canonicalUrl = getCanonicalUrl('/how-to-evict-tenant');

const primaryProductHref = '/renters-rights-act-eviction-rules';

const noticeOnlyPrice = PRODUCTS.notice_only.displayPrice;
const completePackPrice = PRODUCTS.complete_pack.displayPrice;

const complianceLinks = {
  deposit: buildAskHeavenLink({
    source: 'page_cta',
    topic: 'deposit',
    prompt: 'What are the deposit protection rules for eviction?',
    utm_campaign: 'how-to-evict-tenant',
  }),
  gasSafety: buildAskHeavenLink({
    source: 'page_cta',
    topic: 'gas_safety',
    prompt: 'Do I need a gas safety certificate to evict my tenant?',
    utm_campaign: 'how-to-evict-tenant',
  }),
  epc: buildAskHeavenLink({
    source: 'page_cta',
    topic: 'epc',
    prompt: 'Is an EPC required before serving eviction notice?',
    utm_campaign: 'how-to-evict-tenant',
  }),
  compliance: buildAskHeavenLink({
    source: 'page_cta',
    topic: 'eviction',
    prompt: 'What compliance documents do I need before evicting a tenant?',
    utm_campaign: 'how-to-evict-tenant',
  }),
};

export { UNIVERSAL_HERO_VIEWPORT as viewport } from '@/lib/seo/hero-theme';

export const metadata: Metadata = {
  title: 'How to Evict a Tenant | UK Landlord Guide by Jurisdiction',
  description:
    'Plain-English landlord guide to evicting a tenant in England, Wales, Scotland, or Northern Ireland, with the right route for each jurisdiction.',
  keywords: [
    'how to evict a tenant',
    'evict tenant UK',
    'landlord eviction guide',
    'eviction process UK',
    'section 21 eviction',
    'section 8 eviction',
    'wales eviction notice',
    'notice to leave scotland',
    'northern ireland notice to quit',
    'eviction notice landlord',
    'tenant eviction process',
  ],
  openGraph: {
    title: 'How to Evict a Tenant | UK Landlord Guide by Jurisdiction',
    description:
      'Follow the correct eviction route for England, Wales, Scotland, or Northern Ireland and avoid common notice and compliance mistakes.',
    type: 'article',
    url: canonicalUrl,
    siteName: 'Landlord Heaven',
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How to Evict a Tenant | UK Landlord Guide by Jurisdiction',
    description:
      'Compare eviction routes across England, Wales, Scotland, and Northern Ireland.',
  },
  alternates: {
    canonical: canonicalUrl,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function HowToEvictTenantPage() {
  return (
    <>
      <StructuredData
        data={articleSchema({
          headline: 'How to Evict a Tenant in the UK',
          description:
            'Landlord guide to eviction steps, notice routes, court or tribunal process, and compliance checks across the UK.',
          url: canonicalUrl,
        })}
      />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: getCanonicalUrl('/') },
          { name: 'How to Evict a Tenant', url: canonicalUrl },
        ])}
      />
      <main className="min-h-screen bg-gray-50">
        <HeaderConfig mode="autoOnScroll" />

        <UniversalHero
          title="How to Evict a Tenant in the UK"
          subtitle="Use this guide when you need to work out the right eviction route for your property, understand what changes by jurisdiction, and avoid the mistakes that most often slow landlords down."
          primaryCta={{ label: 'Check current England rules', href: primaryProductHref }}
          secondaryCta={{ label: 'Jump to jurisdiction guide', href: '#jurisdiction-guide' }}
          showTrustPositioningBar
          hideMedia
        >
          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-700">
            <span className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-primary" />
              Jurisdiction-specific guidance
            </span>
            <span className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Notice-first landlord workflow
            </span>
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Clear next legal steps
            </span>
          </div>
        </UniversalHero>

        <section className="border-b bg-white py-8">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-5xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Go to your jurisdiction
              </h2>
              <div className="flex flex-wrap gap-3">
                <a
                  href="#england"
                  className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium transition-colors hover:bg-primary hover:text-white"
                >
                  England
                </a>
                <a
                  href="#wales"
                  className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium transition-colors hover:bg-red-600 hover:text-white"
                >
                  Wales
                </a>
                <a
                  href="#scotland"
                  className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium transition-colors hover:bg-blue-600 hover:text-white"
                >
                  Scotland
                </a>
                <a
                  href="#northern-ireland"
                  className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium transition-colors hover:bg-green-600 hover:text-white"
                >
                  Northern Ireland
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-5xl rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-gray-900">Quick answer for landlords</h2>
              <div className="mt-6 space-y-5 text-gray-700">
                <p className="leading-7">
                  Evicting a tenant in the UK is never one universal process. The right route
                  depends first on <strong>where the property is located</strong>, then on{' '}
                  <strong>why you want possession</strong>, and then on whether you have handled
                  the compliance and notice stage properly before any court or tribunal
                  application starts.
                </p>
                <p className="leading-7">
                  The most common mistake is searching for "how to evict a tenant" and then
                  following the first article you find as if the same steps apply everywhere.
                  They do not. England, Wales, Scotland, and Northern Ireland each use
                  different tenancy frameworks, notice language, and possession routes.
                  England landlords are usually dealing with the current post-1 May 2026
                  possession framework. Wales uses occupation contracts. Scotland uses Private
                  Residential Tenancy rules and a Notice to Leave. Northern Ireland uses its
                  own notice and possession system again.
                </p>
                <p className="leading-7">
                  This page is therefore a <strong>UK comparison and routing guide</strong>,
                  not a one-size-fits-all legal article. Its purpose is to help you identify
                  the right jurisdiction, understand the broad route that may apply, check the
                  main validity points that often cause delay, and then move into the correct
                  next document or guidance page. It is not here to encourage risky shortcuts
                  or informal removals. A lawful eviction starts with the right notice
                  strategy and ends, if necessary, with the proper court or tribunal
                  enforcement route.
                </p>
                <p className="leading-7">
                  For England landlords, the main owner pages are now{' '}
                  <Link href={guideLinks.rentersRightsActEvictionRules.href} className="font-medium text-primary hover:underline">
                    Renters&apos; Rights Act Eviction Rules
                  </Link>
                  ,{' '}
                  <Link href={guideLinks.section8Notice.href} className="font-medium text-primary hover:underline">
                    Section 8 Notice
                  </Link>
                  ,{' '}
                  <Link href={guideLinks.form3aSection8.href} className="font-medium text-primary hover:underline">
                    Form 3A
                  </Link>
                  , and{' '}
                  <Link href={guideLinks.evictionProcessEngland.href} className="font-medium text-primary hover:underline">
                    Eviction Process in England
                  </Link>
                  . Use this UK page to route into that bundle, not to replace it.
                </p>
              </div>

              <div className="mt-8 rounded-2xl border border-purple-200 bg-purple-50 p-5">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">Info</span>
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">
                      Not sure which route fits your case?
                    </p>
                    <p className="text-sm text-gray-600">
                      Use our free{' '}
                      <Link
                        href={complianceLinks.compliance}
                        className="font-medium text-primary hover:underline"
                      >
                        Ask Heaven landlord Q&amp;A
                      </Link>{' '}
                      tool for help with compliance, notice choice, and document checks before you serve anything.
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  <Link
                    href={complianceLinks.deposit}
                    className="rounded-lg border border-purple-200 bg-white px-3 py-2 text-center text-xs text-gray-700 transition-colors hover:border-primary hover:text-primary"
                  >
                    Deposit rules for eviction {'->'}
                  </Link>
                  <Link
                    href={complianceLinks.gasSafety}
                    className="rounded-lg border border-purple-200 bg-white px-3 py-2 text-center text-xs text-gray-700 transition-colors hover:border-primary hover:text-primary"
                  >
                    Gas safety requirements {'->'}
                  </Link>
                  <Link
                    href={complianceLinks.epc}
                    className="rounded-lg border border-purple-200 bg-white px-3 py-2 text-center text-xs text-gray-700 transition-colors hover:border-primary hover:text-primary"
                  >
                    EPC requirements {'->'}
                  </Link>
                </div>
              </div>

              <div className="mt-8 rounded-2xl border border-purple-200 bg-purple-50 p-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Current England eviction framework
                </h3>
                <p className="mt-2 text-gray-700">
                  If the property is in England, start with the live post-1 May 2026 bundle rather than older UK-wide summaries.
                </p>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {[
                    guideLinks.rentersRightsActEvictionRules,
                    guideLinks.section8Notice,
                    guideLinks.form3aSection8,
                    guideLinks.evictionProcessEngland,
                  ].map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="rounded-xl border border-purple-200 bg-white p-4 hover:border-primary"
                    >
                      <p className="font-semibold text-gray-900">{link.title}</p>
                      <p className="mt-2 text-sm leading-6 text-gray-700">{link.description}</p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white pb-4">
          <div className="container mx-auto px-4">
            <SeoPageContextPanel
              pathname="/how-to-evict-tenant"
              className="mx-auto max-w-5xl border border-purple-200 bg-purple-50"
            />
          </div>
        </section>

        <section id="jurisdiction-guide" className="bg-white py-12 lg:py-16 border-y">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-5xl">
              <h2 className="text-3xl font-bold text-gray-900">
                How the UK eviction process works at a high level
              </h2>
              <p className="mt-4 max-w-4xl leading-7 text-gray-700">
                A useful landlord guide should explain the structure before it explains the
                detail. In most cases, the process looks broadly like this: identify the
                correct jurisdiction and tenancy type, choose the notice route that fits the
                facts, check whether your compliance and documents support that route, serve
                the notice properly, wait for the notice period to expire, and only then move
                to the correct court or tribunal stage if the tenant does not leave.
              </p>

              <div className="mt-8 grid gap-6 md:grid-cols-2">
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
                  <h3 className="mb-3 text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    What the timeline usually looks like
                  </h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>- Notice periods vary by jurisdiction and ground.</li>
                    <li>- Court or tribunal time can add weeks or months.</li>
                    <li>- Contested cases usually take longer than paper-only routes.</li>
                    <li>- Enforcement adds more time if the tenant still does not leave.</li>
                  </ul>
                </div>

                <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
                  <h3 className="mb-3 text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Problems that often invalidate the route
                  </h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>- Using the wrong notice for the jurisdiction.</li>
                    <li>- Incorrect dates, service method, or notice wording.</li>
                    <li>- Compliance failures that undermine the route.</li>
                    <li>- Missing evidence for grounds-based possession.</li>
                  </ul>
                </div>
              </div>

              <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-amber-900">
                      Important practical warning
                    </h3>
                    <p className="mt-2 leading-7 text-amber-900/90">
                      This page is a routing and comparison guide. It should help you choose
                      the correct next step, but it is not permission to take shortcuts.
                      Landlords should never try to remove tenants informally, change locks
                      without the lawful process, or assume that a notice alone finishes the
                      eviction. In many cases, lawful possession still requires a court or
                      tribunal order and, if needed, enforcement.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="england" className="scroll-mt-24 bg-white py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-5xl">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-4xl">🏴</span>
                <h2 className="text-3xl font-bold text-gray-900">
                  Evicting a tenant in England
                </h2>
              </div>

              <div className="rounded-xl border-l-4 border-amber-500 bg-amber-50 p-4 mb-8">
                <p className="text-sm text-amber-900">
                  <strong>England update:</strong> this is the part of the UK where landlords
                  most often search for Section 21 and Section 8 routes. Since the post-1 May
                  2026 framework changed the live route, the safest approach is to check the
                  current position before serving notice instead of relying on old blog posts
                  or recycled template language.
                </p>
              </div>

              <div className="space-y-6 text-gray-700">
                <p className="leading-7">
                  In England, landlords usually begin by asking whether they are dealing with
                  older no-fault wording or a live grounds-based route. That distinction still
                  drives a lot of search traffic, but it is also where the most confusion now
                  happens. A useful page should not just list Section 21 and Section 8. It
                  should explain what changed, what is current, and why compliance and service
                  details matter so much before any possession claim is issued.
                </p>
                <p className="leading-7">
                  Grounds-based possession remains important where the tenant is in rent
                  arrears, in breach of the tenancy, or where the route depends on specific
                  facts and evidence. Older no-fault language is still part of search
                  behaviour, but landlords should be careful not to assume that older England
                  eviction guidance is still current in every detail. The safer route is to
                  move into the right notice workflow, check compliance, and then take the
                  next possession step with evidence rather than guesswork.
                </p>
              </div>

              <div className="mt-8 grid gap-6 md:grid-cols-2">
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Section 21 transition route
                  </h3>
                  <p className="text-gray-700 leading-7 mb-4">
                    This is the route many England landlords still search for when they want
                    possession without relying on tenant fault. It is also the route most
                    affected by reform, so landlords should check the current position before
                    acting rather than assuming old timelines still apply.
                  </p>
                  <ul className="space-y-2 text-gray-700 mb-4">
                    <li>- Most sensitive to compliance and document-history mistakes.</li>
                    <li>- Often used where the landlord wants possession without alleging breach.</li>
                    <li>- Service, dates, and supporting compliance records matter heavily.</li>
                  </ul>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href="/section-21-ban-uk"
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      Section 21 transition guide {'->'}
                    </Link>
                    <Link
                      href="/section-21-notice"
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      Section 21 notice page {'->'}
                    </Link>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Section 8 grounds-based route
                  </h3>
                  <p className="text-gray-700 leading-7 mb-4">
                    This is the main England route where you rely on a specific ground, such
                    as arrears, breach, or other behaviour-based reasons. The strength of the
                    case depends not only on the notice but on the facts, the evidence, and
                    the ground you are using.
                  </p>
                  <ul className="space-y-2 text-gray-700 mb-4">
                    <li>- Common for arrears, breach, or anti-social behaviour cases.</li>
                    <li>- Usually requires greater attention to evidence and pleadings.</li>
                    <li>- The court route and hearing process may be more involved.</li>
                  </ul>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href="/section-8-notice"
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      Section 8 template {'->'}
                    </Link>
                    <Link
                      href="/section-8-notice"
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      Section 8 guide {'->'}
                    </Link>
                  </div>
                </div>
              </div>

              <div className="mt-8 rounded-2xl border border-primary/20 bg-primary/5 p-6">
                <h4 className="font-bold text-gray-900 mb-3">England landlord products</h4>
                <div className="flex flex-wrap gap-4">
                  <Link
                    href={productLinks.noticeOnly.href}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
                  >
                    <FileText className="h-4 w-4" />
                    Start notice only - {noticeOnlyPrice}
                  </Link>
                  <Link
                    href={productLinks.completePack.href}
                    className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                  >
                    <FileText className="h-4 w-4" />
                    Start full eviction pack - {completePackPrice}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="wales" className="scroll-mt-24 bg-red-50 py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-5xl">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-4xl">🏴</span>
                <h2 className="text-3xl font-bold text-gray-900">
                  Evicting a contract-holder in Wales
                </h2>
              </div>

              <div className="rounded-xl border-l-4 border-red-600 bg-red-100 p-4 mb-8">
                <p className="text-sm text-red-900">
                  <strong>Wales uses different terminology:</strong> in Wales, many landlords
                  still search for "evicting a tenant", but the page should use the proper
                  Renting Homes terminology where possible. That means talking about
                  <strong> occupation contracts</strong> and <strong>contract-holders</strong>,
                  not lazily importing England's Section 21 or Section 8 language.
                </p>
              </div>

              <div className="space-y-6 text-gray-700">
                <p className="leading-7">
                  Wales requires a different mental model from England. The biggest risk on
                  Wales pages is copying England possession language and changing only a few
                  labels. That weakens trust and increases the risk of landlords taking the
                  wrong first step. A proper Wales page should explain that the possession
                  route depends on the structure of the occupation contract and the correct
                  Welsh notice or breach-based route, not on simply asking whether the case is
                  Section 21 or Section 8.
                </p>
                <p className="leading-7">
                  In practical terms, Wales landlords should start by identifying the correct
                  occupation contract position, then checking which possession route applies,
                  then confirming the relevant notice period and service method. This is also
                  one of the clearest examples of why a UK comparison page needs jurisdiction
                  discipline. What sounds like a familiar "tenant eviction" question is often
                  a very different legal question once the property turns out to be in Wales.
                </p>
              </div>

              <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Wales eviction overview
                </h3>
                <ul className="space-y-3 text-gray-700">
                  <li>- Use Welsh occupation contract terminology where appropriate.</li>
                  <li>- Identify whether the route is no-fault style or breach-based under Welsh law.</li>
                  <li>- Check the current required notice period for the specific route being used.</li>
                  <li>- Do not rely on England Section 21 or Section 8 wording for Welsh properties.</li>
                  <li>- If possession is still required after notice expires, court action may still be needed.</li>
                </ul>
              </div>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/wales-eviction-notices"
                  className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-6 py-3 font-medium text-white hover:bg-red-700"
                >
                  Wales eviction guide {'->'}
                </Link>
                <Link
                  href="/wales-tenancy-agreement-template"
                  className="inline-flex items-center gap-2 rounded-lg border border-red-600 bg-white px-6 py-3 font-medium text-red-600 hover:bg-red-50"
                >
                  Wales occupation contracts {'->'}
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section id="scotland" className="scroll-mt-24 bg-blue-50 py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-5xl">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-4xl">🏴</span>
                <h2 className="text-3xl font-bold text-gray-900">
                  Evicting a tenant in Scotland
                </h2>
              </div>

              <div className="rounded-xl border-l-4 border-blue-600 bg-blue-100 p-4 mb-8">
                <p className="text-sm text-blue-900">
                  <strong>Scotland uses its own route:</strong> for many private lets, the
                  key concepts are <strong>Private Residential Tenancy (PRT)</strong> and
                  <strong> Notice to Leave</strong>. Scotland is not an England-style Section
                  21 or Section 8 jurisdiction, and possession disputes commonly move through
                  the First-tier Tribunal rather than being treated like an ordinary England
                  county court possession page.
                </p>
              </div>

              <div className="space-y-6 text-gray-700">
                <p className="leading-7">
                  Scottish eviction guidance should not be written as though PRT is just an
                  alternative label on the same system. It is a different tenancy structure
                  with different possession terminology and different procedural expectations.
                  That matters to landlords because the first mistake often happens long before
                  the tribunal stage: they search broadly for a UK eviction process and end up
                  following England assumptions that do not fit a Scottish private residential
                  tenancy at all.
                </p>
                <p className="leading-7">
                  In Scotland, the first practical question is usually what ground the
                  landlord is relying on and what notice period applies to that ground under
                  the Scottish framework. The next question is whether the Notice to Leave has
                  been prepared and served properly. If the tenant does not leave, the case
                  generally moves into the Scottish tribunal route rather than simply being
                  treated like a standard England possession claim.
                </p>
              </div>

              <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Scotland eviction overview
                </h3>
                <ul className="space-y-3 text-gray-700">
                  <li>- Identify the correct PRT ground for possession.</li>
                  <li>- Use a Notice to Leave rather than England notice language.</li>
                  <li>- Check the correct Scottish notice period for that ground.</li>
                  <li>- Prepare for tribunal action if the tenant remains after notice expires.</li>
                  <li>- Avoid copying England court-route assumptions onto a Scottish case.</li>
                </ul>
              </div>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/scotland-eviction-notices"
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
                >
                  Scotland eviction guide {'->'}
                </Link>
                <Link
                  href="/private-residential-tenancy-agreement-template"
                  className="inline-flex items-center gap-2 rounded-lg border border-blue-600 bg-white px-6 py-3 font-medium text-blue-600 hover:bg-blue-50"
                >
                  Scotland PRT agreements {'->'}
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section id="northern-ireland" className="scroll-mt-24 bg-green-50 py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-5xl">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-4xl">🇬🇧</span>
                <h2 className="text-3xl font-bold text-gray-900">
                  Evicting a tenant in Northern Ireland
                </h2>
              </div>

              <div className="rounded-xl border-l-4 border-green-600 bg-green-100 p-4 mb-8">
                <p className="text-sm text-green-900">
                  <strong>Northern Ireland is separate again:</strong> landlords should not
                  assume that England, Wales, or Scotland routes carry over. NI has its own
                  private tenancy framework, notice expectations, and possession process.
                </p>
              </div>

              <div className="space-y-6 text-gray-700">
                <p className="leading-7">
                  Northern Ireland is often under-served by UK eviction content because many
                  comparison pages mention it only briefly or treat it as a footnote to
                  England guidance. That is not enough for a landlord making a live decision.
                  The right first step is to identify the NI tenancy position, the correct
                  notice route, and the appropriate timing and possession process for the
                  property and case in question.
                </p>
                <p className="leading-7">
                  Where an NI landlord needs possession, the key commercial value of this page
                  is not pretending to be the final source of every detail. It is helping the
                  user recognise that Northern Ireland needs its own route and moving them to
                  the correct agreement or guidance page rather than leaving them on a generic
                  UK article that is really about England.
                </p>
              </div>

              <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Northern Ireland eviction overview
                </h3>
                <ul className="space-y-3 text-gray-700">
                  <li>- Use Northern Ireland tenancy language and notice route.</li>
                  <li>- Check the correct notice period for the tenancy length and case type.</li>
                  <li>- Make sure service and evidence are properly recorded.</li>
                  <li>- Move to the NI court route if possession is still required after notice.</li>
                </ul>
              </div>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/northern-ireland-tenancy-agreement-template"
                  className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 font-medium text-white hover:bg-green-700"
                >
                  Northern Ireland tenancy agreements {'->'}
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-5xl">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Eviction costs, timelines, and validity checklist
              </h2>
              <p className="max-w-4xl text-gray-700 leading-7 mb-10">
                The biggest delay in landlord possession cases is often not the notice period
                itself. It is the moment the landlord discovers the notice was served on the
                wrong basis, the dates were wrong, the compliance record is incomplete, or the
                evidence for the chosen route is thinner than expected. A strong eviction page
                therefore needs to cover the "what now?" questions that landlords actually
                care about, not just list a few notice names.
              </p>

              <div className="grid gap-6 md:grid-cols-3">
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Typical timeline shape</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>- Notice period first.</li>
                    <li>- Court or tribunal stage next if needed.</li>
                    <li>- Enforcement adds more time if possession is still resisted.</li>
                    <li>- Contested cases usually take longer.</li>
                  </ul>
                </div>

                <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Costs to plan for</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>- Notice or document preparation.</li>
                    <li>- Court or tribunal fees.</li>
                    <li>- Service, witness, or evidence costs.</li>
                    <li>- Enforcement costs if the case reaches that stage.</li>
                  </ul>
                </div>

                <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Validity checklist</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>- Correct jurisdiction and notice route.</li>
                    <li>- Correct dates and service method.</li>
                    <li>- Compliance record checked where relevant.</li>
                    <li>- Evidence prepared for grounds-based cases.</li>
                  </ul>
                  <Link
                    href="/section-21-ban-uk"
                    className="inline-flex mt-3 text-sm font-medium text-primary hover:underline"
                  >
                    Section 21 template {'->'}
                  </Link>
                </div>
              </div>

              <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6">
                <div className="flex items-start gap-3">
                  <XCircle className="mt-0.5 h-5 w-5 text-red-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-red-900">
                      Common landlord mistakes
                    </h3>
                    <ul className="mt-3 space-y-2 text-red-900/90">
                      <li>- Using an England notice concept for a Welsh or Scottish property.</li>
                      <li>- Assuming a notice guarantees possession without the next legal step.</li>
                      <li>- Relying on old online timelines without checking current validity.</li>
                      <li>- Choosing the wrong route for arrears, breach, or no-fault style possession.</li>
                      <li>- Treating compliance history as an afterthought instead of a risk point.</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mt-8 text-sm text-gray-600">
                Need a grounds-based England route? Use a{' '}
                <Link
                  href="/section-8-notice"
                  className="font-medium text-primary hover:underline"
                >
                  Section 8 notice template
                </Link>{' '}
                for arrears or breach-based cases.
              </div>
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-br from-primary to-primary/80 py-16 text-white">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold mb-6">Ready to start your eviction route?</h2>
              <p className="text-xl text-white/90 mb-8">
                Start with the correct notice workflow, avoid common validity problems, and
                move into the right possession route for your jurisdiction.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href={productLinks.noticeOnly.href}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 font-semibold text-primary hover:bg-gray-100"
                >
                  Notice Only - {noticeOnlyPrice}
                </Link>
                <Link
                  href={productLinks.completePack.href}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-8 py-4 font-semibold text-white transition-colors hover:bg-white/20"
                >
                  Complete Pack - {completePackPrice}
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <NextLegalSteps
                jurisdictionLabel="UK eviction routes"
                scenarioLabel="tenant eviction"
                primaryCTA={{
                  label: `Complete eviction pack - ${completePackPrice}`,
                  href: productLinks.completePack.href,
                }}
                secondaryCTA={{
                  label: `Notice only - ${noticeOnlyPrice}`,
                  href: productLinks.noticeOnly.href,
                }}
                relatedLinks={[
                  {
                    href: guideLinks.evictionProcessUk.href,
                    title: guideLinks.evictionProcessUk.title,
                    description: guideLinks.evictionProcessUk.description,
                  },
                  {
                    href: guideLinks.section21BanUk.href,
                    title: guideLinks.section21BanUk.title,
                    description: guideLinks.section21BanUk.description,
                  },
                  {
                    href: guideLinks.section8Notice.href,
                    title: guideLinks.section8Notice.title,
                    description: guideLinks.section8Notice.description,
                  },
                  {
                    href: guideLinks.walesEviction.href,
                    title: guideLinks.walesEviction.title,
                    description: 'Wales-specific occupation contract possession guidance.',
                  },
                  {
                    href: guideLinks.scotlandEviction.href,
                    title: guideLinks.scotlandEviction.title,
                    description: 'Notice to Leave and PRT possession guidance for Scotland.',
                  },
                ]}
              />
            </div>
          </div>
        </section>

        <FAQSection
          title="FAQs for landlords"
          faqs={howToEvictTenantFAQs}
          showContactCTA={false}
          variant="white"
        />
      </main>
    </>
  );
}




