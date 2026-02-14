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
  title: 'Section 21 Notice Template 2026 for Landlords | Free Form 6A',
  description: 'Section 21 notice template for landlords. Build a court-ready Form 6A to avoid delays and invalid notices. Free template available.',
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
    title: 'Section 21 Notice Template 2026 for Landlords | Free Form 6A',
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
          title="Section 21 Notice Template (England) / Court-Ready Form 6A"
          subtitle={<>Download a free <strong>Section 21 notice template</strong> or generate a court-ready <strong>Form 6A</strong> in minutes. Trusted by over 10,000 UK landlords.</>}
          primaryCTA={{ label: "Get Court-Ready Notice — £49.99", href: wizardLink }}
          secondaryCTA={{ label: "Try Free Template", href: "/tools/free-section-21-notice-generator" }}
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
                Free Template vs Court-Ready Notice
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Our free Section 21 template is great for understanding the <Link href="/no-fault-eviction" className="text-primary hover:underline">no-fault eviction process</Link>, but for
                proper compliance with current requirements, choose our court-ready version.
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
                    className="hero-btn-secondary block w-full text-center"
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

        {/* FAQ Section */}
        <FAQSection
          faqs={section21NoticeTemplateFAQs}
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
                  Try Free Template
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
