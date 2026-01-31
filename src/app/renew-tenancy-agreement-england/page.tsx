import { Metadata } from 'next';
import Link from 'next/link';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { SocialProofCounter } from '@/components/ui/SocialProofCounter';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { renewUpdateEnglandRelatedLinks } from '@/lib/seo/internal-links';
import { buildWizardLink } from '@/lib/wizard/buildWizardLink';
import { StandardHero } from '@/components/marketing/StandardHero';
import { SeoCtaBlock, SeoDisclaimer } from '@/components/seo/SeoCtaBlock';
import { SeoLandingWrapper } from '@/components/seo/SeoLandingWrapper';
import { FAQSection } from '@/components/seo/FAQSection';
import { renewUpdateEnglandFAQs } from '@/data/faqs';
import { PRODUCTS } from '@/lib/pricing/products';
import {
  CheckCircle,
  Clock,
  ArrowRight,
  Scale,
  RefreshCw,
  Shield,
  AlertTriangle,
  FileText,
  Banknote,
  Calendar,
} from 'lucide-react';

// Page constants for analytics
const PAGE_PATH = '/renew-tenancy-agreement-england';
const PAGE_TITLE = 'Renew Tenancy Agreement England';
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
  title: 'Renewing or Updating a Tenancy Agreement (England) | Landlord Guide',
  description:
    'How to renew or update an AST in England. Learn when to issue a new agreement, how to change terms, and what documents to provide at renewal.',
  keywords: [
    'renew tenancy agreement england',
    'update tenancy agreement landlord',
    'ast renewal',
    'tenancy agreement renewal',
    'extend tenancy agreement',
    'new tenancy agreement existing tenant',
    'change tenancy agreement terms',
    'renew ast england',
    'tenancy renewal process',
  ],
  alternates: {
    canonical: 'https://landlordheaven.co.uk/renew-tenancy-agreement-england',
  },
  openGraph: {
    title: 'Renewing or Updating a Tenancy Agreement (England) | Landlord Heaven',
    description:
      'When and how to renew an AST. Update terms, increase rent, and maintain compliance.',
    type: 'website',
  },
};

export default function RenewTenancyAgreementEnglandPage() {
  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Renewing or Updating a Tenancy Agreement (England)',
    description:
      'How to renew or update an AST in England. When to issue a new agreement and how to change terms.',
    url: 'https://landlordheaven.co.uk/renew-tenancy-agreement-england',
  };

  return (
    <>
      <StructuredData data={pageSchema} />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          { name: 'Tenancy Agreements', url: 'https://landlordheaven.co.uk/products/ast' },
          {
            name: 'Renewing Tenancy Agreement',
            url: 'https://landlordheaven.co.uk/renew-tenancy-agreement-england',
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
          title="Renewing or Updating a Tenancy Agreement"
          subtitle={
            <>
              When and how to <strong>renew an AST</strong> in England. Update terms, increase
              rent, and maintain Section 21 compliance with your existing tenant.
            </>
          }
          primaryCTA={{
            label: `Create Renewal Agreement — ${PRODUCTS.ast_standard.displayPrice}`,
            href: wizardLinkStandard,
          }}
          secondaryCTA={{
            label: 'Premium with Rent Review',
            href: wizardLinkPremium,
          }}
          variant="pastel"
        >
          {/* Trust Signals */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600 mt-4">
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Updated for 2026 Rules
            </span>
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              Maintains Section 21 Rights
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

        {/* Do You Need to Renew Section */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Do You Need to Renew the Tenancy Agreement?
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Understanding when a new agreement is necessary and when you can continue on
                existing terms.
              </p>

              <div className="prose prose-lg max-w-none text-gray-600">
                <p>
                  When a fixed-term AST ends in England, it automatically becomes a{' '}
                  <strong>statutory periodic tenancy</strong> if the tenant remains in
                  occupation. This happens by operation of law — you do not need to do anything,
                  and no new agreement is legally required.
                </p>
                <p>
                  The periodic tenancy continues on the same terms as the original agreement,
                  rolling on a monthly basis (if rent was paid monthly). The tenant can stay
                  indefinitely until you serve proper notice or they give notice to leave.
                </p>
                <p>However, you may want to issue a new tenancy agreement if:</p>
                <ul>
                  <li>You want to update the rent amount</li>
                  <li>You want to change or add terms to the agreement</li>
                  <li>You want to grant a new fixed term</li>
                  <li>Tenant circumstances have changed (e.g., adding a partner)</li>
                  <li>Your original agreement is outdated or non-compliant</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Options at Renewal */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Your Options at the End of a Fixed Term
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Choose the approach that best suits your situation.
              </p>

              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">
                        Option 1: Let It Become Periodic
                      </h3>
                      <p className="text-gray-600 mb-3">
                        Do nothing. The tenancy automatically becomes periodic on the same terms.
                        This is the simplest approach if you are happy with the current rent and
                        terms.
                      </p>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-800 mb-2">Best for:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Long-term reliable tenants</li>
                          <li>• No need to change rent or terms</li>
                          <li>• Want maximum flexibility for both parties</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <RefreshCw className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">
                        Option 2: Issue a New Fixed Term Agreement
                      </h3>
                      <p className="text-gray-600 mb-3">
                        Create a new AST for another fixed period (e.g., 12 months). This gives
                        both parties certainty and allows you to update terms and rent.
                      </p>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-800 mb-2">Best for:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Increasing rent with the tenant&apos;s agreement</li>
                          <li>• Adding or changing terms (e.g., pet clause)</li>
                          <li>• Securing income for another set period</li>
                          <li>• Updating an old or non-compliant agreement</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Banknote className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">
                        Option 3: Use a Section 13 Rent Increase
                      </h3>
                      <p className="text-gray-600 mb-3">
                        If you only want to increase rent but keep other terms the same, you can
                        serve a Section 13 notice on a periodic tenancy. No new agreement needed.
                      </p>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-800 mb-2">Best for:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Rent increase only, no other changes</li>
                          <li>• Tenant already on periodic tenancy</li>
                          <li>• Formal process with tribunal option</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Increasing Rent Section */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                How to Increase Rent at Renewal
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                The correct method depends on your tenancy status.
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">During Fixed Term</h3>
                  <p className="text-gray-600 mb-4">
                    You cannot increase rent during a fixed term unless the agreement contains a
                    rent review clause. Most standard ASTs do not include this.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2 text-gray-600">
                      <ArrowRight className="w-4 h-4 text-primary flex-shrink-0 mt-1" />
                      <span>Wait until fixed term ends</span>
                    </div>
                    <div className="flex items-start gap-2 text-gray-600">
                      <ArrowRight className="w-4 h-4 text-primary flex-shrink-0 mt-1" />
                      <span>Then issue new agreement with new rent</span>
                    </div>
                    <div className="flex items-start gap-2 text-gray-600">
                      <ArrowRight className="w-4 h-4 text-primary flex-shrink-0 mt-1" />
                      <span>Or use Section 13 once periodic</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">On Periodic Tenancy</h3>
                  <p className="text-gray-600 mb-4">
                    Two options: agree the increase with the tenant in a new agreement, or
                    serve a formal Section 13 notice.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2 text-gray-600">
                      <ArrowRight className="w-4 h-4 text-primary flex-shrink-0 mt-1" />
                      <span>New agreement: tenant signs at new rent</span>
                    </div>
                    <div className="flex items-start gap-2 text-gray-600">
                      <ArrowRight className="w-4 h-4 text-primary flex-shrink-0 mt-1" />
                      <span>Section 13: 1 month notice minimum</span>
                    </div>
                    <div className="flex items-start gap-2 text-gray-600">
                      <ArrowRight className="w-4 h-4 text-primary flex-shrink-0 mt-1" />
                      <span>Tenant can refer to tribunal</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
                <p className="text-amber-900 text-sm">
                  <strong>Section 13 notices:</strong> You can only increase rent once per year
                  using Section 13. The increase must be to a market rent level. The tenant has
                  the right to refer the increase to a First-tier Tribunal who may reduce it.
                </p>
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
                title="Create Your Renewal Agreement"
                description="Updated terms, new rent, compliant documentation. Ready in minutes."
              />
            </div>
          </div>
        </section>

        {/* Documents at Renewal */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Documents Required at Renewal
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Maintain Section 21 compliance by providing updated documents.
              </p>

              <div className="bg-white rounded-2xl p-8 border border-gray-200">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">How to Rent Guide</h3>
                      <p className="text-gray-600">
                        If the guide has been updated since the original tenancy started, you
                        should provide the current version at renewal. Check gov.uk for the
                        latest version.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Shield className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Gas Safety Certificate</h3>
                      <p className="text-gray-600">
                        Must be renewed annually. Ensure your current certificate is valid.
                        Provide a copy of the latest certificate to the tenant within 28 days
                        of the check.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">
                        Energy Performance Certificate (EPC)
                      </h3>
                      <p className="text-gray-600">
                        Valid for 10 years. Check it has not expired and meets the minimum E
                        rating. If you have improved the property&apos;s energy efficiency,
                        consider getting a new EPC.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Scale className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Deposit Protection</h3>
                      <p className="text-gray-600">
                        If issuing a new tenancy agreement (not just renewal), consider whether
                        the deposit protection needs updating. The same deposit can continue if
                        protected, but you may need to provide new prescribed information.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                <p className="text-red-900 text-sm">
                  <strong>Warning:</strong> Failure to have valid documents in place can
                  invalidate Section 21 notices. Before serving any eviction notice, verify all
                  compliance requirements are met.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* When to Update the Agreement */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                When to Issue a Completely New Agreement
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Some situations require a fresh start rather than a simple renewal.
              </p>

              <div className="space-y-4">
                <div className="bg-white rounded-xl p-4 border border-gray-200 flex items-start gap-4">
                  <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Original agreement is outdated</h3>
                    <p className="text-gray-600 text-sm">
                      If your agreement predates the Tenant Fees Act 2019 or other recent
                      legislation, it may contain terms that are now unenforceable. Start fresh
                      with a compliant agreement.
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 border border-gray-200 flex items-start gap-4">
                  <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Adding or removing tenants</h3>
                    <p className="text-gray-600 text-sm">
                      If a partner is moving in or a joint tenant is leaving, you need to end
                      the existing tenancy and create a new one with the correct names.
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 border border-gray-200 flex items-start gap-4">
                  <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Significant term changes</h3>
                    <p className="text-gray-600 text-sm">
                      If you want to add substantial new clauses (e.g., pet policy, garden
                      maintenance), a new agreement ensures clear documentation of what was
                      agreed.
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 border border-gray-200 flex items-start gap-4">
                  <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Moving to new jurisdiction rules</h3>
                    <p className="text-gray-600 text-sm">
                      If legislation affecting tenancies changes (as happened with the Renters
                      Reform Bill), you may need to update agreements to reflect new rights and
                      obligations.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Renewal Process */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                The Renewal Process Step by Step
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                How to smoothly transition to a new tenancy agreement.
              </p>

              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-primary">1</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">
                        Contact the Tenant in Advance
                      </h3>
                      <p className="text-gray-600">
                        Reach out 2-3 months before the fixed term ends. Discuss whether they
                        wish to stay, and if so, whether you will issue a new agreement with
                        any changes.
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
                      <h3 className="font-bold text-gray-900 mb-2">Agree Terms</h3>
                      <p className="text-gray-600">
                        If you want to change rent or terms, discuss with the tenant. For a
                        renewal agreement to be valid, the tenant must agree to sign it
                        voluntarily.
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
                      <h3 className="font-bold text-gray-900 mb-2">Create the New Agreement</h3>
                      <p className="text-gray-600">
                        Generate a new AST with the updated terms, rent, and correct start date.
                        The new tenancy should start on or after the old one ends — avoid gaps.
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
                      <h3 className="font-bold text-gray-900 mb-2">Sign and Provide Documents</h3>
                      <p className="text-gray-600">
                        Both parties sign the new agreement. Provide copies of the current How
                        to Rent guide, EPC, gas safety certificate, and confirm deposit
                        protection status.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-primary">5</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Keep Records</h3>
                      <p className="text-gray-600">
                        Store copies of both the old and new agreements. Document when you
                        provided required documents. This evidence is essential if you later
                        need to serve notices.
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
          faqs={renewUpdateEnglandFAQs}
          title="Tenancy Renewal FAQ"
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
                title="Create Your Renewal Agreement"
                description="Updated for current legislation. Easy to customise. Maintain Section 21 compliance."
              />

              <SeoDisclaimer className="max-w-4xl mx-auto" />
            </div>
          </div>
        </section>

        {/* Related Resources */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <RelatedLinks title="Related Resources" links={renewUpdateEnglandRelatedLinks} />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
