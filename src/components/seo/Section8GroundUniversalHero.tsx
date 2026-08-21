'use client';

import { usePathname } from 'next/navigation';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { getSection8GroundGuide } from '@/lib/seo/section8-ground-guide';

export function Section8GroundUniversalHero() {
  const pathname = usePathname() ?? '';
  const code = pathname.match(/ground-(1a|7a|\d+)\/?$/i)?.[1]?.toLowerCase() ?? '8';
  if (code === '16') {
    return null;
  }
  const ground = getSection8GroundGuide(code);
  const noticeHref = `/wizard/flow?type=eviction&product=notice_only&src=section8_ground_${code}&ground=${code}`;

  return (
    <UniversalHero
      preset="content_index"
      preTitleLabel="England Form 3A ground guide"
      title={`Section 8 Ground ${ground.code}:`}
      highlightTitle={ground.label}
      subtitle={`${ground.searchLead} Check the current Form 3A notice requirements, evidence to keep and what to do if your tenant does not leave.`}
      primaryCta={{ label: 'Start my Section 8 notice', href: noticeHref }}
      secondaryCta={{ label: 'Book a free consultation', href: `/assisted-prep/start?service=section8&product=notice_only&src=section8_ground_${code}_hero` }}
      trustText="Free consultation first. Pay only if we agree we can help."
      backgroundImageSrc={ground.image}
      backgroundImageAlt={`Watercolor illustration for the Section 8 Ground ${ground.code} landlord guide`}
    />
  );
}
