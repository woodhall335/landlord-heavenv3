import type { Metadata } from 'next';
import Link from 'next/link';
import { getCanonicalUrl } from '@/lib/seo/urls';
import { StructuredData, faqPageSchema, breadcrumbSchema, articleSchema } from '@/lib/seo/structured-data';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { SeoCtaBlock, SeoDisclaimer } from '@/components/seo/SeoCtaBlock';
import { tenancyAgreementWalesLinks } from '@/lib/seo/internal-links';

export const metadata: Metadata = {
  title: 'Occupation Contract Template Wales 2026 | Renting Homes Act Compliant',
  description: 'Download a legally compliant Occupation Contract template for Wales. Fully compliant with Renting Homes (Wales) Act 2016. Written statement included. From £14.99.',
  keywords: [
    'occupation contract template Wales',
    'Welsh tenancy agreement',
    'renting homes Wales act',
    'standard occupation contract',
    'Wales rental agreement',
    'contract holder agreement',
    'Welsh landlord forms',
    'occupation contract download',
    'Wales tenancy template',
    'Cymru tenancy agreement',
  ],
  alternates: {
    canonical: getCanonicalUrl('/occupation-contract-template-wales'),
  },
  openGraph: {
    title: 'Occupation Contract Template Wales 2026 | Renting Homes Act Compliant',
    description: 'Download an Occupation Contract template for Wales. Renting Homes (Wales) Act 2016 compliant. From £14.99.',
    type: 'article',
    url: getCanonicalUrl('/occupation-contract-template-wales'),
  },
};

const faqs = [
  {
    question: 'What is an Occupation Contract in Wales?',
    answer: 'An Occupation Contract is the legal agreement used for residential lettings in Wales since 1 December 2022, replacing the old Assured Shorthold Tenancy (AST) system. It is governed by the Renting Homes (Wales) Act 2016 and represents a fundamental change in how tenancies work in Wales. Under this system, tenants are called "contract-holders" and have clearer rights and protections than under the previous AST framework.',
  },
  {
    question: 'Why can\'t I use an AST for my Welsh property?',
    answer: 'The Renting Homes (Wales) Act 2016 replaced all previous tenancy types in Wales with Occupation Contracts. Since 1 December 2022, it is not legally possible to create a new AST for a property in Wales. Any agreement purporting to be an AST would be automatically treated as a Standard Occupation Contract under Welsh law. Using our Wales-specific template ensures you have the correct agreement type with all required terms.',
  },
  {
    question: 'What is the difference between Standard and Secure Occupation Contracts?',
    answer: 'Standard Occupation Contracts are used by private landlords and most housing associations. They allow landlords to recover possession using Section 173 (no-fault) or Section 181 (breach) notices. Secure Occupation Contracts are used primarily by local authorities and offer contract-holders greater security of tenure, succession rights, and the right to exchange with other secure contract-holders. Our templates generate Standard Occupation Contracts for private landlords.',
  },
  {
    question: 'What notice period is required to end an Occupation Contract?',
    answer: 'For a Section 173 no-fault notice, landlords must give at least 6 months\' notice and cannot serve it during the first 6 months of occupation. This is significantly longer than England\'s 2-month Section 21 notice. For Section 181 breach notices (rent arrears, anti-social behaviour), shorter notice periods apply depending on the grounds. Our templates include the correct notice provisions for Welsh law.',
  },
  {
    question: 'Do I need to provide a written statement?',
    answer: 'Yes. Under the Renting Homes (Wales) Act 2016, landlords must provide a written statement of the occupation contract within 14 days of the occupation date. Our template serves as both the written statement and the full contract terms. Failure to provide a written statement within the required timeframe restricts your ability to serve possession notices until it is provided.',
  },
  {
    question: 'What terms must an Occupation Contract include?',
    answer: 'Occupation Contracts must include: (1) Fundamental terms that cannot be changed (like the requirement to keep the property fit for human habitation), (2) Supplementary terms that can be modified by agreement, (3) Additional terms agreed between the parties. Our templates include all required fundamental and supplementary terms, ensuring full compliance with Welsh law.',
  },
  {
    question: 'How are deposits handled under Welsh law?',
    answer: 'Deposits in Wales must still be protected in one of the three authorised schemes (DPS, MyDeposits, or TDS) within 30 days. The rules are similar to England. However, the consequences of not protecting a deposit may affect your ability to serve Section 173 notices. Our templates include the required deposit protection clauses and prescribed information.',
  },
  {
    question: 'Can joint contract-holders leave individually in Wales?',
    answer: 'Yes, this is a key difference from England. Under the Renting Homes (Wales) Act, a joint contract-holder can give notice to leave the contract without ending it for the other contract-holders. The remaining contract-holders continue under the same agreement. This protects victims of domestic abuse and allows flexibility in shared living arrangements.',
  },
  {
    question: 'What are the fitness for human habitation requirements?',
    answer: 'The Renting Homes (Wales) Act 2016 requires landlords to ensure properties meet 29 matters of fitness for human habitation, including: adequate heating, absence of damp and mould, proper ventilation, adequate natural and artificial lighting, satisfactory water supply, and sound structural condition. These requirements are stricter than England\'s implied terms.',
  },
  {
    question: 'How does this template link to eviction in Wales?',
    answer: 'Our Occupation Contract template is designed to work seamlessly with the Welsh eviction process. If you later need to serve a Section 173 or Section 181 notice, our eviction products use the same case information from your contract. The contract includes all the terms and provisions necessary to maintain a valid eviction pathway under Welsh law.',
  },
];

export default function OccupationContractTemplateWalesPage() {
  return (
    <>
      <StructuredData
        data={articleSchema({
          headline: 'Occupation Contract Template Wales 2026',
          description: 'Download a legally compliant Occupation Contract template for Wales under the Renting Homes (Wales) Act 2016.',
          url: getCanonicalUrl('/occupation-contract-template-wales'),
          datePublished: '2026-01-01',
          dateModified: '2026-01-25',
        })}
      />
      <StructuredData data={faqPageSchema(faqs)} />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          { name: 'Tenancy Agreements', url: 'https://landlordheaven.co.uk/tenancy-agreements' },
          { name: 'Occupation Contract Template Wales', url: 'https://landlordheaven.co.uk/occupation-contract-template-wales' },
        ])}
      />

      <main className="min-h-screen bg-gradient-to-br from-red-50 via-white to-green-50">
        {/* Breadcrumb Navigation */}
        <div className="container mx-auto px-4 pt-24 pb-4">
          <nav className="text-sm text-gray-600">
            <Link href="/" className="hover:text-red-600">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/tenancy-agreements" className="hover:text-red-600">Tenancy Agreements</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">Occupation Contract Wales</span>
          </nav>
        </div>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-4">
              <img src="/gb-wls.svg" alt="Wales flag" className="w-12 h-12" />
            </div>
            <span className="inline-flex items-center gap-2 bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              Renting Homes (Wales) Act 2016
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Occupation Contract Template for Wales
            </h1>
            <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
              Create a <strong>legally compliant Occupation Contract</strong> for your Welsh property.
              Our template meets all requirements of the Renting Homes (Wales) Act 2016,
              including the mandatory written statement.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/wizard?product=ast_standard&src=seo_occupation_wales&topic=tenancy&jurisdiction=wales"
                className="inline-flex items-center gap-2 bg-white border-2 border-red-600 text-red-600 px-6 py-3 rounded-lg font-semibold hover:bg-red-50 transition-colors"
              >
                Standard Contract — £14.99
              </Link>
              <Link
                href="/wizard?product=ast_premium&src=seo_occupation_wales&topic=tenancy&jurisdiction=wales"
                className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Premium Contract — £24.99
              </Link>
            </div>
            <p className="mt-4 text-sm text-gray-500">Written statement included • Instant PDF • Fully compliant</p>
          </div>
        </section>

        {/* Trust Signals */}
        <section className="py-8 bg-white border-y border-gray-200">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-600">
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                Renting Homes Act 2016 Compliant
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                Written Statement Included
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                All Fundamental Terms
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                Fitness for Habitation Terms
              </span>
            </div>
          </div>
        </section>

        {/* Why Wales Is Different */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Wales Requires a Different Agreement</h2>
            <div className="prose prose-lg max-w-none text-gray-700">
              <p>
                Since <strong>1 December 2022</strong>, Wales has its own tenancy law completely separate from England.
                The <strong>Renting Homes (Wales) Act 2016</strong> replaced all previous tenancy types with
                Occupation Contracts, creating a fundamentally different framework.
              </p>
              <div className="bg-red-50 border-l-4 border-red-500 p-4 my-6">
                <h3 className="font-semibold text-red-900">You Cannot Use an English AST in Wales</h3>
                <p className="text-red-800">
                  Assured Shorthold Tenancies (ASTs) are only valid in England. Any attempt to use an AST
                  for a Welsh property will be automatically treated as a Standard Occupation Contract,
                  but with potentially missing terms and compliance issues. Always use a Wales-specific template.
                </p>
              </div>
              <p>Key differences between Wales and England include:</p>
              <ul className="space-y-2">
                <li><strong>6-month notice period</strong> — Wales requires 6 months for no-fault eviction (England: 2 months)</li>
                <li><strong>Written statement mandatory</strong> — Must be provided within 14 days or possession notices restricted</li>
                <li><strong>Contract-holder terminology</strong> — Tenants are called &ldquo;contract-holders&rdquo; with specific rights</li>
                <li><strong>29 fitness matters</strong> — Stricter property condition requirements</li>
                <li><strong>Joint contract-holder flexibility</strong> — One can leave without ending the whole contract</li>
              </ul>
            </div>
          </div>
        </section>

        {/* What's Included */}
        <section className="container mx-auto px-4 py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">What&apos;s Included in Our Template</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-red-900 mb-3">Fundamental Terms</h3>
                <p className="text-gray-600 text-sm">
                  All required fundamental terms that cannot be changed, including fitness for human habitation,
                  landlord repair obligations, and contract-holder rights.
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-red-900 mb-3">Supplementary Terms</h3>
                <p className="text-gray-600 text-sm">
                  Default supplementary terms plus options to customise rent review, deposit handling,
                  access arrangements, and property-specific provisions.
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-red-900 mb-3">Written Statement</h3>
                <p className="text-gray-600 text-sm">
                  Our contract serves as the mandatory written statement required within 14 days.
                  Provide it at signing to meet your legal obligations immediately.
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-red-900 mb-3">Deposit Protection</h3>
                <p className="text-gray-600 text-sm">
                  Full deposit protection clauses and prescribed information required under Welsh law.
                  Compatible with all three authorised schemes.
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-red-900 mb-3">Notice Provisions</h3>
                <p className="text-gray-600 text-sm">
                  Clear terms explaining Section 173 and Section 181 notice procedures,
                  ensuring both parties understand the eviction pathway.
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-red-900 mb-3">Welsh Language Option</h3>
                <p className="text-gray-600 text-sm">
                  Our contracts use terminology consistent with Welsh law. Contract-holders have
                  the right to communicate with you in Welsh if they prefer.
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
          title="Create Your Welsh Occupation Contract"
          description="Generate a fully compliant Occupation Contract for your Welsh property in minutes."
        />

        {/* Cross-sell */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">When You Need to Take Further Action</h2>
            <p className="text-gray-700 mb-6">
              Even with a perfect Occupation Contract, problems can arise. Our products work seamlessly with Welsh law:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <Link href="/products/notice-only" className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-gray-900">Wales Eviction Notices — £49.99</h3>
                <p className="text-sm text-gray-600">Section 173 and Section 181 notices for Welsh properties</p>
              </Link>
              <Link href="/products/money-claim" className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-gray-900">Money Claim Pack — £149.99</h3>
                <p className="text-sm text-gray-600">Recover rent arrears and damage costs through Welsh courts</p>
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

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
