import 'server-only';

import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

type SupabaseAdminDiagnostics = {
  route: string;
  writesUsingAdmin: boolean;
};

function assertAdminRuntime() {
  if (process.env.NEXT_RUNTIME === 'edge') {
    throw new Error('Supabase admin client cannot run in Edge runtime.');
  }

  if (!process.env.SUPABASE_URL) {
    throw new Error('Missing SUPABASE_URL');
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
  }
}

export function createSupabaseAdminClient(): SupabaseClient<Database> {
  assertAdminRuntime();

  return createClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function logSupabaseAdminDiagnostics({ route, writesUsingAdmin }: SupabaseAdminDiagnostics) {
  const isProduction = process.env.NODE_ENV === 'production';
  if (isProduction) return;

  console.info('[supabase-admin]', {
    route,
    writesUsingAdmin,
    hasUrl: Boolean(process.env.SUPABASE_URL),
    hasServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    hasAnonKey: Boolean(process.env.SUPABASE_ANON_KEY),
    isEdgeRuntime: process.env.NEXT_RUNTIME === 'edge',
    isProduction,
  });
}
