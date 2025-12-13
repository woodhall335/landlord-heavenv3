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
  getSupabaseConfigForServerRuntime,
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
  const client = await tryCreateServerSupabaseClient();
  if (!client) {
    warnSupabaseNotConfiguredOnce();
    throw new Error('Supabase not configured');
  }

  return client;
}

/**
 * Admin Client - Bypasses RLS
 * Use ONLY for admin operations and background jobs
 * NEVER expose to client-side code
 */
export function createAdminClient(): SupabaseClient<Database> {
  const config = getSupabaseConfigForServerRuntime();

  if (!config || !config.serviceRoleKey) {
    warnSupabaseNotConfiguredOnce();
    throw new Error('Supabase not configured');
  }

  return createServerClient<Database>(config.url, config.serviceRoleKey, {
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
  });
}

/**
 * Get authenticated user from server context
 * Returns null if not authenticated
 */
export async function getServerUser() {
  const supabase = await tryCreateServerSupabaseClient();
  if (!supabase) {
    warnSupabaseNotConfiguredOnce();
    return null;
  }

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

export async function tryCreateServerSupabaseClient(): Promise<SupabaseClient<Database> | null> {
  const config = getSupabaseConfigForServerRuntime();
  if (!config) return null;

  const cookieStore = await cookies();

  return createServerClient<Database>(config.url, config.anonKey, {
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
  });
}

export async function tryGetServerUser() {
  const supabase = await tryCreateServerSupabaseClient();
  if (!supabase) return null;

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}
