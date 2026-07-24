export const SALES002_CONTEXTUAL_OFFER_EXPERIMENT = 'sales002_contextual_offer_copy';

export type Sales002OfferVariant = 'control' | 'treatment';

function stableBucket(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash) % 100;
}

export function assignSales002OfferVariant(identity: string): Sales002OfferVariant {
  // SALES-003B baseline: keep the certified control experience deterministic.
  // The previous localStorage identity was unavailable during SSR, so treatment
  // identities could render different text during hydration. Preserve the
  // bucketing implementation for a future explicitly re-enabled experiment.
  void identity;
  void stableBucket;
  return 'control';
}
