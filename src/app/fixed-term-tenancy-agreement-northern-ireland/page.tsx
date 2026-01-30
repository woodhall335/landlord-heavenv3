import { Metadata } from 'next';
import Link from 'next/link';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { SocialProofCounter } from '@/components/ui/SocialProofCounter';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { niFixedTermRelatedLinks } from '@/lib/seo/internal-links';
import { buildWizardLink } from '@/lib/wizard/buildWizardLink';
import { StandardHero } from '@/components/marketing/StandardHero';
import { SeoCtaBlock, SeoDisclaimer } from '@/components/seo/SeoCtaBlock';
import { SeoLandingWrapper } from '@/components/seo/SeoLandingWrapper';
import { FAQSection } from '@/components/seo/FAQSection';
import { fixedTermNIFAQs } from '@/data/faqs';
import { PRODUCTS } from '@/lib/pricing/products';
import {
  CheckCircle,
  Clock,
  ArrowRight,
  Scale,
  FileText,
  Shield,
  AlertTriangle,
  Calendar,
  RefreshCw,
  XCircle,
} from 'lucide-react';

// Page constants for analytics
const PAGE_PATH = '/fixed-term-tenancy-agreement-northern-ireland';
const PAGE_TITLE = 'Fixed Term Tenancy Agreement Northern Ireland';
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
  title: 'Fixed Term Tenancy Agreement Northern Ireland | NI Fixed Term Tenancy',
  description:
    'Create a fixed term tenancy agreement for Northern Ireland. Understand the differences between fixed term and periodic tenancies under NI law.',
  keywords: [
    'fixed term tenancy agreement northern ireland',
    'fixed term tenancy ni',
    'ni fixed term tenancy',
    'periodic tenancy northern ireland',
    'tenancy duration ni',
    'fixed term vs periodic ni',
    'northern ireland tenancy term',
    'landlord fixed term ni',
  ],
  alternates: {
    canonical: 'https://landlordheaven.co.uk/fixed-term-tenancy-agreement-northern-ireland',
  },
  openGraph: {
    title: 'Fixed Term Tenancy Agreement Northern Ireland | Landlord Heaven',
    description:
      'Create a fixed term tenancy agreement for Northern Ireland. Understand fixed term vs periodic tenancies under NI law.',
    type: 'website',
  },
};

export default function FixedTermTenancyAgreementNorthernIrelandPage() {
  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Fixed Term Tenancy Agreement Northern Ireland',
    description:
      'Create a fixed term tenancy agreement for Northern Ireland. Understand the differences between fixed term and periodic tenancies under NI law.',
    url: 'https://landlordheaven.co.uk/fixed-term-tenancy-agreement-northern-ireland',
  };

  return (
    <>
      <StructuredData data={pageSchema} />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          { name: 'Tenancy Agreements', url: 'https://landlordheaven.co.uk/products/ast' },
          {
            name: 'Fixed Term Tenancy NI',
            url: 'https://landlordheaven.co.uk/fixed-term-tenancy-agreement-northern-ireland',
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
          title="Fixed Term Tenancy Agreement Northern Ireland"
          subtitle={
            <>
              Create a <strong>fixed term tenancy agreement</strong> for Northern Ireland with a
              defined end date. Understand when fixed term is better than periodic, and how NI law
              affects your options.
            </>
          }
          primaryCTA={{
            label: `Create Fixed Term Tenancy — ${PRODUCTS.ast_standard.displayPrice}`,
            href: wizardLinkStandard,
          }}
          secondaryCTA={{
            label: 'Premium Agreement with Break Clause',
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
              <Calendar className="w-4 h-4 text-green-500" />
              Defined End Date
            </span>
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              Income Security
            </span>
          </div>
        </StandardHero>

        {/* Social Proof */}
        <section className="py-6 bg-gray-50 border-y border-gray-100">
          <div className="container mx-auto px-4">
            <SocialProofCounter variant="total" className="justify-center" />
          </div>
        </section>

        {/* What is Fixed Term Section */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                What Is a Fixed Term Tenancy in Northern Ireland?
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Understanding the structure and benefits of fixed term agreements in NI.
              </p>

              <div className="prose prose-lg max-w-none text-gray-600">
                <p>
                  A <strong>fixed term tenancy</strong> in Northern Ireland is a tenancy with a
                  specified start and end date. The tenancy runs for an agreed period, typically 6
                  months, 12 months, or longer, and cannot normally be ended by either party before
                  the end date unless there is a break clause or grounds for early termination.
                </p>
                <p>
                  Fixed term tenancies provide certainty for both landlords and tenants. The landlord
                  has guaranteed rental income for the agreed period, while the tenant has security of
                  tenure knowing they cannot be asked to leave (without cause) until the term ends.
                </p>
                <p>
                  Under Northern Ireland law, fixed term tenancies are governed by the Private
                  Tenancies (Northern Ireland) Order 2006 and the Private Tenancies Act (Northern
                  Ireland) 2022. The rules differ from England, Scotland, and Wales, so you must use
                  an agreement designed specifically for NI.
                </p>
                <p>Key characteristics of a fixed term tenancy in NI:</p>
                <ul>
                  <li>
                    <strong>Defined duration:</strong> Clear start and end dates specified in the
                    agreement
                  </li>
                  <li>
                    <strong>No early termination:</strong> Neither party can end early without cause
                    or a break clause
                  </li>
                  <li>
                    <strong>Automatic continuation:</strong> If the tenant stays after the term ends,
                    it typically becomes periodic
                  </li>
                  <li>
                    <strong>Rent certainty:</strong> Rent usually remains fixed for the agreed term
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Fixed Term vs Periodic Section */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Fixed Term vs Periodic Tenancy in NI
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Comparing the two main tenancy structures available in Northern Ireland.
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white rounded-2xl p-6 border-2 border-primary shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <Calendar className="w-8 h-8 text-primary" />
                    <h3 className="text-xl font-bold text-gray-900">Fixed Term Tenancy</h3>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Set duration (e.g., 6 or 12 months)</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Guaranteed rental income for the term</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Tenant cannot leave early without penalty</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Rent fixed for agreed period</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <XCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <span>Less flexibility to recover property</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <RefreshCw className="w-8 h-8 text-gray-600" />
                    <h3 className="text-xl font-bold text-gray-900">Periodic Tenancy</h3>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Rolls week-to-week or month-to-month</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Flexibility to end with proper notice</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Can recover property using Notice to Quit</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <XCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <span>Tenant can leave with notice</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <XCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <span>Less income certainty</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                <p className="text-blue-900 text-sm">
                  <strong>Best Practice:</strong> Many NI landlords start with a fixed term (usually
                  12 months) to establish the tenancy and ensure the tenant settles in, then allow it
                  to become periodic for ongoing flexibility.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* When to Use Fixed Term Section */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                When Should You Use a Fixed Term Tenancy?
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Situations where a fixed term agreement is the better choice.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">New Tenancy</h3>
                  <p className="text-gray-600 text-sm">
                    When letting to a new tenant, a fixed term gives both parties time to establish
                    the relationship. You have income certainty while assessing the tenant, and they
                    have security to settle into the property.
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Mortgage Requirements</h3>
                  <p className="text-gray-600 text-sm">
                    Some buy-to-let mortgages require a minimum tenancy term. A fixed term agreement
                    demonstrates compliance with your lender&apos;s conditions.
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Income Security</h3>
                  <p className="text-gray-600 text-sm">
                    If you need guaranteed rental income for budgeting or mortgage payments, a fixed
                    term ensures the tenant is committed for the agreed period.
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Student Lets</h3>
                  <p className="text-gray-600 text-sm">
                    For student accommodation, a fixed term matching the academic year ensures the
                    property is available for new students each September.
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
                    Important: Fixed Term Limitations
                  </h2>
                  <p className="text-amber-800 mb-4">
                    During a fixed term, you generally cannot end the tenancy early unless the
                    tenant has breached the agreement or there is a break clause.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-amber-200">
                      <h3 className="font-semibold text-amber-900 mb-2">
                        Ending a Fixed Term Early
                      </h3>
                      <ul className="text-sm text-amber-800 space-y-1">
                        <li>• Tenant breach (rent arrears, damage)</li>
                        <li>• Break clause activated</li>
                        <li>• Mutual agreement with tenant</li>
                        <li>• Court order on valid grounds</li>
                      </ul>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-amber-200">
                      <h3 className="font-semibold text-amber-900 mb-2">Consider a Break Clause</h3>
                      <ul className="text-sm text-amber-800 space-y-1">
                        <li>• Allows early termination with notice</li>
                        <li>• Usually after minimum period (e.g., 6 months)</li>
                        <li>• Works both ways (landlord and tenant)</li>
                        <li>• Included in Premium agreement</li>
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
                title="Create Your Fixed Term NI Tenancy Agreement"
                description="Choose your fixed term length, add a break clause if needed, and get a compliant agreement in minutes."
              />
            </div>
          </div>
        </section>

        {/* What Happens at End Section */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                What Happens When the Fixed Term Ends?
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Options at the end of your fixed term tenancy in Northern Ireland.
              </p>

              <div className="prose prose-lg max-w-none text-gray-600">
                <p>
                  When a fixed term tenancy reaches its end date in Northern Ireland, several
                  options are available. Understanding these helps you plan ahead and manage the
                  transition smoothly.
                </p>

                <h3>Option 1: Tenant Leaves</h3>
                <p>
                  The tenant moves out at the end of the fixed term as originally agreed. No
                  additional notice is required from either party if the tenant leaves on the
                  agreed end date. You can then re-let the property to a new tenant.
                </p>

                <h3>Option 2: Tenancy Becomes Periodic</h3>
                <p>
                  If the tenant stays beyond the fixed term with your agreement (even implicitly by
                  accepting rent), the tenancy typically becomes a periodic tenancy rolling on the
                  same payment cycle (usually monthly). This continues indefinitely until ended by
                  proper notice from either party.
                </p>

                <h3>Option 3: New Fixed Term</h3>
                <p>
                  You and the tenant agree a new fixed term, creating a fresh agreement. This is
                  useful if you want to update terms, change the rent, or simply have certainty for
                  another defined period. A new agreement should be signed before the old term ends.
                </p>

                <h3>Notice Periods on Periodic Tenancy</h3>
                <p>
                  Once periodic, ending the tenancy requires a Notice to Quit with the appropriate
                  notice period under NI law:
                </p>
                <ul>
                  <li>
                    <strong>Less than 12 months:</strong> At least 4 weeks notice
                  </li>
                  <li>
                    <strong>12 months or more:</strong> At least 8 weeks notice
                  </li>
                </ul>
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

        {/* Break Clause Section */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Adding a Break Clause to Your NI Tenancy
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Flexibility within a fixed term agreement.
              </p>

              <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">What Is a Break Clause?</h3>
                    <p className="text-gray-600 mb-4">
                      A break clause allows either the landlord or tenant (or both) to end the fixed
                      term tenancy early by giving written notice. This provides flexibility while
                      still having the benefits of a fixed term agreement.
                    </p>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Typical Break Clause Terms</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>Activates after minimum period (e.g., 6 months)</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>Requires 2 months written notice</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>Rent must be up to date</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>Usually applies to both parties</span>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Benefits of a Break Clause</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>Recover property if circumstances change</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>Exit problematic tenancies earlier</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>Flexibility within fixed term structure</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>Attractive to tenants wanting options</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 text-center">
                <Link
                  href={wizardLinkPremium}
                  className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  Get Premium Agreement with Break Clause
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <FAQSection
          faqs={fixedTermNIFAQs}
          title="Fixed Term Tenancy NI FAQ"
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
                title="Create Your Fixed Term NI Agreement Today"
                description="Legally valid. Income security. Optional break clause. Ready in minutes."
              />

              <SeoDisclaimer className="max-w-4xl mx-auto" />
            </div>
          </div>
        </section>

        {/* Related Resources */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <RelatedLinks title="Related Resources" links={niFixedTermRelatedLinks} />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
