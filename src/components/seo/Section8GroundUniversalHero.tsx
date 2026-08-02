'use client';

import { usePathname } from 'next/navigation';
import { UniversalHero } from '@/components/landing/UniversalHero';

const GROUND_HEROES: Record<string, { label: string; title: string; image: string }> = {
  '1': { label: 'Landlord or family moving in', title: 'How to evict a tenant using Ground 1', image: '/images/heroes/library/hero-guide-possession-claim-v2.webp' },
  '1a': { label: 'Selling the property', title: 'How to evict a tenant using Ground 1A', image: '/images/heroes/library/hero-tenancy-england-standard-v2.webp' },
  '2': { label: 'Mortgage lender sale', title: 'How to evict a tenant using Ground 2', image: '/images/heroes/library/hero-guide-landlord-money-claim-v2.webp' },
  '7a': { label: 'Serious ASB or criminal behaviour', title: 'How to evict a tenant using Ground 7A', image: '/images/heroes/library/hero-guide-antisocial-behaviour-v2.webp' },
  '8': { label: 'Serious rent arrears', title: 'How to evict a tenant using Ground 8', image: '/images/heroes/library/hero-guide-ground8-arrears-v2.webp' },
  '10': { label: 'Any rent arrears', title: 'How to evict a tenant using Ground 10', image: '/images/heroes/library/hero-guide-rent-arrears-schedule-v2.webp' },
  '11': { label: 'Persistent late rent', title: 'How to evict a tenant using Ground 11', image: '/images/heroes/library/hero-section8-guide-v2.webp' },
  '12': { label: 'Breach of tenancy', title: 'How to evict a tenant using Ground 12', image: '/images/heroes/library/hero-guide-tenancy-breach-v2.webp' },
  '13': { label: 'Property deterioration', title: 'How to evict a tenant using Ground 13', image: '/images/heroes/library/hero-guide-property-damage-v2.webp' },
  '14': { label: 'Antisocial behaviour', title: 'How to evict a tenant using Ground 14', image: '/images/heroes/library/hero-guide-court-hearing-v2.webp' },
  '15': { label: 'Furniture deterioration', title: 'How to evict a tenant using Ground 15', image: '/images/heroes/library/hero-guide-deposit-protection-v2.webp' },
  '17': { label: 'False statement by tenant', title: 'How to evict a tenant using Ground 17', image: '/images/heroes/library/hero-guide-proof-of-service-v2.webp' },
};

export function Section8GroundUniversalHero() {
  const pathname = usePathname() ?? '';
  const code = pathname.match(/ground-(1a|7a|\d+)\/?$/i)?.[1]?.toLowerCase() ?? '8';
  if (code === '16') {
    return null;
  }
  const ground = GROUND_HEROES[code] ?? GROUND_HEROES['8'];
  const noticeHref = `/wizard/flow?type=eviction&product=notice_only&src=section8_ground_${code}&ground=${code}`;

  return (
    <UniversalHero
      preset="content_index"
      preTitleLabel="England Form 3A ground guide"
      title={ground.title}
      highlightTitle={ground.label}
      subtitle={`Check what Ground ${code.toUpperCase()} means, the current notice period, evidence to gather, common mistakes and the safest document step before serving Form 3A.`}
      primaryCta={{ label: `Create my Ground ${code.toUpperCase()} notice`, href: noticeHref }}
      secondaryCta={{ label: 'Prepare my court pack', href: `/wizard/flow?type=eviction&product=complete_pack&src=section8_ground_${code}&ground=${code}` }}
      trustText="Current England Section 8 guidance with a preview before payment"
      backgroundImageSrc={ground.image}
      backgroundImageAlt={`Watercolor illustration for the Section 8 Ground ${code.toUpperCase()} landlord guide`}
    />
  );
}
