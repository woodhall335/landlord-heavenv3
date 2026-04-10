import type { Metadata } from 'next';
import Link from 'next/link';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { Container } from '@/components/ui/Container';
import { FAQSection } from '@/components/seo/FAQSection';
import { StructuredData, breadcrumbSchema, productSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';
import { SECTION13_DEFENCE_PAGE } from '@/lib/marketing/section13-products';
import { PRODUCTS } from '@/lib/pricing/products';

const config = SECTION13_DEFENCE_PAGE;
const canonicalUrl = getCanonicalUrl('/products/section-13-defence');
const product = PRODUCTS[config.productSku];

export const metadata: Metadata = {
  title: config.title,
  description: config.description,
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: config.title,
    description: config.description,
    url: canonicalUrl,
  },
};

export default function Section13DefenceProductPage() {
  return (
    <div className="min-h-screen bg-[#fcfaff]">
      <HeaderConfig mode="autoOnScroll" />
      <StructuredData
        data={productSchema({
          name: product.label,
          description: config.description,
          price: product.price.toString(),
          url: canonicalUrl,
        })}
      />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          { name: 'Pricing', url: 'https://landlordheaven.co.uk/pricing' },
          { name: 'Section 13 Defence Pack', url: canonicalUrl },
        ])}
      />

      <UniversalHero
        title={config.heroTitle}
        subtitle={config.heroSubtitle}
        primaryCta={{ label: config.ctaLabel, href: product.wizardHref }}
        secondaryCta={{ label: 'Read the challenge guide', href: '/rent-increase/rent-increase-challenge' }}
        mediaSrc="/images/wizard-icons/41-rent.png"
        mediaAlt="Section 13 defence documents"
        showReviewPill
        showTrustPositioningBar
        trustPositioningPreset="section13"
      >
        <ul className="mt-6 space-y-2 text-sm text-white/90 md:text-base">
          {config.bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      </UniversalHero>

      <section className="border-b border-[#E6DBFF] bg-white py-12">
        <Container>
          <div className="mx-auto max-w-5xl rounded-3xl border border-[#E6DBFF] bg-[#fbf8ff] p-6 md:p-8">
            <h2 className="text-3xl font-bold text-[#2a2161]">Who this pack is for</h2>
            <ul className="mt-5 grid gap-3 text-gray-700 md:grid-cols-2">
              {config.whoItsFor.map((item) => (
                <li key={item} className="rounded-2xl border border-[#E6DBFF] bg-white px-4 py-3">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      <section className="bg-white py-12">
        <Container>
          <div className="mx-auto max-w-5xl space-y-8">
            <article className="rounded-3xl border border-[#E6DBFF] bg-white p-6 md:p-8">
              <h2 className="text-3xl font-bold text-[#2a2161]">What you get</h2>
              <p className="mt-4 text-gray-700 leading-8">
                This pack is built for the landlord who needs the whole file to hold together under pressure. The notice still matters, but the bigger job is making sure the evidence, explanation, and response materials all read like one joined-up case.
              </p>
              <ul className="mt-5 space-y-3 text-gray-700">
                {config.included.map((item) => (
                  <li key={item} className="rounded-2xl border border-[#E6DBFF] bg-[#fcfaff] px-4 py-3">
                    {item}
                  </li>
                ))}
              </ul>
            </article>

            {config.sections.map((section) => (
              <article key={section.title} className="rounded-3xl border border-[#E6DBFF] bg-white p-6 md:p-8">
                <h2 className="text-3xl font-bold text-[#2a2161]">{section.title}</h2>
                <div className="mt-4 space-y-4 text-gray-700 leading-8">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </article>
            ))}

            <article className="rounded-3xl border border-[#E6DBFF] bg-[#f7f2ff] p-6 md:p-8">
              <h2 className="text-3xl font-bold text-[#2a2161]">Need the lighter route instead?</h2>
              <p className="mt-4 text-gray-700 leading-8">
                If the increase looks straightforward and you mainly need to serve a clean notice with a clear report, the Standard Pack may be enough. The Defence Pack is there for the cases where you know challenge risk is part of the picture.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link href="/products/section-13-standard" className="hero-btn-secondary text-center">
                  View the Standard Pack
                </Link>
                <Link href={product.wizardHref} className="hero-btn-primary text-center">
                  {config.ctaLabel}
                </Link>
              </div>
            </article>
          </div>
        </Container>
      </section>

      <FAQSection title="Section 13 Defence FAQs" faqs={config.faqs} showContactCTA={false} variant="gray" />
    </div>
  );
}
