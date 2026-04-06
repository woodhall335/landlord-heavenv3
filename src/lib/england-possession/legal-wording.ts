import 'server-only';

import fs from 'fs/promises';
import path from 'path';
import { PDFParse } from 'pdf-parse';
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

const LEGAL_WORDING_PATH = path.join(
  process.cwd(),
  'artifacts',
  'update',
  'Form_3A_legal_wording_for_possession_grounds.pdf',
);

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

export async function getEnglandGroundLegalWordings(): Promise<
  Record<EnglandGroundCode, EnglandGroundLegalWording>
> {
  if (!cachedGroundWordingPromise) {
    cachedGroundWordingPromise = (async () => {
      const bytes = await fs.readFile(LEGAL_WORDING_PATH);
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
    })();
  }

  return cachedGroundWordingPromise;
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
