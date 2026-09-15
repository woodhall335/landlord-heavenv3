const MAX_CHECKOUT_RETURN_AGE_MS = 24 * 60 * 60 * 1000;
const ALLOWED_CLOCK_SKEW_MS = 5 * 60 * 1000;

type PurchaseTrackingGate = {
  arrivedFromCheckout: boolean;
  paid: boolean;
  paidAt: string | null | undefined;
  now?: number;
};

/**
 * A paid case can be opened indefinitely, but a GA4 purchase belongs only to
 * the immediate checkout return. This stops old paid cases from replaying the
 * conversion event when a customer starts a new browser session.
 */
export function shouldTrackPurchaseOnCheckoutReturn({
  arrivedFromCheckout,
  paid,
  paidAt,
  now = Date.now(),
}: PurchaseTrackingGate): boolean {
  if (!arrivedFromCheckout || !paid || !paidAt) {
    return false;
  }

  const paidAtTime = Date.parse(paidAt);
  if (!Number.isFinite(paidAtTime)) {
    return false;
  }

  const age = now - paidAtTime;
  return age >= -ALLOWED_CLOCK_SKEW_MS && age <= MAX_CHECKOUT_RETURN_AGE_MS;
}
