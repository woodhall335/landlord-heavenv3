/**
 * Animated activity counter. The daily variant starts at zero after midnight,
 * rises gradually through the day, never decreases in the same browser, and is
 * capped at 500.
 */

'use client';

import { useEffect, useState } from 'react';
import { RiFileTextLine, RiGroupLine, RiUserStarLine } from 'react-icons/ri';

type CounterVariant = 'today' | 'week' | 'total';

interface SocialProofCounterProps {
  variant: CounterVariant;
  baseNumber?: number;
  className?: string;
  showIcon?: boolean;
}

const COUNTER_CONFIG = {
  today: {
    base: 0,
    dailyGrowth: 500,
    text: 'landlords have used Landlord Heaven today',
    Icon: RiGroupLine,
  },
  week: {
    base: 20000,
    dailyGrowth: 10000,
    text: 'documents generated this week',
    Icon: RiFileTextLine,
  },
  total: {
    base: 50000,
    dailyGrowth: 0,
    text: 'UK landlords',
    Icon: RiUserStarLine,
  },
} as const;

function getPersistedCount(storageKey: string, baseCount: number, dailyGrowth: number): number {
  const now = new Date();
  const today = now.toDateString();
  const minutesSinceMidnight = now.getHours() * 60 + now.getMinutes();
  const dayProgress = minutesSinceMidnight / (24 * 60);
  const timeBasedCount = Math.floor(baseCount + dailyGrowth * dayProgress);
  const maxCount = baseCount + dailyGrowth;

  try {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      const { date, count, variance } = JSON.parse(stored) as {
        date?: string;
        count?: number;
        variance?: number;
      };

      if (date === today && typeof count === 'number') {
        const stableVariance =
          typeof variance === 'number' ? variance : Math.floor(Math.random() * 6);
        const nextCount = Math.min(timeBasedCount + stableVariance, maxCount);
        const updatedCount = Math.max(count, nextCount);

        if (updatedCount !== count || stableVariance !== variance) {
          localStorage.setItem(
            storageKey,
            JSON.stringify({ date: today, count: updatedCount, variance: stableVariance })
          );
        }

        return updatedCount;
      }
    }

    const initialVariance = Math.floor(Math.random() * 6);
    const newCount = Math.min(timeBasedCount + initialVariance, maxCount);
    localStorage.setItem(
      storageKey,
      JSON.stringify({ date: today, count: newCount, variance: initialVariance })
    );
    return newCount;
  } catch {
    return Math.min(timeBasedCount, maxCount);
  }
}

export function SocialProofCounter({
  variant,
  baseNumber,
  className = '',
  showIcon = true,
}: SocialProofCounterProps) {
  const [displayCount, setDisplayCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  const config = COUNTER_CONFIG[variant];
  const finalBase = baseNumber ?? config.base;
  const Icon = config.Icon;

  useEffect(() => {
    const storageKey = `social_proof_${variant}`;
    const targetCount = getPersistedCount(storageKey, finalBase, config.dailyGrowth);
    const animationKey = `social_proof_${variant}_animated_${new Date().toDateString()}`;

    let shouldAnimate = true;
    try {
      shouldAnimate = !sessionStorage.getItem(animationKey);
      if (shouldAnimate) sessionStorage.setItem(animationKey, 'true');
    } catch {
      shouldAnimate = true;
    }

    if (!shouldAnimate) {
      const immediateTimer = window.setTimeout(() => {
        setDisplayCount(targetCount);
        setIsAnimating(false);
      }, 0);
      return () => window.clearTimeout(immediateTimer);
    }

    const duration = 1200;
    const steps = 30;
    const increment = targetCount / steps;
    let current = 0;

    const timer = window.setInterval(() => {
      current += increment;
      if (current >= targetCount) {
        setDisplayCount(targetCount);
        setIsAnimating(false);
        window.clearInterval(timer);
      } else {
        setDisplayCount(Math.floor(current));
      }
    }, duration / steps);

    return () => window.clearInterval(timer);
  }, [variant, finalBase, config.dailyGrowth]);

  if (variant === 'total') {
    return (
      <div className={`flex items-center justify-center gap-2 text-gray-600 ${className}`}>
        {showIcon ? <Icon className="h-5 w-5 text-primary" aria-hidden="true" /> : null}
        <span>
          Trusted by{' '}
          <strong className="font-semibold tabular-nums text-gray-900">
            {displayCount.toLocaleString('en-GB')}+
          </strong>{' '}
          {config.text}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm text-green-700 ${className}`}
      data-testid={variant === 'today' ? 'usage-today-counter' : undefined}
      aria-live={variant === 'today' ? 'polite' : undefined}
    >
      {showIcon ? <Icon className="h-4 w-4" aria-hidden="true" /> : null}
      <span>
        <strong className={`font-semibold tabular-nums ${isAnimating ? 'opacity-70' : ''}`}>
          {displayCount}
        </strong>{' '}
        {config.text}
      </span>
    </div>
  );
}

export default SocialProofCounter;
