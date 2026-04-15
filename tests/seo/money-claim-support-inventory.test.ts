import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const APP_DIR = join(process.cwd(), 'src/app');

const supportPageDirs = readdirSync(APP_DIR, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .filter((name) => name.startsWith('money-claim-'));

const supportHrefPattern = /href:\s*['"]\/money-claim['"]|href=['"]\/money-claim['"]/;
const productHrefPattern = /href:\s*['"]\/products\/money-claim(?:[^'"]*)['"]|href=['"]\/products\/money-claim(?:[^'"]*)['"]/;

describe('money claim support inventory', () => {
  it('keeps the support estate linking back to the support guide and the product owner where appropriate', () => {
    for (const dir of supportPageDirs) {
      const content = readFileSync(join(APP_DIR, dir, 'page.tsx'), 'utf8');
      const supportHref = content.search(supportHrefPattern);
      const productHref = content.search(productHrefPattern);

      expect(productHref, `${dir} should include /products/money-claim`).toBeGreaterThan(-1);
      expect(supportHref, `${dir} should keep a support link back to /money-claim`).toBeGreaterThan(-1);
    }
  });
});
