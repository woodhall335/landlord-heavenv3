import type { Metadata } from 'next';
import Link from 'next/link';
import { getCanonicalUrl } from '@/lib/seo/urls';
import { StructuredData, faqPageSchema, breadcrumbSchema, articleSchema } from '@/lib/seo/structured-data';
import {
  CheckCircle,
  ArrowRight,
  AlertTriangle,
  Mail,
  FileText,
  Clock,
  ClipboardList,
} from 'lucide-react';
import { FAQSection } from '@/components/marketing/FAQSection';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { moneyClaimGuides, moneyClaimForms, moneyClaimFormLinks, productLinks } from '@/lib/seo/internal-links';

export const metadata: Metadata = {
  title: 'Letter Before Action Template for Landlords 2026 | Pre-Action Protocol',
  description:
    'Free guide to writing a Letter Before Action for tenant debt claims. What to include, when to send, and Pre-Action Protocol requirements.',
  keywords: [
    'letter before action',
    'letter before action template',
    'pre-action protocol',
    'LBA template',
    'demand letter tenant',
    'landlord demand letter',
    'letter before court',
    'pre-action letter',
    'debt recovery letter',
    'tenant debt letter',
  ],
  openGraph: {
    title: 'Letter Before Action Template for Landlords 2026 | Pre-Action Protocol',
    description:
      'Complete guide to Letter Before Action for landlord money claims against tenants.',
    type: 'article',
    url: getCanonicalUrl('/money-claim-letter-before-action'),
  },
  alternates: {
    canonical: getCanonicalUrl('/money-claim-letter-before-action'),
  },
};

const faqs = [
  {
    question: 'What is a Letter Before Action (LBA)?',
    answer:
      'A Letter Before Action is a formal demand for payment sent before starting court proceedings. It\'s required under the Pre-Action Protocol for Debt Claims. It gives the debtor a final chance to pay before you issue a court claim.',
  },
  {
    question: 'Is a Letter Before Action legally required?',
    answer:
      'Yes, under the Pre-Action Protocol for Debt Claims. If you don\'t send one (or don\'t send a compliant one), the court may penalise you in costs or delay your claim. It\'s also good practice as many debtors pay when they see a formal letter.',
  },
  {
    question: 'How long must I wait after sending the letter?',
    answer:
      'You must give the debtor at least 14 days to respond from the date they receive the letter. If you send by first class post, add 2 working days for delivery. So typically wait 16-17 days from posting before issuing your claim.',
  },
  {
    question: 'What must a Letter Before Action include?',
    answer:
      'It must include: your full name and address, the debtor\'s name and address, the amount claimed (with breakdown), why they owe the money, a deadline to pay (at least 14 days), what happens if they don\'t pay (court action), and information about debt advice.',
  },
  {
    question: 'Do I need to include debt advice information?',
    answer:
      'Yes. The Pre-Action Protocol requires you to include information about free debt advice services, such as Citizens Advice, StepChange, or National Debtline. Include at least one contact option.',
  },
  {
    question: 'What if the tenant disputes the debt in response?',
    answer:
      'If they respond disputing the debt, you should consider their response before proceeding. You don\'t have to agree, but you should address their points. Courts expect parties to try to resolve disputes before litigation.',
  },
  {
    question: 'Can I email the Letter Before Action?',
    answer:
      'You can send by email if you have previously communicated by email with the debtor. However, post is safer as proof of delivery. Consider sending by both email and recorded delivery post.',
  },
  {
    question: 'What if the tenant ignores the letter?',
    answer:
      'If they don\'t respond within 14 days, you can proceed to issue your court claim. Keep proof you sent the letter (certificate of posting, recorded delivery receipt, or email send receipt) as evidence.',
  },
  {
    question: 'Should I include interest in the Letter Before Action?',
    answer:
      'Yes. Include the principal debt plus any interest accrued to date. State you reserve the right to claim further interest until payment. This puts the debtor on notice of the full amount they\'ll face in court.',
  },
  {
    question: 'Can I send multiple Letters Before Action?',
    answer:
      'You only need to send one compliant LBA. However, if circumstances change (e.g., more rent becomes due), you can send an updated letter. Some landlords send informal chasers first, then a formal LBA.',
  },
];

export default function MoneyClaimLetterBeforeActionPage() {
  return (
    <>
      <StructuredData
        data={articleSchema({
          headline: 'Letter Before Action Template for Landlords (Pre-Action Protocol Guide)',
          description:
            'How to write a Letter Before Action for tenant debt claims that complies with Pre-Action Protocol.',
          url: getCanonicalUrl('/money-claim-letter-before-action'),
          datePublished: '2026-01-15',
          dateModified: '2026-01-15',
        })}
      />
      <StructuredData data={faqPageSchema(faqs)} />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          { name: 'Money Claim Guide', url: 'https://landlordheaven.co.uk/money-claim-unpaid-rent' },
          { name: 'Letter Before Action', url: 'https://landlordheaven.co.uk/money-claim-letter-before-action' },
        ])}
      />

      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-orange-900 to-orange-800 text-white py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-orange-700/50 text-orange-100 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Mail className="w-4 h-4" />
                Required before court action
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                Letter Before Action Guide
              </h1>

              <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
                The Pre-Action Protocol requires a formal demand letter before issuing
                a court claim. Here&apos;s what to include and how to do it right.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/wizard?product=money_claim&src=seo_lba"
                  className="inline-flex items-center justify-center gap-2 bg-white text-orange-800 font-semibold py-4 px-8 rounded-xl hover:bg-orange-50 transition-colors"
                >
                  Generate Your Letter
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

        {/* Why It Matters Section */}
        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Why the Letter Before Action Matters
              </h2>

              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded-r-lg">
                <p className="text-red-900 text-sm flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Court requirement:</strong> If you issue a court claim without
                    sending a proper Letter Before Action, the judge may penalise you in
                    costs, even if you win. Always send the LBA and keep proof.
                  </span>
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm text-center">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-orange-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Legal Requirement</h3>
                  <p className="text-sm text-gray-600">
                    Pre-Action Protocol for Debt Claims mandates a formal letter first
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm text-center">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-orange-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Gives Chance to Pay</h3>
                  <p className="text-sm text-gray-600">
                    Many debtors pay when they receive a formal letter warning of court
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm text-center">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-orange-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Strengthens Your Claim</h3>
                  <p className="text-sm text-gray-600">
                    Shows court you followed proper procedure and tried to resolve
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What to Include Section */}
        <section className="py-12 lg:py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                What Your Letter Must Include
              </h2>

              <div className="space-y-4 mb-8">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    1
                  </div>
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 flex-1">
                    <h3 className="font-bold text-gray-900 mb-2">Your Details</h3>
                    <p className="text-gray-600 text-sm">
                      Full name, address, and contact details. If acting through an agent,
                      include their details too.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    2
                  </div>
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 flex-1">
                    <h3 className="font-bold text-gray-900 mb-2">The Debtor&apos;s Details</h3>
                    <p className="text-gray-600 text-sm">
                      Full name and address of the tenant you&apos;re claiming against.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    3
                  </div>
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 flex-1">
                    <h3 className="font-bold text-gray-900 mb-2">Amount Owed (With Breakdown)</h3>
                    <p className="text-gray-600 text-sm">
                      The total claimed with itemised breakdown: rent arrears, damage costs,
                      other debts, interest. Be specific with dates and amounts.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    4
                  </div>
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 flex-1">
                    <h3 className="font-bold text-gray-900 mb-2">Why They Owe the Money</h3>
                    <p className="text-gray-600 text-sm">
                      Brief explanation: &quot;Under your tenancy agreement dated [date] for
                      [property], you were required to pay [what]. You failed to pay...&quot;
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    5
                  </div>
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 flex-1">
                    <h3 className="font-bold text-gray-900 mb-2">Deadline to Pay</h3>
                    <p className="text-gray-600 text-sm">
                      Minimum 14 days from receipt. State the specific date by which
                      they must pay to avoid court action.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    6
                  </div>
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 flex-1">
                    <h3 className="font-bold text-gray-900 mb-2">Consequences of Non-Payment</h3>
                    <p className="text-gray-600 text-sm">
                      State you will issue court proceedings if they don&apos;t pay. Mention
                      CCJs affect credit ratings for 6 years.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    7
                  </div>
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 flex-1">
                    <h3 className="font-bold text-gray-900 mb-2">Debt Advice Information</h3>
                    <p className="text-gray-600 text-sm">
                      Required: mention free debt advice is available from Citizens Advice
                      (0800 144 8848), StepChange (0800 138 1111), or similar.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sending the Letter Section */}
        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Sending the Letter
              </h2>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                    <Mail className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-3">Best Practice: Recorded Delivery</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Provides proof of delivery</li>
                    <li>• Shows date received</li>
                    <li>• Keep the certificate of posting</li>
                    <li>• Allow 2 working days for delivery</li>
                  </ul>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                    <ClipboardList className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-3">Timeline After Sending</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Day 0: Post the letter</li>
                    <li>• Day 2: Deemed received (first class)</li>
                    <li>• Day 2-16: Their 14-day response period</li>
                    <li>• Day 17+: Can issue court claim</li>
                  </ul>
                </div>
              </div>

              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
                <p className="text-amber-900 text-sm flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Keep copies:</strong> Save a copy of the letter you sent, proof
                    of posting, and any responses received. You&apos;ll need these if the
                    case goes to court.
                  </span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 lg:py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Get Your Letter Before Action
              </h2>
              <p className="text-gray-600 mb-8">
                Our Money Claim Pack includes a professionally drafted Letter Before
                Action tailored to your specific claim, plus all the court documents
                you&apos;ll need.
              </p>
              <Link
                href="/wizard?product=money_claim&src=seo_lba"
                className="inline-flex items-center justify-center gap-2 bg-primary text-white font-semibold py-4 px-8 rounded-xl hover:bg-primary/90 transition-colors"
              >
                Generate Your Documents — £149.99
                <ArrowRight className="w-5 h-5" />
              </Link>
              <p className="text-sm text-gray-500 mt-3">
                Includes LBA, Particulars of Claim, interest calculation, and guide
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
                  moneyClaimForms.n1Form,
                  moneyClaimGuides.mcolProcess,
                  moneyClaimForms.scheduleOfDebt,
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
