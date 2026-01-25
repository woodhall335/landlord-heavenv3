/**
 * Blog Module Index
 *
 * Provides access to blog posts with lazy loading support.
 *
 * ARCHITECTURE NOTE (Q1 2026):
 * The posts.tsx file has grown to 1.7MB with 116 posts.
 * For production performance, posts should be split by category:
 *
 * Recommended structure:
 * - posts/eviction-guides.tsx (Eviction Guides, Eviction, Eviction Grounds, Eviction Process)
 * - posts/scottish-law.tsx (Scottish Law - 20 posts)
 * - posts/welsh-law.tsx (Welsh Law - 18 posts)
 * - posts/money-claims.tsx (Money Claims - 13 posts)
 * - posts/compliance.tsx (Compliance, Safety Compliance, Legal Compliance)
 * - posts/property-management.tsx (Property Management, Property Investment)
 * - posts/tenancy-agreements.tsx (Tenancy Agreements)
 * - posts/regional.tsx (Northern Ireland Law, UK-Wide)
 * - posts/misc.tsx (Landlord Guides, Resources, Legal)
 *
 * Until split, the main posts.tsx file is imported as-is.
 */

// Re-export types
export type { BlogPost, FAQItem, SourceLink } from './types';

// Re-export posts (import dynamically if performance becomes an issue)
export { blogPosts } from './posts';

// Helper functions
import { blogPosts } from './posts';
import type { BlogPost } from './types';

/**
 * Get a blog post by slug
 */
export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find(post => post.slug === slug);
}

/**
 * Get all posts by category
 */
export function getPostsByCategory(category: string): BlogPost[] {
  return blogPosts.filter(post => post.category === category);
}

/**
 * Get all unique categories
 */
export function getAllCategories(): string[] {
  return [...new Set(blogPosts.map(post => post.category))];
}

/**
 * Get related posts by slug array
 */
export function getRelatedPosts(slugs: string[]): BlogPost[] {
  return slugs
    .map(slug => getPostBySlug(slug))
    .filter((post): post is BlogPost => post !== undefined);
}

/**
 * Get posts sorted by date (newest first)
 */
export function getLatestPosts(limit?: number): BlogPost[] {
  const sorted = [...blogPosts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  return limit ? sorted.slice(0, limit) : sorted;
}

/**
 * Get posts by tag
 */
export function getPostsByTag(tag: string): BlogPost[] {
  return blogPosts.filter(post =>
    post.tags.some(t => t.toLowerCase() === tag.toLowerCase())
  );
}

/**
 * Search posts by keyword in title, description, or tags
 */
export function searchPosts(query: string): BlogPost[] {
  const lowerQuery = query.toLowerCase();
  return blogPosts.filter(post =>
    post.title.toLowerCase().includes(lowerQuery) ||
    post.description.toLowerCase().includes(lowerQuery) ||
    post.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Category counts for blog hub page
 */
export function getCategoryCounts(): Record<string, number> {
  return blogPosts.reduce((acc, post) => {
    acc[post.category] = (acc[post.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

/**
 * Blog statistics
 */
export function getBlogStats() {
  return {
    totalPosts: blogPosts.length,
    categories: getAllCategories().length,
    totalWordCount: blogPosts.reduce((sum, post) => sum + post.wordCount, 0),
    averageWordCount: Math.round(
      blogPosts.reduce((sum, post) => sum + post.wordCount, 0) / blogPosts.length
    ),
  };
}
