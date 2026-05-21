import { maybeNormalizeUkPostcode } from './postcode';
import { buildComparableFromPartial } from './server';
import { getReliableComparableDistanceMiles } from './comparable-distance';
import type { Section13Comparable, Section13SourceDateKind } from './types';

const RIGHTMOVE_PROXY_ENDPOINTS = [
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?',
];

const RIGHTMOVE_DOMAIN = 'www.rightmove.co.uk';
const OPENRENT_DOMAIN = 'www.openrent.co.uk';
const MAX_COMPARABLES = 10;
const MIN_LIVE_COMPARABLES = 3;
const MILES_PER_KM = 0.621371;
const SCRAPE_HEADERS = {
  'user-agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0 Safari/537.36',
  'accept-language': 'en-GB,en;q=0.9',
};

export type ComparableSearchSource = 'rightmove' | 'openrent';
export type ComparableSearchRoute =
  | 'rightmove_direct'
  | 'rightmove_proxy'
  | 'rightmove_puppeteer'
  | 'openrent_direct';
export type ComparableSearchOutcome = 'blended_live' | 'rightmove_live' | 'openrent_live' | 'insufficient_live_evidence';

export interface ComparableSourceStatus {
  source: ComparableSearchSource;
  route: ComparableSearchRoute | null;
  ok: boolean;
  count: number;
  detail: string;
}

export interface LiveComparableScrapeSuccess {
  success: true;
  comparables: Section13Comparable[];
  source: Exclude<ComparableSearchOutcome, 'insufficient_live_evidence'>;
  summary: string;
  sourceStatuses: ComparableSourceStatus[];
  searchFallbackMode?: 'exact' | 'parent_type' | null;
}

export interface LiveComparableScrapeFailure {
  success: false;
  comparables: Section13Comparable[];
  source: 'insufficient_live_evidence';
  summary: string;
  sourceStatuses: ComparableSourceStatus[];
  reason: 'insufficient_live_comparables';
  retryable: true;
  searchFallbackMode?: 'exact' | 'parent_type' | null;
}

export type LiveComparableScrapeResult =
  | LiveComparableScrapeSuccess
  | LiveComparableScrapeFailure;

interface ScrapeContext {
  postcode: string;
  bedrooms: number;
  pageUrl: string;
  propertyType?: string | null;
}

interface SourceScrapeSuccess {
  comparables: Section13Comparable[];
  route: ComparableSearchRoute;
  summary: string;
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

function normalizeSearchPropertyType(value: string | null | undefined): string | null {
  const normalized = String(value || '').trim().toLowerCase().replace(/_/g, '-');
  if (!normalized || normalized === 'other') return null;
  if (normalized.includes('studio')) return 'studio';
  if (normalized.includes('maisonette')) return 'maisonette';
  if (normalized.includes('room') || normalized.includes('lodger')) return 'room';
  if (normalized.includes('hmo') || normalized.includes('shared')) return 'hmo';
  if (
    normalized.includes('flat') ||
    normalized.includes('apartment') ||
    normalized.includes('studio') ||
    normalized.includes('maisonette')
  ) {
    return 'flat';
  }
  if (normalized.includes('bungalow')) return 'bungalow';
  if (
    normalized.includes('house') ||
    normalized.includes('terrace') ||
    normalized.includes('semi') ||
    normalized.includes('detached') ||
    normalized.includes('cottage')
  ) {
    return 'house';
  }

  return null;
}

function getRightmovePropertyTypeQuery(propertyType: string | null | undefined): string | null {
  const raw = String(propertyType || '').trim().toLowerCase().replace(/_/g, '-');
  if (raw.includes('semi')) return 'semi-detached';
  if (raw.includes('end-terrace') || raw.includes('end terrace')) return 'terraced';
  if (raw.includes('terrace')) return 'terraced';
  if (raw.includes('detached') && !raw.includes('semi')) return 'detached';
  if (raw.includes('maisonette')) return 'maisonette';
  if (raw.includes('studio')) return 'studio';

  switch (normalizeSearchPropertyType(propertyType)) {
    case 'flat':
      return 'flat';
    case 'maisonette':
      return 'maisonette';
    case 'studio':
      return 'studio';
    case 'bungalow':
      return 'bungalow';
    case 'house':
      return 'detached,semi-detached,terraced';
    default:
      return null;
  }
}

function formatSearchScope(postcode: string, propertyType?: string | null): string {
  const rawType = String(propertyType || '').trim().replace(/_/g, ' ');
  const normalizedType = normalizeSearchPropertyType(propertyType);
  const typeLabel = rawType || (normalizedType && normalizedType !== 'other' ? normalizedType : '');
  return `${getOutcode(postcode)} outcode search${typeLabel ? `, ${typeLabel}` : ''}`;
}

function getParentSearchPropertyType(propertyType: string | null | undefined): string | null {
  const normalized = normalizeSearchPropertyType(propertyType);
  const raw = String(propertyType || '').trim().toLowerCase().replace(/_/g, '-');

  if (!normalized || normalized === 'other') return null;
  if (
    raw.includes('terrace') ||
    raw.includes('semi') ||
    raw.includes('detached') ||
    raw.includes('bungalow') ||
    normalized === 'bungalow'
  ) {
    return 'house';
  }

  if (raw.includes('purpose-built') || raw.includes('converted') || normalized === 'maisonette' || normalized === 'studio') {
    return 'flat';
  }

  if (normalized === 'hmo') return 'room';
  return null;
}

function applySearchMetadata(
  comparables: Section13Comparable[],
  metadata: Record<string, unknown>
): Section13Comparable[] {
  return comparables.map((comparable) => ({
    ...comparable,
    metadata: {
      ...(comparable.metadata || {}),
      ...metadata,
    },
  }));
}

function buildRightmoveOutcodeUrl(postcode: string, propertyType?: string | null): string {
  const outcode = getOutcode(postcode);
  const propertyTypes = getRightmovePropertyTypeQuery(propertyType);
  const url = new URL(`https://${RIGHTMOVE_DOMAIN}/property-to-rent/${outcode}.html`);
  if (propertyTypes) {
    url.searchParams.set('propertyTypes', propertyTypes);
  }
  return url.toString();
}

function buildOpenRentOutcodeUrl(postcode: string): string {
  const outcode = getOutcode(postcode).toLowerCase();
  return `https://${OPENRENT_DOMAIN}/properties-to-rent/${outcode}`;
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
  if (/added|new|published/i.test(reasonText)) {
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

function parseScrapedDistanceMiles(value: unknown): number | null {
  return getReliableComparableDistanceMiles({
    distanceMiles: parseDistanceMiles(value),
    source: 'scraped',
    isManual: false,
  });
}

function normalizeImageUrl(value: unknown, fallbackDomain?: string): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (/NoImageImage/i.test(trimmed)) {
    return null;
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`;
  }

  if (trimmed.startsWith('/') && fallbackDomain) {
    return `https://${fallbackDomain}${trimmed}`;
  }

  return trimmed;
}

function htmlEntityDecode(value: string): string {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, decimal) => String.fromCodePoint(parseInt(decimal, 10)))
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ');
}

function stripHtml(value: string): string {
  return htmlEntityDecode(value.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
}

function normalizeUrlPath(value: string, domain: string): string {
  return value.startsWith('http') ? value : `https://${domain}${value}`;
}

function getPropertyImageUrl(property: any): string | null {
  const candidates = [
    property?.propertyImages?.images?.[0]?.srcUrl,
    property?.propertyImages?.images?.[0]?.url,
    property?.propertyImages?.mainImageSrc,
    property?.propertyImages?.mainImageUrl,
    property?.mainImage,
    property?.mainImageSrc,
    property?.thumbnailUrl,
  ];

  for (const candidate of candidates) {
    const normalized = normalizeImageUrl(candidate, RIGHTMOVE_DOMAIN);
    if (normalized) {
      return normalized;
    }
  }

  return null;
}

function buildComparableFromRightmoveProperty(
  property: any,
  index: number,
  context: ScrapeContext
): Section13Comparable | null {
  const amountFromPrice =
    typeof property?.price?.amount === 'number' && Number.isFinite(property.price.amount)
      ? property.price.amount
      : null;
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
  const sourceUrl = propertyUrlRaw.startsWith('http')
    ? propertyUrlRaw
    : propertyUrlRaw
      ? `https://${RIGHTMOVE_DOMAIN}${propertyUrlRaw}`
      : context.pageUrl;

  const rentFrequencyHint =
    property?.price?.frequency ??
    property?.price?.displayPrices?.[0]?.displayPrice ??
    property?.price?.displayPrice ??
    '';
  const imageUrl = getPropertyImageUrl(property);

  return buildComparableFromPartial(
    {
      source: 'scraped',
      sourceUrl,
      sourceDomain: RIGHTMOVE_DOMAIN,
      sourceDateKind,
      sourceDateValue,
      addressSnippet:
        String(property?.displayAddress || property?.heading || '').trim() || 'Comparable listing',
      propertyType:
        String(property?.propertySubType || property?.propertyTypeFullDescription || '').trim() ||
        null,
      postcodeRaw: context.postcode,
      postcodeNormalized: maybeNormalizeUkPostcode(context.postcode) || null,
      bedrooms: Number.isFinite(Number(property?.bedrooms)) ? Number(property.bedrooms) : null,
      rawRentValue: amount,
      rawRentFrequency: inferRentFrequency(rentFrequencyHint),
      distanceMiles: parseScrapedDistanceMiles(property?.distance ?? property?.formattedDistance),
      isManual: false,
      adjustments: [],
      metadata: {
        imageUrl,
        listingSource: 'rightmove',
        rightmoveId: property?.id ?? null,
        listingUpdateReason: listingUpdateReason || null,
        outcodeSearch: getOutcode(context.postcode),
        subjectPropertyType: context.propertyType || null,
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
      const diffA = Number.isFinite(Number(a.bedrooms))
        ? Math.abs(Number(a.bedrooms) - bedrooms)
        : 99;
      const diffB = Number.isFinite(Number(b.bedrooms))
        ? Math.abs(Number(b.bedrooms) - bedrooms)
        : 99;
      if (diffA !== diffB) {
        return diffA - diffB;
      }

      return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
    })
    .slice(0, MAX_COMPARABLES);
}

function dedupeComparables(
  comparables: Section13Comparable[],
  bedrooms: number
): Section13Comparable[] {
  const deduped = new Map<string, Section13Comparable>();

  for (const item of comparables) {
    const normalizedAddress = (item.addressSnippet || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
    const rentBucket = Math.round((item.monthlyEquivalent || 0) / 25);
    const key = [
      normalizedAddress,
      item.bedrooms ?? 'na',
      item.propertyType?.toLowerCase() || 'na',
      rentBucket,
    ].join('::');

    if (!deduped.has(key)) {
      deduped.set(key, item);
      continue;
    }

    const existing = deduped.get(key)!;
    const existingDate = existing.sourceDateValue || '';
    const incomingDate = item.sourceDateValue || '';
    if (incomingDate > existingDate) {
      deduped.set(key, item);
    }
  }

  return selectBedroomPrioritizedComparables(
    [...deduped.values()].sort((a, b) => {
      const distanceA = a.distanceMiles ?? 999;
      const distanceB = b.distanceMiles ?? 999;
      if (distanceA !== distanceB) {
        return distanceA - distanceB;
      }

      return (b.sourceDateValue || '').localeCompare(a.sourceDateValue || '');
    }),
    bedrooms
  );
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

  return dedupeComparables(mapped, context.bedrooms);
}

function extractFromLegacyHtml(html: string, context: ScrapeContext): Section13Comparable[] {
  const results: Section13Comparable[] = [];
  const pattern =
    /"displayAddress":"([^"]+)".+?"propertySubType":"([^"]*)".+?"bedrooms":(\d+).+?"rent":\{"amount":(\d+)[^}]*\}.+?"listingUpdate":{"listingUpdateReason":"([^"]*)","listingUpdateDate":"([^"]*)"/g;

  let match: RegExpExecArray | null;
  while ((match = pattern.exec(html)) && results.length < MAX_COMPARABLES) {
    const [, address, propertyType, bedroomCount, amount, listingUpdateReason, sourceDateValue] =
      match;
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
        metadata: {
          listingSource: 'rightmove',
          subjectPropertyType: context.propertyType || null,
        },
      },
      results.length
    );

    results.push(comparable);
  }

  return dedupeComparables(results, context.bedrooms);
}

function extractComparablesFromRightmoveHtml(
  html: string,
  context: ScrapeContext
): Section13Comparable[] {
  const nextData = extractNextDataJson(html);
  if (nextData) {
    const fromPayload = extractComparablesFromNextDataPayload(nextData, context);
    if (fromPayload.length > 0) {
      return fromPayload;
    }
  }

  return extractFromLegacyHtml(html, context);
}

async function fetchHtml(url: string): Promise<string | null> {
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

async function scrapeRightmoveViaDirect(
  url: string,
  postcode: string,
  bedrooms: number,
  propertyType?: string | null
): Promise<SourceScrapeSuccess | null> {
  const html = await fetchHtml(url);
  if (!html) {
    return null;
  }

  const comparables = extractComparablesFromRightmoveHtml(html, {
    postcode,
    bedrooms,
    pageUrl: url,
    propertyType,
  });
  if (comparables.length > 0) {
    return {
      comparables,
      route: 'rightmove_direct',
      summary: `Imported ${comparables.length} comparable listings from Rightmove (${formatSearchScope(postcode, propertyType)}).`,
    };
  }

  return null;
}

async function scrapeRightmoveViaProxy(
  url: string,
  postcode: string,
  bedrooms: number,
  propertyType?: string | null
): Promise<SourceScrapeSuccess | null> {
  for (const prefix of RIGHTMOVE_PROXY_ENDPOINTS) {
    const response = await fetch(`${prefix}${encodeURIComponent(url)}`, {
      headers: SCRAPE_HEADERS,
      cache: 'no-store',
    });

    if (!response.ok) {
      continue;
    }

    const html = await response.text();
    const comparables = extractComparablesFromRightmoveHtml(html, {
      postcode,
      bedrooms,
      pageUrl: url,
      propertyType,
    });
    if (comparables.length > 0) {
      return {
        comparables,
        route: 'rightmove_proxy',
        summary: `Imported ${comparables.length} comparable listings from Rightmove via proxy (${formatSearchScope(postcode, propertyType)}).`,
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

async function scrapeRightmoveViaPuppeteer(
  url: string,
  postcode: string,
  bedrooms: number,
  propertyType?: string | null
): Promise<SourceScrapeSuccess | null> {
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
    const comparables = extractComparablesFromRightmoveHtml(html, {
      postcode,
      bedrooms,
      pageUrl: url,
      propertyType,
    });

    if (comparables.length === 0) {
      return null;
    }

    return {
      comparables,
      route: 'rightmove_puppeteer',
      summary: `Imported ${comparables.length} comparable listings from Rightmove via browser scrape (${formatSearchScope(postcode, propertyType)}).`,
    };
  } finally {
    await browser.close();
  }
}

function parseNumberArrayVar(html: string, varName: string): number[] {
  const pattern = new RegExp(`var\\s+${varName}\\s*=\\s*\\[([\\s\\S]*?)\\];`);
  const match = html.match(pattern);
  if (!match?.[1]) {
    return [];
  }

  return match[1]
    .split(',')
    .map((item) => Number(String(item).replace(/['"\s]/g, '')))
    .filter((item) => Number.isFinite(item));
}

function parseStringArrayVar(html: string, varName: string): string[] {
  const pattern = new RegExp(`var\\s+${varName}\\s*=\\s*\\[([\\s\\S]*?)\\];`);
  const match = html.match(pattern);
  if (!match?.[1]) {
    return [];
  }

  return match[1]
    .split(',')
    .map((item) => String(item).replace(/['"\s]/g, ''))
    .filter(Boolean);
}

function deriveOpenRentPropertyShape(title: string): {
  bedrooms: number | null;
  propertyType: string | null;
  addressSnippet: string;
} {
  const cleanTitle = htmlEntityDecode(title).trim();
  const roomMatch = cleanTitle.match(/^Room in a Shared House,\s*(.+)$/i);
  if (roomMatch?.[1]) {
    return {
      bedrooms: 1,
      propertyType: 'Room in shared house',
      addressSnippet: roomMatch[1].trim(),
    };
  }

  const bedMatch = cleanTitle.match(/^(\d+)\s+Bed\s+([^,]+),\s*(.+)$/i);
  if (bedMatch) {
    return {
      bedrooms: Number(bedMatch[1]),
      propertyType: bedMatch[2].trim(),
      addressSnippet: bedMatch[3].trim(),
    };
  }

  const fallbackParts = cleanTitle.split(',').map((part) => part.trim()).filter(Boolean);
  return {
    bedrooms: null,
    propertyType: fallbackParts[0] || null,
    addressSnippet: fallbackParts.slice(1).join(', ') || cleanTitle,
  };
}

function buildIsoDateFromHoursAgo(hoursAgo: number): string | null {
  if (!Number.isFinite(hoursAgo) || hoursAgo < 0) {
    return null;
  }

  const millisAgo = hoursAgo * 60 * 60 * 1000;
  return new Date(Date.now() - millisAgo).toISOString().slice(0, 10);
}

function extractComparablesFromOpenRentHtml(
  html: string,
  context: ScrapeContext
): Section13Comparable[] {
  const hoursLive = parseNumberArrayVar(html, 'hoursLive');
  const distanceKm = parseStringArrayVar(html, 'PROPERTYLISTCOMMUTEORDISTANCE').map((value) =>
    Number(value)
  );
  const pattern =
    /<a href="(?<href>\/property-to-rent\/[^"]+)" class="pli search-property-card[\s\S]*?id="p(?<index>\d+)"[\s\S]*?<\/a>/g;

  const comparables: Section13Comparable[] = [];
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(html)) && comparables.length < MAX_COMPARABLES * 2) {
    const block = match[0];
    const href = match.groups?.href;
    const index = Number(match.groups?.index);
    if (!href || !Number.isFinite(index)) {
      continue;
    }

    const titleMatch = block.match(/<div class="fw-medium text-primary fs-3">([\s\S]*?)<\/div>/);
    const title = stripHtml(titleMatch?.[1] || '');
    if (!title) {
      continue;
    }

    const priceMatch =
      block.match(/<div class="pim[\s\S]*?&#xA3;([\d,]+(?:\.\d+)?)<\/span>[\s\S]*?<span[^>]*>\s*per month\s*<\/span>/i) ||
      block.match(/£([\d,]+(?:\.\d+)?)\s*(?:pcm|per month)/i);
    const amount = priceMatch?.[1] ? Number(priceMatch[1].replace(/,/g, '')) : null;
    if (!amount || !Number.isFinite(amount)) {
      continue;
    }

    const imageMatch =
      block.match(/\bdata-src="([^"]+)"/i) || block.match(/\bsrc="([^"]+)"/i);
    const imageUrl = normalizeImageUrl(imageMatch?.[1] || null, OPENRENT_DOMAIN);
    const listingIdMatch = block.match(/data-listing-id="(\d+)"/i);
    const hoursAgo = hoursLive[index];
    const sourceDateValue = buildIsoDateFromHoursAgo(hoursAgo);
    const titleShape = deriveOpenRentPropertyShape(title);
    const kilometers = distanceKm[index];

    comparables.push(
      buildComparableFromPartial(
        {
          source: 'scraped',
          sourceUrl: normalizeUrlPath(href, OPENRENT_DOMAIN),
          sourceDomain: OPENRENT_DOMAIN,
          sourceDateKind: 'published',
          sourceDateValue,
          addressSnippet: titleShape.addressSnippet || title,
          propertyType: titleShape.propertyType,
          postcodeRaw: context.postcode,
          postcodeNormalized: maybeNormalizeUkPostcode(context.postcode) || null,
          bedrooms: titleShape.bedrooms,
          rawRentValue: amount,
          rawRentFrequency: 'pcm',
          distanceMiles: getReliableComparableDistanceMiles({
            distanceMiles: Number.isFinite(kilometers)
              ? Number((kilometers * MILES_PER_KM).toFixed(2))
              : null,
            source: 'scraped',
            isManual: false,
          }),
          isManual: false,
          adjustments: [],
          metadata: {
            imageUrl,
            listingSource: 'openrent',
            openRentListingId: listingIdMatch?.[1] || null,
            hoursLive: Number.isFinite(hoursAgo) ? hoursAgo : null,
            outcodeSearch: getOutcode(context.postcode),
            subjectPropertyType: context.propertyType || null,
          },
        },
        comparables.length
      )
    );
  }

  return dedupeComparables(comparables, context.bedrooms);
}

async function scrapeOpenRentViaDirect(
  url: string,
  postcode: string,
  bedrooms: number,
  propertyType?: string | null
): Promise<SourceScrapeSuccess | null> {
  const html = await fetchHtml(url);
  if (!html) {
    return null;
  }

  const comparables = extractComparablesFromOpenRentHtml(html, {
    postcode,
    bedrooms,
    pageUrl: url,
    propertyType,
  });
  if (comparables.length === 0) {
    return null;
  }

  return {
    comparables,
    route: 'openrent_direct',
    summary: `Imported ${comparables.length} comparable listings from OpenRent (${formatSearchScope(postcode, propertyType)}).`,
  };
}

async function scrapeRightmoveSource(
  postcode: string,
  bedrooms: number,
  propertyType?: string | null
): Promise<{ result: SourceScrapeSuccess | null; status: ComparableSourceStatus }> {
  const normalizedPostcode = maybeNormalizeUkPostcode(postcode) || postcode.toUpperCase();
  const url = buildRightmoveOutcodeUrl(normalizedPostcode, propertyType);

  const directResult = await scrapeRightmoveViaDirect(url, normalizedPostcode, bedrooms, propertyType).catch(
    () => null
  );
  if (directResult?.comparables?.length) {
    return {
      result: directResult,
      status: {
        source: 'rightmove',
        route: directResult.route,
        ok: true,
        count: directResult.comparables.length,
        detail: directResult.summary,
      },
    };
  }

  const proxyResult = await scrapeRightmoveViaProxy(url, normalizedPostcode, bedrooms, propertyType).catch(
    () => null
  );
  if (proxyResult?.comparables?.length) {
    return {
      result: proxyResult,
      status: {
        source: 'rightmove',
        route: proxyResult.route,
        ok: true,
        count: proxyResult.comparables.length,
        detail: proxyResult.summary,
      },
    };
  }

  const puppeteerResult = await scrapeRightmoveViaPuppeteer(
    url,
    normalizedPostcode,
    bedrooms,
    propertyType
  ).catch(() => null);
  if (puppeteerResult?.comparables?.length) {
    return {
      result: puppeteerResult,
      status: {
        source: 'rightmove',
        route: puppeteerResult.route,
        ok: true,
        count: puppeteerResult.comparables.length,
        detail: puppeteerResult.summary,
      },
    };
  }

  return {
    result: null,
    status: {
      source: 'rightmove',
      route: null,
      ok: false,
      count: 0,
      detail: `Rightmove did not return usable live comparables for ${getOutcode(
        normalizedPostcode
      )}.`,
    },
  };
}

async function scrapeOpenRentSource(
  postcode: string,
  bedrooms: number,
  propertyType?: string | null
): Promise<{ result: SourceScrapeSuccess | null; status: ComparableSourceStatus }> {
  const normalizedPostcode = maybeNormalizeUkPostcode(postcode) || postcode.toUpperCase();
  const url = buildOpenRentOutcodeUrl(normalizedPostcode);
  const directResult = await scrapeOpenRentViaDirect(url, normalizedPostcode, bedrooms, propertyType).catch(
    () => null
  );

  if (directResult?.comparables?.length) {
    return {
      result: directResult,
      status: {
        source: 'openrent',
        route: directResult.route,
        ok: true,
        count: directResult.comparables.length,
        detail: directResult.summary,
      },
    };
  }

  return {
    result: null,
    status: {
      source: 'openrent',
      route: null,
      ok: false,
      count: 0,
      detail: `OpenRent did not return usable live comparables for ${getOutcode(
        normalizedPostcode
      )}.`,
    },
  };
}

function formatSourceNames(sourceStatuses: ComparableSourceStatus[]): string {
  const successful = sourceStatuses.filter((item) => item.ok && item.count > 0).map((item) => item.source);
  if (successful.length === 2) {
    return 'Rightmove and OpenRent';
  }
  if (successful[0] === 'openrent') {
    return 'OpenRent';
  }
  return 'Rightmove';
}

function mergeLiveComparables(
  postcode: string,
  bedrooms: number,
  propertyType: string | null | undefined,
  sourceStatuses: ComparableSourceStatus[],
  sourceResults: Array<SourceScrapeSuccess | null>,
  options?: { searchFallbackMode?: 'exact' | 'parent_type' | null; summarySuffix?: string }
): LiveComparableScrapeResult {
  const merged = dedupeComparables(
    sourceResults.flatMap((item) => item?.comparables || []),
    bedrooms
  );
  if (merged.length < MIN_LIVE_COMPARABLES) {
    return {
      success: false,
      comparables: merged,
      source: 'insufficient_live_evidence',
      summary: `We could only gather ${merged.length} live comparable listing${
        merged.length === 1 ? '' : 's'
      } across Rightmove and OpenRent for ${formatSearchScope(
        postcode,
        propertyType
      )}. Try the search again, broaden the evidence, or add real linked comparables manually before relying on the result.`,
      sourceStatuses,
      reason: 'insufficient_live_comparables',
      retryable: true,
      searchFallbackMode: options?.searchFallbackMode || 'exact',
    };
  }

  const successfulSources = sourceStatuses.filter((item) => item.ok && item.count > 0);
  const source: LiveComparableScrapeSuccess['source'] =
    successfulSources.length > 1
      ? 'blended_live'
      : successfulSources[0]?.source === 'openrent'
        ? 'openrent_live'
        : 'rightmove_live';

  return {
    success: true,
    comparables: merged,
    source,
    summary: `Imported ${merged.length} live comparable listing${
      merged.length === 1 ? '' : 's'
    } from ${formatSourceNames(sourceStatuses)} (${formatSearchScope(postcode, propertyType)})${
      options?.summarySuffix ? ` ${options.summarySuffix}` : ''
    }.`,
    sourceStatuses,
    searchFallbackMode: options?.searchFallbackMode || 'exact',
  };
}

async function scrapeLiveComparablesOnce(
  postcode: string,
  bedrooms: number,
  propertyType?: string | null,
  options?: { searchFallbackMode?: 'exact' | 'parent_type' | null; subjectPropertyType?: string | null }
): Promise<LiveComparableScrapeResult> {
  const [rightmove, openrent] = await Promise.all([
    scrapeRightmoveSource(postcode, bedrooms, propertyType),
    scrapeOpenRentSource(postcode, bedrooms, propertyType),
  ]);

  const sourceResults = [rightmove.result, openrent.result].map((result) =>
    result
      ? {
          ...result,
          comparables: applySearchMetadata(result.comparables, {
            searchFallbackMode: options?.searchFallbackMode || 'exact',
            subjectPropertyType: options?.subjectPropertyType || propertyType || null,
            searchPropertyType: propertyType || null,
          }),
        }
      : null
  );

  return mergeLiveComparables(
    postcode,
    bedrooms,
    propertyType,
    [rightmove.status, openrent.status],
    sourceResults,
    { searchFallbackMode: options?.searchFallbackMode || 'exact' }
  );
}

export async function scrapeLiveComparables(
  postcode: string,
  bedrooms: number,
  propertyType?: string | null
): Promise<LiveComparableScrapeResult> {
  const normalizedPostcode = maybeNormalizeUkPostcode(postcode) || postcode.toUpperCase();
  const exactResult = await scrapeLiveComparablesOnce(
    normalizedPostcode,
    bedrooms,
    propertyType,
    { searchFallbackMode: 'exact', subjectPropertyType: propertyType || null }
  );
  if (exactResult.success || exactResult.comparables.length >= MIN_LIVE_COMPARABLES) {
    return exactResult;
  }

  const parentPropertyType = getParentSearchPropertyType(propertyType);
  const rawSearchType = String(propertyType || '').trim().toLowerCase().replace(/_/g, '-');
  if (!parentPropertyType || parentPropertyType === rawSearchType) {
    return exactResult;
  }

  const parentResult = await scrapeLiveComparablesOnce(
    normalizedPostcode,
    bedrooms,
    parentPropertyType,
    { searchFallbackMode: 'parent_type', subjectPropertyType: propertyType || null }
  );
  const combinedComparables = dedupeComparables(
    [...exactResult.comparables, ...parentResult.comparables],
    bedrooms
  );
  const combinedStatuses = [...exactResult.sourceStatuses, ...parentResult.sourceStatuses];

  if (combinedComparables.length < MIN_LIVE_COMPARABLES) {
    return {
      success: false,
      comparables: combinedComparables,
      source: 'insufficient_live_evidence',
      summary: `We could only gather ${combinedComparables.length} live comparable listing${
        combinedComparables.length === 1 ? '' : 's'
      } after first searching ${formatSearchScope(
        normalizedPostcode,
        propertyType
      )} and then broadening to ${formatSearchScope(
        normalizedPostcode,
        parentPropertyType
      )}. Broader or older fallback evidence is labelled and should be treated more cautiously.`,
      sourceStatuses: combinedStatuses,
      reason: 'insufficient_live_comparables',
      retryable: true,
      searchFallbackMode: 'parent_type',
    };
  }

  const successfulSources = combinedStatuses.filter((item) => item.ok && item.count > 0);
  const source: LiveComparableScrapeSuccess['source'] =
    successfulSources.some((item) => item.source === 'rightmove') &&
    successfulSources.some((item) => item.source === 'openrent')
      ? 'blended_live'
      : successfulSources[0]?.source === 'openrent'
        ? 'openrent_live'
        : 'rightmove_live';

  return {
    success: true,
    comparables: combinedComparables,
    source,
    summary: `Imported ${combinedComparables.length} live comparable listings after an exact subtype search returned only ${exactResult.comparables.length}; broadened to ${formatSearchScope(
      normalizedPostcode,
      parentPropertyType
    )}. Broader fallback comparables are labelled and evidence strength is softened where needed.`,
    sourceStatuses: combinedStatuses,
    searchFallbackMode: 'parent_type',
  };
}

export async function scrapeRightmoveComparables(
  postcode: string,
  bedrooms: number
): Promise<LiveComparableScrapeResult> {
  return scrapeLiveComparables(postcode, bedrooms);
}
