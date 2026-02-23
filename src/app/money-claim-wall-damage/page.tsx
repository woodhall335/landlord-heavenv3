import type { Metadata } from 'next';
import Link from 'next/link';
import { getCanonicalUrl } from '@/lib/seo/urls';
import { StructuredData, breadcrumbSchema, articleSchema } from '@/lib/seo/structured-data';
import {
  CheckCircle,
  ArrowRight,
  AlertTriangle,
  LayoutGrid,
  FileText,
  Camera,
  ClipboardList,
  Receipt,
} from 'lucide-react';
import { FAQSection } from '@/components/seo/FAQSection';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { moneyClaimGuides, productLinks } from '@/lib/seo/internal-links';

export const metadata: Metadata = {
  title: 'Claim for Wall & Door Damage from Tenant 2026 | Holes, Dents & Repairs',
  description:
    'Recover costs for holes in walls, damaged doors, broken fixtures, and other structural damage caused by tenants. Evidence guide and claim process.',
  keywords: [
    'tenant wall damage',
    'holes in wall tenant',
    'door damage claim',
    'damaged walls landlord',
    'tenant damage to walls',
    'wall repair costs claim',
    'broken door tenant',
    'fixture damage deposit',
    'wall hole repair claim',
    'tenant structural damage',
  ],
  openGraph: {
    title: 'Claim for Wall & Door Damage from Tenant 2026 | Holes, Dents & Repairs',
    description:
      'Landlord guide to recovering wall and door damage costs from tenants through MCOL.',
    type: 'article',
    url: getCanonicalUrl('/money-claim-wall-damage'),
  },
  alternates: {
    canonical: getCanonicalUrl('/money-claim-wall-damage'),
  },
};

const faqs = [
  {
    question: 'Can I charge my tenant for holes in the walls?',
    answer:
      'Yes, you can claim for holes that are larger than picture hook size or weren\'t there at check-in. This includes: large holes from TV brackets, holes from shelving, punched or kicked holes, and damage around door handles. Small picture hook holes are typically fair wear and tear.',
  },
  {
    question: 'What counts as fair wear and tear for walls?',
    answer:
      'Fair wear and tear includes: small picture hook holes, slight scuff marks at normal height, minor cracks from building settlement, light fading from sunlight, and small marks around light switches. It does NOT include large holes, drawings, deliberate damage, or excessive marks.',
  },
  {
    question: 'Can I claim for a broken internal door?',
    answer:
      'Yes, if the door was damaged by the tenant through misuse, impact, or deliberate damage. Claimable damage includes: holes punched or kicked through, broken hinges from slamming, cracked or split panels, and removed or damaged locks. Normal hinge wear is not claimable.',
  },
  {
    question: 'How much can I claim for wall repairs?',
    answer:
      'Typical costs include: filling and painting a small hole £30-50, larger hole repair £50-100, full wall replastering £150-400, door replacement £100-300 plus hanging. Get professional quotes for your specific damage.',
  },
  {
    question: 'Can I claim if I need to repaint the whole room?',
    answer:
      'You can only claim for repainting if it\'s necessary due to tenant damage (not general wear) AND you account for when the room was last painted. A room painted 5 years ago can\'t claim full repainting costs - apply betterment.',
  },
  {
    question: 'What about screw holes from shelving or TV mounts?',
    answer:
      'If tenants had permission to put up shelves, small screw holes may be fair wear. Large holes from heavy-duty brackets, or holes made without permission, are claimable. Your tenancy agreement should cover this.',
  },
  {
    question: 'Can I claim for damaged skirting boards or architraves?',
    answer:
      'Yes, if the damage is beyond fair wear. Claimable damage includes: chunks missing, heavy scratches or gouges, water damage from tenant neglect, and removed sections. Normal scuffs at floor level are typically fair wear.',
  },
  {
    question: 'How do I prove wall damage was caused by the tenant?',
    answer:
      'Key evidence: dated check-in photos showing wall condition, check-out photos showing damage, inventory reports, and any correspondence about damage during tenancy. Video walkthroughs are particularly effective for wall damage.',
  },
  {
    question: 'The tenant says they\'ll fix the damage themselves - should I agree?',
    answer:
      'Be cautious. DIY repairs may not be to professional standard. Consider getting a professional quote first. If you agree to tenant repair, inspect thoroughly before returning the deposit and reserve the right to professional correction.',
  },
  {
    question: 'Can I claim for damaged fixtures like curtain rails or blinds?',
    answer:
      'Yes, if fixtures were present at check-in and are now damaged or missing. This includes: curtain poles pulled from walls, broken blind mechanisms, damaged picture rails, and removed light fittings. Document all fixtures in your inventory.',
  },
];

export default function MoneyClaimWallDamagePage() {
  return (
    <>
      <StructuredData
        data={articleSchema({
          headline: 'Claim for Wall & Door Damage from Tenant (UK Landlord Guide)',
          description:
            'Complete guide for landlords to recover wall and door damage costs from tenants through MCOL.',
          url: getCanonicalUrl('/money-claim-wall-damage'),
          datePublished: '2026-01-15',
          dateModified: '2026-01-15',
        })}
      />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          { name: 'Money Claim Guide', url: 'https://landlordheaven.co.uk/money-claim-unpaid-rent' },
          { name: 'Wall & Door Damage', url: 'https://landlordheaven.co.uk/money-claim-wall-damage' },
        ])}
      />

      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-rose-900 to-rose-800 text-white py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-rose-700/50 text-rose-100 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <LayoutGrid className="w-4 h-4" />
                Recover repair costs
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                Claim for Wall &amp; Door Damage from Tenant
              </h1>

              <p className="text-xl text-rose-100 mb-8 max-w-2xl mx-auto">
                When tenants leave holes in walls, damaged doors, or broken fixtures,
                recover professional repair costs through the courts.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/wizard?product=money_claim&reason=property_damage&src=seo_wall_damage"
                  className="inline-flex items-center justify-center gap-2 bg-white text-rose-800 font-semibold py-4 px-8 rounded-xl hover:bg-rose-50 transition-colors"
                >
                  Start Wall Damage Claim
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
                What Wall &amp; Door Damage Can You Claim?
              </h2>

              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-8 rounded-r-lg">
                <p className="text-amber-900 text-sm flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Picture hook rule:</strong> Small picture hook holes are generally
                    accepted as fair wear and tear in most tenancies. Check your AST for
                    specific clauses about wall fixings.
                  </span>
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Claimable Damage
                  </h3>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li className="flex items-start gap-2">
                      <LayoutGrid className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
                      Large holes from TV mounts or shelving
                    </li>
                    <li className="flex items-start gap-2">
                      <LayoutGrid className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
                      Punched or kicked holes in walls/doors
                    </li>
                    <li className="flex items-start gap-2">
                      <LayoutGrid className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
                      Cracked or split door panels
                    </li>
                    <li className="flex items-start gap-2">
                      <LayoutGrid className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
                      Broken door hinges from slamming
                    </li>
                    <li className="flex items-start gap-2">
                      <LayoutGrid className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
                      Crayon, pen, or paint marks
                    </li>
                    <li className="flex items-start gap-2">
                      <LayoutGrid className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
                      Damaged skirting or architraves
                    </li>
                    <li className="flex items-start gap-2">
                      <LayoutGrid className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
                      Removed fixtures without permission
                    </li>
                  </ul>
                </div>

                <div className="bg-red-50 rounded-xl p-6 border border-red-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    Fair Wear &amp; Tear (Not Claimable)
                  </h3>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li>• Small picture hook holes (typically 1-2 per wall)</li>
                    <li>• Slight scuff marks at normal height</li>
                    <li>• Minor marks around light switches</li>
                    <li>• Small cracks from building settlement</li>
                    <li>• Light fading from sunlight</li>
                    <li>• Door hinge wear from normal use</li>
                    <li>• Normal key/handle marks around locks</li>
                  </ul>
                </div>
              </div>

              {/* Ask Heaven callout */}
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">☁️</span>
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">
                      Not sure if your wall damage is claimable?
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      Use our free{' '}
                      <Link href="/ask-heaven" className="text-primary font-medium hover:underline">
                        Ask Heaven landlord Q&amp;A tool
                      </Link>{' '}
                      to get instant guidance on fair wear vs tenant damage.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Typical Costs Section */}
        <section className="py-12 lg:py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Typical Repair Costs
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
                      <td className="px-6 py-3 text-gray-600">Small hole fill + paint (per hole)</td>
                      <td className="px-6 py-3 text-gray-900 font-medium">£30 - £50</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-3 text-gray-600">Large hole repair + match paint</td>
                      <td className="px-6 py-3 text-gray-900 font-medium">£50 - £100</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-3 text-gray-600">Internal door replacement</td>
                      <td className="px-6 py-3 text-gray-900 font-medium">£100 - £250</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-3 text-gray-600">Door hanging (labour only)</td>
                      <td className="px-6 py-3 text-gray-900 font-medium">£50 - £100</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-3 text-gray-600">Plaster repair (per sqm)</td>
                      <td className="px-6 py-3 text-gray-900 font-medium">£40 - £80</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-3 text-gray-600">Full room repaint (avg room)</td>
                      <td className="px-6 py-3 text-gray-900 font-medium">£200 - £400</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-3 text-gray-600">Skirting board repair (per metre)</td>
                      <td className="px-6 py-3 text-gray-900 font-medium">£15 - £30</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-3 text-gray-600">Door lock replacement</td>
                      <td className="px-6 py-3 text-gray-900 font-medium">£50 - £120</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-rose-50 border border-rose-200 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-2">
                  Betterment Note
                </h3>
                <p className="text-gray-600 text-sm">
                  If claiming for full room repainting, you must account for when the room was
                  last painted. Example: Room painted 3 years ago with expected 7-year life
                  = 57% remaining value. Maximum claim = total cost × 57%.
                </p>
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
                  <div className="w-12 h-12 bg-rose-100 rounded-lg flex items-center justify-center mb-4">
                    <Camera className="w-6 h-6 text-rose-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-3">Photo Evidence</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Check-in wall/door photos</li>
                    <li>• Check-out damage photos</li>
                    <li>• Close-ups with ruler for scale</li>
                    <li>• Location context shots</li>
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="w-12 h-12 bg-rose-100 rounded-lg flex items-center justify-center mb-4">
                    <ClipboardList className="w-6 h-6 text-rose-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-3">Documentation</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Check-in/out inventory reports</li>
                    <li>• Tenancy agreement (fixing clauses)</li>
                    <li>• Last decoration dates</li>
                    <li>• Correspondence about damage</li>
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="w-12 h-12 bg-rose-100 rounded-lg flex items-center justify-center mb-4">
                    <Receipt className="w-6 h-6 text-rose-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-3">Cost Evidence</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Decorator/handyman quotes</li>
                    <li>• Material costs</li>
                    <li>• Door replacement quotes</li>
                    <li>• Betterment calculations</li>
                  </ul>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Wall &amp; Door Damage Evidence Checklist
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Dated check-in photos of walls/doors
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Check-out photos showing damage
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Signed inventory reports
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Tenancy agreement with fixing terms
                    </li>
                  </ul>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Professional repair quotes (2-3)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Last decoration date evidence
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Letter before action sent
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Betterment calculation document
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
                Start Your Wall &amp; Door Damage Claim
              </h2>
              <p className="text-gray-600 mb-8">
                The Money Claim Pack includes all court documents, pre-action letters,
                and guidance for recovering repair costs.
              </p>
              <Link
                href="/wizard?product=money_claim&reason=property_damage&src=seo_wall_damage"
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
                  moneyClaimGuides.carpetDamage,
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
