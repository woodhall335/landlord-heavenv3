/**
 * JSON-LD Structured Data Helpers
 *
 * Generate schema.org structured data for SEO
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://landlordheaven.co.uk";

export interface Product {
  name: string;
  description: string;
  price: string;
  currency?: string;
  availability?: string;
  url: string;
  image?: string;
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
    "description": "AI-powered legal document generation for UK landlords. Court-ready eviction notices, tenancy agreements, and compliance management.",
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
 */
export function productSchema(product: Product) {
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
      "availability": product.availability || "https://schema.org/InStock",
      "url": product.url,
      "seller": {
        "@type": "Organization",
        "name": "Landlord Heaven"
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "247"
    }
  };
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
 * WebSite structured data with search action
 * Use this on the homepage
 */
export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Landlord Heaven",
    "url": SITE_URL,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${SITE_URL}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
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
 */
export function localBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Landlord Heaven",
    "image": `${SITE_URL}/logo.png`,
    "url": SITE_URL,
    "telephone": "",
    "email": "support@landlordheaven.co.uk",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "GB"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "addressCountry": "GB"
    },
    "priceRange": "££",
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday"
        ],
        "opens": "09:00",
        "closes": "17:30"
      }
    ]
  };
}

/**
 * SoftwareApplication structured data
 * For the overall platform
 */
export function softwareApplicationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Landlord Heaven",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "AggregateOffer",
      "lowPrice": "29.99",
      "highPrice": "99.99",
      "priceCurrency": "GBP"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "247"
    }
  };
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
