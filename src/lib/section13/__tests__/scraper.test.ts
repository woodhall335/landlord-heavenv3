import { afterEach, describe, expect, it, vi } from 'vitest';

import { scrapeLiveComparables } from '@/lib/section13/scraper';

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

function buildRightmoveProperty(
  index: number,
  overrides: Record<string, unknown> = {}
): Record<string, unknown> {
  return {
    id: 1000 + index,
    bedrooms: 2,
    displayAddress: `Comparable ${index + 1}, Leeds`,
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
          displayPrice: `&#xA3;${900 + index * 25} pcm`,
          displayPriceQualifier: '',
        },
      ],
    },
    propertyUrl: `/properties/${1000 + index}#/?channel=RES_LET`,
    propertyImages: {
      images: [
        {
          srcUrl: `https://media.rightmove.co.uk/${1000 + index}.jpg`,
        },
      ],
    },
    distance: 0.2 + index * 0.05,
    ...overrides,
  };
}

function buildOpenRentCard(
  index: number,
  listingId: number,
  title: string,
  monthlyRent: number
): string {
  return `
<a href="/property-to-rent/leeds/test-${listingId}/${listingId}" class="pli search-property-card text-decoration-none" id="p${index}" m_n="${index}" sortorder="${index}" style="">
  <div class="card overflow-hidden">
    <div class="grid gap-0">
      <div class="g-col-12 g-col-md-4 g-col-lg-3 rounded-start position-relative">
        <div class="or-swiper swiper or-swiper-pagination--on-media or-swiper-navigation--minimal" data-listing-id="${listingId}" data-loaded="false">
          <div class="swiper-wrapper">
            <div class="swiper-slide w-100 h-100">
              <img class="propertyPic w-100 h-100 object-fit-cover d-block" src="//imagescdn.openrent.co.uk/listings/${listingId}/photo.jpg" alt="${title}" />
            </div>
          </div>
        </div>
      </div>
      <div class="g-col-12 g-col-md-8 g-col-lg-9 card-body d-flex flex-column gap-2 fs-body-small-1">
        <div class="d-flex align-items-center gap-4 flex-wrap">
          <div class="pim d-flex align-items-baseline gap-1">
            <span class="fs-4 fw-medium text-primary">&#xA3;${monthlyRent}</span>
            <span class="text-body-secondary">per month</span>
          </div>
          <div class="ms-auto d-none d-lg-flex align-items-center gap-1 text-body-tertiary"><span>Last updated around 1 week ago</span></div>
        </div>
        <div class="fw-medium text-primary fs-3">${title}</div>
      </div>
    </div>
  </div>
</a>`;
}

function buildOpenRentHtml(cards: Array<{ listingId: number; title: string; monthlyRent: number }>): string {
  const cardHtml = cards
    .map((card, index) => buildOpenRentCard(index, card.listingId, card.title, card.monthlyRent))
    .join('\n');
  const hoursLive = cards.map((_, index) => 24 * (index + 1)).join(',');
  const distances = cards.map((_, index) => `'0.${index + 4}'`).join(',');

  return `
<!doctype html>
<html>
  <body>
    ${cardHtml}
    <script>
      var hoursLive = [${hoursLive}];
      var PROPERTYLISTCOMMUTEORDISTANCE = [${distances}];
    </script>
  </body>
</html>`;
}

function mockFetchByUrl(handlers: Record<string, string>) {
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (input: any) => {
    const url = String(input);

    if (url.includes('rightmove')) {
      return {
        ok: true,
        text: async () => handlers.rightmove || '',
      } as any;
    }

    if (url.includes('openrent')) {
      return {
        ok: true,
        text: async () => handlers.openrent || '',
      } as any;
    }

    return {
      ok: false,
      text: async () => '',
    } as any;
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('section13 live comparable scraper', () => {
  it('parses Rightmove comparables and keeps the outcode in the summary', async () => {
    mockFetchByUrl({
      rightmove: buildRightmoveHtml(
        Array.from({ length: 10 }, (_, index) =>
          buildRightmoveProperty(index, {
            bedrooms: 2,
            displayAddress: `Comparable ${index + 1}, Leeds`,
          })
        )
      ),
      openrent: '<html><body>No cards</body></html>',
    });

    const result = await scrapeLiveComparables('LS1 4AP', 2);

    expect(result.success).toBe(true);
    if (!result.success) {
      throw new Error('Expected live comparable success');
    }

    expect(result.source).toBe('rightmove_live');
    expect(result.comparables).toHaveLength(10);
    expect(result.summary).toContain('(LS1 outcode search)');
    expect(result.comparables[0].source).toBe('scraped');
    expect(result.comparables[0].metadata?.imageUrl).toBe('https://media.rightmove.co.uk/1000.jpg');
  });

  it('does not preserve scraped zero-mile distances as precise evidence', async () => {
    mockFetchByUrl({
      rightmove: buildRightmoveHtml(
        Array.from({ length: 3 }, (_, index) =>
          buildRightmoveProperty(index, {
            bedrooms: 2,
            displayAddress: `Zero distance comparable ${index + 1}, Leeds`,
            distance: 0,
          })
        )
      ),
      openrent: '<html><body>No cards</body></html>',
    });

    const result = await scrapeLiveComparables('LS1 4AP', 2);

    expect(result.success).toBe(true);
    if (!result.success) {
      throw new Error('Expected live comparable success');
    }

    expect(result.comparables.every((item) => item.distanceMiles == null)).toBe(true);
  });

  it('merges OpenRent listings into the live comparable set with images and addresses', async () => {
    mockFetchByUrl({
      rightmove: buildRightmoveHtml([
        buildRightmoveProperty(0, {
          bedrooms: 2,
          displayAddress: 'Northern Street Apartments, LS1',
          price: { amount: 1200, frequency: 'monthly', displayPrices: [{ displayPrice: '&#xA3;1200 pcm' }] },
        }),
        buildRightmoveProperty(1, {
          bedrooms: 2,
          displayAddress: 'Blue Granary Wharf, LS1',
          price: { amount: 1280, frequency: 'monthly', displayPrices: [{ displayPrice: '&#xA3;1280 pcm' }] },
        }),
        buildRightmoveProperty(2, {
          bedrooms: 2,
          displayAddress: 'East Parade, LS1',
          price: { amount: 1325, frequency: 'monthly', displayPrices: [{ displayPrice: '&#xA3;1325 pcm' }] },
        }),
      ]),
      openrent: buildOpenRentHtml([
        { listingId: 2820106, title: '2 Bed Penthouse, Whitehall Quay, LS1', monthlyRent: 1750 },
        { listingId: 2872243, title: '2 Bed Flat, Wellington Street, LS1', monthlyRent: 1450 },
        { listingId: 2832997, title: '1 Bed Flat, Park Row Apartments, LS1', monthlyRent: 1150 },
      ]),
    });

    const result = await scrapeLiveComparables('LS1 4AP', 2);

    expect(result.success).toBe(true);
    if (!result.success) {
      throw new Error('Expected blended live comparable success');
    }

    expect(result.source).toBe('blended_live');
    expect(result.summary).toContain('Rightmove and OpenRent');
    expect(result.comparables.some((item) => item.sourceDomain === 'www.openrent.co.uk')).toBe(true);

    const openRentComparable = result.comparables.find(
      (item) => item.sourceDomain === 'www.openrent.co.uk'
    );
    expect(openRentComparable?.addressSnippet).toContain('Whitehall Quay');
    expect(openRentComparable?.metadata?.imageUrl).toBe(
      'https://imagescdn.openrent.co.uk/listings/2820106/photo.jpg'
    );
  });

  it('fails honestly when fewer than three live comparables are available', async () => {
    mockFetchByUrl({
      rightmove: buildRightmoveHtml([
        buildRightmoveProperty(0, {
          bedrooms: 2,
          displayAddress: 'Comparable 1, Leeds',
          price: { amount: 1200, frequency: 'monthly', displayPrices: [{ displayPrice: '&#xA3;1200 pcm' }] },
        }),
      ]),
      openrent: buildOpenRentHtml([
        { listingId: 2820106, title: '2 Bed Penthouse, Whitehall Quay, LS1', monthlyRent: 1750 },
      ]),
    });

    const result = await scrapeLiveComparables('LS1 4AP', 2);

    expect(result.success).toBe(false);
    if (result.success) {
      throw new Error('Expected insufficient live evidence failure');
    }

    expect(result.source).toBe('insufficient_live_evidence');
    expect(result.comparables).toHaveLength(2);
    expect(result.summary).toContain('We could only gather 2 live comparable listings');
    expect(result.reason).toBe('insufficient_live_comparables');
  });
});
