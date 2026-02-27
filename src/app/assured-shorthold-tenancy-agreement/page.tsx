import { Metadata } from 'next';
import Link from 'next/link';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { SocialProofCounter } from '@/components/ui/SocialProofCounter';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { astMainRelatedLinks } from '@/lib/seo/internal-links';
import { buildWizardLink } from '@/lib/wizard/buildWizardLink';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { SeoCtaBlock, SeoDisclaimer } from '@/components/seo/SeoCtaBlock';
import { SeoLandingWrapper } from '@/components/seo/SeoLandingWrapper';
import { FAQSection } from '@/components/seo/FAQSection';
import { astTenancyAgreementFAQs } from '@/data/faqs';
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
  Users,
  Gavel,
  BadgeCheck,
} from 'lucide-react';

// Page constants for analytics
const PAGE_PATH = '/assured-shorthold-tenancy-agreement';
const PAGE_TITLE = 'Assured Shorthold Tenancy Agreement';
const PAGE_TYPE = 'tenancy' as const;

const wizardLinkStandard = buildWizardLink({
  product: 'ast_standard',
  jurisdiction: 'england',
  src: 'seo_assured_shorthold_tenancy_agreement',
  topic: 'tenancy',
});

const wizardLinkPremium = buildWizardLink({
  product: 'ast_premium',
  jurisdiction: 'england',
  src: 'seo_assured_shorthold_tenancy_agreement',
  topic: 'tenancy',
});

export const metadata: Metadata = {
  title: 'Assured Shorthold Tenancy Agreement (England) | Create AST Online',
  description:
    'Create a legally valid Assured Shorthold Tenancy agreement for England. Court-enforceable AST compliant with Housing Act 1988. Protects your eviction rights.',
  keywords: [
    'assured shorthold tenancy agreement',
    'ast tenancy agreement',
    'tenancy agreement england landlord',
    'assured shorthold tenancy',
    'ast agreement',
    'tenancy agreement template england',
    'landlord tenancy agreement',
    'housing act 1988 tenancy',
    'create tenancy agreement',
    'legal tenancy agreement',
  ],
  alternates: {
    canonical: 'https://landlordheaven.co.uk/assured-shorthold-tenancy-agreement',
  },
  openGraph: {
    title: 'Assured Shorthold Tenancy Agreement (England) | Landlord Heaven',
    description:
      'Create a legally valid AST for England. Court-enforceable tenancy agreement compliant with current legislation.',
    type: 'website',
    url: 'https://landlordheaven.co.uk/assured-shorthold-tenancy-agreement',
  },
};

export default function AssuredShortholdTenancyAgreementPage() {
  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Assured Shorthold Tenancy Agreement (England)',
    description:
      'Create a legally valid Assured Shorthold Tenancy agreement for England. Court-enforceable and compliant with Housing Act 1988.',
    url: 'https://landlordheaven.co.uk/assured-shorthold-tenancy-agreement',
  };

  return (
    <>
      <StructuredData data={pageSchema} />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          { name: 'Tenancy Agreements', url: 'https://landlordheaven.co.uk/products/ast' },
          {
            name: 'Assured Shorthold Tenancy Agreement',
            url: 'https://landlordheaven.co.uk/assured-shorthold-tenancy-agreement',
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

      <HeaderConfig mode="autoOnScroll" />

      <main>
        {/* Hero Section */}
        <UniversalHero
          badge="England Only"
          badgeIcon={<Scale className="w-4 h-4" />}
          title="Assured Shorthold Tenancy Agreement"
          subtitle={
            <>
              Create a <strong>legally valid</strong> tenancy agreement for England.
              Court-enforceable, compliant with the Housing Act 1988, and designed to protect your
              eviction rights.
            </>
          }
          primaryCta={{
            label: `Create Tenancy Agreement — ${PRODUCTS.ast_standard.displayPrice}`,
            href: wizardLinkStandard,
          }}
          secondaryCta={{
            label: 'Premium Agreement with Extra Protection',
            href: wizardLinkPremium,
          }}
        >
          {/* Trust Signals */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600 mt-4">
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Housing Act 1988 Compliant
            </span>
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              Court-Ready Documentation
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

        {/* What is an AST Section */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                What Is an Assured Shorthold Tenancy Agreement?
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Understanding the most common tenancy type in England and why getting it right
                matters for your property.
              </p>

              <div className="prose prose-lg max-w-none text-gray-600">
                <p>
                  An <strong>Assured Shorthold Tenancy (AST)</strong> is the default tenancy type
                  for most private residential lettings in England. It was introduced by the Housing
                  Act 1988 and gives landlords the right to regain possession of their property
                  using either a Section 21 notice (no-fault eviction) or a Section 8 notice
                  (grounds-based eviction).
                </p>
                <p>
                  An AST provides tenants with certain statutory rights, including protection from
                  unfair eviction and the right to have their deposit protected in a government-
                  approved scheme. For landlords, it provides a clear legal framework for managing
                  the tenancy and recovering possession when needed.
                </p>
                <p>
                  The tenancy agreement itself is the contract between you and your tenant. While a
                  tenancy can technically exist without a written agreement, having a properly
                  drafted AST is essential for several reasons:
                </p>
                <ul>
                  <li>
                    <strong>Deposit protection compliance:</strong> You must provide prescribed
                    information about deposit protection, and a written agreement is the clearest
                    way to document this.
                  </li>
                  <li>
                    <strong>Section 21 validity:</strong> Courts examine whether all pre-tenancy
                    requirements were met. A clear written agreement helps prove compliance.
                  </li>
                  <li>
                    <strong>Dispute resolution:</strong> If disagreements arise about rent, repairs,
                    or tenancy terms, a written agreement provides definitive evidence.
                  </li>
                  <li>
                    <strong>Money claims:</strong> If you need to pursue the tenant for unpaid rent
                    or damage, the court will want to see the agreed terms.
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
                    Why Using the Correct Tenancy Agreement Matters
                  </h2>
                  <p className="text-amber-800 mb-4">
                    Many landlords only discover their tenancy agreement has problems when they try
                    to evict a tenant or make a court claim. By then, it can be too late.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-amber-200">
                      <h3 className="font-semibold text-amber-900 mb-2">Common Mistakes</h3>
                      <ul className="text-sm text-amber-800 space-y-1">
                        <li>• Using a Scottish or Welsh template in England</li>
                        <li>• Outdated agreements missing required clauses</li>
                        <li>• Unfair terms that courts will not enforce</li>
                        <li>• Missing deposit protection information</li>
                      </ul>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-amber-200">
                      <h3 className="font-semibold text-amber-900 mb-2">Consequences</h3>
                      <ul className="text-sm text-amber-800 space-y-1">
                        <li>• Section 21 notice declared invalid</li>
                        <li>• Possession claim thrown out by court</li>
                        <li>• Unable to recover unpaid rent</li>
                        <li>• Deposit penalties of up to 3x deposit</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Legal Requirements Section */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Legal Requirements for a Valid AST
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Your tenancy agreement must comply with multiple pieces of legislation to be fully
                enforceable.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Housing Act 1988</h3>
                  <p className="text-gray-600 text-sm">
                    The foundational legislation for ASTs. Defines tenant security, eviction
                    grounds, and landlord rights. Your agreement must not conflict with statutory
                    tenant protections.
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Tenant Fees Act 2019</h3>
                  <p className="text-gray-600 text-sm">
                    Prohibits most fees charged to tenants. Your agreement cannot include banned
                    fees for viewings, references, inventory, or early termination beyond
                    prescribed limits.
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <Scale className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Consumer Rights Act 2015</h3>
                  <p className="text-gray-600 text-sm">
                    Unfair contract terms are not enforceable. Clauses must be transparent, fair,
                    and not create significant imbalance. Courts can strike out unfair terms
                    entirely.
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <Gavel className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Deregulation Act 2015</h3>
                  <p className="text-gray-600 text-sm">
                    Requires landlords to provide EPC, gas safety certificate, and How to Rent
                    guide before a valid Section 21 notice can be served. Non-compliance invalidates
                    eviction notices.
                  </p>
                </div>
              </div>

              <div className="mt-8 bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                <p className="text-green-900 text-sm">
                  <strong>Landlord Heaven AST agreements</strong> are drafted to comply with all
                  current legislation. They are regularly updated when laws change, so you always
                  have a compliant agreement.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* What to Include Section */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                What Your AST Should Include
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                A comprehensive tenancy agreement covers all essential terms to protect both
                landlord and tenant.
              </p>

              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">
                        Parties and Property Details
                      </h3>
                      <p className="text-gray-600 mb-3">
                        The agreement must clearly identify the landlord (or their agent), all
                        tenants by full legal name, and the property address. For joint tenancies,
                        all tenants should be named and their joint and several liability
                        established.
                      </p>
                      <ul className="grid md:grid-cols-2 gap-2 text-sm text-gray-600">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Landlord name and contact address
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          All tenant names and addresses
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Full property address
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Agent details (if applicable)
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Rent and Payment Terms</h3>
                      <p className="text-gray-600 mb-3">
                        Specify the rent amount, payment frequency, due date, and acceptable payment
                        methods. Include provisions for rent review if the tenancy may continue
                        beyond the initial term.
                      </p>
                      <ul className="grid md:grid-cols-2 gap-2 text-sm text-gray-600">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Monthly rent amount
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Payment due date
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Payment method (bank transfer, etc.)
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Rent review provisions
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Shield className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Deposit Protection</h3>
                      <p className="text-gray-600 mb-3">
                        The deposit amount, which scheme it will be protected in, and how it will
                        be returned at the end of the tenancy. You must provide the tenant with
                        prescribed information within 30 days.
                      </p>
                      <ul className="grid md:grid-cols-2 gap-2 text-sm text-gray-600">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Deposit amount (max 5 weeks rent)
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Protection scheme name
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Return conditions
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Prescribed information requirements
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Home className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">
                        Tenancy Duration and Termination
                      </h3>
                      <p className="text-gray-600 mb-3">
                        Whether it is a fixed term or periodic tenancy, the start date, end date
                        (if fixed), and how either party can end the tenancy including notice
                        periods required.
                      </p>
                      <ul className="grid md:grid-cols-2 gap-2 text-sm text-gray-600">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Tenancy start date
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Fixed term end date (if applicable)
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Notice periods
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Break clause (if included)
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <BadgeCheck className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">
                        Responsibilities and Obligations
                      </h3>
                      <p className="text-gray-600 mb-3">
                        Clearly define who is responsible for repairs, maintenance, bills, and
                        other obligations. This prevents disputes and establishes grounds for
                        action if terms are breached.
                      </p>
                      <ul className="grid md:grid-cols-2 gap-2 text-sm text-gray-600">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Landlord repair obligations
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Tenant responsibilities
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Utility bill responsibility
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Garden and exterior maintenance
                        </li>
                      </ul>
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
                title="Create Your Tenancy Agreement Now"
                description="Our AST agreements are drafted by legal professionals, updated for current legislation, and designed to stand up in court."
              />
            </div>
          </div>
        </section>

        {/* Standard vs Premium Section */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Standard vs Premium Tenancy Agreement
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Choose the level of protection that suits your letting situation.
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Standard Agreement</h3>
                  <p className="text-2xl font-bold text-primary mb-4">
                    {PRODUCTS.ast_standard.displayPrice}
                  </p>
                  <p className="text-gray-600 mb-6">
                    A complete, legally valid AST with all essential clauses required for
                    compliance.
                  </p>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Housing Act 1988 compliant</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Tenant Fees Act 2019 compliant</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Deposit protection clauses</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Clear rent and payment terms</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Repair responsibilities defined</span>
                    </li>
                  </ul>
                  <Link
                    href={wizardLinkStandard}
                    className="block w-full text-center bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  >
                    Create Standard Agreement
                  </Link>
                </div>

                <div className="bg-white rounded-2xl p-6 border-2 border-primary shadow-lg relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-sm px-3 py-1 rounded-full">
                    Recommended
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Premium Agreement</h3>
                  <p className="text-2xl font-bold text-primary mb-4">
                    {PRODUCTS.ast_premium.displayPrice}
                  </p>
                  <p className="text-gray-600 mb-6">
                    Enhanced protection with additional clauses for complex situations and extra
                    security.
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
                      <span>Rent review mechanism</span>
                    </li>
                  </ul>
                  <Link
                    href={wizardLinkPremium}
                    className="block w-full text-center bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  >
                    Create Premium Agreement
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Enforceability Matters Section */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Why Enforceability Matters
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Your tenancy agreement is only valuable if it holds up when you need it most.
              </p>

              <div className="prose prose-lg max-w-none text-gray-600">
                <p>
                  Most tenancies run smoothly, but when problems arise, your tenancy agreement
                  becomes the foundation of any legal action. Whether you need to evict a
                  non-paying tenant, recover rent arrears through the courts, or defend against a
                  tenant claim, the agreement must be legally sound.
                </p>

                <h3>Section 21 Evictions</h3>
                <p>
                  To serve a valid Section 21 notice, you must have complied with various
                  requirements including deposit protection, providing the How to Rent guide, EPC,
                  and gas safety certificate. Your tenancy agreement should document these
                  obligations and confirm compliance.
                </p>
                <p>
                  If a tenant challenges your Section 21 notice, the court will examine whether all
                  requirements were met. A well-drafted agreement that references these obligations
                  helps establish compliance.
                </p>

                <h3>Section 8 Evictions</h3>
                <p>
                  Section 8 notices rely on specific grounds, many of which relate to tenant
                  breaches of the tenancy agreement. For example, Ground 8 (rent arrears) requires
                  proving the rent amount and that it is at least 2 months in arrears. Ground 12
                  (breach of tenancy obligation) requires a clear term that has been breached.
                </p>
                <p>
                  If your agreement does not clearly state the rent amount, payment date, or
                  specific obligations, proving a breach becomes more difficult.
                </p>

                <h3>Money Claims</h3>
                <p>
                  When pursuing a tenant for unpaid rent, damage, or other losses through the
                  courts (typically using Money Claim Online), the judge will want to see evidence
                  of the agreed terms. A clear, signed tenancy agreement is essential evidence.
                </p>
                <p>
                  Claims are also strengthened when the agreement explicitly states tenant
                  obligations around property condition, cleaning, and returning the property at
                  the end of the tenancy.
                </p>
              </div>

              <div className="mt-8">
                <Link
                  href="/money-claim-unpaid-rent"
                  className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
                >
                  Learn about recovering unpaid rent through the courts
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Internal Links Section */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Related Tenancy Agreement Guides
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Explore our other resources for England landlords.
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <Link
                  href="/ast-tenancy-agreement-template"
                  className="bg-white rounded-xl p-4 border border-gray-200 hover:border-primary hover:shadow-md transition-all group"
                >
                  <h3 className="font-semibold text-gray-900 group-hover:text-primary mb-1">
                    AST Template Guide
                  </h3>
                  <p className="text-sm text-gray-600">
                    Detailed guide to what makes a good AST template
                  </p>
                </Link>

                <Link
                  href="/fixed-term-periodic-tenancy-england"
                  className="bg-white rounded-xl p-4 border border-gray-200 hover:border-primary hover:shadow-md transition-all group"
                >
                  <h3 className="font-semibold text-gray-900 group-hover:text-primary mb-1">
                    Fixed Term vs Periodic
                  </h3>
                  <p className="text-sm text-gray-600">
                    Which tenancy type is right for your situation
                  </p>
                </Link>

                <Link
                  href="/joint-tenancy-agreement-england"
                  className="bg-white rounded-xl p-4 border border-gray-200 hover:border-primary hover:shadow-md transition-all group"
                >
                  <h3 className="font-semibold text-gray-900 group-hover:text-primary mb-1">
                    Joint Tenancy Agreements
                  </h3>
                  <p className="text-sm text-gray-600">Letting to multiple tenants in England</p>
                </Link>

                <Link
                  href="/renew-tenancy-agreement-england"
                  className="bg-white rounded-xl p-4 border border-gray-200 hover:border-primary hover:shadow-md transition-all group"
                >
                  <h3 className="font-semibold text-gray-900 group-hover:text-primary mb-1">
                    Renewing Your AST
                  </h3>
                  <p className="text-sm text-gray-600">
                    How to renew or update an existing tenancy
                  </p>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <FAQSection
          faqs={astTenancyAgreementFAQs}
          title="AST Tenancy Agreement FAQ"
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
                title="Create Your AST Agreement Today"
                description="Legally valid. Court-enforceable. Updated for current legislation. Ready in minutes."
              />

              <SeoDisclaimer className="max-w-4xl mx-auto" />
            </div>
          </div>
        </section>

        {/* Related Resources */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <RelatedLinks title="Related Resources" links={astMainRelatedLinks} />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
