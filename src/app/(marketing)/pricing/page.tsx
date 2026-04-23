import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/components/ui';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { FAQSection } from '@/components/seo/FAQSection';
import { generateMetadata } from '@/lib/seo';
import { StructuredData, pricingItemListSchema } from '@/lib/seo/structured-data';
import {
  getPublicCardAccentClasses,
  PUBLIC_LAYOUT_CLASSES,
} from '@/lib/public-brand';
import { PUBLIC_PRODUCT_DESCRIPTORS } from '@/lib/public-products';
import { LANDLORD_DOCUMENT_PRICE_RANGE } from '@/lib/pricing/products';
import { getDynamicReviewCount, REVIEW_RATING } from '@/lib/reviews/reviewStats';
import {
  PUBLIC_RESIDENTIAL_LETTING_PRODUCT_SKUS,
  RESIDENTIAL_LETTING_PRODUCTS,
  RESIDENTIAL_LETTING_PRICE_RANGE,
  getResidentialLandingHref,
  getResidentialWizardHref,
} from '@/lib/residential-letting/products';
import {
  ENGLAND_POST_MAY_2026_POSITION,
  LANDLORD_HEAVEN_PURPOSE,
} from '@/lib/marketing/landlord-messaging';
import { PRICING_PACKAGE_CARDS, PRICING_SCHEMA_ITEMS } from '@/lib/marketing/pricing-page';
import { clsx } from 'clsx';
import { RiArrowRightLine, RiCheckLine } from 'react-icons/ri';

export const metadata: Metadata = generateMetadata({
  title: 'Pricing for landlords in England | Eviction, rent increase, debt, and tenancy packs',
  description:
    'Compare Landlord Heaven pricing for landlords in England across eviction, court possession, money claims, rent increases, and tenancy agreements.',
  path: '/pricing',
  keywords: [
    'landlord pricing england',
    'eviction notice generator price',
    'complete eviction pack price',
    'money claim pack price',
    'section 13 rent increase price',
    'tenancy agreement price england',
    'landlord document pricing',
  ],
});

const reviewCount = getDynamicReviewCount();

const accentByProduct = {
  notice_only: PUBLIC_PRODUCT_DESCRIPTORS.notice_only.cardAccent,
  complete_pack: PUBLIC_PRODUCT_DESCRIPTORS.complete_pack.cardAccent,
  money_claim: PUBLIC_PRODUCT_DESCRIPTORS.money_claim.cardAccent,
  section13_standard: PUBLIC_PRODUCT_DESCRIPTORS.section13_standard.cardAccent,
  section13_defensive: PUBLIC_PRODUCT_DESCRIPTORS.section13_defensive.cardAccent,
  ast: PUBLIC_PRODUCT_DESCRIPTORS.ast.cardAccent,
};

const packageImages: Record<
  string,
  { src: string; alt: string; accent: keyof typeof accentByProduct }
> = {
  notice_only: {
    src: '/images/notice_bundles.webp',
    alt: 'Eviction notice generator preview',
    accent: 'notice_only',
  },
  complete_pack: {
    src: '/images/eviction_packs.webp',
    alt: 'Complete eviction pack preview',
    accent: 'complete_pack',
  },
  money_claim: {
    src: '/images/money_claims.webp',
    alt: 'Money claim pack preview',
    accent: 'money_claim',
  },
  section13_standard: {
    src: '/images/Statutory-change.webp',
    alt: 'Section 13 rent increase pack preview',
    accent: 'section13_standard',
  },
  section13_defensive: {
    src: '/images/Statutory-change.webp',
    alt: 'Section 13 defence pack preview',
    accent: 'section13_defensive',
  },
  ast_standard: {
    src: '/images/standard_tenancy.webp',
    alt: 'Standard tenancy agreement preview',
    accent: 'ast',
  },
  ast_premium: {
    src: '/images/premium_tenancy.webp',
    alt: 'Premium tenancy agreement preview',
    accent: 'ast',
  },
};

const solicitorComparison = [
  {
    label: 'Typical cost',
    solicitor: 'Often GBP300-GBP2,500+',
    heaven: LANDLORD_DOCUMENT_PRICE_RANGE,
  },
  {
    label: 'Speed',
    solicitor: 'Usually days or weeks',
    heaven: 'Usually minutes',
  },
  {
    label: 'Preview before payment',
    solicitor: 'Rare',
    heaven: 'Yes',
  },
  {
    label: 'Make changes and regenerate',
    solicitor: 'Usually extra time and extra cost',
    heaven: 'Included',
  },
  {
    label: 'Keep documents in one account',
    solicitor: 'Varies',
    heaven: 'Yes',
  },
];

export default function PricingPage() {
  const residentialProducts = PUBLIC_RESIDENTIAL_LETTING_PRODUCT_SKUS.map(
    (sku) => RESIDENTIAL_LETTING_PRODUCTS[sku]
  );
  const pricingSchema = pricingItemListSchema([...PRICING_SCHEMA_ITEMS]);

  return (
    <div className={clsx('min-h-screen', PUBLIC_LAYOUT_CLASSES.page)}>
      <StructuredData data={pricingSchema} />
      <HeaderConfig mode="autoOnScroll" />

      <UniversalHero
        preset="content_index"
        badge="Transparent pricing for landlords in England"
        trustText="One-time prices across eviction, debt, rent increase, and tenancy agreements"
        title="See the price"
        highlightTitle="and what each pack helps you do"
        subtitle="If you need to serve notice, prepare for court, recover rent, increase the rent properly, or put the right tenancy agreement in place, this page shows the prices in one place for landlords in England."
        primaryCta={{
          label: 'Choose the right product',
          href: '/wizard?topic=eviction&src=pricing_page',
        }}
        secondaryCta={{ label: 'Contact support', href: '/contact' }}
        mediaSrc="/images/laptop.webp"
        mediaAlt="Landlord Heaven pricing and product previews"
        showTrustPositioningBar
      >
        <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-white/35 bg-white/12 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm">
          <span aria-hidden="true">{'\u2605'.repeat(5)}</span>
          <span>{`${REVIEW_RATING}/5 | ${reviewCount} reviews`}</span>
        </div>
        <p className="mt-3 text-sm text-white/88">All prices are one-time payments.</p>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-white/76">
          {LANDLORD_HEAVEN_PURPOSE}
        </p>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-white/76">
          {ENGLAND_POST_MAY_2026_POSITION}
        </p>
      </UniversalHero>

      <Container size="large" className="py-14">
        <div className={clsx(PUBLIC_LAYOUT_CLASSES.section, 'px-6 py-8 md:px-10 md:py-10')}>
          <div className="mb-8 max-w-4xl">
            <span className="public-eyebrow">Public pricing</span>
            <h2 className="mt-5 text-3xl font-bold tracking-tight text-[#1c1431] md:text-5xl">
              Choose the pack that matches the problem in front of you
            </h2>
            <p className="mt-4 text-lg leading-8 text-[#5d5672]">
              Read this page the same way you would think about the problem in
              front of you. If you need possession, start with the eviction
              products. If the tenant owes you money, use the money claim pack.
              If you need to increase the rent, choose the Section 13 packs. If
              you are putting a tenancy in place, choose the agreement that fits
              the let.
            </p>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            {PRICING_PACKAGE_CARDS.map((card) => {
              const image = packageImages[card.productSku];
              const accent = getPublicCardAccentClasses(accentByProduct[image.accent]);

              return (
                <section
                  key={card.name}
                  className={clsx(
                    'overflow-hidden rounded-[2rem] border',
                    accent.card,
                    accent.borderGlow,
                    PUBLIC_LAYOUT_CLASSES.card
                  )}
                >
                  <div className="grid gap-0 md:grid-cols-[0.42fr_0.58fr]">
                    <div className="relative min-h-[16rem] overflow-hidden border-b border-black/5 md:border-b-0 md:border-r">
                      <Image
                        src={image.src}
                        alt={image.alt}
                        fill
                        sizes="(max-width: 768px) 100vw, 32vw"
                        className="object-cover"
                      />
                    </div>

                    <div className="p-6">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p
                            className={clsx(
                              'inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]',
                              accent.chip
                            )}
                          >
                            {card.coverage}
                          </p>
                          <h3 className="mt-4 text-2xl font-bold text-[#1d1532]">
                            {card.name}
                          </h3>
                        </div>
                        <div className="rounded-2xl bg-white/82 px-4 py-3 text-right shadow-[0_16px_32px_rgba(58,28,103,0.08)]">
                          <div className="text-xs uppercase tracking-[0.12em] text-[#6b6480]">
                            One-time
                          </div>
                          <div className="text-2xl font-bold text-[#1d1532]">
                            {card.price}
                          </div>
                        </div>
                      </div>

                      <p className="mt-5 text-base font-semibold text-[#2d2344]">
                        {card.bestFor}
                      </p>
                      <ul className="mt-4 space-y-3 text-sm text-[#5a516d]">
                        {card.points.map((point) => (
                          <li key={point} className="flex items-start gap-2">
                            <RiCheckLine className="mt-0.5 h-4 w-4 shrink-0 text-[#7c3aed]" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="mt-6">
                        <Link
                          href={card.href}
                          className="hero-btn-primary inline-flex items-center gap-2"
                        >
                          {card.cta}
                          <RiArrowRightLine className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </Container>

      <Container size="large" className="pb-12">
        <div className="grid gap-6 xl:grid-cols-[0.98fr_1.02fr]">
          <section className={clsx(PUBLIC_LAYOUT_CLASSES.section, 'px-6 py-8 md:px-8')}>
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <span className="public-eyebrow">Exact agreement options</span>
                <h2 className="mt-5 text-3xl font-bold tracking-tight text-[#1c1431]">
                  England tenancy agreement products
                </h2>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-[#5d5672]">
                  If you only need one exact England agreement instead of the hub,
                  these pages take you straight to the Standard, Premium, Student,
                  HMO / Shared House, or Lodger agreement you need.
                </p>
              </div>
              <p className="text-sm text-[#6b6480]">
                Per-document pricing {RESIDENTIAL_LETTING_PRICE_RANGE}
              </p>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {residentialProducts.map((product) => (
                <div
                  key={product.sku}
                  className="rounded-[1.6rem] border border-[#ece4ff] bg-white/88 p-5 shadow-[0_18px_40px_rgba(58,28,103,0.08)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-[#1d1532]">
                        {product.label}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-[#5d5672]">
                        {product.description}
                      </p>
                    </div>
                    <div className="whitespace-nowrap text-lg font-bold text-[#6b3fd1]">
                      {product.displayPrice}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                    <Link
                      href={getResidentialLandingHref(product.sku)}
                      className="hero-btn-secondary flex-1 text-center"
                    >
                      See details
                    </Link>
                    <Link
                      href={getResidentialWizardHref(product.sku)}
                      className="hero-btn-primary flex-1 text-center"
                    >
                      Start now
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className={clsx(PUBLIC_LAYOUT_CLASSES.section, 'px-6 py-8 md:px-8')}>
            <span className="public-eyebrow">Cost comparison</span>
            <h2 className="mt-5 text-3xl font-bold tracking-tight text-[#1c1431]">
              Why landlords compare us with a solicitor
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[#5d5672]">
              Many landlords are not trying to replace specialist advice in a
              genuinely complex case. They are trying to get the right paperwork
              started now and avoid paying solicitor rates just to prepare
              the first documents.
            </p>
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#ece4ff]">
                    <th className="py-3 text-left text-[#5d5672]">Metric</th>
                    <th className="py-3 text-center text-[#5d5672]">Solicitor</th>
                    <th className="py-3 text-center text-[#5d5672]">Landlord Heaven</th>
                  </tr>
                </thead>
                <tbody>
                  {solicitorComparison.map((row) => (
                    <tr
                      key={row.label}
                      className="border-b border-[#f3ecff] last:border-b-0"
                    >
                      <td className="py-3 text-[#2d2344]">{row.label}</td>
                      <td className="py-3 text-center text-[#6b6480]">
                        {row.solicitor}
                      </td>
                      <td className="py-3 text-center font-medium text-[#1d1532]">
                        {row.heaven}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </Container>

      <FAQSection
        title="Pricing FAQs"
        faqs={[
          {
            question: 'Are there any hidden fees?',
            answer:
              'No. The price shown is the price you pay. Court fees are separate and are paid directly to the court when you file.',
          },
          {
            question: 'What is your refund policy?',
            answer: (
              <>
                These are instant digital products, so refunds are not available once
                documents have been generated and delivered. Refunds are only
                available for technical errors, duplicate charges, or unauthorised
                transactions. See our{' '}
                <Link href="/refunds" className="text-primary hover:underline">
                  full refund policy
                </Link>{' '}
                for details.
              </>
            ),
          },
          {
            question: 'Do you offer discounts for multiple documents?',
            answer:
              'If you need multiple documents each month, contact sales@landlordheaven.co.uk for volume pricing.',
          },
          {
            question: 'How much do solicitors charge for similar work?',
            answer:
              'Typical solicitor pricing is often several hundred pounds per case. Many landlords use Landlord Heaven when they want to get the paperwork moving and prepare the documents before deciding whether a solicitor is still needed later.',
          },
          {
            question: 'Can I buy another product later?',
            answer: 'Yes. You can buy another product whenever your situation changes.',
          },
          {
            question: 'Do you list Section 13 pricing here too?',
            answer:
              'Yes. The pricing page includes both the Standard Section 13 Pack and the Challenge-Ready Section 13 Defence Pack, with prices pulled from the same central product pricing used across the site.',
          },
        ]}
        showContactCTA={false}
        variant="white"
      />

      <section className="pb-16 pt-4 md:pb-20">
        <Container>
          <div
            className={clsx(
              PUBLIC_LAYOUT_CLASSES.darkPanel,
              'px-6 py-10 text-center md:px-12 md:py-12'
            )}
          >
            <h2 className="text-3xl font-bold text-white md:text-4xl">
              Still not sure which pack fits?
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-lg leading-8 text-white/76">
              Tell us what has gone wrong with the tenancy and we will help you
              narrow the next step in plain English.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/contact" className="hero-btn-primary">
                Contact support
              </Link>
              <Link href="/help" className="hero-btn-secondary">
                Browse the help centre
              </Link>
            </div>
            <p className="mt-4 text-sm text-white/64">
              Quick response. Straight answers. No obligation.
            </p>
          </div>
        </Container>
      </section>
    </div>
  );
}
