import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/components/ui';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { AssistedPrepCTA } from '@/components/assisted-prep/AssistedPrepCTA';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { StaggerReveal, TrustPillRow } from '@/components/marketing/PremiumMotion';
import { FAQSection } from '@/components/seo/FAQSection';
import { generateMetadata } from '@/lib/seo';
import { StructuredData, pricingItemListSchema } from '@/lib/seo/structured-data';
import {
  getPublicCardAccentClasses,
  PUBLIC_LAYOUT_CLASSES,
} from '@/lib/public-brand';
import { PUBLIC_PRODUCT_DESCRIPTORS } from '@/lib/public-products';
import { LANDLORD_DOCUMENT_PRICE_RANGE } from '@/lib/pricing/products';
import { PRICING_PACKAGE_CARDS, PRICING_SCHEMA_ITEMS } from '@/lib/marketing/pricing-page';
import { clsx } from 'clsx';
import { RiCheckLine } from 'react-icons/ri';

export { UNIVERSAL_HERO_VIEWPORT as viewport } from '@/lib/seo/hero-theme';

export const metadata: Metadata = generateMetadata({
  title: 'Landlord Document Pricing | England Packs',
  description:
    'See one-time prices for Landlord Heaven packs covering Section 8 notices, possession claims, money claims, rent increases, and England tenancy agreements.',
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

const accentByProduct = {
  notice_only: PUBLIC_PRODUCT_DESCRIPTORS.notice_only.cardAccent,
  complete_pack: PUBLIC_PRODUCT_DESCRIPTORS.complete_pack.cardAccent,
  money_claim: PUBLIC_PRODUCT_DESCRIPTORS.money_claim.cardAccent,
  section13_standard: PUBLIC_PRODUCT_DESCRIPTORS.section13_standard.cardAccent,
  section13_defensive: PUBLIC_PRODUCT_DESCRIPTORS.section13_defensive.cardAccent,
  tenancy: PUBLIC_PRODUCT_DESCRIPTORS.england_standard_tenancy_agreement.cardAccent,
};

const packageImages: Record<
  string,
  { src: string; alt: string; accent: keyof typeof accentByProduct }
> = {
  notice_only: {
    src: '/images/section-8-eviction-notice-generator.webp',
    alt: 'Eviction notice generator preview',
    accent: 'notice_only',
  },
  complete_pack: {
    src: '/images/complete-eviction-pack.webp',
    alt: 'Complete eviction pack preview',
    accent: 'complete_pack',
  },
  money_claim: {
    src: '/images/money-claim-pack.webp',
    alt: 'Money claim pack preview',
    accent: 'money_claim',
  },
  section13_standard: {
    src: '/images/standard-section-13.webp',
    alt: 'Section 13 rent increase pack preview',
    accent: 'section13_standard',
  },
  section13_defensive: {
    src: '/images/defence-section-13.webp',
    alt: 'Section 13 defence pack preview',
    accent: 'section13_defensive',
  },
  ast_standard: {
    src: '/images/standard-tenancy.webp',
    alt: 'Standard tenancy agreement preview',
    accent: 'tenancy',
  },
  ast_premium: {
    src: '/images/premium-tenancy.webp',
    alt: 'Premium tenancy agreement preview',
    accent: 'tenancy',
  },
  england_standard_tenancy_agreement: {
    src: '/images/standard-tenancy.webp',
    alt: 'Standard tenancy agreement preview',
    accent: 'tenancy',
  },
  england_premium_tenancy_agreement: {
    src: '/images/premium-tenancy.webp',
    alt: 'Premium tenancy agreement preview',
    accent: 'tenancy',
  },
  england_student_tenancy_agreement: {
    src: '/images/wizard-student-tenancy-agreement.webp',
    alt: 'Student tenancy agreement preview',
    accent: 'tenancy',
  },
  england_hmo_shared_house_tenancy_agreement: {
    src: '/images/wizard-hmo-agreement.webp',
    alt: 'HMO shared house tenancy agreement preview',
    accent: 'tenancy',
  },
  england_lodger_agreement: {
    src: '/images/wizard-lodger-agreement.webp',
    alt: 'Lodger agreement preview',
    accent: 'tenancy',
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
  const pricingSchema = pricingItemListSchema([...PRICING_SCHEMA_ITEMS]);

  return (
    <div className={clsx('min-h-screen', PUBLIC_LAYOUT_CLASSES.page)}>
      <StructuredData data={pricingSchema} />
      <HeaderConfig mode="autoOnScroll" />

      <UniversalHero
        preset="content_index"
        badge="One-time prices for landlords in England"
        trustText="Eviction, debt, rent increase, and tenancy agreement packs"
        title="Compare landlord document prices"
        highlightTitle="and choose the right next step"
        subtitle="Pick the document job in front of you: serve notice, prepare court papers, recover money, increase rent, or set up an England tenancy agreement."
        primaryCta={{
          label: 'Choose the right product',
          href: '/wizard?topic=eviction&src=pricing_page',
        }}
        mediaSrc="/images/laptop.webp"
        mediaAlt="Landlord Heaven pricing and product previews"
        showTrustPositioningBar
      >
        <p className="mt-3 text-sm text-white/88">All prices are one-time payments.</p>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-white/76">
          Prices below are for landlords in England who need the right paperwork before they serve, file, or issue anything.
        </p>
        <TrustPillRow
          className="mt-5"
          items={['Fixed price', 'Preview before payment', 'England landlord documents']}
        />
      </UniversalHero>

      <Container size="large" className="py-14">
        <section className="mb-10 rounded-[2rem] border border-violet-200 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-6 max-w-3xl">
            <span className="public-eyebrow">Do it yourself or with us</span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-[#1c1431]">
              Assisted prep prices
            </h2>
            <p className="mt-3 text-base leading-7 text-[#5d5672]">
              If you do not want to complete the pack alone, choose assisted prep. We prepare it with you, you check it, and you send, serve, or file it.
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <AssistedPrepCTA service="section8" variant="inline" src="pricing_assisted" product="notice_only" />
            <AssistedPrepCTA service="money_claim" variant="inline" src="pricing_assisted" product="money_claim" />
            <AssistedPrepCTA service="possession" variant="inline" src="pricing_assisted" product="complete_pack" />
          </div>
        </section>

        <div className={clsx(PUBLIC_LAYOUT_CLASSES.section, 'px-6 py-8 md:px-10 md:py-10')}>
          <div className="mb-8 max-w-4xl">
            <span className="public-eyebrow">Public pricing</span>
            <h2 className="mt-5 text-3xl font-bold tracking-tight text-[#1c1431] md:text-5xl">
              Choose the document you need now
            </h2>
            <p className="mt-4 text-lg leading-8 text-[#5d5672]">
              Start with the practical problem. If you need possession, compare
              the Section 8 packs. If the tenant owes money, use the money claim
              pack. If you need to increase rent, compare the Section 13 packs.
              If you are setting up a tenancy, choose the agreement that matches
              the let.
            </p>
          </div>

          <StaggerReveal className="grid gap-6 xl:grid-cols-2">
            {PRICING_PACKAGE_CARDS.map((card) => {
              const image = packageImages[card.productSku] ?? packageImages.england_standard_tenancy_agreement;
              const accent = getPublicCardAccentClasses(accentByProduct[image.accent]);

              return (
                <section
                  key={card.name}
                  className={clsx(
                    'h-full overflow-hidden rounded-[2rem] border',
                    accent.card,
                    accent.borderGlow,
                    PUBLIC_LAYOUT_CLASSES.card
                  )}
                >
                  <div className="grid h-full gap-0 md:grid-cols-[0.42fr_0.58fr]">
                    <div className="relative min-h-[16rem] overflow-hidden border-b border-black/5 bg-white md:h-full md:border-b-0 md:border-r">
                      <Image
                        src={image.src}
                        alt={image.alt}
                        fill
                        sizes="(max-width: 768px) 100vw, 32vw"
                        className="object-cover object-center"
                      />
                    </div>

                    <div className="flex h-full flex-col p-6">
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
                          <h3 className="mt-4 min-h-[8.5rem] text-2xl font-bold text-[#1d1532] md:min-h-[9.5rem]">
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

                      <p className="mt-5 min-h-[5.5rem] text-base font-semibold text-[#2d2344]">
                        {card.bestFor}
                      </p>
                      <ul className="mt-4 min-h-[9rem] space-y-3 text-sm text-[#5a516d]">
                        {card.points.map((point) => (
                          <li key={point} className="flex items-start gap-2">
                            <RiCheckLine className="mt-0.5 h-4 w-4 shrink-0 text-[#7c3aed]" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="mt-auto pt-6">
                        <Link
                          href={card.href}
                          className="hero-btn-primary inline-flex items-center"
                        >
                          {card.cta}
                        </Link>
                      </div>
                    </div>
                  </div>
                </section>
              );
            })}
          </StaggerReveal>
        </div>
      </Container>

      <Container size="large" className="pb-12">
        <div className="grid gap-6 xl:grid-cols-[0.98fr_1.02fr]">
          <section className={clsx(PUBLIC_LAYOUT_CLASSES.section, 'px-6 py-8 md:px-8')}>
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <span className="public-eyebrow">Tenancy agreement hub</span>
                <h2 className="mt-5 text-3xl font-bold tracking-tight text-[#1c1431]">
                  Start with the England agreement hub
                </h2>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-[#5d5672]">
                  Use the hub to choose between Standard, Premium, Student, HMO /
                  Shared House, and Lodger agreements. Standard and Premium are
                  the current England assured periodic routes from 1 May 2026.
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-[1.8rem] border border-[#ece4ff] bg-white/88 p-6 shadow-[0_18px_40px_rgba(58,28,103,0.08)]">
              <h3 className="text-2xl font-semibold text-[#1d1532]">
                One place to compare the agreement options
              </h3>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-[#5d5672]">
                Most landlords should start at the hub, then open the agreement
                page that fits the property and occupiers. It keeps the Standard,
                Premium, Student, HMO / Shared House, and Lodger routes clear
                without overloading this pricing page.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link href="/products/ast" className="hero-btn-primary text-center">
                  Open tenancy agreement hub
                </Link>
                <Link
                  href="/products/ast"
                  className="hero-btn-secondary text-center"
                >
                  See agreement options
                </Link>
              </div>
            </div>
          </section>

          <section className={clsx(PUBLIC_LAYOUT_CLASSES.section, 'px-6 py-8 md:px-8')}>
            <span className="public-eyebrow">Cost comparison</span>
            <h2 className="mt-5 text-3xl font-bold tracking-tight text-[#1c1431]">
              Why landlords compare this with a solicitor
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[#5d5672]">
              Many landlords still want specialist advice for complex cases.
              Others simply need the first paperwork prepared clearly, quickly,
              and at a known price before deciding whether a solicitor is needed.
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
              'Solicitor pricing is often several hundred pounds per case. Many landlords use Landlord Heaven to get the paperwork started before deciding whether they still need a solicitor.',
          },
          {
            question: 'Can I buy another product later?',
            answer: 'Yes. You can buy another product whenever your situation changes.',
          },
          {
            question: 'Do you list Section 13 pricing here too?',
            answer:
              'Yes. This page includes both the Standard Section 13 Rent Increase Notice and the Challenge Ready Section 13 Defence Pack, using the same central prices as the rest of the site.',
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
              Not sure what you need?
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-lg leading-8 text-white/76">
              Tell us what has happened with the tenancy and we will help you
              narrow down the next step in plain English.
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
