import { describe, expect, it } from 'vitest';
import {
  evictionRelatedLinks,
  section21RelatedLinks,
  section8RelatedLinks,
} from '@/lib/seo/internal-links';

describe('notice link ordering', () => {
  it('leads broad eviction notice links with the commercial owner, then the promoted England framework bundle', () => {
    expect(evictionRelatedLinks.slice(0, 5).map((link) => link.href)).toEqual([
      '/products/notice-only',
      '/renters-rights-act-eviction-rules',
      '/section-8-notice',
      '/form-3-section-8',
      '/how-to-evict-a-tenant-england',
    ]);
  });

  it('keeps Section 21 related links anchored on the same commercial owner and current England framework bundle', () => {
    expect(section21RelatedLinks.slice(0, 5).map((link) => link.href)).toEqual([
      '/products/notice-only',
      '/renters-rights-act-eviction-rules',
      '/section-8-notice',
      '/form-3-section-8',
      '/how-to-evict-a-tenant-england',
    ]);
  });

  it('keeps Section 8 related links owner-first with the promoted England framework routes immediately after', () => {
    expect(section8RelatedLinks.slice(0, 5).map((link) => link.href)).toEqual([
      '/products/notice-only',
      '/renters-rights-act-eviction-rules',
      '/section-8-notice',
      '/form-3-section-8',
      '/how-to-evict-a-tenant-england',
    ]);
  });
});
