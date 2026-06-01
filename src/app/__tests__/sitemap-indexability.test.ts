import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import sitemap from '@/app/sitemap';

const ORIGINAL_SUPABASE_URL = process.env.SUPABASE_URL;
const ORIGINAL_SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function toPathSet(entries: Awaited<ReturnType<typeof sitemap>>): Set<string> {
  return new Set(entries.map((entry) => new URL(entry.url).pathname));
}

function entryByPath(entries: Awaited<ReturnType<typeof sitemap>>, path: string) {
  return entries.find((entry) => new URL(entry.url).pathname === path);
}

describe('sitemap indexability regression', () => {
  beforeEach(() => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  afterEach(() => {
    if (ORIGINAL_SUPABASE_URL === undefined) {
      delete process.env.SUPABASE_URL;
    } else {
      process.env.SUPABASE_URL = ORIGINAL_SUPABASE_URL;
    }

    if (ORIGINAL_SUPABASE_SERVICE_ROLE_KEY === undefined) {
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    } else {
      process.env.SUPABASE_SERVICE_ROLE_KEY = ORIGINAL_SUPABASE_SERVICE_ROLE_KEY;
    }
  });

  it('keeps important commercial SEO pages submitted', async () => {
    const paths = toPathSet(await sitemap());

    [
      '/products/notice-only',
      '/products/complete-pack',
      '/products/money-claim',
      '/products/ast',
      '/products/section-13-standard',
      '/products/section-13-defence',
      '/pricing',
      '/samples',
      '/how-to-evict-tenant',
      '/how-to-sue-tenant-for-unpaid-rent',
      '/money-claim-n1-claim-form',
      '/money-claim-online-mcol',
      '/n5-n119-possession-claim',
      '/form-3-section-8',
      '/rent-increase',
      '/rent-increase/form-4a-guide',
      '/rent-increase/section-13-notice',
    ].forEach((path) => {
      expect(paths).toContain(path);
    });
  });

  it('uses the SEO rescue release date for product and high-intent bridge pages', async () => {
    const entries = await sitemap();

    [
      '/products/notice-only',
      '/products/complete-pack',
      '/form-3-section-8',
      '/n5-n119-possession-claim',
      '/section-8-notice-template',
      '/how-to-rent-guide',
      '/rent-increase/form-4a-guide',
    ].forEach((path) => {
      expect(entryByPath(entries, path)?.lastModified?.toISOString().slice(0, 10)).toBe('2026-06-01');
    });
  });

  it('keeps retired, private, asset, and non-editorial regional URLs out', async () => {
    const paths = toPathSet(await sitemap());

    expect(paths).not.toContain('/products/rent-tracker');
    expect(paths).not.toContain('/section-21-court-pack');
    expect(paths).not.toContain('/dashboard');
    expect(paths).not.toContain('/wizard');
    expect(paths).not.toContain('/official-forms/n325-eng.pdf');
    expect(paths).not.toContain('/favicon.ico');
    expect(paths).not.toContain('/blog/rent-smart-wales');
    expect(paths).not.toContain('/blog/wales');
    expect(paths).not.toContain('/blog/scotland');
    expect(paths).not.toContain('/blog/northern-ireland');
    expect(paths).not.toContain('/common-prt-tenancy-mistakes-scotland');
    expect(paths).not.toContain('/tenancy-agreements/wales');
    expect(paths).not.toContain('/tenancy-agreements/scotland');
  });
});
