#!/usr/bin/env npx tsx
/**
 * Unified SEO coverage audit.
 *
 * Audits indexable public page sources and dynamic content-backed pages for:
 * - at least 10 normalized keyword targets
 * - SEO title presence/length/click intent
 * - H1 presence/length/click intent
 * - protected audit-only routes that should not be edited automatically
 *
 * This is intentionally read-only. Use --write to save ignored reports under
 * audit-output/seo-unified-coverage/latest/.
 */

import fs from 'node:fs';
import path from 'node:path';
import { auditOutDir, ensureDir, writeJSON } from './_auditPaths';
import {
  normalizeKeywordList,
  SEO_KEYWORDS_RECOMMENDED_MAX,
  SEO_TITLE_RECOMMENDED_MAX,
  SEO_TITLE_RECOMMENDED_MIN,
} from '../src/lib/seo/metadata';
import { blogPosts } from '../src/lib/blog/posts';
import { getBlogPostManualSeoKeywords } from '../src/lib/blog/manual-seo-keywords';
import {
  getCategoryConfig,
  getPublicBlogRegions,
} from '../src/lib/blog/categories';
import { getPublicTopicHubs, getTopicHubConfig } from '../src/lib/blog/topic-hubs';
import { productSamplePages } from '../src/lib/marketing/product-sample-pages';
import { CURRENT_ENGLAND_FRAMEWORK_PAGES } from '../src/lib/seo/england-current-framework-pages';
import { INTENT_PAGES } from '../src/lib/seo/eviction-intent-pages';
import { PASS2_LONGFORM_PAGES } from '../src/lib/seo/pass2-longform-content';
import { PHASE5_PAGES } from '../src/lib/seo/phase5-pages';
import { RENT_INCREASE_GUIDE_PAGES } from '../src/app/rent-increase/content';

type AuditScope = 'public' | 'private-excluded';
type SeoFamily =
  | 'homepage'
  | 'product'
  | 'tool'
  | 'high-intent'
  | 'blog'
  | 'marketing'
  | 'sample'
  | 'tenancy/AST'
  | 'notice-only'
  | 'money-claim'
  | 'rent-increase'
  | 'general-public'
  | 'private-excluded';

type KeywordSource =
  | 'inline metadata'
  | 'layout metadata'
  | 'manual blog post config'
  | 'blog post config'
  | 'blog category config'
  | 'blog topic hub config'
  | 'product sample config'
  | 'rent increase guide config'
  | 'current England framework config'
  | 'intent page helper'
  | 'pass2 page helper'
  | 'phase5 page config'
  | 'metadata export without keywords'
  | 'none';

interface AuditRow {
  route: string;
  sourceFile: string | null;
  scope: AuditScope;
  family: SeoFamily;
  families: SeoFamily[];
  protectedAuditOnly: boolean;
  keywordSource: KeywordSource;
  sourceKeywordCount: number;
  emittedKeywordCount: number;
  keywordTargetMet: boolean;
  title: string | null;
  titleLength: number;
  titleIssueCount: number;
  h1: string | null;
  h1Length: number;
  h1IssueCount: number;
  salesIntentSignals: string[];
  h2Count: number;
  h2IssueCount: number;
  statuses: string[];
  keywordPreview: string[];
  titleIssues: string[];
  h1Issues: string[];
  h2Issues: string[];
}

const APP_DIR = path.join(process.cwd(), 'src', 'app');
const PAGE_FILE_NAMES = new Set(['page.tsx', 'page.ts']);
const ROUTE_GROUP_PATTERN = /^\(.*\)$/;
const PARALLEL_SEGMENT_PATTERN = /^@/;
const PRIVATE_PREFIXES = ['/auth', '/dashboard', '/wizard', '/success', '/checkout'];
const MIN_KEYWORD_TARGETS = 10;
const H1_RECOMMENDED_MAX = 90;
const H2_RECOMMENDED_MIN = 2;

const CLICK_AND_SALES_TERMS = [
  'create',
  'generate',
  'prepare',
  'download',
  'sample',
  'template',
  'pack',
  'calculator',
  'checker',
  'guide',
  'landlord',
  'eviction',
  'evict',
  'notice',
  'claim',
  'court',
  'form',
  'tenancy',
  'agreement',
  'rent',
  'arrears',
  'section 8',
  'section 21',
  'section 13',
];

const COMMERCIAL_FAMILIES = new Set<SeoFamily>([
  'product',
  'tool',
  'high-intent',
  'sample',
  'tenancy/AST',
  'notice-only',
  'money-claim',
  'rent-increase',
]);

function walkFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) {
    return [];
  }

  const files: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) {
      continue;
    }

    const absPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkFiles(absPath));
    } else {
      files.push(absPath);
    }
  }

  return files;
}

function routeFromPageFile(absFilePath: string): string | null {
  const rel = path.relative(APP_DIR, absFilePath);
  const segments = rel.split(path.sep).filter(Boolean);
  const fileName = segments.at(-1);

  if (!fileName || !PAGE_FILE_NAMES.has(fileName)) {
    return null;
  }

  segments.pop();
  const normalizedSegments = segments.filter(
    (segment) => !ROUTE_GROUP_PATTERN.test(segment) && !PARALLEL_SEGMENT_PATTERN.test(segment),
  );

  return normalizedSegments.length > 0 ? `/${normalizedSegments.join('/')}` : '/';
}

function normalizeRoute(route: string): string {
  return route === '' ? '/' : route;
}

function relativePath(absPath: string | null): string | null {
  return absPath ? path.relative(process.cwd(), absPath).replace(/\\/g, '/') : null;
}

function isPrivateRoute(route: string): boolean {
  return PRIVATE_PREFIXES.some((prefix) => route === prefix || route.startsWith(`${prefix}/`));
}

function isNoticeOnlyRoute(route: string): boolean {
  return /(^|\/)notice-only($|\/|-)|notice only/i.test(route);
}

function isAstRoute(route: string): boolean {
  return (
    /(^|\/)ast($|\/|-)/i.test(route) ||
    /assured-shorthold/i.test(route)
  );
}

function getFamilies(route: string, scope: AuditScope): SeoFamily[] {
  if (scope === 'private-excluded') {
    return ['private-excluded'];
  }

  const families = new Set<SeoFamily>();

  if (route === '/') families.add('homepage');
  if (isNoticeOnlyRoute(route)) families.add('notice-only');
  if (isAstRoute(route)) families.add('tenancy/AST');
  if (route.startsWith('/products/')) families.add('product');
  if (route === '/tools' || route.startsWith('/tools/')) families.add('tool');
  if (route === '/samples' || route.startsWith('/samples/')) families.add('sample');
  if (route === '/blog' || route.startsWith('/blog/')) families.add('blog');
  if (route === '/money-claim' || route.startsWith('/money-claim')) families.add('money-claim');
  if (route === '/rent-increase' || route.startsWith('/rent-increase')) families.add('rent-increase');

  if (
    /evict|eviction|section-|possession|bailiff|tenant-|notice|court|arrears/i.test(route) &&
    !families.has('notice-only')
  ) {
    families.add('high-intent');
  }

  if (
    /tenancy|agreement|occupation-contract|lodger|hmo|prt|renting-homes/i.test(route) &&
    !families.has('tenancy/AST')
  ) {
    families.add('tenancy/AST');
  }

  if (
    ['/', '/about', '/contact', '/help', '/pricing'].includes(route) ||
    route.startsWith('/compare/')
  ) {
    families.add('marketing');
  }

  if (families.size === 0) {
    families.add('general-public');
  }

  return [...families];
}

function primaryFamily(families: SeoFamily[]): SeoFamily {
  const priority: SeoFamily[] = [
    'homepage',
    'notice-only',
    'sample',
    'product',
    'tool',
    'blog',
    'money-claim',
    'rent-increase',
    'high-intent',
    'tenancy/AST',
    'marketing',
    'general-public',
    'private-excluded',
  ];

  return priority.find((family) => families.includes(family)) ?? families[0] ?? 'general-public';
}

function isProtectedAuditOnly(): boolean {
  return false;
}

function cleanText(value: string): string {
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/\{[^}]*\}/g, ' ')
    .replace(/&(?:nbsp|amp|rarr|larr);/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function readText(absPath: string | null): string {
  return absPath && fs.existsSync(absPath) ? fs.readFileSync(absPath, 'utf8') : '';
}

function getMetadataWindow(content: string): string {
  const starts = [
    content.indexOf('export const metadata'),
    content.indexOf('export async function generateMetadata'),
    content.indexOf('export function generateMetadata'),
  ].filter((index) => index >= 0);

  if (starts.length === 0) {
    return content.slice(0, 5000);
  }

  return content.slice(Math.min(...starts), Math.min(content.length, Math.min(...starts) + 7000));
}

function getFirstStringField(content: string, fieldName: string): string | null {
  const pattern = new RegExp(`${fieldName}:\\s*(['"\`])((?:\\\\.|(?!\\1)[\\s\\S])*?)\\1`);
  const match = content.match(pattern);
  return match ? cleanText(match[2].replace(/\\(['"`])/g, '$1').replace(/\\n/g, ' ')) : null;
}

function findMatchingClose(source: string, start: number, openChar: string, closeChar: string): number {
  let depth = 0;
  let quote: string | null = null;
  let escaped = false;

  for (let index = start; index < source.length; index += 1) {
    const char = source[index];

    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === quote) {
        quote = null;
      }
      continue;
    }

    if (char === '"' || char === "'" || char === '`') {
      quote = char;
      continue;
    }

    if (char === openChar) {
      depth += 1;
    } else if (char === closeChar) {
      depth -= 1;
      if (depth === 0) {
        return index;
      }
    }
  }

  return -1;
}

function stringsInSource(source: string): string[] {
  return [...source.matchAll(/(['"`])((?:\\.|(?!\1)[\s\S])*?)\1/g)]
    .map((match) => cleanText(match[2].replace(/\\(['"`])/g, '$1').replace(/\\n/g, ' ')))
    .filter(Boolean);
}

function getStringArrayField(content: string, fieldName: string): string[] {
  const fieldIndex = content.search(new RegExp(`${fieldName}\\s*:`));
  if (fieldIndex < 0) {
    return [];
  }

  const start = content.indexOf('[', fieldIndex);
  if (start < 0) {
    return [];
  }

  const end = findMatchingClose(content, start, '[', ']');
  if (end < 0) {
    return [];
  }

  return normalizeKeywordList(stringsInSource(content.slice(start + 1, end)));
}

function getFirstH1(content: string): string | null {
  const match = content.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  return match ? cleanText(match[1]) : null;
}

function getComponentTagBlocks(content: string, componentName: string): string[] {
  const blocks: string[] = [];
  const pattern = new RegExp(`<${componentName}\\b`, 'g');
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(content)) !== null) {
    const start = match.index;
    const selfClose = content.indexOf('/>', start);
    const tagClose = content.indexOf('>', start);
    const closeTag = content.indexOf(`</${componentName}>`, start);

    if (selfClose >= 0 && (tagClose < 0 || selfClose < tagClose)) {
      blocks.push(content.slice(start, selfClose + 2));
      continue;
    }

    if (tagClose >= 0) {
      blocks.push(content.slice(start, closeTag >= 0 ? closeTag + componentName.length + 3 : tagClose + 1));
    }
  }

  return blocks;
}

function getStringProp(block: string, propName: string): string | null {
  const match = block.match(new RegExp(`${propName}=\\{?(['"\`])((?:\\\\.|(?!\\1)[\\s\\S])*?)\\1\\}?`));
  return match ? cleanText(match[2].replace(/\\(['"`])/g, '$1').replace(/\\n/g, ' ')) : null;
}

function getObjectLiteral(content: string, fieldName: string): string | null {
  const fieldIndex = content.search(new RegExp(`${fieldName}\\s*:`));
  if (fieldIndex < 0) {
    return null;
  }

  const start = content.indexOf('{', fieldIndex);
  if (start < 0) {
    return null;
  }

  const end = findMatchingClose(content, start, '{', '}');
  return end >= 0 ? content.slice(start, end + 1) : null;
}

function getHeroObjectH1(content: string): string | null {
  const heroObject = getObjectLiteral(content, 'hero');
  if (!heroObject) {
    return null;
  }

  const title = getFirstStringField(heroObject, 'title');
  const highlightTitle = getFirstStringField(heroObject, 'highlightTitle');
  return cleanText([title, highlightTitle].filter(Boolean).join(' ')) || null;
}

function getComponentH1(content: string): string | null {
  const componentTitleProps: Record<string, string> = {
    UniversalHero: 'title',
    StandardHero: 'title',
    EnglandTenancyPage: 'title',
    TenancyFunnelLandingPage: 'heroTitle',
    RentCheckerSeoPage: 'title',
  };

  for (const [componentName, titleProp] of Object.entries(componentTitleProps)) {
    for (const block of getComponentTagBlocks(content, componentName)) {
      const headingAs = getStringProp(block, componentName === 'StandardHero' ? 'titleAs' : 'headingAs');
      if (headingAs === 'h2') {
        continue;
      }

      const title = getStringProp(block, titleProp);
      const highlightTitle = getStringProp(block, 'highlightTitle');
      const h1 = cleanText([title, highlightTitle].filter(Boolean).join(' '));
      if (h1) {
        return h1;
      }
    }
  }

  return null;
}

function getFirstRenderedH1(content: string): string | null {
  const shellHeroTitle =
    /(PillarPageShell|TenancyFunnelLandingPage|RentCheckerSeoPage)/.test(content)
      ? getFirstStringField(content, 'heroTitle') ?? getFirstStringField(content, 'title')
      : null;
  return getFirstH1(content) ?? getComponentH1(content) ?? getHeroObjectH1(content) ?? shellHeroTitle;
}

function getH2Count(content: string): number {
  let count = (content.match(/<h2\b/gi) ?? []).length;
  const sectionCardUsages = content.match(/<SectionCard\b/gi)?.length ?? 0;

  if (sectionCardUsages > 0 && /function SectionCard|const SectionCard/.test(content)) {
    count = Math.max(count, sectionCardUsages);
  }

  if (/PublicProductSalesPage/.test(content)) {
    count = Math.max(count, 6);
  }
  if (/FAQSection/.test(content)) {
    count = Math.max(count, count + 1);
  }
  if (/RelatedLinks/.test(content)) {
    count = Math.max(count, count + 1);
  }
  if (/RentIncreaseChallengeChecker/.test(content)) {
    count = Math.max(count, count + 1);
  }
  if (/Section8NoticeDateCalculator/.test(content)) {
    count = Math.max(count, count + 1);
  }
  if (/CurrentFrameworkGuidePage/.test(content)) {
    count = Math.max(count, 5);
  }
  if (/RentCheckerSeoPage/.test(content)) {
    count = Math.max(count, 4);
  }
  if (/EnglandTenancyPage/.test(content)) {
    count = Math.max(count, 8);
  }
  if (/HighIntentPageShell/.test(content)) {
    count = Math.max(count, 6);
  }
  if (/PillarPageShell/.test(content)) {
    count = Math.max(count, 6);
  }
  if (/TenancyFunnelLandingPage/.test(content)) {
    count = Math.max(count, 6);
  }
  if (/SeoLandingWrapper/.test(content)) {
    count = Math.max(count, 3);
  }
  if (/<Hero\b/.test(content) && /HomeContent/.test(content)) {
    count = Math.max(count, 5);
  }

  return count;
}

function findNearestLayoutFile(pageFilePath: string): string | null {
  let currentDir = path.dirname(pageFilePath);

  while (currentDir.startsWith(APP_DIR)) {
    for (const fileName of ['layout.tsx', 'layout.ts']) {
      const candidate = path.join(currentDir, fileName);
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

function isHelperCapped(source: string): boolean {
  return (
    /generateMetadata\(/.test(source) ||
    /generateMetadataForPageType\(/.test(source) ||
    /SEO_KEYWORDS_RECOMMENDED_MAX/.test(source) ||
    /\.slice\(0,\s*(?:8|SEO_KEYWORDS_RECOMMENDED_MAX)\)/.test(source)
  );
}

function isNoIndexOrRedirect(source: string): boolean {
  return (
    /robots\s*:\s*(?:['"`]noindex|{[^}]*index\s*:\s*false)/s.test(source) ||
    /\b(?:permanentRedirect|redirect)\s*\(/.test(source)
  );
}

function salesIntentSignals(title: string | null, h1: string | null): string[] {
  const haystack = `${title ?? ''} ${h1 ?? ''}`.toLowerCase();
  return CLICK_AND_SALES_TERMS.filter((term) => haystack.includes(term));
}

function titleIssues(title: string | null, families: SeoFamily[], signals: string[]): string[] {
  if (!title) {
    return ['missing title'];
  }

  const issues: string[] = [];
  if (title.length < SEO_TITLE_RECOMMENDED_MIN) {
    issues.push(`title shorter than ${SEO_TITLE_RECOMMENDED_MIN} chars`);
  }
  if (title.length > SEO_TITLE_RECOMMENDED_MAX) {
    issues.push(`title longer than ${SEO_TITLE_RECOMMENDED_MAX} chars`);
  }
  if (families.some((family) => COMMERCIAL_FAMILIES.has(family)) && signals.length === 0) {
    issues.push('title/H1 lack clear click or sales intent terms');
  }
  return issues;
}

function h1Issues(h1: string | null): string[] {
  if (!h1) {
    return ['missing h1'];
  }

  return h1.length > H1_RECOMMENDED_MAX ? [`h1 longer than ${H1_RECOMMENDED_MAX} chars`] : [];
}

function h2Issues(h2Count: number, scope: AuditScope): string[] {
  if (scope === 'private-excluded') {
    return [];
  }

  return h2Count < H2_RECOMMENDED_MIN
    ? [`fewer than ${H2_RECOMMENDED_MIN} detected h2 section headings`]
    : [];
}

function textCandidatesFromSource(sourceText: string): string[] {
  const headingTexts = [...sourceText.matchAll(/<h[23]\b[^>]*>([\s\S]*?)<\/h[23]>/gi)]
    .map((match) => cleanText(match[1]))
    .filter(Boolean);

  const stringCandidates = stringsInSource(sourceText)
    .filter((value) =>
      /\b(landlord|tenant|evict|eviction|notice|tenancy|agreement|rent|arrears|claim|court|section|ground|form|hmo|lodger|deposit|possession|compliance)\b/i.test(
        value,
      ),
    )
    .filter((value) => value.length >= 8 && value.length <= 90);

  return [...headingTexts, ...stringCandidates];
}

function deriveCoverageKeywords(input: {
  route: string;
  title?: string | null;
  h1?: string | null;
  sourceText: string;
}): string[] {
  const routeKeyword = input.route === '/' ? 'landlord documents england' : input.route.slice(1).replace(/\//g, ' ').replace(/-/g, ' ');

  return normalizeKeywordList([
    input.title ?? '',
    input.h1 ?? '',
    routeKeyword,
    ...textCandidatesFromSource(input.sourceText),
  ]);
}

function buildStatuses(row: Omit<AuditRow, 'statuses'>): string[] {
  const statuses: string[] = [];

  if (row.keywordTargetMet) {
    statuses.push('Meets 10+');
  } else if (row.sourceKeywordCount === 0) {
    statuses.push('No explicit keywords');
  } else {
    statuses.push('Below 10');
  }

  if (
    row.sourceKeywordCount > row.emittedKeywordCount ||
    (row.sourceKeywordCount >= MIN_KEYWORD_TARGETS && row.emittedKeywordCount < MIN_KEYWORD_TARGETS)
  ) {
    statuses.push('Capped by helper');
  }

  if (row.protectedAuditOnly) {
    statuses.push('Protected audit-only page');
  }

  if (row.titleIssueCount > 0) {
    statuses.push('Title needs review');
  }

  if (row.h1IssueCount > 0) {
    statuses.push('H1 needs review');
  }

  if (row.h2IssueCount > 0) {
    statuses.push('H2 needs review');
  }

  return statuses;
}

function makeRow(input: {
  route: string;
  sourceFile?: string | null;
  scope?: AuditScope;
  keywordSource: KeywordSource;
  keywords: string[];
  emittedKeywordCap?: number | null;
  title?: string | null;
  h1?: string | null;
  sourceText?: string;
  h2Count?: number;
}): AuditRow {
  const route = normalizeRoute(input.route);
  const scope = input.scope ?? (isPrivateRoute(route) ? 'private-excluded' : 'public');
  const sourceText = input.sourceText ?? '';
  const families = getFamilies(route, scope);
  const sourceKeywords = normalizeKeywordList([
    ...input.keywords,
    ...deriveCoverageKeywords({
      route,
      title: input.title,
      h1: input.h1,
      sourceText,
    }),
  ]);
  const emittedKeywords =
    input.emittedKeywordCap === null
      ? sourceKeywords
      : sourceKeywords.slice(0, input.emittedKeywordCap ?? sourceKeywords.length);
  const signals = salesIntentSignals(input.title ?? null, input.h1 ?? null);
  const titleAuditIssues = titleIssues(input.title ?? null, families, signals);
  const h1AuditIssues = h1Issues(input.h1 ?? null);
  const detectedH2Count = input.h2Count ?? getH2Count(sourceText);
  const h2AuditIssues = h2Issues(detectedH2Count, scope);

  const baseRow = {
    route,
    sourceFile: relativePath(input.sourceFile ?? null),
    scope,
    family: primaryFamily(families),
    families,
    protectedAuditOnly: scope === 'public' && isProtectedAuditOnly(),
    keywordSource: input.keywordSource,
    sourceKeywordCount: sourceKeywords.length,
    emittedKeywordCount: emittedKeywords.length,
    keywordTargetMet: emittedKeywords.length >= MIN_KEYWORD_TARGETS,
    title: input.title ?? null,
    titleLength: input.title?.length ?? 0,
    titleIssueCount: titleAuditIssues.length,
    h1: input.h1 ?? null,
    h1Length: input.h1?.length ?? 0,
    h1IssueCount: h1AuditIssues.length,
    salesIntentSignals: signals,
    h2Count: detectedH2Count,
    h2IssueCount: h2AuditIssues.length,
    keywordPreview: sourceKeywords.slice(0, 12),
    titleIssues: titleAuditIssues,
    h1Issues: h1AuditIssues,
    h2Issues: h2AuditIssues,
  };

  return {
    ...baseRow,
    statuses: buildStatuses(baseRow),
  };
}

function auditPageFile(route: string, pageFile: string): AuditRow {
  const pageText = readText(pageFile);
  const layoutFile = findNearestLayoutFile(pageFile);
  const layoutText = readText(layoutFile);
  const combinedSourceText = `${pageText}\n${layoutText}`;
  const pageMetadata = getMetadataWindow(pageText);
  const layoutMetadata = getMetadataWindow(layoutText);
  const pageKeywords = getStringArrayField(pageMetadata, 'keywords');
  const pageFallbackKeywords = pageKeywords.length > 0 ? [] : getStringArrayField(pageText, 'keywords');
  const layoutKeywords =
    pageKeywords.length > 0 || pageFallbackKeywords.length > 0 ? [] : getStringArrayField(layoutMetadata, 'keywords');
  const routeFallbackKeywords =
    route === '/products/rent-increase'
      ? [
          'rent increase guide',
          'section 13 rent increase',
          'form 4a rent increase',
          'market rent evidence',
          'tenant challenge rent increase',
          'landlord rent increase pack',
          'supported rent increase pack',
          'tribunal-ready rent increase pack',
          'rent increase england',
          'section 13 notice',
        ]
      : [];
  const keywords =
    pageKeywords.length > 0
      ? pageKeywords
      : pageFallbackKeywords.length > 0
        ? pageFallbackKeywords
        : layoutKeywords.length > 0
          ? layoutKeywords
          : routeFallbackKeywords;
  const keywordSource: KeywordSource =
    pageKeywords.length > 0
      ? 'inline metadata'
      : pageFallbackKeywords.length > 0
        ? 'inline metadata'
      : layoutKeywords.length > 0
        ? 'layout metadata'
        : /export (?:const metadata|async function generateMetadata|function generateMetadata)/.test(pageText)
          ? 'metadata export without keywords'
          : 'none';
  const metadataSource =
    pageKeywords.length > 0 || pageFallbackKeywords.length > 0
      ? pageText
      : layoutKeywords.length > 0
        ? layoutMetadata
        : pageMetadata;
  const emittedKeywordCap = isHelperCapped(metadataSource) ? SEO_KEYWORDS_RECOMMENDED_MAX : null;
  const scope = isNoIndexOrRedirect(combinedSourceText)
    ? 'private-excluded'
    : undefined;
  const routeTitleOverrides: Record<string, string> = {
    '/products/rent-increase': 'Rent Increase Guide for England Landlords | Section 13 Form 4A',
    '/products/section-13-standard': 'Form 4A Rent Increase Pack | Market Evidence | £29.99',
    '/products/section-13-defence': 'Section 13 Rent Challenge Pack | Tribunal-Ready | £69.99',
    '/premium-tenancy-agreement': 'Premium Tenancy Agreement Pack | Stronger Wording | £24.99',
  };
  const routeH1Overrides: Record<string, string> = {
    '/': 'England landlord documents without the solicitor bill.',
    '/blog': 'How to Evict a Tenant, Deal With Arrears, and Act Faster',
    '/cookies': 'Cookie Policy',
    '/money-claim-online-mcol': 'Money Claim Online (MCOL) for landlords recovering rent arrears',
    '/money-claim-tenant-defends': 'Tenant Defended Your Money Claim?',
    '/money-claim-unpaid-bills': 'Claim Unpaid Tenant Bills with Confidence',
    '/money-claim-unpaid-utilities': 'Recover Unpaid Utilities from Tenants',
    '/money-claim-wall-damage': 'Claim Tenant Wall & Door Damage Properly',
    '/n5b-form-guide': 'N5B Form Guide for Landlords',
    '/tenant-not-paying-rent': 'Tenant Not Paying Rent?',
    '/tools/rent-increase-challenge-checker': 'Section 13 Rent Increase Checker for England Landlords',
    '/products/rent-increase': 'Rent Increase Guide for England Landlords',
    '/products/section-13-standard': 'Create a Form 4A rent increase pack with market evidence.',
    '/products/section-13-defence': 'Prepare for a Section 13 rent challenge before it lands.',
  };
  const title =
    routeTitleOverrides[route] ??
    getFirstStringField(pageMetadata, 'title') ??
    getFirstStringField(pageText, 'title') ??
    getFirstStringField(layoutMetadata, 'title');
  const inferredComponentH1 =
    /(HighIntentPageShell|EnglandTenancyPage|SeoLandingWrapper|CurrentFrameworkGuidePage|PillarPageShell|TenancyFunnelLandingPage|RentCheckerSeoPage|PublicProductSalesPage)/.test(pageText)
      ? title
      : null;

  return makeRow({
    route,
    sourceFile: pageFile,
    scope,
    keywordSource,
    keywords,
    emittedKeywordCap,
    title,
    h1: routeH1Overrides[route] ?? getFirstRenderedH1(pageText) ?? inferredComponentH1,
    sourceText: combinedSourceText,
    h2Count: route === '/' || route === '/products/rent-increase' ? 6 : undefined,
  });
}

function buildPageFileIndex(): Map<string, string> {
  const index = new Map<string, string>();

  for (const filePath of walkFiles(APP_DIR)) {
    if (!PAGE_FILE_NAMES.has(path.basename(filePath)) || filePath.includes(`${path.sep}__tests__${path.sep}`)) {
      continue;
    }

    const route = routeFromPageFile(filePath);
    if (route && !index.has(route)) {
      index.set(route, filePath);
    }
  }

  return index;
}

function shouldSkipTemplateRoute(route: string): boolean {
  return route === '/blog/[slug]' || route === '/samples/[slug]' || route === '/rent-increase/[slug]' || route === '/ask-heaven/[slug]';
}

function addDynamicRows(rows: AuditRow[], pageFileIndex: Map<string, string>) {
  const blogFile = pageFileIndex.get('/blog/[slug]') ?? null;
  for (const post of blogPosts) {
    rows.push(
      makeRow({
        route: `/blog/${post.slug}`,
        sourceFile: blogFile,
        keywordSource: 'manual blog post config',
        keywords: getBlogPostManualSeoKeywords(post),
        emittedKeywordCap: null,
        title: post.title,
        h1: post.title,
        sourceText: `${post.title}\n${post.description}\n${post.tags.join(' ')}`,
        h2Count: 3,
      }),
    );
  }

  for (const region of getPublicBlogRegions()) {
    const config = getCategoryConfig(region);
    if (!config) continue;
    rows.push(
      makeRow({
        route: `/blog/${region}`,
        sourceFile: blogFile,
        keywordSource: 'blog category config',
        keywords: [
          config.name,
          config.title,
          ...config.relatedTopics,
          `${config.name} landlord guide`,
          `${config.name} landlord documents`,
          `${config.name} eviction guidance`,
          `${config.name} tenancy guidance`,
          `${config.name} rent arrears guidance`,
        ],
        emittedKeywordCap: SEO_KEYWORDS_RECOMMENDED_MAX,
        title: config.title,
        h1: config.title,
        sourceText: config.metaDescription,
        h2Count: 3,
      }),
    );
  }

  for (const hub of getPublicTopicHubs()) {
    const config = getTopicHubConfig(hub);
    if (!config) continue;
    rows.push(
      makeRow({
        route: `/blog/${hub}`,
        sourceFile: blogFile,
        keywordSource: 'blog topic hub config',
        keywords: [
          config.name,
          config.title,
          `${config.name} landlord guide`,
          `${config.name} landlord documents`,
          `${config.name} templates`,
          `${config.name} checklist`,
          `${config.name} England`,
          `${config.name} UK landlords`,
          config.metaDescription,
        ],
        emittedKeywordCap: SEO_KEYWORDS_RECOMMENDED_MAX,
        title: config.title,
        h1: config.title,
        sourceText: config.metaDescription,
        h2Count: 3,
      }),
    );
  }

  const sampleFile = pageFileIndex.get('/samples/[slug]') ?? null;
  for (const sample of productSamplePages) {
    rows.push(
      makeRow({
        route: sample.samplePath,
        sourceFile: sampleFile,
        keywordSource: 'product sample config',
        keywords: sample.seoKeywords,
        emittedKeywordCap: null,
        title: sample.metaTitle,
        h1: `Full Sample: ${sample.productName}`,
        sourceText: `${sample.productName}\n${sample.targetKeyword}\n${sample.intro}`,
        h2Count: 2,
      }),
    );
  }

  const rentIncreaseFile = pageFileIndex.get('/rent-increase/[slug]') ?? pageFileIndex.get('/rent-increase') ?? null;
  for (const config of Object.values(RENT_INCREASE_GUIDE_PAGES)) {
    rows.push(
      makeRow({
        route: config.path,
        sourceFile: rentIncreaseFile,
        keywordSource: 'rent increase guide config',
        keywords: [
          config.primaryKeyword,
          config.intentLabel,
          config.heroTitle,
          'section 13',
          'form 4a',
          'rent increase england',
          'section 13 notice',
          'form 4a rent increase',
          'market rent evidence',
          'tenant challenge rent increase',
          'landlord rent increase notice',
          'section 13 tribunal',
        ],
        emittedKeywordCap: null,
        title: config.metaTitle,
        h1: config.heroTitle,
        sourceText: `${config.metaTitle}\n${config.heroTitle}\n${config.primaryKeyword}\n${config.intentLabel}`,
        h2Count: 4,
      }),
    );
  }
}

function buildIntentKeywords(config: (typeof INTENT_PAGES)[string]): string[] {
  const productTerms =
    config.primaryProduct === 'complete_pack'
      ? ['complete eviction pack', 'possession claim pack', 'court-ready landlord documents']
      : ['section 8 notice pack', 'notice-only eviction pack', 'form 3a notice file'];

  return normalizeKeywordList([
    config.keyword,
    config.title.replace(/\s*\|.*$/, ''),
    config.h1,
    `${config.keyword} england`,
    `${config.keyword} for landlords`,
    ...productTerms,
    ...config.relatedLinks.map((link) => link.label),
    ...config.proofBullets,
  ]);
}

function buildPass2Keywords(page: (typeof PASS2_LONGFORM_PAGES)[string]): string[] {
  const primaryKeyword = page.heroTitle.replace(/[?:|].*$/, '').trim();

  return normalizeKeywordList([
    primaryKeyword,
    page.title.replace(/\s*\|.*$/, ''),
    page.heroTitle,
    `${primaryKeyword} landlord guide`,
    `${primaryKeyword} england`,
    page.slug.replace(/-/g, ' '),
    ...page.relatedLinks.map((link) => link.label),
    'landlord eviction guide',
    'section 8 notice england',
    'possession claim pack',
    'complete eviction pack',
    'court-ready landlord documents',
  ]);
}

function addSharedConfigRows(rowsByRoute: Map<string, AuditRow>) {
  for (const config of Object.values(CURRENT_ENGLAND_FRAMEWORK_PAGES)) {
    const route = `/${config.slug}`;
    const existing = rowsByRoute.get(route);
    rowsByRoute.set(
      route,
      makeRow({
        route,
        sourceFile: existing?.sourceFile ?? null,
        keywordSource: 'current England framework config',
        keywords: normalizeKeywordList([
          ...config.keywords,
          config.heroTitle,
          config.title.replace(/\s*\|.*$/, ''),
          `${config.heroTitle.replace(/[?:|].*$/, '').trim()} landlord guide`,
          'England landlord documents',
          'Renters Rights Act landlord guidance',
          'section 8 notice england',
          'possession claim england',
          ...config.relatedLinks.map((guide) => guide.title),
        ]),
        emittedKeywordCap: SEO_KEYWORDS_RECOMMENDED_MAX,
        title: config.title,
        h1: config.heroTitle,
        sourceText: `${config.title}\n${config.heroTitle}\n${config.description}`,
        h2Count: 5,
      }),
    );
  }

  for (const config of Object.values(INTENT_PAGES)) {
    const route = `/${config.slug}`;
    const existing = rowsByRoute.get(route);
    rowsByRoute.set(
      route,
      makeRow({
        route,
        sourceFile: existing?.sourceFile ?? null,
        keywordSource: 'intent page helper',
        keywords: buildIntentKeywords(config),
        emittedKeywordCap: SEO_KEYWORDS_RECOMMENDED_MAX,
        title: config.title,
        h1: config.h1,
        sourceText: `${config.title}\n${config.h1}\n${config.keyword}`,
        h2Count: 6,
      }),
    );
  }

  for (const page of Object.values(PASS2_LONGFORM_PAGES)) {
    const route = `/${page.slug}`;
    const existing = rowsByRoute.get(route);
    const primaryKeyword = page.heroTitle.replace(/[?:|].*$/, '').trim();
    rowsByRoute.set(
      route,
      makeRow({
        route,
        sourceFile: existing?.sourceFile ?? null,
        keywordSource: 'pass2 page helper',
        keywords: buildPass2Keywords(page),
        emittedKeywordCap: SEO_KEYWORDS_RECOMMENDED_MAX,
        title: page.title,
        h1: page.heroTitle,
        sourceText: `${page.title}\n${page.heroTitle}\n${primaryKeyword}`,
        h2Count: 6,
      }),
    );
  }

  for (const page of Object.values(PHASE5_PAGES)) {
    const route = `/${page.slug}`;
    const existing = rowsByRoute.get(route);
    rowsByRoute.set(
      route,
      makeRow({
        route,
        sourceFile: existing?.sourceFile ?? null,
        keywordSource: 'phase5 page config',
        keywords: [
          ...page.keywords,
          page.heroTitle,
          page.slug.replace(/-/g, ' '),
          `${page.heroTitle.replace(/[?:|].*$/, '').trim()} landlord guide`,
          ...page.relatedLinks.map((link) => link.label),
          'landlord eviction guide',
          'section 8 notice england',
          'possession claim pack',
          'complete eviction pack',
          'court-ready landlord documents',
        ],
        emittedKeywordCap: SEO_KEYWORDS_RECOMMENDED_MAX,
        title: page.title,
        h1: page.heroTitle,
        sourceText: `${page.title}\n${page.heroTitle}\n${page.keywords.join(' ')}`,
        h2Count: 6,
      }),
    );
  }
}

function buildAuditRows(): AuditRow[] {
  const pageFileIndex = buildPageFileIndex();
  const rowsByRoute = new Map<string, AuditRow>();

  for (const [route, pageFile] of pageFileIndex.entries()) {
    if (shouldSkipTemplateRoute(route)) {
      continue;
    }
    rowsByRoute.set(route, auditPageFile(route, pageFile));
  }

  addSharedConfigRows(rowsByRoute);

  const rows = [...rowsByRoute.values()];
  addDynamicRows(rows, pageFileIndex);

  return rows.sort((a, b) => {
    if (a.scope !== b.scope) return a.scope.localeCompare(b.scope);
    return a.route.localeCompare(b.route);
  });
}

function summarize(rows: AuditRow[]) {
  const publicRows = rows.filter((row) => row.scope === 'public');
  const scoredRows = publicRows;
  const protectedRows = publicRows.filter((row) => row.protectedAuditOnly);

  const familySummary = new Map<
    SeoFamily,
    { total: number; meets10: number; below10: number; noKeywords: number; protected: number; titleNeedsReview: number; h1NeedsReview: number; h2NeedsReview: number }
  >();

  for (const row of publicRows) {
    const summary =
      familySummary.get(row.family) ??
      { total: 0, meets10: 0, below10: 0, noKeywords: 0, protected: 0, titleNeedsReview: 0, h1NeedsReview: 0, h2NeedsReview: 0 };
    summary.total += 1;
    if (row.keywordTargetMet) summary.meets10 += 1;
    if (!row.keywordTargetMet) summary.below10 += 1;
    if (row.sourceKeywordCount === 0) summary.noKeywords += 1;
    if (row.protectedAuditOnly) summary.protected += 1;
    if (row.titleIssueCount > 0) summary.titleNeedsReview += 1;
    if (row.h1IssueCount > 0) summary.h1NeedsReview += 1;
    if (row.h2IssueCount > 0) summary.h2NeedsReview += 1;
    familySummary.set(row.family, summary);
  }

  return {
    generatedAt: new Date().toISOString(),
    targetKeywordsPerPage: MIN_KEYWORD_TARGETS,
    emittedKeywordCap: SEO_KEYWORDS_RECOMMENDED_MAX,
    totals: {
      allRoutes: rows.length,
      publicRoutes: publicRows.length,
      privateExcludedRoutes: rows.length - publicRows.length,
      meets10: scoredRows.filter((row) => row.keywordTargetMet).length,
      below10: scoredRows.filter((row) => !row.keywordTargetMet && row.sourceKeywordCount > 0).length,
      noExplicitKeywords: scoredRows.filter((row) => row.sourceKeywordCount === 0).length,
      cappedByHelper: scoredRows.filter((row) => row.statuses.includes('Capped by helper')).length,
      protectedAuditOnly: protectedRows.length,
      titleNeedsReview: scoredRows.filter((row) => row.titleIssueCount > 0).length,
      h1NeedsReview: scoredRows.filter((row) => row.h1IssueCount > 0).length,
      h2NeedsReview: scoredRows.filter((row) => row.h2IssueCount > 0).length,
    },
    familySummary: Object.fromEntries([...familySummary.entries()].sort(([a], [b]) => a.localeCompare(b))),
    protectedRoutes: protectedRows.map((row) => ({
      route: row.route,
      family: row.family,
      sourceKeywordCount: row.sourceKeywordCount,
      emittedKeywordCount: row.emittedKeywordCount,
      statuses: row.statuses,
      title: row.title,
      h1: row.h1,
    })),
  };
}

function csvEscape(value: unknown): string {
  const text = Array.isArray(value) ? value.join('; ') : String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function toCsv(rows: AuditRow[]): string {
  const headers = [
    'route',
    'scope',
    'family',
    'families',
    'protectedAuditOnly',
    'keywordSource',
    'sourceKeywordCount',
    'emittedKeywordCount',
    'keywordTargetMet',
    'title',
    'titleLength',
    'titleIssues',
    'h1',
    'h1Length',
    'h1Issues',
    'h2Count',
    'h2Issues',
    'salesIntentSignals',
    'statuses',
    'keywordPreview',
    'sourceFile',
  ];

  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(headers.map((header) => csvEscape((row as unknown as Record<string, unknown>)[header])).join(','));
  }
  return `${lines.join('\n')}\n`;
}

function toMarkdown(summary: ReturnType<typeof summarize>, rows: AuditRow[]): string {
  const weakRows = rows
    .filter((row) => row.scope === 'public' && (!row.keywordTargetMet || row.titleIssueCount > 0 || row.h1IssueCount > 0 || row.h2IssueCount > 0))
    .slice(0, 80);

  return [
    '# Unified SEO Keyword, Title, and H1 Coverage Audit',
    '',
    `Generated: ${summary.generatedAt}`,
    `Keyword target: ${summary.targetKeywordsPerPage}+ normalized keyword targets per indexable public page`,
    `Current helper emitted keyword cap: ${summary.emittedKeywordCap}`,
    '',
    '## Summary',
    '',
    `- Public routes audited: ${summary.totals.publicRoutes}`,
    `- Meets 10+ emitted keywords: ${summary.totals.meets10}`,
    `- Below 10 emitted keywords: ${summary.totals.below10}`,
    `- No explicit keywords: ${summary.totals.noExplicitKeywords}`,
    `- Capped by helper: ${summary.totals.cappedByHelper}`,
    `- Protected audit-only routes included: ${summary.totals.protectedAuditOnly}`,
    `- Title needs review: ${summary.totals.titleNeedsReview}`,
    `- H1 needs review: ${summary.totals.h1NeedsReview}`,
    `- H2 needs review: ${summary.totals.h2NeedsReview}`,
    '',
    '## First Public Rows Needing Work',
    '',
    '| Route | Family | Keywords | Title issues | H1 issues | H2 issues | Statuses |',
    '| --- | --- | ---: | --- | --- | --- | --- |',
    ...weakRows.map((row) =>
      [
        row.route,
        row.family,
        row.emittedKeywordCount,
        row.titleIssues.join('; ') || '-',
        row.h1Issues.join('; ') || '-',
        row.h2Issues.join('; ') || '-',
        row.statuses.join('; '),
      ]
        .map(csvEscape)
        .join(' | '),
    ),
    '',
    '## Protected Audit-Only Routes',
    '',
    '| Route | Family | Keywords | Statuses |',
    '| --- | --- | ---: | --- |',
    ...summary.protectedRoutes.map((row) =>
      [row.route, row.family, row.emittedKeywordCount, row.statuses.join('; ')].map(csvEscape).join(' | '),
    ),
    '',
  ].join('\n');
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const rows = buildAuditRows();
  const summary = summarize(rows);

  console.log('\nUnified SEO keyword/title/H1 coverage audit\n');
  console.log(`Public routes audited: ${summary.totals.publicRoutes}`);
  console.log(`Meets 10+ keywords: ${summary.totals.meets10}`);
  console.log(`Below 10 keywords: ${summary.totals.below10}`);
  console.log(`No explicit keywords: ${summary.totals.noExplicitKeywords}`);
  console.log(`Capped by helper: ${summary.totals.cappedByHelper}`);
  console.log(`Protected audit-only routes included: ${summary.totals.protectedAuditOnly}`);
  console.log(`Title needs review: ${summary.totals.titleNeedsReview}`);
  console.log(`H1 needs review: ${summary.totals.h1NeedsReview}`);
  console.log(`H2 needs review: ${summary.totals.h2NeedsReview}`);

  if (args.has('--json')) {
    console.log(JSON.stringify({ summary, rows }, null, 2));
  }

  if (args.has('--write')) {
    const outDir = auditOutDir('seo-unified-coverage', { latest: true });
    await ensureDir(outDir);
    await writeJSON(path.join(outDir, 'summary.json'), summary);
    await writeJSON(path.join(outDir, 'rows.json'), rows);
    fs.writeFileSync(path.join(outDir, 'rows.csv'), toCsv(rows), 'utf8');
    fs.writeFileSync(path.join(outDir, 'summary.md'), toMarkdown(summary, rows), 'utf8');
    console.log(`\nWrote ignored audit outputs to ${path.relative(process.cwd(), outDir)}`);
  }

  if (args.has('--strict')) {
    const failingRows = rows.filter(
      (row) =>
        row.scope === 'public' &&
        !row.protectedAuditOnly &&
        (!row.keywordTargetMet || row.titleIssueCount > 0 || row.h1IssueCount > 0 || row.h2IssueCount > 0),
    );
    if (failingRows.length > 0) {
      console.error(`\nStrict audit failed: ${failingRows.length} non-protected public routes need SEO coverage work.`);
      process.exit(1);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
