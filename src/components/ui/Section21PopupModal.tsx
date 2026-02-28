'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, AlertTriangle } from 'lucide-react';
import { Section21Countdown } from './Section21Countdown';
import { usePathname } from 'next/navigation';

const STORAGE_KEY = 's21_popup_shown';
const SESSION_KEY = 's21_popup_showing';

const EXCLUDED_PATHS = [
  '/checkout',
  '/auth',
  '/dashboard',
  '/wizard',
  '/section-21-ban',
  '/ask-heaven',
];

export function Section21PopupModal() {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();

  const isExcluded = EXCLUDED_PATHS.some(path => pathname?.startsWith(path));

  useEffect(() => {
    if (isExcluded) return;

    // Don't show if already shown ever (localStorage persists)
    if (localStorage.getItem(STORAGE_KEY) === 'true') return;

    // Delay before showing (let page load first)
    const timer = setTimeout(() => {
      sessionStorage.setItem(SESSION_KEY, 'true'); // Signal to exit-intent
      setIsVisible(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, [isExcluded]);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem(STORAGE_KEY, 'true'); // Never show again
    sessionStorage.setItem(SESSION_KEY, 'false'); // Allow exit-intent now
  };

  // Handle escape key and body scroll lock
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };

    if (isVisible) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isVisible]);

  if (!isVisible || isExcluded) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative animate-in fade-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center">
          {/* Icon */}
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-primary" />
          </div>

          {/* Headline */}
          <h2 className="text-2xl font-bold text-primary mb-4">
            Section 21 Ends 1 May 2026
          </h2>

          {/* Countdown */}
          <Section21Countdown variant="large" className="mb-6" />

          {/* Description */}
          <p className="text-gray-600 mb-6">
            No-fault evictions are being banned forever. This is your last chance
            to serve a Section 21 notice without proving grounds.
          </p>

          {/* Primary CTA */}
          <Link
            href="/products/notice-only"
            onClick={handleClose}
            className="block w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 px-6 rounded-lg transition-colors mb-3"
          >
            Serve Your Notice Now →
          </Link>

          {/* Secondary CTA */}
          <Link
            href="/products/complete-pack"
            onClick={handleClose}
            className="text-primary hover:underline text-sm font-medium"
          >
            Get Complete Eviction Pack →
          </Link>

          {/* Dismiss */}
          <button
            onClick={handleClose}
            className="block w-full text-gray-400 hover:text-gray-600 text-sm mt-4 transition-colors"
          >
            I&apos;ll do this later
          </button>
        </div>
      </div>
    </div>
  );
}
