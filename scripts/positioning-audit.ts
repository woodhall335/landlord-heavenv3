import fs from 'node:fs';
import path from 'node:path';

export type RouteAuditStatus = 'PASS' | 'WARN' | 'FAIL';

export interface RouteAuditResult {
  filePath: string;
  route: string;
  status: RouteAuditStatus;
  forbiddenMatches: string[];
  heuristicTemplateMatches: string[];
  trustMatches: string[];
  trustCounts: Record<string, number>;
  trustInjected: boolean;
}

const PAGE_ROOT = path.join(process.cwd(), 'src', 'app');

const EXCLUDED_ROUTE_PREFIXES = [
  '/api',
  '/auth',
  '/dashboard',
  '/checkout',
];
const EXCLUDED_ROUTES = new Set(['/privacy', '/terms', '/cookies', '/refunds', '/error', '/not-found']);

const forbiddenPhrases = [
  'free template',
  'free templates',
  'download a template',
  'generic template',
  'template site',
  'just a template',
  'pdf template',
  'copy and paste',
  'fill in the blanks',
] as const;

const trustSignals = [
  'validated',
  'compliance checks',
  'compliance-checked',
  'procedural correctness',
  'court-ready',
  'jurisdiction-specific',
  'same checks a solicitor would',
  'save time',
  'save money',
  'step-by-step',
  'guided wizard',
  'reduces the risk of mistakes',
] as const;

const trustInjectorTokens = [
  'trustpositioningbar',
  'positioning_one_liner',
  '<standardhero',
  'standardhero(',
  '<wizardlandingpage',
  'wizardlandingpage(',
  'showtrustpositioningbar',
] as const;

const templateContextWords = ['free', 'download', 'generic', 'blank'];

function getAllPageFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getAllPageFiles(full));
      continue;
    }

    if (entry.isFile() && entry.name === 'page.tsx') {
      files.push(full);
    }
  }

  return files;
}

function toRoute(filePath: string): string {
  const rel = path.relative(PAGE_ROOT, filePath).replace(/\\/g, '/');
  const route = rel.replace(/\/page\.tsx$/, '').replace(/\((.*?)\)\//g, '');
  return route ? `/${route}` : '/';
}

function countPhrase(content: string, phrase: string): number {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(escaped, 'gi');
  return (content.match(re) || []).length;
}

function getTemplateHeuristicMatches(content: string): string[] {
  const matches: string[] = [];
  const re = /template/gi;

  let hit: RegExpExecArray | null = re.exec(content);
  while (hit) {
    const start = Math.max(0, hit.index - 40);
    const end = Math.min(content.length, hit.index + 40);
    const windowText = content.slice(start, end);
    if (templateContextWords.some((word) => windowText.includes(word))) {
      matches.push(windowText.replace(/\s+/g, ' ').trim());
    }
    hit = re.exec(content);
  }

  return Array.from(new Set(matches));
}

function isAuditedRoute(route: string): boolean {
  if (EXCLUDED_ROUTES.has(route)) return false;
  if (EXCLUDED_ROUTE_PREFIXES.some((prefix) => route.startsWith(prefix))) return false;
  return true;
}

export function auditPositioning(filePaths?: string[]): RouteAuditResult[] {
  const pages = filePaths ?? getAllPageFiles(PAGE_ROOT);

  return pages
    .map((fullPath) => {
      const raw = fs.readFileSync(fullPath, 'utf8');
      const content = raw.toLowerCase();

      const forbiddenMatches = forbiddenPhrases.filter((phrase) => content.includes(phrase));
      const trustCounts = Object.fromEntries(trustSignals.map((s) => [s, countPhrase(content, s)]));
      const trustInjected = trustInjectorTokens.some((token) => content.includes(token));
      const trustMatches = Object.entries(trustCounts)
        .filter(([, count]) => count > 0)
        .map(([signal]) => signal);

      const heuristicTemplateMatches = getTemplateHeuristicMatches(content);
      const hasForbidden = forbiddenMatches.length > 0;
      const trustSignalsDetected = trustMatches.length > 0 || trustInjected;
      const status: RouteAuditStatus = hasForbidden
        ? 'FAIL'
        : !trustSignalsDetected || heuristicTemplateMatches.length > 0
          ? 'WARN'
          : 'PASS';

      return {
        filePath: path.relative(process.cwd(), fullPath).replace(/\\/g, '/'),
        route: toRoute(fullPath),
        status,
        forbiddenMatches,
        heuristicTemplateMatches,
        trustMatches,
        trustCounts,
        trustInjected,
      };
    })
    .filter((result) => isAuditedRoute(result.route))
    .sort((a, b) => a.route.localeCompare(b.route));
}

function printResults(results: RouteAuditResult[]) {
  console.log('\n=== Positioning Audit ===\n');
  console.log('Status | Route | Trust Count | Trust Injected | Forbidden/Heuristic');
  console.log('---|---|---:|---|---');

  for (const result of results) {
    const totalTrust = Object.values(result.trustCounts).reduce((sum, n) => sum + n, 0);
    const forbidden = [...result.forbiddenMatches, ...result.heuristicTemplateMatches.map(() => 'template-near-context')]
      .filter(Boolean)
      .join(', ') || '-';

    const trustInjectedLabel = `trust_injected=${result.trustInjected ? 'true' : 'false'}`;
    console.log(`${result.status.padEnd(5)} | ${result.route} | ${String(totalTrust).padStart(2)} | ${trustInjectedLabel} | ${forbidden}`);
    if (result.forbiddenMatches.length > 0 || result.heuristicTemplateMatches.length > 0 || (result.trustMatches.length === 0 && !result.trustInjected)) {
      console.log(`  file: ${result.filePath}`);
      if (result.forbiddenMatches.length > 0) {
        console.log(`  forbidden: ${result.forbiddenMatches.join(', ')}`);
      }
      if (result.heuristicTemplateMatches.length > 0) {
        console.log(`  template-context: ${result.heuristicTemplateMatches.slice(0, 3).join(' || ')}`);
      }
      console.log(`  ${trustInjectedLabel}`);
      console.log(`  trust-signals: ${result.trustMatches.join(', ') || '(none)'}`);
    }
  }

  const totals = results.reduce(
    (acc, r) => {
      acc[r.status] += 1;
      return acc;
    },
    { PASS: 0, WARN: 0, FAIL: 0 }
  );

  console.log('\n=== Summary ===');
  console.log(`PASS: ${totals.PASS}`);
  console.log(`WARN: ${totals.WARN}`);
  console.log(`FAIL: ${totals.FAIL}`);
}

function parseCliMode(args: string[]): 'default' | 'strict' | 'warn-only' {
  if (args.includes('--warn-only')) return 'warn-only';
  if (args.includes('--strict')) return 'strict';
  return 'default';
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const results = auditPositioning();
  printResults(results);

  const mode = parseCliMode(process.argv.slice(2));
  const hasFail = results.some((r) => r.status === 'FAIL');
  const hasWarn = results.some((r) => r.status === 'WARN');

  if (mode === 'warn-only') {
    process.exitCode = 0;
  } else if (mode === 'strict' ? hasFail || hasWarn : hasFail) {
    process.exitCode = 1;
  }
}
