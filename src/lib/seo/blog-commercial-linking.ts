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
 * Determine if the current blog post is about a topic that
 * should NOT be cannibalized (i.e., is close to a product page)
 *
 * Returns true if the post should link out rather than compete.
 */
export function isCannibalizing(post: BlogPost): boolean {
  const competingTerms = [
    // Head terms for core products
    'section 21 notice',
    'section 8 notice',
    'eviction notice uk',
    'eviction notice england',
    'tenancy agreement template',
    'ast template',
    'assured shorthold tenancy template',
    'money claim rent',
    'rent arrears claim',
  ];

  const lowerTitle = post.title.toLowerCase();
  const lowerKeyword = post.targetKeyword.toLowerCase();

  for (const term of competingTerms) {
    if (lowerTitle.includes(term) || lowerKeyword.includes(term)) {
      return true;
    }
  }

  return false;
}
