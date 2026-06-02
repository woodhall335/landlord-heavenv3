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
