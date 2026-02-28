import type { Metadata } from 'next';
import Link from 'next/link';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { buildWizardLink } from '@/lib/wizard/buildWizardLink';
import { getCanonicalUrl } from '@/lib/seo/urls';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import {
  CheckCircle,
  ArrowRight,
  Scale,
  FileText,
  PoundSterling,
  AlertTriangle,
  Calculator,
  Mail,
} from 'lucide-react';
import { FAQSection } from '@/components/seo/FAQSection';
import { NextLegalSteps } from '@/components/seo/NextLegalSteps';
import { productLinks, landingPageLinks, toolLinks } from '@/lib/seo/internal-links';
import { moneyClaimUnpaidRentFAQs } from '@/data/faqs';
import { FunnelCta, CrossSellBar } from '@/components/funnels';

const moneyClaimWizardLink = buildWizardLink({
  product: 'money_claim',
  jurisdiction: 'england',
  src: 'seo_money_claim_unpaid_rent',
  topic: 'debt',
});

export const metadata: Metadata = {
  title: 'Reclaim Rent from a Tenant | Solicitor-Style Money Claim Guide',
  description:
    'Reclaim unpaid rent without costly delays. Follow the compliant money-claim process, understand fees and timelines.',
  keywords: [
    'money claim online',
    'mcol',
    'claim unpaid rent',
    'landlord money claim',
    'rent arrears claim',
    'small claims court rent',
    'recover rent from tenant',
    'letter before action rent',
    'simple procedure scotland',
    'N1 claim form',
  ],
  openGraph: {
    title: 'Reclaim Rent from a Tenant | Solicitor-Style Money Claim Guide',
    description:
      'Landlord guide to recovering unpaid rent through courts in England, Wales, Scotland and Northern Ireland.',
    type: 'article',
    url: getCanonicalUrl('/money-claim-unpaid-rent'),
  },
  alternates: {
    canonical: getCanonicalUrl('/money-claim-unpaid-rent'),
  },
};

export default function MoneyClaimUnpaidRentPage() {
  return (
    <>
      <HeaderConfig mode="autoOnScroll" />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          { name: 'Claim Unpaid Rent', url: 'https://landlordheaven.co.uk/money-claim-unpaid-rent' },
        ])}
      />

      <main className="min-h-screen bg-gray-50">
        <UniversalHero
          badge="Recover what you're owed"
          badgeIcon={<PoundSterling className="w-4 h-4" />}
          title="Claim Unpaid Rent in the UK (Landlord Guide)"
          subtitle={<>Complete guide to recovering unpaid rent through <Link href="/money-claim-online-mcol" className="text-primary hover:underline font-semibold">Money Claim Online (MCOL)</Link> in England & Wales, <strong>Simple Procedure</strong> in Scotland, and court processes in Northern Ireland.</>}
          primaryCta={{ label: 'Start Money Claim Wizard', href: moneyClaimWizardLink }}
          secondaryCta={{ label: 'Calculate Arrears + Interest', href: '/tools/rent-arrears-calculator' }}
          variant="pastel"
        >
          <div className="max-w-2xl mx-auto mb-8">
            <FunnelCta
              title="Recover unpaid rent with a court-ready pack"
              subtitle="If the tenant still occupies the property, pair debt recovery with eviction action."
              primaryHref="/products/money-claim"
              primaryText="Start money claim"
              primaryDataCta="money-claim"
              location="above-fold"
              secondaryLinks={[{ href: '/products/complete-pack', text: 'If tenant is still in the property…', dataCta: 'complete-pack' }]}
            />
          </div>
          <p className="mt-4 text-sm text-gray-600">Money Claim Pack available for England only</p>
        </UniversalHero>

        <section className="py-6 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <CrossSellBar context="money-claim" location="mid" />
            </div>
          </div>
        </section>

        {/* Quick Links */}
        <section className="py-8 bg-white border-b">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Jump to your jurisdiction:
              </h2>
              <div className="flex flex-wrap gap-3">
                <a
                  href="#england-wales"
                  className="px-4 py-2 bg-gray-100 hover:bg-primary hover:text-white rounded-lg text-sm font-medium transition-colors"
                >
                  🏴󠁧󠁢󠁥󠁮󠁧󠁿 England & Wales (MCOL)
                </a>
                <a
                  href="#scotland"
                  className="px-4 py-2 bg-gray-100 hover:bg-blue-600 hover:text-white rounded-lg text-sm font-medium transition-colors"
                >
                  🏴󠁧󠁢󠁳󠁣󠁴󠁿 Scotland (Simple Procedure)
                </a>
                <a
                  href="#northern-ireland"
                  className="px-4 py-2 bg-gray-100 hover:bg-green-600 hover:text-white rounded-lg text-sm font-medium transition-colors"
                >
                  🇬🇧 Northern Ireland
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Before You Claim Section */}
        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Before You Make a Money Claim
              </h2>

              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-8 rounded-r-lg">
                <p className="text-amber-900 text-sm flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Important:</strong> You must follow the <Link href="/pre-action-protocol-debt" className="text-amber-800 hover:underline font-medium">Pre-Action Protocol</Link> before
                    starting court proceedings. This includes sending a formal letter before
                    action giving the tenant a chance to pay.
                  </span>
                </p>
              </div>

              {/* Ask Heaven callout */}
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-8">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">☁️</span>
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">
                      Have questions about rent arrears recovery?
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      Use our free{' '}
                      <Link href="/ask-heaven" className="text-primary font-medium hover:underline">
                        Ask Heaven landlord Q&amp;A tool
                      </Link>{' '}
                      to get instant answers about MCOL, Simple Procedure, or your legal options.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                      <Mail className="w-5 h-5 text-amber-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">1. Send Demand Letter</h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Send a formal letter before action demanding payment within 14-30 days.
                    This is a legal requirement before court action.
                  </p>
                  <Link
                    href="/tools/free-rent-demand-letter"
                    className="text-primary hover:underline font-medium text-sm"
                  >
                    Generate Free Demand Letter →
                  </Link>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Calculator className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">2. Calculate Total Owed</h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Calculate the total amount including rent arrears plus 8% statutory
                    interest from the date each payment was due.
                  </p>
                  <Link
                    href="/tools/rent-arrears-calculator"
                    className="text-primary hover:underline font-medium text-sm"
                  >
                    Calculate Arrears + Interest →
                  </Link>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Evidence You Will Need:</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Signed tenancy agreement
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Rent statements / schedule
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Bank statements showing missed payments
                    </li>
                  </ul>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Copy of letter before action
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Proof letter was sent (recorded delivery)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Any tenant correspondence
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Money Claim Costs, Timelines & Common Mistakes
              </h2>
              <p className="text-gray-600 mb-10">
                Courts move faster when landlords submit the right evidence and follow the
                pre-action rules. Use these checkpoints to avoid delays.
              </p>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Timeline overview</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>Letter before claim: 14 days.</li>
                    <li>Default judgment: 2–4 weeks.</li>
                    <li>Defended claim: 3–6 months.</li>
                  </ul>
                </div>
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Costs to plan</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>MCOL fees based on claim value.</li>
                    <li>Simple Procedure fees in Scotland.</li>
                    <li>Enforcement fees if tenant ignores judgment.</li>
                  </ul>
                </div>
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Common mistakes</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>Skipping the letter before action.</li>
                    <li>Missing proof of arrears.</li>
                    <li>Incorrect tenant address for service.</li>
                  </ul>
                  <Link
                    href="/products/money-claim"
                    className="text-primary text-sm font-medium hover:underline inline-flex mt-3"
                  >
                    Get the Money Claim Pack →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* England & Wales Section */}
        <section id="england-wales" className="py-12 lg:py-16 bg-white scroll-mt-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-4xl">🏴󠁧󠁢󠁥󠁮󠁧󠁿</span>
                <h2 className="text-3xl font-bold text-gray-900">
                  England & Wales: Money Claim Online (MCOL)
                </h2>
              </div>

              <div className="prose prose-lg max-w-none mb-8">
                <p>
                  <strong>Money Claim Online (MCOL)</strong> is the fastest and cheapest way
                  to make a money claim in England and Wales. You can claim amounts up to
                  £100,000 entirely online. For claims up to £10,000, the process is handled
                  through the small claims track.
                </p>
              </div>

              {/* MCOL Process Steps */}
              <div className="space-y-4 mb-8">
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                      1
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">Send Letter Before Action</h3>
                      <p className="text-gray-600 text-sm">
                        Give tenant 14-30 days to pay before starting proceedings.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                      2
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">
                        Start Claim on MCOL Website
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Register at moneyclaim.gov.uk and complete the online claim form. Pay
                        the court fee based on claim value.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                      3
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">Defendant Response</h3>
                      <p className="text-gray-600 text-sm">
                        The tenant has 14 days to respond. They can pay, admit the claim, or
                        defend it.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                      4
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">Get Judgment</h3>
                      <p className="text-gray-600 text-sm">
                        If no response, request default judgment. If defended, case proceeds
                        to hearing.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                      5
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">Enforcement (if needed)</h3>
                      <p className="text-gray-600 text-sm">
                        If tenant still does not pay, use enforcement: bailiffs, attachment of
                        earnings, charging orders.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Court Fees Table */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-8">
                <div className="bg-gray-50 px-6 py-4 border-b">
                  <h3 className="font-bold text-gray-900">
                    MCOL Court Fees (England & Wales)
                  </h3>
                  <p className="text-sm text-gray-500">
                    Fees as of 2026 - check gov.uk for current rates
                  </p>
                </div>
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="px-6 py-3 text-left font-semibold text-gray-900">
                        Claim Amount
                      </th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-900">
                        Court Fee
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-3 text-gray-600">Up to £300</td>
                      <td className="px-6 py-3 text-gray-900 font-medium">£35</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-3 text-gray-600">£300.01 - £500</td>
                      <td className="px-6 py-3 text-gray-900 font-medium">£50</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-3 text-gray-600">£500.01 - £1,000</td>
                      <td className="px-6 py-3 text-gray-900 font-medium">£70</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-3 text-gray-600">£1,000.01 - £1,500</td>
                      <td className="px-6 py-3 text-gray-900 font-medium">£80</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-3 text-gray-600">£1,500.01 - £3,000</td>
                      <td className="px-6 py-3 text-gray-900 font-medium">£115</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-3 text-gray-600">£3,000.01 - £5,000</td>
                      <td className="px-6 py-3 text-gray-900 font-medium">£205</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-3 text-gray-600">£5,000.01 - £10,000</td>
                      <td className="px-6 py-3 text-gray-900 font-medium">£455</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="p-6 bg-primary/5 rounded-xl border border-primary/20">
                <h4 className="font-bold text-gray-900 mb-3">Need Help with Your Claim?</h4>
                <p className="text-gray-600 text-sm mb-4">
                  Our Money Claim Pack includes pre-filled N1 claim form, letter before
                  action, rent schedule, and step-by-step guidance.
                </p>
                <Link
                  href="/products/money-claim"
                  className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90"
                >
                  <FileText className="w-4 h-4" />
                  Get Money Claim Pack — £44.99
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Scotland Section */}
        <section id="scotland" className="py-12 lg:py-16 bg-blue-50 scroll-mt-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-4xl">🏴󠁧󠁢󠁳󠁣󠁴󠁿</span>
                <h2 className="text-3xl font-bold text-gray-900">
                  Scotland: Simple Procedure
                </h2>
              </div>

              <div className="prose prose-lg max-w-none mb-8">
                <p>
                  In Scotland, money claims up to £5,000 use the{' '}
                  <strong>Simple Procedure</strong> through the Sheriff Court. This is
                  similar to England&apos;s small claims track. For claims over £5,000, you use
                  Ordinary Cause procedure.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Simple Procedure Process
                </h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
                    <span>
                      <strong>Step 1:</strong> Send a formal demand letter to the tenant
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
                    <span>
                      <strong>Step 2:</strong> Complete Simple Claim Form (Form 3A) online or
                      on paper
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
                    <span>
                      <strong>Step 3:</strong> Submit to your local Sheriff Court with the fee
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
                    <span>
                      <strong>Step 4:</strong> Court serves claim on the tenant
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
                    <span>
                      <strong>Step 5:</strong> If not disputed, get a decision. If disputed,
                      attend hearing.
                    </span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
                <div className="bg-blue-100 px-6 py-4 border-b">
                  <h3 className="font-bold text-gray-900">
                    Scotland Simple Procedure Fees
                  </h3>
                </div>
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="px-6 py-3 text-left font-semibold text-gray-900">
                        Claim Amount
                      </th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-900">
                        Court Fee
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-3 text-gray-600">Up to £300</td>
                      <td className="px-6 py-3 text-gray-900 font-medium">£19</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-3 text-gray-600">£300.01 - £1,500</td>
                      <td className="px-6 py-3 text-gray-900 font-medium">£77</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-3 text-gray-600">£1,500.01 - £3,000</td>
                      <td className="px-6 py-3 text-gray-900 font-medium">£87</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-3 text-gray-600">£3,000.01 - £5,000</td>
                      <td className="px-6 py-3 text-gray-900 font-medium">£104</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="text-sm text-gray-500">
                For claims over £5,000, use Ordinary Cause procedure (higher fees apply).
                Check Scottish Courts website for current fees.
              </p>
            </div>
          </div>
        </section>

        {/* Northern Ireland Section */}
        <section id="northern-ireland" className="py-12 lg:py-16 bg-green-50 scroll-mt-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-4xl">🇬🇧</span>
                <h2 className="text-3xl font-bold text-gray-900">
                  Northern Ireland: Small Claims Court
                </h2>
              </div>

              <div className="prose prose-lg max-w-none mb-8">
                <p>
                  In Northern Ireland, money claims up to £3,000 go through the{' '}
                  <strong>Small Claims Court</strong>. Larger claims use the County Court.
                  The process is similar to England but uses NI-specific forms and courts.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Northern Ireland Debt Recovery
                </h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
                    <span>
                      <strong>Small claims (up to £3,000):</strong> Simplified process through
                      the Small Claims Court
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
                    <span>
                      <strong>Larger claims:</strong> County Court civil bill process
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
                    <span>
                      <strong>Pre-action:</strong> Send letter before action as in other
                      jurisdictions
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
                    <span>
                      <strong>Forms:</strong> Check NI Courts and Tribunals Service website
                      for current forms
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Eviction vs Money Claim */}
        <section className="py-12 lg:py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Eviction vs Money Claim: What&apos;s the Difference?
              </h2>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-red-50 rounded-xl p-6 border border-red-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Scale className="w-5 h-5 text-red-600" />
                    Eviction (Possession Claim)
                  </h3>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">•</span>
                      Gets the tenant OUT of the property
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">•</span>
                      Uses Section 21/8 (England) or Notice to Leave (Scotland)
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">•</span>
                      Does NOT automatically include money judgment
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">•</span>
                      May include money claim in same proceedings
                    </li>
                  </ul>
                  <Link
                    href="/how-to-evict-tenant"
                    className="inline-flex items-center gap-2 mt-4 text-red-600 hover:underline font-medium text-sm"
                  >
                    Learn about eviction →
                  </Link>
                </div>

                <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <PoundSterling className="w-5 h-5 text-green-600" />
                    Money Claim
                  </h3>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">•</span>
                      Gets you PAID for the rent owed
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">•</span>
                      Uses MCOL (England/Wales) or Simple Procedure (Scotland)
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">•</span>
                      Does NOT remove tenant from property
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">•</span>
                      Can be pursued against former tenants
                    </li>
                  </ul>
                  <Link
                    href="/products/money-claim"
                    className="inline-flex items-center gap-2 mt-4 text-green-600 hover:underline font-medium text-sm"
                  >
                    Get Money Claim Pack →
                  </Link>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                <h4 className="font-bold text-amber-900 mb-2">
                  Can I do both at the same time?
                </h4>
                <p className="text-amber-800">
                  Yes! Many landlords pursue eviction first, then make a separate money claim
                  for arrears. Alternatively, you can claim arrears in the possession
                  proceedings by including a money claim in your court forms. Our Complete
                  Eviction Pack includes both.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-br from-green-700 to-green-600 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">Ready to Claim Your Unpaid Rent?</h2>
              <p className="text-xl text-green-100 mb-8">
                Our Money Claim Pack (England only) includes everything you need: letter before action, N1
                claim form, rent schedule, and step-by-step guidance.
              </p>
              <div className="max-w-2xl mx-auto mb-8">
                <FunnelCta
                  title="Recover unpaid rent with a court-ready pack"
                  subtitle="If the tenant still occupies the property, pair debt recovery with eviction action."
                  primaryHref="/products/money-claim"
                  primaryText="Start money claim"
                  primaryDataCta="money-claim"
                  location="above-fold"
                  secondaryLinks={[{ href: '/products/complete-pack', text: 'If tenant is still in the property…', dataCta: 'complete-pack' }]}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/products/money-claim"
                  className="inline-flex items-center justify-center gap-2 bg-white text-green-700 font-semibold py-4 px-8 rounded-xl hover:bg-green-50 transition-colors"
                >
                  Get Money Claim Pack — £44.99
                </Link>
                <Link
                  href="/tools/rent-arrears-calculator"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold py-4 px-8 rounded-xl transition-colors border border-white/30"
                >
                  <Calculator className="w-5 h-5" />
                  Calculate What You&apos;re Owed
                </Link>
              </div>
              <p className="mt-4 text-sm text-green-200">
                Pack available for England only. See sections above for Scotland and Northern Ireland court processes.
              </p>
            </div>
          </div>
        </section>

        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <NextLegalSteps
                jurisdictionLabel="UK money claims"
                scenarioLabel="recovering rent arrears"
                primaryCTA={{
                  label: 'Start money claim pack — £44.99',
                  href: productLinks.moneyClaim.href,
                }}
                secondaryCTA={{
                  label: 'Calculate arrears + interest',
                  href: toolLinks.rentArrearsCalculator.href,
                }}
                relatedLinks={[
                  {
                    href: landingPageLinks.rentArrearsTemplate.href,
                    title: landingPageLinks.rentArrearsTemplate.title,
                    description: landingPageLinks.rentArrearsTemplate.description,
                  },
                  {
                    href: '/blog/uk-money-claims-online-guide',
                    title: 'UK Money Claim Online guide',
                    description: 'MCOL steps, fees, and enforcement tips.',
                  },
                  {
                    href: '/blog/england-money-claim-online',
                    title: 'England & Wales MCOL guide',
                    description: 'Claim routes and court forms for MCOL.',
                  },
                  {
                    href: '/blog/scotland-simple-procedure',
                    title: 'Scotland Simple Procedure',
                    description: 'Sheriff Court route for arrears claims.',
                  },
                ]}
              />
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <FAQSection
          title="Frequently Asked Questions"
          faqs={moneyClaimUnpaidRentFAQs}
          showContactCTA={false}
          variant="white"
        />
        <section className="py-10 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <FunnelCta
                title="Unsure whether to evict or claim?"
                subtitle="Use our decision guide to choose the best route for your case."
                primaryHref="/products/money-claim"
                primaryText="Continue with money claim"
                primaryDataCta="money-claim"
                location="bottom"
                secondaryLinks={[
                  { href: '/products/complete-pack', text: 'If tenant is still in the property…', dataCta: 'complete-pack' },
                  { href: '/tenant-not-paying-rent', text: 'Back to tenant not paying rent hub' },
                ]}
              />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
