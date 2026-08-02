import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const APP_DIR = path.join(process.cwd(), 'src', 'app');

function collectPages(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) return collectPages(absolute);
    return entry.isFile() && entry.name === 'page.tsx' ? [absolute] : [];
  });
}

const APPROVED_HERO_SURFACES = [
  'UniversalHero',
  'HomeContent',
  'PublicProductSalesPage',
  'RentIncreaseGuidePageView',
  'PillarPageShell',
  'HighIntentPageShell',
  'EnglandTenancyPage',
  'CurrentFrameworkGuidePage',
  'EvictionIntentLandingPage',
  'TenancyFunnelLandingPage',
  'RentCheckerSeoPage',
  'HROverlapArticleShell',
];

function isExcludedTransaction(filePath: string) {
  const normalized = filePath.replace(/\\/g, '/');
  return [
    '/src/app/(app)/',
    '/dashboard/',
    '/auth/',
    '/api/',
    '/checkout/',
    '/success/',
    '/wizard/',
    '/account/',
    '/login/',
    '/register/',
    '/forgot-password/',
    '/reset-password/',
    '/admin/',
    '/assisted-prep/start/',
    '/claims/',
  ].some((segment) => normalized.includes(segment));
}

describe('public universal hero coverage', () => {
  it('keeps every substantive public page on UniversalHero or an approved shared shell', () => {
    const offenders = collectPages(APP_DIR).filter((filePath) => {
      if (isExcludedTransaction(filePath)) return false;

      const normalized = filePath.replace(/\\/g, '/');
      if (/\/samples\/[^/]+\/page\.tsx$/.test(normalized)) return false;
      if (normalized.includes('/section-8-grounds/')) return false; // Covered by the route layout.

      const source = fs.readFileSync(filePath, 'utf8');
      if (/(?:permanentRedirect|redirect|notFound)\(/.test(source)) return false;
      if (source.trim().split(/\r?\n/).length <= 3) return false; // Re-export aliases.

      return !APPROVED_HERO_SURFACES.some((marker) => source.includes(marker));
    });

    expect(offenders.map((file) => path.relative(process.cwd(), file).replace(/\\/g, '/'))).toEqual([]);
  });

  it('covers every Section 8 ground through its route-aware universal hero layout', () => {
    const layout = fs.readFileSync(path.join(APP_DIR, 'section-8-grounds', 'layout.tsx'), 'utf8');
    expect(layout).toContain('Section8GroundUniversalHero');
  });
});
