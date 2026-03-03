'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { trackEvent } from '@/lib/analytics';
import type { ProductCtaConfig } from '@/lib/blog/product-cta-map';

interface BlogStickySlotsProps {
  cta: ProductCtaConfig;
  postSlug: string;
  category: string;
  showDesktop?: boolean;
  showMobile?: boolean;
}

const ACTIVE_SLOTS = { desktop: 0, mobile: 0 };

export function BlogStickySlots({ cta, postSlug, category, showDesktop = true, showMobile = true }: BlogStickySlotsProps) {
  const [showSticky, setShowSticky] = useState(false);
  const source = useMemo(() => `blog_${postSlug}`, [postSlug]);
  const warnedRef = useRef(false);

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;

    if (showDesktop) ACTIVE_SLOTS.desktop += 1;
    if (showMobile) ACTIVE_SLOTS.mobile += 1;

    if (!warnedRef.current && (ACTIVE_SLOTS.desktop > 1 || ACTIVE_SLOTS.mobile > 1)) {
      warnedRef.current = true;
      console.warn('[blog] More than one sticky CTA slot rendered', {
        desktopSlots: ACTIVE_SLOTS.desktop,
        mobileSlots: ACTIVE_SLOTS.mobile,
        slug: postSlug,
      });
    }

    return () => {
      if (showDesktop) ACTIVE_SLOTS.desktop = Math.max(0, ACTIVE_SLOTS.desktop - 1);
      if (showMobile) ACTIVE_SLOTS.mobile = Math.max(0, ACTIVE_SLOTS.mobile - 1);
    };
  }, [postSlug, showDesktop, showMobile]);

  useEffect(() => {
    const hero = document.getElementById('blog-hero');
    if (!hero) return;

    const observer = new IntersectionObserver(([entry]) => setShowSticky(!entry.isIntersecting), { threshold: 0.1 });

    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  const onClick = (placement: 'desktop_sticky' | 'mobile_bar') => {
    trackEvent('click_blog_sticky_cta', {
      slot: placement,
      placement,
      source,
      slug: postSlug,
      category,
      productHref: cta.primaryProductHref,
    });
  };

  return (
    <>
      {showDesktop && (
        <div className={`hidden lg:block rounded-2xl border border-[#e9dcff] bg-[#f8f1ff] p-5 transition-opacity ${showSticky ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#692ed4]">Recommended product</p>
          <p className="mt-2 text-sm text-slate-700">{cta.bullets[0]}</p>
          <Link
            href={cta.primaryProductHref}
            onClick={() => onClick('desktop_sticky')}
            className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-[#692ed4] px-4 py-3 font-semibold text-white hover:opacity-90"
          >
            {cta.ctaLabel}
          </Link>
        </div>
      )}

      {showMobile && (
        <div className={`lg:hidden fixed inset-x-0 bottom-0 z-40 border-t border-[#e9dcff] bg-white/95 backdrop-blur px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 transition-transform ${showSticky ? 'translate-y-0' : 'translate-y-full'}`}>
          <Link
            href={cta.primaryProductHref}
            onClick={() => onClick('mobile_bar')}
            className="inline-flex w-full items-center justify-center rounded-lg bg-[#692ed4] px-4 py-3 font-semibold text-white"
          >
            {cta.ctaLabel}
          </Link>
        </div>
      )}
    </>
  );
}
