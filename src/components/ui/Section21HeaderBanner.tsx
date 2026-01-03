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
    if (isExcluded) {
      // Remove body class if navigating to excluded path
      document.body.classList.remove('s21-banner-visible');
      return;
    }

    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      if (Date.now() - dismissedTime < DISMISS_DURATION) {
        document.body.classList.remove('s21-banner-visible');
        return; // Still within 7-day dismiss period
      }
    }

    setIsVisible(true);
    document.body.classList.add('s21-banner-visible');

    // Cleanup on unmount
    return () => {
      document.body.classList.remove('s21-banner-visible');
    };
  }, [isExcluded]);

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
    setIsVisible(false);
    document.body.classList.remove('s21-banner-visible');
  };

  if (!isVisible || isExcluded) return null;

  return (
    <div className="s21-header-banner bg-gradient-to-r from-primary to-primary/90 text-white px-4">
      <div className="container mx-auto flex items-center justify-between gap-2 sm:gap-4 text-sm sm:text-base h-full">
        {/* Spacer for balance on desktop */}
        <div className="hidden sm:block w-8" />

        {/* Center content */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 flex-1">
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
        </div>

        {/* Close button - in flow, not absolute */}
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 p-1 hover:bg-white/10 rounded transition-colors"
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
