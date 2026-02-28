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
  possessionClaimRelatedLinks,
} from '@/lib/seo/internal-links';
import { buildWizardLink } from '@/lib/wizard/buildWizardLink';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { SeoCtaBlock, SeoDisclaimer } from '@/components/seo/SeoCtaBlock';
import { FAQSection } from '@/components/seo/FAQSection';
import { SeoLandingWrapper } from '@/components/seo/SeoLandingWrapper';
import { section21ExpiredFAQs } from '@/data/faqs';
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
  Calendar,
  AlertCircle,
  ChevronRight,
  Users,
  XCircle,
  Timer,
  MapPin,
} from 'lucide-react';

const completePackLink = buildWizardLink({
  product: 'complete_pack',
  jurisdiction: 'england',
  src: 'seo_section_21_expired_what_next',
  topic: 'eviction',
});

const noticeOnlyLink = buildWizardLink({
  product: 'notice_only',
  jurisdiction: 'england',
  src: 'seo_section_21_expired_what_next',
  topic: 'eviction',
});

export const metadata: Metadata = {
  title: 'Section 21 Expired What Next? | Tenant Ignored Notice | Landlord Heaven',
  description:
    'Section 21 expired but tenant won\'t leave? Next steps: possession order, accelerated procedure, and bailiff enforcement.',
  keywords: [
    'section 21 expired what next',
    'tenant ignored section 21',
    'section 21 eviction after expiry',
    'accelerated possession procedure',
    'n5b form',
    'tenant not leaving after section 21',
    'possession order section 21',
    'section 21 court action',
  ],
  openGraph: {
    title: 'Section 21 Expired What Next? | Tenant Ignored Notice | Landlord Heaven',
    description:
      'Your Section 21 notice has expired but your tenant has not left. Learn the next steps for court action.',
    type: 'article',
    url: getCanonicalUrl('/section-21-expired-what-next'),
    siteName: 'Landlord Heaven',
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Section 21 Expired What Next? | Landlord Heaven',
    description: 'Your Section 21 notice has expired but your tenant has not left. Learn the next steps.',
  },
  alternates: {
    canonical: getCanonicalUrl('/section-21-expired-what-next'),
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function Section21ExpiredPage() {
  return (
    <>
      <SeoLandingWrapper
        pagePath="/section-21-expired-what-next"
        pageTitle="Section 21 Expired What Next"
        pageType="court"
        jurisdiction="england"
      />

      {/* Structured Data */}
      <StructuredData
        data={articleSchema({
          headline: 'Section 21 Expired: What to Do When Your Tenant Will Not Leave',
          description:
            'Step-by-step guide to the next steps after your Section 21 notice expires. Accelerated possession, court forms, and bailiff enforcement explained.',
          url: getCanonicalUrl('/section-21-expired-what-next'),
          datePublished: '2026-01-30',
          dateModified: '2026-01-30',
        })}
      />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: getCanonicalUrl('/') },
          { name: 'Eviction Guides', url: getCanonicalUrl('/how-to-evict-tenant') },
          { name: 'Eviction Process England', url: getCanonicalUrl('/eviction-process-england') },
          { name: 'Section 21 Expired', url: getCanonicalUrl('/section-21-expired-what-next') },
        ])}
      />

      <main>
        <HeaderConfig mode="autoOnScroll" />
        <UniversalHero
          title="Section 21 Expired: What to Do Next"
          subtitle="Move from an expired Section 21 notice to the correct possession claim steps and enforcement route."
          primaryCta={{ label: 'Continue with Eviction Wizard', href: completePackLink }}
          secondaryCta={{ label: 'Jump to key steps', href: '#next-steps' }}
          showTrustPositioningBar
          hideMedia
        />

        <section className="py-8 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <FunnelCta
                title="Move to possession order support now"
                subtitle="When a Section 21 expires, the next step is the court route. We can prepare the full pack for you."
                primaryHref="/products/complete-pack"
                primaryText="Get Complete Pack"
                primaryDataCta="complete-pack"
                location="above-fold"
                secondaryLinks={[
                  { href: '/products/notice-only', text: 'Need to (re)serve notice first?', dataCta: 'notice-only' },
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

        {/* Key Points Section */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                What Happens When Section 21 Expires
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                When your Section 21 notice period ends and the tenant is still in the property, you
                enter the court phase. Understanding your options is crucial.
              </p>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                {/* Key Fact 1 */}
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm text-center">
                  <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-7 h-7 text-green-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Notice Still Valid</h3>
                  <p className="text-gray-600 text-sm">
                    Your Section 21 remains valid for <strong>6 months after expiry</strong>. You do
                    not need to serve a new notice.
                  </p>
                </div>

                {/* Key Fact 2 */}
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm text-center">
                  <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Gavel className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Court Action Required</h3>
                  <p className="text-gray-600 text-sm">
                    You <strong>cannot</strong> change locks or remove the tenant. You must apply
                    for a court possession order.
                  </p>
                </div>

                {/* Key Fact 3 */}
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm text-center">
                  <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-7 h-7 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Use Form N5B</h3>
                  <p className="text-gray-600 text-sm">
                    The <strong>accelerated possession procedure</strong> (Form N5B) means no court
                    hearing is needed.
                  </p>
                </div>
              </div>

              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-900 font-medium">Do Not Attempt to Evict Yourself</p>
                    <p className="text-red-800 text-sm">
                      Changing locks, cutting utilities, or removing belongings without a court
                      order is <strong>illegal eviction</strong>—a criminal offence under the
                      Protection from Eviction Act 1977. You could face prosecution and fines.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-10 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <FunnelCta
                title="Ready to file accelerated possession (N5B)?"
                subtitle="Avoid delays by preparing the court bundle correctly from the start."
                primaryHref="/products/complete-pack"
                primaryText="Start complete eviction pack"
                primaryDataCta="complete-pack"
                location="mid"
                secondaryLinks={[{ href: '/n5b-form-guide', text: 'Read N5B form guide' }]}
              />
            </div>
          </div>
        </section>

        {/* How Long is Notice Valid */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                How Long is Your Section 21 Valid After Expiry?
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                You have a window of time to start court proceedings. Missing this deadline means
                you will need to serve a completely new notice.
              </p>

              <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <div className="text-center">
                      <span className="text-4xl font-bold text-primary">6</span>
                      <p className="text-sm text-primary font-medium">Months</p>
                    </div>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      6-Month Window After Expiry
                    </h3>
                    <p className="text-gray-600 mb-4">
                      A Section 21 notice remains valid for <strong>6 months</strong> from the
                      possession date specified in the notice. You must start court proceedings
                      (submit Form N5B) within this period.
                    </p>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        No need to serve a new notice if within 6 months
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        Calculate from the date specified on the notice, not service date
                      </li>
                      <li className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                        If 6 months pass, you must serve a new Section 21 and wait again
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                <p className="text-blue-900 text-sm">
                  <strong>Example:</strong> Your Section 21 notice required the tenant to leave by 1
                  March 2026. You have until 1 September 2026 to submit your N5B court claim. After
                  that, you need a fresh notice.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Accelerated Possession Procedure */}
        <section id="accelerated-procedure" className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Accelerated Possession Procedure (Form N5B)
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                For Section 21 evictions, you can use the accelerated procedure which is faster and
                does not require a court hearing.
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                {/* What You Need */}
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Forms Required
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-primary">1</span>
                      </div>
                      <div>
                        <strong className="text-gray-900">Form N5B</strong>
                        <p className="text-sm text-gray-600">
                          Claim for possession (accelerated procedure)
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-primary">2</span>
                      </div>
                      <div>
                        <strong className="text-gray-900">Form N215</strong>
                        <p className="text-sm text-gray-600">Certificate of service of the notice</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-primary">3</span>
                      </div>
                      <div>
                        <strong className="text-gray-900">Copy of Section 21 Notice</strong>
                        <p className="text-sm text-gray-600">The original Form 6A you served</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-primary">4</span>
                      </div>
                      <div>
                        <strong className="text-gray-900">Copy of Tenancy Agreement</strong>
                        <p className="text-sm text-gray-600">The current AST for the property</p>
                      </div>
                    </li>
                  </ul>
                </div>

                {/* Benefits */}
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Why Use N5B (Accelerated)?
                  </h3>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-gray-900">No court hearing</strong>
                        <p className="text-sm">Judge reviews on paper—you do not need to attend</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-gray-900">Faster processing</strong>
                        <p className="text-sm">Typically 4-8 weeks if undefended</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-gray-900">Lower stress</strong>
                        <p className="text-sm">No need to prepare for or attend a hearing</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-gray-900">Same court fee</strong>
                        <p className="text-sm">£355—same as standard possession claim</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-8 bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-amber-900 font-medium">Limitation</p>
                    <p className="text-amber-800 text-sm">
                      You <strong>cannot</strong> claim rent arrears using the accelerated
                      procedure. To claim money owed, you need Form N5 (standard possession) or a
                      separate money claim via MCOL.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Step by Step Process */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Next Steps: From Expired Notice to Possession
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Follow this process after your Section 21 notice expires and the tenant refuses to
                leave.
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
                        Complete Court Forms (N5B + N215)
                      </h3>
                      <p className="text-gray-600 mb-3">
                        Fill out Form N5B with property details, tenancy information, and when you
                        served the Section 21. Complete Form N215 to certify you served the notice
                        correctly.
                      </p>
                      <div className="bg-gray-50 rounded-lg p-3 text-sm">
                        <span className="font-medium text-gray-900">Included in our pack:</span>
                        <span className="text-gray-600"> Pre-filled N5B, N215, and instructions</span>
                      </div>
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
                        Submit to County Court & Pay Fee
                      </h3>
                      <p className="text-gray-600 mb-3">
                        Submit your claim to the County Court that covers the property location. You
                        can submit online or by post. Include copies of your Section 21 notice and
                        tenancy agreement.
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="bg-gray-50 rounded-lg px-4 py-2">
                          <span className="text-gray-600">Court fee:</span>
                          <span className="font-bold text-gray-900 ml-1">£355</span>
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
                        Court Serves Tenant & Reviews
                      </h3>
                      <p className="text-gray-600 mb-3">
                        The court sends papers to the tenant, who has 14 days to respond. If they do
                        not defend, a judge reviews on paper. If defended, a hearing may be
                        scheduled.
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="bg-gray-50 rounded-lg px-4 py-2">
                          <span className="text-gray-600">Typical wait:</span>
                          <span className="font-bold text-gray-900 ml-1">4-8 weeks</span>
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
                        Possession Order Granted
                      </h3>
                      <p className="text-gray-600 mb-3">
                        If successful, the court grants a possession order. This gives the tenant
                        14-42 days to leave. The order is posted to both parties.
                      </p>
                      <div className="bg-green-50 rounded-lg p-3 text-sm text-green-800">
                        <CheckCircle className="w-4 h-4 inline mr-1" />
                        Most undefended Section 21 claims are successful
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
                        Warrant of Possession (If Still Refuses)
                      </h3>
                      <p className="text-gray-600 mb-3">
                        If the tenant still does not leave after the order date, apply for a warrant
                        of possession using Form N325. County court bailiffs will physically evict
                        the tenant.
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="bg-gray-50 rounded-lg px-4 py-2">
                          <span className="text-gray-600">Warrant fee:</span>
                          <span className="font-bold text-gray-900 ml-1">~£130</span>
                        </div>
                        <div className="bg-gray-50 rounded-lg px-4 py-2">
                          <span className="text-gray-600">Wait time:</span>
                          <span className="font-bold text-gray-900 ml-1">4-8 weeks</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What If Tenant Defends */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                What If the Tenant Defends the Claim?
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Tenants can challenge a Section 21 possession claim. Here are the common defences
                and how to handle them.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Deposit Issues</h3>
                      <p className="text-gray-600 text-sm">
                        Claims that deposit was not protected within 30 days or prescribed
                        information was not provided. This can invalidate Section 21.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Missing Documents</h3>
                      <p className="text-gray-600 text-sm">
                        Claims that EPC, gas safety certificate, or How to Rent guide were not
                        provided. All three are required for a valid Section 21.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Retaliatory Eviction</h3>
                      <p className="text-gray-600 text-sm">
                        If tenant complained about conditions and the council served an improvement
                        notice, Section 21 is blocked for 6 months.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Notice Validity</h3>
                      <p className="text-gray-600 text-sm">
                        Claims that notice was not in correct form (Form 6A), wrong dates, or not
                        properly served. Check your original notice carefully.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 bg-primary/5 rounded-xl p-6 border border-primary/20">
                <div className="flex items-start gap-4">
                  <Shield className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      If Defended, the Court May Schedule a Hearing
                    </h4>
                    <p className="text-gray-600 text-sm mb-3">
                      If the tenant files a defence, the judge may schedule a hearing to consider
                      both sides. You will need to provide evidence of compliance (deposit
                      protection certificate, proof of EPC provision, etc.).
                    </p>
                    <p className="text-gray-600 text-sm">
                      <strong>Pro tip:</strong> Keep copies of all documents you provided to the
                      tenant, with dates. Email confirmations are useful evidence.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Timeline Summary */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Expected Timeline After Notice Expires
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Here is a realistic timeline for the court process after your Section 21 expires.
              </p>

              <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
                <div className="space-y-4">
                  <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                    <div className="w-24 text-sm font-medium text-gray-500">Week 0</div>
                    <div className="flex-1">
                      <span className="font-medium text-gray-900">
                        Section 21 notice expires, tenant refuses to leave
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                    <div className="w-24 text-sm font-medium text-gray-500">Week 1-2</div>
                    <div className="flex-1">
                      <span className="font-medium text-gray-900">
                        Complete and submit Form N5B to court, pay £355 fee
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                    <div className="w-24 text-sm font-medium text-gray-500">Week 3-4</div>
                    <div className="flex-1">
                      <span className="font-medium text-gray-900">
                        Court serves tenant, 14-day response period
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                    <div className="w-24 text-sm font-medium text-gray-500">Week 5-8</div>
                    <div className="flex-1">
                      <span className="font-medium text-gray-900">
                        Judge reviews (if undefended), issues possession order
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                    <div className="w-24 text-sm font-medium text-gray-500">Week 8-10</div>
                    <div className="flex-1">
                      <span className="font-medium text-gray-900">
                        Tenant has 14-42 days to vacate per order
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 bg-amber-50 rounded-lg p-4 -mx-4">
                    <div className="w-24 text-sm font-medium text-amber-700">Week 10-18</div>
                    <div className="flex-1">
                      <span className="font-medium text-amber-900">
                        If still refuses: Apply for warrant, bailiff eviction
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total time (typical undefended case)</p>
                    <p className="text-2xl font-bold text-primary">8-18 weeks</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total court costs</p>
                    <p className="text-2xl font-bold text-primary">~£485</p>
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
                jurisdiction="england"
                pagePath="/section-21-expired-what-next"
                title="Get All Court Forms Ready to Submit"
                description="N5B, N215, witness statements, and step-by-step instructions. Everything you need to apply for a possession order after your Section 21 expires."
              />
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <FAQSection
          faqs={section21ExpiredFAQs}
          title="Section 21 Expired: Frequently Asked Questions"
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
                jurisdiction="england"
                pagePath="/section-21-expired-what-next"
                title="Ready to Apply for Possession?"
                description="Get court-ready N5B forms, witness statements, and clear instructions. Trusted by over 10,000 UK landlords."
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
                title="Related Resources"
                links={[
                  guideLinks.howToEvictTenant,
                  productLinks.completePack,
                  guideLinks.n5bFormGuide,
                  guideLinks.warrantOfPossession,
                  toolLinks.section21Validator,
                  guideLinks.evictionCostUk,
                ]}
              />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
