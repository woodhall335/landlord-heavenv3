/**
 * DEPRECATED: Marketing Hero is now a thin wrapper around UniversalHero.
 */

import React from 'react';
import { UniversalHero } from '@/components/landing/UniversalHero';

export interface HeroAction {
  label: string;
  href: string;
  variant?: 'primary' | 'secondary';
}

export interface TrustIndicator {
  icon: React.ReactNode;
  text: string;
}

export interface HeroProps {
  title: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  badge?: string;
  primaryAction?: HeroAction;
  secondaryAction?: HeroAction;
  trustIndicators?: TrustIndicator[];
  children?: React.ReactNode;
  variant?: 'default' | 'blog';
  align?: 'center' | 'left';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
}

export function Hero({
  title,
  subtitle,
  badge,
  primaryAction,
  secondaryAction,
  trustIndicators,
  children,
  align = 'center',
}: HeroProps) {
  const resolvedTitle = typeof title === 'string' ? title : '';

  return (
    <UniversalHero
      badge={badge}
      title={resolvedTitle}
      subtitle={subtitle}
      primaryCta={primaryAction ? { label: primaryAction.label, href: primaryAction.href } : undefined}
      secondaryCta={secondaryAction ? { label: secondaryAction.label, href: secondaryAction.href } : undefined}
      align={align}
      showReviewPill={false}
      showUsageCounter={false}
      backgroundImageSrc="/images/bg.webp"
    >
      {typeof title !== 'string' && <div className="mb-6 text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">{title}</div>}
      {children}
      {trustIndicators && trustIndicators.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/80">
          {trustIndicators.map((indicator, index) => (
            <span key={index} className="flex items-center gap-1.5 text-white/80">
              {indicator.icon}
              {indicator.text}
            </span>
          ))}
        </div>
      )}
    </UniversalHero>
  );
}

export default Hero;
