'use client';

import { useEffect, useState } from 'react';

export function BlogReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (total <= 0) return setProgress(0);
      setProgress(Math.min(100, Math.max(0, (window.scrollY / total) * 100)));
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div className="fixed inset-x-0 top-[72px] z-30 h-1 bg-[#f8f1ff]">
      <div className="h-full bg-[#692ed4] transition-[width] duration-150" style={{ width: `${progress}%` }} />
    </div>
  );
}
