'use client';

/**
 * SeoLandingWrapper - Client wrapper for SEO landing pages
 *
 * Handles:
 * 1. Attribution initialization (UTMs, landing_path, referrer)
 * 2. landing_view event tracking
 *
 * Usage (in server component):
 * ```tsx
 * import { SeoLandingWrapper } from '@/components/seo/SeoLandingWrapper';
 *
 * export default function MyLandingPage() {
 *   return (
 *     <>
 *       <SeoLandingWrapper
 *         pagePath="/my-landing-page"
 *         pageTitle="My Landing Page"
 *         pageType="problem"
 *       />
 *       <main>...</main>
 *     </>
 *   );
 * }
 * ```
 */

import { LandingPageTracker } from '@/components/analytics/LandingPageTracker';
import type { SeoPageType } from './SeoCtaBlock';

interface SeoLandingWrapperProps {
  /** URL path (e.g., /tenant-wont-leave) */
  pagePath: string;
  /** Page title for analytics */
  pageTitle: string;
  /** Page type for funnel analysis: problem | court | money | general */
  pageType: SeoPageType;
  /** Optional jurisdiction if known */
  jurisdiction?: string;
}

/**
 * Client-side wrapper component for SEO landing pages.
 * Renders LandingPageTracker which handles attribution and tracking.
 */
export function SeoLandingWrapper({
  pagePath,
  pageTitle,
  pageType,
  jurisdiction,
}: SeoLandingWrapperProps) {
  return (
    <LandingPageTracker
      pagePath={pagePath}
      pageTitle={pageTitle}
      pageType={pageType}
      jurisdiction={jurisdiction}
    />
  );
}

export default SeoLandingWrapper;
