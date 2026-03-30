import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { metadata as moneyClaimMetadata } from '@/app/money-claim/page';

const asText = (value: unknown): string =>
  typeof value === 'string' ? value : value?.toString?.() ?? '';

describe('money claim metadata', () => {
  it('positions the owner page as the broad England landlord claim hub', () => {
    expect(asText(moneyClaimMetadata.title)).toBe('Money Claim for Landlords (England) - Example & Guide');
    expect(asText(moneyClaimMetadata.description)).toContain('England landlord money claim example');
    expect(asText(moneyClaimMetadata.alternates?.canonical)).toContain('/money-claim');
  });

  it('uses webpage and faq schema without product-first framing on the owner page', () => {
    const content = readFileSync(join(process.cwd(), 'src/app/money-claim/page.tsx'), 'utf8');

    expect(content).toContain('faqPageSchema(');
    expect(content).toContain('breadcrumbSchema([');
    expect(content).toContain("'@type': 'WebPage'");
    expect(content).not.toContain('AggregateOffer');
    expect(content).not.toContain("'@type': 'Product'");
  });
});
