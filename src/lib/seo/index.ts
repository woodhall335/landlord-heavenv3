/**
 * SEO Utilities
 *
 * Comprehensive SEO helpers for metadata and structured data
 */

export {
  generateMetadata,
  generateMetadataForPageType,
  validateMetadataConfig,
  auditMetadata,
  defaultMetadata,
  CORE_KEYWORDS,
  PRODUCT_KEYWORDS,
} from './metadata';
export type { SEOMetadataConfig, SEOPageType, SEOAuditResult } from './metadata';
export { SITE_ORIGIN, getCanonicalUrl } from './urls';

export {
  organizationSchema,
  productSchema,
  subscriptionProductSchema,
  faqPageSchema,
  websiteSchema,
  breadcrumbSchema,
  localBusinessSchema,
  softwareApplicationSchema,
  howToSchema,
  aboutPageSchema,
  contactPageSchema,
  HOWTO_SCHEMAS,
  StructuredData,
} from './structured-data';

export type { Product, FAQItem, HowToStep, HowToSchemaInput } from './structured-data';

export {
  productLinks,
  toolLinks,
  blogLinks,
  landingPageLinks,
  evictionRelatedLinks,
  section21RelatedLinks,
  section8RelatedLinks,
  rentArrearsRelatedLinks,
  tenancyRelatedLinks,
} from './internal-links';

export {
  submitUrlToIndexNow,
  submitUrlsToIndexNow,
  submitSitemapToIndexNow,
  getKeyPageUrls,
} from './indexnow';
