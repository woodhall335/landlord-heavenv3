import { afterEach, describe, expect, it, vi } from 'vitest';

import { scrapeRightmoveComparables } from '@/lib/section13/scraper';

function buildRightmoveHtml(properties: Array<Record<string, unknown>>): string {
  const payload = {
    props: {
      pageProps: {
        searchResults: {
          properties,
        },
      },
    },
  };

  return `<!doctype html><html><body><script id="__NEXT_DATA__" type="application/json">${JSON.stringify(payload)}</script></body></html>`;
}

function buildProperty(index: number, overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: 1000 + index,
    bedrooms: 2,
    displayAddress: `Flat ${index + 1}, LS1`,
    propertySubType: 'Flat',
    listingUpdate: {
      listingUpdateReason: 'Added today',
      listingUpdateDate: '2026-04-08',
    },
    price: {
      amount: 900 + index * 25,
      frequency: 'monthly',
      displayPrices: [
        {
          displayPrice: `£${900 + index * 25} pcm`,
          displayPriceQualifier: '',
        },
      ],
    },
    propertyUrl: `/properties/${1000 + index}#/?channel=RES_LET`,
    distance: 0.2 + index * 0.05,
    ...overrides,
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('section13 scraper', () => {
  it('parses comparables from __NEXT_DATA__ and uses the postcode outcode in the summary', async () => {
    const html = buildRightmoveHtml(
      Array.from({ length: 12 }, (_, index) =>
        buildProperty(index, {
          bedrooms: index < 10 ? 2 : 3,
          displayAddress: `Comparable ${index + 1}, Leeds`,
        })
      )
    );

    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      text: async () => html,
    } as any);

    const result = await scrapeRightmoveComparables('LS1 4AP', 2);

    expect(result.source).toBe('direct');
    expect(result.comparables).toHaveLength(10);
    expect(result.summary).toContain('(LS1 outcode search)');
    expect(result.comparables.every((item) => item.source === 'scraped')).toBe(true);
    expect(result.comparables[0].bedrooms).toBe(2);
  });

  it('falls back to rent text parsing and weekly frequency when amount is not present', async () => {
    const html = buildRightmoveHtml([
      buildProperty(0, {
        bedrooms: 1,
        price: {
          amount: null,
          displayPrices: [
            {
              displayPrice: '£1,150 pw',
              displayPriceQualifier: '',
            },
          ],
        },
      }),
    ]);

    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      text: async () => html,
    } as any);

    const result = await scrapeRightmoveComparables('SW1A 1AA', 1);

    expect(result.source).toBe('direct');
    expect(result.comparables).toHaveLength(1);
    expect(result.comparables[0].rawRentValue).toBe(1150);
    expect(result.comparables[0].rawRentFrequency).toBe('ppw');
  });
});
