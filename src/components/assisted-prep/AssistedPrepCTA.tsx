import Link from 'next/link';
import { clsx } from 'clsx';
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
    title: 'Need help with this notice?',
    body: 'We can prepare the Form 3A notice with you, check the dates, and keep the service file clearer.',
    bullets: ['20-minute callback', '£149', 'Full refund if unsuitable'],
  },
  money_claim: {
    title: 'Want us to shape the claim?',
    body: 'We can help turn the debt, evidence, and pre-action position into a clearer money claim pack.',
    bullets: ['30-minute callback', '£249', 'Full refund if unsuitable'],
  },
  possession: {
    title: 'Need the court pack checked?',
    body: 'We can prepare the N5, N119, notice evidence, and bundle steps with you before you file.',
    bullets: ['45-minute callback', '£399', 'Full refund if unsuitable'],
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
            {copy.bullets.map((bullet) => (
              <div
                key={bullet}
                className="rounded-xl border border-[#eee5ff] bg-[#fbf8ff] px-3 py-2 text-xs font-semibold text-[#4b1fa3]"
              >
                {bullet}
              </div>
            ))}
          </div>
          <Link
            href={href}
            className="mt-4 flex w-full items-center justify-center rounded-xl bg-[#6d28d9] px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#5b21b6]"
          >
            Get assisted prep
          </Link>
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
            {ASSISTED_PREP_PROMISE} {config.duration}. {config.priceLabel}.
          </p>
        </div>
        <Link
          href={href}
          className="inline-flex shrink-0 items-center justify-center rounded-lg bg-violet-700 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-800"
        >
          {config.primaryCta}
        </Link>
      </div>
    </section>
  );
}
