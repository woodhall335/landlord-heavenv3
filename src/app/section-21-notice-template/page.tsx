import { Metadata } from 'next';
import Link from 'next/link';
import { StructuredData } from '@/lib/seo/structured-data';
import { Section21Countdown } from '@/components/ui/Section21Countdown';
import { SocialProofCounter } from '@/components/ui/SocialProofCounter';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { productLinks, toolLinks, blogLinks, landingPageLinks } from '@/lib/seo/internal-links';
import { buildWizardLink } from '@/lib/wizard/buildWizardLink';
import { buildAskHeavenLink } from '@/lib/ask-heaven/buildAskHeavenLink';
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
  PoundSterling
} from 'lucide-react';

// Pre-built wizard link for Section 21 template page
const wizardLink = buildWizardLink({
  product: 'notice_only',
  jurisdiction: 'england',
  src: 'template',
  topic: 'eviction',
});

// Pre-built Ask Heaven compliance links for Section 21 page
const complianceLinks = {
  deposit: buildAskHeavenLink({
    source: 'page_cta',
    topic: 'deposit',
    prompt: 'Can I serve Section 21 if deposit is not protected?',
    utm_campaign: 'section-21-notice-template',
  }),
  gasSafety: buildAskHeavenLink({
    source: 'page_cta',
    topic: 'gas_safety',
    prompt: 'Do I need gas safety certificate for Section 21?',
    utm_campaign: 'section-21-notice-template',
  }),
  epc: buildAskHeavenLink({
    source: 'page_cta',
    topic: 'epc',
    prompt: 'Is EPC required before serving Section 21 notice?',
    utm_campaign: 'section-21-notice-template',
  }),
  howToRent: buildAskHeavenLink({
    source: 'page_cta',
    topic: 'eviction',
    prompt: 'Do I need to provide How to Rent guide for Section 21?',
    utm_campaign: 'section-21-notice-template',
  }),
};

export const metadata: Metadata = {
  title: 'Section 21 Notice Template - Form 6A Free',
  description: 'Download a free Section 21 notice template or generate a court-ready Form 6A in minutes. Valid until May 2026. Trusted by 10,000+ UK landlords.',
  keywords: [
    'section 21 notice template',
    'section 21 template',
    'form 6a template',
    'section 21 notice form',
    'no fault eviction template',
    'eviction notice template',
  ],
  openGraph: {
    title: 'Section 21 Notice Template - Free Download | Landlord Heaven',
    description: 'Get a free Section 21 notice template or generate a court-ready Form 6A. Valid until May 2026.',
    type: 'website',
  },
};

export default function Section21NoticeTemplatePage() {
  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Section 21 Notice Template',
    description: 'Free Section 21 notice template and court-ready Form 6A generator for UK landlords.',
    url: 'https://landlordheaven.co.uk/section-21-notice-template',
    mainEntity: {
      '@type': 'Product',
      name: 'Section 21 Notice (Form 6A)',
      description: 'Court-ready Section 21 eviction notice for UK landlords',
      offers: {
        '@type': 'AggregateOffer',
        lowPrice: '0',
        highPrice: '39.99',
        priceCurrency: 'GBP',
        offerCount: '2',
      },
    },
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Is the Section 21 notice template free?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, we offer a free Section 21 notice template that you can preview. For a court-ready version that is guaranteed to be accepted, the cost is £39.99.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is Form 6A?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Form 6A is the official prescribed form for Section 21 notices in England. Using any other format can make your notice invalid.',
        },
      },
      {
        '@type': 'Question',
        name: 'How long is Section 21 notice valid?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'A Section 21 notice is valid for 6 months after it expires. You must start court proceedings within this time.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I still use Section 21 in 2026?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Section 21 notices can only be served until 30 April 2026. After 1 May 2026, the Section 21 ban takes effect and no-fault evictions will no longer be possible.',
        },
      },
      {
        '@type': 'Question',
        name: 'What notice period is required for Section 21?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The minimum notice period for a Section 21 notice is 2 months. The notice cannot expire before the end of any fixed term tenancy.',
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

              {/* Jurisdiction Notice - England Only */}
              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 rounded-r-lg max-w-2xl mx-auto">
                <p className="text-amber-900 text-sm">
                  <strong>England only:</strong> Section 21 notices apply to <strong>England only</strong>.
                  Different rules apply in{' '}
                  <Link href="/wales-eviction-notices" className="text-amber-700 underline hover:text-amber-900">
                    Wales (Renting Homes Act)
                  </Link>{' '}
                  and{' '}
                  <Link href="/scotland-eviction-notices" className="text-amber-700 underline hover:text-amber-900">
                    Scotland (Notice to Leave)
                  </Link>.
                </p>
              </div>

              {/* H1 with target keyword */}
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 text-center mb-6">
                Section 21 Notice Template
              </h1>

              <p className="text-xl text-gray-600 text-center mb-8 max-w-2xl mx-auto">
                Download a free <strong>Section 21 notice template</strong> or generate a
                court-ready <strong>Form 6A</strong> in minutes. Trusted by over 10,000 UK landlords.
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
                  href={wizardLink}
                  className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold py-4 px-8 rounded-xl transition-colors"
                >
                  Get Court-Ready Notice — £39.99
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>

              {/* Trust Signals */}
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Official Form 6A
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

        {/* Free vs Paid Comparison */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Free Template vs Court-Ready Notice
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Our free Section 21 template is great for understanding the process, but for
                guaranteed court acceptance, choose our court-ready version.
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Free Version */}
                <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
                  <div className="text-center mb-6">
                    <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Free Template</span>
                    <div className="text-4xl font-bold text-gray-900 mt-2">£0</div>
                  </div>
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">Preview Section 21 format</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">Understand notice requirements</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">Educational purposes</span>
                    </li>
                    <li className="flex items-start gap-3 text-gray-400">
                      <X className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <span>Not valid for court use</span>
                    </li>
                    <li className="flex items-start gap-3 text-gray-400">
                      <X className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <span>Watermarked document</span>
                    </li>
                    <li className="flex items-start gap-3 text-gray-400">
                      <X className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <span>No compliance check</span>
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
                    <div className="text-4xl font-bold text-gray-900 mt-2">£39.99</div>
                  </div>
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 font-medium">Official Form 6A</span>
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
                      <span className="text-gray-700 font-medium">Pre-filled with your details</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 font-medium">Serving instructions included</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 font-medium">Email support</span>
                    </li>
                  </ul>
                  <Link
                    href={wizardLink}
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
                  solicitor fees (typically £180-300 for Section 21 notices)
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                How to Get Your Section 21 Template
              </h2>
              <p className="text-gray-600 text-center mb-12">
                Generate your notice in 3 simple steps — no legal knowledge required
              </p>

              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-primary">1</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Enter Details</h3>
                  <p className="text-gray-600 text-sm">
                    Property address, tenant names, and tenancy information
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-primary">2</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">AI Compliance Check</h3>
                  <p className="text-gray-600 text-sm">
                    Our system validates your notice meets all legal requirements
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-primary">3</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Download & Serve</h3>
                  <p className="text-gray-600 text-sm">
                    Get your court-ready Form 6A with serving instructions
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What's Included */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
                What's Included in Your Section 21 Notice
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start gap-4 p-6 bg-gray-50 rounded-xl">
                  <FileText className="w-8 h-8 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Official Form 6A</h3>
                    <p className="text-gray-600 text-sm">
                      The prescribed form required for all Section 21 notices in England
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-6 bg-gray-50 rounded-xl">
                  <Shield className="w-8 h-8 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Compliance Validation</h3>
                    <p className="text-gray-600 text-sm">
                      AI checks your notice meets all current legal requirements
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-6 bg-gray-50 rounded-xl">
                  <Gavel className="w-8 h-8 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Court-Ready Format</h3>
                    <p className="text-gray-600 text-sm">
                      Guaranteed to be accepted by county courts
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-6 bg-gray-50 rounded-xl">
                  <Clock className="w-8 h-8 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Serving Instructions</h3>
                    <p className="text-gray-600 text-sm">
                      Step-by-step guide on how to properly serve the notice
                    </p>
                  </div>
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
                The Renters&apos; Rights Act abolishes Section 21 no-fault evictions.
                After this date, you&apos;ll only be able to evict using Section 8 (which requires proving grounds).
              </p>
              <Section21Countdown variant="large" className="mb-8 [&_*]:text-white" />
              <Link
                href={wizardLink}
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
                Section 21 Notice Template FAQ
              </h2>

              <div className="space-y-6">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Is the Section 21 notice template free?
                  </h3>
                  <p className="text-gray-600">
                    Yes, we offer a free Section 21 notice template that you can preview and use
                    for educational purposes. For a court-ready version that is guaranteed to be
                    accepted, the cost is £39.99.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    What is Form 6A?
                  </h3>
                  <p className="text-gray-600">
                    Form 6A is the official prescribed form for Section 21 notices in England.
                    It was introduced in 2015 and is the only valid format for no-fault eviction
                    notices. Using any other format or an outdated version can make your notice invalid.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    How long is a Section 21 notice valid?
                  </h3>
                  <p className="text-gray-600">
                    A Section 21 notice is valid for 6 months after it expires. This means you
                    must start court proceedings within 6 months of the notice expiry date, or
                    you&apos;ll need to serve a new notice.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Can I still use Section 21 in 2026?
                  </h3>
                  <p className="text-gray-600">
                    Section 21 notices can only be served until 30 April 2026. After 1 May 2026,
                    the Section 21 ban takes effect and no-fault evictions will no longer be
                    possible in England. You&apos;ll need to use Section 8 instead.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    What notice period is required for Section 21?
                  </h3>
                  <p className="text-gray-600">
                    The minimum notice period for a Section 21 notice is 2 months. The notice
                    cannot expire before the end of any fixed term tenancy. For periodic tenancies,
                    it must expire on the last day of a rental period.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    What documents do I need before serving Section 21?
                  </h3>
                  <p className="text-gray-600">
                    Before serving a valid Section 21 notice, you must have: protected the deposit
                    in a government scheme, provided the tenant with an EPC, Gas Safety Certificate
                    (if applicable), the &quot;How to Rent&quot; guide, and the deposit prescribed information.
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
                Get Your Section 21 Notice Template Now
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Don&apos;t risk an invalid notice. Generate a court-ready Form 6A in minutes
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
                  href={wizardLink}
                  className="inline-flex items-center justify-center gap-2 bg-white text-primary hover:bg-gray-100 font-semibold py-4 px-8 rounded-xl transition-colors"
                >
                  Get Court-Ready — £39.99
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
              <p className="mt-8 text-white/70 text-sm">
                Official Form 6A &bull; AI Compliance Check &bull; Court-Ready Guaranteed
              </p>
            </div>
          </div>
        </section>

        {/* Already have a notice? Validator callout */}
        <section className="py-8 bg-blue-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-4">
                <span className="text-4xl">✅</span>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">
                    Already have a Section 21 notice?
                  </p>
                  <p className="text-gray-600">
                    Use our free{' '}
                    <Link href="/tools/validators/section-21" className="text-primary font-medium hover:underline">
                      Section 21 validity checker
                    </Link>{' '}
                    to check if your notice is court-ready before serving it.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Ask Heaven compliance callout */}
        <section className="py-8 bg-purple-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-start gap-4 mb-4">
                <span className="text-4xl">☁️</span>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">
                    Before serving Section 21, check your compliance
                  </p>
                  <p className="text-gray-600 text-sm">
                    A Section 21 notice can be invalid if you haven&apos;t met all compliance requirements.
                    Ask our free{' '}
                    <Link href="/ask-heaven?src=page_cta&topic=eviction" className="text-primary font-medium hover:underline">
                      Ask Heaven Q&amp;A tool
                    </Link>{' '}
                    about your specific situation.
                  </p>
                </div>
              </div>
              <div className="grid sm:grid-cols-4 gap-2 ml-14">
                <Link
                  href={complianceLinks.deposit}
                  className="text-xs bg-white border border-purple-200 hover:border-primary text-gray-700 hover:text-primary px-3 py-2 rounded-lg transition-colors text-center"
                >
                  Deposit rules →
                </Link>
                <Link
                  href={complianceLinks.gasSafety}
                  className="text-xs bg-white border border-purple-200 hover:border-primary text-gray-700 hover:text-primary px-3 py-2 rounded-lg transition-colors text-center"
                >
                  Gas safety →
                </Link>
                <Link
                  href={complianceLinks.epc}
                  className="text-xs bg-white border border-purple-200 hover:border-primary text-gray-700 hover:text-primary px-3 py-2 rounded-lg transition-colors text-center"
                >
                  EPC rules →
                </Link>
                <Link
                  href={complianceLinks.howToRent}
                  className="text-xs bg-white border border-purple-200 hover:border-primary text-gray-700 hover:text-primary px-3 py-2 rounded-lg transition-colors text-center"
                >
                  How to Rent →
                </Link>
              </div>
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
                  toolLinks.section21Validator,
                  toolLinks.section21Generator,
                  blogLinks.whatIsSection21,
                  blogLinks.howToServeNotice,
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
