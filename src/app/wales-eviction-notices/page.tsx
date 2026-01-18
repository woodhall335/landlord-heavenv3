import type { Metadata } from 'next';
import Link from 'next/link';
import { getCanonicalUrl } from '@/lib/seo/urls';
import { StructuredData, faqPageSchema, breadcrumbSchema } from '@/lib/seo/structured-data';
import {
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Scale,
  Info,
  Home,
} from 'lucide-react';
import { FAQSection } from '@/components/marketing/FAQSection';

export const metadata: Metadata = {
  title: 'Eviction Notices in Wales - Renting Homes (Wales) Act Guide',
  description:
    'Complete guide to evicting tenants in Wales under the Renting Homes (Wales) Act 2016. Occupation contracts, notice periods, possession claims. Wales-specific landlord guide.',
  keywords: [
    'eviction notice wales',
    'renting homes wales act',
    'wales landlord eviction',
    'occupation contract wales',
    'wales possession notice',
    'evict tenant wales',
    'landlord wales',
    'contract holder wales',
  ],
  openGraph: {
    title: 'Eviction Notices in Wales - Renting Homes Act Guide',
    description:
      'How to legally evict a tenant in Wales under the Renting Homes (Wales) Act 2016. Occupation contracts and possession procedures.',
    type: 'article',
    url: getCanonicalUrl('/wales-eviction-notices'),
  },
  alternates: {
    canonical: getCanonicalUrl('/wales-eviction-notices'),
  },
};

const faqs = [
  {
    question: 'Does Section 21 apply in Wales?',
    answer:
      'No. Section 21 notices do not apply in Wales. Since December 2022, Wales uses the Renting Homes (Wales) Act 2016, which has its own notice types and procedures. The equivalent "no-fault" eviction has been effectively abolished in Wales.',
  },
  {
    question: 'What is an occupation contract in Wales?',
    answer:
      'An occupation contract is the Welsh equivalent of a tenancy agreement. Under the Renting Homes (Wales) Act 2016, rental agreements are called "occupation contracts" and tenants are called "contract holders". There are two main types: standard contracts (private landlords) and secure contracts (social housing).',
  },
  {
    question: 'How much notice do I need to give to evict a tenant in Wales?',
    answer:
      'For standard occupation contracts in Wales, landlords typically need to give 6 months notice for possession claims without specific grounds. Shorter notice periods may apply for serious rent arrears or breach of contract - check current Welsh Government guidance for exact requirements.',
  },
  {
    question: 'Can I evict for rent arrears in Wales?',
    answer:
      'Yes. The Renting Homes (Wales) Act includes provisions for possession where the contract holder has serious rent arrears. Specific grounds and notice periods apply - these differ from the English Section 8 system. Consult current Welsh legislation or seek legal advice.',
  },
  {
    question: 'What court handles evictions in Wales?',
    answer:
      'Eviction cases in Wales are handled by the county court, similar to England. However, the grounds, notices, and procedures follow Welsh law under the Renting Homes (Wales) Act 2016, not the Housing Act 1988.',
  },
  {
    question: 'Do I need to protect deposits in Wales?',
    answer:
      'Yes. Landlords in Wales must protect deposits in a government-approved scheme within 30 days. The deposit protection rules are similar to England. Failure to protect the deposit can affect your ability to gain possession.',
  },
  {
    question: 'Can I use English eviction notice templates in Wales?',
    answer:
      'No. Section 21 and Section 8 notices are specific to England. Wales has its own notice requirements under the Renting Homes (Wales) Act. Using incorrect notices will invalidate your possession claim.',
  },
  {
    question: 'What is a "contract holder" in Wales?',
    answer:
      'A contract holder is the Welsh term for a tenant under the Renting Homes (Wales) Act 2016. The person who signs the occupation contract and has the right to live in the property is called the contract holder.',
  },
];

export default function WalesEvictionNoticesPage() {
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Eviction Notices in Wales - Renting Homes (Wales) Act Guide',
    description:
      'Complete guide to evicting tenants in Wales under the Renting Homes (Wales) Act 2016, including notice types, possession claims, and rent arrears routes.',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': getCanonicalUrl('/wales-eviction-notices'),
    },
    author: {
      '@type': 'Organization',
      name: 'Landlord Heaven',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Landlord Heaven',
      logo: {
        '@type': 'ImageObject',
        url: 'https://landlordheaven.co.uk/og-image.png',
      },
    },
  };

  return (
    <>
      <StructuredData data={articleSchema} />
      <StructuredData data={faqPageSchema(faqs)} />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          { name: 'How to Evict a Tenant', url: 'https://landlordheaven.co.uk/how-to-evict-tenant' },
          { name: 'Wales Eviction Notices', url: 'https://landlordheaven.co.uk/wales-eviction-notices' },
        ])}
      />

      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-red-900 to-red-800 text-white py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex items-center justify-center gap-2 mb-6">
                <span className="text-5xl">🏴󠁧󠁢󠁷󠁬󠁳󠁿</span>
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                Eviction Notices in Wales
              </h1>

              <p className="text-xl text-red-100 mb-8 max-w-2xl mx-auto">
                Complete guide to the <strong>Renting Homes (Wales) Act 2016</strong>. How to
                legally evict contract holders using Wales-specific notices and procedures.
              </p>

              {/* Important Notice */}
              <div className="bg-red-950/50 border border-red-700 rounded-lg p-4 mb-8 text-left max-w-2xl mx-auto">
                <p className="text-sm text-red-100 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
                  <span>
                    <strong>Important:</strong> Section 21 and Section 8 notices do NOT apply
                    in Wales. This page covers the Welsh-specific eviction process under the
                    Renting Homes (Wales) Act 2016.
                  </span>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/products/notice-only"
                  className="inline-flex items-center justify-center gap-2 bg-white text-red-800 font-semibold py-4 px-8 rounded-xl hover:bg-red-50 transition-colors"
                >
                  Get Wales Notice — £39.99
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/tenancy-agreements/wales"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold py-4 px-8 rounded-xl transition-colors border border-white/20"
                >
                  Wales Occupation Contracts
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="py-6 bg-amber-50 border-b border-amber-200">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <p className="text-sm text-amber-900 flex items-start gap-2">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Not legal advice:</strong> This guide provides general information
                  about Welsh tenancy law. Laws change regularly - always check the latest
                  Welsh Government guidance or consult a solicitor for your specific
                  situation.
                </span>
              </p>
            </div>
          </div>
        </section>

        {/* Key Differences Section */}
        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                Wales vs England: Key Differences
              </h2>

              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold text-gray-900">
                        Aspect
                      </th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-900">
                        🏴󠁧󠁢󠁷󠁬󠁳󠁿 Wales
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
                        Renting Homes (Wales) Act 2016
                      </td>
                      <td className="px-6 py-4 text-gray-600">Housing Act 1988</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">Agreement type</td>
                      <td className="px-6 py-4 text-gray-600">Occupation contract</td>
                      <td className="px-6 py-4 text-gray-600">
                        Assured Shorthold Tenancy (AST)
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-medium text-gray-900">Tenant term</td>
                      <td className="px-6 py-4 text-gray-600">Contract holder</td>
                      <td className="px-6 py-4 text-gray-600">Tenant</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">No-fault eviction</td>
                      <td className="px-6 py-4 text-red-600 font-medium">
                        Abolished (Dec 2022)
                      </td>
                      <td className="px-6 py-4 text-amber-600 font-medium">
                        Ends May 2026
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-medium text-gray-900">Section 21</td>
                      <td className="px-6 py-4 text-red-600 font-medium">Does NOT apply</td>
                      <td className="px-6 py-4 text-gray-600">
                        Until May 2026
                      </td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">Section 8</td>
                      <td className="px-6 py-4 text-red-600 font-medium">Does NOT apply</td>
                      <td className="px-6 py-4 text-gray-600">Yes (grounds-based)</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        Standard notice period
                      </td>
                      <td className="px-6 py-4 text-gray-600">Generally 6 months</td>
                      <td className="px-6 py-4 text-gray-600">2 months (Section 21)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* Occupation Contracts Section */}
        <section className="py-12 lg:py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Understanding Occupation Contracts
              </h2>

              <div className="prose prose-lg max-w-none mb-8">
                <p>
                  Under the Renting Homes (Wales) Act 2016, all private rental agreements in
                  Wales are called <strong>occupation contracts</strong>. There are two main
                  types:
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-red-50 rounded-xl p-6 border border-red-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                      <Home className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Standard Contract</h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Used by private landlords and housing associations for most rentals.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      Most common contract type
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      Fixed-term or periodic
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      Landlord possession rights apply
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center">
                      <Scale className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Secure Contract</h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Used by local authorities (council housing). Greater tenant security.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      Council and social housing
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      Stronger tenant protections
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      Limited landlord possession grounds
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Eviction Process Section */}
        <section className="py-12 lg:py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                Wales Eviction Process Overview
              </h2>

              <div className="space-y-6">
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-red-600 font-bold">1</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        Check Your Grounds
                      </h3>
                      <p className="text-gray-600">
                        The Renting Homes (Wales) Act requires landlords to have valid grounds
                        for possession. Common grounds include serious rent arrears, breach of
                        contract, or landlord needs to sell/occupy. Check current Welsh
                        Government guidance for the full list of grounds.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-red-600 font-bold">2</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        Serve the Correct Notice
                      </h3>
                      <p className="text-gray-600">
                        Serve the appropriate possession notice under Welsh law. Notice periods
                        vary depending on the ground - typically 6 months for standard
                        possession, but shorter periods may apply for serious rent arrears or
                        breach. Use Wales-specific notice forms.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-red-600 font-bold">3</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        Wait for Notice Period
                      </h3>
                      <p className="text-gray-600">
                        Allow the full notice period to expire. The contract holder may leave
                        voluntarily during this time. Keep records of all communications.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-red-600 font-bold">4</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        Apply to County Court
                      </h3>
                      <p className="text-gray-600">
                        If the contract holder does not leave after the notice period, apply
                        to the county court for a possession order. You will need to complete
                        the appropriate court forms and pay the court fee.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-red-600 font-bold">5</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        Attend Court Hearing
                      </h3>
                      <p className="text-gray-600">
                        Attend the possession hearing with evidence supporting your claim.
                        If successful, the court will issue a possession order giving the
                        contract holder a date to leave.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-red-600 font-bold">6</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        Bailiff Enforcement (if needed)
                      </h3>
                      <p className="text-gray-600">
                        If the contract holder still does not leave, apply for a warrant of
                        possession. Only court bailiffs can legally remove occupants. Never
                        attempt to remove contract holders yourself.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Notice Periods */}
        <section className="py-12 lg:py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Notice Periods in Wales
              </h2>

              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-8 rounded-r-lg">
                <p className="text-amber-900 text-sm">
                  <strong>Note:</strong> Notice periods under Welsh law can change. Always
                  check the latest Welsh Government guidance or Shelter Cymru for current
                  requirements.
                </p>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead className="bg-red-50 border-b">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold text-gray-900">
                        Ground/Reason
                      </th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-900">
                        Typical Notice Period
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        Standard possession (no specific ground)
                      </td>
                      <td className="px-6 py-4 text-gray-600">6 months</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        Serious rent arrears
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        Shorter period may apply (check current guidance)
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        Breach of contract
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        Depends on breach type (check current guidance)
                      </td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        Antisocial behaviour
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        May be expedited (check current guidance)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-br from-red-700 to-red-600 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">Need Help with Wales Eviction?</h2>
              <p className="text-xl text-red-100 mb-8">
                Our document packs include Wales-specific notices and guidance under the
                Renting Homes (Wales) Act.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/products/notice-only"
                  className="inline-flex items-center justify-center gap-2 bg-white text-red-700 font-semibold py-4 px-8 rounded-xl hover:bg-red-50 transition-colors"
                >
                  Get Wales Notice — £39.99
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

        {/* FAQ Section */}
        <FAQSection
          title="Frequently Asked Questions"
          faqs={faqs}
          showContactCTA={false}
          variant="white"
        />

        {/* Related Links */}
        <section className="py-12 bg-gray-100 border-t">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Related Pages</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link
                  href="/how-to-evict-tenant"
                  className="bg-white p-4 rounded-lg border border-gray-200 hover:border-red-500 hover:shadow-sm transition-all"
                >
                  <span className="font-medium text-gray-900">UK Eviction Guide</span>
                  <p className="text-sm text-gray-500">All jurisdictions</p>
                </Link>
                <Link
                  href="/tenancy-agreements/wales"
                  className="bg-white p-4 rounded-lg border border-gray-200 hover:border-red-500 hover:shadow-sm transition-all"
                >
                  <span className="font-medium text-gray-900">Wales Occupation Contracts</span>
                  <p className="text-sm text-gray-500">Create compliant contracts</p>
                </Link>
                <Link
                  href="/scotland-eviction-notices"
                  className="bg-white p-4 rounded-lg border border-gray-200 hover:border-red-500 hover:shadow-sm transition-all"
                >
                  <span className="font-medium text-gray-900">Scotland Eviction</span>
                  <p className="text-sm text-gray-500">Notice to Leave</p>
                </Link>
                <Link
                  href="/section-21-notice-template"
                  className="bg-white p-4 rounded-lg border border-gray-200 hover:border-red-500 hover:shadow-sm transition-all"
                >
                  <span className="font-medium text-gray-900">Section 21 Template</span>
                  <p className="text-sm text-gray-500">England only</p>
                </Link>
                <Link
                  href="/money-claim-unpaid-rent"
                  className="bg-white p-4 rounded-lg border border-gray-200 hover:border-red-500 hover:shadow-sm transition-all"
                >
                  <span className="font-medium text-gray-900">Money Claim Guide</span>
                  <p className="text-sm text-gray-500">Recover unpaid rent</p>
                </Link>
                <Link
                  href="/rent-arrears-letter-template"
                  className="bg-white p-4 rounded-lg border border-gray-200 hover:border-red-500 hover:shadow-sm transition-all"
                >
                  <span className="font-medium text-gray-900">Rent Arrears Letter</span>
                  <p className="text-sm text-gray-500">Pre-action letter</p>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
