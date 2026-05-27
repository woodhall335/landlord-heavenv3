'use client';

import Image from 'next/image';
import Link from 'next/link';
import { trackEvent } from '@/lib/analytics';
import type { ProductCtaConfig } from '@/lib/blog/product-cta-map';
import { Reveal, StaggerReveal } from '@/components/marketing/PremiumMotion';

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

export function BlogInlineProductCard({
  cta,
  postSlug,
  category,
}: BlogInlineProductCardProps) {
  const iconSrc = CTA_ICONS[cta.iconKey ?? 'notice'];

  return (
    <Reveal as="section" className="my-10 rounded-3xl border border-[#e8ddfb] bg-[linear-gradient(135deg,#f8f1ff,#ffffff)] p-6 shadow-[0_18px_50px_rgba(105,46,212,0.12)]">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#692ed4]">
        {cta.eyebrow}
      </p>
      <div className="mt-2 flex items-center gap-3">
        <Image
          src={iconSrc}
          alt="Recommended next step"
          width={28}
          height={28}
          className="h-7 w-7"
        />
        <h3 className="text-xl font-bold text-slate-900">{cta.heading}</h3>
      </div>
      <p className="mt-3 text-sm text-slate-700">{cta.intro}</p>
      <StaggerReveal as="ul" className="mt-4 space-y-2 text-sm text-slate-700">
        {cta.bullets.map((bullet) => (
          <li key={bullet} className="flex items-start gap-2">
            <span className="mt-1 h-2 w-2 flex-none rounded-full bg-[#692ed4]" aria-hidden />
            <span>{bullet}</span>
          </li>
        ))}
      </StaggerReveal>
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
        className="mt-5 inline-flex rounded-xl bg-[#692ed4] px-5 py-3 font-semibold text-white shadow-[0_14px_34px_rgba(105,46,212,0.22)] transition hover:-translate-y-0.5 hover:bg-[#5b24be] hover:shadow-[0_20px_42px_rgba(105,46,212,0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#692ed4] focus-visible:ring-offset-2"
      >
        {cta.ctaLabel}
      </Link>
    </Reveal>
  );
}
