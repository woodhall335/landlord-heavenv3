'use client';

import Image from 'next/image';
import Link from 'next/link';

export function Section21ComplianceTimingPanel() {
  return (
    <div className="space-y-6 md:space-y-8">
      <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-2">
        <div className="rounded-2xl border border-[#7c3aed]/15 bg-gradient-to-br from-[#f7f2ff] via-white to-[#f3e8ff] p-6 shadow-[0_16px_45px_-26px_rgba(76,29,149,0.45)] md:p-8">
          <Image
            src="/images/section21_compliance.webp"
            alt="England eviction notice route"
            width={900}
            height={900}
            priority
            className="h-auto w-full object-contain"
          />
        </div>

        <div className="rounded-2xl border border-[#7c3aed]/15 bg-white p-6 shadow-sm md:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7c3aed]">
            England update
          </p>
          <h3 className="mt-3 text-2xl font-bold text-charcoal">
            We are aligned with the Renters&apos; Rights Act
          </h3>
          <p className="mt-4 text-gray-700">
            If you are starting an England possession case now, Section 21 is historical only.
            The first question is not &quot;which old route did I use before?&quot; It is
            &quot;what actually happened, which current ground applies, and what can I prove?&quot;
          </p>
          <p className="mt-4 text-gray-700">
            Older tenancies can still raise historic paperwork questions, so if your tenancy or
            notice dates cross the changeover, check that first before you serve anything. For
            live cases, follow the current England notice and possession rules.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/wizard?product=notice_only&src=product_page&topic=eviction"
              className="hero-btn-primary"
            >
              Find the current route -&gt;
            </Link>
            <Link
              href="/section-21-ban-uk"
              className="hero-btn-secondary"
            >
              Read the England transition
            </Link>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#7c3aed]/15 bg-white p-6 shadow-sm md:p-8">
        <p className="text-lg font-semibold text-charcoal md:text-xl">
          The mistake that costs time is following historical guidance instead of checking the current framework first.
        </p>
        <ul className="mt-4 space-y-3 text-sm text-gray-700 md:text-base">
          <li className="flex items-start gap-2">
            <span className="mt-2 h-2 w-2 rounded-full bg-[#7c3aed]" />
            <span>What the tenant has actually done: arrears, damage, breach, or refusal to leave.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-2 h-2 w-2 rounded-full bg-[#7c3aed]" />
            <span>Which current England grounds may apply, and whether the dates and evidence support them.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-2 h-2 w-2 rounded-full bg-[#7c3aed]" />
            <span>Whether this is a notice problem, a possession claim, a money claim for unpaid rent, or both.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-2 h-2 w-2 rounded-full bg-[#7c3aed]" />
            <span>How you will serve the paperwork and keep proof for court later.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Section21ComplianceTimingPanel;
