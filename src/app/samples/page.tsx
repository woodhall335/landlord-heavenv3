import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { Container } from '@/components/ui/Container';
import { getGoldenPackProofData, type GoldenPackKey } from '@/lib/marketing/golden-pack-proof';
import { PRODUCTS, type ProductSku } from '@/lib/pricing/products';
import { getCanonicalUrl } from '@/lib/seo';
import {
  StructuredData,
  breadcrumbSchema,
  pricingItemListSchema,
} from '@/lib/seo/structured-data';

const samplePagePath = '/samples';
const canonicalUrl = getCanonicalUrl(samplePagePath);

type SamplePackConfig = {
  packKey: GoldenPackKey;
  sku: ProductSku;
  productHref: string;
  sampleIntent: string;
};

const samplePackConfigs: SamplePackConfig[] = [
  {
    packKey: 'notice_only',
    sku: 'notice_only',
    productHref: '/products/notice-only',
    sampleIntent: 'Section 8 notice sample PDF',
  },
  {
    packKey: 'complete_pack',
    sku: 'complete_pack',
    productHref: '/products/complete-pack',
    sampleIntent: 'Section 8 court pack sample',
  },
  {
    packKey: 'money_claim',
    sku: 'money_claim',
    productHref: '/products/money-claim',
    sampleIntent: 'Money Claim Online pack sample',
  },
  {
    packKey: 'section13_standard',
    sku: 'section13_standard',
    productHref: '/products/section-13-standard',
    sampleIntent: 'Section 13 Form 4A sample',
  },
  {
    packKey: 'section13_defensive',
    sku: 'section13_defensive',
    productHref: '/products/section-13-defence',
    sampleIntent: 'Section 13 tribunal defence sample',
  },
  {
    packKey: 'england_standard_tenancy_agreement',
    sku: 'england_standard_tenancy_agreement',
    productHref: '/standard-tenancy-agreement',
    sampleIntent: 'standard tenancy agreement sample UK',
  },
  {
    packKey: 'england_premium_tenancy_agreement',
    sku: 'england_premium_tenancy_agreement',
    productHref: '/premium-tenancy-agreement',
    sampleIntent: 'premium tenancy agreement example',
  },
  {
    packKey: 'england_student_tenancy_agreement',
    sku: 'england_student_tenancy_agreement',
    productHref: '/student-tenancy-agreement',
    sampleIntent: 'student tenancy agreement sample',
  },
  {
    packKey: 'england_hmo_shared_house_tenancy_agreement',
    sku: 'england_hmo_shared_house_tenancy_agreement',
    productHref: '/hmo-shared-house-tenancy-agreement',
    sampleIntent: 'HMO tenancy agreement sample',
  },
  {
    packKey: 'england_lodger_agreement',
    sku: 'england_lodger_agreement',
    productHref: '/lodger-agreement',
    sampleIntent: 'lodger agreement sample UK',
  },
];

export const metadata: Metadata = {
  title: 'Free Landlord Document Samples | Section 8, Tenancy & Rent Packs',
  description:
    'View free landlord document samples from our golden packs, including Section 8 notice, tenancy agreement, rent increase, and money claim examples.',
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
  const samplePacks = samplePackConfigs
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
        title="Free Landlord Document Samples"
        subtitle="Browse real sample documents from the same golden-pack manifests that power the product previews, so page counts and document lists stay in sync when packs change."
        primaryCta={{ label: 'View sample packs', href: '#sample-packs' }}
        secondaryCta={{ label: 'Compare tenancy options', href: '/compare/tenancy-agreement-options-england' }}
        mediaSrc="/images/wizard-icons/18-forms-bundle.png"
        mediaAlt="Landlord document sample pack"
        showReviewPill
        showTrustPositioningBar
      />

      <Container id="sample-packs" className="py-12 md:py-16">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7C3AED]">
            Golden-pack sample library
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#141B2D] md:text-4xl">
            Inspect sample PDFs before choosing the right pack
          </h2>
          <p className="mt-4 text-lg leading-8 text-[#546075]">
            Each card is generated from the latest product pack manifest, so document counts, total pages, featured files, and viewer links stay aligned with the live packs.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {samplePacks.map(({ packKey, proof, productHref, product, sampleIntent }) => (
            <article
              key={packKey}
              data-testid="golden-pack-sample-card"
              className="rounded-lg border border-[#E8E1D7] bg-white p-6 shadow-[0_14px_32px_rgba(31,41,55,0.05)]"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7C3AED]">
                    {sampleIntent}
                  </p>
                  <h3 className="mt-2 text-2xl font-bold text-[#141B2D]">{proof.displayName}</h3>
                  <p className="mt-2 text-sm text-[#546075]">
                    {proof.documentCount} documents, {proof.totalPages} pages total
                  </p>
                </div>
                <Link
                  href={productHref}
                  className="inline-flex items-center justify-center rounded-lg bg-[#6D28D9] px-4 py-3 text-sm font-semibold text-white hover:bg-[#5B21B6]"
                >
                  View {product.shortLabel}
                </Link>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {proof.featuredEntries.slice(0, 3).map((entry) => (
                  <div key={entry.documentType} className="rounded-lg border border-[#E8E1D7] bg-[#FCFBF8] p-3">
                    {entry.thumbnailHref ? (
                      <Link href={entry.embedHref ?? entry.pdfHref ?? productHref} aria-label={`View ${entry.title} sample`}>
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
                        <Link href={entry.embedHref} className="text-primary hover:underline">
                          View sample
                        </Link>
                      ) : null}
                      {entry.pdfHref ? (
                        <Link href={entry.pdfHref} className="text-primary hover:underline">
                          Open PDF
                        </Link>
                      ) : null}
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
    </main>
  );
}
