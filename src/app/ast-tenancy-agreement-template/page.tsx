import { Metadata } from 'next';
import Link from 'next/link';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { SocialProofCounter } from '@/components/ui/SocialProofCounter';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { astTemplateRelatedLinks } from '@/lib/seo/internal-links';
import { buildWizardLink } from '@/lib/wizard/buildWizardLink';
import { StandardHero } from '@/components/marketing/StandardHero';
import { SeoCtaBlock, SeoDisclaimer } from '@/components/seo/SeoCtaBlock';
import { SeoLandingWrapper } from '@/components/seo/SeoLandingWrapper';
import { FAQSection } from '@/components/seo/FAQSection';
import { astTemplateFAQs } from '@/data/faqs';
import { PRODUCTS } from '@/lib/pricing/products';
import {
  CheckCircle,
  Clock,
  ArrowRight,
  Scale,
  FileText,
  Shield,
  AlertTriangle,
  XCircle,
  Download,
  BadgeCheck,
  Search,
} from 'lucide-react';

// Page constants for analytics
const PAGE_PATH = '/ast-tenancy-agreement-template';
const PAGE_TITLE = 'AST Tenancy Agreement Template';
const PAGE_TYPE = 'tenancy' as const;

const wizardLinkStandard = buildWizardLink({
  product: 'ast_standard',
  jurisdiction: 'england',
  src: 'guide',
  topic: 'tenancy',
});

const wizardLinkPremium = buildWizardLink({
  product: 'ast_premium',
  jurisdiction: 'england',
  src: 'guide',
  topic: 'tenancy',
});

export const metadata: Metadata = {
  title: 'AST Tenancy Agreement Template (Legally Valid) | England 2026',
  description:
    'Download a legally valid AST tenancy agreement template for England. Court-ready, Housing Act 1988 compliant, updated for 2026 legislation.',
  keywords: [
    'ast tenancy agreement template',
    'tenancy agreement template england',
    'assured shorthold tenancy template',
    'ast template download',
    'landlord tenancy template',
    'tenancy agreement template uk',
    'free tenancy agreement template',
    'legal tenancy template england',
    'ast agreement template 2026',
  ],
  alternates: {
    canonical: 'https://landlordheaven.co.uk/ast-tenancy-agreement-template',
  },
  openGraph: {
    title: 'AST Tenancy Agreement Template (Legally Valid) | Landlord Heaven',
    description:
      'Court-ready AST template for England. Updated for 2026 legislation. Protect your eviction rights.',
    type: 'website',
  },
};

export default function AstTenancyAgreementTemplatePage() {
  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'AST Tenancy Agreement Template (Legally Valid) - England 2026',
    description:
      'Download a legally valid AST tenancy agreement template for England. Court-ready and compliant with Housing Act 1988.',
    url: 'https://landlordheaven.co.uk/ast-tenancy-agreement-template',
  };

  return (
    <>
      <StructuredData data={pageSchema} />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          { name: 'Tenancy Agreements', url: 'https://landlordheaven.co.uk/products/ast' },
          {
            name: 'AST Template',
            url: 'https://landlordheaven.co.uk/ast-tenancy-agreement-template',
          },
        ])}
      />

      {/* Analytics: Attribution + landing_view event */}
      <SeoLandingWrapper
        pagePath={PAGE_PATH}
        pageTitle={PAGE_TITLE}
        pageType={PAGE_TYPE}
        jurisdiction="england"
      />

      <main>
        {/* Hero Section */}
        <StandardHero
          badge="England Only"
          badgeIcon={<Scale className="w-4 h-4" />}
          title="AST Tenancy Agreement Template"
          subtitle={
            <>
              A <strong>legally valid</strong> Assured Shorthold Tenancy template for England.
              Court-ready, compliant with current legislation, and designed to protect your
              interests as a landlord.
            </>
          }
          primaryCTA={{
            label: `Get Template — ${PRODUCTS.ast_standard.displayPrice}`,
            href: wizardLinkStandard,
          }}
          secondaryCTA={{
            label: 'Premium Template with Extras',
            href: wizardLinkPremium,
          }}
          variant="pastel"
        >
          {/* Trust Signals */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600 mt-4">
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Updated for 2026
            </span>
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              Court-Ready Format
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-green-500" />
              Instant Download
            </span>
          </div>
        </StandardHero>

        {/* Social Proof */}
        <section className="py-6 bg-gray-50 border-y border-gray-100">
          <div className="container mx-auto px-4">
            <SocialProofCounter variant="total" className="justify-center" />
          </div>
        </section>

        {/* What Makes a Good Template Section */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                What Makes a Good AST Template?
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Not all tenancy agreement templates are equal. Many free templates found online
                contain outdated terms or clauses that courts will not enforce.
              </p>

              <div className="prose prose-lg max-w-none text-gray-600">
                <p>
                  A quality AST template must do more than just look professional. It needs to
                  comply with multiple pieces of legislation including the Housing Act 1988, Tenant
                  Fees Act 2019, Consumer Rights Act 2015, and Deregulation Act 2015. Templates
                  that fail to meet these requirements can cause serious problems when you need to
                  rely on the agreement.
                </p>
                <p>
                  The template must be specifically designed for England. Using a Scottish Private
                  Residential Tenancy or Welsh Occupation Contract template will create an invalid
                  agreement that cannot support eviction notices or court claims.
                </p>
                <p>
                  Additionally, the template should be regularly updated. Tenancy law changes
                  frequently — for example, the deposit cap rules changed in 2019, and new EPC
                  requirements came into force in 2020. A template that was compliant five years
                  ago may contain terms that are now unenforceable or missing required clauses.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Free vs Paid Templates */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Free Templates vs Professional Templates
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Understanding the risks of using free tenancy agreement templates.
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
                    <XCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Risks of Free Templates
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3 text-gray-600">
                      <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>Outdated legislation:</strong> May reference repealed laws or
                        miss new requirements
                      </span>
                    </li>
                    <li className="flex items-start gap-3 text-gray-600">
                      <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>Unfair terms:</strong> Courts can strike out unfair clauses,
                        weakening your position
                      </span>
                    </li>
                    <li className="flex items-start gap-3 text-gray-600">
                      <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>Wrong jurisdiction:</strong> Template may be for Scotland, Wales,
                        or even another country
                      </span>
                    </li>
                    <li className="flex items-start gap-3 text-gray-600">
                      <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>Missing clauses:</strong> May lack deposit protection, notice
                        periods, or repair obligations
                      </span>
                    </li>
                    <li className="flex items-start gap-3 text-gray-600">
                      <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>No support:</strong> If problems arise, you have no recourse
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white rounded-2xl p-6 border-2 border-green-200">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                    <BadgeCheck className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Professional Templates
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>Regularly updated:</strong> Kept current with all legislative
                        changes
                      </span>
                    </li>
                    <li className="flex items-start gap-3 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>Legally reviewed:</strong> Drafted and checked by legal
                        professionals
                      </span>
                    </li>
                    <li className="flex items-start gap-3 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>Jurisdiction-specific:</strong> Designed specifically for
                        England
                      </span>
                    </li>
                    <li className="flex items-start gap-3 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>Comprehensive:</strong> Includes all required and recommended
                        clauses
                      </span>
                    </li>
                    <li className="flex items-start gap-3 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>Court-tested:</strong> Designed to stand up to legal scrutiny
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-8 bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
                <p className="text-amber-900 text-sm">
                  <strong>Consider the cost:</strong> A professional template costs less than
                  £25. A failed eviction due to an invalid agreement can cost thousands in lost
                  rent, court fees, and legal expenses.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* What Our Template Includes */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                What Our AST Template Includes
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Every clause you need for a legally valid, enforceable tenancy agreement.
              </p>

              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Core Tenancy Terms</h3>
                      <p className="text-gray-600 mb-3">
                        Essential terms that form the foundation of the tenancy relationship.
                      </p>
                      <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Party identification clauses
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Property description
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Tenancy commencement date
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Fixed term or periodic terms
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Scale className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Financial Terms</h3>
                      <p className="text-gray-600 mb-3">
                        Clear rent and deposit provisions compliant with the Tenant Fees Act 2019.
                      </p>
                      <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Rent amount and payment schedule
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Deposit amount (capped at 5 weeks)
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Deposit protection scheme details
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Permitted payment methods
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Shield className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">
                        Landlord and Tenant Obligations
                      </h3>
                      <p className="text-gray-600 mb-3">
                        Clear responsibilities that can be relied upon in court if breached.
                      </p>
                      <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Landlord repair obligations
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Tenant care of property
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Insurance responsibilities
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Access for inspections
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Termination Provisions</h3>
                      <p className="text-gray-600 mb-3">
                        How the tenancy can be ended by either party, supporting valid notices.
                      </p>
                      <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Notice periods required
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Section 21 references
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Section 8 grounds basis
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          End of tenancy procedures
                        </div>
                      </div>
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
                jurisdiction="england"
                title="Get Your AST Template Now"
                description="Professionally drafted. Legally compliant. Ready for immediate use."
              />
            </div>
          </div>
        </section>

        {/* How to Use the Template */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                How to Use Your AST Template
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Follow these steps to create a valid tenancy agreement for your property.
              </p>

              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-primary">1</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Complete the Template</h3>
                      <p className="text-gray-600">
                        Enter your details, tenant names, property address, rent amount, and
                        tenancy dates. Our wizard guides you through each section, explaining what
                        information is needed and why.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-primary">2</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Review and Customise</h3>
                      <p className="text-gray-600">
                        Check all details are correct. Add any property-specific terms (e.g.,
                        garden maintenance, parking). Remove any optional clauses that do not
                        apply to your letting.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-primary">3</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Sign with Your Tenant</h3>
                      <p className="text-gray-600">
                        Both parties should sign and date the agreement. Keep a copy each. We
                        recommend signing before the tenancy start date to ensure terms are
                        agreed in advance.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-primary">4</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Provide Required Documents</h3>
                      <p className="text-gray-600">
                        Give the tenant copies of the EPC, gas safety certificate, and How to Rent
                        guide. Protect the deposit within 30 days and provide prescribed
                        information. These steps are essential for valid Section 21 notices.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Template Checklist */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                AST Template Checklist
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Use this checklist to verify your template covers everything needed.
              </p>

              <div className="bg-white rounded-2xl p-8 border border-gray-200">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Search className="w-5 h-5 text-primary" />
                      Essential Elements
                    </h3>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-2 text-gray-600">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        Names and addresses of all parties
                      </li>
                      <li className="flex items-center gap-2 text-gray-600">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        Property address and description
                      </li>
                      <li className="flex items-center gap-2 text-gray-600">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        Tenancy start date and term
                      </li>
                      <li className="flex items-center gap-2 text-gray-600">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        Rent amount and payment date
                      </li>
                      <li className="flex items-center gap-2 text-gray-600">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        Deposit amount and scheme
                      </li>
                      <li className="flex items-center gap-2 text-gray-600">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        Signatures and dates
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-primary" />
                      Legal Compliance
                    </h3>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-2 text-gray-600">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        Housing Act 1988 terms
                      </li>
                      <li className="flex items-center gap-2 text-gray-600">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        Tenant Fees Act compliant
                      </li>
                      <li className="flex items-center gap-2 text-gray-600">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        No unfair contract terms
                      </li>
                      <li className="flex items-center gap-2 text-gray-600">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        Deposit cap respected
                      </li>
                      <li className="flex items-center gap-2 text-gray-600">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        Correct notice periods
                      </li>
                      <li className="flex items-center gap-2 text-gray-600">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        Landlord repair duties included
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* When You Need the Template */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                When You Will Need This Template
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                A solid tenancy agreement protects you in multiple situations.
              </p>

              <div className="prose prose-lg max-w-none text-gray-600">
                <h3>Starting a New Tenancy</h3>
                <p>
                  Every new letting should begin with a properly drafted AST. The agreement
                  establishes the legal relationship and protects both parties. It also triggers
                  your obligation to protect the deposit and provide prescribed documents.
                </p>

                <h3>Serving Eviction Notices</h3>
                <p>
                  Whether using Section 21 or Section 8, the court will examine whether all
                  requirements were met at the start of the tenancy. The agreement helps prove
                  you provided required documents and complied with deposit protection rules.
                </p>

                <h3>Recovering Rent Arrears</h3>
                <p>
                  If you need to claim unpaid rent through the courts, you must prove the agreed
                  rent amount and payment terms. The tenancy agreement is primary evidence for
                  money claims using{' '}
                  <Link href="/money-claim-unpaid-rent" className="text-primary hover:underline">
                    Money Claim Online
                  </Link>
                  .
                </p>

                <h3>Deposit Disputes</h3>
                <p>
                  When disputes arise about deposit deductions for cleaning or damage, the
                  agreement establishes what condition the property should be returned in and
                  what the tenant&apos;s obligations were.
                </p>
              </div>

              <div className="mt-8 grid md:grid-cols-2 gap-4">
                <Link
                  href="/section-21-notice-template"
                  className="bg-white rounded-xl p-4 border border-gray-200 hover:border-primary hover:shadow-md transition-all group"
                >
                  <h3 className="font-semibold text-gray-900 group-hover:text-primary mb-1">
                    Section 21 Notice Template
                  </h3>
                  <p className="text-sm text-gray-600">
                    No-fault eviction notice for England
                  </p>
                </Link>

                <Link
                  href="/section-8-notice-template"
                  className="bg-white rounded-xl p-4 border border-gray-200 hover:border-primary hover:shadow-md transition-all group"
                >
                  <h3 className="font-semibold text-gray-900 group-hover:text-primary mb-1">
                    Section 8 Notice Template
                  </h3>
                  <p className="text-sm text-gray-600">Grounds-based eviction for breach</p>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <FAQSection
          faqs={astTemplateFAQs}
          title="AST Template FAQ"
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
                jurisdiction="england"
                title="Get Your AST Template Today"
                description="Court-ready. Legally compliant. Updated for 2026. Ready in minutes."
              />

              <SeoDisclaimer className="max-w-4xl mx-auto" />
            </div>
          </div>
        </section>

        {/* Related Resources */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <RelatedLinks title="Related Resources" links={astTemplateRelatedLinks} />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
