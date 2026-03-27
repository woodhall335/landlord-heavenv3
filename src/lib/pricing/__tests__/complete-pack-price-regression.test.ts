import fs from 'node:fs';
import path from 'node:path';

import { PRICING, REGIONAL_PRICING } from '@/lib/pricing';
import { getWizardCta } from '@/lib/checkout/cta-mapper';
import { PRODUCTS, SEO_PRICES, type ProductSku } from '@/lib/pricing/products';

const REPO_ROOT = process.cwd();
const SCAN_ROOTS = ['src/app', 'src/components', 'src/lib/seo', 'src/lib/blog', 'src/data/faqs'];
const TEXT_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mdx']);

const CORE_PRICE_EXPECTATIONS: Record<
  Extract<ProductSku, 'notice_only' | 'complete_pack' | 'money_claim' | 'ast_standard' | 'ast_premium'>,
  { amount: number; display: string; pence: number }
> = {
  notice_only: { amount: 29.99, display: '£29.99', pence: 2999 },
  complete_pack: { amount: 49.99, display: '£49.99', pence: 4999 },
  money_claim: { amount: 29.99, display: '£29.99', pence: 2999 },
  ast_standard: { amount: 14.99, display: '£14.99', pence: 1499 },
  ast_premium: { amount: 24.99, display: '£24.99', pence: 2499 },
};

function walkFiles(dirPath: string, out: string[] = []): string[] {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      walkFiles(fullPath, out);
      continue;
    }
    if (TEXT_EXTENSIONS.has(path.extname(entry.name))) {
      out.push(fullPath);
    }
  }
  return out;
}

describe('Pricing regression checks', () => {
  it('keeps central core product pricing aligned', () => {
    expect(SEO_PRICES.evictionNotice.amount).toBe(CORE_PRICE_EXPECTATIONS.notice_only.amount);
    expect(SEO_PRICES.evictionNotice.display).toBe(CORE_PRICE_EXPECTATIONS.notice_only.display);

    expect(SEO_PRICES.evictionBundle.amount).toBe(CORE_PRICE_EXPECTATIONS.complete_pack.amount);
    expect(SEO_PRICES.evictionBundle.display).toBe(CORE_PRICE_EXPECTATIONS.complete_pack.display);

    expect(SEO_PRICES.moneyClaim.amount).toBe(CORE_PRICE_EXPECTATIONS.money_claim.amount);
    expect(SEO_PRICES.moneyClaim.display).toBe(CORE_PRICE_EXPECTATIONS.money_claim.display);

    expect(SEO_PRICES.tenancyStandard.amount).toBe(CORE_PRICE_EXPECTATIONS.ast_standard.amount);
    expect(SEO_PRICES.tenancyStandard.display).toBe(CORE_PRICE_EXPECTATIONS.ast_standard.display);

    expect(SEO_PRICES.tenancyPremium.amount).toBe(CORE_PRICE_EXPECTATIONS.ast_premium.amount);
    expect(SEO_PRICES.tenancyPremium.display).toBe(CORE_PRICE_EXPECTATIONS.ast_premium.display);

    expect(PRODUCTS.notice_only.price).toBe(CORE_PRICE_EXPECTATIONS.notice_only.amount);
    expect(PRODUCTS.complete_pack.price).toBe(CORE_PRICE_EXPECTATIONS.complete_pack.amount);
    expect(PRODUCTS.money_claim.price).toBe(CORE_PRICE_EXPECTATIONS.money_claim.amount);
    expect(PRODUCTS.sc_money_claim.displayPrice).toBe(CORE_PRICE_EXPECTATIONS.money_claim.display);
    expect(PRODUCTS.ast_standard.price).toBe(CORE_PRICE_EXPECTATIONS.ast_standard.amount);
    expect(PRODUCTS.ast_premium.price).toBe(CORE_PRICE_EXPECTATIONS.ast_premium.amount);

    expect(PRICING.COMPLETE_EVICTION_PACK).toBe(CORE_PRICE_EXPECTATIONS.complete_pack.amount);
    expect(REGIONAL_PRICING.complete_pack.england).toBe(CORE_PRICE_EXPECTATIONS.complete_pack.amount);
  });

  it('uses configured product prices for mapped CTA output', () => {
    const result = getWizardCta({
      caseId: '123e4567-e89b-12d3-a456-426614174000',
      source: 'validator',
      validator_key: 'section_21',
      validation_summary: { status: 'invalid' },
    });

    expect(result.primary.productKey).toBe('complete_pack');
    expect(result.primary.price).toBe(PRODUCTS.complete_pack.price);
  });

  it('converts core product prices to expected Stripe pence amounts', () => {
    const skus = Object.keys(CORE_PRICE_EXPECTATIONS) as Array<keyof typeof CORE_PRICE_EXPECTATIONS>;

    for (const sku of skus) {
      expect(Math.round(PRODUCTS[sku].price * 100)).toBe(CORE_PRICE_EXPECTATIONS[sku].pence);
    }
  });

  it('has no stale pricing copy on user-facing paths', () => {
    const staleHits: string[] = [];
    const staleRules: Array<{ label: string; pattern: RegExp }> = [
      { label: 'Notice Only £19.99', pattern: /(Section\s*21|Section\s*8|Notice(?:\s+Only)?|Eviction Notice)[^\n£]{0,120}£19\.99/i },
      { label: 'Complete Pack £79.99', pattern: /Complete(?: Eviction)? Pack[^\n£]{0,120}£79\.99/i },
      { label: 'Money Claim £59.99', pattern: /Money Claim(?:s)?[^\n£]{0,120}£59\.99/i },
      { label: 'Standard tenancy £9.99', pattern: /Standard\s+(?:AST|PRT|Contract)[^\n£]{0,120}£9\.99/i },
      { label: 'Premium tenancy £19.99', pattern: /Premium\s+(?:AST|PRT|Contract)[^\n£]{0,120}£19\.99/i },
    ];

    for (const relativeRoot of SCAN_ROOTS) {
      const absoluteRoot = path.join(REPO_ROOT, relativeRoot);
      if (!fs.existsSync(absoluteRoot)) continue;

      const files = walkFiles(absoluteRoot);
      for (const filePath of files) {
        const normalized = filePath.replace(/\\/g, '/');
        if (normalized.includes('/__tests__/')) continue;
        if (normalized.includes('/api/')) continue;

        const content = fs.readFileSync(filePath, 'utf8');
        for (const rule of staleRules) {
          if (rule.pattern.test(content)) {
            staleHits.push(`${path.relative(REPO_ROOT, filePath)} :: ${rule.label}`);
          }
        }
      }
    }

    expect(staleHits).toEqual([]);
  });
});


