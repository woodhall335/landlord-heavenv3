'use client';

import { useEffect, useState } from 'react';
import { RiFileTextLine, RiGroupLine, RiUserStarLine } from 'react-icons/ri';

type CounterVariant = 'today' | 'week' | 'total';

interface SocialProofCounterProps {
  variant: CounterVariant;
  /** Retained for backwards compatibility; unverifiable numeric claims are intentionally not rendered. */
  baseNumber?: number;
  className?: string;
  showIcon?: boolean;
}

const TRUST_COPY = {
  today: { text: 'Landlords used Landlord Heaven today', Icon: RiGroupLine },
  week: { text: 'Guided landlord document preparation', Icon: RiFileTextLine },
  total: { text: 'Built for UK landlords', Icon: RiUserStarLine },
} as const;

export function SocialProofCounter({
  variant,
  className = '',
  showIcon = true,
}: SocialProofCounterProps) {
  const { text, Icon } = TRUST_COPY[variant];
  const [todayCount, setTodayCount] = useState<number | null | undefined>(undefined);

  useEffect(() => {
    if (variant !== 'today') return;
    const controller = new AbortController();
    void fetch('/api/public/usage-today', {
      signal: controller.signal,
      credentials: 'same-origin',
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: { count?: unknown } | null) => {
        if (typeof payload?.count === 'number' && Number.isFinite(payload.count)) {
          setTodayCount(Math.max(0, Math.floor(payload.count)));
          return;
        }
        setTodayCount(null);
      })
      .catch(() => {
        // The counter is progressive proof; an analytics outage must not affect the page.
        setTodayCount(null);
      });
    return () => controller.abort();
  }, [variant]);

  if (variant !== 'today') {
    return (
      <div className={`flex items-center justify-center gap-2 text-gray-600 ${className}`}>
        {showIcon ? <Icon className="h-5 w-5 text-primary" aria-hidden="true" /> : null}
        <span className="font-medium text-gray-800">{text}</span>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex min-h-9 items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800 ${className}`}
      data-testid="usage-today-counter"
      aria-live="polite"
    >
      {showIcon ? <Icon className="h-4 w-4" aria-hidden="true" /> : null}
      <span className="font-medium">
        {todayCount === undefined
          ? 'Loading today’s landlord usage…'
          : todayCount === null
            ? 'Live landlord usage updates throughout the day'
            : `${todayCount.toLocaleString('en-GB')} ${todayCount === 1 ? 'landlord has' : 'landlords have'} used Landlord Heaven today`}
      </span>
    </div>
  );
}

export default SocialProofCounter;
