import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const MARKETING_APP_DIR = path.join(process.cwd(), 'src', 'app', '(marketing)');

function collectPageFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const absolutePath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return collectPageFiles(absolutePath);
    }
    return entry.isFile() && entry.name === 'page.tsx' ? [absolutePath] : [];
  });
}

function relativePage(filePath: string): string {
  return path.relative(process.cwd(), filePath).replace(/\\/g, '/');
}

describe('marketing page hero contract', () => {
  it('renders marketing pages through UniversalHero or an approved UniversalHero wrapper', () => {
    const approvedWrappers = [
      'HomeContent',
      'PublicProductSalesPage',
      'RentIncreaseGuidePageView',
    ];
    const redirectOnlyPages = ['permanentRedirect('];

    const offenders = collectPageFiles(MARKETING_APP_DIR).filter((filePath) => {
      const source = fs.readFileSync(filePath, 'utf8');
      const usesUniversalHero = source.includes('UniversalHero');
      const usesApprovedWrapper = approvedWrappers.some((marker) => source.includes(marker));
      const isRedirectOnly = redirectOnlyPages.some((marker) => source.includes(marker));
      return !usesUniversalHero && !usesApprovedWrapper && !isRedirectOnly;
    });

    expect(offenders.map(relativePage)).toEqual([]);
  });

  it('does not reintroduce deprecated or bespoke marketing hero implementations', () => {
    const forbiddenPatterns = [
      /\bTealHero\b/,
      /\bStandardHero\b/,
      /<header\s+id=["']blog-hero["']/,
      /Landlord Heaven help centre background/,
      /Landlord Heaven support background/,
    ];

    const offenders = collectPageFiles(MARKETING_APP_DIR).flatMap((filePath) => {
      const source = fs.readFileSync(filePath, 'utf8');
      const matches = forbiddenPatterns
        .filter((pattern) => pattern.test(source))
        .map((pattern) => pattern.source);
      return matches.length ? [{ file: relativePage(filePath), matches }] : [];
    });

    expect(offenders).toEqual([]);
  });
});
