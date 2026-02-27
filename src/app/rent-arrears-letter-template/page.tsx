import { Metadata } from 'next';
import Link from 'next/link';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { SocialProofCounter } from '@/components/ui/SocialProofCounter';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { productLinks, toolLinks, blogLinks, landingPageLinks } from '@/lib/seo/internal-links';
import { buildWizardLink } from '@/lib/wizard/buildWizardLink';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';
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
  PoundSterling,
  Mail,
  TrendingUp,
  Scale
} from 'lucide-react';

// Pre-built wizard links for rent arrears template page
const wizardLinkMoneyClaim = buildWizardLink({
  product: 'money_claim',
  src: 'seo_rent_arrears_letter_template',
  topic: 'debt',
});

const wizardLinkNoticeOnly = buildWizardLink({
  product: 'notice_only',
  src: 'seo_rent_arrears_letter_template',
  topic: 'eviction',
});

export const metadata: Metadata = {
  title: 'Rent Arrears Letter UK (Legally Validated) | Landlord Heaven',
  description: 'Rent arrears letter guidance for UK landlords with legally validated, compliance-checked wording and escalation steps before MCOL or Section 8 action.',
  keywords: [
    'rent arrears letter template',
    'rent demand letter',
    'late rent letter',
    'unpaid rent letter',
    'rent arrears notice',
    'tenant rent arrears',
    'formal rent demand',
  ],
  alternates: { canonical: 'https://landlordheaven.co.uk/rent-arrears-letter-template' },
  openGraph: {
    title: 'Rent Arrears Letter UK (Legally Validated) | Landlord Heaven',
    description: 'Rent arrears letter guidance with solicitor-grade wording and escalation steps for unpaid rent.',
    type: 'website',
    url: 'https://landlordheaven.co.uk/rent-arrears-letter-template',
  },
};

export default function RentArrearsLetterTemplatePage() {
  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Rent Arrears Letter Template',
    description: 'Free rent arrears letter template and formal rent demand letters for UK landlords.',
    url: 'https://landlordheaven.co.uk/rent-arrears-letter-template',
    mainEntity: {
      '@type': 'Product',
      name: 'Rent Arrears Letter Template',
      description: 'Professional rent demand letters for UK landlords',
      offers: {
        '@type': 'AggregateOffer',
        lowPrice: '0',
        highPrice: '149.99',
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
        name: 'When should I send a rent arrears letter?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Send a formal rent arrears letter as soon as rent is overdue. A polite reminder after 7 days, a formal demand after 14 days, and a final warning before eviction after 1 month is a common approach.',
        },
      },
      {
        '@type': 'Question',
        name: 'What should a rent arrears letter include?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'A rent arrears letter should include: the tenant name and property address, the amount owed, dates the rent was due, a deadline for payment, consequences of non-payment, and your contact details for payment arrangements.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I evict a tenant for rent arrears?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. You can serve a Section 8 notice using Ground 8 (mandatory - 2+ months arrears), Ground 10 (discretionary - any arrears), or Ground 11 (persistent late payment). You can also use Section 21 until May 2026.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I recover unpaid rent without eviction?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'You can recover unpaid rent through County Court Money Claim Online (MCOL). This allows you to claim the debt without evicting the tenant. If successful, you can enforce the judgment through various means including attachment of earnings.',
        },
      },
      {
        '@type': 'Question',
        name: 'Should I offer a payment plan for rent arrears?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'A payment plan can be beneficial as it maintains the tenancy and ensures some income. However, get any agreement in writing, and make clear that eviction proceedings will begin if the plan is not followed.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I send arrears letters by email and post?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, dual service is often sensible. Use the tenancy agreement service clause and keep delivery evidence for both channels.',
        },
      },
      {
        '@type': 'Question',
        name: 'What evidence should I prepare before MCOL?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Prepare a rent schedule, signed tenancy agreement, correspondence record, and proof of service for all arrears letters and pre-action communications.',
        },
      },
      {
        '@type': 'Question',
        name: 'How much rent arrears before I can evict?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'For mandatory Ground 8, you need at least 2 months (8 weeks) of arrears both when serving notice and at the court hearing. For discretionary grounds (10/11), any amount of arrears may be sufficient, but the court will consider if it is reasonable to grant possession.',
        },
      },
    ],
  };

  return (
    <>
      <StructuredData data={pageSchema} />
      <StructuredData data={faqSchema} />

      <HeaderConfig mode="autoOnScroll" />
      <StructuredData data={breadcrumbSchema([{ name: 'Home', url: 'https://landlordheaven.co.uk' }, { name: 'Rent Arrears Letter Template', url: 'https://landlordheaven.co.uk/rent-arrears-letter-template' }])} />
      <main>
        {/* Hero Section */}
        <UniversalHero
          title="Rent Arrears Letter for Landlords"
          subtitle="Use legally validated, solicitor-grade, compliance-checked and court-ready wording before escalation."
          primaryCta={{ label: "Start Money Claim Wizard", href: wizardLinkMoneyClaim }}
          secondaryCta={{ label: "Section 8 route", href: wizardLinkNoticeOnly }}
          showTrustPositioningBar
          hideMedia
        />

        <section className="py-8 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <FunnelCta
                title="Turn arrears letters into recovery action"
                subtitle="Use Money Claim when payment is still outstanding, or choose eviction support if possession is also needed."
                primaryHref="/products/money-claim"
                primaryText="Recover unpaid rent"
                primaryDataCta="money-claim"
                location="above-fold"
                secondaryLinks={[{ href: '/products/complete-pack', text: "If tenant won't leave / eviction support", dataCta: 'complete-pack' }]}
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

        {/* Letter Types */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Types of Rent Arrears Letters
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Use the right letter at the right time. Our templates cover every stage of the
                rent recovery process.
              </p>

              <div className="grid md:grid-cols-3 gap-6">
                {/* Friendly Reminder */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                    <Mail className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Friendly Reminder</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Polite reminder that rent is overdue. Use within 7-14 days of missed payment.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Non-confrontational tone
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Payment options included
                    </li>
                  </ul>
                </div>

                {/* Formal Demand */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
                    <FileText className="w-6 h-6 text-amber-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Formal Demand</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Formal letter demanding payment. Use after 14-21 days of non-payment.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Clear deadline
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Consequences stated
                    </li>
                  </ul>
                </div>

                {/* Final Warning */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Final Warning</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Last chance before legal action. Use before serving eviction notice.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Legal action warning
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Evidence for court
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-10 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <FunnelCta
                title="No response to your letter?"
                subtitle="Escalate with a money claim pack and keep your arrears evidence organised."
                primaryHref="/products/money-claim"
                primaryText="Start money claim"
                primaryDataCta="money-claim"
                location="mid"
                secondaryLinks={[{ href: '/products/complete-pack', text: 'Tenant still in property? Get eviction support', dataCta: 'complete-pack' }]}
              />
            </div>
          </div>
        </section>

        {/* Escalation Path */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                What To Do If They Don&apos;t Pay
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                If letters don&apos;t work, you have two main options: recover the money through court
                or evict the tenant. We can help with both.
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Money Claim */}
                <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <PoundSterling className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Money Claim</h3>
                      <span className="text-sm text-gray-500">Recover the debt</span>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Take court action to recover unpaid rent without evicting the tenant.
                    Useful if you want to keep the tenancy.
                  </p>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      County Court claim forms
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Interest calculation
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Enforcement options
                    </li>
                  </ul>
                  <Link
                    href={wizardLinkMoneyClaim}
                    className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
                  >
                    Get Money Claim Pack — £99.99
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                {/* Eviction */}
                <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                      <Gavel className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Eviction</h3>
                      <span className="text-sm text-gray-500">End the tenancy</span>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Serve Section 8 notice for rent arrears. Ground 8 is mandatory if arrears
                    exceed 2 months.
                  </p>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      2 weeks notice (Ground 8)
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Mandatory possession
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Claim arrears in same case
                    </li>
                  </ul>
                  <Link
                    href={wizardLinkNoticeOnly}
                    className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
                  >
                    Get Eviction Notice — £49.99
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Free vs Paid Comparison */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Free Starter Document vs Money Claim Pack
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Start with our free rent demand letter. Upgrade to the Money Claim Pack if you need
                to take court action.
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
                      <span className="text-gray-600">Basic rent demand letter</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">Professional format</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">Immediate download</span>
                    </li>
                    <li className="flex items-start gap-3 text-gray-400">
                      <X className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <span>No court claim forms</span>
                    </li>
                    <li className="flex items-start gap-3 text-gray-400">
                      <X className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <span>No interest calculation</span>
                    </li>
                    <li className="flex items-start gap-3 text-gray-400">
                      <X className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <span>No escalation letters</span>
                    </li>
                  </ul>
                  <Link
                    href="/tools/free-rent-demand-letter"
                    className="hero-btn-secondary block w-full text-center"
                  >
                    Try Free Starter Document
                  </Link>
                </div>

                {/* Paid Version */}
                <div className="bg-primary/5 rounded-2xl p-8 border-2 border-primary relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
                      Full Recovery
                    </span>
                  </div>
                  <div className="text-center mb-6">
                    <span className="text-sm font-medium text-primary uppercase tracking-wide">Money Claim Pack</span>
                    <div className="text-4xl font-bold text-gray-900 mt-2">£99.99</div>
                  </div>
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 font-medium">All demand letter stages</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 font-medium">County Court claim forms</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 font-medium">Interest calculator (8%)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 font-medium">Witness statement template</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 font-medium">Enforcement guidance</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 font-medium">Email support</span>
                    </li>
                  </ul>
                  <Link
                    href={wizardLinkMoneyClaim}
                    className="hero-btn-primary block w-full text-center"
                  >
                    Get Money Claim Pack
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                How to Get Your Rent Arrears Letter
              </h2>
              <p className="text-gray-600 text-center mb-12">
                Generate a professional demand letter in 3 simple steps
              </p>

              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-primary">1</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Enter Details</h3>
                  <p className="text-gray-600 text-sm">
                    Tenant name, property address, and amount owed
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-primary">2</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Choose Letter Type</h3>
                  <p className="text-gray-600 text-sm">
                    Friendly reminder, formal demand, or final warning
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-primary">3</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Download & Send</h3>
                  <p className="text-gray-600 text-sm">
                    Get your letter in PDF format, ready to send
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Statistics Banner */}
        <section className="py-12 bg-amber-500 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-2xl lg:text-3xl font-bold mb-4">
                Don&apos;t Let Rent Arrears Build Up
              </h2>
              <p className="text-white/90 mb-6 max-w-2xl mx-auto">
                The longer you wait, the harder it is to recover. A formal demand letter sent early
                often prompts payment and avoids costly court action.
              </p>
              <div className="flex flex-wrap justify-center gap-8 mb-8">
                <div className="text-center">
                  <div className="text-4xl font-bold">70%</div>
                  <div className="text-white/80 text-sm">of tenants pay after formal demand</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold">8%</div>
                  <div className="text-white/80 text-sm">statutory interest on unpaid rent</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold">6 yrs</div>
                  <div className="text-white/80 text-sm">to claim unpaid rent in court</div>
                </div>
              </div>
              <Link
                href="/tools/free-rent-demand-letter"
                className="hero-btn-secondary inline-flex items-center gap-2"
              >
                Send Your Demand Letter Now
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>



        <section className="py-10 bg-white" id="snippet-opportunities">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto prose prose-slate max-w-none">
              <h2>Rent Arrears Letter Template UK</h2>
              <p>A rent arrears letter template UK landlords use should clearly state the tenant details, amount owed, missed payment dates, payment deadline, and next steps if payment is not made. It should be dated, factual, and supported by a rent schedule to avoid later disputes.</p>

              <h2>Rent Demand Letter</h2>
              <p>A rent demand letter is a formal written request for overdue rent. It tells the tenant how much is outstanding, when payment is due, and how to pay. A clear demand letter can support negotiation and provides useful evidence if the matter later proceeds to court.</p>

              <h2>Final Rent Demand Letter</h2>
              <p>A final rent demand letter is the last warning before legal escalation. It should set a short, clear payment deadline, confirm previous reminders, and explain intended next action such as a Section 8 notice or money claim. Keep proof of service for every letter sent.</p>

              <h2>Claiming Rent Arrears Small Claims</h2>
              <p>Claiming rent arrears through the small claims route usually involves a Letter Before Action, a clear arrears schedule, and issuing a county court claim if payment is not made. The claim should match tenancy records and bank evidence to reduce defence risk.</p>

              <h3>How to Escalate a Rent Arrears Letter</h3>
              <ol>
                <li>Send a reminder letter as soon as rent becomes overdue.</li>
                <li>Issue a formal demand with a specific payment deadline.</li>
                <li>Serve a final demand letter with warning of legal action.</li>
                <li>Prepare arrears schedule and supporting tenancy documents.</li>
                <li>Issue MCOL or possession action if payment is still unpaid.</li>
              </ol>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white" id="guide-navigation">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Complete Landlord Guide</h2>
              <p className="text-gray-700 mb-6">Use this expanded resource for the rent arrears recovery process from first reminder to claim or possession. It is designed for landlords who need practical steps, legal context, and clear evidence standards before serving notices or issuing court claims.</p>
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
              <p className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">Need a faster route from guidance to action? Use our <Link href="/products/money-claim" className="text-primary underline">recommended product pathway</Link> to generate compliance-checked documents and keep service evidence aligned for next steps.</p>
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
              <p>Landlords rarely manage ideal cases. Real files usually include partial payment, incomplete paperwork, changing tenant communication, and competing objectives around speed, debt recovery, and possession certainty. For rent arrears recovery, the best decision is usually the one that preserves options rather than forcing a single-route strategy too early. That is why experienced landlords separate diagnosis from document generation: first classify the problem, then choose the legal route, then build evidence that supports that route.</p>
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
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
                Rent Arrears Letter Template FAQ
              </h2>

              <div className="space-y-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    When should I send a rent arrears letter?
                  </h3>
                  <p className="text-gray-600">
                    Send a formal rent arrears letter as soon as rent is overdue. A polite reminder
                    after 7 days, a formal demand after 14 days, and a final warning before eviction
                    after 1 month is a common approach.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    What should a rent arrears letter include?
                  </h3>
                  <p className="text-gray-600">
                    A rent arrears letter should include: the tenant name and property address, the
                    amount owed, dates the rent was due, a deadline for payment, consequences of
                    non-payment, and your contact details for payment arrangements.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Can I evict a tenant for rent arrears?
                  </h3>
                  <p className="text-gray-600">
                    Yes. You can serve a Section 8 notice using Ground 8 (mandatory - 2+ months arrears),
                    Ground 10 (discretionary - any arrears), or Ground 11 (persistent late payment).
                    You can also use Section 21 until May 2026.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    How do I recover unpaid rent without eviction?
                  </h3>
                  <p className="text-gray-600">
                    You can recover unpaid rent through County Court Money Claim Online (MCOL). This
                    allows you to claim the debt without evicting the tenant. If successful, you can
                    enforce the judgment through various means including attachment of earnings.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Should I offer a payment plan for rent arrears?
                  </h3>
                  <p className="text-gray-600">
                    A payment plan can be beneficial as it maintains the tenancy and ensures some income.
                    However, get any agreement in writing, and make clear that eviction proceedings will
                    begin if the plan is not followed.
                  </p>
                </div>



                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Can I send arrears letters by email and post?
                  </h3>
                  <p className="text-gray-600">
                    Yes, dual service is often sensible. Use the tenancy agreement service clause and
                    keep delivery evidence for both channels.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    What evidence should I prepare before MCOL?
                  </h3>
                  <p className="text-gray-600">
                    Prepare a rent schedule, signed tenancy agreement, correspondence record, and proof
                    of service for all arrears letters and pre-action communications.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    How much rent arrears before I can evict?
                  </h3>
                  <p className="text-gray-600">
                    For mandatory Ground 8, you need at least 2 months (8 weeks) of arrears both when
                    serving notice and at the court hearing. For discretionary grounds (10/11), any
                    amount of arrears may be sufficient, but the court will consider if it is
                    reasonable to grant possession.
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
                Get Your Rent Arrears Letter Now
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Start recovering your unpaid rent today. Professional demand letters that get results.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/tools/free-rent-demand-letter"
                  className="hero-btn-secondary inline-flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Try Free Starter Document
                </Link>
                <Link
                  href={wizardLinkMoneyClaim}
                  className="hero-btn-secondary inline-flex items-center justify-center gap-2"
                >
                  Get Money Claim Pack — £99.99
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
              <p className="mt-8 text-white/70 text-sm">
                Professional Format &bull; Court Claim Forms &bull; Interest Calculator
              </p>
            </div>
          </div>
        </section>

        {/* Related Resources */}
        {/* Ask Heaven callout */}
        <section className="py-8 bg-purple-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-4">
                <span className="text-4xl">☁️</span>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">
                    Questions about dealing with rent arrears?
                  </p>
                  <p className="text-gray-600">
                    Our free{' '}
                    <Link href="/ask-heaven" className="text-primary font-medium hover:underline">
                      Ask Heaven landlord Q&amp;A tool
                    </Link>{' '}
                    can help you understand your options — from payment plans to money claims and eviction.
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
                  productLinks.moneyClaim,
                  productLinks.completePack,
                  toolLinks.rentArrearsCalculator,
                  toolLinks.section8Generator,
                  blogLinks.rentArrearsEviction,
                  landingPageLinks.section8Template,
                ]}
              />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
