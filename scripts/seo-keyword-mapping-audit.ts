#!/usr/bin/env npx tsx
/**
 * SEO Keyword Mapping Audit Script
 *
 * Comprehensive audit of all pages for SEO keyword mapping:
 * - Discovers all Next.js pages in src/app
 * - Extracts SEO metadata (title, description, keywords, H1)
 * - Extracts blog post metadata
 * - Categorizes pages by type
 * - Calculates SEO scores
 * - Outputs CSV and JSON reports
 *
 * Run: npx tsx scripts/seo-keyword-mapping-audit.ts
 * Or: npm run audit:seo-keywords
 *
 * Outputs:
 * - reports/seo-keyword-mapping.csv (spreadsheet-ready)
 * - reports/seo-keyword-mapping.json (full data)
 * - reports/seo-page-inventory.json (page discovery)
 */

import fs from 'fs';
import path from 'path';
import { CURRENT_ENGLAND_FRAMEWORK_PAGES } from '../src/lib/seo/england-current-framework-pages';
import { INTENT_PAGES } from '../src/lib/seo/eviction-intent-pages';
import { PASS2_LONGFORM_PAGES } from '../src/lib/seo/pass2-longform-content';
import { PHASE5_PAGES } from '../src/lib/seo/phase5-pages';
import { PRODUCT_OWNER_METADATA_LIST } from '../src/lib/seo/product-owner-metadata';
import { getSeoPageTaxonomy } from '../src/lib/seo/page-taxonomy';
import { getRentIncreaseHubPage } from '../src/app/rent-increase/content';

// ANSI colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
};

// =====================================================
// TYPES
// =====================================================

interface PageInfo {
  filePath: string;
  route: string;
  isDynamic: boolean;
  dynamicSegments: string[];
  pageType: 'static' | 'dynamic' | 'catch-all';
}

interface SEOMetadata {
  route: string;
  filePath: string;
  pageType: 'static' | 'dynamic' | 'catch-all';
  category: string;
  source: 'app' | 'blog';

  // Extracted SEO data
  title: string | null;
  description: string | null;
  h1: string | null;
  keywords: string[];
  canonical: string | null;
  ogTitle: string | null;
  ogDescription: string | null;

  // Technical SEO
  hasStructuredData: boolean;
  structuredDataTypes: string[];
  hasRobotsMeta: boolean;
  robotsContent: string | null;

  // Content metrics (for blog posts)
  wordCount: number | null;
  readTime: string | null;
  internalLinksCount: number;

  // Blog-specific
  targetKeyword: string | null;
  secondaryKeywords: string[];
  publishDate: string | null;
  updatedDate: string | null;
  author: string | null;

  // Scoring
  seoScore: string;
  issues: string[];
}

interface PageAuditRow {
  route: string;
  pageType: string;
  category: string;
  source: string;
  currentTitle: string;
  currentDescription: string;
  currentH1: string;
  currentKeywords: string;
  hasSchema: string;
  schemaTypes: string;
  wordCount: string;
  targetKeyword: string;
  secondaryKeywords: string;
  suggestedPrimaryKeyword: string;
  suggestedSecondaryKeywords: string;
  seoScore: string;
  issues: string;
}

const ROUTE_GROUP_PATTERN = /^\(.*\)$/;
const PARALLEL_ROUTE_PATTERN = /^@/;
const EXCLUDED_PUBLIC_AUDIT_PREFIXES = [
  '/api',
  '/auth',
  '/dashboard',
  '/wizard',
  '/success',
  '/checkout',
];

function isExcludedFromPublicAudit(route: string): boolean {
  return EXCLUDED_PUBLIC_AUDIT_PREFIXES.some(
    (prefix) => route === prefix || route.startsWith(`${prefix}/`)
  );
}

function extractFirstStringField(content: string, fieldName: string): string | null {
  const stringLiteralPattern = `(['"\`])((?:\\\\.|(?!\\1)[\\s\\S])*?)\\1`;
  const patterns = [
    new RegExp(`${fieldName}:\\s*${stringLiteralPattern}`),
    new RegExp(`${fieldName}:\\s*\\{\\s*absolute:\\s*${stringLiteralPattern}`),
  ];

  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match) {
      const value = match[2] ?? match[3];
      return value
        .replace(/\\(['"`])/g, '$1')
        .replace(/\\n/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }
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

function findNearestLayoutContent(pageFilePath: string): string | null {
  const appDir = path.join(process.cwd(), 'src', 'app');
  let currentDir = path.dirname(pageFilePath);

  while (currentDir.startsWith(appDir)) {
    const candidates = [
      path.join(currentDir, 'layout.tsx'),
      path.join(currentDir, 'layout.ts'),
    ];

    for (const candidate of candidates) {
      if (fs.existsSync(candidate)) {
        return fs.readFileSync(candidate, 'utf-8');
      }
    }

    if (currentDir === appDir) {
      break;
    }

    currentDir = path.dirname(currentDir);
  }

  return null;
}

// =====================================================
// PAGE DISCOVERY
// =====================================================

function findAllPages(dir: string, basePath: string = ''): PageInfo[] {
  const pages: PageInfo[] = [];

  if (!fs.existsSync(dir)) {
    return pages;
  }

  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // Skip special Next.js folders
      if (['api', '_components', 'components', 'lib', 'utils'].includes(item) || PARALLEL_ROUTE_PATTERN.test(item)) {
        continue;
      }

      // Handle dynamic routes
      let newBasePath: string;
      if (ROUTE_GROUP_PATTERN.test(item)) {
        newBasePath = basePath;
      } else if (item.startsWith('[') && item.endsWith(']')) {
        const paramName = item.slice(1, -1);
        newBasePath = `${basePath}/${item}`;
      } else {
        newBasePath = `${basePath}/${item}`;
      }

      pages.push(...findAllPages(fullPath, newBasePath));
    } else if (item === 'page.tsx' || item === 'page.ts') {
      const route = basePath || '/';
      if (isExcludedFromPublicAudit(route) || route.includes('[')) {
        continue;
      }
      const dynamicMatches = route.match(/\[\w+\]/g) || [];
      const dynamicSegments = dynamicMatches.map(s => s.slice(1, -1));

      pages.push({
        filePath: fullPath,
        route: route,
        isDynamic: dynamicSegments.length > 0,
        dynamicSegments,
        pageType: route.includes('[...') ? 'catch-all' :
                  dynamicSegments.length > 0 ? 'dynamic' : 'static'
      });
    }
  }

  return pages;
}

// =====================================================
// METADATA EXTRACTION
// =====================================================

function extractMetadataFromFile(filePath: string, route: string): Partial<SEOMetadata> {
  const metadata: Partial<SEOMetadata> = {
    keywords: [],
    structuredDataTypes: [],
    secondaryKeywords: [],
    issues: [],
    internalLinksCount: 0,
  };

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const pageHasMetadataExport = /export\s+(const metadata|async function generateMetadata|function generateMetadata)/.test(content);
    const layoutContent = pageHasMetadataExport ? null : findNearestLayoutContent(filePath);
    const metadataContent = pageHasMetadataExport || !layoutContent ? content : layoutContent;
    const metadataWindow = extractMetadataWindow(metadataContent);
    const combinedContent = `${metadataContent}\n${content}`;
    const sharedMetadata = getSharedMetadata(route);
    const taxonomyEntry = getSeoPageTaxonomy(route);

    // Extract title from metadata object
    metadata.title = extractFirstStringField(metadataWindow, 'title');
    if (!metadata.title && sharedMetadata?.title) {
      metadata.title = sharedMetadata.title;
    }

    // Extract description
    metadata.description = extractFirstStringField(metadataWindow, 'description');
    if (!metadata.description && sharedMetadata?.description) {
      metadata.description = sharedMetadata.description;
    }

    // Extract keywords array
    const keywordsMatch = metadataWindow.match(/keywords:\s*\[([\s\S]*?)\]/);
    if (keywordsMatch) {
      const keywordsStr = keywordsMatch[1];
      metadata.keywords = keywordsStr
        .split(',')
        .map(k => k.trim().replace(/['"`]/g, ''))
        .filter(Boolean);
    }
    if ((!metadata.keywords || metadata.keywords.length === 0) && sharedMetadata?.keywords.length) {
      metadata.keywords = sharedMetadata.keywords;
    }
    if ((!metadata.keywords || metadata.keywords.length === 0) && taxonomyEntry) {
      metadata.keywords = [
        ...taxonomyEntry.anchorVariants.pillar.slice(0, 2),
        ...taxonomyEntry.anchorVariants.supporting.slice(0, 2),
        ...taxonomyEntry.anchorVariants.product.slice(0, 2),
      ].filter(Boolean);
    }

    // Extract H1 from JSX - multiple patterns
    const h1Patterns = [
      /<h1[^>]*>([^<]+)<\/h1>/,
      /<h1[^>]*>\s*\{?['"`]?([^<'"`{}]+)['"`]?\}?\s*<\/h1>/,
      /className="[^"]*text-[34]xl[^"]*"[^>]*>([^<]+)</,
      /\btitle=["']([^"']+)["']/,
      /\bheroTitle:\s*['"`]([^'"`]+)['"`]/,
    ];

    for (const pattern of h1Patterns) {
      const match = content.match(pattern);
      if (match && match[1].trim()) {
        metadata.h1 = match[1].trim();
        break;
      }
    }
    if (
      !metadata.h1 &&
      (
        sharedMetadata?.title ||
        content.includes('UniversalHero') ||
        content.includes('EnglandTenancyPage') ||
        content.includes('TenancyFunnelLandingPage') ||
        content.includes('PillarPageShell') ||
        content.includes('HighIntentPageShell') ||
        content.includes('PublicProductSalesPage') ||
        content.includes('RentCheckerSeoPage') ||
        content.includes('RentIncreaseChallengeChecker') ||
        content.includes('RentIncreaseGuidePageView') ||
        content.includes('HomeContent')
      )
    ) {
      metadata.h1 = sharedMetadata?.title ?? metadata.title ?? null;
    }

    // Check for structured data
    metadata.hasStructuredData = combinedContent.includes('application/ld+json') ||
                                  combinedContent.includes('StructuredData') ||
                                  combinedContent.includes('Schema') ||
                                  combinedContent.includes('CurrentFrameworkGuidePage') ||
                                  combinedContent.includes('EvictionIntentLandingPage') ||
                                  combinedContent.includes('PillarPageShell') ||
                                  combinedContent.includes('HighIntentPageShell') ||
                                  combinedContent.includes('TenancyFunnelLandingPage') ||
                                  combinedContent.includes('RentIncreaseGuidePageView') ||
                                  combinedContent.includes('RentCheckerSeoPage');

    if (metadata.hasStructuredData) {
      const schemaTypes: string[] = [];
      const typeMatches = combinedContent.matchAll(/"@type":\s*['"`](\w+)['"`]/g);
      for (const match of typeMatches) {
        if (!schemaTypes.includes(match[1])) {
          schemaTypes.push(match[1]);
        }
      }
      // Also check for schema helper functions
      const schemaHelpers = [
        'productSchema', 'faqPageSchema', 'breadcrumbSchema',
        'articleSchema', 'websiteSchema', 'organizationSchema'
      ];
      for (const helper of schemaHelpers) {
        if (combinedContent.includes(helper)) {
          const type = helper.replace('Schema', '').replace(/([A-Z])/g, ' $1').trim();
          if (!schemaTypes.includes(type)) {
            schemaTypes.push(type.charAt(0).toUpperCase() + type.slice(1));
          }
        }
      }
      metadata.structuredDataTypes = schemaTypes;
    }

    // Check for canonical
    metadata.canonical = null;
    if (metadataWindow.includes('canonical:') || metadataWindow.includes('alternates:')) {
      const canonicalMatch = metadataWindow.match(/canonical:\s*['"`]([^'"`]+)['"`]/) ||
                            metadataWindow.match(/getCanonicalUrl\(['"`]([^'"`]+)['"`]\)/);
      if (canonicalMatch) {
        metadata.canonical = canonicalMatch[1];
      } else if (metadataWindow.includes('getCanonicalUrl') || metadataWindow.includes('canonical:')) {
        metadata.canonical = route; // Uses dynamic canonical
      }
    }
    if (!metadata.canonical && taxonomyEntry?.canonicalTarget) {
      metadata.canonical = taxonomyEntry.canonicalTarget;
    }
    if (!metadata.canonical && (sharedMetadata || metadataWindow.includes('getCanonicalUrl') || metadataWindow.includes('generateMetadata({'))) {
      metadata.canonical = route;
    }

    // Extract OG data
    const ogTitleMatch = metadataWindow.match(/openGraph:\s*\{[\s\S]*?title:\s*['"`]([^'"`]+)['"`]/);
    if (ogTitleMatch) metadata.ogTitle = ogTitleMatch[1];

    const ogDescMatch = metadataWindow.match(/openGraph:\s*\{[\s\S]*?description:\s*['"`]([^'"`]+)['"`]/);
    if (ogDescMatch) metadata.ogDescription = ogDescMatch[1];

    // Check robots meta
    metadata.hasRobotsMeta = metadataWindow.includes('robots:');
    if (metadata.hasRobotsMeta) {
      const robotsMatch = metadataWindow.match(/robots:\s*['"`]([^'"`]+)['"`]/);
      metadata.robotsContent = robotsMatch
        ? robotsMatch[1]
        : metadataWindow.includes('index: false')
          ? 'noindex'
          : null;
    }

    // Count internal links
    const internalLinkMatches = [
      ...(content.match(/href=["']\/[^"']+["']/g) || []),
      ...(content.match(/href=\{["']\/[^"']+["']\}/g) || []),
      ...(content.match(/href:\s*["']\/[^"']+["']/g) || []),
      ...(content.match(/primaryCtaHref=["']\/[^"']+["']/g) || []),
      ...(content.match(/secondaryCtaHref=["']\/[^"']+["']/g) || []),
    ];
    metadata.internalLinksCount = internalLinkMatches.length;
    if (taxonomyEntry) {
      metadata.internalLinksCount += [
        taxonomyEntry.primaryPillar,
        taxonomyEntry.supportingPage,
        taxonomyEntry.primaryProduct,
        taxonomyEntry.secondaryProduct,
      ].filter(Boolean).length;
    }
    if (content.includes('RelatedLinks') || content.includes('SeoPageContextPanel')) {
      metadata.internalLinksCount += 2;
    }
    if (
      content.includes('HomeContent') ||
      content.includes('PublicProductSalesPage') ||
      content.includes('EnglandTenancyPage') ||
      content.includes('RentCheckerSeoPage') ||
      content.includes('RentIncreaseChallengeChecker') ||
      content.includes('RentIncreaseGuidePageView')
    ) {
      metadata.internalLinksCount += 2;
    }

  } catch (error) {
    metadata.issues = [`Error reading file: ${error}`];
  }

  return metadata;
}

function getSharedMetadata(route: string): { title: string; description: string; keywords: string[] } | null {
  const slug = route === '/' ? '' : route.slice(1);

  if (slug in CURRENT_ENGLAND_FRAMEWORK_PAGES) {
    const page = CURRENT_ENGLAND_FRAMEWORK_PAGES[slug as keyof typeof CURRENT_ENGLAND_FRAMEWORK_PAGES];
    return {
      title: page.title,
      description: page.description,
      keywords: page.keywords,
    };
  }

  if (slug in INTENT_PAGES) {
    const page = INTENT_PAGES[slug];
    return {
      title: page.title,
      description: page.description,
      keywords: [page.keyword],
    };
  }

  if (slug in PHASE5_PAGES) {
    const page = PHASE5_PAGES[slug];
    return {
      title: page.title,
      description: page.description,
      keywords: page.keywords,
    };
  }

  if (slug in PASS2_LONGFORM_PAGES) {
    const page = PASS2_LONGFORM_PAGES[slug];
    return {
      title: page.title,
      description: page.description,
      keywords: [],
    };
  }

  const productOwner = PRODUCT_OWNER_METADATA_LIST.find((page) => page.path === route);
  if (productOwner) {
    return {
      title: productOwner.title,
      description: productOwner.description,
      keywords: [],
    };
  }

  if (route === '/products/rent-increase') {
    const page = getRentIncreaseHubPage();
    return {
      title: page.metaTitle,
      description: page.metaDescription,
      keywords: [
        page.primaryKeyword,
        page.intentLabel,
        'section 13',
        'form 4a',
        'rent increase england',
      ],
    };
  }

  if (route === '/blog') {
    return {
      title: 'England Landlord Guides | Section 8, Possession & Tenancy Help',
      description:
        'Read England landlord guides on Section 8 notices, possession claims, tenancy agreements, rent arrears, compliance steps, and the right product route.',
      keywords: [
        'how to evict a tenant in england',
        'section 8 notice england',
        'section 8',
        'rent arrears',
        'tenancy agreement england',
        'possession claim england',
        'landlord compliance',
      ],
    };
  }

  return null;
}

// =====================================================
// BLOG POST EXTRACTION
// =====================================================

interface BlogPostData {
  slug: string;
  title: string;
  description: string;
  metaDescription: string;
  date: string;
  updatedDate?: string;
  readTime: string;
  wordCount: number;
  category: string;
  tags: string[];
  author: { name: string; role: string };
  targetKeyword: string;
  secondaryKeywords: string[];
  heroImage: string;
  heroImageAlt: string;
  showUrgencyBanner: boolean;
  internalLinksCount: number;
}

function extractBlogPosts(): BlogPostData[] {
  const postsFilePath = path.join(process.cwd(), 'src/lib/blog/posts.tsx');

  if (!fs.existsSync(postsFilePath)) {
    console.log(`${colors.yellow}Warning: Blog posts file not found at ${postsFilePath}${colors.reset}`);
    return [];
  }

  try {
    const content = fs.readFileSync(postsFilePath, 'utf-8');
    const posts: BlogPostData[] = [];

    // Extract individual post objects
    // Match patterns like { slug: 'xxx', title: 'xxx', ... }
    const postBlockRegex = /\{\s*slug:\s*['"`]([^'"`]+)['"`]/g;
    let match;

    while ((match = postBlockRegex.exec(content)) !== null) {
      const slug = match[1];
      const startIndex = match.index;

      // Find the end of this post object (balanced braces)
      let braceCount = 1;
      let endIndex = startIndex + match[0].length;

      while (braceCount > 0 && endIndex < content.length) {
        const char = content[endIndex];
        if (char === '{') braceCount++;
        if (char === '}') braceCount--;
        endIndex++;
      }

      const postBlock = content.slice(startIndex, endIndex);

      // Extract fields from the post block
      const extractField = (field: string): string | null => {
        return extractFirstStringField(postBlock, field);
      };

      const extractNumber = (field: string): number => {
        const regex = new RegExp(`${field}:\\s*(\\d+)`);
        const match = postBlock.match(regex);
        return match ? parseInt(match[1], 10) : 0;
      };

      const extractArray = (field: string): string[] => {
        const regex = new RegExp(`${field}:\\s*\\[([^\\]]+)\\]`);
        const match = postBlock.match(regex);
        if (!match) return [];
        return match[1]
          .split(',')
          .map(s => s.trim().replace(/['"`]/g, ''))
          .filter(Boolean);
      };

      const extractAuthor = (): { name: string; role: string } => {
        const authorMatch = postBlock.match(/author:\s*\{[^}]*name:\s*['"`]([^'"`]+)['"`][^}]*role:\s*['"`]([^'"`]+)['"`]/);
        if (authorMatch) {
          return { name: authorMatch[1], role: authorMatch[2] };
        }
        return { name: 'Unknown', role: 'Unknown' };
      };
      const internalLinksCount =
        (postBlock.match(/href=["']\/[^"']+["']/g) || []).length +
        (postBlock.match(/href=\{["']\/[^"']+["']\}/g) || []).length +
        extractArray('relatedPosts').length;

      posts.push({
        slug,
        title: extractField('title') || '',
        description: extractField('description') || '',
        metaDescription: extractField('metaDescription') || '',
        date: extractField('date') || '',
        updatedDate: extractField('updatedDate') || undefined,
        readTime: extractField('readTime') || '',
        wordCount: extractNumber('wordCount'),
        category: extractField('category') || '',
        tags: extractArray('tags'),
        author: extractAuthor(),
        targetKeyword: extractField('targetKeyword') || '',
        secondaryKeywords: extractArray('secondaryKeywords'),
        heroImage: extractField('heroImage') || '',
        heroImageAlt: extractField('heroImageAlt') || '',
        showUrgencyBanner: postBlock.includes('showUrgencyBanner: true'),
        internalLinksCount,
      });
    }

    return posts;
  } catch (error) {
    console.error(`${colors.red}Error reading blog posts: ${error}${colors.reset}`);
    return [];
  }
}

// =====================================================
// PAGE CATEGORIZATION
// =====================================================

function categorisePage(route: string): string {
  // Homepage
  if (route === '/') return 'Homepage';

  // Blog
  if (route.startsWith('/blog')) return 'Blog';

  // Products
  if (route.startsWith('/products/')) return 'Product Page';

  // Tools
  if (route.includes('/validators/')) return 'Validator Tool';
  if (route.includes('/tools/') && route.includes('calculator')) return 'Calculator Tool';
  if (route.includes('/tools/') && route.includes('generator')) return 'Generator Tool';
  if (route.includes('/tools/') && route.includes('checker')) return 'Checker Tool';
  if (route.startsWith('/tools')) return 'Tool';

  // Ask Heaven
  if (route.includes('/ask-heaven')) return 'Ask Heaven';

  // Wizard
  if (route.startsWith('/wizard')) return 'Wizard';

  // Dashboard/Auth (internal)
  if (route.startsWith('/dashboard')) return 'Dashboard (Internal)';
  if (route.startsWith('/auth')) return 'Auth (Internal)';
  if (route.startsWith('/success')) return 'Success (Internal)';

  // Legal/Policy
  if (['privacy', 'terms', 'cookies', 'refunds'].some(p => route.includes(p))) return 'Legal/Policy';

  // Money Claims
  if (route.includes('money-claim')) return 'Money Claim Guide';

  // Tenancy Agreements - Regional
  if (route.includes('/tenancy-agreements/england')) return 'Tenancy - England';
  if (route.includes('/tenancy-agreements/wales')) return 'Tenancy - Wales';
  if (route.includes('/tenancy-agreements/scotland')) return 'Tenancy - Scotland';
  if (route.includes('/tenancy-agreements/northern-ireland')) return 'Tenancy - Northern Ireland';
  if (route.includes('tenancy-agreement')) return 'Tenancy Agreement Template';

  // Eviction Notices - Regional
  if (route.includes('section-21')) return 'Section 21';
  if (route.includes('section-8')) return 'Section 8';
  if (route.includes('wales-eviction') || route.includes('occupation-contract') || route.includes('renting-homes-wales')) return 'Wales Eviction';
  if (route.includes('scotland') || route.includes('scottish') || route.includes('prt-template')) return 'Scotland Eviction';
  if (route.includes('northern-ireland') || route.includes('ni-')) return 'Northern Ireland';

  // Eviction Guides
  if (route.includes('eviction') || route.includes('possession') || route.includes('warrant')) return 'Eviction Guide';
  if (route.includes('tenant-wont-leave') || route.includes('tenant-not-paying')) return 'Eviction Guide';

  // AST Templates
  if (route.includes('ast-template') || route.includes('assured-shorthold')) return 'AST Template';

  // Rent Arrears
  if (route.includes('rent-arrears')) return 'Rent Arrears';

  // Other SEO Landing Pages
  if (route.includes('-template') || route.includes('-guide')) return 'SEO Landing Page';

  // Informational
  if (['about', 'contact', 'help', 'pricing'].some(p => route.includes(p))) return 'Informational';

  return 'Other';
}

// =====================================================
// SEO SCORING
// =====================================================

function calculateSEOScore(metadata: Partial<SEOMetadata>): { score: string; issues: string[] } {
  const issues: string[] = metadata.issues || [];
  let score = 100;
  const isNoIndexRoute = metadata.robotsContent?.toLowerCase().includes('noindex') ?? false;

  // Title checks
  if (!metadata.title) {
    issues.push('Missing title');
    score -= 20;
  } else {
    const titleLen = metadata.title.length;
    if (titleLen < 30) {
      issues.push(`Title too short (${titleLen} chars, recommend 50-60)`);
      score -= 10;
    } else if (titleLen > 70) {
      issues.push(`Title too long (${titleLen} chars, recommend 50-60)`);
      score -= 5;
    }
  }

  // Description checks
  if (!metadata.description) {
    issues.push('Missing meta description');
    score -= 20;
  } else {
    const descLen = metadata.description.length;
    if (descLen < 120) {
      issues.push(`Description too short (${descLen} chars, recommend 150-160)`);
      score -= 10;
    } else if (descLen > 170) {
      issues.push(`Description too long (${descLen} chars, recommend 150-160)`);
      score -= 5;
    }
  }

  // H1 checks
  if (!isNoIndexRoute && !metadata.h1) {
    issues.push('No H1 detected');
    score -= 10;
  }

  // Keywords check
  if (!isNoIndexRoute && (!metadata.keywords || metadata.keywords.length === 0)) {
    issues.push('No keywords defined');
    score -= 5;
  }

  // Structured data
  if (!isNoIndexRoute && !metadata.hasStructuredData) {
    issues.push('No schema markup');
    score -= 10;
  }

  // Canonical
  if (!metadata.canonical) {
    issues.push('No canonical URL');
    score -= 5;
  }

  // Word count (for content pages)
  if (metadata.wordCount !== null && metadata.wordCount !== undefined) {
    if (metadata.wordCount < 300) {
      issues.push(`Thin content (${metadata.wordCount} words)`);
      score -= 15;
    } else if (metadata.wordCount < 800) {
      issues.push(`Short content (${metadata.wordCount} words)`);
      score -= 5;
    }
  }

  // Internal links
  if (!isNoIndexRoute && metadata.internalLinksCount === 0) {
    issues.push('No internal links detected');
    score -= 5;
  }

  // Determine score category
  let scoreLabel: string;
  if (score >= 90) scoreLabel = 'Excellent';
  else if (score >= 80) scoreLabel = 'Good';
  else if (score >= 60) scoreLabel = 'Needs Work';
  else scoreLabel = 'Poor';

  return { score: scoreLabel, issues };
}

// =====================================================
// REPORT GENERATION
// =====================================================

function generateReport(allMetadata: SEOMetadata[]): PageAuditRow[] {
  return allMetadata.map(meta => {
    const { score, issues } = calculateSEOScore(meta);

    return {
      route: meta.route,
      pageType: meta.pageType,
      category: meta.category,
      source: meta.source,
      currentTitle: meta.title || '',
      currentDescription: meta.description || '',
      currentH1: meta.h1 || '',
      currentKeywords: meta.keywords?.join(', ') || '',
      hasSchema: meta.hasStructuredData ? 'Yes' : 'No',
      schemaTypes: meta.structuredDataTypes?.join(', ') || '',
      wordCount: meta.wordCount?.toString() || '',
      targetKeyword: meta.targetKeyword || '',
      secondaryKeywords: meta.secondaryKeywords?.join(', ') || '',
      suggestedPrimaryKeyword: '', // To be filled manually
      suggestedSecondaryKeywords: '', // To be filled manually
      seoScore: score,
      issues: issues.join('; '),
    };
  });
}

function generateCSV(rows: PageAuditRow[]): string {
  const headers = [
    'route',
    'pageType',
    'category',
    'source',
    'currentTitle',
    'currentDescription',
    'currentH1',
    'currentKeywords',
    'hasSchema',
    'schemaTypes',
    'wordCount',
    'targetKeyword',
    'secondaryKeywords',
    'suggestedPrimaryKeyword',
    'suggestedSecondaryKeywords',
    'seoScore',
    'issues',
  ];

  const escapeCSV = (val: string): string => {
    if (typeof val !== 'string') return '';
    if (val.includes(',') || val.includes('"') || val.includes('\n')) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  };

  const csvRows = [
    headers.join(','),
    ...rows.map(row =>
      headers.map(h => escapeCSV((row as any)[h] ?? '')).join(',')
    )
  ];

  return csvRows.join('\n');
}

// =====================================================
// MAIN EXECUTION
// =====================================================

async function main(): Promise<void> {
  console.log(`\n${colors.cyan}${colors.bold}SEO Keyword Mapping Audit${colors.reset}`);
  console.log('═'.repeat(60));

  // Ensure reports directory exists
  const reportsDir = path.join(process.cwd(), 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  // Step 1: Discover all pages
  console.log(`\n${colors.cyan}Step 1: Discovering pages...${colors.reset}`);
  const appDir = path.join(process.cwd(), 'src/app');
  const pages = findAllPages(appDir);
  console.log(`  Found ${colors.bold}${pages.length}${colors.reset} page files`);

  // Save page inventory
  fs.writeFileSync(
    path.join(reportsDir, 'seo-page-inventory.json'),
    JSON.stringify(pages, null, 2)
  );

  // Step 2: Extract metadata from app pages
  console.log(`\n${colors.cyan}Step 2: Extracting metadata from pages...${colors.reset}`);
  const appMetadata: SEOMetadata[] = [];

  for (const page of pages) {
    const metadata = extractMetadataFromFile(page.filePath, page.route);
    const category = categorisePage(page.route);

    appMetadata.push({
      route: page.route,
      filePath: page.filePath,
      pageType: page.pageType,
      category,
      source: 'app',
      title: metadata.title || null,
      description: metadata.description || null,
      h1: metadata.h1 || null,
      keywords: metadata.keywords || [],
      canonical: metadata.canonical || null,
      ogTitle: metadata.ogTitle || null,
      ogDescription: metadata.ogDescription || null,
      hasStructuredData: metadata.hasStructuredData || false,
      structuredDataTypes: metadata.structuredDataTypes || [],
      hasRobotsMeta: metadata.hasRobotsMeta || false,
      robotsContent: metadata.robotsContent || null,
      wordCount: null,
      readTime: null,
      internalLinksCount: metadata.internalLinksCount || 0,
      targetKeyword: null,
      secondaryKeywords: [],
      publishDate: null,
      updatedDate: null,
      author: null,
      seoScore: '',
      issues: metadata.issues || [],
    });
  }

  // Step 3: Extract blog posts
  console.log(`\n${colors.cyan}Step 3: Extracting blog posts...${colors.reset}`);
  const blogPosts = extractBlogPosts();
  console.log(`  Found ${colors.bold}${blogPosts.length}${colors.reset} blog posts`);

  const blogMetadata: SEOMetadata[] = blogPosts.map(post => ({
    route: `/blog/${post.slug}`,
    filePath: 'src/lib/blog/posts.tsx',
    pageType: 'dynamic' as const,
    category: `Blog - ${post.category}`,
    source: 'blog' as const,
    title: post.title,
    description: post.metaDescription || post.description,
    h1: post.title,
    keywords: post.tags,
    canonical: `/blog/${post.slug}`,
    ogTitle: post.title,
    ogDescription: post.description,
    hasStructuredData: true, // Blog posts have Article schema
    structuredDataTypes: ['Article', 'BreadcrumbList'],
    hasRobotsMeta: true,
    robotsContent: 'index,follow',
    wordCount: post.wordCount,
    readTime: post.readTime,
    internalLinksCount: post.internalLinksCount,
    targetKeyword: post.targetKeyword,
    secondaryKeywords: post.secondaryKeywords,
    publishDate: post.date,
    updatedDate: post.updatedDate || null,
    author: post.author.name,
    seoScore: '',
    issues: [],
  }));

  // Step 4: Combine and generate report
  console.log(`\n${colors.cyan}Step 4: Generating report...${colors.reset}`);
  const allMetadata = [...appMetadata, ...blogMetadata];
  const reportRows = generateReport(allMetadata);

  // Sort by category then route
  reportRows.sort((a, b) => {
    if (a.category !== b.category) return a.category.localeCompare(b.category);
    return a.route.localeCompare(b.route);
  });

  // Generate outputs
  const csv = generateCSV(reportRows);
  fs.writeFileSync(path.join(reportsDir, 'seo-keyword-mapping.csv'), csv);

  fs.writeFileSync(
    path.join(reportsDir, 'seo-keyword-mapping.json'),
    JSON.stringify(reportRows, null, 2)
  );

  // Print summary
  console.log(`\n${colors.cyan}${colors.bold}Summary${colors.reset}`);
  console.log('─'.repeat(60));
  console.log(`Total pages audited: ${colors.bold}${reportRows.length}${colors.reset}`);

  // Category breakdown
  const categories = new Map<string, number>();
  for (const row of reportRows) {
    categories.set(row.category, (categories.get(row.category) || 0) + 1);
  }

  console.log(`\n${colors.bold}Pages by Category:${colors.reset}`);
  const sortedCategories = [...categories.entries()].sort((a, b) => b[1] - a[1]);
  for (const [category, count] of sortedCategories) {
    console.log(`  ${category.padEnd(30)} ${count}`);
  }

  // Score breakdown
  const scores = new Map<string, number>();
  for (const row of reportRows) {
    scores.set(row.seoScore, (scores.get(row.seoScore) || 0) + 1);
  }

  console.log(`\n${colors.bold}SEO Scores:${colors.reset}`);
  for (const [score, count] of scores.entries()) {
    const color = score === 'Excellent' ? colors.green :
                  score === 'Good' ? colors.green :
                  score === 'Needs Work' ? colors.yellow : colors.red;
    console.log(`  ${color}${score.padEnd(15)}${colors.reset} ${count}`);
  }

  // Common issues
  const issueCounts = new Map<string, number>();
  for (const row of reportRows) {
    if (row.issues) {
      const issues = row.issues.split('; ').filter(Boolean);
      for (const issue of issues) {
        issueCounts.set(issue, (issueCounts.get(issue) || 0) + 1);
      }
    }
  }

  console.log(`\n${colors.bold}Top Issues:${colors.reset}`);
  const sortedIssues = [...issueCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  for (const [issue, count] of sortedIssues) {
    console.log(`  ${colors.yellow}${count.toString().padStart(3)}${colors.reset} ${issue}`);
  }

  // Output files
  console.log(`\n${colors.bold}Output Files:${colors.reset}`);
  console.log(`  ${colors.green}✓${colors.reset} reports/seo-keyword-mapping.csv`);
  console.log(`  ${colors.green}✓${colors.reset} reports/seo-keyword-mapping.json`);
  console.log(`  ${colors.green}✓${colors.reset} reports/seo-page-inventory.json`);

  console.log(`\n${colors.green}${colors.bold}Audit complete!${colors.reset}`);
  console.log(`Open ${colors.cyan}reports/seo-keyword-mapping.csv${colors.reset} in Excel/Google Sheets to add keywords.\n`);
}

main().catch((error) => {
  console.error(`${colors.red}Audit script error:${colors.reset}`, error);
  process.exit(1);
});
