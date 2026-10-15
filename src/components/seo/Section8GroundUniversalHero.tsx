'use client';

import { usePathname } from 'next/navigation';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { TrackedLink } from '@/components/analytics/TrackedLink';
import { getSection8GroundGuide } from '@/lib/seo/section8-ground-guide';
import { PRODUCTS } from '@/lib/pricing/products';

export function Section8GroundUniversalHero() {
  const pathname = usePathname() ?? '';
  const code = pathname.match(/ground-(1a|7a|\d+)\/?$/i)?.[1]?.toLowerCase() ?? '8';
  if (code === '16') {
    return null;
  }
  const ground = getSection8GroundGuide(code);
  const noticeHref = `/wizard/flow?type=eviction&product=notice_only&src=section8_ground_${code}&ground=${code}`;
  const consultationHref = `/assisted-prep/start?service=section8&product=notice_only&src=section8_ground_${code}_hero`;

  return (
    <UniversalHero
      preset="content_index"
      preTitleLabel="England Form 3A ground guide"
      title={`Section 8 Ground ${ground.code}:`}
      highlightTitle={ground.label}
      subtitle={`${ground.searchLead} Check the current Form 3A notice requirements, evidence to keep and what to do if your tenant does not leave.`}
      actionsSlot={(
        <>
          <TrackedLink
            href={noticeHref}
            pagePath={pathname}
            pageType="entry_page"
            ctaLabel={`Create Ground ${ground.code} Form 3A — ${PRODUCTS.notice_only.displayPrice}`}
            ctaPosition="hero"
            eventName="entry_page_primary_cta_click"
            routeIntent={`section8_ground_${code}`}
            product="notice_only"
            className="hero-btn-primary flex w-full justify-center text-center sm:w-auto"
          >
            Create Ground {ground.code} Form 3A — {PRODUCTS.notice_only.displayPrice}
          </TrackedLink>
          <TrackedLink
            href={consultationHref}
            pagePath={pathname}
            pageType="entry_page"
            ctaLabel="Book a free consultation"
            ctaPosition="hero"
            eventName="entry_page_secondary_cta_click"
            routeIntent={`section8_ground_${code}_assisted`}
            product="notice_only"
            className="hero-btn-secondary flex w-full justify-center text-center sm:w-auto"
          >
            Book a free consultation
          </TrackedLink>
        </>
      )}
      trustText="Free consultation first. Pay only if we agree we can help."
      backgroundImageSrc={ground.image}
      backgroundImageAlt={`Watercolor illustration for the Section 8 Ground ${ground.code} landlord guide`}
    />
  );
}
