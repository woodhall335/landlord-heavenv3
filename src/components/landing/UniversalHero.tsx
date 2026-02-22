'use client';

import { useEffect, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { RiCheckLine, RiShieldCheckFill } from 'react-icons/ri';
import { UsageTodayCounter } from '@/components/seo/UsageTodayCounter';
import { TrustPositioningBar } from '@/components/marketing/TrustPositioningBar';
import { getDynamicReviewCount, REVIEW_RATING } from '@/lib/reviews/reviewStats';
import { clsx } from 'clsx';

type HeroCta = {
  label: string;
  href: string;
};

// DO NOT MODIFY WITHOUT UPDATING TESTS: these classes define the mobile hero layout contract
// that keeps subtitle readability, right-edge media bleed, and CTA placement stable across pages.
const SECTION_WRAP_CLASSES = 'relative isolate overflow-visible pt-28 pb-10 sm:pt-32 sm:pb-12 lg:overflow-hidden lg:pt-36 lg:pb-16';
const MOBILE_MEDIA_WRAP_CLASSES = 'relative z-0 float-right mr-[-20%] ml-4 mt-3 mb-5 w-[72%] max-w-[560px] pt-0 sm:w-[64%] lg:hidden';
const SUBTITLE_CLASSES = 'relative z-10 mt-4 px-0 py-0 text-lg leading-relaxed text-white/85 sm:max-w-[52ch] sm:text-xl';
const CTA_WRAP_CLASSES = 'mt-6 flex w-full flex-col gap-3 sm:flex-row sm:items-center';

export type UniversalHeroProps = {
  trustText?: string;
  badge?: string;
  badgeIcon?: ReactNode;
  title: string;
  highlightTitle?: string;
  subtitle?: ReactNode;
  primaryCta?: HeroCta;
  secondaryCta?: HeroCta;
  feature?: string;
  mascotSrc?: string;
  mascotAlt?: string;
  mediaSrc?: string | null;
  mediaAlt?: string;
  mediaPriority?: boolean;
  headingAs?: 'h1' | 'h2';
  ariaLabel?: string;
  mascotDecorativeOnMobile?: boolean;
  mascotDecorativeOnDesktop?: boolean;
  id?: string;
  align?: 'left' | 'center';
  hideMedia?: boolean;
  children?: ReactNode;
  actionsSlot?: ReactNode;
  showReviewPill?: boolean;
  showUsageCounter?: boolean;
  backgroundImageSrc?: string;
  showTrustPositioningBar?: boolean;
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
  badge,
  badgeIcon,
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
  align = 'left',
  hideMedia = false,
  children,
  actionsSlot,
  showReviewPill,
  showUsageCounter,
  backgroundImageSrc = '/images/bg.webp',
  showTrustPositioningBar = false,
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
  const shouldShowReviewPill = showReviewPill ?? Boolean(trustText);
  const shouldShowUsageCounter = showUsageCounter ?? Boolean(trustText);
  const isCenter = align === 'center';
  const shouldRenderMedia = !hideMedia && mediaSrc !== null;

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
      className={SECTION_WRAP_CLASSES}
      aria-label={ariaLabel}
      id={id}
    >
      <div className="pointer-events-none absolute inset-0 -z-20" aria-hidden="true">
        <Image
          src={backgroundImageSrc}
          alt="Purple sky background with clouds"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-black/25 via-black/15 to-black/30" aria-hidden="true" />

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className={clsx(
            'block gap-8 lg:grid lg:items-center lg:gap-10',
            shouldRenderMedia && 'lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]'
          )}
        >
          <div className={clsx('relative z-10 w-full min-w-0', isCenter ? 'text-center lg:text-center' : 'text-left', hideMedia && 'max-w-3xl mx-auto')}>
            {badge && (
              <div className={clsx('mb-4 inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/20 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm', isCenter && 'mx-auto')}>
                {badgeIcon}
                <span className="text-white">{badge}</span>
              </div>
            )}

            {shouldShowReviewPill && trustText && (
              <p className={clsx('hidden w-full max-w-xl flex-wrap items-center gap-x-3 gap-y-1 rounded-full border border-white/80 bg-white/85 px-4 py-2 text-sm font-semibold shadow-sm backdrop-blur-sm lg:flex', isCenter ? 'mx-auto justify-center text-center' : 'justify-start text-left')}>
                <RiShieldCheckFill className="h-5 w-5 text-[#7c3aed]" aria-hidden="true" />
                <span>{trustText}</span>
                <span className="text-[#facc15]" aria-hidden="true">
                  ★★★★★
                </span>
                <span className="font-medium text-[#2b253d]">
                  {REVIEW_RATING}/5 · {reviewCount} reviews
                </span>
              </p>
            )}

            <HeadingTag
              className={clsx(
                'mt-5 text-[2.125rem] font-bold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl',
                shouldRenderMedia ? 'max-w-none' : 'max-w-[18ch] lg:max-w-none'
              )}
            >
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
              {highlightTitle && (
                <span className="block text-white">
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
              )}
            </HeadingTag>

            {shouldRenderMedia && (
              <div
                className={MOBILE_MEDIA_WRAP_CLASSES}
                aria-hidden={mascotDecorativeOnDesktop ? 'true' : undefined}
              >
                <Image
                  src={resolvedMediaSrc}
                  alt={isDecorativeMedia ? '' : resolvedMediaAlt}
                  aria-hidden={isDecorativeMedia ? 'true' : undefined}
                  width={980}
                  height={650}
                  priority={mediaPriority}
                  sizes="(max-width: 1024px) 95vw, 46vw"
                  className="relative z-0 h-auto w-full"
                />
              </div>
            )}

            {subtitle && !shouldRenderMedia && (
              <p
                className={clsx(
                  'mt-4 px-0 py-0 text-lg leading-relaxed text-white/85 sm:max-w-[52ch] sm:text-xl',
                  shouldRenderMedia ? 'w-auto lg:w-full' : 'w-full',
                  isCenter && 'sm:mx-auto'
                )}
              >
                {subtitle}
              </p>
            )}

            {subtitle && shouldRenderMedia && (
              <p
                className={clsx(
                  SUBTITLE_CLASSES,
                  isCenter && 'sm:mx-auto'
                )}
              >
                {subtitle}
              </p>
            )}

            {(primaryCta || secondaryCta || actionsSlot) && (
              <div className={clsx(CTA_WRAP_CLASSES, shouldRenderMedia && 'clear-both lg:clear-none', isCenter && 'sm:justify-center')}>
                {primaryCta && (
                  <div className="w-full sm:w-auto">
                    <Link
                      href={primaryCta.href}
                      data-testid="hero-primary-cta"
                      className="hero-btn-primary flex w-full justify-center text-center sm:w-auto"
                    >
                      {primaryCta.label}
                    </Link>
                  </div>
                )}
                {secondaryCta && (
                  <div className="w-full sm:w-auto">
                    <Link href={secondaryCta.href} className="hero-btn-secondary flex w-full justify-center text-center sm:w-auto">
                      {secondaryCta.label}
                    </Link>
                  </div>
                )}
                {actionsSlot}
              </div>
            )}

            {feature && (
              <div className="mt-6 flex w-full items-start gap-2 text-base font-medium text-white/85 sm:text-lg">
                <RiCheckLine className="mt-0.5 h-5 w-5 flex-none text-white" aria-hidden="true" />
                <span className="text-white/85">{feature}</span>
              </div>
            )}

            {showTrustPositioningBar ? (
              <TrustPositioningBar
                variant="compact"
                className="mx-auto mt-6 max-w-5xl"
              />
            ) : null}

            {children}

            {shouldShowUsageCounter && (
              <div className="mt-5 w-full text-white/90">
                <UsageTodayCounter />
              </div>
            )}
          </div>

          {shouldRenderMedia && (
            <div
              className="relative z-10 hidden h-full items-center justify-end lg:flex"
              aria-hidden={mascotDecorativeOnDesktop ? 'true' : undefined}
            >
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
          )}
        </div>
      </div>
    </section>
  );
}
