/**
 * CrossSellBanner Component
 *
 * Renders cross-sell recommendations using centralized configuration.
 * Tracks impressions and clicks for observability.
 *
 * @see /src/lib/cross-sell/recommendations.ts for configuration
 */

'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import {
  type CrossSellConfig,
  type CrossSellRecommendation,
  buildCrossSellLink,
} from '@/lib/cross-sell/recommendations';
import {
  trackCrossSellImpression,
  trackCrossSellClick,
} from '@/lib/analytics/cross-sell';
import type { WizardJurisdiction } from '@/lib/wizard/buildWizardLink';

export type CrossSellVariant = 'banner' | 'card' | 'inline' | 'sidebar';

interface CrossSellBannerProps {
  /** Cross-sell configuration */
  config: CrossSellConfig;
  /** Current page path for tracking */
  pagePath: string;
  /** Visual variant */
  variant?: CrossSellVariant;
  /** Optional jurisdiction for wizard links */
  jurisdiction?: WizardJurisdiction;
  /** Whether to show secondary cross-sell */
  showSecondary?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * CrossSellBanner renders a cross-sell recommendation
 * and tracks impressions + clicks for analytics
 */
export function CrossSellBanner({
  config,
  pagePath,
  variant = 'banner',
  jurisdiction,
  showSecondary = true,
  className = '',
}: CrossSellBannerProps) {
  const hasTrackedImpression = useRef(false);

  // Track impression on mount (once per component instance)
  useEffect(() => {
    if (!hasTrackedImpression.current) {
      trackCrossSellImpression(pagePath, config.primary.product);
      if (showSecondary && config.secondary) {
        trackCrossSellImpression(pagePath, config.secondary.product);
      }
      hasTrackedImpression.current = true;
    }
  }, [pagePath, config.primary.product, config.secondary, showSecondary]);

  const handleClick = (recommendation: CrossSellRecommendation) => {
    trackCrossSellClick(pagePath, recommendation.product, config.src);
  };

  const primaryHref = buildCrossSellLink(config.primary, config.src, jurisdiction);
  const secondaryHref = config.secondary
    ? buildCrossSellLink(config.secondary, config.src, jurisdiction)
    : null;

  // Banner variant - horizontal with gradient
  if (variant === 'banner') {
    return (
      <div className={`bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-6 ${className}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {config.primary.title}
            </h3>
            <p className="text-gray-600 text-sm">
              {config.primary.description}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={primaryHref}
              onClick={() => handleClick(config.primary)}
              className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-700 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors"
            >
              {config.primary.ctaText} — {config.primary.price}
              <ArrowRight className="w-4 h-4" />
            </Link>
            {showSecondary && config.secondary && secondaryHref && (
              <Link
                href={secondaryHref}
                onClick={() => handleClick(config.secondary!)}
                className="inline-flex items-center justify-center gap-2 text-gray-700 hover:text-primary font-medium px-4 py-2.5"
              >
                {config.secondary.ctaText}
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Card variant - vertical stacked cards
  if (variant === 'card') {
    return (
      <div className={`space-y-4 ${className}`}>
        <CrossSellCard
          recommendation={config.primary}
          href={primaryHref}
          onClick={() => handleClick(config.primary)}
        />
        {showSecondary && config.secondary && secondaryHref && (
          <CrossSellCard
            recommendation={config.secondary}
            href={secondaryHref}
            onClick={() => handleClick(config.secondary!)}
            variant="secondary"
          />
        )}
      </div>
    );
  }

  // Sidebar variant - compact for sidebars
  if (variant === 'sidebar') {
    return (
      <div className={`bg-gray-50 rounded-lg p-4 ${className}`}>
        <h4 className="font-semibold text-gray-900 text-sm mb-3">
          You might also need
        </h4>
        <div className="space-y-3">
          <Link
            href={primaryHref}
            onClick={() => handleClick(config.primary)}
            className="block p-3 bg-white border border-gray-200 rounded-lg hover:border-primary/50 hover:shadow-sm transition-all"
          >
            <div className="font-medium text-gray-900 text-sm">
              {config.primary.title}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {config.primary.description}
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-primary font-semibold text-sm">
                {config.primary.price}
              </span>
              <span className="text-primary text-xs flex items-center gap-1">
                Learn more <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </Link>
          {showSecondary && config.secondary && secondaryHref && (
            <Link
              href={secondaryHref}
              onClick={() => handleClick(config.secondary!)}
              className="block p-3 bg-white border border-gray-200 rounded-lg hover:border-primary/50 hover:shadow-sm transition-all"
            >
              <div className="font-medium text-gray-900 text-sm">
                {config.secondary.title}
              </div>
              <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                {config.secondary.description}
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-primary font-semibold text-sm">
                  {config.secondary.price}
                </span>
                <span className="text-primary text-xs flex items-center gap-1">
                  Learn more <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </Link>
          )}
        </div>
      </div>
    );
  }

  // Inline variant - simple text link
  return (
    <div className={`inline-flex flex-wrap items-center gap-4 text-sm ${className}`}>
      <Link
        href={primaryHref}
        onClick={() => handleClick(config.primary)}
        className="text-primary hover:underline font-medium inline-flex items-center gap-1"
      >
        {config.primary.ctaText} ({config.primary.price})
        <ArrowRight className="w-3 h-3" />
      </Link>
      {showSecondary && config.secondary && secondaryHref && (
        <>
          <span className="text-gray-400">•</span>
          <Link
            href={secondaryHref}
            onClick={() => handleClick(config.secondary!)}
            className="text-gray-600 hover:text-primary inline-flex items-center gap-1"
          >
            {config.secondary.ctaText}
            <ArrowRight className="w-3 h-3" />
          </Link>
        </>
      )}
    </div>
  );
}

/**
 * Individual cross-sell card component
 */
function CrossSellCard({
  recommendation,
  href,
  onClick,
  variant = 'primary',
}: {
  recommendation: CrossSellRecommendation;
  href: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}) {
  const isPrimary = variant === 'primary';

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`block p-5 rounded-xl border transition-all group ${
        isPrimary
          ? 'bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 hover:shadow-lg'
          : 'bg-white border-gray-200 hover:border-primary/30 hover:shadow-md'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className={`font-semibold mb-1 ${isPrimary ? 'text-lg text-gray-900' : 'text-gray-900'}`}>
            {recommendation.title}
          </h3>
          <p className={`text-sm ${isPrimary ? 'text-gray-600' : 'text-gray-500'}`}>
            {recommendation.description}
          </p>
        </div>
        <div className="text-right shrink-0">
          <div className={`font-bold ${isPrimary ? 'text-lg text-primary' : 'text-primary'}`}>
            {recommendation.price}
          </div>
        </div>
      </div>
      <div className={`mt-3 flex items-center gap-2 ${isPrimary ? 'text-primary' : 'text-gray-600 group-hover:text-primary'} transition-colors`}>
        <span className="font-medium text-sm">{recommendation.ctaText}</span>
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}

export default CrossSellBanner;
