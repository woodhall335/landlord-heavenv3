/**
 * Dynamic robots.txt
 *
 * - Production: Allows all crawlers
 * - Preview/Staging: Disallows all crawlers
 */

import { MetadataRoute } from 'next';
import { SITE_ORIGIN } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  const isProduction = process.env.VERCEL_ENV === 'production' ||
    (process.env.NODE_ENV === 'production' && !process.env.VERCEL_ENV);

  if (!isProduction) {
    // Staging/Preview/Development: Block all crawlers
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
    };
  }

  // Production: Allow crawlers with sensible restrictions
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/blog/'],
        disallow: [
          '/api/',
          '/dashboard/',
          '/auth/',
          '/wizard/',
          '/admin/',
          '/checkout/',
          '/_next/',
        ],
      },
    ],
    sitemap: `${SITE_ORIGIN}/sitemap.xml`,
  };
}
