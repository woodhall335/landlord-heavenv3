'use client';

import { useEffect, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { RiCheckLine, RiShieldCheckFill } from 'react-icons/ri';
import { UsageTodayCounter } from '@/components/seo/UsageTodayCounter';
import type { PositioningPreset } from '@/lib/marketing/positioning';
import { getDynamicReviewCount, REVIEW_RATING } from '@/lib/reviews/reviewStats';
import {
  PUBLIC_HERO_PRESET_STYLES,
  type PublicHeroPreset,
} from '@/lib/public-brand';
import { clsx } from 'clsx';

type HeroCta = {
  label: string;
  href: string;
};

// DO NOT MODIFY WITHOUT UPDATING TESTS: these classes define the mobile hero layout contract
// that keeps subtitle readability, right-edge media bleed, and CTA placement stable across pages.
const SECTION_WRAP_CLASSES =
  'relative isolate overflow-visible pt-28 pb-10 sm:pt-32 sm:pb-12 lg:overflow-hidden lg:pt-36 lg:pb-16';
const MOBILE_MEDIA_WRAP_CLASSES =
  'relative z-0 float-right mr-[-20%] ml-4 mt-3 mb-5 w-[72%] max-w-[560px] pt-0 sm:w-[64%] lg:hidden';
const SUBTITLE_CLASSES =
  'relative z-10 mt-4 px-0 py-0 text-lg leading-relaxed text-white/85 sm:max-w-[52ch] sm:text-xl';
const CTA_WRAP_CLASSES = 'mt-6 flex w-full flex-col gap-3 sm:flex-row sm:items-center';
const REVIEW_STARS = '\u2605\u2605\u2605\u2605\u2605';

export type UniversalHeroProps = {
  preset?: PublicHeroPreset;
  variant?: 'pastel';
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
  trustPositioningPreset?: PositioningPreset;
  trustPositioningHeadline?: string;
  reviewPillLayout?: 'auto' | 'inline' | 'stacked';
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
  preset = 'product_owner',
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
  align = 'left',
  hideMedia = false,
  children,
  actionsSlot,
  showReviewPill,
  showUsageCounter,
  backgroundImageSrc = '/images/bg.webp',
  reviewPillLayout = 'auto',
}: UniversalHeroProps) {
  const mobileTitleParts = title.split('Legal Documents');
  const hasLegalDocumentsInTitle = mobileTitleParts.length > 1;
  const shouldForceMobileHighlightBreak = highlightTitle === 'in Minutes, Not Days';
  const mobileHighlightParts = shouldForceMobileHighlightBreak ? highlightTitle.split(', ') : [];
  const isValidHeading = headingAs === 'h1' || headingAs === 'h2';
  const HeadingTag = isValidHeading ? headingAs : 'h1';
  const reviewCount = getDynamicReviewCount();
  const presetStyles = PUBLIC_HERO_PRESET_STYLES[preset];
  const resolvedMediaSrc = mediaSrc ?? mascotSrc ?? '/images/laptop.webp';
  const resolvedMediaAlt =
    mediaAlt ?? mascotAlt ?? 'Laptop showing legal workflow dashboard';
  const shouldRenderHeading = Boolean(title || highlightTitle);
  const shouldShowReviewPill = showReviewPill ?? true;
  const shouldShowUsageCounter = showUsageCounter ?? Boolean(trustText);
  const resolvedTrustText = trustText ?? 'Renters Right Act Compliant 2026';
  const trustTextLooksLikeReview = Boolean(
    resolvedTrustText &&
      /(\*{3,}|\bstars?\b|\breviews?\b|\/5\b|\brated\b)/i.test(resolvedTrustText)
  );
  const showTrustDescriptor = Boolean(resolvedTrustText) && !trustTextLooksLikeReview;
  const shouldUseStackedDesktopReviewPill =
    reviewPillLayout === 'stacked'
      ? true
      : reviewPillLayout === 'inline'
        ? false
        : showTrustDescriptor && resolvedTrustText.trim().length > 60;
  const isCenter = align === 'center';
  const shouldRenderMedia = !hideMedia && mediaSrc !== null;

  useEffect(() => {
    if (!isValidHeading) {
      warnOnce('UniversalHero: headingAs must be either "h1" or "h2".');
    }

    if (ariaLabel !== undefined && ariaLabel.trim() === '') {
      warnOnce('UniversalHero: ariaLabel should be non-empty when provided.');
    }

    if (
      (!mascotDecorativeOnDesktop || !mascotDecorativeOnMobile) &&
      resolvedMediaAlt.trim() === ''
    ) {
      warnOnce('UniversalHero: mediaAlt should be non-empty when media is not decorative.');
    }
  }, [
    ariaLabel,
    isValidHeading,
    mascotDecorativeOnDesktop,
    mascotDecorativeOnMobile,
    resolvedMediaAlt,
  ]);

  return (
    <section
      className={clsx(SECTION_WRAP_CLASSES, presetStyles.section)}
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
      <div className={clsx('pointer-events-none absolute inset-0 -z-10', presetStyles.overlay)} aria-hidden="true" />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-32 bg-[linear-gradient(180deg,rgba(15,6,31,0)_0%,rgba(15,6,31,0.24)_100%)]"
        aria-hidden="true"
      />

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className={clsx(
            'block gap-8 lg:grid lg:items-center lg:gap-10',
            shouldRenderMedia && 'lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]'
          )}
        >
          <div
            className={clsx(
              'relative z-10 w-full min-w-0',
              isCenter ? 'text-center lg:text-center' : 'text-left',
              hideMedia && 'max-w-3xl mx-auto'
            )}
          >
            {shouldShowReviewPill && (
              <p
                className={clsx(
                  'mb-3 flex w-full items-center gap-2 text-sm font-semibold text-white lg:hidden',
                  isCenter ? 'justify-center text-center' : 'justify-start text-left'
                )}
              >
                <RiCheckLine className="h-5 w-5" aria-hidden="true" />
                <span>Rated</span>
                <span className="text-[#facc15]" aria-hidden="true">
                  {REVIEW_STARS}
                </span>
                <span>
                  {REVIEW_RATING}/5 | {reviewCount} reviews
                </span>
              </p>
            )}

            {shouldShowReviewPill && (
              shouldUseStackedDesktopReviewPill ? (
                <p
                  data-testid="hero-review-pill-desktop"
                  className={clsx(
                    'hidden w-full max-w-[46rem] rounded-full border border-white/80 bg-white/85 px-4 py-2.5 text-sm font-semibold shadow-sm backdrop-blur-sm lg:block',
                    presetStyles.reviewPill,
                    isCenter ? 'mx-auto text-center' : 'text-left'
                  )}
                >
                  <span
                    className={clsx(
                      'flex items-start gap-3 leading-5',
                      isCenter ? 'justify-center' : 'justify-start'
                    )}
                  >
                    <RiShieldCheckFill
                      className="mt-0.5 h-5 w-5 shrink-0 text-[#7c3aed]"
                      aria-hidden="true"
                    />
                    <span data-testid="hero-review-pill-trust">{resolvedTrustText}</span>
                  </span>
                  <span
                    data-testid="hero-review-pill-meta"
                    className={clsx(
                      'mt-1.5 flex items-center gap-3 leading-5',
                      isCenter ? 'justify-center' : 'pl-8'
                    )}
                  >
                    <span className="shrink-0 text-[#facc15]" aria-hidden="true">
                      {REVIEW_STARS}
                    </span>
                    <span className="shrink-0 font-medium text-[#2b253d]">
                      {REVIEW_RATING}/5 | {reviewCount} reviews
                    </span>
                  </span>
                </p>
              ) : (
                <p
                  data-testid="hero-review-pill-desktop"
                  className={clsx(
                    'hidden w-full max-w-2xl items-center gap-3 rounded-full border border-white/80 bg-white/85 px-4 py-2 text-sm font-semibold shadow-sm backdrop-blur-sm lg:flex',
                    presetStyles.reviewPill,
                    isCenter ? 'mx-auto justify-center text-center' : 'justify-start text-left'
                  )}
                >
                  <RiShieldCheckFill className="h-5 w-5 shrink-0 text-[#7c3aed]" aria-hidden="true" />
                  {showTrustDescriptor ? (
                    <span data-testid="hero-review-pill-trust" className="min-w-0 leading-5">
                      {resolvedTrustText}
                    </span>
                  ) : null}
                  <span
                    data-testid="hero-review-pill-meta"
                    className="shrink-0 text-[#facc15]"
                    aria-hidden="true"
                  >
                    {REVIEW_STARS}
                  </span>
                  <span className="shrink-0 font-medium text-[#2b253d]">
                    {REVIEW_RATING}/5 | {reviewCount} reviews
                  </span>
                </p>
              )
            )}

            {shouldRenderHeading && (
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
            )}

            {shouldRenderMedia && (
              <div
                className={MOBILE_MEDIA_WRAP_CLASSES}
                aria-hidden={mascotDecorativeOnMobile ? 'true' : undefined}
              >
                <Image
                  src={resolvedMediaSrc}
                  alt={mascotDecorativeOnMobile ? '' : resolvedMediaAlt}
                  aria-hidden={mascotDecorativeOnMobile ? 'true' : undefined}
                  width={980}
                  height={650}
                  priority={mediaPriority}
                  sizes="(max-width: 1024px) 95vw, 46vw"
                  className="relative z-0 h-auto w-full rounded-[1.2rem]"
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
              <p className={clsx(SUBTITLE_CLASSES, isCenter && 'sm:mx-auto')}>{subtitle}</p>
            )}

            {(primaryCta || secondaryCta || actionsSlot) && (
              <div
                className={clsx(
                  CTA_WRAP_CLASSES,
                  shouldRenderMedia && 'clear-both lg:clear-none',
                  isCenter && 'sm:justify-center'
                )}
              >
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
                    <Link
                      href={secondaryCta.href}
                      className="hero-btn-secondary flex w-full justify-center text-center sm:w-auto"
                    >
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

            {children}

            {shouldShowUsageCounter && (
              <div className={clsx('mt-5 w-full', presetStyles.usageText)}>
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
                alt={mascotDecorativeOnDesktop ? '' : resolvedMediaAlt}
                aria-hidden={mascotDecorativeOnDesktop ? 'true' : undefined}
                width={980}
                height={650}
                priority={mediaPriority}
                sizes="(max-width: 1024px) 92vw, 46vw"
                className="h-auto w-full max-w-[680px] rounded-[1.5rem]"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
