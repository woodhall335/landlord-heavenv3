import { normalizeJurisdiction } from '@/lib/jurisdiction/normalize';

export type ProductKey =
  | 'notice_only'
  | 'complete_pack'
  | 'money_claim'
  | 'ast_standard'
  | 'ast_premium';

export type Cta = {
  label: string;
  price: number;
  href: string;
  productKey: ProductKey;
};

export interface CtaInput {
  jurisdiction?: string | null;
  validator_key?: string | null;
  validation_summary?: {
    status?: string | null;
    blockers?: Array<{ code: string; message: string }>;
    warnings?: Array<{ code: string; message: string }>;
    upsell?: { product: string; reason: string } | null;
  } | null;
  recommended_products?: ProductKey[];
  caseId: string;
  source: 'validator' | 'ask_heaven';
}

const PRICE_MAP: Record<ProductKey, number> = {
  notice_only: 29.99,
  complete_pack: 149.99,
  money_claim: 179.99,
  ast_standard: 9.99,
  ast_premium: 14.99,
};

const CTA_LABELS: Record<ProductKey, string> = {
  notice_only: 'Start Notice Only',
  complete_pack: 'Start Eviction Pack',
  money_claim: 'Start Money Claim Pack',
  ast_standard: 'Start Standard Tenancy',
  ast_premium: 'Start Premium Tenancy',
};

function buildWizardHref({
  productKey,
  caseId,
  source,
  jurisdiction,
}: {
  productKey: ProductKey;
  caseId: string;
  source: string;
  jurisdiction: string;
}): string {
  if (productKey === 'money_claim') {
    return `/wizard/flow?type=money_claim&jurisdiction=${jurisdiction}&product=money_claim&case_id=${caseId}&source=${source}`;
  }
  if (productKey === 'ast_standard' || productKey === 'ast_premium') {
    return `/wizard/flow?type=tenancy_agreement&jurisdiction=${jurisdiction}&product=${productKey}&case_id=${caseId}&source=${source}`;
  }
  return `/wizard/flow?type=eviction&jurisdiction=${jurisdiction}&product=${productKey}&case_id=${caseId}&source=${source}`;
}

function buildCta(productKey: ProductKey, caseId: string, source: string, jurisdiction: string): Cta {
  return {
    label: CTA_LABELS[productKey],
    price: PRICE_MAP[productKey],
    productKey,
    href: buildWizardHref({ productKey, caseId, source, jurisdiction }),
  };
}

function mapUpsellProduct(product?: string | null): ProductKey | null {
  if (!product) return null;
  switch (product) {
    case 'complete_pack':
    case 'complete_eviction_pack':
    case 'eviction_pack':
      return 'complete_pack';
    case 'money_claim':
    case 'money_claim_pack':
      return 'money_claim';
    case 'ast_standard':
      return 'ast_standard';
    case 'ast_premium':
    case 'tenancy_premium':
    case 'premium_tenancy_agreement':
      return 'ast_premium';
    default:
      return null;
  }
}

function isTenancyValidator(validatorKey?: string | null): boolean {
  return validatorKey === 'tenancy_agreement';
}

function isMoneyClaimValidator(validatorKey?: string | null): boolean {
  return validatorKey === 'money_claim';
}

function isEvictionValidator(validatorKey?: string | null): boolean {
  return (
    validatorKey === 'section_21' ||
    validatorKey === 'section_8' ||
    validatorKey === 'wales_notice' ||
    validatorKey === 'scotland_notice_to_leave'
  );
}

export function getWizardCta(params: CtaInput): { primary: Cta; secondary?: Cta } {
  const jurisdiction = normalizeJurisdiction(params.jurisdiction) ?? 'england';
  const status = params.validation_summary?.status ?? 'warning';
  const upsellProduct = mapUpsellProduct(params.validation_summary?.upsell?.product ?? null);

  if (jurisdiction === 'northern-ireland') {
    const primary = buildCta('ast_premium', params.caseId, params.source, jurisdiction);
    const secondary = buildCta('ast_standard', params.caseId, params.source, jurisdiction);
    return { primary, secondary };
  }

  if (isTenancyValidator(params.validator_key)) {
    const primary = buildCta('ast_premium', params.caseId, params.source, jurisdiction);
    const secondary = buildCta('ast_standard', params.caseId, params.source, jurisdiction);
    return { primary, secondary };
  }

  if (isMoneyClaimValidator(params.validator_key)) {
    const primary = buildCta('money_claim', params.caseId, params.source, jurisdiction);
    return { primary };
  }

  if (upsellProduct) {
    const primary = buildCta(upsellProduct, params.caseId, params.source, jurisdiction);
    if (upsellProduct === 'complete_pack') {
      return {
        primary,
        secondary: buildCta('notice_only', params.caseId, params.source, jurisdiction),
      };
    }
    if (upsellProduct === 'money_claim') {
      return { primary };
    }
    if (upsellProduct === 'ast_premium') {
      return {
        primary,
        secondary: buildCta('ast_standard', params.caseId, params.source, jurisdiction),
      };
    }
  }

  if (isEvictionValidator(params.validator_key)) {
    if (status === 'invalid' || status === 'warning') {
      return {
        primary: buildCta('complete_pack', params.caseId, params.source, jurisdiction),
        secondary: buildCta('notice_only', params.caseId, params.source, jurisdiction),
      };
    }
    return {
      primary: buildCta('notice_only', params.caseId, params.source, jurisdiction),
      secondary: buildCta('complete_pack', params.caseId, params.source, jurisdiction),
    };
  }

  return {
    primary: buildCta('notice_only', params.caseId, params.source, jurisdiction),
    secondary: buildCta('complete_pack', params.caseId, params.source, jurisdiction),
  };
}
