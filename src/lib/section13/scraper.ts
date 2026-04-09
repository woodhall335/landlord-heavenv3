import { maybeNormalizeUkPostcode, getDomainFromUrl } from './postcode';
import { buildComparableFromPartial } from './server';
import type { Section13Comparable } from './types';

const RIGHTMOVE_PROXY_ENDPOINTS = [
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?',
];

interface ScrapeResult {
  comparables: Section13Comparable[];
  source: 'proxy' | 'puppeteer' | 'demo';
  summary: string;
}

function buildRightmoveUrl(postcode: string, bedrooms: number): string {
  const query = new URLSearchParams({
    searchLocation: postcode,
    bedrooms: String(bedrooms),
    radius: '0.5',
  });

  return `https://www.rightmove.co.uk/property-to-rent/find.html?${query.toString()}`;
}

function extractFromHtml(html: string, postcode: string, bedrooms: number): Section13Comparable[] {
  const results: Section13Comparable[] = [];
  const pattern =
    /"displayAddress":"([^"]+)".+?"propertySubType":"([^"]*)".+?"bedrooms":(\d+).+?"rent":\{"amount":(\d+)[^}]*\}.+?"listingUpdate":{"listingUpdateReason":"([^"]*)","listingUpdateDate":"([^"]*)"/g;

  let match: RegExpExecArray | null;
  while ((match = pattern.exec(html)) && results.length < 10) {
    const [, address, propertyType, bedroomCount, amount, sourceDateKindText, sourceDateValue] = match;
    const normalizedBedrooms = Number(bedroomCount);
    if (Number.isFinite(bedrooms) && normalizedBedrooms !== bedrooms) {
      continue;
    }

    const sourceDateKind =
      /added|first/i.test(sourceDateKindText) ? 'published' :
      /reduced|updated/i.test(sourceDateKindText) ? 'reduced_or_updated' :
      'unknown';

    results.push(
      buildComparableFromPartial(
        {
          source: 'scraped',
          sourceUrl: buildRightmoveUrl(postcode, bedrooms),
          sourceDomain: 'www.rightmove.co.uk',
          sourceDateKind,
          sourceDateValue: sourceDateValue || null,
          addressSnippet: address,
          propertyType: propertyType || null,
          postcodeRaw: postcode,
          postcodeNormalized: maybeNormalizeUkPostcode(postcode) || null,
          bedrooms: normalizedBedrooms,
          rawRentValue: Number(amount),
          rawRentFrequency: 'pcm',
          isManual: false,
          adjustments: [],
        },
        results.length
      )
    );
  }

  return results;
}

async function scrapeViaProxy(url: string, postcode: string, bedrooms: number): Promise<ScrapeResult | null> {
  for (const prefix of RIGHTMOVE_PROXY_ENDPOINTS) {
    const response = await fetch(`${prefix}${encodeURIComponent(url)}`, {
      headers: {
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0 Safari/537.36',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      continue;
    }

    const html = await response.text();
    const comparables = extractFromHtml(html, postcode, bedrooms);
    if (comparables.length > 0) {
      return {
        comparables,
        source: 'proxy',
        summary: `Imported ${comparables.length} comparable listings from Rightmove via proxy fetch.`,
      };
    }
  }

  return null;
}

async function scrapeViaPuppeteer(url: string, postcode: string, bedrooms: number): Promise<ScrapeResult | null> {
  const puppeteer = await import('puppeteer');
  const browser = await puppeteer.default.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0 Safari/537.36'
    );
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });
    const html = await page.content();
    const comparables = extractFromHtml(html, postcode, bedrooms);

    if (comparables.length === 0) {
      return null;
    }

    return {
      comparables,
      source: 'puppeteer',
      summary: `Imported ${comparables.length} comparable listings from Rightmove via browser scrape.`,
    };
  } finally {
    await browser.close();
  }
}

function buildDemoComparables(postcode: string, bedrooms: number): Section13Comparable[] {
  const baseRent = bedrooms >= 3 ? 1950 : bedrooms === 2 ? 1625 : 1350;

  return Array.from({ length: 6 }).map((_, index) =>
    buildComparableFromPartial(
      {
        source: 'manual_linked',
        sourceUrl: `https://www.rightmove.co.uk/demo-listing-${index + 1}`,
        sourceDomain: getDomainFromUrl('https://www.rightmove.co.uk') || 'www.rightmove.co.uk',
        sourceDateKind: 'published',
        sourceDateValue: new Date(Date.now() - index * 14 * 24 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 10),
        addressSnippet: `${index + 2} Example Road, ${postcode}`,
        propertyType: bedrooms >= 3 ? 'Terraced house' : 'Flat',
        postcodeRaw: postcode,
        postcodeNormalized: maybeNormalizeUkPostcode(postcode) || null,
        bedrooms,
        rawRentValue: baseRent + index * 45,
        rawRentFrequency: 'pcm',
        distanceMiles: Number((0.1 + index * 0.05).toFixed(2)),
        isManual: false,
        adjustments: [],
      },
      index
    )
  );
}

export async function scrapeRightmoveComparables(
  postcode: string,
  bedrooms: number
): Promise<ScrapeResult> {
  const normalizedPostcode = maybeNormalizeUkPostcode(postcode) || postcode.toUpperCase();
  const url = buildRightmoveUrl(normalizedPostcode, bedrooms);

  const proxyResult = await scrapeViaProxy(url, normalizedPostcode, bedrooms).catch(() => null);
  if (proxyResult) {
    return proxyResult;
  }

  const puppeteerResult = await scrapeViaPuppeteer(url, normalizedPostcode, bedrooms).catch(() => null);
  if (puppeteerResult) {
    return puppeteerResult;
  }

  const comparables = buildDemoComparables(normalizedPostcode, bedrooms);
  return {
    comparables,
    source: 'demo',
    summary:
      'Rightmove could not be scraped live, so a demo comparable set was loaded. Upload CSV results or replace these listings before relying on the final evidence pack.',
  };
}

