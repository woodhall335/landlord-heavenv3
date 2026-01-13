/**
 * JSON-LD Structured Data Helpers
 *
 * Generate schema.org structured data for SEO
 *
 * IMPORTANT: Hardcoded aggregateRating values are risky for Google rich results.
 * Google may penalize sites with fake/unverified ratings. Only enable structured
 * ratings if you have real, verifiable review data from a third-party source.
 *
 * Set ENABLE_STRUCTURED_RATINGS=true in env to include ratings in schema.
 */

import React from 'react';
import { PRODUCTS } from '@/lib/pricing/products';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://landlordheaven.co.uk";

/**
 * Feature flag for structured ratings.
 * Default: false (disabled) - only enable when you have real review data.
 */
const ENABLE_STRUCTURED_RATINGS = process.env.ENABLE_STRUCTURED_RATINGS === 'true';

/**
 * Get a date 1 year from now in ISO format (YYYY-MM-DD)
 * Used for priceValidUntil in product offers
 */
function getDefaultPriceValidUntil(): string {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  return date.toISOString().split('T')[0];
}

export interface Product {
  name: string;
  description: string;
  price: string;
  currency?: string;
  availability?: string;
  url: string;
  image?: string;
  priceValidUntil?: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

/**
 * Organization structured data
 * Use this on the homepage and footer
 */
export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Landlord Heaven",
    "url": SITE_URL,
    "logo": `${SITE_URL}/logo.png`,
    "description": "Professional legal document generation for UK landlords. Court-ready eviction notices, tenancy agreements, and compliance management.",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "GB",
      "addressRegion": "England"
    },
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "telephone": "",
        "email": "support@landlordheaven.co.uk",
        "contactType": "customer support",
        "availableLanguage": ["en"]
      }
    ],
    "sameAs": [
      "https://twitter.com/LandlordHeaven",
      "https://www.linkedin.com/company/landlord-heaven"
    ],
    "areaServed": [
      {
        "@type": "Country",
        "name": "United Kingdom"
      }
    ]
  };
}

/**
 * Product structured data
 * Use this on product pages
 *
 * Note: aggregateRating is only included if ENABLE_STRUCTURED_RATINGS=true
 * to avoid Google penalties for unverified ratings.
 */
export function productSchema(product: Product) {
  const baseSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "url": product.url,
    "image": product.image || `${SITE_URL}/og-image.png`,
    "brand": {
      "@type": "Brand",
      "name": "Landlord Heaven"
    },
    "offers": {
      "@type": "Offer",
      "price": product.price,
      "priceCurrency": product.currency || "GBP",
      "priceValidUntil": product.priceValidUntil || getDefaultPriceValidUntil(),
      "availability": product.availability || "https://schema.org/InStock",
      "url": product.url,
      "seller": {
        "@type": "Organization",
        "name": "Landlord Heaven"
      },
      "shippingDetails": {
        "@type": "OfferShippingDetails",
        "shippingRate": {
          "@type": "MonetaryAmount",
          "value": "0",
          "currency": "GBP"
        },
        "shippingDestination": {
          "@type": "DefinedRegion",
          "addressCountry": "GB"
        },
        "deliveryTime": {
          "@type": "ShippingDeliveryTime",
          "handlingTime": {
            "@type": "QuantitativeValue",
            "minValue": "0",
            "maxValue": "0",
            "unitCode": "MIN"
          },
          "transitTime": {
            "@type": "QuantitativeValue",
            "minValue": "0",
            "maxValue": "0",
            "unitCode": "MIN"
          }
        }
      },
      "hasMerchantReturnPolicy": {
        "@type": "MerchantReturnPolicy",
        "applicableCountry": "GB",
        "returnPolicyCategory": "https://schema.org/MerchantReturnNotPermitted"
      }
    },
  };

  // Only include aggregateRating if explicitly enabled via env var
  // Hardcoded ratings without real review data can trigger Google penalties
  if (ENABLE_STRUCTURED_RATINGS) {
    return {
      ...baseSchema,
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "reviewCount": "247"
      }
    };
  }

  return baseSchema;
}

/**
 * Service subscription product (for HMO Pro)
 */
export function subscriptionProductSchema(product: Product) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "url": product.url,
    "image": product.image || `${SITE_URL}/og-image.png`,
    "brand": {
      "@type": "Brand",
      "name": "Landlord Heaven"
    },
    "offers": {
      "@type": "Offer",
      "price": product.price,
      "priceCurrency": product.currency || "GBP",
      "priceValidUntil": product.priceValidUntil || getDefaultPriceValidUntil(),
      "availability": "https://schema.org/InStock",
      "url": product.url,
      "priceSpecification": {
        "@type": "UnitPriceSpecification",
        "price": product.price,
        "priceCurrency": "GBP",
        "referenceQuantity": {
          "@type": "QuantitativeValue",
          "value": "1",
          "unitCode": "MON"
        }
      },
      "seller": {
        "@type": "Organization",
        "name": "Landlord Heaven"
      },
      "shippingDetails": {
        "@type": "OfferShippingDetails",
        "shippingRate": {
          "@type": "MonetaryAmount",
          "value": "0",
          "currency": "GBP"
        },
        "shippingDestination": {
          "@type": "DefinedRegion",
          "addressCountry": "GB"
        },
        "deliveryTime": {
          "@type": "ShippingDeliveryTime",
          "handlingTime": {
            "@type": "QuantitativeValue",
            "minValue": "0",
            "maxValue": "0",
            "unitCode": "MIN"
          },
          "transitTime": {
            "@type": "QuantitativeValue",
            "minValue": "0",
            "maxValue": "0",
            "unitCode": "MIN"
          }
        }
      },
      "hasMerchantReturnPolicy": {
        "@type": "MerchantReturnPolicy",
        "applicableCountry": "GB",
        "returnPolicyCategory": "https://schema.org/MerchantReturnNotPermitted"
      }
    }
  };
}

/**
 * FAQ Page structured data
 * Use this on help pages
 */
export function faqPageSchema(faqs: FAQItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}

/**
 * WebSite structured data
 * Use this on the homepage only (not globally)
 */
export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Landlord Heaven",
    "url": SITE_URL
    // SearchAction removed - no search page exists
  };
}

/**
 * BreadcrumbList structured data
 * Use this on deep pages to show navigation hierarchy
 */
export function breadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
}

/**
 * LocalBusiness structured data
 * For UK-based business
 * Note: Not used globally - Organization schema is preferred for online businesses
 */
export function localBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Landlord Heaven",
    "image": `${SITE_URL}/logo.png`,
    "url": SITE_URL,
    "email": "support@landlordheaven.co.uk",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "GB"
    },
    // geo field removed - invalid without actual coordinates
    "priceRange": "££"
  };
}

/**
 * SoftwareApplication structured data
 * For the overall platform
 *
 * Price range is derived from PRODUCTS to stay in sync with actual pricing.
 * aggregateRating is only included if ENABLE_STRUCTURED_RATINGS=true.
 */
export function softwareApplicationSchema() {
  // Calculate actual price range from products
  const prices = [
    PRODUCTS.ast_standard.price,  // £9.99 (lowest)
    PRODUCTS.ast_premium.price,   // £14.99
    PRODUCTS.notice_only.price,   // £39.99
    PRODUCTS.complete_pack.price, // £199.99
    PRODUCTS.money_claim.price,   // £199.99 (highest)
  ];
  const lowPrice = Math.min(...prices).toFixed(2);
  const highPrice = Math.max(...prices).toFixed(2);

  const baseSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Landlord Heaven",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "AggregateOffer",
      "lowPrice": lowPrice,
      "highPrice": highPrice,
      "priceCurrency": "GBP"
    },
  };

  // Only include aggregateRating if explicitly enabled via env var
  if (ENABLE_STRUCTURED_RATINGS) {
    return {
      ...baseSchema,
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "ratingCount": "247"
      }
    };
  }

  return baseSchema;
}

/**
 * Utility function to render JSON-LD script tag
 */
export function StructuredData({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
