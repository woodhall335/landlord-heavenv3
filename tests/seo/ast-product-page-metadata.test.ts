import { describe, expect, it } from 'vitest';
import { metadata } from '@/app/products/ast/page';

const asText = (value: unknown): string =>
  typeof value === 'string' ? value : value?.toString?.() ?? '';

describe('/products/ast metadata', () => {
  it('uses the England tenancy comparison positioning for landlord intent', () => {
    expect(asText(metadata.title)).toBe(
      'England Tenancy Agreements | Compare 5 Landlord Options',
    );

    expect(asText(metadata.description)).toContain(
      'Compare Standard, Premium, Student, HMO/shared-house and Lodger',
    );
    expect(asText(metadata.description)).toContain('England');
    expect(asText(metadata.description)).toContain(
      'Choose the right agreement, preview the documents and create online',
    );
  });

  it('uses matching Open Graph positioning for the same broad tenancy theme', () => {
    const openGraph = metadata.openGraph ?? {};

    expect(asText(openGraph.title)).toBe(
      'England Tenancy Agreements | Compare 5 Landlord Options',
    );
    expect(asText(openGraph.description)).toContain('five England landlord agreements');
    expect(asText(openGraph.description)).toContain('England');
  });

  it('keeps the keywords focused on England tenancy agreement comparison intent', () => {
    const keywords = metadata.keywords ?? [];
    const text = Array.isArray(keywords) ? keywords.join(' ') : asText(keywords);

    expect(text).toContain('tenancy agreement england');
    expect(text).toContain('landlord tenancy agreement england');
    expect(text).toContain('standard tenancy agreement england');
  });
});
