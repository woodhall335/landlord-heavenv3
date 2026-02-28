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
  title: 'Private Residential Tenancy Agreement 2026 | Legally Validated PRT',
  description: 'Create a Scotland Private Residential Tenancy agreement with solicitor-grade drafting and compliance checks under the 2016 Act.',
  keywords: [
    'private residential tenancy agreement template',
    'PRT agreement Scotland',
    'Scotland tenancy agreement',
    'private residential tenancy',
    'Scottish landlord agreement',
    'PRT template download',
    'Scotland rental agreement',
    'private tenancy Scotland',
    'Scottish tenancy template',
    'Alba tenancy agreement',
  ],
  alternates: {
    canonical: getCanonicalUrl('/private-residential-tenancy-agreement-template'),
  },
  openGraph: {
    title: 'Private Residential Tenancy Agreement 2026 | Legally Validated PRT',
    description: 'Legally validated Scotland PRT agreement with compliance-checked clauses under the 2016 Act.',
    type: 'article',
    url: getCanonicalUrl('/private-residential-tenancy-agreement-template'),
  },
};

const faqs = [
  {
    question: 'What is a Private Residential Tenancy (PRT)?',
    answer: 'A Private Residential Tenancy (PRT) is the only type of residential tenancy agreement available for private lettings in Scotland since 1 December 2017. It replaced the previous Assured and Short Assured Tenancy systems. PRTs are governed by the Private Housing (Tenancies) (Scotland) Act 2016 and are always open-ended (no fixed term), giving tenants greater security of tenure while landlords retain grounds-based eviction rights.',
  },
  {
    question: 'Why is the PRT different from English ASTs?',
    answer: 'PRTs have fundamental differences from English ASTs: (1) All PRTs are open-ended with no fixed term - tenants can stay indefinitely, (2) No "no-fault" eviction - landlords must have one of 18 specific grounds, (3) Maximum deposit is 2 months rent (vs 5-6 weeks in England), (4) Landlord registration is mandatory (criminal offense if not registered), (5) Rent increases limited to once per year with 3 months notice, (6) Disputes go to First-tier Tribunal, not county court.',
  },
  {
    question: 'Can I set a fixed term for my Scottish tenancy?',
    answer: 'No. Under the Private Housing (Tenancies) (Scotland) Act 2016, all PRTs are open-ended by law. You cannot create a fixed-term tenancy. The tenancy continues until either the tenant gives 28 days notice to leave, or the landlord serves a valid notice using one of the 18 eviction grounds with the appropriate notice period (28-168 days depending on the ground).',
  },
  {
    question: 'What is the maximum deposit in Scotland?',
    answer: 'In Scotland, the maximum deposit is 2 months rent (much lower than England\'s 5-6 weeks). The deposit must be protected in one of the three approved schemes (SafeDeposits Scotland, MyDeposits Scotland, or Letting Protection Service Scotland) within 30 working days. Our wizard validates your deposit amount against this limit.',
  },
  {
    question: 'Do I need to register as a landlord in Scotland?',
    answer: 'Yes, mandatory landlord registration is required in Scotland. You must register with your local council before letting any property. Failure to register is a criminal offense with fines up to £50,000 and potential rent repayment orders. Your landlord registration number must be included in the PRT agreement and in all property advertisements.',
  },
  {
    question: 'What grounds can I use to evict a tenant under a PRT?',
    answer: 'The PRT system provides 18 eviction grounds including: landlord intends to sell, landlord or family member intends to live in property, substantial rent arrears (3+ months), repeated late payment, breach of tenancy, anti-social behaviour, property needed for religious purposes, and others. Each ground has specific evidence requirements and notice periods ranging from 28 to 168 days.',
  },
  {
    question: 'How much notice must I give to evict in Scotland?',
    answer: 'Notice periods vary by ground: 28 days for tenant conduct grounds (anti-social behaviour, breach), 84 days for most other grounds (landlord selling, moving in), and 168 days for some grounds if the tenant has lived there for 5+ years. For rent arrears, it\'s 28 days if 3+ months behind. These are minimum periods - you can give longer notice.',
  },
  {
    question: 'What is the Repairing Standard in Scotland?',
    answer: 'The Repairing Standard is a set of legal requirements that Scottish landlords must meet, covering: wind and watertight structure, safe installations (gas, electrical, water), adequate heating, satisfactory fire safety, and carbon monoxide detectors. Tenants can apply to the First-tier Tribunal if standards aren\'t met. Our PRT template includes the required Repairing Standard obligations.',
  },
  {
    question: 'How do rent increases work under a PRT?',
    answer: 'Landlords can only increase rent once every 12 months with at least 3 months written notice using the prescribed form. Tenants can challenge "unreasonable" increases by applying to a Rent Officer. Rent Pressure Zones may cap increases in certain areas. Our template includes the proper rent review provisions for Scottish law.',
  },
  {
    question: 'What happens if I need to evict but the tenant won\'t leave?',
    answer: 'If a tenant refuses to leave after proper notice, you must apply to the First-tier Tribunal for Scotland (Housing and Property Chamber) for an eviction order. You cannot use bailiffs or county court as in England. The Tribunal process typically takes 4-8 weeks. Our eviction products guide you through the Tribunal application.',
  },
];

export default function PrivateResidentialTenancyAgreementTemplatePage() {
  return (
    <>
      <StructuredData
        data={articleSchema({
          headline: 'Private Residential Tenancy Agreement Template Scotland 2026',
          description: 'Download a legally compliant PRT agreement for Scotland under the Private Housing (Tenancies) Act 2016.',
          url: getCanonicalUrl('/private-residential-tenancy-agreement-template'),
          datePublished: '2026-01-01',
          dateModified: '2026-01-25',
        })}
      />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          { name: 'Tenancy Agreement Packs', url: 'https://landlordheaven.co.uk/products/ast' },
          { name: 'PRT Agreement Template', url: 'https://landlordheaven.co.uk/private-residential-tenancy-agreement-template' },
        ])}
      />

      <HeaderConfig mode="autoOnScroll" />

      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <UniversalHero
          title="Private Residential Tenancy Agreement (Scotland)"
          subtitle="Create a legally validated, solicitor-grade PRT agreement that is compliance-checked for Scotland."
          primaryCta={{ label: "Start now", href: "/wizard?product=ast_standard&src=seo_private_residential_tenancy_agreement_template&topic=tenancy&jurisdiction=scotland" }}
          showTrustPositioningBar
          hideMedia
        />
        {/* Breadcrumb Navigation */}
        <div className="container mx-auto px-4 pt-24 pb-4">
          <nav className="text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/products/ast" className="hover:text-blue-600">Tenancy Agreement Packs</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">PRT Agreement Template</span>
          </nav>
        </div>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-4">
              <img src="/gb-sct.svg" alt="Scotland flag" className="w-12 h-12" />
            </div>
            <span className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              Private Housing (Tenancies) Act 2016
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Private Residential Tenancy Agreement Template
            </h2>
            <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
              Create a <strong>legally compliant PRT</strong> for your Scottish property.
              Our template meets all requirements of the Private Housing (Tenancies) (Scotland) Act 2016,
              including Repairing Standard obligations and landlord registration provisions.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/wizard?product=ast_standard&src=seo_private_residential_tenancy_agreement_template&topic=tenancy&jurisdiction=scotland"
                className="inline-flex items-center gap-2 bg-white border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Standard PRT — £14.99
              </Link>
              <Link
                href="/wizard?product=ast_premium&src=seo_private_residential_tenancy_agreement_template&topic=tenancy&jurisdiction=scotland"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Premium PRT — £24.99
              </Link>
            </div>
            <p className="mt-3 text-sm text-gray-600">
              See the full package comparison in the{' '}
              <Link href="/products/ast" className="text-primary font-semibold hover:underline">
                Tenancy Agreement Pack overview
              </Link>
              .
            </p>
            <p className="mt-4 text-sm text-gray-500">Open-ended tenancy • Tribunal-ready • Instant PDF</p>
          </div>
        </section>

        {/* Trust Signals */}
        <section className="py-8 bg-white border-y border-gray-200">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-600">
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                Private Housing Act 2016 Compliant
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                Repairing Standard Included
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                Landlord Registration Ready
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                18 Eviction Grounds Supported
              </span>
            </div>
          </div>
        </section>

        {/* Why Scotland Is Different */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Scotland Requires a Different Agreement</h2>
            <div className="prose prose-lg max-w-none text-gray-700">
              <p>
                Scotland has had its own tenancy law since the <strong>Private Housing (Tenancies) (Scotland) Act 2016</strong>
                came into force on 1 December 2017. The Scottish system is fundamentally different from England,
                Wales, and Northern Ireland.
              </p>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-6">
                <h3 className="font-semibold text-blue-900">All Scottish Tenancies Are Open-Ended</h3>
                <p className="text-blue-800">
                  Unlike England&apos;s fixed-term ASTs, PRTs have no end date. Tenants can stay indefinitely
                  as long as they pay rent and comply with the agreement. Landlords can only end the tenancy
                  using one of 18 specific grounds with proper notice.
                </p>
              </div>
              <p>Key differences that make Scottish tenancy law unique:</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4 mt-6">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">No "No-Fault" Eviction</h3>
                <p className="text-sm text-gray-600">You must prove one of 18 grounds - you cannot simply decide not to renew.</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">2-Month Deposit Cap</h3>
                <p className="text-sm text-gray-600">Maximum deposit is 2 months rent - lower than England&apos;s 5-6 weeks.</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">Mandatory Registration</h3>
                <p className="text-sm text-gray-600">Criminal offense to let without landlord registration - fines up to £50,000.</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">First-tier Tribunal</h3>
                <p className="text-sm text-gray-600">Disputes go to Housing Tribunal, not county court.</p>
              </div>
            </div>
          </div>
        </section>

        {/* What's Included */}
        <section className="container mx-auto px-4 py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">What&apos;s Included in Our PRT Template</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Standard PRT (£14.99)</h3>
                <ul className="space-y-2 text-gray-700">
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
                    <span>Rent review provisions (annual limit)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    <span>Notice and termination terms</span>
                  </li>
                </ul>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border-2 border-blue-200">
                <div className="inline-block bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold mb-2">
                  RECOMMENDED
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Premium PRT (£24.99)</h3>
                <ul className="space-y-2 text-gray-700">
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
          title="Create Your Scottish PRT"
          description="Generate a Private Residential Tenancy agreement for your Scottish property in minutes."
        />

        {/* Cross-sell */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-orange-50 to-blue-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">When You Need to Take Action</h2>
            <p className="text-gray-700 mb-6">
              If your tenant breaches the agreement or you need to recover possession, our products
              are designed for Scottish law:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <Link href="/products/notice-only" className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-gray-900">Scotland Notice to Leave — £34.99</h3>
                <p className="text-sm text-gray-600">All 18 eviction grounds with correct notice periods</p>
              </Link>
              <Link href="/products/money-claim" className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-gray-900">Scotland Money Claim — £44.99</h3>
                <p className="text-sm text-gray-600">Simple Procedure for Scottish courts</p>
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
