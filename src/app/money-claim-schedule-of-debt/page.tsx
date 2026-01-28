import type { Metadata } from 'next';
import Link from 'next/link';
import { getCanonicalUrl } from '@/lib/seo/urls';
import { StructuredData, faqPageSchema, breadcrumbSchema, articleSchema } from '@/lib/seo/structured-data';
import {
  CheckCircle,
  ArrowRight,
  AlertTriangle,
  Calculator,
  FileText,
  Table,
  ClipboardList,
} from 'lucide-react';
import { FAQSection } from '@/components/marketing/FAQSection';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { moneyClaimGuides, moneyClaimForms, moneyClaimFormLinks, productLinks } from '@/lib/seo/internal-links';

export const metadata: Metadata = {
  title: 'Schedule of Debt Template for Landlords 2026 | Rent Arrears Breakdown',
  description:
    'How to create a Schedule of Debt for tenant money claims. Template and examples for rent arrears, damage costs, and other landlord claims.',
  keywords: [
    'schedule of debt',
    'rent arrears schedule',
    'debt breakdown template',
    'tenant debt schedule',
    'landlord debt calculation',
    'rent arrears calculation',
    'money claim schedule',
    'debt itemisation',
    'schedule of arrears',
    'tenant arrears breakdown',
  ],
  openGraph: {
    title: 'Schedule of Debt Template for Landlords 2026 | Rent Arrears Breakdown',
    description:
      'How to create a clear Schedule of Debt for court claims against tenants.',
    type: 'article',
    url: getCanonicalUrl('/money-claim-schedule-of-debt'),
  },
  alternates: {
    canonical: getCanonicalUrl('/money-claim-schedule-of-debt'),
  },
};

const faqs = [
  {
    question: 'What is a Schedule of Debt?',
    answer:
      'A Schedule of Debt is a detailed breakdown showing exactly what the debtor owes and how you calculated it. For landlord claims, it typically lists rent due, rent paid, arrears by period, damage costs, other debts, and interest - all totalled clearly.',
  },
  {
    question: 'Is a Schedule of Debt required for court?',
    answer:
      'It\'s not a formal court requirement, but judges strongly expect itemised breakdowns. A clear Schedule of Debt makes your claim easier to understand and more likely to succeed. It\'s also required as part of the Pre-Action Protocol for Debt Claims.',
  },
  {
    question: 'What should a landlord\'s Schedule of Debt include?',
    answer:
      'Include: rent periods and amounts due, payments received and dates, outstanding balance per period, any other debts (utilities, damage, etc.) with dates and amounts, interest calculation, and grand total. Show your working clearly.',
  },
  {
    question: 'How do I calculate rent arrears in the schedule?',
    answer:
      'List each rent period chronologically. Show: rent due for that period, any payment received, running balance. For example: "March 2025: £1,200 due, £0 paid, balance £1,200. April 2025: £1,200 due, £500 paid, balance £1,900."',
  },
  {
    question: 'Should I include interest in the Schedule of Debt?',
    answer:
      'Yes. Show interest as a separate line item. Calculate at 8% per year (statutory rate) from when each debt was due until your claim date. Break down the calculation so the court can verify it.',
  },
  {
    question: 'What if the tenant made partial payments?',
    answer:
      'Record every payment received with dates and amounts. Apply payments to the oldest debt first (unless agreed otherwise). Your schedule should clearly show the running balance after each payment.',
  },
  {
    question: 'Can I include multiple debt types in one schedule?',
    answer:
      'Yes. Group them logically: rent arrears in one section, damage costs in another, utilities in another. Total each section, then show the grand total at the end. This helps the court understand your claim.',
  },
  {
    question: 'How detailed should damage costs be in the schedule?',
    answer:
      'List each item of damage separately with: description, date discovered, repair cost (quote or invoice), and reference to supporting evidence. For example: "Carpet replacement (bedroom) - £450 - per invoice dated 15/03/2025".',
  },
  {
    question: 'What format should I use?',
    answer:
      'A table format works best. Use spreadsheet software or create a simple table with columns for: Date, Description, Amount Due, Amount Paid, Balance. Keep it clear and easy to read.',
  },
  {
    question: 'Should I attach supporting documents?',
    answer:
      'Reference supporting documents in your schedule (e.g., "per invoice at Exhibit 3") but don\'t attach everything to the schedule itself. Keep the schedule clean; provide supporting documents separately as exhibits.',
  },
];

export default function MoneyClaimScheduleOfDebtPage() {
  return (
    <>
      <StructuredData
        data={articleSchema({
          headline: 'Schedule of Debt Template for Landlords (UK Guide)',
          description:
            'How to create a clear Schedule of Debt for tenant money claims.',
          url: getCanonicalUrl('/money-claim-schedule-of-debt'),
          datePublished: '2026-01-15',
          dateModified: '2026-01-15',
        })}
      />
      <StructuredData data={faqPageSchema(faqs)} />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          { name: 'Money Claim Guide', url: 'https://landlordheaven.co.uk/money-claim-unpaid-rent' },
          { name: 'Schedule of Debt', url: 'https://landlordheaven.co.uk/money-claim-schedule-of-debt' },
        ])}
      />

      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-teal-900 to-teal-800 text-white py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-teal-700/50 text-teal-100 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Calculator className="w-4 h-4" />
                Essential for court claims
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                Schedule of Debt Guide
              </h1>

              <p className="text-xl text-teal-100 mb-8 max-w-2xl mx-auto">
                A clear breakdown of what your tenant owes makes your claim easier to
                understand and more likely to succeed. Here&apos;s how to create one.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/wizard?product=money_claim&src=seo_schedule"
                  className="inline-flex items-center justify-center gap-2 bg-white text-teal-800 font-semibold py-4 px-8 rounded-xl hover:bg-teal-50 transition-colors"
                >
                  Generate Your Schedule
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/products/money-claim"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold py-4 px-8 rounded-xl transition-colors border border-white/20"
                >
                  <FileText className="w-5 h-5" />
                  View Money Claim Pack
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Why You Need It Section */}
        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Why You Need a Schedule of Debt
              </h2>

              <div className="prose prose-gray max-w-none mb-8">
                <p className="text-lg text-gray-600">
                  A Schedule of Debt is your evidence that you&apos;ve calculated the claim
                  correctly. Judges expect to see clear, itemised breakdowns. A well-prepared
                  schedule shows professionalism and makes your claim harder to dispute.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                    <Table className="w-6 h-6 text-teal-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Shows Your Working</h3>
                  <p className="text-sm text-gray-600">
                    Judges can verify your calculation. Transparency builds credibility.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                    <CheckCircle className="w-6 h-6 text-teal-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Harder to Dispute</h3>
                  <p className="text-sm text-gray-600">
                    Clear breakdowns leave less room for the tenant to argue about amounts.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                    <ClipboardList className="w-6 h-6 text-teal-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Protocol Compliant</h3>
                  <p className="text-sm text-gray-600">
                    Pre-Action Protocol expects itemised breakdowns in debt claims.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Example Schedule Section */}
        <section className="py-12 lg:py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Example Schedule of Debt
              </h2>

              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 mb-8 overflow-x-auto">
                <h3 className="font-bold text-gray-900 mb-4">Rent Arrears</h3>
                <table className="w-full text-sm mb-6">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-200 px-3 py-2 text-left">Period</th>
                      <th className="border border-gray-200 px-3 py-2 text-right">Rent Due</th>
                      <th className="border border-gray-200 px-3 py-2 text-right">Paid</th>
                      <th className="border border-gray-200 px-3 py-2 text-right">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-200 px-3 py-2">March 2025</td>
                      <td className="border border-gray-200 px-3 py-2 text-right">£1,200.00</td>
                      <td className="border border-gray-200 px-3 py-2 text-right">£1,200.00</td>
                      <td className="border border-gray-200 px-3 py-2 text-right">£0.00</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-200 px-3 py-2">April 2025</td>
                      <td className="border border-gray-200 px-3 py-2 text-right">£1,200.00</td>
                      <td className="border border-gray-200 px-3 py-2 text-right">£600.00</td>
                      <td className="border border-gray-200 px-3 py-2 text-right">£600.00</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 px-3 py-2">May 2025</td>
                      <td className="border border-gray-200 px-3 py-2 text-right">£1,200.00</td>
                      <td className="border border-gray-200 px-3 py-2 text-right">£0.00</td>
                      <td className="border border-gray-200 px-3 py-2 text-right">£1,800.00</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-200 px-3 py-2">June 2025</td>
                      <td className="border border-gray-200 px-3 py-2 text-right">£1,200.00</td>
                      <td className="border border-gray-200 px-3 py-2 text-right">£0.00</td>
                      <td className="border border-gray-200 px-3 py-2 text-right">£3,000.00</td>
                    </tr>
                    <tr className="font-semibold">
                      <td className="border border-gray-200 px-3 py-2" colSpan={3}>Rent Arrears Total</td>
                      <td className="border border-gray-200 px-3 py-2 text-right">£3,000.00</td>
                    </tr>
                  </tbody>
                </table>

                <h3 className="font-bold text-gray-900 mb-4">Damage Costs</h3>
                <table className="w-full text-sm mb-6">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-200 px-3 py-2 text-left">Item</th>
                      <th className="border border-gray-200 px-3 py-2 text-left">Reference</th>
                      <th className="border border-gray-200 px-3 py-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-200 px-3 py-2">Carpet replacement (lounge)</td>
                      <td className="border border-gray-200 px-3 py-2">Invoice - Exhibit 3</td>
                      <td className="border border-gray-200 px-3 py-2 text-right">£650.00</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-200 px-3 py-2">Wall repair and repaint</td>
                      <td className="border border-gray-200 px-3 py-2">Invoice - Exhibit 4</td>
                      <td className="border border-gray-200 px-3 py-2 text-right">£280.00</td>
                    </tr>
                    <tr className="font-semibold">
                      <td className="border border-gray-200 px-3 py-2" colSpan={2}>Damage Total</td>
                      <td className="border border-gray-200 px-3 py-2 text-right">£930.00</td>
                    </tr>
                  </tbody>
                </table>

                <h3 className="font-bold text-gray-900 mb-4">Summary</h3>
                <table className="w-full text-sm">
                  <tbody>
                    <tr>
                      <td className="border border-gray-200 px-3 py-2">Rent Arrears</td>
                      <td className="border border-gray-200 px-3 py-2 text-right">£3,000.00</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-200 px-3 py-2">Damage Costs</td>
                      <td className="border border-gray-200 px-3 py-2 text-right">£930.00</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 px-3 py-2">Interest (8% from due dates)</td>
                      <td className="border border-gray-200 px-3 py-2 text-right">£142.50</td>
                    </tr>
                    <tr className="font-bold bg-teal-50">
                      <td className="border border-gray-200 px-3 py-2">TOTAL CLAIMED</td>
                      <td className="border border-gray-200 px-3 py-2 text-right">£4,072.50</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
                <p className="text-amber-900 text-sm flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Keep it simple:</strong> Use clear columns, round numbers where
                    appropriate, and reference supporting documents. The judge should be able
                    to follow your calculation in seconds.
                  </span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Tips Section */}
        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Tips for Creating Your Schedule
              </h2>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-3">Do:</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      Use a clear table format
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      Include dates for everything
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      Show running balances
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      Reference supporting evidence
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      Calculate interest separately
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      Include a clear total
                    </li>
                  </ul>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-3">Don&apos;t:</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0">✗</span>
                      Lump everything into one figure
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0">✗</span>
                      Forget to show payments received
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0">✗</span>
                      Include items you can&apos;t evidence
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0">✗</span>
                      Round up unfairly
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0">✗</span>
                      Make calculation errors
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0">✗</span>
                      Use confusing formatting
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 lg:py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Get Your Schedule of Debt Generated
              </h2>
              <p className="text-gray-600 mb-8">
                Our Money Claim Pack automatically generates a professional Schedule
                of Debt based on the information you provide about your claim.
              </p>
              <Link
                href="/wizard?product=money_claim&src=seo_schedule"
                className="inline-flex items-center justify-center gap-2 bg-primary text-white font-semibold py-4 px-8 rounded-xl hover:bg-primary/90 transition-colors"
              >
                Generate Your Documents — £149.99
                <ArrowRight className="w-5 h-5" />
              </Link>
              <p className="text-sm text-gray-500 mt-3">
                Includes Schedule of Debt, LBA, Particulars of Claim, and guide
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                Frequently Asked Questions
              </h2>
              <FAQSection faqs={faqs} />
            </div>
          </div>
        </section>

        {/* Related Links */}
        <section className="py-12 lg:py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Related Guides
              </h2>
              <RelatedLinks
                links={[
                  moneyClaimForms.letterBeforeAction,
                  moneyClaimForms.n1Form,
                  moneyClaimGuides.unpaidRent,
                  productLinks.moneyClaim,
                ]}
              />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
