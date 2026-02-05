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
  ok: boolean;
  ref?: string;
  role?: string;
  iat?: number;
  exp?: number;
  error?: string;
};

export function getSupabaseAdminEnvStatus() {
  return {
    hasUrl: Boolean(process.env.SUPABASE_URL),
    hasServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
  };
}

function shouldLogAdminDebug(): boolean {
  return process.env.NODE_ENV !== 'production' || process.env.ASK_HEAVEN_DEBUG === '1';
}

export function getSupabaseAdminJwtPreview(): JwtPayloadPreview {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    return { ok: false, error: 'missing_service_role_key' };
  }
  return decodeJwtPayloadSafe(serviceRoleKey);
}

function logSupabaseAdminEnvStatus() {
  if (!shouldLogAdminDebug()) return;
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

function decodeJwtPayloadSafe(token: string): JwtPayloadPreview {
  try {
    const [, payload] = token.split('.');
    if (!payload) return { ok: false, error: 'jwt_preview_failed' };

    const decoded = Buffer.from(payload, 'base64url').toString('utf-8');
    const parsed = JSON.parse(decoded) as JwtPayloadPreview;
    return {
      ok: true,
      ref: parsed.ref,
      role: parsed.role,
      iat: parsed.iat,
      exp: parsed.exp,
    };
  } catch {
    return { ok: false, error: 'jwt_preview_failed' };
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
  let supabaseUrlHost = 'unknown';
  try {
    supabaseUrlHost = new URL(supabaseUrl).host;
  } catch {
    supabaseUrlHost = 'unknown';
  }
  const keyPrefix = serviceRoleKey.slice(0, 8);
  const jwtPayload = decodeJwtPayloadSafe(serviceRoleKey);
  if (shouldLogAdminDebug()) {
    console.info(
      `[supabase-admin-client] host=${supabaseUrlHost} role=${jwtPayload?.role ?? 'unknown'} ref=${jwtPayload?.ref ?? 'unknown'} keyPrefix=${keyPrefix}`
    );
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
    },
    db: {
      schema: 'public',
    },
  });
}

export function getSupabaseAdminFingerprint() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  let supabaseUrlHost: string | null = null;

  if (supabaseUrl) {
    try {
      supabaseUrlHost = new URL(supabaseUrl).host;
    } catch {
      supabaseUrlHost = null;
    }
  }

  return {
    supabaseUrlHost,
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
