/**
 * Server Auth Helpers
 *
 * Re-exports authentication utilities from server.ts for convenience
 * This allows imports from both @/lib/supabase/server-auth and @/lib/supabase/server
 */

export {
  requireServerAuth,
  getServerUser,
  createServerSupabaseClient,
  createAdminClient,
} from './server';
