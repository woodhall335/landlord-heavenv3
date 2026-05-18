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

const pagePath = '/compare/section-13-standard-vs-defence';
const canonicalUrl = getCanonicalUrl(pagePath);

const faqs = [
  {
    question: 'When is the Section 13 Standard pack enough?',
    answer:
      'Use the Standard pack when you need to serve the official Form 4A with market evidence, a service record, and clear landlord guidance.',
  },
  {
    question: 'When should I use the Defence pack?',
    answer:
      'Use the Defence pack when the tenant has challenged or is likely to challenge the rent increase at tribunal.',
  },
  {
    question: 'Can I start with Standard and move to Defence?',
    answer:
      'Yes. If a tenant later disputes the increase, move into the Defence pack for tribunal response material and bundle preparation.',
  },
];

export const metadata: Metadata = {
  title: 'Section 13 Standard vs Defence Pack | Compare Rent Increase Routes',
  description:
    'Compare Section 13 Standard and Defence packs. Decide whether you need Form 4A service documents or tribunal challenge material.',
  keywords: [
    'section 13 standard pack',
    'section 13 defence pack',
    'form 4a rent increase',
    'rent increase tribunal challenge',
  ],
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'Section 13 Standard vs Defence Pack',
    description:
      'Choose the correct rent increase pack for a normal Form 4A service or a tenant challenge.',
    url: canonicalUrl,
    type: 'website',
  },
  robots: { index: true, follow: true },
};

export default function Section13ComparisonPage() {
  return (
    <main className="min-h-screen bg-[#FCFBF8]">
      <HeaderConfig mode="autoOnScroll" />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: getCanonicalUrl('/') },
          { name: 'Compare Section 13 Packs', url: canonicalUrl },
        ])}
      />
      <StructuredData data={faqPageSchema(faqs)} />
      <StructuredData
        data={pricingItemListSchema([
          {
            sku: 'section13_standard',
            url: '/products/section-13-standard',
            description: 'Solicitor-approved Section 13 Form 4A rent increase pack with market evidence and service record.',
          },
          {
            sku: 'section13_defensive',
            url: '/products/section-13-defence',
            description: 'Solicitor-approved Section 13 tribunal defence pack with evidence templates and bundle checklist.',
          },
        ])}
      />

      <UniversalHero
        badge="Compare"
        title="Section 13 Standard vs Defence"
        subtitle="Most unchallenged rent increases need the Standard pack. If the tenant disputes the proposed rent or tribunal risk is high, use the Defence pack."
        primaryCta={{ label: 'Buy Standard Pack', href: '/products/section-13-standard' }}
        secondaryCta={{ label: 'Buy Defence Pack', href: '/products/section-13-defence' }}
        mediaSrc="/images/wizard-icons/18-forms-bundle.png"
        mediaAlt="Section 13 rent increase pack documents"
        showReviewPill
        showTrustPositioningBar
      />

      <Container className="py-12 md:py-16">
        <section className="rounded-lg border border-[#E8E1D7] bg-white p-6">
          <h2 className="text-3xl font-bold text-[#141B2D]">Which pack fits?</h2>
          <div className="mt-6 overflow-hidden rounded-lg border border-[#E8E1D7]">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F7F2FF] text-[#2A2161]">
                <tr>
                  <th className="p-4">Need</th>
                  <th className="p-4">Standard</th>
                  <th className="p-4">Defence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E1D7] text-[#546075]">
                <tr>
                  <td className="p-4">Serve Form 4A</td>
                  <td className="p-4">Included</td>
                  <td className="p-4">Included</td>
                </tr>
                <tr>
                  <td className="p-4">Market evidence and service record</td>
                  <td className="p-4">Included</td>
                  <td className="p-4">Included</td>
                </tr>
                <tr>
                  <td className="p-4">Tenant challenge response</td>
                  <td className="p-4">Light guidance</td>
                  <td className="p-4">Detailed templates</td>
                </tr>
                <tr>
                  <td className="p-4">Tribunal bundle preparation</td>
                  <td className="p-4">Not the main purpose</td>
                  <td className="p-4">Built for this</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/products/section-13-standard" className="hero-btn-primary text-center">
              Buy Standard Pack
            </Link>
            <Link href="/products/section-13-defence" className="hero-btn-secondary text-center">
              Buy Defence Pack
            </Link>
          </div>
        </section>

        <section className="mt-12 grid gap-5 md:grid-cols-3">
          {faqs.map((faq) => (
            <article key={faq.question} className="rounded-lg border border-[#E8E1D7] bg-white p-5">
              <h3 className="font-semibold text-[#141B2D]">{faq.question}</h3>
              <p className="mt-2 text-sm leading-6 text-[#546075]">{faq.answer}</p>
            </article>
          ))}
        </section>
      </Container>
    </main>
  );
}
