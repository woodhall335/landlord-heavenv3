import { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { getCanonicalUrl } from '@/lib/seo';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { FAQSection } from '@/components/seo/FAQSection';
import { form3Section8FAQs } from '@/data/faqs';
import { FunnelCta, CrossSellBar } from '@/components/funnels';

export const metadata: Metadata = {
  title: 'Form 3 Section 8 Notice | Download & Guide 2026',
  description:
    'Form 3 is the prescribed Section 8 notice for England. Eviction grounds, notice periods, and how to complete it correctly.',
  keywords: [
    'form 3 section 8',
    'section 8 form 3',
    'section 8 notice form',
    'form 3 download',
    'section 8 grounds',
    'rent arrears eviction',
    'ground 8 notice',
  ],
  openGraph: {
    title: 'Form 3 Section 8 Notice | Landlord Heaven',
    description:
      'Everything you need to know about Form 3 - the official Section 8 eviction notice for England.',
    type: 'article',
    url: getCanonicalUrl('/form-3-section-8'),
  },
  alternates: {
    canonical: getCanonicalUrl('/form-3-section-8'),
  },
};

const breadcrumbs = [
  { name: 'Home', url: '/' },
  { name: 'Tools', url: '/tools' },
  { name: 'Form 3 Section 8', url: '/form-3-section-8' },
];

export default function Form3Section8Page() {
  return (
    <>
      <StructuredData data={breadcrumbSchema(breadcrumbs)} />

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-purple-50 via-purple-100 to-purple-50 pt-28 pb-16 md:pt-32 md:pb-20">
          <Container>
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-block bg-primary/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <span className="text-sm font-semibold text-primary">England Only</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
                Form 3: Section 8 Notice for England
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Form 3 is the official prescribed form for serving a Section 8 eviction notice in
                England. Use it when you have grounds for possession such as rent arrears, breach
                of tenancy, or antisocial behaviour.
              </p>
            </div>
          </Container>
        </section>

        <Container>
          <div className="-mt-8 mb-10">
            <FunnelCta
              title="Serve Form 3 correctly from the start"
              subtitle="Use Notice Only for compliant drafting/serving, or upgrade to full eviction support."
              primaryHref="/products/notice-only"
              primaryText="Start Notice Only"
              primaryDataCta="notice-only"
              location="above-fold"
              secondaryLinks={[{ href: '/products/complete-pack', text: 'Want it handled end-to-end?', dataCta: 'complete-pack' }]}
            />
          </div>
        </Container>

        {/* Quick Actions */}
        <Container>
          <div className="grid md:grid-cols-2 gap-6 -mt-8 mb-12">
            <div className="p-6 border rounded-lg bg-white shadow-sm">
              <h2 className="text-xl font-semibold mb-2">Generate Section 8 Notice</h2>
              <p className="text-gray-600 mb-4">
                Select your grounds and get a completed Form 3 with correct notice periods.
              </p>
              <Link
                href="/tools/free-section-8-notice-generator"
                className="hero-btn-primary inline-block"
              >
                Generate Free Notice
              </Link>
            </div>

            <div className="p-6 border rounded-lg bg-white shadow-sm">
              <h2 className="text-xl font-semibold mb-2">Calculate Rent Arrears</h2>
              <p className="text-gray-600 mb-4">
                Check if you have enough arrears for Ground 8 and calculate statutory interest.
              </p>
              <Link href="/tools/rent-arrears-calculator" className="hero-btn-secondary inline-block">
                Arrears Calculator
              </Link>
            </div>
          </div>
        </Container>

        {/* Main Content */}
        <Container>
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm mb-12">
              <div className="prose prose-slate max-w-none">
                <h2>What is Form 3?</h2>
                <p>
                  Form 3 is the prescribed notice form under Section 8 of the Housing Act 1988. Unlike
                  Section 21 (no-fault), Section 8 requires you to prove specific grounds for
                  possession.
                </p>
                <p>
                  You must list the grounds you&apos;re relying on and provide details supporting each
                  ground (e.g., arrears amounts, breach details).
                </p>

                <h2>Common Section 8 Grounds</h2>

                <h3>Rent Arrears Grounds</h3>
                <ul>
                  <li>
                    <strong>Ground 8 (Mandatory):</strong> At least 2 months&apos; rent arrears at both
                    notice date AND court hearing. If proven, the court must grant possession.
                  </li>
                  <li>
                    <strong>Ground 10 (Discretionary):</strong> Some rent is lawfully due and unpaid.
                    Court decides if it&apos;s reasonable to evict.
                  </li>
                  <li>
                    <strong>Ground 11 (Discretionary):</strong> Tenant has persistently delayed paying
                    rent, even if currently up to date.
                  </li>
                </ul>

                <h3>Other Common Grounds</h3>
                <ul>
                  <li>
                    <strong>Ground 12:</strong> Breach of any term of the tenancy agreement
                  </li>
                  <li>
                    <strong>Ground 13:</strong> Deterioration of property or common areas due to
                    tenant&apos;s neglect
                  </li>
                  <li>
                    <strong>Ground 14:</strong> Nuisance, annoyance, or conviction for illegal activity
                  </li>
                  <li>
                    <strong>Ground 17:</strong> Tenancy obtained by false statement
                  </li>
                </ul>

                <h2>Notice Periods</h2>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-200 p-3 text-left">Ground</th>
                        <th className="border border-gray-200 p-3 text-left">Notice Period</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-200 p-3">Ground 8, 10, 11 (Rent arrears)</td>
                        <td className="border border-gray-200 p-3">2 weeks minimum</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-200 p-3">Ground 14 (Antisocial behaviour)</td>
                        <td className="border border-gray-200 p-3">Immediate (no notice required)</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-200 p-3">Grounds 1, 2, 5, 6, 7, 9, 16</td>
                        <td className="border border-gray-200 p-3">2 months</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-200 p-3">Other grounds</td>
                        <td className="border border-gray-200 p-3">2 weeks</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="my-8">
                  <CrossSellBar context="eviction" location="mid" />
                </div>

                <h2>How to Complete Form 3</h2>
                <ol>
                  <li>Enter tenant name(s) and property address</li>
                  <li>Select the grounds for possession you&apos;re relying on</li>
                  <li>Provide particulars (details) for each ground</li>
                  <li>Calculate and enter the correct notice period</li>
                  <li>Sign and date the notice</li>
                </ol>

                <h2>Section 8 vs Section 21</h2>
                <p>
                  <strong>Section 8</strong> requires proving grounds but can be faster for serious
                  rent arrears. <strong>Section 21</strong> doesn&apos;t require grounds but takes longer.
                  Many landlords serve both together.
                </p>
                <p>
                  <Link href="/section-21-vs-section-8">
                    Compare Section 21 vs Section 8 in detail
                  </Link>
                </p>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="mb-12">
              <FAQSection
                faqs={form3Section8FAQs}
                title="Form 3 Section 8 FAQ"
                showContactCTA={false}
                variant="white"
              />
            </div>

            {/* CTA */}
            <div className="p-8 bg-purple-50 rounded-2xl text-center">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">
                Ready to Create Your Section 8 Notice?
              </h2>
              <p className="text-gray-600 mb-6">
                Generate a completed Form 3 with correct grounds and notice periods.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/tools/free-section-8-notice-generator" className="hero-btn-primary">
                  Free Generator
                </Link>
                <Link href="/products/complete-pack" className="hero-btn-secondary" data-cta="complete-pack" data-cta-location="bottom">
                  Want it handled end-to-end?
                </Link>
              </div>
            </div>
          </div>
        </Container>

        {/* Bottom padding */}
        <div className="py-12" />
      </div>
    </>
  );
}
