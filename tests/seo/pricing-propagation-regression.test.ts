import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { PRODUCTS } from '@/lib/pricing/products';

describe('Pricing propagation regressions', () => {
  it('/pricing page uses canonical PRODUCTS prices and contains current values', () => {
    const filePath = path.join(process.cwd(), 'src/app/(marketing)/pricing/page.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('PRODUCTS.notice_only.displayPrice');
    expect(content).toContain('PRODUCTS.complete_pack.displayPrice');
    expect(content).toContain('PRODUCTS.money_claim.displayPrice');
    expect(content).toContain('PRODUCTS.ast_standard.displayPrice');
    expect(content).toContain('PRODUCTS.ast_premium.displayPrice');

  });

  it('rejects stale hardcoded product prices in app/lib surfaces', () => {
    const banned = ['£29.99', '£69.99', '£45.99', '£39.99', '£99.99', '£199.99', '£14.99', '£24.99'];
    const roots = ['src/app', 'src/lib', 'src/components'];
    const allowExt = new Set(['.ts', '.tsx']);
    const violations: string[] = [];

    const walk = (dir: string) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (entry.name === '__tests__') continue;
          walk(full);
          continue;
        }
        if (!allowExt.has(path.extname(entry.name))) continue;
        const text = fs.readFileSync(full, 'utf-8');
        for (const token of banned) {
          if (text.includes(token)) violations.push(`${full}: ${token}`);
        }
      }
    };

    roots.forEach(walk);
    expect(violations).toEqual([]);
  });
});
