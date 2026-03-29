import { existsSync, readFileSync, readdirSync } from 'fs';
import { join, relative } from 'path';
import { describe, expect, it } from 'vitest';

import {
  UNIVERSAL_HERO_THEME_COLOR,
  UNIVERSAL_HERO_VIEWPORT,
} from '@/lib/seo/hero-theme';

function walkPages(dir: string): string[] {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkPages(fullPath));
      continue;
    }

    if (entry.isFile() && entry.name === 'page.tsx') {
      files.push(fullPath);
    }
  }

  return files;
}

function readSource(filePath: string): string {
  return readFileSync(filePath, 'utf8');
}

const appDir = join(process.cwd(), 'src', 'app');
const heroBackedPages = walkPages(appDir).filter((filePath) => {
  const source = readSource(filePath);
  return (
    source.includes("import { UniversalHero } from '@/components/landing/UniversalHero'") ||
    source.includes("import { EnglandTenancyPage } from '@/components/seo/EnglandTenancyPage'")
  );
});

describe('hero theme metadata', () => {
  it('uses the locked dark hero top-tone color', () => {
    expect(UNIVERSAL_HERO_THEME_COLOR).toBe('#130c2b');
    expect(UNIVERSAL_HERO_VIEWPORT.themeColor).toBe('#130c2b');
  });

  it('updates the manifest fallback to the same theme color', () => {
    const manifest = JSON.parse(
      readSource(join(process.cwd(), 'src', 'app', 'manifest.webmanifest'))
    ) as { theme_color: string; background_color: string };

    expect(manifest.theme_color).toBe('#130c2b');
    expect(manifest.background_color).toBe('#130c2b');
  });

  it('covers every hero-backed route with shared theme-color metadata', () => {
    const missingCoverage: string[] = [];

    for (const filePath of heroBackedPages) {
      const source = readSource(filePath);
      const relativePath = relative(process.cwd(), filePath).replace(/\\/g, '/');
      const isClientPage = source.startsWith("'use client';");

      if (isClientPage) {
        const headPath = join(filePath.slice(0, -'page.tsx'.length), 'head.tsx');
        if (!existsSync(headPath)) {
          missingCoverage.push(`${relativePath} (missing head.tsx)`);
          continue;
        }

        const headSource = readSource(headPath);
        const hasThemeMeta =
          headSource.includes("import { UNIVERSAL_HERO_THEME_COLOR } from '@/lib/seo/hero-theme';") &&
          headSource.includes('<meta name="theme-color" content={UNIVERSAL_HERO_THEME_COLOR} />');

        if (!hasThemeMeta) {
          missingCoverage.push(`${relativePath} (head.tsx missing shared theme-color meta)`);
        }

        continue;
      }

      if (
        !source.includes(
          "export { UNIVERSAL_HERO_VIEWPORT as viewport } from '@/lib/seo/hero-theme';"
        )
      ) {
        missingCoverage.push(relativePath);
      }
    }

    expect(missingCoverage).toEqual([]);
  });

  it('keeps key England tenancy and non-tenancy hero pages covered', () => {
    const representativePages = [
      'src/app/standard-tenancy-agreement/page.tsx',
      'src/app/premium-tenancy-agreement/page.tsx',
      'src/app/(marketing)/products/ast/page.tsx',
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
