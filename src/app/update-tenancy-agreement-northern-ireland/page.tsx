import { Metadata } from 'next';
import Link from 'next/link';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { SocialProofCounter } from '@/components/ui/SocialProofCounter';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { niUpdateTenancyRelatedLinks } from '@/lib/seo/internal-links';
import { buildWizardLink } from '@/lib/wizard/buildWizardLink';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { SeoCtaBlock, SeoDisclaimer } from '@/components/seo/SeoCtaBlock';
import { SeoLandingWrapper } from '@/components/seo/SeoLandingWrapper';
import { FAQSection } from '@/components/seo/FAQSection';
import { updateNITenancyFAQs } from '@/data/faqs';
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
  Edit,
  PoundSterling,
  Calendar,
} from 'lucide-react';

// Page constants for analytics
const PAGE_PATH = '/update-tenancy-agreement-northern-ireland';
const PAGE_TITLE = 'Update Tenancy Agreement Northern Ireland';
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
  title: 'Update Tenancy Agreement Northern Ireland | Renew NI Tenancy',
  description:
    'Update or renew your tenancy agreement in Northern Ireland. Understand how to change terms, increase rent, and comply with the 2022 Act.',
  keywords: [
    'update tenancy agreement northern ireland',
    'renew tenancy ni',
    'change tenancy terms ni',
    'rent increase northern ireland',
    'ni tenancy renewal',
    'vary tenancy agreement ni',
    'update tenancy ni',
    'northern ireland tenancy changes',
  ],
  alternates: {
    canonical: 'https://landlordheaven.co.uk/update-tenancy-agreement-northern-ireland',
  },
  openGraph: {
    title: 'Update Tenancy Agreement Northern Ireland | Landlord Heaven',
    description:
      'Update or renew your tenancy agreement in Northern Ireland. Understand how to change terms and increase rent.',
    type: 'website',
  },
};

export default function UpdateTenancyAgreementNorthernIrelandPage() {
  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Update Tenancy Agreement Northern Ireland',
    description:
      'Update or renew your tenancy agreement in Northern Ireland. Understand how to change terms, increase rent, and comply with the 2022 Act.',
    url: 'https://landlordheaven.co.uk/update-tenancy-agreement-northern-ireland',
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
            name: 'Update Tenancy NI',
            url: 'https://landlordheaven.co.uk/update-tenancy-agreement-northern-ireland',
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
        <UniversalHero
          badge="Northern Ireland Only"
          badgeIcon={<Scale className="w-4 h-4" />}
          title="Update Tenancy Agreement Northern Ireland"
          subtitle={
            <>
              Need to <strong>update, renew, or change</strong> your Northern Ireland tenancy
              agreement? Understand how to modify terms, increase rent, or create a new agreement
              while complying with the 2022 Act.
            </>
          }
          primaryCta={{
            label: `Create New Agreement — ${PRODUCTS.ast_standard.displayPrice}`,
            href: wizardLinkStandard,
          }}
          secondaryCta={{
            label: 'Premium Agreement with Extras',
            href: wizardLinkPremium,
          }}
          variant="pastel"
        >
          {/* Trust Signals */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600 mt-4">
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              2022 Act Compliant
            </span>
            <span className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-green-500" />
              Update Existing Tenancy
            </span>
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              Legal Protection
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
                When Should You Update Your NI Tenancy Agreement?
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Common situations that require updating or renewing your tenancy documentation.
              </p>

              <div className="prose prose-lg max-w-none text-gray-600">
                <p>
                  There are several situations where you may need to update your tenancy agreement in
                  Northern Ireland. Understanding when and how to make changes ensures you remain
                  compliant with the Private Tenancies Act (Northern Ireland) 2022 and maintain
                  proper documentation.
                </p>
                <p>
                  Under the 2022 Act, any changes to the written tenancy agreement must be provided
                  to the tenant in writing. This means you cannot simply make verbal agreements about
                  changed terms and expect them to be enforceable. Proper documentation is essential.
                </p>
                <p>Common reasons to update your NI tenancy agreement include:</p>
                <ul>
                  <li>
                    <strong>Fixed term ending:</strong> Deciding whether to renew for another fixed
                    term or allow it to become periodic
                  </li>
                  <li>
                    <strong>Rent increase:</strong> Changing the rent amount with proper notice
                  </li>
                  <li>
                    <strong>Adding or removing tenants:</strong> Changes to who is named on the
                    agreement
                  </li>
                  <li>
                    <strong>Changing terms:</strong> Updating clauses about pets, decorating, or
                    other conditions
                  </li>
                  <li>
                    <strong>Outdated agreement:</strong> Your original agreement may not comply with
                    the 2022 Act
                  </li>
                  <li>
                    <strong>Missing information:</strong> The original agreement lacks required
                    statutory information
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Options Section */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Options for Updating Your Tenancy
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Different approaches depending on what you need to change.
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Edit className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-bold text-gray-900">Variation Agreement</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    For minor changes to an existing tenancy, a variation agreement documents the
                    specific terms being changed while keeping the original agreement in place.
                  </p>
                  <p className="text-sm font-medium text-gray-900 mb-2">Best for:</p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Single term changes (e.g., pet permission)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Updating landlord/agent contact details</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Minor procedural changes</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white rounded-2xl p-6 border-2 border-primary shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-bold text-gray-900">New Agreement</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    For significant changes or renewal, creating a completely new agreement is
                    cleaner and ensures full compliance with current legislation.
                  </p>
                  <p className="text-sm font-medium text-gray-900 mb-2">Best for:</p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Multiple term changes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>New fixed term after periodic</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Adding or removing tenants</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Old agreement not 2022 Act compliant</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                <p className="text-blue-900 text-sm">
                  <strong>Recommendation:</strong> If your current agreement was created before the
                  Private Tenancies Act 2022 came into force, we recommend creating a new agreement
                  to ensure full compliance with current NI legislation.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Rent Increase Section */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Increasing Rent in Northern Ireland
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                How to properly increase rent during a NI tenancy.
              </p>

              <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <PoundSterling className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Rent Increase Process</h3>
                    <p className="text-gray-600 mb-6">
                      In Northern Ireland, rent increases must follow proper procedures. You cannot
                      simply increase rent without the tenant&apos;s agreement or proper notice.
                    </p>

                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">During a Fixed Term</h4>
                        <p className="text-gray-600 text-sm">
                          Rent is generally fixed for the duration of the fixed term unless your
                          agreement includes a rent review clause allowing increases. Without such a
                          clause, you cannot increase rent until the fixed term ends.
                        </p>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">On a Periodic Tenancy</h4>
                        <p className="text-gray-600 text-sm">
                          On a periodic tenancy, you can increase rent by agreement with the tenant or
                          by following the notice procedure in your tenancy agreement. The increase
                          must be reasonable, and the tenant may have rights to challenge excessive
                          increases.
                        </p>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Notice Requirements</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>Give written notice of the increase</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>Follow any notice period in your agreement</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>State the new rent amount and start date</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>Keep a copy for your records</span>
                          </li>
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
                    Important: 2022 Act Compliance
                  </h2>
                  <p className="text-amber-800 mb-4">
                    Under the Private Tenancies Act (NI) 2022, any changes to the tenancy agreement
                    must be provided to the tenant in writing.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-amber-200">
                      <h3 className="font-semibold text-amber-900 mb-2">When Making Changes</h3>
                      <ul className="text-sm text-amber-800 space-y-1">
                        <li>• Document all changes in writing</li>
                        <li>• Both parties should sign changes</li>
                        <li>• Provide tenant with updated copy</li>
                        <li>• Keep records for your files</li>
                      </ul>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-amber-200">
                      <h3 className="font-semibold text-amber-900 mb-2">Avoid These Mistakes</h3>
                      <ul className="text-sm text-amber-800 space-y-1">
                        <li>• Verbal agreements only</li>
                        <li>• Crossing out and writing over terms</li>
                        <li>• Failing to provide updated agreement</li>
                        <li>• Unilateral changes without consent</li>
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
                title="Create an Updated NI Tenancy Agreement"
                description="The cleanest way to update terms is a new agreement. 2022 Act compliant and ready in minutes."
              />
            </div>
          </div>
        </section>

        {/* Renewal Process Section */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Renewing Your NI Tenancy Agreement
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Options when the fixed term ends and your tenant wants to stay.
              </p>

              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Option 1: New Fixed Term</h3>
                      <p className="text-gray-600 mb-3">
                        Create a new tenancy agreement for another fixed period (e.g., 12 months).
                        This is ideal if you want income certainty and the opportunity to update
                        terms, particularly rent.
                      </p>
                      <ul className="grid md:grid-cols-2 gap-2 text-sm text-gray-600">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Guaranteed rental income
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Opportunity to update rent
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Fresh 2022 Act compliant agreement
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Update any terms as needed
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <RefreshCw className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Option 2: Let It Become Periodic</h3>
                      <p className="text-gray-600 mb-3">
                        Allow the tenancy to roll on as a periodic tenancy on the existing terms.
                        This requires no action but means terms stay the same until you negotiate
                        changes.
                      </p>
                      <ul className="grid md:grid-cols-2 gap-2 text-sm text-gray-600">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          No paperwork required
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Flexibility to end with notice
                        </li>
                        <li className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-amber-500" />
                          Rent stays at current level
                        </li>
                        <li className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-amber-500" />
                          Terms remain unchanged
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <Link
                  href="/tenancy-agreement-northern-ireland"
                  className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
                >
                  Learn more about NI tenancy agreements
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Checklist Section */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Checklist: Updating Your NI Tenancy Agreement
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Steps to ensure your updated agreement is valid and compliant.
              </p>

              <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Review Current Agreement</h4>
                      <p className="text-gray-600 text-sm">
                        Check what terms need updating and whether the current agreement is 2022 Act
                        compliant.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Discuss Changes with Tenant</h4>
                      <p className="text-gray-600 text-sm">
                        Agree any changes before creating new documentation. You cannot force
                        changes without consent.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Create New Agreement or Variation</h4>
                      <p className="text-gray-600 text-sm">
                        Generate a new tenancy agreement with updated terms, or a variation document
                        for minor changes.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                      4
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Sign and Date</h4>
                      <p className="text-gray-600 text-sm">
                        Both landlord and tenant(s) sign the new or updated agreement. Each party
                        keeps a copy.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                      5
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Check Deposit Protection</h4>
                      <p className="text-gray-600 text-sm">
                        Verify deposit protection is still valid. Update if tenant names change or
                        a new tenancy is created.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                      6
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Keep Records</h4>
                      <p className="text-gray-600 text-sm">
                        File the new agreement with your tenancy records. Note the date changes were
                        agreed and implemented.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <FAQSection
          faqs={updateNITenancyFAQs}
          title="Update NI Tenancy FAQ"
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
                title="Create Your Updated NI Agreement Today"
                description="Fresh 2022 Act compliant agreement. Updated terms. Ready in minutes."
              />

              <SeoDisclaimer className="max-w-4xl mx-auto" />
            </div>
          </div>
        </section>

        {/* Related Resources */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <RelatedLinks title="Related Resources" links={niUpdateTenancyRelatedLinks} />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
