/**
 * Auth Guard: Require Authenticated User
 *
 * Returns the authenticated user or throws a 401 NextResponse.
 * Use in API routes that require authentication.
 */

import { NextResponse } from 'next/server';
import { getServerUser } from '@/lib/supabase/server';
import type { User } from '@supabase/supabase-js';

export interface RequireUserResult {
  user: User;
}

/**
 * Require an authenticated user in an API route.
 * Throws a 401 NextResponse if not authenticated.
 *
 * @returns The authenticated user
 * @throws NextResponse with 401 status if not authenticated
 *
 * @example
 * export async function POST(request: Request) {
 *   const { user } = await requireUser();
 *   // ... user is guaranteed to be authenticated
 * }
 */
export async function requireUser(): Promise<RequireUserResult> {
  const user = await getServerUser();

  if (!user) {
    throw NextResponse.json(
      {
        error: 'UNAUTHORIZED',
        code: 'UNAUTHORIZED',
        message: 'Authentication required. Please log in.',
      },
      { status: 401 }
    );
  }

  return { user };
}

/**
 * Try to get the authenticated user, returning null if not authenticated.
 * Does not throw - use when authentication is optional.
 */
export async function tryGetUser(): Promise<User | null> {
  return getServerUser();
}
