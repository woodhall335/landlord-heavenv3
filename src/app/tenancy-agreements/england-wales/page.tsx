import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Assured Shorthold Tenancy Agreement (AST) | England & Wales | Landlord Heaven',
  description: 'Create a legally compliant Assured Shorthold Tenancy Agreement for England & Wales. Covers Housing Act 1988, Tenant Fees Act 2019, and all legal requirements. Standard (£9.99) and Premium (£14.99) options available.',
  keywords: 'AST, Assured Shorthold Tenancy, tenancy agreement England Wales, AST agreement, residential tenancy UK, landlord forms, rental agreement, housing act 1988, tenant fees act 2019',
  openGraph: {
    title: 'Assured Shorthold Tenancy Agreement (AST) | England & Wales',
    description: 'Create a legally compliant AST for England & Wales. Standard (£9.99) and Premium (£14.99) options.',
    type: 'website',
    url: 'https://landlordheaven.co.uk/tenancy-agreements/england-wales',
  },
};

export default function EnglandWalesASTPage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Is an Assured Shorthold Tenancy Agreement legally valid?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Our AST agreements are drafted to comply with the Housing Act 1988, Landlord and Tenant Act 1985, Tenant Fees Act 2019, and all current England & Wales tenancy legislation. Both Standard and Premium versions are legally binding when properly executed.',
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
          text: 'The Standard AST (£9.99) covers all legal essentials for a compliant tenancy. The Premium AST (£14.99) adds comprehensive inventory sections, exhaustive terms and conditions (13 detailed clauses), professional gradient styling, rights of change clauses, and enhanced legal compliance information boxes.',
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
    name: 'Assured Shorthold Tenancy Agreement (AST)',
    description: 'Legally compliant AST agreement for England & Wales',
    offers: [
      {
        '@type': 'Offer',
        name: 'Standard AST',
        price: '9.99',
        priceCurrency: 'GBP',
      },
      {
        '@type': 'Offer',
        name: 'Premium AST',
        price: '14.99',
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
            <span className="text-gray-900">England & Wales</span>
          </nav>
        </div>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Assured Shorthold Tenancy Agreement (AST)
              <span className="block text-3xl text-blue-600 mt-2">England & Wales</span>
            </h1>
            <p className="text-xl text-gray-700 mb-8">
              Create a legally compliant Assured Shorthold Tenancy Agreement in minutes. Fully compliant with the Housing Act 1988, Tenant Fees Act 2019, and all current England & Wales legislation.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/wizard?jurisdiction=england-wales&document_type=ast_standard"
                className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-lg"
              >
                Create Standard AST - £9.99
              </Link>
              <Link
                href="/wizard?jurisdiction=england-wales&document_type=ast_premium"
                className="bg-primary text-white px-8 py-4 rounded-lg font-semibold hover:hover:bg-primary-dark transition-colors text-lg"
              >
                Create Premium AST - £14.99
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
                An <strong>Assured Shorthold Tenancy (AST)</strong> is the most common type of residential tenancy agreement used in England and Wales. It is a legal contract between a landlord and tenant(s) that grants the tenant(s) the right to occupy a property for a specified period, typically 6 or 12 months, with the option to renew or continue on a periodic (rolling) basis.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                ASTs are governed by the <strong>Housing Act 1988</strong> (as amended by the Housing Act 1996) and provide both landlords and tenants with important legal protections and obligations. The agreement sets out the terms of the tenancy, including rent amount, payment frequency, deposit details, tenant responsibilities, and landlord obligations.
              </p>
              <div className="bg-blue-50 border-l-4 border-blue-600 p-6 my-6">
                <h3 className="text-xl font-semibold text-blue-900 mb-2">Alternative Names</h3>
                <p className="text-gray-700">
                  AST agreements may also be referred to as:
                </p>
                <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
                  <li>Assured Shorthold Tenancy Agreement</li>
                  <li>AST Contract</li>
                  <li>Residential Tenancy Agreement (England & Wales)</li>
                  <li>Private Rental Agreement</li>
                  <li>Shorthold Tenancy</li>
                </ul>
              </div>
              <p className="text-gray-700 leading-relaxed">
                Since the Housing Act 1996 came into force, all new residential tenancies in England and Wales are automatically ASTs unless the landlord takes specific steps to create a different type of tenancy. This makes the AST the default and most widely used tenancy type for private residential lettings.
              </p>
            </div>
          </div>
        </section>

        {/* UK Residential Tenancy Laws */}
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">England & Wales Residential Tenancy Laws</h2>
            <p className="text-gray-700 mb-6">
              Assured Shorthold Tenancies in England and Wales are governed by comprehensive legislation that protects both landlords and tenants. Understanding these laws is essential for creating a legally compliant tenancy agreement.
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
                      <span className="text-sm font-normal text-gray-600">(as amended by Housing Act 1996)</span>
                    </td>
                    <td className="border border-gray-300 px-4 py-3">
                      • Defines AST tenancies and their legal status<br />
                      • Sets out grounds for possession (eviction)<br />
                      • Establishes Section 21 (no-fault eviction) and Section 8 (fault-based eviction) procedures<br />
                      • Regulates rent increases under Section 13
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3 font-semibold">
                      Landlord and Tenant Act 1985
                    </td>
                    <td className="border border-gray-300 px-4 py-3">
                      • Landlord's repairing obligations (structure, exterior, installations)<br />
                      • Tenant's right to request information about landlord/superior landlord<br />
                      • Service charge provisions for some properties
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3 font-semibold">
                      Tenant Fees Act 2019
                    </td>
                    <td className="border border-gray-300 px-4 py-3">
                      • Caps security deposits (5 weeks' rent for annual rent under £50,000; 6 weeks for £50,000+)<br />
                      • Bans most tenant fees (only rent, deposits, and specific permitted payments allowed)<br />
                      • Requires holding deposit to be capped at 1 week's rent
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3 font-semibold">
                      Deregulation Act 2015
                    </td>
                    <td className="border border-gray-300 px-4 py-3">
                      • Retaliatory eviction protections for tenants<br />
                      • Section 21 notice requirements (How to Rent guide, deposit protection, gas/EPC certificates)<br />
                      • Tenancy deposit protection scheme rules
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3 font-semibold">
                      Gas Safety (Installation and Use) Regulations 1998
                    </td>
                    <td className="border border-gray-300 px-4 py-3">
                      • Annual gas safety checks required for all gas appliances<br />
                      • Gas Safety Certificate (CP12) must be provided to tenants within 28 days of check
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3 font-semibold">
                      Electrical Safety Standards in the Private Rented Sector (England) Regulations 2020
                    </td>
                    <td className="border border-gray-300 px-4 py-3">
                      • Electrical Installation Condition Report (EICR) required every 5 years<br />
                      • Copy must be provided to tenants and local authority (if requested)
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3 font-semibold">
                      Smoke and Carbon Monoxide Alarm (England) Regulations 2015
                    </td>
                    <td className="border border-gray-300 px-4 py-3">
                      • Smoke alarms required on every storey<br />
                      • Carbon monoxide alarms required in rooms with solid fuel appliances
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3 font-semibold">
                      Energy Performance of Buildings (England and Wales) Regulations 2012
                    </td>
                    <td className="border border-gray-300 px-4 py-3">
                      • Valid Energy Performance Certificate (EPC) required before marketing<br />
                      • Minimum EPC rating of E (unless exempt)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-amber-50 border-l-4 border-amber-600 p-6 mt-6">
              <h3 className="text-xl font-semibold text-amber-900 mb-2">Renters Reform Bill (Pending)</h3>
              <p className="text-gray-700">
                The UK Government has proposed the <strong>Renters (Reform) Bill</strong> which will introduce significant changes to the private rental sector, including abolishing Section 21 'no-fault' evictions and replacing ASTs with a new periodic tenancy structure. Our agreements will be updated to reflect these changes once the Bill becomes law.
              </p>
            </div>
          </div>
        </section>

        {/* Types of Tenancy Agreements */}
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Types of Tenancy Agreements in England & Wales</h2>

            <div className="space-y-6">
              <div className="border-l-4 border-blue-600 pl-6">
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">1. Fixed-Term AST</h3>
                <p className="text-gray-700 mb-2">
                  The most common type of AST, running for a specific period (typically 6 or 12 months). During the fixed term, neither party can end the tenancy early unless there is a break clause or both parties agree.
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li><strong>Typical duration:</strong> 6 months or 12 months</li>
                  <li><strong>Certainty:</strong> Both parties have guaranteed occupation/income for the term</li>
                  <li><strong>Ending:</strong> Automatically becomes periodic unless renewed or ended with proper notice</li>
                </ul>
              </div>

              <div className="border-l-4 border-green-600 pl-6">
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">2. Periodic (Rolling) AST</h3>
                <p className="text-gray-700 mb-2">
                  A tenancy that runs week-to-week or month-to-month with no fixed end date. Often created when a fixed-term AST expires and continues on the same terms.
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li><strong>Flexibility:</strong> Either party can end with proper notice (usually 2 months for Section 21)</li>
                  <li><strong>Same terms:</strong> All original AST terms continue to apply</li>
                  <li><strong>Common scenario:</strong> Tenants staying on after initial fixed term expires</li>
                </ul>
              </div>

              <div className="border-l-4 border-purple-600 pl-6">
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">3. AST with Break Clause</h3>
                <p className="text-gray-700 mb-2">
                  A fixed-term AST that includes a clause allowing either party to end the tenancy early after a specified period (commonly 6 months into a 12-month tenancy).
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li><strong>Flexibility:</strong> Allows early termination without breaking the contract</li>
                  <li><strong>Notice required:</strong> Typically 2 months' notice to activate break clause</li>
                  <li><strong>Mutual benefit:</strong> Can work for either landlord or tenant (or both)</li>
                </ul>
              </div>

              <div className="border-l-4 border-orange-600 pl-6">
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">4. Joint Tenancy AST</h3>
                <p className="text-gray-700 mb-2">
                  Multiple tenants share the same tenancy agreement with joint and several liability. All tenants sign the same AST document.
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li><strong>Joint liability:</strong> All tenants are equally responsible for rent and obligations</li>
                  <li><strong>Common use:</strong> House shares, couples, flatmates</li>
                  <li><strong>Ending:</strong> One tenant leaving doesn't automatically end the tenancy for others</li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
                <h3 className="text-xl font-semibold text-blue-900 mb-3">What About Rent-to-Own or Option to Purchase?</h3>
                <p className="text-gray-700">
                  While standard AST agreements do not include rent-to-own provisions, it is possible to create a separate <strong>Option Agreement</strong> or <strong>Lease-Purchase Agreement</strong> that runs alongside the AST. This gives the tenant the option (but not obligation) to purchase the property at the end of the tenancy or during the term. These arrangements require specialist legal advice and documentation beyond a standard AST.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits of AST Agreements */}
        <section className="container mx-auto px-4 py-12 bg-gradient-to-br from-purple-50 via-purple-100 to-purple-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Benefits of a Written Tenancy Agreement</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-blue-600">
                <div className="text-4xl mb-4">📝</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Legal Protection</h3>
                <p className="text-gray-700">
                  A written AST provides clear legal protection for both parties. It establishes the tenancy under the Housing Act 1988, giving landlords the right to regain possession and tenants the right to quiet enjoyment.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-green-600">
                <div className="text-4xl mb-4">💰</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Financial Clarity</h3>
                <p className="text-gray-700">
                  The agreement clearly states rent amount, payment dates, deposit details, and any permitted charges. This prevents disputes and ensures both parties understand their financial obligations.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-purple-600">
                <div className="text-4xl mb-4">⚖️</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Dispute Resolution</h3>
                <p className="text-gray-700">
                  In case of disagreements, a written agreement serves as evidence of what was agreed. Courts and dispute resolution services will refer to the written AST when making decisions.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-orange-600">
                <div className="text-4xl mb-4">🔒</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Clear Responsibilities</h3>
                <p className="text-gray-700">
                  The AST defines who is responsible for repairs, maintenance, utilities, council tax, and other obligations. This clarity prevents misunderstandings and ensures proper property care.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-red-600">
                <div className="text-4xl mb-4">🛡️</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Compliance Evidence</h3>
                <p className="text-gray-700">
                  A comprehensive AST demonstrates compliance with legal requirements such as deposit protection, How to Rent guide provision, and safety certificate obligations.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-indigo-600">
                <div className="text-4xl mb-4">📋</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Professional Standard</h3>
                <p className="text-gray-700">
                  Using a professional, comprehensive AST agreement demonstrates professionalism, builds tenant confidence, and sets the tone for a positive landlord-tenant relationship.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Who Should Use an AST */}
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Who Should Use an AST Agreement?</h2>

            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-3xl">
                  🏠
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Private Landlords</h3>
                  <p className="text-gray-700">
                    Individual property owners renting out residential properties in England or Wales. This includes buy-to-let investors, accidental landlords, and those renting out a second home.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="shrink-0 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl">
                  🏢
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Property Management Companies</h3>
                  <p className="text-gray-700">
                    Letting agents and property management firms acting on behalf of landlords to let and manage residential properties. ASTs form the foundation of most private rental arrangements.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="shrink-0 w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-3xl">
                  💼
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Portfolio Landlords</h3>
                  <p className="text-gray-700">
                    Landlords with multiple rental properties who need consistent, legally compliant tenancy agreements across their portfolio. Our templates ensure standardization and compliance.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="shrink-0 w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-3xl">
                  🔑
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">First-Time Landlords</h3>
                  <p className="text-gray-700">
                    New landlords who need a comprehensive, legally compliant agreement without the expense of solicitor fees. Our wizard guides you through all necessary information to create a professional AST.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="shrink-0 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-3xl">
                  🏘️
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Property Companies & Developers</h3>
                  <p className="text-gray-700">
                    Companies that own residential properties and rent them to tenants. AST agreements provide the legal framework for these commercial rental arrangements.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 border-l-4 border-red-600 p-6 mt-8">
              <h3 className="text-xl font-semibold text-red-900 mb-2">When NOT to Use an AST</h3>
              <p className="text-gray-700 mb-3">AST agreements are NOT suitable for:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li><strong>Lodgers:</strong> Use a Lodger Agreement (licence to occupy) when the landlord lives in the same property</li>
                <li><strong>Social Housing:</strong> Council and housing association tenancies use different agreements</li>
                <li><strong>Commercial Properties:</strong> Use a Commercial Lease for shops, offices, or business premises</li>
                <li><strong>Holiday Lets:</strong> Short-term holiday rentals require different documentation</li>
                <li><strong>Company Lets:</strong> When renting to a company (not individuals), different terms may apply</li>
                <li><strong>High-Value Properties:</strong> Properties with annual rent over £100,000 cannot be ASTs (as of October 2010)</li>
              </ul>
            </div>
          </div>
        </section>

        {/* How to Write an AST */}
        <section className="container mx-auto px-4 py-12 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">How to Write an AST Agreement</h2>

            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <p className="text-gray-700 text-lg mb-6">
                Our intelligent wizard guides you through creating a comprehensive AST agreement in approximately 10-15 minutes. We ask 70+ questions across 15 sections to ensure your agreement is complete and legally compliant.
              </p>

              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Information You'll Need to Provide:</h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Property Details</h4>
                      <p className="text-sm text-gray-600">Full address, property type, number of bedrooms, furnished/unfurnished status, white goods included</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Landlord Information</h4>
                      <p className="text-sm text-gray-600">Full name, address, contact details, whether using a managing agent</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Tenant Information</h4>
                      <p className="text-sm text-gray-600">All tenant names, contact details, emergency contacts (supports multiple tenants for joint tenancies)</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">4</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Financial Terms</h4>
                      <p className="text-sm text-gray-600">Rent amount, payment frequency, payment method, first rent payment date</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">5</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Deposit Details</h4>
                      <p className="text-sm text-gray-600">Deposit amount (validated against Tenant Fees Act limits), chosen deposit protection scheme</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">6</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Tenancy Period</h4>
                      <p className="text-sm text-gray-600">Start date, fixed-term duration (or periodic tenancy), break clause options</p>
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
                      <h4 className="font-semibold text-gray-900">Permitted Occupants</h4>
                      <p className="text-sm text-gray-600">Pets allowed, maximum occupants, children, overnight guests policy</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">9</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Legal Compliance & Safety</h4>
                      <p className="text-sm text-gray-600">Gas safety certificate, EPC rating, electrical safety certificate, smoke/CO alarms, How to Rent guide</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">10</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Maintenance & Repairs</h4>
                      <p className="text-sm text-gray-600">Landlord maintenance responsibilities, garden maintenance, repairs reporting, emergency contacts</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">11</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Property Condition</h4>
                      <p className="text-sm text-gray-600">Inventory provided, professional cleaning requirements, decoration condition</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">12</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Additional Terms</h4>
                      <p className="text-sm text-gray-600">Subletting policy, rent increase clause, insurance requirements</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">13</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Access & Inspections</h4>
                      <p className="text-sm text-gray-600">Notice period for landlord access, inspection frequency, end-of-tenancy viewings</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">14</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Parking & Outside Space</h4>
                      <p className="text-sm text-gray-600">Parking availability, allocated spaces, garden/balcony access, communal areas</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-primary text-white rounded-xl shadow-lg p-8">
              <h3 className="text-2xl font-semibold mb-4">Two Options to Suit Your Needs</h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white/10 backdrop-blur rounded-lg p-6">
                  <h4 className="text-xl font-bold mb-3">Standard AST - £9.99</h4>
                  <ul className="space-y-2 text-sm">
                    <li>✓ All legal essentials included</li>
                    <li>✓ Compliant with Housing Act 1988 & Tenant Fees Act 2019</li>
                    <li>✓ Clear, professional formatting</li>
                    <li>✓ Deposit protection clause</li>
                    <li>✓ Standard terms & conditions</li>
                    <li>✓ Suitable for most residential lettings</li>
                  </ul>
                  <Link
                    href="/wizard?jurisdiction=england-wales&document_type=ast_standard"
                    className="mt-4 block text-center bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                  >
                    Create Standard AST
                  </Link>
                </div>

                <div className="bg-white/10 backdrop-blur rounded-lg p-6 border-2 border-white/50">
                  <div className="inline-block bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold mb-2">
                    RECOMMENDED
                  </div>
                  <h4 className="text-xl font-bold mb-3">Premium AST - £14.99</h4>
                  <ul className="space-y-2 text-sm">
                    <li>✓ Everything in Standard PLUS:</li>
                    <li>✓ Comprehensive inventory section with white goods grid</li>
                    <li>✓ Exhaustive terms & conditions (13 detailed clauses)</li>
                    <li>✓ Professional gradient styling & branding</li>
                    <li>✓ Rights of change clauses for flexibility</li>
                    <li>✓ Enhanced legal compliance information boxes</li>
                    <li>✓ Landlord & Tenant Act 1985 repair obligations detail</li>
                    <li>✓ Superior professional presentation</li>
                  </ul>
                  <Link
                    href="/wizard?jurisdiction=england-wales&document_type=ast_premium"
                    className="mt-4 block text-center bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
                  >
                    Create Premium AST
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
                <strong>Yes.</strong> All adults who will be living in the property as tenants must be named on the AST agreement and must sign it. This is a legal requirement and protects both the landlord and the tenants.
              </p>

              <div className="bg-green-50 border-l-4 border-green-600 p-6 mb-6">
                <h3 className="text-xl font-semibold text-green-900 mb-3">Why All Tenants Must Be Named</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li><strong>Joint and Several Liability:</strong> When multiple tenants sign an AST, they become "jointly and severally liable." This means each tenant is individually responsible for the full rent and all obligations, not just their share.</li>
                  <li><strong>Legal Protection:</strong> Only named tenants have legal rights under the tenancy (e.g., protection from eviction, right to quiet enjoyment).</li>
                  <li><strong>Deposit Protection:</strong> The deposit must be protected in relation to all named tenants on the agreement.</li>
                  <li><strong>Eviction Rights:</strong> Only named tenants have the legal protections against eviction under the Housing Act 1988.</li>
                </ul>
              </div>

              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Tenants vs. Occupants: What's the Difference?</h3>

              <div className="overflow-x-auto mb-6">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-blue-600 text-white">
                      <th className="border border-gray-300 px-4 py-3 text-left">Tenants (Must Be Named)</th>
                      <th className="border border-gray-300 px-4 py-3 text-left">Occupants (Don't Need to Be Named)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-3">
                        • Adults (18+) living in the property<br />
                        • Paying rent or contributing to household<br />
                        • Intending to live there long-term<br />
                        • Couples (married or unmarried)<br />
                        • Flatmates/housemates
                      </td>
                      <td className="border border-gray-300 px-4 py-3">
                        • Children under 18<br />
                        • Visiting relatives (short-term)<br />
                        • Overnight guests<br />
                        • Live-in caregivers (in some cases)<br />
                        • Anyone not contributing to rent
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-amber-50 border-l-4 border-amber-600 p-6 mb-6">
                <h3 className="text-xl font-semibold text-amber-900 mb-3">Common Scenarios</h3>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900">Scenario 1: Couple Renting Together</h4>
                    <p className="text-gray-700 text-sm">Both partners must be named as tenants, even if only one is paying the rent. Both sign the AST and are jointly liable.</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900">Scenario 2: Student House Share (4 people)</h4>
                    <p className="text-gray-700 text-sm">All 4 students must be named and sign the AST. They are jointly and severally liable for the full rent.</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900">Scenario 3: Tenant with Children</h4>
                    <p className="text-gray-700 text-sm">Only the adult tenant(s) need to be named. Children under 18 are occupants and don't sign the agreement.</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900">Scenario 4: One Tenant Wants to Move Out Mid-Tenancy</h4>
                    <p className="text-gray-700 text-sm">Complicated! The tenant remains liable unless: (a) all tenants agree to end the tenancy and start a new one, or (b) the landlord agrees to release them and create a new AST with remaining tenants.</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-blue-900 mb-3">Our Wizard Supports Multiple Tenants</h3>
                <p className="text-gray-700">
                  Our intelligent wizard asks how many tenants will be living in the property and collects details for each one. The generated AST automatically includes all tenant names and creates signature blocks for each tenant, ensuring legal compliance.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Changing or Ending an AST */}
        <section className="container mx-auto px-4 py-12 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Changing or Ending an AST Agreement</h2>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Making Changes to an Existing AST</h3>
                <p className="text-gray-700 mb-4">
                  Once an AST is signed, both parties are bound by its terms. However, changes can be made with mutual agreement:
                </p>

                <div className="space-y-4">
                  <div className="border-l-4 border-blue-600 pl-4">
                    <h4 className="font-semibold text-gray-900">1. Lease Addendum (Amendment)</h4>
                    <p className="text-sm text-gray-700">
                      For minor changes (e.g., allowing a pet, changing rent payment date), create a <strong>Lease Addendum</strong> that both parties sign. This becomes part of the original AST.
                    </p>
                  </div>

                  <div className="border-l-4 border-green-600 pl-4">
                    <h4 className="font-semibold text-gray-900">2. New Agreement</h4>
                    <p className="text-sm text-gray-700">
                      For major changes (e.g., rent increase outside clause, adding/removing tenants), it's cleaner to end the current tenancy and create a new AST with updated terms.
                    </p>
                  </div>

                  <div className="border-l-4 border-purple-600 pl-4">
                    <h4 className="font-semibold text-gray-900">3. Informal Agreement</h4>
                    <p className="text-sm text-gray-700">
                      For very minor, temporary changes, landlord and tenant may agree informally. However, this is risky as it's not legally documented.
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                  <p className="text-sm text-blue-900 font-semibold">
                    ⚠️ Both parties must agree to any changes. A landlord cannot unilaterally change terms, and neither can a tenant.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-8">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Ending an AST</h3>
                <p className="text-gray-700 mb-4">
                  How a tenancy ends depends on whether it's fixed-term or periodic, and who is ending it:
                </p>

                <div className="space-y-4">
                  <div className="border-l-4 border-red-600 pl-4">
                    <h4 className="font-semibold text-gray-900">Landlord Ending Tenancy</h4>
                    <ul className="text-sm text-gray-700 space-y-1 mt-2">
                      <li>• <strong>Section 21 Notice:</strong> No-fault eviction (2 months' notice, can't be served in first 4 months)</li>
                      <li>• <strong>Section 8 Notice:</strong> Fault-based (rent arrears, breach of agreement, etc.)</li>
                      <li>• Must comply with strict legal requirements (deposit protection, certificates, How to Rent guide)</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-orange-600 pl-4">
                    <h4 className="font-semibold text-gray-900">Tenant Ending Tenancy</h4>
                    <ul className="text-sm text-gray-700 space-y-1 mt-2">
                      <li>• <strong>Fixed-term:</strong> Can't end early unless break clause exists or landlord agrees</li>
                      <li>• <strong>Periodic:</strong> Give at least 1 month's notice (or notice period in agreement)</li>
                      <li>• Notice must expire on last day of tenancy period (usually rent day)</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-green-600 pl-4">
                    <h4 className="font-semibold text-gray-900">Mutual Agreement</h4>
                    <ul className="text-sm text-gray-700 space-y-1 mt-2">
                      <li>• Both parties can agree to end tenancy early at any time</li>
                      <li>• Should be documented in writing (surrender agreement)</li>
                      <li>• Deposit must be returned (minus any legitimate deductions)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-primary text-white rounded-xl shadow-lg p-8">
              <h3 className="text-2xl font-semibold mb-4">Break Clauses: Built-In Flexibility</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold mb-2">What is a Break Clause?</h4>
                  <p className="text-sm">
                    A break clause allows either party (or both) to end a fixed-term AST early, typically after a minimum period (e.g., 6 months into a 12-month tenancy).
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-2">How Our Wizard Handles This</h4>
                  <p className="text-sm">
                    During the wizard, we ask if you want to include a break clause, after how many months it can be activated, and how much notice is required. This gives you flexibility while maintaining legal clarity.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Related Documents */}
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Related Documents for England & Wales Tenancies</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <h3 className="text-xl font-semibold text-blue-600 mb-2">Section 21 Notice</h3>
                <p className="text-gray-700 text-sm mb-3">
                  No-fault eviction notice requiring tenants to leave. Must give at least 2 months' notice and comply with strict legal requirements.
                </p>
                <Link href="/products/section21" className="text-blue-600 hover:underline text-sm font-semibold">
                  Learn More →
                </Link>
              </div>

              <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <h3 className="text-xl font-semibold text-blue-600 mb-2">Section 8 Notice</h3>
                <p className="text-gray-700 text-sm mb-3">
                  Fault-based eviction notice for serious breaches such as rent arrears, property damage, or breach of tenancy terms.
                </p>
                <Link href="/products/section8" className="text-blue-600 hover:underline text-sm font-semibold">
                  Learn More →
                </Link>
              </div>

              <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <h3 className="text-xl font-semibold text-blue-600 mb-2">Rental Inspection Report</h3>
                <p className="text-gray-700 text-sm mb-3">
                  Document property condition at start and end of tenancy. Essential evidence for deposit disputes.
                </p>
                <span className="text-gray-400 text-sm">Coming Soon</span>
              </div>

              <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <h3 className="text-xl font-semibold text-blue-600 mb-2">Lease Addendum</h3>
                <p className="text-gray-700 text-sm mb-3">
                  Amend or add terms to an existing AST without creating a whole new agreement. Both parties must agree.
                </p>
                <span className="text-gray-400 text-sm">Coming Soon</span>
              </div>

              <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <h3 className="text-xl font-semibold text-blue-600 mb-2">Rent Increase Notice</h3>
                <p className="text-gray-700 text-sm mb-3">
                  Formal notice under Section 13 Housing Act 1988 to increase rent during a periodic tenancy.
                </p>
                <span className="text-gray-400 text-sm">Coming Soon</span>
              </div>

              <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <h3 className="text-xl font-semibold text-blue-600 mb-2">Tenancy Application Form</h3>
                <p className="text-gray-700 text-sm mb-3">
                  Pre-tenancy application form to collect tenant information, references, and conduct right-to-rent checks.
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
                  Is an Assured Shorthold Tenancy Agreement legally valid?
                </summary>
                <p className="mt-3 text-gray-700">
                  Yes. Our AST agreements are drafted to comply with the Housing Act 1988, Landlord and Tenant Act 1985, Tenant Fees Act 2019, and all current England & Wales tenancy legislation. Both Standard and Premium versions are legally binding when properly executed by both parties.
                </p>
              </details>

              <details className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow">
                <summary className="font-semibold text-lg text-gray-900">
                  Can I edit the tenancy agreement after downloading?
                </summary>
                <p className="mt-3 text-gray-700">
                  Our wizard collects all necessary information upfront to generate a complete, ready-to-sign agreement. If you need to make changes after generation, you can create a new agreement through the wizard (your answers are saved) or use a Lease Addendum for minor modifications after signing.
                </p>
              </details>

              <details className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow">
                <summary className="font-semibold text-lg text-gray-900">
                  What is the difference between Standard and Premium AST agreements?
                </summary>
                <p className="mt-3 text-gray-700">
                  The <strong>Standard AST (£9.99)</strong> covers all legal essentials for a compliant tenancy, including deposit protection, tenancy terms, landlord/tenant obligations, and standard conditions.
                </p>
                <p className="mt-2 text-gray-700">
                  The <strong>Premium AST (£14.99)</strong> adds: comprehensive inventory sections with white goods grid, exhaustive terms and conditions (13 detailed clauses covering every scenario), professional gradient styling, rights of change clauses for flexibility, enhanced legal compliance information boxes, detailed repair obligations under Landlord & Tenant Act 1985, and superior professional presentation that impresses tenants and agents.
                </p>
              </details>

              <details className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow">
                <summary className="font-semibold text-lg text-gray-900">
                  Can I use this for lodgers or live-in landlords?
                </summary>
                <p className="mt-3 text-gray-700">
                  No. AST agreements are for self-contained properties where the landlord does not live in the same building. For lodgers (where you share living space, kitchen, or bathroom with your tenant), you need a <strong>Lodger Agreement</strong> which creates a licence to occupy, not a tenancy. Lodgers have different legal rights and you don't need a court order to evict them.
                </p>
              </details>

              <details className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow">
                <summary className="font-semibold text-lg text-gray-900">
                  Do all tenants need to be named on the agreement?
                </summary>
                <p className="mt-3 text-gray-700">
                  Yes. All adults (18+) who will be living in the property as tenants must be named on the AST and sign it. They all become jointly and severally liable for rent and tenancy obligations. Children and visiting relatives do not need to be named as they are occupants, not tenants.
                </p>
              </details>

              <details className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow">
                <summary className="font-semibold text-lg text-gray-900">
                  Does the agreement include the How to Rent guide?
                </summary>
                <p className="mt-3 text-gray-700">
                  The AST agreement itself does not include the How to Rent guide, but our wizard asks if you have provided it. You must provide the latest version of the <strong>How to Rent: The checklist for renting in England</strong> guide to your tenants before they sign the AST. This is a legal requirement, and failure to provide it can prevent you from serving a Section 21 notice. You can download it free from GOV.UK.
                </p>
              </details>

              <details className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow">
                <summary className="font-semibold text-lg text-gray-900">
                  What is the maximum deposit I can charge?
                </summary>
                <p className="mt-3 text-gray-700">
                  Under the Tenant Fees Act 2019:
                </p>
                <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
                  <li>For annual rent <strong>under £50,000</strong>: Maximum deposit is <strong>5 weeks' rent</strong></li>
                  <li>For annual rent <strong>£50,000 or more</strong>: Maximum deposit is <strong>6 weeks' rent</strong></li>
                </ul>
                <p className="mt-2 text-gray-700">
                  Our wizard automatically validates your deposit amount against these limits based on your rent amount, preventing you from accidentally breaching the law.
                </p>
              </details>

              <details className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow">
                <summary className="font-semibold text-lg text-gray-900">
                  Can I include a rent increase clause?
                </summary>
                <p className="mt-3 text-gray-700">
                  Yes. Our wizard asks if you want to include a rent increase clause and how frequently rent can be reviewed (e.g., annually). Any rent increase must follow proper procedures:
                </p>
                <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
                  <li><strong>During fixed-term:</strong> Only if clause exists in AST and proper notice given</li>
                  <li><strong>During periodic tenancy:</strong> Use Section 13 notice (minimum 1 month notice for monthly tenancies)</li>
                  <li>Tenant can challenge unreasonable increases via First-tier Tribunal</li>
                </ul>
              </details>

              <details className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow">
                <summary className="font-semibold text-lg text-gray-900">
                  Do I need to protect the deposit?
                </summary>
                <p className="mt-3 text-gray-700">
                  <strong>Yes, it's the law.</strong> In England and Wales, you must protect your tenant's deposit in a government-approved tenancy deposit protection (TDP) scheme within <strong>30 days</strong> of receiving it. The three schemes are:
                </p>
                <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
                  <li>Deposit Protection Service (DPS)</li>
                  <li>MyDeposits</li>
                  <li>Tenancy Deposit Scheme (TDS)</li>
                </ul>
                <p className="mt-2 text-gray-700">
                  You must also provide Prescribed Information to tenants within 30 days. Failure to protect the deposit can result in fines of 1-3 times the deposit amount and prevents you from serving Section 21 notices.
                </p>
              </details>

              <details className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow">
                <summary className="font-semibold text-lg text-gray-900">
                  Can tenants have pets?
                </summary>
                <p className="mt-3 text-gray-700">
                  It's up to you as the landlord. Our wizard asks whether pets are allowed, and if so, what types and how many. From 2024, the government's Model Tenancy Agreement suggests landlords should consider pet requests reasonably and not unreasonably refuse (though this isn't law yet). If you allow pets, you can request a higher deposit (within Tenant Fees Act limits) or require pet insurance.
                </p>
              </details>

              <details className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow">
                <summary className="font-semibold text-lg text-gray-900">
                  What if my property is leasehold?
                </summary>
                <p className="mt-3 text-gray-700">
                  If you're subletting a leasehold property, check your own lease to ensure you have permission to sublet. Most leasehold agreements require freeholder consent. Our AST agreements work for both freehold and leasehold properties, but you're responsible for ensuring you have the legal right to let the property.
                </p>
              </details>

              <details className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow">
                <summary className="font-semibold text-lg text-gray-900">
                  How quickly can I get my agreement?
                </summary>
                <p className="mt-3 text-gray-700">
                  Immediately! Our wizard takes approximately 10-15 minutes to complete. Once you've answered all questions and paid, your professionally formatted AST is generated instantly and available for download as a PDF. You can print it, email it to tenants, or use it digitally with e-signature services.
                </p>
              </details>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto bg-primary rounded-2xl shadow-2xl p-12 text-center text-white">
            <h2 className="text-4xl font-bold mb-4">Ready to Create Your AST Agreement?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of landlords who trust Landlord Heaven for legally compliant, professional tenancy agreements.
            </p>
            <div className="flex gap-6 justify-center flex-wrap">
              <Link
                href="/wizard?jurisdiction=england-wales&document_type=ast_standard"
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-lg shadow-lg"
              >
                Standard AST - £9.99
              </Link>
              <Link
                href="/wizard?jurisdiction=england-wales&document_type=ast_premium"
                className="bg-yellow-400 text-gray-900 px-8 py-4 rounded-lg font-semibold hover:bg-yellow-300 transition-colors text-lg shadow-lg"
              >
                Premium AST - £14.99 ⭐
              </Link>
            </div>
            <p className="mt-6 text-sm opacity-75">
              Instant download • Legally compliant • No subscription required
            </p>
          </div>
        </section>

        {/* SEO Internal Links Section */}
        <section className="container mx-auto px-4 py-8 border-t border-gray-200">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Other UK Jurisdictions</h3>
            <div className="flex gap-6 flex-wrap">
              <Link href="/tenancy-agreements/scotland" className="text-blue-600 hover:underline font-semibold">
                Scotland Private Residential Tenancy (PRT) →
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
