import 'server-only';

import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

type SupabaseAdminDiagnostics = {
  route: string;
  writesUsingAdmin: boolean;
};

let hasLoggedAdminEnvStatus = false;
let hasWrappedFetch = false;

type JwtPayloadPreview = {
  ref?: string;
  role?: string;
  iat?: number;
  exp?: number;
};

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

function decodeJwtPayload(token: string): JwtPayloadPreview | null {
  const [, payload] = token.split('.');
  if (!payload) return null;

  try {
    const decoded = Buffer.from(payload, 'base64url').toString('utf-8');
    const parsed = JSON.parse(decoded) as JwtPayloadPreview;
    return {
      ref: parsed.ref,
      role: parsed.role,
      iat: parsed.iat,
      exp: parsed.exp,
    };
  } catch {
    return null;
  }
}

function ensureNoStoreFetch() {
  if (hasWrappedFetch) return;
  if (typeof globalThis.fetch !== 'function') return;
  const originalFetch = globalThis.fetch.bind(globalThis);
  globalThis.fetch = (input, init) =>
    originalFetch(input, { ...init, cache: 'no-store' });
  hasWrappedFetch = true;
}

export function createSupabaseAdminClient(): SupabaseClient<Database> {
  assertAdminRuntime();
  ensureNoStoreFetch();

  const supabaseUrl = process.env.SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabaseUrlHost = new URL(supabaseUrl).host;
  const keyPrefix = serviceRoleKey.slice(0, 8);
  const jwtPayload = decodeJwtPayload(serviceRoleKey);
  console.info('[supabase-admin-client]', {
    host: supabaseUrlHost,
    keyPrefix,
    jwt_ref: jwtPayload?.ref ?? null,
    jwt_role: jwtPayload?.role ?? null,
    jwt_iat: jwtPayload?.iat ?? null,
    jwt_exp: jwtPayload?.exp ?? null,
  });

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
    db: {
      schema: 'public',
    },
  });
}

export function getSupabaseAdminFingerprint() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  return {
    supabaseUrlHost: supabaseUrl ? new URL(supabaseUrl).host : null,
    serviceRoleKeyPrefix: serviceRoleKey ? serviceRoleKey.slice(0, 8) : null,
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
