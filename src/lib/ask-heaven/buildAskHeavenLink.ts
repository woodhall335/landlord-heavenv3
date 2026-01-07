// src/lib/ask-heaven/buildAskHeavenLink.ts
// Utility to build Ask Heaven links with context parameters

export type AskHeavenSource =
  | 'product_page'
  | 'blog'
  | 'validator'
  | 'pricing'
  | 'nav'
  | 'footer'
  | 'popup'
  | 'widget';

export type AskHeavenTopic =
  | 'eviction'
  | 'section_21'
  | 'section_8'
  | 'notice_to_leave'
  | 'money_claim'
  | 'rent_arrears'
  | 'tenancy_agreement'
  | 'ast'
  | 'deposit'
  | 'epc'
  | 'gas_safety'
  | 'eicr'
  | 'general';

export interface AskHeavenLinkParams {
  source?: AskHeavenSource;
  topic?: AskHeavenTopic;
  product?: string;
  jurisdiction?: 'england' | 'wales' | 'scotland' | 'northern-ireland';
  prompt?: string;
  utm_campaign?: string;
  utm_content?: string;
}

/**
 * Build an Ask Heaven link with tracking and context parameters
 *
 * @example
 * buildAskHeavenLink({ source: 'product_page', topic: 'eviction' })
 * // => '/ask-heaven?src=product_page&topic=eviction'
 *
 * @example
 * buildAskHeavenLink({ source: 'blog', prompt: 'How do I serve a Section 21?' })
 * // => '/ask-heaven?src=blog&q=How%20do%20I%20serve%20a%20Section%2021%3F'
 */
export function buildAskHeavenLink(params: AskHeavenLinkParams = {}): string {
  const searchParams = new URLSearchParams();

  if (params.source) {
    searchParams.set('src', params.source);
  }

  if (params.topic) {
    searchParams.set('topic', params.topic);
  }

  if (params.product) {
    searchParams.set('product', params.product);
  }

  if (params.jurisdiction) {
    searchParams.set('jurisdiction', params.jurisdiction);
  }

  if (params.prompt) {
    searchParams.set('q', params.prompt);
  }

  if (params.utm_campaign) {
    searchParams.set('utm_campaign', params.utm_campaign);
  }

  if (params.utm_content) {
    searchParams.set('utm_content', params.utm_content);
  }

  const queryString = searchParams.toString();
  return queryString ? `/ask-heaven?${queryString}` : '/ask-heaven';
}

/**
 * Pre-built links for common use cases
 */
export const ASK_HEAVEN_LINKS = {
  // Product pages
  evictionNotice: buildAskHeavenLink({
    source: 'product_page',
    topic: 'eviction',
    product: 'notice_only',
  }),
  completePack: buildAskHeavenLink({
    source: 'product_page',
    topic: 'eviction',
    product: 'complete_pack',
  }),
  moneyClaim: buildAskHeavenLink({
    source: 'product_page',
    topic: 'money_claim',
    product: 'money_claim',
  }),
  tenancyAgreement: buildAskHeavenLink({
    source: 'product_page',
    topic: 'tenancy_agreement',
    product: 'tenancy_agreement',
  }),

  // Validators
  epcValidator: buildAskHeavenLink({
    source: 'validator',
    topic: 'epc',
  }),
  gasSafetyValidator: buildAskHeavenLink({
    source: 'validator',
    topic: 'gas_safety',
  }),
  eicrValidator: buildAskHeavenLink({
    source: 'validator',
    topic: 'eicr',
  }),
  depositValidator: buildAskHeavenLink({
    source: 'validator',
    topic: 'deposit',
  }),

  // General
  general: buildAskHeavenLink({ source: 'widget' }),
  nav: buildAskHeavenLink({ source: 'nav' }),
  footer: buildAskHeavenLink({ source: 'footer' }),
  popup: buildAskHeavenLink({ source: 'popup' }),
} as const;

/**
 * Build Ask Heaven link for a blog post
 */
export function buildBlogAskHeavenLink(slug: string, topic?: AskHeavenTopic): string {
  return buildAskHeavenLink({
    source: 'blog',
    topic: topic ?? 'general',
    utm_campaign: 'blog',
    utm_content: slug,
  });
}

/**
 * Build Ask Heaven link for a validator page
 */
export function buildValidatorAskHeavenLink(
  validatorType: 'epc' | 'gas_safety' | 'eicr' | 'deposit' | 'general'
): string {
  const topicMap: Record<string, AskHeavenTopic> = {
    epc: 'epc',
    gas_safety: 'gas_safety',
    eicr: 'eicr',
    deposit: 'deposit',
    general: 'general',
  };

  return buildAskHeavenLink({
    source: 'validator',
    topic: topicMap[validatorType] ?? 'general',
  });
}
