import type { Metadata } from 'next';
import Link from 'next/link';
import { getCanonicalUrl } from '@/lib/seo/urls';
import { StructuredData, faqPageSchema, breadcrumbSchema, articleSchema } from '@/lib/seo/structured-data';
import {
  CheckCircle,
  ArrowRight,
  AlertTriangle,
  FileSpreadsheet,
  FileText,
  Download,
  HelpCircle,
} from 'lucide-react';
import { FAQSection } from '@/components/marketing/FAQSection';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { moneyClaimGuides, moneyClaimFormLinks, productLinks } from '@/lib/seo/internal-links';

export const metadata: Metadata = {
  title: 'PAP Reply Form & Financial Statement 2026 | Landlord Guide',
  description:
    'Understanding the Pre-Action Protocol reply form and financial statement for debt claims. What it means when a tenant responds and how to proceed.',
  keywords: [
    'PAP reply form',
    'pre-action protocol reply',
    'financial statement debt',
    'tenant reply form',
    'debt claim response',
    'standard financial statement',
    'reply to LBA',
    'PAP form tenant',
    'debt response form',
    'pre-action reply',
  ],
  openGraph: {
    title: 'PAP Reply Form & Financial Statement 2026 | Landlord Guide',
    description:
      'Understanding Pre-Action Protocol responses and financial statements in debt claims.',
    type: 'article',
    url: getCanonicalUrl('/money-claim-pap-financial-statement'),
  },
  alternates: {
    canonical: getCanonicalUrl('/money-claim-pap-financial-statement'),
  },
};

const faqs = [
  {
    question: 'What is the PAP Reply Form?',
    answer:
      'The Pre-Action Protocol (PAP) Reply Form is a standard form debtors can use to respond to your Letter Before Action. It allows them to admit, deny, or partially dispute the debt, and provide financial information if they want to propose a payment plan.',
  },
  {
    question: 'What is a Standard Financial Statement?',
    answer:
      'The Standard Financial Statement (SFS) is a common format for debtors to show their income, expenses, and ability to pay. It\'s used by debt advisers and helps assess whether a payment plan is realistic. If the tenant provides one, review it carefully.',
  },
  {
    question: 'Do I have to accept a payment plan the tenant proposes?',
    answer:
      'No, you\'re not obligated to accept any payment plan. However, the Pre-Action Protocol expects you to engage reasonably. If you reject a reasonable offer and go to court, the judge may consider this when deciding costs.',
  },
  {
    question: 'What if the tenant admits the debt but can\'t pay?',
    answer:
      'If they admit owing the money but claim they can\'t pay, review any financial information they provide. You can still proceed to court for a CCJ. Having a CCJ means you can enforce when their circumstances improve.',
  },
  {
    question: 'The tenant disputes part of my claim - what now?',
    answer:
      'Consider which parts they dispute and why. Can you provide additional evidence? Is it worth negotiating? You can proceed to court for the disputed amounts, but be prepared to prove your case at a hearing.',
  },
  {
    question: 'How long should I wait for a PAP reply?',
    answer:
      'Give them 14 days from receiving your Letter Before Action (the PAP period). If they request more time to get debt advice, the Protocol suggests allowing up to 30 days total. After this, you can proceed to court.',
  },
  {
    question: 'What if the tenant ignores my Letter Before Action?',
    answer:
      'If they don\'t respond within the PAP period (14+ days), you can proceed to issue your court claim. Their lack of response will be noted if the case goes to court.',
  },
  {
    question: 'Should I send the Reply Form with my Letter Before Action?',
    answer:
      'The Pre-Action Protocol says you should include either the standard Reply Form or an equivalent. This gives the debtor a clear way to respond. Our Money Claim Pack includes the appropriate forms.',
  },
  {
    question: 'The tenant offered monthly payments - is £10/month reasonable?',
    answer:
      'It depends on the debt size and their circumstances. £10/month for a £3,000 debt would take 25 years! Consider whether the offer is realistic given their stated income. You can negotiate or reject unreasonable offers.',
  },
  {
    question: 'What happens to the financial statement if we go to court?',
    answer:
      'If you proceed to court and get a CCJ, the court may ask the debtor to complete another financial statement to set payment terms. Information from PAP stage doesn\'t automatically transfer to court proceedings.',
  },
];

export default function MoneyClaimPAPFinancialStatementPage() {
  return (
    <>
      <StructuredData
        data={articleSchema({
          headline: 'PAP Reply Form & Financial Statement Guide for Landlords',
          description:
            'Understanding Pre-Action Protocol responses and financial statements in debt claims.',
          url: getCanonicalUrl('/money-claim-pap-financial-statement'),
          datePublished: '2026-01-15',
          dateModified: '2026-01-15',
        })}
      />
      <StructuredData data={faqPageSchema(faqs)} />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          { name: 'Money Claim Guide', url: 'https://landlordheaven.co.uk/money-claim-unpaid-rent' },
          { name: 'PAP Reply Form', url: 'https://landlordheaven.co.uk/money-claim-pap-financial-statement' },
        ])}
      />

      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-indigo-900 to-indigo-800 text-white py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-indigo-700/50 text-indigo-100 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <FileSpreadsheet className="w-4 h-4" />
                Pre-Action Protocol forms
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                PAP Reply &amp; Financial Statement
              </h1>

              <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
                Understanding how tenants respond to your Letter Before Action and
                what to do with the financial information they provide.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/wizard?product=money_claim&src=seo_pap_form"
                  className="inline-flex items-center justify-center gap-2 bg-white text-indigo-800 font-semibold py-4 px-8 rounded-xl hover:bg-indigo-50 transition-colors"
                >
                  Start Money Claim
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <a
                  href="https://www.gov.uk/government/publications/pre-action-protocol-for-debt-claims"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold py-4 px-8 rounded-xl transition-colors border border-white/20"
                >
                  <Download className="w-5 h-5" />
                  View PAP on Gov.uk
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Overview Section */}
        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Understanding the PAP Process
              </h2>

              <div className="prose prose-gray max-w-none mb-8">
                <p className="text-lg text-gray-600">
                  The Pre-Action Protocol for Debt Claims sets out what should happen before
                  you start court proceedings. After you send your Letter Before Action, the
                  tenant may respond using the standard Reply Form and Financial Statement.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                    <FileText className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-3">PAP Reply Form</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Allows the debtor to:
                  </p>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Admit the debt in full</li>
                    <li>• Deny the debt in full</li>
                    <li>• Admit part of the debt</li>
                    <li>• Propose a payment plan</li>
                    <li>• Request more time for advice</li>
                  </ul>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                    <FileSpreadsheet className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-3">Financial Statement</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Shows the debtor&apos;s:
                  </p>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Income (wages, benefits, other)</li>
                    <li>• Essential expenses</li>
                    <li>• Other debts and commitments</li>
                    <li>• Available income for repayments</li>
                    <li>• Proposed payment amount</li>
                  </ul>
                </div>
              </div>

              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
                <p className="text-amber-900 text-sm flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Important:</strong> You&apos;re expected to engage with any response
                    reasonably. If you ignore a genuine attempt to negotiate and the court
                    later finds you acted unreasonably, it may affect costs.
                  </span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Response Scenarios Section */}
        <section className="py-12 lg:py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                How to Handle Different Responses
              </h2>

              <div className="space-y-6">
                {/* Full Admission */}
                <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-2">Tenant Admits Debt in Full</h3>
                      <p className="text-gray-600 text-sm mb-3">
                        Good news - they accept they owe the money.
                      </p>
                      <div className="bg-white rounded-lg p-4 border border-green-200 text-sm">
                        <p className="font-medium text-gray-700 mb-2">What to do:</p>
                        <ul className="text-gray-600 space-y-1">
                          <li>• If they pay in full: matter resolved</li>
                          <li>• If they propose payment plan: consider if acceptable</li>
                          <li>• If no payment/plan forthcoming: proceed to court</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Partial Admission */}
                <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-amber-600 text-white rounded-full flex items-center justify-center flex-shrink-0">
                      <HelpCircle className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-2">Tenant Admits Part, Disputes Rest</h3>
                      <p className="text-gray-600 text-sm mb-3">
                        They accept some of your claim but not all.
                      </p>
                      <div className="bg-white rounded-lg p-4 border border-amber-200 text-sm">
                        <p className="font-medium text-gray-700 mb-2">What to do:</p>
                        <ul className="text-gray-600 space-y-1">
                          <li>• Review what they dispute and why</li>
                          <li>• Consider if their points have merit</li>
                          <li>• Negotiate if appropriate</li>
                          <li>• Proceed to court for disputed amounts if needed</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Full Denial */}
                <div className="bg-red-50 rounded-xl p-6 border border-red-200">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">✕</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-2">Tenant Denies Debt Entirely</h3>
                      <p className="text-gray-600 text-sm mb-3">
                        They claim they don&apos;t owe you anything.
                      </p>
                      <div className="bg-white rounded-lg p-4 border border-red-200 text-sm">
                        <p className="font-medium text-gray-700 mb-2">What to do:</p>
                        <ul className="text-gray-600 space-y-1">
                          <li>• Review their reasons for denial</li>
                          <li>• Check if your evidence addresses their points</li>
                          <li>• Proceed to court - you&apos;ll need to prove your case</li>
                          <li>• Prepare for a contested hearing</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* No Response */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gray-600 text-white rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">—</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-2">Tenant Doesn&apos;t Respond</h3>
                      <p className="text-gray-600 text-sm mb-3">
                        They ignore your Letter Before Action.
                      </p>
                      <div className="bg-white rounded-lg p-4 border border-gray-200 text-sm">
                        <p className="font-medium text-gray-700 mb-2">What to do:</p>
                        <ul className="text-gray-600 space-y-1">
                          <li>• Wait until PAP period expires (14 days from receipt)</li>
                          <li>• Then proceed to issue court claim</li>
                          <li>• Keep proof you sent the LBA</li>
                          <li>• If they don&apos;t respond to court claim either, request default judgment</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Assessing Payment Plans */}
        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Assessing Payment Plan Offers
              </h2>

              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-8">
                <h3 className="font-bold text-gray-900 mb-4">Questions to Ask:</h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-indigo-500 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Is it realistic?</strong> Does the financial statement show they
                      can actually afford the proposed payments?
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-indigo-500 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Is it reasonable timescale?</strong> Will the debt be cleared in
                      a reasonable time, or would it take decades?
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-indigo-500 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Are they acting in good faith?</strong> Have they engaged properly,
                      or does this feel like delay tactics?
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-indigo-500 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>What&apos;s the alternative?</strong> If you reject and get a CCJ, what
                      would the court likely order as payment terms?
                    </span>
                  </li>
                </ul>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                  <h3 className="font-bold text-gray-900 mb-3">Consider Accepting If:</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Payments would clear debt in 1-3 years</li>
                    <li>• Financial statement shows genuine hardship</li>
                    <li>• They have no assets to enforce against</li>
                    <li>• Regular payments are better than nothing</li>
                  </ul>
                </div>

                <div className="bg-red-50 rounded-xl p-6 border border-red-200">
                  <h3 className="font-bold text-gray-900 mb-3">Consider Rejecting If:</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Debt would take 5+ years to clear</li>
                    <li>• Financial statement seems incomplete</li>
                    <li>• You know they have ability to pay more</li>
                    <li>• They&apos;ve broken payment promises before</li>
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
                Need to Start a Money Claim?
              </h2>
              <p className="text-gray-600 mb-8">
                Our Money Claim Pack includes everything you need: Letter Before Action,
                Particulars of Claim, and guidance through the entire process.
              </p>
              <Link
                href="/wizard?product=money_claim&src=seo_pap_form"
                className="inline-flex items-center justify-center gap-2 bg-primary text-white font-semibold py-4 px-8 rounded-xl hover:bg-primary/90 transition-colors"
              >
                Start Your Claim — £99.99
                <ArrowRight className="w-5 h-5" />
              </Link>
              <p className="text-sm text-gray-500 mt-3">
                Court fees from £35 extra (based on claim amount)
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
                  moneyClaimGuides.letterBeforeAction,
                  moneyClaimGuides.tenantDefends,
                  moneyClaimGuides.scheduleOfDebt,
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
