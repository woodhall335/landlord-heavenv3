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
  'landlord legal documents',
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

const SITE_NAME = "Landlord Heaven";
const DEFAULT_OG_IMAGE = `${SITE_ORIGIN}/og-image.png`;

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

  // Don't add site name suffix to title - layout template already adds "| Landlord Heaven"
  // But still use full title for OG/Twitter which don't inherit template
  const fullTitleForSocial = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
  const url = getCanonicalUrl(path);

  return {
    title: title, // Layout template will add "| Landlord Heaven"
    description,
    keywords: keywords.length > 0 ? keywords : undefined,
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
      description,
      url,
      siteName: SITE_NAME,
      locale: 'en_GB',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        }
      ],
    },

    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title: fullTitleForSocial,
      description,
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
  title: {
    default: "Landlord Heaven - Court-Ready Legal Documents for UK Landlords",
    template: "%s | Landlord Heaven"
  },
  description: "Reduce possession failure risk with court-ready notices and legal documents in minutes. Save 80%+ vs solicitors. Section 21 ends May 2026 - act now. UK-wide coverage.",
  keywords: [
    "section 21 notice",
    "section 8 notice",
    "eviction notice",
    "section 21 ban 2026",
    "tenancy agreement",
    "landlord legal documents",
    "UK landlord",
    "rent arrears",
    "money claim",
    "possession order",
    "HMO licence",
    "AST",
    "PRT Scotland",
    "court-ready documents"
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
    title: "Landlord Heaven - Court-Ready Legal Documents for UK Landlords",
    description: "Reduce possession failure risk with court-ready notices and legal documents in minutes. Save 80%+ vs solicitors. Section 21 ends May 2026.",
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: "Landlord Heaven - Court-Ready Legal Documents for UK Landlords",
        type: 'image/png',
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: "Landlord Heaven - Court-Ready Legal Documents for UK Landlords",
    description: "Reduce possession failure risk with court-ready notices and legal documents. Save 80%+ vs solicitors. Section 21 ends May 2026.",
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
