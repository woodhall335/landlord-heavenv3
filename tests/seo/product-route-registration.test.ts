import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const PRODUCT_ROUTES = [
  'ast',
  'complete-pack',
  'money-claim',
  'money-claim-pack',
  'notice-only',
  'rent-increase',
  'section-13-defence',
  'section-13-standard',
] as const;

describe('public product route registration', () => {
  it.each(PRODUCT_ROUTES)('registers /products/%s in the root app segment', (slug) => {
    const route = path.join(process.cwd(), 'src', 'app', 'products', slug, 'page.tsx');
    const brokenGroupedRoute = path.join(
      process.cwd(),
      'src',
      'app',
      '(marketing)',
      'products',
      slug,
      'page.tsx',
    );

    expect(fs.existsSync(route)).toBe(true);
    expect(fs.existsSync(brokenGroupedRoute)).toBe(false);
  });
});
