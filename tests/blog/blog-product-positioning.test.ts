import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { blogPosts } from '@/lib/blog/posts';
import { getBlogProductCta } from '@/lib/blog/product-cta-map';
import { getNextStepsCTAs } from '@/lib/blog/next-steps-cta';

const PRODUCT_HREF_PREFIXES = [
  '/products/notice-only',
  '/products/complete-pack',
  '/products/money-claim',
  '/products/ast',
  '/products/section-13-standard',
  '/products/section-13-defence',
  '/standard-tenancy-agreement',
  '/premium-tenancy-agreement',
  '/student-tenancy-agreement',
  '/hmo-shared-house-tenancy-agreement',
  '/lodger-agreement',
];

const PRODUCT_ACTION_LABEL = /^(Create my|Prepare my|Choose my|Create the|Prepare for)/;
const WEAK_PRODUCT_LABEL = /^(Start|Generate|Get|Open)\b/i;

function isProductHref(href: string) {
  return PRODUCT_HREF_PREFIXES.some((prefix) => href.startsWith(prefix));
}

describe('blog product positioning', () => {
  it('gives every blog page a natural product route after the information step', () => {
    expect(blogPosts.length).toBeGreaterThan(100);

    for (const post of blogPosts) {
      const cta = getBlogProductCta(post);
      const nextSteps = getNextStepsCTAs(post);
      const nextStepProducts = nextSteps.filter((step) => isProductHref(step.href));

      expect(isProductHref(cta.primaryProductHref), post.slug).toBe(true);
      expect(cta.heading, post.slug).toMatch(/\?|Problem|Tenant|Setting|Heading|Need|Ready/);
      expect(cta.intro, post.slug).toMatch(/\b(if|when|where|move|choose|turn|use|build|prepare)\b/i);
      expect(cta.ctaLabel, post.slug).toMatch(PRODUCT_ACTION_LABEL);
      expect(cta.ctaLabel, post.slug).not.toMatch(WEAK_PRODUCT_LABEL);

      expect(nextStepProducts.length, post.slug).toBeGreaterThanOrEqual(1);
      for (const step of nextStepProducts) {
        expect(step.label, `${post.slug} -> ${step.href}`).not.toMatch(WEAK_PRODUCT_LABEL);
      }
    }
  });

  it('keeps shared blog bridge copy problem-first instead of generic start/generate language', () => {
    const files = [
      'src/components/blog/BlogStickySlots.tsx',
      'src/components/blog/NextSteps.tsx',
      'src/lib/blog/product-cta-map.ts',
      'src/lib/blog/product-reform-posts.tsx',
      'src/lib/blog/top30-upgrades.ts',
      'src/app/(marketing)/blog/page.tsx',
      'src/app/(marketing)/blog/[slug]/page.tsx',
    ];

    const bannedPhrases = [
      'Ready to generate your notice?',
      'Ready to start your complete pack?',
      'Generate an eviction notice',
      'Get the Complete Eviction Pack',
      'Generate your eviction notice',
      'Start notice-only service',
      'Start money-claim pack',
      'Start complete eviction pack',
      'Use complete pack for court-ready progression',
      'Product route',
      'Open {spec.productLabel}',
    ];

    for (const file of files) {
      const source = readFileSync(join(process.cwd(), file), 'utf8');
      for (const phrase of bannedPhrases) {
        expect(source, `${file} should not contain "${phrase}"`).not.toContain(phrase);
      }
    }
  });
});
