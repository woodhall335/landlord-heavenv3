/**
 * JSON-LD Structured Data Helpers
 *
 * Generate schema.org structured data for SEO.
 */

import React from 'react';
import {
  PRODUCTS,
  PRODUCT_PRICE_AMOUNT_STRINGS,
  type ProductSku,
} from '@/lib/pricing/products';
import { getDynamicReviewCount, REVIEW_RATING } from '@/lib/reviews/reviewStats';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://landlordheaven.co.uk";
const DIGITAL_PRODUCT_RETURN_POLICY_URL = '/refunds';

export const DIGITAL_PRODUCT_RETURN_POLICY_ID = toStructuredDataUrl(
  `${DIGITAL_PRODUCT_RETURN_POLICY_URL}#digital-product-return-policy`
);
export const DIGITAL_PRODUCT_SHIPPING_SERVICE_ID = toStructuredDataUrl(
  '/#digital-product-shipping-service'
);

const DIGITAL_PRODUCT_SHIPPING_DESTINATION = {
  '@type': 'DefinedRegion',
  addressCountry: 'GB',
} as const;

const DIGITAL_PRODUCT_SHIPPING_RATE = {
  '@type': 'MonetaryAmount',
  value: '0',
  currency: 'GBP',
} as const;

const DIGITAL_PRODUCT_DELIVERY_TIME = {
  '@type': 'ShippingDeliveryTime',
  handlingTime: {
    '@type': 'QuantitativeValue',
    minValue: 0,
    maxValue: 0,
    unitCode: 'DAY',
  },
  transitTime: {
    '@type': 'QuantitativeValue',
    minValue: 0,
    maxValue: 0,
    unitCode: 'DAY',
  },
} as const;

const LANDLORD_HEAVEN_BRAND = {
  '@type': 'Brand',
  name: 'Landlord Heaven',
} as const;

const LANDLORD_HEAVEN_SELLER = {
  '@type': 'Organization',
  name: 'Landlord Heaven',
} as const;

const STRUCTURED_DATA_PRODUCT_IMAGES: Partial<Record<ProductSku, string>> = {
  notice_only: '/images/notice_bundles.webp',
  complete_pack: '/images/eviction_packs.webp',
  money_claim: '/images/money_claims.webp',
  sc_money_claim: '/images/money_claims.webp',
  ast_standard: '/images/tenancy_agreements.webp',
  ast_premium: '/images/tenancy_agreements.webp',
  england_standard_tenancy_agreement: '/images/tenancy_agreements.webp',
  england_premium_tenancy_agreement: '/images/tenancy_agreements.webp',
  england_student_tenancy_agreement: '/images/tenancy_agreements.webp',
  england_hmo_shared_house_tenancy_agreement: '/images/tenancy_agreements.webp',
  england_lodger_agreement: '/images/tenancy_agreements.webp',
  residential_tenancy_application: '/images/tenancy_agreements.webp',
};

function toStructuredDataUrl(url: string): string {
  const trimmedUrl = url.trim();

  if (!trimmedUrl) {
    return SITE_URL;
  }

  if (/^https?:\/\//i.test(trimmedUrl)) {
    return trimmedUrl;
  }

  if (trimmedUrl === '/') {
    return SITE_URL;
  }

  return `${SITE_URL}${trimmedUrl.startsWith('/') ? trimmedUrl : `/${trimmedUrl}`}`;
}


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

export interface PricingItemListEntry {
  sku: ProductSku;
  name?: string;
  description?: string;
  url: string;
}

export interface FAQItem {
  question: string;
  answer: string | React.ReactNode;
}

export interface ArticleSchemaInput {
  headline: string;
  description: string;
  url: string;
  datePublished?: string;
  dateModified?: string;
  image?: string;
}

export interface MerchantOfferInput {
  price: string;
  url: string;
  currency?: string;
  availability?: string;
  priceValidUntil?: string;
  name?: string;
}

function buildMerchantReturnPolicySchema() {
  return {
    '@type': 'MerchantReturnPolicy',
    '@id': DIGITAL_PRODUCT_RETURN_POLICY_ID,
    url: toStructuredDataUrl(DIGITAL_PRODUCT_RETURN_POLICY_URL),
    applicableCountry: 'GB',
    returnPolicyCategory: 'https://schema.org/MerchantReturnNotPermitted',
  };
}

function buildMerchantShippingServiceSchema() {
  return {
    '@type': 'ShippingService',
    '@id': DIGITAL_PRODUCT_SHIPPING_SERVICE_ID,
    name: 'Digital delivery',
    description: 'Digital products are delivered in your account immediately after purchase.',
    shippingConditions: {
      '@type': 'ShippingConditions',
      shippingDestination: DIGITAL_PRODUCT_SHIPPING_DESTINATION,
      shippingRate: DIGITAL_PRODUCT_SHIPPING_RATE,
    },
  };
}

export function buildMerchantShippingDetails() {
  return {
    '@type': 'OfferShippingDetails',
    shippingRate: DIGITAL_PRODUCT_SHIPPING_RATE,
    shippingDestination: DIGITAL_PRODUCT_SHIPPING_DESTINATION,
    deliveryTime: DIGITAL_PRODUCT_DELIVERY_TIME,
    hasShippingService: {
      '@id': DIGITAL_PRODUCT_SHIPPING_SERVICE_ID,
    },
  };
}

export function buildMerchantReturnPolicyRef() {
  return {
    '@id': DIGITAL_PRODUCT_RETURN_POLICY_ID,
  };
}

export function buildMerchantOffer(input: MerchantOfferInput) {
  return {
    '@type': 'Offer',
    ...(input.name ? { name: input.name } : {}),
    price: input.price,
    priceCurrency: input.currency || 'GBP',
    priceValidUntil: input.priceValidUntil || getDefaultPriceValidUntil(),
    availability: input.availability || 'https://schema.org/InStock',
    url: toStructuredDataUrl(input.url),
    seller: LANDLORD_HEAVEN_SELLER,
    shippingDetails: buildMerchantShippingDetails(),
    hasMerchantReturnPolicy: buildMerchantReturnPolicyRef(),
  };
}

function getStructuredDataProductImage(sku: ProductSku): string {
  return toStructuredDataUrl(STRUCTURED_DATA_PRODUCT_IMAGES[sku] || '/og-image.png');
}

/**
 * Organization structured data
 * Use this on the homepage and footer
 */
export function organizationSchema() {
  const reviewCount = getDynamicReviewCount();

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Landlord Heaven",
    "url": SITE_URL,
    "logo": `${SITE_URL}/logo.png`,
    "description": "UK-wide AI legal case preparation platform generating complete, jurisdiction-specific, compliance-checked eviction bundles ready to file.",
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
    "hasMerchantReturnPolicy": buildMerchantReturnPolicySchema(),
    "hasShippingService": buildMerchantShippingServiceSchema(),
    "areaServed": [
      {
        "@type": "Country",
        "name": "United Kingdom"
      }
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": REVIEW_RATING,
      "reviewCount": reviewCount.toString()
    }
  };
}

/**
 * Product structured data
 * Use this on product pages
 *
 */
export function productSchema(product: Product) {
  const reviewCount = getDynamicReviewCount();

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "url": product.url,
    "image": product.image || `${SITE_URL}/og-image.png`,
    "brand": LANDLORD_HEAVEN_BRAND,
    "offers": buildMerchantOffer({
      price: product.price,
      currency: product.currency,
      priceValidUntil: product.priceValidUntil,
      availability: product.availability,
      url: product.url,
    }),
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": REVIEW_RATING,
      "reviewCount": reviewCount.toString()
    }
  };
}

export function pricingItemListSchema(items: PricingItemListEntry[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items.map((item, index) => {
      const product = PRODUCTS[item.sku];
      return {
        '@type': 'ListItem',
        position: index + 1,
        url: toStructuredDataUrl(item.url),
        item: {
          '@type': 'Product',
          sku: item.sku,
          name: item.name || product.label,
          description: item.description || product.description,
          url: toStructuredDataUrl(item.url),
          image: getStructuredDataProductImage(item.sku),
          brand: LANDLORD_HEAVEN_BRAND,
          offers: buildMerchantOffer({
            price: PRODUCT_PRICE_AMOUNT_STRINGS[item.sku],
            url: item.url,
          }),
        },
      };
    }),
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
    "brand": LANDLORD_HEAVEN_BRAND,
    "offers": {
      ...buildMerchantOffer({
        price: product.price,
        currency: product.currency,
        priceValidUntil: product.priceValidUntil,
        url: product.url,
      }),
      "priceSpecification": {
        "@type": "UnitPriceSpecification",
        "price": product.price,
        "priceCurrency": "GBP",
        "referenceQuantity": {
          "@type": "QuantitativeValue",
          "value": "1",
          "unitCode": "MON"
        }
      }
    }
  };
}

/**
 * FAQ Page structured data
 * Use this on help pages
 */
export function faqPageSchema(faqs: FAQItem[]) {
  const schemaFaqs = faqs.filter(
    (faq): faq is { question: string; answer: string } =>
      typeof faq.answer === 'string'
  );

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": schemaFaqs.map(faq => ({
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
    "url": SITE_URL,
    // SearchAction removed - no search page exists
  };
}

/**
 * Article structured data
 * Use this on guides and long-form content pages
 */
export function articleSchema(input: ArticleSchemaInput) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": input.headline,
    "description": input.description,
    "image": input.image || `${SITE_URL}/og-image.png`,
    "datePublished": input.datePublished,
    "dateModified": input.dateModified || input.datePublished,
    "author": {
      "@type": "Organization",
      "name": "Landlord Heaven"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Landlord Heaven",
      "logo": {
        "@type": "ImageObject",
        "url": `${SITE_URL}/logo.png`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": input.url
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
      "item": toStructuredDataUrl(item.url)
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
 * @deprecated DO NOT USE GLOBALLY - removed from layout.tsx in Jan 2026.
 * This schema caused Google to show wrong snippets on product pages:
 *
 * Only use this on specific tool pages where SoftwareApplication classification
 * is intentionally desired, NOT on product pages.
 *
 * Price range is derived from PRODUCTS to stay in sync with actual pricing.
 */
export function softwareApplicationSchema() {
  // Calculate actual price range from products
  const prices = [
    PRODUCTS.ast_standard.price,  // lowest-priced product
    PRODUCTS.ast_premium.price,
    PRODUCTS.notice_only.price,
    PRODUCTS.money_claim.price,
    PRODUCTS.complete_pack.price, // highest-priced product
  ];
  const lowPrice = Math.min(...prices).toFixed(2);
  const highPrice = Math.max(...prices).toFixed(2);

  const reviewCount = getDynamicReviewCount();

  return {
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
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": REVIEW_RATING,
      "reviewCount": reviewCount.toString()
    }
  };
}

/**
 * HowTo structured data interface
 */
export interface HowToStep {
  name: string;
  text: string;
  url?: string;
  image?: string;
}

export interface HowToSchemaInput {
  name: string;
  description: string;
  url: string;
  totalTime?: string; // ISO 8601 duration, e.g., "PT15M" for 15 minutes
  estimatedCost?: {
    currency: string;
    value: string;
  };
  steps: HowToStep[];
  image?: string;
}

/**
 * HowTo structured data
 *
 * Use this for:
 * - Process pages (MCOL steps, eviction process, etc.)
 * - Tool pages (generators, validators)
 * - Guides with step-by-step instructions
 *
 * IMPORTANT: Keep it conservative:
 * - No fake or estimated times unless you have data
 * - Steps should be genuinely helpful, not marketing
 * - Do not add HowTo to pages that aren't actually step-by-step guides
 */
export function howToSchema(input: HowToSchemaInput) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": input.name,
    "description": input.description,
    "url": input.url,
    "image": input.image || `${SITE_URL}/og-image.png`,
    "step": input.steps.map((step, index) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "name": step.name,
      "text": step.text,
      ...(step.url && { "url": step.url }),
      ...(step.image && { "image": step.image }),
    })),
  };

  if (input.totalTime) {
    schema.totalTime = input.totalTime;
  }

  if (input.estimatedCost) {
    schema.estimatedCost = {
      "@type": "MonetaryAmount",
      "currency": input.estimatedCost.currency,
      "value": input.estimatedCost.value,
    };
  }

  return schema;
}

/**
 * Pre-built HowTo schemas for common processes
 */
export const HOWTO_SCHEMAS = {
  /** Section 21 eviction process (England) */
  section21Process: howToSchema({
    name: 'How to Serve a Section 21 Notice in England',
    description: 'Complete step-by-step guide to serving a valid Section 21 no-fault eviction notice.',
    url: `${SITE_URL}/section-21-notice-template`,
    totalTime: 'PT15M',
    steps: [
      { name: 'Check eligibility requirements', text: 'Verify deposit protection, EPC, gas safety certificate, and How to Rent guide were provided.' },
      { name: 'Generate Form 6A notice', text: 'Create a valid Section 21 notice using the official Form 6A template with correct details.' },
      { name: 'Serve the notice correctly', text: 'Deliver the notice to the tenant by hand, first-class post, or leave at the property.' },
      { name: 'Wait the notice period', text: 'Allow at least 2 months from service (or end of fixed term if later).' },
      { name: 'Apply for possession if needed', text: 'If tenant hasn\'t left, apply to court using accelerated possession procedure (Form N5B).' },
    ],
  }),

  /** MCOL claim process */
  mcolProcess: howToSchema({
    name: 'How to File a Money Claim Online (MCOL)',
    description: 'Step-by-step guide to filing a county court money claim for unpaid rent or damages.',
    url: `${SITE_URL}/money-claim-online-mcol`,
    totalTime: 'PT30M',
    estimatedCost: { currency: 'GBP', value: '35-455' },
    steps: [
      { name: 'Register for MCOL', text: 'Create an account on the government Money Claim Online website.' },
      { name: 'Gather evidence', text: 'Compile tenancy agreement, rent statements, photos of damage, and calculate total owed.' },
      { name: 'Enter defendant details', text: 'Fill in the tenant\'s full name and last known address.' },
      { name: 'Write particulars of claim', text: 'Describe what the claim is for, when the debt arose, and the breakdown.' },
      { name: 'Pay the court fee', text: 'Pay the fee based on claim amount (Â£35 for up to Â£300, up to Â£455 for up to Â£10,000).' },
      { name: 'Submit and wait for response', text: 'Defendant has 14 days to respond. Request default judgment if they don\'t.' },
    ],
  }),

  /** Rent demand letter process */
  rentDemandProcess: howToSchema({
    name: 'How to Write a Rent Demand Letter',
    description: 'Step-by-step guide to writing an effective rent demand letter for arrears.',
    url: `${SITE_URL}/tools/free-rent-demand-letter`,
    totalTime: 'PT10M',
    steps: [
      { name: 'Gather arrears information', text: 'Calculate total rent owed and list missed payment dates.' },
      { name: 'Use formal letter format', text: 'Include your address, tenant\'s address, date, and clear subject line.' },
      { name: 'State the arrears clearly', text: 'List each missed payment with dates and amounts. State the total owed.' },
      { name: 'Set a clear deadline', text: 'Give a reasonable deadline (typically 14 days) for payment.' },
      { name: 'Explain consequences', text: 'State that you may take further action including eviction or court claim.' },
      { name: 'Send and keep proof', text: 'Send by recorded delivery and keep a copy for evidence.' },
    ],
  }),

  /** Section 8 notice process */
  section8Process: howToSchema({
    name: 'How to Serve a Section 8 Notice',
    description: 'Step-by-step guide to serving a grounds-based Section 8 eviction notice.',
    url: `${SITE_URL}/section-8-notice-template`,
    totalTime: 'PT20M',
    steps: [
      { name: 'Identify valid grounds', text: 'Review the 18 Section 8 grounds and identify which apply to your situation.' },
      { name: 'Gather evidence', text: 'Collect rent statements, warning letters, photos, or other supporting evidence.' },
      { name: 'Complete Form 3 notice', text: 'Fill in the official Form 3 with property details and selected grounds.' },
      { name: 'Serve the notice', text: 'Deliver to tenant by hand, post, or leave at property. Note the service date.' },
      { name: 'Wait the notice period', text: 'Notice periods vary: 2 weeks for rent arrears (Ground 8), 2 months for most others.' },
      { name: 'Apply for possession order', text: 'If tenant hasn\'t left, apply to court using Form N5 (not N5B for Section 8).' },
    ],
  }),
};

/**
 * AboutPage structured data
 * Use this on the about page to help search engines understand the page purpose
 */
export function aboutPageSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": "About Landlord Heaven",
    "description": "Learn about Landlord Heaven, the AI-powered platform helping UK landlords create legally compliant documents.",
    "url": `${SITE_URL}/about`,
    "mainEntity": organizationSchema(),
  };
}

/**
 * ContactPage structured data
 * Use this on the contact page to help search engines understand contact options
 */
export function contactPageSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "Contact Landlord Heaven",
    "description": "Get in touch with Landlord Heaven for support with eviction notices, tenancy agreements, and money claims.",
    "url": `${SITE_URL}/contact`,
    "mainEntity": {
      "@type": "Organization",
      "name": "Landlord Heaven",
      "url": SITE_URL,
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer support",
        "email": "support@landlordheaven.co.uk",
        "url": `${SITE_URL}/contact`,
        "availableLanguage": "English",
      },
    },
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



