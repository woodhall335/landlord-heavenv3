/**
 * Ask Heaven Internal Linking Utilities
 *
 * Provides configuration-driven internal linking for:
 * - Related questions (Q&A to Q&A)
 * - Related tools/products (Q&A to commercial pages)
 *
 * IMPORTANT: Do not hardcode product URLs.
 * Use the mapping configurations to maintain consistency.
 */

import type {
  AskHeavenPrimaryTopic,
  AskHeavenJurisdiction,
  AskHeavenQuestionListItem,
} from './types';
import {
  isProductAllowedForJurisdiction,
  getAllowedProductsForJurisdiction,
} from './quality-gates';

/**
 * Product/tool link configuration.
 */
export interface ProductLinkConfig {
  /** Product identifier */
  product: string;
  /** Display name */
  name: string;
  /** URL path (without domain) */
  href: string;
  /** Short description */
  description: string;
  /** Price display (optional) */
  price?: string;
  /** Primary CTA text */
  ctaText: string;
}

/**
 * Tool link configuration (free tools).
 */
export interface ToolLinkConfig {
  /** Tool identifier */
  tool: string;
  /** Display name */
  name: string;
  /** URL path */
  href: string;
  /** Short description */
  description: string;
  /** Whether it's a free tool */
  isFree: boolean;
}

/**
 * Mapping from primary topic to relevant products.
 *
 * Used to generate "Related Products" CTAs on question pages.
 * Order matters - first item is primary recommendation.
 */
export const TOPIC_TO_PRODUCTS_MAP: Record<AskHeavenPrimaryTopic, ProductLinkConfig[]> = {
  eviction: [
    {
      product: 'notice_only',
      name: 'Eviction Notice Generator',
      href: '/eviction-notice',
      description: 'Generate Section 21, Section 8, or jurisdiction-specific notices',
      price: '£49.99',
      ctaText: 'Create Notice',
    },
    {
      product: 'complete_pack',
      name: 'Complete Eviction Pack',
      href: '/eviction-pack-england',
      description: 'Full eviction bundle with court forms and guidance',
      price: '£199.99',
      ctaText: 'Get Full Pack',
    },
  ],
  arrears: [
    {
      product: 'money_claim',
      name: 'Money Claim Generator',
      href: '/money-claim',
      description: 'Create court-ready money claim documents for rent arrears',
      price: '£99.99',
      ctaText: 'Start Claim',
    },
    {
      product: 'notice_only',
      name: 'Section 8 Notice (Rent Arrears)',
      href: '/eviction-notice',
      description: 'Serve notice for rent arrears under Ground 8, 10, or 11',
      price: '£49.99',
      ctaText: 'Create Notice',
    },
  ],
  deposit: [
    {
      product: 'tenancy_agreement',
      name: 'Tenancy Agreement',
      href: '/tenancy-agreement',
      description: 'Compliant tenancy agreements with deposit protection clauses',
      price: 'From £14.99',
      ctaText: 'Create Agreement',
    },
  ],
  tenancy: [
    {
      product: 'tenancy_agreement',
      name: 'Tenancy Agreement Generator',
      href: '/tenancy-agreement',
      description: 'Create AST, PRT, or Occupation Contract for any UK jurisdiction',
      price: 'From £14.99',
      ctaText: 'Create Agreement',
    },
  ],
  compliance: [
    {
      product: 'tenancy_agreement',
      name: 'Compliant Tenancy Agreement',
      href: '/tenancy-agreement',
      description: 'Agreements with built-in compliance clauses',
      price: 'From £14.99',
      ctaText: 'Create Agreement',
    },
  ],
  damage_claim: [
    {
      product: 'money_claim',
      name: 'Property Damage Claim',
      href: '/money-claim',
      description: 'Claim for property damage, cleaning costs, or unpaid bills',
      price: '£99.99',
      ctaText: 'Start Claim',
    },
  ],
  notice_periods: [
    {
      product: 'notice_only',
      name: 'Notice Generator',
      href: '/eviction-notice',
      description: 'Generate notices with correct notice periods',
      price: '£49.99',
      ctaText: 'Create Notice',
    },
  ],
  court_process: [
    {
      product: 'complete_pack',
      name: 'Court-Ready Pack',
      href: '/eviction-pack-england',
      description: 'Complete documentation for possession proceedings',
      price: '£199.99',
      ctaText: 'Get Full Pack',
    },
    {
      product: 'money_claim',
      name: 'Money Claim Documents',
      href: '/money-claim',
      description: 'MCOL-ready claim forms and evidence bundles',
      price: '£99.99',
      ctaText: 'Start Claim',
    },
  ],
  tenant_rights: [
    {
      product: 'tenancy_agreement',
      name: 'Fair Tenancy Agreement',
      href: '/tenancy-agreement',
      description: 'Balanced agreements that protect both parties',
      price: 'From £14.99',
      ctaText: 'Create Agreement',
    },
  ],
  landlord_obligations: [
    {
      product: 'tenancy_agreement',
      name: 'Compliant Tenancy Agreement',
      href: '/tenancy-agreement',
      description: 'Meets all landlord obligations and compliance requirements',
      price: 'From £14.99',
      ctaText: 'Create Agreement',
    },
  ],
  other: [],
};

/**
 * Mapping from primary topic to relevant free tools.
 *
 * Used to generate "Related Tools" section on question pages.
 */
export const TOPIC_TO_TOOLS_MAP: Record<AskHeavenPrimaryTopic, ToolLinkConfig[]> = {
  eviction: [
    {
      tool: 'section-21-validator',
      name: 'Section 21 Validity Checker',
      href: '/tools/validators/section-21',
      description: 'Check if your Section 21 notice is valid',
      isFree: true,
    },
    {
      tool: 'section-8-validator',
      name: 'Section 8 Grounds Checker',
      href: '/tools/validators/section-8',
      description: 'Verify Section 8 grounds and notice periods',
      isFree: true,
    },
  ],
  arrears: [
    {
      tool: 'rent-demand-letter',
      name: 'Rent Demand Letter',
      href: '/tools/free-rent-demand-letter',
      description: 'Free rent demand letter template',
      isFree: true,
    },
  ],
  deposit: [],
  tenancy: [],
  compliance: [],
  damage_claim: [],
  notice_periods: [
    {
      tool: 'section-21-validator',
      name: 'Notice Period Calculator',
      href: '/tools/validators/section-21',
      description: 'Calculate correct notice periods',
      isFree: true,
    },
  ],
  court_process: [],
  tenant_rights: [],
  landlord_obligations: [],
  other: [],
};

/**
 * Related questions configuration.
 */
export interface RelatedQuestionsConfig {
  /** Maximum number of related questions to show */
  maxQuestions: number;
  /** Whether to include questions from different jurisdictions */
  crossJurisdiction: boolean;
  /** Heading text */
  heading: string;
}

/**
 * Get configuration for related questions section.
 *
 * @param topic - Primary topic of current question
 * @param jurisdiction - Primary jurisdiction
 * @returns Configuration for related questions component
 */
export function getRelatedQuestionsConfig(
  topic: AskHeavenPrimaryTopic,
  jurisdiction: AskHeavenJurisdiction
): RelatedQuestionsConfig {
  // UK-wide questions can show cross-jurisdiction related content
  const crossJurisdiction = jurisdiction === 'uk-wide';

  return {
    maxQuestions: 5,
    crossJurisdiction,
    heading: 'Related Questions',
  };
}

/**
 * Related tools configuration result.
 */
export interface RelatedToolsConfig {
  /** Products to show (filtered by jurisdiction) */
  products: ProductLinkConfig[];
  /** Free tools to show */
  tools: ToolLinkConfig[];
  /** Whether to show product CTAs */
  showProductCTAs: boolean;
  /** Informational message (e.g., for restricted jurisdictions) */
  infoMessage: string | null;
}

/**
 * Get configuration for related tools/products section.
 *
 * Filters products based on jurisdiction restrictions.
 *
 * @param topic - Primary topic of current question
 * @param jurisdiction - Primary jurisdiction
 * @returns Configuration for related tools component
 */
export function getRelatedToolsConfig(
  topic: AskHeavenPrimaryTopic,
  jurisdiction: AskHeavenJurisdiction
): RelatedToolsConfig {
  const allProducts = TOPIC_TO_PRODUCTS_MAP[topic] || [];
  const tools = TOPIC_TO_TOOLS_MAP[topic] || [];

  // Filter products by jurisdiction
  const allowedProductIds = getAllowedProductsForJurisdiction(jurisdiction);
  const products = allProducts.filter((p) =>
    allowedProductIds.includes(p.product)
  );

  // Generate info message for restricted jurisdictions
  let infoMessage: string | null = null;
  const restrictedProducts = allProducts.filter(
    (p) => !allowedProductIds.includes(p.product)
  );

  if (restrictedProducts.length > 0 && jurisdiction !== 'uk-wide') {
    const jurisdictionName = {
      england: 'England',
      wales: 'Wales',
      scotland: 'Scotland',
      'northern-ireland': 'Northern Ireland',
      'uk-wide': 'UK',
    }[jurisdiction];

    infoMessage = `Some products are not available for ${jurisdictionName}. Contact us for guidance on your specific situation.`;
  }

  return {
    products,
    tools,
    showProductCTAs: products.length > 0,
    infoMessage,
  };
}

/**
 * Build UTM-tagged URL for product links.
 *
 * @param href - Base URL path
 * @param source - UTM source
 * @param topic - Question topic for UTM content
 * @returns Full URL with UTM parameters
 */
export function buildProductUrl(
  href: string,
  source: string = 'ask_heaven_qa',
  topic?: AskHeavenPrimaryTopic
): string {
  const params = new URLSearchParams({
    utm_source: source,
    utm_medium: 'internal_link',
    utm_campaign: 'ask_heaven_qa',
  });

  if (topic) {
    params.set('utm_content', topic);
  }

  return `${href}?${params.toString()}`;
}

/**
 * Filter related questions for display.
 *
 * Prioritizes:
 * 1. Same topic questions
 * 2. Same jurisdiction questions
 * 3. Recently updated questions
 *
 * @param questions - List of potential related questions
 * @param currentTopic - Topic of current question
 * @param currentJurisdiction - Jurisdiction of current question
 * @param maxResults - Maximum results to return
 * @returns Filtered and sorted related questions
 */
export function filterRelatedQuestions(
  questions: AskHeavenQuestionListItem[],
  currentTopic: AskHeavenPrimaryTopic,
  currentJurisdiction: AskHeavenJurisdiction,
  maxResults: number = 5
): AskHeavenQuestionListItem[] {
  // Score and sort questions
  const scored = questions.map((q) => {
    let score = 0;

    // Same topic: +10 points
    if (q.primary_topic === currentTopic) {
      score += 10;
    }

    // Same jurisdiction: +5 points
    if (q.jurisdictions.includes(currentJurisdiction)) {
      score += 5;
    }

    // UK-wide is always relevant: +3 points
    if (q.jurisdictions.includes('uk-wide')) {
      score += 3;
    }

    // Recency bonus (updated within last 30 days): +2 points
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    if (new Date(q.updated_at).getTime() > thirtyDaysAgo) {
      score += 2;
    }

    return { question: q, score };
  });

  // Sort by score descending, then by updated_at descending
  scored.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return (
      new Date(b.question.updated_at).getTime() -
      new Date(a.question.updated_at).getTime()
    );
  });

  return scored.slice(0, maxResults).map((s) => s.question);
}
