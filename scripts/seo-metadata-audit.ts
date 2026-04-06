#!/usr/bin/env npx tsx
/**
 * SEO Metadata Audit Script
 *
 * Validates public routes for:
 * - metadata export presence
 * - canonical, Twitter card, and OG image coverage
 * - page title quality and duplicate brand usage
 * - meta description quality
 * - keyword coverage and basic targeting
 *
 * This script is intentionally heuristic. Google does not publish strict
 * character limits for titles or descriptions, so we use internal target
 * ranges for concise, descriptive SERP copy.
 */

import fs from 'node:fs';
import path from 'node:path';
import { discoverStaticPageRoutes } from '../src/lib/seo/static-route-inventory';
import {
  auditMetadataText,
  normalizeKeywordList,
  SEO_DESCRIPTION_RECOMMENDED_MAX,
  SEO_DESCRIPTION_RECOMMENDED_MIN,
  SEO_TITLE_RECOMMENDED_MAX,
  SEO_TITLE_RECOMMENDED_MIN,
} from '../src/lib/seo/metadata';
import { INTENT_PAGES } from '../src/lib/seo/eviction-intent-pages';
import { PHASE5_PAGES } from '../src/lib/seo/phase5-pages';
import { PASS2_LONGFORM_PAGES } from '../src/lib/seo/pass2-longform-content';

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

const EXEMPT_ROUTE_PREFIXES = [
  '/api',
  '/auth',
  '/dashboard',
  '/wizard',
  '/admin',
  '/_next',
  '/success',
];

const APP_DIR = path.join(process.cwd(), 'src', 'app');
const ROOT_LAYOUT_PATH = path.join(APP_DIR, 'layout.tsx');
const PAGE_FILE_NAMES = new Set(['page.tsx', 'page.ts']);
const DYNAMIC_SEGMENT_PATTERN = /^\[.*\]$/;
const ROUTE_GROUP_PATTERN = /^\(.*\)$/;
const PARALLEL_SEGMENT_PATTERN = /^@/;

type SharedMetadataShape = {
  source: 'intent' | 'phase5' | 'pass2';
  title: string;
  description: string;
  keywords: string[];
};

type AuditResult = {
  route: string;
  filePath: string | null;
  hasMetadataExport: boolean;
  hasCanonical: boolean;
  hasTwitterCard: boolean;
  hasKeywords: boolean;
  hasOgImage: boolean;
  title: string | null;
  description: string | null;
  keywords: string[];
  errors: string[];
  warnings: string[];
};

type GlobalMetadataDefaults = {
  hasTwitterCard: boolean;
  hasOgImage: boolean;
  hasKeywords: boolean;
};

function isExemptRoute(route: string): boolean {
  return EXEMPT_ROUTE_PREFIXES.some((prefix) => route.startsWith(prefix));
}

function walkFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith('.')) {
      continue;
    }

    const absPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkFiles(absPath));
      continue;
    }

    files.push(absPath);
  }

  return files;
}

function routeFromPageFile(appDir: string, absFilePath: string): string | null {
  const rel = path.relative(appDir, absFilePath);
  const segments = rel.split(path.sep).filter(Boolean);
  const fileName = segments.at(-1);

  if (!fileName || !PAGE_FILE_NAMES.has(fileName)) {
    return null;
  }

  segments.pop();

  if (segments.some((segment) => DYNAMIC_SEGMENT_PATTERN.test(segment))) {
    return null;
  }

  const normalizedSegments = segments.filter(
    (segment) => !ROUTE_GROUP_PATTERN.test(segment) && !PARALLEL_SEGMENT_PATTERN.test(segment),
  );

  return normalizedSegments.length > 0 ? `/${normalizedSegments.join('/')}` : '/';
}

function buildPageFileIndex(appDir: string): Map<string, string> {
  const index = new Map<string, string>();

  if (!fs.existsSync(appDir)) {
    return index;
  }

  for (const absFilePath of walkFiles(appDir)) {
    if (!PAGE_FILE_NAMES.has(path.basename(absFilePath)) || absFilePath.includes(`${path.sep}__tests__${path.sep}`)) {
      continue;
    }

    const route = routeFromPageFile(appDir, absFilePath);
    if (!route || index.has(route)) {
      continue;
    }

    index.set(route, absFilePath);
  }

  return index;
}

const pageFileIndex = buildPageFileIndex(APP_DIR);

function detectGlobalMetadataDefaults(): GlobalMetadataDefaults {
  if (!fs.existsSync(ROOT_LAYOUT_PATH)) {
    return {
      hasTwitterCard: false,
      hasOgImage: false,
      hasKeywords: false,
    };
  }

  const layoutContent = fs.readFileSync(ROOT_LAYOUT_PATH, 'utf8');
  const usesDefaultMetadata = layoutContent.includes('...defaultMetadata');

  return {
    hasTwitterCard: usesDefaultMetadata,
    hasOgImage: usesDefaultMetadata,
    hasKeywords: usesDefaultMetadata,
  };
}

const globalMetadataDefaults = detectGlobalMetadataDefaults();

function findPageFile(route: string): string | null {
  return pageFileIndex.get(route) ?? null;
}

function findNearestLayoutFile(pageFilePath: string): string | null {
  let currentDir = path.dirname(pageFilePath);

  while (currentDir.startsWith(APP_DIR)) {
    const candidates = [
      path.join(currentDir, 'layout.tsx'),
      path.join(currentDir, 'layout.ts'),
    ];

    for (const candidate of candidates) {
      if (fs.existsSync(candidate)) {
        return candidate;
      }
    }

    if (currentDir === APP_DIR) {
      break;
    }

    currentDir = path.dirname(currentDir);
  }

  return null;
}

function getSharedMetadata(route: string): SharedMetadataShape | null {
  const slug = route === '/' ? '' : route.slice(1);
  if (!slug) {
    return null;
  }

  if (slug in INTENT_PAGES) {
    const page = INTENT_PAGES[slug];
    return {
      source: 'intent',
      title: page.title,
      description: page.description,
      keywords: normalizeKeywordList([page.keyword]),
    };
  }

  if (slug in PHASE5_PAGES) {
    const page = PHASE5_PAGES[slug];
    return {
      source: 'phase5',
      title: page.title,
      description: page.description,
      keywords: normalizeKeywordList(page.keywords),
    };
  }

  if (slug in PASS2_LONGFORM_PAGES) {
    const page = PASS2_LONGFORM_PAGES[slug];
    return {
      source: 'pass2',
      title: page.title,
      description: page.description,
      keywords: [],
    };
  }

  return null;
}

function extractMetadataWindow(content: string): string {
  const exportMarkers = [
    'export const metadata',
    'export async function generateMetadata',
    'export function generateMetadata',
  ];

  const startIndex = exportMarkers
    .map((marker) => content.indexOf(marker))
    .filter((index) => index >= 0)
    .sort((a, b) => a - b)[0];

  if (startIndex === undefined) {
    return content.split(/\r?\n/).slice(0, 220).join('\n');
  }

  return content.slice(startIndex, startIndex + 6000);
}

function extractFirstValue(head: string, fieldName: string): string | null {
  const patterns = [
    new RegExp(`${fieldName}:\\s*['"\`]([^'"\`]+)['"\`]`),
    new RegExp(`${fieldName}:\\s*\\n\\s*['"\`]([^'"\`]+)['"\`]`),
    new RegExp(`${fieldName}:\\s*\\{\\s*absolute:\\s*['"\`]([^'"\`]+)['"\`]`),
  ];

  for (const pattern of patterns) {
    const match = head.match(pattern);
    if (match) {
      return match[1].replace(/\s+/g, ' ').trim();
    }
  }

  return null;
}

function extractKeywords(head: string): string[] {
  const arrayMatch = head.match(/keywords:\s*\[([\s\S]*?)\]/);
  if (arrayMatch) {
    return normalizeKeywordList(
      arrayMatch[1]
        .split(',')
        .map((value) => value.trim().replace(/['"`]/g, ''))
        .filter(Boolean),
    );
  }

  const stringMatch = head.match(/keywords:\s*['"`]([^'"`]+)['"`]/);
  if (stringMatch) {
    return normalizeKeywordList(
      stringMatch[1]
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean),
    );
  }

  return [];
}

function auditRoute(route: string): AuditResult {
  const filePath = findPageFile(route);
  const sharedMetadata = getSharedMetadata(route);

  if (!filePath) {
    return {
      route,
      filePath: null,
      hasMetadataExport: false,
      hasCanonical: false,
      hasTwitterCard: false,
      hasKeywords: false,
      hasOgImage: false,
      title: sharedMetadata?.title ?? null,
      description: sharedMetadata?.description ?? null,
      keywords: sharedMetadata?.keywords ?? [],
      errors: ['Page file not found'],
      warnings: [],
    };
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const pageHasMetadataExport = /export\s+(const metadata|async function generateMetadata|function generateMetadata)/.test(content);
  const layoutPath = pageHasMetadataExport ? null : findNearestLayoutFile(filePath);
  const layoutContent = layoutPath ? fs.readFileSync(layoutPath, 'utf8') : '';
  const layoutHasMetadataExport = layoutContent
    ? /export\s+(const metadata|async function generateMetadata|function generateMetadata)/.test(layoutContent)
    : false;
  const metadataSourceContent = pageHasMetadataExport
    ? content
    : layoutHasMetadataExport
      ? layoutContent
      : content;
  const metadataWindow = extractMetadataWindow(metadataSourceContent);
  const hasMetadataExport = pageHasMetadataExport || layoutHasMetadataExport;
  const usesSharedHelper = /getIntentPageMetadata\(|getPhase5Metadata\(|getPass2Metadata\(/.test(metadataSourceContent);
  const usesMetadataGenerator = /=\s*generateMetadataForPageType\(|=\s*generateMetadata\(/.test(metadataSourceContent);
  const helperGuarantees = usesSharedHelper || usesMetadataGenerator;

  const title = sharedMetadata?.title ?? extractFirstValue(metadataWindow, 'title');
  const description = sharedMetadata?.description ?? extractFirstValue(metadataWindow, 'description');
  const keywords = sharedMetadata?.keywords.length
    ? sharedMetadata.keywords
    : extractKeywords(metadataWindow);

  const result: AuditResult = {
    route,
    filePath,
    hasMetadataExport,
    hasCanonical: helperGuarantees || metadataWindow.includes('alternates:') || metadataWindow.includes('canonical:'),
    hasTwitterCard: helperGuarantees || metadataWindow.includes('twitter:') || globalMetadataDefaults.hasTwitterCard,
    hasKeywords: helperGuarantees || keywords.length > 0 || globalMetadataDefaults.hasKeywords,
    hasOgImage: helperGuarantees || metadataWindow.includes('openGraph:') || metadataWindow.includes('images:') || globalMetadataDefaults.hasOgImage,
    title,
    description,
    keywords,
    errors: [],
    warnings: [],
  };

  if (!hasMetadataExport) {
    result.errors.push('No metadata export found');
    return result;
  }

  if (!result.hasCanonical) {
    result.errors.push('Missing canonical metadata');
  }
  if (!result.hasTwitterCard) {
    result.errors.push('Missing Twitter card metadata');
  }
  if (!result.hasOgImage) {
    result.errors.push('Missing Open Graph image metadata');
  }
  if (!result.hasKeywords) {
    result.warnings.push('No keywords detected for this page');
  }

  for (const issue of auditMetadataText({ title, description, keywords })) {
    if (issue.level === 'error') {
      result.errors.push(issue.message);
    } else {
      result.warnings.push(issue.message);
    }
  }

  return result;
}

function printPolicy(): void {
  console.log(colors.bold + 'SEO metadata policy' + colors.reset);
  console.log(`- Page title target: ${SEO_TITLE_RECOMMENDED_MIN}-${SEO_TITLE_RECOMMENDED_MAX} characters`);
  console.log(`- Meta description target: ${SEO_DESCRIPTION_RECOMMENDED_MIN}-${SEO_DESCRIPTION_RECOMMENDED_MAX} characters`);
  console.log('- Page titles should not repeat the site name more than once');
  console.log('- At least one keyword phrase should appear in the page title or description');
  console.log('');
}

function printResults(results: AuditResult[]): void {
  console.log(colors.bold + 'Route'.padEnd(48) + 'Status'.padEnd(12) + 'Title'.padEnd(10) + 'Desc'.padEnd(10) + 'KW' + colors.reset);
  console.log('-'.repeat(92));

  for (const result of results) {
    const status = result.errors.length > 0
      ? colors.red + 'FAIL' + colors.reset
      : result.warnings.length > 0
        ? colors.yellow + 'WARN' + colors.reset
        : colors.green + 'PASS' + colors.reset;

    const titleLen = result.title ? String(result.title.length) : '-';
    const descLen = result.description ? String(result.description.length) : '-';
    const keywordCount = result.keywords.length > 0 ? String(result.keywords.length) : '-';

    console.log(
      result.route.padEnd(48) +
      status.padEnd(21) +
      titleLen.padEnd(10) +
      descLen.padEnd(10) +
      keywordCount,
    );

    for (const error of result.errors) {
      console.log(colors.red + `  error: ${error}` + colors.reset);
    }
    for (const warning of result.warnings) {
      console.log(colors.yellow + `  warn: ${warning}` + colors.reset);
    }
  }
}

function printSummary(results: AuditResult[]): void {
  const total = results.length;
  const failed = results.filter((result) => result.errors.length > 0).length;
  const warned = results.filter((result) => result.errors.length === 0 && result.warnings.length > 0).length;
  const passed = total - failed - warned;

  console.log('');
  console.log(colors.bold + 'Summary' + colors.reset);
  console.log(`Total routes audited: ${total}`);
  console.log(`${colors.green}Pass${colors.reset}: ${passed}`);
  console.log(`${colors.yellow}Warn${colors.reset}: ${warned}`);
  console.log(`${colors.red}Fail${colors.reset}: ${failed}`);
}

async function main(): Promise<void> {
  console.log(colors.cyan + 'Running SEO metadata audit...' + colors.reset);
  printPolicy();

  const routes = (await discoverStaticPageRoutes())
    .filter((route) => !isExemptRoute(route));

  const results = routes.map((route) => auditRoute(route));
  printResults(results);
  printSummary(results);

  const hasFailures = results.some((result) => result.errors.length > 0);
  if (hasFailures) {
    console.log('');
    console.log(colors.red + 'SEO metadata audit failed.' + colors.reset);
    process.exit(1);
  }

  console.log('');
  console.log(colors.green + 'SEO metadata audit passed.' + colors.reset);
}

main().catch((error) => {
  console.error(colors.red + `Audit script error: ${String(error)}` + colors.reset);
  process.exit(1);
});
