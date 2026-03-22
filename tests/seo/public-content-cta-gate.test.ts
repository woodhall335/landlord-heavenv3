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

  it('routes mapped shared intent pages through taxonomy-first CTA logic and shared context support', () => {
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
      '/section-21-expired-what-next',
      '/section-21-notice-template',
      '/section-8-notice-template',
      '/apply-possession-order-landlord',
      '/possession-claim-guide',
      '/n5b-possession-claim-guide',
      '/tenancy-agreements/england',
      '/wales-tenancy-agreement-template',
      '/private-residential-tenancy-agreement-template',
      '/northern-ireland-tenancy-agreement-template',
      '/renting-homes-wales-written-statement',
      '/scotland-prt-model-agreement-guide',
      '/update-occupation-contract-wales',
      '/joint-occupation-contract-wales',
      '/fixed-term-periodic-occupation-contract-wales',
      '/update-prt-tenancy-agreement-scotland',
      '/joint-prt-tenancy-agreement-scotland',
      '/common-prt-tenancy-mistakes-scotland',
      '/update-tenancy-agreement-northern-ireland',
      '/joint-tenancy-agreement-northern-ireland',
      '/fixed-term-tenancy-agreement-northern-ireland',
      '/county-court-claim-form-guide',
      '/eviction-cost-uk',
      '/eviction-court-forms-england',
      '/eviction-timeline-england',
      '/n5-n119-possession-claim',
      '/possession-order-process',
      '/court-bailiff-eviction-guide',
      '/eviction-timeline-uk',
      '/eviction-notice',
      '/eviction-notice-template',
      '/eviction-notice-england',
      '/eviction-notice-uk',
      '/notice-to-quit-northern-ireland-guide',
      '/section-21-notice-period',
      '/section-8-vs-section-21',
      '/wales-eviction-notice-template',
      '/eicr-landlord-requirements',
      '/rent-arrears-letter-template',
      '/scotland-notice-to-leave-template',
      '/tenant-wont-leave',
      '/how-to-rent-guide',
      '/tenancy-agreements',
      '/tenancy-agreements/scotland',
      '/warrant-of-possession',
      '/n5b-form-guide',
      '/section-21-checklist',
      '/section-21-ban',
      '/section-21-court-pack',
      '/section-8-court-pack',
      '/no-fault-eviction',
      '/eviction-pack-england',
      '/form-6a-section-21',
      '/form-3-section-8',
      '/assured-shorthold-tenancy-agreement',
      '/ast-template-england',
      '/ast-tenancy-agreement-template',
      '/periodic-tenancy-agreement',
      '/occupation-contract-template-wales',
      '/private-residential-tenancy-agreement-scotland',
      '/prt-template-scotland',
      '/prt-tenancy-agreement-template-scotland',
      '/scottish-tenancy-agreement-template',
      '/standard-occupation-contract-wales',
      '/tenancy-agreement-northern-ireland',
      '/tenancy-agreement-template-northern-ireland',
      '/tenancy-agreements/northern-ireland',
      '/tenancy-agreements/wales',
      '/ni-private-tenancy-agreement',
      '/ni-tenancy-agreement-template-free',
      '/eviction-process-scotland',
      '/eviction-process-wales',
      '/scotland-eviction-notices',
      '/wales-eviction-notices',
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

  it('wires the shared SEO context panel onto the newly normalised long-tail pages', () => {
    const pageFiles = [
      '/section-21-expired-what-next',
      '/section-21-notice-template',
      '/section-8-notice-template',
      '/apply-possession-order-landlord',
      '/possession-claim-guide',
      '/n5b-possession-claim-guide',
      '/wales-tenancy-agreement-template',
      '/private-residential-tenancy-agreement-template',
      '/northern-ireland-tenancy-agreement-template',
      '/renting-homes-wales-written-statement',
      '/scotland-prt-model-agreement-guide',
      '/update-occupation-contract-wales',
      '/joint-occupation-contract-wales',
      '/fixed-term-periodic-occupation-contract-wales',
      '/update-prt-tenancy-agreement-scotland',
      '/joint-prt-tenancy-agreement-scotland',
      '/common-prt-tenancy-mistakes-scotland',
      '/update-tenancy-agreement-northern-ireland',
      '/joint-tenancy-agreement-northern-ireland',
      '/fixed-term-tenancy-agreement-northern-ireland',
      '/county-court-claim-form-guide',
      '/eviction-cost-uk',
      '/n5-n119-possession-claim',
      '/court-bailiff-eviction-guide',
      '/eviction-timeline-uk',
      '/eviction-notice',
      '/eviction-notice-template',
      '/eviction-notice-uk',
      '/notice-to-quit-northern-ireland-guide',
      '/section-8-vs-section-21',
      '/wales-eviction-notice-template',
      '/eicr-landlord-requirements',
      '/rent-arrears-letter-template',
      '/scotland-notice-to-leave-template',
      '/tenant-wont-leave',
      '/how-to-rent-guide',
      '/tenancy-agreements',
      '/warrant-of-possession',
      '/n5b-form-guide',
      '/section-21-checklist',
      '/section-21-ban',
      '/section-21-court-pack',
      '/section-8-court-pack',
      '/no-fault-eviction',
      '/eviction-pack-england',
      '/form-6a-section-21',
      '/form-3-section-8',
      '/accelerated-possession-guide',
      '/bailiff-eviction-process',
      '/court-possession-order-guide',
      '/eviction-court-hearing-guide',
      '/eviction-process-england',
      '/eviction-process-scotland',
      '/eviction-process-wales',
      '/how-to-evict-a-tenant-uk',
      '/rent-arrears-landlord-guide',
      '/scotland-eviction-notices',
      '/section-8-eviction-process',
      '/section-8-grounds-explained',
      '/tenant-stopped-paying-rent',
      '/wales-eviction-notices',
      '/warrant-of-possession-guide',
    ].map((pathname) => pageFileForPathname(pathname));

    for (const file of pageFiles) {
      const source = fs.readFileSync(file, 'utf8');
      expect(source.includes('SeoPageContextPanel')).toBe(true);
    }
  });
});
