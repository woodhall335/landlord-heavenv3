import type { Metadata } from "next";

/**
 * SEO Metadata Helper
 *
 * Generates comprehensive SEO metadata including:
 * - Open Graph tags
 * - Twitter Cards
 * - Canonical URLs
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

const SITE_NAME = "Landlord Heaven";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://landlordheaven.co.uk";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

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

  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
  const url = `${SITE_URL}${path}`;

  return {
    title: fullTitle,
    description,
    keywords: keywords.length > 0 ? keywords : undefined,
    authors: [{ name: SITE_NAME }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    robots: noindex ? 'noindex,nofollow' : 'index,follow',

    // Open Graph
    openGraph: {
      type,
      title: fullTitle,
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
      title: fullTitle,
      description,
      images: [image],
      creator: '@LandlordHeaven',
      site: '@LandlordHeaven',
    },

    // Canonical URL
    alternates: {
      canonical: url,
    },

    // Additional metadata
    metadataBase: new URL(SITE_URL),
  };
}

/**
 * Default metadata for the site
 */
export const defaultMetadata: Metadata = {
  title: {
    default: "Landlord Heaven - Legal Documents for UK Landlords",
    template: "%s | Landlord Heaven"
  },
  description: "Court-ready eviction notices, tenancy agreements & legal documents for UK landlords. 100% UK coverage - England & Wales, Scotland, Northern Ireland.",
  keywords: [
    "section 8 notice",
    "section 21 notice",
    "eviction notice",
    "tenancy agreement",
    "landlord legal documents",
    "UK landlord",
    "rent arrears",
    "HMO licence",
    "AST",
    "PRT Scotland",
    "Northern Ireland tenancy"
  ],
  authors: [{ name: "Landlord Heaven" }],
  creator: "Landlord Heaven",
  publisher: "Landlord Heaven",
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "Landlord Heaven - Legal Documents for UK Landlords",
    description: "Court-ready eviction notices, tenancy agreements & legal documents for UK landlords. 100% UK coverage.",
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Landlord Heaven"
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: "Landlord Heaven - Legal Documents for UK Landlords",
    description: "Court-ready eviction notices, tenancy agreements & legal documents for UK landlords.",
    images: [DEFAULT_OG_IMAGE],
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
