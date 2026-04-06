import fs from 'node:fs';
import path from 'node:path';
import {
  CURRENT_FRAMEWORK_MIN_VISIBLE_WORDS,
  CURRENT_ENGLAND_FRAMEWORK_PAGES,
  getCurrentFrameworkVisibleWordCount,
} from '../src/lib/seo/england-current-framework-pages';
import {
  LEGACY_TERM_LABELS,
  LEGACY_TERM_PATTERNS,
  MARKETING_PAGE_MIN_VISIBLE_WORDS,
  CURRENT_ENGLAND_MARKETING_ROUTES,
  isAllowedLegacyTermPath,
  normalizeRepoPath,
} from '../src/lib/renters-rights-transition';

const REPO_ROOT = process.cwd();
const INVENTORY_PATH = path.join(REPO_ROOT, 'audit', 'section21-transition-inventory.json');
const REPORT_PATH = path.join(REPO_ROOT, 'audit', 'section21-transition-report.md');
const RETIRED_ROUTES_PATH = path.join(REPO_ROOT, 'config', 'retired-public-routes.json');
const RETIRED_ROUTE_SOURCE_MAP = JSON.parse(
  fs.readFileSync(RETIRED_ROUTES_PATH, 'utf8')
) as { routeRedirects: Record<string, string> };
const RETIRED_ROUTE_PAGE_SUFFIXES = Object.keys(RETIRED_ROUTE_SOURCE_MAP.routeRedirects).map((route) =>
  normalizeRepoPath(path.join('src', 'app', ...route.slice(1).split('/'), 'page.tsx'))
);

const TEXT_FILE_PATTERN = /\.(md|mdx|json|ts|tsx|js|jsx|mjs)$/i;
const SKIP_DIRS = new Set(['.git', '.next', 'node_modules', 'coverage', 'dist', 'build']);
const ACTIVE_PUBLIC_SCAN_PATHS = [
  'src/lib/seo/england-current-framework-pages.ts',
  'src/components/seo/CurrentFrameworkGuidePage.tsx',
  'src/lib/seo/internal-links.ts',
  'src/lib/ask-heaven/cta-copy.ts',
  'src/components/ask-heaven/AskHeavenNextStepsCards.tsx',
  'src/components/ask-heaven/NextBestActionCard.tsx',
  'src/app/(marketing)/about/page.tsx',
  'src/app/(marketing)/help/page.tsx',
  'src/app/terms/page.tsx',
  'src/app/(marketing)/blog/page.tsx',
  'src/app/(marketing)/blog/[slug]/page.tsx',
  'src/lib/blog/topic-hubs.ts',
  'src/components/blog/NextSteps.tsx',
  'src/components/blog/BlogProse.tsx',
  'src/app/(app)/dashboard/admin/email-previews/page.tsx',
  'src/app/(app)/dashboard/admin/page.tsx',
] as const;

type Classification =
  | 'approved_transition_hub'
  | 'approved_redirect_metadata'
  | 'devolved_historical_note'
  | 'deprecated_historical'
  | 'test_or_audit'
  | 'internal_compatibility'
  | 'inactive_retired_runtime_support'
  | 'active_current_facing_violation';

interface MatchRecord {
  file: string;
  line: number;
  term: string;
  snippet: string;
  classification: Classification;
  reason: string;
}

function isTextFile(filePath: string) {
  return TEXT_FILE_PATTERN.test(filePath);
}

function walk(entryPath: string): string[] {
  if (!fs.existsSync(entryPath)) {
    return [];
  }

  const stat = fs.statSync(entryPath);
  if (stat.isFile()) {
    return isTextFile(entryPath) ? [entryPath] : [];
  }

  return fs.readdirSync(entryPath).flatMap((entry) => {
    if (SKIP_DIRS.has(entry)) {
      return [];
    }
    return walk(path.join(entryPath, entry));
  });
}

function classifyPath(file: string): { classification: Classification; reason: string } {
  const normalized = normalizeRepoPath(file);

  if (isAllowedLegacyTermPath(normalized)) {
    if (normalized.endsWith('config/retired-public-routes.json')) {
      return {
        classification: 'approved_redirect_metadata',
        reason: 'Legacy terms are allowed in redirect metadata and transition audit sources.',
      };
    }

    return {
      classification: 'approved_transition_hub',
      reason: 'Legacy terms are allowed on the four approved transition hubs only.',
    };
  }

  if (
    normalized.startsWith('docs/') ||
    normalized.startsWith('reports/') ||
    normalized.startsWith('audit-output/') ||
    normalized.startsWith('recommendations-output/') ||
    normalized === 'seo-report.json'
  ) {
    return {
      classification: 'test_or_audit',
      reason: 'Generated reports and documentation are permitted to mention legacy terms for audit history.',
    };
  }

  if (
    RETIRED_ROUTE_PAGE_SUFFIXES.some((suffix) => normalized.endsWith(suffix)) &&
    !isAllowedLegacyTermPath(normalized)
  ) {
    return {
      classification: 'deprecated_historical',
      reason: 'Retired route source remains in the repo only as deprecated historical content behind redirects.',
    };
  }

  if (
    normalized.includes('src/lib/wales/') ||
    normalized.includes('src/app/wales-') ||
    normalized.includes('src/app/scotland-') ||
    normalized.includes('src/app/northern-ireland-')
  ) {
    return {
      classification: 'devolved_historical_note',
      reason: 'Minimal historical notes are tolerated for devolved-nation handling and sanitisation.',
    };
  }

  if (normalized.endsWith('src/lib/blog/posts.tsx')) {
    return {
      classification: 'deprecated_historical',
      reason: 'Legacy blog posts are retained only as deprecated historical content and are excluded from active blog exports.',
    };
  }

  if (
    normalized.endsWith('src/app/(marketing)/blog/[slug]/page.tsx') ||
    normalized.endsWith('src/components/blog/NextSteps.tsx') ||
    normalized.endsWith('src/components/blog/BlogProse.tsx')
  ) {
    return {
      classification: 'inactive_retired_runtime_support',
      reason: 'This code only supports retired blog flows or filtered historical content and is not treated as active current-facing copy.',
    };
  }

  if (
    normalized.startsWith('tests/') ||
    normalized.startsWith('audit/') ||
    normalized.startsWith('scripts/')
  ) {
    return {
      classification: 'test_or_audit',
      reason: 'Tests and audit assets are permitted to reference legacy terms for enforcement.',
    };
  }

  if (
    normalized.includes('src/app/(app)/') ||
    normalized.includes('src/app/api/') ||
    normalized.includes('src/lib/documents/') ||
    normalized.includes('src/lib/evidence/') ||
    normalized.includes('src/lib/validation/') ||
    normalized.includes('src/lib/decision-engine/') ||
    normalized.includes('src/lib/case-facts/') ||
    normalized.includes('src/lib/notices/') ||
    normalized.includes('src/lib/validators/') ||
    normalized.includes('src/lib/wizard/') ||
    normalized.includes('src/lib/seo/eviction-intent-pages.ts') ||
    normalized.includes('src/lib/seo/wizard-landing-content.ts') ||
    normalized.includes('src/lib/seo/pillar-pages-content.ts') ||
    normalized.includes('src/data/faqs/') ||
    normalized.includes('src/lib/section21') ||
    normalized.includes('src/components/dashboard/Section21ActionRequired.tsx')
  ) {
    return {
      classification: 'internal_compatibility',
      reason: 'Internal compatibility code remains in place for fulfillment, review, and route-gating logic.',
    };
  }

  if (
    ACTIVE_PUBLIC_SCAN_PATHS.some((activePath) =>
      normalized.endsWith(normalizeRepoPath(activePath))
    )
  ) {
    return {
      classification: 'active_current_facing_violation',
      reason: 'Legacy terminology is not allowed in active current-facing England content.',
    };
  }

  return {
    classification: 'internal_compatibility',
    reason: 'Non-owner source retained as internal compatibility or backlog content outside the public allowlist scan.',
  };
}

function buildMatches(files: string[]): MatchRecord[] {
  const results: MatchRecord[] = [];

  for (const absoluteFile of files) {
    const relativeFile = normalizeRepoPath(path.relative(REPO_ROOT, absoluteFile));
    const { classification, reason } = classifyPath(relativeFile);
    const lines = fs.readFileSync(absoluteFile, 'utf8').split(/\r?\n/);

    lines.forEach((line, index) => {
      LEGACY_TERM_PATTERNS.forEach((pattern, termIndex) => {
        const match = line.match(pattern);
        if (!match) return;

        results.push({
          file: relativeFile,
          line: index + 1,
          term: LEGACY_TERM_LABELS[termIndex],
          snippet: line.trim(),
          classification,
          reason,
        });
      });
    });
  }

  return results;
}

function getForm3Violations() {
  const filesToCheck = [
    path.join(REPO_ROOT, 'src', 'lib', 'seo', 'england-current-framework-pages.ts'),
    path.join(REPO_ROOT, 'src', 'app', '(marketing)', 'about', 'page.tsx'),
    path.join(REPO_ROOT, 'src', 'app', '(marketing)', 'help', 'page.tsx'),
    path.join(REPO_ROOT, 'src', 'lib', 'seo', 'internal-links.ts'),
  ];

  return filesToCheck.flatMap((absoluteFile) => {
    if (!fs.existsSync(absoluteFile)) return [];
    const relativeFile = normalizeRepoPath(path.relative(REPO_ROOT, absoluteFile));
    return fs
      .readFileSync(absoluteFile, 'utf8')
      .split(/\r?\n/)
      .flatMap((line, index) => {
        if (/\bForm 3\b(?!A)/.test(line)) {
          return [`${relativeFile}:${index + 1}:${line.trim()}`];
        }
        return [];
      });
  });
}

function buildWordCounts() {
  return Object.entries(CURRENT_ENGLAND_FRAMEWORK_PAGES).map(([slug, config]) => ({
    slug,
    visibleWordCount: getCurrentFrameworkVisibleWordCount(config),
    passes: getCurrentFrameworkVisibleWordCount(config) >= CURRENT_FRAMEWORK_MIN_VISIBLE_WORDS,
  }));
}

export function runSection21TransitionAudit() {
  const retiredRoutes = JSON.parse(
    fs.readFileSync(RETIRED_ROUTES_PATH, 'utf8')
  ) as { routeRedirects: Record<string, string> };
  const redirectMap = retiredRoutes.routeRedirects ?? {};
  const files = walk(REPO_ROOT);
  const matches = buildMatches(files);
  const violations = matches.filter((match) => match.classification === 'active_current_facing_violation');
  const form3Violations = getForm3Violations();
  const wordCounts = buildWordCounts();
  const retainedMatches = matches
    .filter((match) => match.classification !== 'active_current_facing_violation')
    .slice(0, 500);
  const classificationCounts = matches.reduce<Record<string, number>>((acc, match) => {
    acc[match.classification] = (acc[match.classification] ?? 0) + 1;
    return acc;
  }, {});

  const inventory = {
    generatedAt: new Date().toISOString(),
    scannedFiles: files.length,
    updatedPages: CURRENT_ENGLAND_MARKETING_ROUTES,
    wordCounts,
    legacyReferencesRetained: retainedMatches,
    legacyReferencesRemovedOrRetired: [
      ...Object.keys(redirectMap).map((source) => ({
        source,
        destination: redirectMap[source],
      })),
    ],
    redirectsApplied: Object.entries(redirectMap).map(([source, destination]) => ({
      source,
      destination,
    })),
    itemsNeedingLegalReview: violations,
    form3TerminologyViolations: form3Violations,
    summary: {
      totalLegacyMatches: matches.length,
      activeViolations: violations.length,
      form3Violations: form3Violations.length,
      wordCountFailures: wordCounts.filter((entry) => !entry.passes).length,
      classificationCounts,
    },
  };

  const report = [
    '# Section 21 Transition Audit',
    '',
    `Generated: ${inventory.generatedAt}`,
    '',
    '## Summary',
    `- Files scanned: ${inventory.scannedFiles}`,
    `- Legacy-term matches: ${inventory.summary.totalLegacyMatches}`,
    `- Active current-facing violations: ${inventory.summary.activeViolations}`,
    `- Form 3 terminology violations: ${inventory.summary.form3Violations}`,
    `- Marketing pages below ${MARKETING_PAGE_MIN_VISIBLE_WORDS} words: ${inventory.summary.wordCountFailures}`,
    '',
    '## Updated Pages',
    ...inventory.updatedPages.map((route) => `- ${route}`),
    '',
    '## Marketing Word Counts',
    ...wordCounts.map(
      (entry) =>
        `- ${entry.slug}: ${entry.visibleWordCount} words${entry.passes ? '' : ' (below minimum)'}`
    ),
    '',
    '## Redirects Applied',
    ...inventory.redirectsApplied.map((entry) => `- ${entry.source} -> ${entry.destination}`),
    '',
    '## Retained Legacy References',
    ...(inventory.legacyReferencesRetained.length > 0
      ? inventory.legacyReferencesRetained.slice(0, 60).map(
          (entry) => `- ${entry.file}:${entry.line} | ${entry.term} | ${entry.classification}`
        )
      : ['- None']),
    '',
    '## Items Needing Legal Review',
    ...(violations.length > 0
      ? violations.map((entry) => `- ${entry.file}:${entry.line} | ${entry.term} | ${entry.snippet}`)
      : ['- None']),
    '',
    '## Form 3 Terminology Review',
    ...(form3Violations.length > 0 ? form3Violations.map((entry) => `- ${entry}`) : ['- None']),
  ].join('\n');

  fs.mkdirSync(path.dirname(INVENTORY_PATH), { recursive: true });
  fs.writeFileSync(INVENTORY_PATH, JSON.stringify(inventory, null, 2));
  fs.writeFileSync(REPORT_PATH, report);

  return { inventory, report, violations, form3Violations, wordCounts };
}

const isDirectRun =
  process.argv[1] && path.resolve(process.argv[1]).endsWith(path.normalize('scripts/audit-s21-content.ts'));

if (isDirectRun) {
  const { inventory, violations, form3Violations, wordCounts } = runSection21TransitionAudit();
  console.log('Section 21 transition audit');
  console.log(`Files scanned: ${inventory.scannedFiles}`);
  console.log(`Legacy-term matches: ${inventory.summary.totalLegacyMatches}`);
  console.log(`Active current-facing violations: ${violations.length}`);
  console.log(`Form 3 terminology violations: ${form3Violations.length}`);
  console.log(
    `Marketing pages under minimum: ${wordCounts.filter((entry) => !entry.passes).length}`
  );
  console.log(`Inventory: ${normalizeRepoPath(path.relative(REPO_ROOT, INVENTORY_PATH))}`);
  console.log(`Report: ${normalizeRepoPath(path.relative(REPO_ROOT, REPORT_PATH))}`);

  if (violations.length > 0 || form3Violations.length > 0 || wordCounts.some((entry) => !entry.passes)) {
    process.exitCode = 1;
  }
}
