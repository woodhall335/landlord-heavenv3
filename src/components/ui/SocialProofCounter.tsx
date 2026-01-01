/**
 * Social Proof Counter Component
 *
 * Displays dynamic usage statistics to build trust and FOMO.
 * Includes animated count-up effect and realistic time-based variations.
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
  /** Override the variance range (optional) */
  variance?: number;
  /** Additional CSS classes */
  className?: string;
  /** Show/hide icon (default: true) */
  showIcon?: boolean;
}

const COUNTER_CONFIG = {
  today: {
    base: 38,
    variance: 12,
    text: 'landlords used this today',
    Icon: RiGroupLine,
  },
  week: {
    base: 285,
    variance: 45,
    text: 'documents generated this week',
    Icon: RiFileTextLine,
  },
  total: {
    base: 10000,
    variance: 0,
    text: 'UK landlords',
    Icon: RiUserStarLine,
  },
};

export function SocialProofCounter({
  variant,
  baseNumber,
  variance,
  className = '',
  showIcon = true,
}: SocialProofCounterProps) {
  const [displayCount, setDisplayCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

  const config = COUNTER_CONFIG[variant];
  const finalBase = baseNumber ?? config.base;
  const finalVariance = variance ?? config.variance;
  const Icon = config.Icon;

  useEffect(() => {
    // Generate realistic count based on time of day
    const hour = new Date().getHours();
    // Busier during work hours (9am-6pm)
    const dayMultiplier = hour >= 9 && hour <= 18 ? 1.2 : 0.8;
    // Add some randomness
    const randomVariance = Math.floor(Math.random() * finalVariance * 2) - finalVariance;
    const targetCount = Math.max(1, Math.floor(finalBase * dayMultiplier + randomVariance));

    // Animate count up effect
    const duration = 1200; // 1.2 seconds
    const steps = 25;
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
  }, [finalBase, finalVariance]);

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
