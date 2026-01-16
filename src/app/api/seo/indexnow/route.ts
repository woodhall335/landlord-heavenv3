/**
 * IndexNow API Route
 *
 * POST /api/seo/indexnow
 * Submit URLs to IndexNow for instant indexing
 *
 * Body options:
 * - { urls: string[] } - Submit specific URLs
 * - { action: "sitemap" } - Submit all sitemap URLs
 * - { action: "key-pages" } - Submit key product/landing pages
 *
 * Protected by admin API key for security
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  submitUrlsToIndexNow,
  submitSitemapToIndexNow,
  getKeyPageUrls,
} from '@/lib/seo/indexnow';

// Simple API key protection (set in environment)
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

export async function POST(request: NextRequest) {
  // Check authorization
  const authHeader = request.headers.get('authorization');
  const apiKey = authHeader?.replace('Bearer ', '');

  if (ADMIN_API_KEY && apiKey !== ADMIN_API_KEY) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    // Handle different submission types
    if (body.action === 'sitemap') {
      // Submit entire sitemap
      const results = await submitSitemapToIndexNow();
      return NextResponse.json({
        success: true,
        action: 'sitemap',
        results,
      });
    }

    if (body.action === 'key-pages') {
      // Submit key product/landing pages
      const urls = getKeyPageUrls();
      const results = await submitUrlsToIndexNow(urls);
      return NextResponse.json({
        success: true,
        action: 'key-pages',
        urlCount: urls.length,
        results,
      });
    }

    if (body.urls && Array.isArray(body.urls)) {
      // Submit specific URLs
      const results = await submitUrlsToIndexNow(body.urls);
      return NextResponse.json({
        success: true,
        action: 'custom',
        urlCount: body.urls.length,
        results,
      });
    }

    return NextResponse.json(
      { error: 'Invalid request. Provide urls array or action (sitemap/key-pages)' },
      { status: 400 }
    );
  } catch (error) {
    console.error('IndexNow submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to check IndexNow status
export async function GET() {
  return NextResponse.json({
    status: 'IndexNow configured',
    keyLocation: 'https://landlordheaven.co.uk/d200bfc932ff84eeae049307cf2bb87f.txt',
    endpoints: [
      'https://api.indexnow.org/indexnow',
      'https://www.bing.com/indexnow',
    ],
    usage: {
      submitUrls: 'POST with { urls: ["url1", "url2"] }',
      submitSitemap: 'POST with { action: "sitemap" }',
      submitKeyPages: 'POST with { action: "key-pages" }',
    },
  });
}
