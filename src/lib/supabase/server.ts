/**
 * Supabase Server Client
 *
 * Used in Server Components, Server Actions, and Route Handlers
 * Handles cookie-based authentication for SSR
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import {
  getSupabaseConfigServer,
  warnSupabaseNotConfiguredOnce,
} from './config';
import type { Database } from './types';

/**
 * Creates a fully-typed Supabase client for server-side use.
 * The client is typed against the Database schema from supabase_schema.md.
 *
 * @returns SupabaseClient<Database> - Fully typed client with schema inference
 */
export async function createServerSupabaseClient(): Promise<SupabaseClient<Database>> {
  const config = getSupabaseConfigServer();
  if (!config) {
    warnSupabaseNotConfiguredOnce();
    throw new Error('Supabase not configured');
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(
    config.url,
    config.anonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
          set(name: string, value: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value, ...options });
            } catch {
              // In some server contexts (e.g. certain Server Components),
              // setting cookies isn't allowed. Silently ignore in those cases.
            }
          },
          remove(name: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value: '', ...options });
            } catch {
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
  const config = getSupabaseConfigServer();
  if (!config) {
    warnSupabaseNotConfiguredOnce();
    throw new Error('Supabase not configured');
  }

  if (!config.serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  }

  return createServerClient<Database>(
    config.url,
    config.serviceRoleKey,
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
  if (!getSupabaseConfigServer()) {
    warnSupabaseNotConfiguredOnce();
    return null;
  }

  const supabase = await createServerSupabaseClient();

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
