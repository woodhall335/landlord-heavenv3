import fs from 'node:fs';
import path from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getSupabaseConfigBrowser,
  getSupabaseConfigServer,
  isSupabaseConfiguredBrowser,
  isSupabaseConfiguredServer,
  resetSupabaseWarningState,
  warnSupabaseNotConfiguredOnce,
} from '@/lib/supabase/config';

const originalEnv = { ...process.env };

describe('supabase config', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    resetSupabaseWarningState();
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

  it('detects browser configuration when env vars are present', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://browser.example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'browser-anon-key';

    expect(isSupabaseConfiguredBrowser()).toBe(true);
    expect(getSupabaseConfigBrowser()).toEqual({
      url: 'https://browser.example.supabase.co',
      anonKey: 'browser-anon-key',
    });
  });

  it('warns only once when Supabase is not configured', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    warnSupabaseNotConfiguredOnce();
    warnSupabaseNotConfiguredOnce();

    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  it('references the Supabase schema file', () => {
    const schemaPath = path.join(process.cwd(), 'docs', 'supabase_schema.MD');
    expect(fs.existsSync(schemaPath)).toBe(true);

    const typesFile = fs.readFileSync(
      path.join(process.cwd(), 'src', 'lib', 'supabase', 'database-types.ts'),
      'utf8'
    );

    expect(typesFile).toContain('supabase_schema.MD');
  });
});
