'use client';

/**
 * Section 21 Ban Urgency Banner
 *
 * Prominent banner alerting landlords to the Section 21 deadline.
 * Dismissible with session storage to avoid annoying users.
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { RiAlarmWarningLine, RiCloseLine, RiArrowRightLine } from 'react-icons/ri';

const STORAGE_KEY = 'lh_s21_banner_dismissed';
const SECTION_21_BAN_DATE = new Date('2026-05-01T00:00:00Z');

interface Section21BannerProps {
  /** Whether the banner can be dismissed */
  dismissible?: boolean;
  /** Position: 'top' for sticky header, 'inline' for in-content */
  position?: 'top' | 'inline';
  /** Custom CTA link */
  ctaLink?: string;
  /** Custom CTA text */
  ctaText?: string;
  /** Additional classes */
  className?: string;
}

export function Section21Banner({
  dismissible = true,
  position = 'top',
  ctaLink = '/products/notice-only',
  ctaText = 'Serve Your Notice Now',
  className = '',
}: Section21BannerProps) {
  const [dismissed, setDismissed] = useState(true); // Start hidden to avoid flash
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Check if dismissed
    const wasDismissed = sessionStorage.getItem(STORAGE_KEY) === 'true';
    setDismissed(wasDismissed);

    // Calculate days
    const now = new Date();
    const diff = SECTION_21_BAN_DATE.getTime() - now.getTime();
    const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
    setDaysRemaining(days);
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem(STORAGE_KEY, 'true');
  };

  // Don't render on server or if dismissed
  if (!mounted || dismissed || daysRemaining <= 0) {
    return null;
  }

  const isUrgent = daysRemaining <= 30;
  const isCritical = daysRemaining <= 7;

  const bgClass = isCritical
    ? 'bg-gradient-to-r from-red-600 to-red-700'
    : isUrgent
    ? 'bg-gradient-to-r from-orange-500 to-red-500'
    : 'bg-gradient-to-r from-amber-500 to-orange-500';

  const positionClass = position === 'top' ? 'sticky top-0 z-50' : '';

  return (
    <div className={`${bgClass} ${positionClass} text-white shadow-lg ${className}`}>
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Main Message */}
          <div className="flex items-center gap-3 text-center md:text-left">
            <RiAlarmWarningLine className={`w-6 h-6 shrink-0 ${isCritical ? 'animate-pulse' : ''}`} />
            <div>
              <span className="font-bold text-lg">
                {isCritical ? '⚠️ FINAL DAYS: ' : isUrgent ? '⏰ URGENT: ' : ''}
                SECTION 21 ENDS 1 MAY 2026
              </span>
              <span className="hidden sm:inline mx-2">•</span>
              <span className="block sm:inline text-white/90">
                Only <span className="font-bold">{daysRemaining} days</span> left to serve no-fault eviction notices
              </span>
            </div>
          </div>

          {/* CTA and Dismiss */}
          <div className="flex items-center gap-3">
            <Link
              href={ctaLink}
              className="inline-flex items-center gap-2 bg-white text-gray-900 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-md"
            >
              {ctaText}
              <RiArrowRightLine className="w-4 h-4" />
            </Link>

            {dismissible && (
              <button
                onClick={handleDismiss}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                aria-label="Dismiss banner"
              >
                <RiCloseLine className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Inline urgency alert for product pages
 */
export function Section21UrgencyAlert({ className = '' }: { className?: string }) {
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const now = new Date();
    const diff = SECTION_21_BAN_DATE.getTime() - now.getTime();
    setDaysRemaining(Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24))));
  }, []);

  if (!mounted || daysRemaining <= 0) return null;

  const isUrgent = daysRemaining <= 30;

  return (
    <div className={`rounded-xl border-2 ${isUrgent ? 'border-red-300 bg-red-50' : 'border-amber-300 bg-amber-50'} p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <RiAlarmWarningLine className={`w-6 h-6 shrink-0 ${isUrgent ? 'text-red-600' : 'text-amber-600'}`} />
        <div>
          <h4 className={`font-bold ${isUrgent ? 'text-red-800' : 'text-amber-800'}`}>
            Section 21 Ends 1 May 2026
          </h4>
          <p className={`text-sm mt-1 ${isUrgent ? 'text-red-700' : 'text-amber-700'}`}>
            You have <span className="font-bold">{daysRemaining} days</span> left to serve a no-fault eviction notice.
            After this date, Section 21 will be <span className="font-bold">permanently banned</span> and you'll need to use
            Section 8 grounds-based eviction instead.
          </p>
          <Link
            href="/section-21-ban"
            className={`inline-block mt-2 text-sm font-medium ${isUrgent ? 'text-red-700 hover:text-red-900' : 'text-amber-700 hover:text-amber-900'}`}
          >
            Learn more about the Section 21 ban →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Section21Banner;
