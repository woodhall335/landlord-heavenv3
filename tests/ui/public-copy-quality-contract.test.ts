import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const PUBLIC_DIRS = [
  path.join(process.cwd(), 'src', 'app'),
  path.join(process.cwd(), 'src', 'components', 'seo'),
];

const FORBIDDEN_VISITOR_PHRASES = [
  /\bsearch intent\b/i,
  /\bowner page\b/i,
  /\brank better\b/i,
  /\bconvert better\b/i,
  /\bright seo page\b/i,
  /\bkeyword (?:target|cluster|coverage)\b/i,
  /\bcommercial and seo\b/i,
  /\bcompetitor pages?\b/i,
  /\boutrank\b/i,
  /\bthin legacy seo page\b/i,
  /\bsearch-first landing page\b/i,
];

function sourceFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(absolute);
    return entry.isFile() && /\.(?:ts|tsx)$/.test(entry.name) ? [absolute] : [];
  });
}

function visitorText(source: string): string {
  const jsx = [...source.matchAll(/>([^<>{}][^<>{}]*)</g)].map((match) => match[1]);
  const strings = [...source.matchAll(/(['"`])((?:\\.|(?!\1)[\s\S])*?)\1/g)]
    .map((match) => match[2])
    .filter((value) => /\s/.test(value) && !value.trim().startsWith('@/'));
  return [...jsx, ...strings].join(' ');
}

describe('public copy quality contract', () => {
  it('keeps internal SEO/editorial language out of visitor-facing copy', () => {
    const offenders = PUBLIC_DIRS.flatMap(sourceFiles)
      .filter((file) => !file.includes(`${path.sep}__tests__${path.sep}`) && !/\.test\.[tj]sx?$/.test(file))
      .flatMap((file) => {
        const source = fs.readFileSync(file, 'utf8');
        const text = visitorText(source);
        const matches = FORBIDDEN_VISITOR_PHRASES.filter((pattern) => pattern.test(text)).map(String);
        return matches.length
          ? [{ file: path.relative(process.cwd(), file).replace(/\\/g, '/'), matches }]
          : [];
      });

    expect(offenders).toEqual([]);
  });
});
