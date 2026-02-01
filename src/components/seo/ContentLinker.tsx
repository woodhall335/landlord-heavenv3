'use client';

import { useMemo, type ReactNode } from 'react';
import {
  analyzeContent,
  type AnalyzeContentOptions,
  type Jurisdiction,
  type CommercialLinkingResult,
} from '@/lib/seo/commercial-linking';
import { CommercialWizardLinks, type CommercialWizardLinksProps } from './CommercialWizardLinks';

// =============================================================================
// TYPES
// =============================================================================

export interface ContentLinkerProps {
  /** Page pathname */
  pathname: string;
  /** Page title / H1 */
  title?: string;
  /** Meta description */
  description?: string;
  /** First H1 heading */
  heading?: string;
  /** Optional body text for fallback matching */
  bodyText?: string;
  /** Override jurisdiction detection */
  jurisdiction?: Jurisdiction;
  /** Opt out of commercial linking for this page */
  optOut?: boolean;
  /** Visual variant for the CTA */
  variant?: CommercialWizardLinksProps['variant'];
  /** Maximum links to show */
  maxLinks?: number;
  /** Position relative to children: 'before', 'after', or 'both' */
  position?: 'before' | 'after' | 'both';
  /** Additional CSS classes */
  className?: string;
  /** UTM source for tracking */
  utmSource?: string;
  /** Child content to wrap */
  children?: ReactNode;
}

/**
 * ContentLinker
 *
 * A wrapper component that automatically injects commercial CTAs based on
 * page content analysis. Use this to wrap content sections in layouts.
 *
 * @example
 * ```tsx
 * // In a blog post layout
 * <ContentLinker
 *   pathname={pathname}
 *   title={post.title}
 *   description={post.description}
 *   variant="inline"
 *   position="before"
 * >
 *   <article>{content}</article>
 * </ContentLinker>
 * ```
 *
 * @example
 * ```tsx
 * // Opt out for specific pages
 * <ContentLinker pathname={pathname} optOut={true}>
 *   <SpecialContent />
 * </ContentLinker>
 * ```
 */
export function ContentLinker({
  pathname,
  title,
  description,
  heading,
  bodyText,
  jurisdiction,
  optOut = false,
  variant = 'inline',
  maxLinks = 2,
  position = 'before',
  className,
  utmSource,
  children,
}: ContentLinkerProps) {
  // Analyze content and memoize result
  const result = useMemo(() => {
    return analyzeContent({
      pathname,
      title,
      description,
      heading,
      bodyText,
      jurisdiction,
      optOut,
    });
  }, [pathname, title, description, heading, bodyText, jurisdiction, optOut]);

  // Render the CTA component
  const cta = result.shouldShow || result.disclaimer ? (
    <CommercialWizardLinks
      result={result}
      variant={variant}
      maxLinks={maxLinks}
      className={className}
      utmSource={utmSource}
    />
  ) : null;

  // Position the CTA relative to children
  if (position === 'before') {
    return (
      <>
        {cta}
        {children}
      </>
    );
  }

  if (position === 'after') {
    return (
      <>
        {children}
        {cta}
      </>
    );
  }

  // Both positions
  return (
    <>
      {cta}
      {children}
      {cta}
    </>
  );
}

// =============================================================================
// HOOKS
// =============================================================================

/**
 * Hook to analyze content and get commercial linking result
 *
 * Use this when you need more control over rendering or when integrating
 * with existing components.
 *
 * @example
 * ```tsx
 * function MyComponent({ pathname, title }) {
 *   const linkingResult = useCommercialLinking({ pathname, title });
 *
 *   return (
 *     <div>
 *       {linkingResult.shouldShow && (
 *         <CommercialWizardLinks result={linkingResult} variant="card" />
 *       )}
 *       <MainContent />
 *     </div>
 *   );
 * }
 * ```
 */
export function useCommercialLinking(
  options: AnalyzeContentOptions
): CommercialLinkingResult {
  return useMemo(() => analyzeContent(options), [
    options.pathname,
    options.title,
    options.description,
    options.heading,
    options.bodyText,
    options.jurisdiction,
    options.optOut,
  ]);
}

// =============================================================================
// SERVER COMPONENT WRAPPER
// =============================================================================

export interface ServerContentLinkerProps {
  /** Pre-computed analysis result from server */
  result: CommercialLinkingResult;
  /** Visual variant */
  variant?: CommercialWizardLinksProps['variant'];
  /** Maximum links */
  maxLinks?: number;
  /** Position */
  position?: 'before' | 'after' | 'both';
  /** Additional classes */
  className?: string;
  /** UTM source */
  utmSource?: string;
  /** Children */
  children?: ReactNode;
}

/**
 * ServerContentLinker
 *
 * Use this when you've already computed the analysis result on the server.
 * This avoids duplicate computation and works well with SSR.
 *
 * @example
 * ```tsx
 * // In a server component
 * export default function BlogPost({ post }) {
 *   const result = analyzeContent({
 *     pathname: `/blog/${post.slug}`,
 *     title: post.title,
 *     description: post.description,
 *   });
 *
 *   return (
 *     <ServerContentLinker result={result} variant="card" position="before">
 *       <article>{post.content}</article>
 *     </ServerContentLinker>
 *   );
 * }
 * ```
 */
export function ServerContentLinker({
  result,
  variant = 'inline',
  maxLinks = 2,
  position = 'before',
  className,
  utmSource,
  children,
}: ServerContentLinkerProps) {
  const cta = result.shouldShow || result.disclaimer ? (
    <CommercialWizardLinks
      result={result}
      variant={variant}
      maxLinks={maxLinks}
      className={className}
      utmSource={utmSource}
    />
  ) : null;

  if (position === 'before') {
    return (
      <>
        {cta}
        {children}
      </>
    );
  }

  if (position === 'after') {
    return (
      <>
        {children}
        {cta}
      </>
    );
  }

  return (
    <>
      {cta}
      {children}
      {cta}
    </>
  );
}

// =============================================================================
// EXPORTS
// =============================================================================

export default ContentLinker;
