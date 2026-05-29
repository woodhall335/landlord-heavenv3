#!/usr/bin/env npx tsx
/**
 * Page-by-page visible content quality audit.
 *
 * This complements the keyword/title/H1/H2 coverage audit. It intentionally
 * scores visible copy and usefulness signals instead of treating meta keywords
 * as ranking content.
 */

import fs from 'node:fs';
import path from 'node:path';
import type { ReactNode } from 'react';
import { auditOutDir, ensureDir, writeJSON } from './_auditPaths';
import { blogPosts } from '../src/lib/blog/posts';
import { productReformBlogPosts } from '../src/lib/blog/product-reform-posts';
import { getCategoryConfig } from '../src/lib/blog/categories';
import { getTopicHubConfig } from '../src/lib/blog/topic-hubs';
import { productSamplePages } from '../src/lib/marketing/product-sample-pages';
import { RENT_INCREASE_GUIDE_PAGES } from '../src/app/rent-increase/content';
import { CURRENT_ENGLAND_FRAMEWORK_PAGES } from '../src/lib/seo/england-current-framework-pages';
import { INTENT_PAGES } from '../src/lib/seo/eviction-intent-pages';
import { PASS1_LONGFORM_PAGES } from '../src/lib/seo/pass1-longform-content';
import { PASS2_LONGFORM_PAGES } from '../src/lib/seo/pass2-longform-content';
import { PHASE5_PAGES } from '../src/lib/seo/phase5-pages';

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

type Severity = 'good' | 'low' | 'medium' | 'high' | 'critical';

interface UnifiedSeoRow {
  route: string;
  sourceFile: string | null;
  scope: AuditScope;
  family: SeoFamily;
  families: SeoFamily[];
  keywordSource: string;
  emittedKeywordCount: number;
  title: string | null;
  h1: string | null;
  h2Count: number;
  keywordPreview: string[];
}

interface QualityIssue {
  code: string;
  severity: Exclude<Severity, 'good'>;
  message: string;
  recommendation: string;
}

interface ContentSignals {
  firstScreenIntent: boolean;
  naturalKeywordUsage: boolean;
  answerFirst: boolean;
  hasSteps: boolean;
  hasExamples: boolean;
  hasChecklist: boolean;
  hasFaq: boolean;
  hasNextAction: boolean;
  hasProductFit: boolean;
  hasTrustProof: boolean;
  hiddenKeywordRelianceRisk: boolean;
}

interface ContentQualityRow {
  route: string;
  family: SeoFamily;
  families: SeoFamily[];
  sourceFile: string | null;
  configSource: string;
  title: string | null;
  metaDescription: string | null;
  h1: string | null;
  h2Count: number;
  visibleWordCount: number;
  firstScreenIntentClarity: boolean;
  naturalKeywordUsage: boolean;
  usefulnessSignals: string[];
  commercialIntentQuality: 'strong' | 'adequate' | 'weak' | 'not-commercial';
  hiddenKeywordRelianceRisk: boolean;
  score: number;
  severity: Severity;
  issues: string[];
  recommendations: string[];
}

const ROOT = process.cwd();
const UNIFIED_ROWS_PATH = path.join(ROOT, 'audit-output', 'seo-unified-coverage', 'latest', 'rows.json');
const MIN_WORDS_BY_FAMILY: Partial<Record<SeoFamily, number>> = {
  homepage: 450,
  product: 550,
  tool: 420,
  'high-intent': 650,
  blog: 700,
  marketing: 300,
  sample: 300,
  'tenancy/AST': 550,
  'notice-only': 550,
  'money-claim': 600,
  'rent-increase': 500,
  'general-public': 250,
};

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

const FAMILY_PRIORITY: Partial<Record<SeoFamily, number>> = {
  homepage: 0,
  product: 1,
  'notice-only': 1,
  'tenancy/AST': 1,
  tool: 2,
  sample: 3,
  'money-claim': 4,
  'rent-increase': 4,
  'high-intent': 5,
  blog: 6,
  marketing: 7,
  'general-public': 8,
};

function readText(filePath: string | null): string {
  if (!filePath) return '';
  const absPath = path.isAbsolute(filePath) ? filePath : path.join(ROOT, filePath);
  return fs.existsSync(absPath) ? fs.readFileSync(absPath, 'utf8') : '';
}

function cleanText(value: string): string {
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/\{[^}]*\}/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function wordCount(text: string): number {
  return (text.match(/\b[\w'-]{2,}\b/g) ?? []).length;
}

function literalStrings(sourceText: string): string[] {
  const strings: string[] = [];
  const pattern = /(['"`])((?:\\.|(?!\1)[\s\S])*?)\1/g;
  for (const match of sourceText.matchAll(pattern)) {
    const value = cleanText(match[2]);
    if (value.length >= 3 && /[a-z]/i.test(value) && !/^[\w-]+$/.test(value)) {
      strings.push(value);
    }
  }
  return strings;
}

function jsxText(sourceText: string): string[] {
  return [...sourceText.matchAll(/>([^<>{}][^<>{}]*)</g)]
    .map((match) => cleanText(match[1]))
    .filter((value) => value.length >= 3 && /[a-z]/i.test(value));
}

function reactNodeText(node: ReactNode): string {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(reactNodeText).join(' ');
  if (typeof node === 'object' && 'props' in node) {
    const props = (node as { props?: { children?: ReactNode } }).props;
    return reactNodeText(props?.children);
  }
  return '';
}

function collectObjectText(value: unknown, seen = new WeakSet<object>()): string {
  if (value == null || typeof value === 'boolean') return '';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (Array.isArray(value)) return value.map((item) => collectObjectText(item, seen)).join(' ');
  if (typeof value === 'object') {
    if (seen.has(value)) return '';
    seen.add(value);

    if ('props' in value) {
      return reactNodeText(value as ReactNode);
    }

    return Object.values(value as Record<string, unknown>)
      .map((item) => collectObjectText(item, seen))
      .join(' ');
  }
  return '';
}

function getFirstStringField(sourceText: string, fieldName: string): string | null {
  const patterns = [
    new RegExp(`${fieldName}\\s*:\\s*'([^']+)'`),
    new RegExp(`${fieldName}\\s*:\\s*"([^"]+)"`),
    new RegExp(`${fieldName}\\s*:\\s*` + '`' + '([^`]+)' + '`'),
  ];

  for (const pattern of patterns) {
    const match = sourceText.match(pattern);
    if (match?.[1]) return cleanText(match[1]);
  }
  return null;
}

function routeSlug(route: string, prefix: string): string | null {
  if (!route.startsWith(prefix)) return null;
  const slug = route.slice(prefix.length).replace(/^\/+/, '');
  return slug || null;
}

function configBackedText(row: UnifiedSeoRow): { text: string; metaDescription: string | null; configSource: string } {
  const blogSlug = routeSlug(row.route, '/blog');
  const blogPost = blogSlug ? [...blogPosts, ...productReformBlogPosts].find((post) => post.slug === blogSlug) : null;
  if (blogPost) {
    return {
      configSource: 'blog post config',
      metaDescription: blogPost.metaDescription || blogPost.description || null,
      text: [
        blogPost.title,
        blogPost.description,
        blogPost.metaDescription,
        blogPost.targetKeyword,
        ...blogPost.secondaryKeywords,
        ...blogPost.tableOfContents.map((item) => item.title),
        reactNodeText(blogPost.content),
        ...(blogPost.faqs ?? []).flatMap((faq) => [faq.question, faq.answer]),
      ].join(' '),
    };
  }

  if (blogSlug) {
    const topicHub = getTopicHubConfig(blogSlug);
    if (topicHub) {
      const matchingPosts = [...blogPosts, ...productReformBlogPosts].filter(topicHub.matcher).slice(0, 12);
      return {
        configSource: 'blog topic hub config',
        metaDescription: topicHub.metaDescription,
        text: collectObjectText({
          ...topicHub,
          matchingPosts: matchingPosts.map((post) => ({
            title: post.title,
            description: post.description,
            targetKeyword: post.targetKeyword,
            secondaryKeywords: post.secondaryKeywords,
          })),
        }),
      };
    }

    const category = getCategoryConfig(blogSlug as Parameters<typeof getCategoryConfig>[0]);
    if (category) {
      return {
        configSource: 'blog category config',
        metaDescription: category.metaDescription,
        text: collectObjectText(category),
      };
    }
  }

  const sample = productSamplePages.find((page) => page.samplePath === row.route);
  if (sample) {
    return {
      configSource: 'product sample config',
      metaDescription: sample.metaDescription,
      text: [
        sample.metaTitle,
        sample.metaDescription,
        sample.targetKeyword,
        sample.intro,
        sample.ctaText,
        ...sample.seoKeywords,
        ...sample.faqs.flatMap((faq) => [faq.question, faq.answer]),
      ].join(' '),
    };
  }

  const intentSlug = row.route.slice(1);
  const rentIncreaseSlug = row.route === '/products/rent-increase' || row.route === '/rent-increase'
    ? 'hub'
    : routeSlug(row.route, '/rent-increase');
  const rentIncreasePage =
    rentIncreaseSlug && rentIncreaseSlug in RENT_INCREASE_GUIDE_PAGES
      ? RENT_INCREASE_GUIDE_PAGES[rentIncreaseSlug as keyof typeof RENT_INCREASE_GUIDE_PAGES]
      : null;
  if (rentIncreasePage) {
    return {
      configSource: 'rent increase guide config',
      metaDescription: rentIncreasePage.metaDescription ?? rentIncreasePage.description ?? null,
      text: collectObjectText(rentIncreasePage),
    };
  }

  const currentFrameworkPage = CURRENT_ENGLAND_FRAMEWORK_PAGES[intentSlug as keyof typeof CURRENT_ENGLAND_FRAMEWORK_PAGES];
  if (currentFrameworkPage) {
    return {
      configSource: 'current England framework config',
      metaDescription: currentFrameworkPage.description,
      text: collectObjectText(currentFrameworkPage),
    };
  }

  const intentPage = INTENT_PAGES[intentSlug];
  if (intentPage) {
    return {
      configSource: 'intent page helper',
      metaDescription: intentPage.description,
      text: [
        intentPage.title,
        intentPage.description,
        intentPage.h1,
        intentPage.heroSubheadline,
        intentPage.problemIntro,
        intentPage.intentDeepDive,
        intentPage.solicitorPositioning,
        intentPage.finalCta,
        ...intentPage.proofBullets,
        ...intentPage.landlordScenarios,
        ...intentPage.mistakeRisks,
        ...intentPage.templateRisks,
        ...intentPage.whyLandlordHeaven,
        ...intentPage.howItWorks,
        ...intentPage.included,
        ...intentPage.compliance,
        ...intentPage.comparisons.flatMap((comparison) => [
          comparison.point,
          comparison.landlordHeaven,
          comparison.alternative,
        ]),
        ...intentPage.faqs.flatMap((faq) => [faq.question, faq.answer]),
        ...intentPage.relatedLinks.flatMap((link) => [link.label, link.href]),
      ].join(' '),
    };
  }

  const pass1Page = PASS1_LONGFORM_PAGES[intentSlug];
  if (pass1Page) {
    return {
      configSource: 'pass1 longform config',
      metaDescription: pass1Page.description,
      text: collectObjectText(pass1Page),
    };
  }

  const pass2Page = PASS2_LONGFORM_PAGES[intentSlug];
  if (pass2Page) {
    return {
      configSource: 'pass2 longform config',
      metaDescription: pass2Page.description,
      text: collectObjectText(pass2Page),
    };
  }

  const phase5Page = PHASE5_PAGES[intentSlug];
  if (phase5Page) {
    return {
      configSource: 'phase5 page config',
      metaDescription: phase5Page.description,
      text: collectObjectText(phase5Page),
    };
  }

  return { text: '', metaDescription: null, configSource: row.sourceFile ? 'route source' : 'unknown' };
}

function visibleTextForRow(row: UnifiedSeoRow): { text: string; metaDescription: string | null; configSource: string } {
  const sourceText = readText(row.sourceFile);
  const componentText = [
    row.route === '/' ? readText(path.join('src', 'components', 'landing', 'HomeContent.tsx')) : '',
    /PublicProductSalesPage/.test(sourceText) ? readText(path.join('src', 'components', 'marketing', 'PublicProductSalesPage.tsx')) : '',
    /EnglandTenancyPage/.test(sourceText) ? readText(path.join('src', 'components', 'seo', 'EnglandTenancyPage.tsx')) : '',
    /HighIntentPageShell/.test(sourceText) ? readText(path.join('src', 'components', 'seo', 'HighIntentPageShell.tsx')) : '',
    /PillarPageShell/.test(sourceText) ? readText(path.join('src', 'components', 'seo', 'PillarPageShell.tsx')) : '',
    /EvictionIntentLandingPage/.test(sourceText) ? readText(path.join('src', 'components', 'seo', 'EvictionIntentLandingPage.tsx')) : '',
    /RentIncreaseGuidePageView/.test(sourceText) ? readText(path.join('src', 'app', 'rent-increase', 'RentIncreaseGuidePage.tsx')) : '',
    /Section8NoticeDateCalculator/.test(sourceText) ? readText(path.join('src', 'components', 'tools', 'section8-date-calculator', 'Section8NoticeDateCalculator.tsx')) : '',
    /RentIncreaseChallengeChecker/.test(sourceText) ? readText(path.join('src', 'components', 'tools', 'rent-checker', 'RentIncreaseChallengeChecker.tsx')) : '',
    /RentIncreaseChallengeChecker/.test(sourceText) ? readText(path.join('src', 'components', 'tools', 'rent-checker', 'RentCheckerLanding.tsx')) : '',
    /RentIncreaseChallengeChecker/.test(sourceText) ? readText(path.join('src', 'components', 'tools', 'rent-checker', 'RentCheckerForm.tsx')) : '',
    /RentIncreaseChallengeChecker/.test(sourceText) ? readText(path.join('src', 'components', 'tools', 'rent-checker', 'RentCheckerResultPage.tsx')) : '',
    /RentCheckerSeoPage/.test(sourceText) ? readText(path.join('src', 'components', 'tools', 'rent-checker', 'RentCheckerSeoPage.tsx')) : '',
  ].join('\n');
  const config = configBackedText(row);
  const sourceVisibleText = [...jsxText(`${sourceText}\n${componentText}`), ...literalStrings(`${sourceText}\n${componentText}`)].join(' ');
  const metaDescription = config.metaDescription ?? getFirstStringField(sourceText, 'description');
  return {
    configSource: config.configSource,
    metaDescription,
    text: cleanText([config.text, sourceVisibleText].filter(Boolean).join(' ')),
  };
}

function tokenSet(text: string): Set<string> {
  return new Set(
    (text.toLowerCase().match(/\b[a-z][a-z0-9'-]{2,}\b/g) ?? []).filter(
      (word) => !['the', 'and', 'for', 'with', 'from', 'that', 'this', 'your', 'you', 'are', 'can', 'into'].includes(word),
    ),
  );
}

function hasAny(text: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(text));
}

function getSignals(row: UnifiedSeoRow, visibleText: string, metaDescription: string | null): ContentSignals {
  const lower = visibleText.toLowerCase();
  const firstScreenText = [row.title, row.h1, metaDescription, visibleText.slice(0, 450)]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  const routeTerms = row.route
    .replace(/[^a-z0-9]+/gi, ' ')
    .split(/\s+/)
    .filter((term) => term.length > 3)
    .filter((term) => !['blog', 'tool', 'tools', 'product', 'products', 'compare'].includes(term));
  const contentTokens = tokenSet(visibleText);
  const keywordTokens = tokenSet(row.keywordPreview.join(' '));
  const matchedKeywordTokens = [...keywordTokens].filter((token) => contentTokens.has(token));
  const repeatedKeywordRisk = row.keywordPreview.some((keyword) => {
    const normalized = keyword.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const occurrences = lower.match(new RegExp(`\\b${normalized}\\b`, 'g'))?.length ?? 0;
    return keyword.split(/\s+/).length > 1 && occurrences > 10;
  });

  const routeIntentMatched =
    routeTerms.length === 0
      ? row.family !== 'private-excluded'
      : routeTerms.some((term) => firstScreenText.includes(term)) ||
        [...keywordTokens].filter((token) => firstScreenText.includes(token)).length >= 2;

  return {
    firstScreenIntent:
      routeIntentMatched &&
      /\b(landlord|tenant|rent|tenancy|notice|eviction|claim|court|property|agreement|hmo|wales|occupation|contract|licence|license|documents)\b/.test(firstScreenText),
    naturalKeywordUsage: matchedKeywordTokens.length >= Math.min(4, Math.max(2, keywordTokens.size / 4)) && !repeatedKeywordRisk,
    answerFirst: hasAny(lower.slice(0, 1400), [
      /\b(short answer|quick answer|start here|use this|this guide|this page)\b/,
      /\b(start|use|serve|create|prepare|check|calculate|compare|recover|evict|claim)\b/,
      /\b(if you|when|the next step|first|before)\b/,
    ]),
    hasSteps: hasAny(lower, [/\bstep\b/, /\bhow it works\b/, /\bworkflow\b/, /\bprocess\b/, /\bfirst\b.*\bnext\b/]),
    hasExamples: hasAny(lower, [/\bexample\b/, /\bsample\b/, /\bscenario\b/, /\bcase\b/, /\btemplate\b/]),
    hasChecklist: hasAny(lower, [/\bchecklist\b/, /\bcheck\b/, /\bevidence\b/, /\bproof\b/, /\binclude[sd]?\b/]),
    hasFaq: hasAny(lower, [/\bfaq\b/, /\bfrequently asked\b/, /\bquestion\b/]),
    hasNextAction: hasAny(lower, [/\bcreate\b/, /\bprepare\b/, /\bstart\b/, /\bdownload\b/, /\bcheck\b/, /\bcalculate\b/, /\bnext step\b/]),
    hasProductFit: hasAny(lower, [
      /\bwho this is for\b/,
      /\bwhen to use\b/,
      /\buse this\b/,
      /\bchoose\b/,
      /\bif you\b/,
      /\bfit\b/,
      /\bright (agreement|route|pack|product)\b/,
      /\bagreement route\b/,
      /\bstandard private tenancy\b/,
      /\bpremium private tenancy\b/,
      /\bstart (standard|premium|my|the)\b/,
    ]),
    hasTrustProof: hasAny(lower, [
      /\bpreview\b/,
      /\bsample\b/,
      /\bproof\b/,
      /\bsolicitor\b/,
      /\bcourt\b/,
      /\bevidence\b/,
      /\bcompliance\b/,
      /\blegally (valid|validated|binding)\b/,
      /\blegal(ly)?\b/,
      /\bact 20\d{2}\b/,
      /\btenant rights\b/,
      /\bresponsibilities\b/,
      /\bcurrent wording\b/,
    ]),
    hiddenKeywordRelianceRisk: wordCount(visibleText) < 220 && row.emittedKeywordCount >= 10,
  };
}

function issue(code: string, severity: QualityIssue['severity'], message: string, recommendation: string): QualityIssue {
  return { code, severity, message, recommendation };
}

function familyMinimum(row: UnifiedSeoRow): number {
  const candidates = row.families.map((family) => MIN_WORDS_BY_FAMILY[family] ?? 0);
  return Math.max(MIN_WORDS_BY_FAMILY[row.family] ?? 250, ...candidates);
}

function scoreRow(row: UnifiedSeoRow): ContentQualityRow {
  const visible = visibleTextForRow(row);
  const count = wordCount(visible.text);
  const signals = getSignals(row, visible.text, visible.metaDescription);
  const minWords = familyMinimum(row);
  const commercial = row.families.some((family) => COMMERCIAL_FAMILIES.has(family));
  const issues: QualityIssue[] = [];

  if (count < Math.floor(minWords * 0.45)) {
    issues.push(
      issue(
        'thin_visible_content',
        'high',
        `Visible content is very thin for this page family (${count} words detected; target floor ${minWords}).`,
        'Add useful visible copy that answers the search intent, explains the route, and guides the landlord to the next action.',
      ),
    );
  } else if (count < minWords) {
    issues.push(
      issue(
        'short_visible_content',
        'medium',
        `Visible content is shorter than the recommended family floor (${count} words detected; target ${minWords}).`,
        'Expand the page with answer-first guidance, examples, checks, FAQs, or decision support specific to the route.',
      ),
    );
  }

  if (!signals.firstScreenIntent) {
    issues.push(
      issue(
        'weak_first_screen_intent',
        commercial ? 'high' : 'medium',
        'The title/H1/meta/early copy do not clearly lock onto landlord search intent.',
        'Rewrite the opening block so the first screen states the landlord problem, jurisdiction or route, and the practical outcome.',
      ),
    );
  }

  if (
    !signals.naturalKeywordUsage &&
    !(count >= minWords && signals.firstScreenIntent && usefulnessSignalsForScoring(signals) >= 5)
  ) {
    issues.push(
      issue(
        'unnatural_or_meta_only_keywords',
        'medium',
        'Keyword targeting is not clearly reflected in natural visible copy, or repeated keyword risk is present.',
        'Work the primary and secondary terms into normal sentences, headings, examples, and FAQs rather than relying on meta keywords.',
      ),
    );
  }

  if (!signals.answerFirst) {
    issues.push(
      issue(
        'missing_answer_first_intro',
        'medium',
        'The page does not appear to answer the query quickly near the top.',
        'Add a direct answer or decision paragraph before deeper explanation.',
      ),
    );
  }

  const practicalSignalCount = [
    signals.hasSteps,
    signals.hasExamples,
    signals.hasChecklist,
    signals.hasFaq,
    signals.hasNextAction,
  ].filter(Boolean).length;
  if (practicalSignalCount < 3) {
    issues.push(
      issue(
        'low_practical_usefulness',
        commercial && practicalSignalCount < 2 ? 'high' : 'medium',
        'The page has too few practical usefulness signals for its search intent.',
        'Add route-specific steps, examples, checklists, FAQs, and a clear next action.',
      ),
    );
  }

  if (commercial && !signals.hasProductFit) {
    issues.push(
      issue(
        'weak_product_fit_explanation',
        'medium',
        'Commercial-intent page does not clearly explain when this product/tool/route fits.',
        'Add a visible "use this when" style section tailored to the landlord scenario.',
      ),
    );
  }

  if (commercial && !signals.hasTrustProof) {
    issues.push(
      issue(
        'weak_trust_or_proof',
        'medium',
        'Commercial-intent page lacks enough proof, evidence, preview, sample, or compliance cues.',
        'Add proof points such as included documents, previews, samples, evidence checks, compliance support, or court-readiness cues.',
      ),
    );
  }

  if (signals.hiddenKeywordRelianceRisk) {
    issues.push(
      issue(
        'hidden_keyword_reliance_risk',
        count < 120 ? 'high' : 'medium',
        'The page has 10+ keyword targets but too little visible content to carry those topics naturally.',
        'Treat the meta keywords as planning inputs only and add visible copy that covers the target topics naturally.',
      ),
    );
  }

  const score = Math.max(
    0,
    100 -
      issues.reduce((total, item) => {
        if (item.severity === 'critical') return total + 35;
        if (item.severity === 'high') return total + 24;
        if (item.severity === 'medium') return total + 12;
        return total + 5;
      }, 0),
  );

  const severity: Severity =
    issues.some((item) => item.severity === 'critical') || score < 45
      ? 'critical'
      : issues.some((item) => item.severity === 'high')
        ? 'high'
        : issues.some((item) => item.severity === 'medium') || score < 85
          ? 'medium'
          : issues.length > 0 || score < 92
            ? 'low'
            : 'good';

  const usefulnessSignals = [
    signals.answerFirst ? 'answer-first intro' : null,
    signals.hasSteps ? 'steps/process' : null,
    signals.hasExamples ? 'examples/samples' : null,
    signals.hasChecklist ? 'checklist/evidence' : null,
    signals.hasFaq ? 'FAQs' : null,
    signals.hasNextAction ? 'next action' : null,
    signals.hasProductFit ? 'product fit' : null,
    signals.hasTrustProof ? 'trust/proof' : null,
  ].filter(Boolean) as string[];

  const commercialIntentQuality =
    !commercial
      ? 'not-commercial'
      : signals.hasNextAction && signals.hasProductFit && signals.hasTrustProof
        ? 'strong'
        : signals.hasNextAction && (signals.hasProductFit || signals.hasTrustProof)
          ? 'adequate'
          : 'weak';

  return {
    route: row.route,
    family: row.family,
    families: row.families,
    sourceFile: row.sourceFile,
    configSource: visible.configSource,
    title: row.title,
    metaDescription: visible.metaDescription,
    h1: row.h1,
    h2Count: row.h2Count,
    visibleWordCount: count,
    firstScreenIntentClarity: signals.firstScreenIntent,
    naturalKeywordUsage: signals.naturalKeywordUsage,
    usefulnessSignals,
    commercialIntentQuality,
    hiddenKeywordRelianceRisk: signals.hiddenKeywordRelianceRisk,
    score,
    severity,
    issues: issues.map((item) => `${item.severity}: ${item.message}`),
    recommendations: [...new Set(issues.map((item) => item.recommendation))],
  };
}

function usefulnessSignalsForScoring(signals: ContentSignals): number {
  return [
    signals.answerFirst,
    signals.hasSteps,
    signals.hasExamples,
    signals.hasChecklist,
    signals.hasFaq,
    signals.hasNextAction,
    signals.hasProductFit,
    signals.hasTrustProof,
  ].filter(Boolean).length;
}

function severityRank(severity: Severity): number {
  return { critical: 0, high: 1, medium: 2, low: 3, good: 4 }[severity];
}

function csvEscape(value: unknown): string {
  const text = Array.isArray(value) ? value.join('; ') : String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function toCsv(rows: ContentQualityRow[]): string {
  const headers = [
    'route',
    'family',
    'families',
    'sourceFile',
    'configSource',
    'title',
    'metaDescription',
    'h1',
    'h2Count',
    'visibleWordCount',
    'firstScreenIntentClarity',
    'naturalKeywordUsage',
    'usefulnessSignals',
    'commercialIntentQuality',
    'hiddenKeywordRelianceRisk',
    'score',
    'severity',
    'issues',
    'recommendations',
  ];

  return `${[
    headers.join(','),
    ...rows.map((row) => headers.map((header) => csvEscape((row as unknown as Record<string, unknown>)[header])).join(',')),
  ].join('\n')}\n`;
}

function summarize(rows: ContentQualityRow[]) {
  const bySeverity = rows.reduce<Record<Severity, number>>(
    (acc, row) => {
      acc[row.severity] += 1;
      return acc;
    },
    { good: 0, low: 0, medium: 0, high: 0, critical: 0 },
  );
  const familySummary = rows.reduce<Record<string, { total: number; averageScore: number; critical: number; high: number; medium: number }>>(
    (acc, row) => {
      acc[row.family] ??= { total: 0, averageScore: 0, critical: 0, high: 0, medium: 0 };
      acc[row.family].total += 1;
      acc[row.family].averageScore += row.score;
      if (row.severity === 'critical') acc[row.family].critical += 1;
      if (row.severity === 'high') acc[row.family].high += 1;
      if (row.severity === 'medium') acc[row.family].medium += 1;
      return acc;
    },
    {},
  );

  for (const summary of Object.values(familySummary)) {
    summary.averageScore = Number((summary.averageScore / Math.max(1, summary.total)).toFixed(1));
  }

  return {
    generatedAt: new Date().toISOString(),
    publicRoutesAudited: rows.length,
    bySeverity,
    averageScore: Number((rows.reduce((total, row) => total + row.score, 0) / Math.max(1, rows.length)).toFixed(1)),
    familySummary,
    topPriorityRoutes: sortPriorityRows(rows)
      .filter((row) => row.severity !== 'good')
      .slice(0, 30)
      .map((row) => ({
        route: row.route,
        family: row.family,
        score: row.score,
        severity: row.severity,
        recommendations: row.recommendations,
      })),
  };
}

function sortPriorityRows(rows: ContentQualityRow[]): ContentQualityRow[] {
  return [...rows].sort((a, b) => {
    const severityDelta = severityRank(a.severity) - severityRank(b.severity);
    if (severityDelta !== 0) return severityDelta;
    const familyDelta = (FAMILY_PRIORITY[a.family] ?? 99) - (FAMILY_PRIORITY[b.family] ?? 99);
    if (familyDelta !== 0) return familyDelta;
    return a.score - b.score;
  });
}

function toSummaryMarkdown(summary: ReturnType<typeof summarize>): string {
  const families = Object.entries(summary.familySummary).sort(([a], [b]) => a.localeCompare(b));
  return [
    '# Page-By-Page Content Quality SEO Audit',
    '',
    `Generated: ${summary.generatedAt}`,
    'Scoring focus: visible copy, search intent match, usefulness, commercial next steps, and natural keyword usage.',
    '',
    '## Summary',
    '',
    `- Public routes audited: ${summary.publicRoutesAudited}`,
    `- Average quality score: ${summary.averageScore}`,
    `- Good: ${summary.bySeverity.good}`,
    `- Low: ${summary.bySeverity.low}`,
    `- Medium: ${summary.bySeverity.medium}`,
    `- High: ${summary.bySeverity.high}`,
    `- Critical: ${summary.bySeverity.critical}`,
    '',
    '## Family Summary',
    '',
    '| Family | Routes | Avg score | Critical | High | Medium |',
    '| --- | ---: | ---: | ---: | ---: | ---: |',
    ...families.map(([family, row]) => `| ${family} | ${row.total} | ${row.averageScore} | ${row.critical} | ${row.high} | ${row.medium} |`),
    '',
    '## Top Priority Routes',
    '',
    '| Route | Family | Score | Severity | First recommendation |',
    '| --- | --- | ---: | --- | --- |',
    ...summary.topPriorityRoutes.map((row) =>
      `| ${row.route} | ${row.family} | ${row.score} | ${row.severity} | ${csvEscape(row.recommendations[0] ?? '')} |`,
    ),
    '',
  ].join('\n');
}

function toPriorityMarkdown(rows: ContentQualityRow[]): string {
  const priorityRows = sortPriorityRows(rows).filter((row) => row.severity !== 'good');
  return [
    '# Priority Page-By-Page Content Edits',
    '',
    'Use this as the hand-edit queue. Fix high and critical rows first, then commercial medium rows, then long-tail medium rows.',
    '',
    ...priorityRows.map((row, index) =>
      [
        `## ${index + 1}. ${row.route}`,
        '',
        `- Family: ${row.family}`,
        `- Score: ${row.score}`,
        `- Severity: ${row.severity}`,
        `- Visible words detected: ${row.visibleWordCount}`,
        `- Commercial intent quality: ${row.commercialIntentQuality}`,
        `- Issues: ${row.issues.join(' | ') || 'none'}`,
        `- Hand-edit actions: ${row.recommendations.join(' | ') || 'none'}`,
        '',
      ].join('\n'),
    ),
  ].join('\n');
}

function loadUnifiedRows(): UnifiedSeoRow[] {
  if (!fs.existsSync(UNIFIED_ROWS_PATH)) {
    throw new Error(
      `Missing unified SEO rows at ${path.relative(ROOT, UNIFIED_ROWS_PATH)}. Run npm run audit:seo-unified-coverage first.`,
    );
  }

  const rows = JSON.parse(fs.readFileSync(UNIFIED_ROWS_PATH, 'utf8')) as UnifiedSeoRow[];
  return rows.filter((row) => row.scope === 'public');
}

async function main() {
  const rows = loadUnifiedRows().map(scoreRow);
  const summary = summarize(rows);
  const outDir = auditOutDir('seo-content-quality', { latest: true });

  await ensureDir(outDir);
  await writeJSON(path.join(outDir, 'summary.json'), summary);
  await writeJSON(path.join(outDir, 'rows.json'), rows);
  fs.writeFileSync(path.join(outDir, 'rows.csv'), toCsv(rows), 'utf8');
  fs.writeFileSync(path.join(outDir, 'summary.md'), toSummaryMarkdown(summary), 'utf8');
  fs.writeFileSync(path.join(outDir, 'priority-edits.md'), toPriorityMarkdown(rows), 'utf8');

  console.log('\nPage-by-page content quality SEO audit\n');
  console.log(`Public routes audited: ${summary.publicRoutesAudited}`);
  console.log(`Average quality score: ${summary.averageScore}`);
  console.log(`Good: ${summary.bySeverity.good}`);
  console.log(`Low: ${summary.bySeverity.low}`);
  console.log(`Medium: ${summary.bySeverity.medium}`);
  console.log(`High: ${summary.bySeverity.high}`);
  console.log(`Critical: ${summary.bySeverity.critical}`);
  console.log(`\nWrote quality outputs to ${path.relative(ROOT, outDir)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
