if (typeof window === 'undefined') {
  void import('server-only').catch(() => undefined);
}

import {
  type EnglandGroundCode,
  ENGLAND_POST_2026_GROUND_CATALOG,
  getEnglandGroundDefinition,
  normalizeEnglandGroundCode,
} from './ground-catalog';
import { ENGLAND_FORM3A_GROUND_LEGAL_WORDING_MAP } from './form3a-ground-wording-map';

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

let cachedGroundWordingPromise: Promise<Partial<Record<EnglandGroundCode, EnglandGroundLegalWording>>> | null = null;
let cachedLandlordGuidanceNoticePeriodsPromise: Promise<EnglandForm3ALandlordGuidanceNoticePeriods> | null = null;

export interface EnglandForm3ALandlordGuidanceNoticePeriods {
  fourMonths: string[];
  twoMonths: string[];
  fourWeeks: string[];
  twoWeeks: string[];
  immediate: string[];
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

function buildStaticGroundWordingsByCode(): Partial<Record<EnglandGroundCode, EnglandGroundLegalWording>> {
  const entries: Partial<Record<EnglandGroundCode, EnglandGroundLegalWording>> = {};

  for (const wording of Object.values(ENGLAND_FORM3A_GROUND_LEGAL_WORDING_MAP)) {
    entries[wording.code] = {
      code: wording.code,
      title: wording.title,
      explanation: wording.explanation,
      legalWording: wording.legalWording,
    };
  }

  return entries;
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

export async function getEnglandGroundLegalWordings(): Promise<
  Partial<Record<EnglandGroundCode, EnglandGroundLegalWording>>
> {
  if (!cachedGroundWordingPromise) {
    cachedGroundWordingPromise = Promise.resolve(buildStaticGroundWordingsByCode());
  }

  return cachedGroundWordingPromise;
}

export async function getEnglandForm3AGroundLegalWordingMap(): Promise<
  Partial<Record<EnglandForm3AGroundId, EnglandGroundLegalWording>>
> {
  return ENGLAND_FORM3A_GROUND_LEGAL_WORDING_MAP;
}

export async function getEnglandForm3ALandlordGuidanceNoticePeriods(): Promise<EnglandForm3ALandlordGuidanceNoticePeriods> {
  if (!cachedLandlordGuidanceNoticePeriodsPromise) {
    cachedLandlordGuidanceNoticePeriodsPromise = Promise.resolve(buildFallbackGuidanceNoticePeriods());
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
      if (!wording) {
        throw createMissingLegalWordingError([`Ground ${ground}`]);
      }
      const title = getEnglandGroundDefinition(ground)?.title || wording.title;
      return `Ground ${ground} – ${title}\n${wording.legalWording}`;
    })
    .join('\n\n');
}
