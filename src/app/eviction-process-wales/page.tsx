import { Metadata } from 'next';
import Link from 'next/link';
import {
  StructuredData,
  breadcrumbSchema,
  articleSchema,
} from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo/urls';
import { SocialProofCounter } from '@/components/ui/SocialProofCounter';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { SeoPageContextPanel } from '@/components/seo/SeoPageContextPanel';
import { walesRelatedLinks } from '@/lib/seo/internal-links';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { SeoCtaBlock, SeoDisclaimer } from '@/components/seo/SeoCtaBlock';
import { FAQSection } from '@/components/seo/FAQSection';
import { SeoLandingWrapper } from '@/components/seo/SeoLandingWrapper';
import { evictionWalesFAQs } from '@/data/faqs';
import { PRODUCTS } from '@/lib/pricing/products';
import {
  CheckCircle,
  AlertTriangle,
  Clock,
  ArrowRight,
  FileText,
  Gavel,
  Calendar,
  AlertCircle,
  PoundSterling,
  XCircle,
  Home,
  MessageSquare,
  Scale,
  Shield,
} from 'lucide-react';

const completePackLink = '/products/complete-pack';
const noticeOnlyLink = '/products/notice-only';

export const metadata: Metadata = {
  title: 'Eviction Process Wales 2026 | Section 173, Breach Notices & Court Process',
  description:
    'Complete guide to the eviction process in Wales for landlords.',
  keywords: [
    'eviction process wales',
    'how to evict a tenant in wales',
    'how to evict a contract-holder in wales',
    'section 173 notice wales',
    'section 178 notice wales',
    'renting homes wales act eviction',
    'occupation contract wales eviction',
    'wales landlord possession process',
    'tenant not leaving after section 173',
    'contract-holder not leaving wales',
    'wales eviction notice',
    'written statement wales landlord',
  ],
  openGraph: {
    title: 'Eviction Process Wales 2026 | Section 173, Breach Notices & Court Process',
    description:
      'Guide to evicting a contract-holder in Wales under the Renting Homes (Wales) Act. Section 173, breach routes, court process, timelines, and landlord next steps.',
    type: 'article',
    url: getCanonicalUrl('/eviction-process-wales'),
    siteName: 'Landlord Heaven',
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Eviction Process Wales | Landlord Heaven',
    description:
      'Section 173, breach-based possession routes, court process, and timelines for Welsh landlords.',
  },
  alternates: {
    canonical: getCanonicalUrl('/eviction-process-wales'),
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function EvictionProcessWalesPage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: evictionWalesFAQs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <SeoLandingWrapper
        pagePath="/eviction-process-wales"
        pageTitle="Eviction Process Wales"
        pageType="court"
        jurisdiction="wales"
      />

      <StructuredData
        data={articleSchema({
          headline: 'Eviction Process Wales: Section 173, Breach Notices and Court Process',
          description:
            'Step-by-step guide to the landlord eviction process in Wales under the Renting Homes (Wales) Act. Covers Section 173, breach-based possession routes, written statement requirements, court process, and enforcement.',
          url: getCanonicalUrl('/eviction-process-wales'),
          datePublished: '2026-01-30',
          dateModified: '2026-03-20',
        })}
      />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: getCanonicalUrl('/') },
          { name: 'Eviction Guides', url: getCanonicalUrl('/how-to-evict-tenant') },
          { name: 'Eviction Process Wales', url: getCanonicalUrl('/eviction-process-wales') },
        ])}
      />
      <main>
        <HeaderConfig mode="autoOnScroll" />

        <UniversalHero
          badge="Wales"
          badgeIcon={<Scale className="w-4 h-4" />}
          title="Eviction Process Wales"
          subtitle={`Understand how possession works in Wales under the Renting Homes (Wales) framework. Learn when landlords use Section 173, when breach-based possession may be more suitable, and how to move from notice to court without avoidable mistakes.`}
          primaryCta={{
            label: `Start Wales Notice Only — ${PRODUCTS.notice_only.displayPrice}`,
            href: noticeOnlyLink,
          }}
          secondaryCta={{
            label: `Need Complete Pack support? — ${PRODUCTS.complete_pack.displayPrice}`,
            href: completePackLink,
          }}
          showTrustPositioningBar
          hideMedia
        />

        <section className="py-6 bg-gray-50 border-y border-gray-100">
          <div className="container mx-auto px-4">
            <SocialProofCounter variant="total" className="justify-center" />
          </div>
        </section>

        <section className="py-8 bg-blue-50">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-start gap-4 rounded-2xl border border-blue-200 bg-white p-6">
                <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h2 className="font-bold text-blue-900 mb-2 text-lg">
                    Wales uses a different possession system from England
                  </h2>
                  <p className="text-blue-800 text-sm leading-6">
                    In Wales, the old AST-first language does not control the possession route.
                    Landlords deal with <strong>occupation contracts</strong> and{' '}
                    <strong>contract-holders</strong> under the Renting Homes framework.
                    Section 21 and Section 8 are English terms. Welsh landlords usually focus on
                    <strong> Section 173</strong> for no-fault possession and the relevant
                    breach-based possession route where the contract-holder has broken the contract,
                    built up arrears, or engaged in serious misconduct.
                  </p>
                  <p className="mt-3 text-sm leading-6 text-blue-800">
                    Use{' '}
                    <Link href="/how-to-evict-tenant" className="font-medium underline underline-offset-2">
                      how to evict a tenant
                    </Link>{' '}
                    for the main UK workflow, compare stages in the{' '}
                    <Link href="/eviction-process-uk" className="font-medium underline underline-offset-2">
                      eviction process UK guide
                    </Link>, and choose{' '}
                    <Link href="/products/notice-only" className="font-medium underline underline-offset-2">
                      Notice Only
                    </Link>{' '}
                    when the next practical step is drafting the correct Welsh notice route before court.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <SeoPageContextPanel pathname="/eviction-process-wales" />
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Wales eviction terminology landlords need to know
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-3xl mx-auto">
                One reason Welsh possession cases go wrong is that landlords use English language,
                English assumptions, or English document logic in a Wales file. Start with the
                correct terminology and the rest of the process is easier to control.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <XCircle className="w-6 h-6 text-gray-400" />
                    </div>
                    <span className="text-lg font-bold text-gray-500">Older England-led language</span>
                  </div>
                  <ul className="space-y-3 text-gray-500">
                    <li className="line-through">Tenant</li>
                    <li className="line-through">Tenancy</li>
                    <li className="line-through">Assured Shorthold Tenancy (AST)</li>
                    <li className="line-through">Section 21</li>
                    <li className="line-through">Section 8</li>
                  </ul>
                </div>

                <div className="bg-primary/5 rounded-2xl p-6 border-2 border-primary shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-lg font-bold text-gray-900">Wales terminology</span>
                  </div>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 text-primary" />
                      <strong>Contract-holder</strong>
                    </li>
                    <li className="flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 text-primary" />
                      <strong>Occupation contract</strong>
                    </li>
                    <li className="flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 text-primary" />
                      <strong>Standard occupation contract</strong>
                    </li>
                    <li className="flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 text-primary" />
                      <strong>Section 173 notice</strong> for no-fault possession
                    </li>
                    <li className="flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 text-primary" />
                      <strong>Breach-based possession notice</strong> for arrears or contract breach
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-8 prose prose-lg max-w-none text-gray-700">
                <p>
                  This matters for both SEO and legal accuracy. Landlords still search for “tenant
                  eviction Wales” and “Section 21 Wales”, but the working legal route in Wales is
                  different. A strong Welsh eviction page therefore needs to do two things at once:
                  capture the search term the landlord uses and then quickly translate that into the
                  correct Wales-specific framework.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Section 173 vs breach-based possession in Wales
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-3xl mx-auto">
                Welsh landlords usually choose between a no-fault route and a breach-based route.
                The right answer depends on why you want possession, how quickly you need to act,
                and how strong your evidence file is.
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center">
                      <span className="text-lg font-bold text-primary">173</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Section 173</h3>
                      <span className="text-sm text-gray-500">No-fault possession route</span>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4">
                    This is the Wales no-fault route. It is often used where the landlord wants
                    possession without proving tenant fault, but it comes with strict timing and
                    compliance conditions.
                  </p>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Typical notice position</span>
                      <span className="font-bold text-primary">Long notice route</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Best for</span>
                      <span className="font-bold text-gray-900">No-fault possession planning</span>
                    </div>
                  </div>

                  <h4 className="font-semibold text-gray-900 mb-2">Usually chosen where:</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      You do not want to prove breach
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      The written statement and compliance file are clean
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      You are planning ahead rather than reacting to urgent arrears
                    </li>
                  </ul>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center">
                      <Gavel className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Breach-based route</h3>
                      <span className="text-sm text-gray-500">Arrears, breach or misconduct</span>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4">
                    This is usually the more natural route where the contract-holder has failed to
                    pay rent, broken the occupation contract, or caused serious problems.
                  </p>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Typical use case</span>
                      <span className="font-bold text-red-600">Arrears or breach</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Best for</span>
                      <span className="font-bold text-gray-900">Evidence-led possession</span>
                    </div>
                  </div>

                  <h4 className="font-semibold text-gray-900 mb-2">Usually chosen where:</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      Rent arrears are the real problem
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      The contract-holder has breached the contract
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      You can prove the facts with records and chronology
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-5 rounded-r-xl">
                <p className="text-blue-900 text-sm">
                  <strong>Practical rule:</strong> if your main reason is unpaid rent or a broken
                  occupation contract, the stronger Welsh route is often the breach-based one.
                  If your main reason is simply that you want the property back and your compliance
                  file is clean, Section 173 may be the more natural route.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Section 173: the compliance points that matter most
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-3xl mx-auto">
                Welsh no-fault possession is not just about generating a notice. The wider file
                has to be clean enough to support the route if the case goes to court.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <Calendar className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Timing rules</h3>
                      <p className="text-gray-600 text-sm">
                        Wales no-fault possession is more timing-sensitive than many landlords expect.
                        You should check the occupation date, your notice window, and whether the
                        route is actually available before serving anything.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <FileText className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Written statement</h3>
                      <p className="text-gray-600 text-sm">
                        The written statement is central to the Wales occupation contract framework.
                        If the written statement position is weak, the no-fault file often weakens too.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <Shield className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Document control</h3>
                      <p className="text-gray-600 text-sm">
                        The occupation contract, any variations, service records, and chronology
                        should all tell one consistent story. Courts respond better to clean files
                        than to large but messy bundles.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <Clock className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Planning ahead</h3>
                      <p className="text-gray-600 text-sm">
                        The Wales no-fault route often rewards landlords who plan earlier, not later.
                        It is usually less forgiving than an “I’ll sort the paperwork at the end”
                        approach.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 prose prose-lg max-w-none text-gray-700">
                <p>
                  That is one reason this page is structured around the process rather than just the
                  form. Competitor pages often stop at “download a notice.” The stronger landlord page
                  explains what makes that notice usable later. In Wales, that means written statement
                  thinking, correct terminology, service discipline, and a possession file that still
                  works under scrutiny.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-20 bg-gray-50" id="timeline">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Wales possession process: step by step
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-3xl mx-auto">
                If the contract-holder does not leave after the relevant notice route has been used,
                the case usually moves through the county court and then to enforcement if necessary.
              </p>

              <div className="space-y-6">
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-white">1</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        Choose the correct Wales route
                      </h3>
                      <p className="text-gray-600">
                        Start with the real reason for possession. If it is a no-fault recovery
                        case, review Section 173 availability. If it is arrears or breach, build
                        the breach-based route around evidence, not assumptions.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-white">2</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        Serve the notice and preserve service proof
                      </h3>
                      <p className="text-gray-600">
                        Service quality matters. Keep the final served version, proof of when and
                        how it was served, and a working chronology that links the notice to the
                        occupation contract and the wider case.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-white">3</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        Issue the county court claim if the contract-holder stays
                      </h3>
                      <p className="text-gray-600 mb-3">
                        If the notice expires and the contract-holder does not leave, the next
                        stage is the county court possession claim.
                      </p>
                      <div className="inline-block rounded-lg bg-gray-50 px-4 py-2 text-sm">
                        <span className="text-gray-600">Typical claim fee: </span>
                        <span className="font-bold text-gray-900">£355</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-white">4</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        Attend court with a file that makes sense
                      </h3>
                      <p className="text-gray-600">
                        The court will usually want the occupation contract, the notice relied on,
                        the service record, and the chronology behind the case. In breach cases,
                        it will also want the evidence supporting the alleged breach.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        Possession order, then enforcement if needed
                      </h3>
                      <p className="text-gray-600">
                        If possession is ordered and the contract-holder still refuses to leave,
                        enforcement is the next lawful step. Do not change locks or try to remove
                        the occupier yourself.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 bg-amber-50 border-l-4 border-amber-500 p-5 rounded-r-xl">
                <p className="text-amber-900 text-sm">
                  <strong>Important:</strong> illegal eviction rules still apply. Even if you are
                  certain you are right, you must recover possession through the lawful Wales route.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Wales rent arrears and money recovery
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-3xl mx-auto">
                Many Welsh landlord cases involve two separate questions: how to recover possession
                and how to recover unpaid rent. These are related, but not always identical, routes.
              </p>

              <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
                <div className="flex items-start gap-4">
                  <PoundSterling className="w-6 h-6 text-gray-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      Money claims in Wales
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Rent recovery is commonly handled through the county court money claim route.
                      The landlord still needs one clean arrears figure, one good chronology, and
                      one usable evidence pack. If the main issue is the debt rather than the
                      property, that route may be the commercial priority.
                    </p>
                    <p className="text-gray-600 mb-4">
                      If the contract-holder is still in occupation, the debt and possession strategy
                      should be coordinated carefully so the file remains consistent. If they have
                      already left, landlords often find it easier to calculate a final arrears
                      balance and then pursue recovery separately.
                    </p>
                    <div className="bg-amber-50 rounded-lg p-4 text-sm text-amber-800">
                      <AlertTriangle className="w-4 h-4 inline mr-1" />
                      Where the case is genuinely Wales-specific, review your debt-recovery and
                      possession strategy together instead of assuming the same product route fits
                      every file.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="bg-purple-50 border border-purple-200 rounded-2xl p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-purple-900 mb-2">
                      Questions about Welsh eviction law?
                    </h3>
                    <p className="text-purple-800 mb-4">
                      The Wales system is different enough that landlords often need a quick answer
                      before choosing the route. Use Ask Heaven for free help with Section 173,
                      arrears-led possession, notice timing, written statement issues, and next-step planning.
                    </p>
                    <Link
                      href="/ask-heaven"
                      className="inline-flex items-center text-purple-700 font-medium hover:text-purple-900"
                    >
                      Ask Heaven Free Q&amp;A
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <SeoCtaBlock
                pageType="court"
                variant="section"
                jurisdiction="wales"
                pagePath="/eviction-process-wales"
                title="Get your Wales eviction documents ready"
                description="Occupation contract possession support for Welsh landlords, including Wales-specific notice routes, court-stage guidance, and next-step planning."
              />
            </div>
          </div>
        </section>

        <FAQSection
          faqs={evictionWalesFAQs}
          title="Wales Eviction: Frequently Asked Questions"
          showContactCTA={false}
          variant="gray"
        />

        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <SeoCtaBlock
                pageType="court"
                variant="final"
                jurisdiction="wales"
                pagePath="/eviction-process-wales"
                title="Start your Wales eviction pack"
                description="No-fault and breach-led Wales possession support, designed around occupation contracts, contract-holders, and the Welsh court route."
              />

              <SeoDisclaimer className="max-w-4xl mx-auto" />
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <RelatedLinks title="Related Wales Resources" links={walesRelatedLinks} />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
