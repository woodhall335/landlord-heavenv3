import { describe, expect, it } from 'vitest';

import { wizardFactsToCaseFacts } from '@/lib/case-facts/normalize';
import {
  assertMoneyClaimFinancialsReady,
  calculateMoneyClaimFinancials,
} from '@/lib/documents/money-claim-financials';
import { mapCaseFactsToMoneyClaimCase } from '@/lib/documents/money-claim-wizard-mapper';

describe('money claim section-based financial mapping', () => {
  it('maps nested money_claim totals, line items and interest into shared financials', () => {
    const caseFacts = wizardFactsToCaseFacts({
      product: 'money_claim',
      jurisdiction: 'england',
      landlord_name: 'Alice Landlord',
      tenant_name: 'Tom Tenant',
      property_address: '2 High Street',
      property_postcode: 'E1 2BB',
      rent_amount: 1000,
      rent_frequency: 'monthly',
      money_claim: {
        totals: {
          rent_arrears: 2400,
          damage: 350,
          cleaning: 90,
          utilities: 120,
          other: 45,
          combined_total: 3005,
        },
        damage_items: [
          { category: 'damage', description: 'Broken door', amount: '350.00' },
          { category: 'cleaning', description: 'End of tenancy cleaning', amount: '90' },
          { category: 'utilities', description: 'Unpaid electricity', amount: '120' },
        ],
        other_charges: [{ category: 'other', description: 'Replacement keys', amount: '45' }],
        charge_interest: true,
        interest_start_date: '2026-05-01',
        interest_rate: '8',
      },
    });

    const moneyClaimCase = mapCaseFactsToMoneyClaimCase(caseFacts);
    const financials = calculateMoneyClaimFinancials(moneyClaimCase);

    expect(moneyClaimCase.arrears_total).toBe(2400);
    expect(financials.arrears_total).toBe(2400);
    expect(financials.damages_total).toBe(560);
    expect(financials.other_total).toBe(45);
    expect(financials.total_principal).toBe(3005);
    expect(financials.claim_interest).toBe(true);
    expect(financials.interest_rate).toBe(8);
    expect(financials.daily_interest).toBeGreaterThan(0);
    expect(financials.interest_days).toBeGreaterThan(0);
    expect(financials.interest_to_date).toBeGreaterThan(0);
    expect(financials.total_claim_amount).toBeGreaterThan(3005);
  });

  it('fails loudly when a money claim principal still maps to zero', () => {
    const caseFacts = wizardFactsToCaseFacts({
      product: 'money_claim',
      jurisdiction: 'england',
      landlord_name: 'Alice Landlord',
      tenant_name: 'Tom Tenant',
      property_address: '2 High Street',
      property_postcode: 'E1 2BB',
      money_claim: {
        charge_interest: true,
        interest_start_date: '2026-05-01',
      },
    });

    const moneyClaimCase = mapCaseFactsToMoneyClaimCase(caseFacts);
    const financials = calculateMoneyClaimFinancials(moneyClaimCase);

    expect(financials.total_principal).toBe(0);
    expect(() => assertMoneyClaimFinancialsReady(financials, 'test pack')).toThrow(
      /claim principal is £0/
    );
  });
});
