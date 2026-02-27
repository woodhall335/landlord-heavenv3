import { Metadata } from 'next';
import Link from 'next/link';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { SocialProofCounter } from '@/components/ui/SocialProofCounter';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { jointPrtRelatedLinks } from '@/lib/seo/internal-links';
import { buildWizardLink } from '@/lib/wizard/buildWizardLink';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { SeoCtaBlock, SeoDisclaimer } from '@/components/seo/SeoCtaBlock';
import { SeoLandingWrapper } from '@/components/seo/SeoLandingWrapper';
import { FAQSection } from '@/components/seo/FAQSection';
import { jointPrtFAQs } from '@/data/faqs';
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
  XCircle,
  UserPlus,
  UserMinus,
} from 'lucide-react';

// Page constants for analytics
const PAGE_PATH = '/joint-prt-tenancy-agreement-scotland';
const PAGE_TITLE = 'Joint PRT Tenancy Agreement Scotland';
const PAGE_TYPE = 'tenancy' as const;

const wizardLinkStandard = buildWizardLink({
  product: 'ast_standard',
  jurisdiction: 'scotland',
  src: 'seo_joint-prt-tenancy-agreement-scotland',
  topic: 'tenancy',
});

const wizardLinkPremium = buildWizardLink({
  product: 'ast_premium',
  jurisdiction: 'scotland',
  src: 'seo_joint-prt-tenancy-agreement-scotland',
  topic: 'tenancy',
});

export const metadata: Metadata = {
  title: 'Joint PRT Tenancy Agreement Scotland | Multiple Tenants PRT 2026',
  description:
    'Create a joint PRT agreement for multiple tenants in Scotland. Joint and several liability and shared responsibilities explained.',
  keywords: [
    'joint prt tenancy agreement',
    'multiple tenants prt',
    'joint tenancy scotland',
    'shared house tenancy agreement scotland',
    'joint and several liability scotland',
    'prt multiple tenants',
    'hmo tenancy agreement scotland',
    'flatmates tenancy scotland',
  ],
  alternates: {
    canonical: 'https://landlordheaven.co.uk/joint-prt-tenancy-agreement-scotland',
  },
  openGraph: {
    title: 'Joint PRT Tenancy Agreement Scotland | Landlord Heaven',
    description:
      'Create a legally valid joint PRT for multiple tenants in Scotland. Includes joint and several liability protection.',
    type: 'website',
    url: 'https://landlordheaven.co.uk/joint-prt-tenancy-agreement-scotland',
  },
};

export default function JointPrtTenancyAgreementScotlandPage() {
  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Joint PRT Tenancy Agreement Scotland',
    description:
      'Create a joint Private Residential Tenancy agreement for multiple tenants in Scotland. Compliant with the Private Housing (Tenancies) (Scotland) Act 2016.',
    url: 'https://landlordheaven.co.uk/joint-prt-tenancy-agreement-scotland',
  };

  return (
    <>
      <StructuredData data={pageSchema} />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          { name: 'Tenancy Agreements', url: 'https://landlordheaven.co.uk/products/ast' },
          {
            name: 'Joint PRT Scotland',
            url: 'https://landlordheaven.co.uk/joint-prt-tenancy-agreement-scotland',
          },
        ])}
      />

      {/* Analytics: Attribution + landing_view event */}
      <SeoLandingWrapper
        pagePath={PAGE_PATH}
        pageTitle={PAGE_TITLE}
        pageType={PAGE_TYPE}
        jurisdiction="scotland"
      />

      <HeaderConfig mode="autoOnScroll" />

      <main>
        {/* Hero Section */}
        <UniversalHero
          badge="Scotland Only"
          badgeIcon={<Scale className="w-4 h-4" />}
          title="Joint PRT Tenancy Agreement"
          subtitle={
            <>
              Create a <strong>legally valid</strong> joint PRT for multiple tenants in Scotland.
              Includes joint and several liability protection for full rent recovery.
            </>
          }
          primaryCta={{
            label: `Create Joint PRT — ${PRODUCTS.ast_standard.displayPrice}`,
            href: wizardLinkStandard,
          }}
          secondaryCta={{
            label: 'Premium Agreement with Extras',
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
              Tribunal-Ready
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

        {/* What is a Joint PRT Section */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                What Is a Joint PRT Tenancy Agreement?
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Understanding how multiple tenants share responsibility under Scottish tenancy law.
              </p>

              <div className="prose prose-lg max-w-none text-gray-600">
                <p>
                  A <strong>joint PRT tenancy agreement</strong> is a Private Residential Tenancy
                  where two or more tenants sign the same agreement and become collectively
                  responsible for all obligations. Under a joint tenancy in Scotland, all tenants
                  have equal rights to occupy the entire property and are jointly liable for the
                  full rent — not just their individual share.
                </p>
                <p>
                  This is distinct from having separate individual tenancies with each person,
                  which would be typical in a licensed HMO with room-by-room letting. In a joint
                  tenancy, the tenants as a group hold the tenancy together, which creates
                  significant implications for rent collection, ending the tenancy, and pursuing
                  debts if things go wrong.
                </p>
                <p>
                  Joint tenancies work well for couples, friends renting together, or family
                  members who know each other and are willing to share responsibility. They are
                  less suitable for unrelated sharers who do not know each other, where individual
                  tenancies may provide clearer boundaries.
                </p>
                <p>
                  Under the Private Housing (Tenancies) (Scotland) Act 2016, joint tenants have
                  certain protections. Most importantly, one tenant leaving does not automatically
                  end the PRT for the remaining tenants — the tenancy continues with those who
                  remain. This is different from some English joint tenancy situations where one
                  tenant&apos;s notice can end the whole tenancy.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Joint and Several Liability */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Joint and Several Liability Explained
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                The most important protection for landlords with multiple tenants.
              </p>

              <div className="bg-white rounded-2xl p-8 border border-gray-200">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      What Joint and Several Liability Means
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Joint and several liability means each tenant is individually responsible for
                      the <strong>entire</strong> rent, not just their portion. If three tenants
                      each pay £400 towards £1,200 rent and one stops paying, you can pursue any
                      or all of the remaining tenants for the full £1,200 — not just the £800 they
                      were personally paying.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4 mt-6">
                      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                        <h4 className="font-semibold text-green-900 mb-2">Benefits for Landlords</h4>
                        <ul className="text-sm text-green-800 space-y-1">
                          <li>* Pursue any tenant for full rent arrears</li>
                          <li>* Not dependent on all tenants paying</li>
                          <li>* Stronger position at First-tier Tribunal</li>
                          <li>* Easier to recover unpaid rent</li>
                        </ul>
                      </div>
                      <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                        <h4 className="font-semibold text-amber-900 mb-2">Important to Include</h4>
                        <ul className="text-sm text-amber-800 space-y-1">
                          <li>* Must be explicitly stated in agreement</li>
                          <li>* Courts may imply it, but clarity is better</li>
                          <li>* Tenants should understand before signing</li>
                          <li>* Applies to all obligations, not just rent</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
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
                    Joint Tenancy vs Individual Tenancies
                  </h2>
                  <p className="text-amber-800 mb-4">
                    Choose the right structure for your property and tenants. Joint tenancies work
                    differently from individual tenancies, with different implications for everyone.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-amber-200">
                      <h3 className="font-semibold text-amber-900 mb-2">
                        When to Use Joint Tenancy
                      </h3>
                      <ul className="text-sm text-amber-800 space-y-1">
                        <li>* Couples or married partners</li>
                        <li>* Friends renting together</li>
                        <li>* Family members sharing</li>
                        <li>* Tenants who know each other well</li>
                      </ul>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-amber-200">
                      <h3 className="font-semibold text-amber-900 mb-2">
                        When Individual May Be Better
                      </h3>
                      <ul className="text-sm text-amber-800 space-y-1">
                        <li>* HMO with unrelated sharers</li>
                        <li>* Room-by-room letting</li>
                        <li>* High tenant turnover expected</li>
                        <li>* Tenants who do not know each other</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Adding and Removing Tenants */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Adding and Removing Joint Tenants
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                How to manage changes in your joint PRT when tenants come and go.
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <UserPlus className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="font-bold text-gray-900">Adding a New Tenant</h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    To add a new tenant to an existing joint PRT, you have two options:
                  </p>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                      <span>
                        <strong>New PRT:</strong> End the current tenancy and create a new PRT with
                        all tenants named
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                      <span>
                        <strong>Variation:</strong> Have the new tenant sign an agreement to join
                        the existing tenancy
                      </span>
                    </li>
                  </ul>
                  <p className="text-gray-600 mt-4 text-sm">
                    Update the deposit protection to include the new tenant&apos;s name. The new
                    tenant becomes jointly liable from the date they join.
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <UserMinus className="w-5 h-5 text-red-600" />
                    </div>
                    <h3 className="font-bold text-gray-900">When a Tenant Leaves</h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Under Scottish PRT rules, one tenant leaving does not automatically end the
                    tenancy for others:
                  </p>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                      <span>
                        The PRT continues with the remaining tenants on the same terms
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                      <span>
                        Document the departing tenant&apos;s exit in writing
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                      <span>
                        The leaving tenant may remain liable for arrears up to their departure
                      </span>
                    </li>
                  </ul>
                  <p className="text-gray-600 mt-4 text-sm">
                    Consider creating a new PRT with just the remaining tenants for clarity going
                    forward.
                  </p>
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
                jurisdiction="scotland"
                title="Create Your Joint PRT Agreement Now"
                description="Includes joint and several liability. All mandatory terms. Ready for multiple tenants."
              />
            </div>
          </div>
        </section>

        {/* Key Considerations for Joint PRTs */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Key Considerations for Joint PRTs
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Important factors to consider when creating a joint tenancy in Scotland.
              </p>

              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">All Tenants Must Sign</h3>
                      <p className="text-gray-600">
                        Every person who will be a joint tenant must sign the PRT agreement. This
                        creates the legal relationship and makes them bound by the terms. Occupiers
                        who do not sign are not tenants and have no rights under the tenancy — but
                        also no obligations.
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
                      <p className="text-gray-600">
                        When protecting the deposit for a joint tenancy, all tenant names should
                        be recorded with the deposit protection scheme. The deposit is held for
                        all tenants jointly. At the end of the tenancy, any deductions require
                        agreement from all tenants or adjudication by the scheme.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Gavel className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Eviction and Tribunal</h3>
                      <p className="text-gray-600">
                        To evict joint tenants, you must serve Notice to Leave on all of them.
                        Your application to the First-tier Tribunal must name all joint tenants
                        as respondents. If one tenant has left but is still named on the agreement,
                        they should still be included in proceedings.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">HMO Licensing</h3>
                      <p className="text-gray-600">
                        If your property has three or more tenants from two or more households,
                        it may need an HMO licence from the local council. This applies regardless
                        of whether you use a joint tenancy or individual tenancies. Check HMO
                        requirements in your local area — penalties for unlicensed HMOs are
                        significant.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Disputes Between Joint Tenants */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                When Joint Tenants Disagree
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                How to handle situations where joint tenants have conflicts or one wants to leave.
              </p>

              <div className="bg-white rounded-2xl p-8 border border-gray-200">
                <p className="text-gray-600 mb-6">
                  Disputes between joint tenants are their matter to resolve — you are not required
                  to mediate. However, these disputes can affect you if they result in rent not
                  being paid or requests to change the tenancy. Here is how to handle common
                  situations:
                </p>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-gray-900">One tenant wants to leave:</strong>
                      <span className="text-gray-600">
                        {' '}
                        Document their departure. The remaining tenants continue the PRT. Consider
                        whether to seek a replacement or create a new agreement.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-gray-900">Tenants disagree about paying rent:</strong>
                      <span className="text-gray-600">
                        {' '}
                        This is their problem. With joint and several liability, you can pursue any
                        tenant for the full amount owed. Their internal arrangement is not your
                        concern.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-gray-900">All tenants want to leave:</strong>
                      <span className="text-gray-600">
                        {' '}
                        They can give joint notice to end the PRT. In Scotland, tenants must give
                        at least 28 days written notice. All tenants should sign the notice.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-gray-900">Relationship breakdown:</strong>
                      <span className="text-gray-600">
                        {' '}
                        If tenants are separating, work with them to agree a solution. This might
                        involve one tenant leaving and the other continuing, or ending the tenancy
                        entirely.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What Our Joint PRT Includes */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                What Our Joint PRT Template Includes
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Everything you need for a watertight joint tenancy agreement.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-bold text-gray-900">Joint Tenancy Specifics</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      Clear joint and several liability clause
                    </li>
                    <li className="flex items-center gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      Space for multiple tenant names
                    </li>
                    <li className="flex items-center gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      Provisions for tenant changes
                    </li>
                    <li className="flex items-center gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      Notice requirements explained
                    </li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-gray-900">All Standard PRT Terms</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      2016 Act mandatory terms
                    </li>
                    <li className="flex items-center gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      Deposit protection provisions
                    </li>
                    <li className="flex items-center gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      Rent increase procedures
                    </li>
                    <li className="flex items-center gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      Notice to Leave grounds reference
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-8">
                <Link
                  href="/private-residential-tenancy-agreement-scotland"
                  className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
                >
                  Learn more about Private Residential Tenancies
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <FAQSection
          faqs={jointPrtFAQs}
          title="Joint PRT Tenancy Agreement FAQ"
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
                jurisdiction="scotland"
                title="Create Your Joint PRT Agreement Today"
                description="Joint and several liability included. Tribunal-ready. Compliant with the 2016 Act. Ready in minutes."
              />

              <SeoDisclaimer className="max-w-4xl mx-auto" />
            </div>
          </div>
        </section>

        {/* Related Resources */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <RelatedLinks title="Related Resources" links={jointPrtRelatedLinks} />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
