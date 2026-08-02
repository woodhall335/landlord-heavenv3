'use client';

import { useEffect, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BadgeCheck, FileDown, Headphones } from 'lucide-react';
import { RiCheckLine, RiShieldCheckFill } from 'react-icons/ri';
import { StaggerReveal } from '@/components/marketing/PremiumMotion';
import { TrustPositioningBar } from '@/components/marketing/TrustPositioningBar';
import { UsageTodayCounter } from '@/components/seo/UsageTodayCounter';
import type { PositioningPreset } from '@/lib/marketing/positioning';
import { getDynamicReviewCount, REVIEW_RATING } from '@/lib/reviews/reviewStats';
import { getUniversalHeroImage, type UniversalHeroImageKey } from '@/config/universal-hero-images';
import { getUniversalHeroImageForPath } from '@/config/universal-hero-images';
import { findUniversalHeroForPath } from '@/config/universal-hero-library';
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
  'relative isolate flex min-h-[100svh] overflow-hidden pb-10 pt-28 sm:pb-12 sm:pt-32 lg:min-h-[100dvh] lg:items-center lg:pb-16 lg:pt-36';
const CTA_WRAP_CLASSES = 'mt-6 flex w-full flex-col gap-3 sm:flex-row sm:items-center';
const REVIEW_STARS = '\u2605\u2605\u2605\u2605\u2605';

const HERO_BENEFITS = [
  { label: 'Legally valid', Icon: BadgeCheck },
  { label: 'Instant download', Icon: FileDown },
  { label: 'Expert support', Icon: Headphones },
] as const;

function HeroBenefitGrid() {
  return (
    <div
      className="mt-6 grid w-full grid-cols-4 gap-2 sm:max-w-[40rem] sm:gap-3 lg:hidden"
      aria-label="Purchase benefits"
      data-testid="hero-benefit-grid"
    >
      {HERO_BENEFITS.map(({ label, Icon }) => (
        <div
          key={label}
          className="flex min-h-[5.8rem] flex-col items-center justify-center rounded-2xl border border-[#e5ddf7] bg-white/88 px-1.5 py-3 text-center shadow-[0_12px_30px_rgba(64,35,119,0.07)] backdrop-blur-sm sm:min-h-[6.4rem] sm:px-3"
        >
          <Icon className="h-6 w-6 text-[#6333d5] sm:h-7 sm:w-7" strokeWidth={1.8} aria-hidden="true" />
          <span className="mt-2 text-[0.7rem] font-semibold leading-tight text-[#21153d] sm:text-sm">
            {label}
          </span>
        </div>
      ))}
      <div className="flex min-h-[5.8rem] flex-col items-center justify-center rounded-2xl border border-[#e5ddf7] bg-white/88 px-1.5 py-3 text-center shadow-[0_12px_30px_rgba(64,35,119,0.07)] backdrop-blur-sm sm:min-h-[6.4rem] sm:px-3">
        <span
          className="text-xl font-black tracking-[-0.06em] text-[#6333d5] sm:text-2xl"
          aria-label="Stripe"
        >
          stripe
        </span>
        <span className="mt-2 text-[0.7rem] font-semibold leading-tight text-[#21153d] sm:text-sm">
          Secure payment
        </span>
      </div>
    </div>
  );
}

export type UniversalHeroProps = {
  preset?: PublicHeroPreset;
  variant?: 'pastel';
  preTitleLabel?: string;
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
  backgroundImageKey?: UniversalHeroImageKey;
  backgroundImageAlt?: string;
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
  variant,
  preTitleLabel,
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
  backgroundImageSrc,
  backgroundImageKey,
  backgroundImageAlt = 'Watercolor illustration for Landlord Heaven landlord documents',
  showTrustPositioningBar = false,
  trustPositioningPreset = 'default',
  trustPositioningHeadline,
  reviewPillLayout = 'auto',
}: UniversalHeroProps) {
  const pathname = usePathname() ?? '/';
  const isValidHeading = headingAs === 'h1' || headingAs === 'h2';
  const HeadingTag = isValidHeading ? headingAs : 'h1';
  const reviewCount = getDynamicReviewCount();
  const presetStyles = PUBLIC_HERO_PRESET_STYLES[preset];
  const shouldRenderHeading = Boolean(title || highlightTitle);
  // The new public hero contract keeps proof and live usage visible everywhere.
  // Legacy wrappers may still pass false while they are migrated; retain the
  // props for API compatibility but apply the site-wide presentation here.
  const shouldShowReviewPill = true;
  const shouldShowUsageCounter = true;
  const resolvedTrustText =
    trustText ?? 'Guided landlord document preparation with preview before payment.';
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
  // Universal heroes use one route-specific watercolor background only.
  // Keep legacy media props in the API while wrappers are migrated, but never
  // render a competing laptop/product image inside the universal hero.
  void hideMedia;
  void mediaSrc;
  void mediaAlt;
  void mediaPriority;
  void mascotSrc;
  void mascotAlt;
  void mascotDecorativeOnMobile;
  void mascotDecorativeOnDesktop;
  void variant;
  void showReviewPill;
  void showUsageCounter;
  const isPastel = true;
  const routeHero = findUniversalHeroForPath(pathname);
  const resolvedBackgroundImageSrc =
    backgroundImageSrc ??
    routeHero?.src ??
    (backgroundImageKey
      ? getUniversalHeroImage(backgroundImageKey)
      : getUniversalHeroImageForPath(pathname));
  const resolvedBackgroundImageAlt = backgroundImageSrc
    ? backgroundImageAlt
    : routeHero?.alt ?? backgroundImageAlt;

  useEffect(() => {
    if (!isValidHeading) {
      warnOnce('UniversalHero: headingAs must be either "h1" or "h2".');
    }

    if (ariaLabel !== undefined && ariaLabel.trim() === '') {
      warnOnce('UniversalHero: ariaLabel should be non-empty when provided.');
    }

  }, [
    ariaLabel,
    isValidHeading,
  ]);

  return (
    <section
      className={clsx(SECTION_WRAP_CLASSES, presetStyles.section)}
      aria-label={ariaLabel}
      id={id}
      data-universal-hero="true"
      data-hero-variant={isPastel ? 'pastel' : 'standard'}
    >
      <div className="pointer-events-none absolute inset-0 -z-20" aria-hidden="true">
        <Image
          src={resolvedBackgroundImageSrc}
          alt={resolvedBackgroundImageAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-[72%_bottom] lg:object-center"
        />
      </div>
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(255,255,255,0.99)_0%,rgba(255,255,255,0.98)_50%,rgba(255,255,255,0.72)_67%,rgba(255,255,255,0.08)_100%)] lg:bg-[linear-gradient(90deg,rgba(255,255,255,0.99)_0%,rgba(255,255,255,0.96)_47%,rgba(255,255,255,0.44)_62%,rgba(255,255,255,0.04)_100%)]"
        aria-hidden="true"
      />
      <div
        className={clsx('pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-32', isPastel ? 'bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(244,239,255,0.62)_100%)]' : 'bg-[linear-gradient(180deg,rgba(15,6,31,0)_0%,rgba(15,6,31,0.24)_100%)]')}
        aria-hidden="true"
      />

      <div className="mx-auto my-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className={clsx(
            'block gap-8 lg:grid lg:grid-cols-2 lg:items-center lg:gap-10'
          )}
        >
          <StaggerReveal
            className={clsx(
              'relative z-10 w-full min-w-0',
              isCenter ? 'text-center lg:text-center' : 'text-left',
              hideMedia && !isPastel && 'max-w-3xl mx-auto'
            )}
          >
            {shouldShowReviewPill && (
              <p
                data-testid="hero-review-pill-mobile"
                className={clsx(
                  'mb-4 inline-flex w-fit max-w-full items-center gap-1.5 whitespace-nowrap rounded-full border border-[#e5ddf7] bg-white/90 px-3 py-2 text-xs font-semibold text-[#271b45] shadow-sm backdrop-blur-sm lg:hidden',
                  isCenter ? 'justify-center text-center' : 'justify-start text-left'
                )}
              >
                <RiCheckLine className="h-4 w-4 text-[#6333d5]" aria-hidden="true" />
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
                    'text-[#271b45]',
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
                    'text-[#271b45]',
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

            {preTitleLabel ? (
              <p
                className={clsx(
                  'mt-5 inline-flex items-center rounded-full border border-[#9F7AEA] bg-[#7c3aed] px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-white shadow-[0_12px_30px_rgba(124,58,237,0.35)] backdrop-blur-sm',
                  isCenter && 'mx-auto'
                )}
              >
                {preTitleLabel}
              </p>
            ) : null}

            {shouldRenderHeading && (
              <HeadingTag
                className={clsx(
                  preTitleLabel
                    ? 'mt-3 text-[2.125rem] font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl'
                    : 'mt-5 text-[2.125rem] font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl',
                  isPastel ? 'text-[#17112f]' : 'text-white',
                  'max-w-[18ch] lg:max-w-none'
                )}
              >
                {title}
                {highlightTitle && (
                  <>
                    {' '}
                    <span className={clsx('block', isPastel ? 'text-[#6333d5]' : 'text-white')}>{highlightTitle}</span>
                  </>
                )}
              </HeadingTag>
            )}

            {subtitle && (
              <p
                className={clsx(
                  'mt-4 px-0 py-0 text-lg leading-relaxed sm:max-w-[52ch] sm:text-xl',
                  isPastel ? 'text-[#5f5871]' : 'text-white/85',
                  'w-full',
                  isCenter && 'sm:mx-auto'
                )}
              >
                {subtitle}
              </p>
            )}

            {(primaryCta || secondaryCta || actionsSlot) && (
              <div
                className={clsx(
                  CTA_WRAP_CLASSES,
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
              <div className={clsx('mt-6 flex w-full items-start gap-2 text-base font-medium sm:text-lg', isPastel ? 'text-[#443a59]' : 'text-white/85')}>
                <RiCheckLine className={clsx('mt-0.5 h-5 w-5 flex-none', isPastel ? 'text-[#6333d5]' : 'text-white')} aria-hidden="true" />
                <span>{feature}</span>
              </div>
            )}

            {showTrustPositioningBar ? (
              <TrustPositioningBar
                preset={trustPositioningPreset}
                headline={trustPositioningHeadline}
                className={isCenter ? 'mx-auto max-w-5xl text-left' : undefined}
              />
            ) : null}

            {children}

            <HeroBenefitGrid />

            {shouldShowUsageCounter && (
              <div className="mt-5 w-full text-[#271b45]">
                <UsageTodayCounter />
              </div>
            )}
          </StaggerReveal>
        </div>
      </div>
    </section>
  );
}
