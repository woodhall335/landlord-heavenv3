import type { Metadata } from 'next';
import Link from 'next/link';
import { getCanonicalUrl } from '@/lib/seo/urls';
import { StructuredData, breadcrumbSchema, articleSchema } from '@/lib/seo/structured-data';
import {
  CheckCircle,
  ArrowRight,
  AlertTriangle,
  Banknote,
  FileText,
  Camera,
  ClipboardList,
  Receipt,
  Scale,
} from 'lucide-react';
import { FAQSection } from '@/components/seo/FAQSection';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { moneyClaimGuides, productLinks, toolLinks } from '@/lib/seo/internal-links';

export const metadata: Metadata = {
  title: 'Claim for Deposit Shortfall 2026 | When Damage Exceeds Deposit',
  description:
    'Recover costs when tenant damage exceeds the deposit amount. How to claim the difference through MCOL after deposit scheme resolution.',
  keywords: [
    'deposit shortfall claim',
    'damage exceeds deposit',
    'tenant damage beyond deposit',
    'deposit not enough cover damage',
    'landlord deposit shortfall',
    'claim beyond deposit',
    'tenant owes more than deposit',
    'deposit dispute court claim',
    'damage over deposit',
    'recover extra damage costs',
  ],
  openGraph: {
    title: 'Claim for Deposit Shortfall 2026 | When Damage Exceeds Deposit',
    description:
      'Landlord guide to recovering damage costs that exceed the tenant\'s deposit through MCOL.',
    type: 'article',
    url: getCanonicalUrl('/money-claim-deposit-shortfall'),
  },
  alternates: {
    canonical: getCanonicalUrl('/money-claim-deposit-shortfall'),
  },
};

const faqs = [
  {
    question: 'Can I claim for damage that exceeds the deposit?',
    answer:
      'Yes, absolutely. The deposit only covers up to its value. If damage exceeds this, you have every right to pursue the tenant for the additional amount through the courts. First, resolve the deposit via the scheme, then claim the remaining balance.',
  },
  {
    question: 'Should I use the deposit scheme or go straight to court?',
    answer:
      'Always use the deposit scheme dispute resolution first for amounts within the deposit. It\'s free and often faster than court. Only go to court for the amount EXCEEDING the deposit, or if you need a binding CCJ that the tenant is more likely to pay.',
  },
  {
    question: 'How do I calculate the shortfall amount?',
    answer:
      'Total damage costs (with betterment applied) minus deposit retained = shortfall. For example: £3,500 damage - £1,200 deposit = £2,300 shortfall. This £2,300 is what you claim through MCOL.',
  },
  {
    question: 'Can the deposit scheme award more than the deposit?',
    answer:
      'No. Deposit schemes can only allocate the deposit held. They cannot order the tenant to pay more. For any shortfall, you must make a separate court claim (MCOL) against the tenant.',
  },
  {
    question: 'What evidence do I need for a shortfall claim?',
    answer:
      'You need: deposit scheme decision (showing deposit allocated), evidence of total damage costs, quotes/invoices for repairs, check-in/out inventories, photos, and any deposit scheme paperwork. The court will want to see why the deposit wasn\'t enough.',
  },
  {
    question: 'Will the deposit scheme decision help my court claim?',
    answer:
      'Yes. If the deposit scheme ruled in your favour and allocated all/most of the deposit to you, this supports your court claim. It shows an independent body agreed the tenant caused the damage. Include this decision in your evidence.',
  },
  {
    question: 'What if the tenant disputes my damage claim at both stages?',
    answer:
      'This is common. Present strong evidence at both: the deposit scheme for that portion, then court for the shortfall. A deposit scheme decision in your favour helps, but the court will make its own assessment of the shortfall claim.',
  },
  {
    question: 'Can I claim court fees on top of the shortfall?',
    answer:
      'Yes. If you win, the court can order the tenant to pay your court fees and fixed costs. These are added to the judgment debt. The more you claim, the higher the court fee, so factor this into your decision.',
  },
  {
    question: 'How long do I have to make a shortfall claim?',
    answer:
      'You have 6 years from when the damage occurred (usually tenancy end date) to bring a contract claim. However, act promptly - fresh evidence is stronger and the tenant may be harder to trace later.',
  },
  {
    question: 'What if the tenant has already paid the deposit shortfall?',
    answer:
      'Great - no court claim needed. Keep records of the payment. If they agreed to pay but haven\'t, send a letter before action giving 14-30 days, then proceed to MCOL if they don\'t pay.',
  },
];

export default function MoneyClaimDepositShortfallPage() {
  return (
    <>
      <StructuredData
        data={articleSchema({
          headline: 'Claim for Deposit Shortfall (UK Landlord Guide)',
          description:
            'Complete guide for landlords to recover damage costs that exceed the tenant deposit through MCOL.',
          url: getCanonicalUrl('/money-claim-deposit-shortfall'),
          datePublished: '2026-01-15',
          dateModified: '2026-01-15',
        })}
      />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          { name: 'Money Claim Guide', url: 'https://landlordheaven.co.uk/money-claim-unpaid-rent' },
          { name: 'Deposit Shortfall', url: 'https://landlordheaven.co.uk/money-claim-deposit-shortfall' },
        ])}
      />

      <HeaderConfig mode="autoOnScroll" />

      <main className="min-h-screen bg-gray-50">
        <UniversalHero
          title="Money Claim for Deposit Shortfall"
          subtitle="Build a legally validated, solicitor-grade, compliance-checked and court-ready debt claim package."
          primaryCta={{ label: "Start now", href: "/wizard?product=money_claim&topic=debt&src=seo_money_claim_deposit_shortfall" }}
          showTrustPositioningBar
          hideMedia
        />
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-emerald-900 to-emerald-800 text-white py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-emerald-700/50 text-emerald-100 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Banknote className="w-4 h-4" />
                Recover the difference
              </div>

              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                Claim for Deposit Shortfall — When Damage Exceeds the Deposit
              </h2>

              <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
                When tenant damage costs more than the deposit covers, recover
                the shortfall through the courts with MCOL.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/wizard?product=money_claim&reason=property_damage&topic=debt&src=seo_money_claim_deposit_shortfall"
                  className="inline-flex items-center justify-center gap-2 bg-white text-emerald-800 font-semibold py-4 px-8 rounded-xl hover:bg-emerald-50 transition-colors"
                >
                  Start Shortfall Claim
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

        {/* Process Section */}
        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                The Two-Stage Process
              </h2>

              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-8 rounded-r-lg">
                <p className="text-amber-900 text-sm flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Important:</strong> Use the deposit scheme first for the deposit
                    amount. Only go to court for the shortfall (excess over deposit). This is
                    the most cost-effective approach.
                  </span>
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {/* Stage 1 */}
                <div className="bg-white rounded-xl p-6 border-2 border-emerald-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold">
                      1
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Deposit Scheme Route</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    Claim up to the deposit amount through your deposit protection scheme&apos;s
                    dispute resolution service.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      Free to use
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      Usually 4-8 weeks
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      Submit evidence online
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      Independent adjudicator decision
                    </li>
                  </ul>
                </div>

                {/* Stage 2 */}
                <div className="bg-white rounded-xl p-6 border-2 border-blue-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold">
                      2
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Court Claim (MCOL)</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    Claim the shortfall (amount exceeding deposit) through Money Claim Online.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <Scale className="w-4 h-4 text-blue-500" />
                      Court fees apply (from £35)
                    </li>
                    <li className="flex items-center gap-2">
                      <Scale className="w-4 h-4 text-blue-500" />
                      Default judgment in 2-4 weeks
                    </li>
                    <li className="flex items-center gap-2">
                      <Scale className="w-4 h-4 text-blue-500" />
                      Binding CCJ if successful
                    </li>
                    <li className="flex items-center gap-2">
                      <Scale className="w-4 h-4 text-blue-500" />
                      Enforceable by bailiffs
                    </li>
                  </ul>
                </div>
              </div>

              {/* Example calculation */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 mb-8">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Banknote className="w-5 h-5 text-emerald-600" />
                  Example Shortfall Calculation
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-2 border-b border-emerald-200">
                    <span className="text-gray-600">Total damage costs (with betterment)</span>
                    <span className="font-semibold text-gray-900">£4,200</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-emerald-200">
                    <span className="text-gray-600">Deposit held</span>
                    <span className="font-semibold text-gray-900">£1,400</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-emerald-200">
                    <span className="text-gray-600">Deposit awarded via scheme</span>
                    <span className="font-semibold text-emerald-600">-£1,200</span>
                  </div>
                  <div className="flex justify-between py-2 bg-blue-100 px-2 rounded">
                    <span className="text-gray-900 font-medium">Shortfall to claim in court</span>
                    <span className="font-bold text-blue-700">£3,000</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-4">
                  Note: The £200 deposit not awarded by the scheme may have been disputed
                  betterment. You can include this in your court claim if you disagree.
                </p>
              </div>

              {/* Ask Heaven callout */}
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">☁️</span>
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">
                      Need help calculating your shortfall claim?
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      Use our free{' '}
                      <Link href="/ask-heaven" className="text-primary font-medium hover:underline">
                        Ask Heaven landlord Q&amp;A tool
                      </Link>{' '}
                      or the{' '}
                      <Link href="/tools/rent-arrears-calculator" className="text-primary font-medium hover:underline">
                        arrears calculator
                      </Link>{' '}
                      to work out totals including interest.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Evidence Section */}
        <section className="py-12 lg:py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Evidence You Need for Shortfall Claims
              </h2>

              <p className="text-gray-600 mb-8">
                Your court claim should build on the deposit scheme evidence. The deposit
                scheme decision strengthens your case if it ruled in your favour.
              </p>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                    <Camera className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-3">Damage Evidence</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Check-in/out photos</li>
                    <li>• Detailed damage photos</li>
                    <li>• Video walkthroughs</li>
                    <li>• Before/after comparisons</li>
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                    <ClipboardList className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-3">Deposit Scheme Records</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Scheme decision letter</li>
                    <li>• Award breakdown</li>
                    <li>• Evidence submitted</li>
                    <li>• Scheme correspondence</li>
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                    <Receipt className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-3">Cost Evidence</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Repair quotes (2-3)</li>
                    <li>• Invoices for work done</li>
                    <li>• Betterment calculations</li>
                    <li>• Total cost summary</li>
                  </ul>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Shortfall Claim Evidence Checklist
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Deposit scheme decision letter
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Complete damage schedule with costs
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Check-in/out inventory reports
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      All photographs and videos
                    </li>
                  </ul>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Repair quotes and invoices
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Betterment calculation for each item
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Shortfall calculation breakdown
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Letter before action (sent to tenant)
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* When to Go Direct to Court */}
        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                When to Skip the Deposit Scheme
              </h2>

              <p className="text-gray-600 mb-6">
                In some cases, going directly to court for the full amount makes more sense:
              </p>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                  <h3 className="font-bold text-gray-900 mb-3">Consider Court First If:</h3>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      Total claim far exceeds deposit (e.g., £10k damage, £1.4k deposit)
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      You need a CCJ for enforcement purposes
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      Tenant is disputing everything (one court case simpler)
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      Also claiming rent arrears (combine claims)
                    </li>
                  </ul>
                </div>

                <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
                  <h3 className="font-bold text-gray-900 mb-3">Use Scheme First If:</h3>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      Shortfall is small (saves court fees)
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      Tenant might pay after scheme decision
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      You want scheme decision as supporting evidence
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      Damage claim is close to deposit value
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
                Start Your Deposit Shortfall Claim
              </h2>
              <p className="text-gray-600 mb-8">
                The Money Claim Pack includes court documents, pre-action letters,
                and guidance for recovering the amount beyond the deposit.
              </p>
              <Link
                href="/wizard?product=money_claim&reason=property_damage&topic=debt&src=seo_money_claim_deposit_shortfall"
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
                  moneyClaimGuides.propertyDamage,
                  moneyClaimGuides.cleaningCosts,
                  moneyClaimGuides.mcolProcess,
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
