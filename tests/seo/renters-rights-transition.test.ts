import { existsSync, readFileSync } from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';
import { RETIRED_PUBLIC_ROUTE_REDIRECTS } from '@/lib/public-retirements';
import {
  CURRENT_ENGLAND_FRAMEWORK_PAGES,
  getCurrentFrameworkVisibleWordCount,
} from '@/lib/seo/england-current-framework-pages';
import {
  CURRENT_ENGLAND_MARKETING_ROUTES,
  MARKETING_PAGE_MIN_VISIBLE_WORDS,
} from '@/lib/renters-rights-transition';
import { runSection21TransitionAudit } from '../../scripts/audit-s21-content';

const REQUIRED_REDIRECT_MATRIX = {
  '/section-21-ban': '/section-21-ban-uk',
  '/section-21-notice-guide': '/section-21-notice',
  '/section-21-notice-period': '/section-21-notice',
  '/serve-section-21-notice': '/section-21-notice',
  '/section-21-notice-template': '/section-21-notice',
  '/form-6a-section-21': '/section-21-notice',
  '/section-21-validity-checklist': '/section-21-notice',
  '/section-21-checklist': '/section-21-notice',
  '/section-21-expired-what-next': '/section-21-notice',
  '/tenant-ignores-section-21': '/section-21-notice',
  '/what-happens-after-section-21': '/section-21-notice',
  '/section-8-vs-section-21': '/section-21-vs-section-8',
  '/accelerated-possession-guide': '/n5-n119-possession-claim',
  '/n5b-form-guide': '/n5-n119-possession-claim',
  '/n5b-possession-claim-form': '/n5-n119-possession-claim',
  '/n5b-possession-claim-guide': '/n5-n119-possession-claim',
} as const;

describe('Renters Rights Act transition coverage', () => {
  it('implements the required redirect matrix exactly', () => {
    Object.entries(REQUIRED_REDIRECT_MATRIX).forEach(([source, destination]) => {
      expect(RETIRED_PUBLIC_ROUTE_REDIRECTS[source]).toBe(destination);
    });
  });

  it('keeps all seven England owner pages at or above the 1200-word minimum', () => {
    CURRENT_ENGLAND_MARKETING_ROUTES.forEach((route) => {
      const slug = route.slice(1) as keyof typeof CURRENT_ENGLAND_FRAMEWORK_PAGES;
      const config = CURRENT_ENGLAND_FRAMEWORK_PAGES[slug];
      expect(getCurrentFrameworkVisibleWordCount(config)).toBeGreaterThanOrEqual(
        MARKETING_PAGE_MIN_VISIBLE_WORDS
      );
    });
  });

  it('keeps the four transition hubs wired to the shared banner and current destinations', () => {
    const hubFiles = [
      'src/app/section-21-ban-uk/page.tsx',
      'src/app/section-21-notice/page.tsx',
      'src/app/section-21-vs-section-8/page.tsx',
      'src/app/no-fault-eviction/page.tsx',
    ];

    hubFiles.forEach((relativePath) => {
      const absolutePath = path.join(process.cwd(), relativePath);
      const source = readFileSync(absolutePath, 'utf8');
      expect(source).toContain('LegacySection21Banner');
      expect(source).toContain('/eviction-process-england');
      expect(source).toContain('/products/notice-only');
      expect(source).toContain('/products/complete-pack');
    });
  });

  it('writes the transition audit deliverables and reports no active legacy-term violations', () => {
    const { violations, form3Violations } = runSection21TransitionAudit();

    expect(violations).toHaveLength(0);
    expect(form3Violations).toHaveLength(0);
    expect(existsSync(path.join(process.cwd(), 'audit', 'section21-transition-inventory.json'))).toBe(
      true
    );
    expect(existsSync(path.join(process.cwd(), 'audit', 'section21-transition-report.md'))).toBe(true);
  });
});

