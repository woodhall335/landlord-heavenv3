import type { Metadata } from 'next';
import Link from 'next/link';
import { getCanonicalUrl } from '@/lib/seo/urls';
import { StructuredData, breadcrumbSchema, articleSchema } from '@/lib/seo/structured-data';
import {
  CheckCircle,
  ArrowRight,
  AlertTriangle,
  Layers,
  FileText,
  Camera,
  ClipboardList,
  Receipt,
} from 'lucide-react';
import { FAQSection } from '@/components/seo/FAQSection';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { moneyClaimGuides, productLinks } from '@/lib/seo/internal-links';

export const metadata: Metadata = {
  title: 'Claim for Carpet Damage from Tenant 2026 | Stains, Burns & Replacement',
  description:
    'Recover carpet replacement and cleaning costs from tenants. Evidence guide for stains, burns, tears, and pet damage. Calculate fair wear vs tenant damage.',
  keywords: [
    'carpet damage tenant',
    'carpet stain claim landlord',
    'tenant carpet replacement',
    'carpet burn hole claim',
    'pet damage carpet',
    'carpet wear and tear',
    'landlord carpet claim',
    'carpet cleaning deposit',
    'flooring damage tenant',
    'carpet replacement cost claim',
  ],
  openGraph: {
    title: 'Claim for Carpet Damage from Tenant 2026 | Stains, Burns & Replacement',
    description:
      'Landlord guide to recovering carpet damage costs from tenants through MCOL.',
    type: 'article',
    url: getCanonicalUrl('/money-claim-carpet-damage'),
  },
  alternates: {
    canonical: getCanonicalUrl('/money-claim-carpet-damage'),
  },
};

const faqs = [
  {
    question: 'Can I charge a tenant for carpet replacement?',
    answer:
      'You can claim for carpet replacement if the damage goes beyond fair wear and tear. This includes burns, large stains that won\'t clean out, tears, and pet damage. You must account for the carpet\'s age - a 10-year-old carpet at end of life has limited claim value.',
  },
  {
    question: 'What is fair wear and tear for carpets?',
    answer:
      'Fair wear and tear includes: slight fading from sunlight, minor flattening in high-traffic areas, small areas of general wear at doorways, and light soiling from normal use. It does NOT include stains, burns, tears, pet damage, or excessive soiling.',
  },
  {
    question: 'How do I calculate betterment for old carpets?',
    answer:
      'Betterment reduces your claim based on carpet age. A carpet with a 10-year lifespan that was 8 years old has 2 years remaining value (20%). If replacement costs £500, you can claim £100 (20% of value). Courts expect betterment calculations.',
  },
  {
    question: 'What carpet damage can I claim for?',
    answer:
      'Claimable damage includes: cigarette or iron burns, red wine or permanent stains, tears or rips, bleach marks, pet urine stains and odours, excessive dirt or soiling, mould damage from tenant neglect, and deliberate damage or vandalism.',
  },
  {
    question: 'Can I claim for professional carpet cleaning?',
    answer:
      'Yes, if the carpet is significantly dirtier than at check-in (beyond normal use). Get professional cleaning quotes. If cleaning won\'t remove stains, document this with cleaner\'s written assessment to support a replacement claim.',
  },
  {
    question: 'How do I prove carpet damage was caused by the tenant?',
    answer:
      'Key evidence includes: dated check-in photos showing carpet condition, check-out photos showing damage, professional cleaner assessment if applicable, and any tenant admission. The clearer your before/after documentation, the stronger your claim.',
  },
  {
    question: 'Can I claim for carpet underlay as well?',
    answer:
      'Yes, if the underlay is also damaged (e.g., from pet urine soaking through). Include underlay costs in your claim with separate quotes. Underlay damage is common with pet or liquid damage.',
  },
  {
    question: 'What about laminate or vinyl flooring damage?',
    answer:
      'Same principles apply. You can claim for scratches beyond fair wear, dents from heavy furniture, water damage, burns, and tears. Document condition at check-in and account for age and expected lifespan.',
  },
  {
    question: 'The tenant disputes the stain was already there - what now?',
    answer:
      'This is why dated check-in photos are essential. If you have clear photos from check-in showing no stain, present these as evidence. Without check-in documentation, the dispute becomes harder to resolve in your favour.',
  },
  {
    question: 'Should I claim through deposit or court for carpet damage?',
    answer:
      'If damage costs are within the deposit, use deposit scheme dispute resolution first (free). Only go to court if costs exceed the deposit, the tenant disputes the deposit decision, or you need a binding CCJ.',
  },
];

export default function MoneyClaimCarpetDamagePage() {
  return (
    <>
      <StructuredData
        data={articleSchema({
          headline: 'Claim for Carpet Damage from Tenant (UK Landlord Guide)',
          description:
            'Complete guide for landlords to recover carpet damage costs from tenants through MCOL.',
          url: getCanonicalUrl('/money-claim-carpet-damage'),
          datePublished: '2026-01-15',
          dateModified: '2026-01-15',
        })}
      />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          { name: 'Money Claim Guide', url: 'https://landlordheaven.co.uk/money-claim-unpaid-rent' },
          { name: 'Carpet Damage', url: 'https://landlordheaven.co.uk/money-claim-carpet-damage' },
        ])}
      />

      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-amber-900 to-amber-800 text-white py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-amber-700/50 text-amber-100 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Layers className="w-4 h-4" />
                Recover flooring costs
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                Claim for Carpet Damage, Stains &amp; Burns from Tenant
              </h1>

              <p className="text-xl text-amber-100 mb-8 max-w-2xl mx-auto">
                When tenant damage to carpets and flooring exceeds fair wear and tear,
                recover replacement or cleaning costs through the courts.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/wizard?product=money_claim&reason=property_damage&src=seo_carpet_damage"
                  className="inline-flex items-center justify-center gap-2 bg-white text-amber-800 font-semibold py-4 px-8 rounded-xl hover:bg-amber-50 transition-colors"
                >
                  Start Carpet Damage Claim
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

        {/* Wear and Tear vs Damage */}
        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Fair Wear &amp; Tear vs Claimable Damage
              </h2>

              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-8 rounded-r-lg">
                <p className="text-amber-900 text-sm flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Betterment applies:</strong> You can only claim the remaining value
                    of the carpet based on its age. A 10-year carpet at end of life has minimal
                    claim value regardless of damage.
                  </span>
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Claimable Carpet Damage
                  </h3>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li className="flex items-start gap-2">
                      <Layers className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      Cigarette or iron burns
                    </li>
                    <li className="flex items-start gap-2">
                      <Layers className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      Permanent stains (wine, dye, ink)
                    </li>
                    <li className="flex items-start gap-2">
                      <Layers className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      Tears, rips, or pulled threads
                    </li>
                    <li className="flex items-start gap-2">
                      <Layers className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      Bleach marks or discolouration
                    </li>
                    <li className="flex items-start gap-2">
                      <Layers className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      Pet urine stains and odours
                    </li>
                    <li className="flex items-start gap-2">
                      <Layers className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      Mould from tenant neglect
                    </li>
                    <li className="flex items-start gap-2">
                      <Layers className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      Excessive dirt beyond professional cleaning
                    </li>
                  </ul>
                </div>

                <div className="bg-red-50 rounded-xl p-6 border border-red-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    Fair Wear &amp; Tear (Not Claimable)
                  </h3>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li>• Slight fading from sunlight</li>
                    <li>• Minor flattening in high-traffic areas</li>
                    <li>• Small wear patches at doorways</li>
                    <li>• Light general soiling from normal use</li>
                    <li>• Slight colour change over time</li>
                    <li>• Minor indentations from furniture</li>
                    <li>• Age-related deterioration</li>
                  </ul>
                </div>
              </div>

              {/* Betterment Calculator */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Carpet Betterment Calculation
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Courts expect you to account for carpet age. This table shows typical
                  carpet lifespans and how to calculate remaining value:
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left font-semibold text-gray-900">Carpet Quality</th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-900">Expected Lifespan</th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-900">Value at 5 Years</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="px-4 py-2 text-gray-600">Budget (rental grade)</td>
                        <td className="px-4 py-2 text-gray-900">5-7 years</td>
                        <td className="px-4 py-2 text-gray-900">0-30%</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="px-4 py-2 text-gray-600">Mid-range</td>
                        <td className="px-4 py-2 text-gray-900">8-10 years</td>
                        <td className="px-4 py-2 text-gray-900">40-50%</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 text-gray-600">Premium quality</td>
                        <td className="px-4 py-2 text-gray-900">10-15 years</td>
                        <td className="px-4 py-2 text-gray-900">50-70%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-gray-500 mt-4">
                  Example: A £600 mid-range carpet that was 6 years old has 40% remaining lifespan.
                  Maximum claim = £600 × 40% = £240.
                </p>
              </div>

              {/* Ask Heaven callout */}
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">☁️</span>
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">
                      Need help calculating your carpet claim?
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      Use our free{' '}
                      <Link href="/ask-heaven" className="text-primary font-medium hover:underline">
                        Ask Heaven landlord Q&amp;A tool
                      </Link>{' '}
                      to get guidance on betterment and claim amounts.
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
                Evidence You Need for Carpet Claims
              </h2>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                    <Camera className="w-6 h-6 text-amber-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-3">Photo Evidence</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Check-in carpet photos (dated)</li>
                    <li>• Check-out damage photos</li>
                    <li>• Close-ups of stains/burns</li>
                    <li>• Room overview shots</li>
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                    <ClipboardList className="w-6 h-6 text-amber-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-3">Documentation</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Original carpet receipts (if available)</li>
                    <li>• Check-in/out inventory reports</li>
                    <li>• Cleaner&apos;s assessment report</li>
                    <li>• Carpet age and specification</li>
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                    <Receipt className="w-6 h-6 text-amber-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-3">Cost Evidence</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Replacement quotes (2-3)</li>
                    <li>• Professional cleaning quotes</li>
                    <li>• Fitting and underlay costs</li>
                    <li>• Betterment calculation</li>
                  </ul>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Carpet Damage Evidence Checklist
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Check-in inventory with carpet condition
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Dated before and after photos
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Evidence of carpet age and quality
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Professional cleaning attempt (if applicable)
                    </li>
                  </ul>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Replacement quotes with betterment applied
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Letter before action sent to tenant
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Tenancy agreement (for liability)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Cleaner&apos;s written assessment
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
                Typical Carpet Replacement Costs
              </h2>

              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-8">
                <table className="w-full">
                  <thead className="border-b bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left font-semibold text-gray-900">Service</th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-900">Typical Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-3 text-gray-600">Professional deep clean (per room)</td>
                      <td className="px-6 py-3 text-gray-900 font-medium">£25 - £60</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-3 text-gray-600">Stain treatment (specialist)</td>
                      <td className="px-6 py-3 text-gray-900 font-medium">£50 - £150</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-3 text-gray-600">Budget carpet + fitting (per sqm)</td>
                      <td className="px-6 py-3 text-gray-900 font-medium">£15 - £25</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-3 text-gray-600">Mid-range carpet + fitting (per sqm)</td>
                      <td className="px-6 py-3 text-gray-900 font-medium">£25 - £45</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-3 text-gray-600">Underlay replacement (per sqm)</td>
                      <td className="px-6 py-3 text-gray-900 font-medium">£3 - £8</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-3 text-gray-600">Old carpet removal and disposal</td>
                      <td className="px-6 py-3 text-gray-900 font-medium">£50 - £150</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="text-center">
                <Link
                  href="/wizard?product=money_claim&reason=property_damage&src=seo_carpet_damage"
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
