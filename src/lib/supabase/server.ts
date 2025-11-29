/**
 * Supabase Server Client
 *
 * Used in Server Components, Server Actions, and Route Handlers
 * Handles cookie-based authentication for SSR
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import type { Database } from './types';

/**
 * Creates a fully-typed Supabase client for server-side use.
 * The client is typed against the Database schema from supabase_schema.md.
 *
 * @returns SupabaseClient<Database> - Fully typed client with schema inference
 */
export function createServerSupabaseClient(): SupabaseClient<Database> {
  const cookieStore = cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (_error) {
            // In some server contexts (e.g. certain Server Components),
            // setting cookies isn't allowed. Silently ignore in those cases.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (_error) {
            // Same as above – safe no-op when cookies can't be mutated
          }
        },
      },
    }
  );
}

/**
 * Admin Client - Bypasses RLS
 * Use ONLY for admin operations and background jobs
 * NEVER expose to client-side code
 */
export function createAdminClient(): SupabaseClient<Database> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  }

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get() {
          return undefined;
        },
        set() {
          // no-op for admin client
        },
        remove() {
          // no-op for admin client
        },
      },
    }
  );
}

/**
 * Get authenticated user from server context
 * Returns null if not authenticated
 */
export async function getServerUser() {
  const supabase = createServerSupabaseClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

/**
 * Require authentication in server context
 * Throws error if not authenticated
 */
export async function requireServerAuth() {
  const user = await getServerUser();

  if (!user) {
    throw new Error('Unauthorized - Please log in');
  }

  return user;
}

/**
 * Alias for createServerSupabaseClient (for backwards compatibility)
 */
export const createClient = createServerSupabaseClient;
