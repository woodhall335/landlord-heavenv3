import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { discoverStaticPageRoutes, resolveAppDir } from '@/lib/seo/static-route-inventory.shared.mjs';

describe('static route inventory', () => {
  it('returns an empty list when no app dir exists', async () => {
    const missingAppDir = path.join(process.cwd(), '.tmp', 'missing-app-dir-for-sitemap-test');

    await expect(discoverStaticPageRoutes(missingAppDir)).resolves.toEqual([]);
  });

  it('returns null when explicit app dir does not exist', () => {
    const missingAppDir = path.join(process.cwd(), '.tmp', 'missing-app-dir-for-sitemap-test');

    expect(resolveAppDir(missingAppDir)).toBeNull();
  });
});
