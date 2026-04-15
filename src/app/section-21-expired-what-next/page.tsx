import { Metadata } from 'next';
import {
  StructuredData,
  breadcrumbSchema,
  articleSchema,
} from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo/urls';
import { SocialProofCounter } from '@/components/ui/SocialProofCounter';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { SeoCtaBlock, SeoDisclaimer } from '@/components/seo/SeoCtaBlock';
import { FAQSection } from '@/components/seo/FAQSection';
import { SeoLandingWrapper } from '@/components/seo/SeoLandingWrapper';
import { SeoPageContextPanel } from '@/components/seo/SeoPageContextPanel';
import { currentEnglandFrameworkLinks, evictionRelatedLinks } from '@/lib/seo/internal-links';
import { FunnelCta } from '@/components/funnels';
import { PRODUCTS } from '@/lib/pricing/products';
import {
  CheckCircle,
  AlertTriangle,
  FileText,
  Shield,
  Gavel,
  AlertCircle,
} from 'lucide-react';

const completePackProductHref = '/products/complete-pack';
const noticeOnlyProductHref = '/products/notice-only';
const currentEnglandRouteLinks = currentEnglandFrameworkLinks.filter((link) =>
  [
    '/renters-rights-act-eviction-rules',
    '/section-8-notice',
    '/form-3-section-8',
    '/eviction-process-england',
  ].includes(link.href)
);

const faqs = [
  {
    question: 'My Section 21 has expired and the tenant is still there. What do I do next?',
    answer:
      'If your Section 21 notice has expired and the tenant is still in occupation, the next step is usually the court possession stage. Landlords should normally check the notice is still usable, prepare the correct possession paperwork, and move into the court route rather than trying to remove the tenant themselves.',
  },
  {
    question: 'Do I need to serve a new Section 21 if the tenant did not leave?',
    answer:
      'Not always. In many cases, landlords still have a window to start court proceedings after the expiry date on the notice. But that does not last forever, so it is important to check the dates carefully before assuming the original notice can still be used.',
  },
  {
    question: 'Can I change the locks after Section 21 expires?',
    answer:
      'No. If the tenant is still in occupation, landlords should not change locks, remove belongings, cut off utilities or try to force a move-out. Possession normally still has to be recovered through the legal court and enforcement process.',
  },
  {
    question: 'What court form is usually used after a Section 21 expires?',
    answer:
      'Where the case fits the accelerated possession route, landlords often look at Form N5B. But that route is not suitable for every case, especially where the landlord also wants the court to deal with rent arrears in the same claim.',
  },
  {
    question: 'How long does it take after a Section 21 expires?',
    answer:
      'It can still take weeks or months after expiry, depending on the court, the paperwork, whether the tenant responds or defends the claim, and whether enforcement is later needed.',
  },
  {
    question: 'What if the tenant defends the possession claim?',
    answer:
      'If the tenant raises a defence, the claim can become slower and more document-sensitive. Defences often focus on notice validity, service, deposit issues, or other compliance-related points.',
  },
  {
    question: 'What if the tenant still will not leave after the possession order?',
    answer:
      'If the tenant remains after the possession order date, landlords usually need to move to enforcement rather than trying to recover possession personally.',
  },
  {
    question: 'What is the biggest mistake after a Section 21 expires?',
    answer:
      'The biggest mistake is assuming the expiry date means the landlord can simply retake the property. The real risk is usually invalid paperwork, delay in starting the claim, or trying to take unlawful self-help steps instead of using the possession process properly.',
  },
];

export { UNIVERSAL_HERO_VIEWPORT as viewport } from '@/lib/seo/hero-theme';

export const metadata: Metadata = {
  title: 'Section 21 Expired: What Next If Tenant Stays? | England Guide 2026',
  description:
    'Plain-English landlord guide to what happens after a Section 21 expires if the tenant is still in the property, including court and enforcement next steps.',
  keywords: [
    'section 21 expired what next',
    'tenant ignored section 21',
    'section 21 eviction after expiry',
    'accelerated possession procedure',
    'n5b form',
    'tenant not leaving after section 21',
    'possession order section 21',
    'section 21 court action',
    'section 21 expired tenant still in property',
    'what happens after section 21 expires',
    'section 21 notice expired tenant wont leave',
  ],
  openGraph: {
    title: 'Section 21 Expired: What Next If Tenant Stays? | England Guide 2026',
    description:
      'Your Section 21 notice has expired but the tenant has not left. Learn the next possession and enforcement steps for England landlords.',
    type: 'article',
    url: getCanonicalUrl('/section-21-expired-what-next'),
    siteName: 'Landlord Heaven',
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Section 21 Expired: What Next If Tenant Stays?',
    description:
      'Landlord guide to what to do next when a Section 21 has expired and the tenant is still in place.',
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

      <StructuredData
        data={articleSchema({
          headline: 'Section 21 Expired: What to Do When Your Tenant Will Not Leave',
          description:
            'Step-by-step guide to the next steps after a Section 21 notice expires, including possession claims, N5B route checks and enforcement.',
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

      <main className="text-gray-900">
        <HeaderConfig mode="autoOnScroll" />

        <UniversalHero
          title="Section 21 Expired: What to Do Next"
          subtitle="If your Section 21 has expired and the tenant is still in the property, the next step is usually the court route. This guide shows what to do next, what to avoid, and when the N5B route may fit."
          primaryCta={{
            label: `Start complete eviction pack - ${PRODUCTS.complete_pack.displayPrice}`,
            href: completePackProductHref,
          }}
          secondaryCta={{ label: 'Jump to key steps', href: '#next-steps' }}
          showTrustPositioningBar
          hideMedia
        />

        <section className="py-8 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <SeoPageContextPanel pathname="/section-21-expired-what-next" className="mb-6" />
              <FunnelCta
                title="Move to possession order support now"
                subtitle="When a Section 21 expires, landlords usually need to move into the court stage with a cleaner file and clearer route plan."
                primaryHref={completePackProductHref}
                primaryText="Get complete pack"
                primaryDataCta="complete-pack"
                location="above-fold"
                secondaryLinks={[
                  {
                    href: noticeOnlyProductHref,
                    text: 'Need to (re)serve notice first?',
                    dataCta: 'notice-only',
                  },
                  { href: '/n5b-form-guide', text: 'Accelerated possession (N5B)' },
                ]}
              />
            </div>
          </div>
        </section>

        <section className="pb-8 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <RelatedLinks
                title="Current England route after Section 21 search intent"
                links={currentEnglandRouteLinks}
              />
            </div>
          </div>
        </section>

        <section className="py-6 bg-gray-50 border-y border-gray-100">
          <div className="container mx-auto px-4">
            <SocialProofCounter variant="total" className="justify-center" />
          </div>
        </section>

        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto bg-white rounded-2xl border border-gray-100 shadow-sm p-8 md:p-10">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                What happens when Section 21 expires?
              </h2>
              <p className="text-gray-600 text-center mb-10 max-w-3xl mx-auto">
                When the expiry date on the notice passes and the tenant is still in occupation, the
                matter usually moves from the notice stage to the court possession stage.
              </p>

              <div className="space-y-5 text-gray-700 leading-relaxed">
                <p>
                  This is one of the biggest areas of confusion for landlords. A Section 21 expiry
                  date does <strong>not</strong> usually mean the landlord can simply take the property
                  back. If the tenant remains, possession generally still has to be recovered through
                  the proper legal route.
                </p>

                <p>
                  In practical terms, the next questions are usually these: is the notice still usable,
                  does the case fit the accelerated possession route, is the paperwork strong enough to
                  file, and what happens if the tenant still does not leave after the possession order.
                </p>

                <p>
                  That is why this page should not just say “apply to court.” The real issue is whether
                  the landlord is moving into court with the right route, the right timing and the right
                  supporting documents.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Key points after a Section 21 expires
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-3xl mx-auto">
                These are the points landlords usually need to understand before doing anything else.
              </p>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm text-center">
                  <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-7 h-7 text-green-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">The notice may still be usable</h3>
                  <p className="text-gray-600 text-sm">
                    In many cases there is still a window to start the possession claim after expiry,
                    but landlords should check the dates carefully.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm text-center">
                  <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Gavel className="w-7 h-7 text-red-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Court action is usually required</h3>
                  <p className="text-gray-600 text-sm">
                    If the tenant stays, landlords normally need to move to the court possession stage
                    rather than trying to recover the property themselves.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm text-center">
                  <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-7 h-7 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">The N5B route may be relevant</h3>
                  <p className="text-gray-600 text-sm">
                    Where the case fits the accelerated possession route, landlords often consider N5B,
                    but that route is not right for every case.
                  </p>
                </div>
              </div>

              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-900 font-medium">Do not try to evict personally</p>
                    <p className="text-red-800 text-sm">
                      If the tenant is still in occupation, landlords should not change locks, cut
                      services, remove belongings or try to force a move-out outside the proper
                      possession and enforcement process.
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
                title="Ready to file accelerated possession?"
                subtitle="Avoid delay by preparing the court bundle properly from the start."
                primaryHref="/products/complete-pack"
                primaryText="Start complete eviction pack"
                primaryDataCta="complete-pack"
                location="mid"
                secondaryLinks={[{ href: '/n5b-form-guide', text: 'Read N5B form guide' }]}
              />
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto bg-white rounded-2xl border border-gray-200 shadow-sm p-8 md:p-10">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                How long is your Section 21 usable after expiry?
              </h2>
              <p className="text-gray-600 text-center mb-10 max-w-3xl mx-auto">
                Landlords often assume they must immediately start again with a new notice. That is not
                always the case, but timing still matters.
              </p>

              <div className="space-y-5 text-gray-700 leading-relaxed">
                <p>
                  In many cases, there is still a period after the expiry date during which the
                  landlord can start possession proceedings based on the original notice. But that
                  period does not last indefinitely.
                </p>

                <p>
                  The key practical point is this: once the notice has expired and the tenant is still
                  there, landlords should not simply wait and hope. Delay can create more risk,
                  especially if the claim is not started within the usable window for the notice.
                </p>

                <p>
                  If too much time passes, the landlord may need to start again with a fresh notice and
                  a fresh waiting period, which can add significant delay to the case.
                </p>
              </div>

              <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                <p className="text-blue-900 text-sm">
                  <strong>Practical takeaway:</strong> check the notice dates now, not later. Many
                  landlord delays happen because the notice was still usable, but nobody moved the case
                  forward in time.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="accelerated-procedure" className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Accelerated possession procedure after Section 21
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-3xl mx-auto">
                Where the case fits, landlords often look at the accelerated possession route because it
                can be more document-led than the standard court route.
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-red-600" />
                    What landlords usually need
                  </h3>
                  <ul className="space-y-3 text-gray-700 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>The tenancy agreement</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>The notice relied on</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Proof of service or service evidence</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>The claim form and supporting papers for the route used</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-red-600" />
                    Why landlords often prefer it
                  </h3>
                  <ul className="space-y-3 text-gray-700 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Often more document-led than the standard route</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Can feel more straightforward in cleaner cases</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Usually focused on possession rather than combining everything into one claim</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Often attractive where the landlord wants the quickest clean route possible</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-8 bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-amber-900 font-medium">Main limitation</p>
                    <p className="text-amber-800 text-sm">
                      Landlords often choose the accelerated route when they mainly want possession.
                      If the case is really about arrears or wider issues, the standard route may be
                      more suitable.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="next-steps" className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Next steps: from expired notice to possession
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-3xl mx-auto">
                Once the tenant stays beyond the notice expiry date, landlords usually move through
                these stages.
              </p>

              <div className="space-y-6">
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-white">1</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Review the notice and dates</h3>
                      <p className="text-gray-700">
                        Before doing anything else, confirm the notice is still usable and the dates,
                        service evidence and supporting documents all line up.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-white">2</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Choose the court route</h3>
                      <p className="text-gray-700">
                        Decide whether the accelerated route fits the case or whether the standard
                        possession route is more appropriate.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-white">3</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Prepare the possession bundle</h3>
                      <p className="text-gray-700">
                        Gather the claim form, tenancy agreement, notice, service evidence and any
                        supporting documents needed for the route used.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-white">4</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Issue the claim</h3>
                      <p className="text-gray-700">
                        File the possession claim through the correct court route and pay the issue fee.
                        The tenant then has the opportunity to respond.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Move to enforcement if needed</h3>
                      <p className="text-gray-700">
                        If possession is granted but the tenant still remains, the next stage is usually
                        enforcement rather than personal action by the landlord.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                What if the tenant defends the claim?
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-3xl mx-auto">
                A defence does not always mean the landlord loses, but it usually means the paperwork
                and compliance position come under much closer scrutiny.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Notice validity arguments</h3>
                      <p className="text-gray-700 text-sm">
                        Tenants may argue that the notice itself, the dates, or the service process
                        were not correct.
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
                      <h3 className="font-bold text-gray-900 mb-2">Document and compliance issues</h3>
                      <p className="text-gray-700 text-sm">
                        Supporting documents, service evidence and route assumptions often become the
                        main battleground in defended cases.
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
                      <h3 className="font-bold text-gray-900 mb-2">Requests for more time</h3>
                      <p className="text-gray-700 text-sm">
                        Even where the landlord is broadly right, tenants may still seek time or raise
                        circumstances that affect the pace of the process.
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
                      <h3 className="font-bold text-gray-900 mb-2">Route suitability issues</h3>
                      <p className="text-gray-700 text-sm">
                        A defence can expose that the accelerated route was not as clean a fit as the
                        landlord first assumed.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 bg-blue-50 rounded-xl p-6 border border-blue-200">
                <div className="flex items-start gap-4">
                  <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Best practical approach
                    </h4>
                    <p className="text-gray-700 text-sm">
                      Build the file as if the tenant might defend it. Clean service evidence,
                      consistent dates and a properly organised document bundle matter more than most
                      landlords expect.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Expected timeline after the notice expires
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-3xl mx-auto">
                Timing varies by court and case complexity, but landlords should expect the process to
                continue for some time after the notice expiry date.
              </p>

              <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
                <div className="space-y-4">
                  <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                    <div className="w-28 text-sm font-medium text-gray-500">Stage 1</div>
                    <div className="flex-1">
                      <span className="font-medium text-gray-900">
                        Notice expires and tenant remains in occupation
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                    <div className="w-28 text-sm font-medium text-gray-500">Stage 2</div>
                    <div className="flex-1">
                      <span className="font-medium text-gray-900">
                        Landlord checks dates, route and supporting documents
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                    <div className="w-28 text-sm font-medium text-gray-500">Stage 3</div>
                    <div className="flex-1">
                      <span className="font-medium text-gray-900">
                        Possession claim issued and served
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                    <div className="w-28 text-sm font-medium text-gray-500">Stage 4</div>
                    <div className="flex-1">
                      <span className="font-medium text-gray-900">
                        Court reviews papers or deals with defence / hearing issues
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 bg-amber-50 rounded-lg p-4 -mx-4">
                    <div className="w-28 text-sm font-medium text-amber-700">Stage 5</div>
                    <div className="flex-1">
                      <span className="font-medium text-amber-900">
                        Possession order granted, then enforcement if tenant still stays
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <p className="text-gray-700">
                    <strong>Practical reality:</strong> even where the landlord has done things
                    properly, the process can still take weeks or months after notice expiry. Delay is
                    exactly why strong paperwork and prompt action matter.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <SeoCtaBlock
                pageType="court"
                variant="section"
                jurisdiction="england"
                pagePath="/section-21-expired-what-next"
                title="Get All Court Forms Ready to Submit"
                description="N5B route support, supporting statements and clearer filing instructions for the possession stage after notice expiry."
              />
            </div>
          </div>
        </section>

        <FAQSection
          faqs={faqs}
          title="Section 21 Expired: Frequently Asked Questions"
          showContactCTA={false}
          variant="gray"
        />

        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <SeoCtaBlock
                pageType="court"
                variant="final"
                jurisdiction="england"
                pagePath="/section-21-expired-what-next"
                title="Ready to Move to Possession?"
              description="Get the court-stage documents, route guidance, and practical next steps you need after your Section 21 expires."
              />

              <SeoDisclaimer className="max-w-4xl mx-auto" />
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <RelatedLinks
                title="Related Resources"
                links={evictionRelatedLinks}
              />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

