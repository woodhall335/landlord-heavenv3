import { Metadata } from 'next';
import Link from 'next/link';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { SocialProofCounter } from '@/components/ui/SocialProofCounter';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { niJointTenancyRelatedLinks } from '@/lib/seo/internal-links';
import { buildWizardLink } from '@/lib/wizard/buildWizardLink';
import { StandardHero } from '@/components/marketing/StandardHero';
import { SeoCtaBlock, SeoDisclaimer } from '@/components/seo/SeoCtaBlock';
import { SeoLandingWrapper } from '@/components/seo/SeoLandingWrapper';
import { FAQSection } from '@/components/seo/FAQSection';
import { jointTenancyNIFAQs } from '@/data/faqs';
import { PRODUCTS } from '@/lib/pricing/products';
import {
  CheckCircle,
  Clock,
  ArrowRight,
  Scale,
  FileText,
  Shield,
  AlertTriangle,
  Users,
  UserPlus,
  UserMinus,
  XCircle,
} from 'lucide-react';

// Page constants for analytics
const PAGE_PATH = '/joint-tenancy-agreement-northern-ireland';
const PAGE_TITLE = 'Joint Tenancy Agreement Northern Ireland';
const PAGE_TYPE = 'tenancy' as const;

const wizardLinkStandard = buildWizardLink({
  product: 'ast_standard',
  jurisdiction: 'northern-ireland',
  src: 'guide',
  topic: 'tenancy',
});

const wizardLinkPremium = buildWizardLink({
  product: 'ast_premium',
  jurisdiction: 'northern-ireland',
  src: 'guide',
  topic: 'tenancy',
});

export const metadata: Metadata = {
  title: 'Joint Tenancy Agreement Northern Ireland | Multiple Tenants NI',
  description:
    'Create a joint tenancy agreement for multiple tenants in Northern Ireland. Understand joint and several liability under NI law.',
  keywords: [
    'joint tenancy agreement northern ireland',
    'joint tenancy ni',
    'multiple tenants northern ireland',
    'joint and several liability ni',
    'shared tenancy ni',
    'hmo tenancy agreement ni',
    'northern ireland joint tenancy',
    'landlord multiple tenants ni',
  ],
  alternates: {
    canonical: 'https://landlordheaven.co.uk/joint-tenancy-agreement-northern-ireland',
  },
  openGraph: {
    title: 'Joint Tenancy Agreement Northern Ireland | Landlord Heaven',
    description:
      'Create a joint tenancy agreement for multiple tenants in Northern Ireland. Understand joint and several liability under NI law.',
    type: 'website',
  },
};

export default function JointTenancyAgreementNorthernIrelandPage() {
  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Joint Tenancy Agreement Northern Ireland',
    description:
      'Create a joint tenancy agreement for multiple tenants in Northern Ireland. Understand joint and several liability under NI law.',
    url: 'https://landlordheaven.co.uk/joint-tenancy-agreement-northern-ireland',
  };

  return (
    <>
      <StructuredData data={pageSchema} />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          { name: 'Tenancy Agreements', url: 'https://landlordheaven.co.uk/products/ast' },
          {
            name: 'Joint Tenancy NI',
            url: 'https://landlordheaven.co.uk/joint-tenancy-agreement-northern-ireland',
          },
        ])}
      />

      {/* Analytics: Attribution + landing_view event */}
      <SeoLandingWrapper
        pagePath={PAGE_PATH}
        pageTitle={PAGE_TITLE}
        pageType={PAGE_TYPE}
        jurisdiction="northern-ireland"
      />

      <main>
        {/* Hero Section */}
        <StandardHero
          badge="Northern Ireland Only"
          badgeIcon={<Scale className="w-4 h-4" />}
          title="Joint Tenancy Agreement Northern Ireland"
          subtitle={
            <>
              Create a <strong>joint tenancy agreement</strong> for multiple tenants in Northern
              Ireland. Include joint and several liability to protect your rental income when
              letting to couples, sharers, or groups.
            </>
          }
          primaryCTA={{
            label: `Create Joint Tenancy — ${PRODUCTS.ast_standard.displayPrice}`,
            href: wizardLinkStandard,
          }}
          secondaryCTA={{
            label: 'Premium Agreement with Guarantor',
            href: wizardLinkPremium,
          }}
          variant="pastel"
        >
          {/* Trust Signals */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600 mt-4">
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Joint & Several Liability
            </span>
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4 text-green-500" />
              Multiple Tenants
            </span>
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              Rent Protection
            </span>
          </div>
        </StandardHero>

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
                What Is a Joint Tenancy in Northern Ireland?
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Understanding how joint tenancies work when letting to multiple people.
              </p>

              <div className="prose prose-lg max-w-none text-gray-600">
                <p>
                  A <strong>joint tenancy</strong> is where two or more tenants sign the same
                  tenancy agreement and become collectively responsible for all obligations under
                  the contract. Each joint tenant has equal rights to occupy the whole property and
                  is equally liable for the full rent.
                </p>
                <p>
                  In Northern Ireland, joint tenancies are commonly used for couples, friends
                  sharing a house, or students in shared accommodation. The key advantage for
                  landlords is that with joint and several liability, you can pursue any single
                  tenant for the entire rent if others fail to pay their share.
                </p>
                <p>
                  Joint tenancies in NI are governed by the Private Tenancies (Northern Ireland)
                  Order 2006 and the Private Tenancies Act (Northern Ireland) 2022. The agreement
                  must be provided to all joint tenants within 28 days of the tenancy starting, and
                  all tenants should be named on the agreement and the deposit protection.
                </p>
                <p>Key features of a joint tenancy in NI:</p>
                <ul>
                  <li>
                    <strong>Collective responsibility:</strong> All tenants are responsible for all
                    obligations, not just their &quot;share&quot;
                  </li>
                  <li>
                    <strong>Joint and several liability:</strong> Each tenant is individually liable
                    for the full rent
                  </li>
                  <li>
                    <strong>Equal occupation rights:</strong> Each tenant can use the whole property
                  </li>
                  <li>
                    <strong>Single deposit:</strong> One deposit covering all tenants, protected in
                    all their names
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Joint and Several Liability Section */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Understanding Joint and Several Liability
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Why this clause is essential protection for landlords with multiple tenants.
              </p>

              <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Scale className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      What Is Joint and Several Liability?
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Joint and several liability means each tenant is individually responsible for
                      the entire rent, not just their portion. If the monthly rent is £1,000 and
                      there are four tenants, each tenant is liable for the full £1,000, not just
                      £250 each.
                    </p>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-green-50 rounded-lg p-4">
                        <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                          <CheckCircle className="w-5 h-5" />
                          With Joint and Several Liability
                        </h4>
                        <ul className="text-sm text-green-800 space-y-2">
                          <li>If Tenant A stops paying, pursue Tenant B for full rent</li>
                          <li>No need to split rent arrears claims between tenants</li>
                          <li>Stronger position if one tenant leaves</li>
                          <li>Can recover full amount from any tenant</li>
                        </ul>
                      </div>

                      <div className="bg-red-50 rounded-lg p-4">
                        <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                          <XCircle className="w-5 h-5" />
                          Without This Clause
                        </h4>
                        <ul className="text-sm text-red-800 space-y-2">
                          <li>May only claim each tenant&apos;s &quot;share&quot;</li>
                          <li>Must pursue each tenant separately</li>
                          <li>One tenant leaving creates income gap</li>
                          <li>Weaker position for rent recovery</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                <p className="text-blue-900 text-sm">
                  <strong>Important:</strong> Joint and several liability should be explicitly
                  stated in the tenancy agreement. Our templates include this clause as standard,
                  ensuring you have this protection when letting to multiple tenants.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* When to Use Joint Tenancy Section */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                When to Use a Joint Tenancy Agreement
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Situations where a joint tenancy is the appropriate choice.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="font-bold text-gray-900">Couples</h3>
                  </div>
                  <p className="text-gray-600 text-sm">
                    When letting to a couple (married, civil partners, or cohabiting), a joint
                    tenancy ensures both are legally responsible. If the relationship ends, both
                    remain liable for rent until the tenancy properly ends.
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="font-bold text-gray-900">Friends Sharing</h3>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Friends who want to rent a house together benefit from a joint tenancy as each
                    has equal rights. With joint and several liability, you are protected if one
                    friend cannot pay their share.
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="font-bold text-gray-900">Student Houses</h3>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Student accommodation commonly uses joint tenancies. Consider adding a guarantor
                    requirement for each student to provide additional security for rent payments.
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="font-bold text-gray-900">Family Groups</h3>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Adult siblings or extended family renting together can use a joint tenancy.
                    Each adult named on the agreement shares responsibility for rent and property
                    care.
                  </p>
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
                    HMO Licensing Considerations
                  </h2>
                  <p className="text-amber-800 mb-4">
                    If your property qualifies as a House in Multiple Occupation (HMO), you may need
                    a licence from your local council. The rules differ from England.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-amber-200">
                      <h3 className="font-semibold text-amber-900 mb-2">When HMO Licence May Apply</h3>
                      <ul className="text-sm text-amber-800 space-y-1">
                        <li>• 3+ tenants from 2+ households</li>
                        <li>• Shared facilities (kitchen, bathroom)</li>
                        <li>• Main or only residence</li>
                        <li>• Check NI HMO legislation</li>
                      </ul>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-amber-200">
                      <h3 className="font-semibold text-amber-900 mb-2">Landlord Responsibilities</h3>
                      <ul className="text-sm text-amber-800 space-y-1">
                        <li>• Apply for licence before letting</li>
                        <li>• Meet fire safety standards</li>
                        <li>• Maintain property to HMO standards</li>
                        <li>• Penalties for unlicensed HMOs</li>
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
                jurisdiction="northern-ireland"
                title="Create Your Joint Tenancy Agreement"
                description="Add all tenant names, include joint and several liability, and get a compliant agreement in minutes."
              />
            </div>
          </div>
        </section>

        {/* Adding/Removing Tenants Section */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Adding or Removing Joint Tenants
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                How to handle changes to the tenant group during the tenancy.
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <UserPlus className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="font-bold text-gray-900">Adding a New Tenant</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    To add a new person as a joint tenant, you should create a new tenancy agreement
                    with all tenants named, or have the new person sign a deed to join the existing
                    tenancy.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Reference the new tenant</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Update deposit protection</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>All parties sign new agreement</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Provide new written agreement</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                      <UserMinus className="w-5 h-5 text-amber-600" />
                    </div>
                    <h3 className="font-bold text-gray-900">Removing a Tenant</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    Removing a tenant from a joint tenancy requires ending the existing tenancy and
                    starting a new one with the remaining tenants. Simply crossing out names is not
                    legally effective.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Surrender existing tenancy (all agree)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Create new agreement with remaining tenants</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Deal with deposit (return share or transfer)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Update deposit protection records</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-8">
                <Link
                  href="/update-tenancy-agreement-northern-ireland"
                  className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
                >
                  Learn more about updating NI tenancy agreements
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* One Tenant Leaving Section */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                What If One Joint Tenant Wants to Leave?
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Managing the situation when one tenant wants to exit.
              </p>

              <div className="prose prose-lg max-w-none text-gray-600">
                <p>
                  One of the trickiest situations with joint tenancies is when one tenant wants to
                  leave while others wish to stay. The legal position can be complex, but
                  understanding your options helps manage this effectively.
                </p>

                <h3>During a Fixed Term</h3>
                <p>
                  During a fixed term, no tenant can simply leave without consequences. The
                  departing tenant remains liable for rent until the fixed term ends, unless you all
                  agree otherwise. You can negotiate an early release if a suitable replacement is
                  found and a new agreement created.
                </p>

                <h3>On a Periodic Tenancy</h3>
                <p>
                  On a periodic tenancy, one joint tenant giving notice can potentially end the
                  entire tenancy for all joint tenants. This is a complex area of law. In practice,
                  if you want to continue with the remaining tenants, negotiate a new agreement
                  rather than letting the notice take effect.
                </p>

                <h3>Practical Approach</h3>
                <p>
                  The best approach is usually to work with all parties to find a solution. Options
                  include:
                </p>
                <ul>
                  <li>Finding a replacement tenant and creating a new joint tenancy</li>
                  <li>Allowing remaining tenants to continue with a new agreement</li>
                  <li>The departing tenant paying until a replacement is found</li>
                  <li>Negotiating an early release with terms for any shortfall</li>
                </ul>
                <p>
                  With joint and several liability, the remaining tenants are responsible for the
                  full rent, giving you protection even if one person leaves.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <FAQSection
          faqs={jointTenancyNIFAQs}
          title="Joint Tenancy NI FAQ"
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
                jurisdiction="northern-ireland"
                title="Create Your Joint Tenancy Agreement Today"
                description="Joint and several liability included. Multiple tenants named. Ready in minutes."
              />

              <SeoDisclaimer className="max-w-4xl mx-auto" />
            </div>
          </div>
        </section>

        {/* Related Resources */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <RelatedLinks title="Related Resources" links={niJointTenancyRelatedLinks} />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
