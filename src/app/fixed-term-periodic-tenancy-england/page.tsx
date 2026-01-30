import { Metadata } from 'next';
import Link from 'next/link';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { SocialProofCounter } from '@/components/ui/SocialProofCounter';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { fixedTermPeriodicEnglandRelatedLinks } from '@/lib/seo/internal-links';
import { buildWizardLink } from '@/lib/wizard/buildWizardLink';
import { StandardHero } from '@/components/marketing/StandardHero';
import { SeoCtaBlock, SeoDisclaimer } from '@/components/seo/SeoCtaBlock';
import { SeoLandingWrapper } from '@/components/seo/SeoLandingWrapper';
import { FAQSection } from '@/components/seo/FAQSection';
import { fixedTermPeriodicEnglandFAQs } from '@/data/faqs';
import { PRODUCTS } from '@/lib/pricing/products';
import {
  CheckCircle,
  Clock,
  ArrowRight,
  Scale,
  Calendar,
  Shield,
  AlertTriangle,
  RefreshCw,
  Lock,
  Unlock,
} from 'lucide-react';

// Page constants for analytics
const PAGE_PATH = '/fixed-term-periodic-tenancy-england';
const PAGE_TITLE = 'Fixed Term vs Periodic Tenancy England';
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
  title: 'Fixed Term vs Periodic Tenancy Agreement (England) | Which to Use',
  description:
    'Understand the difference between fixed term and periodic tenancy agreements in England. Learn which type suits your letting situation and how to structure your AST.',
  keywords: [
    'fixed term tenancy agreement england',
    'periodic tenancy agreement england',
    'fixed term vs periodic tenancy',
    'rolling tenancy england',
    'statutory periodic tenancy',
    'tenancy types england',
    'ast fixed term',
    'monthly tenancy agreement',
    'tenancy duration england',
  ],
  alternates: {
    canonical: 'https://landlordheaven.co.uk/fixed-term-periodic-tenancy-england',
  },
  openGraph: {
    title: 'Fixed Term vs Periodic Tenancy Agreement (England) | Landlord Heaven',
    description:
      'Which tenancy type is right for your property? Compare fixed term and periodic tenancies in England.',
    type: 'website',
  },
};

export default function FixedTermPeriodicTenancyEnglandPage() {
  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Fixed Term vs Periodic Tenancy Agreement (England)',
    description:
      'Compare fixed term and periodic tenancy agreements in England. Understand which type suits your letting situation.',
    url: 'https://landlordheaven.co.uk/fixed-term-periodic-tenancy-england',
  };

  return (
    <>
      <StructuredData data={pageSchema} />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          { name: 'Tenancy Agreements', url: 'https://landlordheaven.co.uk/products/ast' },
          {
            name: 'Fixed Term vs Periodic',
            url: 'https://landlordheaven.co.uk/fixed-term-periodic-tenancy-england',
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
          title="Fixed Term vs Periodic Tenancy"
          subtitle={
            <>
              Understanding the difference between <strong>fixed term</strong> and{' '}
              <strong>periodic</strong> tenancies in England. Choose the right structure for your
              letting situation.
            </>
          }
          primaryCTA={{
            label: `Create Tenancy Agreement — ${PRODUCTS.ast_standard.displayPrice}`,
            href: wizardLinkStandard,
          }}
          secondaryCTA={{
            label: 'Premium with Break Clause',
            href: wizardLinkPremium,
          }}
          variant="pastel"
        >
          {/* Trust Signals */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600 mt-4">
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Fixed Term or Periodic Options
            </span>
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              Break Clause Available
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

        {/* Introduction Section */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Understanding Tenancy Duration in England
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                The structure of your tenancy affects your rights, flexibility, and ability to
                regain possession of your property.
              </p>

              <div className="prose prose-lg max-w-none text-gray-600">
                <p>
                  When creating an Assured Shorthold Tenancy (AST) in England, one of the key
                  decisions is whether to use a <strong>fixed term</strong> or{' '}
                  <strong>periodic</strong> structure. Each has distinct advantages and
                  implications for both landlords and tenants.
                </p>
                <p>
                  A fixed-term tenancy runs for a specific period — typically 6 or 12 months —
                  with a definite end date. A periodic tenancy has no fixed end date and
                  continues on a rolling basis (usually monthly) until either party gives proper
                  notice.
                </p>
                <p>
                  Many landlords use a hybrid approach: starting with a fixed term that
                  automatically becomes periodic when it ends. This provides initial certainty
                  followed by flexibility.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Comparison Section */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Fixed Term vs Periodic: Key Differences
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Compare the two main tenancy structures to decide which suits your situation.
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Fixed Term */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Lock className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Fixed Term Tenancy</h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    A set period (e.g., 6 or 12 months) with a definite start and end date.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">
                        <strong>Income certainty:</strong> Tenant committed for the full term
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">
                        <strong>Rent stability:</strong> Cannot be changed during the term
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">
                        <strong>Clear end date:</strong> Both parties know when it expires
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">
                        <strong>Less flexibility:</strong> Cannot end early without grounds
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">
                        <strong>Section 21 timing:</strong> Notice cannot expire before term
                        ends
                      </span>
                    </div>
                  </div>
                </div>

                {/* Periodic */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <Unlock className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Periodic Tenancy</h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Rolls on weekly or monthly with no fixed end date until notice is given.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">
                        <strong>Flexibility:</strong> Can give notice at any time
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">
                        <strong>Section 21 ready:</strong> Can serve notice immediately
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">
                        <strong>Rent reviews:</strong> Can adjust rent with proper notice
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">
                        <strong>Less security:</strong> Tenant can leave with one month notice
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">
                        <strong>Void risk:</strong> May have more frequent turnovers
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How Fixed Terms Work */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                How Fixed Term Tenancies Work
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Understanding the rules and limitations of fixed-term ASTs.
              </p>

              <div className="prose prose-lg max-w-none text-gray-600">
                <h3>During the Fixed Term</h3>
                <p>
                  Once a fixed-term tenancy begins, neither party can normally end it early. The
                  tenant is committed to paying rent for the entire term, and the landlord cannot
                  require them to leave (except using Section 8 grounds for serious breaches).
                </p>
                <p>
                  You can serve a Section 21 notice during the fixed term, but it cannot take
                  effect until the fixed term ends. The notice must give at least 2 months from
                  the date it is served and cannot expire before the fixed term ends.
                </p>

                <h3>When the Fixed Term Ends</h3>
                <p>
                  If the tenant stays beyond the fixed term end date with your consent (even
                  implied consent), the tenancy automatically becomes a{' '}
                  <strong>statutory periodic tenancy</strong>. This runs on the same terms as
                  the original agreement but on a rolling basis — usually monthly if rent was
                  paid monthly.
                </p>
                <p>
                  You do not need to create a new agreement. The statutory periodic tenancy
                  arises by operation of law under the Housing Act 1988.
                </p>

                <h3>Break Clauses</h3>
                <p>
                  A break clause allows either party to end a fixed-term tenancy early by giving
                  a specified notice period (typically 2 months). This provides flexibility
                  while maintaining some security.
                </p>
                <p>
                  If you want the option to end the tenancy during the fixed term, include a
                  break clause in your agreement. Our{' '}
                  <Link href={wizardLinkPremium} className="text-primary hover:underline">
                    Premium Tenancy Agreement
                  </Link>{' '}
                  includes break clause options.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How Periodic Tenancies Work */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                How Periodic Tenancies Work
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Understanding rolling tenancies and notice requirements.
              </p>

              <div className="prose prose-lg max-w-none text-gray-600">
                <h3>Types of Periodic Tenancy</h3>
                <p>There are two types of periodic tenancy:</p>
                <ul>
                  <li>
                    <strong>Contractual periodic:</strong> Created by the original tenancy
                    agreement stating the tenancy will be periodic from the start, or will
                    continue as a periodic tenancy after any fixed term.
                  </li>
                  <li>
                    <strong>Statutory periodic:</strong> Arises automatically by law when a
                    fixed-term tenancy ends and the tenant remains in occupation.
                  </li>
                </ul>
                <p>
                  Both function similarly — the tenancy rolls on until ended by proper notice.
                </p>

                <h3>Notice Requirements</h3>
                <p>
                  To end a periodic tenancy, landlords must serve a Section 21 notice giving at
                  least 2 months notice. The notice must expire on the last day of a rental
                  period.
                </p>
                <p>
                  For example, if rent is paid monthly on the 1st, a notice served on 15th
                  January would need to expire on 31st March at the earliest (being the last
                  day of a complete rental period after 2 months have passed).
                </p>
                <p>
                  Tenants must give at least one month&apos;s notice to end a periodic tenancy,
                  also expiring on the last day of a rental period.
                </p>

                <h3>Rent Changes</h3>
                <p>
                  On a periodic tenancy, you can increase rent using a Section 13 notice. You
                  must give at least one month&apos;s notice (or one rental period if longer).
                  The tenant can refer the increase to a tribunal if they disagree.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Mid-page CTA */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <SeoCtaBlock
                pageType="tenancy"
                variant="section"
                pagePath={PAGE_PATH}
                jurisdiction="england"
                title="Create Your Tenancy Agreement"
                description="Choose fixed term, periodic, or a hybrid approach. Our wizard guides you through the options."
              />
            </div>
          </div>
        </section>

        {/* Which Should You Choose */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Which Should You Choose?
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Consider your circumstances to decide the best structure.
              </p>

              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">
                        Choose Fixed Term (6-12 months) If...
                      </h3>
                      <ul className="space-y-2 text-gray-600">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                          You want guaranteed rental income for a set period
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                          The tenant is new and unproven
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                          You want to lock in the current rent for the term
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                          The property is in high demand with little void risk
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <RefreshCw className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">
                        Choose Periodic (Rolling) If...
                      </h3>
                      <ul className="space-y-2 text-gray-600">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                          You may need flexibility to regain possession
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                          The tenant is established and reliable
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                          You want to be able to adjust rent periodically
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                          You may want to sell or move into the property
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Shield className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">
                        Choose Fixed Term with Break Clause If...
                      </h3>
                      <ul className="space-y-2 text-gray-600">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                          You want a balance of security and flexibility
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                          Your circumstances might change during the term
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                          The tenant wants the option to leave early too
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                          You are uncertain about long-term letting plans
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 bg-primary/5 border-l-4 border-primary p-4 rounded-r-lg">
                <p className="text-gray-900 text-sm">
                  <strong>Most common approach:</strong> Start with a 12-month fixed term that
                  automatically becomes periodic. This gives you initial security while
                  providing flexibility after the first year.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Impact on Eviction */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Impact on Eviction Rights
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                How your tenancy structure affects your ability to regain possession.
              </p>

              <div className="prose prose-lg max-w-none text-gray-600">
                <h3>Section 21 Notices</h3>
                <p>
                  You can serve a Section 21 notice on either a fixed-term or periodic tenancy,
                  but the timing rules differ:
                </p>
                <ul>
                  <li>
                    <strong>Fixed term:</strong> Notice can be served during the fixed term but
                    cannot expire until the fixed term ends. You need to allow at least 2 months
                    from service.
                  </li>
                  <li>
                    <strong>Periodic:</strong> Notice can be served at any time but must expire
                    on the last day of a rental period, at least 2 months from service.
                  </li>
                </ul>

                <h3>Section 8 Notices</h3>
                <p>
                  Section 8 notices (grounds-based eviction) can be served during either type of
                  tenancy. The notice periods vary depending on the ground used — from 2 weeks
                  for serious rent arrears to 2 months for some discretionary grounds.
                </p>

                <h3>Planning Ahead</h3>
                <p>
                  If you know you may need to recover possession, consider the timing
                  implications. On a 12-month fixed term, you may need to wait until month 10
                  to serve a Section 21 notice that takes effect at month 12.
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
                  <p className="text-sm text-gray-600">No-fault eviction process for England</p>
                </Link>

                <Link
                  href="/how-to-evict-tenant"
                  className="bg-white rounded-xl p-4 border border-gray-200 hover:border-primary hover:shadow-md transition-all group"
                >
                  <h3 className="font-semibold text-gray-900 group-hover:text-primary mb-1">
                    How to Evict a Tenant UK
                  </h3>
                  <p className="text-sm text-gray-600">Complete eviction guide</p>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <FAQSection
          faqs={fixedTermPeriodicEnglandFAQs}
          title="Fixed Term vs Periodic Tenancy FAQ"
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
                title="Create Your Tenancy Agreement"
                description="Fixed term, periodic, or with break clause. Choose the structure that works for you."
              />

              <SeoDisclaimer className="max-w-4xl mx-auto" />
            </div>
          </div>
        </section>

        {/* Related Resources */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <RelatedLinks
                title="Related Resources"
                links={fixedTermPeriodicEnglandRelatedLinks}
              />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
