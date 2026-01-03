/**
 * SEO Utilities
 *
 * Comprehensive SEO helpers for metadata and structured data
 */

export { generateMetadata, defaultMetadata } from './metadata';
export type { SEOMetadataConfig } from './metadata';

export {
  organizationSchema,
  productSchema,
  subscriptionProductSchema,
  faqPageSchema,
  websiteSchema,
  breadcrumbSchema,
  localBusinessSchema,
  softwareApplicationSchema,
  StructuredData,
} from './structured-data';

export type { Product, FAQItem } from './structured-data';

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
