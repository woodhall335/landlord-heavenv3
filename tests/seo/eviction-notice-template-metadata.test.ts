import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { metadata as noticeMetadata } from '@/app/eviction-notice-template/page';

const asText = (value: unknown): string =>
  typeof value === 'string' ? value : value?.toString?.() ?? '';

describe('eviction notice template metadata', () => {
  it('positions the owner page as the England-first template hub', () => {
    expect(asText(noticeMetadata.title)).toBe('Eviction Notice Template (England) - Example & Guide');
    expect(asText(noticeMetadata.description)).toContain('England eviction notice example');
    expect(asText(noticeMetadata.alternates?.canonical)).toContain('/eviction-notice-template');
  });

  it('uses webpage and faq schema without product-first framing on the owner page', () => {
    const content = readFileSync(
      join(process.cwd(), 'src/app/eviction-notice-template/page.tsx'),
      'utf8'
    );

    expect(content).toContain("faqPageSchema(");
    expect(content).toContain("breadcrumbSchema([");
    expect(content).toContain("'@type': 'WebPage'");
    expect(content).not.toContain('AggregateOffer');
    expect(content).not.toContain("'@type': 'Product'");
  });
});
