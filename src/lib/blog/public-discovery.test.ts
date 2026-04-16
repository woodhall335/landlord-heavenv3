import { describe, expect, it } from 'vitest';
import { getBlogSeoConfig } from './seo';
import {
  getPublicBlogRegions,
  isPublicBlogDiscoveryRegion,
} from './categories';
import { getPublicTopicHubs } from './topic-hubs';
import type { BlogPost } from './types';

const buildPost = (slug: string): BlogPost => ({
  slug,
  title: 'Section 8 notice guide',
  description: 'Landlord guide to serving a Section 8 notice correctly.',
  metaDescription: 'Landlord guide to serving a Section 8 notice correctly in the right route.',
  date: '2026-04-01',
  readTime: '6 min read',
  wordCount: 1200,
  category: 'Eviction',
  tags: ['Section 8'],
  author: {
    name: 'Landlord Heaven',
    role: 'Editorial team',
  },
  heroImage: '/images/blog/section-8-guide.png',
  heroImageAlt: 'Section 8 paperwork',
  showUrgencyBanner: false,
  tableOfContents: [],
  relatedPosts: [],
  targetKeyword: 'section 8 notice',
  secondaryKeywords: ['eviction notice england'],
  content: null,
});

describe('public blog discovery', () => {
  it('limits public regions and topic hubs to England-led discovery surfaces', () => {
    expect(getPublicBlogRegions()).toEqual(['england']);
    expect(getPublicTopicHubs()).toEqual([
      'eviction-guides',
      'rent-arrears',
      'section-8',
      'landlord-compliance',
    ]);
  });

  it('keeps England and general blog posts indexable', () => {
    expect(isPublicBlogDiscoveryRegion(null)).toBe(true);
    expect(isPublicBlogDiscoveryRegion('england')).toBe(true);
    expect(getBlogSeoConfig(buildPost('england-section-8-guide'), 'england').robots).toBe(
      'index,follow'
    );
    expect(getBlogSeoConfig(buildPost('section-8-guide'), null).robots).toBe('index,follow');
  });

  it('noindexes non-England regional and uk-wide blog discovery posts', () => {
    expect(isPublicBlogDiscoveryRegion('wales')).toBe(false);
    expect(isPublicBlogDiscoveryRegion('scotland')).toBe(false);
    expect(isPublicBlogDiscoveryRegion('northern-ireland')).toBe(false);
    expect(isPublicBlogDiscoveryRegion('uk')).toBe(false);

    expect(getBlogSeoConfig(buildPost('wales-section-8-guide'), 'wales').robots).toBe(
      'noindex,follow'
    );
    expect(getBlogSeoConfig(buildPost('uk-section-8-guide'), 'uk').robots).toBe(
      'noindex,follow'
    );
  });
});
