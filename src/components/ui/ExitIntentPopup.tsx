/**
 * Exit Intent Popup
 *
 * Promotes Ask Heaven when user is about to leave the site.
 * Coordinates with S21 popup to avoid conflicts.
 */

'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { RiCloseLine, RiRobot2Line, RiCheckLine } from 'react-icons/ri';
import { useExitIntent } from '@/hooks/useExitIntent';

/** Pages where exit popup should NOT show */
const EXCLUDED_PATHS = [
  '/checkout',
  '/auth',
  '/dashboard',
  '/wizard/preview',
  '/ask-heaven',
  '/login',
  '/signup',
  '/register',
];

export function ExitIntentPopup() {
  const { showPopup, closePopup } = useExitIntent();
  const pathname = usePathname();

  // Check if current path is excluded
  const isExcluded = EXCLUDED_PATHS.some((path) => pathname?.startsWith(path));

  // Lock body scroll when popup is open
  useEffect(() => {
    if (showPopup && !isExcluded) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showPopup, isExcluded]);

  // Don't render if excluded or not showing
  if (isExcluded || !showPopup) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && closePopup()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-popup-title"
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative animate-in fade-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          onClick={closePopup}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close popup"
        >
          <RiCloseLine className="w-6 h-6" />
        </button>

        <div className="text-center">
          {/* Icon */}
          <div className="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
            <RiRobot2Line className="w-8 h-8 text-primary-600" />
          </div>

          {/* Title */}
          <h2 id="exit-popup-title" className="text-xl font-bold text-gray-900 mb-2">
            Before you go...
          </h2>

          {/* Subtitle */}
          <p className="text-lg text-gray-700 mb-2">
            Have a landlord legal question?
          </p>

          {/* Description */}
          <p className="text-gray-600 mb-6">
            <strong className="text-primary-600">Ask Heaven</strong> is our FREE AI legal assistant
            that can help with:
          </p>

          {/* Benefits list */}
          <ul className="text-left text-gray-600 mb-6 space-y-2">
            <li className="flex items-center gap-2">
              <RiCheckLine className="w-5 h-5 text-primary-600 shrink-0" />
              <span>Eviction advice</span>
            </li>
            <li className="flex items-center gap-2">
              <RiCheckLine className="w-5 h-5 text-primary-600 shrink-0" />
              <span>Tenancy questions</span>
            </li>
            <li className="flex items-center gap-2">
              <RiCheckLine className="w-5 h-5 text-primary-600 shrink-0" />
              <span>Notice requirements</span>
            </li>
            <li className="flex items-center gap-2">
              <RiCheckLine className="w-5 h-5 text-primary-600 shrink-0" />
              <span>Deposit rules</span>
            </li>
          </ul>

          {/* CTA button */}
          <Link
            href="/ask-heaven"
            onClick={closePopup}
            className="block w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors mb-3"
          >
            Try Ask Heaven Free →
          </Link>

          {/* Dismiss link */}
          <button
            onClick={closePopup}
            className="text-gray-400 hover:text-gray-600 text-sm transition-colors"
          >
            No thanks, maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
