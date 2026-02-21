/**
 * Supabase Browser Client
 *
 * Used in Client Components for browser-side operations
 * Manages authentication state and user sessions
 */

import { createBrowserClient } from '@supabase/ssr';
import {
  getSupabaseConfigForBrowserRuntime,
  warnSupabaseNotConfiguredOnce,
} from './config';
import type { Database } from './types';

export function createClient() {
  const config = getSupabaseConfigForBrowserRuntime();
  if (!config) {
    warnSupabaseNotConfiguredOnce();

    const e2eEnabled = process.env.NEXT_PUBLIC_E2E_MODE === 'true' || process.env.E2E_MODE === 'true';
    if (e2eEnabled) {
      // E2E mode: provide a minimal anonymous auth stub so client pages remain renderable.
      return {
        auth: {
          getUser: async () => ({ data: { user: null }, error: null }),
          getSession: async () => ({ data: { session: null }, error: null }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
        },
      } as any;
    }

    throw new Error('Supabase not configured');
  }

  return createBrowserClient<Database>(config.url, config.anonKey);
}

// Singleton instance for browser client
let browserClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseBrowserClient() {
  if (!browserClient) {
    browserClient = createClient();
  }
  return browserClient;
}
