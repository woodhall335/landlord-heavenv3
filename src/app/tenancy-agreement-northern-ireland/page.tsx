import { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import Link from 'next/link';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { SocialProofCounter } from '@/components/ui/SocialProofCounter';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { niTenancyMainRelatedLinks } from '@/lib/seo/internal-links';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { SeoCtaBlock, SeoDisclaimer } from '@/components/seo/SeoCtaBlock';
import { SeoLandingWrapper } from '@/components/seo/SeoLandingWrapper';
import { FAQSection } from '@/components/seo/FAQSection';
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
import { PRODUCTS, TENANCY_AGREEMENT_FROM_PRICE } from '@/lib/pricing/products';

// Page constants for analytics
const PAGE_PATH = '/tenancy-agreement-northern-ireland';
const PAGE_TITLE = 'Tenancy Agreement Northern Ireland';
const PAGE_TYPE = 'tenancy' as const;

// Safe product pricing lookup using existing PRODUCTS object.
// Adjust the fallback order if your repo uses different NI-specific keys.
const productMap = PRODUCTS as Record<string, { displayPrice: string }>;

const standardPrice =
  productMap.tenancy_agreement_standard?.displayPrice ??
  productMap.tenancy_agreement?.displayPrice ??
  productMap.ast_standard?.displayPrice ??
  PRODUCTS.ast_standard.displayPrice;

const premiumPrice =
  productMap.tenancy_agreement_premium?.displayPrice ??
  productMap.tenancy_agreement_plus?.displayPrice ??
  productMap.ast_premium?.displayPrice ??
  PRODUCTS.ast_premium.displayPrice;

const astProductHref = '/products/ast';

export const metadata: Metadata = {
  title: `Northern Ireland Tenancy Agreement 2026 | Create Online ${TENANCY_AGREEMENT_FROM_PRICE}`,
  description:
    `Create a Northern Ireland tenancy agreement online. Written agreement wording for NI private tenancies, updated for current legislation, ${TENANCY_AGREEMENT_FROM_PRICE.toLowerCase()}.`,
  keywords: [
    'tenancy agreement northern ireland',
    'northern ireland tenancy agreement',
    'private tenancy agreement ni',
    'ni tenancy agreement template',
    'landlord tenancy agreement ni',
    'northern ireland rental agreement',
    'private tenancies act northern ireland',
    'create tenancy agreement northern ireland',
    'written tenancy agreement ni',
    'ni landlord agreement',
  ],
  alternates: {
    canonical: 'https://landlordheaven.co.uk/tenancy-agreement-northern-ireland',
  },
  openGraph: {
    title: `Northern Ireland Tenancy Agreement 2026 | Create Online ${TENANCY_AGREEMENT_FROM_PRICE}`,
    description:
      'Create a Northern Ireland tenancy agreement online with current NI-compliant wording and instant download.',
    type: 'website',
    url: 'https://landlordheaven.co.uk/tenancy-agreement-northern-ireland',
  },
  twitter: {
    card: 'summary_large_image',
    title: `Northern Ireland Tenancy Agreement 2026 | Create Online ${TENANCY_AGREEMENT_FROM_PRICE}`,
    description:
      'Create a Northern Ireland tenancy agreement online with current NI-compliant wording and instant download.',
  },
};

const faqs = [
  {
    question: 'What type of tenancy agreement do I need in Northern Ireland?',
    answer:
      'For a private residential letting in Northern Ireland, you need a Northern Ireland-specific private tenancy agreement. You should not use an English AST, Scottish PRT or Welsh Occupation Contract template for a property in Northern Ireland.',
  },
  {
    question: 'Do landlords have to provide a written tenancy agreement in Northern Ireland?',
    answer:
      'Yes. Northern Ireland landlords must provide a written tenancy agreement for a private tenancy. Using an up-to-date NI-specific template helps make sure the agreement contains the right information for the tenancy.',
  },
  {
    question: 'Can I use an England tenancy agreement for a property in Northern Ireland?',
    answer:
      'No. Northern Ireland has its own tenancy legislation and notice framework. Using a template from another UK jurisdiction can create compliance problems and make enforcement harder later.',
  },
  {
    question: 'What should a Northern Ireland tenancy agreement include?',
    answer:
      'It should clearly set out the landlord and tenant details, property address, rent, deposit terms, tenancy start date, payment terms, repair responsibilities, and the relevant Northern Ireland notice and tenancy wording.',
  },
  {
    question: 'Does a Northern Ireland tenancy agreement need deposit wording?',
    answer:
      'Yes. If a deposit is taken, the agreement should deal with the deposit clearly and reflect Northern Ireland deposit protection requirements.',
  },
  {
    question: 'Why is a valid NI tenancy agreement important?',
    answer:
      'A clear, jurisdiction-specific agreement helps reduce disputes, supports compliance, and gives landlords a stronger foundation if rent arrears, possession or other enforcement issues arise later.',
  },
];

export default function TenancyAgreementNorthernIrelandPage() {
  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Tenancy Agreement Northern Ireland',
    description:
      'Create a Northern Ireland tenancy agreement online with wording designed for NI private tenancies.',
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

      <SeoLandingWrapper
        pagePath={PAGE_PATH}
        pageTitle={PAGE_TITLE}
        pageType={PAGE_TYPE}
        jurisdiction="northern-ireland"
      />

      <main className="text-gray-900">
        <UniversalHero
          badge="Northern Ireland Only"
          badgeIcon={<Scale className="w-4 h-4" />}
          title="Tenancy Agreement Northern Ireland"
          subtitle={
            <>
              Create a <strong>Northern Ireland tenancy agreement</strong> with wording designed for
              <strong> NI private tenancies</strong>. Built for current NI landlord requirements,
              with instant download from <strong>{standardPrice}</strong>.
            </>
          }
          primaryCta={{
            label: `Create Standard Agreement — ${standardPrice}`,
            href: astProductHref,
          }}
          secondaryCta={{
            label: `Create Premium Agreement — ${premiumPrice}`,
            href: astProductHref,
          }}
          variant="pastel"
        >
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-700 mt-4">
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Northern Ireland specific
            </span>
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              Written agreement wording included
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-green-500" />
              Ready in minutes
            </span>
          </div>
        </UniversalHero>

        <section className="py-6 bg-gray-50 border-y border-gray-100">
          <div className="container mx-auto px-4">
            <SocialProofCounter variant="total" className="justify-center" />
          </div>
        </section>

        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-10">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                What is a private tenancy agreement in Northern Ireland?
              </h2>
              <p className="text-gray-600 text-center mb-10 max-w-3xl mx-auto">
                Northern Ireland has its own tenancy framework, so landlords need an NI-specific agreement,
                not a template borrowed from England, Scotland or Wales.
              </p>

              <div className="space-y-5 text-gray-700 leading-relaxed">
                <p>
                  A <strong>private tenancy agreement in Northern Ireland</strong> is the written contract
                  between landlord and tenant for the letting of residential property in NI. It sets out
                  the rent, deposit, tenancy dates, responsibilities, notice wording and the practical
                  rules that apply during the tenancy.
                </p>

                <p>
                  Northern Ireland does <strong>not</strong> use the same tenancy framework as England,
                  Scotland or Wales. That means an English AST, Scottish PRT or Welsh Occupation Contract
                  template is not the right document for an NI property.
                </p>

                <p>
                  A good NI tenancy agreement should be clear, practical and drafted for the Northern
                  Ireland legal framework. It should also make the tenancy easier to manage if problems
                  arise later, including rent arrears, deposit disputes or possession issues.
                </p>

                <p>
                  If you are a landlord letting a property in Belfast, Derry/Londonderry, Newry, Lisburn,
                  Bangor or anywhere else in Northern Ireland, the safest route is to use a
                  <strong> Northern Ireland-specific tenancy agreement</strong>.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 bg-amber-50">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-amber-900 mb-2">
                    Do not use templates from other UK jurisdictions
                  </h2>
                  <p className="text-amber-800 mb-4">
                    Northern Ireland tenancy law is separate. Using an England, Scotland or Wales
                    template for an NI property can create the wrong notice wording, the wrong legal
                    references and the wrong expectations for both landlord and tenant.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-amber-200">
                      <h3 className="font-semibold text-amber-900 mb-2">
                        Common problems with the wrong template
                      </h3>
                      <ul className="text-sm text-amber-800 space-y-1">
                        <li>• References the wrong legislation</li>
                        <li>• Uses England-only or Wales-only wording</li>
                        <li>• Misses NI-specific tenancy points</li>
                        <li>• Creates confusion around notices and enforcement</li>
                      </ul>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-amber-200">
                      <h3 className="font-semibold text-amber-900 mb-2">Why that matters</h3>
                      <ul className="text-sm text-amber-800 space-y-1">
                        <li>• More risk of disputes later</li>
                        <li>• Harder to rely on the agreement if problems arise</li>
                        <li>• Poorer foundation for possession or arrears action</li>
                        <li>• Greater compliance risk for landlords</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                How Northern Ireland differs from England
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-3xl mx-auto">
                Landlords often search for an “AST template”, but Northern Ireland works differently.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full bg-white rounded-xl border border-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left p-4 font-semibold text-gray-900">Feature</th>
                      <th className="text-left p-4 font-semibold text-gray-900">Northern Ireland</th>
                      <th className="text-left p-4 font-semibold text-gray-900">England</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr>
                      <td className="p-4 text-gray-700">Typical private tenancy document</td>
                      <td className="p-4 text-gray-900">NI private tenancy agreement</td>
                      <td className="p-4 text-gray-900">AST</td>
                    </tr>
                    <tr>
                      <td className="p-4 text-gray-700">Legal framework</td>
                      <td className="p-4 text-gray-900">Northern Ireland specific</td>
                      <td className="p-4 text-gray-900">England specific</td>
                    </tr>
                    <tr>
                      <td className="p-4 text-gray-700">Notices and possession wording</td>
                      <td className="p-4 text-gray-900">NI-specific notice structure</td>
                      <td className="p-4 text-gray-900">England notice structure</td>
                    </tr>
                    <tr>
                      <td className="p-4 text-gray-700">Deposit and compliance wording</td>
                      <td className="p-4 text-gray-900">Needs NI wording</td>
                      <td className="p-4 text-gray-900">Needs England wording</td>
                    </tr>
                    <tr>
                      <td className="p-4 text-gray-700">Can you reuse the same template?</td>
                      <td className="p-4 text-gray-900">
                        <span className="flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-amber-500" />
                          No
                        </span>
                      </td>
                      <td className="p-4 text-gray-900">
                        <span className="flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-amber-500" />
                          No
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                What your NI tenancy agreement should include
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-3xl mx-auto">
                A strong agreement should do more than fill in names and rent. It should clearly
                set out the tenancy and reduce avoidable disputes later.
              </p>

              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Parties and property details</h3>
                      <p className="text-gray-700 mb-3">
                        The agreement should clearly identify the landlord, tenant and property so
                        there is no ambiguity about who is renting what.
                      </p>
                      <ul className="grid md:grid-cols-2 gap-2 text-sm text-gray-700">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Landlord details
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Tenant details
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Full property address
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Agent details where relevant
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Rent and payment terms</h3>
                      <p className="text-gray-700 mb-3">
                        The rent section should be specific and easy to understand, covering the amount,
                        due date and how payment should be made.
                      </p>
                      <ul className="grid md:grid-cols-2 gap-2 text-sm text-gray-700">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Rent amount
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Payment frequency
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Due date
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Payment method wording
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0">
                      <Shield className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Deposit wording</h3>
                      <p className="text-gray-700 mb-3">
                        If a deposit is taken, the agreement should deal with it clearly and support
                        the landlord’s wider deposit compliance process.
                      </p>
                      <ul className="grid md:grid-cols-2 gap-2 text-sm text-gray-700">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Deposit amount
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Deposit purpose
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Return conditions
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          NI-specific wording
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0">
                      <Home className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Tenancy term and ending the tenancy</h3>
                      <p className="text-gray-700 mb-3">
                        The agreement should explain when the tenancy starts, whether it is fixed-term
                        or periodic, and how the tenancy can be brought to an end under the NI framework.
                      </p>
                      <ul className="grid md:grid-cols-2 gap-2 text-sm text-gray-700">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Start date
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Fixed term wording if relevant
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Notice wording
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          NI-specific termination structure
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0">
                      <BadgeCheck className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Repairs and responsibilities</h3>
                      <p className="text-gray-700 mb-3">
                        Good agreements define who is responsible for what during the tenancy, which
                        can reduce avoidable arguments later.
                      </p>
                      <ul className="grid md:grid-cols-2 gap-2 text-sm text-gray-700">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Landlord repair wording
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Tenant obligations
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Utilities and bills
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Upkeep and maintenance wording
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <p className="mt-8 text-gray-700">
                If you later need help with arrears recovery, see our guide to{' '}
                <Link
                  href="/money-claim-unpaid-rent"
                  className="text-red-600 font-semibold hover:underline"
                >
                  recovering unpaid rent
                </Link>
                .
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <SeoCtaBlock
                pageType="tenancy"
                variant="section"
                pagePath={PAGE_PATH}
                jurisdiction="northern-ireland"
                title="Create Your NI Tenancy Agreement Now"
                description={`Northern Ireland specific wording, instant download, from ${standardPrice}.`}
              />
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-10">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Notice wording and ending a tenancy in Northern Ireland
              </h2>
              <p className="text-gray-600 text-center mb-10 max-w-3xl mx-auto">
                Ending a tenancy in NI is not the same as ending one in England, so the agreement needs
                the right jurisdiction-specific wording from the start.
              </p>

              <div className="space-y-5 text-gray-700 leading-relaxed">
                <p>
                  Northern Ireland landlords should not assume that England-style notice wording or
                  possession language will work for an NI tenancy. The legal framework is different,
                  which is why the underlying agreement should also be Northern Ireland specific.
                </p>

                <p>
                  When disputes arise, one of the first things that matters is whether the original
                  tenancy agreement was properly structured for the property’s jurisdiction. A poor
                  template can weaken the landlord’s position at exactly the wrong time.
                </p>

                <p>
                  This is one of the main reasons to start with a proper NI tenancy agreement rather
                  than a generic “UK rental agreement” downloaded from elsewhere.
                </p>
              </div>

              <div className="mt-8">
                <Link
                  href="/money-claim-unpaid-rent"
                  className="inline-flex items-center gap-2 text-red-600 font-medium hover:underline"
                >
                  Learn about recovering unpaid rent
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Standard vs Premium NI Tenancy Agreement
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-3xl mx-auto">
                Choose the level of protection and detail that suits your letting situation.
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-sm text-gray-900">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Standard Agreement</h3>
                  <p className="text-2xl font-bold text-red-600 mb-4">{standardPrice}</p>
                  <p className="text-gray-700 mb-6">
                    A complete NI tenancy agreement for many straightforward private lets.
                  </p>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-2 text-gray-700">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Northern Ireland specific wording</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Rent and deposit clauses</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Tenancy term wording</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Repair and responsibility terms</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Clear written agreement format</span>
                    </li>
                  </ul>
                  <Link
                    href={astProductHref}
                    className="block w-full text-center bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
                  >
                    Create Standard Agreement
                  </Link>
                </div>

                <div className="bg-white rounded-2xl p-6 border-2 border-red-200 shadow-lg relative text-gray-900">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 text-white text-sm px-3 py-1 rounded-full">
                    Recommended
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Premium Agreement</h3>
                  <p className="text-2xl font-bold text-red-700 mb-4">{premiumPrice}</p>
                  <p className="text-gray-700 mb-6">
                    More detailed protection for landlords who want broader coverage and extra clauses.
                  </p>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-2 text-gray-700">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Everything in Standard</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Added flexibility and extra clauses</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Better suited to more complex lettings</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Useful where more detailed landlord controls are needed</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Stronger drafting for real-world letting scenarios</span>
                    </li>
                  </ul>
                  <Link
                    href={astProductHref}
                    className="block w-full text-center bg-red-700 text-white py-3 rounded-lg font-medium hover:bg-red-800 transition-colors"
                  >
                    Create Premium Agreement
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <FAQSection
          faqs={faqs}
          title="Northern Ireland Tenancy Agreement FAQ"
          showContactCTA={false}
          variant="gray"
        />

        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <SeoCtaBlock
                pageType="tenancy"
                variant="final"
                pagePath={PAGE_PATH}
                jurisdiction="northern-ireland"
                title="Create Your NI Tenancy Agreement Today"
                description={`Northern Ireland specific. Instant download. From ${standardPrice}.`}
              />

              <SeoDisclaimer className="max-w-4xl mx-auto" />
            </div>
          </div>
        </section>

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
