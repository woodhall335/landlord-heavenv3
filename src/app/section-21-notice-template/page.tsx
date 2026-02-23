import { Metadata } from 'next';
import Link from 'next/link';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { Section21Countdown } from '@/components/ui/Section21Countdown';
import { SocialProofCounter } from '@/components/ui/SocialProofCounter';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { productLinks, toolLinks, blogLinks, landingPageLinks } from '@/lib/seo/internal-links';
import { buildWizardLink } from '@/lib/wizard/buildWizardLink';
import { buildAskHeavenLink } from '@/lib/ask-heaven/buildAskHeavenLink';
import { StandardHero } from '@/components/marketing/StandardHero';
import { FAQSection } from '@/components/seo/FAQSection';
import { section21NoticeTemplateFAQs } from '@/data/faqs';
import { FunnelCta } from '@/components/funnels';
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
  title: 'Section 21 Notice Template | Form 6A Download & Court-Ready Builder',
  description: 'Section 21 notice template with Form 6A wording, service guidance, and compliance checks. Download free or generate a court-ready notice in minutes.',
  keywords: [
    'section 21 notice template',
    'section 21 template',
    'form 6a template',
    'section 21 notice form',
    'no fault eviction template',
    'eviction notice template',
  ],
  alternates: {
    canonical: 'https://landlordheaven.co.uk/section-21-notice-template',
  },
  openGraph: {
    title: 'Section 21 Notice Template | Form 6A Download & Court-Ready Builder',
    description: 'Free Section 21 notice template for landlords in England. Build a compliant Form 6A fast and avoid costly delays.',
    type: 'website',
  },
};

export default function Section21NoticeTemplatePage() {
  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Section 21 Notice Template',
    description: 'Free Section 21 notice template and court-ready Form 6A generator for England.',
    url: 'https://landlordheaven.co.uk/section-21-notice-template',
    mainEntity: {
      '@type': 'Product',
      name: 'Section 21 Notice (Form 6A)',
      description: 'Court-ready Section 21 eviction notice for England landlords',
      offers: {
        '@type': 'AggregateOffer',
        lowPrice: '0',
        highPrice: '49.99',
        priceCurrency: 'GBP',
        offerCount: '2',
      },
    },
  };



  const enhancedFaqs = [
    ...section21NoticeTemplateFAQs,
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
        { name: "Section 21 Notice Template", url: "https://landlordheaven.co.uk/section-21-notice-template" }
      ])} />

      <main>
        {/* Hero Section */}
        <StandardHero
          badge="Section 21 ends 1 May 2026"
          badgeIcon={<AlertTriangle className="w-4 h-4" />}
          title="Section 21 Notice Template (Form 6A) for England"
          subtitle={<>Need a <strong>Section 21 notice template</strong> now? Download a free version for reference or generate a compliance-checked <strong>Form 6A</strong> you can serve with confidence.</>}
          primaryCTA={{ label: "Get Court-Ready Notice — £49.99", href: wizardLink }}
          secondaryCTA={{ label: "Try Free Starter Document", href: "/tools/free-section-21-notice-generator" }}
          variant="pastel"
        >
          {/* Countdown */}
          <div className="flex justify-center mb-6">
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

          {/* Trust Signals */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Official Form 6A
            </span>
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              Official Form 6A Format
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
                title="Ready to serve a compliant Section 21 notice?"
                subtitle="Start with Notice Only, or move straight to full possession support if you expect court action."
                primaryHref="/products/notice-only"
                primaryText="Start Notice Only"
                primaryDataCta="notice-only"
                location="above-fold"
                secondaryLinks={[
                  { href: '/products/complete-pack', text: 'Need full eviction support?', dataCta: 'complete-pack' },
                ]}
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

        <section className="py-10 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <FunnelCta
                title="Got the steps? Generate a compliance-checked bundle with service guidance."
                subtitle="Reduce rejection risk with a compliant notice flow and clear next steps if the tenant does not leave."
                primaryHref="/products/notice-only"
                primaryText="Generate my notice"
                primaryDataCta="notice-only"
                location="mid"
                secondaryLinks={[
                  { href: '/products/complete-pack', text: 'Need full eviction support?', dataCta: 'complete-pack' },
                ]}
              />
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
                Our free Section 21 template is great for understanding the <Link href="/no-fault-eviction" className="text-primary hover:underline">no-fault eviction process</Link>, but for
                proper compliance with current requirements, choose our court-ready version.
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
                    className="hero-btn-secondary block w-full text-center"
                  >
                    Try Free Starter Document
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
                    <div className="text-4xl font-bold text-gray-900 mt-2">£49.99</div>
                  </div>
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 font-medium">Official Form 6A</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 font-medium">Designed to reduce rejection risk</span>
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
                    className="hero-btn-primary block w-full text-center"
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
                      Uses official prescribed Form 6A format
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

        {/* Timeline + Validity */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Section 21 Timeline, Costs & Validity Checklist
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Keep your notice compliant and avoid delays by planning the timeline, knowing the costs,
                and confirming every required document before service.
              </p>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Notice timeline</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>Minimum 2 months notice period.</li>
                    <li>Notice must expire after the fixed term ends.</li>
                    <li>Issue court proceedings within 6 months of expiry.</li>
                    <li>Typical possession timeline: 4–6 months end to end.</li>
                  </ul>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Validity checklist</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>Deposit protected + prescribed info served.</li>
                    <li>EPC, gas safety, and <Link href="/how-to-rent-guide" className="text-primary hover:underline">"How to Rent"</Link> delivered.</li>
                    <li>Correct Form 6A version and dates.</li>
                    <li>Licensing and HMO rules satisfied.</li>
                  </ul>
                  <Link
                    href="/tools/validators/section-21"
                    className="text-primary text-sm font-medium hover:underline inline-flex mt-3"
                  >
                    Check notice validity →
                  </Link>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Common mistakes</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>Using an outdated <Link href="/form-6a-section-21" className="text-primary hover:underline">Form 6A</Link> template.</li>
                    <li>Miscalculating the expiry date.</li>
                    <li>Serving without proof of service.</li>
                    <li>Skipping compliance documents.</li>
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
                className="hero-btn-secondary inline-flex items-center gap-2"
              >
                Serve Your Notice Before the Deadline
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Choose your next step</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="rounded-xl border border-gray-200 p-6 bg-gray-50">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Notice Only</h3>
                  <p className="text-gray-600 mb-4">Best when you need to generate a compliance-checked notice bundle quickly.</p>
                  <Link href="/products/notice-only" className="hero-btn-secondary inline-flex" data-cta="notice-only" data-cta-location="bottom">Start Notice Only</Link>
                </div>
                <div className="rounded-xl border border-primary/30 p-6 bg-primary/5">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Complete Pack</h3>
                  <p className="text-gray-600 mb-4">Best if you want end-to-end support including possession order steps.</p>
                  <Link href="/products/complete-pack" className="hero-btn-primary inline-flex" data-cta="complete-pack" data-cta-location="bottom">Get full eviction support</Link>
                </div>
              </div>
            </div>
          </div>
        </section>



        <section className="py-10 bg-white" id="snippet-opportunities">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto prose prose-slate max-w-none">
              <h2>What Is Form 6A?</h2>
              <p>Form 6A is the prescribed notice for serving a Section 21 no-fault possession notice in England. It sets out the parties, property, and notice dates in a required format. Landlords should use the correct version and ensure all statutory prerequisites are satisfied before service.</p>

              <h2>How Long Is a Section 21 Notice?</h2>
              <p>A Section 21 notice must usually give at least two months’ notice. The end date should provide the full statutory period after valid service. If the notice period is short or calculated incorrectly, the court can refuse possession and require the landlord to restart the notice process.</p>

              <h2>Section 21 Notice Deposit Protection</h2>
              <p>Deposit protection is central to Section 21 validity. If the deposit was not protected on time or prescribed information was not served correctly, a Section 21 notice can fail. Landlords should check scheme records and documentary evidence before issuing the notice.</p>

              <h2>Section 21 Eviction Timeline UK</h2>
              <p>The Section 21 timeline typically involves notice service, a two-month waiting period, possession proceedings if the tenant remains, and potential enforcement by bailiff or High Court process. Actual timing depends on court backlog, document quality, and whether the tenant raises a defence.</p>

              <h3>How to Serve a Section 21 Notice</h3>
              <ol>
                <li>Check deposit compliance and key tenancy documents.</li>
                <li>Complete Form 6A using exact tenant and property details.</li>
                <li>Calculate a valid expiry date with full notice period.</li>
                <li>Serve by the method allowed in the tenancy agreement.</li>
                <li>Store proof of service and a dated chronology.</li>
              </ol>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white" id="guide-navigation">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Complete Landlord Guide</h2>
              <p className="text-gray-700 mb-6">Use this expanded resource for the section 21 notice and Form 6A process for England landlords. It is designed for landlords who need practical steps, legal context, and clear evidence standards before serving notices or issuing court claims.</p>
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
              <p>Landlords rarely manage ideal cases. Real files usually include partial payment, incomplete paperwork, changing tenant communication, and competing objectives around speed, debt recovery, and possession certainty. For Section 21 / Form 6A, the best decision is usually the one that preserves options rather than forcing a single-route strategy too early. That is why experienced landlords separate diagnosis from document generation: first classify the problem, then choose the legal route, then build evidence that supports that route.</p>
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
          title="Section 21 Notice Template FAQ"
          showContactCTA={false}
          variant="gray"
        />

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
                  className="hero-btn-secondary inline-flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Try Free Starter Document
                </Link>
                <Link
                  href={wizardLink}
                  className="hero-btn-secondary inline-flex items-center justify-center gap-2"
                >
                  Get Court-Ready — £49.99
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
              <p className="mt-8 text-white/70 text-sm">
                Official Form 6A &bull; AI Compliance Check &bull; Designed for Court Acceptance
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
                  landingPageLinks.section8Template,
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
