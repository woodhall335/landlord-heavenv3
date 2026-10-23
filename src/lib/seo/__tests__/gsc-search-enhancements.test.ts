import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

import { GET as downloadInformationSheet } from '@/app/downloads/renters-rights-act-information-sheet-2026/route';
import { getBlogPost } from '@/lib/blog/posts';
import { getBlogSeoConfig } from '@/lib/blog/seo';
import { getPostRegion } from '@/lib/blog/categories';
import { websiteSchema } from '@/lib/seo/structured-data';

describe('GSC search enhancement regressions', () => {
  it('publishes a stable site name and alternate brand name', () => {
    expect(websiteSchema()).toMatchObject({
      '@type': 'WebSite',
      name: 'Landlord Heaven',
      alternateName: 'LandlordHeaven',
      url: 'https://landlordheaven.co.uk',
    });
  });

  it('keeps the downloadable PDF out of the index and points crawlers to its landing page', async () => {
    const response = await downloadInformationSheet();

    expect(response.headers.get('x-robots-tag')).toBe('noindex, nofollow, noarchive');
    expect(response.headers.get('link')).toBe(
      '<https://landlordheaven.co.uk/renters-rights-act-information-sheet-2026>; rel="canonical"'
    );
  });

  it('separates the MCOL research article from the claim-preparation owner page', () => {
    const post = getBlogPost('england-money-claim-online');
    expect(post).toBeDefined();

    const config = getBlogSeoConfig(post!, getPostRegion(post!.slug));
    expect(config.metaTitle).toContain('MCOL Process');
    expect(config.metaDescription).toContain('Researching Money Claim Online');
    expect(config.canonicalPath).toBe('/blog/england-money-claim-online');
  });

  it('backs the priority legal guides with current official sources', () => {
    const prioritySlugs = [
      'how-long-does-eviction-take-uk',
      'england-section-8-ground-10-11',
      'england-section-8-ground-1',
      'england-section-8-ground-12',
      'bailiff-eviction-day-what-to-expect',
      'england-county-court-forms',
      'england-money-claim-online',
    ];

    prioritySlugs.forEach((slug) => {
      const post = getBlogPost(slug);
      expect(post?.sources?.length, slug).toBeGreaterThan(0);
      expect(post?.sources?.every((source) => source.url.startsWith('https://')), slug).toBe(true);
    });
  });

  it('keeps the high-traffic tools linked to their supporting guide clusters', () => {
    const rentTool = readFileSync(
      path.join(process.cwd(), 'src', 'app', 'tools', 'rent-arrears-calculator', 'page.tsx'),
      'utf8',
    );
    const hmoTool = readFileSync(
      path.join(process.cwd(), 'src', 'app', 'tools', 'hmo-license-checker', 'page.tsx'),
      'utf8',
    );
    const blogRoute = readFileSync(
      path.join(process.cwd(), 'src', 'app', '(marketing)', 'blog', '[slug]', 'page.tsx'),
      'utf8',
    );

    expect(rentTool).toContain("href: '/rent-arrears-landlord-guide'");
    expect(rentTool).toContain("href: '/money-claim'");
    expect(hmoTool).toContain("href: '/hmo-shared-house-tenancy-agreement'");
    expect(hmoTool).toContain("href: '/blog/landlord-compliance'");
    expect(hmoTool).not.toContain("It's at least 3 storeys high");
    expect(blogRoute).toContain("'@type': 'CollectionPage'");
    expect(blogRoute).toContain("'@type': 'ItemList'");
  });
});
