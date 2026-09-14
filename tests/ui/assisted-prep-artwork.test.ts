import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = process.cwd();
const read = (relativePath: string) => readFileSync(join(ROOT, relativePath), 'utf8');

const SECTION8_ASSET = '/images/illustrations/services/section8-assisted-service-watercolour-v3.webp';
const POSSESSION_ASSET = '/images/illustrations/services/full-eviction-assisted-service-watercolour-v3.webp';

const BOTH_SERVICE_SURFACES = [
  'src/components/assisted-prep/AssistedPrepServicesShowcase.tsx',
  'src/components/assisted-prep/AssistedPrepVisualExplainer.tsx',
  'src/components/assisted-prep/AssistedPrepServiceDetails.tsx',
  'src/components/seo/Section8GroundRouteCards.tsx',
  'src/app/(marketing)/assisted-prep/start/page.tsx',
] as const;

describe('site-wide assisted-prep artwork', () => {
  it('keeps both labelled waterbrush assets available', () => {
    expect(existsSync(join(ROOT, 'public', SECTION8_ASSET))).toBe(true);
    expect(existsSync(join(ROOT, 'public', POSSESSION_ASSET))).toBe(true);
  });

  it.each(BOTH_SERVICE_SURFACES)('uses both labelled service assets in %s', (sourcePath) => {
    const source = read(sourcePath);

    expect(source).toContain(SECTION8_ASSET);
    expect(source).toContain(POSSESSION_ASSET);
  });

  it('uses the labelled Section 8 artwork for English eviction blog sidebars', () => {
    const source = read('src/components/blog/BlogAssistedPrepSidebar.tsx');

    expect(source).toContain(SECTION8_ASSET);
    expect(source).not.toContain('/images/illustrations/pricing-cards/assisted-section8.webp');
  });

  it.each(BOTH_SERVICE_SURFACES)('does not regress to generic service artwork in %s', (sourcePath) => {
    const source = read(sourcePath);

    expect(source).not.toContain('section8-service-evidence-waterbrush-v2.webp');
    expect(source).not.toContain('possession-court-evidence-waterbrush-v2.webp');
    expect(source).not.toContain('/images/generated/assisted-prep/section8-assisted-prep.png');
    expect(source).not.toContain('/images/generated/assisted-prep/possession-assisted-prep.png');
  });
});
