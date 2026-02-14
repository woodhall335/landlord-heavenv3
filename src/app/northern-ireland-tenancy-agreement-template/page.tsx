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
  RiHomeLine,
  RiMoneyPoundCircleLine,
  RiFileList2Line
} from 'react-icons/ri';
import { StructuredData, faqPageSchema, breadcrumbSchema, articleSchema } from '@/lib/seo/structured-data';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { SeoCtaBlock, SeoDisclaimer } from '@/components/seo/SeoCtaBlock';
import { tenancyAgreementNILinks } from '@/lib/seo/internal-links';

export const metadata: Metadata = {
  title: 'Northern Ireland Tenancy Agreement Template 2026 | Private Tenancies Act Compliant',
  description: 'Create a legally compliant NI tenancy agreement for 2026. Updated for the Private Tenancies Act (NI) 2022 with all prescribed terms.',
  keywords: [
    'Northern Ireland tenancy agreement template',
    'NI tenancy agreement',
    'Private Tenancies Act 2022',
    'NI landlord agreement',
    'Northern Ireland rental contract',
    'private tenancy template NI',
    'landlord registration Northern Ireland',
    'TDSNI deposit protection',
    'NI rental agreement download',
    'Northern Ireland landlord forms',
  ],
  alternates: {
    canonical: getCanonicalUrl('/northern-ireland-tenancy-agreement-template'),
  },
  openGraph: {
    title: 'Northern Ireland Tenancy Agreement Template 2026 | Private Tenancies Act Compliant',
    description: 'Create a legally compliant NI tenancy agreement. Private Tenancies Act (NI) 2022 compliant. From £14.99.',
    type: 'article',
    url: getCanonicalUrl('/northern-ireland-tenancy-agreement-template'),
  },
};

const faqs = [
  {
    question: 'What is a Private Tenancy Agreement in Northern Ireland?',
    answer: 'A Private Tenancy Agreement is a legally binding contract between a landlord and tenant for residential property in Northern Ireland. Since the Private Tenancies Act (Northern Ireland) 2022 came into force, all private tenancies must have a written tenancy agreement provided within 28 days of the tenancy starting. This agreement must include prescribed terms covering rent, deposit, property address, and the responsibilities of both parties.'
  },
  {
    question: 'Is a written tenancy agreement legally required in Northern Ireland?',
    answer: 'Yes, since April 2023 under the Private Tenancies Act (NI) 2022, landlords must provide tenants with a written statement of tenancy terms within 28 days of the tenancy commencing. Failure to provide this document is a criminal offence and can result in a fixed penalty notice of £500 or prosecution with fines up to £2,500. The written statement must contain all prescribed information including rent amount, deposit details, and landlord contact information.'
  },
  {
    question: 'What is the maximum deposit a landlord can take in Northern Ireland?',
    answer: 'In Northern Ireland, the maximum deposit a landlord can request is 2 months\' rent. This deposit must be protected in a government-approved tenancy deposit scheme within 14 days of receiving it. Landlords must also provide tenants with prescribed information about the deposit protection within 28 days. Failure to protect the deposit or provide this information can result in penalties of up to 3 times the deposit amount.'
  },
  {
    question: 'What notice period must a landlord give to end a tenancy in Northern Ireland?',
    answer: 'Notice periods in Northern Ireland depend on how long the tenant has lived in the property: for tenancies under 12 months, 28 days\' notice is required; for tenancies between 1-5 years, 56 days\' notice is required; for tenancies over 5 years, 84 days\' notice (12 weeks) is required. Landlords must use the correct statutory Notice to Quit form and can only end a tenancy for specific legal grounds set out in the Private Tenancies Act.'
  },
  {
    question: 'Do Northern Ireland tenancy agreements need an Energy Performance Certificate?',
    answer: 'Yes, landlords in Northern Ireland must have a valid Energy Performance Certificate (EPC) with a minimum rating of E for their rental property. The EPC must be provided to tenants before they sign the tenancy agreement and a copy should be included with the tenancy documents. From 2025, minimum energy efficiency standards are expected to increase, so landlords should check current requirements.'
  },
  {
    question: 'Are Electrical Installation Condition Reports (EICR) required in Northern Ireland?',
    answer: 'From April 2025, landlords in Northern Ireland will be required to have a valid Electrical Installation Condition Report (EICR) for all new tenancies, with existing tenancies requiring compliance by April 2026. The EICR must be conducted by a qualified electrician and be valid for up to 5 years. This requirement aligns Northern Ireland with electrical safety standards already in place in England and Wales.'
  },
  {
    question: 'How often can a landlord increase rent in Northern Ireland?',
    answer: 'Under the Private Tenancies Act (NI) 2022, landlords can only increase rent once in any 12-month period. Landlords must give tenants at least 2 months\' written notice of a rent increase. The increase must be fair and comparable to market rates for similar properties in the area. Tenants can challenge excessive rent increases through the Housing Rights Service or the courts.'
  },
  {
    question: 'What prescribed information must be included in a Northern Ireland tenancy agreement?',
    answer: 'A Northern Ireland tenancy agreement must include: the full names and addresses of landlord and tenant; the property address; the rent amount and payment frequency; the deposit amount and which scheme protects it; the tenancy start date; repair responsibilities; rules about alterations, subletting, and pets; the landlord\'s contact details for emergencies; and information about the tenant\'s right to quiet enjoyment of the property.'
  },
  {
    question: 'Can a tenant in Northern Ireland end their tenancy early?',
    answer: 'Tenants in Northern Ireland must give at least 4 weeks\' written notice to end their tenancy, regardless of how long they have lived there. This is shorter than the notice landlords must give. If a tenant leaves before the end of a fixed term without an early termination clause, they may be liable for rent until the end of the fixed term or until a new tenant is found, whichever is sooner.'
  },
  {
    question: 'Does a landlord need to be registered in Northern Ireland?',
    answer: 'Yes, all private landlords in Northern Ireland must register with the Landlord Registration Scheme operated by local councils. Landlords must register within one month of a tenancy starting. The registration fee is currently £70 and registration lasts for 3 years. Failure to register is a criminal offence with fines up to £2,500 and can prevent landlords from using the eviction process.'
  },
  {
    question: 'What happens if a landlord doesn\'t provide a written tenancy agreement?',
    answer: 'If a landlord fails to provide a written statement of tenancy terms within 28 days, they commit a criminal offence under the Private Tenancies Act (NI) 2022. The tenant can report this to the council, which may issue a fixed penalty notice of £500 to the landlord. If prosecuted, landlords face fines up to £2,500. Additionally, non-compliance can prevent the landlord from serving a valid Notice to Quit.'
  },
  {
    question: 'Are there minimum property standards for rental homes in Northern Ireland?',
    answer: 'Yes, all rental properties in Northern Ireland must meet the Fitness Standard set out in the Housing (Northern Ireland) Order 1992. Properties must be structurally stable, free from serious disrepair, have adequate facilities for cooking and washing, have a working heating system, and be free from damp. Environmental Health Officers can inspect properties and require landlords to make improvements.'
  }
];

export default function NorthernIrelandTenancyAgreementTemplatePage() {
  return (
    <>
      <StructuredData
        data={articleSchema({
          headline: 'Northern Ireland Tenancy Agreement Template 2026 | Private Tenancies Act Compliant',
          description: 'Create a legally compliant Northern Ireland tenancy agreement template for 2026. Fully updated for the Private Tenancies Act (NI) 2022 with all prescribed terms.',
          url: getCanonicalUrl('/northern-ireland-tenancy-agreement-template'),
          datePublished: '2024-01-15',
          dateModified: '2025-01-20',
        })}
      />
      <StructuredData data={faqPageSchema(faqs)} />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Tenancy Agreement Packs', url: '/products/ast' },
          { name: 'NI Tenancy Agreement Template', url: '/northern-ireland-tenancy-agreement-template' },
        ])}
      />

      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        {/* Breadcrumb */}
        <nav className="bg-white border-b border-slate-200">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <ol className="flex items-center space-x-2 text-sm text-slate-600">
              <li><Link href="/" className="hover:text-amber-600">Home</Link></li>
              <li className="text-slate-400">/</li>
              <li><Link href="/products/ast" className="hover:text-amber-600">Tenancy Agreement Packs</Link></li>
              <li className="text-slate-400">/</li>
              <li className="text-slate-900 font-medium">Template</li>
            </ol>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="bg-gradient-to-br from-emerald-800 via-emerald-900 to-slate-900 text-white py-16">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex items-center gap-2 text-emerald-300 mb-4">
              <RiShieldCheckLine className="w-5 h-5" />
              <span className="text-sm font-medium">Private Tenancies Act 2022 Compliant</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Northern Ireland Tenancy Agreement Template 2026
            </h1>
            <p className="text-xl text-emerald-100 mb-8 max-w-2xl">
              Create a legally compliant Private Tenancy Agreement for Northern Ireland in minutes.
              Fully updated for the Private Tenancies Act (NI) 2022 with all prescribed terms and mandatory clauses.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/wizard?product=ast_standard&src=seo_ni_tenancy_template&topic=tenancy&jurisdiction=northern-ireland"
                className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold px-8 py-4 rounded-lg transition-colors"
              >
                <RiFileTextLine className="w-5 h-5" />
                Create Your Agreement
                <RiArrowRightLine className="w-5 h-5" />
              </Link>
              <Link
                href="#template-details"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-4 rounded-lg transition-colors"
              >
                <RiQuestionLine className="w-5 h-5" />
                View Template Details
              </Link>
            </div>
            <p className="mt-4 text-sm text-emerald-100">
              Compare Standard vs Premium in the{' '}
              <Link href="/products/ast" className="font-semibold text-white hover:underline">
                Tenancy Agreement Pack overview
              </Link>
              .
            </p>
          </div>
        </section>

        {/* Trust Signals */}
        <section className="bg-white border-b border-slate-200 py-8">
          <div className="max-w-4xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-slate-900">2022</div>
                <div className="text-sm text-slate-600">Act Compliant</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">5 min</div>
                <div className="text-sm text-slate-600">To Complete</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">PDF</div>
                <div className="text-sm text-slate-600">Instant Download</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">100%</div>
                <div className="text-sm text-slate-600">NI Specific</div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <article className="max-w-4xl mx-auto px-4 py-12">
          {/* Introduction */}
          <section className="prose prose-lg max-w-none mb-12">
            <p className="text-xl text-slate-600 leading-relaxed">
              The Private Tenancies Act (Northern Ireland) 2022 transformed landlord obligations, making written tenancy
              agreements a legal requirement for the first time. Our Northern Ireland tenancy agreement template ensures
              full compliance with all prescribed terms while protecting both landlord and tenant interests.
            </p>
          </section>

          {/* Why You Need a Compliant Agreement */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <RiShieldCheckLine className="w-6 h-6 text-emerald-600" />
              Why a Compliant NI Tenancy Agreement Matters
            </h2>
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
              <h3 className="font-semibold text-red-900 mb-3">Criminal Offence Warning</h3>
              <p className="text-red-800">
                Since April 2023, failing to provide a written tenancy agreement within 28 days is a criminal offence
                under the Private Tenancies Act (NI) 2022. Landlords face fixed penalty notices of £500 or prosecution
                with fines up to £2,500. Additionally, non-compliant landlords cannot serve valid eviction notices.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-50 rounded-xl p-6">
                <h3 className="font-semibold text-slate-900 mb-3">For Landlords</h3>
                <ul className="space-y-2 text-slate-700">
                  <li className="flex items-start gap-2">
                    <RiCheckboxCircleLine className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Avoid criminal prosecution and fines</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <RiCheckboxCircleLine className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Enable valid Notice to Quit service</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <RiCheckboxCircleLine className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Protect your deposit deductions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <RiCheckboxCircleLine className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Clear rent collection procedures</span>
                  </li>
                </ul>
              </div>
              <div className="bg-slate-50 rounded-xl p-6">
                <h3 className="font-semibold text-slate-900 mb-3">For Tenants</h3>
                <ul className="space-y-2 text-slate-700">
                  <li className="flex items-start gap-2">
                    <RiCheckboxCircleLine className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Know your rights in writing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <RiCheckboxCircleLine className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Protected deposit confirmation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <RiCheckboxCircleLine className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Clear repair responsibilities</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <RiCheckboxCircleLine className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Security of tenure protection</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Prescribed Terms Section */}
          <section className="mb-12" id="template-details">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <RiFileList2Line className="w-6 h-6 text-emerald-600" />
              Prescribed Terms Required by Law
            </h2>
            <p className="text-slate-600 mb-6">
              The Private Tenancies Act (NI) 2022 specifies exactly what information must be included in every
              tenancy agreement. Our template includes all prescribed terms:
            </p>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-emerald-900 mb-3">Parties & Property</h4>
                  <ul className="space-y-2 text-emerald-800">
                    <li>• Full names of landlord and tenant(s)</li>
                    <li>• Landlord's correspondence address</li>
                    <li>• Full address of rental property</li>
                    <li>• Landlord registration number</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-emerald-900 mb-3">Financial Terms</h4>
                  <ul className="space-y-2 text-emerald-800">
                    <li>• Rent amount and payment date</li>
                    <li>• Payment method</li>
                    <li>• Deposit amount (max 2 months)</li>
                    <li>• Deposit protection scheme details</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-emerald-900 mb-3">Tenancy Details</h4>
                  <ul className="space-y-2 text-emerald-800">
                    <li>• Tenancy start date</li>
                    <li>• Fixed term or periodic tenancy</li>
                    <li>• Notice period requirements</li>
                    <li>• Any restrictions on use</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-emerald-900 mb-3">Responsibilities</h4>
                  <ul className="space-y-2 text-emerald-800">
                    <li>• Landlord repair obligations</li>
                    <li>• Tenant maintenance duties</li>
                    <li>• Emergency contact details</li>
                    <li>• Access arrangements</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Deposit Rules */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <RiMoneyPoundCircleLine className="w-6 h-6 text-emerald-600" />
              Northern Ireland Deposit Rules
            </h2>
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <div className="text-3xl font-bold text-emerald-600">2 months</div>
                  <div className="text-slate-600 mt-1">Maximum deposit</div>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <div className="text-3xl font-bold text-emerald-600">14 days</div>
                  <div className="text-slate-600 mt-1">To protect deposit</div>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <div className="text-3xl font-bold text-emerald-600">28 days</div>
                  <div className="text-slate-600 mt-1">To provide prescribed info</div>
                </div>
              </div>
              <p className="text-slate-600 mt-6">
                Landlords must use a government-approved tenancy deposit scheme. In Northern Ireland, the main
                scheme is the <strong>Tenancy Deposit Scheme Northern Ireland (TDSNI)</strong>. Failure to protect
                the deposit can result in penalties of up to 3 times the deposit amount and prevents the landlord
                from serving a valid Notice to Quit.
              </p>
            </div>
          </section>

          {/* Notice Periods */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <RiTimeLine className="w-6 h-6 text-emerald-600" />
              Notice Periods in Northern Ireland
            </h2>
            <p className="text-slate-600 mb-6">
              The Private Tenancies Act 2022 introduced tiered notice periods based on tenancy length.
              Understanding these is essential for any tenancy agreement:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border border-slate-200 px-4 py-3 text-left font-semibold">Tenancy Length</th>
                    <th className="border border-slate-200 px-4 py-3 text-left font-semibold">Landlord Notice</th>
                    <th className="border border-slate-200 px-4 py-3 text-left font-semibold">Tenant Notice</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-slate-200 px-4 py-3">Under 12 months</td>
                    <td className="border border-slate-200 px-4 py-3">28 days (4 weeks)</td>
                    <td className="border border-slate-200 px-4 py-3">4 weeks</td>
                  </tr>
                  <tr className="bg-slate-50">
                    <td className="border border-slate-200 px-4 py-3">1 to 5 years</td>
                    <td className="border border-slate-200 px-4 py-3">56 days (8 weeks)</td>
                    <td className="border border-slate-200 px-4 py-3">4 weeks</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-200 px-4 py-3">Over 5 years</td>
                    <td className="border border-slate-200 px-4 py-3">84 days (12 weeks)</td>
                    <td className="border border-slate-200 px-4 py-3">4 weeks</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* New Requirements Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <RiHomeLine className="w-6 h-6 text-emerald-600" />
              2025 Requirements Update
            </h2>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
              <h3 className="font-semibold text-amber-900 mb-3">Electrical Safety (EICR) Requirements</h3>
              <p className="text-amber-800 mb-4">
                From <strong>April 2025</strong>, all new tenancies in Northern Ireland will require a valid
                Electrical Installation Condition Report (EICR). Existing tenancies must comply by April 2026.
              </p>
              <ul className="space-y-2 text-amber-800">
                <li className="flex items-start gap-2">
                  <RiCheckboxCircleLine className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                  <span>EICR must be conducted by a registered electrician</span>
                </li>
                <li className="flex items-start gap-2">
                  <RiCheckboxCircleLine className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                  <span>Valid for up to 5 years</span>
                </li>
                <li className="flex items-start gap-2">
                  <RiCheckboxCircleLine className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                  <span>Copy must be provided to tenant before occupation</span>
                </li>
                <li className="flex items-start gap-2">
                  <RiCheckboxCircleLine className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                  <span>Recommended to include certificate with tenancy agreement</span>
                </li>
              </ul>
            </div>
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
              Create Your NI Tenancy Agreement Now
            </h2>
            <p className="text-emerald-100 mb-6 max-w-xl mx-auto">
              Our intelligent wizard guides you through every required clause and prescribed term.
              Get a fully compliant Private Tenancy Agreement in under 5 minutes.
            </p>
            <Link
              href="/wizard?product=ast_standard&src=seo_ni_tenancy_template&topic=tenancy&jurisdiction=northern-ireland"
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
