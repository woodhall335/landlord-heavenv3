/**
 * Social Proof Counter Component
 *
 * Displays dynamic usage statistics to build trust and FOMO.
 * Includes animated count-up effect and realistic time-based progression.
 *
 * Features:
 * - Numbers only ever go UP on refresh (stored in localStorage)
 * - Gradual increase throughout the day (500 base, grows to ~750+ by evening)
 * - Resets at midnight to new base
 *
 * Variants:
 * - today: "X landlords used this today" (for product/tool pages)
 * - week: "X documents generated this week"
 * - total: "Trusted by X+ UK landlords" (for landing page)
 */

'use client';

import { useState, useEffect } from 'react';
import { RiUserStarLine, RiFileTextLine, RiGroupLine } from 'react-icons/ri';

type CounterVariant = 'today' | 'week' | 'total';

interface SocialProofCounterProps {
  /** Counter type: 'today', 'week', or 'total' */
  variant: CounterVariant;
  /** Override the base number (optional) */
  baseNumber?: number;
  /** Additional CSS classes */
  className?: string;
  /** Show/hide icon (default: true) */
  showIcon?: boolean;
}

const COUNTER_CONFIG = {
  today: {
    base: 0,
    dailyGrowth: 500, // Grows from 0 to ~500 throughout the day
    text: 'landlords used this today',
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
};

/**
 * Get or create a persistent counter value that only increases (up to max)
 */
function getPersistedCount(storageKey: string, baseCount: number, dailyGrowth: number): number {
  const now = new Date();
  const today = now.toDateString();
  const hour = now.getHours();
  const minute = now.getMinutes();

  // Calculate time-based progression (0 at midnight, 1 at 11:59pm)
  const dayProgress = (hour * 60 + minute) / (24 * 60);

  // Calculate count for this time of day
  // Starts at base, grows throughout the day up to dailyGrowth max
  const timeBasedCount = Math.floor(baseCount + (dailyGrowth * dayProgress));

  // Maximum allowed value for this counter type
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
        const stableVariance = typeof variance === 'number' ? variance : Math.floor(Math.random() * 6);
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
    localStorage.setItem(storageKey, JSON.stringify({ date: today, count: newCount, variance: initialVariance }));
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
      if (shouldAnimate) {
        sessionStorage.setItem(animationKey, 'true');
      }
    } catch {
      shouldAnimate = true;
    }

    if (!shouldAnimate) {
      setDisplayCount(targetCount);
      setIsAnimating(false);
      return;
    }

    const duration = 1200;
    const steps = 30;
    const increment = targetCount / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= targetCount) {
        setDisplayCount(targetCount);
        setIsAnimating(false);
        clearInterval(timer);
      } else {
        setDisplayCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [variant, finalBase, config.dailyGrowth]);

  // Total variant - larger, more prominent (for landing page)
  if (variant === 'total') {
    return (
      <div className={`flex items-center justify-center gap-2 text-gray-600 ${className}`}>
        {showIcon && <Icon className="w-5 h-5 text-primary" />}
        <span>
          Trusted by{' '}
          <strong className="text-gray-900 font-semibold tabular-nums">
            {displayCount.toLocaleString()}+
          </strong>{' '}
          {config.text}
        </span>
      </div>
    );
  }

  // Today/Week variants - smaller, subtle badge style
  return (
    <div
      className={`inline-flex items-center gap-2 bg-green-50 text-green-700 rounded-full px-4 py-2 text-sm ${className}`}
    >
      {showIcon && <Icon className="w-4 h-4" />}
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
