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
import { FAQSection } from '@/components/seo/FAQSection';

export const metadata: Metadata = {
  title: 'Northern Ireland Tenancy Agreement Template | NI Compliant 2026',
  description: 'Northern Ireland tenancy agreement template updated for Private Tenancies Act (NI) 2022 rules. Create compliant tenancy terms and prescribed information quickly.',
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
    title: 'Northern Ireland Tenancy Agreement Template | NI Compliant 2026',
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
  },
  {
    question: 'How detailed should my evidence bundle be?',
    answer: 'Include the signed agreement, full chronology, communication trail, service proof, and financial schedule. A clear indexed bundle reduces hearing delays and adjournments.',
  },
  {
    question: 'What if the tenant disputes the amount or facts?',
    answer: 'Reconcile your figures line by line against your ledger and tenancy terms, then evidence every step. Where disputes continue, present a neutral timeline with supporting documents.',
  },
];

export default function NorthernIrelandTenancyAgreementTemplatePage() {
  return (
    <>
      <StructuredData
        data={articleSchema({
          headline: 'Northern Ireland Tenancy Agreement Template (NI) | Private Tenancies Act Compliant',
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
              Northern Ireland Tenancy Agreement Template (NI)
            </h1>
            <p className="text-xl text-emerald-100 mb-8 max-w-2xl">
              Need a Northern Ireland tenancy agreement template that meets current law? Build a compliant NI agreement with the prescribed terms required by the Private Tenancies Act (NI) 2022, including rent, deposit, and notice clauses.
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

  

        <section className="py-10 bg-white" id="snippet-opportunities">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto prose prose-slate max-w-none">
              <h2>Tenancy Agreement Northern Ireland Template</h2>
              <p>A Northern Ireland tenancy agreement template should set out the parties, property address, rent terms, deposit terms, repair responsibilities, and notice clauses in line with local law. It should also reflect current Private Tenancies Act duties, including information and receipt requirements where applicable.</p>

              <h3>NI Tenancy vs England AST</h3>
              <table>
                <thead>
                  <tr><th>Point</th><th>Northern Ireland tenancy</th><th>England AST</th></tr>
                </thead>
                <tbody>
                  <tr><td>Core regime</td><td>Private Tenancies NI framework</td><td>Housing Act 1988 AST framework</td></tr>
                  <tr><td>Possession notices</td><td>Notice to Quit and NI procedures</td><td>Section 8 / Section 21 pathways</td></tr>
                  <tr><td>Terminology</td><td>Private tenancy terms</td><td>Assured shorthold tenancy terms</td></tr>
                  <tr><td>Compliance checks</td><td>NI-specific statutory duties</td><td>England-specific prescribed requirements</td></tr>
                </tbody>
              </table>

              <h3>Definition: Private Residential Tenancy (PRT)</h3>
              <p>Private Residential Tenancy (PRT) is the main tenancy model used in Scotland’s private rented sector. It is open-ended and gives tenants stronger security than fixed-term structures used elsewhere. Landlords should avoid mixing Scottish PRT terminology into Northern Ireland tenancy documents.</p>

              <h3>Definition: Notice to Leave</h3>
              <p>Notice to Leave is a Scottish notice used to begin possession action in a Private Residential Tenancy. It identifies the ground relied on and the notice period required. It is not the same as forms used in England or Northern Ireland and should not be used cross-jurisdiction.</p>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white" id="guide-navigation">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Complete Landlord Guide</h2>
              <p className="text-gray-700 mb-6">Use this expanded resource for the Northern Ireland tenancy agreement compliance process under the Private Tenancies Act. It is designed for landlords who need practical steps, legal context, and clear evidence standards before serving notices or issuing court claims.</p>
              <div className="grid md:grid-cols-3 gap-3 text-sm">
                <a href="#legal-framework" className="p-3 rounded-lg border border-gray-200 hover:border-primary">Legal framework</a>
                <a href="#step-by-step" className="p-3 rounded-lg border border-gray-200 hover:border-primary">Step-by-step process</a>
                <a href="#mistakes" className="p-3 rounded-lg border border-gray-200 hover:border-primary">Common mistakes</a>
                <a href="#evidence-checklist" className="p-3 rounded-lg border border-gray-200 hover:border-primary">Evidence checklist</a>
                <a href="#timeline-breakdown" className="p-3 rounded-lg border border-gray-200 hover:border-primary">Timeline breakdown</a>
                <a href="#comparison-table" className="p-3 rounded-lg border border-gray-200 hover:border-primary">Comparison table</a>
              </div>
            </div>
          </div>
        </section>

        <section className="py-6 bg-gray-50" id="legal-framework">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto prose prose-slate max-w-none">
              <h2>Legal Framework Explained for Landlords</h2>
              <p>Landlords get better outcomes when they treat document generation as one part of a full legal workflow. Courts and adjudicators are not only checking whether you used the right template, but also whether you followed the statutory sequence correctly, gave fair notice, and can prove service and compliance. In practice, failures usually happen because a landlord serves too early, uses the wrong dates, or cannot evidence how documents were served.</p>
              <p>The strongest approach is to work from statute to action: identify the governing rules, map those rules to your tenancy facts, then generate documents only after validation. That means confirming tenancy type, start date, rent schedule, deposit status, safety records, licensing, prior correspondence, and any relevant protocol steps. Doing this once in a structured way dramatically reduces avoidable delays and repeat filings.</p>
              <p>Jurisdiction matters at every stage. England, Wales, Scotland, and Northern Ireland have different possession frameworks and terminology, so always anchor your action plan to property location and tenancy regime before relying on any form wording. If you manage across multiple regions, keep separate compliance checklists and document packs for each jurisdiction to avoid cross-jurisdiction errors.</p>
            </div>
          </div>
        </section>

        <section className="py-6 bg-white" id="step-by-step">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto prose prose-slate max-w-none">
              <h2>Step-by-Step Landlord Process</h2>
              <ol>
                <li><strong>Diagnose the case type:</strong> define whether your objective is debt recovery, possession, or both. This affects notice choice, court track, and evidence format.</li>
                <li><strong>Validate tenancy facts:</strong> check names, address, tenancy dates, rent frequency, rent due date, and occupant status against signed records.</li>
                <li><strong>Run compliance checks:</strong> confirm deposit and prescribed information position, statutory certificates, licensing duties, and any pre-action requirements.</li>
                <li><strong>Select the right pathway:</strong> choose notice-only, debt claim, or combined strategy based on arrears level, tenant behaviour, and timescale.</li>
                <li><strong>Prepare a clear chronology:</strong> build a dated timeline of rent events, correspondence, reminders, and evidence collection milestones.</li>
                <li><strong>Generate the document pack:</strong> produce accurate forms and letters with matching dates, amounts, and party details. Keep consistency across all documents.</li>
                <li><strong>Serve correctly:</strong> use permitted methods, serve all required attachments, and preserve proof of service and delivery attempts.</li>
                <li><strong>Track response windows:</strong> diarise notice expiry, payment deadlines, response dates, and court filing windows so deadlines are never missed.</li>
                <li><strong>Escalate with evidence:</strong> if no resolution, move to court or next notice stage using the same chronology and evidence bundle.</li>
                <li><strong>Keep communication professional:</strong> clear, factual communication often improves settlement chances and strengthens your position if litigation follows.</li>
              </ol>
              <p>This structured process is intentionally conservative. It prioritises enforceability over speed-at-all-costs and prevents rework. Where landlords skip steps, the usual outcome is not just delay; it is duplicated fees, repeated service, and weaker negotiating leverage.</p>
            </div>
          </div>
        </section>

        <section className="py-6 bg-gray-50" id="mistakes">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto prose prose-slate max-w-none">
              <h2>Common Mistakes That Cause Rejection or Delay</h2>
              <ul>
                <li>Using a generic template without checking tenancy type and jurisdiction.</li>
                <li>Serving before prerequisites are satisfied or without required enclosures.</li>
                <li>Date errors: invalid expiry dates, inconsistent chronology, or impossible timelines.</li>
                <li>Amount errors: rent arrears totals that do not reconcile to ledger entries.</li>
                <li>Weak service evidence: no certificate, no proof of posting, no witness notes.</li>
                <li>Switching strategy late without updating previous letters and chronology.</li>
                <li>Overly aggressive correspondence that undermines credibility in court.</li>
              </ul>
              <p>Most of these errors are preventable with a pre-service checklist and a single source of truth for dates and amounts. Keep a master timeline and update it every time you send or receive correspondence.</p>
            </div>
          </div>
        </section>

        <section className="py-6 bg-white" id="evidence-checklist">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto prose prose-slate max-w-none">
              <h2>Evidence Checklist Before You Escalate</h2>
              <ul>
                <li>Signed tenancy/licence agreement and any renewals or variations.</li>
                <li>Rent schedule or ledger showing due dates, paid dates, and running balance.</li>
                <li>Copies of reminder letters, demand notices, and tenant responses.</li>
                <li>Proof of service for every formal document (post, email trail, witness, certificate).</li>
                <li>Compliance documents relevant to your pathway and jurisdiction.</li>
                <li>Chronology document mapping each event to supporting evidence.</li>
                <li>Settlement record where payment plans were offered or negotiated.</li>
              </ul>
              <p className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">Need a faster route from guidance to action? Use our <Link href="/products/ast" className="text-primary underline">recommended product pathway</Link> to generate compliance-checked documents and keep service evidence aligned for next steps.</p>
            </div>
          </div>
        </section>

        <section className="py-6 bg-gray-50" id="timeline-breakdown">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto prose prose-slate max-w-none">
              <h2>Timeline Breakdown</h2>
              <p><strong>Day 0-3:</strong> identify issue, verify tenancy facts, and begin chronology. <strong>Day 4-10:</strong> issue first formal communication and gather proof of service. <strong>Day 11-30:</strong> monitor response and update arrears or compliance records. <strong>Post-deadline:</strong> choose escalation route, finalise evidence bundle, and prepare filing-ready documents.</p>
              <p>Where deadlines are statutory, build in a safety margin and avoid last-day actions. If your process relies on post, include deemed service assumptions and non-delivery contingencies. If your process relies on email, keep complete metadata and sent-item logs.</p>
            </div>
          </div>
        </section>

        <section className="py-6 bg-white" id="comparison-table">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Strategy Comparison Table</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-200 p-3 text-left">Route</th>
                      <th className="border border-gray-200 p-3 text-left">Best for</th>
                      <th className="border border-gray-200 p-3 text-left">Main risk</th>
                      <th className="border border-gray-200 p-3 text-left">Evidence priority</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-200 p-3">Template-only self service</td>
                      <td className="border border-gray-200 p-3">Confident landlords with clean facts</td>
                      <td className="border border-gray-200 p-3">Date/compliance mistakes</td>
                      <td className="border border-gray-200 p-3">Service proof + chronology</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-200 p-3">Guided product workflow</td>
                      <td className="border border-gray-200 p-3">Most landlords needing speed + certainty</td>
                      <td className="border border-gray-200 p-3">Incomplete source information</td>
                      <td className="border border-gray-200 p-3">Validation outputs + attached records</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 p-3">Immediate court escalation</td>
                      <td className="border border-gray-200 p-3">No response after valid notice/protocol</td>
                      <td className="border border-gray-200 p-3">Weak bundle preparation</td>
                      <td className="border border-gray-200 p-3">Complete documentary bundle</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>



        <section className="py-6 bg-gray-50" id="practical-scenarios">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto prose prose-slate max-w-none">
              <h2>Practical Landlord Scenarios and Decision Rules</h2>
              <p>Landlords rarely manage ideal cases. Real files usually include partial payment, incomplete paperwork, changing tenant communication, and competing objectives around speed, debt recovery, and possession certainty. For Northern Ireland tenancy compliance, the best decision is usually the one that preserves options rather than forcing a single-route strategy too early. That is why experienced landlords separate diagnosis from document generation: first classify the problem, then choose the legal route, then build evidence that supports that route.</p>
              <p><strong>Scenario 1: Cooperative but financially stretched tenant.</strong> Start with a firm written plan, confirm the amount due, and set review points. Keep every communication factual and date-stamped. If payments fail twice, escalate immediately rather than allowing repeated informal extensions that weaken your position.</p>
              <p><strong>Scenario 2: No response after formal notice or arrears letter.</strong> Treat silence as a process signal. Move from reminder to formal stage according to your timeline, keep service proof, and avoid emotional wording. The absence of response often makes documentary quality more important, not less.</p>
              <p><strong>Scenario 3: Tenant disputes numbers.</strong> Provide a reconciliation schedule showing each charge, payment, and balance movement. Link each figure to source records. Courts and mediators favour landlords who can produce clear arithmetic and consistent chronology.</p>
              <p><strong>Scenario 4: Multiple tenants or occupants.</strong> Confirm who is legally liable, who signed, and how notices should be addressed and served. Do not assume all occupiers have identical status. Incorrect party details are a frequent source of avoidable delays.</p>
              <p><strong>Scenario 5: Property condition counter-allegations.</strong> Keep maintenance logs, inspection records, contractor invoices, and response times. Even where your main claim is possession or debt, condition evidence can influence credibility and case management outcomes.</p>
              <p>Use the following decision rules to stay on track: validate facts before serving, serve once but serve properly, never let deadlines pass without next-step action, and preserve evidence at the point of event rather than reconstructing later. If your case may reach court, assume every date, amount, and communication could be scrutinised line by line.</p>
              <p>From an operations perspective, create a single case file containing tenancy documents, timeline, financial schedule, correspondence, service proof, and escalation notes. This prevents fragmented evidence and allows fast handover to legal support if needed. Landlords who maintain structured files generally resolve matters faster, either through payment, settlement, or successful court progression.</p>
              <p>Finally, distinguish between urgency and haste. Urgency means acting promptly within a defined legal sequence. Haste means skipping verification to issue documents quickly. The first improves outcomes; the second often causes re-service, adjournment, or rejection. A disciplined, evidence-led approach is the most reliable route to faster possession and stronger debt recovery.</p>
            </div>
          </div>
        </section>



        <section className="py-6 bg-white" id="advanced-checklist">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto prose prose-slate max-w-none">
              <h2>Advanced Pre-Court Checklist for Landlords</h2>
              <p>Use this advanced checklist before final service or filing. It is designed to reduce preventable rejection and improve clarity if your matter is reviewed by a judge, adviser, or mediator.</p>
              <ul>
                <li>Identity and party data verified against signed agreement and latest correspondence.</li>
                <li>Property address appears consistently in every document version and enclosure.</li>
                <li>Tenancy dates, start terms, and any renewals documented without contradiction.</li>
                <li>Rent amount, due date, and payment method cross-checked to bank evidence.</li>
                <li>Arrears or claim schedule reconciled line by line with source transactions.</li>
                <li>Notice or letter date logic checked against statutory minimum periods.</li>
                <li>Service method matches tenancy clause and jurisdiction requirements.</li>
                <li>Certificate of service, proof of posting, and witness note retained.</li>
                <li>All statutory or protocol prerequisites completed and evidenced.</li>
                <li>Communication trail exported with dates, senders, and full message text.</li>
                <li>Photographic or inspection evidence indexed where condition issues exist.</li>
                <li>Any payment plan proposals recorded with acceptance or refusal dates.</li>
                <li>Escalation decision note written to explain why next legal step is justified.</li>
                <li>Bundle index prepared so every statement can be matched to a document.</li>
                <li>Final quality pass completed by reading documents as if you were the court.</li>
              </ul>
              <p>When landlords complete this checklist, case quality improves in three ways: fewer factual errors, stronger service evidence, and cleaner chronology. These improvements directly affect negotiation leverage and reduce avoidable adjournments.</p>
              <p>As a practical rule, if any key item above is incomplete, pause and correct it before service or filing. A one-day delay for quality control is usually better than a multi-week delay caused by rejected or disputed paperwork.</p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <FAQSection faqs={faqs} includeSchema={false} showContactCTA={false} />

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
