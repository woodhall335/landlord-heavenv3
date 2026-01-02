/**
 * Next.js Middleware
 *
 * Handles:
 * - Supabase session refresh (critical for auth to work)
 * - CORS for API routes (environment-aware)
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

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

/**
 * Refresh Supabase session
 * This is critical for auth to work across server and client
 */
async function refreshSupabaseSession(request: NextRequest, response: NextResponse) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Skip if Supabase not configured
  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // Refresh session - this updates the cookies if needed
  await supabase.auth.getUser();

  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const origin = request.headers.get('origin');

  // Handle CORS preflight for API routes
  if (pathname.startsWith('/api/') && request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 204 });
    return addCorsHeaders(response, origin);
  }

  // Create base response
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Refresh Supabase session for all routes
  response = await refreshSupabaseSession(request, response);

  // Add CORS headers for API routes
  if (pathname.startsWith('/api/')) {
    response = addCorsHeaders(response, origin);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
