export type TenancyJurisdiction = 'england' | 'wales' | 'scotland' | 'northern-ireland';

export type TenancyProductSku = 'ast_standard' | 'ast_premium';

const TENANCY_TIER_QUESTION_ID: Record<TenancyJurisdiction, string> = {
  england: 'ast_tier',
  wales: 'occupation_contract_tier',
  scotland: 'prt_tier',
  'northern-ireland': 'ni_tier',
};

export function getTenancyTierQuestionId(jurisdiction: TenancyJurisdiction): string {
  return TENANCY_TIER_QUESTION_ID[jurisdiction];
}

export function getTenancyTierLabelForSku(
  sku: TenancyProductSku,
  jurisdiction: TenancyJurisdiction
): string {
  if (jurisdiction === 'wales') {
    return sku === 'ast_premium' ? 'Premium Occupation Contract' : 'Standard Occupation Contract';
  }
  if (jurisdiction === 'scotland') {
    return sku === 'ast_premium' ? 'Premium PRT' : 'Standard PRT';
  }
  if (jurisdiction === 'northern-ireland') {
    return sku === 'ast_premium' ? 'Premium NI Private Tenancy' : 'Standard NI Private Tenancy';
  }
  return sku === 'ast_premium' ? 'Premium AST' : 'Standard AST';
}

export function inferTenancySkuFromTierLabel(
  tierLabel?: string | null
): TenancyProductSku | null {
  if (!tierLabel) return null;
  const normalized = tierLabel.toLowerCase();
  if (normalized.includes('premium')) return 'ast_premium';
  if (normalized.includes('standard')) return 'ast_standard';
  return null;
}

export function getTenancyTierLabelFromFacts(facts: Record<string, any>): string | null {
  return (
    facts.product_tier ||
    facts.ast_tier ||
    facts.occupation_contract_tier ||
    facts.prt_tier ||
    facts.ni_tier ||
    null
  );
}

export function inferTenancySkuFromFacts(
  facts: Record<string, any>
): TenancyProductSku | null {
  return inferTenancySkuFromTierLabel(getTenancyTierLabelFromFacts(facts));
}

export function isPremiumTierLabel(tierLabel?: string | null): boolean {
  return inferTenancySkuFromTierLabel(tierLabel) === 'ast_premium';
}
