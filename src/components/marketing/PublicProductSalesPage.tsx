import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  ArrowRight,
  BarChart3,
  Check,
  CirclePoundSterling,
  Eye,
  FileText,
  FolderOpen,
  ListChecks,
  LockKeyhole,
  MapPin,
  Scale,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from 'lucide-react';

import { ProductPageTracker } from '@/components/analytics/ProductPageTracker';
import { ProductPrimaryActions } from '@/components/analytics/ProductPrimaryActions';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { getUniversalHeroImageForPath } from '@/config/universal-hero-images';
import { FAQSection } from '@/components/seo/FAQSection';
import { CommercialSeoTrackedCta } from '@/components/seo/CommercialSeoTrackedCta';
import type {
  ProductSalesCard,
  ProductSalesConversionPanel,
  ProductSalesCta,
  ProductSalesDecisionBlock,
  ProductSalesEarlyProofBand,
  ProductSalesObjectionBlock,
  ProductSalesPageContent,
  ProductSalesRouteCard,
} from '@/lib/marketing/product-sales-content';

const conversionFeatureIcons = {
  location: MapPin,
  price: CirclePoundSterling,
  builder: FileText,
  court: ShieldCheck,
  debt: CirclePoundSterling,
  document: FileText,
  folder: FolderOpen,
  hearing: UsersRound,
  scale: Scale,
  chart: BarChart3,
  steps: ListChecks,
  shield: ShieldCheck,
};

function simplifyProductName(fullTitle: string): string {
  // Extract the core product name from full titles like:
  // "Create a Section 8 Eviction Notice and Service File" -> "Section 8 notice"
  // "Increase Rent in England with the Right Section 13 Route" -> "Section 13 route"
  // "Complete Eviction Pack" -> "Complete Pack"
  // "Standard Tenancy Agreement" -> "Standard Agreement"

  const title = fullTitle.trim();

  // Section 13 rent increase routes
  if (title.includes('Section 13') && title.includes('Defensive')) return 'Section 13 defensive route';
  if (title.includes('Section 13') && title.includes('Standard')) return 'Section 13 standard route';
  if (title.includes('Section 13') && title.includes('Route')) return 'Section 13 route';
  if (title.includes('Section 13')) return 'Section 13 route';

  // Section 8/21 notices
  if (title.includes('Section 8') && title.includes('Notice')) return 'Section 8 notice';
  if (title.includes('Section 21') && title.includes('Notice')) return 'Section 21 notice';

  // Tenancy agreements
  if (title.includes('Tenancy Agreement')) {
    if (title.includes('Standard')) return 'Standard Agreement';
    if (title.includes('Premium')) return 'Premium Agreement';
    if (title.includes('Student')) return 'Student Agreement';
    if (title.includes('HMO') || title.includes('Shared House')) return 'HMO Agreement';
    if (title.includes('Lodger')) return 'Lodger Agreement';
    return 'Tenancy Agreement';
  }

  // Packs
  if (title.includes('Complete')) return 'Complete Pack';
  if (title.includes('Court')) return 'Court Pack';
  if (title.includes('Eviction')) return 'Eviction Pack';

  // Money claims
  if (title.includes('Money Claim')) return 'Money Claim';

  // Default fallback
  return title;
}

function SectionShell({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`px-4 py-14 sm:px-6 lg:px-8 ${className}`}>
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}

function SectionHeader({
  title,
  intro,
}: {
  title: string;
  intro?: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <h2 className="text-3xl font-bold tracking-tight text-[#17142B] sm:text-4xl">{title}</h2>
      {intro ? <div className="mt-4 text-lg leading-8 text-[#4B5565]">{intro}</div> : null}
    </div>
  );
}

function CtaButtons({
  primary,
  secondary,
  className = '',
  tracking,
}: {
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
  className?: string;
  tracking?: {
    pagePath: string;
    pageType: string;
    productId: string;
    position: string;
  };
}) {
  return (
    <div className={`flex flex-col gap-3 sm:flex-row sm:items-center ${className}`}>
      <CommercialSeoTrackedCta
        href={primary.href}
        label={primary.label}
        variant="primary"
        sourcePage={tracking?.pagePath}
        pageType={tracking?.pageType}
        intent={tracking?.productId}
        recommendedProduct={tracking?.productId}
        ctaPosition={tracking?.position}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#17142B] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2A2447]"
      >
        {primary.label}
        <ArrowRight aria-hidden="true" className="h-4 w-4" />
      </CommercialSeoTrackedCta>
      {secondary ? (
        <CommercialSeoTrackedCta
          href={secondary.href}
          label={secondary.label}
          variant="secondary"
          sourcePage={tracking?.pagePath}
          pageType={tracking?.pageType}
          intent={tracking?.productId}
          recommendedProduct={tracking?.productId}
          ctaPosition={tracking?.position}
          className="inline-flex items-center justify-center rounded-lg border border-[#D8C8FF] bg-white px-5 py-3 text-sm font-semibold text-[#17142B] shadow-sm transition hover:border-[#BDA5F7]"
        >
          {secondary.label}
        </CommercialSeoTrackedCta>
      ) : null}
    </div>
  );
}

function SmartImage({
  src,
  alt,
  className = '',
  sizes = '(min-width: 1024px) 33vw, 100vw',
  fit = 'cover',
}: {
  src?: string;
  alt?: string;
  className?: string;
  sizes?: string;
  fit?: 'cover' | 'contain';
}) {
  if (!src) return null;

  return (
    <div className={`relative overflow-hidden rounded-lg bg-[#F7F4FF] ${className}`}>
      <Image
        src={src}
        alt={alt || ''}
        fill
        sizes={sizes}
        className={fit === 'contain' ? 'object-contain p-4 sm:p-6' : 'object-cover'}
      />
    </div>
  );
}

function ProductConversionPanel({
  panel,
  priceLabel,
  includedBullets,
  primaryCta,
  tracking,
}: {
  panel: ProductSalesConversionPanel;
  priceLabel?: string;
  includedBullets: string[];
  primaryCta: { label: string; href: string };
  tracking?: {
    pagePath: string;
    pageType: string;
    productId: string;
  };
}) {
  return (
    <div className="mx-auto grid max-w-[94rem] gap-5 lg:grid-cols-2 lg:items-stretch">
      <div className="relative isolate overflow-hidden rounded-[1.75rem] bg-[radial-gradient(circle_at_88%_18%,rgba(146,84,255,0.42),transparent_30%),linear-gradient(145deg,#351064_0%,#211044_100%)] px-5 py-7 text-white shadow-[0_24px_65px_rgba(43,23,75,0.20)] sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute -right-4 top-3 -z-0 h-36 w-36 opacity-95 sm:right-3 sm:top-4 sm:h-48 sm:w-48">
          <Image src={panel.artworkSrc} alt={panel.artworkAlt} fill sizes="192px" className="object-contain" />
        </div>
        <div className="relative z-10 max-w-[72%] sm:max-w-[62%]">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#CBB7FF]">{panel.eyebrow}</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">{panel.productName}</h2>
        </div>
        <div className="relative z-10 mt-5 max-w-xl">
          <p className="text-xl font-bold leading-snug sm:text-2xl">{panel.decisionTitle}</p>
          <p className="mt-3 text-base leading-7 text-white/85">{panel.decisionBody}</p>
        </div>

        <div className="relative z-10 mt-6 grid gap-3 sm:grid-cols-3">
          {panel.features.map((feature) => {
            const Icon = conversionFeatureIcons[feature.icon];
            return (
              <div key={feature.title} className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/[0.07] p-3.5 backdrop-blur-sm">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#A56BFF] to-[#6D28D9] shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
                  <Icon aria-hidden="true" className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <strong className="block text-sm font-semibold leading-5 text-white">{feature.title}</strong>
                  <span className="block text-xs leading-5 text-white/65">{feature.body}</span>
                </span>
              </div>
            );
          })}
        </div>

        <CommercialSeoTrackedCta
          href={primaryCta.href}
          label={primaryCta.label}
          variant="primary"
          sourcePage={tracking?.pagePath}
          pageType={tracking?.pageType}
          intent={tracking?.productId}
          recommendedProduct={tracking?.productId}
          ctaPosition="decision_panel"
          className="relative z-10 mt-5 inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#A855F7] via-[#8B5CF6] to-[#7C3AED] px-5 py-4 text-base font-bold text-white shadow-[0_14px_30px_rgba(124,58,237,0.35)] transition hover:-translate-y-0.5 hover:brightness-110 sm:text-lg"
        >
          <Sparkles aria-hidden="true" className="h-5 w-5" />
          {primaryCta.label}
          <ArrowRight aria-hidden="true" className="h-5 w-5" />
        </CommercialSeoTrackedCta>
        <p className="relative z-10 mt-3 text-center text-xs leading-5 text-white/60">
          Answer a few questions, review your documents, then continue to payment.
        </p>
      </div>

      <div className="flex flex-col rounded-[1.75rem] border border-[#E8E1F8] bg-white p-5 text-left text-[#34245D] shadow-[0_24px_65px_rgba(41,25,78,0.10)] sm:p-8">
        <div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#5E498E]">Our price</p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-[#26118A] sm:text-4xl">
              Fixed price {priceLabel || 'shown before you start'}
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-[#F3EDFF] px-4 py-3 text-sm leading-5 text-[#4C1DCA] sm:max-w-56">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/70">
              <Eye aria-hidden="true" className="h-5 w-5" />
            </span>
            <span>{panel.previewText}</span>
          </div>
        </div>

        <div className="my-5 h-px bg-[#E8E1F8]" />
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#5E498E]">What&apos;s included</p>
        <ul className="mt-4 space-y-3.5 text-base leading-6 text-[#34245D]">
          {includedBullets.map((item) => (
            <li key={item} className="flex gap-3">
              <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#7C3AED] text-white shadow-[0_4px_12px_rgba(124,58,237,0.25)]">
                <Check aria-hidden="true" className="h-4 w-4" />
              </span>
              <span>{item}</span>
            </li>
          ))}
          <li className="flex gap-3">
            <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#7C3AED] text-white shadow-[0_4px_12px_rgba(124,58,237,0.25)]">
              <Check aria-hidden="true" className="h-4 w-4" />
            </span>
            <span>Guided questions, an output review, then payment when you are ready to continue</span>
          </li>
        </ul>

        <div className="mt-auto pt-5">
          <div className="flex gap-3 rounded-2xl border border-[#DED0FF] bg-[#F7F2FF] p-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-[#6D28D9] shadow-sm">
              <ShieldCheck aria-hidden="true" className="h-5 w-5" />
            </span>
            <span>
              <strong className="block text-sm font-bold text-[#26118A]">{panel.reassuranceTitle}</strong>
              <span className="mt-0.5 block text-sm leading-5 text-[#6B54A3]">{panel.reassuranceBody}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function EarlyProofBand({ proof }: { proof: ProductSalesEarlyProofBand }) {
  return (
    <SectionShell className="bg-white">
      <div
        className={`grid gap-8 rounded-lg border border-[#E8E1F8] bg-[#FCFAFF] p-6 shadow-sm ${
          proof.fullWidthPreview ? '' : 'lg:grid-cols-[1.1fr_0.9fr] lg:items-center'
        }`}
      >
        <div className={proof.mobileImageFirstFullBleed ? 'lg:order-1' : ''}>
          {proof.priceLabel ? (
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#6D28D9]">
              {proof.priceLabel}
            </p>
          ) : null}
          {proof.valueSummary ? (
            <div className="mt-3 text-lg leading-8 text-[#374151]">{proof.valueSummary}</div>
          ) : null}
          {proof.includedBullets && proof.includedBullets.length > 0 ? (
            <ul className="mt-5 grid gap-3 text-sm text-[#374151] sm:grid-cols-2">
              {proof.includedBullets.map((item) => (
                <li key={item} className="flex gap-2">
                  <Check aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-[#16A34A]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : null}
          {proof.bestFor || proof.notFor ? (
            <div className="mt-5 grid gap-3 text-sm text-[#4B5565] sm:grid-cols-2">
              {proof.bestFor ? <p><strong className="text-[#17142B]">Best for:</strong> {proof.bestFor}</p> : null}
              {proof.notFor ? <p><strong className="text-[#17142B]">Not for:</strong> {proof.notFor}</p> : null}
            </div>
          ) : null}
        </div>
        {proof.preview ? <div>{proof.preview}</div> : null}
        {!proof.preview && proof.imageSrc ? (
          proof.imageHref ? (
            <Link href={proof.imageHref} className="block">
              <SmartImage src={proof.imageSrc} alt={proof.imageAlt} className="aspect-[4/3]" />
            </Link>
          ) : (
            <SmartImage src={proof.imageSrc} alt={proof.imageAlt} className="aspect-[4/3]" />
          )
        ) : null}
      </div>
    </SectionShell>
  );
}

function RouteCard({
  card,
  tracking,
}: {
  card: ProductSalesRouteCard;
  tracking?: { pagePath: string; pageType: string; productId: string };
}) {
  return (
    <article className="flex h-full flex-col rounded-lg border border-[#E8E1F8] bg-white shadow-sm">
      <SmartImage src={card.imageSrc} alt={card.imageAlt} className="aspect-[16/10] rounded-b-none" />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-xl font-bold tracking-tight text-[#17142B]">{card.name}</h3>
          {card.priceLabel ? (
            <span className="rounded-md bg-[#F4F0FF] px-2.5 py-1 text-xs font-semibold text-[#5B21B6]">
              {card.priceLabel}
            </span>
          ) : null}
        </div>
        <p className="mt-3 text-sm leading-6 text-[#4B5565]">{card.whatItIs}</p>
        <dl className="mt-4 space-y-3 text-sm leading-6 text-[#4B5565]">
          <div>
            <dt className="font-semibold text-[#17142B]">Problem it solves</dt>
            <dd>{card.problemItSolves}</dd>
          </div>
          <div>
            <dt className="font-semibold text-[#17142B]">Risk if wrong</dt>
            <dd>{card.riskIfWrong}</dd>
          </div>
          <div>
            <dt className="font-semibold text-[#17142B]">Landlord outcome</dt>
            <dd>{card.landlordOutcome}</dd>
          </div>
        </dl>
        <CommercialSeoTrackedCta
          href={card.href}
          label={card.ctaLabel}
          variant="primary"
          sourcePage={tracking?.pagePath}
          pageType={tracking?.pageType}
          intent={tracking?.productId}
          ctaPosition="route_card"
          className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#5B21B6] hover:text-[#3B168C]"
        >
          {card.ctaLabel}
          <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </CommercialSeoTrackedCta>
      </div>
    </article>
  );
}

function ComparisonBlock({
  block,
  tracking,
}: {
  block: NonNullable<ProductSalesPageContent['comparisonBlock']>;
  tracking?: { pagePath: string; pageType: string; productId: string };
}) {
  return (
    <SectionShell className="bg-[#FCFAFF]">
      <SectionHeader title={block.title || 'Compare the options'} intro={block.intro} />
      <div className={`mt-10 grid gap-5 md:grid-cols-2 ${block.routeGridClassName || ''}`}>
        {block.routeCards.map((card) => (
          <RouteCard key={card.name} card={card} tracking={tracking} />
        ))}
      </div>
    </SectionShell>
  );
}

function BreakdownList({
  whatYouGet,
  tracking,
}: {
  whatYouGet: ProductSalesPageContent['whatYouGet'];
  tracking?: { pagePath: string; pageType: string; productId: string };
}) {
  if (whatYouGet.hideSection) return null;

  return (
    <SectionShell className="bg-white">
      <SectionHeader title={whatYouGet.title} intro={whatYouGet.intro} />
      {whatYouGet.preview ? <div className="mt-8">{whatYouGet.preview}</div> : null}
      {whatYouGet.sampleProof ? <div>{whatYouGet.sampleProof}</div> : null}
      {whatYouGet.items && whatYouGet.items.length > 0 ? (
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {whatYouGet.items.map((item) => (
            <article
              key={item.name}
              className={`overflow-hidden rounded-2xl border border-[#E8E1F8] bg-white shadow-[0_14px_34px_rgba(41,25,78,0.07)] ${
                item.imageSrc ? 'sm:grid sm:grid-cols-[minmax(0,1fr)_13rem]' : ''
              }`}
            >
              <div className="p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-lg font-bold leading-snug text-[#17142B]">{item.name}</h3>
                  <span className="shrink-0 rounded-md bg-[#F4F0FF] px-2.5 py-1 text-xs font-semibold text-[#5B21B6]">
                    {item.includedByDefault ? 'Included' : item.conditionalLabel || 'Conditional'}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-[#4B5565]">{item.plainEnglish}</p>
                <dl className="mt-4 space-y-3 text-sm leading-6 text-[#4B5565]">
                  <div>
                    <dt className="font-semibold text-[#17142B]">Why it matters</dt>
                    <dd>{item.function}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-[#17142B]">What can go wrong</dt>
                    <dd>{item.riskIfMissing}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-[#17142B]">What it gives you</dt>
                    <dd>{item.landlordOutcome}</dd>
                  </div>
                </dl>
              </div>
              {item.imageSrc ? (
                <div className="relative aspect-[4/3] overflow-hidden border-t border-[#EEE8FA] bg-[#F6F0FF] sm:aspect-auto sm:min-h-full sm:border-l sm:border-t-0">
                  <Image
                    src={item.imageSrc}
                    alt={item.imageAlt || ''}
                    fill
                    sizes="(max-width: 639px) 100vw, 208px"
                    className="object-cover object-center"
                  />
                </div>
              ) : null}
            </article>
          ))}
        </div>
      ) : null}
      {whatYouGet.routeCards && whatYouGet.routeCards.length > 0 ? (
        <div className={`mt-10 grid gap-5 md:grid-cols-2 ${whatYouGet.routeGridClassName || ''}`}>
          {whatYouGet.routeCards.map((card) => (
            <RouteCard key={card.name} card={card} tracking={tracking} />
          ))}
        </div>
      ) : null}
      {whatYouGet.conditionalItems && whatYouGet.conditionalItems.length > 0 ? (
        <div className="mt-12">
          {whatYouGet.conditionalTitle ? (
            <h3 className="text-2xl font-bold tracking-tight text-[#17142B]">{whatYouGet.conditionalTitle}</h3>
          ) : null}
          {whatYouGet.conditionalIntro ? (
            <div className="mt-3 max-w-3xl text-base leading-7 text-[#4B5565]">{whatYouGet.conditionalIntro}</div>
          ) : null}
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {whatYouGet.conditionalItems.map((item) => (
              <article key={item.name} className="rounded-lg border border-[#E8E1F8] bg-[#FCFAFF] p-5">
                <h4 className="text-lg font-bold text-[#17142B]">{item.name}</h4>
                <p className="mt-3 text-sm leading-6 text-[#4B5565]">{item.plainEnglish}</p>
              </article>
            ))}
          </div>
        </div>
      ) : null}
    </SectionShell>
  );
}

function CardGrid({
  title,
  intro,
  cards,
  className = 'bg-[#FCFAFF]',
}: {
  title: string;
  intro: ReactNode;
  cards: ProductSalesCard[];
  className?: string;
}) {
  return (
    <SectionShell className={className}>
      <SectionHeader title={title} intro={intro} />
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {cards.map((card) => (
          <article key={card.title} className="rounded-lg border border-[#E8E1F8] bg-white p-5 shadow-sm">
            <SmartImage src={card.imageSrc} alt={card.imageAlt} className="mb-5 aspect-[16/10]" />
            <h3 className="text-lg font-bold text-[#17142B]">{card.title}</h3>
            <p className="mt-3 text-sm leading-6 text-[#4B5565]">{card.body}</p>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}

function DecisionBlock({
  block,
  tracking,
}: {
  block: ProductSalesDecisionBlock;
  tracking?: { pagePath: string; pageType: string; productId: string; position: string };
}) {
  const toneClasses = {
    positive: 'border-[#BBF7D0] bg-[#F0FDF4]',
    warning: 'border-[#FED7AA] bg-[#FFF7ED]',
    neutral: 'border-[#E8E1F8] bg-white',
  };

  return (
    <SectionShell className="bg-white">
      <SectionHeader title={block.title} intro={block.intro} />
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {block.cards.map((card) => (
          <article
            key={card.title}
            className={`rounded-lg border p-5 shadow-sm ${toneClasses[card.tone || 'neutral']}`}
          >
            {card.eyebrow ? (
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6D28D9]">{card.eyebrow}</p>
            ) : null}
            <h3 className="mt-2 text-lg font-bold text-[#17142B]">{card.title}</h3>
            <p className="mt-3 text-sm leading-6 text-[#4B5565]">{card.body}</p>
          </article>
        ))}
      </div>
      {block.primary ? (
        <CtaButtons
          primary={block.primary}
          secondary={block.secondary}
          className="mt-8 justify-center"
          tracking={tracking}
        />
      ) : null}
    </SectionShell>
  );
}

function ObjectionBlock({ block }: { block: ProductSalesObjectionBlock }) {
  return (
    <SectionShell className="bg-white">
      <SectionHeader title={block.title} intro={block.intro} />
      <div className="mx-auto mt-10 max-w-6xl divide-y divide-[#E8E1F8] rounded-2xl border border-[#E8E1F8] bg-white shadow-sm">
        {block.items.map((item) => (
          <article key={item.question} className="p-5">
            <h3 className="text-lg font-bold text-[#17142B]">{item.question}</h3>
            <div className="mt-2 text-sm leading-6 text-[#4B5565]">{item.answer}</div>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}

function HowItWorks({ content }: { content: ProductSalesPageContent['howItWorks'] }) {
  const image = content.imageSrc ? (
    content.imageHref ? (
      <Link
        href={content.imageHref}
        className={`${content.mobileImageFirstFullBleed ? 'order-first lg:order-none' : ''} ${
          content.alignImageToSteps ? 'block h-full' : ''
        }`}
      >
        <SmartImage
          src={content.imageSrc}
          alt={content.imageAlt}
          className={content.alignImageToSteps ? 'h-full min-h-[28rem]' : 'aspect-[4/3]'}
          sizes="(min-width: 1024px) 50vw, 100vw"
          fit={content.alignImageToSteps ? 'contain' : 'cover'}
        />
      </Link>
    ) : (
      <SmartImage
        src={content.imageSrc}
        alt={content.imageAlt}
        className={content.alignImageToSteps ? 'h-full min-h-[28rem]' : 'aspect-[4/3]'}
        sizes="(min-width: 1024px) 50vw, 100vw"
        fit={content.alignImageToSteps ? 'contain' : 'cover'}
      />
    )
  ) : null;

  if (content.alignImageToSteps) {
    return (
      <SectionShell className="bg-white">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-bold tracking-tight text-[#17142B] sm:text-4xl">{content.title}</h2>
          <div className="mt-4 text-lg leading-8 text-[#4B5565]">{content.intro}</div>
        </div>
        <div className="mt-8 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch">
          <ol className="space-y-4">
            {content.steps.map((step) => (
              <li key={step.step} className="rounded-xl border border-[#E8E1F8] bg-[#FCFAFF] p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#6D28D9]">{step.step}</p>
                <h3 className="mt-2 text-lg font-bold text-[#17142B]">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#4B5565]">{step.body}</p>
              </li>
            ))}
          </ol>
          {image}
        </div>
      </SectionShell>
    );
  }

  return (
    <SectionShell className="bg-white">
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-[#17142B] sm:text-4xl">{content.title}</h2>
          <div className="mt-4 text-lg leading-8 text-[#4B5565]">{content.intro}</div>
          <ol className="mt-8 space-y-4">
            {content.steps.map((step) => (
              <li key={step.step} className="rounded-lg border border-[#E8E1F8] bg-[#FCFAFF] p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#6D28D9]">{step.step}</p>
                <h3 className="mt-2 text-lg font-bold text-[#17142B]">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#4B5565]">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
        {image}
      </div>
    </SectionShell>
  );
}

function CtaBand({
  cta,
  tracking,
}: {
  cta: ProductSalesCta;
  tracking?: { pagePath: string; pageType: string; productId: string; position: string };
}) {
  if (cta.visual) {
    const highlightIndex = cta.title.indexOf(cta.visual.highlightedText);
    const titleLead = highlightIndex >= 0 ? cta.title.slice(0, highlightIndex).trim() : cta.title;
    const titleHighlight = highlightIndex >= 0 ? cta.visual.highlightedText : '';

    return (
      <section
        className="relative overflow-hidden border-y border-[#E8E1F8] bg-[radial-gradient(circle_at_78%_42%,rgba(176,132,255,0.28),transparent_30%),linear-gradient(135deg,#FFFFFF_0%,#F6F1FF_55%,#EEE7FF_100%)] px-4 py-12 sm:px-6 lg:px-8 lg:py-16"
        data-visual-cta
      >
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(145deg,transparent_0%,transparent_48%,rgba(255,255,255,0.45)_48%,rgba(255,255,255,0.45)_62%,transparent_62%)] opacity-50" />
        <div className="relative mx-auto grid max-w-[94rem] gap-10 lg:grid-cols-[1fr_1.05fr] lg:items-center">
          <div>
            <p className="inline-flex rounded-full bg-[#EEE7FF] px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#6D28D9]">
              {cta.visual.eyebrow}
            </p>
            <h2 className="mt-5 text-4xl font-bold tracking-tight text-[#11102A] sm:text-5xl lg:text-[3.35rem] lg:leading-[1.04]">
              <span className="block">{titleLead}</span>
              {' '}
              {titleHighlight ? <span className="block text-[#6D28D9]">{titleHighlight}</span> : null}
            </h2>
            <div className="mt-5 max-w-3xl text-lg leading-8 text-[#536078]">{cta.body}</div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {cta.visual.features.map((feature) => {
                const Icon = conversionFeatureIcons[feature.icon];
                return (
                  <div key={feature.title} className="flex min-h-20 items-center gap-3 rounded-2xl border border-white/80 bg-white/55 p-3.5 shadow-[0_10px_30px_rgba(83,49,138,0.06)] backdrop-blur-sm">
                    <Icon aria-hidden="true" className="h-7 w-7 shrink-0 text-[#6D28D9]" />
                    <span>
                      <strong className="block text-sm font-bold leading-5 text-[#17142B]">{feature.title}</strong>
                      <span className="block text-xs leading-5 text-[#5E6A80]">{feature.body}</span>
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <CommercialSeoTrackedCta
                href={cta.primary.href}
                label={cta.primary.label}
                variant="primary"
                sourcePage={tracking?.pagePath}
                pageType={tracking?.pageType}
                intent={tracking?.productId}
                recommendedProduct={tracking?.productId}
                ctaPosition={tracking?.position}
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#5B21B6] to-[#7C3AED] px-5 py-3 text-center text-sm font-bold text-white shadow-[0_14px_30px_rgba(91,33,182,0.24)] transition hover:-translate-y-0.5 hover:brightness-110"
              >
                {cta.primary.label}
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </CommercialSeoTrackedCta>
              {cta.secondary ? (
                <CommercialSeoTrackedCta
                  href={cta.secondary.href}
                  label={cta.secondary.label}
                  variant="secondary"
                  sourcePage={tracking?.pagePath}
                  pageType={tracking?.pageType}
                  intent={tracking?.productId}
                  recommendedProduct={tracking?.productId}
                  ctaPosition={tracking?.position}
                  className="inline-flex min-h-14 items-center justify-center rounded-xl border-2 border-[#7C3AED] bg-white/80 px-5 py-3 text-center text-sm font-bold text-[#6D28D9] transition hover:-translate-y-0.5 hover:bg-white"
                >
                  {cta.secondary.label}
                </CommercialSeoTrackedCta>
              ) : null}
            </div>
            <p className="mt-4 flex items-center gap-2 text-sm leading-6 text-[#536078]">
              <LockKeyhole aria-hidden="true" className="h-4 w-4 shrink-0" />
              Answer a few questions, preview the output where available, then continue to payment.
            </p>
            {cta.guideLinks && cta.guideLinks.length > 0 ? (
              <div className="mt-5 flex flex-wrap gap-x-0 gap-y-2 text-sm font-semibold text-[#6D28D9]">
                {cta.guideLinks.map((link, index) => (
                  <span key={link.href} className="flex items-center">
                    {index > 0 ? <span aria-hidden="true" className="mx-3 text-[#A996D5]">|</span> : null}
                    <Link href={link.href} className="hover:text-[#4C1D95] hover:underline">
                      {link.label}
                    </Link>
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <div className="relative min-h-[24rem] sm:min-h-[30rem]">
            <Image
              src={cta.visual.artworkSrc}
              alt={cta.visual.artworkAlt}
              fill
              unoptimized
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-contain object-center"
            />
            <div className="absolute inset-x-4 bottom-0 mx-auto flex max-w-xl items-center gap-4 rounded-2xl border border-[#D7C7FF] bg-white/80 p-5 text-left shadow-[0_18px_50px_rgba(91,33,182,0.14)] backdrop-blur-md sm:inset-x-10">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#5B21B6] text-white shadow-lg">
                <ShieldCheck aria-hidden="true" className="h-8 w-8" />
              </span>
              <span>
                <strong className="block text-base font-bold text-[#5B21B6]">{cta.visual.reassuranceTitle}</strong>
                <span className="mt-1 block text-sm leading-5 text-[#38455D]">{cta.visual.reassuranceBody}</span>
              </span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <SectionShell className="bg-[#17142B]">
      <div className="mx-auto max-w-3xl text-center text-white">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{cta.title}</h2>
        <div className="mt-4 text-lg leading-8 text-white/80">{cta.body}</div>
        <CtaButtons
          primary={cta.primary}
          secondary={cta.secondary}
          className="mt-8 justify-center"
          tracking={tracking}
        />
        {cta.guideLinks && cta.guideLinks.length > 0 ? (
          <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm">
            {cta.guideLinks.map((link) => (
              <Link key={link.href} href={link.href} className="font-semibold text-white/80 hover:text-white">
                {link.label}
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </SectionShell>
  );
}

function ProductRationaleSummary({ content }: { content: ProductSalesPageContent }) {
  return (
    <SectionShell className="bg-[#FCFAFF] py-8 sm:py-10">
      <details className="rounded-2xl border border-[#E8E1F8] bg-white p-5 shadow-sm sm:p-6">
        <summary className="cursor-pointer text-lg font-bold text-[#17142B]">
          Why this product and how it helps
        </summary>
        <div className="mt-6 grid gap-8 lg:grid-cols-2">
          {[content.whyYouNeedThis, content.howThisHelps].map((section) => (
            <div key={section.title}>
              <h2 className="text-xl font-bold text-[#17142B]">{section.title}</h2>
              <div className="mt-2 text-sm leading-6 text-[#4B5565]">{section.intro}</div>
              <ul className="mt-4 space-y-3">
                {section.cards.map((card) => (
                  <li key={card.title} className="rounded-xl bg-[#FCFAFF] p-4 text-sm leading-6 text-[#4B5565]">
                    <strong className="block text-[#17142B]">{card.title}</strong>
                    {card.body}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </details>
    </SectionShell>
  );
}

export function PublicProductSalesPage({ content }: { content: ProductSalesPageContent }) {
  const analytics = content.analytics;
  const productName = simplifyProductName(
    [content.hero.title, content.hero.highlightTitle].filter(Boolean).join(' '),
  );
  const productId = analytics?.routeIntent || analytics?.pagePath?.split('/').filter(Boolean).at(-1) || productName;
  const priceLabel = content.earlyProofBand?.priceLabel;
  const shouldShowMidPageCta = analytics?.pageType !== 'product_page' && Boolean(content.midPageCta);
  const tracking = analytics
    ? { pagePath: analytics.pagePath, pageType: analytics.pageType, productId }
    : undefined;

  return (
    <>
      {analytics?.pageType === 'product_page' ? (
        <ProductPageTracker
          pagePath={analytics.pagePath}
          productId={productId}
          productName={productName}
          routeIntent={analytics.routeIntent}
          priceLabel={priceLabel}
        />
      ) : null}

      <UniversalHero
        {...content.hero}
        variant="pastel"
        backgroundImageSrc={content.hero.backgroundImageSrc ?? getUniversalHeroImageForPath(analytics?.pagePath ?? '')}
        hideMedia
        primaryCta={analytics?.pageType === 'product_page' ? undefined : content.hero.primaryCta}
        secondaryCta={analytics?.pageType === 'product_page' ? undefined : content.hero.secondaryCta}
        showTrustPositioningBar={
          analytics?.pageType === 'product_page' ? false : content.hero.showTrustPositioningBar
        }
        showUsageCounter={
          analytics?.pageType === 'product_page' ? false : content.hero.showUsageCounter
        }
        actionsSlot={
          analytics?.pageType === 'product_page' && content.hero.primaryCta ? (
            <ProductPrimaryActions
              pagePath={analytics.pagePath}
              productSlug={productId}
              price={priceLabel}
              primary={content.hero.primaryCta}
              secondary={content.hero.secondaryCta}
            />
          ) : content.hero.actionsSlot
        }
      >
        {analytics?.pageType === 'product_page' ? null : content.hero.children}
      </UniversalHero>

      {analytics?.pageType === 'product_page' && content.showProductDecisionDetails !== false ? (
        <section
          className="border-b border-[#E8E1F8] bg-[linear-gradient(180deg,#FCFAFF_0%,#FFFFFF_100%)] px-4 py-6 sm:px-6 sm:py-9"
          data-product-decision-details
        >
          {content.conversionPanel && content.hero.primaryCta ? (
            <ProductConversionPanel
              panel={content.conversionPanel}
              priceLabel={priceLabel}
              includedBullets={content.earlyProofBand?.includedBullets?.slice(0, 3) || []}
              primaryCta={content.hero.primaryCta}
              tracking={tracking}
            />
          ) : (
            <div className="mx-auto grid max-w-6xl gap-4 lg:grid-cols-2">
              {content.hero.children ? (
                <div className="rounded-2xl bg-[#2B174B] p-4 [&>div]:mt-0">
                  {content.hero.children}
                </div>
              ) : null}
              <div className="rounded-2xl border border-[#E8E1F8] bg-[#FCFAFF] p-4 text-left text-sm text-[#34245D]">
                <p className="font-semibold">
                  Fixed price {priceLabel || 'shown before you start'}.
                  {' '}Preview {content.earlyProofBand ? 'available before payment where shown.' : 'details are shown before payment.'}
                </p>
                {content.earlyProofBand?.includedBullets?.length ? (
                  <ul className="mt-2 grid gap-1 sm:grid-cols-2">
                    {content.earlyProofBand.includedBullets.slice(0, 3).map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                ) : null}
                <p className="mt-2 text-[#5E498E]">
                  Start the guided builder, answer the suitability questions, review the generated output,
                  then continue to payment.
                </p>
              </div>
            </div>
          )}
        </section>
      ) : null}

      {content.earlyDecisionContent ? (
        <SectionShell className="bg-[#FCFAFF] py-8 sm:py-10">
          {content.earlyDecisionContent}
        </SectionShell>
      ) : null}

      {content.earlyProofBand ? <EarlyProofBand proof={content.earlyProofBand} /> : null}
      {content.decisionBlock ? (
        <DecisionBlock
          block={content.decisionBlock}
          tracking={tracking ? { ...tracking, position: 'selector' } : undefined}
        />
      ) : null}
      <BreakdownList whatYouGet={content.whatYouGet} tracking={tracking} />
      {content.postHeroContent ? (
        <SectionShell className="bg-white">{content.postHeroContent}</SectionShell>
      ) : null}
      {content.afterPostHeroContent ? <div>{content.afterPostHeroContent}</div> : null}
      {content.comparisonBlock ? <ComparisonBlock block={content.comparisonBlock} tracking={tracking} /> : null}
      {content.objectionBlock ? <ObjectionBlock block={content.objectionBlock} /> : null}
      {shouldShowMidPageCta && content.midPageCta ? (
        <CtaBand
          cta={content.midPageCta}
          tracking={tracking ? { ...tracking, position: 'mid' } : undefined}
        />
      ) : null}
      {content.beforeWhyYouNeedThis ? <div>{content.beforeWhyYouNeedThis}</div> : null}
      {analytics?.pageType === 'product_page' ? (
        <ProductRationaleSummary content={content} />
      ) : (
        <>
          <CardGrid
            title={content.whyYouNeedThis.title}
            intro={content.whyYouNeedThis.intro}
            cards={content.whyYouNeedThis.cards}
          />
          <CardGrid
            title={content.howThisHelps.title}
            intro={content.howThisHelps.intro}
            cards={content.howThisHelps.cards}
            className="bg-white"
          />
        </>
      )}
      <HowItWorks content={content.howItWorks} />
      <CtaBand
        cta={content.cta}
        tracking={tracking ? { ...tracking, position: 'final' } : undefined}
      />
      <FAQSection
        title={content.faq.title}
        faqs={content.faq.items}
        includeSchema={content.faq.includeSchema}
        showContactCTA={false}
      />
    </>
  );
}
