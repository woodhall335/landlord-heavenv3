import type { Metadata } from 'next';
import Link from 'next/link';
import { getCanonicalUrl } from '@/lib/seo/urls';
import { StructuredData, breadcrumbSchema, articleSchema } from '@/lib/seo/structured-data';
import {
  CheckCircle,
  ArrowRight,
  AlertTriangle,
  Scale,
  FileText,
  Clock,
  PoundSterling,
  Users,
  MessageSquare,
} from 'lucide-react';
import { FAQSection } from '@/components/seo/FAQSection';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { FunnelCta, CrossSellBar } from '@/components/funnels';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { moneyClaimGuides, moneyClaimProcessLinks, productLinks } from '@/lib/seo/internal-links';

export const metadata: Metadata = {
  title: 'Small Claims Court for Landlords 2026 | Tenant Debt Recovery Guide',
  description:
    'How the small claims track works for landlord money claims. What to expect, how to prepare, and representing yourself against tenant debtors.',
  keywords: [
    'small claims court landlord',
    'small claims tenant',
    'landlord small claims',
    'small claims track',
    'small claims hearing',
    'represent yourself court',
    'landlord court claim',
    'small claims limit',
    'tenant debt court',
    'small claims process',
  ],
  openGraph: {
    title: 'Small Claims Court for Landlords 2026 | Tenant Debt Recovery Guide',
    description:
      'Complete guide to navigating small claims court for landlord tenant debt recovery.',
    type: 'article',
    url: getCanonicalUrl('/money-claim-small-claims-landlord'),
  },
  alternates: {
    canonical: getCanonicalUrl('/money-claim-small-claims-landlord'),
  },
};

const faqs = [
  {
    question: 'What is the small claims track?',
    answer:
      'The small claims track is the simplest court track for civil cases. It handles claims up to £10,000 (or £1,000 for personal injury). Rules are simpler, formal legal representation is discouraged, and even if you win, you usually can\'t claim legal costs from the other side.',
  },
  {
    question: 'What is the current small claims limit?',
    answer:
      'The small claims limit is £10,000 for most claims. Claims above this go to the "fast track" (£10,000-£25,000) or "multi-track" (over £25,000), which have more formal procedures and allow recovery of legal costs.',
  },
  {
    question: 'Do I need a solicitor for small claims?',
    answer:
      'No, small claims is designed for people to represent themselves. Even if you use a solicitor, you usually can\'t recover their costs from the other side. Most landlords handle small claims themselves with proper preparation.',
  },
  {
    question: 'What happens at a small claims hearing?',
    answer:
      'Small claims hearings are informal. The judge will ask questions, review evidence, and listen to both sides. You\'ll explain your claim, show your evidence, and answer questions. Hearings typically last 30 minutes to 2 hours.',
  },
  {
    question: 'Can I attend a small claims hearing by phone or video?',
    answer:
      'Yes, many courts now offer telephone or video hearings for small claims. The court will tell you the options when listing the hearing. Video/phone hearings are common for straightforward cases.',
  },
  {
    question: 'What if the tenant doesn\'t turn up to the hearing?',
    answer:
      'If the defendant doesn\'t attend and hasn\'t given a good reason, the judge will usually decide based on the evidence available. This often means you win by default, but only if your claim is properly documented.',
  },
  {
    question: 'What evidence should I bring to a small claims hearing?',
    answer:
      'Bring: original tenancy agreement, rent records, photos of damage (dated), receipts/invoices, correspondence with tenant, Letter Before Action with proof of sending, and a clear calculation of your claim. Organise everything chronologically.',
  },
  {
    question: 'Can the tenant counterclaim against me?',
    answer:
      'Yes, the tenant can make a counterclaim (e.g., for deposit issues or disrepair). Be prepared to defend against counterclaims. This is why documentation of your property management is important.',
  },
  {
    question: 'How long does small claims take from start to finish?',
    answer:
      'If the tenant defends: typically 2-4 months to reach a hearing. If they don\'t respond: you can get default judgment in about 3 weeks. Simple cases where they admit but don\'t pay are faster.',
  },
  {
    question: 'What costs can I recover in small claims?',
    answer:
      'You can recover: court fees, reasonable travel costs to hearings (limited), and loss of earnings for attending (up to £95/day). You cannot usually recover solicitor fees or preparation costs in small claims.',
  },
];

export default function MoneyClaimSmallClaimsLandlordPage() {
  return (
    <>
      <StructuredData
        data={articleSchema({
          headline: 'Small Claims Court for Landlords: Complete UK Guide',
          description:
            'Everything landlords need to know about the small claims track for tenant debt recovery.',
          url: getCanonicalUrl('/money-claim-small-claims-landlord'),
          datePublished: '2026-01-15',
          dateModified: '2026-01-15',
        })}
      />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          { name: 'Money Claim Guide', url: 'https://landlordheaven.co.uk/money-claim-unpaid-rent' },
          { name: 'Small Claims Court', url: 'https://landlordheaven.co.uk/money-claim-small-claims-landlord' },
        ])}
      />

      <HeaderConfig mode="autoOnScroll" />

      <main className="min-h-screen bg-gray-50">
        <UniversalHero
          title="Small Claims Guide for Landlords"
          subtitle="Build a legally validated, solicitor-grade, compliance-checked and court-ready debt claim package."
          primaryCta={{ label: "Start now", href: "/wizard?product=money_claim&topic=debt&src=seo_money_claim_small_claims_landlord" }}
          showTrustPositioningBar
          hideMedia
        />
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-emerald-900 to-emerald-800 text-white py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-emerald-700/50 text-emerald-100 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Scale className="w-4 h-4" />
                Navigate small claims confidently
              </div>

              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                Small Claims Court for Landlords
              </h2>

              <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
                Everything you need to know about the small claims track: what to expect,
                how to prepare, and how to represent yourself effectively.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/wizard?product=money_claim&topic=debt&src=seo_money_claim_small_claims_landlord"
                  className="inline-flex items-center justify-center gap-2 bg-white text-emerald-800 font-semibold py-4 px-8 rounded-xl hover:bg-emerald-50 transition-colors"
                >
                  Start Money Claim
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

        {/* What is Small Claims Section */}
        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Understanding the Small Claims Track
              </h2>

              <div className="prose prose-gray max-w-none mb-8">
                <p className="text-lg text-gray-600">
                  The small claims track is designed for simpler, lower-value disputes where
                  formal legal representation isn&apos;t necessary. For landlords recovering
                  tenant debts up to £10,000, this is usually where your case will be heard
                  if the tenant defends.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm text-center">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <PoundSterling className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Up to £10,000</h3>
                  <p className="text-sm text-gray-600">
                    Most landlord debt claims fall within the small claims limit
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm text-center">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Self-Representation</h3>
                  <p className="text-sm text-gray-600">
                    Designed for people to represent themselves without solicitors
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm text-center">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Informal Process</h3>
                  <p className="text-sm text-gray-600">
                    Relaxed rules, conversational hearings, no wigs and gowns
                  </p>
                </div>
              </div>

              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
                <p className="text-amber-900 text-sm flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Note:</strong> Not all cases go to a hearing. If the tenant doesn&apos;t
                    respond to your claim, you can get default judgment without a hearing. If they
                    admit the debt, you can also get judgment without a hearing.
                  </span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-12 lg:py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Small Claims Timeline
              </h2>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    1
                  </div>
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h3 className="font-bold text-gray-900">Submit Claim</h3>
                      <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-full">
                        Day 1
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm">
                      Submit your money claim through MCOL or paper form N1.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    2
                  </div>
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h3 className="font-bold text-gray-900">Defendant Response Period</h3>
                      <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-full">
                        Days 1-14 (up to 33)
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm">
                      Defendant has 14 days to respond (can extend to 33 days for advice).
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    3
                  </div>
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h3 className="font-bold text-gray-900">Allocation to Track</h3>
                      <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-full">
                        If defended
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm">
                      If they defend, both parties complete directions questionnaires. Court allocates to small claims track.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    4
                  </div>
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h3 className="font-bold text-gray-900">Hearing Listed</h3>
                      <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-full">
                        Typically 2-4 months
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm">
                      Court sets a hearing date and sends notice to both parties with directions.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    5
                  </div>
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h3 className="font-bold text-gray-900">Hearing &amp; Judgment</h3>
                      <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-full">
                        30 mins - 2 hours
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm">
                      Attend hearing, present evidence, receive judgment (usually same day).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Preparing for Hearing Section */}
        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Preparing for Your Hearing
              </h2>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                    <FileText className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-3">Documents to Bring</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Tenancy agreement (original if possible)</li>
                    <li>• Rent statements/bank records</li>
                    <li>• Photos with dates (damage cases)</li>
                    <li>• Invoices and receipts</li>
                    <li>• All correspondence with tenant</li>
                    <li>• Letter Before Action + proof of sending</li>
                    <li>• Clear calculation of claim</li>
                  </ul>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                    <Clock className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-3">On the Day</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Arrive 15-30 minutes early</li>
                    <li>• Dress smartly (business casual)</li>
                    <li>• Address judge as &quot;Sir&quot; or &quot;Madam&quot;</li>
                    <li>• Speak clearly and stick to facts</li>
                    <li>• Don&apos;t interrupt the other party</li>
                    <li>• Answer questions directly</li>
                    <li>• Stay calm even if provoked</li>
                  </ul>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Evidence Bundle Checklist
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Tenancy agreement (council tax/bills clauses highlighted)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Inventory at start (signed if possible)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Check-out report/inventory at end
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Dated photos (before and after)
                    </li>
                  </ul>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Repair quotes/invoices
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Rent payment records
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Letter Before Action (with proof of posting)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Any tenant replies/admissions
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
                Start Your Money Claim
              </h2>
              <p className="text-gray-600 mb-8">
                Get professionally drafted court documents ready for small claims.
                Letter Before Action, Particulars of Claim, and step-by-step guidance.
              </p>
              <Link
                href="/wizard?product=money_claim&topic=debt&src=seo_money_claim_small_claims_landlord"
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

        <section className="py-8 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <CrossSellBar context="money-claim" location="mid" />
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
                  moneyClaimGuides.mcolProcess,
                  moneyClaimGuides.defendedClaims,
                  moneyClaimGuides.ccjEnforcement,
                  productLinks.moneyClaim,
                ]}
              />
            </div>
          </div>
        </section>
        <section className="py-10 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <FunnelCta
                title="Need the right route for your case?"
                subtitle="Continue your money claim or go back to the decision hub."
                primaryHref="/products/money-claim"
                primaryText="Continue with money claim"
                primaryDataCta="money-claim"
                location="bottom"
                secondaryLinks={[{ href: '/tenant-not-paying-rent', text: 'Back to tenant not paying rent hub' }]}
              />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
