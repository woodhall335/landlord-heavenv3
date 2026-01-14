'use client';

/**
 * LandingPageTracker - Client-side component for SEO landing page analytics
 *
 * Responsibilities:
 * 1. Initialize attribution (capture UTMs, landing_path, referrer)
 * 2. Fire landing_view event for GA4
 *
 * Usage:
 * ```tsx
 * <LandingPageTracker
 *   pagePath="/how-to-evict-tenant"
 *   pageTitle="How to Evict a Tenant"
 *   pageType="problem"
 * />
 * ```
 */

import { useEffect, useRef } from 'react';
import { trackEvent } from '@/lib/analytics';
import { initializeAttribution } from '@/lib/wizard/wizardAttribution';
import type { SeoPageType } from '@/components/seo/SeoCtaBlock';

interface LandingPageTrackerProps {
  /** URL path (e.g., /how-to-evict-tenant) */
  pagePath: string;
  /** Page title for analytics */
  pageTitle: string;
  /** Page type for funnel analysis */
  pageType: SeoPageType;
  /** Optional jurisdiction if known */
  jurisdiction?: string;
}

/**
 * Invisible component that handles landing page analytics on mount.
 * - Initializes attribution (UTMs, landing_path, referrer, GA client ID)
 * - Fires landing_view event
 */
export function LandingPageTracker({
  pagePath,
  pageTitle,
  pageType,
  jurisdiction,
}: LandingPageTrackerProps) {
  const hasTracked = useRef(false);

  useEffect(() => {
    // Ensure we only track once per mount
    if (hasTracked.current) return;
    hasTracked.current = true;

    // Initialize attribution - captures UTMs, referrer, landing_path
    initializeAttribution();

    // Fire landing_view event
    trackEvent('landing_view', {
      page_path: pagePath,
      page_title: pageTitle,
      page_type: pageType,
      jurisdiction: jurisdiction || undefined,
    });
  }, [pagePath, pageTitle, pageType, jurisdiction]);

  // Render nothing - this is just for side effects
  return null;
}

/**
 * Track CTA click on landing pages
 *
 * @param pagePath - Current page path
 * @param pageType - Page type (problem/court/money/general)
 * @param ctaVariant - CTA variant (hero/section/faq/inline/final)
 * @param ctaText - Text of the CTA clicked
 */
export function trackLandingCtaClick(
  pagePath: string,
  pageType: SeoPageType,
  ctaVariant: 'hero' | 'section' | 'faq' | 'inline' | 'final',
  ctaText?: string
) {
  trackEvent('cta_click', {
    page_path: pagePath,
    page_type: pageType,
    cta_variant: ctaVariant,
    cta_text: ctaText,
  });
}

export default LandingPageTracker;
