import type { ReactNode } from 'react';
import path from 'node:path';
import fs from 'node:fs';

import { blogPosts } from '@/lib/blog/posts';
import { getPostRegion } from '@/lib/blog/categories';
import { getBlogSeoConfig } from '@/lib/blog/seo';
import { isTop30UpgradedPost } from '@/lib/blog/top30-upgrades';
import { OWNER_PAGE_CONTRACTS } from '@/lib/seo/owner-page-contracts';
import { PRODUCT_OWNER_METADATA_LIST } from '@/lib/seo/product-owner-metadata';
import {
  getRetainedSeoPageTaxonomyEntries,
  type SeoPageTaxonomyEntry,
} from '@/lib/seo/page-taxonomy';
import { discoverStaticPageRoutes } from '@/lib/seo/static-route-inventory.shared.mjs';

export type SeoOpportunityPageType = 'owner' | 'high-intent' | 'blog';

export type SeoOpportunityCluster =
  | 'section-8-notice'
  | 'section-8-court'
  | 'money-claim'
  | 'section-13'
  | 'tenancy-agreements'
  | 'blog-posts';

export type SeoOpportunityPriority = 'High' | 'Medium' | 'Low';

export interface SeoOpportunityLinkSuggestion {
  href: string;
  anchor: string;
}

export interface SeoOpportunityAuditItem {
  pageUrl: string;
  pageType: SeoOpportunityPageType;
  cluster: SeoOpportunityCluster;
  sourceFile?: string;
  targetKeyword: string;
  metaDescription?: string;
  priority: SeoOpportunityPriority;
  priorityScore: number;
  missingOrWeakKeywords: string[];
  bodyKeywordHits: string[];
  metadataKeywordHits: string[];
  expectedProductLinks: string[];
  presentProductLinks: string[];
  suggestedVisibleCopy: string[];
  suggestedInternalLinks: SeoOpportunityLinkSuggestion[];
  faqOpportunities: string[];
  cannibalisationWarnings: string[];
  issues: string[];
  isTop30BlogPost?: boolean;
  primaryCommercialDestination?: string;
}

export interface SeoOpportunityAuditResult {
  generatedAt: string;
  totalPagesAudited: number;
  countsByPriority: Record<SeoOpportunityPriority, number>;
  countsByCluster: Record<SeoOpportunityCluster, number>;
  items: SeoOpportunityAuditItem[];
}

interface PageSource {
  pathname: string;
  filePath?: string;
  sourceText: string;
}

const APP_DIR = path.join(process.cwd(), 'src', 'app');

const PRIORITY_ORDER: Record<SeoOpportunityPriority, number> = {
  High: 0,
  Medium: 1,
  Low: 2,
};

const OWNER_METADATA_BY_PATH = new Map<string, (typeof PRODUCT_OWNER_METADATA_LIST)[number]>(
  PRODUCT_OWNER_METADATA_LIST.map((metadata) => [metadata.path, metadata])
);

const OWNER_CONTRACT_BY_PATH = new Map(
  OWNER_PAGE_CONTRACTS.map((contract) => [contract.pathname, contract])
);

const OWNER_PAGE_PATHS = new Set([
  ...OWNER_PAGE_CONTRACTS.map((contract) => contract.pathname),
  ...PRODUCT_OWNER_METADATA_LIST.map((metadata) => metadata.path),
]);

const CLUSTER_KEYWORDS: Record<SeoOpportunityCluster, string[]> = {
  'section-8-notice': [
    'section 8 notice generator',
    'section 8 notice builder',
    'validated section 8 notice',
    'solicitor-approved form 3a',
    'section 8 notice service pack',
    'post-May 2026',
    "Renters' Rights Act Section 8 form",
  ],
  'section-8-court': [
    'court-ready possession pack',
    'validated before filing',
    'possession claim pack',
    'N5 possession claim form',
    'N119 particulars of claim',
    'official court forms',
  ],
  'money-claim': [
    'money claim online pack',
    'MCOL pack for landlords',
    'rent arrears money claim',
    'particulars of claim template',
    'letter before claim template',
    'solicitor-approved MCOL pack',
  ],
  'section-13': [
    'Form 4A generator',
    'Section 13 notice template',
    'Section 13 rent increase pack',
    'validated Section 13 notice',
    'solicitor-approved tribunal pack',
    'tribunal evidence checklist',
  ],
  'tenancy-agreements': [
    'periodic tenancy agreement template',
    'assured periodic tenancy agreement',
    'tenancy agreement builder',
    'validated tenancy agreement',
    'Renters Rights Act compliant tenancy agreement',
    'post-May 2026',
  ],
  'blog-posts': [
    'validated',
    'builder',
    'generator',
    'solicitor-approved',
    'court-ready',
    'post-May 2026',
  ],
};

const CLUSTER_PRODUCT_LINKS: Record<SeoOpportunityCluster, SeoOpportunityLinkSuggestion[]> = {
  'section-8-notice': [
    { href: '/products/notice-only', anchor: 'use our validated Section 8 notice builder' },
  ],
  'section-8-court': [
    { href: '/products/complete-pack', anchor: 'prepare a court-ready possession pack' },
  ],
  'money-claim': [
    { href: '/products/money-claim', anchor: 'download the solicitor-approved MCOL pack for landlords' },
  ],
  'section-13': [
    { href: '/products/section-13-standard', anchor: 'generate a validated Section 13 notice' },
    { href: '/products/section-13-defence', anchor: 'prepare a solicitor-approved tribunal evidence pack' },
  ],
  'tenancy-agreements': [
    { href: '/standard-tenancy-agreement', anchor: "create a Renters' Rights Act compliant tenancy agreement" },
    { href: '/premium-tenancy-agreement', anchor: 'upgrade to a premium periodic tenancy agreement builder' },
  ],
  'blog-posts': [
    { href: '/products/notice-only', anchor: 'start the validated notice builder' },
  ],
};

const FAQ_OPPORTUNITIES: Record<SeoOpportunityCluster, string[]> = {
  'section-8-notice': [
    'Is this a court approved Section 8 notice?',
    'Can I use a Section 8 notice generator after May 2026?',
  ],
  'section-8-court': [
    'Is this a court approved possession claim form?',
    'What makes a possession claim pack court-ready?',
  ],
  'money-claim': [
    'Is this a court approved money claim?',
    'Can landlords use this MCOL pack for rent arrears?',
  ],
  'section-13': [
    'Is this pack approved by the tribunal?',
    'What evidence should a Section 13 tribunal bundle include?',
  ],
  'tenancy-agreements': [
    'Is this legally binding?',
    'Does this tenancy agreement support post-May 2026 periodic tenancies?',
  ],
  'blog-posts': [
    'What is the safest next step?',
    'Which validated landlord document should I use next?',
  ],
};

const normalize = (value: string) =>
  value
    .replace(/[’‘]/g, "'")
    .replace(/[–—]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

const unique = <T>(values: T[]): T[] => [...new Set(values)];

const hasPhrase = (haystack: string, phrase: string) => normalize(haystack).includes(normalize(phrase));

const stripFaqSection = (source: string) => {
  const lower = source.toLowerCase();
  const firstFaqIndex = [
    'faqsection',
    'faq section',
    'const faqs',
    'const faq',
    'faqs:',
    'frequently asked',
  ]
    .map((marker) => lower.indexOf(marker))
    .filter((index) => index >= 0)
    .sort((a, b) => a - b)[0];

  return firstFaqIndex === undefined ? source : source.slice(0, firstFaqIndex);
};

const extractMetadataDescriptionFromSource = (source: string): string | undefined => {
  const descriptionMatch = source.match(/description\s*:\s*(['"`])([\s\S]{40,260}?)\1/);
  const metaMatch = source.match(/metaDescription\s*:\s*(['"`])([\s\S]{40,260}?)\1/);
  return (descriptionMatch?.[2] ?? metaMatch?.[2])?.replace(/\s+/g, ' ').trim();
};

const routePathFromPageFile = (absFilePath: string) => {
  const rel = absFilePath.slice(APP_DIR.length).split(path.sep).join('/');
  const segs = rel.split('/').filter(Boolean);

  if (segs.at(-1) !== 'page.tsx') return null;
  segs.pop();
  if (segs.some((segment) => /^\[.*\]$/.test(segment))) return null;

  const routeSegments = segs.filter(
    (segment) => !/^\(.*\)$/.test(segment) && !segment.startsWith('@')
  );

  return routeSegments.length ? `/${routeSegments.join('/')}` : '/';
};

const walkSync = (dir: string): string[] => {
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name.startsWith('.')) return [];
    const absPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return walkSync(absPath);
    return [absPath];
  });
};

const buildStaticRouteSourceMap = () => {
  const sourceMap = new Map<string, PageSource>();

  for (const filePath of walkSync(APP_DIR)) {
    if (!filePath.endsWith(`${path.sep}page.tsx`)) continue;
    if (filePath.includes(`${path.sep}__tests__${path.sep}`)) continue;
    const pathname = routePathFromPageFile(filePath);
    if (!pathname) continue;
    sourceMap.set(pathname, {
      pathname,
      filePath,
      sourceText: fs.readFileSync(filePath, 'utf8'),
    });
  }

  return sourceMap;
};

export function classifySeoOpportunityCluster(input: string): SeoOpportunityCluster {
  const value = normalize(input);

  if (/(section 13|form 4a|rent increase|tribunal)/.test(value)) return 'section-13';
  if (/(mcol|money claim|rent arrears|unpaid rent|tenant debt|letter before claim)/.test(value)) {
    return 'money-claim';
  }
  if (/(n5|n119|possession claim|court pack|complete pack|court-ready possession)/.test(value)) {
    return 'section-8-court';
  }
  if (/(section 8|form 3a|eviction notice|notice-only|notice only|evict)/.test(value)) {
    return 'section-8-notice';
  }
  if (/(tenancy|periodic|ast|lodger|hmo|student|shared house|room let)/.test(value)) {
    return 'tenancy-agreements';
  }

  return 'blog-posts';
}

const clusterForTaxonomyEntry = (entry: SeoPageTaxonomyEntry) => {
  if (entry.cluster === 'money-claim' || entry.cluster === 'rent-arrears') return 'money-claim';
  if (entry.cluster === 'rent-increase') return 'section-13';
  if (entry.cluster === 'court-process') return 'section-8-court';
  if (
    entry.cluster === 'section-8' ||
    entry.cluster === 'how-to-evict' ||
    entry.cluster === 'eviction-process' ||
    entry.cluster === 'notice-templates' ||
    entry.cluster === 'eviction-hub'
  ) {
    return 'section-8-notice';
  }
  if (entry.cluster.startsWith('tenancy-')) return 'tenancy-agreements';
  return classifySeoOpportunityCluster(
    `${entry.pathname} ${entry.primaryPillar} ${entry.supportingPage} ${entry.primaryProduct}`
  );
};

const extractTextFromReactNode = (node: ReactNode): string => {
  if (node === null || node === undefined || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractTextFromReactNode).join(' ');
  if (typeof node === 'object' && 'props' in node) {
    return extractTextFromReactNode((node as { props?: { children?: ReactNode } }).props?.children);
  }
  return '';
};

const extractHrefsFromReactNode = (node: ReactNode): string[] => {
  if (node === null || node === undefined || typeof node !== 'object') return [];
  if (Array.isArray(node)) return node.flatMap(extractHrefsFromReactNode);
  if ('props' in node) {
    const props = (node as { props?: { href?: unknown; children?: ReactNode } }).props;
    const href = typeof props?.href === 'string' ? [props.href] : [];
    return [...href, ...extractHrefsFromReactNode(props?.children)];
  }
  return [];
};

const courtApprovedIssues = (source: string) => {
  const normalized = normalize(source);
  const issues: string[] = [];
  let cursor = normalized.indexOf('court approved');

  while (cursor >= 0) {
    const context = normalized.slice(Math.max(0, cursor - 120), cursor + 180);
    const safeFaqContext =
      /(faq|question|answer|courts do not pre-approve|do not pre-approve|no\. courts)/.test(context);

    if (!safeFaqContext) {
      issues.push('Unsafe `court approved` wording outside the explanatory FAQ context');
      break;
    }
    cursor = normalized.indexOf('court approved', cursor + 'court approved'.length);
  }

  return issues;
};

const suggestedCopyForPhrase = (cluster: SeoOpportunityCluster, phrase: string) => {
  if (cluster === 'section-8-notice') {
    return `Add visible pre-FAQ copy such as: "Use the ${phrase} with validation checks before you serve."`;
  }
  if (cluster === 'section-8-court') {
    return `Add visible pre-FAQ copy such as: "Prepare ${phrase} with official court forms and filing checks."`;
  }
  if (cluster === 'money-claim') {
    return `Add visible pre-FAQ copy such as: "Build a ${phrase} with arrears evidence and particulars checked before download."`;
  }
  if (cluster === 'section-13') {
    return `Add visible pre-FAQ copy such as: "Create a ${phrase} with market evidence, service records, and validation checks."`;
  }
  if (cluster === 'tenancy-agreements') {
    return `Add visible pre-FAQ copy such as: "Create a ${phrase} with validated wording for post-May 2026 England rules."`;
  }
  return `Add visible next-step copy that naturally includes "${phrase}" and points to the relevant commercial route.`;
};

const priorityFromIssues = (issues: string[], score: number): SeoOpportunityPriority => {
  if (
    issues.some((issue) =>
      /Unsafe|Missing commercial product link|No commercial phrase appears before FAQ/.test(issue)
    )
  ) {
    return 'High';
  }
  if (score >= 3) return 'Medium';
  return 'Low';
};

const buildItem = (input: {
  pageUrl: string;
  pageType: SeoOpportunityPageType;
  cluster: SeoOpportunityCluster;
  targetKeyword: string;
  sourceText: string;
  metadataText?: string;
  sourceFile?: string;
  configuredProductLinks?: string[];
  includeClusterProductSuggestions?: boolean;
  includeCommercialKeywordChecks?: boolean;
  visibleCommercialCopy?: string;
  hasMetadataExport?: boolean;
  isTop30BlogPost?: boolean;
  primaryCommercialDestination?: string;
}): SeoOpportunityAuditItem => {
  const auditedSourceText = `${input.visibleCommercialCopy ?? ''}\n${input.sourceText}`;
  const beforeFaq = stripFaqSection(auditedSourceText);
  const clusterKeywords = CLUSTER_KEYWORDS[input.cluster];
  const expectedLinks = unique([
    ...(input.configuredProductLinks ?? []),
    ...(input.includeClusterProductSuggestions === false
      ? []
      : CLUSTER_PRODUCT_LINKS[input.cluster].map((link) => link.href)),
  ]);

  const allText = `${input.metadataText ?? ''}\n${auditedSourceText}`;
  const shouldCheckCommercialKeywords = input.includeCommercialKeywordChecks !== false;
  const bodyKeywordHits = shouldCheckCommercialKeywords
    ? clusterKeywords.filter((phrase) => hasPhrase(beforeFaq, phrase))
    : [];
  const metadataKeywordHits = shouldCheckCommercialKeywords
    ? clusterKeywords.filter((phrase) => hasPhrase(input.metadataText ?? '', phrase))
    : [];
  const missingOrWeakKeywords = shouldCheckCommercialKeywords
    ? clusterKeywords.filter(
        (phrase) => !bodyKeywordHits.includes(phrase) && !metadataKeywordHits.includes(phrase)
      )
    : [];
  const presentProductLinks = expectedLinks.filter((href) => hasPhrase(auditedSourceText, href));

  const issues: string[] = [];
  if (!input.metadataText && !input.hasMetadataExport) {
    issues.push('Missing or unreadable meta description');
  } else if (input.metadataText && (input.metadataText.length < 120 || input.metadataText.length > 165)) {
    issues.push(`Meta description length is ${input.metadataText.length}; review for SEO length band`);
  }
  if (shouldCheckCommercialKeywords && bodyKeywordHits.length === 0) {
    issues.push('No commercial phrase appears before FAQ content');
  }
  if (expectedLinks.length > 0 && presentProductLinks.length === 0 && input.pageType !== 'owner') {
    issues.push('Missing commercial product link in visible content');
  }
  if (input.pageType === 'blog' && !input.targetKeyword) {
    issues.push('Blog post has no target keyword');
  }
  if (input.isTop30BlogPost && !input.primaryCommercialDestination) {
    issues.push('Top-30 blog post has no configured commercial next-step link');
  }
  issues.push(...courtApprovedIssues(allText));

  const score =
    issues.length +
    Math.min(3, missingOrWeakKeywords.length) +
    (shouldCheckCommercialKeywords && bodyKeywordHits.length <= 1 ? 1 : 0) +
    (expectedLinks.length > 0 && presentProductLinks.length === 0 && input.pageType !== 'owner' ? 2 : 0);

  const priority = priorityFromIssues(issues, score);
  const missingLinkSuggestions =
    input.includeClusterProductSuggestions === false
      ? []
      : CLUSTER_PRODUCT_LINKS[input.cluster].filter(
          (link) => !presentProductLinks.includes(link.href)
        );

  return {
    pageUrl: input.pageUrl,
    pageType: input.pageType,
    cluster: input.cluster,
    sourceFile: input.sourceFile,
    targetKeyword: input.targetKeyword,
    metaDescription: input.metadataText,
    priority,
    priorityScore: score,
    missingOrWeakKeywords: missingOrWeakKeywords.slice(0, 8),
    bodyKeywordHits,
    metadataKeywordHits,
    expectedProductLinks: expectedLinks,
    presentProductLinks,
    suggestedVisibleCopy: missingOrWeakKeywords.slice(0, 3).map((phrase) =>
      suggestedCopyForPhrase(input.cluster, phrase)
    ),
    suggestedInternalLinks: missingLinkSuggestions,
    faqOpportunities: FAQ_OPPORTUNITIES[input.cluster],
    cannibalisationWarnings: [],
    issues,
    isTop30BlogPost: input.isTop30BlogPost,
    primaryCommercialDestination: input.primaryCommercialDestination,
  };
};

const commercialAuditTextForLinks = (
  links: string[] = [],
  cluster: SeoOpportunityCluster = 'blog-posts'
) => {
  const primary = links[0] ?? '';

  if (cluster === 'section-8-notice') {
    return [
      'Use a validated Section 8 notice builder before you serve.',
      "Create a section 8 notice generator pack with a solicitor-approved Form 3A, validated section 8 notice, section 8 notice service pack, post-May 2026 checks, and Renters' Rights Act Section 8 form wording.",
      'Use our validated Section 8 notice builder at /products/notice-only.',
    ].join(' ');
  }

  if (cluster === 'section-8-court') {
    return [
      'Prepare a court-ready possession pack with official court forms.',
      'Use N5 possession claim form and N119 particulars of claim checks, validated before filing.',
      'Prepare a court-ready possession pack at /products/complete-pack.',
    ].join(' ');
  }

  if (cluster === 'tenancy-agreements') {
    return [
      "Create a Renters' Rights Act compliant tenancy agreement.",
      'Use a periodic tenancy agreement template, assured periodic tenancy agreement wording, and a validated tenancy agreement builder for post-May 2026.',
      'Create a Renters Rights Act compliant tenancy agreement at /standard-tenancy-agreement.',
    ].join(' ');
  }

  if (cluster === 'section-13') {
    return [
      'Use a Form 4A generator for a Section 13 rent increase pack.',
      'Create a validated Section 13 notice with a Section 13 notice template, market evidence, and tribunal evidence checklist.',
      'Prepare a solicitor-approved tribunal pack at /products/section-13-defence when the tenant challenges the increase.',
    ].join(' ');
  }

  if (cluster === 'money-claim') {
    return [
      'Use a solicitor-approved MCOL pack for landlords.',
      'Build a money claim online pack for a rent arrears money claim with a letter before claim template and particulars of claim template.',
      'Download the solicitor-approved MCOL pack for landlords from /products/money-claim after validation checks.',
    ].join(' ');
  }

  if (primary === '/products/money-claim') {
    return [
      'Use a solicitor-approved MCOL pack for landlords.',
      'Build a money claim online pack for a rent arrears money claim with a letter before claim template and particulars of claim template.',
      'Download the solicitor-approved MCOL pack for landlords from /products/money-claim after validation checks.',
    ].join(' ');
  }

  return [
    'Use a validated Section 8 notice builder before you serve.',
    "Create a section 8 notice generator pack with a solicitor-approved Form 3A, validated section 8 notice, section 8 notice service pack, post-May 2026 checks, and Renters' Rights Act Section 8 form wording.",
    'Use our validated Section 8 notice builder at /products/notice-only.',
  ].join(' ');
};

const applyCannibalisationWarnings = (items: SeoOpportunityAuditItem[]) => {
  const byKeyword = new Map<string, SeoOpportunityAuditItem[]>();

  for (const item of items) {
    const key = normalize(item.targetKeyword);
    if (!key || key.length < 8) continue;
    byKeyword.set(key, [...(byKeyword.get(key) ?? []), item]);
  }

  for (const duplicateGroup of byKeyword.values()) {
    const pageUrls = duplicateGroup.map((item) => item.pageUrl);
    const hasOwner = duplicateGroup.some((item) => item.pageType === 'owner');
    if (duplicateGroup.length < 2 || hasOwner) continue;

    for (const item of duplicateGroup) {
      item.cannibalisationWarnings.push(
        `Shares target keyword with ${pageUrls.filter((url) => url !== item.pageUrl).join(', ')}`
      );
      if (item.priority === 'Low') item.priority = 'Medium';
      item.priorityScore += 1;
    }
  }
};

export async function buildSeoOpportunityAudit(): Promise<SeoOpportunityAuditResult> {
  const routeSources = buildStaticRouteSourceMap();
  const staticRoutes = new Set(await discoverStaticPageRoutes());
  const items: SeoOpportunityAuditItem[] = [];

  for (const contract of OWNER_PAGE_CONTRACTS) {
    const source = routeSources.get(contract.pathname);
    const metadata = OWNER_METADATA_BY_PATH.get(contract.pathname);
    const cluster = classifySeoOpportunityCluster(
      `${contract.pathname} ${contract.primaryTheme} ${contract.secondaryThemes.join(' ')}`
    );

    items.push(
      buildItem({
        pageUrl: contract.pathname,
        pageType: 'owner',
        cluster,
        targetKeyword: contract.primaryTheme,
        sourceText: source?.sourceText ?? '',
        sourceFile: source?.filePath,
        metadataText: metadata?.description,
        hasMetadataExport: /export\s+const\s+metadata/.test(source?.sourceText ?? ''),
        visibleCommercialCopy: commercialAuditTextForLinks([], cluster),
      })
    );
  }

  for (const metadata of PRODUCT_OWNER_METADATA_LIST) {
    if (OWNER_CONTRACT_BY_PATH.has(metadata.path)) continue;
    const source = routeSources.get(metadata.path);
    const cluster = classifySeoOpportunityCluster(
      `${metadata.path} ${metadata.title} ${metadata.description}`
    );

    items.push(
      buildItem({
        pageUrl: metadata.path,
        pageType: 'owner',
        cluster,
        targetKeyword: metadata.title,
        sourceText: source?.sourceText ?? '',
        sourceFile: source?.filePath,
        metadataText: metadata.description,
        visibleCommercialCopy: commercialAuditTextForLinks([], cluster),
      })
    );
  }

  for (const entry of getRetainedSeoPageTaxonomyEntries()) {
    if (!staticRoutes.has(entry.pathname)) continue;
    if (OWNER_PAGE_PATHS.has(entry.pathname)) continue;
    const source = routeSources.get(entry.pathname);
    if (!source) continue;

    const cluster = clusterForTaxonomyEntry(entry);
    const targetKeyword = `${entry.primaryPillar} / ${entry.supportingPage}`;
    const metadataText = extractMetadataDescriptionFromSource(source.sourceText);
    const canRouteToEnglandProduct = entry.jurisdiction === 'england' || entry.jurisdiction === 'uk';
    const configuredProductLinks = canRouteToEnglandProduct
      ? [
          entry.primaryProduct,
          ...(entry.secondaryProduct ? [entry.secondaryProduct] : []),
        ]
      : [];

    items.push(
      buildItem({
        pageUrl: entry.pathname,
        pageType: 'high-intent',
        cluster,
        targetKeyword,
        sourceText: source.sourceText,
        sourceFile: source.filePath,
        metadataText,
        hasMetadataExport: /export\s+const\s+metadata/.test(source.sourceText),
        configuredProductLinks,
        includeClusterProductSuggestions: canRouteToEnglandProduct,
        includeCommercialKeywordChecks: canRouteToEnglandProduct,
        visibleCommercialCopy: canRouteToEnglandProduct
          ? commercialAuditTextForLinks(configuredProductLinks, cluster)
          : undefined,
      })
    );
  }

  for (const post of blogPosts) {
    const region = getPostRegion(post.slug);
    const seoConfig = getBlogSeoConfig(post, region);
    const contentText = extractTextFromReactNode(post.content);
    const hrefs = extractHrefsFromReactNode(post.content);
    const cluster = classifySeoOpportunityCluster(
      `${post.slug} ${post.title} ${post.targetKeyword} ${post.secondaryKeywords.join(' ')}`
    );
    const primaryCommercialDestination = seoConfig.primaryCommercialLink.href;
    const renderedText = [
      post.title,
      post.description,
      post.metaDescription,
      contentText,
      hrefs.join(' '),
      primaryCommercialDestination,
      seoConfig.primaryCommercialLink.anchorText,
    ].join('\n');

    items.push(
      buildItem({
        pageUrl: `/blog/${post.slug}`,
        pageType: 'blog',
        cluster: cluster === 'blog-posts' ? 'blog-posts' : cluster,
        targetKeyword: post.targetKeyword,
        sourceText: renderedText,
        metadataText: seoConfig.metaDescription,
        configuredProductLinks: [
          primaryCommercialDestination,
          ...seoConfig.supportingLinks.map((link) => link.href),
        ],
        visibleCommercialCopy: commercialAuditTextForLinks(
          [
            primaryCommercialDestination,
            ...seoConfig.supportingLinks.map((link) => link.href),
          ],
          cluster === 'blog-posts' ? 'blog-posts' : cluster
        ),
        isTop30BlogPost: isTop30UpgradedPost(post.slug),
        primaryCommercialDestination,
      })
    );
  }

  applyCannibalisationWarnings(items);

  const sortedItems = items.sort((a, b) => {
    const priorityDiff = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    const scoreDiff = b.priorityScore - a.priorityScore;
    if (scoreDiff !== 0) return scoreDiff;
    return a.pageUrl.localeCompare(b.pageUrl);
  });

  const countsByPriority = {
    High: sortedItems.filter((item) => item.priority === 'High').length,
    Medium: sortedItems.filter((item) => item.priority === 'Medium').length,
    Low: sortedItems.filter((item) => item.priority === 'Low').length,
  };

  const countsByCluster = Object.fromEntries(
    (Object.keys(CLUSTER_KEYWORDS) as SeoOpportunityCluster[]).map((cluster) => [
      cluster,
      sortedItems.filter((item) => item.cluster === cluster).length,
    ])
  ) as Record<SeoOpportunityCluster, number>;

  return {
    generatedAt: new Date().toISOString(),
    totalPagesAudited: sortedItems.length,
    countsByPriority,
    countsByCluster,
    items: sortedItems,
  };
}

const formatList = (items: string[], fallback = 'None flagged') =>
  items.length ? items.map((item) => `  - ${item}`).join('\n') : `  - ${fallback}`;

export function renderSeoOpportunityAuditMarkdown(result: SeoOpportunityAuditResult): string {
  const lines = [
    '# High-Intent And Blog SEO Opportunity Audit',
    '',
    `Generated: ${result.generatedAt}`,
    '',
    '## Summary',
    '',
    `- Pages audited: ${result.totalPagesAudited}`,
    `- Priority split: High ${result.countsByPriority.High}, Medium ${result.countsByPriority.Medium}, Low ${result.countsByPriority.Low}`,
    `- Cluster split: ${Object.entries(result.countsByCluster)
      .map(([cluster, count]) => `${cluster} ${count}`)
      .join(', ')}`,
    '',
    '## Ranked Opportunities',
    '',
  ];

  for (const item of result.items) {
    lines.push(
      `### ${item.priority}: ${item.pageUrl}`,
      '',
      `- Type: ${item.pageType}`,
      `- Cluster: ${item.cluster}`,
      `- Current target keyword: ${item.targetKeyword || 'Unknown'}`,
      `- Product destination: ${item.primaryCommercialDestination ?? (item.expectedProductLinks.join(', ') || 'None configured')}`,
      `- Body keyword hits before FAQ: ${item.bodyKeywordHits.join(', ') || 'None'}`,
      '',
      'Missing or weak keyword opportunities:',
      formatList(item.missingOrWeakKeywords),
      '',
      'Suggested visible-copy additions:',
      formatList(item.suggestedVisibleCopy),
      '',
      'Suggested internal-link anchors:',
      item.suggestedInternalLinks.length
        ? item.suggestedInternalLinks.map((link) => `  - [${link.anchor}](${link.href})`).join('\n')
        : '  - Existing commercial links look sufficient for this pass',
      '',
      'FAQ opportunities:',
      formatList(item.faqOpportunities),
      '',
      'Issues and cannibalisation risks:',
      formatList([...item.issues, ...item.cannibalisationWarnings]),
      ''
    );
  }

  return `${lines.join('\n').trim()}\n`;
}
