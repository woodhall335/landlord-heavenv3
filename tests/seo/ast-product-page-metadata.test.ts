import { describe, expect, it } from 'vitest';
import { metadata } from '@/app/(marketing)/products/ast/page';

const asText = (value: unknown): string =>
  typeof value === 'string' ? value : value?.toString?.() ?? '';

describe('/products/ast metadata', () => {
  it('uses the refreshed title and description positioning', () => {
    expect(asText(metadata.title)).toBe(
      'Choose the Right England Agreement Type | Standard, Premium, Student, HMO and Lodger',
    );

    expect(asText(metadata.description)).toContain('Compare the five England agreement routes');
    expect(asText(metadata.description)).toContain('Standard, Premium, Student, HMO / Shared House, and Lodger');
    expect(asText(metadata.description)).toContain('England');
    expect(asText(metadata.description)).not.toContain('ensure legal compliance');
  });

  it('uses the refreshed Open Graph positioning', () => {
    const openGraph = metadata.openGraph ?? {};

    expect(asText(openGraph.title)).toBe(
      'Choose the Right England Agreement Type | Standard, Premium, Student, HMO and Lodger',
    );
    expect(asText(openGraph.description)).toContain('Standard, Premium, Student, HMO / Shared House, and Lodger');
    expect(asText(openGraph.description)).toContain('England agreement type');
  });

  it('keeps the keywords focused on route selection rather than broad head terms', () => {
    const keywords = metadata.keywords ?? [];
    const text = Array.isArray(keywords) ? keywords.join(' ') : asText(keywords);

    expect(text).toContain('england agreement types');
    expect(text).toContain('assured periodic tenancy agreement england');
    expect(text).not.toContain('tenancy contract');
  });
});
