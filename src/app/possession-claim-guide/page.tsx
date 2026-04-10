import { Metadata } from 'next';
import Link from 'next/link';
import { StructuredData, breadcrumbSchema, faqPageSchema } from '@/lib/seo/structured-data';
import { SocialProofCounter } from '@/components/ui/SocialProofCounter';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { possessionClaimRelatedLinks } from '@/lib/seo/internal-links';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { SeoPageContextPanel } from '@/components/seo/SeoPageContextPanel';
import { SeoLandingWrapper } from '@/components/seo/SeoLandingWrapper';
import { SeoCtaBlock, SeoDisclaimer } from '@/components/seo/SeoCtaBlock';
import { FAQSection } from '@/components/seo/FAQSection';
import { PRODUCTS } from '@/lib/pricing/products';
import {
  CheckCircle,
  Clock,
  ArrowRight,
  Scale,
  FileText,
  Gavel,
  AlertTriangle,
  PoundSterling,
} from 'lucide-react';

const canonical = 'https://landlordheaven.co.uk/possession-claim-guide';
const completePackProductHref = '/products/complete-pack';

export { UNIVERSAL_HERO_VIEWPORT as viewport } from '@/lib/seo/hero-theme';

export const metadata: Metadata = {
  title: 'Possession Claim Guide | How Landlords Apply for Court Possession',
  description:
    'Plain-English landlord guide to possession claims in England, including N5, N5B, court fees, timelines, hearings, and the paperwork landlords usually need before applying.',
  keywords: [
    'possession claim',
    'court possession order',
    'n5 form',
    'n5b form',
    'accelerated possession',
    'possession proceedings',
    'apply for possession order',
    'county court possession',
    'eviction court process',
    'landlord possession claim',
  ],
  alternates: {
    canonical,
  },
  openGraph: {
    title: 'Possession Claim Guide | Court Possession Process for Landlords',
    description:
      'Landlord guide to the court possession process, including N5, N5B, hearing stages, and what usually happens after notice expires.',
    type: 'article',
    url: canonical,
  },
};

const faqs = [
  {
    question: 'What is a possession claim?',
    answer:
      'A possession claim is a court application asking for an order that requires the tenant to leave the property. Landlords usually make a possession claim after serving a valid eviction notice and waiting for the notice period to expire.',
  },
  {
    question: 'What is the difference between N5 and N5B?',
    answer:
      'Form N5 is generally used for standard possession claims, including most Section 8 routes and some non-accelerated claims. Form N5B is used for accelerated possession, usually after a Section 21 route, and is often decided on the paperwork without a hearing.',
  },
  {
    question: 'How much does a possession claim cost?',
    answer:
      'The usual court fee for issuing a possession claim is £355. If the tenant does not leave after the possession order and you need county court bailiffs, there is usually an additional warrant fee.',
  },
  {
    question: 'How long does the possession claim process take?',
    answer:
      'Accelerated possession may move more quickly because it is often document-based. Standard possession usually takes longer because it includes a hearing stage. Overall timing depends heavily on court backlog, file quality, and whether the tenant files a defence.',
  },
  {
    question: 'Can a tenant defend a possession claim?',
    answer:
      'Yes. A tenant can file a defence. In practical terms, that often means the court looks more closely at the notice, the compliance position, the grounds relied on, and the evidence in the file.',
  },
  {
    question: 'What happens at a possession hearing?',
    answer:
      'At a possession hearing, the judge reviews the claim, hears the parties, and decides whether possession should be ordered. The hearing is usually focused on the legal route, the evidence, and whether the landlord has proved the claim properly.',
  },
  {
    question: 'Can I claim rent arrears in a possession claim?',
    answer:
      'In many standard possession claims, yes. That usually depends on the route being used and the paperwork filed. Accelerated possession is usually focused on possession rather than a combined arrears judgment.',
  },
  {
    question: 'What happens after a possession order is made?',
    answer:
      'If the court grants possession, it usually gives the tenant a period to leave. If the tenant still does not go, the landlord may then need to apply for enforcement, such as a warrant of possession.',
  },
];

export default function PossessionClaimGuidePage() {
  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Possession Claim Guide',
    description:
      'Plain-English landlord guide to applying for court possession in England, including N5 and N5B routes, court stages, and file preparation.',
    url: canonical,
  };

  return (
    <>
      <SeoLandingWrapper
        pagePath="/possession-claim-guide"
        pageTitle="Possession Claim Guide"
        pageType="court"
        jurisdiction="england"
      />

      <StructuredData data={pageSchema} />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          { name: 'Guides', url: 'https://landlordheaven.co.uk/how-to-evict-tenant' },
          { name: 'Possession Claim Guide', url: canonical },
        ])}
      />
      <StructuredData
        data={faqPageSchema(
          faqs.map((faq) => ({
            question: faq.question,
            answer: faq.answer,
          }))
        )}
      />

      <main>
        <HeaderConfig mode="autoOnScroll" />

        <UniversalHero
          title="Possession Claim Guide"
          subtitle="Understand when landlords use N5 or N5B, what paperwork the court usually expects, and how to prepare a stronger possession file once the notice stage has expired."
          primaryCta={{
            label: 'Start Complete Pack',
            href: completePackProductHref,
          }}
          secondaryCta={{
            label: 'Jump to key steps',
            href: '#before-you-apply',
          }}
          showTrustPositioningBar
          hideMedia
        >
          <p className="mt-6 text-sm text-white/90 md:text-base">
            This guide explains how landlords usually move from notice stage to
            court stage, what the difference is between accelerated possession and
            standard possession, what costs to expect, and where weak possession
            files usually go wrong.
          </p>
        </UniversalHero>

        <section className="py-8 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <SeoPageContextPanel pathname="/possession-claim-guide" />
            </div>
          </div>
        </section>

        <section className="py-6 bg-gray-50 border-y border-gray-100">
          <div className="container mx-auto px-4">
            <SocialProofCounter variant="total" className="justify-center" />
          </div>
        </section>

        <section id="before-you-apply" className="py-8 bg-amber-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-start gap-4">
                <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="font-bold text-amber-900 mb-1">Before You Apply</h2>
                  <p className="text-amber-800 text-sm">
                    Landlords usually need a valid notice in place before starting a
                    possession claim. If the notice stage is not complete yet, start
                    there first with{' '}
                    <Link
                      href="/section-21-notice-template"
                      className="underline hover:text-amber-900"
                    >
                      Section 21
                    </Link>{' '}
                    or{' '}
                    <Link
                      href="/section-8-notice-template"
                      className="underline hover:text-amber-900"
                    >
                      Section 8
                    </Link>
                    .
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Two Main Possession Claim Routes
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                The route usually depends on the notice you served, whether the
                claim is document-based, and whether you also need arrears dealt
                with in the same court action.
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-primary/5 rounded-2xl p-6 border-2 border-primary relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
                      Often Faster
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        Accelerated Possession
                      </h3>
                      <span className="text-sm text-gray-500">Form N5B</span>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4">
                    Usually used after a Section 21 route where the landlord is
                    asking mainly for possession and the court can often review the
                    paperwork without a full hearing.
                  </p>

                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Often document-based
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Usually quicker than standard possession
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Court issue fee still applies
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      Usually not the route for a combined arrears judgment
                    </li>
                  </ul>

                  <Link
                    href="/n5b-form-guide"
                    className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
                  >
                    Learn more about N5B
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                      <Scale className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        Standard Possession
                      </h3>
                      <span className="text-sm text-gray-500">Form N5</span>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4">
                    Usually used where the claim includes a hearing stage, such as
                    many Section 8 routes, and where the court needs to consider
                    the evidence and legal route more fully.
                  </p>

                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <Gavel className="w-4 h-4 text-primary" />
                      Usually involves a hearing
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4 text-primary" />
                      Often slower than accelerated possession
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <PoundSterling className="w-4 h-4 text-primary" />
                      Court issue fee still applies
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Can often sit alongside an arrears claim
                    </li>
                  </ul>

                  <Link
                    href={completePackProductHref}
                    className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
                  >
                    Get court forms in Complete Pack
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                The Possession Claim Process
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                What landlords usually move through once the notice period has
                expired and the tenant has not left.
              </p>

              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-primary">1</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">
                        Review the file before issue
                      </h3>
                      <p className="text-gray-600 mb-3">
                        Before making the claim, landlords usually review the notice,
                        service evidence, tenancy records, and compliance documents.
                        Weak files often fail because the court stage is started
                        before the notice stage has really been checked properly.
                      </p>
                      <p className="text-sm text-gray-500">
                        This is usually where Complete Pack becomes valuable.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-primary">2</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">
                        Complete the court forms
                      </h3>
                      <p className="text-gray-600 mb-3">
                        The landlord prepares the relevant possession paperwork,
                        usually N5B for accelerated possession or N5 and related
                        forms for standard possession. The key issue is not just
                        completing the form, but making sure the supporting file is
                        consistent with it.
                      </p>
                      <p className="text-sm text-gray-500">
                        Court forms are only as strong as the file behind them.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-primary">3</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">
                        Issue the claim with the court
                      </h3>
                      <p className="text-gray-600 mb-3">
                        The claim is filed with the county court together with the
                        issue fee. At that point, the court process formally starts
                        and the tenant is served through the court process.
                      </p>
                      <p className="text-sm text-gray-500">
                        The usual issue fee is £355.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-primary">4</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">
                        The tenant may respond or defend
                      </h3>
                      <p className="text-gray-600 mb-3">
                        The tenant can respond to the claim. In practical terms,
                        this usually means the court looks more closely at the
                        notice, the route used, the grounds relied on, or the file
                        quality.
                      </p>
                      <p className="text-sm text-gray-500">
                        Defences often expose file weakness rather than create it.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-primary">5</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">
                        Paper decision or hearing
                      </h3>
                      <p className="text-gray-600 mb-3">
                        In accelerated possession, the judge may decide the case on
                        the papers if the file is clear enough. In standard
                        possession, the claim usually moves to a hearing where the
                        judge considers the route, evidence, and any defence.
                      </p>
                      <p className="text-sm text-gray-500">
                        Clear documents often make the difference here.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-primary">6</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">
                        Possession order and enforcement if needed
                      </h3>
                      <p className="text-gray-600 mb-3">
                        If the claim succeeds, the court usually makes a possession
                        order giving the tenant time to leave. If the tenant still
                        does not go, the landlord may then need to move to
                        enforcement.
                      </p>
                      <p className="text-sm text-gray-500">
                        The next stage is often a{' '}
                        <Link
                          href="/warrant-of-possession"
                          className="text-primary hover:underline"
                        >
                          warrant of possession
                        </Link>
                        .
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
            <div className="max-w-4xl mx-auto">
              <SeoCtaBlock
                pageType="court"
                variant="section"
                jurisdiction="england"
                title="Get The Court Forms And Guidance Together"
                description="Complete Pack is built for landlords who have already moved beyond notice stage and need the court paperwork, supporting templates, and filing guidance together."
              />
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Possession Claim Costs
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                The court fee is only one part of the overall possession-stage
                cost. Landlords usually also need to think about enforcement and
                whether weak preparation creates delay or repeat work.
              </p>

              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left p-4 font-semibold text-gray-900">Item</th>
                      <th className="text-right p-4 font-semibold text-gray-900">Typical cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="p-4 text-gray-700">Possession claim issue fee</td>
                      <td className="p-4 text-right text-gray-700">£355</td>
                    </tr>
                    <tr>
                      <td className="p-4 text-gray-700">County court bailiff warrant</td>
                      <td className="p-4 text-right text-gray-700">Usually extra</td>
                    </tr>
                    <tr>
                      <td className="p-4 text-gray-700">Further enforcement or extra steps</td>
                      <td className="p-4 text-right text-gray-700">Varies</td>
                    </tr>
                    <tr className="bg-primary/5">
                      <td className="p-4 font-semibold text-gray-900">
                        Main cost risk
                      </td>
                      <td className="p-4 text-right font-semibold text-gray-900">
                        Delay from weak paperwork
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-6 text-center">
                <p className="text-gray-600 text-sm">
                  {`Complete Pack (${PRODUCTS.complete_pack.displayPrice}) helps landlords avoid piecing the court stage together manually.`}
                </p>
                <Link
                  href="/eviction-cost-uk"
                  className="inline-flex items-center gap-2 text-primary font-medium mt-2 hover:underline"
                >
                  See full eviction cost breakdown
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <FAQSection faqs={faqs} includeSchema={false} showContactCTA={false} />

        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <SeoCtaBlock
                pageType="court"
                variant="final"
                jurisdiction="england"
                title="Move From Notice Stage To Court Stage Properly"
                description="Use Complete Pack if the notice stage is done and you now need the court forms, supporting templates, and filing guidance together."
              />

              <SeoDisclaimer className="max-w-4xl mx-auto" />
            </div>
          </div>
        </section>

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
