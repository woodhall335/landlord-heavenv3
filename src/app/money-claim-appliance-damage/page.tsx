import type { Metadata } from 'next';
import Link from 'next/link';
import { getCanonicalUrl } from '@/lib/seo/urls';
import { StructuredData, faqPageSchema, breadcrumbSchema, articleSchema } from '@/lib/seo/structured-data';
import {
  CheckCircle,
  ArrowRight,
  AlertTriangle,
  Refrigerator,
  FileText,
  Camera,
  ClipboardList,
  Receipt,
} from 'lucide-react';
import { FAQSection } from '@/components/marketing/FAQSection';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { moneyClaimGuides, productLinks } from '@/lib/seo/internal-links';

export const metadata: Metadata = {
  title: 'Claim for Appliance Damage from Tenant 2026 | Kitchen & White Goods',
  description:
    'Recover costs for damaged appliances left by tenants. Washing machines, ovens, fridges, and dishwashers. Evidence requirements and betterment calculations.',
  keywords: [
    'tenant appliance damage',
    'damaged washing machine tenant',
    'broken oven tenant claim',
    'fridge damage deposit',
    'dishwasher damage claim',
    'white goods tenant damage',
    'kitchen appliance claim',
    'appliance replacement cost',
    'tenant broke appliance',
    'landlord appliance repair',
  ],
  openGraph: {
    title: 'Claim for Appliance Damage from Tenant 2026 | Kitchen & White Goods',
    description:
      'Landlord guide to recovering appliance damage costs from tenants through MCOL.',
    type: 'article',
    url: getCanonicalUrl('/money-claim-appliance-damage'),
  },
  alternates: {
    canonical: getCanonicalUrl('/money-claim-appliance-damage'),
  },
};

const faqs = [
  {
    question: 'Can I claim for a broken washing machine from my tenant?',
    answer:
      'Yes, if the damage was caused by tenant misuse, neglect, or deliberate damage rather than normal wear or manufacturer fault. You must prove the appliance worked at check-in and the tenant\'s actions caused the damage. Betterment applies based on appliance age.',
  },
  {
    question: 'What appliance damage can I claim for?',
    answer:
      'Claimable damage includes: broken or damaged components from misuse, burnt-out motors from overloading, cracked or damaged doors/seals, missing or damaged shelves and parts, limescale damage from lack of maintenance, and damage from tenant modifications.',
  },
  {
    question: 'How do I calculate betterment for old appliances?',
    answer:
      'Typical appliance lifespans: washing machines 8-10 years, ovens 10-15 years, fridges 10-12 years, dishwashers 8-10 years. A 6-year-old washing machine with 10-year lifespan has 40% remaining value. Claim = replacement cost × 40%.',
  },
  {
    question: 'The appliance stopped working but there\'s no visible damage - can I claim?',
    answer:
      'Potentially yes, but you need evidence of misuse. Get an engineer\'s report stating the cause (e.g., motor burnt out from overloading, damage from foreign objects). Manufacturing defects or age-related failures are not claimable.',
  },
  {
    question: 'Can I claim for missing appliance parts?',
    answer:
      'Yes, if parts were present at check-in and are now missing. This includes: oven shelves, fridge drawers/shelves, washing machine detergent trays, dishwasher baskets. Document parts in your check-in inventory.',
  },
  {
    question: 'What evidence do I need for appliance claims?',
    answer:
      'Key evidence includes: check-in inventory noting appliance condition, check-out report showing damage, photos or video of damage, engineer\'s report for internal damage, original purchase receipt (for age/value), and repair or replacement quotes.',
  },
  {
    question: 'Can I claim for repair costs instead of replacement?',
    answer:
      'Yes, repair is often more appropriate than replacement, especially for newer appliances. If the appliance can be economically repaired, claim repair costs. If repair costs exceed replacement value, claim proportionate replacement cost.',
  },
  {
    question: 'The tenant says the appliance was already faulty - what now?',
    answer:
      'Your check-in inventory should note the condition and functionality of all appliances. If your inventory confirms the appliance was working, this disputes the tenant\'s claim. Without proper documentation, proving fault becomes difficult.',
  },
  {
    question: 'Can I claim for limescale damage in washing machines?',
    answer:
      'Potentially, if your tenancy agreement requires tenants to maintain appliances (e.g., use descaler regularly). However, this is often considered normal wear in hard water areas. Extreme limescale damage from clear neglect may be claimable.',
  },
  {
    question: 'What about built-in appliances in the kitchen?',
    answer:
      'Same principles apply. Built-in ovens, hobs, extractors, and integrated fridges/dishwashers can be claimed if damaged by tenant misuse or neglect. Get specialist quotes for built-in replacements which may cost more.',
  },
];

export default function MoneyClaimApplianceDamagePage() {
  return (
    <>
      <StructuredData
        data={articleSchema({
          headline: 'Claim for Appliance Damage from Tenant (UK Landlord Guide)',
          description:
            'Complete guide for landlords to recover appliance damage costs from tenants through MCOL.',
          url: getCanonicalUrl('/money-claim-appliance-damage'),
          datePublished: '2026-01-15',
          dateModified: '2026-01-15',
        })}
      />
      <StructuredData data={faqPageSchema(faqs)} />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          { name: 'Money Claim Guide', url: 'https://landlordheaven.co.uk/money-claim-unpaid-rent' },
          { name: 'Appliance Damage', url: 'https://landlordheaven.co.uk/money-claim-appliance-damage' },
        ])}
      />

      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-slate-700/50 text-slate-100 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Refrigerator className="w-4 h-4" />
                Recover appliance costs
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                Claim for Damaged Appliances &amp; White Goods from Tenant
              </h1>

              <p className="text-xl text-slate-100 mb-8 max-w-2xl mx-auto">
                When tenants damage or break washing machines, ovens, fridges, and other
                appliances, recover repair or replacement costs through the courts.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/wizard?product=money_claim&reason=property_damage&src=seo_appliance_damage"
                  className="inline-flex items-center justify-center gap-2 bg-white text-slate-800 font-semibold py-4 px-8 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Start Appliance Damage Claim
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
                What Appliance Damage Can You Claim?
              </h2>

              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-8 rounded-r-lg">
                <p className="text-amber-900 text-sm flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Key distinction:</strong> You can claim for damage from tenant misuse
                    or neglect, but NOT for manufacturing faults, age-related breakdowns, or
                    normal wear from everyday use.
                  </span>
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Claimable Appliance Damage
                  </h3>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li className="flex items-start gap-2">
                      <Refrigerator className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                      Broken doors, handles, or seals from misuse
                    </li>
                    <li className="flex items-start gap-2">
                      <Refrigerator className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                      Burnt-out motors from overloading
                    </li>
                    <li className="flex items-start gap-2">
                      <Refrigerator className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                      Damage from foreign objects (coins in washer)
                    </li>
                    <li className="flex items-start gap-2">
                      <Refrigerator className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                      Missing parts (shelves, trays, baskets)
                    </li>
                    <li className="flex items-start gap-2">
                      <Refrigerator className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                      Cracked glass oven doors from impact
                    </li>
                    <li className="flex items-start gap-2">
                      <Refrigerator className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                      Damaged hob elements from misuse
                    </li>
                    <li className="flex items-start gap-2">
                      <Refrigerator className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                      Freezer damage from forcing ice off
                    </li>
                  </ul>
                </div>

                <div className="bg-red-50 rounded-xl p-6 border border-red-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    Not Claimable
                  </h3>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li>• Manufacturing defects or recalls</li>
                    <li>• Age-related breakdown (end of lifespan)</li>
                    <li>• Normal wear from everyday use</li>
                    <li>• Electrical faults (unless from misuse)</li>
                    <li>• Limescale in hard water areas (typically)</li>
                    <li>• Damage not documented at check-out</li>
                    <li>• Pre-existing issues not noted at check-in</li>
                  </ul>
                </div>
              </div>

              {/* Betterment table */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Appliance Lifespan &amp; Betterment Guide
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left font-semibold text-gray-900">Appliance</th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-900">Typical Lifespan</th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-900">Typical Replacement</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="px-4 py-2 text-gray-600">Washing machine</td>
                        <td className="px-4 py-2 text-gray-900">8-10 years</td>
                        <td className="px-4 py-2 text-gray-900">£250 - £500</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="px-4 py-2 text-gray-600">Fridge/freezer</td>
                        <td className="px-4 py-2 text-gray-900">10-12 years</td>
                        <td className="px-4 py-2 text-gray-900">£200 - £600</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 text-gray-600">Electric oven</td>
                        <td className="px-4 py-2 text-gray-900">10-15 years</td>
                        <td className="px-4 py-2 text-gray-900">£200 - £500</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="px-4 py-2 text-gray-600">Dishwasher</td>
                        <td className="px-4 py-2 text-gray-900">8-10 years</td>
                        <td className="px-4 py-2 text-gray-900">£200 - £400</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 text-gray-600">Electric hob</td>
                        <td className="px-4 py-2 text-gray-900">10-15 years</td>
                        <td className="px-4 py-2 text-gray-900">£150 - £400</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="px-4 py-2 text-gray-600">Microwave</td>
                        <td className="px-4 py-2 text-gray-900">5-8 years</td>
                        <td className="px-4 py-2 text-gray-900">£50 - £200</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-gray-500 mt-4">
                  Betterment example: A 5-year-old washing machine (10-year lifespan) has 50%
                  remaining value. If replacement costs £400, maximum claim = £200.
                </p>
              </div>

              {/* Ask Heaven callout */}
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">☁️</span>
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">
                      Unsure what caused your appliance damage?
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      Use our free{' '}
                      <Link href="/ask-heaven" className="text-primary font-medium hover:underline">
                        Ask Heaven landlord Q&amp;A tool
                      </Link>{' '}
                      to get guidance on tenant liability for appliance damage.
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
                Evidence You Need for Appliance Claims
              </h2>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-4">
                    <Camera className="w-6 h-6 text-slate-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-3">Photo Evidence</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Check-in photos of appliances</li>
                    <li>• Check-out damage photos</li>
                    <li>• Photos of missing parts</li>
                    <li>• Damage close-ups</li>
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-4">
                    <ClipboardList className="w-6 h-6 text-slate-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-3">Documentation</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Check-in inventory (working order)</li>
                    <li>• Original purchase receipts</li>
                    <li>• Engineer&apos;s diagnosis report</li>
                    <li>• Model and age information</li>
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-4">
                    <Receipt className="w-6 h-6 text-slate-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-3">Cost Evidence</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Repair quotes from engineers</li>
                    <li>• Replacement quotes (like-for-like)</li>
                    <li>• Spare parts costs</li>
                    <li>• Betterment calculation</li>
                  </ul>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Appliance Damage Evidence Checklist
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Inventory noting appliances working at check-in
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Check-out report documenting damage
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Photos of damage (before and after)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Original appliance purchase date/receipt
                    </li>
                  </ul>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Engineer&apos;s report on cause of damage
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Repair or replacement quotes
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Betterment calculation document
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Letter before action sent to tenant
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
                Start Your Appliance Damage Claim
              </h2>
              <p className="text-gray-600 mb-8">
                The Money Claim Pack includes all court documents, pre-action letters,
                and guidance for recovering appliance damage costs.
              </p>
              <Link
                href="/wizard?product=money_claim&reason=property_damage&src=seo_appliance_damage"
                className="inline-flex items-center justify-center gap-2 bg-primary text-white font-semibold py-4 px-8 rounded-xl hover:bg-primary/90 transition-colors"
              >
                Start Your Claim — £149.99
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
