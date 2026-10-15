import { existsSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import { getBlogImagesForPost } from './image-manifest';
import { getBlogProductCta } from './product-cta-map';
import { section13GrowthPosts } from './section13-growth-posts';

const illustrations = [
  'section13-evidence-comparables-watercolour-v1.webp',
  'section13-notice-timing-watercolour-v1.webp',
  'section13-tribunal-evidence-watercolour-v1.webp',
  'section13-challenge-journey-watercolour-v1.webp',
  'tenancy-agreement-refresh-watercolour-v1.webp',
  'tenancy-agreement-file-watercolour-v1.webp',
];

describe('Section 13 editorial growth cluster', () => {
  it('publishes two distinct England articles with the correct product owner', () => {
    expect(section13GrowthPosts.map((post) => post.slug)).toEqual([
      'england-section-13-rent-increase-evidence-checklist',
      'england-tenant-challenges-section-13-rent-increase',
    ]);

    expect(getBlogProductCta(section13GrowthPosts[0]).primaryProductHref).toBe(
      '/products/section-13-standard'
    );
    expect(getBlogProductCta(section13GrowthPosts[1]).primaryProductHref).toBe(
      '/products/section-13-defence'
    );
  });

  it('uses a bespoke hero for each new article rather than the rotating fallback', () => {
    for (const post of section13GrowthPosts) {
      const imageSet = getBlogImagesForPost(post);
      expect(imageSet.hero).toBe(post.heroImage);
      expect(imageSet.hero).toContain('/images/heroes/library/hero-');
      expect(existsSync(path.join(process.cwd(), 'public', imageSet.hero))).toBe(true);
    }
  });

  it('keeps all supporting article illustrations transparent', async () => {
    for (const file of illustrations) {
      const assetPath = path.join(
        process.cwd(),
        'public',
        'images',
        'illustrations',
        'blog-growth',
        file
      );
      expect(existsSync(assetPath)).toBe(true);
      await expect(sharp(assetPath).metadata()).resolves.toMatchObject({ hasAlpha: true });
    }
  });
});
