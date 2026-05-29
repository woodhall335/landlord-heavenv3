import type { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ProductPageTracker } from '@/components/analytics/ProductPageTracker';
import { TrackedLink } from '@/components/analytics/TrackedLink';
import { Container } from '@/components/ui/Container';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { FAQSection } from '@/components/seo/FAQSection';
import { Reveal, StaggerReveal } from './PremiumMotion';
import type {
  ProductSalesBreakdownItem,
  ProductSalesCard,
  ProductSalesDecisionBlock,
  ProductSalesEarlyProofBand,
  ProductSalesObjectionBlock,
  ProductSalesPageContent,
  ProductSalesRouteCard,
} from '@/lib/marketing/product-sales-content';

function inferProductFromHref(href: string) {
  if (href.includes('product=section13_standard')) return 'section13_standard';
  if (href.includes('product=section13_defensive')) return 'section13_defensive';
  if (href.includes('product=money_claim')) return 'money_claim';
  if (href.includes('product=complete_pack')) return 'complete_pack';
  if (href.includes('product=notice_only')) return 'notice_only';
  if (href.includes('product=tenancy_agreement')) return 'tenancy_agreement';
  if (href.includes('section-13-standard')) return 'section13_standard';
  if (href.includes('section-13-defence')) return 'section13_defensive';
  if (href.includes('money-claim')) return 'money_claim';
  if (href.includes('complete-pack')) return 'complete_pack';
  if (href.includes('notice-only')) return 'notice_only';
  if (href.includes('/products/ast')) return 'tenancy_agreement';
  if (href.includes('standard-tenancy-agreement')) return 'england_standard_tenancy_agreement';
  if (href.includes('premium-tenancy-agreement')) return 'england_premium_tenancy_agreement';
  if (href.includes('student-tenancy-agreement')) return 'england_student_tenancy_agreement';
  if (href.includes('hmo-shared-house-tenancy-agreement')) return 'england_hmo_shared_house_tenancy_agreement';
  if (href.includes('lodger-agreement')) return 'england_lodger_agreement';
  return undefined;
}

function ImageLinkWrapper({
  href,
  className,
  children,
}: {
  href?: string;
  className: string;
  children: ReactNode;
}) {
  if (href) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }

  return <div className={className}>{children}</div>;
}

function BreakdownCard({ item }: { item: ProductSalesBreakdownItem }) {
  return (
    <article className="standalone-premium-hover-lift rounded-[2rem] border border-[#E8E1F8] bg-white p-6 shadow-[0_14px_34px_rgba(24,11,49,0.06)]">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-2xl font-semibold tracking-tight text-[#17142B]">{item.name}</h3>
        {!item.includedByDefault && item.conditionalLabel ? (
          <span className="rounded-full border border-[#D8C8FF] bg-[#F7F1FF] px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-[#5E3E9A]">
            {item.conditionalLabel}
          </span>
        ) : null}
      </div>

      <dl className="mt-5 space-y-4 text-sm leading-7 text-[#4B5565] md:text-base">
        <div>
          <dt className="font-semibold text-[#17142B]">In plain English</dt>
          <dd>{item.plainEnglish}</dd>
        </div>
        <div>
          <dt className="font-semibold text-[#17142B]">What this covers</dt>
          <dd>{item.function}</dd>
        </div>
        <div>
          <dt className="font-semibold text-[#17142B]">What can go wrong without it</dt>
          <dd>{item.riskIfMissing}</dd>
        </div>
        <div>
          <dt className="font-semibold text-[#17142B]">How it helps you</dt>
          <dd>{item.landlordOutcome}</dd>
        </div>
      </dl>
    </article>
  );
}

function RouteCard({
  item,
  pagePath,
  pageType,
  routeIntent,
}: {
  item: ProductSalesRouteCard;
  pagePath: string;
  pageType: 'entry_page' | 'product_page';
  routeIntent?: string;
}) {
  return (
    <article className="standalone-premium-hover-lift flex h-full flex-col overflow-hidden rounded-[2rem] border border-[#E8E1F8] bg-white shadow-[0_14px_34px_rgba(24,11,49,0.06)]">
      {item.imageSrc ? (
        <div className="relative h-56 w-full overflow-hidden border-b border-[#E8E1F8]">
          <Image
            src={item.imageSrc}
            alt={item.imageAlt || item.name}
            fill
            className="object-cover"
            sizes="(min-width: 1280px) 33vw, (min-width: 1024px) 50vw, 100vw"
          />
        </div>
      ) : null}

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-2xl font-semibold tracking-tight text-[#17142B]">{item.name}</h3>
          {item.priceLabel ? (
            <span className="rounded-full border border-[#D8C8FF] bg-[#F7F1FF] px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-[#5E3E9A]">
              {item.priceLabel}
            </span>
          ) : null}
        </div>

        <dl className="mt-5 flex-1 space-y-4 text-sm leading-7 text-[#4B5565] md:text-base">
          <div>
            <dt className="font-semibold text-[#17142B]">Best when</dt>
            <dd>{item.whatItIs}</dd>
          </div>
          <div>
            <dt className="font-semibold text-[#17142B]">What it helps with</dt>
            <dd>{item.problemItSolves}</dd>
          </div>
          <div>
            <dt className="font-semibold text-[#17142B]">Common problem if you choose wrong</dt>
            <dd>{item.riskIfWrong}</dd>
          </div>
          <div>
            <dt className="font-semibold text-[#17142B]">How it helps you</dt>
            <dd>{item.landlordOutcome}</dd>
          </div>
        </dl>

        <TrackedLink
          href={item.href}
          pagePath={pagePath}
          pageType={pageType}
          ctaLabel={item.ctaLabel}
          ctaPosition="route_card"
          eventName="product_route_chosen"
          routeIntent={routeIntent}
          product={inferProductFromHref(item.href)}
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-[#6D28D9] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#5B21B6]"
        >
          {item.ctaLabel}
        </TrackedLink>
      </div>
    </article>
  );
}

function InfoCards({
  title,
  intro,
  cards,
  sectionId,
}: {
  title: string;
  intro: ReactNode;
  cards: ProductSalesCard[];
  sectionId: string;
}) {
  const gridClassName =
    cards.length === 4 ? 'mt-8 grid gap-5 md:grid-cols-2' : 'mt-8 grid gap-5 md:grid-cols-3';

  return (
    <section id={sectionId} className="scroll-mt-24 bg-white py-12 md:py-16">
      <Container>
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight text-[#17142B] md:text-4xl">
              {title}
            </h2>
            <div className="mt-4 text-base leading-8 text-[#4B5565] md:text-lg">{intro}</div>
          </div>

          <StaggerReveal className={gridClassName}>
            {cards.map((card) => (
              <article
                key={card.title}
                className="standalone-premium-hover-lift overflow-hidden rounded-[1.8rem] border border-[#E8E1F8] bg-[#FCFAFF] shadow-[0_14px_34px_rgba(24,11,49,0.05)]"
              >
                {card.imageSrc ? (
                  <div className="relative h-56 w-full">
                    <Image
                      src={card.imageSrc}
                      alt={card.imageAlt || card.title}
                      fill
                      className="object-cover"
                      sizes="(min-width: 768px) 33vw, 100vw"
                    />
                  </div>
                ) : null}
                <div className="p-6">
                  <h3 className="text-xl font-semibold tracking-tight text-[#17142B]">{card.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#4B5565] md:text-base">{card.body}</p>
                </div>
              </article>
            ))}
          </StaggerReveal>
        </div>
      </Container>
    </section>
  );
}

function DecisionBlock({
  content,
  analytics,
}: {
  content: ProductSalesDecisionBlock;
  analytics?: ProductSalesPageContent['analytics'];
}) {
  const toneClasses: Record<NonNullable<NonNullable<ProductSalesDecisionBlock['cards']>[number]['tone']>, string> = {
    positive: 'border-[#D9F2E7] bg-[#F2FBF6]',
    warning: 'border-[#F3E4D0] bg-[#FFF8EF]',
    neutral: 'border-[#E8E1F8] bg-white',
  };
  const eyebrowClasses: Record<NonNullable<NonNullable<ProductSalesDecisionBlock['cards']>[number]['tone']>, string> = {
    positive: 'text-[#0D7A5A]',
    warning: 'text-[#A55A0F]',
    neutral: 'text-[#6D28D9]',
  };

  return (
    <section id="route-fit" className="scroll-mt-24 bg-white py-10 md:py-12">
      <Container>
        <div className="mx-auto max-w-6xl rounded-[2.25rem] border border-[#E8E1F8] bg-[#FCFAFF] p-6 shadow-[0_18px_46px_rgba(24,11,49,0.06)] md:p-8">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight text-[#17142B] md:text-4xl">
              {content.title}
            </h2>
            <div className="mt-4 text-base leading-8 text-[#4B5565] md:text-lg">{content.intro}</div>
          </div>

          <StaggerReveal className="mt-8 grid gap-5 md:grid-cols-2">
            {content.cards.map((card) => {
              const tone = card.tone ?? 'neutral';
              return (
                <article
                  key={card.title}
                  className={`standalone-premium-hover-lift rounded-[1.8rem] border p-6 shadow-[0_14px_34px_rgba(24,11,49,0.04)] ${toneClasses[tone]}`}
                >
                  {card.eyebrow ? (
                    <p className={`text-xs font-semibold uppercase tracking-[0.12em] ${eyebrowClasses[tone]}`}>
                      {card.eyebrow}
                    </p>
                  ) : null}
                  <h3 className="mt-3 text-xl font-semibold tracking-tight text-[#17142B]">
                    {card.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[#4B5565] md:text-base">{card.body}</p>
                </article>
              );
            })}
          </StaggerReveal>

          {content.primary || content.secondary ? (
            <div className="mt-8 flex flex-wrap gap-3">
              {content.primary ? (
                <TrackedLink
                  href={content.primary.href}
                  pagePath={analytics?.pagePath || '/rent-increase'}
                  pageType={analytics?.pageType || 'entry_page'}
                  ctaLabel={content.primary.label}
                  ctaPosition="section"
                  eventName="entry_page_primary_cta_click"
                  routeIntent={analytics?.routeIntent}
                  product={inferProductFromHref(content.primary.href)}
                  className="hero-btn-primary"
                >
                  {content.primary.label}
                </TrackedLink>
              ) : null}
              {content.secondary ? (
                <TrackedLink
                  href={content.secondary.href}
                  pagePath={analytics?.pagePath || '/rent-increase'}
                  pageType={analytics?.pageType || 'entry_page'}
                  ctaLabel={content.secondary.label}
                  ctaPosition="section"
                  eventName="entry_page_secondary_cta_click"
                  routeIntent={analytics?.routeIntent}
                  product={inferProductFromHref(content.secondary.href)}
                  className="hero-btn-secondary"
                >
                  {content.secondary.label}
                </TrackedLink>
              ) : null}
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}

function ComparisonBlock({
  content,
  analytics,
}: {
  content: NonNullable<ProductSalesPageContent['comparisonBlock']>;
  analytics?: ProductSalesPageContent['analytics'];
}) {
  return (
    <section id="route-compare" className="scroll-mt-24 bg-[#FCFAFF] py-12 md:py-16">
      <Container>
        <div className="mx-auto max-w-6xl">
          {content.title || content.intro ? (
            <div className="max-w-3xl">
              {content.title ? (
                <h2 className="text-3xl font-bold tracking-tight text-[#17142B] md:text-4xl">
                  {content.title}
                </h2>
              ) : null}
              {content.intro ? (
                <div className="mt-4 text-base leading-8 text-[#4B5565] md:text-lg">
                  {content.intro}
                </div>
              ) : null}
            </div>
          ) : null}

          <StaggerReveal className={content.routeGridClassName ?? 'mt-8 grid gap-5 lg:grid-cols-2'}>
            {content.routeCards.map((item) => (
              <RouteCard
                key={item.name}
                item={item}
                pagePath={analytics?.pagePath || '/rent-increase'}
                pageType={analytics?.pageType || 'entry_page'}
                routeIntent={analytics?.routeIntent}
              />
            ))}
          </StaggerReveal>
        </div>
      </Container>
    </section>
  );
}

function ObjectionBlock({ content }: { content: ProductSalesObjectionBlock }) {
  return (
    <section id="common-questions" className="scroll-mt-24 bg-white py-12 md:py-16">
      <Container>
        <div className="mx-auto max-w-6xl rounded-[2.25rem] border border-[#E8E1F8] bg-[#FCFAFF] p-6 shadow-[0_18px_46px_rgba(24,11,49,0.06)] md:p-8">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight text-[#17142B] md:text-4xl">
              {content.title}
            </h2>
            {content.intro ? (
              <div className="mt-4 text-base leading-8 text-[#4B5565] md:text-lg">{content.intro}</div>
            ) : null}
          </div>

          <StaggerReveal className="mt-8 grid gap-5 lg:grid-cols-3">
            {content.items.map((item) => (
              <article
                key={item.question}
                className="standalone-premium-hover-lift rounded-[1.8rem] border border-[#E8E1F8] bg-white p-6 shadow-[0_14px_34px_rgba(24,11,49,0.04)]"
              >
                <h3 className="text-xl font-semibold tracking-tight text-[#17142B]">{item.question}</h3>
                <div className="mt-3 text-sm leading-7 text-[#4B5565] md:text-base">{item.answer}</div>
              </article>
            ))}
          </StaggerReveal>
        </div>
      </Container>
    </section>
  );
}

function CtaBand({
  cta,
  analytics,
  sectionId,
  ctaPosition,
}: {
  cta: ProductSalesPageContent['cta'];
  analytics?: ProductSalesPageContent['analytics'];
  sectionId: string;
  ctaPosition: 'section' | 'final';
}) {
  return (
    <section id={sectionId} className="scroll-mt-24 bg-white py-12 md:py-16">
      <Container>
        <div className="mx-auto max-w-5xl rounded-[2.4rem] bg-gradient-to-br from-[#201739] via-[#31205B] to-[#5D3DB3] p-8 text-white shadow-[0_28px_72px_rgba(46,29,86,0.28)] md:p-10">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{cta.title}</h2>
            <div className="mt-4 text-base leading-8 text-[#E5DFFD] md:text-lg">{cta.body}</div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <TrackedLink
              href={cta.primary.href}
              pagePath={analytics?.pagePath || '/rent-increase'}
              pageType={analytics?.pageType || 'entry_page'}
              ctaLabel={cta.primary.label}
              ctaPosition={ctaPosition}
              eventName="entry_page_primary_cta_click"
              routeIntent={analytics?.routeIntent}
              product={inferProductFromHref(cta.primary.href)}
              className="hero-btn-primary"
            >
              {cta.primary.label}
            </TrackedLink>
            {cta.secondary ? (
              <TrackedLink
                href={cta.secondary.href}
                pagePath={analytics?.pagePath || '/rent-increase'}
                pageType={analytics?.pageType || 'entry_page'}
                ctaLabel={cta.secondary.label}
                ctaPosition={ctaPosition}
                eventName="entry_page_secondary_cta_click"
                routeIntent={analytics?.routeIntent}
                product={inferProductFromHref(cta.secondary.href)}
                className="hero-btn-secondary"
              >
                {cta.secondary.label}
              </TrackedLink>
            ) : null}
          </div>

          {cta.guideLinks?.length ? (
            <div className="mt-8 border-t border-white/15 pt-6">
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#D5CCF6]">
                Want the guide first?
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                {cta.guideLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:border-white/30 hover:bg-white/15"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}

function EarlyProofBand({ content }: { content: ProductSalesEarlyProofBand }) {
  const hasChecklist = Boolean(content.includedBullets?.length);
  const hasFitSummary = Boolean(content.bestFor || content.notFor);
  const hasPreview = Boolean(content.preview);
  const hasImage = Boolean(content.imageSrc);
  const hasStandaloneImage = hasImage && !hasPreview;
  const showMobileFullBleedImage = Boolean(content.mobileImageFirstFullBleed && content.imageSrc);
  const hasSummaryContent = Boolean(
    content.priceLabel ||
    content.valueSummary ||
    hasChecklist ||
    hasFitSummary
  );

  if (!content.priceLabel && !content.valueSummary && !hasChecklist && !hasFitSummary && !hasPreview && !hasImage) {
    return null;
  }

  return (
    <section id="hero-proof" className="scroll-mt-24 bg-white py-10 md:py-12">
      <Container>
        {!hasSummaryContent ? (
          <div className={`mx-auto min-w-0 ${content.fullWidthPreview ? '' : 'max-w-6xl'}`}>
            {hasPreview ? content.preview : null}
            {content.imageSrc ? (
              <ImageLinkWrapper
                href={content.imageHref}
                className="premium-image-frame relative block overflow-hidden rounded-[2rem] border border-[#E8E1F8] bg-white shadow-[0_18px_46px_rgba(24,11,49,0.08)]"
              >
                <div className="relative aspect-[16/9] w-full">
                  <Image
                    src={content.imageSrc}
                    alt={content.imageAlt ?? 'Product pack preview'}
                    fill
                    sizes="(min-width: 1024px) 70vw, 100vw"
                    className="object-cover object-top"
                  />
                </div>
              </ImageLinkWrapper>
            ) : null}
          </div>
        ) : (
          <div className="mx-auto max-w-6xl rounded-[2.25rem] border border-[#E8E1F8] bg-[#FCFAFF] p-6 shadow-[0_18px_46px_rgba(24,11,49,0.06)] md:p-8">
            {showMobileFullBleedImage ? (
              <ImageLinkWrapper
                href={content.imageHref}
                className="relative left-1/2 -mt-6 mb-6 block w-screen -translate-x-1/2 overflow-hidden bg-white lg:hidden"
              >
                <div className="relative aspect-[16/11] w-full">
                  <Image
                    src={content.imageSrc as string}
                    alt={content.imageAlt ?? 'Product pack preview'}
                    fill
                    sizes="100vw"
                    className="object-cover object-top"
                  />
                </div>
              </ImageLinkWrapper>
            ) : null}
            <div
              className={`grid gap-8 lg:grid-cols-[0.58fr_0.42fr] ${
                hasStandaloneImage ? 'lg:items-stretch' : 'lg:items-start'
              }`}
            >
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  {content.priceLabel ? (
                    <span className="rounded-full border border-[#D8C8FF] bg-white px-4 py-2 text-sm font-semibold text-[#5E3E9A]">
                      {content.priceLabel}
                    </span>
                  ) : null}
                  <span className="rounded-full border border-[#E8E1F8] bg-white px-4 py-2 text-sm font-semibold text-[#2A2161]">
                    Preview before you buy
                  </span>
                </div>

                {content.valueSummary ? (
                  <div className="mt-5 text-base leading-8 text-[#4B5565] md:text-lg">
                    {content.valueSummary}
                  </div>
                ) : null}

                {hasChecklist ? (
                  <div className="mt-6">
                    <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#6D28D9]">
                      What you can see straight away
                    </p>
                    <ul className="mt-4 grid gap-3 text-sm leading-7 text-[#2A2161] md:grid-cols-2 md:text-base">
                      {content.includedBullets?.map((bullet) => (
                        <li key={bullet} className="flex items-start gap-3">
                          <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-[#7C3AED]" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {hasFitSummary ? (
                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    {content.bestFor ? (
                      <div className="rounded-[1.6rem] border border-[#D9F2E7] bg-[#F2FBF6] p-5">
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#0D7A5A]">
                          Best fit
                        </p>
                        <p className="mt-3 text-sm leading-7 text-[#215245] md:text-base">
                          {content.bestFor}
                        </p>
                      </div>
                    ) : null}
                    {content.notFor ? (
                      <div className="rounded-[1.6rem] border border-[#F3E4D0] bg-[#FFF8EF] p-5">
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#A55A0F]">
                          Not the right fit
                        </p>
                        <p className="mt-3 text-sm leading-7 text-[#69431E] md:text-base">
                          {content.notFor}
                        </p>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>

              {hasPreview || hasImage ? (
                <div
                  className={`min-w-0 ${
                    showMobileFullBleedImage
                      ? hasStandaloneImage
                        ? 'hidden lg:flex lg:h-full'
                        : 'hidden lg:block'
                      : hasStandaloneImage
                        ? 'lg:flex lg:h-full'
                        : ''
                  }`}
                >
                  {hasPreview ? content.preview : null}
                  {content.imageSrc ? (
                    <ImageLinkWrapper
                      href={content.imageHref}
                      className={`premium-image-frame relative block overflow-hidden rounded-[2rem] border border-[#E8E1F8] bg-white shadow-[0_18px_46px_rgba(24,11,49,0.08)] ${
                        hasStandaloneImage ? 'h-72 w-full lg:h-full' : ''
                      }`}
                    >
                      <div
                        className={`relative w-full ${
                          hasStandaloneImage ? 'h-full min-h-[22rem]' : 'aspect-[4/3]'
                        }`}
                      >
                        <Image
                          src={content.imageSrc}
                          alt={content.imageAlt ?? 'Product pack preview'}
                          fill
                          sizes="(min-width: 1024px) 34vw, 100vw"
                          className="object-cover object-top"
                        />
                      </div>
                    </ImageLinkWrapper>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        )}
      </Container>
    </section>
  );
}

function ProductFitProofBand({
  content,
  analytics,
}: {
  content: ProductSalesPageContent;
  analytics?: ProductSalesPageContent['analytics'];
}) {
  const routeName = content.hero.title;
  const primary = content.hero.primaryCta ?? content.cta.primary;
  const priceLabel = content.earlyProofBand?.priceLabel;
  const includedItems = [
    ...(content.earlyProofBand?.includedBullets ?? []),
    ...(content.whatYouGet.items?.slice(0, 2).map((item) => item.name) ?? []),
    ...(content.whatYouGet.routeCards?.slice(0, 2).map((item) => item.name) ?? []),
  ].slice(0, 4);

  return (
    <section id="product-fit-proof" className="scroll-mt-24 bg-white py-10 md:py-12">
      <Container>
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            <Reveal className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#6D28D9]">
                Product fit
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#17142B] md:text-4xl">
                Use this when {routeName.toLowerCase()} is the job you need to get right
              </h2>
              <p className="mt-4 text-base leading-8 text-[#4B5565] md:text-lg">
                This page is designed for landlords who want a practical document route, not a generic
                template hunt. Use it to check whether the product fits the tenant problem, see what
                paperwork is included, preview the evidence and compliance support, and move into the
                paid pack only when the next action is clear.
              </p>
            </Reveal>

            <StaggerReveal className="grid gap-4 md:grid-cols-2">
              <article className="rounded-[1.5rem] border border-[#E8E1F8] bg-[#FCFAFF] p-5">
                <h3 className="text-lg font-semibold text-[#17142B]">What you should know before buying</h3>
                <p className="mt-3 text-sm leading-7 text-[#4B5565] md:text-base">
                  The route should match the landlord problem, the property jurisdiction, the tenant
                  facts, and the stage you are at. If the page points you to a notice, court pack, money
                  claim, rent increase, or tenancy agreement, it is because that is the practical next
                  step this product is built around.
                </p>
              </article>
              <article className="rounded-[1.5rem] border border-[#E8E1F8] bg-[#FCFAFF] p-5">
                <h3 className="text-lg font-semibold text-[#17142B]">Proof, preview, and compliance cues</h3>
                <p className="mt-3 text-sm leading-7 text-[#4B5565] md:text-base">
                  Look for the included document list, sample or preview evidence, checklist wording,
                  court-readiness cues, and FAQs before you start. Those visible signals matter more for
                  SEO and trust than hidden meta keywords.
                </p>
              </article>
              <article className="rounded-[1.5rem] border border-[#D9F2E7] bg-[#F2FBF6] p-5">
                <h3 className="text-lg font-semibold text-[#134E3A]">Usually included here</h3>
                {includedItems.length ? (
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-[#215245] md:text-base">
                    {includedItems.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm leading-7 text-[#215245] md:text-base">
                    Guided questions, document preparation, practical checks, and a clearer file for the
                    landlord task this page describes.
                  </p>
                )}
              </article>
              <article className="rounded-[1.5rem] border border-[#E8E1F8] bg-white p-5">
                <h3 className="text-lg font-semibold text-[#17142B]">Next action</h3>
                <p className="mt-3 text-sm leading-7 text-[#4B5565] md:text-base">
                  {priceLabel ? `${priceLabel}. ` : ''}Start only after the page matches your facts; use
                  the FAQs and comparison sections if you are still deciding between routes.
                </p>
                <TrackedLink
                  href={primary.href}
                  pagePath={analytics?.pagePath || '/products'}
                  pageType={analytics?.pageType || 'product_page'}
                  ctaLabel={primary.label}
                  ctaPosition="section"
                  eventName="entry_page_primary_cta_click"
                  routeIntent={analytics?.routeIntent}
                  product={inferProductFromHref(primary.href)}
                  className="mt-5 inline-flex items-center justify-center rounded-xl bg-[#6D28D9] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#5B21B6]"
                >
                  {primary.label}
                </TrackedLink>
              </article>
            </StaggerReveal>
          </div>
        </div>
      </Container>
    </section>
  );
}

export function PublicProductSalesPage({ content }: { content: ProductSalesPageContent }) {
  const {
    analytics,
    hero,
    postHeroContent,
    afterPostHeroContent,
    earlyProofBand,
    decisionBlock,
    whatYouGet,
    comparisonBlock,
    objectionBlock,
    midPageCta,
    beforeWhyYouNeedThis,
    whyYouNeedThis,
    howThisHelps,
    howItWorks,
    cta,
    faq,
  } = content;
  const hasRouteCards = Boolean(whatYouGet.routeCards?.length);
  const hasProofBlock = Boolean(whatYouGet.preview || whatYouGet.sampleProof);
  const shouldShowProofAsPrimaryWhatYouGet = hasProofBlock && !hasRouteCards;
  const hasFallbackBreakdown =
    Boolean(whatYouGet.items?.length) || Boolean(whatYouGet.conditionalItems?.length);
  const shouldRenderWhatYouGet = !whatYouGet.hideSection;
  const hasHowItWorksImage = Boolean(howItWorks.imageSrc);
  const productPageId =
    analytics?.pageType === 'product_page'
      ? analytics.routeIntent || inferProductFromHref(hero.primaryCta?.href || '') || analytics.pagePath
      : null;
  const heroPreTitleLabel =
    hero.preTitleLabel ??
    (analytics?.pageType === 'product_page' ? 'Solicitor-approved documents' : undefined);

  return (
    <>
      {analytics?.pageType === 'product_page' && productPageId ? (
        <ProductPageTracker
          pagePath={analytics.pagePath}
          productId={productPageId}
          productName={hero.title}
          routeIntent={analytics.routeIntent}
          priceLabel={earlyProofBand?.priceLabel}
        />
      ) : null}
      <UniversalHero {...hero} preTitleLabel={heroPreTitleLabel}>{hero.children}</UniversalHero>
      <ProductFitProofBand content={content} analytics={analytics} />
      {postHeroContent ? <section className="scroll-mt-24 bg-white py-10 md:py-12"><Container><Reveal className="mx-auto max-w-6xl">{postHeroContent}</Reveal></Container></section> : null}
      {afterPostHeroContent ? <>{afterPostHeroContent}</> : null}
      {decisionBlock ? <DecisionBlock content={decisionBlock} analytics={analytics} /> : null}
      {earlyProofBand ? <EarlyProofBand content={earlyProofBand} /> : null}

      {shouldRenderWhatYouGet ? (
        <section id="what-you-get" className="scroll-mt-24 bg-[#FCFAFF] py-12 md:py-16">
          <Container>
            <div className="mx-auto max-w-6xl">
              {hasRouteCards ? (
                <>
                  <div className="max-w-3xl">
                    <h2 className="text-3xl font-bold tracking-tight text-[#17142B] md:text-4xl">
                      {whatYouGet.title}
                    </h2>
                    <div className="mt-4 text-base leading-8 text-[#4B5565] md:text-lg">
                      {whatYouGet.intro}
                    </div>
                  </div>

                  <StaggerReveal
                    className={
                      whatYouGet.routeGridClassName ??
                      'mt-8 grid gap-5 lg:grid-cols-2 xl:grid-cols-3'
                    }
                  >
                    {whatYouGet.routeCards?.map((item) => (
                      <RouteCard
                        key={item.name}
                        item={item}
                        pagePath={analytics?.pagePath || '/rent-increase'}
                        pageType={analytics?.pageType || 'entry_page'}
                        routeIntent={analytics?.routeIntent}
                      />
                    ))}
                  </StaggerReveal>
                </>
              ) : null}

              {hasFallbackBreakdown && !shouldShowProofAsPrimaryWhatYouGet ? (
                <>
                  <div className="max-w-3xl">
                    <h2 className="text-3xl font-bold tracking-tight text-[#17142B] md:text-4xl">
                      {whatYouGet.title}
                    </h2>
                    <div className="mt-4 text-base leading-8 text-[#4B5565] md:text-lg">
                      {whatYouGet.intro}
                    </div>
                  </div>

                  {whatYouGet.items?.length ? (
                    <StaggerReveal className="mt-8 grid gap-5 lg:grid-cols-2">
                      {whatYouGet.items.map((item) => (
                        <BreakdownCard key={item.name} item={item} />
                      ))}
                    </StaggerReveal>
                  ) : null}
                </>
              ) : null}

              {whatYouGet.conditionalItems?.length && !shouldShowProofAsPrimaryWhatYouGet ? (
                <div className="mt-10 rounded-[2rem] border border-[#E8E1F8] bg-white p-6 shadow-[0_14px_34px_rgba(24,11,49,0.05)] md:p-8">
                  <div className="max-w-3xl">
                    <h3 className="text-2xl font-semibold tracking-tight text-[#17142B]">
                      {whatYouGet.conditionalTitle || 'Included when your answers require it'}
                    </h3>
                    {whatYouGet.conditionalIntro ? (
                      <div className="mt-3 text-base leading-8 text-[#4B5565]">
                        {whatYouGet.conditionalIntro}
                      </div>
                    ) : null}
                  </div>
                  <StaggerReveal className="mt-6 grid gap-5 lg:grid-cols-2">
                    {whatYouGet.conditionalItems.map((item) => (
                      <BreakdownCard key={item.name} item={item} />
                    ))}
                  </StaggerReveal>
                </div>
              ) : null}

              {hasProofBlock ? (
                <div className={hasRouteCards || hasFallbackBreakdown ? 'mt-10 space-y-8' : ''}>
                  {whatYouGet.preview ? <div>{whatYouGet.preview}</div> : null}
                  {whatYouGet.sampleProof ? <div>{whatYouGet.sampleProof}</div> : null}
                </div>
              ) : null}
            </div>
          </Container>
        </section>
      ) : null}

      {comparisonBlock ? <ComparisonBlock content={comparisonBlock} analytics={analytics} /> : null}
      {objectionBlock ? <ObjectionBlock content={objectionBlock} /> : null}
      {midPageCta ? <CtaBand cta={midPageCta} analytics={analytics} sectionId="next-step" ctaPosition="section" /> : null}
      {beforeWhyYouNeedThis ? <>{beforeWhyYouNeedThis}</> : null}

      <InfoCards
        title={whyYouNeedThis.title}
        intro={whyYouNeedThis.intro}
        cards={whyYouNeedThis.cards}
        sectionId="why-you-need-this"
      />

      <InfoCards
        title={howThisHelps.title}
        intro={howThisHelps.intro}
        cards={howThisHelps.cards}
        sectionId="how-this-helps"
      />

      <section id="how-it-works" className="scroll-mt-24 bg-[#F7F1FF] py-12 md:py-16">
        <Container>
          <div className="mx-auto max-w-6xl rounded-[2.25rem] border border-[#E8E1F8] bg-white p-6 shadow-[0_18px_46px_rgba(24,11,49,0.07)] md:p-10">
            <div className="max-w-3xl">
              <h2 className="text-3xl font-bold tracking-tight text-[#17142B] md:text-4xl">
                {howItWorks.title}
              </h2>
              <div className="mt-4 text-base leading-8 text-[#4B5565] md:text-lg">
                {howItWorks.intro}
              </div>
            </div>

            {howItWorks.mobileImageFirstFullBleed && howItWorks.imageSrc ? (
              <ImageLinkWrapper
                href={howItWorks.imageHref}
                className="relative left-1/2 mt-8 block w-screen -translate-x-1/2 overflow-hidden bg-white lg:hidden"
              >
                <div className="relative aspect-[16/11] w-full">
                  <Image
                    src={howItWorks.imageSrc}
                    alt={howItWorks.imageAlt ?? 'How it works illustration'}
                    fill
                    sizes="100vw"
                    className="object-cover object-top"
                  />
                </div>
              </ImageLinkWrapper>
            ) : null}

            <div
              className={
                hasHowItWorksImage
                  ? `grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:items-stretch ${
                      howItWorks.mobileImageFirstFullBleed ? 'mt-6 lg:mt-8' : 'mt-8'
                    }`
                  : 'mt-8'
              }
            >
              <StaggerReveal className={hasHowItWorksImage ? 'space-y-5' : 'grid gap-5 md:grid-cols-3'}>
                {howItWorks.steps.map((step) => (
                  <article
                    key={step.step}
                    className="standalone-premium-hover-lift rounded-[1.8rem] border border-[#E8E1F8] bg-[#FCFAFF] p-6"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6D28D9]">
                      {step.step}
                    </p>
                    <h3 className="mt-3 text-xl font-semibold tracking-tight text-[#17142B]">
                      {step.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-[#4B5565] md:text-base">{step.body}</p>
                  </article>
                ))}
              </StaggerReveal>

              {howItWorks.imageSrc ? (
                <ImageLinkWrapper
                href={howItWorks.imageHref}
                className={`premium-image-frame relative block min-h-[360px] overflow-hidden rounded-[2rem] border border-[#E8E1F8] bg-white shadow-[0_18px_46px_rgba(24,11,49,0.08)] md:min-h-[440px] lg:min-h-full ${
                  howItWorks.mobileImageFirstFullBleed ? 'hidden lg:block' : ''
                }`}
                >
                  <Image
                    src={howItWorks.imageSrc}
                    alt={howItWorks.imageAlt ?? 'How it works illustration'}
                    fill
                    sizes="(min-width: 1024px) 66vw, 100vw"
                    className="object-cover object-top"
                  />
                </ImageLinkWrapper>
              ) : null}
            </div>
          </div>
        </Container>
      </section>

      <CtaBand cta={cta} analytics={analytics} sectionId="start-now" ctaPosition="final" />

      <FAQSection
        title={faq.title}
        faqs={faq.items}
        includeSchema={faq.includeSchema}
        className="bg-white py-12 md:py-16"
      />
    </>
  );
}
