/**
 * Dynamic Sitemap
 *
 * Generates sitemap.xml with main marketing pages and product pages.
 * Private routes (dashboard, wizard, auth) are excluded.
 */

import { MetadataRoute } from 'next';
import { blogPosts } from '@/lib/blog/posts';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://landlordheaven.co.uk';
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

  // Tenancy agreement pages
  const tenancyPages = [
    { path: '/tenancy-agreements', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/tenancy-agreements/standard', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/tenancy-agreements/premium', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/tenancy-agreements/england-wales', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/tenancy-agreements/scotland', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/tenancy-agreements/northern-ireland', priority: 0.8, changeFrequency: 'weekly' as const },
  ];

  // Tool pages - Free tools for SEO traffic
  const toolPages = [
    { path: '/tools', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/tools/free-section-21-notice-generator', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/tools/free-section-8-notice-generator', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/tools/rent-arrears-calculator', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/tools/hmo-license-checker', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/tools/free-rent-demand-letter', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/tools/validators', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/tools/validators/scotland-notice-to-leave', priority: 0.7, changeFrequency: 'monthly' as const },
  ];

  // Auth entry points (login/signup visible to crawlers)
  const authEntryPages = [
    { path: '/auth/login', priority: 0.5, changeFrequency: 'monthly' as const },
    { path: '/auth/signup', priority: 0.5, changeFrequency: 'monthly' as const },
  ];

  // Blog pages with explicit lastModified dates
  const blogPostPages = blogPosts.map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updatedDate || post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  const allPages = [
    ...marketingPages,
    ...productPages,
    ...tenancyPages,
    ...toolPages,
    ...authEntryPages,
    { path: '/blog', priority: 0.9, changeFrequency: 'weekly' as const },
  ];

  return [
    ...allPages.map((page) => ({
      url: `${siteUrl}${page.path}`,
      lastModified: now,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    })),
    ...blogPostPages,
  ];
}
