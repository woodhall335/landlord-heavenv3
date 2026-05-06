import { describe, expect, it } from 'vitest';
import {
  buildMoneyClaimEvidenceSummary,
  calculateMoneyClaimEvidenceStrength,
  normalizeMoneyClaimEvidenceItems,
  type MoneyClaimEvidenceItem,
} from '@/lib/money-claim/evidence-checklist';

function item(type: string, label: string, description?: string): MoneyClaimEvidenceItem {
  return { type, label, available: true, description };
}

describe('money claim evidence checklist', () => {
  it('normalizes fallback evidence types for legacy facts', () => {
    const normalized = normalizeMoneyClaimEvidenceItems(undefined, ['rent_schedule']);

    expect(normalized).toEqual([
      {
        type: 'rent_schedule',
        label: 'Rent schedule / arrears ledger',
        available: true,
      },
    ]);
  });

  it('builds cautious evidence summary wording from selected descriptions', () => {
    const summary = buildMoneyClaimEvidenceSummary([
      item('rent_schedule', 'Rent schedule / arrears ledger', 'arrears ledger from January to March'),
      item('bank_statements', 'Bank statements'),
      { type: 'repair_quotes', label: 'Repair quotes / invoices', available: false },
    ]);

    expect(summary).toContain('The claimant says they have / will rely on Rent schedule / arrears ledger: arrears ledger from January to March.');
    expect(summary).toContain('The claimant says they have / will rely on Bank statements.');
    expect(summary).not.toContain('Repair quotes');
  });

  it('scores rent arrears evidence as weak, fair, then strong', () => {
    expect(calculateMoneyClaimEvidenceStrength(['rent_arrears'], []).level).toBe('weak');

    expect(
      calculateMoneyClaimEvidenceStrength(
        ['rent_arrears'],
        [item('tenancy_agreement', 'Tenancy agreement'), item('rent_schedule', 'Rent schedule / arrears ledger')]
      ).level
    ).toBe('fair');

    expect(
      calculateMoneyClaimEvidenceStrength(
        ['rent_arrears'],
        [
          item('tenancy_agreement', 'Tenancy agreement'),
          item('rent_schedule', 'Rent schedule / arrears ledger'),
          item('letter_before_claim', 'Letter Before Claim'),
        ]
      ).level
    ).toBe('strong');
  });

  it('scores damage, cleaning, utilities, and council tax evidence against their own recommended categories', () => {
    expect(
      calculateMoneyClaimEvidenceStrength(
        ['property_damage'],
        [item('tenancy_agreement', 'Tenancy agreement'), item('property_photos_after', 'Check-out photos / damage photos')]
      ).level
    ).toBe('fair');

    expect(
      calculateMoneyClaimEvidenceStrength(
        ['cleaning'],
        [
          item('tenancy_agreement', 'Tenancy agreement'),
          item('property_photos_before', 'Check-in photos / inventory'),
          item('property_photos_after', 'Check-out photos / damage photos'),
          item('cleaning_invoice', 'Cleaning quotes / invoices'),
          item('letter_before_claim', 'Letter Before Claim'),
        ]
      ).level
    ).toBe('strong');

    expect(
      calculateMoneyClaimEvidenceStrength(
        ['unpaid_utilities'],
        [
          item('tenancy_agreement', 'Tenancy agreement'),
          item('utility_bills', 'Utility bills'),
          item('letter_before_claim', 'Letter Before Claim'),
        ]
      ).level
    ).toBe('strong');

    expect(
      calculateMoneyClaimEvidenceStrength(
        ['unpaid_council_tax'],
        [
          item('tenancy_agreement', 'Tenancy agreement'),
          item('council_tax_bills', 'Council tax bills'),
          item('letter_before_claim', 'Letter Before Claim'),
        ]
      ).level
    ).toBe('strong');
  });
});
