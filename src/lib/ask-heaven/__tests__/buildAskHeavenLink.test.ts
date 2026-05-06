import { describe, expect, it } from 'vitest';

import { buildAskHeavenLink } from '@/lib/ask-heaven/buildAskHeavenLink';

describe('buildAskHeavenLink', () => {
  it('keeps public editorial Ask Heaven CTAs on the clean canonical hub', () => {
    expect(
      buildAskHeavenLink({
        source: 'blog',
        topic: 'eicr',
        prompt: 'Do landlords need an EICR and how often?',
        utm_campaign: 'uk-electrical-safety-guide',
      })
    ).toBe('/ask-heaven');
  });

  it('removes tracking-only Ask Heaven query strings', () => {
    expect(buildAskHeavenLink({ source: 'footer' })).toBe('/ask-heaven');
  });

  it('keeps product-page context when it is useful for the app experience', () => {
    expect(
      buildAskHeavenLink({
        source: 'product_page',
        topic: 'eviction',
        product: 'notice_only',
      })
    ).toBe('/ask-heaven?src=product_page&topic=eviction&product=notice_only');
  });
});
