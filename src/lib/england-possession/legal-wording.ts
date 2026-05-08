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

function parseGroundCodes(value: string): EnglandGroundCode[] {
  return value
    .split(',')
    .map((entry) => normalizeEnglandGroundCode(entry))
    .filter((entry): entry is EnglandGroundCode => Boolean(entry));
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
  const normalizedText = normaliseMatches(rawText);
  const headingRegex =
    /Ground\s+([0-9A-Z]+)\s+[–-]\s+([^\n]+)\nExplanation\n([\s\S]*?)\nLegal wording\nGround\s+\1\n([\s\S]*?)(?=\nGround\s+[0-9A-Z]+\s+[–-]|\n--\s+\d+\s+of\s+\d+\s+--|$)/g;

  const entries = {} as Record<EnglandGroundCode, EnglandGroundLegalWording>;

  for (const match of normalizedText.matchAll(headingRegex)) {
    const code = normalizeEnglandGroundCode(match[1]);
    if (!code) {
      continue;
    }

    entries[code] = {
      code,
      title: match[2].trim(),
      explanation: cleanGroundText(match[3]),
      legalWording: cleanGroundText(match[4]),
    };
  }

  return entries;
}

function buildFallbackGroundWordings(): Record<EnglandGroundCode, EnglandGroundLegalWording> {
  const entries = {} as Record<EnglandGroundCode, EnglandGroundLegalWording>;

  for (const code of Object.keys(ENGLAND_POST_2026_GROUND_CATALOG) as EnglandGroundCode[]) {
    const definition = ENGLAND_POST_2026_GROUND_CATALOG[code];
    entries[code] = {
      code,
      title: definition.title,
      explanation: definition.title,
      legalWording: `Ground ${code}`,
    };
  }

  return entries;
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
      const module = await import('pdf-parse');
      const PDFParse = (module as any).PDFParse;

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
      try {
        const [bytes, PDFParse] = await Promise.all([
          fs.readFile(LEGAL_WORDING_PATH),
          getPDFParseClass(),
        ]);
        const parser = new PDFParse({ data: bytes });

        try {
        const { text } = await parser.getText();
        const parsed = extractLegalWordingBlocks(text);

        for (const code of Object.keys(ENGLAND_POST_2026_GROUND_CATALOG) as EnglandGroundCode[]) {
          if (!parsed[code]) {
            const definition = ENGLAND_POST_2026_GROUND_CATALOG[code];
            parsed[code] = {
              code,
              title: definition.title,
              explanation: definition.title,
              legalWording: `Ground ${code}`,
            };
          }
        }

        return parsed;
      } finally {
        await parser.destroy();
      }
      } catch (error) {
        console.warn('[legal-wording] Falling back to catalogue-only Form 3A ground wording:', {
          error: error instanceof Error ? error.message : String(error),
        });
        return buildFallbackGroundWordings();
      }
    })();
  }

  return cachedGroundWordingPromise;
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

export async function buildEnglandForm3AGroundsText(
  grounds: Array<string | number>,
): Promise<string> {
  const groundWordings = await getEnglandGroundLegalWordings();

  return grounds
    .map((ground) => normalizeEnglandGroundCode(ground))
    .filter((ground): ground is EnglandGroundCode => Boolean(ground))
    .map((ground) => {
      const wording = groundWordings[ground];
      const title = getEnglandGroundDefinition(ground)?.title || wording.title;
      return `Ground ${ground} - ${title}\n${wording.legalWording}`;
    })
    .join('\n\n');
}
