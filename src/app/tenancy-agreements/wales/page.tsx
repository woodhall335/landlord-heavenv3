import type { Metadata } from 'next';
import Link from 'next/link';
import { FAQSection } from '@/components/seo/FAQSection';
import { getCanonicalUrl } from '@/lib/seo/urls';

const PRICE_VALID_UNTIL = '2026-12-31';

export const metadata: Metadata = {
  title: 'Occupation Contract Wales 2026 | From £14.99',
  description: 'Create a legally compliant Occupation Contract for Wales under the Renting Homes (Wales) Act 2016. Updated for 2026. From £14.99.',
  keywords: 'occupation contract Wales, renting homes Wales act 2016, Welsh tenancy agreement, standard occupation contract, secure occupation contract, Wales landlord, Welsh rental agreement',
  openGraph: {
    title: 'Occupation Contract Wales 2026 | From £14.99',
    description: 'Create a legally compliant Occupation Contract for Wales. Updated for 2026. Standard (£14.99) and Premium (£24.99) options.',
    type: 'website',
    url: getCanonicalUrl('/wales-tenancy-agreement-template'),
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
        name: 'What is an Occupation Contract in Wales?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'An Occupation Contract is the legal agreement used for renting homes in Wales since December 2022, replacing the old AST system. It is governed by the Renting Homes (Wales) Act 2016 and gives contract-holders (tenants) clearer rights and protections.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the difference between Standard and Secure Occupation Contracts?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Standard Occupation Contracts are used by private landlords and give possession rights similar to the old AST. Secure Occupation Contracts are mainly used by local authorities and housing associations, offering stronger security of tenure.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do I need to provide a written statement?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Under the Renting Homes (Wales) Act 2016, landlords must provide a written statement of the occupation contract within 14 days of the occupation date. Failure to do so can result in restrictions on serving possession notices.',
        },
      },
      {
        '@type': 'Question',
        name: 'What notice period is required to end an Occupation Contract in Wales?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'For a no-fault possession notice (Section 173), landlords must give at least 6 months notice after the first 6 months of occupation. This is longer than the 2 months required under the old AST system in England.',
        },
      },
      {
        '@type': 'Question',
        name: 'Are deposits still required to be protected in Wales?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Deposits must still be protected in an authorised tenancy deposit scheme within 30 days. The same three schemes operate in Wales as in England: DPS, MyDeposits, and TDS.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I use an AST for a property in Wales?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. Since 1 December 2022, all new tenancies in Wales must use Occupation Contracts under the Renting Homes (Wales) Act 2016. ASTs are only valid for properties in England.',
        },
      },
    ],
  };

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Occupation Contract - Wales',
    description: 'Legally compliant Occupation Contract for Wales under Renting Homes (Wales) Act 2016',
    image: 'https://landlordheaven.co.uk/og-image.png',
    offers: [
      {
        '@type': 'Offer',
        name: 'Standard Occupation Contract',
        price: '14.99',
        priceCurrency: 'GBP',
        priceValidUntil: PRICE_VALID_UNTIL,
        availability: 'https://schema.org/InStock',
        shippingDetails: {
          '@type': 'OfferShippingDetails',
          shippingRate: { '@type': 'MonetaryAmount', value: '0', currency: 'GBP' },
          shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'GB' },
          deliveryTime: {
            '@type': 'ShippingDeliveryTime',
            handlingTime: { '@type': 'QuantitativeValue', minValue: '0', maxValue: '0', unitCode: 'MIN' },
            transitTime: { '@type': 'QuantitativeValue', minValue: '0', maxValue: '0', unitCode: 'MIN' },
          },
        },
        hasMerchantReturnPolicy: {
          '@type': 'MerchantReturnPolicy',
          applicableCountry: 'GB',
          returnPolicyCategory: 'https://schema.org/MerchantReturnNotPermitted',
        },
      },
      {
        '@type': 'Offer',
        name: 'Premium Occupation Contract',
        price: '14.99',
        priceCurrency: 'GBP',
        priceValidUntil: PRICE_VALID_UNTIL,
        availability: 'https://schema.org/InStock',
        shippingDetails: {
          '@type': 'OfferShippingDetails',
          shippingRate: { '@type': 'MonetaryAmount', value: '0', currency: 'GBP' },
          shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'GB' },
          deliveryTime: {
            '@type': 'ShippingDeliveryTime',
            handlingTime: { '@type': 'QuantitativeValue', minValue: '0', maxValue: '0', unitCode: 'MIN' },
            transitTime: { '@type': 'QuantitativeValue', minValue: '0', maxValue: '0', unitCode: 'MIN' },
          },
        },
        hasMerchantReturnPolicy: {
          '@type': 'MerchantReturnPolicy',
          applicableCountry: 'GB',
          returnPolicyCategory: 'https://schema.org/MerchantReturnNotPermitted',
        },
      },
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
        item: 'https://landlordheaven.co.uk/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Tenancy Agreements',
        item: 'https://landlordheaven.co.uk/products/ast',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Wales',
        item: 'https://landlordheaven.co.uk/wales-tenancy-agreement-template',
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="min-h-screen bg-gradient-to-br from-red-50 via-red-100 to-red-50 pt-20">
        {/* Breadcrumb Navigation */}
        <div className="container mx-auto px-4 py-4">
          <nav className="text-sm text-gray-600">
            <Link href="/" className="hover:text-red-600">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/products/ast" className="hover:text-red-600">Tenancy Agreements</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">Wales</span>
          </nav>
        </div>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-4">
              <img src="/gb-wls.svg" alt="Wales" className="w-12 h-12" />
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Occupation Contract
              <span className="block text-3xl text-red-600 mt-2">Wales (Cymru)</span>
            </h1>
            <p className="text-xl text-gray-700 mb-4">
              Create a legally compliant Occupation Contract under the <strong>Renting Homes (Wales) Act 2016</strong>.
            </p>
            <p className="text-lg text-gray-600 mb-8">
              Since December 2022, all new tenancies in Wales use Occupation Contracts, not ASTs.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/wizard?product=ast_standard&src=product_page&topic=tenancy&jurisdiction=wales"
                className="hero-btn-secondary"
              >
                Create Standard Contract - £14.99
              </Link>
              <Link
                href="/wizard?product=ast_premium&src=product_page&topic=tenancy&jurisdiction=wales"
                className="hero-btn-primary"
              >
                Create Premium Contract - £24.99
              </Link>
            </div>
          </div>
        </section>

        {/* What is an Occupation Contract */}
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">What is an Occupation Contract?</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                An <strong>Occupation Contract</strong> is the legal agreement introduced by the <strong>Renting Homes (Wales) Act 2016</strong>, which came into force on 1 December 2022. It replaces the previous tenancy types including Assured Shorthold Tenancies (ASTs) for all new lettings in Wales.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Under this system, tenants are called <strong>contract-holders</strong> and landlords are called <strong>landlords</strong>. The Act aims to simplify renting in Wales and give contract-holders clearer rights.
              </p>

              <div className="bg-red-50 border-l-4 border-red-600 p-6 my-6">
                <h3 className="text-xl font-semibold text-red-900 mb-2">Key Differences from England</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li><strong>6-month notice period</strong> for no-fault evictions (vs 2 months in England)</li>
                  <li><strong>Written statement required</strong> within 14 days of occupation</li>
                  <li><strong>Contract-holder terminology</strong> instead of tenant</li>
                  <li><strong>Fitness for human habitation</strong> requirements are stronger</li>
                  <li><strong>Joint contract-holders</strong> can leave without ending the whole contract</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Types of Occupation Contract */}
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Types of Occupation Contract</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="border-l-4 border-red-600 pl-6 py-4">
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">Standard Occupation Contract</h3>
                <p className="text-gray-700 mb-4">
                  Used by <strong>private landlords</strong>. This is the equivalent of the old AST and is what most private rentals in Wales will use.
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>6-month minimum notice for no-fault possession</li>
                  <li>Can include a fixed term or be periodic</li>
                  <li>Landlord can recover possession using Section 173 or Section 181 notices</li>
                </ul>
              </div>

              <div className="border-l-4 border-green-600 pl-6 py-4">
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">Secure Occupation Contract</h3>
                <p className="text-gray-700 mb-4">
                  Used by <strong>local authorities and housing associations</strong>. Offers stronger security of tenure.
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Greater security - harder to evict</li>
                  <li>Succession rights to family members</li>
                  <li>Right to exchange with other secure contract-holders</li>
                </ul>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
              <p className="text-blue-900 font-semibold">
                Private landlords should use <strong>Standard Occupation Contracts</strong>. Our wizard generates the correct contract type for your situation.
              </p>
            </div>
          </div>
        </section>

        {/* Welsh Tenancy Law */}
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Welsh Tenancy Law</h2>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-red-600 text-white">
                    <th className="border border-gray-300 px-4 py-3 text-left">Legislation</th>
                    <th className="border border-gray-300 px-4 py-3 text-left">Key Provisions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3 font-semibold">
                      Renting Homes (Wales) Act 2016
                    </td>
                    <td className="border border-gray-300 px-4 py-3">
                      Primary legislation for all occupation contracts in Wales. Replaced ASTs from December 2022.
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3 font-semibold">
                      Section 173 Notice
                    </td>
                    <td className="border border-gray-300 px-4 py-3">
                      No-fault possession notice. Minimum 6 months notice, can't be served in first 6 months.
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3 font-semibold">
                      Section 181 Notice
                    </td>
                    <td className="border border-gray-300 px-4 py-3">
                      Possession for breach of contract (rent arrears, anti-social behaviour, etc.)
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3 font-semibold">
                      Fitness for Human Habitation
                    </td>
                    <td className="border border-gray-300 px-4 py-3">
                      Landlords must ensure properties meet 29 matters of fitness including damp, heating, and ventilation.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="container mx-auto px-4 py-12 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Choose Your Contract Package</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Standard Contract</h3>
                <p className="text-4xl font-bold text-red-600 mb-4">£14.99</p>
                <ul className="space-y-2 text-gray-700 mb-6">
                  <li>✓ Renting Homes Act 2016 compliant</li>
                  <li>✓ Written statement included</li>
                  <li>✓ Fundamental and supplementary terms</li>
                  <li>✓ Deposit protection clause</li>
                  <li>✓ Fitness for habitation terms</li>
                </ul>
                <Link
                  href="/wizard?product=ast_standard&src=product_page&topic=tenancy&jurisdiction=wales"
                  className="block text-center bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                >
                  Create Standard Contract
                </Link>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-primary">
                <div className="inline-block bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold mb-2">
                  RECOMMENDED
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Premium Contract</h3>
                <p className="text-4xl font-bold text-primary mb-4">£14.99</p>
                <ul className="space-y-2 text-gray-700 mb-6">
                  <li>✓ Everything in Standard PLUS:</li>
                  <li>✓ Comprehensive inventory section</li>
                  <li>✓ Additional supplementary terms</li>
                  <li>✓ Professional formatting</li>
                  <li>✓ Enhanced compliance information</li>
                  <li className="font-semibold text-primary">✓ Covers HMOs (Houses in Multiple Occupation)</li>
                </ul>
                <Link
                  href="/wizard?product=ast_premium&src=product_page&topic=tenancy&jurisdiction=wales"
                  className="block text-center bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
                >
                  Create Premium Contract
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <FAQSection
          title="Frequently Asked Questions"
          faqs={[
            {
              question: "Can I use an AST for my Welsh property?",
              answer: "No. Since 1 December 2022, all new tenancies in Wales must use Occupation Contracts under the Renting Homes (Wales) Act 2016. ASTs are only valid for properties in England."
            },
            {
              question: "What notice do I need to give to end a contract?",
              answer: "For a Section 173 (no-fault) notice, you must give at least 6 months notice and cannot serve it during the first 6 months of occupation. This is significantly longer than England's 2-month notice period."
            },
            {
              question: "Do I need to provide a written statement?",
              answer: "Yes. You must provide a written statement of the occupation contract within 14 days of the occupation date. Our contract includes this. Failure to provide it can restrict your ability to serve possession notices."
            },
            {
              question: "What happens to existing ASTs in Wales?",
              answer: "Existing ASTs that were in place before 1 December 2022 automatically converted to Standard Occupation Contracts. The core terms remained the same, but the new Welsh law now applies."
            }
          ]}
          showContactCTA={false}
          variant="white"
        />

        {/* Related Links */}
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Related Links</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Link href="/occupation-contract-template-wales" className="block p-5 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                Occupation Contract Template Wales
              </Link>
              <Link href="/renting-homes-wales-written-statement" className="block p-5 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                Written Statement Guide
              </Link>
              <Link href="/standard-occupation-contract-wales" className="block p-5 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                Standard Occupation Contract
              </Link>
              <Link href="/wales-tenancy-agreement-template" className="block p-5 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                Wales Tenancy Template Guide
              </Link>
              <Link href="/wales-eviction-notices" className="block p-5 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                Wales eviction guide
              </Link>
              <Link href="/ask-heaven" className="block p-5 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                Ask Heaven (free landlord Q&amp;A)
              </Link>
            </div>
          </div>
        </section>

        {/* Other Jurisdictions */}
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Other UK Jurisdictions</h2>
            <p className="text-gray-700 mb-6">
              Each UK nation has its own tenancy legislation. Make sure you use the correct agreement for your property location.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <Link href="/assured-shorthold-tenancy-agreement-template" className="block p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <img src="/gb-eng.svg" alt="England" className="w-8 h-8 mb-2" />
                <h3 className="font-semibold text-gray-900">England</h3>
                <p className="text-sm text-gray-600">Assured Shorthold Tenancy (AST)</p>
              </Link>
              <Link href="/private-residential-tenancy-agreement-template" className="block p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <img src="/gb-sct.svg" alt="Scotland" className="w-8 h-8 mb-2" />
                <h3 className="font-semibold text-gray-900">Scotland</h3>
                <p className="text-sm text-gray-600">Private Residential Tenancy (PRT)</p>
              </Link>
              <Link href="/northern-ireland-tenancy-agreement-template" className="block p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <img src="/gb-nir.svg" alt="Northern Ireland" className="w-8 h-8 mb-2" />
                <h3 className="font-semibold text-gray-900">Northern Ireland</h3>
                <p className="text-sm text-gray-600">Private Tenancy Agreement</p>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto bg-red-600 rounded-2xl shadow-2xl p-12 text-center text-white">
            <h2 className="text-4xl font-bold mb-4">Ready to Create Your Occupation Contract?</h2>
            <p className="text-xl mb-8 opacity-90">
              Fully compliant with the Renting Homes (Wales) Act 2016. Instant download.
            </p>
            <div className="flex gap-6 justify-center flex-wrap">
              <Link
                href="/wizard?product=ast_standard&src=product_page&topic=tenancy&jurisdiction=wales"
                className="bg-white text-red-600 px-8 py-4 rounded-lg font-semibold hover:bg-red-50 transition-colors text-lg shadow-lg"
              >
                Standard Contract - £14.99
              </Link>
              <Link
                href="/wizard?product=ast_premium&src=product_page&topic=tenancy&jurisdiction=wales"
                className="bg-yellow-400 text-gray-900 px-8 py-4 rounded-lg font-semibold hover:bg-yellow-300 transition-colors text-lg shadow-lg"
              >
                Premium Contract - £14.99
              </Link>
            </div>
            <p className="mt-6 text-sm opacity-75">
              Instant download • Legally compliant • No subscription required
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
