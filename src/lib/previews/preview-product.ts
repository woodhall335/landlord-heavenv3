export type ResolveWizardPreviewProductInput = {
  lockedProduct?: string | null;
  urlProduct?: string | null;
  section13SelectedPlan?: string | null;
  originalMeta?: Record<string, any> | null;
  factsMeta?: Record<string, any> | null;
  wizardFacts?: Record<string, any> | null;
  caseType?: string | null;
};

function cleanProduct(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

export function resolveWizardPreviewProduct({
  lockedProduct,
  urlProduct,
  section13SelectedPlan,
  originalMeta,
  factsMeta,
  wizardFacts,
  caseType,
}: ResolveWizardPreviewProductInput): string | null {
  const explicitProduct =
    cleanProduct(lockedProduct) ||
    cleanProduct(urlProduct) ||
    cleanProduct(section13SelectedPlan) ||
    cleanProduct(originalMeta?.canonical_product) ||
    cleanProduct(factsMeta?.product) ||
    cleanProduct(originalMeta?.product) ||
    cleanProduct(originalMeta?.legacy_requested_product) ||
    cleanProduct(originalMeta?.original_product);

  if (explicitProduct) {
    return explicitProduct;
  }

  const hasNoticeOnlyMarkers =
    Boolean(wizardFacts?.selected_notice_route) ||
    Boolean(wizardFacts?.eviction_route) ||
    originalMeta?.flow === 'notice_only';

  if (hasNoticeOnlyMarkers && caseType === 'eviction') {
    return 'notice_only';
  }

  if (caseType === 'rent_increase') {
    return 'section13_standard';
  }

  return null;
}

export function hasPreviewProductMismatch(
  lockedProduct: string | null | undefined,
  urlProduct: string | null | undefined
): boolean {
  const locked = cleanProduct(lockedProduct);
  const url = cleanProduct(urlProduct);
  return Boolean(locked && url && locked !== url);
}
