import { Metadata } from 'next';
import Link from 'next/link';
import { StructuredData } from '@/lib/seo/structured-data';
import { Section21Countdown } from '@/components/ui/Section21Countdown';
import { SocialProofCounter } from '@/components/ui/SocialProofCounter';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { productLinks, toolLinks, blogLinks, landingPageLinks } from '@/lib/seo/internal-links';
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
  Home,
  Users
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Eviction Notice Template UK - Free Download | Landlord Heaven',
  description: 'Download free UK eviction notice templates. Section 21 (no-fault) and Section 8 (grounds-based) notices. Court-ready documents trusted by 10,000+ landlords.',
  keywords: [
    'eviction notice template uk',
    'eviction notice template',
    'landlord eviction notice',
    'section 21 eviction',
    'section 8 eviction',
    'tenant eviction notice',
    'eviction letter template',
  ],
  openGraph: {
    title: 'Eviction Notice Template UK - Free Download | Landlord Heaven',
    description: 'Download free UK eviction notice templates. Section 21 and Section 8 notices. Court-ready documents.',
    type: 'website',
  },
};

export default function EvictionNoticeTemplatePage() {
  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Eviction Notice Template UK',
    description: 'Free UK eviction notice templates for landlords. Section 21 and Section 8 notices.',
    url: 'https://landlordheaven.co.uk/eviction-notice-template',
    mainEntity: {
      '@type': 'Product',
      name: 'UK Eviction Notice Templates',
      description: 'Court-ready eviction notices for UK landlords',
      offers: {
        '@type': 'AggregateOffer',
        lowPrice: '0',
        highPrice: '49.99',
        priceCurrency: 'GBP',
        offerCount: '3',
      },
    },
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What types of eviction notices are there in the UK?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'In England, there are two main types: Section 21 (no-fault eviction) and Section 8 (grounds-based eviction). Section 21 requires no reason but ends May 2026. Section 8 requires proving specific grounds like rent arrears or antisocial behaviour.',
        },
      },
      {
        '@type': 'Question',
        name: 'How much notice do I need to give a tenant?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Section 21 requires a minimum of 2 months notice. Section 8 notice periods vary by ground - from 2 weeks for serious rent arrears to 2 months for other grounds.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I evict a tenant without a reason?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Currently yes, using a Section 21 notice. However, this ends on 1 May 2026 when the Renters Rights Act takes effect. After that, all evictions will require proving specific grounds under Section 8.',
        },
      },
      {
        '@type': 'Question',
        name: 'Which eviction notice should I use?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Use Section 21 for no-fault eviction (e.g., selling property, moving in yourself). Use Section 8 if the tenant has breached the tenancy (rent arrears, damage, antisocial behaviour). You can serve both notices simultaneously.',
        },
      },
      {
        '@type': 'Question',
        name: 'What happens after I serve an eviction notice?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'After the notice period expires, if the tenant does not leave, you must apply to court for a possession order. You cannot force the tenant to leave without a court order and bailiff warrant.',
        },
      },
      {
        '@type': 'Question',
        name: 'Are eviction notice templates legally valid?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, if they use the correct prescribed forms. Section 21 requires Form 6A, and Section 8 has its own prescribed format. Our court-ready templates use official government formats.',
        },
      },
    ],
  };

  return (
    <>
      <StructuredData data={pageSchema} />
      <StructuredData data={faqSchema} />

      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-gray-50 to-white py-12 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {/* Urgency Badge */}
              <div className="flex items-center justify-center gap-2 mb-6">
                <span className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                  <AlertTriangle className="w-4 h-4" />
                  Section 21 ends 1 May 2026
                </span>
                <Section21Countdown variant="badge" />
              </div>

              {/* H1 with target keyword */}
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 text-center mb-6">
                Eviction Notice Template UK
              </h1>

              <p className="text-xl text-gray-600 text-center mb-8 max-w-2xl mx-auto">
                Download free <strong>eviction notice templates</strong> for Section 21 and Section 8.
                Court-ready documents trusted by over 10,000 UK landlords.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Link
                  href="/tools/free-section-21-notice-generator"
                  className="inline-flex items-center justify-center gap-2 bg-white border-2 border-gray-200 hover:border-primary text-gray-900 font-semibold py-4 px-8 rounded-xl transition-all"
                >
                  <Download className="w-5 h-5" />
                  Try Free Template
                </Link>
                <Link
                  href="/products/notice-only"
                  className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold py-4 px-8 rounded-xl transition-colors"
                >
                  Get Court-Ready Notice — £29.99
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>

              {/* Trust Signals */}
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Section 21 & 8 Included
                </span>
                <span className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-500" />
                  Court-Ready Guaranteed
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-green-500" />
                  Ready in 5 Minutes
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="py-6 bg-gray-50 border-y border-gray-100">
          <div className="container mx-auto px-4">
            <SocialProofCounter variant="total" className="justify-center" />
          </div>
        </section>

        {/* Types of Eviction Notices */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Types of Eviction Notices in the UK
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Choose the right eviction notice based on your situation. We help you generate
                court-ready documents for all notice types.
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Section 21 */}
                <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Home className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Section 21 Notice</h3>
                      <span className="text-sm text-gray-500">No-Fault Eviction</span>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">
                    End an assured shorthold tenancy without giving a reason. Requires 2 months&apos; notice
                    and compliance with deposit protection rules.
                  </p>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      No reason required
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      2 months minimum notice
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      Ends 1 May 2026
                    </li>
                  </ul>
                  <Link
                    href="/section-21-notice-template"
                    className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
                  >
                    Get Section 21 Template
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                {/* Section 8 */}
                <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Scale className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Section 8 Notice</h3>
                      <span className="text-sm text-gray-500">Grounds-Based Eviction</span>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Evict a tenant for specific reasons such as rent arrears, property damage, or
                    antisocial behaviour. Varies from 2 weeks to 2 months notice.
                  </p>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      17 grounds available
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Can use alongside Section 21
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Remains after 2026 reform
                    </li>
                  </ul>
                  <Link
                    href="/section-8-notice-template"
                    className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
                  >
                    Get Section 8 Template
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Which to choose callout */}
              <div className="mt-8 bg-primary/5 rounded-xl p-6 border border-primary/20">
                <div className="flex items-start gap-4">
                  <Users className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Not sure which notice to use?</h4>
                    <p className="text-gray-600 text-sm">
                      Our wizard analyses your situation and recommends the best eviction route.
                      You can even serve both notices together for maximum flexibility.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Free vs Paid Comparison */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Free Template vs Court-Ready Notice
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Our free templates help you understand the process. For guaranteed court acceptance,
                choose our court-ready version with AI compliance checking.
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Free Version */}
                <div className="bg-white rounded-2xl p-8 border border-gray-200">
                  <div className="text-center mb-6">
                    <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Free Template</span>
                    <div className="text-4xl font-bold text-gray-900 mt-2">£0</div>
                  </div>
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">Preview notice formats</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">Understand requirements</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">Educational use</span>
                    </li>
                    <li className="flex items-start gap-3 text-gray-400">
                      <X className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <span>Not valid for court</span>
                    </li>
                    <li className="flex items-start gap-3 text-gray-400">
                      <X className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <span>No compliance check</span>
                    </li>
                    <li className="flex items-start gap-3 text-gray-400">
                      <X className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <span>Watermarked</span>
                    </li>
                  </ul>
                  <Link
                    href="/tools/free-section-21-notice-generator"
                    className="block w-full text-center bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-900 font-semibold py-3 px-6 rounded-xl transition-colors"
                  >
                    Try Free Template
                  </Link>
                </div>

                {/* Paid Version */}
                <div className="bg-primary/5 rounded-2xl p-8 border-2 border-primary relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
                      Recommended
                    </span>
                  </div>
                  <div className="text-center mb-6">
                    <span className="text-sm font-medium text-primary uppercase tracking-wide">Court-Ready</span>
                    <div className="text-4xl font-bold text-gray-900 mt-2">£29.99</div>
                  </div>
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 font-medium">Section 21 & 8 included</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 font-medium">Guaranteed court acceptance</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 font-medium">AI compliance check</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 font-medium">Route recommendation</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 font-medium">Serving instructions</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 font-medium">Email support</span>
                    </li>
                  </ul>
                  <Link
                    href="/products/notice-only"
                    className="block w-full text-center bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                  >
                    Get Court-Ready Notice
                  </Link>
                </div>
              </div>

              {/* Savings callout */}
              <div className="mt-8 text-center">
                <p className="text-gray-600">
                  <span className="font-semibold text-green-600">Save £150-270</span> compared to
                  solicitor fees (typically £180-300 for eviction notices)
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                How to Get Your Eviction Notice
              </h2>
              <p className="text-gray-600 text-center mb-12">
                Generate your notice in 3 simple steps — no legal knowledge required
              </p>

              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-primary">1</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Tell Us Your Situation</h3>
                  <p className="text-gray-600 text-sm">
                    Property details, tenant info, and reason for eviction
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-primary">2</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">We Recommend the Best Route</h3>
                  <p className="text-gray-600 text-sm">
                    AI analyses your case and suggests optimal notice type
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-primary">3</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Download & Serve</h3>
                  <p className="text-gray-600 text-sm">
                    Get court-ready notice with serving instructions
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Urgency Section */}
        <section className="py-12 bg-primary text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-2xl lg:text-3xl font-bold mb-4">
                Section 21 Ends 1 May 2026
              </h2>
              <p className="text-white/90 mb-6 max-w-2xl mx-auto">
                The Renters&apos; Rights Act abolishes no-fault evictions.
                Act now if you need to evict without proving grounds.
              </p>
              <Section21Countdown variant="large" className="mb-8 [&_*]:text-white" />
              <Link
                href="/products/notice-only"
                className="inline-flex items-center gap-2 bg-white text-primary hover:bg-gray-100 font-semibold py-4 px-8 rounded-xl transition-colors"
              >
                Serve Your Notice Before the Deadline
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
                Eviction Notice Template FAQ
              </h2>

              <div className="space-y-6">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    What types of eviction notices are there in the UK?
                  </h3>
                  <p className="text-gray-600">
                    In England, there are two main types: Section 21 (no-fault eviction) and Section 8
                    (grounds-based eviction). Section 21 requires no reason but ends May 2026. Section 8
                    requires proving specific grounds like rent arrears or antisocial behaviour.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    How much notice do I need to give a tenant?
                  </h3>
                  <p className="text-gray-600">
                    Section 21 requires a minimum of 2 months notice. Section 8 notice periods vary by
                    ground - from 2 weeks for serious rent arrears to 2 months for other grounds.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Can I evict a tenant without a reason?
                  </h3>
                  <p className="text-gray-600">
                    Currently yes, using a Section 21 notice. However, this ends on 1 May 2026 when
                    the Renters&apos; Rights Act takes effect. After that, all evictions will require
                    proving specific grounds under Section 8.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Which eviction notice should I use?
                  </h3>
                  <p className="text-gray-600">
                    Use Section 21 for no-fault eviction (e.g., selling property, moving in yourself).
                    Use Section 8 if the tenant has breached the tenancy (rent arrears, damage, antisocial
                    behaviour). You can serve both notices simultaneously.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    What happens after I serve an eviction notice?
                  </h3>
                  <p className="text-gray-600">
                    After the notice period expires, if the tenant does not leave, you must apply to
                    court for a possession order. You cannot force the tenant to leave without a court
                    order and bailiff warrant.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Are eviction notice templates legally valid?
                  </h3>
                  <p className="text-gray-600">
                    Yes, if they use the correct prescribed forms. Section 21 requires Form 6A, and
                    Section 8 has its own prescribed format. Our court-ready templates use official
                    government formats.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto bg-gradient-to-br from-primary to-primary/90 rounded-3xl p-8 lg:p-12 text-white text-center">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Get Your Eviction Notice Template Now
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Don&apos;t risk an invalid notice. Generate a court-ready eviction notice in minutes
                and serve with confidence.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/tools/free-section-21-notice-generator"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold py-4 px-8 rounded-xl border border-white/30 transition-colors"
                >
                  <Download className="w-5 h-5" />
                  Try Free Template
                </Link>
                <Link
                  href="/products/notice-only"
                  className="inline-flex items-center justify-center gap-2 bg-white text-primary hover:bg-gray-100 font-semibold py-4 px-8 rounded-xl transition-colors"
                >
                  Get Court-Ready — £29.99
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
              <p className="mt-8 text-white/70 text-sm">
                Section 21 & 8 Included &bull; AI Compliance Check &bull; Court-Ready Guaranteed
              </p>
            </div>
          </div>
        </section>

        {/* Related Resources */}
        <section className="py-16 lg:py-20">
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
    </>
  );
}
