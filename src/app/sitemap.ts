/**
 * Dynamic Sitemap
 *
 * Generates sitemap.xml with main marketing pages and product pages.
 * Private routes (dashboard, wizard, auth) are excluded.
 */

import { MetadataRoute } from 'next';
import { blogPosts } from '@/lib/blog/posts';
import { SITE_ORIGIN } from '@/lib/seo';
import { freeTools, validatorToolRoutes } from '@/lib/tools/tools';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Core marketing pages
  const marketingPages = [
    { path: '/', priority: 1.0, changeFrequency: 'weekly' as const },
    { path: '/pricing', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/about', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/contact', priority: 0.6, changeFrequency: 'monthly' as const },
    { path: '/help', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/terms', priority: 0.3, changeFrequency: 'yearly' as const },
    { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' as const },
    { path: '/cookies', priority: 0.3, changeFrequency: 'yearly' as const },
  ];

  // Product pages
  const productPages = [
    { path: '/products/notice-only', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/products/complete-pack', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/products/money-claim', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/products/ast', priority: 0.9, changeFrequency: 'weekly' as const },
    // HMO Pro removed - parked for later review
    // { path: '/hmo-pro', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/ask-heaven', priority: 0.8, changeFrequency: 'weekly' as const },
  ];

  // Tenancy agreement pages (only canonical 200 URLs - excludes redirect targets)
  const tenancyPages = [
    { path: '/tenancy-agreements/england-wales', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/tenancy-agreements/scotland', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/tenancy-agreements/northern-ireland', priority: 0.8, changeFrequency: 'weekly' as const },
  ];

  // Long-tail landing pages - SEO targeted
  const landingPages = [
    { path: '/section-21-notice-template', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/eviction-notice-template', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/section-8-notice-template', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/rent-arrears-letter-template', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/tenancy-agreement-template', priority: 0.8, changeFrequency: 'weekly' as const },
  ];

  // Tool pages - Free tools for SEO traffic
  const toolPages = [
    { path: '/tools', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/tools/validators', priority: 0.8, changeFrequency: 'weekly' as const },
    ...freeTools
      .filter((tool) => tool.href.startsWith('/tools'))
      .map((tool) => ({
        path: tool.href,
        priority: 0.8,
        changeFrequency: 'weekly' as const,
      })),
    ...validatorToolRoutes.map((path) => ({
      path,
      priority: 0.8,
      changeFrequency: 'weekly' as const,
    })),
  ];

  // Auth entry points excluded - these pages are noindex
  // /auth/login and /auth/signup are not in sitemap

  // Blog pages with explicit lastModified dates
  const blogPostPages = blogPosts.map((post) => ({
    url: `${SITE_ORIGIN}/blog/${post.slug}`,
    lastModified: new Date(post.updatedDate || post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  const allPages = [
    ...marketingPages,
    ...productPages,
    ...tenancyPages,
    ...landingPages,
    ...toolPages,
    { path: '/blog', priority: 0.9, changeFrequency: 'weekly' as const },
  ];

  return [
    ...allPages.map((page) => ({
      url: `${SITE_ORIGIN}${page.path}`,
      lastModified: now,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    })),
    ...blogPostPages,
  ];
}
