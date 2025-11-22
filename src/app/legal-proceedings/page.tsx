import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Legal Proceedings & Court Forms for Landlords | Possession Claims | Landlord Heaven',
  description: 'Professional court forms and legal proceedings documents for UK landlords. Possession claims (N5/N5B), witness statements, particulars of claim. Curated by Landlord Heaven for England, Wales, Scotland & Northern Ireland.',
  keywords: 'possession claim, N5 form, N5B form, court forms landlord, eviction court forms, witness statement landlord, particulars of claim, section 21 court, section 8 court, first tier tribunal scotland',
  openGraph: {
    title: 'Legal Proceedings & Court Forms for Landlords | Landlord Heaven',
    description: 'Professional court forms for possession claims, witness statements, and legal proceedings. Jurisdiction-specific for all UK regions.',
    type: 'website',
    url: 'https://landlordheaven.co.uk/legal-proceedings',
  },
};

export default function LegalProceedingsPage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'When do I need to go to court to evict a tenant?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'You must go to court after serving a valid eviction notice (Section 21 or Section 8 in England/Wales) and the notice period has expired, but the tenant has not left the property. You cannot forcibly remove a tenant yourself - only court bailiffs can enforce eviction.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the difference between N5 and N5B forms?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Form N5 is used for Section 8 possession claims (fault-based eviction) where you must prove grounds like rent arrears or breach of tenancy. Form N5B is used for accelerated possession claims under Section 21 (no-fault eviction) and is faster if all legal requirements are met.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do I need a solicitor to file a possession claim?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No, you can represent yourself in possession proceedings. Our court-ready forms include all necessary documents, filing instructions, and guidance. However, for complex cases or if the tenant defends the claim, you may wish to seek legal advice.',
        },
      },
      {
        '@type': 'Question',
        name: 'How long does a possession claim take?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Section 21 accelerated possession (N5B) typically takes 6-8 weeks if undefended. Section 8 possession (N5) takes 8-12 weeks and usually requires a court hearing. Times vary by court workload and whether the tenant contests the claim.',
        },
      },
      {
        '@type': 'Question',
        name: 'What are court filing fees for possession claims?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Possession claim fees vary: Standard possession claim (N5) is £355. Accelerated possession (N5B) is £355. Money claim for arrears varies from £25 to £455 depending on amount owed. Bailiff enforcement is an additional £130. Fees are paid to the court, not to us.',
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Breadcrumb Navigation */}
        <div className="container mx-auto px-4 py-4">
          <nav className="text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">Legal Proceedings</span>
          </nav>
        </div>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Legal Proceedings & Court Forms
              <span className="block text-3xl text-blue-600 mt-2">Professional Court Documents for UK Landlords</span>
            </h1>
            <p className="text-xl text-gray-700 mb-8">
              Court-ready possession claims, witness statements, and legal proceedings documents. When notice expires and your tenant hasn't left, these forms help you regain possession through proper legal channels.
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-600 p-6 text-left max-w-2xl mx-auto">
              <p className="text-gray-800 font-semibold mb-2">⚖️ When You Need Court Forms:</p>
              <ul className="text-gray-700 space-y-2">
                <li>• You've served a valid Section 21 or Section 8 notice (or equivalent)</li>
                <li>• The notice period has expired</li>
                <li>• The tenant has not vacated the property</li>
                <li>• You need a court order to enforce eviction</li>
              </ul>
            </div>
          </div>
        </section>

        {/* What Are Legal Proceedings */}
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">What Are Legal Proceedings for Possession?</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>Legal proceedings</strong> are the formal court process landlords must follow to legally regain possession of their property when a tenant refuses to leave after receiving proper notice. In the UK, you cannot forcibly evict a tenant yourself - only court-appointed bailiffs have this authority.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                The process begins after you've served a valid eviction notice (Section 21, Section 8, or equivalent in Scotland/Northern Ireland) and the notice period has expired. If the tenant remains in the property, you must apply to the court for a <strong>possession order</strong>.
              </p>
              <div className="bg-amber-50 border-l-4 border-amber-600 p-6 my-6">
                <h3 className="text-xl font-semibold text-amber-900 mb-2">The Legal Process Timeline</h3>
                <ol className="list-decimal list-inside text-gray-700 space-y-2">
                  <li><strong>Serve Notice:</strong> Section 21, Section 8, or other eviction notice</li>
                  <li><strong>Wait for Notice Period:</strong> 2 months (S21), 2 weeks-2 months (S8)</li>
                  <li><strong>File Possession Claim:</strong> Submit court forms if tenant hasn't left</li>
                  <li><strong>Court Hearing/Decision:</strong> Judge reviews case (8-12 weeks)</li>
                  <li><strong>Possession Order Granted:</strong> Court orders tenant to leave</li>
                  <li><strong>Bailiff Enforcement:</strong> If tenant still doesn't leave (extra 4-6 weeks)</li>
                </ol>
              </div>
              <p className="text-gray-700 leading-relaxed">
                Our court forms are professionally curated for each UK jurisdiction, ensuring compliance with Housing Act 1988 (England & Wales), Private Housing (Tenancies) (Scotland) Act 2016, and Private Tenancies (Northern Ireland) Order 2006.
              </p>
            </div>
          </div>
        </section>

        {/* Types of Legal Proceedings */}
        <section className="container mx-auto px-4 py-12 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Types of Possession Claims</h2>

            <div className="space-y-6">
              <div className="border-l-4 border-blue-600 bg-blue-50 p-6 rounded-r-lg">
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">1. Accelerated Possession (Section 21 - England & Wales)</h3>
                <p className="text-gray-700 mb-3">
                  <strong>Form N5B</strong> - Used for no-fault evictions under Section 21 Housing Act 1988. Faster process with no court hearing if all requirements are met.
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li><strong>When to use:</strong> Fixed-term AST expired or periodic tenancy, valid Section 21 served</li>
                  <li><strong>Requirements:</strong> Deposit protected, How to Rent guide given, all certificates provided</li>
                  <li><strong>Timeline:</strong> 6-8 weeks (no hearing required if undefended)</li>
                  <li><strong>Court fee:</strong> £355</li>
                </ul>
              </div>

              <div className="border-l-4 border-red-600 bg-red-50 p-6 rounded-r-lg">
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">2. Standard Possession (Section 8 - England & Wales)</h3>
                <p className="text-gray-700 mb-3">
                  <strong>Form N5</strong> - Used for fault-based evictions under Section 8 Housing Act 1988. Requires proving specific grounds (rent arrears, breach, nuisance).
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li><strong>When to use:</strong> Rent arrears (Ground 8, 10, 11), breach of tenancy, nuisance, damage</li>
                  <li><strong>Requirements:</strong> Valid Section 8 notice served, grounds must be proven with evidence</li>
                  <li><strong>Timeline:</strong> 8-12 weeks (hearing usually required)</li>
                  <li><strong>Court fee:</strong> £355</li>
                </ul>
              </div>

              <div className="border-l-4 border-purple-600 bg-purple-50 p-6 rounded-r-lg">
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">3. First-tier Tribunal Application (Scotland)</h3>
                <p className="text-gray-700 mb-3">
                  <strong>Private Residential Tenancy (PRT)</strong> - Applications to First-tier Tribunal for Scotland under 18 eviction grounds.
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li><strong>When to use:</strong> Rent arrears (Ground 12), breach (Ground 13), landlord intends to sell (Ground 1)</li>
                  <li><strong>Requirements:</strong> Notice to Leave served, notice period expired, eviction grounds met</li>
                  <li><strong>Timeline:</strong> 8-16 weeks (hearing usually required)</li>
                  <li><strong>Tribunal fee:</strong> Free (no fee in Scotland)</li>
                </ul>
              </div>

              <div className="border-l-4 border-green-600 bg-green-50 p-6 rounded-r-lg">
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">4. County Court Possession (Northern Ireland)</h3>
                <p className="text-gray-700 mb-3">
                  <strong>Notice to Quit proceedings</strong> - Possession claims in County Court under Private Tenancies (Northern Ireland) Order 2006.
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li><strong>When to use:</strong> Notice to Quit served, tenant hasn't left, grounds for possession exist</li>
                  <li><strong>Requirements:</strong> Valid Notice to Quit (minimum 4 weeks), grounds proven</li>
                  <li><strong>Timeline:</strong> 10-14 weeks (hearing required)</li>
                  <li><strong>Court fee:</strong> £205</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Product Cards */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Our Legal Proceedings Documents</h2>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Possession Claim */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border-t-4 border-blue-600 hover:shadow-xl transition-shadow">
                <div className="p-8">
                  <div className="text-5xl mb-4 text-center">⚖️</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">Possession Claim</h3>
                  <div className="text-center mb-4">
                    <span className="text-4xl font-bold text-blue-600">£49.99</span>
                  </div>
                  <p className="text-gray-700 mb-6 text-center">
                    Complete possession claim pack with court forms for your jurisdiction
                  </p>

                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-2 text-sm">
                      <span className="text-blue-600">✓</span>
                      <span>N5/N5B forms (England & Wales)</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <span className="text-blue-600">✓</span>
                      <span>First-tier Tribunal forms (Scotland)</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <span className="text-blue-600">✓</span>
                      <span>County Court forms (Northern Ireland)</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <span className="text-blue-600">✓</span>
                      <span>Court filing instructions</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <span className="text-blue-600">✓</span>
                      <span>Fee calculator & payment guide</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <span className="text-blue-600">✓</span>
                      <span>Timeline and process guide</span>
                    </li>
                  </ul>

                  <Link
                    href="/products/legal/possession-claim"
                    className="block w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold text-center hover:bg-blue-700 transition-colors"
                  >
                    View Details →
                  </Link>
                </div>
              </div>

              {/* Witness Statement */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border-t-4 border-purple-600 hover:shadow-xl transition-shadow">
                <div className="p-8">
                  <div className="text-5xl mb-4 text-center">📝</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">Witness Statement</h3>
                  <div className="text-center mb-4">
                    <span className="text-4xl font-bold text-purple-600">£29.99</span>
                  </div>
                  <p className="text-gray-700 mb-6 text-center">
                    Court-ready witness statement with evidence organization guide
                  </p>

                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-2 text-sm">
                      <span className="text-purple-600">✓</span>
                      <span>Professional witness statement template</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <span className="text-purple-600">✓</span>
                      <span>Statement of truth declaration</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <span className="text-purple-600">✓</span>
                      <span>Evidence organization checklist</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <span className="text-purple-600">✓</span>
                      <span>What to include guidance</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <span className="text-purple-600">✓</span>
                      <span>Photo/document exhibit list</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <span className="text-purple-600">✓</span>
                      <span>Court formatting requirements</span>
                    </li>
                  </ul>

                  <Link
                    href="/products/legal/witness-statement"
                    className="block w-full bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold text-center hover:bg-purple-700 transition-colors"
                  >
                    View Details →
                  </Link>
                </div>
              </div>

              {/* Particulars of Claim */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border-t-4 border-orange-600 hover:shadow-xl transition-shadow">
                <div className="p-8">
                  <div className="text-5xl mb-4 text-center">📋</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">Particulars of Claim</h3>
                  <div className="text-center mb-4">
                    <span className="text-4xl font-bold text-orange-600">£39.99</span>
                  </div>
                  <p className="text-gray-700 mb-6 text-center">
                    Detailed claim particulars with legal grounds and relief sought
                  </p>

                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-2 text-sm">
                      <span className="text-orange-600">✓</span>
                      <span>Comprehensive claim particulars</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <span className="text-orange-600">✓</span>
                      <span>Legal grounds for possession</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <span className="text-orange-600">✓</span>
                      <span>Relief sought statements</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <span className="text-orange-600">✓</span>
                      <span>Rent arrears calculations</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <span className="text-orange-600">✓</span>
                      <span>Court costs breakdown</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <span className="text-orange-600">✓</span>
                      <span>Legal precedent references</span>
                    </li>
                  </ul>

                  <Link
                    href="/products/legal/particulars-of-claim"
                    className="block w-full bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold text-center hover:bg-orange-700 transition-colors"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* When You Need Court Forms */}
        <section className="container mx-auto px-4 py-12 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">When You Need Court Forms</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-green-50 border-l-4 border-green-600 p-6 rounded-r-lg">
                <h3 className="text-xl font-semibold text-green-900 mb-3">✅ You MUST Use Court Forms If:</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Valid eviction notice served and expired</li>
                  <li>• Tenant refuses to leave the property</li>
                  <li>• You want to legally enforce eviction</li>
                  <li>• You need a possession order</li>
                  <li>• Tenant is in rent arrears after notice</li>
                </ul>
              </div>

              <div className="bg-red-50 border-l-4 border-red-600 p-6 rounded-r-lg">
                <h3 className="text-xl font-semibold text-red-900 mb-3">❌ You CANNOT:</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Forcibly remove tenant yourself</li>
                  <li>• Change locks while tenant is out</li>
                  <li>• Cut off utilities to force them out</li>
                  <li>• Remove tenant's belongings</li>
                  <li>• Harass or threaten tenant</li>
                </ul>
                <p className="mt-3 text-sm text-red-800 font-semibold">
                  ⚠️ Illegal eviction is a criminal offense punishable by fine and/or imprisonment.
                </p>
              </div>
            </div>

            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-blue-900 mb-3">The Correct Legal Process</h3>
              <ol className="list-decimal list-inside text-gray-700 space-y-2">
                <li><strong>Serve proper eviction notice</strong> (Section 21, Section 8, Notice to Leave, etc.)</li>
                <li><strong>Wait for notice period to expire</strong> (varies: 2 weeks to 2 months)</li>
                <li><strong>File possession claim with court</strong> if tenant hasn't left (use our forms)</li>
                <li><strong>Attend court hearing</strong> (or wait for accelerated decision)</li>
                <li><strong>Receive possession order</strong> from judge</li>
                <li><strong>Apply for bailiff warrant</strong> if tenant still doesn't leave</li>
                <li><strong>Bailiff enforces eviction</strong> (only bailiffs can physically remove tenant)</li>
              </ol>
            </div>
          </div>
        </section>

        {/* Court Fees Information */}
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Court Fees (Paid to Court)</h2>
            <p className="text-gray-700 mb-6">
              Court fees are paid directly to the court when filing your claim, not to Landlord Heaven. Our documents include fee calculators and payment instructions.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-blue-600 text-white">
                    <th className="border border-gray-300 px-4 py-3 text-left">Jurisdiction</th>
                    <th className="border border-gray-300 px-4 py-3 text-left">Possession Claim</th>
                    <th className="border border-gray-300 px-4 py-3 text-left">Bailiff Warrant</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3 font-semibold">England & Wales</td>
                    <td className="border border-gray-300 px-4 py-3">£355 (N5 or N5B)</td>
                    <td className="border border-gray-300 px-4 py-3">£130</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3 font-semibold">Scotland</td>
                    <td className="border border-gray-300 px-4 py-3">£0 (Tribunal is free)</td>
                    <td className="border border-gray-300 px-4 py-3">£86 (Sheriff Officers)</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3 font-semibold">Northern Ireland</td>
                    <td className="border border-gray-300 px-4 py-3">£205</td>
                    <td className="border border-gray-300 px-4 py-3">£120</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-6 space-y-2 text-sm text-gray-600">
              <p>• Fees are paid when you submit your claim to the court</p>
              <p>• You can claim court fees back from the tenant if you win</p>
              <p>• Fee remission (reduction/waiver) available if you're on low income or benefits</p>
              <p>• Our documents include detailed fee information and payment methods</p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="container mx-auto px-4 py-12 bg-gradient-to-br from-blue-50 to-purple-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>

            <div className="space-y-4">
              <details className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow">
                <summary className="font-semibold text-lg text-gray-900">
                  When do I need to go to court to evict a tenant?
                </summary>
                <p className="mt-3 text-gray-700">
                  You must go to court after serving a valid eviction notice (Section 21 or Section 8 in England/Wales) and the notice period has expired, but the tenant has not left the property. You cannot forcibly remove a tenant yourself - only court bailiffs can enforce eviction. Attempting to evict without a court order is illegal and can result in criminal prosecution.
                </p>
              </details>

              <details className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow">
                <summary className="font-semibold text-lg text-gray-900">
                  What is the difference between N5 and N5B forms?
                </summary>
                <p className="mt-3 text-gray-700">
                  <strong>Form N5</strong> is used for Section 8 possession claims (fault-based eviction) where you must prove specific grounds like rent arrears, breach of tenancy, or anti-social behavior. This usually requires a court hearing.
                </p>
                <p className="mt-2 text-gray-700">
                  <strong>Form N5B</strong> is used for accelerated possession claims under Section 21 (no-fault eviction). It's faster and typically doesn't require a hearing if all legal requirements (deposit protection, How to Rent guide, certificates) have been met.
                </p>
              </details>

              <details className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow">
                <summary className="font-semibold text-lg text-gray-900">
                  Do I need a solicitor to file a possession claim?
                </summary>
                <p className="mt-3 text-gray-700">
                  No, you can represent yourself in possession proceedings. Our court-ready forms include all necessary documents, step-by-step filing instructions, and guidance on completing each section. Thousands of landlords successfully handle their own possession claims.
                </p>
                <p className="mt-2 text-gray-700">
                  However, you may wish to seek legal advice if: (1) the tenant is defending the claim with complex arguments, (2) your case involves unusual circumstances, (3) you're claiming significant rent arrears alongside possession, or (4) you're uncomfortable appearing in court.
                </p>
              </details>

              <details className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow">
                <summary className="font-semibold text-lg text-gray-900">
                  How long does a possession claim take?
                </summary>
                <p className="mt-3 text-gray-700">
                  Timelines vary by jurisdiction and whether the claim is defended:
                </p>
                <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
                  <li><strong>Section 21 accelerated (N5B):</strong> 6-8 weeks if undefended and all requirements met</li>
                  <li><strong>Section 8 standard (N5):</strong> 8-12 weeks (hearing usually required)</li>
                  <li><strong>Scotland First-tier Tribunal:</strong> 8-16 weeks (hearing usually required)</li>
                  <li><strong>Northern Ireland County Court:</strong> 10-14 weeks</li>
                </ul>
                <p className="mt-2 text-gray-700">
                  Add another 4-6 weeks if you need bailiff enforcement after receiving the possession order.
                </p>
              </details>

              <details className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow">
                <summary className="font-semibold text-lg text-gray-900">
                  What are court filing fees for possession claims?
                </summary>
                <p className="mt-3 text-gray-700">
                  Court fees vary by jurisdiction and claim type:
                </p>
                <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
                  <li><strong>England & Wales:</strong> £355 for possession claims (N5 or N5B), plus £130 for bailiff warrant</li>
                  <li><strong>Scotland:</strong> £0 for First-tier Tribunal application (free), £86 for Sheriff Officers</li>
                  <li><strong>Northern Ireland:</strong> £205 for possession claim, £120 for enforcement</li>
                </ul>
                <p className="mt-2 text-gray-700">
                  These fees are paid to the court, not to Landlord Heaven. You can usually claim these costs back from the tenant if you win. Fee remission (reduction/exemption) is available if you're on low income or benefits.
                </p>
              </details>

              <details className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow">
                <summary className="font-semibold text-lg text-gray-900">
                  What evidence do I need for a possession claim?
                </summary>
                <p className="mt-3 text-gray-700">
                  Required evidence depends on your claim type, but typically includes:
                </p>
                <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
                  <li>Original tenancy agreement (signed by all parties)</li>
                  <li>Copy of eviction notice served (Section 21, Section 8, or equivalent)</li>
                  <li>Proof of service (certificate of posting, email confirmation, or witness)</li>
                  <li>Deposit protection certificate and prescribed information</li>
                  <li>Gas Safety Certificate, EPC, EICR, How to Rent guide (for Section 21)</li>
                  <li>Rent arrears schedule (if claiming for arrears)</li>
                  <li>Witness statement explaining your case</li>
                </ul>
                <p className="mt-2 text-gray-700">
                  Our Witness Statement and Particulars of Claim products help you organize and present this evidence professionally.
                </p>
              </details>

              <details className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow">
                <summary className="font-semibold text-lg text-gray-900">
                  Can the tenant defend the possession claim?
                </summary>
                <p className="mt-3 text-gray-700">
                  Yes. Tenants have the right to file a defense within 14 days of receiving the claim. Common defenses include:
                </p>
                <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
                  <li>Landlord didn't protect deposit properly (blocks Section 21)</li>
                  <li>Required certificates not provided (blocks Section 21)</li>
                  <li>Notice was invalid or incorrectly served</li>
                  <li>Landlord hasn't done required repairs (retaliatory eviction protection)</li>
                  <li>Rent arrears have been paid (for Section 8 Ground 8)</li>
                </ul>
                <p className="mt-2 text-gray-700">
                  If the tenant defends, the court will schedule a hearing where both parties present evidence. Most landlords win if they have followed the correct legal process and have proper documentation.
                </p>
              </details>

              <details className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow">
                <summary className="font-semibold text-lg text-gray-900">
                  What happens after I get a possession order?
                </summary>
                <p className="mt-3 text-gray-700">
                  Once the court grants a possession order, the tenant is legally required to leave by the date specified in the order (typically 14-28 days). If they don't leave voluntarily:
                </p>
                <ol className="list-decimal list-inside text-gray-700 mt-2 space-y-1">
                  <li>Wait until the possession order date has passed</li>
                  <li>Apply for a warrant of possession (bailiff warrant)</li>
                  <li>Pay the bailiff fee (£130 in England/Wales)</li>
                  <li>Court appoints bailiff and sets eviction date</li>
                  <li>Bailiff attends property and removes tenant if necessary</li>
                  <li>You can change locks once bailiff hands over possession</li>
                </ol>
                <p className="mt-2 text-gray-700">
                  Only court-appointed bailiffs can physically remove tenants. Never attempt to evict a tenant yourself, even with a possession order.
                </p>
              </details>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-2xl p-12 text-center text-white">
            <h2 className="text-4xl font-bold mb-4">Ready to Start Legal Proceedings?</h2>
            <p className="text-xl mb-8 opacity-90">
              Court-ready forms curated by Landlord Heaven. Professional, jurisdiction-specific, and legally compliant.
            </p>
            <div className="flex gap-6 justify-center flex-wrap">
              <Link
                href="/products/legal/possession-claim"
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-lg shadow-lg"
              >
                Possession Claim - £49.99
              </Link>
              <Link
                href="/products/legal/witness-statement"
                className="bg-purple-700 text-white px-8 py-4 rounded-lg font-semibold hover:bg-purple-800 transition-colors text-lg shadow-lg"
              >
                Witness Statement - £29.99
              </Link>
              <Link
                href="/products/legal/particulars-of-claim"
                className="bg-orange-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-orange-700 transition-colors text-lg shadow-lg"
              >
                Particulars of Claim - £39.99
              </Link>
            </div>
            <p className="mt-6 text-sm opacity-75">
              Instant download • Jurisdiction-specific • No subscription required
            </p>
          </div>
        </section>

        {/* Related Links */}
        <section className="container mx-auto px-4 py-8 border-t border-gray-200">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Related Documents</h3>
            <div className="flex gap-6 flex-wrap">
              <Link href="/products/section21" className="text-blue-600 hover:underline font-semibold">
                Section 21 Notice →
              </Link>
              <Link href="/products/section8" className="text-blue-600 hover:underline font-semibold">
                Section 8 Notice →
              </Link>
              <Link href="/tenancy-agreements/england-wales" className="text-blue-600 hover:underline font-semibold">
                Tenancy Agreements →
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
