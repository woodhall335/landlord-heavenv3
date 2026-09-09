import { readFileSync } from 'fs';
import { join } from 'path';
import { describe, expect, it } from 'vitest';

import {
  UNIVERSAL_HERO_THEME_COLOR,
  UNIVERSAL_HERO_VIEWPORT,
} from '@/lib/seo/hero-theme';

function readSource(filePath: string): string {
  return readFileSync(filePath, 'utf8');
}

describe('hero theme metadata', () => {
  it('uses the shared light hero top-tone color', () => {
    expect(UNIVERSAL_HERO_THEME_COLOR).toBe('#ffffff');
    expect(UNIVERSAL_HERO_VIEWPORT.themeColor).toBe('#ffffff');
  });

  it('keeps the manifest fallback on the shared theme token', () => {
    const manifest = readSource(join(process.cwd(), 'src', 'app', 'manifest.ts'));
    expect(manifest).toContain('theme_color: UNIVERSAL_HERO_THEME_COLOR');
    expect(manifest).toContain('background_color: UNIVERSAL_HERO_THEME_COLOR');
  });

  it('covers every route from the root layout', () => {
    const layout = readSource(join(process.cwd(), 'src', 'app', 'layout.tsx'));
    expect(layout).toContain('themeColor: UNIVERSAL_HERO_THEME_COLOR');
  });

  it('keeps key England tenancy and non-tenancy hero pages covered', () => {
    const representativePages = [
      'src/app/standard-tenancy-agreement/page.tsx',
      'src/app/premium-tenancy-agreement/page.tsx',
      'src/app/products/ast/page.tsx',
      'src/app/money-claim/page.tsx',
    ];

    representativePages.forEach((relativePath) => {
      const source = readSource(join(process.cwd(), relativePath));
      expect(source).toContain(
        "export { UNIVERSAL_HERO_VIEWPORT as viewport } from '@/lib/seo/hero-theme';"
      );
    });
  });
});
