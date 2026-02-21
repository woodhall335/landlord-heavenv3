import type { Metadata } from 'next';
import Link from 'next/link';
import { getCanonicalUrl } from '@/lib/seo/urls';

const PRICE_VALID_UNTIL = '2026-12-31';

export const metadata: Metadata = {
  title: 'Assured Shorthold Tenancy Agreement (AST) England 2026 | From £14.99',
  description: 'Create a legally compliant AST for England. Updated for 2026 with Housing Act 1988 and Tenant Fees Act 2019 compliance. From £14.99.',
  keywords: 'AST, Assured Shorthold Tenancy, tenancy agreement England, AST agreement, residential tenancy UK, landlord forms, rental agreement, housing act 1988, tenant fees act 2019',
  openGraph: {
    title: 'Assured Shorthold Tenancy Agreement (AST) England 2026 | From £14.99',
    description: 'Create a legally compliant AST for England. Updated for 2026. Standard (£14.99) and Premium (£24.99) options.',
    type: 'website',
    url: getCanonicalUrl('/assured-shorthold-tenancy-agreement-template'),
  },
  alternates: {
    canonical: getCanonicalUrl('/assured-shorthold-tenancy-agreement-template'),
  },
};

export default function EnglandASTPage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Is an Assured Shorthold Tenancy Agreement legally valid?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Our AST agreements are drafted to comply with the Housing Act 1988, Landlord and Tenant Act 1985, Tenant Fees Act 2019, and all current England tenancy legislation. Both Standard and Premium versions are legally binding when properly executed.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I edit the tenancy agreement after downloading?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Our wizard collects all necessary information upfront to generate a complete, ready-to-sign agreement. If you need to make changes after generation, you can create a new agreement through the wizard or use a Lease Addendum for minor modifications.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the difference between Standard and Premium AST agreements?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The Standard AST (£14.99) covers all legal essentials for a compliant tenancy. The Premium AST (£24.99) adds comprehensive inventory sections, exhaustive terms and conditions (13 detailed clauses), professional gradient styling, rights of change clauses, and enhanced legal compliance information boxes.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I use this for lodgers or live-in landlords?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. AST agreements are for self-contained properties where the landlord does not live in the same building. For lodgers (where you share facilities with your tenant), you need a Lodger Agreement which creates a licence to occupy, not a tenancy.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do all tenants need to be named on the agreement?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. All adults who will be living in the property as tenants must be named on the AST. They all sign the agreement and become jointly and severally liable for rent and obligations. Occupants (such as children or visiting relatives) do not need to be named.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does the agreement include the How to Rent guide?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The AST agreement itself does not include the How to Rent guide, but our wizard asks if you have provided it. You must provide the latest version of the How to Rent guide to your tenants before they sign the AST - this is a legal requirement in England.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the maximum deposit I can charge?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Under the Tenant Fees Act 2019: For annual rent under £50,000, maximum deposit is 5 weeks rent. For annual rent of £50,000 or more, maximum deposit is 6 weeks rent. Our wizard automatically validates your deposit amount against these limits.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I include a rent increase clause?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Our wizard asks if you want to include a rent increase clause and how frequently rent can be reviewed (e.g., annually). Any rent increase must follow proper procedures under Section 13 of the Housing Act 1988, with proper notice given to tenants.',
        },
      },
    ],
  };

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Assured Shorthold Tenancy Agreement (AST) - England',
    description: 'Legally compliant AST agreement for England under Housing Act 1988',
    image: 'https://landlordheaven.co.uk/og-image.png',
    offers: [
      {
        '@type': 'Offer',
        name: 'Standard AST',
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
        name: 'Premium AST',
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
        name: 'England',
        item: 'https://landlordheaven.co.uk/assured-shorthold-tenancy-agreement-template',
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

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-purple-100 to-purple-50 pt-20">
        {/* Breadcrumb Navigation */}
        <div className="container mx-auto px-4 py-4">
          <nav className="text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/products/ast" className="hover:text-blue-600">Tenancy Agreements</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">England</span>
          </nav>
        </div>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-4">
              <img src="/gb-eng.svg" alt="England" className="w-12 h-12" />
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Assured Shorthold Tenancy Agreement (AST)
              <span className="block text-3xl text-blue-600 mt-2">England</span>
            </h1>
            <p className="text-xl text-gray-700 mb-8">
              Create a legally compliant Assured Shorthold Tenancy Agreement in minutes. Fully compliant with the Housing Act 1988, Tenant Fees Act 2019, and all current England legislation.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/wizard?product=ast_standard&src=product_page&topic=tenancy&jurisdiction=england"
                className="hero-btn-secondary"
              >
                Create Standard AST - £14.99
              </Link>
              <Link
                href="/wizard?product=ast_premium&src=product_page&topic=tenancy&jurisdiction=england"
                className="hero-btn-primary"
              >
                Create Premium AST - £24.99
              </Link>
            </div>
          </div>
        </section>

        {/* What is an AST Section */}
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">What is an Assured Shorthold Tenancy Agreement?</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                An <strong>Assured Shorthold Tenancy (AST)</strong> is the most common type of residential tenancy agreement used in England. It is a legal contract between a landlord and tenant(s) that grants the tenant(s) the right to occupy a property for a specified period, typically 6 or 12 months, with the option to renew or continue on a periodic (rolling) basis.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                ASTs are governed by the <strong>Housing Act 1988</strong> (as amended by the Housing Act 1996) and provide both landlords and tenants with important legal protections and obligations.
              </p>
              <div className="bg-red-50 border-l-4 border-red-600 p-6 my-6">
                <h3 className="text-xl font-semibold text-red-900 mb-2">Important: Wales Has Different Rules</h3>
                <p className="text-gray-700">
                  Since December 2022, Wales uses <strong>Occupation Contracts</strong> under the Renting Homes (Wales) Act 2016, not ASTs. If your property is in Wales, please use our <Link href="/wales-tenancy-agreement-template" className="text-red-700 font-semibold hover:underline">Wales Occupation Contract</Link> instead.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* England Residential Tenancy Laws */}
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">England Residential Tenancy Laws</h2>
            <p className="text-gray-700 mb-6">
              Assured Shorthold Tenancies in England are governed by comprehensive legislation that protects both landlords and tenants.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-blue-600 text-white">
                    <th className="border border-gray-300 px-4 py-3 text-left">Legislation</th>
                    <th className="border border-gray-300 px-4 py-3 text-left">Key Provisions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3 font-semibold">
                      Housing Act 1988<br />
                      <span className="text-sm font-normal text-gray-600">(as amended)</span>
                    </td>
                    <td className="border border-gray-300 px-4 py-3">
                      Defines AST tenancies, grounds for possession, Section 21 and Section 8 procedures
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3 font-semibold">Tenant Fees Act 2019</td>
                    <td className="border border-gray-300 px-4 py-3">
                      Caps deposits (5-6 weeks), bans most tenant fees
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3 font-semibold">Deregulation Act 2015</td>
                    <td className="border border-gray-300 px-4 py-3">
                      Section 21 requirements, retaliatory eviction protections
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3 font-semibold">EICR Regulations 2020</td>
                    <td className="border border-gray-300 px-4 py-3">
                      Electrical safety inspections every 5 years
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-amber-50 border-l-4 border-amber-600 p-6 mt-6">
              <h3 className="text-xl font-semibold text-amber-900 mb-2">Renters Reform Bill (Pending)</h3>
              <p className="text-gray-700">
                The UK Government has proposed the <strong>Renters (Reform) Bill</strong> which will abolish Section 21 evictions in England. Our agreements will be updated when the Bill becomes law.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="container mx-auto px-4 py-12 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Choose Your AST Package</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Standard AST</h3>
                <p className="text-4xl font-bold text-blue-600 mb-4">£14.99</p>
                <ul className="space-y-2 text-gray-700 mb-6">
                  <li>✓ All legal essentials included</li>
                  <li>✓ Housing Act 1988 compliant</li>
                  <li>✓ Tenant Fees Act 2019 compliant</li>
                  <li>✓ Deposit protection clause</li>
                  <li>✓ Standard terms & conditions</li>
                </ul>
                <Link
                  href="/wizard?product=ast_standard&src=product_page&topic=tenancy&jurisdiction=england"
                  className="hero-btn-secondary block text-center"
                >
                  Create Standard AST
                </Link>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-primary">
                <div className="inline-block bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold mb-2">
                  RECOMMENDED
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Premium AST</h3>
                <p className="text-4xl font-bold text-primary mb-4">£14.99</p>
                <ul className="space-y-2 text-gray-700 mb-6">
                  <li>✓ Everything in Standard PLUS:</li>
                  <li>✓ Comprehensive inventory section</li>
                  <li>✓ 13 detailed terms & conditions</li>
                  <li>✓ Professional gradient styling</li>
                  <li>✓ Rights of change clauses</li>
                  <li>✓ Enhanced legal compliance boxes</li>
                  <li className="font-semibold text-primary">✓ Covers HMOs (Houses in Multiple Occupation)</li>
                </ul>
                <Link
                  href="/wizard?product=ast_premium&src=product_page&topic=tenancy&jurisdiction=england"
                  className="hero-btn-primary block text-center"
                >
                  Create Premium AST
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Related Links */}
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Related Links</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Link href="/assured-shorthold-tenancy-agreement-template" className="block p-5 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                AST Template Guide 2026
              </Link>
              <Link href="/ast-template-england" className="block p-5 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                England AST Template
              </Link>
              <Link href="/joint-tenancy-agreement-template" className="block p-5 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                Joint Tenancy Agreement Template
              </Link>
              <Link href="/tenancy-agreement-template-free" className="block p-5 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                Free vs Paid Templates Comparison
              </Link>
              <Link href="/how-to-evict-tenant#england" className="block p-5 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                England eviction guide
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
              <Link href="/wales-tenancy-agreement-template" className="block p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <img src="/gb-wls.svg" alt="Wales" className="w-8 h-8 mb-2" />
                <h3 className="font-semibold text-gray-900">Wales</h3>
                <p className="text-sm text-gray-600">Occupation Contracts under Renting Homes Act 2016</p>
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
          <div className="max-w-4xl mx-auto bg-primary rounded-2xl shadow-2xl p-12 text-center text-white">
            <h2 className="text-4xl font-bold mb-4">Ready to Create Your AST Agreement?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of England landlords who trust Landlord Heaven for legally compliant tenancy agreements.
            </p>
            <div className="flex gap-6 justify-center flex-wrap">
              <Link
                href="/wizard?product=ast_standard&src=product_page&topic=tenancy&jurisdiction=england"
                className="hero-btn-secondary"
              >
                Standard AST - £14.99
              </Link>
              <Link
                href="/wizard?product=ast_premium&src=product_page&topic=tenancy&jurisdiction=england"
                className="hero-btn-primary"
              >
                Premium AST - £14.99
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
