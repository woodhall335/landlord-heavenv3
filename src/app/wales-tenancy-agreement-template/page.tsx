import type { Metadata } from 'next';
import Link from 'next/link';
import { getCanonicalUrl } from '@/lib/seo/urls';
import { StructuredData, breadcrumbSchema, articleSchema } from '@/lib/seo/structured-data';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { SeoCtaBlock, SeoDisclaimer } from '@/components/seo/SeoCtaBlock';
import { tenancyAgreementWalesLinks } from '@/lib/seo/internal-links';
import { FAQSection } from '@/components/seo/FAQSection';

export const metadata: Metadata = {
  title: 'Wales Tenancy Agreement Template 2026 | Occupation Contract Download',
  description: 'Download a tenancy agreement template for Wales. Occupation Contracts replaced ASTs in 2022. Renting Homes Act compliant. From £14.99.',
  keywords: [
    'Wales tenancy agreement template',
    'Welsh tenancy agreement',
    'Wales rental agreement',
    'tenancy agreement Wales download',
    'Welsh landlord contract',
    'occupation contract Wales',
    'renting Wales template',
    'Cymru tenancy agreement',
    'Wales letting agreement',
    'Welsh rental contract',
  ],
  alternates: {
    canonical: getCanonicalUrl('/wales-tenancy-agreement-template'),
  },
  openGraph: {
    title: 'Wales Tenancy Agreement Template 2026 | Occupation Contract Download',
    description: 'Download a legally compliant tenancy agreement for Wales. Occupation Contracts since 2022. From £14.99.',
    type: 'article',
    url: getCanonicalUrl('/wales-tenancy-agreement-template'),
  },
};

const faqs = [
  {
    question: 'What type of tenancy agreement do I need for Wales?',
    answer: 'For properties in Wales, you need an Occupation Contract under the Renting Homes (Wales) Act 2016. The old Assured Shorthold Tenancy (AST) system was replaced on 1 December 2022. Private landlords use Standard Occupation Contracts, which give similar possession rights to ASTs but with longer notice periods and stronger tenant protections.',
  },
  {
    question: 'Can I use an English AST for a property in Wales?',
    answer: 'No. ASTs are only valid for properties in England. Using an AST for a Welsh property would be legally non-compliant - it would be treated as a Standard Occupation Contract under Welsh law, but with potentially missing terms and compliance issues. Always use a Wales-specific Occupation Contract template.',
  },
  {
    question: 'What makes Welsh tenancy law different from England?',
    answer: 'Key differences include: (1) 6-month notice period for no-fault eviction vs 2 months in England, (2) Mandatory written statement within 14 days, (3) Stricter fitness for human habitation requirements covering 29 matters, (4) Joint tenants can leave individually without ending the whole contract, (5) Different terminology - tenants are "contract-holders".',
  },
  {
    question: 'How long is the minimum notice period in Wales?',
    answer: 'For Section 173 (no-fault) notices, landlords must give at least 6 months notice and cannot serve it during the first 6 months of occupation. This is significantly longer than England\'s 2-month Section 21 period. Section 181 breach notices have shorter periods depending on the grounds (14 days for serious rent arrears).',
  },
  {
    question: 'Do I need to provide a written statement in Wales?',
    answer: 'Yes, this is mandatory. Under the Renting Homes (Wales) Act, you must provide a written statement of the occupation contract within 14 days of the occupation date. If you don\'t, you cannot serve a Section 173 possession notice until you do. Our template serves as both the contract and the required written statement.',
  },
  {
    question: 'Are deposits still protected in Wales?',
    answer: 'Yes. Deposits must be protected in one of the three authorised schemes (DPS, MyDeposits, or TDS) within 30 days. The same schemes operate in both England and Wales. Failure to protect a deposit affects your ability to serve possession notices and may result in compensation claims.',
  },
  {
    question: 'What documents must I provide to tenants in Wales?',
    answer: 'Before or at the start of occupation, you must provide: (1) Written statement of the occupation contract (within 14 days), (2) EPC, (3) Gas Safety Certificate (if applicable), (4) EICR electrical safety certificate, (5) Deposit protection prescribed information (within 30 days). Our wizard checks these requirements.',
  },
  {
    question: 'What if my property is on the Wales-England border?',
    answer: 'The property\'s location determines which law applies. Properties in Wales (Welsh postcodes/local authority areas) use Occupation Contracts. Properties in England (English postcodes/local authority areas) use ASTs. If you\'re unsure, check which local authority the property falls under.',
  },
  {
    question: 'Can I charge tenant fees in Wales?',
    answer: 'Wales follows similar fee ban rules to England. You cannot charge for most fees - only rent, deposits (capped), holding deposits, and charges for specific contract defaults. The Renting Homes (Fees etc.) (Wales) Act 2019 mirrors England\'s Tenant Fees Act 2019.',
  },
  {
    question: 'What happens when the tenancy agreement ends in Wales?',
    answer: 'When a fixed-term Occupation Contract ends, it automatically becomes a periodic contract on a month-to-month basis with the same terms. You don\'t need to create a new agreement. To end the contract, either party must serve proper notice under Welsh law.',
  },
  {
    question: 'Is our tenancy agreement template bilingual (Welsh/English)?',
    answer: 'Our template uses English with correct Welsh legal terminology. While there\'s no legal requirement for bilingual documents, contract-holders have the right to communicate in Welsh. If a contract-holder requests Welsh language documents, you should make reasonable efforts to accommodate this.',
  },
  {
    question: 'How does this template help with eviction later?',
    answer: 'Our Occupation Contract template includes all terms required for valid Section 173 and Section 181 notices. If you later need to evict, our eviction products use the same case data from your contract, ensuring consistency and compliance with Welsh eviction procedures.',
  },
];

export default function WalesTenancyAgreementTemplatePage() {
  return (
    <>
      <StructuredData
        data={articleSchema({
          headline: 'Wales Tenancy Agreement Template 2026',
          description: 'Download a legally compliant tenancy agreement template for Wales (Occupation Contract).',
          url: getCanonicalUrl('/wales-tenancy-agreement-template'),
          datePublished: '2026-01-01',
          dateModified: '2026-01-25',
        })}
      />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          { name: 'Tenancy Agreement Packs', url: 'https://landlordheaven.co.uk/products/ast' },
          { name: 'Wales Tenancy Agreement', url: 'https://landlordheaven.co.uk/wales-tenancy-agreement-template' },
        ])}
      />

      <main className="min-h-screen bg-gradient-to-br from-red-50 via-white to-green-50">
        {/* Breadcrumb Navigation */}
        <div className="container mx-auto px-4 pt-24 pb-4">
          <nav className="text-sm text-gray-600">
            <Link href="/" className="hover:text-red-600">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/products/ast" className="hover:text-red-600">Tenancy Agreement Packs</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">Wales Tenancy Agreement</span>
          </nav>
        </div>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-4">
              <img src="/gb-wls.svg" alt="Wales flag" className="w-12 h-12" />
            </div>
            <span className="inline-flex items-center gap-2 bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              Cytundeb Tenantiaeth Cymru
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Wales Tenancy Agreement Template
            </h1>
            <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
              Looking for a <strong>tenancy agreement for Wales</strong>? Since December 2022,
              Welsh properties require <strong>Occupation Contracts</strong> — not ASTs.
              Our template is fully compliant with the Renting Homes (Wales) Act 2016.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/wizard?product=ast_standard&src=seo_wales_tenancy&topic=tenancy&jurisdiction=wales"
                className="inline-flex items-center gap-2 bg-white border-2 border-red-600 text-red-600 px-6 py-3 rounded-lg font-semibold hover:bg-red-50 transition-colors"
              >
                Standard Contract — £14.99
              </Link>
              <Link
                href="/wizard?product=ast_premium&src=seo_wales_tenancy&topic=tenancy&jurisdiction=wales"
                className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Premium Contract — £24.99
              </Link>
            </div>
            <p className="mt-3 text-sm text-gray-600">
              Compare features and upgrade options in the{' '}
              <Link href="/products/ast" className="text-primary font-semibold hover:underline">
                Tenancy Agreement Pack overview
              </Link>
              .
            </p>
            <p className="mt-4 text-sm text-gray-500">Renting Homes Act compliant • Written statement included • Instant PDF</p>
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
                <h2 className="text-xl font-bold text-amber-900 mb-2">Wales Uses Occupation Contracts, Not ASTs</h2>
                <p className="text-amber-800">
                  If you&apos;re searching for a &ldquo;tenancy agreement template&rdquo; for a Welsh property, you need an
                  <strong> Occupation Contract</strong>. The old AST system only applies to England. Using the
                  wrong type of agreement could leave you unable to evict or facing compliance issues.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Wales vs England Comparison */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Wales vs England: Key Differences</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-white rounded-xl shadow-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-900 text-white">
                    <th className="px-6 py-4 text-left font-semibold">Aspect</th>
                    <th className="px-6 py-4 text-center font-semibold">England</th>
                    <th className="px-6 py-4 text-center font-semibold bg-red-700">Wales</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 font-medium">Agreement Type</td>
                    <td className="px-6 py-4 text-center">Assured Shorthold Tenancy (AST)</td>
                    <td className="px-6 py-4 text-center bg-red-50">Occupation Contract</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 font-medium">No-Fault Notice Period</td>
                    <td className="px-6 py-4 text-center">2 months (Section 21)</td>
                    <td className="px-6 py-4 text-center bg-red-50 font-semibold">6 months (Section 173)</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-medium">Written Statement</td>
                    <td className="px-6 py-4 text-center">Recommended</td>
                    <td className="px-6 py-4 text-center bg-red-50 font-semibold">Mandatory (14 days)</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 font-medium">Tenant Terminology</td>
                    <td className="px-6 py-4 text-center">Tenant</td>
                    <td className="px-6 py-4 text-center bg-red-50">Contract-holder</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-medium">Joint Tenant Departure</td>
                    <td className="px-6 py-4 text-center">Ends whole tenancy</td>
                    <td className="px-6 py-4 text-center bg-red-50">Can leave individually</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 font-medium">Fitness Standards</td>
                    <td className="px-6 py-4 text-center">Implied terms</td>
                    <td className="px-6 py-4 text-center bg-red-50">29 explicit matters</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-medium">Primary Legislation</td>
                    <td className="px-6 py-4 text-center">Housing Act 1988</td>
                    <td className="px-6 py-4 text-center bg-red-50">Renting Homes Act 2016</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* What's Included */}
        <section className="container mx-auto px-4 py-16 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">What&apos;s Included in Your Wales Agreement</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Standard Contract (£14.99)</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    <span>Complete written statement (mandatory)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    <span>All fundamental terms (set by law)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    <span>Default supplementary terms</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    <span>Deposit protection clauses</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    <span>Section 173/181 compliant provisions</span>
                  </li>
                </ul>
              </div>
              <div className="p-6 rounded-xl border-2 border-red-200 bg-red-50">
                <div className="inline-block bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold mb-3">
                  RECOMMENDED
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Premium Contract (£24.99)</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    <span><strong>Everything in Standard plus:</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    <span>Comprehensive inventory sections</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    <span>Additional supplementary terms</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    <span>HMO-compatible clauses</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
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
          jurisdiction="wales"
          title="Get Your Wales Tenancy Agreement"
          description="Generate a Renting Homes Act compliant Occupation Contract in minutes."
        />

        {/* Cross-sell */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">When Things Don&apos;t Go to Plan</h2>
            <p className="text-gray-700 mb-6">
              Even with a perfect agreement, issues can arise. Our products work together for Welsh landlords:
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <Link href="/products/notice-only" className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-gray-900">Welsh Eviction Notices</h3>
                <p className="text-sm text-gray-600 mb-2">Section 173 & 181 notices</p>
                <span className="text-red-600 font-medium">£49.99</span>
              </Link>
              <Link href="/products/money-claim" className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-gray-900">Welsh Money Claims</h3>
                <p className="text-sm text-gray-600 mb-2">Recover rent & damage</p>
                <span className="text-red-600 font-medium">£99.99</span>
              </Link>
              <Link href="/ask-heaven" className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-gray-900">Ask Heaven for Wales</h3>
                <p className="text-sm text-gray-600 mb-2">Free landlord Q&A</p>
                <span className="text-green-600 font-medium">Free</span>
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <FAQSection faqs={faqs} includeSchema={false} showContactCTA={false} />

        {/* Final CTA */}
        <SeoCtaBlock
          pageType="tenancy"
          variant="final"
          jurisdiction="wales"
        />

        {/* Related Links */}
        <section className="container mx-auto px-4 py-12">
          <RelatedLinks
            title="Related Resources"
            links={tenancyAgreementWalesLinks}
          />
        </section>

        {/* Disclaimer */}
        <SeoDisclaimer className="max-w-4xl mx-auto px-4 pb-12" />
      </main>
    </>
  );
}
