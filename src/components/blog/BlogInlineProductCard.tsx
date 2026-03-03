'use client';

import Image from 'next/image';
import Link from 'next/link';
import { trackEvent } from '@/lib/analytics';
import type { ProductCtaConfig } from '@/lib/blog/product-cta-map';

interface BlogInlineProductCardProps {
  cta: ProductCtaConfig;
  postSlug: string;
  category: string;
}

const CTA_ICONS: Record<NonNullable<ProductCtaConfig['iconKey']>, string> = {
  notice: '/images/wizard-icons/13-section-21.png',
  'complete-pack': '/images/wizard-icons/18-forms-bundle.png',
  'money-claim': '/images/wizard-icons/30-arrears-ledger.png',
  ast: '/images/wizard-icons/04-tenancy.png',
};

export function BlogInlineProductCard({ cta, postSlug, category }: BlogInlineProductCardProps) {
  const iconSrc = CTA_ICONS[cta.iconKey ?? 'notice'];

  return (
    <section className="my-10 rounded-3xl border border-[#e8ddfb] bg-[#f8f1ff] p-6 shadow-[0_10px_30px_rgba(105,46,212,0.08)]">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#692ed4]">Recommended next step</p>
      <div className="mt-2 flex items-center gap-3">
        <Image src={iconSrc} alt="Product recommendation" width={28} height={28} className="h-7 w-7" />
        <h3 className="text-xl font-bold text-slate-900">Need to take action now?</h3>
      </div>
      <ul className="mt-4 space-y-2 text-sm text-slate-700">
        {cta.bullets.map((bullet) => (
          <li key={bullet} className="flex items-start gap-2">
            <span className="mt-1 h-2 w-2 flex-none rounded-full bg-[#692ed4]" aria-hidden />
            <span>{bullet}</span>
          </li>
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
        className="mt-5 inline-flex rounded-xl bg-[#692ed4] px-5 py-3 font-semibold text-white transition hover:bg-[#5b24be] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#692ed4] focus-visible:ring-offset-2"
      >
        {cta.ctaLabel}
      </Link>
    </section>
  );
}
