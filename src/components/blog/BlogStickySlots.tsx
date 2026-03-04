'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { X } from 'lucide-react';
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
  const [mobileDismissed, setMobileDismissed] = useState(false);
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

    const observer = new IntersectionObserver(([entry]) => setShowSticky(!entry.isIntersecting), { threshold: 0.15 });

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

  const sessionDismissed = typeof window !== 'undefined' && window.sessionStorage.getItem(`blog_sticky_dismissed_${postSlug}`) === '1';

  const dismissMobile = () => {
    setMobileDismissed(true);
    window.sessionStorage.setItem(`blog_sticky_dismissed_${postSlug}`, '1');
  };

  return (
    <>
      {showDesktop && (
        <div
          data-blog-sticky-slot="desktop"
          className={`hidden lg:block rounded-2xl border border-[#e4d4ff] bg-[#f8f1ff] p-5 shadow-sm transition-all duration-200 ${showSticky ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-2 opacity-0'}`}
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-[#692ed4]">Ready to generate your notice?</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            {cta.bullets.slice(0, 3).map((bullet) => (
              <li key={bullet} className="flex items-start gap-2">
                <Image src="/images/wizard-icons/50-success.png" alt="" aria-hidden width={14} height={14} className="mt-1 h-3.5 w-3.5" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
          <Link
            href={cta.primaryProductHref}
            onClick={() => onClick('desktop_sticky')}
            className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-[#692ed4] px-4 py-3 font-semibold text-white hover:bg-[#5f27c3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#692ed4] focus-visible:ring-offset-2"
          >
            Generate Notice →
          </Link>
        </div>
      )}

      {showMobile && (
        <div
          data-blog-sticky-slot="mobile"
          className={`lg:hidden fixed inset-x-0 bottom-0 z-40 border-t border-[#e5d7ff] bg-white/95 px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_24px_rgba(15,23,42,0.12)] backdrop-blur transition-transform duration-200 ${showSticky && !mobileDismissed && !sessionDismissed ? 'translate-y-0' : 'translate-y-full'}`}
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#692ed4]">Court-ready workflow</span>
            <button
              type="button"
              aria-label="Dismiss sticky call to action"
              onClick={dismissMobile}
              className="rounded p-1 text-gray-500 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#692ed4]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <Link
            href={cta.primaryProductHref}
            onClick={() => onClick('mobile_bar')}
            className="inline-flex w-full items-center justify-center rounded-lg bg-[#692ed4] px-4 py-3 font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#692ed4] focus-visible:ring-offset-2"
          >
            Generate Notice →
          </Link>
        </div>
      )}
    </>
  );
}
