import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';

const ROOT = process.cwd();
const read = (relativePath: string) => readFileSync(join(ROOT, relativePath), 'utf8');

const TRANSPARENT_ASSETS = [
  ['tenancy-standard/proportionate-standard-agreement-v1.webp', 1200, 500],
  ['tenancy-standard/guided-standard-setup-v1.webp', 1200, 500],
  ['tenancy-standard/standard-agreement-selector-v1.webp', 1200, 500],
  ['tenancy-standard/standard-how-it-works-v1.webp', 1200, 900],
  ['tenancy-jurisdictions/wales-occupation-contract-pack-v1.webp', 1200, 800],
  ['tenancy-jurisdictions/scotland-prt-pack-v1.webp', 1200, 800],
  ['tenancy-jurisdictions/northern-ireland-tenancy-pack-v1.webp', 1200, 800],
  ['tenancy-jurisdictions/england-tenancy-options-v1.webp', 1200, 800],
  ['tenancy-jurisdictions/england-tenancy-selection-steps-v1.webp', 1200, 900],
] as const;

const STANDARD_WATERCOLOUR_ASSETS = [
  ['tenancy-standard/answers-to-agreement-watercolour-v2.webp', 1536, 1024],
  ['tenancy-standard/joined-tenancy-file-watercolour-v2.webp', 1536, 1024],
  ['tenancy-standard/check-preview-watercolour-v2.webp', 1536, 1024],
  ['tenancy-standard/standard-agreement-watercolour-v2.webp', 1536, 1024],
  ['tenancy-standard/guided-setup-watercolour-v2.webp', 1536, 1024],
  ['tenancy-standard/agreement-selector-watercolour-v2.webp', 1536, 1024],
  ['tenancy-standard/standard-how-it-works-watercolour-v3.webp', 1122, 1402],
] as const;

const LABELLED_CONVERSION_ASSETS = [
  ['tenancy-standard/standard-pack-panel-watercolour-v3.webp', 1024, 1536],
  ['services/section8-assisted-service-watercolour-v3.webp', 1536, 961],
  ['services/full-eviction-assisted-service-watercolour-v3.webp', 1536, 961],
  ['tenancy-jurisdictions/homepage-england-tenancy-labelled-v3.webp', 1536, 767],
  ['tenancy-jurisdictions/homepage-wales-contract-labelled-v3.webp', 1536, 768],
  ['tenancy-jurisdictions/homepage-scotland-prt-labelled-v3.webp', 1536, 768],
  ['tenancy-jurisdictions/homepage-northern-ireland-tenancy-labelled-v3.webp', 1536, 768],
] as const;

describe('tenancy page visual refresh', () => {
  it.each(TRANSPARENT_ASSETS)('keeps %s genuinely transparent', async (asset, width, height) => {
    const assetPath = join(ROOT, 'public/images/illustrations', asset);
    expect(existsSync(assetPath)).toBe(true);

    const metadata = await sharp(assetPath).metadata();
    const stats = await sharp(assetPath).stats();
    expect(metadata.width).toBe(width);
    expect(metadata.height).toBe(height);
    expect(metadata.hasAlpha).toBe(true);
    expect(stats.channels[3]?.min).toBe(0);
    expect(stats.channels[3]?.max).toBeGreaterThanOrEqual(254);
  });

  it.each(STANDARD_WATERCOLOUR_ASSETS)('keeps %s at its intended crop', async (asset, width, height) => {
    const assetPath = join(ROOT, 'public/images/illustrations', asset);
    expect(existsSync(assetPath)).toBe(true);

    const metadata = await sharp(assetPath).metadata();
    expect(metadata.width).toBe(width);
    expect(metadata.height).toBe(height);
  });

  it.each(LABELLED_CONVERSION_ASSETS)(
    'keeps labelled conversion asset %s at its intended crop',
    async (asset, width, height) => {
      const assetPath = join(ROOT, 'public/images/illustrations', asset);
      expect(existsSync(assetPath)).toBe(true);

      const metadata = await sharp(assetPath).metadata();
      expect(metadata.width).toBe(width);
      expect(metadata.height).toBe(height);
    }
  );

  it('uses the complete Standard tenancy watercolour set', () => {
    const page = read('src/app/standard-tenancy-agreement/page.tsx');
    for (const [asset] of STANDARD_WATERCOLOUR_ASSETS) {
      expect(page).toContain(`/images/illustrations/${asset}`);
    }
    expect(page).not.toContain('/images/wizard-standard-tenancy-agreement.webp');
    expect(page).not.toContain('/images/tenancy-agreement-selector.webp');
    expect(page).not.toContain('/images/standard-tenancy-desktop.webp');
    expect(page).not.toContain('jurisdiction-explainer-heading');
    expect(page).toContain('data-standard-pack-workflow="true"');
    expect(page).not.toContain('agreement-built-from-answers-v1.png');
    expect(page).not.toContain('joined-up-setup-records-v1.png');
    expect(page).not.toContain('validation-checks-v1.png');
    expect(page).toContain('showFitGuidance={false}');
    expect(page).toContain('showCoverageSummary={false}');
    expect(page).toContain('showVisualCtaPrimaryArrow={false}');
    expect(page).toContain('standard-pack-panel-watercolour-v3.webp');
    expect(page).toContain('className="object-cover object-center"');
  });

  it('uses labelled service and jurisdiction artwork on the homepage', () => {
    const homepage = read('src/components/landing/HomeContent.tsx');
    const assistedShowcase = read(
      'src/components/assisted-prep/AssistedPrepServicesShowcase.tsx'
    );

    for (const [asset] of LABELLED_CONVERSION_ASSETS.slice(3)) {
      expect(homepage).toContain(`/images/illustrations/${asset}`);
    }
    expect(assistedShowcase).toContain('section8-assisted-service-watercolour-v3.webp');
    expect(assistedShowcase).toContain('full-eviction-assisted-service-watercolour-v3.webp');
    expect(assistedShowcase).toContain('className="object-cover object-center');
  });

  it('uses the shared jurisdiction banner on Wales, Scotland and Northern Ireland', () => {
    const pages = [
      ['src/app/tenancy-agreements/wales/page.tsx', 'wales-occupation-contract-pack-v1.webp'],
      ['src/app/tenancy-agreements/scotland/page.tsx', 'scotland-prt-pack-v1.webp'],
      ['src/app/tenancy-agreements/northern-ireland/page.tsx', 'northern-ireland-tenancy-pack-v1.webp'],
    ] as const;

    for (const [pagePath, asset] of pages) {
      const page = read(pagePath);
      expect(page).toContain('TenancyConversionBanner');
      expect(page).toContain(asset);
    }
  });

  it('removes the requested Scotland and Northern Ireland link blocks', () => {
    const scotland = read('src/app/tenancy-agreements/scotland/page.tsx');
    const northernIreland = read('src/app/tenancy-agreements/northern-ireland/page.tsx');

    expect(scotland).not.toContain('Related Scotland tenancy resources');
    expect(scotland).not.toContain('Other UK jurisdictions');
    expect(northernIreland).not.toContain('>Related Links<');
    expect(northernIreland).not.toContain('Other UK Jurisdictions');
  });

  it('simplifies the England agreement hub and aligns its workflow artwork', () => {
    const page = read('src/app/products/ast/page.tsx');
    expect(page).toContain('showProductDecisionDetails: false');
    expect(page).not.toContain('EnglandAgreementChooser');
    expect(page).not.toContain('decisionBlock:');
    expect(page).toContain('england-tenancy-options-v1.webp');
    expect(page).toContain('england-tenancy-selection-steps-v1.webp');
    expect(page).toContain('alignImageToSteps: true');
    expect(page).not.toContain('Not sure which agreement? Compare all England options');
  });

  it('uses the full sales-page rhythm for FAQs by default', () => {
    const faq = read('src/components/marketing/FAQSection.tsx');
    expect(faq).toContain('contentWidth = "wide"');
    expect(faq).toContain('contentWidth === "wide" ? "max-w-6xl" : "max-w-3xl"');
  });
});
