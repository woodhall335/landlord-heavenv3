import type { Metadata } from 'next';
import Link from 'next/link';
import { getCanonicalUrl } from '@/lib/seo/urls';
import { StructuredData, faqPageSchema, breadcrumbSchema, articleSchema } from '@/lib/seo/structured-data';
import {
  CheckCircle,
  ArrowRight,
  AlertTriangle,
  Camera,
  FileText,
  PoundSterling,
  Home,
  ClipboardList,
  Receipt,
} from 'lucide-react';
import { FAQSection } from '@/components/seo/FAQSection';
import { NextLegalSteps } from '@/components/seo/NextLegalSteps';
import { productLinks, toolLinks } from '@/lib/seo/internal-links';

export const metadata: Metadata = {
  title: 'Claim for Property Damage from Tenant 2026 | Landlord Guide',
  description:
    'Recover costs for property damage from tenants. How to document damage, calculate claims, and use the courts to recover repair costs.',
  keywords: [
    'tenant property damage claim',
    'landlord damage claim',
    'recover repair costs tenant',
    'tenant damage deposit',
    'property damage money claim',
    'landlord damage evidence',
    'tenant caused damage',
    'repair costs recovery',
    'MCOL property damage',
    'tenant damage court claim',
  ],
  openGraph: {
    title: 'Claim for Property Damage from Tenant 2026 | Landlord Guide',
    description:
      'Landlord guide to recovering property damage costs from tenants through the courts in England, Wales, and Scotland.',
    type: 'article',
    url: getCanonicalUrl('/money-claim-property-damage'),
  },
  alternates: {
    canonical: getCanonicalUrl('/money-claim-property-damage'),
  },
};

const faqs = [
  {
    question: 'Can I claim for property damage beyond the deposit?',
    answer:
      'Yes. If the cost of repairs exceeds the tenant\'s deposit, you can make a court claim for the difference. You\'ll need evidence of the damage, quotes or invoices for repairs, and proof that the damage was caused by the tenant (not fair wear and tear).',
  },
  {
    question: 'What counts as tenant damage vs fair wear and tear?',
    answer:
      'Fair wear and tear includes normal deterioration from everyday use - faded paint, worn carpets in high-traffic areas, small scuffs. Tenant damage includes holes in walls, broken fixtures, burns, stains, missing items, and damage from neglect. Document the condition at check-in and check-out to establish the difference.',
  },
  {
    question: 'How do I prove the tenant caused the damage?',
    answer:
      'Key evidence includes: detailed inventory with photos at check-in, check-out inspection report with photos showing damage, quotes or invoices for repairs, correspondence with tenant about damage, witness statements if applicable. The check-in inventory is crucial for proving the property\'s original condition.',
  },
  {
    question: 'What if I didn\'t do a proper check-in inventory?',
    answer:
      'Without a check-in inventory, proving tenant damage is harder but not impossible. Use any photos you have from viewings or the start of tenancy, testimonials from previous good condition, invoices showing recent refurbishment before tenancy, and the tenant\'s own admissions if any.',
  },
  {
    question: 'Should I use the deposit scheme or go to court?',
    answer:
      'If the damage is covered by the deposit, use the deposit scheme\'s dispute resolution first - it\'s free. Only go to court if: the damage exceeds the deposit, the tenant disputes the deposit claim and you need a binding judgment, or you need to recover additional costs the deposit doesn\'t cover.',
  },
  {
    question: 'How much can I claim for repairs?',
    answer:
      'You can claim the actual cost to restore the property to its pre-tenancy condition, accounting for betterment (if new items replace old). Courts expect reasonable quotes - get 2-3 estimates. You cannot profit from damage claims; you can only recover your actual loss.',
  },
  {
    question: 'Can I claim for damage discovered after the tenant left?',
    answer:
      'Yes, but the sooner you document and report it, the better. Conduct a thorough check-out inspection within days of vacancy. If you discover hidden damage later (e.g., behind furniture), document it immediately with photos and dates.',
  },
  {
    question: 'What about damage to fixtures and fittings?',
    answer:
      'You can claim for damaged fixtures if they were in good condition at check-in and the tenant\'s actions caused the damage. This includes bathroom fittings, kitchen units, doors, windows, and built-in appliances. Get repair or replacement quotes.',
  },
  {
    question: 'Can I claim for loss of rental income during repairs?',
    answer:
      'Potentially yes, if the property was uninhabitable during necessary repairs. You\'ll need to prove the repairs were urgent, the time taken was reasonable, and you couldn\'t rent the property. Courts may award consequential losses in clear cases.',
  },
  {
    question: 'How long do I have to make a damage claim?',
    answer:
      'In England and Wales, you generally have 6 years to bring a contract claim (the tenancy agreement). However, acting promptly strengthens your case. Start the claims process soon after the tenancy ends while evidence is fresh.',
  },
];

export default function MoneyClaimPropertyDamagePage() {
  return (
    <>
      <StructuredData
        data={articleSchema({
          headline: 'Claim for Property Damage from Tenant (UK Landlord Guide)',
          description:
            'Complete guide for landlords to recover property damage costs from tenants through MCOL (England & Wales) and Simple Procedure (Scotland).',
          url: getCanonicalUrl('/money-claim-property-damage'),
          datePublished: '2026-01-01',
          dateModified: '2026-01-01',
        })}
      />
      <StructuredData data={faqPageSchema(faqs)} />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          { name: 'Claim Property Damage', url: 'https://landlordheaven.co.uk/money-claim-property-damage' },
        ])}
      />

      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-orange-900 to-orange-800 text-white py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-orange-700/50 text-orange-100 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Home className="w-4 h-4" />
                Recover repair costs
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                Claim for Property Damage from Tenant
              </h1>

              <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
                When <Link href="/tenant-damaging-property" className="text-white hover:underline font-semibold">tenant damage</Link> exceeds the deposit, recover your repair costs
                through the courts. Document properly, claim correctly, get paid.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/wizard?product=money_claim&reason=property_damage&src=seo_damage"
                  className="inline-flex items-center justify-center gap-2 bg-white text-orange-800 font-semibold py-4 px-8 rounded-xl hover:bg-orange-50 transition-colors"
                >
                  Start Property Damage Claim
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
              <p className="mt-4 text-sm text-orange-200">
                Money Claim Pack available for England only
              </p>
            </div>
          </div>
        </section>

        {/* When to Claim Section */}
        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                When Can You Claim for Property Damage?
              </h2>

              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-8 rounded-r-lg">
                <p className="text-amber-900 text-sm flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Important:</strong> Always try the deposit scheme dispute process
                    first if the damage is within the deposit amount. Court claims should be
                    for amounts exceeding the deposit or where you need a binding judgment.
                  </span>
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    You CAN claim for:
                  </h3>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li>• Holes, dents, or marks in walls beyond wear and tear</li>
                    <li>• Broken or damaged fixtures (doors, windows, fittings)</li>
                    <li>• Stained, burned, or torn carpets and flooring</li>
                    <li>• Damaged or missing appliances/furniture</li>
                    <li>• Garden damage or neglect requiring restoration</li>
                    <li>• Damage from pets (if not permitted)</li>
                    <li>• Mould damage from tenant neglect</li>
                  </ul>
                </div>

                <div className="bg-red-50 rounded-xl p-6 border border-red-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    You CANNOT claim for:
                  </h3>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li>• Fair wear and tear (normal use deterioration)</li>
                    <li>• Pre-existing damage not documented at check-in</li>
                    <li>• Improvements over original condition (betterment)</li>
                    <li>• Items at end of natural lifespan anyway</li>
                    <li>• Your own maintenance failures</li>
                    <li>• Damage covered by your landlord insurance</li>
                  </ul>
                </div>
              </div>

              {/* Ask Heaven callout */}
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-8">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">☁️</span>
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">
                      Not sure if your damage is claimable?
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      Use our free{' '}
                      <Link href="/ask-heaven" className="text-primary font-medium hover:underline">
                        Ask Heaven landlord Q&amp;A tool
                      </Link>{' '}
                      to get instant guidance on fair wear and tear vs tenant damage.
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
                Evidence You Need for a Damage Claim
              </h2>

              <p className="text-gray-600 mb-8">
                Strong evidence is essential. Courts and deposit schemes require proof that
                the damage exists, was caused by the tenant, and that your claimed costs
                are reasonable.
              </p>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                    <Camera className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-3">Photographic Evidence</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Check-in photos (original condition)</li>
                    <li>• Check-out photos (damaged condition)</li>
                    <li>• Date-stamped comparison shots</li>
                    <li>• Close-ups of specific damage</li>
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                    <ClipboardList className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-3">Inventory Reports</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Signed check-in inventory</li>
                    <li>• Professional check-out report</li>
                    <li>• Condition comparison schedule</li>
                    <li>• Tenant acknowledgment (if any)</li>
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                    <Receipt className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-3">Cost Evidence</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Repair quotes (2-3 recommended)</li>
                    <li>• Contractor invoices</li>
                    <li>• Receipts for materials</li>
                    <li>• Replacement cost evidence</li>
                  </ul>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Evidence Checklist for Property Damage Claims
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Signed tenancy agreement
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Check-in inventory with photos
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Check-out report with photos
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Schedule of damage claimed
                    </li>
                  </ul>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Repair quotes or invoices
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Letter before action sent
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Any tenant correspondence
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Deposit scheme decision (if relevant)
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="py-12 lg:py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                How to Make a Property Damage Claim
              </h2>

              <div className="space-y-4 mb-8">
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                      1
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">Document the Damage</h3>
                      <p className="text-gray-600 text-sm">
                        Take detailed photos and video at check-out. Create a written schedule
                        listing each item of damage with description, location, and estimated cost.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                      2
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">Get Repair Quotes</h3>
                      <p className="text-gray-600 text-sm">
                        Obtain 2-3 written quotes from contractors. Keep all invoices for work
                        already completed. Courts expect reasonable, not inflated, costs.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                      3
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">Send Letter Before Action</h3>
                      <p className="text-gray-600 text-sm">
                        Write to the tenant demanding payment within 14-30 days. Include the
                        schedule of damage, total claimed, and evidence summaries. This is
                        required before court action.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                      4
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">Make Court Claim</h3>
                      <p className="text-gray-600 text-sm">
                        If unpaid, submit your claim via MCOL (England & Wales) or Simple
                        Procedure (Scotland). Include your evidence bundle with the claim.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                      5
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">Judgment & Enforcement</h3>
                      <p className="text-gray-600 text-sm">
                        If the tenant doesn&apos;t respond, get default judgment. If they defend,
                        attend the hearing with your evidence. Use enforcement if needed.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-orange-50 rounded-xl border border-orange-200">
                <h4 className="font-bold text-gray-900 mb-3">Ready to Claim for Property Damage?</h4>
                <p className="text-gray-600 text-sm mb-4">
                  Our Money Claim Pack includes letter before action templates, schedule of
                  damages builder, court form guidance, and step-by-step instructions for
                  property damage claims.
                </p>
                <Link
                  href="/wizard?product=money_claim&reason=property_damage&src=seo_damage"
                  className="inline-flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700"
                >
                  <FileText className="w-4 h-4" />
                  Start Property Damage Claim
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Calculating Damage Section */}
        <section className="py-12 lg:py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Calculating Your Damage Claim
              </h2>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-4">
                    <PoundSterling className="w-5 h-5 inline mr-2 text-orange-600" />
                    What You Can Include
                  </h3>
                  <ul className="space-y-2 text-gray-600 text-sm">
                    <li>• Cost of repairs (quotes/invoices)</li>
                    <li>• Replacement cost less depreciation</li>
                    <li>• Professional cleaning if excessive</li>
                    <li>• Re-decoration if damaged beyond wear</li>
                    <li>• Statutory interest (8% from date due)</li>
                    <li>• Court fees (if you win)</li>
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-4">
                    <AlertTriangle className="w-5 h-5 inline mr-2 text-amber-600" />
                    Betterment Rules
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    You can&apos;t profit from damage. If replacing old with new, deduct for
                    improvement:
                  </p>
                  <ul className="space-y-2 text-gray-600 text-sm">
                    <li>• 10-year carpet replaced? Claim partial cost</li>
                    <li>• Old appliance upgraded? Deduct improvement</li>
                    <li>• Document original age and condition</li>
                  </ul>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                <h4 className="font-bold text-amber-900 mb-2">Example Damage Calculation</h4>
                <p className="text-amber-800 text-sm mb-4">
                  5-year-old carpet (expected 10-year lifespan) needs replacing due to burns and stains.
                  New carpet cost: £800. Remaining life was 50%, so claim £400 (not £800).
                </p>
                <p className="text-amber-800 text-sm">
                  Courts appreciate honest, fair calculations. Inflated claims damage credibility.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-br from-orange-700 to-orange-600 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">
                Ready to Claim for Property Damage?
              </h2>
              <p className="text-xl text-orange-100 mb-8">
                Our Money Claim Pack (England only) walks you through documenting damage, calculating
                costs, sending the letter before action, and making your court claim.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/wizard?product=money_claim&reason=property_damage&src=seo_damage"
                  className="inline-flex items-center justify-center gap-2 bg-white text-orange-700 font-semibold py-4 px-8 rounded-xl hover:bg-orange-50 transition-colors"
                >
                  Start Property Damage Claim
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/products/money-claim"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold py-4 px-8 rounded-xl transition-colors border border-white/30"
                >
                  <FileText className="w-5 h-5" />
                  View Full Pack Details
                </Link>
              </div>
              <p className="mt-4 text-sm text-orange-200">
                Pack available for England only
              </p>
            </div>
          </div>
        </section>

        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <NextLegalSteps
                jurisdictionLabel="UK property damage claims"
                scenarioLabel="recovering repair costs from tenants"
                primaryCTA={{
                  label: 'Start property damage claim',
                  href: '/wizard?product=money_claim&reason=property_damage&src=seo_damage',
                }}
                secondaryCTA={{
                  label: 'View Money Claim Pack',
                  href: productLinks.moneyClaim.href,
                }}
                relatedLinks={[
                  {
                    href: '/money-claim-unpaid-rent',
                    title: 'Claim unpaid rent',
                    description: 'Recover rent arrears through the courts.',
                  },
                  {
                    href: '/money-claim-cleaning-costs',
                    title: 'Claim cleaning costs',
                    description: 'Recover excessive cleaning and rubbish removal costs.',
                  },
                  {
                    href: toolLinks.rentArrearsCalculator.href,
                    title: toolLinks.rentArrearsCalculator.title,
                    description: 'Calculate total owed including interest.',
                  },
                  {
                    href: '/ask-heaven',
                    title: 'Ask Heaven',
                    description: 'Get instant answers to landlord legal questions.',
                  },
                ]}
              />
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <FAQSection
          title="Property Damage Claims: Frequently Asked Questions"
          faqs={faqs}
          showContactCTA={false}
          variant="white"
        />
      </main>
    </>
  );
}
