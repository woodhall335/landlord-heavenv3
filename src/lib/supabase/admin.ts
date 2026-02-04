import 'server-only';

import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

type SupabaseAdminDiagnostics = {
  route: string;
  writesUsingAdmin: boolean;
};

let hasLoggedAdminEnvStatus = false;

export function getSupabaseAdminEnvStatus() {
  return {
    hasUrl: Boolean(process.env.SUPABASE_URL),
    hasServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
  };
}

function logSupabaseAdminEnvStatus() {
  if (hasLoggedAdminEnvStatus) return;
  hasLoggedAdminEnvStatus = true;
  const env = getSupabaseAdminEnvStatus();
  console.info('[supabase-admin-env]', env);
}

function assertAdminRuntime() {
  logSupabaseAdminEnvStatus();

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
      detectSessionInUrl: false,
    },
  });
}

export function getSupabaseAdminFingerprint() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  return {
    supabaseUrlHost: supabaseUrl ? new URL(supabaseUrl).host : null,
    serviceRoleKeyPrefix: serviceRoleKey ? serviceRoleKey.slice(0, 6) : null,
  };
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
