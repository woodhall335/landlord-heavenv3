/**
 * DEPRECATED: UI Hero is now a thin wrapper around UniversalHero.
 */

import React from 'react';
import { UniversalHero } from '@/components/landing/UniversalHero';

interface HeroProps {
  title: string;
  subtitle?: string;
  description: string;
  ctaText?: string;
  ctaHref?: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
  badge?: string;
  variant?: 'primary' | 'secondary' | 'gradient';
}

export function Hero({
  title,
  subtitle,
  description,
  ctaText,
  ctaHref,
  secondaryCtaText,
  secondaryCtaHref,
  badge,
}: HeroProps) {
  return (
    <UniversalHero
      badge={badge}
      title={title}
      subtitle={
        <>
          {subtitle && <span className="mb-2 block text-white/80">{subtitle}</span>}
          {description}
        </>
      }
      primaryCta={ctaText && ctaHref ? { label: ctaText, href: ctaHref } : undefined}
      secondaryCta={secondaryCtaText && secondaryCtaHref ? { label: secondaryCtaText, href: secondaryCtaHref } : undefined}
      align="center"
      backgroundImageSrc="/images/bg.webp"
      showReviewPill={false}
      showUsageCounter={false}
    />
  );
}
