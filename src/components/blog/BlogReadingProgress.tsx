'use client';

import { useEffect, useState } from 'react';

export function BlogReadingProgress() {
  const [progress, setProgress] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncMotionPreference = () => setReducedMotion(mediaQuery.matches);
    syncMotionPreference();
    mediaQuery.addEventListener('change', syncMotionPreference);

    let ticking = false;

    const calculateProgress = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (total <= 0) {
        setProgress(0);
      } else {
        setProgress(Math.min(100, Math.max(0, (window.scrollY / total) * 100)));
      }
      ticking = false;
    };

    const onScrollOrResize = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(calculateProgress);
    };

    onScrollOrResize();
    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize);

    return () => {
      mediaQuery.removeEventListener('change', syncMotionPreference);
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, []);

  return (
    <div className="fixed inset-x-0 top-[72px] z-30 h-1 bg-[#f8f1ff]">
      <div
        className={`h-full bg-[#692ed4] ${reducedMotion ? '' : 'transition-[width] duration-150'}`}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
