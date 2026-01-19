import type { Metadata } from 'next';
import Link from 'next/link';
import { getCanonicalUrl } from '@/lib/seo/urls';
import { FAQSection } from '@/components/marketing/FAQSection';

export const metadata: Metadata = {
  title: 'Private Tenancy Agreement Northern Ireland 2026 | From £9.99',
  description: 'Create a legally compliant Private Tenancy Agreement for Northern Ireland. Updated for 2026 with Private Tenancies Act (NI) 2022 and 2025 EICR rules. From £9.99.',
  keywords: 'Private Tenancy Northern Ireland, NI tenancy agreement, Private Tenancies Act 2022, Northern Ireland rental agreement, EICR 2025, landlord NI, rental property Northern Ireland',
  openGraph: {
    title: 'Private Tenancy Agreement Northern Ireland 2026 | From £9.99',
    description: 'Create a legally compliant Private Tenancy Agreement for NI. Updated for 2026 with 2025 EICR requirements and rent increase restrictions.',
    type: 'website',
    url: getCanonicalUrl('/tenancy-agreements/northern-ireland'),
  },
  alternates: {
    canonical: getCanonicalUrl('/tenancy-agreements/northern-ireland'),
  },
};

export default function NorthernIrelandTenancyPage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Is a Private Tenancy Agreement legally valid in Northern Ireland?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Our Private Tenancy Agreements are drafted to comply with the Private Tenancies Order (Northern Ireland) 2006, Private Tenancies Act (Northern Ireland) 2022, and all 2025 legal updates including mandatory EICR requirements. Both Standard and Premium versions are legally binding.',
        },
      },
      {
        '@type': 'Question',
        name: 'What changed in Northern Ireland tenancy law in 2025?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'From 1 April 2025, key changes include: Electrical Installation Condition Reports (EICR) are now mandatory for all private tenancies, rent increases limited to once per year with 12-month gap, 3 months notice required for rent increases, and length-based notice periods for ending tenancies (28/56/84 days).',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the maximum deposit I can charge in Northern Ireland?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'In Northern Ireland, the maximum deposit is 2 months rent. Our wizard automatically validates your deposit amount to ensure compliance with NI law. Deposits must be protected in an approved tenancy deposit scheme.',
        },
      },
      {
        '@type': 'Question',
        name: 'How often can I increase rent in Northern Ireland?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'From 2025, landlords can increase rent once per year with a minimum 12-month gap between increases. You must give 3 months written notice of any rent increase. Tenants have the right to challenge excessive increases.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do I need a written tenancy agreement in Northern Ireland?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'A written agreement is strongly recommended and makes compliance, deposit protection, and dispute resolution far easier. Our wizard generates a complete written Private Tenancy Agreement with the required terms for Northern Ireland.',
        },
      },
    ],
  };

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Private Tenancy Agreement (Northern Ireland)',
    description: 'Legally compliant Private Tenancy Agreement for Northern Ireland',
    image: 'https://landlordheaven.co.uk/og-image.png',
    offers: [
      {
        '@type': 'Offer',
        name: 'Standard Private Tenancy',
        price: '9.99',
        priceCurrency: 'GBP',
        priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
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
        name: 'Premium Private Tenancy',
        price: '14.99',
        priceCurrency: 'GBP',
        priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
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
        item: getCanonicalUrl('/'),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Tenancy Agreements',
        item: getCanonicalUrl('/tenancy-agreements'),
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Northern Ireland',
        item: getCanonicalUrl('/tenancy-agreements/northern-ireland'),
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
            <Link href="/" className="hover:text-red-600">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/tenancy-agreements" className="hover:text-red-600">Tenancy Agreements</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">Northern Ireland</span>
          </nav>
        </div>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Private Tenancy Agreement
              <span className="block text-3xl text-red-600 mt-2">Northern Ireland</span>
            </h1>
            <p className="text-xl text-gray-700 mb-4">
              Create a legally compliant Private Tenancy Agreement for Northern Ireland in minutes. Fully updated for 2025 including mandatory EICR requirements, rent increase restrictions, and all current NI legislation.
            </p>
            <div className="bg-amber-100 border-l-4 border-primary-600 p-4 mb-8 text-left">
              <p className="text-sm font-semibold text-primary-900">
                ✨ <strong>2025 Updates Included:</strong> Mandatory EICR from 1 April 2025 • 12-month gap between rent increases • 3-month notice for rent increases • Length-based notice periods
              </p>
            </div>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/wizard?product=ast_standard&src=product_page&topic=tenancy&jurisdiction=northern-ireland"
                className="hero-btn-secondary"
              >
                Create Standard - £9.99
              </Link>
              <Link
                href="/wizard?product=ast_premium&src=product_page&topic=tenancy&jurisdiction=northern-ireland"
                className="hero-btn-primary"
              >
                Create Premium - £14.99
              </Link>
            </div>
          </div>
        </section>

        {/* 2025 Legal Updates Highlight */}
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto bg-primary text-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold mb-4">🆕 2025 Legal Updates for Northern Ireland</h2>
            <p className="text-lg mb-6">
              Important changes came into effect on <strong>1 April 2025</strong> affecting all private tenancies in Northern Ireland:
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white/10 backdrop-blur rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-2">⚡ Mandatory EICR Certificates</h3>
                <p className="text-sm">
                  All private rental properties must have a valid <strong>Electrical Installation Condition Report (EICR)</strong> conducted by a qualified electrician. Required every 5 years or at each change of tenancy.
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-2">💰 Rent Increase Restrictions</h3>
                <p className="text-sm">
                  Rent increases limited to <strong>once per year</strong> with a minimum <strong>12-month gap</strong> between increases. Landlords must give <strong>3 months' written notice</strong> of any increase.
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-2">📅 Length-Based Notice Periods</h3>
                <p className="text-sm">
                  Notice to Quit periods now based on tenancy length: <strong>28 days</strong> (under 1 year), <strong>56 days</strong> (1-10 years), <strong>84 days</strong> (10+ years).
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-2">🏠 Enhanced Tenant Protections</h3>
                <p className="text-sm">
                  Stronger protections against retaliatory evictions, improved complaint procedures, and clearer requirements for landlord obligations and property standards.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* What is a Private Tenancy Section */}
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">What is a Private Tenancy Agreement?</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                A <strong>Private Tenancy Agreement</strong> is the standard form of tenancy agreement for private residential lettings in Northern Ireland. It is a legal contract between a landlord and tenant(s) that sets out the terms under which the tenant rents the property, including rent amount, deposit, tenancy duration, and the rights and responsibilities of both parties.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Private tenancies in Northern Ireland are primarily governed by the <strong>Private Tenancies Order (Northern Ireland) 2006</strong> and the <strong>Private Tenancies Act (Northern Ireland) 2022</strong>, with significant updates taking effect from <strong>1 April 2025</strong>.
              </p>
              <div className="bg-red-50 border-l-4 border-red-600 p-6 my-6">
                <h3 className="text-xl font-semibold text-red-900 mb-2">Key Features of NI Private Tenancies</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li><strong>Fixed-term or Periodic:</strong> Can be fixed (e.g., 6 or 12 months) or periodic (rolling month-to-month)</li>
                  <li><strong>Deposit Protection:</strong> Maximum 2 months' rent, must be protected in approved scheme</li>
                  <li><strong>EICR Mandatory (2025):</strong> Electrical safety certificates required from 1 April 2025</li>
                  <li><strong>Rent Increase Limits (2025):</strong> Once per year, 12-month gap, 3 months' notice</li>
                  <li><strong>Length-Based Notice:</strong> Notice periods vary by tenancy duration (28/56/84 days)</li>
                  <li><strong>Landlord Registration:</strong> Not currently required in NI (unlike Scotland)</li>
                </ul>
              </div>
              <div className="bg-blue-50 border-l-4 border-blue-600 p-6 my-6">
                <h3 className="text-xl font-semibold text-blue-900 mb-2">Alternative Names</h3>
                <p className="text-gray-700">
                  Private Tenancy Agreements in Northern Ireland may also be referred to as:
                </p>
                <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
                  <li>Private Tenancy Agreement (NI)</li>
                  <li>Residential Tenancy Agreement (Northern Ireland)</li>
                  <li>Rental Agreement</li>
                  <li>Letting Agreement</li>
                  <li>Fixed-Term Tenancy (if applicable)</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Northern Ireland Tenancy Laws */}
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Northern Ireland Residential Tenancy Laws</h2>
            <p className="text-gray-700 mb-6">
              Private tenancies in Northern Ireland are governed by specific legislation that provides protections and obligations for both landlords and tenants. Recent updates in 2025 have significantly strengthened tenant protections and landlord responsibilities.
            </p>

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
                      Private Tenancies Act (Northern Ireland) 2022<br />
                      <span className="text-sm font-normal text-gray-600">(2025 Updates)</span>
                    </td>
                    <td className="border border-gray-300 px-4 py-3">
                      • <strong>Mandatory EICR from 1 April 2025</strong><br />
                      • Rent increases limited to once per year with 12-month gap<br />
                      • 3 months' written notice required for rent increases<br />
                      • Length-based notice periods (28/56/84 days)<br />
                      • Enhanced tenant protections against retaliatory eviction
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3 font-semibold">
                      Private Tenancies Order (Northern Ireland) 2006
                    </td>
                    <td className="border border-gray-300 px-4 py-3">
                      • Establishes framework for private tenancies<br />
                      • Tenancy deposit protection requirements<br />
                      • Notice to Quit procedures<br />
                      • Tenant rights and landlord obligations<br />
                      • Maximum deposit cap (2 months' rent)
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3 font-semibold">
                      Landlord and Tenant Law Amendment Act (Ireland) 1860<br />
                      <span className="text-sm font-normal text-gray-600">(Deasy's Act)</span>
                    </td>
                    <td className="border border-gray-300 px-4 py-3">
                      • Basic landlord-tenant relationship framework<br />
                      • Contract principles for tenancies<br />
                      • Historic foundation for NI tenancy law
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3 font-semibold">
                      Gas Safety (Installation and Use) Regulations 1998
                    </td>
                    <td className="border border-gray-300 px-4 py-3">
                      • Annual gas safety checks required for all gas appliances<br />
                      • Gas Safety Certificate (CP12) must be provided to tenants<br />
                      • Applies to NI as in rest of UK
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3 font-semibold">
                      Electrical Equipment (Safety) Regulations 2016<br />
                      <span className="text-sm font-normal text-gray-600">(2025 EICR Requirement)</span>
                    </td>
                    <td className="border border-gray-300 px-4 py-3">
                      • <strong>EICR mandatory from 1 April 2025</strong><br />
                      • Inspection required every 5 years or at tenancy change<br />
                      • Copy must be provided to tenants<br />
                      • All electrical installations must be safe and tested
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3 font-semibold">
                      Smoke Alarm Regulations (Northern Ireland) 2012
                    </td>
                    <td className="border border-gray-300 px-4 py-3">
                      • Working smoke alarms required on every floor<br />
                      • Carbon monoxide detectors in rooms with solid fuel appliances<br />
                      • Landlord must ensure alarms are working at start of tenancy
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3 font-semibold">
                      Energy Performance of Buildings (Certificates and Inspections) Regulations (NI) 2008
                    </td>
                    <td className="border border-gray-300 px-4 py-3">
                      • Valid Energy Performance Certificate (EPC) required<br />
                      • Must be provided to prospective tenants before viewing<br />
                      • Minimum energy efficiency standards apply
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3 font-semibold">
                      Houses in Multiple Occupation Act (NI) 2016
                    </td>
                    <td className="border border-gray-300 px-4 py-3">
                      • HMO licensing requirements for shared properties<br />
                      • Higher standards for fire safety, facilities, and management<br />
                      • Council enforcement and inspection powers
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-primary-50 border-l-4 border-primary-600 p-6 mt-6">
              <h3 className="text-xl font-semibold text-primary-900 mb-2">Tenancy Deposit Schemes in Northern Ireland</h3>
              <p className="text-gray-700 mb-3">
                All deposits must be protected in a government-approved scheme within <strong>28 days</strong> of receipt:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li><strong>TDS Northern Ireland</strong> (Tenancy Deposit Scheme)</li>
                <li><strong>MyDeposits Northern Ireland</strong></li>
              </ul>
              <p className="text-gray-700 mt-3">
                Failure to protect the deposit can result in the landlord being unable to serve a Notice to Quit and potential penalties.
              </p>
            </div>
          </div>
        </section>

        {/* Types of Tenancy Agreements */}
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Types of Tenancy Agreements in Northern Ireland</h2>

            <div className="space-y-6">
              <div className="border-l-4 border-red-600 pl-6">
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">1. Fixed-Term Tenancy</h3>
                <p className="text-gray-700 mb-2">
                  A tenancy with a specific end date (commonly 6 or 12 months). Most common type for initial lettings in Northern Ireland.
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li><strong>Certainty:</strong> Both parties know the tenancy duration upfront</li>
                  <li><strong>Stability:</strong> Tenant can't be asked to leave before end date (unless breach)</li>
                  <li><strong>Renewal:</strong> Can be renewed for another fixed term or become periodic</li>
                  <li><strong>Early Termination:</strong> Only possible with break clause or mutual agreement</li>
                </ul>
              </div>

              <div className="border-l-4 border-green-600 pl-6">
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">2. Periodic (Rolling) Tenancy</h3>
                <p className="text-gray-700 mb-2">
                  A tenancy that runs week-to-week or month-to-month with no fixed end date. Often created when a fixed-term expires.
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li><strong>Flexibility:</strong> Either party can end with proper notice</li>
                  <li><strong>Notice Periods:</strong> Length-based (28/56/84 days depending on tenancy duration)</li>
                  <li><strong>Continuous:</strong> Same terms as original fixed-term agreement continue</li>
                </ul>
              </div>

              <div className="border-l-4 border-purple-600 pl-6">
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">3. Joint Tenancy</h3>
                <p className="text-gray-700 mb-2">
                  Multiple tenants share the same tenancy agreement with joint and several liability.
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li><strong>Joint liability:</strong> All tenants equally responsible for full rent and obligations</li>
                  <li><strong>Common use:</strong> House shares, couples, flatmates</li>
                  <li><strong>Ending:</strong> Complex if one tenant wants to leave mid-tenancy</li>
                </ul>
              </div>

              <div className="border-l-4 border-orange-600 pl-6">
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">4. Tenancy with Break Clause</h3>
                <p className="text-gray-700 mb-2">
                  A fixed-term tenancy that includes a clause allowing early termination after a minimum period.
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li><strong>Flexibility:</strong> Exit option without breaching contract</li>
                  <li><strong>Notice Required:</strong> Typically 1-2 months to activate break clause</li>
                  <li><strong>Mutual or One-Sided:</strong> Can apply to landlord, tenant, or both</li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
                <h3 className="text-xl font-semibold text-blue-900 mb-3">Notice Periods: 2025 Length-Based Rules</h3>
                <p className="text-gray-700 mb-3">
                  From 2025, Notice to Quit periods in Northern Ireland are based on how long the tenancy has lasted:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li><strong>Under 1 year:</strong> Minimum <strong>28 days</strong> notice</li>
                  <li><strong>1 to 10 years:</strong> Minimum <strong>56 days</strong> notice (8 weeks)</li>
                  <li><strong>Over 10 years:</strong> Minimum <strong>84 days</strong> notice (12 weeks)</li>
                </ul>
                <p className="text-gray-700 mt-3">
                  These apply to landlords ending periodic tenancies. Tenants generally need to give notice as specified in the agreement (commonly 1 month).
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="container mx-auto px-4 py-12 bg-gradient-to-br from-purple-50 via-purple-100 to-purple-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Benefits of a Written Tenancy Agreement</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-red-600">
                <div className="text-4xl mb-4">📜</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">2025 Legal Compliance</h3>
                <p className="text-gray-700">
                  Our agreements are fully updated for 2025, including mandatory EICR requirements, rent increase restrictions, and length-based notice periods. Demonstrates full compliance with current NI law.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-green-600">
                <div className="text-4xl mb-4">💰</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Financial Clarity</h3>
                <p className="text-gray-700">
                  Clear terms on rent amount, payment dates, deposit (max 2 months' rent), permitted charges, and rent increase procedures (once per year, 12-month gap, 3 months' notice).
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-purple-600">
                <div className="text-4xl mb-4">⚖️</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Dispute Evidence</h3>
                <p className="text-gray-700">
                  Written agreements provide clear evidence for courts, deposit protection schemes, and the Northern Ireland Housing Executive. Essential for resolving disputes about rent, repairs, or deposit deductions.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-orange-600">
                <div className="text-4xl mb-4">🔒</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Deposit Protection</h3>
                <p className="text-gray-700">
                  Clearly states deposit amount (maximum 2 months' rent), chosen protection scheme (TDS NI or MyDeposits NI), and procedures for deductions. Protects both landlord and tenant interests.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-blue-600">
                <div className="text-4xl mb-4">🏠</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Property Standards</h3>
                <p className="text-gray-700">
                  Documents compliance with safety requirements: gas safety certificate, EICR (from 2025), EPC, smoke alarms. Clarifies landlord's repair and maintenance obligations.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-indigo-600">
                <div className="text-4xl mb-4">📋</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Professional Standard</h3>
                <p className="text-gray-700">
                  A comprehensive, professional agreement builds tenant confidence, demonstrates professionalism, and sets clear expectations for a positive landlord-tenant relationship.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Who Should Use Section */}
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Who Should Use a Private Tenancy Agreement?</h2>

            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-3xl">
                  🏠
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Private Landlords in Northern Ireland</h3>
                  <p className="text-gray-700">
                    Individual property owners renting out residential properties in NI. Our agreements ensure compliance with the Private Tenancies Act 2022 and all 2025 updates including mandatory EICR requirements.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="shrink-0 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl">
                  🏢
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Letting Agents and Property Managers</h3>
                  <p className="text-gray-700">
                    Agents managing properties on behalf of landlords need up-to-date, compliant agreements. Our templates include all 2025 legal requirements and can be used across your portfolio.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="shrink-0 w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-3xl">
                  🔑
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">First-Time Landlords</h3>
                  <p className="text-gray-700">
                    New landlords benefit from our comprehensive wizard which guides you through all NI-specific requirements including EICR certificates, deposit protection, rent increase rules, and notice periods.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="shrink-0 w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-3xl">
                  💼
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Portfolio Landlords</h3>
                  <p className="text-gray-700">
                    Landlords with multiple NI properties need consistent, legally compliant agreements across their portfolio. Our templates ensure standardization and compliance with 2025 regulations.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-primary-50 border-l-4 border-primary-600 p-6 mt-8">
              <h3 className="text-xl font-semibold text-primary-900 mb-2">When NOT to Use a Private Tenancy Agreement</h3>
              <p className="text-gray-700 mb-3">These agreements are NOT suitable for:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li><strong>Lodgers:</strong> Use a Licence Agreement when the landlord lives in the same property</li>
                <li><strong>Social Housing:</strong> Housing Executive and housing associations use different tenancy types</li>
                <li><strong>Holiday Lets:</strong> Short-term holiday rentals require different documentation</li>
                <li><strong>Commercial Properties:</strong> Use a Commercial Lease for business premises</li>
                <li><strong>Agricultural Tenancies:</strong> Farms and agricultural land have specific legislation</li>
              </ul>
            </div>
          </div>
        </section>

        {/* How to Create Section */}
        <section className="container mx-auto px-4 py-12 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">How to Create a Private Tenancy Agreement</h2>

            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <p className="text-gray-700 text-lg mb-6">
                Our intelligent wizard guides you through creating a comprehensive NI Private Tenancy Agreement in approximately 10-15 minutes. We ask 70+ questions to ensure your agreement is complete and compliant with 2025 regulations.
              </p>

              <h3 className="text-2xl font-semibold text-gray-900 mb-4">NI-Specific Information You'll Provide:</h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">2025 EICR Certificate</h4>
                      <p className="text-sm text-gray-600">Confirmation that you have a valid Electrical Installation Condition Report (mandatory from 1 April 2025)</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="shrink-0 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Property Details</h4>
                      <p className="text-sm text-gray-600">Full address, property type, bedrooms, furnished status, white goods included</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="shrink-0 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Deposit Information</h4>
                      <p className="text-sm text-gray-600">Deposit amount (max 2 months' rent), chosen scheme (TDS NI or MyDeposits NI)</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="shrink-0 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold">4</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Tenancy Period</h4>
                      <p className="text-sm text-gray-600">Fixed-term or periodic, start date, end date (if fixed), break clause options</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="shrink-0 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold">5</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Rent Details</h4>
                      <p className="text-sm text-gray-600">Rent amount, payment frequency, first payment date, rent increase clause (once per year, 12-month gap)</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="shrink-0 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold">6</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Safety Certificates</h4>
                      <p className="text-sm text-gray-600">Gas safety (CP12), EICR, EPC rating, smoke alarms, CO detectors</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="shrink-0 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold">7</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Utilities & Services</h4>
                      <p className="text-sm text-gray-600">Who pays rates, utilities, water, TV licence, internet</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold">8</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Landlord & Tenant Details</h4>
                      <p className="text-sm text-gray-600">Full names, addresses, contact details (supports multiple tenants for joint tenancies)</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="shrink-0 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold">9</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Permitted Occupants</h4>
                      <p className="text-sm text-gray-600">Pets allowed, maximum occupants, children, overnight guests policy</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="shrink-0 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold">10</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Maintenance & Repairs</h4>
                      <p className="text-sm text-gray-600">Landlord responsibilities, garden maintenance, repairs reporting, emergency contacts</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="shrink-0 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold">11</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Property Condition</h4>
                      <p className="text-sm text-gray-600">Inventory provided, professional cleaning requirements, decoration condition</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="shrink-0 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold">12</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Additional Terms</h4>
                      <p className="text-sm text-gray-600">Subletting policy, insurance requirements, communal areas, parking</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="shrink-0 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold">13</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Access & Inspections</h4>
                      <p className="text-sm text-gray-600">Notice period for landlord access, inspection frequency, end-of-tenancy viewings</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="shrink-0 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold">14</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Notice Periods</h4>
                      <p className="text-sm text-gray-600">Length-based notice (28/56/84 days), tenant notice period, break clause details</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-primary text-white rounded-xl shadow-lg p-8">
              <h3 className="text-2xl font-semibold mb-4">Two Options to Suit Your Needs</h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white/10 backdrop-blur rounded-lg p-6">
                  <h4 className="text-xl font-bold mb-3">Standard - £9.99</h4>
                  <ul className="space-y-2 text-sm">
                    <li>✓ All legal essentials for NI tenancies</li>
                    <li>✓ 2025 legal updates (EICR, rent restrictions)</li>
                    <li>✓ Length-based notice periods</li>
                    <li>✓ Deposit protection clauses</li>
                    <li>✓ Standard terms & conditions</li>
                    <li>✓ Clear, professional formatting</li>
                  </ul>
                  <Link
                    href="/wizard?product=ast_standard&src=product_page&topic=tenancy&jurisdiction=northern-ireland"
                    className="mt-4 block text-center bg-white text-red-600 px-6 py-3 rounded-lg font-semibold hover:bg-red-50 transition-colors"
                  >
                    Create Standard
                  </Link>
                </div>

                <div className="bg-white/10 backdrop-blur rounded-lg p-6 border-2 border-white/50">
                  <div className="inline-block bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold mb-2">
                    RECOMMENDED
                  </div>
                  <h4 className="text-xl font-bold mb-3">Premium - £14.99</h4>
                  <ul className="space-y-2 text-sm">
                    <li>✓ Everything in Standard PLUS:</li>
                    <li>✓ Comprehensive inventory section with white goods grid</li>
                    <li>✓ Exhaustive terms & conditions (13 detailed clauses)</li>
                    <li>✓ Professional gradient styling (NI red theme)</li>
                    <li>✓ Enhanced 2025 legal compliance boxes</li>
                    <li>✓ Rights of change clauses for flexibility</li>
                    <li>✓ Detailed repair obligations</li>
                    <li>✓ Superior professional presentation</li>
                    <li className="font-semibold text-yellow-300">✓ Covers HMOs (Houses in Multiple Occupation)</li>
                  </ul>
                  <Link
                    href="/wizard?product=ast_premium&src=product_page&topic=tenancy&jurisdiction=northern-ireland"
                    className="mt-4 block text-center bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
                  >
                    Create Premium
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Do All Tenants Need to Be On It */}
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Do All Tenants Need to Be on the Tenancy Agreement?</h2>

            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed mb-6">
                <strong>Yes.</strong> All adults (18+) who will be living in the property as tenants must be named on the tenancy agreement and must sign it. This is required under Northern Ireland tenancy law and protects both landlords and tenants.
              </p>

              <div className="bg-green-50 border-l-4 border-green-600 p-6 mb-6">
                <h3 className="text-xl font-semibold text-green-900 mb-3">Joint and Several Liability</h3>
                <p className="text-gray-700 mb-3">
                  When multiple tenants sign a tenancy agreement, they become <strong>jointly and severally liable</strong>:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Each tenant is individually responsible for the <strong>full rent</strong>, not just their share</li>
                  <li>If one tenant doesn't pay, the landlord can pursue any or all tenants for the full amount</li>
                  <li>All tenants are equally responsible for property damage and breach of tenancy</li>
                  <li>One tenant leaving doesn't automatically end the tenancy for others</li>
                </ul>
              </div>

              <div className="bg-primary-50 border-l-4 border-primary-600 p-6 mb-6">
                <h3 className="text-xl font-semibold text-primary-900 mb-3">Occupants vs. Tenants</h3>
                <p className="text-gray-700 mb-3">Only tenants need to sign the agreement. Occupants (children, visiting relatives, non-paying guests) do not sign but can be mentioned in the agreement.</p>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300 text-sm">
                    <thead>
                      <tr className="bg-red-600 text-white">
                        <th className="border border-gray-300 px-3 py-2 text-left">Tenants (Must Sign)</th>
                        <th className="border border-gray-300 px-3 py-2 text-left">Occupants (Don't Sign)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-gray-50">
                        <td className="border border-gray-300 px-3 py-2">
                          • Adults 18+ living in property<br />
                          • Paying rent or contributing<br />
                          • Have legal tenancy rights<br />
                          • Jointly liable for rent
                        </td>
                        <td className="border border-gray-300 px-3 py-2">
                          • Children under 18<br />
                          • Visiting family/friends<br />
                          • Not paying rent<br />
                          • No legal tenancy rights
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-blue-900 mb-3">Our Wizard Supports Multiple Tenants</h3>
                <p className="text-gray-700">
                  Our wizard asks how many tenants will be living in the property and collects details for each one. The generated agreement automatically includes all tenant names and creates signature blocks for each tenant.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Changing or Ending Section */}
        <section className="container mx-auto px-4 py-12 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Changing or Ending a Tenancy Agreement</h2>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Ending a Tenancy - Tenant</h3>
                <p className="text-gray-700 mb-4">
                  Tenants can end the tenancy by giving proper notice:
                </p>

                <div className="space-y-4">
                  <div className="border-l-4 border-blue-600 pl-4">
                    <h4 className="font-semibold text-gray-900">Fixed-Term</h4>
                    <p className="text-sm text-gray-700">
                      Can't end early unless break clause exists or landlord agrees. Must give notice if not renewing (typically 1-2 months before end date).
                    </p>
                  </div>

                  <div className="border-l-4 border-green-600 pl-4">
                    <h4 className="font-semibold text-gray-900">Periodic</h4>
                    <p className="text-sm text-gray-700">
                      Give notice as specified in agreement (commonly 1 month). Notice must expire on rent day (e.g., if rent due 1st, notice expires on last day of month).
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-8">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Ending a Tenancy - Landlord</h3>
                <p className="text-gray-700 mb-4">
                  Landlords must follow strict procedures and length-based notice periods:
                </p>

                <div className="space-y-4">
                  <div className="border-l-4 border-red-600 pl-4">
                    <h4 className="font-semibold text-gray-900">2025 Length-Based Notice</h4>
                    <ul className="text-sm text-gray-700 space-y-1 mt-2">
                      <li>• <strong>Under 1 year:</strong> 28 days minimum</li>
                      <li>• <strong>1-10 years:</strong> 56 days minimum</li>
                      <li>• <strong>Over 10 years:</strong> 84 days minimum</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-orange-600 pl-4">
                    <h4 className="font-semibold text-gray-900">Notice to Quit</h4>
                    <p className="text-sm text-gray-700">
                      Must be in writing, specify correct notice period, state reason if applicable. Tenant has right to challenge in court if improper.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-primary text-white rounded-xl shadow-lg p-8">
              <h3 className="text-2xl font-semibold mb-4">Rent Increases: 2025 Rules</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                  <h4 className="text-lg font-semibold mb-2">Frequency</h4>
                  <p className="text-sm">
                    Maximum <strong>once per year</strong> with a minimum <strong>12-month gap</strong> between increases.
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                  <h4 className="text-lg font-semibold mb-2">Notice</h4>
                  <p className="text-sm">
                    <strong>3 months' written notice</strong> required before rent increase takes effect.
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                  <h4 className="text-lg font-semibold mb-2">Challenge</h4>
                  <p className="text-sm">
                    Tenants can challenge excessive increases through proper legal channels.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Related Documents */}
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Related Documents for Northern Ireland Tenancies</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <h3 className="text-xl font-semibold text-red-600 mb-2">Notice to Quit</h3>
                <p className="text-gray-700 text-sm mb-3">
                  Official notice from landlord to end a tenancy, with length-based notice periods (28/56/84 days).
                </p>
                <Link href="/products/notice-only" className="text-red-600 hover:underline text-sm font-semibold">
                  Learn More →
                </Link>
              </div>

              <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <h3 className="text-xl font-semibold text-red-600 mb-2">Rent Increase Notice</h3>
                <p className="text-gray-700 text-sm mb-3">
                  Formal notice of rent increase (3 months' notice, once per year, 12-month gap required).
                </p>
                <span className="text-gray-400 text-sm">Coming Soon</span>
              </div>

              <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <h3 className="text-xl font-semibold text-red-600 mb-2">Rental Inspection Report</h3>
                <p className="text-gray-700 text-sm mb-3">
                  Document property condition at start and end of tenancy for deposit protection.
                </p>
                <span className="text-gray-400 text-sm">Coming Soon</span>
              </div>

              <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <h3 className="text-xl font-semibold text-red-600 mb-2">Tenancy Application Form</h3>
                <p className="text-gray-700 text-sm mb-3">
                  Pre-tenancy form to collect tenant information and references.
                </p>
                <span className="text-gray-400 text-sm">Coming Soon</span>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <FAQSection
          title="Frequently Asked Questions"
          faqs={[
            {
              question: "Is a Private Tenancy Agreement legally valid in Northern Ireland?",
              answer: "Yes. Our Private Tenancy Agreements are drafted to comply with the Private Tenancies Order (Northern Ireland) 2006, Private Tenancies Act (Northern Ireland) 2022, and all 2025 legal updates including mandatory EICR requirements from 1 April 2025."
            },
            {
              question: "What changed in Northern Ireland tenancy law in 2025?",
              answer: "From 1 April 2025, key changes include: Mandatory EICR (all private rentals must have an Electrical Installation Condition Report renewed every 5 years), Rent Increase Limits (once per year maximum, 12-month gap between increases), 3-Month Notice required for all rent increases, and Length-Based Notice Periods (28/56/84 days depending on tenancy duration)."
            },
            {
              question: "What is the difference between Standard and Premium agreements?",
              answer: "The Standard (£9.99) covers all legal essentials for NI tenancies, including 2025 updates, deposit protection, and length-based notice periods. The Premium (£14.99) adds: comprehensive inventory section with white goods grid, exhaustive terms and conditions (13 detailed clauses), professional gradient styling (NI red theme), enhanced 2025 legal compliance boxes, rights of change clauses, detailed repair obligations, and superior professional presentation."
            },
            {
              question: "What is the maximum deposit I can charge in Northern Ireland?",
              answer: "In Northern Ireland, the maximum deposit is 2 months' rent. Our wizard automatically validates your deposit amount to ensure compliance. You must also protect the deposit in an approved scheme (TDS Northern Ireland or MyDeposits Northern Ireland) within 28 days of receipt."
            },
            {
              question: "Do I need a written tenancy agreement in Northern Ireland?",
              answer: "A written agreement is strongly recommended and makes compliance, deposit protection, and dispute resolution far easier. Our wizard generates a complete written Private Tenancy Agreement with the required terms for Northern Ireland."
            },
            {
              question: "How often can I increase rent in Northern Ireland?",
              answer: "From 2025, landlords can increase rent once per year with a minimum 12-month gap between increases. You must give 3 months' written notice of any rent increase. Tenants have the right to challenge excessive increases."
            },
            {
              question: "Do I need an EICR certificate?",
              answer: "Yes, from 1 April 2025. All private rental properties in Northern Ireland must have a valid Electrical Installation Condition Report (EICR) conducted by a qualified electrician. The EICR must be renewed every 5 years or at each change of tenancy, whichever comes first. You must provide a copy to your tenants."
            },
            {
              question: "What are the length-based notice periods?",
              answer: "From 2025, when landlords end a periodic tenancy, notice periods are based on how long the tenancy has lasted: Under 1 year (minimum 28 days' notice), 1 to 10 years (minimum 56 days' notice / 8 weeks), Over 10 years (minimum 84 days' notice / 12 weeks). Tenants typically give notice as specified in the agreement (commonly 1 month)."
            },
            {
              question: "Can tenants have pets?",
              answer: "It's up to the landlord. Our wizard asks whether pets are allowed, what types, and how many. If you allow pets, you can request a higher deposit (up to the 2 months' rent maximum) or require pet insurance."
            },
            {
              question: "Do I need to register as a landlord in Northern Ireland?",
              answer: "Currently, landlord registration is not mandatory in Northern Ireland (unlike Scotland). However, you must comply with all other legal requirements including deposit protection, safety certificates (gas, EICR from 2025, EPC), and proper notice procedures."
            },
            {
              question: "How quickly can I get my agreement?",
              answer: "Immediately! Our wizard takes approximately 10-15 minutes to complete. Once you've answered all questions and paid, your professionally formatted tenancy agreement is generated instantly and available for download as a PDF. You can print it, email it to tenants, or use it digitally with e-signature services."
            }
          ]}
          showContactCTA={false}
          variant="gray"
        />

        {/* Related Links */}
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Related Links</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Link href="/how-to-evict-tenant#northern-ireland" className="block p-5 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                Northern Ireland eviction guide
              </Link>
              <Link href="/tools" className="block p-5 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                Landlord tools hub
              </Link>
              <Link href="/ask-heaven" className="block p-5 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                Ask Heaven (free landlord Q&amp;A)
              </Link>
              <Link href="/blog/northern-ireland" className="block p-5 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                Northern Ireland landlord guides (blog)
              </Link>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto bg-primary rounded-2xl shadow-2xl p-12 text-center text-white">
            <h2 className="text-4xl font-bold mb-4">Ready to Create Your Tenancy Agreement?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join Northern Ireland landlords who trust Landlord Heaven for 2025-compliant, professional tenancy agreements.
            </p>
            <div className="flex gap-6 justify-center flex-wrap">
              <Link
                href="/wizard?product=ast_standard&src=product_page&topic=tenancy&jurisdiction=northern-ireland"
                className="bg-white text-red-600 px-8 py-4 rounded-lg font-semibold hover:bg-red-50 transition-colors text-lg shadow-lg"
              >
                Standard - £9.99
              </Link>
              <Link
                href="/wizard?product=ast_premium&src=product_page&topic=tenancy&jurisdiction=northern-ireland"
                className="bg-yellow-400 text-gray-900 px-8 py-4 rounded-lg font-semibold hover:bg-yellow-300 transition-colors text-lg shadow-lg"
              >
                Premium - £14.99 ⭐
              </Link>
            </div>
            <p className="mt-6 text-sm opacity-75">
              Instant download • 2025 EICR & legal updates included • No subscription required
            </p>
          </div>
        </section>

        {/* SEO Internal Links Section */}
        <section className="container mx-auto px-4 py-8 border-t border-gray-200">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Other UK Jurisdictions</h3>
            <div className="flex gap-6 flex-wrap">
              <Link href="/tenancy-agreements/england" className="text-red-600 hover:underline font-semibold">
                England Assured Shorthold Tenancy (AST) →
              </Link>
              <Link href="/tenancy-agreements/wales" className="text-red-600 hover:underline font-semibold">
                Wales Occupation Contract →
              </Link>
              <Link href="/tenancy-agreements/scotland" className="text-red-600 hover:underline font-semibold">
                Scotland Private Residential Tenancy (PRT) →
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
