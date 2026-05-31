import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { RiArrowRightLine, RiCheckLine } from 'react-icons/ri';

import { ProductPageTracker } from '@/components/analytics/ProductPageTracker';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { FAQSection } from '@/components/seo/FAQSection';
import type {
  ProductSalesCard,
  ProductSalesCta,
  ProductSalesDecisionBlock,
  ProductSalesEarlyProofBand,
  ProductSalesObjectionBlock,
  ProductSalesPageContent,
  ProductSalesRouteCard,
} from '@/lib/marketing/product-sales-content';

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
}: {
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-3 sm:flex-row sm:items-center ${className}`}>
      <Link
        href={primary.href}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#17142B] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2A2447]"
      >
        {primary.label}
        <RiArrowRightLine aria-hidden="true" className="h-4 w-4" />
      </Link>
      {secondary ? (
        <Link
          href={secondary.href}
          className="inline-flex items-center justify-center rounded-lg border border-[#D8C8FF] bg-white px-5 py-3 text-sm font-semibold text-[#17142B] shadow-sm transition hover:border-[#BDA5F7]"
        >
          {secondary.label}
        </Link>
      ) : null}
    </div>
  );
}

function SmartImage({
  src,
  alt,
  className = '',
  sizes = '(min-width: 1024px) 33vw, 100vw',
}: {
  src?: string;
  alt?: string;
  className?: string;
  sizes?: string;
}) {
  if (!src) return null;

  return (
    <div className={`relative overflow-hidden rounded-lg bg-[#F7F4FF] ${className}`}>
      <Image src={src} alt={alt || ''} fill sizes={sizes} className="object-cover" />
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
                  <RiCheckLine aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-[#16A34A]" />
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

function RouteCard({ card }: { card: ProductSalesRouteCard }) {
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
        <Link
          href={card.href}
          className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#5B21B6] hover:text-[#3B168C]"
        >
          {card.ctaLabel}
          <RiArrowRightLine aria-hidden="true" className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}

function ComparisonBlock({ block }: { block: NonNullable<ProductSalesPageContent['comparisonBlock']> }) {
  return (
    <SectionShell className="bg-[#FCFAFF]">
      <SectionHeader title={block.title || 'Compare the options'} intro={block.intro} />
      <div className={`mt-10 grid gap-5 md:grid-cols-2 ${block.routeGridClassName || ''}`}>
        {block.routeCards.map((card) => (
          <RouteCard key={card.name} card={card} />
        ))}
      </div>
    </SectionShell>
  );
}

function BreakdownList({ whatYouGet }: { whatYouGet: ProductSalesPageContent['whatYouGet'] }) {
  if (whatYouGet.hideSection) return null;

  return (
    <SectionShell className="bg-white">
      <SectionHeader title={whatYouGet.title} intro={whatYouGet.intro} />
      {whatYouGet.preview ? <div className="mt-8">{whatYouGet.preview}</div> : null}
      {whatYouGet.sampleProof ? <div>{whatYouGet.sampleProof}</div> : null}
      {whatYouGet.items && whatYouGet.items.length > 0 ? (
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {whatYouGet.items.map((item) => (
            <article key={item.name} className="rounded-lg border border-[#E8E1F8] bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-lg font-bold text-[#17142B]">{item.name}</h3>
                <span className="rounded-md bg-[#F4F0FF] px-2.5 py-1 text-xs font-semibold text-[#5B21B6]">
                  {item.includedByDefault ? 'Included' : item.conditionalLabel || 'Conditional'}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-[#4B5565]">{item.plainEnglish}</p>
              <dl className="mt-4 space-y-3 text-sm leading-6 text-[#4B5565]">
                <div>
                  <dt className="font-semibold text-[#17142B]">Function</dt>
                  <dd>{item.function}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-[#17142B]">Risk if missing</dt>
                  <dd>{item.riskIfMissing}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-[#17142B]">Landlord outcome</dt>
                  <dd>{item.landlordOutcome}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      ) : null}
      {whatYouGet.routeCards && whatYouGet.routeCards.length > 0 ? (
        <div className={`mt-10 grid gap-5 md:grid-cols-2 ${whatYouGet.routeGridClassName || ''}`}>
          {whatYouGet.routeCards.map((card) => (
            <RouteCard key={card.name} card={card} />
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

function DecisionBlock({ block }: { block: ProductSalesDecisionBlock }) {
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
      {block.primary ? <CtaButtons primary={block.primary} secondary={block.secondary} className="mt-8 justify-center" /> : null}
    </SectionShell>
  );
}

function ObjectionBlock({ block }: { block: ProductSalesObjectionBlock }) {
  return (
    <SectionShell className="bg-white">
      <SectionHeader title={block.title} intro={block.intro} />
      <div className="mx-auto mt-10 max-w-4xl divide-y divide-[#E8E1F8] rounded-lg border border-[#E8E1F8] bg-white">
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
        {content.imageSrc ? (
          content.imageHref ? (
            <Link href={content.imageHref} className={content.mobileImageFirstFullBleed ? 'order-first lg:order-none' : ''}>
              <SmartImage src={content.imageSrc} alt={content.imageAlt} className="aspect-[4/3]" sizes="(min-width: 1024px) 50vw, 100vw" />
            </Link>
          ) : (
            <SmartImage src={content.imageSrc} alt={content.imageAlt} className="aspect-[4/3]" sizes="(min-width: 1024px) 50vw, 100vw" />
          )
        ) : null}
      </div>
    </SectionShell>
  );
}

function CtaBand({ cta }: { cta: ProductSalesCta }) {
  return (
    <SectionShell className="bg-[#17142B]">
      <div className="mx-auto max-w-3xl text-center text-white">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{cta.title}</h2>
        <div className="mt-4 text-lg leading-8 text-white/80">{cta.body}</div>
        <CtaButtons primary={cta.primary} secondary={cta.secondary} className="mt-8 justify-center" />
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

export function PublicProductSalesPage({ content }: { content: ProductSalesPageContent }) {
  const analytics = content.analytics;
  const productName = simplifyProductName(
    [content.hero.title, content.hero.highlightTitle].filter(Boolean).join(' '),
  );
  const productId = analytics?.routeIntent || analytics?.pagePath?.split('/').filter(Boolean).at(-1) || productName;
  const priceLabel = content.earlyProofBand?.priceLabel;

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

      <UniversalHero {...content.hero} />

      {content.postHeroContent ? (
        <SectionShell className="bg-white">{content.postHeroContent}</SectionShell>
      ) : null}
      {content.afterPostHeroContent ? <div>{content.afterPostHeroContent}</div> : null}
      {content.earlyProofBand ? <EarlyProofBand proof={content.earlyProofBand} /> : null}
      {content.decisionBlock ? <DecisionBlock block={content.decisionBlock} /> : null}
      <BreakdownList whatYouGet={content.whatYouGet} />
      {content.comparisonBlock ? <ComparisonBlock block={content.comparisonBlock} /> : null}
      {content.objectionBlock ? <ObjectionBlock block={content.objectionBlock} /> : null}
      {content.midPageCta ? <CtaBand cta={content.midPageCta} /> : null}
      {content.beforeWhyYouNeedThis ? <div>{content.beforeWhyYouNeedThis}</div> : null}
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
      <HowItWorks content={content.howItWorks} />
      <CtaBand cta={content.cta} />
      <FAQSection
        title={content.faq.title}
        faqs={content.faq.items}
        includeSchema={content.faq.includeSchema}
        showContactCTA={false}
      />
    </>
  );
}
