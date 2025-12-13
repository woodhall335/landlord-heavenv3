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
