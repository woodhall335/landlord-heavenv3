import type { Metadata } from 'next';
import Link from 'next/link';
import { getCanonicalUrl } from '@/lib/seo/urls';
import { StructuredData, breadcrumbSchema, articleSchema } from '@/lib/seo/structured-data';
import {
  CheckCircle,
  ArrowRight,
  AlertTriangle,
  Sparkles,
  FileText,
  PoundSterling,
  Trash2,
  ClipboardList,
  Receipt,
} from 'lucide-react';
import { FAQSection } from '@/components/seo/FAQSection';
import { NextLegalSteps } from '@/components/seo/NextLegalSteps';
import { productLinks, toolLinks } from '@/lib/seo/internal-links';
import { cleaningCostsFAQs } from '@/data/faqs';

export const metadata: Metadata = {
  title: 'Claim Cleaning Costs from Tenant 2026 | End of Tenancy Claims',
  description:
    'Recover cleaning and rubbish removal costs from tenants. What qualifies as claimable and how to make a successful court claim.',
  keywords: [
    'tenant cleaning costs',
    'end of tenancy cleaning claim',
    'landlord cleaning costs',
    'rubbish removal tenant',
    'professional cleaning claim',
    'tenant left mess',
    'cleaning deposit claim',
    'MCOL cleaning costs',
    'deep clean tenant',
    'cleaning fee recovery',
  ],
  openGraph: {
    title: 'Claim Cleaning Costs from Tenant 2026 | End of Tenancy Claims',
    description:
      'Landlord guide to recovering excessive cleaning and rubbish removal costs from tenants through the courts.',
    type: 'article',
    url: getCanonicalUrl('/money-claim-cleaning-costs'),
  },
  alternates: {
    canonical: getCanonicalUrl('/money-claim-cleaning-costs'),
  },
};

export default function MoneyClaimCleaningCostsPage() {
  return (
    <>
      <StructuredData
        data={articleSchema({
          headline: 'Claim Cleaning Costs from Tenant (UK Landlord Guide)',
          description:
            'Complete guide for landlords to recover excessive cleaning and rubbish removal costs from tenants through the courts.',
          url: getCanonicalUrl('/money-claim-cleaning-costs'),
          datePublished: '2026-01-01',
          dateModified: '2026-01-01',
        })}
      />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          { name: 'Claim Cleaning Costs', url: 'https://landlordheaven.co.uk/money-claim-cleaning-costs' },
        ])}
      />

      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-teal-900 to-teal-800 text-white py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-teal-700/50 text-teal-100 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                Recover cleaning costs
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                Claim Cleaning &amp; Rubbish Removal Costs from Tenant
              </h1>

              <p className="text-xl text-teal-100 mb-8 max-w-2xl mx-auto">
                When tenants leave your property in an unacceptable state, recover
                the cost of professional cleaning and waste removal through the courts.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/wizard?product=money_claim&reason=cleaning&src=seo_cleaning"
                  className="inline-flex items-center justify-center gap-2 bg-white text-teal-800 font-semibold py-4 px-8 rounded-xl hover:bg-teal-50 transition-colors"
                >
                  Start Cleaning Costs Claim
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
                What Cleaning Costs Can You Claim?
              </h2>

              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-8 rounded-r-lg">
                <p className="text-amber-900 text-sm flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Key principle:</strong> You can only claim cleaning costs to restore
                    the property to its check-in condition, not to make it cleaner than when the
                    tenancy started. Compare check-in and check-out evidence.
                  </span>
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Claimable Cleaning Costs
                  </h3>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-teal-500 mt-0.5 flex-shrink-0" />
                      Professional deep clean of filthy property
                    </li>
                    <li className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-teal-500 mt-0.5 flex-shrink-0" />
                      Oven cleaning (burnt-on grease/food)
                    </li>
                    <li className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-teal-500 mt-0.5 flex-shrink-0" />
                      Carpet cleaning for stains/odors
                    </li>
                    <li className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-teal-500 mt-0.5 flex-shrink-0" />
                      Limescale removal in bathrooms
                    </li>
                    <li className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-teal-500 mt-0.5 flex-shrink-0" />
                      Mould treatment from tenant neglect
                    </li>
                    <li className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-teal-500 mt-0.5 flex-shrink-0" />
                      Pet odor/stain removal
                    </li>
                    <li className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-teal-500 mt-0.5 flex-shrink-0" />
                      Garden clearance and waste removal
                    </li>
                  </ul>
                </div>

                <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Trash2 className="w-5 h-5 text-green-600" />
                    Claimable Rubbish Removal
                  </h3>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      Skip hire for large amounts of waste
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      Council bulky waste collection
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      House clearance services
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      Abandoned furniture removal
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      Hazardous waste disposal (if applicable)
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      Multiple tip runs (mileage + time)
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      Garden waste removal
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-red-50 rounded-xl p-6 border border-red-200 mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  What You Cannot Claim
                </h3>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>• Routine between-tenancy cleaning (normal turnover)</li>
                  <li>• Cleaning to a higher standard than at check-in</li>
                  <li>• Normal dust accumulation during the tenancy</li>
                  <li>• Cleaning if no check-in inventory exists to prove original standard</li>
                  <li>• Items you would clean anyway regardless of tenant</li>
                </ul>
              </div>

              {/* Ask Heaven callout */}
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">☁️</span>
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">
                      Unsure if your cleaning costs are claimable?
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      Use our free{' '}
                      <Link href="/ask-heaven" className="text-primary font-medium hover:underline">
                        Ask Heaven landlord Q&amp;A tool
                      </Link>{' '}
                      to get instant guidance on what qualifies as excessive cleaning.
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
                Evidence You Need for Cleaning Claims
              </h2>

              <p className="text-gray-600 mb-8">
                Cleaning claims succeed or fail on evidence. You must prove the property
                was clean at check-in and dirty at check-out - without both, courts may
                reject your claim.
              </p>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                    <ClipboardList className="w-6 h-6 text-teal-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-3">Check-In Evidence</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Inventory stating &quot;professionally cleaned&quot;</li>
                    <li>• Photos of clean condition</li>
                    <li>• Receipt from check-in clean</li>
                    <li>• Tenant signed acknowledgment</li>
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                    <Trash2 className="w-6 h-6 text-teal-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-3">Check-Out Evidence</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Photos showing mess/dirt</li>
                    <li>• Video walkthrough</li>
                    <li>• Check-out report detailing issues</li>
                    <li>• Photos of rubbish left behind</li>
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                    <Receipt className="w-6 h-6 text-teal-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-3">Cost Evidence</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Professional cleaning invoice</li>
                    <li>• Skip hire receipt</li>
                    <li>• Waste collection receipts</li>
                    <li>• Itemised breakdown of costs</li>
                  </ul>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Cleaning Claim Evidence Checklist
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Check-in inventory (stating clean condition)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Check-in photos showing clean property
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Check-out photos showing mess/dirt
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Professional cleaning quote/invoice
                    </li>
                  </ul>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Skip/waste removal receipts
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Letter before action sent
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Schedule itemising each cleaning cost
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Photos of any rubbish/items left
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Typical Costs Section */}
        <section className="py-12 lg:py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Typical Cleaning & Rubbish Removal Costs
              </h2>

              <p className="text-gray-600 mb-8">
                Courts expect reasonable costs. Here are typical professional rates to help
                you assess whether your quotes are in line with market rates.
              </p>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="bg-teal-100 px-6 py-4 border-b">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-teal-600" />
                      Professional Cleaning Costs
                    </h3>
                  </div>
                  <div className="p-6">
                    <ul className="space-y-3 text-gray-600">
                      <li className="flex justify-between">
                        <span>1-bed flat deep clean</span>
                        <span className="font-medium">£150-200</span>
                      </li>
                      <li className="flex justify-between">
                        <span>2-bed flat/house deep clean</span>
                        <span className="font-medium">£200-280</span>
                      </li>
                      <li className="flex justify-between">
                        <span>3-bed house deep clean</span>
                        <span className="font-medium">£280-400</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Oven clean (standalone)</span>
                        <span className="font-medium">£40-80</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Carpet clean per room</span>
                        <span className="font-medium">£25-50</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="bg-teal-100 px-6 py-4 border-b">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                      <Trash2 className="w-5 h-5 text-teal-600" />
                      Rubbish Removal Costs
                    </h3>
                  </div>
                  <div className="p-6">
                    <ul className="space-y-3 text-gray-600">
                      <li className="flex justify-between">
                        <span>Mini skip (2-3 cubic yards)</span>
                        <span className="font-medium">£150-200</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Standard skip (6-8 yards)</span>
                        <span className="font-medium">£250-350</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Council bulky waste (3 items)</span>
                        <span className="font-medium">£30-50</span>
                      </li>
                      <li className="flex justify-between">
                        <span>House clearance service</span>
                        <span className="font-medium">£300-800</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Garden clearance</span>
                        <span className="font-medium">£150-400</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                <h4 className="font-bold text-amber-900 mb-2">
                  <PoundSterling className="w-5 h-5 inline mr-2" />
                  Getting the Best Evidence for Costs
                </h4>
                <p className="text-amber-800 text-sm">
                  Get 2-3 quotes to show courts your chosen contractor is reasonably priced.
                  Itemised invoices are stronger than lump sum quotes. If your costs seem
                  high, be prepared to explain why (e.g., hazardous waste, large property).
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="py-12 lg:py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                How to Make a Cleaning Costs Claim
              </h2>

              <div className="space-y-4 mb-8">
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                      1
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">Document at Check-Out</h3>
                      <p className="text-gray-600 text-sm">
                        Take comprehensive photos and video of every room showing the dirty
                        condition. Note specific areas: oven, bathrooms, carpets, garden.
                        Photograph any rubbish or abandoned items.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                      2
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">Get Cleaning Quotes</h3>
                      <p className="text-gray-600 text-sm">
                        Obtain itemised quotes from professional cleaners. If you&apos;ve already
                        had cleaning done, keep the invoice. Get skip hire or waste removal
                        quotes for any rubbish left behind.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                      3
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">Send Letter Before Action</h3>
                      <p className="text-gray-600 text-sm">
                        Write to the tenant with an itemised schedule of cleaning costs,
                        attaching evidence. Give them 14-30 days to pay. This step is
                        required before court proceedings.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                      4
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">Make Your Court Claim</h3>
                      <p className="text-gray-600 text-sm">
                        If the tenant doesn&apos;t pay, submit your claim via MCOL (England & Wales)
                        or Simple Procedure (Scotland). Include your full evidence bundle showing
                        check-in vs check-out condition.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-teal-50 rounded-xl border border-teal-200">
                <h4 className="font-bold text-gray-900 mb-3">Ready to Claim Cleaning Costs?</h4>
                <p className="text-gray-600 text-sm mb-4">
                  Our Money Claim Pack includes letter before action templates, schedule of
                  costs builder, and step-by-step guidance for cleaning and rubbish removal claims.
                </p>
                <Link
                  href="/wizard?product=money_claim&reason=cleaning&src=seo_cleaning"
                  className="inline-flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700"
                >
                  <FileText className="w-4 h-4" />
                  Start Cleaning Costs Claim
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-br from-teal-700 to-teal-600 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">
                Ready to Recover Your Cleaning Costs?
              </h2>
              <p className="text-xl text-teal-100 mb-8">
                Our Money Claim Pack walks you through documenting the mess, calculating
                costs, sending the letter before action, and making your court claim.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/wizard?product=money_claim&reason=cleaning&src=seo_cleaning"
                  className="inline-flex items-center justify-center gap-2 bg-white text-teal-700 font-semibold py-4 px-8 rounded-xl hover:bg-teal-50 transition-colors"
                >
                  Start Cleaning Costs Claim
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
            </div>
          </div>
        </section>

        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <NextLegalSteps
                jurisdictionLabel="UK cleaning cost claims"
                scenarioLabel="recovering cleaning and rubbish removal costs"
                primaryCTA={{
                  label: 'Start cleaning costs claim',
                  href: '/wizard?product=money_claim&reason=cleaning&src=seo_cleaning',
                }}
                secondaryCTA={{
                  label: 'View Money Claim Pack',
                  href: productLinks.moneyClaim.href,
                }}
                relatedLinks={[
                  {
                    href: '/money-claim-property-damage',
                    title: 'Claim property damage',
                    description: 'Recover repair costs for tenant damage.',
                  },
                  {
                    href: '/money-claim-unpaid-rent',
                    title: 'Claim unpaid rent',
                    description: 'Recover rent arrears through the courts.',
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
          title="Cleaning Costs Claims: Frequently Asked Questions"
          faqs={cleaningCostsFAQs}
          showContactCTA={false}
          variant="white"
        />
      </main>
    </>
  );
}
