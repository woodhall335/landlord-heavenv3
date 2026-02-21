import { Metadata } from 'next';
import Link from 'next/link';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { SocialProofCounter } from '@/components/ui/SocialProofCounter';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { prtMainRelatedLinks } from '@/lib/seo/internal-links';
import { buildWizardLink } from '@/lib/wizard/buildWizardLink';
import { StandardHero } from '@/components/marketing/StandardHero';
import { SeoCtaBlock, SeoDisclaimer } from '@/components/seo/SeoCtaBlock';
import { SeoLandingWrapper } from '@/components/seo/SeoLandingWrapper';
import { FAQSection } from '@/components/seo/FAQSection';
import { prtTenancyAgreementFAQs } from '@/data/faqs';
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
} from 'lucide-react';

// Page constants for analytics
const PAGE_PATH = '/private-residential-tenancy-agreement-scotland';
const PAGE_TITLE = 'Private Residential Tenancy Agreement Scotland';
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
  title: 'Private Residential Tenancy Agreement (Scotland) | Create PRT Online',
  description:
    'Create a legally valid Private Residential Tenancy (PRT) agreement for Scotland. Compliant with the Private Housing (Tenancies) (Scotland) Act 2016.',
  keywords: [
    'private residential tenancy agreement',
    'prt tenancy agreement scotland',
    'scottish tenancy agreement',
    'scotland tenancy agreement template',
    'prt agreement',
    'landlord tenancy scotland',
    'private housing act 2016',
    'scottish landlord agreement',
    'create prt agreement',
  ],
  alternates: {
    canonical: 'https://landlordheaven.co.uk/private-residential-tenancy-agreement-scotland',
  },
  openGraph: {
    title: 'Private Residential Tenancy Agreement (Scotland) | Landlord Heaven',
    description:
      'Create a legally valid PRT for Scotland. Compliant with Scottish tenancy law and enforceable at the First-tier Tribunal.',
    type: 'website',
  },
};

export default function PrivateResidentialTenancyAgreementScotlandPage() {
  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Private Residential Tenancy Agreement (Scotland)',
    description:
      'Create a legally valid Private Residential Tenancy agreement for Scotland. Compliant with the Private Housing (Tenancies) (Scotland) Act 2016.',
    url: 'https://landlordheaven.co.uk/private-residential-tenancy-agreement-scotland',
  };

  return (
    <>
      <StructuredData data={pageSchema} />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          { name: 'Tenancy Agreements', url: 'https://landlordheaven.co.uk/products/ast' },
          {
            name: 'PRT Scotland',
            url: 'https://landlordheaven.co.uk/private-residential-tenancy-agreement-scotland',
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
          title="Private Residential Tenancy Agreement"
          subtitle={
            <>
              Create a <strong>legally valid</strong> PRT for Scotland. Compliant with the Private
              Housing (Tenancies) (Scotland) Act 2016 and enforceable at the First-tier Tribunal.
            </>
          }
          primaryCTA={{
            label: `Create PRT Agreement — ${PRODUCTS.ast_standard.displayPrice}`,
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

        {/* What is a PRT Section */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                What Is a Private Residential Tenancy?
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Understanding Scotland&apos;s unique tenancy framework introduced in 2016.
              </p>

              <div className="prose prose-lg max-w-none text-gray-600">
                <p>
                  A <strong>Private Residential Tenancy (PRT)</strong> is the only type of
                  tenancy available for most private lettings in Scotland. It was introduced on
                  1 December 2017 under the Private Housing (Tenancies) (Scotland) Act 2016,
                  replacing the previous assured and short assured tenancy system.
                </p>
                <p>
                  The PRT represents a fundamental shift in Scottish tenancy law. Unlike the
                  English Assured Shorthold Tenancy, a PRT has no fixed end date and continues
                  indefinitely until the tenant gives notice or the landlord establishes one of
                  18 statutory eviction grounds.
                </p>
                <p>Key features of the PRT include:</p>
                <ul>
                  <li>
                    <strong>No fixed term requirement:</strong> The tenancy continues until
                    properly ended
                  </li>
                  <li>
                    <strong>No &quot;no-fault&quot; eviction:</strong> Landlords must have a valid
                    reason to seek possession
                  </li>
                  <li>
                    <strong>Tribunal enforcement:</strong> Disputes are handled by the First-tier
                    Tribunal for Scotland, not the courts
                  </li>
                  <li>
                    <strong>Mandatory statutory terms:</strong> Certain terms must be included
                    in every PRT
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
                    Do Not Use an English AST in Scotland
                  </h2>
                  <p className="text-amber-800 mb-4">
                    English Assured Shorthold Tenancy agreements are not valid in Scotland. Using
                    an English template will create an invalid agreement that cannot be enforced
                    at the First-tier Tribunal.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-amber-200">
                      <h3 className="font-semibold text-amber-900 mb-2">
                        Problems with English Templates
                      </h3>
                      <ul className="text-sm text-amber-800 space-y-1">
                        <li>• Reference wrong legislation (Housing Act 1988)</li>
                        <li>• Include Section 21/Section 8 terms</li>
                        <li>• Missing mandatory Scottish terms</li>
                        <li>• Invalid eviction procedures</li>
                      </ul>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-amber-200">
                      <h3 className="font-semibold text-amber-900 mb-2">Consequences</h3>
                      <ul className="text-sm text-amber-800 space-y-1">
                        <li>• Notice to Leave may be invalid</li>
                        <li>• Tribunal may refuse eviction</li>
                        <li>• Tenant could challenge agreement</li>
                        <li>• Potential financial penalties</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How PRT Differs from AST */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                How a PRT Differs from an English AST
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Key differences between Scottish and English tenancy law.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full bg-white rounded-xl border border-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left p-4 font-semibold text-gray-900">Feature</th>
                      <th className="text-left p-4 font-semibold text-gray-900">
                        Scotland (PRT)
                      </th>
                      <th className="text-left p-4 font-semibold text-gray-900">
                        England (AST)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr>
                      <td className="p-4 text-gray-600">Tenancy end date</td>
                      <td className="p-4 text-gray-900">No end date — continues indefinitely</td>
                      <td className="p-4 text-gray-900">Fixed term or periodic</td>
                    </tr>
                    <tr>
                      <td className="p-4 text-gray-600">No-fault eviction</td>
                      <td className="p-4 text-gray-900">
                        <span className="flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-red-500" />
                          Not available
                        </span>
                      </td>
                      <td className="p-4 text-gray-900">
                        <span className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Section 21
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 text-gray-600">Eviction process</td>
                      <td className="p-4 text-gray-900">First-tier Tribunal</td>
                      <td className="p-4 text-gray-900">County Court</td>
                    </tr>
                    <tr>
                      <td className="p-4 text-gray-600">Eviction notice</td>
                      <td className="p-4 text-gray-900">Notice to Leave (28-84 days)</td>
                      <td className="p-4 text-gray-900">Section 21/8 notice</td>
                    </tr>
                    <tr>
                      <td className="p-4 text-gray-600">Rent increases</td>
                      <td className="p-4 text-gray-900">Once per year, 3 months notice</td>
                      <td className="p-4 text-gray-900">
                        Section 13 on periodic, 1 month notice
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 text-gray-600">Deposit protection</td>
                      <td className="p-4 text-gray-900">Within 30 working days</td>
                      <td className="p-4 text-gray-900">Within 30 calendar days</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* 18 Eviction Grounds */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                The 18 Eviction Grounds
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                To end a PRT, landlords must establish one of these statutory grounds.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Gavel className="w-5 h-5 text-primary" />
                    Mandatory Grounds
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    The Tribunal must grant eviction if proven:
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Landlord intends to sell</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Property to be sold by lender</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Landlord or family member to live in property</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Property to be used for non-residential purpose</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Property required for religious worker</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Substantial rent arrears (3+ months)</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Scale className="w-5 h-5 text-primary" />
                    Discretionary Grounds
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    The Tribunal decides if eviction is reasonable:
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Breach of tenancy agreement</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Rent arrears (1-3 months)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Criminal behaviour</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Antisocial behaviour</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Association with antisocial person</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Tenant no longer needs supported accommodation</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-8">
                <Link
                  href="/scotland-eviction-notices"
                  className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
                >
                  Learn more about eviction in Scotland
                  <ArrowRight className="w-4 h-4" />
                </Link>
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
                title="Create Your PRT Agreement Now"
                description="Compliant with the 2016 Act. Includes all mandatory statutory terms. Ready to use immediately."
              />
            </div>
          </div>
        </section>

        {/* Mandatory Terms Section */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Mandatory Terms in a PRT
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                These terms are required by law and apply automatically even if not stated.
              </p>

              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Home className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Property and Parties</h3>
                      <p className="text-gray-600">
                        The agreement must identify the landlord, tenant(s), and the property
                        address. The tenant&apos;s right to occupy the property as their only or
                        principal home must be stated.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Rent and Rent Increases</h3>
                      <p className="text-gray-600">
                        The rent amount and payment frequency must be stated. The agreement must
                        explain how rent can be increased (once per 12 months with 3 months
                        written notice).
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
                        If a deposit is taken, the agreement must state the amount and that it
                        will be protected in an approved scheme within 30 working days.
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
                      <h3 className="font-bold text-gray-900 mb-2">Ending the Tenancy</h3>
                      <p className="text-gray-600">
                        The agreement must explain how both parties can end the tenancy. For
                        tenants: at least 28 days written notice. For landlords: Notice to Leave
                        with the appropriate notice period and valid ground.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Landlord Registration */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Scottish Landlord Registration
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                A legal requirement before letting any property in Scotland.
              </p>

              <div className="bg-white rounded-2xl p-8 border border-gray-200">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      You Must Be Registered to Let Property
                    </h3>
                    <p className="text-gray-600 mb-4">
                      All private landlords in Scotland must be registered with the local
                      council before letting property. Letting without registration is a
                      criminal offence with penalties up to £50,000.
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-start gap-2 text-gray-600">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>Register with your local council before letting</span>
                      </div>
                      <div className="flex items-start gap-2 text-gray-600">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>Registration lasts 3 years and must be renewed</span>
                      </div>
                      <div className="flex items-start gap-2 text-gray-600">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>
                          Include your registration number on all tenancy documents
                        </span>
                      </div>
                      <div className="flex items-start gap-2 text-gray-600">
                        <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <span>
                          <strong>Cannot serve valid Notice to Leave if unregistered</strong>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What Our Template Includes */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                What Our PRT Template Includes
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                A comprehensive agreement that complies with Scottish tenancy law.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-bold text-gray-900">Mandatory Statutory Terms</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      All terms required by the 2016 Act
                    </li>
                    <li className="flex items-center gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      Correct rent increase provisions
                    </li>
                    <li className="flex items-center gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      Proper termination procedures
                    </li>
                    <li className="flex items-center gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      Deposit protection requirements
                    </li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-gray-900">Additional Protective Terms</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      Garden and exterior maintenance
                    </li>
                    <li className="flex items-center gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      Property condition requirements
                    </li>
                    <li className="flex items-center gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      Utility payment responsibilities
                    </li>
                    <li className="flex items-center gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      Access for inspections
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <FAQSection
          faqs={prtTenancyAgreementFAQs}
          title="PRT Tenancy Agreement FAQ"
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
                title="Create Your PRT Agreement Today"
                description="Legally valid. Tribunal-ready. Compliant with the 2016 Act. Ready in minutes."
              />

              <SeoDisclaimer className="max-w-4xl mx-auto" />
            </div>
          </div>
        </section>

        {/* Related Resources */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <RelatedLinks title="Related Resources" links={prtMainRelatedLinks} />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
