import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOTS = [
  'src/app',
  'src/components',
  'src/lib',
  'src/data',
];

const SCANNED_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mdx']);
const IGNORE_PATH_SEGMENTS = new Set([
  '\\api\\',
  '/api/',
  '\\(app)\\',
  '/(app)/',
]);

const STALE_PRICE_STRINGS = [
  '£49.99',
  '£99.99',
  '£199.99',
  '£14.99',
  'Â£',
];

function walk(dir: string): string[] {
  const entries = readdirSync(dir);
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      files.push(...walk(fullPath));
      continue;
    }

    if (!stats.isFile()) continue;

    const extension = fullPath.slice(fullPath.lastIndexOf('.'));
    if (!SCANNED_EXTENSIONS.has(extension)) continue;

    const lowerPath = fullPath.replaceAll('\\', '/').toLowerCase();
    const isIgnored = [...IGNORE_PATH_SEGMENTS].some((segment) =>
      lowerPath.includes(segment.replaceAll('\\', '/').toLowerCase())
    );
    if (isIgnored) continue;

    files.push(fullPath);
  }

  return files;
}

describe('Stale Price Guard', () => {
  it('should not contain stale core-product price strings or mojibake in user-facing roots', () => {
    const offending: Array<{ file: string; token: string }> = [];

    for (const root of ROOTS) {
      const files = walk(root);
      for (const file of files) {
        const content = readFileSync(file, 'utf8');
        for (const token of STALE_PRICE_STRINGS) {
          if (content.includes(token)) {
            offending.push({ file, token });
          }
        }
      }
    }

    expect(offending).toEqual([]);
  });
});
