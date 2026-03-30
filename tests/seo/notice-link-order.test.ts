import { describe, expect, it } from 'vitest';
import {
  evictionRelatedLinks,
  section21RelatedLinks,
  section8RelatedLinks,
} from '@/lib/seo/internal-links';

describe('notice link ordering', () => {
  it('leads broad eviction notice links with the owner page, then live/support routes, then products', () => {
    expect(evictionRelatedLinks.slice(0, 5).map((link) => link.href)).toEqual([
      '/eviction-notice-template',
      '/section-8-notice',
      '/section-21-notice',
      '/how-to-evict-tenant',
      '/products/notice-only',
    ]);
  });

  it('keeps Section 21 related links owner-first and pushes products downstream', () => {
    expect(section21RelatedLinks.slice(0, 5).map((link) => link.href)).toEqual([
      '/eviction-notice-template',
      '/section-8-notice',
      '/section-21-notice',
      '/section-21-ban-uk',
      '/products/notice-only',
    ]);
  });

  it('keeps Section 8 related links owner-first with Section 8 as the live support route', () => {
    expect(section8RelatedLinks.slice(0, 5).map((link) => link.href)).toEqual([
      '/eviction-notice-template',
      '/section-8-notice',
      '/section-21-notice',
      '/products/notice-only',
      '/products/complete-pack',
    ]);
  });
});
