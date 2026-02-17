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
  mascotSrc?: string;
  mascotAlt?: string;
  mediaSrc?: string;
  mediaAlt?: string;
  mediaPriority?: boolean;
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
  mediaSrc,
  mediaAlt,
  mediaPriority = true,
  headingAs = 'h1',
  ariaLabel = 'Landlord Heaven legal document hero',
  mascotDecorativeOnMobile = true,
  mascotDecorativeOnDesktop = false,
  id,
}: UniversalHeroProps) {
  const mobileTitleParts = title.split('Legal Documents');
  const hasLegalDocumentsInTitle = mobileTitleParts.length > 1;
  const shouldForceMobileHighlightBreak = highlightTitle === 'in Minutes, Not Days';
  const mobileHighlightParts = shouldForceMobileHighlightBreak ? highlightTitle.split(', ') : [];
  const isValidHeading = headingAs === 'h1' || headingAs === 'h2';
  const HeadingTag = isValidHeading ? headingAs : 'h1';
  const reviewCount = getDynamicReviewCount();
  const resolvedMediaSrc = mediaSrc ?? mascotSrc ?? '/images/laptop.webp';
  const resolvedMediaAlt = mediaAlt ?? mascotAlt ?? 'Laptop showing legal workflow dashboard';
  const isDecorativeMedia = mascotDecorativeOnDesktop || mascotDecorativeOnMobile;

  useEffect(() => {
    if (!isValidHeading) {
      warnOnce('UniversalHero: headingAs must be either "h1" or "h2".');
    }

    if (ariaLabel !== undefined && ariaLabel.trim() === '') {
      warnOnce('UniversalHero: ariaLabel should be non-empty when provided.');
    }

    if (!isDecorativeMedia && resolvedMediaAlt.trim() === '') {
      warnOnce('UniversalHero: mediaAlt should be non-empty when media is not decorative.');
    }
  }, [ariaLabel, isDecorativeMedia, isValidHeading, resolvedMediaAlt]);

  return (
    <section
      className="relative isolate overflow-hidden pt-28 pb-10 sm:pt-32 sm:pb-12 lg:pt-36 lg:pb-16"
      aria-label={ariaLabel}
      id={id}
    >
      <div className="pointer-events-none absolute inset-0 -z-20" aria-hidden="true">
        <Image
          src="/images/bg5.webp"
          alt="Purple sky background with clouds"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-black/10 via-transparent to-white/15" aria-hidden="true" />

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-10">
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

            <HeadingTag className="mt-5 max-w-[18ch] text-[2.125rem] font-bold leading-[1.1] tracking-tight sm:text-5xl lg:max-w-none lg:text-6xl">
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

            <p className="mt-4 w-full rounded-xl bg-white/75 px-4 py-3 text-lg leading-relaxed text-[#2b253d] backdrop-blur-[2px] sm:max-w-[52ch] sm:rounded-none sm:bg-transparent sm:p-0 sm:text-xl sm:backdrop-blur-0">{subtitle}</p>

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

          <div className="relative z-10 flex justify-center lg:justify-end" aria-hidden={mascotDecorativeOnDesktop ? 'true' : undefined}>
            <Image
              src={resolvedMediaSrc}
              alt={isDecorativeMedia ? '' : resolvedMediaAlt}
              aria-hidden={isDecorativeMedia ? 'true' : undefined}
              width={980}
              height={650}
              priority={mediaPriority}
              sizes="(max-width: 1024px) 92vw, 46vw"
              className="h-auto w-full max-w-[680px]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
