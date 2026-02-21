import type { Metadata } from 'next';
import Link from 'next/link';
import { getCanonicalUrl } from '@/lib/seo/urls';
import { StructuredData, faqPageSchema, breadcrumbSchema, articleSchema } from '@/lib/seo/structured-data';
import {
  CheckCircle,
  ArrowRight,
  AlertTriangle,
  Zap,
  FileText,
  ClipboardList,
  Receipt,
} from 'lucide-react';
import { FAQSection } from '@/components/seo/FAQSection';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { moneyClaimGuides, moneyClaimUtilitiesLinks, productLinks } from '@/lib/seo/internal-links';

export const metadata: Metadata = {
  title: 'Claim Unpaid Bills from Tenant 2026 | Water, Broadband & More',
  description:
    'Recover unpaid water bills, broadband, TV licence, and other tenant debts when the tenancy agreement makes them responsible. England landlord guide.',
  keywords: [
    'tenant unpaid bills',
    'tenant water bill',
    'tenant broadband bill',
    'recover bills from tenant',
    'tenant utility debt',
    'landlord bill claim',
    'tenant tv licence',
    'tenant phone bill',
    'unpaid bills money claim',
    'tenant bill liability',
  ],
  openGraph: {
    title: 'Claim Unpaid Bills from Tenant 2026 | Water, Broadband & More',
    description:
      'Landlord guide to recovering unpaid bills from tenants through MCOL.',
    type: 'article',
    url: getCanonicalUrl('/money-claim-unpaid-bills'),
  },
  alternates: {
    canonical: getCanonicalUrl('/money-claim-unpaid-bills'),
  },
};

const faqs = [
  {
    question: 'What types of bills can I claim from a tenant?',
    answer:
      'You can claim bills the tenant contractually agreed to pay but didn\'t, including: water rates, broadband/internet, TV licence (if in their name), phone lines, waste collection charges, and any other services specified in your tenancy agreement.',
  },
  {
    question: 'How is water different from gas and electricity?',
    answer:
      'Unlike gas and electricity, water companies cannot switch off supply for non-payment. Water is often billed to the property (not the person), so landlords may remain liable for tenant water bills. Check if your area has water meters and who the account holder is.',
  },
  {
    question: 'Can I claim TV licence fees from a tenant?',
    answer:
      'Only if: (1) the tenancy agreement made the tenant responsible for TV licence, (2) the TV licence was in their name and they didn\'t pay, or (3) you paid the TV licence on their behalf. TV licence enforcement is usually handled by TV Licensing directly.',
  },
  {
    question: 'The tenant says broadband was included in rent - what now?',
    answer:
      'Check your tenancy agreement carefully. If it says rent is "all inclusive" or specifically includes broadband, you likely cannot claim extra. If broadband is listed as a separate tenant responsibility, you have a claim.',
  },
  {
    question: 'How do I prove the tenant owes for unpaid bills?',
    answer:
      'You need: tenancy agreement showing tenant\'s responsibility for specific bills, bills or statements showing unpaid amounts, proof of dates (matching tenancy period), and evidence you paid the bill on their behalf (if applicable).',
  },
  {
    question: 'The water company is chasing me for the tenant\'s bill - help!',
    answer:
      'Water rates are often charged to the property owner. You must pay the water company to avoid enforcement. Keep all bills as evidence, then claim reimbursement from your tenant under the tenancy agreement.',
  },
  {
    question: 'Can I combine multiple unpaid bills in one claim?',
    answer:
      'Yes, you can combine all unpaid bills, utilities, and other debts into a single money claim. This is more cost-effective as you only pay one court fee. List each item separately with amounts in your particulars of claim.',
  },
  {
    question: 'What if the bill provider closed the account before I got the final bill?',
    answer:
      'Contact the provider for a final statement covering your tenant\'s occupation period. Most providers can produce historical billing statements. You need accurate figures to make a valid claim.',
  },
  {
    question: 'Can I claim for bills after the tenant left?',
    answer:
      'Only for bills accrued during their tenancy. You cannot claim for bills after they moved out unless they remained contractually liable (rare). Calculate amounts based on their actual occupation dates.',
  },
  {
    question: 'The tenant disputes the bill amount - what should I do?',
    answer:
      'Get an itemised statement from the service provider. If the tenant disputes the accuracy of provider bills, that\'s between them and the provider. Your claim is for reimbursement of bills you paid or liability you incurred.',
  },
];

export default function MoneyClaimUnpaidBillsPage() {
  return (
    <>
      <StructuredData
        data={articleSchema({
          headline: 'Claim Unpaid Bills from Tenant (UK Landlord Guide)',
          description:
            'Complete guide for landlords to recover water, broadband, and other unpaid bills from tenants.',
          url: getCanonicalUrl('/money-claim-unpaid-bills'),
          datePublished: '2026-01-15',
          dateModified: '2026-01-15',
        })}
      />
      <StructuredData data={faqPageSchema(faqs)} />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          { name: 'Money Claim Guide', url: 'https://landlordheaven.co.uk/money-claim-unpaid-rent' },
          { name: 'Unpaid Bills Claims', url: 'https://landlordheaven.co.uk/money-claim-unpaid-bills' },
        ])}
      />

      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-cyan-900 to-cyan-800 text-white py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-cyan-700/50 text-cyan-100 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Zap className="w-4 h-4" />
                Recover tenant bill debts
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                Claim Unpaid Bills from Tenant
              </h1>

              <p className="text-xl text-cyan-100 mb-8 max-w-2xl mx-auto">
                Water rates, broadband, TV licence, and other bills your tenant
                was responsible for but didn&apos;t pay.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/wizard?product=money_claim&reason=unpaid_bills&src=seo_unpaid_bills"
                  className="inline-flex items-center justify-center gap-2 bg-white text-cyan-800 font-semibold py-4 px-8 rounded-xl hover:bg-cyan-50 transition-colors"
                >
                  Start Unpaid Bills Claim
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

        {/* Types of Bills Section */}
        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Common Bills You Can Claim
              </h2>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-2">Water Rates</h3>
                  <p className="text-sm text-gray-600">
                    Metered or unmetered water bills charged to the property
                    during tenancy.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-2">Broadband/Internet</h3>
                  <p className="text-sm text-gray-600">
                    Internet service bills if tenant was contractually responsible.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-2">TV Licence</h3>
                  <p className="text-sm text-gray-600">
                    TV licence fees if specified in tenancy agreement.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-2">Phone Lines</h3>
                  <p className="text-sm text-gray-600">
                    Landline rental or phone service charges.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-2">Waste Collection</h3>
                  <p className="text-sm text-gray-600">
                    Private waste collection or bulky item removal charges.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-2">Service Charges</h3>
                  <p className="text-sm text-gray-600">
                    Building service charges if tenant was responsible.
                  </p>
                </div>
              </div>

              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
                <p className="text-amber-900 text-sm flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Important:</strong> Gas and electricity usually transfer with the
                    tenant automatically. Suppliers typically pursue the person using the
                    energy directly. See our{' '}
                    <Link href="/money-claim-unpaid-utilities" className="font-medium underline">
                      unpaid utilities guide
                    </Link>{' '}
                    for specific energy bill situations.
                  </span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Water Bills Special Section */}
        <section className="py-12 lg:py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Water Bills: Special Considerations
              </h2>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                <h3 className="font-bold text-gray-900 mb-3">Why Water is Different</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    Water companies cannot disconnect supply for non-payment
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    Bills are often tied to property, not occupant
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    Landlords may remain ultimately liable to water company
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    Metered properties: easier to calculate tenant&apos;s usage
                  </li>
                </ul>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-3">Metered Properties</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Get meter readings at start and end of tenancy</li>
                    <li>• Request itemised bills for tenancy period</li>
                    <li>• Clearly shows tenant&apos;s actual usage</li>
                    <li>• Easier to prove amount owed</li>
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-3">Unmetered Properties</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Fixed annual charge based on rateable value</li>
                    <li>• Calculate tenant&apos;s share by days occupied</li>
                    <li>• Get statement covering tenancy dates</li>
                    <li>• May need to apportion annual bill</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Evidence Section */}
        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Evidence You Need
              </h2>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-4">
                    <ClipboardList className="w-6 h-6 text-cyan-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-3">Essential Documents</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Tenancy agreement (bill liability clauses)</li>
                    <li>• Bills/statements for tenancy period</li>
                    <li>• Proof you paid the bills</li>
                    <li>• Tenancy start and end dates</li>
                    <li>• Calculation of amounts owed</li>
                  </ul>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-4">
                    <Receipt className="w-6 h-6 text-cyan-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-3">Supporting Evidence</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Correspondence requesting payment</li>
                    <li>• Letter before action sent</li>
                    <li>• Meter readings (if applicable)</li>
                    <li>• Bank statements showing payments</li>
                    <li>• Provider correspondence/demands</li>
                  </ul>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Unpaid Bills Evidence Checklist
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Tenancy agreement bill clauses
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Itemised bills/statements
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Proof of your payment
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Tenancy period confirmation
                    </li>
                  </ul>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Written payment requests
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Letter before action
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Breakdown by bill type
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Interest calculation
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
                Start Your Unpaid Bills Claim
              </h2>
              <p className="text-gray-600 mb-8">
                The Money Claim Pack includes court documents and guidance
                for recovering all types of tenant debts.
              </p>
              <Link
                href="/wizard?product=money_claim&reason=unpaid_bills&src=seo_unpaid_bills"
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
                  moneyClaimGuides.unpaidUtilities,
                  moneyClaimGuides.councilTax,
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
