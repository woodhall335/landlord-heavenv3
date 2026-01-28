/**
 * SEO-Optimized FAQ Section Component
 *
 * Combines the marketing FAQSection UI with JSON-LD structured data
 * for search engine optimization and rich snippet eligibility.
 *
 * @example
 * ```tsx
 * import { FAQSection } from '@/components/seo/FAQSection';
 * import { section21NoticeTemplateFAQs } from '@/data/faqs';
 *
 * export default function Page() {
 *   return (
 *     <FAQSection
 *       faqs={section21NoticeTemplateFAQs}
 *       title="Section 21 Notice FAQs"
 *     />
 *   );
 * }
 * ```
 */

'use client';

import React from 'react';
import {
  FAQSection as MarketingFAQSection,
  type FAQItem,
  type FAQSectionProps as MarketingFAQSectionProps,
} from '@/components/marketing/FAQSection';
import { faqPageSchema } from '@/lib/seo/structured-data';

export type { FAQItem };

export interface FAQSectionProps extends Omit<MarketingFAQSectionProps, 'faqs'> {
  /** Array of FAQ items with question and answer strings */
  faqs: FAQItem[];
  /** Whether to include JSON-LD structured data (default: true) */
  includeSchema?: boolean;
}

/**
 * SEO-optimized FAQ Section component.
 *
 * Features:
 * - Accordion-style FAQ display with proper accessibility
 * - JSON-LD FAQPage schema for Google rich snippets
 * - Consistent styling with the marketing FAQ component
 *
 * The schema is only included for FAQs with string answers
 * (ReactNode answers are filtered out for schema generation).
 */
export function FAQSection({
  faqs,
  includeSchema = true,
  ...props
}: FAQSectionProps) {
  // Filter FAQs with string answers for schema generation
  const schemaFaqs = faqs.filter(
    (faq): faq is { question: string; answer: string } =>
      typeof faq.answer === 'string'
  );

  // Generate the FAQ schema
  const schema = includeSchema && schemaFaqs.length > 0
    ? faqPageSchema(schemaFaqs)
    : null;

  return (
    <>
      {/* JSON-LD structured data for search engines */}
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      )}

      {/* Visible FAQ section */}
      <MarketingFAQSection faqs={faqs} {...props} />
    </>
  );
}

export default FAQSection;
