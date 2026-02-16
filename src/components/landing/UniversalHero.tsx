'use client';

import { useEffect, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { RiCheckLine, RiShieldCheckFill } from 'react-icons/ri';
import { UsageTodayCounter } from '@/components/seo/UsageTodayCounter';
import { getDynamicReviewCount, REVIEW_RATING } from '@/lib/reviews/reviewStats';

type HeroCta = {
  label: string;
  href: string;
};

export type UniversalHeroProps = {
  trustText: string;
  title: string;
  highlightTitle: string;
  subtitle: ReactNode;
  primaryCta: HeroCta;
  secondaryCta: HeroCta;
  feature: string;
  mascotSrc: string;
  mascotAlt: string;
  headingAs?: 'h1' | 'h2';
  ariaLabel?: string;
  mascotDecorativeOnMobile?: boolean;
  mascotDecorativeOnDesktop?: boolean;
  id?: string;
};

const warnedMessages = new Set<string>();

function warnOnce(message: string) {
  if (process.env.NODE_ENV === 'production') {
    return;
  }

  if (warnedMessages.has(message)) {
    return;
  }

  warnedMessages.add(message);
  console.warn(message);
}

export function UniversalHero({
  trustText,
  title,
  highlightTitle,
  subtitle,
  primaryCta,
  secondaryCta,
  feature,
  mascotSrc,
  mascotAlt,
  headingAs = 'h1',
  ariaLabel = 'Landlord Heaven legal document hero',
  mascotDecorativeOnMobile = true,
  mascotDecorativeOnDesktop = false,
  id,
}: UniversalHeroProps) {
  // LOCKED v1: Do not modify this component's layout/visual structure/behavior directly.
  // For page-specific hero text, mascot, and CTA customization, pass values via props only.
  const mobileTitleParts = title.split('Legal Documents');
  const hasLegalDocumentsInTitle = mobileTitleParts.length > 1;
  const shouldForceMobileHighlightBreak = highlightTitle === 'in Minutes, Not Days';
  const mobileHighlightParts = shouldForceMobileHighlightBreak ? highlightTitle.split(', ') : [];
  const isValidHeading = headingAs === 'h1' || headingAs === 'h2';
  const HeadingTag = isValidHeading ? headingAs : 'h1';
  const reviewCount = getDynamicReviewCount();

  useEffect(() => {
    if (!isValidHeading) {
      warnOnce('UniversalHero: headingAs must be either "h1" or "h2".');
    }

    if (ariaLabel !== undefined && ariaLabel.trim() === '') {
      warnOnce('UniversalHero: ariaLabel should be non-empty when provided.');
    }

    if (!mascotDecorativeOnDesktop && mascotAlt.trim() === '') {
      warnOnce(
        'UniversalHero: mascotAlt should be non-empty when mascotDecorativeOnDesktop is false.',
      );
    }
  }, [ariaLabel, isValidHeading, mascotAlt, mascotDecorativeOnDesktop]);

  return (
    <section
      className="relative isolate overflow-hidden pt-12 pb-10 sm:pt-14 sm:pb-12 lg:pt-16 lg:pb-14"
      aria-label={ariaLabel}
      id={id}
    >
      <div className="pointer-events-none absolute inset-0 -z-20" aria-hidden="true">
        <Image
          src="/images/herobg.png"
          alt="Purple sky background with clouds"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-white/10 via-white/20 to-white/30"
        aria-hidden="true"
      />

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative min-[900px]:grid min-[900px]:grid-cols-[minmax(0,1.45fr)_minmax(0,0.55fr)] min-[900px]:items-center min-[900px]:gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-10">
          <div className="pointer-events-none absolute -right-6 top-[37.5%] z-0 w-[203px] -translate-y-[80%] min-[420px]:w-[224px] min-[900px]:hidden sm:-translate-y-1/2" aria-hidden="true">
            <Image
              src={mascotSrc}
              alt={mascotDecorativeOnMobile ? '' : mascotAlt}
              aria-hidden={mascotDecorativeOnMobile ? 'true' : undefined}
              width={620}
              height={620}
              priority
              sizes="(max-width: 420px) 203px, (max-width: 899px) 224px"
              className="h-auto w-full"
            />
          </div>

          <div className="relative z-10 w-full min-w-0 text-[#1F1B2E]">
            <p className="hidden w-full max-w-xl flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-full border border-white/80 bg-white/85 px-4 py-2 text-center text-sm font-semibold shadow-sm backdrop-blur-sm sm:flex sm:w-auto sm:justify-start sm:text-left">
              <RiShieldCheckFill className="h-5 w-5 text-[#7c3aed]" aria-hidden="true" />
              <span>{trustText}</span>
              <span className="text-[#facc15]" aria-hidden="true">
                ★★★★★
              </span>
              <span className="font-medium text-[#2b253d]">
                {REVIEW_RATING}/5 · {reviewCount} reviews
              </span>
            </p>

            <HeadingTag className="mt-5 max-w-[18ch] pr-24 text-[2.125rem] font-bold leading-[1.1] tracking-tight min-[420px]:pr-28 min-[900px]:pr-0 sm:text-5xl lg:text-6xl">
              <span className="sm:hidden">
                {hasLegalDocumentsInTitle ? (
                  <>
                    {mobileTitleParts[0]}
                    <span className="whitespace-nowrap">Legal Documents</span>
                    {mobileTitleParts.slice(1).join('Legal Documents')}
                  </>
                ) : (
                  title
                )}
              </span>
              <span className="hidden sm:inline">{title}</span>
              <span className="block text-[#7c3aed]">
                <span className="sm:hidden">
                  {shouldForceMobileHighlightBreak && mobileHighlightParts.length === 2 ? (
                    <>
                      {mobileHighlightParts[0]},
                      <br />
                      {mobileHighlightParts[1]}
                    </>
                  ) : (
                    highlightTitle
                  )}
                </span>
                <span className="hidden sm:inline">{highlightTitle}</span>
              </span>
            </HeadingTag>

            <p className="mt-4 w-full rounded-xl bg-white/75 px-4 py-3 pr-24 text-lg leading-relaxed text-[#2b253d] backdrop-blur-[2px] min-[420px]:pr-28 min-[900px]:pr-0 sm:max-w-[52ch] sm:rounded-none sm:bg-transparent sm:p-0 sm:pr-0 sm:text-xl sm:backdrop-blur-0">{subtitle}</p>

            <div className="mt-6 flex w-full flex-col gap-3 sm:flex-row sm:items-center">
              <div className="w-full sm:w-auto">
                <Link href={primaryCta.href} className="hero-btn-primary flex w-full justify-center text-center sm:w-auto">
                  {primaryCta.label}
                </Link>
              </div>
              <div className="w-full sm:w-auto">
                <Link href={secondaryCta.href} className="hero-btn-secondary flex w-full justify-center text-center sm:w-auto">
                  {secondaryCta.label}
                </Link>
              </div>
            </div>

            <div className="mt-6 flex items-start gap-2 text-base font-medium text-[#2b253d] sm:text-lg">
              <RiCheckLine className="mt-0.5 h-5 w-5 flex-none text-[#7c3aed]" aria-hidden="true" />
              <span>{feature}</span>
            </div>

            <div className="mt-5">
              <UsageTodayCounter />
            </div>
          </div>

          <div
            className="relative z-0 hidden justify-center -ml-10 sm:-ml-2 sm:justify-end lg:ml-0 lg:justify-end min-[900px]:flex"
            aria-hidden={mascotDecorativeOnDesktop ? 'true' : undefined}
          >
            <Image
              src={mascotSrc}
              alt={mascotDecorativeOnDesktop ? '' : mascotAlt}
              aria-hidden={mascotDecorativeOnDesktop ? 'true' : undefined}
              width={620}
              height={620}
              priority
              sizes="(max-width: 640px) 320px, (max-width: 1024px) 320px, (max-width: 1280px) 38vw, 620px"
              className="h-auto w-full max-w-[320px] sm:max-w-[240px] md:max-w-[300px] lg:max-w-[500px] xl:max-w-[560px]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
