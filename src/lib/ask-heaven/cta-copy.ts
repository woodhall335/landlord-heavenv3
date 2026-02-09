import { SEO_PRICES } from '@/lib/pricing/products';
import type { WizardJurisdiction, WizardProduct } from '@/lib/wizard/buildWizardLink';
import type { Topic } from '@/lib/ask-heaven/topic-detection';

export type AskHeavenCtaIntent =
  | 'eviction'
  | 'notice_validity'
  | 'court_process'
  | 'arrears_notice'
  | 'arrears_claim'
  | 'tenancy';

export interface AskHeavenCtaCopy {
  product: WizardProduct;
  title: string;
  description: string;
  buttonText: string;
  displayPrice: string;
  priceNote?: string;
}

type AskHeavenCtaKey = `${WizardProduct}:${WizardJurisdiction}:${AskHeavenCtaIntent}`;

const TENANCY_PRICE_NOTE = `Standard ${SEO_PRICES.tenancyStandard.display} · Premium ${SEO_PRICES.tenancyPremium.display}`;
const NOTICE_PRICE = SEO_PRICES.evictionNotice.display;
const MONEY_CLAIM_PRICE = SEO_PRICES.moneyClaim.display;
const COMPLETE_PACK_PRICE = SEO_PRICES.evictionBundle.display;

const ASK_HEAVEN_CTA_COPY: Record<AskHeavenCtaKey, AskHeavenCtaCopy> = {
  'notice_only:england:eviction': {
    product: 'notice_only',
    title: 'Generate a Section 21 or Section 8 Notice',
    description: `Create a compliant Section 21 or Section 8 notice for England (${NOTICE_PRICE}).`,
    buttonText: 'Start Section 21/8 Wizard',
    displayPrice: NOTICE_PRICE,
  },
  'notice_only:england:arrears_notice': {
    product: 'notice_only',
    title: 'Serve a Section 8 Notice for rent arrears',
    description: `Generate a Section 8 notice grounded on rent arrears (${NOTICE_PRICE}).`,
    buttonText: 'Start Section 8 Wizard',
    displayPrice: NOTICE_PRICE,
  },
  'notice_only:england:notice_validity': {
    product: 'notice_only',
    title: 'Check your notice is valid',
    description: 'Review Section 21 or Section 8 requirements before serving notice.',
    buttonText: 'Check notice validity',
    displayPrice: NOTICE_PRICE,
  },
  'notice_only:wales:eviction': {
    product: 'notice_only',
    title: 'Generate a Section 173 Notice',
    description: `Create a Renting Homes Act compliant Section 173 notice (${NOTICE_PRICE}).`,
    buttonText: 'Start Section 173 Wizard',
    displayPrice: NOTICE_PRICE,
  },
  'notice_only:wales:arrears_notice': {
    product: 'notice_only',
    title: 'Serve a Section 173 Notice for rent arrears',
    description: `Generate a Section 173 notice for rent arrears (${NOTICE_PRICE}).`,
    buttonText: 'Start Section 173 Wizard',
    displayPrice: NOTICE_PRICE,
  },
  'notice_only:wales:notice_validity': {
    product: 'notice_only',
    title: 'Check your Section 173 is valid',
    description: 'Review Section 173 requirements before serving notice.',
    buttonText: 'Check Section 173 validity',
    displayPrice: NOTICE_PRICE,
  },
  'notice_only:scotland:eviction': {
    product: 'notice_only',
    title: 'Generate a Notice to Leave',
    description: `Create a Notice to Leave for PRT tenancies in Scotland (${NOTICE_PRICE}).`,
    buttonText: 'Start Notice to Leave Wizard',
    displayPrice: NOTICE_PRICE,
  },
  'notice_only:scotland:arrears_notice': {
    product: 'notice_only',
    title: 'Serve a Notice to Leave for rent arrears',
    description: `Generate a Notice to Leave grounded on rent arrears (${NOTICE_PRICE}).`,
    buttonText: 'Start Notice to Leave Wizard',
    displayPrice: NOTICE_PRICE,
  },
  'notice_only:scotland:notice_validity': {
    product: 'notice_only',
    title: 'Check your Notice to Leave is valid',
    description: 'Review Notice to Leave requirements before serving notice.',
    buttonText: 'Check Notice to Leave validity',
    displayPrice: NOTICE_PRICE,
  },
  'complete_pack:england:court_process': {
    product: 'complete_pack',
    title: 'Get the Complete Eviction Pack',
    description: `Court-ready bundle with notice, possession forms, and guidance (${COMPLETE_PACK_PRICE}).`,
    buttonText: 'Start court-ready pack',
    displayPrice: COMPLETE_PACK_PRICE,
    priceNote: 'England only',
  },
  'complete_pack:england:eviction': {
    product: 'complete_pack',
    title: 'Get the Complete Eviction Pack',
    description: `Full bundle with notice, court forms, and guidance (${COMPLETE_PACK_PRICE}).`,
    buttonText: 'Get the complete pack',
    displayPrice: COMPLETE_PACK_PRICE,
    priceNote: 'England only',
  },
  'money_claim:england:arrears_claim': {
    product: 'money_claim',
    title: 'Start a Money Claim',
    description: `Recover unpaid rent and tenant debts through the courts (${MONEY_CLAIM_PRICE}).`,
    buttonText: 'Start money claim',
    displayPrice: MONEY_CLAIM_PRICE,
    priceNote: 'England only',
  },
  'tenancy_agreement:england:tenancy': {
    product: 'tenancy_agreement',
    title: 'Create an AST Tenancy Agreement',
    description: `Generate a compliant Assured Shorthold Tenancy (${SEO_PRICES.tenancyStandard.display}).`,
    buttonText: 'Start AST Wizard',
    displayPrice: `from ${SEO_PRICES.tenancyStandard.display}`,
    priceNote: TENANCY_PRICE_NOTE,
  },
  'tenancy_agreement:wales:tenancy': {
    product: 'tenancy_agreement',
    title: 'Create an Occupation Contract',
    description: `Generate a Renting Homes Act compliant occupation contract (${SEO_PRICES.tenancyStandard.display}).`,
    buttonText: 'Start Contract Wizard',
    displayPrice: `from ${SEO_PRICES.tenancyStandard.display}`,
    priceNote: TENANCY_PRICE_NOTE,
  },
  'tenancy_agreement:scotland:tenancy': {
    product: 'tenancy_agreement',
    title: 'Create a PRT Agreement',
    description: `Generate a compliant Private Residential Tenancy (${SEO_PRICES.tenancyStandard.display}).`,
    buttonText: 'Start PRT Wizard',
    displayPrice: `from ${SEO_PRICES.tenancyStandard.display}`,
    priceNote: TENANCY_PRICE_NOTE,
  },
  'tenancy_agreement:northern-ireland:tenancy': {
    product: 'tenancy_agreement',
    title: 'Create a Tenancy Agreement',
    description: `Generate a compliant tenancy agreement for Northern Ireland (${SEO_PRICES.tenancyStandard.display}).`,
    buttonText: 'Start Agreement Wizard',
    displayPrice: `from ${SEO_PRICES.tenancyStandard.display}`,
    priceNote: TENANCY_PRICE_NOTE,
  },
};

const COURT_PROCESS_PATTERN =
  /court|possession|hearing|warrant|bailiff|enforcement|order|n5b|n5|n119|n55|n325|high court|writ/i;
const NOTICE_VALIDITY_PATTERN =
  /valid|validity|check|compliant|correct|serve properly|served correctly|is my notice/i;
const ARREARS_NOTICE_PATTERN =
  /section 8|arrears notice|serve notice|evict|possession|terminate/i;

export function detectAskHeavenCtaIntent(
  topic: Topic | null,
  question?: string
): AskHeavenCtaIntent | null {
  if (!topic) return null;
  const normalizedQuestion = question?.toLowerCase() ?? '';

  if (topic === 'tenancy') return 'tenancy';

  if (topic === 'eviction') {
    if (COURT_PROCESS_PATTERN.test(normalizedQuestion)) {
      return 'court_process';
    }
    if (NOTICE_VALIDITY_PATTERN.test(normalizedQuestion)) {
      return 'notice_validity';
    }
    return 'eviction';
  }

  if (topic === 'arrears' || topic === 'damage_claim') {
    if (ARREARS_NOTICE_PATTERN.test(normalizedQuestion)) {
      return 'arrears_notice';
    }
    return 'arrears_claim';
  }

  return 'eviction';
}

export function getAskHeavenCtaCopy({
  product,
  jurisdiction,
  intent,
}: {
  product: WizardProduct;
  jurisdiction: WizardJurisdiction;
  intent: AskHeavenCtaIntent;
}): AskHeavenCtaCopy | null {
  const normalizedProduct = normalizeProductForCta(product);
  const key = `${normalizedProduct}:${jurisdiction}:${intent}` as AskHeavenCtaKey;
  if (ASK_HEAVEN_CTA_COPY[key]) {
    return ASK_HEAVEN_CTA_COPY[key];
  }

  const fallbackKey = `${normalizedProduct}:${jurisdiction}:${getDefaultIntentForProduct(normalizedProduct)}` as AskHeavenCtaKey;
  return ASK_HEAVEN_CTA_COPY[fallbackKey] ?? null;
}

export function getDefaultIntentForProduct(product: WizardProduct): AskHeavenCtaIntent {
  switch (product) {
    case 'notice_only':
      return 'eviction';
    case 'complete_pack':
      return 'eviction';
    case 'money_claim':
      return 'arrears_claim';
    case 'tenancy_agreement':
    case 'ast_standard':
    case 'ast_premium':
      return 'tenancy';
    default:
      return 'eviction';
  }
}

function normalizeProductForCta(product: WizardProduct): WizardProduct {
  if (product === 'ast_standard' || product === 'ast_premium') {
    return 'tenancy_agreement';
  }
  return product;
}
