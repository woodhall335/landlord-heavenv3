import { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/ui';
import { Section21Countdown } from '@/components/ui/Section21Countdown';
import { AlertTriangle, Calendar, Scale, CheckCircle } from 'lucide-react';
import { StructuredData, faqPageSchema, breadcrumbSchema, articleSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';
import { landingPageLinks, productLinks, blogLinks } from '@/lib/seo/internal-links';
import { NextLegalSteps } from '@/components/seo/NextLegalSteps';

export const metadata: Metadata = {
  title: 'Section 21 Ban 2026 - Act Before May',
  description: 'Section 21 no-fault evictions end 1 May 2026. Generate your court-ready notice before the deadline. Only days left to act.',
  openGraph: {
    title: 'Section 21 Ends 1 May 2026 - Act Now',
    description: 'Last chance to serve no-fault eviction notices. Generate court-ready documents before the ban.',
    url: getCanonicalUrl('/section-21-ban'),
  },
  alternates: {
    canonical: getCanonicalUrl('/section-21-ban'),
  },
};

// FAQ data for structured data
const faqs = [
  {
    question: "Can I serve Section 21 after 1 May 2026?",
    answer: "No. From 1 May 2026, Section 21 notices become illegal. You will only be able to evict tenants using Section 8, which requires proving specific grounds."
  },
  {
    question: "What if I've already served a Section 21 notice?",
    answer: "If you served your notice before 1 May 2026, you must start court proceedings by 31 July 2026 at the latest. After that date, you cannot use Section 21."
  },
  {
    question: "What is Section 8?",
    answer: "Section 8 is a grounds-based eviction. You must prove one of the legal grounds for possession, such as rent arrears, anti-social behaviour, or needing the property for yourself. It requires a court hearing."
  },
  {
    question: "Do you help with Section 8 evictions too?",
    answer: "Yes! Our Complete Eviction Pack includes Section 8 notices and all court forms. It's designed for the post-ban world where Section 8 will be your only option."
  },
  {
    question: "How long does Section 21 take?",
    answer: "A Section 21 notice gives tenants 2 months to leave. If they don't leave voluntarily, you can apply for a possession order, which typically takes another 4-8 weeks through the courts."
  }
];

export default function Section21BanPage() {
  const breadcrumbItems = [
    { name: 'Home', url: 'https://landlordheaven.co.uk' },
    { name: 'Section 21 Ban', url: 'https://landlordheaven.co.uk/section-21-ban' },
  ];

  return (
    <main>
      {/* Structured Data for SEO */}
      <StructuredData
        data={articleSchema({
          headline: 'Section 21 Ban 2026 - Landlord Deadline',
          description:
            'Landlord guidance on the Section 21 ban deadline, key dates, and next legal steps.',
          url: getCanonicalUrl('/section-21-ban'),
          datePublished: '2026-01-01',
          dateModified: '2026-01-01',
        })}
      />
      <StructuredData data={faqPageSchema(faqs)} />
      <StructuredData data={breadcrumbSchema(breadcrumbItems)} />
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary/80 text-white py-16 sm:py-24">
        <Container>
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 mb-6">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">Urgent: Landlord Action Required</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Section 21 Ends 1 May 2026
            </h1>

            <p className="text-xl sm:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
              Your last chance to serve no-fault eviction notices
            </p>

            <div className="mb-10">
              <Section21Countdown variant="large" className="[&_*]:text-white" />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/products/notice-only"
                className="bg-white text-primary hover:bg-gray-100 font-semibold py-4 px-8 rounded-lg transition-colors text-lg"
              >
                Generate Section 21 Notice — £39.99
              </Link>
              <Link
                href="/products/complete-pack"
                className="bg-white/10 hover:bg-white/20 text-white font-semibold py-4 px-8 rounded-lg transition-colors text-lg border border-white/30"
              >
                Complete Eviction Pack — £149.99
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Key Dates Section */}
      <section className="py-16 bg-gray-50">
        <Container>
          <h2 className="text-3xl font-bold text-center mb-12">Key Dates You Need to Know</h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-xl shadow-sm text-center">
              <Calendar className="w-10 h-10 text-primary mx-auto mb-4" />
              <div className="text-2xl font-bold text-gray-900 mb-2">30 April 2026</div>
              <p className="text-gray-600">Last day to serve Section 21 notices</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm text-center border-2 border-primary">
              <AlertTriangle className="w-10 h-10 text-primary mx-auto mb-4" />
              <div className="text-2xl font-bold text-primary mb-2">1 May 2026</div>
              <p className="text-gray-600">Section 21 ban takes effect</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm text-center">
              <Scale className="w-10 h-10 text-primary mx-auto mb-4" />
              <div className="text-2xl font-bold text-gray-900 mb-2">31 July 2026</div>
              <p className="text-gray-600">Last day for court proceedings on pre-ban notices</p>
            </div>
          </div>
        </Container>
      </section>

      {/* What Is Section 21 */}
      <section className="py-16">
        <Container>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">What Is Section 21?</h2>
            <p className="text-gray-600 text-lg mb-4">
              Section 21 of the Housing Act 1988 allows landlords in England to evict tenants
              without giving a reason — known as a &quot;no-fault&quot; eviction. You simply need to
              give 2 months&apos; notice using the correct Form 6A.
            </p>
            <p className="text-gray-600 text-lg">
              It&apos;s been the fastest, simplest way for landlords to regain possession of their
              property. But that&apos;s about to change forever.
            </p>
          </div>
        </Container>
      </section>

      {/* What's Changing */}
      <section className="py-16 bg-gray-50">
        <Container>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">What&apos;s Changing?</h2>
            <p className="text-gray-600 text-lg mb-6">
              The Renters&apos; Rights Act 2025 abolishes Section 21 completely. From 1 May 2026:
            </p>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="text-red-500 mt-1 text-xl">✗</span>
                <span className="text-gray-600 text-lg">No more no-fault evictions</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-500 mt-1 text-xl">✗</span>
                <span className="text-gray-600 text-lg">All evictions require Section 8 with proven grounds</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-500 mt-1 text-xl">✗</span>
                <span className="text-gray-600 text-lg">Court hearing required for every eviction</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-500 mt-1 text-xl">✗</span>
                <span className="text-gray-600 text-lg">Longer notice periods (2-4 months)</span>
              </li>
            </ul>
          </div>
        </Container>
      </section>

      {/* Comparison Table */}
      <section className="py-16">
        <Container>
          <h2 className="text-3xl font-bold text-center mb-12">Section 21 vs Section 8</h2>

          <div className="max-w-4xl mx-auto overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-4 text-left font-semibold">Factor</th>
                  <th className="p-4 text-left font-semibold text-primary">Section 21 (Until May)</th>
                  <th className="p-4 text-left font-semibold">Section 8 (After Ban)</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="p-4 font-medium">Grounds needed</td>
                  <td className="p-4 text-primary">No — no reason required</td>
                  <td className="p-4">Yes — must prove grounds</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="p-4 font-medium">Notice period</td>
                  <td className="p-4 text-primary">2 months</td>
                  <td className="p-4">2-4 months (depending on ground)</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium">Court hearing</td>
                  <td className="p-4 text-primary">Often avoided</td>
                  <td className="p-4">Always required</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="p-4 font-medium">Complexity</td>
                  <td className="p-4 text-primary">Simple</td>
                  <td className="p-4">Complex — evidence required</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium">Cost with us</td>
                  <td className="p-4 text-primary font-semibold">From £39.99</td>
                  <td className="p-4">From £149.99</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Container>
      </section>

      {/* Why Act Now */}
      <section className="py-16 bg-gray-50">
        <Container>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">Why You Should Act Now</h2>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <div className="font-semibold text-gray-900">Simpler process</div>
                  <p className="text-gray-600">No need to prove grounds or attend court hearings</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <div className="font-semibold text-gray-900">Shorter notice period</div>
                  <p className="text-gray-600">Just 2 months vs up to 4 months with Section 8</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <div className="font-semibold text-gray-900">Lower costs</div>
                  <p className="text-gray-600">Section 21 notices from £39.99 vs £149.99+ for Section 8</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <div className="font-semibold text-gray-900">Clear legal outcome</div>
                  <p className="text-gray-600">Valid Section 21 leads to mandatory possession order</p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-white">
        <Container>
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Don&apos;t Wait Until It&apos;s Too Late</h2>
            <p className="text-xl text-white/90 mb-8">Serve your Section 21 notice while you still can</p>

            <div className="mb-10">
              <Section21Countdown variant="large" className="[&_*]:text-white" />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/products/notice-only"
                className="bg-white text-primary hover:bg-gray-100 font-semibold py-4 px-8 rounded-lg transition-colors text-lg"
              >
                Serve Your Notice Now — £39.99
              </Link>
              <Link
                href="/products/complete-pack"
                className="bg-white/10 hover:bg-white/20 text-white font-semibold py-4 px-8 rounded-lg transition-colors text-lg border border-white/30"
              >
                Complete Eviction Pack — £149.99
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <Container>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">Frequently Asked Questions</h2>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">
                  Can I serve Section 21 after 1 May 2026?
                </h3>
                <p className="text-gray-600">
                  No. From 1 May 2026, Section 21 notices become illegal. You will only be able
                  to evict tenants using Section 8, which requires proving specific grounds.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">
                  What if I&apos;ve already served a Section 21 notice?
                </h3>
                <p className="text-gray-600">
                  If you served your notice before 1 May 2026, you must start court proceedings
                  by 31 July 2026 at the latest. After that date, you cannot use Section 21.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">
                  What is Section 8?
                </h3>
                <p className="text-gray-600">
                  Section 8 is a grounds-based eviction. You must prove one of the legal grounds
                  for possession, such as rent arrears, anti-social behaviour, or needing the
                  property for yourself. It requires a court hearing.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">
                  Do you help with Section 8 evictions too?
                </h3>
                <p className="text-gray-600">
                  Yes! Our Complete Eviction Pack includes Section 8 notices and all court forms.
                  It&apos;s designed for the post-ban world where Section 8 will be your only option.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">
                  How long does Section 21 take?
                </h3>
                <p className="text-gray-600">
                  A Section 21 notice gives tenants 2 months to leave. If they don&apos;t leave
                  voluntarily, you can apply for a possession order, which typically takes
                  another 4-8 weeks through the courts.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16 bg-gray-50">
        <Container>
          <div className="max-w-5xl mx-auto">
            <NextLegalSteps
              jurisdictionLabel="England eviction deadlines"
              scenarioLabel="post-ban eviction planning"
              primaryCTA={{
                label: 'Generate Section 21 notice — £39.99',
                href: productLinks.noticeOnly.href,
              }}
              secondaryCTA={{
                label: 'Complete eviction pack — £149.99',
                href: productLinks.completePack.href,
              }}
              relatedLinks={[
                {
                  href: landingPageLinks.section21Template.href,
                  title: landingPageLinks.section21Template.title,
                  description: landingPageLinks.section21Template.description,
                },
                {
                  href: landingPageLinks.section8Template.href,
                  title: landingPageLinks.section8Template.title,
                  description: landingPageLinks.section8Template.description,
                },
                {
                  href: blogLinks.section21VsSection8.href,
                  title: blogLinks.section21VsSection8.title,
                  description: blogLinks.section21VsSection8.description,
                },
              ]}
            />
          </div>
        </Container>
      </section>
    </main>
  );
}
