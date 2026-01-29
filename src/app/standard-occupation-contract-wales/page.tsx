import type { Metadata } from 'next';
import Link from 'next/link';
import { getCanonicalUrl } from '@/lib/seo/urls';
import { StructuredData, faqPageSchema, breadcrumbSchema, articleSchema } from '@/lib/seo/structured-data';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { SeoCtaBlock, SeoDisclaimer } from '@/components/seo/SeoCtaBlock';
import { tenancyAgreementWalesLinks } from '@/lib/seo/internal-links';

export const metadata: Metadata = {
  title: 'Standard Occupation Contract Wales 2026 | Private Landlord Template',
  description: 'Create a Standard Occupation Contract for private renting in Wales. The replacement for ASTs under Renting Homes (Wales) Act 2016. Section 173 & 181 compliant. From £14.99.',
  keywords: [
    'standard occupation contract Wales',
    'Wales private landlord contract',
    'standard occupation contract template',
    'private renting Wales',
    'renting homes act standard contract',
    'Welsh landlord agreement',
    'Wales rental contract',
    'section 173 Wales',
    'occupation contract private landlord',
    'Welsh tenancy for landlords',
  ],
  alternates: {
    canonical: getCanonicalUrl('/standard-occupation-contract-wales'),
  },
  openGraph: {
    title: 'Standard Occupation Contract Wales 2026 | Private Landlord Template',
    description: 'Create a Standard Occupation Contract for private renting in Wales. From £14.99.',
    type: 'article',
    url: getCanonicalUrl('/standard-occupation-contract-wales'),
  },
};

const faqs = [
  {
    question: 'What is a Standard Occupation Contract?',
    answer: 'A Standard Occupation Contract is the type of occupation contract used by private landlords in Wales under the Renting Homes (Wales) Act 2016. It replaced the Assured Shorthold Tenancy (AST) from 1 December 2022 and gives landlords similar rights to recover possession while providing contract-holders (tenants) with clearer protections and a minimum 6-month notice period for no-fault evictions.',
  },
  {
    question: 'What is the difference between Standard and Secure Occupation Contracts?',
    answer: 'Standard Occupation Contracts are used by private landlords and allow possession to be recovered using Section 173 (no-fault) or Section 181 (breach) notices. Secure Occupation Contracts are used mainly by local authorities and housing associations, offering contract-holders much greater security of tenure, succession rights, and the right to exchange properties. Private landlords almost always use Standard contracts.',
  },
  {
    question: 'Can a private landlord use a Secure Occupation Contract?',
    answer: 'While not prohibited, it would be unusual for a private landlord to offer a Secure Occupation Contract. Doing so would significantly limit your ability to recover possession and grant the contract-holder additional rights typically associated with social housing. Our templates generate Standard Occupation Contracts appropriate for private letting.',
  },
  {
    question: 'What are the notice periods for Standard Occupation Contracts?',
    answer: 'For Section 173 (no-fault) notices: minimum 6 months, and cannot be served during the first 6 months of occupation. For Section 181 (breach) notices: varies by ground - 14 days for serious rent arrears (8+ weeks), 1 month for other rent arrears, and other periods for different breach types. Our templates include clear notice period information.',
  },
  {
    question: 'How does a Standard Occupation Contract become periodic?',
    answer: 'A Standard Occupation Contract can be created as a fixed-term contract (e.g., 6 or 12 months) or as a periodic contract from the start. If fixed-term, it automatically becomes a periodic contract when the term ends unless a new fixed term is agreed or notice is served. Periodic contracts continue month-to-month on the same terms.',
  },
  {
    question: 'What fundamental terms apply to Standard Occupation Contracts?',
    answer: 'Fundamental terms are set by law and cannot be changed. For Standard Occupation Contracts, these include: the landlord\'s duty to keep the property fit for human habitation, repair obligations for structure and installations, the contract-holder\'s right to occupy, prohibition on anti-social behaviour, rules about deposits and their protection, and the contract-holder\'s right to occupy despite landlord changes.',
  },
  {
    question: 'Can I include a break clause in a Standard Occupation Contract?',
    answer: 'Yes. You can include a break clause allowing either party to end a fixed-term contract early with notice. The break clause becomes part of the supplementary or additional terms. However, landlords cannot use a break clause to circumvent the 6-month notice requirement for no-fault possession - Section 173 rules still apply.',
  },
  {
    question: 'What happens to joint contract-holders under a Standard Occupation Contract?',
    answer: 'Welsh law allows individual joint contract-holders to leave the contract without ending it for others (unlike England where one tenant\'s notice ends the whole tenancy). This protects victims of domestic abuse and allows flexibility. The remaining contract-holders continue under the same agreement with joint liability for rent.',
  },
  {
    question: 'Do Standard Occupation Contracts require deposit protection?',
    answer: 'Yes. Deposits under Standard Occupation Contracts must be protected in one of the three authorised schemes (DPS, MyDeposits, or TDS) within 30 days. The prescribed information must also be provided. Failure to protect the deposit can affect your ability to serve Section 173 notices and may result in compensation claims.',
  },
  {
    question: 'Can I convert an old AST to a Standard Occupation Contract?',
    answer: 'Existing ASTs in Wales automatically converted to Standard Occupation Contracts on 1 December 2022. The core terms remained the same, but Welsh law now applies. If you haven\'t updated your documentation, you should provide a written statement confirming the conversion and current terms to be fully compliant.',
  },
  {
    question: 'What grounds can I use to evict under a Standard Occupation Contract?',
    answer: 'Section 173 provides no-fault grounds (6 months notice, not in first 6 months). Section 181 provides breach grounds including: serious rent arrears (8+ weeks), other rent arrears (2+ months), breach of contract, anti-social behaviour, domestic abuse, death of contract-holder, abandonment, and others. Each ground has specific evidence requirements.',
  },
  {
    question: 'How does rent review work under a Standard Occupation Contract?',
    answer: 'Supplementary terms cover rent review. For periodic contracts, the landlord must give at least 2 months notice of a rent increase. For fixed-term contracts, rent can only increase if the contract specifically allows it. Contract-holders can challenge excessive increases to the Rent Assessment Committee Wales.',
  },
];

export default function StandardOccupationContractWalesPage() {
  return (
    <>
      <StructuredData
        data={articleSchema({
          headline: 'Standard Occupation Contract Wales 2026',
          description: 'Create a Standard Occupation Contract for private renting in Wales under the Renting Homes (Wales) Act 2016.',
          url: getCanonicalUrl('/standard-occupation-contract-wales'),
          datePublished: '2026-01-01',
          dateModified: '2026-01-25',
        })}
      />
      <StructuredData data={faqPageSchema(faqs)} />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          { name: 'Tenancy Agreements', url: 'https://landlordheaven.co.uk/tenancy-agreements' },
          { name: 'Standard Occupation Contract Wales', url: 'https://landlordheaven.co.uk/standard-occupation-contract-wales' },
        ])}
      />

      <main className="min-h-screen bg-gradient-to-br from-green-50 via-white to-red-50">
        {/* Breadcrumb Navigation */}
        <div className="container mx-auto px-4 pt-24 pb-4">
          <nav className="text-sm text-gray-600">
            <Link href="/" className="hover:text-red-600">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/tenancy-agreements" className="hover:text-red-600">Tenancy Agreements</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">Standard Occupation Contract</span>
          </nav>
        </div>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-4">
              <img src="/gb-wls.svg" alt="Wales flag" className="w-12 h-12" />
            </div>
            <span className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              For Private Landlords
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Standard Occupation Contract for Wales
            </h1>
            <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
              The <strong>Standard Occupation Contract</strong> is the agreement type for private landlords
              in Wales. It replaced the AST in December 2022 and balances landlord possession rights
              with enhanced contract-holder protections.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/wizard?product=ast_standard&src=seo_standard_contract_wales&topic=tenancy&jurisdiction=wales"
                className="inline-flex items-center gap-2 bg-white border-2 border-green-600 text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors"
              >
                Standard Contract — £14.99
              </Link>
              <Link
                href="/wizard?product=ast_premium&src=seo_standard_contract_wales&topic=tenancy&jurisdiction=wales"
                className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Premium Contract — £24.99
              </Link>
            </div>
            <p className="mt-4 text-sm text-gray-500">Includes written statement • Section 173/181 compliant • Instant PDF</p>
          </div>
        </section>

        {/* Standard vs Secure Comparison */}
        <section className="container mx-auto px-4 py-16 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Standard vs Secure: Which Do You Need?</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-green-50 p-6 rounded-xl border-2 border-green-200">
                <div className="inline-block bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold mb-3">
                  FOR PRIVATE LANDLORDS
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Standard Occupation Contract</h3>
                <ul className="space-y-2 text-gray-700 mb-4">
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    <span>No-fault possession via Section 173</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    <span>6-month minimum notice period</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    <span>Breach grounds via Section 181</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    <span>No succession rights</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    <span>Flexible for buy-to-let investment</span>
                  </li>
                </ul>
                <div className="text-center">
                  <span className="text-green-700 font-semibold">This is what you need</span>
                </div>
              </div>
              <div className="bg-gray-50 p-6 rounded-xl">
                <div className="inline-block bg-gray-500 text-white px-3 py-1 rounded-full text-xs font-bold mb-3">
                  FOR SOCIAL LANDLORDS
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Secure Occupation Contract</h3>
                <ul className="space-y-2 text-gray-700 mb-4">
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    <span>No no-fault possession</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    <span>Very limited possession grounds</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    <span>Succession rights for family</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    <span>Right to exchange properties</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    <span>Used by councils/housing associations</span>
                  </li>
                </ul>
                <div className="text-center">
                  <span className="text-gray-500">Not for private landlords</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Key Features */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Key Features of Standard Occupation Contracts</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-green-500 pl-4 py-2 bg-white rounded-r-lg shadow-sm p-4">
                <h3 className="font-semibold text-gray-900">Section 173 No-Fault Possession</h3>
                <p className="text-gray-600">
                  After 6 months of occupation, you can serve a Section 173 notice giving at least 6 months&apos; notice
                  to recover your property without needing to prove a breach. This is the Welsh equivalent of
                  England&apos;s Section 21 but with longer notice periods.
                </p>
              </div>
              <div className="border-l-4 border-green-500 pl-4 py-2 bg-white rounded-r-lg shadow-sm p-4">
                <h3 className="font-semibold text-gray-900">Section 181 Breach Grounds</h3>
                <p className="text-gray-600">
                  For contract-holder breaches (rent arrears, anti-social behaviour, damage), Section 181 provides
                  faster routes to possession with shorter notice periods depending on the severity of the breach.
                </p>
              </div>
              <div className="border-l-4 border-green-500 pl-4 py-2 bg-white rounded-r-lg shadow-sm p-4">
                <h3 className="font-semibold text-gray-900">Fitness for Human Habitation</h3>
                <p className="text-gray-600">
                  Landlords must ensure properties meet 29 fitness matters including heating, damp prevention,
                  ventilation, and structural soundness. This is a fundamental term that cannot be contracted out of.
                </p>
              </div>
              <div className="border-l-4 border-green-500 pl-4 py-2 bg-white rounded-r-lg shadow-sm p-4">
                <h3 className="font-semibold text-gray-900">Joint Contract-Holder Flexibility</h3>
                <p className="text-gray-600">
                  Unlike England, one joint contract-holder can leave without ending the whole contract.
                  Remaining contract-holders continue under the same terms with joint liability for rent.
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
          title="Create Your Standard Occupation Contract"
          description="Generate a fully compliant contract for your Welsh rental property in minutes."
        />

        {/* Cross-sell */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">When You Need to Take Action</h2>
            <p className="text-gray-700 mb-6">
              If your contract-holder breaches the agreement or you need to recover possession, our products
              are designed to work with your Standard Occupation Contract:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <Link href="/products/notice-only" className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-gray-900">Wales Eviction Notices — £49.99</h3>
                <p className="text-sm text-gray-600">Section 173 and Section 181 notices for Welsh law</p>
              </Link>
              <Link href="/products/money-claim" className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-gray-900">Money Claim Pack — £99.99</h3>
                <p className="text-sm text-gray-600">Recover rent arrears through Welsh courts</p>
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="container mx-auto px-4 py-16 bg-gray-50">
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
