export interface PreviewCheckoutReturnUrlInput {
  caseId: string;
  product?: string | null;
  addOns?: string[];
}

export function buildPreviewCheckoutReturnUrl({
  caseId,
  product,
  addOns = [],
}: PreviewCheckoutReturnUrlInput): string {
  const params = new URLSearchParams();

  if (product) {
    params.set('product', product);
  }

  if (addOns.length > 0) {
    params.set('add_ons', addOns.join(','));
  }

  const query = params.toString();
  return `/wizard/preview/${caseId}${query ? `?${query}` : ''}`;
}

export function buildSection13CheckoutFixHref({
  caseId,
  product,
}: {
  caseId: string;
  product: string;
}): string {
  const params = new URLSearchParams({
    type: 'rent_increase',
    case_id: caseId,
    product,
    entry: 'steps',
    source: 'checkout_blocked',
  });

  return `/wizard/flow?${params.toString()}`;
}
