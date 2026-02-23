import type { Metadata } from 'next';
import Link from 'next/link';
import { getCanonicalUrl } from '@/lib/seo/urls';
import { StructuredData, breadcrumbSchema, articleSchema } from '@/lib/seo/structured-data';
import {
  CheckCircle,
  ArrowRight,
  AlertTriangle,
  Scale,
  FileText,
  Gavel,
  CreditCard,
  Building,
  Car,
} from 'lucide-react';
import { FAQSection } from '@/components/seo/FAQSection';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { moneyClaimGuides, moneyClaimEnforcementLinks, productLinks } from '@/lib/seo/internal-links';

export const metadata: Metadata = {
  title: 'CCJ Enforcement Options for Landlords 2026 | Recover Judgment Debt',
  description:
    'How to enforce a County Court Judgment against a tenant. Bailiffs, attachment of earnings, charging orders, and other enforcement methods.',
  keywords: [
    'CCJ enforcement',
    'enforce CCJ',
    'county court judgment',
    'bailiff tenant',
    'warrant of control',
    'attachment of earnings',
    'charging order',
    'enforce money judgment',
    'landlord CCJ enforcement',
    'high court enforcement',
  ],
  openGraph: {
    title: 'CCJ Enforcement Options for Landlords 2026 | Recover Judgment Debt',
    description:
      'Complete guide to enforcing CCJs against tenants who won\'t pay.',
    type: 'article',
    url: getCanonicalUrl('/money-claim-ccj-enforcement'),
  },
  alternates: {
    canonical: getCanonicalUrl('/money-claim-ccj-enforcement'),
  },
};

const faqs = [
  {
    question: 'I have a CCJ - why won\'t the tenant pay?',
    answer:
      'A CCJ is a court judgment that the defendant owes you money - it doesn\'t guarantee payment. Many debtors ignore CCJs. You need to take enforcement action to actually recover the money, which involves additional court processes and fees.',
  },
  {
    question: 'What is a Warrant of Control?',
    answer:
      'A Warrant of Control authorises county court bailiffs to visit the debtor\'s address and seize goods to sell. It\'s the most common enforcement method for debts under £5,000. The fee is currently £77 for claims up to £5,000.',
  },
  {
    question: 'Should I use county court bailiffs or High Court enforcement?',
    answer:
      'For debts over £600, you can transfer the judgment to High Court and use High Court Enforcement Officers (HCEOs). HCEOs are often more effective as they work on commission and can seize more types of goods. For debts under £600, you must use county court bailiffs.',
  },
  {
    question: 'What is an Attachment of Earnings Order?',
    answer:
      'An Attachment of Earnings Order instructs the debtor\'s employer to deduct money from their wages and pay you directly. It only works if the debtor is employed (not self-employed) and you know their employer. The court fee is £110.',
  },
  {
    question: 'What is a Charging Order?',
    answer:
      'A Charging Order secures your debt against the debtor\'s property (usually their home if they own one). When they sell, you get paid from the proceeds. It doesn\'t give you immediate cash but protects your judgment long-term.',
  },
  {
    question: 'Can I make the tenant bankrupt?',
    answer:
      'If the debt is over £5,000, you can petition for the debtor\'s bankruptcy. This is a serious step with a £990 court fee plus deposit. It\'s mainly used as a threat or when the debtor has assets. Many debtors pay when faced with bankruptcy.',
  },
  {
    question: 'What if the tenant has no money or assets?',
    answer:
      'If the debtor has no income, savings, or assets, enforcement may not recover your money immediately. CCJs last 6 years and can be renewed. You can try enforcement again when their circumstances change.',
  },
  {
    question: 'How do I find out what assets the tenant has?',
    answer:
      'You can apply for an "Order to Obtain Information" (previously called an oral examination). The debtor must attend court and answer questions about their finances under oath. The fee is £55.',
  },
  {
    question: 'What is a Third Party Debt Order?',
    answer:
      'A Third Party Debt Order freezes and seizes money in the debtor\'s bank account. You need to know which bank they use. It\'s very effective if you can identify an account with funds. The fee is £110.',
  },
  {
    question: 'How long does a CCJ last?',
    answer:
      'CCJs remain on the Register of Judgments for 6 years and affect credit scores. You can enforce a CCJ for 6 years from the judgment date. After 6 years, you need court permission to enforce.',
  },
];

export default function MoneyClaimCCJEnforcementPage() {
  return (
    <>
      <StructuredData
        data={articleSchema({
          headline: 'CCJ Enforcement Options for Landlords (UK Guide)',
          description:
            'How to enforce a County Court Judgment against a tenant who won\'t pay.',
          url: getCanonicalUrl('/money-claim-ccj-enforcement'),
          datePublished: '2026-01-15',
          dateModified: '2026-01-15',
        })}
      />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          { name: 'Money Claim Guide', url: 'https://landlordheaven.co.uk/money-claim-unpaid-rent' },
          { name: 'CCJ Enforcement', url: 'https://landlordheaven.co.uk/money-claim-ccj-enforcement' },
        ])}
      />

      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-slate-700/50 text-slate-100 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Gavel className="w-4 h-4" />
                Enforce your judgment
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                CCJ Enforcement: Getting Paid
              </h1>

              <p className="text-xl text-slate-100 mb-8 max-w-2xl mx-auto">
                You have a County Court Judgment - now what? Learn how to actually
                recover the money from a tenant who won&apos;t pay voluntarily.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/wizard?product=money_claim&src=seo_ccj_enforcement"
                  className="inline-flex items-center justify-center gap-2 bg-white text-slate-800 font-semibold py-4 px-8 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Start Money Claim
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

        {/* Understanding Enforcement Section */}
        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Understanding CCJ Enforcement
              </h2>

              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-8 rounded-r-lg">
                <p className="text-amber-900 text-sm flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Important:</strong> A CCJ only confirms the debt exists - it doesn&apos;t
                    force payment. If the debtor ignores the judgment, you need to take
                    enforcement action, which has additional fees.
                  </span>
                </p>
              </div>

              <div className="prose prose-gray max-w-none mb-8">
                <p className="text-lg text-gray-600">
                  After winning a money claim, you&apos;ll have a County Court Judgment (CCJ).
                  If the tenant pays within 30 days, they can apply to have it removed from
                  their credit record. If they don&apos;t pay, you have several enforcement
                  options depending on their circumstances.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4">Before Enforcing, Consider:</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Do they have a job? (Attachment of Earnings)
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Do they own property? (Charging Order)
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Do they have a bank account with funds? (Third Party Debt Order)
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Do they have valuable possessions? (Warrant of Control)
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Enforcement Options Section */}
        <section className="py-12 lg:py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Enforcement Options
              </h2>

              <div className="space-y-6">
                {/* Warrant of Control */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Car className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h3 className="font-bold text-gray-900 text-lg">Warrant of Control</h3>
                        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                          Most Common
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">
                        County court bailiffs visit the debtor and seize goods to sell at auction.
                        Works for debts under £5,000.
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <span className="text-gray-500"><strong>Fee:</strong> £77</span>
                        <span className="text-gray-500"><strong>Best for:</strong> Debtors with valuable possessions</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* High Court Enforcement */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Scale className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h3 className="font-bold text-gray-900 text-lg">High Court Enforcement</h3>
                        <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">
                          Most Effective
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">
                        Transfer your CCJ to High Court and use HCEOs (High Court Enforcement Officers).
                        More powers than county court bailiffs.
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <span className="text-gray-500"><strong>Fee:</strong> £71 transfer + HCEO fees</span>
                        <span className="text-gray-500"><strong>Best for:</strong> Debts over £600</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Attachment of Earnings */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CreditCard className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-lg mb-2">Attachment of Earnings</h3>
                      <p className="text-gray-600 mb-3">
                        Court orders the employer to deduct money from wages and pay you.
                        Steady payments over time.
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <span className="text-gray-500"><strong>Fee:</strong> £110</span>
                        <span className="text-gray-500"><strong>Best for:</strong> Employed debtors (not self-employed)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Third Party Debt Order */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building className="w-6 h-6 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-lg mb-2">Third Party Debt Order</h3>
                      <p className="text-gray-600 mb-3">
                        Freezes and seizes money in the debtor&apos;s bank account. Very effective if
                        you know their bank.
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <span className="text-gray-500"><strong>Fee:</strong> £110</span>
                        <span className="text-gray-500"><strong>Best for:</strong> Debtors with bank funds</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Charging Order */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building className="w-6 h-6 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-lg mb-2">Charging Order</h3>
                      <p className="text-gray-600 mb-3">
                        Secures the debt against property the debtor owns. You&apos;ll be paid when
                        they sell. Long-term security.
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <span className="text-gray-500"><strong>Fee:</strong> £119</span>
                        <span className="text-gray-500"><strong>Best for:</strong> Property-owning debtors</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Order to Obtain Information */}
        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Don&apos;t Know Their Circumstances?
              </h2>

              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-6">
                <h3 className="font-bold text-gray-900 mb-3">Order to Obtain Information</h3>
                <p className="text-gray-600 mb-4">
                  If you don&apos;t know what assets or income the debtor has, apply for an
                  Order to Obtain Information (Form N316). The debtor must attend court
                  and answer questions about their finances under oath.
                </p>
                <ul className="space-y-2 text-gray-600 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Court fee: £55
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Debtor must provide employment details
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Debtor must reveal bank accounts
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Debtor must list assets and property
                  </li>
                </ul>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">☁️</span>
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">
                      Not sure which enforcement to use?
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      Use our free{' '}
                      <Link href="/ask-heaven" className="text-primary font-medium hover:underline">
                        Ask Heaven Q&amp;A tool
                      </Link>{' '}
                      for guidance on choosing enforcement methods.
                    </p>
                  </div>
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
                Need to Start a Money Claim First?
              </h2>
              <p className="text-gray-600 mb-8">
                Before you can enforce, you need a CCJ. Our Money Claim Pack includes
                everything you need to get your judgment.
              </p>
              <Link
                href="/wizard?product=money_claim&src=seo_ccj_enforcement"
                className="inline-flex items-center justify-center gap-2 bg-primary text-white font-semibold py-4 px-8 rounded-xl hover:bg-primary/90 transition-colors"
              >
                Start Your Money Claim — £99.99
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
              <FAQSection faqs={faqs} 
                showTrustPositioningBar
              />
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
                  moneyClaimGuides.mcolProcess,
                  moneyClaimGuides.smallClaimsCourt,
                  moneyClaimGuides.defendedClaims,
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
