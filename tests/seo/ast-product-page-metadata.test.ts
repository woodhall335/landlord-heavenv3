import { describe, expect, it } from 'vitest';
import { metadata } from '@/app/(marketing)/products/ast/page';

const asText = (value: unknown): string =>
  typeof value === 'string' ? value : value?.toString?.() ?? '';

describe('/products/ast metadata', () => {
  it('uses the England tenancy comparison positioning for landlord intent', () => {
    expect(asText(metadata.title)).toBe(
      'Tenancy Agreement England | Compare Standard, Premium, Student, HMO and Lodger',
    );

    expect(asText(metadata.description)).toContain(
      'Choose Standard, Premium, Student, HMO / Shared House, or Lodger',
    );
    expect(asText(metadata.description)).toContain('England');
    expect(asText(metadata.description)).toContain(
      'Compare and start the right England tenancy agreement',
    );
  });

  it('uses matching Open Graph positioning for the same broad tenancy theme', () => {
    const openGraph = metadata.openGraph ?? {};

    expect(asText(openGraph.title)).toBe(
      'Tenancy Agreement England | Compare Standard, Premium, Student, HMO and Lodger',
    );
    expect(asText(openGraph.description)).toContain('Standard, Premium, Student, HMO / Shared House, and Lodger');
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
