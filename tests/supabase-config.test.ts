import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getSupabaseConfigServer,
  isSupabaseConfiguredServer,
  warnSupabaseNotConfiguredOnce,
} from '@/lib/supabase/config';

const originalEnv = process.env;

describe('supabase config', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    (globalThis as any).__supabaseWarned = undefined;
    process.env = { ...originalEnv };
  });

  it('detects server configuration when env vars are present', () => {
    process.env.SUPABASE_URL = 'https://example.supabase.co';
    process.env.SUPABASE_ANON_KEY = 'anon-key';

    expect(isSupabaseConfiguredServer()).toBe(true);
    expect(getSupabaseConfigServer()).toEqual({
      url: 'https://example.supabase.co',
      anonKey: 'anon-key',
      serviceRoleKey: originalEnv.SUPABASE_SERVICE_ROLE_KEY,
    });
  });

  it('warns only once when Supabase is not configured', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    warnSupabaseNotConfiguredOnce();
    warnSupabaseNotConfiguredOnce();

    expect(warnSpy).toHaveBeenCalledTimes(1);
  });
});
