import type { Metadata } from 'next';
import Link from 'next/link';
import { getCanonicalUrl } from '@/lib/seo/urls';
import { StructuredData, faqPageSchema, breadcrumbSchema } from '@/lib/seo/structured-data';
import {
  CheckCircle,
  ArrowRight,
  Scale,
  FileText,
  Info,
  PoundSterling,
  AlertTriangle,
  Calculator,
  Mail,
} from 'lucide-react';
import { FAQSection } from '@/components/marketing/FAQSection';

export const metadata: Metadata = {
  title: 'Claim Unpaid Rent UK - Money Claim Online (MCOL) Guide 2026',
  description:
    'How to claim unpaid rent from tenants in the UK. Money Claim Online (MCOL) for England & Wales, Simple Procedure for Scotland, NI debt recovery. Letter before action templates.',
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
    title: 'Claim Unpaid Rent UK - MCOL, Scotland & NI Guide',
    description:
      'Complete guide to recovering unpaid rent through the courts in England, Wales, Scotland and Northern Ireland.',
    type: 'article',
    url: getCanonicalUrl('/money-claim-unpaid-rent'),
  },
  alternates: {
    canonical: getCanonicalUrl('/money-claim-unpaid-rent'),
  },
};

const faqs = [
  {
    question: 'What is Money Claim Online (MCOL)?',
    answer:
      'Money Claim Online (MCOL) is an online service for making money claims in England and Wales. It allows landlords to claim unpaid rent and other debts up to £100,000 through a simple online process. It is faster and cheaper than paper claims.',
  },
  {
    question: 'How much does it cost to make a money claim?',
    answer:
      'Court fees for MCOL in England & Wales range from £35 (claims up to £300) to £455 (claims £5,000-£10,000). For larger claims, fees increase further. Scotland Simple Procedure costs £19 (claims up to £300) to £104 (claims £3,001-£5,000). You can usually claim these fees back from the defendant if you win.',
  },
  {
    question: 'Do I need to send a letter before action?',
    answer:
      'Yes. Before making a court claim, you should send a formal "letter before action" giving the tenant a final chance to pay (usually 14 days). This is required by court rules (Pre-Action Protocol) and failure to follow it may affect costs awarded. Our rent demand letter tool can help.',
  },
  {
    question: 'Can I claim rent AND evict at the same time?',
    answer:
      'Yes, but they are separate legal processes. A possession claim (eviction) does not automatically include a money judgment for arrears. You can claim both in the same proceedings using the appropriate court forms, or make separate claims. Many landlords pursue eviction first, then claim arrears.',
  },
  {
    question: 'How long does a money claim take?',
    answer:
      'If the tenant does not respond to your claim (default judgment), you may get judgment in 2-4 weeks. If they dispute the claim, it could take 3-6 months to reach a hearing. Enforcement after judgment can add more time.',
  },
  {
    question: 'What if the tenant has no money to pay?',
    answer:
      'A County Court Judgment (CCJ) lasts 6 years and affects the tenant\'s credit rating. You can use various enforcement methods including attachment of earnings, bailiffs, charging orders on property, and third party debt orders. However, you cannot get money that does not exist - consider whether it is worth pursuing.',
  },
  {
    question: 'Can I claim interest on rent arrears?',
    answer:
      'Yes. You can claim statutory interest at 8% per year on the unpaid amount. This accrues from the date each rent payment was due. Our rent arrears calculator can help you work out the total with interest.',
  },
  {
    question: 'How do I make a money claim in Scotland?',
    answer:
      'In Scotland, claims up to £5,000 use the Simple Procedure through the Sheriff Court. You complete a Simple Claim Form (Form 3A) either online or on paper. For claims over £5,000, you use Ordinary Cause procedure. The process is similar to MCOL but uses Scottish forms and courts.',
  },
  {
    question: 'How do I make a money claim in Northern Ireland?',
    answer:
      'In Northern Ireland, small claims (up to £3,000) go through the Small Claims Court. Larger claims use the County Court. The process involves completing claim forms and paying the appropriate fee. Check the NI Courts and Tribunals Service website for current forms and fees.',
  },
  {
    question: 'What evidence do I need for a money claim?',
    answer:
      'Key evidence includes: the tenancy agreement showing rent amount and payment terms, rent statements showing missed payments, bank statements showing non-payment, copies of demand letters sent, any tenant correspondence acknowledging the debt, and proof of deposit protection compliance.',
  },
  {
    question: 'Can I use MCOL if the tenant has left?',
    answer:
      'Yes. You can make a money claim against a former tenant for unpaid rent. You will need their current address for service. If you do not have their address, you may need to use tracing services or apply to the court for alternative service.',
  },
  {
    question: 'What is a CCJ and how does it affect the tenant?',
    answer:
      'A County Court Judgment (CCJ) is a court order confirming someone owes you money. It appears on the tenant\'s credit file for 6 years and makes it very difficult for them to get credit, mortgages, or pass landlord reference checks. This can be a powerful incentive for payment.',
  },
];

export default function MoneyClaimUnpaidRentPage() {
  return (
    <>
      <StructuredData data={faqPageSchema(faqs)} />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          { name: 'Claim Unpaid Rent', url: 'https://landlordheaven.co.uk/money-claim-unpaid-rent' },
        ])}
      />

      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-green-900 to-green-800 text-white py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-green-700/50 text-green-100 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <PoundSterling className="w-4 h-4" />
                Recover what you&apos;re owed
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                Claim Unpaid Rent in the UK
              </h1>

              <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
                Complete guide to recovering unpaid rent through{' '}
                <strong>Money Claim Online (MCOL)</strong> in England & Wales,{' '}
                <strong>Simple Procedure</strong> in Scotland, and court processes in
                Northern Ireland.
              </p>

              {/* Disclaimer */}
              <div className="bg-green-950/50 border border-green-700 rounded-lg p-4 mb-8 text-left max-w-2xl mx-auto">
                <p className="text-sm text-green-100 flex items-start gap-2">
                  <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Not legal advice:</strong> This guide provides general information
                    only. Court fees and processes can change. Check current government
                    guidance or consult a solicitor for complex cases.
                  </span>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/products/money-claim"
                  className="inline-flex items-center justify-center gap-2 bg-white text-green-800 font-semibold py-4 px-8 rounded-xl hover:bg-green-50 transition-colors"
                >
                  Get Money Claim Pack — £199.99
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/tools/rent-arrears-calculator"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold py-4 px-8 rounded-xl transition-colors border border-white/20"
                >
                  <Calculator className="w-5 h-5" />
                  Calculate Arrears + Interest
                </Link>
              </div>
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
                    <strong>Important:</strong> You must follow the Pre-Action Protocol before
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
                  Get Money Claim Pack — £199.99
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
                Our Money Claim Pack includes everything you need: letter before action, N1
                claim form (or Form 3A for Scotland), rent schedule, and step-by-step
                guidance.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/products/money-claim"
                  className="inline-flex items-center justify-center gap-2 bg-white text-green-700 font-semibold py-4 px-8 rounded-xl hover:bg-green-50 transition-colors"
                >
                  Get Money Claim Pack — £199.99
                </Link>
                <Link
                  href="/tools/rent-arrears-calculator"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold py-4 px-8 rounded-xl transition-colors border border-white/30"
                >
                  <Calculator className="w-5 h-5" />
                  Calculate What You&apos;re Owed
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <FAQSection
          title="Frequently Asked Questions"
          faqs={faqs}
          showContactCTA={false}
          variant="white"
        />

        {/* Related Links */}
        <section className="py-12 bg-gray-100 border-t">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Related Pages</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link
                  href="/rent-arrears-letter-template"
                  className="bg-white p-4 rounded-lg border border-gray-200 hover:border-green-500 hover:shadow-sm transition-all"
                >
                  <span className="font-medium text-gray-900">Rent Arrears Letter</span>
                  <p className="text-sm text-gray-500">Letter before action template</p>
                </Link>
                <Link
                  href="/tools/rent-arrears-calculator"
                  className="bg-white p-4 rounded-lg border border-gray-200 hover:border-green-500 hover:shadow-sm transition-all"
                >
                  <span className="font-medium text-gray-900">Rent Arrears Calculator</span>
                  <p className="text-sm text-gray-500">Calculate total with interest</p>
                </Link>
                <Link
                  href="/tools/free-rent-demand-letter"
                  className="bg-white p-4 rounded-lg border border-gray-200 hover:border-green-500 hover:shadow-sm transition-all"
                >
                  <span className="font-medium text-gray-900">Free Demand Letter</span>
                  <p className="text-sm text-gray-500">Generate demand letter</p>
                </Link>
                <Link
                  href="/how-to-evict-tenant"
                  className="bg-white p-4 rounded-lg border border-gray-200 hover:border-green-500 hover:shadow-sm transition-all"
                >
                  <span className="font-medium text-gray-900">UK Eviction Guide</span>
                  <p className="text-sm text-gray-500">Complete eviction process</p>
                </Link>
                <Link
                  href="/section-8-notice-template"
                  className="bg-white p-4 rounded-lg border border-gray-200 hover:border-green-500 hover:shadow-sm transition-all"
                >
                  <span className="font-medium text-gray-900">Section 8 Template</span>
                  <p className="text-sm text-gray-500">Rent arrears eviction</p>
                </Link>
                <Link
                  href="/products/money-claim"
                  className="bg-white p-4 rounded-lg border border-gray-200 hover:border-green-500 hover:shadow-sm transition-all"
                >
                  <span className="font-medium text-gray-900">Money Claim Pack</span>
                  <p className="text-sm text-gray-500">All documents included</p>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
