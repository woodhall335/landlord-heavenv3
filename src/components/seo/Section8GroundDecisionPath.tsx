'use client';

import { usePathname } from 'next/navigation';
import { getSection8GroundGuide } from '@/lib/seo/section8-ground-guide';
import { Section8GroundRouteCards } from '@/components/seo/Section8GroundRouteCards';

export function Section8GroundDecisionPath() {
  const pathname = usePathname() ?? '';
  const groundCode = pathname.match(/ground-(1a|7a|\d+)\/?$/i)?.[1]?.toLowerCase();

  if (!groundCode || groundCode === '16') {
    return null;
  }

  const guide = getSection8GroundGuide(groundCode);

  return (
    <Section8GroundRouteCards
      groundCode={guide.code}
      groundLabel={guide.label}
      source={`section8_ground_${groundCode}`}
      pagePath={pathname}
    />
  );
}
