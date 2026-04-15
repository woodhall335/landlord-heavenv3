import fs from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';

import { getRetainedSeoPageTaxonomyEntries } from '@/lib/seo/page-taxonomy';

function pageFileForPathname(pathname: string): string {
  const segments = pathname === '/' ? [] : pathname.slice(1).split('/');
  return path.join(process.cwd(), 'src', 'app', ...segments, 'page.tsx');
}

function sourceHasDirectWizardRouting(source: string): boolean {
  return (
    source.includes('buildWizardLink') ||
    source.includes('href: \'/wizard') ||
    source.includes('href="/wizard') ||
    source.includes('"/wizard?') ||
    source.includes("'/wizard?")
  );
}

describe('Public content CTA gate', () => {
  it('keeps shared SEO CTA components free from wizard-first routing', () => {
    const componentFiles = [
      path.join(process.cwd(), 'src', 'components', 'seo', 'SeoCtaBlock.tsx'),
      path.join(process.cwd(), 'src', 'components', 'seo', 'IntentProductCTA.tsx'),
    ];

    for (const file of componentFiles) {
      const source = fs.readFileSync(file, 'utf8');
      expect(sourceHasDirectWizardRouting(source)).toBe(false);
    }
  });

  it('routes shared intent pages through taxonomy-first CTA logic and shared context support', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'src', 'components', 'seo', 'EvictionIntentLandingPage.tsx'),
      'utf8'
    );

    expect(source.includes('getSeoPageTaxonomyBySlug')).toBe(true);
    expect(source.includes('getPrimaryDestinationAboveFold')).toBe(true);
    expect(source.includes('SeoPageContextPanel')).toBe(true);
    expect(source.includes('getWizardHref')).toBe(false);
    expect(source.includes('/wizard?')).toBe(false);
  });

  it('keeps retained non-product support pages free from direct wizard routing', () => {
    const allowedDirectProductFlowRoutes = new Set([
      '/wales-tenancy-agreement-template',
      '/private-residential-tenancy-agreement-template',
      '/northern-ireland-tenancy-agreement-template',
    ]);

    const pageFiles = getRetainedSeoPageTaxonomyEntries()
      .map((entry) => entry.pathname)
      .filter((pathname) => !pathname.startsWith('/products/'))
      .filter((pathname) => !allowedDirectProductFlowRoutes.has(pathname))
      .map((pathname) => ({
        pathname,
        filePath: pageFileForPathname(pathname),
      }))
      .filter(({ filePath }) => fs.existsSync(filePath));

    expect(pageFiles.length).toBeGreaterThan(0);

    const offenders = pageFiles
      .filter(({ filePath }) => sourceHasDirectWizardRouting(fs.readFileSync(filePath, 'utf8')))
      .map(({ pathname }) => pathname);

    expect(offenders).toEqual([]);
  });

  it('keeps shared SEO context support wired onto representative long-tail pages', () => {
    const representativeFiles = [
      '/section-21-expired-what-next',
      '/section-21-notice-template',
      '/section-8-notice-template',
      '/apply-possession-order-landlord',
      '/possession-claim-guide',
      '/n5b-possession-claim-guide',
      '/form-6a-section-21',
      '/no-fault-eviction',
      '/tenant-left-without-paying-rent',
      '/periodic-tenancy-agreement',
      '/tenancy-agreements/england',
    ].map((pathname) => pageFileForPathname(pathname));

    for (const file of representativeFiles) {
      const source = fs.readFileSync(file, 'utf8');
      expect(
        source.includes('SeoPageContextPanel') ||
          source.includes('PillarPageShell') ||
          source.includes('EnglandTenancyPage') ||
          source.includes('HighIntentPageShell') ||
          source.includes('EvictionIntentLandingPage')
      ).toBe(true);
    }
  });
});
