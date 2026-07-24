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

  it('keeps form wording when deconflicting commercial titles', () => {
    const seoConfig = getBlogSeoConfig(
      {
        ...basePost,
        slug: 'section-21-form-6a-template',
        title: 'Section 21 Form 6A template',
        targetKeyword: 'section 21 notice form 6a',
      },
      'england'
    );

    expect(seoConfig.metaTitle).toContain('Form 6A');
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

  it('does not truncate a long title on an opening parenthesis', () => {
    const seoConfig = getBlogSeoConfig(
      {
        ...basePost,
        slug: 'how-to-write-letter-before-action-unpaid-rent',
        title: 'How to Write a Letter Before Action for Unpaid Rent (2026 Template)',
      },
      null,
    );

    expect(seoConfig.metaTitle).toBe('How to Write a Letter Before Action for Unpaid Rent Guide');
  });

  it('normalizes whitespace before a closing parenthesis', () => {
    const seoConfig = getBlogSeoConfig(
      {
        ...basePost,
        slug: 'bailiff-eviction-day-what-to-expect',
        title: 'Bailiff Eviction Day - What to Expect (England Guide 2026)',
      },
      'england',
    );

    expect(seoConfig.metaTitle).toBe('Bailiff Eviction Day - What to Expect (England Guide)');
  });
});
