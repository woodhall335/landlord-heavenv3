import { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import Link from 'next/link';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { SocialProofCounter } from '@/components/ui/SocialProofCounter';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { niTenancyMainRelatedLinks } from '@/lib/seo/internal-links';
import { buildWizardLink } from '@/lib/wizard/buildWizardLink';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { SeoCtaBlock, SeoDisclaimer } from '@/components/seo/SeoCtaBlock';
import { SeoLandingWrapper } from '@/components/seo/SeoLandingWrapper';
import { FAQSection } from '@/components/seo/FAQSection';
import { niTenancyAgreementFAQs } from '@/data/faqs';
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
const PAGE_PATH = '/tenancy-agreement-northern-ireland';
const PAGE_TITLE = 'Tenancy Agreement Northern Ireland';
const PAGE_TYPE = 'tenancy' as const;

const wizardLinkStandard = buildWizardLink({
  product: 'tenancy_agreement',
  jurisdiction: 'northern-ireland',
  src: 'seo_tenancy_agreement_northern_ireland',
  topic: 'tenancy',
});

const wizardLinkPremium = buildWizardLink({
  product: 'tenancy_agreement',
  jurisdiction: 'northern-ireland',
  src: 'seo_tenancy_agreement_northern_ireland',
  topic: 'tenancy',
});

export const metadata: Metadata = {
  title: 'Tenancy Agreement Northern Ireland | Create NI Tenancy Online',
  description:
    'Create a legally valid tenancy agreement for Northern Ireland. Compliant with the Private Tenancies (NI) Order 2006 and Private Tenancies Act 2022.',
  keywords: [
    'tenancy agreement northern ireland',
    'landlord tenancy agreement ni',
    'northern ireland tenancy agreement',
    'private tenancy agreement ni',
    'ni landlord agreement',
    'tenancy agreement template ni',
    'create tenancy agreement northern ireland',
    'private tenancies act 2022',
    'ni rental agreement',
  ],
  alternates: {
    canonical: 'https://landlordheaven.co.uk/tenancy-agreement-northern-ireland',
  },
  openGraph: {
    title: 'Tenancy Agreement Northern Ireland | Landlord Heaven',
    description:
      'Create a legally valid tenancy agreement for Northern Ireland. Compliant with NI tenancy legislation.',
    type: 'website',
  },
};

export default function TenancyAgreementNorthernIrelandPage() {
  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Tenancy Agreement Northern Ireland',
    description:
      'Create a legally valid tenancy agreement for Northern Ireland. Compliant with the Private Tenancies (NI) Order 2006 and Private Tenancies Act 2022.',
    url: 'https://landlordheaven.co.uk/tenancy-agreement-northern-ireland',
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
            name: 'Tenancy Agreement Northern Ireland',
            url: 'https://landlordheaven.co.uk/tenancy-agreement-northern-ireland',
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
          title="Tenancy Agreement Northern Ireland"
          subtitle={
            <>
              Create a <strong>legally valid</strong> tenancy agreement for Northern Ireland.
              Compliant with the Private Tenancies (NI) Order 2006 and the Private Tenancies Act
              (Northern Ireland) 2022.
            </>
          }
          primaryCta={{
            label: `Create Tenancy Agreement — ${PRODUCTS.ast_standard.displayPrice}`,
            href: wizardLinkStandard,
          }}
          secondaryCta={{
            label: 'Premium Agreement with Extra Protection',
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
              <Shield className="w-4 h-4 text-green-500" />
              Court-Ready Documentation
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

        {/* What is a NI Tenancy Agreement Section */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                What Is a Private Tenancy Agreement in Northern Ireland?
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Understanding Northern Ireland&apos;s unique tenancy framework and legal requirements.
              </p>

              <div className="prose prose-lg max-w-none text-gray-600">
                <p>
                  A <strong>private tenancy agreement</strong> in Northern Ireland is a legally binding
                  contract between a landlord and tenant for the rental of residential property. Unlike
                  England, Scotland, or Wales, Northern Ireland has its own distinct tenancy legislation
                  governed primarily by the Private Tenancies (Northern Ireland) Order 2006 and the
                  more recent Private Tenancies Act (Northern Ireland) 2022.
                </p>
                <p>
                  The 2022 Act introduced significant changes to landlord obligations, including a
                  mandatory requirement to provide tenants with a written tenancy agreement within 28
                  days of the tenancy starting. This written agreement must contain specific statutory
                  information prescribed by regulations, making it essential that landlords use an
                  up-to-date, compliant template.
                </p>
                <p>
                  Northern Ireland tenancies are neither Assured Shorthold Tenancies (England), Private
                  Residential Tenancies (Scotland), nor Occupation Contracts (Wales). Using a template
                  from another UK jurisdiction will not comply with NI law and could leave you unable
                  to enforce your rights or serve valid notices.
                </p>
                <p>Key features of NI private tenancies include:</p>
                <ul>
                  <li>
                    <strong>Written agreement required:</strong> Must be provided within 28 days of
                    tenancy start under the 2022 Act
                  </li>
                  <li>
                    <strong>Deposit protection:</strong> Tenancy deposits must be protected in an
                    approved NI scheme
                  </li>
                  <li>
                    <strong>Notice to Quit:</strong> Different notice periods than the rest of the UK
                  </li>
                  <li>
                    <strong>Separate legislation:</strong> NI tenancy law is distinct from England,
                    Scotland, and Wales
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
                    Do Not Use Templates from Other UK Jurisdictions
                  </h2>
                  <p className="text-amber-800 mb-4">
                    Northern Ireland has separate tenancy legislation. Using an English AST, Scottish
                    PRT, or Welsh Occupation Contract template will result in an invalid agreement that
                    cannot be properly enforced.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-amber-200">
                      <h3 className="font-semibold text-amber-900 mb-2">
                        Problems with Wrong Templates
                      </h3>
                      <ul className="text-sm text-amber-800 space-y-1">
                        <li>• Reference wrong legislation (Housing Act, 2016 Acts)</li>
                        <li>• Include Section 21/Section 8 terms not valid in NI</li>
                        <li>• Missing NI statutory requirements</li>
                        <li>• Incorrect notice periods and procedures</li>
                      </ul>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-amber-200">
                      <h3 className="font-semibold text-amber-900 mb-2">Consequences</h3>
                      <ul className="text-sm text-amber-800 space-y-1">
                        <li>• Notice to Quit may be invalid</li>
                        <li>• Court may refuse possession order</li>
                        <li>• Unable to recover arrears or damages</li>
                        <li>• Non-compliance with 2022 Act requirements</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How NI Differs Section */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                How NI Tenancy Law Differs from the Rest of the UK
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Key differences between Northern Ireland and other UK jurisdictions.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full bg-white rounded-xl border border-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left p-4 font-semibold text-gray-900">Feature</th>
                      <th className="text-left p-4 font-semibold text-gray-900">Northern Ireland</th>
                      <th className="text-left p-4 font-semibold text-gray-900">England (AST)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr>
                      <td className="p-4 text-gray-600">Primary legislation</td>
                      <td className="p-4 text-gray-900">
                        Private Tenancies (NI) Order 2006 & 2022 Act
                      </td>
                      <td className="p-4 text-gray-900">Housing Act 1988</td>
                    </tr>
                    <tr>
                      <td className="p-4 text-gray-600">Written agreement</td>
                      <td className="p-4 text-gray-900">
                        <span className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Required within 28 days
                        </span>
                      </td>
                      <td className="p-4 text-gray-900">
                        <span className="flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-amber-500" />
                          Not legally required (but recommended)
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 text-gray-600">No-fault eviction</td>
                      <td className="p-4 text-gray-900">Notice to Quit (varying periods)</td>
                      <td className="p-4 text-gray-900">Section 21 notice (2 months)</td>
                    </tr>
                    <tr>
                      <td className="p-4 text-gray-600">Grounds-based eviction</td>
                      <td className="p-4 text-gray-900">Under NI Order/Act grounds</td>
                      <td className="p-4 text-gray-900">Section 8 grounds</td>
                    </tr>
                    <tr>
                      <td className="p-4 text-gray-600">Deposit protection deadline</td>
                      <td className="p-4 text-gray-900">Within 28 days</td>
                      <td className="p-4 text-gray-900">Within 30 days</td>
                    </tr>
                    <tr>
                      <td className="p-4 text-gray-600">Enforcement body</td>
                      <td className="p-4 text-gray-900">County Court NI</td>
                      <td className="p-4 text-gray-900">County Court England</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* Legal Requirements Section */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Legal Requirements for NI Tenancy Agreements
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Your tenancy agreement must comply with Northern Ireland-specific legislation.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">
                    Private Tenancies (NI) Order 2006
                  </h3>
                  <p className="text-gray-600 text-sm">
                    The foundational legislation for private tenancies in Northern Ireland. Establishes
                    the legal framework for landlord-tenant relationships, notice requirements, and
                    grounds for possession.
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">
                    Private Tenancies Act (NI) 2022
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Introduced mandatory written agreements within 28 days, new notice periods, and
                    enhanced tenant protections. All NI tenancy agreements must now comply with these
                    requirements.
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <Scale className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Tenancy Deposit Scheme NI</h3>
                  <p className="text-gray-600 text-sm">
                    All deposits taken for NI tenancies must be protected in an approved scheme within
                    28 days. Prescribed information must be provided to the tenant. Non-compliance can
                    result in penalties and affect your ability to recover possession.
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <Gavel className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Consumer Rights</h3>
                  <p className="text-gray-600 text-sm">
                    Unfair contract terms are not enforceable under consumer protection law. Your
                    tenancy agreement must contain fair, transparent terms that do not create
                    significant imbalance between landlord and tenant.
                  </p>
                </div>
              </div>

              <div className="mt-8 bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                <p className="text-green-900 text-sm">
                  <strong>Landlord Heaven NI agreements</strong> are drafted to comply with all current
                  Northern Ireland legislation. They are regularly updated when laws change, ensuring
                  you always have a compliant agreement.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* What to Include Section */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                What Your NI Tenancy Agreement Must Include
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Essential terms required by Northern Ireland legislation.
              </p>

              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Parties and Property Details</h3>
                      <p className="text-gray-600 mb-3">
                        The agreement must clearly identify the landlord (with contact address),
                        all tenants by full legal name, and the complete property address including
                        postcode.
                      </p>
                      <ul className="grid md:grid-cols-2 gap-2 text-sm text-gray-600">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Landlord name and address
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          All tenant names
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Full property address
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Agent details (if applicable)
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Rent and Payment Terms</h3>
                      <p className="text-gray-600 mb-3">
                        Clear specification of the rent amount, payment frequency, due date, and
                        acceptable payment methods. Include provisions for rent review if appropriate.
                      </p>
                      <ul className="grid md:grid-cols-2 gap-2 text-sm text-gray-600">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Monthly rent amount
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Payment due date
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Payment method
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Rent review provisions
                        </li>
                      </ul>
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
                      <p className="text-gray-600 mb-3">
                        The deposit amount, which NI approved scheme it will be protected in, the
                        deadline for protection (28 days), and conditions for return at tenancy end.
                      </p>
                      <ul className="grid md:grid-cols-2 gap-2 text-sm text-gray-600">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Deposit amount
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Protection scheme name
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          28-day protection deadline
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Return conditions
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Home className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">
                        Tenancy Duration and Termination
                      </h3>
                      <p className="text-gray-600 mb-3">
                        Whether fixed term or periodic, the start date, end date (if fixed), and
                        crucially the correct NI notice periods for ending the tenancy.
                      </p>
                      <ul className="grid md:grid-cols-2 gap-2 text-sm text-gray-600">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Tenancy start date
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Fixed term end date (if applicable)
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          NI notice periods
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Notice to Quit requirements
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <BadgeCheck className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">
                        Responsibilities and Obligations
                      </h3>
                      <p className="text-gray-600 mb-3">
                        Clear definition of landlord repair obligations, tenant responsibilities,
                        utility bill arrangements, and property maintenance requirements.
                      </p>
                      <ul className="grid md:grid-cols-2 gap-2 text-sm text-gray-600">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Landlord repair obligations
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Tenant responsibilities
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Utility arrangements
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Garden and exterior maintenance
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
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
                jurisdiction="northern-ireland"
                title="Create Your NI Tenancy Agreement Now"
                description="Compliant with the 2006 Order and 2022 Act. Includes all statutory requirements. Ready to use immediately."
              />
            </div>
          </div>
        </section>

        {/* Notice to Quit Section */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Notice to Quit in Northern Ireland
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Understanding the notice periods required to end a NI tenancy.
              </p>

              <div className="prose prose-lg max-w-none text-gray-600">
                <p>
                  To end a private tenancy in Northern Ireland, landlords must serve a valid Notice
                  to Quit. The notice periods depend on the length of the tenancy and changed
                  significantly under the Private Tenancies Act (NI) 2022.
                </p>

                <h3>Minimum Notice Periods</h3>
                <p>
                  The minimum notice period depends on how long the tenant has been in occupation:
                </p>
                <ul>
                  <li>
                    <strong>Less than 12 months:</strong> At least 4 weeks notice
                  </li>
                  <li>
                    <strong>12 months or more:</strong> At least 8 weeks notice
                  </li>
                  <li>
                    <strong>Certain grounds:</strong> Longer notice periods may apply under the 2022 Act
                  </li>
                </ul>

                <h3>Grounds for Possession</h3>
                <p>
                  Unlike England&apos;s Section 21, Northern Ireland does not have a simple &quot;no-fault&quot;
                  eviction route. Landlords must typically establish grounds for possession, which may
                  include rent arrears, breach of tenancy terms, the landlord requiring the property for
                  their own use, or intention to sell.
                </p>

                <h3>Why a Valid Agreement Matters</h3>
                <p>
                  When you serve a Notice to Quit, the court will examine whether your tenancy agreement
                  complies with NI law, whether you have met your obligations (including providing a
                  written agreement within 28 days and protecting the deposit), and whether the notice
                  itself is valid. A defective agreement can undermine your entire case.
                </p>
              </div>

              <div className="mt-8">
                <Link
                  href="/money-claim-unpaid-rent"
                  className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
                >
                  Learn about recovering unpaid rent through the courts
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Standard vs Premium Section */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Standard vs Premium NI Tenancy Agreement
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Choose the level of protection that suits your letting situation.
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Standard Agreement</h3>
                  <p className="text-2xl font-bold text-primary mb-4">
                    {PRODUCTS.ast_standard.displayPrice}
                  </p>
                  <p className="text-gray-600 mb-6">
                    A complete, legally valid NI tenancy agreement with all essential clauses required
                    for compliance.
                  </p>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>2006 Order and 2022 Act compliant</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>NI deposit protection clauses</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Correct NI notice periods</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Clear rent and payment terms</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Repair responsibilities defined</span>
                    </li>
                  </ul>
                  <Link
                    href={wizardLinkStandard}
                    className="block w-full text-center bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  >
                    Create Standard Agreement
                  </Link>
                </div>

                <div className="bg-white rounded-2xl p-6 border-2 border-primary shadow-lg relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-sm px-3 py-1 rounded-full">
                    Recommended
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Premium Agreement</h3>
                  <p className="text-2xl font-bold text-primary mb-4">
                    {PRODUCTS.ast_premium.displayPrice}
                  </p>
                  <p className="text-gray-600 mb-6">
                    Enhanced protection with additional clauses for complex situations and extra
                    security.
                  </p>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Everything in Standard</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Break clause options</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Guarantor agreement included</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Pet policy clauses</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Garden and parking terms</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Rent review mechanism</span>
                    </li>
                  </ul>
                  <Link
                    href={wizardLinkPremium}
                    className="block w-full text-center bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  >
                    Create Premium Agreement
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <FAQSection
          faqs={niTenancyAgreementFAQs}
          title="Northern Ireland Tenancy Agreement FAQ"
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
                title="Create Your NI Tenancy Agreement Today"
                description="Legally valid. Court-ready. Compliant with NI legislation. Ready in minutes."
              />

              <SeoDisclaimer className="max-w-4xl mx-auto" />
            </div>
          </div>
        </section>

        {/* Related Resources */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <RelatedLinks title="Related Resources" links={niTenancyMainRelatedLinks} />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
