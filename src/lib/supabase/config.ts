export type SupabaseServerConfig = {
  url: string;
  anonKey: string;
  serviceRoleKey?: string;
};

export type SupabaseBrowserConfig = {
  url: string;
  anonKey: string;
};

declare global {
  // eslint-disable-next-line no-var
  var __supabaseWarned: boolean | undefined;
}

const warnMessage = 'Supabase not configured, continuing in anonymous mode';

export function warnSupabaseNotConfiguredOnce(message = warnMessage) {
  if (!globalThis.__supabaseWarned) {
    globalThis.__supabaseWarned = true;
    console.warn(message);
  }
}

export function isSupabaseConfiguredServer() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);
}

export function isSupabaseConfiguredBrowser() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function getSupabaseConfigServer(): SupabaseServerConfig | null {
  if (!isSupabaseConfiguredServer()) return null;

  return {
    url: process.env.SUPABASE_URL!,
    anonKey: process.env.SUPABASE_ANON_KEY!,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  } satisfies SupabaseServerConfig;
}

export function getSupabaseConfigBrowser(): SupabaseBrowserConfig | null {
  if (!isSupabaseConfiguredBrowser()) return null;

  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  } satisfies SupabaseBrowserConfig;
}
