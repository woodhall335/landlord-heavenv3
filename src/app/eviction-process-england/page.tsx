import { Metadata } from 'next';
import Link from 'next/link';
import {
  StructuredData,
  breadcrumbSchema,
  articleSchema,
  HOWTO_SCHEMAS,
} from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo/urls';
import { SocialProofCounter } from '@/components/ui/SocialProofCounter';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { evictionRelatedLinks, productLinks, toolLinks, guideLinks, askHeavenLink } from '@/lib/seo/internal-links';
import { buildWizardLink } from '@/lib/wizard/buildWizardLink';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { SeoCtaBlock, SeoDisclaimer } from '@/components/seo/SeoCtaBlock';
import { FAQSection } from '@/components/seo/FAQSection';
import { SeoLandingWrapper } from '@/components/seo/SeoLandingWrapper';
import { evictionProcessEnglandFAQs } from '@/data/faqs';
import { PRODUCTS } from '@/lib/pricing/products';
import {
  CheckCircle,
  AlertTriangle,
  Clock,
  ArrowRight,
  Scale,
  FileText,
  Shield,
  Gavel,
  Home,
  Calendar,
  PoundSterling,
  AlertCircle,
  XCircle,
  ChevronRight,
  Users,
  MessageSquare,
} from 'lucide-react';

const completePackLink = buildWizardLink({
  product: 'complete_pack',
  jurisdiction: 'england',
  src: 'seo_eviction_process_england',
  topic: 'eviction',
});

const noticeOnlyLink = buildWizardLink({
  product: 'notice_only',
  jurisdiction: 'england',
  src: 'seo_eviction_process_england',
  topic: 'eviction',
});

export const metadata: Metadata = {
  title: 'Eviction Process England | How to Evict a Tenant | Landlord Heaven',
  description:
    'Guide to the eviction process in England. Legal steps, timelines, and costs for Section 21 and Section 8 evictions. From £49.99.',
  keywords: [
    'eviction process england',
    'how to evict tenant england',
    'landlord eviction process',
    'court eviction landlord',
    'section 21 eviction process',
    'section 8 eviction process',
    'eviction timeline england',
    'eviction costs england',
  ],
  openGraph: {
    title: 'Eviction Process England | How to Evict a Tenant | Landlord Heaven',
    description:
      'Complete guide to the eviction process in England. Learn the legal steps, timelines, and costs. Get court-ready eviction documents from £49.99.',
    type: 'article',
    url: getCanonicalUrl('/eviction-process-england'),
    siteName: 'Landlord Heaven',
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Eviction Process England | Landlord Heaven',
    description:
      'Complete guide to the eviction process in England. Learn the legal steps, timelines, and costs.',
  },
  alternates: {
    canonical: getCanonicalUrl('/eviction-process-england'),
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function EvictionProcessEnglandPage() {
  return (
    <>
      <SeoLandingWrapper
        pagePath="/eviction-process-england"
        pageTitle="Eviction Process England"
        pageType="court"
        jurisdiction="england"
      />

      {/* Structured Data */}
      <StructuredData
        data={articleSchema({
          headline: 'Eviction Process England: Complete Landlord Guide 2026',
          description:
            'Step-by-step guide to evicting a tenant in England. Covers Section 21, Section 8, court forms, costs, and timelines.',
          url: getCanonicalUrl('/eviction-process-england'),
          datePublished: '2026-01-30',
          dateModified: '2026-01-30',
        })}
      />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: getCanonicalUrl('/') },
          { name: 'Eviction Guides', url: getCanonicalUrl('/how-to-evict-tenant') },
          { name: 'Eviction Process England', url: getCanonicalUrl('/eviction-process-england') },
        ])}
      />
      <StructuredData data={HOWTO_SCHEMAS.section21Process} />

      <main>
        <HeaderConfig mode="autoOnScroll" />
        <UniversalHero
          title="Eviction Process England"
          subtitle="Follow the legal eviction route in England from notice service to possession order and enforcement."
          primaryCta={{ label: 'Start Eviction Wizard', href: completePackLink }}
          secondaryCta={{ label: 'Jump to key steps', href: '#requirements' }}
          showTrustPositioningBar
          hideMedia
        />

        {/* Social Proof */}
        <section className="py-6 bg-gray-50 border-y border-gray-100">
          <div className="container mx-auto px-4">
            <SocialProofCounter variant="total" className="justify-center" />
          </div>
        </section>

        {/* Prerequisites Section */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Before You Start: Key Requirements
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Before you can legally evict a tenant in England, you must ensure these requirements
                are met. Missing any of these can invalidate your eviction notice.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Deposit Protection */}
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Shield className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Deposit Protection</h3>
                      <p className="text-gray-600 text-sm">
                        If you took a deposit, it must be protected in a government-approved scheme
                        (DPS, MyDeposits, or TDS) within 30 days. You must provide the prescribed
                        information to your tenant.
                      </p>
                    </div>
                  </div>
                </div>

                {/* EPC */}
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Home className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Energy Performance Certificate</h3>
                      <p className="text-gray-600 text-sm">
                        You must have a valid EPC with a rating of E or above. A copy must be
                        provided to the tenant before or at the start of the tenancy.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Gas Safety */}
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Gas Safety Certificate</h3>
                      <p className="text-gray-600 text-sm">
                        If the property has gas appliances, you need an annual Gas Safety
                        Certificate from a registered Gas Safe engineer, provided to the tenant.
                      </p>
                    </div>
                  </div>
                </div>

                {/* How to Rent Guide */}
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">How to Rent Guide</h3>
                      <p className="text-gray-600 text-sm">
                        The current version of the government&apos;s &quot;How to Rent&quot; guide
                        must be provided to all tenants. Keep evidence of when this was provided.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-amber-900 font-medium">Important</p>
                    <p className="text-amber-800 text-sm">
                      If you are unsure whether your notice will be valid, use our{' '}
                      <Link href="/tools/validators/section-21" className="underline font-medium">
                        Section 21 Validity Checker
                      </Link>{' '}
                      before serving.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 21 vs Section 8 */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Understanding Your Eviction Options
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                In England, landlords can use Section 21 (no-fault) or Section 8 (grounds-based)
                eviction notices. Many landlords serve both for maximum protection.
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Section 21 */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <span className="text-xl font-bold text-primary">21</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Section 21</h3>
                      <span className="text-sm text-gray-500">No-Fault Eviction</span>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4">
                    End the tenancy without giving a reason. Must comply with strict requirements or
                    the notice is invalid.
                  </p>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-sm">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>
                        <strong>Notice period:</strong> 2 months minimum
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Scale className="w-4 h-4 text-gray-400" />
                      <span>
                        <strong>Court process:</strong> Accelerated (no hearing)
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span>
                        <strong>Form:</strong> N5B (accelerated possession)
                      </span>
                    </div>
                  </div>

                  <h4 className="font-semibold text-gray-900 mb-2">When to use:</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      End of fixed term or periodic tenancy
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      Property sale or refurbishment
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      No specific fault but want possession
                    </li>
                  </ul>

                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <Link
                      href="/section-21-notice-template"
                      className="text-primary font-medium text-sm hover:underline inline-flex items-center gap-1"
                    >
                      Section 21 Notice Template
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                {/* Section 8 */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                      <span className="text-xl font-bold text-red-600">8</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Section 8</h3>
                      <span className="text-sm text-gray-500">Grounds-Based Eviction</span>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4">
                    Evict for specific reasons like rent arrears, breach of contract, or antisocial
                    behaviour. Some grounds are mandatory.
                  </p>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-sm">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>
                        <strong>Notice period:</strong> 2 weeks to 2 months
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Scale className="w-4 h-4 text-gray-400" />
                      <span>
                        <strong>Court process:</strong> Standard (hearing required)
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span>
                        <strong>Form:</strong> N5 + N119 (standard possession)
                      </span>
                    </div>
                  </div>

                  <h4 className="font-semibold text-gray-900 mb-2">When to use:</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      Rent arrears (2+ months for mandatory)
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      Breach of tenancy agreement
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      Antisocial behaviour or nuisance
                    </li>
                  </ul>

                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <Link
                      href="/section-8-notice-template"
                      className="text-primary font-medium text-sm hover:underline inline-flex items-center gap-1"
                    >
                      Section 8 Notice Template
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>

              <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                <p className="text-blue-900 text-sm">
                  <strong>Pro tip:</strong> Serve both Section 21 and Section 8 notices together. If
                  Section 21 is challenged or the tenant pays arrears below 2 months, you have
                  Section 8 as backup (and vice versa).
                </p>
              </div>

              <div className="mt-6 text-center">
                <Link
                  href="/section-8-vs-section-21"
                  className="text-primary font-medium hover:underline inline-flex items-center gap-1"
                >
                  Full Section 8 vs Section 21 Comparison
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* The Court Process */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                The Court Process Explained
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                If your tenant does not leave after the notice expires, you must apply to the County
                Court for a possession order. Here is how the process works.
              </p>

              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200 hidden md:block" />

                <div className="space-y-8">
                  {/* Step 1 */}
                  <div className="relative flex items-start gap-6">
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center flex-shrink-0 z-10">
                      <span className="text-xl font-bold text-white">1</span>
                    </div>
                    <div className="flex-1 bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        Choose Court Forms
                      </h3>
                      <p className="text-gray-600 mb-4">
                        For Section 21, use Form N5B (accelerated possession). For Section 8 or if
                        claiming rent arrears, use Form N5 with N119 (particulars of claim).
                      </p>
                      <div className="grid sm:grid-cols-2 gap-4 text-sm">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <strong className="text-gray-900">N5B:</strong>
                          <p className="text-gray-600">Accelerated procedure (Section 21 only)</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <strong className="text-gray-900">N5 + N119:</strong>
                          <p className="text-gray-600">Standard procedure (all claims)</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="relative flex items-start gap-6">
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center flex-shrink-0 z-10">
                      <span className="text-xl font-bold text-white">2</span>
                    </div>
                    <div className="flex-1 bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        Submit to Court & Pay Fees
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Submit your claim to the County Court covering the property address. The
                        court fee is currently £355 for both accelerated and standard possession.
                      </p>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Possession claim fee</span>
                          <span className="font-bold text-gray-900">£355</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="relative flex items-start gap-6">
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center flex-shrink-0 z-10">
                      <span className="text-xl font-bold text-white">3</span>
                    </div>
                    <div className="flex-1 bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        Court Reviews / Hearing
                      </h3>
                      <p className="text-gray-600 mb-4">
                        For N5B (accelerated), the judge reviews on paper—no hearing unless
                        defended. For N5 (standard), expect a hearing date 6-12 weeks after
                        submission.
                      </p>
                      <div className="grid sm:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>N5B: 4-8 weeks (no hearing)</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>N5: 6-12 weeks (hearing)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="relative flex items-start gap-6">
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center flex-shrink-0 z-10">
                      <span className="text-xl font-bold text-white">4</span>
                    </div>
                    <div className="flex-1 bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        Possession Order Granted
                      </h3>
                      <p className="text-gray-600 mb-4">
                        The court grants a possession order specifying a date the tenant must leave
                        (usually 14 days, up to 42 days if tenant requests). Order types include
                        outright, suspended, or postponed.
                      </p>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>
                            <strong>Outright:</strong> Tenant must leave by specified date
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                          <span>
                            <strong>Suspended:</strong> Tenant stays if conditions met (e.g., pay
                            arrears)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 5 */}
                  <div className="relative flex items-start gap-6">
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center flex-shrink-0 z-10">
                      <span className="text-xl font-bold text-white">5</span>
                    </div>
                    <div className="flex-1 bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        Warrant of Possession (If Needed)
                      </h3>
                      <p className="text-gray-600 mb-4">
                        If the tenant does not leave by the order date, apply for a warrant of
                        possession (Form N325). County court bailiffs will physically remove the
                        tenant.
                      </p>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-600">Warrant fee</span>
                          <span className="font-bold text-gray-900">~£130</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Typical wait time</span>
                          <span className="font-bold text-gray-900">4-8 weeks</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Common Mistakes Section */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Common Mistakes That Invalidate Evictions
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Many eviction attempts fail due to procedural errors. Avoid these common pitfalls
                that can delay your possession claim by months.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 border border-red-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <XCircle className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">
                        Deposit Not Protected or Prescribed Info Missing
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Section 21 cannot be served if deposit was not protected within 30 days or
                        prescribed information was not provided. The tenant can claim 1-3x the
                        deposit amount as a penalty.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-red-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <XCircle className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">
                        Wrong Form or Outdated Version
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Using the wrong Section 21 form (Form 6A is required) or an outdated version
                        will invalidate your notice. Always use the current prescribed form.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-red-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <XCircle className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">
                        Notice Period Too Short
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Section 21 requires a full 2 calendar months. Section 8 varies by ground.
                        Getting the date calculation wrong means starting over.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-red-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <XCircle className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">
                        How to Rent Guide Not Provided
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Tenants must receive the current version of the government&apos;s How to
                        Rent guide. Failure to provide this blocks Section 21 possession.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-red-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <XCircle className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">
                        Retaliatory Eviction Defence
                      </h3>
                      <p className="text-gray-600 text-sm">
                        If the tenant complained about property conditions and the local authority
                        served an improvement notice, Section 21 is blocked for 6 months.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-red-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <XCircle className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">
                        Improper Service of Notice
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Notices must be served correctly: in person, by first class post, or left at
                        the property. Keep proof of service. Email is not valid service.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 bg-primary/5 rounded-xl p-6 border border-primary/20">
                <div className="flex items-start gap-4">
                  <Shield className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Avoid These Mistakes with Our Wizard
                    </h4>
                    <p className="text-gray-600 text-sm mb-4">
                      Our eviction document wizard checks all requirements, calculates correct notice
                      periods, and generates court-ready documents. AI compliance checking catches
                      issues before you serve.
                    </p>
                    <Link
                      href={completePackLink}
                      className="inline-flex items-center gap-2 text-primary font-medium text-sm hover:underline"
                    >
                      Get Complete Eviction Pack — {PRODUCTS.complete_pack.displayPrice}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Costs and Timelines */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Eviction Costs and Timelines
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Understanding the full cost and timeline helps you plan your eviction. Here is what
                to expect for both Section 21 and Section 8 routes.
              </p>

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-4 font-semibold text-gray-900">Stage</th>
                        <th className="text-left p-4 font-semibold text-gray-900">Section 21</th>
                        <th className="text-left p-4 font-semibold text-gray-900">Section 8</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr>
                        <td className="p-4 font-medium text-gray-900">Notice Period</td>
                        <td className="p-4 text-gray-600">2 months</td>
                        <td className="p-4 text-gray-600">2 weeks - 2 months</td>
                      </tr>
                      <tr className="bg-gray-50/50">
                        <td className="p-4 font-medium text-gray-900">Court Claim Fee</td>
                        <td className="p-4 text-gray-600">£355</td>
                        <td className="p-4 text-gray-600">£355</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-medium text-gray-900">Court Processing</td>
                        <td className="p-4 text-gray-600">4-8 weeks (no hearing)</td>
                        <td className="p-4 text-gray-600">6-12 weeks (hearing)</td>
                      </tr>
                      <tr className="bg-gray-50/50">
                        <td className="p-4 font-medium text-gray-900">Possession Order</td>
                        <td className="p-4 text-gray-600">14-42 days to vacate</td>
                        <td className="p-4 text-gray-600">14-42 days to vacate</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-medium text-gray-900">Warrant (if needed)</td>
                        <td className="p-4 text-gray-600">£130 + 4-8 weeks</td>
                        <td className="p-4 text-gray-600">£130 + 4-8 weeks</td>
                      </tr>
                      <tr className="bg-primary/5">
                        <td className="p-4 font-bold text-gray-900">Total Time (typical)</td>
                        <td className="p-4 font-bold text-primary">4-6 months</td>
                        <td className="p-4 font-bold text-primary">3-8 months</td>
                      </tr>
                      <tr className="bg-primary/5">
                        <td className="p-4 font-bold text-gray-900">Total Cost (court only)</td>
                        <td className="p-4 font-bold text-primary">~£485</td>
                        <td className="p-4 font-bold text-primary">~£485</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-6 grid md:grid-cols-3 gap-4 text-center">
                <div className="bg-gray-50 rounded-xl p-4">
                  <PoundSterling className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Solicitor (optional)</p>
                  <p className="font-bold text-gray-900">£500 - £3,000</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <FileText className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Our Complete Pack</p>
                  <p className="font-bold text-gray-900">{PRODUCTS.complete_pack.displayPrice}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <Clock className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Notice Only Pack</p>
                  <p className="font-bold text-gray-900">{PRODUCTS.notice_only.displayPrice}</p>
                </div>
              </div>

              <div className="mt-6 text-center">
                <Link
                  href="/eviction-cost-uk"
                  className="text-primary font-medium hover:underline inline-flex items-center gap-1"
                >
                  Full UK Eviction Costs Breakdown
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Mid-page CTA */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <SeoCtaBlock
                pageType="court"
                variant="section"
                jurisdiction="england"
                pagePath="/eviction-process-england"
              />
            </div>
          </div>
        </section>

        {/* Ask Heaven Callout */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-purple-900 mb-2">
                      Have Questions About Your Situation?
                    </h3>
                    <p className="text-purple-800 mb-4">
                      Every eviction case is different. Use our free Ask Heaven tool to get answers
                      to your specific landlord questions about eviction, notices, and court
                      procedures.
                    </p>
                    <Link
                      href="/ask-heaven"
                      className="inline-flex items-center text-purple-700 font-medium hover:text-purple-900"
                    >
                      Ask Heaven Free Q&A
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <FAQSection
          faqs={evictionProcessEnglandFAQs}
          title="Eviction Process England: Frequently Asked Questions"
          showContactCTA={false}
          variant="gray"
        />

        {/* Final CTA */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <SeoCtaBlock
                pageType="court"
                variant="final"
                jurisdiction="england"
                pagePath="/eviction-process-england"
                title="Get Your Eviction Documents Now"
                description="Court-ready notices and forms. AI compliance check. Trusted by over 10,000 UK landlords."
              />

              <SeoDisclaimer className="max-w-4xl mx-auto" />
            </div>
          </div>
        </section>

        {/* Related Resources */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <RelatedLinks
                title="Related Eviction Resources"
                links={[
                  ...evictionRelatedLinks,
                  guideLinks.possessionClaimGuide,
                  guideLinks.evictionCostUk,
                  askHeavenLink,
                ]}
              />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
