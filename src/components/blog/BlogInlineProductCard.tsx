'use client';

import Link from 'next/link';
import { trackEvent } from '@/lib/analytics';
import type { ProductCtaConfig } from '@/lib/blog/product-cta-map';

interface BlogInlineProductCardProps {
  cta: ProductCtaConfig;
  postSlug: string;
  category: string;
}

export function BlogInlineProductCard({ cta, postSlug, category }: BlogInlineProductCardProps) {
  return (
    <section className="my-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#692ed4]">Recommended next step</p>
      <h3 className="mt-2 text-xl font-bold text-slate-900">Need to take action now?</h3>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
        {cta.bullets.map((bullet) => (
          <li key={bullet}>{bullet}</li>
        ))}
      </ul>
      <Link
        href={cta.primaryProductHref}
        onClick={() =>
          trackEvent('click_blog_inline_product_card', {
            slug: postSlug,
            category,
            productHref: cta.primaryProductHref,
            placement: 'inline',
          })
        }
        className="mt-4 inline-flex rounded-lg bg-[#692ed4] px-4 py-2.5 font-semibold text-white"
      >
        {cta.ctaLabel}
      </Link>
    </section>
  );
}
