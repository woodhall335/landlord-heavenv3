import type { Metadata } from 'next';
import Link from 'next/link';
import { getCanonicalUrl } from '@/lib/seo/urls';
import { StructuredData, faqPageSchema, breadcrumbSchema, articleSchema } from '@/lib/seo/structured-data';
import {
  CheckCircle,
  ArrowRight,
  AlertTriangle,
  Package,
  FileText,
  Camera,
  ClipboardList,
  Receipt,
  Clock,
} from 'lucide-react';
import { FAQSection } from '@/components/seo/FAQSection';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { moneyClaimGuides, moneyClaimCleaningLinks, productLinks } from '@/lib/seo/internal-links';

export const metadata: Metadata = {
  title: 'Claim for Abandoned Goods Removal 2026 | Tenant Left Belongings',
  description:
    'Recover costs for removing and disposing of belongings left by tenants. Legal process for abandoned goods, notice requirements, and court claims.',
  keywords: [
    'tenant abandoned goods',
    'tenant left belongings',
    'abandoned property tenant',
    'dispose tenant belongings',
    'landlord remove tenant items',
    'tenant left furniture',
    'abandoned goods notice',
    'tenant property disposal',
    'rubbish removal tenant',
    'house clearance tenant',
  ],
  openGraph: {
    title: 'Claim for Abandoned Goods Removal 2026 | Tenant Left Belongings',
    description:
      'Landlord guide to legally disposing of tenant belongings and recovering removal costs through MCOL.',
    type: 'article',
    url: getCanonicalUrl('/money-claim-abandoned-goods'),
  },
  alternates: {
    canonical: getCanonicalUrl('/money-claim-abandoned-goods'),
  },
};

const faqs = [
  {
    question: 'Can I throw away belongings left by my tenant?',
    answer:
      'Not immediately. Under the Torts (Interference with Goods) Act 1977, you must give the tenant reasonable notice to collect their belongings before disposal. Send written notice giving 14-28 days to collect. After this period, you can dispose of items and potentially claim costs.',
  },
  {
    question: 'How long must I keep abandoned tenant belongings?',
    answer:
      'There\'s no fixed legal timeframe, but 14-28 days is generally considered reasonable for notice. Keep items stored safely during this period. For high-value items, consider longer notice. Document everything.',
  },
  {
    question: 'What costs can I claim for abandoned goods?',
    answer:
      'Claimable costs include: storage costs during notice period, removal and disposal costs (skip hire, house clearance), cleaning costs for affected areas, lost rent if property can\'t be re-let, and your reasonable time/labour.',
  },
  {
    question: 'How do I serve notice about abandoned goods?',
    answer:
      'Send written notice to the tenant\'s last known address (and forwarding address if known). Use recorded delivery. Include: list of items, deadline for collection, storage location, and warning of disposal after deadline. Keep proof of sending.',
  },
  {
    question: 'Can I sell valuable items instead of disposing?',
    answer:
      'Yes, if items have value. You must still give reasonable notice and attempt contact. Any sale proceeds should be used to offset storage/removal costs and arrears owed. Remaining funds belong to the tenant - hold for 6 years.',
  },
  {
    question: 'What if the tenant says the items weren\'t theirs?',
    answer:
      'Your inventory is key evidence. If items weren\'t listed at check-in, they belong to the tenant. If items were provided (furnished let), they remain yours. Document all items with photos before any disposal.',
  },
  {
    question: 'Can I claim for lost rent due to abandoned goods?',
    answer:
      'Potentially, if the abandoned goods prevented you from re-letting the property. You must show you made reasonable efforts to clear promptly and mitigate losses. Courts may award rent loss for the clearance period.',
  },
  {
    question: 'What about hazardous items or waste?',
    answer:
      'Hazardous waste (chemicals, asbestos, certain electronics) requires specialist disposal. You can claim these enhanced disposal costs. Keep all certificates of disposal for environmental compliance.',
  },
  {
    question: 'The tenant has disappeared - how do I find them to claim?',
    answer:
      'Try: forwarding address from Royal Mail, guarantor contact, previous landlord, social media, tracing agents. If truly untraceable, you may need to apply to court for alternative service. Consider whether the claim value justifies tracing costs.',
  },
  {
    question: 'How much does house clearance typically cost?',
    answer:
      'Typical costs: small clearance (few items) £100-200, medium clearance (furniture + items) £300-500, full house clearance £500-1500+, skip hire £150-300. Get professional quotes documenting what was cleared.',
  },
];

export default function MoneyClaimAbandonedGoodsPage() {
  return (
    <>
      <StructuredData
        data={articleSchema({
          headline: 'Claim for Abandoned Goods Removal from Tenant (UK Landlord Guide)',
          description:
            'Complete guide for landlords to legally dispose of tenant belongings and recover removal costs through MCOL.',
          url: getCanonicalUrl('/money-claim-abandoned-goods'),
          datePublished: '2026-01-15',
          dateModified: '2026-01-15',
        })}
      />
      <StructuredData data={faqPageSchema(faqs)} />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          { name: 'Money Claim Guide', url: 'https://landlordheaven.co.uk/money-claim-unpaid-rent' },
          { name: 'Abandoned Goods', url: 'https://landlordheaven.co.uk/money-claim-abandoned-goods' },
        ])}
      />

      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-violet-900 to-violet-800 text-white py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-violet-700/50 text-violet-100 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Package className="w-4 h-4" />
                Recover clearance costs
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                Claim for Abandoned Goods Removal from Tenant
              </h1>

              <p className="text-xl text-violet-100 mb-8 max-w-2xl mx-auto">
                When tenants leave belongings behind, learn the legal process for
                disposal and recover removal costs through the courts.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/wizard?product=money_claim&reason=cleaning&src=seo_abandoned_goods"
                  className="inline-flex items-center justify-center gap-2 bg-white text-violet-800 font-semibold py-4 px-8 rounded-xl hover:bg-violet-50 transition-colors"
                >
                  Start Abandoned Goods Claim
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

        {/* Legal Process Section */}
        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Legal Process for Abandoned Goods
              </h2>

              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded-r-lg">
                <p className="text-red-900 text-sm flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Important:</strong> Do not dispose of tenant belongings without
                    following the legal process. Wrongful disposal could expose you to claims
                    for conversion or trespass to goods.
                  </span>
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0 text-violet-700 font-bold">
                      1
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Document Everything</h3>
                      <p className="text-gray-600 text-sm">
                        Before touching anything, photograph and list all items left behind.
                        Note condition, location, and approximate value. This protects you
                        against claims that items were damaged or missing.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0 text-violet-700 font-bold">
                      2
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Send Written Notice</h3>
                      <p className="text-gray-600 text-sm">
                        Send a formal notice to the tenant&apos;s last known address and any
                        forwarding address. Use recorded delivery. Give 14-28 days to collect
                        belongings. State what will happen if items aren&apos;t collected.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0 text-violet-700 font-bold">
                      3
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Store Items Safely</h3>
                      <p className="text-gray-600 text-sm">
                        During the notice period, store items safely. You can charge reasonable
                        storage costs. Keep items at the property or use a storage facility.
                        Don&apos;t damage or lose items during storage.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0 text-violet-700 font-bold">
                      4
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Dispose or Sell After Deadline</h3>
                      <p className="text-gray-600 text-sm">
                        If the tenant doesn&apos;t collect by the deadline, you can dispose of
                        items (keep receipts) or sell valuable items (offset against debts,
                        hold remainder for tenant). Document all actions.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0 text-violet-700 font-bold">
                      5
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Claim Costs</h3>
                      <p className="text-gray-600 text-sm">
                        Make a court claim for storage costs, removal costs, disposal fees,
                        and any lost rent. Include all receipts and documentation in your claim.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What You Can Claim Section */}
        <section className="py-12 lg:py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                What Costs Can You Claim?
              </h2>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Claimable Costs
                  </h3>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li className="flex items-start gap-2">
                      <Package className="w-4 h-4 text-violet-500 mt-0.5 flex-shrink-0" />
                      Storage costs during notice period
                    </li>
                    <li className="flex items-start gap-2">
                      <Package className="w-4 h-4 text-violet-500 mt-0.5 flex-shrink-0" />
                      House clearance service fees
                    </li>
                    <li className="flex items-start gap-2">
                      <Package className="w-4 h-4 text-violet-500 mt-0.5 flex-shrink-0" />
                      Skip hire for rubbish disposal
                    </li>
                    <li className="flex items-start gap-2">
                      <Package className="w-4 h-4 text-violet-500 mt-0.5 flex-shrink-0" />
                      Specialist waste disposal (e.g., mattresses)
                    </li>
                    <li className="flex items-start gap-2">
                      <Package className="w-4 h-4 text-violet-500 mt-0.5 flex-shrink-0" />
                      Your reasonable time at hourly rate
                    </li>
                    <li className="flex items-start gap-2">
                      <Package className="w-4 h-4 text-violet-500 mt-0.5 flex-shrink-0" />
                      Lost rent during clearance period
                    </li>
                    <li className="flex items-start gap-2">
                      <Package className="w-4 h-4 text-violet-500 mt-0.5 flex-shrink-0" />
                      Vehicle hire for removal
                    </li>
                  </ul>
                </div>

                <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-600" />
                    Timeline Requirements
                  </h3>
                  <ul className="space-y-3 text-gray-700 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="font-medium text-amber-700 w-24 flex-shrink-0">Day 1:</span>
                      Document all items with photos
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-medium text-amber-700 w-24 flex-shrink-0">Day 1-3:</span>
                      Send formal notice (recorded delivery)
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-medium text-amber-700 w-24 flex-shrink-0">Day 14-28:</span>
                      Notice period (store items safely)
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-medium text-amber-700 w-24 flex-shrink-0">After deadline:</span>
                      Dispose/sell items, keep records
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-medium text-amber-700 w-24 flex-shrink-0">Then:</span>
                      Make court claim for costs
                    </li>
                  </ul>
                </div>
              </div>

              {/* Typical costs table */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-8">
                <div className="bg-gray-50 px-6 py-4 border-b">
                  <h3 className="font-bold text-gray-900">Typical Clearance Costs</h3>
                </div>
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="px-6 py-3 text-left font-semibold text-gray-900">Service</th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-900">Typical Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-3 text-gray-600">Mini skip hire (2-3 yards)</td>
                      <td className="px-6 py-3 text-gray-900 font-medium">£150 - £200</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-3 text-gray-600">Builder&apos;s skip (6-8 yards)</td>
                      <td className="px-6 py-3 text-gray-900 font-medium">£250 - £350</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-3 text-gray-600">House clearance (1 bed flat)</td>
                      <td className="px-6 py-3 text-gray-900 font-medium">£200 - £400</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-3 text-gray-600">House clearance (3 bed house)</td>
                      <td className="px-6 py-3 text-gray-900 font-medium">£500 - £1,200</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-3 text-gray-600">Single item removal (mattress, sofa)</td>
                      <td className="px-6 py-3 text-gray-900 font-medium">£30 - £80</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-3 text-gray-600">Storage facility (per week)</td>
                      <td className="px-6 py-3 text-gray-900 font-medium">£15 - £50</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Ask Heaven callout */}
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">☁️</span>
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">
                      Not sure about the legal process for abandoned goods?
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      Use our free{' '}
                      <Link href="/ask-heaven" className="text-primary font-medium hover:underline">
                        Ask Heaven landlord Q&amp;A tool
                      </Link>{' '}
                      to get guidance on notice periods and disposal requirements.
                    </p>
                  </div>
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

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center mb-4">
                    <Camera className="w-6 h-6 text-violet-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-3">Photo Evidence</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Photos of all abandoned items</li>
                    <li>• Location and condition shots</li>
                    <li>• Photos before disposal</li>
                    <li>• Photos after clearance</li>
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center mb-4">
                    <ClipboardList className="w-6 h-6 text-violet-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-3">Notice Records</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Copy of notice sent</li>
                    <li>• Recorded delivery proof</li>
                    <li>• Itemised list of goods</li>
                    <li>• Timeline of events</li>
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center mb-4">
                    <Receipt className="w-6 h-6 text-violet-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-3">Cost Evidence</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Clearance company invoice</li>
                    <li>• Skip hire receipt</li>
                    <li>• Storage facility receipts</li>
                    <li>• Time/mileage log (if DIY)</li>
                  </ul>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Abandoned Goods Evidence Checklist
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Photos/inventory of all items
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Copy of notice to tenant
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Recorded delivery proof
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Timeline of events
                    </li>
                  </ul>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Clearance/disposal receipts
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Storage cost evidence
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Letter before action sent
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Sale records (if applicable)
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
                Start Your Abandoned Goods Claim
              </h2>
              <p className="text-gray-600 mb-8">
                The Money Claim Pack includes court documents, notice templates,
                and guidance for recovering clearance costs.
              </p>
              <Link
                href="/wizard?product=money_claim&reason=cleaning&src=seo_abandoned_goods"
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
                  moneyClaimGuides.cleaningCosts,
                  moneyClaimGuides.formerTenant,
                  moneyClaimGuides.depositShortfall,
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
