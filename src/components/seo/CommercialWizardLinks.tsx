'use client';

import Link from 'next/link';
import { ArrowRight, FileText, Home, Scale, Banknote, AlertTriangle } from 'lucide-react';
import {
  type CommercialIntent,
  type CommercialLinkTarget,
  type CommercialLinkingResult,
  sortLinksByPriority,
} from '@/lib/seo/commercial-linking';

// =============================================================================
// TYPES
// =============================================================================

export interface CommercialWizardLinksProps {
  /** The analysis result from analyzeContent() */
  result: CommercialLinkingResult;
  /** Visual variant */
  variant?: 'card' | 'inline' | 'sidebar' | 'minimal';
  /** Maximum number of links to show */
  maxLinks?: number;
  /** Additional CSS classes */
  className?: string;
  /** UTM source for tracking */
  utmSource?: string;
}

// =============================================================================
// ICONS
// =============================================================================

const INTENT_ICONS: Record<CommercialIntent, typeof FileText> = {
  tenancy_agreement: Home,
  eviction_notice: FileText,
  eviction_pack: Scale,
  money_claim: Banknote,
};

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * CommercialWizardLinks
 *
 * Renders commercial CTAs linking to core product pages based on detected intent.
 * This is the single source of truth for commercial linking across the site.
 *
 * Features:
 * - Jurisdiction-aware (won't show forbidden links)
 * - Multiple visual variants for different contexts
 * - Predictable height (no CLS)
 * - Accessible anchor text
 * - Crawlable HTML links
 *
 * @example
 * ```tsx
 * const result = analyzeContent({ pathname, title, description });
 * if (result.shouldShow) {
 *   return <CommercialWizardLinks result={result} variant="card" />;
 * }
 * ```
 */
export function CommercialWizardLinks({
  result,
  variant = 'card',
  maxLinks = 2,
  className = '',
  utmSource = 'commercial_linking',
}: CommercialWizardLinksProps) {
  if (!result.shouldShow || result.links.length === 0) {
    // Render disclaimer if present
    if (result.disclaimer) {
      return <DisclaimerBlock disclaimer={result.disclaimer} className={className} />;
    }
    return null;
  }

  // Sort and limit links
  const sortedLinks = sortLinksByPriority(result.links).slice(0, maxLinks);

  // Build UTM parameters
  const buildHref = (target: CommercialLinkTarget) => {
    const url = new URL(target.href, 'https://placeholder.com');
    url.searchParams.set('utm_source', utmSource);
    url.searchParams.set('utm_medium', 'content');
    url.searchParams.set('utm_campaign', 'commercial_linking');
    return `${target.href}${url.search}`;
  };

  switch (variant) {
    case 'inline':
      return (
        <InlineVariant
          links={sortedLinks}
          buildHref={buildHref}
          className={className}
          disclaimer={result.disclaimer}
        />
      );

    case 'sidebar':
      return (
        <SidebarVariant
          links={sortedLinks}
          buildHref={buildHref}
          className={className}
          disclaimer={result.disclaimer}
        />
      );

    case 'minimal':
      return (
        <MinimalVariant
          links={sortedLinks}
          buildHref={buildHref}
          className={className}
        />
      );

    case 'card':
    default:
      return (
        <CardVariant
          links={sortedLinks}
          buildHref={buildHref}
          className={className}
          disclaimer={result.disclaimer}
        />
      );
  }
}

// =============================================================================
// VARIANT COMPONENTS
// =============================================================================

interface VariantProps {
  links: CommercialLinkingResult['links'];
  buildHref: (target: CommercialLinkTarget) => string;
  className?: string;
  disclaimer?: string;
}

/**
 * Card variant - Large prominent cards for main content areas
 */
function CardVariant({ links, buildHref, className, disclaimer }: VariantProps) {
  return (
    <div
      className={`my-8 p-6 bg-gradient-to-br from-primary/5 via-primary/3 to-transparent border border-primary/10 rounded-2xl ${className}`}
      data-commercial-links
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
          <Scale className="w-4 h-4 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Take Action</h3>
      </div>

      <div className="space-y-3">
        {links.map((link) => {
          const Icon = INTENT_ICONS[link.intent];
          return (
            <Link
              key={link.intent}
              href={buildHref(link.target)}
              className="group flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-primary/30 hover:shadow-sm transition-all"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 group-hover:text-primary transition-colors">
                  {link.target.anchorText}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  {link.target.description}
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
            </Link>
          );
        })}
      </div>

      {disclaimer && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500 flex items-start gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
            {disclaimer}
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Inline variant - Compact for within prose content
 */
function InlineVariant({ links, buildHref, className, disclaimer }: VariantProps) {
  const primaryLink = links[0];
  if (!primaryLink) return null;

  const Icon = INTENT_ICONS[primaryLink.intent];

  return (
    <div
      className={`my-6 p-4 bg-primary/5 border border-primary/20 rounded-xl ${className}`}
      data-commercial-links
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <Link
            href={buildHref(primaryLink.target)}
            className="font-medium text-primary hover:underline inline-flex items-center gap-1"
          >
            {primaryLink.target.anchorText}
            <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="text-sm text-gray-600 mt-0.5">
            {primaryLink.target.description}
          </p>

          {/* Show secondary link if available */}
          {links.length > 1 && (
            <Link
              href={buildHref(links[1].target)}
              className="text-sm text-gray-500 hover:text-primary mt-2 inline-flex items-center gap-1"
            >
              Or: {links[1].target.anchorText}
              <ArrowRight className="w-3 h-3" />
            </Link>
          )}

          {disclaimer && (
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-amber-500" />
              {disclaimer}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Sidebar variant - For sticky sidebars
 */
function SidebarVariant({ links, buildHref, className, disclaimer }: VariantProps) {
  return (
    <div
      className={`p-4 bg-gray-50 rounded-xl ${className}`}
      data-commercial-links
    >
      <h4 className="text-sm font-semibold text-gray-900 mb-3">Related Services</h4>
      <div className="space-y-2">
        {links.map((link) => {
          const Icon = INTENT_ICONS[link.intent];
          return (
            <Link
              key={link.intent}
              href={buildHref(link.target)}
              className="group flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100 hover:border-primary/30 transition-colors"
            >
              <Icon className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-primary transition-colors line-clamp-2">
                {link.target.anchorText}
              </span>
            </Link>
          );
        })}
      </div>

      {disclaimer && (
        <p className="text-xs text-gray-500 mt-3 flex items-start gap-1">
          <AlertTriangle className="w-3 h-3 text-amber-500 flex-shrink-0 mt-0.5" />
          <span>{disclaimer}</span>
        </p>
      )}
    </div>
  );
}

/**
 * Minimal variant - Just text links
 */
function MinimalVariant({ links, buildHref, className }: VariantProps) {
  return (
    <div
      className={`flex flex-wrap gap-x-4 gap-y-2 ${className}`}
      data-commercial-links
    >
      {links.map((link) => (
        <Link
          key={link.intent}
          href={buildHref(link.target)}
          className="text-primary hover:underline text-sm font-medium inline-flex items-center gap-1"
        >
          {link.target.anchorText}
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      ))}
    </div>
  );
}

/**
 * Disclaimer block - Shows when service is not supported
 */
function DisclaimerBlock({
  disclaimer,
  className,
}: {
  disclaimer: string;
  className?: string;
}) {
  return (
    <div
      className={`my-6 p-4 bg-amber-50 border border-amber-200 rounded-xl ${className}`}
      data-commercial-links-disclaimer
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-800">Service Not Available</p>
          <p className="text-sm text-amber-700 mt-1">{disclaimer}</p>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// EXPORTS
// =============================================================================

export default CommercialWizardLinks;
