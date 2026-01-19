import { Metadata } from 'next';
import Link from 'next/link';
import { StructuredData, breadcrumbSchema, faqPageSchema } from '@/lib/seo/structured-data';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { productLinks, guideLinks, askHeavenLink } from '@/lib/seo/internal-links';
import { buildWizardLink } from '@/lib/wizard/buildWizardLink';
import { StandardHero } from '@/components/marketing/StandardHero';
import { LegalTrustBanner } from '@/components/seo/LegalTrustBanner';
import { SeoDisclaimer } from '@/components/seo/SeoCtaBlock';
import { AskHeavenWidget } from '@/components/ask-heaven/AskHeavenWidget';
import {
  CheckCircle,
  FileText,
  Shield,
  Clock,
  ArrowRight,
  AlertTriangle,
  Gavel,
  Home,
} from 'lucide-react';

// Pre-built wizard link for Scotland template page
const wizardLink = buildWizardLink({
  product: 'notice_only',
  jurisdiction: 'scotland',
  src: 'template',
  topic: 'eviction',
});

export const metadata: Metadata = {
  title: 'Scotland Notice to Leave Template 2026 | PRT Eviction Landlords',
  description:
    'For landlords needing a compliant Scotland Notice to Leave under the PRT. Generate notices citing the 18 eviction grounds with correct notice periods. Template for Scottish landlords.',
  keywords: [
    'notice to leave template scotland',
    'scotland eviction notice template',
    'prt eviction notice template',
    'private residential tenancy notice',
    'scotland landlord eviction template',
    'scottish eviction notice',
    'first tier tribunal scotland',
  ],
  alternates: {
    canonical: 'https://landlordheaven.co.uk/scotland-notice-to-leave-template',
  },
  openGraph: {
    title: 'Scotland Notice to Leave Template 2026 | PRT Eviction Landlords',
    description:
      'Generate compliant Notice to Leave for Scotland under the Private Residential Tenancy. 18 eviction grounds with correct notice periods.',
    type: 'website',
    url: 'https://landlordheaven.co.uk/scotland-notice-to-leave-template',
  },
};

const faqs = [
  {
    question: 'What is a Notice to Leave in Scotland?',
    answer:
      'A Notice to Leave is the Scottish eviction notice required under the Private Housing (Tenancies) (Scotland) Act 2016. It must cite one or more of the 18 eviction grounds and include the correct notice period (28 or 84 days depending on the ground).',
  },
  {
    question: 'What notice period is required in Scotland?',
    answer:
      'Notice periods in Scotland depend on the eviction ground. Most grounds require 84 days notice, including selling the property (Ground 1) and landlord moving in (Ground 4). Rent arrears (Ground 12) and antisocial behaviour (Ground 14) require only 28 days.',
  },
  {
    question: 'Can I use an England eviction notice in Scotland?',
    answer:
      'No. Section 21 and Section 8 notices are England-only and do not apply in Scotland. Using English notices will be rejected by the First-tier Tribunal. You must use a Scotland Notice to Leave under the 2016 Act.',
  },
  {
    question: 'What is a Private Residential Tenancy (PRT)?',
    answer:
      'A Private Residential Tenancy is the standard tenancy type in Scotland since December 2017. Unlike English ASTs, PRTs are open-ended with no fixed term. Tenants can end with 28 days notice; landlords must cite one of 18 grounds and use a Notice to Leave.',
  },
  {
    question: 'Do I need to register as a landlord in Scotland?',
    answer:
      'Yes. All private landlords in Scotland must register with their local council on the Scottish Landlord Register. Your registration number must appear on the Notice to Leave. Letting without registration is a criminal offence.',
  },
  {
    question: 'Where do Scottish eviction cases go?',
    answer:
      'Scottish eviction cases go to the First-tier Tribunal for Scotland (Housing and Property Chamber), not the county court. If the tenant does not leave after the notice period, you apply to the Tribunal for an eviction order.',
  },
];

// Common eviction grounds for display
const commonGrounds = [
  { ground: '1', description: 'Landlord intends to sell', notice: '84 days', type: 'Mandatory' },
  {
    ground: '4',
    description: 'Landlord or family moving in',
    notice: '84 days',
    type: 'Mandatory',
  },
  {
    ground: '12',
    description: '3+ consecutive months rent arrears',
    notice: '28 days',
    type: 'Mandatory',
  },
  { ground: '14', description: 'Antisocial behaviour', notice: '28 days', type: 'Mandatory' },
];

export default function ScotlandNoticeToLeaveTemplatePage() {
  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Scotland Notice to Leave Template',
    description:
      'Compliant Notice to Leave templates for Scotland under the Private Housing (Tenancies) (Scotland) Act 2016.',
    url: 'https://landlordheaven.co.uk/scotland-notice-to-leave-template',
    mainEntity: {
      '@type': 'Product',
      name: 'Scotland Notice to Leave Pack',
      description:
        'Court-ready Notice to Leave for Scottish landlords under the PRT framework',
      offers: {
        '@type': 'Offer',
        price: '39.99',
        priceCurrency: 'GBP',
      },
    },
  };

  return (
    <>
      <StructuredData data={pageSchema} />
      <StructuredData data={faqPageSchema(faqs)} />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          { name: 'Templates', url: 'https://landlordheaven.co.uk/eviction-notice-template' },
          {
            name: 'Scotland Notice to Leave Template',
            url: 'https://landlordheaven.co.uk/scotland-notice-to-leave-template',
          },
        ])}
      />

      <main>
        {/* Hero Section */}
        <StandardHero
          badge="Scotland PRT Framework"
          badgeIcon={<Gavel className="w-4 h-4" />}
          title="Scotland Notice to Leave Template (PRT)"
          subtitle={
            <>
              Generate a compliant <strong>Notice to Leave</strong> for Scotland under the Private
              Housing (Tenancies) Act 2016. All 18 eviction grounds with correct notice periods.
            </>
          }
          primaryCTA={{ label: 'Get Scotland Notice — £39.99', href: wizardLink }}
          secondaryCTA={{
            label: 'Learn About Scotland Eviction',
            href: '/scotland-eviction-notices',
          }}
          variant="pastel"
        >
          {/* Jurisdiction Notice */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r-lg max-w-2xl mx-auto">
            <p className="text-blue-900 text-sm flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Scotland only:</strong> This template is for properties in{' '}
                <strong>Scotland</strong> under the Private Residential Tenancy. For England, use{' '}
                <Link
                  href="/section-21-notice-template"
                  className="text-blue-700 underline hover:text-blue-900"
                >
                  Section 21
                </Link>{' '}
                or{' '}
                <Link
                  href="/section-8-notice-template"
                  className="text-blue-700 underline hover:text-blue-900"
                >
                  Section 8
                </Link>
                .
              </span>
            </p>
          </div>

          <div className="mb-6 max-w-2xl mx-auto text-left">
            <LegalTrustBanner
              jurisdiction="Scotland"
              reviewedDate="15 January 2026"
              updatedFor="2026"
            />
          </div>

          {/* Trust Signals */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              All 18 Grounds Covered
            </span>
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              Tribunal-Ready Format
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-green-500" />
              Ready in 10 Minutes
            </span>
          </div>
        </StandardHero>

        {/* Key Differences from England */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Scotland vs England: Different Eviction Rules
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Scotland has had grounds-based eviction since 2017. Using English notices in
                Scotland will be rejected by the Tribunal.
              </p>

              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold text-gray-900">Aspect</th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-900">Scotland</th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-900">England</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 font-medium text-gray-900">Legislation</td>
                      <td className="px-6 py-4 text-gray-600">
                        Private Housing (Tenancies) (Scotland) Act 2016
                      </td>
                      <td className="px-6 py-4 text-gray-600">Housing Act 1988</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">Tenancy type</td>
                      <td className="px-6 py-4 text-gray-600">
                        Private Residential Tenancy (PRT)
                      </td>
                      <td className="px-6 py-4 text-gray-600">Assured Shorthold Tenancy</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-medium text-gray-900">Eviction notice</td>
                      <td className="px-6 py-4 text-gray-600">Notice to Leave</td>
                      <td className="px-6 py-4 text-gray-600">Section 21 / Section 8</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">No-fault eviction</td>
                      <td className="px-6 py-4 text-blue-600 font-medium">Never existed for PRT</td>
                      <td className="px-6 py-4 text-amber-600 font-medium">Ends May 2026</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-medium text-gray-900">Court/Tribunal</td>
                      <td className="px-6 py-4 text-gray-600">First-tier Tribunal</td>
                      <td className="px-6 py-4 text-gray-600">County Court</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* Common Eviction Grounds */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Common Scotland Eviction Grounds
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Scotland has 18 eviction grounds. Here are the most commonly used.{' '}
                <Link
                  href="/scotland-eviction-notices"
                  className="text-primary hover:underline"
                >
                  See all 18 grounds →
                </Link>
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                {commonGrounds.map((ground) => (
                  <div
                    key={ground.ground}
                    className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-lg text-sm">
                        Ground {ground.ground}
                      </span>
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded ${
                          ground.type === 'Mandatory'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {ground.type}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{ground.description}</h3>
                    <p className="text-gray-600 text-sm">
                      Notice period: <strong>{ground.notice}</strong>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* What's Included */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
                What&apos;s Included in Your Scotland Notice Pack
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start gap-4 p-6 bg-white rounded-xl border border-gray-200">
                  <FileText className="w-8 h-8 text-blue-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Notice to Leave</h3>
                    <p className="text-gray-600 text-sm">
                      Compliant with the Private Housing (Tenancies) (Scotland) Act 2016
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-6 bg-white rounded-xl border border-gray-200">
                  <Shield className="w-8 h-8 text-blue-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Ground Selection</h3>
                    <p className="text-gray-600 text-sm">
                      All 18 grounds with correct notice periods auto-calculated
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-6 bg-white rounded-xl border border-gray-200">
                  <Clock className="w-8 h-8 text-blue-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Serving Instructions</h3>
                    <p className="text-gray-600 text-sm">
                      Step-by-step guide for proper service in Scotland
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-6 bg-white rounded-xl border border-gray-200">
                  <Gavel className="w-8 h-8 text-blue-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Tribunal-Ready Format</h3>
                    <p className="text-gray-600 text-sm">
                      Designed for First-tier Tribunal applications
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Ask Heaven Section */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <AskHeavenWidget
                variant="banner"
                source="page_cta"
                topic="eviction"
                jurisdiction="scotland"
                title="Not sure which eviction ground to use?"
                description="Ask Heaven can help you understand the 18 Scottish eviction grounds, notice periods, and First-tier Tribunal process."
                utm_campaign="scotland-notice-to-leave-template"
              />
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
                Scotland Notice to Leave FAQ
              </h2>

              <div className="space-y-6">
                {faqs.map((faq, index) => (
                  <div key={index} className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto bg-gradient-to-br from-blue-700 to-blue-600 rounded-3xl p-8 lg:p-12 text-white text-center">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Get Your Scotland Notice to Leave Now
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Generate a compliant Notice to Leave with the correct eviction ground and notice
                period in minutes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href={wizardLink}
                  className="bg-white text-blue-700 font-semibold py-3 px-6 rounded-lg hover:bg-blue-50 transition-colors inline-flex items-center justify-center gap-2"
                >
                  Get Scotland Notice — £39.99
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/scotland-eviction-notices"
                  className="bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-lg transition-colors inline-flex items-center justify-center gap-2 border border-white/30"
                >
                  See All 18 Grounds
                </Link>
              </div>
              <p className="mt-8 text-white/70 text-sm">
                PRT Compliant &bull; All 18 Grounds &bull; Tribunal-Ready Format
              </p>
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
                  guideLinks.scotlandEviction,
                  productLinks.noticeOnly,
                  productLinks.completePack,
                  askHeavenLink,
                  {
                    href: '/tenancy-agreements/scotland',
                    title: 'Scotland PRT Agreements',
                    description: 'Create compliant private residential tenancy agreements',
                    icon: 'document' as const,
                    type: 'page' as const,
                  },
                  guideLinks.howToEvictTenant,
                ]}
              />
            </div>
          </div>
        </section>

        {/* SEO Disclaimer */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <SeoDisclaimer />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
