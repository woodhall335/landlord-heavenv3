import fs from 'node:fs';
import path from 'node:path';

const workspaceRoot = process.cwd();
const srcRoot = path.join(workspaceRoot, 'src');

const textFilePattern = /\.(ts|tsx|js|jsx|mjs|cjs|md|json)$/i;
const mojibakePattern = new RegExp(
  '(?:\\u00C3|\\u00C2|\\u00E2|\\u00F0\\u0178|\\u00EF\\u00B8)'
);

const intentionallyExcludedFiles = new Set([
  path.join(srcRoot, 'lib', 'seo', 'metadata.ts'),
  path.join(srcRoot, 'lib', 'documents', 'generator.ts'),
]);

function walkFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.next' || entry.name === 'output') {
      continue;
    }

    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(fullPath, acc);
      continue;
    }

    if (textFilePattern.test(entry.name)) {
      acc.push(fullPath);
    }
  }

  return acc;
}

function collectViolations(filePath: string): string[] {
  const text = fs.readFileSync(filePath, 'utf8');
  const lines = text.split(/\r?\n/);
  const violations: string[] = [];

  lines.forEach((line, index) => {
    if (mojibakePattern.test(line)) {
      violations.push(`${path.relative(workspaceRoot, filePath)}:${index + 1}`);
    }
  });

  return violations;
}

describe('source content is free of mojibake', () => {
  it('does not contain corrupted cp1252/utf-8 text in source files', () => {
    const violations = walkFiles(srcRoot)
      .filter((filePath) => !intentionallyExcludedFiles.has(filePath))
      .flatMap((filePath) => collectViolations(filePath));

    expect(violations).toEqual([]);
  });
});
