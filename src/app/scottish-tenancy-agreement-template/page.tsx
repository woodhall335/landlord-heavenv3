import type { Metadata } from 'next';
import Link from 'next/link';
import { getCanonicalUrl } from '@/lib/seo/urls';
import { StructuredData, breadcrumbSchema, articleSchema } from '@/lib/seo/structured-data';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { SeoCtaBlock, SeoDisclaimer } from '@/components/seo/SeoCtaBlock';
import { tenancyAgreementScotlandLinks } from '@/lib/seo/internal-links';
import { FAQSection } from '@/components/seo/FAQSection';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';

export const metadata: Metadata = {
  title: 'Scottish Tenancy Agreement 2026 | Legally Validated PRT',
  description: 'Create a Scottish tenancy agreement (PRT) with solicitor-grade drafting and compliance checks for landlord requirements.',
  keywords: [
    'Scottish tenancy agreement template',
    'Scotland tenancy agreement',
    'Scottish landlord agreement',
    'tenancy agreement Scotland',
    'Scottish rental agreement',
    'Alba tenancy template',
    'Scotland letting agreement',
    'Scottish PRT template',
    'tenancy contract Scotland',
    'Scottish rental contract',
  ],
  alternates: {
    canonical: getCanonicalUrl('/scottish-tenancy-agreement-template'),
  },
  openGraph: {
    title: 'Scottish Tenancy Agreement 2026 | Legally Validated PRT',
    description: 'Legally validated Scottish tenancy agreement (PRT) with compliance-checked clauses.',
    type: 'article',
    url: getCanonicalUrl('/scottish-tenancy-agreement-template'),
  },
};

const faqs = [
  {
    question: 'What type of tenancy agreement do I need for Scotland?',
    answer: 'For properties in Scotland, you need a Private Residential Tenancy (PRT) agreement. Since December 2017, the PRT is the only type of private residential tenancy available in Scotland. The previous Assured Tenancy and Short Assured Tenancy types no longer apply to new lettings. Our Scottish tenancy agreement template generates a fully compliant PRT.',
  },
  {
    question: 'Can I use an English tenancy agreement for a Scottish property?',
    answer: 'No. English ASTs (Assured Shorthold Tenancies) are not valid in Scotland, and Scottish PRTs are not valid in England. The legal frameworks are completely different - Scotland has open-ended tenancies with no-fault eviction abolished, while England has fixed terms with Section 21 no-fault eviction (for now). Using the wrong agreement could leave you unable to enforce terms or evict.',
  },
  {
    question: 'Is there a minimum tenancy period in Scotland?',
    answer: 'No. Scottish PRTs are open-ended from day one - there is no minimum or maximum period. The tenancy continues until properly terminated. Tenants can give 28 days notice at any time. Landlords must use one of 18 specific grounds with the required notice period (28-168 days depending on the ground).',
  },
  {
    question: 'Do I need to register as a landlord in Scotland?',
    answer: 'Yes, landlord registration is mandatory in Scotland. You must register with your local council before advertising or letting any property. Your registration number must appear on all advertisements and in the tenancy agreement. Failure to register is a criminal offense with fines up to £50,000 and potential rent repayment orders.',
  },
  {
    question: 'What is the maximum deposit I can charge in Scotland?',
    answer: 'The maximum deposit in Scotland is 2 months rent - significantly lower than England\'s 5-6 weeks. The deposit must be protected in one of the three approved schemes (SafeDeposits Scotland, MyDeposits Scotland, or Letting Protection Service Scotland) within 30 working days. Our wizard validates your deposit against this limit.',
  },
  {
    question: 'What documents must I provide to Scottish tenants?',
    answer: 'Before or at tenancy start, you must provide: (1) The written PRT agreement, (2) EPC (Energy Performance Certificate), (3) Gas Safety Certificate (if applicable), (4) EICR (Electrical Installation Condition Report), (5) Legionella risk assessment information, (6) Information about the deposit protection scheme used. Our wizard checks these requirements.',
  },
  {
    question: 'How do I evict a tenant in Scotland?',
    answer: 'You must use one of 18 specified eviction grounds and give the required notice (28-168 days depending on the ground). If the tenant doesn\'t leave voluntarily, you apply to the First-tier Tribunal for Scotland for an eviction order. There is no "no-fault" eviction - you must prove a ground. Our eviction products guide you through the Scottish process.',
  },
  {
    question: 'What is the Repairing Standard?',
    answer: 'The Repairing Standard sets minimum property conditions that Scottish landlords must maintain: wind and watertight structure, safe installations (gas, electrical, water), adequate heating and hot water, satisfactory fire safety (smoke and CO detectors), and safe common areas. Tenants can apply to the Tribunal if standards aren\'t met. Our template includes all Repairing Standard obligations.',
  },
  {
    question: 'Can I increase rent during the tenancy?',
    answer: 'Yes, but only once per 12-month period with at least 3 months written notice using the prescribed form. Tenants can challenge "unreasonable" increases by applying to a Rent Officer. Some areas are designated Rent Pressure Zones where increases may be capped. Our template includes compliant rent review provisions.',
  },
  {
    question: 'What if my tenant stops paying rent?',
    answer: 'For serious rent arrears (3+ consecutive months), you can use eviction Ground 12 with 28 days notice. If the tenant has been in arrears 3+ times in the past 12 months, you can use Ground 13. You can also pursue a money claim through Simple Procedure (Scotland\'s small claims system). Our products support both eviction and money claim routes.',
  },
  {
    question: 'Does the template work for shared properties/HMOs?',
    answer: 'Our Premium PRT (£24.99) includes HMO-specific provisions for properties with 3+ unrelated tenants. Scotland has its own HMO licensing requirements through local councils - you need both an HMO licence and landlord registration. The Premium template covers shared area responsibilities and room allocation.',
  },
  {
    question: 'What happens to existing Short Assured Tenancies?',
    answer: 'Short Assured Tenancies (SATs) created before December 2017 can continue on their existing terms. However, any new tenancy, renewal, or significant variation must be a PRT. If your SAT tenant leaves and you re-let to a new tenant, the new tenancy must be a PRT. Our template only generates PRTs as required by current law.',
  },
];

export default function ScottishTenancyAgreementTemplatePage() {
  return (
    <>
      <StructuredData
        data={articleSchema({
          headline: 'Scottish Tenancy Agreement Template 2026',
          description: 'Get a legally compliant Scottish tenancy agreement (PRT) template.',
          url: getCanonicalUrl('/scottish-tenancy-agreement-template'),
          datePublished: '2026-01-01',
          dateModified: '2026-01-25',
        })}
      />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          { name: 'Tenancy Agreements', url: 'https://landlordheaven.co.uk/products/ast' },
          { name: 'Scottish Tenancy Agreement', url: 'https://landlordheaven.co.uk/scottish-tenancy-agreement-template' },
        ])}
      />

      <HeaderConfig mode="autoOnScroll" />

      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <UniversalHero
          title="Scottish Tenancy Agreement"
          subtitle="Generate a legally validated Scottish tenancy agreement with solicitor-grade, compliance-checked PRT terms."
          primaryCta={{ label: "Start now", href: "/wizard?product=ast_standard&topic=tenancy&src=seo_scottish_tenancy_agreement_template&jurisdiction=scotland" }}
          showTrustPositioningBar
          hideMedia
        />
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 pt-24 pb-4">
          <nav className="text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/products/ast" className="hover:text-blue-600">Tenancy Agreements</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">Scottish Tenancy Agreement</span>
          </nav>
        </div>

        {/* Hero */}
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-4">
              <img src="/gb-sct.svg" alt="Scotland flag" className="w-12 h-12" />
            </div>
            <span className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              Aontachadh Màl na h-Alba
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Scottish Tenancy Agreement Template
            </h2>
            <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
              Looking for a <strong>tenancy agreement for Scotland</strong>? Our Scottish tenancy template
              generates a fully compliant <strong>Private Residential Tenancy (PRT)</strong> — the only
              type of private tenancy available in Scotland since 2017.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/wizard?product=ast_standard&topic=tenancy&src=seo_scottish_tenancy_agreement_template&jurisdiction=scotland"
                className="inline-flex items-center gap-2 bg-white border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Standard PRT — £14.99
              </Link>
              <Link
                href="/wizard?product=ast_premium&topic=tenancy&src=seo_scottish_tenancy_agreement_template&jurisdiction=scotland"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Premium PRT — £24.99
              </Link>
            </div>
            <p className="mt-4 text-sm text-gray-500">Private Housing (Tenancies) Act 2016 compliant • Instant PDF</p>
          </div>
        </section>

        {/* Important Notice */}
        <section className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto bg-amber-50 border-2 border-amber-200 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <svg className="w-8 h-8 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-amber-900 mb-2">Scotland Uses PRTs, Not ASTs</h2>
                <p className="text-amber-800">
                  If you&apos;re searching for a &ldquo;tenancy agreement&rdquo; for a Scottish property, you need a
                  <strong> Private Residential Tenancy (PRT)</strong>. The English AST system does not apply
                  in Scotland. Our template generates the correct agreement type for Scottish law.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Scotland vs England */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Scotland vs England: Key Differences</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-white rounded-xl shadow-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-900 text-white">
                    <th className="px-6 py-4 text-left font-semibold">Aspect</th>
                    <th className="px-6 py-4 text-center font-semibold">England</th>
                    <th className="px-6 py-4 text-center font-semibold bg-blue-700">Scotland</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 font-medium">Agreement Type</td>
                    <td className="px-6 py-4 text-center">Assured Shorthold Tenancy (AST)</td>
                    <td className="px-6 py-4 text-center bg-blue-50">Private Residential Tenancy (PRT)</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 font-medium">Term Length</td>
                    <td className="px-6 py-4 text-center">Fixed term (6-12 months typical)</td>
                    <td className="px-6 py-4 text-center bg-blue-50 font-semibold">Open-ended (no fixed term)</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-medium">No-Fault Eviction</td>
                    <td className="px-6 py-4 text-center">Yes (Section 21)</td>
                    <td className="px-6 py-4 text-center bg-blue-50 font-semibold">No (must have grounds)</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 font-medium">Maximum Deposit</td>
                    <td className="px-6 py-4 text-center">5-6 weeks rent</td>
                    <td className="px-6 py-4 text-center bg-blue-50 font-semibold">2 months rent</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-medium">Landlord Registration</td>
                    <td className="px-6 py-4 text-center">Not required</td>
                    <td className="px-6 py-4 text-center bg-blue-50 font-semibold">Mandatory (criminal offense)</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 font-medium">Dispute Resolution</td>
                    <td className="px-6 py-4 text-center">County Court</td>
                    <td className="px-6 py-4 text-center bg-blue-50">First-tier Tribunal</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-medium">Primary Legislation</td>
                    <td className="px-6 py-4 text-center">Housing Act 1988</td>
                    <td className="px-6 py-4 text-center bg-blue-50">Private Housing Act 2016</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* What's Included */}
        <section className="container mx-auto px-4 py-16 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">What&apos;s Included in Your Scottish Agreement</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Standard PRT (£14.99)</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    <span>All statutory PRT terms</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    <span>Landlord registration number field</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    <span>Repairing Standard obligations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    <span>Rent review provisions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    <span>Deposit protection clauses</span>
                  </li>
                </ul>
              </div>
              <div className="p-6 rounded-xl border-2 border-blue-200 bg-blue-50">
                <div className="inline-block bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold mb-3">
                  RECOMMENDED
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Premium PRT (£24.99)</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    <span><strong>Everything in Standard plus:</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    <span>Comprehensive inventory sections</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    <span>Detailed Repairing Standard schedule</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    <span>HMO-compatible clauses</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    <span>Professional formatting</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Mid-page CTA */}
        <SeoCtaBlock
          showTrustPositioningBar
          pageType="tenancy"
          variant="section"
          jurisdiction="scotland"
          title="Get Your Scottish Tenancy Agreement"
          description="Generate a fully compliant PRT for your Scottish property in minutes."
        />

        {/* FAQ */}
        <FAQSection faqs={faqs} includeSchema={false} showContactCTA={false} />

        {/* Final CTA */}
        <SeoCtaBlock
          pageType="tenancy"
          variant="final"
          jurisdiction="scotland"
        />

        {/* Related Links */}
        <section className="container mx-auto px-4 py-12">
          <RelatedLinks
            title="Related Resources"
            links={tenancyAgreementScotlandLinks}
          />
        </section>

        {/* Disclaimer */}
        <SeoDisclaimer className="max-w-4xl mx-auto px-4 pb-12" />
      </main>
    </>
  );
}
