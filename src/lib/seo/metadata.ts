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
 * Default metadata for the site
 */
export const defaultMetadata: Metadata = {
  title: {
    default: "Landlord Heaven - Court-Ready Legal Documents for UK Landlords",
    template: "%s | Landlord Heaven"
  },
  description: "Generate court-ready eviction notices and legal documents in minutes. Save 80%+ vs solicitors. Section 21 ends May 2026 - act now. UK-wide coverage.",
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
    description: "Generate court-ready eviction notices and legal documents in minutes. Save 80%+ vs solicitors. Section 21 ends May 2026.",
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
    description: "Generate court-ready eviction notices and legal documents. Save 80%+ vs solicitors. Section 21 ends May 2026.",
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
