import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

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

  it('rejects stale hardcoded core-product prices in app/lib surfaces', () => {
    const roots = ['src/app', 'src/lib', 'src/components'];
    const allowExt = new Set(['.ts', '.tsx']);
    const violations: string[] = [];
    const staleRules: Array<{ label: string; pattern: RegExp }> = [
      { label: 'Notice Only £19.99', pattern: /(Section\\s*21|Section\\s*8|Notice(?:\\s+Only)?|Eviction Notice)[^\\n£]{0,120}£19\\.99/i },
      { label: 'Complete Pack £49.99', pattern: /Complete(?: Eviction)? Pack[^\\n£]{0,120}£49\\.99/i },
      { label: 'Money Claim £34.99', pattern: /Money Claim(?:s)?[^\\n£]{0,120}£34\\.99/i },
      { label: 'Standard tenancy £9.99', pattern: /Standard\\s+(?:AST|PRT|Contract)[^\\n£]{0,120}£9\\.99/i },
      { label: 'Premium tenancy £19.99', pattern: /Premium\\s+(?:AST|PRT|Contract)[^\\n£]{0,120}£19\\.99/i },
    ];

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
        for (const rule of staleRules) {
          if (rule.pattern.test(text)) violations.push(`${full}: ${rule.label}`);
        }
      }
    };

    roots.forEach(walk);
    expect(violations).toEqual([]);
  });
});
