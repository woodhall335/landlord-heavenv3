import type { Metadata } from 'next';
import Link from 'next/link';
import { getCanonicalUrl } from '@/lib/seo/urls';
import { StructuredData, faqPageSchema, breadcrumbSchema, articleSchema } from '@/lib/seo/structured-data';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { SeoCtaBlock, SeoDisclaimer } from '@/components/seo/SeoCtaBlock';
import { tenancyAgreementEnglandLinks } from '@/lib/seo/internal-links';

export const metadata: Metadata = {
  title: 'AST Template England 2026 | Assured Shorthold Tenancy Agreement Download',
  description: 'Download an AST template for England that complies with Housing Act 1988 and Tenant Fees Act 2019. Instant PDF generation from £9.99. Create your legally binding tenancy agreement today.',
  keywords: [
    'AST template England',
    'England AST download',
    'assured shorthold tenancy England',
    'AST agreement template',
    'England tenancy agreement',
    'Housing Act 1988 template',
    'residential tenancy agreement',
    'landlord AST form',
    'rental agreement England',
    'tenancy contract template',
  ],
  alternates: {
    canonical: getCanonicalUrl('/ast-template-england'),
  },
  openGraph: {
    title: 'AST Template England 2026 | Assured Shorthold Tenancy Agreement Download',
    description: 'Download an AST template for England. Housing Act 1988 & Tenant Fees Act 2019 compliant. From £9.99.',
    type: 'article',
    url: getCanonicalUrl('/ast-template-england'),
  },
};

const faqs = [
  {
    question: 'What is the AST template used for in England?',
    answer: 'The Assured Shorthold Tenancy (AST) template is used to create a legally binding residential tenancy agreement between a private landlord and tenant in England. It establishes the terms under which the tenant occupies the property, including rent amount, deposit terms, duration, and both parties\' responsibilities. The AST is the default tenancy type in England and provides landlords with the right to regain possession through Section 21 (no-fault) or Section 8 (grounds-based) eviction procedures.',
  },
  {
    question: 'Is the AST template only valid in England?',
    answer: 'Yes, the Assured Shorthold Tenancy is specific to England. Wales now uses Occupation Contracts under the Renting Homes (Wales) Act 2016, Scotland uses Private Residential Tenancies (PRTs), and Northern Ireland has its own Private Tenancy framework. Using an AST template in Wales, Scotland, or Northern Ireland would not be legally valid. Our wizard automatically generates the correct agreement type based on your property location.',
  },
  {
    question: 'How quickly can I create an AST using your template?',
    answer: 'Most landlords complete our wizard in 10-15 minutes. The intelligent wizard asks only relevant questions based on your specific situation, skipping sections that don\'t apply (e.g., HMO questions for single-let properties). Once you\'ve answered the questions and made payment, your professional PDF is generated instantly and available for immediate download.',
  },
  {
    question: 'What information do I need to complete the AST template?',
    answer: 'To complete the AST, you\'ll need: (1) Full property address and any included parking/storage, (2) Landlord\'s full legal name and correspondence address, (3) Tenant(s) full legal names, (4) Tenancy start date and fixed term length, (5) Monthly rent amount and payment date, (6) Deposit amount and which protection scheme you\'ll use, (7) Whether you\'ve provided required documents (EPC, Gas Safety Certificate, How to Rent guide, EICR).',
  },
  {
    question: 'Can I use your AST template for a furnished or unfurnished property?',
    answer: 'Yes. Our AST template works for both furnished and unfurnished properties. The wizard asks about furnishing level and, for furnished properties, prompts you to include inventory details. The Premium AST (£14.99) includes comprehensive inventory sections where you can document all included items, their condition, and any existing damage — essential for deposit deduction evidence.',
  },
  {
    question: 'Does the template include a break clause?',
    answer: 'Yes, if you want one. Our wizard asks whether you want to include a break clause and, if so, when it can be exercised (e.g., after 6 months). The break clause is drafted to comply with Section 21 notice requirements, ensuring you can still serve valid possession notices. You can also choose to create a fixed-term tenancy without a break clause if you prefer certainty of tenure.',
  },
  {
    question: 'What happens when the fixed term ends?',
    answer: 'Unless you create a new agreement or serve notice, the tenancy automatically becomes a "statutory periodic tenancy" on a month-to-month (or week-to-week) basis with the same terms as the original AST. Our template includes clear provisions explaining this transition. You can serve Section 21 notice during the fixed term to end at or after the fixed term ends, or serve notice during the periodic phase.',
  },
  {
    question: 'How does the AST handle rent increases?',
    answer: 'Our AST template includes Section 13-compliant rent review provisions. You can specify whether rent reviews are allowed during the fixed term (rare) or only during periodic phases. The agreement explains the proper notice period (currently at least one month ending on a rent day) and procedure for proposing rent increases, protecting both landlord and tenant interests.',
  },
  {
    question: 'Can multiple tenants sign the same AST?',
    answer: 'Yes. Our template supports multiple tenants on a single AST, creating a joint tenancy. All named tenants become jointly and severally liable — meaning each tenant is responsible for the full rent, not just their share. This protects landlords if one tenant fails to pay. The wizard collects details for all tenants and generates signature blocks for each.',
  },
  {
    question: 'Is the AST template accepted by deposit protection schemes?',
    answer: 'Yes. Our AST templates include all prescribed deposit information required by the Housing Act 2004 and are fully compatible with all three government-authorised deposit protection schemes: Deposit Protection Service (DPS), MyDeposits, and Tenancy Deposit Scheme (TDS). The agreement documents the deposit amount, scheme details, and prescribed information requirements.',
  },
  {
    question: 'What if my tenant refuses to sign the AST?',
    answer: 'If a tenant moves in and pays rent without signing, an implied periodic tenancy may exist, but this creates problems: (1) Terms are unclear, (2) Section 21 may be invalid without providing prescribed information, (3) Deposit disputes are harder to resolve. We strongly recommend not handing over keys until the AST is signed by all parties and deposit protection is in place.',
  },
  {
    question: 'Does the AST cover pets?',
    answer: 'Yes. Our wizard asks about your pet policy and generates appropriate clauses. You can choose to allow pets (with or without additional terms like professional cleaning requirements), prohibit pets entirely, or require pets to be approved in writing. The Tenant Fees Act 2019 prohibits charging blanket "pet deposits" but you can charge higher rent to reflect pet-related wear.',
  },
];

export default function AstTemplateEnglandPage() {
  return (
    <>
      <StructuredData
        data={articleSchema({
          headline: 'AST Template England 2026',
          description: 'Download an AST template for England that complies with Housing Act 1988 and Tenant Fees Act 2019.',
          url: getCanonicalUrl('/ast-template-england'),
          datePublished: '2026-01-01',
          dateModified: '2026-01-25',
        })}
      />
      <StructuredData data={faqPageSchema(faqs)} />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          { name: 'Tenancy Agreements', url: 'https://landlordheaven.co.uk/tenancy-agreements' },
          { name: 'AST Template England', url: 'https://landlordheaven.co.uk/ast-template-england' },
        ])}
      />

      <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        {/* Breadcrumb Navigation */}
        <div className="container mx-auto px-4 pt-24 pb-4">
          <nav className="text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/tenancy-agreements" className="hover:text-blue-600">Tenancy Agreements</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">AST Template England</span>
          </nav>
        </div>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-4">
              <img src="/gb-eng.svg" alt="England flag" className="w-12 h-12" />
            </div>
            <span className="inline-flex items-center gap-2 bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              England-Specific
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              AST Template for England
            </h1>
            <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
              Generate an <strong>Assured Shorthold Tenancy Agreement</strong> specifically designed for
              England&apos;s legal framework. Our wizard ensures your AST meets all Housing Act 1988
              and Tenant Fees Act 2019 requirements.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/wizard?product=ast_standard&src=seo_ast_england&topic=tenancy&jurisdiction=england"
                className="inline-flex items-center gap-2 bg-white border-2 border-purple-600 text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
              >
                Standard AST — £9.99
              </Link>
              <Link
                href="/wizard?product=ast_premium&src=seo_ast_england&topic=tenancy&jurisdiction=england"
                className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                Premium AST — £14.99
              </Link>
            </div>
            <p className="mt-4 text-sm text-gray-500">10-minute wizard • Instant download • Legally valid</p>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="py-12 bg-white border-y border-gray-200">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">10 min</div>
                <div className="text-sm text-gray-600">Average completion time</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">£9.99</div>
                <div className="text-sm text-gray-600">Starting price</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">2026</div>
                <div className="text-sm text-gray-600">Legislation compliant</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">PDF</div>
                <div className="text-sm text-gray-600">Instant download</div>
              </div>
            </div>
          </div>
        </section>

        {/* Why England-Specific */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Use an England-Specific AST?</h2>
            <div className="prose prose-lg max-w-none text-gray-700">
              <p>
                The UK&apos;s four nations each have distinct tenancy legislation. England&apos;s <strong>Assured Shorthold
                Tenancy</strong> framework under the Housing Act 1988 is fundamentally different from the systems
                used in Wales, Scotland, and Northern Ireland.
              </p>
              <p>
                Key England-specific requirements that generic &ldquo;UK templates&rdquo; often miss include:
              </p>
              <div className="grid md:grid-cols-2 gap-4 my-6">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-900">Section 21 Compliance</h3>
                  <p className="text-sm">No-fault eviction requires specific prescribed information and documents to be valid.</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-900">Tenant Fees Act 2019</h3>
                  <p className="text-sm">England-only deposit caps (5-6 weeks) and prohibited fees.</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-900">Deregulation Act 2015</h3>
                  <p className="text-sm">Additional requirements for Section 21 notices in England.</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-900">EICR Requirements</h3>
                  <p className="text-sm">Mandatory electrical safety inspections every 5 years in England.</p>
                </div>
              </div>
              <div className="bg-red-50 border-l-4 border-red-500 p-4 my-6">
                <h3 className="font-semibold text-red-900">Using the Wrong Template Can Cost You</h3>
                <p className="text-red-800">
                  Landlords who use Wales Occupation Contracts, Scottish PRTs, or generic UK templates for
                  England properties risk invalid eviction notices, deposit disputes, and unenforceable terms.
                  Our England AST ensures every clause is valid under English law.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* What's Included */}
        <section className="container mx-auto px-4 py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">What&apos;s Included in Our AST Template</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Standard AST (£9.99)</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    <span>Complete tenancy terms (parties, property, duration)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    <span>Rent payment clauses with payment methods</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    <span>Tenant Fees Act compliant deposit terms</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    <span>Landlord and tenant obligations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    <span>Optional break clause</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    <span>Notice and termination provisions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    <span>Signature pages for all parties</span>
                  </li>
                </ul>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border-2 border-purple-200">
                <div className="inline-block bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold mb-2">
                  RECOMMENDED
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Premium AST (£14.99)</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    <span><strong>Everything in Standard PLUS:</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    <span>Comprehensive inventory sections</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    <span>13 detailed terms and conditions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    <span>HMO-compatible clauses</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    <span>Professional gradient styling</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    <span>Rights of change clauses</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    <span>Enhanced legal compliance boxes</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">How Our AST Wizard Works</h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
                <h3 className="font-semibold text-gray-900 mb-2">Answer Questions</h3>
                <p className="text-sm text-gray-600">Our intelligent wizard asks only relevant questions based on your situation.</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
                <h3 className="font-semibold text-gray-900 mb-2">Review Terms</h3>
                <p className="text-sm text-gray-600">Preview your agreement and make any adjustments before payment.</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
                <h3 className="font-semibold text-gray-900 mb-2">Secure Payment</h3>
                <p className="text-sm text-gray-600">Pay securely with card. No subscription required.</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">4</div>
                <h3 className="font-semibold text-gray-900 mb-2">Download PDF</h3>
                <p className="text-sm text-gray-600">Instantly download your professional, court-ready AST.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Mid-page CTA */}
        <SeoCtaBlock
          pageType="tenancy"
          variant="section"
          jurisdiction="england"
          title="Create Your England AST Now"
          description="Join thousands of landlords using legally compliant tenancy agreements from Landlord Heaven."
        />

        {/* Cross-sell Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Complete Your Landlord Toolkit</h2>
            <p className="text-gray-700 mb-6">
              A solid tenancy agreement is just the start. Be prepared for any situation with our complementary products:
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <Link href="/products/notice-only" className="bg-orange-50 p-5 rounded-lg hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-gray-900 mb-1">Eviction Notices</h3>
                <p className="text-sm text-gray-600 mb-2">Section 21 & Section 8 notices when you need to regain possession.</p>
                <span className="text-orange-600 font-medium">From £39.99</span>
              </Link>
              <Link href="/products/money-claim" className="bg-green-50 p-5 rounded-lg hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-gray-900 mb-1">Money Claims</h3>
                <p className="text-sm text-gray-600 mb-2">Recover rent arrears and property damage through the courts.</p>
                <span className="text-green-600 font-medium">From £99.99</span>
              </Link>
              <Link href="/ask-heaven" className="bg-blue-50 p-5 rounded-lg hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-gray-900 mb-1">Ask Heaven</h3>
                <p className="text-sm text-gray-600 mb-2">Get instant answers to your landlord legal questions.</p>
                <span className="text-blue-600 font-medium">Free</span>
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
