import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import sitemap from '@/app/sitemap';

const ORIGINAL_SUPABASE_URL = process.env.SUPABASE_URL;
const ORIGINAL_SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function toPathSet(entries: Awaited<ReturnType<typeof sitemap>>): Set<string> {
  return new Set(entries.map((entry) => new URL(entry.url).pathname));
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

  it('keeps retired, private, asset, and non-public regional URLs out', async () => {
    const paths = toPathSet(await sitemap());

    expect(paths).not.toContain('/products/rent-tracker');
    expect(paths).not.toContain('/section-21-court-pack');
    expect(paths).not.toContain('/dashboard');
    expect(paths).not.toContain('/wizard');
    expect(paths).not.toContain('/official-forms/n325-eng.pdf');
    expect(paths).not.toContain('/favicon.ico');
    expect(paths).not.toContain('/blog/rent-smart-wales');
    expect(paths).not.toContain('/tenancy-agreements/wales');
    expect(paths).not.toContain('/tenancy-agreements/scotland');
  });
});
