import type { Metadata } from 'next';
import Link from 'next/link';
import { FAQSection } from '@/components/seo/FAQSection';
import { TenancyPackSection } from '@/components/value-proposition';
import { getCanonicalUrl } from '@/lib/seo/urls';
import { buildMerchantOffer } from '@/lib/seo/structured-data';
import {
  PRODUCT_PRICE_AMOUNT_STRINGS,
  PRODUCTS,
  TENANCY_AGREEMENT_FROM_PRICE,
} from '@/lib/pricing/products';

const PRICE_VALID_UNTIL = '2026-12-31';
const standardPrice = PRODUCTS.ast_standard.displayPrice;
const premiumPrice = PRODUCTS.ast_premium.displayPrice;

export const metadata: Metadata = {
  title: `Wales Occupation Contract 2026 | Tenancy Agreement Template from ${TENANCY_AGREEMENT_FROM_PRICE}`,
  description:
    `Plain-English landlord guide to creating a Wales Occupation Contract online, with Renting Homes (Wales) Act wording, written statement support, and pricing from ${TENANCY_AGREEMENT_FROM_PRICE}.`,
  keywords: [
    'wales occupation contract',
    'occupation contract wales',
    'wales tenancy agreement',
    'wales tenancy agreement template',
    'welsh tenancy agreement',
    'welsh rental agreement',
    'standard occupation contract wales',
    'renting homes wales act 2016',
    'written statement wales',
    'wales landlord contract',
  ],
  openGraph: {
    title: `Wales Occupation Contract 2026 | Tenancy Agreement Template from ${TENANCY_AGREEMENT_FROM_PRICE}`,
    description:
      'Landlord guide to creating a Wales Occupation Contract with written statement wording, current Welsh compliance, and clearer route choice.',
    type: 'website',
    url: getCanonicalUrl('/wales-tenancy-agreement-template'),
  },
  twitter: {
    card: 'summary_large_image',
    title: `Wales Occupation Contract 2026 | Tenancy Agreement Template from ${TENANCY_AGREEMENT_FROM_PRICE}`,
    description:
      'Create a Wales Occupation Contract template online with written statement wording and instant download.',
  },
  alternates: {
    canonical: getCanonicalUrl('/wales-tenancy-agreement-template'),
  },
};

export default function WalesOccupationContractPage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What tenancy agreement do I need for a property in Wales?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'For a residential property in Wales, you usually need an Occupation Contract under the Renting Homes (Wales) Act 2016. Private landlords will generally use a Standard Occupation Contract rather than an English AST.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I use an English AST for a property in Wales?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. Since 1 December 2022, new Welsh tenancies use Occupation Contracts under Welsh law. An English AST is not the correct agreement for a property in Wales.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do I need to provide a written statement in Wales?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Landlords must provide a written statement of the occupation contract within 14 days of the occupation date. Failing to do so can affect possession rights and compliance.',
        },
      },
      {
        '@type': 'Question',
        name: 'How much notice is required for a no-fault notice in Wales?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'For a Section 173 no-fault possession notice, landlords must usually give at least 6 months notice and cannot normally serve it during the first 6 months of occupation.',
        },
      },
      {
        '@type': 'Question',
        name: 'Are deposits still protected in Wales?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Deposits must be protected in an authorised tenancy deposit scheme within 30 days, with the required prescribed information provided to the contract-holder.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the difference between a Standard and Secure Occupation Contract?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Standard Occupation Contracts are generally used by private landlords. Secure Occupation Contracts are mainly used by local authorities and housing associations and usually provide stronger security of tenure.',
        },
      },
    ],
  };

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Wales Occupation Contract Template',
    description:
      'Legally compliant Wales Occupation Contract template under the Renting Homes (Wales) Act 2016.',
    image: 'https://landlordheaven.co.uk/og-image.png',
    offers: [
      buildMerchantOffer({
        name: 'Standard Occupation Contract',
        price: PRODUCT_PRICE_AMOUNT_STRINGS.ast_standard,
        priceValidUntil: PRICE_VALID_UNTIL,
        url: getCanonicalUrl('/wales-tenancy-agreement-template'),
      }),
      buildMerchantOffer({
        name: 'Premium Occupation Contract',
        price: PRODUCT_PRICE_AMOUNT_STRINGS.ast_premium,
        priceValidUntil: PRICE_VALID_UNTIL,
        url: getCanonicalUrl('/wales-tenancy-agreement-template'),
      }),
    ],
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: getCanonicalUrl('/'),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Tenancy Agreements',
        item: getCanonicalUrl('/products/ast'),
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Wales Occupation Contract',
        item: getCanonicalUrl('/wales-tenancy-agreement-template'),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="min-h-screen bg-gradient-to-br from-red-50 via-red-100 to-red-50 pt-20 text-gray-900">
        {/* Breadcrumb Navigation */}
        <div className="container mx-auto px-4 py-4">
          <nav className="text-sm text-gray-600">
            <Link href="/" className="hover:text-red-600">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link href="/tenancy-agreements" className="hover:text-red-600">
              Tenancy Agreements
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">Wales Occupation Contract</span>
          </nav>
        </div>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-5xl mx-auto text-center">
            <div className="flex justify-center mb-4">
              <img src="/gb-wls.svg" alt="Wales flag" className="w-12 h-12" />
            </div>

            <div className="inline-flex items-center rounded-full bg-red-100 px-4 py-2 text-sm font-semibold text-red-800 mb-5">
              Updated for 2026 • Renting Homes (Wales) Act 2016 compliant
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Wales Occupation Contract Template
            </h1>

            <p className="text-xl text-gray-700 mb-4 max-w-4xl mx-auto">
              Create a <strong>Wales tenancy agreement template</strong> that complies with the{' '}
              <strong>Renting Homes (Wales) Act 2016</strong>, including the{' '}
              <strong>written statement</strong> wording required for Welsh landlords.
            </p>

            <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
              Since 1 December 2022, new residential tenancies in Wales use{' '}
              <strong>Occupation Contracts</strong>, not English ASTs.
            </p>

            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/wizard?product=ast_standard&jurisdiction=wales&src=wales_tenancy_hub&topic=tenancy"
                className="inline-flex items-center justify-center rounded-lg border-2 border-red-600 bg-white px-6 py-3 font-semibold text-red-600 shadow-sm transition-colors hover:bg-red-50"
              >
                {`Create Standard Contract - ${standardPrice}`}
              </Link>
              <Link
                href="/wizard?product=ast_premium&jurisdiction=wales&src=wales_tenancy_hub&topic=tenancy"
                className="inline-flex items-center justify-center rounded-lg bg-red-600 px-6 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-red-700"
              >
                {`Create Premium Contract - ${premiumPrice}`}
              </Link>
            </div>

            <p className="mt-4 text-sm text-gray-600">
              Instant download • Written statement included • No subscription required
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 py-12">
          <TenancyPackSection
            defaultJurisdiction="wales"
            lockJurisdiction
            intro="You get more than a Wales occupation contract. Landlord Heaven builds a practical Welsh tenancy pack with the contract, setup documents, and preview-before-payment flow so you are not left adapting a generic file by hand."
          />
        </section>

        {/* Intro / What is it */}
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              What is a Wales Occupation Contract Template?
            </h2>

            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                A <strong>Wales Occupation Contract</strong> is the legal agreement used for
                residential lettings in Wales. It replaced the old AST-based system for new Welsh
                tenancies when the <strong>Renting Homes (Wales) Act 2016</strong> came into force
                on <strong>1 December 2022</strong>.
              </p>

              <p>
                In Wales, tenants are called <strong>contract-holders</strong>. Private landlords
                will usually use a <strong>Standard Occupation Contract</strong>, while local
                authorities and housing associations more commonly use <strong>Secure Occupation
                Contracts</strong>.
              </p>

              <p>
                If you are looking for a <strong>tenancy agreement for a property in Wales</strong>,
                this is the correct legal framework. An English AST should not be used for a Welsh
                property.
              </p>
            </div>

            <div className="bg-red-50 border-l-4 border-red-600 p-6 mt-8">
              <h3 className="text-xl font-semibold text-red-900 mb-2">
                Key differences from England
              </h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>
                  <strong>Occupation Contracts</strong> are used in Wales instead of ASTs
                </li>
                <li>
                  <strong>Written statement required</strong> within 14 days of occupation
                </li>
                <li>
                  <strong>Section 173</strong> no-fault notice rules differ from England
                </li>
                <li>
                  <strong>Contract-holder</strong> terminology replaces tenant terminology
                </li>
                <li>
                  <strong>Fitness for human habitation</strong> duties are stronger and more explicit
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Who is this for */}
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Who needs this Wales tenancy agreement template?
            </h2>

            <div className="grid md:grid-cols-2 gap-6 text-gray-700">
              <div className="rounded-lg border border-gray-200 p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Private landlords</h3>
                <p>
                  Suitable for landlords creating a new tenancy agreement for a residential property
                  in Wales, whether the arrangement is fixed-term or periodic.
                </p>
              </div>

              <div className="rounded-lg border border-gray-200 p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Letting agents</h3>
                <p>
                  Useful for agents who need compliant Welsh tenancy paperwork with the correct
                  Occupation Contract wording and written statement structure.
                </p>
              </div>

              <div className="rounded-lg border border-gray-200 p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Landlords moving from ASTs</h3>
                <p>
                  Ideal if you previously used England-focused AST templates and now need a
                  Wales-specific contract for new Welsh tenancies.
                </p>
              </div>

              <div className="rounded-lg border border-gray-200 p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Standard contract users</h3>
                <p>
                  Most private sector landlords in Wales need a <strong>Standard Occupation
                  Contract</strong>, which our wizard is designed to generate.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* When to use */}
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              When should you use a Wales Occupation Contract?
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              <ul className="list-disc list-inside text-gray-700 space-y-3">
                <li>Starting a new tenancy for a property in Wales</li>
                <li>Creating a fixed-term Standard Occupation Contract</li>
                <li>Creating a periodic Welsh tenancy agreement</li>
                <li>Replacing an outdated England AST workflow for Welsh properties</li>
              </ul>

              <ul className="list-disc list-inside text-gray-700 space-y-3">
                <li>Preparing the required written statement wording</li>
                <li>Setting out rent, deposit and occupation details clearly</li>
                <li>Making sure the contract reflects Welsh terminology and rules</li>
                <li>Reducing compliance mistakes before the tenancy starts</li>
              </ul>
            </div>

            <p className="mt-6 text-gray-700">
              You can also review our guidance on{' '}
              <Link
                href="/renting-homes-wales-written-statement"
                className="text-red-600 font-semibold hover:underline"
              >
                written statement requirements in Wales
              </Link>{' '}
              and our page on the{' '}
              <Link
                href="/standard-occupation-contract-wales"
                className="text-red-600 font-semibold hover:underline"
              >
                Standard Occupation Contract
              </Link>
              .
            </p>
          </div>
        </section>

        {/* Wales vs England */}
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Wales Occupation Contract vs England AST
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 bg-white">
                <thead>
                  <tr className="bg-red-600 text-white">
                    <th className="border border-gray-300 px-4 py-3 text-left text-white">Topic</th>
                    <th className="border border-gray-300 px-4 py-3 text-left text-white">England</th>
                    <th className="border border-gray-300 px-4 py-3 text-left text-white">Wales</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3 font-semibold text-gray-900">
                      Main agreement type
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">
                      Assured Shorthold Tenancy (AST)
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">
                      Occupation Contract
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3 font-semibold text-gray-900">
                      Private sector contract
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">
                      AST
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">
                      Standard Occupation Contract
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3 font-semibold text-gray-900">
                      Written statement
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">
                      Not part of the Welsh Occupation Contract regime
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">
                      Mandatory within 14 days
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3 font-semibold text-gray-900">
                      No-fault possession route
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">
                      Different English framework
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">
                      Section 173 rules apply in Wales
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3 font-semibold text-gray-900">
                      Tenant terminology
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">
                      Tenant
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">
                      Contract-holder
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3 font-semibold text-gray-900">
                      Primary legislation
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">
                      England housing legislation
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">
                      Renting Homes (Wales) Act 2016
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="mt-6 text-gray-700">
              If you need possession paperwork later, see our guide to{' '}
              <Link
                href="/wales-eviction-notices"
                className="text-red-600 font-semibold hover:underline"
              >
                Welsh eviction notices
              </Link>
              .
            </p>
          </div>
        </section>

        {/* What's included */}
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              What does this Wales Occupation Contract include?
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-lg border border-gray-200 p-6">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Core legal content</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Written statement wording</li>
                  <li>Fundamental terms</li>
                  <li>Supplementary terms</li>
                  <li>Rent and payment clauses</li>
                  <li>Deposit wording and key contract details</li>
                </ul>
              </div>

              <div className="rounded-lg border border-gray-200 p-6">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Practical landlord coverage</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Landlord and contract-holder details</li>
                  <li>Property and occupation date details</li>
                  <li>Clauses suitable for private Welsh lettings</li>
                  <li>Wording aligned with Welsh legal terminology</li>
                  <li>Instant downloadable output after completion</li>
                </ul>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
              <p className="text-blue-900 font-semibold">
                Looking for more detail? See our{' '}
                <Link
                  href="/occupation-contract-template-wales"
                  className="underline hover:no-underline"
                >
                  Occupation Contract Template Wales
                </Link>{' '}
                guide for related information and terminology.
              </p>
            </div>
          </div>
        </section>

        {/* Common mistakes */}
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Common mistakes Welsh landlords make
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-lg bg-red-50 border border-red-200 p-6">
                <h3 className="text-xl font-semibold text-red-900 mb-3">
                  Using an English AST in Wales
                </h3>
                <p className="text-gray-700">
                  A property in Wales should not be documented with an England-focused AST template.
                  That is one of the most common avoidable compliance mistakes.
                </p>
              </div>

              <div className="rounded-lg bg-red-50 border border-red-200 p-6">
                <h3 className="text-xl font-semibold text-red-900 mb-3">
                  Missing the written statement deadline
                </h3>
                <p className="text-gray-700">
                  Landlords must provide the written statement within 14 days of the occupation
                  date. Delays can affect enforcement options later.
                </p>
              </div>

              <div className="rounded-lg bg-red-50 border border-red-200 p-6">
                <h3 className="text-xl font-semibold text-red-900 mb-3">
                  Assuming England notice rules apply
                </h3>
                <p className="text-gray-700">
                  Welsh possession routes, including Section 173 and Section 181, work differently
                  from England. The contract needs to reflect the Welsh legal framework.
                </p>
              </div>

              <div className="rounded-lg bg-red-50 border border-red-200 p-6">
                <h3 className="text-xl font-semibold text-red-900 mb-3">
                  Using generic templates with missing Welsh wording
                </h3>
                <p className="text-gray-700">
                  Generic tenancy agreement templates often fail to deal properly with
                  contract-holder terminology, written statements and Welsh-specific rules.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Documents landlords also need */}
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              What documents do landlords also need to provide in Wales?
            </h2>

            <p className="text-gray-700 mb-6">
              Your Occupation Contract is only part of the compliance picture. Depending on the
              property and circumstances, landlords may also need to provide:
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Written statement of the occupation contract</li>
                <li>Deposit protection prescribed information</li>
                <li>Energy Performance Certificate (EPC)</li>
              </ul>

              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Gas Safety Certificate where applicable</li>
                <li>Electrical safety documentation where required</li>
                <li>Any notices or compliance information relevant to the tenancy</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="container mx-auto px-4 py-12 bg-gray-50">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Choose your contract package
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-gray-200 text-gray-900">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Standard Contract</h3>
                <p className="text-4xl font-bold text-red-600 mb-4">{standardPrice}</p>
                <ul className="space-y-2 text-gray-700 mb-6">
                  <li>✓ Renting Homes (Wales) Act 2016 compliant wording</li>
                  <li>✓ Written statement included</li>
                  <li>✓ Fundamental and supplementary terms</li>
                  <li>✓ Deposit wording</li>
                  <li>✓ Suitable for most private Welsh landlords</li>
                </ul>
                <Link
                  href="/wizard?product=ast_standard&jurisdiction=wales&src=wales_tenancy_hub&topic=tenancy"
                  className="block text-center bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                >
                  Create Standard Contract
                </Link>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-red-200 text-gray-900">
                <div className="inline-block bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold mb-2">
                  RECOMMENDED
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Premium Contract</h3>
                <p className="text-4xl font-bold text-red-700 mb-4">{premiumPrice}</p>
                <ul className="space-y-2 text-gray-700 mb-6">
                  <li>✓ Everything in Standard plus</li>
                  <li>✓ Comprehensive inventory section</li>
                  <li>✓ Additional supplementary terms</li>
                  <li>✓ Enhanced compliance information</li>
                  <li className="font-semibold text-red-700">
                    ✓ Helpful for more complex lets and HMOs
                  </li>
                </ul>
                <Link
                  href="/wizard?product=ast_premium&jurisdiction=wales&src=wales_tenancy_hub&topic=tenancy"
                  className="block text-center bg-red-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-800 transition-colors"
                >
                  Create Premium Contract
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <FAQSection
          showTrustPositioningBar
          title="Frequently Asked Questions"
          faqs={[
            {
              question: 'What tenancy agreement do I need for a property in Wales?',
              answer:
                'For a property in Wales, private landlords will usually need a Standard Occupation Contract under the Renting Homes (Wales) Act 2016, rather than an English AST.',
            },
            {
              question: 'Can I use an AST for my Welsh property?',
              answer:
                'No. Since 1 December 2022, new Welsh tenancies use Occupation Contracts. ASTs are for England, not Wales.',
            },
            {
              question: 'Do I need to provide a written statement?',
              answer:
                'Yes. Landlords must provide a written statement of the occupation contract within 14 days of the occupation date. Failure to do so can affect compliance and possession rights.',
            },
            {
              question: 'What notice do I need to give to end a contract?',
              answer:
                'For a Section 173 no-fault notice, landlords must usually give at least 6 months notice and cannot normally serve it during the first 6 months of occupation.',
            },
            {
              question: 'What happens to existing ASTs in Wales?',
              answer:
                'ASTs that were already in place before 1 December 2022 converted into Occupation Contracts under Welsh law, with the Welsh legal framework then applying to them.',
            },
            {
              question: 'Are deposits still protected in Wales?',
              answer:
                'Yes. Deposits must still be protected in an authorised tenancy deposit scheme within 30 days, with prescribed information given to the contract-holder.',
            },
          ]}
          showContactCTA={false}
          variant="white"
        />

        {/* Related Links */}
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Related Links</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Link
                href="/occupation-contract-template-wales"
                className="block p-5 border border-gray-200 rounded-lg text-gray-900 hover:shadow-md transition-shadow"
              >
                Occupation Contract Template Wales
              </Link>
              <Link
                href="/renting-homes-wales-written-statement"
                className="block p-5 border border-gray-200 rounded-lg text-gray-900 hover:shadow-md transition-shadow"
              >
                Written Statement Guide
              </Link>
              <Link
                href="/standard-occupation-contract-wales"
                className="block p-5 border border-gray-200 rounded-lg text-gray-900 hover:shadow-md transition-shadow"
              >
                Standard Occupation Contract
              </Link>
              <Link
                href="/wales-tenancy-agreement-template"
                className="block p-5 border border-gray-200 rounded-lg text-gray-900 hover:shadow-md transition-shadow"
              >
                Wales Tenancy Template Guide
              </Link>
              <Link
                href="/wales-eviction-notices"
                className="block p-5 border border-gray-200 rounded-lg text-gray-900 hover:shadow-md transition-shadow"
              >
                Wales eviction guide
              </Link>
              <Link
                href="/ask-heaven"
                className="block p-5 border border-gray-200 rounded-lg text-gray-900 hover:shadow-md transition-shadow"
              >
                Ask Heaven (free landlord Q&amp;A)
              </Link>
            </div>
          </div>
        </section>

        {/* Other Jurisdictions */}
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Other UK Jurisdictions</h2>
            <p className="text-gray-700 mb-6">
              Each UK nation has its own tenancy legislation. Make sure you use the correct
              agreement for your property location.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <Link
                href="/assured-shorthold-tenancy-agreement-template"
                className="block p-6 border border-gray-200 rounded-lg text-gray-900 hover:shadow-md transition-shadow"
              >
                <img src="/gb-eng.svg" alt="England" className="w-8 h-8 mb-2" />
                <h3 className="font-semibold text-gray-900">England</h3>
                <p className="text-sm text-gray-600">Assured Shorthold Tenancy (AST)</p>
              </Link>
              <Link
                href="/private-residential-tenancy-agreement-template"
                className="block p-6 border border-gray-200 rounded-lg text-gray-900 hover:shadow-md transition-shadow"
              >
                <img src="/gb-sct.svg" alt="Scotland" className="w-8 h-8 mb-2" />
                <h3 className="font-semibold text-gray-900">Scotland</h3>
                <p className="text-sm text-gray-600">Private Residential Tenancy (PRT)</p>
              </Link>
              <Link
                href="/northern-ireland-tenancy-agreement-template"
                className="block p-6 border border-gray-200 rounded-lg text-gray-900 hover:shadow-md transition-shadow"
              >
                <img src="/gb-nir.svg" alt="Northern Ireland" className="w-8 h-8 mb-2" />
                <h3 className="font-semibold text-gray-900">Northern Ireland</h3>
                <p className="text-sm text-gray-600">Private Tenancy Agreement</p>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-5xl mx-auto bg-red-600 rounded-2xl shadow-2xl p-12 text-center text-white">
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to create your Wales Occupation Contract?
            </h2>
            <p className="text-xl text-red-50 mb-8">
              Fully compliant with the Renting Homes (Wales) Act 2016. Instant download.
            </p>
            <div className="flex gap-6 justify-center flex-wrap">
              <Link
                href="/wizard?product=ast_standard&jurisdiction=wales&src=wales_tenancy_hub&topic=tenancy"
                className="bg-white text-red-600 px-8 py-4 rounded-lg font-semibold hover:bg-red-50 transition-colors text-lg shadow-lg"
              >
                {`Standard Contract - ${standardPrice}`}
              </Link>
              <Link
                href="/wizard?product=ast_premium&jurisdiction=wales&src=wales_tenancy_hub&topic=tenancy"
                className="bg-yellow-400 text-gray-900 px-8 py-4 rounded-lg font-semibold hover:bg-yellow-300 transition-colors text-lg shadow-lg"
              >
                {`Premium Contract - ${premiumPrice}`}
              </Link>
            </div>
            <p className="mt-6 text-sm text-red-100">
              Instant download • Legally compliant • No subscription required
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
