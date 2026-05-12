import { describe, expect, it } from 'vitest';
import { generateMetadata } from '@/app/(marketing)/blog/[slug]/page';
import { getCanonicalUrl } from '@/lib/seo';

describe('blog metadata', () => {
  it('sets canonical, og:url, and robots for blog posts', async () => {
    const slug = 'england-assured-shorthold-tenancy-guide';
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug }),
    });

    const expectedCanonical = getCanonicalUrl(`/blog/${slug}`);

    expect(metadata.alternates?.canonical).toBe(expectedCanonical);
    expect(metadata.openGraph?.url).toBe(expectedCanonical);
    expect(metadata.robots).toBe('index,follow');
  });

  it.each([
    'scotland-eviction-ground-1',
    'wales-deposit-protection',
    'uk-fire-safety-landlords',
  ])('keeps regional and uk-wide editorial posts indexable: %s', async (slug) => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug }),
    });

    expect(metadata.alternates?.canonical).toBe(getCanonicalUrl(`/blog/${slug}`));
    expect(metadata.robots).toBe('index,follow');
  });
});
