import { Metadata } from 'next';
import Link from 'next/link';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { SocialProofCounter } from '@/components/ui/SocialProofCounter';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { updateOccupationContractRelatedLinks } from '@/lib/seo/internal-links';
import { buildWizardLink } from '@/lib/wizard/buildWizardLink';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { SeoCtaBlock, SeoDisclaimer } from '@/components/seo/SeoCtaBlock';
import { SeoLandingWrapper } from '@/components/seo/SeoLandingWrapper';
import { FAQSection } from '@/components/seo/FAQSection';
import { updateOccupationContractFAQs } from '@/data/faqs';
import { PRODUCTS } from '@/lib/pricing/products';
import {
  CheckCircle,
  Clock,
  ArrowRight,
  Scale,
  FileText,
  Shield,
  AlertTriangle,
  RefreshCw,
  PoundSterling,
  Edit,
} from 'lucide-react';

// Page constants for analytics
const PAGE_PATH = '/update-occupation-contract-wales';
const PAGE_TITLE = 'Update Occupation Contract Wales';
const PAGE_TYPE = 'tenancy' as const;

const wizardLinkStandard = buildWizardLink({
  product: 'ast_standard',
  jurisdiction: 'wales',
  src: 'guide',
  topic: 'tenancy',
});

const wizardLinkPremium = buildWizardLink({
  product: 'ast_premium',
  jurisdiction: 'wales',
  src: 'guide',
  topic: 'tenancy',
});

export const metadata: Metadata = {
  title: 'Update Occupation Contract Wales | Changing Terms and Rent',
  description:
    'How to update an occupation contract in Wales. Rent increases, term variations, and written statements under the Renting Homes Act 2016.',
  keywords: [
    'update occupation contract wales',
    'change occupation contract wales',
    'rent increase wales',
    'vary occupation contract',
    'amend welsh tenancy',
    'update written statement wales',
    'occupation contract variation',
    'change contract holder wales',
    'renew occupation contract wales',
    'modify tenancy wales',
  ],
  alternates: {
    canonical: 'https://landlordheaven.co.uk/update-occupation-contract-wales',
  },
  openGraph: {
    title: 'Update Occupation Contract Wales | Landlord Heaven',
    description:
      'Update your Welsh occupation contract correctly. Rent increases, term changes, and written statement updates explained.',
    type: 'website',
  },
};

export default function UpdateOccupationContractWalesPage() {
  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Update Occupation Contract Wales',
    description:
      'Learn how to update an occupation contract in Wales under the Renting Homes (Wales) Act 2016, including rent increases and term variations.',
    url: 'https://landlordheaven.co.uk/update-occupation-contract-wales',
  };

  return (
    <>
      <HeaderConfig mode="autoOnScroll" />
      <StructuredData data={pageSchema} />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          { name: 'Tenancy Agreements', url: 'https://landlordheaven.co.uk/products/ast' },
          {
            name: 'Update Occupation Contract Wales',
            url: 'https://landlordheaven.co.uk/update-occupation-contract-wales',
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

      <main>
        {/* Hero Section */}
        <UniversalHero
          badge="Wales Only"
          badgeIcon={<Scale className="w-4 h-4" />}
          title="Update Occupation Contract Wales"
          subtitle={
            <>
              Learn how to <strong>update your occupation contract</strong> correctly in
              Wales. Understand the procedures for rent increases, changing terms, and
              updating written statements under the Renting Homes (Wales) Act 2016.
            </>
          }
          primaryCta={{
            label: `Create New Contract — ${PRODUCTS.ast_standard.displayPrice}`,
            href: wizardLinkStandard,
          }}
          secondaryCta={{
            label: 'Premium Contract with Extra Protection',
            href: wizardLinkPremium,
          }}
          variant="pastel"
        >
          {/* Trust Signals */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600 mt-4">
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Renting Homes Act 2016 Compliant
            </span>
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              Proper Variation Procedures
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

        {/* When to Update Section */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                When Do You Need to Update an Occupation Contract?
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Understanding when updates are necessary and the procedures to follow under
                Welsh law.
              </p>

              <div className="prose prose-lg max-w-none text-gray-600">
                <p>
                  There are several situations where you may need to update your occupation
                  contract or the written statement in Wales. The Renting Homes (Wales) Act
                  2016 has specific procedures for different types of changes.
                </p>
                <p>
                  Some changes can be made unilaterally by following statutory procedures
                  (like rent increases), while others require agreement with the
                  contract-holder. Understanding which procedure applies is essential to
                  making valid changes.
                </p>
                <ul>
                  <li>
                    <strong>Rent increases:</strong> You can increase rent by following the
                    statutory procedure, even without the contract-holder&apos;s agreement
                    (though they can challenge it).
                  </li>
                  <li>
                    <strong>Changing other terms:</strong> You generally need the
                    contract-holder&apos;s agreement to change supplementary or additional
                    terms during the contract.
                  </li>
                  <li>
                    <strong>Adding or removing contract-holders:</strong> Requires updating
                    the written statement and potentially creating a variation agreement.
                  </li>
                  <li>
                    <strong>Correcting errors:</strong> If your original written statement
                    was incomplete or incorrect, you must provide a corrected version.
                  </li>
                  <li>
                    <strong>Renewing after fixed term:</strong> When a fixed term ends, you
                    may want to grant a new fixed term with updated terms.
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
                    Written Statement Must Be Updated
                  </h2>
                  <p className="text-amber-800 mb-4">
                    Whenever terms change, you must provide an updated written statement to
                    the contract-holder within 14 days. Failure to do so is a breach of your
                    obligations.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-amber-200">
                      <h3 className="font-semibold text-amber-900 mb-2">What Triggers an Update</h3>
                      <ul className="text-sm text-amber-800 space-y-1">
                        <li>Rent increase takes effect</li>
                        <li>Terms varied by agreement</li>
                        <li>Contract-holder added or removed</li>
                        <li>Correcting incomplete statement</li>
                      </ul>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-amber-200">
                      <h3 className="font-semibold text-amber-900 mb-2">Consequences of Not Updating</h3>
                      <ul className="text-sm text-amber-800 space-y-1">
                        <li>Breach of landlord obligations</li>
                        <li>Contract-holder can apply to tribunal</li>
                        <li>May affect your possession rights</li>
                        <li>Creates confusion about current terms</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Rent Increases Section */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                How to Increase Rent Under an Occupation Contract
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                The statutory procedure for rent increases in Wales.
              </p>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Written Notice Required</h3>
                  <p className="text-gray-600 text-sm">
                    Serve a rent increase notice using the prescribed form. The notice must
                    state the new rent amount and the date it takes effect.
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Minimum Notice Period</h3>
                  <p className="text-gray-600 text-sm">
                    You must give at least 2 months notice before the rent increase takes
                    effect. The increase cannot take effect during a fixed term.
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <Scale className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Tribunal Challenge</h3>
                  <p className="text-gray-600 text-sm">
                    The contract-holder can refer the increase to a tribunal within 2 months
                    of receiving notice. The tribunal decides if the rent is reasonable.
                  </p>
                </div>
              </div>

              <div className="prose prose-lg max-w-none text-gray-600">
                <h3>The Rent Increase Process</h3>
                <p>
                  Unlike England where you might simply agree a new rent, Welsh law provides
                  a formal statutory procedure for rent increases under occupation contracts.
                  Even if you agree the increase verbally with the contract-holder, following
                  the formal process protects both parties.
                </p>
                <ol>
                  <li>
                    <strong>Serve the prescribed notice:</strong> Use the correct form for a
                    rent increase notice under the Renting Homes Act. Include the current rent,
                    new rent amount, and effective date.
                  </li>
                  <li>
                    <strong>Allow 2 months notice:</strong> The increase cannot take effect
                    until at least 2 months after you serve the notice.
                  </li>
                  <li>
                    <strong>Wait for any challenge:</strong> The contract-holder has 2 months
                    from receiving the notice to refer it to a tribunal. If they do not, the
                    increase takes effect on the stated date.
                  </li>
                  <li>
                    <strong>Update the written statement:</strong> Within 14 days of the new
                    rent taking effect, provide an updated written statement showing the new
                    rent amount.
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </section>

        {/* Changing Other Terms Section */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Changing Other Contract Terms
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                How to vary supplementary and additional terms during the contract.
              </p>

              <div className="space-y-8">
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Shield className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Fundamental Terms Cannot Be Changed</h3>
                      <p className="text-gray-600 mb-4">
                        Fundamental terms are set by law and cannot be varied, even by agreement
                        between landlord and contract-holder. These include landlord repair
                        obligations, fitness for human habitation requirements, and deposit
                        protection rules.
                      </p>
                      <p className="text-sm text-gray-500">
                        Any attempt to contract out of fundamental terms is void and unenforceable.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Edit className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Supplementary Terms</h3>
                      <p className="text-gray-600 mb-4">
                        Supplementary terms (defaults that apply unless varied) can be changed
                        by agreement between you and the contract-holder. Both parties must
                        agree to the variation in writing.
                      </p>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>Discuss and negotiate the change</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>Document the agreement in writing</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>Both parties sign the variation</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>Update written statement within 14 days</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Additional Terms</h3>
                      <p className="text-gray-600 mb-4">
                        Additional terms (property-specific terms you added) can also be varied
                        by agreement. This might include changing pet policies, garden
                        responsibilities, or parking arrangements.
                      </p>
                      <p className="text-sm text-gray-500">
                        Remember: any new or varied additional terms must still be fair and
                        cannot contradict fundamental terms.
                      </p>
                    </div>
                  </div>
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
                pageType="tenancy"
                variant="section"
                pagePath={PAGE_PATH}
                jurisdiction="wales"
                title="Need a New Occupation Contract?"
                description="If you are making significant changes or renewing after a fixed term, creating a fresh contract may be simpler than multiple variations."
              />
            </div>
          </div>
        </section>

        {/* New Contract vs Variation Section */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                New Contract vs Variation Agreement
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Deciding whether to vary the existing contract or create a new one.
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Edit className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Variation Agreement</h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    A variation agreement amends the existing contract without ending it.
                    Use when making minor changes.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Simpler for small changes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Deposit protection continues</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Original occupation date maintained</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Less paperwork</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <RefreshCw className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">New Contract</h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    A new contract replaces the existing one entirely. Use when making
                    significant changes or starting fresh.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Clean slate with updated terms</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>New fixed term if desired</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Clear documentation of current terms</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>May need to re-protect deposit</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                <p className="text-blue-900 text-sm">
                  <strong>Tip:</strong> If you are changing contract-holders (adding or
                  removing names), a new contract is often cleaner than trying to vary the
                  existing one. Check deposit protection requirements when doing so.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Standard vs Premium Section */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Standard vs Premium Occupation Contract
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                If creating a new contract, choose the right option for your situation.
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Standard Contract</h3>
                  <p className="text-2xl font-bold text-primary mb-4">
                    {PRODUCTS.ast_standard.displayPrice}
                  </p>
                  <p className="text-gray-600 mb-6">
                    A complete, legally valid occupation contract with all fundamental and
                    supplementary terms.
                  </p>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Renting Homes Act 2016 compliant</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>All fundamental terms included</span>
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
                      <span>Fixed-term or periodic options</span>
                    </li>
                  </ul>
                  <Link
                    href={wizardLinkStandard}
                    className="block w-full text-center bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  >
                    Create Standard Contract
                  </Link>
                </div>

                <div className="bg-white rounded-2xl p-6 border-2 border-primary shadow-lg relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-sm px-3 py-1 rounded-full">
                    Recommended
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Premium Contract</h3>
                  <p className="text-2xl font-bold text-primary mb-4">
                    {PRODUCTS.ast_premium.displayPrice}
                  </p>
                  <p className="text-gray-600 mb-6">
                    Enhanced protection with additional clauses for complex situations.
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
                      <span>Pet policy clauses</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Garden and parking terms</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Professional cleaning clause</span>
                    </li>
                  </ul>
                  <Link
                    href={wizardLinkPremium}
                    className="block w-full text-center bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  >
                    Create Premium Contract
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Incomplete Written Statements Section */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                What If Your Written Statement Was Incomplete?
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Correcting problems with your original documentation.
              </p>

              <div className="prose prose-lg max-w-none text-gray-600">
                <p>
                  If you realise your original written statement was missing required terms
                  or contained errors, you should correct it as soon as possible. An
                  incomplete written statement affects your rights and may prevent you from
                  serving valid possession notices.
                </p>

                <h3>The Impact of Incomplete Statements</h3>
                <p>
                  Even if your written statement was incomplete, the statutory fundamental
                  and supplementary terms apply automatically by operation of law. However,
                  proving what was agreed and serving valid notices becomes more difficult
                  without proper documentation.
                </p>

                <h3>How to Correct the Problem</h3>
                <ul>
                  <li>
                    <strong>Provide a corrected statement:</strong> Give the contract-holder
                    a complete written statement containing all required terms. Date it and
                    keep a copy.
                  </li>
                  <li>
                    <strong>Acknowledge the correction:</strong> The corrected statement
                    should note that it replaces or supplements the original and contains
                    the complete terms.
                  </li>
                  <li>
                    <strong>Consider Section 173 timing:</strong> If you never provided a
                    compliant written statement, you cannot serve a Section 173 notice until
                    6 months after you provide one.
                  </li>
                </ul>

                <h3>Contract-Holder Tribunal Rights</h3>
                <p>
                  A contract-holder can apply to the Residential Property Tribunal if you
                  have not provided a written statement or if the statement is incomplete.
                  The tribunal can order you to provide a proper statement and may make an
                  award against you.
                </p>
              </div>

              <div className="mt-8">
                <Link
                  href="/standard-occupation-contract-wales"
                  className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
                >
                  Learn more about Welsh occupation contracts
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <FAQSection
          faqs={updateOccupationContractFAQs}
          title="Update Occupation Contract FAQ"
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
                title="Create Your Updated Welsh Contract"
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
              <RelatedLinks title="Related Resources" links={updateOccupationContractRelatedLinks} />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
