import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const CARD_ASSET_ROOT = path.join(
  process.cwd(),
  'public',
  'images',
  'illustrations',
  'product-cards'
);

const NOTICE_ONLY_ASSETS = [
  'section8-form3a-card-v1.webp',
  'rent-arrears-schedule-card-v1.webp',
  'n215-service-certificate-card-v1.webp',
  'service-instructions-card-v1.webp',
  'notice-validity-checklist-card-v1.webp',
  'compliance-declaration-card-v1.webp',
  'case-summary-card-v1.webp',
  'what-happens-next-card-v1.webp',
];

const COMPLETE_PACK_ASSETS = [
  'section8-form3a-card-v1.webp',
  'stage1-notice-service-file-card-v1.webp',
  'form-n5-possession-claim-card-v1.webp',
  'form-n119-particulars-card-v1.webp',
  'arrears-engagement-card-v1.webp',
  'witness-statement-card-v1.webp',
  'court-readiness-evidence-card-v1.webp',
  'court-bundle-filing-hearing-card-v1.webp',
];

function read(relativePath: string) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');
}

describe('product document-card artwork', () => {
  it('uses one purpose-built portrait asset for every Notice Only document', () => {
    const page = read('src/app/products/notice-only/page.tsx');

    expect(new Set(NOTICE_ONLY_ASSETS).size).toBe(NOTICE_ONLY_ASSETS.length);
    for (const asset of NOTICE_ONLY_ASSETS) {
      expect(page).toContain(`/images/illustrations/product-cards/${asset}`);
      expect(fs.existsSync(path.join(CARD_ASSET_ROOT, asset))).toBe(true);
    }
  });

  it('uses one purpose-built portrait asset for every Complete Pack document', () => {
    const page = read('src/app/products/complete-pack/page.tsx');

    expect(new Set(COMPLETE_PACK_ASSETS).size).toBe(COMPLETE_PACK_ASSETS.length);
    for (const asset of COMPLETE_PACK_ASSETS) {
      expect(page).toContain(`/images/illustrations/product-cards/${asset}`);
      expect(fs.existsSync(path.join(CARD_ASSET_ROOT, asset))).toBe(true);
    }
  });

  it('fills the media panel and uses landlord-facing card labels', () => {
    const component = read('src/components/marketing/PublicProductSalesPage.tsx');

    expect(component).toContain("sm:grid-cols-[minmax(0,1fr)_13rem]");
    expect(component).toContain('className="object-cover object-center"');
    expect(component).toContain('>Why it matters</dt>');
    expect(component).toContain('>What can go wrong</dt>');
    expect(component).toContain('>What it gives you</dt>');
  });
});
