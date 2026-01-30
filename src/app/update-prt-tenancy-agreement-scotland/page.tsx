import { Metadata } from 'next';
import Link from 'next/link';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { SocialProofCounter } from '@/components/ui/SocialProofCounter';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { updatePrtRelatedLinks } from '@/lib/seo/internal-links';
import { buildWizardLink } from '@/lib/wizard/buildWizardLink';
import { StandardHero } from '@/components/marketing/StandardHero';
import { SeoCtaBlock, SeoDisclaimer } from '@/components/seo/SeoCtaBlock';
import { SeoLandingWrapper } from '@/components/seo/SeoLandingWrapper';
import { FAQSection } from '@/components/seo/FAQSection';
import { updatePrtFAQs } from '@/data/faqs';
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
  RefreshCw,
  Edit,
  PoundSterling,
} from 'lucide-react';

// Page constants for analytics
const PAGE_PATH = '/update-prt-tenancy-agreement-scotland';
const PAGE_TITLE = 'Update PRT Tenancy Agreement Scotland';
const PAGE_TYPE = 'tenancy' as const;

const wizardLinkStandard = buildWizardLink({
  product: 'ast_standard',
  jurisdiction: 'scotland',
  src: 'guide',
  topic: 'tenancy',
});

const wizardLinkPremium = buildWizardLink({
  product: 'ast_premium',
  jurisdiction: 'scotland',
  src: 'guide',
  topic: 'tenancy',
});

export const metadata: Metadata = {
  title: 'Update PRT Tenancy Agreement Scotland | Change Tenants, Rent & Terms 2026',
  description:
    'Learn how to update a PRT tenancy agreement in Scotland. Change rent, add or remove tenants, and vary terms legally under the 2016 Act.',
  keywords: [
    'update prt tenancy agreement',
    'change tenants prt',
    'prt rent increase scotland',
    'vary prt terms',
    'add tenant to prt',
    'remove tenant prt scotland',
    'change prt agreement',
    'scottish tenancy changes',
  ],
  alternates: {
    canonical: 'https://landlordheaven.co.uk/update-prt-tenancy-agreement-scotland',
  },
  openGraph: {
    title: 'Update PRT Tenancy Agreement Scotland | Landlord Heaven',
    description:
      'How to update your PRT agreement in Scotland. Rent increases, tenant changes, and term variations explained.',
    type: 'website',
  },
};

export default function UpdatePrtTenancyAgreementScotlandPage() {
  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Update PRT Tenancy Agreement Scotland',
    description:
      'Learn how to update a Private Residential Tenancy agreement in Scotland. Change rent, tenants, and terms legally.',
    url: 'https://landlordheaven.co.uk/update-prt-tenancy-agreement-scotland',
  };

  return (
    <>
      <StructuredData data={pageSchema} />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          { name: 'Tenancy Agreements', url: 'https://landlordheaven.co.uk/products/ast' },
          {
            name: 'Update PRT Scotland',
            url: 'https://landlordheaven.co.uk/update-prt-tenancy-agreement-scotland',
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

      <main>
        {/* Hero Section */}
        <StandardHero
          badge="Scotland Only"
          badgeIcon={<Scale className="w-4 h-4" />}
          title="Update Your PRT Tenancy Agreement"
          subtitle={
            <>
              Learn how to <strong>legally update</strong> your Private Residential Tenancy in
              Scotland. Rent increases, tenant changes, and term variations explained step by step.
            </>
          }
          primaryCTA={{
            label: `Create New PRT — ${PRODUCTS.ast_standard.displayPrice}`,
            href: wizardLinkStandard,
          }}
          secondaryCTA={{
            label: 'Premium Agreement with Extras',
            href: wizardLinkPremium,
          }}
          variant="pastel"
        >
          {/* Trust Signals */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600 mt-4">
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              2016 Act Compliant
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
        </StandardHero>

        {/* Social Proof */}
        <section className="py-6 bg-gray-50 border-y border-gray-100">
          <div className="container mx-auto px-4">
            <SocialProofCounter variant="total" className="justify-center" />
          </div>
        </section>

        {/* Understanding PRT Updates Section */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Understanding PRT Updates and Changes
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                A PRT continues indefinitely — here is how to make changes during the tenancy.
              </p>

              <div className="prose prose-lg max-w-none text-gray-600">
                <p>
                  Unlike English ASTs which have fixed terms and periodic renewals, a Scottish
                  <strong> Private Residential Tenancy continues indefinitely</strong> until
                  properly ended by either party. This open-ended nature means you cannot simply
                  wait for a renewal date to update terms — changes must be made during the ongoing
                  tenancy.
                </p>
                <p>
                  The Private Housing (Tenancies) (Scotland) Act 2016 sets out specific procedures
                  for certain changes, particularly rent increases. Other changes require tenant
                  agreement and should be documented properly. Understanding when you can make
                  changes unilaterally versus when you need consent is crucial for staying compliant.
                </p>
                <p>
                  The most common reasons landlords need to update a PRT include: increasing rent
                  to reflect market rates, adding or removing tenants when household composition
                  changes, updating terms that no longer work for the property, and correcting
                  errors or omissions in the original agreement.
                </p>
                <p>
                  Depending on the nature of the change, you might use the statutory rent increase
                  procedure, negotiate a variation agreement with the tenant, or create an entirely
                  new PRT. The right approach depends on what you are trying to change and whether
                  the tenant agrees.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Rent Increases Section */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                How to Increase Rent Under a PRT
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                The statutory procedure for rent increases in Scotland.
              </p>

              <div className="bg-white rounded-2xl p-8 border border-gray-200 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <PoundSterling className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      Statutory Rent Increase Procedure
                    </h3>
                    <p className="text-gray-600 mb-4">
                      The 2016 Act sets strict rules for how and when you can increase rent:
                    </p>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          1
                        </div>
                        <div>
                          <strong className="text-gray-900">Frequency limit:</strong>
                          <span className="text-gray-600">
                            {' '}
                            You can only increase rent once every 12 months. The 12-month period
                            runs from either the tenancy start date or the last rent increase.
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          2
                        </div>
                        <div>
                          <strong className="text-gray-900">Notice period:</strong>
                          <span className="text-gray-600">
                            {' '}
                            You must give at least 3 months written notice of the rent increase
                            using the prescribed form. The notice must state the new rent amount
                            and when it takes effect.
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          3
                        </div>
                        <div>
                          <strong className="text-gray-900">Tenant&apos;s rights:</strong>
                          <span className="text-gray-600">
                            {' '}
                            The tenant can refer the increase to a Rent Officer within 21 days if
                            they believe it is above market rent. The Rent Officer can determine a
                            different figure.
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          4
                        </div>
                        <div>
                          <strong className="text-gray-900">Rent Pressure Zones:</strong>
                          <span className="text-gray-600">
                            {' '}
                            If the property is in a designated Rent Pressure Zone, increases are
                            capped at CPI + 1% per year. Check with your local council.
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-amber-900 mb-2">
                      Alternative: Agreed Rent Change
                    </h4>
                    <p className="text-amber-800">
                      If the tenant agrees to a different rent amount, you can vary the tenancy by
                      mutual agreement at any time. Document this in writing signed by both parties.
                      This avoids the formal notice procedure but requires tenant consent.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Changing Tenants Section */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Changing Tenants During a PRT
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                How to add new tenants, remove departing tenants, or replace occupiers.
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="font-bold text-gray-900">Adding a Tenant</h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    To add a new tenant to an existing PRT:
                  </p>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                      <span>
                        All existing tenants and the new tenant sign a variation agreement
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                      <span>
                        Or end the current PRT and create a new one with all tenants named
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                      <span>
                        Update deposit protection records with the new tenant&apos;s details
                      </span>
                    </li>
                  </ul>
                  <p className="text-gray-600 mt-4 text-sm">
                    Reference all existing tenants for the new person before adding them.
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                      <Edit className="w-5 h-5 text-amber-600" />
                    </div>
                    <h3 className="font-bold text-gray-900">Removing a Tenant</h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    When a tenant needs to leave:
                  </p>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                      <span>
                        In Scotland, the PRT continues for remaining tenants automatically
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                      <span>
                        Document the departing tenant&apos;s exit date in writing
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                      <span>
                        Consider a new PRT with only the remaining tenants for clarity
                      </span>
                    </li>
                  </ul>
                  <p className="text-gray-600 mt-4 text-sm">
                    The departing tenant may remain liable for arrears incurred before leaving.
                  </p>
                </div>
              </div>

              <div className="mt-8 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <RefreshCw className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-bold text-gray-900">Full Tenant Replacement</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  If all tenants are being replaced (e.g., a complete household change), the
                  cleanest approach is to:
                </p>
                <div className="grid md:grid-cols-3 gap-4 text-gray-600">
                  <div className="flex items-start gap-2">
                    <span className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      1
                    </span>
                    <span>End the current PRT with proper notice from all existing tenants</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      2
                    </span>
                    <span>Conduct checkout and settle any deposit deductions</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      3
                    </span>
                    <span>Create a completely new PRT with the new tenants</span>
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
                jurisdiction="scotland"
                title="Need a New PRT Agreement?"
                description="If your changes are significant, creating a new PRT may be simpler than multiple variations. Ready in minutes."
              />
            </div>
          </div>
        </section>

        {/* Varying Other Terms Section */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Varying Other Terms in a PRT
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                How to change non-rent terms like pets, subletting, or property rules.
              </p>

              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Tenant Agreement Required</h3>
                      <p className="text-gray-600">
                        Unlike rent (which has a statutory increase mechanism), other terms can
                        only be changed with the tenant&apos;s consent. You cannot unilaterally
                        add new obligations or restrictions during the tenancy. If the tenant
                        does not agree, the original terms continue to apply.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Edit className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Using a Variation Agreement</h3>
                      <p className="text-gray-600">
                        When you and the tenant agree to changes, document them in a written
                        variation agreement. This should clearly state: what terms are being
                        changed, the old wording, the new wording, the date the change takes
                        effect, and signatures from all parties. Both landlord and tenant(s)
                        should keep signed copies.
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
                      <h3 className="font-bold text-gray-900 mb-2">What Cannot Be Changed</h3>
                      <p className="text-gray-600">
                        The mandatory statutory terms from the 2016 Act cannot be removed or
                        weakened by agreement. These terms apply automatically regardless of what
                        your written agreement says. You cannot, for example, agree to remove the
                        tenant&apos;s right to 28 days notice when leaving, or extend the deposit
                        protection deadline beyond 30 working days.
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
                      <h3 className="font-bold text-gray-900 mb-2">
                        When to Create a New PRT Instead
                      </h3>
                      <p className="text-gray-600">
                        If you are making multiple changes or major alterations, it may be
                        cleaner to end the current PRT and create a new one. This is especially
                        true when changing tenants, significantly restructuring terms, or when
                        the original agreement has become unclear through multiple amendments.
                        A fresh PRT provides a clear baseline going forward.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Deposit Considerations Section */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Deposit Protection When Updating a PRT
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                What happens to the deposit when you make changes to the tenancy.
              </p>

              <div className="bg-white rounded-2xl p-8 border border-gray-200">
                <div className="space-y-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-gray-900">Rent increases:</strong>
                      <span className="text-gray-600">
                        {' '}
                        No change to deposit protection required. The deposit amount stays the same
                        unless you separately agree to change it.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-gray-900">Adding a tenant:</strong>
                      <span className="text-gray-600">
                        {' '}
                        Update the deposit protection records to include the new tenant&apos;s
                        name. The scheme should be informed of the change. The new tenant has
                        rights over the deposit like existing tenants.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-gray-900">Removing a tenant:</strong>
                      <span className="text-gray-600">
                        {' '}
                        If a tenant leaves mid-tenancy, the deposit situation can become complex.
                        Ideally, the departing tenant, remaining tenants, and landlord should
                        agree in writing how their share of the deposit is handled.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-gray-900">Creating a new PRT:</strong>
                      <span className="text-gray-600">
                        {' '}
                        If you end the old tenancy and start fresh, the deposit from the old
                        tenancy should be dealt with properly (returned or transferred by agreement)
                        and the new deposit protected within 30 working days of the new tenancy
                        starting.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-gray-900">Increasing deposit amount:</strong>
                      <span className="text-gray-600">
                        {' '}
                        If you want to increase the deposit (e.g., after a significant rent
                        increase), this requires tenant agreement and the additional amount must
                        be protected within 30 working days of receipt. The maximum deposit is
                        two months rent.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Common Update Scenarios */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Common PRT Update Scenarios
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Practical guidance for frequent situations landlords face.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-3">Tenant Gets a Pet</h3>
                  <p className="text-gray-600 text-sm mb-3">
                    If your agreement prohibits pets but the tenant asks permission:
                  </p>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>* Consider the request fairly</li>
                    <li>* If agreeing, document it in a variation</li>
                    <li>* You may add conditions (pet type, size, cleaning)</li>
                    <li>* Cannot unreasonably refuse in some circumstances</li>
                  </ul>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-3">Partner Moves In</h3>
                  <p className="text-gray-600 text-sm mb-3">
                    When a tenant&apos;s partner wants to move in:
                  </p>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>* They can be added as a joint tenant</li>
                    <li>* Or remain as a permitted occupier (not a tenant)</li>
                    <li>* Joint tenant status gives them rights and obligations</li>
                    <li>* Update agreement and deposit records accordingly</li>
                  </ul>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-3">Annual Rent Review</h3>
                  <p className="text-gray-600 text-sm mb-3">
                    To increase rent on the tenancy anniversary:
                  </p>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>* Serve notice 3 months before the increase date</li>
                    <li>* Use the prescribed rent increase notice form</li>
                    <li>* Check for Rent Pressure Zone restrictions</li>
                    <li>* Tenant can refer to Rent Officer within 21 days</li>
                  </ul>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-3">Tenant Wants to Sublet</h3>
                  <p className="text-gray-600 text-sm mb-3">
                    If a tenant asks to sublet or assign:
                  </p>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>* Check if your agreement permits this</li>
                    <li>* Subletting creates additional complexity</li>
                    <li>* You may want to refuse or offer alternatives</li>
                    <li>* Consider creating a new PRT with the new occupier</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <FAQSection
          faqs={updatePrtFAQs}
          title="Updating PRT Agreement FAQ"
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
                title="Need a Fresh PRT Agreement?"
                description="Major changes often call for a new agreement. Create a compliant PRT in minutes."
              />

              <SeoDisclaimer className="max-w-4xl mx-auto" />
            </div>
          </div>
        </section>

        {/* Related Resources */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <RelatedLinks title="Related Resources" links={updatePrtRelatedLinks} />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
