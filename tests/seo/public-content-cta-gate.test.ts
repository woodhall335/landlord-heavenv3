import fs from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';
function pageFileForPathname(pathname: string): string {
  const segments = pathname === '/' ? [] : pathname.slice(1).split('/');
  return path.join(process.cwd(), 'src', 'app', ...segments, 'page.tsx');
}

describe('Public content CTA gate', () => {
  it('keeps shared SEO CTA components free from wizard-first routing', () => {
    const componentFiles = [
      path.join(process.cwd(), 'src', 'components', 'seo', 'SeoCtaBlock.tsx'),
      path.join(process.cwd(), 'src', 'components', 'seo', 'IntentProductCTA.tsx'),
    ];

    for (const file of componentFiles) {
      const source = fs.readFileSync(file, 'utf8');
      expect(source.includes('buildWizardLink')).toBe(false);
      expect(source.includes('"/wizard')).toBe(false);
      expect(source.includes("'/wizard")).toBe(false);
      expect(source.includes('/wizard?')).toBe(false);
    }
  });

  it('keeps core canonical content pages free from direct wizard routing helpers', () => {
    const pageFiles = [
      '/tenant-not-paying-rent',
      '/how-to-evict-tenant',
      '/eviction-guides',
      '/eviction-process-uk',
      '/section-8-notice',
      '/section-21-notice',
      '/section-21-ban-uk',
      '/money-claim',
      '/money-claim-unpaid-rent',
      '/money-claim-rent-arrears',
      '/claim-rent-arrears-tenant',
      '/how-to-sue-tenant-for-unpaid-rent',
      '/mcol-money-claim-online',
      '/serve-section-8-notice',
      '/serve-section-21-notice',
      '/section-21-validity-checklist',
      '/section-21-vs-section-8',
      '/tenancy-agreements/england',
      '/tenancy-agreement',
      '/premium-tenancy-agreement',
      '/tenancy-agreement-template',
      '/tenancy-agreement-template-free',
      '/assured-shorthold-tenancy-agreement-template',
      '/6-month-tenancy-agreement-template',
      '/fixed-term-tenancy-agreement-template',
      '/fixed-term-periodic-tenancy-england',
      '/joint-tenancy-agreement-england',
      '/joint-tenancy-agreement-template',
      '/renew-tenancy-agreement-england',
      '/rolling-tenancy-agreement',
      '/renters-rights-bill-tenancy-agreement',
    ]
      .map((pathname) => pageFileForPathname(pathname))
      .filter((file) => fs.existsSync(file));

    expect(pageFiles.length).toBeGreaterThan(0);

    for (const file of pageFiles) {
      const source = fs.readFileSync(file, 'utf8');
      expect(source.includes('buildWizardLink')).toBe(false);
      expect(source.includes('href: \'/wizard')).toBe(false);
      expect(source.includes('href=\"/wizard')).toBe(false);
      expect(source.includes('"/wizard?')).toBe(false);
      expect(source.includes("'/wizard?")).toBe(false);
    }
  });
});
