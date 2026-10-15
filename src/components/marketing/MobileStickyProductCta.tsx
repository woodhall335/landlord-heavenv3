'use client';

import { useEffect, useState } from 'react';
import { TrackedLink } from '@/components/analytics/TrackedLink';

export function MobileStickyProductCta({
  href,
  label,
  price,
  pagePath,
  product,
}: {
  href: string;
  label: string;
  price: string;
  pagePath: string;
  product: string;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const update = () => setVisible(window.scrollY > 720);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#D9CBFF] bg-white/95 p-3 shadow-[0_-8px_30px_rgba(42,33,97,0.14)] backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-md items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold uppercase tracking-[0.12em] text-primary">Section 8 notice</p>
          <p className="text-sm font-semibold text-[#2a2161]">Preview before paying · {price}</p>
        </div>
        <TrackedLink
          href={href}
          pagePath={pagePath}
          pageType="product_page"
          ctaLabel={label}
          ctaPosition="bottom"
          eventName="entry_page_primary_cta_click"
          routeIntent={product}
          product={product}
          className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white"
        >
          Start now
        </TrackedLink>
      </div>
    </div>
  );
}
