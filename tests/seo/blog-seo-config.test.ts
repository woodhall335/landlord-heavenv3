import { describe, expect, it } from 'vitest';
import { getBlogSeoConfig } from '@/lib/blog/seo';
import type { BlogPost } from '@/lib/blog/types';

const basePost: BlogPost = {
  slug: 'section-21-guide',
  title: 'What is a Section 21 notice?',
  description: 'Learn what a Section 21 notice is and how it works.',
  metaDescription: 'Learn what a Section 21 notice is and how it works.',
  date: '2024-01-01',
  readTime: '5 min',
  wordCount: 800,
  category: 'guides',
  tags: ['eviction'],
  author: {
    name: 'Test Author',
    role: 'Editor',
  },
  heroImage: '/images/test.jpg',
  heroImageAlt: 'Test',
  showUrgencyBanner: false,
  tableOfContents: [],
  relatedPosts: [],
  targetKeyword: 'section 21 notice',
  secondaryKeywords: [],
  content: null,
};

describe('getBlogSeoConfig', () => {
  it('keeps informational posts indexable even with head terms', () => {
    const seoConfig = getBlogSeoConfig(basePost, 'england');

    expect(seoConfig.robots).toBe('index,follow');
    expect(seoConfig.isIndexable).toBe(true);
  });

  it('respects explicit noindex metadata', () => {
    const seoConfig = getBlogSeoConfig({ ...basePost, noindex: true } as BlogPost, 'england');

    expect(seoConfig.robots).toBe('noindex,follow');
    expect(seoConfig.isIndexable).toBe(false);
  });

  it('avoids Wales money-claim labeling or links for money claim keywords', () => {
    const seoConfig = getBlogSeoConfig(
      {
        ...basePost,
        slug: 'wales-money-claim-guide',
        title: 'How to use money claim online (MCOL)',
        targetKeyword: 'money claim online',
      },
      'wales'
    );

    expect(seoConfig.pillarLink.href).not.toContain('money-claim');
    expect(seoConfig.supportingLinks.some((link) => link.href === '/products/money-claim')).toBe(false);
    expect(seoConfig.pillarLink.label.toLowerCase()).not.toContain('wales rent arrears');
  });
});
