import { describe, expect, it } from 'vitest';

import { mapWizardToASTData } from '@/lib/documents/ast-wizard-mapper';
import { validateFirstPayment } from '@/lib/tenancy/first-payment';

const baseSnapshot = Object.freeze({
  jurisdiction: 'scotland',
  rent_amount: 1050,
  tenancy_start_date: '2026-09-01',
  first_payment_date: '2026-09-01',
});

describe('first-payment canonical handling', () => {
  it('defaults to a full first rental period on the normal due date', () => {
    const result = mapWizardToASTData({ ...baseSnapshot } as any, {
      canonicalJurisdiction: 'scotland',
    });
    expect(result.first_payment).toBe('1050.00');
    expect(result.first_payment_date).toBe('2026-09-01');
  });

  it.each([
    ['before the normal due date', '2026-09-10', 700],
    ['after the normal due date', '2026-09-20', 400],
    ['a valid pro-rata period', '2026-09-15', 525],
    ['the full first rental period', '2026-09-01', 1050],
  ])('preserves %s entered in the immutable snapshot', (_label, startDate, amount) => {
    const snapshot = Object.freeze({
      ...baseSnapshot,
      tenancy_start_date: startDate,
      first_payment: amount,
    });
    const before = JSON.stringify(snapshot);
    const result = mapWizardToASTData({ ...snapshot } as any, {
      canonicalJurisdiction: 'scotland',
    });

    expect(result.first_payment).toBe(amount.toFixed(2));
    expect(JSON.stringify(snapshot)).toBe(before);
  });

  it('does not support a zero-value waiver in the standard flow', () => {
    expect(validateFirstPayment(0, 1050)).toEqual({
      valid: false,
      code: 'non_positive',
      amount: 0,
    });
  });

  it.each([-1, '-1.00'])('rejects a negative first payment (%s)', (amount) => {
    expect(validateFirstPayment(amount, 1050).valid).toBe(false);
  });

  it('rejects a first payment greater than the expected rent', () => {
    expect(validateFirstPayment(1050.01, 1050).code).toBe('exceeds_rent');
  });

  it('rejects a missing first payment at the validation boundary', () => {
    expect(validateFirstPayment('', 1050).code).toBe('missing');
  });

  it('regenerates the same payment values from the same frozen snapshot', () => {
    const snapshot = Object.freeze({ ...baseSnapshot, first_payment: 1050 });
    const render = () =>
      mapWizardToASTData({ ...snapshot } as any, {
        canonicalJurisdiction: 'scotland',
      });
    expect(render().first_payment).toBe(render().first_payment);
    expect(render().first_payment_date).toBe(render().first_payment_date);
  });
});
