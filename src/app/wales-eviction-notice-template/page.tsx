import { Metadata } from 'next';
import Link from 'next/link';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { productLinks, guideLinks, askHeavenLink } from '@/lib/seo/internal-links';
import { buildWizardLink } from '@/lib/wizard/buildWizardLink';
import { StandardHero } from '@/components/marketing/StandardHero';
import { SeoDisclaimer } from '@/components/seo/SeoCtaBlock';
import { AskHeavenWidget } from '@/components/ask-heaven/AskHeavenWidget';
import { FAQSection } from '@/components/seo/FAQSection';
import {
  CheckCircle,
  FileText,
  Shield,
  Clock,
  ArrowRight,
  AlertTriangle,
  Home,
  Scale,
} from 'lucide-react';

// Pre-built wizard link for Wales template page
const wizardLink = buildWizardLink({
  product: 'notice_only',
  jurisdiction: 'wales',
  src: 'template',
  topic: 'eviction',
});

export const metadata: Metadata = {
  title: 'Wales Eviction Notice Template 2026 | Renting Homes Act Landlords',
  description:
    'Wales eviction notice template under the Renting Homes Act. Generate Section 173 or fault-based possession notices for Welsh landlords.',
  keywords: [
    'wales eviction notice template',
    'renting homes act notice template',
    'section 173 notice template wales',
    'wales possession notice template',
    'occupation contract notice wales',
    'wales landlord eviction template',
    'welsh eviction notice',
  ],
  alternates: {
    canonical: 'https://landlordheaven.co.uk/wales-eviction-notice-template',
  },
  openGraph: {
    title: 'Wales Eviction Notice Template 2026 | Renting Homes Act Landlords',
    description:
      'Generate compliant Wales possession notices under the Renting Homes Act. Section 173 and fault-based notices for Welsh landlords.',
    type: 'website',
    url: 'https://landlordheaven.co.uk/wales-eviction-notice-template',
  },
};

const faqs = [
  {
    question: 'What eviction notices are used in Wales?',
    answer:
      'Wales uses possession notices under the Renting Homes (Wales) Act 2016. The main types are: Section 173 (no-fault notice requiring 6 months notice), Section 181 for breach of contract, Section 186 for serious rent arrears, and Section 191 for abandonment. Section 21 and Section 8 do NOT apply in Wales.',
  },
  {
    question: 'How much notice do I need to give in Wales?',
    answer:
      'For Section 173 (no-fault) notices in Wales, landlords must give at least 6 months notice. For fault-based grounds like serious rent arrears (Section 186), notice periods may be shorter - typically 14 days to 1 month depending on the ground.',
  },
  {
    question: 'Can I use an England Section 21 notice in Wales?',
    answer:
      'No. Section 21 notices are England-only and do not apply in Wales. Using an English notice template in Wales will invalidate your possession claim. You must use Wales-specific notices under the Renting Homes (Wales) Act 2016.',
  },
  {
    question: 'What is the Renting Homes (Wales) Act?',
    answer:
      'The Renting Homes (Wales) Act 2016 came into force in December 2022 and replaced the Housing Act 1988 in Wales. It introduced occupation contracts (replacing tenancy agreements) and contract holders (replacing tenants). All private landlords in Wales must use this framework.',
  },
  {
    question: 'Do I need to protect deposits in Wales?',
    answer:
      'Yes. Welsh landlords must protect deposits in a government-approved scheme within 30 days and provide prescribed information. Failure to do so can affect your ability to serve possession notices and may result in penalties.',
  },
];

export default function WalesEvictionNoticeTemplatePage() {
  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Wales Eviction Notice Template',
    description:
      'Compliant Wales possession notice templates under the Renting Homes (Wales) Act 2016.',
    url: 'https://landlordheaven.co.uk/wales-eviction-notice-template',
    mainEntity: {
      '@type': 'Product',
      name: 'Wales Possession Notice Pack',
      description: 'Court-ready Wales eviction notices for landlords under the Renting Homes Act',
      offers: {
        '@type': 'Offer',
        price: '49.99',
        priceCurrency: 'GBP',
      },
    },
  };

  return (
    <>
      <StructuredData data={pageSchema} />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          { name: 'Templates', url: 'https://landlordheaven.co.uk/eviction-notice-template' },
          {
            name: 'Wales Eviction Notice Template',
            url: 'https://landlordheaven.co.uk/wales-eviction-notice-template',
          },
        ])}
      />

      <main>
        {/* Hero Section */}
        <StandardHero
          badge="Wales Renting Homes Act"
          badgeIcon={<Scale className="w-4 h-4" />}
          title="Wales Eviction Notice Template (Renting Homes Act)"
          subtitle={
            <>
              Generate compliant <strong>Wales possession notices</strong> under the Renting Homes
              (Wales) Act 2016. Section 173, breach notices, and rent arrears notices for Welsh
              landlords.
            </>
          }
          primaryCTA={{ label: 'Get Wales Notice — £49.99', href: wizardLink }}
          secondaryCTA={{ label: 'Learn About Wales Eviction', href: '/wales-eviction-notices' }}
          variant="pastel"
        >
          {/* Jurisdiction Notice */}
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg max-w-2xl mx-auto">
            <p className="text-red-900 text-sm flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Wales only:</strong> This template is for properties in{' '}
                <strong>Wales</strong> under the Renting Homes (Wales) Act 2016. For England, use{' '}
                <Link
                  href="/section-21-notice-template"
                  className="text-red-700 underline hover:text-red-900"
                >
                  Section 21
                </Link>{' '}
                or{' '}
                <Link
                  href="/section-8-notice-template"
                  className="text-red-700 underline hover:text-red-900"
                >
                  Section 8
                </Link>
                .
              </span>
            </p>
          </div>

          {/* Trust Signals */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Renting Homes Act Compliant
            </span>
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              Wales-Specific Forms
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
                Wales vs England: Different Eviction Rules
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Wales has its own legal framework since December 2022. Using English notices in
                Wales will invalidate your possession claim.
              </p>

              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold text-gray-900">Aspect</th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-900">Wales</th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-900">England</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 font-medium text-gray-900">Legislation</td>
                      <td className="px-6 py-4 text-gray-600">Renting Homes (Wales) Act 2016</td>
                      <td className="px-6 py-4 text-gray-600">Housing Act 1988</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">Agreement type</td>
                      <td className="px-6 py-4 text-gray-600">Occupation contract</td>
                      <td className="px-6 py-4 text-gray-600">Assured Shorthold Tenancy</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-medium text-gray-900">No-fault notice</td>
                      <td className="px-6 py-4 text-gray-600">
                        Section 173 (6 months notice)
                      </td>
                      <td className="px-6 py-4 text-gray-600">Section 21 (ends May 2026)</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">Rent arrears notice</td>
                      <td className="px-6 py-4 text-gray-600">Section 186</td>
                      <td className="px-6 py-4 text-gray-600">Section 8 Ground 8/10/11</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-medium text-gray-900">Standard notice period</td>
                      <td className="px-6 py-4 text-red-600 font-medium">6 months minimum</td>
                      <td className="px-6 py-4 text-gray-600">2 months</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* Notice Types in Wales */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
                Wales Possession Notice Types
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-red-50 rounded-xl p-6 border border-red-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                      <Home className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Section 173</h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    No-fault possession notice. Requires <strong>6 months notice</strong>.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      No grounds required
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      Cannot be served in first 6 months
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      Must comply with all landlord obligations
                    </li>
                  </ul>
                </div>

                <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-amber-600 rounded-lg flex items-center justify-center">
                      <Scale className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Section 181/186</h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Fault-based notices for breach or serious rent arrears.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      Shorter notice periods (14 days to 1 month)
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      Must prove grounds (arrears, breach)
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      Serious arrears = 2+ months rent owed
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What's Included */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
                What&apos;s Included in Your Wales Notice Pack
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start gap-4 p-6 bg-white rounded-xl border border-gray-200">
                  <FileText className="w-8 h-8 text-red-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Wales Possession Notice</h3>
                    <p className="text-gray-600 text-sm">
                      Compliant with the Renting Homes (Wales) Act 2016
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-6 bg-white rounded-xl border border-gray-200">
                  <Shield className="w-8 h-8 text-red-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Compliance Check</h3>
                    <p className="text-gray-600 text-sm">
                      Validates your notice meets Welsh legal requirements
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-6 bg-white rounded-xl border border-gray-200">
                  <Clock className="w-8 h-8 text-red-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Serving Instructions</h3>
                    <p className="text-gray-600 text-sm">
                      Step-by-step guide for proper service in Wales
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-6 bg-white rounded-xl border border-gray-200">
                  <Scale className="w-8 h-8 text-red-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Court-Ready Format</h3>
                    <p className="text-gray-600 text-sm">
                      Designed for Welsh county court possession claims
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
                jurisdiction="wales"
                title="Not sure which Wales notice to use?"
                description="Ask Heaven can help you understand Section 173 vs fault-based notices, notice periods, and the Renting Homes Act process."
                utm_campaign="wales-eviction-notice-template"
              />
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <FAQSection faqs={faqs} includeSchema={false} showContactCTA={false} />

        {/* Final CTA */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto bg-gradient-to-br from-red-700 to-red-600 rounded-3xl p-8 lg:p-12 text-white text-center">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Get Your Wales Eviction Notice Now
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Generate a compliant possession notice under the Renting Homes (Wales) Act in
                minutes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href={wizardLink}
                  className="bg-white text-red-700 font-semibold py-3 px-6 rounded-lg hover:bg-red-50 transition-colors inline-flex items-center justify-center gap-2"
                >
                  Get Wales Notice — £49.99
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/wales-eviction-notices"
                  className="bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-lg transition-colors inline-flex items-center justify-center gap-2 border border-white/30"
                >
                  Learn About Wales Eviction
                </Link>
              </div>
              <p className="mt-8 text-white/70 text-sm">
                Renting Homes Act Compliant &bull; Section 173 & Fault-Based Notices &bull;
                Court-Ready Format
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
                  guideLinks.walesEviction,
                  productLinks.noticeOnly,
                  productLinks.completePack,
                  askHeavenLink,
                  {
                    href: '/wales-tenancy-agreement-template',
                    title: 'Wales Occupation Contracts',
                    description: 'Create compliant occupation contracts',
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
