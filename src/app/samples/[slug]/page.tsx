import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { AssistedPrepServicesShowcase } from '@/components/assisted-prep/AssistedPrepServicesShowcase';
import { GoldenPackProof } from '@/components/marketing/GoldenPackProof';
import { FAQSection } from '@/components/seo/FAQSection';
import { Container } from '@/components/ui/Container';
import { getGoldenPackProofData } from '@/lib/marketing/golden-pack-proof';
import {
  getProductSamplePageBySlug,
  productSamplePages,
  type ProductSamplePageConfig,
} from '@/lib/marketing/product-sample-pages';
import { PRODUCTS } from '@/lib/pricing/products';
import { getCanonicalUrl } from '@/lib/seo';
import {
  StructuredData,
  breadcrumbSchema,
  faqPageSchema,
  productSchema,
} from '@/lib/seo/structured-data';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;
const comparisonCards = [
  {
    title: 'Compared with a solicitor',
    body:
      'Use a solicitor for bespoke dispute work or complex negotiation. Use Landlord Heaven when you want fixed-price, solicitor-approved document preparation for a routine landlord workflow.',
  },
  {
    title: 'Compared with a wording-only download',
    body:
      'A wording-only download leaves you to work out the route, dates, wording, and supporting paperwork yourself. Landlord Heaven builds the pack from your answers and keeps the procedural file joined up.',
  },
  {
    title: 'What Landlord Heaven validates before checkout',
    body:
      'The workflow checks product fit, key dates, required facts, route choices, and document readiness before you pay, so the pack is not just a static download.',
  },
  {
    title: 'Preview the pack before you pay',
    body:
      'Use the sample to inspect the expected output, then preview your own generated documents before checkout and update the facts if something needs correcting.',
  },
] as const;

export function generateStaticParams(): Array<{ slug: string }> {
  return productSamplePages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const config = getProductSamplePageBySlug(slug);

  if (!config) {
    return {
      title: 'Sample Not Found | Landlord Heaven',
      description: 'Landlord Heaven document sample page not found.',
      robots: 'noindex, nofollow',
    };
  }

  const canonicalUrl = getCanonicalUrl(config.samplePath);

  return {
    title: config.metaTitle,
    description: config.metaDescription,
    keywords: config.seoKeywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: config.metaTitle,
      description: config.metaDescription,
      url: canonicalUrl,
      type: 'website',
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

function ProductSamplePageView({ config }: { config: ProductSamplePageConfig }) {
  const proof = getGoldenPackProofData(config.packKey);

  if (!proof) {
    notFound();
  }

  const product = PRODUCTS[config.sku];
  const canonicalUrl = getCanonicalUrl(config.samplePath);
  const productUrl = getCanonicalUrl(config.productHref);
  const showAssistedPrep = ['notice_only', 'complete_pack', 'money_claim'].includes(config.sku);

  return (
    <main className="min-h-screen bg-[#FCFBF8]">
      <HeaderConfig mode="solid" />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: getCanonicalUrl('/') },
          { name: 'Free Samples', url: getCanonicalUrl('/samples') },
          { name: `${config.productName} Sample`, url: canonicalUrl },
        ])}
      />
      <StructuredData data={faqPageSchema(config.faqs)} />
      <StructuredData
        data={productSchema({
          name: config.productName,
          description: `${config.metaDescription} ${config.productName} is available as an instant digital pack for landlords.`,
          price: product.price.toFixed(2),
          url: productUrl,
        })}
      />

      <section className="border-b border-[#E8E1D7] bg-white pt-28 md:pt-32">
        <Container className="py-8">
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
            <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-[#6B7280]">
              <Link href="/" className="hover:text-primary">
                Home
              </Link>
              <span>/</span>
              <Link href="/samples" className="hover:text-primary">
                Free Samples
              </Link>
              <span>/</span>
              <span className="font-medium text-[#141B2D]">{config.productName}</span>
            </nav>
            <Link href={config.productHref} className="font-semibold text-primary hover:underline">
              &larr; Back to {config.productName}
            </Link>
          </div>

          <div className="mt-10 max-w-4xl">
            <p className="inline-flex rounded-full border border-[#D8C8FF] bg-[#F7F1FF] px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-[#5E3E9A]">
              Solicitor-approved sample workflow
            </p>
            <p className="mt-3 text-sm font-semibold uppercase tracking-[0.12em] text-[#7C3AED]">
              {config.targetKeyword}
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-[#141B2D] md:text-6xl">
              Full Sample: {config.productName}
            </h1>
            <p className="mt-5 text-lg leading-8 text-[#546075] md:text-xl">{config.intro}</p>
            <p className="mt-4 max-w-3xl text-base leading-7 text-[#546075]">
              This sample shows the kind of pack Landlord Heaven can prepare from landlord facts. The paid workflow is fixed-price, validates the procedural details before checkout, and lets you preview the generated documents before you pay.
            </p>
          </div>
        </Container>
      </section>

      <Container className="py-12 md:py-16">
        <GoldenPackProof data={proof} />

        {showAssistedPrep ? (
          <AssistedPrepServicesShowcase
            pagePath={config.samplePath}
            pageType="entry_page"
            src="sample_page_assisted"
          />
        ) : null}

        <section className="mt-8 rounded-lg border border-[#D8C8FF] bg-[#F7F2FF] p-6 shadow-[0_14px_32px_rgba(91,86,232,0.08)] md:p-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7C3AED]">
              Why this is not just another sample PDF
            </p>
            <h2 className="mt-3 text-3xl font-bold text-[#141B2D]">
              Inspect the sample, then build the pack around your facts
            </h2>
            <p className="mt-4 text-base leading-8 text-[#546075]">
              A free sample is useful for checking the output. The paid {config.productName} is the next step when you want a solicitor-approved procedural workflow that turns your answers into a previewable landlord document pack.
            </p>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {comparisonCards.map((card) => (
              <article key={card.title} className="rounded-lg border border-[#E4DAFF] bg-white p-5">
                <h3 className="text-lg font-semibold text-[#141B2D]">{card.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#546075] md:text-base">{card.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-lg border border-[#E8E1D7] bg-white p-6 shadow-[0_14px_32px_rgba(31,41,55,0.05)] md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7C3AED]">
                Ready to generate your own pack?
              </p>
              <h2 className="mt-2 text-2xl font-bold text-[#141B2D]">{config.ctaText}</h2>
              <p className="mt-2 text-base leading-7 text-[#546075]">
                Start from your own facts, let the workflow validate the key procedural details, preview the documents, and download the completed pack after purchase.
              </p>
            </div>
            <Link
              href={config.productHref}
              className="inline-flex items-center justify-center rounded-lg bg-[#6D28D9] px-5 py-3 text-sm font-semibold text-white hover:bg-[#5B21B6]"
            >
              Build my {config.productName}
            </Link>
          </div>
        </section>

        <section className="mt-12 rounded-lg border border-[#E8E1D7] bg-white p-6 shadow-[0_14px_32px_rgba(31,41,55,0.05)] md:p-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7C3AED]">
              Documents in this pack
            </p>
            <h2 className="mt-3 text-3xl font-bold text-[#141B2D]">
              What the golden-pack manifest includes
            </h2>
            <p className="mt-4 text-base leading-8 text-[#546075]">
              This list is generated from the same manifest as the viewer, so document names and page counts stay aligned with the current sample pack.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {proof.allEntries.map((entry) => (
              <article key={entry.documentType} className="rounded-lg border border-[#E8E1D7] bg-[#FCFBF8] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7C3AED]">
                  {entry.categoryLabel}
                </p>
                <h3 className="mt-2 text-lg font-semibold text-[#141B2D]">{entry.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#546075]">{entry.description}</p>
                <p className="mt-3 text-sm font-semibold text-[#2A2161]">
                  {entry.pageCount ? `${entry.pageCount} sample pages` : 'Included document'}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <FAQSection
            title={`${config.productName} sample FAQs`}
            faqs={config.faqs}
            includeSchema={false}
            showContactCTA={false}
            variant="white"
          />
        </section>

        <section className="mt-12 rounded-lg border border-[#E8E1D7] bg-[#F7F2FF] p-6 text-center">
          <Link href="/samples" className="font-semibold text-primary hover:underline">
            See all free Landlord Heaven document samples
          </Link>
        </section>
      </Container>
    </main>
  );
}

export default async function ProductSamplePage({ params }: PageProps) {
  const { slug } = await params;
  const config = getProductSamplePageBySlug(slug);

  if (!config) {
    notFound();
  }

  return <ProductSamplePageView config={config} />;
}
