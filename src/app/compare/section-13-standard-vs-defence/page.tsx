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
    question: 'When is the Supported Rent Increase Pack enough?',
    answer:
      'Use the Supported pack when you expect the increase to be straightforward and need Form 4A, market evidence, and a service record.',
  },
  {
    question: 'When should I use the Tribunal-Ready Rent Increase Pack?',
    answer:
      'Use the Tribunal-Ready pack when the tenant has challenged the increase, or you already think a challenge is likely.',
  },
  {
    question: 'Can I start with Supported and move to Tribunal-Ready?',
    answer:
      'Yes. If the tenant later disputes the increase, move into the Tribunal-Ready pack for response material and tribunal bundle preparation.',
  },
];

export const metadata: Metadata = {
  title: 'Supported vs Tribunal-Ready Rent Increase Packs',
  description:
    'Compare Supported and Tribunal-Ready Section 13 rent increase packs. Decide whether you need Form 4A service documents or tribunal challenge material.',
  keywords: [
    'supported rent increase pack',
    'tribunal ready rent increase pack',
    'form 4a rent increase',
    'rent increase tribunal challenge',
  ],
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'Supported vs Tribunal-Ready Rent Increase Pack',
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
            description: 'Section 13 Form 4A rent increase pack with current market evidence and service record.',
          },
          {
            sku: 'section13_defensive',
            url: '/products/section-13-defence',
            description: 'Section 13 tribunal-ready rent increase pack with evidence templates, response materials, and bundle checklist.',
          },
        ])}
      />

      <UniversalHero
        badge="Compare"
        title="Supported vs Tribunal-Ready"
        subtitle="If you expect the increase to be straightforward, use the Supported pack. If the tenant is likely to challenge it, choose the Tribunal-Ready pack from the start."
        primaryCta={{ label: 'Prepare the rent increase notice', href: '/products/section-13-standard' }}
        secondaryCta={{ label: 'Prepare for a tenant challenge', href: '/products/section-13-defence' }}
        mediaSrc="/images/wizard-icons/18-forms-bundle.png"
        mediaAlt="Section 13 rent increase pack documents"
        showReviewPill
        showTrustPositioningBar
      />

      <Container className="py-12 md:py-16">
        <section className="rounded-lg border border-[#E8E1D7] bg-white p-6">
          <h2 className="text-3xl font-bold text-[#141B2D]">Which situation fits?</h2>
          <div className="mt-6 overflow-hidden rounded-lg border border-[#E8E1D7]">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F7F2FF] text-[#2A2161]">
                <tr>
                  <th className="p-4">Need</th>
                  <th className="p-4">Supported</th>
                  <th className="p-4">Tribunal-Ready</th>
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
              Prepare the rent increase notice
            </Link>
            <Link href="/products/section-13-defence" className="hero-btn-secondary text-center">
              Prepare for a tenant challenge
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
