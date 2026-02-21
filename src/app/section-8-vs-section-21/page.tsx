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
  evictionRelatedLinks,
  productLinks,
  toolLinks,
  guideLinks,
  blogLinks,
} from '@/lib/seo/internal-links';
import { buildWizardLink } from '@/lib/wizard/buildWizardLink';
import { StandardHero } from '@/components/marketing/StandardHero';
import { SeoCtaBlock, SeoDisclaimer } from '@/components/seo/SeoCtaBlock';
import { FAQSection } from '@/components/seo/FAQSection';
import { SeoLandingWrapper } from '@/components/seo/SeoLandingWrapper';
import { section8VsSection21FAQs } from '@/data/faqs';
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
  Calendar,
  AlertCircle,
  PoundSterling,
  XCircle,
  HelpCircle,
  ChevronDown,
  MessageSquare,
} from 'lucide-react';

const noticeOnlyLink = buildWizardLink({
  product: 'notice_only',
  jurisdiction: 'england',
  src: 'seo_eviction',
  topic: 'eviction',
});

const completePackLink = buildWizardLink({
  product: 'complete_pack',
  jurisdiction: 'england',
  src: 'seo_eviction',
  topic: 'eviction',
});

export const metadata: Metadata = {
  title: 'Section 8 vs Section 21 | Which Eviction Notice to Use | Landlord Heaven',
  description:
    'Section 8 vs Section 21: which eviction notice should you use? Compare notice periods, court process, grounds, and costs. Get court-ready notices from £49.99.',
  keywords: [
    'section 8 vs section 21',
    'should i use section 8 or section 21',
    'fastest way to evict tenant england',
    'section 21 or section 8',
    'eviction notice comparison',
    'section 8 section 21 difference',
    'which eviction notice to use',
    'section 8 vs 21',
  ],
  openGraph: {
    title: 'Section 8 vs Section 21 | Which Eviction Notice to Use | Landlord Heaven',
    description:
      'Section 8 vs Section 21: which eviction notice should you use? Complete comparison guide.',
    type: 'article',
    url: getCanonicalUrl('/section-8-vs-section-21'),
    siteName: 'Landlord Heaven',
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Section 8 vs Section 21 | Landlord Heaven',
    description: 'Section 8 vs Section 21: which eviction notice should you use?',
  },
  alternates: {
    canonical: getCanonicalUrl('/section-8-vs-section-21'),
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function Section8VsSection21Page() {
  return (
    <>
      <SeoLandingWrapper
        pagePath="/section-8-vs-section-21"
        pageTitle="Section 8 vs Section 21"
        pageType="problem"
        jurisdiction="england"
      />

      {/* Structured Data */}
      <StructuredData
        data={articleSchema({
          headline: 'Section 8 vs Section 21: Which Eviction Notice Should You Use?',
          description:
            'Complete comparison of Section 8 and Section 21 eviction notices. Notice periods, court process, costs, and when to use each.',
          url: getCanonicalUrl('/section-8-vs-section-21'),
          datePublished: '2026-01-30',
          dateModified: '2026-01-30',
        })}
      />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: getCanonicalUrl('/') },
          { name: 'Eviction Guides', url: getCanonicalUrl('/how-to-evict-tenant') },
          { name: 'Section 8 vs Section 21', url: getCanonicalUrl('/section-8-vs-section-21') },
        ])}
      />

      <main>
        {/* Hero Section */}
        <StandardHero
          badge="England"
          badgeIcon={<Scale className="w-4 h-4" />}
          title={
            <>
              Section 8 vs Section 21:
              <br />
              <span className="text-primary">Which Should You Use?</span>
            </>
          }
          subtitle={<>The two main eviction notices in England have different uses, notice periods, and court processes. Here is how to choose the right one — then use our <Link href="/section-8-notice-template" className="text-primary hover:underline">Section 8 notice template</Link> or <Link href="/section-21-notice-template" className="text-primary hover:underline">Section 21 notice template</Link> to draft the right form.</>}
          primaryCTA={{
            label: `Get Both Notices — ${PRODUCTS.notice_only.displayPrice}`,
            href: noticeOnlyLink,
          }}
          secondaryCTA={{
            label: 'Need Court Forms Too?',
            href: completePackLink,
          }}
          variant="pastel"
        >
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600 mt-4">
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Section 21 & 8 Included
            </span>
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              AI Compliance Check
            </span>
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-green-500" />
              Court-Ready Format
            </span>
          </div>
        </StandardHero>

        {/* Social Proof */}
        <section className="py-6 bg-gray-50 border-y border-gray-100">
          <div className="container mx-auto px-4">
            <SocialProofCounter variant="total" className="justify-center" />
          </div>
        </section>

        {/* Quick Comparison Table */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Key Differences at a Glance
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                A side-by-side comparison of Section 21 and Section 8 eviction notices.
              </p>

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-4 font-semibold text-gray-900">Feature</th>
                        <th className="text-center p-4 font-semibold text-gray-900">
                          <div className="flex items-center justify-center gap-2">
                            <span className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                              <span className="text-sm font-bold text-primary">21</span>
                            </span>
                            Section 21
                          </div>
                        </th>
                        <th className="text-center p-4 font-semibold text-gray-900">
                          <div className="flex items-center justify-center gap-2">
                            <span className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                              <span className="text-sm font-bold text-red-600">8</span>
                            </span>
                            Section 8
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr>
                        <td className="p-4 font-medium text-gray-900">Type</td>
                        <td className="p-4 text-center text-gray-600">No-fault eviction</td>
                        <td className="p-4 text-center text-gray-600">Grounds-based eviction</td>
                      </tr>
                      <tr className="bg-gray-50/50">
                        <td className="p-4 font-medium text-gray-900">Notice period</td>
                        <td className="p-4 text-center font-bold text-gray-900">2 months</td>
                        <td className="p-4 text-center font-bold text-gray-900">2 weeks - 2 months</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-medium text-gray-900">Reason required</td>
                        <td className="p-4 text-center">
                          <XCircle className="w-5 h-5 text-green-500 mx-auto" />
                        </td>
                        <td className="p-4 text-center">
                          <CheckCircle className="w-5 h-5 text-amber-500 mx-auto" />
                        </td>
                      </tr>
                      <tr className="bg-gray-50/50">
                        <td className="p-4 font-medium text-gray-900">Court hearing</td>
                        <td className="p-4 text-center text-green-600 font-medium">
                          Not required (N5B)
                        </td>
                        <td className="p-4 text-center text-amber-600 font-medium">Required (N5)</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-medium text-gray-900">Mandatory grounds</td>
                        <td className="p-4 text-center text-gray-600">—</td>
                        <td className="p-4 text-center text-gray-600">
                          Yes (e.g., Ground 8)
                        </td>
                      </tr>
                      <tr className="bg-gray-50/50">
                        <td className="p-4 font-medium text-gray-900">Can claim rent arrears</td>
                        <td className="p-4 text-center">
                          <XCircle className="w-5 h-5 text-red-500 mx-auto" />
                        </td>
                        <td className="p-4 text-center">
                          <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                        </td>
                      </tr>
                      <tr>
                        <td className="p-4 font-medium text-gray-900">Compliance requirements</td>
                        <td className="p-4 text-center text-amber-600 font-medium">
                          Strict (deposit, EPC, etc.)
                        </td>
                        <td className="p-4 text-center text-green-600 font-medium">Fewer</td>
                      </tr>
                      <tr className="bg-gray-50/50">
                        <td className="p-4 font-medium text-gray-900">Court fee</td>
                        <td className="p-4 text-center font-bold text-gray-900">£355</td>
                        <td className="p-4 text-center font-bold text-gray-900">£355</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-medium text-gray-900">Typical total time</td>
                        <td className="p-4 text-center text-primary font-bold">4-6 months</td>
                        <td className="p-4 text-center text-primary font-bold">3-8 months</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* When to Use Each */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                When to Use Each Notice
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Choose based on your specific situation and what you want to achieve.
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Section 21 */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center">
                      <span className="text-xl font-bold text-primary">21</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Use Section 21 When:</h3>
                      <span className="text-sm text-gray-500">No-Fault Eviction</span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium text-gray-900">End of fixed term</span>
                        <p className="text-sm text-gray-600">
                          You want to end the tenancy at the end of the fixed term or during a
                          periodic tenancy
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium text-gray-900">Property sale or refurb</span>
                        <p className="text-sm text-gray-600">
                          You are selling the property or need vacant possession for major works
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium text-gray-900">No specific fault</span>
                        <p className="text-sm text-gray-600">
                          The tenant has not breached the agreement but you want possession
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium text-gray-900">Full compliance</span>
                        <p className="text-sm text-gray-600">
                          Deposit protected, EPC provided, How to Rent guide given
                        </p>
                      </div>
                    </li>
                  </ul>

                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Advantages
                    </h4>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>• No hearing required (accelerated procedure)</li>
                      <li>• No need to prove a ground</li>
                      <li>• Straightforward if compliant</li>
                    </ul>
                  </div>
                </div>

                {/* Section 8 */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center">
                      <span className="text-xl font-bold text-red-600">8</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Use Section 8 When:</h3>
                      <span className="text-sm text-gray-500">Grounds-Based Eviction</span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium text-gray-900">Rent arrears (2+ months)</span>
                        <p className="text-sm text-gray-600">
                          Ground 8 gives mandatory possession with only 2 weeks notice
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium text-gray-900">Breach of tenancy</span>
                        <p className="text-sm text-gray-600">
                          Subletting, damage, antisocial behaviour, or other breaches
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium text-gray-900">Section 21 invalid</span>
                        <p className="text-sm text-gray-600">
                          Your Section 21 may be invalid due to deposit or compliance issues
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium text-gray-900">Claim rent in same action</span>
                        <p className="text-sm text-gray-600">
                          You can claim unpaid rent within the possession proceedings
                        </p>
                      </div>
                    </li>
                  </ul>

                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Advantages
                    </h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Shorter notice (2 weeks for rent arrears)</li>
                      <li>• Mandatory grounds (court must grant)</li>
                      <li>• Survives Section 21 abolition</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Can You Serve Both? */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Can You Serve Both Notices Together?
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Yes—and many landlords do. Serving both gives you maximum protection.
              </p>

              <div className="bg-primary/5 rounded-2xl p-8 border border-primary/20">
                <div className="flex flex-col md:flex-row items-start gap-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Shield className="w-8 h-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      Why Serve Both Notices
                    </h3>
                    <ul className="space-y-3 text-gray-600">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>
                          <strong>Backup protection:</strong> If one notice fails, the other may
                          still succeed
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>
                          <strong>Rent arrears fluctuate:</strong> If tenant pays down arrears
                          below 2 months, Section 21 is your backup
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>
                          <strong>No extra cost:</strong> You can serve both at the same time at
                          no additional cost
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>
                          <strong>Choose later:</strong> Wait to see which expires first and has
                          the strongest case
                        </span>
                      </li>
                    </ul>
                    <div className="mt-6 bg-white rounded-lg p-4">
                      <p className="text-sm text-gray-700">
                        <strong>Example:</strong> Tenant owes 3 months rent. Serve Section 8
                        (Ground 8, 10, 11) with 2 weeks notice AND Section 21 with 2 months
                        notice. If tenant pays down to 1 month arrears, Ground 8 fails but you
                        still have Section 21.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Which is Faster? */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Which Is Faster?
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                The fastest route depends on your specific situation.
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    Section 21 Timeline
                  </h3>
                  <ul className="space-y-3 text-sm">
                    <li className="flex justify-between items-center pb-2 border-b border-gray-100">
                      <span className="text-gray-600">Notice period</span>
                      <span className="font-bold text-gray-900">2 months</span>
                    </li>
                    <li className="flex justify-between items-center pb-2 border-b border-gray-100">
                      <span className="text-gray-600">Court processing (N5B)</span>
                      <span className="font-bold text-gray-900">4-8 weeks</span>
                    </li>
                    <li className="flex justify-between items-center pb-2 border-b border-gray-100">
                      <span className="text-gray-600">Order compliance</span>
                      <span className="font-bold text-gray-900">14-42 days</span>
                    </li>
                    <li className="flex justify-between items-center pb-2 border-b border-gray-100">
                      <span className="text-gray-600">Bailiff (if needed)</span>
                      <span className="font-bold text-gray-900">4-8 weeks</span>
                    </li>
                    <li className="flex justify-between items-center pt-2 bg-primary/5 -mx-6 px-6 py-3 rounded-b-xl">
                      <span className="font-bold text-gray-900">Typical total</span>
                      <span className="font-bold text-primary text-lg">4-6 months</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-red-600" />
                    Section 8 Timeline (Rent Arrears)
                  </h3>
                  <ul className="space-y-3 text-sm">
                    <li className="flex justify-between items-center pb-2 border-b border-gray-100">
                      <span className="text-gray-600">Notice period (Ground 8)</span>
                      <span className="font-bold text-green-600">2 weeks</span>
                    </li>
                    <li className="flex justify-between items-center pb-2 border-b border-gray-100">
                      <span className="text-gray-600">Wait for hearing (N5)</span>
                      <span className="font-bold text-gray-900">6-12 weeks</span>
                    </li>
                    <li className="flex justify-between items-center pb-2 border-b border-gray-100">
                      <span className="text-gray-600">Order compliance</span>
                      <span className="font-bold text-gray-900">14-42 days</span>
                    </li>
                    <li className="flex justify-between items-center pb-2 border-b border-gray-100">
                      <span className="text-gray-600">Bailiff (if needed)</span>
                      <span className="font-bold text-gray-900">4-8 weeks</span>
                    </li>
                    <li className="flex justify-between items-center pt-2 bg-red-50 -mx-6 px-6 py-3 rounded-b-xl">
                      <span className="font-bold text-gray-900">Typical total</span>
                      <span className="font-bold text-red-600 text-lg">3-8 months</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                <p className="text-blue-900 text-sm">
                  <strong>Summary:</strong> Section 8 has a shorter notice period (2 weeks for
                  rent arrears) but requires a hearing. Section 21 has a longer notice (2 months)
                  but no hearing. In practice, they often end up taking similar total time.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 21 Abolition */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Is Section 21 Being Abolished?
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Yes—the Renters Reform Bill will abolish Section 21 in England, likely from late
                2026.
              </p>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-amber-900 mb-2">Renters Reform Bill</h3>
                    <p className="text-amber-800 text-sm mb-4">
                      The government&apos;s Renters Reform Bill proposes to abolish Section 21
                      &quot;no-fault&quot; evictions. After abolition, landlords will need to use
                      Section 8 grounds to evict tenants.
                    </p>
                    <ul className="space-y-2 text-sm text-amber-800">
                      <li className="flex items-start gap-2">
                        <ArrowRight className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        New grounds will be added for landlord selling or moving in
                      </li>
                      <li className="flex items-start gap-2">
                        <ArrowRight className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        Rent arrears ground (Ground 8) will likely remain
                      </li>
                      <li className="flex items-start gap-2">
                        <ArrowRight className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        Check current legislation before serving any notices
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mt-8 bg-primary/5 rounded-xl p-6 border border-primary/20">
                <div className="flex items-start gap-4">
                  <Shield className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">What This Means for You</h4>
                    <p className="text-gray-600 text-sm">
                      If you are considering eviction, act now while Section 21 is still
                      available. After abolition, you will need valid Section 8 grounds. Our
                      Notice Only Pack includes both Section 21 and Section 8 notices.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Decision Flowchart */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Quick Decision Guide
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Answer these questions to determine which notice to use.
              </p>

              <div className="space-y-4">
                {/* Question 1 */}
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <HelpCircle className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-3">
                        Does your tenant owe 2+ months rent?
                      </h3>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="bg-green-50 rounded-lg p-4">
                          <span className="font-bold text-green-900 block mb-1">Yes</span>
                          <span className="text-sm text-green-700">
                            Use Section 8 Ground 8 (mandatory, 2 weeks notice)
                          </span>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <span className="font-bold text-gray-900 block mb-1">No</span>
                          <span className="text-sm text-gray-600">Continue to next question</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Question 2 */}
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <HelpCircle className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-3">
                        Has the tenant breached the tenancy (damage, antisocial behaviour, etc.)?
                      </h3>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="bg-green-50 rounded-lg p-4">
                          <span className="font-bold text-green-900 block mb-1">Yes</span>
                          <span className="text-sm text-green-700">
                            Use Section 8 with relevant grounds
                          </span>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <span className="font-bold text-gray-900 block mb-1">No</span>
                          <span className="text-sm text-gray-600">Continue to next question</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Question 3 */}
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <HelpCircle className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-3">
                        Is your deposit protected with prescribed information given?
                      </h3>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="bg-green-50 rounded-lg p-4">
                          <span className="font-bold text-green-900 block mb-1">Yes</span>
                          <span className="text-sm text-green-700">
                            Section 21 is available
                          </span>
                        </div>
                        <div className="bg-amber-50 rounded-lg p-4">
                          <span className="font-bold text-amber-900 block mb-1">No</span>
                          <span className="text-sm text-amber-700">
                            Cannot use Section 21 - use Section 8 if grounds exist
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Final Recommendation */}
                <div className="bg-primary/5 rounded-xl p-6 border-2 border-primary">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-2">Our Recommendation</h3>
                      <p className="text-gray-600 text-sm">
                        <strong>Serve both notices together</strong> for maximum protection. Our
                        Notice Only Pack includes Section 21 and Section 8 with all applicable
                        grounds. This gives you flexibility and backup options.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mid-page CTA */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <SeoCtaBlock
                pageType="problem"
                variant="section"
                jurisdiction="england"
                pagePath="/section-8-vs-section-21"
                title="Get Both Notices in One Pack"
                description="Our Notice Only Pack includes Section 21 and Section 8 with all relevant grounds. AI compliance checking ensures your notices are valid."
              />
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <FAQSection
          faqs={section8VsSection21FAQs}
          title="Section 8 vs Section 21: Frequently Asked Questions"
          showContactCTA={false}
          variant="gray"
        />

        {/* Final CTA */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <SeoCtaBlock
                pageType="problem"
                variant="final"
                jurisdiction="england"
                pagePath="/section-8-vs-section-21"
                title="Get Your Eviction Notices Now"
                description="Section 21 & Section 8 included. AI compliance check. Court-ready format."
              />

              <SeoDisclaimer className="max-w-4xl mx-auto" />
            </div>
          </div>
        </section>

        {/* Related Resources */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <RelatedLinks
                title="Related Eviction Resources"
                links={[
                  guideLinks.howToEvictTenant,
                  productLinks.noticeOnly,
                  productLinks.completePack,
                  toolLinks.section21Validator,
                  toolLinks.section8Validator,
                  blogLinks.whatIsSection21,
                  blogLinks.section21VsSection8,
                ]}
              />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
