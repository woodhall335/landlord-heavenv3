import { describe, expect, it } from 'vitest';
import { metadata } from '@/app/(marketing)/products/ast/page';

const asText = (value: unknown): string =>
  typeof value === 'string' ? value : value?.toString?.() ?? '';

describe('/products/ast metadata', () => {
  it('uses the refreshed title and description positioning', () => {
    expect(asText(metadata.title)).toBe(
      'Assured Periodic Tenancy Agreement for England | Updated for 1 May 2026',
    );

    expect(asText(metadata.description)).toContain('Assured Periodic Tenancy Agreement for England');
    expect(asText(metadata.description)).toContain('1 May 2026');
    expect(asText(metadata.description)).toContain('AST');
    expect(asText(metadata.description)).toContain('Wales, Scotland, and Northern Ireland');
    expect(asText(metadata.description)).not.toContain('ensure legal compliance');
  });

  it('uses the refreshed Open Graph positioning', () => {
    const openGraph = metadata.openGraph ?? {};

    expect(asText(openGraph.title)).toBe(
      'Assured Periodic Tenancy Agreement for England | Updated for 1 May 2026',
    );
    expect(asText(openGraph.description)).toContain('Standard and Premium');
    expect(asText(openGraph.description)).toContain('1 May 2026');
    expect(asText(openGraph.description)).toContain('AST');
  });

  it('keeps AST capture in keywords without overclaiming', () => {
    const keywords = metadata.keywords ?? [];
    const text = Array.isArray(keywords) ? keywords.join(' ') : asText(keywords);

    expect(text).toContain('ast agreement template');
    expect(text).toContain('assured periodic tenancy agreement england');
  });
});
