import type { OrderMetadata } from '@/lib/payments/safe-order-metadata';
import { extractOrderMetadata } from '@/lib/payments/safe-order-metadata';
import { getEnglandCanonicalTenancyProduct } from '@/lib/tenancy/england-product-model';

type SupportedFulfillmentStatus =
  | 'pending'
  | 'ready_to_generate'
  | 'processing'
  | 'fulfilled'
  | 'failed'
  | 'requires_action'
  | null;

interface ResolveFulfillmentProductParams {
  productType?: string | null;
  order?: { product_type?: string | null; metadata?: unknown } | null;
  jurisdiction?: string | null;
  caseType?: string | null;
}

interface DeriveVisibleFulfillmentStateParams {
  fulfillmentStatus: SupportedFulfillmentStatus;
  hasFinalDocuments: boolean;
  metadata?: OrderMetadata | null;
  productType?: string | null;
}

function normalizeText(value: string | null | undefined): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function isEnglandTenancyCase(params: ResolveFulfillmentProductParams): boolean {
  return params.jurisdiction === 'england' && params.caseType === 'tenancy_agreement';
}

function toEnglandCanonicalTenancyProduct(value: string | null | undefined): string | null {
  const canonical = getEnglandCanonicalTenancyProduct(value);
  if (canonical) return canonical;

  if (value === 'tenancy_agreement') {
    return 'england_standard_tenancy_agreement';
  }

  return null;
}

export function getRequestedProductTypeFromOrder(order: { metadata?: unknown } | null | undefined): string | null {
  const metadata = extractOrderMetadata(order);
  const requestedProductType = metadata?.requested_product_type;
  return typeof requestedProductType === 'string' ? normalizeText(requestedProductType) : null;
}

export function resolveFulfillmentProductForCase(
  params: ResolveFulfillmentProductParams
): string | null {
  const candidates = [
    getRequestedProductTypeFromOrder(params.order),
    normalizeText(params.productType),
    normalizeText(params.order?.product_type),
  ].filter((value): value is string => Boolean(value));

  if (isEnglandTenancyCase(params)) {
    for (const candidate of candidates) {
      const canonical = toEnglandCanonicalTenancyProduct(candidate);
      if (canonical) return canonical;
    }

    return 'england_standard_tenancy_agreement';
  }

  return candidates[0] || null;
}

export function deriveVisibleFulfillmentState(
  params: DeriveVisibleFulfillmentStateParams
): {
  fulfillmentStatus: SupportedFulfillmentStatus;
  fulfillmentError: string | null;
} {
  const metadata = params.metadata || null;
  let fulfillmentStatus = params.fulfillmentStatus;
  let fulfillmentError =
    typeof metadata?.error === 'string' && metadata.error.trim().length > 0
      ? metadata.error.trim()
      : null;

  const isSection13Product =
    params.productType === 'section13_standard' || params.productType === 'section13_defensive';

  if (
    !params.hasFinalDocuments &&
    !isSection13Product &&
    fulfillmentStatus === 'processing' &&
    metadata?.validation === 'incomplete'
  ) {
    fulfillmentStatus = 'failed';
    fulfillmentError =
      fulfillmentError || 'Document generation did not complete. Please retry generation.';
  }

  return {
    fulfillmentStatus,
    fulfillmentError,
  };
}
