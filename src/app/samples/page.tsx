import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { Container } from '@/components/ui/Container';
import { getGoldenPackProofData } from '@/lib/marketing/golden-pack-proof';
import { productSamplePages } from '@/lib/marketing/product-sample-pages';
import { PRODUCTS } from '@/lib/pricing/products';
import { getCanonicalUrl } from '@/lib/seo';
import {
  StructuredData,
  breadcrumbSchema,
  pricingItemListSchema,
} from '@/lib/seo/structured-data';

const samplePagePath = '/samples';
const canonicalUrl = getCanonicalUrl(samplePagePath);
const sampleDirectoryGroups = [
  {
    title: 'Eviction and possession',
    body: 'Notice-stage and court-stage packs for rent arrears possession work.',
    imageSrc: '/images/sample-eviction-possession.webp',
    imageAlt: 'Eviction and possession sample documents',
    slugs: ['section-8-notice-example', 'complete-eviction-pack-example'],
  },
  {
    title: 'Debt recovery',
    body: 'Pre-action and claim documents for unpaid rent after the tenancy route is clear.',
    imageSrc: '/images/sample-debt-recovery.webp',
    imageAlt: 'Debt recovery sample documents',
    slugs: ['money-claim-online-example'],
  },
  {
    title: 'Rent increase',
    body: 'Section 13 Form 4A and tribunal-ready evidence samples for England rent increases.',
    imageSrc: '/images/sample-increase-rent.webp',
    imageAlt: 'Rent increase sample documents',
    slugs: ['form-4a-example', 'section-13-defence-pack-example'],
  },
  {
    title: 'Tenancy agreements',
    body: 'Agreement samples for standard, premium, student, HMO/shared house, and lodger lets.',
    imageSrc: '/images/sample-tenancy-agreements.webp',
    imageAlt: 'Tenancy agreement sample documents',
    slugs: [
      'standard-tenancy-agreement-example',
      'premium-tenancy-agreement-example',
      'student-tenancy-agreement-example',
      'hmo-tenancy-agreement-example',
      'lodger-agreement-example',
    ],
  },
] as const;

const samplePositioningCards = [
  {
    title: 'Compared with a solicitor',
    body:
      'A solicitor is still the right choice for bespoke dispute work, but routine landlord document setup can be slower and more expensive than a fixed-price workflow. Landlord Heaven gives you solicitor-approved document preparation built around the facts you enter.',
  },
  {
    title: 'Compared with a wording-only download',
    body:
      'A wording-only download gives you text to edit. These packs are built from landlord facts, include procedural checks, and keep the agreement, notice, claim, service, evidence, or support documents together.',
  },
  {
    title: 'What Landlord Heaven validates before checkout',
    body:
      'The workflow checks the key facts, dates, route choices, product fit, and document readiness before you move from preview to payment, so you are not simply downloading a blank form.',
  },
  {
    title: 'Preview the pack before you pay',
    body:
      'Inspect the sample, start the guided workflow, preview your own generated pack, then pay when the documents match the facts you entered.',
  },
] as const;

export const metadata: Metadata = {
  title: 'Free Landlord Document Samples | Section 8, Tenancy & Rent Packs',
  description:
    'View free landlord document samples from solicitor-approved workflows that build notices, claims, rent increase files, and tenancy packs around landlord facts.',
  keywords: [
    'landlord document samples',
    'section 8 notice sample',
    'tenancy agreement sample',
    'rent increase pack sample',
    'money claim pack sample',
  ],
  alternates: {
    canonical: canonicalUrl,
  },
  openGraph: {
    title: 'Free Landlord Document Samples',
    description:
      'Browse sample PDFs for Section 8 notices, tenancy agreements, Section 13 rent increases, and money claim packs.',
    url: canonicalUrl,
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function SamplesPage() {
  const samplePacks = productSamplePages
    .map((config) => {
      const proof = getGoldenPackProofData(config.packKey);
      return proof ? { ...config, proof, product: PRODUCTS[config.sku] } : null;
    })
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));

  return (
    <main className="min-h-screen bg-[#FCFBF8]">
      <HeaderConfig mode="autoOnScroll" />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: getCanonicalUrl('/') },
          { name: 'Free Samples', url: canonicalUrl },
        ])}
      />
      <StructuredData
        data={pricingItemListSchema(
          samplePacks.map((entry) => ({
            sku: entry.sku,
            url: entry.productHref,
            description: `${entry.proof.displayName} sample documents powered by the current golden pack.`,
          }))
        )}
      />

      <UniversalHero
        badge="Free Samples"
        preTitleLabel="Solicitor-approved sample packs"
        title="Free Landlord Document Samples"
        subtitle="Browse real sample documents, then move into the fixed-price workflow that builds the notice, claim, rent increase file, or tenancy setup pack around your facts. This is not a static form library."
        primaryCta={{ label: 'Browse sample hub', href: '#sample-directory' }}
        secondaryCta={{ label: 'View PDF previews', href: '#sample-packs' }}
        mediaSrc="/images/wizard-icons/18-forms-bundle.png"
        mediaAlt="Landlord document sample pack"
        showReviewPill
        showTrustPositioningBar
        trustPositioningHeadline="Inspect the sample, then build a validated landlord document pack around your facts before you pay."
      />

      <Container id="sample-directory" className="py-10 md:py-12">
        <section className="rounded-lg border border-[#E8E1D7] bg-white p-6 shadow-[0_14px_32px_rgba(31,41,55,0.05)] md:p-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7C3AED]">
              Sample hub
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#141B2D] md:text-4xl">
              Open the exact sample page you need
            </h2>
            <p className="mt-4 text-base leading-8 text-[#546075] md:text-lg">
              Every public sample page is linked here, grouped by landlord workflow. Each one opens a full sample page with the current golden-pack PDFs and a route back to the matching product.
            </p>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-4">
            {sampleDirectoryGroups.map((group) => {
              const groupSamples = productSamplePages.filter((sample) =>
                (group.slugs as readonly string[]).includes(sample.slug)
              );

              return (
                <article key={group.title} className="overflow-hidden rounded-lg border border-[#E8E1D7] bg-[#FCFBF8]">
                  <div className="relative h-40 w-full">
                    <Image
                      src={group.imageSrc}
                      alt={group.imageAlt}
                      fill
                      className="object-cover"
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-[#141B2D]">{group.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#546075]">{group.body}</p>
                    <div className="mt-5 space-y-2">
                      {groupSamples.map((sample) => (
                        <Link
                          key={sample.samplePath}
                          href={sample.samplePath}
                          className="block rounded-lg border border-[#E8E1D7] bg-white px-3 py-3 text-sm font-semibold text-[#141B2D] transition hover:border-[#C7B4FF] hover:text-[#5B21B6]"
                        >
                          {sample.productName}
                          <span className="mt-1 block text-xs font-medium leading-5 text-[#6B7280]">
                            {sample.targetKeyword}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </Container>

      <Container id="sample-packs" className="py-12 md:py-16">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7C3AED]">
            Golden-pack sample library
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#141B2D] md:text-4xl">
            Inspect sample PDFs before choosing the right workflow
          </h2>
          <p className="mt-4 text-lg leading-8 text-[#546075]">
            Each card is generated from the latest product pack manifest, so document counts, total pages, featured files, and viewer links stay aligned with the live packs. The paid route then creates the finished documents from your own answers and validation checks.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {samplePacks.map(({ packKey, proof, productHref, product, targetKeyword, samplePath, productName }) => (
            <article
              key={packKey}
              data-testid="golden-pack-sample-card"
              className="rounded-lg border border-[#E8E1D7] bg-white p-6 shadow-[0_14px_32px_rgba(31,41,55,0.05)]"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7C3AED]">
                    {targetKeyword}
                  </p>
                  <h3 className="mt-2 text-2xl font-bold text-[#141B2D]">
                    <Link href={samplePath} className="hover:text-[#5B21B6]">
                      {proof.displayName}
                    </Link>
                  </h3>
                  <p className="mt-2 text-sm text-[#546075]">
                    {proof.documentCount} documents, {proof.totalPages} pages total
                  </p>
                </div>
                <Link
                  href={samplePath}
                  className="inline-flex items-center justify-center rounded-lg bg-[#6D28D9] px-4 py-3 text-sm font-semibold text-white hover:bg-[#5B21B6]"
                >
                  View full sample
                </Link>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {proof.featuredEntries.slice(0, 3).map((entry) => (
                  <div key={entry.documentType} className="rounded-lg border border-[#E8E1D7] bg-[#FCFBF8] p-3">
                    {entry.thumbnailHref ? (
                      <Link href={samplePath} aria-label={`View full ${productName} sample`}>
                        <Image
                          src={entry.thumbnailHref}
                          alt={`${entry.title} sample preview`}
                          width={240}
                          height={340}
                          className="aspect-[3/4] w-full rounded-md border border-[#E8E1D7] bg-white object-cover"
                          unoptimized
                        />
                      </Link>
                    ) : null}
                    <p className="mt-3 text-sm font-semibold leading-5 text-[#141B2D]">{entry.title}</p>
                    <p className="mt-1 text-xs text-[#6B7280]">
                      {entry.categoryLabel}
                      {entry.pageCount ? `, ${entry.pageCount} pages` : ''}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                      {entry.embedHref ? (
                        <Link href={samplePath} className="text-primary hover:underline">
                          Full sample page
                        </Link>
                      ) : null}
                      <Link href={productHref} className="text-primary hover:underline">
                        View {product.shortLabel}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {proof.remainingTitles.length ? (
                <p className="mt-5 text-sm text-[#546075]">
                  Also includes: {proof.remainingTitles.slice(0, 4).join(', ')}
                  {proof.remainingTitles.length > 4 ? ', and more' : ''}.
                </p>
              ) : null}
            </article>
          ))}
        </div>
      </Container>

      <Container className="pb-12 md:pb-16">
        <section className="rounded-lg border border-[#D8C8FF] bg-[#F7F2FF] p-6 shadow-[0_16px_38px_rgba(67,44,126,0.08)] md:p-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#6D28D9]">
              Why these samples sell the workflow
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#141B2D] md:text-4xl">
              A sample is useful only if the paid product builds the right pack
            </h2>
            <p className="mt-4 text-base leading-8 text-[#546075] md:text-lg">
              Use the PDFs to inspect the output, then use Landlord Heaven to build a fixed-price, solicitor-approved document workflow around the facts of the tenancy, notice, claim, or rent increase.
            </p>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {samplePositioningCards.map((card) => (
              <article key={card.title} className="rounded-lg border border-[#E4DAFF] bg-white p-5">
                <h3 className="text-lg font-semibold text-[#141B2D]">{card.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#546075] md:text-base">{card.body}</p>
              </article>
            ))}
          </div>
        </section>
      </Container>
    </main>
  );
}
