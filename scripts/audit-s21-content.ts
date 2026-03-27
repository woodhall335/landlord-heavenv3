import fs from 'node:fs';
import path from 'node:path';

const REPO_ROOT = process.cwd();
const OUT_PATH = path.join(REPO_ROOT, 'scripts/output/stale-s21-content.json');

const CONTENT_ROOTS = [
  path.join(REPO_ROOT, 'src/lib/blog/posts.tsx'),
  path.join(REPO_ROOT, 'src/app'),
  path.join(REPO_ROOT, 'content'),
];

const STALE_PATTERNS = [
  /before May 2026/i,
  /Section 21 remains/i,
  /act before/i,
  /still available/i,
  /ends on 1 May/i,
  /Section 21 will be/i,
  /serve before/i,
  /days left/i,
];

interface Finding {
  file: string;
  line: number;
  phrase: string;
  match: string;
}

function isTextContentFile(filePath: string): boolean {
  return /\.(md|mdx|ts|tsx|js|jsx)$/i.test(filePath);
}

function walk(entryPath: string): string[] {
  if (!fs.existsSync(entryPath)) {
    return [];
  }

  const stat = fs.statSync(entryPath);
  if (stat.isFile()) {
    return isTextContentFile(entryPath) ? [entryPath] : [];
  }

  return fs.readdirSync(entryPath).flatMap((entry) => {
    const fullPath = path.join(entryPath, entry);
    return walk(fullPath);
  });
}

const files = Array.from(new Set(CONTENT_ROOTS.flatMap(walk)));
const findings: Finding[] = [];

for (const file of files) {
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    for (const pattern of STALE_PATTERNS) {
      const match = lines[index].match(pattern);
      if (!match) continue;

      findings.push({
        file: path.relative(REPO_ROOT, file),
        line: index + 1,
        phrase: pattern.source,
        match: match[0],
      });
    }
  }
}

fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
fs.writeFileSync(OUT_PATH, JSON.stringify(findings, null, 2));

console.log('\nStale Section 21 content audit');
console.log(`Files scanned: ${files.length}`);
console.log(`Issues found: ${findings.length}`);
findings.forEach((finding) => {
  console.log(`  ${finding.file}:${finding.line} - "${finding.match}"`);
});
console.log(`\nFull report: ${OUT_PATH}`);
