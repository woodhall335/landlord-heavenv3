/**
 * Next.js Middleware
 *
 * Handles:
 * - CORS for API routes (environment-aware)
 * - Other cross-cutting concerns can be added here
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Get allowed origins based on environment
 */
function getAllowedOrigins(): string[] {
  // Check for explicit allowed origins from env
  const envOrigins = process.env.ALLOWED_ORIGINS;
  if (envOrigins) {
    return envOrigins.split(',').map((o) => o.trim());
  }

  // Check environment
  const isProduction = process.env.VERCEL_ENV === 'production' ||
    (process.env.NODE_ENV === 'production' && !process.env.VERCEL_ENV);

  if (isProduction) {
    // Production: Only allow canonical domains
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://landlordheaven.co.uk';
    return [
      siteUrl,
      'https://landlordheaven.co.uk',
      'https://www.landlordheaven.co.uk',
    ];
  }

  // Development/Preview: Allow localhost and Vercel preview URLs
  return [
    'http://localhost:3000',
    'http://localhost:5000',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5000',
  ];
}

/**
 * Check if origin is allowed
 */
function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;

  const allowedOrigins = getAllowedOrigins();

  // Exact match
  if (allowedOrigins.includes(origin)) return true;

  // Check for Vercel preview URLs in non-production
  const isProduction = process.env.VERCEL_ENV === 'production';
  if (!isProduction && origin.includes('.vercel.app')) {
    return true;
  }

  return false;
}

/**
 * Add CORS headers to response
 */
function addCorsHeaders(
  response: NextResponse,
  origin: string | null
): NextResponse {
  const isAllowed = isOriginAllowed(origin);

  if (isAllowed && origin) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }

  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE, OPTIONS'
  );
  response.headers.set(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );
  response.headers.set('Access-Control-Max-Age', '86400');

  return response;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const origin = request.headers.get('origin');

  // Only handle CORS for API routes
  if (pathname.startsWith('/api/')) {
    // Handle preflight OPTIONS request
    if (request.method === 'OPTIONS') {
      const response = new NextResponse(null, { status: 204 });
      return addCorsHeaders(response, origin);
    }

    // For other requests, add CORS headers to the response
    const response = NextResponse.next();
    return addCorsHeaders(response, origin);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all API routes
    '/api/:path*',
  ],
};
