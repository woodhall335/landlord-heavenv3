import type { Metadata } from 'next';
import Link from 'next/link';
import { getCanonicalUrl } from '@/lib/seo/urls';
import { StructuredData, breadcrumbSchema, articleSchema } from '@/lib/seo/structured-data';
import {
  CheckCircle,
  ArrowRight,
  AlertTriangle,
  Flower2,
  FileText,
  Camera,
  ClipboardList,
  Receipt,
} from 'lucide-react';
import { FAQSection } from '@/components/seo/FAQSection';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { moneyClaimDamageLinks, moneyClaimGuides, productLinks } from '@/lib/seo/internal-links';

export const metadata: Metadata = {
  title: 'Claim for Garden Damage from Tenant 2026 | Landlord Guide',
  description:
    'Recover costs for garden damage, neglect, and overgrown outdoor areas left by tenants. Evidence checklist, claim amounts, and court process for England.',
  keywords: [
    'tenant garden damage',
    'garden neglect claim',
    'overgrown garden tenant',
    'landlord garden repair costs',
    'tenant ruined garden',
    'garden deposit claim',
    'outdoor damage tenant',
    'lawn damage claim',
    'garden clearance costs',
    'tenant garden responsibility',
  ],
  openGraph: {
    title: 'Claim for Garden Damage from Tenant 2026 | Landlord Guide',
    description:
      'Landlord guide to recovering garden damage and neglect costs from tenants through MCOL.',
    type: 'article',
    url: getCanonicalUrl('/money-claim-garden-damage'),
  },
  alternates: {
    canonical: getCanonicalUrl('/money-claim-garden-damage'),
  },
};

const faqs = [
  {
    question: 'Can I claim for an overgrown garden left by my tenant?',
    answer:
      'Yes, if your tenancy agreement required the tenant to maintain the garden in a reasonable condition. You can claim for professional gardening, lawn restoration, hedge trimming, and weed clearance. Compare check-in photos to check-out condition to prove neglect.',
  },
  {
    question: 'What garden damage can I claim from a tenant?',
    answer:
      'Claimable garden damage includes: overgrown lawns requiring professional treatment, dead plants from neglect, broken fencing or gates, damaged decking or patio, uprooted shrubs, rubbish dumped in garden, and damage from unauthorised pets or trampolines.',
  },
  {
    question: 'How do I prove garden neglect?',
    answer:
      'Key evidence includes: dated check-in photos showing garden condition, check-out photos showing neglect, tenancy agreement clause requiring garden maintenance, professional gardener quotes for restoration, and any correspondence about garden upkeep.',
  },
  {
    question: 'Is the tenant responsible for lawn maintenance?',
    answer:
      'Only if the tenancy agreement explicitly states lawn and garden maintenance is the tenant\'s responsibility. Most ASTs include this clause. Without it, garden maintenance may be your responsibility as landlord.',
  },
  {
    question: 'How much can I claim for garden restoration?',
    answer:
      'Typical costs include: lawn restoration £100-400, hedge trimming £50-200, general clearance £100-300, fence repair £100-500 per panel, and decking repair £200-1000. Get professional quotes to support your claim.',
  },
  {
    question: 'Can I claim for dead plants and shrubs?',
    answer:
      'Yes, if the plants died due to tenant neglect (not watering, deliberate damage) and were alive at check-in. You can claim the cost of replacement plants and professional planting. Keep receipts for replacements.',
  },
  {
    question: 'The tenant says the garden was already overgrown - what now?',
    answer:
      'This is why check-in photos are essential. If you have dated photos showing a well-maintained garden at tenancy start, these prove the tenant\'s claim is false. Without check-in evidence, your claim becomes harder.',
  },
  {
    question: 'Can I claim for damage from tenant\'s trampoline or play equipment?',
    answer:
      'Yes, if the equipment was installed without permission or caused damage to the lawn or garden. Dead patches under trampolines, damaged flower beds, and broken fencing from play equipment are all claimable.',
  },
  {
    question: 'How long do I have to claim for garden damage?',
    answer:
      'You have 6 years to bring a contract claim in England & Wales. However, act quickly - ideally within weeks of the tenancy ending. Fresh evidence is more compelling and harder for tenants to dispute.',
  },
  {
    question: 'Should I use the deposit or go to court for garden claims?',
    answer:
      'If garden restoration costs are within the deposit amount, use the deposit scheme\'s dispute resolution first. Go to court if costs exceed the deposit or if you need a binding CCJ for collection.',
  },
];

export default function MoneyClaimGardenDamagePage() {
  return (
    <>
      <StructuredData
        data={articleSchema({
          headline: 'Claim for Garden Damage from Tenant (UK Landlord Guide)',
          description:
            'Complete guide for landlords to recover garden damage and neglect costs from tenants through MCOL.',
          url: getCanonicalUrl('/money-claim-garden-damage'),
          datePublished: '2026-01-15',
          dateModified: '2026-01-15',
        })}
      />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          { name: 'Money Claim Guide', url: 'https://landlordheaven.co.uk/money-claim-unpaid-rent' },
          { name: 'Garden Damage', url: 'https://landlordheaven.co.uk/money-claim-garden-damage' },
        ])}
      />

      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-green-900 to-green-800 text-white py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-green-700/50 text-green-100 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Flower2 className="w-4 h-4" />
                Recover garden restoration costs
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                Claim for Garden Damage &amp; Neglect from Tenant
              </h1>

              <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
                When tenants leave your garden overgrown, damaged, or full of rubbish,
                recover professional restoration costs through the courts.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/wizard?product=money_claim&reason=property_damage&src=seo_garden_damage"
                  className="inline-flex items-center justify-center gap-2 bg-white text-green-800 font-semibold py-4 px-8 rounded-xl hover:bg-green-50 transition-colors"
                >
                  Start Garden Damage Claim
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

        {/* What You Can Claim Section */}
        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                What Garden Damage Can You Claim?
              </h2>

              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-8 rounded-r-lg">
                <p className="text-amber-900 text-sm flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Key requirement:</strong> Your tenancy agreement must include a clause
                    making the tenant responsible for garden maintenance. Without this clause,
                    garden upkeep may be your responsibility.
                  </span>
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Claimable Garden Damage
                  </h3>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li className="flex items-start gap-2">
                      <Flower2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      Overgrown lawn requiring professional restoration
                    </li>
                    <li className="flex items-start gap-2">
                      <Flower2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      Dead plants and shrubs from neglect
                    </li>
                    <li className="flex items-start gap-2">
                      <Flower2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      Overgrown hedges blocking light/access
                    </li>
                    <li className="flex items-start gap-2">
                      <Flower2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      Broken fencing or gates from misuse
                    </li>
                    <li className="flex items-start gap-2">
                      <Flower2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      Damaged decking or patio slabs
                    </li>
                    <li className="flex items-start gap-2">
                      <Flower2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      Rubbish and debris dumped in garden
                    </li>
                    <li className="flex items-start gap-2">
                      <Flower2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      Damage from unauthorised pets or equipment
                    </li>
                  </ul>
                </div>

                <div className="bg-red-50 rounded-xl p-6 border border-red-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    What You Cannot Claim
                  </h3>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li>• Seasonal changes (autumn leaves, dormant plants)</li>
                    <li>• Normal wear on lawn from regular use</li>
                    <li>• Improvements beyond original condition</li>
                    <li>• Damage from wildlife or weather</li>
                    <li>• Garden maintenance if not in tenancy agreement</li>
                    <li>• Pre-existing issues not documented at check-in</li>
                    <li>• Plants that were already in poor condition</li>
                  </ul>
                </div>
              </div>

              {/* Ask Heaven callout */}
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-8">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">☁️</span>
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">
                      Unsure what garden costs you can claim?
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      Use our free{' '}
                      <Link href="/ask-heaven" className="text-primary font-medium hover:underline">
                        Ask Heaven landlord Q&amp;A tool
                      </Link>{' '}
                      to get instant guidance on your specific situation.
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
                Evidence You Need for Garden Damage Claims
              </h2>

              <p className="text-gray-600 mb-8">
                Strong evidence is essential. Courts need proof that the garden was in good
                condition at check-in, the tenant was responsible for maintenance, and the
                damage occurred during the tenancy.
              </p>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <Camera className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-3">Photographic Evidence</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Check-in garden photos (dated)</li>
                    <li>• Check-out photos showing damage</li>
                    <li>• Overview shots of whole garden</li>
                    <li>• Close-ups of specific damage</li>
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <ClipboardList className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-3">Documentation</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Tenancy agreement with garden clause</li>
                    <li>• Check-in inventory report</li>
                    <li>• Check-out inspection report</li>
                    <li>• Any maintenance correspondence</li>
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <Receipt className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-3">Cost Evidence</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Professional gardener quotes (2-3)</li>
                    <li>• Restoration invoices</li>
                    <li>• Receipts for replacement plants</li>
                    <li>• Fence/decking repair costs</li>
                  </ul>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Garden Damage Evidence Checklist
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Signed tenancy agreement with garden clause
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Check-in garden photos (dated)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Check-out photos showing damage
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Professional restoration quotes
                    </li>
                  </ul>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Gardening invoices or receipts
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Inventory reports (check-in/out)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Letter before action (sent to tenant)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Correspondence about garden issues
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Typical Costs Section */}
        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Typical Garden Restoration Costs
              </h2>

              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-8">
                <table className="w-full">
                  <thead className="border-b bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left font-semibold text-gray-900">
                        Service
                      </th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-900">
                        Typical Cost
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-3 text-gray-600">Lawn restoration (scarify, seed, feed)</td>
                      <td className="px-6 py-3 text-gray-900 font-medium">£150 - £400</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-3 text-gray-600">Hedge trimming (per metre)</td>
                      <td className="px-6 py-3 text-gray-900 font-medium">£5 - £15</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-3 text-gray-600">Garden clearance (small garden)</td>
                      <td className="px-6 py-3 text-gray-900 font-medium">£100 - £300</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-3 text-gray-600">Fence panel replacement</td>
                      <td className="px-6 py-3 text-gray-900 font-medium">£100 - £200</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-3 text-gray-600">Decking repair or replacement</td>
                      <td className="px-6 py-3 text-gray-900 font-medium">£200 - £1,000+</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-3 text-gray-600">Plant replacement and planting</td>
                      <td className="px-6 py-3 text-gray-900 font-medium">£50 - £500</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-3 text-gray-600">Skip hire for garden waste</td>
                      <td className="px-6 py-3 text-gray-900 font-medium">£150 - £300</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-2">
                  Get Multiple Quotes
                </h3>
                <p className="text-gray-600 text-sm">
                  Courts expect you to have obtained reasonable quotes. Get 2-3 quotes from
                  professional gardeners to demonstrate you&apos;re claiming a fair amount.
                  Keep all quotes even if you used a different contractor.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* What the Pack Includes */}
        <section className="py-12 lg:py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                What the Money Claim Pack Includes
              </h2>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-4">Court Documents</h3>
                  <ul className="space-y-2 text-gray-600 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Completed N1 claim form
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Particulars of claim (legally worded)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Schedule of damage with itemised costs
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Statement of truth
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-4">Pre-Action Documents</h3>
                  <ul className="space-y-2 text-gray-600 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Letter before action template
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Itemised schedule of costs
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Evidence bundle guide
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Witness statement template
                    </li>
                  </ul>
                </div>
              </div>

              <div className="text-center">
                <Link
                  href="/wizard?product=money_claim&reason=property_damage&src=seo_garden_damage"
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
