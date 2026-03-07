'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { hasAnalyticsConsent } from '@/lib/consent';
import { trackCtaImpression } from '@/lib/journey/events';
import { getJourneyState, type StageEstimate } from '@/lib/journey/state';

interface Action {
  label: string;
  href: string;
}

interface NextStepWidgetProps {
  primaryAction?: Action;
  secondaryAction?: Action;
  stageHint?: StageEstimate;
  location?: string;
}

const RECOMMENDATIONS: Record<StageEstimate, { primary: Action; secondary: Action }> = {
  early_arrears: {
    primary: { label: 'Calculate arrears now', href: '/tools/rent-arrears-calculator' },
    secondary: { label: 'Create a free demand letter', href: '/tools/free-rent-demand-letter' },
  },
  demand_sent: {
    primary: { label: 'Re-check arrears totals', href: '/tools/rent-arrears-calculator' },
    secondary: { label: 'Prepare your notice', href: '/products/notice-only' },
  },
  notice_ready: {
    primary: { label: 'Create your eviction notice', href: '/products/notice-only' },
    secondary: { label: 'See the Complete Eviction Pack', href: '/products/complete-pack' },
  },
  court_ready: {
    primary: { label: 'Start the Complete Eviction Pack', href: '/products/complete-pack' },
    secondary: { label: 'Prepare a money claim', href: '/products/money-claim' },
  },
  unknown: {
    primary: { label: 'Ask Heaven a question', href: '/ask-heaven' },
    secondary: { label: 'Try the arrears calculator', href: '/tools/rent-arrears-calculator' },
  },
};

export function NextStepWidget({
  primaryAction,
  secondaryAction,
  stageHint,
  location = 'inline',
}: NextStepWidgetProps): React.ReactElement {
  const router = useRouter();
  const resolvedStage: StageEstimate = useMemo(() => {
    if (stageHint) return stageHint;
    if (typeof window === 'undefined') return 'unknown';
    return getJourneyState().stage_estimate ?? 'unknown';
  }, [stageHint]);

  const recommendation = useMemo(() => {
    const base = RECOMMENDATIONS[resolvedStage] ?? RECOMMENDATIONS.unknown;
    return {
      primary: primaryAction ?? base.primary,
      secondary: secondaryAction ?? base.secondary,
    };
  }, [primaryAction, resolvedStage, secondaryAction]);

  useEffect(() => {
    if (!hasAnalyticsConsent()) return;

    trackCtaImpression({
      cta_id: `next_step_primary_${resolvedStage}`,
      location,
    });
  }, [location, resolvedStage]);

  return (
    <section className="rounded-2xl border border-purple-200 bg-purple-50 p-6 mt-8" aria-label="Recommended next steps">
      <p className="text-xs font-semibold uppercase tracking-wide text-primary">Recommended next step</p>
      <h3 className="mt-2 text-xl font-semibold text-gray-900">Move forward with the right landlord action</h3>
      <p className="mt-2 text-sm text-gray-700">
        Based on your current journey stage, we recommend one primary next step and one backup option.
      </p>

      <div className="mt-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <Button
          onClick={() => router.push(recommendation.primary.href)}
          data-lh-cta="true"
          data-lh-cta-id={`next_step_primary_${resolvedStage}`}
          data-lh-cta-location={location}
        >
          {recommendation.primary.label}
        </Button>
        <Link
          href={recommendation.secondary.href}
          className="text-sm font-semibold text-primary hover:underline"
          data-lh-cta="true"
          data-lh-cta-id={`next_step_secondary_${resolvedStage}`}
          data-lh-cta-location={location}
        >
          {recommendation.secondary.label}
        </Link>
      </div>
    </section>
  );
}
