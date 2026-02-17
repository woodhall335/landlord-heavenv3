/**
 * DEPRECATED: TealHero is now a thin wrapper around UniversalHero.
 */

import React from 'react';
import { UniversalHero } from '@/components/landing/UniversalHero';

interface TealHeroProps {
  title: string;
  subtitle?: React.ReactNode;
  eyebrow?: string;
  actions?: React.ReactNode;
  breadcrumb?: React.ReactNode;
  align?: 'center' | 'left';
}

export function TealHero({
  title,
  subtitle,
  eyebrow,
  actions,
  breadcrumb,
  align = 'center',
}: TealHeroProps) {
  return (
    <UniversalHero
      badge={eyebrow}
      title={title}
      subtitle={subtitle}
      align={align}
      actionsSlot={actions}
      showReviewPill={false}
      showUsageCounter={false}
      backgroundImageSrc="/images/bg.webp"
    >
      {breadcrumb && <div className="mb-4 text-sm text-white/80">{breadcrumb}</div>}
    </UniversalHero>
  );
}

export default TealHero;
