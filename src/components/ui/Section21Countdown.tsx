'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Section21CountdownProps {
  variant: 'large' | 'medium' | 'compact' | 'badge';
  className?: string;
}

// Target: 1 May 2026 00:00:00 BST (British Summer Time)
const TARGET_DATE = new Date('2026-05-01T00:00:00+01:00');

export function Section21Countdown({ variant, className = '' }: Section21CountdownProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const calculate = () => {
      const now = new Date();
      const diff = TARGET_DATE.getTime() - now.getTime();

      if (diff <= 0) return { days: 0, hours: 0, minutes: 0 };

      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      };
    };

    setTimeLeft(calculate());
    const interval = setInterval(() => setTimeLeft(calculate()), 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  // Prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  // Large variant - for popup modal and landing page hero
  if (variant === 'large') {
    return (
      <div className={`flex justify-center gap-4 sm:gap-6 ${className}`}>
        <div className="text-center">
          <div className="text-4xl sm:text-5xl font-bold text-primary font-mono">{timeLeft.days}</div>
          <div className="text-sm text-gray-500 mt-1">days</div>
        </div>
        <div className="text-center">
          <div className="text-4xl sm:text-5xl font-bold text-primary font-mono">{timeLeft.hours}</div>
          <div className="text-sm text-gray-500 mt-1">hours</div>
        </div>
        <div className="text-center">
          <div className="text-4xl sm:text-5xl font-bold text-primary font-mono">{timeLeft.minutes}</div>
          <div className="text-sm text-gray-500 mt-1">mins</div>
        </div>
      </div>
    );
  }

  // Medium variant - for product pages
  if (variant === 'medium') {
    return (
      <div className={`flex items-center justify-center gap-2 text-primary ${className}`}>
        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
        <span className="font-medium">
          Only <strong>{timeLeft.days} days</strong> left to serve Section 21 notices
        </span>
      </div>
    );
  }

  // Compact variant - for header banner
  if (variant === 'compact') {
    return (
      <span className={`font-semibold ${className}`}>
        {timeLeft.days} days left
      </span>
    );
  }

  // Badge variant - for inline use in cards/tools
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium ${className}`}>
      <AlertTriangle className="w-3.5 h-3.5" />
      {timeLeft.days} days left
    </span>
  );
}
