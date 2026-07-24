import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const PUBLIC_SOURCE_ROOTS = [
  path.join(process.cwd(), 'src', 'app'),
  path.join(process.cwd(), 'src', 'components'),
  path.join(process.cwd(), 'src', 'lib', 'blog'),
];

const FORBIDDEN_PUBLIC_PHRASES = [
  'useful SEO value',
  'Visuals to insert in next content sprint',
  'Image and diagram placeholders',
  'programmatic page',
];

function sourceFiles(root: string): string[] {
  return fs.readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(root, entry.name);
    if (entry.isDirectory()) return sourceFiles(absolute);
    return /\.(tsx?|mdx)$/.test(entry.name) ? [absolute] : [];
  });
}

describe('SALES-001 public copy guard', () => {
  it('does not ship known internal-production phrases in public source', () => {
    const violations = PUBLIC_SOURCE_ROOTS.flatMap(sourceFiles).flatMap((file) => {
      const source = fs.readFileSync(file, 'utf8');
      return FORBIDDEN_PUBLIC_PHRASES.filter((phrase) => source.includes(phrase)).map(
        (phrase) => `${path.relative(process.cwd(), file)}: ${phrase}`,
      );
    });

    expect(violations).toEqual([]);
  });
});
