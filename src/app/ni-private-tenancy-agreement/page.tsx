import type { Metadata } from 'next';
import Link from 'next/link';
import { getCanonicalUrl } from '@/lib/seo/urls';
import {
  RiFileTextLine,
  RiShieldCheckLine,
  RiTimeLine,
  RiCheckboxCircleLine,
  RiArrowRightLine,
  RiDownloadLine,
  RiQuestionLine,
  RiAlertLine,
  RiGroupLine,
  RiInformationLine
} from 'react-icons/ri';
import { StructuredData, faqPageSchema, breadcrumbSchema, articleSchema } from '@/lib/seo/structured-data';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { SeoCtaBlock, SeoDisclaimer } from '@/components/seo/SeoCtaBlock';
import { tenancyAgreementNILinks } from '@/lib/seo/internal-links';

export const metadata: Metadata = {
  title: 'Private Tenancy Agreement NI | Complete 2026 Guide & Template',
  description: 'Complete guide to Private Tenancy Agreements in Northern Ireland. Understand your rights under the Private Tenancies Act 2022 and create a compliant agreement.',
  keywords: [
    'private tenancy agreement NI',
    'NI private tenancy',
    'Northern Ireland tenancy law',
    'Private Tenancies Act 2022',
    'NI landlord obligations',
    'tenant rights Northern Ireland',
    'NI rental agreement',
    'private renting Northern Ireland',
    'landlord registration NI',
    'NI tenancy guide',
  ],
  alternates: {
    canonical: getCanonicalUrl('/ni-private-tenancy-agreement'),
  },
  openGraph: {
    title: 'Private Tenancy Agreement NI | Complete 2026 Guide & Template',
    description: 'Complete guide to Private Tenancies in Northern Ireland. Private Tenancies Act 2022 explained.',
    type: 'article',
    url: getCanonicalUrl('/ni-private-tenancy-agreement'),
  },
};

const faqs = [
  {
    question: 'What is a Private Tenancy in Northern Ireland?',
    answer: 'A Private Tenancy is the standard form of residential tenancy in Northern Ireland, governed by the Private Tenancies Act (Northern Ireland) 2022. It applies to any tenancy where a private landlord lets a property to a tenant as their only or main home. Unlike England\'s Assured Shorthold Tenancy or Scotland\'s Private Residential Tenancy, Northern Ireland\'s Private Tenancy provides different protections and notice period rules specific to NI law.'
  },
  {
    question: 'How does a Private Tenancy differ from an AST?',
    answer: 'While England uses Assured Shorthold Tenancies (ASTs), Northern Ireland has Private Tenancies governed by different legislation. Key differences include: NI requires landlord registration with the council; deposit caps are 2 months (vs 5 weeks in England); notice periods are based on tenancy length rather than fixed; and NI landlords must provide a written statement of terms within 28 days or face criminal prosecution. The eviction grounds and processes also differ significantly.'
  },
  {
    question: 'When did the Private Tenancies Act 2022 come into force?',
    answer: 'The Private Tenancies Act (Northern Ireland) 2022 came into force in phases. The requirement for written tenancy agreements became mandatory from April 2023. Other provisions, including enhanced tenant protections and new landlord obligations, were phased in throughout 2023 and 2024. Landlords must ensure their tenancy agreements comply with all current requirements, and our template is updated to reflect all active provisions.'
  },
  {
    question: 'Do I need to register as a landlord in Northern Ireland?',
    answer: 'Yes, all private landlords in Northern Ireland must register with their local council\'s Landlord Registration Scheme within one month of a tenancy starting. Registration costs £70 and lasts for 3 years. Your registration number must be included in the tenancy agreement. Unregistered landlords cannot legally evict tenants and face fines up to £2,500. You can check if a landlord is registered via the NI Direct landlord registration checker.'
  },
  {
    question: 'What is the maximum deposit in Northern Ireland?',
    answer: 'The maximum deposit a landlord can take in Northern Ireland is 2 months\' rent. This is more generous to landlords than England (5 weeks) but must still be protected in a government-approved scheme within 14 days. The prescribed information about deposit protection must be given to tenants within 28 days. Failure to comply can result in penalties of up to 3 times the deposit amount.'
  },
  {
    question: 'Can I evict a tenant without a written tenancy agreement in NI?',
    answer: 'No. Under the Private Tenancies Act (NI) 2022, landlords cannot serve a valid Notice to Quit unless they have complied with their legal obligations, including providing a written statement of tenancy terms. If you attempt to evict without having provided the required documentation, the notice will be invalid and any court proceedings will fail. This makes having a proper written agreement essential.'
  },
  {
    question: 'What grounds can a landlord use to end a tenancy in Northern Ireland?',
    answer: 'Landlords in Northern Ireland must have valid grounds to end a tenancy after the initial 12 months. Grounds include: selling the property, landlord or family member moving in, substantial renovation work, tenant rent arrears over 8 weeks, anti-social behaviour, breach of tenancy terms, or the property being needed by an employer landlord. The correct notice period must be given based on tenancy length.'
  },
  {
    question: 'How do rent increases work in Northern Ireland?',
    answer: 'Under the Private Tenancies Act (NI) 2022, landlords can only increase rent once every 12 months and must give at least 2 months\' written notice. The increase should reflect market rates for comparable properties. Tenants can challenge unreasonable rent increases through the Housing Rights Service. Unlike some jurisdictions, NI does not have rent controls or caps on the percentage of increase.'
  },
  {
    question: 'What repairs is a landlord responsible for in Northern Ireland?',
    answer: 'NI landlords have extensive repair obligations including: the structure and exterior of the property; heating, hot water, and plumbing installations; gas and electrical systems; sanitary facilities; and common areas in shared buildings. Properties must also meet the Fitness Standard. Landlords should respond to repair requests within a reasonable time, typically 24 hours for emergencies and 28 days for non-urgent repairs.'
  },
  {
    question: 'Can a tenant challenge unfair terms in a Northern Ireland tenancy agreement?',
    answer: 'Yes, tenants can challenge unfair terms through the Consumer Rights Act 2015, which applies in Northern Ireland. Terms that create a significant imbalance in rights and obligations against the tenant may be unenforceable. Common unfair terms include excessive fees, unreasonable restrictions on normal use, or terms that try to exclude the landlord\'s statutory obligations. Our template avoids unfair terms to ensure enforceability.'
  },
  {
    question: 'Is there a model tenancy agreement for Northern Ireland?',
    answer: 'Unlike England and Wales, the Northern Ireland Housing Executive has not published an official model tenancy agreement. However, the Private Tenancies Act 2022 prescribes what must be included. Our template incorporates all prescribed terms and requirements, effectively serving as a comprehensive model agreement that ensures legal compliance while protecting both landlord and tenant interests.'
  },
  {
    question: 'What happens at the end of a fixed-term tenancy in Northern Ireland?',
    answer: 'When a fixed-term tenancy ends in Northern Ireland, it automatically becomes a periodic tenancy (usually monthly) on the same terms. The landlord doesn\'t need to create a new agreement unless terms are changing. The tenant continues with the same rights and the landlord must still follow proper notice procedures if they want to end the tenancy. The notice period will depend on how long the tenant has lived there in total.'
  }
];

export default function NIPrivateTenancyAgreementPage() {
  return (
    <>
      <StructuredData
        data={articleSchema({
          headline: 'Private Tenancy Agreement NI | Complete 2026 Guide & Template',
          description: 'Complete guide to Private Tenancy Agreements in Northern Ireland. Understand your rights under the Private Tenancies Act 2022 and create a compliant agreement.',
          url: getCanonicalUrl('/ni-private-tenancy-agreement'),
          datePublished: '2024-02-01',
          dateModified: '2025-01-20',
        })}
      />
      <StructuredData data={faqPageSchema(faqs)} />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Tenancy Agreements', url: '/tenancy-agreements' },
          { name: 'Northern Ireland', url: '/tenancy-agreements/northern-ireland' },
          { name: 'Private Tenancy Agreement', url: '/ni-private-tenancy-agreement' },
        ])}
      />

      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        {/* Breadcrumb */}
        <nav className="bg-white border-b border-slate-200">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <ol className="flex items-center space-x-2 text-sm text-slate-600">
              <li><Link href="/" className="hover:text-emerald-600">Home</Link></li>
              <li className="text-slate-400">/</li>
              <li><Link href="/tenancy-agreements" className="hover:text-emerald-600">Tenancy Agreements</Link></li>
              <li className="text-slate-400">/</li>
              <li><Link href="/tenancy-agreements/northern-ireland" className="hover:text-emerald-600">Northern Ireland</Link></li>
              <li className="text-slate-400">/</li>
              <li className="text-slate-900 font-medium">Private Tenancy</li>
            </ol>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="bg-gradient-to-br from-slate-800 via-emerald-900 to-slate-900 text-white py-16">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex items-center gap-2 text-emerald-300 mb-4">
              <RiShieldCheckLine className="w-5 h-5" />
              <span className="text-sm font-medium">Private Tenancies Act (NI) 2022</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Private Tenancy Agreement NI: Complete Guide 2026
            </h1>
            <p className="text-xl text-emerald-100 mb-8 max-w-2xl">
              Everything you need to know about Private Tenancy Agreements in Northern Ireland.
              Understand the Private Tenancies Act 2022, your rights, and create a compliant agreement.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/wizard?product=ast_standard&src=seo_ni_private_tenancy&topic=tenancy&jurisdiction=northern-ireland"
                className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold px-8 py-4 rounded-lg transition-colors"
              >
                <RiFileTextLine className="w-5 h-5" />
                Create Your Agreement
                <RiArrowRightLine className="w-5 h-5" />
              </Link>
              <Link
                href="#understanding-private-tenancy"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-4 rounded-lg transition-colors"
              >
                <RiInformationLine className="w-5 h-5" />
                Learn About Private Tenancies
              </Link>
            </div>
          </div>
        </section>

        {/* Trust Signals */}
        <section className="bg-white border-b border-slate-200 py-8">
          <div className="max-w-4xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-slate-900">2022 Act</div>
                <div className="text-sm text-slate-600">Fully Compliant</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">NI Only</div>
                <div className="text-sm text-slate-600">Jurisdiction Specific</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">Updated</div>
                <div className="text-sm text-slate-600">January 2026</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">Expert</div>
                <div className="text-sm text-slate-600">Legal Guidance</div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <article className="max-w-4xl mx-auto px-4 py-12">
          {/* Introduction */}
          <section className="prose prose-lg max-w-none mb-12" id="understanding-private-tenancy">
            <p className="text-xl text-slate-600 leading-relaxed">
              Northern Ireland has its own distinct tenancy framework, separate from the rest of the UK. The Private
              Tenancies Act (Northern Ireland) 2022 introduced significant new protections for tenants and obligations
              for landlords. Understanding how Private Tenancies work is essential whether you're a landlord creating
              an agreement or a tenant signing one.
            </p>
          </section>

          {/* What is a Private Tenancy */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <RiInformationLine className="w-6 h-6 text-emerald-600" />
              What is a Private Tenancy in Northern Ireland?
            </h2>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 mb-6">
              <p className="text-emerald-900 mb-4">
                A <strong>Private Tenancy</strong> is the standard type of tenancy when renting from a private
                landlord in Northern Ireland. It applies automatically when:
              </p>
              <ul className="space-y-2 text-emerald-800">
                <li className="flex items-start gap-2">
                  <RiCheckboxCircleLine className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                  <span>A private landlord lets residential property</span>
                </li>
                <li className="flex items-start gap-2">
                  <RiCheckboxCircleLine className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                  <span>The tenant occupies it as their only or main home</span>
                </li>
                <li className="flex items-start gap-2">
                  <RiCheckboxCircleLine className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                  <span>It's not a specific excluded tenancy type</span>
                </li>
              </ul>
            </div>
            <p className="text-slate-600 mb-4">
              The Private Tenancies Act 2022 substantially reformed rental law in Northern Ireland, bringing it
              closer to standards in England, Wales, and Scotland while maintaining its distinct legal framework.
              Key changes included mandatory written agreements, enhanced deposit protection, and clearer eviction procedures.
            </p>
          </section>

          {/* UK Comparison Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <RiGroupLine className="w-6 h-6 text-emerald-600" />
              How NI Private Tenancies Compare to Other UK Nations
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border border-slate-200 px-3 py-2 text-left font-semibold">Aspect</th>
                    <th className="border border-slate-200 px-3 py-2 text-left font-semibold">Northern Ireland</th>
                    <th className="border border-slate-200 px-3 py-2 text-left font-semibold">England</th>
                    <th className="border border-slate-200 px-3 py-2 text-left font-semibold">Scotland</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-slate-200 px-3 py-2 font-medium">Tenancy Type</td>
                    <td className="border border-slate-200 px-3 py-2">Private Tenancy</td>
                    <td className="border border-slate-200 px-3 py-2">AST</td>
                    <td className="border border-slate-200 px-3 py-2">PRT</td>
                  </tr>
                  <tr className="bg-slate-50">
                    <td className="border border-slate-200 px-3 py-2 font-medium">Main Legislation</td>
                    <td className="border border-slate-200 px-3 py-2">Private Tenancies Act (NI) 2022</td>
                    <td className="border border-slate-200 px-3 py-2">Housing Act 1988</td>
                    <td className="border border-slate-200 px-3 py-2">Private Housing Act 2016</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-200 px-3 py-2 font-medium">Max Deposit</td>
                    <td className="border border-slate-200 px-3 py-2 text-emerald-700 font-medium">2 months</td>
                    <td className="border border-slate-200 px-3 py-2">5 weeks</td>
                    <td className="border border-slate-200 px-3 py-2">No cap</td>
                  </tr>
                  <tr className="bg-slate-50">
                    <td className="border border-slate-200 px-3 py-2 font-medium">Landlord Registration</td>
                    <td className="border border-slate-200 px-3 py-2 text-emerald-700 font-medium">Required</td>
                    <td className="border border-slate-200 px-3 py-2">Not required</td>
                    <td className="border border-slate-200 px-3 py-2">Required</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-200 px-3 py-2 font-medium">No-fault Eviction</td>
                    <td className="border border-slate-200 px-3 py-2">Limited</td>
                    <td className="border border-slate-200 px-3 py-2">Section 21</td>
                    <td className="border border-slate-200 px-3 py-2">Abolished</td>
                  </tr>
                  <tr className="bg-slate-50">
                    <td className="border border-slate-200 px-3 py-2 font-medium">Written Agreement</td>
                    <td className="border border-slate-200 px-3 py-2 text-emerald-700 font-medium">Criminal offence if missing</td>
                    <td className="border border-slate-200 px-3 py-2">Required but civil</td>
                    <td className="border border-slate-200 px-3 py-2">Required</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Landlord Obligations */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <RiShieldCheckLine className="w-6 h-6 text-emerald-600" />
              Landlord Obligations Under the 2022 Act
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold text-slate-900 mb-4">Before Tenancy Starts</h3>
                <ul className="space-y-3 text-slate-700">
                  <li className="flex items-start gap-2">
                    <RiCheckboxCircleLine className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Register with local council Landlord Registration Scheme</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <RiCheckboxCircleLine className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Obtain valid EPC (minimum E rating)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <RiCheckboxCircleLine className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Gas Safety Certificate (if applicable)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <RiCheckboxCircleLine className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>EICR from April 2025</span>
                  </li>
                </ul>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold text-slate-900 mb-4">Within 28 Days</h3>
                <ul className="space-y-3 text-slate-700">
                  <li className="flex items-start gap-2">
                    <RiCheckboxCircleLine className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Provide written statement of tenancy terms</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <RiCheckboxCircleLine className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Protect deposit in approved scheme (14 days)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <RiCheckboxCircleLine className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Provide deposit prescribed information</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <RiCheckboxCircleLine className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Provide tenant information pack</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Criminal Penalties Warning */}
          <section className="mb-12">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <RiAlertLine className="w-8 h-8 text-red-600 shrink-0" />
                <div>
                  <h3 className="font-semibold text-red-900 mb-2">Criminal Penalties for Non-Compliance</h3>
                  <p className="text-red-800 mb-4">
                    The Private Tenancies Act 2022 introduced criminal sanctions for landlords who fail to comply
                    with their legal obligations. This is stricter than England where most breaches are civil matters.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4 text-red-800">
                    <div>
                      <strong>Fixed Penalty Notices:</strong>
                      <ul className="mt-2 space-y-1 text-sm">
                        <li>• No written agreement: £500</li>
                        <li>• Unregistered landlord: £500</li>
                        <li>• Deposit not protected: £500</li>
                      </ul>
                    </div>
                    <div>
                      <strong>Court Prosecution:</strong>
                      <ul className="mt-2 space-y-1 text-sm">
                        <li>• Fines up to £2,500</li>
                        <li>• Criminal record</li>
                        <li>• Cannot evict tenants</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Notice Period Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <RiTimeLine className="w-6 h-6 text-emerald-600" />
              Notice Periods Explained
            </h2>
            <p className="text-slate-600 mb-6">
              One of the most important changes in the 2022 Act was the introduction of tiered notice periods
              that increase based on how long the tenant has lived in the property. This provides greater security
              for long-term tenants.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
                <div className="text-4xl font-bold text-amber-700">28</div>
                <div className="text-amber-800 font-medium">days</div>
                <div className="text-sm text-amber-700 mt-2">Under 12 months</div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
                <div className="text-4xl font-bold text-amber-700">56</div>
                <div className="text-amber-800 font-medium">days</div>
                <div className="text-sm text-amber-700 mt-2">1 to 5 years</div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
                <div className="text-4xl font-bold text-amber-700">84</div>
                <div className="text-amber-800 font-medium">days</div>
                <div className="text-sm text-amber-700 mt-2">Over 5 years</div>
              </div>
            </div>
            <p className="text-slate-600 mt-4 text-sm">
              Note: Tenants only need to give 4 weeks' notice regardless of tenancy length. Landlords must
              use the correct statutory Notice to Quit form and state valid grounds for ending the tenancy.
            </p>
          </section>

          {/* Mid-page CTA */}
          <SeoCtaBlock
            pageType="tenancy"
            variant="section"
            jurisdiction="northern-ireland"
          />

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <RiQuestionLine className="w-6 h-6 text-emerald-600" />
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <details
                  key={index}
                  className="group bg-white border border-slate-200 rounded-lg shadow-sm"
                >
                  <summary className="flex items-center justify-between cursor-pointer p-4 font-medium text-slate-900 hover:bg-slate-50">
                    {faq.question}
                    <RiArrowRightLine className="w-5 h-5 text-slate-400 transition-transform group-open:rotate-90" />
                  </summary>
                  <div className="px-4 pb-4 text-slate-600">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </section>

          {/* Final CTA */}
          <section className="bg-gradient-to-br from-emerald-800 to-slate-900 rounded-2xl p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-4">
              Create Your NI Private Tenancy Agreement
            </h2>
            <p className="text-emerald-100 mb-6 max-w-xl mx-auto">
              Don't risk criminal prosecution - use our intelligent wizard to create a fully compliant
              Private Tenancy Agreement for Northern Ireland in minutes.
            </p>
            <Link
              href="/wizard?product=ast_standard&src=seo_ni_private_tenancy&topic=tenancy&jurisdiction=northern-ireland"
              className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold px-8 py-4 rounded-lg transition-colors"
            >
              <RiDownloadLine className="w-5 h-5" />
              Create Your Agreement
              <RiArrowRightLine className="w-5 h-5" />
            </Link>
          </section>

          {/* Related Links */}
          <div className="mt-12">
            <RelatedLinks links={tenancyAgreementNILinks} />
          </div>

          {/* Disclaimer */}
          <SeoDisclaimer />
        </article>
      </main>
    </>
  );
}
