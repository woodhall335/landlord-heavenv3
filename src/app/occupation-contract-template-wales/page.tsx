import { Metadata } from 'next';
import Link from 'next/link';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { SocialProofCounter } from '@/components/ui/SocialProofCounter';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { occupationContractTemplateRelatedLinks } from '@/lib/seo/internal-links';
import { buildWizardLink } from '@/lib/wizard/buildWizardLink';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { SeoCtaBlock, SeoDisclaimer } from '@/components/seo/SeoCtaBlock';
import { SeoLandingWrapper } from '@/components/seo/SeoLandingWrapper';
import { FAQSection } from '@/components/seo/FAQSection';
import { occupationContractTemplateFAQs } from '@/data/faqs';
import { PRODUCTS } from '@/lib/pricing/products';
import {
  CheckCircle,
  Clock,
  ArrowRight,
  Scale,
  FileText,
  Shield,
  AlertTriangle,
  Home,
  Gavel,
  XCircle,
} from 'lucide-react';

// Page constants for analytics
const PAGE_PATH = '/occupation-contract-template-wales';
const PAGE_TITLE = 'Occupation Contract Template Wales';
const PAGE_TYPE = 'tenancy' as const;

const wizardLinkStandard = buildWizardLink({
  product: 'ast_standard',
  jurisdiction: 'wales',
  src: 'seo_occupation_contract_template_wales',
  topic: 'tenancy',
});

const wizardLinkPremium = buildWizardLink({
  product: 'ast_premium',
  jurisdiction: 'wales',
  src: 'seo_occupation_contract_template_wales',
  topic: 'tenancy',
});

export const metadata: Metadata = {
  title: 'Occupation Contract Template Wales | Welsh Written Statement Template',
  description:
    'Get an occupation contract template for Wales. Renting Homes Act 2016 compliant with all fundamental and supplementary terms.',
  keywords: [
    'occupation contract template wales',
    'welsh tenancy agreement template',
    'written statement template wales',
    'renting homes wales template',
    'occupation contract download',
    'wales landlord template',
    'standard occupation contract template',
    'welsh rental agreement template',
    'contract holder agreement template',
    'wales tenancy template',
  ],
  alternates: {
    canonical: 'https://landlordheaven.co.uk/occupation-contract-template-wales',
  },
  openGraph: {
    title: 'Occupation Contract Template Wales | Landlord Heaven',
    description:
      'Get a legally compliant occupation contract template for Wales. Written statement included with all required terms.',
    type: 'website',
    url: 'https://landlordheaven.co.uk/occupation-contract-template-wales',
  },
};

export default function OccupationContractTemplateWalesPage() {
  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Occupation Contract Template Wales',
    description:
      'Get a legally compliant occupation contract template for Wales, with written statement and all Renting Homes Act 2016 requirements.',
    url: 'https://landlordheaven.co.uk/occupation-contract-template-wales',
  };

  return (
    <>
      <StructuredData data={pageSchema} />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          { name: 'Tenancy Agreements', url: 'https://landlordheaven.co.uk/products/ast' },
          {
            name: 'Occupation Contract Template Wales',
            url: 'https://landlordheaven.co.uk/occupation-contract-template-wales',
          },
        ])}
      />

      {/* Analytics: Attribution + landing_view event */}
      <SeoLandingWrapper
        pagePath={PAGE_PATH}
        pageTitle={PAGE_TITLE}
        pageType={PAGE_TYPE}
        jurisdiction="wales"
      />

      <HeaderConfig mode="autoOnScroll" />

      <main>
        {/* Hero Section */}
        <UniversalHero
          badge="Wales Only"
          badgeIcon={<Scale className="w-4 h-4" />}
          title="Occupation Contract Template Wales"
          subtitle={
            <>
              Get a <strong>legally compliant</strong> occupation contract template for Wales.
              Includes written statement format with all fundamental and supplementary terms
              required by the Renting Homes (Wales) Act 2016.
            </>
          }
          primaryCta={{
            label: `Create Your Template — ${PRODUCTS.ast_standard.displayPrice}`,
            href: wizardLinkStandard,
          }}
          secondaryCta={{
            label: 'Premium Template with Extra Clauses',
            href: wizardLinkPremium,
          }}
        >
          {/* Trust Signals */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600 mt-4">
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Renting Homes Act 2016 Compliant
            </span>
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              Written Statement Included
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-green-500" />
              Ready in Minutes
            </span>
          </div>
        </UniversalHero>

        {/* Social Proof */}
        <section className="py-6 bg-gray-50 border-y border-gray-100">
          <div className="container mx-auto px-4">
            <SocialProofCounter variant="total" className="justify-center" />
          </div>
        </section>

        {/* What is an Occupation Contract Template Section */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                What Is an Occupation Contract Template?
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Understanding what makes a valid Welsh occupation contract template and why
                using the right one matters.
              </p>

              <div className="prose prose-lg max-w-none text-gray-600">
                <p>
                  An <strong>occupation contract template</strong> is a pre-drafted document
                  that you can customise with your property and contract-holder details to
                  create a legally valid tenancy agreement for Wales. The template must comply
                  with the Renting Homes (Wales) Act 2016, which replaced the Housing Act 1988
                  for Welsh properties from 1 December 2022.
                </p>
                <p>
                  Unlike English AST templates, Welsh occupation contract templates must
                  include a specific <strong>written statement</strong> format containing all
                  fundamental terms (set by law), supplementary terms (defaults that apply
                  unless varied), and any additional terms you have agreed with the
                  contract-holder.
                </p>
                <p>
                  The Welsh Government provides a basic model written statement, but many
                  landlords need more comprehensive templates that include practical additional
                  terms for gardens, pets, parking, and property-specific matters. A good
                  template should be easy to customise while ensuring compliance with the Act.
                </p>
                <p>
                  Using the wrong template in Wales has serious consequences. If you use an
                  English AST template, your contract is not valid under Welsh law. This affects
                  your ability to serve possession notices and recover the property. The court
                  will not accept possession claims based on incorrect documentation.
                </p>
                <ul>
                  <li>
                    <strong>Written statement format:</strong> The template must be structured
                    as a written statement with separate sections for fundamental, supplementary,
                    and additional terms as required by the Act.
                  </li>
                  <li>
                    <strong>All mandatory terms:</strong> Fundamental terms set by law cannot
                    be omitted or changed. Your template must include them exactly as prescribed.
                  </li>
                  <li>
                    <strong>Clear customisation:</strong> The template should clearly indicate
                    which parts you need to fill in and which terms can be varied by agreement.
                  </li>
                  <li>
                    <strong>Wales-specific procedures:</strong> Notice procedures, rent increase
                    rules, and ending the contract must follow Welsh law, not English law.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Warning Section */}
        <section className="py-12 bg-amber-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-amber-900 mb-2">
                    Risks of Using the Wrong Template
                  </h2>
                  <p className="text-amber-800 mb-4">
                    Free starter documents and English AST templates are not valid for Welsh properties.
                    Using the wrong template can cost you months of delay and legal fees.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-amber-200">
                      <h3 className="font-semibold text-amber-900 mb-2">Common Template Problems</h3>
                      <ul className="text-sm text-amber-800 space-y-1">
                        <li>English AST templates used in Wales</li>
                        <li>Missing fundamental terms required by law</li>
                        <li>Outdated templates from before December 2022</li>
                        <li>Free starter documents without proper legal review</li>
                      </ul>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-amber-200">
                      <h3 className="font-semibold text-amber-900 mb-2">Consequences</h3>
                      <ul className="text-sm text-amber-800 space-y-1">
                        <li>Contract not valid under Welsh law</li>
                        <li>Cannot serve Section 173 notices</li>
                        <li>Possession claims rejected by court</li>
                        <li>Contract-holder can challenge in tribunal</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What a Good Template Includes Section */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                What a Good Welsh Template Must Include
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                A compliant occupation contract template must include specific terms and
                information required by Welsh law.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Fundamental Terms</h3>
                  <p className="text-gray-600 text-sm">
                    These are set by the Renting Homes (Wales) Act 2016 and cannot be changed.
                    They include landlord repair obligations, fitness for human habitation,
                    deposit rules, and the contract-holder&apos;s right to occupy.
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Supplementary Terms</h3>
                  <p className="text-gray-600 text-sm">
                    Default terms that apply unless you agree otherwise with the contract-holder.
                    These cover matters like keeping the property in good condition, not causing
                    nuisance, and allowing landlord access for repairs.
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <Home className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Additional Terms Space</h3>
                  <p className="text-gray-600 text-sm">
                    Space to add your own terms covering property-specific matters like gardens,
                    pets, parking, and professional cleaning. These must be fair and cannot
                    contradict fundamental terms.
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <Gavel className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Welsh Procedures</h3>
                  <p className="text-gray-600 text-sm">
                    Correct references to Section 173 and Section 181 notices, Welsh rent
                    increase procedures, and information about how the contract can be ended
                    under the Renting Homes Act.
                  </p>
                </div>
              </div>

              <div className="mt-8 bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                <p className="text-green-900 text-sm">
                  <strong>Landlord Heaven templates</strong> are drafted specifically for Wales
                  and include all fundamental terms, appropriate supplementary terms, and space
                  for additional terms. They are updated when Welsh regulations change.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Free vs Paid Templates Section */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Free Starter Documents vs Professional Templates
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Why the template you choose matters for your Welsh letting.
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white rounded-2xl p-6 border-2 border-red-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <XCircle className="w-6 h-6 text-red-500" />
                    <h3 className="text-xl font-bold text-gray-900">Free Starter Documents</h3>
                  </div>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-2 text-gray-600">
                      <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <span>Often English ASTs, not Welsh contracts</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <span>May be outdated (pre-December 2022)</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <span>Missing fundamental terms</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <span>No legal review or updates</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <span>Wrong notice procedures (Section 21 instead of 173)</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <span>No support if problems arise</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white rounded-2xl p-6 border-2 border-green-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    <h3 className="text-xl font-bold text-gray-900">Professional Templates</h3>
                  </div>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Specifically drafted for Welsh law</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Updated for Renting Homes Act 2016</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>All fundamental terms included</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Regularly reviewed and updated</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Correct Section 173/181 procedures</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Court-ready if disputes arise</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mid-page CTA */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <SeoCtaBlock
          showTrustPositioningBar
                pageType="tenancy"
                variant="section"
                pagePath={PAGE_PATH}
                jurisdiction="wales"
                title="Get Your Welsh Occupation Contract Template"
                description="Our templates are drafted specifically for the Renting Homes (Wales) Act 2016, include all required terms, and are ready to use in minutes."
              />
            </div>
          </div>
        </section>

        {/* How to Use the Template Section */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                How to Use Your Template
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Creating a valid occupation contract from your template in simple steps.
              </p>

              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                      1
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Enter Property Details</h3>
                      <p className="text-gray-600">
                        Fill in the full address of the dwelling, including postcode. If the
                        property includes a garden, garage, or parking space, specify this.
                        The template will indicate exactly what information is needed.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                      2
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Add Contract-Holder Names</h3>
                      <p className="text-gray-600">
                        Enter the full legal names of all contract-holders. For joint contracts,
                        include every person who will sign. The template establishes joint and
                        several liability automatically for joint contract-holders.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                      3
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Set Rent and Dates</h3>
                      <p className="text-gray-600">
                        Specify the monthly rent amount, payment due date, and occupation date.
                        If it is a fixed-term contract, enter the end date. The template includes
                        the statutory rent increase procedure automatically.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                      4
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Add Additional Terms</h3>
                      <p className="text-gray-600">
                        Include any property-specific terms such as pet policies, garden
                        maintenance responsibilities, parking arrangements, or professional
                        cleaning requirements. These must be fair and not contradict
                        fundamental terms.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                      5
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">
                        Provide Within 14 Days
                      </h3>
                      <p className="text-gray-600">
                        You must give the completed written statement to the contract-holder
                        within 14 days of the occupation date. Keep a signed copy for your
                        records. Failure to provide on time delays your ability to serve
                        Section 173 notices.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Standard vs Premium Section */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Standard vs Premium Template
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Choose the template that best fits your Welsh letting situation.
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Standard Template</h3>
                  <p className="text-2xl font-bold text-primary mb-4">
                    {PRODUCTS.ast_standard.displayPrice}
                  </p>
                  <p className="text-gray-600 mb-6">
                    Everything you need for a straightforward Welsh letting with all legal
                    requirements covered.
                  </p>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>All fundamental terms included</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Standard supplementary terms</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Deposit protection clauses</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Written statement format</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Download and print ready</span>
                    </li>
                  </ul>
                  <Link
                    href={wizardLinkStandard}
                    className="block w-full text-center bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  >
                    Get Standard Template
                  </Link>
                </div>

                <div className="bg-white rounded-2xl p-6 border-2 border-primary shadow-lg relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-sm px-3 py-1 rounded-full">
                    Recommended
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Premium Template</h3>
                  <p className="text-2xl font-bold text-primary mb-4">
                    {PRODUCTS.ast_premium.displayPrice}
                  </p>
                  <p className="text-gray-600 mb-6">
                    Enhanced template with additional clauses for complex lettings and
                    extra protection.
                  </p>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Everything in Standard</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Break clause options</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Guarantor agreement included</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Detailed pet policy clauses</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Garden and parking terms</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Professional cleaning requirements</span>
                    </li>
                  </ul>
                  <Link
                    href={wizardLinkPremium}
                    className="block w-full text-center bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  >
                    Get Premium Template
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Key Welsh Differences Section */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Key Differences from English AST Templates
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Why you cannot use an English template for Welsh properties.
              </p>

              <div className="prose prose-lg max-w-none text-gray-600">
                <p>
                  Welsh occupation contracts are fundamentally different from English Assured
                  Shorthold Tenancies. The Renting Homes (Wales) Act 2016 created an entirely
                  new framework that does not map to the Housing Act 1988 used in England.
                </p>

                <h3>Terminology Differences</h3>
                <p>
                  In Wales, the person renting is a &quot;contract-holder&quot; not a
                  &quot;tenant&quot;. The agreement is an &quot;occupation contract&quot; not a
                  &quot;tenancy agreement&quot;. The property is a &quot;dwelling&quot; not
                  &quot;the premises&quot;. These are not just cosmetic changes — they reflect
                  different legal concepts under Welsh law.
                </p>

                <h3>Notice Procedures</h3>
                <p>
                  English ASTs use Section 21 (no-fault, 2 months) and Section 8 (grounds-based).
                  Welsh contracts use Section 173 (no-fault, 6 months minimum) and Section 181
                  (breach-based). A template referencing Section 21 is invalid in Wales.
                </p>

                <h3>Written Statement Requirement</h3>
                <p>
                  While English ASTs do not require a specific format, Welsh landlords must
                  provide a written statement within 14 days containing all fundamental and
                  supplementary terms. This is not optional — failure to provide it blocks
                  Section 173 notices.
                </p>

                <h3>Mandatory Prescribed Terms</h3>
                <p>
                  Welsh law prescribes mandatory terms that must be included exactly as stated.
                  English agreements have more flexibility. Using a template without Welsh
                  fundamental terms means your contract is non-compliant.
                </p>
              </div>

              <div className="mt-8">
                <Link
                  href="/standard-occupation-contract-wales"
                  className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
                >
                  Learn more about Standard Occupation Contracts
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <FAQSection
          faqs={occupationContractTemplateFAQs}
          title="Occupation Contract Template FAQ"
          showContactCTA={false}
          variant="gray"
        />

        {/* Final CTA */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <SeoCtaBlock
                pageType="tenancy"
                variant="final"
                pagePath={PAGE_PATH}
                jurisdiction="wales"
                title="Get Your Welsh Template Today"
                description="Renting Homes Act compliant. All fundamental terms included. Written statement format. Ready in minutes."
              />

              <SeoDisclaimer className="max-w-4xl mx-auto" />
            </div>
          </div>
        </section>

        {/* Related Resources */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <RelatedLinks title="Related Resources" links={occupationContractTemplateRelatedLinks} />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
