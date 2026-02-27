import type { Metadata } from 'next';
import Link from 'next/link';
import { getCanonicalUrl } from '@/lib/seo/urls';
import { StructuredData, breadcrumbSchema, articleSchema } from '@/lib/seo/structured-data';
import {
  CheckCircle,
  ArrowRight,
  AlertTriangle,
  Building2,
  FileText,
  ClipboardList,
  Receipt,
} from 'lucide-react';
import { FAQSection } from '@/components/seo/FAQSection';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { moneyClaimGuides, moneyClaimUtilitiesLinks, productLinks } from '@/lib/seo/internal-links';

export const metadata: Metadata = {
  title: 'Claim Unpaid Council Tax from Tenant 2026 | Landlord Guide',
  description:
    'Recover council tax arrears from tenants when the tenancy agreement makes them liable. Evidence requirements and court claim process for England.',
  keywords: [
    'tenant council tax',
    'council tax tenant liability',
    'landlord council tax claim',
    'tenant owes council tax',
    'recover council tax tenant',
    'council tax arrears claim',
    'tenant council tax debt',
    'council tax tenancy agreement',
    'council tax money claim',
    'council tax deposit deduction',
  ],
  openGraph: {
    title: 'Claim Unpaid Council Tax from Tenant 2026 | Landlord Guide',
    description:
      'Landlord guide to recovering unpaid council tax from tenants through MCOL.',
    type: 'article',
    url: getCanonicalUrl('/money-claim-council-tax'),
  },
  alternates: {
    canonical: getCanonicalUrl('/money-claim-council-tax'),
  },
};

const faqs = [
  {
    question: 'Can I claim council tax from my tenant?',
    answer:
      'You can only claim council tax from your tenant if: (1) the tenancy agreement explicitly makes them liable for council tax, AND (2) the council tax bill was in your name during the period claimed. If the tenant was directly liable to the council (bill in their name), the council must pursue them, not you.',
  },
  {
    question: 'Who is usually liable for council tax - landlord or tenant?',
    answer:
      'By law, the "resident" is liable for council tax. For most tenancies, this is the tenant. However, for HMOs and some other arrangements, the landlord may be liable to the council. Check whether bills were in your name or the tenant\'s name.',
  },
  {
    question: 'What evidence do I need for a council tax claim?',
    answer:
      'You need: tenancy agreement clause making tenant liable, council tax bills in your name showing the period, proof you paid the council, calculation showing tenant\'s share, and correspondence with tenant about payment.',
  },
  {
    question: 'Can I deduct council tax from the deposit?',
    answer:
      'Only if your tenancy agreement explicitly allows this. Council tax deductions are often disputed in deposit schemes. You need clear evidence the tenant agreed to pay council tax and failed to do so.',
  },
  {
    question: 'The tenant says council tax was included in rent - what now?',
    answer:
      'Check your tenancy agreement carefully. If it says rent is "inclusive" of bills or council tax, you may not have a claim. If the agreement clearly states council tax is the tenant\'s responsibility separately from rent, you can pursue it.',
  },
  {
    question: 'How much council tax can I claim?',
    answer:
      'You can claim the council tax that accrued during the tenant\'s occupation that they were liable for but didn\'t pay. This is usually calculated by the number of days occupied multiplied by the daily council tax rate.',
  },
  {
    question: 'The council is chasing me for the tenant\'s council tax - help!',
    answer:
      'If you\'re liable to the council (e.g., HMO landlord), you must pay the council. You can then pursue your tenant for reimbursement under the tenancy agreement terms. Keep all council correspondence as evidence.',
  },
  {
    question: 'Can I claim interest on council tax arrears?',
    answer:
      'You can claim statutory interest (8% per year) on council tax you paid on the tenant\'s behalf. Interest runs from the date you paid the council until the date of your claim or judgment.',
  },
  {
    question: 'What if the tenant has left and I can\'t find them?',
    answer:
      'You can still make a court claim. If you don\'t have their current address, you may need to use tracing services or apply to the court for alternative service (e.g., by email). Consider whether the amount justifies these costs.',
  },
  {
    question: 'Is council tax different for HMO properties?',
    answer:
      'Yes. In HMOs, the landlord is usually liable to the council for the whole council tax bill. You can then recover tenant contributions through the tenancy agreement. Make sure your HMO tenancy agreements are clear on council tax.',
  },
];

export default function MoneyClaimCouncilTaxPage() {
  return (
    <>
      <StructuredData
        data={articleSchema({
          headline: 'Claim Unpaid Council Tax from Tenant (UK Landlord Guide)',
          description:
            'Complete guide for landlords to recover council tax arrears from tenants through MCOL.',
          url: getCanonicalUrl('/money-claim-council-tax'),
          datePublished: '2026-01-15',
          dateModified: '2026-01-15',
        })}
      />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          { name: 'Money Claim Guide', url: 'https://landlordheaven.co.uk/money-claim-unpaid-rent' },
          { name: 'Council Tax Claims', url: 'https://landlordheaven.co.uk/money-claim-council-tax' },
        ])}
      />

      <HeaderConfig mode="autoOnScroll" />

      <main className="min-h-screen bg-gray-50">
        <UniversalHero
          title="Money Claim for Unpaid Council Tax"
          subtitle="Build a legally validated, solicitor-grade, compliance-checked and court-ready debt claim package."
          primaryCta={{ label: "Start now", href: "/wizard?product=money_claim&topic=debt&src=seo_money_claim_council_tax" }}
          showTrustPositioningBar
          hideMedia
        />
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-indigo-900 to-indigo-800 text-white py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-indigo-700/50 text-indigo-100 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Building2 className="w-4 h-4" />
                Recover council tax costs
              </div>

              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                Claim Unpaid Council Tax from Tenant
              </h2>

              <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
                When your tenancy agreement makes the tenant liable for council tax
                they didn&apos;t pay, recover the cost through the courts.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/wizard?product=money_claim&reason=unpaid_council_tax&topic=debt&src=seo_money_claim_council_tax"
                  className="inline-flex items-center justify-center gap-2 bg-white text-indigo-800 font-semibold py-4 px-8 rounded-xl hover:bg-indigo-50 transition-colors"
                >
                  Start Council Tax Claim
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

        {/* Key Requirements Section */}
        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                When Can You Claim Council Tax?
              </h2>

              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded-r-lg">
                <p className="text-red-900 text-sm flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Critical requirement:</strong> You can only claim council tax from
                    your tenant if your tenancy agreement explicitly makes them liable AND
                    the council tax bill was in YOUR name. If the bill was in the tenant&apos;s
                    name, the council pursues them directly.
                  </span>
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    You CAN Claim If:
                  </h3>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li className="flex items-start gap-2">
                      <Building2 className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                      Tenancy agreement states tenant pays council tax
                    </li>
                    <li className="flex items-start gap-2">
                      <Building2 className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                      Council tax bill was in your name
                    </li>
                    <li className="flex items-start gap-2">
                      <Building2 className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                      You paid the council (or have to pay)
                    </li>
                    <li className="flex items-start gap-2">
                      <Building2 className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                      HMO where you&apos;re liable to council
                    </li>
                    <li className="flex items-start gap-2">
                      <Building2 className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                      Clear calculation of tenant&apos;s share
                    </li>
                  </ul>
                </div>

                <div className="bg-red-50 rounded-xl p-6 border border-red-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    You CANNOT Claim If:
                  </h3>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li>• Council tax was in tenant&apos;s name (council claims)</li>
                    <li>• Tenancy agreement says rent is &quot;inclusive&quot;</li>
                    <li>• No clause making tenant liable</li>
                    <li>• You haven&apos;t actually paid the council</li>
                    <li>• Tenant was entitled to exemption (students)</li>
                    <li>• The liability period doesn&apos;t match occupancy</li>
                  </ul>
                </div>
              </div>

              {/* Ask Heaven callout */}
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">☁️</span>
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">
                      Not sure if your tenant is liable for council tax?
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      Use our free{' '}
                      <Link href="/ask-heaven" className="text-primary font-medium hover:underline">
                        Ask Heaven landlord Q&amp;A tool
                      </Link>{' '}
                      to get guidance on council tax liability.
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
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                    <ClipboardList className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-3">Essential Documents</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Tenancy agreement (council tax clause)</li>
                    <li>• Council tax bills in your name</li>
                    <li>• Proof of payment to council</li>
                    <li>• Tenancy start/end dates</li>
                    <li>• Calculation of tenant&apos;s share</li>
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                    <Receipt className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-3">Supporting Evidence</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Correspondence requesting payment</li>
                    <li>• Letter before action</li>
                    <li>• Council confirmation of liability</li>
                    <li>• Bank statements (payment proof)</li>
                    <li>• Previous successful payments (if any)</li>
                  </ul>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Council Tax Claim Evidence Checklist
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Tenancy agreement with council tax clause
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Council tax bills (your name, their period)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Proof you paid the council
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Calculation of amount claimed
                    </li>
                  </ul>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Previous payment requests to tenant
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Letter before action sent
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Tenancy dates confirmation
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Interest calculation (if applicable)
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
                Start Your Council Tax Claim
              </h2>
              <p className="text-gray-600 mb-8">
                The Money Claim Pack includes court documents, pre-action letters,
                and guidance for recovering council tax costs.
              </p>
              <Link
                href="/wizard?product=money_claim&reason=unpaid_council_tax&topic=debt&src=seo_money_claim_council_tax"
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
              <FAQSection faqs={faqs} 
                showTrustPositioningBar
              />
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
                  moneyClaimGuides.unpaidUtilities,
                  moneyClaimGuides.unpaidBills,
                  moneyClaimGuides.formerTenant,
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
