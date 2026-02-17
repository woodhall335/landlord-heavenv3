import type { Metadata } from 'next';
import Link from 'next/link';
import { getCanonicalUrl } from '@/lib/seo/urls';
import { StructuredData, faqPageSchema, breadcrumbSchema, articleSchema } from '@/lib/seo/structured-data';
import {
  CheckCircle,
  ArrowRight,
  AlertTriangle,
  Bath,
  FileText,
  Camera,
  ClipboardList,
  Receipt,
} from 'lucide-react';
import { FAQSection } from '@/components/seo/FAQSection';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { moneyClaimGuides, productLinks } from '@/lib/seo/internal-links';

export const metadata: Metadata = {
  title: 'Claim for Bathroom Damage from Tenant 2026 | Mould, Limescale & Fixtures',
  description:
    'Recover costs for bathroom damage, mould from tenant neglect, limescale damage, and broken fixtures. Evidence requirements and court claim process.',
  keywords: [
    'bathroom damage tenant',
    'mould damage claim landlord',
    'limescale damage tenant',
    'broken bathroom fixtures',
    'toilet damage claim',
    'shower damage tenant',
    'bathroom neglect landlord',
    'tenant damaged bathroom',
    'bathroom repair costs',
    'bathroom mould claim',
  ],
  openGraph: {
    title: 'Claim for Bathroom Damage from Tenant 2026 | Mould, Limescale & Fixtures',
    description:
      'Landlord guide to recovering bathroom damage costs from tenants through MCOL.',
    type: 'article',
    url: getCanonicalUrl('/money-claim-bathroom-damage'),
  },
  alternates: {
    canonical: getCanonicalUrl('/money-claim-bathroom-damage'),
  },
};

const faqs = [
  {
    question: 'Can I claim for mould in the bathroom caused by the tenant?',
    answer:
      'You can claim for mould if it was caused by tenant behaviour (not opening windows, not using extractor fan, drying clothes indoors excessively) rather than building defects. You must prove the bathroom was mould-free at check-in and provide evidence of tenant negligence.',
  },
  {
    question: 'Is limescale damage the tenant\'s responsibility?',
    answer:
      'Minor limescale buildup is generally fair wear in hard water areas. However, severe limescale damage from prolonged neglect (not cleaning) may be claimable. Your tenancy agreement should require tenants to keep the bathroom clean. Extreme cases require clear before/after evidence.',
  },
  {
    question: 'What bathroom damage can I claim for?',
    answer:
      'Claimable damage includes: cracked or chipped toilet, sink, or bath from impact, mould from tenant neglect, damaged taps or shower fixtures, broken toilet seat, grout damage beyond fair wear, damaged shower screens, and missing or broken accessories.',
  },
  {
    question: 'Can I claim for a cracked toilet or sink?',
    answer:
      'Yes, if the crack was caused by tenant misuse or impact (e.g., dropping heavy objects, standing on toilet). You cannot claim for hairline cracks from thermal stress or manufacturing defects. Document the item as undamaged at check-in.',
  },
  {
    question: 'How do I prove mould was caused by tenant behaviour?',
    answer:
      'Key evidence includes: check-in photos showing no mould, check-out photos showing mould, proof ventilation was working (extractor fan), expert assessment attributing mould to condensation/lack of ventilation rather than damp penetration, and tenant communication about ventilation.',
  },
  {
    question: 'Can I claim for bathroom silicone sealant replacement?',
    answer:
      'Silicone typically lasts 5-10 years and replacement is often considered maintenance. However, if sealant is mouldy due to tenant neglect (not cleaning/ventilating) or damaged by tenant actions, you may have a claim with clear evidence.',
  },
  {
    question: 'What about damage to shower screens or doors?',
    answer:
      'Cracked or broken shower screens from impact are claimable. Limescale on glass is harder to claim (regular cleaning issue). Damaged hinges or rollers from misuse are also claimable. Document condition at check-in.',
  },
  {
    question: 'Can I claim for a blocked or damaged drain?',
    answer:
      'If the blockage was caused by tenant misuse (e.g., flushing inappropriate items, hair buildup from lack of strainer use), you may claim clearing costs. Get a plumber\'s report stating the cause. Normal usage blockages are harder to claim.',
  },
  {
    question: 'How much can I claim for bathroom repairs?',
    answer:
      'Typical costs: toilet replacement £100-250, sink replacement £100-300, professional mould treatment £150-400, tap replacement £80-200, re-grouting £100-250, shower screen replacement £200-500. Get professional quotes.',
  },
  {
    question: 'Should I use the deposit or court for bathroom claims?',
    answer:
      'If costs are within the deposit, use deposit dispute resolution first (free). Go to court if costs exceed the deposit, the tenant disputes the deposit decision, or you need a binding CCJ for collection.',
  },
];

export default function MoneyClaimBathroomDamagePage() {
  return (
    <>
      <StructuredData
        data={articleSchema({
          headline: 'Claim for Bathroom Damage from Tenant (UK Landlord Guide)',
          description:
            'Complete guide for landlords to recover bathroom damage costs from tenants through MCOL.',
          url: getCanonicalUrl('/money-claim-bathroom-damage'),
          datePublished: '2026-01-15',
          dateModified: '2026-01-15',
        })}
      />
      <StructuredData data={faqPageSchema(faqs)} />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          { name: 'Money Claim Guide', url: 'https://landlordheaven.co.uk/money-claim-unpaid-rent' },
          { name: 'Bathroom Damage', url: 'https://landlordheaven.co.uk/money-claim-bathroom-damage' },
        ])}
      />

      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-cyan-900 to-cyan-800 text-white py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-cyan-700/50 text-cyan-100 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Bath className="w-4 h-4" />
                Recover bathroom repair costs
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                Claim for Bathroom Damage, Mould &amp; Neglect from Tenant
              </h1>

              <p className="text-xl text-cyan-100 mb-8 max-w-2xl mx-auto">
                When tenants leave bathrooms with mould, limescale damage, or broken
                fixtures, recover professional repair costs through the courts.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/wizard?product=money_claim&reason=property_damage&src=seo_bathroom_damage"
                  className="inline-flex items-center justify-center gap-2 bg-white text-cyan-800 font-semibold py-4 px-8 rounded-xl hover:bg-cyan-50 transition-colors"
                >
                  Start Bathroom Damage Claim
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
                What Bathroom Damage Can You Claim?
              </h2>

              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-8 rounded-r-lg">
                <p className="text-amber-900 text-sm flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Mould claims require proof:</strong> You must demonstrate the mould
                    was caused by tenant behaviour (not ventilating) rather than building damp
                    issues which are the landlord&apos;s responsibility.
                  </span>
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Claimable Bathroom Damage
                  </h3>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li className="flex items-start gap-2">
                      <Bath className="w-4 h-4 text-cyan-500 mt-0.5 flex-shrink-0" />
                      Cracked toilet, sink, or bath from impact
                    </li>
                    <li className="flex items-start gap-2">
                      <Bath className="w-4 h-4 text-cyan-500 mt-0.5 flex-shrink-0" />
                      Mould from poor ventilation (tenant neglect)
                    </li>
                    <li className="flex items-start gap-2">
                      <Bath className="w-4 h-4 text-cyan-500 mt-0.5 flex-shrink-0" />
                      Damaged taps or shower fixtures
                    </li>
                    <li className="flex items-start gap-2">
                      <Bath className="w-4 h-4 text-cyan-500 mt-0.5 flex-shrink-0" />
                      Broken shower screen or door
                    </li>
                    <li className="flex items-start gap-2">
                      <Bath className="w-4 h-4 text-cyan-500 mt-0.5 flex-shrink-0" />
                      Damaged grout from neglect
                    </li>
                    <li className="flex items-start gap-2">
                      <Bath className="w-4 h-4 text-cyan-500 mt-0.5 flex-shrink-0" />
                      Missing or broken accessories
                    </li>
                    <li className="flex items-start gap-2">
                      <Bath className="w-4 h-4 text-cyan-500 mt-0.5 flex-shrink-0" />
                      Blocked drains from misuse
                    </li>
                  </ul>
                </div>

                <div className="bg-red-50 rounded-xl p-6 border border-red-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    Not Claimable / Difficult to Prove
                  </h3>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li>• Mould from building damp issues</li>
                    <li>• Normal limescale in hard water areas</li>
                    <li>• Sealant deterioration (age-related)</li>
                    <li>• Normal wear on taps and fixtures</li>
                    <li>• Hairline cracks from thermal stress</li>
                    <li>• Grout discolouration from age</li>
                    <li>• Manufacturing defects</li>
                  </ul>
                </div>
              </div>

              {/* Mould evidence section */}
              <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-6 mb-8">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Bath className="w-5 h-5 text-cyan-600" />
                  Proving Mould is Tenant&apos;s Fault
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Mould claims are often disputed. To succeed, you typically need:
                </p>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Check-in photos showing no mould
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Evidence extractor fan was working
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Expert report ruling out damp penetration
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Evidence of tenant behaviour (e.g., drying clothes indoors)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Correspondence warning tenant about ventilation
                  </li>
                </ul>
              </div>

              {/* Ask Heaven callout */}
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">☁️</span>
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">
                      Unsure if your bathroom damage is claimable?
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      Use our free{' '}
                      <Link href="/ask-heaven" className="text-primary font-medium hover:underline">
                        Ask Heaven landlord Q&amp;A tool
                      </Link>{' '}
                      to get guidance on mould, limescale, and fixture damage claims.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Costs Section */}
        <section className="py-12 lg:py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Typical Bathroom Repair Costs
              </h2>

              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-8">
                <table className="w-full">
                  <thead className="border-b bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left font-semibold text-gray-900">Repair Type</th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-900">Typical Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-3 text-gray-600">Professional mould treatment</td>
                      <td className="px-6 py-3 text-gray-900 font-medium">£150 - £400</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-3 text-gray-600">Toilet replacement (supply + fit)</td>
                      <td className="px-6 py-3 text-gray-900 font-medium">£150 - £300</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-3 text-gray-600">Pedestal sink replacement</td>
                      <td className="px-6 py-3 text-gray-900 font-medium">£150 - £350</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-3 text-gray-600">Mixer tap replacement</td>
                      <td className="px-6 py-3 text-gray-900 font-medium">£100 - £250</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-3 text-gray-600">Shower screen replacement</td>
                      <td className="px-6 py-3 text-gray-900 font-medium">£200 - £500</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-3 text-gray-600">Re-grouting bathroom</td>
                      <td className="px-6 py-3 text-gray-900 font-medium">£100 - £250</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-3 text-gray-600">Re-silicone bath/shower</td>
                      <td className="px-6 py-3 text-gray-900 font-medium">£80 - £150</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-3 text-gray-600">Drain unblocking (professional)</td>
                      <td className="px-6 py-3 text-gray-900 font-medium">£80 - £200</td>
                    </tr>
                  </tbody>
                </table>
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
                  <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-4">
                    <Camera className="w-6 h-6 text-cyan-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-3">Photo Evidence</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Check-in bathroom photos</li>
                    <li>• Check-out damage photos</li>
                    <li>• Mould/limescale close-ups</li>
                    <li>• Fixture condition shots</li>
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-4">
                    <ClipboardList className="w-6 h-6 text-cyan-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-3">Documentation</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Check-in/out inventory</li>
                    <li>• Expert damp survey (for mould)</li>
                    <li>• Plumber&apos;s report (for blockages)</li>
                    <li>• Ventilation maintenance records</li>
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-4">
                    <Receipt className="w-6 h-6 text-cyan-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-3">Cost Evidence</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Repair/replacement quotes</li>
                    <li>• Mould treatment quotes</li>
                    <li>• Professional cleaning invoices</li>
                    <li>• Plumber call-out receipts</li>
                  </ul>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Bathroom Damage Evidence Checklist
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Check-in photos (dated, no mould)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Check-out photos showing damage
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Extractor fan working records
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Expert survey (for mould claims)
                    </li>
                  </ul>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Professional repair quotes
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Tenant correspondence re: ventilation
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Letter before action sent
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Tenancy agreement (cleaning obligations)
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
                Start Your Bathroom Damage Claim
              </h2>
              <Link
                href="/wizard?product=money_claim&reason=property_damage&src=seo_bathroom_damage"
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
