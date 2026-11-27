'use client';
import { useEffect, useRef } from 'react';

/** Scroll once when payment status has settled; never follow later rerenders. */
export function useReviewActionScroll(waiting = false) {
  const rootRef = useRef<HTMLElement>(null);
  const scrolled = useRef(false);
  useEffect(() => {
    if (waiting || scrolled.current) return;
    const frame = window.requestAnimationFrame(() => {
      const target = rootRef.current?.querySelector<HTMLElement>('[data-review-actions]') ||
        rootRef.current?.querySelector<HTMLElement>('[data-review-primary-action]');
      if (!target) return;
      scrolled.current = true;
      const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      target.scrollIntoView?.({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [waiting]);
  return rootRef;
}
