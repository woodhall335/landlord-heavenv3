/**
 * Blog Post Commercial Linking Helpers
 *
 * Specialized utilities for integrating commercial linking into blog posts.
 * Uses blog-specific data (region, category, tags) for better intent detection.
 */

import {
  analyzeContent,
  type CommercialLinkingResult,
  type Jurisdiction,
} from './commercial-linking';
import type { BlogPost } from '@/lib/blog/types';
import type { BlogRegion } from '@/lib/blog/categories';

/**
 * Maps BlogRegion to commercial linking Jurisdiction
 */
function mapBlogRegionToJurisdiction(region: BlogRegion | null): Jurisdiction {
  if (!region) return 'uk';

  switch (region) {
    case 'england':
      return 'england';
    case 'scotland':
      return 'scotland';
    case 'wales':
      return 'wales';
    case 'northern-ireland':
      return 'northern-ireland';
    case 'uk':
    default:
      return 'uk';
  }
}

/**
 * Analyze a blog post for commercial linking opportunities
 *
 * This is optimized for blog posts and uses the structured data
 * available from the post object for better intent detection.
 */
export function analyzeBlogPost(
  post: BlogPost,
  region: BlogRegion | null
): CommercialLinkingResult {
  // Build comprehensive text from blog post metadata
  const textSources = [
    post.title,
    post.description,
    post.metaDescription,
    post.targetKeyword,
    ...post.secondaryKeywords,
    post.category,
    ...post.tags,
  ]
    .filter(Boolean)
    .join(' ');

  const jurisdiction = mapBlogRegionToJurisdiction(region);

  return analyzeContent({
    pathname: `/blog/${post.slug}`,
    title: post.title,
    description: post.description,
    heading: post.title,
    bodyText: textSources,
    jurisdiction,
  });
}

/**
 * Check if a blog post should show commercial links
 *
 * Some posts may be opt-out due to their nature (e.g., pure informational)
 */
export function shouldShowCommercialLinks(
  post: BlogPost,
  region: BlogRegion | null
): boolean {
  // Opt out for posts that are purely compliance/informational
  // and don't lead to a commercial action
  const optOutCategories = ['news', 'updates', 'announcements'];
  if (optOutCategories.includes(post.category.toLowerCase())) {
    return false;
  }

  // Analyze and check result
  const result = analyzeBlogPost(post, region);
  return result.shouldShow;
}

/**
 * Get the primary commercial intent for a blog post
 *
 * Useful for determining which product to highlight most prominently.
 */
export function getPrimaryIntent(
  post: BlogPost,
  region: BlogRegion | null
): CommercialLinkingResult['links'][0] | null {
  const result = analyzeBlogPost(post, region);
  if (!result.shouldShow || result.links.length === 0) {
    return null;
  }
  return result.links[0];
}

/**
 * Determine if the current blog post needs commercial deconflict styling.
 *
 * Returns true when the post reads like a template/download intent so we
 * bias toward informational phrasing and stronger product/pillar linking.
 * This MUST NOT be used to noindex content.
 */
export function isCannibalizing(post: BlogPost): boolean {
  const text = [post.title, post.targetKeyword].filter(Boolean).join(' ').toLowerCase();

  const commercialTriggers = [
    'template',
    'download',
    'pdf',
    'generator',
    'form 6a',
    'form 3',
    'price',
    'pricing',
    'pack',
    'bundle',
    'notice only',
    'complete pack',
    'mcol',
    'money claim online',
    'n5b',
    'n5b form',
  ];

  const headTerms = [
    'section 21 notice',
    'section 8 notice',
    'eviction notice',
    'tenancy agreement',
    'assured shorthold tenancy',
    'ast',
    'money claim',
    'rent arrears',
  ];

  const explicitCommercial = ['form 6a', 'form 3', 'n5b', 'n5b form'];

  const hasCommercialTrigger = commercialTriggers.some((term) => text.includes(term));
  const hasHeadTerm = headTerms.some((term) => text.includes(term));
  const hasExplicitCommercial = explicitCommercial.some((term) => text.includes(term));

  return hasExplicitCommercial || (hasCommercialTrigger && hasHeadTerm);
}
