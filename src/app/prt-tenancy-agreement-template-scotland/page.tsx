import { Metadata } from 'next';
import Link from 'next/link';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { SocialProofCounter } from '@/components/ui/SocialProofCounter';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { prtTemplateRelatedLinks } from '@/lib/seo/internal-links';
import { buildWizardLink } from '@/lib/wizard/buildWizardLink';
import { StandardHero } from '@/components/marketing/StandardHero';
import { SeoCtaBlock, SeoDisclaimer } from '@/components/seo/SeoCtaBlock';
import { SeoLandingWrapper } from '@/components/seo/SeoLandingWrapper';
import { FAQSection } from '@/components/seo/FAQSection';
import { prtTemplateFAQs } from '@/data/faqs';
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
  Download,
  Edit,
} from 'lucide-react';

// Page constants for analytics
const PAGE_PATH = '/prt-tenancy-agreement-template-scotland';
const PAGE_TITLE = 'PRT Tenancy Agreement Template Scotland';
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
  title: 'PRT Tenancy Agreement Template Scotland 2026 | Download & Create Online',
  description:
    'Download a legally valid PRT tenancy agreement template for Scotland. Compliant with the Private Housing (Tenancies) (Scotland) Act 2016. Tribunal-ready.',
  keywords: [
    'prt tenancy agreement template',
    'tenancy agreement template scotland',
    'scottish tenancy agreement template',
    'prt template scotland',
    'private residential tenancy template',
    'scotland landlord agreement template',
    'prt agreement download',
    'scottish prt form',
  ],
  alternates: {
    canonical: 'https://landlordheaven.co.uk/prt-tenancy-agreement-template-scotland',
  },
  openGraph: {
    title: 'PRT Tenancy Agreement Template Scotland 2026 | Landlord Heaven',
    description:
      'Download a legally valid PRT template for Scotland. Compliant with the 2016 Act and ready for the First-tier Tribunal.',
    type: 'website',
  },
};

export default function PrtTenancyAgreementTemplateScotlandPage() {
  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'PRT Tenancy Agreement Template Scotland',
    description:
      'Download a legally valid Private Residential Tenancy template for Scotland. Compliant with the Private Housing (Tenancies) (Scotland) Act 2016.',
    url: 'https://landlordheaven.co.uk/prt-tenancy-agreement-template-scotland',
  };

  return (
    <>
      <StructuredData data={pageSchema} />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          { name: 'Tenancy Agreements', url: 'https://landlordheaven.co.uk/products/ast' },
          {
            name: 'PRT Template Scotland',
            url: 'https://landlordheaven.co.uk/prt-tenancy-agreement-template-scotland',
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
          title="PRT Tenancy Agreement Template"
          subtitle={
            <>
              Download a <strong>legally valid</strong> Private Residential Tenancy template for
              Scotland. Fully compliant with the 2016 Act and ready for the First-tier Tribunal.
            </>
          }
          primaryCTA={{
            label: `Create PRT Template — ${PRODUCTS.ast_standard.displayPrice}`,
            href: wizardLinkStandard,
          }}
          secondaryCTA={{
            label: 'Premium Template with Extras',
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
              Instant Download
            </span>
          </div>
        </StandardHero>

        {/* Social Proof */}
        <section className="py-6 bg-gray-50 border-y border-gray-100">
          <div className="container mx-auto px-4">
            <SocialProofCounter variant="total" className="justify-center" />
          </div>
        </section>

        {/* What is a PRT Template Section */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                What Is a PRT Tenancy Agreement Template?
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                A pre-drafted agreement that complies with Scottish tenancy law and protects your
                interests as a landlord.
              </p>

              <div className="prose prose-lg max-w-none text-gray-600">
                <p>
                  A <strong>PRT tenancy agreement template</strong> is a pre-drafted document that
                  you can customise with your property and tenant details to create a legally valid
                  Private Residential Tenancy agreement for Scotland. The template contains all the
                  mandatory terms required by the Private Housing (Tenancies) (Scotland) Act 2016,
                  plus additional protective clauses that safeguard your position as a landlord.
                </p>
                <p>
                  Since 1 December 2017, all new private residential tenancies in Scotland must be
                  Private Residential Tenancies. The PRT replaced the previous assured and short
                  assured tenancy system. Unlike English ASTs, a PRT has no fixed end date and
                  continues indefinitely until properly ended by either party. This makes having a
                  comprehensive written agreement even more important.
                </p>
                <p>
                  The Scottish Government provides a basic model PRT agreement, but this template
                  lacks many protective clauses that experienced landlords include. A professional
                  template builds on the government model with additional terms covering gardens,
                  pets, professional cleaning, decorating, and property-specific matters that are
                  not addressed in the basic version.
                </p>
                <p>
                  Using a proper PRT template ensures your agreement is enforceable at the First-tier
                  Tribunal for Scotland. If you later need to seek eviction for rent arrears, property
                  damage, or any of the other 18 statutory grounds, having a clear and comprehensive
                  written agreement strengthens your case significantly.
                </p>
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
                    Free Starter Documents May Cost You More
                  </h2>
                  <p className="text-amber-800 mb-4">
                    Many free PRT templates found online are outdated, incomplete, or copied from
                    English AST templates. Using an invalid template can prevent you from serving
                    valid eviction notices and cost thousands in lost rent.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-amber-200">
                      <h3 className="font-semibold text-amber-900 mb-2">
                        Problems with Free Starter Documents
                      </h3>
                      <ul className="text-sm text-amber-800 space-y-1">
                        <li>* May reference wrong legislation</li>
                        <li>* Missing mandatory statutory terms</li>
                        <li>* Outdated for 2016 Act requirements</li>
                        <li>* No protective clauses for landlords</li>
                      </ul>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-amber-200">
                      <h3 className="font-semibold text-amber-900 mb-2">Consequences</h3>
                      <ul className="text-sm text-amber-800 space-y-1">
                        <li>* Notice to Leave may be challenged</li>
                        <li>* Tribunal may question agreement terms</li>
                        <li>* Difficulty proving breach of tenancy</li>
                        <li>* Unable to claim for specific damages</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Scottish Government Model vs Professional Template */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Government Model vs Professional Template
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Understanding the difference between the basic model and a comprehensive template.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full bg-white rounded-xl border border-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left p-4 font-semibold text-gray-900">Feature</th>
                      <th className="text-left p-4 font-semibold text-gray-900">
                        Government Model
                      </th>
                      <th className="text-left p-4 font-semibold text-gray-900">
                        Professional Template
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr>
                      <td className="p-4 text-gray-600">Mandatory statutory terms</td>
                      <td className="p-4 text-gray-900">
                        <span className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Included
                        </span>
                      </td>
                      <td className="p-4 text-gray-900">
                        <span className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Included
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 text-gray-600">Garden maintenance clause</td>
                      <td className="p-4 text-gray-900">
                        <span className="flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-red-500" />
                          Not included
                        </span>
                      </td>
                      <td className="p-4 text-gray-900">
                        <span className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Detailed clause
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 text-gray-600">Pet policy</td>
                      <td className="p-4 text-gray-900">
                        <span className="flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-red-500" />
                          Basic only
                        </span>
                      </td>
                      <td className="p-4 text-gray-900">
                        <span className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Comprehensive
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 text-gray-600">Professional cleaning</td>
                      <td className="p-4 text-gray-900">
                        <span className="flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-red-500" />
                          Not addressed
                        </span>
                      </td>
                      <td className="p-4 text-gray-900">
                        <span className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Clear requirements
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 text-gray-600">Decorating permissions</td>
                      <td className="p-4 text-gray-900">
                        <span className="flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-red-500" />
                          Not addressed
                        </span>
                      </td>
                      <td className="p-4 text-gray-900">
                        <span className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Detailed terms
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 text-gray-600">Guarantor provisions</td>
                      <td className="p-4 text-gray-900">
                        <span className="flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-red-500" />
                          Not included
                        </span>
                      </td>
                      <td className="p-4 text-gray-900">
                        <span className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Full guarantor deed
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* What Must Be in a PRT Template */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Essential Elements of a PRT Template
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                What your template must include to be legally valid in Scotland.
              </p>

              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Mandatory Statutory Terms</h3>
                      <p className="text-gray-600">
                        The Private Housing (Tenancies) (Scotland) Act 2016 specifies terms that
                        must be included in every PRT. These cover the tenant&apos;s right to
                        occupy, rent payment, deposit protection, how to end the tenancy, and rent
                        increase procedures. Even if not written in your agreement, these terms
                        apply automatically by law.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Home className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Property Details</h3>
                      <p className="text-gray-600">
                        The full address of the let property, what is included in the let (parking,
                        garden, storage), and what furnishings or appliances are provided. The
                        template should allow you to specify these clearly so there is no dispute
                        about what the tenant is entitled to use.
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
                      <h3 className="font-bold text-gray-900 mb-2">Party Information</h3>
                      <p className="text-gray-600">
                        Full names and addresses of the landlord and all tenants. For joint
                        tenancies, all tenants should be named. The landlord&apos;s registration
                        number must be included — letting property without registration is a
                        criminal offence in Scotland with fines up to £50,000.
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
                      <h3 className="font-bold text-gray-900 mb-2">Additional Protective Terms</h3>
                      <p className="text-gray-600">
                        Beyond the mandatory terms, a good template includes clauses on: garden and
                        exterior maintenance, smoking policy, subletting and assignation, access
                        for inspections, utility responsibilities, alterations and decorating, and
                        condition at end of tenancy. These protect your property and clarify
                        expectations.
                      </p>
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
          showTrustPositioningBar
                pageType="tenancy"
                variant="section"
                pagePath={PAGE_PATH}
                jurisdiction="scotland"
                title="Create Your PRT Template Now"
                description="Legally compliant. All mandatory terms included. Additional protective clauses. Ready in minutes."
              />
            </div>
          </div>
        </section>

        {/* How to Use the Template */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                How to Use Your PRT Template
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Simple steps to create a valid tenancy agreement for your Scottish property.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                      1
                    </div>
                    <h3 className="font-bold text-gray-900">Complete Property Details</h3>
                  </div>
                  <p className="text-gray-600">
                    Enter the full property address, what is included in the let (furnished items,
                    parking, garden), and any property-specific details. Be thorough — unclear
                    property descriptions cause disputes later.
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                      2
                    </div>
                    <h3 className="font-bold text-gray-900">Add Party Information</h3>
                  </div>
                  <p className="text-gray-600">
                    Enter your details as landlord, including your registration number from the
                    Scottish Landlord Register. Add all tenant names — for joint tenancies, every
                    tenant must be named as they are all liable for the rent.
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                      3
                    </div>
                    <h3 className="font-bold text-gray-900">Set Rent and Deposit</h3>
                  </div>
                  <p className="text-gray-600">
                    Specify the monthly rent, payment date, and payment method. State the deposit
                    amount (maximum two months rent) and confirm it will be protected in an approved
                    scheme within 30 working days.
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                      4
                    </div>
                    <h3 className="font-bold text-gray-900">Sign and Provide Copy</h3>
                  </div>
                  <p className="text-gray-600">
                    Both parties sign and date the agreement. You must provide the tenant with a
                    copy within 28 days of the tenancy starting. Keep your signed copy safe — you
                    will need it if you ever apply to the Tribunal.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Landlord Registration Reminder */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl p-8 border border-gray-200">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      Include Your Landlord Registration Number
                    </h3>
                    <p className="text-gray-600 mb-4">
                      All private landlords in Scotland must be registered with the local council.
                      Your registration number should appear in your PRT agreement. Letting property
                      without registration is a criminal offence with penalties up to £50,000.
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-start gap-2 text-gray-600">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>Register before letting any property in Scotland</span>
                      </div>
                      <div className="flex items-start gap-2 text-gray-600">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>Include your registration number in the PRT</span>
                      </div>
                      <div className="flex items-start gap-2 text-gray-600">
                        <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <span>
                          <strong>Unregistered landlords cannot serve valid Notice to Leave</strong>
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
                A comprehensive template that goes beyond the government model.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-bold text-gray-900">Mandatory Terms</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      All statutory terms from 2016 Act
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
                    <li className="flex items-center gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      Notice to Leave grounds reference
                    </li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-gray-900">Additional Protective Clauses</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      Garden and exterior maintenance
                    </li>
                    <li className="flex items-center gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      Pet and smoking policies
                    </li>
                    <li className="flex items-center gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      Professional cleaning standards
                    </li>
                    <li className="flex items-center gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      Access and inspection rights
                    </li>
                    <li className="flex items-center gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      Utility payment responsibilities
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
          faqs={prtTemplateFAQs}
          title="PRT Template FAQ"
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
                title="Download Your PRT Template Today"
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
              <RelatedLinks title="Related Resources" links={prtTemplateRelatedLinks} />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
