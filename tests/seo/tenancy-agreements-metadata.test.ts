import { describe, expect, it } from 'vitest';
import { metadata as englandMetadata } from '@/app/tenancy-agreements/england/page';
import { metadata as walesMetadata } from '@/app/tenancy-agreements/wales/page';
import { metadata as scotlandMetadata } from '@/app/tenancy-agreements/scotland/page';
import { metadata as northernIrelandMetadata } from '@/app/tenancy-agreements/northern-ireland/page';

const asText = (value: unknown): string =>
  typeof value === 'string' ? value : value?.toString?.() ?? '';

describe('tenancy agreements metadata', () => {
  it('includes jurisdiction terms and 2026 in titles', () => {
    const titles = [
      asText(englandMetadata.title),
      asText(walesMetadata.title),
      asText(scotlandMetadata.title),
      asText(northernIrelandMetadata.title),
    ];

    titles.forEach((title) => {
      expect(title).toContain('2026');
      expect(title).toContain('£9.99');
    });

    expect(asText(englandMetadata.title)).toContain('AST');
    expect(asText(englandMetadata.title)).toContain('England');
    expect(asText(walesMetadata.title)).toContain('Occupation Contract');
    expect(asText(walesMetadata.title)).toContain('Wales');
    expect(asText(scotlandMetadata.title)).toContain('PRT');
    expect(asText(scotlandMetadata.title)).toContain('Scotland');
    expect(asText(northernIrelandMetadata.title)).toContain('Northern Ireland');
  });

  it('mentions jurisdictions in descriptions', () => {
    const descriptions = [
      asText(englandMetadata.description),
      asText(walesMetadata.description),
      asText(scotlandMetadata.description),
      asText(northernIrelandMetadata.description),
    ];

    descriptions.forEach((description) => {
      expect(description).toContain('2026');
    });

    expect(asText(englandMetadata.description)).toContain('England');
    expect(asText(walesMetadata.description)).toContain('Wales');
    expect(asText(scotlandMetadata.description)).toContain('Scotland');
    expect(asText(northernIrelandMetadata.description)).toContain('Northern Ireland');
  });
});
