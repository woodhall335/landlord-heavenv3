import type { Metadata } from 'next';
import Link from 'next/link';
import { getCanonicalUrl } from '@/lib/seo/urls';
import { StructuredData, faqPageSchema, breadcrumbSchema, articleSchema } from '@/lib/seo/structured-data';
import {
  CheckCircle,
  ArrowRight,
  AlertTriangle,
  CalendarX,
  FileText,
  ClipboardList,
  Receipt,
  Calculator,
} from 'lucide-react';
import { FAQSection } from '@/components/seo/FAQSection';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { moneyClaimGuides, moneyClaimRentLinks, productLinks, toolLinks } from '@/lib/seo/internal-links';

export const metadata: Metadata = {
  title: 'Claim for Early Termination 2026 | Tenant Left Before End of Tenancy',
  description:
    'Recover rent and costs when a tenant leaves before the fixed term ends without using a break clause correctly. Evidence and claim process for England.',
  keywords: [
    'tenant early termination',
    'tenant left before end of tenancy',
    'break clause not used',
    'tenant abandoned property',
    'early lease termination claim',
    'tenant broke contract',
    'landlord early termination claim',
    'recover rent early leaving',
    'tenant left without notice',
    'fixed term breach claim',
  ],
  openGraph: {
    title: 'Claim for Early Termination 2026 | Tenant Left Before End of Tenancy',
    description:
      'Landlord guide to recovering rent when a tenant leaves before the fixed term ends.',
    type: 'article',
    url: getCanonicalUrl('/money-claim-early-termination'),
  },
  alternates: {
    canonical: getCanonicalUrl('/money-claim-early-termination'),
  },
};

const faqs = [
  {
    question: 'Can I claim rent if my tenant left before the fixed term ended?',
    answer:
      'Yes, if the tenant left during a fixed term without using a valid break clause, they remain liable for rent until the tenancy ends or you find a replacement tenant. You must mitigate your losses by actively seeking a new tenant.',
  },
  {
    question: 'What if the tenant used the break clause but left early?',
    answer:
      'If the break clause requires a notice period (e.g., 2 months) and the tenant left without giving proper notice, they may owe rent for the notice period they should have given. Check your tenancy agreement for break clause terms.',
  },
  {
    question: 'Do I have to try to re-let the property?',
    answer:
      'Yes. You have a legal duty to "mitigate your losses." This means actively marketing the property and accepting reasonable tenants. If you don\'t try to re-let, courts may reduce your claim to only the period needed to find a tenant.',
  },
  {
    question: 'How much rent can I claim for early leaving?',
    answer:
      'You can claim rent from when the tenant left until either: (1) you find a new tenant, or (2) the fixed term would have ended. You must also claim for re-letting costs (agent fees, advertising). Deduct any rent a new tenant pays.',
  },
  {
    question: 'What about the tenant\'s deposit?',
    answer:
      'You can use the deposit towards unpaid rent and re-letting costs. If the amount owed exceeds the deposit, claim the balance through MCOL. Follow the deposit scheme process for the deposit portion.',
  },
  {
    question: 'The tenant just disappeared - is this abandonment?',
    answer:
      'If a tenant appears to have abandoned the property (keys returned, belongings removed, rent stopped), document everything. You may need to serve formal notices before re-letting. Consult the abandonment provisions in your tenancy agreement.',
  },
  {
    question: 'Can I claim agent fees for re-letting?',
    answer:
      'Yes. Reasonable re-letting costs caused by the tenant\'s early departure are claimable. This includes: letting agent fees, advertising costs, reference checking, and inventory preparation. Keep all receipts.',
  },
  {
    question: 'What if I find a new tenant quickly?',
    answer:
      'You can only claim rent for the void period (time without a tenant). If you find a replacement within 2 weeks, your claim is limited to 2 weeks rent plus re-letting costs. Quick re-letting is good - it limits your losses.',
  },
  {
    question: 'Can the tenant argue they had to leave due to property problems?',
    answer:
      'Yes, this is a common defence. If the property was uninhabitable or you breached your landlord obligations, the tenant may have grounds to terminate early. Ensure your property was properly maintained.',
  },
  {
    question: 'What evidence do I need for an early termination claim?',
    answer:
      'You need: tenancy agreement showing fixed term dates, evidence tenant left early (keys returned, correspondence), proof of mitigation efforts (marketing, viewings), re-letting costs, and calculation of rent owed.',
  },
];

export default function MoneyClaimEarlyTerminationPage() {
  return (
    <>
      <StructuredData
        data={articleSchema({
          headline: 'Claim for Early Termination (UK Landlord Guide)',
          description:
            'Complete guide for landlords to recover rent when a tenant leaves before the fixed term ends.',
          url: getCanonicalUrl('/money-claim-early-termination'),
          datePublished: '2026-01-15',
          dateModified: '2026-01-15',
        })}
      />
      <StructuredData data={faqPageSchema(faqs)} />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          { name: 'Money Claim Guide', url: 'https://landlordheaven.co.uk/money-claim-unpaid-rent' },
          { name: 'Early Termination', url: 'https://landlordheaven.co.uk/money-claim-early-termination' },
        ])}
      />

      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-red-900 to-red-800 text-white py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-red-700/50 text-red-100 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <CalendarX className="w-4 h-4" />
                Recover lost rent
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                Claim for Early Termination — Tenant Left Before Fixed Term Ended
              </h1>

              <p className="text-xl text-red-100 mb-8 max-w-2xl mx-auto">
                When a tenant breaks the fixed term and leaves early, recover
                rent owed and re-letting costs through the courts.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/wizard?product=money_claim&reason=rent_arrears&src=seo_early_termination"
                  className="inline-flex items-center justify-center gap-2 bg-white text-red-800 font-semibold py-4 px-8 rounded-xl hover:bg-red-50 transition-colors"
                >
                  Start Early Termination Claim
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/tools/rent-arrears-calculator"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold py-4 px-8 rounded-xl transition-colors border border-white/20"
                >
                  <Calculator className="w-5 h-5" />
                  Calculate Rent Owed
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* What You Can Claim Section */}
        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                What Can You Claim for Early Termination?
              </h2>

              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-8 rounded-r-lg">
                <p className="text-amber-900 text-sm flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Duty to mitigate:</strong> You must actively try to find a new
                    tenant to minimise your losses. Courts will reduce claims if you didn&apos;t
                    make reasonable efforts to re-let the property.
                  </span>
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    You CAN Claim:
                  </h3>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li className="flex items-start gap-2">
                      <CalendarX className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      Rent for the void period (until re-let)
                    </li>
                    <li className="flex items-start gap-2">
                      <CalendarX className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      Letting agent re-letting fees
                    </li>
                    <li className="flex items-start gap-2">
                      <CalendarX className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      Advertising costs
                    </li>
                    <li className="flex items-start gap-2">
                      <CalendarX className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      New inventory costs
                    </li>
                    <li className="flex items-start gap-2">
                      <CalendarX className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      Reference checking costs
                    </li>
                    <li className="flex items-start gap-2">
                      <CalendarX className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      Interest on rent owed (8%)
                    </li>
                  </ul>
                </div>

                <div className="bg-red-50 rounded-xl p-6 border border-red-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    Limitations:
                  </h3>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li>• Cannot claim rent after new tenant moves in</li>
                    <li>• Cannot claim if you didn&apos;t try to re-let</li>
                    <li>• Limited if break clause was used correctly</li>
                    <li>• May be reduced if property issues caused departure</li>
                    <li>• Cannot claim excessive void if you refused tenants</li>
                    <li>• General wear refreshing not claimable</li>
                  </ul>
                </div>
              </div>

              {/* Example calculation */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-8">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-red-600" />
                  Example Early Termination Claim
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Fixed term remaining: 4 months</span>
                    <span className="text-gray-500">Context</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Void period until re-let: 6 weeks</span>
                    <span className="font-semibold text-gray-900">£1,800</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Letting agent re-letting fee</span>
                    <span className="font-semibold text-gray-900">£600</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Advertising and referencing</span>
                    <span className="font-semibold text-gray-900">£150</span>
                  </div>
                  <div className="flex justify-between py-2 bg-red-50 px-2 rounded">
                    <span className="text-gray-900 font-medium">Total claim</span>
                    <span className="font-bold text-red-700">£2,550</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-4">
                  Less deposit retained = amount to claim in court
                </p>
              </div>

              {/* Ask Heaven callout */}
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">☁️</span>
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">
                      Unsure what you can claim for early leaving?
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      Use our free{' '}
                      <Link href="/ask-heaven" className="text-primary font-medium hover:underline">
                        Ask Heaven landlord Q&amp;A tool
                      </Link>{' '}
                      to get guidance on your specific situation.
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
                Evidence You Need
              </h2>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                    <ClipboardList className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-3">Tenancy Documents</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Tenancy agreement (fixed term dates)</li>
                    <li>• Break clause terms (if any)</li>
                    <li>• Evidence tenant left (keys, correspondence)</li>
                    <li>• Date tenant vacated</li>
                    <li>• New tenancy agreement (start date)</li>
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                    <Receipt className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-3">Mitigation Evidence</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Marketing listings (Rightmove, etc.)</li>
                    <li>• Viewing records</li>
                    <li>• Agent correspondence</li>
                    <li>• Re-letting invoices</li>
                    <li>• Timeline of re-letting efforts</li>
                  </ul>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Early Termination Evidence Checklist
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Tenancy agreement with fixed term dates
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Evidence of departure date
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Marketing timeline and evidence
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      New tenancy start date
                    </li>
                  </ul>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Re-letting cost invoices
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Rent calculation for void period
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Letter before action sent
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Correspondence with tenant
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Start Your Early Termination Claim
              </h2>
              <p className="text-gray-600 mb-8">
                The Money Claim Pack includes court documents, pre-action letters,
                and guidance for recovering rent and re-letting costs.
              </p>
              <Link
                href="/wizard?product=money_claim&reason=rent_arrears&src=seo_early_termination"
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
        <section className="py-12 lg:py-16 bg-white">
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
        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Related Guides
              </h2>
              <RelatedLinks
                links={[
                  moneyClaimGuides.unpaidRent,
                  moneyClaimGuides.formerTenant,
                  moneyClaimGuides.guarantorClaims,
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
