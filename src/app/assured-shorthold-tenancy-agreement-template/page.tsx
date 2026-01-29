import type { Metadata } from 'next';
import Link from 'next/link';
import { getCanonicalUrl } from '@/lib/seo/urls';
import { StructuredData, breadcrumbSchema, articleSchema } from '@/lib/seo/structured-data';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { SeoCtaBlock, SeoDisclaimer } from '@/components/seo/SeoCtaBlock';
import { tenancyAgreementEnglandLinks } from '@/lib/seo/internal-links';
import { FAQSection } from '@/components/seo/FAQSection';
import { tenancyAgreementTemplateFAQs } from '@/data/faqs';

export const metadata: Metadata = {
  title: 'Assured Shorthold Tenancy Agreement Template 2026 | Legally Compliant AST',
  description: 'Download a legally compliant Assured Shorthold Tenancy Agreement (AST) template for England. Housing Act 1988 & Tenant Fees Act 2019 compliant. From £14.99 with instant delivery.',
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
    description: 'Download a legally compliant AST template for England. Housing Act 1988 & Tenant Fees Act 2019 compliant. From £14.99.',
    type: 'article',
    url: getCanonicalUrl('/assured-shorthold-tenancy-agreement-template'),
  },
};

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
              Note: An AST is not suitable for lodgers — use a <Link href="/lodger-agreement-template" className="text-primary hover:underline">lodger agreement</Link> instead.
              Our templates meet all Housing Act 1988 and Tenant Fees Act 2019 requirements,
              giving you a <strong>court-defensible tenancy agreement</strong> you can trust.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/wizard?product=ast_standard&src=seo_ast_template&topic=tenancy&jurisdiction=england"
                className="inline-flex items-center gap-2 bg-white border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Standard AST — £14.99
              </Link>
              <Link
                href="/wizard?product=ast_premium&src=seo_ast_template&topic=tenancy&jurisdiction=england"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Premium AST — £24.99
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
                <li><Link href="/how-to-rent-guide" className="text-primary hover:underline font-semibold">How to Rent guide</Link> must be provided before tenancy starts</li>
                <li><strong>EPC, Gas Safety Certificate, and <Link href="/eicr-landlord-requirements" className="text-primary hover:underline">EICR</Link></strong> must be provided to tenants</li>
                <li><strong>Section 21</strong> (<Link href="/no-fault-eviction" className="text-primary hover:underline">no-fault eviction</Link>) and <strong>Section 8</strong> (grounds-based eviction) procedures</li>
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
                  periods and procedures for rent reviews, whether during a fixed term or <Link href="/rolling-tenancy-agreement" className="text-primary hover:underline">periodic tenancy</Link>.
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
                <h3 className="font-semibold text-gray-900">Eviction Notice Pack — £49.99</h3>
                <p className="text-sm text-gray-600">Section 21 or Section 8 notices when you need to regain possession</p>
              </Link>
              <Link href="/products/complete-pack" className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-gray-900">Complete Eviction Pack — £199.99</h3>
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
            <FAQSection
              faqs={tenancyAgreementTemplateFAQs}
              title="Frequently Asked Questions"
              showContactCTA={false}
              variant="white"
            />
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
