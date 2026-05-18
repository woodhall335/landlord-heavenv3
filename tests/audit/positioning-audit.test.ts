import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { auditPositioning } from '../../scripts/positioning-audit';

const criticalRoutes = [
  'src/app/(marketing)/page.tsx',
  'src/app/(marketing)/pricing/page.tsx',
  'src/app/(marketing)/products/notice-only/page.tsx',
  'src/app/(marketing)/products/complete-pack/page.tsx',
  'src/app/(marketing)/products/money-claim/page.tsx',
  'src/app/section-21-notice-template/page.tsx',
  'src/app/eviction-notice-england/page.tsx',
  'src/app/tenancy-agreement/page.tsx',
  'src/app/money-claim/page.tsx',
];

describe('positioning audit critical routes', () => {
  it('has no forbidden positioning phrases on critical routes', () => {
    const absolute = criticalRoutes.map((route) => path.join(process.cwd(), route));
    const results = auditPositioning(absolute);
    const failing = results.filter((r) => r.status === 'FAIL');

    expect(failing, JSON.stringify(failing, null, 2)).toHaveLength(0);
  });

  it('treats the core revenue pages as commercially positioned', () => {
    const absolute = [
      'src/app/(marketing)/page.tsx',
      'src/app/(marketing)/pricing/page.tsx',
      'src/app/(marketing)/products/notice-only/page.tsx',
      'src/app/(marketing)/products/complete-pack/page.tsx',
      'src/app/(marketing)/products/money-claim/page.tsx',
      'src/app/(marketing)/products/rent-increase/page.tsx',
      'src/app/(marketing)/products/ast/page.tsx',
    ].map((route) => path.join(process.cwd(), route));

    const results = auditPositioning(absolute);
    const notPassing = results.filter((r) => r.status !== 'PASS');

    expect(notPassing, JSON.stringify(notPassing, null, 2)).toHaveLength(0);
  });

  it('excludes noindex redirect aliases from commercial positioning checks', () => {
    const absolute = [
      'src/app/(marketing)/products/money-claim-pack/page.tsx',
      'src/app/tenancy-agreement-template-free/page.tsx',
    ].map((route) => path.join(process.cwd(), route));

    expect(auditPositioning(absolute)).toHaveLength(0);
  });
});
