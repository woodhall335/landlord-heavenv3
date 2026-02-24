import { Metadata } from 'next';
import Link from 'next/link';
import { AlertTriangle, Calendar, CheckCircle, Clock3 } from 'lucide-react';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { Container } from '@/components/ui';
import { Section21Countdown } from '@/components/ui/Section21Countdown';
import {
  StructuredData,
  faqPageSchema,
  breadcrumbSchema,
  articleSchema,
} from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';
import { landingPageLinks, productLinks, blogLinks } from '@/lib/seo/internal-links';
import { NextLegalSteps } from '@/components/seo/NextLegalSteps';
import { PRODUCTS } from '@/lib/pricing/products';

const noticePrice = PRODUCTS.notice_only.displayPrice;
const completePackPrice = PRODUCTS.complete_pack.displayPrice;

export const metadata: Metadata = {
  title: 'Section 21 Ban 2026 - Act Before May',
  description:
    'Section 21 no-fault evictions end 1 May 2026. Generate your court-ready notice before the deadline. Only days left to act.',
  openGraph: {
    title: 'Section 21 Ends 1 May 2026 - Act Now',
    description:
      'Last chance to serve no-fault eviction notices. Generate court-ready documents before the ban.',
    url: getCanonicalUrl('/section-21-ban'),
  },
  alternates: {
    canonical: getCanonicalUrl('/section-21-ban'),
  },
};

const faqs = [
  {
    question: 'Can I serve Section 21 after 1 May 2026?',
    answer:
      'No. From 1 May 2026, Section 21 notices become illegal. You will only be able to evict tenants using Section 8, which requires proving specific grounds.',
  },
  {
    question: "What if I've already served a Section 21 notice?",
    answer:
      'If you served your notice before 1 May 2026, you must start court proceedings by 31 July 2026 at the latest. After that date, you cannot use Section 21.',
  },
  {
    question: 'What is Section 8?',
    answer:
      'Section 8 is a grounds-based eviction. You must prove one of the legal grounds for possession, such as rent arrears, anti-social behaviour, or needing the property for yourself. It requires a court hearing.',
  },
  {
    question: 'Do you help with Section 8 evictions too?',
    answer:
      "Yes! Our Complete Eviction Pack includes Section 8 notices and all court forms. It's designed for the post-ban world where Section 8 will be your only option.",
  },
  {
    question: 'How long does Section 21 take?',
    answer:
      "A Section 21 notice gives tenants 2 months to leave. If they don't leave voluntarily, you can apply for a possession order, which typically takes another 4-8 weeks through the courts.",
  },
];

export default function Section21BanPage() {
  const breadcrumbItems = [
    { name: 'Home', url: 'https://landlordheaven.co.uk' },
    { name: 'Section 21 Ban', url: 'https://landlordheaven.co.uk/section-21-ban' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderConfig mode="autoOnScroll" />
      <main>
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

        <UniversalHero
          badge="Final Months Before Section 21 Ends"
          badgeIcon={<AlertTriangle className="h-4 w-4" aria-hidden="true" />}
          title="Section 21 Ends 1 May 2026"
          subtitle="After 1 May 2026, landlords lose the Section 21 route. Serve notice now while it’s still legal."
          align="center"
          hideMedia
          showTrustPositioningBar
          primaryCta={{
            label: `Start Your Section 21 Today — ${noticePrice}`,
            href: '/products/notice-only',
          }}
          secondaryCta={{
            label: `Complete Eviction Pack — ${completePackPrice}`,
            href: '/products/complete-pack',
          }}
          actionsSlot={
            <div className="w-full pt-2">
              <Section21Countdown className="mx-auto max-w-3xl" variant="large" />
            </div>
          }
        />

        <section className="bg-white py-16 md:py-20">
          <Container>
            <div className="mx-auto max-w-4xl rounded-xl border border-red-100 bg-red-50 p-8 shadow-sm md:p-10">
              <h2 className="text-3xl font-bold text-gray-900">What Happens After 1 May 2026?</h2>
              <ul className="mt-6 space-y-4 text-lg text-gray-700">
                <li className="flex items-start gap-3">
                  <AlertTriangle className="mt-1 h-5 w-5 flex-shrink-0 text-red-600" />
                  <span>Section 21 will be abolished in England</span>
                </li>
                <li className="flex items-start gap-3">
                  <AlertTriangle className="mt-1 h-5 w-5 flex-shrink-0 text-red-600" />
                  <span>No new no-fault notices can be served</span>
                </li>
                <li className="flex items-start gap-3">
                  <AlertTriangle className="mt-1 h-5 w-5 flex-shrink-0 text-red-600" />
                  <span>Existing notices may be challenged</span>
                </li>
                <li className="flex items-start gap-3">
                  <AlertTriangle className="mt-1 h-5 w-5 flex-shrink-0 text-red-600" />
                  <span>Court routes become more complex</span>
                </li>
              </ul>
              <div className="mt-8">
                <Link href="/products/notice-only" className="hero-btn-primary">
                  Serve Notice Before the Ban
                </Link>
              </div>
            </div>
          </Container>
        </section>

        <section className="py-16 md:py-20">
          <Container>
            <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">Key Dates You Need to Know</h2>

            <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
              <div className="rounded-xl bg-white p-6 text-center shadow-sm">
                <Calendar className="mx-auto mb-4 h-10 w-10 text-primary" />
                <div className="mb-2 text-2xl font-bold text-gray-900">30 April 2026</div>
                <p className="text-gray-600">Last day to serve Section 21 notices</p>
              </div>

              <div className="rounded-xl border-2 border-primary bg-white p-6 text-center shadow-sm">
                <AlertTriangle className="mx-auto mb-4 h-10 w-10 text-primary" />
                <div className="mb-2 text-2xl font-bold text-primary">1 May 2026</div>
                <p className="text-gray-600">Section 21 ban takes effect</p>
              </div>

              <div className="rounded-xl bg-white p-6 text-center shadow-sm">
                <Clock3 className="mx-auto mb-4 h-10 w-10 text-primary" />
                <div className="mb-2 text-2xl font-bold text-gray-900">31 July 2026</div>
                <p className="text-gray-600">Deadline to start court claim for existing notices</p>
              </div>
            </div>
          </Container>
        </section>

        <section className="bg-white py-16 md:py-20">
          <Container>
            <div className="mx-auto max-w-4xl">
              <h2 className="mb-6 text-3xl font-bold text-gray-900">What Is Section 21?</h2>
              <p className="mb-6 text-lg text-gray-700">
                Section 21 is the legal process that allows landlords in England to regain possession
                without giving a reason — known as a{' '}
                <Link href="/no-fault-eviction" className="text-primary hover:underline">
                  &quot;no-fault&quot; eviction
                </Link>
                . You simply need to give 2 months&apos; notice using the correct{' '}
                <Link href="/form-6a-section-21" className="text-primary hover:underline">
                  Form 6A
                </Link>
                .
              </p>
              <p className="text-lg text-gray-700">
                It&apos;s been the fastest, simplest way for landlords to regain possession of their
                property. But that route is about to close.
              </p>
            </div>
          </Container>
        </section>

        <section className="py-16 md:py-20">
          <Container>
            <div className="mx-auto max-w-4xl rounded-xl bg-white p-8 shadow-sm md:p-10">
              <h2 className="mb-6 text-3xl font-bold text-gray-900">What&apos;s Changing?</h2>
              <p className="mb-6 text-lg text-gray-700">
                The Renters&apos; Rights Act 2025 abolishes Section 21 completely. From 1 May 2026:
              </p>
              <ul className="space-y-4 text-lg text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="mt-1 text-xl text-red-500">✗</span>
                  <span>
                    No more{' '}
                    <Link href="/no-fault-eviction" className="text-primary hover:underline">
                      no-fault evictions
                    </Link>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 text-xl text-red-500">✗</span>
                  <span>All evictions require Section 8 with proven grounds</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 text-xl text-red-500">✗</span>
                  <span>Court hearing required for every eviction</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 text-xl text-red-500">✗</span>
                  <span>Longer notice periods (2-4 months)</span>
                </li>
              </ul>
            </div>
          </Container>
        </section>

        <section className="bg-white py-16 md:py-20">
          <Container>
            <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">Section 21 vs Section 8</h2>

            <div className="mx-auto max-w-5xl overflow-x-auto rounded-xl bg-white shadow-sm">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-gray-900">
                    <th className="p-4 text-left font-semibold">Factor</th>
                    <th className="p-4 text-left font-semibold text-primary">Section 21 (Until May)</th>
                    <th className="p-4 text-left font-semibold">Section 8 (After Ban)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
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
                    <td className="p-4 font-semibold text-primary">From {noticePrice}</td>
                    <td className="p-4">From {completePackPrice}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Container>
        </section>

        <section className="py-16 md:py-20">
          <Container>
            <div className="mx-auto max-w-4xl rounded-xl bg-white p-8 shadow-sm md:p-10">
              <h2 className="mb-8 text-3xl font-bold text-gray-900">Why You Should Act Now</h2>

              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <CheckCircle className="mt-1 h-6 w-6 flex-shrink-0 text-primary" />
                  <div>
                    <div className="font-semibold text-gray-900">Simpler process</div>
                    <p className="text-gray-600">No need to prove grounds or attend court hearings</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <CheckCircle className="mt-1 h-6 w-6 flex-shrink-0 text-primary" />
                  <div>
                    <div className="font-semibold text-gray-900">Shorter notice period</div>
                    <p className="text-gray-600">Just 2 months vs up to 4 months with Section 8</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <CheckCircle className="mt-1 h-6 w-6 flex-shrink-0 text-primary" />
                  <div>
                    <div className="font-semibold text-gray-900">Lower costs</div>
                    <p className="text-gray-600">
                      Section 21 notices from {noticePrice} vs {completePackPrice}+ for Section 8
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <CheckCircle className="mt-1 h-6 w-6 flex-shrink-0 text-primary" />
                  <div>
                    <div className="font-semibold text-gray-900">Clear legal outcome</div>
                    <p className="text-gray-600">Valid Section 21 leads to mandatory possession order</p>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>

        <section className="bg-white py-16 md:py-20">
          <Container>
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="mb-4 text-3xl sm:text-4xl font-bold text-gray-900">Don&apos;t Wait Until It&apos;s Too Late</h2>
              <p className="mb-8 text-xl text-gray-600">Serve your Section 21 notice while you still can</p>

              <div className="mb-10">
                <Section21Countdown className="mx-auto max-w-3xl" variant="large" />
              </div>

              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Link href="/products/notice-only" className="hero-btn-primary">
                  Start Your Section 21 Today — {noticePrice}
                </Link>
                <Link href="/products/complete-pack" className="hero-btn-secondary">
                  Complete Eviction Pack — {completePackPrice}
                </Link>
              </div>
            </div>
          </Container>
        </section>

        <section className="py-16 md:py-20">
          <Container>
            <div className="mx-auto max-w-3xl rounded-xl bg-white p-8 shadow-sm md:p-10">
              <h2 className="mb-8 text-3xl font-bold text-gray-900">Frequently Asked Questions</h2>

              <div className="space-y-6">
                {faqs.map((faq) => (
                  <div key={faq.question}>
                    <h3 className="mb-2 text-lg font-semibold text-gray-900">{faq.question}</h3>
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </section>

        <section className="bg-white py-16 md:py-20">
          <Container>
            <div className="mx-auto max-w-5xl">
              <NextLegalSteps
                jurisdictionLabel="England eviction deadlines"
                scenarioLabel="post-ban eviction planning"
                primaryCTA={{
                  label: `Generate Section 21 notice — ${noticePrice}`,
                  href: productLinks.noticeOnly.href,
                }}
                secondaryCTA={{
                  label: `Complete eviction pack — ${completePackPrice}`,
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
    </div>
  );
}
