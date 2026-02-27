import { Metadata } from 'next';
import Link from 'next/link';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { SocialProofCounter } from '@/components/ui/SocialProofCounter';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { productLinks, toolLinks, blogLinks, landingPageLinks } from '@/lib/seo/internal-links';
import { buildWizardLink } from '@/lib/wizard/buildWizardLink';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';
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
  src: 'seo_section_8_notice_template',
  topic: 'eviction',
});

const wizardLinkNoticeOnly = buildWizardLink({
  product: 'notice_only',
  jurisdiction: 'england',
  src: 'seo_section_8_notice_template',
  topic: 'eviction',
});

export const metadata: Metadata = {
  title: 'Section 8 Notice Template | Form 3 Download for Landlords',
  description: 'Section 8 notice template with Form 3 structure, grounds guidance, and timelines. Download free or build a court-ready notice for rent arrears and other breaches.',
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
    title: 'Section 8 Notice Template | Form 3 Download for Landlords',
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


  const enhancedFaqs = [
    ...section8NoticeTemplateFAQs,
    { question: "What is the biggest reason landlords get delayed?", answer: "The biggest delay driver is poor evidence and date inconsistencies. Keep a clean chronology, reconcile all amounts, and keep robust proof of service." },
    { question: "Should I keep copies of every letter and attachment?", answer: "Yes. Keep every version sent, all enclosures, and proof of service. Courts often focus on documentary quality when deciding credibility." },
    { question: "When should I move from template stage to paid workflow?", answer: "Move as soon as the matter may escalate to court, disputed arrears, or possession. A guided workflow reduces rejection risk and duplicated costs." },
  ];

  return (
    <>
      <StructuredData data={pageSchema} />
      <StructuredData data={breadcrumbSchema([
        { name: "Home", url: "https://landlordheaven.co.uk" },
        { name: "Templates", url: "https://landlordheaven.co.uk/eviction-notice-template" },
        { name: "Section 8 Notice Template", url: "https://landlordheaven.co.uk/section-8-notice-template" }
      ])} />

      <HeaderConfig mode="autoOnScroll" />
      <main>
        {/* Hero Section */}
        <UniversalHero
          title="Section 8 Notice for Landlords"
          subtitle="Prepare a legally validated, solicitor-grade, compliance-checked and court-ready Section 8 notice."
          primaryCta={{ label: "Start Section 8 Wizard", href: wizardLinkNoticeOnly }}
          secondaryCta={{ label: "Complete eviction path", href: wizardLinkCompletePack }}
          showTrustPositioningBar
          hideMedia
        />

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
                Free Starter Document vs Court-Ready Notice
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Our free Section 8 template helps you understand the process. For court proceedings,
                choose our Complete Pack with AI ground recommendation.
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Free Version */}
                <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
                  <div className="text-center mb-6">
                    <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Free Starter Document</span>
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
                    Try Free Starter Document
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
                    <div className="text-4xl font-bold text-gray-900 mt-2">£129.99</div>
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



        <section className="py-10 bg-white" id="snippet-opportunities">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto prose prose-slate max-w-none">
              <h2>What Is Section 8 Notice?</h2>
              <p>A Section 8 notice is a possession notice used in England when a landlord relies on specific legal grounds, such as rent arrears or breach of tenancy terms. It is served on Form 3 and must state the grounds and notice period clearly to support court action.</p>

              <h2>Section 8 Notice Rent Arrears</h2>
              <p>For rent arrears, landlords commonly use Grounds 8, 10, and 11 on a Section 8 notice. Ground 8 is mandatory when arrears meet the required level at service and hearing, while Grounds 10 and 11 are discretionary and depend on the court’s assessment of reasonableness.</p>

              <h2>Section 8 Form 3 Template</h2>
              <p>A Section 8 Form 3 template should include accurate party details, property address, selected grounds, arrears figures, and the correct notice period. Errors in ground selection or dates can undermine possession claims, so landlords should cross-check the tenancy file before serving.</p>

              <h2>Grounds for Eviction</h2>
              <p>Grounds for eviction under Section 8 are legal reasons listed in Schedule 2 of the Housing Act 1988. Some grounds are mandatory and some discretionary. The landlord must prove the ground relied upon using tenancy documents, arrears schedules, statements, and evidence of service.</p>

              <h2>Section 8 vs Section 21</h2>
              <p>Section 8 is fault-based and depends on proving specific statutory grounds, while Section 21 is no-fault and focuses on procedural compliance. Section 8 can include rent arrears recovery in one pathway; Section 21 is often used where no breach allegations are needed.</p>

              <h3>How to Serve a Section 8 Notice</h3>
              <ol>
                <li>Confirm the tenancy type and current arrears balance.</li>
                <li>Select the correct statutory grounds on Form 3.</li>
                <li>Set the notice period required for each ground used.</li>
                <li>Serve the notice by an approved contractual method.</li>
                <li>Retain proof of service and evidence bundle notes.</li>
              </ol>

              <h3>Section 8 vs Section 21 Comparison</h3>
              <table>
                <thead>
                  <tr><th>Point</th><th>Section 8</th><th>Section 21</th></tr>
                </thead>
                <tbody>
                  <tr><td>Basis</td><td>Fault-based grounds</td><td>No-fault route</td></tr>
                  <tr><td>Form</td><td>Form 3</td><td>Form 6A</td></tr>
                  <tr><td>Arrears claim</td><td>Can include arrears in claim</td><td>Possession only route first</td></tr>
                  <tr><td>Evidence focus</td><td>Proof of breach and arrears</td><td>Compliance and service validity</td></tr>
                </tbody>
              </table>

              <h3>Definition: Ground 8</h3>
              <p>Ground 8 is a mandatory rent arrears ground under Section 8. For weekly tenancies, at least eight weeks of arrears are usually required; for monthly tenancies, at least two months. The arrears threshold must normally be met at both notice service and the court hearing.</p>

              <h3>Definition: Form 3</h3>
              <p>Form 3 is the prescribed notice form used for Section 8 possession proceedings in England. It identifies the legal grounds, explains the allegations, and sets the notice period. Accurate completion is essential because unclear grounds or incorrect dates can weaken the court claim.</p>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white" id="guide-navigation">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Complete Landlord Guide</h2>
              <p className="text-gray-700 mb-6">Use this expanded resource for the section 8 notice and Form 3 grounds-based possession process. It is designed for landlords who need practical steps, legal context, and clear evidence standards before serving notices or issuing court claims.</p>
              <div className="grid md:grid-cols-3 gap-3 text-sm">
                <a href="#legal-framework" className="p-3 rounded-lg border border-gray-200 hover:border-primary">Legal framework</a>
                <a href="#step-by-step" className="p-3 rounded-lg border border-gray-200 hover:border-primary">Step-by-step process</a>
                <a href="#mistakes" className="p-3 rounded-lg border border-gray-200 hover:border-primary">Common mistakes</a>
                <a href="#evidence-checklist" className="p-3 rounded-lg border border-gray-200 hover:border-primary">Evidence checklist</a>
                <a href="#timeline-breakdown" className="p-3 rounded-lg border border-gray-200 hover:border-primary">Timeline breakdown</a>
                <a href="#comparison-table" className="p-3 rounded-lg border border-gray-200 hover:border-primary">Comparison table</a>
              </div>
            </div>
          </div>
        </section>

        <section className="py-6 bg-gray-50" id="legal-framework">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto prose prose-slate max-w-none">
              <h2>Legal Framework Explained for Landlords</h2>
              <p>Landlords get better outcomes when they treat document generation as one part of a full legal workflow. Courts and adjudicators are not only checking whether you used the right template, but also whether you followed the statutory sequence correctly, gave fair notice, and can prove service and compliance. In practice, failures usually happen because a landlord serves too early, uses the wrong dates, or cannot evidence how documents were served.</p>
              <p>The strongest approach is to work from statute to action: identify the governing rules, map those rules to your tenancy facts, then generate documents only after validation. That means confirming tenancy type, start date, rent schedule, deposit status, safety records, licensing, prior correspondence, and any relevant protocol steps. Doing this once in a structured way dramatically reduces avoidable delays and repeat filings.</p>
              <p>Jurisdiction matters at every stage. England, Wales, Scotland, and Northern Ireland have different possession frameworks and terminology, so always anchor your action plan to property location and tenancy regime before relying on any form wording. If you manage across multiple regions, keep separate compliance checklists and document packs for each jurisdiction to avoid cross-jurisdiction errors.</p>
            </div>
          </div>
        </section>

        <section className="py-6 bg-white" id="step-by-step">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto prose prose-slate max-w-none">
              <h2>Step-by-Step Landlord Process</h2>
              <ol>
                <li><strong>Diagnose the case type:</strong> define whether your objective is debt recovery, possession, or both. This affects notice choice, court track, and evidence format.</li>
                <li><strong>Validate tenancy facts:</strong> check names, address, tenancy dates, rent frequency, rent due date, and occupant status against signed records.</li>
                <li><strong>Run compliance checks:</strong> confirm deposit and prescribed information position, statutory certificates, licensing duties, and any pre-action requirements.</li>
                <li><strong>Select the right pathway:</strong> choose notice-only, debt claim, or combined strategy based on arrears level, tenant behaviour, and timescale.</li>
                <li><strong>Prepare a clear chronology:</strong> build a dated timeline of rent events, correspondence, reminders, and evidence collection milestones.</li>
                <li><strong>Generate the document pack:</strong> produce accurate forms and letters with matching dates, amounts, and party details. Keep consistency across all documents.</li>
                <li><strong>Serve correctly:</strong> use permitted methods, serve all required attachments, and preserve proof of service and delivery attempts.</li>
                <li><strong>Track response windows:</strong> diarise notice expiry, payment deadlines, response dates, and court filing windows so deadlines are never missed.</li>
                <li><strong>Escalate with evidence:</strong> if no resolution, move to court or next notice stage using the same chronology and evidence bundle.</li>
                <li><strong>Keep communication professional:</strong> clear, factual communication often improves settlement chances and strengthens your position if litigation follows.</li>
              </ol>
              <p>This structured process is intentionally conservative. It prioritises enforceability over speed-at-all-costs and prevents rework. Where landlords skip steps, the usual outcome is not just delay; it is duplicated fees, repeated service, and weaker negotiating leverage.</p>
            </div>
          </div>
        </section>

        <section className="py-6 bg-gray-50" id="mistakes">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto prose prose-slate max-w-none">
              <h2>Common Mistakes That Cause Rejection or Delay</h2>
              <ul>
                <li>Using a generic document draft without checking tenancy type and jurisdiction.</li>
                <li>Serving before prerequisites are satisfied or without required enclosures.</li>
                <li>Date errors: invalid expiry dates, inconsistent chronology, or impossible timelines.</li>
                <li>Amount errors: rent arrears totals that do not reconcile to ledger entries.</li>
                <li>Weak service evidence: no certificate, no proof of posting, no witness notes.</li>
                <li>Switching strategy late without updating previous letters and chronology.</li>
                <li>Overly aggressive correspondence that undermines credibility in court.</li>
              </ul>
              <p>Most of these errors are preventable with a pre-service checklist and a single source of truth for dates and amounts. Keep a master timeline and update it every time you send or receive correspondence.</p>
            </div>
          </div>
        </section>

        <section className="py-6 bg-white" id="evidence-checklist">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto prose prose-slate max-w-none">
              <h2>Evidence Checklist Before You Escalate</h2>
              <ul>
                <li>Signed tenancy/licence agreement and any renewals or variations.</li>
                <li>Rent schedule or ledger showing due dates, paid dates, and running balance.</li>
                <li>Copies of reminder letters, demand notices, and tenant responses.</li>
                <li>Proof of service for every formal document (post, email trail, witness, certificate).</li>
                <li>Compliance documents relevant to your pathway and jurisdiction.</li>
                <li>Chronology document mapping each event to supporting evidence.</li>
                <li>Settlement record where payment plans were offered or negotiated.</li>
              </ul>
              <p className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">Need a faster route from guidance to action? Use our <Link href="/products/notice-only" className="text-primary underline">recommended product pathway</Link> to generate compliance-checked documents and keep service evidence aligned for next steps.</p>
            </div>
          </div>
        </section>

        <section className="py-6 bg-gray-50" id="timeline-breakdown">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto prose prose-slate max-w-none">
              <h2>Timeline Breakdown</h2>
              <p><strong>Day 0-3:</strong> identify issue, verify tenancy facts, and begin chronology. <strong>Day 4-10:</strong> issue first formal communication and gather proof of service. <strong>Day 11-30:</strong> monitor response and update arrears or compliance records. <strong>Post-deadline:</strong> choose escalation route, finalise evidence bundle, and prepare filing-ready documents.</p>
              <p>Where deadlines are statutory, build in a safety margin and avoid last-day actions. If your process relies on post, include deemed service assumptions and non-delivery contingencies. If your process relies on email, keep complete metadata and sent-item logs.</p>
            </div>
          </div>
        </section>

        <section className="py-6 bg-white" id="comparison-table">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Strategy Comparison Table</h2>
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
                      <td className="border border-gray-200 p-3">Confident landlords with clean facts</td>
                      <td className="border border-gray-200 p-3">Date/compliance mistakes</td>
                      <td className="border border-gray-200 p-3">Service proof + chronology</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-200 p-3">Guided product workflow</td>
                      <td className="border border-gray-200 p-3">Most landlords needing speed + certainty</td>
                      <td className="border border-gray-200 p-3">Incomplete source information</td>
                      <td className="border border-gray-200 p-3">Validation outputs + attached records</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 p-3">Immediate court escalation</td>
                      <td className="border border-gray-200 p-3">No response after valid notice/protocol</td>
                      <td className="border border-gray-200 p-3">Weak bundle preparation</td>
                      <td className="border border-gray-200 p-3">Complete documentary bundle</td>
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
              <h2>Practical Landlord Scenarios and Decision Rules</h2>
              <p>Landlords rarely manage ideal cases. Real files usually include partial payment, incomplete paperwork, changing tenant communication, and competing objectives around speed, debt recovery, and possession certainty. For Section 8 / Form 3, the best decision is usually the one that preserves options rather than forcing a single-route strategy too early. That is why experienced landlords separate diagnosis from document generation: first classify the problem, then choose the legal route, then build evidence that supports that route.</p>
              <p><strong>Scenario 1: Cooperative but financially stretched tenant.</strong> Start with a firm written plan, confirm the amount due, and set review points. Keep every communication factual and date-stamped. If payments fail twice, escalate immediately rather than allowing repeated informal extensions that weaken your position.</p>
              <p><strong>Scenario 2: No response after formal notice or arrears letter.</strong> Treat silence as a process signal. Move from reminder to formal stage according to your timeline, keep service proof, and avoid emotional wording. The absence of response often makes documentary quality more important, not less.</p>
              <p><strong>Scenario 3: Tenant disputes numbers.</strong> Provide a reconciliation schedule showing each charge, payment, and balance movement. Link each figure to source records. Courts and mediators favour landlords who can produce clear arithmetic and consistent chronology.</p>
              <p><strong>Scenario 4: Multiple tenants or occupants.</strong> Confirm who is legally liable, who signed, and how notices should be addressed and served. Do not assume all occupiers have identical status. Incorrect party details are a frequent source of avoidable delays.</p>
              <p><strong>Scenario 5: Property condition counter-allegations.</strong> Keep maintenance logs, inspection records, contractor invoices, and response times. Even where your main claim is possession or debt, condition evidence can influence credibility and case management outcomes.</p>
              <p>Use the following decision rules to stay on track: validate facts before serving, serve once but serve properly, never let deadlines pass without next-step action, and preserve evidence at the point of event rather than reconstructing later. If your case may reach court, assume every date, amount, and communication could be scrutinised line by line.</p>
              <p>From an operations perspective, create a single case file containing tenancy documents, timeline, financial schedule, correspondence, service proof, and escalation notes. This prevents fragmented evidence and allows fast handover to legal support if needed. Landlords who maintain structured files generally resolve matters faster, either through payment, settlement, or successful court progression.</p>
              <p>Finally, distinguish between urgency and haste. Urgency means acting promptly within a defined legal sequence. Haste means skipping verification to issue documents quickly. The first improves outcomes; the second often causes re-service, adjournment, or rejection. A disciplined, evidence-led approach is the most reliable route to faster possession and stronger debt recovery.</p>
            </div>
          </div>
        </section>



        <section className="py-6 bg-white" id="advanced-checklist">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto prose prose-slate max-w-none">
              <h2>Advanced Pre-Court Checklist for Landlords</h2>
              <p>Use this advanced checklist before final service or filing. It is designed to reduce preventable rejection and improve clarity if your matter is reviewed by a judge, adviser, or mediator.</p>
              <ul>
                <li>Identity and party data verified against signed agreement and latest correspondence.</li>
                <li>Property address appears consistently in every document version and enclosure.</li>
                <li>Tenancy dates, start terms, and any renewals documented without contradiction.</li>
                <li>Rent amount, due date, and payment method cross-checked to bank evidence.</li>
                <li>Arrears or claim schedule reconciled line by line with source transactions.</li>
                <li>Notice or letter date logic checked against statutory minimum periods.</li>
                <li>Service method matches tenancy clause and jurisdiction requirements.</li>
                <li>Certificate of service, proof of posting, and witness note retained.</li>
                <li>All statutory or protocol prerequisites completed and evidenced.</li>
                <li>Communication trail exported with dates, senders, and full message text.</li>
                <li>Photographic or inspection evidence indexed where condition issues exist.</li>
                <li>Any payment plan proposals recorded with acceptance or refusal dates.</li>
                <li>Escalation decision note written to explain why next legal step is justified.</li>
                <li>Bundle index prepared so every statement can be matched to a document.</li>
                <li>Final quality pass completed by reading documents as if you were the court.</li>
              </ul>
              <p>When landlords complete this checklist, case quality improves in three ways: fewer factual errors, stronger service evidence, and cleaner chronology. These improvements directly affect negotiation leverage and reduce avoidable adjournments.</p>
              <p>As a practical rule, if any key item above is incomplete, pause and correct it before service or filing. A one-day delay for quality control is usually better than a multi-week delay caused by rejected or disputed paperwork.</p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <FAQSection
          faqs={enhancedFaqs}
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
                  Try Free Starter Document
                </Link>
                <Link
                  href={wizardLinkCompletePack}
                  className="hero-btn-secondary inline-flex items-center justify-center gap-2"
                >
                  Get Complete Pack — £129.99
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
