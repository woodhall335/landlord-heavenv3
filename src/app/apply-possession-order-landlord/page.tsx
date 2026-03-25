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
import { possessionClaimRelatedLinks } from '@/lib/seo/internal-links';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { SeoCtaBlock, SeoDisclaimer } from '@/components/seo/SeoCtaBlock';
import { FAQSection } from '@/components/seo/FAQSection';
import { SeoPageContextPanel } from '@/components/seo/SeoPageContextPanel';
import { SeoLandingWrapper } from '@/components/seo/SeoLandingWrapper';
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
  PoundSterling,
  Users,
} from 'lucide-react';

const completePackProductHref = '/products/complete-pack';
const noticeOnlyProductHref = '/products/notice-only';

const faqs = [
  {
    question: 'How do I apply for a possession order as a landlord?',
    answer:
      'If your notice has expired and the tenant is still in the property, the next step is usually to apply to court for possession. The route depends on the type of notice you served and whether you are also claiming rent arrears.',
  },
  {
    question: 'What is the difference between Form N5B and Form N5?',
    answer:
      'N5B is commonly associated with the accelerated possession route, usually where the landlord is relying on the notice route and not claiming rent arrears in the same claim. N5 is the standard possession route and is commonly used where a hearing is expected or where arrears or other grounds are involved.',
  },
  {
    question: 'Do I always need a court hearing for a possession order?',
    answer:
      'Not always. Some possession routes are more document-based, while others are more likely to involve a hearing. Whether a hearing takes place depends on the route, the paperwork and whether the tenant defends the claim.',
  },
  {
    question: 'How much does a possession claim cost?',
    answer:
      'Court fees can change, so landlords should check the current fee before filing. In addition to the issue fee, there can also be later enforcement costs if the tenant still does not leave after the possession order.',
  },
  {
    question: 'What if the tenant still does not leave after the possession order?',
    answer:
      'If the tenant remains after the possession order date, the landlord will usually need to move to enforcement, often through a warrant or bailiff process. A possession order alone does not always mean immediate vacant possession on the day stated.',
  },
  {
    question: 'Can I claim rent arrears at the same time as possession?',
    answer:
      'In some cases, yes. Whether you should do so depends on the notice route used, the facts of the case and the documents you want the court to consider.',
  },
  {
    question: 'What is the biggest mistake landlords make when applying for possession?',
    answer:
      'The biggest mistake is issuing a possession claim with weak paperwork, an invalid notice, or the wrong court route. That can cause delay, extra cost and in some cases failure of the claim.',
  },
  {
    question: 'Do I still need a warrant after I get possession?',
    answer:
      'Sometimes. If the tenant leaves in line with the order, enforcement may not be needed. If the tenant stays, landlords usually need to move on to the enforcement stage.',
  },
];

export const metadata: Metadata = {
  title: 'Apply for Possession Order | N5B, N5 and Court Process Explained',
  description:
    'How to apply for a possession order in England, including N5B and N5 routes.',
  keywords: [
    'apply for possession order landlord',
    'possession order landlord england',
    'possession claim landlord',
    'n5b form landlord',
    'n5 possession claim',
    'accelerated possession procedure',
    'court possession order',
    'landlord court forms',
    'how to apply for possession order',
    'possession claim after section 21',
    'possession claim after section 8',
  ],
  openGraph: {
    title: 'Apply for Possession Order | N5B, N5 and Court Process Explained',
    description:
      'How to apply for a possession order in England, including N5B and N5 routes, timelines, court fees and what happens after the order.',
    type: 'article',
    url: getCanonicalUrl('/apply-possession-order-landlord'),
    siteName: 'Landlord Heaven',
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Apply for Possession Order | Landlord Heaven',
    description:
      'How to apply for a possession order in England, including N5B and N5 routes.',
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
      <HeaderConfig mode="autoOnScroll" />
      <SeoLandingWrapper
        pagePath="/apply-possession-order-landlord"
        pageTitle="Apply for Possession Order Landlord"
        pageType="court"
        jurisdiction="england"
      />

      <StructuredData
        data={articleSchema({
          headline: 'How to Apply for a Possession Order: Landlord Guide 2026',
          description:
            'Complete guide to applying for a possession order in England. Covers N5B, N5, court fees, documents, timelines and what happens after the order is granted.',
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

      <main className="text-gray-900">
        <UniversalHero
          badge="England"
          badgeIcon={<Gavel className="w-4 h-4" />}
          title="Apply for a Possession Order"
          subtitle="Your notice has expired but the tenant is still in the property. Here is how England landlords move from notice stage to court possession using the correct claim route."
          primaryCta={{
            label: `Start Complete Eviction Pack — ${PRODUCTS.complete_pack.displayPrice}`,
            href: completePackProductHref,
          }}
          secondaryCta={{
            label: 'Need notice drafting instead?',
            href: noticeOnlyProductHref,
          }}
          variant="pastel"
        >
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-700 mt-4">
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-green-500" />
              N5B and N5 routes explained
            </span>
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              Court-stage guidance
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Clear next steps
            </span>
          </div>
        </UniversalHero>

        <section className="py-8 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <SeoPageContextPanel pathname="/apply-possession-order-landlord" className="mb-6" />
              <FunnelCta
                title="Apply for possession with full support"
                subtitle="If your notice has expired, move straight to the court stage with the complete pack."
                primaryHref={completePackProductHref}
                primaryText="Start complete pack"
                primaryDataCta="complete-pack"
                location="above-fold"
                secondaryLinks={[
                  { href: noticeOnlyProductHref, text: 'Only need notice drafting?', dataCta: 'notice-only' },
                  { href: '/n5b-form-guide', text: 'Accelerated possession (N5B)' },
                ]}
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
                When do you apply for a possession order?
              </h2>
              <p className="text-gray-600 text-center mb-10 max-w-3xl mx-auto">
                A possession claim usually begins after the notice stage has ended and the tenant is
                still in occupation.
              </p>

              <div className="space-y-5 text-gray-700 leading-relaxed">
                <p>
                  Serving notice does not usually give the landlord the property back automatically on
                  the expiry date. If the tenant remains, the next step is often to apply to the court
                  for a <strong>possession order</strong>.
                </p>

                <p>
                  This is where many landlords get stuck. They have served notice, the tenant has not
                  moved out, and they are unsure whether to use the accelerated route, the standard
                  possession route, or whether they need to include rent arrears as well.
                </p>

                <p>
                  The main practical questions are usually: was the notice valid, which possession
                  claim route applies, what documents should go in the bundle, and what happens if the
                  tenant still stays after the court order.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Types of possession claims
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-3xl mx-auto">
                There are two broad court routes landlords usually think about. The right one depends
                on the notice used, whether arrears are included, and how the case is being framed.
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-red-50 rounded-2xl p-6 border-2 border-red-200 relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
                      Often simpler
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center border border-red-200">
                      <span className="text-lg font-bold text-red-600">N5B</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Accelerated route</h3>
                      <span className="text-sm text-gray-500">Usually linked to the notice route</span>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4">
                    This route is commonly used where the landlord is relying on the notice route and
                    is not asking the court to deal with rent arrears in the same claim.
                  </p>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Typical format</span>
                      <span className="font-bold text-gray-900">More document-based</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Arrears claim included</span>
                      <span className="font-bold text-gray-900">Usually no</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Hearing</span>
                      <span className="font-bold text-green-600">Sometimes not needed</span>
                    </div>
                  </div>

                  <h4 className="font-semibold text-gray-900 mb-2">Usually considered when:</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                      The landlord is relying on the notice route
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                      The case is mainly about possession rather than money
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                      The paperwork is clean and well-organised
                    </li>
                  </ul>

                  <div className="mt-6 pt-4 border-t border-red-200">
                    <Link href="/n5b-form-guide" className="text-red-600 font-medium hover:underline inline-flex items-center gap-1">
                      Read the N5B guide
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center">
                      <span className="text-lg font-bold text-gray-700">N5</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Standard possession route</h3>
                      <span className="text-sm text-gray-500">Often used for grounds or arrears cases</span>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4">
                    This route is commonly used where the landlord is also pursuing arrears or relying
                    on grounds-based possession, and it is more likely to involve a hearing.
                  </p>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Typical format</span>
                      <span className="font-bold text-gray-900">More hearing-based</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Arrears claim included</span>
                      <span className="font-bold text-gray-900">Often yes</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Hearing</span>
                      <span className="font-bold text-amber-600">More likely</span>
                    </div>
                  </div>

                  <h4 className="font-semibold text-gray-900 mb-2">Usually considered when:</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      Rent arrears or grounds are central to the case
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      A fuller fact pattern needs to be presented
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      The case is not suitable for the accelerated route
                    </li>
                  </ul>
                </div>

                <div className="md:col-span-2">
                  <FunnelCta
                    title="Need the full case bundle?"
                    subtitle="We can prepare the possession paperwork and guide each filing step."
                    primaryHref="/products/complete-pack"
                    primaryText="Get full eviction support"
                    primaryDataCta="complete-pack"
                    location="mid"
                  />
                </div>
              </div>

              <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                <p className="text-blue-900 text-sm">
                  <strong>Practical point:</strong> landlords often focus too much on speed and not
                  enough on route suitability. A faster-looking route is not helpful if the notice or
                  paperwork does not support it.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                What documents landlords usually need
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-3xl mx-auto">
                A possession claim is often won or lost on paperwork quality. Good filing starts with
                a clean document bundle.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Core claim documents</h3>
                  <ul className="space-y-3 text-gray-700 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>The tenancy agreement</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>The notice served on the tenant</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Proof the notice was served</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>The relevant court claim form</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Supporting material</h3>
                  <ul className="space-y-3 text-gray-700 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Rent schedule if arrears are relevant</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Witness statement or supporting explanation if needed</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Deposit and compliance paperwork where relevant</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Any documents needed to support the route you are using</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-8 bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
                <p className="text-amber-900 text-sm">
                  <strong>Most common problem:</strong> landlords often have the “right” route in mind
                  but weak paperwork in practice. Missing service evidence or inconsistent dates can
                  create avoidable delay.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Court fees and practical costs
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-3xl mx-auto">
                Court issue fees are only part of the picture. Landlords should also think about
                later enforcement costs and the cost of delay.
              </p>

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-4 font-semibold text-gray-900">Item</th>
                        <th className="text-right p-4 font-semibold text-gray-900">Typical cost signal</th>
                        <th className="text-left p-4 font-semibold text-gray-900">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr>
                        <td className="p-4 font-medium text-gray-900">Possession claim issue fee</td>
                        <td className="p-4 text-right font-bold text-gray-900">Check current fee</td>
                        <td className="p-4 text-gray-600 text-sm">Court fees can change</td>
                      </tr>
                      <tr className="bg-gray-50/50">
                        <td className="p-4 font-medium text-gray-900">Enforcement stage</td>
                        <td className="p-4 text-right font-bold text-gray-900">Additional cost likely</td>
                        <td className="p-4 text-gray-600 text-sm">If tenant stays after the order</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-medium text-gray-900">Delay cost</td>
                        <td className="p-4 text-right font-bold text-gray-900">Often overlooked</td>
                        <td className="p-4 text-gray-600 text-sm">Lost rent, holdover and time costs</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-8 grid md:grid-cols-2 gap-6">
                <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                  <h3 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Check fees before filing
                  </h3>
                  <p className="text-green-800 text-sm">
                    Filing fees and enforcement costs can change. Landlords should always confirm the
                    current court fee at the point of issue.
                  </p>
                </div>

                <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
                  <h3 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Weak claims cost more
                  </h3>
                  <p className="text-amber-800 text-sm">
                    An invalid notice or poor document bundle can create extra delay and further cost,
                    even before enforcement is needed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                How to apply: step by step
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-3xl mx-auto">
                Landlords generally follow a sequence: review the notice, choose the route, prepare
                the bundle, issue the claim, then respond to whatever happens next.
              </p>

              <div className="space-y-6">
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-white">1</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Review the notice position</h3>
                      <p className="text-gray-700">
                        Before issuing a claim, check the notice, dates, service evidence and route
                        assumptions. This is the stage where many problems can still be fixed before
                        court papers go in.
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
                        Decide whether the case fits the more document-led route or the standard
                        possession path. Arrears, grounds and the quality of the notice often drive
                        that decision.
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
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Prepare the claim bundle</h3>
                      <p className="text-gray-700">
                        Gather the tenancy, notice, service evidence and supporting documents. Make
                        sure the dates and facts match across the whole file.
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
                        File the claim through the correct court route and pay the issue fee. Once the
                        claim is served, the tenant has the opportunity to respond.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-white">5</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Deal with defence, hearing or review</h3>
                      <p className="text-gray-700">
                        Some claims move quickly on paperwork, while others involve a hearing or a
                        defence. Good preparation before issue makes this stage much easier.
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
                        If the possession order is granted and the tenant still remains, landlords
                        usually need to move on to the enforcement stage rather than trying to recover
                        possession themselves.
                      </p>
                    </div>
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
                What happens at the hearing or review stage?
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-3xl mx-auto">
                Not every claim looks the same once filed. Some are decided more on documents, while
                others move into a more contested court process.
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-red-600" />
                    What landlords should be ready for
                  </h3>
                  <ul className="space-y-3 text-gray-700 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Questions about the notice and service</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Questions about rent, arrears or breach where relevant</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>The tenant raising a defence or asking for time</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>The court focusing closely on the paperwork quality</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Gavel className="w-5 h-5 text-red-600" />
                    Possible outcomes
                  </h3>
                  <ul className="space-y-3 text-gray-700 text-sm">
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <span>Possession order granted</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <span>Possession delayed or suspended on terms</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <span>Further hearing or evidence direction</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <span>Problems identified with the route or the paperwork</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-8 bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Main takeaway</h3>
                <p className="text-gray-700">
                  The court stage is not just about which form you used. It is about whether the whole
                  claim makes sense on the documents and whether the landlord can support the route
                  chosen with consistent evidence.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto bg-white rounded-2xl border border-gray-200 shadow-sm p-8 md:p-10">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                After the possession order: what if the tenant still does not leave?
              </h2>
              <p className="text-gray-600 text-center mb-10 max-w-3xl mx-auto">
                A possession order does not always end the matter. If the tenant remains, enforcement
                is usually the next stage.
              </p>

              <div className="flex flex-col md:flex-row items-start gap-8">
                <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Gavel className="w-10 h-10 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Enforcement and warrant stage
                  </h3>
                  <p className="text-gray-700 mb-4">
                    If the tenant does not leave by the date in the possession order, landlords often
                    need to move on to the enforcement stage. This is the point at which warrant or
                    bailiff-related action becomes relevant.
                  </p>

                  <p className="text-gray-700 mb-4">
                    This is also where many landlords realise that the possession order itself is not
                    the very end of the road. The court may have given possession, but the property is
                    not physically recovered until the tenant has actually left or enforcement has taken
                    place.
                  </p>

                  <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
                    <p className="text-amber-900 text-sm">
                      <strong>Important:</strong> even after obtaining a possession order, landlords
                      should not try to remove the tenant themselves. If enforcement is needed, it
                      normally has to happen through the proper court route.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 text-center">
                <Link
                  href="/warrant-of-possession"
                  className="text-red-600 font-medium hover:underline inline-flex items-center gap-1"
                >
                  Full warrant of possession guide
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <SeoCtaBlock
                pageType="court"
                variant="section"
                jurisdiction="england"
                pagePath="/apply-possession-order-landlord"
                title="Get All Court Forms Ready to Submit"
                description="N5B, N5 and supporting documents, with clearer court-stage guidance and step-by-step instructions."
              />
            </div>
          </div>
        </section>

        <FAQSection
          faqs={faqs}
          title="Possession Order: Frequently Asked Questions"
          showContactCTA={false}
          variant="white"
        />

        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <SeoCtaBlock
                pageType="court"
                variant="final"
                jurisdiction="england"
                pagePath="/apply-possession-order-landlord"
                title="Get Your Possession Claim Documents"
                description="Move from expired notice to court possession with the right paperwork, clearer guidance and practical next steps."
              />

              <SeoDisclaimer className="max-w-4xl mx-auto" />
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <RelatedLinks title="Related Resources" links={possessionClaimRelatedLinks} />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}


