import { readdirSync, readFileSync } from 'fs';
import { join, relative } from 'path';
import { describe, expect, it } from 'vitest';

type TrustTextMatch = {
  file: string;
  line: number;
  text: string;
  length: number;
};

const TRUST_TEXT_PATTERN =
  /trustText\s*(?:=|:)\s*(?:"([^"]+)"|'([^']+)')/g;

function walkSourceFiles(dir: string): string[] {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkSourceFiles(fullPath));
      continue;
    }

    if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

function collectTrustTexts(): TrustTextMatch[] {
  const files = walkSourceFiles(join(process.cwd(), 'src'));

  const matches: TrustTextMatch[] = [];

  for (const file of files) {
    const source = readFileSync(file, 'utf8');
    let match: RegExpExecArray | null;

    while ((match = TRUST_TEXT_PATTERN.exec(source)) !== null) {
      const text = match[1] ?? match[2] ?? '';
      const line = source.slice(0, match.index).split('\n').length;
      matches.push({
        file: relative(process.cwd(), file).replace(/\\/g, '/'),
        line,
        text,
        length: text.length,
      });
    }
  }

  return matches;
}

describe('UniversalHero trust text audit', () => {
  it('keeps static trust text short enough for the shared review pill layout', () => {
    const offenders = collectTrustTexts().filter((entry) => entry.length > 75);

    expect(
      offenders.map(
        (entry) => `${entry.length} chars | ${entry.file}:${entry.line} | ${entry.text}`
      )
    ).toEqual([]);
  });
});
