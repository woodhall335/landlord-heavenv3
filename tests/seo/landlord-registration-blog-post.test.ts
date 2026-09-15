import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { getBlogPost } from '@/lib/blog/posts';
import { getBlogPostManualSeoKeywords } from '@/lib/blog/manual-seo-keywords';
import { getBlogProductCta } from '@/lib/blog/product-cta-map';
import sitemap from '@/app/sitemap';

const slug = 'new-landlord-registration-requirements-england-uk-regions';
const source = fs.readFileSync(path.join(process.cwd(), 'src/lib/blog/landlord-registration-post.tsx'), 'utf8');

describe('new landlord registration requirements article', () => {
  it('publishes a current, long-form post with structured navigation and official sources', () => {
    const post = getBlogPost(slug);
    expect(post).toBeDefined();
    expect(post?.date).toBe('2026-09-15');
    expect(post?.wordCount).toBeGreaterThanOrEqual(2000);
    expect(post?.tableOfContents.length).toBeGreaterThanOrEqual(10);
    expect(post?.sources?.length).toBeGreaterThanOrEqual(7);
    expect(post?.title).toBe('New Landlord Registration Requirements: 2026 UK Guide');
    expect(post?.showUrgencyBanner).toBe(false);
    expect(post?.metaDescription.length).toBeGreaterThanOrEqual(120);
    expect(post?.metaDescription.length).toBeLessThanOrEqual(160);
    expect(getBlogPostManualSeoKeywords(post!)).toEqual(
      expect.arrayContaining([
        'new landlord registration requirements',
        'England landlord registration 2026',
        'private rented sector database registration',
      ])
    );
  });

  it('states the confirmed England rollout dates and distinguishes every UK nation', () => {
    expect(source).toContain('15 December 2026');
    expect(source).toContain('14 November 2027');
    expect(source).toContain('West Midlands');
    for (const nation of ['England', 'Wales', 'Scotland', 'Northern Ireland']) {
      expect(source).toContain(nation);
    }
  });

  it('uses custom illustrations and natural links to relevant products', () => {
    const illustrations = [
      'england-landlord-registration-preparation-2026.webp',
      'england-registration-regional-rollout-2026.webp',
      'landlord-registration-compliance-path-2026.webp',
      'landlord-registration-uk-regions-2026.webp',
      'cross-border-landlord-registration-portfolio-2026.webp',
    ];
    for (const illustration of illustrations) {
      expect(source).toContain(`/images/blog/${illustration}`);
      expect(fs.existsSync(path.join(process.cwd(), 'public/images/blog', illustration))).toBe(true);
    }
    for (const href of ['/products/ast', '/products/notice-only', '/products/complete-pack', '/products/rent-increase', '/products/money-claim']) {
      expect(source).toContain(`href=\"${href}\"`);
    }
    expect(getBlogProductCta(getBlogPost(slug)!)).toMatchObject({
      primaryProductHref: '/products/ast',
      usedDefault: false,
    });
  });

  it('is promoted on the blog hub and included in the generated sitemap', async () => {
    const hub = fs.readFileSync(path.join(process.cwd(), 'src/app/(marketing)/blog/page.tsx'), 'utf8');
    expect(hub).toContain(`/blog/${slug}`);
    expect(hub).toContain('Read the registration guide');

    const paths = (await sitemap()).map((entry) => new URL(entry.url).pathname);
    expect(paths).toContain(`/blog/${slug}`);
  });

  it('inherits the universal blog hero from the shared article page', () => {
    const articlePage = fs.readFileSync(path.join(process.cwd(), 'src/app/(marketing)/blog/[slug]/page.tsx'), 'utf8');
    expect(articlePage).toContain('<UniversalHero');
    expect(articlePage).toContain('backgroundImageSrc={heroSrc}');
    expect(articlePage).toContain('title={post.title}');
    expect(articlePage).toContain('verticalAlign="top"');
    expect(articlePage).toContain('titleSize="compact"');
    expect(articlePage).toContain('Reviewed by {post.reviewer.name}');
    expect(articlePage).toContain('preserveOpeningParagraph={isBespokeRegistrationGuide}');
  });
});
