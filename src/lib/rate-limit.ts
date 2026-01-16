/**
 * Rate Limiting Utility
 *
 * Memory-based rate limiter for API route protection.
 * Note: This implementation uses in-memory storage and is suitable for
 * single-instance deployments. For multi-instance/serverless, use Redis.
 *
 * Usage:
 *   import { rateLimit, RateLimitConfig } from '@/lib/rate-limit';
 *
 *   // In your route handler:
 *   const rateLimitResult = await rateLimit(request, { limit: 10, windowMs: 60000 });
 *   if (!rateLimitResult.success) {
 *     return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
 *   }
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from './logger';

export interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  limit: number;
  /** Time window in milliseconds */
  windowMs: number;
  /** Key prefix for namespacing (e.g., 'auth', 'wizard', 'api') */
  keyPrefix?: string;
  /** Custom key generator function (defaults to IP-based) */
  keyGenerator?: (request: NextRequest) => string;
  /** Skip rate limiting for certain requests */
  skip?: (request: NextRequest) => boolean;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp when the window resets
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory store for rate limiting
// Note: This is reset on server restart and doesn't work across instances
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries periodically (every 5 minutes)
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupExpiredEntries(): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;

  lastCleanup = now;
  let cleaned = 0;

  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    logger.debug('Rate limit cleanup', { entriesRemoved: cleaned });
  }
}

/**
 * Get client identifier from request
 */
function getClientId(request: NextRequest): string {
  // Try to get real IP from various headers (Vercel, Cloudflare, etc.)
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback to a generic identifier
  return 'unknown';
}

/**
 * Parse rate limit string from env (e.g., "50 per 15 minutes")
 */
export function parseRateLimitString(str: string): { limit: number; windowMs: number } | null {
  const match = str.match(/^(\d+)\s+per\s+(\d+)\s+(second|minute|hour|day)s?$/i);
  if (!match) return null;

  const limit = parseInt(match[1], 10);
  const value = parseInt(match[2], 10);
  const unit = match[3].toLowerCase();

  let windowMs: number;
  switch (unit) {
    case 'second':
      windowMs = value * 1000;
      break;
    case 'minute':
      windowMs = value * 60 * 1000;
      break;
    case 'hour':
      windowMs = value * 60 * 60 * 1000;
      break;
    case 'day':
      windowMs = value * 24 * 60 * 60 * 1000;
      break;
    default:
      return null;
  }

  return { limit, windowMs };
}

/**
 * Check rate limit for a request
 */
export async function rateLimit(
  request: NextRequest,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  // Cleanup old entries occasionally
  cleanupExpiredEntries();

  const { limit, windowMs, keyPrefix = 'default', keyGenerator, skip } = config;

  // Check if we should skip rate limiting
  if (skip && skip(request)) {
    return {
      success: true,
      limit,
      remaining: limit,
      reset: Date.now() + windowMs,
    };
  }

  // Generate the key for this client
  const clientId = keyGenerator ? keyGenerator(request) : getClientId(request);
  const key = `${keyPrefix}:${clientId}`;

  const now = Date.now();
  const entry = rateLimitStore.get(key);

  // If no entry or window expired, create new entry
  if (!entry || entry.resetAt < now) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetAt: now + windowMs,
    };
    rateLimitStore.set(key, newEntry);

    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset: newEntry.resetAt,
    };
  }

  // Increment count
  entry.count++;

  // Check if over limit
  if (entry.count > limit) {
    logger.warn('Rate limit exceeded', {
      key,
      count: entry.count,
      limit,
    });

    return {
      success: false,
      limit,
      remaining: 0,
      reset: entry.resetAt,
    };
  }

  return {
    success: true,
    limit,
    remaining: limit - entry.count,
    reset: entry.resetAt,
  };
}

/**
 * Pre-configured rate limiters based on env vars
 */
export const rateLimiters = {
  /**
   * Rate limiter for wizard endpoints
   * Default: 50 requests per 15 minutes
   */
  wizard: (request: NextRequest) => {
    const envConfig = process.env.RATE_LIMIT_WIZARD;
    const parsed = envConfig ? parseRateLimitString(envConfig) : null;
    return rateLimit(request, {
      limit: parsed?.limit ?? 50,
      windowMs: parsed?.windowMs ?? 15 * 60 * 1000,
      keyPrefix: 'wizard',
    });
  },

  /**
   * Rate limiter for document generation endpoints
   * Default: 10 requests per hour
   */
  generation: (request: NextRequest) => {
    const envConfig = process.env.RATE_LIMIT_GENERATION;
    const parsed = envConfig ? parseRateLimitString(envConfig) : null;
    return rateLimit(request, {
      limit: parsed?.limit ?? 10,
      windowMs: parsed?.windowMs ?? 60 * 60 * 1000,
      keyPrefix: 'generation',
    });
  },

  /**
   * Rate limiter for general API endpoints
   * Default: 100 requests per 15 minutes
   */
  api: (request: NextRequest) => {
    const envConfig = process.env.RATE_LIMIT_API;
    const parsed = envConfig ? parseRateLimitString(envConfig) : null;
    return rateLimit(request, {
      limit: parsed?.limit ?? 100,
      windowMs: parsed?.windowMs ?? 15 * 60 * 1000,
      keyPrefix: 'api',
    });
  },

  /**
   * Strict rate limiter for auth endpoints (prevent brute force)
   * Default: 5 requests per minute
   */
  auth: (request: NextRequest) => {
    return rateLimit(request, {
      limit: 5,
      windowMs: 60 * 1000,
      keyPrefix: 'auth',
    });
  },
};

/**
 * Higher-order function to wrap a route handler with rate limiting
 */
export function withRateLimit(
  handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>,
  config: RateLimitConfig
) {
  return async (request: NextRequest, ...args: any[]): Promise<NextResponse> => {
    const result = await rateLimit(request, config);

    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Too many requests',
          message: 'Please try again later',
          retryAfter: Math.ceil((result.reset - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((result.reset - Date.now()) / 1000)),
            'X-RateLimit-Limit': String(result.limit),
            'X-RateLimit-Remaining': String(result.remaining),
            'X-RateLimit-Reset': String(result.reset),
          },
        }
      );
    }

    // Call the original handler and add rate limit headers to response
    const response = await handler(request, ...args);

    // Clone response to add headers
    const newResponse = new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });

    newResponse.headers.set('X-RateLimit-Limit', String(result.limit));
    newResponse.headers.set('X-RateLimit-Remaining', String(result.remaining));
    newResponse.headers.set('X-RateLimit-Reset', String(result.reset));

    return newResponse;
  };
}

export default rateLimit;
