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
  scotlandRelatedLinks,
  productLinks,
  guideLinks,
  askHeavenLink,
} from '@/lib/seo/internal-links';
import { buildWizardLink } from '@/lib/wizard/buildWizardLink';
import { StandardHero } from '@/components/marketing/StandardHero';
import { SeoCtaBlock, SeoDisclaimer } from '@/components/seo/SeoCtaBlock';
import { FAQSection } from '@/components/seo/FAQSection';
import { SeoLandingWrapper } from '@/components/seo/SeoLandingWrapper';
import { evictionScotlandFAQs } from '@/data/faqs';
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
  MapPin,
  Home,
  MessageSquare,
} from 'lucide-react';

const completePackLink = buildWizardLink({
  product: 'complete_pack',
  jurisdiction: 'scotland',
  src: 'seo_eviction',
  topic: 'eviction',
});

const noticeOnlyLink = buildWizardLink({
  product: 'notice_only',
  jurisdiction: 'scotland',
  src: 'seo_eviction',
  topic: 'eviction',
});

export const metadata: Metadata = {
  title: 'Eviction Process Scotland | Notice to Leave & Tribunal | Landlord Heaven',
  description:
    'Complete guide to evicting a tenant in Scotland. Notice to Leave, 18 eviction grounds, First-tier Tribunal process. Get court-ready documents from £49.99.',
  keywords: [
    'eviction process scotland landlord',
    'eviction tribunal scotland',
    'notice to leave scotland',
    'prt eviction scotland',
    'private residential tenancy eviction',
    'scotland eviction grounds',
    'first tier tribunal housing scotland',
    'landlord eviction scotland',
  ],
  openGraph: {
    title: 'Eviction Process Scotland | Notice to Leave & Tribunal | Landlord Heaven',
    description:
      'Complete guide to evicting a tenant in Scotland. Notice to Leave, eviction grounds, and tribunal process.',
    type: 'article',
    url: getCanonicalUrl('/eviction-process-scotland'),
    siteName: 'Landlord Heaven',
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Eviction Process Scotland | Landlord Heaven',
    description: 'Complete guide to evicting a tenant in Scotland.',
  },
  alternates: {
    canonical: getCanonicalUrl('/eviction-process-scotland'),
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function EvictionProcessScotlandPage() {
  return (
    <>
      <SeoLandingWrapper
        pagePath="/eviction-process-scotland"
        pageTitle="Eviction Process Scotland"
        pageType="court"
        jurisdiction="scotland"
      />

      {/* Structured Data */}
      <StructuredData
        data={articleSchema({
          headline: 'Eviction Process Scotland: Complete Landlord Guide 2026',
          description:
            'Step-by-step guide to evicting a tenant in Scotland. Covers Notice to Leave, 18 eviction grounds, and First-tier Tribunal process.',
          url: getCanonicalUrl('/eviction-process-scotland'),
          datePublished: '2026-01-30',
          dateModified: '2026-01-30',
        })}
      />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: getCanonicalUrl('/') },
          { name: 'Eviction Guides', url: getCanonicalUrl('/how-to-evict-tenant') },
          { name: 'Eviction Process Scotland', url: getCanonicalUrl('/eviction-process-scotland') },
        ])}
      />

      <main>
        {/* Hero Section */}
        <StandardHero
          badge="Scotland"
          badgeIcon={<MapPin className="w-4 h-4" />}
          title="Eviction Process Scotland"
          subtitle="The complete guide to legally evicting a tenant in Scotland. Notice to Leave, 18 eviction grounds, and First-tier Tribunal explained."
          primaryCTA={{
            label: `Get Scotland Eviction Pack — ${PRODUCTS.complete_pack.displayPrice}`,
            href: completePackLink,
          }}
          secondaryCTA={{
            label: `Just Need the Notice? — ${PRODUCTS.notice_only.displayPrice}`,
            href: noticeOnlyLink,
          }}
          variant="pastel"
        >
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600 mt-4">
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-green-500" />
              Notice to Leave Template
            </span>
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              All 18 Grounds Covered
            </span>
            <span className="flex items-center gap-2">
              <Gavel className="w-4 h-4 text-green-500" />
              Tribunal Application
            </span>
          </div>
        </StandardHero>

        {/* Social Proof */}
        <section className="py-6 bg-gray-50 border-y border-gray-100">
          <div className="container mx-auto px-4">
            <SocialProofCounter variant="total" className="justify-center" />
          </div>
        </section>

        {/* Important Notice - No Section 21/8 */}
        <section className="py-8 bg-blue-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h2 className="font-bold text-blue-900 mb-1">Scotland Has Different Laws</h2>
                  <p className="text-blue-800 text-sm">
                    Scotland uses <strong>Notice to Leave</strong> and the{' '}
                    <strong>First-tier Tribunal for Scotland (Housing)</strong>—not Section 21 or
                    Section 8 which only apply in England. All private tenancies since December 2017
                    are Private Residential Tenancies (PRTs).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PRT Overview */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Private Residential Tenancy (PRT) Explained
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Since December 2017, all new private tenancies in Scotland are PRTs under the
                Private Housing (Tenancies) (Scotland) Act 2016.
              </p>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm text-center">
                  <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Home className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Open-Ended Tenancy</h3>
                  <p className="text-gray-600 text-sm">
                    PRTs have no fixed end date. They continue until the tenant gives notice or the
                    landlord uses a valid eviction ground.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm text-center">
                  <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Notice to Leave</h3>
                  <p className="text-gray-600 text-sm">
                    To evict, you must serve a Notice to Leave citing one or more of 18 grounds.
                    Notice periods range from 28-84 days.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm text-center">
                  <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Gavel className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">First-tier Tribunal</h3>
                  <p className="text-gray-600 text-sm">
                    If the tenant does not leave, apply to the First-tier Tribunal (Housing)—not
                    the county court like in England.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* The 18 Eviction Grounds */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                The 18 Eviction Grounds in Scotland
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Scotland has 18 grounds for eviction, split into mandatory (tribunal must grant)
                and discretionary (tribunal may grant) grounds.
              </p>

              {/* Mandatory Grounds */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-red-600" />
                  </span>
                  Mandatory Grounds (Tribunal Must Grant)
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="w-8 h-8 bg-red-100 rounded text-sm font-bold text-red-600 flex items-center justify-center">
                        1
                      </span>
                      <span className="font-bold text-gray-900">Landlord intends to sell</span>
                    </div>
                    <p className="text-gray-600 text-sm pl-11">
                      Property marketed for sale or already under offer
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="w-8 h-8 bg-red-100 rounded text-sm font-bold text-red-600 flex items-center justify-center">
                        2
                      </span>
                      <span className="font-bold text-gray-900">Property to be sold by lender</span>
                    </div>
                    <p className="text-gray-600 text-sm pl-11">
                      Mortgage lender is exercising power of sale
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="w-8 h-8 bg-red-100 rounded text-sm font-bold text-red-600 flex items-center justify-center">
                        3
                      </span>
                      <span className="font-bold text-gray-900">Landlord intends to refurbish</span>
                    </div>
                    <p className="text-gray-600 text-sm pl-11">
                      Substantial work needed that cannot be done with tenant in situ
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="w-8 h-8 bg-red-100 rounded text-sm font-bold text-red-600 flex items-center justify-center">
                        4
                      </span>
                      <span className="font-bold text-gray-900">Landlord/family moving in</span>
                    </div>
                    <p className="text-gray-600 text-sm pl-11">
                      Landlord or family member intends to live in property
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="w-8 h-8 bg-red-100 rounded text-sm font-bold text-red-600 flex items-center justify-center">
                        5
                      </span>
                      <span className="font-bold text-gray-900">Use for religious purpose</span>
                    </div>
                    <p className="text-gray-600 text-sm pl-11">
                      Property needed for religious purposes
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="w-8 h-8 bg-red-100 rounded text-sm font-bold text-red-600 flex items-center justify-center">
                        12
                      </span>
                      <span className="font-bold text-gray-900">Rent arrears (3+ months)</span>
                    </div>
                    <p className="text-gray-600 text-sm pl-11">
                      At least 3 consecutive months&apos; rent owed at notice AND hearing
                    </p>
                  </div>
                </div>
              </div>

              {/* Discretionary Grounds */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Scale className="w-4 h-4 text-amber-600" />
                  </span>
                  Discretionary Grounds (Tribunal May Grant)
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="w-8 h-8 bg-amber-100 rounded text-sm font-bold text-amber-600 flex items-center justify-center">
                        11
                      </span>
                      <span className="font-bold text-gray-900">Breach of tenancy</span>
                    </div>
                    <p className="text-gray-600 text-sm pl-11">
                      Tenant has breached terms of the tenancy agreement
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="w-8 h-8 bg-amber-100 rounded text-sm font-bold text-amber-600 flex items-center justify-center">
                        13
                      </span>
                      <span className="font-bold text-gray-900">Criminal conviction</span>
                    </div>
                    <p className="text-gray-600 text-sm pl-11">
                      Relevant conviction related to property or area
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="w-8 h-8 bg-amber-100 rounded text-sm font-bold text-amber-600 flex items-center justify-center">
                        14
                      </span>
                      <span className="font-bold text-gray-900">Antisocial behaviour</span>
                    </div>
                    <p className="text-gray-600 text-sm pl-11">
                      Tenant or visitor engaged in antisocial behaviour
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="w-8 h-8 bg-amber-100 rounded text-sm font-bold text-amber-600 flex items-center justify-center">
                        15
                      </span>
                      <span className="font-bold text-gray-900">Property association</span>
                    </div>
                    <p className="text-gray-600 text-sm pl-11">
                      Property used for criminal activity
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="w-8 h-8 bg-amber-100 rounded text-sm font-bold text-amber-600 flex items-center justify-center">
                        16
                      </span>
                      <span className="font-bold text-gray-900">Landlord registration revoked</span>
                    </div>
                    <p className="text-gray-600 text-sm pl-11">
                      Landlord no longer registered with local authority
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="w-8 h-8 bg-amber-100 rounded text-sm font-bold text-amber-600 flex items-center justify-center">
                        17
                      </span>
                      <span className="font-bold text-gray-900">HMO licence revoked</span>
                    </div>
                    <p className="text-gray-600 text-sm pl-11">
                      Property&apos;s HMO licence no longer valid
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 bg-primary/5 rounded-xl p-6 border border-primary/20">
                <div className="flex items-start gap-4">
                  <Shield className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Most Common Grounds</h4>
                    <p className="text-gray-600 text-sm">
                      The most frequently used grounds are: <strong>Ground 1</strong> (landlord
                      selling), <strong>Ground 4</strong> (landlord/family moving in),{' '}
                      <strong>Ground 12</strong> (rent arrears), and <strong>Ground 14</strong>{' '}
                      (antisocial behaviour).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Notice Periods */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Notice Periods in Scotland
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Notice periods depend on the ground used AND how long the tenant has lived in the
                property.
              </p>

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-4 font-semibold text-gray-900">Tenancy Length</th>
                        <th className="text-left p-4 font-semibold text-gray-900">Standard Grounds</th>
                        <th className="text-left p-4 font-semibold text-gray-900">
                          Conduct Grounds (11-18)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr>
                        <td className="p-4 font-medium text-gray-900">Less than 6 months</td>
                        <td className="p-4 text-gray-600">28 days</td>
                        <td className="p-4 text-gray-600">28 days</td>
                      </tr>
                      <tr className="bg-gray-50/50">
                        <td className="p-4 font-medium text-gray-900">6 months or more</td>
                        <td className="p-4 font-bold text-primary">84 days</td>
                        <td className="p-4 text-gray-600">28 days</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-8 grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    28 Days Notice
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      Tenancy under 6 months (any ground)
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      Conduct grounds 11-18 (any tenancy length)
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      Includes rent arrears, antisocial behaviour
                    </li>
                  </ul>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    84 Days Notice
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      Tenancy 6+ months (most grounds)
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      Grounds 1-10 (landlord circumstances)
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      Includes selling, moving in, refurbishment
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tribunal Process */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                First-tier Tribunal for Scotland
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                If your tenant does not leave after the Notice to Leave expires, apply to the
                First-tier Tribunal (Housing and Property Chamber).
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
                        Complete Application Form
                      </h3>
                      <p className="text-gray-600">
                        Download and complete the tribunal application form from the Scottish
                        Tribunals website. Include copies of Notice to Leave, tenancy agreement, and
                        evidence for your ground.
                      </p>
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
                        Submit to Tribunal
                      </h3>
                      <p className="text-gray-600">
                        Submit your application online or by post. There is no court fee for
                        housing tribunal applications in Scotland (unlike England).
                      </p>
                      <div className="mt-3 bg-green-50 rounded-lg p-3 text-sm text-green-800">
                        <CheckCircle className="w-4 h-4 inline mr-1" />
                        No application fee for housing tribunal cases
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
                        Tribunal Hearing
                      </h3>
                      <p className="text-gray-600">
                        The tribunal will schedule a hearing (typically 2-4 months wait). Both
                        parties can attend, present evidence, and make their case.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        Eviction Order
                      </h3>
                      <p className="text-gray-600">
                        If successful, the tribunal grants an eviction order. If the tenant still
                        refuses to leave, you can apply to Sheriff Officers for enforcement.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Rent Recovery in Scotland */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Recovering Rent Arrears in Scotland
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Scotland uses the Sheriff Court for money claims—not the County Court or MCOL used
                in England.
              </p>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-amber-900 mb-2">
                      Money Claim Pack is England Only
                    </h3>
                    <p className="text-amber-800 text-sm mb-4">
                      Our Money Claim Pack is designed for England&apos;s County Court and MCOL
                      system. For Scotland, you will need to use the Sheriff Court Simple Procedure
                      (claims under £5,000) or Ordinary Cause (claims £5,000-£100,000).
                    </p>
                    <div className="grid sm:grid-cols-2 gap-4 text-sm">
                      <div className="bg-white rounded-lg p-3">
                        <span className="font-bold text-amber-900 block">Simple Procedure</span>
                        <span className="text-amber-700">Claims under £5,000</span>
                      </div>
                      <div className="bg-white rounded-lg p-3">
                        <span className="font-bold text-amber-900 block">Ordinary Cause</span>
                        <span className="text-amber-700">Claims £5,000 - £100,000</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Ask Heaven Callout */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-purple-900 mb-2">
                      Questions About Scotland Eviction?
                    </h3>
                    <p className="text-purple-800 mb-4">
                      Scotland&apos;s eviction rules are different from England. Use our free Ask
                      Heaven tool to get answers specific to Scottish law and the First-tier
                      Tribunal process.
                    </p>
                    <Link
                      href="/ask-heaven"
                      className="inline-flex items-center text-purple-700 font-medium hover:text-purple-900"
                    >
                      Ask Heaven Free Q&A
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
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
                pageType="court"
                variant="section"
                jurisdiction="scotland"
                pagePath="/eviction-process-scotland"
                title="Get Your Scotland Eviction Documents"
                description="Notice to Leave template with all 18 grounds, tribunal application guidance, and step-by-step instructions for Scottish landlords."
              />
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <FAQSection
          faqs={evictionScotlandFAQs}
          title="Scotland Eviction: Frequently Asked Questions"
          showContactCTA={false}
          variant="gray"
        />

        {/* Final CTA */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <SeoCtaBlock
                pageType="court"
                variant="final"
                jurisdiction="scotland"
                pagePath="/eviction-process-scotland"
                title="Get Your Scotland Eviction Pack"
                description="Notice to Leave, tribunal guidance, and all 18 grounds covered. Designed for Scottish landlords."
              />

              <SeoDisclaimer className="max-w-4xl mx-auto" />
            </div>
          </div>
        </section>

        {/* Related Resources */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <RelatedLinks title="Related Scotland Resources" links={scotlandRelatedLinks} />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
