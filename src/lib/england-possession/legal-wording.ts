if (typeof window === 'undefined') {
  void import('server-only').catch(() => undefined);
}

import fs from 'fs/promises';
import path from 'path';
import {
  type EnglandGroundCode,
  ENGLAND_POST_2026_GROUND_CATALOG,
  getEnglandGroundDefinition,
  normalizeEnglandGroundCode,
} from './ground-catalog';

export interface EnglandGroundLegalWording {
  code: EnglandGroundCode;
  title: string;
  explanation: string;
  legalWording: string;
}

export type EnglandForm3AGroundId = `ground_${Lowercase<EnglandGroundCode>}`;

export class EnglandForm3ALegalWordingError extends Error {
  code = 'FORM3A_LEGAL_WORDING_MISSING';
  statusCode = 422;
  missingGrounds: string[];

  constructor(message: string, missingGrounds: string[] = []) {
    super(message);
    this.name = 'EnglandForm3ALegalWordingError';
    this.missingGrounds = missingGrounds;
  }
}

let cachedGroundWordingPromise: Promise<Record<EnglandGroundCode, EnglandGroundLegalWording>> | null = null;
let cachedLandlordGuidanceNoticePeriodsPromise: Promise<EnglandForm3ALandlordGuidanceNoticePeriods> | null = null;
let cachedPDFParseClassPromise: Promise<any> | null = null;

const LEGAL_WORDING_PATH = path.join(
  process.cwd(),
  'artifacts',
  'update',
  'Form_3A_legal_wording_for_possession_grounds.pdf',
);
const LANDLORD_GUIDANCE_PATH = path.join(
  process.cwd(),
  'artifacts',
  'update',
  'Form_3A_guidance_for_landlords.pdf',
);

export interface EnglandForm3ALandlordGuidanceNoticePeriods {
  fourMonths: string[];
  twoMonths: string[];
  fourWeeks: string[];
  twoWeeks: string[];
  immediate: string[];
}

function cleanGroundText(text: string): string {
  return text
    .replace(/\r/g, '')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function normaliseMatches(rawText: string): string {
  return rawText
    .replace(/--\s+\d+\s+of\s+\d+\s+--/g, '')
    .replace(/\n\d+\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n');
}

function normalizeGroundCandidate(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'object') {
    const entry = value as Record<string, unknown>;
    return normalizeGroundCandidate(
      entry.code ??
        entry.ground_code ??
        entry.groundCode ??
        entry.number ??
        entry.value ??
        entry.id ??
        entry.label ??
        entry.title,
    );
  }

  return String(value).trim();
}

export function parseEnglandForm3AGroundCodes(value: unknown): {
  grounds: EnglandGroundCode[];
  invalidGrounds: string[];
} {
  const rawEntries = Array.isArray(value)
    ? value
    : normalizeGroundCandidate(value)
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean);

  const grounds: EnglandGroundCode[] = [];
  const invalidGrounds: string[] = [];
  const seen = new Set<EnglandGroundCode>();

  for (const rawEntry of rawEntries) {
    const rawGround = normalizeGroundCandidate(rawEntry);
    const normalized = normalizeEnglandGroundCode(rawGround);

    if (!normalized) {
      if (rawGround) {
        invalidGrounds.push(rawGround);
      }
      continue;
    }

    if (!seen.has(normalized)) {
      seen.add(normalized);
      grounds.push(normalized);
    }
  }

  return { grounds, invalidGrounds };
}

function parseGroundCodes(value: string): EnglandGroundCode[] {
  return parseEnglandForm3AGroundCodes(value).grounds;
}

function normalizeGuidanceText(rawText: string): string {
  return rawText
    .replace(/\u2019/g, "'")
    .replace(/\u2018/g, "'")
    .replace(/\u2013/g, '-')
    .replace(/\u2014/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractGuidanceGroundList(normalizedText: string, heading: string): EnglandGroundCode[] {
  const escapedHeading = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`${escapedHeading}\\s+Grounds\\s+([^•]+?)\\s+• notice period:`, 'i');
  const match = normalizedText.match(regex);
  return match?.[1] ? parseGroundCodes(match[1]) : [];
}

function extractLandlordGuidanceNoticePeriods(rawText: string): EnglandForm3ALandlordGuidanceNoticePeriods {
  const normalizedText = normalizeGuidanceText(rawText);

  return {
    fourMonths: extractGuidanceGroundList(normalizedText, 'Four-month notice period'),
    twoMonths: extractGuidanceGroundList(normalizedText, 'Two-month notice period'),
    fourWeeks: extractGuidanceGroundList(normalizedText, "Four weeks' notice period"),
    twoWeeks: extractGuidanceGroundList(normalizedText, "Two weeks' notice period"),
    immediate: extractGuidanceGroundList(normalizedText, 'No notice period'),
  };
}

function extractLegalWordingBlocks(rawText: string): Record<EnglandGroundCode, EnglandGroundLegalWording> {
  return extractCanonicalLegalWordingBlocks(rawText);
}

function isGroundLegalWordingProductionReady(code: EnglandGroundCode, legalWording: string): boolean {
  const normalized = legalWording.replace(/\s+/g, ' ').trim();
  return normalized.length > `Ground ${code}`.length && normalized !== `Ground ${code}`;
}

function extractCanonicalLegalWordingBlocks(rawText: string): Record<EnglandGroundCode, EnglandGroundLegalWording> {
  const normalizedText = normaliseMatches(rawText);
  const headingRegex = /^Ground\s+([0-9A-Z]+)\s+(?:\u2013|â€“|-)\s+([^\n]+)$/gm;
  const headings = [...normalizedText.matchAll(headingRegex)]
    .map((match) => ({
      code: normalizeEnglandGroundCode(match[1]),
      title: match[2].trim(),
      index: match.index ?? -1,
    }))
    .filter((match): match is { code: EnglandGroundCode; title: string; index: number } =>
      Boolean(match.code) && match.index >= 0,
    );
  const entries = {} as Record<EnglandGroundCode, EnglandGroundLegalWording>;

  for (const [index, heading] of headings.entries()) {
    const nextHeadingIndex = headings[index + 1]?.index ?? normalizedText.length;
    const block = normalizedText.slice(heading.index, nextHeadingIndex);
    const legalMarker = new RegExp(`Legal wording\\nGround\\s+${heading.code}\\n`);
    const legalMatch = block.match(legalMarker);

    if (!legalMatch || legalMatch.index === undefined) {
      continue;
    }

    const headingLineEnd = block.indexOf('\n');
    const explanation = cleanGroundText(
      block
        .slice(headingLineEnd + 1, legalMatch.index)
        .replace(/^Explanation\s*\n?/i, ''),
    );
    const legalWording = cleanGroundText(
      block
        .slice(legalMatch.index + legalMatch[0].length)
        .replace(/^(?:Mandatory|Discretionary) grounds\s*$/gim, ''),
    );

    if (!isGroundLegalWordingProductionReady(heading.code, legalWording)) {
      continue;
    }

    entries[heading.code] = {
      code: heading.code,
      title: heading.title,
      explanation,
      legalWording,
    };
  }

  return entries;
}

function toForm3AGroundId(code: EnglandGroundCode): EnglandForm3AGroundId {
  return `ground_${code.toLowerCase()}` as EnglandForm3AGroundId;
}

function createMissingLegalWordingError(missingGrounds: string[]): EnglandForm3ALegalWordingError {
  return new EnglandForm3ALegalWordingError(
    `Form 3A question 4.2 cannot be generated because statutory legal wording is missing for: ${missingGrounds.join(', ')}`,
    missingGrounds,
  );
}

function buildFallbackGuidanceNoticePeriods(): EnglandForm3ALandlordGuidanceNoticePeriods {
  const entries = Object.values(ENGLAND_POST_2026_GROUND_CATALOG);

  return {
    fourMonths: entries
      .filter((entry) => entry.noticePeriodLabel === '4 months')
      .map((entry) => entry.code),
    twoMonths: entries
      .filter((entry) => entry.noticePeriodLabel === '2 months')
      .map((entry) => entry.code),
    fourWeeks: entries
      .filter((entry) => entry.noticePeriodLabel === '4 weeks')
      .map((entry) => entry.code),
    twoWeeks: entries
      .filter((entry) => entry.noticePeriodLabel === '2 weeks')
      .map((entry) => entry.code),
    immediate: entries
      .filter((entry) => entry.immediateApplicationAllowed || entry.noticePeriodLabel === 'Immediate application')
      .map((entry) => entry.code),
  };
}

async function ensurePdfParseDomGlobals(): Promise<void> {
  if (typeof globalThis.DOMMatrix !== 'undefined') {
    return;
  }

  try {
    const canvas = await import('canvas');
    const maybeDOMMatrix = (canvas as any).DOMMatrix;
    const maybeImageData = (canvas as any).ImageData;

    if (typeof maybeDOMMatrix !== 'undefined') {
      (globalThis as any).DOMMatrix = maybeDOMMatrix;
    }

    if (typeof globalThis.ImageData === 'undefined' && typeof maybeImageData !== 'undefined') {
      (globalThis as any).ImageData = maybeImageData;
    }
  } catch (error) {
    console.warn('[legal-wording] Could not install canvas DOM globals for pdf-parse:', {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

async function getPDFParseClass(): Promise<any> {
  if (!cachedPDFParseClassPromise) {
    cachedPDFParseClassPromise = (async () => {
      await ensurePdfParseDomGlobals();
      const pdfParseModule = await import('pdf-parse');
      const PDFParse = (pdfParseModule as any).PDFParse;

      if (!PDFParse) {
        throw new Error('PDFParse class not found in pdf-parse module');
      }

      return PDFParse;
    })();
  }

  return cachedPDFParseClassPromise;
}

export async function getEnglandGroundLegalWordings(): Promise<
  Record<EnglandGroundCode, EnglandGroundLegalWording>
> {
  if (!cachedGroundWordingPromise) {
    cachedGroundWordingPromise = (async () => {
      const [bytes, PDFParse] = await Promise.all([
        fs.readFile(LEGAL_WORDING_PATH),
        getPDFParseClass(),
      ]);
      const parser = new PDFParse({ data: bytes });

      try {
        const { text } = await parser.getText();
        const parsed = extractLegalWordingBlocks(text);

        if (Object.keys(parsed).length === 0) {
          throw new EnglandForm3ALegalWordingError(
            'Form 3A statutory legal wording source did not produce any possession ground wording.',
          );
        }

        return parsed;
      } finally {
        await parser.destroy();
      }
    })();
  }

  return cachedGroundWordingPromise;
}

export async function getEnglandForm3AGroundLegalWordingMap(): Promise<
  Partial<Record<EnglandForm3AGroundId, EnglandGroundLegalWording>>
> {
  const groundWordings = await getEnglandGroundLegalWordings();
  return Object.fromEntries(
    Object.entries(groundWordings).map(([code, wording]) => [
      toForm3AGroundId(code as EnglandGroundCode),
      wording,
    ]),
  ) as Partial<Record<EnglandForm3AGroundId, EnglandGroundLegalWording>>;
}

export async function getEnglandForm3ALandlordGuidanceNoticePeriods(): Promise<EnglandForm3ALandlordGuidanceNoticePeriods> {
  if (!cachedLandlordGuidanceNoticePeriodsPromise) {
    cachedLandlordGuidanceNoticePeriodsPromise = (async () => {
      try {
        const [bytes, PDFParse] = await Promise.all([
          fs.readFile(LANDLORD_GUIDANCE_PATH),
          getPDFParseClass(),
        ]);
        const parser = new PDFParse({ data: bytes });

        try {
        const { text } = await parser.getText();
        return extractLandlordGuidanceNoticePeriods(text);
      } finally {
        await parser.destroy();
      }
      } catch (error) {
        console.warn('[legal-wording] Falling back to catalogue-only Form 3A guidance periods:', {
          error: error instanceof Error ? error.message : String(error),
        });
        return buildFallbackGuidanceNoticePeriods();
      }
    })();
  }

  return cachedLandlordGuidanceNoticePeriodsPromise;
}

export async function getEnglandGroundLegalWording(
  code: string | number,
): Promise<EnglandGroundLegalWording | null> {
  const normalized = normalizeEnglandGroundCode(code);
  if (!normalized) {
    return null;
  }

  const groundWordings = await getEnglandGroundLegalWordings();
  return groundWordings[normalized] || null;
}

export async function buildEnglandForm3AGroundsText(grounds: unknown): Promise<string> {
  const parsedGrounds = parseEnglandForm3AGroundCodes(grounds);
  if (parsedGrounds.invalidGrounds.length > 0) {
    throw createMissingLegalWordingError(parsedGrounds.invalidGrounds);
  }

  if (parsedGrounds.grounds.length === 0) {
    throw new EnglandForm3ALegalWordingError(
      'Form 3A question 4.2 cannot be generated because no possession grounds were selected.',
    );
  }

  const groundWordings = await getEnglandGroundLegalWordings();
  const missingGrounds = parsedGrounds.grounds.filter((ground) => !groundWordings[ground]);

  if (missingGrounds.length > 0) {
    throw createMissingLegalWordingError(missingGrounds.map((ground) => `Ground ${ground}`));
  }

  return parsedGrounds.grounds
    .map((ground) => {
      const wording = groundWordings[ground];
      const title = getEnglandGroundDefinition(ground)?.title || wording.title;
      return `Ground ${ground} – ${title}\n${wording.legalWording}`;
    })
    .join('\n\n');
}
