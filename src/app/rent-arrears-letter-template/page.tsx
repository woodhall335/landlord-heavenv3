import { Metadata } from 'next';
import Link from 'next/link';
import { StructuredData } from '@/lib/seo/structured-data';
import { SocialProofCounter } from '@/components/ui/SocialProofCounter';
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

export const metadata: Metadata = {
  title: 'Rent Arrears Letter Template - Free Download | Landlord Heaven',
  description: 'Download a free rent arrears letter template. Formal demand letters for unpaid rent. Escalate to money claim or eviction. Trusted by 10,000+ UK landlords.',
  keywords: [
    'rent arrears letter template',
    'rent demand letter',
    'late rent letter',
    'unpaid rent letter',
    'rent arrears notice',
    'tenant rent arrears',
    'formal rent demand',
  ],
  openGraph: {
    title: 'Rent Arrears Letter Template - Free Download | Landlord Heaven',
    description: 'Download a free rent arrears letter template. Formal demand letters for unpaid rent.',
    type: 'website',
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
        highPrice: '79.99',
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

      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-gray-50 to-white py-12 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {/* Badge */}
              <div className="flex items-center justify-center gap-2 mb-6">
                <span className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-full text-sm font-medium">
                  <PoundSterling className="w-4 h-4" />
                  Recover your rent
                </span>
              </div>

              {/* H1 with target keyword */}
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 text-center mb-6">
                Rent Arrears Letter Template
              </h1>

              <p className="text-xl text-gray-600 text-center mb-8 max-w-2xl mx-auto">
                Download a free <strong>rent arrears letter template</strong> to demand unpaid rent.
                Escalate to eviction or money claim if needed.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Link
                  href="/tools/free-rent-demand-letter"
                  className="inline-flex items-center justify-center gap-2 bg-white border-2 border-gray-200 hover:border-primary text-gray-900 font-semibold py-4 px-8 rounded-xl transition-all"
                >
                  <Download className="w-5 h-5" />
                  Try Free Template
                </Link>
                <Link
                  href="/products/money-claim"
                  className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold py-4 px-8 rounded-xl transition-colors"
                >
                  Get Money Claim Pack — £79.99
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>

              {/* Trust Signals */}
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Professional Format
                </span>
                <span className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-500" />
                  Legally Sound
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-green-500" />
                  Ready in 2 Minutes
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
                    href="/products/money-claim"
                    className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
                  >
                    Get Money Claim Pack — £79.99
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
                    href="/products/notice-only"
                    className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
                  >
                    Get Eviction Notice — £29.99
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
                Free Template vs Money Claim Pack
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Start with our free rent demand letter. Upgrade to the Money Claim Pack if you need
                to take court action.
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
                    className="block w-full text-center bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-900 font-semibold py-3 px-6 rounded-xl transition-colors"
                  >
                    Try Free Template
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
                    <div className="text-4xl font-bold text-gray-900 mt-2">£79.99</div>
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
                    href="/products/money-claim"
                    className="block w-full text-center bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
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
                className="inline-flex items-center gap-2 bg-white text-amber-600 hover:bg-gray-100 font-semibold py-4 px-8 rounded-xl transition-colors"
              >
                Send Your Demand Letter Now
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
                  className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold py-4 px-8 rounded-xl border border-white/30 transition-colors"
                >
                  <Download className="w-5 h-5" />
                  Try Free Template
                </Link>
                <Link
                  href="/products/money-claim"
                  className="inline-flex items-center justify-center gap-2 bg-white text-primary hover:bg-gray-100 font-semibold py-4 px-8 rounded-xl transition-colors"
                >
                  Get Money Claim Pack — £79.99
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
              <p className="mt-8 text-white/70 text-sm">
                Professional Format &bull; Court Claim Forms &bull; Interest Calculator
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
