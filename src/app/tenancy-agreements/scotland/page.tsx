import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Private Residential Tenancy Agreement (PRT) | Scotland | Landlord Heaven',
  description: 'Create a legally compliant Private Residential Tenancy (PRT) agreement for Scotland. Complies with Private Housing (Tenancies) (Scotland) Act 2016 and Repairing Standard. Standard and Premium options available.',
  keywords: 'PRT, Private Residential Tenancy, tenancy agreement Scotland, PRT agreement, Scottish tenancy, landlord registration Scotland, First-tier Tribunal, repairing standard, Housing Scotland Act 2006',
  openGraph: {
    title: 'Private Residential Tenancy Agreement (PRT) | Scotland',
    description: 'Create a legally compliant PRT for Scotland. Open-ended tenancy with full legal compliance.',
    type: 'website',
    url: 'https://landlordheaven.co.uk/tenancy-agreements/scotland',
  },
};

export default function ScotlandPRTPage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Is a Private Residential Tenancy (PRT) agreement legally valid in Scotland?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Our PRT agreements are drafted to comply with the Private Housing (Tenancies) (Scotland) Act 2016, Housing (Scotland) Act 2006, and all current Scottish tenancy legislation. Both Standard and Premium versions are legally binding when properly executed.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the difference between Standard and Premium PRT agreements?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The Standard PRT covers all legal essentials for Scottish tenancies. The Premium PRT adds comprehensive inventory sections, exhaustive terms and conditions (13 detailed clauses), professional gradient styling, rights of change clauses, enhanced legal compliance information, and detailed Repairing Standard obligations.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do I need to register as a landlord in Scotland?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. All landlords in Scotland must register with their local council before letting a property. You must provide your landlord registration number in the PRT agreement. Failure to register is a criminal offense with fines up to £50,000.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the maximum deposit I can charge in Scotland?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'In Scotland, the maximum deposit is 2 months rent. Our wizard automatically validates your deposit amount to ensure compliance with Scottish law.',
        },
      },
      {
        '@type': 'Question',
        name: 'Are PRTs fixed-term or open-ended?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'All PRTs in Scotland are open-ended (periodic) by law. There is no fixed end date. Either party can end the tenancy with proper notice: tenants need 28 days minimum, landlords need specific grounds and longer notice periods (28, 84, or 168 days depending on the ground).',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I evict a tenant under a PRT?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Landlords must have one of 18 legal grounds for eviction (e.g., rent arrears, breach of tenancy, landlord intends to sell). You must serve the correct notice period (varies by ground) and apply to the First-tier Tribunal for Scotland if the tenant does not leave voluntarily.',
        },
      },
    ],
  };

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Private Residential Tenancy Agreement (PRT)',
    description: 'Legally compliant PRT agreement for Scotland',
    offers: [
      {
        '@type': 'Offer',
        name: 'Standard PRT',
        price: '39.99',
        priceCurrency: 'GBP',
      },
      {
        '@type': 'Offer',
        name: 'Premium PRT',
        price: '59.00',
        priceCurrency: 'GBP',
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

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-purple-100 to-purple-50">
        {/* Breadcrumb Navigation */}
        <div className="container mx-auto px-4 py-4">
          <nav className="text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/tenancy-agreements" className="hover:text-blue-600">Tenancy Agreements</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">Scotland</span>
          </nav>
        </div>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Private Residential Tenancy Agreement (PRT)
              <span className="block text-3xl text-blue-600 mt-2">Scotland</span>
            </h1>
            <p className="text-xl text-gray-700 mb-8">
              Create a legally compliant Private Residential Tenancy agreement in minutes. Fully compliant with the Private Housing (Tenancies) (Scotland) Act 2016 and all current Scottish legislation.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/wizard?jurisdiction=scotland&document_type=prt_agreement"
                className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-lg"
              >
                Create Standard PRT - £39.99
              </Link>
              <Link
                href="/wizard?jurisdiction=scotland&document_type=prt_premium"
                className="bg-primary text-white px-8 py-4 rounded-lg font-semibold hover:hover:bg-primary-dark transition-colors text-lg"
              >
                Create Premium PRT - £59.00
              </Link>
            </div>
          </div>
        </section>

        {/* What is a PRT Section */}
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">What is a Private Residential Tenancy (PRT)?</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                A <strong>Private Residential Tenancy (PRT)</strong> is the standard tenancy agreement for all new private residential lettings in Scotland since 1 December 2017. It replaced the previous Assured and Short Assured Tenancy regimes and is governed by the <strong>Private Housing (Tenancies) (Scotland) Act 2016</strong>.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                PRTs are <strong>open-ended</strong> (periodic) tenancies with no fixed end date, providing greater security for tenants while giving landlords clear legal grounds for ending a tenancy when necessary. The PRT sets out the terms of the tenancy, including rent amount, deposit details, tenant and landlord responsibilities, and procedures for rent increases and ending the tenancy.
              </p>
              <div className="bg-blue-50 border-l-4 border-blue-600 p-6 my-6">
                <h3 className="text-xl font-semibold text-blue-900 mb-2">Key Features of PRTs</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li><strong>Open-ended:</strong> No fixed end date - continues until either party ends it with proper notice</li>
                  <li><strong>Stronger tenant protection:</strong> Landlords need specific grounds to end tenancy</li>
                  <li><strong>Regulated rent increases:</strong> Maximum one increase per year, with 3 months' notice</li>
                  <li><strong>Deposit cap:</strong> Maximum 2 months' rent</li>
                  <li><strong>First-tier Tribunal:</strong> Resolves disputes instead of courts</li>
                  <li><strong>Repairing Standard:</strong> Specific legal obligations for landlords</li>
                </ul>
              </div>
              <div className="bg-amber-50 border-l-4 border-amber-600 p-6 my-6">
                <h3 className="text-xl font-semibold text-amber-900 mb-2">Alternative Names</h3>
                <p className="text-gray-700">
                  PRT agreements may also be referred to as:
                </p>
                <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
                  <li>Private Residential Tenancy Agreement</li>
                  <li>PRT Contract</li>
                  <li>Scottish Tenancy Agreement</li>
                  <li>Residential Tenancy Agreement (Scotland)</li>
                  <li>Open-ended Tenancy (Scotland)</li>
                </ul>
              </div>
              <p className="text-gray-700 leading-relaxed">
                If you had a tenancy that started before 1 December 2017, it may be an Assured or Short Assured Tenancy under the old system. These continue under their original terms but can be converted to PRTs by mutual agreement.
              </p>
            </div>
          </div>
        </section>

        {/* Scotland Residential Tenancy Laws */}
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Scotland Residential Tenancy Laws</h2>
            <p className="text-gray-700 mb-6">
              Private Residential Tenancies in Scotland are governed by comprehensive legislation that provides strong protections for both landlords and tenants. Understanding these laws is essential for creating a legally compliant tenancy agreement.
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
                      Private Housing (Tenancies) (Scotland) Act 2016
                    </td>
                    <td className="border border-gray-300 px-4 py-3">
                      • Establishes the PRT as the standard tenancy type<br />
                      • Defines 18 grounds for ending a tenancy<br />
                      • Caps deposits at 2 months' rent<br />
                      • Regulates rent increases (once per year, 3 months' notice)<br />
                      • Creates First-tier Tribunal for Housing and Property Chamber
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3 font-semibold">
                      Housing (Scotland) Act 2006
                    </td>
                    <td className="border border-gray-300 px-4 py-3">
                      • Establishes the Repairing Standard for private rented properties<br />
                      • Requires landlord registration with local councils<br />
                      • Tenancy deposit protection scheme requirements<br />
                      • Houses in Multiple Occupation (HMO) licensing
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3 font-semibold">
                      Rent (Scotland) Act 1984
                    </td>
                    <td className="border border-gray-300 px-4 py-3">
                      • Regulates protected and statutory tenancies (pre-1989)<br />
                      • Defines regulated rent system (rarely applies to new tenancies)
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3 font-semibold">
                      Antisocial Behaviour etc. (Scotland) Act 2004
                    </td>
                    <td className="border border-gray-300 px-4 py-3">
                      • Landlord registration scheme<br />
                      • Criminal offense to let property without registration (up to £50,000 fine)<br />
                      • Local authority powers to refuse or revoke registration
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3 font-semibold">
                      Gas Safety (Installation and Use) Regulations 1998
                    </td>
                    <td className="border border-gray-300 px-4 py-3">
                      • Annual gas safety checks required for all gas appliances<br />
                      • Gas Safety Certificate must be provided to tenants
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3 font-semibold">
                      Housing (Scotland) Act 1987
                    </td>
                    <td className="border border-gray-300 px-4 py-3">
                      • Tolerable standard for housing<br />
                      • Minimum property condition requirements<br />
                      • Local authority enforcement powers
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3 font-semibold">
                      Energy Efficiency (Private Rented Property) (Scotland) Regulations 2020
                    </td>
                    <td className="border border-gray-300 px-4 py-3">
                      • Minimum Energy Performance Certificate (EPC) rating of E<br />
                      • Prohibition on letting properties below minimum standard (unless exempt)<br />
                      • Valid EPC required before marketing property
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3 font-semibold">
                      Electrical Equipment (Safety) Regulations 2016
                    </td>
                    <td className="border border-gray-300 px-4 py-3">
                      • Electrical Installation Condition Report (EICR) required every 5 years<br />
                      • All electrical appliances must be safe and tested<br />
                      • Copy must be provided to tenants
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3 font-semibold">
                      Smoke and Carbon Monoxide Alarm (Scotland) Regulations 2015
                    </td>
                    <td className="border border-gray-300 px-4 py-3">
                      • Working smoke alarms in living areas and hallways<br />
                      • Carbon monoxide detectors in rooms with fixed combustion appliances<br />
                      • Heat detector in every kitchen
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-600 p-6 mt-6">
              <h3 className="text-xl font-semibold text-blue-900 mb-2">First-tier Tribunal for Housing and Property Chamber</h3>
              <p className="text-gray-700">
                The First-tier Tribunal replaced the courts as the main body for resolving disputes between landlords and tenants in Scotland. It handles rent increase applications, eviction applications, deposit disputes, repairs, and other tenancy matters. The Tribunal process is generally faster and less formal than court proceedings.
              </p>
            </div>
          </div>
        </section>

        {/* Types of Tenancy Agreements */}
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Types of Tenancy Agreements in Scotland</h2>

            <div className="space-y-6">
              <div className="border-l-4 border-blue-600 pl-6">
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">1. Private Residential Tenancy (PRT) - Current Standard</h3>
                <p className="text-gray-700 mb-2">
                  All new private residential tenancies created since 1 December 2017 are PRTs. They are open-ended with no fixed end date.
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li><strong>Open-ended:</strong> Continues indefinitely until ended by landlord or tenant</li>
                  <li><strong>Tenant security:</strong> Landlord needs one of 18 legal grounds to evict</li>
                  <li><strong>Flexibility:</strong> Tenant can leave with minimum 28 days' notice</li>
                  <li><strong>Protection:</strong> Caps on deposits and regulated rent increases</li>
                </ul>
              </div>

              <div className="border-l-4 border-green-600 pl-6">
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">2. Short Assured Tenancy (SAT) - Legacy System</h3>
                <p className="text-gray-700 mb-2">
                  Created between 1989 and 1 December 2017. Cannot be created anymore, but existing SATs continue.
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li><strong>Fixed-term:</strong> Typically 6 or 12 months with option to renew</li>
                  <li><strong>Conversion:</strong> Can be converted to PRT by mutual agreement</li>
                  <li><strong>Less protection:</strong> Easier for landlords to regain possession</li>
                </ul>
              </div>

              <div className="border-l-4 border-purple-600 pl-6">
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">3. Assured Tenancy - Legacy System</h3>
                <p className="text-gray-700 mb-2">
                  Long-term tenancies created between 1989 and 1997 with very strong tenant protection. Rare today.
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li><strong>High security:</strong> Very difficult for landlords to end tenancy</li>
                  <li><strong>Succession rights:</strong> Can be passed to family members</li>
                  <li><strong>Regulated rents:</strong> Rent increases subject to strict controls</li>
                </ul>
              </div>

              <div className="border-l-4 border-orange-600 pl-6">
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">4. Joint Tenancy PRT</h3>
                <p className="text-gray-700 mb-2">
                  Multiple tenants share the same PRT agreement with joint and several liability.
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li><strong>Joint liability:</strong> All tenants equally responsible for rent and obligations</li>
                  <li><strong>Common use:</strong> House shares, couples, flatmates</li>
                  <li><strong>Ending:</strong> Complex rules if one tenant wants to leave mid-tenancy</li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
                <h3 className="text-xl font-semibold text-blue-900 mb-3">Why Are PRTs Open-Ended?</h3>
                <p className="text-gray-700">
                  The Scottish Government introduced open-ended PRTs to provide tenants with greater security and stability. Unlike fixed-term tenancies, tenants don't need to worry about being asked to leave when the initial term expires. However, tenants maintain flexibility with 28 days' minimum notice to leave, while landlords have clear legal grounds for ending tenancies when there's a legitimate reason (e.g., selling the property, moving in themselves, or tenant breach).
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits of PRT Agreements */}
        <section className="container mx-auto px-4 py-12 bg-gradient-to-br from-purple-50 via-purple-100 to-purple-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Benefits of a Written PRT Agreement</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-blue-600">
                <div className="text-4xl mb-4">🏴󠁧󠁢󠁳󠁣󠁴󠁿</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Scottish Legal Compliance</h3>
                <p className="text-gray-700">
                  A written PRT complies with the Private Housing (Tenancies) (Scotland) Act 2016 and provides a clear framework under Scottish law, including specific eviction grounds and rent increase procedures.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-green-600">
                <div className="text-4xl mb-4">🔒</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Tenant Security</h3>
                <p className="text-gray-700">
                  Open-ended PRTs give tenants security of tenure without the stress of fixed-term renewals. Tenants can make the property their home without fear of sudden eviction, while retaining the flexibility to leave with 28 days' notice.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-purple-600">
                <div className="text-4xl mb-4">⚖️</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Clear Grounds for Possession</h3>
                <p className="text-gray-700">
                  The PRT sets out 18 specific grounds that landlords can use to end a tenancy (e.g., rent arrears, breach, landlord moving in, selling property). This clarity protects both parties and reduces disputes.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-orange-600">
                <div className="text-4xl mb-4">💰</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Deposit Protection</h3>
                <p className="text-gray-700">
                  PRTs include deposit protection requirements (maximum 2 months' rent) and deposits must be protected in an approved scheme within 30 working days. This protects tenants' money and ensures fair dispute resolution.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-red-600">
                <div className="text-4xl mb-4">🏠</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Repairing Standard Clarity</h3>
                <p className="text-gray-700">
                  PRTs reference the Repairing Standard, which sets out landlords' legal obligations for property condition, structure, installations, and safety. Tenants have clear rights to request repairs via the First-tier Tribunal.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-indigo-600">
                <div className="text-4xl mb-4">📋</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Professional Evidence</h3>
                <p className="text-gray-700">
                  A comprehensive written PRT serves as evidence for the First-tier Tribunal, landlord registration, and mortgage lenders. It demonstrates professionalism and reduces the risk of disputes.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Who Should Use a PRT */}
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Who Should Use a PRT Agreement?</h2>

            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-3xl">
                  🏠
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Private Landlords in Scotland</h3>
                  <p className="text-gray-700">
                    All landlords letting residential property in Scotland must use a PRT for new tenancies (since 1 December 2017). This includes buy-to-let investors, accidental landlords, and those renting out a second property. You must also be registered as a landlord with your local council.
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
                    Letting agents acting for landlords must use PRT agreements for all new Scottish lettings. Agents must also be registered with the Scottish Letting Agent Register and comply with the Letting Agent Code of Practice.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="shrink-0 w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-3xl">
                  🔑
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">First-Time Landlords in Scotland</h3>
                  <p className="text-gray-700">
                    New landlords benefit from our comprehensive wizard which guides you through Scottish-specific requirements including landlord registration, Repairing Standard, deposit caps, and First-tier Tribunal processes.
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
                    Landlords with multiple Scottish properties need consistent, compliant PRT agreements. Our templates ensure all your tenancies meet current Scottish law and landlord registration requirements.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 border-l-4 border-red-600 p-6 mt-8">
              <h3 className="text-xl font-semibold text-red-900 mb-2">Landlord Registration is Mandatory</h3>
              <p className="text-gray-700 mb-3">
                Before you can let property in Scotland, you <strong>must</strong> register with your local council as a landlord. Failure to register is a <strong>criminal offense</strong> with fines up to <strong>£50,000</strong>.
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Register at least 4-6 weeks before your first tenancy starts</li>
                <li>Application costs vary by council (typically £55-£88 for 3 years)</li>
                <li>You'll receive a landlord registration number to include in your PRT</li>
                <li>Register at: <a href="https://www.landlordregistrationscotland.gov.uk" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">landlordregistrationscotland.gov.uk</a></li>
              </ul>
            </div>

            <div className="bg-amber-50 border-l-4 border-amber-600 p-6 mt-6">
              <h3 className="text-xl font-semibold text-amber-900 mb-2">When NOT to Use a PRT</h3>
              <p className="text-gray-700 mb-3">PRTs are NOT suitable for:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li><strong>Lodgers:</strong> Use a Resident Landlord Agreement when you live in the same property</li>
                <li><strong>Holiday Lets:</strong> Short-term holiday rentals are excluded from PRT requirements</li>
                <li><strong>Social Housing:</strong> Council and housing association tenancies use Scottish Secure Tenancies</li>
                <li><strong>Student Halls:</strong> Purpose-built student accommodation may be exempt</li>
                <li><strong>Agricultural Tenancies:</strong> Use Agricultural Holdings legislation</li>
              </ul>
            </div>
          </div>
        </section>

        {/* How to Write a PRT */}
        <section className="container mx-auto px-4 py-12 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">How to Create a PRT Agreement</h2>

            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <p className="text-gray-700 text-lg mb-6">
                Our intelligent wizard guides you through creating a comprehensive PRT agreement in approximately 10-15 minutes. We ask 70+ questions to ensure your agreement complies with Scottish law and includes all required information.
              </p>

              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Scotland-Specific Information You'll Provide:</h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Landlord Registration</h4>
                      <p className="text-sm text-gray-600">Your landlord registration number from your local council (mandatory in Scotland)</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Property Details</h4>
                      <p className="text-sm text-gray-600">Full address, property type, bedrooms, furnished status, HMO licence (if applicable)</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Deposit Information</h4>
                      <p className="text-sm text-gray-600">Deposit amount (max 2 months' rent), chosen deposit scheme (SafeDeposits, MyDeposits, LPS Scotland)</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">4</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Rent Details</h4>
                      <p className="text-sm text-gray-600">Rent amount, payment frequency, first payment date, rent increase notice (if applicable)</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">5</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Repairing Standard Compliance</h4>
                      <p className="text-sm text-gray-600">Confirmation of structural soundness, weather-tight, safe installations, gas/electrical certificates</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">6</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Tenancy Start Date</h4>
                      <p className="text-sm text-gray-600">When the open-ended tenancy begins (no end date required for PRTs)</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">7</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Utilities & Services</h4>
                      <p className="text-sm text-gray-600">Who pays council tax, utilities, water charges, TV licence, internet</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">8</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Landlord & Tenant Details</h4>
                      <p className="text-sm text-gray-600">Full names, addresses, contact details for all parties (supports multiple tenants)</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">9</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Safety Certificates</h4>
                      <p className="text-sm text-gray-600">Gas safety (CP12), EICR (electrical), EPC rating, smoke/heat/CO alarm confirmation</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">10</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Permitted Occupants</h4>
                      <p className="text-sm text-gray-600">Pets policy, maximum occupants, children, overnight guests</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">11</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Maintenance Responsibilities</h4>
                      <p className="text-sm text-gray-600">Landlord's Repairing Standard duties, tenant's care obligations, garden maintenance, repairs process</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">12</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Inventory & Condition</h4>
                      <p className="text-sm text-gray-600">Property inventory, white goods included, decoration condition, professional cleaning</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">13</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Insurance & Access</h4>
                      <p className="text-sm text-gray-600">Landlord insurance, tenant insurance requirements, access notice periods, inspection frequency</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">14</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Additional Terms</h4>
                      <p className="text-sm text-gray-600">Subletting policy, communal areas, parking, recycling arrangements</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-primary text-white rounded-xl shadow-lg p-8">
              <h3 className="text-2xl font-semibold mb-4">Two Options to Suit Your Needs</h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white/10 backdrop-blur rounded-lg p-6">
                  <h4 className="text-xl font-bold mb-3">Standard PRT - £39.99</h4>
                  <ul className="space-y-2 text-sm">
                    <li>✓ All legal essentials for Scottish PRTs</li>
                    <li>✓ Compliant with PH(T)(S) Act 2016</li>
                    <li>✓ Open-ended tenancy structure</li>
                    <li>✓ 18 grounds for possession included</li>
                    <li>✓ Repairing Standard obligations</li>
                    <li>✓ Landlord registration number section</li>
                    <li>✓ Clear, professional formatting</li>
                  </ul>
                  <Link
                    href="/wizard?jurisdiction=scotland&document_type=prt_agreement"
                    className="mt-4 block text-center bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                  >
                    Create Standard PRT
                  </Link>
                </div>

                <div className="bg-white/10 backdrop-blur rounded-lg p-6 border-2 border-white/50">
                  <div className="inline-block bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold mb-2">
                    RECOMMENDED
                  </div>
                  <h4 className="text-xl font-bold mb-3">Premium PRT - £59.00</h4>
                  <ul className="space-y-2 text-sm">
                    <li>✓ Everything in Standard PLUS:</li>
                    <li>✓ Comprehensive inventory section with white goods grid</li>
                    <li>✓ Exhaustive terms & conditions (13 detailed clauses)</li>
                    <li>✓ Professional gradient styling (Scotland blue theme)</li>
                    <li>✓ Rights of change clauses for flexibility</li>
                    <li>✓ Enhanced legal compliance information boxes</li>
                    <li>✓ Detailed Repairing Standard explanation</li>
                    <li>✓ First-tier Tribunal process guidance</li>
                    <li>✓ Superior professional presentation</li>
                  </ul>
                  <Link
                    href="/wizard?jurisdiction=scotland&document_type=prt_premium"
                    className="mt-4 block text-center bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
                  >
                    Create Premium PRT
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Do All Tenants Need to Be On It */}
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Do All Tenants Need to Be on the PRT Agreement?</h2>

            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed mb-6">
                <strong>Yes.</strong> All adults (18+) who will be living in the property as tenants must be named on the PRT agreement and must sign it. This is required under Scottish tenancy law and protects both landlords and tenants.
              </p>

              <div className="bg-green-50 border-l-4 border-green-600 p-6 mb-6">
                <h3 className="text-xl font-semibold text-green-900 mb-3">Joint and Several Liability in Scotland</h3>
                <p className="text-gray-700 mb-3">
                  When multiple tenants sign a PRT, they become <strong>jointly and severally liable</strong>. This means:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Each tenant is individually responsible for the <strong>full rent</strong>, not just their share</li>
                  <li>If one tenant doesn't pay, the others must cover it or face eviction proceedings</li>
                  <li>All tenants are equally responsible for property damage and breach of tenancy terms</li>
                  <li>The landlord can pursue any or all tenants for the full amount owed</li>
                </ul>
              </div>

              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Tenants vs. Permitted Occupants</h3>

              <div className="overflow-x-auto mb-6">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-blue-600 text-white">
                      <th className="border border-gray-300 px-4 py-3 text-left">Tenants (Must Sign PRT)</th>
                      <th className="border border-gray-300 px-4 py-3 text-left">Permitted Occupants (Don't Sign)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-3">
                        • Adults (18+) living in property<br />
                        • Paying rent or contributing financially<br />
                        • Named on the PRT agreement<br />
                        • Legal protection under PH(T)(S) Act 2016<br />
                        • Jointly liable for rent and obligations
                      </td>
                      <td className="border border-gray-300 px-4 py-3">
                        • Children under 18<br />
                        • Visiting family or friends (short-term)<br />
                        • Not paying rent<br />
                        • No legal tenancy rights<br />
                        • Can be listed in PRT but don't sign
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-amber-50 border-l-4 border-amber-600 p-6 mb-6">
                <h3 className="text-xl font-semibold text-amber-900 mb-3">What If One Tenant Wants to Leave?</h3>
                <p className="text-gray-700 mb-3">
                  This is complex in Scotland. Options include:
                </p>
                <ol className="list-decimal list-inside text-gray-700 space-y-2">
                  <li><strong>Assignment:</strong> The leaving tenant can assign their interest to a new tenant (requires landlord consent)</li>
                  <li><strong>End and Restart:</strong> All tenants end the PRT (with landlord agreement) and remaining tenants start a new PRT</li>
                  <li><strong>Continue as Joint Tenancy:</strong> Leaving tenant remains liable unless formally released by landlord</li>
                  <li><strong>Negotiate Release:</strong> Landlord agrees to release leaving tenant and continue with remaining tenants</li>
                </ol>
                <p className="text-gray-700 mt-3">
                  <strong>Important:</strong> A tenant can't simply "remove themselves" from a joint PRT. All parties (landlord and all tenants) must agree to any changes.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-blue-900 mb-3">Our Wizard Handles Multiple Tenants</h3>
                <p className="text-gray-700">
                  Our wizard asks how many tenants will be living in the property and collects details for each one (names, contact information, etc.). The generated PRT automatically includes all tenant names and creates signature blocks for each tenant, ensuring compliance with Scottish law.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Ending a PRT */}
        <section className="container mx-auto px-4 py-12 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Changing or Ending a PRT Agreement</h2>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Tenant Ending a PRT</h3>
                <p className="text-gray-700 mb-4">
                  Tenants have flexibility to end a PRT with proper notice:
                </p>

                <div className="space-y-4">
                  <div className="border-l-4 border-blue-600 pl-4">
                    <h4 className="font-semibold text-gray-900">Minimum Notice Period</h4>
                    <p className="text-sm text-gray-700">
                      Tenants must give at least <strong>28 days' notice</strong> to the landlord to end the tenancy. The PRT agreement can specify a longer notice period (e.g., 2 months), but never less than 28 days.
                    </p>
                  </div>

                  <div className="border-l-4 border-green-600 pl-4">
                    <h4 className="font-semibold text-gray-900">Notice Requirements</h4>
                    <ul className="text-sm text-gray-700 space-y-1 mt-2">
                      <li>• Must be in writing (email is acceptable)</li>
                      <li>• Should specify the date tenant intends to leave</li>
                      <li>• Notice period starts from day after notice is received</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-purple-600 pl-4">
                    <h4 className="font-semibold text-gray-900">End of Tenancy</h4>
                    <p className="text-sm text-gray-700">
                      Tenant vacates property, returns keys, and landlord conducts final inspection. Deposit is returned (minus legitimate deductions) within agreed timeframe.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-8">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Landlord Ending a PRT</h3>
                <p className="text-gray-700 mb-4">
                  Landlords must have one of <strong>18 legal grounds</strong> to end a PRT:
                </p>

                <div className="space-y-4">
                  <div className="border-l-4 border-red-600 pl-4">
                    <h4 className="font-semibold text-gray-900">Common Grounds Include:</h4>
                    <ul className="text-sm text-gray-700 space-y-1 mt-2">
                      <li>• <strong>Ground 1:</strong> Landlord intends to live in property (84 days notice)</li>
                      <li>• <strong>Ground 4:</strong> Landlord intends to sell property (84 days notice)</li>
                      <li>• <strong>Ground 8:</strong> Tenant has been in rent arrears for 3+ months (28 days notice)</li>
                      <li>• <strong>Ground 12:</strong> Tenant breach of tenancy terms (28 days notice)</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-orange-600 pl-4">
                    <h4 className="font-semibold text-gray-900">Eviction Process</h4>
                    <ul className="text-sm text-gray-700 space-y-1 mt-2">
                      <li>1. Serve Notice to Leave with valid ground(s)</li>
                      <li>2. Wait for notice period to expire</li>
                      <li>3. If tenant doesn't leave, apply to First-tier Tribunal</li>
                      <li>4. Tribunal hearing and decision</li>
                      <li>5. If granted, Tribunal issues eviction order</li>
                    </ul>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
                    <p className="text-sm text-amber-900 font-semibold">
                      ⚠️ Landlords cannot simply ask tenants to leave. You must have a valid ground, serve proper notice, and potentially apply to the Tribunal.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-primary text-white rounded-xl shadow-lg p-8">
              <h3 className="text-2xl font-semibold mb-4">Making Changes to a PRT</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold mb-2">Minor Changes</h4>
                  <p className="text-sm mb-3">
                    For small changes (e.g., adding a pet, changing payment method), both parties can agree in writing to amend the PRT. Keep a signed copy of any amendments.
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-2">Rent Increases</h4>
                  <p className="text-sm mb-3">
                    Landlords can increase rent once per year with <strong>3 months' notice</strong> using the prescribed Rent Increase Notice form. Tenants can challenge increases via the First-tier Tribunal if they believe the new rent is unreasonable.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Related Documents */}
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Related Documents for Scotland Tenancies</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <h3 className="text-xl font-semibold text-blue-600 mb-2">Notice to Leave</h3>
                <p className="text-gray-700 text-sm mb-3">
                  Official notice from landlord to tenant to end a PRT, stating the ground(s) for ending the tenancy and the notice period.
                </p>
                <Link href="/products/notice-to-leave" className="text-blue-600 hover:underline text-sm font-semibold">
                  Learn More →
                </Link>
              </div>

              <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <h3 className="text-xl font-semibold text-blue-600 mb-2">Rent Increase Notice</h3>
                <p className="text-gray-700 text-sm mb-3">
                  Prescribed form to notify tenants of rent increase (3 months' notice required, maximum once per year).
                </p>
                <span className="text-gray-400 text-sm">Coming Soon</span>
              </div>

              <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <h3 className="text-xl font-semibold text-blue-600 mb-2">Rental Inspection Report</h3>
                <p className="text-gray-700 text-sm mb-3">
                  Document property condition at start and end of tenancy for deposit protection and dispute resolution.
                </p>
                <span className="text-gray-400 text-sm">Coming Soon</span>
              </div>

              <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <h3 className="text-xl font-semibold text-blue-600 mb-2">Repairing Standard Enforcement Application</h3>
                <p className="text-gray-700 text-sm mb-3">
                  Apply to First-tier Tribunal if landlord fails to meet Repairing Standard obligations.
                </p>
                <span className="text-gray-400 text-sm">Coming Soon</span>
              </div>

              <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <h3 className="text-xl font-semibold text-blue-600 mb-2">Tenancy Application Form</h3>
                <p className="text-gray-700 text-sm mb-3">
                  Pre-tenancy form to collect tenant information and references before offering a PRT.
                </p>
                <span className="text-gray-400 text-sm">Coming Soon</span>
              </div>

              <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <h3 className="text-xl font-semibold text-blue-600 mb-2">Fair Rent Application</h3>
                <p className="text-gray-700 text-sm mb-3">
                  Tenant application to First-tier Tribunal to challenge excessive rent increases.
                </p>
                <span className="text-gray-400 text-sm">Coming Soon</span>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="container mx-auto px-4 py-12 bg-gradient-to-br from-purple-50 via-purple-100 to-purple-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>

            <div className="space-y-4">
              <details className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow">
                <summary className="font-semibold text-lg text-gray-900">
                  Is a Private Residential Tenancy (PRT) agreement legally valid in Scotland?
                </summary>
                <p className="mt-3 text-gray-700">
                  Yes. Our PRT agreements are drafted to comply with the Private Housing (Tenancies) (Scotland) Act 2016, Housing (Scotland) Act 2006, and all current Scottish tenancy legislation. Both Standard and Premium versions are legally binding when properly executed by landlord and tenant(s).
                </p>
              </details>

              <details className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow">
                <summary className="font-semibold text-lg text-gray-900">
                  Do I need to register as a landlord in Scotland?
                </summary>
                <p className="mt-3 text-gray-700">
                  <strong>Yes, it's mandatory.</strong> All landlords in Scotland must register with their local council before letting a property. You'll receive a landlord registration number which must be included in your PRT agreement. Failure to register is a <strong>criminal offense</strong> with fines up to <strong>£50,000</strong>. Register at least 4-6 weeks before your first tenancy starts at <a href="https://www.landlordregistrationscotland.gov.uk" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">landlordregistrationscotland.gov.uk</a>.
                </p>
              </details>

              <details className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow">
                <summary className="font-semibold text-lg text-gray-900">
                  What is the difference between Standard and Premium PRT agreements?
                </summary>
                <p className="mt-3 text-gray-700">
                  The <strong>Standard PRT (£39.99)</strong> covers all legal essentials for Scottish tenancies, including open-ended structure, 18 grounds for possession, Repairing Standard obligations, and landlord registration.
                </p>
                <p className="mt-2 text-gray-700">
                  The <strong>Premium PRT (£59.00)</strong> adds: comprehensive inventory section with white goods grid, exhaustive terms and conditions (13 detailed clauses), professional gradient styling (Scotland blue theme), rights of change clauses, enhanced legal compliance information boxes, detailed Repairing Standard explanation, First-tier Tribunal guidance, and superior professional presentation.
                </p>
              </details>

              <details className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow">
                <summary className="font-semibold text-lg text-gray-900">
                  What is the maximum deposit I can charge in Scotland?
                </summary>
                <p className="mt-3 text-gray-700">
                  In Scotland, the maximum deposit is <strong>2 months' rent</strong>. This is lower than England & Wales. Our wizard automatically validates your deposit amount to ensure compliance with Scottish law. You must also protect the deposit in an approved scheme (SafeDeposits Scotland, MyDeposits Scotland, or Letting Protection Service Scotland) within <strong>30 working days</strong>.
                </p>
              </details>

              <details className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow">
                <summary className="font-semibold text-lg text-gray-900">
                  Are PRTs fixed-term or open-ended?
                </summary>
                <p className="mt-3 text-gray-700">
                  All PRTs in Scotland are <strong>open-ended (periodic)</strong> by law. There is no fixed end date like England & Wales ASTs. The tenancy continues indefinitely until either party ends it with proper notice. This gives tenants greater security while landlords retain the ability to end tenancies with valid grounds (e.g., selling, moving in, rent arrears).
                </p>
              </details>

              <details className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow">
                <summary className="font-semibold text-lg text-gray-900">
                  How do I evict a tenant under a PRT?
                </summary>
                <p className="mt-3 text-gray-700">
                  Landlords must have one of <strong>18 legal grounds</strong> for eviction. Common grounds include:
                </p>
                <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
                  <li>Landlord intends to live in property (84 days' notice)</li>
                  <li>Landlord intends to sell (84 days' notice)</li>
                  <li>Rent arrears of 3+ consecutive months (28 days' notice)</li>
                  <li>Breach of tenancy terms (28 days' notice)</li>
                </ul>
                <p className="mt-2 text-gray-700">
                  You must serve a <strong>Notice to Leave</strong> with the correct notice period. If the tenant doesn't leave voluntarily, you must apply to the <strong>First-tier Tribunal for Scotland (Housing and Property Chamber)</strong> for an eviction order. You cannot forcibly remove tenants yourself.
                </p>
              </details>

              <details className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow">
                <summary className="font-semibold text-lg text-gray-900">
                  What is the Repairing Standard?
                </summary>
                <p className="mt-3 text-gray-700">
                  The <strong>Repairing Standard</strong> is the minimum legal standard for the physical condition of private rented properties in Scotland. Landlords must ensure:
                </p>
                <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
                  <li>Property is wind and watertight, with sound structure and exterior</li>
                  <li>All installations for water, gas, electricity, heating, and sanitation are safe and working</li>
                  <li>Fixtures, fittings, and appliances provided are in reasonable state of repair</li>
                  <li>Common areas are in reasonable state of repair and safe</li>
                  <li>Residual current devices (RCDs) are installed for electrical safety</li>
                </ul>
                <p className="mt-2 text-gray-700">
                  If your landlord fails to meet the Repairing Standard, you can apply to the First-tier Tribunal for enforcement.
                </p>
              </details>

              <details className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow">
                <summary className="font-semibold text-lg text-gray-900">
                  Can I increase the rent during a PRT?
                </summary>
                <p className="mt-3 text-gray-700">
                  Yes, but with restrictions. Landlords can increase rent <strong>once per year</strong> using the prescribed <strong>Rent Increase Notice</strong> form. You must give <strong>3 months' notice</strong>. Tenants can challenge the increase via the First-tier Tribunal if they believe the new rent is unreasonable compared to similar properties. The Tribunal can reduce the increase or reject it entirely.
                </p>
              </details>

              <details className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow">
                <summary className="font-semibold text-lg text-gray-900">
                  Can tenants have pets?
                </summary>
                <p className="mt-3 text-gray-700">
                  It's up to the landlord. Our wizard asks whether pets are allowed, what types, and how many. The Scottish Government encourages landlords to consider pet requests positively. If you allow pets, you can request a higher deposit (up to the 2 months' rent maximum) or require pet insurance. You cannot charge additional "pet rent" or pet fees beyond the deposit cap.
                </p>
              </details>

              <details className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow">
                <summary className="font-semibold text-lg text-gray-900">
                  Do I need an HMO licence?
                </summary>
                <p className="mt-3 text-gray-700">
                  If you're letting to <strong>3 or more unrelated tenants</strong> who share facilities (kitchen, bathroom), your property may be a <strong>House in Multiple Occupation (HMO)</strong> and require a licence from your local council. HMO licensing requirements vary by council. Check with your local authority before letting. Failure to licence an HMO is a criminal offense.
                </p>
              </details>

              <details className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow">
                <summary className="font-semibold text-lg text-gray-900">
                  How quickly can I get my PRT agreement?
                </summary>
                <p className="mt-3 text-gray-700">
                  Immediately! Our wizard takes approximately 10-15 minutes to complete. Once you've answered all questions and paid, your professionally formatted PRT is generated instantly and available for download as a PDF. You can print it, email it to tenants, or use it digitally with e-signature services.
                </p>
              </details>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto bg-primary rounded-2xl shadow-2xl p-12 text-center text-white">
            <h2 className="text-4xl font-bold mb-4">Ready to Create Your PRT Agreement?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join Scottish landlords who trust Landlord Heaven for legally compliant, professional tenancy agreements.
            </p>
            <div className="flex gap-6 justify-center flex-wrap">
              <Link
                href="/wizard?jurisdiction=scotland&document_type=prt_agreement"
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-lg shadow-lg"
              >
                Standard PRT - £39.99
              </Link>
              <Link
                href="/wizard?jurisdiction=scotland&document_type=prt_premium"
                className="bg-yellow-400 text-gray-900 px-8 py-4 rounded-lg font-semibold hover:bg-yellow-300 transition-colors text-lg shadow-lg"
              >
                Premium PRT - £59.00 ⭐
              </Link>
            </div>
            <p className="mt-6 text-sm opacity-75">
              Instant download • Compliant with PH(T)(S) Act 2016 • No subscription required
            </p>
          </div>
        </section>

        {/* SEO Internal Links Section */}
        <section className="container mx-auto px-4 py-8 border-t border-gray-200">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Other UK Jurisdictions</h3>
            <div className="flex gap-6 flex-wrap">
              <Link href="/tenancy-agreements/england-wales" className="text-blue-600 hover:underline font-semibold">
                England & Wales Assured Shorthold Tenancy (AST) →
              </Link>
              <Link href="/tenancy-agreements/northern-ireland" className="text-blue-600 hover:underline font-semibold">
                Northern Ireland Private Tenancy →
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
