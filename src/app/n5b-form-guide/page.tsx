import { Metadata } from 'next';
import Link from 'next/link';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { SocialProofCounter } from '@/components/ui/SocialProofCounter';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { SeoPageContextPanel } from '@/components/seo/SeoPageContextPanel';
import { n5bFormRelatedLinks } from '@/lib/seo/internal-links';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { SeoCtaBlock, SeoDisclaimer } from '@/components/seo/SeoCtaBlock';
import { FAQSection } from '@/components/seo/FAQSection';
import {
  CheckCircle,
  Clock,
  ArrowRight,
  FileText,
  Shield,
  AlertTriangle,
  Gavel,
  X,
} from 'lucide-react';
import { PRODUCTS } from '@/lib/pricing/products';

const completePackHref = '/products/complete-pack';

const faqs = [
  {
    question: 'What is Form N5B used for?',
    answer:
      'Form N5B is commonly used for the accelerated possession route in England. Landlords usually look at this route where they are relying on the notice route and are not asking the court to deal with rent arrears in the same claim.',
  },
  {
    question: 'Can I use N5B if I want rent arrears as well?',
    answer:
      'Usually landlords do not use the N5B accelerated route where they want the court to deal with rent arrears in the same possession claim. In that kind of situation, the standard possession route is often the more relevant one.',
  },
  {
    question: 'Do I always get a hearing with Form N5B?',
    answer:
      'Not always. One reason landlords look at N5B is that it is often more document-led than the standard route. But a hearing can still arise if the paperwork is challenged or the court needs more from the parties.',
  },
  {
    question: 'Do I need a valid Section 21 notice before using N5B?',
    answer:
      'Yes, landlords usually consider N5B only after the relevant notice route has been properly used and the notice period has expired. If the notice is invalid or the route is wrong, the possession claim can run into trouble.',
  },
  {
    question: 'How long does the N5B process take?',
    answer:
      'Timing varies by court and by case complexity. A cleaner, undefended case may move more quickly than a defended one, but landlords should still expect the process to take time rather than assuming immediate possession.',
  },
  {
    question: 'What documents should go with Form N5B?',
    answer:
      'Landlords will usually need the tenancy agreement, the notice relied on, proof of service, and the other supporting documents needed to show that the route has been used properly.',
  },
  {
    question: 'What if the tenant still does not leave after the possession order?',
    answer:
      'If the tenant remains after the possession order date, the landlord usually needs to move on to enforcement. A possession order does not always mean the property is physically recovered immediately.',
  },
  {
    question: 'What is the most common N5B mistake?',
    answer:
      'The most common mistake is trying to use the accelerated route with weak paperwork, the wrong assumptions, or an invalid notice. Small document problems can create major delay.',
  },
];

export { UNIVERSAL_HERO_VIEWPORT as viewport } from '@/lib/seo/hero-theme';

export const metadata: Metadata = {
  title: 'N5B Form Guide 2026 | Accelerated Possession for Landlords',
  description:
    'Plain-English landlord guide to Form N5B, when the accelerated possession route fits, and what paperwork the court will expect.',
  keywords: [
    'n5b form',
    'form n5b',
    'accelerated possession',
    'accelerated possession procedure',
    'n5b accelerated possession',
    'section 21 court form',
    'possession claim form',
    'n5b guide',
    'how to fill in n5b',
    'accelerated eviction',
    'n5b form guide england',
    'landlord n5b form',
  ],
  alternates: {
    canonical: 'https://landlordheaven.co.uk/n5b-form-guide',
  },
  openGraph: {
    title: 'N5B Form Guide 2026 | Accelerated Possession for Landlords',
    description:
      'How landlords use Form N5B for accelerated possession in England, including route checks, documents, timelines and next steps.',
    type: 'website',
    url: 'https://landlordheaven.co.uk/n5b-form-guide',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'N5B Form Guide 2026 | Accelerated Possession for Landlords',
    description:
      'How landlords use Form N5B for accelerated possession in England and what to check before filing.',
  },
};

export default function N5BFormGuidePage() {
  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'N5B Form Guide - Accelerated Possession',
    description:
      'Plain-English landlord guide to using Form N5B for accelerated possession in England.',
    url: 'https://landlordheaven.co.uk/n5b-form-guide',
  };

  return (
    <>
      <StructuredData data={pageSchema} />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          { name: 'Guides', url: 'https://landlordheaven.co.uk/possession-claim-guide' },
          { name: 'N5B Form Guide', url: 'https://landlordheaven.co.uk/n5b-form-guide' },
        ])}
      />

      <main className="text-gray-900">
        <HeaderConfig mode="autoOnScroll" />

        <UniversalHero
          badge="England Only"
          badgeIcon={<FileText className="w-4 h-4" />}
          title="N5B Form Guide"
          subtitle="Use the accelerated possession route correctly after the notice stage. This guide explains when landlords use Form N5B, when they should not, and what the court stage usually looks like."
          primaryCta={{
            label: `Get Complete Pack - ${PRODUCTS.complete_pack.displayPrice}`,
            href: completePackHref,
          }}
          secondaryCta={{
            label: 'Start with Section 21 first',
            href: '/section-21-notice-template',
          }}
          variant="pastel"
        >
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-700 mt-4">
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              N5B route explained
            </span>
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              Document checklist
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-green-500" />
              Court-stage guidance
            </span>
          </div>
        </UniversalHero>

        <section className="bg-white py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <SeoPageContextPanel pathname="/n5b-form-guide" />
            </div>
          </div>
        </section>

        <section className="py-6 bg-gray-50 border-y border-gray-100">
          <div className="container mx-auto px-4">
            <SocialProofCounter variant="total" className="justify-center" />
          </div>
        </section>

        <section className="py-8 bg-amber-50">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-start gap-4">
                <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="font-bold text-amber-900 mb-1">Notice stage comes first</h2>
                  <p className="text-amber-800 text-sm">
                    Landlords usually only look at Form N5B after the relevant notice route has been
                    used properly and the notice period has expired. If you have not reached that stage
                    yet, start with the{' '}
                    <Link href="/section-21-notice-template" className="underline hover:text-amber-900">
                      Section 21 route
                    </Link>{' '}
                    first.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto bg-white rounded-2xl border border-gray-100 shadow-sm p-8 md:p-10">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                What is Form N5B?
              </h2>
              <p className="text-gray-600 text-center mb-10 max-w-3xl mx-auto">
                Form N5B is the court form commonly associated with the accelerated possession route in England.
              </p>

              <div className="space-y-5 text-gray-700 leading-relaxed">
                <p>
                  Landlords usually look at <strong>Form N5B</strong> when the notice stage has
                  finished, the tenant is still in occupation, and the landlord wants possession of
                  the property without turning the same claim into a rent arrears case.
                </p>

                <p>
                  One reason N5B is popular is that it is often more document-led than the standard
                  possession route. In cleaner cases, that can make the process feel more direct.
                  But it is only useful when the route fits the facts and the paperwork is strong.
                </p>

                <p>
                  That is why this page should not just tell landlords that N5B is "faster." The real
                  issue is whether the accelerated route is actually suitable for the case in front of
                  you.
                </p>

                <p>
                  If you are mapping the route from notice expiry to court, use the{' '}
                  <Link href="/section-21-ban-uk" className="font-medium text-primary hover:underline">
                    Section 21 transition guide
                  </Link>
                  , compare it with the{' '}
                  <Link href="/n5b-possession-claim-guide" className="font-medium text-primary hover:underline">
                    N5B possession claim guide
                  </Link>
                  , and then move into the{' '}
                  <Link href={completePackHref} className="font-medium text-primary hover:underline">
                    Complete Eviction Pack
                  </Link>{' '}
                  when the file is ready for court.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                N5B vs N5: which form do you need?
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-3xl mx-auto">
                The most important choice is whether the accelerated possession route fits the case, or
                whether the standard route is the safer and more appropriate option.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full bg-white rounded-xl border border-gray-200 shadow-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left p-4 font-semibold text-gray-900">Feature</th>
                      <th className="text-center p-4 font-semibold text-red-600">N5B</th>
                      <th className="text-center p-4 font-semibold text-gray-900">N5</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="p-4 text-gray-700">Typical use</td>
                      <td className="p-4 text-center text-gray-700">Accelerated possession route</td>
                      <td className="p-4 text-center text-gray-700">Standard possession route</td>
                    </tr>
                    <tr>
                      <td className="p-4 text-gray-700">Often linked to</td>
                      <td className="p-4 text-center text-gray-700">Notice-based possession</td>
                      <td className="p-4 text-center text-gray-700">Grounds or arrears-based cases</td>
                    </tr>
                    <tr>
                      <td className="p-4 text-gray-700">Rent arrears in same claim</td>
                      <td className="p-4 text-center">
                        <X className="w-5 h-5 text-red-500 mx-auto" />
                      </td>
                      <td className="p-4 text-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 text-gray-700">Likely hearing level</td>
                      <td className="p-4 text-center text-gray-700">Sometimes avoided in cleaner cases</td>
                      <td className="p-4 text-center text-gray-700">More likely</td>
                    </tr>
                    <tr>
                      <td className="p-4 text-gray-700">Paperwork quality importance</td>
                      <td className="p-4 text-center text-gray-700">Very high</td>
                      <td className="p-4 text-center text-gray-700">Very high</td>
                    </tr>
                    <tr>
                      <td className="p-4 text-gray-700">When landlords usually choose it</td>
                      <td className="p-4 text-center text-gray-700">Possession only</td>
                      <td className="p-4 text-center text-gray-700">Possession plus wider issues</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-8 bg-blue-50 rounded-xl p-6 border border-blue-200">
                <div className="flex items-start gap-4">
                  <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Practical rule</h4>
                    <p className="text-gray-700 text-sm">
                      Use N5B where the accelerated possession route truly fits. Use the standard route
                      where the case is broader, more disputed, or tied to arrears or grounds. Speed is
                      not the only consideration - route suitability matters more.
                    </p>
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
                When landlords should and should not use N5B
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-3xl mx-auto">
                Many N5B problems come from using the form just because it looks faster, not because it
                actually fits the case.
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white rounded-2xl p-6 border border-green-200 shadow-sm">
                  <h3 className="text-xl font-bold text-green-800 mb-4">Usually more suitable</h3>
                  <ul className="space-y-3 text-gray-700 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>The landlord mainly wants possession</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>The case is built around the notice route</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>The paperwork is complete and internally consistent</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>The landlord is not trying to combine everything into one claim</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-red-200 shadow-sm">
                  <h3 className="text-xl font-bold text-red-800 mb-4">Usually less suitable</h3>
                  <ul className="space-y-3 text-gray-700 text-sm">
                    <li className="flex items-start gap-2">
                      <X className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                      <span>The landlord also wants rent arrears dealt with in the same claim</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                      <span>The route depends on grounds or more contested facts</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                      <span>The document bundle has obvious gaps or inconsistencies</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                      <span>The landlord is choosing the form only because it sounds faster</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                How to fill in Form N5B
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-3xl mx-auto">
                The biggest risk is not one dramatic mistake - it is a series of small errors across
                dates, names, service details and supporting documents.
              </p>

              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-red-600">1</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Claimant and defendant details</h3>
                      <p className="text-gray-700">
                        Make sure the landlord, tenant and property details match the tenancy and the
                        rest of the bundle exactly. Inconsistency here can undermine confidence in the
                        whole claim.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-red-600">2</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Tenancy and property details</h3>
                      <p className="text-gray-700">
                        The tenancy description, start date and property information need to line up
                        with the tenancy agreement and supporting evidence.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-red-600">3</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Notice details</h3>
                      <p className="text-gray-700">
                        The notice relied on, the dates involved and the way it was served must all be
                        clear. The court will want the route to make sense on the documents.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-red-600">4</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Supporting compliance information</h3>
                      <p className="text-gray-700">
                        The accelerated route depends heavily on the paperwork picture being coherent.
                        If the court expects supporting material, it should be included and easy to follow.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-red-600">5</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Statement of truth and final review</h3>
                      <p className="text-gray-700">
                        Before filing, review the whole bundle as one file rather than looking only at
                        the form. Most delay comes from contradictions between the form and the
                        supporting documents.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
                <p className="text-amber-900 text-sm">
                  <strong>Most common error:</strong> the form itself looks complete, but the dates,
                  service evidence or attached documents do not match the story the claim is trying to tell.
                </p>
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
                title="Get Form N5B ready to file"
                description="Our Complete Pack helps you keep the accelerated route, supporting documents, and filing stage under better control."
              />
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                What happens after you file N5B
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-3xl mx-auto">
                Filing the form is not the end of the job. The court still has to review the claim and
                the tenant may still respond.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-gray-900">Court issues the claim</h3>
                      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">Initial stage</span>
                    </div>
                    <p className="text-gray-700">
                      The court receives the claim and the tenant is given the opportunity to respond.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-gray-900">Response or defence stage</h3>
                      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">Can vary</span>
                    </div>
                    <p className="text-gray-700">
                      If the tenant raises issues, the matter can become less straightforward than the
                      landlord expected.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <Gavel className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-gray-900">Judicial review of the papers</h3>
                      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">Core stage</span>
                    </div>
                    <p className="text-gray-700">
                      The court reviews whether the route and the document bundle support the claim for possession.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-gray-900">Possession order stage</h3>
                      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">Outcome stage</span>
                    </div>
                    <p className="text-gray-700">
                      If the claim succeeds, the court grants possession. If the tenant still does not
                      leave, landlords may then need to move on to enforcement.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Key point</h3>
                <p className="text-gray-700">
                  The accelerated route can be more efficient, but only where the paperwork is strong
                  enough to support it. Landlords often overestimate the speed and underestimate the
                  importance of document quality.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <FAQSection
                faqs={faqs}
                title="N5B form FAQs for landlords"
                showContactCTA={false}
                variant="white"
              />

              <SeoCtaBlock pageType="court" variant="faq" jurisdiction="england" />
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <SeoCtaBlock
                pageType="court"
                variant="final"
                jurisdiction="england"
                title="Get your N5B route ready"
                description="Use a cleaner court file so the accelerated route is easier to follow if the case moves under pressure."
              />

              <SeoDisclaimer className="max-w-4xl mx-auto" />
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <RelatedLinks title="Related Resources" links={n5bFormRelatedLinks} />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
