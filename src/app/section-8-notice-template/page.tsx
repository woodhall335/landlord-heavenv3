import { Metadata } from 'next';
import Link from 'next/link';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { SocialProofCounter } from '@/components/ui/SocialProofCounter';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { productLinks, toolLinks, blogLinks, landingPageLinks } from '@/lib/seo/internal-links';
import { buildWizardLink } from '@/lib/wizard/buildWizardLink';
import { StandardHero } from '@/components/marketing/StandardHero';
import { FAQSection } from '@/components/seo/FAQSection';
import { section8NoticeTemplateFAQs } from '@/data/faqs';
import { FunnelCta, CrossSellBar } from '@/components/funnels';
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
  title: 'Section 8 Notice Template 2026 for Landlords | Free Form 3',
  description: 'Section 8 notice template for grounds-based eviction. Avoid delays and compliance errors. Free Form 3 template included.',
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
  ],
  alternates: {
    canonical: 'https://landlordheaven.co.uk/section-8-notice-template',
  },
  openGraph: {
    title: 'Section 8 Notice Template 2026 for Landlords | Free Form 3',
    description: 'Free Section 8 notice template for landlords in England. Serve the correct Form 3 with grounds, timelines, and compliance clarity.',
    type: 'website',
  },
};

export default function Section8NoticeTemplatePage() {
  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Section 8 Notice Template',
    description: 'Free Section 8 notice template for England grounds-based eviction. Covers rent arrears, antisocial behaviour, and more.',
    url: 'https://landlordheaven.co.uk/section-8-notice-template',
    mainEntity: {
      '@type': 'Product',
      name: 'Section 8 Notice Template',
      description: 'Court-ready Section 8 eviction notice for England landlords',
      offers: {
        '@type': 'AggregateOffer',
        lowPrice: '0',
        highPrice: '149.99',
        priceCurrency: 'GBP',
        offerCount: '2',
      },
    },
  };

  return (
    <>
      <StructuredData data={pageSchema} />
      <StructuredData data={breadcrumbSchema([
        { name: "Home", url: "https://landlordheaven.co.uk" },
        { name: "Templates", url: "https://landlordheaven.co.uk/eviction-notice-template" },
        { name: "Section 8 Notice Template", url: "https://landlordheaven.co.uk/section-8-notice-template" }
      ])} />

      <main>
        {/* Hero Section */}
        <StandardHero
          badge="Works after May 2026"
          badgeIcon={<CheckCircle className="w-4 h-4" />}
          title="Section 8 Notice (Form 3) — Free Template for England"
          subtitle={<>Download a free <strong>Section 8 notice</strong> template for England. You must serve notice on <Link href="/form-3-section-8" className="text-primary hover:underline">Form 3</Link>. Grounds-based eviction for rent arrears (Ground 8, 10, 11), antisocial behaviour, property damage and more.</>}
          primaryCTA={{ label: "Get Complete Pack — £199.99", href: wizardLinkCompletePack }}
          secondaryCTA={{ label: "Try Free Template", href: "/tools/free-section-8-notice-generator" }}
          variant="pastel"
        >
          {/* Jurisdiction Notice - England Only */}
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 rounded-r-lg max-w-2xl mx-auto text-left">
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
        </StandardHero>

        <section className="py-8 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <FunnelCta
                title="Prepare your Section 8 notice bundle"
                subtitle="Use Notice Only for compliant Form 3 drafting, or choose a full case bundle for court paperwork guidance."
                primaryHref="/products/notice-only"
                primaryText="Start Notice Only"
                primaryDataCta="notice-only"
                location="above-fold"
                secondaryLinks={[{ href: '/products/complete-pack', text: 'Need the full case bundle?', dataCta: 'complete-pack' }]}
              />
            </div>
          </div>
        </section>

        {/* Social Proof */}
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

        {/* Timeline + Evidence */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Section 8 Timeline, Costs & Evidence Checklist
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Section 8 is grounds-based, so the quality of evidence and compliance matters as much
                as the notice itself. Use this checklist to avoid delays.
              </p>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Notice period</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>Ground 8/10/11: 2 weeks for serious arrears.</li>
                    <li>Most other grounds: 2 months.</li>
                    <li>Notice valid for 12 months after service.</li>
                    <li>Typical possession timeline: 3–6 months.</li>
                  </ul>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Evidence to prepare</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>Rent schedule and arrears calculation.</li>
                    <li>Tenancy agreement + breach evidence.</li>
                    <li>Communication history with tenant.</li>
                    <li>Photos, reports, or witness statements.</li>
                  </ul>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Common mistakes</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>Choosing the wrong grounds.</li>
                    <li>Missing mandatory evidence at hearing.</li>
                    <li>Incorrect service method or dates.</li>
                    <li>Not linking grounds to specific facts.</li>
                  </ul>
                  <Link
                    href="/how-to-evict-tenant"
                    className="text-primary text-sm font-medium hover:underline inline-flex mt-3"
                  >
                    See the full eviction process →
                  </Link>
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
                  Get both notices for £49.99
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
                    className="hero-btn-secondary block w-full text-center"
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
                    className="hero-btn-primary block w-full text-center"
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
                    Notice Only for £49.99
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
                className="hero-btn-secondary inline-flex items-center gap-2"
              >
                Get Your Section 8 Notice Now
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
                subtitle="Serve the right notice now and keep your court options open."
                primaryHref="/products/notice-only"
                primaryText="Create Section 8 notice"
                primaryDataCta="notice-only"
                location="bottom"
                secondaryLinks={[{ href: '/products/complete-pack', text: 'Need the full case bundle?', dataCta: 'complete-pack' }]}
              />
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <FAQSection
          faqs={section8NoticeTemplateFAQs}
          title="Section 8 Notice Template FAQ"
          showContactCTA={false}
          variant="white"
        />

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
                  className="hero-btn-secondary inline-flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Try Free Template
                </Link>
                <Link
                  href={wizardLinkCompletePack}
                  className="hero-btn-secondary inline-flex items-center justify-center gap-2"
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
