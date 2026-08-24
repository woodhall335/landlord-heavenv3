'use client';

import { clsx } from 'clsx';
import { usePathname } from 'next/navigation';
import { TrackedLink } from '@/components/analytics/TrackedLink';
import {
  ASSISTED_PREP_PROMISE,
  buildAssistedPrepStartHref,
  getAssistedPrepConfig,
  type AssistedPrepService,
} from '@/lib/assisted-prep';

type AssistedPrepCTAProps = {
  service: AssistedPrepService;
  variant?: 'inline' | 'card' | 'banner' | 'review-panel';
  caseId?: string | null;
  product?: string | null;
  caseType?: string | null;
  step?: string | null;
  src?: string | null;
  className?: string;
};

const sidebarCopy: Record<AssistedPrepService, { title: string; body: string; bullets: string[] }> = {
  section8: {
    title: 'Want help before you serve?',
    body: 'Tell us what has happened. We can check the dates and prepare the Form 3A notice and service record with you.',
    bullets: ['20-minute callback', '£149', 'Full refund if unsuitable'],
  },
  money_claim: {
    title: 'Want help preparing your claim?',
    body: 'Tell us about the debt and the evidence you have. We will explain what paperwork may be needed next.',
    bullets: ['30-minute callback', '£249', 'Full refund if unsuitable'],
  },
  possession: {
    title: 'Want the full eviction case prepared?',
    body: 'Our £399 service can prepare the Section 8 notice, service record, N5, N119 and supporting bundle with you.',
    bullets: ['45-minute callback', '£399 full-case service', 'Full refund if unsuitable'],
  },
};

export function AssistedPrepCTA({
  service,
  variant = 'card',
  caseId,
  product,
  caseType,
  step,
  src = 'assisted_cta',
  className,
}: AssistedPrepCTAProps) {
  const pathname = usePathname() || '/wizard';
  if (service === 'money_claim') return null;

  const config = getAssistedPrepConfig(service);
  const href = buildAssistedPrepStartHref({
    service,
    caseId,
    product,
    caseType,
    step,
    src,
  });

  const compact = variant === 'inline';

  if (compact) {
    const copy = sidebarCopy[service];
    const consultationBullets = ['Free consultation', 'No obligation to proceed', 'Pay only if we can help'];

    return (
      <section
        className={clsx(
          'overflow-hidden rounded-[1.35rem] border border-[#ded0ff] bg-white shadow-[0_18px_42px_rgba(31,16,66,0.10)]',
          className
        )}
        aria-label={`${config.label} call to action`}
      >
        <div className="bg-[linear-gradient(135deg,#2b1654_0%,#6d28d9_100%)] p-4 text-white">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/78">
            Assisted prep
          </p>
          <h3 className="mt-2 text-lg font-bold leading-tight text-white">
            {copy.title}
          </h3>
        </div>
        <div className="p-4">
          <p className="text-sm leading-6 text-[#4f4665]">{copy.body}</p>
          <div className="mt-4 grid gap-2">
            {consultationBullets.map((bullet) => (
              <div
                key={bullet}
                className="rounded-xl border border-[#eee5ff] bg-[#fbf8ff] px-3 py-2 text-xs font-semibold text-[#4b1fa3]"
              >
                {bullet}
              </div>
            ))}
          </div>
          <TrackedLink
            href={href}
            pagePath={pathname}
            pageType="entry_page"
            ctaLabel="Book free consultation"
            ctaPosition="support"
            eventName="entry_page_secondary_cta_click"
            routeIntent={service === 'possession' ? 'possession_assisted_prep' : 'section8_assisted_prep'}
            product={product || config.sku}
            className="mt-4 flex w-full items-center justify-center rounded-xl bg-[#6d28d9] px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#5b21b6]"
          >
            Book free consultation
          </TrackedLink>
        </div>
      </section>
    );
  }

  return (
    <section
      className={clsx(
        'border border-violet-200 bg-white shadow-sm',
        compact ? 'rounded-lg p-4' : 'rounded-2xl p-5 md:p-6',
        variant === 'banner' && 'bg-violet-50',
        variant === 'review-panel' && 'border-amber-200 bg-amber-50',
        className
      )}
      aria-label={`${config.label} call to action`}
    >
      <div className={clsx('flex gap-4', compact ? 'flex-col sm:flex-row sm:items-center' : 'flex-col md:flex-row md:items-center md:justify-between')}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-700">
            Assisted prep
          </p>
          <h3 className={clsx('mt-1 font-semibold text-slate-950', compact ? 'text-base' : 'text-xl')}>
            {config.callbackHeadline}
          </h3>
          <p className={clsx('mt-2 text-slate-700', compact ? 'text-sm' : 'text-sm leading-6')}>
            {ASSISTED_PREP_PROMISE} Start with a free consultation. We will talk through your case and explain what we can prepare. If we can help, we agree the scope before sending a payment link.
          </p>
        </div>
        <TrackedLink
          href={href}
          pagePath={pathname}
          pageType="entry_page"
          ctaLabel="Book free consultation"
          ctaPosition="section"
          eventName="entry_page_primary_cta_click"
          routeIntent={service === 'possession' ? 'possession_assisted_prep' : 'section8_assisted_prep'}
          product={product || config.sku}
          className="inline-flex shrink-0 items-center justify-center rounded-lg bg-violet-700 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-800"
        >
          Book free consultation
        </TrackedLink>
      </div>
    </section>
  );
}
