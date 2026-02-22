/**
 * DEPRECATED: StandardHero is now a thin wrapper around UniversalHero.
 * Prefer using UniversalHero directly for all new hero implementations.
 */

import React from 'react';
import { clsx } from 'clsx';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { TrustPositioningBar } from '@/components/marketing/TrustPositioningBar';

export interface StandardHeroCTA {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface StandardHeroProps {
  badge?: string;
  badgeIcon?: React.ReactNode;
  title: React.ReactNode;
  titleAs?: 'h1' | 'h2';
  subtitle?: React.ReactNode;
  primaryCTA?: StandardHeroCTA;
  secondaryCTA?: StandardHeroCTA;
  align?: 'left' | 'center';
  variant?: 'pastel' | 'white';
  children?: React.ReactNode;
  className?: string;
}

function normalizeTitle(title: React.ReactNode): { title: string; highlightTitle?: string } {
  if (typeof title === 'string') {
    return { title };
  }

  return { title: '', highlightTitle: '', };
}

export function StandardHero({
  badge,
  badgeIcon,
  title,
  titleAs = 'h1',
  subtitle,
  primaryCTA,
  secondaryCTA,
  align = 'center',
  variant = 'pastel',
  children,
  className,
}: StandardHeroProps) {
  const normalized = normalizeTitle(title);

  if (typeof title !== 'string') {
    return (
      <section className={clsx('relative overflow-hidden pt-28 pb-16 md:pt-32 md:pb-36', className)}>
        <UniversalHero
          badge={badge}
          badgeIcon={badgeIcon}
          title=""
          subtitle={subtitle}
          primaryCta={primaryCTA?.href ? { label: primaryCTA.label, href: primaryCTA.href } : undefined}
          secondaryCta={secondaryCTA?.href ? { label: secondaryCTA.label, href: secondaryCTA.href } : undefined}
          headingAs={titleAs}
          align={align}
          backgroundImageSrc={variant === 'pastel' ? '/images/bg.webp' : '/images/bg.webp'}
          showReviewPill={false}
          showUsageCounter={false}
        >
          <div className={clsx('mt-2 text-white', align === 'center' ? 'text-center' : 'text-left')}>
            <div className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-white">{title}</div>
            <TrustPositioningBar variant="compact" />
        {children}
          </div>
        </UniversalHero>
      </section>
    );
  }

  return (
    <section className={className}>
      <UniversalHero
        badge={badge}
        badgeIcon={badgeIcon}
        title={normalized.title}
        highlightTitle={normalized.highlightTitle}
        subtitle={subtitle}
        primaryCta={primaryCTA?.href ? { label: primaryCTA.label, href: primaryCTA.href } : undefined}
        secondaryCta={secondaryCTA?.href ? { label: secondaryCTA.label, href: secondaryCTA.href } : undefined}
        headingAs={titleAs}
        align={align}
        backgroundImageSrc={variant === 'pastel' ? '/images/bg.webp' : '/images/bg.webp'}
        showReviewPill={false}
        showUsageCounter={false}
      >
        <TrustPositioningBar variant="compact" />
        {children}
      </UniversalHero>
    </section>
  );
}

export default StandardHero;
