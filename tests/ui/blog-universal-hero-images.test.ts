import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { resolveBlogImageSet } from '@/lib/blog/image-manifest';

describe('blog universal hero image contract', () => {
  it('assigns deterministic universal artwork instead of the retired blog hero set', () => {
    const input = {
      slug: 'england-complete-eviction-pack-after-section-21-ban',
      title: 'Complete England eviction pack after the Section 21 ban',
      targetKeyword: 'complete eviction pack',
      category: 'Evictions',
    };

    const first = resolveBlogImageSet(input);
    const second = resolveBlogImageSet(input);

    expect(first).toEqual(second);
    expect(first.strategy).toBe('universal');
    expect(first.hero).toMatch(/^\/images\/(?:heroes\/|section8-paid-hero-watercolor-v2\.webp)/);
    expect(first.hero).not.toContain('/images/blog/heroes/');
  });

  it('uses the same resolved hero for blog cards, article heroes and article imagery', () => {
    const listing = fs.readFileSync(path.join(process.cwd(), 'src/app/(marketing)/blog/page.tsx'), 'utf8');
    const article = fs.readFileSync(path.join(process.cwd(), 'src/app/(marketing)/blog/[slug]/page.tsx'), 'utf8');

    expect(listing).toContain('heroImage: manifestImages.hero');
    expect(listing).toContain('heroImage={featuredPostImages.hero}');
    expect(article).toContain('backgroundImageSrc={heroSrc}');
    expect(article).toContain('src={heroSrc}');
  });
});
