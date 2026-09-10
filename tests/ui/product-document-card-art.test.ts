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

const PANEL_ASSET_ROOT = path.join(
  process.cwd(),
  'public',
  'images',
  'illustrations',
  'product-panels'
);

const BANNER_ASSET_ROOT = path.join(
  process.cwd(),
  'public',
  'images',
  'illustrations',
  'product-banners',
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

  it('uses bespoke artwork and a tracked conversion panel for both eviction products', () => {
    const component = read('src/components/marketing/PublicProductSalesPage.tsx');
    const noticePage = read('src/app/products/notice-only/page.tsx');
    const completePage = read('src/app/products/complete-pack/page.tsx');
    const assets = [
      'notice-only-document-v1.webp',
      'complete-pack-court-papers-v1.webp',
    ];

    expect(component).toContain('function ProductConversionPanel');
    expect(component).toContain('ctaPosition="decision_panel"');
    expect(component).toContain("data-product-decision-details");
    expect(noticePage).toContain(`/images/illustrations/product-panels/${assets[0]}`);
    expect(completePage).toContain(`/images/illustrations/product-panels/${assets[1]}`);
    for (const asset of assets) {
      expect(fs.existsSync(path.join(PANEL_ASSET_ROOT, asset))).toBe(true);
    }
  });

  it('uses Lucide icons and bespoke commercial artwork across the requested conversion sections', () => {
    const component = read('src/components/marketing/PublicProductSalesPage.tsx');
    const noticePage = read('src/app/products/notice-only/page.tsx');
    const completePage = read('src/app/products/complete-pack/page.tsx');
    const moneyPage = read('src/app/products/money-claim/page.tsx');
    const rentIncreasePage = read('src/app/rent-increase/page.tsx');
    const assets = [
      'money-claim-panel-v1.webp',
      'notice-only-conversion-v1.webp',
      'complete-pack-conversion-v1.webp',
      'rent-increase-conversion-v1.webp',
    ];

    expect(component).toContain("from 'lucide-react'");
    expect(component).not.toContain("from 'react-icons/ri'");
    expect(component).toContain('data-visual-cta');
    expect(component).toContain('max-w-6xl divide-y');
    expect(noticePage).toContain('alignImageToSteps: true');
    expect(completePage).toContain('alignImageToSteps: true');
    expect(completePage).not.toContain('objectionBlock:');
    expect(moneyPage).toContain(`/images/illustrations/product-banners/${assets[0]}`);
    expect(noticePage).toContain(`/images/illustrations/product-banners/${assets[1]}`);
    expect(completePage).toContain(`/images/illustrations/product-banners/${assets[2]}`);
    expect(rentIncreasePage).toContain(`/images/illustrations/product-banners/${assets[3]}`);
    for (const asset of assets) {
      expect(fs.existsSync(path.join(BANNER_ASSET_ROOT, asset))).toBe(true);
    }
  });
});
