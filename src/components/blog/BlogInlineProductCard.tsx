'use client';

import Link from 'next/link';
import { trackEvent } from '@/lib/analytics';

interface BlogInlineProductCardProps {
  href: string;
  label: string;
  postSlug: string;
}

export function BlogInlineProductCard({ href, label, postSlug }: BlogInlineProductCardProps) {
  return (
    <section className="my-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#692ed4]">Recommended next step</p>
      <h3 className="mt-2 text-xl font-bold text-slate-900">Need to serve a notice now?</h3>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
        <li>Court-ready notice generation</li>
        <li>Compliance checks for latest rules</li>
        <li>Evidence-ready outputs</li>
      </ul>
      <Link
        href={href}
        onClick={() => trackEvent('click_blog_inline_product_card', { postSlug, href })}
        className="mt-4 inline-flex rounded-lg bg-[#692ed4] px-4 py-2.5 font-semibold text-white"
      >
        {label}
      </Link>
    </section>
  );
}
