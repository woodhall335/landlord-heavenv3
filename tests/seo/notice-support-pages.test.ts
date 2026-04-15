import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { getCurrentFrameworkPageConfig } from '@/lib/seo/england-current-framework-pages';
import {
  SECTION21_COURT_CUTOFF_DATE,
  SECTION21_END_DATE,
} from '@/lib/seo/section21-transition-copy';

describe('notice support pages', () => {
  it('keeps Section 8 as a support route that points landlords into the live Notice Only owner', () => {
    const config = getCurrentFrameworkPageConfig('section-8-notice');

    expect(config.primaryCta).toEqual({
      label: 'Start your eviction notice pack',
      href: '/products/notice-only',
    });
    expect(config.secondaryCta).toEqual({
      label: 'Read Form 3A',
      href: '/form-3-section-8',
    });
    expect(config.heroSubtitle).toContain('live England notice route');
  });

  it('keeps Section 21 as a legacy bridge with exact dates and owner-first routing', () => {
    const content = readFileSync(join(process.cwd(), 'src/app/section-21-notice/page.tsx'), 'utf8');

    expect(content).toContain("primaryCta: { label: 'Start eviction notice pack', href: '/products/notice-only' }");
    expect(content).toContain(
      "secondaryCta: { label: 'Read Section 8 Notice', href: '/section-8-notice' }"
    );
    expect(SECTION21_END_DATE).toBe('1 May 2026');
    expect(SECTION21_COURT_CUTOFF_DATE).toBe('31 July 2026');
    expect(content).toContain('SECTION21_END_DATE');
    expect(content).toContain('SECTION21_COURT_CUTOFF_DATE');
    expect(content).toContain('/products/notice-only');
  });

  it('keeps the comparison page as support that routes back to the eviction notice pack and Section 8', () => {
    const content = readFileSync(
      join(process.cwd(), 'src/app/section-21-vs-section-8/page.tsx'),
      'utf8'
    );

    expect(content).toContain('/products/notice-only');
    expect(content).toContain('/section-8-notice');
    expect(content).toContain('Start eviction notice pack');
  });
});
