'use client';

import { useEffect, useState } from 'react';

const VISIBILITY_SCROLL_THRESHOLD = 700;

export function BlogBackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let ticking = false;

    const updateVisibility = () => {
      setShow(window.scrollY > VISIBILITY_SCROLL_THRESHOLD);
      ticking = false;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateVisibility);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!show) return null;

  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={() => {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      }}
      className="fixed bottom-24 right-4 z-30 rounded-full border border-[#e9dcff] bg-white px-3 py-2 text-sm font-medium text-[#692ed4] shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#692ed4] focus-visible:ring-offset-2"
    >
      Back to top
    </button>
  );
}
