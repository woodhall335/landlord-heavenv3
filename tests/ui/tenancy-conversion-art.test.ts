import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';

const ROOT = process.cwd();
const COMPONENT_PATH = join(ROOT, 'src/components/seo/EnglandTenancyPage.tsx');
const ASSET_ROOT = join(ROOT, 'public/images/illustrations/tenancy-cta');

const PAGES = [
  ['standard-tenancy-agreement', 'standard-tenancy-pack-v1.webp'],
  ['premium-tenancy-agreement', 'premium-tenancy-pack-v1.webp'],
  ['student-tenancy-agreement', 'student-tenancy-pack-v1.webp'],
  ['hmo-shared-house-tenancy-agreement', 'hmo-shared-house-pack-v1.webp'],
  ['lodger-agreement', 'lodger-agreement-pack-v1.webp'],
] as const;

describe('tenancy conversion artwork', () => {
  it('uses the shared visual CTA with Lucide icons', () => {
    const component = readFileSync(COMPONENT_PATH, 'utf8');

    expect(component).toContain("from 'lucide-react'");
    expect(component).toContain('data-tenancy-visual-cta');
    expect(component).toContain('ctaVisual?: EnglandTenancyCtaVisual');
    expect(component).toContain('unoptimized');
  });

  it.each(PAGES)('configures bespoke conversion art for %s', (route, asset) => {
    const page = readFileSync(join(ROOT, `src/app/${route}/page.tsx`), 'utf8');

    expect(page).toContain('ctaVisual: {');
    expect(page).toContain(`/images/illustrations/tenancy-cta/${asset}`);
    expect(existsSync(join(ASSET_ROOT, asset))).toBe(true);
  });

  it.each(PAGES)('keeps %s artwork genuinely transparent', async (_route, asset) => {
    const metadata = await sharp(join(ASSET_ROOT, asset)).metadata();
    const stats = await sharp(join(ASSET_ROOT, asset)).ensureAlpha().stats();

    expect(metadata.width).toBe(960);
    expect(metadata.height).toBe(640);
    expect(metadata.hasAlpha).toBe(true);
    expect(stats.channels[3]?.min).toBe(0);
    expect(stats.channels[3]?.max).toBe(255);
  });
});
