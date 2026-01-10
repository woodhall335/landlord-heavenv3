import { Metadata } from 'next';
import Link from 'next/link';
import { StructuredData } from '@/lib/seo/structured-data';
import { SocialProofCounter } from '@/components/ui/SocialProofCounter';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { productLinks, toolLinks, blogLinks, landingPageLinks } from '@/lib/seo/internal-links';
import { buildWizardLink } from '@/lib/wizard/buildWizardLink';
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
  Ban
} from 'lucide-react';

// Pre-built wizard links for Section 8 template page
const wizardLinkCompletePack = buildWizardLink({
  product: 'complete_pack',
  jurisdiction: 'england',
  src: 'template',
  topic: 'eviction',
});

const wizardLinkNoticeOnly = buildWizardLink({
  product: 'notice_only',
  jurisdiction: 'england',
  src: 'template',
  topic: 'eviction',
});

export const metadata: Metadata = {
  title: 'Section 8 Notice Template - Free Download',
  description: 'Download a free Section 8 notice template for grounds-based eviction. Rent arrears, antisocial behaviour, property damage. Court-ready documents for UK landlords.',
  keywords: [
    'section 8 notice template',
    'section 8 eviction notice',
    'section 8 notice form',
    'grounds for eviction',
    'rent arrears eviction',
    'eviction for antisocial behaviour',
    'landlord eviction grounds',
  ],
  openGraph: {
    title: 'Section 8 Notice Template - Free Download | Landlord Heaven',
    description: 'Download a free Section 8 notice template for grounds-based eviction. Court-ready documents for UK landlords.',
    type: 'website',
  },
};

export default function Section8NoticeTemplatePage() {
  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Section 8 Notice Template',
    description: 'Free Section 8 notice template for grounds-based eviction. Covers rent arrears, antisocial behaviour, and more.',
    url: 'https://landlordheaven.co.uk/section-8-notice-template',
    mainEntity: {
      '@type': 'Product',
      name: 'Section 8 Notice Template',
      description: 'Court-ready Section 8 eviction notice for UK landlords',
      offers: {
        '@type': 'AggregateOffer',
        lowPrice: '0',
        highPrice: '199.99',
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
        name: 'What is a Section 8 notice?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'A Section 8 notice is a formal notice used by landlords to seek possession of a property based on specific grounds, such as rent arrears, antisocial behaviour, or breach of tenancy agreement. Unlike Section 21, you must prove the grounds in court.',
        },
      },
      {
        '@type': 'Question',
        name: 'What are the grounds for Section 8 eviction?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'There are 17 grounds for Section 8 eviction, split into mandatory (court must grant possession) and discretionary (court may grant possession). Common grounds include rent arrears over 2 months (Ground 8), antisocial behaviour (Ground 14), and breach of tenancy (Ground 12).',
        },
      },
      {
        '@type': 'Question',
        name: 'What notice period is required for Section 8?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Notice periods vary by ground. Serious rent arrears (Ground 8) and antisocial behaviour require only 2 weeks notice. Most other grounds require 2 months notice. The notice remains valid for 12 months.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is Section 8 better than Section 21?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'It depends on your situation. Section 8 can be faster for rent arrears (2 weeks notice vs 2 months) but requires proving grounds in court. Section 21 is simpler but ends May 2026. Many landlords serve both notices together.',
        },
      },
      {
        '@type': 'Question',
        name: 'Will Section 8 still work after May 2026?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. The Renters Rights Act only abolishes Section 21 (no-fault eviction). Section 8 grounds-based eviction will continue, though some grounds may be modified. This makes understanding Section 8 essential for future evictions.',
        },
      },
      {
        '@type': 'Question',
        name: 'How much rent arrears for Section 8?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'For mandatory Ground 8, the tenant must be at least 2 months (8 weeks) in arrears when you serve the notice AND when the court hearing takes place. For discretionary Ground 10, any amount of arrears may be sufficient.',
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
        <section className="bg-gradient-to-br from-purple-50 via-purple-100 to-purple-50 pt-28 pb-16 md:pt-32 md:pb-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {/* Future-proof Badge */}
              <div className="flex items-center justify-center gap-2 mb-6">
                <span className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
                  <CheckCircle className="w-4 h-4" />
                  Works after May 2026
                </span>
              </div>

              {/* Jurisdiction Notice - England Only */}
              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 rounded-r-lg max-w-2xl mx-auto">
                <p className="text-amber-900 text-sm">
                  <strong>England only:</strong> Section 8 notices apply to <strong>England only</strong>.
                  Different eviction grounds and processes apply in{' '}
                  <Link href="/wales-eviction-notices" className="text-amber-700 underline hover:text-amber-900">
                    Wales (Renting Homes Act)
                  </Link>{' '}
                  and{' '}
                  <Link href="/scotland-eviction-notices" className="text-amber-700 underline hover:text-amber-900">
                    Scotland (PRT eviction grounds)
                  </Link>.
                </p>
              </div>

              {/* H1 with target keyword */}
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 text-center mb-6">
                Section 8 Notice Template
              </h1>

              <p className="text-xl text-gray-600 text-center mb-8 max-w-2xl mx-auto">
                Download a free <strong>Section 8 notice template</strong> for grounds-based eviction.
                Rent arrears, antisocial behaviour, property damage and more.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Link
                  href="/tools/free-section-8-notice-generator"
                  className="hero-btn-secondary inline-flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Try Free Template
                </Link>
                <Link
                  href={wizardLinkCompletePack}
                  className="hero-btn-primary inline-flex items-center justify-center gap-2"
                >
                  Get Complete Pack — £199.99
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>

              {/* Trust Signals */}
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  17 Grounds Covered
                </span>
                <span className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-500" />
                  Designed for Court Acceptance
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

        {/* Common Grounds */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Common Section 8 Eviction Grounds
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Section 8 has 17 different grounds for eviction. Here are the most commonly used,
                split into mandatory and discretionary categories.
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Mandatory Grounds */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <Gavel className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Mandatory Grounds</h3>
                      <span className="text-sm text-gray-500">Court must grant possession</span>
                    </div>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <PoundSterling className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium text-gray-900">Ground 8</span>
                        <p className="text-sm text-gray-600">2+ months rent arrears</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <Home className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium text-gray-900">Ground 1</span>
                        <p className="text-sm text-gray-600">Landlord previously lived there</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <Ban className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium text-gray-900">Ground 7A</span>
                        <p className="text-sm text-gray-600">Serious antisocial behaviour</p>
                      </div>
                    </li>
                  </ul>
                </div>

                {/* Discretionary Grounds */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                      <Scale className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Discretionary Grounds</h3>
                      <span className="text-sm text-gray-500">Court may grant possession</span>
                    </div>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <PoundSterling className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium text-gray-900">Ground 10 & 11</span>
                        <p className="text-sm text-gray-600">Any rent arrears (past or present)</p>
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

              {/* Recommendation */}
              <div className="mt-8 bg-primary/5 rounded-xl p-6 border border-primary/20">
                <div className="flex items-start gap-4">
                  <Shield className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Maximise your success</h4>
                    <p className="text-gray-600 text-sm">
                      For rent arrears cases, we recommend citing both Ground 8 (mandatory) and Ground 10/11
                      (discretionary). This gives you a backup if arrears drop below 2 months before the hearing.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 8 vs Section 21 */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Section 8 vs Section 21: Which Should You Use?
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Understanding when to use each type of eviction notice can save you time and money.
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
                      <td className="p-4 text-center text-gray-700">Yes - must prove grounds</td>
                      <td className="p-4 text-center text-gray-700">No - no fault needed</td>
                    </tr>
                    <tr>
                      <td className="p-4 text-gray-700">Minimum notice</td>
                      <td className="p-4 text-center text-gray-700">2 weeks - 2 months</td>
                      <td className="p-4 text-center text-gray-700">2 months</td>
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
                      <td className="p-4 text-center text-gray-700">Yes - prove grounds</td>
                      <td className="p-4 text-center text-gray-700">Usually paper-based</td>
                    </tr>
                    <tr>
                      <td className="p-4 text-gray-700">Best for</td>
                      <td className="p-4 text-center text-gray-700">Rent arrears, breach, ASB</td>
                      <td className="p-4 text-center text-gray-700">Selling, moving back in</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-8 text-center">
                <p className="text-gray-600 mb-4">
                  <strong>Pro tip:</strong> Many landlords serve both Section 8 and Section 21 notices
                  together for maximum flexibility.
                </p>
                <Link
                  href={wizardLinkNoticeOnly}
                  className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
                >
                  Get both notices for £39.99
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
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
                Our free Section 8 template helps you understand the process. For court proceedings,
                choose our Complete Pack with AI ground recommendation.
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
                      <span className="text-gray-600">Preview Section 8 format</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">Understand ground requirements</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">Educational purposes</span>
                    </li>
                    <li className="flex items-start gap-3 text-gray-400">
                      <X className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <span>No ground recommendations</span>
                    </li>
                    <li className="flex items-start gap-3 text-gray-400">
                      <X className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <span>Watermarked document</span>
                    </li>
                    <li className="flex items-start gap-3 text-gray-400">
                      <X className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <span>No evidence guidance</span>
                    </li>
                  </ul>
                  <Link
                    href="/tools/free-section-8-notice-generator"
                    className="block w-full text-center bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-900 font-semibold py-3 px-6 rounded-xl transition-colors"
                  >
                    Try Free Template
                  </Link>
                </div>

                {/* Paid Version */}
                <div className="bg-primary/5 rounded-2xl p-8 border-2 border-primary relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
                      Best Value
                    </span>
                  </div>
                  <div className="text-center mb-6">
                    <span className="text-sm font-medium text-primary uppercase tracking-wide">Complete Pack</span>
                    <div className="text-4xl font-bold text-gray-900 mt-2">£199.99</div>
                  </div>
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 font-medium">Section 8 + Section 21 notices</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 font-medium">AI ground recommendations</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 font-medium">Evidence checklist per ground</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 font-medium">Court forms (N5, N5B, N119)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 font-medium">Witness statement template</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 font-medium">Email support</span>
                    </li>
                  </ul>
                  <Link
                    href={wizardLinkCompletePack}
                    className="block w-full text-center bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                  >
                    Get Complete Pack
                  </Link>
                </div>
              </div>

              {/* Notice Only option */}
              <div className="mt-8 text-center">
                <p className="text-gray-600">
                  Just need the notice? Get{' '}
                  <Link href={wizardLinkNoticeOnly} className="text-primary font-medium hover:underline">
                    Notice Only for £39.99
                  </Link>
                  {' '}(Section 8 + Section 21 included)
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
                How to Get Your Section 8 Notice
              </h2>
              <p className="text-gray-600 text-center mb-12">
                Generate your notice in 4 simple steps with AI-powered ground selection
              </p>

              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl font-bold text-primary">1</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Describe Situation</h3>
                  <p className="text-gray-600 text-sm">
                    Tell us about the issue (arrears, breach, ASB)
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl font-bold text-primary">2</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">AI Recommends Grounds</h3>
                  <p className="text-gray-600 text-sm">
                    We suggest the strongest grounds for your case
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl font-bold text-primary">3</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Evidence Checklist</h3>
                  <p className="text-gray-600 text-sm">
                    Get a list of evidence needed for court
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl font-bold text-primary">4</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Download & Serve</h3>
                  <p className="text-gray-600 text-sm">
                    Court-ready notice with instructions
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Future-Proof Banner */}
        <section className="py-12 bg-green-600 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-2xl lg:text-3xl font-bold mb-4">
                Section 8 Works After May 2026
              </h2>
              <p className="text-white/90 mb-6 max-w-2xl mx-auto">
                While Section 21 is being abolished, Section 8 grounds-based eviction continues.
                Understanding Section 8 is essential for all future evictions in England.
              </p>
              <Link
                href={wizardLinkCompletePack}
                className="inline-flex items-center gap-2 bg-white text-green-600 hover:bg-gray-100 font-semibold py-4 px-8 rounded-xl transition-colors"
              >
                Get Your Section 8 Notice Now
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
                Section 8 Notice Template FAQ
              </h2>

              <div className="space-y-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    What is a Section 8 notice?
                  </h3>
                  <p className="text-gray-600">
                    A Section 8 notice is a formal notice used by landlords to seek possession of a
                    property based on specific grounds, such as rent arrears, antisocial behaviour, or
                    breach of tenancy agreement. Unlike Section 21, you must prove the grounds in court.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    What are the grounds for Section 8 eviction?
                  </h3>
                  <p className="text-gray-600">
                    There are 17 grounds for Section 8 eviction, split into mandatory (court must grant
                    possession) and discretionary (court may grant possession). Common grounds include
                    rent arrears over 2 months (Ground 8), antisocial behaviour (Ground 14), and breach
                    of tenancy (Ground 12).
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    What notice period is required for Section 8?
                  </h3>
                  <p className="text-gray-600">
                    Notice periods vary by ground. Serious rent arrears (Ground 8) and antisocial
                    behaviour require only 2 weeks notice. Most other grounds require 2 months notice.
                    The notice remains valid for 12 months.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Is Section 8 better than Section 21?
                  </h3>
                  <p className="text-gray-600">
                    It depends on your situation. Section 8 can be faster for rent arrears (2 weeks
                    notice vs 2 months) but requires proving grounds in court. Section 21 is simpler
                    but ends May 2026. Many landlords serve both notices together.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Will Section 8 still work after May 2026?
                  </h3>
                  <p className="text-gray-600">
                    Yes. The Renters&apos; Rights Act only abolishes Section 21 (no-fault eviction).
                    Section 8 grounds-based eviction will continue, though some grounds may be modified.
                    This makes understanding Section 8 essential for future evictions.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    How much rent arrears for Section 8?
                  </h3>
                  <p className="text-gray-600">
                    For mandatory Ground 8, the tenant must be at least 2 months (8 weeks) in arrears
                    when you serve the notice AND when the court hearing takes place. For discretionary
                    Ground 10, any amount of arrears may be sufficient.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto bg-gradient-to-br from-primary to-primary/90 rounded-3xl p-8 lg:p-12 text-white text-center">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Get Your Section 8 Notice Template Now
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                AI-powered ground recommendations. Evidence checklists. Court-ready format.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/tools/free-section-8-notice-generator"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold py-4 px-8 rounded-xl border border-white/30 transition-colors"
                >
                  <Download className="w-5 h-5" />
                  Try Free Template
                </Link>
                <Link
                  href={wizardLinkCompletePack}
                  className="inline-flex items-center justify-center gap-2 bg-white text-primary hover:bg-gray-100 font-semibold py-4 px-8 rounded-xl transition-colors"
                >
                  Get Complete Pack — £199.99
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
              <p className="mt-8 text-white/70 text-sm">
                17 Grounds Covered &bull; AI Recommendations &bull; Designed for Court Acceptance
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
                    Already have a Section 8 notice?
                  </p>
                  <p className="text-gray-600">
                    Use our free{' '}
                    <Link href="/tools/validators/section-8" className="text-primary font-medium hover:underline">
                      Section 8 grounds checker
                    </Link>{' '}
                    to verify your grounds are properly stated and your notice is court-ready.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Ask Heaven callout */}
        <section className="py-8 bg-purple-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-4">
                <span className="text-4xl">☁️</span>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">
                    Not sure which eviction ground applies to your situation?
                  </p>
                  <p className="text-gray-600">
                    Our free{' '}
                    <Link href="/ask-heaven" className="text-primary font-medium hover:underline">
                      Ask Heaven landlord Q&amp;A tool
                    </Link>{' '}
                    can help you understand your options for rent arrears, antisocial behaviour, and more.
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
