export type SupabaseServerConfig = {
  url: string;
  anonKey: string;
  serviceRoleKey?: string;
};

export type SupabaseBrowserConfig = {
  url: string;
  anonKey: string;
};

type SupabaseWarnState = {
  warned: boolean;
};

const warnMessage = 'Supabase not configured, continuing in anonymous mode';

declare global {
  var __supabaseWarnState: SupabaseWarnState | undefined;
}

function getWarnState(): SupabaseWarnState {
  if (!globalThis.__supabaseWarnState) {
    globalThis.__supabaseWarnState = { warned: false };
  }
  return globalThis.__supabaseWarnState;
}

export function warnSupabaseNotConfiguredOnce(message = warnMessage) {
  const warnState = getWarnState();
  if (warnState.warned) return;

  warnState.warned = true;
  console.warn(message);
}

export function getSupabaseConfigServer(): SupabaseServerConfig | null {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;

  if (!url || !anonKey) return null;

  return {
    url,
    anonKey,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  } satisfies SupabaseServerConfig;
}

export function getSupabaseConfigBrowser(): SupabaseBrowserConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) return null;

  return {
    url,
    anonKey,
  } satisfies SupabaseBrowserConfig;
}

export function isSupabaseConfiguredServer() {
  return Boolean(getSupabaseConfigServer());
}

export function isSupabaseConfiguredBrowser() {
  return Boolean(getSupabaseConfigBrowser());
}

export function getSupabaseConfigForServerRuntime() {
  return getSupabaseConfigServer();
}

export function getSupabaseConfigForBrowserRuntime() {
  return getSupabaseConfigBrowser();
}

export function resetSupabaseWarningState() {
  // Primarily for tests
  globalThis.__supabaseWarnState = { warned: false };
}
