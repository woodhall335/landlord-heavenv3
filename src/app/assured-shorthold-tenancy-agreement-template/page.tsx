import type { Metadata } from 'next';
import Link from 'next/link';
import { getCanonicalUrl } from '@/lib/seo/urls';
import { StructuredData, faqPageSchema, breadcrumbSchema, articleSchema } from '@/lib/seo/structured-data';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { SeoCtaBlock, SeoDisclaimer } from '@/components/seo/SeoCtaBlock';
import { tenancyAgreementEnglandLinks } from '@/lib/seo/internal-links';

export const metadata: Metadata = {
  title: 'Assured Shorthold Tenancy Agreement Template 2026 | Legally Compliant AST',
  description: 'Download a legally compliant Assured Shorthold Tenancy Agreement (AST) template for England. Housing Act 1988 & Tenant Fees Act 2019 compliant. From £9.99 with instant delivery.',
  keywords: [
    'assured shorthold tenancy agreement template',
    'AST template',
    'tenancy agreement template England',
    'landlord tenancy agreement',
    'assured shorthold tenancy',
    'AST agreement download',
    'Housing Act 1988 tenancy',
    'Tenant Fees Act compliant',
    'residential tenancy template',
    'England tenancy agreement',
  ],
  alternates: {
    canonical: getCanonicalUrl('/assured-shorthold-tenancy-agreement-template'),
  },
  openGraph: {
    title: 'Assured Shorthold Tenancy Agreement Template 2026 | Legally Compliant AST',
    description: 'Download a legally compliant AST template for England. Housing Act 1988 & Tenant Fees Act 2019 compliant. From £9.99.',
    type: 'article',
    url: getCanonicalUrl('/assured-shorthold-tenancy-agreement-template'),
  },
};

const faqs = [
  {
    question: 'What is an Assured Shorthold Tenancy Agreement (AST)?',
    answer: 'An Assured Shorthold Tenancy (AST) is the default private residential tenancy in England. It is a legally binding contract between a landlord and tenant that grants the tenant exclusive possession of a property for a fixed term (typically 6-12 months) or on a periodic (rolling) basis. ASTs are governed by the Housing Act 1988 and provide both parties with defined rights and obligations, including the landlord\'s right to regain possession using Section 21 or Section 8 notices.',
  },
  {
    question: 'Is your AST template legally valid in court?',
    answer: 'Yes. Our AST templates are drafted by legal professionals to comply with the Housing Act 1988 (as amended), Landlord and Tenant Act 1985, Tenant Fees Act 2019, and all current England tenancy legislation. A properly executed AST from Landlord Heaven is legally binding and defensible in county court possession proceedings, provided you have also met your other landlord obligations such as deposit protection and providing the How to Rent guide.',
  },
  {
    question: 'What clauses are commonly missing from free AST templates?',
    answer: 'Free templates often lack critical clauses including: (1) Tenant Fees Act 2019 compliant deposit caps, (2) clear break clause provisions, (3) rent review mechanisms compliant with Section 13, (4) inventory obligations for deposit disputes, (5) HMO-specific terms for shared properties, (6) proper notice requirements for periodic tenancies, (7) utility and council tax responsibility clauses, and (8) garden/exterior maintenance obligations. Missing these clauses can leave landlords vulnerable in disputes.',
  },
  {
    question: 'Can I use this template for Houses in Multiple Occupation (HMOs)?',
    answer: 'Yes, but we recommend our Premium AST (£14.99) for HMOs. The Premium version includes additional clauses covering shared facilities, room-specific terms, multiple tenant obligations, joint and several liability, and HMO licence compliance requirements. Standard ASTs may not adequately address the complexities of multi-tenant properties.',
  },
  {
    question: 'What is the difference between Standard and Premium AST templates?',
    answer: 'The Standard AST (£9.99) includes all legally required clauses for a compliant tenancy: deposit protection terms, rent payment obligations, maintenance responsibilities, and proper termination provisions. The Premium AST (£14.99) adds 13 comprehensive terms and conditions, detailed inventory sections, professional styling, rights of change clauses, HMO coverage, and enhanced legal compliance information boxes.',
  },
  {
    question: 'Do I need to have my AST witnessed or notarised?',
    answer: 'No. AST agreements do not require witnesses or notarisation to be legally valid in England. The agreement becomes binding when signed by both the landlord (or their agent) and the tenant(s). However, we recommend having each party sign in the presence of the other and exchanging signed copies immediately. Both parties should retain their signed copy for the duration of the tenancy.',
  },
  {
    question: 'What happens if I evict a tenant without a proper written AST?',
    answer: 'While verbal tenancies can exist, evicting without a written AST creates significant problems: (1) You cannot serve a valid Section 21 notice without providing the prescribed information, (2) dispute resolution becomes difficult without documented terms, (3) deposit disputes are harder to defend, and (4) courts may question the tenancy terms. Always use a written AST to protect your interests.',
  },
  {
    question: 'Can I modify the AST template after downloading?',
    answer: 'Our wizard collects all necessary information upfront to generate a complete, ready-to-sign agreement. The generated PDF is final and professional. If you need to make subsequent changes, you can either create a new agreement through the wizard or use a Lease Addendum (variation agreement) to document modifications. Any changes must be signed by all parties to be legally effective.',
  },
  {
    question: 'How does your AST template link to eviction procedures?',
    answer: 'Our AST templates are designed to work seamlessly with the Section 21 and Section 8 eviction processes. The agreement includes the correct prescribed terms, deposit protection clauses, and notice provisions required for valid eviction notices. If you later need to evict, our Complete Eviction Pack uses the same case information to generate court-ready notices and possession claim forms.',
  },
  {
    question: 'What must I provide to tenants alongside the AST?',
    answer: 'Before or at the start of an AST in England, you must provide: (1) A copy of the current How to Rent guide, (2) Gas Safety Certificate (if gas appliances present), (3) Energy Performance Certificate (EPC), (4) Electrical Installation Condition Report (EICR), and (5) Deposit protection certificate and prescribed information within 30 days. Failure to provide these documents can invalidate Section 21 notices.',
  },
];

export default function AssuredShortholdTenancyAgreementTemplatePage() {
  return (
    <>
      <StructuredData
        data={articleSchema({
          headline: 'Assured Shorthold Tenancy Agreement Template 2026',
          description: 'Download a legally compliant AST template for England. Housing Act 1988 & Tenant Fees Act 2019 compliant.',
          url: getCanonicalUrl('/assured-shorthold-tenancy-agreement-template'),
          datePublished: '2026-01-01',
          dateModified: '2026-01-25',
        })}
      />
      <StructuredData data={faqPageSchema(faqs)} />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          { name: 'Tenancy Agreements', url: 'https://landlordheaven.co.uk/tenancy-agreements' },
          { name: 'Assured Shorthold Tenancy Agreement Template', url: 'https://landlordheaven.co.uk/assured-shorthold-tenancy-agreement-template' },
        ])}
      />

      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Breadcrumb Navigation */}
        <div className="container mx-auto px-4 pt-24 pb-4">
          <nav className="text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/tenancy-agreements" className="hover:text-blue-600">Tenancy Agreements</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">AST Template</span>
          </nav>
        </div>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              Updated for 2026 Legislation
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Assured Shorthold Tenancy Agreement Template
            </h1>
            <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
              Create a <strong>legally compliant AST</strong> for your England rental property in minutes.
              Our templates meet all Housing Act 1988 and Tenant Fees Act 2019 requirements,
              giving you a <strong>court-defensible tenancy agreement</strong> you can trust.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/wizard?product=ast_standard&src=seo_ast_template&topic=tenancy&jurisdiction=england"
                className="inline-flex items-center gap-2 bg-white border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Standard AST — £9.99
              </Link>
              <Link
                href="/wizard?product=ast_premium&src=seo_ast_template&topic=tenancy&jurisdiction=england"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Premium AST — £14.99
              </Link>
            </div>
            <p className="mt-4 text-sm text-gray-500">Instant PDF download • No subscription • Legally binding</p>
          </div>
        </section>

        {/* Trust Signals */}
        <section className="py-8 bg-gray-50 border-y border-gray-200">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-600">
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                Housing Act 1988 Compliant
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                Tenant Fees Act 2019 Compliant
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                Deregulation Act 2015 Compliant
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                Court-Ready Format
              </span>
            </div>
          </div>
        </section>

        {/* Why Jurisdiction Matters */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Why England-Specific Tenancy Agreements Matter</h2>
            <div className="prose prose-lg max-w-none text-gray-700">
              <p>
                Tenancy law in the UK is <strong>devolved</strong>, meaning England, Wales, Scotland, and Northern Ireland
                each have their own legislation. Using a generic &ldquo;UK tenancy agreement&rdquo; or a template designed
                for another jurisdiction can render your agreement unenforceable or leave you unable to evict.
              </p>
              <p>
                In <strong>England</strong>, private residential tenancies are governed by the <strong>Housing Act 1988</strong> (as amended),
                which creates the Assured Shorthold Tenancy (AST) framework. Key England-specific requirements include:
              </p>
              <ul className="space-y-2">
                <li><strong>Deposit caps</strong> under the Tenant Fees Act 2019 (5 weeks for rent under £50,000/year)</li>
                <li><strong>Deposit protection</strong> in a government-authorised scheme within 30 days</li>
                <li><strong>How to Rent guide</strong> must be provided before tenancy starts</li>
                <li><strong>EPC, Gas Safety Certificate, and EICR</strong> must be provided to tenants</li>
                <li><strong>Section 21</strong> (no-fault eviction) and <strong>Section 8</strong> (grounds-based eviction) procedures</li>
              </ul>
              <p>
                Wales now uses <strong>Occupation Contracts</strong> under the Renting Homes (Wales) Act 2016 —
                completely different from ASTs. Scotland uses <strong>Private Residential Tenancies (PRTs)</strong>.
                Using the wrong type of agreement in these jurisdictions would be legally void.
              </p>
            </div>
          </div>
        </section>

        {/* What Makes Ours Legally Defensible */}
        <section className="container mx-auto px-4 py-16 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">What Makes Our AST Templates Legally Defensible</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Prescribed Information Compliant</h3>
                <p className="text-gray-700">
                  Our templates include all prescribed deposit information required by the Housing Act 2004.
                  This is essential for valid Section 21 notices — missing prescribed information is a common
                  reason possession claims fail.
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Tenant Fees Act Validated</h3>
                <p className="text-gray-700">
                  Our wizard automatically validates deposit amounts against Tenant Fees Act 2019 limits.
                  If you enter a deposit exceeding 5 weeks&apos; rent (or 6 weeks for annual rent over £50,000),
                  you&apos;ll be warned before generating the agreement.
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Break Clause Provisions</h3>
                <p className="text-gray-700">
                  Properly drafted break clauses that comply with Section 21 notice requirements.
                  Our templates ensure break clause terms don&apos;t inadvertently invalidate your right
                  to serve notice at the correct time.
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Rent Review Mechanisms</h3>
                <p className="text-gray-700">
                  Section 13-compliant rent increase provisions. Our templates include proper notice
                  periods and procedures for rent reviews, whether during a fixed term or periodic tenancy.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Key Clauses Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Key Clauses Users Miss in Free Templates</h2>
            <p className="text-gray-700 mb-8">
              Free AST templates downloaded from the internet often lack crucial clauses that protect landlords
              in disputes. Here are the most commonly missing provisions that our templates include:
            </p>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4 py-2">
                <h3 className="font-semibold text-gray-900">Joint and Several Liability</h3>
                <p className="text-gray-600">Ensures all tenants are individually liable for the full rent, not just their share. Essential for joint tenancies.</p>
              </div>
              <div className="border-l-4 border-blue-500 pl-4 py-2">
                <h3 className="font-semibold text-gray-900">Inventory Obligations</h3>
                <p className="text-gray-600">Clear terms about check-in/check-out inventories that support deposit deduction claims.</p>
              </div>
              <div className="border-l-4 border-blue-500 pl-4 py-2">
                <h3 className="font-semibold text-gray-900">Garden and Exterior Maintenance</h3>
                <p className="text-gray-600">Specifies tenant responsibilities for gardens, driveways, and exterior areas — often overlooked in basic templates.</p>
              </div>
              <div className="border-l-4 border-blue-500 pl-4 py-2">
                <h3 className="font-semibold text-gray-900">Utility Transfer Obligations</h3>
                <p className="text-gray-600">Clear terms about transferring utility accounts and council tax liability at start and end of tenancy.</p>
              </div>
              <div className="border-l-4 border-blue-500 pl-4 py-2">
                <h3 className="font-semibold text-gray-900">Access for Repairs and Inspections</h3>
                <p className="text-gray-600">Properly drafted access clauses that balance landlord rights with tenant quiet enjoyment.</p>
              </div>
              <div className="border-l-4 border-blue-500 pl-4 py-2">
                <h3 className="font-semibold text-gray-900">Insurance and Liability</h3>
                <p className="text-gray-600">Clarifies tenant responsibility for contents insurance and damage caused by their negligence.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Mid-page CTA */}
        <SeoCtaBlock
          pageType="tenancy"
          variant="section"
          jurisdiction="england"
          title="Ready to Create Your AST?"
          description="Generate a legally compliant Assured Shorthold Tenancy Agreement in minutes. No legal expertise required."
        />

        {/* Link to Eviction/Claims */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">When Tenancies Go Wrong</h2>
            <p className="text-gray-700 mb-6">
              Even with a perfect tenancy agreement, problems can arise. Our AST templates are designed to
              work seamlessly with our eviction and money claim products if you need them later:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <Link href="/products/notice-only" className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-gray-900">Eviction Notice Pack — £39.99</h3>
                <p className="text-sm text-gray-600">Section 21 or Section 8 notices when you need to regain possession</p>
              </Link>
              <Link href="/products/complete-pack" className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-gray-900">Complete Eviction Pack — £149.99</h3>
                <p className="text-sm text-gray-600">Full eviction package including court forms and witness statements</p>
              </Link>
              <Link href="/products/money-claim" className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-gray-900">Money Claim Pack — £99.99</h3>
                <p className="text-sm text-gray-600">Recover rent arrears, property damage, and other tenant debts</p>
              </Link>
              <Link href="/ask-heaven" className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-gray-900">Ask Heaven — Free</h3>
                <p className="text-sm text-gray-600">Get instant answers to your landlord questions</p>
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
          jurisdiction="england"
        />

        {/* Related Links */}
        <section className="container mx-auto px-4 py-12">
          <RelatedLinks
            title="Related Resources"
            links={tenancyAgreementEnglandLinks}
          />
        </section>

        {/* Disclaimer */}
        <SeoDisclaimer className="max-w-4xl mx-auto px-4 pb-12" />
      </main>
    </>
  );
}
