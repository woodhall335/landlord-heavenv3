import { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { getCanonicalUrl } from '@/lib/seo';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { FAQSection } from '@/components/seo/FAQSection';
import { evictionNoticeUKFAQs } from '@/data/faqs';

export const metadata: Metadata = {
  title: 'Eviction Notice UK | Types, Templates & How to Serve [2026]',
  description:
    'Complete guide to eviction notices in the UK. Covers Section 21, Section 8, Scotland Notice to Leave, and Wales notices. Free templates and step-by-step instructions.',
  keywords: [
    'eviction notice UK',
    'eviction notice template UK',
    'UK eviction notice',
    'landlord eviction notice',
    'how to serve eviction notice UK',
    'section 21 notice',
    'section 8 notice',
    'notice to quit',
  ],
  openGraph: {
    title: 'Eviction Notice UK | Complete Landlord Guide',
    description:
      'Everything UK landlords need to know about eviction notices. Templates, guides and generators for all regions.',
    type: 'article',
    url: getCanonicalUrl('/eviction-notice-uk'),
  },
  alternates: {
    canonical: getCanonicalUrl('/eviction-notice-uk'),
  },
};

const breadcrumbs = [
  { name: 'Home', url: '/' },
  { name: 'Eviction Notice UK', url: '/eviction-notice-uk' },
];

export default function EvictionNoticeUKPage() {
  return (
    <>
      <StructuredData data={breadcrumbSchema(breadcrumbs)} />

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-purple-50 via-purple-100 to-purple-50 pt-28 pb-16 md:pt-32 md:pb-20">
          <Container>
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-block bg-primary/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <span className="text-sm font-semibold text-primary">UK Landlord Guide</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
                Eviction Notice UK: Complete Guide for Landlords
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Serving the correct eviction notice is the essential first step to legally regain
                possession of your property. The type of notice you need depends on your location
                and circumstances.
              </p>
            </div>
          </Container>
        </section>

        {/* Region Selector */}
        <Container>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 -mt-8 mb-12">
            <a
              href="#england"
              className="p-4 border rounded-lg bg-white hover:border-primary text-center transition-colors"
            >
              <span className="text-2xl">🏴󠁧󠁢󠁥󠁮󠁧󠁿</span>
              <p className="font-semibold mt-2">England</p>
              <p className="text-sm text-gray-500">Section 21 & Section 8</p>
            </a>

            <a
              href="#wales"
              className="p-4 border rounded-lg bg-white hover:border-primary text-center transition-colors"
            >
              <span className="text-2xl">🏴󠁧󠁢󠁷󠁬󠁳󠁿</span>
              <p className="font-semibold mt-2">Wales</p>
              <p className="text-sm text-gray-500">RHW Notices</p>
            </a>

            <a
              href="#scotland"
              className="p-4 border rounded-lg bg-white hover:border-primary text-center transition-colors"
            >
              <span className="text-2xl">🏴󠁧󠁢󠁳󠁣󠁴󠁿</span>
              <p className="font-semibold mt-2">Scotland</p>
              <p className="text-sm text-gray-500">Notice to Leave</p>
            </a>

            <a
              href="#northern-ireland"
              className="p-4 border rounded-lg bg-white hover:border-primary text-center transition-colors"
            >
              <span className="text-2xl">🇬🇧</span>
              <p className="font-semibold mt-2">N. Ireland</p>
              <p className="text-sm text-gray-500">Notice to Quit</p>
            </a>
          </div>
        </Container>

        {/* Main Content */}
        <Container>
          <div className="max-w-4xl mx-auto">
            {/* England Section */}
            <section id="england" className="mb-12 scroll-mt-24">
              <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">England: Eviction Notices</h2>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-200 mb-6">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-200 p-3 text-left">Notice Type</th>
                        <th className="border border-gray-200 p-3 text-left">When to Use</th>
                        <th className="border border-gray-200 p-3 text-left">Notice Period</th>
                        <th className="border border-gray-200 p-3 text-left">Form</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-200 p-3 font-semibold">Section 21</td>
                        <td className="border border-gray-200 p-3">
                          No-fault eviction (any reason)
                        </td>
                        <td className="border border-gray-200 p-3">2 months minimum</td>
                        <td className="border border-gray-200 p-3">
                          <Link
                            href="/form-6a-section-21"
                            className="text-primary hover:underline"
                          >
                            Form 6A
                          </Link>
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-200 p-3 font-semibold">Section 8</td>
                        <td className="border border-gray-200 p-3">
                          Fault-based (rent arrears, breach, etc.)
                        </td>
                        <td className="border border-gray-200 p-3">
                          2 weeks to 2 months (varies by ground)
                        </td>
                        <td className="border border-gray-200 p-3">
                          <Link
                            href="/form-3-section-8"
                            className="text-primary hover:underline"
                          >
                            Form 3
                          </Link>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/tools/free-section-21-notice-generator"
                    className="hero-btn-primary"
                  >
                    Section 21 Generator
                  </Link>
                  <Link
                    href="/tools/free-section-8-notice-generator"
                    className="hero-btn-secondary"
                  >
                    Section 8 Generator
                  </Link>
                </div>
              </div>
            </section>

            {/* Wales Section */}
            <section id="wales" className="mb-12 scroll-mt-24">
              <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">Wales: Eviction Notices</h2>
                <p className="text-gray-600 mb-4">
                  Wales uses different notices under the Renting Homes (Wales) Act 2016. Section 21
                  and Section 8 do NOT apply in Wales.
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-200 mb-6">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-200 p-3 text-left">Notice Type</th>
                        <th className="border border-gray-200 p-3 text-left">When to Use</th>
                        <th className="border border-gray-200 p-3 text-left">Notice Period</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-200 p-3 font-semibold">RHW16</td>
                        <td className="border border-gray-200 p-3">
                          No-fault (6+ months into contract)
                        </td>
                        <td className="border border-gray-200 p-3">6 months</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-200 p-3 font-semibold">RHW17</td>
                        <td className="border border-gray-200 p-3">
                          Landlord notice (breach grounds)
                        </td>
                        <td className="border border-gray-200 p-3">1-6 months (varies)</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-200 p-3 font-semibold">RHW23</td>
                        <td className="border border-gray-200 p-3">
                          Serious rent arrears (8+ weeks)
                        </td>
                        <td className="border border-gray-200 p-3">14 days</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm text-amber-800">
                    <strong>Note:</strong> Wales has different requirements than England. Our Wales
                    eviction notice generator is coming soon.
                  </p>
                </div>
              </div>
            </section>

            {/* Scotland Section */}
            <section id="scotland" className="mb-12 scroll-mt-24">
              <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">Scotland: Eviction Notices</h2>
                <p className="text-gray-600 mb-4">
                  Scotland uses the Notice to Leave under the Private Residential Tenancy (PRT)
                  system.
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-200 mb-6">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-200 p-3 text-left">Notice Type</th>
                        <th className="border border-gray-200 p-3 text-left">Notice Period</th>
                        <th className="border border-gray-200 p-3 text-left">Tribunal</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-200 p-3 font-semibold">Notice to Leave</td>
                        <td className="border border-gray-200 p-3">
                          28 days to 84 days (varies by ground)
                        </td>
                        <td className="border border-gray-200 p-3">First-tier Tribunal</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <Link href="/products/notice-only?jurisdiction=scotland" className="hero-btn-primary">
                  Scotland Notice Pack
                </Link>
              </div>
            </section>

            {/* Northern Ireland Section */}
            <section id="northern-ireland" className="mb-12 scroll-mt-24">
              <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  Northern Ireland: Eviction Notices
                </h2>
                <p className="text-gray-600 mb-4">
                  Northern Ireland uses Notice to Quit under the Private Tenancies (Northern Ireland)
                  Order 2006.
                </p>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Coming Soon:</strong> Northern Ireland eviction notice support is
                    planned for 2026.
                  </p>
                </div>
              </div>
            </section>

            {/* FAQ Section */}
            <div className="mb-12">
              <FAQSection
                faqs={evictionNoticeUKFAQs}
                title="UK Eviction Notice FAQ"
                showContactCTA={false}
                variant="white"
              />
            </div>

            {/* CTA */}
            <div className="p-8 bg-purple-50 rounded-2xl text-center">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">
                Need Help With Your Eviction Notice?
              </h2>
              <p className="text-gray-600 mb-6">
                Generate a legally valid notice for your region in minutes.
              </p>
              <Link href="/products/notice-only" className="hero-btn-primary">
                Get Notice Pack
              </Link>
            </div>
          </div>
        </Container>

        {/* Bottom padding */}
        <div className="py-12" />
      </div>
    </>
  );
}
