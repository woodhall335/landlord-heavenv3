'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { Section21Countdown } from './Section21Countdown';
import { usePathname } from 'next/navigation';

const STORAGE_KEY = 's21_banner_dismissed';
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

const EXCLUDED_PATHS = ['/checkout', '/auth', '/dashboard', '/wizard/preview'];

export function Section21HeaderBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();

  const isExcluded = EXCLUDED_PATHS.some(path => pathname?.startsWith(path));

  useEffect(() => {
    if (isExcluded) return;

    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      if (Date.now() - dismissedTime < DISMISS_DURATION) {
        return; // Still within 7-day dismiss period
      }
    }
    setIsVisible(true);
  }, [isExcluded]);

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
    setIsVisible(false);
  };

  if (!isVisible || isExcluded) return null;

  return (
    <div className="bg-gradient-to-r from-primary to-primary/90 text-white py-2.5 px-4 relative">
      <div className="container mx-auto flex items-center justify-center gap-2 sm:gap-4 text-sm sm:text-base">
        {/* Desktop */}
        <span className="hidden sm:inline">⚠️ Section 21 ends 1 May 2026 —</span>
        {/* Mobile */}
        <span className="sm:hidden">⚠️ S21 ends May 2026 —</span>

        <Section21Countdown variant="compact" className="text-white" />

        <Link
          href="/products/notice-only"
          className="underline hover:no-underline font-medium ml-1"
        >
          <span className="hidden sm:inline">Serve Your Notice Now →</span>
          <span className="sm:hidden">Act Now →</span>
        </Link>

        <button
          onClick={handleDismiss}
          className="absolute right-2 sm:right-4 p-1 hover:bg-white/10 rounded transition-colors"
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
