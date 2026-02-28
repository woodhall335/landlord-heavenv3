import fs from 'node:fs';
import path from 'node:path';

import { PRICING, REGIONAL_PRICING } from '@/lib/pricing';
import { getWizardCta } from '@/lib/checkout/cta-mapper';
import { PRODUCTS, SEO_PRICES } from '@/lib/pricing/products';

const REPO_ROOT = process.cwd();
const SCAN_ROOTS = ['src/app', 'src/components', 'src/lib/seo', 'src/data/faqs'];
const TEXT_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mdx']);

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

describe('Complete Pack temporary price regression checks', () => {
  it('keeps all central complete_pack price sources aligned at 59.99', () => {
    expect(SEO_PRICES.evictionBundle.amount).toBe(59.99);
    expect(SEO_PRICES.evictionBundle.display).toBe('£59.99');
    expect(PRODUCTS.complete_pack.price).toBe(SEO_PRICES.evictionBundle.amount);
    expect(PRODUCTS.complete_pack.displayPrice).toBe(SEO_PRICES.evictionBundle.display);
    expect(PRICING.COMPLETE_EVICTION_PACK).toBe(SEO_PRICES.evictionBundle.amount);
    expect(REGIONAL_PRICING.complete_pack.england).toBe(SEO_PRICES.evictionBundle.amount);
  });

  it('uses the configured product price for complete_pack CTA output', () => {
    const result = getWizardCta({
      caseId: '123e4567-e89b-12d3-a456-426614174000',
      source: 'validator',
      validator_key: 'section_21',
      validation_summary: { status: 'invalid' },
    });

    expect(result.primary.productKey).toBe('complete_pack');
    expect(result.primary.price).toBe(PRODUCTS.complete_pack.price);
  });

  it('has no stale £199.99 copy in user-facing app/seo text sources', () => {
    const staleHits: string[] = [];

    for (const relativeRoot of SCAN_ROOTS) {
      const absoluteRoot = path.join(REPO_ROOT, relativeRoot);
      if (!fs.existsSync(absoluteRoot)) continue;
      const files = walkFiles(absoluteRoot);
      for (const filePath of files) {
        const content = fs.readFileSync(filePath, 'utf8');
        if (content.includes('£199.99')) {
          staleHits.push(path.relative(REPO_ROOT, filePath));
        }
      }
    }

    expect(staleHits).toEqual([]);
  });
});
