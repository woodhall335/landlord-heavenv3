'use client';

/**
 * Section 21 Ban Countdown Component
 *
 * Displays countdown to Section 21 ban deadline (1 May 2026).
 * Creates urgency for landlords to act before no-fault evictions end.
 */

import React, { useState, useEffect } from 'react';
import { RiAlarmWarningLine, RiTimeLine } from 'react-icons/ri';

// Section 21 ban date: 1 May 2026 at midnight
const SECTION_21_BAN_DATE = new Date('2026-05-01T00:00:00Z');

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

function calculateTimeRemaining(): TimeRemaining {
  const now = new Date();
  const total = SECTION_21_BAN_DATE.getTime() - now.getTime();

  if (total <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  }

  return {
    days: Math.floor(total / (1000 * 60 * 60 * 24)),
    hours: Math.floor((total / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((total / (1000 * 60)) % 60),
    seconds: Math.floor((total / 1000) % 60),
    total,
  };
}

export type CountdownVariant = 'banner' | 'inline' | 'compact' | 'hero';

interface Section21CountdownProps {
  variant?: CountdownVariant;
  className?: string;
  showSeconds?: boolean;
}

export function Section21Countdown({
  variant = 'inline',
  className = '',
  showSeconds = false,
}: Section21CountdownProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(calculateTimeRemaining());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Don't render on server to avoid hydration mismatch
  if (!mounted) {
    return null;
  }

  // If deadline has passed, show different message
  if (timeRemaining.total <= 0) {
    return (
      <div className={`bg-red-600 text-white px-4 py-2 rounded-lg ${className}`}>
        <span className="font-bold">Section 21 has ended.</span> No-fault evictions are no longer available.
      </div>
    );
  }

  const { days, hours, minutes, seconds } = timeRemaining;

  // Compact variant - just days
  if (variant === 'compact') {
    return (
      <span className={`font-bold text-amber-600 ${className}`}>
        {days} days left
      </span>
    );
  }

  // Inline variant - medium detail
  if (variant === 'inline') {
    return (
      <div className={`inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 ${className}`}>
        <RiTimeLine className="w-5 h-5 text-amber-600" />
        <span className="text-amber-800">
          <span className="font-bold">{days}d {hours}h {minutes}m</span>
          {showSeconds && <span> {seconds}s</span>}
          <span className="ml-1">until Section 21 ends</span>
        </span>
      </div>
    );
  }

  // Hero variant - large countdown for landing pages
  if (variant === 'hero') {
    return (
      <div className={`text-center ${className}`}>
        <div className="flex justify-center gap-4 md:gap-6">
          <TimeBlock value={days} label="Days" urgent={days < 30} />
          <TimeBlock value={hours} label="Hours" />
          <TimeBlock value={minutes} label="Minutes" />
          {showSeconds && <TimeBlock value={seconds} label="Seconds" />}
        </div>
        <p className="mt-4 text-amber-700 font-medium">
          Until Section 21 no-fault evictions end forever
        </p>
      </div>
    );
  }

  // Banner variant - full width
  return (
    <div className={`bg-gradient-to-r from-amber-500 to-orange-500 text-white ${className}`}>
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-center gap-3 text-center sm:text-left">
        <RiAlarmWarningLine className="w-6 h-6 animate-pulse" />
        <div>
          <span className="font-bold">SECTION 21 ENDS 1 MAY 2026</span>
          <span className="mx-2">•</span>
          <span>
            Only <span className="font-bold">{days} days, {hours} hours, {minutes} minutes</span> left
          </span>
        </div>
      </div>
    </div>
  );
}

// Time block for hero variant
function TimeBlock({ value, label, urgent = false }: { value: number; label: string; urgent?: boolean }) {
  return (
    <div className={`flex flex-col items-center ${urgent ? 'animate-pulse' : ''}`}>
      <div className={`
        w-16 h-16 md:w-20 md:h-20 rounded-xl flex items-center justify-center text-2xl md:text-3xl font-bold
        ${urgent ? 'bg-red-600 text-white' : 'bg-amber-600 text-white'}
      `}>
        {value.toString().padStart(2, '0')}
      </div>
      <span className="mt-2 text-sm font-medium text-gray-600">{label}</span>
    </div>
  );
}

export default Section21Countdown;
