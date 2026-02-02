import { Metadata } from 'next';
import Link from 'next/link';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { Section21Countdown } from '@/components/ui/Section21Countdown';
import { SocialProofCounter } from '@/components/ui/SocialProofCounter';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { productLinks, toolLinks, blogLinks, landingPageLinks } from '@/lib/seo/internal-links';
import { buildWizardLink } from '@/lib/wizard/buildWizardLink';
import { StandardHero } from '@/components/marketing/StandardHero';
import { FAQSection } from '@/components/seo/FAQSection';
import { evictionNoticeTemplateFAQs } from '@/data/faqs';
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

// Pre-built wizard link for eviction template page (jurisdiction unspecified)
const wizardLinkNoticeOnly = buildWizardLink({
  product: 'notice_only',
  src: 'template',
  topic: 'eviction',
});

export const metadata: Metadata = {
  title: 'Eviction Notice Template UK - Possession Notice Download',
  description: 'Download free UK eviction notice templates. Section 21 and Section 8 notices. Court-ready documents trusted by 10,000+ landlords.',
  keywords: [
    'eviction notice template uk',
    'eviction notice template',
    'possession notice',
    'possession notice template',
    'landlord eviction notice',
    'section 21 eviction',
    'section 8 eviction',
    'tenant eviction notice',
    'eviction letter template',
    'notice seeking possession',
  ],
  alternates: {
    canonical: 'https://landlordheaven.co.uk/eviction-notice-template',
  },
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
        highPrice: '149.99',
        priceCurrency: 'GBP',
        offerCount: '3',
      },
    },
  };


  return (
    <>
      <StructuredData data={pageSchema} />
      <StructuredData data={breadcrumbSchema([
        { name: 'Home', url: 'https://landlordheaven.co.uk' },
        { name: 'Eviction Notice Template', url: 'https://landlordheaven.co.uk/eviction-notice-template' },
      ])} />

      <main>
        {/* Hero Section */}
        <StandardHero
          badge="Section 21 ends 1 May 2026"
          badgeIcon={<AlertTriangle className="w-4 h-4" />}
          title="Eviction Notice Template UK"
          subtitle={<>Download free <strong>eviction notice templates</strong> for Section 21 and Section 8. Court-ready documents trusted by over 10,000 UK landlords.</>}
          primaryCTA={{ label: "Get Court-Ready Notice — £49.99", href: wizardLinkNoticeOnly }}
          secondaryCTA={{ label: "Try Free Template", href: "/tools/free-section-21-notice-generator" }}
          variant="pastel"
        >
          {/* Countdown */}
          <div className="mb-4">
            <Section21Countdown variant="badge" />
          </div>

          {/* Trust Signals */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Section 21 & 8 Included
            </span>
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              Official Format Used
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-green-500" />
              Ready in 5 Minutes
            </span>
          </div>
        </StandardHero>

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
                    End an assured shorthold tenancy without giving a reason. Uses the prescribed{' '}
                    <Link href="/form-6a-section-21" className="text-primary hover:underline">Form 6A</Link>.
                    Requires 2 months&apos; notice and compliance with deposit protection rules.
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

        {/* Possession Notice Section */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Eviction Notice vs Possession Notice — What Landlords Mean
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                These terms are often used interchangeably. Here&apos;s what they actually mean in law.
              </p>

              <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">
                      &ldquo;Eviction notice&rdquo; — the common term
                    </h3>
                    <p className="text-gray-600">
                      When landlords talk about an &ldquo;eviction notice,&rdquo; they usually mean the formal
                      document that starts the legal process to end a tenancy. In England, this means either a
                      Section 21 (Form 6A) or Section 8 (Form 3) notice. These are the first step toward
                      regaining possession of your property.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">
                      &ldquo;Possession notice&rdquo; — the legal term
                    </h3>
                    <p className="text-gray-600">
                      Legally, the term is &ldquo;notice seeking possession&rdquo; — which is why Section 8 is
                      formally titled &ldquo;Notice seeking possession of a property let on an assured tenancy.&rdquo;
                      The notice informs the tenant you intend to seek a possession order from the court.
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="font-bold text-gray-900 mb-2">
                      What happens after serving a possession notice?
                    </h3>
                    <p className="text-gray-600 mb-4">
                      If the tenant doesn&apos;t leave after the notice period expires, you apply to court for a
                      possession order. If they still won&apos;t leave after the court order, you apply for a
                      warrant of possession to have bailiffs enforce it.
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <Link
                        href="/possession-claim-guide"
                        className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
                      >
                        Read our possession claim guide
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                      <Link
                        href="/tenant-wont-leave"
                        className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
                      >
                        What to do if tenant won&apos;t leave
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 grid md:grid-cols-2 gap-6">
                <Link
                  href="/section-21-notice-template"
                  className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:border-primary/50 transition-colors group"
                >
                  <h4 className="font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                    Section 21 Possession Notice
                  </h4>
                  <p className="text-gray-600 text-sm">
                    No-fault eviction — 2 months notice. Ends May 2026.
                  </p>
                </Link>
                <Link
                  href="/section-8-notice-template"
                  className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:border-primary/50 transition-colors group"
                >
                  <h4 className="font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                    Section 8 Possession Notice
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Grounds-based eviction — 2 weeks to 2 months notice. Works after 2026.
                  </p>
                </Link>
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
                Our free templates help you understand the process. For proper compliance,
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
                      <span className="text-gray-700 font-medium">Section 21 & 8 included</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 font-medium">Designed for court acceptance</span>
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
                    href={wizardLinkNoticeOnly}
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
                href={wizardLinkNoticeOnly}
                className="hero-btn-secondary inline-flex items-center gap-2"
              >
                Serve Your Notice Before the Deadline
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <FAQSection
          faqs={evictionNoticeTemplateFAQs}
          title="Eviction Notice Template FAQ"
          showContactCTA={false}
          variant="gray"
        />

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
                  className="hero-btn-secondary inline-flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Try Free Template
                </Link>
                <Link
                  href={wizardLinkNoticeOnly}
                  className="hero-btn-secondary inline-flex items-center justify-center gap-2"
                >
                  Get Court-Ready — £49.99
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
              <p className="mt-8 text-white/70 text-sm">
                Section 21 & 8 Included &bull; AI Compliance Check &bull; Designed for Court Acceptance
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
