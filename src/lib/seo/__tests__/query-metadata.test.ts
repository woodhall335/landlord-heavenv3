import { describe, expect, it } from 'vitest';

import { generateMetadata as generateAskHeavenMetadata } from '@/app/ask-heaven/page';
import { generateMetadata as generateBlogMetadata } from '@/app/(marketing)/blog/page';

describe('query variant metadata', () => {
  it('noindexes Ask Heaven query variants while keeping the clean canonical', async () => {
    const metadata = await generateAskHeavenMetadata({
      searchParams: {
        src: 'seo',
        topic: 'eicr',
        q: 'Do landlords need an EICR and how often?',
      },
    });

    expect(metadata.robots).toBe('noindex, follow');
    expect(metadata.alternates?.canonical).toBe('https://landlordheaven.co.uk/ask-heaven');
  });

  it('keeps the clean Ask Heaven hub indexable', async () => {
    const metadata = await generateAskHeavenMetadata();

    expect(metadata.robots).toBe('index, follow');
    expect(metadata.alternates?.canonical).toBe('https://landlordheaven.co.uk/ask-heaven');
  });

  it('noindexes blog query variants while keeping the clean canonical', async () => {
    const metadata = await generateBlogMetadata({
      searchParams: {
        view: 'latest',
      },
    });

    expect(metadata.robots).toEqual({ index: false, follow: true });
    expect(metadata.alternates?.canonical).toBe('https://landlordheaven.co.uk/blog');
  });
});
