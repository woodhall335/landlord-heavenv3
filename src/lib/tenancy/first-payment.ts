export type FirstPaymentValidationCode =
  | 'missing'
  | 'invalid'
  | 'non_positive'
  | 'exceeds_rent';

export interface FirstPaymentValidationResult {
  valid: boolean;
  code?: FirstPaymentValidationCode;
  amount?: number;
}

function parseMoney(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value !== 'string' || value.trim() === '') return null;

  const normalized = value.trim().replace(/[£,\s]/g, '');
  if (!/^-?\d+(?:\.\d+)?$/.test(normalized)) return null;

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Validate the customer-entered first payment against the normal rent.
 *
 * Wales and Scotland currently support a full or pro-rata first payment, but
 * do not support an unexplained waiver or a payment covering multiple rental
 * periods. Those scenarios must be handled outside the standard product flow.
 */
export function validateFirstPayment(
  firstPayment: unknown,
  rentAmount: unknown
): FirstPaymentValidationResult {
  if (
    firstPayment === undefined ||
    firstPayment === null ||
    (typeof firstPayment === 'string' && firstPayment.trim() === '')
  ) {
    return { valid: false, code: 'missing' };
  }

  const amount = parseMoney(firstPayment);
  const rent = parseMoney(rentAmount);
  if (amount === null || rent === null) {
    return { valid: false, code: 'invalid' };
  }
  if (amount <= 0) {
    return { valid: false, code: 'non_positive', amount };
  }
  if (rent <= 0 || amount > rent) {
    return { valid: false, code: 'exceeds_rent', amount };
  }

  return { valid: true, amount };
}
