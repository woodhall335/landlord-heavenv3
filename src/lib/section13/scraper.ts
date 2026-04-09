import { maybeNormalizeUkPostcode, getDomainFromUrl } from './postcode';
import { buildComparableFromPartial } from './server';
import type { Section13Comparable, Section13SourceDateKind } from './types';

const RIGHTMOVE_PROXY_ENDPOINTS = [
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?',
];

const RIGHTMOVE_DOMAIN = 'www.rightmove.co.uk';
const MAX_COMPARABLES = 10;
const SCRAPE_HEADERS = {
  'user-agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0 Safari/537.36',
  'accept-language': 'en-GB,en;q=0.9',
};

interface ScrapeResult {
  comparables: Section13Comparable[];
  source: 'direct' | 'proxy' | 'puppeteer' | 'demo';
  summary: string;
}

interface ScrapeContext {
  postcode: string;
  bedrooms: number;
  pageUrl: string;
}

function getOutcode(postcode: string): string {
  const normalized = (maybeNormalizeUkPostcode(postcode) || postcode || '').trim().toUpperCase();
  const structuredMatch = normalized.match(/^([A-Z]{1,2}\d[A-Z\d]?)\s?\d[A-Z]{2}$/i);
  if (structuredMatch?.[1]) {
    return structuredMatch[1].toUpperCase();
  }

  if (normalized.includes(' ')) {
    return normalized.split(/\s+/)[0];
  }

  const compact = normalized.replace(/\s+/g, '');
  const outcodeMatch = compact.match(/^([A-Z]{1,2}\d[A-Z\d]?)/);

  if (outcodeMatch?.[1]) {
    return outcodeMatch[1];
  }

  const fallback = normalized.split(/\s+/)[0];
  return fallback || compact;
}

function buildRightmoveOutcodeUrl(postcode: string): string {
  const outcode = getOutcode(postcode);
  return `https://${RIGHTMOVE_DOMAIN}/property-to-rent/${outcode}.html`;
}

function extractNextDataJson(html: string): any | null {
  const match = html.match(
    /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/
  );
  if (!match?.[1]) {
    return null;
  }

  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}

function normalizeDate(value: unknown): string | null {
  if (!value) {
    return null;
  }

  const raw = String(value).trim();
  const isoMatch = raw.match(/\d{4}-\d{2}-\d{2}/);
  if (isoMatch?.[0]) {
    return isoMatch[0];
  }

  const ukMatch = raw.match(/\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/);
  if (ukMatch) {
    const [, day, month, year] = ukMatch;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString().slice(0, 10);
}

function inferSourceDateKind(reasonText: string): Section13SourceDateKind {
  if (/first/i.test(reasonText)) {
    return 'first_listed';
  }
  if (/added|new/i.test(reasonText)) {
    return 'published';
  }
  if (/reduced|updated|change/i.test(reasonText)) {
    return 'reduced_or_updated';
  }

  return 'unknown';
}

function parseRentAmountFromText(value: unknown): number | null {
  if (!value) {
    return null;
  }

  const match = String(value).replace(/,/g, '').match(/(\d+(?:\.\d+)?)/);
  if (!match?.[1]) {
    return null;
  }

  const parsed = Number(match[1]);
  return Number.isFinite(parsed) ? parsed : null;
}

function inferRentFrequency(value: unknown): 'pcm' | 'ppw' | 'monthly' | 'weekly' {
  const text = String(value || '').toLowerCase();
  if (/\bppw\b|\bpw\b|per week|weekly/.test(text)) {
    return 'ppw';
  }
  if (/\bpcm\b|per month|monthly/.test(text)) {
    return 'pcm';
  }

  return 'pcm';
}

function parseDistanceMiles(value: unknown): number | null {
  const numeric = Number(value);
  if (Number.isFinite(numeric)) {
    return Number(numeric.toFixed(2));
  }

  const fromText = parseRentAmountFromText(value);
  if (fromText == null) {
    return null;
  }

  return Number(fromText.toFixed(2));
}

function buildComparableFromRightmoveProperty(
  property: any,
  index: number,
  context: ScrapeContext
): Section13Comparable | null {
  const amountFromPrice =
    typeof property?.price?.amount === 'number' && Number.isFinite(property.price.amount) ?
      property.price.amount :
      null;
  const amount =
    amountFromPrice ??
    parseRentAmountFromText(
      property?.price?.displayPrices?.[0]?.displayPrice ??
      property?.price?.displayPrice ??
      property?.summary
    );

  if (!amount || amount <= 0) {
    return null;
  }

  const listingUpdateReason =
    String(property?.listingUpdate?.listingUpdateReason || property?.addedOrReduced || '').trim();
  const sourceDateValue = normalizeDate(
    property?.listingUpdate?.listingUpdateDate ??
    property?.firstVisibleDate ??
    property?.updateDate ??
    null
  );
  const sourceDateKind = inferSourceDateKind(listingUpdateReason);
  const propertyUrlRaw = String(property?.propertyUrl || '').trim();
  const sourceUrl = propertyUrlRaw.startsWith('http') ?
    propertyUrlRaw :
    propertyUrlRaw ?
      `https://${RIGHTMOVE_DOMAIN}${propertyUrlRaw}` :
      context.pageUrl;

  const rentFrequencyHint =
    property?.price?.frequency ??
    property?.price?.displayPrices?.[0]?.displayPrice ??
    property?.price?.displayPrice ??
    '';

  return buildComparableFromPartial(
    {
      source: 'scraped',
      sourceUrl,
      sourceDomain: RIGHTMOVE_DOMAIN,
      sourceDateKind,
      sourceDateValue,
      addressSnippet: String(property?.displayAddress || property?.heading || '').trim() || 'Comparable listing',
      propertyType: String(property?.propertySubType || property?.propertyTypeFullDescription || '').trim() || null,
      postcodeRaw: context.postcode,
      postcodeNormalized: maybeNormalizeUkPostcode(context.postcode) || null,
      bedrooms: Number.isFinite(Number(property?.bedrooms)) ? Number(property.bedrooms) : null,
      rawRentValue: amount,
      rawRentFrequency: inferRentFrequency(rentFrequencyHint),
      distanceMiles: parseDistanceMiles(property?.distance ?? property?.formattedDistance),
      isManual: false,
      adjustments: [],
      metadata: {
        rightmoveId: property?.id ?? null,
        listingUpdateReason: listingUpdateReason || null,
        outcodeSearch: getOutcode(context.postcode),
      },
    },
    index
  );
}

function selectBedroomPrioritizedComparables(
  comparables: Section13Comparable[],
  bedrooms: number
): Section13Comparable[] {
  if (!Number.isFinite(bedrooms) || bedrooms <= 0) {
    return comparables.slice(0, MAX_COMPARABLES);
  }

  const exact = comparables.filter((item) => item.bedrooms === bedrooms);
  if (exact.length >= 5) {
    return exact.slice(0, MAX_COMPARABLES);
  }

  return [...comparables]
    .sort((a, b) => {
      const diffA = Number.isFinite(Number(a.bedrooms)) ? Math.abs(Number(a.bedrooms) - bedrooms) : 99;
      const diffB = Number.isFinite(Number(b.bedrooms)) ? Math.abs(Number(b.bedrooms) - bedrooms) : 99;
      if (diffA !== diffB) {
        return diffA - diffB;
      }

      return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
    })
    .slice(0, MAX_COMPARABLES);
}

function extractComparablesFromNextDataPayload(
  nextData: any,
  context: ScrapeContext
): Section13Comparable[] {
  const properties = nextData?.props?.pageProps?.searchResults?.properties;
  if (!Array.isArray(properties) || properties.length === 0) {
    return [];
  }

  const mapped = properties
    .map((property: any, index: number) =>
      buildComparableFromRightmoveProperty(property, index, context)
    )
    .filter((item: Section13Comparable | null): item is Section13Comparable => Boolean(item));

  const deduped = mapped.filter((item, index, all) => {
    const key = `${item.sourceUrl || ''}::${item.addressSnippet}::${item.rawRentValue}`;
    return all.findIndex((entry) =>
      `${entry.sourceUrl || ''}::${entry.addressSnippet}::${entry.rawRentValue}` === key
    ) === index;
  });

  return selectBedroomPrioritizedComparables(deduped, context.bedrooms);
}

function extractFromLegacyHtml(html: string, context: ScrapeContext): Section13Comparable[] {
  const results: Section13Comparable[] = [];
  const pattern =
    /"displayAddress":"([^"]+)".+?"propertySubType":"([^"]*)".+?"bedrooms":(\d+).+?"rent":\{"amount":(\d+)[^}]*\}.+?"listingUpdate":{"listingUpdateReason":"([^"]*)","listingUpdateDate":"([^"]*)"/g;

  let match: RegExpExecArray | null;
  while ((match = pattern.exec(html)) && results.length < MAX_COMPARABLES) {
    const [, address, propertyType, bedroomCount, amount, listingUpdateReason, sourceDateValue] = match;
    const normalizedBedrooms = Number(bedroomCount);
    const comparable = buildComparableFromPartial(
      {
        source: 'scraped',
        sourceUrl: context.pageUrl,
        sourceDomain: RIGHTMOVE_DOMAIN,
        sourceDateKind: inferSourceDateKind(listingUpdateReason),
        sourceDateValue: normalizeDate(sourceDateValue),
        addressSnippet: address,
        propertyType: propertyType || null,
        postcodeRaw: context.postcode,
        postcodeNormalized: maybeNormalizeUkPostcode(context.postcode) || null,
        bedrooms: normalizedBedrooms,
        rawRentValue: Number(amount),
        rawRentFrequency: 'pcm',
        isManual: false,
        adjustments: [],
      },
      results.length
    );

    results.push(comparable);
  }

  return selectBedroomPrioritizedComparables(results, context.bedrooms);
}

function extractComparablesFromHtml(html: string, context: ScrapeContext): Section13Comparable[] {
  const nextData = extractNextDataJson(html);
  if (nextData) {
    const fromPayload = extractComparablesFromNextDataPayload(nextData, context);
    if (fromPayload.length > 0) {
      return fromPayload;
    }
  }

  return extractFromLegacyHtml(html, context);
}

async function fetchRightmoveHtml(url: string): Promise<string | null> {
  const response = await fetch(url, {
    headers: SCRAPE_HEADERS,
    cache: 'no-store',
  });

  if (!response.ok) {
    return null;
  }

  const html = await response.text();
  return html || null;
}

async function scrapeViaDirect(url: string, postcode: string, bedrooms: number): Promise<ScrapeResult | null> {
  const html = await fetchRightmoveHtml(url);
  if (!html) {
    return null;
  }

  const comparables = extractComparablesFromHtml(html, {
    postcode,
    bedrooms,
    pageUrl: url,
  });
  if (comparables.length > 0) {
    return {
      comparables,
      source: 'direct',
      summary: `Imported ${comparables.length} comparable listings from Rightmove (${getOutcode(postcode)} outcode search).`,
    };
  }

  return null;
}

async function scrapeViaProxy(url: string, postcode: string, bedrooms: number): Promise<ScrapeResult | null> {
  for (const prefix of RIGHTMOVE_PROXY_ENDPOINTS) {
    const response = await fetch(`${prefix}${encodeURIComponent(url)}`, {
      headers: SCRAPE_HEADERS,
      cache: 'no-store',
    });

    if (!response.ok) {
      continue;
    }

    const html = await response.text();
    const comparables = extractComparablesFromHtml(html, {
      postcode,
      bedrooms,
      pageUrl: url,
    });
    if (comparables.length > 0) {
      return {
        comparables,
        source: 'proxy',
        summary: `Imported ${comparables.length} comparable listings from Rightmove via proxy (${getOutcode(postcode)} outcode search).`,
      };
    }
  }

  return null;
}

async function launchScrapeBrowser(): Promise<any> {
  const isServerless = process.env.VERCEL === '1' || Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME);

  if (isServerless) {
    const [puppeteerCore, chromium] = await Promise.all([
      import('puppeteer-core'),
      import('@sparticuz/chromium'),
    ]);
    const executablePath = await chromium.default.executablePath();

    return puppeteerCore.default.launch({
      args: chromium.default.args,
      defaultViewport: { width: 1366, height: 900 },
      executablePath,
      headless: true,
    });
  }

  const puppeteer = await import('puppeteer');
  return puppeteer.default.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
}

async function scrapeViaPuppeteer(url: string, postcode: string, bedrooms: number): Promise<ScrapeResult | null> {
  const browser = await launchScrapeBrowser();

  try {
    const page = await browser.newPage();
    await page.setUserAgent(SCRAPE_HEADERS['user-agent']);
    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 45000,
    });
    await new Promise((resolve) => setTimeout(resolve, 2500));

    const html = await page.content();
    const comparables = extractComparablesFromHtml(html, {
      postcode,
      bedrooms,
      pageUrl: url,
    });

    if (comparables.length === 0) {
      return null;
    }

    return {
      comparables,
      source: 'puppeteer',
      summary: `Imported ${comparables.length} comparable listings from Rightmove via browser scrape (${getOutcode(postcode)} outcode search).`,
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
        sourceUrl: `https://${RIGHTMOVE_DOMAIN}/demo-listing-${index + 1}`,
        sourceDomain: getDomainFromUrl(`https://${RIGHTMOVE_DOMAIN}`) || RIGHTMOVE_DOMAIN,
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
  const url = buildRightmoveOutcodeUrl(normalizedPostcode);

  const directResult = await scrapeViaDirect(url, normalizedPostcode, bedrooms).catch(() => null);
  if (directResult?.comparables?.length) {
    return directResult;
  }

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
