import { describe, expect, it } from 'vitest';
import { metadata } from '@/app/renters-rights-act-information-sheet-2026/page';

const asText = (value: unknown): string =>
  typeof value === 'string' ? value : value?.toString?.() ?? '';

describe("renters' rights information sheet metadata", () => {
  it('uses SEO metadata for free PDF download intent', () => {
    expect(asText(metadata.title)).toBe(
      "Renters' Rights Act Information Sheet 2026 | Free PDF Download"
    );
    expect(asText(metadata.description)).toContain('England');
    expect(asText(metadata.description)).toContain('free');
    expect(asText(metadata.description)).toContain('1 May 2026');
    expect(asText(metadata.description)).toContain('31 May 2026');

    const keywords = metadata.keywords ?? [];
    const keywordText = Array.isArray(keywords) ? keywords.join(' ') : asText(keywords);
    expect(keywordText).toContain('renters rights act information sheet 2026');
    expect(keywordText).toContain('renters rights information sheet pdf');
  });

  it('includes canonical and open graph metadata', () => {
    expect(asText(metadata.alternates?.canonical)).toContain(
      '/renters-rights-act-information-sheet-2026'
    );
    expect(asText(metadata.openGraph?.title)).toContain('Free PDF Download');
    expect(asText(metadata.openGraph?.description)).toContain('31 May 2026');
  });
});
