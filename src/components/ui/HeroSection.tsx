/**
 * DEPRECATED: HeroSection is now a thin wrapper around UniversalHero.
 */

import React from 'react';
import { UniversalHero } from '@/components/landing/UniversalHero';

interface HeroSectionProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  actions?: React.ReactNode;
  breadcrumb?: React.ReactNode;
  align?: 'center' | 'left';
  background?: 'lavender' | 'white' | 'cream' | 'dark';
  mediaSlot?: React.ReactNode;
  badge?: string;
}

export function HeroSection({
  title,
  subtitle,
  eyebrow,
  actions,
  breadcrumb,
  align = 'center',
  mediaSlot,
  badge,
}: HeroSectionProps) {
  return (
    <UniversalHero
      badge={badge ?? eyebrow}
      title={title}
      subtitle={subtitle}
      align={align}
      actionsSlot={actions}
      showReviewPill={false}
      showUsageCounter={false}
      backgroundImageSrc="/images/bg.webp"
    >
      {breadcrumb && <div className="mb-4 text-sm text-white/80">{breadcrumb}</div>}
      {mediaSlot}
    </UniversalHero>
  );
}

export default HeroSection;
