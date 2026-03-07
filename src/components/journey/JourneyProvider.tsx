'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { hasAnalyticsConsent } from '@/lib/consent';
import { setJourneyState, type JourneyTouchType, type JurisdictionEstimate } from '@/lib/journey/state';
import { trackCtaClick, trackScrollDepth } from '@/lib/journey/events';

const SCROLL_MARKERS: Array<25 | 50 | 75 | 90> = [25, 50, 75, 90];

function inferTouchType(pathname: string): JourneyTouchType {
  if (pathname.startsWith('/blog')) return 'blog';
  if (pathname.startsWith('/tools')) return 'tool';
  if (pathname.startsWith('/ask-heaven')) return 'ask_heaven';
  if (pathname.startsWith('/products')) return 'product';
  return 'blog';
}

function inferJurisdiction(pathname: string): JurisdictionEstimate {
  const normalized = pathname.toLowerCase();
  if (normalized.includes('wales')) return 'wales';
  if (normalized.includes('scotland')) return 'scotland';
  if (normalized.includes('northern-ireland') || normalized.includes('/ni-')) return 'ni';
  if (normalized.includes('england') || normalized.includes('section-8') || normalized.includes('section-21')) {
    return 'england';
  }
  return 'unknown';
}

export function JourneyProvider(): null {
  const pathname = usePathname();
  const seenDepth = useRef(new Set<number>());

  useEffect(() => {
    setJourneyState(
      {
        jurisdiction_estimate: inferJurisdiction(pathname),
        last_touch: {
          type: inferTouchType(pathname),
          id: pathname,
          ts: Date.now(),
        },
      },
      'journey_route_change',
    );

    seenDepth.current.clear();
  }, [pathname]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!hasAnalyticsConsent()) return;

      const target = event.target as HTMLElement | null;
      const ctaEl = target?.closest<HTMLElement>('[data-lh-cta="true"]');
      if (!ctaEl) return;

      const ctaId = ctaEl.dataset.lhCtaId || 'unknown';
      const ctaLocation = ctaEl.dataset.lhCtaLocation || 'unknown';

      setJourneyState(
        {
          last_cta: {
            id: ctaId,
            location: ctaLocation,
            ts: Date.now(),
          },
        },
        'journey_cta_click',
      );

      trackCtaClick({
        cta_id: ctaId,
        location: ctaLocation,
      });
    };

    window.addEventListener('click', onClick);
    return () => {
      window.removeEventListener('click', onClick);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => {
      if (!hasAnalyticsConsent()) return;

      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (documentHeight <= 0) return;

      const depth = Math.round((window.scrollY / documentHeight) * 100);

      for (const marker of SCROLL_MARKERS) {
        if (depth >= marker && !seenDepth.current.has(marker)) {
          seenDepth.current.add(marker);
          trackScrollDepth({ depth: marker });
        }
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, [pathname]);

  return null;
}
