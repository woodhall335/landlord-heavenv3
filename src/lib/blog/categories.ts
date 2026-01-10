/**
 * Blog Category Utilities
 *
 * Provides utilities for categorizing blog posts by region
 * and managing category metadata for SEO.
 */

import { BlogPost } from './types';

export type BlogRegion = 'england' | 'scotland' | 'wales' | 'northern-ireland' | 'uk';

export interface CategoryConfig {
  slug: BlogRegion;
  name: string;
  title: string;
  description: string;
  metaDescription: string;
  flag: string;
  relatedTopics: string[];
}

/**
 * Category configuration for each region
 */
export const BLOG_CATEGORIES: Record<BlogRegion, CategoryConfig> = {
  england: {
    slug: 'england',
    name: 'England',
    title: 'England Landlord Guides (2026)',
    description: 'Comprehensive guides for landlords in England covering Section 21, Section 8, AST tenancies, deposit protection, and eviction procedures under English law.',
    metaDescription: 'England landlord guides 2026: Section 21, Section 8, AST tenancies, deposit protection, eviction procedures. Expert legal guidance for English landlords.',
    flag: '/gb-eng.svg',
    relatedTopics: ['Section 21', 'Section 8', 'Assured Shorthold Tenancy', 'Accelerated Possession'],
  },
  scotland: {
    slug: 'scotland',
    name: 'Scotland',
    title: 'Scotland Landlord Guides (2026)',
    description: 'Expert guides for Scottish landlords on Private Residential Tenancies, Notice to Leave, First-tier Tribunal procedures, and landlord registration requirements.',
    metaDescription: 'Scotland landlord guides 2026: PRT tenancies, Notice to Leave, First-tier Tribunal, landlord registration. Legal guidance for Scottish landlords.',
    flag: '/gb-sct.svg',
    relatedTopics: ['Private Residential Tenancy', 'Notice to Leave', 'First-tier Tribunal', 'Landlord Registration'],
  },
  wales: {
    slug: 'wales',
    name: 'Wales',
    title: 'Wales Landlord Guides (2026)',
    description: 'Complete guides for Welsh landlords on the Renting Homes (Wales) Act, Standard Occupation Contracts, Rent Smart Wales registration, and possession procedures.',
    metaDescription: 'Wales landlord guides 2026: Renting Homes Act, Standard Occupation Contracts, Rent Smart Wales. Expert guidance for Welsh landlords.',
    flag: '/gb-wls.svg',
    relatedTopics: ['Renting Homes Act', 'Standard Occupation Contract', 'Rent Smart Wales', 'Fitness for Habitation'],
  },
  'northern-ireland': {
    slug: 'northern-ireland',
    name: 'Northern Ireland',
    title: 'Northern Ireland Landlord Guides (2026)',
    description: 'Guides for landlords in Northern Ireland covering the Private Tenancies Order, landlord registration, deposit protection schemes, and eviction procedures.',
    metaDescription: 'Northern Ireland landlord guides 2026: Private Tenancies Order, landlord registration, deposit protection. Legal guidance for NI landlords.',
    flag: '/gb-nir.svg',
    relatedTopics: ['Private Tenancies Order', 'Landlord Registration', 'Tenancy Deposit Scheme'],
  },
  uk: {
    slug: 'uk',
    name: 'UK-Wide',
    title: 'UK Landlord Guides (2026)',
    description: 'UK-wide landlord guides covering topics that apply across all jurisdictions: insurance, tax, tenant referencing, right to rent checks, and general compliance.',
    metaDescription: 'UK landlord guides 2026: insurance, tax, safety regulations, tenant referencing, right to rent. Expert guidance for landlords across Britain.',
    flag: '/uk.svg',
    relatedTopics: ['Landlord Insurance', 'Tax', 'Gas Safety', 'Electrical Safety', 'Right to Rent'],
  },
};

/**
 * Determines the region of a blog post based on its slug prefix
 */
export function getPostRegion(slug: string): BlogRegion | null {
  if (slug.startsWith('england-')) return 'england';
  if (slug.startsWith('scotland-')) return 'scotland';
  if (slug.startsWith('wales-')) return 'wales';
  if (slug.startsWith('northern-ireland-')) return 'northern-ireland';
  if (slug.startsWith('uk-')) return 'uk';
  return null;
}

/**
 * Filters blog posts by region
 */
export function getPostsByRegion(posts: BlogPost[], region: BlogRegion): BlogPost[] {
  return posts.filter((post) => getPostRegion(post.slug) === region);
}

/**
 * Gets all posts that don't belong to a specific region (general guides)
 */
export function getGeneralPosts(posts: BlogPost[]): BlogPost[] {
  return posts.filter((post) => getPostRegion(post.slug) === null);
}

/**
 * Gets the category config for a region
 */
export function getCategoryConfig(region: BlogRegion): CategoryConfig | null {
  return BLOG_CATEGORIES[region] || null;
}

/**
 * Gets all valid region slugs
 */
export function getValidRegions(): BlogRegion[] {
  return Object.keys(BLOG_CATEGORIES) as BlogRegion[];
}

/**
 * Gets the display name for a region's breadcrumb
 */
export function getRegionBreadcrumbName(region: BlogRegion): string {
  const config = BLOG_CATEGORIES[region];
  if (!config) return region;
  return `${config.name} Guides`;
}

/**
 * Counts posts by region
 */
export function getPostCountsByRegion(posts: BlogPost[]): Record<BlogRegion, number> {
  const counts: Record<BlogRegion, number> = {
    england: 0,
    scotland: 0,
    wales: 0,
    'northern-ireland': 0,
    uk: 0,
  };

  posts.forEach((post) => {
    const region = getPostRegion(post.slug);
    if (region) {
      counts[region]++;
    }
  });

  return counts;
}

/**
 * Gets topics/keywords for a post based on its region
 * Used for determining relevant related content
 */
export function getPostTopics(post: BlogPost): string[] {
  const topics: string[] = [];

  // Add from tags
  topics.push(...post.tags.map((t) => t.toLowerCase()));

  // Add target keyword
  if (post.targetKeyword) {
    topics.push(post.targetKeyword.toLowerCase());
  }

  // Add category
  topics.push(post.category.toLowerCase());

  return [...new Set(topics)]; // Remove duplicates
}
