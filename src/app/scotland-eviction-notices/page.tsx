import type { Metadata } from 'next';
import Link from 'next/link';
import { getCanonicalUrl } from '@/lib/seo/urls';
import { StructuredData, faqPageSchema, breadcrumbSchema, articleSchema } from '@/lib/seo/structured-data';
import {
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  FileText,
  Home,
  Gavel,
} from 'lucide-react';
import { FAQSection } from '@/components/marketing/FAQSection';
import { NextLegalSteps } from '@/components/seo/NextLegalSteps';
import { productLinks, askHeavenLink } from '@/lib/seo/internal-links';
import { AskHeavenWidget } from '@/components/ask-heaven/AskHeavenWidget';

export const metadata: Metadata = {
  title: 'Scottish Eviction Notice 2026 for Landlords | Notice to Leave',
  description:
    'For landlords needing compliant Scottish eviction notices without costly delays. Notice to Leave rules, PRT grounds, and tribunal steps for 2026.',
  keywords: [
    'notice to leave scotland',
    'eviction notice scotland',
    'scotland landlord eviction',
    'prt eviction scotland',
    'private residential tenancy eviction',
    'first tier tribunal scotland',
    'scotland eviction grounds',
    'evict tenant scotland',
  ],
  openGraph: {
    title: 'Scottish Eviction Notice 2026 for Landlords | Notice to Leave',
    description:
      'Landlord guide to Scotland Notice to Leave requirements, eviction grounds, and tribunal steps.',
    type: 'article',
    url: getCanonicalUrl('/scotland-eviction-notices'),
  },
  alternates: {
    canonical: getCanonicalUrl('/scotland-eviction-notices'),
  },
};

const faqs = [
  {
    question: 'Does Section 21 apply in Scotland?',
    answer:
      'No. Section 21 notices do not apply in Scotland. Scottish landlords must use a Notice to Leave citing one of 18 eviction grounds under the Private Housing (Tenancies) (Scotland) Act 2016. Scotland has had grounds-based eviction since 2017.',
  },
  {
    question: 'What is a Private Residential Tenancy (PRT)?',
    answer:
      'A Private Residential Tenancy (PRT) is the standard tenancy type in Scotland since December 2017. Unlike English ASTs, PRTs are open-ended with no fixed term. Landlords cannot end a PRT without citing a valid eviction ground. Tenants can end a PRT with 28 days notice.',
  },
  {
    question: 'What is a Notice to Leave?',
    answer:
      'A Notice to Leave is the Scottish equivalent of an eviction notice. It must cite one or more of the 18 eviction grounds under the Private Housing (Tenancies) (Scotland) Act 2016. Notice periods range from 28 to 84 days depending on the ground used.',
  },
  {
    question: 'How much notice do I need to give to evict in Scotland?',
    answer:
      'Notice periods in Scotland depend on the eviction ground. Rent arrears (Ground 12) and antisocial behaviour (Ground 14) require 28 days. Most other grounds including landlord selling (Ground 1) and landlord moving in (Ground 4) require 84 days notice.',
  },
  {
    question: 'What is the First-tier Tribunal for Scotland?',
    answer:
      'The First-tier Tribunal for Scotland (Housing and Property Chamber) handles eviction cases in Scotland. If a tenant does not leave after the notice period, landlords must apply to the Tribunal for an eviction order - not the county court as in England.',
  },
  {
    question: 'What are the eviction grounds in Scotland?',
    answer:
      'There are 18 eviction grounds under Scottish law. Key grounds include: Ground 1 (landlord intends to sell), Ground 4 (landlord/family moving in), Ground 12 (rent arrears for 3+ months), Ground 13 (breach of tenancy), Ground 14 (antisocial behaviour). Some are mandatory, others discretionary.',
  },
  {
    question: 'Can I evict for rent arrears in Scotland?',
    answer:
      'Yes. Ground 12 applies when the tenant has 3 or more consecutive months of rent arrears. Ground 12A applies to substantial cumulative arrears. Notice period is 28 days. You must also have completed pre-action requirements before applying to the Tribunal.',
  },
  {
    question: 'Do I need to register as a landlord in Scotland?',
    answer:
      'Yes. All private landlords in Scotland must register with their local council on the Scottish Landlord Register. It is a criminal offence to let property without registration. Your registration number must appear on the Notice to Leave.',
  },
  {
    question: 'How long does eviction take in Scotland?',
    answer:
      'Scottish eviction typically takes 4-8 months. This includes: Notice period (28-84 days), Tribunal application processing (4-8 weeks), Tribunal hearing (4-8 weeks), and enforcement if needed. Contested cases take longer.',
  },
  {
    question: 'Can I use English eviction notice templates in Scotland?',
    answer:
      'No. Section 21 and Section 8 notices are specific to England. Scotland requires a Notice to Leave under the Private Housing (Tenancies) (Scotland) Act 2016. Using incorrect notices will be rejected by the Tribunal.',
  },
];

const evictionGrounds = [
  { ground: '1', description: 'Landlord intends to sell', notice: '84 days', type: 'Mandatory' },
  { ground: '2', description: 'Property to be sold by lender', notice: '84 days', type: 'Mandatory' },
  { ground: '3', description: 'Landlord intends to refurbish', notice: '84 days', type: 'Discretionary' },
  { ground: '4', description: 'Landlord or family moving in', notice: '84 days', type: 'Mandatory' },
  { ground: '5', description: 'Landlord intends to use for non-residential purpose', notice: '84 days', type: 'Discretionary' },
  { ground: '6', description: 'Landlord intends to use for religious purpose', notice: '84 days', type: 'Discretionary' },
  { ground: '7', description: 'Property required for employee', notice: '84 days', type: 'Discretionary' },
  { ground: '8', description: 'Tenant no longer needs supported accommodation', notice: '84 days', type: 'Discretionary' },
  { ground: '9', description: 'Property not tenant\'s only or principal home', notice: '28 days', type: 'Discretionary' },
  { ground: '10', description: 'Property required for purpose-built student accommodation', notice: '28 days', type: 'Mandatory' },
  { ground: '11', description: 'Breach of tenancy agreement', notice: '28 days', type: 'Discretionary' },
  { ground: '12', description: '3+ consecutive months rent arrears', notice: '28 days', type: 'Mandatory' },
  { ground: '12A', description: 'Substantial rent arrears (cumulative)', notice: '28 days', type: 'Discretionary' },
  { ground: '13', description: 'Criminal conviction relevant to let', notice: '28 days', type: 'Discretionary' },
  { ground: '14', description: 'Antisocial behaviour', notice: '28 days', type: 'Mandatory' },
  { ground: '15', description: 'Association with person evicted for antisocial behaviour', notice: '28 days', type: 'Discretionary' },
  { ground: '16', description: 'Landlord has ceased to be registered', notice: '84 days', type: 'Mandatory' },
  { ground: '17', description: 'HMO licence revoked', notice: '84 days', type: 'Mandatory' },
  { ground: '18', description: 'Overcrowding statutory notice', notice: '28 days', type: 'Mandatory' },
];

export default function ScotlandEvictionNoticesPage() {
  return (
    <>
      <StructuredData
        data={articleSchema({
          headline: 'Scotland Eviction Notices (Landlord Guide)',
          description:
            'Landlord guide to Scottish eviction notices, Notice to Leave requirements, and tribunal steps.',
          url: getCanonicalUrl('/scotland-eviction-notices'),
          datePublished: '2026-01-01',
          dateModified: '2026-01-01',
        })}
      />
      <StructuredData data={faqPageSchema(faqs)} />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          { name: 'How to Evict a Tenant', url: 'https://landlordheaven.co.uk/how-to-evict-tenant' },
          { name: 'Scotland Eviction Notices', url: 'https://landlordheaven.co.uk/scotland-eviction-notices' },
        ])}
      />

      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-900 to-blue-800 text-white py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex items-center justify-center gap-2 mb-6">
                <span className="text-5xl">🏴󠁧󠁢󠁳󠁣󠁴󠁿</span>
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                Scotland Eviction Notices (Landlord Guide)
              </h1>

              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Complete guide to <strong>Notice to Leave</strong> and{' '}
                <strong>Private Residential Tenancy (PRT)</strong> eviction under Scottish
                law. 18 eviction grounds and First-tier Tribunal process.
              </p>

              {/* Important Notice */}
              <div className="bg-blue-950/50 border border-blue-700 rounded-lg p-4 mb-8 text-left max-w-2xl mx-auto">
                <p className="text-sm text-blue-100 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
                  <span>
                    <strong>Important:</strong> Section 21 and Section 8 notices do NOT apply
                    in Scotland. Scottish landlords must use Notice to Leave under the
                    Private Housing (Tenancies) (Scotland) Act 2016.
                  </span>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/products/notice-only"
                  className="inline-flex items-center justify-center gap-2 bg-white text-blue-800 font-semibold py-4 px-8 rounded-xl hover:bg-blue-50 transition-colors"
                >
                  Get Scotland Notice — £49.99
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/tenancy-agreements/scotland"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold py-4 px-8 rounded-xl transition-colors border border-white/20"
                >
                  Scotland PRT Agreements
                </Link>
              </div>
            </div>
          </div>
        </section>


        {/* Key Differences Section */}
        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                Scotland vs England: Key Differences
              </h2>

              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold text-gray-900">
                        Aspect
                      </th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-900">
                        🏴󠁧󠁢󠁳󠁣󠁴󠁿 Scotland
                      </th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-900">
                        🏴󠁧󠁢󠁥󠁮󠁧󠁿 England
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 font-medium text-gray-900">Legislation</td>
                      <td className="px-6 py-4 text-gray-600">
                        Private Housing (Tenancies) (Scotland) Act 2016
                      </td>
                      <td className="px-6 py-4 text-gray-600">Housing Act 1988</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">Tenancy type</td>
                      <td className="px-6 py-4 text-gray-600">
                        Private Residential Tenancy (PRT)
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        Assured Shorthold Tenancy (AST)
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-medium text-gray-900">Fixed term</td>
                      <td className="px-6 py-4 text-gray-600">
                        No fixed term (open-ended)
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        Usually 6-12 months fixed
                      </td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">Eviction notice</td>
                      <td className="px-6 py-4 text-gray-600">Notice to Leave</td>
                      <td className="px-6 py-4 text-gray-600">Section 21 / Section 8</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-medium text-gray-900">Eviction grounds</td>
                      <td className="px-6 py-4 text-gray-600">18 grounds (mandatory + discretionary)</td>
                      <td className="px-6 py-4 text-gray-600">
                        17 grounds (Section 8) + no-fault (Section 21)
                      </td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">No-fault eviction</td>
                      <td className="px-6 py-4 text-blue-600 font-medium">
                        Never existed for PRTs
                      </td>
                      <td className="px-6 py-4 text-amber-600 font-medium">
                        Ends May 2026
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-medium text-gray-900">Court/Tribunal</td>
                      <td className="px-6 py-4 text-gray-600">
                        First-tier Tribunal for Scotland
                      </td>
                      <td className="px-6 py-4 text-gray-600">County Court</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">Landlord registration</td>
                      <td className="px-6 py-4 text-gray-600">
                        <strong>Mandatory</strong> (criminal offence if not)
                      </td>
                      <td className="px-6 py-4 text-gray-600">Not required</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-medium text-gray-900">Max deposit</td>
                      <td className="px-6 py-4 text-gray-600">2 months rent</td>
                      <td className="px-6 py-4 text-gray-600">5 weeks rent</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* Notice to Leave Section */}
        <section className="py-12 lg:py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Notice to Leave Requirements
              </h2>

              <div className="prose prose-lg max-w-none mb-8">
                <p>
                  A <strong>Notice to Leave</strong> is the formal eviction notice used in
                  Scotland. It must be in writing and include:
                </p>
              </div>

              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200 mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Notice to Leave Must Include:
                </h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
                    <span>The tenant&apos;s name and the property address</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
                    <span>The eviction ground(s) being relied upon</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
                    <span>The day the notice is given</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
                    <span>The earliest date the tenant can be expected to leave</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
                    <span>Explanation of why the ground applies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
                    <span>Your landlord registration number</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
                    <span>Information about where to get advice</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Eviction Grounds Table */}
        <section className="py-12 lg:py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                All 18 Scottish Eviction Grounds
              </h2>

              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-8 rounded-r-lg">
                <p className="text-amber-900 text-sm">
                  <strong>Mandatory vs Discretionary:</strong> For mandatory grounds, the
                  Tribunal must grant eviction if the ground is proven. For discretionary
                  grounds, the Tribunal considers whether eviction is reasonable.
                </p>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead className="bg-blue-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900 w-20">
                        Ground
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">
                        Description
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900 w-28">
                        Notice
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900 w-32">
                        Type
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-sm">
                    {evictionGrounds.map((ground, index) => (
                      <tr key={ground.ground} className={index % 2 === 1 ? 'bg-gray-50' : ''}>
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {ground.ground}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{ground.description}</td>
                        <td className="px-4 py-3 text-gray-600">{ground.notice}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                              ground.type === 'Mandatory'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {ground.type}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* Eviction Process Section */}
        <section className="py-12 lg:py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                Scotland Eviction Process
              </h2>

              <div className="space-y-6">
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-bold">1</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        Check Your Eviction Ground
                      </h3>
                      <p className="text-gray-600">
                        Review the 18 eviction grounds and identify which applies to your
                        situation. Gather evidence to support your ground. For rent arrears
                        (Ground 12), ensure the tenant owes 3+ consecutive months.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-bold">2</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        Pre-Action Requirements (for rent arrears)
                      </h3>
                      <p className="text-gray-600">
                        For rent arrears cases, you must complete pre-action requirements
                        including providing information about arrears, offering to discuss
                        payment, and signposting to advice services. Keep records of all
                        communications.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-bold">3</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        Serve Notice to Leave
                      </h3>
                      <p className="text-gray-600">
                        Serve the Notice to Leave citing your eviction ground(s). Ensure the
                        correct notice period applies: 28 days for rent arrears/antisocial
                        behaviour, 84 days for most other grounds. Keep proof of service.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-bold">4</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        Wait for Notice Period
                      </h3>
                      <p className="text-gray-600">
                        Allow the full notice period to expire. The tenant may leave
                        voluntarily during this time. You cannot apply to the Tribunal until
                        the notice period has ended.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-bold">5</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        Apply to First-tier Tribunal
                      </h3>
                      <p className="text-gray-600 mb-3">
                        If the tenant does not leave, apply to the First-tier Tribunal for
                        Scotland (Housing and Property Chamber) for an eviction order. You
                        will need to complete the application form and pay the fee.
                      </p>
                      <div className="flex items-center gap-2 text-sm text-blue-600">
                        <Gavel className="w-4 h-4" />
                        <span>
                          Note: Scottish evictions go to the Tribunal, not the county court
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-bold">6</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        Attend Tribunal Hearing
                      </h3>
                      <p className="text-gray-600">
                        Attend the Tribunal hearing with your evidence. For mandatory grounds,
                        the Tribunal must grant the order if the ground is proven. For
                        discretionary grounds, reasonableness will be considered.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-bold">7</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        Enforcement (if needed)
                      </h3>
                      <p className="text-gray-600">
                        If the tenant still does not leave after the eviction order, apply to
                        Sheriff Officers for enforcement. Never attempt to remove tenants
                        yourself - this is illegal.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Common Scenarios */}
        <section className="py-12 lg:py-16 bg-blue-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                Common Eviction Scenarios in Scotland
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <span className="text-red-600 font-bold text-lg">£</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Rent Arrears</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>
                      <strong>Ground 12:</strong> 3+ consecutive months arrears
                    </li>
                    <li>
                      <strong>Notice:</strong> 28 days
                    </li>
                    <li>
                      <strong>Type:</strong> Mandatory
                    </li>
                    <li>
                      <strong>Requirement:</strong> Complete pre-action protocol
                    </li>
                  </ul>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                      <Home className="w-5 h-5 text-amber-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Selling Property</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>
                      <strong>Ground 1:</strong> Landlord intends to sell
                    </li>
                    <li>
                      <strong>Notice:</strong> 84 days
                    </li>
                    <li>
                      <strong>Type:</strong> Mandatory
                    </li>
                    <li>
                      <strong>Evidence:</strong> Property must be on market
                    </li>
                  </ul>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Home className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Moving Back In</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>
                      <strong>Ground 4:</strong> Landlord or family moving in
                    </li>
                    <li>
                      <strong>Notice:</strong> 84 days
                    </li>
                    <li>
                      <strong>Type:</strong> Mandatory
                    </li>
                    <li>
                      <strong>Requirement:</strong> Must occupy for at least 3 months
                    </li>
                  </ul>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Antisocial Behaviour</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>
                      <strong>Ground 14:</strong> Antisocial behaviour
                    </li>
                    <li>
                      <strong>Notice:</strong> 28 days
                    </li>
                    <li>
                      <strong>Type:</strong> Mandatory
                    </li>
                    <li>
                      <strong>Evidence:</strong> Police reports, neighbour statements
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 lg:py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Notice to Leave Checklist & Common Mistakes
              </h2>
              <p className="text-gray-600 mb-10">
                Scottish Tribunal cases stall when the notice is incomplete or evidence is weak.
                Use this checklist before you serve.
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Validity checklist</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>Correct eviction ground and notice period.</li>
                    <li>Landlord registration number included.</li>
                    <li>Pre-action steps completed for arrears.</li>
                    <li>Proof of service retained.</li>
                  </ul>
                </div>
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Common mistakes</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>Using England Section 21/8 forms.</li>
                    <li>Serving the wrong notice length.</li>
                    <li>Missing evidence for grounds.</li>
                    <li>Applying to court instead of Tribunal.</li>
                  </ul>
                  <Link
                    href="/tenancy-agreements/scotland"
                    className="text-primary text-sm font-medium hover:underline inline-flex mt-3"
                  >
                    Review Scotland PRT rules →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-br from-blue-700 to-blue-600 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">Need Help with Scotland Eviction?</h2>
              <p className="text-xl text-blue-100 mb-8">
                Our document packs include Scotland-specific Notice to Leave and guidance for
                the First-tier Tribunal process.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/products/notice-only"
                  className="inline-flex items-center justify-center gap-2 bg-white text-blue-700 font-semibold py-4 px-8 rounded-xl hover:bg-blue-50 transition-colors"
                >
                  Get Scotland Notice — £49.99
                </Link>
                <Link
                  href="/products/complete-pack"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold py-4 px-8 rounded-xl transition-colors border border-white/30"
                >
                  Complete Pack — £199.99
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Ask Heaven Section */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <AskHeavenWidget
                variant="banner"
                source="page_cta"
                topic="eviction"
                jurisdiction="scotland"
                title="Not sure which eviction ground applies?"
                description="Ask Heaven can help you understand the 18 Scottish eviction grounds, Notice to Leave requirements, and First-tier Tribunal process."
                utm_campaign="scotland-eviction-notices"
              />
            </div>
          </div>
        </section>

        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <NextLegalSteps
                jurisdictionLabel="Scotland eviction notices"
                scenarioLabel="Notice to Leave + Tribunal process"
                primaryCTA={{
                  label: 'Generate Notice to Leave — £49.99',
                  href: productLinks.noticeOnly.href,
                }}
                secondaryCTA={{
                  label: 'Complete eviction pack — £199.99',
                  href: productLinks.completePack.href,
                }}
                relatedLinks={[
                  {
                    href: askHeavenLink.href,
                    title: 'Ask Heaven',
                    description: 'Free Q&A for landlord questions.',
                  },
                  {
                    href: '/tenancy-agreements/scotland',
                    title: 'Scotland PRT agreements',
                    description: 'Create compliant private residential tenancy agreements.',
                  },
                  {
                    href: '/blog/scotland-eviction-process',
                    title: 'Scotland eviction process',
                    description: 'Tribunal steps from Notice to Leave to enforcement.',
                  },
                  {
                    href: '/money-claim-unpaid-rent',
                    title: 'Unpaid rent claim guide',
                    description: 'Recover arrears via Scottish Simple Procedure.',
                  },
                ]}
              />
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <FAQSection
          title="Frequently Asked Questions"
          faqs={faqs}
          showContactCTA={false}
          variant="white"
        />
      </main>
    </>
  );
}
