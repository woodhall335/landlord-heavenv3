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
import {
  walesRelatedLinks,
  productLinks,
  guideLinks,
  askHeavenLink,
} from '@/lib/seo/internal-links';
import { buildWizardLink } from '@/lib/wizard/buildWizardLink';
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
  Scale,
  FileText,
  Shield,
  Gavel,
  Calendar,
  AlertCircle,
  PoundSterling,
  XCircle,
  MapPin,
  Home,
  MessageSquare,
  Users,
} from 'lucide-react';

const completePackLink = buildWizardLink({
  product: 'complete_pack',
  jurisdiction: 'wales',
  src: 'seo_eviction-process-wales',
  topic: 'eviction',
});

const noticeOnlyLink = buildWizardLink({
  product: 'notice_only',
  jurisdiction: 'wales',
  src: 'seo_eviction-process-wales',
  topic: 'eviction',
});

export const metadata: Metadata = {
  title: 'Eviction Process Wales | Section 173 & 178 | Landlord Heaven',
  description:
    'Guide to evicting a tenant in Wales. Section 173 and Section 178 notices under the Renting Homes Act 2016. From £49.99.',
  keywords: [
    'eviction process wales landlord',
    'section 173 eviction',
    'section 178 wales',
    'tenant not leaving after section 173',
    'renting homes wales act',
    'wales eviction notice',
    'occupation contract wales',
    'contract holder eviction',
  ],
  openGraph: {
    title: 'Eviction Process Wales | Section 173 & 178 | Landlord Heaven',
    description:
      'Complete guide to evicting a tenant in Wales. Section 173 and Section 178 notices explained.',
    type: 'article',
    url: getCanonicalUrl('/eviction-process-wales'),
    siteName: 'Landlord Heaven',
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Eviction Process Wales | Landlord Heaven',
    description: 'Complete guide to evicting a tenant in Wales.',
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
  return (
    <>
      <SeoLandingWrapper
        pagePath="/eviction-process-wales"
        pageTitle="Eviction Process Wales"
        pageType="court"
        jurisdiction="wales"
      />

      {/* Structured Data */}
      <StructuredData
        data={articleSchema({
          headline: 'Eviction Process Wales: Section 173 & 178 Guide 2026',
          description:
            'Step-by-step guide to evicting a contract-holder in Wales under the Renting Homes Act 2016. Covers Section 173 and Section 178 notices.',
          url: getCanonicalUrl('/eviction-process-wales'),
          datePublished: '2026-01-30',
          dateModified: '2026-01-30',
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
          title="Eviction Process Wales"
          subtitle="Follow the legal Wales possession route from RHW notices to court action and enforcement."
          primaryCta={{ label: 'Start Eviction Wizard', href: completePackLink }}
          secondaryCta={{ label: 'Jump to key steps', href: '#timeline' }}
          showTrustPositioningBar
          hideMedia
        />

        {/* Social Proof */}
        <section className="py-6 bg-gray-50 border-y border-gray-100">
          <div className="container mx-auto px-4">
            <SocialProofCounter variant="total" className="justify-center" />
          </div>
        </section>

        {/* Important Notice - Different Terminology */}
        <section className="py-8 bg-blue-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h2 className="font-bold text-blue-900 mb-1">Wales Has Different Terminology</h2>
                  <p className="text-blue-800 text-sm">
                    Wales uses <strong>Section 173</strong> (no-fault) and{' '}
                    <strong>Section 178</strong> (breach) notices under the Renting Homes (Wales)
                    Act 2016. <strong>Section 21 and Section 8 do NOT apply in Wales.</strong> The
                    terminology is also different: tenants are &quot;contract-holders&quot; and
                    tenancies are &quot;occupation contracts&quot;.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Terminology Guide */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Wales Renting Homes Act: Key Terms
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                The Renting Homes (Wales) Act 2016 introduced new terminology. Understanding these
                terms is essential.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <XCircle className="w-6 h-6 text-gray-400" />
                    </div>
                    <span className="text-lg font-bold text-gray-400">Old Terms</span>
                  </div>
                  <ul className="space-y-3 text-gray-500">
                    <li className="flex items-center gap-2">
                      <span className="line-through">Tenant</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="line-through">Tenancy</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="line-through">Assured Shorthold Tenancy (AST)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="line-through">Section 21</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="line-through">Section 8</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-primary/5 rounded-xl p-6 border-2 border-primary">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-lg font-bold text-gray-900">Wales Terms</span>
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
                      <strong>Section 173 notice</strong> (no-fault)
                    </li>
                    <li className="flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 text-primary" />
                      <strong>Section 178 notice</strong> (breach)
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 173 vs 178 */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Section 173 vs Section 178: Which to Use
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Wales has two main eviction notices. Choose based on your reason for ending the
                occupation contract.
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Section 173 */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center">
                      <span className="text-lg font-bold text-primary">173</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Section 173</h3>
                      <span className="text-sm text-gray-500">No-Fault Eviction</span>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4">
                    End the occupation contract without giving a specific reason. Similar to
                    England&apos;s Section 21 but with stricter requirements.
                  </p>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Notice period</span>
                      <span className="font-bold text-primary">6 months minimum</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Court process</span>
                      <span className="font-bold text-gray-900">County Court</span>
                    </div>
                  </div>

                  <h4 className="font-semibold text-gray-900 mb-2">Requirements:</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      Cannot serve in first 6 months of occupation
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      Landlord must have owned property for 6+ months
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      Written statement must have been provided
                    </li>
                  </ul>
                </div>

                {/* Section 178 */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center">
                      <span className="text-lg font-bold text-red-600">178</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Section 178</h3>
                      <span className="text-sm text-gray-500">Breach/Fault-Based Eviction</span>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4">
                    End the occupation contract due to breach, rent arrears, or antisocial
                    behaviour. Similar to England&apos;s Section 8.
                  </p>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Notice period</span>
                      <span className="font-bold text-gray-900">1 month (standard)</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Serious arrears</span>
                      <span className="font-bold text-red-600">14 days</span>
                    </div>
                  </div>

                  <h4 className="font-semibold text-gray-900 mb-2">Grounds include:</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      Rent arrears (2+ months for 14-day notice)
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      Breach of occupation contract
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      Antisocial behaviour
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                <p className="text-blue-900 text-sm">
                  <strong>Pro tip:</strong> Section 178 is faster for rent arrears (14 days notice
                  for 2+ months arrears) but Section 173 does not require you to prove a ground.
                  Consider your circumstances carefully.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 173 Requirements in Detail */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Section 173: Requirements in Detail
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Section 173 has strict requirements. Missing any of these will invalidate your
                notice.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">6-Month Notice Period</h3>
                      <p className="text-gray-600 text-sm">
                        You must give at least 6 months&apos; notice. This is significantly longer
                        than England&apos;s 2-month Section 21.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">6-Month Occupation Rule</h3>
                      <p className="text-gray-600 text-sm">
                        You cannot serve a Section 173 notice in the first 6 months of the
                        contract-holder&apos;s occupation.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Home className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">6-Month Ownership Rule</h3>
                      <p className="text-gray-600 text-sm">
                        You must have been the landlord of the property for at least 6 months
                        before serving the notice.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Written Statement Provided</h3>
                      <p className="text-gray-600 text-sm">
                        The contract-holder must have been given a written statement of the
                        occupation contract within 14 days of occupation.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-amber-900 font-medium">Earliest Section 173 Timeline</p>
                    <p className="text-amber-800 text-sm">
                      Earliest you can serve: 6 months after occupation starts. Earliest the
                      contract-holder must leave: 12 months after occupation starts (6 months
                      occupation + 6 months notice).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Court Process */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Court Process in Wales
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                If the contract-holder does not leave after the notice expires, apply to the
                County Court for a possession order.
              </p>

              <div className="space-y-6">
                {/* Step 1 */}
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-white">1</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        Complete Possession Claim Forms
                      </h3>
                      <p className="text-gray-600">
                        Use the appropriate forms for Wales. These are similar to England&apos;s
                        forms but adapted for the Renting Homes Act.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-white">2</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        Submit to County Court & Pay Fee
                      </h3>
                      <p className="text-gray-600 mb-3">
                        Submit your claim to the County Court covering the property. Court fees are
                        the same as England.
                      </p>
                      <div className="bg-gray-50 rounded-lg p-3 inline-block">
                        <span className="text-gray-600 text-sm">Court fee: </span>
                        <span className="font-bold text-gray-900">£355</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-white">3</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        Court Hearing
                      </h3>
                      <p className="text-gray-600">
                        The court schedules a hearing. Both parties can attend. The judge reviews
                        whether the notice was valid and requirements met.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        Possession Order Granted
                      </h3>
                      <p className="text-gray-600">
                        If successful, the court grants a possession order. If the contract-holder
                        still refuses to leave, apply for a warrant of possession.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Rent Recovery */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Recovering Rent Arrears in Wales
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Rent recovery in Wales uses the County Court, similar to England.
              </p>

              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-start gap-4">
                  <PoundSterling className="w-6 h-6 text-gray-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Money Claims in Wales</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Wales uses the County Court for money claims, the same as England. You can
                      use Money Claim Online (MCOL) for claims under £100,000. However, our Money
                      Claim Pack is currently optimised for England&apos;s specific forms and
                      processes.
                    </p>
                    <div className="bg-amber-50 rounded-lg p-3 text-sm text-amber-800">
                      <AlertTriangle className="w-4 h-4 inline mr-1" />
                      Note: Our Money Claim Pack is currently for England only. Wales landlords can
                      use MCOL directly with similar processes.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Ask Heaven Callout */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-purple-900 mb-2">
                      Questions About Wales Eviction?
                    </h3>
                    <p className="text-purple-800 mb-4">
                      The Renting Homes (Wales) Act 2016 is different from English law. Use our
                      free Ask Heaven tool to get answers specific to Welsh law, Section 173, and
                      Section 178.
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

        {/* Mid-page CTA */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <SeoCtaBlock
                pageType="court"
                variant="section"
                jurisdiction="wales"
                pagePath="/eviction-process-wales"
                title="Get Your Wales Eviction Documents"
                description="Section 173 and Section 178 notices, court forms, and step-by-step instructions for Welsh landlords. Renting Homes Act compliant."
              />
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <FAQSection
          faqs={evictionWalesFAQs}
          title="Wales Eviction: Frequently Asked Questions"
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
                jurisdiction="wales"
                pagePath="/eviction-process-wales"
                title="Get Your Wales Eviction Pack"
                description="Section 173 & 178 notices, court forms, and Renting Homes Act guidance. Designed for Welsh landlords."
              />

              <SeoDisclaimer className="max-w-4xl mx-auto" />
            </div>
          </div>
        </section>

        {/* Related Resources */}
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
