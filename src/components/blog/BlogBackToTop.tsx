'use client';

import { useEffect, useState } from 'react';

export function BlogBackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 700);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!show) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-24 right-4 z-30 rounded-full border border-[#e9dcff] bg-white px-3 py-2 text-sm font-medium text-[#692ed4] shadow"
    >
      Back to top
    </button>
  );
}
