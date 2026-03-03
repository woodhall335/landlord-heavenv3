'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { trackEvent } from '@/lib/analytics';

interface BlogStickySlotsProps {
  ctaHref: string;
  ctaLabel: string;
  postSlug: string;
  showDesktop?: boolean;
  showMobile?: boolean;
}

export function BlogStickySlots({ ctaHref, ctaLabel, postSlug, showDesktop = true, showMobile = true }: BlogStickySlotsProps) {
  const [showSticky, setShowSticky] = useState(false);
  const source = useMemo(() => `blog_${postSlug}`, [postSlug]);

  useEffect(() => {
    const hero = document.getElementById('blog-hero');
    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => setShowSticky(!entry.isIntersecting),
      { threshold: 0.1 }
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  const onClick = (slot: 'desktop_sidebar' | 'mobile_bottom') => {
    trackEvent('click_blog_sticky_cta', { slot, source, href: ctaHref });
  };

  return (
    <>
      {showDesktop && <div className={`hidden lg:block rounded-2xl border border-[#e9dcff] bg-[#f8f1ff] p-5 transition-opacity ${showSticky ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <p className="text-xs font-semibold uppercase tracking-wide text-[#692ed4]">Need to serve a notice?</p>
        <p className="mt-2 text-sm text-slate-700">Generate a court-ready notice with compliance checks built in.</p>
        <Link
          href={ctaHref}
          onClick={() => onClick('desktop_sidebar')}
          className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-[#692ed4] px-4 py-3 font-semibold text-white hover:opacity-90"
        >
          {ctaLabel}
        </Link>
      </div>}

      {showMobile && <div className={`lg:hidden fixed inset-x-0 bottom-0 z-40 border-t border-[#e9dcff] bg-white/95 backdrop-blur px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 transition-transform ${showSticky ? 'translate-y-0' : 'translate-y-full'}`}>
        <Link
          href={ctaHref}
          onClick={() => onClick('mobile_bottom')}
          className="inline-flex w-full items-center justify-center rounded-lg bg-[#692ed4] px-4 py-3 font-semibold text-white"
        >
          {ctaLabel}
        </Link>
      </div>}
    </>
  );
}
