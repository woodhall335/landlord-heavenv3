import { describe, expect, it } from 'vitest';
import { metadata } from '@/app/(marketing)/products/ast/page';
import { PRODUCTS } from '@/lib/pricing/products';

const asText = (value: unknown): string =>
  typeof value === 'string' ? value : value?.toString?.() ?? '';

describe('/products/ast metadata', () => {
  it('uses the refreshed title and description positioning', () => {
    expect(asText(metadata.title)).toContain('Tenancy Agreements UK');
    expect(asText(metadata.title)).toContain('Standard or Premium by Jurisdiction');
    expect(asText(metadata.title)).toContain(PRODUCTS.ast_standard.displayPrice);

    expect(asText(metadata.description)).toContain('England, Wales, Scotland, or Northern Ireland');
    expect(asText(metadata.description)).toContain('Standard for straightforward lets');
    expect(asText(metadata.description)).toContain('Premium for more complex ones');
    expect(asText(metadata.description)).toContain('1 May 2026');
    expect(asText(metadata.description)).toContain('assured periodic framework');
  });

  it('uses the refreshed Open Graph positioning', () => {
    const openGraph = metadata.openGraph ?? {};

    expect(asText(openGraph.title)).toContain('Tenancy Agreements UK');
    expect(asText(openGraph.title)).toContain('The right agreement for each part of the UK');
    expect(asText(openGraph.description)).toContain('Standard and Premium routes');
    expect(asText(openGraph.description)).toContain('1 May 2026');
    expect(asText(openGraph.description)).toContain('assured periodic framework');
  });
});
