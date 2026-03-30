import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const readPage = (pathname: string) =>
  readFileSync(join(process.cwd(), pathname), 'utf8');

describe('money claim support pages', () => {
  it('keeps unpaid rent strong but routes broad users back to the owner page first', () => {
    const content = readPage('src/app/money-claim-unpaid-rent/page.tsx');

    expect(content).toContain("href: '/money-claim'");
    expect(content).toContain("href: '/tools/rent-arrears-calculator'");
    expect(content).toContain("href: moneyClaimProductLink");
  });

  it('keeps MCOL as a support explainer that points first to the broad owner, then N1', () => {
    const content = readPage('src/app/money-claim-online-mcol/page.tsx');

    expect(content).toContain("href: '/money-claim'");
    expect(content).toContain("href: '/money-claim-n1-claim-form'");
    expect(content).toContain("href: '/products/money-claim'");
  });

  it('keeps the core evidence/process pages owner-first and support-specific', () => {
    const cases = [
      ['src/app/money-claim-letter-before-action/page.tsx', "/money-claim-schedule-of-debt"],
      ['src/app/money-claim-schedule-of-debt/page.tsx', "/money-claim-letter-before-action"],
      ['src/app/money-claim-n1-claim-form/page.tsx', "/money-claim-online-mcol"],
      ['src/app/money-claim-ccj-enforcement/page.tsx', "/money-claim-online-mcol"],
    ] as const;

    for (const [pathname, supportHref] of cases) {
      const content = readPage(pathname);

      expect(content).toContain("href: '/money-claim'");
      expect(content).toContain(`href: '${supportHref}'`);
      expect(content).toContain('/products/money-claim');
    }
  });
});
