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
  if (process.env.NEXT_PUBLIC_SALES002_CONTEXTUAL_OFFER === 'off') return 'control';
  return stableBucket(`${SALES002_CONTEXTUAL_OFFER_EXPERIMENT}:${identity}`) < 50
    ? 'control'
    : 'treatment';
}

