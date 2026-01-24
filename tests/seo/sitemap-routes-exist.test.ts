/**
 * Sitemap Route Existence Regression Test
 *
 * Ensures all paths produced by src/app/sitemap.ts correspond to real routes.
 * Uses filesystem-based assertions (no HTTP server required).
 *
 * Run with: npx vitest run tests/seo/sitemap-routes-exist.test.ts
 */

import { describe, it, expect, beforeAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Sitemap Route Existence', () => {
  let sitemapPaths: string[] = [];
  const appDir = path.join(process.cwd(), 'src/app');

  beforeAll(async () => {
    // Import sitemap dynamically to get all routes
    const sitemapModule = await import('@/app/sitemap');
    const sitemap = sitemapModule.default();

    // Extract paths from sitemap URLs
    sitemapPaths = sitemap.map((entry) => {
      const url = new URL(entry.url);
      return url.pathname;
    });
  });

  /**
   * Check if a path has a corresponding route in src/app.
   * Next.js routes can be:
   * - page.tsx (standard page)
   * - route.ts (API route)
   * - Also handles dynamic routes with [param] syntax
   */
  function routeExistsForPath(routePath: string): boolean {
    // Handle root path
    if (routePath === '/') {
      const rootPage = path.join(appDir, 'page.tsx');
      return fs.existsSync(rootPage);
    }

    // Remove leading slash and build directory path
    const segments = routePath.slice(1).split('/');
    const directPath = path.join(appDir, ...segments);

    // Check for direct page.tsx match
    const directPagePath = path.join(directPath, 'page.tsx');
    if (fs.existsSync(directPagePath)) {
      return true;
    }

    // Check for route.ts (API route)
    const directRoutePath = path.join(directPath, 'route.ts');
    if (fs.existsSync(directRoutePath)) {
      return true;
    }

    // Handle dynamic routes (e.g., /blog/[slug])
    // For paths like /blog/some-post, check if /blog/[slug]/page.tsx exists
    if (segments.length >= 2) {
      const parentSegments = segments.slice(0, -1);
      const parentDir = path.join(appDir, ...parentSegments);

      if (fs.existsSync(parentDir)) {
        // Look for dynamic route folders
        try {
          const children = fs.readdirSync(parentDir);
          for (const child of children) {
            if (child.startsWith('[') && child.endsWith(']')) {
              const dynamicPagePath = path.join(parentDir, child, 'page.tsx');
              if (fs.existsSync(dynamicPagePath)) {
                return true;
              }
            }
          }
        } catch {
          // Directory read failed, route doesn't exist
        }
      }
    }

    return false;
  }

  it('should have at least one sitemap entry', () => {
    expect(sitemapPaths.length).toBeGreaterThan(0);
  });

  it('should only include paths that have corresponding routes', () => {
    const missingRoutes: string[] = [];

    for (const routePath of sitemapPaths) {
      if (!routeExistsForPath(routePath)) {
        missingRoutes.push(routePath);
      }
    }

    // Provide detailed error message for failures
    if (missingRoutes.length > 0) {
      const errorMessage = `${missingRoutes.length} sitemap route(s) do not have corresponding pages:\n${missingRoutes.map((r) => `  - ${r}`).join('\n')}`;
      expect(missingRoutes, errorMessage).toEqual([]);
    }
  });

  it('should include core Money Claim SEO pages', () => {
    // Verify critical money claim pages are in sitemap
    const moneyClaimPages = [
      '/products/money-claim',
      '/money-claim-unpaid-rent',
      '/money-claim-property-damage',
      '/money-claim-cleaning-costs',
    ];

    for (const page of moneyClaimPages) {
      expect(sitemapPaths, `Missing critical Money Claim page: ${page}`).toContain(page);
    }
  });

  it('all Money Claim SEO pages should have corresponding routes', () => {
    const moneyClaimPaths = sitemapPaths.filter((p) => p.includes('money-claim'));
    const missingRoutes: string[] = [];

    for (const routePath of moneyClaimPaths) {
      if (!routeExistsForPath(routePath)) {
        missingRoutes.push(routePath);
      }
    }

    expect(
      missingRoutes,
      `Money Claim sitemap routes without pages: ${missingRoutes.join(', ')}`
    ).toEqual([]);
  });
});
