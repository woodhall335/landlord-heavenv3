import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Pricing propagation regressions', () => {
  it('/pricing page uses canonical PRODUCTS prices and contains current values', () => {
    const pagePath = path.join(process.cwd(), 'src/app/(marketing)/pricing/page.tsx');
    const pricingModulePath = path.join(process.cwd(), 'src/lib/marketing/pricing-page.ts');
    const pageContent = fs.readFileSync(pagePath, 'utf-8');
    const pricingModuleContent = fs.readFileSync(pricingModulePath, 'utf-8');

    expect(pageContent).toContain('PRICING_PACKAGE_CARDS');
    expect(pageContent).toContain('PRICING_SCHEMA_ITEMS');
    expect(pricingModuleContent).toContain('PRODUCTS.notice_only.displayPrice');
    expect(pricingModuleContent).toContain('PRODUCTS.complete_pack.displayPrice');
    expect(pricingModuleContent).toContain('PRODUCTS.money_claim.displayPrice');
    expect(pricingModuleContent).toContain('PRODUCTS.section13_standard.displayPrice');
    expect(pricingModuleContent).toContain('PRODUCTS.section13_defensive.displayPrice');
    expect(pricingModuleContent).toContain('PRODUCTS.england_standard_tenancy_agreement.displayPrice');
    expect(pricingModuleContent).toContain('PRODUCTS.england_premium_tenancy_agreement.displayPrice');
    expect(pricingModuleContent).toContain('PRODUCTS.england_student_tenancy_agreement.displayPrice');
    expect(pricingModuleContent).toContain('PRODUCTS.england_hmo_shared_house_tenancy_agreement.displayPrice');
    expect(pricingModuleContent).toContain('PRODUCTS.england_lodger_agreement.displayPrice');
  });

  it('rejects stale hardcoded core-product prices in app/lib surfaces', () => {
    const roots = ['src/app', 'src/lib', 'src/components'];
    const allowExt = new Set(['.ts', '.tsx']);
    const violations: string[] = [];
    const staleRules: Array<{ label: string; pattern: RegExp }> = [
      { label: 'Notice Only £19.99', pattern: /(Section\\s*21|Section\\s*8|Notice(?:\\s+Only)?|Eviction Notice)[^\\n£]{0,120}£19\\.99/i },
      { label: 'Notice Only £49.99', pattern: /(Section\\s*21|Section\\s*8|Notice(?:\\s+Only)?|Eviction Notice)[^\\n£]{0,120}£49\\.99/i },
      { label: 'Complete Pack £49.99', pattern: /Complete(?: Eviction)? Pack[^\\n£]{0,120}£49\\.99/i },
      { label: 'Complete Pack £79.99', pattern: /Complete(?: Eviction)? Pack[^\\n£]{0,120}£79\\.99/i },
      { label: 'Complete Pack £59.99', pattern: /Complete(?: Eviction)? Pack[^\\n£]{0,120}£59\\.99/i },
      { label: 'Complete Pack £99.99', pattern: /Complete(?: Eviction)? Pack[^\\n£]{0,120}£99\\.99/i },
      { label: 'Money Claim £49.99', pattern: /Money Claim(?:s)?[^\\n£]{0,120}£49\\.99/i },
      { label: 'Money Claim £59.99', pattern: /Money Claim(?:s)?[^\\n£]{0,120}£59\\.99/i },
      { label: 'Standard Section 13 £29.99', pattern: /(?:Standard\\s+)?Section 13(?: Rent Increase)?(?: Pack)?[^\\n£]{0,120}£29\\.99/i },
      { label: 'Section 13 Defence £49.99', pattern: /Section 13 Defence(?: Pack)?[^\\n£]{0,120}£49\\.99/i },
      { label: 'Section 13 Standard £17.99', pattern: /(?:Standard\\s+)?Section 13(?: Rent Increase)?(?: Pack)?[^\\n£]{0,120}£17\\.99/i },
      { label: 'Section 13 Defence £27.99', pattern: /(?:Section 13 Defence|Challenge-Ready|Tribunal-Ready)[^\\n£]{0,120}£27\\.99/i },
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


