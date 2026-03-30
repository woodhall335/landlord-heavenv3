import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const APP_DIR = join(process.cwd(), 'src/app');

const supportPageDirs = readdirSync(APP_DIR, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .filter((name) => name.startsWith('money-claim-'));

const ownerHrefPattern = /href:\s*['"]\/money-claim['"]|href=['"]\/money-claim['"]/;
const productHrefPattern = /href:\s*['"]\/products\/money-claim(?:[^'"]*)['"]|href=['"]\/products\/money-claim(?:[^'"]*)['"]/;

describe('money claim support inventory', () => {
  it('keeps the support estate owner-first before the product path in the opening CTA layer', () => {
    for (const dir of supportPageDirs) {
      const content = readFileSync(join(APP_DIR, dir, 'page.tsx'), 'utf8');
      const firstOwnerHref = content.search(ownerHrefPattern);
      const firstProductHref = content.search(productHrefPattern);

      expect(firstOwnerHref, `${dir} should include an owner link in the opening CTA layer`).toBeGreaterThan(-1);

      if (firstProductHref > -1) {
        expect(
          firstOwnerHref,
          `${dir} should place /money-claim before /products/money-claim in the opening CTA layer`
        ).toBeLessThan(firstProductHref);
      }
    }
  });
});
