import type { Metadata } from 'next';
import Link from 'next/link';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { Container } from '@/components/ui/Container';
import { getCanonicalUrl } from '@/lib/seo';
import {
  StructuredData,
  breadcrumbSchema,
  faqPageSchema,
  pricingItemListSchema,
} from '@/lib/seo/structured-data';

const pagePath = '/compare/section-8-stage-1-vs-stage-2';
const canonicalUrl = getCanonicalUrl(pagePath);

const faqs = [
  {
    question: 'Do I need the Stage 1 Section 8 Notice Pack or the Stage 2 Court Pack?',
    answer:
      'Use Stage 1 when you have not served the Form 3A notice yet and need the solicitor-approved notice and service file. Use Stage 2 when you need the possession claim file, including N5, N119, witness statement, evidence, and hearing preparation.',
  },
  {
    question: 'Can I start with Stage 1 and upgrade later?',
    answer:
      'Yes. Many landlords start with the Form 3A notice, N215 service record, arrears schedule, service instructions, validity checklist, compliance declaration, case summary, and what-happens-next guide, then move into the court pack if the tenant does not resolve the breach or arrears.',
  },
  {
    question: 'Does Stage 2 include the notice stage?',
    answer:
      'Yes. The complete possession pack covers the notice/service stage and the court-stage paperwork in one possession file, including court readiness status, court bundle index, evidence collection checklist, court filing guide, hearing checklist, eviction case summary, and arrears engagement letter.',
  },
];

export const metadata: Metadata = {
  title: 'Section 8 Notice or Court Pack? Stage 1 vs Stage 2',
  description:
    'Compare Section 8 Stage 1 notice and Stage 2 court packs. See when to use Form 3A, N5, N119, and possession claim documents.',
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'Section 8 Stage 1 vs Stage 2',
    description:
      'Decide whether you need the Section 8 notice pack or the complete possession court pack.',
    url: canonicalUrl,
    type: 'website',
  },
  robots: { index: true, follow: true },
};

export default function Section8StageComparisonPage() {
  return (
    <main className="min-h-screen bg-[#FCFBF8]">
      <HeaderConfig mode="autoOnScroll" />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: getCanonicalUrl('/') },
          { name: 'Compare Section 8 Packs', url: canonicalUrl },
        ])}
      />
      <StructuredData data={faqPageSchema(faqs)} />
      <StructuredData
        data={pricingItemListSchema([
          {
            sku: 'notice_only',
            url: '/products/notice-only',
            description: 'Solicitor-approved Section 8 notice and service file with Form 3A, N215 certificate, arrears schedule, service instructions, validity checklist, compliance declaration, case summary, and what-happens-next guide.',
          },
          {
            sku: 'complete_pack',
            url: '/products/complete-pack',
            description: 'Solicitor-approved Section 8 court and possession file with Stage 1 plus N5, N119, witness statement, evidence support, filing guide, and hearing preparation.',
          },
        ])}
      />

      <UniversalHero
        badge="Compare"
        title="Section 8 Stage 1 vs Stage 2"
        subtitle="Stage 1 = serve correctly with the notice and service file. Stage 2 = serve, issue, evidence, and prepare for hearing with the full court and possession file."
        primaryCta={{ label: 'Buy Stage 1 Notice Pack', href: '/products/notice-only' }}
        secondaryCta={{ label: 'Buy Stage 2 Court Pack', href: '/products/complete-pack' }}
        mediaSrc="/images/wizard-icons/18-forms-bundle.png"
        mediaAlt="Section 8 possession pack documents"
        showReviewPill
        showTrustPositioningBar
      />

      <Container className="py-12 md:py-16">
        <section className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7C3AED]">
              Decision guide
            </p>
            <h2 className="mt-3 text-3xl font-bold text-[#141B2D]">
              Pick the pack based on where the case actually is
            </h2>
            <div className="mt-6 overflow-hidden rounded-lg border border-[#E8E1D7] bg-white">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#F7F2FF] text-[#2A2161]">
                  <tr>
                    <th className="p-4">Situation</th>
                    <th className="p-4">Best fit</th>
                    <th className="p-4">Why</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E1D7] text-[#546075]">
                  <tr>
                    <td className="p-4">You have not served the notice yet</td>
                    <td className="p-4 font-semibold text-[#141B2D]">Stage 1 Notice Pack</td>
                    <td className="p-4">Creates the Form 3A, N215, arrears schedule, service instructions, validity checklist, compliance declaration, case summary, and what-happens-next guide.</td>
                  </tr>
                  <tr>
                    <td className="p-4">The tenant has not left after notice</td>
                    <td className="p-4 font-semibold text-[#141B2D]">Stage 2 Court Pack</td>
                    <td className="p-4">Adds N5, N119, witness statement, court readiness status, evidence collection checklist, filing guide, and hearing material.</td>
                  </tr>
                  <tr>
                    <td className="p-4">You want one court-ready possession file</td>
                    <td className="p-4 font-semibold text-[#141B2D]">Stage 2 Court Pack</td>
                    <td className="p-4">Keeps the notice, N5, N119, witness statement, court bundle index, eviction case summary, and arrears engagement letter together.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <aside className="rounded-lg border border-[#E8E1D7] bg-white p-6">
            <h2 className="text-2xl font-bold text-[#141B2D]">Quick route</h2>
            <div className="mt-5 space-y-4">
              <Link href="/products/notice-only" className="block rounded-lg border border-[#E8E1D7] p-4 hover:border-[#7C3AED]">
                <span className="block font-semibold text-[#141B2D]">I need to serve Form 3A</span>
                <span className="mt-1 block text-sm text-[#546075]">Start with Stage 1: serve correctly.</span>
              </Link>
              <Link href="/products/complete-pack" className="block rounded-lg border border-[#E8E1D7] p-4 hover:border-[#7C3AED]">
                <span className="block font-semibold text-[#141B2D]">I need to file at court</span>
                <span className="mt-1 block text-sm text-[#546075]">Use Stage 2: serve, issue, evidence, and prepare for hearing.</span>
              </Link>
            </div>
          </aside>
        </section>

        <section className="mt-12 rounded-lg border border-[#E8E1D7] bg-white p-6">
          <h2 className="text-2xl font-bold text-[#141B2D]">FAQs</h2>
          <div className="mt-5 grid gap-5 md:grid-cols-3">
            {faqs.map((faq) => (
              <div key={faq.question}>
                <h3 className="font-semibold text-[#141B2D]">{faq.question}</h3>
                <p className="mt-2 text-sm leading-6 text-[#546075]">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </Container>
    </main>
  );
}
