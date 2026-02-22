import { Metadata } from 'next';
import Link from 'next/link';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { SocialProofCounter } from '@/components/ui/SocialProofCounter';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { niTenancyTemplateRelatedLinks } from '@/lib/seo/internal-links';
import { buildWizardLink } from '@/lib/wizard/buildWizardLink';
import { StandardHero } from '@/components/marketing/StandardHero';
import { SeoCtaBlock, SeoDisclaimer } from '@/components/seo/SeoCtaBlock';
import { SeoLandingWrapper } from '@/components/seo/SeoLandingWrapper';
import { FAQSection } from '@/components/seo/FAQSection';
import { niTenancyTemplateFAQs } from '@/data/faqs';
import { PRODUCTS } from '@/lib/pricing/products';
import {
  CheckCircle,
  Clock,
  ArrowRight,
  Scale,
  FileText,
  Shield,
  AlertTriangle,
  Download,
  XCircle,
  Gavel,
} from 'lucide-react';

// Page constants for analytics
const PAGE_PATH = '/tenancy-agreement-template-northern-ireland';
const PAGE_TITLE = 'Tenancy Agreement Template Northern Ireland';
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
  title: 'Tenancy Agreement Template Northern Ireland | NI Landlord Template 2026',
  description:
    'Download a tenancy agreement template for Northern Ireland. Compliant with the Private Tenancies Act 2022. Court-ready documents.',
  keywords: [
    'tenancy agreement template northern ireland',
    'ni tenancy agreement template',
    'northern ireland landlord template',
    'private tenancy template ni',
    'tenancy agreement form ni',
    'ni rental agreement template',
    'download tenancy agreement ni',
    'private tenancies act 2022 template',
  ],
  alternates: {
    canonical: 'https://landlordheaven.co.uk/tenancy-agreement-template-northern-ireland',
  },
  openGraph: {
    title: 'Tenancy Agreement Template Northern Ireland | Landlord Heaven',
    description:
      'Download a legally valid tenancy agreement template for Northern Ireland. Court-ready and compliant with NI legislation.',
    type: 'website',
  },
};

export default function TenancyAgreementTemplateNorthernIrelandPage() {
  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Tenancy Agreement Template Northern Ireland',
    description:
      'Download a legally valid tenancy agreement template for Northern Ireland. Compliant with the Private Tenancies Act 2022 and 2006 Order.',
    url: 'https://landlordheaven.co.uk/tenancy-agreement-template-northern-ireland',
  };

  return (
    <>
      <StructuredData data={pageSchema} />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          { name: 'Tenancy Agreements', url: 'https://landlordheaven.co.uk/products/ast' },
          {
            name: 'NI Tenancy Template',
            url: 'https://landlordheaven.co.uk/tenancy-agreement-template-northern-ireland',
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
          title="Tenancy Agreement Template Northern Ireland"
          subtitle={
            <>
              Get a <strong>professionally drafted</strong> tenancy agreement template for Northern
              Ireland. Fully compliant with the Private Tenancies Act (NI) 2022 and ready for
              immediate use.
            </>
          }
          primaryCTA={{
            label: `Get NI Template — ${PRODUCTS.ast_standard.displayPrice}`,
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
              2022 Act Compliant
            </span>
            <span className="flex items-center gap-2">
              <Download className="w-4 h-4 text-green-500" />
              Instant Download
            </span>
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              Court-Ready
            </span>
          </div>
        </StandardHero>

        {/* Social Proof */}
        <section className="py-6 bg-gray-50 border-y border-gray-100">
          <div className="container mx-auto px-4">
            <SocialProofCounter variant="total" className="justify-center" />
          </div>
        </section>

        {/* What is a NI Template Section */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                What Is a Northern Ireland Tenancy Agreement Template?
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Understanding what makes a NI tenancy template legally valid and fit for purpose.
              </p>

              <div className="prose prose-lg max-w-none text-gray-600">
                <p>
                  A <strong>Northern Ireland tenancy agreement template</strong> is a pre-drafted
                  legal document designed specifically for private lettings in Northern Ireland. It
                  must comply with the Private Tenancies (Northern Ireland) Order 2006 and the
                  Private Tenancies Act (Northern Ireland) 2022 to be legally valid.
                </p>
                <p>
                  Under the 2022 Act, landlords are now legally required to provide tenants with a
                  written tenancy agreement within 28 days of the tenancy starting. This makes having
                  a proper, compliant template essential rather than optional. The template must
                  contain specific statutory information prescribed by regulations.
                </p>
                <p>
                  A good NI tenancy template goes beyond the minimum legal requirements. It should
                  include practical clauses that protect your interests while remaining fair and
                  enforceable, cover common scenarios like rent arrears and property damage, and use
                  the correct NI-specific notice periods and termination procedures.
                </p>
                <p>Key elements of a quality NI tenancy template include:</p>
                <ul>
                  <li>
                    <strong>Statutory compliance:</strong> Meets all requirements under the 2006 Order
                    and 2022 Act
                  </li>
                  <li>
                    <strong>NI-specific terms:</strong> Correct notice periods, deposit rules, and
                    eviction procedures for Northern Ireland
                  </li>
                  <li>
                    <strong>Comprehensive coverage:</strong> Addresses rent, deposits, repairs,
                    termination, and tenant obligations
                  </li>
                  <li>
                    <strong>Court-ready:</strong> Structured to stand up if you need to enforce terms
                    through the NI courts
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
                    Why Free Starter Documents May Not Be Suitable for NI
                  </h2>
                  <p className="text-amber-800 mb-4">
                    Free tenancy agreement templates found online are often outdated, designed for
                    England, or fail to comply with Northern Ireland&apos;s specific legal requirements.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-amber-200">
                      <h3 className="font-semibold text-amber-900 mb-2">Common Template Problems</h3>
                      <ul className="text-sm text-amber-800 space-y-1">
                        <li>• Based on English Housing Act 1988</li>
                        <li>• Include Section 21/Section 8 references</li>
                        <li>• Missing 2022 Act statutory requirements</li>
                        <li>• Wrong notice periods for NI</li>
                        <li>• Outdated deposit protection rules</li>
                      </ul>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-amber-200">
                      <h3 className="font-semibold text-amber-900 mb-2">Potential Consequences</h3>
                      <ul className="text-sm text-amber-800 space-y-1">
                        <li>• Notice to Quit declared invalid</li>
                        <li>• Unable to obtain possession order</li>
                        <li>• Non-compliance penalties</li>
                        <li>• Difficulty recovering arrears</li>
                        <li>• Deposit disputes unresolved</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Template Requirements Section */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                What a Valid NI Tenancy Template Must Include
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Statutory requirements and essential clauses for Northern Ireland tenancies.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="font-bold text-gray-900">Statutory Information</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Landlord name, address, and contact details</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>All tenant names and the property address</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Rent amount, payment date, and method</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Deposit amount and protection scheme details</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Tenancy start date and type (fixed/periodic)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>How to end the tenancy (NI notice periods)</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-bold text-gray-900">Practical Clauses</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Landlord repair and maintenance obligations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Tenant responsibilities and prohibited activities</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Access for inspections and repairs</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Utility bill responsibilities</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Garden and exterior maintenance terms</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>End of tenancy cleaning and condition</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                <p className="text-blue-900 text-sm">
                  <strong>28-Day Requirement:</strong> Under the Private Tenancies Act (NI) 2022, you
                  must provide your tenant with a written tenancy agreement within 28 days of the
                  tenancy starting. Using our template ensures you meet this deadline with a
                  compliant document.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Comparison Section */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                NI Template vs Templates from Other Jurisdictions
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Why you cannot use English, Scottish, or Welsh templates in Northern Ireland.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full bg-white rounded-xl border border-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left p-4 font-semibold text-gray-900">Feature</th>
                      <th className="text-left p-4 font-semibold text-green-700">
                        NI Template
                      </th>
                      <th className="text-left p-4 font-semibold text-red-700">
                        English AST
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr>
                      <td className="p-4 text-gray-600">Valid in Northern Ireland?</td>
                      <td className="p-4">
                        <span className="flex items-center gap-2 text-green-700">
                          <CheckCircle className="w-4 h-4" />
                          Yes
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="flex items-center gap-2 text-red-700">
                          <XCircle className="w-4 h-4" />
                          No
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 text-gray-600">References correct legislation</td>
                      <td className="p-4">
                        <span className="flex items-center gap-2 text-green-700">
                          <CheckCircle className="w-4 h-4" />
                          2006 Order & 2022 Act
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="flex items-center gap-2 text-red-700">
                          <XCircle className="w-4 h-4" />
                          Housing Act 1988
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 text-gray-600">Correct notice periods</td>
                      <td className="p-4">
                        <span className="flex items-center gap-2 text-green-700">
                          <CheckCircle className="w-4 h-4" />
                          NI specific periods
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="flex items-center gap-2 text-red-700">
                          <XCircle className="w-4 h-4" />
                          Section 21/8 periods
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 text-gray-600">Deposit protection rules</td>
                      <td className="p-4">
                        <span className="flex items-center gap-2 text-green-700">
                          <CheckCircle className="w-4 h-4" />
                          NI scheme (28 days)
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="flex items-center gap-2 text-red-700">
                          <XCircle className="w-4 h-4" />
                          England scheme (30 days)
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 text-gray-600">Meets 2022 Act requirements</td>
                      <td className="p-4">
                        <span className="flex items-center gap-2 text-green-700">
                          <CheckCircle className="w-4 h-4" />
                          Yes
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="flex items-center gap-2 text-red-700">
                          <XCircle className="w-4 h-4" />
                          No
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 text-gray-600">Enforceable in NI courts</td>
                      <td className="p-4">
                        <span className="flex items-center gap-2 text-green-700">
                          <CheckCircle className="w-4 h-4" />
                          Yes
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="flex items-center gap-2 text-red-700">
                          <XCircle className="w-4 h-4" />
                          Problematic
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
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
                jurisdiction="northern-ireland"
                title="Get Your NI Tenancy Template Now"
                description="Professionally drafted. 2022 Act compliant. Ready to use in minutes."
              />
            </div>
          </div>
        </section>

        {/* How to Use Section */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                How to Use Your NI Tenancy Template
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Simple steps to create a valid tenancy agreement for your NI property.
              </p>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Complete the Wizard</h3>
                    <p className="text-gray-600">
                      Answer questions about your property, tenant(s), rent amount, and deposit. The
                      wizard guides you through all required information for a valid NI tenancy
                      agreement.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Review and Download</h3>
                    <p className="text-gray-600">
                      Your customised agreement is generated instantly. Review the terms, make any
                      final adjustments, and download the completed document in PDF format.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Sign with Your Tenant</h3>
                    <p className="text-gray-600">
                      Both landlord and tenant should sign and date the agreement. Each party keeps a
                      signed copy. Provide within 28 days of the tenancy starting to comply with the
                      2022 Act.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                    4
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Protect the Deposit</h3>
                    <p className="text-gray-600">
                      If taking a deposit, protect it in an approved NI tenancy deposit scheme within
                      28 days and provide the tenant with the prescribed information.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What Our Template Includes Section */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                What Our NI Tenancy Template Includes
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                A comprehensive agreement designed specifically for Northern Ireland landlords.
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <Gavel className="w-5 h-5 text-primary" />
                    Legal Compliance
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      Private Tenancies (NI) Order 2006 compliant
                    </li>
                    <li className="flex items-center gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      Private Tenancies Act (NI) 2022 compliant
                    </li>
                    <li className="flex items-center gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      All statutory information included
                    </li>
                    <li className="flex items-center gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      Correct NI notice periods
                    </li>
                    <li className="flex items-center gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      Fair contract terms (consumer law)
                    </li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    Landlord Protection
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      Clear rent payment obligations
                    </li>
                    <li className="flex items-center gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      Deposit protection clauses
                    </li>
                    <li className="flex items-center gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      Property condition requirements
                    </li>
                    <li className="flex items-center gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      Access for inspections
                    </li>
                    <li className="flex items-center gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      Termination procedures
                    </li>
                  </ul>
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

        {/* FAQ Section */}
        <FAQSection
          faqs={niTenancyTemplateFAQs}
          title="NI Tenancy Template FAQ"
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
                title="Download Your NI Tenancy Template Today"
                description="Legally valid. 2022 Act compliant. Instant download. Ready in minutes."
              />

              <SeoDisclaimer className="max-w-4xl mx-auto" />
            </div>
          </div>
        </section>

        {/* Related Resources */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <RelatedLinks title="Related Resources" links={niTenancyTemplateRelatedLinks} />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
