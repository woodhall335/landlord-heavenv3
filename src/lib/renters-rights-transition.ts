import path from 'node:path';

export const LEGACY_TRANSITION_HUB_ROUTES = [
  '/section-21-ban-uk',
  '/section-21-notice',
  '/section-21-vs-section-8',
  '/no-fault-eviction',
] as const;

export const LEGACY_TERM_LABELS = [
  'Section 21',
  's21',
  'no-fault eviction',
  'Form 6A',
  'N5B',
  'accelerated possession',
] as const;

export const LEGACY_TERM_PATTERNS = [
  /\bsection 21\b/i,
  /\bs21\b/i,
  /\bno-fault eviction\b/i,
  /\bform 6a\b/i,
  /\bn5b\b/i,
  /\baccelerated possession\b/i,
] as const;

export const CURRENT_ENGLAND_MARKETING_ROUTES = [
  '/form-3-section-8',
  '/section-8-notice',
  '/renters-rights-act-eviction-rules',
  '/eviction-notice-england',
  '/how-to-evict-a-tenant-england',
  '/eviction-process-england',
  '/eviction-notice-template',
] as const;

export const MARKETING_PAGE_MIN_VISIBLE_WORDS = 1200;

export const RETIRED_LEGACY_BLOG_REDIRECTS = {
  '/blog/renters-reform-bill-what-landlords-need-to-know': '/renters-rights-act-eviction-rules',
  '/blog/what-is-section-21-notice': '/section-21-notice',
  '/blog/section-21-vs-section-8': '/section-21-vs-section-8',
  '/blog/england-section-21-process': '/section-21-notice',
  '/blog/england-accelerated-possession': '/n5-n119-possession-claim',
  '/blog/section-21': '/section-21-ban-uk',
} as const;

export const ALLOWED_LEGACY_TERM_PATH_SEGMENTS = [
  ...LEGACY_TRANSITION_HUB_ROUTES.map((route) =>
    path.join('src', 'app', ...route.slice(1).split('/'), 'page.tsx')
  ),
  path.join('config', 'retired-public-routes.json'),
  path.join('src', 'lib', 'public-retirements.ts'),
  path.join('src', 'lib', 'renters-rights-transition.ts'),
  path.join('scripts', 'audit-s21-content.ts'),
  path.join('audit', 'section21-transition-inventory.json'),
  path.join('audit', 'section21-transition-report.md'),
  path.join('tests', 'seo', 'retired-public-routes.test.ts'),
  path.join('tests', 'seo', 'renters-rights-transition.test.ts'),
] as const;

export function normalizeRepoPath(filePath: string): string {
  return filePath.replace(/\\/g, '/');
}

export function isAllowedLegacyTermPath(filePath: string): boolean {
  const normalizedPath = normalizeRepoPath(filePath);

  return ALLOWED_LEGACY_TERM_PATH_SEGMENTS.some((allowedPath) =>
    normalizedPath.endsWith(normalizeRepoPath(allowedPath))
  );
}
