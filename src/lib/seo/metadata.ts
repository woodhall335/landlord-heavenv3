import type { Metadata } from "next";
import { SITE_ORIGIN, getCanonicalUrl } from "./urls";

/**
 * SEO Metadata Helper
 *
 * Generates comprehensive SEO metadata including:
 * - Open Graph tags
 * - Twitter Cards
 * - Canonical URLs
 *
 * GUARANTEES:
 * - Canonical URL is ALWAYS present on public pages
 * - Twitter Card metadata is ALWAYS present on content pages
 * - Keywords are ALWAYS present (defaults to core keywords if not provided)
 *
 * For JSON-LD structured data, use the jsonLd helper functions.
 */

export interface SEOMetadataConfig {
  title: string;
  description: string;
  path: string;
  image?: string;
  // Limited to OpenGraph types supported by Next.js metadata typing
  type?: 'website' | 'article';
  noindex?: boolean;
  keywords?: string[];
}

export const SEO_TITLE_RECOMMENDED_MIN = 35;
export const SEO_TITLE_RECOMMENDED_MAX = 60;
export const SEO_DESCRIPTION_RECOMMENDED_MIN = 120;
export const SEO_DESCRIPTION_RECOMMENDED_MAX = 160;
export const SEO_KEYWORDS_RECOMMENDED_MAX = 8;

const MOJIBAKE_PATTERN = /(?:Ã|Â|â|ðŸ|ï¸)/;

/**
 * Core keywords that apply to most pages.
 * Used as fallback when page-specific keywords aren't provided.
 */
export const CORE_KEYWORDS = [
  'UK landlord',
  'eviction notice',
  'section 21',
  'section 8',
  'tenancy agreement',
  'court-ready documents',
  'landlord eviction case bundles',
];

/**
 * Product-specific keywords for targeted pages
 */
export const PRODUCT_KEYWORDS = {
  eviction: [
    'eviction notice UK',
    'section 21 notice',
    'section 8 notice',
    'evict tenant',
    'notice to leave',
    'possession order',
    'court-ready notice',
  ],
  money_claim: [
    'money claim online',
    'MCOL',
    'rent arrears claim',
    'tenant debt recovery',
    'CCJ tenant',
    'small claims court',
    'unpaid rent claim',
  ],
  tenancy: [
    'tenancy agreement template',
    'AST template',
    'assured shorthold tenancy',
    'PRT Scotland',
    'occupation contract Wales',
    'landlord tenancy agreement',
    'rental agreement UK',
  ],
  tool: [
    'free landlord tool',
    'section 21 generator',
    'eviction notice generator',
    'rent calculator',
    'landlord calculator',
  ],
};

export const SITE_NAME = "Landlord Heaven";
const SITE_NAME_COMPACT = SITE_NAME.replace(/\s+/g, "");
const DEFAULT_OG_IMAGE = `${SITE_ORIGIN}/og-image.png`;

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function sanitizePageTitle(title: string): string {
  let normalized = normalizeWhitespace(title).replace(
    new RegExp(escapeRegExp(SITE_NAME_COMPACT), "gi"),
    SITE_NAME,
  );
  const siteNamePattern = `${escapeRegExp(SITE_NAME)}|${escapeRegExp(SITE_NAME_COMPACT)}`;

  normalized = normalized.replace(new RegExp(`^(?:${siteNamePattern})\\s*[|:-]\\s*`, "i"), "");
  normalized = normalized.replace(new RegExp(`\\s*[|:-]\\s*(?:${siteNamePattern})$`, "i"), "");

  return normalizeWhitespace(normalized);
}

export function buildBrandedTitle(title: string): string {
  const normalized = normalizeWhitespace(title).replace(
    new RegExp(escapeRegExp(SITE_NAME_COMPACT), "gi"),
    SITE_NAME,
  );
  return normalized.toLowerCase().includes(SITE_NAME.toLowerCase())
    ? normalized
    : `${normalized} | ${SITE_NAME}`;
}

export function normalizeKeywordList(keywords: string[] = []): string[] {
  const seen = new Set<string>();
  const normalized: string[] = [];

  for (const keyword of keywords) {
    const cleanKeyword = normalizeWhitespace(keyword);
    if (!cleanKeyword) {
      continue;
    }

    const dedupeKey = cleanKeyword.toLowerCase();
    if (seen.has(dedupeKey)) {
      continue;
    }

    seen.add(dedupeKey);
    normalized.push(cleanKeyword);
  }

  return normalized;
}

export interface SEOTextIssue {
  code: string;
  level: "error" | "warning";
  message: string;
}

export interface SEOTextAuditInput {
  title?: string;
  description?: string;
  keywords?: string[];
}

export function auditMetadataText(input: SEOTextAuditInput): SEOTextIssue[] {
  const issues: SEOTextIssue[] = [];
  const title = input.title
    ? normalizeWhitespace(input.title).replace(new RegExp(escapeRegExp(SITE_NAME_COMPACT), "gi"), SITE_NAME)
    : "";
  const description = input.description ? normalizeWhitespace(input.description) : "";
  const keywords = normalizeKeywordList(input.keywords ?? []);

  if (!title) {
    issues.push({ code: "missing_title", level: "error", message: "Page title is missing." });
  } else {
    if (MOJIBAKE_PATTERN.test(title)) {
      issues.push({ code: "title_mojibake", level: "error", message: "Page title contains corrupted encoding." });
    }

    const siteNameMatches = title.match(new RegExp(escapeRegExp(SITE_NAME), "gi")) ?? [];
    if (siteNameMatches.length > 1) {
      issues.push({
        code: "duplicate_site_name",
        level: "error",
        message: "Page title repeats the site name more than once.",
      });
    }

    if (title.length < SEO_TITLE_RECOMMENDED_MIN) {
      issues.push({
        code: "title_too_short",
        level: "warning",
        message: `Page title is short at ${title.length} characters. Target ${SEO_TITLE_RECOMMENDED_MIN}-${SEO_TITLE_RECOMMENDED_MAX}.`,
      });
    } else if (title.length > SEO_TITLE_RECOMMENDED_MAX) {
      issues.push({
        code: "title_too_long",
        level: "warning",
        message: `Page title is long at ${title.length} characters. Target ${SEO_TITLE_RECOMMENDED_MIN}-${SEO_TITLE_RECOMMENDED_MAX}.`,
      });
    }
  }

  if (!description) {
    issues.push({ code: "missing_description", level: "error", message: "Meta description is missing." });
  } else {
    if (MOJIBAKE_PATTERN.test(description)) {
      issues.push({
        code: "description_mojibake",
        level: "error",
        message: "Meta description contains corrupted encoding.",
      });
    }

    if (description.length < SEO_DESCRIPTION_RECOMMENDED_MIN) {
      issues.push({
        code: "description_too_short",
        level: "warning",
        message: `Meta description is short at ${description.length} characters. Target ${SEO_DESCRIPTION_RECOMMENDED_MIN}-${SEO_DESCRIPTION_RECOMMENDED_MAX}.`,
      });
    } else if (description.length > SEO_DESCRIPTION_RECOMMENDED_MAX) {
      issues.push({
        code: "description_too_long",
        level: "warning",
        message: `Meta description is long at ${description.length} characters. Target ${SEO_DESCRIPTION_RECOMMENDED_MIN}-${SEO_DESCRIPTION_RECOMMENDED_MAX}.`,
      });
    }
  }

  if (keywords.length === 0) {
    issues.push({
      code: "missing_keywords",
      level: "warning",
      message: "No page-specific keywords were provided.",
    });
  } else {
    if (keywords.length > SEO_KEYWORDS_RECOMMENDED_MAX) {
      issues.push({
        code: "too_many_keywords",
        level: "warning",
        message: `Keyword list has ${keywords.length} entries. Target ${SEO_KEYWORDS_RECOMMENDED_MAX} or fewer focused phrases.`,
      });
    }

    if (keywords.some((keyword) => MOJIBAKE_PATTERN.test(keyword))) {
      issues.push({
        code: "keywords_mojibake",
        level: "error",
        message: "Keyword list contains corrupted encoding.",
      });
    }

    const targetingHaystack = `${title} ${description}`.toLowerCase();
    const matchedKeywords = keywords.filter((keyword) => targetingHaystack.includes(keyword.toLowerCase()));

    if (matchedKeywords.length === 0) {
      issues.push({
        code: "keyword_targeting_miss",
        level: "warning",
        message: "No keyword phrase appears in the page title or meta description.",
      });
    }
  }

  return issues;
}

/**
 * Generate comprehensive SEO metadata for a page
 */
export function generateMetadata(config: SEOMetadataConfig): Metadata {
  const {
    title,
    description,
    path,
    image = DEFAULT_OG_IMAGE,
    type = 'website',
    noindex = false,
    keywords = []
  } = config;

  const normalizedTitle = sanitizePageTitle(title);
  const normalizedDescription = normalizeWhitespace(description);
  const normalizedKeywords = normalizeKeywordList(keywords).slice(0, SEO_KEYWORDS_RECOMMENDED_MAX);
  const fullTitleForSocial = buildBrandedTitle(normalizedTitle);
  const url = getCanonicalUrl(path);

  return {
    title: normalizedTitle,
    description: normalizedDescription,
    keywords: normalizedKeywords.length > 0 ? normalizedKeywords : undefined,
    authors: [{ name: SITE_NAME }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    robots: noindex
      ? { index: false, follow: false }
      : { index: true, follow: true },

    // Open Graph
    openGraph: {
      type,
      title: fullTitleForSocial,
      description: normalizedDescription,
      url,
      siteName: SITE_NAME,
      locale: 'en_GB',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: normalizedTitle,
        }
      ],
    },

    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title: fullTitleForSocial,
      description: normalizedDescription,
      images: [image],
      creator: '@LandlordHeaven',
      site: '@LandlordHeaven',
    },

    // Canonical URL
    alternates: {
      canonical: url,
    },
    // Note: metadataBase is set globally in RootLayout
  };
}

/**
 * Page types for keyword selection
 */
export type SEOPageType = 'product' | 'tool' | 'blog' | 'guide' | 'seo_landing' | 'general';

/**
 * Generate metadata for a specific page type with guaranteed keywords
 */
export function generateMetadataForPageType(
  config: SEOMetadataConfig & { pageType?: SEOPageType }
): Metadata {
  // Determine keywords based on page type and content
  let keywords = config.keywords;

  if (!keywords || keywords.length === 0) {
    const { path, pageType } = config;

    // Auto-detect page type from path if not provided
    const detectedType = pageType || detectPageType(path);

    // Select keywords based on page type
    switch (detectedType) {
      case 'product':
        if (path.includes('money-claim')) {
          keywords = PRODUCT_KEYWORDS.money_claim;
        } else if (path.includes('ast') || path.includes('tenancy')) {
          keywords = PRODUCT_KEYWORDS.tenancy;
        } else {
          keywords = PRODUCT_KEYWORDS.eviction;
        }
        break;
      case 'tool':
        keywords = [...PRODUCT_KEYWORDS.tool, ...CORE_KEYWORDS.slice(0, 3)];
        break;
      case 'blog':
      case 'guide':
        // Determine topic from path
        if (path.includes('money-claim') || path.includes('rent-arrears')) {
          keywords = PRODUCT_KEYWORDS.money_claim;
        } else if (path.includes('tenancy') || path.includes('ast')) {
          keywords = PRODUCT_KEYWORDS.tenancy;
        } else {
          keywords = PRODUCT_KEYWORDS.eviction;
        }
        break;
      default:
        keywords = CORE_KEYWORDS;
    }
  }

  return generateMetadata({ ...config, keywords });
}

/**
 * Detect page type from path
 */
function detectPageType(path: string): SEOPageType {
  if (path.startsWith('/products/')) return 'product';
  if (path.startsWith('/tools/')) return 'tool';
  if (path.startsWith('/blog/')) return 'blog';
  if (path.includes('-guide') || path.includes('how-to-')) return 'guide';
  // SEO landing pages are top-level paths with keywords
  if (!path.includes('/') || path.split('/').length <= 2) return 'seo_landing';
  return 'general';
}

/**
 * Validate metadata config has all required fields.
 * Returns list of missing/empty fields.
 */
export function validateMetadataConfig(config: SEOMetadataConfig): string[] {
  const issues: string[] = [];

  if (!config.title || config.title.trim() === '') {
    issues.push('title is missing');
  }
  if (!config.description || config.description.trim() === '') {
    issues.push('description is missing');
  }
  if (!config.path || config.path.trim() === '') {
    issues.push('path is missing (required for canonical URL)');
  }
  // Keywords are now auto-populated, but warn if empty and not noindex
  if (!config.noindex && (!config.keywords || config.keywords.length === 0)) {
    issues.push('keywords not provided (will use defaults)');
  }

  for (const issue of auditMetadataText(config)) {
    if (issue.level === "error") {
      issues.push(issue.message);
    }
  }

  return issues;
}

/**
 * Check if a page has all required SEO elements.
 * Used by audit scripts.
 */
export interface SEOAuditResult {
  path: string;
  hasCanonical: boolean;
  hasTwitterCard: boolean;
  hasKeywords: boolean;
  hasOgImage: boolean;
  issues: string[];
}

export function auditMetadata(config: SEOMetadataConfig): SEOAuditResult {
  const metadata = generateMetadata(config);

  // Type-safe check for twitter card - it could be various shapes
  const hasTwitterCard = !!(
    metadata.twitter &&
    (typeof metadata.twitter === 'object') &&
    ('card' in metadata.twitter)
  );

  return {
    path: config.path,
    hasCanonical: !!(metadata.alternates?.canonical),
    hasTwitterCard,
    hasKeywords: !!(metadata.keywords && (Array.isArray(metadata.keywords) ? metadata.keywords.length > 0 : true)),
    hasOgImage: !!(metadata.openGraph?.images && (metadata.openGraph.images as any[]).length > 0),
    issues: validateMetadataConfig(config).filter(i => !i.includes('will use defaults')),
  };
}

/**
 * Default metadata for the site
 */
export const defaultMetadata: Metadata = {
  title: "Court-Ready UK Landlord Documents | Landlord Heaven",
  description:
    "Create court-ready Section 21 notices, Section 8 notices, money claim packs, and tenancy agreements for UK landlords in minutes.",
  keywords: [
    "section 21 notice",
    "section 8 notice",
    "eviction notice",
    "rent arrears",
    "money claim",
    "tenancy agreement",
    "possession order",
    "UK landlord documents",
  ],
  authors: [{ name: "Landlord Heaven" }],
  creator: "Landlord Heaven",
  publisher: "Landlord Heaven",
  metadataBase: new URL(SITE_ORIGIN),
  icons: {
    // Order matters for Google: larger icons first (Google requires minimum 48x48)
    icon: [
      { url: '/favicon.png', sizes: '512x512', type: 'image/png' },
      { url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
      { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon.ico' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: SITE_ORIGIN,
    siteName: SITE_NAME,
    title: "Court-Ready UK Landlord Documents | Landlord Heaven",
    description:
      "Create court-ready Section 21 notices, Section 8 notices, money claim packs, and tenancy agreements for UK landlords in minutes.",
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: "Court-Ready UK Landlord Documents | Landlord Heaven",
        type: 'image/png',
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: "Court-Ready UK Landlord Documents | Landlord Heaven",
    description:
      "Create court-ready Section 21 notices, Section 8 notices, money claim packs, and tenancy agreements for UK landlords in minutes.",
    images: ['/og-image.png'],
    creator: '@LandlordHeaven',
    site: '@LandlordHeaven',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};
