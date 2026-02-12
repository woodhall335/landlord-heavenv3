import { Metadata } from 'next';
import Link from 'next/link';
import {
  StructuredData,
  breadcrumbSchema,
  articleSchema,
} from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo/urls';
import { SocialProofCounter } from '@/components/ui/SocialProofCounter';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import {
  possessionClaimRelatedLinks,
  productLinks,
  guideLinks,
} from '@/lib/seo/internal-links';
import { buildWizardLink } from '@/lib/wizard/buildWizardLink';
import { StandardHero } from '@/components/marketing/StandardHero';
import { SeoCtaBlock, SeoDisclaimer } from '@/components/seo/SeoCtaBlock';
import { FAQSection } from '@/components/seo/FAQSection';
import { SeoLandingWrapper } from '@/components/seo/SeoLandingWrapper';
import { possessionOrderFAQs } from '@/data/faqs';
import { FunnelCta } from '@/components/funnels';
import { PRODUCTS } from '@/lib/pricing/products';
import {
  CheckCircle,
  AlertTriangle,
  Clock,
  ArrowRight,
  Scale,
  FileText,
  Shield,
  Gavel,
  AlertCircle,
  PoundSterling,
  XCircle,
  Users,
  Building,
} from 'lucide-react';

const completePackLink = buildWizardLink({
  product: 'complete_pack',
  jurisdiction: 'england',
  src: 'seo_eviction',
  topic: 'eviction',
});

const noticeOnlyLink = buildWizardLink({
  product: 'notice_only',
  jurisdiction: 'england',
  src: 'seo_eviction',
  topic: 'eviction',
});

export const metadata: Metadata = {
  title: 'Apply for Possession Order | Landlord Court Forms N5B N5 | Landlord Heaven',
  description:
    'How to apply for a possession order in England. Step-by-step guide to Form N5B (accelerated) and Form N5 (standard). Court fees, timelines, and what to expect.',
  keywords: [
    'apply for possession order landlord',
    'possession order landlord england',
    'possession claim landlord',
    'n5b form landlord',
    'n5 possession claim',
    'accelerated possession procedure',
    'court possession order',
    'landlord court forms',
  ],
  openGraph: {
    title: 'Apply for Possession Order | Landlord Court Forms | Landlord Heaven',
    description:
      'How to apply for a possession order in England. Step-by-step guide to Form N5B and N5.',
    type: 'article',
    url: getCanonicalUrl('/apply-possession-order-landlord'),
    siteName: 'Landlord Heaven',
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Apply for Possession Order | Landlord Heaven',
    description: 'How to apply for a possession order in England.',
  },
  alternates: {
    canonical: getCanonicalUrl('/apply-possession-order-landlord'),
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ApplyPossessionOrderPage() {
  return (
    <>
      <SeoLandingWrapper
        pagePath="/apply-possession-order-landlord"
        pageTitle="Apply for Possession Order Landlord"
        pageType="court"
        jurisdiction="england"
      />

      {/* Structured Data */}
      <StructuredData
        data={articleSchema({
          headline: 'How to Apply for a Possession Order: Landlord Guide 2026',
          description:
            'Complete guide to applying for a possession order in England. Covers N5B accelerated procedure, N5 standard claim, court fees, and hearing process.',
          url: getCanonicalUrl('/apply-possession-order-landlord'),
          datePublished: '2026-01-30',
          dateModified: '2026-01-30',
        })}
      />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: getCanonicalUrl('/') },
          { name: 'Eviction Guides', url: getCanonicalUrl('/how-to-evict-tenant') },
          { name: 'Apply for Possession Order', url: getCanonicalUrl('/apply-possession-order-landlord') },
        ])}
      />

      <main>
        {/* Hero Section */}
        <StandardHero
          badge="England"
          badgeIcon={<Gavel className="w-4 h-4" />}
          title="Apply for a Possession Order"
          subtitle="Your eviction notice has expired but your tenant has not left. Here is how to apply to the court for a possession order using Form N5B or N5."
          primaryCTA={{
            label: `Get Court Forms — ${PRODUCTS.complete_pack.displayPrice}`,
            href: completePackLink,
          }}
          secondaryCTA={{
            label: 'Just Need the Notice?',
            href: noticeOnlyLink,
          }}
          variant="pastel"
        >
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600 mt-4">
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-green-500" />
              N5B & N5 Included
            </span>
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              Witness Statements
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Step-by-Step Guide
            </span>
          </div>
        </StandardHero>

        <section className="py-8 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <FunnelCta
                title="Apply for possession with full support"
                subtitle="If your notice has expired, move straight to the court stage with the complete pack."
                primaryHref="/products/complete-pack"
                primaryText="Start complete pack"
                primaryDataCta="complete-pack"
                location="above-fold"
                secondaryLinks={[
                  { href: '/products/notice-only', text: 'Only need notice drafting?', dataCta: 'notice-only' },
                  { href: '/n5b-form-guide', text: 'Accelerated possession (N5B)' },
                ]}
              />
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="py-6 bg-gray-50 border-y border-gray-100">
          <div className="container mx-auto px-4">
            <SocialProofCounter variant="total" className="justify-center" />
          </div>
        </section>

        {/* Types of Possession Claims */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Types of Possession Claims
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                There are two routes to court depending on which notice you served. Choose the
                right one for your situation.
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Accelerated (N5B) */}
                <div className="bg-primary/5 rounded-2xl p-6 border-2 border-primary relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
                      Fastest Route
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center">
                      <span className="text-lg font-bold text-primary">N5B</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Accelerated Procedure</h3>
                      <span className="text-sm text-gray-500">Section 21 Only</span>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4">
                    Paper-based process with no court hearing required. The judge reviews
                    documents and issues an order if valid. See our{' '}
                    <Link href="/n5b-form-guide" className="text-primary hover:underline">
                      accelerated possession (N5B) guide
                    </Link>
                    .
                  </p>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Court fee</span>
                      <span className="font-bold text-gray-900">£355</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Typical time</span>
                      <span className="font-bold text-gray-900">4-8 weeks</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Hearing</span>
                      <span className="font-bold text-green-600">Not required</span>
                    </div>
                  </div>

                  <h4 className="font-semibold text-gray-900 mb-2">Use when:</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      You served a valid Section 21 notice
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      You are NOT claiming rent arrears
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      Tenancy is Assured Shorthold (AST)
                    </li>
                  </ul>

                  <div className="mt-6 pt-4 border-t border-primary/20">
                    <h4 className="font-semibold text-gray-900 mb-2">Forms needed:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Form N5B (claim form)</li>
                      <li>• Form N215 (certificate of service)</li>
                      <li>• Copy of Section 21 notice</li>
                      <li>• Copy of tenancy agreement</li>
                    </ul>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <FunnelCta
                    title="Need this handled end-to-end?"
                    subtitle="We can prepare the possession paperwork and guide each filing step."
                    primaryHref="/products/complete-pack"
                    primaryText="Get full eviction support"
                    primaryDataCta="complete-pack"
                    location="mid"
                  />
                </div>

                {/* Standard (N5) */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center">
                      <span className="text-lg font-bold text-gray-600">N5</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Standard Procedure</h3>
                      <span className="text-sm text-gray-500">Section 8 or With Money Claim</span>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4">
                    Requires a court hearing where both parties can attend. Use for Section 8 or
                    when claiming rent arrears.
                  </p>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Court fee</span>
                      <span className="font-bold text-gray-900">£355</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Typical time</span>
                      <span className="font-bold text-gray-900">6-12 weeks</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Hearing</span>
                      <span className="font-bold text-amber-600">Required</span>
                    </div>
                  </div>

                  <h4 className="font-semibold text-gray-900 mb-2">Use when:</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      You served a Section 8 notice
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      You want to claim rent arrears too
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      Accelerated procedure not available
                    </li>
                  </ul>

                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <h4 className="font-semibold text-gray-900 mb-2">Forms needed:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Form N5 (claim form)</li>
                      <li>• Form N119 (particulars of claim)</li>
                      <li>• Copy of eviction notice</li>
                      <li>• Copy of tenancy agreement</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                <p className="text-blue-900 text-sm">
                  <strong>Pro tip:</strong> If you served both Section 21 and Section 8 notices,
                  you can use either route. N5B is faster if your Section 21 is valid and you do
                  not need to claim rent.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Court Fees */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Court Fees and Costs
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Understanding the full cost of court action helps you plan. Here is a complete
                breakdown.
              </p>

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-4 font-semibold text-gray-900">Item</th>
                        <th className="text-right p-4 font-semibold text-gray-900">Cost</th>
                        <th className="text-left p-4 font-semibold text-gray-900">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr>
                        <td className="p-4 font-medium text-gray-900">Possession claim (N5B or N5)</td>
                        <td className="p-4 text-right font-bold text-gray-900">£355</td>
                        <td className="p-4 text-gray-600 text-sm">Same fee for both routes</td>
                      </tr>
                      <tr className="bg-gray-50/50">
                        <td className="p-4 font-medium text-gray-900">Warrant of possession (N325)</td>
                        <td className="p-4 text-right font-bold text-gray-900">£130</td>
                        <td className="p-4 text-gray-600 text-sm">If tenant does not leave after order</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-medium text-gray-900">High Court enforcement (optional)</td>
                        <td className="p-4 text-right font-bold text-gray-900">£66+</td>
                        <td className="p-4 text-gray-600 text-sm">Faster than county court bailiffs</td>
                      </tr>
                      <tr className="bg-primary/5">
                        <td className="p-4 font-bold text-gray-900">Total (typical case)</td>
                        <td className="p-4 text-right font-bold text-primary text-lg">£485</td>
                        <td className="p-4 text-gray-600 text-sm">Claim + warrant</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-8 grid md:grid-cols-2 gap-6">
                <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                  <h3 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Fee Remission Available
                  </h3>
                  <p className="text-green-800 text-sm">
                    If you receive certain benefits or have low income, you may be eligible for
                    reduced court fees. Apply using Form EX160.
                  </p>
                </div>

                <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
                  <h3 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Fees Non-Refundable
                  </h3>
                  <p className="text-amber-800 text-sm">
                    Court fees are not refunded if the tenant leaves before the hearing or if your
                    claim fails. Ensure your notice is valid before applying.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Step by Step */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                How to Apply: Step by Step
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Follow these steps to submit your possession claim to the county court.
              </p>

              <div className="space-y-6">
                {/* Step 1 */}
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-white">1</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        Gather Your Documents
                      </h3>
                      <p className="text-gray-600 mb-3">
                        Before completing the forms, collect all required documents.
                      </p>
                      <ul className="grid sm:grid-cols-2 gap-2 text-sm text-gray-600">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Original eviction notice
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Tenancy agreement
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Proof of service (certificate or recorded delivery)
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Deposit protection certificate
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-white">2</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        Complete the Court Forms
                      </h3>
                      <p className="text-gray-600 mb-3">
                        Fill in the appropriate forms accurately. Errors can delay your case.
                      </p>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <span className="font-bold text-gray-900">For Section 21:</span>
                          <p className="text-sm text-gray-600 mt-1">Form N5B + Form N215</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <span className="font-bold text-gray-900">For Section 8:</span>
                          <p className="text-sm text-gray-600 mt-1">Form N5 + Form N119</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-white">3</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        Submit to the Correct Court
                      </h3>
                      <p className="text-gray-600 mb-3">
                        Send your claim to the County Court that covers the property address.
                      </p>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <span className="font-bold text-gray-900">Online:</span>
                          <p className="text-sm text-gray-600 mt-1">
                            Via Possession Claims Online (PCOL)
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <span className="font-bold text-gray-900">By post:</span>
                          <p className="text-sm text-gray-600 mt-1">
                            To the local county court
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-white">4</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        Pay the Court Fee
                      </h3>
                      <p className="text-gray-600 mb-3">
                        Pay £355 by card (online), cheque, or at the court counter.
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <PoundSterling className="w-4 h-4" />
                        <span>Fee must be paid when submitting the claim</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 5 */}
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-white">5</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        Court Serves the Tenant
                      </h3>
                      <p className="text-gray-600 mb-3">
                        The court sends your claim to the tenant, who has 14 days to respond.
                      </p>
                      <ul className="text-sm text-gray-600 space-y-2">
                        <li className="flex items-center gap-2">
                          <ArrowRight className="w-4 h-4 text-primary" />
                          N5B: If no defence, judge reviews on paper
                        </li>
                        <li className="flex items-center gap-2">
                          <ArrowRight className="w-4 h-4 text-primary" />
                          N5: Hearing date scheduled (6-12 weeks)
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Step 6 */}
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        Possession Order Granted
                      </h3>
                      <p className="text-gray-600 mb-3">
                        If successful, the court grants a possession order giving the tenant
                        14-42 days to leave.
                      </p>
                      <div className="bg-green-50 rounded-lg p-3 text-sm text-green-800">
                        <CheckCircle className="w-4 h-4 inline mr-1" />
                        If tenant still refuses, apply for a warrant of possession (Form N325)
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* At the Hearing */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                What Happens at the Possession Hearing
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                For standard possession claims (N5), you will need to attend a court hearing.
                Here is what to expect.
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Before You Arrive
                  </h3>
                  <ul className="space-y-3 text-gray-600 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Bring all original documents</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Prepare a rent schedule if claiming arrears</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Arrive 30 minutes early</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Dress smartly (no suit required)</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Gavel className="w-5 h-5 text-primary" />
                    During the Hearing
                  </h3>
                  <ul className="space-y-3 text-gray-600 text-sm">
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>Typically 15-30 minutes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>Judge asks about notice and grounds</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>Tenant may offer to pay or request time</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>You can represent yourself</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-8 bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Possible Outcomes:</h3>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="font-bold text-green-900 mb-2">Outright Order</h4>
                    <p className="text-sm text-green-700">
                      Tenant must leave by specified date (14-42 days)
                    </p>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-4">
                    <h4 className="font-bold text-amber-900 mb-2">Suspended Order</h4>
                    <p className="text-sm text-amber-700">
                      Tenant stays if they pay rent + arrears
                    </p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-bold text-blue-900 mb-2">Postponed Order</h4>
                    <p className="text-sm text-blue-700">
                      Possession delayed on terms set by court
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* After the Order */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                After the Possession Order: What If Tenant Does Not Leave?
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                If the tenant does not vacate by the order date, you will need to apply for a
                warrant of possession.
              </p>

              <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
                <div className="flex flex-col md:flex-row items-start gap-8">
                  <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Gavel className="w-10 h-10 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      Warrant of Possession (Form N325)
                    </h3>
                    <p className="text-gray-600 mb-4">
                      A warrant of possession authorises county court bailiffs to physically
                      remove the tenant and their belongings from your property.
                    </p>

                    <div className="grid sm:grid-cols-2 gap-4 mb-6">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <span className="text-gray-600 text-sm block">Court fee</span>
                        <span className="font-bold text-gray-900 text-lg">~£130</span>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <span className="text-gray-600 text-sm block">Typical wait</span>
                        <span className="font-bold text-gray-900 text-lg">4-8 weeks</span>
                      </div>
                    </div>

                    <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
                      <p className="text-amber-900 text-sm">
                        <strong>Important:</strong> You still cannot change locks yourself even
                        with a possession order. Only bailiffs can legally remove the tenant.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 text-center">
                <Link
                  href="/warrant-of-possession"
                  className="text-primary font-medium hover:underline inline-flex items-center gap-1"
                >
                  Full Warrant of Possession Guide
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Mid-page CTA */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <SeoCtaBlock
                pageType="court"
                variant="section"
                jurisdiction="england"
                pagePath="/apply-possession-order-landlord"
                title="Get All Court Forms Ready to Submit"
                description="N5B, N5, N119, N215, witness statements, and step-by-step instructions. Everything you need for your possession claim."
              />
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <FAQSection
          faqs={possessionOrderFAQs}
          title="Possession Order: Frequently Asked Questions"
          showContactCTA={false}
          variant="white"
        />

        {/* Final CTA */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <SeoCtaBlock
                pageType="court"
                variant="final"
                jurisdiction="england"
                pagePath="/apply-possession-order-landlord"
                title="Get Your Possession Claim Documents"
                description="Complete N5B/N5 forms, witness statements, and clear instructions. Trusted by over 10,000 UK landlords."
              />

              <SeoDisclaimer className="max-w-4xl mx-auto" />
            </div>
          </div>
        </section>

        {/* Related Resources */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <RelatedLinks
                title="Related Resources"
                links={possessionClaimRelatedLinks}
              />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
