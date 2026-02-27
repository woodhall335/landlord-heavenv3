import { Metadata } from 'next';
import Link from 'next/link';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { SocialProofCounter } from '@/components/ui/SocialProofCounter';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { jointTenancyEnglandRelatedLinks } from '@/lib/seo/internal-links';
import { buildWizardLink } from '@/lib/wizard/buildWizardLink';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { SeoCtaBlock, SeoDisclaimer } from '@/components/seo/SeoCtaBlock';
import { SeoLandingWrapper } from '@/components/seo/SeoLandingWrapper';
import { FAQSection } from '@/components/seo/FAQSection';
import { jointTenancyEnglandFAQs } from '@/data/faqs';
import { PRODUCTS } from '@/lib/pricing/products';
import {
  CheckCircle,
  Clock,
  ArrowRight,
  Scale,
  Users,
  Shield,
  AlertTriangle,
  UserPlus,
  UserMinus,
  Banknote,
  Home,
} from 'lucide-react';

// Page constants for analytics
const PAGE_PATH = '/joint-tenancy-agreement-england';
const PAGE_TITLE = 'Joint Tenancy Agreement England';
const PAGE_TYPE = 'tenancy' as const;

const wizardLinkStandard = buildWizardLink({
  product: 'ast_standard',
  jurisdiction: 'england',
  src: 'seo_joint-tenancy-agreement-england',
  topic: 'tenancy',
});

const wizardLinkPremium = buildWizardLink({
  product: 'ast_premium',
  jurisdiction: 'england',
  src: 'seo_joint-tenancy-agreement-england',
  topic: 'tenancy',
});

export const metadata: Metadata = {
  title: 'Joint Tenancy Agreement (England) | Multiple Tenants AST',
  description:
    'Create a joint tenancy agreement for multiple tenants in England. Includes joint and several liability protection for landlords letting to sharers.',
  keywords: [
    'joint tenancy agreement england',
    'tenancy agreement for sharers england',
    'multiple tenant tenancy agreement',
    'joint and several liability',
    'house share tenancy agreement',
    'shared house tenancy',
    'ast multiple tenants',
    'joint tenant agreement uk',
    'flatshare tenancy agreement',
  ],
  alternates: {
    canonical: 'https://landlordheaven.co.uk/joint-tenancy-agreement-england',
  },
  openGraph: {
    title: 'Joint Tenancy Agreement (England) | Landlord Heaven',
    description:
      'Joint tenancy agreement for multiple tenants in England. Joint and several liability protection included.',
    type: 'website',
    url: 'https://landlordheaven.co.uk/joint-tenancy-agreement-england',
  },
};

export default function JointTenancyAgreementEnglandPage() {
  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Joint Tenancy Agreement (England) - Multiple Tenants',
    description:
      'Create a joint tenancy agreement for multiple tenants in England with joint and several liability protection.',
    url: 'https://landlordheaven.co.uk/joint-tenancy-agreement-england',
  };

  return (
    <>
      <StructuredData data={pageSchema} />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          { name: 'Tenancy Agreements', url: 'https://landlordheaven.co.uk/products/ast' },
          {
            name: 'Joint Tenancy Agreement',
            url: 'https://landlordheaven.co.uk/joint-tenancy-agreement-england',
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
          title="Joint Tenancy Agreement"
          subtitle={
            <>
              Create a <strong>legally valid</strong> tenancy agreement for multiple tenants in
              England. Includes joint and several liability to protect your rental income.
            </>
          }
          primaryCta={{
            label: `Create Joint Tenancy — ${PRODUCTS.ast_standard.displayPrice}`,
            href: wizardLinkStandard,
          }}
          secondaryCta={{
            label: 'Premium with Guarantor Option',
            href: wizardLinkPremium,
          }}
        >
          {/* Trust Signals */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600 mt-4">
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Joint & Several Liability
            </span>
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              Full Rent Protection
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

        {/* What is Joint Tenancy Section */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                What Is a Joint Tenancy?
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Understanding how joint tenancies work when letting to multiple tenants.
              </p>

              <div className="prose prose-lg max-w-none text-gray-600">
                <p>
                  A <strong>joint tenancy</strong> is where two or more people sign the same
                  tenancy agreement as tenants. All joint tenants are collectively responsible
                  for the whole property and the full rent — not just their individual share.
                </p>
                <p>
                  This is different from having separate individual tenancies with each person,
                  where each tenant would only be responsible for their own agreed rent. Joint
                  tenancies are the most common arrangement for couples, sharers, and house
                  shares.
                </p>
                <p>
                  The key advantage for landlords is <strong>joint and several liability</strong>
                  . This legal principle means you can pursue any one tenant for the full
                  rent if the others do not pay their share. You are not limited to claiming
                  each tenant&apos;s individual portion.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Joint and Several Liability Section */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Joint and Several Liability Explained
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                The most important protection for landlords letting to multiple tenants.
              </p>

              <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Banknote className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">How It Works</h3>
                    <p className="text-gray-600">
                      Joint and several liability means each tenant is individually liable for
                      the entire rent, not just their share. If the monthly rent is £1,500 and
                      there are three tenants, you can claim the full £1,500 from any one of
                      them if the others default.
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-green-50 rounded-xl p-4">
                    <h4 className="font-semibold text-green-900 mb-2">With Joint and Several</h4>
                    <ul className="space-y-2 text-sm text-green-800">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>Claim full rent from any tenant</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>One tenant&apos;s departure doesn&apos;t reduce liability</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>Simpler court claims — sue any or all</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>Stronger enforcement position</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-red-50 rounded-xl p-4">
                    <h4 className="font-semibold text-red-900 mb-2">Without Joint and Several</h4>
                    <ul className="space-y-2 text-sm text-red-800">
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>Only claim each tenant&apos;s share</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>If one defaults, their share is lost</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>Multiple court claims may be needed</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>Weaker landlord position</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mt-8 bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
                <p className="text-amber-900 text-sm">
                  <strong>Important:</strong> Joint and several liability should be explicitly
                  stated in your tenancy agreement. While courts may imply it for joint tenants,
                  having it clearly written prevents any dispute.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* When to Use Joint Tenancy */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                When to Use a Joint Tenancy
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Joint tenancies are suitable for many multi-occupancy situations.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-bold text-gray-900">Couples</h3>
                  </div>
                  <p className="text-gray-600 mb-3">
                    Partners living together usually prefer a joint tenancy. Both are named on
                    the agreement and share responsibility. If one partner leaves, the other
                    remains liable for full rent.
                  </p>
                  <div className="text-sm text-green-600 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Joint tenancy recommended
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-bold text-gray-900">Friends Sharing</h3>
                  </div>
                  <p className="text-gray-600 mb-3">
                    Groups of friends renting together typically use a joint tenancy. All
                    sharers are collectively responsible, which simplifies your relationship
                    with the household.
                  </p>
                  <div className="text-sm text-green-600 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Joint tenancy recommended
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Home className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-bold text-gray-900">Family Members</h3>
                  </div>
                  <p className="text-gray-600 mb-3">
                    Adult family members (e.g., siblings, parent and adult child) sharing a
                    property can use a joint tenancy. All named individuals share
                    responsibility.
                  </p>
                  <div className="text-sm text-green-600 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Joint tenancy recommended
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                    </div>
                    <h3 className="font-bold text-gray-900">Unrelated Strangers (HMO)</h3>
                  </div>
                  <p className="text-gray-600 mb-3">
                    For HMOs with unrelated individuals who do not know each other, consider
                    whether a joint tenancy is appropriate. Separate tenancies may be better
                    but require HMO licensing.
                  </p>
                  <div className="text-sm text-amber-600 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Consider carefully — check HMO rules
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
                title="Create Your Joint Tenancy Agreement"
                description="Joint and several liability included. Add all tenant names. Ready in minutes."
              />
            </div>
          </div>
        </section>

        {/* Managing Joint Tenancies */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Managing Joint Tenancies
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Common situations that arise with multiple tenants and how to handle them.
              </p>

              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <UserMinus className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">When One Tenant Wants to Leave</h3>
                      <p className="text-gray-600 mb-3">
                        During a fixed term, no joint tenant can leave unilaterally unless there
                        is a break clause. On a periodic tenancy, one tenant giving notice can
                        technically end the entire tenancy for all joint tenants.
                      </p>
                      <p className="text-gray-600">
                        <strong>Best practice:</strong> If one tenant wants to leave, end the
                        existing tenancy and create a new one with the remaining tenants (plus
                        any replacement). This creates clean documentation and resets the
                        deposit protection.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <UserPlus className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Adding a New Tenant</h3>
                      <p className="text-gray-600 mb-3">
                        To add someone to a joint tenancy, you need to end the existing tenancy
                        and create a new one with all tenant names. Simply adding a name to the
                        existing agreement is not legally effective.
                      </p>
                      <p className="text-gray-600">
                        <strong>Process:</strong> Surrender the old tenancy, create a new AST
                        with all tenants named, re-protect the deposit (or transfer it) and
                        provide new prescribed information.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Banknote className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Collecting Rent</h3>
                      <p className="text-gray-600 mb-3">
                        You can collect the full rent from any joint tenant. How they split it
                        between themselves is their concern, not yours. This simplifies
                        administration — one payment, one receipt.
                      </p>
                      <p className="text-gray-600">
                        <strong>Tip:</strong> Nominate one tenant as the &quot;lead tenant&quot;
                        for communication and payment purposes, but ensure all tenants are
                        named on the agreement with joint and several liability.
                      </p>
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
                        The deposit for a joint tenancy is held as one sum, not divided by
                        tenant. All joint tenants should be named on the deposit protection
                        documentation. Return disputes may involve all tenants.
                      </p>
                      <p className="text-gray-600">
                        <strong>Important:</strong> Prescribed information must be given to all
                        joint tenants within 30 days. This is required for valid Section 21
                        notices.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Evicting Joint Tenants */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Evicting Joint Tenants
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                How eviction notices work when there are multiple tenants.
              </p>

              <div className="prose prose-lg max-w-none text-gray-600">
                <h3>Section 21 Notices</h3>
                <p>
                  When serving a Section 21 notice on joint tenants, you must serve the notice
                  on all named tenants. It is good practice to send individual copies to each
                  tenant at the property address. The notice ends the tenancy for all joint
                  tenants together.
                </p>

                <h3>Section 8 Notices</h3>
                <p>
                  Section 8 notices for breaches (e.g., rent arrears) can be served on all
                  joint tenants for the full arrears amount. Remember, each joint tenant is
                  liable for the full rent due to joint and several liability.
                </p>

                <h3>Court Possession Claims</h3>
                <p>
                  Name all joint tenants in the possession claim. The possession order will
                  apply to all of them. If one tenant has already left, you still need to
                  include them in the claim (serve at the property address if their current
                  address is unknown).
                </p>
              </div>

              <div className="mt-8 grid md:grid-cols-2 gap-4">
                <Link
                  href="/section-21-notice-template"
                  className="bg-white rounded-xl p-4 border border-gray-200 hover:border-primary hover:shadow-md transition-all group"
                >
                  <h3 className="font-semibold text-gray-900 group-hover:text-primary mb-1">
                    Section 21 Notice Guide
                  </h3>
                  <p className="text-sm text-gray-600">No-fault eviction for joint tenants</p>
                </Link>

                <Link
                  href="/money-claim-unpaid-rent"
                  className="bg-white rounded-xl p-4 border border-gray-200 hover:border-primary hover:shadow-md transition-all group"
                >
                  <h3 className="font-semibold text-gray-900 group-hover:text-primary mb-1">
                    Claiming Unpaid Rent
                  </h3>
                  <p className="text-sm text-gray-600">Money claims against joint tenants</p>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* HMO Considerations */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                HMO Considerations
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                When letting to multiple tenants, be aware of HMO licensing requirements.
              </p>

              <div className="bg-amber-50 rounded-2xl p-8 border border-amber-200">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-amber-900 mb-4">
                      Do You Need an HMO License?
                    </h3>
                    <p className="text-amber-800 mb-4">
                      A property may be an HMO (House in Multiple Occupation) if it is:
                    </p>
                    <ul className="space-y-2 text-amber-800">
                      <li className="flex items-start gap-2">
                        <ArrowRight className="w-4 h-4 flex-shrink-0 mt-1" />
                        <span>
                          Occupied by 3 or more people forming 2 or more separate households
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ArrowRight className="w-4 h-4 flex-shrink-0 mt-1" />
                        <span>Sharing facilities like bathroom or kitchen</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ArrowRight className="w-4 h-4 flex-shrink-0 mt-1" />
                        <span>
                          Used as the tenants&apos; main residence
                        </span>
                      </li>
                    </ul>
                    <p className="text-amber-800 mt-4">
                      Mandatory licensing applies to HMOs with 5 or more people forming 2 or
                      more households. Many councils also have additional licensing schemes.
                    </p>
                    <div className="mt-4">
                      <Link
                        href="/tools/hmo-license-checker"
                        className="inline-flex items-center gap-2 text-amber-900 font-medium hover:underline"
                      >
                        Check if you need an HMO license
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4">Joint Tenancy vs Separate Tenancies</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Joint Tenancy</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• One agreement for all tenants</li>
                      <li>• Joint and several liability</li>
                      <li>• Tenants share the whole property</li>
                      <li>• Simpler administration</li>
                      <li>• May still be an HMO if unrelated</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Separate Tenancies</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Individual agreements per room</li>
                      <li>• Each tenant only liable for their rent</li>
                      <li>• Usually requires HMO license</li>
                      <li>• More administration</li>
                      <li>• Common in professional HMOs</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <FAQSection
          faqs={jointTenancyEnglandFAQs}
          title="Joint Tenancy Agreement FAQ"
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
                title="Create Your Joint Tenancy Agreement"
                description="Joint and several liability. All tenants named. Court-ready documentation."
              />

              <SeoDisclaimer className="max-w-4xl mx-auto" />
            </div>
          </div>
        </section>

        {/* Related Resources */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <RelatedLinks title="Related Resources" links={jointTenancyEnglandRelatedLinks} />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
