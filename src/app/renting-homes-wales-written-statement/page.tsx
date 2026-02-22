import type { Metadata } from 'next';
import Link from 'next/link';
import { getCanonicalUrl } from '@/lib/seo/urls';
import { StructuredData, faqPageSchema, breadcrumbSchema, articleSchema } from '@/lib/seo/structured-data';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { SeoCtaBlock, SeoDisclaimer } from '@/components/seo/SeoCtaBlock';
import { tenancyAgreementWalesLinks } from '@/lib/seo/internal-links';
import { FAQSection } from '@/components/seo/FAQSection';

export const metadata: Metadata = {
  title: 'Renting Homes Wales Written Statement 2026 | Legal Requirements Explained',
  description: 'Written statement requirements under the Renting Homes (Wales) Act 2016. 14-day deadline, required content, and compliant template from £14.99.',
  keywords: [
    'renting homes Wales written statement',
    'Wales written statement requirement',
    'occupation contract written statement',
    'Welsh tenancy written statement',
    'renting homes act 2016 statement',
    '14 day written statement Wales',
    'landlord written statement Wales',
    'contract holder written statement',
    'Welsh landlord obligations',
    'Wales tenancy documentation',
  ],
  alternates: {
    canonical: getCanonicalUrl('/renting-homes-wales-written-statement'),
  },
  openGraph: {
    title: 'Renting Homes Wales Written Statement 2026 | Legal Requirements Explained',
    description: 'Understand written statement requirements under the Renting Homes (Wales) Act 2016. Compliant template from £14.99.',
    type: 'article',
    url: getCanonicalUrl('/renting-homes-wales-written-statement'),
  },
};

const faqs = [
  {
    question: 'What is a written statement under the Renting Homes (Wales) Act?',
    answer: 'A written statement is a mandatory document that landlords in Wales must provide to contract-holders (tenants). It sets out the terms of the occupation contract, including all fundamental terms, supplementary terms, and any additional terms agreed between the parties. It must be provided within 14 days of the occupation date and serves as the official record of the tenancy agreement.',
  },
  {
    question: 'What is the 14-day deadline for the written statement?',
    answer: 'Under Section 31 of the Renting Homes (Wales) Act 2016, landlords must provide the written statement within 14 days of the "occupation date" — the date the contract-holder is entitled to begin occupying the property. This is typically the tenancy start date. Providing the statement at signing (before occupation starts) is the safest approach and what our template enables.',
  },
  {
    question: 'What happens if I don\'t provide the written statement on time?',
    answer: 'Failing to provide the written statement within 14 days has serious consequences: (1) You cannot serve a Section 173 (no-fault) possession notice until you have provided it, (2) The contract-holder can apply to court for a declaration of terms and compensation, (3) You may face financial penalties. The restriction on possession notices continues until the statement is properly provided.',
  },
  {
    question: 'What must the written statement contain?',
    answer: 'The written statement must include: (1) Names of the landlord and all contract-holders, (2) Property address, (3) Occupation date, (4) Rent amount and payment date, (5) All fundamental terms (set by law), (6) All supplementary terms (defaults or as modified), (7) Any additional terms agreed, (8) Whether it is a standard or secure occupation contract, (9) Key information about rights and obligations.',
  },
  {
    question: 'Is the written statement the same as the occupation contract?',
    answer: 'The written statement IS the formal documentation of the occupation contract. While the contract itself exists from the occupation date (even if verbal), the written statement is the legal record of its terms. Our template serves as both the occupation contract and the written statement, fulfilling all requirements in one document.',
  },
  {
    question: 'What are fundamental terms in the written statement?',
    answer: 'Fundamental terms are set by law and cannot be changed or removed. They include: the landlord\'s obligation to keep the property fit for human habitation, the landlord\'s repair obligations, the contract-holder\'s right to occupy, prohibition on anti-social behaviour, and rules about variation and termination. Our template includes all fundamental terms as required by the Renting Homes (Wales) Act.',
  },
  {
    question: 'What are supplementary terms?',
    answer: 'Supplementary terms are default terms that apply unless the parties agree to change them. They cover matters like rent payment methods, deposit handling, access for repairs, subletting, and keeping pets. Some supplementary terms can be modified or removed by agreement; others must be included. Our wizard helps you customise supplementary terms appropriately.',
  },
  {
    question: 'Can I modify the written statement after it\'s been given?',
    answer: 'Yes, but only through proper procedures. Changes require either: (1) Agreement from all parties in writing, or (2) Following the statutory variation procedure with proper notice. Fundamental terms cannot be changed at all. Any variation should be documented as an addendum to the original written statement.',
  },
  {
    question: 'Do I need to provide the written statement in Welsh?',
    answer: 'There is no legal requirement to provide the written statement in Welsh, but contract-holders have the right to communicate with you in Welsh if they choose. If a contract-holder requests Welsh language documents, you should make reasonable efforts to accommodate this. Our templates use the correct Welsh legal terminology in English.',
  },
  {
    question: 'What if the contract-holder disputes the written statement terms?',
    answer: 'If a contract-holder believes the written statement doesn\'t accurately reflect the agreed terms, they can apply to the county court within 6 months for a declaration of the correct terms. The court can order corrections and, if the landlord deliberately or negligently provided incorrect information, award compensation. This is why using a professionally drafted template is important.',
  },
  {
    question: 'Does the written statement replace the need for other documents?',
    answer: 'No. You must still provide: (1) EPC before marketing and at occupation, (2) Gas Safety Certificate annually (if applicable), (3) EICR for electrical safety, (4) Deposit protection prescribed information within 30 days. The written statement confirms you have (or will) provide these documents but doesn\'t replace them.',
  },
  {
    question: 'Can I use a generic document draft for the written statement?',
    answer: 'Using a generic document draft is risky. The written statement must include specific fundamental and supplementary terms as defined by Welsh regulations. Generic UK templates or England ASTs don\'t contain the correct Welsh terms. Our Wales-specific template ensures all required terms are included and properly formatted.',
  },
];

export default function RentingHomesWalesWrittenStatementPage() {
  return (
    <>
      <StructuredData
        data={articleSchema({
          headline: 'Renting Homes Wales Written Statement 2026',
          description: 'Understand the written statement requirements under the Renting Homes (Wales) Act 2016.',
          url: getCanonicalUrl('/renting-homes-wales-written-statement'),
          datePublished: '2026-01-01',
          dateModified: '2026-01-25',
        })}
      />
      <StructuredData data={faqPageSchema(faqs)} />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          { name: 'Tenancy Agreements', url: 'https://landlordheaven.co.uk/products/ast' },
          { name: 'Written Statement Wales', url: 'https://landlordheaven.co.uk/renting-homes-wales-written-statement' },
        ])}
      />

      <main className="min-h-screen bg-gradient-to-br from-red-50 via-white to-amber-50">
        {/* Breadcrumb Navigation */}
        <div className="container mx-auto px-4 pt-24 pb-4">
          <nav className="text-sm text-gray-600">
            <Link href="/" className="hover:text-red-600">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/products/ast" className="hover:text-red-600">Tenancy Agreements</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">Written Statement Wales</span>
          </nav>
        </div>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-4">
              <img src="/gb-wls.svg" alt="Wales flag" className="w-12 h-12" />
            </div>
            <span className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              Legal Requirement Guide
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Written Statement Requirements for Wales Landlords
            </h1>
            <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
              The <strong>Renting Homes (Wales) Act 2016</strong> requires all landlords to provide a
              <strong> written statement</strong> within 14 days of occupation.
              Failing to comply restricts your ability to serve possession notices.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/wizard?product=ast_standard&src=seo_written_statement_wales&topic=tenancy&jurisdiction=wales"
                className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Get Compliant Written Statement — £14.99
              </Link>
            </div>
            <p className="mt-4 text-sm text-gray-500">Includes all fundamental & supplementary terms required by law</p>
          </div>
        </section>

        {/* 14-Day Deadline Warning */}
        <section className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto bg-red-100 border-2 border-red-300 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-red-900 mb-2">14-Day Deadline is Strictly Enforced</h2>
                <p className="text-red-800">
                  You must provide the written statement within <strong>14 days</strong> of the occupation date.
                  If you miss this deadline, you <strong>cannot serve a Section 173 no-fault possession notice</strong> until
                  you provide it. This restriction significantly impacts your ability to regain your property.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* What Must Be Included */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">What the Written Statement Must Include</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Basic Information</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    <span>Landlord&apos;s name and address</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    <span>Contract-holder(s) names</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    <span>Property address</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    <span>Occupation date</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    <span>Rent amount and payment date</span>
                  </li>
                </ul>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Fundamental Terms</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    <span>Fitness for human habitation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    <span>Landlord repair obligations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    <span>Contract-holder right to occupy</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    <span>Anti-social behaviour prohibition</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    <span>Termination and notice rules</span>
                  </li>
                </ul>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 md:col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Supplementary & Additional Terms</h3>
                <div className="grid md:grid-cols-2 gap-4 text-gray-600">
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                      <span>Deposit protection requirements</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                      <span>Access for inspections/repairs</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                      <span>Rent payment methods</span>
                    </li>
                  </ul>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                      <span>Pet policy provisions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                      <span>Utilities and bills responsibilities</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                      <span>Garden and exterior maintenance</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Consequences Section */}
        <section className="container mx-auto px-4 py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Consequences of Not Providing the Written Statement</h2>
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500">
                <h3 className="font-semibold text-gray-900 mb-2">Section 173 Notices Blocked</h3>
                <p className="text-gray-600">
                  You cannot serve a valid Section 173 (no-fault) possession notice until you have provided
                  the written statement. This means you cannot regain your property without grounds even
                  after the initial 6-month period.
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-orange-500">
                <h3 className="font-semibold text-gray-900 mb-2">Court Applications by Contract-Holder</h3>
                <p className="text-gray-600">
                  Contract-holders can apply to the county court for a declaration of the contract terms
                  and may be awarded compensation if you failed to provide the statement or provided
                  incorrect information.
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-amber-500">
                <h3 className="font-semibold text-gray-900 mb-2">Terms May Be Disputed</h3>
                <p className="text-gray-600">
                  Without a written statement, proving what terms were agreed becomes difficult.
                  Contract-holders may dispute rent amounts, deposit terms, or other obligations,
                  and courts will apply default terms where evidence is lacking.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Mid-page CTA */}
        <SeoCtaBlock
          pageType="tenancy"
          variant="section"
          jurisdiction="wales"
          title="Get Your Compliant Written Statement"
          description="Our Occupation Contract template includes all required terms and serves as your written statement."
        />

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
