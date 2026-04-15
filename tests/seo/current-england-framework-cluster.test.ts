import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { getCurrentFrameworkPageConfig } from '@/lib/seo/england-current-framework-pages';
import { currentEnglandFrameworkLinks } from '@/lib/seo/internal-links';
import { getSeoPageTaxonomyBySlug } from '@/lib/seo/page-taxonomy';

describe('current England framework cluster', () => {
  it('keeps the promoted England framework links in the canonical order', () => {
    expect(currentEnglandFrameworkLinks.map((link) => link.href)).toEqual([
      '/renters-rights-act-eviction-rules',
      '/section-8-notice',
      '/form-3-section-8',
      '/how-to-evict-a-tenant-england',
      '/eviction-process-england',
    ]);
  });

  it('keeps the CTA contract aligned to the five promoted England owner pages', () => {
    expect(getCurrentFrameworkPageConfig('renters-rights-act-eviction-rules')).toMatchObject({
      ownerQueryTheme: 'renters rights act eviction rules england',
      primaryCta: {
        label: 'Read Section 8 Notice',
        href: '/section-8-notice',
      },
      secondaryCta: {
        label: 'Read Eviction Process in England',
        href: '/eviction-process-england',
      },
    });

    expect(getCurrentFrameworkPageConfig('section-8-notice')).toMatchObject({
      ownerQueryTheme: 'section 8 notice england',
      primaryCta: {
        label: 'Start your eviction notice pack',
        href: '/products/notice-only',
      },
      secondaryCta: {
        label: 'Read Form 3A',
        href: '/form-3-section-8',
      },
    });

    expect(getCurrentFrameworkPageConfig('form-3-section-8')).toMatchObject({
      ownerQueryTheme: 'form 3a section 8',
      primaryCta: {
        label: 'Start your eviction notice pack',
        href: '/products/notice-only',
      },
      secondaryCta: {
        label: 'Read Section 8 Notice',
        href: '/section-8-notice',
      },
    });

    expect(getCurrentFrameworkPageConfig('how-to-evict-a-tenant-england')).toMatchObject({
      ownerQueryTheme: 'how to evict a tenant in england',
      primaryCta: {
        label: 'Read Section 8 Notice',
        href: '/section-8-notice',
      },
      secondaryCta: {
        label: 'Read Eviction Process in England',
        href: '/eviction-process-england',
      },
    });

    expect(getCurrentFrameworkPageConfig('eviction-process-england')).toMatchObject({
      ownerQueryTheme: 'eviction process england',
      primaryCta: {
        label: 'Start your complete eviction pack',
        href: '/products/complete-pack',
      },
      secondaryCta: {
        label: "Read Renters' Rights Act Eviction Rules",
        href: '/renters-rights-act-eviction-rules',
      },
    });
  });

  it('keeps Form 3A on the live slug while using Form 3A wording throughout the owner page', () => {
    const config = getCurrentFrameworkPageConfig('form-3-section-8');

    expect(config.slug).toBe('form-3-section-8');
    expect(config.title).toContain('Form 3A');
    expect(config.heroTitle).toContain('Form 3A');
    expect(config.relatedLinks.map((link) => link.title)).toContain('Section 8 Notice');
  });

  it('surfaces the promoted England cluster from guides, transition pages, and product handoffs', () => {
    const fileExpectations: Array<{ file: string; needles: string[] }> = [
      {
        file: 'src/app/eviction-guides/page.tsx',
        needles: [
          'currentEnglandFrameworkLinks',
          'Current England eviction after 1 May 2026',
        ],
      },
      {
        file: 'src/app/section-21-ban-uk/page.tsx',
        needles: [
          '/renters-rights-act-eviction-rules',
          '/section-8-notice',
          '/form-3-section-8',
          '/eviction-process-england',
        ],
      },
      {
        file: 'src/app/section-21-notice/page.tsx',
        needles: [
          '/renters-rights-act-eviction-rules',
          '/section-8-notice',
          '/form-3-section-8',
          '/eviction-process-england',
        ],
      },
      {
        file: 'src/app/section-21-vs-section-8/page.tsx',
        needles: [
          '/renters-rights-act-eviction-rules',
          '/section-8-notice',
          '/form-3-section-8',
          '/eviction-process-england',
        ],
      },
      {
        file: 'src/app/section-21-expired-what-next/page.tsx',
        needles: [
          'currentEnglandFrameworkLinks',
          '/renters-rights-act-eviction-rules',
        ],
      },
      {
        file: 'src/app/(marketing)/products/notice-only/page.tsx',
        needles: [
          'guideLinks.rentersRightsActEvictionRules',
          'guideLinks.section8Notice',
          'guideLinks.form3aSection8',
        ],
      },
      {
        file: 'src/app/(marketing)/products/complete-pack/page.tsx',
        needles: [
          'guideLinks.rentersRightsActEvictionRules',
          'guideLinks.howToEvictTenantEngland',
          'guideLinks.evictionProcessEngland',
        ],
      },
    ];

    fileExpectations.forEach(({ file, needles }) => {
      const source = readFileSync(join(process.cwd(), file), 'utf8');
      needles.forEach((needle) => {
        expect(source, `${file} should contain ${needle}`).toContain(needle);
      });
    });
  });

  it('treats UK comparison pages as routers and England framework pages as owners or bridges', () => {
    expect(getSeoPageTaxonomyBySlug('renters-rights-act-eviction-rules')).toMatchObject({
      pageRole: 'pillar',
      primaryPillar: '/renters-rights-act-eviction-rules',
      supportingPage: '/section-8-notice',
    });

    expect(getSeoPageTaxonomyBySlug('form-3-section-8')).toMatchObject({
      pageRole: 'bridge',
      primaryPillar: '/renters-rights-act-eviction-rules',
      supportingPage: '/section-8-notice',
    });

    expect(getSeoPageTaxonomyBySlug('how-to-evict-a-tenant-england')).toMatchObject({
      pageRole: 'bridge',
      primaryPillar: '/renters-rights-act-eviction-rules',
      supportingPage: '/eviction-process-england',
    });

    expect(getSeoPageTaxonomyBySlug('eviction-process-england')).toMatchObject({
      pageRole: 'bridge',
      primaryPillar: '/renters-rights-act-eviction-rules',
      supportingPage: '/section-8-notice',
    });

    expect(getSeoPageTaxonomyBySlug('how-to-evict-tenant')).toMatchObject({
      pageRole: 'pillar',
      supportingPage: '/renters-rights-act-eviction-rules',
    });

    expect(getSeoPageTaxonomyBySlug('how-to-evict-a-tenant-uk')).toMatchObject({
      pageRole: 'supporting',
      supportingPage: '/renters-rights-act-eviction-rules',
    });
  });
});
