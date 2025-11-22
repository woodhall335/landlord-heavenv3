/**
 * Supabase - Index
 *
 * Centralized exports for all Supabase utilities
 */

export { createClient, getSupabaseBrowserClient } from './client';
export { createServerSupabaseClient, createAdminClient, getServerUser, requireServerAuth } from './server';
export type { Database } from './types';
